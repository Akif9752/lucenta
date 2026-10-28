import Foundation
import WebKit

/// Spiegel des Bestands (alle `lucenta_*`-Eintraege aus localStorage) als Datei auf dem Geraet.
/// iOS darf den Speicher der WebView leeren; Application Support bleibt. Nichts verlaesst das Geraet.
enum LucentaBestand {

    static let empfaengerName = "lucentaBestand"

    private static var datei: URL? {
        guard let ordner = try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask,
                                                        appropriateFor: nil, create: true) else { return nil }
        return ordner.appendingPathComponent("lucenta-bestand.json")
    }

    /// Nur ein Woerterbuch aus Zeichenketten mit `lucenta_`-Schluesseln wird angenommen.
    static func pruefen(_ objekt: Any?) -> [String: String]? {
        guard let roh = objekt as? [String: Any] else { return nil }
        var sauber: [String: String] = [:]
        for (k, v) in roh where k.hasPrefix("lucenta_") {
            guard let s = v as? String else { continue }
            sauber[k] = s
        }
        return sauber
    }

    static func lesen() -> [String: String]? {
        guard let datei, let daten = try? Data(contentsOf: datei) else { return nil }
        return pruefen(try? JSONSerialization.jsonObject(with: daten))
    }

    private static let kern = ["lucenta_result", "lucenta_history", "lucenta_state"]

    /// Ein Stand ohne Ergebnis, Verlauf und Tagesform ueberschreibt keinen mit: Er kaeme eher aus einem
    /// gescheiterten Zurueckholen als aus Absicht. Zurueckgeholt wird ohnehin nur in einen leeren Speicher.
    static func schreiben(_ bestand: [String: String]) {
        if !kern.contains(where: { bestand[$0] != nil }),
           let alt = lesen(), kern.contains(where: { alt[$0] != nil }) { return }
        guard let datei, !bestand.isEmpty,
              let daten = try? JSONSerialization.data(withJSONObject: bestand, options: [.sortedKeys]) else { return }
        try? daten.write(to: datei, options: [.atomic, .completeFileProtectionUntilFirstUserAuthentication])
    }

    /// Laeuft vor jedem Skript der Seite, wirkt aber nur beim ersten Laden je Start (sessionStorage) —
    /// sonst holte ein Neuladen nach absichtlichem Loeschen den alten Stand zurueck.
    static func wiederherstellenSkript() -> WKUserScript? {
        guard let bestand = lesen(), !bestand.isEmpty,
              let daten = try? JSONSerialization.data(withJSONObject: bestand),
              let json = String(data: daten, encoding: .utf8) else { return nil }
        let quelle = """
        (function(){ try{
          if (sessionStorage.getItem('lucenta_bestand_geprueft')) return;
          sessionStorage.setItem('lucenta_bestand_geprueft', '1');
          for (var i = 0; i < localStorage.length; i++){ if (/^lucenta_/.test(localStorage.key(i))) return; }
          var d = \(json), n = 0;
          Object.keys(d).forEach(function(k){ if (/^lucenta_/.test(k)){ localStorage.setItem(k, d[k]); n++; } });
          if (n) window.__lucentaWiederhergestellt = n;
        }catch(e){} })();
        """
        return WKUserScript(source: quelle, injectionTime: .atDocumentStart, forMainFrameOnly: true)
    }
}

/// Nimmt den Bestand der Seite an. Eigene Klasse, damit der Controller nicht im Kreis gehalten wird.
final class BestandEmpfaenger: NSObject, WKScriptMessageHandler {
    private let schlange = DispatchQueue(label: "lucenta.bestand", qos: .utility)

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard let bestand = LucentaBestand.pruefen(message.body) else { return }
        schlange.async { LucentaBestand.schreiben(bestand) }
    }
}

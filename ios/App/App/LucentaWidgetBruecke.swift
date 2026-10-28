import Foundation
import WebKit
import WidgetKit

/// App-Seite des Tagesform-Widgets und der Kurzbefehle. Gruppe, Dateinamen und Format wie in
/// `LucentaWidget/TagesformAblage.swift` — beide Seiten zusammen aendern.
///
/// Die Seite meldet ueber `lucentaWidget`:
///   {stand: {tag, eintraege, erinnerungAlle}}  -> Datei fuer das Widget, Widget neu zeichnen
///   {abholen: true}                           -> Eintraege an `lucentaWidgetEingang([...])`, ggf. Tagesform oeffnen
///   {verarbeitet: [ts, …]}                    -> diese aus dem Eingang streichen
final class WidgetEmpfaenger: NSObject, WKScriptMessageHandler {
    static let name = "lucentaWidget"
    nonisolated static let neuerEintrag = Notification.Name("lucentaNeuerEintrag")
    nonisolated private static let gruppe = "group.app.lucenta.ios"
    nonisolated private static let oeffnenSchluessel = "lucenta_kurzbefehl_oeffnen"

    private weak var ansicht: WKWebView?
    init(ansicht: WKWebView?) {
        self.ansicht = ansicht
        super.init()
        NotificationCenter.default.addObserver(self, selector: #selector(anstossen), name: Self.neuerEintrag, object: nil)
    }

    /// Ohne App Group (Personal Team) der eigene Ordner: Kurzbefehle laufen in der App und kommen so trotzdem an.
    nonisolated private static func url(_ datei: String) -> URL? {
        let ordner = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: gruppe)
            ?? (try? FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true))
        return ordner?.appendingPathComponent(datei)
    }

    nonisolated private static func eingang() -> [[String: Any]] {
        guard let u = url("widget-eingang.json"), let d = try? Data(contentsOf: u),
              let l = try? JSONSerialization.jsonObject(with: d) as? [[String: Any]] else { return [] }
        return l
    }

    nonisolated private static func eingangSchreiben(_ liste: [[String: Any]]) {
        guard let u = url("widget-eingang.json") else { return }
        if liste.isEmpty { try? FileManager.default.removeItem(at: u); return }
        if let d = try? JSONSerialization.data(withJSONObject: liste) { try? d.write(to: u, options: .atomic) }
    }

    nonisolated static func eintragen(energy: Int, valence: Int) {
        var l = eingang()
        l.append(["ts": (Date().timeIntervalSince1970 * 1000).rounded(), "energy": energy, "valence": valence])
        eingangSchreiben(Array(l.suffix(30)))
        WidgetCenter.shared.reloadAllTimelines()
    }

    nonisolated static func oeffnenAnfragen() { UserDefaults.standard.set(true, forKey: oeffnenSchluessel) }

    /// Laeuft die Seite schon, holt sie sofort ab; sonst tut sie es beim Start von selbst.
    @objc private func anstossen() {
        DispatchQueue.main.async {
            guard let w = self.ansicht, w.url != nil, !w.isLoading else { return }
            w.evaluateJavaScript("window.lucentaWidgetAbholen && window.lucentaWidgetAbholen();")
        }
    }

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any] else { return }
        if let stand = body["stand"] as? [String: Any],
           let d = try? JSONSerialization.data(withJSONObject: stand), let u = Self.url("widget-stand.json") {
            try? d.write(to: u, options: .atomic)
            WidgetCenter.shared.reloadAllTimelines()
        }
        if let erledigt = body["verarbeitet"] as? [Double] {
            Self.eingangSchreiben(Self.eingang().filter { !erledigt.contains(($0["ts"] as? Double) ?? -1) })
        }
        if body["abholen"] != nil {
            let l = Self.eingang()
            if !l.isEmpty, let d = try? JSONSerialization.data(withJSONObject: l), let json = String(data: d, encoding: .utf8) {
                ansicht?.evaluateJavaScript("window.lucentaWidgetEingang && window.lucentaWidgetEingang(\(json));")
            }
            if UserDefaults.standard.bool(forKey: Self.oeffnenSchluessel) {
                UserDefaults.standard.removeObject(forKey: Self.oeffnenSchluessel)
                ansicht?.evaluateJavaScript("window.lucentaWidgetLink && window.lucentaWidgetLink('lucenta://tagesform');")
            }
        }
    }
}

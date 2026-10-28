import Foundation

/// Gemeinsamer Ordner von App und Widget. Dateinamen und Format stehen gleichlautend in
/// `App/LucentaWidgetBruecke.swift` — beide Seiten muessen sie zusammen aendern.
enum TagesformAblage {
    static let gruppe = "group.app.lucenta.ios"
    static let standDatei = "widget-stand.json"      // schreibt die App
    static let eingangDatei = "widget-eingang.json"  // schreibt das Widget, leert die App
    static let entwurfDatei = "widget-entwurf.json"  // nur das Widget: halber Eintrag

    struct Werte: Codable, Equatable {
        var energy: Int
        var valence: Int
    }
    struct Stand: Codable {
        var tag: String
        var eintraege: [String: Werte]
        var erinnerungAlle: Bool?
    }
    struct Eingang: Codable {
        var ts: Double
        var energy: Int
        var valence: Int
    }
    struct Entwurf: Codable {
        var tag: String
        var abschnitt: String
        var energy: Int?
        var valence: Int?
    }

    static let abschnitte = ["morgen", "mittag", "abend"]

    /// Wie `zeitabschnitt()` in 03-speicherung.js: morgens < 12, mittags < 18, sonst abends.
    static func abschnitt(_ datum: Date = .now) -> String {
        let h = Calendar.current.component(.hour, from: datum)
        return h < 12 ? "morgen" : (h < 18 ? "mittag" : "abend")
    }

    static func tag(_ datum: Date = .now) -> String {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: datum)
        return String(format: "%04d-%02d-%02d", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }

    private static func url(_ name: String) -> URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: gruppe)?
            .appendingPathComponent(name)
    }
    private static func lesen<T: Decodable>(_ name: String, als: T.Type) -> T? {
        guard let u = url(name), let d = try? Data(contentsOf: u) else { return nil }
        return try? JSONDecoder().decode(T.self, from: d)
    }
    private static func schreiben<T: Encodable>(_ wert: T?, _ name: String) {
        guard let u = url(name) else { return }
        guard let wert, let d = try? JSONEncoder().encode(wert) else {
            try? FileManager.default.removeItem(at: u); return
        }
        try? d.write(to: u, options: .atomic)
    }

    static var verfuegbar: Bool { url(standDatei) != nil }

    /// Heutige Eintraege je Tageszeit: der Stand der App, darueber was das Widget seither eingetragen hat.
    static func heute(_ jetzt: Date = .now) -> [String: Werte] {
        let t = tag(jetzt)
        var r: [String: Werte] = [:]
        if let s = lesen(standDatei, als: Stand.self), s.tag == t { r = s.eintraege }
        for e in eingang() {
            let d = Date(timeIntervalSince1970: e.ts / 1000)
            if tag(d) == t { r[abschnitt(d)] = Werte(energy: e.energy, valence: e.valence) }
        }
        return r
    }

    static func erinnerungAlle() -> Bool { lesen(standDatei, als: Stand.self)?.erinnerungAlle ?? false }

    static func eingang() -> [Eingang] { lesen(eingangDatei, als: [Eingang].self) ?? [] }

    /// Nur ein Entwurf fuer den laufenden Abschnitt zaehlt; ein alter gilt als leer.
    static func entwurf(_ jetzt: Date = .now) -> Entwurf {
        let leer = Entwurf(tag: tag(jetzt), abschnitt: abschnitt(jetzt))
        guard let e = lesen(entwurfDatei, als: Entwurf.self),
              e.tag == leer.tag, e.abschnitt == leer.abschnitt else { return leer }
        return e
    }

    /// Setzt einen der beiden Werte. Stehen beide, wird der Eintrag abgelegt und der Entwurf geleert.
    static func setzen(energie: Bool, wert: Int, jetzt: Date = .now) {
        guard (1...5).contains(wert) else { return }
        var e = entwurf(jetzt)
        if energie { e.energy = wert } else { e.valence = wert }
        if let en = e.energy, let va = e.valence {
            var liste = eingang()
            liste.append(Eingang(ts: (jetzt.timeIntervalSince1970 * 1000).rounded(), energy: en, valence: va))
            schreiben(Array(liste.suffix(30)), eingangDatei)
            schreiben(Entwurf?.none, entwurfDatei)
        } else {
            schreiben(e, entwurfDatei)
        }
    }
}

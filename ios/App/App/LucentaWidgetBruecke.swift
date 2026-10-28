import Foundation
import WebKit
import WidgetKit

/// App-Seite des Tagesform-Widgets. Gruppe, Dateinamen und Format wie in
/// `LucentaWidget/TagesformAblage.swift` — beide Seiten zusammen aendern.
///
/// Die Seite meldet ueber `lucentaWidget`:
///   {stand: {tag, eintraege, erinnerungAlle}}  -> Datei fuer das Widget, Widget neu zeichnen
///   {abholen: true}                           -> Eintraege aus dem Widget an `lucentaWidgetEingang([...])`
///   {verarbeitet: [ts, …]}                    -> diese aus dem Eingang streichen
final class WidgetEmpfaenger: NSObject, WKScriptMessageHandler {
    static let name = "lucentaWidget"
    private static let gruppe = "group.app.lucenta.ios"

    private weak var ansicht: WKWebView?
    init(ansicht: WKWebView?) { self.ansicht = ansicht }

    private static func url(_ datei: String) -> URL? {
        FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: gruppe)?
            .appendingPathComponent(datei)
    }

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any] else { return }
        if let stand = body["stand"] as? [String: Any],
           let d = try? JSONSerialization.data(withJSONObject: stand), let u = Self.url("widget-stand.json") {
            try? d.write(to: u, options: .atomic)
            WidgetCenter.shared.reloadAllTimelines()
        }
        if let erledigt = body["verarbeitet"] as? [Double], let u = Self.url("widget-eingang.json"),
           let d = try? Data(contentsOf: u), let liste = try? JSONSerialization.jsonObject(with: d) as? [[String: Any]] {
            let rest = liste.filter { !erledigt.contains(($0["ts"] as? Double) ?? -1) }
            if rest.isEmpty { try? FileManager.default.removeItem(at: u) }
            else if let neu = try? JSONSerialization.data(withJSONObject: rest) { try? neu.write(to: u, options: .atomic) }
        }
        if body["abholen"] != nil, let u = Self.url("widget-eingang.json"),
           let d = try? Data(contentsOf: u), let json = String(data: d, encoding: .utf8),
           (try? JSONSerialization.jsonObject(with: d)) is [Any] {
            ansicht?.evaluateJavaScript("window.lucentaWidgetEingang && window.lucentaWidgetEingang(\(json));")
        }
    }
}

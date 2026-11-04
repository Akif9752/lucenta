import UIKit
import Capacitor

// Apples eigene Tab-Leiste ueber der WebView (Entscheidung des Inhabers): echtes Liquid Glass, Lupe, Haptik und VoiceOver
// kommen vom System. Die Seite liefert Titel und meldet aktiven Reiter und Sichtbarkeit; ein Tipp geht als "gewaehlt" zurueck.
// Die Kennungen stehen absichtlich auch in src/js/14-tab-leiste.js (TAB_REITER).
public class LucentaTabLeistePlugin: CAPInstancePlugin, CAPBridgedPlugin, UITabBarDelegate {
    public let identifier = "LucentaTabLeistePlugin"
    public let jsName = "Tabs"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "einrichten", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setzen", returnType: CAPPluginReturnPromise)
    ]

    private static let symbole: [String: String] = [
        "landing": "house", "state": "sun.max", "understand": "book", "freunde": "person.2", "profile": "person.crop.circle"
    ]
    // --accent der App (hell/dunkel), damit der aktive Reiter dieselbe Farbe traegt wie die Seite.
    private static let akzent = UIColor { tc in
        tc.userInterfaceStyle == .dark
            ? UIColor(red: 0x5C/255.0, green: 0xB4/255.0, blue: 0xAD/255.0, alpha: 1)
            : UIColor(red: 0x28/255.0, green: 0x5F/255.0, blue: 0x5B/255.0, alpha: 1)
    }

    private var leiste: UITabBar?
    private var kennungen: [String] = []

    @objc func einrichten(_ call: CAPPluginCall) {
        let reiter = call.getArray("reiter", JSObject.self) ?? []
        let aktiv = call.getString("aktiv") ?? ""
        let sichtbar = call.getBool("sichtbar") ?? true
        DispatchQueue.main.async {
            guard let ansicht = self.bridge?.viewController?.view else { call.reject("keine Ansicht"); return }
            let leiste = self.leiste ?? self.neueLeiste(in: ansicht)
            self.kennungen = []
            var eintraege: [UITabBarItem] = []
            for r in reiter {
                guard let id = r["id"] as? String, let symbol = Self.symbole[id] else { continue }
                let titel = r["titel"] as? String ?? ""
                let eintrag = UITabBarItem(title: titel, image: UIImage(systemName: symbol), selectedImage: UIImage(systemName: symbol + ".fill"))
                eintrag.tag = self.kennungen.count
                eintraege.append(eintrag)
                self.kennungen.append(id)
            }
            leiste.setItems(eintraege, animated: false)
            self.anwenden(aktiv: aktiv, sichtbar: sichtbar, animiert: false)
            call.resolve(["hoehe": leiste.frame.height])
        }
    }

    @objc func setzen(_ call: CAPPluginCall) {
        let aktiv = call.getString("aktiv") ?? ""
        let sichtbar = call.getBool("sichtbar") ?? true
        DispatchQueue.main.async {
            self.anwenden(aktiv: aktiv, sichtbar: sichtbar, animiert: true)
            call.resolve()
        }
    }

    private func neueLeiste(in ansicht: UIView) -> UITabBar {
        let leiste = UITabBar()
        leiste.delegate = self
        leiste.tintColor = Self.akzent
        leiste.translatesAutoresizingMaskIntoConstraints = false
        ansicht.addSubview(leiste)
        NSLayoutConstraint.activate([
            leiste.leadingAnchor.constraint(equalTo: ansicht.leadingAnchor),
            leiste.trailingAnchor.constraint(equalTo: ansicht.trailingAnchor),
            leiste.bottomAnchor.constraint(equalTo: ansicht.bottomAnchor)
        ])
        // Der weiche Kanteneffekt, den Apple-Apps unter der Leiste zeigen: Die WebView ist kein Kind eines
        // UITabBarController, darum muss ihr Bildlauf die Leiste ausdruecklich kennen.
        if #available(iOS 26.0, *), let bildlauf = bridge?.webView?.scrollView {
            let kante = UIScrollEdgeElementContainerInteraction()
            kante.scrollView = bildlauf
            kante.edge = .bottom
            leiste.addInteraction(kante)
        }
        self.leiste = leiste
        return leiste
    }

    private func anwenden(aktiv: String, sichtbar: Bool, animiert: Bool) {
        guard let leiste else { return }
        if let i = kennungen.firstIndex(of: aktiv), let items = leiste.items, i < items.count {
            if leiste.selectedItem !== items[i] { leiste.selectedItem = items[i] }
        } else {
            leiste.selectedItem = nil
        }
        guard leiste.isHidden == sichtbar else { return }
        if sichtbar { leiste.isHidden = false }
        let ende = { leiste.alpha = sichtbar ? 1 : 0 }
        if animiert && !UIAccessibility.isReduceMotionEnabled {
            UIView.animate(withDuration: 0.2, animations: ende) { _ in if !sichtbar { leiste.isHidden = true } }
        } else {
            ende(); leiste.isHidden = !sichtbar
        }
    }

    public func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        guard item.tag >= 0, item.tag < kennungen.count else { return }
        notifyListeners("gewaehlt", data: ["id": kennungen[item.tag]])
    }
}

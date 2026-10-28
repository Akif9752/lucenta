import UIKit
import Capacitor
import LocalAuthentication

/// App-Sperre mit Face ID, Touch ID oder Code (frei — Entscheidung des Inhabers). Die Abdeckung liegt
/// nativ ueber dem Fenster: Sie steht, bevor iOS das Bild fuer den App-Umschalter aufnimmt und bevor
/// die Seite beim Kaltstart zeichnet. Die Texte kommen aus der Seite (Sprache der App).
final class AppSperre {
    static let shared = AppSperre()

    private let ablage = UserDefaults.standard
    /// Ohne Code auf dem Geraet kann iOS nicht entsperren: Dann gilt die Sperre nicht, sonst waere man ausgesperrt.
    var wirksam: Bool { an && AppSperre.art() != nil }
    var an: Bool {
        get { ablage.bool(forKey: "lucenta_sperre_an") }
        set { ablage.set(newValue, forKey: "lucenta_sperre_an") }
    }
    /// Sekunden ausserhalb der App, die ohne erneutes Entsperren vergehen duerfen (0, 60, 900).
    var nach: Int {
        get { ablage.integer(forKey: "lucenta_sperre_nach") }
        set { ablage.set(newValue, forKey: "lucenta_sperre_nach") }
    }
    var texte: [String: String] {
        get { ablage.dictionary(forKey: "lucenta_sperre_texte") as? [String: String] ?? [:] }
        set { ablage.set(newValue, forKey: "lucenta_sperre_texte") }
    }

    private weak var ansicht: UIViewController?
    private var decke: UIView?
    private var verlassen: Date?
    private var prueft = false

    /// "faceID", "touchID", "code" — oder nil, wenn das Geraet keinen Code hat.
    static func art() -> String? {
        let k = LAContext()
        if k.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil) {
            switch k.biometryType {
            case .faceID: return "faceID"
            case .touchID: return "touchID"
            default: break
            }
        }
        return k.canEvaluatePolicy(.deviceOwnerAuthentication, error: nil) ? "code" : nil
    }

    func einrichten(_ vc: UIViewController) {
        ansicht = vc
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(imHintergrund), name: UIScene.didEnterBackgroundNotification, object: nil)
        nc.addObserver(self, selector: #selector(aktiv), name: UIScene.didActivateNotification, object: nil)
        if wirksam { zudecken() }
    }

    @objc private func imHintergrund() {
        guard wirksam else { return }
        if verlassen == nil { verlassen = Date() }
        zudecken()
    }

    /// Auch nach dem Face-ID-Dialog wird die Szene wieder aktiv — `prueft` verhindert die Schleife.
    @objc func aktiv() {
        guard decke != nil, !prueft else { return }
        guard wirksam else { aufdecken(); return }
        if let v = verlassen, Date().timeIntervalSince(v) < Double(nach) { aufdecken(); return }
        entsperren()
    }

    func pruefen(_ fertig: @escaping (Bool) -> Void) {
        prueft = true
        LAContext().evaluatePolicy(.deviceOwnerAuthentication, localizedReason: texte["grund"] ?? "Lucenta") { ok, _ in
            DispatchQueue.main.async {
                self.prueft = false
                fertig(ok)
            }
        }
    }

    @objc private func entsperren() {
        pruefen { ok in if ok { self.aufdecken() } }
    }

    private func aufdecken() {
        decke?.removeFromSuperview()
        decke = nil
        verlassen = nil
    }

    private func zudecken() {
        guard decke == nil, let vc = ansicht else { return }
        let ziel: UIView = vc.view.window ?? vc.view
        let d = UIView(frame: ziel.bounds)
        d.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        d.backgroundColor = UIColor { $0.userInterfaceStyle == .dark ? .black
            : UIColor(red: 0xE6/255.0, green: 0xE5/255.0, blue: 0xE0/255.0, alpha: 1) }

        let marke = UIColor(red: 0x5C/255.0, green: 0xB4/255.0, blue: 0xAD/255.0, alpha: 1)
        let schloss = UIImageView(image: UIImage(systemName: "lock.fill",
                                                 withConfiguration: UIImage.SymbolConfiguration(pointSize: 44, weight: .semibold)))
        schloss.tintColor = marke
        let titel = UILabel()
        titel.text = texte["titel"] ?? "Lucenta ist gesperrt"
        titel.font = .preferredFont(forTextStyle: .headline)
        titel.adjustsFontForContentSizeCategory = true
        titel.textColor = .label
        var stil = UIButton.Configuration.filled()
        stil.title = texte["knopf"] ?? "Entsperren"
        stil.baseBackgroundColor = marke
        stil.baseForegroundColor = .black
        stil.cornerStyle = .capsule
        stil.contentInsets = NSDirectionalEdgeInsets(top: 12, leading: 28, bottom: 12, trailing: 28)
        let knopf = UIButton(configuration: stil)
        knopf.addTarget(self, action: #selector(entsperren), for: .touchUpInside)

        let stapel = UIStackView(arrangedSubviews: [schloss, titel, knopf])
        stapel.axis = .vertical
        stapel.alignment = .center
        stapel.spacing = 18
        stapel.setCustomSpacing(28, after: titel)
        stapel.translatesAutoresizingMaskIntoConstraints = false
        d.addSubview(stapel)
        NSLayoutConstraint.activate([
            stapel.centerXAnchor.constraint(equalTo: d.centerXAnchor),
            stapel.centerYAnchor.constraint(equalTo: d.centerYAnchor)
        ])
        ziel.addSubview(d)
        decke = d
    }

    /// Fenster kann beim Kaltstart noch fehlen: dann liegt die Decke zunaechst auf der Ansicht.
    func anFensterHeben() {
        guard let d = decke, let w = ansicht?.view.window, d.superview !== w else { return }
        d.removeFromSuperview()
        d.frame = w.bounds
        w.addSubview(d)
    }
}

/// Bruecke fuer die Einstellungen: `stand`, `setzen({an, nach})`, `texte({titel, knopf, grund})`.
@objc(LucentaSperrePlugin)
public class LucentaSperrePlugin: CAPInstancePlugin, CAPBridgedPlugin {
    public let identifier = "LucentaSperrePlugin"
    public let jsName = "Lock"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "stand", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setzen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "texte", returnType: CAPPluginReturnPromise)
    ]

    private func stand() -> [String: Any] {
        let s = AppSperre.shared
        guard let art = AppSperre.art() else { return ["verfuegbar": false] }
        return ["verfuegbar": true, "art": art, "an": s.an, "nach": s.nach]
    }

    @objc func stand(_ call: CAPPluginCall) { call.resolve(stand()) }

    /// Einschalten nur nach erfolgreichem Entsperren — sonst sperrt man sich mit einer Einstellung aus,
    /// die auf dem Geraet nicht funktioniert.
    @objc func setzen(_ call: CAPPluginCall) {
        let s = AppSperre.shared
        if let n = call.getInt("nach"), [0, 60, 900].contains(n) { s.nach = n }
        let soll = call.getBool("an") ?? s.an
        guard soll && !s.an else {
            s.an = soll
            call.resolve(stand()); return
        }
        DispatchQueue.main.async {
            s.pruefen { ok in
                if ok { s.an = true }
                call.resolve(self.stand())
            }
        }
    }

    @objc func texte(_ call: CAPPluginCall) {
        var t: [String: String] = [:]
        for k in ["titel", "knopf", "grund"] { if let v = call.getString(k) { t[k] = v } }
        AppSperre.shared.texte = t
        call.resolve([:])
    }
}

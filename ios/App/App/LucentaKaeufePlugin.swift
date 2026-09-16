import Foundation
import Capacitor
import StoreKit

/// Die Kauf-Bruecke (Runde 103).
///
/// **Warum es diese Datei ueberhaupt gibt.** `src/js/19b-native.js` ruft seit Runde 99 ein
/// Capacitor-Modul namens `StoreKit` auf. Fuer `LocalNotifications`, `Filesystem` und `App` gibt
/// es offizielle Module, die genau so heissen — fuer Kaeufe gibt es **keins**, weder von Apple
/// noch von Ionic. Der Name war also ein ehrlich vermerkter Platzhalter, und das hier ist das
/// Stueck, das ihn einloest. Angemeldet wird unter genau diesem Namen (`jsName = "StoreKit"`),
/// damit die JavaScript-Seite keine Zeile aendern muss, die schon geprueft ist.
///
/// **Die Klasse heisst NICHT StoreKit.** Das waere ein Namenskonflikt mit Apples Framework, das
/// diese Datei importiert. Nach aussen (zum JavaScript) heisst sie trotzdem so.
///
/// **Registrierung: `CAPInstancePlugin` und `capacitorDidLoad()`, nicht die Klassenliste.**
/// Capacitor 6 registriert Plugins nicht mehr ueber die ObjC-Laufzeit, sondern liest
/// `packageClassList` aus `capacitor.config.json` (siehe `CapacitorBridge.registerPlugins()`).
/// Diese Datei dort einzutragen waere die Falle: `ios/App/App/capacitor.config.json` ist von
/// `npx cap sync ios` **erzeugt** und beim naechsten Sync wieder ueberschrieben — die Anmeldung
/// waere spurlos weg, und die App faellt dann still auf "gibt es nur in der App" zurueck, ohne
/// einen Fehler zu zeigen. Deshalb meldet `MainViewController.capacitorDidLoad()` eine Instanz an
/// (`registerPluginInstance`), und die Klasse erbt von `CAPInstancePlugin` — die Sorte Plugin, die
/// die automatische Registrierung ausdruecklich ueberspringt. Damit kann sie auch nicht doppelt
/// registriert werden.
///
/// **StoreKit 2** (`Product`, `Transaction`), nicht das alte `SKPaymentQueue`: Das Deployment
/// Target ist 15.0, und StoreKit 2 prueft die Kaufbelege selbst kryptografisch signiert auf dem
/// Geraet. Das passt zum Versprechen der App — es braucht **keinen Server** und kein Konto, um
/// einen Kauf zu bestaetigen. Ein eigener Beleg-Server waere die erste Stelle, an der Lucenta
/// etwas nach aussen sendet, und damit waere "Data Not Collected" falsch.
@objc(LucentaKaeufePlugin)
public class LucentaKaeufePlugin: CAPInstancePlugin, CAPBridgedPlugin {

    public let identifier = "LucentaKaeufePlugin"
    public let jsName = "StoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "stand", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "kaufen", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise)
    ]

    /// Die beiden Abo-Produkte, in derselben Abo-Gruppe. Die Liste steht hier UND in
    /// `src/js/19b-native.js`; sie ist die Grenze zwischen beiden Seiten, und ein Kauf einer
    /// Kennung, die hier nicht steht, wird abgewiesen statt an den Store gegeben.
    private static let produkte: Set<String> = ["lucenta.plus.monat", "lucenta.plus.jahr"]

    /// Horcht auf Aenderungen, die NICHT aus einem Tippen in dieser App kommen: eine Verlaengerung,
    /// ein Widerruf, oder ein "Bitten um Erlaubnis"-Kauf, den ein Elternteil spaeter freigibt.
    ///
    /// Der Grund, warum das kein Beiwerk ist: Apple verlangt, dass jede Transaktion `finish()`
    /// bekommt. Eine unbeendete Transaktion wird beim naechsten Start **erneut** geliefert — und
    /// solange niemand zuhoert, bleibt sie fuer immer in der Warteschlange stehen.
    private var horcher: Task<Void, Never>?

    override public func load() {
        horcher = Task.detached {
            for await ergebnis in Transaction.updates {
                guard case .verified(let transaktion) = ergebnis else { continue }
                await transaktion.finish()
            }
        }
    }

    deinit {
        horcher?.cancel()
    }

    // MARK: - Der Anspruch, einmal an einer Stelle festgestellt

    /// Laeuft gerade ein Abo? Antwortet mit der Produktkennung, damit die App sagen kann, WELCHES.
    ///
    /// `Transaction.currentEntitlements` liefert nur, was gerade gilt; die drei zusaetzlichen
    /// Pruefungen (widerrufen, abgelaufen, hochgestuft) stehen trotzdem da. Sie kosten nichts und
    /// beschreiben genau, was "aktiv" bedeuten soll — bei einer Frage, an der Geld haengt, ist das
    /// besser als sich auf eine Zusage zu verlassen, die man nicht sieht.
    private func aktivesAbo() async -> (aktiv: Bool, produkt: String?) {
        for await ergebnis in Transaction.currentEntitlements {
            guard case .verified(let transaktion) = ergebnis else { continue }
            guard Self.produkte.contains(transaktion.productID) else { continue }
            if let widerrufen = transaktion.revocationDate, widerrufen <= Date() { continue }
            if let ablauf = transaktion.expirationDate, ablauf <= Date() { continue }
            if transaktion.isUpgraded { continue }
            return (true, transaktion.productID)
        }
        return (false, nil)
    }

    // MARK: - Die drei Aufrufe

    /// Was gilt gerade? Ohne Dialog, ohne Anmeldung — gedacht fuer den Start der App.
    ///
    /// Bewusst getrennt von `restorePurchases()`: Das Wiederherstellen ruft `AppStore.sync()` und
    /// zeigt damit einen Anmeldedialog. Beim Start ungefragt danach zu fragen waere zudringlich;
    /// diese Antwort kommt aus dem Geraet und fragt niemanden.
    @objc func stand(_ call: CAPPluginCall) {
        Task {
            let abo = await aktivesAbo()
            call.resolve(["aktiv": abo.aktiv, "produkt": abo.produkt ?? ""])
        }
    }

    /// Der Kauf.
    ///
    /// Die vier Ausgaenge werden **unterschieden** und nicht zu "hat nicht geklappt"
    /// zusammengefasst: Ein Abbruch ist die Entscheidung der Person und darf keine Fehlermeldung
    /// erzeugen, und ein wartender Kauf ("Bitten um Erlaubnis") ist noch nicht entschieden — ihn
    /// als Fehlschlag zu melden hiesse, jemanden zweimal kaufen zu lassen.
    @objc func kaufen(_ call: CAPPluginCall) {
        guard let kennung = call.getString("produkt"), Self.produkte.contains(kennung) else {
            call.reject("unbekannte Produktkennung")
            return
        }
        Task {
            do {
                guard let produkt = try await Product.products(for: [kennung]).first else {
                    call.reject("Produkt im Store nicht gefunden: \(kennung)")
                    return
                }
                switch try await produkt.purchase() {
                case .success(let bestaetigung):
                    // Unbestaetigt heisst: Die Signatur des Belegs passt nicht. Das ist der Fall,
                    // den eine Faelschung erzeugt — hier wird NICHTS freigeschaltet.
                    guard case .verified(let transaktion) = bestaetigung else {
                        call.resolve(["aktiv": false, "unbestaetigt": true])
                        return
                    }
                    await transaktion.finish()
                    call.resolve(["aktiv": true, "produkt": transaktion.productID])
                case .userCancelled:
                    call.resolve(["aktiv": false, "abgebrochen": true])
                case .pending:
                    call.resolve(["aktiv": false, "wartet": true])
                @unknown default:
                    call.resolve(["aktiv": false])
                }
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    /// Kaeufe wiederherstellen — Richtlinie 3.1.2.
    ///
    /// `AppStore.sync()` wirft, wenn die Person den Anmeldedialog abbricht. Das ist kein Fehler
    /// und wird deshalb verschluckt; die Antwort kommt danach trotzdem aus dem Geraet. Sonst
    /// saehe jemand, der nur den Dialog wegtippt, eine Fehlermeldung statt seines Standes.
    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do { try await AppStore.sync() } catch { }
            let abo = await aktivesAbo()
            call.resolve(["aktiv": abo.aktiv, "produkt": abo.produkt ?? ""])
        }
    }
}

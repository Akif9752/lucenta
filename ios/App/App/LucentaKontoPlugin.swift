import Foundation
import Capacitor
import AuthenticationServices
import CloudKit

/// "Mit Apple anmelden" und die eigene iCloud (Entscheidung des Inhabers, Runde 149).
///
/// Kein eigener Server: Die Anmeldung fragt weder Name noch E-Mail an und liefert nur eine Kennung,
/// die auf dem Geraet bleibt. Die Daten liegen in der PRIVATEN CloudKit-Datenbank der Person, das
/// Feld Ende-zu-Ende verschluesselt (`encryptedValues`) — wir koennen sie nicht lesen, also bleibt
/// "Data Not Collected" wahr. Angemeldet wie die Kauf-Bruecke ueber `registerPluginInstance`.
@objc(LucentaKontoPlugin)
public class LucentaKontoPlugin: CAPInstancePlugin, CAPBridgedPlugin {

    public let identifier = "LucentaKontoPlugin"
    public let jsName = "Account"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "stand", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "anmelden", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "abmelden", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "sichern", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "laden", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loeschen", returnType: CAPPluginReturnPromise)
    ]

    private static let kennungSchluessel = "lucenta_apple_kennung"
    private static let datensatz = CKRecord.ID(recordName: "lucenta-daten")
    private static let art = "LucentaDaten"
    /// Ein CloudKit-Datensatz fasst 1 MB; darunter bleibt Luft fuer die Verwaltungsdaten.
    private static let hoechstens = 900_000

    private var datenbank: CKDatabase { CKContainer.default().privateCloudDatabase }
    private var kennung: String? { UserDefaults.standard.string(forKey: Self.kennungSchluessel) }
    /// Haelt den Delegaten der laufenden Anmeldung, bis Apple antwortet.
    private var laufend: Anmeldung?

    @objc func stand(_ call: CAPPluginCall) {
        guard let kennung else { call.resolve(["angemeldet": false]); return }
        ASAuthorizationAppleIDProvider().getCredentialState(forUserID: kennung) { zustand, _ in
            // Nur eine klare Antwort meldet ab (widerrufen); eine Stoerung nimmt nichts weg.
            if zustand == .revoked {
                UserDefaults.standard.removeObject(forKey: Self.kennungSchluessel)
                call.resolve(["angemeldet": false])
                return
            }
            CKContainer.default().accountStatus { status, _ in
                call.resolve(["angemeldet": true, "icloud": status == .available])
            }
        }
    }

    @objc func anmelden(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let anfrage = ASAuthorizationAppleIDProvider().createRequest()
            anfrage.requestedScopes = []        // bewusst nichts: keine E-Mail, kein Name
            let steuerung = ASAuthorizationController(authorizationRequests: [anfrage])
            let a = Anmeldung(fenster: self.bridge?.viewController?.view.window) { [weak self] ergebnis in
                self?.laufend = nil
                switch ergebnis {
                case .success(let id):
                    UserDefaults.standard.set(id, forKey: Self.kennungSchluessel)
                    call.resolve(["angemeldet": true])
                case .failure(let fehler):
                    if (fehler as? ASAuthorizationError)?.code == .canceled { call.resolve(["abgebrochen": true]) }
                    else { call.reject(fehler.localizedDescription) }
                }
            }
            self.laufend = a
            steuerung.delegate = a
            steuerung.presentationContextProvider = a
            steuerung.performRequests()
        }
    }

    /// Apple kennt kein Abmelden; vergessen wird die Kennung auf diesem Geraet. Die iCloud-Daten bleiben.
    @objc func abmelden(_ call: CAPPluginCall) {
        UserDefaults.standard.removeObject(forKey: Self.kennungSchluessel)
        call.resolve(["angemeldet": false])
    }

    @objc func sichern(_ call: CAPPluginCall) {
        guard kennung != nil else { call.resolve(["angemeldet": false]); return }
        guard let daten = call.getString("daten"), daten.utf8.count <= Self.hoechstens else {
            call.resolve(["zuGross": true]); return
        }
        let satz = CKRecord(recordType: Self.art, recordID: Self.datensatz)
        satz.encryptedValues["daten"] = daten
        satz["geaendert"] = Date()
        // Immer der ganze Stand dieses Geraets: ueberschreibt, statt mit einem aelteren zu verhandeln.
        let schritt = CKModifyRecordsOperation(recordsToSave: [satz], recordIDsToDelete: nil)
        schritt.savePolicy = .allKeys
        schritt.modifyRecordsResultBlock = { ergebnis in
            switch ergebnis {
            case .success: call.resolve(["gesichert": true, "zeit": Date().timeIntervalSince1970 * 1000])
            case .failure(let fehler): self.cloudFehler(fehler, call)
            }
        }
        datenbank.add(schritt)
    }

    @objc func laden(_ call: CAPPluginCall) {
        guard kennung != nil else { call.resolve(["angemeldet": false]); return }
        datenbank.fetch(withRecordID: Self.datensatz) { satz, fehler in
            if let fehler {
                if (fehler as? CKError)?.code == .unknownItem { call.resolve(["leer": true]) }
                else { self.cloudFehler(fehler, call) }
                return
            }
            guard let satz, let daten = satz.encryptedValues["daten"] as? String else {
                call.resolve(["leer": true]); return
            }
            let zeit = (satz["geaendert"] as? Date ?? satz.modificationDate ?? Date()).timeIntervalSince1970 * 1000
            call.resolve(["daten": daten, "zeit": zeit])
        }
    }

    /// Konto loeschen (Richtlinie 5.1.1(v)): Datensatz in der iCloud weg, dann die Kennung vergessen.
    /// Kein Token-Widerruf: Wir tauschen den Code nie ein, es entsteht also kein Token (Entscheidung
    /// des Inhabers). Scheitert das Loeschen, bleibt die Anmeldung, damit man es erneut versuchen kann.
    @objc func loeschen(_ call: CAPPluginCall) {
        datenbank.delete(withRecordID: Self.datensatz) { _, fehler in
            if let fehler, (fehler as? CKError)?.code != .unknownItem {
                self.cloudFehler(fehler, call)
                return
            }
            UserDefaults.standard.removeObject(forKey: Self.kennungSchluessel)
            call.resolve(["geloescht": true])
        }
    }

    /// Kein iCloud-Konto auf dem Geraet ist eine Antwort, kein Absturz: Die Seite sagt es der Person.
    private func cloudFehler(_ fehler: Error, _ call: CAPPluginCall) {
        let code = (fehler as? CKError)?.code
        if code == .notAuthenticated || code == .permissionFailure { call.resolve(["keinIcloud": true]); return }
        if code == .networkUnavailable || code == .networkFailure { call.resolve(["offline": true]); return }
        call.reject(fehler.localizedDescription)
    }
}

/// Delegat fuer genau eine Anmeldung.
private final class Anmeldung: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    private let fenster: UIWindow?
    private let fertig: (Result<String, Error>) -> Void

    init(fenster: UIWindow?, fertig: @escaping (Result<String, Error>) -> Void) {
        self.fenster = fenster
        self.fertig = fertig
    }

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        fenster ?? ASPresentationAnchor()
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let ausweis = authorization.credential as? ASAuthorizationAppleIDCredential { fertig(.success(ausweis.user)) }
        else { fertig(.failure(ASAuthorizationError(.unknown))) }
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        fertig(.failure(error))
    }
}

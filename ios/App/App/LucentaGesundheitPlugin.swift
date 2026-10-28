import Foundation
import Capacitor
import HealthKit

/// Stimmung aus der Tagesform als Gemuetszustand nach Apple Health (ab iOS 18). Nur schreiben, nie
/// lesen — Entscheidung des Inhabers. Die Daten bleiben bei Apple und der Person: "Data Not Collected".
@objc(LucentaGesundheitPlugin)
public class LucentaGesundheitPlugin: CAPInstancePlugin, CAPBridgedPlugin {

    public let identifier = "LucentaGesundheitPlugin"
    public let jsName = "Health"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "stand", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "erlauben", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "schreiben", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loeschen", returnType: CAPPluginReturnPromise)
    ]

    private let speicher = HKHealthStore()

    @objc func stand(_ call: CAPPluginCall) {
        guard #available(iOS 18.0, *), HKHealthStore.isHealthDataAvailable() else {
            call.resolve(["verfuegbar": false]); return
        }
        call.resolve(["verfuegbar": true, "erlaubt": erlaubt()])
    }

    @objc func erlauben(_ call: CAPPluginCall) {
        guard #available(iOS 18.0, *), HKHealthStore.isHealthDataAvailable() else {
            call.resolve(["erlaubt": false]); return
        }
        speicher.requestAuthorization(toShare: [HKObjectType.stateOfMindType()], read: []) { [weak self] _, _ in
            call.resolve(["erlaubt": self?.erlaubt() ?? false])
        }
    }

    /// `valence` 1–5 aus der Tagesform -> -1…1 (sehr unangenehm … sehr angenehm).
    @objc func schreiben(_ call: CAPPluginCall) {
        guard #available(iOS 18.0, *), erlaubt(),
              let ts = call.getDouble("ts"), let v = call.getInt("valence"), (1...5).contains(v) else {
            call.resolve([:]); return
        }
        let probe = HKStateOfMind(date: Date(timeIntervalSince1970: ts / 1000), kind: .momentaryEmotion,
                                  valence: Double(v - 3) / 2, labels: [], associations: [])
        speicher.save(probe) { ok, _ in
            call.resolve(ok ? ["uuid": probe.uuid.uuidString] : [:])
        }
    }

    @objc func loeschen(_ call: CAPPluginCall) {
        guard #available(iOS 18.0, *), let text = call.getString("uuid"), let uuid = UUID(uuidString: text) else {
            call.resolve([:]); return
        }
        speicher.deleteObjects(of: HKObjectType.stateOfMindType(), predicate: HKQuery.predicateForObject(with: uuid)) { ok, _, _ in
            call.resolve(["geloescht": ok])
        }
    }

    @available(iOS 18.0, *)
    private func erlaubt() -> Bool {
        speicher.authorizationStatus(for: HKObjectType.stateOfMindType()) == .sharingAuthorized
    }
}

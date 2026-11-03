import UIKit
import Capacitor

// Alternative App-Symbole (Lucenta+, Entscheidung des Inhabers). Die Namen muessen den Symbolsaetzen im Asset-Katalog
// entsprechen und in ASSETCATALOG_COMPILER_ALTERNATE_APPICON_NAMES stehen; die Liste steht absichtlich auch in
// src/js/24-native.js — eine unbekannte Kennung wird hier abgewiesen.
public class LucentaSymbolPlugin: CAPInstancePlugin, CAPBridgedPlugin {
    public let identifier = "LucentaSymbolPlugin"
    public let jsName = "AppSymbol"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "stand", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setzen", returnType: CAPPluginReturnPromise)
    ]
    private let erlaubt: Set<String> = ["AppIcon-2", "AppIcon-3", "AppIcon-4", "AppIcon-5", "AppIcon-6"]   // Nacht, Papier, Abendrot, Ozean, Lavendel

    @objc func stand(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let app = UIApplication.shared
            call.resolve(["verfuegbar": app.supportsAlternateIcons, "name": app.alternateIconName ?? ""])
        }
    }

    // `name` leer = Standardsymbol. iOS zeigt nach dem Wechsel selbst einen Hinweis.
    @objc func setzen(_ call: CAPPluginCall) {
        let name = call.getString("name") ?? ""
        if !name.isEmpty && !erlaubt.contains(name) { call.reject("unbekanntes Symbol"); return }
        DispatchQueue.main.async {
            let app = UIApplication.shared
            guard app.supportsAlternateIcons else { call.reject("nicht unterstuetzt"); return }
            if (app.alternateIconName ?? "") == name { call.resolve(["name": name]); return }
            app.setAlternateIconName(name.isEmpty ? nil : name) { fehler in
                if let fehler { call.reject(fehler.localizedDescription) } else { call.resolve(["name": name]) }
            }
        }
    }
}

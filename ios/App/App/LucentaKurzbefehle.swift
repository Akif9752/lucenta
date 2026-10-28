import AppIntents
import Foundation

/// Siri und Kurzbefehle fuer die Tagesform. Eingetragen wird ueber denselben Eingang wie beim Widget
/// (`WidgetEmpfaenger.eintragen`); die Seite uebernimmt ihn beim naechsten Abholen.
@available(iOS 16.0, *)
struct TagesformEintragenIntent: AppIntent {
    static var title: LocalizedStringResource = "Log check-in"
    static var description = IntentDescription("Logs mood and energy for the current time of day, without opening the app.")

    @Parameter(title: "Mood", inclusiveRange: (1, 5),
               requestValueDialog: IntentDialog("How is your mood, from 1 to 5?"))
    var stimmung: Int

    @Parameter(title: "Energy", inclusiveRange: (1, 5),
               requestValueDialog: IntentDialog("How is your energy, from 1 to 5?"))
    var energie: Int

    static var parameterSummary: some ParameterSummary {
        Summary("Log mood \(\.$stimmung) and energy \(\.$energie)")
    }

    func perform() async throws -> some IntentResult & ProvidesDialog {
        WidgetEmpfaenger.eintragen(energy: energie, valence: stimmung)
        await MainActor.run { NotificationCenter.default.post(name: WidgetEmpfaenger.neuerEintrag, object: nil) }
        return .result(dialog: IntentDialog("Logged: mood \(stimmung), energy \(energie)."))
    }
}

@available(iOS 16.0, *)
struct TagesformOeffnenIntent: AppIntent {
    static var title: LocalizedStringResource = "Open check-in"
    static var description = IntentDescription("Opens the check-in in Lucenta.")

    func perform() async throws -> some IntentResult {
        WidgetEmpfaenger.oeffnenAnfragen()
        await MainActor.run { NotificationCenter.default.post(name: WidgetEmpfaenger.neuerEintrag, object: nil) }
        return .result()
    }
}

/// `openAppWhenRun` ist ab iOS 26 durch `supportedModes` ersetzt; fuer iOS 16–25 bleibt es der Weg.
@available(iOS 16.0, *)
@available(*, deprecated)
extension TagesformOeffnenIntent {
    static var openAppWhenRun: Bool { true }
}

@available(iOS 16.0, *)
struct LucentaKurzbefehle: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: TagesformEintragenIntent(),
                    phrases: ["Log my check-in in \(.applicationName)",
                              "Log my mood in \(.applicationName)"],
                    shortTitle: "Log check-in",
                    systemImageName: "square.and.pencil")
        AppShortcut(intent: TagesformOeffnenIntent(),
                    phrases: ["Open check-in in \(.applicationName)",
                              "\(.applicationName) check-in"],
                    shortTitle: "Open check-in",
                    systemImageName: "sun.max")
    }
}

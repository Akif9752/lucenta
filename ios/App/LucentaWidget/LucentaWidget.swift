import WidgetKit
import SwiftUI
import AppIntents
import UserNotifications

// MARK: - Eintragen ohne die App zu oeffnen

struct WertSetzenIntent: AppIntent {
    static var title: LocalizedStringResource = "Log check-in"
    static var isDiscoverable = false

    @Parameter(title: "Energy") var energie: Bool
    @Parameter(title: "Value") var wert: Int

    init() {}
    init(energie: Bool, wert: Int) {
        self.energie = energie
        self.wert = wert
    }

    func perform() async throws -> some IntentResult {
        let vorher = TagesformAblage.heute()
        TagesformAblage.setzen(energie: energie, wert: wert)
        if TagesformAblage.heute().count > vorher.count { await erinnerungenHeuteAbsagen() }
        return .result()
    }

    /// Wie `erinnerungListe()` in 24-native.js: Mit einem Eintrag entfaellt die heutige Erinnerung
    /// (bei "zu jeder Tageszeit" nur die der laufenden Tageszeit). Die App plant beim Oeffnen ohnehin neu.
    private func erinnerungenHeuteAbsagen() async {
        let zentrale = UNUserNotificationCenter.current()
        let jetzt = Date.now, abschnitt = TagesformAblage.abschnitt(jetzt)
        let alle = TagesformAblage.erinnerungAlle()
        let ids = await zentrale.pendingNotificationRequests().compactMap { r -> String? in
            guard let t = r.trigger as? UNCalendarNotificationTrigger, let d = t.nextTriggerDate(),
                  Calendar.current.isDate(d, inSameDayAs: jetzt) else { return nil }
            return (!alle || TagesformAblage.abschnitt(d) == abschnitt) ? r.identifier : nil
        }
        zentrale.removePendingNotificationRequests(withIdentifiers: ids)
    }
}

// MARK: - Zeitleiste: neu zeichnen, wenn die Tageszeit wechselt

struct TagesformEintrag: TimelineEntry {
    let date: Date
    let heute: [String: TagesformAblage.Werte]
    let entwurf: TagesformAblage.Entwurf
    var abschnitt: String { TagesformAblage.abschnitt(date) }
}

struct TagesformQuelle: TimelineProvider {
    func placeholder(in context: Context) -> TagesformEintrag {
        TagesformEintrag(date: .now, heute: ["morgen": .init(energy: 4, valence: 4)],
                         entwurf: .init(tag: "", abschnitt: ""))
    }

    func getSnapshot(in context: Context, completion: @escaping (TagesformEintrag) -> Void) {
        completion(context.isPreview ? placeholder(in: context) : eintrag(.now))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<TagesformEintrag>) -> Void) {
        let kal = Calendar.current, jetzt = Date.now
        let start = kal.startOfDay(for: jetzt)
        let grenzen = [12, 18, 24, 36].compactMap { kal.date(byAdding: .hour, value: $0, to: start) }
            .filter { $0 > jetzt }
        completion(Timeline(entries: [eintrag(jetzt)] + grenzen.map(eintrag), policy: .atEnd))
    }

    private func eintrag(_ d: Date) -> TagesformEintrag {
        TagesformEintrag(date: d, heute: TagesformAblage.heute(d), entwurf: TagesformAblage.entwurf(d))
    }
}

// MARK: - Darstellung

private let marke = Color("AccentColor")
private let symbole = ["morgen": "sunrise.fill", "mittag": "sun.max.fill", "abend": "moon.stars.fill"]
private let namen: [String: LocalizedStringResource] = ["morgen": "Morning", "mittag": "Midday", "abend": "Evening"]

struct TagesformAnsicht: View {
    @Environment(\.widgetFamily) private var familie
    let e: TagesformEintrag

    var body: some View {
        Group {
            switch familie {
            case .systemMedium: mittel
            case .accessoryCircular: rund
            case .accessoryRectangular: rechteckig
            default: klein
            }
        }
        .widgetURL(URL(string: "lucenta://tagesform"))
        .containerBackground(for: .widget) { Color("WidgetBackground") }
    }

    private var titel: some View {
        Text("Check-in")
            .font(.system(.subheadline, weight: .semibold))
            .foregroundStyle(marke)
    }

    private var zeilen: some View {
        VStack(alignment: .leading, spacing: 6) {
            ForEach(TagesformAblage.abschnitte, id: \.self) { s in
                let fertig = e.heute[s] != nil, jetzt = s == e.abschnitt
                HStack(spacing: 6) {
                    Image(systemName: symbole[s] ?? "circle")
                        .font(.footnote)
                        .foregroundStyle(jetzt ? marke : .secondary)
                        .frame(width: 18)
                    Text(namen[s] ?? "")
                        .font(.system(.footnote, weight: jetzt ? .semibold : .regular))
                        .foregroundStyle(jetzt ? .primary : .secondary)
                    Spacer(minLength: 2)
                    Image(systemName: fertig ? "checkmark.circle.fill" : "circle")
                        .font(.footnote)
                        .foregroundStyle(fertig ? marke : Color.secondary.opacity(0.5))
                }
            }
        }
    }

    /// Der Wahl-Hinweis nur dort, wo gewaehlt werden kann (mittel).
    private func hinweis(mitWahl: Bool = false) -> Text {
        let name = String(localized: namen[e.abschnitt] ?? "")
        if mitWahl && e.entwurf.valence != nil && e.entwurf.energy == nil { return Text("Now pick energy") }
        if mitWahl && e.entwurf.energy != nil && e.entwurf.valence == nil { return Text("Now pick mood") }
        return e.heute[e.abschnitt] != nil ? Text("\(name) logged") : Text("\(name) open")
    }

    private var klein: some View {
        VStack(alignment: .leading, spacing: 8) {
            titel
            Spacer(minLength: 0)
            zeilen
            hinweis().font(.caption2).foregroundStyle(.secondary).lineLimit(1)
        }
    }

    private var mittel: some View {
        HStack(alignment: .top, spacing: 14) {
            VStack(alignment: .leading, spacing: 8) {
                titel
                Spacer(minLength: 0)
                zeilen
            }
            .frame(maxWidth: 130)
            VStack(alignment: .leading, spacing: 8) {
                skala("Mood", energie: false)
                skala("Energy", energie: true)
                hinweis(mitWahl: true).font(.caption2).foregroundStyle(.secondary).lineLimit(1)
            }
        }
    }

    private func skala(_ name: LocalizedStringResource, energie: Bool) -> some View {
        let gespeichert = e.heute[e.abschnitt].map { energie ? $0.energy : $0.valence }
        let gewaehlt = (energie ? e.entwurf.energy : e.entwurf.valence) ?? gespeichert
        return VStack(alignment: .leading, spacing: 4) {
            Text(name).font(.caption).foregroundStyle(.secondary)
            HStack(spacing: 6) {
                ForEach(1...5, id: \.self) { w in
                    Button(intent: WertSetzenIntent(energie: energie, wert: w)) {
                        Text("\(w)")
                            .font(.system(.footnote, design: .rounded, weight: .semibold))
                            .frame(width: 28, height: 28)
                            .foregroundStyle(gewaehlt == w ? Color("AufMarke") : Color.primary)
                            .background(Circle().fill(gewaehlt == w ? marke : Color.primary.opacity(0.08)))
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(Text("\(String(localized: name)) \(w) of 5"))
                }
            }
        }
    }

    private var erledigt: Int { TagesformAblage.abschnitte.filter { e.heute[$0] != nil }.count }

    private var rund: some View {
        Gauge(value: Double(erledigt), in: 0...3) {
            Image(systemName: symbole[e.abschnitt] ?? "circle")
        } currentValueLabel: {
            Image(systemName: symbole[e.abschnitt] ?? "circle")
        }
        .gaugeStyle(.accessoryCircularCapacity)
        .widgetAccentable()
    }

    private var rechteckig: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text("Check-in").font(.headline).widgetAccentable()
            hinweis().font(.caption)
            HStack(spacing: 4) {
                ForEach(TagesformAblage.abschnitte, id: \.self) { s in
                    Image(systemName: e.heute[s] != nil ? "circle.fill" : "circle").font(.caption2)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct LucentaWidget: Widget {
    let kind = "LucentaTagesform"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TagesformQuelle()) { e in
            TagesformAnsicht(e: e)
        }
        .configurationDisplayName("Check-in")
        .description("See which times of day you have logged, and log mood and energy right here.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
    }
}

#Preview(as: .systemMedium) {
    LucentaWidget()
} timeline: {
    TagesformEintrag(date: .now, heute: ["morgen": .init(energy: 4, valence: 3)],
                     entwurf: .init(tag: "", abschnitt: "", energy: nil, valence: 2))
}

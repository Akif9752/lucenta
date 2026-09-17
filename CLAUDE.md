# Lucenta

Ein Persönlichkeitsporträt nach dem Big-Five-Modell (50 IPIP-Aussagen), als **eine einzige
HTML-Datei**, ausschließlich fürs iPhone. Kein Server, kein Konto, keine Werbung, kein
Tracking, kein Fremdabruf. Die Antworten verlassen das Gerät nicht — das ist keine
Marketingaussage, sondern eine Eigenschaft, die im Code durchgehalten werden muss.

Die Oberfläche ist deutsch, ebenso Bezeichner, Kommentare und Commit-Nachrichten. Bitte
beibehalten; ein englischer Bezeichner mitten in `figSchnurrhaare` liest sich falsch.

## Bauen

`dist/lucenta.html` ist **erzeugt**. Niemals dort hineinschreiben — die Änderung ist beim
nächsten Bau weg.

    node build.js

setzt die Datei aus `src/` zusammen, in der Reihenfolge aus `src/manifest.json`. Alle
`src/i18n/*.js` landen an der Stelle `@@I18N@@`.

Zwei Regeln, die der Bau erzwingt und die sonst leise Schaden anrichten:

- **Alle JS-Teile teilen sich eine IIFE.** Sie wird in `00-start.js` geöffnet und in
  `21-beta-rueckmeldung.js` geschlossen. Ein neuer Teil muss im Manifest **davor** stehen,
  sonst sieht er nichts. (`22-sternenhimmel.js` ist bewusst eine eigene IIFE.)
- **Jedes Farb-Token braucht drei Blöcke:** `:root`, dann
  `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`, dann
  `:root[data-theme="dark"]`. Fehlt einer, bricht der Bau ab (`pruefeDunkelbloecke`).
  Grund: Der Betrachter hat drei Zustände — hell, dunkel, und „wie das System".

Weitere Abbruchprüfungen laufen mit: `pruefeSyntax`, `pruefeBildfarben`, `pruefeWaisen`,
`pruefeIphoneOnly` (Desktop-Bezüge sind hier ein Fehler, keine Nachlässigkeit) — und seit
Runde 106 `pruefeTransparenzTueren`: Jede Regel unter
`@media (prefers-reduced-transparency: reduce)` braucht direkt dahinter dieselben
Deklarationen unter `:root[data-transparenz="reduziert"]`. Grund: WebKit auf dem iPhone kennt
das Medienmerkmal nicht, die iOS-Hülle setzt stattdessen dieses Attribut — und doppelt
geschriebene Werte driften auseinander, wenn niemand sie zusammenhält.

## Prüfen — vollständig, vor jedem Commit

    npm run pruef-alles       # alle neun, ~8 Minuten, bringt den Server auf 8017 selbst mit
    npm run pruef-schnell     # Bau, Testreihen, i18n-Audit, App-Fassung — unter einer Minute

Seit Runde 103 ein Befehl statt neun (`tools/pruef_alles.mjs`): Der Server wird selbst gestartet
(oder ein laufender mitbenutzt), die Prüfungen laufen billig vor teuer, jede bekommt eine Zeile,
die vollständige Ausgabe liegt in `.pruef-log/<name>.log`. Bricht der Bau ab, hört es auf.

**In dieser Umgebung fehlt WebKit**, und zwei der neun brauchen es:

    LUCENTA_MOTOREN=chromium npm run pruef-alles

Ohne das meldet `fehlersuche` die WebKit-Hälfte laut als **ungemessen** (sie bricht nicht ab) und
`pruef-app` schlägt fehl, weil es nur WebKit kennt — beides gehört dann so ins Protokoll, nicht
stillschweigend übersprungen. Die einzelnen neun Befehle stehen in `tools/xcode-CLAUDE.md`.

Acht Sprachen: de, en, es, fr, it, pt, tr, ja. Wer eine neunte ergänzt, ändert **nicht**
`tools/_addkeys.py` von Hand — es liest `src/i18n` selbst. Die Zahl in `tests/lang_test.js`
steht dagegen absichtlich ausgeschrieben da: Ein Sprachpaket, das nicht lädt, verschwindet
sonst lautlos aus `CONTENT`.

## Was diese Umgebung nicht kann — und ein Mac schon

Die Prüfungen laufen hier alle auf **Chromium**. Safari auf dem iPhone ist **WebKit**. Im
Container lässt sich WebKit nicht nachinstallieren (die Netzwerkregeln blockieren den
Download). Auf einem Mac ist genau das der wertvollste Beitrag:

- `npm run fehlersuche` läuft seit Runde 103 von sich aus auf **beiden** Motoren, WebKit zuerst —
  auf dem Mac also ohne Zutun. Hier bleibt diese Hälfte ungemessen und wird als solche gemeldet.
- Xcode-Simulator öffnen und `dist/lucenta.html` in Safari prüfen — braucht **keinen**
  bezahlten Developer-Account
- besonders ansehen: `@property` (3×, trägt die Drehung des Strahlenkranzes; Safari ab 16.4),
  `color-mix()` (24×), `mask-image`, `repeating-conic-gradient`, `aspect-ratio`, `text-wrap`

## Zwei Lehren, die je dreimal bezahlt wurden

**Eine Messung kann sich auf die falsche Größe beziehen.** Der Strahlenkranz wurde zweimal
„verbessert", während die Zahlen stiegen und der sichtbare Fehler unberührt blieb. Die
Store-Zeichenzahlen waren alle 32 falsch, weil sie geschrieben statt gezählt wurden.
Schiedsrichter ist die vergrößerte Darstellung, nicht die Kennzahl — und die Prüfung gehört
danach als Werkzeug ins Repository, damit die Zahl nicht zurückdriftet.

**Ein Strich mit runden Enden ist auf Avatargröße ein Fremdkörper.** Dreimal versucht
(Haarglanz, Fellkante, Fellbrauen), dreimal gelöscht. Weiche Flächen ja, Striche nein.

## Store und Apple

`docs/app-store-start.md` ist die verbindliche Liste: was erledigt ist, was einen Mac
braucht, was nur der Inhaber erledigen kann. Kurz die Fallen:

- **Die Kauf-Brücke steht** (Runde 103): `ios/App/App/LucentaKaeufePlugin.swift`, StoreKit 2,
  angemeldet als `StoreKit` über `MainViewController.capacitorDidLoad()` — **nicht** über
  `packageClassList` in `capacitor.config.json`, die ist erzeugt und wird bei jedem
  `npx cap sync ios` überschrieben. Die zwei Stellen, die das Abo verschenkten
  (`btnPlusAktivieren`, `plusSchalter`), sind zu; der Umschalter im Profil erscheint nur noch
  ohne native Brücke. Geprüft über `npm run pruef-nativ` (45 Prüfungen, alle vier Ausgänge des
  Kaufs). **Offen und nur vom Inhaber zu erledigen:** die zwei Produkte in App Store Connect
  anlegen — `lucenta.plus.monat` und `lucenta.plus.jahr`, genau so geschrieben, in derselben
  Abo-Gruppe.
- **Keine Diagnosesprache.** Richtlinie 1.4.1. Lucenta beschreibt, es befundet nicht.
- **„Data Not Collected"** ist die richtige und einzige Datenschutzangabe — solange nichts
  hinzukommt, das sendet.

## Zwei Sitzungen, eine fuehrend

Seit Runde 102 auf ausdruecklichen Wunsch des Inhabers: **Die Sitzung in Xcode fuehrt und darf
alles aendern** — `ios/`, `src/`, `docs/`, `tools/`, `tests/`. Sie hat den Mac, das Geraet und
WebKit; sie sieht damit Dinge, die im Chromium dieser Umgebung prinzipiell unsichtbar sind.

**Diese Sitzung im Browser arbeitet ab jetzt auf Anfrage.** Sie schaut sich Meilensteine an,
prueft mit, beantwortet Fragen — und fasst von sich aus nichts an. Wer hier ungefragt in `src/`
schreibt, waehrend drueben gearbeitet wird, erzeugt Konflikte in einer 1,5-MB-Datei, die
niemand von Hand aufloest. Vor jeder Aenderung hier deshalb: `git pull`, und im Zweifel fragen.

Was die Xcode-Sitzung getan hat, steht in `docs/ios-huelle-journal.md` — Fehler, Aenderung,
Begruendung, neueste Eintraege oben. Das ist der erste Ort, den diese Sitzung liest, wenn sie
nach einer Pause wieder dazukommt.

Ihre Anweisungen stehen in `tools/xcode-CLAUDE.md` und werden von `npm run ios:claude` nach
`ios/App/CLAUDE.md` kopiert (automatisch bei jedem `npm run ios:sync`) — der Agent in Xcode
sucht sie **neben der `.xcodeproj`** und findet diese Datei hier nicht. Geaendert wird die
Vorlage, nie die Kopie.

Die Falle, die dort zuerst steht und sonst Arbeit kostet: `ios/App/public/` ist eine Kopie von
`dist/`, das selbst eine Kopie von `src/` ist. Drei Staende derselben Oberflaeche, und nur
`src/` ist echt.

## Git

Entwickelt wird auf `claude/lucenta-setup-browser-test-j6hn7f`. Kein Pull Request ohne
ausdrückliche Bitte. Der gebaute Stand wird zusätzlich als Artefakt veröffentlicht, damit
er auf dem Telefon sofort ansehbar ist.

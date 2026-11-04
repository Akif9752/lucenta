# Lucenta

Ein Persönlichkeitsporträt nach dem Big-Five-Modell (50 IPIP-Aussagen) als **iPhone-App**: eine
HTML-Oberfläche in einer Capacitor-Hülle (WKWebView), ausschließlich fürs iPhone. **Es gibt keine
Browser-Fassung und keine Webseite der App** (Entscheidung des Inhabers) — gebaut, geprüft und
ausgeliefert wird nur, was im App-Bundle läuft. Kein eigener Server, kein Konto bei uns, keine Werbung,
kein Tracking, kein Fremdabruf. Die Antworten verlassen das Gerät nicht — das ist keine
Marketingaussage, sondern eine Eigenschaft, die im Code durchgehalten werden muss. Einzige
Ausnahme seit Runde 149 (Entscheidung des Inhabers): freiwillig „Mit Apple anmelden“, dann liegt der
Bestand Ende-zu-Ende verschlüsselt in der **privaten iCloud der Person** (CloudKit,
`LucentaKontoPlugin.swift`) — wir können ihn nicht lesen, „Data Not Collected“ bleibt wahr. E-Mail-
oder Google-Konten bräuchten einen eigenen Server und sind deshalb bewusst nicht gebaut.

Die Oberfläche ist deutsch, ebenso Bezeichner, Kommentare und Commit-Nachrichten. Bitte
beibehalten; ein englischer Bezeichner mitten in `figSchnurrhaare` liest sich falsch.

## Bauen

`dist/` ist **erzeugt** (`index.html` ohne Kommentare, daneben Schriften, Sprachpakete und
Tierbilder). Niemals dort hineinschreiben — die Änderung ist beim nächsten Bau weg.

    node build.js

setzt die Oberfläche aus `src/` zusammen, in der Reihenfolge aus `src/manifest.json`. Deutsch steht
an der Stelle `@@I18N@@`, die übrigen Sprachen kommen nach `dist/sprachen/`. Testreihen und
i18n-Audit lesen den Quelltext direkt aus `src/`.

Zwei Regeln, die der Bau erzwingt und die sonst leise Schaden anrichten:

- **Alle JS-Teile teilen sich eine IIFE.** Sie wird in `00-start.js` geöffnet und in
  `28-verdrahtung-und-start.js` geschlossen. Ein neuer Teil muss im Manifest **davor** stehen,
  sonst sieht er nichts. (`29-sternenhimmel.js` ist bewusst eine eigene IIFE.)
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

    npm run pruef-alles       # wählt nach Änderung: leicht (~1 Min.) oder alle neun
    npm run pruef-voll        # immer alle neun, bringt den Server auf 8017 selbst mit
    npm run pruef-schnell     # Bau, Testreihen, i18n-Audit, App-Fassung — unter einer Minute

`tools/pruef_alles.mjs`: Hat sich seit dem letzten vollen, bestandenen Lauf nur außerhalb der
Oberfläche etwas geändert (Tierbilder, Doku, Swift, Hilfswerkzeuge), genügt die leichte Runde —
Entscheidung des Inhabers. Unabhängige Prüfungen laufen gleichzeitig, die messenden allein; die
vollständige Ausgabe liegt in `.pruef-log/<name>.log`. Bricht der Bau ab, hört es auf.

Alle Prüfungen laden `dist/index.html` — die Datei im App-Bundle — in **WebKit** (headless, die
Engine des iPhones; kein Chromium), mit nachgestellter App-Brücke aus `tools/app_bruecke.mjs`
(Entscheidung des Inhabers). Apples Tab-Leiste ist dort als fünf unsichtbare Knöpfe `#tabStart` …
`#tabProfil` nachgebaut. Die einzelnen neun Befehle stehen in `tools/xcode-CLAUDE.md`.

Acht Sprachen: de, en, es, fr, it, pt, tr, ja. Wer eine neunte ergänzt, ändert **nicht**
`tools/_addkeys.py` von Hand — es liest `src/i18n` selbst. Die Zahl in `tests/lang_test.js`
steht dagegen absichtlich ausgeschrieben da: Ein Sprachpaket, das nicht lädt, verschwindet
sonst lautlos aus `CONTENT`.

## Was nur Simulator und Gerät zeigen

Headless WebKit sieht keine GPU-Kosten und malt Unschärfe nicht ins Bildschirmfoto; nativ Gezeichnetes
(Tab-Leiste, Sperre, Teilen-Blatt) sieht es gar nicht. Am Simulator bzw. iPhone ansehen, besonders:
`@property` (trägt die Drehung des Strahlenkranzes; ab iOS 16.4), `color-mix()`, `mask-image`,
`repeating-conic-gradient`, `aspect-ratio`, `text-wrap`.

## Kommentare: kurz, das Warum, keine Geschichte

Seit Runde 138 (Auftrag des Inhabers, die Arbeit zu beschleunigen) sind die Kommentare in `src/`
um rund ein Drittel gekuerzt. Regel fuer neue: Ein Kommentar sagt, was man dem Code NICHT ansieht —
eine Falle, eine Abhaengigkeit, eine Entscheidung des Inhabers (kurz: "Entscheidung des Inhabers").
Die Geschichte dahin (welche Runde, was gemeldet wurde, was vorher falsch war, wie gemessen wurde)
gehoert ins Journal und in die Commit-Nachricht, nicht in den Code. Faustregel: hoechstens drei Zeilen.

Eine Kommentarzeile ist eine MARKE und darf nicht umformuliert werden: `// ---------- wiring ----------`
in `src/js/27-verdrahtung.js` — `tests/run.js` schneidet den Code dort ab. `src/styles/00-schriften.css`
ist erzeugt (`tools/schriften_holen.mjs`), nicht von Hand aendern.

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
  im Entwicklungsbau (`#if DEBUG`). Geprüft über `npm run pruef-nativ` (51 Prüfungen, alle vier Ausgänge des
  Kaufs). **Offen und nur vom Inhaber zu erledigen:** die zwei Produkte in App Store Connect
  anlegen — `lucenta.plus.monat` und `lucenta.plus.jahr`, genau so geschrieben, in derselben
  Abo-Gruppe.
- **Keine Diagnosesprache.** Richtlinie 1.4.1. Lucenta beschreibt, es befundet nicht.
- **„Data Not Collected"** ist die richtige und einzige Datenschutzangabe — solange nichts
  hinzukommt, das sendet.
- **Zwei Webseiten bleiben, bewusst und nur außerhalb der App** (Entscheidung des Inhabers):
  `web/datenschutz/` als die Datenschutz-URL, die Apple in App Store Connect verlangt, und
  `einladung/` für spätere antippbare Freundes-Links (braucht eine Domain, `EINLADUNG_DOMAIN` ist leer).

## Eine Sitzung: Xcode

Gearbeitet wird nur in der Xcode-Sitzung (Entscheidung des Inhabers; eine zweite Sitzung im Browser
gibt es nicht mehr). Sie darf alles ändern — `ios/`, `src/`, `docs/`, `tools/`, `tests/` — und trägt
die Prüfpflicht. Was sie getan hat, steht in `docs/ios-huelle-journal.md` — Fehler, Änderung,
Begründung, neueste Einträge oben; der Übergabeblock dort ist der Einstieg nach einer Pause.

Ihre Anweisungen stehen in `tools/xcode-CLAUDE.md` und werden von `npm run ios:claude` nach
`ios/App/CLAUDE.md` kopiert (automatisch bei jedem `npm run ios:sync`) — der Agent in Xcode
sucht sie **neben der `.xcodeproj`**. Geändert wird die Vorlage, nie die Kopie.

Die Falle, die dort zuerst steht und sonst Arbeit kostet: `ios/App/App/public/` ist eine Kopie von
`dist/`, das selbst aus `src/` gebaut ist. Drei Stände derselben Oberfläche, und nur `src/` ist echt.

## Git

Entwickelt wird auf `claude/lucenta-setup-browser-test-j6hn7f` (der Name ist historisch). Kein Pull
Request ohne ausdrückliche Bitte. Aufs Telefon kommt der Stand über `npm run installieren`.

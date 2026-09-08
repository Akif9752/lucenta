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

Vier weitere Abbruchprüfungen laufen mit: `pruefeSyntax`, `pruefeBildfarben`,
`pruefeIphoneOnly` (Desktop-Bezüge sind hier ein Fehler, keine Nachlässigkeit).

## Prüfen — vollständig, vor jedem Commit

    node build.js
    node tests/run.js              # 11 Reihen
    python3 tools/audit_i18n.py    # 8 statische Prüfungen über alle 8 Sprachen
    npm run diff-sprachen
    npm run pruef-bewegung
    npm run pruef-nativ            # 23 Prüfungen, stellt Capacitor im Browser nach
    npm run fehlersuche            # 13 Browserkonfigurationen
    npm run pruef-store            # Zeichenzahlen der Store-Texte

Acht Sprachen: de, en, es, fr, it, pt, tr, ja. Wer eine neunte ergänzt, ändert **nicht**
`tools/_addkeys.py` von Hand — es liest `src/i18n` selbst. Die Zahl in `tests/lang_test.js`
steht dagegen absichtlich ausgeschrieben da: Ein Sprachpaket, das nicht lädt, verschwindet
sonst lautlos aus `CONTENT`.

## Was diese Umgebung nicht kann — und ein Mac schon

Die Prüfungen laufen alle auf **Chromium**. Safari auf dem iPhone ist **WebKit**. Im
Container lässt sich WebKit nicht nachinstallieren (die Netzwerkregeln blockieren den
Download). Auf einem Mac ist genau das der wertvollste Beitrag:

- `npm run fehlersuche` gegen WebKit laufen lassen
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

- **`StoreKit` in `src/js/19b-native.js` ist ein Platzhalter.** Für LocalNotifications,
  Filesystem und App gibt es offizielle Capacitor-Module; für Käufe gibt es keins. Dort
  gehört eine eigene Swift-Brücke hin.
- **Zwei Stellen schalten die bezahlte Fassung ohne Zahlung frei:** `plusSchalter`
  (`src/js/15-profile.js`) und `btnPlusAktivieren` (`src/js/21-beta-rueckmeldung.js`).
  Beide müssen vor der Einreichung durch die echte Kaufprüfung ersetzt werden — eine allein
  übersehen heißt, die App verschenkt das Abo.
- **Keine Diagnosesprache.** Richtlinie 1.4.1. Lucenta beschreibt, es befundet nicht.
- **„Data Not Collected"** ist die richtige und einzige Datenschutzangabe — solange nichts
  hinzukommt, das sendet.

## Git

Entwickelt wird auf `claude/lucenta-setup-browser-test-j6hn7f`. Kein Pull Request ohne
ausdrückliche Bitte. Der gebaute Stand wird zusätzlich als Artefakt veröffentlicht, damit
er auf dem Telefon sofort ansehbar ist.

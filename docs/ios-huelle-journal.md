# Journal der Xcode-/iOS-Sitzung

Dieses Journal fuehrt die **fuehrende Sitzung** (Xcode/Mac). Seit Runde 102 ist es der **Bericht an
den Inhaber**, nicht mehr die Uebergabe an eine zweite Sitzung: was war der Fehler, warum behebt die
Aenderung ihn, und was daran unsicher blieb. Eine Pruefung, die auf diesem Rechner nicht lief,
gehoert ebenfalls hierher — nicht stillschweigend uebersprungen. Neueste Eintraege oben.

---

## 2026-09-09 (Runde 102) — neuer Auftrag; Info.plist Fotorechte

**Auftrag geaendert:** Die Aufteilung iOS-/App-Seite ist weg; diese Sitzung fuehrt und darf alles
aendern (`ios/`, `src/`, `docs/`, `tools/`, `tests/`). Oberflaechenfehler werden hier behoben. Die
Pruefpflicht (acht Durchgaenge vor jedem `src/`-Commit) liegt jetzt hier; Playwright + WebKit +
Chromium sind installiert (`npm i -D playwright`, `npx playwright install webkit chromium`).

### NSPhotoLibraryAddUsageDescription in Info.plist
- **Fehler:** Ohne den Eintrag stuerzt die App beim ersten „In Fotos sichern" ab, statt zu fragen
  (iOS verlangt fuer Schreibzugriff auf die Fotomediathek eine Zweckbeschreibung).
- **Aenderung:** `NSPhotoLibraryAddUsageDescription` in `ios/App/App/Info.plist` mit deutschem Text,
  der zum Datenschutzversprechen passt („Es wird nichts gelesen und nichts gesendet.").
- **Warum es behebt:** Der `PHPhotoLibrary`-Add-Zugriff findet die verlangte Beschreibung, der
  System-Dialog erscheint statt eines Absturzes. Verifiziert: Build SUCCEEDED. Unsicher: der echte
  Sichern-Ablauf haengt an der `Filesystem`/Foto-Bruecke in `src/js/19b-native.js` und wurde noch
  nicht end-to-end im Simulator ausgeloest.

## 2026-09-09 — iOS-Huelle startbar gemacht + Scroll-/Safe-Area-Darstellung korrigiert

### 1. Huelle startbar gemacht (nur iOS-Seite, kein `src/`)
- **Fehler:** `xcodebuild -list -workspace` meldete „There are no schemes in workspace App".
- **Ursache:** CocoaPods war nicht installiert, daher lief nie `pod install`; ohne das fehlt
  `ios/App/App.xcworkspace/contents.xcworkspacedata`, und der Workspace kennt kein Projekt/Schema.
- **Behebung:** CocoaPods per Homebrew, `pod install` (mit `LANG=en_US.UTF-8`), iOS-Huelle
  eingecheckt. Commit `55985c0`.

### 2. `dist/index.html` fehlt — betrifft die App-Seite  ⚠️
- **Fehler:** `npx cap sync ios` bricht ab mit „The web assets directory (./dist) must contain an
  index.html file". Damit bleibt `ios/App/App/public/` leer und der Xcode-Build scheitert.
- **Ursache:** `build.js` erzeugt nur `dist/lucenta.html`, Capacitor (`webDir: "dist"`) laedt aber
  zwingend `index.html`.
- **Behelf (Xcode-Seite):** nach jedem Build `cp dist/lucenta.html dist/index.html` vor dem Sync.
- **Bitte an die App-Seite:** `build.js` soll `dist/index.html` dauerhaft miterzeugen (oder ein
  Redirect anlegen). `npm run ios:sync` deckt das derzeit NICHT ab. Solange das fehlt, muss die
  Xcode-Seite es bei jedem Sync von Hand nachziehen.

### 3. Zwei WebKit-Scroll-/Safe-Area-Fehler — jetzt **nativ** in der Huelle geloest
- **Symptome (nur auf dem Geraet/WebKit, nicht im Chromium der Pruefungen):**
  (a) der per `position:sticky` gepinnte Kopf („Lucenta") wanderte beim Ueberscrollen mit;
  (b) oben, neben der Dynamic Island, erschien im Dunkelmodus ein heller Streifen.
- **Ursache:** der native `UIScrollView` der WKWebView. Sein Overscroll-Bounce verschiebt beim
  Ueberdehnen den ganzen Inhalt inkl. Sticky-Kopf und legt die helle WebView-Grundflaeche frei;
  zusaetzlich schob `ios.contentInset: "always"` (capacitor.config) den Inhalt unter die Safe Area.
- **Behebung (Huelle):** neue Unterklasse `ios/App/App/MainViewController.swift`
  (`bounces=false`, `contentInsetAdjustmentBehavior=.never`), im Main.storyboard als Klasse gesetzt,
  in `project.pbxproj` aufgenommen. Commit `55985c0`.
- **Bitte an die App-Seite:** Diese zwei Fehler sind **nativ** erledigt. Bitte **nicht** erneut in
  CSS „reparieren"; `overscroll-behavior` unterbindet den nativen Bounce ohnehin nicht.

### 4. Ausnahme: `src/` von der Xcode-Seite geaendert (auf ausdruecklichen Wunsch)  ⚠️
- **Datei:** `src/styles/00-grundlagen.css`, Commit `4d11e0c` (bewusst getrennt vom iOS-Commit).
- **Was:** `overscroll-behavior-y:none` auf `html`+`body`; `background:var(--paper)` zusaetzlich auf
  `html` (fuellt den Safe-Area-Streifen, scrollt nicht weg).
- **Warum getrennt:** damit die App-Seite es sauber uebernehmen oder zuruecknehmen kann.
- **Hinweis:** `background:var(--paper)` auf `html` ist weiterhin sinnvoll (statischer
  Safe-Area-Streifen). `overscroll-behavior-y:none` ist durch den nativen Fix (Punkt 3) inzwischen
  **redundant**, aber harmlos — kann bleiben oder weg. **Konfliktrisiko:** dieselbe Datei/Region.

### 5. App-Icon gesetzt (iOS-Seite)
- **Fehler:** Auf dem Homescreen erschien nicht das Lucenta-Icon, sondern das Capacitor-Standard.
- **Ursache:** `AppIcon.appiconset/AppIcon-512@2x.png` war noch das Template-Bild.
- **Behebung:** ersetzt durch `assets/icon/lucenta-icon-1024.png` (1024x1024, **ohne** Alpha —
  Apple lehnt Alpha ab; die Variante `-gerundet.png` hat Alpha und ist vorgerundet, daher NICHT
  genommen — iOS rundet selbst). Contents.json bleibt (Einzelbild „universal 1024").

### Gemeldet an die App-Seite (liegt in `src/`, nicht hier behoben)
Diese Punkte kamen als iOS-Rueckmeldung, gehoeren aber in `src/` und damit in die App-Sitzung:

- **Durchsichtiger Streifen ueber dem „Lucenta"-Balken.** Ueber der Kopfleiste sieht man den
  Seitenhintergrund (Sternenhimmel). Gewuenscht: die Kopfleiste direkt an die Unterkante der
  Dynamic Island ansetzen — d. h. `header.top` bis in den Safe-Area-Streifen ziehen
  (statt `top:calc(fokuslinie + env(safe-area-inset-top))` eher `top:0` + `padding-top:env(
  safe-area-inset-top)`), sodass Balkenflaeche inkl. der abgerundeten linken/rechten Ecke bis unter
  die Island reicht. Betrifft `src/styles/00-grundlagen.css` (#focusline / header.top).
- **Browser-/Web-Referenzen entfernen.** Es ist eine iOS-App; Inhalte wie „ueber das Teilen-Symbol
  zum Home-Bildschirm hinzufuegen" (PWA-Install-Hinweis) gehoeren raus, ebenso jede andere
  Browser-/Web-Formulierung. Kandidaten in `src/` suchen (z. B. „Home-Bildschirm", „installieren",
  „Browser", Teilen-Hinweise). Die Baupruefung `pruefeIphoneOnly` kennt bereits Desktop-Bezuege.
- **Natives Apple-Design.** Die Oberflaeche soll dem aktuellen iOS-Erscheinungsbild folgen; bislang
  kommen dem nur die On-/Off-Switches nahe. Groesserer Design-Umbau in `src/` — bewusst der
  App-Sitzung ueberlassen.

### Git / Sonstiges
- Zwei Commits auf `claude/lucenta-setup-browser-test-j6hn7f` gepusht (`4d11e0c`, `55985c0`).
- `origin` auf SSH umgestellt (`git@github.com:Akif9752/lucenta.git`), SSH-Key beim Konto hinterlegt.
- `package-lock.json` bewusst **nicht** committet (npm-Nebenprodukt, gehoert eher zur App-Seite).
</content>

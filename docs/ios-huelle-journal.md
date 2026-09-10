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

### Xcode-Warnungen bereinigt (Dritt-Pods + App-Target)
- **Fehler:** Xcode zeigte Warnungen: Capacitor Filesystem (ungenutzte Variablen), „[CP] Embed Pods
  Frameworks laeuft bei jedem Build", und `WKProcessPool` deprecated (CapacitorCordova-Header, iOS 15+).
- **Aenderung (`ios/App/Podfile` + `project.pbxproj`, alles iOS-Huelle, kein `src/`):**
  - `inhibit_all_warnings!` und `:disable_input_output_paths => false` (Letzteres schreibt die
    Output-Pfade zurueck -> „laeuft bei jedem Build" entfaellt).
  - `post_install` setzt auf **jedem Pod-Target** `GCC_WARN_INHIBIT_ALL_WARNINGS=YES`,
    `SWIFT_SUPPRESS_WARNINGS=YES`, `GCC_WARN_ABOUT_DEPRECATED_FUNCTIONS=NO` und haengt
    `-Xcc -Wno-deprecated-declarations` an `OTHER_SWIFT_FLAGS` (fuer die Swift-Pods, die den
    deprecated ObjC-Header importieren — `SWIFT_SUPPRESS_WARNINGS` deckt Clang-Importer-Diagnosen
    nicht ab).
  - Das **App-Target** (Debug+Release) bekam `-Xcc -Wno-deprecated-declarations` in
    `OTHER_SWIFT_FLAGS`. Das unterdrueckt **nur** Deprecations aus importierten C/ObjC-Headern, nicht
    unsere eigenen Swift-Warnungen.
- **Warum so:** Die Warnungen stammen ausnahmslos aus `node_modules` (Fremdcode, den man nicht
  patcht — beim naechsten `npm install` weg). Unterdruecken ist der dauerhafte Weg.
- **Ergebnis:** Sauberer Build ohne echte Warnungen. Uebrig bleibt nur die belanglose Build-Tool-Info
  „appintentsmetadataprocessor: No AppIntents.framework dependency found" — kein echter Warnhinweis
  im Issue-Navigator, nicht abstellbar (wir nutzen AppIntents nicht).
- **Nebeneffekt:** Mit `disable_input_output_paths=false` kann es nach dem Hinzufuegen eines neuen
  Cordova-Plugins noetig sein, einmal Product -> Clean Build Folder zu machen.

### Startluecke schwarz -> Papierfarbe (WKWebView-Hintergrund)
- **Fehler (vom Geraet gemeldet):** Beim Start ein paar Sekunden schwarz, dann erscheint die App.
- **Ursache:** Nicht die LaunchScreen (die zeigt das weisse Capacitor-Standard-Splashbild), sondern
  die Luecke danach: iOS zeigt bereits das App-Fenster mit der WKWebView, die die ~1,5-MB-Ein-Datei
  samt eingebetteter Schriften aber noch nicht gezeichnet hat — eine ungemalte WKWebView ist im
  Dunkelmodus schwarz.
- **Aenderung (`MainViewController.swift`, nativ, kein `src/`):** `view`, `webView` und dessen
  `scrollView` bekommen eine **dynamische Papierfarbe** (hell #E4E6DB, dunkel #0F1613, passend zu
  `--paper`). Damit vergeht die Wartezeit in der Markenfarbe und geht nahtlos in die gezeichnete
  Seite ueber, statt als schwarze Luecke.
- **Warum es (nur) das behebt:** Die **Ladezeit** selbst bleibt — sie kommt aus der grossen
  Ein-Datei und dem Dekodieren der eingebetteten Schriften beim ersten Zeichnen. Ein Release-Build
  startet spuerbar schneller als der debug-signierte Xcode-Build. Wenn die Wartezeit weiter stoert,
  waere der naechste Schritt ein echter Splashscreen (@capacitor/splash-screen), der ein Marken-
  Logo haelt, bis die Seite bereit ist (braucht eine `SplashScreen.hide()`-Anbindung im JS).
- **Geprueft:** Build SUCCEEDED. Am Geraet zu bestaetigen (Simulator an dem Tag defekt).

### #3 natives Apple-Design, Schritt 1: Kopfleiste als Liquid Glass (iOS 26)
- **Ziel:** Die Oberflaeche ans aktuelle iOS-Aussehen angleichen. Laut Apple-HIG ist Liquid Glass die
  **funktionale Navigations-/Steuerungs-Schicht**, die ueber dem Inhalt schwebt: durchscheinend, mit
  Unschaerfe, Inhalt scheint durch — „regular"-Variante (blur + Helligkeitsanpassung) fuer Lesbarkeit.
- **Aenderung (`src/styles/00-grundlagen.css`):** `header.top` bekommt statt des volldeckenden
  Marken-Verlaufs einen **durchscheinenden** Verlauf (color-mix 74 % Marke + transparent) plus
  `backdrop-filter: blur(20px) saturate(160%)` (mit `-webkit-`). Bewusst recht deckend (74 %), damit
  die Wortmarke den Kontrast haelt. Fallbacks: bei fehlendem `backdrop-filter` (`@supports not`) und
  bei `@media (prefers-reduced-transparency: reduce)` faellt die Leiste auf den volldeckenden Verlauf
  zurueck — genau wie die HIG es fuer „Transparenz reduzieren" verlangt.
- **Warum es passt:** Nur die Navigations-Schicht (Kopfleiste) bekommt Glass, nicht der Inhalt; das
  entspricht der HIG-Regel „Don't use Liquid Glass in the content layer". Der Sternenhimmel/Inhalt
  scheint beim Scrollen weichgezeichnet durch die Leiste.
- **Geprueft:** alle acht Pruefungen bestanden — **fehlersuche (Kontrast) KEINE FUNDE**, pruef-nativ
  27/27. In Playwright-WebKit ist `backdrop-filter` aktiv (blur(20px) saturate(1.6)), Wortmarke
  lesbar, keine Konsolenfehler.
- **Unsicher:** Der iOS-**Simulator** war an dem Tag defekt (reinschwarze Screenshots ueber mehrere
  Starts) — am echten Geraet nicht gegengeprueft. **Bitte am iPhone ansehen:** die Kopfleiste sollte
  leicht durchscheinend/blurred wirken und Inhalt beim Scrollen sichtbar dahinter durchscheinen.
- **Naechste Schritte #3 (offen):** Schublade und Dialoge als Glass (gleiche Behandlung), danach die
  Bedienelemente (Knoepfe/Segmentwaehler/Schalter/Listen) ans iOS-Aussehen; Primaeraktion ggf. als
  getoentes „prominent"-Glass.

### Browser-/Web-Referenz entfernt: „Zum Home-Bildschirm hinzufügen"-Hinweis (a2hs)
- **Fehler:** In der nativen App erschien nach dem ersten abgeschlossenen Test der Banner „Lucenta
  lässt sich zum Home-Bildschirm hinzufügen … über das Teilen-Symbol". Das ist ein reiner
  PWA-/Browser-Hinweis und in einer App-Store-App sinnlos (sie IST bereits installiert). Er wurde
  gezeigt, weil `isStandalone()` in der Capacitor-WKWebView false liefert.
- **Aenderung:** Das a2hs-Feature komplett entfernt — Markup `#a2hsHint` (index.body.html), die
  Logik `syncA2hsHint()/isStandalone()/isFramed()/a2hsDismissed()` samt Aufruf (02-state.js), der
  Dismiss-Handler und der Reset-Eintrag `lucenta_a2hs_hidden` (21-beta-rueckmeldung.js), die CSS
  `.a2hs-hint/.a2hs-dismiss` (08-formulare + Sammelselektoren in 10-druckzustaende), die zugehoerige
  Testreihe (tests/guest_test.js) und die zwei i18n-Keys `lucenta_lässt_sich_zum_homeb` +
  `aria_hinweis_ausblenden` in allen acht Sprachen.
- **Warum es behebt:** Der Banner existiert nicht mehr; keine „Home-Bildschirm/Teilen-Symbol"-
  Formulierung mehr in der Oberflaeche.
- **Geprueft:** Alle acht Pruefungen bestanden (tests 11 Reihen, i18n, diff-sprachen, pruef-store,
  pruef-bewegung, pruef-nativ 27/27, fehlersuche KEINE FUNDE); der gebaute Build rendert in
  Playwright-WebKit vollstaendig ohne Konsolenfehler; `dist/index.html` == `dist/lucenta.html`.
- **Unsicher / offen:** Der iOS-**Simulator** war an diesem Tag unzuverlässig — die App startete, zeigte
  aber ueber mehrere Reinstalls/Reboots hinweg mal schwarz, mal nur den Paper-Hintergrund ohne
  Inhalt. Da derselbe Build in Playwright-WebKit sauber rendert und die reale Geraete-App zuvor lief,
  werte ich das als Simulator-/CoreSimulator-Zustand, nicht als Regression. **Bitte am echten iPhone
  bestaetigen**, dass die Startseite normal erscheint und der Home-Bildschirm-Hinweis weg ist.

### Web-Texte im Datenschutz an die App angepasst (Inhaber gab „nur iOS-App" frei)
- **Fehler:** `datenschutz` und `erinnerung_nur_app` beschrieben eine Website: Sektion „Aufruf der
  Seite" (Hoster `{{hoster}}`, IP-Adresse, Browserkennung, Art. 6 DSGVO), Loeschen ueber
  „Einstellungen → Apps → Safari → Website-Daten", und „Mitteilungen … nicht im Browser". Fuer eine
  App-Store-App ohne Server ist das unzutreffend.
- **Entscheidung:** Der Inhaber bestaetigte: keine Web-Version mehr, Wortlaut vorab freigegeben.
- **Aenderung:** (1) Sektion „Aufruf der Seite" komplett entfernt (kein Server, kein Seitenabruf,
  keine Hoster-Protokolle). (2) Loeschanweisung → „… oder indem du Lucenta vom Gerät löschst".
  (3) `erinnerung_nur_app` in allen acht Sprachen ohne Browser-Bezug neu („Tägliche Erinnerungen
  sind auf diesem Gerät nicht verfügbar." + Uebersetzungen). (4) `hoster` aus den Impressum-
  Pflichtfeldern und aus `IMPRESSUM` in `src/js/17-settings.js` entfernt — ohne Server gibt es
  keinen Hoster, sonst haette die Einstellungen-Ansicht das Impressum faelschlich als „unvollstaendig"
  gemeldet. `datenschutz` ist real nur in de/en/tr uebersetzt; es/fr/it/ja/pt tragen denselben
  englischen Text — die englische Aenderung deckt sie mit ab.
- **Warum es behebt:** Die Angaben stimmen jetzt fuer die App (keine Server-Protokolle; Loeschung
  ueber App-Entfernung bzw. den In-App-Reset). Keine „Safari/{{hoster}}"-Reste (geprueft: 0).
- **Geprueft:** alle acht Pruefungen bestanden (audit_i18n, diff-sprachen, fehlersuche KEINE FUNDE,
  pruef-nativ 27/27 u.a.). **Unsicher:** die juristische Verantwortung fuer den Wortlaut liegt beim
  Inhaber (vorab freigegeben); die Uebersetzung der zwei geaenderten Saetze stammt von mir.

### Haptik auf dem iPhone (native Taptic Engine statt navigator.vibrate)
- **Fehler:** Auf dem echten iPhone kam beim Antippen im Fragebogen keine haptische Rueckmeldung.
- **Ursache:** `tapFeedback()` in `src/js/11-rendering.js` rief nur `navigator.vibrate(8)`. iOS-
  WKWebView/Safari kennt `navigator.vibrate` nicht — der Aufruf laeuft ins Leere. (Der Kommentar an
  der Stelle sagte genau das voraus: wirkungslos „bis die App als Capacitor-Huelle laeuft".)
- **Aenderung:** `@capacitor/haptics` installiert (Pod `CapacitorHaptics`, jetzt 5 iOS-Plugins).
  `tapFeedback()` ruft in der nativen Huelle `window.Capacitor.Plugins.Haptics.impact({style:'LIGHT'})`
  ueber die vorhandenen Helfer `nativVorhanden()`/`nativModul()` (geteilte IIFE, hoisted).
  `navigator.vibrate(8)` bleibt Fallback fuer Browser/Android-Web.
- **Warum es behebt:** Der native Taptic-Aufruf wirkt in der WKWebView, wo `navigator.vibrate`
  gar nicht existiert; der Impuls kommt jetzt aus der Taptic Engine.
- **Geprueft:** Achtfach-Pruefung komplett bestanden (fehlersuche KEINE FUNDE, pruef-nativ 27/27);
  Simulator-Build mit neuem Pod SUCCEEDED. **Unsicher:** Ob es sich richtig anfuehlt, laesst sich
  nur am Geraet fuehlen (Simulator/Playwright spueren nichts) — bitte auf dem iPhone gegenpruefen.
- **Randnotiz:** `npm i` hat Playwright mitaktualisiert; die Browser mussten per
  `npx playwright install chromium webkit` neu geladen werden, sonst brach `diff-sprachen` ab
  („Executable doesn't exist"). Fuer die naechste Sitzung im Blick behalten.

### Kopfleiste an die Dynamic Island angesetzt (durchsichtiger Streifen weg)
- **Fehler:** Ueber dem „Lucenta"-Balken war ein Streifen frei, in dem der Seitenhintergrund
  durchschien (im Dunkelmodus der Sternenhimmel); die Leiste hing nicht an der Dynamic Island.
- **Ursache:** `header.top` klebte bei `top:calc(var(--fokuslinie-hoehe) + env(safe-area-inset-top))`,
  begann also erst UNTER dem Safe-Area-Streifen. Der Streifen (0..inset-top) gehoerte damit keinem
  Balken und zeigte, was dahinter lag.
- **Aenderung (`src/styles/00-grundlagen.css`):** `header.top` auf `top:0`; der fruehere Versatz
  steckt jetzt in der oberen Polsterung `padding-top:calc(16px + var(--fokuslinie-hoehe) +
  env(safe-area-inset-top))`. Damit fuellt die Balkenflaeche (der Verlauf) den Streifen nahtlos bis
  unter die Island, der Inhalt (Wortmarke) sitzt darunter. Die Fortschrittslinie `#focusline` von
  z-index 30 auf 31 gehoben, damit sie ueber der jetzt bis zur Island reichenden Leiste sichtbar
  bleibt statt dahinter zu verschwinden.
- **Warum es behebt:** Der Balken beginnt jetzt am oberen Rand; es gibt keinen unbemalten Streifen
  mehr, in dem der Hintergrund durchscheinen koennte.
- **Geprueft:** iOS-Simulator (iPhone 17 Pro), Landing in **hell und dunkel** — Balken sitzt an der
  Island, kein Durchscheinen. Quiz-Fortschrittsbalken in Playwright-WebKit sichtbar (z-index 31,
  Fuellung 12 %). Achtfach-Pruefung komplett bestanden (fehlersuche: KEINE FUNDE, 13 Konfigs).
- **Unsicher:** Die **Quiz**-Ansicht mit echter Island habe ich im Simulator nicht getippt
  (`simctl` kann nicht tippen); dort ist die Fortschrittslinie nur logisch/ueber Playwright belegt,
  nicht per Screenshot mit Safe Area.

### Ergebnisseite + Bericht auf WebKit geprueft (Strahlenkranz dunkel, Silbentrennung)
- **Auftrag:** pruefen, ob Ergebnisseite und Bericht im Dunkelmodus auf WebKit stimmen — beides war
  im Chromium eingestellt und auf WebKit nie gesehen.
- **Wie geprueft:** Playwright mit **WebKit-Engine** (nicht Chromium), Viewport 393×852@3, colorScheme
  dark, `dist/lucenta.html` ueber den lokalen Server auf 8017. Ergebnis per `localStorage`
  (`lucenta_result` O74/C56/E63/A70/S48 + Profil) geseedet, dann ueber `#btnStart`
  („Dein Ergebnis ansehen") in `#view-result` navigiert; oben + abgescrollt Screenshots.
- **Befund:** sieht korrekt aus. Der Strahlenkranz-Glow hinter dem Titel rendert im Dunkelmodus
  sauber und kraeftig, keine Artefakte/Kanten. Radar-Pentagon, die fuenf Dimensionskarten, der
  ausfuehrliche Bericht (Im Alltag/In Beziehungen/Wachstumsimpuls) und die Kompatibilitaets-Karte
  brechen nicht. Silbentrennung greift und ist plausibel begrenzt (z. B. „Brei-te" am Zeilenende),
  keine falschen oder haesslichen Trennungen gesehen.
- **Was unsicher blieb:** Playwright-WebKit ist die Safari-Engine, **nicht** 1:1 die iOS-WKWebView
  im Simulator. Der Simulator ist der Endrichter, aber `xcrun simctl` kann nicht tippen — die
  Ergebnisseite dort per Skript anzusteuern geht nicht; ein manueller Klick waere noetig. Ausserdem
  pruefen Screenshots die **Drehung** des Strahlenkranzes (@property) nicht — Standbilder zeigen nur,
  dass nichts bricht, nicht dass die Animation laeuft.

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

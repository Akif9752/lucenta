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

### Startzeit gemessen: Debug 7,6 s vs. Release 3,4 s — und woher die gelben Meldungen kommen
- **Gemeldet:** „gibt es hier wieder paar gelbe meldungen und sie braucht zu lange beim starten."
- **Gelbe Meldungen — gemessen, nicht geraten.** Der Build hat **keine** Warnungen (sauberer Build:
  leer), und Xcodes Issue-Navigator ist leer (`XcodeListNavigatorIssues`: 0). Die gelben Zeilen
  stehen in der **Konsole** und kommen fast alle aus der **Simulator-Runtime**, nicht aus unserem
  Code:
  - `Networking process took 4.54 seconds to launch` / `WebContent process took 4.15 s` /
    `GPU process took 3.05 s` — WebKit-Hilfsprozesse, im Simulator notorisch langsam (als `fault`
    geloggt, daher auffaellig).
  - Dutzende `cfprefsd … Couldn't open … No such file or directory` (fehlende Preference-Dateien in
    der Simulator-Runtime) und `UIKBRenderingLog …` (Tastatur-Rendering) — beides
    Simulator-Interna, nicht abstellbar.
  - **Ein echter Fund:** `⚡️ JS Eval error A JavaScript exception occurred` beim Laden. Die App
    laeuft trotzdem durch (`WebView loaded` -> `To Native -> SplashScreen hide` -> Startseite), und
    weder `pruef-nativ` (27/27, Capacitor nachgestellt) noch Playwright-WebKit zeigen einen
    Seitenfehler. Verdacht: Capacitors eigenes Bridge-Injection-Timing. **Offen** — genauer
    lokalisieren braucht den Safari-Web-Inspector am laufenden Simulator (Safari -> Entwickler ->
    Simulator -> index.html).
- **Startzeit gemessen** (Zeit von `simctl launch` bis die Startseite gezeichnet ist, iPhone 18 Pro,
  iOS 27.0, je nach Neuinstallation):
  - **Debug: 7,6 s**
  - **Release: 3,4 s**
  Der Debug-Build ist also **mehr als doppelt so langsam** — und `⌘R` in Xcode baut Debug. Das
  erklaert den Eindruck „zu lange"; die Fassung, die im App Store landet, ist die schnelle.
  Vom Rest geht ein grosser Teil auf den WebKit-Prozessstart (3–4,5 s laut Log), der im Simulator
  deutlich langsamer ist als auf dem Geraet.
- **Was das fuer weitere Optimierung heisst:** Die frueheren Micro-Fixes (Sternenhimmel verzoegern)
  waren gegen diese Groessenordnungen wirkungslos, wie damals schon vermerkt. Der naechste echte
  Hebel waere, die **240 KB base64-Schriften** aus der HTML in eigene Dateien zu loesen (der Parser
  muss sie sonst inline dekodieren) — das beruehrt aber `build.js`, das „eine einzige Datei"-Prinzip
  und alle acht Pruefungen. Vorher lohnt die Messung am **echten Geraet** im Release-Build.

### Blackscreen beim Start: iOS 27 verlangt den Scene-Lifecycle  ⚠️ WICHTIG
- **Fehler:** „die app haengt und zeigt nur blackscreen beim oeffnen." Die App startete und war
  Sekunden spaeter weg (Prozess nicht mehr gelistet).
- **Diagnose:** Kein JS-Fehler in der Konsole -> nativer Absturz. Der Crash-Report
  (`~/Library/Logs/DiagnosticReports/App-*.ips`) zeigte `EXC_BREAKPOINT` / `SIGTRAP` und als
  oberster Frame: **`__UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`**.
- **Ursache:** Die Capacitor-Vorlage startet im **alten App-Lifecycle** (`UIMainStoryboardFile`,
  kein Scene-Manifest, kein SceneDelegate). **Ab iOS 27 bricht UIKit so eine App beim Start
  absichtlich ab.** Das fiel 100 Runden nicht auf, weil der Simulator auf iOS **26.5** lief — erst
  seit die 26.5-Runtime geloescht ist (nur noch 27.0), stirbt die App. Auf dem iPhone des Inhabers
  (iOS 26) lief sie deshalb noch.
- **Aenderung (zwei Teile, beides noetig):**
  1. `Info.plist`: `UIApplicationSceneManifest` mit einer einzigen Fenster-Szene
     (`UIApplicationSupportsMultipleScenes=false`), `UISceneStoryboardFile=Main` und
     `UISceneDelegateClassName=$(PRODUCT_MODULE_NAME).SceneDelegate`. `UIMainStoryboardFile` bleibt
     als Rueckfall fuer aeltere iOS-Fassungen.
  2. Neu `ios/App/App/SceneDelegate.swift` (in `project.pbxproj` aufgenommen): legt das Fenster zur
     Szene an, setzt den Anfangs-Controller aus `Main.storyboard` (unseren `MainViewController`) ein
     und macht es sichtbar.
  **Das Manifest allein genuegt nicht** — damit startete die App zwar (kein Crash mehr), aber der
  Bildschirm blieb **schwarz**, weil niemand das Fenster erzeugt. Genau so beobachtet.
- **Bewusst nicht angefasst:** Capacitors `ApplicationDelegateProxy` (URL-Aufrufe, Universal Links)
  bleibt im `AppDelegate`; in Capacitor 6 haengen diese Aufrufe dort, und sie zusaetzlich im
  SceneDelegate zu bedienen wuerde sie doppelt ausloesen. Kommt Deep-Linking dazu, gehoert es in
  `scene(_:openURLContexts:)` und `scene(_:continue:)`.
- **Geprueft:** BUILD SUCCEEDED; App laeuft im iPhone-18-Pro-Simulator (iOS 27.0) stabil weiter und
  zeigt die Startseite mit der Glass-Kopfleiste an der Dynamic Island. **Falle:** Ein erneutes
  `npx cap add ios` wuerde Info.plist und SceneDelegate verlieren — dann beides neu anlegen.

### Mac/Simulator hingen, mobilecal stuerzte ab — Spotlight + Simulator-Erstboot
Gemeldet: „mobilecal stuerzt staendig ab, der simulator haengt, mein gesamter mac haengt auch."
Gemessen (leichtgewichtig, um die Last nicht zu erhoehen):

**1. Spotlight-Sturm — teils vom Projekt verursacht, behoben.** Spitzenlast: `corespotlightd` 92 %,
`mds_stores` 27 %, `spotlightknowledged` 8 %, Xcode 79 %. Spotlight indexierte den Projektordner:
`node_modules` + `ios/App/Pods` (zehntausende kleine Dateien), `dist/` und `public/` (je eine
1,5-MB-HTML mit 240 KB base64 in sehr langen Zeilen), `DerivedData` (schreibt bei jedem Build
tausende Dateien neu). Behebung: `.metadata_never_index` in diesen Ordnern — ohne sudo, ohne
Loeschen, umkehrbar. **Wirkung gemessen:** corespotlightd/mds_stores/Siri AI aus der Top-Liste
verschwunden, Xcode 79 % -> 22 %, Load 3,75. Als `tools/mac_entlasten.mjs` + `npm run mac:entlasten`
festgehalten, weil die Ordner gitignored sind und die Marker nach `npm install`/`pod install`/
frischem Checkout fehlen wuerden.

**2. mobilecal-Abstuerze + Simulator-Haenger: Simulator-Erstboot, kein Projektfehler.** Nur **ein**
mobilecal-Crash-Report vorhanden (kein Crash-Loop). Beim ersten Start eines frisch zurueckgesetzten
Simulators fahren Dutzende System-Apps gleichzeitig hoch; gemessen waehrend des Boots:
`KaleidoscopePoster` 99 %, `PassbookWidgetsExtension` 60 %, `PhotosReliveWidget` 59 %, `NewsTag` 58 %
— alles Simulator-interne Widgets. Unter der Last stuerzen einzelne System-Apps ab. Legt sich nach
einigen Minuten.

**3. Platte war knapp (88 % belegt).** Die alte **iOS-26.5-Runtime belegte 16 GB**, obwohl die zu
Xcode 26.6 passende iOS 27.0 installiert war. Nach Rueckfrage beim Inhaber geloescht; Geraete
21 -> 11 (weniger CoreSimulator-/Xcode-Discovery-Last). **Folge fuer die Pruefungen: Das Standard-
Simulatorziel ist jetzt `iPhone 17` (iOS 27.0, id E9AC672C-…), nicht mehr iPhone 17 Pro (26.5).**
Build dagegen verifiziert: SUCCEEDED ohne Warnungen (Deployment Target 15.0 deckt beides).

**Nicht vom Projekt und nicht behebbar:** `Siri AI` (95 %) und `appstoreagent` (95 %) sind
macOS-Systemdienste. Dagegen hilft nur ein Neustart des Macs — dem Inhaber so gesagt.

### Xcode/Simulator hingen — vier Ursachen, alle projektseitig  ⚠️ WICHTIG
Gemeldet: „Xcode und der Simulator haengen sehr stark." Gemessen statt geraten (keine Streu-Prozesse,
kein gebooteter Simulator, 69 % Speicher frei, aber Xcode dauerhaft ~17 % CPU). Vier Funde:

**1. Xcodes „Update to recommended settings" hatte das Projekt gebrochen.** Beim Einrichten der
Signierung in der GUI wurden zwei Werte gesetzt, die ein CocoaPods-/Capacitor-Projekt zerlegen:
- `IPHONEOS_DEPLOYMENT_TARGET = 27.0` im App-Target (Projekt-Ebene + Podfile sagten 13.0). Alle
  Simulator-Geraete laufen auf iOS 26.5 -> **kein** Ziel passte mehr; jeder Build/Start lief in eine
  unloesbare Ziel-Auflaesung. Nebenwirkung: Die App haette nur auf iOS 27+ installiert werden koennen.
- `ENABLE_USER_SCRIPT_SANDBOXING = YES`. Die CocoaPods-Skriptphase darf damit nicht schreiben
  (`Sandbox: rsync deny file-write-create … Capacitor.framework`) -> Build bricht ab.
**Lehre: In Xcode bei diesem Projekt NICHT „Update to recommended settings" akzeptieren.**

**2. Deployment Target 13.0 ist fuer Xcode 26 zu alt** („range of supported deployment target
versions is 15.0 to 27.0.x"). Jetzt ueberall konsistent **15.0**: Podfile, alle vier
pbxproj-Konfigurationen, und im `post_install` auch fuer die Pod-Targets — die Capacitor-Podspecs
deklarieren 13.0, und CocoaPods nimmt den Podspec-Wert, nicht die Podfile-Plattform.

**3. Die 1,5-MB-Seite lag ZWEIMAL im App-Bundle.** `dist/` traegt `lucenta.html` (Name, auf den alle
Werkzeuge zeigen) und `index.html` (Name, den Capacitor laedt); `cap sync` kopiert `dist/`
vollstaendig. Folge: 3,1 MB statt 1,5 MB im Bundle, jeder Build kopiert beide, jede Installation
schiebt beide — und **Xcode indexiert beide** (public/ ist ein Ordnerverweis im Projekt). Eine
1,5-MB-HTML mit 240 KB base64-Schriften in sehr langen Zeilen ist fuer den Indexer teuer, doppelt
doppelt so teuer. Behebung: neues `tools/ios_public_entschlacken.mjs` + `npm run ios:schlank`,
eingehaengt in `ios:sync` (nach dem Sync wird das Duplikat aus der Huelle entfernt; in `dist/` bleibt
es, dort brauchen es die Pruefungen).

**4. Der Simulator-Container war aufgeblaeht:** iPhone 17 Pro allein **2,4 GB** (die anderen 21
Geraete je 17 MB) — 1,4 GB davon in `data/private`. `simctl erase` -> 17 MB. Ausserdem
DerivedData 392 MB -> 20 MB (Projekt-Cache + ModuleCache, beides regenerierbar).

**Ergebnis:** Build SUCCEEDED ohne Warnungen, App-Bundle mit nur `index.html`, Simulator reagiert
wieder normal; App startet, Splash blendet weg, Startseite mit Glass-Kopfleiste an der Island.
Zugleich damit **verifiziert**: Splashscreen und Liquid-Glass-Kopfleiste funktionieren auf dem Geraet
(vorher nur in Playwright gesehen).

### Splashscreen: Marken-Ladebild bis die Seite bereit ist
- **Ziel:** Die Startluecke (paar Sekunden, bis die 1,5-MB-Seite gezeichnet ist) zu einem bewussten
  Marken-Ladebild machen statt einer leeren Flaeche.
- **Aenderung:**
  - `@capacitor/splash-screen` installiert (Pod `CapacitorSplashScreen`, jetzt 6 iOS-Plugins).
  - `capacitor.config.json` -> `plugins.SplashScreen`: `launchAutoHide:false` (Splash bleibt, bis das
    JS ihn ausblendet), `backgroundColor:#E4E6DB`, `showSpinner:false`.
  - Splash-Grafik neu: `Splash.imageset` traegt jetzt **erscheinungsabhaengige** Bilder
    (`splash-light.png` / `splash-dark.png`, 2732²) — Lucenta-Zeichen + „Lucenta" in der echten
    Fraunces-Schrift, zentriert auf Papierfarbe (hell/dunkel). Gerendert mit Playwright-WebKit aus
    der geladenen Seite, damit die Schrift exakt zur App passt. Das verbessert zugleich die
    System-LaunchScreen (nutzt dasselbe „Splash") -> nahtloser Uebergang, kein weisses Standardbild.
  - `src/js/21-beta-rueckmeldung.js`: am Ende von `init()` `SplashScreen.hide({fadeOutDuration:250})`
    nach zwei requestAnimationFrame (also nach dem ersten Bild), plus `setTimeout(…,4000)` als
    Sicherung, falls beim Kaltstart Bilder ausbleiben (sonst bliebe der Splash bei
    launchAutoHide:false stehen). Nur nativ; im Browser passiert nichts.
- **Warum es hilft:** Die Ladezeit selbst bleibt, aber sie wirkt jetzt wie ein bewusster
  Ladebildschirm statt einer schwarzen/leeren Luecke.
- **Geprueft:** alle acht Pruefungen bestanden (fehlersuche KEINE FUNDE, pruef-nativ 27/27);
  iOS-Build mit dem neuen Pod SUCCEEDED; beide Splash-PNGs visuell kontrolliert (markengetreu).
  **Am Geraet zu bestaetigen:** ⌘R — beim Start sollte das Lucenta-Logo als Ladebild stehen und
  weich in die App uebergehen (hell + dunkel).

### Aufraeumen Schritt 2: Sternenhimmel-Aufbau hinter das erste Bild (Micro-Opt)
- **Befund vorweg:** Die `@font-face`-Regeln haben schon `font-display:swap` — Schriften blockieren
  das erste Zeichnen nicht. Die mehrsekuendige Startzeit kommt aus WKWebView-Kaltstart + Parsen der
  1,5-MB-Datei + Debug-Build, nicht aus JS. Dem Inhaber offen gesagt; er wollte den sauberen
  Micro-Fix trotzdem.
- **Aenderung (`src/js/22-sternenhimmel.js`):** Der initiale `farbenLesen()/aufbauen()/pruefen()` +
  der 1-Sekunden-Takt laufen jetzt erst nach zwei `requestAnimationFrame` (also nach dem ersten
  Bild). `aufbauen()` baut mehrere Offscreen-Canvases (Wolken/Strahlen) — das konkurrierte bisher
  beim Parsen mit dem ersten Zeichnen der Startseite.
- **Ehrlich zum Effekt:** spart Millisekunden, gegen mehrere Sekunden Kaltstart **nicht fuehlbar**.
  Der echte Hebel bleibt der **Release-Build** und (gefuehlt) der **Splashscreen** (naechster Schritt).
- **Geprueft:** alle acht Pruefungen bestanden (u.a. pruef-bewegung, fehlersuche KEINE FUNDE). Am
  Geraet unkritisch, aber noch nicht gegengesehen.

### Aufraeumen Schritt 1: nachweislich toter Code entfernt (kosmetisch)
- **Auftrag:** Der Inhaber empfand die Dateien als zu lang/unuebersichtlich. Messung vorweg: nur 16 %
  der 1,5-MB-Datei sind Schriften; 84 % sind echter Inhalt (8 Sprachen, Figuren/Sternenhimmel-Code,
  bewusste Doku-Kommentare). Die Datei ist **nicht** aufgeblaeht; „Aufraeumen" bringt **kein** Tempo
  (Ladezeit = Parsen + Font-Dekodierung + Debug-Build). Ausdruecklich nur „sicherer toter Code".
- **Entfernt (10 nachweislich ungenutzte CSS-Klassen + 1 tote JS-Funktion):** `.theme-btn`,
  `.feedback-opt`/`.feedback-opts` (in Runde 97 entfernte Features), `.compat-legend`, `.compat-note`,
  `.code-note`, `.delta-head`, `.befund-grenze`, `.preview-tag`, `.ring-label`; JS-Funktion
  `figVerlauf` (nur definiert, nie aufgerufen). Verteilt ueber 7 CSS-Dateien + `13-figuren.js`.
- **Sicherheitsnachweis:** Jede Klasse gegen HTML **und** JS geprueft, inkl. dynamischer
  Zusammensetzung (`'hg-'+id`, `'role-tag-'+pole`, `'dot-'+…`). Was dynamisch gebaut wird, blieb
  unangetastet. Da die entfernten Selektoren auf **kein** Element passten, aendert das Entfernen
  optisch nichts.
- **Bewusst NICHT angefasst:** die ausfuehrlichen „Runde X"-Kommentare (Projektwissen, laut CLAUDE.md
  gewollt) und die i18n-Schluessel (136 wirkten „ungenutzt", sind aber groesstenteils dynamisch
  ueber `tx(var)` referenziert — automatisches Loeschen waere gefaehrlich).
- **Geprueft:** alle acht Pruefungen bestanden (tests 11 Reihen, audit_i18n, diff-sprachen,
  pruef-store, pruef-bewegung, pruef-nativ 27/27, fehlersuche KEINE FUNDE).

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

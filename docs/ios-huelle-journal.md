# Journal der Xcode-/iOS-Sitzung

Dieses Journal fuehrt die **fuehrende Sitzung** (Xcode/Mac). Seit Runde 102 ist es der **Bericht an
den Inhaber**, nicht mehr die Uebergabe an eine zweite Sitzung: was war der Fehler, warum behebt die
Aenderung ihn, und was daran unsicher blieb. Eine Pruefung, die auf diesem Rechner nicht lief,
gehoert ebenfalls hierher — nicht stillschweigend uebersprungen. Neueste Eintraege oben.

---

## ÜBERGABE an die naechste Sitzung (Stand 2026-09-19, nach Runde 111)

**Lies NUR diesen Block.** Er ist so geschrieben, dass er allein genuegt; die Eintraege darunter
sind Begruendungen zum Nachschlagen, keine Pflichtlektuere. Dazu `tools/xcode-CLAUDE.md` (liegt als
`ios/App/CLAUDE.md` neben der `.xcodeproj` und wird von Xcode ohnehin geladen) und die `CLAUDE.md`
im Wurzelverzeichnis.

### Der laufende Auftrag

Der Inhaber hat eine **Rueckmeldungsliste mit 18 Punkten in acht Gruppen** vorgelegt. Die
Reihenfolge ist mit ihm **abgesprochen** („ja guter vorschlag so"): erst die kleinen Ursachen, dann
Zeichnen/Achse, dann das Grosse. Runde 107 hat Punkte 1–6 erledigt, **Runde 108 die fuenf
Gestaltungspunkte aus Batch 3** (Aussagen-Box, Fragebogen-Hintergrund, Verlauf, Archetypen,
Uebergaenge).

**Runde 109 hat die drei zurueckgestellten Punkte umgesetzt** — auf ausdrueckliche Ansage des
Inhabers („die drei punkte"): Doppeltipp-Zoom, Textmarkierung, ein Teilformat. Der Abschnitt „Was
nur der Inhaber entscheiden kann" ist entsprechend kuerzer geworden; was dort noch steht, steht
dort weiter aus gutem Grund.

**Runde 110 hat Punkt 7 („Fluessigkeit") geklaert, und zwar negativ:** Der im Journal seit Runde
103 genannte „groesste Hebel", der Release-Bau, traegt nicht — `ArchiveAction` ist ohnehin Release,
und die Oberflaeche laeuft in einem eigenen WebKit-Prozess, den unsere Kompilierung nicht beruehrt.
Gemessen wurde stattdessen (`npm run mess-fluessigkeit`, neu): auf dem Hauptfaden **kein einziges
ausgefallenes Bild**. Die Glas-Frage bleibt offen und ist **nur am Geraet** zu beantworten.

**Der naechste Schritt ist eine Frage, keine Aufgabe** — siehe „Was als Naechstes zu tun ist".

Eine Bitte des Inhabers stand ueber Runde 107 und gilt weiter: **nichts stillschweigend
gegen eine dokumentierte Entscheidung aendern.** Sie ist nicht dadurch erledigt, dass er drei
solche Punkte freigegeben hat — sie ist genau der Grund, warum er gefragt wurde.

### Was als Naechstes zu tun ist

Offen ist **eine Frage an den Inhaber** und **eine Messung am Geraet**. Kein Stilblatt-Auftrag:

1. **Punkt 6, „die App insgesamt visuell verschoenern"** — der Sammelpunkt der Liste. Ohne eine
   engere Frage nicht messbar abzuarbeiten. Die konkrete Frage an den Inhaber lautet: **welche
   Ansicht stoert am meisten?** Vorschlag aus dem Stand der Arbeit: die **Ergebnisseite** — sie ist
   die laengste (acht Bildschirme), traegt die meisten Karten, und sie ist die einzige, die jemand
   jemandem zeigt. Fragen, nicht raten.
2. **Punkt 7, Fluessigkeit — der „Release-Hebel" aus Runde 103 traegt NICHT.** Runde 110 hat ihn
   nachgeprueft: `ArchiveAction` steht auf **Release**, der ausgelieferte Bau ist also laengst
   die Release-Fassung; nur die Run-Aktion ist Debug, und die sieht kein Nutzer. Und die
   Oberflaeche laeuft in einer WKWebView in einem **eigenen Prozess** — wie der Swift-Wirt
   kompiliert wurde, beruehrt WebKits Rendering gar nicht. **Bitte nicht erneut verfolgen.**
   Gemessen ist stattdessen der Hauptfaden (`npm run mess-fluessigkeit`, neu): **kein einziges
   ausgefallenes Bild** in drei Szenen. Offen bleibt allein die **Glas-Frage** (20px
   `backdrop-filter` der Schublade), und die ist auf diesem Rechner **prinzipiell nicht messbar** —
   headless WebKit legt GPU-Kosten nicht auf die rAF-Zeitachse, nachgewiesen mit einer Eichprobe,
   die jetzt im Werkzeug steckt. Am Geraet beantwortet sie der Schalter **Bedienhilfen >
   Transparenz reduzieren** mit einem Finger (er schaltet seit Runde 106 nativ jeden
   `backdrop-filter` ab). Einzelheiten im Eintrag „Runde 110".
3. **Die Avatare sind in Runde 111 ueberarbeitet — das Urteil steht aus.** Auf Entscheidung
   des Inhabers strukturell statt malerisch: Kopf von 67 auf 56 % der Bildhoehe, sichtbarer
   Hals, Ohren die herausragen, Augenneigung je Figur, Nasenruecken. Die zwoelf Tiere sind
   **unberuehrt**, weil sie tragen. Ob es reicht, sagt nur er, und zwar am Geraet.
   **Falls die Rueckmeldung ein FUENFTES Mal kommt:** nicht wieder diese Konstruktion
   nachschleifen. Dann bleiben die zwei Wege, die er in Runde 111 nicht gewaehlt hat —
   Menschen streichen und nur Tiere anbieten, oder von Hand gezeichnete Figuren.

**Es gibt keinen „Rest der Liste" dahinter.** Ein frueherer Stand dieser Uebergabe versprach einen,
und das war falsch — nachgezaehlt gehen die 18 Punkte vollstaendig auf: 2 waren schon vorher
erledigt (Overscroll, Impressum), 6 in Runde 107, 5 in Runde 108, **3 in Runde 109 auf Ansage des
Inhabers** (Zoom, Textmarkierung, ein Teilformat), **Punkt 7 in Runde 110 geklaert** (der Hebel
trug nicht), **die Avatare in Runde 111** (auf seine Entscheidung: Menschen strukturell, Tiere
unberuehrt). Offen bleibt genau **einer**: Punkt 6, und der ist eine Frage an ihn, keine Aufgabe.

Die **woertliche Liste liegt nicht im Repository** — nur ihre Auswertung in den Eintraegen 107 und
108. Wer sie braucht, muss den Inhaber danach fragen; aus dem Journal laesst sie sich nicht
rekonstruieren. (Das ist eine Luecke und keine Absicht: Beim naechsten Mal gehoert eine solche
Liste woertlich nach `docs/`, bevor daran gearbeitet wird.)

Was in Runde 108 an Zahlen gemessen wurde, steht im Eintrag „Runde 108" weiter unten — die Werte
nicht neu erheben, sondern dort nachlesen.

**Zu den Avataren, weil hier lange etwas anderes stand:** „Zu unrealistisch" kam viermal. Runde
87, 94 und 97/99 haben je etwas Richtiges behoben — schwebenden Kopf, flaechige Farben, fehlendes
Licht, Iris als Scheibe, Mund als Strich — und **alle drei am Rendering**. Runde 111 hat zuerst
hingesehen statt nachgeschliffen und den Bruch benannt: **Die zwoelf Tiere tragen, die zehn
Menschen nicht**, weil ein Tierkopf rund ist, keinen Hals zeigt und grosse Ohren hat. Die
Konstruktion war nie das Problem; die Proportion war es — Kopf auf 67 % der Bildhoehe, und darin
kein Platz fuer einen Hals.

Die Lehre, die hier dreimal bezahlt wurde, lautet damit genauer als bisher: **nicht „ein vierter
Anlauf an derselben Konstruktion bringt dasselbe", sondern „ein vierter Anlauf auf derselben
ACHSE bringt dasselbe".** Rendering war dreimal die falsche Achse. Was offen bleibt, steht als
Punkt 3 oben.

### Was Runde 109 erledigt hat — nicht erneut anfassen

Die drei Punkte stehen oben unter „Was nur der Inhaber entscheiden kann", weil sie dort seit
Runde 107 standen. Dazu drei Dinge, die sonst Arbeit kosten:

1. **`touch-action` und `user-select` stehen jetzt an der WURZEL**, nicht mehr auf den
   Bedienelementen. Die drei Zeilen dort sind entfernt; `button, summary, .scale-btn, …` traegt nur
   noch `-webkit-tap-highlight-color`. Wer eine der beiden Eigenschaften sucht, sucht bei `html{}`.
2. **Der Formatwaehler des Ergebnisbildes ist weg** — Markup, zwei CSS-Regeln, Verdrahtung,
   `aria-checked`-Nachziehen und **drei i18n-Schluessel in allen acht Paketen**. Die vertikale
   Zentrierung im Canvas ist ebenfalls heraus, weil sie jetzt immer 0 waere.
3. **Zwei Fallen dieser Art sind an zwei Tagen zweimal zugeschlagen:** `input, textarea` beim
   `user-select` war wirkungslos (der Browser erzwingt `text` auf editierbaren Elementen), so wie
   `q-enter` in Runde 108 wirkungslos war (von `11-feier.css` ersetzt). **Vor dem Aendern einer
   CSS-Regel pruefen, ob sie ueberhaupt greift** — das Stilblatt ist in 13 Teile zerlegt, die
   spaeteren ueberschreiben die frueheren bewusst, und der Browser hat eigene Vorgaben.

`pruef-app` ist dadurch von 20 auf **25** Pruefungen gewachsen, `tests/share_test.js` von 22 auf
15 (drei Abschnitte zum Story-Format sind entfallen, dafuer sind die Masse des einen Formats jetzt
Zahlen in der Reihe).

### Was Runde 108 erledigt hat — nicht erneut anfassen

Ausfuehrlich mit allen Zahlen im Eintrag „Runde 108"; hier nur, was man wissen muss, um nicht
dasselbe zweimal zu suchen.

1. **Die Aussagen-Box sitzt hoeher.** Nicht durch Abschalten der Zentrierung, sondern durch zwei
   leere Flexglieder in `.quiz-body`, die den freien Platz 1:2,4 verteilen. Bei 320px bleibt alles
   Bildpunkt fuer Bildpunkt wie vorher, weil ein Glied mit Basis 0 dort von selbst 0 wird.
2. **Der Fragebogen hat einen Hintergrund:** dieselbe Flaeche wie die Startseite, aber als
   **Standbild** (`html.sternen-still`, opacity .6). Die alte Begruendung („kein Canvas nebenher
   bei fuenfzig Fragen") bleibt damit gewahrt. Der Takt haengt an den Ansichtskennungen in
   `ANSICHTEN`/`BEWEGTE_ANSICHT` und wird von einem `MutationObserver` auf dem `class`-Attribut
   sofort umgestellt — der Sekundentakt ist nur noch das Netz.
   **Zwei Fallen, beide bezahlt:** „still" und „gedaempft" sind **zwei** Groessen (sonst dimmt
   `prefers-reduced-motion` die Startseite mit), und ein Literal wie `'bewegt'` bricht
   `audit_i18n.py` — deshalb Ansichtskennungen statt eigener Taktnamen.
3. **Der Verlauf im Profil** ist ueberarbeitet, eingegrenzt auf `#historyContent`: Datum ueber
   Titel, beide linksbuendig, Dimensionsmarke rechts, Pol als Kante links, jueungster Eintrag
   hervorgehoben; die Trendkurve traegt neben dem Stand die Veraenderung. `.history-row` selbst ist
   **unveraendert** — die Klasse traegt auch Vergleichsarchiv und Tagesform.
4. **Der Archetypen-Bereich hat jetzt Gruppen** (fuenf Dimensionen mit je zwei Polen) statt zehn
   gleicher Karten in einer Reihe. 80 Kombinationen wie vorher.
5. **Die Uebergaenge sind groesser, aber nicht weiter:** `rise`, `view-vor` und `view-zurueck`
   kommen zusaetzlich mit 4 % aus der Tiefe. Die Strecke bleibt 16px — mehr gibt die Polsterung
   nicht her. Dauer und Kurve bleiben .45s.
   **Wichtig:** `q-enter` in `02-quiz.css` **greift nicht**, `11-feier.css` ersetzt es durch
   `q-schub`. Der Fragewechsel ist seit Runde 69 gross; dort ist nichts zu tun.

**Vier neue Messungen sind dauerhaft in `tools/pruef_bewegung.mjs`**, drei davon gegen den
nachgestellten alten Zustand gegengeprueft (sie schlagen dort fehl): Startseite bewegt sich /
steht bei reduzierter Bewegung still und bleibt voll da, Fragebogen-Hintergrund ist da und steht
still, Aussagen-Box im oberen Drittel.

**`tools/renderer/run_*.js` wurde bewusst NICHT nachgezogen** und enthaelt jetzt veraltete Kopien
von `renderHistory()` und `renderArchetypeGroups()`. Der Renderer steht in keiner der neun
Pruefungen und erklaert sich in seiner eigenen `LIESMICH.md` als ueberfluessig, sobald ein echter
Browser da ist.

### Was Runde 107 erledigt hat — nicht erneut anfassen

1. **Benachrichtigungen folgen dem Farbmodus.** `.toast` trug `--ink`/`--paper`, also die
   **Umkehrung** des Modus; jetzt eine Karte wie jede andere, mit Rand und Schatten statt
   Umkehrung (`src/styles/09-archetypen.css`).
2. **Alle fuenf Antwortoptionen sind beschriftet**, in allen acht Sprachen. Die Zeile laeuft von
   `space-between` auf `flex:1` mit denselben 8px wie die Knopfreihe — nur so steht jede
   Beschriftung unter IHREM Knopf. Texte kurz, weil bei 320px je Spalte 49,6px bleiben (gemessen);
   der volle Wortlaut steht weiter im `aria-label`.
3. **Der Ladebildschirm ist 32 % statt 82 % der Bildschirmbreite.** Die Wurzelansicht WAR der
   `UIImageView` mit `aspectFill` auf einem 2732er Quadrat. Jetzt traegt eine `UIView` den
   Hintergrund (neue Farbe `Papier.colorset`), das Bild liegt mittig mit `aspectFit` bei 0,85 der
   Ansichtsbreite. Auf SE/17/Pro Max identisch nachgemessen.
   **Zwei Dinge daran muss man wissen:** `@capacitor/splash-screen` zeichnet **nicht selbst**,
   sondern instanziert dasselbe `LaunchScreen.storyboard` (`buildViews()` in
   `node_modules/@capacitor/splash-screen/ios/Sources/SplashScreenPlugin/SplashScreen.swift`) —
   eine Aenderung wirkt an beiden Stellen. Und `plugins.SplashScreen.backgroundColor` ist aus
   `capacitor.config.json` **entfernt**: eine feste Hellfarbe, die das Plugin auf die Wurzelansicht
   setzt und die im Dunkelmodus jetzt sichtbar falsch waere.
4. **Das geteilte Bild laeuft in Fraunces**, nicht mehr in Georgia (`SHARE_SERIF` in
   `src/js/10-ergebnisbild.js`). Gewicht 600 statt 700, weil Fraunces das Band 400–600 traegt;
   Mincho im Rueckfall, weil Fraunces nur Latin fuehrt.
5. **Die Tagesform-Kurve zeichnet sich von links nach rechts ein**, bei jedem Wechsel des
   Zeitraums. `stroke-dasharray`/`dashoffset`, Laenge gerechnet (Polygonzug = Summe der Strecken),
   als `--vl-laenge` am `<svg>`; beide Reihen benutzen die laengere der zwei Laengen.
   **Die Klasse `vl-zeichnet` setzt JS**, nicht das Stilblatt — `@media (prefers-reduced-motion)`
   kennt den Schalter IN der App nicht, der in `localStorage` liegt. `prefersReducedMotion()` fragt
   beide; dasselbe Muster tragen `.qcard.q-in` und `pulseFocusline()`.
6. **Die x-Achse nennt vier echte Datumsangaben** an gerechneten Stellen (`verlaufAchseHTML()` in
   `src/js/08-code.js`, absichtlich direkt neben `verlaufDiagrammSVG()`, damit die
   Geometriekonstanten nicht doppelt stehen). Dafuer teilen Diagramm und Achse jetzt eine Spalte
   (`.verlauf-spalte`): Die Achse lag als Geschwister unter `.verlauf-flaeche` und war um die
   Breite der 1-bis-5-Skala breiter als das Diagramm — gemessen 14,3px Versatz je Marke.
   `js_vor_tagen` und `js_tagen` sind damit in allen acht Paketen verwaist und entfernt.
7. **Zwei erledigte Punkte der Liste, die schon vorher standen** — bitte nicht erneut suchen:
   Der Overscroll-Bounce ist nativ abgeschaltet (`ios/App/App/MainViewController.swift`, `bounces = false`).
   Und das Impressum steht **nicht** „auf vielen Seiten ganz unten": Es gibt im ganzen Dokument
   genau **einen** `<footer class="appfoot">` (`src/index.body.html:248`), und der liegt nur in
   `view-result`.

**Drei neue Pruefungen sind dauerhaft im Repository**, alle gegengeprueft (sie schlagen fehl, wenn
man den alten Zustand nachstellt):

- `suchSkalaVersatz` in `tools/fehlersuche.mjs` — vergleicht Mittelpunkte von Antwortknopf und
  Beschriftung paarweise, meldet leere/ausgeblendete/aus der Spalte laufende Beschriftungen.
- `suchAchseVersatz` in `tools/fehlersuche.mjs` — fragt zuerst, ob die Achse dieselbe Flaeche deckt
  wie das Diagramm, dann je Marke leer/ragt heraus/klebt an der Nachbarin.
- drei Messungen in `tools/pruef_bewegung.mjs` — schieben 60 Tage und Lucenta+ unter (der
  Fragebogen legt keine Tagesform-Eintraege an, der Zeitraumwaehler steht nur in der gekauften
  Fassung), wechseln den Zeitraum und lesen den Versatz bei 80/300/1300 ms, in beiden Durchlaeufen.

### Was frueher erledigt wurde — auch nicht erneut anfassen

- **„Transparenz reduzieren" ist nativ nachgebaut** (Runde 106) und am Simulator in beide
  Richtungen nachgemessen. `ios/App/App/MainViewController.swift` liest
  `UIAccessibility.isReduceTransparencyEnabled` und setzt `data-transparenz="reduziert"` an
  `:root` — vor dem ersten Zeichnen ueber ein `WKUserScript`, danach bei jeder Aenderung und bei
  jedem `didBecomeActive`. Grund: WebKit auf iOS 27 kennt `prefers-reduced-transparency` **gar
  nicht** (am Geraet gemessen: `reduce` UND `no-preference` melden beide `false`). Jede Regel fuer
  diesen Fall steht deshalb **zweimal** im Stilblatt, und `pruefeTransparenzTueren` in `build.js`
  bricht den Bau ab, wenn nur eine der beiden geaendert wird.
- **Der `JS Eval error` beim Kaltstart ist geklaert** (Runde 104) und **kein Fehler von uns**:
  Capacitor feuert ein `resume`-Ereignis in einen WebView, der noch bei 10 % laedt. Upstream,
  harmlos, im Release-Bau nicht sichtbar. **Bitte nicht erneut suchen.**
- **Liquid Glass** Schritt 2 und 3 (Runde 103/104): Schublade 82 %, Bild- und Plus-Fenster 86 %;
  Glas **nur beim Druecken** an den drei Schaltern und am Segmentwaehler, mit Rueckfaellen. Kein
  Glas im Ruhezustand.
- **Sprachpakete aufgeteilt** (Runde 103): App-Fassung 932 -> 394 KB, Deutsch eingebettet, sieben
  Pakete in `dist/sprachen/` ueber `SPRACHQUELLEN` in `src/js/01-sprachpakete.js`.
- **Kein Querformat, kein iPad** (Runde 103): nur `Portrait`, `TARGETED_DEVICE_FAMILY = 1`,
  `arm64`.
- **Die StoreKit-Bruecke steht** (`ios/App/App/LucentaKaeufePlugin.swift`), und die zwei Stellen,
  die das Abo verschenkten, sind zu. Angemeldet in `MainViewController.capacitorDidLoad()` —
  **nie** in `capacitor.config.json`, die ist erzeugt.

### Stand der Pruefungen

`npm run pruef-alles` nach Runde 109: **ALLE 9 BESTANDEN** (9,2 Minuten), `fehlersuche` KEINE FUNDE
auf **beiden** Motoren, `pruef-nativ` 45/45, `pruef-app` **25/25**, `pruef-store` 32/32,
`pruef-bewegung` beide Durchlaeufe einschliesslich der vier Messungen aus Runde 108,
`tests` alle 11 Reihen. Nach Runde 108 dasselbe Bild (9,4 Minuten, `pruef-app` damals 20/20).
`diff-sprachen` 130
verdaechtige Zeilen (127 in Runde 105–107; die drei neuen sind **keine** neuen Texte, sondern die
drei Zeilen, in denen `verlaufZeileHTML()` jetzt Markup zusammensetzt — `diff-sprachen` ist ein
Bericht, kein Bestanden/Durchgefallen).

**iOS-Bau: SUCCEEDED** (Runde 108 und 109). Unter `ios/` wurde in beiden Runden nichts von Hand
geaendert — alle Aenderungen liegen in `src/`, `tools/`, `tests/` und `docs/`. Gelaufen ist
trotzdem jedes Mal `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npm run ios:sync`, damit
`ios/App/public/` nicht auf dem alten Stand stehen bleibt, und danach ein Bau.

**Nachgeprueft am gebauten Bundle**, nicht an der Quelle — der Bau laeuft in unter einer Sekunde
durch, was fuer sich genommen auch „nichts kopiert" heissen koennte. In
`DerivedData/.../App.app/public/index.html`: `sternen-still` und `arch-gruppe` vorhanden
(Runde 108), `touch-action:manipulation` vorhanden und `img-format` wie `h:1920` **nicht mehr**
vorhanden (Runde 109).

**Der erste Sammellauf der Runde 108 ist NICHT durchgegangen** (30 Funde, alle derselbe
Kontrastfehler an einem neu eingefuehrten Element). Das gehoert hierher, weil es der eigentliche
Wert des Sammellaufs ist: Der Fehler war im Stilblatt nicht zu sehen, weil die Farbe die
dokumentiert richtige war — nur der Untergrund ein anderer. Einzelheiten im Eintrag „Runde 108".

**Eine Lehre aus dieser Runde, die Zeit spart:** Ein Sammellauf ist an einem Klick-Timeout in
`diff-sprachen` gestorben — bei 22547 s fuer `fehlersuche` statt der ueblichen ~300 s. Das war eine
**ausgehungerte Maschine**, kein Logikfehler; einzeln nachgefahren lief es durch. Also
`pruef-alles` **nicht** parallel zu anderer schwerer Arbeit starten. Ein knapp gemessener Fund ist
ein falscher Fund — hier war es ein knapp gemessener Abbruch.

**Zwei Fallen beim Werkzeug, beide in Runde 107 bezahlt:**

- `npm run ios:sync` bricht hier in CocoaPods ab („Unicode Normalization not appropriate for
  ASCII-8BIT"), wenn das Gebietsschema fehlt. Also:
  `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npm run ios:sync`.
- Ein Kommentar **vor** `<document>` in einem Storyboard laesst Interface Builder den Dateityp
  nicht mehr erkennen („can't determine the type… may be due to a missing SDK") — er muss
  **hinein**. Und ein XML-Kommentar darf kein `--` enthalten, was bei einem Projekt, das seine
  CSS-Marken mit zwei Strichen benennt, sofort zuschlaegt.

### Was nur der Inhaber entscheiden kann

**Die drei Punkte, die dokumentierten Entscheidungen widersprachen, sind in Runde 109 umgesetzt** —
auf ausdrueckliche Ansage des Inhabers. Einzelheiten im Eintrag „Runde 109"; kurz, weil es die
Punkte sind, die am ehesten „zurueckreparieren" wird, wer die Begruendung nicht kennt:

- **Doppeltipp-Zoom ist abgeschaltet, das Aufziehen NICHT.** `touch-action:manipulation` an der
  Wurzel schaltet genau die eine Geste ab. Der Viewport in `index.head.html` ist **unveraendert**
  und muss es bleiben: `user-scalable=no` waere WCAG 1.4.4 und ist ausdruecklich **nicht**
  bestellt. `pruef-app` schlaegt fehl, wenn es doch hineingeraet.
- **Fliesstext ist nicht mehr markierbar**, mit **einer** Ausnahme: dem eigenen Code (`#myCode`).
  Sein Verlust ist endgueltig, und der Kopierknopf ist ein Weg, nicht der einzige. Fuer
  Eingabefelder steht bewusst KEINE Regel — der Browser erzwingt dort `text`, das war gemessen.
- **Es gibt genau EIN Teilbild-Format: 1080x1350 (4:5).** Warum, steht bei `SHARE_FORMAT` in
  `src/js/10-ergebnisbild.js`. Die Masse stehen als Zahlen in `tests/share_test.js` — eine
  Rueckkehr zu 9:16 laesst also nicht stillschweigend die Komposition verrutschen.

**Offen und weiter beim Inhaber** — die Geschmacksfrage aus Punkt 8: Soll der **eine**
Fusszeilen-Link „Impressum & Datenschutz" auf der Ergebnisseite bleiben, wo es den zentralen Zugang
in den Einstellungen ohnehin gibt? Runde 109 hat ihn **gelassen** (Begruendung im Eintrag); zu
entfernen waere er in einer Zeile.

**Und was nur am Geraet oder mit einem Konto geht:**

- **Die zwei Abo-Produkte in App Store Connect anlegen:** `lucenta.plus.monat` (4,99 EUR) und
  `lucenta.plus.jahr` (29,99 EUR), **genau so geschrieben**, in **derselben** Abo-Gruppe. Ohne das
  findet `Product.products(for:)` nichts, und **ein echter Kauf ist noch nie gelaufen**. Belegt ist
  der Weg bis in StoreKit hinein, nicht der Kauf selbst.
- **Lokal testen geht trotzdem:** `ios/App/App/Lucenta.storekit` traegt beide Produkte, das Schema
  verweist per Pfad darauf. Greift **nur beim Start aus Xcode**, und ob der Pfad aufloest, ist
  **ungeprueft**. Im Zweifel: Product > Scheme > Edit > Run > Options > StoreKit Configuration.
- **Die App auf einem echten iPhone** (freie Apple-ID genuegt, 7-Tage-Signatur).
- **Der Druckzustand mit einem echten Finger** (Runde 105): Die Regel greift auf WebKit
  nachweislich; offen ist nur, ob iOS sie bei einem echten kurzen Tipp zeigt. Mit synthetischen
  Beruehrungen ist das grundsaetzlich nicht messbar.
- **Die vier Stellen aus Runde 107 ansehen** — sie sind gerechnet und gemessen, aber nicht
  beurteilt: Sind **32 %** beim Startbild richtig (der Wert steht als **eine** Zahl im Storyboard,
  `multiplier="0.85"`)? Sagt die neue Toast-Flaeche noch deutlich „Hinweis" (falls nicht: der
  naechste Hebel ist ein Akzentpunkt links im Text, **nicht** die Umkehrung zurueck)? Sieht ein
  echt geteiltes Bild in Fraunces gut aus? Und sitzen die vier Datumsangaben auf dem Geraet
  angenehm oder gedraengt?
- **Die fuenf Stellen aus Runde 108 beurteilen.** Sie sind gerechnet, gemessen und im Bild
  angesehen — aber ein Geschmacksurteil steht noch aus:
  1. Sitzt die **Aussagen-Box** bei 29 % der freien Hoehe richtig, oder noch hoeher? Der Wert steht
     als **eine** Zahl im Stilblatt (`flex:2.4 0 0` bei `.quiz-body::after`); 1,5 waere tiefer,
     4 waere fast oben.
  2. Ist der **Hintergrund im Fragebogen** bei opacity .6 zu praesent oder zu leise? Die
     Sonnenstrahlen sind im oberen Drittel gut zu sehen — auf dem Bild sieht das richtig aus, am
     Geraet beim tatsaechlichen Beantworten von fuenfzig Fragen ist es eine andere Frage.
  3. Sagt die neue **Verlaufszeile** auf Anhieb, welcher Eintrag der jueungste ist? Die
     Hervorhebung ist `--surface-2` plus 15px statt 13,5px — bewusst leise, und damit an der
     Grenze zu unsichtbar.
  4. Traegt die **Gruppenueberschrift** im Archetypen-Bereich genug? Sie ist 11px Mono in
     `--muted` mit einer Linie dahinter; der Abstand (26px gegen 12px) traegt die Trennung mit.
  5. Sind die **Uebergaenge** mit 4 % Tiefe jetzt „groesser und auffaelliger" genug? Weiter als
     16px geht nicht, ohne den gemessenen Ueberhang zu erzeugen — wenn es noch zu klein wirkt, ist
     der naechste Hebel **Dauer** (.45s), und die kostet Wartezeit in den Pruefungen.
- **„Transparenz reduzieren" mit einem echten Finger** (Runde 106): Der ganze Weg ist am Simulator
  gemessen; was ein Geraet hinzufuegt, ist nur das Urteil, ob die deckende Kopfleiste neben der
  Dynamic Island gut aussieht.
- **Das Urteil zu zwei Aenderungen aus Runde 103:** Startet die App spuerbar schneller
  (Sprachaufteilung)? Sieht jemand mit anderer Sprache beim Start kurz Deutsch? Faehrt die
  Schublade mit dem `backdrop-filter` noch geschmeidig ein?
- Der Rest der Einreichung steht in `docs/app-store-start.md` (Datenschutz-URL, Support-Adresse,
  Markenrecherche, Bildschirmfotos hochladen).

### Arbeitsweise, die Kontingent spart (vom Inhaber ausdruecklich gewuenscht)

Lange Pruefläufe in **einem** Durchgang starten und nur das **Endergebnis** lesen, nicht im
Minutentakt den Zwischenstand abfragen. Bildschirmfotos sparsam: In Runde 103 liess sich die
Anmeldung der Kauf-Bruecke am Simulator vollstaendig ueber die **Bedienhilfen-Hierarchie als Text**
belegen (`DeviceInteractionSynthesize` liefert Pfade, kein Bild im Verlauf); in Runde 107 hat
`RunCodeSnippet` am instanzierten Storyboard die Splash-Geometrie auf drei Geraetegroessen
beantwortet, ebenfalls ohne ein einziges Bild. Grund: Jede Zwischenabfrage verarbeitet den ganzen
Verlauf erneut; beim Inhaber waren das 40–50 % des 5-Stunden-Kontingents.

Und die Lehre, die in Runde 107 zweimal Geld gekostet haette: **Eine neue Pruefung ohne Gegenprobe
ist eine Behauptung.** Beide neuen Funktionen wurden gegen den nachgestellten alten Zustand
geprueft. Dabei ist die Gegenprobe selbst einmal ins Leere gelaufen — ein Inline-Override von
`--vl-laenge` wird beim Neuzeichnen des `<svg>` verworfen, die Probe „bestand" und hatte nichts
gemessen. Als Stylesheet ueberlebt sie es.

### Stand der Umgebung

Simulatorziel **iPhone 18 Pro** (iOS 27.0, id `B55215E2-9318-4732-9132-F2D7FFFC18EC`), die
iOS-26.5-Runtime ist geloescht. Deployment Target 15.0, `ENABLE_USER_SCRIPT_SANDBOXING = NO` — in
Xcode **nicht** „Update to recommended settings" akzeptieren, das hat beides schon einmal gebrochen.
`npm run mac:entlasten` nach jedem `npm install`/`pod install`, sonst indexiert Spotlight
`node_modules` und `Pods` und der Mac haengt. Xcode legt den Code eines Debug-Baus in
`App.debug.dylib`, nicht in `App` — wer dort nach einem Symbol sucht, findet nichts und zieht den
falschen Schluss (in Runde 103 genau so passiert).

Entwickelt wird auf `claude/lucenta-setup-browser-test-j6hn7f`. Kein Pull Request ohne
ausdrueckliche Bitte. Runde 111: `eea0f38` (die Avatare). Runde 110: `8d2b4a7` (Punkt 7,
Fluessigkeit). Runde 109: `3eb06f4` (die drei zurueckgestellten Punkte). Runde 108:
`7c49c74` (Batch 3, fuenf Punkte). Runde 107: `7eabcc0` (die vier kleinen Ursachen) und
`03f60b7` (Einzeichnen + Achse).
Der Arbeitsbaum ist sauber — bis auf `ios/App/App.xcworkspace/xcshareddata/`, das schon seit
mehreren Runden unversioniert dalag und absichtlich nicht mitcommittet wurde.

---

## Runde 111 — die Avatare, vierte Rueckmeldung, erste auf der richtigen Achse

Der Inhaber hat entschieden: **die zehn Menschenfiguren strukturell ueberarbeiten, die zwoelf
Tiere unberuehrt lassen.** Vorher stand der Befund, und der ist wichtiger als die Aenderung.

### Der Befund: die Tiere tragen, die Menschen nicht

Die vergroesserte Darstellung aller 22 Figuren nebeneinander zeigt einen Bruch, den die
Rueckmeldung „die Avatare sehen zu unrealistisch aus" nicht benennt: **Fuchs, Katze, Baer, Panda,
Hase, Reh, die beiden Hunde und die Eule funktionieren.** Die Lichtarbeit aus Runde 94 sieht man
ihnen an. Neben ihnen fallen die Menschen ab.

Und das erklaert, warum drei Ueberarbeitungen nichts geloest haben: **Runde 87, 94 und 97/99 haben
am RENDERING gearbeitet** — Licht, Verlaeufe, Iris mit Limbusring, Lippen mit Glanz, Nasenfluegel,
Ohrmuschel, Wangenroete ohne Kante. Jede einzelne Aenderung war richtig. Die Beschwerde betraf
aber die **Proportion**, und die hat keine von ihnen angefasst.

Das ist die Lehre „eine Messung kann sich auf die falsche Groesse beziehen" in ihrer teuersten
Form: Dreimal wurde etwas Richtiges verbessert, waehrend der sichtbare Fehler eine Ebene tiefer
lag. Bei Tieren faellt das nicht auf, weil ein Tierkopf rund ist, keinen Hals zeigt und grosse
Ohren hat — die Konstruktion passt zu ihnen. Bei Menschen passt sie nicht.

### Zwei Dinge waren gebaut und haben nie gewirkt

Das ist der eigentliche Fund der Runde, und beide waren im Quelltext unsichtbar:

**1. Der Hals aus Runde 99 war nie zu sehen.** Am Bildpunkt nachgemessen: Er lief von y=28,5 bis
35,45, das Kinn endete bei 35,1 — und das oberste Element in seiner Mitte (20 / 31) war der
**Kopfpfad**. Es gab sogar ZWEI Halsformen, eine in `figMensch` und eine in `figSchultern`, beide
vollstaendig hinter dem Gesicht. Zwoelf Runden lang stand im Kommentar, der Hals sei „der Grund,
warum die Figuren nicht mehr wie aufgesetzte Koepfe wirken".

**2. Die Ohren aus Runde 97 lagen unter der Sichtbarkeitsschwelle.** Sie ragten **0,95 Einheiten**
aus einem 23,9 Einheiten breiten Kopf — auf dem 96px-Avatar 2,3 Bildpunkte, im 52px-Waehler 1,2.
Samt Innenwindung und Laeppchen, die dort nie jemand gesehen hat.

Die gemeinsame Ursache: **Der Kopf war 26,9 von 40 Einheiten hoch, also 67 % des Bildes.** Das ist
keine Buestenansicht, sondern eine Chibi-Proportion — und fuer einen Hals ist darin schlicht kein
Platz.

### Was geaendert wurde

1. **Der Kopf ist eine eigene Gruppe und um 0,85 verkleinert** (`KOPFSKALA`). Der Faktor ist
   gerechnet: Kinn = 8,2 + (34,6 + `kopfL` − 8,2) · 0,85 ergibt ueber alle zehn Figuren **30,1 bis
   31,2**, also 2,2 bis 3,3 Einheiten Hals vor den Schultern bei 33,4. Der Kopf steht damit bei
   **56 % statt 67 %** der Hoehe. Drehpunkt oben (20 / 8,2), damit der Scheitel bleibt, wo er ist.
2. **Der Hals ist neu.** Der alte war ein Rechteck mit vier rechten Winkeln — folgenlos, solange
   ihn niemand sah, und ein Pflock, sobald er sichtbar wurde. Jetzt verbreitert er sich nach unten
   (der Trapezmuskel), traegt einen Verlauf quer (Licht von links wie ueberall) und einen
   Kinnschatten. Die doppelte Halsform in `figMensch` ist geloescht.
3. **Die Ohren ragen 2,2 Einheiten heraus** und folgen jetzt der Kopfbreite. Sie standen fest auf
   9,2 und 30,8, waehrend der Kopfrand mit `kopfB` zwischen 7,7 und 9,1 wandert — bei einem breiten
   Gesicht verschwand das Ohr damit fast, bei einem schmalen stand es frei.
4. **Die Augen haben eine Neigung je Figur** (−4 bis +7 Grad, spiegelbildlich). Bis hierher war
   jedes Auge dieselbe Ellipse; verschieden waren nur Groesse, Oeffnung und was darin stand. Der
   Winkel zwischen innerem und aeusserem Augenwinkel ist der groesste Formunterschied, den zwei
   Augenpaare haben koennen. Tiere geben keine Neigung mit und bleiben unveraendert.
5. **Die Nase hat einen Ruecken.** Sie hatte seit Runde 97 Fluegel, Loecher und einen Lichtpunkt
   auf der Spitze — also eine Spitze, aber keinen Ruecken, und sass als Gebilde mitten im Gesicht.
   Dazu kommt die helle Haelfte der Kante als schmaler Verlauf; die dunkle lieferte die vorhandene
   Schattenellipse.

**Der Schlagschatten auf die Schulter ist entfallen.** Er war fuer ein Kinn gerechnet, das
unmittelbar auf der Schulter auflag; mit einem Hals dazwischen hat der Kopf dort keinen Kontakt
mehr, und die Ellipse stand als grauer Fleck daneben. Was sie leisten sollte, leisten jetzt
Kinnschatten und Kragenschatten — beide naeher an ihrer Ursache.

### Ein Fehler unterwegs, im Bild sofort sichtbar und im Code nicht

Nach dem neuen Hals standen auf jeder Figur **zwei blasse Beulen links und rechts davon**. Der
Kinnschatten war eine Ellipse mit rx 4,3 auf einem Hals von 3,1 Halbbreite und quoll seitlich ins
Freie. Eine schmalere Ellipse haette diesen einen Fall behoben; stattdessen steht die Halsform
jetzt **einmal** da und dient zugleich als **Schablone** (`clipPath`) — das behebt auch den
naechsten Fall, in dem jemand den Hals schmaler oder den Schatten breiter macht.

### Die Pruefung, und die zwei Wege dorthin, die nicht getragen haben

Neu in `pruef-app` (jetzt **26** statt 25): **zwischen Kinn und Schulter bleibt Platz fuer einen
sichtbaren Hals, mindestens 1,5 Einheiten.** Gegengeprueft — im gesunden Zustand **2,34
Einheiten**, mit `KOPFSKALA = 1` nachgestellt **−1,7**.

Drei Wege wurden probiert, und die ersten zwei gehoeren ins Protokoll, damit sie niemand
wiederholt:

- **`getBoundingClientRect`** liefert fuer Knoten in einer skalierten SVG-Gruppe auf WebKit
  wiederholt **0**.
- **`elementFromPoint`** meldet an der Halsstelle die Formen, die DARUEBER liegen (Kinnschatten,
  Kopfsaum). Der Halspfad steht dort nie obenauf, obwohl der Hals klar zu sehen ist.
- **Ein Bildvergleich „mit und ohne Hals"** bestand die Gegenprobe **faelschlich**: Mit dem alten,
  verdeckten Hals blieb ein Rest der verbreiterten Unterkante sichtbar, und **zwei Byte**
  Unterschied genuegten dem Vergleich. „Das Bild aendert sich" ist ohne Schwelle keine Aussage —
  und das waere beinahe die zweite blinde Pruefung in drei Runden gewesen.

Getragen hat `getBBox` (reine Geometrie, unabhaengig vom Layout) plus der Massstab aus dem
`transform` der Kopfgruppe. Auch das erst im zweiten Anlauf: `parentNode` allein las den Massstab
als 1, weil `figSaum` eine eigene Gruppe dazwischenlegt — die Pruefung meldete den Fehler zuerst
auch im gesunden Zustand. Sie laeuft jetzt nach oben, bis sie ein `scale()` findet.

### Was offen bleibt

**Ob es diesmal reicht, kann nur der Inhaber sagen** — und zwar am Geraet, nicht an einem
Bildschirmfoto. Der Unterschied ist bei 62px im Waehler und 96px im Profil nachgesehen und traegt
dort; die Augenneigung und der Nasenruecken sind allerdings bei dieser Groesse fein, und ihr
Beitrag ist ehrlicherweise kleiner als der von Hals und Proportion.

Sollte die Rueckmeldung ein **fuenftes** Mal kommen, ist der naechste Schritt nicht wieder diese
Konstruktion. Dann bleiben die zwei Wege, die der Inhaber in dieser Runde nicht gewaehlt hat: die
Menschen streichen und nur Tiere anbieten, oder von Hand gezeichnete Figuren.

---

## Runde 110 — Punkt 7 „Fluessigkeit": die Behauptung im Journal war falsch

Punkt 7 der Rueckmeldungsliste lautete „Fluessigkeit", und das Journal nannte dazu seit Runde 103
einen Hebel: **„der groesste offene Hebel ist der Release-Bau statt Debug"**. Diese Runde hat ihn
nachgeprueft statt ihm zu folgen. Er traegt nicht, und zwar aus zwei unabhaengigen Gruenden.

### 1. Der ausgelieferte Bau ist laengst Release

Aus `App.xcodeproj/xcshareddata/xcschemes/App.xcscheme`, Aktion fuer Aktion ausgelesen:

| Aktion | Konfiguration |
|---|---|
| Launch (Cmd+R) | Debug |
| Test | Debug |
| Analyze | Debug |
| **Profile** | **Release** |
| **Archive** | **Release** |

**Archive ist Release.** Was in den App Store geht, ist also bereits die Release-Fassung — ganz
gleich, was die Run-Aktion macht. Der „Hebel" betraf nie die ausgelieferte App, sondern nur das,
was der Inhaber sieht, wenn er in Xcode auf Start drueckt. **Fuer Nutzer gibt es hier nichts zu
holen**, und der Punkt loest sich damit auf.

(Release baut auch durch — `xcodebuild -configuration Release` wurde in dieser Runde erstmals
ausgefuehrt: **BUILD SUCCEEDED**. Das war bis hierher unbelegt.)

### 2. Release kann die Oberflaeche gar nicht fluessiger machen

Der zweite Grund ist der grundsaetzlichere und gehoert aufgeschrieben, damit die Behauptung nicht
wiederkommt: **Lucenta zeichnet nichts in Swift.** Die ganze Oberflaeche laeuft in einer
`WKWebView`, und die rendert in einem **eigenen Prozess** (`com.apple.WebKit.WebContent`), den
Apple gebaut und optimiert hat. Wie der Swift-Wirt kompiliert wurde, hat auf WebKits Layout,
Zeichnen und JIT **keinen** Einfluss. Debug gegen Release beruehrt unseren eigenen Swift-Code
(`MainViewController`, die Kauf-Bruecke) und den von Capacitor — beides laeuft beim Start und bei
Bruecken-Aufrufen, nicht waehrend einer Animation.

### Also gemessen, wo Bilder wirklich verloren gehen

Neu im Repository: `tools/mess_fluessigkeit.mjs` (`npm run mess-fluessigkeit`). Es zeichnet auf
WebKit Bild fuer Bild die Abstaende zwischen `requestAnimationFrame` auf, waehrend eine Szene
laeuft, und misst jede Szene **zweimal** — einmal wie sie ist, einmal mit abgeschaltetem
Verdaechtigen.

**Der erste Lauf meldete fuer jede Szene Median 17,0ms, null lange Bilder und null Unterschied.**
Das sah nach „alles fluessig" aus. Es war „nicht gemessen", und dieser Unterschied ist der
eigentliche Ertrag der Runde. Die Eichung, die das aufgedeckt hat und jetzt **vor jedem Lauf
automatisch** mitlaeuft:

| Probe | Median | Bilder | Ergebnis |
|---|---|---|---|
| Ruhe | 17ms | 90 | Vergleichswert |
| Hauptfaden 25ms je Bild blockiert | **25ms** | **59** | wird gesehen |
| `blur(120px)` ganzseitig, animiert | 17ms | 90 | **wird NICHT gesehen** |
| `backdrop-filter: blur(200px)` | 17ms | 90 | **wird NICHT gesehen** |

Headless-WebKit legt die Kosten der **Zusammensetzung (GPU)** gar nicht auf die rAF-Zeitachse.
Daraus folgt hart: Das Werkzeug misst Arbeit auf dem **Hauptfaden** (Layout, JavaScript, die
Zeichenflaeche, DOM-Bau) und ist dort empfindlich — und es ist **blind fuer genau das**, was das
Journal als naechsten Hebel nannte, den 20px-`backdrop-filter` der Schublade. Das Werkzeug sagt
das jetzt selbst und weigert sich, fuer GPU-Szenen eine Aussage zu drucken; bricht die
Hauptfaden-Eichung, bricht es ganz ab.

**Das Ergebnis auf dem Hauptfaden, vier Durchlaeufe je Szene und Zustand:**

| Szene | Median | schlimmstes Bild | lange Bilder (>33ms) |
|---|---|---|---|
| Ansichtswechsel zu den Archetypen (10 Karten) | 17,0ms | 30ms | 0 / 333 |
| Fragebogen, eine Frage weiter | 17,0ms | 18ms | 0 / 192 |
| Startseite im Ruhezustand (Sternenhimmel laeuft) | 17,0ms | 20ms | 0 / 380 |

**Kein einziges ausgefallenes Bild.** Weder das Bauen der zehn Archetypen-Karten noch die
Zeichenflaeche des Sternenhimmels kostet messbar etwas. Die Oberflaeche ist nicht
hauptfaden-gebunden — und damit ist auch klar, dass die Stellschrauben, die eine JavaScript-Seite
ueblicherweise hat, hier nichts bringen.

### Was offen bleibt, und wie der Inhaber es in zehn Sekunden beantwortet

**Die Glas-Frage ist unbeantwortet.** Ob die 20px-Unschaerfe der Schublade auf einem echten iPhone
Bilder kostet, laesst sich auf diesem Rechner nicht messen — und eine Null aus einem blinden
Instrument ist kein Freispruch.

Dafuer braucht es kein neues Werkzeug: **Bedienhilfen > Transparenz reduzieren** schaltet seit
Runde 106 nativ jeden `backdrop-filter` der App ab (`MainViewController.swift` setzt
`data-transparenz="reduziert"`). Ein Finger, zwei Zustaende, derselbe Bildschirm. Faehrt die
Schublade mit dem Schalter spuerbar geschmeidiger ein, ist das Glas der Grund; faehlt sich kein
Unterschied an, ist die Frage erledigt.

**Und eine Kleinigkeit, die NICHT geaendert wurde, weil sie dem Inhaber gehoert:** Die Run-Aktion
des Schemas steht auf Debug. Wer in Xcode startet, sieht also nicht, was Nutzer sehen. Auf Release
umzustellen waere eine Zeile — kostet aber Haltepunkte und laengere Bauzeiten beim Entwickeln.
Das ist ein Tausch, keine Verbesserung, und deshalb seine Entscheidung.

### Ein Instrument, das nicht funktioniert hat — und warum es nicht im Repository liegt

Fuer die Startzeit (Debug gegen Release) war ein Skript gebaut, das
`xcrun simctl launch --console-pty` mitliest und auf Capacitors Fertig-Zeile wartet. Es lief in
jeden Zeitausgleich: **`--console-pty` liefert Capacitors Log nicht.** Die `⚡️`-Zeilen gehen ueber
`os_log` ins Unified Log, nicht auf stdout; auf stdout steht nur eine Cookie-Meldung und die PID.
Der richtige Weg waere `xcrun simctl spawn <id> log stream` mit einem Praedikat — nachgewiesen,
dass die WebKit-Ereignisse der App dort ankommen.

Weiterverfolgt wurde es **nicht**, weil die Frage sich vorher aufgeloest hat (Abschnitt 1: der
ausgelieferte Bau ist ohnehin Release). Das Skript ist geloescht statt halbfertig liegen zu
bleiben; wer die Startzeit doch einmal braucht, findet hier den Weg und die Falle.

---

## Runde 109 — die drei zurueckgestellten Punkte, auf Ansage des Inhabers

Diese drei Punkte lagen seit Runde 107 beim Inhaber, weil jeder einer **im Code begruendeten
Entscheidung** widersprach. Er hat sie ausdruecklich angefordert („die drei punkte"). Damit sind
sie umgesetzt — und weil das Journal der Bericht an ihn ist, steht hier bei jedem, was die alte
Begruendung war und was von ihr erhalten blieb.

### 1. Doppeltipp-Zoom abschalten — ohne das Aufziehen mitzunehmen

**Die alte Begruendung** stand in `index.head.html`: bewusst kein `maximum-scale`/`user-scalable=no`,
weil „Zoom zu unterbinden eine der haeufigsten Barrierefreiheits-Verfehlungen mobiler
Weboberflaechen" ist. Das ist keine Geschmacksfrage, sondern WCAG 1.4.4.

**Der Auftrag lautet aber nicht „Zoom abschalten", sondern „Doppeltipp-Zoom abschalten"** — und das
sind zwei verschiedene Gesten. `touch-action:manipulation` ist genau dafuer definiert: „Schieben
und Aufziehen erlaubt, zusaetzliche Gesten wie Doppeltipp-Zoom nicht." Der Viewport bleibt deshalb
**unveraendert**; Aufziehen mit zwei Fingern funktioniert weiter.

Die Regel steht an der **Wurzel**, nicht auf den Bedienelementen — dort stand sie seit Runde 60
schon, und genau deshalb war der Doppeltipp auf Fliesstext und Karten noch aktiv. `touch-action`
wird **nicht vererbt**; dass ein Wert an der Wurzel trotzdem ueberall wirkt, folgt daraus, dass die
erlaubte Geste der Durchschnitt der Werte bis zur Wurzel ist.

**Das ist genau die Sorte Annahme, die hier gemessen gehoert** — und sie wurde gemessen, weil der
Knopf gerechnet weiterhin `auto` meldet und damit aussieht wie eine Regression. Zwei schnelle
Beruehrungen, `visualViewport.scale` davor und danach, auf **beiden** Motoren:

| Ziel | scale vorher → nachher |
|---|---|
| Fliesstext (`.sub`) | 1 → 1 (kein Zoom) |
| Knopf (`#btnStart`) | 1 → 1 (kein Zoom) |

Die drei Zeilen, die vorher auf den Bedienelementen doppelt standen (`touch-action`,
`user-select`), sind dort **entfernt**. Zwei Stellen, die dasselbe sagen, driften auseinander,
sobald jemand eine davon aendert.

### 2. Textmarkierung unterbinden — mit einer Ausnahme, und einer, die es nicht braucht

**Die alte Begruendung:** `user-select:none` lag bewusst nur auf Bedienelementen, „Fliesstext
bleibt bewusst markierbar". Das Argument des Inhabers dagegen ist gut: Lucenta ist eine App, und in
einer iOS-App laesst sich Beschriftungstext nicht durch langes Druecken markieren. Die Lupe, die
beim Wischen ueber einer Aussage aufging, war das deutlichste verbliebene Zeichen „das hier ist
eine Webseite".

Die Regel steht jetzt an der Wurzel. Gemessen auf beiden Motoren: eine echte `Range` ueber den
Einleitungsabsatz ergibt **0 Zeichen**.

**Eine Ausnahme bleibt: der eigene Code.** Er ist die einzige Angabe der App, deren Verlust
endgueltig ist. Es gibt einen Kopierknopf daneben — aber wenn der einmal nicht greift, muss der
Code mit der Hand herauszuholen sein.

**Und eine Ausnahme, die ich zuerst falsch geschrieben hatte:** Die Regel lautete
`input, textarea, #myCode`. In der Gegenprobe — Ausnahme heraus, Wurzelregel behalten — blieb das
Namensfeld auf **beiden** Motoren markierbar, waehrend der Code sofort auf `none` fiel. Der Grund
steht in CSS-UI: Auf editierbaren Elementen ist der benutzte Wert von `user-select` immer `text`,
unabhaengig von der Vererbung. `input, textarea` war damit **wirkungslos** — dieselbe Falle wie
`q-enter` in Runde 108, nur einen Tag spaeter. Die Angabe ist heraus; dass Felder editierbar
bleiben, prueft `pruef-app` weiter, dort als **Ergebnis** und nicht als Regel.

Nachgemessen im Namensfeld, beide Motoren: tippen ergibt „Testname", markieren ergibt 8 Zeichen.

### 3. Auf EIN Teilformat einigen — geblieben ist 4:5

**Die alte Begruendung:** Beitrag 1080x1350 und Story 1080x1920 waren eine bewusste Wahl mit
Umschalter; Runde 27 nannte TikTok/Reels als Grund fuer 9:16. Wichtig fuer das Verstaendnis: Es war
**kein zweites Layout**, sondern dieselbe austarierte 1350er Komposition, im 1920er Bild vertikal
zentriert (`SHARE_LAYOUT_H = 1350`, gemessen 285px Leerraum oben und unten). Die Wahl war also eine
zwischen „ohne Leerraum" und „mit Leerraum".

**Geblieben ist 4:5**, und der Grund ist nicht Geschmack, sondern wie sich die Formate ausserhalb
ihres Zielorts verhalten:

- **4:5 in einer Story:** Die Plattform stellt es mittig auf einen eigenen Grund. Sieht
  absichtsvoll aus.
- **9:16 in Nachrichten, WhatsApp oder der Foto-Mediathek:** ein hohes Bild mit zwei leeren
  Baendern. Sieht nach Fehler aus.

Die Ziele der zweiten Art sind die haeufigeren — die Teilen-Leiste von iOS fuehrt zuerst dorthin.
Ein Format, das ueberall ordentlich aussieht, ist mehr wert als eines, das an einer Stelle exakt
passt und an den uebrigen auffaellt. **Sollte der Inhaber es anders sehen, ist es eine Zahl**
(`SHARE_FORMAT.h` in `src/js/10-ergebnisbild.js`) plus die Zentrierung, die dann wieder gebraucht
wird — die Testreihe sagt dann genau das.

Mitgegangen sind: der Segmentwaehler im Markup, seine zwei CSS-Regeln, die Verdrahtung in
`21-beta-rueckmeldung.js`, das Nachziehen der `aria-checked`-Zustaende in
`18-ergebnisbild-dialog.js`, **drei i18n-Schluessel in allen acht Paketen** (`beitrag`,
`story_amp_reel`, `aria_bildformat_wählen` — 24 Zeilen) und die vertikale Zentrierung im Canvas,
die jetzt immer 0 waere.

Die Formatkennung im Dateinamen (`lucenta-ergebnis-feed.png`) ist durch das **Datum** ersetzt —
dieselbe Form, die das Sichern in die Foto-Mediathek schon benutzt. Mit nur einem Format waere die
Kennung eine Angabe ohne Gegenstueck.

### Sechs neue Pruefungen, alle gegengeprueft

Fuenf in `tools/pruef_appfassung.mjs` (`pruef-app`, jetzt 25 statt 20) und drei geaenderte in
`tests/share_test.js`. Gegen den nachgestellten alten Zustand:

| Pruefung | gegen den alten Zustand |
|---|---|
| Wurzel traegt `touch-action:manipulation` | FEHL (`auto`) |
| Fliesstext laesst sich nicht markieren | FEHL (242 Zeichen auswaehlbar) |
| kein `user-scalable=no`, kein `maximum-scale` | FEHL |
| der eigene Code bleibt markierbar | FEHL (`none`), gegen „Ausnahme entfernt" |
| im Eingabefeld bleibt Markieren moeglich | besteht — misst eine Zusage des Browsers |
| Bild ist 1080x1350, ohne vertikalen Versatz | FEHL (3 von 15), gegen 1920 + Zentrierung |

Die Formatentscheidung steht damit als **Zahl in einer Testreihe** und nicht nur als Marke im
Quelltext. Das ist der Unterschied zwischen einer Entscheidung, die sich versehentlich
zurueckdrehen laesst, und einer, die dabei meckert.

Die Pruefung fuer das Eingabefeld ist die einzige, die im alten Zustand nicht fehlschlaegt, und sie
bleibt trotzdem: Sie misst eine Zusage, auf die sich das Stilblatt **verlaesst, ohne sie selbst
auszusprechen**.

### Was offen bleibt

Die Geschmacksfrage aus Punkt 8 ist **nicht** entschieden und liegt weiter beim Inhaber: Soll der
eine Fusszeilen-Link „Impressum & Datenschutz" auf der Ergebnisseite bleiben, wo es den zentralen
Zugang in den Einstellungen ohnehin gibt? Ich habe ihn **gelassen** — es gibt im ganzen Dokument
genau einen, er steht nur in `view-result`, und Erreichbarkeit eines Impressums ist der Fall, in
dem ein Link zu viel billiger ist als einer zu wenig. Zu entfernen waere er in einer Zeile
(`src/index.body.html`, `<footer class="appfoot">`).

---

## Runde 108 — Batch 3: die fuenf Gestaltungspunkte der Rueckmeldungsliste

Batch 3 stand in der Uebergabe mit Datei und Zeile. Fuenf der sieben Punkte hatten eine benennbare
Ursache und sind umgesetzt; zwei nicht — einer, weil er eine Frage an den Inhaber ist, einer, weil
er in Xcode entschieden wird und nicht im Stilblatt. Beide stehen unten mit Begruendung.

### 1. Die Aussagen-Box sass zu tief

**Der Fehler war nicht die Zentrierung, sondern ihre Gleichverteilung.** `justify-content:safe
center` legt den freien Platz zu gleichen Teilen ueber und unter den Fragenblock. Nachgemessen bei
390x844: **130px Leere ueber der Aussage und 130px darunter** — bei einem Blick, der von oben nach
unten laeuft, ist das oben zu viel.

Die Zentrierung bleibt richtig (die Begruendung dafuer steht seit vielen Runden in `02-quiz.css`:
bei kurzem Inhalt soll der Block nicht ins Leere laufen). Sie verteilt nur ungleich: **zwei leere
Flexglieder mit Basis 0 nehmen den freien Platz im Verhaeltnis 1:2,4 auf.** Gemessen danach:
**76px ueber / 183px unter, die Karte 54px hoeher** (305 -> 251px).

Warum keine Polsterung nach unten, die naheliegende Loesung: Die bleibt stehen, wenn kein freier
Platz da ist. Bei 320x568 bleiben rechnerisch rund 10px uebrig — 120px Polsterung waeren dort
120px Leerlauf mit Bildlauf. Ein Flexglied mit Basis 0 wird in dem Fall von selbst 0 hoch, und
genau das ist nachgemessen: **Bei 320x568 ist das Ergebnis Bildpunkt fuer Bildpunkt identisch mit
dem Zustand davor** (Karte bei 175px, kein zusaetzlicher Bildlauf).

Und eine Zahl, die ich zuerst falsch zugeordnet haette: Der Fragebogen **scrollt** bei 390x844 um
17px. Das ist **nicht neu** — in der Gegenprobe mit gleich grossen Gliedern stehen dieselben 17px.

### 2. Der Hintergrund des Fragebogens war leer

Er war nicht nur leer, sondern ein **Bruch**: Mit dem Antippen von „Test starten" verschwand die
Atmosphaere fuer fuenfzig Fragen. `22-sternenhimmel.js` haengt seit Runde 71 ausschliesslich an
`#view-landing`.

**Es liegt jetzt dieselbe Flaeche dort — als Standbild.** Ein einziges gezeichnetes Bild, danach
kein `requestAnimationFrame` mehr. Der Grund dafuer steht im Kopf derselben Datei und gilt
unveraendert: „Ein Fragebogen mit fuenfzig Fragen soll nicht nebenher ein Canvas zeichnen lassen."
Ein Standbild kostet nach dem Zeichnen nichts; es ist genau der Weg, den die Flaeche bei
`prefers-reduced-motion` ohnehin schon immer genommen hat. Neu ist nur, **wann** er gilt.

Warum dasselbe Bild und nicht eine zweite, eigene Gestaltung: Der Uebergang laesst die Atmosphaere
damit **stehen**, statt eine Gestaltung gegen eine andere zu tauschen — und es ist kein neuer Code,
sondern ein anderer Takt fuer den vorhandenen, einschliesslich Hell/Dunkel, Staub/Sterne und aller
in vier Runden gemessenen Farbwerte. Leiser ist es trotzdem (`html.sternen-still`, opacity .6): Im
Fragebogen wird gelesen.

**Drei Dinge daran, die erst die Messung gezeigt hat:**

1. **Der Takt hing eine Sekunde nach.** `pruefen()` lief nur im Sekundentakt („Der Ansichtswechsel
   loest kein Ereignis aus"). Solange es nur „Startseite oder nicht" war, verdeckte das
   .8s-Ausblenden die Verzoegerung. Mit dem stillen Takt wurde sie sichtbar: Bei 320x568 lief die
   Flaeche nach dem Antippen noch weiter. Der Ansichtswechsel meldet sich jetzt selbst, ueber einen
   `MutationObserver` auf dem `class`-Attribut der beiden Ansichten — dieselbe Loesung wie beim
   Farbmodus in Runde 86 und aus demselben Grund. Dass beide Klassenwechsel (`remove` von allen,
   `add` beim Ziel) in `02-state.js` in **einer** synchronen Aufgabe liegen, ist die Voraussetzung:
   Der Beobachter sieht damit den Endzustand und nicht den Moment, in dem keine Ansicht aktiv ist.
2. **„still" und „gedaempft" waren erst EINE Groesse, und das war falsch.** In der Gegenprobe
   gemessen: Bei `prefers-reduced-motion` bekam die **Startseite** die gedaempfte Deckkraft mit.
   Wer weniger Bewegung will, hat aber nichts gegen Helligkeit gesagt. Es sind zwei Fragen —
   *wird hier gelesen?* (haengt allein an der Ansicht) und *darf sich etwas bewegen?* (haengt auch
   an der Vorliebe) — und sie sind jetzt zwei Variablen.
3. **Ein deutsches Zeichenketten-Literal bricht den Bau.** Die Takte hiessen zuerst `'bewegt'` und
   `'still'`; `audit_i18n.py` meldet `bewegt` als deutsches Literal im Code, und zu Recht — es
   kann einen internen Zustandsnamen nicht von einem uebersehenen Oberflaechentext unterscheiden.
   Die Takte haengen deshalb jetzt an den **Ansichtskennungen** selbst (`view-landing`,
   `view-quiz`), nicht an eigenen Namen.

### 3. Der Verlauf im Profil

Eine Zeile war **Datum links, Titel rechts** — zwei Leserichtungen in einer Zeile, und bei sieben
Eintraegen siebenmal dieselbe graue Zeile. Der rechtsbuendige Titel begann bei zwei langen Woertern
in einer zweiten Zeile **unter dem Datum**. Welcher Eintrag der jueungste ist, sagte nichts (die
Liste laeuft absteigend, das stand nirgends).

Jetzt: **Datum und Titel untereinander und beide linksbuendig**, die fuehrende Dimension als kurze
Marke rechts (dieselben `RADAR_LABELS` wie an der Kurve darueber), ihr **Pol als Kante links**, und
der jueungste Eintrag hervorgehoben. Dazu traegt die Trendkurve neben dem Stand jetzt die
**Veraenderung** ueber die gezeigte Strecke.

**Vier Entscheidungen, die dabei wichtiger sind als das Aussehen:**

- **Eingegrenzt auf `#historyContent`.** `.history-row` traegt **drei** Listen der App — den
  Verlauf, das Vergleichsarchiv und die Tagesform-Tage. Gemeldet war eine. Eine Aenderung an der
  gemeinsamen Regel haette zwei ungeprueft mitgenommen.
- **Die Zeile bleibt eine Karte.** Damit gelten die gemeinsamen Regeln fuer Rand, Druckzustand und
  Farbmodus-Wechsel unveraendert weiter.
- **Nur die Farbe der Kante, nicht ihre Breite.** Die Formensprache aus Runde 69 setzt
  `border-width:2px !important`. Eine eigene Breite hier waere toter Code, der aussieht, als wirke
  er — am Geraet nachgemessen: 2px, wie vorhergesagt.
- **Die Veraenderung traegt KEINE Farbe.** Ein gruenes „+" und ein rotes „−" hiessen, hoch sei
  besser als niedrig. Das ist bei den fuenf Dimensionen falsch und widerspricht dem, was die App an
  jeder anderen Stelle sagt. Das Vorzeichen ist die ganze Aussage; gerechnet wird ueber die
  **angezeigte** Strecke, weil die freie Fassung nur die letzten zwei Durchlaeufe zeigt und eine
  Zahl ueber verborgene Eintraege nicht nachvollziehbar waere.
- **Keine neuen Texte.** Datum, Marke und Form sagen alles. Ein Wort wie „zuletzt" haette acht
  Sprachpakete gebraucht, um zu sagen, was eine kraeftigere Kante auch sagt.

### 4. Der Archetypen-Bereich

Der Bereich heisst seit jeher `.archetype-groups` und **hatte keine Gruppen**: zehn gleich gebaute
Karten in einer Reihe, deren einziger Unterschied eine kleine Marke „DIMENSION · Adjektiv" war.
Dass die zehn Rollen genau **fuenf Gegensatzpaare** sind — und dass genau das der Unterschied zu
den Schubladen des MBTI ist, den der Absatz darueber erklaert —, war aus der Anordnung nicht zu
sehen. Jede zweite Karte war der Gegenpol der vorigen, und es sah aus wie eine Aufzaehlung.

Jetzt **fuenf Gruppen mit je zwei Karten**, die Dimension als Ueberschrift. Damit verschwindet aus
der Marke auf der Karte die Wiederholung: Die Dimension steht einmal ueber der Gruppe, auf der
Karte bleibt der Pol — und die Kante links traegt ihn zusaetzlich als Form. Der Abstand zwischen
den Gruppen (26px) ist deutlich groesser als der innerhalb (12px); die Ueberschrift allein traegt
die Trennung nicht. Die Verzoegerung der Einblendung zaehlt weiter durchgehend 0 bis 9 und nicht je
Gruppe 0 bis 1, sonst liefen fuenf Paare gleichzeitig ein.

Nachgemessen: 5 Gruppen mit je 2 Karten, 10 Pol-Kanten, **80 Kombinationen wie vorher**, bei 390
und bei 320 keine Karte aus der Spur.

### 5. Groessere Uebergaenge — und der Punkt, an dem ich auf toten Code hereingefallen bin

Die Strecke war **nicht** der Hebel: 16px seitlich sind bereits so viel, wie die 20px Polsterung
von `#shell` hergeben, und der Rest waere genau der Ueberhang, den die Fehlersuche seit Runde 91
misst. Der zweite Freiheitsgrad ist die **Tiefe**: Die Ansicht kommt jetzt mit 4 % aus der Tiefe
nach vorn — deutlich zu sehen, und sie laeuft nach **innen**, kann also nirgends ueber den Rand.
Nachgerechnet und nicht angenommen: Bei 390px ist die Ansicht 350px breit, 4 % sind 7,9px je Seite,
die rechte Kante steht zu Beginn bei 370 − 7,9 + 16 = **378 von 390** — zwoelf Punkte Luft, also
**mehr** als die vier, die 16px allein uebrig liessen. Im Browser bei beiden Breiten waehrend der
Bewegung gemessen: 0px Quer-Ueberlauf. Dauer und Kurve bleiben bei .45s, weil die Pruefungen dort
ihre Wartezeiten haben und drei Uebergaenge, die sich wie einer anfuehlen sollen, dieselbe Zeit
brauchen.

**Und der Fehler, der es fast in den Commit geschafft haette:** Ich habe zuerst `q-enter` in
`02-quiz.css` vergroessert — die Einblendung der Fragekarte, 9px. Die Regel **greift nicht**.
`11-feier.css` ersetzt sie durch `q-schub` (26px seitlich mit Ueberschwung) und sagt es dort auch,
nur sagte es an der Fundstelle nichts. Die Aenderung war gemessen wirkungslos, und der
Fragewechsel ist damit **schon seit Runde 69 gross**. `q-enter` steht wieder wie vorher; neu ist
dort nur ein Hinweis, dass die Regel nicht greift — an der Stelle, an der man zuerst sucht. Das ist
dieselbe Lehre wie die verworfene Gegenprobe aus Runde 107: **Eine Aenderung an Code, der nicht
laeuft, ist keine Aenderung.**

### Was die Fehlersuche gefunden hat — und es war meins

Der erste Sammellauf nach den fuenf Punkten meldete **30 Funde**, und alle dreissig waren
**dasselbe Element**: `div.history-dim`, die neue Dimensionsmarke im Verlauf, mit **4,26:1 — noetig
sind 4,5:1**. Auf beiden Motoren, bei 390 und 320 Punkten, in vier Sprachen, in zwei Ansichten.

Die Ursache ist lehrreich, weil sie nicht in der Farbe liegt, sondern im **Untergrund**:
`--muted-soft` ist die unterste Textstufe der App und in Runde 42 fuer `--paper` gerechnet. Die
Marke liegt aber auf einer **Karte** — und auf der hervorgehobenen jueungsten Zeile sogar auf
`--surface-2`. Dieselbe Farbe, weniger Unterschied. Ein Blick ins Stilblatt haette „das ist doch
die Farbe fuer genau so etwas" gesagt und waere falsch gewesen.

Die Marke steht jetzt in `--muted` und ist damit etwas kraeftiger als beabsichtigt. Das ist der
richtige Tausch: Ihre Zurueckhaltung traegt die Groesse (10px) und die Mono-Schrift, nicht die
Farbe allein. Nachgefahren auf `390px/hell/de`, beide Motoren: **keine Funde**.

### Vier neue Messungen, dauerhaft im Repository

Alle vier in `tools/pruef_bewegung.mjs`, und alle gegen den **nachgestellten alten Zustand**
gegengeprueft — sie schlagen dort fehl:

| Messung | gegen den alten Zustand |
|---|---|
| Startseite: der Hintergrund bewegt sich | — (neu, sichert den Zustand, den es schon gab) |
| Startseite: steht still bei reduzierter Bewegung, bleibt aber voll da | FAIL bei zusammengelegtem „still"/„gedaempft" |
| Fragebogen: der Hintergrund ist da und steht still | FAIL (opacity 0) |
| Fragebogen: die Aussagen-Box sitzt im oberen Drittel | FAIL (50 %) |

Die erste ist die wichtigste und hat keinen alten Zustand, gegen den sie sich beweisen kann: Bis zu
dieser Runde kannte die Flaeche nur „Startseite oder nicht", jetzt kennt sie zwei Takte — und damit
die Moeglichkeit, versehentlich **beide** stillzulegen. Das waere der unauffaelligste Fehler von
allen: Die Flaeche ist da, sieht auf jedem Bildschirmfoto richtig aus, und die Atmosphaere, um die
es ueber vier Runden ging, ist tot. Kein Stilblatt- und kein Quelltext-Blick zeigt das an.

Gemessen wird der Hintergrund ueber seinen **Inhalt** (Stichprobe jedes 37. Bildpunkts auf den
Alphakanal), nicht ueber eine Klasse: Ein Canvas, das da ist und nichts zeigt, ist derselbe leere
Hintergrund wie vorher. Bei der Box wird das **Verhaeltnis** gemessen und nicht der Pixelwert —
der haengt an Geraetehoehe, Sprache und Zeilenumbruch, das Verhaeltnis nicht.

### Was in Batch 3 offen bleibt, und warum

- **Punkt 6, „die App insgesamt visuell verschoenern".** Das ist der Sammelpunkt der Liste und
  ohne eine engere Frage nicht messbar abzuarbeiten. Nach dieser Runde waere die konkrete Frage an
  den Inhaber: **Welche Ansicht stoert am meisten?** Aus dem Stand der Runde heraus wuerde ich die
  **Ergebnisseite** vorschlagen — sie ist die laengste (acht Bildschirme), traegt die meisten
  Karten und ist die einzige, die jemand jemandem zeigt.
- **Punkt 7, Fluessigkeit.** Der laut Journal groesste Hebel ist der **Release-Bau statt Debug**.
  Das ist keine Aenderung am Stilblatt, sondern eine Einstellung des Schemas in Xcode und eine
  Messung am Geraet — sie gehoert in dieselbe Runde wie „die App auf einem echten iPhone", und die
  steht beim Inhaber. Ungemessen und deshalb hier vermerkt, nicht stillschweigend uebersprungen.
- **Die Avatare** sind unveraendert. Die Begruendung steht in der Uebergabe und in Runde 107: Ein
  vierter Nachschliff an derselben Konstruktion ist eine Grundsatzentscheidung des Inhabers, keine
  Aufgabe.

### Ein Werkzeug, das nicht mitgezogen wurde — mit Absicht

`tools/renderer/run_*.js` enthaelt **Kopien** des App-JavaScripts, darunter die alte
`renderHistory()` und `renderArchetypeGroups()`. Diese Kopien sind jetzt veraltet. Sie wurden
bewusst nicht nachgezogen: `tools/renderer/LIESMICH.md` sagt selbst, dass der ganze Renderer „in
einer Umgebung mit echtem Browser ueberfluessig" ist, und er steht in keiner der neun Pruefungen.
Ihn zu pflegen hiesse, zwei Staende derselben Logik zu halten, von denen einer nie gelesen wird.
**Wer ihn doch einmal braucht, muss die betroffenen Funktionen frisch aus `src/js/` uebernehmen.**

---

## Runde 107 — Rueckmeldungsliste des Inhabers, Punkte 1 bis 6

Der Inhaber hat eine Liste mit 18 Punkten in acht Gruppen vorgelegt und zuerst gefragt, **was davon
schon umgesetzt ist**. Der Befund vorweg, weil er den Rest der Runde erklaert:

- **Zwei Punkte waren erledigt.** Der Overscroll-Bounce ist nativ abgeschaltet
  (`MainViewController.swift`, `bounces = false`). Und das Impressum steht **nicht** „auf vielen
  Seiten ganz unten": Es gibt im ganzen Dokument genau **einen** `<footer class="appfoot">`, und
  der liegt nur in `view-result`. Dazu der zentrale Zugang in den Einstellungen und die eigene
  Ansicht `view-recht`. Der gewuenschte Zustand war also schon fast da — offen ist nur die
  Geschmacksfrage, ob der eine Fusszeilen-Link auf der Ergebnisseite bleibt.
- **Fuenf Punkte waren angefangen** (Ladebildschirm, Fluessigkeit, Avatare, X-Achse, Animationen).
  Bei den **Avataren** ist das wichtig fuers Protokoll: Die Rueckmeldung „zu unrealistisch,
  komplett ueberarbeiten" ist die **dritte** dieser Art (Runde 87, Runde 94, jetzt). Die beiden
  Ueberarbeitungen davor haben je einen echten Grund behoben (Runde 87: schwebender Kopf, flaechige
  Farben, kreisrundes Auge, Symmetrie — Runde 94: kein Licht, Iris als einfarbige Scheibe, Mund als
  Strich, zehn Mienen auf 22 Figuren). Wenn das Ergebnis weiterhin nicht ueberzeugt, ist der
  naechste Schritt **kein vierter Nachschliff** an derselben Konstruktion, sondern eine
  Grundsatzentscheidung des Inhabers: 40x40-Einheiten-SVG aus Parametern beibehalten oder durch
  etwas anderes ersetzen. Das ist die Lehre „eine Messung kann sich auf die falsche Groesse
  beziehen" in ihrer teuren Form.
- **Drei Punkte widersprechen dokumentierten Entscheidungen** und sind deshalb nicht
  stillschweigend umgesetzt worden: Doppeltipp-Zoom (`index.head.html` verzichtet ausdruecklich auf
  `user-scalable=no`), Textmarkierung (`user-select:none` liegt bewusst nur auf Bedienelementen,
  nicht auf Fliesstext) und die zwei Teilformate (Feed 1080x1350 und Story 1080x1920 sind eine
  bewusste Wahl mit Umschalter). Sie liegen beim Inhaber.

Umgesetzt sind in dieser Runde zuerst die vier Punkte mit **kleiner, klarer Ursache**, danach
das Einzeichnen der Kurve und die x-Achse — in dieser Reihenfolge auf ausdrueckliche Zustimmung
des Inhabers („ja guter vorschlag so").

### 1. Die Benachrichtigungen folgten dem Farbmodus nicht

**Fehler:** Gemeldet als „in der Dark Version weiss und in der Light Version schwarz, das passt
nicht zum jeweiligen Design". Die Ursache stand woertlich im Stilblatt: `.toast` trug
`background:var(--ink); color:var(--paper)` — die **Umkehrung** des Farbmodus. Im Hellmodus wurde
daraus eine schwarze Pille auf hellem Papier, im Dunkelmodus eine weisse auf dunklem. Das war die
einzige Flaeche der ganzen App, die nicht zum Modus gehoerte.

**Aenderung:** `src/styles/09-archetypen.css` — der Hinweis ist jetzt eine Karte wie jede andere:
`--surface` als Grund, `--ink` als Schrift, `--line-strong` als Rand, derselbe Schatten wie
`.qcard`. Keine neuen Farbmarken, also auch keine neuen Dunkelbloecke.

**Warum der Rand dazukommt:** `--surface` liegt nur um den Faktor 1,087 ueber `--paper`. Ohne Rand
waere die Pille eine Ahnung statt eines Hinweises — die Abgrenzung tragen jetzt Rand und Schatten
statt der Umkehrung.

### 2. Nur zwei von fuenf Antwortoptionen waren beschriftet

**Fehler:** Die drei mittleren `<span>` waren im HTML vorhanden, aber **leer** — und zusaetzlich per
`display:none` ausgeblendet. Wer eine Skala nur an den Enden beschriftet, laesst die Deutung der
Mitte offen: Ist die 3 „unentschieden" oder „trifft halb zu"? Das sind zwei verschiedene Antworten
auf dieselbe Aussage.

**Aenderung:** Texte in **allen acht Sprachen** (`src/i18n/*.js`, Schluessel
`trifft_gar_nicht_zutrifft_vo`), die drei `display:none`-Regeln entfernt, und die Zeile von
`justify-content:space-between` auf `flex:1` mit denselben 8px Abstand wie `.scale-row` umgestellt.
Nur so steht jede Beschriftung **unter** ihrem Knopf statt irgendwo dazwischen.

**Die Texte sind kurz, und das ist gerechnet:** Bei 320px Geraetebreite bleiben je Spalte 49,6px
(gemessen). „trifft gar nicht zu" waere dort vierzeilig. Also „gar nicht / eher nicht / teils /
eher ja / voll". Der vollstaendige Wortlaut steht weiter im `aria-label` der Zeile — fuer
Screenreader aendert sich nichts.

**Was daran keine Geschmacksfrage ist:** Eine Beschriftung, die einen halben Knopf versetzt steht,
ordnet die Bedeutung dem **falschen Wert** zu, und auf einem Bildschirmfoto sieht „ungefaehr
darunter" genauso aus wie „darunter". Deshalb ist die Messung als Pruefung ins Repository gewandert:
`suchSkalaVersatz` in `tools/fehlersuche.mjs` vergleicht die Mittelpunkte von Knopf und
Beschriftung paarweise und meldet leere, ausgeblendete und aus ihrer Spalte laufende
Beschriftungen. Sie laeuft damit automatisch ueber alle 13 Konfigurationen und **beide** Motoren.

**Gegengeprueft** — das ist der Punkt, an dem eine neue Pruefung sonst blind bleibt: Im gesunden
Zustand KEINE FUNDE; mit nachgestelltem alten Zustand (Mitte ausgeblendet, `space-between`) sechs
Funde, darunter „Beschriftung 3 steht -160,0px neben ihrem Knopf". Zusaetzlich einmalig ueber
3 Breiten x 8 Sprachen auf **WebKit** gemessen: 24 Durchlaeufe, kein Ueberlauf, alle Mittelpunkte
deckungsgleich.

### 3. Der Ladebildschirm nahm 82 % der Bildschirmbreite ein

**Fehler:** Gemeldet als „zu haesslich und zu gross". Die Groesse war **messbar**, nicht Geschmack.
`LaunchScreen.storyboard` hatte als Wurzelansicht den `UIImageView` selbst, mit
`contentMode="scaleAspectFill"` und dem 2732x2732 grossen „Splash". Bei aspectFill skaliert ein
Quadrat nach der **groesseren** Bildschirmkante, also nach der Hoehe: auf 402x874 Punkten mit dem
Faktor 874/2732 = 0,32. Der Logo-Block im Bild ist 1028 Bildpunkte breit — nachgemessen am
Bildpunkt (eigener PNG-Dekoder, weil PIL auf diesem Rechner fehlt), nicht geschaetzt: 37,6 % der
Bildbreite, der Rest ist Papierfarbe. Auf dem Schirm kam er damit bei 329 von 402 Punkten heraus,
also **82 % der Breite**. Nebenbei wurde das Bild links und rechts beschnitten, weil aspectFill ein
Quadrat auf einem 19,5:9-Schirm zwangslaeufig ueberfuellt.

**Aenderung:** Eine gewoehnliche `UIView` traegt den Hintergrund, das Bild liegt mittig darin mit
`scaleAspectFit` und einer Breite von **0,85 der Ansichtsbreite**. Der Logo-Block landet damit bei
0,85 x 37,6 % = **32 %** der Bildschirmbreite. Dazu die neue Farbe `Papier.colorset` im
Asset-Katalog (#E4E6DB hell, #0F1613 dunkel — dieselben zwei Werte, die `MainViewController.swift`
schon als `papierfarbe` fuehrt).

**Nachgemessen statt geschaetzt**, ueber `RunCodeSnippet` mit dem instanzierten Storyboard:

| Geraet | Schirm | Bildrahmen | Logo-Block | Anteil |
|---|---|---|---|---|
| iPhone SE | 320x568 | 272,0 | 102,3 pt | 32,0 % |
| iPhone 17 | 393x852 | 334,3 | 125,8 pt | 32,0 % |
| 17 Pro Max | 440x956 | 374,0 | 140,7 pt | 32,0 % |

Auf allen drei Groessen derselbe Anteil, Bild exakt zentriert, Grund loest in beiden Modi zu
#E4E6DB bzw. #0F1613 auf. Der Wert ist ein **Anteil** und kein Punktmass — deshalb gilt er auch auf
Geraeten, die es noch nicht gibt.

**Drei Dinge daran, die man sonst neu lernt:**

1. **Die Grafik musste nicht neu gerendert werden.** Der Hintergrund der beiden PNG ist **exakt**
   das CSS-Token `paper` (am Bildpunkt gemessen). Weil `Papier.colorset` dieselben Werte traegt, ist
   die Kante des quadratischen Bildes auf der Flaeche unsichtbar.
2. **Die Groesse wirkt an ZWEI Stellen.** `@capacitor/splash-screen` baut seine Anzeige nicht
   selbst, sondern **instanziert dieses Storyboard** (`SplashScreen.swift`, `buildViews()`:
   `UIStoryboard(name: UILaunchStoryboardName)`). System-Startbild und Plugin-Splash sind dieselbe
   Datei; eine Aenderung hier wirkt auf beide, und der Uebergang bleibt nahtlos. Haette ich nur das
   Storyboard geaendert und das Plugin fuer eine eigene Zeichnung gehalten, waere ein Sprung
   zwischen zwei Groessen entstanden.
3. **`plugins.SplashScreen.backgroundColor` musste weg** (`capacitor.config.json`). Das Plugin setzt
   diesen Wert auf die Wurzelansicht des Storyboards. Solange die Wurzel der deckende `UIImageView`
   war, blieb das wirkungslos — jetzt waere es sichtbar, und der Wert war eine **feste** Farbe
   (#E4E6DB), also die Hellfassung auch im Dunkelmodus. Ohne den Eintrag bleibt die dynamische
   Farbe stehen.

**Zwei Sackgassen beim handgeschriebenen Storyboard**, beide vom Bau gefunden und hier notiert,
damit sie niemand zweimal sucht: Ein Kommentar **vor** `<document>` laesst Interface Builder den
Dateityp nicht mehr erkennen („can't determine the type… may be due to a missing SDK") — er muss
**hinein**. Und ein XML-Kommentar darf kein `--` enthalten, was bei einem Projekt, das seine
CSS-Marken mit zwei Strichen benennt, sofort zuschlaegt.

### 4. Das geteilte Bild trug eine fremde Schrift

**Fehler:** `src/js/10-ergebnisbild.js` setzte an vier Stellen `'Georgia, serif'` — auf dem einen
Bild, das weitergegeben wird und damit das Einzige ist, was Fremde von Lucenta sehen. Zahlen und
Fusszeile liefen richtig in „IBM Plex Mono" und „Work Sans"; nur Wortmarke, Titel und Motto kamen
in einer Systemschrift heraus, die in der App nirgends vorkommt.

**Aenderung:** Eine Marke `SHARE_SERIF` mit derselben Rueckfallkette wie `--serif`. Zwei Details,
bei denen nicht geraten werden sollte:

- **Fraunces liegt als variable Schrift mit dem Band 400–600 in der Datei.** Eine 700 anzufordern
  liefert keine fettere Schrift, sondern eine vom Browser nachgerechnete — deshalb steht jetzt 600,
  wo vorher 700 stand.
- **Der Rueckfall endet nicht bei `serif`.** Fraunces traegt nur Latin (`unicode-range` in
  `00-schriften.css`); auf Japanisch greift sonst eine beliebige Systemschrift statt der Mincho,
  die die App dort im Fliesstext benutzt.

### Was daran unsicher bleibt

- **Der Ladebildschirm ist gerechnet, nicht angesehen.** 32 % ist ein begruendeter Wert (Apples
  eigene Startbilder liegen im Bereich 25–40 % der Breite), aber ob der Block jetzt „richtig" wirkt,
  entscheidet das Auge. Der Wert steht als **eine Zahl** im Storyboard (`multiplier="0.85"`) und ist
  damit in einem Schritt zu aendern.
- **Die neue Toast-Flaeche ist gemessen, nicht beurteilt.** Kontrast und Lesbarkeit deckt
  `suchSchwachenKontrast` ab; ob eine Karte an dieser Stelle ebenso deutlich „Hinweis" sagt wie die
  bisherige Umkehrung, ist eine Frage ans Auge. Falls nicht: Der naechste Hebel ist nicht die
  Umkehrung zurueck, sondern ein Akzentpunkt links im Text.
- **Das Teilbild ist nicht als Bild geprueft.** Dass Fraunces auf der Leinwand ankommt, haengt
  daran, dass die Schrift beim Oeffnen des Dialogs bereits geladen ist. Das ist hier gegeben — der
  Dialog ist nur von der Ergebnisseite aus erreichbar, die durchgehend in Fraunces setzt —, aber
  belegt ist es nicht. Ein Blick auf ein echtes geteiltes Bild beantwortet es.

### Stand der Pruefungen

`npm run pruef-alles`: **8 von 9 bestanden**, darunter `fehlersuche` **KEINE FUNDE auf beiden
Motoren** (WebKit und Chromium, 26 Durchlaeufe, einschliesslich der neuen Skalenpruefung),
`pruef-nativ` 45/45, `pruef-app` 20/20, `pruef-store` 32/32, `pruef-bewegung` vollstaendig,
`audit_i18n` alle acht Sprachen. Der iOS-Bau: SUCCEEDED.

**`diff-sprachen` ist im Sammellauf abgebrochen** — `elementHandle.click: Timeout 30000ms` beim
Oeffnen der Schublade, an einem Element, das laut Protokoll bereits „visible, enabled and stable"
war und nur noch ins Bild gerollt werden sollte. Das ist kein Logikfehler, sondern eine
ausgehungerte Maschine: Derselbe Lauf hat fuer `fehlersuche` 22547 s und fuer `diff-sprachen`
4054 s gebraucht, wo sonst rund 800 s und 100 s stehen. **Einzeln nachgefahren laeuft es durch**,
mit 127 verdaechtigen Zeilen — genau dem Wert aus Runde 105, also unveraendert.

Die Lehre daraus fuer die naechste Runde: `pruef-alles` nicht parallel zu anderer schwerer Arbeit
auf demselben Rechner starten. Ein knapp gemessener Fund ist ein falscher Fund — hier war es ein
knapp gemessener Abbruch.

### 5. Die Tagesform-Kurve stand einfach da

**Fehler:** Gemeldet als „sollen sich beim Wechsel der verschiedenen Zeitraeume live von links nach
rechts einzeichnen". Sie tat gar nichts: `verlaufDiagrammSVG()` gab fertige `<path>` aus, und beim
Wechsel des Zeitraums tauschte das Diagramm schlicht aus.

**Aenderung:** `stroke-dasharray`/`stroke-dashoffset`. Ein Strich, dessen Strichmuster genau so lang
ist wie er selbst, ist bei Versatz 0 durchgezogen und bei Versatz = Laenge unsichtbar; der Uebergang
dazwischen ist das Einzeichnen, und zwar in Zeichenrichtung — die Punkte stehen nach Datum
aufsteigend, also von links.

**Drei Entscheidungen, die daran nicht offensichtlich sind:**

1. **Die Laenge wird gerechnet, nicht ueber `getTotalLength()` geholt.** Der Pfad ist ein
   Polygonzug, seine Laenge ist damit exakt die Summe der Strecken — und `getTotalLength()`
   braeuchte das Element im Dokument, waehrend es zu diesem Zeitpunkt eine Zeichenkette ist. Die
   Laenge geht als `--vl-laenge` an das `<svg>`.
2. **Beide Reihen benutzen die LAENGERE der zwei Laengen.** Bei zwei verschiedenen Werten waere eine
   Linie vor der anderen fertig, und zwei Linien, die nicht gleichzeitig ankommen, lesen sich als
   Wettrennen statt als ein Diagramm.
3. **Der 2-Prozent-Zuschlag ist nicht der Ausgleich fuer `preserveAspectRatio="none"`.** So hatte
   ich es zuerst in den Kommentar geschrieben, und das war falsch: Strichmuster werden im
   Nutzerkoordinatensystem berechnet, also VOR der Streckung — Laenge und Muster liegen ohnehin im
   selben Raum. Der Zuschlag deckt die runden Ecken an den Knicken ab, die den sichtbaren Strich
   etwas kuerzer machen als den gerechneten Polygonzug.

**Und ein Fehler, den ich im ersten Anlauf gebaut hatte:** Die Klasse `vl-zeichnet` stand fest im
Markup, die Abschaltung nur in `@media (prefers-reduced-motion: reduce)`. Damit haette der
Schalter IN der App (Einstellungen -> Bewegung) nicht gewirkt — er liegt in `localStorage` und ist
fuer CSS unsichtbar. Die Klasse wird jetzt in JS gesetzt, ueber `prefersReducedMotion()`, das beide
Quellen kennt; dasselbe Muster tragen `.qcard.q-in` und `pulseFocusline()`. Das Medienmerkmal bleibt
als zweite Tuer stehen. Dazu passend liegt das Strichmuster **nur** unter `.vl-zeichnet` und nicht
als Grundzustand: Ohne Animation traegt die Linie gar kein Muster, statt eines Musters in
Linienlaenge, das rechnerisch durchgezogen aussieht und bei jedem Rundungsfehler eine Haarstrich-
Luecke am jüngsten Punkt riskiert.

### 6. Die x-Achse nannte keine Daten

**Fehler:** Gemeldet als „unbeschriftet". Ganz stimmte das nicht — dort standen zwei **relative**
Angaben, „vor 29 Tagen" und „heute", links- und rechtsbuendig. Relativ heisst, dass man rechnen
muss, um einen Punkt einem Tag zuzuordnen, und in der Mitte stand ohnehin nichts.

**Aenderung:** Vier echte Datumsangaben an echten Stellen (`verlaufAchseHTML()` in `08-code.js`,
direkt neben `verlaufDiagrammSVG()`, damit die Geometriekonstanten nicht doppelt stehen und
auseinanderdriften). Die Position kommt aus derselben Rechnung wie die Punkte im Diagramm.

**Warum vier:** Bei 320px Geraetebreite bleiben rund 280px, je Marke braucht die Monospace rund
38px. Mehr waere eine Zahlenreihe, weniger liesse die Mitte wieder offen. Bei weniger als vier
Punkten gibt es je Punkt eine Marke — zwei Punkte und vier Datumsangaben waeren erfundene
Zwischenwerte. Ein zweites, kuerzeres Format (`achsenDatumFmt()`, Tag und Monat als Zahl) statt
`historyDateFmt()`: „05. Sept. 2026" ist in einer Liste richtig und auf einer Achse unbrauchbar,
und eine Achse, die viermal dasselbe Jahr wiederholt, sagt viermal nichts.

**Die Struktur musste sich dafuer aendern, und das war der eigentliche Fund.** Die Achse lag als
Geschwister UNTER `.verlauf-flaeche` und war damit um die Breite der 1-bis-5-Skala breiter als das
Diagramm. Mit zwei buendigen Angaben ist das unsichtbar; mit Marken an gerechneten Prozentstellen
haette **jede einzelne** um diese Breite links von ihrem Punkt gestanden — gemessen 14,3px. Jetzt
teilen Diagramm und Achse eine Spalte (`.verlauf-spalte`).

**Nebenwirkung, bewusst in Kauf genommen:** Die Trefferflaeche zum Ablesen ist `.verlauf-flaeche`
und umfasst damit jetzt auch den Achsenstreifen. Das passt zur dort schon notierten Absicht
(„die Trefferflaeche ist die ganze Diagrammflaeche, nicht die 2px-Linie") — ein groesseres Ziel ist
auf dem Telefon das bessere.

**Aufgeraeumt:** `js_vor_tagen` und `js_tagen` sind damit in allen acht Paketen verwaist und
entfernt — wie Runde 105 es mit `plus_beenden` gemacht hat.

### Zwei neue Pruefungen, beide gegengeprueft

Nach der Lehre „die Pruefung gehoert danach als Werkzeug ins Repository, damit die Zahl nicht
zurueckdriftet" sind die Messungen nicht als Einmal-Skript geblieben:

- **`suchAchseVersatz`** in `tools/fehlersuche.mjs` — fragt zuerst, ob die Achse ueberhaupt dieselbe
  Flaeche wie das Diagramm deckt, dann je Marke: leer, aus dem Diagramm ragend, an der Nachbarin
  klebend. Laeuft ueber alle 13 Konfigurationen und beide Motoren; die Beispieldaten bringen
  Tagesform-Eintraege mit, die Ansicht ist also tatsaechlich bestueckt.
- **Drei Messungen in `tools/pruef_bewegung.mjs`** — schiebt 60 Tage und Lucenta+ unter (der
  Fragebogen legt keine Tagesform-Eintraege an, und der Zeitraumwaehler steht nur in der gekauften
  Fassung), wechselt den Zeitraum und liest den Versatz bei 80/300/1300 ms.

**Die Gegenproben** (ohne sie ist eine neue Pruefung eine Behauptung):

| Probe | Ergebnis |
|---|---|
| gesunder Zustand | KEINE FUNDE |
| Achse aus der Spalte gezogen | 2 Funde, u. a. „die Achse deckt das Diagramm nicht (Achse 40,0+240,0, Diagramm 54,3+225,7)" |
| Animation per Stylesheet abgeschaltet | Versatz `[0,0,0]` -> faellt durch, richtig |

Der erste Versuch der dritten Probe hat **nichts gemessen**: Ich hatte `--vl-laenge` als
Inline-Eigenschaft ueberschrieben und danach den Zeitraum gewechselt — dabei wird das `<svg>` neu
erzeugt und der Override ist weg. Als Stylesheet ueberlebt die Aenderung das Neuzeichnen. Das ist
dieselbe Falle wie „eine Messung kann sich auf die falsche Groesse beziehen", nur eine Ebene tiefer:
eine Probe, die scheinbar bestaetigt, weil sie ihren Gegenstand verfehlt.

Einmalig zusaetzlich auf **WebKit** ueber 5 Breiten/Sprachen x 3 Zeitraeume gemessen: Versatz laeuft
von 189–315 auf 0,0, Achse deckt das Diagramm auf den Bildpunkt, vier Datumsangaben ohne
Beruehrung, Gebietsschema korrekt (de „04.09.", en „04/09", ja „09/04", fr „04/09").

### Eine Regel, die ich fast aufgeweicht haette

`audit_i18n.py` hat `vl-zeichnet` und `vl-achse-erst` als **deutsche Oberflaechentexte** gemeldet —
zu Recht nach seiner Regel: „zeichnet" und „erst" stehen im deutschen Sprachpaket und nicht im
englischen. Die Versuchung war, die Heuristik zu lockern (etwa „enthaelt einen Bindestrich, keine
Leerzeichen -> Bezeichner"). Genau davor warnt der Kommentar dort seit Runde 75: Eine Regel nach
Zeichenform koennte auch echten Text verdecken; Bezeichner werden am **Kontext** erkannt.

Also hat sich der Code geaendert, nicht die Pruefung: Beide Zweige tragen jetzt das **vollstaendige**
`class="..."`-Attribut statt nur des Zusatzes. Damit ist es fuer den Audit erkennbar ein Name — und
der Code ist nebenbei besser zu lesen.

### Was als Naechstes ansteht (aus derselben Liste, in vereinbarter Reihenfolge)

1. Fragebogen: Aussagen-Box hoeher (heute `justify-content:safe center`), Hintergrund gestalten
   (der Sternenhimmel laeuft nur auf `view-landing`).
2. Verlauf im Profil und der Archetypen-Bereich, beide visuell.
3. Die grossen, auffaelligen Uebergaenge (heute gibt es genau einen: `view-vor`/`view-zurueck`).

---

---

## 2026-09-17 (Runde 106) — ein toter Rueckfall bekommt eine zweite Tuer

**Auftrag des Inhabers:** die offene Entscheidung aus Runde 105 entscheiden und ausfuehren —
„Transparenz reduzieren" nativ nachbauen, am Simulator mit der Einstellung ein UND aus
nachmessen, erst der Simulator und keine Pruefläufe nebenher, `pruef-alles` am Ende, ein Commit.

### Der Fehler

Runde 105 hatte am Geraet gemessen, dass WebKit auf iOS 27 `prefers-reduced-transparency` nicht
kennt. Damit war der Rueckfall im Stilblatt — Glas weg, deckende Flaeche — auf dem iPhone
unerreichbar. Wer „Transparenz reduzieren" einschaltet und „Kontrast erhoehen" nicht, behielt
genau das Glas, das er abbestellt hat. Vier Regeln waren betroffen: die Kopfleiste, die drei
grossen Flaechen (Schublade, Bild-, Plus-Fenster), der Segmentwaehler und der Schieber.

Die Einstellung selbst ist nicht unerreichbar — nur die WebView kann nicht nach ihr fragen. Die
Huelle kann es.

### Die Aenderung

**Swift** (`ios/App/App/MainViewController.swift`): `UIAccessibility.isReduceTransparencyEnabled`
lesen und als `data-transparenz="reduziert"` an `:root` haengen. Zwei Wege, und beide sind
noetig:

1. Ein `WKUserScript` bei `atDocumentStart`, angemeldet in `capacitorDidLoad()` — dort steht die
   WebView schon, die Seite ist noch nicht geladen. Das Attribut ist also **vor dem ersten
   Bild** da. Ohne diesen Weg saehe genau der Mensch, der das Glas abbestellt hat, beim Start
   einen Wimpernschlag Glas.
2. `evaluateJavaScript` bei `reduceTransparencyStatusDidChangeNotification` **und** bei
   `didBecomeActive`. Der zweite Anlass ist der wichtigere: Umgelegt wird die Einstellung in den
   Systemeinstellungen, also waehrend Lucenta im Hintergrund liegt. Beim Zurueckkehren ist der
   Stand verlaesslich.

Warum **kein** Capacitor-Plugin, obwohl die Kauf-Bruecke eines ist: Ein Plugin muss von
JavaScript aus gefragt werden, und die Antwort kaeme nach dem ersten Zeichnen. Das Attribut
gehoert vorher gesetzt, und dafuer muss die Huelle unaufgefordert reden.

Das `evaluateJavaScript` ist bewusst auf eine fertig geladene Seite beschraenkt
(`url != nil && !isLoading`). Beim Kaltstart feuert `didBecomeActive`, waehrend die WebView noch
laedt — **am Simulator nachgesehen und bestaetigt: `isLoading` ist dort `true`**. Ohne die
Schranke waere das genau der `JS Eval error`, der in Runde 104 eine Runde Suche gekostet hat, und
gebraucht wird der Aufruf dann auch nicht: Die ladende Seite hat ihren Stand aus Weg 1.

**CSS** (`00-grundlagen.css` 3x, `08-formulare-und-dialoge.css` 1x): Jede der vier Regeln steht
jetzt zweimal — einmal unter dem Medienmerkmal, einmal unter `:root[data-transparenz="reduziert"]`
direkt dahinter. Das Merkmal bleibt ausdruecklich stehen: Es ist im Chromium der Pruefungen der
gemessene Weg, und eine kuenftige WebKit-Fassung, die es lernt, braucht dann keine Huelle.

Die ausfuehrliche Begruendung steht **einmal**, bei der Kopfleiste; die drei anderen Tueren
verweisen dorthin.

### Die zwei Pruefungen — und warum es zwei sein muessen

Doppelt geschriebene Werte driften auseinander. Das ist dieselbe Fehlerart, die
`pruefeDunkelbloecke` schon einmal gekostet hat, nur mit den Farbmarken.

- **`pruefeTransparenzTueren` in `build.js`** (fuenfte Abbruchpruefung) vergleicht beide
  Fassungen jeder Regel Deklaration fuer Deklaration und verlangt, dass die Attributfassung
  direkt hinter der Medienregel steht. Sie hat beim **ersten Lauf sofort einen echten Fehler
  gefunden** — meinen eigenen: Der Schieber braucht **zwei** Attributregeln (Bahn aus, Bahn ein),
  und die erste Fassung der Pruefung las nur die erste.
- **Fuenf Messungen in `pruef_bewegung.mjs`**, weil ein Textvergleich eine Frage nicht beantworten
  kann: Ob das Attribut die Regel tatsaechlich greifen laesst, entscheidet die **Spezifitaet**.
  `:root[data-transparenz="reduziert"] .segment-opt:active` muss sich gegen
  `.segment-opt[aria-checked="true"]:active` durchsetzen. Drei Messungen nehmen das Glas von
  Kopfleiste, Schublade und Bildfenster und geben es zurueck; zwei halten den Mausdruck auf
  Schieber und Segmentfach, **mit** gesetztem Attribut — beides ist gleichzeitig zu haben, das
  Attribut an `:root`, der Druck am Element.

Beide Pruefungen sind **gegengeprueft**: Mit einem geaenderten Wert bricht der Bau ab, und ohne
die Tuer des Schiebers meldet `pruef-bewegung`
`Schieberbahn ... (none -> blur(8px) saturate(1.8) brightness(1.06))`. Eine Pruefung, die nicht
fehlschlagen kann, ist wertlos.

### Am Simulator nachgemessen, mit dem echten Schalter

Zuerst ein Umweg, der nichts brachte und als Warnung hier steht:
`xcrun simctl spawn <id> defaults write com.apple.Accessibility ReduceTransparencyEnabled -bool true`
schreibt den Wert, `defaults read` liest ihn zurueck — und
`UIAccessibility.isReduceTransparencyEnabled` bleibt trotzdem `false`. Auch nach Neustart der App
und nach **Neustart des ganzen Simulators**. `xcrun simctl ui` kennt `appearance`,
`increase_contrast` und `content_size`, aber **kein** `reduce_transparency`. Der einzige Weg ist
der Schalter in der Einstellungen-App (`REDUCE_TRANSPARENCY` unter Bedienungshilfen > Anzeige &
Textgroesse) — und der muss am **rechten** Rand getroffen werden, nicht in der Zeilenmitte: Das
Hierarchie-Element ist 330 Punkte breit, der eigentliche Schalter sitzt rechts.

Gemessen wurde ohne ein einziges Bildschirmfoto. Capacitor leitet `console.log` aus der WebView in
die Xcode-Konsole; damit genuegt ein `evaluateJavaScript` aus dem Debugger, und die Antwort steht
als Text in `GetConsoleOutput`. Das ist der billige Weg und beantwortet dieselbe Frage — ein
asynchroner Swift-Abschluss aus einem lldb-Ausdruck funktioniert ohnehin nicht, sein Code wird
mit dem Ausdruck freigegeben. (Der Zugriff auf die WebView geht ueber
`rootViewController.view` — `valueForKey:@"webView"` wirft, weil die Swift-Eigenschaft nicht
`@objc` ist.)

| Zustand | Weg | `data-transparenz` | Kopfleiste `backdrop-filter` | Kopfleiste Hintergrund |
|---|---|---|---|---|
| aus | — | `null` | `blur(20px) saturate(1.6)` | `color(srgb 0.086 0.133 …)`, durchscheinend |
| **ein**, Kaltstart | UserScript | `reduziert` | `none` | `rgb(22, 34, 29)`, deckend |
| **ein**, lebende Seite | `didBecomeActive` | `reduziert` | `none` | `rgb(22, 34, 29)`, deckend |
| wieder **aus**, lebende Seite | `didBecomeActive` | `null` | `blur(20px) saturate(1.6)` | durchscheinend |

Die drei grossen Flaechen mitgemessen (eingeschaltet, lebende Seite): `#drawerPanel`, `#imgModal`
und `#plusModal` alle `filter=none`, `bg=rgb(23, 33, 28)` — die Tuer mit drei Selektoren geht
also ebenfalls auf. Ausgeschaltet kommt das Glas an allen zurueck (`blur(20px) saturate(1.5)`).

Nebenbei belegt: Der Beobachter ist richtig angemeldet. Eine von Hand gepostete
`UIAccessibilityReduceTransparencyStatusDidChangeNotification` landet in
`transparenzNachziehen()` — im Debugger am Haltepunkt gesehen.

### Was unsicher blieb

- **Der Aenderungs-Anlass `reduceTransparencyStatusDidChangeNotification` ist nicht im
  Vordergrund gemessen**, sondern nur ueber eine von Hand geposteten Mitteilung. Das ist kein
  Mangel an Sorgfalt, sondern die Lage: Umgelegt wird die Einstellung in den Systemeinstellungen,
  Lucenta liegt dann im Hintergrund, und der wirksame Anlass ist `didBecomeActive` — der ist
  gemessen. Der zweite Anlass ist der Guertel zum Hosentraeger.
- **Ob die deckende Kopfleiste gut aussieht**, ist keine Messung. Sie ist eine andere Flaeche als
  die glaeserne; ob sie neben der Dynamic Island stimmt, entscheidet das Auge auf einem Geraet.
  Steht so im Uebergabe-Block.
- Ein `defaults write` aus einem frueheren Versuch stand noch in den Voreinstellungen des
  Simulators und ist wieder auf `false` gesetzt — sonst haette die naechste Sitzung dort einen
  Wert gefunden, der nichts bewirkt und alles verwirrt.

### Pruefungen

`npm run pruef-alles`: **ALLE 9 BESTANDEN**, 9,0 Minuten. `fehlersuche` **KEINE FUNDE** auf
beiden Motoren (WebKit zuerst), `pruef-bewegung` einschliesslich der zehn neuen Messungen
(fuenf je Bewegungsmodus), `pruef-nativ` 45/45, `pruef-app` 20/20, `pruef-store` 32/32,
`diff-sprachen` 127 (unveraendert).

---

## 2026-09-16 (Runde 105, Teil 2) — der Druckzustand ist gesund, und ein Rueckfall ist toter Code

**Auftrag des Inhabers:** die drei offenen Punkte des Uebergabe-Blocks in dieser Reihenfolge,
`pruef-alles` am Ende, ein Commit.

### 1. `:active` greift — auf WebKit nachgemessen, und jetzt festgenagelt

Teil 1 dieser Runde endete mit einer offenen Frage: Am Simulator blieb jeder Druckzustand stumm.
Die Frage war, ob die CSS-Regel nicht greift oder die synthetische Beruehrung kein `:active`
erzeugt. Playwright kann das trennen, weil ein **gehaltener Mausdruck** ein echter Eingabeweg ist:

    Schieber:        Bahn deckend -> 62 % Deckkraft + blur(8px) saturate(1.8) brightness(1.06)
                     Knopf 27px   -> 33px
    Segmentwaehler:  deckend      -> 58 % Deckkraft + dieselbe Unschaerfe
    Knopf (.btn)     transform:none -> scale(.955)

`:active` meldet in allen drei Faellen `true`, auf **WebKit und Chromium mit identischen Werten**.
Das CSS ist also gesund, und die Stille am Simulator war die Messung, nicht die App.

Ein gehaltener **Beruehrungs**druck bleibt unmessbar, und zwar grundsaetzlich: `touchscreen.tap()`
gibt es nur als Ganzes, und von Hand verschickte `TouchEvent`s setzen `:active` nicht — diesen
Zustand setzt allein der echte Eingabeweg des Browsers. (`new Touch(...)` ist in WebKit ausserdem
kein erlaubter Konstruktor.) Der Fingertipp bleibt damit Sache des Inhabers, aber er entscheidet
jetzt nur noch eine kleine Restfrage statt der ganzen.

Nach der Projektregel gehoert eine solche Messung ins Repository, sonst driftet sie zurueck.
Sie sitzt in `tools/pruef_bewegung.mjs` — dieselbe Fehlerart, fuer die diese Datei gebaut wurde
(gueltige Regel, nie zu sehen), nur umgekehrt. **Sechs neue Pruefungen**, drei je Durchlauf; der
Durchlauf mit `prefers-reduced-motion` erwartet ausdruecklich, dass die Unschaerfe bleibt (sie ist
Material, keine Bewegung) und der Knopf sich NICHT dehnt (27px -> 27px). `pruef-bewegung` laeuft in
`pruef-alles` mit, die Zahl der neun Pruefungen bleibt unveraendert.

### 2. `prefers-reduced-transparency` kennt WebKit auf dem iPhone nicht

Der Uebergabe-Block fuehrte das als „ungemessen, weil Playwright es nicht emulieren kann". Am
Geraet geht es — nur anders als erwartet.

`simctl ui <id> increase_contrast enabled|disabled` setzt „Kontrast erhoehen" direkt.
Fuer „Transparenz reduzieren" gibt es **keinen** `simctl`-Schalter, und `defaults write
com.apple.Accessibility ReduceTransparencyEnabled -bool true` **wirkt nicht** (der Wert steht
danach da, die Systemmeldung fehlt) — es bleibt der Weg durch die Einstellungen-App:
Bedienungshilfen > Anzeige & Textgroesse > „Transparenz reduzieren" (`identifier:
REDUCE_TRANSPARENCY`; „Kontrast erhoehen" heisst dort `TEXT_COLORS_DARKEN`).

Gemessen wurde mit einer Prueflseite in mobilem Safari — `simctl openurl` auf einen kleinen
Server, die Seite zeigt `matchMedia` in grosser Schrift und hoert auf Aenderungen. Ergebnis:

| Einstellung im iOS | Merkmal in WebKit | Antwort |
|---|---|---|
| Kontrast erhoehen: ein | `prefers-contrast: more` | **JA**, sofort, ohne Neustart |
| Transparenz reduzieren: ein | `prefers-reduced-transparency: reduce` | nein |
| Transparenz reduzieren: ein | `prefers-reduced-transparency: no-preference` | **auch nein** |

Die dritte Zeile ist der Beweis: Ein **unterstuetztes** Merkmal muss genau einen der beiden Werte
bejahen. Beide `nein` heisst, dass WebKit auf iOS 27 das Merkmal nicht kennt. Der Zweig
`@media (prefers-reduced-transparency: reduce)` ist auf dem iPhone damit **toter Code** — nicht
kaputt (in einer Kommaliste macht ein unbekanntes Merkmal nur diesen einen Zweig falsch, der
`prefers-contrast`-Zweig daneben greift weiter), aber unerreichbar.

**Was daraus folgt und noch offen ist:** Wer „Transparenz reduzieren" einschaltet und „Kontrast
erhoehen" NICHT, behaelt das Glas. Der Rueckfall, der genau fuer diesen Menschen geschrieben
wurde, feuert nie. Zu beheben waere das nur nativ: `UIAccessibility.isReduceTransparencyEnabled`
lesen, auf `reduceTransparencyStatusDidChangeNotification` hoeren und das Ergebnis als Attribut
an `:root` setzen, das die drei Rueckfallregeln zusaetzlich annehmen. Das ist ein echter Eingriff
(Swift + zwei Stilblaetter + eine Pruefung) und **eine Entscheidung des Inhabers**, kein
Aufraeumen — deshalb hier nur der Befund.

**Eine Falle nebenbei, die eine Viertelstunde gekostet hat:** Der Zustand der Schublade laesst
sich **nicht** ueber Bildvergleiche messen. Drei Aufnahmen desselben Zustands, je eine Sekunde
auseinander, sind alle verschieden — der Sternenhimmel laeuft. Wer hier Hashes vergleicht,
vergleicht Sterne. Die Media-Query direkt zu fragen ist der richtige Weg.

### 3. `plus_beenden` ist weg

Aus allen acht Paketen gleichzeitig entfernt (eine halbe Loeschung laesst Pruefung 1 des
i18n-Audits anschlagen, die die Schluesselmengen vergleicht). Der Kommentar in
`18-ergebnisbild-dialog.js` behauptete danach das Gegenteil („bleibt in den Paketen stehen") und
ist nachgezogen — ein Kommentar, der die Vergangenheit beschreibt, ist schlimmer als keiner.

---

## 2026-09-16 (Runde 105) — Runde 104 angesehen: drei Stellen bestaetigt, eine nicht messbar

**Auftrag des Inhabers:** nur den Uebergabe-Block lesen und mit Punkt 1 anfangen — die Aenderungen
aus Runde 104 am Simulator ANSEHEN, erst den Simulator, keine Pruefläufe nebenher.

Der Grund fuer diese Reihenfolge stand im Uebergabe-Block: In Runde 104 hatte der Simulator zweimal
`applicationState: "Hanging"` gemeldet, weil `pruef-alles` gleichzeitig vier Browser fuhr. Diesmal
lief nichts daneben, und die App war sofort bedienbar.

### Was bestaetigt ist

`LANG=en_US.UTF-8 npm run ios:sync`, Bau, Start, Schublade > Einstellungen. Drei der vier Stellen
sind am vergroesserten Ausschnitt geprueft — nicht am Zahlenwert, sondern am Bild:

- **Darstellung:** drei Faecher in EINER Zeile, je 103x45 Punkte (der Uebergabe-Block schrieb
  99x44 — die Breite ergibt sich aus 320 Punkten Karte minus Innenabstand, die 45 Punkte Hoehe
  liegen ueber der Mindesttrefferflaeche). Gewaehltes Fach als erhoehte Pille mit fetterem Text,
  wie ein `UISegmentedControl`.
- **Sprache:** Trennlinien links eingerueckt und rechts bis an die Kante — die iOS-Form. Die
  gewaehlte Zeile ist **nicht** fett, sondern traegt ein Haekchen in der Akzentfarbe.
- **Kopfzeile:** `EINSTELLUNGEN` steht wieder klein, in Monospace und gedaempft neben der
  Wortmarke. Das ist der Beleg, dass die verwaiste CSS-Deklaration die `.tagline` tatsaechlich
  mitverschluckt hatte: Auf dem Startbildschirm ist `#viewLabel` leer, erst eine Ansicht fuellt
  ihn — wer nur die Startseite ansieht, sieht den Fehler nicht und die Behebung auch nicht.

### Was NICHT gemessen werden konnte — und warum das kein Befund ist

Die vierte Stelle, der Druckzustand („leuchtet die Bahn unter dem Finger auf?"), liess sich mit
den Mitteln dieser Sitzung nicht einfangen. Der Weg dorthin gehoert hierher, damit ihn niemand
zweimal geht:

1. **Erster Anlauf, falsch gemessen.** `DeviceInteractionSynthesize` mit langem Halten und
   parallel ein `simctl io screenshot` — alle Bilder bytegleich mit dem Ruhezustand. Der
   Zeitstempel der Aufrufe hat es verraten: Die MCP-Aufrufe laufen **nicht** gleichzeitig mit
   Bash, sondern davor. Meine Bilder entstanden alle **nach** dem Loslassen. Eine Messung, die
   sich auf die falsche Groesse bezieht — genau die Lehre, die dieses Projekt dreimal bezahlt hat.
2. **Zweiter Anlauf, richtig gemessen.** Bilderserie per `nohup ... &` im Hintergrund starten,
   dann druecken. Die Serie deckte das Halten nachweislich ab (Zeitstempel geprueft). Ergebnis:
   20 Bilder, alle bytegleich. Keine Glasbahn, kein breiterer Knopf.
3. **Gegenprobe, die das Ergebnis einordnet.** Dasselbe an „Profil bearbeiten", einem
   gewoehnlichen `.btn` — dessen `transform:scale(.978)`-Druck steht seit vielen Runden im Code
   und ist nicht Teil von Runde 104. **Auch dort kein Unterschied.** Damit ist es keine Regression
   der Glasarbeit, sondern eine Eigenschaft der synthetischen Beruehrung: Ein stehendes,
   sekundenlanges Halten erzeugt in diesem WebView kein `:active`. Ein echter Fingertipp ist
   kuerzer als ein `simctl`-Bildschirmfoto, also auch so nicht zu fangen.

`mt [x y] <dauer>` liefert uebrigens **gar keine** Beruehrung — belegt daran, dass ein 12 Sekunden
langes „Halten" auf dem Haptik-Schieber ihn nicht umgelegt hat, ein einfaches `t x y` dagegen
sofort. Wer Haltezustaende messen will, nimmt `t x y <dauer>`.

Was am Geraet umgelegt wurde, steht wieder wie vorher: Haptik ein, Bewegung ein, Erinnerung aus,
Darstellung dunkel. Das Umlegen war Teil der Messung, nicht deren Ergebnis.

### Gefunden, aber nicht angefasst

Der Druckzustand haengt an `:active` — und ob `:active` auf dem iPhone bei einem echten Tipp
sichtbar wird, ist damit fuer **das ganze Projekt** offen, nicht nur fuer Runde 104. Geaendert
wurde hier nichts: Eine Aenderung an einem Zustand, den man nicht messen kann, ist ein Rateschritt.
Die Frage steht jetzt unter „Was nur der Inhaber kann" — ein Fingertipp entscheidet sie.

**Pruefungen vor dem Commit:** `pruef-schnell` ALLE 4 BESTANDEN (Bau, 11 Testreihen, i18n-Audit
ueber alle acht Sprachen, `pruef-app` 20/20). Die vollen neun liefen in Runde 104 auf **genau
diesem** Stand gruen (der Arbeitsbaum war unveraendert); sie wurden nicht wiederholt, weil sie
dasselbe zweimal gemessen haetten.

---

## 2026-09-16 (Runde 104, Teil 2) — Liquid Glass Schritt 3, und zwei Fehler auf dem Weg dorthin

**Auftrag des Inhabers:** „nicht nur liquid glass an sich sondern generell auch soll es ja wie
apple betriebssystem sein, also zb bei sprachauswahl oder dunkel-hell version auswahl usw."

Beim Ansehen dieser beiden Stellen kamen zwei Fehler heraus, die keine Pruefung je gemeldet hat.
Sie stehen zuerst, weil sie mehr wert sind als die Glasarbeit.

### Fehler 1: eine CSS-Deklaration ohne Selektor — und was sie mitgenommen hat

In `00-grundlagen.css` standen vier Deklarationen ohne Selektor davor. Ursache per `git log -L`
gefunden: In Runde 99 (`6e92520`) wurde das Beta-Abzeichen entfernt und dabei **nur die Zeile
`.wordmark-beta{` geloescht**, ihr Rumpf blieb stehen.

Das ist nicht kosmetisch. Ein CSS-Parser sammelt beim Aufraeumen Zeichen fuer einen Selektor, bis
die naechste `{` kommt — und das war die von `.tagline`. Waise und Nachbarregel wurden dadurch
**eine** ungueltige Regel, und die ganze Regel fiel weg. Gemessen auf **WebKit und Chromium**, in
**beiden** gebauten Fassungen:

    taglineRegel: null          <- die Regel existiert im geparsten Stilblatt nicht
    font-size: 16px             <- statt 12px
    font-family: Work Sans …    <- statt var(--mono)

Betroffen waren `#viewLabel` (die Bezeichnung der Ansicht oben in der Kopfleiste) und `#qHint`
(„Tippe eine Antwort an" im Fragebogen) — **fuenf Runden lang**, in jeder Sprache, in beiden
Farbmodi. Unsichtbar falsch statt sichtbar kaputt, und das ist die teure Sorte: Die Klammern waren
ausgeglichen, `pruefeSyntax` liest nur JavaScript, und der Browser meldet nichts.

Deshalb neben dem Loeschen der vier Zeilen eine fuenfte Abbruchpruefung im Bau, **`pruefeWaisen`**
in `build.js`: Sie sucht das Semikolon an einer Stelle, an der Regeln stehen muessen und keine
Deklarationen — im Dateirumpf und in `@media`/`@supports`. Ein Stapel unterscheidet dabei
Regelbloecke von Deklarationsbloecken, sonst waere jedes `;` in `@font-face` oder `@property` ein
Fehlalarm. Geprueft je Datei, damit die Meldung Datei und Zeile nennt.

**Gegenprobe gemacht, nicht angenommen:** Waise wieder eingesetzt -> Bau bricht ab, Exit-Code 1,
gemeldete Zeile 614 fuer eine Waise vor Zeile 616. Beim **ersten** Versuch zeigte die Meldung auf
Zeile 320 statt 614 — die Kommentare wurden durch ein Leerzeichen ersetzt und damit deren
Zeilenumbrueche gefressen, was jede Zeilennummer um die Hoehe aller Kommentare darueber
verschiebt. Jetzt werden sie durch Leerzeichen **gleicher Zeilenzahl** ersetzt. Eine Meldung, die
auf die falsche Stelle zeigt, kostet mehr Zeit als keine.

### Fehler 2: der Darstellungs-Waehler war ein 2x2-Raster mit einem Loch

`.segment` setzte `grid-template-columns:1fr 1fr` — zwei Spalten, fest. Zwei der Waehler haben
aber **drei** Faecher. Nachgemessen auf 390 Punkten, vorher:

    System  x=44  y=1345        Hell  x=197 y=1345
    Dunkel  x=44  y=1400        <- zweite Zeile, rechts daneben 150 Punkte Loch
    Waehler: 113 Punkte hoch statt 58

Betroffen: **Darstellung** (System/Hell/Dunkel) in den Einstellungen und der **Zeitraum** der
Tagesform (14/30/90). Seit Runde 97. Keine Pruefung sieht das, weil die Ueberlaufpruefung Elemente
sucht, die HERAUSstehen — nicht Loecher darin.

Behoben mit `grid-auto-flow:column` + `grid-auto-columns:1fr`: Die Spaltenzahl kommt jetzt aus der
Zahl der Faecher. Damit ist auch ein kuenftiger Waehler mit vier Faechern richtig, bevor ihn jemand
baut, und die drei mit zwei Faechern sehen aus wie vorher. Nachher gemessen:

    System x=44  Hell x=146  Dunkel x=247   — alle y=1345, je 99x44, Waehler 50 hoch

Dazu `.theme-toggle .segment-opt{min-height:44px}`: Die 52 Punkte aus `.segment-opt` sind fuer
zwei Zeilen gemacht (Preis und Ersparnis im Kauffenster). Auf 99 Punkten Breite ist das ein Kasten
statt eines Fachs. 44 ist Apples Mindestmass fuer eine Trefferflaeche, also das Kleinste, das hier
erlaubt ist.

### Liquid Glass Schritt 3 — enger gefasst als die Uebergabe es notiert hatte

Die Uebergabe schrieb „die Schalter und **allenfalls der Segmentwaehler**". Die Leitlinie
(`DocumentationSearch`, HIG *Materials: Liquid Glass*) ist praeziser, und der Unterschied
entscheidet:

> Don't use Liquid Glass in the content layer. […] An exception to this is for controls in the
> content layer with a transient interactive element like sliders and toggles; in these cases, the
> element takes on a Liquid Glass appearance to emphasize its interactivity **when a person
> activates it**.

„When a person activates it" heisst `:active`. Daraus folgt, was hier bewusst **nicht** gebaut
wurde: **Das gewaehlte Fach des Segmentwaehlers bekommt im Ruhezustand kein Glas.** Ein dauerhaft
glaesernes Fach ist kein fluechtiger Zustand, sondern ein stehender — das waere Glas in der
Inhaltsschicht und damit genau der Satz davor. Gebaut ist also:

- `.schalter:active` und `.schalter[aria-checked="true"]:active` — die **Bahn** wird
  durchscheinend (55 % bzw. 62 %) und bekommt `blur(8px) saturate(180%) brightness(1.06)`. Nicht
  der Knopf: Der ist auf dem Telefon weiss und deckend, ein glaeserner Knopf auf 27 Punkten waere
  ein grauer Fleck.
- `.segment-opt:active` und `.segment-opt[aria-checked="true"]:active` — dasselbe, 58 %.

Beide Zustaende stehen **ausdruecklich** da, weil `[aria-checked="true"]` und `:active` dieselbe
Spezifitaet haben und sonst die Reihenfolge entscheidet — derselbe Mechanismus, der in
Feedback-Runde 32 schon zweimal einen Zustand still ueberschrieben hat.

Die drei Rueckfaelle sind mitgenommen (kein `backdrop-filter`, „Transparenz reduzieren",
„Kontrast erhoehen"), aber **nicht** im gesammelten Block aus Runde 103, sondern je am
Bedienelement. Das folgt der Entscheidung, die in derselben Datei fuer die `:hover`-Regeln schon
begruendet steht: „jeweils einzeln an ihrer bisherigen Stelle eingefasst, statt sie an einer
Stelle zu sammeln und den Kontext zu ihren jeweiligen Komponenten zu verlieren."

**Ehrlich zur Wirkung:** Der Waehler liegt auf einer deckenden Karte. Die Unschaerfe hat dort wenig
zu verwischen; der sichtbare Anteil kommt aus `saturate` und `brightness`. Das ist ein Aufleuchten
unter dem Finger, kein Durchblick — und so ist es gemeint. Wer mehr erwartet, erwartet Glas in der
Inhaltsschicht.

### Die Sprachliste: zwei Abweichungen von der Form, die sie nachbaut

1. **Trennlinien eingerueckt.** Sie liefen von Kante zu Kante. In einer gruppierten Liste auf iOS
   beginnen sie an der **Textkante** — sie trennen Eintraege, und der Einzug zeigt, dass beide zur
   selben Gruppe gehoeren. Von Kante zu Kante zerlegt die Gruppe stattdessen in Streifen. Jetzt
   ein `::before` mit `left:15px`, also genau auf der Polsterung der Zeile (`::after` war vom
   Haken belegt). Gemessen: `left: 15px`.
2. **Die gewaehlte Zeile war fett — jetzt nicht mehr.** iOS macht das nicht; die Wahl steht im
   Haken, und zwar allein. Fett dazu ist doppelt gesagt und hat einen Preis: Beim Umschalten
   aendert die Zeile ihre Textbreite, und bei acht Sprachen ist das als Zucken zu sehen. Gemessen:
   `font-weight: 400`.

### Was ausdruecklich NICHT geaendert wurde

Die Gruppenkoepfe (`.settings-group h2`) bleiben Serifenschrift auf 17px **innerhalb** der Karte,
statt kleiner grauer Grossbuchstaben **ueber** der Karte wie in Einstellungen.app. Das waere nicht
mehr Bedienelement-Treue, sondern der Austausch der Markenstimme von Lucenta — die Serifenschrift
ist die Stimme der App. Der Auftrag nannte die Sprachauswahl und die Hell-Dunkel-Wahl, also die
Bedienelemente; den ganzen Bildschirm zu Einstellungen.app umzubauen war nicht gefragt und waere
schwer zurueckzunehmen.

### Messungen und Pruefungen

`npm run pruef-alles`: **ALLE 9 BESTANDEN**, 9,1 Minuten. `fehlersuche` **KEINE FUNDE** auf beiden
Motoren (26 Durchlaeufe), `pruef-nativ` 45/45, `pruef-app` 20/20, `audit-i18n` bestanden,
`pruef-store` 32/32, `diff-sprachen` 127 (unveraendert).

Jede Aenderung einzeln auf WebKit nachgemessen (Zahlen oben). Beim Druckzustand hat die **erste**
Messung „kein Glas" gemeldet — und war falsch: Der Schalter lag bei y=964 in einem 844 Punkte hohen
Fenster, der synthetische Klick landete ausserhalb, `:active` traf nie zu. Erkennbar war das daran,
dass auch die **bestehende** Regel (`width:33px` am Knopf) nicht griff. Mit
`scrollIntoViewIfNeeded()` dann: `blur(8px) saturate(1.8) brightness(1.06)` im Druck, `none` im
Ruhezustand, fuer Schalter und beide Segment-Zustaende. Eine Messung, die sich auf die falsche
Groesse bezieht — zum vierten Mal in diesem Projekt.

### Unsicher geblieben

- **Nicht angesehen.** Kein Bildschirmfoto, kein Blick aufs Gerät: Der Simulator meldete zweimal
  `applicationState: "Hanging"`, weil `pruef-alles` gleichzeitig vier Browser fuhr. Das ist der
  erste Punkt der Uebergabe oben, und es ist der wichtigste offene Punkt dieser Runde.
- **`prefers-reduced-transparency` ist ungemessen.** Playwright nimmt die Einstellung an, aber
  `matchMedia` meldet auf **beiden** Motoren `false` — nicht emulierbar. Der
  `prefers-contrast: more`-Zweig derselben Regel greift messbar (deckend, `filter:none`).
- **Der `@supports not (backdrop-filter)`-Zweig ist ungemessen**, weil beide Motoren
  `backdrop-filter` koennen. Gleiches gilt fuer die Rueckfaelle aus Runde 103.
- **Nicht committet.** Die Aenderungen liegen im Arbeitsbaum.

---

## 2026-09-16 (Runde 104) — Der `JS Eval error` nach drei Runden: Capacitor ruft ins Leere

**Auftrag:** Punkt 1 der Uebergabe — der `⚡️  JS Eval error A JavaScript exception occurred` beim
Start. Stand seit Runde 102 offen, der aelteste ungeklaerte Punkt. Die Uebergabe schlug den
Safari-Web-Inspector vor. Der war nicht noetig: Der Fehler laesst sich mit einem Haltepunkt
**eindeutig** zuordnen, und das liefert etwas, was die Konsole nicht liefert — die Rueckverfolgung.

### Die Eingrenzung, bevor geraten wurde

Die Zeichenkette `JS Eval error` steht in Capacitor an genau **zwei** Stellen
(`CapacitorBridge.swift:611` und `:627`), also in `evalWithPlugin(_:js:)` und `eval(js:)`. Alles
andere protokolliert ohne dieses Praefix. Damit war die Menge der Verdaechtigen klein und
abzaehlbar: Wer ruft beim Start `eval` auf?

- In Capacitor selbst nur **einer**: die beiden Beobachter in `setupCordovaCompatibility()`
  (Zeile 257–262), die `resume` und `pause` als Dokument-Ereignis weitergeben.
- In den sechs eingebauten Plugins (`@capacitor/haptics`, `app`, `filesystem`,
  `local-notifications`, `share`, `splash-screen`): **keiner**. Nachgesehen, nicht vermutet.

Die `else`-Zweig-Bedingung stimmte auch: `injectCordovaFiles` wird nur `true`, wenn
`packageClassList` `CDVPlugin` enthaelt — unsere Liste enthaelt sechs Capacitor-Plugins und kein
Cordova. Also lief genau der Zweig mit den Beobachtern.

### Der Beleg

Haltepunkt auf `triggerDocumentJSEvent`, Kaltstart, Treffer nach ~2 s. Die Rueckverfolgung:

    frame #0  CapacitorBridge.triggerDocumentJSEvent(eventName="resume")   CapacitorBridge.swift:650
    frame #1  closure #1 in CapacitorBridge.setupCordovaCompatibility      CapacitorBridge.swift:258
    frame #3  __CFNOTIFICATIONCENTER_IS_CALLING_OUT_TO_AN_OBSERVER__
    frame #8  -[UIApplication _sendWillEnterForegroundCallbacks]
    frame #22 -[UIApplication workspace:didCreateScene:withTransitionContext:completion:]

Und der Zustand des WebViews in genau diesem Augenblick, am Haltepunkt abgefragt:

    url=Optional(lucenta://localhost)  loading=Optional(true)  progress=Optional(0.1)

Damit ist die Kette geschlossen: UIKit stellt beim **Kaltstart** die erste Szene her und sendet
dabei `willEnterForeground` — das ist kein Rueckkehren aus dem Hintergrund, sondern Teil des
normalen Starts (`didCreateScene` im Rahmen #22). Capacitors Beobachter haengt zu diesem Zeitpunkt
schon (er wird in `viewDidLoad` gesetzt), der Seitenaufbau steht aber erst bei **10 %**. Also wird

    window.Capacitor.triggerEvent('resume', 'document')

in ein Dokument geschickt, in dem `window.Capacitor` noch **nicht existiert** — das Skript, das es
anlegt, wird bei `documentStart` eingespielt, und der ist noch nicht erreicht. `triggerEvent` selbst
kann nicht werfen (`native-bridge.js:222`, es verschickt nur ein `CustomEvent`); der Fehler ist der
`TypeError` auf dem undefinierten Empfaenger. WebKit meldet das als `WKError` 4, und dessen
`localizedDescription` lautet woertlich „A JavaScript exception occurred". Genau eine Zeile, genau
einmal, immer **vor** `WebView loaded` — wie beobachtet.

### Was daraus folgt: nichts tun, und warum das die Antwort ist

**Es ist kein Fehler von uns**, und die verlorene Nachricht ist bedeutungslos:

1. Das Ereignis heisst `resume`, wird aber beim **Start** gesendet — es gibt nichts
   fortzusetzen. Es ist ein Cordova-Kompatibilitaetsereignis fuer Apps, die es erwarten.
2. **Lucenta hoert nicht darauf.** Nachgesehen: kein `resume`- oder `pause`-Hoerer in `src/js/`.
3. Im **Release-Bau ist die Zeile nicht einmal sichtbar.** `loggingBehavior` ist standardmaessig
   `debug`, und `CAPInstanceConfiguration.m:24` setzt `loggingEnabled = debug` — `CAPLog.print`
   schweigt dann. Der Inhaber und die Nutzer sehen das nie; es war immer nur die Xcode-Konsole.

Die naheliegenden „Behebungen" sind alle schlechter als der Fehler:

- **Capacitor patchen** hiesse in `node_modules`/`Pods` schreiben — erzeugt, beim naechsten
  `pod install` weg, dieselbe Falle wie `capacitor.config.json` in Runde 103.
- **`loggingBehavior: "none"`** setzen wuerde die Zeile verstecken und mit ihr jede kuenftige
  echte Meldung der Bruecke. Ein Fehler, den man nicht mehr sieht, ist nicht behoben.

Deshalb steht der Punkt jetzt als **geklaert** in der Uebergabe und nicht mehr als Aufgabe. Der
Wert der Runde ist nicht eine Aenderung, sondern dass die naechste Sitzung nicht ein viertes Mal
danach sucht.

### Unsicher geblieben

Nur Debug-Bau, nur Simulator (iPhone 18 Pro, iOS 27.0). Dass die Zeile im Release-Bau ausbleibt,
ist aus `CAPInstanceConfiguration.m` **gelesen**, nicht an einem Release-Bau **gemessen** — das
waere mit einem Archiv-Bau nachzuholen, wenn der Inhaber ohnehin einen macht.

Keine Pruefung gelaufen: Diese Runde hat **keine Datei** in `src/`, `dist/` oder `ios/` geaendert,
nur dieses Journal. `pruef-alles` haette denselben Stand gemessen wie in Runde 103.

---

## 2026-09-16 (Runde 103) — Die StoreKit-Bruecke, und zwei Stellen, die das Abo verschenkten

**Auftrag:** der eigentliche Einreichungs-Blocker. `src/js/19b-native.js` rief seit Runde 99 ein
Capacitor-Modul namens `StoreKit` auf — **das es nicht gibt**, weder von Apple noch von Ionic. Der
Name war ein ehrlich vermerkter Platzhalter. Und zwei Stellen schalteten Lucenta+ ohne Zahlung
frei.

### Die Swift-Seite

`ios/App/App/LucentaKaeufePlugin.swift`, **StoreKit 2** (`Product`, `Transaction`), drei Aufrufe:
`stand()`, `kaufen({produkt})`, `restorePurchases()`. Produkte `lucenta.plus.monat` (4,99 EUR) und
`lucenta.plus.jahr` (29,99 EUR).

**StoreKit 2 und nicht `SKPaymentQueue`** aus einem Grund, der zum Projekt gehoert: Es prueft den
Kaufbeleg kryptografisch signiert **auf dem Geraet**. Es braucht keinen Beleg-Server — und ein
solcher Server waere die erste Stelle, an der Lucenta etwas nach aussen sendet. Damit waere
„Data Not Collected" falsch.

**Die Falle, die mich fast erwischt hat:** Capacitor 6 registriert Plugins **nicht** mehr ueber
die ObjC-Laufzeit, sondern liest `packageClassList` aus `capacitor.config.json`
(`CapacitorBridge.registerPlugins()`, nachgelesen im Pod). Die naheliegende Loesung waere, die
Klasse dort einzutragen — und `ios/App/App/capacitor.config.json` ist **erzeugt** und beim
naechsten `npx cap sync ios` ueberschrieben. Die Anmeldung waere spurlos weg, und die App faellt
dann still auf „gibt es nur in der App" zurueck: kein Fehler, keine Warnung, nur kein Kaufweg.
Deshalb `MainViewController.capacitorDidLoad()` + `registerPluginInstance()`, und die Klasse erbt
von `CAPInstancePlugin` — der Sorte, die die automatische Registrierung ueberspringt und damit
auch nicht doppelt registriert werden kann.

**Zwei eigene Irrtuemer beim Pruefen, beide gemeldet und beide harmlos ausgegangen:**
1. Ich suchte den Klassennamen im App-Binaer und fand **nichts** — und haette daraus fast
   geschlossen, die Datei sei nicht mitkompiliert. Falsche Datei: Xcode legt den Code eines
   Debug-Baus in `App.debug.dylib` und laesst im eigentlichen `App` nur einen 40-KB-Starter. Im
   Dylib steht der Name 120 Mal.
2. Die `Lucenta.storekit`-Testkonfiguration landete durch `XcodeWrite` in den **Ressourcen** und
   damit im App-Bundle. Testdaten in der ausgelieferten App gehoeren dort nicht hin; die Datei ist
   jetzt aus dem Projekt entfernt (auf der Platte bleibt sie), und das Schema verweist per Pfad
   darauf. Nachgemessen: Sie ist nicht mehr im Bundle, das Plugin weiterhin kompiliert.

### Die zwei Stellen, die das Abo verschenkten

- **`btnPlusAktivieren`** (der Knopf „Lucenta+ aktivieren") legte `plusSetzen(!istPlus())` um.
  Jetzt loest er den echten Kauf aus. Und wer Lucenta+ schon hat, kommt vom selben Knopf zur
  **Verwaltung bei Apple** — eine App darf ein Abo nicht selbst beenden. Der Knopf traegt dort
  „Abo verwalten" statt „Zur freien Fassung zurueck"; den Text gab es in allen acht Sprachen
  schon (`plus_verwalten`).
- **`plusSchalter`** (der Entwickler-Umschalter im Profil) erscheint nur noch **ohne** native
  Bruecke, also nur beim Entwickeln im Browser. Festgemacht an `nativVorhanden()` und nicht an
  einer Debug-Marke: Eine Marke, die man setzen muss, ist eine, die man vergisst — und dieses
  Vergessen kostet hier Geld.

### Drei Dinge, die vorher niemand verlangt hatte und die dazugehoeren

1. **Beim Start gilt, was der Store sagt** (`plusStandPruefen()`). Vorher stand der bezahlte
   Zustand allein in `localStorage`: Ein gekuendigtes Abo haette Lucenta+ dort **fuer immer**
   stehengelassen. Sobald Geld im Spiel ist, ist das ein Fehler.
   **Die Vorsichtsregel dabei ist wichtiger als die Sache selbst:** Weggenommen wird nur bei einer
   klaren Antwort. Keine Bruecke, ein Fehler, ein unerwartetes Ergebnis — dann bleibt alles wie es
   war. Sonst nimmt eine Stoerung im Store jemandem weg, wofuer er bezahlt hat.
2. **Vier Ausgaenge statt zwei.** Gelungen, abgebrochen, wartend („Bitten um Erlaubnis"),
   fehlgeschlagen. Ein Abbruch erzeugt **keine** Meldung — wer abbricht, weiss es; ihn zu
   benachrichtigen waere Gezeter. Ein wartender Kauf als Fehlschlag gemeldet hiesse, jemanden
   zweimal kaufen zu lassen. Dafuer zwei neue Texte in allen acht Sprachen (`plus_kauf_fehler`,
   `plus_kauf_wartet`, ueber `tools/_addkeys.py`).
3. **Die gekaufte Kennung steht in `lucenta_plus_produkt`** — getrennt von `lucenta_laufzeit`.
   Die Uebergabe verlangte, `lucenta_laufzeit` „zur Produktkennung des gekauften Abos" zu machen;
   ich habe das **bewusst anders** gemacht: `lucenta_laufzeit` ist die im Segmentwaehler gewaehlte
   Laufzeit und soll beim naechsten Oeffnen noch dort stehen, wo sie stand. Eine Notiz und ein
   Beleg sind zwei verschiedene Dinge, und `laufzeitLesen()` prueft gegen die Werte im Markup —
   eine Produktkennung im selben Schluessel haette den Waehler seine Wahl vergessen lassen.

### Geprueft

**Ohne echten Store, in `pruef-nativ` (jetzt 45 statt 27 Pruefungen):** die richtige
Produktkennung je Laufzeit; alle vier Ausgaenge (nur der gelungene schaltet frei, der Abbruch sagt
nichts); der Knopf fuehrt bei aktivem Abo zur Verwaltung und kauft nicht doppelt; **kein
`#plusSchalter` mit nativer Bruecke**; und die drei Startfaelle einschliesslich „eine Stoerung
nimmt nichts weg" (ueber ein echtes Neuladen gemessen — der gewuenschte Store-Zustand kommt dafuer
aus dem `localStorage`, weil ein Neuladen alles per `evaluate` Gesetzte wegwirft).

Ein eigener Fehlgriff dabei: Die ersten zwei Pruefungen der Hinweistexte schlugen fehl, weil ich
die Klasse `show` des Hinweises gemessen habe — `toast()` nimmt sie nach 1800 ms selbst zurueck,
und der Zeitgeber eines **vorherigen** Hinweises fiel mitten ins Messfenster. Ein Fehlschlag, der
von der Uhr abhaengt, ist kein Befund. Gemessen wird jetzt der **Text**.

**Am Simulator, und das ist der Teil, den nur diese Sitzung kann:** Die Anmeldung der Bruecke war
die eine Frage, die keine Pruefung hier beantwortet — ein Plugin, das sich nicht registriert,
sieht im JavaScript genauso aus wie ein Browser. Tippen auf „Kaeufe wiederherstellen" hat den
System-Dialog **„Bei Apple Account anmelden"** geoeffnet (das ist `AppStore.sync()` aus der
Swift-Datei), und nach dem Abbrechen stand in der App **„Kein aktives Abo fuer diese Apple-ID
gefunden."** Damit ist die ganze Kette belegt: Plugin registriert, JS ruft es, StoreKit 2
antwortet, und der abgebrochene Anmeldedialog wird — wie vorgesehen — **nicht** als Fehler
gemeldet. Gelesen habe ich dafuer die Bedienhilfen-Hierarchie als Text; **kein Bildschirmfoto**.

**Pflichtrunde:** `npm run pruef-alles` ALLE 9 BESTANDEN in 8,9 Minuten (`fehlersuche` KEINE FUNDE
ueber 26 Durchlaeufe auf beiden Motoren, `pruef-nativ` 45/45, `audit-i18n` bestanden mit den zwei
neuen Schluesseln, `diff-sprachen` unveraendert 127).

### Was offen bleibt

1. **Die zwei Produkte in App Store Connect anlegen** — `lucenta.plus.monat` und
   `lucenta.plus.jahr`, genau so geschrieben, in **derselben** Abo-Gruppe. Das kann nur der
   Inhaber, und ohne das findet `Product.products(for:)` nichts.
2. **Ein echter Kauf ist NICHT gelaufen.** Belegt ist der Weg bis in StoreKit hinein, nicht der
   Kauf selbst. `ios/App/App/Lucenta.storekit` traegt beide Produkte und das Schema verweist
   darauf; damit laeuft der Kauf im Simulator ohne Konto — **aber nur, wenn aus Xcode heraus
   gestartet wird** (ich habe ueber `simctl` gestartet, deshalb kam der Apple-Account-Dialog).
   Ob der Pfad im Schema richtig aufgeloest wird, ist damit **ungeprueft**; im Zweifel
   Product > Scheme > Edit > Run > Options > StoreKit Configuration.
3. **`plus_beenden` ist jetzt ein unbenutzter Schluessel** in allen acht Paketen. Ihn aus acht
   Dateien zu entfernen waere mehr Risiko als ein unbenutzter Text wert ist.

---

## 2026-09-16 (Runde 103) — Liquid Glass Schritt 2: Schublade und Dialoge

**Auftrag:** Punkt 1 der Uebergabe. Schritt 1 (Kopfleiste) war Runde 102 und am Geraet bestaetigt.

**Was Apple dazu sagt, nachgelesen statt geraten** (HIG, „Materials: Liquid Glass"): Das Material
ist die **funktionale Schicht** fuer Steuerung und Navigation, die ueber dem Inhalt schwebt — und
im Inhalt selbst hat es ausdruecklich nichts zu suchen („Don't use Liquid Glass in the content
layer"). Deshalb betrifft Schritt 2 genau drei Flaechen: die Schublade und die zwei Fenster.
Karten, Ansichten und Formulare bleiben unberuehrt.

Zwei Varianten gibt es: **regular** (unscharf, hebt die Helligkeit an) und **clear** (stark
durchscheinend, fuer Fotos und Videos). Fuer diesen Fall ist regular die richtige, wortwoertlich:
„Use the regular variant when background content might create legibility issues, or when
components have a significant amount of text, such as alerts, sidebars, or popovers."

**Geaendert** (`src/styles/00-grundlagen.css`):
- `#drawerPanel`: `color-mix(in srgb, var(--surface) 82%, transparent)` + `blur(20px)
  saturate(150%)`. **Deckender als die Kopfleiste** (82 gegen 74 %) — auch das steht so in der
  Leitlinie: „Liquid Glass appears more opaque in larger elements like sidebars to preserve
  legibility over complex backgrounds". Die Schublade traegt viel Text auf 340px Breite und volle
  Hoehe, und dahinter laeuft der Sternenhimmel.
- `#imgModal` und `#plusModal`: 86 %, gleiche Unschaerfe. Noch etwas deckender, weil im
  Bild-Fenster die **Vorschau des Ergebnisbildes** steht — ein Bild hinter Glas zu beurteilen
  ginge nicht. Die Verdunkler darunter (55 %) bleiben unveraendert; Apple nennt genau so eine
  Unterlage als richtig fuer durchscheinende Flaechen.
- **Keine neuen Farbmarken.** Bewusst `color-mix()` an der Stelle statt eines Tokens: Jede neue
  Marke braeuchte drei Bloecke (`:root`, `@media dark`, `[data-theme=dark]`), sonst bricht der Bau
  ab — und hier gibt es nichts zu variieren, was `--surface` nicht schon traegt.
- **Drei Rueckfaelle, gesammelt an einer Stelle**, damit wer einen aendert die anderen sieht:
  kein `backdrop-filter` (volldeckend — eine durchscheinende Flaeche OHNE Unschaerfe ist nicht
  weniger schoen, sondern unlesbar), `prefers-reduced-transparency` (abbestellt ist abbestellt),
  und **neu** `prefers-contrast: more`. Den dritten Fall gab es in Runde 102 nicht; Apple nennt
  beide Einstellungen in einem Atemzug, und eine durchscheinende Flaeche senkt den Kontrast des
  Textes darauf zwangslaeufig. Die **Kopfleiste ist dabei mitgenommen** — dort fehlte er bisher.

### Zwei Luecken, die erst durch diese Aenderung sichtbar wurden

**1. Den Ergebnisbild-Dialog hat nie eine Pruefung geoeffnet.** `fehlersuche` faehrt zwoelf Wege
ab; `#imgModal` war keiner davon, obwohl die Messung ihn kennt (er steht in der Liste „messe das
Fenster, nicht die Ansicht dahinter"). Dieselbe Luecke wie Runde 89 beim Lucenta+-Fenster, eine
Tuer weiter. Aufgefallen ist sie erst hier: **eine Aenderung am Aussehen eines Dialogs, den keine
Messung sieht, ist eine unbelegte Aenderung.**
Jetzt gibt es den Weg `bilddialog` (ueber `#btnShare`, den Weg eines Menschen), er prueft auch,
dass der Dialog eine **Vorschau zeigt** — ohne das waere ein leeres Fenster eine bestandene
Pruefung —, und er wartet auf den Zustand statt auf die Uhr, weil das Bild auf eine Leinwand
gemalt wird.
Dazu ein Nebenfund: Zwei Wege lassen ihr Fenster bewusst offen stehen (damit gemessen wird, was
jemand sieht), und `#shell` traegt dann `inert`. Der naechste Weg begann also hinter einem
Verdunkler. `zu()` raeumt jetzt mit **Escape** auf — alle drei Ueberlagerungen hoeren darauf.
Bisher ging das nur gut, weil `pluswerbung` zufaellig der letzte Eintrag war.

**2. Ob die Unschaerfe RENDERT, konnte keine Pruefung sagen.** Die Kontrastmessung liest
berechnete **Farben**. `backdrop-filter` auf einer verschobenen (`translateX`), scrollenden
Flaeche ist auf WebKit genau die wacklige Stelle — faellt der Filter aus, bleibt eine zu 82 %
durchscheinende Flaeche ueber einem bewegten Sternenhimmel, und niemand merkt es.
`pruef-app` hat deshalb zwei neue Pruefungen (jetzt **20 statt 18**): Es nimmt die offene
Schublade zweimal auf — einmal wie gebaut, einmal mit abgeschaltetem `backdrop-filter` — und
vergleicht die Bilder. Sind sie gleich, hat der Filter nichts getan. Gemessen wird damit nicht,
wie STARK die Unschaerfe ist, sondern DASS sie wirkt; das ist die Eigenschaft, die still
zurueckdriften kann. Ergebnis auf WebKit: 163867 gegen 162656 Byte — sie wirkt.

**Geprueft:** `npm run pruef-alles` — ALLE 9 BESTANDEN in 8,8 Minuten. `fehlersuche` KEINE FUNDE
ueber **26 Durchlaeufe auf WebKit und Chromium**, jetzt mit dem Bilddialog in jedem einzelnen;
`pruef-app` 20/20; `diff-sprachen` unveraendert 127. Build erfolgreich, die App-Fassung im Bundle
traegt 20 `backdrop-filter`-Stellen und den `prefers-contrast`-Rueckfall.

**Was NUR am Geraet zu beurteilen ist — und dem Inhaber gehoert:**
1. **Wie es aussieht.** Dass das Glas rendert, ist gemessen; ob 82 % ueber dem Sternenhimmel
   schoen sind, ist es nicht. Schiedsrichter ist die vergroesserte Darstellung, nicht die Kennzahl.
2. **Ob die Schublade noch geschmeidig einfaehrt.** Sie faehrt mit `transform` ueber .32s ein, und
   jetzt liegt ein `backdrop-filter` auf derselben Flaeche — das ist die teuerste Kombination, die
   WebKit kennt. `pruef-bewegung` meldet nichts, aber es messt im Browser auf einem Mac, nicht auf
   einem Telefon. Ruckelt es dort, ist die Unschaerfe von 20px der erste Hebel.

Bildschirmfotos habe ich dafuer bewusst **keine** gemacht: Der Pixelvergleich auf WebKit beweist
das Rendern guenstiger, und ein Simulator-Bild haette das Urteil ueber das Aussehen ohnehin nicht
ersetzt.

---

## 2026-09-16 (Runde 103) — kein Querformat, kein iPad; und eine Liste, die zwei Drittel log

**Auftrag:** „ok weiter", danach ausdruecklich bestaetigt: „kein querformat und kein ipad."

**Zuerst der Befund, dass die Aufgabenliste falsch war.** `tools/xcode-CLAUDE.md` fuehrte unter
„Was als Naechstes ansteht" vier Punkte. Nachgesehen statt geglaubt:

- Punkt 1, `NSPhotoLibraryAddUsageDescription`: **stand schon in der Info.plist** (Runde 102).
- Punkt 2, das Symbol: **lag schon im Asset-Katalog** — und zwar das richtige. Nachgemessen ueber
  den PNG-Kopf: color-type 2, also **ohne** Alphakanal, byte-identisch mit
  `assets/icon/lucenta-icon-1024.png`. (Die Datei `…-gerundet.png` hat color-type 6, also Alpha,
  und darf dort nicht hin.)
- Punkt 3, Hochformat: **offen**, und zwar als echter Fehler (siehe unten).
- Punkt 4, echtes iPhone: kann nur der Inhaber.

Zwei von vier Punkten waren erledigt, aber nicht abgehakt. Das kostet jede Sitzung, die die Liste
liest, die Zeit, es nachzusehen — die Liste ist deshalb jetzt eine **Stands**beschreibung mit den
Befehlen, die den Stand nachpruefen, keine Aufgabenliste mehr.

**Der Fehler:** `Info.plist` erlaubte dem iPhone `LandscapeLeft` und `LandscapeRight`, und
`TARGETED_DEVICE_FAMILY` war `1,2` — die App wurde also fuer iPhone **und iPad** gebaut. Beides
aus der Capacitor-Vorlage, beides nie angefasst.

Das ist keine Formalie. Das Stilblatt ist auf 320 bis 430 Punkte Breite gebaut, der Bau bricht bei
Desktop-Bezuegen ab (`pruefeIphoneOnly`), und die Fehlersuche messt ausschliesslich
Hochformat-Breiten. Querformat und iPad waren damit Zustaende, die **nie jemand entworfen und
keine der neun Pruefungen je gesehen** hat — erreichbar durch Drehen des Telefons. Bei erklaerter
iPad-Unterstuetzung prueft Apple die App ausserdem auf dem iPad.

**Geaendert:**
- `UISupportedInterfaceOrientations` traegt nur noch `UIInterfaceOrientationPortrait`.
  `PortraitUpsideDown` bewusst nicht — iPhones bieten es nicht an.
- Der `UISupportedInterfaceOrientations~ipad`-Block ist entfallen.
- `TARGETED_DEVICE_FAMILY = 1`.
- `UIRequiredDeviceCapabilities` von `armv7` auf `arm64`. Das war eine Angabe, die nicht stimmt:
  Deployment Target 15.0, und kein Geraet mit iOS 15 hat einen 32-Bit-Prozessor; `ARCHS` ist
  ohnehin nur arm64. Eine Anforderung, die kein Zielgeraet erfuellen kann, ist im schlimmsten Fall
  ein leerer Kompatibilitaetsbereich im Store.
- `UIRequiresFullScreen` bleibt ungesetzt, wie vorgesehen.

**Geprueft am gebauten Bundle, nicht an der Quelle** — denn eine Build-Einstellung kann die Plist
ueberstimmen (hier nicht: `GENERATE_INFOPLIST_FILE = NO`, und alle `INFOPLIST_KEY_*` sind leer,
aber das wusste ich vorher nicht und habe es nachgesehen):

| | Wert im `App.app/Info.plist` |
|---|---|
| `UISupportedInterfaceOrientations` | `UIInterfaceOrientationPortrait` |
| `UIDeviceFamily` | `1` |
| `UIRequiredDeviceCapabilities` | `arm64` |
| `UISupportedInterfaceOrientations~ipad` | nicht vorhanden |

Build erfolgreich. `src/` ist unberuehrt, die neun Pruefungen sind davon also nicht betroffen.

**Was unsicher bleibt:** Dass das Drehen am **Geraet** wirklich nichts tut, habe ich nicht
gesehen — nur die Angabe im Bundle, die es steuert. Das ist der Punkt, an dem der Inhaber es in
zwei Sekunden beantwortet.

---

## 2026-09-16 (Runde 103) — Pruefablauf: ein Befehl, halbe Zeit, und WebKit endlich dabei

**Auftrag:** „muessten bzw sollten wir die app architektur optimieren bzw verbessern damit
arbeitsablaeufe smoother laufen?" — Antwort war: die **Architektur** nicht (die 24 Teile in einer
IIFE sind nicht das, was bremst; ein Umbau auf Module traefe `build.js`, die vier
Abbruchpruefungen, `tests/run.js` und alle neun Pruefungen gleichzeitig, ohne etwas zu gewinnen),
der **Pruefablauf** sehr wohl. Drei Aenderungen, alle in `tools/`, `src/` unberuehrt.

### 1. Die Fehlersuche lief auf der falschen Maschine

`tools/fehlersuche.mjs` mass ausschliesslich **Chromium**. Das iPhone benutzt WebKit. Das war in
der Browsersitzung unvermeidlich (dort ist der Download gesperrt) und ist auf diesem Rechner
schlicht ein Loch gewesen — die Wurzel-`CLAUDE.md` nennt „`npm run fehlersuche` gegen WebKit
laufen lassen" seit Runden den wertvollsten Beitrag eines Macs, und getan hat es niemand.

Jetzt laufen **beide**, WebKit zuerst, der Motor steht in der Kennung jedes Fundes
(`webkit/320px/hell/tr/…`). 26 Durchlaeufe statt 13. **Ergebnis: KEINE FUNDE, auch auf WebKit** —
das ist der eigentliche Gewinn dieser Aenderung, denn diese Antwort gab es 103 Runden lang nicht.

Fehlt ein Motor (Browsersitzung), bricht die Pruefung **nicht** ab, sondern meldet laut, wie viele
Durchlaeufe ungemessen blieben. Eine uebersprungene Messung, die man nicht sieht, ist schlimmer
als keine.

### 2. Dreizehn Browserstarts nacheinander

Jeder Durchlauf startete einen **eigenen** Browser, alle nacheinander. Jetzt ein Browser je
Motor, je Durchlauf nur ein eigener Kontext (Speicher, Farbschema, Breite bleiben getrennt), vier
gleichzeitig: **26 Durchlaeufe in 4:00**, gemessen.

Zum Vorher-Wert bin ich ehrlich: Eine genaue Zahl habe ich vom alten Stand **nicht**. Der erste
Sammellauf dieser Sitzung wurde nach zehn Minuten abgeschnitten, waehrend die Fehlersuche noch
lief; sie brauchte danach losgeloest noch mehrere Minuten. Belegt ist also „13 Durchlaeufe,
deutlich ueber acht Minuten" gegen „26 Durchlaeufe, 4:00" — nicht mehr.

Dasselbe bei `diff-sprachen`, das dadurch zum neuen Engpass wurde (6:22): Es fuhr acht Rundgaenge
nacheinander auf einer Seite, obwohl sie unabhaengig sind — sie brauchen nur denselben
Datenbestand, und der liegt vollstaendig im localStorage. Jetzt wird der Bestand **einmal**
erzeugt (der Fragebogen muss dafuer wirklich durchlaufen werden) und jeder Sprache als eigener
Kontext mitgegeben. **2:03 statt 6:22.**

**Der Beleg, dass dabei nichts verlorenging, sind die Zahlen:** vorher 32/19/24/15/14/10/13,
Summe 127 — nachher identisch, Zeichen fuer Zeichen. Ein Rundgang, der unter Last eine Ansicht
verpasst, waere genau daran aufgefallen.

Was die Parallelitaet kostet, steht im Kopf der Datei: Beide Werkzeuge warten an vielen Stellen
feste Zeiten ab. Unter Last koennen die knapp werden — das ergaebe einen **falschen** Fund, nicht
einen verschwiegenen, also die Richtung, in der ein Fehler auffaellt. Vier ist deshalb bewusst
niedrig; `LUCENTA_PARALLEL=1` und `LUCENTA_NUR="320px/hell/tr"` fahren einen einzelnen Fund nach.

### 3. Neun Befehle und ein Server von Hand

    npm run pruef-alles       # alle neun, bringt den Server selbst mit
    npm run pruef-schnell     # Bau, Testreihen, Audit, App-Fassung — unter einer Minute

`tools/pruef_alles.mjs` startet den Server auf 8017 selbst (oder benutzt einen laufenden mit),
fuehrt billig vor teuer aus, zeigt **eine Zeile je Pruefung** und legt die vollstaendige Ausgabe
in `.pruef-log/<name>.log`. Bricht der Bau ab, hoert es auf — alles Weitere wuerde einen Stand
messen, den es nicht gibt. Der Exit-Code passt zum Ergebnis.

Der Server ist bewusst ein eigener kleiner Node-Server und nicht `python3 -m http.server`: Er
endet mit dem Prozess. Ein verwaister Server auf 8017 war bisher eine wiederkehrende Stolperfalle.

**Ein eigener Fehler dabei, gefunden bevor er schadete:** Der erste Entwurf behandelte
`diff-sprachen` als „Bericht" und setzte sein Ergebnis pauschal auf bestanden — womit ein
**Absturz** dieses Werkzeugs (es wirft bei „Fragebogen nicht durchgelaufen") lautlos als gruen
durchgegangen waere. Jetzt zaehlt auch dort der Exit-Code; nur die angezeigte Zeile ist eine Zahl
statt eines Urteils.

### Ergebnis

| | vorher | nachher |
|---|---|---|
| Befehle vor einem Commit | 9 + Server von Hand | **1** |
| `fehlersuche` | 13 Durchlaeufe, nur Chromium, >8 min | **26 (WebKit + Chromium), 4:00** |
| `diff-sprachen` | 6:22 | **2:03** |
| ganze Pflichtrunde | ~20 Minuten (geschaetzt) | **7,8 Minuten** (gemessen) |

**Geprueft:** `npm run pruef-alles` — ALLE 9 BESTANDEN, darunter `fehlersuche` mit KEINE FUNDE
ueber beide Motoren und `diff-sprachen` mit unveraenderten 127. Die Zahlen oben sind gemessen,
nicht geschaetzt.

**Was ich NICHT geaendert habe, und warum:** Die App-Architektur. Die gemeinsame IIFE sieht nach
Umbaubedarf aus, ist aber nicht der Engpass — die App-Datei ist nach der Sprachaufteilung 394 KB,
und der Start wird vom WebKit-Prozessstart bestimmt (1,3–4,5 s im Simulator), nicht von unserem
Text. Ein Modulumbau waere hohes Risiko fuer nichts, solange StoreKit-Bruecke, die zwei
Freischaltstellen und die Info.plist-Punkte offen sind.

---

## 2026-09-16 (Runde 103) — Sprachpakete aufgeteilt: App-Fassung 932 -> 394 KB

**Auftrag:** Punkt 1 der Uebergabe. Die acht Sprachpakete waren ~620 KB der 932 KB grossen
App-Fassung — zwei Drittel dessen, was WebKit beim Start parsen muss. Gelesen wird davon immer
genau **eines**. Die anderen sieben lagen mit im Parser, damit jemand die Sprache umstellen kann,
was fast niemand tut und niemand beim ersten Start tut.

**Was geaendert wurde.** Wie bei den Schriften in Runde 102 betrifft es **nur die App-Fassung**:

- `dist/index.html` traegt jetzt allein **Deutsch** eingebettet. Deutsch bleibt drin, weil es die
  Rueckfallsprache ist — `tx()` greift darauf zurueck, wenn ein Schluessel in der gewaehlten
  Sprache fehlt. Ohne eingebettetes Deutsch koennte die App ohne Nachladen gar nicht anlaufen.
- Die uebrigen sieben liegen als `dist/sprachen/<code>-<marke>.js` daneben (540 KB zusammen).
  Dateiname aus dem Inhalts-Hash, aus demselben Grund wie bei den Schriften: Ein alter Stand im
  WebView-Zwischenspeicher kann nicht stillschweigend weiterverwendet werden.
- `dist/lucenta.html` ist **unveraendert** und traegt weiter alle acht Pakete im Quelltext. Sie
  wird einzeln verschickt und ohne Server geoeffnet; nachgeladene Dateien zeigten dort ins Leere.
  Alle Pruefungen ausser `pruef-app` messen diese Fassung — die Aufteilung aendert also nichts
  daran, was sie sehen.

**Die Stelle, die nicht offensichtlich war:** Die nachgeladenen Dateien laufen im **globalen**
Bereich, `CONTENT` liegt aber in der gemeinsamen IIFE und ist von dort unerreichbar. `build.js`
huellt jedes Paket deshalb in eine Funktion mit eigenem `CONTENT` und uebergibt es am Ende an
`window.__lucentaSprachpaket` — eine Bruecke, die nur **entgegennimmt**. Die Quelldateien in
`src/i18n/` bleiben dadurch unveraendert fuer beide Fassungen brauchbar.

**Zwei Wege in `src/js/01-sprachpakete.js`:**
- `setLang(code)` holt ein fehlendes Paket nach und ruft sich danach selbst erneut auf; der zweite
  Durchlauf findet es vor und geht den gewohnten, synchronen Weg. Alle Aufrufstellen bleiben
  unveraendert. Ein unbekanntes Kuerzel ist wie bisher wirkungslos (`setLang('xx')`).
- Beim **Start** ist die gemerkte Sprache nicht da. Die App laeuft dann auf Deutsch an und stellt
  still um, sobald die Datei da ist — ohne das Aufblenden (`markLangShift`), das einen bewussten
  Sprachwechsel beantwortet: Hier hat niemand getippt. Das Umstellen passiert zwangslaeufig erst,
  nachdem der ganze eingebettete Code durchgelaufen ist (ein nachgeladenes Skript kann nicht
  mitten hinein), die Ansichten sind also aufgebaut.
- Ein Fehlschlag beim Laden laesst die App auf Deutsch stehen und wird **nicht** gemerkt: Ein
  zweiter Tipp darf es erneut versuchen. Lesbar ist besser als leer.

**Ergebnis, gemessen:**

| | vorher | nachher |
|---|---|---|
| Datei im Bundle, die beim Start geparst wird | 932 KB | **394 KB** (−58 %) |
| zusammen mit den Schriften beim Start | 1108 KB | **570 KB** (−49 %) |
| DOMContentLoaded (WebKit, kalt, 3 Laeufe) | 33 / 25 / 24 ms | **17 / 16 / 17 ms** |
| First Contentful Paint | 72 / 61 / 61 ms | 76 / 60 / 59 ms |

**Ehrlich dazu:** Das **Bundle** wird nicht kleiner (394 + 176 + 540 = 1110 KB, vorher 1108 KB) —
es wird nur nicht mehr vollstaendig beim Start gelesen. Und der Gewinn liegt im **Parsen** (DCL
halbiert), nicht im ersten Bild: FCP ist unveraendert, der wird von anderem bestimmt. Auf dem
Geraet, wo Parsen teurer ist als auf diesem Rechner, sollte mehr davon ankommen — **belegen kann
ich das nicht**, aus demselben Grund wie in Runde 102 (`simctl launch --console-pty` liefert
umgeleitet nicht alle Zeilen, der Bildvergleich ist zu varianzbehaftet). Das Urteil gehoert dem
Inhaber.

**Die Regel „die Zahl acht steht ausgeschrieben da" ist nicht umgangen, sondern verschaerft.**
`tests/lang_test.js` ist **unberuehrt**: Es misst `dist/lucenta.html`, wo alle acht Pakete inline
stehen — 324 Pruefungen, unveraendert bestanden. In `tools/pruef_appfassung.mjs` waere die alte
Quelltextsuche nach acht `CONTENT.xx =` ab jetzt **falsch** gewesen (steht Franzoesisch noch drin,
ist die Aufteilung nicht passiert). Sie fragt jetzt stattdessen den ganzen Weg ab, in WebKit:
Deutsch ist eingebettet; die sieben sind **nicht** eingebettet; sieben Dateien liegen da; der
**Start holt kein einziges** Paket; jede der sieben laedt nach und stellt sich ein
(`document.documentElement.lang`); keine Datei antwortet mit Fehler; mit der Sprache wechselt auch
der **sichtbare Text** (eine Bruecke, die das Paket entgegennimmt und wegwirft, faellt sonst nicht
auf); und der gefaehrlichste Fall zuletzt — Start **mit** gemerkter Sprache `ja`, per
`addInitScript` in den localStorage geschrieben, muss auf Japanisch enden. `pruef-app` hat
damit **18 statt 10** Pruefungen.

**Geprueft:** `node build.js`, `tests/run.js` 11/11 Reihen, `audit_i18n.py` bestanden,
`diff-sprachen`, `pruef-bewegung`, `pruef-nativ` 27/27, `pruef-store` 32/32, `pruef-app` 18/18,
`fehlersuche` (13 Konfigurationen).

**Offen geblieben:** Der eine Wimpernschlag Deutsch beim Start in einer anderen Sprache. Die Datei
liegt im Bundle daneben, nicht im Netz, und das Umstellen passiert innerhalb eines Aufgabenwechsels
— in WebKit war nie ein Zwischenzustand zu sehen. Ob das auf dem Geraet hinter dem Splash bleibt,
sieht man nur dort.

---

## 2026-09-09 (Runde 102) — neuer Auftrag; Info.plist Fotorechte

**Auftrag geaendert:** Die Aufteilung iOS-/App-Seite ist weg; diese Sitzung fuehrt und darf alles
aendern (`ios/`, `src/`, `docs/`, `tools/`, `tests/`). Oberflaechenfehler werden hier behoben. Die
Pruefpflicht (acht Durchgaenge vor jedem `src/`-Commit) liegt jetzt hier; Playwright + WebKit +
Chromium sind installiert (`npm i -D playwright`, `npx playwright install webkit chromium`).

### App-Fassung ohne Kommentare: 1523 -> 932 KB, und eine neunte Pruefung dafuer
- **Gemeldet:** „es hat immernoch zu lange gedauert und in diesem terminal hier sind gelbe und rote
  error meldungen."
- **Die Meldungen zuerst, gemessen:** Mit dem neuen Fehler-Logger steht im Log **kein**
  `[Lucenta]`-Eintrag — unser JavaScript wirft also keinen Fehler. Der `JS Eval error` kommt aus
  Capacitor selbst. Die uebrigen gelben/roten Zeilen sind Simulator-Interna
  (`Networking process took 1.26 seconds`, `WebContent 1.03 s`, `cfprefsd`, `UIKBRenderingLog`).
  Aus dem Log auch die echte Startzeit: `Loading app` -> `WebView loaded` = **4,2 s** im Debug-Bau,
  davon nur 1,3 s WebKit-Prozessstart. Es blieben also ~2,9 s fuer Laden und Parsen.
- **Woraus die Datei besteht** (gemessen, nicht geschaetzt): von 1233 KB waren **246 KB Kommentare**
  (42 % des JavaScripts, 52 % des CSS) und **677 KB die acht Sprachpakete** (55 %).
- **Aenderung:** Die App-Fassung (`dist/index.html`) wird jetzt ohne Kommentare gebaut — mit
  **esbuild** und ausschliesslich `minifyWhitespace`. `minifyIdentifiers` und `minifySyntax` bleiben
  bewusst **aus**: Kommentare zu entfernen kann die Bedeutung des Codes nicht aendern, Namen zu
  kuerzen oder Code umzuformen kann es, und die acht Pruefungen messen `lucenta.html`, nicht diese
  Fassung. Ebenso bewusst esbuild statt Regex: ein Regex ueber `//` und `/* */` zerschneidet
  `https://` in Strings, Regex-Literale und `content:"/*"` im CSS.
  `dist/lucenta.html` bleibt unveraendert vollstaendig — Projektgedaechtnis und Ein-Datei-Prinzip.
- **Ergebnis:** App-Fassung **931,8 KB** statt 1233 KB (−24 %); zusammen mit den ausgelagerten
  Schriften **von 1523 KB auf 932 KB (−39 %)**. Gemessen in Playwright-WebKit (3 Laeufe):
  | Fassung | FCP | DOMContentLoaded |
  |---|---|---|
  | Referenz (`lucenta.html`) | 232 / 75 / 76 ms | 128 / 32 / 33 ms |
  | App (`index.html`) | **72 / 61 / 61 ms** | **33 / 25 / 24 ms** |
  Kalt ist das erste Bild **69 %** frueher da, das DOM **74 %** frueher fertig.
- **Neue Pruefung `npm run pruef-app`** (`tools/pruef_appfassung.mjs`, 10 Pruefungen): Die acht
  Pruefungen messen alle `lucenta.html` — die Fassung im Bundle war damit als einzige **ungeprueft**
  unterwegs. Die neue Pruefung laedt `dist/index.html` in WebKit und fragt genau, was beim Umbau
  kaputtgehen kann: keine Ausnahme, Schriftdateien werden geholt und antworten ohne Fehler,
  Startansicht steht, Ueberschrift traegt Fraunces, drei Schriftfamilien geladen, Sprachwahl bietet
  acht Sprachen, und die Datei traegt alle acht `CONTENT.xx`-Pakete.
  Zwei eigene Fehlgriffe dabei, beide in der Pruefung und nicht in der App: „alle fuenf Schriften"
  war zu streng (mit `font-display:swap` holt WebKit nur die vier gebrauchten Schnitte), und
  `CONTENT` ist nicht global, sondern liegt in der gemeinsamen IIFE — der erste Sprachtest griff
  ins Leere und meldete mit einem zu losen Muster (`fr:{`) vier Sprachen als vorhanden, die es so
  gar nicht gab. Jetzt geprueft ueber die Sprachknoepfe im DOM **und** `CONTENT.xx=` im Quelltext.
- **Geprueft:** alle acht Pruefungen bestanden (fehlersuche KEINE FUNDE, pruef-nativ 27/27) plus
  pruef-app 10/10; Debug- und Release-Build SUCCEEDED; Huelle traegt 954 KB.
- **Was ich NICHT belegen kann:** Eine belastbare Startzeit-Zahl **im Simulator** nach der
  Aenderung. Die Log-Erfassung ueber `simctl launch --console-pty` liefert umgeleitet nicht alle
  Zeilen (auch nicht ueber `script`), und der Bildvergleich ist zu langsam und zu varianzbehaftet —
  ein erster Versuch lieferte widerspruechliche Werte (Release 12,5 s gegen vorher 3,4 s), weil die
  Erkennungsschwelle schon beim Splash ansprach. Belegt ist die Verbesserung ueber die Dateigroesse
  und die WebKit-Messung; das Urteil am Geraet gehoert dem Inhaber.
- **Groesster verbleibender Hebel:** Die acht Sprachpakete sind jetzt ~620 KB von 932 KB = **66 %**
  der App-Datei. Nur die gewaehlte Sprache zu laden (Deutsch inline, die uebrigen sieben bei Bedarf)
  wuerde die Datei etwa halbieren — ist aber ein Eingriff in `01-sprachpakete.js` und beruehrt die
  Regel aus der CLAUDE.md, dass die Zahl acht in `tests/lang_test.js` bewusst ausgeschrieben
  dasteht. Dem Inhaber vorgelegt, nicht eigenmaechtig gemacht.

### Schriften aus der HTML geloest (nur die App-Fassung) + Fehler werden endlich protokolliert
- **Auftrag:** „das zuende machen und die schriften."

**1. Schriften als Dateien — nur fuer die App.** Von den 1,5 MB der Seite waren 240 KB
base64-Schriften (fuenf Schnitte) in einer CSS-Regel im `<style>`; der Parser musste sie mitten im
Seitenaufbau dekodieren. `build.js` schreibt jetzt **zwei** Fassungen:
- `dist/lucenta.html` — **unveraendert eine einzige Datei** mit eingebetteten Schriften. Das
  Projektprinzip bleibt gewahrt: Diese Datei wird einzeln verschickt, als Artefakt veroeffentlicht
  und direkt im Browser geoeffnet; extern verlinkte Schriften wuerden dort ins Leere zeigen. Alle
  acht Pruefungen und der Vorschau-Server zeigen weiter hierauf und messen die vollstaendige Fassung.
- `dist/index.html` (1288 KB statt 1523 KB) + `dist/schriften/*.woff2` (5 Dateien, 176 KB) — die
  Fassung, die Capacitor aus dem Bundle laedt. Dateinamen tragen einen Inhalts-Hash, damit ein alter
  Stand im WebView-Zwischenspeicher nicht stillschweigend weiterverwendet wird. Bricht der Bau ab,
  wenn kein `url(data:font/woff2;base64,…)` mehr gefunden wird — sonst traegt die App-Fassung
  irgendwann lautlos keine Schriften.
- **Gemessen** (Playwright-WebKit, 3 Laeufe je Fassung, ueber den lokalen Server — bewusst dort statt
  im Simulator, weil dessen Prozessstart-Rauschen die Zahlen unbrauchbar macht):
  | Fassung | First Contentful Paint | DOMContentLoaded |
  |---|---|---|
  | inline (base64) | 622 / 283 / 271 ms | 320 / 137 / 113 ms |
  | extern (Dateien) | **235 / 225 / 269 ms** | **88 / 86 / 109 ms** |
  Beim **kalten** ersten Laden — dem App-Start-Fall — ist das erste Bild 62 % frueher da.
  `font-display:swap` stand schon im CSS, der Text erscheint also sofort in der Rueckfallschrift.
- **Ehrlich zur Groessenordnung:** Das sind ~100–380 ms. Gegen den WebKit-Prozessstart (3–4,5 s im
  Simulator) und den Debug-Overhead (7,6 s vs. 3,4 s Release) ist das der kleinere Posten. Auf dem
  Geraet, wo der Prozessstart kuerzer ist, faellt es entsprechend mehr ins Gewicht.
- **Geprueft:** alle acht Pruefungen bestanden (fehlersuche KEINE FUNDE, pruef-nativ 27/27);
  im Simulator laufen die Schriften sichtbar korrekt (Fraunces in der Ueberschrift, Work Sans im
  Text, IBM Plex Mono in den Marken); Build ohne Warnungen.

**2. Unerwartete Fehler werden jetzt protokolliert.** Das globale Auffangnetz in `00-start.js`
zeigte nur den Hinweis-Toast und verschwieg, WAS schiefging — in der Huelle gibt es keine
Entwicklerkonsole, und im Xcode-Log stand nur Capacitors nichtssagendes „JS Eval error A JavaScript
exception occurred". Jetzt schreibt es zusaetzlich `console.error('[Lucenta]', stack…)`, was ueber
Capacitors Console-Bruecke im Xcode-Log landet. **Bewusst ohne deutschen Klartext:**
`tools/audit_i18n.py` verbietet deutsche Literale im JavaScript (Pruefung 6 schlug beim ersten
Versuch genau darauf an) — die Marke und der Fehler selbst genuegen.
- **Offen:** Der `JS Eval error` selbst ist damit noch nicht erklaert; er trat im Log **vor**
  `WebView loaded` auf, also bevor unser Auffangnetz haengt. Verdacht bleibt Capacitors eigenes
  Bridge-Injection-Timing. Beim naechsten Start sollte im Log stehen, ob zusaetzlich ein eigener
  Fehler dahintersteckt.

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

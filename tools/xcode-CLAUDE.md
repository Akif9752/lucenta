# Lucenta — die iOS-Huelle

Diese Datei wird von `npm run ios:claude` nach `ios/App/CLAUDE.md` kopiert, weil der
Claude-Agent in Xcode seine Anweisungen **neben der `.xcodeproj`** sucht und die `CLAUDE.md`
im Wurzelverzeichnis des Projekts dort nicht findet. Geaendert wird sie hier in
`tools/xcode-CLAUDE.md` — die Kopie in `ios/` ist erzeugt und geht beim naechsten
`npx cap add ios` verloren.

## Das Wichtigste zuerst

**`ios/App/public/` ist erzeugt. Niemals dort hineinschreiben.** Der Ordner ist eine Kopie von
`dist/lucenta.html`, angelegt von `npx cap sync ios`. Jede Aenderung dort ist beim naechsten
Sync weg — spurlos, ohne Warnung, ohne Konflikt.

Und `dist/` ist selbst erzeugt: `node build.js` setzt es aus `src/` zusammen. Es gibt also
**drei** Kopien derselben Oberflaeche, und nur die erste ist echt:

    src/            <- hier wird geaendert
      |  node build.js
    dist/index.html + dist/schriften/ + dist/sprachen/   (und dist/lucenta.html als Ein-Datei-Fassung)
      |  npx cap sync ios
    ios/App/App/public/

Wer einen Fehler in der Oberflaeche findet, aendert `src/` und laesst dann laufen:

    npm run ios:sync      # = node build.js && npx cap sync ios

## Umfang: das ganze Projekt

Ab Runde 102 auf ausdruecklichen Wunsch des Inhabers: **Diese Sitzung darf alles aendern** —
`ios/` ebenso wie `src/`, `docs/`, `tools/`, `tests/`. Es gibt keine Aufteilung mehr zwischen
einer "iOS-Seite" und einer "App-Seite". Ein Fehler in der Oberflaeche wird hier behoben, nicht
gemeldet.

Die parallele Sitzung im Browser arbeitet ab jetzt nur noch, wenn sie ausdruecklich gefragt
wird — sie schaut sich Meilensteine an, prueft mit, und fasst von sich aus nichts an. Wer hier
committet, hat das letzte Wort.

Was damit auf diese Sitzung uebergeht, ist die **Pruefpflicht**. Sie stand bisher drueben und
ist kein Formalismus: Die Oberflaeche traegt acht Sprachen, zwei Farbmodi, Bildschirmbreiten
von 320 bis 430 Punkten und einen Bau, der bei vier Verstoessen abbricht.

**Vor jedem Commit, der `src/` beruehrt — ein Befehl:**

    npm run pruef-alles       # alle neun, ~8 Minuten, bringt den Server selbst mit

**Waehrend der Arbeit, fuer den Zwischenstand:**

    npm run pruef-schnell     # Bau, Testreihen, i18n-Audit, App-Fassung — unter einer Minute

`pruef-alles` (Runde 103, `tools/pruef_alles.mjs`) startet den Server auf Port 8017 selbst,
benutzt einen bereits laufenden mit, fuehrt billig vor teuer aus, zeigt eine Zeile je Pruefung
und legt die vollstaendige Ausgabe in `.pruef-log/<name>.log`. Bricht der Bau ab, hoert es auf —
alles Weitere wuerde einen Stand messen, den es nicht gibt. Der Exit-Code passt zum Ergebnis.

Die neun einzeln, falls eine davon nachzufahren ist:

    node build.js
    node tests/run.js              # 10 Reihen
    python3 tools/audit_i18n.py    # 8 statische Pruefungen ueber alle 8 Sprachen
    npm run pruef-store            # Zeichenzahlen der Store-Texte
    npm run pruef-app              # 29 Pruefungen an dist/index.html (die Fassung im App-Bundle)
    npm run pruef-nativ            # 51 Pruefungen, stellt Capacitor im Browser nach
    npm run pruef-bewegung
    npm run diff-sprachen          # ein BERICHT, kein Bestanden/Durchgefallen
    npm run fehlersuche            # 26 Durchlaeufe: 13 Konfigurationen x WebKit + Chromium

Die letzten fuenf brauchen Playwright und den Server auf Port 8017
(`cd dist && python3 -m http.server 8017 --bind 127.0.0.1` — oder eben `pruef-alles`). Fehlt
Playwright: `npm i -D playwright && npx playwright install chromium webkit`. Laesst sich eine
Pruefung auf diesem Rechner nicht ausfuehren, gehoert das ins Journal — nicht stillschweigend
uebersprungen.

**Die `fehlersuche` laeuft seit Runde 103 auf BEIDEN Motoren**, WebKit zuerst. Vorher war sie
reines Chromium — die Maschine, die das iPhone nicht benutzt. Zum Nachfahren eines einzelnen
Fundes:

    LUCENTA_MOTOREN=webkit LUCENTA_PARALLEL=1 LUCENTA_NUR="320px/hell/tr" npm run fehlersuche

`LUCENTA_PARALLEL=1` ist dabei wichtig: Vier gleichzeitige Durchlaeufe koennen eine feste
Wartezeit knapp werden lassen, und ein knapp gemessener Fund ist ein falscher Fund.

**`pruef-app` ist neu (Runde 102) und schliesst eine Luecke:** Seit dieser Runde gibt es ZWEI
gebaute Fassungen. `dist/lucenta.html` ist die Ein-Datei-Fassung mit eingebetteten Schriften,
allen acht Sprachpaketen und vollstaendigen Kommentaren — darauf zeigen alle anderen Pruefungen.
`dist/index.html` ist die Fassung im App-Bundle: Schriften als Dateien in `dist/schriften/`,
Kommentare von esbuild entfernt, und seit Runde 103 nur noch **Deutsch** eingebettet — die uebrigen
sieben Sprachen liegen in `dist/sprachen/` und werden beim Umstellen geholt. 394 statt 1523 KB.
Genau die laedt das iPhone, und genau die war als einzige ungeprueft.

Daraus folgt eine Falle fuer jede Pruefung, die den **Quelltext** der App-Fassung durchsucht: Was
in `lucenta.html` steht, muss dort **nicht** stehen. Die alte Suche nach acht `CONTENT.xx =` waere
ab Runde 103 falsch gewesen — `pruef-app` fragt deshalb den Weg ab (umstellen und nachsehen, ob die
Sprache ankommt), nicht den Text.

### Pruefungen buendeln, nicht pollen

Dafuer ist `npm run pruef-alles` da. Es laeuft rund acht Minuten; wenn die Umgebung einen Befehl
nach zehn Minuten abschneidet, losgeloest starten und **einmal** nachsehen:

    nohup npm run pruef-alles > /tmp/pruef.log 2>&1 &
    # spaeter, ein einziges Mal:
    tail -20 /tmp/pruef.log

Nicht im Minutentakt nach dem Zwischenstand fragen.

Der Grund ist nicht Bequemlichkeit: Jede Zwischenabfrage ist ein eigener Durchgang, in dem der
ganze bisherige Verlauf erneut verarbeitet wird. Auf dem 5-Stunden-Kontingent des Inhabers waren
das messbar 40–50 %, verbraucht fuer Vorgeschichte statt fuer Arbeit. Dasselbe gilt fuer
**Bildschirmfotos**: Ein Simulator-Bild in voller Auflaesung (1206×2622) kostet so viel wie mehrere
Seiten Text und bleibt im Verlauf. Deshalb sparsam damit — `clip` auf den fraglichen Ausschnitt,
und nur wenn wirklich etwas zu SEHEN ist. „Laeuft die App?" beantwortet
`xcrun simctl spawn <id> launchctl list | grep lucenta` ohne ein einziges Bild.

Und ein Vorteil, den nur diese Sitzung hat: **Sie kann auf WebKit messen.** Die Browsersitzung
hat ausschliesslich Chromium; der Download von WebKit ist dort gesperrt. Zwei der bisher
teuersten Fehler (die Silbentrennung, die im Chromium unsichtbar blieb, und die beiden
Scroll-/Safe-Area-Fehler) waren genau deshalb 99 Runden lang unentdeckt. Wo es um Aussehen
geht, ist das Geraet hier der Schiedsrichter.

## Kommentare: kurz, das Warum, keine Geschichte

Seit Runde 138 (Auftrag des Inhabers, die Arbeit zu beschleunigen) sind die Kommentare in `src/`
um rund ein Drittel gekuerzt. Regel fuer neue: Ein Kommentar sagt, was man dem Code NICHT ansieht —
eine Falle, eine Abhaengigkeit, eine Entscheidung des Inhabers (kurz: "Entscheidung des Inhabers").
Die Geschichte dahin (welche Runde, was gemeldet wurde, was vorher falsch war, wie gemessen wurde)
gehoert ins Journal und in die Commit-Nachricht, nicht in den Code. Faustregel: hoechstens drei Zeilen.

Eine Kommentarzeile ist eine MARKE und darf nicht umformuliert werden: `// ---------- wiring ----------`
in `src/js/20-wiring.js` — `tests/run.js` schneidet den Code dort ab. `src/styles/00-schriften.css`
ist erzeugt (`tools/schriften_holen.mjs`), nicht von Hand aendern.

## Fuehre ein Journal

Jede Aenderung gehoert nach `docs/ios-huelle-journal.md` (zwei Ebenen ueber diesem Ordner):
was war der Fehler, was wurde geaendert, warum. Neueste Eintraege oben. Lies es zu Beginn,
schreib es am Ende fort.

Seit Runde 102 ist das Journal nicht mehr die Uebergabe an eine parallele Sitzung, sondern der
**Bericht an den Inhaber** — er liest hier nach, was geschehen ist, und legt einzelne Staende
gelegentlich der Browsersitzung zur Durchsicht vor. Entsprechend schreiben: nicht "erledigt",
sondern was der Fehler war, warum die Aenderung ihn behebt, und was daran unsicher blieb.
Eine Pruefung, die auf diesem Rechner nicht lief, gehoert ebenfalls hierher.

Die vollstaendigen Regeln des Projekts stehen in der `CLAUDE.md` im Wurzelverzeichnis (zwei
Ebenen ueber diesem Ordner): die gemeinsame IIFE, die drei Farbbloecke, die
Abbruchpruefungen des Baus, und zwei Lehren, die je dreimal bezahlt wurden. Lies sie zuerst —
sie erklaeren, warum der Bau abbricht, bevor du raetst.

Eine davon betrifft diese Sitzung unmittelbar: `pruefeTransparenzTueren` (Runde 106). „Transparenz
reduzieren" ist auf dem iPhone nativ nachgebaut, weil WebKit `prefers-reduced-transparency` nicht
kennt — `MainViewController.swift` setzt `data-transparenz="reduziert"` an `:root`. Jede Regel fuer
diesen Fall steht deshalb **zweimal** im Stilblatt, und der Bau bricht ab, wenn nur eine der
beiden geaendert wird. Die Begruendung steht einmal, bei der Kopfleiste in `00-grundlagen.css`.

## Die Huelle: was erledigt ist

Diese Liste war bis Runde 103 eine Aufgabenliste und zu zwei Dritteln veraltet — erledigt, aber
nicht abgehakt. Jetzt steht hier der **Stand**, damit niemand zweimal dasselbe sucht:

- **`NSPhotoLibraryAddUsageDescription`** steht in `Info.plist` (Runde 102). Ohne den Eintrag
  stuerzt die App beim ersten "In Fotos sichern" ab, statt zu fragen.
  Fuer lokale Mitteilungen ist **kein** Info.plist-Eintrag noetig — nur die Laufzeit-Abfrage,
  die `src/js/19b-native.js` bereits stellt.
- **Das Symbol** liegt im Asset-Katalog: `AppIcon-512@2x.png`, unser 1024er **ohne** Alphakanal
  (nachgemessen: PNG color-type 2). `assets/icon/lucenta-icon-1024-gerundet.png` hat einen
  Alphakanal und darf **nicht** dorthin — Apple weist PNG mit Transparenz zurueck.
- **Hochformat und iPhone, nichts sonst** (Runde 103, auf ausdrueckliche Bestaetigung des
  Inhabers: "kein querformat und kein ipad"). `UISupportedInterfaceOrientations` traegt nur noch
  `Portrait`, `TARGETED_DEVICE_FAMILY` ist `1`, der `~ipad`-Block ist entfallen.
  Der Grund ist kein Geschmack: Das Stilblatt ist auf 320–430 Punkte gebaut und die Fehlersuche
  messt ausschliesslich Hochformat-Breiten — Querformat oder iPad waere ein Layout, das nie
  jemand entworfen und keine Pruefung je gesehen hat. `UIRequiresFullScreen` bleibt ungesetzt.
  Nachgeprueft wird das am **gebauten** Bundle, nicht an der Quelle:

      plutil -extract UISupportedInterfaceOrientations xml1 -o - <App.app>/Info.plist
      plutil -extract UIDeviceFamily xml1 -o - <App.app>/Info.plist

- **`UIRequiredDeviceCapabilities`** ist `arm64` statt des `armv7` aus der Capacitor-Vorlage:
  Deployment Target ist 15.0, kein Geraet mit iOS 15 hat einen 32-Bit-Prozessor, und gebaut wird
  ohnehin nur arm64.

**Offen und nur vom Inhaber zu erledigen:** die App auf einem **echten iPhone** laufen lassen.
Eine freie Apple-ID genuegt (7-Tage-Signatur); der bezahlte Account wird erst fuer TestFlight,
App Store Connect und die Abo-Produkte gebraucht.

## Die Kauf-Bruecke — steht seit Runde 103

`ios/App/App/LucentaKaeufePlugin.swift`, StoreKit 2, angemeldet unter dem Namen `StoreKit`, weil
`src/js/19b-native.js` ihn so ruft. Drei Aufrufe:

- `stand()` -> `{aktiv, produkt}` — fragt nur das Geraet, zeigt keinen Dialog. Laeuft beim Start.
- `kaufen({produkt})` -> `{aktiv, produkt}` bzw. `{abgebrochen}` / `{wartet}` / `{unbestaetigt}`
- `restorePurchases()` -> `{aktiv, produkt}` — ruft `AppStore.sync()` (Richtlinie 3.1.2)

Produkte: `lucenta.plus.monat` (4,99 EUR) und `lucenta.plus.jahr` (29,99 EUR), dieselbe
Abo-Gruppe. Die Liste steht **zweimal** — in der Swift-Datei und in `19b-native.js`. Das ist
Absicht: Die Swift-Seite weist eine Kennung ab, die sie nicht kennt, statt sie an den Store zu
geben.

**Vier Dinge daran, die man sonst neu lernt:**

1. **Die Anmeldung gehoert in `MainViewController.capacitorDidLoad()`, nicht in die
   `packageClassList`.** Capacitor 6 registriert Plugins nicht mehr ueber die ObjC-Laufzeit,
   sondern aus `capacitor.config.json` — und die Datei in `ios/App/App/` ist **erzeugt**. Ein
   Eintrag dort ist beim naechsten `npx cap sync ios` weg, und die App faellt still auf "gibt es
   nur in der App" zurueck. Deshalb `registerPluginInstance()` und `CAPInstancePlugin`.
2. **Die Klasse heisst nicht `StoreKit`** (Namenskonflikt mit Apples Framework), nach aussen
   schon.
3. **Weggenommen wird nur bei einer klaren Antwort.** `plusStandPruefen()` richtet sich beim Start
   nach dem Store: abgelaufen -> Lucenta+ zurueck, laufend -> frei. Antwortet der Store nicht oder
   mit einem Fehler, bleibt alles wie es war. Sonst nimmt eine Stoerung jemandem weg, wofuer er
   bezahlt hat.
4. **Kein Beleg-Server, und das muss so bleiben.** StoreKit 2 prueft die Signatur auf dem Geraet.
   Ein eigener Server waere die erste Stelle, an der Lucenta etwas nach aussen sendet — und damit
   waere "Data Not Collected" falsch.

**Die zwei Stellen, die das Abo verschenkten, sind zu** (frueher der Hauptauftrag hier):
`btnPlusAktivieren` loest den echten Kauf aus; `plusSchalter` im Profil erscheint nur noch **ohne**
native Bruecke, also nur beim Entwickeln im Browser. Die gekaufte Kennung steht in
`lucenta_plus_produkt` — getrennt von `lucenta_laufzeit`, das die im Waehler gewaehlte Laufzeit
merkt. Eine Notiz und ein Beleg sind zwei verschiedene Dinge.

**Geprueft wird das ohne Store:** `npm run pruef-nativ` (51 Pruefungen) stellt die Bruecke nach und
misst alle vier Ausgaenge des Kaufs, das Nachziehen beim Start (einschliesslich "Stoerung nimmt
nichts weg") und dass es in der App **keinen** Entwickler-Umschalter gibt.

**Lokal mit echtem StoreKit testen:** `ios/App/App/Lucenta.storekit` traegt beide Produkte, das
Schema `App` verweist darauf. Im Simulator laufen Kauf, Abbruch und Wiederherstellen damit ohne
App-Store-Connect-Konto und ohne Sandbox-Anmeldung.

**Offen und nur vom Inhaber zu erledigen:** die zwei Produkte in App Store Connect anlegen, genau
mit diesen Kennungen und in derselben Abo-Gruppe.

## Was die App verspricht und der Code halten muss

Lucenta sendet nichts. Kein eigener Server, kein Konto bei uns, keine Werbung, kein Tracking, kein
Fremdabruf; die Schriften liegen als Daten in der Datei. Einzige Ausnahme (Runde 149, Entscheidung des
Inhabers): freiwillig „Mit Apple anmelden“ — der Bestand liegt dann Ende-zu-Ende verschluesselt in der
privaten iCloud der Person (`LucentaKontoPlugin.swift`, `encryptedValues`, ohne Name/E-Mail-Abfrage). Die Store-Angabe lautet entsprechend
"Data Not Collected". Ebenso auf dem Geraet bleiben: der Spiegel des Bestands (`LucentaBestand.swift`), das
Tagesform-Widget (App Group `group.app.lucenta.ios`, `LucentaWidgetBruecke.swift`) und Apple Health (nur schreiben,
`LucentaGesundheitPlugin.swift`). `capacitor.config.json` setzt dazu passend
`limitsNavigationsToAppBoundDomains: true`.

Was auch immer hier hinzukommt: Sobald irgendetwas nach aussen geht — ein Absturzberichts-
dienst, eine Statistik, eine Schriftart von einem CDN —, ist diese Angabe falsch, und aus
einer Formalie wird ein Problem. Im Zweifel nachfragen, nicht einbauen.

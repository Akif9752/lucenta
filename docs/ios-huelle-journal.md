# Journal der Xcode-/iOS-Sitzung

Dieses Journal fuehrt die **fuehrende Sitzung** (Xcode/Mac). Seit Runde 102 ist es der **Bericht an
den Inhaber**, nicht mehr die Uebergabe an eine zweite Sitzung: was war der Fehler, warum behebt die
Aenderung ihn, und was daran unsicher blieb. Eine Pruefung, die auf diesem Rechner nicht lief,
gehoert ebenfalls hierher — nicht stillschweigend uebersprungen. Neueste Eintraege oben.

---

## ÜBERGABE an die naechste Sitzung (Stand 2026-10-12, nach Runde 126)

**Lies NUR diesen Block.** Er genuegt allein; die Eintraege darunter sind Begruendungen zum
Nachschlagen. Dazu `tools/xcode-CLAUDE.md` (liegt als `ios/App/CLAUDE.md` neben der `.xcodeproj`
und wird von Xcode geladen) und die `CLAUDE.md` im Wurzelverzeichnis.

Bis Runde 120 stand hier noch der Stand nach Runde 111 — nur die Ueberschrift war mitgewandert.
Dieser Block ist in Runde 121 neu geschrieben und in Runde 122 nachgezogen.

### Wie der Inhaber arbeitet

Kein Listenauftrag mehr. Die 18-Punkte-Liste aus Runde 107 ist **vollstaendig abgearbeitet**
(Runde 107–112). Seit Runde 113 kommen die Auftraege **einzeln, im Gespraech**, meist mehrere in
einer Nachricht, oft mit „weiter". Die Richtung aller Auftraege seit Runde 114 ist dieselbe:
**„mach es wie iOS von Apple"** — Formensprache, Farben, Bewegung, Liquid Glass — und **Avatare,
die wie die echten Tiere aussehen**.

Zwei Regeln, die er ausdruecklich gesetzt hat und die weiter gelten:
- **Nichts stillschweigend gegen eine dokumentierte Entscheidung aendern.** Fragen, nicht raten.
- **Kontingent sparen:** Pruefungen buendeln, nicht pollen; Bildschirmfotos sparsam und beschnitten.

### Was die letzten Runden gebaut haben (nicht neu erfinden)

| Runde | Commit | Inhalt |
| --- | --- | --- |
| 126 | (dieser) | Kein Zoom in der App (Felder 16 pt, Hülle sperrt Zoom), Haptik bei jedem Tipp, Hilfe aufklappbar, überall SF, Rechtliches als leise Zeile |
| 125 | `5645f4a` | Eigene 3D-Tiere im Pixar-Stil: `tools/figuren_rendern/` (SceneKit, Abstandsfelder), wieder Dackel/Golden Retriever, Fluent und Lizenzhinweis entfallen |
| 124 | `7f29388` | Tagesform neu: fünf Big-Five-Fragen je Tag, Stichworte, Bandbreite um das Testergebnis, Monatskalender, Muster (Plus), Erinnerung in der Ansicht, Tipp auf Mitteilung öffnet sie, Zeile in der Schublade |
| 123 | `c417abe` | Tier-Avatare als Fluent-Emoji-3D-Bilder (`src/figuren/`, `tools/figuren_holen.py`), Vektorzeichnung entfallen, Pudel/Hund statt Dackel/Retriever, MIT-Hinweis in Ueber Lucenta |
| 122 | `5d6aaa6` | Startbild nur noch Papierflaeche (kein Schwarz, kein beiges Quadrat), Huelle kennt das gewaehlte Farbschema (`lucentaThema` -> UserDefaults), Glas hell durchsichtiger, keine Silbentrennung in der Schublade |
| 121 | `67b5e67` | Liquid Glass (Schublade, Knoepfe, Toast, Plus-Dialog), Startbewegung, Verlaufskurve nach Apple Health, Meeresschildkroete, Abbruch beim Wiederherstellen nimmt Lucenta+ nicht mehr weg |
| 120 | `a3b504a` | Auswahl-Haekchen an Avatar/Hintergrund, Apples Farbsystem hell/dunkel, Federbewegung |
| 119 | `355f90a` | Jedes Tier einzeln gezeichnet (keine Schablone), Fellfilter |
| 118 | `54644d9` | Fische, Schildkroete, Wal, Eule nach echter Anatomie |
| 117 | `04e3b37` | Tieraugen statt Menschenaugen (`figTierAuge`) |
| 114–116 | `4958bc8` … `69d8024` | Menschenfiguren entfallen (Monogramm wie in Kontakte), Einstellungen/Schublade/Profil als iOS-Liste, Systemschrift fuer Text |
| 113 | `752168b` | Plus-Umschalter im Profil — **nur im Entwicklungsbau** (`#if DEBUG` in `MainViewController.swift`) |

Wo was steht: iOS-Formensprache, Bewegung und Liquid Glass in **`src/styles/12-ios.css`** (letzte
Datei im Manifest, schlaegt die aelteren); Farbmarken einschliesslich `--glas*` in
`00-grundlagen.css` (je drei Bloecke!); die Tiere seit Runde 123 als Bilder in `src/figuren/` (erzeugt von
`tools/figuren_holen.py`, eingesetzt von `build.js` in `FIGUR_BILDER` in `13-figuren.js`); die Verlaufskurve in
`trendKurveSVG()` in `05-verlauf.js`; die Tagesform in `07-tagesform.js` (Erfassung, Verlauf, Befunde) und seit Runde 124
`07b-tagesform-alltag.js` (Big-Five-Fragen, Stichworte, Bandbreite, Kalender, Muster); die Startbewegung in `startBewegung()` in
`21-beta-rueckmeldung.js` mit `#startOverlay` in `index.body.html`.

### Was offen ist — nach Runde 124

Runde 122 hat die drei offenen Punkte aus Runde 121 behoben (Glas hell, Schwarz vor dem Start,
Silbentrennung in der Schublade), Runde 123 die Avatare durch 3D-Bilder ersetzt, Runde 124 die
Tagesform neu gebaut. Was bleibt:

1. **Tagesform am echten Geraet**: vor allem der Tipp auf die Mitteilung, der die Tagesform oeffnen
   soll — im Simulator nicht ausgeloest. Und die Polwoerter der fuenf Fragen („kuehl ↔ herzlich",
   „locker ↔ gruendlich" …) brauchen das Urteil des Inhabers, bevor viele Tage damit erfasst sind.
2. **Steht die App auf eine andere Farbe als das System**, zeigt das allererste Startbild die
   Systemfarbe; danach folgt alles der App. Das zeichnet iOS vor dem Start der App — nicht noch
   einmal suchen.
3. **Die Ladeluecke** (Debug-Bau ~3 s Startbild + ~2 s leere Flaeche vor der Startbewegung) ist
   nicht kuerzer, nur nicht mehr schwarz. Am echten Geraet im Release-Bau beurteilen.
4. **Simulator-Stand**: Lucenta+ an, Dunkel, Deutsch, Beispieldaten geladen (mit den neuen Feldern).
5. **Urteil des Inhabers ausstehend** zu Runde 119–124: Haekchen, Farben, Glas, Kurve,
   Startbewegung, das bildlose Startbild, die 3D-Tiere, die neue Tagesform.
6. Zwei aeltere Kleinigkeiten in der Tagesform: „12-mal" bricht am Bindestrich; die Datumsmarken
   unter der Verlaufskurve stehen ungleichmaessig.

**Die Avatare sind seit Runde 125 eigene 3D-Renderings** (SceneKit, `tools/figuren_rendern/`, auf
Wunsch des Inhabers im Pixar-Stil, aber keine Nachbildung von Filmfiguren). Ändern: das Tier in
`Tiere.swift` nachformen, `tools/figuren_rendern/bauen.sh <tier>`, Bild ANSEHEN, dann
`python3 tools/figuren_holen.py <tier>`. Nie zur Laufzeit etwas laden („Data Not Collected").

### Entscheidungen, die nicht zurueckgedreht werden duerfen

- **Zoom (Runde 126, auf ausdrücklichen Wunsch):** In der **App** gar kein Zoom — gesperrt in der Hülle
  (`MainViewController`), nicht in der Quelle. In der **Quelle** bleibt der Viewport ohne
  `user-scalable=no` (WCAG 1.4.4 für `lucenta.html` im Browser); `pruef-app` prüft das. Eingabefelder
  nie unter 16 pt, sonst zoomt iOS beim Antippen von selbst.
- **Fliesstext nicht markierbar**, Ausnahme `#myCode`.
- **Genau EIN Teilbild-Format 1080x1350 (4:5)**, Zahlen in `tests/share_test.js`.
- **Plus-Umschalter nur im Entwicklungsbau.** In einem Release-Bau waere er ein verschenktes Abo.
- **Weggenommen wird Lucenta+ nur bei einer klaren Antwort des Stores** — Start, Wiederherstellen,
  Abbruch (Runde 121), Stoerung. `pruef-nativ` prueft alle Faelle (51 Pruefungen).
- **Bewegung nur ueber Lage/Strich, nie ueber Deckkraft** bei allem, was kurz nach einem
  Ansichtswechsel gemessen wird (Runde 108/120).
- **Striche mit runden Enden auf Avatargroesse: nein** (dreimal geloescht). Flaechen ja.
- **Kein grosses Bild im Startbild** (Runde 122): Das 2732²-Bild liess iOS Schwarz zeigen. Das
  Startbild ist die Papierflaeche; die Marke kommt mit der Startbewegung.
- **Keine Nachbildung fremder Figuren** (Runde 121, Schildkroete „wie in Findet Nemo"): im Geist
  ja, Kopie und Name nein — Markenrecht im Store.

### Stand der Pruefungen

`npm run pruef-alles` nach Runde 126: 8 von 9 bestanden, `pruef-app` 3 Funde — die Pruefung hielt die alte Schriftentscheidung fest (Titel in Fraunces, Plex Mono geladen); angepasst, danach `pruef-app` 29/29 auf demselben `src/`-Stand. Nach Runde 125: **ALLE 9 BESTANDEN** (11,1 Minuten), `fehlersuche` KEINE FUNDE. Nach Runde 124: **ALLE 9 BESTANDEN** (11,4 Minuten), `fehlersuche` KEINE FUNDE (nach zwei Laeufen mit 274 und 46 Funden, siehe Runde 124), `tests` Tagesform 40/40, `diff-sprachen` 141 (Bericht; vorher 130, die neuen Texte). Nach Runde 123: **ALLE 9 BESTANDEN** (11,0 Minuten), `pruef-app` 28/28. Nach Runde 122: **ALLE 9 BESTANDEN** (9,5 Minuten). Nach Runde 121: **ALLE 9 BESTANDEN** (9,2 Minuten), `fehlersuche` KEINE FUNDE
auf WebKit und Chromium, `pruef-nativ` 51/51, `pruef-app` 27/27, `pruef-store` 32/32,
`pruef-bewegung` bestanden, `tests` 11 Reihen, `diff-sprachen` 130 (ein Bericht). iOS-Bau
SUCCEEDED, am gebauten Bundle nachgeprueft (`startOverlay`, `trend-kurve`, `r.abgebrochen`).

Ein Lauf schlug in Runde 121 zuerst fehl: `pruef-bewegung` verlangte woertlich `blur(20px)`. Wer
die Glasstaerke aendert, muss nichts an der Pruefung aendern — sie fragt jetzt, OB Glas da ist.

### Was nur der Inhaber kann

- Die zwei Abo-Produkte in App Store Connect: `lucenta.plus.monat` (4,99 EUR) und
  `lucenta.plus.jahr` (29,99 EUR), genau so, in derselben Abo-Gruppe. Ein echter Kauf ist noch nie
  gelaufen.
- Die App auf einem **echten iPhone** (freie Apple-ID genuegt). Dort erst sind Glas-Fluessigkeit,
  Druckzustand und die Ladeluecke beim Start zu beurteilen.
- Der Fusszeilen-Link „Impressum & Datenschutz" auf der Ergebnisseite: bleiben oder weg (Runde 109
  hat ihn gelassen).
- Der Rest der Einreichung: `docs/app-store-start.md`.

### Arbeitsweise, die sich bewaehrt hat

- `pruef-alles` losgeloest starten (`nohup … > /tmp/x.log 2>&1 &`) und **einmal** am Ende lesen,
  z. B. mit einer Schleife, die auf „Minuten. Vollstaendige" wartet. Nicht parallel zu anderer
  schwerer Arbeit — und nicht bauen, waehrend sie laeuft.
- **Aussehen am Bild beurteilen, nicht an der Kennzahl.** Tiere: Figurdatei in Node per `vm`
  ausfuehren, SVG in Playwright gross zeichnen (400/88/44 px). Kurven: Seite mit eingesetztem
  `lucenta_history` (Datum als **Zahl**!) und `lucenta_plus=1` fotografieren. Hilfsskripte als
  `tools/_*.mjs` und vor dem Commit loeschen — und pruefen, dass sie nicht im Index stehen.
- **Glas nur im Simulator beurteilen.** Geraetebedienung ueber einen Unteragenten, der zuerst den
  Skill `xcode-integration:device-interaction` laedt. Er soll knapp in Text berichten, keine Bilder
  zurueckgeben. Achtung: Steht die App-Einstellung auf „Dunkel", aendert `simctl ui appearance`
  nichts.
- Lange Bash-Heredocs scheitern hier gelegentlich am Hook („did not respond") — Inhalt mit dem
  Write-Werkzeug nach `/tmp` schreiben, dann kurzer Python-Einzeiler.
- Journal-Eintrag als `/tmp/rundeNNN.md` schreiben und vor dem Anker `---\n\n## Runde <vorige> — `
  einsetzen; die Ueberschrift dieses Blocks nachziehen — **und den Inhalt**.

### Stand der Umgebung

Simulator **iPhone 18 Pro** (iOS 27.0, `B55215E2-9318-4732-9132-F2D7FFFC18EC`), Bundle-ID
`app.lucenta.ios`, installieren mit `xcrun simctl install/launch`. Bau:
`LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 npm run ios:sync`, dann `BuildProject`, dann am Bundle in
`DerivedData/App-*/Build/Products/Debug-iphonesimulator/App.app/public/index.html` nachsehen.
Deployment Target 15.0, `ENABLE_USER_SCRIPT_SANDBOXING = NO` — in Xcode **nicht** „Update to
recommended settings" akzeptieren. `npm run mac:entlasten` nach jedem `npm install`/`pod install`.

Branch `claude/lucenta-setup-browser-test-j6hn7f`, **nicht gepusht** (weit voraus), kein Pull
Request ohne Bitte. Arbeitsbaum sauber bis auf `ios/App/App.xcworkspace/xcshareddata/`
(absichtlich unversioniert).

---

## Runde 126 — Kein Zoom, Haptik überall, Hilfe zum Aufklappen, eine Schrift, Rechtliches leiser

Fünf Aufträge in einer Nachricht.

### 1. „Die App zoomt rein und man kann nicht wieder auszoomen"
**Ursache:** iOS vergrößert die Seite von selbst, sobald ein Eingabefeld mit weniger als **16 Punkt**
Schrift den Fokus bekommt — die Codefelder im Vergleich hatten 14. **Behoben:** alle Eingabefelder
16 Punkt (`12-ios.css`), Codefelder in SF Mono.
**„Generell nicht zoombar":** Das widerspricht der Entscheidung „Doppeltipp-Zoom aus, Aufziehen NICHT"
(WCAG 1.4.4). Der Inhaber hat es ausdrücklich verlangt; umgesetzt **nur in der iOS-Hülle**
(`MainViewController`: Pinch-Erkenner aus, Zoomgrenzen 1, und ein Benutzerskript ergänzt den Viewport
um `maximum-scale=1, user-scalable=no`, weil WKWebView die Grenzen bei jedem Laden aus der Seite
neu liest). Die **Quelle** bleibt unverändert: `lucenta.html` im Browser ist weiter zoombar, und
`pruef-app` prüft das weiter. In der App gilt damit, was für jede iOS-App gilt: Vergrößern über die
Systemfunktionen (Zoom, Textgröße). Am Simulator: Fokus ins Codefeld → kein Zoom; Aufziehen → kein Zoom.

### 2. Haptik bei jedem Antippen
Ein zentraler Zuhörer (Fang-Phase, `21-beta-rueckmeldung.js`) ruft `tapFeedback()` für jedes
Bedienelement (Knopf, Link, Aufklapper, Schalter, Auswahl …); deaktivierte schweigen.
`tapFeedback()` ist auf 90 ms entprellt, damit die bisherigen Einzelaufrufe nicht doppelt vibrieren.
Der Haptik-Schalter in den Einstellungen und „weniger Bewegung" gelten weiter. **Am Simulator nicht
fühlbar** — am Gerät nachprüfen.

### 3. Hilfe zum Aufklappen
Die zehn Fragen stehen hinter einer Zeile „Häufige Fragen" (8 Sprachen). Am Simulator auf- und
zugeklappt.

### 4. Eine Schrift
Bis hier drei Familien: Fraunces (Titel), SF (Text), IBM Plex Mono (Zahlen, Daten, kleine Titel) —
so in Runde 114 festgelegt, jetzt auf Wunsch des Inhabers geändert. `--serif` und `--mono` zeigen
auf `--sans` (77 Stellen benutzen die Namen); Fraunces trägt nur noch die Wortmarke (`--marke`),
SF Mono die persönlichen Codes (`--code`). Titel in SF fett (h1 700, h2/h3 600). Die Schriftdateien
von Fraunces und Plex Mono liegen weiter im Bau (`00-schriften.css` ist erzeugt) — Plex Mono wird
nicht mehr benutzt und könnte mit `tools/schriften_holen.mjs` entfallen (~60 KB); nicht gemacht.

### 5. Impressum, Datenschutz, Lizenzen leiser
Der eigene Abschnitt „Rechtliches" in den Einstellungen ist weg; stattdessen eine kleine,
unterstrichene Zeile am Ende von „Über Lucenta". **Nicht weiter versteckt**, weil das Impressum
nach § 5 DDG „leicht erkennbar und unmittelbar erreichbar" sein muss (im Code steht dazu seit Runde
79: in zwei Schritten erreichbar). Der Weg ist so lang wie vorher (Schublade → Einstellungen → Zeile).

### Pruefungen

`pruef-alles`: 8 von 9 beim ersten Lauf; `pruef-app` fand 3 Stellen, alle die alte Schriftregel
(„Ueberschrift traegt Fraunces", „Plex Mono geladen"). Die Pruefung verlangt jetzt: Titel in der
Systemschrift, Wortmarke in Fraunces, Plex Mono NICHT geladen (29 statt 28 Pruefungen). Danach
`pruef-app` 29/29; die anderen acht liefen auf identischem `src/`. Am Simulator: Codefeld fokussiert →
kein Zoom, Aufziehen → kein Zoom, Hilfe klappt auf und zu, Rechtliches oeffnet. Haptik am Simulator
nicht fuehlbar — am Geraet pruefen.

---

## Runde 125 — Eigene 3D-Tiere im Pixar-Stil (SceneKit), Fluent entfällt

Auftrag: „die avatartiere sehen noch zu unrealistisch aus. mache sie erstens realistischer und
zweitens orientiere sich sehr an den tieren von findet nemo vom optischen". Nachgefragt:
**gemeint ist der Stil** (plastisch, weich beleuchtet, große ausdrucksvolle Augen, naturnahe Farben),
die zwölf Tiere bleiben. Hingewiesen auf die Entscheidung aus Runde 121 (keine Nachbildung fremder
Figuren — Urheber- und Markenrecht im Store): Es gibt keine Nemo-, Dorie- oder Crush-Figuren, nur den
Stil. Auf die Frage nach der Bildquelle (Lizenzpaket / KI-Bilder / Fotos) **entschied der Inhaber:
„du baust die selber in diesem stil hier so gut wie es geht".**

### Wie sie entstehen

Auf diesem Mac gibt es kein 3D-Programm. macOS bringt aber **SceneKit** mit (physikalisch basiertes
Licht, Rendern ohne Bildschirm mit durchsichtigem Hintergrund). Neu: **`tools/figuren_rendern/`**
(Swift, `bauen.sh` übersetzt mit `-O` und rendert, ~20 s für alle zwölf):
- **Modell.swift** — Formen als Abstandsfelder (Ellipsoide, Rundkegel, je mit Drehung/Stauchung),
  **weich verschmolzen** („smooth union", Mulden per weicher Differenz), daraus eine glatte Oberfläche
  („surface nets", 170³ Raster, jeder Punkt auf die echte Fläche nachgezogen). Dazu
  **Umgebungsverdeckung aus dem Abstandsfeld** (SceneKits eigene greift im Schnappschuss nicht —
  ohne sie fehlte jede Tiefe in Augenhöhlen und Ohransätzen), feine Fellstruktur in den Normalen,
  Wert-Rauschen und Zellmuster (Panzerplatten, Schuppen, Federn).
- **Szene.swift** — Augen als eigener Körper: Augapfel mit **von vorn projizierter Iris** (Verlauf,
  Fasern, Limbusring, Pupille), durchsichtige **Hornhaut mit Klarlack**, zwei Lichtpunkte. Studio:
  Umgebungsbild mit Softbox, Haupt-, Füll- und Kantenlicht, weiche Schatten.
- **Tiere.swift** — eine Funktion je Tier: Anatomie, Farbe als Funktion des Ortes (Fuchs-Weiß,
  Katzentigerung mit „M", Panda-Augenflecken, Rehohren …), Augen so tief gesetzt, dass die Haut ihren
  Rand überdeckt (das ergibt die Lider), Lidwülste darüber.

`tools/figuren_holen.py` liest jetzt die Renderings (statt Fluent herunterzuladen), schneidet zu,
verkleinert auf 256 px (sips) und bringt sie auf die Palette — 215 KB für alle zwölf. Bau und
`pruef-app` (alle 12 laden) unverändert.

### Am Bild gesehen und korrigiert (jede Runde gerendert und angesehen)

1. Erster Fuchs: Schnauze in der Frontansicht unsichtbar, Licht flach und überstrahlt, Fell glitzerte
   wie Sand → Dreiviertelansicht, mehr Kontrast, Fellstruktur gröber und schwächer.
2. Iris unsichtbar — die Irisscheibe lag INNERHALB des undurchsichtigen Augapfels (eigener Fehler) →
   eigener Augapfel mit projizierter Iris.
3. Augen wirkten aufgeklebt → in die Fläche gesetzt, Lidwülste.
4. Panda ohne Augenflecken, Hase mit Röhrenohren, Reh wie ein Ameisenbär, Pudel klumpig, Hund ohne
   sichtbare Ohren (wie eine Robbe), Schildkrötenkopf zu klein → jeweils nachgeformt.
5. Mit dem eigenen Renderer gilt Fluents Lücke nicht mehr: **wieder Dackel und Golden Retriever**
   (statt Pudel/Hund aus Runde 123), Namen in allen acht Sprachen zurück. Der Dackel brauchte drei
   Anläufe (Nase in der Schnauze versunken, Rüssel, Ohren als Platten bzw. ganz verschmolzen).
6. **Fluent entfällt vollständig**: Lizenzdatei, Hinweis und Lizenztext unter „Über Lucenta" (drei
   Schlüssel × 8 Sprachen) und der Kopierschritt im Bau sind entfernt — die Bilder sind eigene Arbeit.

### Pruefungen

`npm run pruef-alles`: ALLE 9 BESTANDEN (11,1 Minuten). iOS-Bau erfolgreich; im Simulator alle zwoelf
Tiere in der Auswahl gesehen (dunkel).

### Was offen bleibt

- Das ist **so gut, wie es mit SceneKit und Grundformen hier geht** — kein Pixar-Rendering mit echtem
  Fell und Subsurface-Streuung. Wer den Stil wirklich treffen will, braucht ein Modellierprogramm
  oder lizenzierte Modelle; das Werkzeug kann dann Modelle (USDZ/OBJ) laden statt Formen zu bauen.
- Schwächste nach eigenem Urteil: Dackel und Golden Retriever (Köpfe noch etwas kugelig).
- Die Polwörter der Tagesform und alles aus Runde 119–124 warten weiter auf das Urteil des Inhabers.

---

## Runde 124 — Die Tagesform als Säule: Big-Five-Fragen, Bandbreite, Kalender, Muster, Alltag

Auftrag: Die Tagesform „soll umfänglich reformiert und geupdated werden, da sie ein essentieller
Bestandteil und eine wichtige Säule der ganzen App ist". Dem Inhaber zur Wahl gestellt, **gewählt:**
(1) Brücke zu den Big Five, (2) Muster & Einsichten, (3) Alltag & Erinnerung — nicht gewählt: „mehr
Dimensionen" (Schlaf/Anspannung als eigene Skalen, Freitext-Notiz). Zur Abo-Grenze **entschieden:
gestaffelt** — frei: Eintragen, Erinnerung, die letzten 14 Tage, Kalender des laufenden Monats und
die Bandbreite über diese Tage; Lucenta+: ganzer Verlauf, alle Monate, Stichwort-Zusammenhänge,
Wochentagsmuster.

### Der fachliche Kern, und was er umdreht

Die App sagte bisher: „Deine fünf OCEAN-Dimensionen … ändern sich nicht von Tag zu Tag." Für das
**Mittel** stimmt das; für den Tag nicht. Die Forschung zu Persönlichkeitszuständen (Fleeson 2001,
*density distributions*) zeigt, dass Menschen innerhalb einer Woche einen großen Teil einer Dimension
durchlaufen und das Mittel dieser Tage stabil ist. Die Tagesform fragt deshalb jetzt **fünf Dinge je
Tag** („Heute war ich eher …", zwei Pole je Dimension, freiwillig) und zeigt das Testergebnis als
Mitte, den Alltag als Band darum. Die Einleitung der Ansicht ist entsprechend neu geschrieben.

**Was es bewusst nicht ist:** ein zweiter Test. Die Tageswerte (1–5) werden nur auf 0–100 gelegt,
damit sie auf derselben Linie stehen; gezeigt wird die Lage, keine Differenz („Lies die Lage, nicht
die genaue Zahl" steht darunter). Keine Diagnosesprache, keine Serien, kein Druck (Runde 46 gilt).

### Was gebaut wurde

- **Daten** (`03-speicherung.js`): Ein Eintrag trägt optional `ocean` (je Dimension 1–5, einzelne
  dürfen fehlen) und `tags` (feste Liste `STICHWORTE`, 12 Stück, keine freie Eingabe). Beides wird
  beim Lesen bereinigt; Einträge von vor Runde 124 bleiben gültig. `stateTage()` mittelt jede
  Dimension nur über die Einträge, die sie tragen. Deckel 150 → 800 Einträge (der Kalender blättert
  zurück; 150 wären bei zwei Einträgen am Tag zweieinhalb Monate gewesen).
- **Neue Datei `07b-tagesform-alltag.js`**: Fragen und Stichworte in der Erfassung, **Bandbreite**
  (ab 3 Tagen je Dimension: ganzes Band, mittlere Hälfte, Mittel als Ring, Testergebnis als Strich —
  verschiedene Formen, nicht nur Farben), **Monatskalender** (Montag vorn, Stimmung/Energie
  umschaltbar, fünf Stufen einer Farbe — bewusst kein Rot für niedrige Tage; jedes Feld trägt
  seine Werte als Namen für den Bildschirmleser), **Muster** (Wochentage als Säulenbild; Stichwort-Befunde ab je 3 Tagen mit und ohne
  und ½ Skalenpunkt Unterschied, höchstens vier, ausdrücklich „Zusammenhang, keine Ursache").
- **Alltag**: Erinnerung direkt in der Tagesform (dieselbe wie in den Einstellungen,
  `erinnerungAnwenden()` setzt beide); **ein Tipp auf die Mitteilung öffnet die Tagesform**
  (`erinnerungTippVerdrahten`); neue Zeile **Tagesform** in der Schublade an erster Stelle unter
  „Entdecken"; die Karte auf der Startseite verweist mit „Fünf Fragen, Kalender & Bandbreite".
- **Sätze mit Platzhaltern** (`tfText`), nicht aus Bruchstücken — sonst wären Japanisch und
  Türkisch nur falsch zu übersetzen. ~63 neue Schlüssel in 8 Sprachen.
- **Beispieldaten**: Die letzten acht Wochen tragen Fragen und Stichworte (Extraversion an
  Freundes-Tagen höher, Sport hebt die Energie), damit Bandbreite und Befund etwas Nachprüfbares zeigen.
- **Tests**: `state_test.js` 23 → 40 Prüfungen (Bereinigung, Mittel je Dimension, Bandbreite,
  Schwellen des Stichwort-Befunds, Kalenderraster, Platzhalter).

### Am Simulator gesehen und korrigiert

1. Fünf Fragen mit Kreisen in Fragebogengröße machten die Erfassung länger als den Rest → 44 Punkt.
2. „Muster" stand unter einer Liste von 85 Einträgen → vor den Verlauf gerückt.
3. Kalenderstufen 3/4 im Dunkelmodus kaum zu unterscheiden → weiter auseinander.
4. Frei standen zwei Kauf-Kästen untereinander (Muster + „weitere Tage") → Muster frei nur als leise
   Zeile. Der Verlauf hat jetzt eine eigene Überschrift (sah sonst aus wie ein Teil von „Muster").
5. In der Liste stand „3,7/5" allein in der zweiten Zeile → geschützte Leerzeichen; die Liste zeigt
   jetzt auch die Stichworte des Tages.
6. Der Bildschirmleser-Name des Schubladenknopfs nannte die Tagesform nicht → ergänzt (8 Sprachen).
7. i18n-Audit: zwei Bezeichner sahen wie deutsche Literale aus, Spanisch hatte englische
   Anführungszeichen → behoben.
8. **Fehlersuche, erster Lauf: 274 Funde**, alle in den neuen Teilen und alle berechtigt:
   Stichwort-Knöpfe 36 statt 44 Punkt hoch (210), der inaktive Kalenderpfeil mit 1,7:1 (26, jetzt
   ausgeblendet statt blass), die Ziffer auf Kalenderstufe 4 mit 3,62:1 (22 — nachgerechnet: hell
   braucht sie `--ink` 5,2:1, dunkel `--accent-ink` 4,7:1, jetzt je Modus), die Dimensionsnamen in
   der Flächenfarbe statt deren `-text`-Fassung (16).
9. **Zweiter Lauf: 46 Funde**, alle die Kalenderfelder als Knöpfe: 42 Punkt bei 390 px, 32 bei
   320 px. Sieben Spalten zu je 44 Punkt passen auf 320 Punkt nicht — Geometrie, kein Feinschliff.
   Die Felder sind jetzt **Anzeige statt Knopf**; das Antippen eines Tages (Detailzeile) ist
   entfallen. Jedes Feld nennt seine Werte, und „Letzte Einträge" führt dieselben Tage in Worten.

Angesehen: dunkel mit Lucenta+, dunkel frei, hell frei. Gespeichert wurde ein Eintrag mit zwei Fragen
und zwei Stichworten (Simulator: Lucenta+ an, Dunkel — wie vorgefunden zurückgestellt).

### Pruefungen

`npm run pruef-alles`: ALLE 9 BESTANDEN (11,4 Minuten) im dritten Lauf; die ersten beiden fanden
274 bzw. 46 Stellen (oben unter 8. und 9.). iOS-Bau erfolgreich.

### Was offen bleibt

- **Nicht am echten Gerät** — insbesondere der Tipp auf die Mitteilung (im Simulator nicht ausgelöst).
- Zwei ältere Kleinigkeiten in derselben Ansicht, nicht Teil des Auftrags: „12-mal" bricht im
  Erholungs-Befund am Bindestrich; die Datumsmarken unter der Verlaufskurve stehen ungleichmäßig.
- Die Polwörter („kühl ↔ herzlich", „locker ↔ gründlich" …) sind eine Wahl, keine validierte Skala.
  Ein Urteil des Inhabers dazu wäre gut, bevor viele Tage damit erfasst sind.

---

## Runde 123 — Die Tier-Avatare sind 3D-Bilder (Fluent Emoji)

Auftrag: "die avatare tiere sehen immernoch zu gezeichnet und unrealistisch aus. es muss mehr wie
ein 3d modell sein". Wie im Uebergabeblock vorgesehen, wurde nicht noch einmal die Vektorzeichnung
nachgeschliffen, sondern dem Inhaber der Weg zur Wahl gestellt (echte Fotos / Fluent-Emoji-3D /
freigestellte Fotos). **Entschieden: Microsoft Fluent Emoji 3D** (MIT-Lizenz) — echte 3D-Renderings
mit Licht und Material, verspielt statt naturgetreu.

### Was sich geaendert hat

- **`src/figuren/*.png`** — zwoelf Bilder, eingecheckt, dazu `LIZENZ-fluent-emoji.txt`. Erzeugt
  von **`tools/figuren_holen.py`** (einmal von Hand, nie beim Bau; nur Standardbibliothek):
  holen, auf den Inhalt zuschneiden und mittig ins Quadrat setzen, auf eine Palette mit 256
  Eintraegen (je eigene Deckkraft) bringen. 452 KB -> 164 KB.
- **`13-figuren.js`**: ~750 Zeilen Vektorzeichnung entfallen (Tierfunktionen, Licht, Fell,
  Tieraugen). Geblieben: `FIGUREN` (Kennung + Feldfarbe), `figFeldDunkel`, `figurFinden`, und
  `figurHTML()` statt `figurSVG()` — ein `<img>`. `FIGUR_BILDER` ist im Quelltext leer.
- **`build.js`** fuellt `FIGUR_BILDER`: in `lucenta.html` als eingebettete Daten, in der
  App-Fassung als Pfade nach `dist/figuren/<kennung>-<hash>.png`. Fehlt ein Bild zu einer Kennung
  oder die Stelle selbst, bricht der Bau ab.
- **`09-archetypen.css`**: `.figur-bild` mit 14 % Rand im Kreis und weichem Schatten; der Lidschlag
  (`.fig-augen`) ist entfallen — er hatte keinen Gegenstand mehr.
- **Namen**: Fluent hat keinen Dackel und keinen Retriever. Die **Kennungen** `dackel` und
  `retriever` bleiben (sie stehen in gespeicherten Profilen), sie zeigen jetzt **Pudel** und
  **Hund**, die Namen sind in allen acht Sprachen entsprechend geaendert. Der **Goldfisch** ist
  Fluents blauer Fisch mit gedrehtem Farbton.
- **Lizenz**: MIT verlangt Hinweis und Lizenztext in jeder Kopie. Unter Einstellungen > Ueber
  Lucenta steht eine Zeile (8 Sprachen) und, zugeklappt, der Lizenztext. Im Bundle liegt die
  Datei zusaetzlich in `figuren/`.
- **`pruef-app`** hat eine 28. Pruefung: Jedes der 12 Bilder der App-Fassung muss aus `figuren/`
  **laden** (nicht nur im Quelltext stehen).

### Was am Bild auffiel und korrigiert wurde

1. **Korn**: Die erste Palette (Median-Schnitt nach Spannweite, volle Fehlerstreuung) zeigte in der
   Vergroesserung sichtbares Korn auf den Verlaeufen. Geteilt wird jetzt nach Spannweite mal Wurzel
   der Punktzahl, gestreut nur 55 % des Fehlers — in der Vergroesserung glatt, ohne Stufen.
2. **Goldfisch gelbgruen**: Der erste Farbdreh (0,58) landete bei Gelb; 0,47 ergibt Orange.
3. **Schildkroete, Reh, Pudel zu tief/klein**: Fluent legt jedes Tier anders ins Quadrat. Das
   Werkzeug schneidet jetzt auf den Inhalt zu und setzt ihn mittig. Am Simulator (dunkel)
   nachgesehen: alle zwoelf mittig, kein Ohr vom Kreis beschnitten.

### Pruefungen

`npm run pruef-alles`: ALLE 9 BESTANDEN (11,0 Minuten), `pruef-app` 28/28 mit der neuen
Bildpruefung. iOS-Bau erfolgreich, Bilder im installierten Bundle nachgesehen (`public/figuren/`).

### Was offen bleibt

- **Hellmodus nicht am Simulator angesehen** — nur dunkel (der Simulator stand so). Die hellen
  Feldfarben sind dieselben Pastelltoene wie vorher.
- Ob „verspielt statt naturgetreu" das ist, was der Inhaber mit „realistischer" meinte, ist sein
  Urteil. Falls nicht: Der naechste Schritt waeren echte Fotos (CC0), Werkzeug und Bauschritt
  bleiben dieselben — nur `TIERE` in `figuren_holen.py` zeigt woanders hin.

---

## Runde 122 — Startbild, Farbschema in der Huelle, Glas hell, Silbentrennung

Auftrag: die drei offenen Punkte aus Runde 121. Alle am Simulator (iPhone 18 Pro, System hell,
App dunkel) vorher und nachher gemessen.

### 1. Das Schwarz vor dem Start (`LaunchScreen.storyboard`, `Splash.imageset` entfernt)

**Gemessen statt geschaetzt:** Kaltstart ueber `simctl launch`, danach Bildschirmfotos im
Halbsekundentakt, je Bild die Randfarbe (40x40-Ausschnitt, auf 1 Bildpunkt gemittelt). Vorher:

| Zeit | Rand | was |
| --- | --- | --- |
| 1,9–5,6 s | 0,0,0 | **Schwarz** — kein Startbild |
| 6,4–8,1 s | 242,242,247 | Plugin-Splash hell, darauf ein **beiges Quadrat** |
| ab 8,6 s | 0,0,0 | App dunkel |

Zwei Fehler, beide nicht in der WebView, wie Runde 121 vermutet hatte:
- **Das beige Quadrat**: `Splash` (2732x2732) trug die Papierfarbe von vor Runde 120 (#E4E6DB).
  Runde 107 hatte die Bildkante unsichtbar gemacht, indem Bild- und Flaechenfarbe uebereinstimmten;
  Runde 120 aenderte nur die Flaeche (`Papier.colorset` -> #F2F2F7/#000000). Seitdem war die Kante
  sichtbar.
- **Das Schwarz**: `Library/SplashBoard` der App war leer — iOS hatte nie einen Startbild-
  Schnappschuss abgelegt und zeigte Schwarz. Das Bild ist entpackt ~30 MB (RGBA); Startbilder haben
  eine Speichergrenze, und ein zu grosses Bild ist die bekannte Ursache genau dafuer. **Unsicher:**
  belegt ist nur, dass das Schwarz ohne Bild weg ist, nicht welcher Grenzwert es ausloeste.

Geaendert: Das Startbild ist nur noch die Flaeche „Papier", ohne Bild; `Splash.imageset` ist
geloescht (nirgends sonst benutzt; das Splash-Plugin laedt die Storyboard-Datei, nicht das Bild).
Ein kleineres neues Bild haette beides auch behoben, aber den Namen gezeigt, der eine halbe Sekunde
spaeter in der Startbewegung noch einmal erscheint und sich dort erst zeichnet. Apples HIG sieht im
Startbild keine Marke vor. **Das ist eine Gestaltungsentscheidung** — wenn der Inhaber das Logo dort
zurueckwill, dann als kleines Bild (hoechstens ~600 px, Hintergrund durchsichtig), nie wieder 2732².

Nachher: ab 0,3 s die helle Flaeche (System), ab 3,6 s dunkel, dann zeichnet sich Zeichen + Name.
Kein Schwarz, kein Quadrat. Im Bundle muss dafuer nichts weiter stimmen.

### 2. Die Huelle kennt das Farbschema der App (`MainViewController.swift`, `SceneDelegate.swift`, `03-speicherung.js`)

Die Wahl Hell/Dunkel/System lag nur in `localStorage`; die Huelle folgte dem System. Jetzt meldet
`saveThemeMode()` jede Wahl (auch die beim Start) an den Empfaenger `lucentaThema`;
`MainViewController` legt sie unter `lucenta_thema` in UserDefaults ab und setzt
`overrideUserInterfaceStyle` am Fenster, `SceneDelegate` setzt es beim naechsten Start vor dem
ersten Bild. Damit folgen Plugin-Splash, Ladeluecke und WebView der App. Nachgesehen: Nach dem
ersten Lauf steht `"lucenta_thema" => "dark"` in der plist der App, und der Kaltstart danach ist ab
dem Plugin-Splash dunkel.

Kein Plugin, sondern ein `WKScriptMessageHandler`: Er laeuft ohne Capacitor-Aufruf und kann nicht
an der `packageClassList` haengen. Der Empfaenger haelt die Ansicht nur schwach (sonst ein Kreis).
Nach aussen geht dabei nichts — es ist ein Aufruf innerhalb der App.

**Bleibt:** Das allererste Startbild zeichnet iOS vor dem Start der App nach dem System. Bei
„App dunkel, System hell" gibt es also weiterhin einen Wechsel von hell nach dunkel — einen statt
vorher drei (schwarz, hell, dunkel).

### 3. Glas im Hellmodus (`00-grundlagen.css`, heller Block)

`--glas` .26 -> .12, `--glas-tief` .08 -> .02, `--glas-zeile` .50 -> .34. Kante und Glanz
unveraendert. Am Simulator mit offener Schublade angesehen: Der gruene Knopf und die Seitenkante
scheinen jetzt durch das Glas, die Zeilen bleiben gut lesbar. Dunkel unveraendert.

### 4. Keine Silbentrennung in der Schublade (`12-ios.css`)

`#drawerPanel p, #drawerPanel li{ hyphens:manual }`. Am Simulator ausgelesen: „Kurze,
forschungsbasierte / Einordnungen passend zu deinem / eigenen Ergebnis." — keine Trennung mehr;
der einzige Bindestrich am Zeilenende ist der echte in „Titel-Kombinationen".
`overflow-wrap:break-word` bleibt, bei 200 % Textgroesse laeuft also nichts heraus.

### Pruefungen

`npm run pruef-alles`: ALLE 9 BESTANDEN (9,5 Minuten), losgeloest gestartet und einmal gelesen.
iOS-Bau ueber Xcode erfolgreich, Kaltstart am Simulator gemessen (siehe 1.).

### Nebenbei

Zum Ansehen musste der Simulator kurz auf Hell und Deutsch; beides ist zurueckgestellt (Dunkel,
Englisch).

---

## Runde 121 — Mehr Liquid Glass, Startbewegung, Verlaufskurve, Meeresschildkroete

Fuenf Auftraege des Inhabers: die Seitenleiste "noch durchsichtiger und richtig wie Glas", mehr
Liquid Glass in der ganzen App, eine Verlaufskurve, die etwas sagt, beim Start dieselbe Bewegung
wie nach dem Test mit dem Namen, und die Schildkroete "mehr wie in Findet Nemo".

### 1. Liquid Glass (`12-ios.css`, neue Marken `--glas*` in `00-grundlagen.css`)

Fuenf neue Farbmarken (`--glas`, `--glas-tief`, `--glas-rand`, `--glas-licht`, `--glas-zeile`), je in
allen drei Bloecken. Schublade: geringe Toenung im Verlauf, Lichtkante innen, ein Glanzstreif von
oben, Zeilen halbdeckend. Dazu als Glas: die runden Knoepfe der Schublade, die Kopfknoepfe der
Ansichten, die Mitteilung (Toast), der Plus-Dialog (86 -> 70 %); der Hauptknopf als getoentes Glas
mit Lichtkante; die Kopfleiste bekommt eine Lichtlinie an der Unterkante. Das Bild-Fenster bleibt
bei 86 %, weil darin das Ergebnisbild beurteilt wird (Begruendung aus Runde 103) — es bekommt nur
die Kante. Jede neue Glasflaeche hat ihre Tuer fuer "Transparenz reduzieren" und "Kontrast erhoehen".

**Der erste Wurf war im Simulator "fast deckend dunkelgrau" — und der Grund war nicht die Toenung.**
Hinter der Schublade liegt `#drawerScrim` mit 45 % Fast-Schwarz. Das Glas weichzeichnete also einen
schon verdunkelten Grund. Jetzt 16 %, die Unschaerfe 26 -> 16 px (bei starker Unschaerfe wird jedes
Glas zur Milchscheibe), die Toenungen etwa halbiert. Nachgemessen im Simulator: dunkel deutlich
Milchglas, Knopf, Portraetkarte und Sterne scheinen farbig durch, alles lesbar.

**Offen und ehrlich:** Im Hellmodus wirkt die Schublade weiter fast weiss. Weisses Glas ueber einer
fast weissen Seite (#F2F2F7) bleibt weiss — das ist bei Apple genauso, aber es ist nicht das
"durchsichtig", das man im Dunkeln sieht. Headless WebKit zeichnet `backdrop-filter` nicht; geurteilt
ist am Simulator.

`pruef-bewegung` schlug danach zweimal an: Die Pruefung der Transparenz-Tuer verlangte woertlich
`blur(20px)`, die Staerke von damals. Die Tuer tat genau, was sie soll (Glas -> none -> Glas). Die
Pruefung fragt jetzt, OB Glas da ist, weggeht und unveraendert wiederkommt — nicht wie stark.

### 2. Startbewegung (`#startOverlay`, `startBewegung()` in `21-beta-rueckmeldung.js`)

Beim Start zeichnet sich das Fuenfeck und fuellt sich — mit denselben Keyframes wie die
Auswertungs-Ueberlagerung nach dem Test, also wirklich dieselbe Bewegung —, darunter blendet
"Lucenta" in Fraunces ein, nach 1,35 s blendet alles aus. Nur in der App (die Pruefungen im Browser
messen gleich nach dem Laden), durchklickbar, und bei reduzierter Bewegung gar nicht.

**Am Simulator gesehen und nicht behoben, weil es nicht aus dieser Runde stammt:** Vor der Bewegung
liegen rund 2 s Schwarz (die WebView laedt; im Debug-Bau laenger), dann kurz der native
Startbildschirm in HELL, obwohl die App auf "Dunkel" steht. Der Startbildschirm folgt dem System,
nicht der App-Einstellung, und kann deren Wahl nicht kennen. Ob das im Release-Bau auf dem Geraet
stoert, ist ein Urteil am Telefon.

### 3. Die Verlaufskurve im Profil (`trendKurveSVG()` in `05-verlauf.js`, `06-trend-history.css`)

Vorher fuenf gleichfarbige Linien von 140x32 neben Kuerzeln ("GEWISS."), ohne Punkte und ohne
Zeitangabe. Jetzt nach Apple Health: voller Name mit dem Farbpunkt der Dimension (dieselbe Farbe
wie im Radar), gross der heutige Wert, die Veraenderung als Kapsel; darunter eine Kurve ueber die
ganze Breite mit Flaeche, einem Punkt je Durchlauf, dem letzten hervorgehoben, einer Linie bei 50
(wenn im Bereich), und unter der Liste die Zeitspanne. Die Linie zeichnet sich beim Oeffnen einmal.

**Der erste Wurf war wieder nichtssagend**, und das Bild hat es gezeigt, nicht der Code: Ueber die
ganze Skala 0-100 sieht ein Anstieg um 19 Punkte aus wie eine gerade Linie. Die Hoehe zeigt jetzt
den Bereich der Werte (mindestens 24 Punkte Spanne, damit ein Unterschied von 1 nicht wie ein
Absturz aussieht). Die Farbe kennzeichnet die Dimension, nie die Richtung — Schrift bleibt
`--ink`/`--muted`, daran haengt kein Kontrast. `sparklineSVG` bleibt: Testreihen und Werkzeuge rufen es.

### 4. Die Schildkroete

Vorher eine Landschildkroete im Profil. Jetzt eine schwimmende Meeresschildkroete: lange
Vorderflossen wie Fluegel, kurze Hinterruder, flacher Tropfenpanzer in Braun mit strahlenfoermiger
Zeichnung je Schild und hellem Bauchpanzerrand, grosser runder Kopf mit hell gesaeumten
Schuppenplatten, grosse dunkle Augen unter schweren, entspannten Lidern, ein breites Grinsen als
Flaeche (kein Strich). Hintergrund meerblau statt gruen. Bewusst keine Nachbildung der Filmfigur
(fremdes Markenrecht im Store); der Name steht nirgends.

In drei Schritten in Vergroesserung nachgebessert: Die Lider ragten mit gerader Oberkante ueber den
Kopf hinaus (jetzt in den Kopfumriss geschnitten), der Kopf stiess an den Kreisrand (jetzt kleiner und
mittiger), die Naehte der Schilde lasen sich wie Fliesen (weicher). Halb geschlossene Lider wirkten
skeptisch statt gelassen — etwas angehoben.

### 5. Ein Fehler, den der Simulator fand: Abbrechen nahm Lucenta+ weg

"Kaeufe wiederherstellen" -> Anmeldedialog -> "Abbrechen": danach stand die freie Fassung da.
`LucentaKaeufePlugin.restorePurchases` schluckte den Abbruch von `AppStore.sync()` und meldete den
Stand des Geraets, und die Seite setzte diesen Stand. Im Simulator war Lucenta+ nur per
Entwickler-Umschalter an, also "kein Abo" — und weg war es. Zwei Luecken:

- Ein weggetippter Dialog ist keine Antwort. Swift meldet ihn jetzt als `abgebrochen` (nur wenn das
  Geraet kein Abo kennt; kennt es eines, zaehlt das), und die Seite aendert dann nichts.
- Im Entwicklungsbau nahm die Startabfrage schon nichts weg (Runde 113), das Wiederherstellen schon.
  Jetzt beide gleich.

Eine klare Antwort "kein Abo" nimmt weiterhin weg — sonst bliebe ein gekuendigtes Abo stehen.
`pruef-nativ` prueft beides (zwei neue Pruefungen).

### Was offen bleibt

Hellmodus-Glas (s. 1), die Ladeluecke vor der Startbewegung (s. 2), und die Silbentrennung in den
Untertiteln der Schublade ("Ergeb-nis", "Einordnun-gen") — im Simulator erneut gesehen, nicht
Gegenstand dieser Runde.

---

## Runde 120 — Auswahl-Haekchen, Apples Farbsystem, Bewegung wie in iOS

Drei Auftraege des Inhabers: ein umkreister Haken an Avatar und Hintergrund, die gewaehlt sind;
Hell- und Dunkelmodus „so wie Apple es gemacht hat"; mehr Animationen in Uebergaengen und beim
Druecken.

### 1. Das Auswahl-Haekchen

Bis hierher trug die Wahl nur einen dunkleren Rand von 2 Punkt — bei bunten Figuren und
Hintergruenden ein schwacher Unterschied. Jetzt wie in iOS (Fotos, Hintergrundbilder, Memoji):
ein gefuellter Kreis in der Akzentfarbe mit weissem Haken unten rechts, ueber den Rand
hinausstehend, mit kurzem Federschwung beim Waehlen.

Die Figurfelder schnitten mit `overflow:hidden` alles ab, was ueber den Kreis ragt — das Abzeichen
waere halbiert worden. Abgeschnitten wird jetzt die Zeichnung (`clip-path:circle`), das Feld darf
ueberstehen.

### 2. Hell und Dunkel nach Apples Farbsystem

Bis hierher stand die App in beiden Modi auf Salbeigruen (#E4E6DB / #0F1613). Jetzt Apples
neutrales System: hell #F2F2F7 mit weissen Flaechen, dunkel echtes Schwarz mit #1C1C1E / #2C2C2E /
#3A3A3C, Trennlinien #C6C6C8 bzw. #38383A. Teal bleibt — iOS-Apps bringen ihre Toenung mit.

**Eine begruendete Abweichung:** Apples Grau fuer Nebentext (#8A8A8E) hat auf Weiss nur 3,4:1. Hier
steht Apples eigene Fassung fuer „Erhoehter Kontrast" (#636366). Vorher nachgerechnet.

Sechs Stellen tragen die Grundfarben zusaetzlich und sind nachgezogen: Ergebnisbild
(`pruefeBildfarben` hat genau das beim Bau angemahnt), Statusleistenfarbe, `theme-color`,
`MainViewController.papierfarbe`, `Papier.colorset`, `pruef-nativ`.

**Eine Pruefung musste ihre Frage aendern, nicht ihre Schwelle:** `share_test` verlangte, dass
helle und dunkle Fassung keine einzige Farbe teilen. Mit Apples System ist Schwarz beides — die
Schrift im Hellen, der Grund im Dunklen. Die eigentliche Absicht der Reihe war, dass im dunklen
Bild nichts vom hellen stehen bleibt; geprueft wird jetzt, dass Grund und Schrift ihre Rollen
tauschen und keine weitere Farbe mitkommt.

**Die Fehlersuche fand danach 110 Funde, alle dieselbe Sorte:** Nebentext auf `--surface-3` an
Segmentwaehler und Kennzahl-Kacheln, 3,94:1 statt 4,5:1. iOS legt den Segmentwaehler ohnehin auf
eine HELLERE Fuellung als die Zeilen. Auf `--surface-2`: 4,77:1 hell, 4,86:1 dunkel, keine Funde.

### 3. Bewegung wie in iOS (`12-ios.css`)

- Federndes Loslassen: Knoepfe, Antwortkreise, Figur- und Hintergrundfelder schiessen beim
  Loslassen einen Hauch ueber ihre Groesse und setzen sich. Das Druecken bleibt unmittelbar.
- Listenzeilen werden beim Druecken sofort hinterlegt und blenden beim Loslassen langsam aus —
  das verzoegerte Ausblenden ist das Kennzeichen einer iOS-Liste.
- Das Haekchen der Sprachwahl springt auf (die Drehung steht in der Animation mit, sonst wuerde
  scale sie ueberschreiben).
- Ein neuer Bildschirm baut sich gestaffelt auf — **nur ueber die Lage, nie ueber die Deckkraft.**
  Runde 108 hatte eine Staffelung verworfen, weil die Pruefungen kurz nach einem Wechsel messen;
  ein Block, der nur 14 Punkt tiefer beginnt, ist jederzeit sichtbar.

**Eine Sorge, die sich als unbegruendet erwies — und warum das ins Protokoll gehoert:** Die
Staffelung gilt fuer alle direkten Kinder einer Ansicht; eine Abfrage nach Selektoren meldete
`.understand-card` auf der Startseite mit eigener Einblendung von Deckkraft 0 aus. Ich habe sie
ausgenommen und die Gegenprobe gemacht — die Karte blieb auch OHNE Ausnahme sichtbar. Der Grund: Eine
spezifischere Regel setzt dort `animation:none`. Die Ausnahme ist wieder heraus. Massgeblich ist
der berechnete Stil, nicht welcher Selektor passt — und eine Gegenprobe kann auch die eigene
Vorsicht widerlegen.

### Was offen bleibt

Ergebnisseite und Fragebogen tragen bis auf Schrift und Farben noch die Kartenoptik aus Runde 69.
Ob sich Bewegung und Farben nach iOS anfuehlen, ist ein Urteil am Geraet.

---

## Runde 119 — keine Schablone mehr: jedes Tier einzeln gezeichnet, mit Fell

Rueckmeldung des Inhabers nach vier Ueberarbeitungen der Tiere: „immer noch zu unrealistisch, vom
gesamten Modell schon — nicht nur wegen 3D oder Licht."

**Der Satz traf den Kern.** Alle neun Saeugetiere entstanden aus EINER Schablone (`figTier`):
runder Kopf, frontal und symmetrisch, ovale Schnauze in der Mitte, zwei Augen daneben,
angedeutete Schultern. Unterschiede nur in Farben, Ohren und Abzeichen — dieselbe Figur in neun
Kostuemen. Die Runden 115 bis 118 haben das Kostuem verbessert, nicht das Modell.

Gefragt, mit drei Wegen (echte Fotos von Wikimedia Commons, einzeln gezeichnet, Tiere
entfernen) — der Inhaber hat **einzeln gezeichnet** gewaehlt, im Wissen, dass es eine Illustration
bleibt.

### Was jetzt anders ist

- **Jedes Tier hat eine eigene Zeichnung** (`figFuchsEinzeln` … `figRetrieverEinzeln`), mit
  eigener Kopfform und in **Dreiviertelansicht** nach links. Eine streng frontale, symmetrische
  Ansicht ist das Kennzeichen von Emblemen und Plueschtieren. Der Fuchs hat einen keilfoermigen
  Kopf mit langer Schnauze und Traenenlinie, der Baer einen massigen Kopf mit langer, breiter
  Schnauze, das Reh einen langen schmalen Kopf am langen Hals mit Kehlfleck und Gehoern, der Dackel
  die lange Schnauze ohne Stopp und das Hangohr, der Retriever den breiten Schaedel und das
  hechelnde Maul, der Hase graubraunes Wildfell mit seitlichem Auge und schwarzen Ohrspitzen.
- **Ein Fellfilter** (`figFellFilter`): feTurbulence + feDisplacementMap zerfransen die Kante um
  Bruchteile einer Einheit, eine zweite, gestreckte Turbulenz legt feine Haarstriche auf die
  Flaeche. Glatte Vektorkanten waren der Hauptgrund fuer den Plastik-Eindruck. Auch der Uhu traegt
  ihn — auf Gefieder wirkt er genauso. Wal, Fisch und Schildkroete bleiben glatt; ihre Haut ist es.
- Geteilt werden nur noch Werkzeuge: Tierauge, Fellfilter, Verlaeufe.

Im ersten Entwurf drei Fehler, alle im Bild gefunden: Das Reh sass ohne Hals auf einem Ring mit
einem weissen Loch, der Hase war so gross, dass er wie eine Kugel wirkte und die Ohren aus dem
Kreis liefen, und die Haarstruktur war zu kraeftig und zu waagerecht. Alle behoben; in echter
Groesse (62 und 96 Punkt) nachgesehen — dort wird die Struktur zu einem feinen Fellschimmer, nicht
zu Kruemeln.

**Die Schablone ist entfernt**, mit allem, was nur sie benutzte (Ohren, Nase, Schnurrhaare,
Kopf- und Schnauzenformen, Maul, Lichtsaum, Kernschatten) und zwei aelteren Lichtfunktionen ohne
Aufruf: `13-figuren.js` 1045 -> 740 Zeilen. Gezaehlt wurden dabei Bezuege OHNE Kommentare — die
reine Trefferzahl hatte `figTier` noch dreimal gemeldet, zweimal davon in Begruendungen.

### Was offen bleibt

Ob das jetzt realistisch genug ist, entscheidet der Inhaber am Geraet. Falls nicht, steht der
naechste Weg schon fest und ist der einzige, der danach noch bleibt: **echte Fotos** (gemeinfrei,
von Wikimedia Commons, fest eingebaut, kein Netzabruf). Wikimedia ist von diesem Rechner aus
erreichbar, und `sips` kann zuschneiden — beides in dieser Runde nachgesehen.

---

## Runde 118 — Fische, Schildkroete, Wal und Eule nach ihrer echten Anatomie

Rueckmeldung des Inhabers: „Vor allem die Fische und die Schildkroete muessen realistischer an den
echten Tieren sein. Aber generell die anderen Tiere auch."

**Zutreffend, und hier war es nicht Feinarbeit, sondern Form.** Der Goldfisch war eine orange
Ellipse mit zwei Flossenecken, die Schildkroete ein gruener Halbkreis mit drei Linien und einem
runden Kopf obendrauf, der Wal ein blaues Ei mit einer Strichfontaene. Keine dieser Formen kommt in
der Natur vor. Alle vier sind neu gebaut, je als eigene Funktion vor der Tabelle:

- **Goldfisch** (`figGoldfisch`): hochovaler Koerper, oben rotorange, zum Bauch gold; Schuppen in
  versetzten Reihen; Kiemendeckel als Bogen hinter dem Auge; durchscheinende Faecherflosse mit
  Strahlen; Ruecken-, Brust-, Bauch- und Afterflosse; Maul vorn an der Spitze.
- **Schildkroete** (`figSchildkroete`): von der Seite — gewoelbter Panzer mit Wirbel- und
  Rippenschilden (jeder mit hellerem Kern), Randschilde, gelblicher Bauchpanzer; Kopf am Hals mit
  schuppiger Haut und Hornschnabel; kurze Beine mit Krallen; Schwanz.
- **Wal** (`figWal`): Buckelwal — gestreckt, oben blaugrau, unten hell; Kehlfurchen; lange
  Brustflosse mit hellem Rand; kleine Rueckenflosse; Fluke; die Hoecker auf dem Kopf; kleines Auge
  hinter dem Maulwinkel; der Blas als Nebel.
- **Eule** (`figEule`): Uhu — Gesichtsschleier mit dunklem Rand, gefiederte Ohrbueschel statt
  Dreiecken, Hakenschnabel halb im Gefieder, Laengsstreifen auf der Brust.

Feine Linien stehen hier dort, wo das echte Tier Linien HAT — Flossenstrahlen, Schildnaehte,
Kehlfurchen —, sehr duenn, stumpf, mit geringer Deckung. Die Lehre aus CLAUDE.md betrifft
aufgemalte Glanz- und Kantenstriche, nicht die Naht zwischen zwei Panzerschilden. Im ersten
Entwurf waren die Schildnaehte trotzdem zu hart und das Sechseckraster las sich als Fussball;
jetzt gerundet und gedaempft.

**Die uebrigen Tiere, am echten Tier gemessen:**
- Fuchs und Katze: **Backenfell**, das seitlich absteht — das echte Gesicht ist dort breiter als
  der Schaedel.
- Hase und Reh: **die Augen seitlich**. Sie sind Fluchttiere und sehen fast rundum; mit dem
  frontalen Abstand der Katze sahen sie aus wie Pluesch. Neuer Parameter `augenAbstand`.

### Was offen bleibt

Ob die Tiere jetzt echt genug sind, ist ein Urteil am Geraet. Ergebnisseite und Fragebogen tragen
bis auf die Schrift noch die Kartenoptik aus Runde 69.

---

## Runde 117 — die Tiere hatten Menschenaugen

Rueckmeldung des Inhabers: „Die Avatare sehen noch nicht aus wie die echten Tiere — z. B. die
Augen sind die von Menschen usw."

**Woertlich zutreffend, und im Code genau benennbar.** Die Tiere bekamen bis hierher `figAuge()`,
das fuer die Menschenfiguren gebaut war: weisser Augapfel, farbige Iris mit Limbusring, kleine
runde Pupille, Wimpernkante, Lidfalte. Runde 115 hatte es vergroessert und glaenzender gemacht,
Runde 116 Schlitzpupillen hineingesetzt — beides Arbeit an einem Menschenauge. Dazu kam vom
Menschen: geschlossene „^ ^"-Lachaugen, Brauen (seit Runde 99 als Fellbueschel), der gebogene
Laechelmund und rosa Wangen.

| menschlich, beim Tier falsch | echt beim Tier |
|---|---|
| weisser Augapfel | Auge fast ganz Iris, dunkler Lidrand |
| Lachaugen „^ ^" | offene Augen |
| Brauen aus Fell | keine Brauen |
| Laechelmund | gespaltenes „ω"-Maul unter der Nase |
| rosa Wangen | gibt es bei keinem dieser Tiere |

**Geaendert:** Ein eigenes `figTierAuge` — kein Weiss, dunkler Lidrand als Flaeche hinter dem
Auge, Iris je Tier (Fuchs bernstein, Katze gruengelb, beide mandelfoermig, schraeg und mit
Schlitzpupille; Hund, Baer, Reh, Hase, Panda fast schwarzbraun und rund), dazu Glanzpunkt und
Fensterlicht aus dem Animoji-Stil. Ein eigenes `figTierMaul` — das „ω", bei den Hunden geoeffnet
mit Zunge. Brauen und Wangen entfallen. Baer und Panda haben kleinere Augen, wie das echte Tier.

Auch die Sonderformen: Eule mit gelben Augen ohne Augapfel (der helle Gesichtsschleier bleibt,
den gibt es wirklich), Wal und Schildkroete mit kleinen dunklen Augen, der Goldfisch ohne die
weisse Scheibe hinter dem Auge und mit einem kleinen runden Maul vorn statt eines Laechelbogens
an der Seite, die Schildkroete mit einer Schnabelkante statt eines Laechelns. Der lange Mundbogen
des Wals bleibt; Wale haben ihn.

**Aufgeraeumt, gezaehlt statt vermutet:** `figAuge`, `figAugen`, `figMund`, `figTierbrauen`,
`mieneAnwenden` und die Tabelle `MIENEN` hatten danach keinen Aufruf mehr — `13-figuren.js`
980 -> 659 Zeilen. Die Angaben `miene:` in der Tiertabelle sind mit entfernt; sie hatten keine
Wirkung mehr.

**Die Lehre, die hier teuer war:** Drei Runden haben am falschen Auge gearbeitet. Jede hat das
Auge besser gemacht und keine hat gefragt, ob es das richtige ist. Dieselbe Form wie bei den
Menschenfiguren in Runde 111 — dort war es die Proportion, hier der Bauteil selbst.

---

## Runde 116 — die Tiere am echten Tier, und das Profil als iOS-Kontaktkarte

### 1. Die Tiere: Merkmale des echten Tiers

Auftrag des Inhabers: Die Avatare sollen sich „mehr am realen Aussehen der Tiere orientieren" —
im Animoji-Stil aus Runde 115. Runde 115 hatte Volumen gebracht; was fehlte, waren die Merkmale,
an denen man ein Tier auch auf Avatargroesse erkennt. Jedes Tier mit seinem Vorbild verglichen:

| Tier | echtes Merkmal | vorher |
|---|---|---|
| Panda | Ohren ganz schwarz, schwarzes Schulterband, Augenflecken als schraege Tropfen nach aussen unten | weisse Ohren mit schwarzer Mitte, weisser Koerper, Flecken nach innen geneigt |
| Fuchs | schwarze Ohrspitzen, weisse Wangen bis unters Kinn, weisse Brust, Schlitzpupillen | nur weisse Schnauze, runde Pupillen |
| Katze | Schlitzpupillen, rosa Nase, das "M" auf der Stirn | runde Pupillen, schwarze Nase |
| Reh | helle Kehle und Brust | weisse Punkte auf der Stirn (gibt es nur beim Kitz, am Ruecken, nie mit Geweih), rosa Wangen |
| Hase | rosa Nase | schwarze Nase |

Baer, Dackel und Retriever stimmen mit ihren Vorbildern ueberein und sind unveraendert.

Neue Merkmale im Bauplan (`figTier`, alle wahlweise): `pupille:'schlitz'`, `naseFarbe`,
`ohrFarbe`, `ohrSpitze`, `kinn` mit `kinnForm` ('wange' oder 'kehle'), `brust`, `koerper`. Die
Stirnzeichnung der Katze ist aus drei weichen Flaechen gebaut, nicht aus Strichen.

Zwei Korrekturen im Bild gefunden: Die erste Fassung der hellen Wangen bedeckte beim Reh die
ganze untere Gesichtshaelfte — eine weisse Maske. Daher die zweite Form 'kehle'. Und beim Fuchs
lag eine harte Kante quer uebers Gesicht; jetzt ein Verlauf mit kurzem, weichem Rand.

### 2. Das Profil

Vorbild ist die Kontaktkarte von iOS beim Bearbeiten (`12-ios.css`, auf `#view-profile`
beschraenkt): grosses Bild oben, darunter Gruppen. Titel klein und grau, Name als Textfeld-Zeile
statt Unterstrich-Feld, Figuren und Hintergruende auf je einer Flaeche, das Ergebnis als Zeile mit
Winkel, der Verlauf als Liste statt einzelner Karten, der Entwicklerbereich wie eine
Einstellungsgruppe.

Zwei Stellen mit `!important`, begruendet: Die Formensprache aus Runde 69 setzt fuer
`.history-row` und `.trend-list` `border-width:2px !important` und eine harte Unterkante. Ohne
Gegengewicht bliebe jede Verlaufszeile eine Karte mit Rand. Die Kante links, die seit Runde 108
den Pol der fuehrenden Dimension traegt, ist in der randlosen Liste ein Punkt vor dem Titel —
dieselbe Information.

**Ein Fehler aus Runde 114, erst jetzt sichtbar:** Die Regel, die dem Feld „kein Bild" den
Monogramm-Verlauf gab, kam nie an — eine spaetere Regel derselben Datei setzt `background` als
Kurzform und loescht damit den Verlauf. Die wirkungslose Regel ist entfernt, die neue steht am
Ende der Kaskade. Dieselbe Sorte Fehler wie `q-enter` (Runde 108) und `input, textarea`
(Runde 109): eine Regel, die aussieht, als wirke sie.

### Was offen bleibt

Ergebnisseite und Fragebogen tragen bis auf die Schrift noch die Kartenoptik aus Runde 69. Ob die
Tiere jetzt echt genug wirken, ist ein Urteil am Geraet.

---

## Runde 115 — die Tiere so plastisch wie Animoji, und die Schublade als iOS-Liste

### 1. Die Tiere

Auftrag des Inhabers, nach einer Rueckfrage: „die bisherigen Tiere in deren Modell realistischer
gestalten, so wie Memojis von Apple". Also keine Fotos und kein neuer Stil, sondern dieselbe
Konstruktion mit mehr Koerper.

Was Animoji plastisch macht, ist nicht Detail, sondern **Volumen** — jede Form sieht aus wie ein
beleuchteter Gegenstand. Im vergroesserten Bild der zwoelf Tiere (vorher/nachher nebeneinander)
fehlte genau das, und es liess sich benennen: das Kugellicht hob den Ton nur um 17 % und senkte
ihn um 16 %; die Schnauzen waren ein verwischter Schein; die Augen klein und matt; die Nasen ohne
Glanz; der Koerper flach gefuellt.

Geaendert, alles in `13-figuren.js`:
- `figKugelPlastisch`: Licht +38 / Schatten -30 statt +17 / -16, Brennpunkt weiter nach aussen.
- Stirnglanz: weiche weisse Flaeche, in die Kopfform geschnitten.
- Schnauze mit eigenem Licht, Farbe haelt bis 86 statt 72 Prozent, Ellipse 4 statt 12 Prozent
  groesser als die Form. Mit breitem Auslauf blieb sie trotz eigenem Licht ein Schein (im Bild
  bei Fuchs und Hund).
- Augen 30 % groesser (15 % fielen im ersten Anlauf nicht auf), groesserer Lichtpunkt und ein
  breites Fensterlicht als Flaeche.
- Nase mit Verlauf und breitem Glanz; Koerper mit Verlauf; kraeftigerer Kinnschatten.
- Eule, Wal, Goldfisch, Schildkroete: neuer Baustein `figPlastisch` mit demselben Licht — ohne ihn
  standen sie neben den anderen flach da.

**Drei Striche entfernt, alle im Bild gefunden** (die zweite Lehre aus CLAUDE.md, zum vierten
Mal): die Lidfalte (auf dem dunklen Fleck des Pandas ein blasser Bogen), das Unterlid (beim Baeren
ein Strich unter dem Auge) und die helle Kante unter geschlossenen Augen (bei Fuchs und Hund ein
blasses Band). Alle drei waren Linien in Hautfarbe, alle drei gibt es bei Animoji nicht; sie
entfallen fuer Tiere (`grossIris`). Dazu hatte der Panda eine eigene Augengroesse, die mit den
30 % aus seinen Flecken herauswuchs — zurueckgenommen auf 2,15.

Aufgeraeumt: ein Kommentarblock und `FIG_HAAR_LAUF` aus der Zeit der Menschenfiguren.

### 2. Die Schublade

Jeder Eintrag war ein kleiner Abschnitt: Titel in Mono-Grossbuchstaben, ein Satz, darunter ein
umrandeter Pillenknopf. Jetzt die iOS-Liste (`12-ios.css`, auf `#drawerPanel` beschraenkt):
Gruppentitel klein und grau ueber der Flaeche, eine Flaeche je Gruppe, jeder Eintrag eine Zeile
mit Titel, leiser Unterzeile und Winkel, die ganze Zeile antippbar.

Gebaut wie die Profilzeile der Einstellungen: Der vorhandene Knopf liegt ueber der ganzen Zeile,
die Beschriftung bleibt fuer VoiceOver. Markup und Verdrahtung sind unveraendert — jede Pruefung,
die einen dieser Knoepfe antippt, tippt weiterhin denselben.

**Eine Falle, die auch die Einstellungen betraf:** Der Winkel steht im `::after`, und das ist bei
`.btn-sm` seit Runde 60 belegt — als absolut positionierte, MITTIGE Trefferflaeche von 44x44. Der
Winkel stand dadurch mitten in der Zeile. In den Einstellungen war das nach dem Umbau in Runde 114
nicht mehr im Bild nachgesehen worden. Fuer Knoepfe ueber der ganzen Zeile kehrt das `::after`
jetzt in den normalen Fluss zurueck; beide Stellen im Bild nachgeprueft.

Eine scheinbare Fehlstelle, die keine ist: Im Dunkelmodus zeichnet sich hinter einer Gruppe eine
grosse abgerundete Flaeche ab — das ist der Startknopf der Startseite, der durch das Milchglas der
Schublade scheint (82 % deckend seit Runde 103). Vergroessert und per Elementabfrage geklaert.

### Was offen bleibt

Profil, Ergebnisseite und Fragebogen tragen bis auf die Schrift noch die Kartenoptik aus Runde 69.
Ob die Tiere jetzt „wie Memoji" wirken, ist ein Urteil am Geraet.

---

## Runde 114 — Avatare wie in iOS, und die Einstellungen in iOS-Form

Zwei Auftraege des Inhabers: „die Avatare realistischer" und „insgesamt wie iOS von Apple, zum
Beispiel die Sprachauswahl in den Einstellungen als Liste wie bei iOS".

### 1. Die Avatare: kein fuenfter Nachschliff

Das war die **fuenfte** Rueckmeldung „zu unrealistisch". Das Journal hielt seit Runde 111 fest,
dass dann nicht wieder an derselben Konstruktion gearbeitet wird. Gefragt, mit drei Wegen; der
Inhaber hat den iOS-Weg gewaehlt: **Das realistischste Bild ist ein eigenes Foto** (konnte
Lucenta schon), sonst ein **Monogramm im Verlaufskreis wie in iOS-Kontakten**. Die gezeichneten
Menschen sind entfallen, die zwoelf Tiere bleiben.

- `13-figuren.js` 1086 -> 783 Zeilen: `figMensch` und sechs Helfer, die nur er benutzte
  (`figSchultern`, `figHaarVerlauf`, `figStraehnen`, `FIG_GLATT`, `figBrauen`, `FIG_LACHT`) —
  gezaehlt, nicht vermutet: Jeder kam nach dem Entfernen nur noch in seiner eigenen Definition vor.
- 80 Zeilen Beschriftung (`figur_m1` bis `figur_m10`) aus den acht Paketen.
- Gespeicherte Profile mit einer Menschenfigur fallen ueber `figurFinden()` von selbst auf das
  Monogramm zurueck; zu bereinigen ist nichts.
- Monogramm: zwei Buchstaben in SF, Verlauf von hell nach dunkel, aus vorhandenen Marken gemischt.
  Ueber `background-image` statt `background`, damit das eigene Foto (Inline-Stil) es schlaegt und
  beim Entfernen die Farbe zurueckkehrt. „Ruhig" ist jetzt das Grau der iOS-Kontakte.
- Die Halspruefung aus Runde 111 ist mit ihrem Gegenstand entfallen (`pruef-app`).

### 2. iOS-Formensprache, mit den Einstellungen als Vorlage

Neu: `src/styles/12-ios.css`, bewusst auf `#view-settings` beschraenkt — dieselben Klassen kommen
im Profil vor, und dort ist die Form eine eigene Frage.

Die Bausteine waren schon nah an iOS (Schieber 51x31, Liste mit Haken seit Runde 97/104). Was
fehlte, war die Anordnung: jede Gruppe eine Karte mit Fraunces-Titel DARIN, die Sprachliste als
zweiter Kasten in der Karte. Jetzt die eingerueckte, gruppierte Liste: Titel klein und grau
UEBER der Gruppe, eine Flaeche je Gruppe, Trennlinien ab der Textkante, Erklaerungen als
Fussnote darunter, Aktionen als Zeilen in der Akzentfarbe statt als Pillen, Zuruecksetzen als
eigene rote Zeile, die Profilzeile ganz antippbar mit Winkel.

**Text und Bedienung stehen in der ganzen App in der Systemschrift** (`--sans`: -apple-system,
auf dem iPhone SF Pro). Fraunces bleibt fuer die grossen Titel, Plex Mono fuer Codes und Zahlen.
Work Sans ist aus `00-schriften.css` entfernt — Ein-Datei-Fassung 1558 -> 1505 KB, App-Fassung
eine Schriftdatei weniger.

**Eine Falle dabei:** Das Ergebnisbild setzte seine Fusszeile ausdruecklich in „Work Sans". Auf
einer Zeichenflaeche wird eine Schrift nur benutzt, wenn sie schon geladen ist — bisher tat das
die Seite. Ohne sie waere das Bild lautlos auf eine Ersatzschrift gefallen. Jetzt ebenfalls SF.

`pruef-app`: „mindestens drei Schriftfamilien" ersetzt durch Namen statt Zahl — Fraunces und
Plex Mono geladen, Work Sans nicht, Fliesstext in der Systemschrift. Gegengeprueft: mit Work Sans
zurueck schlaegt die letzte an.

### Zwei Funde des Sammellaufs, beide echt

1. **32 Funde, alle derselbe Knopf**: „Profil bearbeiten" 34 statt 44 Punkte hoch und bei 320px
   mit langem Namen seitlich heraus. Behoben mit der iOS-Form selbst — der Knopf liegt ueber der
   ganzen Zeile, sichtbar bleibt der Winkel, die Beschriftung bleibt fuer VoiceOver.
2. **Die Schublade sah mit und ohne Glas byte-gleich aus.** Ursache war Runde 113: Der Himmel
   steht unter der Schublade still — oeffnete sie vor dem ersten gemalten Bild, blieb die Flaeche
   leer und hinter dem Glas lag nur Papier. Die Pruefung oeffnet gleich nach dem Laden und hat
   genau das gesehen. Jetzt wird beim Start sofort ein Bild gemalt.

### Was offen bleibt

Die iOS-Form steht in den **Einstellungen**. Die anderen Ansichten (Schublade, Profil,
Ergebnisseite, Fragebogen) tragen bis auf die Schrift noch die Formensprache aus Runde 69 —
Karten mit kraeftigem Rand und harter Unterkante. Die naechste Stelle nach demselben Muster waere
die Schublade, die in iOS eine Liste mit Winkeln ist. Das Urteil, ob die Einstellungen sich nach
iOS anfuehlen, gehoert ans Geraet.

---

## Runde 113 — der Plus-Umschalter in der App, und wo die Startseite wirklich ruckelte

Zwei Auftraege des Inhabers: „einen Switch auf der Profilseite, mit dem ich Plus und Standard
an- und abwaehlen kann, um zu sehen, wie die bezahlte Version aussieht" — und „die ganze App muss
ruckelloser und fluessiger laufen".

### 1. Der Umschalter: sichtbar beim Start aus Xcode, im Store-Archiv nicht vorhanden

Den Umschalter gab es seit Runde 84. Seit Runde 103 war er in der App **absichtlich unsichtbar**,
weil er dort im App Store das Abo verschenken wuerde — er war eine der zwei Stellen, die genau
das getan haben. Der Kommentar lehnte eine Debug-Marke ausdruecklich ab: „Eine Marke, die man
setzen muss, ist eine, die man vergisst, und dieses Vergessen kostet hier Geld."

Das gilt fuer `#if DEBUG` in Swift nicht, denn die setzt der Compiler, nicht ein Mensch.
`MainViewController.swift` spielt nur im Debug-Bau `window.__lucentaEntwicklungsbau = true` ein;
`15-profile.js` zeigt den Schalter, wenn keine Bruecke da ist ODER diese Marke. **Run** ist Debug,
**Archive** ist Release (Runde 110 ausgelesen) — im Store-Bau ist der ganze Block nicht im Programm.

**Am gebauten Programm nachgeprueft, nicht an der Quelle:** Debug-Programm enthaelt die Marke 1x,
Release-Programm 0x. Und weil „0x" auch die Antwort waere, wenn es den Bau gar nicht gaebe: Das
Release-Programm ist da (361 KB) und enthaelt Zeichenketten aus derselben Datei
(`data-transparenz` 2x) — die Suche funktioniert also.

**Eine zweite Falle, die den Schalter sonst nutzlos gemacht haette:** Beim Start fragt die App
den Store (`plusStandPruefen`), und der Simulator antwortet ehrlich „kein Kauf". Der Schalter
stuende damit nach jedem Neustart wieder auf aus. Im Entwicklungsbau nimmt diese Abfrage deshalb
nichts weg; geben darf sie weiterhin, damit ein Testkauf ankommt.

`pruef-nativ` 45 -> **49**. Die alte Zusicherung „kein #plusSchalter mit nativer Bruecke" bleibt
unveraendert — sie ist das, was im Store-Bau gilt. Neu: mit Marke steht er da, ueberlebt einen
Neustart, und schaltet in beide Richtungen. Gegengeprueft: ohne die zwei neuen Zeilen schlagen
die neuen Pruefungen fehl.

**Vorruebergehend** heisst damit: Er verschwindet von selbst, sobald archiviert wird. Soll er
auch aus dem Entwicklungsbau wieder weg, sind es die zwei Zeilen mit `entwicklungsBau()`.

### 2. Fluessigkeit: diesmal mit einem Instrument, das zusammensetzt

Runde 110 hatte gezeigt, dass headless WebKit GPU-Kosten nicht sieht. Neu deshalb
`tools/mess_sim/` — eine Messseite, die in **Safari im iOS-Simulator** laeuft, die App in einen
Rahmen laedt, Szenen abspielt und das Ergebnis an einen kleinen Server auf dem Mac schickt.
Benutzung steht in `server.py`.

**Der Befund war eindeutig und kam nicht von dort, wo das Journal ihn vermutet hatte.** Nicht das
Glas, sondern der **Sternenhimmel**: Startseite mit Himmel Median 110 ms je Bild (rund 9 Bilder pro
Sekunde), ohne ihn 23 ms. Gegengeprueft in headless WebKit: bei Pixeldichte 1 kostet er nichts,
bei Dichte 3 fallen auf dem schnellen Mac 15 von 121 Bildern aus. Darum war er in Runde 110
unsichtbar — gemessen wurde dort bei Dichte 1. Die Zeichenflaeche hatte 780x1688 Bildpunkte,
60-mal in der Sekunde neu gemalt, mit einem neu angelegten Verlauf je Stern.

Und er verteuerte das Glas: Eine Unschaerfe ueber einem BEWEGTEN Grund muss WebKit in jedem Bild
neu rechnen, ueber einem stehenden kann es sie zwischenspeichern.

Vier Hebel in `22-sternenhimmel.js`, keiner aendert das Aussehen nennenswert:

1. Pixeldichte hoechstens **1,5** statt 2 (0,74 statt 1,3 Mio. Bildpunkte).
2. Gemalt wird **jedes zweite Bild**, bewegt wird jedes — die Geschwindigkeit bleibt, nur die
   Zahl der Aufnahmen halbiert sich. Die Bewegung ist dafuer langsam genug.
3. **Unter Schublade, Bild- und Plus-Fenster steht er still.**
4. **Beim Scrollen steht er still**, bis 180 ms nach der letzten Bewegung.

| Simulator, innerhalb eines Laufs verglichen | vorher | nachher |
|---|---|---|
| Schublade oeffnet, Median je Bild | 190 ms | **17 ms** (= ohne Glas) |
| Scrollen Startseite, Bilder in gleicher Zeit | 90 | **226** (= ohne Glas und Himmel) |
| Startseite in Ruhe, Bilder | 52–114 | 141 (ohne Himmel 352) |

**Was diese Zahlen taugen, ehrlich:** Der Simulator drosselt Safari mitunter auf 30 Bilder pro
Sekunde (im ersten Lauf lag schon die Eichung „Ruhe" bei 33 ms), deshalb wird nur innerhalb eines
Laufs verglichen. Und er malt die 2D-Zeichenflaeche auf der CPU des Macs, ein iPhone auf seiner GPU
— er kann also uebertreiben. Die Richtung ist belastbar, die Groessenordnung auf dem Geraet nicht.

**Offen:** Die Startseite im Ruhezustand kostet im Simulator noch das 2,5-Fache von „ohne
Himmel". Der naechste Hebel waere, die Sterne als vorgezeichnete Bildchen zu stempeln statt je
Stern und Bild einen Verlauf anzulegen. Das ist ein Umbau am Zeichner eines ueber viele Runden
abgestimmten Bildes und gehoert erst gemacht, wenn das Geraet sagt, dass es noetig ist — nicht
auf Grund eines Instruments, das moeglicherweise uebertreibt. Dieselbe Vorsicht wie Runde 110.

Nicht angefasst: das Glas der Kopfleiste (beim Scrollen mit stehendem Himmel ohne messbaren
Unterschied mehr) und alle Uebergaenge.

---

## Runde 112 — Punkt 6, angefangen bei der Ergebnisseite

Punkt 6 der Liste („die App insgesamt visuell verschoenern") brauchte eine Antwort auf die Frage,
welche Ansicht am meisten stoert. Der Inhaber hat zweimal mit „weiter" geantwortet; genommen ist
deshalb der Vorschlag, der hier seit Runde 108 stand — die **Ergebnisseite** —, und das ist im
Bericht an ihn ausdruecklich gesagt, damit er umsteuern kann.

### Zwei Zahlen im Journal waren veraltet

Die Ergebnisseite ist **3,9 Bildschirme** lang (3306px bei 390x844), nicht acht, und traegt **42**
gerahmte Elemente, nicht 46. Gemessen mit Beispieldaten auf WebKit. Die alten Zahlen stammen aus
der Zeit vor der Formensprache aus Runde 69.

### Ein Messfehler unterwegs, und er war meiner

Die erste Aufnahme zeigte eine Luecke von rund 160px zwischen Kurzportraet und Netzdiagramm. Das
war **nicht** die Seite: Ich hatte fuer die Aufnahme alle Animationen mit `animation:none`
abgeschaltet, und die Kennzahl-Kacheln starten auf Deckkraft 0 und werden erst von ihrer
Einblendung sichtbar. Ohne Einblendung bleiben sie unsichtbar stehen. Richtig ist
`reducedMotion:'reduce'` im Browserkontext — das ist der Weg, den die App selbst kennt, und dort
setzt das Stilblatt die Deckkraft ausdruecklich auf 1. **Wer die Ergebnisseite fuer ein Bild
stillstellen will, nimmt diesen Weg, nicht `animation:none`.**

### Der Befund: dieselben fuenf Zahlen viermal

Bevor jemand eine einzige Erklaerung liest, stehen die fuenf Werte (74 · 70 · 63 · 56 · 48)
**viermal** untereinander: in den Kacheln, an den Achsen des Netzdiagramms, als Chips in der
Ergebniskarte und in den Karten des Berichts. Das ist zaehlbar und keine Geschmacksfrage.

Drei davon haben eine Aufgabe, und die steht jeweils am Code: Die Kacheln sind „auf einen Blick"
(die erste Zahl frueh, statt erst im Bericht), das Netzdiagramm ist ohne Beschriftung nicht
ablesbar, die Karten sind der Bericht. **Die Chips hatten keine.** Sie machten die Ergebniskarte
zum groessten Block der oberen Haelfte, obwohl deren Aufgabe Teilen und Code ist — und das
geteilte Bild zeichnet seine Werte ohnehin selbst (`10-ergebnisbild.js`).

### Was geaendert wurde

Die Chips sind heraus — Markup, das Befuellen in `11-rendering.js`, `.share-scores` und `.chip` im
Stilblatt (beides wurde nur dort benutzt; keine Testreihe und keine Pruefung haengt daran).

| | vorher | nachher |
|---|---|---|
| Ergebniskarte | 393px | **280px** |
| Ergebnisseite | 3306px | **3193px** |
| gerahmte Elemente | 42 | **37** |
| Wiederholungen der fuenf Werte vor dem Bericht | 3 | **2** |

### Was bewusst NICHT geaendert wurde

- **„Test wiederholen" steht weiter zweimal** (oben rechts und in der Karte), der **Code
  ebenfalls zweimal** (Karte und Vergleich). Beides sind Bedienelemente, und beim Vergleich ist
  das Vorbefuellen des eigenen Codes eine Hilfe, keine Wiederholung. Eine Streichung waere hier
  eine Entscheidung ueber Bedienung, nicht ueber Aussehen — die gehoert dem Inhaber.
- Der Schein hinter der Ueberschrift (der Strahlenkranz) ist in Runde 94–100 nachgemessen und
  zweimal auf Rueckmeldung eingestellt worden. Er bleibt.

### Was offen bleibt

Punkt 6 ist damit **angefangen, nicht erledigt** — „insgesamt verschoenern" ist kein Punkt, der
sich abhaken laesst. Die untere Haelfte der Ergebnisseite ist aufgeraeumt (Dimensionskarten,
Vergleich, Fusszeile ohne Befund). Die naechste Ansicht nach diesem Muster — erst zaehlen, dann
aendern — waere die, die der Inhaber nennt.

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

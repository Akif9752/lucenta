# Lucenta

Wissenschaftlich fundiertes Selbstverständnis- und Beziehungswerkzeug auf Basis des Big-Five-Modells
(IPIP-50, Goldberg 1992, gemeinfrei). Läuft vollständig im Browser, ohne Server, ohne Konto — alle
Daten bleiben im Speicher des Geräts.

Deutsch und Englisch, umschaltbar in den Einstellungen.

## Schnellstart

```bash
node build.js     # baut dist/lucenta.html
npm test          # bauen + 10 Testreihen + statische Prüfung
open dist/lucenta.html
```

Keine Abhängigkeiten. Node und Python 3 genügen.

## Aufbau

```
src/
  index.head.html     Kopf: Dokumenttyp, Zeichensatz, Meta-Angaben, App-Symbol, Anti-Flacker-Skript
  index.body.html     gesamtes Markup (zehn Ansichten, seit Runde 79 mit view-recht)
  styles/             13 CSS-Teile — die REIHENFOLGE ist bedeutsam
                      (00-schriften.css ist erzeugt, siehe tools/schriften_holen.mjs)
  js/                 23 JavaScript-Teile — die REIHENFOLGE ist bedeutsam
  i18n/*.js           7 Sprachpakete (Items, Texte, Oberfläche) — build.js liest alle
                      Dateien des Ordners, ein neues Paket wird durch Hinzulegen wirksam
  manifest.json       legt die Reihenfolge fest
build.js              setzt alles zu dist/lucenta.html zusammen
tests/                Testreihen und Ersatz-DOM
tools/audit_i18n.py   statische Prüfung der Mehrsprachigkeit
tools/fehlersuche.mjs Fehlersuche im echten Browser über alle Ansichten
tools/schriften_holen.mjs  holt die Schriften und legt sie als Daten ins Stilblatt
tools/renderer/       eigener HTML/CSS-Renderer (Python), siehe unten
docs/                 Produktplan, Markenrecherche, App-Store-Arbeitsliste
LIZENZEN.md           Urheberrechtsvermerke der drei eingebetteten Schriften (OFL 1.1)
assets/icon/          App-Symbol in elf Größen
```

**Die Datei ist seit Runde 80 deutlich groesser, und das ist ein Handel, kein Versehen.**
Vorher: 788 KB roh, 251 KB gzip, dazu drei Schriften, die von Google nachgeladen wurden.
Jetzt: 1.026 KB roh, 429 KB gzip, und nichts wird nachgeladen. Die 176 KB Schriftdaten
liegen im Stilblatt und damit im ersten Abruf — bei einem eingebetteten Stilblatt gibt es
kein Nachreichen, `font-display:swap` laeuft ins Leere.

Fuer eine App aus dem Store ist das gleichgueltig (die Datei liegt auf dem Geraet) und der
Gewinn eindeutig: keine Verbindung nach aussen, kein Datenschutzproblem, vollstaendiges
Aussehen ohne Netz. Fuer die Fassung im Browser kostet es rund eine Sekunde auf gedrosseltem
Mobilfunk. Der Handel ist zugunsten der App entschieden, weil sie das Ziel ist.

Der groesste einzelne Posten ist die **kursive Fraunces mit 41 KB fuer genau eine Stelle** —
das `<em>` in der Ueberschrift der Startseite. Bewusst behalten: Es ist die erste Zeile, die
jemand sieht, und eine schraeggestellte Fraunces ist keine kursive Fraunces, weil die echten
Kursivformen andere Buchstaben sind. Wer die Datei kleiner braucht, streicht diesen einen
Schnitt in `tools/schriften_holen.mjs`.

**Warum ein Aufbauschritt und keine Module im Browser:** Die App soll ohne Server lauffähig
bleiben — `dist/lucenta.html` lässt sich direkt öffnen —, und die Veröffentlichung als Artefakt
verlangt genau eine Datei. Die Aufteilung dient der Entwicklung, nicht der Auslieferung.

**`<!doctype html>` und `<meta charset="utf-8">` stehen in den ersten 40 Byte von
`index.head.html` und müssen dort bleiben.** Als Artefakt veröffentlicht wäre beides entbehrlich —
die Veröffentlichung legt selbst einen Rahmen darum. Direkt geöffnet oder von einem Server ohne
`charset` im Kopf ausgeliefert entschied ihr Fehlen aber darüber, ob „Erledige" als „a€Erledige"
erscheint (Runde 78, im Browser aufgefallen, im Artefakt unsichtbar).

**Die Reihenfolge in `manifest.json` ist keine Formsache.** Beim CSS entscheidet sie über die
Kaskade: Die Druckzustände in `10-druckzust-nde.css` müssen zuletzt stehen, sonst überschreiben
sie komponentenspezifische `:hover`-Regeln nicht (das war ein echter Fehler, siehe Runde 53).
Beim JavaScript entscheidet sie über die Ausführungsreihenfolge.

## Prüfen

```bash
npm test
```

Sechs Ebenen, die sich ergänzen:

1. **`node build.js`** — muss durchlaufen; ein Syntaxfehler fällt hier auf.
2. **`node tests/run.js`** — elf Reihen, rund 7.000 Prüfungen. Der App-Code wird bis zur Marke
   `wiring` gegen einen Ersatz-DOM ausgeführt.
3. **`python3 tools/audit_i18n.py`** — acht statische Eigenschaften der Mehrsprachigkeit.
4. **`npm run diff-sprachen`** — fährt im echten Browser jede Ansicht auf Deutsch ab und danach
   in **jeder** weiteren Sprache, und meldet jede Zeile, die zeichengleich geblieben ist. Braucht
   Playwright und läuft deshalb **nicht** in `npm test`; ein Durchgang je Sprache dauert rund zwei
   Minuten, deshalb nimmt das Werkzeug Sprachkürzel als Argument
   (`node tools/diff_sprachen.mjs es fr`). **Erwarteter Rest** (Runde 78 nachgeprüft, alle
   legitim): die fünf englischen OCEAN-Beschriftungen und die sechs Sprachnamen — beide stehen
   absichtlich in jeder Sprache gleich da — sowie echte Wortgleichheiten: `EXTRA.` (es, fr),
   `Extraversion` (en, fr), `Test` (en, es, fr, it), `System`, `NAME`, `optional`, `STABIL.`
   (en). Runde 80 kamen sechs dazu, alle aus den Namen der neuen Figuren und Vorlagen:
   `Panda` in fünf Sprachen und `Papier` auf Französisch — echte Wortgleichheiten, geprüft.
   Zusammen 127 Zeilen über alle sechs Sprachen; keine einzige unübersetzte.
5. **`npm run pruef-bewegung`** — misst im echten Browser, ob Bewegung tatsächlich läuft, und ob
   sie ausbleibt, wenn weniger Bewegung gewünscht ist. Ebenfalls nicht in `npm test`.

   **Warum es das braucht:** Dreimal hintereinander (Runde 63 bis 65) stand eine Animation
   korrekt im Stilblatt und war trotzdem nie zu sehen. Das Fünfeck im Ankunftsmoment hing am
   Element statt an `.show` und zeichnete sich beim Laden der Seite in einer unsichtbaren
   Überlagerung. Die Messbalken trugen seit jeher eine Übergangszeit von 0,9 s, die nie anlief,
   weil ein Übergang eine Änderung braucht und die Breite schon im erzeugten Markup stand. Die
   Versätze der Schublade zählten über `nth-child` alle Geschwister statt nur die Abschnitte.

   Keiner der drei Fälle ist im Quelltext zu sehen: Die Regel ist gültig, die Syntax stimmt, die
   Animation ist definiert. Sichtbar wird der Fehler erst, wenn man den Wert **über die Zeit**
   misst. Genau dafür ist diese Ebene da — dieselbe Lücke wie zwischen Punkt 2 und Punkt 3, nur
   eine Dimension weiter.

6. **`npm run fehlersuche`** — läuft im echten Browser alle zehn Ansichten ab, in beiden
   Farbschemata, einmal leer und einmal mit der Beispielnutzerin, in drei Sprachen, und sucht
   nach dem, was die fünf Ebenen davor strukturell nicht sehen können: seitlicher Überlauf,
   zu kleine Trefferflächen, Schaltflächen ohne lesbaren Namen, Reste einer Ersetzung im Text
   (`{{name}}`, `undefined`, `NaN`), doppelt vergebene Kennungen, unsichtbarer Text.

   **Trefferflächen werden getastet, nicht gemessen.** Der erste Entwurf las den Kasten des
   Elements aus und meldete daraufhin jede kleine Schaltfläche der App — obwohl deren Fläche
   seit Runde 60 über ein `::after` auf 44 Punkte gebracht wird, das im Kasten nicht auftaucht.
   Eine Prüfung, die genau dort anschlägt, wo das Problem längst gelöst ist, verdeckt die
   Stellen, an denen es das nicht ist. Jetzt fragt sie, was ein Daumen fragt: Trifft ein Tipp
   21 Punkte über, unter, links und rechts von der Mitte noch dasselbe Element? Damit fiel
   auch auf, dass zwei der sechs echten Fälle aus der Runde davor stammten — die Schieber für
   Haptik und Bewegung, deren Kommentar behauptete, 52x32 sei groß genug.

   Gelaufen wird bei **390 px und bei 320 px** — der Breite der verbreiteten iPhones und der
   des kleinsten, das noch aktuelles iOS bekommt. Seitlicher Überlauf zeigt sich immer zuerst
   bei 320, wo deutsche Komposita und französische Umschreibungen mehr Platz brauchen als da
   ist. **Ergebnis Runde 80: kein Überlauf in keiner Sprache**, auch nicht bei 320.

   Genau **eine** Ausnahme steht namentlich im Werkzeug: die fünf Antwortkreise messen bei
   320 px 42x42 und stehen unmittelbar nebeneinander — eine größere Trefferfläche würde dort
   die Nachbarn überlappen und Fehlgriffe erzeugen statt sie zu verhindern (Abwägung aus
   Runde 60). Sie steht namentlich da und nicht als gesenkte Zahl, damit sie eine Entscheidung
   bleibt.

   Ein Weg trägt seine eigenen Eingaben: Das Vergleichsergebnis entsteht erst, wenn zwei Codes
   eingetragen und verglichen wurden — bis dahin ist der Block leer, und die Prüfung lief an
   fünf Karten, zwei Feldern und einem Messbalken vorbei, ohne sie je zu sehen. Sie trägt die
   Codes jetzt selbst ein und **bricht ab, wenn danach keine fünf Karten dastehen**: Wo nichts
   steht, ragt nichts heraus und ist keine Fläche zu klein — eine Prüfung, die an ihrem eigenen
   Gegenstand vorbeilaufen kann, ist keine.

   Nicht in `npm test`, weil es einen Browser braucht; ein voller Lauf dauert rund zwölf Minuten.

**Warum es Punkt 3 gibt, und das ist die wichtigste Zeile in dieser Datei:** Der Ersatz-DOM aus
Punkt 2 behandelt `textContent` und `innerHTML` gleich. In Runde 56 war die App auf jedem Gerät
sichtbar kaputt — auf der Startseite stand wörtlich `Of&shy;fen&shy;heit` —, während alle zehn
Reihen grün waren. Ein Fehler, der genau in diesem Unterschied liegt, ist in Punkt 2 strukturell
unsichtbar. Punkt 3 setzt deshalb an der Datei selbst an. **Keine der beiden Ebenen ersetzt die
andere.**

**Runde 58 hat dieselbe Lücke an drei weiteren Stellen gefunden**, alle im echten Browser
sichtbar und in allen zehn Reihen grün: nicht übersetzte Attribute, deutsche Anführungszeichen
im englischen Paket, und deutsche Literale, die über `push()` oder Zeichenkettenverkettung in
die Oberfläche wandern statt über `textContent`. Prüfung 6 ist entsprechend verschärft,
Prüfung 7 und 8 sind neu.

**Runde 59 kam von außen: Eine Nutzerin sah `ALLTAG · BEZIEHUNGEN · WACHSTUM` auf der
englischen Ergebnisseite**, während alle zehn Reihen und alle acht Prüfungen grün waren. Der
Grund war doppelt, und beide Hälften waren Fehler in der Prüfung selbst:

- Prüfung 6 suchte nach Zuweisungsmustern. Das Muster `.innerHTML = ([^;]+);` brach am
  Semikolon von `&middot;` ab — fünf Literale im Ergebnisbericht lagen dahinter.
- Prüfung 6 verglich gegen eine **von Hand gepflegte Wortliste**. „Alltag" stand nicht darauf.

Eine Liste kann nur finden, woran vorher jemand gedacht hat. Prüfung 6 leitet den deutschen
Wortschatz deshalb jetzt **aus den Sprachpaketen selbst** ab: alles, was in den deutschen
Texten vorkommt und in den englischen nicht (derzeit 710 Wörter). Die Liste wächst
automatisch mit den Paketen mit. Beim ersten Lauf fand sie sofort fünf weitere Stellen, die
niemand gesucht hatte — darunter zwei auf dem Canvas des Ergebnisbildes.

Dazu kam ein Fehler im Prüfwerkzeug, nicht in der App: Der automatisierte Durchlauf klickte
den Fragebogen mit 110 ms Abstand durch, die Weiterschaltung braucht aber 220 ms. Er
beantwortete damit fünfzigmal dieselbe Frage und erreichte die Ergebnisansicht **nie** —
ausgerechnet die Ansicht, in der der gemeldete Fehler stand. `tools/diff_sprachen.mjs` bricht
jetzt ab, wenn nach dem Durchlauf kein Ergebnis gespeichert ist. Das Muster wiederholt sich: **Was der Ersatz-DOM nicht kennt, kann
keine Reihe prüfen.** Attribute, Zeichenwahl und Farbkontrast gehören dazu.

## Farben für Daten

`--daten-energie` und `--daten-stimmung` sind von den Akzenten der Oberfläche getrennt, und das
hat einen gerechneten Grund: `--accent` (`#2F6F6A`) hat in OKLCH die Chroma **0,066** und liegt
damit unter dem Boden von 0,10, ab dem eine Fläche als Farbe statt als Grau gelesen wird. In der
Oberfläche ist diese Zurückhaltung gewollt; eine Datenlinie muss dagegen Identität tragen. Selbst
ein voll gesättigtes Teal derselben Helligkeit erreicht den Boden nicht — der Ton muss heller
werden.

Beide Paare sind gegen die sechs Prüfungen gerechnet, nicht geschätzt: Helligkeitsband, Chroma,
Trennschärfe bei Farbfehlsichtigkeit (Protanopie/Deuteranopie), Normalsicht, Kontrast zur Fläche.
Der Dunkelmodus hat **eigene Stufen** statt aufgehellter heller Werte.

| | Energie | Stimmung |
|---|---|---|
| hell (auf `--surface` `#FFFFFF`) | `#0E9C92` | `#C97A3C` |
| dunkel (auf `--surface` `#17211C`) | `#25A89D` | `#C87F45` |

## Eine Farbe je Dimension — und warum nur eine zur Zeit

`--dim-o`, `--dim-c`, `--dim-e`, `--dim-a`, `--dim-s` tragen je eine Farbe für die fünf
Dimensionen. Das Porträt nimmt die Farbe der **stärksten** Dimension an: Kopfzeile, Radar und
die Vorschaukarte auf der Startseite.

**Fünf gleichzeitig sichtbare Farbtöne sind nicht sicher unterscheidbar.** Das ist gemessen, nicht
vermutet: Selbst die geprüfte Referenzpalette fällt bei allen Paaren durch — Magenta gegen Aqua
liegt bei Deuteranopie auf ΔE 1,6, und im Hellmodus scheitert sogar die Normalsicht mit 12,9
gegenüber dem Boden von 15. Warme Töne (Orange, Olive, Gold) fallen bei Protanopie ohnehin
zusammen; mehr als etwa vier trennbare Positionen gibt der Farbraum nicht her.

Deshalb: **nie zwei davon nebeneinander.** Die Kennzahlenreihe, die Messbalken und die
Dimensionskarten bleiben einfarbig. Jede der fünf Farben ist einzeln gegen Helligkeitsband,
Chroma und Kontrast zur Fläche geprüft, in beiden Modi.

| Dimension | hell | dunkel |
|---|---|---|
| Offenheit | `#7B5BD6` | `#8E78E0` |
| Gewissenhaftigkeit | `#2A78D6` | `#4E93E8` |
| Extraversion | `#C4562F` | `#CE7539` |
| Verträglichkeit | `#0E9C92` | `#25A89D` |
| Emotionale Stabilität | `#B8447E` | `#D06694` |

Das ist Identität, keine Bewertung — der Grundsatz „kein Pol ist besser als der andere" bleibt
unberührt: Die Farbe sagt *welche* Dimension, nicht *wie gut*.

**Eine Achse, nie zwei.** Energie und Stimmung teilen die Skala 1–5 und liegen deshalb in einem
Diagramm auf einer Achse. Zwei y-Achsen wären hier der naheliegende Fehler: Sie erzeugen
Kreuzungen und Abstände, die in den Daten nicht existieren.

## Der eigene Renderer

`tools/renderer/` ist ein von Grund auf gebauter HTML/CSS/SVG-Renderer in Python. Er existiert,
weil in der bisherigen Arbeitsumgebung kein Browser verfügbar war und Gestaltungsfragen sonst nur
hätten geschätzt werden können. Er beherrscht Kaskade, CSS-Variablen, `color-mix`, Flexbox samt
Umbruch, Grid, absolute Positionierung, weiche Trennstriche, `overflow-wrap`, `min-width:auto`
und SVG.

**Seit Runde 58 ist ein echter Browser verfügbar** (Chromium über Playwright); der erste
Durchlauf damit hat sofort sechs Fehler gefunden, die keine Testreihe sehen konnte. Der Renderer
bleibt als Nachschlagewerk und für Vergleichsbilder liegen, ist für Gestaltungsfragen aber nicht
mehr die maßgebliche Instanz. Seine Schriften sind Ersatz (DejaVu statt Fraunces/Work Sans/IBM
Plex Mono) — exakte Zeilenumbrüche waren damit nie beurteilbar.

## Mehrsprachigkeit

Texte stehen in `src/i18n/`. Drei Arten von Marken im Markup:

| Marke | Wirkung |
|---|---|
| `data-i18n` | setzt `innerHTML` |
| `data-i18n-html` | setzt `innerHTML` (Fragmente mit Auszeichnung) |
| `data-i18n-text` | ersetzt nur den Textknoten, lässt Symbole stehen |
| `data-i18n-placeholder` | setzt das `placeholder`-Attribut (Entitäten aufgelöst) |
| `data-i18n-aria` | setzt das `aria-label`-Attribut (Entitäten aufgelöst) |

Dynamische Texte laufen über `tx('schluessel')`.

**Sieben Sprachen:** Deutsch (Rückfallsprache), Englisch, Spanisch, Französisch, Italienisch,
Portugiesisch, Japanisch. `src/i18n/de.js` ist der Maßstab — jedes andere Paket muss **genau
dieselben Schlüssel** tragen; die Reihe „Sprachwechsel" (196 Prüfungen) und Prüfung 1 des Audits
erzwingen das von zwei Seiten.

**Die Messung darf sich durch eine Übersetzung nicht ändern.** Deshalb prüft die Reihe für jede
Sprache einzeln, dass `FACTORS` je Dimension 10 Items hat und die **Polung Zeichen für Zeichen**
der Rückfallsprache entspricht — und dass dieselben 50 Antworten in allen sieben Sprachen
denselben Wert ergeben. Eine vertauschte Polung wäre sonst ein stiller Messfehler: Der Text sähe
richtig aus, das Ergebnis wäre falsch.

**Sechs Regeln, jede aus einem echten Fehler entstanden:**

1. **Niemals über `textContent` setzen.** Die Texte enthalten Entitäten (`&mdash;`, `&shy;`,
   `&amp;`); über `textContent` zeigt der Browser sie wörtlich.
2. **Kein Element markieren, dessen Inhalt der Code selbst setzt** — `applyI18n()` würde ihn
   überschreiben. Solche Stellen übersetzt der Code über `tx()`.
3. **Neue Texte immer in beide Pakete.** `tools/audit_i18n.py` erzwingt das.
4. **Jedes `placeholder` und `aria-label` bekommt eine Marke.** Attribute sind kein Text im
   Sinne des Ersatz-DOM — keine der zehn Reihen liest je ein Attribut. Bis Runde 58 waren
   deshalb 5 Platzhalter und 21 `aria-label` in jeder Sprache deutsch; auf Englisch war die
   Bedienoberfläche für Screenreader vollständig deutsch. Prüfung 7 erzwingt die Marke.
5. **Text auf dem Canvas ist genauso Text.** Das Ergebnisbild wird gezeichnet, nicht gerendert
   — es steht in keinem DOM. Weder die zehn Reihen noch der Sprachvergleich können es sehen;
   `ERGEBNISKARTE` und die Fußzeile blieben deshalb bis Runde 59 deutsch. Prüfung 6 findet
   solche Literale, weil sie am Quelltext ansetzt und nicht am DOM.
6. **Anführungszeichen gehören zur Sprache.** Deutsch `&bdquo;…&ldquo;`, Englisch und
   Portugiesisch `&ldquo;…&rdquo;`, Spanisch/Französisch/Italienisch `&laquo;…&raquo;`,
   Japanisch `「…」`. Das englische Paket hatte an 12 Stellen das deutsche Paar übernommen —
   für Prüfung 1 und 3 unauffällig, im Browser sofort sichtbar. Prüfung 8 erzwingt seit Runde 78
   für **jedes** Paket, dass es sein eigenes Paar benutzt und keines einer anderen Sprache.

**Zum Wortlaut des Fragebogens.** Englisch ist der Originalwortlaut der IPIP Big-Five Factor
Markers (Goldberg 1992, gemeinfrei) — die einzige Sprache ohne Übersetzungsrisiko. Für die
übrigen sechs ist der Wortlaut eine sorgfältige Arbeitsübersetzung: Zuordnung und Polung stimmen
Item für Item, der Wortlaut ist aber nicht zitierbar. Das galt seit jeher schon für Deutsch (35
der 50 Items sind eigene Umformulierungen, siehe „Offene Punkte") und gilt seit Runde 78 auch für
Spanisch, Französisch, Italienisch, Portugiesisch und Japanisch. Die App sagt das selbst — der
Hinweis unter der Sprachauswahl nennt es beim Namen, statt eine Validierung zu behaupten, die es
nicht gibt. Siehe `docs/klarsicht-produktplan.md`, Runde 54.

## Was die Verstehen-Ansicht zeigt

Bis Runde 82 waren es vier Karten zu den zwei stärksten Dimensionen, jede für sich. Eine
Dimension für sich ist aber nicht das, was jemand über sich erfahren will: Hohe
Gewissenhaftigkeit liest sich mit hoher Offenheit völlig anders als mit niedriger. Dazu kamen
zwei Abschnitte:

**Kombinationen.** Eine Tabelle über alle **zehn Paare in allen vier Pol-Lagen**, also
vierzig Fälle je Sprache. Bewusst vollständig und nicht als Auswahl „besonders interessanter"
Kombinationen — sonst hätten manche Menschen hier zwei Karten und andere keine, und die ohne
wären genau die, deren Ergebnis seltener ist. Die Sprachreihe zählt die vierzig Fälle je
Paket ab; ein Browser-Durchlauf über alle 32 Vorzeichen-Kombinationen mal zehn
Stärkemuster hat nachgewiesen, dass **alle 40 tatsächlich erreichbar sind** und keine leer
bleibt.

**Was in den eigenen Daten steht.** Der Teil, den keine andere Persönlichkeits-App haben
kann: Verlauf, Tagesform und Vergleichsarchiv liegen bereits auf dem Gerät. Fünf Befunde,
jeder nennt die Zahl, auf der er beruht, keiner erscheint ohne Grundlage. Zwei davon
brauchen nichts außer dem einen Ergebnis — sonst stünde beim allerersten Durchlauf genau
eine Karte unter einer Überschrift im Plural.

Ausdrücklich **nicht** enthalten: benannte Studien mit Jahreszahlen. Der Wunsch stand im
Raum und ist berechtigt, aber Quellenangaben, die niemand gegengeprüft hat, wären in einer
App mit diesem Anspruch schlimmer als keine.

## Offene Punkte

- **Deutscher Fragebogen-Wortlaut ist nicht die offizielle Fassung.** 15 der 50 Items sind
  wortgleich die Übersetzung von Fritz Ostendorf, die übrigen 35 sind eigene Umformulierungen
  desselben Items. Zuordnung und Polung stimmen, die Berechnung ist sauber — aber der Wortlaut
  ist nicht zitierbar. Entscheidung offen (Runde 54).
- **Impressum und Datenschutzerklärung stehen, sechs Angaben fehlen.** Der Text ist fertig und
  liegt unter Einstellungen → Rechtliches. Was nur die betreibende Person liefern kann — Name,
  Straße, Ort, E-Mail, Hoster, ggf. USt-ID —, steht an genau einer Stelle: `IMPRESSUM` in
  `src/js/17-settings.js`. Solange eine davon fehlt, sagt die Ansicht das in aller Deutlichkeit;
  ein Impressum mit Platzhaltern ist schlimmer als keines.
- **Markenrecherche:** Registerteil erledigt (`docs/lucenta-markenrecherche.md`), die anwaltliche
  Ähnlichkeitsprüfung zu LUCENTIS und LUCENT steht aus.
- **Installierbarkeit** funktioniert erst mit eigener Domain — im eingebetteten Rahmen liest iOS
  nur die äußere Seite (Runde 51).
- **Belegte Item-Fassungen fehlen für sechs der sieben Sprachen.** Runde 78 hat Spanisch,
  Französisch, Italienisch, Portugiesisch und Japanisch als Arbeitsübersetzung ergänzt, weil die
  App sonst einsprachig geblieben wäre; für Spanisch existiert bei IPIP keine veröffentlichte
  Fassung der Big-Five-Marker. Solange das so ist, ist die App in diesen Sprachen benutzbar, aber
  ihr Fragebogen nicht zitierbar. Für einen wissenschaftlichen Anspruch bleibt das der größte
  offene Punkt — vor Impressum und Markenrecherche.

## Nächster Schritt: iOS

Die vollständige Arbeitsliste steht in **`docs/app-store-start.md`** — getrennt nach erledigt,
vorbereitet (wartet auf einen Mac) und nur von der betreibenden Person zu erledigen.

Vorgesehen ist **Capacitor**, nicht eine Neuentwicklung — die bestehende App bekommt eine native
Hülle und behält alles.

Zwei Dinge sind seit Runde 80 erledigt, die vorher stillschweigend im Weg standen: Die App
**lädt nichts mehr nach** (die Schriften lagen bei Google und hätten eine Store-App ohne Netz in
Systemschrift geöffnet — nebenbei ein Datenschutzproblem, weil bei jedem Öffnen die IP-Adresse
an einen Dritten ging), und die Datenschutzangaben im Store lassen sich dadurch auf den
kleinstmöglichen Fall stellen: **Data Not Collected**, in jeder Kategorie.

Der wahrscheinlichste Ablehnungsgrund ist **Richtlinie 4.2**: eine in eine Hülle gepackte
Webseite. Dagegen hilft keine Formulierung, sondern Funktionen, die es im Browser nicht gibt.
Die zwei kleinsten mit dem größten Effekt sind eine **lokale Mitteilung für die Tagesform** und
das **System-Teilen-Blatt** für das Ergebnisbild; beides steht in der Arbeitsliste.

## Grundsätze

Aus 56 Runden, jeder einzelne aus einer konkreten Entscheidung:

- **Das validierte Instrument wird nicht angetastet.** Keine Kürzung des Fragebogens, keine
  erfundenen Sub-Facetten, keine eigenmächtige Akquieszenz-Korrektur.
- **Kein Pol ist besser als der andere.**

**Runde 58 hat dieselbe Lücke an drei weiteren Stellen gefunden**, alle im echten Browser
sichtbar und in allen zehn Reihen grün: nicht übersetzte Attribute, deutsche Anführungszeichen
im englischen Paket, und deutsche Literale, die über `push()` oder Zeichenkettenverkettung in
die Oberfläche wandern statt über `textContent`. Prüfung 6 ist entsprechend verschärft,
Prüfung 7 und 8 sind neu.

**Runde 59 kam von außen: Eine Nutzerin sah `ALLTAG · BEZIEHUNGEN · WACHSTUM` auf der
englischen Ergebnisseite**, während alle zehn Reihen und alle acht Prüfungen grün waren. Der
Grund war doppelt, und beide Hälften waren Fehler in der Prüfung selbst:

- Prüfung 6 suchte nach Zuweisungsmustern. Das Muster `.innerHTML = ([^;]+);` brach am
  Semikolon von `&middot;` ab — fünf Literale im Ergebnisbericht lagen dahinter.
- Prüfung 6 verglich gegen eine **von Hand gepflegte Wortliste**. „Alltag" stand nicht darauf.

Eine Liste kann nur finden, woran vorher jemand gedacht hat. Prüfung 6 leitet den deutschen
Wortschatz deshalb jetzt **aus den Sprachpaketen selbst** ab: alles, was in den deutschen
Texten vorkommt und in den englischen nicht (derzeit 710 Wörter). Die Liste wächst
automatisch mit den Paketen mit. Beim ersten Lauf fand sie sofort fünf weitere Stellen, die
niemand gesucht hatte — darunter zwei auf dem Canvas des Ergebnisbildes.

Dazu kam ein Fehler im Prüfwerkzeug, nicht in der App: Der automatisierte Durchlauf klickte
den Fragebogen mit 110 ms Abstand durch, die Weiterschaltung braucht aber 220 ms. Er
beantwortete damit fünfzigmal dieselbe Frage und erreichte die Ergebnisansicht **nie** —
ausgerechnet die Ansicht, in der der gemeldete Fehler stand. `tools/diff_sprachen.mjs` bricht
jetzt ab, wenn nach dem Durchlauf kein Ergebnis gespeichert ist. Das Muster wiederholt sich: **Was der Ersatz-DOM nicht kennt, kann
keine Reihe prüfen.** Attribute, Zeichenwahl und Farbkontrast gehören dazu. Verlaufspfeile bleiben farbneutral, das App-Symbol
  setzt keine Spitze.
- **Bindung um ihrer selbst willen ist nicht das Ziel.** Kein Serien-Zähler, kein vorgetäuschter
  Fortschritt, keine erfundenen Preisanker. Bewegung, die eine Handlung beantwortet, ist Funktion;
  Bewegung, die beeindrucken soll, ist Dekoration.

  **Drei bewusste Ausnahmen.** Alle drei beantworten keine Handlung, alle drei waren ausdrücklich
  gewünscht, alle drei stehen hier, damit sie niemand später für ein Versehen hält — und damit klar
  bleibt, dass der Grundsatz gilt und diese Stellen die Ausnahmen sind, nicht der neue Maßstab.

  **Runde 71: der bewegte Sternenhimmel auf der Startseite.** Er läuft nur dort, pausiert im
  Fragebogen und bei verborgenem Tab und steht bei `prefers-reduced-motion` still. Anzumerken
  ist, dass er der Aussage direkt davor widerspricht: „Lern dich kennen &mdash; mit Wissenschaft,
  nicht mit Sternzeichen." Ein Sternenhimmel hinter genau diesem Satz ist ein sichtbarer
  Widerspruch zur Kernaussage der Marke. Das wurde vor dem Bau benannt und bewusst so entschieden.

  **Runde 83/85: der Hellmodus bekam eine eigene Atmosphäre.** Ein Sternenhimmel bei Tag ergab
  keinen Sinn; an seiner Stelle steht Staub in einem Lichtstrahl &mdash; dieselbe Physik, nur
  durch Licht sichtbar statt durch Dunkelheit, und zugleich das Bild, auf dem die Marke steht
  (der Name heißt leuchtend, das Zeichen ist eine Öffnung). Runde 85 ergänzte den Fächer aus
  einzelnen Sonnenstrahlen: Der weiche Streifen allein wurde als heller Fleck gelesen, nicht als
  Tageslicht. Was Tag von Nacht unterscheidet, ist nicht Helligkeit, sondern Richtung und Quelle.
  Runde 86 korrigierte drei Dinge, die erst im vergrößerten Bild sichtbar wurden: Die Sonne stand
  zu weit in der Fläche, die Körner waren dunkler als der Grund (und lasen sich damit als
  Schmutzflecken statt als beleuchteter Staub), und die hellen Körner lagen nicht dort, wo die
  Strahlen waren — der Streifen und der Fächer wanderten unabhängig voneinander. Die Beleuchtung
  hängt jetzt am Winkel zum Sonnenort, also an dem Licht, das tatsächlich da ist.

  **Runde 88 fand die eigentliche Ursache dafür, dass die Strahlen „zu schwarz" wirkten** —
  gemessen am rechten Rand: Farbe (89,89,64) bei Deckkraft 20, also ein *Abdunkeln* statt eines
  Aufhellens. Ein Canvas-Verlauf nach `transparent` läuft nicht nach „dieselbe Farbe, nur
  unsichtbar", sondern nach `rgba(0,0,0,0)` — nach **Schwarz** mit Deckkraft null; und weil die
  Zeichenfläche die vier Kanäle einzeln zwischenrechnet, wandert die Farbe unterwegs durch Grau.
  Im Stilblatt passiert das nicht (CSS rechnet mit vorher multiplizierter Deckkraft), weshalb
  dieselbe Schreibweise dort richtig und hier falsch ist. Die Lösung ist immer dieselbe: als
  Endpunkt dieselbe Farbe mit Deckkraft 0. Betroffen waren vier Stellen — Sonnenfächer,
  Lichtstreifen, Sternenhöfe und Staubkörner.

  **Runde 87: der Lidschlag der Avatare.** Er beantwortet keine Handlung und ist damit die
  dritte Ausnahme. Der Grund, ihn trotzdem zu bauen: Eine Figur, die blinzelt, ist lebendig; eine,
  die es nicht tut, ist ein Bild — und 96 % der Zeit passiert nichts, es gibt kein Schweben und
  kein Wackeln. Die Verzögerung hängt am Element, damit nicht zweiundzwanzig Figuren in der
  Auswahl im Gleichtakt blinzeln; das sähe nach Fehlfunktion aus, nicht nach Leben. Bei
  `prefers-reduced-motion` steht er still.

  **Runde 62:** Der schwache, langsam atmende Schein hinter der
  Startseiten-Überschrift beantwortet keine Handlung. Er ist Zierde, wurde ausdrücklich gewünscht
  und ist in `10-druckzustaende.css` als solche benannt. Er steht hier, damit niemand ihn später
  für ein Versehen hält und entfernt — und damit klar bleibt, dass der Grundsatz selbst gilt und
  diese eine Stelle die Ausnahme ist, nicht der neue Maßstab.
- **Der Bau prüft, ob das Ergebnis überhaupt läuft.** Anlass war eine fehlende schließende
  Klammer, die durch *alle sechs* Prüfschichten kam: Der Bau hängt nur Text aneinander, die
  Testreihen laden den gemeinsamen Bereich bis zu einer Marke und sahen die betroffene Datei gar
  nicht, der i18n-Prüfer liest den Quelltext als Text. Grün gemeldet — und im Browser startete
  die App nicht. Ein Bau, der kaputten Code ausliefert und dabei „fertig" sagt, ist schlimmer als
  keiner. `new Function()` parst jetzt das zusammengesetzte JavaScript, ohne es auszuführen; das
  deckt genau diese Fehlerklasse und braucht weder Browser noch Abhängigkeit.
- **Was nicht geprüft ist, wird als ungeprüft benannt** — im Produktplan steht zu jeder Runde ein
  ehrlicher Verifikationsstatus.

Die vollständige Begründung jeder Entscheidung steht in `docs/klarsicht-produktplan.md`.

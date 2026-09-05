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
  index.head.html     Kopf: Meta-Angaben, App-Symbol, Anti-Flacker-Skript
  index.body.html     gesamtes Markup (neun Ansichten)
  styles/             11 CSS-Teile — die REIHENFOLGE ist bedeutsam
  js/                 19 JavaScript-Teile — die REIHENFOLGE ist bedeutsam
  i18n/de.js, en.js   Sprachpakete (Items, Texte, Oberfläche)
  manifest.json       legt die Reihenfolge fest
build.js              setzt alles zu dist/lucenta.html zusammen
tests/                Testreihen und Ersatz-DOM
tools/audit_i18n.py   statische Prüfung der Mehrsprachigkeit
tools/renderer/       eigener HTML/CSS-Renderer (Python), siehe unten
docs/                 Produktplan und Markenrecherche
assets/icon/          App-Symbol in elf Größen
```

**Warum ein Aufbauschritt und keine Module im Browser:** Die App soll ohne Server lauffähig
bleiben — `dist/lucenta.html` lässt sich direkt öffnen —, und die Veröffentlichung als Artefakt
verlangt genau eine Datei. Die Aufteilung dient der Entwicklung, nicht der Auslieferung.

**Die Reihenfolge in `manifest.json` ist keine Formsache.** Beim CSS entscheidet sie über die
Kaskade: Die Druckzustände in `10-druckzust-nde.css` müssen zuletzt stehen, sonst überschreiben
sie komponentenspezifische `:hover`-Regeln nicht (das war ein echter Fehler, siehe Runde 53).
Beim JavaScript entscheidet sie über die Ausführungsreihenfolge.

## Prüfen

```bash
npm test
```

Drei Ebenen, die sich ergänzen:

1. **`node build.js`** — muss durchlaufen; ein Syntaxfehler fällt hier auf.
2. **`node tests/run.js`** — zehn Reihen, rund 7.000 Prüfungen. Der App-Code wird bis zur Marke
   `wiring` gegen einen Ersatz-DOM ausgeführt.
3. **`python3 tools/audit_i18n.py`** — acht statische Eigenschaften der Mehrsprachigkeit.

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
Prüfung 7 und 8 sind neu. Das Muster wiederholt sich: **Was der Ersatz-DOM nicht kennt, kann
keine Reihe prüfen.** Attribute, Zeichenwahl und Farbkontrast gehören dazu.

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

**Fünf Regeln, jede aus einem echten Fehler entstanden:**

1. **Niemals über `textContent` setzen.** Die Texte enthalten Entitäten (`&mdash;`, `&shy;`,
   `&amp;`); über `textContent` zeigt der Browser sie wörtlich.
2. **Kein Element markieren, dessen Inhalt der Code selbst setzt** — `applyI18n()` würde ihn
   überschreiben. Solche Stellen übersetzt der Code über `tx()`.
3. **Neue Texte immer in beide Pakete.** `tools/audit_i18n.py` erzwingt das.
4. **Jedes `placeholder` und `aria-label` bekommt eine Marke.** Attribute sind kein Text im
   Sinne des Ersatz-DOM — keine der zehn Reihen liest je ein Attribut. Bis Runde 58 waren
   deshalb 5 Platzhalter und 21 `aria-label` in jeder Sprache deutsch; auf Englisch war die
   Bedienoberfläche für Screenreader vollständig deutsch. Prüfung 7 erzwingt die Marke.
5. **Anführungszeichen gehören zur Sprache.** Deutsch `&bdquo;…&ldquo;`, Englisch
   `&ldquo;…&rdquo;`. Das englische Paket hatte an 12 Stellen das deutsche Paar übernommen —
   für Prüfung 1 und 3 unauffällig, im Browser sofort sichtbar. Prüfung 8 erzwingt es.

Der Fragebogen wird **nicht übersetzt**. Je Sprache wird die dafür veröffentlichte Fassung
verwendet; auf Englisch ist das der Originalwortlaut. Siehe `docs/klarsicht-produktplan.md`,
Runde 54.

## Offene Punkte

- **Deutscher Fragebogen-Wortlaut ist nicht die offizielle Fassung.** 15 der 50 Items sind
  wortgleich die Übersetzung von Fritz Ostendorf, die übrigen 35 sind eigene Umformulierungen
  desselben Items. Zuordnung und Polung stimmen, die Berechnung ist sauber — aber der Wortlaut
  ist nicht zitierbar. Entscheidung offen (Runde 54).
- **Impressum und Datenschutzerklärung fehlen.** Blockiert jeden öffentlichen Launch und ist für
  einen App-Store-Eintrag zwingend.
- **Markenrecherche:** Registerteil erledigt (`docs/lucenta-markenrecherche.md`), die anwaltliche
  Ähnlichkeitsprüfung zu LUCENTIS und LUCENT steht aus.
- **Installierbarkeit** funktioniert erst mit eigener Domain — im eingebetteten Rahmen liest iOS
  nur die äußere Seite (Runde 51).
- **Spanisch und Französisch** erst mit belegten Item-Fassungen; für Spanisch existiert bei IPIP
  keine für die Big-Five-Marker.

## Nächster Schritt: iOS

Vorgesehen ist **Capacitor**, nicht eine Neuentwicklung — die bestehende App bekommt eine native
Hülle und behält alles. Voraussetzungen: Mac mit Xcode, Apple Developer Program (99 €/Jahr) und
eine erreichbare Datenschutzerklärung. Der lohnendste native Zugewinn ist **Haptik** im
Fragebogen — ein spürbarer Impuls bei jeder der 50 Antworten.

## Grundsätze

Aus 56 Runden, jeder einzelne aus einer konkreten Entscheidung:

- **Das validierte Instrument wird nicht angetastet.** Keine Kürzung des Fragebogens, keine
  erfundenen Sub-Facetten, keine eigenmächtige Akquieszenz-Korrektur.
- **Kein Pol ist besser als der andere.**

**Runde 58 hat dieselbe Lücke an drei weiteren Stellen gefunden**, alle im echten Browser
sichtbar und in allen zehn Reihen grün: nicht übersetzte Attribute, deutsche Anführungszeichen
im englischen Paket, und deutsche Literale, die über `push()` oder Zeichenkettenverkettung in
die Oberfläche wandern statt über `textContent`. Prüfung 6 ist entsprechend verschärft,
Prüfung 7 und 8 sind neu. Das Muster wiederholt sich: **Was der Ersatz-DOM nicht kennt, kann
keine Reihe prüfen.** Attribute, Zeichenwahl und Farbkontrast gehören dazu. Verlaufspfeile bleiben farbneutral, das App-Symbol
  setzt keine Spitze.
- **Bindung um ihrer selbst willen ist nicht das Ziel.** Kein Serien-Zähler, kein vorgetäuschter
  Fortschritt, keine erfundenen Preisanker. Bewegung, die eine Handlung beantwortet, ist Funktion;
  Bewegung, die beeindrucken soll, ist Dekoration.
- **Was nicht geprüft ist, wird als ungeprüft benannt** — im Produktplan steht zu jeder Runde ein
  ehrlicher Verifikationsstatus.

Die vollständige Begründung jeder Entscheidung steht in `docs/klarsicht-produktplan.md`.

# Eigener HTML/CSS-Renderer

Von Grund auf in Python gebaut, weil in der bisherigen Arbeitsumgebung kein Browser verfügbar war
(kein WebKit/GTK/Qt, kein Root für apt, pypi und npm mit 403) und Gestaltungsfragen sonst nur
hätten geschätzt werden können.

## Benutzung

```bash
python3 go.py landing     # rendert die Startseite in hell und dunkel
python3 go.py result
```

Die vom JavaScript erzeugten Inhalte kommen aus dem echten App-Code: `node run_inject.js` und
`node run_result.js` erzeugen die Zustandsdateien, die `go.py` einsetzt.

## Was er kann

Kaskade mit Spezifität, `var()`, `color-mix()`, `clamp()/min()/calc()/env()`, Vererbung,
Hell/Dunkel über `prefers-color-scheme`, strukturelle Pseudoklassen, Blocklayout mit
Randzusammenfall, Flexbox (Zeile/Spalte, `gap`, `justify-content`, `align-items`, `align-self`,
`flex:1`, `flex-wrap`, Schrumpfen mit `min-width:auto`), Grid mit `repeat()`, absolute
Positionierung, Textumbruch samt weicher Trennstriche und `overflow-wrap:break-word`,
`<details>` offen/zu, SVG-Formen samt Pfadbefehlen und `rotate()`, `box-shadow: inset`.

## Grenzen

- **Ersatzschriften** (DejaVu statt Fraunces/Work Sans/IBM Plex Mono). Die sind breiter als die
  echten — exakte Zeilenumbrüche sind damit nicht beurteilbar, Proportionen und Überläufe schon.
- **Kein JavaScript.** Was zur Laufzeit gesetzt wird, muss über die Zustandsdateien eingespeist
  werden.
- **Keine Pseudoklassen der Interaktion** (`:hover`, `:active`, `:focus-visible`).

## Wichtig

**In einer Umgebung mit echtem Browser ist dieser Renderer überflüssig.** Er bleibt als
Nachschlagewerk liegen; die erste Handlung nach dem Umzug sollte sein, ihn durch einen echten
Browser zu ersetzen. Mehrere Befunde früherer Runden mussten erst gegen den Quelltext gegengeprüft
werden, weil ein ungenauer Renderer Scheinbefunde erzeugt.

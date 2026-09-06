# Lizenzen der mitgelieferten Schriften

Seit Runde 80 stehen die drei Schriften als Daten in `src/styles/00-schriften.css` und damit
in jeder ausgelieferten `dist/lucenta.html`. Alle drei stehen unter der **SIL Open Font
License, Version 1.1**, die das Einbetten und Weitergeben ausdrücklich erlaubt — unter der
Bedingung, dass Urheberrechtsvermerk und Lizenz mitgeliefert werden. Genau dafür ist diese
Datei da.

Der vollständige Lizenztext steht unter <https://openfontlicense.org>.

| Schrift | Verwendung in Lucenta | Urheberrechtsvermerk |
|---|---|---|
| **Fraunces** | Überschriften, Zahlen, Auszeichnung (`--serif`) | Copyright 2020 The Fraunces Project Authors (https://github.com/undercasetype/Fraunces) |
| **Work Sans** | Fließtext und Bedienelemente (`--sans`) | Copyright 2019 The Work Sans Project Authors (https://github.com/weiweihuanghuang/Work-Sans) |
| **IBM Plex Mono** | Kennzeichnungen, Codes, Zahlen in Tabellen (`--mono`) | Copyright 2017 IBM Corp. (https://github.com/IBM/plex) |

Eingebettet ist jeweils nur die Untermenge **latin**, in der Fassung, die Google Fonts zum
Zeitpunkt des Abrufs auslieferte. Japanisch wird nicht von diesen Schriften gesetzt — keine
der drei enthält japanische Zeichen; dort greift die Systemschrift des Geräts.

Zum Erneuern: `npm run schriften`. Das Werkzeug holt die aktuellen Dateien und schreibt
`src/styles/00-schriften.css` neu. Es läuft **nicht** im Bau mit, damit `node build.js` ohne
Netz funktioniert.

---

Der übrige Inhalt von Lucenta ist nicht quelloffen (`"license": "UNLICENSED"` in
`package.json`). Der Fragebogen selbst beruht auf den **IPIP Big-Five Factor Markers**
(Goldberg 1992), die gemeinfrei sind; zum Stand der Übersetzungen siehe `README.md`,
Abschnitt „Offene Punkte".

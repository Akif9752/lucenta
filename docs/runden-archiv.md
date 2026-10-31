# Runden-Tabelle und Pruefstaende (Archiv)

Aus dem Uebergabeblock in `ios-huelle-journal.md` ausgelagert, damit er kurz bleibt.

## Aeltere Runden

| Runde | Commit | Inhalt |
| --- | --- | --- |
| 184 | `5d68b60` | Jahr auf einen Blick (Kalender), Monatsrueckblick (Kalender + Karte auf Heute), Notiz am Eintrag; teilbar als Bild |
| 183 | `635e588` | App-Sperre mit Face ID/Touch ID/Code, frei, Sofort/1/15 Min. (`LucentaSperre.swift`, Plugin `Lock`) |
| 182 | `c1ab038` | Version ohne Big-Five-Zusatz, Freunde-Hinweis weg, Rollenkarten mit Aufklapp-Fusszeile, Freunde im Rollenatlas mit Namen, OCEAN-Text 10,5 px |
| 181 | `9f82b17` | Tagesform-Widget (klein, mittel mit Eintragen, Sperrbildschirm; App Group) und Apple Health (Stimmung als Gemuetszustand, nur schreiben, Vorgabe aus) |
| 180 | `82ab3dd` | Bestand als Datei gespiegelt (`LucentaBestand.swift`), vor dem Start zurueckgeholt, wenn WebKit ihn geleert hat; Uebergabe berichtigt |
| 179 | (dieser) | Kaufquote: Probezeit an jeder Sperre, Angebot unter dem ersten Muster mit echter Zahl, Rueckgewinnung (Kaeufe ausserhalb des Fensters schalten sofort frei) |
| 178 | (dieser) | Nutzungszahlen (Beta) entfernt; „Abo verwalten" nur mit Abo; Version aus der App; Anmeldeschritt geprueft; verwaiste Texte; Store-Bilder neu |
| 177 | (dieser) | Fusszeile unter dem Ergebnis entfernt (IPIP gemeinfrei, keine Nennungspflicht); Abschnitt „Lizenzen" mit Fraunces (OFL), Capacitor (MIT), Apache Cordova (Apache 2.0), IPIP |
| 176 | (dieser) | Impressum nur noch in den Einstellungen; aus dem Kaufablauf nur die Datenschutzerklaerung |
| 175 | (dieser) | Verstehen: Karten zeigen, dass sie aufklappbar sind (Fusszeile „Mehr lesen" + Pfeil wie die Ergebniskarten) |
| 174 | (dieser) | Simulation mit 1000 Personen; Einstellungen wie iOS neu gegliedert; Erinnerungszeit waehlbar |
| 173 | (dieser) | Zweite Simulation umgesetzt: Muster-Versprechen ehrlich, Bewertungsbitte, Kaufangebot nach dem Scrollen, 5 freie Hintergruende, Kurzportraet ganz |
| 172 | (dieser) | Tiere artgerechter (Brauen nur angedeutet, kleinere Lichtpunkte, Fuchs-Ohrspitzen, Hasen-Augenring); 4 Hintergruende: Lavendel, Wolken, Sternschnuppe, Art déco |
| 171 | (dieser) | Figur & Hintergrund als je eine Karte mit Gruppenzeilen; 6 neue Hintergruende (Lucenta+); Licht fuer alle Tiere, Fuchs/Dackel/Schildkroete/Wal nachgearbeitet |
| 170 | (dieser) | Flackern beim Seitenwechsel (zwei Ursachen, im Simulator gemessen, `tools/flackern/`); Typ-Text unter die Werte; „Im Alltag" ganz Lucenta+ |
| 169 | (dieser) | pruef-alles 9/9 nachgefahren; Datenschutz-Seite als Werkzeug (`npm run datenschutz-seite` -> `web/datenschutz/`), App auf dem iPhone 15 Pro |
| 168 | (dieser) | 7 Tage Probezeit am Jahresabo (nur wenn der Store sie meldet), erstes Tagesform-Muster frei ab Tag 7, Altersgrenze 16+ |
| 167 | (dieser) | Aus der Test-Simulation: Erinnerung einmal am Tag (Dreierregel als Zusatzschalter), Tagesform vor Verlauf auf der Kaufseite, Halbzeit-Vorgeschmack, Store-Bilder mit Ueberschrift |
| 166 | (dieser) | Vergleich: Ring mit %, Name statt „Andere Person“; Freundescode im Wiederherstellungsfeld abgefangen; Flamingo neu (Brustbild), Rotkehlchen, Pinguin; Store-Bilder neu |
| 165 | (dieser) | Warntexte gekuerzt: „kein klinisches Instrument" nur noch in der Hilfe, Datenschutz-Beteuerungen aus Ergebnis, Lucenta+, Freunde, Onboarding, Ueber |
| 164 | `a43aa52` | Mops, Siamkatze; Tagesform und Verstehen mit Reitern; Fehlersuche je Reiter |
| 163 | `0e70ed7` | Figur & Hintergrund als Unterseite, Abstaende (tools/abstaende.mjs), Wort ueber dem Kreis, Vogelfuesse |
| 162 | `8b50639` | Verstehen nach Lebensbereichen: 40 neue Karten in acht Sprachen, Inhaltsuebersicht |
| 161 | `a48a012` | Archetypen als persoenlicher Rollenatlas; Kalender mit Tagesdetails und Monatsueberblick; Muster nach Tageszeit und beste/schwere Tage |
| 160 | `642e7bb` | Hintergruende in Gruppen + Lucenta+, vier neue; Delfin, Seeotter, Pinguin, Papagei, Flamingo, Rotkehlchen; Tiere in Gruppen |
| 159 | `33bfc86` | Anmeldeschritt im Onboarding (ueberspringbar), Freundescode <id>-XXXX-XXXX mit eigener Benutzer-ID |
| 158 | `1db786c` | Richtlinien-Pruefung + EULA-Links, Lucenta+ vor Einstellungen, Funken einfarbig leuchtend, Zeilenabstand |
| 157 | `e530d99` | Feedback B10–B12, C13, C15–C18: Ich-Form, Skala mit Enden, Ergebnisseite Radar zuerst, Texte, Exportangabe |
| 156 | `d25ad40` | Ueberpruefung: Rundgang im Simulator, veraltete Archiv-Texte, Hinweis-Texte, Toast fuer VoiceOver |
| 155 | `4e63250` | Fehler „‹ Start" (Klassenname-Kollision); Freunde als einziger Ort (ein Feld, Vergleich `view-compare`, Archiv uebernommen); WebKit-Absturz im Balkenpuls behoben |
| 154 | `cf6466c` | Feedback B9: Navigation wie iOS (Chevron mit Ziel, kleiner Titel beim Scrollen, Pillen verborgen) |
| 153 | `fe25cbe` | Feedback B8: Dynamic Type bis 200 % (`--dt` aus der Huelle, `data-text="gross"`, Fehlersuche `320px@200%`) |
| 152 | `f1ff0e0` | Feedback A1 (Sperre nach Antwort 50), A3 (`PrivacyInfo.xcprivacy`), A4 (Konto loeschen), A5 (ehrliche Versprechen, 8 Sprachen + Store), B6 (nur noch Freundescode; Wiederherstellungscode in Einstellungen), B7 (Einladung als Universal Link, scharf erst mit Domain) |
| 151 | `41c2e29` | Feedbackrunde A bis Z: 19 Befunde in `docs/feedbackrunde-151.md` (5 kritisch: Doppelspeichern auf Frage 50, Impressum leer, Privacy Manifest, Konto loeschen, widerspruechliche Versprechen) |
| 150 | `428acb7` | Freundescode (`L1.<code>.<figur>.<name>`): Name und Figur kommen von der Person selbst; Beispiel-Freunde; Lucenta+ als eigene Seite (`view-plus`); „Abo verwalten“ als StoreKit-Blatt |
| 149 | `1728f4c` | Dunkel als Vorgabe; Hellmodus gedaempft (#E6E5E0/#F3F2EE, Schrift nachgedunkelt); Mit Apple anmelden + private iCloud (`LucentaKontoPlugin.swift`, `26-konto.js`) |
| 148 | `a09baf0` | Freunde: „Als Freund speichern“ im Vergleich, Rangliste nach Naehe, Gruppen-Radar (Lucenta+); Onboarding im Simulator geprueft; Start ueberlebt Fehler im Onboarding |
| 147 | `de12cb7` | Freunde (`06-freunde.js`, `view-freunde`), Lucenta+ in der Seitenleiste, Verlauf im Profil kurz + Unterseite `view-verlauf`, Onboarding beim ersten Oeffnen (`25-onboarding.js`) |
| 146 | `fbba58a` | Nach dem echten Tier: Waldkauz dunkle Augen, Reh ohne weisse Brauen, gewoehnlicher (laenglicher) Goldfisch, Buckelwal schiefergrau, Retriever erwachsen, Fuchs schmaler, Dackel seidig, Katze flacheres Unterlid |
| 145 | `b92ea2b` | Panda und Hase echt proportioniert; Ohren und Flossen durchscheinend (`duenne`, Shader `durchschein…`); feinere Iris; nasse Haut (`Koerper.lack`); Goldfisch mit Dachziegel-Schuppen |
| 144 | `571179b` | Echte Kopfproportionen bei Fuchs, Reh, Baer (lange Schnauzen, kleinere Hirnschale); weisses Fell bleibt weiss |
| 143 | `153affe` | Fotorealistisch, aber liebenswert: keine Wangenroete, kleinere Augen mit dunklem Lidrand, echte Pupillenformen, Nasen mit Nasenloechern, weicheres Licht, Rendern in 2048 px; Retriever mit Schlappohren, Katze fein getigert. Kaltstart gemessen (siehe Eintrag) |
| 142 | `9b90074` | Wal und Schildkroete: zum Betrachter gedreht, Augen weiter vorn, naeher zugeschnitten (`NAEHER` in `figuren_holen.py`) |
| 141 | `f73cced` | Alle Tiere sehen in die Kamera (kein Blickversatz mehr); Wal als Buckelwal, Schildkroete als Suppenschildkroete, Dackel glattes Kurzhaar ohne Zunge |
| 140 | `d24b541` | Schalenfell je Tier (`Fell`, `FellKarte`, Shader in `Szene.swift`) und Brauen als Wulst + Fellzeichnung (`mitBrauen`) |
| 139 | `09693fa` | Tiere: je eigene Kopfhaltung (7 links, 5 rechts, teils geneigt), artgerechte Muender als Hautfalten (`mitMaul`), Zaehne/Zungen als `perle` |
| 138 | `a07e240` | Schneller arbeiten: audit-i18n 4 Min. -> 1 s; Kommentare in src/ um ~30 % gekuerzt (gebaute App unveraendert) |
| 137 | `ae62acb` | Preise aus StoreKit (`preise()`), Zurueck-Wischgeste vom linken Rand, Eulen-Zwinkern lesbar, Panda weicher, keine Trennung in der Angebotskarte |
| 136 | `4d8552f` | Verstehen ganz Lucenta+; Vergleiche frei mit 2 Personen, Archiv frei bis 2; Sprache als Unterseite (`view-sprache`); Unterseiten schieben sich wie iOS (Push/Pop) |
| 135 | `e755c72` | Suesser Blick: Lider, Blick zum Betrachter, groessere Augen und Lichtpunkte, Wangenroete; je Tier ein eigener `Ausdruck` |
| 134 | `ef36e7a` | Tierkoerper statt Menschenoberkoerper: `vierbeiner(Bau(...))` — schmale tiefe Brust, Vorderbeine, Ruecken nach hinten; je Art eigene Masse und Zeichnung |
| 133 | `9bad4bd` | Tiere mit Oberkoerper: fester Zuschnittrahmen (`rahmen.json`), Bild randlos im Kreis, Kopf deckungsgleich mit Runde 132 |
| 132 | `7457d8f` | Funkeln statt Konfetti: vierzackige Sterne + Lichtpunkte, schweben statt zu fallen (`funkelStoss`, `.funkeln`) |
| 131 | `f2938a4` | Startseiten-Titel wieder Fraunces; Name im Startbild in `--marke`; Symbol #5CB4AD; Hilfe als eigene Seite (`view-hilfe`); Beispieldaten 14/30/90/120; Verlauf „Gesamt"; Erinnerungen 9/14/20 + Nacherinnerung 11/16/22, Tageszeiten bis 12/18; Erfassung klappt nach dem Eintrag zu |
| 130 | `370d20c` | Tagesform: drei Tageszeiten, je ein Eintrag (ersetzen); Erinnerungen einzeln geplant; groessere Animationen (Ergebnis-Enthuellung, Haken, Startkarten, Fragebogen, Tier wippt); weiche Vorschau-Raender; Legende des Graphen mit fester Hoehe |
| 129 | `9af69cb` | Plex Mono aus dem Bau; Fusszeilen-Link = Einstellungszeile; „12‑mal"; Datumsachse gleichmaessig (`VERLAUF_RAND`) |
| 128 | `8363244` | Strengere Bezahlgrenze, verschwommene Vorschauen (`vorschauHTML`), Angebot nach dem Test, Startseiten-Karte, Strahlenkranz am Ergebnistyp |
| 127 | `0abb566` | Tagesform-Liste aufklappbar; Lucenta+ als Kaufseite mit Preiskarten |
| 126 | `4e69bcb` | Kein Zoom in der App, Haptik bei jedem Tipp, SF ueberall, Rechtliches als leise Zeile |
| 125 | `5645f4a` | Eigene 3D-Tiere (SceneKit, `tools/figuren_rendern/`) |
| 124 | `7f29388` | Tagesform neu: fuenf Big-Five-Fragen, Stichworte, Bandbreite, Kalender, Muster |
| 121–123 | … | Liquid Glass, Startbewegung, Verlaufskurve nach Apple Health, Avatare als Bilder |

## Pruefstaende nach jeder Runde

**Nach Runde 198: ALLE 9 BESTANDEN**.

**Nach Runde 197: ALLE 9 BESTANDEN**.

**Nach Runde 196: ALLE 9 BESTANDEN**.

**Nach Runde 195: ALLE 9 BESTANDEN**.

**Nach Runde 194: ALLE 9 BESTANDEN**.

**Nach Runde 193: ALLE 9 BESTANDEN**.

**Nach Runde 192: ALLE 9 BESTANDEN**.

**Nach Runde 191: ALLE 9 BESTANDEN**: `pruef-nativ` 139, `fehlersuche` ohne Fund.

**Nach Runde 190: ALLE 9 BESTANDEN**: `pruef-nativ` 139, `fehlersuche` ohne Fund.

**Nach Runde 189: ALLE 9 BESTANDEN**: `pruef-nativ` 139, `fehlersuche` ohne Fund.

**Nach Runde 188: ALLE 9 BESTANDEN**: `pruef-nativ` 139, `fehlersuche` ohne Fund.

**Nach Runde 187: 9 von 9**: `pruef-nativ` 137; `fehlersuche` meldete im vollen Lauf 4x „6 statt 5 Vorteile" (die Pruefung zaehlte fest
fuenf, der sechste ist die Facetten-Zeile) — Erwartung auf 6 gesetzt, die betroffene Konfiguration auf WebKit und Chromium
nachgefahren: ohne Fund.

**Nach Runde 186: ALLE 9 BESTANDEN**: `pruef-nativ` 132, `fehlersuche` ohne Fund.

**Nach Runde 185: ALLE 9 BESTANDEN**: `pruef-nativ` 132.

**Nach Runde 184: ALLE 9 BESTANDEN**: `pruef-nativ` 131, `fehlersuche` ohne Fund.

**Nach Runde 183: ALLE 9 BESTANDEN**: `pruef-nativ` 126, `fehlersuche` ohne Fund.

**Nach Runde 182: 9 von 9** (pruef-nativ nach Anpassung der Versionspruefung einzeln nachgefahren, 120).

**Nach Runde 181: ALLE 9 BESTANDEN**: `pruef-nativ` 120, `fehlersuche` ohne Fund, sonst wie nach 178.

**Nach Runde 180: ALLE 9 BESTANDEN**: `pruef-nativ` 106, sonst wie nach 178.

**Nach Runde 179: ALLE 9 BESTANDEN**: `pruef-nativ` 102, sonst wie nach 178.

**Nach Runde 178: ALLE 9 BESTANDEN**: `tests` 10 Reihen, `pruef-nativ` 99, sonst wie nach 174.

**Nach Runde 177: ALLE 9 BESTANDEN**, Zahlen wie nach 174.

**Nach Runde 176: ALLE 9 BESTANDEN**, Zahlen wie nach 174.

**Nach Runde 175: ALLE 9 BESTANDEN**, Zahlen wie nach 174.

**Nach Runde 174: ALLE 9 BESTANDEN** (fehlersuche nach Korrektur der Pruefung erneut, 28 ohne Fund), `pruef-nativ` 96.

**Nach Runde 173: ALLE 9 BESTANDEN**, `pruef-nativ` 93, sonst wie nach 169.

**Nach Runde 172: ALLE 9 BESTANDEN**, Zahlen wie nach 169.

**Nach Runde 171: ALLE 9 BESTANDEN**, Zahlen wie nach 169 (20 Tierbilder, 431,5 KB).

**Nach Runde 170: ALLE 9 BESTANDEN** (14 Min.), Zahlen wie nach 169; `tools/flackern/messen.sh` zweimal 0.

**Nach Runde 169: ALLE 9 BESTANDEN** (nachgefahren fuer den Stand von Runde 168): `pruef-nativ` 89, `fehlersuche` ohne Fund.

**Nach Runde 167: ALLE 9 BESTANDEN** (14,2 Min.), `pruef-nativ` jetzt 83, sonst wie nach 164.

**Nach Runde 166: ALLE 9 BESTANDEN** (14,2 Min.), Zahlen wie nach 164.

**Nach Runde 165: ALLE 9 BESTANDEN** (14,2 Min.), Zahlen wie nach 164, `fehlersuche` 28 Durchlaeufe ohne Fund.

**Nach Runde 164: ALLE 9 BESTANDEN** (14,3 Min.): `tests` 11 Reihen, `pruef-store` 32, `pruef-app` 36
(erwartet 20 Tierbilder), `pruef-nativ` 77, `pruef-bewegung` (klickt den Reiter „Verlauf"), `diff-sprachen`
107 (Bericht), `fehlersuche` 28 Durchlaeufe WebKit + Chromium ohne Fund.

Aeltere Staende — `npm run pruef-alles` nach Runde 152: siehe Eintrag Runde 152 (pruef-app 32 mit „vier Nachtipps auf
Frage 50 = EIN Ergebnis", pruef-nativ 74 mit Einladungslink und Konto loeschen).
Nach Runde 150: **ALLE 9 BESTANDEN** (~9–11 Minuten). `tests` 11 Reihen
(`share_test` erwartet jetzt #E6E5E0), `pruef-store` 32, `pruef-app` 31, `pruef-nativ` 65 (erwartet
die dunkle Vorgabe), `pruef-bewegung` bestanden (laeuft seit Runde 149 ausdruecklich HELL — die
Flaechenpruefung des stehenden Hintergrunds setzt den Lichtstrahl voraus), `diff-sprachen` 92 (Bericht),
`fehlersuche` 26 Durchlaeufe ohne Fund. Runde 151 hat nichts an `src/` geaendert.


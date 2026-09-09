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
    dist/lucenta.html
      |  npx cap sync ios
    ios/App/public/lucenta.html

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
von 320 bis 430 Punkten und einen Bau, der bei vier Verstoessen abbricht. Vor jedem Commit,
der `src/` beruehrt:

    node build.js
    node tests/run.js              # 11 Reihen
    python3 tools/audit_i18n.py    # 8 statische Pruefungen ueber alle 8 Sprachen
    npm run diff-sprachen
    npm run pruef-bewegung
    npm run pruef-nativ            # 27 Pruefungen, stellt Capacitor im Browser nach
    npm run fehlersuche            # 13 Browserkonfigurationen, misst Kontrast im echten Browser
    npm run pruef-store            # Zeichenzahlen der Store-Texte

Die letzten vier brauchen Playwright und einen lokalen Server auf Port 8017
(`cd dist && python3 -m http.server 8017 --bind 127.0.0.1`). Fehlt Playwright:
`npm i -D playwright && npx playwright install chromium`. Laesst sich eine Pruefung auf diesem
Rechner nicht ausfuehren, gehoert das ins Journal — nicht stillschweigend uebersprungen.

Und ein Vorteil, den nur diese Sitzung hat: **Sie kann auf WebKit messen.** Die Browsersitzung
hat ausschliesslich Chromium; der Download von WebKit ist dort gesperrt. Zwei der bisher
teuersten Fehler (die Silbentrennung, die im Chromium unsichtbar blieb, und die beiden
Scroll-/Safe-Area-Fehler) waren genau deshalb 99 Runden lang unentdeckt. Wo es um Aussehen
geht, ist das Geraet hier der Schiedsrichter.

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
Ebenen ueber diesem Ordner): die gemeinsame IIFE, die drei Farbbloecke, die vier
Abbruchpruefungen des Baus, und zwei Lehren, die je dreimal bezahlt wurden. Lies sie zuerst —
sie erklaeren, warum der Bau abbricht, bevor du raetst.

## Was als Naechstes ansteht

1. **`NSPhotoLibraryAddUsageDescription` in `Info.plist`.** Ohne den Eintrag stuerzt die App
   beim ersten Antippen von "In Fotos sichern" ab, statt zu fragen. Das ist der
   wahrscheinlichste erste Stolperstein.
   Fuer lokale Mitteilungen ist **kein** Info.plist-Eintrag noetig — nur die
   Laufzeit-Abfrage, die der Code in `src/js/19b-native.js` bereits stellt.
2. **Symbole aus `assets/icon/`** in den Asset-Katalog. Die 1024er ohne Alphakanal
   (`lucenta-icon-1024.png`); Apple weist PNG mit Transparenz zurueck.
3. **Ausrichtung auf Hochformat**, `UIRequiresFullScreen` nicht setzen.
4. **Auf einem echten iPhone laufen lassen**, nicht nur im Simulator. Eine freie Apple-ID
   genuegt dafuer (7-Tage-Signatur); der bezahlte Account wird erst fuer TestFlight,
   App Store Connect und die Abo-Produkte gebraucht.

## Die StoreKit-Bruecke — der eigentliche Auftrag hier

In `src/js/19b-native.js` ruft die App ein Capacitor-Modul namens `StoreKit` auf. **Dieses
Modul gibt es nicht.** Der Name ist ein Platzhalter: Fuer `LocalNotifications`, `Filesystem`
und `App` existieren offizielle Module, die genau so heissen; fuer Kaeufe gibt es keins von
Apple oder Ionic.

Zu bauen ist ein kleines Capacitor-Plugin in Swift, das sich unter diesem Namen anmeldet und
zwei Aufrufe bedient:

- `restorePurchases()` -> `{ aktiv: Bool }`
- der Kauf selbst, fuer die Produkte `lucenta.plus.monat` (4,99 EUR) und
  `lucenta.plus.jahr` (29,99 EUR), in derselben Abo-Gruppe

**Zwei Stellen schalten die bezahlte Fassung heute ohne Zahlung frei** und muessen vor der
Einreichung durch die echte Kaufpruefung ersetzt werden:

- `plusSchalter` in `src/js/15-profile.js`
- `btnPlusAktivieren` in `src/js/21-beta-rueckmeldung.js`

Eine allein uebersehen heisst: Die App verschenkt das Abo. Beide liegen in `src/` und sind
seit Runde 102 **hier** zu erledigen, zusammen mit der Swift-Seite — das ist der Punkt, an dem
die frueher getrennten Haelften ohnehin zusammengehoeren. Ebenfalls dort: die gewaehlte
Laufzeit (`lucenta_laufzeit`) ist heute nur eine Notiz und muss zur Produktkennung des
gekauften Abos werden.

## Was die App verspricht und der Code halten muss

Lucenta sendet nichts. Kein Server, kein Konto, keine Werbung, kein Tracking, kein Fremdabruf;
die Schriften liegen als Daten in der Datei. Die Store-Angabe lautet entsprechend
"Data Not Collected". `capacitor.config.json` setzt dazu passend
`limitsNavigationsToAppBoundDomains: true`.

Was auch immer hier hinzukommt: Sobald irgendetwas nach aussen geht — ein Absturzberichts-
dienst, eine Statistik, eine Schriftart von einem CDN —, ist diese Angabe falsch, und aus
einer Formalie wird ein Problem. Im Zweifel nachfragen, nicht einbauen.

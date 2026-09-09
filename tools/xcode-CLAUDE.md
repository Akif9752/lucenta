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

## Was hier zu tun ist und was nicht

Diese Huelle ist der iOS-Teil. **Zustaendig hier:** Xcode-Einstellungen, `Info.plist`,
Signierung, Symbole im Asset-Katalog, Schemata, alles in Swift — und vor allem die
StoreKit-Bruecke (siehe unten).

**Nicht hier:** Alles an der App selbst. Oberflaeche, Texte, Sprachen, Farben, Logik liegen in
`src/` und werden nicht von der Xcode-Seite geaendert. Am Projekt arbeiten zwei Sitzungen
parallel; wer hier in `src/` schreibt, erzeugt Konflikte in einer 1,5-MB-Datei, die niemand
von Hand aufloest. Auffaelligkeiten an der App gehoeren gemeldet, nicht behoben.

Die vollstaendigen Regeln des Projekts stehen in der `CLAUDE.md` im Wurzelverzeichnis
(zwei Ebenen ueber diesem Ordner) — Bauregeln, die acht Pruefbefehle, die Fallen. Lies sie,
bevor du etwas ausserhalb von `ios/` anfasst.

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

Eine allein uebersehen heisst: Die App verschenkt das Abo. Beide Aenderungen liegen in `src/`,
gehoeren also **nicht** hierher, sondern in die andere Sitzung — hier entsteht nur die
Swift-Seite.

## Was die App verspricht und der Code halten muss

Lucenta sendet nichts. Kein Server, kein Konto, keine Werbung, kein Tracking, kein Fremdabruf;
die Schriften liegen als Daten in der Datei. Die Store-Angabe lautet entsprechend
"Data Not Collected". `capacitor.config.json` setzt dazu passend
`limitsNavigationsToAppBoundDomains: true`.

Was auch immer hier hinzukommt: Sobald irgendetwas nach aussen geht — ein Absturzberichts-
dienst, eine Statistik, eine Schriftart von einem CDN —, ist diese Angabe falsch, und aus
einer Formalie wird ein Problem. Im Zweifel nachfragen, nicht einbauen.

# Lucenta — die iOS-Huelle (Anweisungen fuer die Xcode-Sitzung)

Vorlage: `tools/xcode-CLAUDE.md`. `npm run ios:claude` (Teil von `ios:sync`) kopiert sie nach
`ios/App/CLAUDE.md`, weil Xcode die Anweisungen neben der `.xcodeproj` sucht. Nur die Vorlage aendern.
Die Regeln des ganzen Projekts stehen in der `CLAUDE.md` im Wurzelverzeichnis; der Stand der Arbeit im
Uebergabeblock oben in `docs/ios-huelle-journal.md`.

## Drei Kopien, eine echt

    src/                  <- nur hier aendern
      | node build.js
    dist/                 index.html (App-Fassung) + lucenta.html (Ein-Datei-Fassung)
      | npx cap sync ios
    ios/App/App/public/   erzeugt, jede Aenderung dort ist beim naechsten Sync weg

## Umfang

Diese Sitzung fuehrt und darf alles aendern (`ios/`, `src/`, `docs/`, `tools/`, `tests/`) — Entscheidung
des Inhabers. Die Browsersitzung arbeitet nur auf Anfrage. Mit der Fuehrung liegt hier die Pruefpflicht.

## Die drei Befehle einer Runde

    npm run pruef-schnell     # Zwischenstand, < 1 Min.
    npm run pruef-alles       # vor jedem Commit; waehlt selbst (s. u.)
    npm run installieren      # ios:sync + Simulator + iPhone; `-- sim` / `-- iphone` / `-- --ohne-sync`

`pruef-alles` waehlt nach Aenderung (Entscheidung des Inhabers): Seit dem letzten vollen, bestandenen
Lauf nur Tierbilder, Doku, Swift oder Hilfswerkzeuge geaendert -> leichte Runde (Bau, Testreihen, Audit,
Store-Texte, App-Fassung, ~1 Min.). Sonst alle neun. `npm run pruef-voll` erzwingt alle.
Die volle Runde losgeloest starten und EINMAL am Ende nachsehen, nicht pollen:

    (nohup npm run pruef-alles > /tmp/pruef.log 2>&1 &)
    # spaeter einmal: tail -20 /tmp/pruef.log

Ausgaben je Pruefung in `.pruef-log/<name>.log`. Einzeln nachfahren: Befehle in `tools/pruef_alles.mjs`;
einen Fund der Fehlersuche mit
`LUCENTA_MOTOREN=webkit LUCENTA_PARALLEL=1 LUCENTA_NUR="320px/hell/tr" npm run fehlersuche`.
Laesst sich eine Pruefung nicht ausfuehren, gehoert das ins Journal.

`pruef-app` prueft `dist/index.html`, die Fassung im App-Bundle: ohne Kommentare, nur Deutsch
eingebettet (die uebrigen Sprachen in `dist/sprachen/`). Was in `lucenta.html` steht, muss dort nicht
stehen — Pruefungen fragen den Weg ab, nicht den Quelltext.

## Kontingent sparen

Jede Zwischenabfrage verarbeitet den ganzen Verlauf erneut. Deshalb: Pruefungen buendeln, nicht pollen;
Bildschirmfotos sparsam, beschnitten, verkleinert (`sips -Z 560`). „Laeuft die App?" beantwortet
`xcrun simctl spawn <id> launchctl list | grep lucenta` ohne Bild. Wo es um Aussehen geht, ist das Geraet
(WebKit) der Schiedsrichter, nicht Chromium.

## Kommentare und Journal

Kommentare: kurz, nur das Warum (Falle, Abhaengigkeit, „Entscheidung des Inhabers"), hoechstens drei
Zeilen, keine Rundengeschichte. Marke `// ---------- wiring ----------` in `src/js/27-verdrahtung.js` nie
aendern (`tests/run.js` schneidet dort). `src/styles/00-schriften.css` ist erzeugt.

Jede Runde ins Journal `docs/ios-huelle-journal.md`, neueste oben: Fehler, Aenderung, warum, was unsicher
blieb. Es ist der Bericht an den Inhaber.

`pruefeTransparenzTueren`: WebKit kennt `prefers-reduced-transparency` nicht, `MainViewController.swift`
setzt `data-transparenz="reduziert"`. Jede Regel dafuer steht zweimal im Stilblatt; der Bau bricht ab,
wenn nur eine geaendert wird.

## Stand der Huelle

- `Info.plist`: `NSPhotoLibraryAddUsageDescription` (sonst Absturz bei „In Fotos sichern"); nur Hochformat,
  nur iPhone (`TARGETED_DEVICE_FAMILY = 1`, Entscheidung des Inhabers); `UIRequiredDeviceCapabilities` arm64.
  Nachpruefen am gebauten Bundle (`plutil -extract … <App.app>/Info.plist`).
- Symbol `AppIcon-512@2x.png` ohne Alphakanal; `assets/icon/lucenta-icon-1024-gerundet.png` hat einen und
  darf nicht in den Asset-Katalog.
- Deployment Target 15.0; in Xcode „Update to recommended settings" NICHT annehmen.

## Die Kauf-Bruecke

`ios/App/App/LucentaKaeufePlugin.swift`, StoreKit 2, nach aussen `StoreKit` (die Klasse heisst anders,
Namenskonflikt). Aufrufe `stand`, `kaufen`, `restorePurchases`, `preise`, `verwalten`, `bewerten`.
Produkte `lucenta.plus.monat` / `lucenta.plus.jahr`, eine Abo-Gruppe; die Liste steht absichtlich in Swift
UND in `src/js/24-native.js`.

1. Plugins in `MainViewController.capacitorDidLoad()` anmelden (`registerPluginInstance`), nie in
   `packageClassList` — `capacitor.config.json` ist erzeugt.
2. Lucenta+ wird nur bei klarer Store-Antwort weggenommen; eine Stoerung nimmt nichts weg.
3. Kein Beleg-Server, nie — sonst ist „Data Not Collected" falsch.
4. Plus-Umschalter nur ohne native Bruecke (Entwickeln im Browser).

Ohne Store geprueft durch `pruef-nativ`; lokal echt mit `ios/App/App/Lucenta.storekit` (Schema `App`).

## Was die App verspricht

Lucenta sendet nichts: kein Server, kein Konto bei uns, keine Werbung, kein Tracking, kein Fremdabruf.
Einzige Ausnahme (Entscheidung des Inhabers): freiwillig „Mit Apple anmelden", Bestand Ende-zu-Ende
verschluesselt in der privaten iCloud der Person (`LucentaKontoPlugin.swift`). Auf dem Geraet bleiben
Spiegel (`LucentaBestand.swift`), Widget (`LucentaWidgetBruecke.swift`), Health nur schreibend
(`LucentaGesundheitPlugin.swift`). Kommt irgendetwas hinzu, das sendet (Absturzbericht, Statistik, CDN),
ist die Store-Angabe falsch — im Zweifel fragen, nicht einbauen.

**Nur der Inhaber:** echtes iPhone mit bezahltem Account, Abo-Produkte in App Store Connect.

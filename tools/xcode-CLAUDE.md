# Lucenta — die iOS-Huelle (Anweisungen fuer die Xcode-Sitzung)

Vorlage: `tools/xcode-CLAUDE.md`. `npm run ios:claude` (Teil von `ios:sync`) kopiert sie nach
`ios/App/CLAUDE.md`, weil Xcode die Anweisungen neben der `.xcodeproj` sucht. Nur die Vorlage aendern.
Die Regeln des ganzen Projekts stehen in der `CLAUDE.md` im Wurzelverzeichnis; der Stand der Arbeit im
Uebergabeblock oben in `docs/ios-huelle-journal.md`.

## Drei Kopien, eine echt

    src/                  <- nur hier aendern
      | node build.js
    dist/                 index.html + Schriften, Sprachen, Tierbilder (die einzige Fassung)
      | npx cap sync ios
    ios/App/App/public/   erzeugt, jede Aenderung dort ist beim naechsten Sync weg

## Umfang

Diese Sitzung fuehrt und darf alles aendern (`ios/`, `src/`, `docs/`, `tools/`, `tests/`) — Entscheidung
des Inhabers. Es gibt nur diese Sitzung und keine Browser-Fassung der App. Hier liegt die Pruefpflicht.

## Die Befehle einer Runde

    npm run pruef-schnell     # Zwischenstand, < 1 Min.
    npm run pruef-alles       # vor jedem Commit; waehlt selbst (s. u.)
    npm run installieren      # ios:sync + Simulator + iPhone; `-- sim` / `-- iphone` / `-- --ohne-sync`
    npm run runde -- <nr> "<Tabellenzeile>" /tmp/commit.txt
                              # nach Journal-Eintrag: Tabelle + Stand-Marken, Commit, Push, Installation;
                              # bricht ab, wenn seit der letzten bestandenen Pruefung mehr als Doku geaendert ist

Tierbilder aus dem Generator des Inhabers (seit Runde 212): `vorlagen/generiert/<kennung>-{ruhig,muede,froh}.png` →
`python3 tools/figuren_bilder_holen.py` (Prompts: `docs/tierbilder-prompts.md`). Eigene 3D-Tiere: `sh tools/figuren_rendern/vorschau_neu.sh <tier>`, am Ende `alle_ausdruecke.sh <tier> …` (drei Ausdruecke
gleichzeitig, ~26 s je Tier). `bauen.sh` uebersetzt nur, wenn eine `.swift`-Datei neuer ist als das Programm.

`pruef-alles` waehlt nach Aenderung (Entscheidung des Inhabers): Seit dem letzten vollen, bestandenen
Lauf nur Tierbilder, Doku, Swift oder Hilfswerkzeuge geaendert -> leichte Runde (Bau, Testreihen, Audit,
Store-Texte, App-Fassung, ~1 Min.). Sonst alle neun, alle in WebKit auf `dist/index.html` mit nachgestellter Bruecke
(`tools/app_bruecke.mjs`, Reiter als `#tabStart` … `#tabProfil`). `npm run pruef-voll` erzwingt alle neun.
Die volle Runde losgeloest starten und EINMAL am Ende nachsehen, nicht pollen:

    (nohup npm run pruef-alles > /tmp/pruef.log 2>&1 &)
    # spaeter einmal: tail -20 /tmp/pruef.log

Ausgaben je Pruefung in `.pruef-log/<name>.log`. Einzeln nachfahren: Befehle in `tools/pruef_alles.mjs`;
einen Fund der Fehlersuche mit
`LUCENTA_PARALLEL=1 LUCENTA_NUR="320px/hell/tr" npm run fehlersuche`.
Laesst sich eine Pruefung nicht ausfuehren, gehoert das ins Journal.

`dist/index.html` ist ohne Kommentare und traegt nur Deutsch (die uebrigen Sprachen in `dist/sprachen/`):
Pruefungen fragen den Weg ab, nicht den Quelltext. Testreihen und Audit lesen den Quelltext aus `src/`.

## Kontingent sparen

Jede Zwischenabfrage verarbeitet den ganzen Verlauf erneut. Deshalb: Pruefungen buendeln, nicht pollen;
Bildschirmfotos sparsam, beschnitten, verkleinert (`sips -Z 560`). „Laeuft die App?" beantwortet
`xcrun simctl spawn <id> launchctl list | grep lucenta` ohne Bild. Wo es um Aussehen geht, ist das Geraet
der Schiedsrichter; nativ Gezeichnetes (Tab-Leiste, Sperre) sieht headless WebKit nicht.

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

- Tab-Leiste = Apples UITabBar (`LucentaTabLeistePlugin.swift`, Plugin `Tabs`); die Seite zeichnet keine eigene.

- `Info.plist`: `NSPhotoLibraryAddUsageDescription` (sonst Absturz bei „In Fotos sichern"); nur Hochformat,
  nur iPhone (`TARGETED_DEVICE_FAMILY = 1`, Entscheidung des Inhabers); `UIRequiredDeviceCapabilities` arm64.
  Nachpruefen am gebauten Bundle (`plutil -extract … <App.app>/Info.plist`).
- Symbol `AppIcon-512@2x.png` ohne Alphakanal; `assets/icon/lucenta-icon-1024-gerundet.png` hat einen und
  darf nicht in den Asset-Katalog.
- Deployment Target 16.4 (seit Runde 213, Entscheidung des Inhabers: color-mix und @property brauchen 16.2/16.4); das Widget 17.0.
  In Xcode „Update to recommended settings" NICHT annehmen.

## Die Kauf-Bruecke

`ios/App/App/LucentaKaeufePlugin.swift`, StoreKit 2, nach aussen `StoreKit` (die Klasse heisst anders,
Namenskonflikt). Aufrufe `stand`, `kaufen`, `restorePurchases`, `preise`, `verwalten`, `bewerten`.
Produkte `lucenta.plus.monat` / `lucenta.plus.jahr`, eine Abo-Gruppe; die Liste steht absichtlich in Swift
UND in `src/js/24-native.js`.

1. Plugins in `MainViewController.capacitorDidLoad()` anmelden (`registerPluginInstance`), nie in
   `packageClassList` — `capacitor.config.json` ist erzeugt.
2. Lucenta+ wird nur bei klarer Store-Antwort weggenommen; eine Stoerung nimmt nichts weg.
3. Kein Beleg-Server, nie — sonst ist „Data Not Collected" falsch.
4. Plus-Umschalter nur im Entwicklungsbau (`#if DEBUG`, `entwicklungsBau()`).

Ohne Store geprueft durch `pruef-nativ`; lokal echt mit `ios/App/App/Lucenta.storekit` (Schema `App`).

## Was die App verspricht

Lucenta sendet nichts: kein Server, kein Konto bei uns, keine Werbung, kein Tracking, kein Fremdabruf.
Einzige Ausnahme (Entscheidung des Inhabers): freiwillig „Mit Apple anmelden", Bestand Ende-zu-Ende
verschluesselt in der privaten iCloud der Person (`LucentaKontoPlugin.swift`). Auf dem Geraet bleiben
Spiegel (`LucentaBestand.swift`), Widget (`LucentaWidgetBruecke.swift`), Health nur schreibend
(`LucentaGesundheitPlugin.swift`). Kommt irgendetwas hinzu, das sendet (Absturzbericht, Statistik, CDN),
ist die Store-Angabe falsch — im Zweifel fragen, nicht einbauen.

**Nur der Inhaber:** echtes iPhone mit bezahltem Account, Abo-Produkte in App Store Connect.

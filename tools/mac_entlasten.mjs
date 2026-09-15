// Nimmt Spotlight die Entwicklungsordner ab. `npm run mac:entlasten`
//
// Runde 102, gemeldet vom Mac: "der simulator haengt, mein gesamter mac haengt auch."
//
// Gemessen statt geraten: Die Spitzenlast kam von `corespotlightd` (92 %), `mds_stores` (27 %) und
// `spotlightknowledged` — Spotlight indexierte den Projektordner. Das ist hier besonders teuer:
// `node_modules` und `ios/App/Pods` bringen zehntausende kleine Dateien mit, `dist/` und
// `ios/App/App/public/` je eine 1,5-MB-HTML mit 240 KB base64-Schriften in sehr langen Zeilen, und
// `DerivedData` schreibt bei jedem Build tausende Dateien neu, die Spotlight erneut anfasst.
// Xcode fiel dabei von 79 % auf 22 % CPU, nachdem diese Ordner ausgenommen waren.
//
// Eine leere Datei `.metadata_never_index` nimmt Spotlight den ganzen Ordner ab — ohne sudo, ohne
// etwas zu loeschen, jederzeit durch Loeschen der Datei umkehrbar.
//
// Warum als Skript und nicht einmalig von Hand: Die betroffenen Ordner sind alle erzeugt und
// gitignored (`node_modules`, `Pods`, `dist`). Nach einem frischen Checkout, einem `npm install`
// oder `pod install` sind die Marker weg und die Last waere zurueck.

import { existsSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ORDNER = [
  'node_modules',
  'ios/App/Pods',
  'dist',
  join(homedir(), 'Library/Developer/Xcode/DerivedData'),
  join(homedir(), 'Library/Developer/CoreSimulator'),
  join(homedir(), 'Library/Caches/ms-playwright')
];

let gesetzt = 0, uebersprungen = 0;
for (const ordner of ORDNER) {
  if (!existsSync(ordner)) { uebersprungen++; continue; }
  try {
    writeFileSync(join(ordner, '.metadata_never_index'), '');
    console.log(`ausgenommen: ${ordner}`);
    gesetzt++;
  } catch (e) {
    console.log(`nicht moeglich: ${ordner} (${e.code || e.message})`);
  }
}
console.log(`mac:entlasten: ${gesetzt} Ordner von der Spotlight-Indexierung ausgenommen` +
            (uebersprungen ? `, ${uebersprungen} nicht vorhanden` : ''));

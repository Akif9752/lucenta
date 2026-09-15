// Entschlackt ios/App/App/public/ nach einem `npx cap sync ios`.
//
// Runde 102, gemeldet vom Mac: "Xcode und der Simulator haengen sehr stark."
//
// Ursache war das Projekt selbst. `dist/` traegt die fertige Seite ZWEIMAL:
// `lucenta.html` (der gewachsene Name, auf den alle Werkzeuge und die acht Pruefungen zeigen)
// und `index.html` (seit dem build.js-Zusatz, weil Capacitor genau diesen Namen laedt). `cap sync`
// kopiert `dist/` vollstaendig, also landen BEIDE in der Huelle — zwei byte-identische Dateien von
// je 1,5 MB.
//
// Das kostet dreifach:
//   1. Das App-Bundle traegt 3,1 MB statt 1,5 MB; jeder Build kopiert beide (CpResource), jede
//      Installation schiebt beide auf Geraet und Simulator.
//   2. Xcode zeigt `public/` als Ordnerverweis und indexiert damit BEIDE Dateien. Eine 1,5-MB-HTML
//      mit 240 KB base64-Schriften in wenigen sehr langen Zeilen ist fuer den Indexer teuer —
//      zweimal doppelt so teuer.
//   3. Der Simulator installiert bei jedem Lauf die doppelte Nutzlast.
//
// Die App laedt ausschliesslich `index.html` (Capacitor-Vorgabe, kein `server.url` gesetzt).
// `lucenta.html` in der Huelle ist damit toter Ballast — in `dist/` bleibt sie, dort brauchen die
// Werkzeuge sie.
//
// Bewusst ein eigener Schritt und keine Aenderung an build.js: `dist/lucenta.html` ist der Name,
// den die Pruefungen, der Server auf 8017 und die Veroeffentlichung erwarten.

import { existsSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC = 'ios/App/App/public';
const BEHALTEN = 'index.html';
const ENTBEHRLICH = ['lucenta.html'];

if (!existsSync(join(PUBLIC, BEHALTEN))) {
  console.error(`ios:schlank: ${PUBLIC}/${BEHALTEN} fehlt — erst "npx cap sync ios" laufen lassen.`);
  process.exit(1);
}

let befreit = 0;
for (const name of ENTBEHRLICH) {
  const pfad = join(PUBLIC, name);
  if (!existsSync(pfad)) continue;
  befreit += statSync(pfad).size;
  unlinkSync(pfad);
  console.log(`ios:schlank: ${name} aus der Huelle entfernt (Duplikat von ${BEHALTEN})`);
}

console.log(befreit
  ? `ios:schlank: ${(befreit / 1024 / 1024).toFixed(1)} MB weniger im App-Bundle und im Xcode-Index`
  : 'ios:schlank: nichts zu tun, die Huelle war schon schlank');

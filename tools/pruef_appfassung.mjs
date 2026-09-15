// Prueft dist/index.html — die Fassung, die im App-Bundle liegt.  `npm run pruef-app`
//
// Runde 102. Die acht Pruefungen messen alle `dist/lucenta.html`: die Ein-Datei-Fassung mit
// eingebetteten Schriften und vollstaendigen Kommentaren. Seit dieser Runde ist die Fassung im
// App-Bundle aber eine ANDERE Datei — `dist/index.html`, mit ausgelagerten Schriften und von
// esbuild entfernten Kommentaren. Genau die laedt das iPhone, und genau die war damit als einzige
// ungeprueft unterwegs.
//
// Das ist die Luecke, die diese Pruefung schliesst. Sie ist absichtlich klein und fragt nur, was
// beim Umbau der App-Fassung kaputtgehen KANN:
//   1. Laedt die Seite ueberhaupt, ohne Ausnahme?
//   2. Sind die fuenf Schriftdateien da und werden sie geladen? (Ausgelagerte Schriften koennen
//      ins Leere zeigen — im Browser sieht man nur eine Rueckfallschrift, kein Fehler.)
//   3. Sind alle acht Sprachpakete noch im CONTENT? (Ein Umbau des JavaScripts, der ein Paket
//      verschluckt, faellt sonst erst auf, wenn jemand die Sprache umstellt.)
//   4. Steht die Startansicht, und tragen die Ueberschriften die Markenschrift?
//
// Der lokale Server auf 8017 muss laufen (cd dist && python3 -m http.server 8017 --bind 127.0.0.1).

import { webkit } from 'playwright';
import { existsSync, readdirSync } from 'node:fs';

const BASIS = 'http://127.0.0.1:8017';
let fehler = 0, gepruft = 0;
const ok = (bedingung, text, zusatz = '') => {
  gepruft++;
  if (bedingung) { console.log(`  ok    ${text}${zusatz ? ': ' + zusatz : ''}`); }
  else { fehler++; console.log(`  FEHL  ${text}${zusatz ? ': ' + zusatz : ''}`); }
};

console.log('\n=== Die Fassung im App-Bundle (dist/index.html) ===\n');

// Vorab ohne Browser: liegen die Schriftdateien wirklich da?
const schriftOrdner = 'dist/schriften';
const dateien = existsSync(schriftOrdner)
  ? readdirSync(schriftOrdner).filter(f => f.endsWith('.woff2'))
  : [];
ok(dateien.length > 0, 'dist/schriften/ enthaelt Schriftdateien', `${dateien.length} Stueck`);

const browser = await webkit.launch();
const seite = await (await browser.newContext({ viewport: { width: 393, height: 852 } })).newPage();

const ausnahmen = [];
const schriftAntworten = [];
seite.on('pageerror', e => ausnahmen.push(e.message));
seite.on('response', r => {
  if (r.url().includes('/schriften/')) schriftAntworten.push({ status: r.status(), url: r.url() });
});

await seite.goto(`${BASIS}/index.html`, { waitUntil: 'load' });
await seite.evaluate(() => document.fonts.ready);
await seite.waitForTimeout(400);

ok(ausnahmen.length === 0, 'keine Ausnahme beim Laden', ausnahmen.join(' | '));

const schlecht = schriftAntworten.filter(a => a.status >= 400);
// Bewusst nicht "alle fuenf": Mit font-display:swap holt WebKit nur die Schnitte, die die
// Startseite wirklich braucht — beim ersten Messen waren es vier von fuenf, und das ist richtig so.
// Geprueft wird deshalb, dass ueberhaupt Schriften geholt werden und KEINE ins Leere zeigt.
ok(schriftAntworten.length >= 3, 'die Startseite holt ihre Schriften',
   `${schriftAntworten.length} von ${dateien.length} Dateien angefordert`);
ok(schlecht.length === 0, 'keine Schrift antwortet mit Fehler',
   schlecht.map(a => a.status + ' ' + a.url.split('/').pop()).join(', '));

const befund = await seite.evaluate(() => {
  const h1 = document.querySelector('h1');
  const geladen = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family);
  return {
    landing: !!document.querySelector('#view-landing.active'),
    h1Text: h1 ? h1.innerText.trim().slice(0, 30) : null,
    h1Schrift: h1 ? getComputedStyle(h1).fontFamily.split(',')[0].replace(/['"]/g, '') : null,
    geladeneFamilien: [...new Set(geladen)],
    // Die Sprachwahl im DOM ist der einzige Weg von aussen an die Sprachliste: CONTENT liegt in
    // der gemeinsamen IIFE der App und ist absichtlich nicht global.
    sprachen: [...document.querySelectorAll('[data-lang]')].map(b => b.getAttribute('data-lang'))
  };
});

ok(befund.landing, 'die Startansicht ist aktiv');
ok(!!befund.h1Text, 'die Ueberschrift steht', befund.h1Text || '(leer)');
ok(befund.h1Schrift === 'Fraunces', 'die Ueberschrift traegt die Markenschrift', befund.h1Schrift);
ok(befund.geladeneFamilien.length >= 3, 'mindestens drei Schriftfamilien sind geladen',
   befund.geladeneFamilien.join(', '));

// Die Zahl steht bewusst ausgeschrieben da — genau wie in tests/lang_test.js. Ein Sprachpaket,
// das beim Umbau der App-Fassung verschwindet, wuerde sonst lautlos fehlen.
const ERWARTET = ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt', 'tr'];
const fehlendImDom = ERWARTET.filter(s => !befund.sprachen.includes(s));
ok(fehlendImDom.length === 0, 'die Sprachwahl bietet alle acht Sprachen',
   fehlendImDom.length ? 'fehlt: ' + fehlendImDom.join(', ') : befund.sprachen.length + ' Knoepfe');

// Zusaetzlich im Quelltext der App-Datei: Traegt sie die Sprachpakete wirklich? Der DOM-Test oben
// sieht nur die Knoepfe — ein verschlucktes Paket faellt dort nicht auf, sondern erst beim
// Umstellen der Sprache.
const { readFileSync } = await import('node:fs');
const appQuelle = readFileSync('dist/index.html', 'utf8');
// Muster aus der Quelle: die Pakete stehen als `CONTENT.fr = {` (minifiziert `CONTENT.fr={`).
// Ein loseres Muster wie `fr:{` trifft zufaellig anderen Code — beim ersten Versuch meldete es
// vier Sprachen als vorhanden, die es so gar nicht gab.
const fehlendImText = ERWARTET.filter(s => !new RegExp(`CONTENT\\.${s}\\s*=`).test(appQuelle));
ok(fehlendImText.length === 0, 'die App-Datei traegt alle acht Sprachpakete',
   fehlendImText.length ? 'fehlt: ' + fehlendImText.join(', ') : 'acht Pakete gefunden');

await browser.close();

console.log('\n======================================================');
console.log(fehler === 0 ? `ALLE ${gepruft} PRUEFUNGEN BESTANDEN`
                         : `${fehler} VON ${gepruft} PRUEFUNGEN FEHLGESCHLAGEN`);
console.log('======================================================\n');
process.exit(fehler === 0 ? 0 : 1);

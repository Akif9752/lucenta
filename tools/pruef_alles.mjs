// Faehrt die Pflichtrunde in EINEM Befehl.
//   npm run pruef-alles    waehlt nach Aenderung (Entscheidung des Inhabers): Hat sich seit dem
//                          letzten vollen, bestandenen Lauf nur ausserhalb der Oberflaeche etwas
//                          geaendert (Tierbilder, Doku, Swift, Werkzeuge), genuegt die leichte Stufe.
//   npm run pruef-voll     immer alle neun.
//   npm run pruef-schnell  Bau, Testreihen, i18n-Audit, App-Fassung — fuer den Zwischenstand.
// Gleichzeitig laufen nur Pruefungen derselben `stufe`; `pruef-bewegung` und `fehlersuche` messen
// Zeitverlaeufe und laufen deshalb allein.

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname, normalize } from 'node:path';

const WURZEL = new URL('..', import.meta.url).pathname;
const DIST = join(WURZEL, 'dist');
const PORT = Number(process.env.LUCENTA_PORT || 8017);
const BASIS = `http://127.0.0.1:${PORT}`;
const LOGS = join(WURZEL, '.pruef-log');
const ARGS = process.argv.slice(2);
const SCHNELL = ARGS.some(a => /^--?schnell$/.test(a));
const VOLL = ARGS.some(a => /^--?voll$/.test(a));
const MERKER = join(LOGS, 'letzte-volle.json');

// ---------- die Pruefungen ----------
//
// `server: true` heisst: braucht die Seite ueber HTTP (Playwright kann file:// nicht mit
// localStorage und fetch zugleich). `bericht: true` heisst: die letzte Zeile ist kein Urteil,
// sondern eine Zahl — `diff-sprachen` zaehlt Zeilen, die in zwei Sprachen gleich sind, und manche
// davon sind richtig so (Eigennamen, Kuerzel). Angezeigt wird darum die Summe (Feld `merke`);
// durchfallen kann es trotzdem, naemlich wenn es abstuerzt.
const PRUEFUNGEN = [
  { name: 'build',          stufe: 0, befehl: 'node',    args: ['build.js'],                   schnell: true, leicht: true },
  { name: 'tests',          stufe: 1, befehl: 'node',    args: ['tests/run.js'],               schnell: true, leicht: true },
  { name: 'audit-i18n',     stufe: 1, befehl: 'python3', args: ['tools/audit_i18n.py'],        schnell: true, leicht: true },
  { name: 'pruef-store',    stufe: 1, befehl: 'python3', args: ['tools/pruef_store_texte.py'], leicht: true },
  { name: 'pruef-app',      stufe: 2, befehl: 'node',    args: ['tools/pruef_appfassung.mjs'], server: true, schnell: true, leicht: true },
  { name: 'pruef-nativ',    stufe: 2, befehl: 'node',    args: ['tools/pruef_nativ.mjs'],      server: true },
  { name: 'diff-sprachen',  stufe: 2, befehl: 'node',    args: ['tools/diff_sprachen.mjs'],    server: true, bericht: true,
    merke: /^Summe verdaechtiger Zeilen.*/m },
  { name: 'pruef-bewegung', stufe: 3, befehl: 'node',    args: ['tools/pruef_bewegung.mjs'],   server: true },
  { name: 'fehlersuche',    stufe: 4, befehl: 'node',    args: ['tools/fehlersuche.mjs'],      server: true }
];

// ---------- Auswahl nach Aenderung ----------
//
// Grundlage ist der Arbeitsbaum beim letzten vollen, bestandenen Lauf (`git stash create` haelt
// auch Uncommittetes fest). Alles, was die Oberflaeche oder ihre Pruefungen beruehrt, verlangt die
// volle Runde; Tierbilder pruefen Bau und `pruef-app` (zaehlt und laedt sie).
const OBERFLAECHE = [/^src\/(?!figuren\/)/, /^build\.js$/, /^package-lock\.json$/,
  /^tools\/(pruef_(?!alles)|fehlersuche|diff_sprachen|ios_public)/, /^tests\//];

function git(...a){ return execFileSync('git', a, { cwd: WURZEL, encoding: 'utf8' }).trim(); }
function baumStand(){ return git('stash', 'create') || git('rev-parse', 'HEAD'); }

function waehleStufe(){
  if (VOLL || SCHNELL) return { voll: VOLL, grund: '' };
  let basis;
  try { basis = JSON.parse(readFileSync(MERKER, 'utf8')).stand; } catch { return { voll: true, grund: 'noch kein voller Lauf vermerkt' }; }
  let geaendert;
  try {
    geaendert = [...git('diff', '--name-only', basis).split('\n'),
                 ...git('ls-files', '--others', '--exclude-standard').split('\n')].filter(Boolean);
  } catch { return { voll: true, grund: 'Vergleichsstand nicht lesbar' }; }
  const treffer = geaendert.filter(d => OBERFLAECHE.some(m => m.test(d)));
  return treffer.length
    ? { voll: true, grund: `Oberflaeche geaendert: ${treffer.slice(0, 3).join(', ')}${treffer.length > 3 ? ' …' : ''}` }
    : { voll: false, grund: `seit dem letzten vollen Lauf nur ausserhalb der Oberflaeche geaendert (${geaendert.length} Dateien)` };
}

// ---------- Server ----------
//
// Ein eigener kleiner Server statt `python3 -m http.server`: Er laeuft im selben Prozess, endet
// mit ihm (kein verwaister Prozess auf 8017, der beim naechsten Lauf im Weg steht) und braucht
// kein Python. Faellt auf einen bereits laufenden zurueck — wer beim Arbeiten schon einen
// gestartet hat, soll ihn behalten duerfen.
const TYPEN = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.woff2': 'font/woff2',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml'
};

async function antwortetSchon(){
  try {
    const a = await fetch(`${BASIS}/lucenta.html`, { signal: AbortSignal.timeout(1500) });
    return a.ok;
  } catch { return false; }
}

function starteServer(){
  const server = createServer((anfrage, antwort) => {
    // normalize() gegen "..": Der Server zeigt auf dist/ und soll nichts darueber ausliefern.
    const pfad = join(DIST, normalize(decodeURIComponent(anfrage.url.split('?')[0])).replace(/^(\.\.[/\\])+/, ''));
    if (!pfad.startsWith(DIST) || !existsSync(pfad) || statSync(pfad).isDirectory()){
      antwort.writeHead(404); antwort.end('nicht da'); return;
    }
    antwort.writeHead(200, { 'Content-Type': TYPEN[extname(pfad)] || 'application/octet-stream' });
    createReadStream(pfad).pipe(antwort);
  });
  return new Promise((fertig, fehler) => {
    server.on('error', fehler);
    server.listen(PORT, '127.0.0.1', () => fertig(server));
  });
}

// ---------- Ausfuehren ----------

function fuehreAus(p){
  return new Promise(fertig => {
    const start = Date.now();
    // Der Port wird durchgereicht, damit alle Pruefungen denselben benutzen — auch wenn er nicht
    // 8017 ist. Die Werkzeuge lesen LUCENTA_URL bzw. LUCENTA_BASIS und haben 8017 nur als Vorgabe.
    const kind = spawn(p.befehl, p.args, { cwd: WURZEL, env: {
      ...process.env,
      LUCENTA_PORT: String(PORT),
      LUCENTA_BASIS: BASIS,
      LUCENTA_URL: process.env.LUCENTA_URL || `${BASIS}/lucenta.html`
    } });
    let aus = '';
    kind.stdout.on('data', d => { aus += d; });
    kind.stderr.on('data', d => { aus += d; });
    kind.on('error', e => fertig({ code: 127, aus: aus + '\n' + e.message, dauer: Date.now() - start }));
    kind.on('close', code => fertig({ code, aus, dauer: Date.now() - start }));
  });
}

// Die letzte Zeile, die etwas aussagt. Bewusst nicht je Pruefung ein eigenes Muster: Jede dieser
// Pruefungen endet mit ihrem Ergebnis, und ein Muster je Werkzeug waere eine zweite Stelle, die
// man beim Umbau vergisst. Nur `diff-sprachen` bringt seine Zahl mit (Feld `merke`).
function zusammenfassung(aus, merke){
  if (merke){
    const t = aus.match(merke);
    if (t) return t[0].trim().slice(0, 78);
  }
  const zeilen = aus.split('\n').map(z => z.trim())
    .filter(z => z && !/^[=\-_]{3,}$/.test(z));
  return zeilen.length ? zeilen[zeilen.length - 1].slice(0, 78) : '(keine Ausgabe)';
}

const BEGINN = Date.now();
const wahl = waehleStufe();
const LEICHT = !SCHNELL && !wahl.voll;
const dran = PRUEFUNGEN.filter(p => SCHNELL ? p.schnell : LEICHT ? p.leicht : true);
const brauchtServer = dran.some(p => p.server);
const standBeimStart = baumStand();

const titel = SCHNELL ? 'Schnellpruefung' : LEICHT ? 'leichte Runde' : 'Pflichtrunde';
console.log(`\n=== Lucenta: ${titel} — ${dran.length} Pruefungen ===`);
if (wahl.grund) console.log(`  Auswahl: ${wahl.grund}`);
console.log('');

let server = null;
if (brauchtServer){
  if (await antwortetSchon()){
    console.log(`  Server: ${BASIS} laeuft schon, wird mitbenutzt\n`);
  } else {
    try {
      server = await starteServer();
      console.log(`  Server: ${BASIS} gestartet (dist/)\n`);
    } catch (e) {
      console.error(`Port ${PORT} ist belegt, antwortet aber nicht wie dist/. ` +
                    `Entweder den Prozess beenden oder LUCENTA_PORT setzen.\n${e.message}`);
      process.exit(2);
    }
  }
}

mkdirSync(LOGS, { recursive: true });
const ergebnisse = [];
const amTerminal = process.stdout.isTTY;
const stufen = [...new Set(dran.map(p => p.stufe))].sort((a, b) => a - b);
for (const s of stufen){
  const gruppe = dran.filter(p => p.stufe === s);
  if (amTerminal) process.stdout.write(`  …    ${gruppe.map(p => p.name).join(', ')}`);
  const laeufe = await Promise.all(gruppe.map(fuehreAus));
  if (amTerminal) process.stdout.write('\r\x1b[K');
  let bauKaputt = false;
  gruppe.forEach((p, i) => {
    const { code, aus, dauer } = laeufe[i];
    writeFileSync(join(LOGS, p.name + '.log'), aus);
    // Auch ein Bericht muss durchlaufen: abstuerzen darf `diff-sprachen` nicht.
    const gut = code === 0;
    ergebnisse.push({ ...p, code, gut, dauer, zeile: zusammenfassung(aus, p.merke) });
    const sek = (dauer / 1000).toFixed(0).padStart(3) + 's';
    console.log(`  ${gut ? 'ok  ' : 'FEHL'} ${p.name.padEnd(14)} ${sek}  ${ergebnisse.at(-1).zeile}`);
    if (!gut){
      console.log('\n' + aus.trimEnd().split('\n').slice(-25).map(z => '      ' + z).join('\n') + '\n');
      if (p.name === 'build') bauKaputt = true;
    }
  });
  // Bricht der Bau ab, messen alle folgenden Pruefungen einen Stand, den es nicht gibt.
  if (bauKaputt){ console.log('      Bau fehlgeschlagen — abgebrochen.\n'); break; }
}
if (server) server.close();

const durchgefallen = ergebnisse.filter(e => !e.gut);
const gesamt = ((Date.now() - BEGINN) / 1000 / 60).toFixed(1);
const vollGelaufen = !SCHNELL && !LEICHT && ergebnisse.length === PRUEFUNGEN.length;
if (vollGelaufen && !durchgefallen.length){
  writeFileSync(MERKER, JSON.stringify({ stand: standBeimStart, zeit: new Date().toISOString() }) + '\n');
}
console.log('\n======================================================');
console.log(durchgefallen.length
  ? `${durchgefallen.length} von ${ergebnisse.length} FEHLGESCHLAGEN: ${durchgefallen.map(e => e.name).join(', ')}`
  : `ALLE ${ergebnisse.length} BESTANDEN` +
    (SCHNELL ? '  (Schnellpruefung — vor dem Commit `npm run pruef-alles`)' : LEICHT ? '  (leichte Runde, Oberflaeche unveraendert)' : ''));
console.log(`${gesamt} Minuten. Vollstaendige Ausgaben: .pruef-log/`);
console.log('======================================================\n');
process.exit(durchgefallen.length ? 1 : 0);

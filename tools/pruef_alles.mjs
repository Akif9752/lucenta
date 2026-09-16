// Faehrt die Pflichtrunde in EINEM Befehl.  `npm run pruef-alles` / `npm run pruef-schnell`
//
// Runde 103. Vorher stand in der CLAUDE.md eine Liste von neun Befehlen, und fuenf davon
// brauchten einen Server auf Port 8017, den man vorher von Hand starten musste. Wer ihn vergass,
// bekam fuenf Fehlschlaege, die nichts mit dem Code zu tun hatten — und wer sie einzeln startete,
// brauchte neun Durchgaenge fuer eine Antwort, die auf eine Seite passt.
//
// Dieses Werkzeug macht daraus einen Aufruf:
//   - es bringt den Server selbst mit (und faellt auf einen bereits laufenden zurueck),
//   - es fuehrt die Pruefungen in der Reihenfolge billig -> teuer aus, damit ein Fehler frueh
//     auffaellt und nicht nach zehn Minuten,
//   - es schreibt die vollstaendige Ausgabe jeder Pruefung nach .pruef-log/<name>.log und zeigt
//     nur eine Zeile je Pruefung; bei einem Fehlschlag zusaetzlich das Ende der Ausgabe,
//   - und es endet mit einem Exit-Code, der zum Ergebnis passt.
//
// Zwei Stufen, weil nicht jede Frage die ganze Runde braucht:
//   npm run pruef-schnell   Bau, Testreihen, i18n-Audit, App-Fassung — unter einer Minute,
//                           gedacht fuer den Zwischenstand waehrend der Arbeit.
//   npm run pruef-alles     alle neun. Das ist die Pflichtrunde vor jedem Commit, der src/
//                           beruehrt, und nur sie darf einen Commit rechtfertigen.
//
// Bewusst NICHT parallel: `pruef-bewegung` misst Zeitverlaeufe von Animationen, und `fehlersuche`
// faehrt intern schon vier Browser gleichzeitig. Mehrere messende Prozesse nebeneinander wuerden
// sich die Rechenzeit wegnehmen und Zahlen erzeugen, die von der Last abhaengen statt vom Code.

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname, normalize } from 'node:path';

const WURZEL = new URL('..', import.meta.url).pathname;
const DIST = join(WURZEL, 'dist');
const PORT = Number(process.env.LUCENTA_PORT || 8017);
const BASIS = `http://127.0.0.1:${PORT}`;
const LOGS = join(WURZEL, '.pruef-log');
const SCHNELL = process.argv.slice(2).some(a => /^--?schnell$/.test(a));

// ---------- die Pruefungen ----------
//
// `server: true` heisst: braucht die Seite ueber HTTP (Playwright kann file:// nicht mit
// localStorage und fetch zugleich). `bericht: true` heisst: die letzte Zeile ist kein Urteil,
// sondern eine Zahl — `diff-sprachen` zaehlt Zeilen, die in zwei Sprachen gleich sind, und manche
// davon sind richtig so (Eigennamen, Kuerzel). Angezeigt wird darum die Summe (Feld `merke`);
// durchfallen kann es trotzdem, naemlich wenn es abstuerzt.
const PRUEFUNGEN = [
  { name: 'build',          befehl: 'node',    args: ['build.js'],                  schnell: true },
  { name: 'tests',          befehl: 'node',    args: ['tests/run.js'],              schnell: true },
  { name: 'audit-i18n',     befehl: 'python3', args: ['tools/audit_i18n.py'],       schnell: true },
  { name: 'pruef-store',    befehl: 'python3', args: ['tools/pruef_store_texte.py'] },
  { name: 'pruef-app',      befehl: 'node',    args: ['tools/pruef_appfassung.mjs'], server: true, schnell: true },
  { name: 'pruef-nativ',    befehl: 'node',    args: ['tools/pruef_nativ.mjs'],      server: true },
  { name: 'pruef-bewegung', befehl: 'node',    args: ['tools/pruef_bewegung.mjs'],   server: true },
  { name: 'diff-sprachen',  befehl: 'node',    args: ['tools/diff_sprachen.mjs'],    server: true, bericht: true,
    merke: /^Summe verdaechtiger Zeilen.*/m },
  { name: 'fehlersuche',    befehl: 'node',    args: ['tools/fehlersuche.mjs'],      server: true }
];

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

const dran = PRUEFUNGEN.filter(p => !SCHNELL || p.schnell);
const brauchtServer = dran.some(p => p.server);

console.log(`\n=== Lucenta: ${SCHNELL ? 'Schnellpruefung' : 'Pflichtrunde'} — ${dran.length} Pruefungen ===\n`);

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
for (const p of dran){
  // Die laufende Pruefung anzeigen und die Zeile danach ueberschreiben — aber nur im Terminal.
  // Umgeleitet in eine Datei (und so laeuft dieser Befehl meistens) bleibt das \r stehen und
  // jede Zeile truege ihren Namen zweimal.
  const amTerminal = process.stdout.isTTY;
  if (amTerminal) process.stdout.write(`  …    ${p.name.padEnd(14)}`);
  const { code, aus, dauer } = await fuehreAus(p);
  writeFileSync(join(LOGS, p.name + '.log'), aus);
  // Auch ein Bericht muss durchlaufen: `diff-sprachen` faellt nicht wegen seiner Zahlen durch,
  // sehr wohl aber, wenn es abstuerzt (etwa "Fragebogen nicht durchgelaufen"). Der erste Entwurf
  // hat hier `bericht ? true : ...` gesetzt und damit genau diesen Absturz verschluckt.
  const gut = code === 0;
  ergebnisse.push({ ...p, code, gut, dauer, zeile: zusammenfassung(aus, p.merke) });
  const s = (dauer / 1000).toFixed(0).padStart(3) + 's';
  console.log(`${amTerminal ? '\r' : ''}  ${gut ? 'ok  ' : 'FEHL'} ${p.name.padEnd(14)} ${s}  ${ergebnisse.at(-1).zeile}`);
  // Die Ausgabe eines Fehlschlags gleich hier, nicht erst am Ende: Wer den Lauf beobachtet, soll
  // nicht warten muessen, um zu sehen, WAS schiefgeht.
  if (!gut){
    const ende = aus.trimEnd().split('\n').slice(-25);
    console.log('\n' + ende.map(z => '      ' + z).join('\n') + '\n');
    // Bricht der Bau ab, messen alle folgenden Pruefungen einen Stand, den es nicht gibt.
    if (p.name === 'build'){ console.log('      Bau fehlgeschlagen — abgebrochen.\n'); break; }
  }
}

if (server) server.close();

const durchgefallen = ergebnisse.filter(e => !e.gut);
const gesamt = (ergebnisse.reduce((s, e) => s + e.dauer, 0) / 1000 / 60).toFixed(1);
console.log('\n======================================================');
console.log(durchgefallen.length
  ? `${durchgefallen.length} von ${ergebnisse.length} FEHLGESCHLAGEN: ${durchgefallen.map(e => e.name).join(', ')}`
  : `ALLE ${ergebnisse.length} BESTANDEN` +
    (SCHNELL ? '  (Schnellpruefung — vor dem Commit die ganze Runde)' : ''));
console.log(`${gesamt} Minuten. Vollstaendige Ausgaben: .pruef-log/`);
console.log('======================================================\n');
process.exit(durchgefallen.length ? 1 : 0);

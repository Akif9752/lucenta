#!/usr/bin/env node
/**
 * Führt alle Testreihen gegen den gebauten Stand aus.
 *
 * Aufbau: Der App-Code wird aus dist/lucenta.html gezogen und bis zur Marke "wiring" verwendet —
 * das ist der Teil ohne Ereignis-Verdrahtung, der sich ohne Browser ausführen lässt. Davor kommt
 * ein Ersatz-DOM (harness), danach die eigentlichen Prüfungen.
 *
 * Bekannte Grenze, teuer gelernt (Runde 56): Der Ersatz-DOM behandelt textContent und innerHTML
 * gleich. Fehler, die genau in diesem Unterschied liegen, sind hier unsichtbar — dafür gibt es
 * tools/audit_i18n.py. Beides zusammen ergibt die Absicherung, keines allein.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist', 'lucenta.html');
if (!fs.existsSync(DIST)) { console.error('dist/lucenta.html fehlt — bitte zuerst: node build.js'); process.exit(1); }

const html = fs.readFileSync(DIST, 'utf8');
const js = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
const core = js.slice(0, js.indexOf('// ---------- wiring ----------'));

const SUITES = [
  ['harness.js',       'tests.js',       'Kernlogik'],
  ['harness2.js',      't2.js',          'Lebenszyklus'],
  ['harness2.js',      't5.js',          'Ergebnisseite'],
  ['hist_harness.js',  'hist_test.js',   'Verlaufs-Navigation'],
  ['harness2.js',      'one_test.js',    'Ein-Eintrag-Zustände'],
  ['harness2.js',      'guest_test.js',  'Gastdurchlauf'],
  ['harness2.js',      'share_test.js',  'Ergebnisbild'],
  ['harness2.js',      'state_test.js',  'Tagesform'],
  ['harness2.js',      'anim_test.js',   'Fragewechsel'],
  ['harness2.js',      'lang_test.js',   'Sprachwechsel'],
];

const tmp = path.join(ROOT, '.tmp-tests');
fs.mkdirSync(tmp, { recursive: true });

let failed = 0;
for (const [harness, test, label] of SUITES) {
  const file = path.join(tmp, test.replace('.js', '.run.js'));
  fs.writeFileSync(file,
    fs.readFileSync(path.join(__dirname, harness), 'utf8') + core +
    fs.readFileSync(path.join(__dirname, test), 'utf8') + '\n})();\n');
  let out;
  try { out = execFileSync('node', [file], { encoding: 'utf8' }); }
  catch (e) { out = (e.stdout || '') + (e.stderr || ''); }
  const line = (out.match(/ALLE .*BESTANDEN|.*FEHLGESCHLAGEN|Error.*/g) || ['(keine Ausgabe)']).pop().trim();
  const ok = /BESTANDEN/.test(line);
  if (!ok) failed++;
  console.log((ok ? ' ok   ' : ' FAIL ') + label.padEnd(22) + line);
}
fs.rmSync(tmp, { recursive: true, force: true });

console.log('');
if (failed) { console.error(failed + ' Reihe(n) fehlgeschlagen'); process.exit(1); }
console.log('Alle ' + SUITES.length + ' Reihen bestanden.');

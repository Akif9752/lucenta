// Schliesst eine Runde in einem Befehl ab:
//   npm run runde -- <nr> "<Zeile fuer die Tabelle>" <datei-mit-commit-nachricht> [--ohne-installieren]
// Vorher: Journal-Eintrag "## Runde <nr> — …" geschrieben und `npm run pruef-alles` bestanden.
// Dann: Tabellenzeile + Stand-Marken im Uebergabeblock, Commit, Push, Installation (nur wenn src/ oder ios/ geaendert).
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const WURZEL = new URL('..', import.meta.url).pathname;
const JOURNAL = join(WURZEL, 'docs/ios-huelle-journal.md');
const AUSGENOMMEN = 'ios/App/App.xcworkspace/xcshareddata';
const ZUSATZ = 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>';

const args = process.argv.slice(2);
const ohneInstall = args.includes('--ohne-installieren');
const [nr, tabelle, nachrichtDatei] = args.filter(a => !a.startsWith('--'));
const stopp = m => { console.error('ABBRUCH: ' + m); process.exit(1); };
if (!/^\d+$/.test(nr || '') || !tabelle || !nachrichtDatei) stopp('Aufruf: npm run runde -- <nr> "<Tabellenzeile>" <nachricht.txt>');
if (!existsSync(nachrichtDatei)) stopp(`Commit-Nachricht ${nachrichtDatei} fehlt`);

const git = (...a) => execFileSync('git', a, { cwd: WURZEL, encoding: 'utf8' }).trim();
const geaendertSeit = stand => [...git('diff', '--name-only', stand).split('\n'),
  ...git('ls-files', '--others', '--exclude-standard').split('\n')].filter(d => d && !d.startsWith(AUSGENOMMEN));

// 1. Pruefung muss zum Stand passen. Danach geaenderte Doku (der Journal-Eintrag) ist erlaubt.
const nurDoku = d => d.startsWith('docs/') || d.endsWith('.md');
const seitHead = geaendertSeit('HEAD');
if (!seitHead.length) stopp('nichts zu committen');
if (!seitHead.every(nurDoku)){
  let letzte;
  try { letzte = JSON.parse(readFileSync(join(WURZEL, '.pruef-log/letzte.json'), 'utf8')); }
  catch { stopp('keine Pruefrunde vermerkt — erst npm run pruef-alles'); }
  if (!letzte.gut) stopp('die letzte Pruefrunde ist durchgefallen (.pruef-log/)');
  const danach = geaendertSeit(letzte.stand).filter(d => !nurDoku(d));
  if (danach.length) stopp('nach der letzten Pruefrunde geaendert: ' + danach.slice(0, 5).join(', ') + ' — erst npm run pruef-alles');
  console.log(`Pruefrunde passt (${letzte.art}, ${letzte.zeit.slice(0, 16).replace('T', ' ')})`);
}

// 2. Uebergabeblock nachziehen.
let j = readFileSync(JOURNAL, 'utf8');
if (!j.includes(`\n## Runde ${nr} — `)) stopp(`Journal-Eintrag "## Runde ${nr} — …" fehlt`);
const kopf = '| Runde | Commit | Inhalt |\n| --- | --- | --- |\n';
const i = j.indexOf(kopf);
if (i < 0) stopp('Tabelle im Uebergabeblock nicht gefunden');
const nachKopf = i + kopf.length;
const ersteZeile = j.slice(nachKopf, j.indexOf('\n', nachKopf));
if (!ersteZeile.startsWith(`| ${nr} |`)){
  // Die Zeile der vorigen Runde bekommt ihren Commit (HEAD).
  const fest = ersteZeile.replace('| (dieser) |', '| `' + git('rev-parse', '--short', 'HEAD') + '` |');
  j = j.slice(0, nachKopf) + `| ${nr} | (dieser) | ${tabelle} |\n` + fest + j.slice(nachKopf + ersteZeile.length);
}
j = j.replace(/(## ÜBERGABE an die naechste Sitzung \(Stand )[\d-]+, nach Runde \d+\)/,
              `$1${new Date().toISOString().slice(0, 10)}, nach Runde ${nr})`)
     .replace(/durchgesehen nach Runde \d+/, `durchgesehen nach Runde ${nr}`)
     .replace(/Stand von \*\*Runde \d+\*\* installiert/, `Stand von **Runde ${nr}** installiert`)
     .replace(/\*\*gepusht\*\* bis Runde \d+/, `**gepusht** bis Runde ${nr}`);
writeFileSync(JOURNAL, j);

// 3. Commit und Push.
let nachricht = readFileSync(nachrichtDatei, 'utf8').trimEnd();
if (!nachricht.includes(ZUSATZ)) nachricht += '\n\n' + ZUSATZ;
const dateien = geaendertSeit('HEAD');
git('add', '-A', '--', '.', ':!' + AUSGENOMMEN);
execFileSync('git', ['commit', '-q', '-F', '-'], { cwd: WURZEL, input: nachricht + '\n' });
console.log('Commit ' + git('log', '--oneline', '-1'));
const push = spawnSync('git', ['push', '-q'], { cwd: WURZEL, encoding: 'utf8' });
console.log(push.status === 0 ? 'gepusht' : 'PUSH FEHLGESCHLAGEN:\n' + push.stderr);

// 4. Installieren, wenn sich an der App etwas geaendert hat.
if (!ohneInstall && dateien.some(d => d.startsWith('src/') || d.startsWith('ios/'))){
  const r = spawnSync('sh', ['tools/installieren.sh'], { cwd: WURZEL, stdio: 'inherit' });
  process.exit(r.status || push.status);
} else {
  console.log('Installation uebersprungen (' + (ohneInstall ? 'so gewuenscht' : 'App unveraendert') + ')');
  process.exit(push.status);
}

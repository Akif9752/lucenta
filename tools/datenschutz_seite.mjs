// Erzeugt die oeffentliche Datenschutz-Seite (App Store Connect verlangt eine URL) aus DENSELBEN Texten
// und Impressumsangaben wie die App — abgeschrieben wuerde sie auseinanderdriften.
// Aufruf: node tools/datenschutz_seite.mjs  -> web/datenschutz/<sprache>.html, index.html = Deutsch
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const wurzel = process.cwd();
const ZIEL = path.join(wurzel, 'web', 'datenschutz');
const SPRACHEN = ['de', 'en', 'es', 'fr', 'it', 'pt', 'tr', 'ja'];
const NAMEN = {de:'Deutsch', en:'English', es:'Español', fr:'Français', it:'Italiano', pt:'Português', tr:'Türkçe', ja:'日本語'};

// IMPRESSUM aus 17-settings.js lesen — eine Quelle fuer App und Seite.
const settings = fs.readFileSync(path.join(wurzel, 'src/js/17-settings.js'), 'utf8');
const block = settings.match(/var IMPRESSUM = (\{[\s\S]*?\});/);
if (!block) { console.error('IMPRESSUM in src/js/17-settings.js nicht gefunden'); process.exit(1); }
const IMPRESSUM = vm.runInNewContext('(' + block[1] + ')');

const kontext = {CONTENT: {}};
vm.createContext(kontext);
for (const s of SPRACHEN) vm.runInContext(fs.readFileSync(path.join(wurzel, 'src/i18n', s + '.js'), 'utf8'), kontext);

const fehlt = ['name', 'strasse', 'ort', 'email'].filter(k => !IMPRESSUM[k]);
const fuellen = (text, s) => String(text).replace(/\{\{([a-z]+)\}\}/g, (_, k) =>
  IMPRESSUM[k] || (k === 'ust' ? (kontext.CONTENT[s].UI.js_recht_keine_ust || '') : '[' + k + ']'));

fs.mkdirSync(ZIEL, {recursive: true});
const leiste = s => SPRACHEN.map(x => x === s ? '<b>' + NAMEN[x] + '</b>' : '<a href="' + x + '.html">' + NAMEN[x] + '</a>').join(' · ');
for (const s of SPRACHEN) {
  const recht = kontext.CONTENT[s].RECHT || kontext.CONTENT.de.RECHT;
  const titel = (kontext.CONTENT[s].UI && kontext.CONTENT[s].UI.datenschutz) || 'Datenschutz';
  const html = '<!doctype html><html lang="' + s + '"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Lucenta – ' + titel + '</title>' +
    '<style>body{font:16px/1.55 -apple-system,system-ui,sans-serif;max-width:680px;margin:0 auto;padding:32px 20px 64px;' +
    'color:#1d1d1f;background:#fff}h1{font-size:28px;margin:0 0 4px}h3{font-size:18px;margin:28px 0 6px}' +
    'nav{font-size:14px;color:#666;margin-bottom:28px}a{color:#285F5B}' +
    '@media (prefers-color-scheme:dark){body{color:#f2f0ea;background:#000}nav{color:#999}a{color:#5CB4AD}}</style>' +
    '</head><body><h1>Lucenta</h1><nav>' + leiste(s) + '</nav>' + fuellen(recht.datenschutz, s) + '</body></html>\n';
  fs.writeFileSync(path.join(ZIEL, s + '.html'), html);
  if (s === 'de') fs.writeFileSync(path.join(ZIEL, 'index.html'), html);
}
console.log(SPRACHEN.length + ' Sprachen nach web/datenschutz/ geschrieben.');
if (fehlt.length) {
  console.log('\nACHTUNG: Im Impressum fehlen ' + fehlt.join(', ') + ' (src/js/17-settings.js).');
  console.log('Die Seite nennt dann keinen Verantwortlichen (Art. 13 DSGVO) — so NICHT veroeffentlichen.');
}

// Setzt ueber jedes Rohbild aus dem Simulator (/tmp/store-roh) die Ueberschrift und den Rahmen und legt das Ergebnis
// in Originalgroesse nach assets/store/. Aufruf ueber tools/store_bilder/aufnehmen.sh.
// Die ersten zwei Bilder entscheiden im Store ueber die Installation; ein nackter Bildschirm sagt nicht, worum es geht.
import { webkit } from 'playwright';
import fs from 'fs';
import path from 'path';

const ROH = '/tmp/store-roh';
const ZIEL = path.join(process.cwd(), 'assets', 'store');
const SPRACHEN = process.argv.slice(2).length ? process.argv.slice(2) : ['de', 'en'];
// Je Motiv eine Zeile, <em> in der Markenfarbe. Sprachen ohne Eintrag bleiben ohne Ueberschrift.
const UEBERSCHRIFT = {
  '1-start':     {de:'Deine Persönlichkeit,<br><em>klar erklärt</em>',  en:'Your personality,<br><em>clearly explained</em>'},
  '2-ergebnis':  {de:'Dein Porträt in<br><em>fünf Dimensionen</em>',    en:'Your portrait in<br><em>five dimensions</em>'},
  '3-bericht':   {de:'Verstehe, was dich<br><em>ausmacht</em>',         en:'Understand what<br><em>makes you, you</em>'},
  '4-tagesform': {de:'Sieh, wie es dir<br><em>wirklich</em> geht',      en:'See how you’re<br><em>really</em> doing'},
  '5-verstehen': {de:'Was die Forschung<br><em>über dich</em> weiß',    en:'What research<br><em>knows about you</em>'}
};
const MASSE = { '6.9': [1320, 2868], '6.3': [1206, 2622] };

fs.mkdirSync(ZIEL, { recursive: true });
for (const alt of fs.readdirSync(ZIEL)) if (/^[a-z]{2}-6\.[17]-/.test(alt)) fs.unlinkSync(path.join(ZIEL, alt));   // fruehere Groessen
const browser = await webkit.launch();
let n = 0;
for (const datei of fs.readdirSync(ROH).filter(d => d.endsWith('.png')).sort()){
  const [sprache, groesse, ...rest] = datei.replace('.png', '').split('-');
  const szene = rest.join('-');
  if (!SPRACHEN.includes(sprache) || !MASSE[groesse]) continue;
  const [b, h] = MASSE[groesse];
  const roh = fs.readFileSync(path.join(ROH, datei)).toString('base64');
  const zeile = (UEBERSCHRIFT[szene] || {})[sprache];
  const p = await browser.newPage({ viewport: { width: b, height: h }, deviceScaleFactor: 1 });
  await p.setContent(zeile
    ? '<style>body{margin:0;width:'+b+'px;height:'+h+'px;overflow:hidden;background:radial-gradient(120% 60% at 50% 0%, #12302D 0%, #070B0B 62%, #000 100%);}' +
      'h1{margin:0;padding:'+Math.round(h*0.085)+'px 84px 0;text-align:center;font:500 '+Math.round(b*0.092)+'px/1.12 Georgia, serif;color:#F2F0EA;letter-spacing:-0.01em;}' +
      'h1 em{font-style:italic;color:#5CB4AD;}' +
      'img{position:absolute;left:11%;width:78%;top:'+Math.round(h*0.255)+'px;border-radius:'+Math.round(b*0.1)+'px;border:4px solid rgba(255,255,255,.14);' +
      'box-shadow:0 90px 240px rgba(0,0,0,.6), 0 0 0 24px rgba(255,255,255,.03);}</style>' +
      '<h1>'+zeile+'</h1><img src="data:image/png;base64,'+roh+'">'
    : '<style>body{margin:0}img{display:block;width:'+b+'px;height:'+h+'px}</style><img src="data:image/png;base64,'+roh+'">');
  await p.waitForTimeout(300);
  const aus = path.join(ZIEL, datei);
  await p.screenshot({ path: aus });
  await p.close();
  n++; console.log('  ' + path.basename(aus));
}
await browser.close();
console.log('\n' + n + ' Store-Bilder in assets/store/ (6,9" 1320x2868, 6,3" 1206x2622)');

// Erzeugt die Bildschirmfotos fuer den App-Store-Eintrag.
//
// Apple verlangt sie in festen Pixelmassen, und zwar fuer die groesste und die zweitgroesste
// iPhone-Klasse; die uebrigen Groessen leitet App Store Connect daraus ab:
//     6,7 Zoll  1290 x 2796   (iPhone 15/16 Pro Max und Verwandte)
//     6,1 Zoll  1179 x 2556   (iPhone 15/16 und Verwandte)
//
// Die Masse sind PIXEL, nicht Punkte. Deshalb wird mit der halben Breite in Punkten und
// deviceScaleFactor 3 aufgenommen — 430 x 932 Punkte mal 3 ergibt genau 1290 x 2796. Ein
// direkt in Pixeln aufgenommenes Bild waere zwar gleich gross, haette aber die Schrift und
// alle Abstaende dreifach zu klein: Die App rechnet in Punkten.
//
// Aufgenommen wird die Beispielnutzerin in der GEKAUFTEN Fassung. Das ist kein Schoenen: Nur
// dort sind die Ansichten gefuellt, die den Store-Eintrag tragen — fuenf Wochen Verlauf statt
// leerer Kurven. Wer stattdessen einen leeren Zustand zeigt, zeigt nicht die App, sondern den
// ersten Moment darin.
import { createRequire } from 'module';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const require_ = createRequire(import.meta.url);
let pkg;
for (const ort of ['playwright', process.env.PLAYWRIGHT_PFAD].filter(Boolean)) {
  try { pkg = require_(ort); break; } catch (e) {}
}
if (!pkg) {
  try { pkg = require_(execSync('npm root -g', {encoding:'utf8'}).trim() + '/playwright'); }
  catch (e) { console.error('Playwright nicht gefunden.'); process.exit(2); }
}
const { chromium } = pkg;
const URL = process.env.LUCENTA_URL || 'http://127.0.0.1:8017/lucenta.html';
const ZIEL = path.join(process.cwd(), 'assets', 'store');

const GERAETE = [
  {name:'6.7', breite:430, hoehe:932},   // x3 = 1290 x 2796
  {name:'6.1', breite:393, hoehe:852}    // x3 = 1179 x 2556
];
// Welche Sprachen. App Store Connect will je Sprache einen eigenen Satz; ohne Angabe die
// beiden, die den Eintrag zuerst tragen.
const SPRACHEN = (process.argv.slice(2).length ? process.argv.slice(2) : ['de', 'en']);

// Die fuenf Ansichten des Eintrags, in der Reihenfolge, in der sie jemand durchblaettert.
// Jede zeigt EINE Sache — ein Bildschirmfoto, das zwei Dinge zeigt, zeigt keins davon.
const AUFNAHMEN = [
  {id:'1-start',    hin: async (p) => { /* Startseite, wie sie ist */ }},
  {id:'2-ergebnis', hin: async (p) => { await zuErgebnis(p); }},
  {id:'3-bericht',  hin: async (p) => { await zuErgebnis(p);
                      await p.evaluate(() => { const t=document.querySelector('#traitsList'); t?.scrollIntoView({block:'start'}); });
                      await p.waitForTimeout(700); }},
  {id:'4-tagesform',hin: async (p) => { await p.evaluate(() => document.getElementById('btnLandingStateHistory')?.click()); }},
  {id:'5-verstehen',hin: async (p) => { await p.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
                      await p.waitForTimeout(300);
                      await p.evaluate(() => document.getElementById('btnDrawerUnderstand')?.click()); }}
];

async function zuErgebnis(p){
  await p.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
  await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById('btnDrawerProfileRow')?.click());
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /Dein Ergebnis|Your result|Tu resultado|Ton résultat|Il tuo risultato|O seu resultado|Sonucun|あなたの結果/.test(x.textContent||''));
    b?.click();
  });
}

fs.mkdirSync(ZIEL, {recursive:true});
const browser = await chromium.launch();
let gezaehlt = 0;

for (const sprache of SPRACHEN){
  for (const g of GERAETE){
    for (const a of AUFNAHMEN){
      const p = await browser.newPage({
        viewport:{width:g.breite, height:g.hoehe},
        deviceScaleFactor:3,
        colorScheme:'light'
      });
      await p.goto(URL, {waitUntil:'networkidle'});
      await p.waitForTimeout(400);
      if (sprache !== 'de'){
        await p.evaluate(s => document.querySelector('[data-lang="'+s+'"]')?.click(), sprache);
        await p.waitForTimeout(400);
      }
      // Beispielnutzerin laden, gekaufte Fassung.
      await p.evaluate(() => { try{ localStorage.setItem('lucenta_plus','1'); }catch(e){} });
      await p.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
      await p.waitForTimeout(300);
      await p.evaluate(() => document.getElementById('btnDrawerProfileRow')?.click());
      await p.waitForTimeout(400);
      await p.evaluate(() => document.getElementById('btnDemo')?.click());
      await p.waitForTimeout(1700);
      await p.waitForLoadState('networkidle');
      await p.waitForTimeout(500);

      await a.hin(p);
      await p.waitForTimeout(900);
      // Bewegung anhalten: Zwei Aufnahmen derselben Ansicht sollen gleich aussehen, und ein
      // halb durchgelaufener Uebergang im Store-Bild sieht nach Fehler aus.
      //
      // ABER NICHT ueber animation:none. Der erste Entwurf tat genau das, und das deutsche
      // Bericht-Bild kam leer heraus: Die Dimensionskarten stehen im Stilblatt auf opacity:0
      // und werden erst durch ihre Einblend-Bewegung sichtbar (animation-fill-mode: both).
      // Wer die Bewegung ENTFERNT, entfernt damit auch ihren Endzustand — und uebrig bleibt
      // die Null aus der Grundregel. Stattdessen wird die Dauer auf null gesetzt: Die Bewegung
      // laeuft, nur eben sofort, und ihr Endzustand steht.
      await p.addStyleTag({content:'*{animation-duration:0s !important;animation-delay:0s !important;transition-duration:0s !important;}'});
      await p.waitForTimeout(250);

      const datei = path.join(ZIEL, sprache + '-' + g.name + '-' + a.id + '.png');
      await p.screenshot({path: datei});
      const gross = fs.statSync(datei).size;
      gezaehlt++;
      console.log('  ' + path.basename(datei) + '  ' + (gross/1024).toFixed(0) + ' KB');
      await p.close();
    }
  }
}
await browser.close();
console.log('\n' + gezaehlt + ' Bildschirmfotos in assets/store/');
console.log('Masse: 6.7 = 1290x2796, 6.1 = 1179x2556 — beides genau das, was App Store Connect verlangt.');

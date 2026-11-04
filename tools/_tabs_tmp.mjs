import { webkit } from 'playwright';
import fs from 'fs';
const src = fs.readFileSync('tools/fehlersuche.mjs','utf8');
const appBruecke = new Function('return ' + src.slice(src.indexOf('function appBruecke'), src.indexOf('async function durchlauf')))();
const b = await webkit.launch();
const klick = async (p, s) => { const ok = await p.evaluate(x => { const e = document.querySelector(x); if (!e) return false; e.click(); return true; }, s); await p.waitForTimeout(450); return ok; };
const ansicht = p => p.evaluate(() => document.querySelector('.view.active')?.id + ' tab=' + (document.querySelector('.tab.aktiv')?.id||'-') + ' leiste=' + !document.getElementById('tabLeiste').hidden + ' pfeil=' + !document.getElementById('btnNavZurueck').hidden);
for (const [breite, sprache] of [[390,'de'],[320,'tr'],[320,'ja']]){
  const ctx = await b.newContext({viewport:{width:breite,height:780}, isMobile:true, hasTouch:true, colorScheme:'dark'});
  await ctx.addInitScript(appBruecke, false);
  await ctx.addInitScript(l => { try{ localStorage.setItem('lucenta_lang', l); }catch(e){} }, sprache);
  const p = await ctx.newPage(); const fehler = []; p.on('pageerror', e => fehler.push(e.message));
  await p.goto('file://' + process.cwd() + '/dist/lucenta.html'); await p.waitForTimeout(900);
  const log = [];
  for (const t of ['#tabTagesform','#tabVerstehen','#tabFreunde','#tabProfil']){ await klick(p,t); log.push(t+' -> '+await ansicht(p)); }
  await klick(p,'#tabProfil'); // aktiver Reiter
  await klick(p,'#btnProfilEinstellungen'); log.push('Einstellungen -> '+await ansicht(p));
  await klick(p,'#btnEinstPlus'); log.push('Plus aus Einst. -> '+await ansicht(p)+' pille='+await p.evaluate(()=>document.getElementById('navZurueckText').textContent));
  await klick(p,'#btnNavZurueck'); log.push('zurueck -> '+await ansicht(p));
  await klick(p,'#btnNavZurueck'); log.push('zurueck -> '+await ansicht(p));
  await klick(p,'#btnProfilPlus'); log.push('Plus aus Profil -> '+await ansicht(p)+' pille='+await p.evaluate(()=>document.getElementById('navZurueckText').textContent));
  await klick(p,'#tabVerstehen'); await klick(p,'#btnVsArchetypen'); log.push('Archetypen -> '+await ansicht(p));
  await klick(p,'#btnNavZurueck'); log.push('zurueck -> '+await ansicht(p));
  await klick(p,'#tabStart'); await klick(p,'#btnStart'); log.push('Test -> '+await ansicht(p));
  // Masse der Leiste
  await klick(p,'#btnBackLanding');
  const m = await p.evaluate(() => [...document.querySelectorAll('.tab-name')].map(e => e.textContent + (e.scrollWidth > e.clientWidth ? '(gekuerzt)' : '')).join(' | ') + '  hoehe=' + Math.round(document.getElementById('tabLeiste').getBoundingClientRect().height) + ' breite=' + Math.round(document.getElementById('tabLeiste').getBoundingClientRect().width));
  console.log(`== ${breite}/${sprache}\n` + log.join('\n') + '\n' + m + (fehler.length ? '\nFEHLER: '+fehler.join('; ') : ''));
  if (breite === 390){
    await klick(p,'#tabProfil');
    await p.screenshot({path:'/tmp/tab-profil.jpg', type:'jpeg', quality:70});
  }
  await ctx.close();
}
await b.close();

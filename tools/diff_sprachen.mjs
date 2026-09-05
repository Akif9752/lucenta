// Sprachvergleich im echten Browser.
//
// Entstanden aus Runde 59: Eine Nutzerin sah "ALLTAG · BEZIEHUNGEN · WACHSTUM" auf der
// englischen Ergebnisseite, waehrend alle zehn Reihen und alle acht statischen Pruefungen
// gruen waren. Der Grund war doppelt — die statische Pruefung suchte nach einer von Hand
// gepflegten Wortliste, auf der "Alltag" nicht stand, und keine automatische Kontrolle hatte
// die Ergebnisansicht je auf Englisch geoeffnet.
//
// Dieses Werkzeug raet nicht. Es faehrt jede Ansicht mit demselben Datenbestand einmal auf
// Deutsch und einmal auf Englisch ab und meldet jede Textzeile und jedes Attribut, die in
// beiden Sprachen ZEICHENGLEICH sind. Was uebersetzt ist, unterscheidet sich; was gleich
// bleibt, ist entweder ein bewusster Gleichstand (Eigennamen, Abkuerzungen, Woerter wie
// "optional") oder ein vergessener Text.
//
// Braucht einen Browser und laeuft deshalb nicht in "npm test":
//   npx http-server dist -p 8017 -s &
//   node tools/diff_sprachen.mjs
//
// Erwarteter Rest (Stand Runde 59): 25 Zeilen, alle geprueft und berechtigt — die englischen
// Unterschriften der OCEAN-Kacheln, die Abkuerzungen EXTRA./STABIL., "Extraversion",
// "optional", "NAME", "Deutsch", "English", "System", "Test". Waechst diese Zahl, ist etwas
// neu hinzugekommen, das nicht uebersetzt wird.

// Playwright liegt je nach Rechner lokal oder global. ESM beachtet NODE_PATH nicht, deshalb
// wird ueber createRequire aufgeloest — und mit einem lesbaren Hinweis abgebrochen, statt mit
// ERR_MODULE_NOT_FOUND.
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require_ = createRequire(import.meta.url);
let pkg;
for (const ort of ['playwright', process.env.PLAYWRIGHT_PFAD].filter(Boolean)) {
  try { pkg = require_(ort); break; } catch (e) {}
}
if (!pkg) {
  try {
    const global_ = execSync('npm root -g', {encoding:'utf8'}).trim();
    pkg = require_(global_ + '/playwright');
  } catch (e) {
    console.error('Playwright nicht gefunden. Entweder "npm i -D playwright" im Projekt,');
    console.error('oder PLAYWRIGHT_PFAD auf eine vorhandene Installation zeigen lassen.');
    process.exit(2);
  }
}
const { chromium } = pkg;
const b=await chromium.launch({...(process.env.CHROMIUM_PFAD?{executablePath:process.env.CHROMIUM_PFAD}:{})});
const ctx=await b.newContext({viewport:{width:1280,height:1000}});
const p=await ctx.newPage(); const logs=[];
p.on('pageerror',e=>logs.push('PAGEERROR '+e.message));
await p.goto('http://127.0.0.1:8017/lucenta.html',{waitUntil:'networkidle'});

// Datenbestand: Ergebnis, Verlauf, Tagesform, Profil, gespeicherter Vergleich
await p.click('#btnStart'); await p.waitForTimeout(500);
{const r=await p.$('#btnRunSelf'); if(r&&await r.isVisible()){await r.click();await p.waitForTimeout(500);}}
for(let i=0;i<50;i++){const bs=await p.$$('#scaleRow .scale-btn'); if(!bs.length)break;
  await bs[i%5].click(); await p.waitForTimeout(340);}
await p.waitForTimeout(2500);
{const ok=await p.evaluate(()=>!!localStorage.getItem('lucenta_result'));
 if(!ok) throw new Error('Fragebogen nicht durchgelaufen — kein Ergebnis gespeichert');
 console.log('Ergebnis erzeugt.');}
await p.evaluate(()=>{
  const r=JSON.parse(localStorage.getItem('lucenta_result')||'null');
  const h=JSON.parse(localStorage.getItem('lucenta_history')||'[]');
  if(r) localStorage.setItem('lucenta_history',JSON.stringify([{...r,ts:Date.now()-864e5},...h]));
  localStorage.setItem('lucenta_state',JSON.stringify([
    {energy:3,valence:4,ts:Date.now()-864e5,day:'x1'},{energy:5,valence:2,ts:Date.now(),day:'x2'}]));
  localStorage.setItem('lucenta_profile',JSON.stringify({name:'Akif'}));
});
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(900);

async function closeDrawer(){ await p.evaluate(()=>{
    const s=document.getElementById('drawerScrim'); const d=document.getElementById('btnDrawerClose');
    if(s&&s.classList.contains('show')&&d) d.click(); }); await p.waitForTimeout(400); }
async function drawer(id){ await closeDrawer(); const t=await p.$('#btnDrawerToggle');
  if(t&&await t.isVisible()){await t.click(); await p.waitForTimeout(350);}
  const e=await p.$('#'+id); if(e&&await e.isVisible()){await e.click(); await p.waitForTimeout(600); return true;}
  const c=await p.$('#btnDrawerClose'); if(c&&await c.isVisible())await c.click(); return false; }
async function home(){ await closeDrawer(); for(const s of ['#btnHome','#btnBackFromResult','#btnBackFromSettings','#btnBackFromState',
  '#btnBackFromProfile','#btnBackFromUnderstand','#btnBackFromArchetypes','#btnBackFromCompatArchive']){
  const e=await p.$(s); if(e&&await e.isVisible()){await e.click(); break;}} await p.waitForTimeout(500); }
// alles Aufklappbare oeffnen, damit auch verborgener Text erfasst wird
async function expandAll(){ await closeDrawer(); await p.evaluate(()=>{
  const v=[...document.querySelectorAll('[id^=view-]')].find(x=>getComputedStyle(x).display!=='none');
  if(!v) return;
  v.querySelectorAll('details').forEach(d=>d.open=true);
  v.querySelectorAll('.trait-more, .trait-toggle, [aria-expanded="false"]').forEach(e=>{try{e.click();}catch(x){}});
}); await p.waitForTimeout(600); }

async function grab(){ await expandAll();
  return p.evaluate(()=>{
    const v=[...document.querySelectorAll('[id^=view-]')].find(x=>getComputedStyle(x).display!=='none');
    const txt=v?v.innerText:'';
    const attrs=[...document.querySelectorAll('[aria-label],[placeholder],[title]')]
      .flatMap(e=>[e.getAttribute('aria-label'),e.getAttribute('placeholder'),e.getAttribute('title')])
      .filter(Boolean);
    return {view:v?v.id:'-', lines:txt.split('\n').map(s=>s.trim()).filter(Boolean), attrs,
      hero:(document.getElementById('btnStart')||{}).textContent,
      sec:(document.getElementById('btnHeroSecondary')||{}).textContent,
      hatProgress:!!localStorage.getItem('lucenta_progress'),
      hatResult:!!localStorage.getItem('lucenta_result')};});
}
const STOPS=['btnDrawerUnderstand','btnDrawerArchetypes','btnDrawerCompatArchive','btnDrawerProfileRow','btnDrawerSettings','btnDrawerCompare'];
async function tour(){
  const out={};
  out['landing']=await grab();
  // Mit vorhandenem Ergebnis fuehrt btnStart in die Ergebnisansicht.
  await p.click('#btnStart'); await p.waitForTimeout(900);
  out['ergebnis']=await grab();
  // Vergleich innerhalb der Ergebnisansicht: zwei Codes eintragen und rechnen lassen
  const me=await p.$('#cmpMe'), other=await p.$('#cmpOther');
  if(me&&other){
    const code=await p.evaluate(()=>{const e=document.getElementById('cmpMe');return e?e.value:'';});
    if(code){ await other.fill(code); const cb=await p.$('#btnCompare');
      if(cb&&await cb.isVisible()){ await cb.click(); await p.waitForTimeout(900);
        out['vergleich']=await grab(); } }
  }
  // Fragebogen von der Ergebnisansicht aus
  for(const s of ['#btnRetakeTop','#btnRetake']){ const e=await p.$(s);
    if(e&&await e.isVisible()){ await e.click(); await p.waitForTimeout(700); break; } }
  {const r=await p.$('#btnRunSelf'); if(r&&await r.isVisible()){ out['laufwahl']=await grab();
      await r.click(); await p.waitForTimeout(700); }}
  out['quiz']=await grab();
  {const c=await p.$('#btnRunCancel'); if(c&&await c.isVisible()){await c.click();await p.waitForTimeout(700);}}
  await home();
  const st=await p.$('#btnLandingStateHistory');
  if(st&&await st.isVisible()){await st.click();await p.waitForTimeout(700);
    out['tagesform']=await grab(); await home();}
  for(const id of STOPS){ if(await drawer(id)){ out[id]=await grab(); await home(); } }
  await home(); return out;
}
const DEv=await tour();
// Sprache wechseln
await drawer('btnDrawerSettings'); await p.click('[data-lang="en"]'); await p.waitForTimeout(900); await home();
const ENv=await tour();
await b.close();

const INVARIANT=/^[\s\d\W]*$|^(Lucenta|BETA|Beta|OCEAN|O|C|E|A|N|Akif|Big Five|IPIP|Teal|Ink|E-Mail)$/i;
console.log('\n=== Zeilen, die auf Deutsch und Englisch identisch sind ===');
let treffer=0;
for(const k of Object.keys(DEv)){
  if(!ENv[k]) continue;
  const de=new Set(DEv[k].lines), en=new Set(ENv[k].lines);
  const beide=[...de].filter(x=>en.has(x)&&!INVARIANT.test(x)&&/\p{L}{3}/u.test(x));
  const deA=new Set(DEv[k].attrs), enA=new Set(ENv[k].attrs);
  const beideA=[...deA].filter(x=>enA.has(x)&&!INVARIANT.test(x)&&/\p{L}{3}/u.test(x));
  if(beide.length||beideA.length){
    console.log('\n--- '+k+' ('+DEv[k].view+') ---');
    beide.forEach(x=>{treffer++;console.log('  TEXT   '+x.slice(0,110));});
    beideA.forEach(x=>{treffer++;console.log('  ATTR   '+x.slice(0,110));});
  }
}
console.log('\nSumme verdaechtiger Zeilen: '+treffer);
console.log('Konsole: '+(logs.join(' | ')||'(leer)'));

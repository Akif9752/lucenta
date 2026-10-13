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
// Erwarteter Rest (Stand Runde 66): 25 Zeilen, alle geprueft und berechtigt — die englischen
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
const URL = process.env.LUCENTA_URL || 'http://127.0.0.1:8017/lucenta.html';
// Runde 103: Die acht Rundgaenge liefen nacheinander auf EINER Seite — 6,4 Minuten, und damit
// der laengste Posten der ganzen Pflichtrunde. Sie sind aber voneinander unabhaengig: Jeder
// braucht nur denselben Datenbestand, und der liegt vollstaendig im localStorage.
//
// Deshalb jetzt: Der Bestand wird EINMAL erzeugt (der Fragebogen muss dafuer wirklich
// durchlaufen werden, 50 Antworten), danach ausgelesen und jeder Sprache als eigener Kontext
// mitgegeben. Vier laufen gleichzeitig.
//
// Der Beleg, dass der Umbau nichts an der MESSUNG geaendert hat, sind die Zahlen: Vor dem Umbau
// 32/19/24/15/14/10/13, Summe 127. Sie muessen gleich bleiben — ein Rundgang, der unter Last
// eine Ansicht verpasst, faellt genau daran auf.
const GLEICHZEITIG = Math.max(1, Number(process.env.LUCENTA_PARALLEL || 4));
const b=await chromium.launch({...(process.env.CHROMIUM_PFAD?{executablePath:process.env.CHROMIUM_PFAD}:{})});
const logs=[];
const FENSTER={viewport:{width:1280,height:1000}};

// ---------- die Helfer, seit Runde 103 mit der Seite als Argument ----------
async function closeDrawer(p){ await p.evaluate(()=>{
    const s=document.getElementById('drawerScrim'); const d=document.getElementById('btnDrawerClose');
    if(s&&s.classList.contains('show')&&d) d.click(); }); await p.waitForTimeout(400); }
async function drawer(p,id){ await closeDrawer(p); const t=await p.$('#btnDrawerToggle');
  if(t&&await t.isVisible()){await t.click(); await p.waitForTimeout(350);}
  const e=await p.$('#'+id); if(e&&await e.isVisible()){await e.click(); await p.waitForTimeout(600); return true;}
  const c=await p.$('#btnDrawerClose'); if(c&&await c.isVisible())await c.click(); return false; }
async function home(p){ await closeDrawer(p); for(const s of ['#btnHome','#btnBackFromResult','#btnBackFromSettings','#btnBackFromState',
  '#btnBackFromProfile','#btnBackFromUnderstand','#btnBackFromArchetypes','#btnBackFromCompatArchive']){
  const e=await p.$(s); if(e&&await e.isVisible()){await e.click(); break;}} await p.waitForTimeout(500); }
// alles Aufklappbare oeffnen, damit auch verborgener Text erfasst wird
async function expandAll(p){ await closeDrawer(p); await p.evaluate(()=>{
  const v=[...document.querySelectorAll('[id^=view-]')].find(x=>getComputedStyle(x).display!=='none');
  if(!v) return;
  v.querySelectorAll('details').forEach(d=>d.open=true);
  v.querySelectorAll('.trait-more, .trait-toggle, [aria-expanded="false"]').forEach(e=>{try{e.click();}catch(x){}});
}); await p.waitForTimeout(600); }

async function grab(p){ await expandAll(p);
  return p.evaluate(()=>{
    const v=[...document.querySelectorAll('[id^=view-]')].find(x=>getComputedStyle(x).display!=='none');
    const txt=v?v.innerText:'';
    // Nur die aktive Ansicht, genau wie beim Text. Zuvor wurde das ganze Dokument gelesen und
    // damit auch verborgene Ansichten — die Ergebnisansicht behält nach einem Sprachwechsel ihr
    // altes aria-label, bis sie das nächste Mal geöffnet und dabei neu gerendert wird. Das ist
    // für niemanden sichtbar (ein Screenreader liest display:none nicht) und wurde trotzdem als
    // Fehler gemeldet. Was nicht dargestellt wird, ist auch nicht zu prüfen.
    const attrs=[...(v?v.querySelectorAll('[aria-label],[placeholder],[title]'):[])]
      .flatMap(e=>[e.getAttribute('aria-label'),e.getAttribute('placeholder'),e.getAttribute('title')])
      .filter(Boolean);
    return {view:v?v.id:'-', lines:txt.split('\n').map(s=>s.trim()).filter(Boolean), attrs,
      hero:(document.getElementById('btnStart')||{}).textContent,
      sec:(document.getElementById('btnHeroSecondary')||{}).textContent,
      hatProgress:!!localStorage.getItem('lucenta_progress'),
      hatResult:!!localStorage.getItem('lucenta_result')};});
}
const STOPS=['btnDrawerUnderstand','btnDrawerArchetypes','btnDrawerCompatArchive','btnDrawerProfileRow','btnDrawerSettings','btnDrawerCompare'];
async function tour(p){
  const out={};
  out['landing']=await grab(p);
  // Mit vorhandenem Ergebnis fuehrt btnStart in die Ergebnisansicht.
  await p.click('#btnStart'); await p.waitForTimeout(900);
  out['ergebnis']=await grab(p);
  // Vergleich innerhalb der Ergebnisansicht: zwei Codes eintragen und rechnen lassen
  const me=await p.$('#cmpMe'), other=await p.$('#cmpOther');
  if(me&&other){
    const code=await p.evaluate(()=>{const e=document.getElementById('cmpMe');return e?e.value:'';});
    if(code){ await other.fill(code); const cb=await p.$('#btnCompare');
      if(cb&&await cb.isVisible()){ await cb.click(); await p.waitForTimeout(900);
        out['vergleich']=await grab(p); } }
  }
  // Fragebogen von der Ergebnisansicht aus
  for(const s of ['#btnRetakeTop','#btnRetake']){ const e=await p.$(s);
    if(e&&await e.isVisible()){ await e.click(); await p.waitForTimeout(700); break; } }
  {const r=await p.$('#btnRunSelf'); if(r&&await r.isVisible()){ out['laufwahl']=await grab(p);
      await r.click(); await p.waitForTimeout(700); }}
  out['quiz']=await grab(p);
  {const c=await p.$('#btnRunCancel'); if(c&&await c.isVisible()){await c.click();await p.waitForTimeout(700);}}
  await home(p);
  const st=await p.$('#btnLandingStateHistory');
  if(st&&await st.isVisible()){await st.click();await p.waitForTimeout(700);
    out['tagesform']=await grab(p); await home(p);}
  for(const id of STOPS){ if(await drawer(p,id)){ out[id]=await grab(p); await home(p); } }
  await home(p); return out;
}

// ---------- den Datenbestand einmal erzeugen und mitnehmen ----------
const vorlauf=await b.newContext(FENSTER);
const p0=await vorlauf.newPage();
p0.on('pageerror',e=>logs.push('PAGEERROR '+e.message));
await p0.goto(URL,{waitUntil:'networkidle'});

// Datenbestand: Ergebnis, Verlauf, Tagesform, Profil, gespeicherter Vergleich
await p0.click('#btnStart'); await p0.waitForTimeout(500);
{const r=await p0.$('#btnRunSelf'); if(r&&await r.isVisible()){await r.click();await p0.waitForTimeout(500);}}
for(let i=0;i<50;i++){const bs=await p0.$$('#scaleRow .scale-btn'); if(!bs.length)break;
  await bs[i%5].click(); await p0.waitForTimeout(340);}
await p0.waitForTimeout(2500);
{const ok=await p0.evaluate(()=>!!localStorage.getItem('lucenta_result'));
 if(!ok) throw new Error('Fragebogen nicht durchgelaufen — kein Ergebnis gespeichert');
 console.log('Ergebnis erzeugt.');}
await p0.evaluate(()=>{
  const r=JSON.parse(localStorage.getItem('lucenta_result')||'null');
  const h=JSON.parse(localStorage.getItem('lucenta_history')||'[]');
  if(r) localStorage.setItem('lucenta_history',JSON.stringify([{...r,ts:Date.now()-864e5},...h]));
  localStorage.setItem('lucenta_state',JSON.stringify([
    {energy:3,valence:4,ts:Date.now()-864e5,day:'x1'},{energy:5,valence:2,ts:Date.now(),day:'x2'}]));
  localStorage.setItem('lucenta_profile',JSON.stringify({name:'Akif'}));
});
// Der ganze Bestand als schlichte Tabelle. Die gewaehlte Sprache gehoert NICHT dazu: Jeder
// Rundgang stellt seine selbst ein, und ein mitgeschleppter Eintrag wuerde dem widersprechen.
const ZUSTAND=await p0.evaluate(()=>{const o={};
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i); if(k!=='lucenta_lang') o[k]=localStorage.getItem(k);}
  return o;});
// Runde 78: Verglichen wurde Deutsch gegen Englisch. Bei sieben Sprachen muss JEDE gegen die
// Rueckfallsprache stehen — eine unuebersetzte Zeile faellt sonst genau in den Paketen nicht
// auf, die neu und damit am ehesten unvollstaendig sind. Ohne Argument laufen alle vorhandenen;
// "node tools/diff_sprachen.mjs es fr" prueft gezielt einzelne.
const VORHANDEN=await p0.evaluate(()=>
  Array.from(document.querySelectorAll('[data-lang]')).map(b=>b.getAttribute('data-lang')));
await vorlauf.close();

const ZIELE=(process.argv.slice(2).length?process.argv.slice(2):VORHANDEN).filter(c=>c!=='de');

// ---------- je Sprache ein eigener Kontext ----------
async function rundgang(code){
  const ctx=await b.newContext(FENSTER);
  // Der Bestand muss VOR dem ersten Skript der Seite stehen, sonst laeuft die App einmal leer an.
  await ctx.addInitScript(z=>{try{for(const k in z) localStorage.setItem(k,z[k]);}catch(e){}},ZUSTAND);
  const p=await ctx.newPage();
  p.on('pageerror',e=>logs.push('PAGEERROR ['+code+'] '+e.message));
  await p.goto(URL,{waitUntil:'networkidle'});
  await p.waitForTimeout(900);
  if(code!=='de'){
    await drawer(p,'btnDrawerSettings'); await p.click('#btnSpracheOeffnen'); await p.waitForTimeout(600); await p.click('[data-lang="'+code+'"]');
    await p.waitForTimeout(900); await home(p);
  }
  const t=await tour(p);
  await ctx.close();
  return t;
}

const alle=['de',...ZIELE];
const gefahren={};
let naechste=0;
async function arbeiter(){
  while(true){
    const i=naechste++;
    if(i>=alle.length) return;
    gefahren[alle[i]]=await rundgang(alle[i]);
    console.log('  Rundgang fertig: '+alle[i]);
  }
}
await Promise.all(Array.from({length:Math.min(GLEICHZEITIG,alle.length)},arbeiter));
await b.close();

const DEv=gefahren['de'];
const ANDERE={};
for(const code of ZIELE) ANDERE[code]=gefahren[code];


const INVARIANT=/^[\s\d\W]*$|^(Lucenta|BETA|Beta|OCEAN|O|C|E|A|N|Akif|Big Five|IPIP|Teal|Ink|E-Mail)$/i;
let treffer=0;
for (const code of ZIELE){
  const ENv = ANDERE[code];
  console.log('\n=== Zeilen, die auf Deutsch und in "'+code+'" identisch sind ===');
  let hier=0;
  for(const k of Object.keys(DEv)){
    if(!ENv || !ENv[k]) continue;
    const de=new Set(DEv[k].lines), en=new Set(ENv[k].lines);
    const beide=[...de].filter(x=>en.has(x)&&!INVARIANT.test(x)&&/\p{L}{3}/u.test(x));
    const deA=new Set(DEv[k].attrs), enA=new Set(ENv[k].attrs);
    const beideA=[...deA].filter(x=>enA.has(x)&&!INVARIANT.test(x)&&/\p{L}{3}/u.test(x));
    if(beide.length||beideA.length){
      console.log('\n--- '+k+' ('+DEv[k].view+') ---');
      beide.forEach(x=>{hier++;console.log('  TEXT   '+x.slice(0,110));});
      beideA.forEach(x=>{hier++;console.log('  ATTR   '+x.slice(0,110));});
    }
  }
  console.log('\n  Summe fuer '+code+': '+hier);
  treffer+=hier;
}
console.log('\nSumme verdaechtiger Zeilen ueber alle Sprachen: '+treffer);
console.log('Konsole: '+(logs.join(' | ')||'(leer)'));

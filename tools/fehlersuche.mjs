// Sucht im echten Browser nach Fehlern, die keine der anderen Pruefreihen sehen kann.
//
// Die Einheitentests laufen gegen eine nachgebaute Seite und kennen kein Layout. Der
// Sprachvergleich sieht nur Text. Die Bewegungspruefung misst Zeitverlaeufe. Was uebrig
// bleibt, ist alles, was erst entsteht, wenn echtes CSS auf echten Inhalt trifft:
// Elemente, die seitlich aus dem Bildschirm ragen; Schaltflaechen, die zu klein zum Treffen
// sind; Knoepfe ohne lesbaren Namen; doppelte Kennungen; Reste einer Ersetzung im Text;
// versteckte Ansichten, die trotzdem mit der Tabulatortaste erreichbar sind.
//
// Laeuft ueber alle Ansichten, in beiden Farbschemata, einmal leer und einmal mit der
// Beispielnutzerin — leere und volle Ansichten sind verschiedene Layouts.
//
//   python3 -m http.server 8017 --directory dist &
//   node tools/fehlersuche.mjs

import { createRequire } from 'module';
import { execSync } from 'child_process';
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
const START = process.env.CHROMIUM_PFAD ? {executablePath: process.env.CHROMIUM_PFAD} : {};

// Die kleinste Flaeche, die Apple in den Richtlinien fuer eine Schaltflaeche nennt.
const MIN_TIPP = 44;
const BREITE = 390, HOEHE = 844;

const fehler = [];
const gesehen = new Set();
function melde(text){
  if (gesehen.has(text)) return;   // derselbe Fund in zwei Durchlaeufen ist ein Fund
  gesehen.add(text);
  fehler.push(text);
  console.log('  FUND  ' + text);
}
function ok(text){ console.log('  ok    ' + text); }

// ---------- die einzelnen Pruefungen, alle im Browser ausgefuehrt ----------

// Ragt etwas seitlich heraus? Gemessen wird der sichtbare Inhalt der aktiven Ansicht.
const suchUeberlauf = (breite) => {
  const raus = [];
  const v = document.querySelector('.view.active');
  if (!v) return raus;
  v.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    // Was ausdruecklich seitlich rollen darf, darf auch breiter sein.
    let p = el, rollt = false;
    while (p && p !== document.body){
      const s = getComputedStyle(p);
      if (s.overflowX === 'auto' || s.overflowX === 'scroll'){ rollt = true; break; }
      p = p.parentElement;
    }
    if (rollt) return;
    if (r.right > breite + 1 || r.left < -1){
      raus.push((el.id ? '#'+el.id : el.tagName.toLowerCase()+'.'+(el.className||'').toString().split(' ')[0]) +
                ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ']');
    }
  });
  return raus.slice(0, 6);
};

// Zu kleine Tippflaechen in der aktiven Ansicht.
//
// Gemessen wird NICHT der Kasten des Elements. Seit Runde 60 vergroessert die App die
// Trefferflaeche kleiner Bedienelemente mit einem ::after, das im Kasten nicht auftaucht —
// eine Messung am Kasten haette genau die Stellen gemeldet, an denen das Problem laengst
// geloest ist, und die uebrigen im Rauschen untergehen lassen.
//
// Stattdessen wird getastet: Trifft ein Tipp 21 Pixel ueber, unter, links und rechts von der
// Mitte noch dasselbe Bedienelement? Das ist dieselbe Frage, die ein Daumen stellt, und sie
// beantwortet nebenbei auch, ob etwas anderes davorliegt.
const suchTippflaechen = (min) => {
  const klein = [];
  const v = document.querySelector('.view.active');
  if (!v) return klein;
  const halb = Math.floor(min/2) - 1;
  v.querySelectorAll('button, a[href], input, select, [role="switch"], [role="button"]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (getComputedStyle(el).visibility === 'hidden') return;
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) return;   // ausserhalb des Bildes
    const trifft = (x, y) => {
      if (x < 0 || y < 0 || x > innerWidth - 1 || y > innerHeight - 1) return false;
      const t = document.elementFromPoint(x, y);
      return !!t && (t === el || el.contains(t) || t.parentElement === el);
    };
    const fehlt = [];
    if (!trifft(cx, cy - halb) || !trifft(cx, cy + halb)) fehlt.push('hoch');
    if (!trifft(cx - halb, cy) || !trifft(cx + halb, cy)) fehlt.push('breit');
    if (fehlt.length){
      klein.push((el.id ? '#'+el.id : el.tagName.toLowerCase()+'.'+(el.className||'').toString().split(' ')[0]) +
                 ' ' + Math.round(r.width) + '×' + Math.round(r.height) + ' zu wenig: ' + fehlt.join('+'));
    }
  });
  return klein.slice(0, 10);
};

// Schaltflaechen ohne lesbaren Namen — fuer Sprachausgabe unbenutzbar.
const suchNamenlos = () => {
  const ohne = [];
  const v = document.querySelector('.view.active');
  if (!v) return ohne;
  v.querySelectorAll('button, a[href], [role="switch"]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const name = (el.getAttribute('aria-label') || el.textContent || '').trim() ||
                 (el.getAttribute('aria-labelledby') ? 'x' : '');
    if (!name) ohne.push(el.id ? '#'+el.id : el.outerHTML.slice(0, 60));
  });
  return ohne.slice(0, 20);
};

// Reste einer Ersetzung oder eines fehlenden Wertes im sichtbaren Text.
const suchReste = () => {
  const v = document.querySelector('.view.active');
  if (!v) return [];
  const t = v.innerText || '';
  const muster = [/\{\{[^}]+\}\}/g, /\bundefined\b/g, /\bNaN\b/g, /\[object [A-Za-z]+\]/g, /@@[A-Z0-9_]+@@/g];
  const f = [];
  muster.forEach(m => { const tr = t.match(m); if (tr) f.push(...tr.slice(0,3)); });
  return f;
};

// Doppelte Kennungen im ganzen Dokument — sie brechen jedes $('...') stillschweigend.
const suchDoppelteIds = () => {
  const zaehl = {};
  document.querySelectorAll('[id]').forEach(el => { zaehl[el.id] = (zaehl[el.id]||0)+1; });
  return Object.keys(zaehl).filter(k => zaehl[k] > 1);
};

// Versteckte Ansichten duerfen nicht mit der Tabulatortaste erreichbar sein.
const suchVersteckteZiele = () => {
  const f = [];
  document.querySelectorAll('.view:not(.active)').forEach(v => {
    if (getComputedStyle(v).display !== 'none'){ f.push('#'+v.id+' ist nicht display:none'); return; }
  });
  return f;
};

// Text, dessen Farbe der eigenen Hintergrundfarbe entspricht — unsichtbar.
const suchUnsichtbarenText = () => {
  const f = [];
  const v = document.querySelector('.view.active');
  if (!v) return f;
  const hinter = el => {
    let p = el;
    while (p && p !== document.documentElement){
      const c = getComputedStyle(p).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
      p = p.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  v.querySelectorAll('*').forEach(el => {
    if (!el.childNodes.length) return;
    let hatText = false;
    el.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) hatText = true; });
    if (!hatText) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.color === hinter(el) && cs.opacity !== '0'){
      f.push((el.id ? '#'+el.id : el.tagName.toLowerCase()) + ' ' + cs.color);
    }
  });
  return f.slice(0, 5);
};


// Die Wege durch die Oberflaeche. Bewusst ueber echte Klicks statt ueber einen Testzugang:
// Eine Ansicht, die nur ein Testaufruf erreicht, ist fuer niemanden erreichbar. Faellt ein
// Weg weg, meldet das die Pruefung — was genau der Fund waere, den man sehen will.
const WEGE = {
  landing:    ['#btnHome'],
  profile:    ['#btnDrawerToggle', '#btnDrawerProfileRow'],
  understand: ['#btnDrawerToggle', '#btnDrawerUnderstand'],
  archetypes: ['#btnDrawerToggle', '#btnDrawerArchetypes'],
  settings:   ['#btnDrawerToggle', '#btnDrawerSettings'],
  recht:      ['#btnDrawerToggle', '#btnDrawerSettings', '#btnRecht'],
  state:      ['#btnHome', '#btnLandingStateHistory'],
  result:     ['#btnDrawerToggle', '#btnDrawerProfileRow', '#btnProfileViewResult'],
  quiz:       ['#btnHome', '#btnStart', '#btnRunSelf']
};

async function zu(p, ansicht){
  // Immer erst zurueck auf die Startseite, damit jeder Weg von derselben Stelle beginnt.
  await p.evaluate(() => { document.getElementById('btnDrawerClose')?.click(); });
  await p.waitForTimeout(200);
  await p.evaluate(() => { document.getElementById('btnHome')?.click(); });
  await p.waitForTimeout(350);
  for (const wahl of WEGE[ansicht]){
    const da = await p.evaluate(w => { const el = document.querySelector(w); if (!el) return false; el.click(); return true; }, wahl);
    if (!da) return false;
    await p.waitForTimeout(400);
  }
  await p.waitForTimeout(250);
  const jetzt = await p.evaluate(() => document.querySelector('.view.active')?.id || '');
  return jetzt === 'view-' + ansicht;
}

async function pruefeAnsicht(p, ansicht, kennung){
  for (const [name, fn, arg] of [
    ['ragt seitlich heraus', suchUeberlauf, BREITE],
    ['Tippflaeche unter ' + MIN_TIPP + 'px', suchTippflaechen, MIN_TIPP],
    ['Schaltflaeche ohne Namen', suchNamenlos, null],
    ['Rest einer Ersetzung im Text', suchReste, null],
    ['unsichtbarer Text', suchUnsichtbarenText, null],
  ]){
    const treffer = arg === null ? await p.evaluate(fn) : await p.evaluate(fn, arg);
    treffer.forEach(t => melde(kennung + ' / ' + ansicht + ': ' + name + ' — ' + t));
  }
}

// ---------- ein Durchlauf ueber alle Ansichten ----------

async function durchlauf({thema, demo, sprache}){
  const kennung = [thema, sprache, demo ? 'Beispielnutzerin' : 'leer'].join('/');
  console.log('\n' + kennung);
  const b = await chromium.launch(START);
  const ctx = await b.newContext({viewport:{width:BREITE,height:HOEHE}, isMobile:true, hasTouch:true,
    colorScheme: thema === 'dunkel' ? 'dark' : 'light'});
  const p = await ctx.newPage();
  const abstuerze = [];
  p.on('pageerror', e => abstuerze.push(e.message));
  p.on('console', m => { if (m.type() === 'error') abstuerze.push('Konsole: ' + m.text()); });
  await p.goto(URL, {waitUntil:'networkidle'});
  await p.waitForTimeout(500);

  if (sprache !== 'de'){
    await p.evaluate(s => document.querySelector('[data-lang="'+s+'"]')?.click(), sprache).catch(()=>{});
    await p.waitForTimeout(300);
  }
  if (demo){
    await p.evaluate(() => { document.getElementById('btnDrawerToggle')?.click(); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { document.getElementById('btnDrawerProfileRow')?.click(); });
    await p.waitForTimeout(400);
    const geladen = await p.evaluate(() => { const b = document.getElementById('btnDemo'); if (!b) return false; b.click(); return true; });
    if (!geladen) melde(kennung + ': Beispielnutzerin nicht ladbar (#btnDemo fehlt)');
    await p.waitForTimeout(1200);
    await p.waitForLoadState('networkidle');
    await p.waitForTimeout(400);
  }

  // Doppelte Kennungen und versteckte Ziele sind Eigenschaften des Dokuments, nicht der Ansicht.
  (await p.evaluate(suchDoppelteIds)).forEach(id => melde(kennung + ': Kennung doppelt vergeben — #' + id));
  (await p.evaluate(suchVersteckteZiele)).forEach(t => melde(kennung + ': ' + t));

  for (const ansicht of Object.keys(WEGE)){
    const angekommen = await zu(p, ansicht);
    if (!angekommen){ melde(kennung + ': Ansicht "' + ansicht + '" ueber die Oberflaeche nicht erreichbar'); continue; }
    await pruefeAnsicht(p, ansicht, kennung);
  }

  abstuerze.forEach(a => melde(kennung + ': Ausnahme — ' + a));
  if (!abstuerze.length) ok(kennung + ': keine Ausnahme');
  await b.close();
}

const laeufe = [
  {thema:'hell',   demo:false, sprache:'de'},
  {thema:'dunkel', demo:false, sprache:'de'},
  {thema:'hell',   demo:true,  sprache:'de'},
  {thema:'dunkel', demo:true,  sprache:'de'},
  {thema:'hell',   demo:true,  sprache:'ja'},
  {thema:'hell',   demo:true,  sprache:'fr'},
];
for (const l of laeufe) await durchlauf(l);

console.log('\n======================================================');
if (fehler.length){
  console.log(fehler.length + ' FUNDE');
  process.exit(1);
} else {
  console.log('KEINE FUNDE');
}

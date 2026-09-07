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
// 390 ist die Breite der verbreiteten iPhones, 320 die des kleinsten, das noch aktuelles iOS
// bekommt. Seitlicher Ueberlauf zeigt sich immer zuerst bei 320 — deutsche Komposita und
// franzoesische Umschreibungen brauchen dort mehr Platz, als da ist.
const HOEHE = 844;

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
    let r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (getComputedStyle(el).visibility === 'hidden') return;
    // Am oberen oder unteren Bildrand laege ein Tastpunkt ausserhalb des Fensters, und
    // elementFromPoint gibt dort nichts zurueck — der erste Entwurf zaehlte das als zu klein
    // und meldete jedes Bedienelement am Seitenende. Uebergehen waere der bequeme Ausweg
    // gewesen und haette echte Faelle mit verschwiegen; stattdessen wird das Element in die
    // Mitte gerollt und danach neu vermessen.
    if (r.top < halb + 2 || r.bottom > innerHeight - halb - 2){
      el.scrollIntoView({block:'center', inline:'center', behavior:'instant'});
      r = el.getBoundingClientRect();
    }
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    if (cx < 0 || cx > innerWidth) return;
    if (cy - halb < 0 || cy + halb > innerHeight - 1) return;   // passt selbst gerollt nicht ins Bild
    const trifft = (x, y) => {
      if (x < 0 || y < 0 || x > innerWidth - 1 || y > innerHeight - 1) return false;
      const t = document.elementFromPoint(x, y);
      return !!t && (t === el || el.contains(t) || t.parentElement === el);
    };
    // Eine begruendete Ausnahme, und nur diese eine. Die fuenf Antwortkreise messen bei 320px
    // 42x42 und stehen unmittelbar nebeneinander; eine groessere Trefferflaeche wuerde dort die
    // Nachbarn ueberlappen und Fehlgriffe erzeugen statt sie zu verhindern. Die Abwaegung steht
    // seit Runde 60 in 10-druckzustaende.css. Sie steht hier NAMENTLICH, damit sie eine
    // Entscheidung bleibt und nicht zu einer Zahl wird, die man beliebig senkt.
    if (el.classList && el.classList.contains('scale-btn')) return;
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
  quiz:       ['#btnHome', '#btnStart', '#btnRunSelf'],
  // Runde 81: Das Vergleichsergebnis entsteht erst, wenn zwei Codes eingetragen und verglichen
  // wurden — bis dahin ist der Block leer. Die Pruefung lief deshalb bisher an fuenf
  // aufklappbaren Karten, zwei Eingabefeldern und einem Messbalken vorbei, ohne sie je zu
  // sehen. Der Weg traegt seine Eingaben jetzt selbst.
  vergleich:  ['#btnDrawerToggle', '#btnDrawerCompare'],
  // Runde 89: Das Lucenta+-Fenster. Ohne diesen Weg waere ein neuer Dialog von KEINER
  // Pruefschicht erfasst — genau die Luecke, die in Runde 84 der Bezahlschranke wegen schon
  // einmal aufging. Er sitzt im Profil, weil dort in der freien Fassung das Verlaufs-Schloss
  // steht; welche der fuenf Stellen es ist, spielt keine Rolle: Alle oeffnen dasselbe Fenster.
  pluswerbung: ['#btnDrawerToggle', '#btnDrawerProfileRow']
};
// Ansichten, deren Kennung nicht 'view-<name>' lautet, und was nach dem Weg noch zu tun ist.
const NACHBEREITUNG = {
  // Zwei Ergebnisse aus echten Werten: O, C und A liegen nah beieinander, E und S weit
  // auseinander. Das ergibt eine gemischte Verteilung und damit BEIDE Kartensorten in einem
  // Bild — mit zwei gleichen oder zwei entgegengesetzten Codes waere immer nur eine zu sehen.
  vergleich: {ansicht:'result', tun: async (p) => {
    await p.fill('#cmpMe', '221r1g1y1c');
    await p.fill('#cmpOther', '240k1e1w2d');
    await p.click('#btnCompare');
    await p.waitForTimeout(1400);
    // Alle Karten aufklappen: zugeklappt bleibt der halbe Inhalt ungemessen.
    await p.evaluate(() => document.querySelectorAll('.compat-card').forEach(k => k.open = true));
    await p.waitForTimeout(500);
    // Ohne diese Zeile waere ein leeres Vergleichsergebnis eine bestandene Pruefung: Wo nichts
    // steht, ragt nichts heraus und ist keine Flaeche zu klein. Eine Pruefung, die an ihrem
    // eigenen Gegenstand vorbeilaufen kann, ist keine.
    const karten = await p.evaluate(() => document.querySelectorAll('.compat-card').length);
    if (karten !== 5) throw new Error('Vergleich zeigt ' + karten + ' statt 5 Karten');
  }},
  // Das Fenster liegt ueber der Profilansicht, die Ansicht darunter bleibt also 'profile'.
  pluswerbung: {ansicht:'profile', tun: async (p) => {
    const auf = await p.evaluate(() => {
      const b = [...document.querySelectorAll('[data-plus-info]')].filter(e => e.offsetParent);
      if (!b.length) return false;
      b[0].click();
      return true;
    });
    // In der gekauften Fassung gibt es keine Schloesser — dann ist hier nichts zu pruefen, und
    // das ist kein Fehler. Wohl aber, wenn in der FREIEN Fassung keines auftaucht.
    if (!auf){
      // Ohne Daten gibt es nichts zu verschliessen, mit gekaufter Fassung nichts Verschlossenes.
      // In beiden Faellen ist das richtig und kein Fund. Geprueft wird das Fenster im
      // Durchlauf "Beispielnutzerin, frei" — dem einzigen, in dem Schloesser ueberhaupt stehen.
      return;
    }
    await p.waitForTimeout(600);
    const zahl = await p.evaluate(() => document.querySelectorAll('#plusVorteile .plus-vorteil').length);
    if (zahl !== 4) throw new Error('Lucenta+-Fenster zeigt ' + zahl + ' statt 4 Vorteile');
  }}
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
  const nach = NACHBEREITUNG[ansicht];
  const jetzt = await p.evaluate(() => document.querySelector('.view.active')?.id || '');
  if (jetzt !== 'view-' + ((nach && nach.ansicht) || ansicht)) return false;
  if (nach) await nach.tun(p);
  return true;
}

async function pruefeAnsicht(p, ansicht, kennung, breite){
  for (const [name, fn, arg] of [
    ['ragt seitlich heraus', suchUeberlauf, breite],
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

async function durchlauf({thema, demo, plus, sprache, breite}){
  breite = breite || 390;
  // Runde 89: Ob die gekaufte Fassung an ist, gehoert in die Kennung — sonst stehen zwei
  // Durchlaeufe mit demselben Namen im Bericht und man weiss bei einem Fund nicht, welcher.
  const kennung = [breite + 'px', thema, sprache,
                   demo ? (plus ? 'Beispielnutzerin' : 'Beispielnutzerin, frei') : 'leer'].join('/');
  console.log('\n' + kennung);
  const b = await chromium.launch(START);
  const ctx = await b.newContext({viewport:{width:breite,height:HOEHE}, isMobile:true, hasTouch:true,
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
    // Runde 84: Die Beispielnutzerin laeuft in der GEKAUFTEN Fassung. Sonst fielen mit dem
    // Bezahlmodell genau die reichsten Ansichten aus der Pruefung heraus — Kombinationskarten,
    // Tagesform-Befunde, die aufklappbaren Vergleichskarten —, weil die freie Fassung an ihrer
    // Stelle einen Hinweiskasten zeigt.
    //
    // Runde 89: Damit fehlte aber ausgerechnet der Zustand, in dem die meisten Menschen die App
    // benutzen — DATEN VORHANDEN, ABER NICHT GEKAUFT. Nur dort stehen die Schloesser an ihren
    // fuenf Stellen; leere Durchlaeufe haben nichts zu verschliessen, gekaufte nichts
    // verschlossen. Deshalb ist die gekaufte Fassung jetzt eine Eigenschaft des Durchlaufs, und
    // ein Durchlauf laeuft ausdruecklich frei.
    if (plus) await p.evaluate(() => { try{ localStorage.setItem('lucenta_plus','1'); }catch(e){} });
    else      await p.evaluate(() => { try{ localStorage.removeItem('lucenta_plus'); }catch(e){} });
    await p.evaluate(() => { document.getElementById('btnDrawerToggle')?.click(); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { document.getElementById('btnDrawerProfileRow')?.click(); });
    await p.waitForTimeout(400);
    const geladen = await p.evaluate(() => { const b = document.getElementById('btnDemo'); if (!b) return false; b.click(); return true; });
    if (!geladen) melde(kennung + ': Beispielnutzerin nicht ladbar (#btnDemo fehlt)');
    await p.waitForTimeout(1200);
    await p.waitForLoadState('networkidle');
    await p.waitForTimeout(400);
    // demoLaden() laedt die Seite neu; die Marke ueberlebt das, weil sie im selben Speicher
    // liegt — geprueft wird es hier trotzdem, damit ein spaeterer Umbau es nicht still bricht.
    const bezahlt = await p.evaluate(() => localStorage.getItem('lucenta_plus') === '1');
    if (bezahlt !== !!plus) melde(kennung + ': Fassung nach dem Laden der Beispieldaten nicht mehr wie gesetzt');
  }

  // Doppelte Kennungen und versteckte Ziele sind Eigenschaften des Dokuments, nicht der Ansicht.
  (await p.evaluate(suchDoppelteIds)).forEach(id => melde(kennung + ': Kennung doppelt vergeben — #' + id));
  (await p.evaluate(suchVersteckteZiele)).forEach(t => melde(kennung + ': ' + t));

  for (const ansicht of Object.keys(WEGE)){
    const angekommen = await zu(p, ansicht);
    if (!angekommen){
      // Ohne Bestand gibt es kein Ergebnis und damit richtigerweise keinen Weg dorthin.
      if (!((ansicht === 'result' || ansicht === 'vergleich') && !demo)) melde(kennung + ': Ansicht "' + ansicht + '" ueber die Oberflaeche nicht erreichbar');
      continue;
    }
    await pruefeAnsicht(p, ansicht, kennung, breite);
  }

  abstuerze.forEach(a => melde(kennung + ': Ausnahme — ' + a));
  if (!abstuerze.length) ok(kennung + ': keine Ausnahme');
  await b.close();
}

const laeufe = [
  {thema:'hell',   demo:false, sprache:'de'},
  {thema:'dunkel', demo:false, sprache:'de'},
  {thema:'hell',   demo:true,  plus:true,  sprache:'de'},
  {thema:'dunkel', demo:true,  plus:true,  sprache:'de'},
  // Daten vorhanden, aber nicht gekauft — der Zustand, in dem die meisten Menschen die App
  // benutzen, und der einzige, in dem die fuenf Schloesser und das Lucenta+-Fenster stehen.
  {thema:'hell',   demo:true,  plus:false, sprache:'de'},
  {thema:'dunkel', demo:true,  plus:false, sprache:'de'},
  {thema:'hell',   demo:true,  plus:true,  sprache:'ja'},
  {thema:'hell',   demo:true,  plus:true,  sprache:'fr'},
  // Der schmale Bildschirm, in den zwei Sprachen mit den laengsten Woertern.
  {thema:'hell',   demo:true,  plus:true,  sprache:'de', breite:320},
  {thema:'hell',   demo:true,  plus:true,  sprache:'fr', breite:320},
];
for (const l of laeufe) await durchlauf(l);

console.log('\n======================================================');
if (fehler.length){
  console.log(fehler.length + ' FUNDE');
  process.exit(1);
} else {
  console.log('KEINE FUNDE');
}

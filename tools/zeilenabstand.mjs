// Sucht mehrzeiligen Text mit zu engem Zeilenabstand (unter 1,3; Titel ab 22 px unter 1,1) auf allen
// Hauptseiten, mit Beispieldaten und Lucenta+. Knoepfe zaehlen nicht (ihre Hoehe ist Innenabstand).
// Server auf 8017 noetig. Aufruf: node tools/zeilenabstand.mjs

import { webkit } from 'playwright';
const b = await webkit.launch(); const p = await b.newPage({viewport:{width:390,height:844}, isMobile:true, hasTouch:true});
await p.goto('http://127.0.0.1:8017/lucenta.html'); await p.waitForTimeout(600);
await p.evaluate(() => localStorage.setItem('lucenta_plus','1'));
await p.click('#btnDrawerToggle'); await p.waitForTimeout(300); await p.click('#btnDrawerProfileRow'); await p.waitForTimeout(500);
await p.click('#btnDemo'); await p.waitForTimeout(1800);
const messe = () => p.evaluate(() => {
  const out = new Map();
  for (const el of document.querySelector('.view.active').querySelectorAll('*')) {
    if (el.closest('button, .btn, svg')) continue;
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 12)) continue;
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const fs = parseFloat(cs.fontSize); const lh = cs.lineHeight === 'normal' ? fs * 1.2 : parseFloat(cs.lineHeight);
    const r = el.getRange ? null : el.getBoundingClientRect();
    const zeilen = Math.round((r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / lh);
    if (zeilen < 2) continue;
    const q = lh / fs, grenze = fs >= 22 ? 1.1 : 1.3;
    if (q < grenze) { const key = (el.className || el.tagName) + ''; if (!out.has(key)) out.set(key, q.toFixed(2) + ' (' + Math.round(fs) + 'px) "' + el.textContent.trim().slice(0, 40) + '"'); }
  }
  return [...out.entries()].map(([k, w]) => k + ': ' + w);
});
const wege = { start: [], ergebnis: ['#btnStart'], freunde: ['#btnDrawerToggle','#btnDrawerFreunde'], tagesform: ['#btnDrawerToggle','#btnDrawerState'],
  verstehen: ['#btnDrawerToggle','#btnDrawerUnderstand'], archetypen: ['#btnDrawerToggle','#btnDrawerArchetypes'], profil: ['#btnDrawerToggle','#btnDrawerProfileRow'],
  einstellungen: ['#btnDrawerToggle','#btnDrawerSettings'], plus: ['#btnDrawerToggle','#btnDrawerPlus'], hilfe: ['#btnDrawerToggle','#btnDrawerSettings','#btnHilfeOeffnen'] };
let n = 0;
for (const [name, w] of Object.entries(wege)) {
  await p.evaluate(() => document.getElementById('btnHome')?.click()); await p.waitForTimeout(400);
  for (const s of w) { await p.evaluate(x => document.querySelector(x)?.click(), s); await p.waitForTimeout(500); }
  await p.evaluate(() => document.querySelectorAll('.view.active details').forEach(d => d.open = true));
  await p.evaluate(async () => { for (let y = 0; y < 6000; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } });
  const f = await messe(); n += f.length; if (f.length) console.log('== ' + name + '\n  ' + f.join('\n  '));
}
console.log('Treffer', n);
await b.close();

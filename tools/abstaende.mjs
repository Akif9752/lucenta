// Sucht Ueberschriften und Beschriftungen, die zu dicht ueber dem naechsten Element stehen (Schrift-
// Unterkante bis Folgeelement: vor Kasten/Karte/Feld unter 6 px, vor Text unter 4 px),
// auf allen Hauptseiten mit Beispieldaten und Lucenta+. Server auf 8017 noetig.
// Aufruf: node tools/abstaende.mjs   (Runde 163: "freigeschaltet" auf der Lucenta+-Seite, "Ergebnis
// wiederherstellen" ueber dem Code-Kasten — beide klebten am Folgenden.)
import { webkit } from 'playwright';
const b = await webkit.launch(); const p = await b.newPage({viewport:{width:390,height:844}, isMobile:true, hasTouch:true});
await p.goto('http://127.0.0.1:8017/lucenta.html'); await p.waitForTimeout(600);
await p.evaluate(() => localStorage.setItem('lucenta_plus','1'));
await p.click('#btnDrawerToggle'); await p.waitForTimeout(300); await p.click('#btnDrawerProfileRow'); await p.waitForTimeout(500);
await p.click('#btnDemo'); await p.waitForTimeout(1800);
const messe = () => p.evaluate(() => {
  const out = [];
  const v = document.querySelector('.view.active');
  const kopf = 'h1,h2,h3,.eyebrow,.section-title,[class*="label"],[class*="titel"],[class*="title"]';
  for (const el of v.querySelectorAll(kopf)) {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || !el.offsetHeight) continue;
    if (el.closest('button, summary, svg, .btn')) continue;
    // Gewollt eng: Titel ueber Untertitel und Beschriftung ueber Zahl; „freiwillig" steht neben der Frage.
    if (el.matches('.arch-kombi-titel, .stat-label, .state-q-label')) continue;
    let n = el.nextElementSibling;
    while (n && (!n.offsetHeight || getComputedStyle(n).position === 'absolute')) n = n.nextElementSibling;
    if (!n) continue;
    // Unterkante der SCHRIFT, nicht des Rahmens: Innenabstand unten ist sichtbare Luft.
    const r = document.createRange(); r.selectNodeContents(el);
    const a = r.getBoundingClientRect(), z = n.getBoundingClientRect();
    if (!a.height || z.top < a.top + 2) continue;      // nebeneinander, nicht untereinander
    const ns = getComputedStyle(n);
    // Kasten = eigene Flaeche, Rahmen oder Eingabefeld; dort braucht es 10 px, vor Text 4 px.
    const kasten = /INPUT|TEXTAREA|DETAILS|UL/.test(n.tagName) || ns.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(ns.borderTopWidth) > 0 ||
      [...n.children].some(c => getComputedStyle(c).backgroundColor !== 'rgba(0, 0, 0, 0)' && c.getBoundingClientRect().top - z.top < 4);
    const luecke = z.top - a.bottom, grenze = kasten ? 6 : 4;   // 6–8 pt: Abschnittskopf ueber einer iOS-Gruppe
    if (luecke < grenze) out.push((kasten ? '[Kasten] ' : '[Text] ') +Math.round(luecke) + 'px  ' + (el.className || el.tagName) + ' "' + el.textContent.trim().slice(0, 30) + '" -> ' + (n.className || n.tagName));
  }
  return out;
});
const wege = { start: [], ergebnis: ['#btnStart'], freunde: ['#btnDrawerToggle','#btnDrawerFreunde'], tagesform: ['#btnDrawerToggle','#btnDrawerState'],
  verstehen: ['#btnDrawerToggle','#btnDrawerUnderstand'], archetypen: ['#btnDrawerToggle','#btnDrawerArchetypes'], profil: ['#btnDrawerToggle','#btnDrawerProfileRow'],
  einstellungen: ['#btnDrawerToggle','#btnDrawerSettings'], plus: ['#btnDrawerToggle','#btnDrawerPlus'], hilfe: ['#btnDrawerToggle','#btnDrawerSettings','#btnHilfeOeffnen'] };
let n = 0;
for (const [name, w] of Object.entries(wege)) {
  await p.evaluate(() => document.getElementById('btnHome')?.click()); await p.waitForTimeout(400);
  for (const s of w) { await p.evaluate(x => document.querySelector(x)?.click(), s); await p.waitForTimeout(500); }
  await p.evaluate(async () => { for (let y = 0; y < 6000; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } });
  const f = await messe(); n += f.length; if (f.length) console.log('== ' + name + '\n  ' + [...new Set(f)].join('\n  '));
}
console.log('Treffer', n);
await b.close();

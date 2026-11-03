// Misst je Seite, ob der Wechsel ruckelt oder die Seite danach zuckt.   node tools/ruckeln.mjs
//   Rechenzeit: wie lange showView() den Hauptfaden blockiert (> ~50 ms sieht man als Ruckeln am Uebergang).
//   Spaetes Springen: Elemente, die sich NACH dem Uebergang (ab 1,2 s) noch verschieben oder in der Groesse aendern.
// WebKit, 390 px, dunkel, Beispielnutzerin mit Lucenta+, nachgebaute App-Bruecke (alle nativen Zeilen sichtbar).
// Grenze der Messung: headless sieht keine GPU-Kosten (Unschaerfe, Glas) — die zeigt nur das Geraet.
import { webkit } from 'playwright';
const URL = process.env.LUCENTA_URL || 'http://127.0.0.1:8017/index.html';
const b = await webkit.launch();
const s = await (await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' })).newPage();
await s.route('**/index.html', async (route) => {
  const r = await route.fetch(); let t = await r.text();
  t = t.replace(/function showView\((\w+),\s*(\w+)\)\{/, (m, a, c) => 'window.__zeige=function(x,y){return showView(x,y)};' + m);
  await route.fulfill({ response: r, body: t, headers: { ...r.headers(), 'content-type': 'text/html; charset=utf-8' } });
});
await s.addInitScript(() => {
  const ok = (v) => Promise.resolve(v);
  try { localStorage.setItem('lucenta_plus', '1'); } catch (e) {}
  window.webkit = { messageHandlers: { lucentaBestand: { postMessage() {} }, lucentaWidget: { postMessage() {} } } };
  window.Capacitor = { isNativePlatform: () => true, Plugins: {
    LocalNotifications: { requestPermissions: () => ok({ display: 'granted' }), checkPermissions: () => ok({ display: 'granted' }), schedule: () => ok(), cancel: () => ok(), addListener: () => ok({ remove() {} }) },
    StoreKit: { stand: () => ok({ aktiv: true, produkt: 'lucenta.plus.jahr' }), preise: () => ok({}), kaufen: () => ok({ abgebrochen: true }), restorePurchases: () => ok({ aktiv: true }), bewerten: () => ok({}), addListener: () => ok({ remove() {} }) },
    App: { getInfo: () => ok({ version: '1.0', build: '1' }), getLaunchUrl: () => ok({}), addListener: () => ok({ remove() {} }), openUrl: () => ok() },
    Health: { stand: () => ok({ verfuegbar: true, erlaubt: false }), erlauben: () => ok({ erlaubt: false }) },
    Lock: { stand: () => ok({ verfuegbar: true, art: 'faceID', an: true, nach: 60 }), setzen: () => ok({ verfuegbar: true, art: 'faceID', an: true, nach: 60 }), texte: () => ok({}) },
    Account: { stand: () => ok({ angemeldet: false, icloud: true }), anmelden: () => ok({ angemeldet: true }) },
    AppSymbol: { stand: () => ok({ verfuegbar: true, name: '' }), setzen: (o) => ok({ name: o.name }) },
  } };
});
await s.goto(URL);
await s.waitForTimeout(1500);
// Beispieldaten laden (Profil -> "Beispieldaten"), dann Profil mit Figur
await s.evaluate(() => window.__zeige('profile'));
await s.waitForTimeout(800);
await s.evaluate(() => document.getElementById('btnDemo')?.click());
await s.waitForTimeout(2500);
await s.evaluate(() => { const p = JSON.parse(localStorage.getItem('lucenta_profile') || '{}'); p.figur = p.figur || 'baer'; p.zubehoer = 'schal'; localStorage.setItem('lucenta_profile', JSON.stringify(p)); });
const lage = () => s.evaluate(() => {
  const v = document.querySelector('.view.active'); if (!v) return {};
  const o = {}; let i = 0;
  for (const e of v.querySelectorAll('*')) {
    if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') continue;
    const r = e.getBoundingClientRect(); if (r.height < 4 || r.top > 2600) continue;
    o[(e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + [...e.classList].slice(0, 2).join('.')) + '@' + (i++)] = [Math.round(r.top + window.scrollY), Math.round(r.height), Math.round(r.left)];
  }
  return o;
});
// Wege wie in der App: von der Ausgangsseite (Push/Pop oder Wechsel ueber das Menue) zur Zielseite.
// Gemessen ab dem Ende der eigenen Animation (Push .46 s, gestaffelter Aufbau bis .75 s): Was danach noch
// seine Lage im Bildschirm aendert, ist ein Zucken.
const WEGE = (process.env.WEGE || 'landing>state,landing>profile,profile>look,look>profile,profile>verlauf,verlauf>profile,landing>settings,settings>sprache,sprache>settings,settings>appicon,appicon>settings,settings>hilfe,landing>freunde,landing>archetypes,landing>result,result>ft,landing>understand').split(',');
const ergebnis = [];
for (const weg of WEGE) {
  const [von, nach] = weg.split('>');
  await s.evaluate((v) => window.__zeige(v), von);
  await s.waitForTimeout(1200);
  await s.evaluate(() => window.scrollTo(0, 300));
  await s.waitForTimeout(200);
  const r = await s.evaluate(async (x) => {
    const lage = () => { const v = document.querySelector('.view.active'); const o = {}; let i = 0; if (!v) return o;
      for (const e of v.querySelectorAll('*')) { const q = e.getBoundingClientRect(); if (q.height < 4 || q.top > 900 || q.bottom < 0 || !e.offsetParent) continue;
        o[(e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + [...e.classList].slice(0, 2).join('.')) + '@' + (i++)] = [Math.round(q.top), Math.round(q.left), Math.round(q.height)]; }
      return o; };
    const t0 = performance.now(); window.__zeige(x); const ms = Math.round(performance.now() - t0);
    const lang = []; let vorige = performance.now();
    // Frames zaehlen: Abstaende ueber 34 ms sind verlorene Bilder
    await new Promise(res => { const f = (t) => { if (t - vorige > 34) lang.push(Math.round(t - t0)); vorige = t; if (t - t0 < 800) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    const proben = [];
    for (let n = 0; n < 18; n++) { proben.push({ t: Math.round(performance.now() - t0), o: lage(), y: Math.round(scrollY) }); await new Promise(res => setTimeout(res, 50)); }
    return { ms, lang, proben };
  }, nach);
  const z = r.proben[r.proben.length - 1], zucker = [];
  for (const p of r.proben) for (const k in p.o) if (z.o[k] && p.o[k].some((w, i) => Math.abs(w - z.o[k][i]) > 2)) { zucker.push(k + ' ' + p.t + 'ms ' + p.o[k] + '->' + z.o[k]); }
  const scroll = r.proben.some(p => p.y !== z.y) ? ' Scroll ' + r.proben.map(p => p.y).join(',') : '';
  ergebnis.push({ seite: weg, ms: r.ms, lang: r.lang, springt: zucker.length, beispiele: zucker.slice(0, 4), scroll });
}
for (const e of ergebnis) {
  const warnung = e.ms > 50 || e.springt || e.scroll ? '!!' : 'ok';
  console.log(`${warnung} ${e.seite.padEnd(20)} ${String(e.ms).padStart(4)} ms  Ruckler bei [${e.lang}]  ${e.springt ? e.springt + ' zucken: ' + e.beispiele.join(' | ') : ''}${e.scroll}`);
}
await b.close();

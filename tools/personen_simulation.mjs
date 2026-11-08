// Simuliert viele Menschen mit verschiedenen Hintergruenden, die die App wirklich bedienen: Sprache und
// Region des iPhones, Zeitzone, Uhrzeit (Mitternacht, Zeitumstellung), Bildschirm, Textgroesse, Antwortmuster,
// Namen, Freundescodes von Hand, Notizen, Import, Loeschen. WebKit mit App-Bruecke auf dist/index.html.
//
//   node tools/personen_simulation.mjs [anzahl=2000]      LUCENTA_PARALLEL (6), LUCENTA_SAAT (1)
//
// Bericht: Summen je Fund auf der Konsole, alle Einzelheiten in .pruef-log/personen.json. Kein Teil von
// pruef-alles — ein Lauf mit 2000 Personen dauert etwa 100 Minuten (losgeloest starten).

import { createRequire } from 'module';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, statSync, createReadStream, mkdirSync } from 'node:fs';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { appBruecke, tabKnoepfe } from './app_bruecke.mjs';

const require_ = createRequire(import.meta.url);
const { webkit } = require_('playwright');
const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(WURZEL, 'dist');
const PORT = 8023;
const URL = `http://127.0.0.1:${PORT}/index.html`;
const ANZAHL = Number(process.argv[2] || 2000);
const PARALLEL = Number(process.env.LUCENTA_PARALLEL || 6);
let saat = Number(process.env.LUCENTA_SAAT || 1);

// ---------- Zufall mit Saat (wiederholbar) ----------
function zufall(){ saat |= 0; saat = saat + 0x6D2B79F5 | 0; let t = Math.imul(saat ^ saat >>> 15, 1 | saat);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const eins = (l) => l[Math.floor(zufall() * l.length)];
const gewichtet = (paare) => { let s = paare.reduce((a, p) => a + p[1], 0), r = zufall() * s;
  for (const [w, g] of paare){ if ((r -= g) < 0) return w; } return paare[0][0]; };
const ja = (p) => zufall() < p;

// ---------- Auswertung wie in der App (aus dem deutschen Paket; Polung ist in allen acht gleich) ----------
const ctxDe = { CONTENT: {} };
vm.runInNewContext(readFileSync(join(WURZEL, 'src/i18n/de.js'), 'utf8'), ctxDe);
const FACTORS = ctxDe.CONTENT.de.FACTORS, ORDER = ['O','E','C','A','S'];
const ITEMS = [];
for (let i = 0; i < 10; i++) for (const f of ORDER) ITEMS.push({ f, k: FACTORS[f][i].k });
function erwartet(ant){
  const s = {E:0,A:0,C:0,S:0,O:0};
  ITEMS.forEach((it, i) => { const a = ant[i] || 3; s[it.f] += it.k === 1 ? a : 6 - a; });
  const o = {}; ORDER.forEach(f => o[f] = Math.round(((s[f] - 10) / 40) * 100)); return o;
}

// ---------- Ortszeit ----------
function teile(ms, tz){
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit' }).formatToParts(new Date(ms));
  const g = {}; p.forEach(x => g[x.type] = x.value); return g;
}
function tagSchluessel(ms, tz){ const g = teile(ms, tz); return `${g.year}-${g.month}-${g.day}`; }
function stunde(ms, tz){ return Number(teile(ms, tz).hour); }
// Ortszeit -> Zeitpunkt (zweimal angenaehert, genuegt fuer jede Zeitzone).
function ortszeit(y, mo, d, h, mi, s, tz){
  let t = Date.UTC(y, mo - 1, d, h, mi, s);
  for (let i = 0; i < 3; i++){ const g = teile(t, tz);
    const als = Date.UTC(+g.year, +g.month - 1, +g.day, +g.hour, +g.minute, +g.second); t += Date.UTC(y, mo - 1, d, h, mi, s) - als; }
  return t;
}

// ---------- Herkunft ----------
const REGIONEN = [
  ['de', 'de-DE', 'Europe/Berlin', 14], ['de', 'de-AT', 'Europe/Vienna', 3], ['de', 'de-CH', 'Europe/Zurich', 3],
  ['en', 'en-US', 'America/New_York', 8], ['en', 'en-US', 'America/Los_Angeles', 5], ['en', 'en-GB', 'Europe/London', 5],
  ['en', 'en-AU', 'Australia/Sydney', 2], ['en', 'en-IN', 'Asia/Kolkata', 2], ['en', 'en-NZ', 'Pacific/Auckland', 1],
  ['en', 'en-US', 'Pacific/Honolulu', 1], ['en', 'en-NG', 'Africa/Lagos', 1],
  ['es', 'es-ES', 'Europe/Madrid', 4], ['es', 'es-MX', 'America/Mexico_City', 4], ['es', 'es-AR', 'America/Argentina/Buenos_Aires', 2],
  ['fr', 'fr-FR', 'Europe/Paris', 6], ['fr', 'fr-CA', 'America/Toronto', 2], ['it', 'it-IT', 'Europe/Rome', 6],
  ['pt', 'pt-BR', 'America/Sao_Paulo', 6], ['pt', 'pt-PT', 'Europe/Lisbon', 2],
  ['tr', 'tr-TR', 'Europe/Istanbul', 6], ['tr', 'de-DE', 'Europe/Berlin', 2],   // in Deutschland, Telefon auf Deutsch, liest Tuerkisch
  ['ja', 'ja-JP', 'Asia/Tokyo', 7],
  ['en', 'en-US', 'Pacific/Kiritimati', 0.5], ['en', 'en-US', 'Pacific/Pago_Pago', 0.5], ['en', 'en-US', 'Asia/Kathmandu', 0.5],
  ['en', 'en-AU', 'Australia/Lord_Howe', 0.5],
];
const NAMEN = ['Anna','Lukas','Mehmet','Ayşe','İbrahim','Işıl','Zoë','José','François','Søren','Ngozi','Nguyễn Văn An','さくら',
  '山田太郎','محمد','Олег','O\'Brien','Anne-Marie','Jean Paul','Ana Lúcia','Çağla','Li','A','','   ','<img src=x onerror=alert(1)>',
  '🦊 Mia','Maximilian-Alexander von Hohenzollern','x'.repeat(80),'Dr. Ünal','Émilie','Grüße','ßabine','Ole','Bo'];
const NOTIZEN = ['', 'Gut geschlafen', 'Mal schauen 🙂', 'Zeile1\nZeile2\n\nZeile3', '<b>fett</b> & "zitiert"', 'あ'.repeat(250),
  'a'.repeat(199) + '😀 Rest', '   ', 'Prüfung bestanden! 🎉🎉🎉', 'İstanbul’da yağmur'];
const MUSTER = [['realistisch', 55], ['zufall', 8], ['alle3', 5], ['alle1', 2], ['alle5', 3], ['abwechselnd', 2], ['extrem', 3],
  ['zurueck', 7], ['doppeltipp', 6], ['abbruch', 6], ['sprachwechsel', 3]];
// Besondere Zeitpunkte (Ortszeit); sonst ein zufaelliger Tag in 2026.
const BESONDERE = [
  ['vor-mitternacht', [2026, 6, 15, 23, 59, 50]], ['silvester', [2026, 12, 31, 23, 59, 50]],
  ['vor-mittag', [2026, 4, 2, 11, 59, 55]], ['vor-abend', [2026, 9, 9, 17, 59, 55]],
  ['umstellung-eu-fruehling', [2026, 3, 29, 1, 59, 50]], ['umstellung-eu-herbst', [2026, 10, 25, 2, 30, 0]],
  ['umstellung-us-fruehling', [2026, 3, 8, 1, 59, 50]], ['nachts', [2026, 5, 20, 0, 40, 0]], ['frueh', [2026, 8, 3, 5, 10, 0]],
];

function person(nr){
  const [sprache, gebiet, tz] = gewichtet(REGIONEN.map(r => [r, r[3]]));
  const besonders = ja(0.25) ? eins(BESONDERE) : null;
  const zeit = besonders ? ortszeit(...besonders[1], tz)
    : ortszeit(2026, 1 + Math.floor(zufall() * 12), 1 + Math.floor(zufall() * 28), Math.floor(zufall() * 24), Math.floor(zufall() * 60), 0, tz);
  const alter = gewichtet([['16-24', 25], ['25-44', 40], ['45-64', 25], ['65+', 10]]);
  const text = alter === '65+' ? eins([1.18, 1.4, 1.76, 2]) : gewichtet([[0.88, 5], [1, 70], [1.18, 12], [1.4, 7], [1.76, 4], [2, 2]]);
  return {
    nr, sprache, gebiet, tz, alter, text, zeit, besonders: besonders && besonders[0],
    breite: gewichtet([[375, 22], [390, 25], [393, 20], [402, 8], [430, 12], [440, 6], [320, 7]]),
    hoehe: 0, thema: gewichtet([['dark', 55], ['light', 35], ['system', 10]]),
    systemDunkel: ja(0.5), wenigBewegung: ja(alter === '65+' ? 0.3 : 0.08),
    plus: ja(0.25), onboarding: ja(0.5), muster: gewichtet(MUSTER), gast: ja(0.12),
    name: eins(NAMEN), tagesform: ja(0.8), notiz: ja(0.4) ? eins(NOTIZEN) : null,
    treu: ja(0.15) ? 150 + Math.floor(zufall() * 350) : 0,   // Tage mit drei Eintraegen am Tag vorab
    freunde: ja(0.6) ? 1 + Math.floor(zufall() * (ja(0.05) ? 34 : 4)) : 0,
    loeschen: ja(0.06), einspielen: ja(0.06) ? eins(['bild', 'leer', 'fremd', 'kaputt', 'eigen']) : null,
    voll: ja(0.02), ausfuehrlich: ja(0.1),
  };
}

// ---------- Freundescodes, die Menschen weitergeben ----------
const CODES = [];          // echte Codes frueherer Personen
const EINLADUNG = {};
for (const s of ['de','en','es','fr','it','pt','tr','ja']){
  const c = { CONTENT: {} };
  vm.runInNewContext(readFileSync(join(WURZEL, `src/i18n/${s}.js`), 'utf8'), c);
  EINLADUNG[s] = c.CONTENT[s].UI.freunde_einladen_text;
}
function codeVariante(code){
  const art = gewichtet([['genau', 30], ['einladung', 25], ['klein', 8], ['leerzeichen', 7], ['o-statt-0', 5], ['tippfehler', 10],
    ['gedankenstrich', 4], ['umbruch', 5], ['ohne-striche', 6]]);
  const ZEICHEN = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let t = code;
  if (art === 'einladung') t = EINLADUNG[eins(Object.keys(EINLADUNG))].split('{code}').join(code);
  if (art === 'klein') t = code.toLowerCase();
  if (art === 'leerzeichen') t = code.replace(/-/g, ' ');
  if (art === 'gedankenstrich') t = code.replace(/-/g, '–');
  if (art === 'umbruch') t = '\n  ' + code + ' \n';
  if (art === 'ohne-striche'){ const i = code.lastIndexOf('-', code.length - 6); t = code.slice(0, i + 1) + code.slice(i + 1).replace(/-/g, ''); }
  if (art === 'o-statt-0'){ if (!/[01]/.test(code.slice(-9))) return codeVariante(code); t = code.slice(0, -9) + code.slice(-9).replace(/0/g, 'O').replace(/1/g, 'I'); }
  if (art === 'tippfehler'){ const pos = code.length - 1 - Math.floor(zufall() * 4); let z; do { z = eins(ZEICHEN); } while (z === code[pos]);
    t = code.slice(0, pos) + z + code.slice(pos + 1); }
  return { art, text: t };
}

// ---------- in der Seite ----------
function seitenBlick(){
  const v = document.querySelector('[id^="view-"].active');
  const funde = [];
  const text = v ? v.innerText : '';
  const m = text.match(/\bundefined\b|\bNaN\b|\[object|\{[a-z_]{2,}\}|\bnull\b|Infinity/);
  if (m) funde.push('Text enthaelt „' + m[0] + '“: …' + text.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ') + '…');
  if (document.documentElement.scrollWidth > innerWidth + 1) {
    let breit = '';
    document.querySelectorAll('[id^="view-"].active *').forEach(e => { const r = e.getBoundingClientRect();
      if (!breit && r.width && r.right > innerWidth + 1 && getComputedStyle(e).position !== 'fixed') breit = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className || '').split(' ')[0]; });
    funde.push('seitlicher Ueberstand ' + (document.documentElement.scrollWidth - innerWidth) + ' px (' + breit + ')');
  }
  return { ansicht: v ? v.id : '', funde };
}

async function lauf(browser, P){
  const funde = [];
  const fund = (art, detail) => funde.push({ art, detail });
  const ctx = await browser.newContext({ viewport: { width: P.breite, height: 800 }, isMobile: true, hasTouch: true,
    locale: P.gebiet, timezoneId: P.tz, colorScheme: P.systemDunkel ? 'dark' : 'light', reducedMotion: P.wenigBewegung ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(appBruecke, P.plus);
  await ctx.addInitScript(tabKnoepfe);
  await ctx.addInitScript(f => { const s = () => document.documentElement && document.documentElement.style.setProperty('--dt', String(f));
    s(); document.addEventListener('readystatechange', s); }, P.text);
  // Was eine Person vor dieser Sitzung schon eingetragen hat.
  await ctx.addInitScript(({ treu, start, voll }) => {
    if (sessionStorage.getItem('__gesaet')) return;
    sessionStorage.setItem('__gesaet', '1');
    if (treu){
      const h = []; const d0 = new Date(start);
      for (let i = treu; i >= 1; i--){
        const d = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() - i, 12);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        [['morgen', 8], ['mittag', 13], ['abend', 20]].forEach(([slot, h0]) => h.push({ day: key, ts: new Date(d.getFullYear(), d.getMonth(), d.getDate(), h0).getTime(),
          energy: 1 + (i % 5), valence: 1 + ((i * 3) % 5), slot }));
      }
      localStorage.setItem('lucenta_state', JSON.stringify(h));
      localStorage.setItem('__treu_aeltester', h[0].day);
    }
    if (voll){
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function(k, v){ if (String(k).startsWith('lucenta_state') || String(k).startsWith('lucenta_result')) { const e = new Error('QuotaExceededError'); e.name = 'QuotaExceededError'; throw e; } return orig.apply(this, arguments); };
    }
  }, { treu: P.treu, start: P.zeit, voll: P.voll });
  const p = await ctx.newPage();
  p.on('pageerror', e => fund('Ausnahme', e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) fund('Konsolenfehler', m.text().slice(0, 160)); });
  p.on('dialog', d => d.accept());
  await p.clock.install({ time: P.zeit });
  const lauf = (ms) => p.clock.runFor(ms);
  const ev = (f, a) => p.evaluate(f, a);
  const klick = (sel) => ev(s => { const e = document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
  const blick = async (wo) => { await lauf(400); const b = await ev(seitenBlick);
    b.funde.forEach(f => fund(f.startsWith('seitlich') ? 'Ueberstand' : 'Textrest', wo + ' (' + b.ansicht + '): ' + f)); };
  const ls = (k) => ev(k => localStorage.getItem(k), k);
  // Sprachpakete kommen ueber das Netz der Seite: in echter Zeit warten, nicht nur in der Seitenuhr.
  const spracheAbwarten = async (s) => { for (let i = 0; i < 30; i++){ if (await ev(() => document.documentElement.lang) === s) return true;
    await p.waitForTimeout(100); await lauf(100); } return false; };

  // ?geraetesprache: unter Automatisierung bliebe die App sonst auf Deutsch (geraeteSprache in 01-sprachpakete.js).
  await p.goto(URL + '?geraetesprache' + (P.onboarding ? '&onboarding=1' : ''), { waitUntil: 'load' });
  await lauf(1500);

  // Sprache beim ersten Start: die des iPhones?
  // Zusage: die Sprache des iPhones, wenn es eine der acht ist, sonst Englisch.
  const geraet = P.gebiet.slice(0, 2), sollStart = ['de','en','es','fr','it','pt','tr','ja'].includes(geraet) ? geraet : 'en';
  await spracheAbwarten(sollStart);
  const angezeigt = await ev(() => document.documentElement.lang);
  if (angezeigt !== sollStart) fund('Startsprache nicht die des iPhones', `${P.gebiet} -> ${angezeigt}`);
  if (P.gebiet === 'pt-BR') fund('Hinweis: Brasilien bekommt Portugal-Portugiesisch', 'pt-PT');

  if (P.onboarding){
    for (let i = 0; i < 10; i++){
      const offen = await ev(() => { const o = document.getElementById('onboarding'); return !!o && !o.hidden && o.offsetHeight > 0; });
      if (!offen) break;
      await ev((name) => {
        const o = document.getElementById('onboarding');
        const n = document.getElementById('obName'); if (n && n.offsetHeight && !n.value){ n.value = name; n.dispatchEvent(new Event('input', {bubbles:true})); }
        const ziel = o.querySelector('[data-ob-ziel]'); if (ziel && ziel.offsetHeight && ziel.getAttribute('aria-checked') !== 'true') ziel.click();
        const fig = o.querySelector('#obFigurRaster button'); if (fig && fig.offsetHeight) fig.click();
        const k = ['btnObStarten', 'btnObZielWeiter'].map(id => document.getElementById(id)).find(b => b && b.offsetHeight && !b.disabled)
          || [...o.querySelectorAll('[data-ob-weiter]')].find(b => b.offsetHeight && !b.disabled);
        if (k) k.click();
      }, P.name);
      await lauf(700);
    }
    const nochOffen = await ev(() => { const o = document.getElementById('onboarding'); return !!o && !o.hidden && o.offsetHeight > 0; });
    if (nochOffen) fund('Onboarding endet nicht', '');
  }

  // Wer die Sprache nicht versteht, stellt sie um (die meisten finden es).
  if (P.sprache !== await ev(() => document.documentElement.lang)){
    await ev(s => { const b = document.querySelector('[data-lang="' + s + '"]'); if (b) b.click(); }, P.sprache);
    if (!await spracheAbwarten(P.sprache)) fund('Sprachwechsel greift nicht', P.sprache);
  }
  await ev(t => { const b = document.querySelector('[data-mode="' + t + '"]'); if (b) b.click(); }, P.thema);

  // ---------- der Test ----------
  const basis = ORDER.map(() => 1 + Math.floor(zufall() * 5));
  const ant = [];
  for (let i = 0; i < 50; i++){
    const it = ITEMS[i];
    let v;
    switch (P.muster){
      case 'alle3': v = 3; break; case 'alle1': v = 1; break; case 'alle5': v = 5; break;
      case 'abwechselnd': v = i % 2 ? 5 : 1; break; case 'extrem': v = ja(0.5) ? 1 : 5; break;
      case 'zufall': v = 1 + Math.floor(zufall() * 5); break;
      default: { const b = basis[ORDER.indexOf(it.f)]; const roh = it.k === 1 ? b : 6 - b;
        v = Math.max(1, Math.min(5, roh + (ja(0.3) ? (ja(0.5) ? 1 : -1) : 0))); }
    }
    ant.push(v);
  }
  const antworte = async (v) => { await ev(v => document.getElementById('scaleRow').children[v - 1].click(), v); await lauf(260); };
  const frage = () => ev(() => { const t = (document.getElementById('qNow') || {}).textContent || ''; return parseInt(t, 10) || 0; });
  await klick('#tabStart'); await lauf(300);
  await ev(() => document.getElementById('btnStart').click()); await lauf(400);
  if (await ev(() => !document.getElementById('view-quiz').classList.contains('active'))) fund('Test startet nicht', '');
  const abbruchBei = 5 + Math.floor(zufall() * 40);
  for (let i = 0; i < 50; i++){
    if (P.muster === 'zurueck' && i > 3 && ja(0.12)){
      await klick('#btnPrev'); await lauf(300);
      await antworte(ant[i - 1]);
    }
    if (P.muster === 'doppeltipp' && ja(0.3)){
      await ev(v => { const r = document.getElementById('scaleRow'); r.children[v - 1].click(); r.children[v - 1].click(); }, ant[i]); await lauf(260);
    } else await antworte(ant[i]);
    if (P.muster === 'abbruch' && i === abbruchBei){
      await p.reload({ waitUntil: 'load' }); await lauf(1500);
      await ev(() => document.getElementById('btnStart').click()); await lauf(400);
      const n = await frage();
      if (n !== i + 2) fund('Fortsetzen nach Neustart an falscher Frage', `beantwortet ${i + 1}, weiter bei ${n}`);
    }
    if (P.muster === 'sprachwechsel' && i === abbruchBei){
      const neu = eins(['en','ja','tr','fr'].filter(s => s !== P.sprache));
      await klick('#tabProfil'); await lauf(300); await klick('#btnProfilEinstellungen'); await lauf(300);
      await ev(s => document.querySelector('[data-lang="' + s + '"]').click(), neu); await spracheAbwarten(neu);
      await klick('#tabStart'); await lauf(300);
      await ev(() => document.getElementById('btnStart').click()); await lauf(400);
      const n = await frage();
      if (n !== i + 2) fund('Fortsetzen nach Sprachwechsel an falscher Frage', `beantwortet ${i + 1}, weiter bei ${n}`);
    }
  }
  await lauf(2500);
  await klick('#btnPlusModalClose');
  const erg = JSON.parse(await ls('lucenta_result') || 'null');
  if (!erg && P.voll){
    const zeigt = await ev(() => document.getElementById('view-result').classList.contains('active'));
    const meldung = await ev(() => (document.getElementById('toast') || {}).textContent || '');
    if (!meldung.trim()) fund('Speicher voll: Ergebnis nicht gesichert, ohne Hinweis', (zeigt ? 'Ergebnisseite erscheint trotzdem' : 'keine Ergebnisseite') + '; Meldung: ' + (meldung.trim() || '(keine)'));
  } else if (!erg) fund('kein Ergebnis gespeichert', P.muster);
  else {
    const soll = erwartet(ant);
    const ab = ORDER.filter(f => erg[f] !== soll[f]);
    if (ab.length && P.muster !== 'doppeltipp') fund('Ergebnis weicht von den Antworten ab', P.muster + ' ' + ab.map(f => f + ':' + erg[f] + '≠' + soll[f]).join(' '));
    if (ab.length && P.muster === 'doppeltipp') fund('Doppeltipp verschiebt Antworten', ab.map(f => f + ':' + erg[f] + '≠' + soll[f]).join(' '));
  }
  if (await ev(() => !document.getElementById('view-result').classList.contains('active'))) fund('Ergebnisseite erscheint nicht', P.muster);
  await blick('Ergebnis');

  // ---------- Handy weitergereicht: Gastdurchlauf, unterbrochen ----------
  if (P.gast && erg){
    const vorher = await ls('lucenta_result');
    await klick('#tabStart'); await lauf(300);
    await klick('#btnHeroSecondary'); await lauf(300); await klick('#btnRunGuest'); await lauf(400);
    for (let i = 0; i < 20; i++) await antworte(1);
    await klick('#tabProfil'); await lauf(300); await klick('#tabStart'); await lauf(300);
    await ev(() => document.getElementById('btnStart').click()); await lauf(400);
    for (let i = 0; i < 30; i++) await antworte(1);
    await lauf(2500); await klick('#btnPlusModalClose');
    if (await ls('lucenta_result') !== vorher) fund('Gastdurchlauf ueberschreibt eigenes Ergebnis', 'nach Reiterwechsel und „Weitermachen“');
  }

  // ---------- Name, Benutzer-ID, eigener Code ----------
  await klick('#tabProfil'); await lauf(400);
  await ev(n => { const f = document.getElementById('profileName'); if (!f) return; f.value = n; f.dispatchEvent(new Event('input', {bubbles:true})); }, P.name);
  await lauf(200); await blick('Profil');
  if (await ev(() => !!document.querySelector('#view-profile img[src="x"]'))) fund('Name als HTML eingesetzt', P.name);
  await klick('#tabFreunde'); await lauf(400);
  let eigenerCode = '';
  if (erg){
    // Seit Runde 240 steht die ID mit dem Namen sofort fest: Mit Namen darf keine Abfrage mehr kommen.
    const abfrage = await ev(() => !!document.getElementById('freundIchId'));
    if (abfrage && P.name.trim()) fund('Mit Namen trotzdem nach der Benutzer-ID gefragt', JSON.stringify(P.name.slice(0, 20)));
    await ev(id => { const f = document.getElementById('freundIchId'); if (f){ if (!f.value) f.value = id; document.querySelector('[data-ich="id"]').click(); } },
      'p' + P.nr.toString(36) + 'x');
    await lauf(400);
    eigenerCode = await ev(() => ((document.getElementById('freundEigenerCode') || {}).textContent || '').trim());
    if (!eigenerCode) fund('Kein eigener Freundescode sichtbar', '');
    else CODES.push(eigenerCode);
  }
  await blick('Freunde');

  // ---------- Freunde von Hand ----------
  for (let i = 0; i < P.freunde && CODES.length > 1; i++){
    const echt = eins(CODES.filter(c => c !== eigenerCode));
    if (!echt) break;
    const v = codeVariante(echt);
    const vorher = JSON.parse(await ls('lucenta_freunde') || '[]').length;
    await ev(t => { const f = document.getElementById('freundCode'); f.value = t; document.getElementById('btnFreundSpeichern').click(); }, v.text);
    await lauf(500);
    const freunde = JSON.parse(await ls('lucenta_freunde') || '[]');
    const nachher = freunde.length;
    const echtId = echt.split('-').slice(0, -2).join('-');
    // Schon in der Liste (dieselbe Person zweimal) zaehlt als angenommen.
    const angenommen = nachher > vorher || freunde.some(f => f.name === echtId) || (nachher === vorher && vorher >= 30);
    if (v.art === 'tippfehler' && nachher > vorher) fund('Tippfehler im Freundescode als gueltig angenommen', v.text);
    if (['leerzeichen', 'o-statt-0', 'gedankenstrich', 'ohne-striche'].includes(v.art) && !angenommen) fund('Richtig gemeinter Code abgelehnt (' + v.art + ')', v.text.slice(0, 40));
    if (['genau', 'einladung', 'klein', 'umbruch'].includes(v.art) && nachher <= vorher && vorher < 30 && !freunde.some(f => f.name === echt.split('-').slice(0, -2).join('-')))
      fund('Gueltiger Code nicht angenommen (' + v.art + ')', v.text.slice(0, 60));
    if (vorher >= 30 && nachher === 30) fund('31. Freund verdraengt still den aeltesten', '');
    await klick('#tabFreunde'); await lauf(300);
  }
  if (P.freunde) await blick('Freunde mit Liste');

  // ---------- Tagesform ----------
  if (P.tagesform){
    // Der Test hat die Seitenuhr weitergedreht: fuer die Mitternachtsfaelle zurueck auf kurz davor.
    if (P.besonders === 'vor-mitternacht' || P.besonders === 'silvester'){
      const [y, mo, d] = tagSchluessel(P.zeit, P.tz).split('-').map(Number);
      await p.clock.setSystemTime(ortszeit(y, mo, d, 23, 59, 40, P.tz));
    }
    await klick('#tabTagesform'); await lauf(500);
    const e = 1 + Math.floor(zufall() * 5), va = 1 + Math.floor(zufall() * 5);
    await ev(([e, va]) => { document.getElementById('stateEnergyRow').querySelectorAll('button')[e - 1].click();
      document.getElementById('stateValenceRow').querySelectorAll('button')[va - 1].click(); }, [e, va]);
    await lauf(200);
    const jetzt = await ev(() => Date.now());
    await klick('#btnStateSave'); await lauf(1500);
    const h = JSON.parse(await ls('lucenta_state') || '[]');
    const letzter = h.reduce((a, x) => (!a || x.ts > a.ts) ? x : a, null);
    if (P.voll){ /* geprueft ueber die Meldung */ }
    else if (!letzter || letzter.ts < jetzt) fund('Tagesform nicht gespeichert', '');
    else {
      if (letzter.day !== tagSchluessel(letzter.ts, P.tz)) fund('Tagesform am falschen Tag', `${letzter.day} statt ${tagSchluessel(letzter.ts, P.tz)} (${P.tz})`);
      const st = stunde(letzter.ts, P.tz), soll = st < 12 ? 'morgen' : st < 18 ? 'mittag' : 'abend';
      if (letzter.slot !== soll) fund('Tagesform in falscher Tageszeit', `${letzter.slot} statt ${soll}`);
    }
    if (P.treu){
      const aeltester = await ls('__treu_aeltester');
      const tage = new Set(h.map(x => x.day)).size;
      if (h.length && h[0].day !== aeltester) fund('Alte Tagesform still geloescht (Grenze 800 Eintraege)',
        `${P.treu} Tage zu je 3 Eintraegen, behalten ${tage} Tage`);
    }
    await blick('Tagesform');
    if (P.notiz !== null && !P.voll){
      await ev(() => { const b = document.querySelector('#tfNotizBereich [data-notiz="oeffnen"]'); if (b) b.click(); });
      await ev(n => { const f = document.querySelector('#tfNotizBereich textarea'); if (f){ f.value = n; document.querySelector('#tfNotizBereich [data-notiz="sichern"]').click(); } }, P.notiz);
      await lauf(400);
      const h2 = JSON.parse(await ls('lucenta_state') || '[]');
      const l2 = h2.reduce((a, x) => (!a || x.ts > a.ts) ? x : a, null);
      const soll = P.notiz.replace(/\s+/g, ' ').trim().slice(0, 200).replace(/[\uD800-\uDBFF]$/, '').trim();
      if (l2 && (l2.notiz || '') !== soll && soll.length <= 200) fund('Notiz anders gespeichert als eingegeben', JSON.stringify(P.notiz.slice(0, 30)));
      if (l2 && l2.notiz && /[\uD800-\uDBFF]$/.test(l2.notiz)) fund('Notiz endet mit halbem Emoji', '');
      if (await ev(() => !!document.querySelector('#tfNotizBereich b'))) fund('Notiz als HTML eingesetzt', P.notiz);
    }
    // Ueber Mitternacht offen gelassen, dann wieder geoeffnet.
    if (P.besonders === 'vor-mitternacht' || P.besonders === 'silvester'){
      await lauf(30000);
      await ev(() => document.dispatchEvent(new Event('visibilitychange')));
      await lauf(600);
      const zeigtErledigt = await ev(() => { const a = document.getElementById('tfErledigt'); return !!a && a.offsetHeight > 0; });
      if (zeigtErledigt) fund('Nach Mitternacht steht noch der gestrige Eintrag als „heute“', '(App offen gelassen, wieder geoeffnet)');
      await klick('#tabStart'); await lauf(500);
      const start = await ev(() => { const a = document.getElementById('landingStateDone'); return !!a && a.offsetHeight > 0; });
      if (start) fund('Startseite zeigt nach Mitternacht den gestrigen Eintrag als „heute“', '');
    }
  }

  // ---------- durch alle Reiter und Unterseiten ----------
  for (const [tab, unter] of [['#tabStart'], ['#tabTagesform', '#btnRueckblickOeffnen'], ['#tabVerstehen'], ['#tabFreunde'],
                              ['#tabProfil', '#btnProfilEinstellungen'], ['#tabProfil', '#btnProfilPlus'], ['#tabProfil', '#btnAussehenOeffnen']]){
    await klick(tab); await lauf(500); await blick(tab);
    if (unter){ await klick(unter); await lauf(700); await blick(unter); }
  }

  // ---------- Einspielen ----------
  if (P.einspielen){
    await klick('#tabProfil'); await lauf(300); await klick('#btnProfilEinstellungen'); await lauf(400);
    const vorher = await ls('lucenta_result');
    const inhalt = { bild: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]), leer: Buffer.from(''),
      fremd: Buffer.from('{"app":"anders","daten":{}}'), kaputt: Buffer.from('{"app":"lucenta","daten":{"lucenta_result'),
      eigen: Buffer.from(JSON.stringify({ app: 'lucenta', fassung: 1, ts: 1, daten: { lucenta_result: JSON.stringify({O:10,E:20,C:30,A:40,S:50}) } })) }[P.einspielen];
    await p.setInputFiles('#importDatei', { name: 'sicherung.' + (P.einspielen === 'bild' ? 'png' : 'json'), mimeType: 'application/json', buffer: inhalt }).catch(e => fund('Einspielen nicht bedienbar', e.message.slice(0, 80)));
    await lauf(1500);
    try { await p.waitForLoadState('load'); } catch {}
    await lauf(1500);
    const nachher = await ls('lucenta_result').catch(() => vorher);
    if (P.einspielen !== 'eigen' && nachher !== vorher) fund('Ungueltige Datei hat Daten veraendert', P.einspielen);
    if (P.einspielen === 'eigen' && erg && nachher === vorher) fund('Gueltige Sicherung nicht eingespielt', '');
    if (P.einspielen === 'eigen' && P.tagesform && !P.voll){
      const st = JSON.parse(await ls('lucenta_state') || '[]');
      if (st.length) fund('Einspielen mischt alte und neue Daten', 'Sicherung ohne Tagesform, die Tagesform von vorher blieb (' + st.length + ' Eintraege)');
    }
  }

  // ---------- alles loeschen ----------
  if (P.loeschen){
    await ev(() => localStorage.setItem('lucenta_facetten', JSON.stringify({ probe: 1 })));   // als haette sie den ausfuehrlichen Test gemacht
    await klick('#tabProfil'); await lauf(300); await klick('#btnProfilEinstellungen'); await lauf(400);
    await klick('#btnResetData'); await lauf(300); await klick('#btnResetData'); await lauf(800);
    // Nur, was etwas ueber die Person sagt — Einstellungen und Merker duerfen bleiben.
    const rest = await ev(() => Object.keys(localStorage).filter(k => ['lucenta_facetten','lucenta_facetten_lauf','lucenta_meilensteine',
      'lucenta_erstes_muster','lucenta_vergleich_frei','lucenta_nutzung','lucenta_nutzung_teilen','lucenta_icloud_zuletzt','lucenta_zubehoer'].includes(k)));
    if (rest.length) fund('„Alle Daten löschen“ laesst Daten zurueck', rest.sort().join(', '));
  }

  await ctx.close();
  return funde;
}

// ---------- Server und Ablauf ----------
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = createServer((a, r) => {
  const pfad = join(DIST, normalize(decodeURIComponent(a.url.split('?')[0])).replace(/^(\.\.[/\\])+/, ''));
  if (!pfad.startsWith(DIST) || !existsSync(pfad) || statSync(pfad).isDirectory()){ r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': TYPEN[extname(pfad)] || 'application/octet-stream' }); createReadStream(pfad).pipe(r);
});
await new Promise(f => server.listen(PORT, '127.0.0.1', f));

const NUR = process.env.LUCENTA_NUR || '';
const personen = Array.from({ length: ANZAHL }, (_, i) => person(i + 1)).filter(P => !NUR || P.besonders === NUR || P.muster === NUR);
const browser = await webkit.launch();
const ergebnisse = [];
let naechste = 0, fertig = 0;
const t0 = Date.now();
async function arbeiter(){
  while (naechste < personen.length){
    const P = personen[naechste++];
    let funde;
    try { funde = await Promise.race([lauf(browser, P), new Promise((_, n) => setTimeout(() => n(new Error('Zeitueberschreitung 120 s')), 120000))]); }
    catch (e) { funde = [{ art: 'Lauf abgebrochen', detail: String(e.message || e).slice(0, 160) }]; }
    ergebnisse.push({ P, funde });
    if (++fertig % 50 === 0) console.log(`${fertig}/${personen.length} Personen, ${((Date.now() - t0) / 60000).toFixed(1)} Min.`);
  }
}
await Promise.all(Array.from({ length: PARALLEL }, arbeiter));
await browser.close(); server.close();

// ---------- Bericht ----------
const summe = {};
for (const { P, funde } of ergebnisse) for (const f of funde){
  const s = summe[f.art] || (summe[f.art] = { personen: new Set(), beispiele: [], merkmale: {} });
  s.personen.add(P.nr);
  if (s.beispiele.length < 4) s.beispiele.push(`#${P.nr} ${P.gebiet} ${P.tz} ${P.breite}pt Text ${P.text}: ${f.detail}`);
  for (const m of ['sprache', 'breite', 'text', 'muster', 'besonders']) { const k = m + '=' + P[m]; s.merkmale[k] = (s.merkmale[k] || 0) + 1; }
}
mkdirSync(join(WURZEL, '.pruef-log'), { recursive: true });
writeFileSync(join(WURZEL, '.pruef-log/personen.json'), JSON.stringify({ anzahl: ANZAHL, ergebnisse }, null, 1));
console.log(`\n${ANZAHL} Personen in ${((Date.now() - t0) / 60000).toFixed(1)} Min.\n`);
Object.entries(summe).sort((a, b) => b[1].personen.size - a[1].personen.size).forEach(([art, s]) => {
  const haeufig = Object.entries(s.merkmale).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${k} (${n})`).join(', ');
  console.log(`${String(s.personen.size).padStart(5)}  ${art}\n       gehaeuft: ${haeufig}\n       ${s.beispiele.join('\n       ')}`);
});

// Prueft dist/index.html — die Fassung, die im App-Bundle liegt.  `npm run pruef-app`
//
// Runde 102. Die acht Pruefungen messen alle `dist/lucenta.html`: die Ein-Datei-Fassung mit
// eingebetteten Schriften und vollstaendigen Kommentaren. Seit dieser Runde ist die Fassung im
// App-Bundle aber eine ANDERE Datei — `dist/index.html`, mit ausgelagerten Schriften und von
// esbuild entfernten Kommentaren. Genau die laedt das iPhone, und genau die war damit als einzige
// ungeprueft unterwegs.
//
// Das ist die Luecke, die diese Pruefung schliesst. Sie ist absichtlich klein und fragt nur, was
// beim Umbau der App-Fassung kaputtgehen KANN:
//   1. Laedt die Seite ueberhaupt, ohne Ausnahme?
//   2. Sind die fuenf Schriftdateien da und werden sie geladen? (Ausgelagerte Schriften koennen
//      ins Leere zeigen — im Browser sieht man nur eine Rueckfallschrift, kein Fehler.)
//   3. Sind alle acht Sprachen erreichbar? Seit Runde 103 steht nur noch Deutsch in der Datei;
//      die sieben uebrigen liegen als eigene Dateien daneben und werden beim Umstellen geholt.
//      Geprueft wird deshalb nicht mehr der Quelltext allein, sondern der Weg: umstellen und
//      nachsehen, ob die Sprache wirklich ankommt. Ein Paket, das ins Leere zeigt, faellt sonst
//      erst dem Menschen auf, der genau diese Sprache waehlt.
//   4. Steht die Startansicht, und tragen die Ueberschriften die Markenschrift?
//
// Der lokale Server auf 8017 muss laufen (cd dist && python3 -m http.server 8017 --bind 127.0.0.1).

import { webkit } from 'playwright';
import { existsSync, readdirSync } from 'node:fs';

// Runde 103: Der Port kommt von pruef_alles.mjs, wenn es den Server selbst mitbringt.
const BASIS = process.env.LUCENTA_BASIS || 'http://127.0.0.1:8017';
let fehler = 0, gepruft = 0;
const ok = (bedingung, text, zusatz = '') => {
  gepruft++;
  if (bedingung) { console.log(`  ok    ${text}${zusatz ? ': ' + zusatz : ''}`); }
  else { fehler++; console.log(`  FEHL  ${text}${zusatz ? ': ' + zusatz : ''}`); }
};

console.log('\n=== Die Fassung im App-Bundle (dist/index.html) ===\n');

// Vorab ohne Browser: liegen die Schriftdateien wirklich da?
const schriftOrdner = 'dist/schriften';
const dateien = existsSync(schriftOrdner)
  ? readdirSync(schriftOrdner).filter(f => f.endsWith('.woff2'))
  : [];
ok(dateien.length > 0, 'dist/schriften/ enthaelt Schriftdateien', `${dateien.length} Stueck`);

const browser = await webkit.launch();
const seite = await (await browser.newContext({ viewport: { width: 393, height: 852 } })).newPage();

const ausnahmen = [];
const schriftAntworten = [];
const sprachAntworten = [];
seite.on('pageerror', e => ausnahmen.push(e.message));
seite.on('response', r => {
  if (r.url().includes('/schriften/')) schriftAntworten.push({ status: r.status(), url: r.url() });
  if (r.url().includes('/sprachen/')) sprachAntworten.push({ status: r.status(), url: r.url() });
});

await seite.goto(`${BASIS}/index.html`, { waitUntil: 'load' });
await seite.evaluate(() => document.fonts.ready);
await seite.waitForTimeout(400);

ok(ausnahmen.length === 0, 'keine Ausnahme beim Laden', ausnahmen.join(' | '));

const schlecht = schriftAntworten.filter(a => a.status >= 400);
// Bewusst nicht "alle fuenf": Mit font-display:swap holt WebKit nur die Schnitte, die die
// Startseite wirklich braucht — beim ersten Messen waren es vier von fuenf, und das ist richtig so.
// Geprueft wird deshalb, dass ueberhaupt Schriften geholt werden und KEINE ins Leere zeigt.
// Runde 126: Seit der einheitlichen Schrift braucht die Startseite genau EINE Datei — Fraunces fuer
// die Wortmarke. Verlangt wird, dass sie geholt wird und keine Datei ins Leere zeigt.
ok(schriftAntworten.length >= 1, 'die Startseite holt ihre Schrift (Wortmarke)',
   `${schriftAntworten.length} von ${dateien.length} Dateien angefordert`);
ok(schlecht.length === 0, 'keine Schrift antwortet mit Fehler',
   schlecht.map(a => a.status + ' ' + a.url.split('/').pop()).join(', '));

const befund = await seite.evaluate(() => {
  const h1 = document.querySelector('h1');
  const geladen = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family);
  return {
    landing: !!document.querySelector('#view-landing.active'),
    h1Text: h1 ? h1.innerText.trim().slice(0, 30) : null,
    h1Schrift: h1 ? getComputedStyle(h1).fontFamily.split(',')[0].replace(/['"]/g, '').trim() : null,
    // Runde 131: Ein Titel ausserhalb der Startseite als Beleg fuer die Systemschrift.
    titelSchrift: (function(){ const t = document.querySelector('#view-archetypes h1, #view-state h1, #view-result h1');
      return t ? getComputedStyle(t).fontFamily.split(',')[0].replace(/['"]/g, '').trim() : null; })(),
    startSchrift: (function(){ const m = document.querySelector('#startOverlay .start-name');
      return m ? getComputedStyle(m).fontFamily.split(',')[0].replace(/['"]/g, '').trim() : null; })(),
    markeSchrift: (function(){ const m = document.querySelector('.wordmark');
      return m ? getComputedStyle(m).fontFamily.split(',')[0].replace(/['"]/g, '').trim() : null; })(),
    geladeneFamilien: [...new Set(geladen)],
    textSchrift: getComputedStyle(document.body).fontFamily.split(',')[0].trim(),
    // Die Sprachwahl im DOM ist der einzige Weg von aussen an die Sprachliste: CONTENT liegt in
    // der gemeinsamen IIFE der App und ist absichtlich nicht global.
    sprachen: [...document.querySelectorAll('[data-lang]')].map(b => b.getAttribute('data-lang'))
  };
});

ok(befund.landing, 'die Startansicht ist aktiv');
ok(!!befund.h1Text, 'die Ueberschrift steht', befund.h1Text || '(leer)');
// Runde 126, Auftrag des Inhabers: "die schrift ist nicht einheitlich". Titel stehen jetzt in der
// Systemschrift wie der Text; Fraunces bleibt allein der Wortmarke.
// Runde 131, ebenso Auftrag: Die Ueberschrift der Startseite steht wieder in Fraunces (wie bis Runde 125).
ok(befund.h1Schrift === 'Fraunces', 'die Ueberschrift der Startseite steht in Fraunces', befund.h1Schrift);
ok(/^-apple-system/.test(befund.titelSchrift || ''), 'die uebrigen Titel stehen in der Systemschrift', befund.titelSchrift);
ok(befund.markeSchrift === 'Fraunces', 'die Wortmarke traegt die Markenschrift', befund.markeSchrift);
// Runde 131: derselbe Name im Startbild in derselben Schrift.
ok(befund.startSchrift === 'Fraunces', 'der Name im Startbild traegt die Markenschrift', befund.startSchrift);
// Runde 114: Hier stand "mindestens drei Schriftfamilien". Seit dieser Runde stehen Text und
// Bedienung in der Systemschrift (iOS: SF), und Work Sans ist aus der Datei entfernt. Eingebettet
// sind damit genau zwei Familien — und genau die werden jetzt verlangt, mit Namen statt mit einer
// Zahl: Eine Zahl wuerde auch zwei falsche Familien durchlassen.
// Runde 126: IBM Plex Mono ist nirgends mehr gesetzt (Zahlen und Daten in SF, Codes in SF Mono) —
// geladen werden darf sie deshalb auch nicht mehr; sonst stuende sie irgendwo doch noch.
ok(befund.geladeneFamilien.includes('Fraunces') && !befund.geladeneFamilien.includes('IBM Plex Mono'),
   'geladen ist Fraunces (Wortmarke), IBM Plex Mono nicht mehr',
   befund.geladeneFamilien.join(', '));
ok(!befund.geladeneFamilien.includes('Work Sans'), 'Work Sans wird nicht mehr geladen',
   befund.geladeneFamilien.join(', '));
ok(/^-apple-system/.test(befund.textSchrift), 'Fliesstext steht in der Systemschrift (auf dem iPhone SF)',
   befund.textSchrift);

// Die Zahl steht bewusst ausgeschrieben da — genau wie in tests/lang_test.js. Ein Sprachpaket,
// das beim Umbau der App-Fassung verschwindet, wuerde sonst lautlos fehlen.
const ERWARTET = ['de', 'en', 'es', 'fr', 'it', 'ja', 'pt', 'tr'];
const fehlendImDom = ERWARTET.filter(s => !befund.sprachen.includes(s));
ok(fehlendImDom.length === 0, 'die Sprachwahl bietet alle acht Sprachen',
   fehlendImDom.length ? 'fehlt: ' + fehlendImDom.join(', ') : befund.sprachen.length + ' Knoepfe');

// ---------- Runde 103: Deutsch eingebettet, sieben Pakete daneben ----------
//
// Bis Runde 102 stand hier eine Quelltextsuche nach allen acht `CONTENT.xx =`. Seit der Aufteilung
// waere genau das falsch: Steht Franzoesisch noch in der Datei, ist die Aufteilung nicht passiert.
// Geprueft wird deshalb beides — dass Deutsch drin ist, dass die uebrigen NICHT drin sind, und
// dass sie sich trotzdem einstellen lassen.
const { readFileSync } = await import('node:fs');
const appQuelle = readFileSync('dist/index.html', 'utf8');
// Muster aus der Quelle: die Pakete stehen als `CONTENT.fr = {` (minifiziert `CONTENT.fr={`).
// Ein loseres Muster wie `fr:{` trifft zufaellig anderen Code — beim ersten Versuch meldete es
// vier Sprachen als vorhanden, die es so gar nicht gab.
ok(/CONTENT\.de\s*=/.test(appQuelle), 'Deutsch steht eingebettet in der App-Datei',
   'Rueckfallsprache, muss ohne Nachladen da sein');

const NACHLADBAR = ERWARTET.filter(s => s !== 'de');
const sprachDateien = existsSync('dist/sprachen')
  ? readdirSync('dist/sprachen').filter(f => f.endsWith('.js'))
  : [];
const ohneDatei = NACHLADBAR.filter(s => !sprachDateien.some(f => f.startsWith(s + '-')));
ok(ohneDatei.length === 0, 'dist/sprachen/ traegt die sieben uebrigen Pakete',
   ohneDatei.length ? 'fehlt: ' + ohneDatei.join(', ') : `${sprachDateien.length} Dateien`);

const nochEingebettet = NACHLADBAR.filter(s => new RegExp(`CONTENT\\.${s}\\s*=`).test(appQuelle));
ok(nochEingebettet.length === 0, 'die uebrigen sieben stehen NICHT mehr in der App-Datei',
   nochEingebettet.length ? 'noch drin: ' + nochEingebettet.join(', ')
                          : `${(Buffer.byteLength(appQuelle) / 1024).toFixed(0)} KB statt 932 KB`);

// Beim Start darf KEIN Sprachpaket geholt werden — sonst ist die Ersparnis nur verschoben.
ok(sprachAntworten.length === 0, 'der Start holt kein einziges Sprachpaket',
   sprachAntworten.map(a => a.url.split('/').pop()).join(', '));

// Der eigentliche Punkt: Laesst sich jede der sieben wirklich einstellen? Der Knopf wird
// programmatisch getippt (er liegt in der Schublade, die dafuer nicht offen sein muss);
// `document.documentElement.lang` setzt applyI18n() und ist damit der Beleg, dass das Paket
// angekommen UND angewandt ist.
const deutscherTitel = befund.h1Text;
const nichtErreicht = [];
for (const code of NACHLADBAR) {
  await seite.evaluate(c => document.querySelector(`[data-lang="${c}"]`).click(), code);
  try {
    await seite.waitForFunction(c => document.documentElement.lang === c, code, { timeout: 5000 });
  } catch { nichtErreicht.push(code); }
}
ok(nichtErreicht.length === 0, 'jede der sieben Sprachen laedt nach und stellt sich ein',
   nichtErreicht.length ? 'kam nicht an: ' + nichtErreicht.join(', ') : NACHLADBAR.join(' '));

const schlechteSprachen = sprachAntworten.filter(a => a.status >= 400);
ok(schlechteSprachen.length === 0, 'kein Sprachpaket antwortet mit Fehler',
   schlechteSprachen.map(a => a.status + ' ' + a.url.split('/').pop()).join(', '));

// Und dass dabei auch der TEXT wechselt, nicht nur das lang-Attribut: Eine Bruecke, die das Paket
// entgegennimmt und wegwirft, wuerde oben nicht auffallen.
await seite.evaluate(() => document.querySelector('[data-lang="ja"]').click());
await seite.waitForFunction(() => document.documentElement.lang === 'ja', null, { timeout: 5000 })
           .catch(() => {});
const titelJa = await seite.evaluate(() => {
  const h1 = document.querySelector('h1');
  return h1 ? h1.innerText.trim().slice(0, 30) : null;
});
ok(!!titelJa && titelJa !== deutscherTitel, 'mit der Sprache wechselt auch der sichtbare Text',
   `de "${deutscherTitel}" -> ja "${titelJa}"`);

// Der gefaehrlichste Weg zuletzt: Wer die App auf Japanisch gestellt hat, startet sie das naechste
// Mal neu. Dann ist das Paket beim Anlaufen NICHT da — die App muss auf Deutsch anlaufen und
// still umstellen, sobald die Datei da ist. Faellt dieser Weg aus, sitzt jemand dauerhaft in
// einer Sprache, die er nicht gewaehlt hat.
const zweiterAnlauf = await browser.newContext({ viewport: { width: 393, height: 852 } });
await zweiterAnlauf.addInitScript(() => {
  try { localStorage.setItem('lucenta_lang', 'ja'); } catch (e) {}
});
const seite2 = await zweiterAnlauf.newPage();
const ausnahmen2 = [];
seite2.on('pageerror', e => ausnahmen2.push(e.message));
await seite2.goto(`${BASIS}/index.html`, { waitUntil: 'load' });
let gemerkteSprache = false;
try {
  await seite2.waitForFunction(() => document.documentElement.lang === 'ja', null, { timeout: 5000 });
  gemerkteSprache = true;
} catch {}
ok(gemerkteSprache, 'die gemerkte Sprache wird beim Start nachgeholt',
   gemerkteSprache ? 'ja' : 'die App blieb auf ' +
     await seite2.evaluate(() => document.documentElement.lang));
ok(ausnahmen2.length === 0, 'auch der Start mit gemerkter Sprache wirft keine Ausnahme',
   ausnahmen2.join(' | '));

// ---------- Runde 103: Rendert das Glas wirklich? ----------
//
// Liquid Glass Schritt 2 hat Schublade und Dialoge durchscheinend gemacht. Die Kontrastmessung in
// `fehlersuche` liest berechnete FARBEN — ob `backdrop-filter` tatsaechlich eine Unschaerfe malt,
// sieht sie nicht. Genau das ist auf WebKit die wacklige Stelle: eine verschobene (translateX),
// scrollende Flaeche mit backdrop-filter. Faellt die Unschaerfe aus, bleibt eine zu 82 %
// durchscheinende Flaeche ueber einem bewegten Sternenhimmel — unlesbar, und keine Pruefung
// merkte es.
//
// Gemessen wird deshalb am Bild, mit einer Gegenprobe: dieselbe Schublade einmal wie gebaut und
// einmal mit abgeschaltetem backdrop-filter. Sind beide Aufnahmen gleich, hat der Filter nichts
// getan. Das ist unabhaengig davon, WIE stark die Unschaerfe ist — nur davon, DASS sie wirkt.
async function schubladeAufnehmen(ohneGlas) {
  const c = await browser.newContext({ viewport: { width: 393, height: 852 } });
  const s = await c.newPage();
  await s.goto(`${BASIS}/index.html`, { waitUntil: 'load' });
  await s.evaluate(() => document.fonts.ready);
  if (ohneGlas) {
    await s.addStyleTag({ content:
      '#drawerPanel{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;}' });
  }
  await s.evaluate(() => { document.getElementById('btnDrawerToggle')?.click(); });
  await s.waitForFunction(() => !!document.querySelector('#drawerPanel.open'), null, { timeout: 4000 })
         .catch(() => {});
  await s.waitForTimeout(700);   // die Schublade faehrt in .32s ein
  const offen = await s.evaluate(() => !!document.querySelector('#drawerPanel.open'));
  const bild = offen ? await s.locator('#drawerPanel').screenshot() : null;
  await c.close();
  return bild;
}
const mitGlas = await schubladeAufnehmen(false);
const ohneGlas = await schubladeAufnehmen(true);
ok(!!mitGlas && !!ohneGlas, 'die Schublade laesst sich oeffnen und aufnehmen');
ok(!!mitGlas && !!ohneGlas && !mitGlas.equals(ohneGlas),
   'das Glas rendert: mit und ohne backdrop-filter sieht die Schublade verschieden aus',
   mitGlas && ohneGlas ? `${mitGlas.length} gegen ${ohneGlas.length} Byte` : '(keine Aufnahme)');

// --- Anmutung wie eine App, und was dabei NICHT verloren gehen darf (Runde 109)
//
// Zwei Entscheidungen des Inhabers stehen seit dieser Runde als je eine Zeile an der Wurzel des
// Stilblatts: kein Doppeltipp-Zoom, keine Textmarkierung. Beide haben eine AUSNAHME, deren
// Verlust ein echter Defekt waere und nicht eine Geschmacksfrage — und Ausnahmen sind das, was
// beim naechsten Aufraeumen zuerst wegfaellt:
//
//   - Ein Eingabefeld, in dem man nicht markieren kann, laesst sich nicht korrigieren. Das
//     GARANTIERT der Browser (CSS-UI: auf editierbaren Elementen ist user-select immer `text`) —
//     im Stilblatt steht dafuer bewusst keine Regel mehr, weil sie gemessen wirkungslos war.
//     Geprueft wird es hier trotzdem, und genau deshalb: Es ist eine Zusage, auf die sich das
//     Stilblatt VERLAESST, ohne sie selbst auszusprechen.
//   - Der eigene Code ist die einzige Angabe der App, deren Verlust endgueltig ist. Es gibt
//     einen Kopierknopf daneben; wenn der einmal nicht greift, muss der Code mit der Hand
//     herauszuholen sein. Dafuer steht eine eigene Regel, und die faellt beim Aufraeumen zuerst.
//   - Und das Aufziehen mit zwei Fingern muss bleiben. Der Auftrag hiess "Doppeltipp-Zoom
//     abschalten". `user-scalable=no` im Viewport schaltet BEIDES ab und ist die naheliegende
//     Art, diese Aenderung spaeter "zu vollenden" — diese Pruefung sagt Nein dazu.
//
// Gefragt wird nach dem Ergebnis, nicht nach der Regel: Beim Fliesstext wird eine echte Auswahl
// versucht. Vererbung und Spezifitaet koennen dazwischenkommen, das Ergebnis nicht.
const anmutungCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const anmutungSeite = await anmutungCtx.newPage();
await anmutungSeite.goto(`${BASIS}/index.html`, { waitUntil: 'networkidle' });
await anmutungSeite.waitForTimeout(400);
const anmutung = await anmutungSeite.evaluate(() => {
  const wahl = (el) => el ? (getComputedStyle(el).webkitUserSelect || getComputedStyle(el).userSelect) : null;
  const meta = document.querySelector('meta[name="viewport"]');
  const ziel = document.querySelector('#view-landing .sub') || document.querySelector('#view-landing h1');
  let zeichen = -1;
  try {
    const r = document.createRange(); r.selectNodeContents(ziel);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    zeichen = String(s).length; s.removeAllRanges();
  } catch (e) {}
  return {
    touch: getComputedStyle(document.documentElement).touchAction,
    fliesstext: zeichen,
    feld: wahl(document.getElementById('profileName')),
    code: wahl(document.getElementById('myCode')),
    viewport: meta ? meta.getAttribute('content') : ''
  };
});
ok(anmutung.touch === 'manipulation',
   'kein Doppeltipp-Zoom: die Wurzel traegt touch-action:manipulation', anmutung.touch);
ok(anmutung.fliesstext === 0,
   'Fliesstext laesst sich nicht markieren', `${anmutung.fliesstext} Zeichen auswaehlbar`);
ok(anmutung.feld === 'text',
   'der Browser haelt sein Versprechen: im Eingabefeld bleibt Markieren moeglich',
   String(anmutung.feld));
ok(anmutung.code === 'text',
   'AUSNAHME: der eigene Code bleibt markierbar (sein Verlust ist endgueltig)', String(anmutung.code));
ok(!/user-scalable\s*=\s*no|maximum-scale/.test(anmutung.viewport),
   'Aufziehen mit zwei Fingern bleibt erlaubt: kein user-scalable=no, kein maximum-scale',
   anmutung.viewport);

// Runde 123: Die Tierbilder liegen in der App-Fassung als Dateien in figuren/ (build.js). Ein
// falscher Pfad, eine fehlende Datei oder ein Bild, das WebKit nicht dekodiert, ergaebe leere
// Kreise — und nichts sonst wuerde es melden, weil lucenta.html die Bilder eingebettet traegt.
// Gefragt wird deshalb hier, an der App-Fassung, und nach dem Ergebnis: ob jedes Bild LAEDT.
const figurPfade = await anmutungSeite.evaluate(async () => {
  const quelltext = await (await fetch('index.html')).text();
  const pfade = [...new Set(quelltext.match(/figuren\/[a-z]+-[0-9a-f]{10}\.png/g) || [])];
  const geladen = await Promise.all(pfade.map(p => new Promise(fertig => {
    const b = new Image();
    b.onload = () => fertig(b.naturalWidth > 0 ? null : p);
    b.onerror = () => fertig(p);
    b.src = p;
  })));
  return { anzahl: pfade.length, kaputt: geladen.filter(Boolean) };
});
ok(figurPfade.anzahl === 12 && figurPfade.kaputt.length === 0,
   'alle 12 Tierbilder der App-Fassung laden aus figuren/',
   `${figurPfade.anzahl} Pfade, nicht geladen: ${figurPfade.kaputt.join(', ') || 'keins'}`);

// Runde 114: Hier stand die Pruefung "der Hals der Menschenfiguren ist sichtbar" (Runde 111).
// Die Menschenfiguren sind auf Entscheidung des Inhabers entfallen; die Pruefung haette keinen
// Gegenstand mehr. Die Lehre aus ihren drei Anlaeufen steht im Journal unter Runde 111.
await anmutungCtx.close();

await browser.close();

console.log('\n======================================================');
console.log(fehler === 0 ? `ALLE ${gepruft} PRUEFUNGEN BESTANDEN`
                         : `${fehler} VON ${gepruft} PRUEFUNGEN FEHLGESCHLAGEN`);
console.log('======================================================\n');
process.exit(fehler === 0 ? 0 : 1);

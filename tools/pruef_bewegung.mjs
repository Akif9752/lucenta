// Prüft im echten Browser, ob Bewegung tatsächlich läuft — und ob sie ausbleibt, wenn
// weniger Bewegung gewünscht ist.
//
// Entstanden aus Runde 63 bis 65. Dreimal hintereinander stellte sich heraus, dass eine
// Animation zwar korrekt im Stilblatt stand, aber nie zu sehen war:
//
//   - Das Fünfeck im Ankunftsmoment hing am Element statt an ".show". Es zeichnete sich beim
//     Laden der Seite in einer unsichtbaren Überlagerung und stand fertig da, wenn der Moment kam.
//   - Die Messbalken trugen seit jeher eine Übergangszeit von 0,9 s. Ein Übergang braucht eine
//     Änderung; die Breite stand schon im erzeugten Markup und war ab dem ersten Bild endgültig.
//   - Die Versätze der Schublade zählten über nth-child alle Geschwister statt nur die
//     Abschnitte und kamen dadurch in der falschen Reihenfolge heraus.
//
// Keiner dieser drei Fälle ist im Quelltext zu sehen: Die Regel ist gültig, die Syntax stimmt,
// die Animation ist definiert. Sichtbar wird der Fehler erst, wenn man den Wert über die Zeit
// misst. Genau das tut diese Datei.
//
// Braucht einen Browser und läuft deshalb nicht in "npm test":
//   npx http-server dist -p 8017 -s &
//   node tools/pruef_bewegung.mjs

import { createRequire } from 'module';
import { execSync } from 'child_process';
const require_ = createRequire(import.meta.url);
let pkg;
for (const ort of ['playwright', process.env.PLAYWRIGHT_PFAD].filter(Boolean)) {
  try { pkg = require_(ort); break; } catch (e) {}
}
if (!pkg) {
  try { pkg = require_(execSync('npm root -g', {encoding:'utf8'}).trim() + '/playwright'); }
  catch (e) {
    console.error('Playwright nicht gefunden. "npm i -D playwright" oder PLAYWRIGHT_PFAD setzen.');
    process.exit(2);
  }
}
const { chromium } = pkg;
const URL = process.env.LUCENTA_URL || 'http://127.0.0.1:8017/lucenta.html';
const START = process.env.CHROMIUM_PFAD ? {executablePath: process.env.CHROMIUM_PFAD} : {};

const fehler = [];
function pruefe(bedingung, text, zusatz){
  console.log((bedingung ? '  ok   ' : '  FAIL ') + text + (zusatz ? '  ' + zusatz : ''));
  if (!bedingung) fehler.push(text);
}

// Nimmt eine Messgröße über mehrere Zeitpunkte auf und meldet, ob sie sich verändert hat.
async function verlauf(p, lesen, punkte){
  const werte = [];
  let vorher = 0;
  for (const t of punkte){
    await p.waitForTimeout(t - vorher); vorher = t;
    werte.push(await p.evaluate(lesen));
  }
  return werte;
}
const bewegtSich = w => new Set(w.map(String)).size > 1;
// So viele Meilensteine kennt der Fragebogen (QUIZ_MILESTONES in src/i18n/de.js). Steht hier als
// erwartete Zahl, damit ein versehentlich entfernter Meilenstein auffaellt statt stillzuliegen.
const MEILENSTEINE = 3;

async function durchlauf(reduziert){
  const b = await chromium.launch(START);
  const ctx = await b.newContext({viewport:{width:390,height:844}, isMobile:true, hasTouch:true,
    reducedMotion: reduziert ? 'reduce' : 'no-preference'});
  const p = await ctx.newPage();
  const abstuerze = [];
  p.on('pageerror', e => abstuerze.push(e.message));
  await p.goto(URL, {waitUntil:'networkidle'});
  await p.waitForTimeout(600);

  console.log('\n' + (reduziert ? 'MIT prefers-reduced-motion' : 'OHNE prefers-reduced-motion'));

  // --- Ansichtswechsel mit Richtung
  await p.click('#btnDrawerToggle'); await p.waitForTimeout(400);
  await p.click('#btnDrawerSettings'); await p.waitForTimeout(40);
  const hinein = await p.evaluate(() => getComputedStyle(document.getElementById('view-settings')).animationName);
  await p.click('#btnBackFromSettings'); await p.waitForTimeout(40);
  const zurueck = await p.evaluate(() => getComputedStyle(document.getElementById('view-landing')).animationName);
  if (reduziert){
    pruefe(hinein === 'none' && zurueck === 'none', 'Ansichtswechsel ohne Bewegung', `(${hinein}/${zurueck})`);
  } else {
    pruefe(hinein === 'view-vor' && zurueck === 'view-zurueck',
           'Ansichtswechsel trägt eine Richtung', `(${hinein}/${zurueck})`);
  }
  await p.waitForTimeout(600);

  // --- Fragebogen
  await p.click('#btnStart'); await p.waitForTimeout(500);
  { const r = await p.$('#btnRunSelf'); if (r && await r.isVisible()){ await r.click(); await p.waitForTimeout(500); } }
  const knoepfe = await p.$$('#scaleRow .scale-btn');
  await knoepfe[2].click(); await p.waitForTimeout(50);
  const puls = await p.evaluate(() => {
    const b = document.querySelector('#scaleRow .scale-btn.picked');
    return b ? getComputedStyle(b).animationName : '-';
  });
  // Runde 78: Der Kreis traegt jetzt ZWEI Animationen — den Ring nach aussen und das
  // Zusammendruecken mit Ueberschwung. Eine Gleichheitspruefung auf einen einzelnen Namen wuerde
  // beim Hinzufuegen der zweiten fehlschlagen, obwohl beide korrekt laufen; gefragt ist, ob die
  // erwarteten Namen ENTHALTEN sind.
  const pulsTeile = puls.split(',').map(x => x.trim());
  pruefe(reduziert ? puls === 'none'
                   : pulsTeile.includes('antwort-puls') && pulsTeile.includes('antwort-quetsch'),
         reduziert ? 'Antwort ohne Impuls' : 'Antwort gibt einen Impuls', `(${puls})`);
  // Die Weiterschaltung braucht 220 ms. Ohne diese Pause beantwortet der nächste Klick dieselbe
  // Frage noch einmal, und am Ende fehlt eine — der Fragebogen bleibt bei 50 stehen, die
  // Ergebnisseite wird nie erreicht, und alles Weitere meldet falsche Fehler.
  await p.waitForTimeout(320);

  // --- Die naechste Frage kommt herein, und die Antwortreihe folgt ihr gestaffelt
  const einlauf = await p.evaluate(() => {
    const c = document.getElementById('qCard');
    const k = Array.from(document.querySelectorAll('#scaleRow .scale-btn'));
    return {
      karte:  c ? getComputedStyle(c).animationName : '-',
      kreise: k.map(b => getComputedStyle(b).animationName),
      verzug: k.map(b => getComputedStyle(b).animationDelay)
    };
  });
  const versetzt = new Set(einlauf.verzug).size > 1;
  if (reduziert){
    pruefe(einlauf.karte === 'none' && einlauf.kreise.every(n => n === 'none'),
           'Fragewechsel ohne Bewegung', `(${einlauf.karte}/${einlauf.kreise[0]})`);
  } else {
    pruefe(einlauf.karte === 'q-schub' && einlauf.kreise.every(n => n === 'kreis-ein') && versetzt,
           'Frage kommt herein, Antwortreihe folgt gestaffelt',
           `(${einlauf.karte}, ${einlauf.kreise[0]}, ${einlauf.verzug.join('/')})`);
  }

  // --- Meilenstein: fliegen bei 10, 20, 30, 40 Schnipsel?
  // Gemessen WAEHREND des Durchlaufs, nicht danach: Der Behaelter raeumt sich nach 1150 ms
  // selbst ab. Genau diese Art Fehler — eine Animation, die es gibt, die aber im entscheidenden
  // Moment nicht da ist — ist der Grund, warum es diese Datei gibt.
  let schnipsel = 0, stoesse = 0, zuvor = 0;
  for (let i = 1; i < 50; i++){
    const q = await p.$$('#scaleRow .scale-btn');
    if (!q.length) break;
    await q[i % 5].click(); await p.waitForTimeout(330);
    // Nach JEDEM Schritt nachsehen, statt die Meilensteine hier zu wiederholen: Wo sie liegen,
    // steht in den Sprachpaketen (QUIZ_MILESTONES) und darf sich dort aendern, ohne dass diese
    // Datei nachgezogen werden muss. Gemessen wird, dass es so viele Stoesse gibt wie
    // Meilensteine — und keinen einzigen daneben.
    // Ein Stoss lebt 1150 ms, ein Schritt dauert 330 ms — er wird also mehrfach gesehen.
    // Gezaehlt wird deshalb der UEBERGANG von "nichts da" zu "Schnipsel da", nicht jede Sichtung.
    const n = await p.evaluate(() => document.querySelectorAll('.konfetti i').length);
    if (n > 0 && zuvor === 0){ stoesse++; }
    schnipsel = Math.max(schnipsel, n);
    zuvor = n;
  }
  if (reduziert){
    pruefe(stoesse === 0, 'kein Stoss bei reduzierter Bewegung', `(${stoesse} Stoesse)`);
  } else {
    pruefe(stoesse === MEILENSTEINE && schnipsel >= 12,
           'Meilensteine feiern mit einem Stoss', `(${stoesse} von ${MEILENSTEINE}, ${schnipsel} Schnipsel)`);
  }

  // --- Ankunftsmoment: zeichnet sich das Fünfeck WÄHREND der Überlagerung?
  if (!reduziert){
    const strich = await verlauf(p, () => {
      const poly = document.querySelector('#processingOverlay.show .processing-mark polygon');
      return poly ? getComputedStyle(poly).strokeDashoffset : 'nicht sichtbar';
    }, [350, 600, 900]);
    pruefe(bewegtSich(strich.filter(x => x !== 'nicht sichtbar')) ,
           'Fünfeck zeichnet sich, während die Überlagerung sichtbar ist', JSON.stringify(strich));
  }
  // Auf das Erscheinen der Ergebnisansicht warten statt auf die Uhr: Der Ankunftsmoment dauert
  // 260 + 900 ms, und eine pauschale Wartezeit lag hinter dem Beginn der Balkenbewegung — die
  // Messung meldete dann fälschlich "läuft nicht", obwohl sie längst durchgelaufen war.
  await p.waitForFunction(() => {
    const v = document.getElementById('view-result');
    return v && getComputedStyle(v).display !== 'none';
  }, {timeout: 8000});

  // --- Messbalken auf der Ergebnisseite
  const balken = await verlauf(p, () => {
    const g = document.querySelector('.gauge-fill');
    return g ? Math.round(parseFloat(getComputedStyle(g).width)) : -1;
  }, [0, 150, 400, 900]);
  if (reduziert){
    pruefe(!bewegtSich(balken), 'Messbalken ohne Bewegung sofort voll', JSON.stringify(balken));
  } else {
    pruefe(bewegtSich(balken), 'Messbalken laufen von 0 auf ihren Wert', JSON.stringify(balken));
  }

  // --- Radar
  const radar = await p.evaluate(() => {
    const poly = document.querySelector('#radarWrap svg polygon:last-of-type');
    return poly ? getComputedStyle(poly).animationName : '-';
  });
  pruefe(reduziert ? radar === 'none' : radar === 'radar-in',
         reduziert ? 'Radar ohne Einblendung' : 'Radar blendet ein', `(${radar})`);

  // --- Abweisung: schuettelt das Feld, das den Code nicht annimmt?
  await p.click('#btnDrawerToggle'); await p.waitForTimeout(400);
  await p.click('#btnDrawerSettings'); await p.waitForTimeout(500);
  await p.fill('#restoreCodeInput', 'KEINCODE');
  await p.click('#btnRestoreCode'); await p.waitForTimeout(60);
  const schuettel = await p.evaluate(() => {
    const el = document.getElementById('restoreCodeInput');
    return { klasse: el.classList.contains('schuettel'), name: getComputedStyle(el).animationName };
  });
  if (reduziert){
    pruefe(!schuettel.klasse, 'abgewiesener Code ohne Schuetteln', `(${schuettel.name})`);
  } else {
    pruefe(schuettel.klasse && schuettel.name === 'schuettel-kf',
           'abgewiesener Code schuettelt das Feld', `(${schuettel.name})`);
  }

  pruefe(!abstuerze.length, 'keine Ausnahme in der Konsole', abstuerze.join(' | '));
  await b.close();
}

await durchlauf(false);
await durchlauf(true);
console.log('\n' + '='.repeat(54));
console.log(fehler.length ? `${fehler.length} PRUEFUNG(EN) FEHLGESCHLAGEN` : 'ALLE BEWEGUNGEN VERHALTEN SICH WIE ERWARTET');
console.log('='.repeat(54));
process.exit(fehler.length ? 1 : 0);

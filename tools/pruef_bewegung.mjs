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
  // Gemessen wird der Hellmodus (Lichtstrahl, die Flaechenpruefung unten setzt ihn voraus). Seit
  // Runde 149 startet die App dunkel; vorher lief diese Pruefung in "System" = hell.
  await ctx.addInitScript(() => { try{ if (!localStorage.getItem('lucenta_theme')) localStorage.setItem('lucenta_theme', 'light'); }catch(e){} });
  const p = await ctx.newPage();
  const abstuerze = [];
  p.on('pageerror', e => abstuerze.push(e.message));
  await p.goto(URL, {waitUntil:'networkidle'});
  await p.waitForTimeout(600);

  console.log('\n' + (reduziert ? 'MIT prefers-reduced-motion' : 'OHNE prefers-reduced-motion'));

  // --- Die Startseite bewegt sich (Runde 108)
  // Das Gegenstueck zur Messung im Fragebogen weiter unten. Bis Runde 108 kannte die Flaeche nur
  // "Startseite oder nicht"; jetzt kennt sie zwei Takte — und damit die Moeglichkeit,
  // versehentlich BEIDE stillzulegen. Das waere der unauffaelligste Fehler von allen: Die Flaeche
  // ist da, sieht auf dem Bild richtig aus, und die Atmosphaere, um die es ueber vier Runden
  // ging, ist tot. Kein Stilblatt und kein Quelltext-Blick zeigt das an.
  const himmelStart = await verlauf(p, () => document.getElementById('sternenhimmel').toDataURL().length, [0, 900]);
  const startDeckkraft = await p.evaluate(() => getComputedStyle(document.getElementById('sternenhimmel')).opacity);
  if (reduziert){
    // Bei reduzierter Bewegung steht sie still — aber in voller Deckkraft. Wer weniger Bewegung
    // will, hat nichts gegen Helligkeit gesagt; genau das war in Runde 108 der erste Anlauf und
    // fiel erst in der Gegenprobe auf, weil "still" und "gedaempft" dort EINE Groesse waren.
    pruefe(!bewegtSich(himmelStart) && startDeckkraft === '1',
           'Startseite: Hintergrund steht still, bleibt aber voll da', `(opacity ${startDeckkraft})`);
  } else {
    pruefe(bewegtSich(himmelStart) && startDeckkraft === '1',
           'Startseite: der Hintergrund bewegt sich', `(opacity ${startDeckkraft})`);
  }

  // --- Ansichtswechsel mit Richtung
  await p.click('#btnDrawerToggle'); await p.waitForTimeout(400);
  await p.click('#btnDrawerSettings'); await p.waitForTimeout(40);
  const hinein = await p.evaluate(() => getComputedStyle(document.getElementById('view-settings')).animationName);
  await p.click('#btnNavZurueck'); await p.waitForTimeout(40);   // seit Feedback B9 der Chevron in der Kopfzeile
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

  // --- Der Hintergrund des Fragebogens (Runde 108)
  // Bis Runde 108 lief die Flaeche ausschliesslich auf der Startseite und der Fragebogen war
  // leer. Jetzt liegt dieselbe Atmosphaere dort, aber als STANDBILD: Ein Fragebogen mit fuenfzig
  // Fragen soll nicht nebenher ein Canvas zeichnen lassen (die Begruendung steht im Kopf von
  // 22-sternenhimmel.js und ist aelter als diese Aenderung).
  // Gemessen werden BEIDE Haelften, weil jede fuer sich lautlos brechen kann: Faellt der
  // Takt-Wechsel aus, zeichnet die Flaeche fuenfzig Fragen lang weiter und niemand sieht es —
  // ausser am Akku. Faellt der Klassen-Wechsel aus, ist der gemeldete leere Hintergrund zurueck.
  // Nach dem INHALT gefragt und nicht nach einer Klasse: Ein Canvas, das da ist und nichts
  // zeigt, ist derselbe leere Hintergrund wie vorher.
  const himmelQuiz = await verlauf(p, () => document.getElementById('sternenhimmel').toDataURL().length, [0, 900]);
  const himmelStand = await p.evaluate(() => {
    const c = document.getElementById('sternenhimmel');
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let gesetzt = 0, gezaehlt = 0;
    // Jeder 37. Bildpunkt genuegt; eine Primzahl, damit die Stichprobe nicht mit einem Muster
    // der Flaeche in Takt geraet.
    for (let i = 3; i < d.length; i += 4*37){ gezaehlt++; if (d[i] > 0) gesetzt++; }
    return { anteil: gesetzt / Math.max(1, gezaehlt),
             gedaempft: document.documentElement.classList.contains('sternen-still'),
             deckkraft: getComputedStyle(c).opacity };
  });
  pruefe(!bewegtSich(himmelQuiz) && himmelStand.anteil > .5 && himmelStand.gedaempft,
         'Fragebogen: der Hintergrund ist da und steht still',
         `(gezeichnet ${(himmelStand.anteil*100).toFixed(0)} %, opacity ${himmelStand.deckkraft},`
         + ` bewegt ${bewegtSich(himmelQuiz)})`);

  // --- Die Aussagen-Box sitzt im oberen Drittel (Runde 108)
  // Gemeldet war "sitzt zu tief": justify-content:safe center legte den freien Platz zu gleichen
  // Teilen ueber und unter den Fragenblock. Zwei leere Flexglieder verteilen ihn jetzt 1:2,4.
  // Gemessen wird das VERHAELTNIS, nicht der Pixelwert — der haengt an Geraetehoehe, Sprache und
  // Zeilenumbruch, das Verhaeltnis nicht. Ein zurueckgedrehtes justify-content faellt sofort auf:
  // dann stehen hier 50 %.
  const sitz = await p.evaluate(() => {
    const karte = document.getElementById('qCard');
    const rb = document.querySelector('.quiz-body').getBoundingClientRect();
    const rk = karte.getBoundingClientRect();
    const rn = document.querySelector('.quiz-nav').getBoundingClientRect();
    // Der Aussenabstand der Karte gehoert zum Inhalt, nicht zum freien Platz.
    return { oben: rk.top - rb.top - parseFloat(getComputedStyle(karte).marginTop),
             unten: rb.bottom - rn.bottom };
  });
  const freierPlatz = sitz.oben + sitz.unten;
  const anteilOben = sitz.oben / Math.max(1, freierPlatz);
  // Unter 8px freiem Platz ist das Verhaeltnis gegenstandslos (kurze Bildschirme, lange
  // Uebersetzungen) — dort ist richtig, dass der Block einfach oben anfaengt.
  pruefe(freierPlatz < 8 || (anteilOben > .2 && anteilOben < .38),
         'Fragebogen: die Aussagen-Box sitzt im oberen Drittel',
         `(${Math.round(sitz.oben)}px ueber / ${Math.round(sitz.unten)}px unter`
         + ` = ${(anteilOben*100).toFixed(0)} %)`);

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
                   : pulsTeile.includes('antwort-puls') && pulsTeile.includes('antwort-feder'),
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
    pruefe(einlauf.karte === 'q-schwung' &&   // Runde 129: vorher q-schub
            einlauf.kreise.every(n => n === 'kreis-ein') && versetzt,
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
    // Runde 132: Sterne (.funkeln) statt Schnipsel (.konfetti).
    const n = await p.evaluate(() => document.querySelectorAll('.funkeln i').length);
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
  // Runde 129: Direkt nach dem Test laeuft die Enthuellung (ergebnisEnthuellen) — das Radar
  // entfaltet sich mit Drehung statt nur einzublenden, und der Titel federt herein.
  const titel = await p.evaluate(() => {
    const t = document.getElementById('archTitle');
    return t ? getComputedStyle(t).animationName : '-';
  });
  pruefe(reduziert ? radar === 'none' : radar === 'radar-entfalten',
         reduziert ? 'Radar ohne Einblendung' : 'Radar entfaltet sich nach dem Test', `(${radar})`);
  pruefe(reduziert ? titel === 'none' || titel === 'rise' || titel === '' : titel === 'titel-feder',
         reduziert ? 'Ergebnistitel ohne Feder' : 'Ergebnistitel federt herein', `(${titel})`);

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

  // --- Druckzustaende (Runde 105)
  // Warum hier: In Runde 105 blieb am Simulator jeder Druckzustand stumm — die Glasbahn aus
  // Runde 104 ebenso wie der `transform:scale`-Druck eines gewoehnlichen Knopfs, der seit vielen
  // Runden im Code steht. Ursache war die synthetische Beruehrung, nicht das Stilblatt; belegt
  // ueber einen gehaltenen Mausdruck auf WebKit UND Chromium, der alle drei Regeln greifen liess.
  // Das ist genau die Fehlerart, fuer die diese Datei gebaut wurde (gueltige Regel, nie zu sehen)
  // — nur umgekehrt: Die Regel ist gesund, und damit sie es bleibt, wird sie jetzt gemessen.
  // Gemessen wird der gehaltene MAUSDRUCK, weil das der einzige echte Eingabeweg ist, den
  // Playwright anhalten kann: `touchscreen.tap()` gibt es nur als Ganzes, und von Hand
  // verschickte Beruehrungsereignisse setzen `:active` grundsaetzlich nicht.
  const imDruck = async (wahl, lies) => {
    const el = await p.$(wahl);
    if (!el) return null;
    await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(120);
    const k = await el.boundingBox();
    const ruhe = await el.evaluate(lies);
    await p.mouse.move(k.x + k.width/2, k.y + k.height/2);
    await p.mouse.down(); await p.waitForTimeout(200);
    const gedrueckt = await el.evaluate(lies);
    await p.mouse.up(); await p.waitForTimeout(200);
    return { ruhe, gedrueckt };
  };
  const bahn = await imDruck('#haptikSchalter', el => ({
    glas: getComputedStyle(el).webkitBackdropFilter || getComputedStyle(el).backdropFilter,
    knopf: getComputedStyle(el.querySelector('.schalter-knopf')).width,
  }));
  if (!bahn){
    pruefe(false, 'Schieber fuer den Druckzustand gefunden');
  } else {
    pruefe(bahn.ruhe.glas === 'none' && /blur\(8px\)/.test(bahn.gedrueckt.glas),
           'Schieberbahn wird beim Druck glaesern', `(${bahn.ruhe.glas} -> ${bahn.gedrueckt.glas})`);
    // Die Unschaerfe bleibt auch bei reduzierter Bewegung: Sie ist Material, keine Bewegung.
    // Der Knopf dagegen dehnt sich dann NICHT — dafuer steht ein eigener Block im Stilblatt.
    if (reduziert){
      pruefe(bahn.ruhe.knopf === '27px' && bahn.gedrueckt.knopf === '27px',
             'Schieberknopf bleibt bei reduzierter Bewegung ruhig',
             `(${bahn.ruhe.knopf} -> ${bahn.gedrueckt.knopf})`);
    } else {
      pruefe(bahn.ruhe.knopf === '27px' && bahn.gedrueckt.knopf === '33px',
             'Schieberknopf dehnt sich beim Druck',
             `(${bahn.ruhe.knopf} -> ${bahn.gedrueckt.knopf})`);
    }
  }
  const fach = await imDruck('#themeSystem', el => ({
    glas: getComputedStyle(el).webkitBackdropFilter || getComputedStyle(el).backdropFilter,
  }));
  if (!fach){
    pruefe(false, 'Segmentfach fuer den Druckzustand gefunden');
  } else {
    pruefe(fach.ruhe.glas === 'none' && /blur\(8px\)/.test(fach.gedrueckt.glas),
           'Segmentfach wird beim Druck glaesern', `(${fach.ruhe.glas} -> ${fach.gedrueckt.glas})`);
  }

  // --- Die zweite Tuer fuer "Transparenz reduzieren" (Runde 106)
  //
  // Warum das hier gemessen wird und nicht im Quelltext: `pruefeTransparenzTueren` in build.js
  // haelt die beiden Fassungen jeder Regel zusammen, aber nur als TEXT. Ob das Attribut die
  // Regel tatsaechlich greifen laesst, ist eine andere Frage — es entscheidet die Spezifitaet,
  // und `:root[data-transparenz="reduziert"] .segment-opt:active` muss sich gegen
  // `.segment-opt[aria-checked="true"]:active` durchsetzen. Ein Vergleich von Zeichenketten
  // sieht das nicht. Gemessen wird deshalb der berechnete Stil.
  //
  // Auf dem Geraet ist diese Tuer die EINZIGE, die wirkt: WebKit auf iOS kennt
  // `prefers-reduced-transparency` nicht (Runde 105), die Huelle setzt das Attribut
  // (`MainViewController.swift`). Hier laeuft Chromium, also wird das Attribut von Hand
  // gesetzt — genau so, wie die Huelle es tut. Am Simulator ist derselbe Weg in Runde 106 mit
  // dem echten Schalter nachgemessen worden, auf WebKit.
  const tuer = await p.evaluate(() => {
    const glas = (q) => {
      const el = document.querySelector(q);
      if (!el) return 'FEHLT';
      const s = getComputedStyle(el);
      return s.webkitBackdropFilter || s.backdropFilter;
    };
    const lies = () => ({ kopf: glas('header.top'), schublade: glas('#drawerPanel'), bild: glas('#imgModal') });
    const vorher = lies();
    document.documentElement.setAttribute('data-transparenz', 'reduziert');
    const reduziert = lies();
    document.documentElement.removeAttribute('data-transparenz');
    return { vorher, reduziert, zurueck: lies() };
  });
  // Runde 121: Hier stand /blur\(20px\)/ — die Staerke von damals. Die Schublade hat seither 16px
  // (12-ios.css, im Simulator abgestimmt), und die Pruefung schlug an, obwohl die Tuer genau tat,
  // was sie soll. Gefragt ist, OB Glas da ist, weggeht und wiederkommt, nicht wie stark es ist;
  // die gleiche Staerke vorher und nachher haelt die zweite Bedingung fest.
  const glasDa = w => /blur\([1-9][\d.]*px\)/.test(w || '');
  for (const flaeche of ['kopf', 'schublade', 'bild']){
    pruefe(glasDa(tuer.vorher[flaeche]) && tuer.reduziert[flaeche] === 'none'
           && tuer.zurueck[flaeche] === tuer.vorher[flaeche],
           `data-transparenz nimmt das Glas von "${flaeche}" und gibt es zurueck`,
           `(${tuer.vorher[flaeche]} -> ${tuer.reduziert[flaeche]} -> ${tuer.zurueck[flaeche]})`);
  }
  // Die beiden Druckzustaende sind der Fall, in dem die Spezifitaet entscheidet: Die Tuer
  // `:root[data-transparenz="reduziert"] .segment-opt:active` muss sich gegen
  // `.segment-opt[aria-checked="true"]:active` durchsetzen, und beim Schieber gegen
  // `.schalter[aria-checked="true"]:active`. Attribut UND Druck gehen zusammen: Das Attribut
  // steht an `:root`, der Mausdruck am Element. Genau so wird gemessen.
  await p.evaluate(() => document.documentElement.setAttribute('data-transparenz', 'reduziert'));
  for (const [wahl, name] of [['#haptikSchalter', 'Schieberbahn'], ['#themeSystem', 'Segmentfach']]){
    const gedrueckt = await imDruck(wahl, el => ({
      glas: getComputedStyle(el).webkitBackdropFilter || getComputedStyle(el).backdropFilter,
    }));
    if (!gedrueckt){
      pruefe(false, `${name} fuer die Attributfassung des Druckzustands gefunden`);
    } else {
      pruefe(gedrueckt.gedrueckt.glas === 'none',
             `${name} bleibt bei data-transparenz auch im Druck deckend`,
             `(${gedrueckt.ruhe.glas} -> ${gedrueckt.gedrueckt.glas})`);
    }
  }
  await p.evaluate(() => document.documentElement.removeAttribute('data-transparenz'));

  // --- Tagesform: zeichnet sich die Kurve beim Wechsel des Zeitraums ein? (Runde 107)
  //
  // Gemeldet war: "Die Tagesform-Graphen sollen sich beim Wechsel der verschiedenen Zeitraeume
  // live von links nach rechts einzeichnen."
  //
  // Warum das hier gemessen wird und nicht im Quelltext: Die Bewegung haengt an einem
  // Strichmuster in LINIENLAENGE, und diese Laenge wird in 08-code.js gerechnet und als
  // --vl-laenge an das <svg> gehaengt. Steht dort eine 0 oder ein leerer Wert — weil der
  // Polygonzug nur einen Punkt hat, weil die Marke anders heisst, weil das Stilblatt sie nicht
  // findet —, dann ist die Regel gueltig, die Syntax stimmt, und es bewegt sich nichts. Genau
  // die Fehlerart, fuer die diese Datei gebaut wurde.
  //
  // Der Durchlauf braucht dafuer Daten, die er selbst nicht erzeugt: Der Fragebogen legt keine
  // Tagesform-Eintraege an. 60 Tage und Lucenta+ werden deshalb untergeschoben — Lucenta+, weil
  // der Zeitraumwaehler nur in der gekauften Fassung steht (fensterWahlHTML).
  await p.evaluate(() => {
    const heute = Date.now(), eintraege = [];
    for (let i = 59; i >= 0; i--){
      const d = new Date(heute - i * 86400000);
      eintraege.push({ day: d.toISOString().slice(0, 10), ts: d.getTime(),
                       energy: 3 + Math.sin(i / 4) * 1.6, valence: 3 + Math.cos(i / 5) * 1.5 });
    }
    try{
      localStorage.setItem('lucenta_state', JSON.stringify(eintraege));
      localStorage.setItem('lucenta_plus', '1');
    }catch(e){}
  });
  await p.goto(URL, {waitUntil:'networkidle'});
  await p.waitForTimeout(600);
  await p.click('#btnLandingStateHistory');
  await p.waitForTimeout(600);

  const waehler = await p.$('.tf-fenster .segment-opt[data-fenster="90"]');
  if (!waehler){
    pruefe(false, 'Zeitraumwaehler der Tagesform gefunden');
  } else {
    // Auf einen ANDEREN Zeitraum wechseln, damit renderStateTrend() das <svg> neu baut. Genau
    // das ist der Moment aus der Rueckmeldung.
    await waehler.click();
    const gezeichnet = await verlauf(p, () => {
      const l = document.querySelector('.verlauf-svg .vl-linie');
      if (!l) return 'keine Linie';
      const s = getComputedStyle(l);
      return s.strokeDasharray === 'none' ? 'kein Muster' : Math.round(parseFloat(s.strokeDashoffset));
    }, [80, 300, 1300]);
    const spitzen = await p.evaluate(() =>
      [...document.querySelectorAll('.verlauf-svg .vl-spitze')]
        .map(e => Math.round(parseFloat(getComputedStyle(e).opacity) * 100)));

    if (reduziert){
      // Bei reduzierter Bewegung wird .vl-zeichnet gar nicht gesetzt (JS-Gatter in
      // verlaufDiagrammSVG), das Muster fehlt also ganz — und damit steht die Linie vollstaendig.
      pruefe(gezeichnet.every(v => v === 'kein Muster'),
             'Tagesform-Kurve ohne Einzeichnen sofort vollstaendig', JSON.stringify(gezeichnet));
    } else {
      const zahlen = gezeichnet.filter(v => typeof v === 'number');
      pruefe(zahlen.length === 3 && zahlen[0] > 1 && bewegtSich(gezeichnet),
             'Tagesform-Kurve zeichnet sich von links nach rechts ein', JSON.stringify(gezeichnet));
      pruefe(zahlen.length === 3 && zahlen[2] === 0,
             'Tagesform-Kurve steht am Ende vollstaendig', `(Versatz ${zahlen[zahlen.length-1]})`);
    }
    // In beiden Faellen: Der jüngste Punkt muss am Ende zu sehen sein. Er kommt NACH der Linie
    // herein — bleibt er blass, stehen zwei Werte im Diagramm, die niemand ablesen kann.
    pruefe(spitzen.length === 2 && spitzen.every(o => o === 100),
           'Endpunkte der Tagesform-Kurve am Ende voll sichtbar', JSON.stringify(spitzen));
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

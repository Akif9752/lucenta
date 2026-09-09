// Misst, wie stark der Strahlenkranz auf der Ergebnisseite tatsaechlich zu sehen ist.
//
// Warum es dieses Werkzeug gibt: In Runde 98 wurde der Kranz zweimal "verbessert", ohne dass
// sich am sichtbaren Bild etwas aenderte — einmal war er danach unsichtbar ("jetzt kann man
// den strahlenkranz gar nicht mehr sehen"). Der Denkfehler war, die MENGE Farbe konstant zu
// halten, wo das Auge den KONTRAST liest. Danach wurden sechs Einstellungen im Browser
// durchgemessen und die Tabelle in 00-grundlagen.css geschrieben — aber der Lauf selbst war
// ein Wegwerfskript. Damit war die Zahl beim naechsten Mal wieder Behauptung statt Messung.
//
// Gemessen wird der Unterschied zwischen zwei Aufnahmen derselben Stelle: einmal mit Kranz,
// einmal mit abgeschaltetem Kranz. Zwei Zahlen kommen heraus, und beide werden gebraucht:
//
//   Stufen  — der groesste Helligkeitsunterschied eines einzelnen Bildpunktes, von 255.
//             Wie kraeftig die hellste Stelle des Kranzes ist.
//   Flaeche — der Anteil der Bildpunkte, die sich ueberhaupt merklich aendern.
//             Ob daraus ein Schein wird oder einzelne Speichen.
//
// Erst beide zusammen beschreiben, was jemand sieht. Runde 97 lag bei 46 Stufen auf 7 % der
// Flaeche und wurde als "zu deutlich als einzelne Strahlen" gemeldet; Runde 98 nahm 51 Stufen
// auf 49 % und war richtig. Eine hohe Spitze auf kleiner Flaeche ist eine Speiche, dieselbe
// Spitze auf grosser Flaeche ist ein Schein.
//
// Aufruf:  node tools/mess_kranz.mjs [hell|dunkel] [deckung anteil grund] ...
// Ohne Werte wird die Einstellung gemessen, die im Stilblatt steht.
// Beispiel: node tools/mess_kranz.mjs dunkel .65 37 20 .78 44 24 .88 48 26
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

const args = process.argv.slice(2);
const modus = (args[0] === 'hell' || args[0] === 'dunkel') ? args.shift() : 'dunkel';
// Die restlichen Angaben in Dreiergruppen: Deckung, Anteil, Grund.
const reihen = [];
for (let i = 0; i + 2 < args.length; i += 3){
  reihen.push({deckung: args[i], anteil: args[i+1], grund: args[i+2]});
}
if (!reihen.length) reihen.push(null); // null = nimm, was im Stilblatt steht

// Der Kranz sitzt hinter der Ueberschrift. Genau dieser Ausschnitt wird verglichen; der Rest
// der Seite wuerde die Flaechenzahl nur verduennen.
const AUSSCHNITT = {x:0, y:150, width:393, height:420};

// Erst die Beispielnutzerin laden — ohne Bestand gibt es kein Ergebnis, und die Profilseite
// zeigt dann andere Knoepfe. Beim ersten Anlauf dieses Werkzeugs fehlte der Schritt: Das
// Suchmuster "Dein Ergebnis" traf daraufhin den Gastdurchlauf ("... Dein Ergebnis und dein
// Verlauf bleiben unangetastet"), die Ergebnisseite kam nie, und die Messung meldete
// pflichtschuldig 0 Stufen auf 0 % — eine Zahl, die nur nichts gemessen hatte.
// Deshalb prueft die Messung unten, dass die Ueberschrift ueberhaupt eine Flaeche hat.
async function zuErgebnis(p){
  await p.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
  await p.waitForTimeout(300);
  await p.evaluate(() => document.getElementById('btnDrawerProfileRow')?.click());
  await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('btnDemo')?.click());
  await p.waitForTimeout(1700);
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(600);
  // Nach dem Laden steht der Weg zum Ergebnis auf der Startseite. Der Knopf heisst
  // "Dein Ergebnis ansehen" — ein Suchmuster auf blosses "Dein Ergebnis" trifft dagegen
  // auch den Gastdurchlauf, dessen Beschreibung dieselben zwei Woerter enthaelt.
  await p.evaluate(() => {
    const b = [...document.querySelectorAll('button')]
      .find(x => /Dein Ergebnis ansehen/.test(x.textContent||''));
    b?.click();
  });
  await p.waitForTimeout(1000);
  const hat = await p.evaluate(() => {
    const h = document.querySelector('#view-result .result-head');
    return !!h && h.getBoundingClientRect().height > 40;
  });
  if (!hat){
    console.error('Die Ergebnisseite ist nicht sichtbar — die Messung waere wertlos.');
    process.exit(3);
  }
}

// Bewegung anhalten: Der Kranz dreht sich. Zwei Aufnahmen zu verschiedenen Zeitpunkten waeren
// sonst schon deshalb verschieden, und die Messung wuerde die Drehung mitzaehlen.
const STILL = '*{animation-duration:0s !important;animation-delay:0s !important;' +
              'transition-duration:0s !important;}';

async function aufnahme(p, mitKranz){
  if (!mitKranz){
    await p.addStyleTag({content:'#view-result .result-head::after{ display:none !important; }'});
  }
  await p.waitForTimeout(250);
  return await p.screenshot({clip: AUSSCHNITT});
}

// Rohe Bildpunkte aus zwei PNG holen und vergleichen. Die PNG werden ueber eine Leinwand im
// Browser gelesen — kein zusaetzliches Paket noetig, und der Browser laeuft ohnehin schon.
async function vergleich(p, a, b){
  return await p.evaluate(async ([einsB64, zweiB64]) => {
    async function punkte(b64){
      const bild = new Image();
      await new Promise(r => { bild.onload = r; bild.src = 'data:image/png;base64,' + b64; });
      const c = document.createElement('canvas');
      c.width = bild.width; c.height = bild.height;
      c.getContext('2d').drawImage(bild, 0, 0);
      return c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    }
    const eins = await punkte(einsB64), zwei = await punkte(zweiB64);
    let hoechste = 0, betroffen = 0, gesamt = 0;
    for (let i = 0; i < eins.length; i += 4){
      gesamt++;
      const d = Math.max(Math.abs(eins[i]-zwei[i]),
                         Math.abs(eins[i+1]-zwei[i+1]),
                         Math.abs(eins[i+2]-zwei[i+2]));
      if (d > hoechste) hoechste = d;
      // Schwelle 2: Ein Unterschied von einer Stufe ist Rundung beim Zeichnen, nicht Kranz.
      if (d > 2) betroffen++;
    }
    return {stufen: hoechste, flaeche: Math.round(betroffen / gesamt * 100)};
  }, [a.toString('base64'), b.toString('base64')]);
}

const browser = await chromium.launch();
console.log('Strahlenkranz, Modus: ' + modus + '\n');
console.log('  Deckung  Anteil/Grund     Stufen   Flaeche');
console.log('  ---------------------------------------------');

for (const r of reihen){
  const p = await browser.newPage({
    viewport:{width:393, height:852},
    deviceScaleFactor:2,
    colorScheme: modus === 'hell' ? 'light' : 'dark'
  });
  await p.goto(URL, {waitUntil:'networkidle'});
  await p.evaluate(() => { try{ localStorage.setItem('lucenta_plus','1'); }catch(e){} });
  await p.reload({waitUntil:'networkidle'});
  await p.waitForTimeout(400);
  await zuErgebnis(p);
  await p.addStyleTag({content: STILL});
  if (r){
    await p.addStyleTag({content:
      ':root{ --kranz-deckung:'+r.deckung+' !important;' +
      ' --kranz-anteil:'+r.anteil+'% !important;' +
      ' --kranz-grund:'+r.grund+'% !important; }'});
  }
  await p.waitForTimeout(300);

  const mit  = await aufnahme(p, true);
  const ohne = await aufnahme(p, false);
  const m = await vergleich(p, mit, ohne);

  const wie = r ? (r.deckung+'      '+r.anteil+'/'+r.grund).padEnd(21)
                : 'aus dem Stilblatt'.padEnd(21);
  console.log('  ' + wie + String(m.stufen).padStart(5) + String(m.flaeche + ' %').padStart(10));
  await p.close();
}

await browser.close();
// Bewusst KEIN Vergleichswert aus der Tabelle in 00-grundlagen.css. Die dortigen Flaechenzahlen
// stammen aus einem anderen Bildausschnitt (Runde 98: 49 %, hier: 10 % bei derselben
// Einstellung) und sind mit diesen hier nicht vergleichbar. Vergleichbar ist nur, was im
// selben Lauf gemessen wurde — deshalb steht hier der Hinweis statt einer Zahl.
console.log('\n  Vergleichbar sind nur Zeilen AUS DIESEM LAUF. Fuer hell gegen dunkel beide');
console.log('  Modi nacheinander messen; die Tabelle in 00-grundlagen.css nutzt einen');
console.log('  anderen Bildausschnitt und passt zahlenmaessig nicht dazu.');

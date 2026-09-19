// Wo verliert Lucenta Bilder?  `npm run mess-fluessigkeit`
//
// Runde 109. Der Anlass ist Punkt 7 der Rueckmeldungsliste ("Fluessigkeit") und eine Behauptung
// aus Runde 103, die im Journal steht und bisher niemand nachgemessen hat: Der groesste Hebel sei
// der Release-Bau statt Debug.
//
// **Diese Behauptung ist fuer die Oberflaeche falsch**, und es lohnt, den Grund einmal
// aufzuschreiben, damit sie nicht wiederkommt: Lucenta zeichnet nichts in Swift. Die ganze
// Oberflaeche laeuft in einer WKWebView, und die laeuft in einem EIGENEN Prozess
// (com.apple.WebKit.WebContent), den Apple gebaut hat. Wie der Swift-Wirt kompiliert wurde, hat
// auf WebKits Layout, Zeichnen und JIT keinerlei Einfluss. Debug gegen Release beruehrt unseren
// eigenen Swift-Code (MainViewController, die Kauf-Bruecke) und den von Capacitor — beides laeuft
// beim Start und bei Bruecken-Aufrufen, nicht waehrend einer Animation.
//
// Also wird hier gemessen, wo Bilder TATSAECHLICH verloren gehen: in der Oberflaeche selbst, auf
// WebKit, Bild fuer Bild.
//
// **Was diese Messung kann und was nicht — und das ist der wichtigste Absatz hier.**
//
// Der erste Lauf dieser Runde meldete fuer JEDE Szene denselben Median (17,0ms), null lange
// Bilder und null Unterschied zwischen "mit" und "ohne backdrop-filter". Das sah nach "alles
// fluessig" aus. Es war aber "nicht gemessen", und der Unterschied ist der ganze Punkt.
//
// Deshalb eicht dieses Werkzeug sich vor jedem Lauf selbst, mit zwei Proben, deren Ergebnis
// feststeht. Gemessen auf diesem Rechner:
//
//     A  Ruhe                                      Median 17ms, 90 Bilder
//     B  Hauptfaden 25ms je Bild blockiert         Median 25ms, 59 Bilder   <- wird gesehen
//     C  blur(120px) auf der ganzen Seite, animiert Median 17ms, 90 Bilder  <- wird NICHT gesehen
//     D  backdrop-filter blur(200px)               Median 17ms, 90 Bilder   <- wird NICHT gesehen
//
// Headless-WebKit legt die Kosten der Zusammensetzung (GPU) gar nicht auf die rAF-Zeitachse.
// Daraus folgt hart:
//
//   - Was dieses Werkzeug misst, ist **Arbeit auf dem Hauptfaden**: Layout, JavaScript, das
//     Zeichnen der Zeichenflaeche, das Bauen von DOM. Dort ist es empfindlich und brauchbar.
//   - Was es NICHT messen kann, ist **backdrop-filter, filter, Schatten und Transparenz** — also
//     ausgerechnet das, was das Journal als naechsten Hebel nennt. Eine Null in dieser Spalte ist
//     KEIN Freispruch.
//
// Wer die Glas-Frage beantworten will, braucht ein Geraet. Und dafuer gibt es bereits einen
// Schalter: "Transparenz reduzieren" in den iOS-Bedienhilfen schaltet seit Runde 106 nativ jeden
// backdrop-filter der App ab (MainViewController.swift setzt data-transparenz="reduziert"). Ein
// Finger, zwei Zustaende, derselbe Bildschirm — das ist die Messung, die zaehlt.
//
// Der lokale Server auf 8017 muss laufen:
//   cd dist && python3 -m http.server 8017 --bind 127.0.0.1

import { webkit } from 'playwright';

const BASIS = process.env.LUCENTA_BASIS || 'http://127.0.0.1:8017';
const DATEI = process.env.LUCENTA_DATEI || 'lucenta.html';
const RUNDEN = Number(process.env.LUCENTA_RUNDEN || 5);

// Ein Bild bei 60 Hz dauert 16,7ms. Ein Bild ueber 33ms bedeutet, dass mindestens eines
// ausgefallen ist — das ist die Schwelle, ab der ein Mensch ein Ruckeln sieht.
const BILD = 1000 / 60;
const LANG = 33;

const zahl = (n, b = 1) => n.toFixed(b).padStart(6);

// --- Bilder aufzeichnen, waehrend etwas passiert -----------------------------------------
async function bilderMessen(seite, tun, dauerMs) {
  await seite.evaluate(() => {
    window.__bilder = [];
    let vorher = performance.now();
    window.__laeuft = true;
    const takt = (t) => {
      if (!window.__laeuft) return;
      window.__bilder.push(t - vorher);
      vorher = t;
      requestAnimationFrame(takt);
    };
    requestAnimationFrame(takt);
  });
  await tun();
  await seite.waitForTimeout(dauerMs);
  return await seite.evaluate(() => {
    window.__laeuft = false;
    // Das erste Bild misst den Abstand zum Start der Aufzeichnung, nicht zum vorigen Bild.
    return window.__bilder.slice(1);
  });
}

function auswerten(bilder) {
  if (!bilder.length) return null;
  const s = bilder.slice().sort((a, b) => a - b);
  const p = (q) => s[Math.min(s.length - 1, Math.floor(s.length * q))];
  return {
    n: bilder.length,
    median: p(0.5),
    p95: p(0.95),
    schlimmstes: s[s.length - 1],
    lange: bilder.filter((d) => d > LANG).length,
    ueberBild: bilder.filter((d) => d > BILD * 1.5).length
  };
}

// --- Die Szenen --------------------------------------------------------------------------
// Jede oeffnet die Seite frisch. Ein Zustand aus der vorigen Szene waere sonst die haeufigste
// Quelle fuer einen Unterschied, der keiner ist.
// `gpu: true` heisst: Der Verdaechtige ist eine Zusammensetzungs-Kosten (backdrop-filter,
// filter, Schatten). Solche Szenen werden gemessen, ihr Ergebnis aber NICHT als Aussage
// gewertet, solange die Eichung meldet, dass GPU-Kosten unsichtbar sind.
const SZENEN = [
  {
    name: 'Schublade oeffnet',
    verdaechtig: 'backdrop-filter der Schublade (20px)',
    gpu: true,
    aus: '#drawerPanel{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;}',
    dauer: 900,
    tun: async (s) => { await s.evaluate(() => document.getElementById('btnDrawerToggle')?.click()); }
  },
  {
    name: 'Schublade schliesst',
    verdaechtig: 'backdrop-filter der Schublade (20px)',
    gpu: true,
    aus: '#drawerPanel{-webkit-backdrop-filter:none!important;backdrop-filter:none!important;}',
    dauer: 900,
    vorbereiten: async (s) => {
      await s.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
      await s.waitForTimeout(800);
    },
    tun: async (s) => { await s.evaluate(() => document.getElementById('btnDrawerClose')?.click()); }
  },
  {
    name: 'Ansichtswechsel zu den Archetypen (10 Karten)',
    verdaechtig: 'das Bauen der 10 Karten (DOM, Hauptfaden)',
    gpu: false,
    // Hier wird NICHT das Glas abgeschaltet, sondern der Inhalt: Was diese Szene teuer machen
    // kann, ist innerHTML mit zehn Karten plus zehn gestaffelte Animationen — und das laeuft auf
    // dem Hauptfaden, ist hier also messbar.
    aus: '.role-card{animation:none!important;opacity:1!important;}',
    dauer: 1400,
    vorbereiten: async (s) => {
      await s.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
      await s.waitForTimeout(800);
    },
    tun: async (s) => { await s.evaluate(() => document.getElementById('btnDrawerArchetypes')?.click()); }
  },
  {
    name: 'Fragebogen: eine Frage weiter',
    verdaechtig: 'der stehende Sternenhimmel im Fragebogen',
    gpu: false,
    aus: '#sternenhimmel{display:none!important;}',
    dauer: 800,
    vorbereiten: async (s) => {
      await s.evaluate(() => document.getElementById('btnStart')?.click());
      await s.waitForTimeout(900);
    },
    tun: async (s) => {
      await s.evaluate(() => document.querySelector('#scaleRow .scale-btn:nth-child(4)')?.click());
    }
  },
  {
    name: 'Startseite im Ruhezustand (Sternenhimmel laeuft)',
    verdaechtig: 'der bewegte Sternenhimmel (Zeichenflaeche, Hauptfaden)',
    gpu: false,
    aus: '#sternenhimmel{display:none!important;}',
    dauer: 1600,
    tun: async () => {}
  }
];

// --- Lauf --------------------------------------------------------------------------------
console.log('\n=== Wo verliert Lucenta Bilder? (WebKit, 390x844) ===');
console.log(`    ${RUNDEN} Durchlaeufe je Szene und Zustand. Ein Bild > ${LANG}ms = mindestens eines ausgefallen.`);
console.log('    Die absoluten Zahlen gelten fuer DIESE Maschine. Die Aussage ist der Vergleich.\n');

const browser = await webkit.launch();

// --- Eichung: sieht dieses Werkzeug ueberhaupt etwas? -------------------------------------
// Ohne diesen Schritt ist jede Null unten mehrdeutig — "kostet nichts" und "wird nicht gemessen"
// sehen in der Ausgabe gleich aus. Genau das ist im ersten Lauf dieser Runde passiert.
async function probe(vorbereiten, dauer = 1200) {
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const s = await c.newPage();
  await s.goto(`${BASIS}/${DATEI}`, { waitUntil: 'networkidle' });
  await s.evaluate(() => document.fonts.ready);
  await s.waitForTimeout(500);
  if (vorbereiten) await vorbereiten(s);
  const b = await bilderMessen(s, async () => {}, dauer);
  await c.close();
  return auswerten(b);
}
const eichRuhe = await probe(null);
const eichFaden = await probe(async (s) => {
  await s.evaluate(() => {
    const f = () => { const e = performance.now() + 25; while (performance.now() < e); requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
});
const eichGlas = await probe(async (s) => {
  await s.addStyleTag({ content:
    '@keyframes __eich{from{filter:blur(0px) hue-rotate(0deg);}to{filter:blur(120px) hue-rotate(360deg);}}' +
    '#shell{animation:__eich 1s linear infinite !important;}' });
});
const siehtFaden = eichFaden.median > eichRuhe.median * 1.3;
const siehtGlas = eichGlas.median > eichRuhe.median * 1.3;

console.log('  Eichung (laeuft vor jeder Messung, damit eine Null eindeutig ist):');
console.log(`    Ruhe                       Median ${zahl(eichRuhe.median)}ms, ${eichRuhe.n} Bilder`);
console.log(`    Hauptfaden 25ms blockiert  Median ${zahl(eichFaden.median)}ms, ${eichFaden.n} Bilder` +
            `   -> Hauptfaden-Kosten ${siehtFaden ? 'SICHTBAR' : 'UNSICHTBAR'}`);
console.log(`    blur(120px) animiert       Median ${zahl(eichGlas.median)}ms, ${eichGlas.n} Bilder` +
            `   -> GPU-Kosten ${siehtGlas ? 'SICHTBAR' : 'UNSICHTBAR'}`);
if (!siehtFaden) {
  console.log('\n  ABBRUCH: Dieses Werkzeug sieht nicht einmal einen blockierten Hauptfaden.');
  console.log('  Jede Zahl darunter waere bedeutungslos.\n');
  await browser.close();
  process.exit(2);
}
if (!siehtGlas) {
  console.log('\n  ACHTUNG: GPU-Kosten sind hier UNSICHTBAR (headless WebKit setzt nicht zusammen).');
  console.log('  Jede Null bei einem backdrop-filter/filter/Schatten bedeutet NICHT "kostet nichts",');
  console.log('  sondern "nicht gemessen". Diese Frage gehoert aufs Geraet — dort beantwortet sie');
  console.log('  der Schalter "Transparenz reduzieren" in den Bedienhilfen mit einem Finger.');
}
console.log('');

async function szeneMessen(szene, ohneVerdaechtigen) {
  const alle = [];
  for (let i = 0; i < RUNDEN; i++) {
    const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const s = await c.newPage();
    await s.goto(`${BASIS}/${DATEI}`, { waitUntil: 'networkidle' });
    await s.evaluate(() => document.fonts.ready);
    if (ohneVerdaechtigen) await s.addStyleTag({ content: szene.aus });
    await s.waitForTimeout(600);
    if (szene.vorbereiten) await szene.vorbereiten(s);
    const bilder = await bilderMessen(s, () => szene.tun(s), szene.dauer);
    alle.push(...bilder);
    await c.close();
  }
  return auswerten(alle);
}

const ergebnisse = [];
for (const szene of SZENEN) {
  const mit = await szeneMessen(szene, false);
  const ohne = await szeneMessen(szene, true);
  ergebnisse.push({ szene, mit, ohne });

  const blind = szene.gpu && !siehtGlas;
  console.log(`  ${szene.name}${blind ? '   [GPU — hier NICHT messbar]' : ''}`);
  console.log(`    wie sie ist : Median ${zahl(mit.median)}ms  p95 ${zahl(mit.p95)}ms  ` +
              `schlimmstes ${zahl(mit.schlimmstes)}ms  lange Bilder ${mit.lange}/${mit.n}`);
  console.log(`    ohne        : Median ${zahl(ohne.median)}ms  p95 ${zahl(ohne.p95)}ms  ` +
              `schlimmstes ${zahl(ohne.schlimmstes)}ms  lange Bilder ${ohne.lange}/${ohne.n}`);
  const d = mit.lange - ohne.lange;
  const dp = mit.p95 - ohne.p95;
  if (blind) {
    console.log(`    -> "${szene.verdaechtig}" ist eine GPU-Kosten. Die Null hier ist KEINE Aussage.\n`);
  } else {
    console.log(`    -> ohne "${szene.verdaechtig}": ${Math.abs(d)} lange Bilder ` +
                `${d > 0 ? 'WENIGER' : d < 0 ? 'MEHR' : 'gleich'}, ` +
                `p95 ${dp >= 0 ? '-' : '+'}${Math.abs(dp).toFixed(1)}ms\n`);
  }
}

await browser.close();

console.log('======================================================');
const messbar = ergebnisse.filter((e) => !(e.szene.gpu && !siehtGlas));
const blinde = ergebnisse.filter((e) => e.szene.gpu && !siehtGlas);
console.log('Gemessen (Hauptfaden), groesster Hebel zuerst:');
const sortiert = messbar.slice().sort((a, b) => (b.mit.lange - b.ohne.lange) - (a.mit.lange - a.ohne.lange));
for (const e of sortiert) {
  console.log(`  ${String(e.mit.lange - e.ohne.lange).padStart(4)} lange Bilder  ${e.szene.verdaechtig}`);
}
if (blinde.length) {
  console.log('\nNICHT gemessen (GPU, auf dieser Maschine unsichtbar) — gehoert aufs Geraet:');
  for (const e of blinde) console.log(`       ${e.szene.verdaechtig}  (${e.szene.name})`);
  console.log('  Dort mit einem Finger: Bedienhilfen > Transparenz reduzieren (seit Runde 106 nativ).');
}
console.log('======================================================\n');
console.log('Das ist ein BERICHT, kein Bestanden/Durchgefallen.\n');

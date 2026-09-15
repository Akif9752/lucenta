#!/usr/bin/env node
/**
 * Setzt aus src/ wieder eine einzelne HTML-Datei zusammen.
 *
 * Warum ein Aufbauschritt und nicht mehrere Dateien im Browser: Die Veroeffentlichung als
 * Artefakt braucht genau eine Datei, und die App soll ohne Server lauffaehig bleiben — man kann
 * dist/lucenta.html direkt im Browser oeffnen. Die Aufteilung dient der Entwicklung, nicht der
 * Auslieferung.
 *
 * Die Reihenfolge steht in src/manifest.json und ist BEDEUTSAM: Beim CSS entscheidet sie ueber
 * die Kaskade (die Druckzustaende muessen zuletzt stehen, siehe Runde 53), beim JavaScript ueber
 * die Ausfuehrungsreihenfolge.
 */
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'src');
const OUT = path.join(__dirname, 'dist', 'lucenta.html');
const man = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
const read = (...p) => fs.readFileSync(path.join(SRC, ...p), 'utf8');

const css = man.css.map(f => read('styles', f)).join('');
// Sprachpakete: ALLE Dateien in src/i18n, nicht zwei fest benannte. Deutsch zuerst, weil es die
// Rueckfallsprache ist und im Quelltext oben stehen soll; die uebrigen alphabetisch. Ein neues
// Paket wird damit allein durch Hinzulegen der Datei wirksam — die frueher hier stehende feste
// Liste war beim Sprung von zwei auf sieben Sprachen die erste Stelle, die man vergisst.
const i18nDateien = fs.readdirSync(path.join(SRC, 'i18n'))
  .filter(f => f.endsWith('.js'))
  .sort((a, b) => (a === 'de.js' ? -1 : b === 'de.js' ? 1 : a.localeCompare(b)));
const i18n = i18nDateien.map(f => read('i18n', f)).join('');
const js = man.js.map(f => read('js', f)).join('').replace('@@I18N@@\n', i18n);

// ---------- Der Bau prueft, ob das Ergebnis ueberhaupt laeuft (Runde 90) ----------
//
// Anlass: Eine fehlende schliessende Klammer in 22-sternenhimmel.js kam durch ALLE sechs
// Pruefschichten. Der Bau haengt nur Text aneinander und merkt nichts; die Testreihen laden
// den gemeinsamen Bereich bis zu einer Marke und sahen die Datei gar nicht; der i18n-Pruefer
// liest den Quelltext als Text. Gruen gemeldet, und im Browser startete die App nicht — kein
// Hintergrund, kein Text, gar nichts.
//
// Ein Bau, der kaputten Code ausliefert und dabei "fertig" sagt, ist schlimmer als keiner.
// new Function() parst, ohne auszufuehren: Das reicht fuer genau diese Fehlerklasse und
// braucht weder Browser noch Abhaengigkeit.
function pruefeSyntax(name, quelltext){
  try{ new Function(quelltext); }
  catch(e){
    console.error('\nBAU ABGEBROCHEN — ' + name + ' laesst sich nicht lesen:\n  ' + e.message + '\n');
    process.exit(1);
  }
}
pruefeSyntax('das zusammengesetzte JavaScript', js);

// Die Farben des Ergebnisbildes stehen in 10-ergebnisbild.js fest verdrahtet — auf einer
// Leinwand gibt es keine CSS-Marken. Sie MUESSEN denen der App entsprechen, sonst verschickt
// jemand eine Karte in einer Farbe, die es in der App nicht gibt. Genau das ist in Runde 90
// passiert: Die Palette wurde dunkler, die Karte blieb auf dem alten Wert stehen, und
// aufgefallen ist es erst zwei Runden spaeter beim Lesen des Codes.
//
// Diese Pruefung vergleicht beide Quellen im Quelltext. Sie kann das, weil beide Seiten
// dieselben sechs Marken benutzen; sie kann NICHT pruefen, ob eine Marke woanders ueberschrieben
// wird — dafuer ist sie zu einfach, und dafuer gibt es die Fehlersuche im Browser.
function pruefeBildfarben(css, js){
  const MARKEN = [['paper','--paper'], ['ink','--ink'], ['muted','--muted'],
                  ['line','--line'], ['accent','--accent'], ['accent2','--accent-2']];
  // Der Hellblock ist alles vor der ersten Dunkel-Regel, der Dunkelblock der Abschnitt
  // [data-theme="dark"].
  const dunkelAb = css.indexOf('@media (prefers-color-scheme: dark)');
  const bloecke = {
    hell: dunkelAb > 0 ? css.slice(0, dunkelAb) : css,
    dunkel: (function(){
      const a = css.indexOf(':root[data-theme="dark"]');
      if (a < 0) return '';
      const e = css.indexOf('}', a);
      return e < 0 ? css.slice(a) : css.slice(a, e);
    })()
  };
  const ausCss = (block, marke) => {
    const m = new RegExp('\\' + marke.slice(1) + ':\\s*(#[0-9A-Fa-f]{6})').exec(block);
    return m ? m[1].toUpperCase() : null;
  };
  const ausJs = (name) => {
    const m = new RegExp('var\\s+' + name + '\\s*=\\s*\\{([^}]*)\\}').exec(js);
    if (!m) return null;
    const feld = {};
    m[1].split(',').forEach(t => {
      const p2 = /([A-Za-z0-9_]+)\s*:\s*'([^']*)'/.exec(t);
      if (p2) feld[p2[1]] = p2[2].toUpperCase();
    });
    return feld;
  };
  const paare = [['SHARE_COLORS', 'hell'], ['SHARE_COLORS_DARK', 'dunkel']];
  const abweichungen = [];
  for (const [name, block] of paare){
    const bild = ausJs(name);
    if (!bild){ abweichungen.push(name + ' nicht gefunden'); continue; }
    for (const [feld, marke] of MARKEN){
      const soll = ausCss(bloecke[block], marke);
      if (!soll){ abweichungen.push(marke + ' im ' + block + 'block nicht gefunden'); continue; }
      if (bild[feld] !== soll){
        abweichungen.push('  ' + name + '.' + feld + ' = ' + bild[feld] + ', ' + marke +
                          ' (' + block + ') = ' + soll);
      }
    }
  }
  if (abweichungen.length){
    console.error('\nBAU ABGEBROCHEN — das Ergebnisbild benutzt andere Farben als die App:\n' +
                  abweichungen.join('\n') +
                  '\n\nBeides muss uebereinstimmen: SHARE_COLORS in src/js/10-ergebnisbild.js\n' +
                  'und die Marken in src/styles/00-grundlagen.css.\n');
    process.exit(1);
  }
}
pruefeBildfarben(css, js);

// Der Dunkelmodus steht zweimal im Stilblatt: einmal fuer die Systemvorgabe
// (@media prefers-color-scheme) und einmal fuer die ausdrueckliche Wahl
// (:root[data-theme="dark"]). Beide MUESSEN dieselben Marken tragen. Steht eine nur im einen
// Block, faellt sie im anderen stillschweigend auf den Wert des Hellmodus zurueck — und das
// sieht man erst, wenn jemand genau diese Kombination oeffnet.
//
// Runde 94 ist genau das passiert, und zwar durch einen Fehler beim Einfuegen: Ein Suchmuster
// mit vier Leerzeichen Einrueckung passt auch mitten in eine Zeile mit sechs Leerzeichen.
// Beide Einfuegungen landeten dadurch im selben Block, und die sechs Himmelsmarken fehlten
// eine Runde lang im anderen. Diese Pruefung vergleicht schlicht die beiden Namenslisten.
function pruefeDunkelbloecke(css){
  const a = css.indexOf('@media (prefers-color-scheme: dark)');
  const b = css.indexOf(':root[data-theme="dark"]');
  if (a < 0 || b < 0 || b < a) return;
  const namen = (text) => new Set((text.match(/--[a-z0-9-]+(?=\s*:)/g) || []));
  const imMedia = namen(css.slice(a, b));
  const ende = css.indexOf('\n  }', b);
  const imAusdruecklichen = namen(css.slice(b, ende < 0 ? css.length : ende));
  const nurA = [...imMedia].filter(n => !imAusdruecklichen.has(n));
  const nurB = [...imAusdruecklichen].filter(n => !imMedia.has(n));
  if (nurA.length || nurB.length){
    console.error('\nBAU ABGEBROCHEN — die beiden Dunkelbloecke tragen nicht dieselben Marken:');
    if (nurA.length) console.error('  nur unter @media prefers-color-scheme: ' + nurA.join(', '));
    if (nurB.length) console.error('  nur unter :root[data-theme="dark"]:      ' + nurB.join(', '));
    console.error('\nEine Marke, die nur in einem der beiden steht, faellt im anderen auf den\n' +
                  'Wert des Hellmodus zurueck.\n');
    process.exit(1);
  }
}
pruefeDunkelbloecke(css);

// Runde 95: "jegliche desktop referenzen sollen raus weil die app ja ausschliesslich fuer
// iphone ist." Entfernt waren sie damit — aber sie kommen zurueck, wenn niemand hinsieht: Ein
// Hinweistext, der beilaeufig "oder rechtsklicken" ergaenzt, faellt beim Lesen nicht auf, und
// bei sieben Sprachen faellt er siebenmal nicht auf.
//
// Diese Pruefung haelt eine kurze Liste von Woertern und Regeln, die es auf einem iPhone
// schlicht nicht gibt. Sie ist bewusst KURZ: Jeder Eintrag muss auf dem Zielgeraet nachweislich
// wirkungslos oder falsch sein. "Maus", "klicken" oder "Browser" stehen deshalb NICHT darin —
// ein Browser ist auf dem iPhone durchaus vorhanden, und die Datenschutzerklaerung muss ihn
// nennen duerfen.
// Kommentare zaehlen nicht. Der erste Lauf dieser Pruefung hat den Kommentar getroffen, der
// die Entfernung der Bildlaufleiste ERKLAERT — ein Text, der beschreibt, was nicht mehr da ist,
// ist kein Rueckfall. Gemessen wird, was die App tut und anzeigt.
//
// Bewusst einfach gehalten: Blockkommentare ganz, Zeilenkommentare nur dort, wo sie eine Zeile
// beginnen. Ein "//" mitten in einer Zeichenkette (etwa in einer Adresse) bleibt damit stehen —
// das kann hoechstens einen Fund verschlucken, nie einen erfinden, und in dieser Richtung ist
// der Fehler der harmlosere.
function ohneKommentare(text){
  return String(text)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^[ \t]*\/\/.*$/gm, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}
function pruefeIphoneOnly(rohtext, was){
  const text = ohneKommentare(rohtext);
  const VERBOTEN = [
    // Bedienung, die es ohne Maus und Hardwaretastatur nicht gibt
    ['Rechtsklick', 'Rechtsklick'], ['rechtsklicken', 'rechtsklicken'],
    ['right-click', 'right-click'], ['clic derecho', 'clic derecho'],
    ['clic droit', 'clic droit'], ['clic destro', 'clic destro'],
    ['bot\u00e3o direito', 'botao direito'], ['\u53f3\u30af\u30ea\u30c3\u30af', 'Rechtsklick (ja)'],
    // Geraetebezeichnungen, die eine zweite Zielplattform behaupten
    ['Desktop', 'Desktop'], ['desktop', 'desktop'],
    ['escritorio', 'escritorio'], ['ordinateur', 'ordinateur'],
    ['\u30d1\u30bd\u30b3\u30f3', 'Rechner (ja)'],
    // Fensterschmuck, den iOS Safari gar nicht zeichnet
    ['::-webkit-scrollbar', '::-webkit-scrollbar'],
    ['@media print', '@media print']
  ];
  const funde = [];
  for (const [muster, name] of VERBOTEN){
    const wort = muster.replace(/\\u([0-9a-f]{4})/gi, (m, h) => String.fromCharCode(parseInt(h, 16)));
    let i = text.indexOf(wort);
    if (i >= 0){
      const zeile = text.slice(0, i).split('\n').length;
      funde.push('  ' + name + ' (' + was + ', Zeile ' + zeile + ')');
    }
  }
  return funde;
}
{
  const funde = pruefeIphoneOnly(css, 'CSS')
    .concat(pruefeIphoneOnly(js, 'JavaScript'))
    .concat(pruefeIphoneOnly(read('index.body.html'), 'index.body.html'));
  if (funde.length){
    console.error('\nBAU ABGEBROCHEN — es steht wieder etwas drin, das es auf einem iPhone nicht gibt:\n' +
                  funde.join('\n') +
                  '\n\nLucenta ist ausschliesslich fuer das iPhone. Bedienung ueber Maus oder\n' +
                  'Hardwaretastatur, Geraetenamen anderer Plattformen und Fensterschmuck gehoeren\n' +
                  'nicht hinein.\n');
    process.exit(1);
  }
}

const html = read('index.head.html') + '<style>' + css + '</style>' +
             read('index.body.html') + '<script>' + js + '</script>' + read('index.tail.html');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);

// Runde 101, gemeldet von der Xcode-Sitzung (docs/ios-huelle-journal.md, Punkt 2):
// "npx cap sync ios" bricht ab mit "The web assets directory (./dist) must contain an
// index.html file". Capacitor laedt aus webDir zwingend index.html; hier hiess die Datei nur
// lucenta.html. Die Huelle musste das bei JEDEM Sync von Hand nachkopieren — ein Schritt, den
// man einmal vergisst und dann eine leere App im Simulator hat, ohne dass irgendwo ein Fehler
// steht. Deshalb schreibt der Bau beide Namen.
//
// Bewusst dieselbe Datei zweimal statt einer Weiterleitung: Eine Weiterleitung waere ein
// zweiter Ladevorgang und muesste sich mit limitsNavigationsToAppBoundDomains vertragen. Der
// doppelte Platz faellt nicht ins Gewicht — dist/ ist erzeugt und nicht versioniert.
//
// lucenta.html bleibt der Hauptname: Alle Werkzeuge und der lokale Vorschau-Server zeigen
// darauf, und die Datei wird auch einzeln verschickt und als Artefakt veroeffentlicht.
//
// ---------- Runde 102: Die App-Fassung traegt die Schriften ALS DATEIEN ----------
//
// Gemessen auf dem iPhone-18-Pro-Simulator (iOS 27): Startseite sichtbar nach 7,6 s im
// Debug-Bau, 3,4 s im Release-Bau. Von den 1,5 MB der Datei sind 240 KB base64-Schriften
// (fuenf Schnitte), und die stehen in einer CSS-Regel im <style> — der Parser muss sie also
// mitten im Aufbau der Seite dekodieren, bevor irgendetwas erscheint.
//
// Als eigene Dateien holt WebKit sie NEBEN dem Aufbau, und `font-display:swap` (steht bereits in
// 00-schriften.css) laesst den Text sofort in der Rueckfallschrift erscheinen. Die Schriften
// tauschen sich danach still ein.
//
// Warum nur index.html und nicht auch lucenta.html: Das Projekt liefert bewusst EINE Datei —
// lucenta.html wird einzeln verschickt, als Artefakt veroeffentlicht und direkt im Browser
// geoeffnet; extern verlinkte Schriften wuerden dort ins Leere zeigen. Die acht Pruefungen und der
// Vorschau-Server zeigen ebenfalls auf lucenta.html und messen damit weiter die vollstaendige
// Fassung. Nur die App-Huelle (Capacitor laedt index.html aus dem Bundle, wo die Schriften
// daneben liegen) bekommt die aufgeteilte Fassung.
// ---------- Runde 102: Die App-Fassung traegt keine Kommentare ----------
//
// Gemessen an der App-Datei (1233 KB): 246 KB sind Kommentare — 42 % des JavaScripts und 52 % des
// CSS. Das ist kein Ballast, sondern das Projektgedaechtnis ("Runde 74, gemeldet vom iPhone: …"),
// und es bleibt in `src/` und in `lucenta.html` vollstaendig erhalten. Nur die Fassung, die im
// App-Bundle liegt und beim Start geparst werden muss, braucht es nicht: Dort liest sie niemand.
//
// Bewusst esbuild und kein eigener Regex: Ein Regex ueber `//` und `/* */` zerschneidet Strings mit
// `https://`, Regex-Literale und `content:"/*"` im CSS — ein Fehler, der erst auf dem Geraet
// auffaellt. esbuild parst richtig.
//
// Ebenso bewusst NUR Whitespace und Kommentare: `minifyIdentifiers` (Namen kuerzen) und
// `minifySyntax` (Code umformen) bleiben AUS. Die acht Pruefungen messen `lucenta.html`, also die
// unminifizierte Fassung — eine umgeformte App-Fassung waere ungeprueft unterwegs. Kommentare zu
// entfernen kann die Bedeutung des Codes nicht aendern; Namen zu kuerzen kann es.
const esbuild = require('esbuild');
function fuerAppEntschlacken(quelle, art) {
  try {
    return esbuild.transformSync(quelle, {
      loader: art,
      minifyWhitespace: true,
      minifyIdentifiers: false,
      minifySyntax: false,
      legalComments: 'none',
      charset: 'utf8'
    }).code;
  } catch (e) {
    console.error(`\nBau abgebrochen: esbuild konnte das ${art.toUpperCase()} der App-Fassung nicht\n` +
                  `verarbeiten: ${e.message}\n` +
                  `Die Ein-Datei-Fassung (dist/lucenta.html) ist davon unberuehrt.\n`);
    process.exit(1);
  }
}

const SCHRIFT_ORDNER = 'schriften';
const schriftZiel = path.join(path.dirname(OUT), SCHRIFT_ORDNER);
fs.mkdirSync(schriftZiel, { recursive: true });
for (const alt of fs.existsSync(schriftZiel) ? fs.readdirSync(schriftZiel) : []) {
  if (alt.endsWith('.woff2')) fs.unlinkSync(path.join(schriftZiel, alt));   // Reste vom letzten Bau
}

// Die App-Fassung wird aus den EINZELNEN Teilen neu gesetzt, nicht aus dem fertigen HTML: So
// bekommt esbuild das CSS als CSS und das JavaScript als JavaScript. Ueber die fertige Seite
// koennte es nicht unterscheiden.
const cssApp = fuerAppEntschlacken(css, 'css');
const jsApp  = fuerAppEntschlacken(js, 'js');
const htmlRoh = read('index.head.html') + '<style>' + cssApp + '</style>' +
                read('index.body.html') + '<script>' + jsApp + '</script>' + read('index.tail.html');

let schriftNr = 0, schriftBytes = 0;
const htmlApp = htmlRoh.replace(
  /url\(data:font\/woff2;base64,([A-Za-z0-9+/=]+)\)/g,
  (_treffer, b64) => {
    schriftNr++;
    const daten = Buffer.from(b64, 'base64');
    // Der Name kommt aus dem Inhalt, nicht aus der Reihenfolge: So aendert sich der Dateiname nur,
    // wenn sich die Schrift aendert, und ein alter Stand im WebView-Zwischenspeicher kann nicht
    // stillschweigend weiterverwendet werden.
    const marke = require('crypto').createHash('sha256').update(daten).digest('hex').slice(0, 10);
    const name = `s${schriftNr}-${marke}.woff2`;
    fs.writeFileSync(path.join(schriftZiel, name), daten);
    schriftBytes += daten.length;
    return `url(${SCHRIFT_ORDNER}/${name})`;
  }
);
if (schriftNr === 0) {
  console.error('\nBau abgebrochen: keine eingebetteten Schriften gefunden.\n' +
                'Erwartet wurde url(data:font/woff2;base64,...) in src/styles/00-schriften.css.\n' +
                'Wurde die Einbettung geaendert, muss dieser Schritt mitgeaendert werden — sonst\n' +
                'traegt die App-Fassung stillschweigend keine Schriften mehr.\n');
  process.exit(1);
}
fs.writeFileSync(path.join(path.dirname(OUT), 'index.html'), htmlApp);

const gz = require('zlib').gzipSync(Buffer.from(html), { level: 9 }).length;
console.log('dist/lucenta.html  %s KB roh, %s KB gzip  (%d CSS-, %d JS-Teile, %d Sprachen)',
  (Buffer.byteLength(html) / 1024).toFixed(1), (gz / 1024).toFixed(1), man.css.length, man.js.length,
  i18nDateien.length);
console.log('dist/index.html    %s KB (App-Fassung) + %d Schriften als Dateien (%s KB)',
  (Buffer.byteLength(htmlApp) / 1024).toFixed(1), schriftNr, (schriftBytes / 1024).toFixed(1));

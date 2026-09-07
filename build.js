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

const html = read('index.head.html') + '<style>' + css + '</style>' +
             read('index.body.html') + '<script>' + js + '</script>' + read('index.tail.html');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);

const gz = require('zlib').gzipSync(Buffer.from(html), { level: 9 }).length;
console.log('dist/lucenta.html  %s KB roh, %s KB gzip  (%d CSS-, %d JS-Teile, %d Sprachen)',
  (Buffer.byteLength(html) / 1024).toFixed(1), (gz / 1024).toFixed(1), man.css.length, man.js.length,
  i18nDateien.length);

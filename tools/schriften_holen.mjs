// Holt die drei Schriften einmalig von Google und legt sie als Stilblatt mit eingebetteten
// Daten in src/styles/00-schriften.css ab.
//
// Warum ueberhaupt: Bis Runde 80 lud die App ihre Schriften bei jedem Oeffnen von
// fonts.googleapis.com. Das hat zwei Folgen, die beide gegen sie sprechen.
//
//   1. Datenschutz. Jeder Aufruf uebertraegt die IP-Adresse der lesenden Person an einen
//      Dritten, ohne dass sie zustimmen konnte. Genau dafuer ist in Deutschland schon
//      abgemahnt worden (LG Muenchen I, 3 O 17493/20). Eine App, die damit wirbt, dass die
//      Antworten das Geraet nicht verlassen, darf nicht bei jedem Start jemanden anrufen.
//   2. Sie funktioniert ohne Netz nicht richtig. Fuer eine Web-Seite ist das laestig, fuer
//      eine App aus dem App Store ist es ein Fehler: Sie startet in der U-Bahn mit
//      Systemschrift und sieht aus wie ein halb geladenes Formular.
//
// Beides faellt weg, sobald die Schriften in der Datei selbst stehen. Der Preis ist Groesse,
// und der wird hier so klein wie moeglich gehalten:
//
//   - Nur die Untermenge "latin". Die sechs lateinischen Sprachen der App brauchen nichts
//     darueber hinaus; Japanisch wird ohnehin von der Systemschrift gesetzt, weil keine der
//     drei Schriften japanische Zeichen enthaelt.
//   - Nur eine Datei je Schnitt. Google liefert fuer 400, 500, 600 und 700 dieselbe
//     veraenderliche Datei; hier steht sie einmal, mit einem Gewichtsbereich statt vier
//     festen Angaben.
//
// Laeuft nicht im Bau mit — das Ergebnis ist eingecheckt, damit "node build.js" ohne Netz
// funktioniert. Nur aufrufen, wenn die Schriften wirklich getauscht werden sollen:
//   node tools/schriften_holen.mjs

import fs from 'fs';
import path from 'path';

const ABRUF = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,500&family=Work+Sans:wght@400..700&family=IBM+Plex+Mono:wght@400;500&display=swap';
// Ohne diese Kennung liefert Google ein Stilblatt fuer alte Browser ohne woff2.
const KENNUNG = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Nur diese Schnitte werden gebraucht. Alles andere aus der Antwort faellt weg.
const GEWOLLT = new Set(['Fraunces|normal','Fraunces|italic','Work Sans|normal','IBM Plex Mono|normal']);

const antwort = await fetch(ABRUF, {headers:{'User-Agent': KENNUNG}});
if (!antwort.ok) throw new Error('Stilblatt nicht erreichbar: ' + antwort.status);
const css = await antwort.text();

// Google meldet je Gewicht einen eigenen Block, auch wo alle auf dieselbe veraenderliche
// Datei zeigen (Fraunces, Work Sans) — und getrennte Dateien, wo die Schrift nicht
// veraenderlich ist (IBM Plex Mono). Beides deckt dieselbe Zusammenfassung ab: Bloecke mit
// gleicher Adresse werden zu EINEM Eintrag mit einem Gewichtsbereich; verschiedene Adressen
// bleiben getrennte Eintraege. So entsteht ohne Sonderfaelle das kleinstmoegliche Ergebnis.
const bloecke = [...css.matchAll(/\/\* (\S+) \*\/\s*@font-face \{(.*?)\}/gs)];
const nachAdresse = new Map();
for (const [, name, koerper] of bloecke){
  if (name !== 'latin') continue;
  const fam = /font-family: '([^']+)'/.exec(koerper)[1];
  const sty = /font-style: (\S+);/.exec(koerper)[1];
  if (!GEWOLLT.has(fam + '|' + sty)) continue;
  // Der Wert ist entweder eine Zahl ("400") oder bei einer veraenderlichen Schrift ein
  // Bereich ("400 700"). Beide Enden zaehlen.
  const zahlen = /font-weight: ([^;]+);/.exec(koerper)[1].match(/\d+/g).map(Number);
  const url = /url\((\S+)\)/.exec(koerper)[1];
  const ur  = /unicode-range: ([^;]+);/.exec(koerper)[1].trim();
  const e = nachAdresse.get(url) || {fam, sty, url, ur, min: Infinity, max: -Infinity};
  e.min = Math.min(e.min, ...zahlen); e.max = Math.max(e.max, ...zahlen);
  nachAdresse.set(url, e);
}
if (!nachAdresse.size) throw new Error('Keine Schnitte gefunden — hat sich das Format geaendert?');
for (const s of GEWOLLT){
  if (![...nachAdresse.values()].some(e => e.fam + '|' + e.sty === s)) throw new Error('Kein Schnitt fuer ' + s);
}

const teile = [
`/* Erzeugt von tools/schriften_holen.mjs — nicht von Hand aendern.
   Die Schriften liegen als Daten in dieser Datei, damit die App niemanden anruft, wenn
   jemand sie oeffnet, und damit sie ohne Netz vollstaendig aussieht. Warum das so ist,
   steht in tools/schriften_holen.mjs. */`
];
let summe = 0;
for (const e of nachAdresse.values()){
  const roh = Buffer.from(await (await fetch(e.url)).arrayBuffer());
  summe += roh.length;
  const gewicht = e.min === e.max ? String(e.min) : (e.min + ' ' + e.max);
  teile.push(
`  @font-face{
    font-family:'${e.fam}';
    font-style:${e.sty};
    font-weight:${gewicht};
    font-display:swap;
    src:url(data:font/woff2;base64,${roh.toString('base64')}) format('woff2');
    unicode-range:${e.ur};
  }`);
  console.log('  ' + (e.fam + ' ' + e.sty + ' ' + gewicht).padEnd(28) + (roh.length/1024).toFixed(1).padStart(7) + ' KB');
}
const ziel = path.join('src','styles','00-schriften.css');
fs.writeFileSync(ziel, teile.join('\n') + '\n');
console.log('\n' + ziel + '  ' + (fs.statSync(ziel).size/1024).toFixed(1) + ' KB ' +
            '(' + (summe/1024).toFixed(1) + ' KB Schriftdaten)');

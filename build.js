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
const i18n = read('i18n', 'de.js') + read('i18n', 'en.js');
const js = man.js.map(f => read('js', f)).join('').replace('@@I18N@@\n', i18n);

const html = read('index.head.html') + '<style>' + css + '</style>' +
             read('index.body.html') + '<script>' + js + '</script>' + read('index.tail.html');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);

const gz = require('zlib').gzipSync(Buffer.from(html), { level: 9 }).length;
console.log('dist/lucenta.html  %s KB roh, %s KB gzip  (%d CSS-, %d JS-Teile)',
  (Buffer.byteLength(html) / 1024).toFixed(1), (gz / 1024).toFixed(1), man.css.length, man.js.length);

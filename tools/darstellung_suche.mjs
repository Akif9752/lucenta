// Darstellungsfehler, die Ueberlauf-, Kontrast- und Tippflaechen-Pruefung nicht sehen (Runde 247).
// Jede Funktion laeuft im Browser (p.evaluate) auf der aktiven Ansicht und gibt Funde als Text zurueck.
// Eichung: Runde 246 hat jede dieser Fehlerarten einmal am Geraet gezeigt (D1–D9).

// Gemeinsame Helfer stehen IN jeder Funktion: p.evaluate schickt nur den Rumpf in die Seite.

// D1: Text, der mit „…“ endet, weil er nicht passt.
export function suchGekuerzt(){
  // Inhalt einer zugeklappten Karte meldet in WebKit weiter Flaechen, ist aber nicht zu sehen.
  const verborgen = e => { for (let a = e; a; a = a.parentElement) if (a.tagName === 'DETAILS' && !a.open){ const z = [...a.children].find(c => c.tagName === 'SUMMARY'); if (!z || !z.contains(e)) return true; } return false; };
  const aus = [];
  const sichtbar = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  document.querySelectorAll('body *').forEach(e => {
    const st = getComputedStyle(e);
    if (st.textOverflow !== 'ellipsis' || !e.textContent.trim() || !sichtbar(e) || verborgen(e)) return;
    for (let a = e; a; a = a.parentElement) if (parseFloat(getComputedStyle(a).opacity) === 0) return;
    if (e.closest('[aria-hidden="true"]') && !e.closest('#navTitel')) return;
    // Kopfleiste: passen Ziel und mittiger Titel zusammen nicht hinein, kuerzt iOS ebenso — nur Kuerzen bei freiem Platz zaehlt.
    if (e.id === 'navZurueckText'){
      const leiste = document.querySelector('header.top'), t = document.getElementById('navTitel');
      if (leiste && leiste.classList.contains('titel-sichtbar') && t){
        const rg = document.createRange(); rg.selectNodeContents(t);
        const zur = document.getElementById('btnNavZurueck').getBoundingClientRect().width + e.scrollWidth - e.clientWidth;
        if (2 * (zur + 4) + rg.getBoundingClientRect().width > leiste.clientWidth) return;
      }
    }
    if (e.scrollWidth > e.clientWidth + 1) aus.push('„' + e.textContent.trim().slice(0, 40) + '“ (' + (e.id ? '#' + e.id : e.className || e.tagName) + ')');
  });
  return aus;
}

// D2: Platzhalter breiter als das Feld.
export function suchPlatzhalter(){
  // Inhalt einer zugeklappten Karte meldet in WebKit weiter Flaechen, ist aber nicht zu sehen.
  const verborgen = e => { for (let a = e; a; a = a.parentElement) if (a.tagName === 'DETAILS' && !a.open){ const z = [...a.children].find(c => c.tagName === 'SUMMARY'); if (!z || !z.contains(e)) return true; } return false; };
  const aus = [], c = document.createElement('canvas').getContext('2d');
  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(i => {
    if (!i.offsetParent || i.value || verborgen(i)) return;
    const st = getComputedStyle(i, '::placeholder');
    c.font = st.fontStyle + ' ' + st.fontWeight + ' ' + st.fontSize + ' ' + st.fontFamily;
    const is = getComputedStyle(i);
    const frei = i.clientWidth - parseFloat(is.paddingLeft) - parseFloat(is.paddingRight);
    const w = c.measureText(i.placeholder).width;
    // Ab 150 % Textgroesse kuerzt iOS Platzhalter mit „…“; das ist dort gewollt, nicht darunter.
    const dt = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dt')) || 1;
    if (dt >= 1.5) return;
    if (i.tagName === 'INPUT' && w > frei + 1) aus.push('„' + i.placeholder + '“ ' + Math.round(w) + ' statt ' + Math.round(frei) + ' pt (#' + (i.id || '?') + ')');
  });
  return aus;
}

// D4: Eine Flaeche (Spur, Feld, Karte), die dieselbe Farbe hat wie ihr Grund — sie ist nicht zu sehen.
export function suchUnsichtbareFlaeche(){
  // Inhalt einer zugeklappten Karte meldet in WebKit weiter Flaechen, ist aber nicht zu sehen.
  const verborgen = e => { for (let a = e; a; a = a.parentElement) if (a.tagName === 'DETAILS' && !a.open){ const z = [...a.children].find(c => c.tagName === 'SUMMARY'); if (!z || !z.contains(e)) return true; } return false; };
  const aus = [], gesehen = new Set();
  const farbe = s => {
    let m = s.match(/rgba?\(([^)]+)\)/);
    if (m){ const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; }
    m = s.match(/color\(srgb ([^)]+)\)/);
    if (m){ const v = m[1].split(/[ \/]+/).filter(Boolean).map(Number); return [v[0] * 255, v[1] * 255, v[2] * 255, v.length > 3 ? v[3] : 1]; }
    return null;
  };
  const ueber = (o, u) => { const a = o[3]; return [o[0] * a + u[0] * (1 - a), o[1] * a + u[1] * (1 - a), o[2] * a + u[2] * (1 - a), 1]; };
  const grundUnter = e => {
    const kette = [];
    for (let a = e.parentElement; a; a = a.parentElement){
      const f = farbe(getComputedStyle(a).backgroundColor);
      if (f && f[3] > 0){ kette.push(f); if (f[3] >= 1) break; }
    }
    let g = kette.length && kette[kette.length - 1][3] >= 1 ? kette.pop() : farbe(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1];
    while (kette.length) g = ueber(kette.pop(), g);
    return g;
  };
  const hell = f => { const k = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * k(f[0]) + .7152 * k(f[1]) + .0722 * k(f[2]); };
  const verhaeltnis = (a, b) => { const x = hell(a), y = hell(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  document.querySelectorAll('.view.active *, .open *, #plusModal.open *').forEach(e => {
    const r = e.getBoundingClientRect();
    if (r.width < 8 || r.height < 3 || !e.offsetParent || verborgen(e)) return;
    const st = getComputedStyle(e);
    const f = farbe(st.backgroundColor);
    if (!f || f[3] < .5 || st.backgroundImage !== 'none' || st.boxShadow !== 'none' || st.opacity === '0') return;
    if (parseFloat(st.borderTopWidth) > 0 && st.borderTopStyle !== 'none' && (farbe(st.borderTopColor) || [0, 0, 0, 0])[3] > .2) return;
    const g = grundUnter(e), v = verhaeltnis(ueber(f, g), g);
    // Kein Inhalt ausser der Flaeche selbst (Spur, Balken) oder eine Flaeche, die eine Gruppe tragen soll.
    if (v < 1.04){
      const name = (e.id ? '#' + e.id : '.' + String(e.className).split(' ').filter(Boolean).slice(0, 2).join('.'));
      if (gesehen.has(name)) return; gesehen.add(name);
      if (e.children.length === 0 || /track|spur|segment|feld|input|chip/i.test(e.className + ' ' + e.tagName)) aus.push(name + ' (Kontrast ' + v.toFixed(2) + ')');
    }
  });
  return aus;
}

// D6: Schrift, die mit der Textgroesse des iPhones nicht waechst (ausser bewusst gedeckelten).
export async function suchStarreSchrift(){
  // Inhalt einer zugeklappten Karte meldet in WebKit weiter Flaechen, ist aber nicht zu sehen.
  const verborgen = e => { for (let a = e; a; a = a.parentElement) if (a.tagName === 'DETAILS' && !a.open){ const z = [...a.children].find(c => c.tagName === 'SUMMARY'); if (!z || !z.contains(e)) return true; } return false; };
  const wurzel = document.documentElement, vorher = wurzel.style.getPropertyValue('--dt');
  const kandidaten = [];
  document.querySelectorAll('.view.active *, #plusModal.open *').forEach(e => {
    if (!e.offsetParent || e.closest('svg, .verlauf-achse') || verborgen(e)) return;   // Achsen: Platz durch das Diagramm begrenzt
    const eigen = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (eigen) kandidaten.push(e);
  });
  wurzel.style.setProperty('--dt', '1');
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const klein = kandidaten.map(e => parseFloat(getComputedStyle(e).fontSize));
  wurzel.style.setProperty('--dt', '1.5');
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const gross = kandidaten.map(e => parseFloat(getComputedStyle(e).fontSize));
  if (vorher) wurzel.style.setProperty('--dt', vorher); else wurzel.style.removeProperty('--dt');
  const aus = [], gesehen = new Set();
  kandidaten.forEach((e, i) => {
    if (!klein[i] || gross[i] / klein[i] >= 1.1) return;
    const name = (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ').filter(Boolean).slice(0, 2).join('.'));
    if (gesehen.has(name)) return; gesehen.add(name);
    aus.push(name + ' „' + e.textContent.trim().slice(0, 30) + '“ ' + klein[i] + ' pt');
  });
  return aus;
}

// D3: derselbe Satz zweimal sichtbar auf einer Seite.
export function suchDoppelterText(){
  // Inhalt einer zugeklappten Karte meldet in WebKit weiter Flaechen, ist aber nicht zu sehen.
  const verborgen = e => { for (let a = e; a; a = a.parentElement) if (a.tagName === 'DETAILS' && !a.open){ const z = [...a.children].find(c => c.tagName === 'SUMMARY'); if (!z || !z.contains(e)) return true; } return false; };
  const zaehler = new Map();
  document.querySelectorAll('.view.active p, .view.active li, .view.active h3, .view.active .trait-teaser').forEach(e => {
    if (!e.offsetParent || e.closest('[aria-hidden="true"], .plus-vorschau, #view-recht, .vorschau, .vorschau-inhalt, .gesperrt, details:not([open]) > :not(summary)') || verborgen(e)) return;
    const t = e.textContent.replace(/\s+/g, ' ').trim();
    if (t.length < 30) return;
    zaehler.set(t, (zaehler.get(t) || 0) + 1);
  });
  return [...zaehler].filter(([, n]) => n > 1).map(([t, n]) => n + '× „' + t.slice(0, 60) + '…“');
}

// Text liegt auf anderem Text.
export function suchUeberlappung(){
  // Inhalt einer zugeklappten Karte meldet in WebKit weiter Flaechen, ist aber nicht zu sehen.
  const verborgen = e => { for (let a = e; a; a = a.parentElement) if (a.tagName === 'DETAILS' && !a.open){ const z = [...a.children].find(c => c.tagName === 'SUMMARY'); if (!z || !z.contains(e)) return true; } return false; };
  const kaesten = [];
  const fest = e => { for (let a = e; a; a = a.parentElement){ const p = getComputedStyle(a).position; if (p === 'fixed' || p === 'sticky') return true; } return false; };
  const lauf = document.createTreeWalker(document.querySelector('.view.active') || document.body, NodeFilter.SHOW_TEXT);
  for (let n = lauf.nextNode(); n; n = lauf.nextNode()){
    if (!n.textContent.trim() || !n.parentElement.offsetParent || fest(n.parentElement) || verborgen(n.parentElement)) continue;
    const st = getComputedStyle(n.parentElement);
    if (st.visibility === 'hidden' || parseFloat(st.opacity) === 0 || n.parentElement.closest('[aria-hidden="true"], .vorschau-inhalt')) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    // Nur der sichtbare Teil: zugeklappte Karten halten ihren Text hinter overflow:hidden bereit.
    const schnitt = k => {
      let x1 = k.left, y1 = k.top, x2 = k.right, y2 = k.bottom;
      for (let a = n.parentElement; a && a !== document.body; a = a.parentElement){
        const s = getComputedStyle(a);
        if (s.overflowX === 'visible' && s.overflowY === 'visible') continue;
        const q = a.getBoundingClientRect();
        x1 = Math.max(x1, q.left); y1 = Math.max(y1, q.top); x2 = Math.min(x2, q.right); y2 = Math.min(y2, q.bottom);
      }
      return x2 - x1 > 2 && y2 - y1 > 2 ? {left: x1, top: y1, right: x2, bottom: y2, height: y2 - y1} : null;
    };
    [...r.getClientRects()].forEach(k => { const z = schnitt(k); if (z) kaesten.push({k: z, e: n.parentElement, t: n.textContent.trim().slice(0, 25)}); });
  }
  const aus = [];
  for (let i = 0; i < kaesten.length; i++) for (let j = i + 1; j < kaesten.length; j++){
    const a = kaesten[i], b = kaesten[j];
    if (a.e === b.e || a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const w = Math.min(a.k.right, b.k.right) - Math.max(a.k.left, b.k.left);
    const h = Math.min(a.k.bottom, b.k.bottom) - Math.max(a.k.top, b.k.top);
    if (w > 3 && h > Math.min(a.k.height, b.k.height) * 0.4) aus.push('„' + a.t + '“ auf „' + b.t + '“');
    if (aus.length > 6) return aus;
  }
  return aus;
}

// Inhalt, der an einer Kante abgeschnitten wird (ohne „…“ und ohne Scrollen).
export function suchAbgeschnitten(){
  // Inhalt einer zugeklappten Karte meldet in WebKit weiter Flaechen, ist aber nicht zu sehen.
  const verborgen = e => { for (let a = e; a; a = a.parentElement) if (a.tagName === 'DETAILS' && !a.open){ const z = [...a.children].find(c => c.tagName === 'SUMMARY'); if (!z || !z.contains(e)) return true; } return false; };
  const aus = [], gesehen = new Set();
  document.querySelectorAll('.view.active *, #plusModal.open *').forEach(e => {
    if (!e.offsetParent || !e.textContent.trim() || verborgen(e)) return;
    const st = getComputedStyle(e);
    const versteckt = st.overflowX === 'hidden' || st.overflowY === 'hidden' || st.overflowX === 'clip' || st.overflowY === 'clip';
    if (!versteckt || st.textOverflow === 'ellipsis' || st.webkitLineClamp !== 'none' && st.webkitLineClamp) return;
    if (e.closest('.vorschau, .vorschau-inhalt, [aria-hidden="true"]') || e.getAttribute('aria-hidden') === 'true') return;
    const r = e.getBoundingClientRect();
    if (r.width < 20 || r.height < 12) return;
    // Nur wenn Text tatsaechlich ueber die Kante reicht, nicht Schatten oder Bilder.
    const rg = document.createRange(); rg.selectNodeContents(e);
    const t = rg.getBoundingClientRect();
    const raus = (t.right > r.right + 2 && st.overflowX !== 'visible') || (t.bottom > r.bottom + 2 && st.overflowY !== 'visible') || (t.left < r.left - 2);
    if (!raus) return;
    const name = (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ').filter(Boolean).slice(0, 2).join('.'));
    if (gesehen.has(name)) return; gesehen.add(name);
    aus.push(name + ' „' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) + '“');
  });
  return aus;
}

// D7: Silbentrennung in Bedienelementen (Knoepfe, Reiter, Aufklapp-Zeilen, Chips).
export function suchTrennungImBedienelement(){
  // Inhalt einer zugeklappten Karte meldet in WebKit weiter Flaechen, ist aber nicht zu sehen.
  const verborgen = e => { for (let a = e; a; a = a.parentElement) if (a.tagName === 'DETAILS' && !a.open){ const z = [...a.children].find(c => c.tagName === 'SUMMARY'); if (!z || !z.contains(e)) return true; } return false; };
  const aus = [], gesehen = new Set();
  document.querySelectorAll('.view.active button, .view.active summary, .view.active [role="tab"], .view.active .trait-more, .view.active .chip, #plusModal.open button').forEach(e => {
    if (!e.offsetParent || e.textContent.trim().length > 60 || verborgen(e)) return;   // lange Zusammenfassungen sind Fliesstext
    const lauf = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (let n = lauf.nextNode(); n; n = lauf.nextNode()){
      const t = n.textContent, re = /[\p{Script=Latin}\p{Script=Cyrillic}\p{Script=Greek}]{5,}/gu;   // Japanisch bricht ohne Trennung
      let m;
      while ((m = re.exec(t))){
        const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const ks = [...r.getClientRects()].filter(k => k.width > 1);
        const zeilen = new Set(ks.map(k => Math.round(k.top)));
        // Ein Wort, das allein breiter ist als der Platz, muss brechen; gemeldet wird nur, was ganz gepasst haette.
        const st = getComputedStyle(n.parentElement), platz = n.parentElement.clientWidth - parseFloat(st.paddingLeft) - parseFloat(st.paddingRight);
        const breite = ks.reduce((a, k) => a + k.width, 0);
        if (zeilen.size > 1 && breite < platz - 2 && !gesehen.has(m[0])){ gesehen.add(m[0]); aus.push('„' + m[0] + '“ getrennt'); }
      }
    }
  });
  return aus;
}

// D7: eine Zahl oder ein Wortrest allein in der letzten Zeile eines kurzen Absatzes.
export function suchVerwaisteZeile(){
  // Inhalt einer zugeklappten Karte meldet in WebKit weiter Flaechen, ist aber nicht zu sehen.
  const verborgen = e => { for (let a = e; a; a = a.parentElement) if (a.tagName === 'DETAILS' && !a.open){ const z = [...a.children].find(c => c.tagName === 'SUMMARY'); if (!z || !z.contains(e)) return true; } return false; };
  const aus = [];
  document.querySelectorAll('.view.active p, .view.active li, .view.active .settings-hint, #plusModal.open p').forEach(e => {
    if (!e.offsetParent || e.closest('.vorschau-inhalt') || verborgen(e) || /flex|grid/.test(getComputedStyle(e).display)) return;   // Zeilen mit Wert rechts
    const woerter = [], lauf = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (let n = lauf.nextNode(); n; n = lauf.nextNode()){
      const re = /\S+/g; let m;
      while ((m = re.exec(n.textContent))){
        const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const k = [...r.getClientRects()].filter(x => x.width > 0);
        if (k.length) woerter.push({w: m[0], top: Math.round(k[k.length - 1].top)});
      }
    }
    const zeilen = [...new Set(woerter.map(w => w.top))];
    if (zeilen.length < 2 || zeilen.length > 4) return;
    const letzte = woerter.filter(w => w.top === zeilen[zeilen.length - 1]);
    if (letzte.length === 1 && /^[−+±\-–]?\d[\d.,]*%?[.,;:)]?$/.test(letzte[0].w))
      aus.push('„' + letzte[0].w + '“ allein: „' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 50) + '“');
  });
  return aus;
}

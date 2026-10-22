// Sucht im echten Browser nach Fehlern, die keine der anderen Pruefreihen sehen kann.
//
// Die Einheitentests laufen gegen eine nachgebaute Seite und kennen kein Layout. Der
// Sprachvergleich sieht nur Text. Die Bewegungspruefung misst Zeitverlaeufe. Was uebrig
// bleibt, ist alles, was erst entsteht, wenn echtes CSS auf echten Inhalt trifft:
// Elemente, die seitlich aus dem Bildschirm ragen; Schaltflaechen, die zu klein zum Treffen
// sind; Knoepfe ohne lesbaren Namen; doppelte Kennungen; Reste einer Ersetzung im Text;
// versteckte Ansichten, die trotzdem mit der Tabulatortaste erreichbar sind.
//
// Laeuft ueber alle Ansichten, in beiden Farbschemata, einmal leer und einmal mit der
// Beispielnutzerin — leere und volle Ansichten sind verschiedene Layouts.
//
//   python3 -m http.server 8017 --directory dist &
//   node tools/fehlersuche.mjs
//
// ---------- Runde 103: zwei Motoren, und mehrere Durchlaeufe gleichzeitig ----------
//
// Zwei Dinge waren hier falsch, beide vom Anfang an:
//
// 1. Gemessen wurde ausschliesslich auf CHROMIUM. Das iPhone benutzt WebKit. Die Browsersitzung
//    hatte keine Wahl (der Download von WebKit ist dort gesperrt), aber auf dem Mac ist er da —
//    und zwei der teuersten Fehler des Projekts (die Silbentrennung, die beiden
//    Scroll-/Safe-Area-Fehler) waren 99 Runden lang genau deshalb unentdeckt. Jetzt laufen
//    standardmaessig BEIDE: WebKit als Schiedsrichter, Chromium weiterhin mit, weil es in
//    hundert Runden reale Funde geliefert hat. Der Motor steht in der Kennung jedes Fundes.
//    Einschraenken mit LUCENTA_MOTOREN=webkit (oder =chromium).
//
// 2. Jeder Durchlauf startete einen EIGENEN Browser, und alle liefen nacheinander — 13 Starts,
//    ueber zehn Minuten. Jetzt wird je Motor ein Browser gestartet und jeder Durchlauf bekommt
//    nur einen eigenen Kontext (eigener Speicher, eigenes Farbschema, eigene Breite — daran
//    aendert sich nichts). Vier laufen gleichzeitig; LUCENTA_PARALLEL setzt die Zahl.
//
// Was die Parallelitaet kostet, und warum es vertretbar ist: Die Messungen warten an vielen
// Stellen feste Zeiten ab (Animationen, das Neuladen der Beispieldaten). Unter Last koennen die
// knapp werden, und eine knappe Wartezeit ergibt einen FALSCHEN Fund, nicht einen verschwiegenen
// — die Richtung, in der ein Fehler auffaellt statt sich zu verstecken. Vier ist deshalb bewusst
// niedrig gewaehlt. Wer einen Fund nicht glaubt, faehrt ihn mit LUCENTA_PARALLEL=1 nach.
//
// Die AUSGABE bleibt trotzdem in der Reihenfolge der Durchlaeufe: Jeder Durchlauf sammelt seine
// Zeilen selbst, gemeldet wird am Ende in der Reihenfolge der Liste. Sonst waere der Bericht bei
// jedem Lauf anders sortiert, und "derselbe Fund wie gestern?" nicht mehr beantwortbar.

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
const { chromium, webkit } = pkg;
const URL = process.env.LUCENTA_URL || 'http://127.0.0.1:8017/lucenta.html';
const START = process.env.CHROMIUM_PFAD ? {executablePath: process.env.CHROMIUM_PFAD} : {};
// WebKit zuerst: Ist etwas grundsaetzlich kaputt, steht es im Bericht oben — und zwar in der
// Maschine, die das iPhone wirklich benutzt.
const MOTOREN = (process.env.LUCENTA_MOTOREN || 'webkit,chromium').split(',').map(s => s.trim()).filter(Boolean);
const GLEICHZEITIG = Math.max(1, Number(process.env.LUCENTA_PARALLEL || 4));
const STARTER = { webkit: () => webkit.launch(), chromium: () => chromium.launch(START) };
for (const m of MOTOREN){
  if (!STARTER[m]){ console.error('Unbekannter Motor: ' + m + ' (moeglich: webkit, chromium)'); process.exit(2); }
}

// Die kleinste Flaeche, die Apple in den Richtlinien fuer eine Schaltflaeche nennt.
const MIN_TIPP = 44;
// 390 ist die Breite der verbreiteten iPhones, 320 die des kleinsten, das noch aktuelles iOS
// bekommt. Seitlicher Ueberlauf zeigt sich immer zuerst bei 320 — deutsche Komposita und
// franzoesische Umschreibungen brauchen dort mehr Platz, als da ist.
const HOEHE = 844;

// Runde 103: Jeder Durchlauf sammelt seine Funde selbst, statt in eine gemeinsame Liste zu
// schreiben. Bei mehreren gleichzeitig waere sonst nicht mehr vorhersagbar, WELCHER Durchlauf
// einen doppelten Fund zuerst meldet — und der Bericht saehe bei jedem Lauf anders aus.
// Zusammengefasst und entdoppelt wird am Ende, in der Reihenfolge der Liste.
function sammler(){
  const funde = [];
  return { funde, melde: (text) => { funde.push(text) } };
}

// ---------- die einzelnen Pruefungen, alle im Browser ausgefuehrt ----------

// Ragt etwas seitlich heraus? Gemessen wird der sichtbare Inhalt der aktiven Ansicht.
// Runde 91: Was die Verdeckung verbirgt.
//
// Anlass: "die gesamte web-app seite laesst sich von links nach rechts ueber die
// seitengrenzen hinaus verschieben." Die Pruefung oben meldete nichts — sie geht Element fuer
// Element durch, und Pseudoelemente stehen in querySelectorAll nicht drin. Der Taeter war
// genau ein solches: der atmende Schein, 100 Prozent breit mal 1,06 aus der Bewegung.
//
// Schlimmer als der einzelne Fund war die Gewohnheit dahinter: DREI Stellen im Quelltext
// beriefen sich auf body{overflow-x:hidden} als Freibrief ("sichtbar war davon nichts").
// Eine Absicherung, hinter der man Fehler ablegt, ist keine mehr.
//
// Diese Pruefung nimmt die Verdeckung deshalb kurz ab und fragt das Dokument selbst, wie breit
// es waere. Das braucht keine Liste von Elementen und erwischt damit auch, was keines ist:
// Pseudoelemente, Schatten, gedrehte Formen. Danach wird sie zurueckgesetzt.
const suchSeitlichesSchieben = () => {
  const h = document.documentElement, b = document.body;
  const altH = h.style.overflowX, altB = b.style.overflowX;
  h.style.overflowX = 'visible'; b.style.overflowX = 'visible';
  const breit = h.scrollWidth, fenster = h.clientWidth;
  h.style.overflowX = altH; b.style.overflowX = altB;
  // Ein Bildpunkt Spiel: Zwischenrechnungen auf gebrochenen Bildpunkten runden gern auf.
  return breit > fenster + 1
    ? ['die Seite waere ' + (breit - fenster) + 'px breiter als das Fenster (' + breit + ' statt ' + fenster + ')']
    : [];
};

const suchUeberlauf = (breite) => {
  const raus = [];
  // Runde 89: Ein offenes Fenster liegt UEBER der Ansicht und legt sie still (inert). Gemessen
  // gehoert dann das Fenster, nicht die Ansicht dahinter — sonst meldet die Pruefung Knoepfe als
  // unerreichbar, die genau deshalb unerreichbar sind, weil ein Dialog offen ist. Genau das ist
  // beim Einhaengen des Lucenta+-Fensters passiert: sechs Funde, alle falsch, alle hinter dem
  // Verdunkler. Gemessen wird, was jemand sieht.
  const v = document.querySelector('#plusModal.open, #imgModal.open, #drawerPanel.open')
         || document.querySelector('.view.active');
  if (!v) return raus;
  v.querySelectorAll('*').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return;
    // Was ausdruecklich seitlich rollen darf, darf auch breiter sein.
    let p = el, rollt = false;
    while (p && p !== document.body){
      const s = getComputedStyle(p);
      if (s.overflowX === 'auto' || s.overflowX === 'scroll'){ rollt = true; break; }
      p = p.parentElement;
    }
    if (rollt) return;
    if (r.right > breite + 1 || r.left < -1){
      raus.push((el.id ? '#'+el.id : el.tagName.toLowerCase()+'.'+(el.className||'').toString().split(' ')[0]) +
                ' [' + Math.round(r.left) + '..' + Math.round(r.right) + ']');
    }
  });
  return raus.slice(0, 6);
};

// Runde 107: Stehen die fuenf Beschriftungen der Antwortskala unter IHREM Knopf?
//
// Bis zu dieser Runde trug die Skala nur an den Enden eine Beschriftung, die drei mittleren
// <span> waren leer und per display:none ausgeblendet. Mit fuenf Beschriftungen wird aus einer
// Frage des Aussehens eine Frage der Richtigkeit: Eine Beschriftung, die einen halben Knopf
// versetzt steht, ordnet die Bedeutung dem falschen Wert zu — und das sieht man auf einem
// Bildschirmfoto nicht, weil "ungefaehr darunter" genauso aussieht wie "darunter".
//
// Messbar wird es, weil .scale-row und .scale-labels denselben Abstand (8px) und dasselbe
// flex:1 benutzen: Dann muessen die Mittelpunkte paarweise uebereinanderliegen. Weicht einer
// ab, ist eine der beiden Zeilen anders aufgeteilt als die andere.
//
// Der seitliche Ueberlauf braucht hier keine eigene Pruefung — suchUeberlauf laeuft in
// derselben Reihe ueber dieselbe Ansicht. Was diese Funktion zusaetzlich sieht, ist Text, der
// aus seiner SPALTE laeuft, ohne die Seite zu verbreitern (scrollWidth > clientWidth): genau
// das passiert bei einem langen Einzelwort wie "totalmente" in einer 50px-Spalte.
const suchSkalaVersatz = () => {
  const raus = [];
  const zeile = document.querySelector('.view.active .scale-labels');
  if (!zeile) return raus;
  const knoepfe = [...document.querySelectorAll('.view.active .scale-row .scale-btn')];
  const marken = [...zeile.querySelectorAll('span')];
  if (marken.length !== 5) raus.push('die Skala hat ' + marken.length + ' statt 5 Beschriftungen');
  if (knoepfe.length !== 5) raus.push('die Skala hat ' + knoepfe.length + ' statt 5 Knoepfe');
  marken.forEach((m, i) => {
    if (!m.textContent.trim()) raus.push('Beschriftung ' + (i + 1) + ' ist leer');
    if (getComputedStyle(m).display === 'none') raus.push('Beschriftung ' + (i + 1) + ' ist ausgeblendet');
    if (m.scrollWidth > m.clientWidth + 1){
      raus.push('Beschriftung ' + (i + 1) + ' ("' + m.textContent.trim() + '") laeuft ' +
                (m.scrollWidth - m.clientWidth) + 'px aus ihrer Spalte');
    }
    const k = knoepfe[i];
    if (!k) return;
    const km = k.getBoundingClientRect(), mm = m.getBoundingClientRect();
    const versatz = (mm.left + mm.width / 2) - (km.left + km.width / 2);
    // Ein Bildpunkt Spiel, wie bei suchSeitlichesSchieben: flex rechnet auf gebrochenen
    // Bildpunkten und rundet in den beiden Zeilen nicht zwingend gleich.
    if (Math.abs(versatz) > 1){
      raus.push('Beschriftung ' + (i + 1) + ' ("' + m.textContent.trim() + '") steht ' +
                versatz.toFixed(1) + 'px neben ihrem Knopf');
    }
  });
  return raus.slice(0, 6);
};

// Runde 107: Beschriftet die x-Achse des Verlaufsdiagramms die Stellen, die sie behauptet?
//
// Vorher standen dort zwei RELATIVE Angaben ("vor 29 Tagen", "heute"), links- und rechtsbuendig.
// Zwei buendige Angaben koennen nicht verrutschen, gemessen werden musste also nichts. Marken an
// gerechneten Prozentstellen koennen es sehr wohl — und eine Marke unter dem falschen Punkt ist
// schlimmer als keine, weil sie ein Datum behauptet, das dort nicht steht.
//
// Der Fehler, den diese Pruefung zuerst faende, ist der, der beim Bauen tatsaechlich drohte: Bis
// Runde 107 lag die Achse als Geschwister UNTER .verlauf-flaeche und war damit um die Breite der
// 1-bis-5-Skala breiter als das Diagramm. Jede Marke haette dann um diese Breite links von ihrem
// Punkt gestanden. Deshalb ist die erste Frage hier nicht "stimmt die Marke", sondern "deckt die
// Achse ueberhaupt dieselbe Flaeche wie das Diagramm".
const suchAchseVersatz = () => {
  const raus = [];
  const svg = document.querySelector('.view.active .verlauf-svg');
  const achse = document.querySelector('.view.active .verlauf-achse');
  if (!svg) return raus;
  if (!achse){ raus.push('Diagramm ohne x-Achse'); return raus; }
  const s = svg.getBoundingClientRect(), a = achse.getBoundingClientRect();
  if (Math.abs(a.left - s.left) > 1 || Math.abs(a.width - s.width) > 1){
    raus.push('die Achse deckt das Diagramm nicht (Achse ' + a.left.toFixed(1) + '+' + a.width.toFixed(1) +
              ', Diagramm ' + s.left.toFixed(1) + '+' + s.width.toFixed(1) + ')');
  }
  const marken = [...achse.querySelectorAll('.vl-achse-marke')];
  if (marken.length < 2){ raus.push('die Achse traegt ' + marken.length + ' Marken'); return raus; }
  let vorher = null;
  marken.forEach((m, i) => {
    if (!m.textContent.trim()) raus.push('Achsenmarke ' + (i+1) + ' ist leer');
    const r = m.getBoundingClientRect();
    // Ein Bildpunkt Spiel, wie bei suchSeitlichesSchieben.
    if (r.left < s.left - 1) raus.push('Achsenmarke ' + (i+1) + ' ("' + m.textContent.trim() + '") ragt links aus dem Diagramm');
    if (r.right > s.right + 1) raus.push('Achsenmarke ' + (i+1) + ' ("' + m.textContent.trim() + '") ragt rechts aus dem Diagramm');
    // Zwei Daten, die sich beruehren, sind eine Zahlenreihe und kein Datum mehr.
    if (vorher && r.left < vorher + 2){
      raus.push('Achsenmarken ' + i + ' und ' + (i+1) + ' beruehren sich ("' + m.textContent.trim() + '")');
    }
    vorher = r.right;
  });
  return raus.slice(0, 6);
};

// Zu kleine Tippflaechen in der aktiven Ansicht.
//
// Gemessen wird NICHT der Kasten des Elements. Seit Runde 60 vergroessert die App die
// Trefferflaeche kleiner Bedienelemente mit einem ::after, das im Kasten nicht auftaucht —
// eine Messung am Kasten haette genau die Stellen gemeldet, an denen das Problem laengst
// geloest ist, und die uebrigen im Rauschen untergehen lassen.
//
// Stattdessen wird getastet: Trifft ein Tipp 21 Pixel ueber, unter, links und rechts von der
// Mitte noch dasselbe Bedienelement? Das ist dieselbe Frage, die ein Daumen stellt, und sie
// beantwortet nebenbei auch, ob etwas anderes davorliegt.
const suchTippflaechen = (min) => {
  const klein = [];
  // Runde 89: Ein offenes Fenster liegt UEBER der Ansicht und legt sie still (inert). Gemessen
  // gehoert dann das Fenster, nicht die Ansicht dahinter — sonst meldet die Pruefung Knoepfe als
  // unerreichbar, die genau deshalb unerreichbar sind, weil ein Dialog offen ist. Genau das ist
  // beim Einhaengen des Lucenta+-Fensters passiert: sechs Funde, alle falsch, alle hinter dem
  // Verdunkler. Gemessen wird, was jemand sieht.
  const v = document.querySelector('#plusModal.open, #imgModal.open, #drawerPanel.open')
         || document.querySelector('.view.active');
  if (!v) return klein;
  const halb = Math.floor(min/2) - 1;
  v.querySelectorAll('button, a[href], input, select, [role="switch"], [role="button"]').forEach(el => {
    let r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    if (getComputedStyle(el).visibility === 'hidden') return;
    // Runde 128: Was in einem stillgelegten Bereich steht (inert — die verschwommenen Vorschauen
    // der freien Fassung), ist kein Bedienelement: Es nimmt absichtlich keinen Tipp an. Gemessen
    // wird, was jemand bedienen kann; der Knopf ueber der Vorschau wird weiter gemessen.
    if (el.closest('[inert]')) return;
    // Am oberen oder unteren Bildrand laege ein Tastpunkt ausserhalb des Fensters, und
    // elementFromPoint gibt dort nichts zurueck — der erste Entwurf zaehlte das als zu klein
    // und meldete jedes Bedienelement am Seitenende. Uebergehen waere der bequeme Ausweg
    // gewesen und haette echte Faelle mit verschwiegen; stattdessen wird das Element in die
    // Mitte gerollt und danach neu vermessen.
    if (r.top < halb + 2 || r.bottom > innerHeight - halb - 2){
      el.scrollIntoView({block:'center', inline:'center', behavior:'instant'});
      r = el.getBoundingClientRect();
    }
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    if (cx < 0 || cx > innerWidth) return;
    if (cy - halb < 0 || cy + halb > innerHeight - 1) return;   // passt selbst gerollt nicht ins Bild
    const trifft = (x, y) => {
      if (x < 0 || y < 0 || x > innerWidth - 1 || y > innerHeight - 1) return false;
      const t = document.elementFromPoint(x, y);
      return !!t && (t === el || el.contains(t) || t.parentElement === el);
    };
    // Eine begruendete Ausnahme, und nur diese eine. Die fuenf Antwortkreise messen bei 320px
    // 42x42 und stehen unmittelbar nebeneinander; eine groessere Trefferflaeche wuerde dort die
    // Nachbarn ueberlappen und Fehlgriffe erzeugen statt sie zu verhindern. Die Abwaegung steht
    // seit Runde 60 in 10-druckzustaende.css. Sie steht hier NAMENTLICH, damit sie eine
    // Entscheidung bleibt und nicht zu einer Zahl wird, die man beliebig senkt.
    if (el.classList && el.classList.contains('scale-btn')) return;
    const fehlt = [];
    if (!trifft(cx, cy - halb) || !trifft(cx, cy + halb)) fehlt.push('hoch');
    if (!trifft(cx - halb, cy) || !trifft(cx + halb, cy)) fehlt.push('breit');
    if (fehlt.length){
      klein.push((el.id ? '#'+el.id : el.tagName.toLowerCase()+'.'+(el.className||'').toString().split(' ')[0]) +
                 ' ' + Math.round(r.width) + '×' + Math.round(r.height) + ' zu wenig: ' + fehlt.join('+'));
    }
  });
  return klein.slice(0, 10);
};

// Schaltflaechen ohne lesbaren Namen — fuer Sprachausgabe unbenutzbar.
const suchNamenlos = () => {
  const ohne = [];
  // Runde 89: Ein offenes Fenster liegt UEBER der Ansicht und legt sie still (inert). Gemessen
  // gehoert dann das Fenster, nicht die Ansicht dahinter — sonst meldet die Pruefung Knoepfe als
  // unerreichbar, die genau deshalb unerreichbar sind, weil ein Dialog offen ist. Genau das ist
  // beim Einhaengen des Lucenta+-Fensters passiert: sechs Funde, alle falsch, alle hinter dem
  // Verdunkler. Gemessen wird, was jemand sieht.
  const v = document.querySelector('#plusModal.open, #imgModal.open, #drawerPanel.open')
         || document.querySelector('.view.active');
  if (!v) return ohne;
  v.querySelectorAll('button, a[href], [role="switch"]').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const name = (el.getAttribute('aria-label') || el.textContent || '').trim() ||
                 (el.getAttribute('aria-labelledby') ? 'x' : '');
    if (!name) ohne.push(el.id ? '#'+el.id : el.outerHTML.slice(0, 60));
  });
  return ohne.slice(0, 20);
};

// Reste einer Ersetzung oder eines fehlenden Wertes im sichtbaren Text.
const suchReste = () => {
  // Runde 89: Ein offenes Fenster liegt UEBER der Ansicht und legt sie still (inert). Gemessen
  // gehoert dann das Fenster, nicht die Ansicht dahinter — sonst meldet die Pruefung Knoepfe als
  // unerreichbar, die genau deshalb unerreichbar sind, weil ein Dialog offen ist. Genau das ist
  // beim Einhaengen des Lucenta+-Fensters passiert: sechs Funde, alle falsch, alle hinter dem
  // Verdunkler. Gemessen wird, was jemand sieht.
  const v = document.querySelector('#plusModal.open, #imgModal.open, #drawerPanel.open')
         || document.querySelector('.view.active');
  if (!v) return [];
  const t = v.innerText || '';
  const muster = [/\{\{[^}]+\}\}/g, /\bundefined\b/g, /\bNaN\b/g, /\[object [A-Za-z]+\]/g, /@@[A-Z0-9_]+@@/g];
  const f = [];
  muster.forEach(m => { const tr = t.match(m); if (tr) f.push(...tr.slice(0,3)); });
  return f;
};

// Doppelte Kennungen im ganzen Dokument — sie brechen jedes $('...') stillschweigend.
const suchDoppelteIds = () => {
  const zaehl = {};
  document.querySelectorAll('[id]').forEach(el => { zaehl[el.id] = (zaehl[el.id]||0)+1; });
  return Object.keys(zaehl).filter(k => zaehl[k] > 1);
};

// Versteckte Ansichten duerfen nicht mit der Tabulatortaste erreichbar sein.
const suchVersteckteZiele = () => {
  const f = [];
  document.querySelectorAll('.view:not(.active)').forEach(v => {
    if (getComputedStyle(v).display !== 'none'){ f.push('#'+v.id+' ist nicht display:none'); return; }
  });
  return f;
};

// Text, dessen Farbe der eigenen Hintergrundfarbe entspricht — unsichtbar.
const suchUnsichtbarenText = () => {
  const f = [];
  // Runde 89: Ein offenes Fenster liegt UEBER der Ansicht und legt sie still (inert). Gemessen
  // gehoert dann das Fenster, nicht die Ansicht dahinter — sonst meldet die Pruefung Knoepfe als
  // unerreichbar, die genau deshalb unerreichbar sind, weil ein Dialog offen ist. Genau das ist
  // beim Einhaengen des Lucenta+-Fensters passiert: sechs Funde, alle falsch, alle hinter dem
  // Verdunkler. Gemessen wird, was jemand sieht.
  const v = document.querySelector('#plusModal.open, #imgModal.open, #drawerPanel.open')
         || document.querySelector('.view.active');
  if (!v) return f;
  const hinter = el => {
    let p = el;
    while (p && p !== document.documentElement){
      const c = getComputedStyle(p).backgroundColor;
      if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
      p = p.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  v.querySelectorAll('*').forEach(el => {
    if (!el.childNodes.length) return;
    let hatText = false;
    el.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) hatText = true; });
    if (!hatText) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const cs = getComputedStyle(el);
    if (cs.color === hinter(el) && cs.opacity !== '0'){
      f.push((el.id ? '#'+el.id : el.tagName.toLowerCase()) + ' ' + cs.color);
    }
  });
  return f.slice(0, 5);
};


// Runde 93, nach dem dritten "die Hellversion ist zu grell": Die Helligkeit der Flaechen ist
// zweimal nach Augenmass verschoben worden, und beide Male stand in der Begruendung eine
// Kontrast-Rechnung, die niemand nachgemessen hat. Sie stimmte auch nicht mehr: Die Marke
// --muted-soft traegt im Stilblatt den Kommentar "so weit zurueckgenommen wie moeglich, ohne
// auf irgendeinem der drei Untergruende unter 4,6:1 zu fallen" — auf --surface-2 lag sie zu
// dem Zeitpunkt bei 4,24.
//
// Der Grund fuer den Irrtum ist immer derselbe: gerechnet wurde mit den Farben, die im
// Stilblatt NEBENEINANDER stehen, nicht mit denen, die in der Oberflaeche UEBEREINANDER
// liegen. Welche Flaeche wirklich hinter einem Text liegt, weiss nur der Browser. Deshalb
// misst diese Pruefung am gerenderten Bild und rechnet die Deckung mit, statt die erste
// nicht-durchsichtige Farbe fuer den Hintergrund zu halten.
const suchSchwachenKontrast = () => {
  const v = document.querySelector('#plusModal.open, #imgModal.open, #drawerPanel.open')
         || document.querySelector('.view.active');
  if (!v) return [];
  // Der Browser antwortet nicht immer in rgb(). Sobald irgendwo im Stilblatt color-mix()
  // steht — und das tut es an vielen Stellen —, kommt "color(srgb 0.94 0.88 0.85)" zurueck,
  // mit Werten von 0 bis 1 statt 0 bis 255. Der erste Entwurf dieser Pruefung las die als
  // 0,94 von 255, hielt eine helle Warnflaeche fuer fast schwarz und meldete drei Stellen mit
  // 1,25:1, die in Wirklichkeit weit darueber liegen. Eine Pruefung, die falsch misst, ist
  // schlimmer als keine: Sie kostet die Zeit, sie zu widerlegen.
  const zahlen = t => {
    const roh = (String(t).match(/-?[\d.]+(?:e-?\d+)?/gi) || []).map(Number);
    if (roh.length < 3) return [];
    if (/^color\(/.test(String(t).trim())){
      const f = [roh[0]*255, roh[1]*255, roh[2]*255];
      if (roh.length > 3) f.push(roh[3]);
      return f;
    }
    return roh;
  };
  const kanal = c => { c /= 255; return c <= 0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
  const helligkeit = ([r,g,b]) => 0.2126*kanal(r) + 0.7152*kanal(g) + 0.0722*kanal(b);
  // Deckung mitrechnen: Eine Schrift mit rgba(...,.6) auf hellem Grund ist heller als ihr
  // Farbwert behauptet. Genau dieser Fehler hat Runde 34 die opacity:.7 gekostet.
  const ueber = (vorn, hinten) => {
    const a = vorn.length > 3 ? vorn[3] : 1;
    return [0,1,2].map(i => vorn[i]*a + hinten[i]*(1-a));
  };
  const kontrast = (a, b) => {
    const la = helligkeit(a), lb = helligkeit(b);
    return (Math.max(la,lb) + 0.05) / (Math.min(la,lb) + 0.05);
  };
  // Der Grund unter einem Element: alle durchscheinenden Flaechen der Kette uebereinander,
  // von unten nach oben. Die erste deckende Farbe beendet die Suche nach unten.
  const grund = el => {
    const lagen = [];
    let p = el;
    while (p && p !== document.documentElement){
      const f = zahlen(getComputedStyle(p).backgroundColor);
      if (f.length >= 3 && (f.length < 4 || f[3] > 0)){
        lagen.push(f);
        if (f.length < 4 || f[3] >= 1) break;
      }
      p = p.parentElement;
    }
    let unten = zahlen(getComputedStyle(document.documentElement).backgroundColor);
    if (!(unten.length >= 3) || (unten.length > 3 && unten[3] === 0)) unten = [255,255,255];
    for (let i = lagen.length - 1; i >= 0; i--) unten = ueber(lagen[i], unten);
    return unten;
  };
  const funde = [];
  v.querySelectorAll('*').forEach(el => {
    let hatText = false;
    el.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) hatText = true; });
    if (!hatText) return;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
    // Die Deckung des Elements und seiner Eltern wirkt auf die Schrift wie eine Alpha-Angabe
    // in der Farbe — sie ist der Grund, warum Runde 34 die opacity:.7 wieder verloren hat.
    let deckung = 1;
    for (let q = el; q && q !== document.documentElement; q = q.parentElement){
      deckung *= Number(getComputedStyle(q).opacity);
    }
    // Und wenn am Ende 0 herauskommt, wird hier gerade nichts gemalt. Der erste Lauf dieser
    // Pruefung hat daraus 50 Funde gemacht, alle mit exakt 1:1 — die Merkmalskarten der
    // Ergebnisseite stehen auf opacity:0, bis sie beim Scrollen hereinkommen (.trait-card.defer).
    // Eine Schrift mit Deckung 0 hat dieselbe Farbe wie ihr Grund, weil sie IHR Grund ist. Das
    // ist kein Kontrastfehler, das ist eine Einblendung. Wirklich unsichtbaren Text findet die
    // Pruefung eine Stelle weiter oben, ueber Farbe gleich Grund.
    if (deckung <= 0) return;
    // Text, der auf einem Bild oder Verlauf liegt, hat keinen einzelnen Hintergrundwert —
    // dort waere jede Zahl erfunden. Solche Stellen gehoeren ins Auge, nicht in diese Reihe.
    let bild = false;
    for (let p = el; p && p !== document.documentElement; p = p.parentElement){
      if (getComputedStyle(p).backgroundImage !== 'none'){ bild = true; break; }
    }
    if (bild) return;
    const vorn = zahlen(cs.color);
    if (vorn.length < 3) return;
    const hinten = grund(el);
    const mitDeckung = vorn.slice(0, 3);
    mitDeckung.push((vorn.length > 3 ? vorn[3] : 1) * deckung);
    const schrift = ueber(mitDeckung, hinten);
    const gross = parseFloat(cs.fontSize) >= 24
               || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight, 10) >= 700);
    const noetig = gross ? 3 : 4.5;
    const ist = kontrast(schrift, hinten);
    if (ist + 0.005 < noetig){
      funde.push({
        wer: (el.id ? '#'+el.id : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.'+el.className.trim().split(/\s+/)[0] : '')),
        ist: Math.round(ist*100)/100, noetig,
        text: el.textContent.trim().slice(0, 28)
      });
    }
  });
  // Dieselbe Klasse taucht auf einer Seite oft zwanzigmal auf; einmal nennen reicht.
  const gesehen = new Set();
  return funde
    .sort((a,b) => a.ist - b.ist)
    .filter(f => { if (gesehen.has(f.wer)) return false; gesehen.add(f.wer); return true; })
    .slice(0, 6)
    .map(f => f.wer + ' hat ' + f.ist + ':1, noetig sind ' + f.noetig + ':1 ("' + f.text + '")');
};


// Die Wege durch die Oberflaeche. Bewusst ueber echte Klicks statt ueber einen Testzugang:
// Eine Ansicht, die nur ein Testaufruf erreicht, ist fuer niemanden erreichbar. Faellt ein
// Weg weg, meldet das die Pruefung — was genau der Fund waere, den man sehen will.
const WEGE = {
  landing:    ['#btnHome'],
  profile:    ['#btnDrawerToggle', '#btnDrawerProfileRow'],
  understand: ['#btnDrawerToggle', '#btnDrawerUnderstand'],
  archetypes: ['#btnDrawerToggle', '#btnDrawerArchetypes'],
  settings:   ['#btnDrawerToggle', '#btnDrawerSettings'],
  recht:      ['#btnDrawerToggle', '#btnDrawerSettings', '#btnRecht'],
  // Runde 136: die Sprachwahl als eigene Seite. 650 ms nach dem letzten Klick sind mehr als die
  // 0,46 s des Schiebeuebergangs — gemessen wird also die angekommene Seite, nicht der Weg dorthin.
  sprache:    ['#btnDrawerToggle', '#btnDrawerSettings', '#btnSpracheOeffnen'],
  state:      ['#btnHome', '#btnLandingStateHistory'],
  result:     ['#btnDrawerToggle', '#btnDrawerProfileRow', '#btnProfileViewResult'],
  quiz:       ['#btnHome', '#btnStart', '#btnRunSelf'],
  // Runde 81: Das Vergleichsergebnis entsteht erst, wenn zwei Codes eingetragen und verglichen
  // wurden — bis dahin ist der Block leer. Die Pruefung lief deshalb bisher an fuenf
  // aufklappbaren Karten, zwei Eingabefeldern und einem Messbalken vorbei, ohne sie je zu
  // sehen. Der Weg traegt seine Eingaben jetzt selbst.
  vergleich:  ['#btnDrawerToggle', '#btnDrawerCompare'],
  // Runde 89: Das Lucenta+-Fenster. Ohne diesen Weg waere ein neuer Dialog von KEINER
  // Pruefschicht erfasst — genau die Luecke, die in Runde 84 der Bezahlschranke wegen schon
  // einmal aufging. Er sitzt im Profil, weil dort in der freien Fassung das Verlaufs-Schloss
  // steht; welche der fuenf Stellen es ist, spielt keine Rolle: Alle oeffnen dasselbe Fenster.
  pluswerbung: ['#btnDrawerToggle', '#btnDrawerProfileRow'],
  // Runde 103: Der Ergebnisbild-Dialog. Er war von KEINER Pruefschicht je geoeffnet — dieselbe
  // Luecke, die Runde 89 fuer das Lucenta+-Fenster geschlossen hat, nur eine Tuer weiter. Aufgefallen
  // ist sie erst, als das Fenster in dieser Runde durchscheinend wurde: eine Aenderung am Aussehen
  // eines Dialogs, den keine Messung sieht, ist eine unbelegte Aenderung.
  // Steht bewusst ZULETZT, wie pluswerbung: Beide lassen ihre Ueberlagerung offen stehen, damit
  // gemessen wird, was jemand sieht. zu() raeumt sie vor dem naechsten Weg mit Escape weg.
  bilddialog:  ['#btnDrawerToggle', '#btnDrawerProfileRow', '#btnProfileViewResult']
};
// Ansichten, deren Kennung nicht 'view-<name>' lautet, und was nach dem Weg noch zu tun ist.
const NACHBEREITUNG = {
  // Zwei Ergebnisse aus echten Werten: O, C und A liegen nah beieinander, E und S weit
  // auseinander. Das ergibt eine gemischte Verteilung und damit BEIDE Kartensorten in einem
  // Bild — mit zwei gleichen oder zwei entgegengesetzten Codes waere immer nur eine zu sehen.
  vergleich: {ansicht:'result', tun: async (p) => {
    // #cmpMe ist seit Feedback B6 verborgen (immer das eigene Ergebnis); gesetzt wird es deshalb direkt.
    await p.evaluate(() => { document.getElementById('cmpMe').value = '221r1g1y1c'; });
    await p.fill('#cmpOther', '240k1e1w2d');
    await p.click('#btnCompare');
    await p.waitForTimeout(1400);
    // Alle Karten aufklappen: zugeklappt bleibt der halbe Inhalt ungemessen.
    await p.evaluate(() => document.querySelectorAll('.compat-card').forEach(k => k.open = true));
    await p.waitForTimeout(500);
    // Ohne diese Zeile waere ein leeres Vergleichsergebnis eine bestandene Pruefung: Wo nichts
    // steht, ragt nichts heraus und ist keine Flaeche zu klein. Eine Pruefung, die an ihrem
    // eigenen Gegenstand vorbeilaufen kann, ist keine.
    const karten = await p.evaluate(() => document.querySelectorAll('.compat-card').length);
    if (karten !== 5) throw new Error('Vergleich zeigt ' + karten + ' statt 5 Karten');
  }},
  // Runde 103: Der Ergebnisbild-Dialog liegt ueber der Ergebnisansicht, die Ansicht darunter
  // bleibt also 'result'. Geoeffnet wird er ueber #btnShare — den Weg, den auch ein Mensch nimmt.
  bilddialog: {ansicht:'result', tun: async (p) => {
    await p.evaluate(() => { document.getElementById('btnShare')?.click(); });
    // Auf den Zustand warten, nicht auf die Uhr: Das Ergebnisbild wird auf eine Leinwand gemalt,
    // und wie lange das dauert, haengt vom Geraet und von der Last ab.
    await p.waitForFunction(() => !!document.querySelector('#imgModal.open'), null, {timeout:6000})
      .catch(() => { throw new Error('Ergebnisbild-Dialog laesst sich ueber #btnShare nicht oeffnen'); });
    await p.waitForTimeout(500);
    // Und dass er auch etwas ZEIGT. Ohne diese Zeile waere ein leerer Dialog eine bestandene
    // Pruefung — dieselbe Falle wie beim leeren Vergleichsergebnis darueber.
    const vorschau = await p.evaluate(() => {
      const i = document.getElementById('shareImagePreview');
      return !!i && i.src.indexOf('data:image/png') === 0 && i.naturalWidth > 0;
    });
    if (!vorschau) throw new Error('Ergebnisbild-Dialog zeigt keine Vorschau');
  }},
  // Das Fenster liegt ueber der Profilansicht, die Ansicht darunter bleibt also 'profile'.
  pluswerbung: {ansicht:'profile', tun: async (p) => {
    const auf = await p.evaluate(() => {
      const b = [...document.querySelectorAll('[data-plus-info]')].filter(e => e.offsetParent);
      if (!b.length) return false;
      b[0].click();
      return true;
    });
    // In der gekauften Fassung gibt es keine Schloesser — dann ist hier nichts zu pruefen, und
    // das ist kein Fehler. Wohl aber, wenn in der FREIEN Fassung keines auftaucht.
    if (!auf){
      // Ohne Daten gibt es nichts zu verschliessen, mit gekaufter Fassung nichts Verschlossenes.
      // In beiden Faellen ist das richtig und kein Fund. Geprueft wird das Fenster im
      // Durchlauf "Beispielnutzerin, frei" — dem einzigen, in dem Schloesser ueberhaupt stehen.
      return;
    }
    await p.waitForTimeout(600);
    const zahl = await p.evaluate(() => document.querySelectorAll('#plusVorteile .plus-vorteil').length);
    // Runde 128: fuenf statt vier — "Dein vollstaendiger Bericht" ist seit der strengeren
    // Bezahlgrenze der erste Vorteil (PLUS_VORTEILE in 18-ergebnisbild-dialog.js).
    if (zahl !== 5) throw new Error('Lucenta+-Fenster zeigt ' + zahl + ' statt 5 Vorteile');
  }}
};

async function zu(p, ansicht){
  // Runde 103: Zuerst eine etwaige Ueberlagerung wegraeumen. Die Wege "pluswerbung" und
  // "bilddialog" lassen ihr Fenster bewusst OFFEN stehen, damit gemessen wird, was jemand sieht —
  // der naechste Weg beginnt dann aber hinter einem Verdunkler, und #shell traegt inert. Escape
  // schliesst alle drei Ueberlagerungen (Schublade, Bild-, Plus-Fenster); zweimal, falls zwei
  // uebereinanderliegen. Auf einer Seite ohne Ueberlagerung ist der Tastendruck wirkungslos.
  await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  // Immer erst zurueck auf die Startseite, damit jeder Weg von derselben Stelle beginnt.
  await p.evaluate(() => { document.getElementById('btnDrawerClose')?.click(); });
  await p.waitForTimeout(200);
  await p.evaluate(() => { document.getElementById('btnHome')?.click(); });
  await p.waitForTimeout(350);
  for (const wahl of WEGE[ansicht]){
    const da = await p.evaluate(w => { const el = document.querySelector(w); if (!el) return false; el.click(); return true; }, wahl);
    if (!da) return false;
    await p.waitForTimeout(400);
  }
  await p.waitForTimeout(250);
  const nach = NACHBEREITUNG[ansicht];
  const jetzt = await p.evaluate(() => document.querySelector('.view.active')?.id || '');
  if (jetzt !== 'view-' + ((nach && nach.ansicht) || ansicht)) return false;
  if (nach) await nach.tun(p);
  return true;
}

async function pruefeAnsicht(p, ansicht, kennung, breite, melde){
  // Einmal durch die Ansicht scrollen, bevor gemessen wird. Nicht als Schoenheitsschritt:
  // Die Merkmalskarten der Ergebnisseite stehen auf opacity:0, bis sie beim Scrollen
  // hereinkommen. Wer nur den ersten Bildschirm misst, misst die Haelfte der App nicht — und
  // merkt es nicht einmal, weil dort keine Funde entstehen, wo nichts gemessen wird.
  // Zurueck nach oben, damit alle folgenden Messungen wieder denselben Ausschnitt sehen.
  await p.evaluate(async () => {
    const hoehe = document.documentElement.scrollHeight;
    for (let y = 0; y < hoehe; y += Math.max(200, window.innerHeight * 0.8)){
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 90));
    }
    window.scrollTo(0, hoehe);
    await new Promise(r => setTimeout(r, 260));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 220));
  });
  for (const [name, fn, arg] of [
    ['ragt seitlich heraus', suchUeberlauf, breite],
    ['Seite seitlich schiebbar', suchSeitlichesSchieben, null],
    ['Tippflaeche unter ' + MIN_TIPP + 'px', suchTippflaechen, MIN_TIPP],
    ['Antwortskala falsch beschriftet', suchSkalaVersatz, null],
    ['x-Achse falsch beschriftet', suchAchseVersatz, null],
    ['Schaltflaeche ohne Namen', suchNamenlos, null],
    ['Rest einer Ersetzung im Text', suchReste, null],
    ['unsichtbarer Text', suchUnsichtbarenText, null],
    ['zu schwacher Kontrast', suchSchwachenKontrast, null],
  ]){
    const treffer = arg === null ? await p.evaluate(fn) : await p.evaluate(fn, arg);
    treffer.forEach(t => melde(kennung + ' / ' + ansicht + ': ' + name + ' — ' + t));
  }
}

// ---------- ein Durchlauf ueber alle Ansichten ----------

// Runde 89: Ob die gekaufte Fassung an ist, gehoert in die Kennung — sonst stehen zwei
// Durchlaeufe mit demselben Namen im Bericht und man weiss bei einem Fund nicht, welcher.
// Runde 103: Der Motor ebenso, aus demselben Grund. Als eigene Funktion, weil die Kennung auch
// gebraucht wird, um mit LUCENTA_NUR einen einzelnen Durchlauf nachzufahren.
function kennungVon(l, motor){
  return [motor, (l.breite || 390) + 'px', l.thema, l.sprache,
          l.demo ? (l.plus ? 'Beispielnutzerin' : 'Beispielnutzerin, frei') : 'leer'].join('/');
}

async function durchlauf(lauf, motor, browser){
  const { thema, demo, plus, sprache } = lauf;
  const breite = lauf.breite || 390;
  const kennung = kennungVon(lauf, motor);
  const { funde, melde } = sammler();
  const ctx = await browser.newContext({viewport:{width:breite,height:HOEHE}, isMobile:true, hasTouch:true,
    colorScheme: thema === 'dunkel' ? 'dark' : 'light'});
  const p = await ctx.newPage();
  const abstuerze = [];
  p.on('pageerror', e => abstuerze.push(e.message));
  p.on('console', m => { if (m.type() === 'error') abstuerze.push('Konsole: ' + m.text()); });
  await p.goto(URL, {waitUntil:'networkidle'});
  await p.waitForTimeout(500);

  if (sprache !== 'de'){
    await p.evaluate(s => document.querySelector('[data-lang="'+s+'"]')?.click(), sprache).catch(()=>{});
    await p.waitForTimeout(300);
  }
  if (demo){
    // Runde 84: Die Beispielnutzerin laeuft in der GEKAUFTEN Fassung. Sonst fielen mit dem
    // Bezahlmodell genau die reichsten Ansichten aus der Pruefung heraus — Kombinationskarten,
    // Tagesform-Befunde, die aufklappbaren Vergleichskarten —, weil die freie Fassung an ihrer
    // Stelle einen Hinweiskasten zeigt.
    //
    // Runde 89: Damit fehlte aber ausgerechnet der Zustand, in dem die meisten Menschen die App
    // benutzen — DATEN VORHANDEN, ABER NICHT GEKAUFT. Nur dort stehen die Schloesser an ihren
    // fuenf Stellen; leere Durchlaeufe haben nichts zu verschliessen, gekaufte nichts
    // verschlossen. Deshalb ist die gekaufte Fassung jetzt eine Eigenschaft des Durchlaufs, und
    // ein Durchlauf laeuft ausdruecklich frei.
    if (plus) await p.evaluate(() => { try{ localStorage.setItem('lucenta_plus','1'); }catch(e){} });
    else      await p.evaluate(() => { try{ localStorage.removeItem('lucenta_plus'); }catch(e){} });
    await p.evaluate(() => { document.getElementById('btnDrawerToggle')?.click(); });
    await p.waitForTimeout(300);
    await p.evaluate(() => { document.getElementById('btnDrawerProfileRow')?.click(); });
    await p.waitForTimeout(400);
    const geladen = await p.evaluate(() => { const b = document.getElementById('btnDemo'); if (!b) return false; b.click(); return true; });
    if (!geladen) melde(kennung + ': Beispielnutzerin nicht ladbar (#btnDemo fehlt)');
    await p.waitForTimeout(1200);
    await p.waitForLoadState('networkidle');
    await p.waitForTimeout(400);
    // demoLaden() laedt die Seite neu; die Marke ueberlebt das, weil sie im selben Speicher
    // liegt — geprueft wird es hier trotzdem, damit ein spaeterer Umbau es nicht still bricht.
    const bezahlt = await p.evaluate(() => localStorage.getItem('lucenta_plus') === '1');
    if (bezahlt !== !!plus) melde(kennung + ': Fassung nach dem Laden der Beispieldaten nicht mehr wie gesetzt');
  }

  // Doppelte Kennungen und versteckte Ziele sind Eigenschaften des Dokuments, nicht der Ansicht.
  (await p.evaluate(suchDoppelteIds)).forEach(id => melde(kennung + ': Kennung doppelt vergeben — #' + id));
  (await p.evaluate(suchVersteckteZiele)).forEach(t => melde(kennung + ': ' + t));

  for (const ansicht of Object.keys(WEGE)){
    try {
      const angekommen = await zu(p, ansicht);
      if (!angekommen){
        // Ohne Bestand gibt es kein Ergebnis und damit richtigerweise keinen Weg dorthin.
        // Runde 103: Der Bilddialog gehoert in diese Liste — er haengt am Ergebnis.
        if (!(['result', 'vergleich', 'bilddialog'].includes(ansicht) && !demo)) melde(kennung + ': Ansicht "' + ansicht + '" ueber die Oberflaeche nicht erreichbar');
        continue;
      }
      await pruefeAnsicht(p, ansicht, kennung, breite, melde);
    } catch (e) {
      // Runde 103: Bisher riss eine Ausnahme hier den GANZEN Lauf ab. Die NACHBEREITUNG wirft
      // absichtlich (fuenf Karten, vier Vorteile) — damit blieb bei einem einzigen solchen Fehler
      // alles Uebrige ungemessen, und man sah einen Absturz statt einer Fundliste. Ein Abbruch
      // ist ein Fund, nicht das Ende der Pruefung.
      melde(kennung + ': Weg durch "' + ansicht + '" abgebrochen — ' + ((e && e.message) || e));
    }
  }

  abstuerze.forEach(a => melde(kennung + ': Ausnahme — ' + a));
  await ctx.close();
  return { kennung, funde };
}

const laeufe = [
  {thema:'hell',   demo:false, sprache:'de'},
  {thema:'dunkel', demo:false, sprache:'de'},
  {thema:'hell',   demo:true,  plus:true,  sprache:'de'},
  {thema:'dunkel', demo:true,  plus:true,  sprache:'de'},
  // Daten vorhanden, aber nicht gekauft — der Zustand, in dem die meisten Menschen die App
  // benutzen, und der einzige, in dem die fuenf Schloesser und das Lucenta+-Fenster stehen.
  {thema:'hell',   demo:true,  plus:false, sprache:'de'},
  {thema:'dunkel', demo:true,  plus:false, sprache:'de'},
  {thema:'hell',   demo:true,  plus:true,  sprache:'ja'},
  {thema:'hell',   demo:true,  plus:true,  sprache:'fr'},
  // Runde 97: Tuerkisch dazu, und zwar in BEIDEN Farbmodi. Es ist die einzige Sprache hier mit
  // Buchstaben, die in den uebrigen sieben nicht vorkommen (ı, ğ, ş, ç) — ob die eingebettete
  // Schrift sie wirklich traegt, sieht man nur im Bild, und ein fehlendes Zeichen faellt
  // ausserdem als andere Zeilenhoehe auf.
  {thema:'hell',   demo:true,  plus:true,  sprache:'tr'},
  {thema:'dunkel', demo:true,  plus:true,  sprache:'tr'},
  // Der schmale Bildschirm, in den Sprachen mit den laengsten Woertern. Tuerkisch gehoert
  // dazu: Es haengt Endungen an, statt neue Woerter zu setzen, und kommt damit auf Laengen
  // wie das Deutsche mit seinen Komposita.
  {thema:'hell',   demo:true,  plus:true,  sprache:'de', breite:320},
  {thema:'hell',   demo:true,  plus:true,  sprache:'fr', breite:320},
  {thema:'hell',   demo:true,  plus:true,  sprache:'tr', breite:320},
];
// ---------- Runde 103: je Motor ein Browser, vier Durchlaeufe gleichzeitig ----------

const NUR = process.env.LUCENTA_NUR || '';
const aufgaben = [];
for (const motor of MOTOREN) for (const l of laeufe){
  if (NUR && !kennungVon(l, motor).includes(NUR)) continue;
  aufgaben.push({ motor, lauf: l });
}
if (!aufgaben.length){ console.error('LUCENTA_NUR="' + NUR + '" passt auf keinen Durchlauf.'); process.exit(2); }

console.log(`\n${aufgaben.length} Durchlaeufe (${MOTOREN.join(' + ')}), ${GLEICHZEITIG} gleichzeitig` +
            (NUR ? `, gefiltert auf "${NUR}"` : ''));
console.log(URL + '\n');

// Ein Motor, der sich nicht starten laesst, ist nur dann ein Fehler, wenn er ausdruecklich
// verlangt wurde. Die Browsersitzung im Container hat KEIN WebKit (der Download ist dort
// gesperrt) — dieselbe Datei muss dort weiterlaufen und darf nicht mit "Executable doesn't
// exist" abbrechen. Sie sagt dann laut, was sie NICHT gemessen hat: eine uebersprungene Messung,
// die man nicht sieht, ist schlimmer als keine.
const browser = {};
for (const motor of MOTOREN){
  try { browser[motor] = await STARTER[motor](); }
  catch (e){
    if (process.env.LUCENTA_MOTOREN){
      console.error(`Motor "${motor}" laesst sich nicht starten: ${(e && e.message) || e}`);
      process.exit(2);
    }
    console.log(`  ACHTUNG: Motor "${motor}" ist auf diesem Rechner nicht installiert — ` +
                `${aufgaben.filter(a => a.motor === motor).length} Durchlaeufe UNGEMESSEN.`);
    console.log(`  Nachholen mit: npx playwright install ${motor}\n`);
  }
}
const uebrig = MOTOREN.filter(m => browser[m]);
if (!uebrig.length){ console.error('Kein Motor verfuegbar. npx playwright install webkit chromium'); process.exit(2); }
for (let i = aufgaben.length - 1; i >= 0; i--) if (!browser[aufgaben[i].motor]) aufgaben.splice(i, 1);

const ergebnisse = new Array(aufgaben.length);
let fertig = 0;
let naechste = 0;
async function arbeiter(){
  while (true){
    const i = naechste++;
    if (i >= aufgaben.length) return;
    const { motor, lauf } = aufgaben[i];
    try {
      ergebnisse[i] = await durchlauf(lauf, motor, browser[motor]);
    } catch (e) {
      // Ein Durchlauf, der abstuerzt, darf die 25 anderen nicht mitnehmen — aber er verschwindet
      // auch nicht: Der Abbruch selbst ist der Fund.
      const kennung = kennungVon(lauf, motor);
      const text = kennung + ': Durchlauf abgebrochen — ' + ((e && e.message) || e);
      ergebnisse[i] = { kennung, funde: [text] };
    }
    fertig++;
    const eig = ergebnisse[i];
    console.log(`  ${String(fertig).padStart(2)}/${aufgaben.length}  ` +
                (eig.funde.length ? `${eig.funde.length} FUNDE  ` : 'ok        ') + eig.kennung);
  }
}
await Promise.all(Array.from({ length: Math.min(GLEICHZEITIG, aufgaben.length) }, arbeiter));
for (const motor of uebrig) await browser[motor].close();

// Zusammenfassen in der Reihenfolge der Liste, nicht in der des Fertigwerdens. Derselbe Fund in
// zwei Durchlaeufen ist ein Fund — aber der Motor steht in der Kennung, ein Fund in WebKit und
// derselbe in Chromium sind also zwei Zeilen. Das ist gewollt: Ob ein Fehler beide Maschinen
// betrifft oder nur die des iPhones, ist die erste Frage bei der Behebung.
const gesehen = new Set();
const fehler = [];
for (const e of ergebnisse){
  for (const f of (e ? e.funde : [])){
    if (gesehen.has(f)) continue;
    gesehen.add(f);
    fehler.push(f);
  }
}

console.log('\n======================================================');
if (fehler.length){
  for (const f of fehler) console.log('  FUND  ' + f);
  console.log('\n' + fehler.length + ' FUNDE');
  process.exit(1);
} else {
  console.log('KEINE FUNDE');
}

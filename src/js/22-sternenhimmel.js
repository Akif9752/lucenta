/* Bewegter Hintergrund der Startseite (Runde 71).
 *
 * Eigener Gültigkeitsbereich: 18-beta-rueckmeldung.js schließt den gemeinsamen Bereich der App,
 * und dieser Teil braucht nichts daraus. Er liest seinen Zustand aus dem DOM und seine Farben
 * aus den CSS-Marken — damit stimmt er im Hell- wie im Dunkelmodus, ohne dass hier Farbwerte
 * stehen.
 *
 * Drei Dinge, die den Unterschied zwischen "hübsch" und "Akkufresser" ausmachen:
 *   - Er läuft NUR, während die Startseite sichtbar ist, und pausiert, sobald der Tab in den
 *     Hintergrund geht. Ein Fragebogen mit fünfzig Fragen soll nicht nebenher ein Canvas
 *     zeichnen lassen.
 *   - Die Bildpunktdichte ist auf 2 gedeckelt. Auf einem Telefon mit Faktor 3 wären es sonst
 *     2,25-mal so viele Bildpunkte für einen Hintergrund, den man kaum bemerkt.
 *   - Bei prefers-reduced-motion wird das Feld EINMAL gezeichnet und steht dann still. Der
 *     Himmel bleibt, die Bewegung nicht.
 */
(function(){
  var canvas = document.getElementById('sternenhimmel');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var wenigerBewegung = false;
  try{ wenigerBewegung = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){}

  var sterne = [], schnuppen = [], b = 0, h = 0, dpr = 1;
  var farbeStern = 'rgba(0,0,0,.5)', farbeSchnuppe = 'rgba(0,0,0,.5)';
  var laeuft = false, rafId = null, farbZaehler = 0;

  // Richtung: von rechts oben nach links unten. Ein flacher Winkel wirkt ruhiger als 45°.
  var RICHTUNG_X = -0.62, RICHTUNG_Y = 0.42;

  var farbeWarm = null, farbeKalt = null, farbeStrahl = 'transparent';
  var farbeSonne = 'transparent', sonneGezeichnet = null, sonneVerlauf = [];
  // Runde 83: Zwei Atmosphaeren statt einer. Welche gilt, sagt das Stilblatt ueber die Marke
  // --atmosphaere — nicht dieses Skript. Der Grund ist derselbe wie bei den Farben: Der
  // Hell-/Dunkelwechsel gehoert ins CSS, und ein Skript, das ihn selbst herleitet, geht beim
  // naechsten Farbmodus daneben. Gelesen wird es im selben Takt wie die Farben, ein
  // Themawechsel kommt also von allein an.
  var staub = false;
  function farbenLesen(){
    try{
      var s = getComputedStyle(document.documentElement);
      var art = (s.getPropertyValue('--atmosphaere') || '').replace(/['"\s]/g, '');
      var neuStaub = art === 'staub';
      if (neuStaub !== staub){ staub = neuStaub; aufbauen(); }
      farbeStrahl = (s.getPropertyValue('--lichtstrahl') || '').trim() || 'transparent';
      var neuSonne = (s.getPropertyValue('--sonnenstrahl') || '').trim() || 'transparent';
      // Die Verlaeufe haengen nur an Farbe und Flaeche, nicht am Winkel — sie werden deshalb
      // einmal erzeugt und je Strahl nur gedreht. Ein Verlauf pro Strahl und Bild waere bei
      // sieben Strahlen mal drei Lagen sechzig Zuteilungen in der Sekunde.
      if (neuSonne !== farbeSonne){ farbeSonne = neuSonne; sonneGezeichnet = null; }
      farbeStern = (s.getPropertyValue('--stern') || '').trim() || 'rgba(21,32,25,.5)';
      farbeSchnuppe = (s.getPropertyValue('--stern-schnuppe') || '').trim() || farbeStern;
      // Runde 72: Ein echter Himmel ist nicht einfarbig. Ein kleiner Teil der Sterne zieht ins
      // Warme, ein kleiner ins Kalte — kaum als Farbe erkennbar, aber der Unterschied zwischen
      // "Punkte" und "Sternen".
      farbeWarm = (s.getPropertyValue('--stern-warm') || '').trim() || farbeStern;
      farbeKalt = (s.getPropertyValue('--stern-kalt') || '').trim() || farbeStern;
    }catch(e){}
  }

  function aufbauen(){
    var neuB = window.innerWidth, neuH = window.innerHeight;
    if (!neuB || !neuH) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    b = neuB; h = neuH;
    canvas.width = Math.round(b * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Anzahl an der Fläche bemessen, nicht fest: Auf einem Telefon wären 200 Sterne ein Teppich,
    // auf einem Schreibtisch wären 40 eine leere Fläche.
    var anzahl = Math.round(Math.min(420, Math.max(110, (b * h) / 3100)));
    sterne.length = 0;
    for (var i = 0; i < anzahl; i++){
      // Runde 72: Die Größe war gleichverteilt — dadurch sahen alle Sterne gleich groß aus und
      // das Feld wirkte wie ein Raster aus Punkten. Ein echter Himmel hat sehr viele schwache
      // und sehr wenige helle. Die Potenz verschiebt die Verteilung genau dorthin.
      // Der Exponent steuert, wie stark schwache Sterne ueberwiegen. Bei 2,8 lagen fast alle
      // unter einem Bildpunkt und erschienen dadurch gar nicht — gemessen 0,08 % Deckung. 2,1
      // laesst genug mittlere uebrig, ohne dass ein gleichfoermiges Raster entsteht. Der
      // Mindestradius liegt jetzt ueber einem halben Bildpunkt, damit auch der schwaechste
      // Stern tatsaechlich gezeichnet wird.
      var t = Math.pow(Math.random(), staub ? 1.7 : 2.1);
      // Die grossen waren zu dominant; der obere Rand faellt von 2,27 auf 1,62.
      // Staub ist groesser und gleichmaessiger verteilt als Sterne: Ein Korn im Licht hat eine
      // Groesse, ein Stern eine Helligkeit.
      var r = staub ? (0.7 + t * 1.5) : (0.45 + t * 1.17);
      sterne.push({
        x: Math.random() * b,
        y: Math.random() * h,
        r: r,
        // Staub schwebt: Er faellt langsam und schwankt dabei seitlich. Die Phase steht hier,
        // damit nicht alle Koerner im Gleichtakt pendeln.
        sx: Math.random() * Math.PI * 2,
        sv: 0.004 + Math.random() * 0.010,
        sw: 0.25 + Math.random() * 0.65,
        // Helligkeit folgt der Größe: Ein großer, blasser Stern gibt es am Himmel nicht.
        a: staub ? (0.14 + t * 0.34 + Math.random() * 0.12)
                 : (0.20 + t * 0.62 + Math.random() * 0.14),
        // Tempo folgt ebenfalls der Größe — größer heißt näher heißt schneller. Das ist echte
        // Parallaxe statt zufälliger Geschwindigkeit und erzeugt Tiefe.
        // Runde 73: Tempo weiter zurueckgenommen (vorher 0,035 + t*0,20). Die Schnuppen
        // behalten ihres — sie sollen ein Ereignis bleiben, kein Teil der Grundbewegung.
        v: staub ? (0.012 + t * 0.055) : (0.022 + t * 0.125),
        // Kleine Sterne flackern stärker, große stehen ruhiger.
        f: 0.34 - t * 0.26,
        p: Math.random() * Math.PI * 2,
        pv: 0.005 + Math.random() * 0.014,
        // Ein Achtel warm, ein Achtel kalt, der Rest neutral.
        ton: (function(){ var z = Math.random(); return z < 0.12 ? 1 : (z > 0.88 ? 2 : 0); })(),
        // Die hellsten bekommen einen weichen Hof; darunter wäre er nur Unschärfe. Bei Staub
        // haben mehr Koerner einen: Ein Korn im Licht leuchtet diffus, ein Stern punktfoermig.
        hof: t > (staub ? 0.55 : 0.86),
        // Laenge der Spitzen als Vielfaches des Radius; 0 heisst keine. Nur die oberen rund
        // 30 Prozent bekommen welche, und je heller, desto weiter reichen sie.
        // Spitzen sind die Signatur eines Sterns. Auf einem Staubkorn waeren sie schlicht
        // falsch — es leuchtet nicht selbst, es wird angeleuchtet.
        zacken: (!staub && t > 0.68) ? (2.1 + t * 1.9) : 0
      });
    }
    schnuppen.length = 0;
    strahlenAufbauen();
    sonneGezeichnet = null;
  }

  function schnuppeStarten(){
    // Start am oberen und rechten Rand, damit sie in die Fläche hinein und nicht aus ihr heraus
    // zieht. Der Beginn liegt bewusst ausserhalb, damit sie nicht aus dem Nichts erscheint.
    var vonOben = Math.random() < 0.55;
    schnuppen.push({
      x: vonOben ? (b * 0.35 + Math.random() * b * 0.85) : b + 40,
      y: vonOben ? -40 : (Math.random() * h * 0.55),
      v: 5.5 + Math.random() * 3.5,
      laenge: 90 + Math.random() * 90,
      leben: 0,
      dauer: 90 + Math.random() * 40
    });
  }

  // Der Lichtstrahl des Hellmodus. Ein sehr weicher, schraeger Streifen, der ueber Minuten
  // langsam wandert — kein Ereignis wie eine Sternschnuppe, sondern das, was Licht im Lauf
  // eines Nachmittags tut. Die Koerner darin werden heller: Genau das macht Staub sichtbar,
  // und ohne diesen Unterschied waere der Streifen nur eine helle Flaeche.
  var strahlPhase = Math.random() * Math.PI * 2;
  function strahlMitte(){
    return b * (0.5 + 0.34 * Math.sin(strahlPhase));
  }
  function strahlZeichnen(){
    if (!staub || farbeStrahl === 'transparent') return;
    var m = strahlMitte(), w = Math.max(150, b * 0.42);
    var g = ctx.createLinearGradient(m - w, 0, m + w, h);
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.5, farbeStrahl);
    g.addColorStop(1, 'transparent');
    // Gemessen am Bild zurueckgenommen (war 0,5): Darueber legt der Strahl einen sichtbaren
    // warmen Stich ueber die ganze Seite, und aus Atmosphaere wird Farbe.
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, b, h);
    ctx.globalAlpha = 1;
  }
  // ---------- Der Sonnenfaecher (Runde 85) ----------
  //
  // Rueckmeldung: "beim hellmodus fehlen mir auf der startseite im hintergrund die
  // sonnenstrahlen leicht noch, man soll schon den unterschied erkennen koennen zwischen
  // nachts bei der dunkelversion und tagsueber bei der hellversion."
  //
  // Der weiche Streifen allein hat das nicht geleistet: Er ist so breit und so weich, dass er
  // als heller Fleck gelesen wird und nicht als Licht. Was einen Tag von einer Nacht
  // unterscheidet, sind nicht Helligkeit, sondern RICHTUNG und QUELLE — Strahlen, die
  // erkennbar von EINEM Punkt ausserhalb des Bildes kommen. Genau das ist hier gebaut: eine
  // Sonne oberhalb der rechten oberen Ecke und ein Faecher einzelner Strahlen daraus.
  //
  // Drei Entscheidungen, die es bei "Lichtstrahlen auf einer Seite" leicht kippen lassen:
  //   - Die Strahlen sind UNGLEICH breit und ungleich hell. Sieben gleiche Keile ergeben einen
  //     Sonnenschirm, kein Licht.
  //   - Jeder besteht aus drei Lagen: schmal und kraeftig innen, breit und schwach aussen.
  //     Ein einzelner Keil haette eine sichtbare Kante, und eine Kante macht aus Licht Grafik.
  //   - Sie schwingen mit derselben Phase wie der Streifen, nur schwaecher. Zwei Lichtquellen,
  //     die unabhaengig voneinander wandern, sind physikalisch Unsinn und man sieht es.
  var faecher = [];
  // Grundrichtung: nach links unten. Nicht 45 Grad — flacher wirkt nach Nachmittag,
  // steiler nach Mittag, und der Nachmittag passt zu einer Seite, die man abends oeffnet.
  var FAECHER_MITTE = 2.16;
  function strahlenAufbauen(){
    faecher.length = 0;
    if (!staub) return;
    var n = 7;
    for (var i = 0; i < n; i++){
      var mitte = (i / (n - 1)) - 0.5;
      faecher.push({
        // Ablage vom Mittelwinkel, mit etwas Unregelmaessigkeit: gleiche Abstaende sehen
        // gezeichnet aus.
        ab: mitte * 0.60 + (Math.random() - 0.5) * 0.055,
        // Halbe Breite als Steigung (Gegenkathete je Laenge). Die schmalen sind die klaren.
        br: 0.012 + Math.random() * 0.030,
        // Die Strahlen in der Mitte des Faechers sind kraeftiger als die an den Raendern —
        // so faellt das Buendel zu den Seiten hin aus, statt abgeschnitten zu wirken.
        a: (0.44 + Math.random() * 0.40) * (1 - Math.abs(mitte) * 0.80),
        ph: Math.random() * Math.PI * 2,
        pv: 0.00035 + Math.random() * 0.00075
      });
    }
  }
  // Innen kraeftig, aussen weich: die drei Lagen je Strahl.
  var LAGEN = [{w:1.0, a:1.00}, {w:2.1, a:0.45}, {w:3.8, a:0.20}];
  function sonneAufbauen(){
    sonneVerlauf.length = 0;
    var L = (b + h) * 1.25;
    for (var i = 0; i < LAGEN.length; i++){
      var g = ctx.createLinearGradient(0, 0, L, 0);
      // Nicht bei 0 voll: Direkt an der Quelle wuerden sich alle sieben Strahlen zu einem
      // Fleck ueberlagern. Das Maximum liegt im ersten Drittel, dort, wo ein Strahl auch in
      // echt am deutlichsten ist.
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.16, farbeSonne);
      g.addColorStop(0.55, farbeSonne);
      g.addColorStop(1, 'transparent');
      sonneVerlauf.push(g);
    }
    sonneGezeichnet = farbeSonne;
  }
  function sonneOrt(){
    // Die Sonne selbst liegt ausserhalb des Bildes. Sichtbar ist nur, was von ihr kommt —
    // eine Scheibe im Bild waere eine Illustration, kein Hintergrund.
    return { x: b * (0.86 + 0.13 * Math.sin(strahlPhase)), y: -h * 0.26 };
  }
  function faecherZeichnen(){
    if (!staub || farbeSonne === 'transparent' || !faecher.length) return;
    if (sonneGezeichnet !== farbeSonne) sonneAufbauen();
    var o = sonneOrt(), L = (b + h) * 1.25;
    var basis = FAECHER_MITTE + Math.sin(strahlPhase) * 0.085;
    ctx.save();
    ctx.translate(o.x, o.y);
    for (var i = 0; i < faecher.length; i++){
      var f = faecher[i];
      var winkel = basis + f.ab + (wenigerBewegung ? 0 : Math.sin(f.ph) * 0.016);
      ctx.save();
      ctx.rotate(winkel);
      for (var k = 0; k < LAGEN.length; k++){
        var q = LAGEN[k].w * f.br * L;
        ctx.globalAlpha = f.a * LAGEN[k].a;
        ctx.fillStyle = sonneVerlauf[k];
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(L, -q);
        ctx.lineTo(L, q);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  // Wie stark ein Korn vom Strahl getroffen wird: 1 in der Mitte, 0 ausserhalb.
  function imStrahl(x){
    if (!staub) return 0;
    var w = Math.max(150, b * 0.42);
    var d = Math.abs(x - strahlMitte()) / w;
    return d >= 1 ? 0 : (1 - d) * (1 - d);
  }

  function zeichnen(){
    ctx.clearRect(0, 0, b, h);
    strahlZeichnen();
    faecherZeichnen();
    var i, s;
    for (i = 0; i < sterne.length; i++){
      s = sterne[i];
      var funkeln = wenigerBewegung ? 1 : (1 - s.f + s.f * (0.5 + 0.5 * Math.sin(s.p)));
      // Im Strahl bis zu zweieinhalbmal so hell. Das ist der ganze Trick: Staub ist ueberall,
      // sichtbar wird er nur dort, wo Licht auf ihn faellt.
      if (staub) funkeln *= 1 + imStrahl(s.x) * 1.5;
      var ton = s.ton === 1 ? farbeWarm : (s.ton === 2 ? farbeKalt : farbeStern);
      if (s.hof){
        // Der Hof ist ein eigener, sehr schwacher Kreis mit Verlauf — vier Radien weit, damit er
        // als Schein und nicht als zweiter Stern gelesen wird.
        var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4.2);
        g.addColorStop(0, ton);
        g.addColorStop(1, 'transparent');
        ctx.globalAlpha = s.a * funkeln * 0.22;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = s.a * funkeln;
      ctx.fillStyle = ton;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      // Runde 73: Vier feine Spitzen nach oben, unten, links und rechts — das, was ein Objektiv
      // aus einem hellen Punkt macht und was ein Stern im Bild von einem Kreis unterscheidet.
      // Nur fuer die helleren: An einem schwachen Punkt waere die Spitze laenger als der Stern
      // selbst und sae wie ein Kreuz aus, nicht wie Licht.
      if (s.zacken){
        var l = s.r * s.zacken;
        ctx.globalAlpha = s.a * funkeln * 0.5;
        ctx.strokeStyle = ton;
        ctx.lineWidth = Math.max(0.5, s.r * 0.32);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x - l, s.y); ctx.lineTo(s.x + l, s.y);
        ctx.moveTo(s.x, s.y - l); ctx.lineTo(s.x, s.y + l);
        ctx.stroke();
      }
    }
    for (i = 0; i < schnuppen.length; i++){
      var f = schnuppen[i];
      var ende = { x: f.x - RICHTUNG_X * f.laenge, y: f.y - RICHTUNG_Y * f.laenge };
      // Ein- und Ausblenden über die Lebensdauer, damit sie nicht hart erscheint und verschwindet.
      var t = f.leben / f.dauer;
      var staerke = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI);
      var g = ctx.createLinearGradient(f.x, f.y, ende.x, ende.y);
      g.addColorStop(0, farbeSchnuppe);
      g.addColorStop(1, 'transparent');
      ctx.globalAlpha = staerke * 0.85;
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(ende.x, ende.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function schritt(){
    if (!laeuft) return;
    var i, s;
    for (i = 0; i < sterne.length; i++){
      s = sterne[i];
      if (staub){
        // Staub zieht nicht, er schwebt: langsam abwaerts, dabei seitlich pendelnd. Eine
        // gerade Diagonale wie bei den Sternen sieht bei einem Korn nach Wind aus, nicht nach
        // Schwerelosigkeit.
        s.sx += s.sv;
        s.x += Math.sin(s.sx) * s.sw * 0.16;
        s.y += s.v * 0.85;
      } else {
        s.x += RICHTUNG_X * s.v;
        s.y += RICHTUNG_Y * s.v;
      }
      s.p += s.pv;
      // Umlaufen statt neu erzeugen: gleichbleibende Anzahl, keine Zuteilung im Bildtakt.
      if (s.x < -4){ s.x = b + 4; s.y = Math.random() * h; }
      if (s.x > b + 4){ s.x = -4; s.y = Math.random() * h; }
      if (s.y > h + 4){ s.y = -4; s.x = Math.random() * b; }
    }
    for (i = schnuppen.length - 1; i >= 0; i--){
      var f = schnuppen[i];
      f.x += RICHTUNG_X * f.v;
      f.y += RICHTUNG_Y * f.v;
      f.leben++;
      if (f.leben > f.dauer || f.x < -200 || f.y > h + 200) schnuppen.splice(i, 1);
    }
    // Im Mittel etwa alle zwölf Sekunden eine, und nie zwei gleichzeitig. Im Hellmodus gar
    // keine: Eine Sternschnuppe am Tageshimmel gibt es nicht, und der Lichtstrahl uebernimmt
    // dort die Rolle des langsam Wandernden.
    if (!staub && !schnuppen.length && Math.random() < 0.0014) schnuppeStarten();

    // Sehr langsam: eine volle Wanderung dauert rund vier Minuten. Schneller gelesen waere es
    // ein Suchscheinwerfer statt eines Nachmittags.
    if (staub){
      strahlPhase += 0.00042;
      for (i = 0; i < faecher.length; i++) faecher[i].ph += faecher[i].pv;
    }
    if (++farbZaehler > 60){ farbZaehler = 0; farbenLesen(); }
    zeichnen();
    rafId = window.requestAnimationFrame(schritt);
  }

  function sichtbar(){
    var v = document.getElementById('view-landing');
    if (!v) return false;
    if (document.hidden) return false;
    try{ return getComputedStyle(v).display !== 'none'; }catch(e){ return false; }
  }

  function pruefen(){
    var soll = sichtbar();
    document.documentElement.classList.toggle('sternen-an', soll);
    if (soll && !laeuft){
      laeuft = true;
      if (wenigerBewegung){ farbenLesen(); zeichnen(); }
      else { rafId = window.requestAnimationFrame(schritt); }
    } else if (!soll && laeuft){
      laeuft = false;
      if (rafId){ window.cancelAnimationFrame(rafId); rafId = null; }
    }
  }

  var groesseTimer = null;
  window.addEventListener('resize', function(){
    if (groesseTimer) clearTimeout(groesseTimer);
    groesseTimer = setTimeout(function(){ groesseTimer = null; aufbauen(); if (laeuft && wenigerBewegung) zeichnen(); }, 200);
  });
  document.addEventListener('visibilitychange', pruefen);

  farbenLesen();
  aufbauen();
  pruefen();
  // Der Ansichtswechsel loest kein Ereignis aus; ein Blick pro Sekunde genuegt und kostet nichts.
  setInterval(pruefen, 1000);
})();

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

  var farbeWarm = null, farbeKalt = null;
  function farbenLesen(){
    try{
      var s = getComputedStyle(document.documentElement);
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
      var t = Math.pow(Math.random(), 2.1);
      // Die grossen waren zu dominant; der obere Rand faellt von 2,27 auf 1,62.
      var r = 0.45 + t * 1.17;
      sterne.push({
        x: Math.random() * b,
        y: Math.random() * h,
        r: r,
        // Helligkeit folgt der Größe: Ein großer, blasser Stern gibt es am Himmel nicht.
        a: 0.20 + t * 0.62 + Math.random() * 0.14,
        // Tempo folgt ebenfalls der Größe — größer heißt näher heißt schneller. Das ist echte
        // Parallaxe statt zufälliger Geschwindigkeit und erzeugt Tiefe.
        // Runde 73: Tempo weiter zurueckgenommen (vorher 0,035 + t*0,20). Die Schnuppen
        // behalten ihres — sie sollen ein Ereignis bleiben, kein Teil der Grundbewegung.
        v: 0.022 + t * 0.125,
        // Kleine Sterne flackern stärker, große stehen ruhiger.
        f: 0.34 - t * 0.26,
        p: Math.random() * Math.PI * 2,
        pv: 0.005 + Math.random() * 0.014,
        // Ein Achtel warm, ein Achtel kalt, der Rest neutral.
        ton: (function(){ var z = Math.random(); return z < 0.12 ? 1 : (z > 0.88 ? 2 : 0); })(),
        // Die hellsten bekommen einen weichen Hof; darunter wäre er nur Unschärfe.
        hof: t > 0.86,
        // Laenge der Spitzen als Vielfaches des Radius; 0 heisst keine. Nur die oberen rund
        // 30 Prozent bekommen welche, und je heller, desto weiter reichen sie.
        zacken: t > 0.68 ? (2.1 + t * 1.9) : 0
      });
    }
    schnuppen.length = 0;
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

  function zeichnen(){
    ctx.clearRect(0, 0, b, h);
    var i, s;
    for (i = 0; i < sterne.length; i++){
      s = sterne[i];
      var funkeln = wenigerBewegung ? 1 : (1 - s.f + s.f * (0.5 + 0.5 * Math.sin(s.p)));
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
      s.x += RICHTUNG_X * s.v;
      s.y += RICHTUNG_Y * s.v;
      s.p += s.pv;
      // Umlaufen statt neu erzeugen: gleichbleibende Anzahl, keine Zuteilung im Bildtakt.
      if (s.x < -4){ s.x = b + 4; s.y = Math.random() * h; }
      if (s.y > h + 4){ s.y = -4; s.x = Math.random() * b; }
    }
    for (i = schnuppen.length - 1; i >= 0; i--){
      var f = schnuppen[i];
      f.x += RICHTUNG_X * f.v;
      f.y += RICHTUNG_Y * f.v;
      f.leben++;
      if (f.leben > f.dauer || f.x < -200 || f.y > h + 200) schnuppen.splice(i, 1);
    }
    // Im Mittel etwa alle zwölf Sekunden eine, und nie zwei gleichzeitig.
    if (!schnuppen.length && Math.random() < 0.0014) schnuppeStarten();

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

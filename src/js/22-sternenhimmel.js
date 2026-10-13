/* Bewegter Hintergrund der Startseite. Eigene IIFE: liest Zustand aus dem DOM und Farben aus den
   CSS-Marken (hell/dunkel ohne Farbwerte hier).
   Sparsam: laeuft nur auf der Startseite, pausiert im Hintergrund, Pixeldichte max. 1,5, malt jedes
   zweite Bild, steht unter Schublade/Fenstern und bei reduzierter Bewegung still. */
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
  var farbeStaubLicht = 'transparent';
  var farbeHimmel = 'transparent', himmelVerlauf = null;
  var farbeWolke = 'transparent', farbeWolkeLicht = 'transparent', wolken = [];

  // Nie 'transparent' in einem Canvas-Verlauf: Er laeuft nach rgba(0,0,0,0) und damit durch Grau nach
  // Schwarz (schmutziger Schleier). Endpunkt ist dieselbe Farbe mit Deckkraft 0. Im CSS ist
  // 'transparent' dagegen richtig.
  function ohneDeckung(farbe){
    var m = /^rgba?\(([^)]+)\)/.exec(farbe || '');
    if (!m) return 'rgba(0,0,0,0)';
    var z = m[1].split(',');
    return 'rgba(' + z[0].trim() + ',' + (z[1]||'0').trim() + ',' + (z[2]||'0').trim() + ',0)';
  }
  // Welche Atmosphaere gilt (Sterne/Staub), sagt das Stilblatt ueber --atmosphaere, nicht dieses
  // Skript.
  var staub = false;
  function farbenLesen(){
    try{
      var s = getComputedStyle(document.documentElement);
      var art = (s.getPropertyValue('--atmosphaere') || '').replace(/['"\s]/g, '');
      var neuStaub = art === 'staub';
      if (neuStaub !== staub){ staub = neuStaub; aufbauen(); }
      farbeStrahl = (s.getPropertyValue('--lichtstrahl') || '').trim() || 'transparent';
      var neuSonne = (s.getPropertyValue('--sonnenstrahl') || '').trim() || 'transparent';
      // Verlaeufe einmal erzeugen und je Strahl nur drehen — sonst sechzig Zuteilungen pro Sekunde.
      if (neuSonne !== farbeSonne){ farbeSonne = neuSonne; sonneGezeichnet = null; }
      farbeStern = (s.getPropertyValue('--stern') || '').trim() || 'rgba(21,32,25,.5)';
      farbeSchnuppe = (s.getPropertyValue('--stern-schnuppe') || '').trim() || farbeStern;
      // Ein kleiner Teil der Sterne zieht ins Warme bzw. Kalte.
      farbeWarm = (s.getPropertyValue('--stern-warm') || '').trim() || farbeStern;
      farbeKalt = (s.getPropertyValue('--stern-kalt') || '').trim() || farbeStern;
      farbeStaubLicht = (s.getPropertyValue('--staub-licht') || '').trim() || 'transparent';
      var neuHoch = (s.getPropertyValue('--himmel-hoch') || '').trim() || 'transparent';
      var neuWolke = (s.getPropertyValue('--wolke') || '').trim() || 'transparent';
      var neuWolkeLicht = (s.getPropertyValue('--wolke-licht') || '').trim() || 'transparent';
      if (neuHoch !== farbeHimmel){ farbeHimmel = neuHoch; himmelVerlauf = null; }
      if (neuWolke !== farbeWolke || neuWolkeLicht !== farbeWolkeLicht){
        farbeWolke = neuWolke; farbeWolkeLicht = neuWolkeLicht; wolkenBauen();
      }
      staubToeneBauen();
    }catch(e){}
  }

  function aufbauen(){
    var neuB = window.innerWidth, neuH = window.innerHeight;
    if (!neuB || !neuH) return;
    // Pixeldichte max. 1,5: Bei 2 lief die Startseite im Simulator mit ~9 Bildern/s; sichtbar kostet
    // es kaum etwas.
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    b = neuB; h = neuH;
    canvas.width = Math.round(b * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Anzahl an der Fläche bemessen, nicht fest: Auf einem Telefon wären 200 Sterne ein Teppich,
    // auf einem Schreibtisch wären 40 eine leere Fläche.
    var anzahl = Math.round(Math.min(420, Math.max(110, (b * h) / 3100)));
    sterne.length = 0;
    for (var i = 0; i < anzahl; i++){
      // Viele schwache, wenige helle Sterne (Potenz). Bei hoeherem Exponenten fielen fast alle unter
      // einen Bildpunkt.
      var t = Math.pow(Math.random(), staub ? 1.7 : 2.1);
      // Staub ist gross, weich und blass (ausserhalb der Schaerfe), Sterne klein und hell.
      var r = staub ? (1.6 + t * 4.8) : (0.45 + t * 1.17);
      sterne.push({
        x: Math.random() * b,
        y: Math.random() * h,
        r: r,
        // Staub schwebt: Er faellt langsam und schwankt dabei seitlich. Die Phase steht hier,
        // damit nicht alle Koerner im Gleichtakt pendeln.
        sx: Math.random() * Math.PI * 2,
        sv: 0.004 + Math.random() * 0.010,
        sw: 0.25 + Math.random() * 0.65,
        // Helligkeit folgt der Groesse. Staub ist ausserhalb des Strahls praktisch unsichtbar — das
        // macht ihn im Strahl zu Staub.
        a: staub ? (0.05 + t * 0.16 + Math.random() * 0.06)
                 : (0.20 + t * 0.62 + Math.random() * 0.14),
        // Tempo folgt der Groesse (Parallaxe). Schnuppen behalten ihr eigenes Tempo.
        v: staub ? (0.012 + t * 0.055) : (0.022 + t * 0.125),
        // Kleine Sterne flackern stärker, große stehen ruhiger.
        f: 0.34 - t * 0.26,
        p: Math.random() * Math.PI * 2,
        pv: 0.005 + Math.random() * 0.014,
        // Ein Achtel warm, ein Achtel kalt, der Rest neutral.
        ton: (function(){ var z = Math.random(); return z < 0.12 ? 1 : (z > 0.88 ? 2 : 0); })(),
        // Die hellsten bekommen einen weichen Hof; darunter wäre er nur Unschärfe. Bei Staub
        // haben mehr Koerner einen: Ein Korn im Licht leuchtet diffus, ein Stern punktfoermig.
        hof: !staub && t > 0.86,
        // Wie weich das Korn ist: wenige mit Kern, die meisten reine Unschaerfe.
        kern: staub ? (0.10 + Math.random() * 0.30) : 1,
        // Spitzen (Vielfaches des Radius) nur fuer die hellsten ~30 % der Sterne, nie fuer Staub.
        zacken: (!staub && t > 0.68) ? (2.1 + t * 1.9) : 0
      });
    }
    schnuppen.length = 0;
    strahlenAufbauen();
    wolkenBauen();
    himmelVerlauf = null;
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

  // Himmel des Hellmodus: Verlauf von oben (tiefer, kuehler) nach unten und sehr blasse, breite Wolken
  // — erst beides liest sich als Himmel.
  // Wolken als fertige Bilder, einmal gezeichnet und nur verschoben. Zwei Fallen: Ballen innen mit
  // voller Deckung malen und erst beim Aufsetzen durchsichtig machen (sonst addieren sich
  // Ueberlappungen zu sichtbaren Kreisen); Ballen sitzen mit der Unterkante auf einer Linie (flacher
  // Boden).
  function ohneAlpha(farbe){
    var m = /^rgba?\(([^)]+)\)/.exec(farbe || '');
    if (!m) return {farbe: farbe, a: 1};
    var z = m[1].split(',');
    return {
      farbe: 'rgb(' + z[0].trim() + ',' + (z[1]||'0').trim() + ',' + (z[2]||'0').trim() + ')',
      a: z.length > 3 ? Number(z[3]) : 1
    };
  }
  function wolkeMalen(breite){
    var koerper = ohneAlpha(farbeWolke), kante = ohneAlpha(farbeWolkeLicht);
    // Erst die Form, dann das Bild darum (sonst Rechteckwolken). Die Zahlen haengen zusammen: 7 Ballen
    // auf 86 % Breite, Radien 15–22 % — alle beruehren sich, Wolke etwa dreimal so breit wie hoch.
    var n = 7;
    var ballen = [], i;
    for (i = 0; i < n; i++){
      var t = i / (n - 1);
      // Die Kuppe steigt zur Mitte hin an und ist dabei ungleichmaessig — der Zufall liegt auf
      // der HOEHE, nicht auf der Lage: Eine Wolke mit Luecken darin ist keine.
      var hoch = Math.sin(Math.PI * (0.12 + 0.76 * t));
      var r = breite * (0.15 + hoch * (0.04 + Math.random() * 0.03));
      // Unterkante auf derselben Linie: flacher, weicher Boden — nicht abschneiden.
      ballen.push({ x: breite * (0.07 + 0.86 * t), y: -r * 0.92, r: r });
    }
    // Umriss ausmessen, Rand fuer den weichen Auslauf dazu.
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (i = 0; i < ballen.length; i++){
      var k = ballen[i];
      if (k.x - k.r < minX) minX = k.x - k.r;
      if (k.x + k.r > maxX) maxX = k.x + k.r;
      if (k.y - k.r < minY) minY = k.y - k.r;
      if (k.y + k.r > maxY) maxY = k.y + k.r;
    }
    var rand = 2;
    var wB = Math.ceil(maxX - minX) + rand * 2;
    var wH = Math.ceil(maxY - minY) + rand * 2;
    if (!(wB > 2 && wH > 2)) return null;
    var w = document.createElement('canvas');
    w.width = wB; w.height = wH;
    var c = w.getContext('2d');
    if (!c) return null;
    c.translate(rand - minX, rand - minY);
    function malen(farbe, versatzX, versatzY, schrumpf){
      for (var j = 0; j < ballen.length; j++){
        var k2 = ballen[j], r2 = k2.r * schrumpf;
        if (r2 <= 0.5) continue;
        var x = k2.x + versatzX, y = k2.y + versatzY;
        var g = c.createRadialGradient(x, y, r2 * 0.05, x, y, r2);
        // Voll deckend bis weit nach aussen, dann weich auslaufen. Der deckende Kern ist der
        // Grund, warum sich Ueberlappungen nicht als einzelne Kreise zeigen.
        g.addColorStop(0, farbe);
        g.addColorStop(0.58, farbe);
        g.addColorStop(1, ohneDeckung(farbe));
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r2, 0, Math.PI * 2);
        c.fill();
      }
    }
    malen(koerper.farbe, 0, 0, 1);
    // Die vom Licht getroffene Kante liegt oben rechts — dieselbe Sonne wie beim Faecher. Sie
    // bleibt INNERHALB der Wolke (source-atop), sonst haette die Wolke einen zweiten Umriss.
    c.globalCompositeOperation = 'source-atop';
    malen(kante.farbe, breite * 0.02, -breite * 0.025, 0.78);
    c.globalCompositeOperation = 'source-over';
    return {bild: w, a: koerper.a, breite: wB, hoehe: wH};
  }

  function wolkenBauen(){
    wolken.length = 0;
    if (!staub || farbeWolke === 'transparent' || !b || !h) return;
    // Drei Wolken. Zwei waeren zu wenig, um eine Richtung erkennen zu lassen, fuenf zu viel
    // fuer eine Flaeche, hinter der Text steht.
    var anzahl = 3;
    for (var i = 0; i < anzahl; i++){
      var gemalt = wolkeMalen(b * (0.34 + Math.random() * 0.30));
      if (!gemalt) continue;
      wolken.push({
        bild: gemalt.bild,
        deckung: gemalt.a,
        breite: gemalt.breite,
        hoehe: gemalt.hoehe,
        x: (i / anzahl) * (b + gemalt.breite) - gemalt.breite * 0.5 + Math.random() * b * 0.2,
        // Nur im oberen Viertel und nie zwei auf derselben Hoehe (sonst verschmelzen sie zu einer
        // Bank).
        y: h * (0.07 + (i / anzahl) * 0.22 + Math.random() * 0.05),
        // Sehr langsam, und die weiter oben stehende zieht langsamer: Entfernung.
        v: 0.055 + Math.random() * 0.075
      });
    }
  }

  function himmelZeichnen(){
    if (!staub) return;
    if (farbeHimmel !== 'transparent'){
      if (!himmelVerlauf){
        // Farbe nur oben; volle Farbe bis 18 %, weil die Kopfleiste die oberen ~8 % verdeckt.
        var g = ctx.createLinearGradient(0, 0, 0, h * 0.70);
        g.addColorStop(0, farbeHimmel);
        g.addColorStop(0.18, farbeHimmel);
        g.addColorStop(1, ohneDeckung(farbeHimmel));
        himmelVerlauf = g;
      }
      ctx.fillStyle = himmelVerlauf;
      ctx.fillRect(0, 0, b, h * 0.70);
    }
    for (var i = 0; i < wolken.length; i++){
      var wo = wolken[i];
      if (!wo.bild) continue;
      // Umlaufend: Wer links hinausgezogen ist, kommt rechts wieder herein. Ohne das waere der
      // Himmel nach zehn Minuten leer.
      var x = wo.x;
      ctx.globalAlpha = wo.deckung;
      ctx.drawImage(wo.bild, x, wo.y, wo.breite, wo.hoehe);
      if (x + wo.breite > b) ctx.drawImage(wo.bild, x - (b + wo.breite), wo.y, wo.breite, wo.hoehe);
      if (x < 0) ctx.drawImage(wo.bild, x + b + wo.breite, wo.y, wo.breite, wo.hoehe);
      ctx.globalAlpha = 1;
    }
  }

  function wolkenBewegen(){
    if (wenigerBewegung) return;
    for (var i = 0; i < wolken.length; i++){
      var wo = wolken[i];
      wo.x -= wo.v;
      if (wo.x < -wo.breite) wo.x = b;
    }
  }

  // Der Lichtstreifen des Hellmodus: wandert ueber Minuten; Staub darin wird heller.
  var strahlPhase = Math.random() * Math.PI * 2;
  function strahlMitte(){
    return b * (0.5 + 0.34 * Math.sin(strahlPhase));
  }
  function strahlZeichnen(){
    if (!staub || farbeStrahl === 'transparent') return;
    var m = strahlMitte(), w = Math.max(150, b * 0.42);
    var g = ctx.createLinearGradient(m - w, 0, m + w, h);
    var leer = ohneDeckung(farbeStrahl);
    g.addColorStop(0, leer);
    g.addColorStop(0.5, farbeStrahl);
    g.addColorStop(1, leer);
    ctx.globalAlpha = 0.17;
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, b, h);
    ctx.globalAlpha = 1;
  }
  // Der Sonnenfaecher: Strahlen aus EINER Quelle ausserhalb der rechten oberen Ecke — Richtung und
  // Quelle unterscheiden Tag von Nacht.
  // Ungleich breit und hell (sonst Sonnenschirm), mehrere Lagen je Strahl (keine Kante), gleiche Phase
  // wie der Streifen (eine Lichtquelle).
  var faecher = [];
  // Grundrichtung 2,05 rad (~117 Grad): ueberwiegend nach unten, leicht nach links. Flacher liefen die
  // Strahlen seitlich aus der Seite.
  var FAECHER_MITTE = 2.05;
  function strahlenAufbauen(){
    faecher.length = 0;
    if (!staub) return;
    var n = 7;
    for (var i = 0; i < n; i++){
      var mitte = (i / (n - 1)) - 0.5;
      faecher.push({
        // Ablage vom Mittelwinkel, mit etwas Unregelmaessigkeit: gleiche Abstaende sehen
        // gezeichnet aus.
        ab: mitte * 0.92 + (Math.random() - 0.5) * 0.07,
        // Halbe Breite als Steigung (Gegenkathete je Laenge). Die schmalen sind die klaren.
        br: 0.012 + Math.random() * 0.030,
        // Mitte des Faechers kraeftiger als die Raender. Bewusst schwach: Mehr Deckkraft liess die
        // Seite in Gelb baden; ein dunklerer Grund verstaerkt dieselben Werte.
        a: (0.11 + 0.12 * Math.random()) * (1 - Math.abs(mitte) * 0.80),
        ph: Math.random() * Math.PI * 2,
        pv: 0.00070 + Math.random() * 0.00150,
        // Jeder Strahl atmet mit eigener, zufaelliger Phase — das ergibt Glanz statt Flaeche;
        // gekoppelt saehe es nach Blinken aus.
        gph: Math.random() * Math.PI * 2,
        gpv: 0.00090 + Math.random() * 0.00190,
        // Jeder Strahl hat eine eigene, langsam schwankende Laenge — er endet irgendwo.
        laenge: 0.42 + Math.random() * 0.44,
        lph: Math.random() * Math.PI * 2,
        lpv: 0.00055 + Math.random() * 0.0011
      });
    }
  }
  // Lagen je Strahl: Breite waechst, Deckkraft faellt — glockenfoermiger Querschnitt ohne Kanten. Die
  // erste, schmale Lage ueber voller Deckkraft ist der Glanzkern; mehr Deckkraft fuer alle Lagen waere
  // falsch.
  var LAGEN = [{w:0.42, a:1.55}, {w:1.0, a:1.00}, {w:1.6, a:0.62}, {w:2.4, a:0.40},
               {w:3.4, a:0.22}, {w:4.6, a:0.11}, {w:6.0, a:0.05}];
  function sonneAufbauen(){
    sonneVerlauf.length = 0;
    var L = (b + h) * 1.25;
    for (var i = 0; i < LAGEN.length; i++){
      var g = ctx.createLinearGradient(0, 0, L, 0);
      // Maximum im ersten Drittel, nicht an der Quelle (dort wuerden sich alle Strahlen zu einem Fleck
      // ueberlagern).
      var leer = ohneDeckung(farbeSonne);
      g.addColorStop(0, leer);
      g.addColorStop(0.26, farbeSonne);
      g.addColorStop(0.58, farbeSonne);
      g.addColorStop(1, leer);
      sonneVerlauf.push(g);
    }
    sonneGezeichnet = farbeSonne;
  }
  function sonneOrt(){
    // Die Sonne liegt knapp ausserhalb der rechten oberen Ecke; sichtbar ist nur ihr Licht.
    return { x: b * (0.99 + 0.06 * Math.sin(strahlPhase)), y: -h * 0.05 };
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
      var winkel = basis + f.ab + (wenigerBewegung ? 0 : Math.sin(f.ph) * 0.030);
      // Laenge skaliert statt neu gerechnet, damit der zwischengespeicherte Verlauf mitwaechst (sonst
      // abgeschnitten = Kante).
      var lang = f.laenge * (wenigerBewegung ? 1 : (1 + Math.sin(f.lph) * 0.22));
      // Eigene Helligkeit des Strahls: 0,74–1,26 des Grundwerts.
      var glanz = wenigerBewegung ? 1 : (1 + Math.sin(f.gph) * 0.26);
      ctx.save();
      ctx.rotate(winkel);
      ctx.scale(lang, lang);
      for (var k = 0; k < LAGEN.length; k++){
        var q = LAGEN[k].w * f.br * L;
        ctx.globalAlpha = f.a * LAGEN[k].a * glanz;
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
  // Wie stark ein Korn beleuchtet ist, haengt am WINKEL von der Sonne zum Korn — Staub ist hell, wo
  // tatsaechlich ein Strahl ist.
  function imStrahl(x, y){
    if (!staub || !faecher.length) return 0;
    var o = sonneOrt();
    var basis = FAECHER_MITTE + Math.sin(strahlPhase) * 0.085;
    var d = Math.atan2(y - o.y, x - o.x) - basis;
    while (d >  Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    var summe = 0;
    for (var i = 0; i < faecher.length; i++){
      var f = faecher[i];
      // Die weichen Aussenlagen reichen weiter als die Kernbreite; der Faktor bildet das ab.
      var e = Math.abs(d - f.ab) / (f.br * 2.6 + 0.02);
      if (e >= 1) continue;
      // Hinter dem Strahlende ist kein Licht mehr.
      var weg = Math.sqrt((x - o.x) * (x - o.x) + (y - o.y) * (y - o.y));
      if (weg > f.laenge * (b + h) * 1.25) continue;
      summe += (1 - e) * (1 - e) * (f.a / 0.8);
    }
    return summe > 1 ? 1 : summe;
  }

  // Acht vorgemischte Stufen zwischen "im Schatten" und "im Strahl".
  var STAUB_STUFEN = 8;
  var staubToene = null;
  function farbeZerlegen(t){
    var m = /rgba?\(([^)]+)\)/.exec(t || '');
    if (!m) return null;
    var z = m[1].split(',').map(function(v){ return parseFloat(v); });
    return [z[0]||0, z[1]||0, z[2]||0, z.length > 3 ? z[3] : 1];
  }
  function staubToeneBauen(){
    staubToene = [];
    var a = farbeZerlegen(farbeStern), c = farbeZerlegen(farbeStaubLicht) || a;
    if (!a){ staubToene = null; return; }
    for (var i = 0; i < STAUB_STUFEN; i++){
      var t = i / (STAUB_STUFEN - 1);
      staubToene.push('rgba(' +
        Math.round(a[0] + (c[0]-a[0])*t) + ',' +
        Math.round(a[1] + (c[1]-a[1])*t) + ',' +
        Math.round(a[2] + (c[2]-a[2])*t) + ',' +
        (a[3] + (c[3]-a[3])*t).toFixed(3) + ')');
    }
  }
  function staubFarbe(licht){
    if (!staubToene) return farbeStern;
    var i = Math.round(licht * (STAUB_STUFEN - 1));
    return staubToene[i < 0 ? 0 : (i > STAUB_STUFEN-1 ? STAUB_STUFEN-1 : i)];
  }

  // Ein Korn: ein Verlauf ohne Kante, innen so weit dicht, wie s.kern sagt.
  function staubKorn(s, farbe, alpha){
    if (alpha <= 0.004) return;
    var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
    g.addColorStop(0, farbe);
    g.addColorStop(s.kern, farbe);
    g.addColorStop(1, ohneDeckung(farbe));
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function zeichnen(){
    ctx.clearRect(0, 0, b, h);
    // Der Himmel liegt zuunterst: Strahl, Faecher und Staub gehoeren davor, sonst laege das
    // Licht hinter den Wolken statt auf ihnen.
    himmelZeichnen();
    strahlZeichnen();
    faecherZeichnen();
    var i, s;
    for (i = 0; i < sterne.length; i++){
      s = sterne[i];
      var funkeln = wenigerBewegung ? 1 : (1 - s.f + s.f * (0.5 + 0.5 * Math.sin(s.p)));
      // Im Strahl bis zu 2,5-mal so hell. funkelnRoh ist das Flackern ohne Strahlverstaerkung (sonst
      // zaehlte der Strahl doppelt).
      var funkelnRoh = funkeln;
      var ton = s.ton === 1 ? farbeWarm : (s.ton === 2 ? farbeKalt : farbeStern);
      if (s.hof){
        // Der Hof ist ein eigener, sehr schwacher Kreis mit Verlauf — vier Radien weit, damit er
        // als Schein und nicht als zweiter Stern gelesen wird.
        var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4.2);
        g.addColorStop(0, ton);
        g.addColorStop(1, ohneDeckung(ton));
        ctx.globalAlpha = s.a * funkeln * 0.22;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (staub){
        // Ein Korn als weicher Verlauf ohne Kante, in EINER Lage: Die Farbe wandert mit dem Licht (im
        // Schatten leicht dunkler, im Strahl heller), gemischt in acht Stufen. Zwei Lagen gleicher
        // Groesse ergaben Ringe.
        var licht = imStrahl(s.x, s.y);
        staubKorn(s, staubFarbe(licht), s.a * (0.85 + 2.6 * licht) * funkelnRoh);
      } else {
        ctx.globalAlpha = s.a * funkeln;
        ctx.fillStyle = ton;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Vier feine Spitzen nur an hellen Sternen (an schwachen saehe es wie ein Kreuz aus).
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

  // Unter Schublade und Fenstern steht der Himmel still: backdrop-filter ueber bewegtem Grund muss
  // WebKit in jedem Bild neu rechnen (gemessen 190 statt 94 ms je Bild).
  var UEBERLAGERUNGEN = ['drawerPanel', 'imgModal', 'plusModal'].map(function(id){
    return document.getElementById(id);
  }).filter(Boolean);
  function verdeckt(){
    for (var i = 0; i < UEBERLAGERUNGEN.length; i++){
      if (UEBERLAGERUNGEN[i].classList.contains('open')) return true;
    }
    return false;
  }
  // Gemalt wird jedes zweite Bild, bewegt jedes — bei dieser Langsamkeit unsichtbar, halbe Kosten.
  var bildTakt = 0;
  // Waehrend des Bildlaufs (und 180 ms danach) steht der Himmel still — dort war er im Simulator am
  // teuersten.
  var bildlaufBis = 0;
  window.addEventListener('scroll', function(){ bildlaufBis = performance.now() + 180; }, {passive:true});
  function schritt(){
    if (!laeuft) return;
    if (verdeckt() || performance.now() < bildlaufBis){ rafId = window.requestAnimationFrame(schritt); return; }
    var i, s;
    for (i = 0; i < sterne.length; i++){
      s = sterne[i];
      if (staub){
        // Staub schwebt: langsam abwaerts, seitlich pendelnd.
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
    // Im Mittel alle ~12 s eine Schnuppe, nie zwei, im Hellmodus keine.
    if (!staub && !schnuppen.length && Math.random() < 0.0014) schnuppeStarten();

    // Sehr langsam: eine volle Wanderung dauert rund vier Minuten. Schneller gelesen waere es
    // ein Suchscheinwerfer statt eines Nachmittags.
    if (staub){
      strahlPhase += 0.00042;
      for (i = 0; i < faecher.length; i++){ faecher[i].ph += faecher[i].pv; faecher[i].lph += faecher[i].lpv; faecher[i].gph += faecher[i].gpv; }
      wolkenBewegen();
    }
    if (++farbZaehler > 60){ farbZaehler = 0; farbenLesen(); }
    if ((++bildTakt & 1) === 0) zeichnen();
    rafId = window.requestAnimationFrame(schritt);
  }

  // Die Flaeche liegt auch unter dem Fragebogen — dort STILL (ein Bild, danach kein
  // requestAnimationFrame) und leiser (html.sternen-still). ANSICHTEN: wo sie liegt; BEWEGTE_ANSICHT:
  // wo sie laeuft.
  var ANSICHTEN = ['view-landing', 'view-quiz'];
  var BEWEGTE_ANSICHT = 'view-landing';
  function sichtbar(){
    if (document.hidden) return null;
    for (var i = 0; i < ANSICHTEN.length; i++){
      var v = document.getElementById(ANSICHTEN[i]);
      if (!v) continue;
      try{ if (getComputedStyle(v).display !== 'none') return ANSICHTEN[i]; }catch(e){}
    }
    return null;
  }

  // Ansicht und Takt getrennt von `laeuft` gemerkt, sonst bliebe ein Wechsel Startseite -> Fragebogen
  // unbemerkt.
  var ansicht = null, stillerTakt = false;
  function pruefen(){
    var soll = sichtbar();
    // Zwei Fragen: gedaempft (wird hier gelesen? haengt an der Ansicht) und still (darf sich etwas
    // bewegen? haengt auch an der Bewegungsvorliebe). Reduzierte Bewegung heisst nicht weniger
    // Helligkeit.
    var gedaempft = !!soll && soll !== BEWEGTE_ANSICHT;
    var still = !!soll && (wenigerBewegung || gedaempft);
    document.documentElement.classList.toggle('sternen-an', !!soll);
    document.documentElement.classList.toggle('sternen-still', gedaempft);
    if (soll === ansicht && still === stillerTakt) return;
    ansicht = soll; stillerTakt = still;
    if (rafId){ window.cancelAnimationFrame(rafId); rafId = null; }
    laeuft = !!soll;
    if (!soll) return;
    // Vor dem ersten Bild die Farben lesen, nicht erst nach 60 Bildern: Sonst zeigt das erste
    // gezeichnete Bild nach der Rueckkehr die Atmosphaere des vorigen Farbmodus.
    farbenLesen();
    // Auch im bewegten Takt sofort ein Bild malen — sonst lag hinter der Schublade leeres Papier.
    zeichnen();
    if (!still){ rafId = window.requestAnimationFrame(schritt); }
  }

  var groesseTimer = null;
  window.addEventListener('resize', function(){
    if (groesseTimer) clearTimeout(groesseTimer);
    // Im stillen Takt muss die Flaeche nach dem Neuaufbau selbst neu gezeichnet werden; im
    // bewegten tut das das naechste Bild von allein.
    groesseTimer = setTimeout(function(){ groesseTimer = null; aufbauen(); if (stillerTakt) zeichnen(); }, 200);
  });
  document.addEventListener('visibilitychange', pruefen);

  // Ein Wechsel des Farbmodus meldet sich selbst (data-theme und Systemeinstellung), sonst blieben bis
  // zu zwei Sekunden die Farben des alten Modus stehen.
  function modusGewechselt(){
    farbenLesen();
    if (laeuft) zeichnen();
    else ctx.clearRect(0, 0, b, h);   // nichts stehen lassen, was zum neuen Modus nicht passt
  }
  try{
    new MutationObserver(modusGewechselt).observe(document.documentElement,
      { attributes:true, attributeFilter:['data-theme'] });
  }catch(e){}
  try{
    var mm = window.matchMedia('(prefers-color-scheme: dark)');
    if (mm.addEventListener) mm.addEventListener('change', modusGewechselt);
    else if (mm.addListener) mm.addListener(modusGewechselt);
  }catch(e){}

  // Aufbau der Offscreen-Bilder erst nach dem ersten gemalten Bild (zwei requestAnimationFrame), damit
  // die Oberflaeche frueher erscheint; der Sekundentakt startet danach.
  function starten(){
    farbenLesen();
    aufbauen();
    pruefen();
    // Der Sekundentakt bleibt als Netz; der Ansichtswechsel meldet sich selbst, sonst lief die Flaeche
    // nach "Test starten" noch bis zu einer Sekunde weiter.
    try{
      var wache = new MutationObserver(pruefen);
      for (var i = 0; i < ANSICHTEN.length; i++){
        var el = document.getElementById(ANSICHTEN[i]);
        if (el) wache.observe(el, { attributes:true, attributeFilter:['class', 'style'] });
      }
    }catch(e){}
    setInterval(pruefen, 1000);
  }
  if (window.requestAnimationFrame){
    window.requestAnimationFrame(function(){ window.requestAnimationFrame(starten); });
  } else {
    starten();
  }
})();

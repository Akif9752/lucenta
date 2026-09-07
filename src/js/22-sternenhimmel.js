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
  var farbeStaubLicht = 'transparent';
  var farbeHimmel = 'transparent', himmelVerlauf = null;
  var farbeWolke = 'transparent', farbeWolkeLicht = 'transparent', wolken = [];

  // ---------- Warum hier nirgends 'transparent' in einem Verlauf steht ----------
  //
  // Rueckmeldung Runde 88: "die sonnenstrahlen sind zu schwarz". Gemessen am rechten Rand:
  // Farbe (89,89,64) bei Deckkraft 20 — die Strahlen DUNKELTEN dort ab, statt aufzuhellen.
  //
  // Der Grund ist eine Eigenheit der Zeichenflaeche: Ein Verlauf von einer Farbe nach
  // 'transparent' laeuft nicht nach "dieselbe Farbe, nur unsichtbar", sondern nach
  // rgba(0,0,0,0) — nach SCHWARZ mit Deckkraft null. Und weil die Zeichenflaeche die vier
  // Kanaele einzeln zwischenrechnet, wandert die Farbe auf dem Weg dorthin durch Grau nach
  // Schwarz. Auf einem hellen Grund ist das ein schmutziger Schleier genau dort, wo ein
  // Strahl am weichsten auslaufen soll. (Im Stilblatt passiert das NICHT — CSS rechnet
  // Verlaeufe mit vorher multiplizierter Deckkraft; deshalb ist dieselbe Schreibweise dort
  // richtig und hier falsch.)
  //
  // Die Loesung ist immer dieselbe: als Endpunkt DIESELBE Farbe nehmen, nur mit Deckkraft 0.
  function ohneDeckung(farbe){
    var m = /^rgba?\(([^)]+)\)/.exec(farbe || '');
    if (!m) return 'rgba(0,0,0,0)';
    var z = m[1].split(',');
    return 'rgba(' + z[0].trim() + ',' + (z[1]||'0').trim() + ',' + (z[2]||'0').trim() + ',0)';
  }
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
      // Runde 86: Der Staub sah nicht nach Staub aus, weil er wie ein Stern gebaut war — klein,
      // hart umrissen, hell. Ein Korn im Lichtstrahl ist das Gegenteil: Es liegt fast immer
      // ausserhalb der Schaerfe der Linse, ist deshalb GROSS und WEICH und dabei so blass, dass
      // man es nur bemerkt, wenn Licht darauf faellt. Der Radius steigt von 0,7-2,2 auf 1,6-6,4,
      // und gezeichnet wird nicht mehr ein Kreis mit Rand, sondern ein Verlauf ohne Kante.
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
        // Helligkeit folgt der Größe: Ein großer, blasser Stern gibt es am Himmel nicht.
        // Deutlich blasser als vorher (war bis 0,60): Die Helligkeit soll aus dem Strahl kommen,
        // nicht aus dem Korn. Ausserhalb des Strahls ist Staub praktisch unsichtbar — genau das
        // macht ihn im Strahl erst zu Staub.
        a: staub ? (0.05 + t * 0.16 + Math.random() * 0.06)
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
        hof: !staub && t > 0.86,
        // Wie weich das Korn ist: Ein Teil liegt naeher an der Schaerfeebene und hat einen
        // erkennbaren Kern, die meisten sind reine Unschaerfe. Ohne diesen Unterschied sieht
        // ein Feld aus weichen Flecken wieder gleichfoermig aus.
        kern: staub ? (0.10 + Math.random() * 0.30) : 1,
        // Laenge der Spitzen als Vielfaches des Radius; 0 heisst keine. Nur die oberen rund
        // 30 Prozent bekommen welche, und je heller, desto weiter reichen sie.
        // Spitzen sind die Signatur eines Sterns. Auf einem Staubkorn waeren sie schlicht
        // falsch — es leuchtet nicht selbst, es wird angeleuchtet.
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

  // ---------- Der Himmel des Hellmodus (Runde 93) ----------
  //
  // Rueckmeldung: "man erkennt im hellmodus nicht auf der startseite dass der hintergrund auch
  // wirklich ein himmel sein soll."
  //
  // Das stimmte, und der Grund ist, dass bis hier nur LICHT gebaut war: ein Strahl, ein Faecher,
  // Staub darin. Licht allein sagt aber nichts darueber, WO man steht — dasselbe Bild waere
  // auch ein Zimmer mit einem Fenster. Was einen Himmel ausmacht, sind zwei Dinge, die beide
  // gefehlt haben:
  //
  //   1. Oben ist er anders als unten. Ein Himmel wird zum Zenit hin tiefer und kuehler und
  //      zum Horizont hin heller und waermer. Diese eine Achse ist der staerkste Hinweis, den
  //      es gibt, und sie kostet einen Verlauf.
  //   2. Es steht etwas darin. Ohne Wolken ist eine blaue Flaeche eine blaue Flaeche; erst ein
  //      Gebilde mit Rand, das langsam zieht, macht daraus Entfernung.
  //
  // Die Wolken sind bewusst sehr blass und sehr breit. Eine erkennbare Schaefchenwolke waere
  // eine Illustration — die Seite traegt einen Persoenlichkeitstest, keine Wetterkarte. Sie
  // sollen im Vorbeisehen als Himmel gelesen werden und beim Hinsehen nicht ablenken.
  //
  // Gebaut als fertige Bilder statt als Verlaeufe je Bild: Eine Wolke besteht aus acht weichen
  // Ballen, das waeren acht createRadialGradient pro Wolke und Bild, also ueber tausend
  // Zuteilungen in der Sekunde fuer etwas, das sich in einer Minute um sechzig Bildpunkte
  // bewegt. Einmal zeichnen und dann nur noch verschieben kostet nichts.
  // Zwei Fallen stecken darin, und der erste Entwurf ist in beide gelaufen:
  //
  //   1. Halbdurchsichtige Ballen ADDIEREN ihre Deckung, wo sie sich ueberlappen. Aus acht
  //      Ballen mit je 30 Prozent wurden Flaechen mit 30, 51 und 65 Prozent — und damit war
  //      jeder einzelne Kreis als Kreis zu sehen. Im Bild sah das nach Seifenblasen aus, nicht
  //      nach Wolke. Deshalb wird das Bild INNEN mit voller Deckung gemalt und erst beim
  //      Aufsetzen als Ganzes durchsichtig gemacht: Ueberlappungen verschwinden dann.
  //   2. Ballen auf einer Linie ergeben eine Raupe. Eine Haufenwolke hat einen flachen Boden
  //      (dort endet die Feuchtigkeit) und eine unregelmaessige Kuppe. Die Ballen sitzen
  //      deshalb mit ihrer UNTERKANTE auf einer gemeinsamen Linie, nicht mit ihrer Mitte.
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
    // Der dritte Fehler war, die Bildgroesse VORHER festzulegen und die Ballen dann
    // hineinzumalen: Wer groesser war als das Bild, wurde am Rand abgeschnitten — und eine
    // abgeschnittene Wolke ist ein Rechteck. Erst die Form, dann das Bild darum herum.
    // Die Zahlen haengen zusammen und sind deshalb aneinander gerechnet, nicht einzeln gewaehlt:
    // Sieben Ballen auf 86 Prozent der Breite stehen 14,3 Prozent auseinander; der kleinste
    // Radius liegt mit 15 Prozent darueber, also beruehren sich alle sicher. Der groesste liegt
    // bei 22 Prozent, womit die Wolke rund dreimal so breit wird wie hoch — das Verhaeltnis
    // einer Haufenwolke.
    var n = 7;
    var ballen = [], i;
    for (i = 0; i < n; i++){
      var t = i / (n - 1);
      // Die Kuppe steigt zur Mitte hin an und ist dabei ungleichmaessig — der Zufall liegt auf
      // der HOEHE, nicht auf der Lage: Eine Wolke mit Luecken darin ist keine.
      var hoch = Math.sin(Math.PI * (0.12 + 0.76 * t));
      var r = breite * (0.15 + hoch * (0.04 + Math.random() * 0.03));
      // Alle Ballen sitzen mit ihrer UNTERKANTE auf derselben Linie. Das gibt der Wolke den
      // flachen Boden, den eine Haufenwolke hat — weich, weil die Ballen weich sind, und nicht
      // als Schnitt: Der erste Versuch hat das Bild unten abgeschnitten, und heraus kam ein
      // Balken mit einer rasiermesserglatten Kante quer ueber den Bildschirm.
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
        // Nur im oberen Drittel: Weiter unten stuenden sie hinter den Karten, wo sie niemand
        // sieht, und der Verlauf von oben nach unten waere dahin.
        // Nur im oberen Viertel und nie zwei auf derselben Hoehe: Uebereinander gelegt
        // verschmelzen sie zu einer Bank, und eine Bank hat keine Richtung.
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
        // Nur der obere Teil traegt Farbe. Ein Verlauf ueber die ganze Hoehe wuerde die Karten
        // unten mit einfaerben, und aus Himmel wuerde eine Tapete.
        //
        // Der Verlauf haelt seine volle Farbe bis 18 Prozent Hoehe, statt gleich abzufallen.
        // Grund: Die Kopfleiste deckt die oberen rund acht Prozent ab — genau den Teil, in dem
        // der Himmel am kraeftigsten ist. Im ersten Entwurf war deshalb auf der Seite selbst
        // kaum Blau zu sehen, obwohl das Bild fuer sich betrachtet stimmte. Was verdeckt ist,
        // zaehlt nicht.
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
    var leer = ohneDeckung(farbeStrahl);
    g.addColorStop(0, leer);
    g.addColorStop(0.5, farbeStrahl);
    g.addColorStop(1, leer);
    // Gemessen am Bild zurueckgenommen (war 0,5): Darueber legt der Strahl einen sichtbaren
    // warmen Stich ueber die ganze Seite, und aus Atmosphaere wird Farbe.
    // Runde 93 auf 0,17: derselbe Grund wie beim Faecher — der Grund darunter ist dunkler.
    ctx.globalAlpha = 0.17;
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
  // Runde 86 weiter abgeflacht (war 2,16): Aus einer Ecke faellt Licht schraeg ueber die
  // Flaeche, nicht senkrecht hinunter.
  // Runde 90, gemessen statt geschaetzt: Bei 2,52 (144 Grad) zeigt die Richtung (-0,81 / +0,58),
  // also ueberwiegend ZUR SEITE. Die Strahlen verliessen die Seite links, lange bevor sie unten
  // ankamen — man sah fast waagerechte Baender ueber dem oberen Rand, keinen Faecher aus der
  // Ecke. Bei 2,05 (117 Grad) zeigt sie (-0,46 / +0,89): ueberwiegend nach unten, leicht nach
  // links. Erst dadurch faellt das Licht ueber die ganze Seite und kommt sichtbar aus der Ecke.
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
        // Die Strahlen in der Mitte des Faechers sind kraeftiger als die an den Raendern —
        // so faellt das Buendel zu den Seiten hin aus, statt abgeschnitten zu wirken.
        // Runde 86 zurueckgenommen (war 0,44 + 0,40): Mit sechs statt drei Lagen summiert sich
        // dort, wo die Strahlen zusammenlaufen, deutlich mehr Licht als vorher. Ungeaendert waere
        // aus der Ecke ein warmer Schleier ueber dem oberen Drittel geworden.
        // Runde 88 halbiert (war 0,34 + 0,32). Der Fehler mit dem schwarzen Verlauf hatte die
        // Strahlen die ganze Zeit gedaempft; ohne ihn traf dieselbe Zahl viel haerter, und die
        // Seite badete in Gelb. Licht soll man bemerken, nicht ansehen.
        // Runde 93 erneut zurueckgenommen (war 0,15 + 0,16). Nicht, weil die Strahlen sich
        // geaendert haetten, sondern weil der Grund darunter es tat: Das Papier ist um ein
        // Zehntel dunkler geworden, und derselbe Wert Licht darauf ist mehr Unterschied. Wer
        // die Helligkeit einer Flaeche aendert, aendert damit alles, was darauf liegt.
        a: (0.10 + 0.11 * Math.random()) * (1 - Math.abs(mitte) * 0.80),
        ph: Math.random() * Math.PI * 2,
        pv: 0.00035 + Math.random() * 0.00075,
        // Runde 90: "zu wenig dynamik ... und zu lang". Beides hatte dieselbe Ursache — alle
        // sieben Strahlen waren gleich lang und reichten weit ueber den Bildrand hinaus. Was
        // dabei fehlt, ist das, was einen Lichtstrahl lebendig macht: dass er IRGENDWO endet.
        // Jeder hat jetzt seine eigene Laenge, und sie schwankt zusaetzlich langsam.
        laenge: 0.42 + Math.random() * 0.44,
        lph: Math.random() * Math.PI * 2,
        lpv: 0.00055 + Math.random() * 0.0011
      });
    }
  }
  // Innen kraeftig, aussen weich: die drei Lagen je Strahl.
  // Runde 86: Drei Lagen waren zu wenig — im vergroesserten Bild sah man die Kanten der
  // einzelnen Keile als Baender. Sechs Lagen, deren Breite waechst waehrend die Deckkraft faellt,
  // summieren sich zu einem glockenfoermigen Querschnitt: aussen laeuft der Strahl aus, statt
  // aufzuhoeren. Mehr Lagen kosten hier nichts, weil die Verlaeufe zwischengespeichert sind.
  var LAGEN = [{w:1.0, a:1.00}, {w:1.6, a:0.62}, {w:2.4, a:0.40},
               {w:3.4, a:0.22}, {w:4.6, a:0.11}, {w:6.0, a:0.05}];
  function sonneAufbauen(){
    sonneVerlauf.length = 0;
    var L = (b + h) * 1.25;
    for (var i = 0; i < LAGEN.length; i++){
      var g = ctx.createLinearGradient(0, 0, L, 0);
      // Nicht bei 0 voll: Direkt an der Quelle wuerden sich alle sieben Strahlen zu einem
      // Fleck ueberlagern. Das Maximum liegt im ersten Drittel, dort, wo ein Strahl auch in
      // echt am deutlichsten ist.
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
    // Die Sonne selbst liegt ausserhalb des Bildes. Sichtbar ist nur, was von ihr kommt —
    // eine Scheibe im Bild waere eine Illustration, kein Hintergrund.
    // Runde 86: Die Sonne stand zu weit in der Flaeche, dadurch faechterte das Licht von der
    // Mitte des oberen Randes her auf statt aus der Ecke. Jetzt liegt sie rechts NEBEN dem Bild
    // und nur knapp darueber — der Faecher kommt sichtbar aus der rechten oberen Ecke, und die
    // Strahlen laufen flacher ueber die Seite.
    // Runde 88 weiter in die Ecke (war 1,06 der Breite und ein Achtel der Hoehe darueber):
    // Bei der alten Lage lag der Punkt, aus dem die Strahlen kommen, oben am RAND und nicht in
    // der Ecke — man sah einen Faecher von oben, nicht Licht aus der Ecke. Jetzt liegt sie
    // knapp ausserhalb der rechten oberen Ecke; der Faecher zeigt sichtbar dorthin zurueck.
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
      // Die Laenge atmet mit. Skaliert statt neu gerechnet, damit der zwischengespeicherte
      // Verlauf mitwaechst — ein kuerzerer Strahl waere sonst nicht kuerzer, sondern
      // abgeschnitten, und ein abgeschnittener Strahl ist eine Kante.
      var lang = f.laenge * (wenigerBewegung ? 1 : (1 + Math.sin(f.lph) * 0.16));
      ctx.save();
      ctx.rotate(winkel);
      ctx.scale(lang, lang);
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
  // Wie stark ein Korn beleuchtet wird — Runde 86 vom Streifen auf den FAECHER umgestellt.
  //
  // Vorher hing es allein an der waagerechten Entfernung zur Mitte des weichen Streifens. Der
  // Streifen wandert aber unabhaengig vom Faecher, und im vergroesserten Bild stand das Ergebnis
  // deutlich da: Die hellen Koerner lagen dort, wo gar kein Strahl war. Zwei Lichtquellen, die
  // sich widersprechen — genau der Fehler, den die Strahlen selbst vermeiden sollten.
  //
  // Jetzt zaehlt, was tatsaechlich zaehlt: der WINKEL vom Sonnenort zum Korn. Liegt er in einem
  // der Strahlen, ist das Korn hell, sonst nicht. Damit steht Staub genau dann im Licht, wenn
  // dort Licht ist.
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
      // Ein Korn hinter dem Ende des Strahls steht nicht mehr im Licht. Ohne diese Zeile
      // leuchteten Koerner dort, wo gar kein Strahl mehr ist — derselbe Widerspruch zweier
      // Lichtquellen wie in Runde 86, nur eine Ebene tiefer.
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
      // Im Strahl bis zu zweieinhalbmal so hell. Das ist der ganze Trick: Staub ist ueberall,
      // sichtbar wird er nur dort, wo Licht auf ihn faellt.
      // Das Flackern OHNE Strahlverstaerkung: Beim Staub tragen die zwei Lagen unten die
      // Helligkeit, sonst zaehlte der Strahl doppelt.
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
        // Ein Korn ausserhalb der Schaerfe: innen etwas dichter, nach aussen restlos verlaufend.
        // Kein arc() mit voller Deckkraft mehr — der harte Rand war der Grund, warum es wie ein
        // Punkt aussah und nicht wie Schwebeteilchen.
        //
        // Zwei Lagen, und darin steckt der Unterschied zwischen Staub und Schmutz: unten das
        // Korn im Schatten, ein Hauch dunkler als der Grund, oben dasselbe Korn im Licht, heller
        // als der Grund — und wie stark, entscheidet allein die Naehe zum Strahl. Ein Korn, das
        // ueberall gleich aussieht, ist ein Fleck auf dem Bildschirm.
        // EINE Lage, nicht zwei. Der erste Versuch legte ein helles Korn auf ein dunkles —
        // und weil beide gleich gross waren, blieb vom dunklen ein Ring stehen: aus Staub
        // wurden Seifenblasen. Es wandert deshalb die FARBE mit dem Licht, nicht die Deckung:
        // im Schatten ein Hauch dunkler als der Grund, im Strahl heller. Dazwischen wird
        // gemischt, in acht Stufen, damit die Farbtexte nicht je Korn und Bild neu entstehen.
        var licht = imStrahl(s.x, s.y);
        staubKorn(s, staubFarbe(licht), s.a * (0.85 + 2.6 * licht) * funkelnRoh);
      } else {
        ctx.globalAlpha = s.a * funkeln;
        ctx.fillStyle = ton;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
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
      for (i = 0; i < faecher.length; i++){ faecher[i].ph += faecher[i].pv; faecher[i].lph += faecher[i].lpv; }
      wolkenBewegen();
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
      // Vor dem ersten Bild die Farben lesen, nicht erst nach 60 Bildern: Sonst zeigt das erste
      // gezeichnete Bild nach der Rueckkehr die Atmosphaere des vorigen Farbmodus.
      farbenLesen();
      if (wenigerBewegung){ zeichnen(); }
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

  // Runde 86, im Bild gefunden: Beim Wechsel von hell auf dunkel lagen bis zu zwei Sekunden
  // lang grelle Sonnenstrahlen ueber dem Nachthimmel. Der Grund war die Taktung — die Farben
  // wurden nur alle 60 Bilder gelesen, und solange die Startseite nicht sichtbar war, lief gar
  // kein Bild. Die Flaeche behielt also den zuletzt gemalten Zustand und zeigte ihn beim
  // Zurueckkommen weiter, in den Farben des anderen Modus.
  //
  // Die Taktung bleibt (sie kostet nichts), aber sie ist nicht mehr die einzige Quelle: Ein
  // Wechsel des Farbmodus meldet sich jetzt selbst. Zwei Wege, weil es zwei Arten gibt, ihn
  // auszuloesen — die Wahl in den Einstellungen setzt data-theme, die Systemeinstellung nicht.
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

  farbenLesen();
  aufbauen();
  pruefen();
  // Der Ansichtswechsel loest kein Ereignis aus; ein Blick pro Sekunde genuegt und kostet nichts.
  setInterval(pruefen, 1000);
})();

  var fails=0, checks=0;
  function ok(c,m){ checks++; if(!c){ fails++; console.log("  FAIL: "+m); } }
  scores = {O:72,C:58,E:64,A:41,S:55};

  function record(){
    var ops = [];
    var st = {tx:0, ty:0};
    var ctx = {
      fillStyle:'', strokeStyle:'', lineWidth:1, font:'', textAlign:'left', textBaseline:'alphabetic',
      globalAlpha:1, lineJoin:'', lineCap:'',
      translate:function(x,y){ st.tx+=x; st.ty+=y; },
      save:function(){}, restore:function(){}, setLineDash:function(){},
      beginPath:function(){}, closePath:function(){}, moveTo:function(x,y){ ops.push(['pt',x+st.tx,y+st.ty]); },
      lineTo:function(x,y){ ops.push(['pt',x+st.tx,y+st.ty]); },
      arc:function(x,y,r){ ops.push(['pt',x+st.tx-r,y+st.ty-r]); ops.push(['pt',x+st.tx+r,y+st.ty+r]); },
      fill:function(){ ops.push(['farbe', ctx.fillStyle]); }, stroke:function(){ ops.push(['farbe', ctx.strokeStyle]); },
      fillRect:function(x,y,w,h){ ops.push(['pt',x+st.tx,y+st.ty]); ops.push(['pt',x+w+st.tx,y+h+st.ty]); ops.push(['farbe', ctx.fillStyle]); },
      strokeRect:function(){},
      fillText:function(t,x,y){ ops.push(['text',x+st.tx,y+st.ty,t]); ops.push(['farbe', ctx.fillStyle]); },
      measureText:function(t){ return {width: String(t).length*17}; }
    };
    var canvas = {width:0, height:0, getContext:function(){ return ctx; }, toDataURL:function(){ return 'data:,'; }};
    var origCreate = document.createElement;
    document.createElement = function(tag){ return tag==='canvas' ? canvas : origCreate.call(document, tag); };
    var c = buildShareCanvas();
    document.createElement = origCreate;
    return {canvas:c, ops:ops};
  }

  // Runde 109: Hier standen drei Abschnitte zum Story-Format (1080x1920) — seine Groesse, der
  // Nachweis, dass es exakt dieselbe Komposition um 285px nach unten versetzt ist, und die
  // Sicherheitszonen der Plattformen. Auf ausdrueckliche Ansage des Inhabers gibt es nur noch
  // EIN Format; warum 4:5, steht bei SHARE_FORMAT in src/js/10-ergebnisbild.js.
  //
  // Die Pruefung ist deshalb nicht kleiner geworden, sondern schaerfer: Was vorher eine Aussage
  // ueber das Verhaeltnis ZWEIER Formate war, ist jetzt eine Aussage ueber das eine — und die
  // Masse stehen hier als Zahlen. Das ist Absicht. Eine Formatentscheidung, die nur in einer
  // Marke im Quelltext steht, laesst sich versehentlich zurueckdrehen, ohne dass etwas meckert;
  // eine, die in einer Testreihe steht, nicht.
  var SOLL_W = 1080, SOLL_H = 1350;

  console.log("\n=== Das eine Format (" + SOLL_W + "x" + SOLL_H + ", 4:5) ===");
  var feed = record();
  ok(feed.canvas.width===SOLL_W && feed.canvas.height===SOLL_H,
     "Das Bild muss "+SOLL_W+"x"+SOLL_H+" sein, ist "+feed.canvas.width+"x"+feed.canvas.height);
  var feedTexts = feed.ops.filter(function(o){ return o[0]==='text'; });
  console.log("  Textelemente: "+feedTexts.length);
  console.log("  erste Textzeile bei y="+feedTexts[0][2]+" ('"+feedTexts[0][3]+"')");
  console.log("  letzte Textzeile bei y="+feedTexts[feedTexts.length-1][2]+" ('"+feedTexts[feedTexts.length-1][3]+"')");

  // Die Komposition ist jetzt genau so hoch wie das Bild, also darf sie NICHT mehr verschoben
  // werden. Die frueher noetige Zentrierung ist entfallen; diese Pruefung haelt fest, dass sie
  // nicht als wirkungslose Rechnung zurueckkommt — bei gleicher Hoehe waere sie 0 und damit
  // unsichtbar falsch.
  ok(st_ohne_versatz(feed), "die Komposition sitzt ohne vertikalen Versatz im Bild");
  function st_ohne_versatz(r){
    // Der Markenpunkt oben links ist das erste gezeichnete Element der Komposition und liegt
    // im Entwurf bei y = M-4-9 = 71. Steckte noch eine Zentrierung darin, waere er verschoben.
    var erste = r.ops.filter(function(o){ return o[0]==='pt'; })[2];
    return erste && Math.round(erste[2]) === 71;
  }

  console.log("\n=== Nichts laeuft aus dem Bild heraus ===");
  (function(){
    var W = SOLL_W, H = SOLL_H, r = feed;
    var minY=1e9, maxY=-1e9, minX=1e9, maxX=-1e9;
    r.ops.forEach(function(o){
      var x=o[1], y=o[2];
      // fillRect des Hintergrunds ausklammern (deckt bewusst das ganze Bild)
      if (o[0]==='pt' && (y<=0 || y>=H-0.5) && (x<=0 || x>=W-0.5)) return;
      if (x<minX) minX=x; if (x>maxX) maxX=x;
      if (y<minY) minY=y; if (y>maxY) maxY=y;
    });
    console.log("  Inhalt liegt zwischen y="+Math.round(minY)+" und y="+Math.round(maxY)+" (Bildhoehe "+H+")");
    ok(minY>=0, "Inhalt beginnt oberhalb des Bildrands (y="+minY+")");
    ok(maxY<=H, "Inhalt endet unterhalb des Bildrands (y="+maxY+")");
    ok(minX>=0 && maxX<=W, "Inhalt bleibt horizontal im Bild ("+Math.round(minX)+".."+Math.round(maxX)+")");
  })();


  // ---------------------------------------------------------------------------------------
  // Runde 92, gemeldet: "wenn man ergebnis teilen drueckt kommt immer die hellversion der app
  // als bild". Die Karte war absichtlich fest hell — als Begruendung stand dort, sie solle
  // ueberall gleich aussehen. Diese Reihe haelt jetzt fest, dass sie dem Modus folgt, UND dass
  // die Pruefung selbst etwas sieht: Bis Runde 91 fehlte dem Ersatz-Wurzelelement getAttribute,
  // dunkelAktiv() verschluckte die Ausnahme und antwortete stumm "hell". Eine Pruefung, die nur
  // die Hellfassung zu Gesicht bekommt, kann die Dunkelfassung nicht bestaetigen.
  console.log("\n=== Das Bild folgt dem Farbmodus ===");
  function farbenVon(modus){
    document.documentElement.setAttribute('data-theme', modus);
    var r = record();
    document.documentElement.removeAttribute('data-theme');
    var set = {};
    r.ops.forEach(function(o){ if (o[0]==='farbe' && o[1]) set[String(o[1]).toLowerCase()] = 1; });
    return set;
  }
  var hell = farbenVon('light'), dunkel = farbenVon('dark');
  ok(!!hell['#e4e6db'], "hell: der Grund ist das Papier der Hellfassung (#E4E6DB)");
  ok(!!hell['#0d1511'], "hell: die Schrift ist die Tinte der Hellfassung (#0D1511)");
  ok(!!dunkel['#0f1613'], "dunkel: der Grund ist das Papier der Dunkelfassung (#0F1613)");
  ok(!!dunkel['#eceee7'], "dunkel: die Schrift ist die Tinte der Dunkelfassung (#ECEEE7)");
  ok(!dunkel['#e4e6db'] && !dunkel['#0d1511'],
     "dunkel: keine einzige Farbe der Hellfassung bleibt im Bild stehen");
  ok(!hell['#0f1613'] && !hell['#eceee7'],
     "hell: keine einzige Farbe der Dunkelfassung bleibt im Bild stehen");
  var gemeinsam = Object.keys(hell).filter(function(f){ return dunkel[f]; });
  ok(gemeinsam.length === 0,
     "die beiden Fassungen teilen sich keine Farbe (gemeinsam: "+gemeinsam.join(', ')+")");
  console.log("  hell: "+Object.keys(hell).join(', '));
  console.log("  dunkel: "+Object.keys(dunkel).join(', '));

  console.log("\n=== Die Nachbildung sieht den Modus wirklich ===");
  // Ohne diese Pruefung waere die Reihe darueber wertlos: Antwortet dunkelAktiv() immer "hell",
  // sind beide Durchgaenge identisch und "keine Farbe der Dunkelfassung" waere trivial erfuellt.
  document.documentElement.setAttribute('data-theme', 'dark');
  ok(dunkelAktiv() === true, "bei data-theme=\"dark\" meldet dunkelAktiv() true");
  document.documentElement.setAttribute('data-theme', 'light');
  ok(dunkelAktiv() === false, "bei data-theme=\"light\" meldet dunkelAktiv() false");
  document.documentElement.removeAttribute('data-theme');
  ok(dunkelAktiv() === true, "ohne eigene Wahl entscheidet die Systemvorgabe (hier: dunkel)");

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

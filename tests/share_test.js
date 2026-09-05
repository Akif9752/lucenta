  var fails=0, checks=0;
  function ok(c,m){ checks++; if(!c){ fails++; console.log("  FAIL: "+m); } }
  scores = {O:72,C:58,E:64,A:41,S:55};

  function record(format){
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
      fill:function(){}, stroke:function(){},
      fillRect:function(x,y,w,h){ ops.push(['pt',x+st.tx,y+st.ty]); ops.push(['pt',x+w+st.tx,y+h+st.ty]); },
      strokeRect:function(){},
      fillText:function(t,x,y){ ops.push(['text',x+st.tx,y+st.ty,t]); },
      measureText:function(t){ return {width: String(t).length*17}; }
    };
    var canvas = {width:0, height:0, getContext:function(){ return ctx; }, toDataURL:function(){ return 'data:,'; }};
    var origCreate = document.createElement;
    document.createElement = function(tag){ return tag==='canvas' ? canvas : origCreate.call(document, tag); };
    var c = buildShareCanvas(format);
    document.createElement = origCreate;
    return {canvas:c, ops:ops};
  }

  console.log("\n=== Feed-Format (unveraendert 1080x1350) ===");
  var feed = record('feed');
  ok(feed.canvas.width===1080 && feed.canvas.height===1350, "Feed muss 1080x1350 sein, ist "+feed.canvas.width+"x"+feed.canvas.height);
  var feedTexts = feed.ops.filter(function(o){ return o[0]==='text'; });
  console.log("  Textelemente: "+feedTexts.length);
  console.log("  erste Textzeile bei y="+feedTexts[0][2]+" ('"+feedTexts[0][3]+"')");
  console.log("  letzte Textzeile bei y="+feedTexts[feedTexts.length-1][2]+" ('"+feedTexts[feedTexts.length-1][3]+"')");

  console.log("\n=== Story-Format (1080x1920) ===");
  var story = record('story');
  ok(story.canvas.width===1080 && story.canvas.height===1920, "Story muss 1080x1920 sein, ist "+story.canvas.width+"x"+story.canvas.height);
  var storyTexts = story.ops.filter(function(o){ return o[0]==='text'; });
  ok(storyTexts.length===feedTexts.length, "beide Formate muessen dieselben Inhalte zeigen ("+feedTexts.length+" vs "+storyTexts.length+")");

  var OFF = 285;
  var shiftOK = true;
  for (var i=0;i<feedTexts.length;i++){
    if (feedTexts[i][3] !== storyTexts[i][3]) { shiftOK=false; console.log("  FAIL Text "+i+": '"+feedTexts[i][3]+"' vs '"+storyTexts[i][3]+"'"); break; }
    if (Math.round(storyTexts[i][2]-feedTexts[i][2]) !== OFF) { shiftOK=false; console.log("  FAIL Versatz bei Text "+i+": "+(storyTexts[i][2]-feedTexts[i][2])); break; }
    if (storyTexts[i][1] !== feedTexts[i][1]) { shiftOK=false; console.log("  FAIL x-Versatz bei Text "+i); break; }
  }
  ok(shiftOK, "Story ist exakt dieselbe Komposition, nur um "+OFF+"px nach unten zentriert");
  console.log("  vertikaler Versatz: "+OFF+"px");

  console.log("\n=== Nichts laeuft aus dem Bild heraus ===");
  [['Feed',feed,1080,1350],['Story',story,1080,1920]].forEach(function(pair){
    var name=pair[0], r=pair[1], W=pair[2], H=pair[3];
    var minY=1e9, maxY=-1e9, minX=1e9, maxX=-1e9;
    r.ops.forEach(function(o){
      var x=o[1], y=o[2];
      // fillRect des Hintergrunds ausklammern (deckt bewusst das ganze Bild)
      if (o[0]==='pt' && (y<=0 || y>=H-0.5) && (x<=0 || x>=W-0.5)) return;
      if (x<minX) minX=x; if (x>maxX) maxX=x;
      if (y<minY) minY=y; if (y>maxY) maxY=y;
    });
    console.log("  "+name+": Inhalt liegt zwischen y="+Math.round(minY)+" und y="+Math.round(maxY)+" (Bildhoehe "+H+")");
    ok(minY>=0, name+": Inhalt beginnt oberhalb des Bildrands (y="+minY+")");
    ok(maxY<=H, name+": Inhalt endet unterhalb des Bildrands (y="+maxY+")");
    ok(minX>=0 && maxX<=W, name+": Inhalt bleibt horizontal im Bild ("+Math.round(minX)+".."+Math.round(maxX)+")");
  });

  console.log("\n=== Story-Sicherheitszonen der Plattformen ===");
  var sMinY=1e9, sMaxY=-1e9;
  story.ops.forEach(function(o){ var x=o[1],y=o[2]; if (o[0]==='pt' && (y<=0||y>=1919.5) && (x<=0||x>=1079.5)) return; if(y<sMinY)sMinY=y; if(y>sMaxY)sMaxY=y; });
  ok(sMinY>=200, "oben bleiben mindestens 200px frei fuer die Bedienelemente der Plattform (frei: "+Math.round(sMinY)+")");
  ok(sMaxY<=1670, "unten bleiben mindestens 250px frei (Inhalt endet bei "+Math.round(sMaxY)+")");
  console.log("  frei oben: "+Math.round(sMinY)+"px, frei unten: "+Math.round(1920-sMaxY)+"px");

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

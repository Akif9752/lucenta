// ---------- Ergebnisbild (Canvas-Karte zum Teilen/Speichern) ----------
  // Feste, vom aktuellen Hell-/Dunkelmodus unabhängige Markenfarben — eine geteilte Bildkarte
  // soll immer gleich aussehen, unabhängig vom Farbmodus des Geräts, auf dem sie geöffnet wird.
  var SHARE_COLORS = { paper:'#F5F6EF', ink:'#15201A', muted:'#57655C', line:'#DBDCCE', accent:'#2F6F6A', accentFill:'rgba(47,111,106,.26)', accent2:'#C97A3C' };

  function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight){
    var words = text.split(' ');
    var line = '', curY = y;
    for (var i=0;i<words.length;i++){
      var test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && line !== ''){
        ctx.fillText(line.trim(), x, curY);
        line = words[i] + ' ';
        curY += lineHeight;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), x, curY);
    return curY;
  }

  function drawShareRadar(ctx, sc, cx, cy, r){
    var C = SHARE_COLORS;
    [0.25,0.5,0.75,1].forEach(function(frac){
      ctx.beginPath();
      ORDER.forEach(function(f,i){
        var ang = -Math.PI/2 + i*(2*Math.PI/5);
        var x = cx + r*frac*Math.cos(ang), y = cy + r*frac*Math.sin(ang);
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ORDER.forEach(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx+r*Math.cos(ang), cy+r*Math.sin(ang));
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    });
    ctx.beginPath();
    ORDER.forEach(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var v = Math.max(4,sc[f])/100*r;
      var x = cx+v*Math.cos(ang), y = cy+v*Math.sin(ang);
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.fillStyle = C.accentFill; ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    var labelR = r*1.34;
    ORDER.forEach(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var lx = cx + labelR*Math.cos(ang), ly = cy + labelR*Math.sin(ang);
      ctx.textAlign = Math.abs(Math.cos(ang))<0.2 ? 'center' : (Math.cos(ang)>0 ? 'left':'right');
      ctx.fillStyle = C.muted; ctx.font = '600 21px "IBM Plex Mono", monospace';
      ctx.fillText(RADAR_LABELS[f], lx, ly-6);
      ctx.fillStyle = C.ink; ctx.font = '700 32px Georgia, serif';
      ctx.fillText(String(sc[f]), lx, ly+30);
    });
    ctx.textAlign = 'left';
  }

  // Backlog Runde 27, Punkt 1: Das Ergebnisbild gab es nur im Feed-Format 1080×1350 (4:5). Der
  // eigene Wachstumsplan setzt aber auf TikTok/Reels und Stories — durchgehend 9:16. Ein 4:5-Bild
  // dort einzusetzen heißt Balken oder Beschnitt, ausgerechnet beim Baustein, der den viralen
  // Kreislauf tragen soll.
  //
  // Umgesetzt bewusst NICHT als zweites, eigenes Layout: die 1080×1350-Komposition ist über
  // mehrere Runden austariert (Zeilenumbrüche des Titels, Radar-Radius, zweispaltige Werteliste),
  // ein paralleles Story-Layout würde bei jeder künftigen Änderung auseinanderlaufen. Stattdessen
  // bleibt die Komposition unverändert bei 1350 Höhe und wird im 1920er Bild vertikal zentriert
  // eingesetzt — der freie Raum oben und unten liegt damit genau dort, wo Instagram und TikTok
  // ihre eigenen Bedienelemente über das Bild legen.
  var SHARE_LAYOUT_H = 1350;
  var SHARE_FORMATS = { feed: {w:1080, h:1350}, story: {w:1080, h:1920} };
  function buildShareCanvas(format){
    var fmt = SHARE_FORMATS[format] || SHARE_FORMATS.feed;
    var C = SHARE_COLORS, W = fmt.w, H = SHARE_LAYOUT_H, M = 84;
    var canvas = document.createElement('canvas');
    canvas.width = fmt.w; canvas.height = fmt.h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = C.paper; ctx.fillRect(0,0,fmt.w,fmt.h);
    ctx.translate(0, Math.round((fmt.h - SHARE_LAYOUT_H)/2));
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

    ctx.fillStyle = C.accent2;
    ctx.beginPath(); ctx.arc(M+8, M-4, 9, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = '700 46px Georgia, serif';
    ctx.fillText('Lucenta', M+30, M+8);
    ctx.fillStyle = C.muted; ctx.font = '600 21px "IBM Plex Mono", monospace';
    ctx.fillText('ERGEBNISKARTE', M+2, M+50);

    var arch = archetypeOf(scores);
    var pole1 = scores[arch.top1]>=50?'high':'low', pole2 = scores[arch.top2]>=50?'high':'low';
    var titleText = NOUN[arch.top1][pole1] + ' · ' + ADJ[arch.top2][pole2];
    ctx.fillStyle = C.ink; ctx.font = '600 60px Georgia, serif';
    var afterTitleY = wrapCanvasText(ctx, titleText, M, M+188, W-2*M, 68);
    ctx.fillStyle = C.accent2; ctx.font = 'italic 500 30px Georgia, serif';
    ctx.fillText(MOTTO[arch.top1][pole1], M, afterTitleY + 52);

    drawShareRadar(ctx, scores, W/2, 700, 220);

    var sortedTraits = ORDER.slice().sort(function(a,b){ return scores[b]-scores[a]; });
    var listTop = 1030, colGap = 28, colW = (W - 2*M - colGap)/2;
    sortedTraits.forEach(function(f,i){
      var col = i % 2, row = Math.floor(i/2);
      var x = M + col*(colW+colGap), y = listTop + row*62;
      ctx.textAlign = 'left'; ctx.fillStyle = C.muted; ctx.font = '500 23px "Work Sans", sans-serif';
      ctx.fillText(LABELS[f], x, y);
      ctx.textAlign = 'right'; ctx.fillStyle = C.accent; ctx.font = '700 25px "IBM Plex Mono", monospace';
      ctx.fillText(String(scores[f]), x+colW, y);
    });
    ctx.textAlign = 'left';

    ctx.fillStyle = C.muted; ctx.font = '500 20px "IBM Plex Mono", monospace';
    ctx.fillText('Big-Five-Modell (IPIP) · lucenta', M, H-M+8);

    return canvas;
  }

  
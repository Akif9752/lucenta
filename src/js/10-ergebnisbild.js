// ---------- Ergebnisbild (Canvas-Karte zum Teilen) ----------
// Das Bild folgt dem Farbmodus der App. Die Farben stehen fest verdrahtet (auf einer Leinwand gibt es
// keine Deckungswerte gegen einen Hintergrund) und muessen bei jeder Aenderung der Palette in
// 00-grundlagen.css nachgefuehrt werden — die Testreihe "Das Bild folgt dem Farbmodus" haelt beide
// zusammen.
  var SHARE_COLORS = { paper:'#E6E5E0', ink:'#000000', muted:'#5A5A5D', line:'#BFBEB8', accent:'#285F5B', accentFill:'rgba(40,95,91,.26)', accent2:'#BF7438' };
  var SHARE_COLORS_DARK = { paper:'#000000', ink:'#FFFFFF', muted:'#98989F', line:'#38383A', accent:'#5CB4AD', accentFill:'rgba(92,180,173,.26)', accent2:'#E39A5C' };
  function shareColors(){ return dunkelAktiv() ? SHARE_COLORS_DARK : SHARE_COLORS; }

  // Fraunces ist variabel (400–600): 600 statt 700, sonst rechnet der Browser eine falsche Fette nach.
  // Fraunces traegt nur Latin, daher dieselbe Rueckfallkette wie --serif (Japanisch).
  var SHARE_SERIF = "Fraunces, ui-serif, Georgia, 'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif";
  // Systemschrift wie --sans, damit Japanisch in Hiragino Sans landet.
  var SHARE_SANS = "-apple-system, system-ui, 'Hiragino Sans', 'Yu Gothic', 'Noto Sans JP', sans-serif";

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
    var C = shareColors();
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
      ctx.fillStyle = C.muted; ctx.font = '600 21px '+SHARE_SANS;
      ctx.fillText(RADAR_LABELS[f], lx, ly-6);
      ctx.fillStyle = C.ink; ctx.font = '600 32px '+SHARE_SERIF;
      ctx.fillText(String(sc[f]), lx, ly+30);
    });
    ctx.textAlign = 'left';
  }

  // EIN Teilformat, 4:5 (1080x1350; Entscheidung des Inhabers): sieht auch in Stories absichtsvoll
  // aus, 9:16 in Nachrichten dagegen nach Fehler. SHARE_LAYOUT_H bleibt eine eigene Marke, weil die
  // Komposition damit rechnet.
  var SHARE_LAYOUT_H = 1350;
  var SHARE_FORMAT = { w:1080, h:1350 };
  function buildShareCanvas(){
    var C = shareColors(), W = SHARE_FORMAT.w, H = SHARE_LAYOUT_H, M = 84;
    var canvas = document.createElement('canvas');
    canvas.width = SHARE_FORMAT.w; canvas.height = SHARE_FORMAT.h;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = C.paper; ctx.fillRect(0,0,SHARE_FORMAT.w,SHARE_FORMAT.h);
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';

    ctx.fillStyle = C.accent2;
    ctx.beginPath(); ctx.arc(M+8, M-4, 9, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = '600 46px '+SHARE_SERIF;
    ctx.fillText('Lucenta', M+30, M+8);
    ctx.fillStyle = C.muted; ctx.font = '600 21px '+SHARE_SANS;
    // Canvas-Text steht in keinem DOM — keine Pruefung sieht ihn.
    ctx.fillText(decodeEntities(tx('js_ergebniskarte')), M+2, M+50);

    var arch = archetypeOf(scores);
    var pole1 = scores[arch.top1]>=50?'high':'low', pole2 = scores[arch.top2]>=50?'high':'low';
    var titleText = NOUN[arch.top1][pole1] + ' · ' + ADJ[arch.top2][pole2];
    ctx.fillStyle = C.ink; ctx.font = '600 60px '+SHARE_SERIF;
    var afterTitleY = wrapCanvasText(ctx, titleText, M, M+188, W-2*M, 68);
    ctx.fillStyle = C.accent2; ctx.font = 'italic 500 30px '+SHARE_SERIF;
    ctx.fillText(MOTTO[arch.top1][pole1], M, afterTitleY + 52);

    drawShareRadar(ctx, scores, W/2, 700, 220);

    var sortedTraits = ORDER.slice().sort(function(a,b){ return scores[b]-scores[a]; });
    var listTop = 1030, colGap = 28, colW = (W - 2*M - colGap)/2;
    sortedTraits.forEach(function(f,i){
      var col = i % 2, row = Math.floor(i/2);
      var x = M + col*(colW+colGap), y = listTop + row*62;
      ctx.textAlign = 'left'; ctx.fillStyle = C.muted; ctx.font = '500 23px '+SHARE_SANS;
      ctx.fillText(LABELS[f], x, y);
      ctx.textAlign = 'right'; ctx.fillStyle = C.accent; ctx.font = '700 25px '+SHARE_SANS;
      ctx.fillText(String(scores[f]), x+colW, y);
    });
    ctx.textAlign = 'left';

    ctx.fillStyle = C.muted; ctx.font = '500 20px '+SHARE_SANS;
    ctx.fillText(decodeEntities(tx('js_bildfuss')), M, H-M+8);

    return canvas;
  }

  
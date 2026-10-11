// ---------- Ergebnisbild (Canvas-Karte zum Teilen/Speichern) ----------
  // Runde 92, gemeldet: Das Bild kam immer in der Hellfassung heraus, auch mitten in der Nacht
  // aus einer durchgehend dunklen App. Bis Runde 91 stand hier als Begruendung, eine geteilte
  // Karte solle ueberall gleich aussehen. Das ist ein Argument fuer den Empfaenger und gegen die
  // Person, die teilt: Sie sieht in dem Moment ihre eigene App und bekommt ein Bild, das nicht
  // dazu gehoert. Der Empfaenger vergleicht ohnehin nicht zwei Karten nebeneinander.
  //
  // Beide Fassungen sind fest verdrahtet und nicht aus den CSS-Marken gelesen: Auf einer
  // Leinwand gibt es keine Transparenz gegen einen Hintergrund, den es dort nicht gibt, und die
  // Marken der App tragen an mehreren Stellen Deckungswerte. Die Werte hier sind dieselben wie
  // in 00-grundlagen.css — --paper, --ink, --muted, --line, --accent, --accent-2 — je Modus.
  // Runde 93 mitgezogen: Die Hellfassung der App ist um ein Zehntel dunkler geworden. Die
  // Werte hier stehen fest verdrahtet — genau deshalb muessen sie bei jeder Aenderung der
  // Palette von Hand nachgefuehrt werden, und genau das ist in Runde 90 einmal vergessen
  // worden. Die Reihe "Das Bild folgt dem Farbmodus" haelt beide Seiten jetzt zusammen.
  var SHARE_COLORS = { paper:'#F2F2F7', ink:'#000000', muted:'#636366', line:'#C6C6C8', accent:'#2C6863', accentFill:'rgba(44,104,99,.26)', accent2:'#BF7438' };
  var SHARE_COLORS_DARK = { paper:'#000000', ink:'#FFFFFF', muted:'#98989F', line:'#38383A', accent:'#5CB4AD', accentFill:'rgba(92,180,173,.26)', accent2:'#E39A5C' };
  function shareColors(){ return dunkelAktiv() ? SHARE_COLORS_DARK : SHARE_COLORS; }

  // Runde 107. Hier stand an vier Stellen 'Georgia, serif' — auf einem Bild, das weitergegeben
  // wird und damit das einzige ist, was Fremde von Lucenta sehen. Die Zahlen und die Fusszeile
  // liefen dabei richtig in "IBM Plex Mono" und "Work Sans"; nur die Ueberschriften, also
  // Wortmarke, Titel und Motto, kamen in einer Systemschrift heraus, die in der App nirgends
  // vorkommt. Eine geteilte Karte mit fremder Ueberschrift ist kein Geschmacksfehler, sondern
  // eine falsche Marke.
  //
  // Zwei Dinge daran, die man sonst neu lernt:
  //   1. Fraunces liegt als VARIABLE Schrift mit dem Band 400-600 in der Datei (00-schriften.css).
  //      Eine 700 anzufordern liefert keine fettere Schrift, sondern eine vom Browser
  //      nachgerechnete — deshalb steht hier 600, wo vorher 700 stand. Die Kursive gibt es nur
  //      in 500; das Motto hatte diesen Wert schon.
  //   2. Der Rueckfall endet nicht bei serif. Fraunces traegt nur Latin (unicode-range in
  //      00-schriften.css) — auf Japanisch greift sonst irgendeine Systemschrift statt der
  //      Mincho, die die App dort im Fliesstext benutzt. Die Kette ist dieselbe wie in --serif.
  var SHARE_SERIF = "Fraunces, ui-serif, Georgia, 'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif";

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
      ctx.fillStyle = C.muted; ctx.font = '600 21px "IBM Plex Mono", monospace';
      ctx.fillText(RADAR_LABELS[f], lx, ly-6);
      ctx.fillStyle = C.ink; ctx.font = '600 32px '+SHARE_SERIF;
      ctx.fillText(String(sc[f]), lx, ly+30);
    });
    ctx.textAlign = 'left';
  }

  // Runde 109, auf ausdrueckliche Ansage des Inhabers: "auf EIN Teilformat einigen."
  //
  // Bis hierher gab es zwei, mit Umschalter: Beitrag 1080x1350 (4:5) und Story 1080x1920 (9:16).
  // Beides war dieselbe Komposition — Runde 27 hat bewusst KEIN zweites Layout gebaut, sondern
  // die austarierte 1350er Komposition im 1920er Bild vertikal zentriert. Die Wahl war damit
  // eine Wahl zwischen "ohne Leerraum" und "mit 285px Leerraum oben und unten".
  //
  // **Geblieben ist 4:5**, und der Grund ist nicht Geschmack, sondern wie die beiden Formate
  // ausserhalb ihres Zielorts aussehen:
  //   - 4:5 in einer Story: Die Plattform stellt es mittig auf einen eigenen Grund. Sieht
  //     absichtsvoll aus.
  //   - 9:16 in Nachrichten, WhatsApp oder der Foto-Mediathek: ein hohes Bild mit zwei leeren
  //     Baendern. Sieht nach Fehler aus.
  // Die Ziele der zweiten Art sind die haeufigeren — die Teilen-Leiste von iOS fuehrt zuerst
  // dorthin. Ein Format, das ueberall ordentlich aussieht, ist mehr wert als eines, das an einer
  // Stelle exakt passt und an den uebrigen auffaellt.
  //
  // SHARE_LAYOUT_H ist damit dieselbe Zahl wie die Bildhoehe. Es bleibt eine eigene Marke, weil
  // die Komposition unten mit ihr rechnet; sie zu ersetzen hiesse, 1350 an ein Dutzend Stellen
  // zu verteilen. Die vertikale Zentrierung ist entfallen — sie waere jetzt immer 0 und damit
  // eine Rechnung, die aussieht, als taete sie etwas.
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
    ctx.fillStyle = C.muted; ctx.font = '600 21px "IBM Plex Mono", monospace';
    // Canvas-Text steht in keinem DOM: weder die zehn Reihen noch ein Vergleich der
    // gerenderten Ansichten koennen ihn sehen. Runde 59 hat ihn deshalb nur beim Lesen des
    // Codes gefunden — das Ergebnisbild ist ausgerechnet das, was Leute weitergeben.
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
      ctx.textAlign = 'left'; ctx.fillStyle = C.muted; ctx.font = '500 23px -apple-system, system-ui, sans-serif';
      ctx.fillText(LABELS[f], x, y);
      ctx.textAlign = 'right'; ctx.fillStyle = C.accent; ctx.font = '700 25px "IBM Plex Mono", monospace';
      ctx.fillText(String(scores[f]), x+colW, y);
    });
    ctx.textAlign = 'left';

    ctx.fillStyle = C.muted; ctx.font = '500 20px "IBM Plex Mono", monospace';
    ctx.fillText(decodeEntities(tx('js_bildfuss')), M, H-M+8);

    return canvas;
  }

  
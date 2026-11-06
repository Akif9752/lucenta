// ---------- radar ----------
  function polyPoints(sc, c, r){
    return ORDER.map(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var v = Math.max(4,sc[f])/100 * r;
      return [c + v*Math.cos(ang), c + v*Math.sin(ang)];
    });
  }

  // Als benannte Funktion, damit setLang() das Beispiel-Radar neu zeichnen kann.
  function renderPreviewRadar(){
    var el = $('previewRadar');
    if (el) el.innerHTML = radarSVG({O:78,E:65,C:45,A:58,S:50}, 160, null, true);
  }

  // Mit Ergebnis zeigt die Startseite zuerst, was der Person gehoert (Tagesform, eigenes Portraet);
  // die Einfuehrung rutscht nach unten. Ohne Ergebnis bleibt die Reihenfolge.
  function ordneStartseite(){
    var view = $('view-landing');
    if (!view) return;
    var hero = view.querySelector('.hero');
    var sub = view.querySelector('.hero .sub');
    var state = $('landingStateTeaser');
    var verstehen = $('landingUnderstandTeaser');
    var portrait = $('previewCard');
    if (!hero || !state || !verstehen || !portrait) return;
    var hatErgebnis = !!loadResult();

    // Die ausführliche Erklärung des Modells ist Text für den ersten Besuch.
    sub.style.display = hatErgebnis ? 'none' : '';

    var plusKarte = $('landingPlusKarte');
    var soll = hatErgebnis
      ? [hero, state, portrait, verstehen]
      : [hero, state, verstehen, portrait];
    // Runde 127: Die Lucenta+-Karte steht mit Ergebnis gleich nach der Tagesform — dort, wo jemand
    // gerade gesehen hat, was die App kann.
    if (plusKarte && hatErgebnis) soll.splice(2, 0, plusKarte);
    // Nur umhaengen, wenn die Reihenfolge abweicht — appendChild loeste sonst die Einblendungen neu
    // aus.
    var ist = [];
    for (var i=0;i<view.children.length;i++){
      if (soll.indexOf(view.children[i]) >= 0) ist.push(view.children[i]);
    }
    var gleich = ist.length === soll.length;
    for (var j=0; gleich && j<soll.length; j++){ if (ist[j] !== soll[j]) gleich = false; }
    if (gleich) return;
    soll.forEach(function(el){ view.appendChild(el); });
  }

  // Mit Ergebnis zeigt die Karte das eigene Portraet. Die Farbe der staerksten Dimension geht als
  // Eigenschaft an den Behaelter — immer nur EINE (fuenf gleichzeitig sind nicht sicher
  // unterscheidbar).
  var DIM_MARKE = {O:'--dim-o', C:'--dim-c', E:'--dim-e', A:'--dim-a', S:'--dim-s'};
  // Name einer Dimension fuer Netz und Kacheln: | trennt die Zeilen; einzeilig ohne Trennstrich.
  function radarName(f){ return String(RADAR_LABELS[f] || LABELS[f] || f).replace(/-\|/g, '').replace(/\|/g, ' '); }
  function radarZeilen(f){ return String(RADAR_LABELS[f] || LABELS[f] || f).split('|'); }
  // Als SVG-Text: jede Zeile ein tspan, die letzte steht auf y (darunter folgt der Wert).
  function radarLabelSVG(f, x, y, anker, klasse){
    var z = radarZeilen(f), h = 11;
    return '<text x="'+x+'" y="'+(y - (z.length - 1) * h).toFixed(1)+'" text-anchor="'+anker+'" class="'+klasse+'">'+
      z.map(function(t, i){ return '<tspan x="'+x+'"'+(i ? ' dy="'+h+'"' : '')+'>'+escapeHTML(t)+'</tspan>'; }).join('')+'</text>';
  }
  function setzeDimensionsfarbe(el, sc){
    if (!el || !sc) return;
    try{
      var a = archetypeOf(sc);
      var marke = DIM_MARKE[a.top1];
      // --dim-aktiv fuer Linien/Flaechen, --dim-aktiv-text fuer Schrift (als Text reicht die
      // Datenfarbe hell nicht fuer 4,5:1).
      if (marke){
        el.style.setProperty('--dim-aktiv', 'var(' + marke + ')');
        el.style.setProperty('--dim-aktiv-text', 'var(' + marke + '-text)');
      }
    }catch(e){}
  }

  function renderPreviewCard(){
    var karte = $('previewCard');
    if (!karte) return;
    var label = $('previewLabel'), titel = $('previewTitle'), text = $('previewBody');
    var res = loadResult();
    if (res){
      var a = archetypeOf(res);
      var pol1 = res[a.top1] >= 50 ? 'high' : 'low';
      var pol2 = res[a.top2] >= 50 ? 'high' : 'low';
      label.innerHTML = tx('js_dein_porträt');
      titel.innerHTML = titelNomen(a.top1, pol1, true) + ' <span class="sep">·</span> ' + titelAdj(a.top2, pol2, true);
      text.innerHTML = MOTTO[a.top1][pol1];
      $('previewRadar').innerHTML = radarSVG(res, 160);
      setzeDimensionsfarbe(karte, res);
      karte.classList.add('preview-eigen');
    } else {
      label.innerHTML = tx('so_sieht_dein_ergebnis_aus_b');
      titel.innerHTML = tx('visionärin__gesellig');
      text.innerHTML = tx('radarchart_über_alle__dimens');
      renderPreviewRadar();
      karte.classList.remove('preview-eigen');
    }
  }

  function radarSVG(sc, size, other, isExample){
    size = size || 320;
    var c = size/2, r = size*0.34, labelR = size*0.40;
    var poly = polyPoints(sc, c, r).map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');

    var rings = [0.25,0.5,0.75,1].map(function(frac){
      var rp = ORDER.map(function(f,i){
        var ang = -Math.PI/2 + i*(2*Math.PI/5);
        return [c + r*frac*Math.cos(ang), c + r*frac*Math.sin(ang)];
      });
      return '<polygon points="'+rp.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ')+'" fill="none" stroke="var(--line)" stroke-width="1"/>';
    }).join('');

    var axes = ORDER.map(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var x2 = c + r*Math.cos(ang), y2 = c + r*Math.sin(ang);
      return '<line x1="'+c+'" y1="'+c+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="var(--line)" stroke-width="1"/>';
    }).join('');

    var otherPoly = '';
    if (other){
      var polyO = polyPoints(other.scores, c, r).map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');
      otherPoly = '<polygon points="'+polyO+'" fill="color-mix(in srgb, var(--accent-2) 20%, transparent)" stroke="var(--accent-2)" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>';
    }

    var labels = ORDER.map(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var lx = c + labelR*Math.cos(ang), ly = c + labelR*Math.sin(ang);
      var anchor = Math.abs(Math.cos(ang))<0.2 ? 'middle' : (Math.cos(ang)>0?'start':'end');
      var valueLine = other
        ? '<text x="'+lx.toFixed(1)+'" y="'+(ly+13).toFixed(1)+'" text-anchor="'+anchor+'" class="radar-axis-value radar-axis-value-me">'+sc[f]+'</text>'+
          '<text x="'+lx.toFixed(1)+'" y="'+(ly+27).toFixed(1)+'" text-anchor="'+anchor+'" class="radar-axis-value radar-axis-value-other">'+other.scores[f]+'</text>'
        : '<text x="'+lx.toFixed(1)+'" y="'+(ly+13).toFixed(1)+'" text-anchor="'+anchor+'" class="radar-axis-value">'+sc[f]+'</text>';
      return radarLabelSVG(f, lx.toFixed(1), ly - 4, anchor, 'radar-axis-label')+valueLine;
    }).join('');

    var ariaLabel = other
      ? tx('js_vergleich_du') + ORDER.map(function(f){ return LABELS[f]+' '+sc[f]; }).join(', ') + '. '+(other.name || tx('js_andere_person'))+' ' + ORDER.map(function(f){ return LABELS[f]+' '+other.scores[f]; }).join(', ')
      : (isExample ? tx('js_beispielhaftes_profil_zur') : tx('js_dein_profil')) + ORDER.map(function(f){ return LABELS[f]+' '+sc[f]+tx('js_von_100'); }).join(', ');
    return '<svg viewBox="0 0 '+size+' '+(other?size+14:size)+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+ariaLabel+'">'+
      rings+axes+otherPoly+
      '<polygon points="'+poly+'" fill="color-mix(in srgb, var(--accent) 28%, transparent)" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>'+
      labels+
      '</svg>';
  }

  
// ---------- radar ----------
  function polyPoints(sc, c, r){
    return ORDER.map(function(f,i){
      var ang = -Math.PI/2 + i*(2*Math.PI/5);
      var v = Math.max(4,sc[f])/100 * r;
      return [c + v*Math.cos(ang), c + v*Math.sin(ang)];
    });
  }

  // Runde 58: Das Beispiel-Radar der Startseite wurde beim Start einmal gezeichnet und beim
  // Sprachwechsel nie erneuert — Achsenbeschriftung und aria-label blieben deshalb in der
  // Sprache, mit der die App geoeffnet wurde. Als benannte Funktion, damit setLang() sie
  // genauso aufrufen kann wie der Startlauf.
  function renderPreviewRadar(){
    var el = $('previewRadar');
    if (el) el.innerHTML = radarSVG({O:78,E:65,C:45,A:58,S:50}, 160, null, true);
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
      return '<text x="'+lx.toFixed(1)+'" y="'+(ly-4).toFixed(1)+'" text-anchor="'+anchor+'" class="radar-axis-label">'+RADAR_LABELS[f]+'</text>'+valueLine;
    }).join('');

    var ariaLabel = other
      ? tx('js_vergleich_du') + ORDER.map(function(f){ return LABELS[f]+' '+sc[f]; }).join(', ') + '. Andere Person ' + ORDER.map(function(f){ return LABELS[f]+' '+other.scores[f]; }).join(', ')
      : (isExample ? tx('js_beispielhaftes_profil_zur') : tx('js_dein_profil')) + ORDER.map(function(f){ return LABELS[f]+' '+sc[f]+tx('js_von_100'); }).join(', ');
    return '<svg viewBox="0 0 '+size+' '+(other?size+14:size)+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+ariaLabel+'">'+
      rings+axes+otherPoly+
      '<polygon points="'+poly+'" fill="color-mix(in srgb, var(--accent) 28%, transparent)" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>'+
      labels+
      '</svg>';
  }

  
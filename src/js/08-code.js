// ---------- code encode/decode ----------
  function toCode(sc){
    return ORDER.map(function(f){
      var v = Math.max(0,Math.min(100, sc[f]));
      return v.toString(36).padStart(2,'0');
    }).join('');
  }
  function fromCode(code){
    if (!code || code.length!==10) return null;
    var out = {};
    for (var i=0;i<5;i++){
      var chunk = code.substr(i*2,2);
      var v = parseInt(chunk,36);
      if (isNaN(v)) return null;
      out[ORDER[i]] = Math.max(0, Math.min(100, v));
    }
    return out;
  }

  // ---------- precision data visuals (gauge bar, ring gauge, sparkline, count-up) ----------
  // Ersetzt den früheren simplen Fortschrittsbalken durch eine Skala mit Tick-Markierungen
  // bei 25/50/75 und einem Marker-Punkt an der eigentlichen Position — liest sich eher wie eine
  // gemessene Instrumentenanzeige (Apple Health/Whoop-Richtung) als wie ein reiner Ladebalken.
  function gaugeBarHTML(value){
    value = Math.max(0, Math.min(100, value));
    return '<div class="gauge-track">'+
      '<div class="gauge-fill" style="width:'+value+'%"></div>'+
      '<div class="gauge-tick" style="left:25%"></div>'+
      '<div class="gauge-tick" style="left:50%"></div>'+
      '<div class="gauge-tick" style="left:75%"></div>'+
      '<div class="gauge-marker" style="left:'+value+'%"></div>'+
      '</div>';
  }

  function ringGaugeSVG(percent, size, label){
    size = size || 132;
    var pct = Math.max(0, Math.min(100, Math.round(percent)));
    var r = size/2 - 9, c = size/2;
    var circumf = 2*Math.PI*r;
    var offset = circumf * (1 - pct/100);
    return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" role="img" aria-label="'+(label||tx('js_übereinstimmung'))+': '+pct+tx('js_prozent')+'">'+
      '<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" class="ring-track" stroke-width="9"/>'+
      '<circle cx="'+c+'" cy="'+c+'" r="'+r+'" fill="none" class="ring-fill" stroke-width="9" stroke-linecap="round" '+
        'stroke-dasharray="'+circumf.toFixed(1)+'" stroke-dashoffset="'+offset.toFixed(1)+'" transform="rotate(-90 '+c+' '+c+')"/>'+
      '<text x="'+c+'" y="'+(c+9)+'" text-anchor="middle" class="ring-text">'+pct+'</text>'+
      '</svg>';
  }

  // Kompakter Sparkline-Liniengraph für den Dimensionsverlauf über mehrere Testdurchläufe.
  // Braucht mindestens zwei Datenpunkte, um eine Linie zu ergeben.
  function sparklineSVG(values, w, h){
    w = w || 140; h = h || 32;
    if (!values || values.length<2){
      return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-hidden="true"></svg>';
    }
    var pad = 4;
    var pts = values.map(function(v,i){
      var x = pad + (i/(values.length-1))*(w-2*pad);
      var y = pad + (1-v/100)*(h-2*pad);
      return [x,y];
    });
    var path = pts.map(function(p,i){ return (i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');
    var last = pts[pts.length-1];
    return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-hidden="true">'+
      '<path d="'+path+'" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
      '<circle cx="'+last[0].toFixed(1)+'" cy="'+last[1].toFixed(1)+'" r="3" fill="var(--accent-strong)"/>'+
      '</svg>';
  }

  function prefersReducedMotion(){
    try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; }
  }

  // Zählt eine Zahl von 0 auf ihren Zielwert hoch, statt sie instantan einzublenden — ein
  // kleiner, aber typischer Baustein datengetriebener Premium-Apps beim "Reveal" eines Ergebnisses.
  function animateCountUp(el, target, duration){
    duration = duration || 900;
    if (prefersReducedMotion()){ el.textContent = target; return; }
    var start = null;
    function step(ts){
      if (!start) start = ts;
      var p = Math.min(1, (ts-start)/duration);
      var eased = 1 - Math.pow(1-p, 3);
      el.textContent = Math.round(eased*target);
      if (p<1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  
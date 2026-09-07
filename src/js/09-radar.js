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

  // Runde 66: Die Startseite war für jemanden gebaut, der Lucenta zum ersten Mal sieht — und
  // blieb das auch nach fünfzig beantworteten Fragen. Wer wiederkommt, las zuerst wieder die
  // Verkaufsansprache ("Lern dich kennen — mit Wissenschaft, nicht mit Sternzeichen"), dann die
  // Erklärung des Big-Five-Modells, dann "Warum kein MBTI" — und erreichte erst danach die
  // Tagesform, also das Einzige, das sich seit gestern überhaupt geändert haben kann.
  //
  // Das ist keine Bindungsmechanik, sondern das Naheliegende: Die Seite zeigt zuerst, was dieser
  // Person gehört, und die Einführung rutscht dorthin, wo sie hingehört, wenn man sie nicht mehr
  // braucht. Ohne Ergebnis bleibt die Reihenfolge unverändert.
  function ordneStartseite(){
    var view = $('view-landing');
    if (!view) return;
    var hero = view.querySelector('.hero');
    var why = view.querySelector('.why');
    var sub = view.querySelector('.hero .sub');
    var state = $('landingStateTeaser');
    var verstehen = $('landingUnderstandTeaser');
    var portrait = $('previewCard');
    if (!hero || !why || !state || !verstehen || !portrait) return;
    var hatErgebnis = !!loadResult();

    // Die ausführliche Erklärung des Modells ist Text für den ersten Besuch.
    sub.style.display = hatErgebnis ? 'none' : '';

    var soll = hatErgebnis
      ? [hero, state, portrait, verstehen, why]
      : [hero, why, state, verstehen, portrait];
    // Nur umhängen, wenn die Reihenfolge tatsächlich abweicht — appendChild verschiebt den
    // Knoten auch dann, wenn er schon richtig steht, und würde die Einblendungen der Karten
    // bei jeder Rückkehr zur Startseite neu auslösen.
    var ist = [];
    for (var i=0;i<view.children.length;i++){
      if (soll.indexOf(view.children[i]) >= 0) ist.push(view.children[i]);
    }
    var gleich = ist.length === soll.length;
    for (var j=0; gleich && j<soll.length; j++){ if (ist[j] !== soll[j]) gleich = false; }
    if (gleich) return;
    // Vor dem ersten Element einsetzen, das nicht Teil der Umordnung ist (die Kachelreihe),
    // damit alles Übrige an seinem Platz bleibt.
    var anker = null;
    for (var k=0;k<view.children.length;k++){
      if (soll.indexOf(view.children[k]) < 0 && view.children[k].className.indexOf('factsgrid') >= 0){
        anker = view.children[k]; break;
      }
    }
    soll.forEach(function(el){ view.insertBefore(el, anker); });
  }

  // Runde 66: Die Karte zeigte immer dasselbe erfundene Beispiel — auch jemandem, der seit
  // Wochen sein eigenes Ergebnis hat. Das war die einzige Stelle auf der Startseite, an der ein
  // Porträt stand, und es war das einer erfundenen Person.
  //
  // Wer ein Ergebnis hat, sieht hier jetzt sein eigenes: eigener Titel, eigenes Motto, eigenes
  // Radar. Das ist kein Kunstgriff zur Bindung, sondern das Naheliegende — die Startseite zeigt
  // das, was diese Person tatsächlich hat, statt einer Werbefläche für etwas, das sie längst
  // besitzt. Ohne Ergebnis bleibt alles wie bisher.
  // Runde 70: Die Farbe der eigenen stärksten Dimension. Sie wird als Eigenschaft auf den
  // Behälter gesetzt, damit das Stilblatt sie über var(--dim-aktiv) aufgreifen kann, ohne dass
  // JavaScript einzelne Farben zuweist.
  //
  // Bewusst immer nur EINE: Fünf gleichzeitig sichtbare Farbtöne sind nicht sicher
  // unterscheidbar (gemessen, siehe README) — eine je Porträt dagegen ist gefahrlos und macht
  // das Ergebnis persönlich.
  var DIM_MARKE = {O:'--dim-o', C:'--dim-c', E:'--dim-e', A:'--dim-a', S:'--dim-s'};
  function setzeDimensionsfarbe(el, sc){
    if (!el || !sc) return;
    try{
      var a = archetypeOf(sc);
      var marke = DIM_MARKE[a.top1];
      // Zwei Marken statt einer: --dim-aktiv traegt die Linien und Flaechen, --dim-aktiv-text
      // die Schrift. Sie sind im Hellmodus nicht dieselbe Farbe — die Datenfarbe erreicht als
      // Text die 4,5:1 nicht (Runde 93, von der Kontrastpruefung gefunden). Beide werden hier
      // gesetzt, damit das Stilblatt die Wahl hat, ohne dass JavaScript Farben kennt.
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
      titel.innerHTML = NOUN[a.top1][pol1] + ' <span class="sep">·</span> ' + ADJ[a.top2][pol2];
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
      return '<text x="'+lx.toFixed(1)+'" y="'+(ly-4).toFixed(1)+'" text-anchor="'+anchor+'" class="radar-axis-label">'+RADAR_LABELS[f]+'</text>'+valueLine;
    }).join('');

    var ariaLabel = other
      ? tx('js_vergleich_du') + ORDER.map(function(f){ return LABELS[f]+' '+sc[f]; }).join(', ') + '. '+tx('js_andere_person')+' ' + ORDER.map(function(f){ return LABELS[f]+' '+other.scores[f]; }).join(', ')
      : (isExample ? tx('js_beispielhaftes_profil_zur') : tx('js_dein_profil')) + ORDER.map(function(f){ return LABELS[f]+' '+sc[f]+tx('js_von_100'); }).join(', ');
    return '<svg viewBox="0 0 '+size+' '+(other?size+14:size)+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+ariaLabel+'">'+
      rings+axes+otherPoly+
      '<polygon points="'+poly+'" fill="color-mix(in srgb, var(--accent) 28%, transparent)" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>'+
      labels+
      '</svg>';
  }

  
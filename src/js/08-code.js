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

  // ---------- Messanzeigen (Skala, Ring, Kurve, Hochzaehlen) ----------
  // Der Balken beginnt bei 0 und traegt sein Ziel als Datenwert; startGauges() setzt es im naechsten
  // Bild — sonst liefe der Uebergang nie.
  function gaugeBarHTML(value){
    value = Math.max(0, Math.min(100, value));
    return '<div class="gauge-track" data-gauge="'+value+'">'+
      '<div class="gauge-fill" style="width:0%"></div>'+
      '<div class="gauge-tick" style="left:25%"></div>'+
      '<div class="gauge-tick" style="left:50%"></div>'+
      '<div class="gauge-tick" style="left:75%"></div>'+
      '<div class="gauge-marker" style="left:0%"></div>'+
      '</div>';
  }

  function startGauges(root){
    if (!root || !root.querySelectorAll) return;
    var spuren = root.querySelectorAll('.gauge-track[data-gauge]');
    var setzen = function(){
      for (var i=0;i<spuren.length;i++){
        var t = spuren[i], v = t.getAttribute('data-gauge');
        if (v === null) continue;
        var f = t.querySelector('.gauge-fill'), m = t.querySelector('.gauge-marker');
        if (f) f.style.width = v+'%';
        if (m) m.style.left = v+'%';
        // Der Datenwert wird entfernt, damit ein erneuter Aufruf einen bereits gefüllten
        // Balken nicht ein zweites Mal von vorn beginnen lässt.
        t.removeAttribute('data-gauge');
      }
    };
    // Ohne Bewegungswunsch sofort: die Übergangszeit ist dort ohnehin abgeschaltet, ein
    // zusätzliches Einzelbild Wartezeit brächte nur ein kurzes Aufblitzen bei 0.
    if (prefersReducedMotion()){ setzen(); return; }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(function(){ requestAnimationFrame(setzen); });
    else setzen();
  }

  // Vergleichsbalken: eine Spur mit zwei Punkten und der Strecke dazwischen — der Gegenstand ist der
  // Abstand.
  function compatBalkenHTML(me, other){
    me = Math.max(0, Math.min(100, me));
    other = Math.max(0, Math.min(100, other));
    var von = Math.min(me, other), bis = Math.max(me, other);
    return '<div class="gauge-track cmp-track" data-cmp-me="'+me+'" data-cmp-other="'+other+'" '+
      'data-cmp-von="'+von+'" data-cmp-bis="'+bis+'" role="img" aria-label="'+
      tx('js_du_kurz')+' '+me+', '+tx('js_andere_person')+': '+other+'">'+
      '<div class="cmp-span" style="left:'+von+'%;width:0%"></div>'+
      '<div class="gauge-tick" style="left:25%"></div>'+
      '<div class="gauge-tick" style="left:50%"></div>'+
      '<div class="gauge-tick" style="left:75%"></div>'+
      '<div class="cmp-dot cmp-dot-other" style="left:50%"></div>'+
      '<div class="cmp-dot cmp-dot-me" style="left:50%"></div>'+
      '</div>';
  }

  // Wie startGauges: Endzustand erst setzen, wenn das Element im Baum steht; danach Datenwert
  // entfernen.
  function startCompatBars(root){
    if (!root || !root.querySelectorAll) return;
    var spuren = root.querySelectorAll('.cmp-track[data-cmp-me]');
    var setzen = function(){
      for (var i=0;i<spuren.length;i++){
        var t = spuren[i];
        var von = t.getAttribute('data-cmp-von'), bis = t.getAttribute('data-cmp-bis');
        var sp = t.querySelector('.cmp-span');
        var dm = t.querySelector('.cmp-dot-me'), doo = t.querySelector('.cmp-dot-other');
        if (sp) sp.style.width = (bis - von)+'%';
        if (dm) dm.style.left = t.getAttribute('data-cmp-me')+'%';
        if (doo) doo.style.left = t.getAttribute('data-cmp-other')+'%';
        t.removeAttribute('data-cmp-me');
      }
    };
    if (prefersReducedMotion()){ setzen(); return; }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(function(){ requestAnimationFrame(setzen); });
    else setzen();
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

  // Verlaufsdiagramm. Energie und Stimmung teilen die Skala 1–5 und liegen auf EINER Achse (zwei
  // y-Achsen erzeugten Scheinkreuzungen). Farben aus --daten-energie/--daten-stimmung.
  // VERLAUF_RAND: Die Kurve rueckt ein, damit auch die aeusseren Datumsmarken mittig ueber ihrem Tag
  // stehen. Gilt an allen drei Stellen, die x(i) rechnen: Diagramm, Achse, Ablesen.
  var VERLAUF_RAND = 24;
  function verlaufDiagrammSVG(eintraege, breite, hoehe){
    breite = breite || 320; hoehe = hoehe || 150;
    var links = VERLAUF_RAND, rechts = VERLAUF_RAND, oben = 10, unten = 18;
    var iw = breite - links - rechts, ih = hoehe - oben - unten;
    var n = eintraege.length;
    var x = function(i){ return n < 2 ? links + iw/2 : links + (i/(n-1))*iw; };
    var y = function(v){ return oben + (1 - (v-1)/4) * ih; };

    // Waagerechte Hilfslinien bei 1 bis 5, zurückhaltend — sie sollen den Wert ablesbar machen,
    // nicht mit den Datenlinien konkurrieren.
    var raster = '';
    for (var w2 = 1; w2 <= 5; w2++){
      // Die Rasterlinien bleiben voll breit; nur die Kurve rueckt ein.
      raster += '<line x1="0" y1="'+y(w2).toFixed(1)+'" x2="'+breite+'" y2="'+y(w2).toFixed(1)+
                '" stroke="var(--line)" stroke-width="1" '+(w2===1||w2===5?'':'stroke-dasharray="2 4" ')+'opacity="'+(w2===1||w2===5?'0.9':'0.55')+'"/>';
    }
    // Live-Einzeichnen ueber stroke-dasharray/-dashoffset. Die Laenge wird GERECHNET (Summe der
    // Strecken; das Element ist hier noch eine Zeichenkette) und geht als --vl-laenge ans <svg>. 2 %
    // Zuschlag fuer die runden Ecken an den Knicken.
    var laengeMax = 0;
    var linie = function(feld, farbe){
      var d = eintraege.map(function(e,i){ return (i?'L':'M')+x(i).toFixed(1)+','+y(e[feld]).toFixed(1); }).join(' ');
      var lang = 0;
      for (var i = 1; i < n; i++){
        var dx = x(i) - x(i-1), dy = y(eintraege[i][feld]) - y(eintraege[i-1][feld]);
        lang += Math.sqrt(dx*dx + dy*dy);
      }
      if (lang > laengeMax) laengeMax = lang;
      var letzter = eintraege[n-1];
      return '<path class="vl-linie" d="'+d+'" fill="none" stroke="'+farbe+
             '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
             '<circle class="vl-spitze" cx="'+x(n-1).toFixed(1)+'" cy="'+y(letzter[feld]).toFixed(1)+
             '" r="4.5" fill="'+farbe+'" stroke="var(--surface)" stroke-width="2"/>';
    };
    // Der juengste Punkt traegt einen Ring in Flaechenfarbe. Beide Linien zuerst bauen, damit
    // --vl-laenge die laengere kennt und beide gleichzeitig ankommen.
    var linien = linie('energy','var(--daten-energie)') + linie('valence','var(--daten-stimmung)');
    // Die Klasse entscheidet hier, nicht das Stilblatt: CSS kennt nur die Systemeinstellung, nicht den
    // Bewegungsschalter der App. Beide Zweige tragen das VOLLE class="...", sonst meldet audit_i18n.py
    // ' vl-zeichnet' als deutschen Text.
    var zeichnet = prefersReducedMotion() ? 'class="verlauf-svg"' : 'class="verlauf-svg vl-zeichnet"';
    return '<svg '+zeichnet+' viewBox="0 0 '+breite+' '+hoehe+'" preserveAspectRatio="none" role="img" '+
             'style="--vl-laenge:'+(laengeMax * 1.02).toFixed(1)+'" '+
             'aria-label="'+beschriftungVerlauf(eintraege)+'">'+
             raster +
             // Fadenkreuz und Ablesepunkte liegen vor den Linien und sind bis zur ersten
             // Berührung verborgen.
             '<line class="vl-kreuz" x1="0" y1="'+oben+'" x2="0" y2="'+(oben+ih)+'" '+
               'stroke="var(--line-strong)" stroke-width="1" opacity="0"/>' +
             linien +
             '<circle class="vl-lese vl-lese-e" r="4" fill="var(--daten-energie)" '+
               'stroke="var(--surface)" stroke-width="2" opacity="0"/>' +
             '<circle class="vl-lese vl-lese-s" r="4" fill="var(--daten-stimmung)" '+
               'stroke="var(--surface)" stroke-width="2" opacity="0"/>' +
           '</svg>';
  }

  // Datumsachse: Die Position kommt aus derselben Rechnung wie die Punkte (deshalb steht die Funktion
  // hier). Hoechstens vier Marken, nie dichter als ACHSE_ABSTAND; bei wenigen Punkten je Punkt eine.
  // Gleiche Abstaende: fester Schritt von HEUTE rueckwaerts, jede Marke mittig ueber ihrem Punkt (der
  // erste Tag traegt dafuer nicht immer eine).
  var ACHSE_MARKEN = 4, ACHSE_ABSTAND = 64;
  function verlaufAchseHTML(eintraege, breite){
    breite = breite || 320;
    var links = VERLAUF_RAND, rechts = VERLAUF_RAND, iw = breite - links - rechts;
    var n = eintraege.length;
    if (!n) return '';
    var fmt = achsenDatumFmt();
    var stellen = [n - 1];
    if (n > 1){
      var schritt = Math.max(1, Math.floor((n - 1) / (ACHSE_MARKEN - 1)),
                             Math.ceil(ACHSE_ABSTAND * (n - 1) / iw));
      for (var i = n - 1 - schritt; i >= 0 && stellen.length < ACHSE_MARKEN; i -= schritt) stellen.unshift(i);
    }
    return '<div class="verlauf-achse" aria-hidden="true">' + stellen.map(function(i){
      var e = eintraege[i], text = '';
      try{ text = fmt.format(new Date(e.ts)); }catch(x){ text = e.day || ''; }
      var anteil = (n < 2 ? links + iw/2 : links + (i/(n-1))*iw) / breite * 100;
      return '<span class="vl-achse-marke" style="left:'+anteil.toFixed(2)+'%">'+text+'</span>';
    }).join('') + '</div>';
  }

  // Ablesen per Finger oder Maus ueber die ganze Diagrammflaeche; die Legende zeigt waehrenddessen den
  // Tag, danach wieder heute.
  function verlaufAblesenAktivieren(flaeche, eintraege, fmt){
    if (!flaeche || !eintraege || eintraege.length < 2) return;
    var svg = flaeche.querySelector('.verlauf-svg');
    var kreuz = flaeche.querySelector('.vl-kreuz');
    var pe = flaeche.querySelector('.vl-lese-e'), ps = flaeche.querySelector('.vl-lese-s');
    var wertE = flaeche.parentNode.querySelector('.vl-energie-wert');
    var wertS = flaeche.parentNode.querySelector('.vl-stimmung-wert');
    var datum = flaeche.parentNode.querySelector('.vl-datum');
    if (!svg || !kreuz || !pe || !ps) return;
    var n = eintraege.length, links = VERLAUF_RAND, rechts = VERLAUF_RAND, oben = 10, unten = 18;
    var breite = 320, hoehe = 150, iw = breite - links - rechts, ih = hoehe - oben - unten;
    // Tageswerte sind Mittel; tagWert() gibt ganze Zahlen ganz, sonst mit einer Nachkommastelle aus.
    var heuteE = tagWert(eintraege[n-1].energy), heuteS = tagWert(eintraege[n-1].valence);

    function zeigen(ev){
      var r = svg.getBoundingClientRect();
      if (!r.width) return;
      var px = ((ev.clientX - r.left) / r.width) * breite;
      var i = Math.round(((px - links) / iw) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      var e = eintraege[i];
      var x = links + (i/(n-1))*iw;
      kreuz.setAttribute('x1', x.toFixed(1)); kreuz.setAttribute('x2', x.toFixed(1));
      kreuz.setAttribute('opacity','0.7');
      var y = function(v){ return oben + (1 - (v-1)/4) * ih; };
      pe.setAttribute('cx', x.toFixed(1)); pe.setAttribute('cy', y(e.energy).toFixed(1)); pe.setAttribute('opacity','1');
      ps.setAttribute('cx', x.toFixed(1)); ps.setAttribute('cy', y(e.valence).toFixed(1)); ps.setAttribute('opacity','1');
      if (wertE) wertE.textContent = tagWert(e.energy);
      if (wertS) wertS.textContent = tagWert(e.valence);
      if (datum){ var d = ''; try{ d = fmt.format(new Date(e.ts)); }catch(x){ d = e.day || ''; } datum.textContent = d; }
    }
    function verbergen(){
      kreuz.setAttribute('opacity','0');
      pe.setAttribute('opacity','0'); ps.setAttribute('opacity','0');
      if (wertE) wertE.textContent = heuteE;
      if (wertS) wertS.textContent = heuteS;
      if (datum) datum.textContent = tx('js_heute');
    }
    // Nach einer Beruehrung bleibt die Ablesung stehen (bis anderswo getippt wird oder ein paar
    // Sekunden vergehen) — sonst saehe man auf dem Telefon nur ein Aufblitzen.
    var haltenTimer = null;
    function haltenAbbrechen(){ if (haltenTimer){ clearTimeout(haltenTimer); haltenTimer = null; } }
    flaeche.addEventListener('pointerdown', function(ev){ haltenAbbrechen(); zeigen(ev); });
    flaeche.addEventListener('pointermove', function(ev){
      if (ev.buttons || ev.pointerType !== 'mouse'){ haltenAbbrechen(); zeigen(ev); }
    });
    flaeche.addEventListener('pointerup', function(ev){
      if (ev.pointerType === 'mouse'){ verbergen(); return; }
      haltenAbbrechen();
      haltenTimer = setTimeout(function(){ haltenTimer = null; verbergen(); }, 2600);
    });
    flaeche.addEventListener('pointercancel', function(){ haltenAbbrechen(); verbergen(); });
    flaeche.addEventListener('pointerleave', function(ev){
      if (ev.pointerType === 'mouse'){ haltenAbbrechen(); verbergen(); }
    });
    verbergen();
  }

  // Das Diagramm ist keine Zierde, also braucht es eine Beschreibung, die dasselbe sagt wie das
  // Bild. Die alte Sparkline trug aria-hidden und war für Vorleseprogramme schlicht nicht da.
  function beschriftungVerlauf(eintraege){
    var n = eintraege.length;
    var erst = eintraege[0], letzt = eintraege[n-1];
    return tx('js_verlauf_von') + n + tx('js_verlauf_tagen') +
           tx('js_energie') + ' ' + tagWert(erst.energy) + tx('js_verlauf_bis') + tagWert(letzt.energy) + ', ' +
           tx('js_stimmung') + ' ' + tagWert(erst.valence) + tx('js_verlauf_bis') + tagWert(letzt.valence) + '.';
  }

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

  // Der Bewegungsschalter der App wirkt an EINER Stelle: prefersReducedMotion() fragen alle Bewegungen
  // ab. Das System kann nur strenger sein — steht es auf reduziert, hilft "An" nicht.
  function bewegungAbgeschaltet(){
    try{ return localStorage.getItem('lucenta_bewegung') === 'aus'; }catch(e){ return false; }
  }
  function prefersReducedMotion(){
    if (bewegungAbgeschaltet()) return true;
    try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; }
  }
  function haptikAbgeschaltet(){
    try{ return localStorage.getItem('lucenta_haptik') === 'aus'; }catch(e){ return false; }
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

  
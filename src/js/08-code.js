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
  // Runde 65: .gauge-fill und .gauge-marker tragen seit jeher eine Übergangszeit von 0,9 s —
  // die aber nie lief. Ein Übergang braucht eine Änderung; die Breite stand schon im erzeugten
  // Markup und war damit ab dem ersten Bild endgültig. Gemessen: 171,594px im ersten Bild und
  // unverändert danach. Sichtbar war das als Widerspruch — die Zahlen zählten hoch (dafür gibt
  // es animateCountUp), während die Balken darunter längst voll waren.
  //
  // Jetzt beginnt der Balken bei 0 und trägt sein Ziel als Datenwert; startGauges() setzt es
  // im nächsten Einzelbild, wodurch der Übergang tatsächlich anläuft.
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

  // Runde 81: Der Messbalken des Vergleichs. Er zeigt bewusst NICHT zwei Balken untereinander,
  // sondern eine Spur mit zwei Punkten und der Strecke dazwischen: Der Gegenstand des Vergleichs
  // ist der Abstand, nicht die beiden Zahlen fuer sich. Zwei getrennte Balken haetten die
  // Leserin die Differenz selbst schaetzen lassen — genau die Arbeit, die eine Darstellung
  // abnehmen soll.
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

  // Dieselbe Mechanik wie startGauges: erst im Endzustand setzen, wenn das Element im Baum
  // steht, sonst laeuft kein Uebergang. Der Datenwert wird danach entfernt, damit ein zweiter
  // Aufruf den Balken nicht noch einmal von vorn beginnen laesst.
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

  // Kompakter Sparkline-Liniengraph für den Dimensionsverlauf über mehrere Testdurchläufe.
  // Braucht mindestens zwei Datenpunkte, um eine Linie zu ergeben.
  // Runde 67: Der Tagesform-Verlauf bestand aus zwei Sparklines von 140x32 — ohne Achse, ohne
  // Maßstab, ohne Datum, mit aria-hidden. Man sah, DASS sich etwas bewegt, aber nicht wann,
  // nicht wie weit und nicht im Verhältnis wozu. Genau das ist aber der einzige Teil der App,
  // der sich ehrlich täglich ändert und damit das Einzige, was ein Wiederkommen trägt.
  //
  // Beide Reihen teilen die Skala 1 bis 5 und liegen deshalb in EINEM Diagramm auf EINER Achse.
  // Zwei y-Achsen wären hier der naheliegende Fehler: Sie erzeugen Kreuzungen und Abstände, die
  // in den Daten nicht existieren.
  //
  // Die beiden Farben stammen aus --daten-energie und --daten-stimmung, nicht aus den Akzenten
  // der Oberfläche. Begründung steht bei den Marken in 00-grundlagen.css.
  function verlaufDiagrammSVG(eintraege, breite, hoehe){
    breite = breite || 320; hoehe = hoehe || 150;
    var links = 4, rechts = 4, oben = 10, unten = 18;
    var iw = breite - links - rechts, ih = hoehe - oben - unten;
    var n = eintraege.length;
    var x = function(i){ return n < 2 ? links + iw/2 : links + (i/(n-1))*iw; };
    var y = function(v){ return oben + (1 - (v-1)/4) * ih; };

    // Waagerechte Hilfslinien bei 1 bis 5, zurückhaltend — sie sollen den Wert ablesbar machen,
    // nicht mit den Datenlinien konkurrieren.
    var raster = '';
    for (var w2 = 1; w2 <= 5; w2++){
      raster += '<line x1="'+links+'" y1="'+y(w2).toFixed(1)+'" x2="'+(links+iw)+'" y2="'+y(w2).toFixed(1)+
                '" stroke="var(--line)" stroke-width="1" '+(w2===1||w2===5?'':'stroke-dasharray="2 4" ')+'opacity="'+(w2===1||w2===5?'0.9':'0.55')+'"/>';
    }
    var linie = function(feld, farbe){
      var d = eintraege.map(function(e,i){ return (i?'L':'M')+x(i).toFixed(1)+','+y(e[feld]).toFixed(1); }).join(' ');
      var letzter = eintraege[n-1];
      return '<path d="'+d+'" fill="none" stroke="'+farbe+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'+
             '<circle cx="'+x(n-1).toFixed(1)+'" cy="'+y(letzter[feld]).toFixed(1)+'" r="4.5" fill="'+farbe+
             '" stroke="var(--surface)" stroke-width="2"/>';
    };
    // Der jüngste Punkt trägt einen Ring in der Flächenfarbe: Wo sich zwei Marken überlagern,
    // trennt der Ring sie, statt sie zu einem Fleck verschmelzen zu lassen.
    return '<svg class="verlauf-svg" viewBox="0 0 '+breite+' '+hoehe+'" preserveAspectRatio="none" role="img" '+
             'aria-label="'+beschriftungVerlauf(eintraege)+'">'+
             raster +
             // Fadenkreuz und Ablesepunkte liegen vor den Linien und sind bis zur ersten
             // Berührung verborgen.
             '<line class="vl-kreuz" x1="0" y1="'+oben+'" x2="0" y2="'+(oben+ih)+'" '+
               'stroke="var(--line-strong)" stroke-width="1" opacity="0"/>' +
             linie('energy','var(--daten-energie)') +
             linie('valence','var(--daten-stimmung)') +
             '<circle class="vl-lese vl-lese-e" r="4" fill="var(--daten-energie)" '+
               'stroke="var(--surface)" stroke-width="2" opacity="0"/>' +
             '<circle class="vl-lese vl-lese-s" r="4" fill="var(--daten-stimmung)" '+
               'stroke="var(--surface)" stroke-width="2" opacity="0"/>' +
           '</svg>';
  }

  // Ein Liniendiagramm im Browser ist bedienbar, kein Bild. Wer den Finger darüber zieht, liest
  // den einzelnen Tag ab; die Legende zeigt währenddessen dessen Werte und das Datum statt der
  // heutigen. Beim Loslassen kehrt sie zu heute zurück — der Ruhezustand bleibt "heute", damit
  // die Angabe ohne jede Bedienung stimmt.
  //
  // Die Trefferfläche ist die ganze Diagrammfläche, nicht die 2px-Linie: Auf dem Telefon wäre
  // eine Linie als Ziel unbenutzbar.
  function verlaufAblesenAktivieren(flaeche, eintraege, fmt){
    if (!flaeche || !eintraege || eintraege.length < 2) return;
    var svg = flaeche.querySelector('.verlauf-svg');
    var kreuz = flaeche.querySelector('.vl-kreuz');
    var pe = flaeche.querySelector('.vl-lese-e'), ps = flaeche.querySelector('.vl-lese-s');
    var wertE = flaeche.parentNode.querySelector('.vl-energie-wert');
    var wertS = flaeche.parentNode.querySelector('.vl-stimmung-wert');
    var datum = flaeche.parentNode.querySelector('.vl-datum');
    if (!svg || !kreuz || !pe || !ps) return;
    var n = eintraege.length, links = 4, rechts = 4, oben = 10, unten = 18;
    var breite = 320, hoehe = 150, iw = breite - links - rechts, ih = hoehe - oben - unten;
    var heuteE = eintraege[n-1].energy, heuteS = eintraege[n-1].valence;

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
      if (wertE) wertE.textContent = e.energy;
      if (wertS) wertS.textContent = e.valence;
      if (datum){ var d = ''; try{ d = fmt.format(new Date(e.ts)); }catch(x){ d = e.day || ''; } datum.textContent = d; }
    }
    function verbergen(){
      kreuz.setAttribute('opacity','0');
      pe.setAttribute('opacity','0'); ps.setAttribute('opacity','0');
      if (wertE) wertE.textContent = heuteE;
      if (wertS) wertS.textContent = heuteS;
      if (datum) datum.textContent = tx('js_heute');
    }
    // Maus und Finger brauchen verschiedenes Verhalten, und das ist kein Feinschliff:
    // Beim Zeigen mit der Maus liegt der Zeiger die ganze Zeit auf der Fläche, der Wert kann
    // also beim Verlassen verschwinden. Ein Tipp dagegen ist ein Augenblick — verschwände der
    // Wert beim Loslassen, sähe man auf dem Telefon nur ein Aufblitzen. Gemessen: genau das
    // passierte. Nach einer Berührung bleibt die Ablesung deshalb stehen, bis anderswo
    // getippt wird oder ein paar Sekunden vergangen sind.
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
           tx('js_energie') + ' ' + erst.energy + tx('js_verlauf_bis') + letzt.energy + ', ' +
           tx('js_stimmung') + ' ' + erst.valence + tx('js_verlauf_bis') + letzt.valence + '.';
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

  // Runde 75: Die Bewegungsvorliebe war nur ueber die Systemeinstellung erreichbar. Wer sie nur
  // FUER DIESE APP zurueckdrehen will, hatte keine Moeglichkeit. Der Schalter setzt hier an, an
  // genau EINER Stelle — prefersReducedMotion() fragen alle Bewegungen der App ab, der Schalter
  // wirkt damit ueberall, ohne dass eine einzelne Animation davon wissen muss.
  //
  // Das System kann nur strenger sein, nie lockerer: Steht es auf reduziert, hilft "An" nicht.
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

  
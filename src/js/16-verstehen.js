// ---------- "Verstehen": profilbasierte Kurz-Einordnungen ----------
  function renderUnderstand(){
    var last = loadResult();
    var wrap = $('understandContent');
    if (!last){
      wrap.innerHTML = emptyStateHTML(tx('js_noch_kein_ergebnis_auf_die_2'), {btnId:'btnUnderstandStart', btnLabel:tx('js_test_starten_2')});
      $('btnUnderstandStart').addEventListener('click', function(){ beginRun(false); });
      return;
    }
    // Vier Lebensbereiche mit allen fuenf Werten (Entscheidung des Inhabers, Runde 162); je Bereich die
    // deutlichste Dimension zuerst. Jede Karte: Kernsatz, was das fuer dich heisst, eine Frage.
    var BEREICHE = ['beziehungen', 'arbeit', 'stress', 'wachstum'];
    var reihe = ORDER.slice().sort(function(a, b){ return Math.abs(last[b]-50) - Math.abs(last[a]-50); });
    var bereichHTML = function(b){
      return '<section class="vs-bereich" id="vs-'+b+'"><div class="understand-group-label">'+tx('vs_bereich_'+b)+'</div>'+
        reihe.map(function(f, i){
          var pol = last[f] >= 50 ? 'high' : 'low', k = LEBEN[b][f][pol];
          return '<details class="understand-card vs-karte" style="animation-delay:'+(i*50)+'ms"'+(i === 0 ? ' open' : '')+'><summary>'+
              '<span class="vs-dim">'+LABELS[f]+' · '+last[f]+'</span><h3>'+k.t+'</h3><p>'+k.k+'</p></summary>'+
            '<div class="vs-mehr"><div class="vs-label">'+tx('vs_fuer_dich')+'</div><p>'+k.d+'</p>'+
            '<div class="vs-label">'+tx('vs_frage')+'</div><p class="vs-frage">'+k.f+'</p></div></details>';
        }).join('')+'</section>';
    };
    var inhalt = '<nav class="vs-inhalt" aria-label="'+tx('vs_inhalt')+'">'+
      BEREICHE.map(function(b){ return [b, 'vs_bereich_'+b]; }).concat([['combos', 'vs_kombis'], ['data', 'vs_daten']]).map(function(z){
        return '<button type="button" class="vs-sprung" data-vs-ziel="vs-'+z[0]+'">'+tx(z[1])+'</button>';
      }).join('')+'</nav>';
    // "Verstehen" ist ganz Lucenta+ (Entscheidung des Inhabers, Runde 136). Frei nur die verschwommene
    // Vorschau des ersten Bereichs.
    if (!istPlus()){
      wrap.innerHTML = vorschauHTML(bereichHTML(BEREICHE[0]), tx('plus_verstehen'));
      schloesserVerdrahten(wrap);
      return;
    }
    wrap.innerHTML = inhalt + BEREICHE.map(bereichHTML).join('') +
      '<section id="vs-combos">'+kombiBlock(last)+'</section>'+
      '<section id="vs-data">'+eigeneDatenBlock(last)+'</section>' + tx('js_diese_einordnungen_fassen');
    schloesserVerdrahten(wrap);
    if (wrap.querySelectorAll) wrap.querySelectorAll('[data-vs-ziel]').forEach(function(b){
      b.addEventListener('click', function(){
        var ziel = $(b.getAttribute('data-vs-ziel'));
        if (ziel) ziel.scrollIntoView({behavior: prefersReducedMotion() ? 'auto' : 'smooth', block:'start'});
      });
    });
  }

  // ---------- Kombinationen ----------
  // Alle zehn Paare in allen vier Pol-Lagen (vierzig Faelle), damit jedes Ergebnis seine Karten
  // bekommt.
  var KOMBI_REIHE = ['O','E','C','A','S'];
  function kombiSchluessel(sc, a, b){
    // Kanonische Reihenfolge, damit jedes Paar genau EINEN Schluessel hat.
    var i = KOMBI_REIHE.indexOf(a), j = KOMBI_REIHE.indexOf(b);
    var erst = i < j ? a : b, zweit = i < j ? b : a;
    return erst + zweit + '_' + (sc[erst] >= 50 ? 'h' : 'l') + (sc[zweit] >= 50 ? 'h' : 'l');
  }
  // Die drei Dimensionen, die am weitesten von der Mitte weg liegen — dieselbe Rangfolge, nach
  // der schon archetypeOf() die Ueberschrift des Ergebnisses bildet.
  function staerksteDrei(sc){
    return ORDER.map(function(f){ return {f:f, d:Math.abs(sc[f]-50)}; })
      .sort(function(a,b){ return b.d - a.d; })
      .slice(0,3).map(function(x){ return x.f; });
  }
  function kombiBlock(sc){
    var top = staerksteDrei(sc);
    // Zwei Karten aus derselben Tabelle: das staerkste Paar und das staerkste mit dem dritten.
    // Mehr waere Wiederholung — ab der dritten Karte kommt jede Dimension zum zweiten Mal vor.
    var paare = [[top[0], top[1]], [top[0], top[2]]];
    var karten = paare.map(function(pp, i){
      var k = KOMBI[kombiSchluessel(sc, pp[0], pp[1])];
      if (!k) return '';
      return '<div class="understand-card" style="animation-delay:'+(i*60)+'ms">'+
        '<div class="kombi-dims mono">'+LABELS[pp[0]]+' &times; '+LABELS[pp[1]]+'</div>'+
        '<h3>'+k.title+'</h3><p>'+k.body+'</p></div>';
    }).join('');
    if (!karten) return '';
    return '<div class="understand-group-label">'+tx('js_verstehen_kombi_titel')+'</div>'+karten;
  }

  // ---------- Was in den eigenen Daten steht ----------
  // Ein Befund zaehlt nur, wenn er ZWEI Quellen zusammenbringt (Ergebnis, Verlauf, Tagesform,
  // Vergleiche) — nichts, was schon auf der Ergebnisseite steht. Wochentags- und Tageszeitmuster
  // stehen in der Tagesform, nicht hier.
  function mittel(w){ return w.reduce(function(a,b){ return a+b; }, 0) / w.length; }
  function medianVon(w){
    var s = w.slice().sort(function(a,b){ return a-b; });
    var m = Math.floor(s.length/2);
    return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2;
  }
  function streuung(w){
    var m = mittel(w);
    return Math.sqrt(mittel(w.map(function(v){ return (v-m)*(v-m); })));
  }
  function eigeneDatenBlock(sc){
    var teile = [];
    var hist = [];   try{ hist = loadHistory(); }catch(e){}
    var eintraege = []; try{ eintraege = loadStateHistory(); }catch(e){}
    var tage = eintraege.length ? stateTage(eintraege) : [];
    var archiv = []; try{ archiv = loadCompatArchive(); }catch(e){}

    // 1) Die Form des Profils: was daraus fuer das Lesen des Restes folgt.
    var hoch = ORDER.reduce(function(a,f){ return sc[f] > sc[a] ? f : a; }, ORDER[0]);
    var tief = ORDER.reduce(function(a,f){ return sc[f] < sc[a] ? f : a; }, ORDER[0]);
    var spanne = sc[hoch] - sc[tief];
    var deutlich = ORDER.filter(function(f){ return Math.abs(sc[f]-50) > 10; }).length;
    teile.push({titel: tx('js_ed_titel_form'),
      text: tx('js_ed_form_a') + spanne + tx('js_ed_form_b') + LABELS[hoch] + tx('js_ed_form_c') +
            LABELS[tief] + tx('js_ed_form_d') + deutlich + tx('js_ed_form_e') +
            (spanne >= 40 ? tx('js_ed_form_weit') : (spanne <= 20 ? tx('js_ed_form_eng') : tx('js_ed_form_mittel')))});

    // 2) Haengen Energie und Stimmung zusammen? Verglichen an der eigenen Mitte; ab zehn Tagen.
    if (tage.length >= 10){
      var me = medianVon(tage.map(function(t){ return t.energy; }));
      var mv = medianVon(tage.map(function(t){ return t.valence; }));
      var gleich = tage.filter(function(t){ return (t.energy >= me) === (t.valence >= mv); }).length;
      var anteil = Math.round(gleich / tage.length * 100);
      var se = streuung(tage.map(function(t){ return t.energy; }));
      var sv = streuung(tage.map(function(t){ return t.valence; }));
      var satz = tx('js_ed_kopplung_a') + anteil + tx('js_ed_kopplung_b') + tage.length + tx('js_ed_kopplung_c') +
        (anteil >= 78 ? tx('js_ed_kopplung_eng') : (anteil <= 58 ? tx('js_ed_kopplung_lose') : tx('js_ed_kopplung_teils')));
      // Nur benennen, wenn der Unterschied gross genug ist, um ihn zu behaupten. Ein Zehntel
      // Skalenpunkt Abstand zwischen zwei Streuungen ist kein "schwankt staerker".
      if (Math.abs(se - sv) >= 0.25){
        satz += tx('js_ed_kopplung_d') + tx(se > sv ? 'js_ed_kopplung_energie' : 'js_ed_kopplung_stimmung') +
                tx('js_ed_kopplung_e') + zahl1(Math.max(se,sv)) + tx('js_ed_kopplung_f') + zahl1(Math.min(se,sv)) +
                tx('js_ed_kopplung_g');
      }
      teile.push({titel: tx('js_ed_titel_kopplung'), text: satz});
    }

    // 3) An was fuer Tagen wurde getestet? Zuordnung mit einem Tag Spielraum.
    if (hist.length >= 2 && tage.length >= 8){
      var proTag = {};
      tage.forEach(function(t){ proTag[t.day] = t; });
      var nah = [];
      hist.forEach(function(h){
        var beste = null;
        for (var d = -1; d <= 1; d++){
          var k = tagSchluesselVersetzt(h.date, d);
          if (proTag[k] && (!beste || Math.abs(d) < beste.abstand)) beste = {tag:proTag[k], abstand:Math.abs(d)};
        }
        if (beste) nah.push(beste.tag.energy);
      });
      if (nah.length >= 2){
        var mNah = mittel(nah), mAlle = mittel(tage.map(function(t){ return t.energy; }));
        var ab = mNah - mAlle;
        teile.push({titel: tx('js_ed_titel_testtage'),
          text: tx('js_ed_testtage_a') + nah.length + tx('js_ed_testtage_b') + zahl1(mNah) +
                tx('js_ed_testtage_c') + zahl1(mAlle) + tx('js_ed_testtage_d') +
                (Math.abs(ab) < 0.35 ? tx('js_ed_testtage_neutral')
                                     : tx(ab > 0 ? 'js_ed_testtage_hoch' : 'js_ed_testtage_tief'))});
      }
    }

    // 4) Was steht fest, was wandert — ab drei Durchlaeufen, beide Enden genannt.
    if (hist.length >= 3){
      var weite = ORDER.map(function(f){
        var w = hist.map(function(h){ return h.scores[f]; });
        return {f:f, d: Math.max.apply(null, w) - Math.min.apply(null, w)};
      }).sort(function(a,b){ return b.d - a.d; });
      var beweglich = weite[0], fest = weite[weite.length-1];
      var tageDazwischen = Math.max(1, Math.round((hist[hist.length-1].date - hist[0].date) / 86400000));
      teile.push({titel: tx('js_ed_titel_fest'),
        text: tx('js_ed_fest_a') + hist.length + tx('js_ed_fest_b') + tageDazwischen + tx('js_ed_fest_c') +
              LABELS[fest.f] + tx('js_ed_fest_d') + fest.d + tx('js_ed_fest_e') +
              LABELS[beweglich.f] + tx('js_ed_fest_f') + beweglich.d + tx('js_ed_fest_g') +
              (beweglich.d <= 8 ? tx('js_ed_fest_ruhig') : tx('js_ed_fest_bewegt'))});
    }

    // 5) Wo du anderen am naechsten bist (das Archiv nennt das andere Ende).
    if (archiv.length >= 3){
      var summe = {}, n = 0;
      ORDER.forEach(function(f){ summe[f] = 0; });
      archiv.forEach(function(e){
        var andere = null;
        try{ andere = fromCode(e.otherCode); }catch(x){}
        if (!andere) return;
        n++;
        ORDER.forEach(function(f){ summe[f] += Math.abs(sc[f] - andere[f]); });
      });
      if (n >= 3){
        var naechst = ORDER.slice().sort(function(a,b){ return summe[a] - summe[b]; })[0];
        teile.push({titel: tx('js_ed_titel_naehe'),
          text: tx('js_ed_naehe_a') + LABELS[naechst] + tx('js_ed_naehe_b') + Math.round(summe[naechst]/n) +
                tx('js_ed_naehe_c') + n + tx('js_ed_naehe_d')});
      }
    }

    return '<div class="understand-group-label">'+tx('js_verstehen_daten_titel')+'</div>'+
      teile.map(function(t, i){
        return '<div class="understand-card understand-daten" style="animation-delay:'+(i*60)+'ms">'+
               '<h3>'+t.titel+'</h3><p>'+t.text+'</p></div>';
      }).join('');
  }
  // Ueber setDate(), nicht Millisekunden: An der Zeitumstellung hat ein Tag nicht 24 Stunden.
  function tagSchluesselVersetzt(ts, d){
    try{
      var x = new Date(ts);
      x.setDate(x.getDate() + d);
      return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
    }catch(e){ return ''; }
  }

// ---------- "Verstehen": profilbasierte Kurz-Einordnungen ----------
  function renderUnderstand(){
    var last = loadResult();
    var wrap = $('understandContent');
    if (!last){
      wrap.innerHTML = emptyStateHTML(tx('js_noch_kein_ergebnis_auf_die_2'), {btnId:'btnUnderstandStart', btnLabel:tx('js_test_starten_2')});
      $('btnUnderstandStart').addEventListener('click', function(){ beginRun(false); });
      return;
    }
    var arch = archetypeOf(last);
    var traitsToShow = [
      {f:arch.top1, pole: last[arch.top1]>=50?'high':'low'},
      {f:arch.top2, pole: last[arch.top2]>=50?'high':'low'}
    ];
    var html = traitsToShow.map(function(t){
      var cards = UNDERSTAND[t.f][t.pole];
      var groupLabel = LABELS[t.f]+' &middot; '+ADJ[t.f][t.pole];
      return '<div class="understand-group-label">'+groupLabel+'</div>'+
        cards.map(function(c,i){
          return '<div class="understand-card" style="animation-delay:'+(i*60)+'ms"><h3>'+c.title+'</h3><p>'+c.body+'</p></div>';
        }).join('');
    }).join('');
    // Runde 84: Die zwei Dimensionskarten sind frei. Das Zusammenspiel und der Teil aus den
    // eigenen Daten sind die gekaufte Fassung — beides entsteht erst aus mehr als einer
    // Messung bzw. aus dem Zusammenlesen mehrerer Werte.
    wrap.innerHTML = html +
      (istPlus() ? (kombiBlock(last) + eigeneDatenBlock(last))
                 : schlossHTML(tx('plus_verstehen'))) +
      tx('js_diese_einordnungen_fassen');
    schloesserVerdrahten(wrap);
  }

  // ---------- Kombinationen (Runde 82) ----------
  //
  // Bis hierher zeigte die Ansicht vier Karten zu den zwei staerksten Dimensionen, jede fuer
  // sich. Eine Dimension fuer sich ist aber nicht das, was jemand ueber sich erfahren will —
  // hohe Gewissenhaftigkeit liest sich mit hoher Offenheit voellig anders als mit niedriger.
  // Das Zusammenspiel ist die Stelle, an der aus fuenf Zahlen ein Bild wird.
  //
  // Die Tabelle deckt alle zehn Paare in allen vier Pol-Lagen ab, also vierzig Faelle. Bewusst
  // vollstaendig und nicht als Auswahl "besonders interessanter" Kombinationen: Sonst haetten
  // manche Menschen hier zwei Karten und andere keine — und die ohne waeren genau die, deren
  // Ergebnis seltener ist.
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

  // ---------- Was in den eigenen Daten steht (Runde 82, neu gefasst in Runde 97) ----------
  //
  // Rueckmeldung Runde 97: "zu generisch und nichtsaussagend". Sie war berechtigt, und der
  // Grund liess sich benennen: Von fuenf Befunden lasen DREI dieselben fuenf Zahlen noch
  // einmal vor — der deutlichste Wert, die Werte nahe der Mitte, der Abstand zwischen
  // hoechstem und niedrigstem. Alles drei steht bereits auf der Ergebnisseite, nur in anderen
  // Worten. Wer sie liest, erfaehrt nichts, was er nicht schon wusste, und "was in deinen
  // eigenen Daten steht" verspricht genau das Gegenteil.
  //
  // Was diese Ansicht tatsaechlich kann und keine andere Persoenlichkeits-App: Sie hat vier
  // verschiedene Quellen auf dem Geraet liegen — das Ergebnis, den Verlauf ueber Monate, die
  // Tagesform mit Uhrzeit und die gespeicherten Vergleiche. Ein Befund ist genau dann etwas
  // wert, wenn er ZWEI davon zusammenbringt. Danach sind die Karten jetzt gebaut.
  //
  // Ausdruecklich NICHT hierher gehoeren Wochentags- und Tageszeitmuster: Die stehen bereits
  // in der Tagesform-Ansicht, und derselbe Satz an zwei Stellen ist keine zweite Erkenntnis.
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

    // 1) Die Form des Profils. Eine Karte statt der bisherigen drei, und sie sagt nicht, WAS
    //    dasteht, sondern was daraus fuer das Lesen des Restes folgt. Das ist der Unterschied
    //    zwischen einer Wiederholung und einer Einordnung.
    var hoch = ORDER.reduce(function(a,f){ return sc[f] > sc[a] ? f : a; }, ORDER[0]);
    var tief = ORDER.reduce(function(a,f){ return sc[f] < sc[a] ? f : a; }, ORDER[0]);
    var spanne = sc[hoch] - sc[tief];
    var deutlich = ORDER.filter(function(f){ return Math.abs(sc[f]-50) > 10; }).length;
    teile.push({titel: tx('js_ed_titel_form'),
      text: tx('js_ed_form_a') + spanne + tx('js_ed_form_b') + LABELS[hoch] + tx('js_ed_form_c') +
            LABELS[tief] + tx('js_ed_form_d') + deutlich + tx('js_ed_form_e') +
            (spanne >= 40 ? tx('js_ed_form_weit') : (spanne <= 20 ? tx('js_ed_form_eng') : tx('js_ed_form_mittel')))});

    // 2) Haengen Energie und Stimmung bei dir zusammen? Zwei Angaben, die dieselbe Person an
    //    denselben Tagen gemacht hat — daraus laesst sich etwas sagen, was in keiner der
    //    beiden allein steht. Verglichen wird an der eigenen Mitte und nicht an der
    //    Skalenmitte: Wer nie unter 3 geht, haette sonst nur "hohe" Tage.
    //
    //    Zehn Tage sind die Untergrenze. Darunter entscheidet ein einzelner Tag ueber mehr als
    //    zehn Prozentpunkte, und eine Zahl, die so wackelt, ist keine Aussage.
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

    // 3) An was fuer Tagen hast du eigentlich getestet? Der Befund, den ich in keiner anderen
    //    App gesehen habe, und der einzige hier, der das Ergebnis selbst in Frage stellt: Wer
    //    seine Durchlaeufe regelmaessig an guten Tagen macht, misst nicht sich, sondern seine
    //    guten Tage.
    //
    //    Zugeordnet wird mit einem Tag Spielraum in beide Richtungen. Genau am Testtag einen
    //    Eintrag zu haben ist zu selten, als dass daraus je etwas wuerde; zwei Tage waeren zu
    //    weit, weil dazwischen ein Wochenende liegen kann.
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

    // 4) Was steht fest, was wandert. Erst ab DREI Durchlaeufen: Bei zweien ist jede Differenz
    //    ein einzelner Vergleich, und "am stabilsten" waere ein Superlativ ueber eine einzige
    //    Zahl. Genannt werden beide Enden, weil das eine ohne das andere nichts wiegt.
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

    // 5) Wo du anderen am NAECHSTEN bist. Die Archiv-Ansicht nennt die Dimension, in der du am
    //    weitesten entfernt liegst; hier steht das andere Ende. Zwei Ansichten, die dieselbe
    //    Zahl aus derselben Richtung vorlesen, waeren eine zu viel.
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
  // Der Tagesschluessel zu einem Zeitpunkt, um d Tage versetzt. Ueber setDate() und nicht ueber
  // Millisekunden: An einer Zeitumstellung hat ein Tag nicht 24 Stunden, und ein Aufschlag von
  // d*86400000 landet dann auf dem falschen Datum — genau an den zwei Tagen im Jahr, an denen
  // niemand nachsieht.
  function tagSchluesselVersetzt(ts, d){
    try{
      var x = new Date(ts);
      x.setDate(x.getDate() + d);
      return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
    }catch(e){ return ''; }
  }

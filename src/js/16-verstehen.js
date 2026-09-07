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

  // ---------- Was in den eigenen Daten steht (Runde 82) ----------
  //
  // Der Teil, den keine andere Persoenlichkeits-App haben kann: Lucenta hat den Verlauf, die
  // Tagesform und das Vergleichsarchiv bereits auf dem Geraet. Hier wird daraus gelesen statt
  // erklaert — und zwar ausschliesslich das, was tatsaechlich vorliegt. Jeder Befund nennt die
  // Zahl, auf der er beruht; keiner erscheint, solange die Grundlage fehlt.
  function eigeneDatenBlock(sc){
    var teile = [];

    // 1) Wie deutlich ist das Ergebnis ueberhaupt? Ohne Bevoelkerungsnorm kann die App NICHT
    //    sagen, wie du im Vergleich zu anderen liegst — nur, wie weit die Werte von der Mitte
    //    der Skala weg sind. Genau so steht es da.
    var weit = ORDER.map(function(f){ return {f:f, d:Math.abs(sc[f]-50)}; })
                    .sort(function(a,b){ return b.d - a.d; });
    teile.push({titel: tx('js_ed_titel_deutlichkeit'),
      text: tx('js_ed_deutlich_a') + LABELS[weit[0].f] + tx('js_ed_deutlich_b') + sc[weit[0].f] +
            tx('js_ed_deutlich_c') + Math.round(weit[0].d) + tx('js_ed_deutlich_d')});

    // 2) Werte nahe der Mitte. Der haeufigste Lesefehler eines Big-Five-Ergebnisses: einen Wert
    //    um 50 fuer "nichts davon" zu halten. Er ist eine eigene Aussage, keine fehlende.
    var mitte = ORDER.filter(function(f){ return Math.abs(sc[f]-50) <= 10; });
    if (mitte.length){
      teile.push({titel: tx('js_ed_titel_mitte'),
        text: tx('js_ed_mitte_a') + mitte.map(function(f){ return LABELS[f]; }).join(', ') +
              tx('js_ed_mitte_b')});
    }

    // 3) Wie weit das Profil auseinanderliegt. Braucht nichts ausser dem einen Ergebnis und ist
    //    deshalb die Karte, die auch beim allerersten Durchlauf schon etwas sagt — ohne sie
    //    stuende hier bei manchen Menschen genau EINE Karte unter einer Ueberschrift im Plural.
    var hoch = ORDER.reduce(function(a,f){ return sc[f] > sc[a] ? f : a; }, ORDER[0]);
    var tief = ORDER.reduce(function(a,f){ return sc[f] < sc[a] ? f : a; }, ORDER[0]);
    var spanne = sc[hoch] - sc[tief];
    teile.push({titel: tx('js_ed_titel_spanne'),
      text: tx('js_ed_spanne_a') + LABELS[hoch] + tx('js_ed_spanne_b') + LABELS[tief] +
            tx('js_ed_spanne_c') + spanne + tx('js_ed_spanne_d') +
            (spanne >= 40 ? tx('js_ed_spanne_weit') : (spanne <= 20 ? tx('js_ed_spanne_eng') : tx('js_ed_spanne_mittel')))});

    // 4) Bewegung ueber die Durchlaeufe. Erst ab zwei, sonst gibt es nichts zu vergleichen.
    var hist = [];
    try{ hist = loadHistory(); }catch(e){}
    if (hist.length >= 2){
      var erst = hist[0].scores, letzt = hist[hist.length-1].scores;
      var beweg = ORDER.map(function(f){ return {f:f, d: letzt[f]-erst[f]}; })
                       .sort(function(a,b){ return Math.abs(b.d) - Math.abs(a.d); })[0];
      var tageDazwischen = Math.max(1, Math.round((hist[hist.length-1].date - hist[0].date) / 86400000));
      var satz = tx('js_ed_bewegung_a') + hist.length + tx('js_ed_bewegung_b') + tageDazwischen + tx('js_ed_bewegung_c');
      satz += Math.abs(beweg.d) < 5
        ? tx('js_ed_bewegung_ruhig')
        : (tx('js_ed_bewegung_d') + LABELS[beweg.f] + tx('js_ed_bewegung_e') + erst[beweg.f] +
           tx('js_ed_bewegung_f') + letzt[beweg.f] + tx('js_ed_bewegung_g'));
      teile.push({titel: tx('js_ed_titel_bewegung'), text: satz});
    }

    // 5) Aus dem Vergleichsarchiv. Erst ab drei — dieselbe Untergrenze, die das Archiv selbst
    //    fuer seine Auswertung setzt.
    var archiv = [];
    try{ archiv = loadCompatArchive(); }catch(e){}
    if (archiv.length >= 3){
      var mittel = Math.round(archiv.reduce(function(a,e){ return a + (e.match||0); }, 0) / archiv.length);
      teile.push({titel: tx('js_ed_titel_vergleiche'),
        text: tx('js_ed_vergleiche_a') + archiv.length + tx('js_ed_vergleiche_b') + mittel +
              tx('js_ed_vergleiche_c')});
    }

    return '<div class="understand-group-label">'+tx('js_verstehen_daten_titel')+'</div>'+
      teile.map(function(t, i){
        return '<div class="understand-card understand-daten" style="animation-delay:'+(i*60)+'ms">'+
               '<h3>'+t.titel+'</h3><p>'+t.text+'</p></div>';
      }).join('');
  }

  
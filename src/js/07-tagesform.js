// ---------- Tagesform / State-Check view ----------
  var statePickedEnergy = null, statePickedValence = null;
  function buildScaleRow(container, picked, labelPrefix, onPick){
    container.innerHTML='';
    for (var v=1; v<=5; v++){
      var b = document.createElement('button');
      var isPicked = picked===v;
      b.className='scale-btn'+(isPicked?' picked':'');
      b.setAttribute('aria-label', labelPrefix+' '+v+tx('js_von'));
      b.setAttribute('aria-pressed', isPicked?'true':'false');
      b.innerHTML='<span class="fill"></span>';
      (function(val){ b.addEventListener('click', function(){ onPick(val); }); })(v);
      container.appendChild(b);
    }
  }
  function renderStateRows(){
    buildScaleRow($('stateEnergyRow'), statePickedEnergy, tx('js_energie'), function(v){ statePickedEnergy=v; renderStateRows(); });
    buildScaleRow($('stateValenceRow'), statePickedValence, tx('js_stimmung'), function(v){ statePickedValence=v; renderStateRows(); });
  }

  // Feedback: Tagesform sollte nicht in der Schublade, sondern kreativ direkt auf der Startseite
  // ankommen. Eigene, kleine Kopie der Pick-/Auto-Speicher-Logik statt die state-Variablen der
  // vollständigen Tagesform-Ansicht (statePickedEnergy/Valence) zu teilen — beide Stellen dürfen
  // unabhängig voneinander offen sein bzw. rendern, ohne sich gegenseitig zu überschreiben.
  var landingStatePickedEnergy = null, landingStatePickedValence = null;
  function renderLandingStateRows(){
    buildScaleRow($('landingStateEnergyRow'), landingStatePickedEnergy, tx('js_energie_heute'), function(v){ landingStatePickedEnergy=v; renderLandingStateRows(); maybeSaveLandingState(); });
    buildScaleRow($('landingStateValenceRow'), landingStatePickedValence, tx('js_stimmung_heute'), function(v){ landingStatePickedValence=v; renderLandingStateRows(); maybeSaveLandingState(); });
  }
  function updateLandingStateCopy(){
    // Auch nach der ERSTEN Antwort passierte bislang sichtbar nichts — die zweite Frage stand
    // schon da, es gab keinen Hinweis, dass der erste Antippen angekommen war. Jetzt benennt die
    // Zeile, was noch fehlt; das ist keine Aufforderung, sondern eine Quittung.
    var e = landingStatePickedEnergy, v = landingStatePickedValence;
    $('landingStateCopy').textContent =
      (e && !v) ? tx('js_energie_ist_notiert__fehlt') :
      (v && !e) ? tx('js_stimmung_ist_notiert__fehl') :
      tx('js_kurzer_check_von_energie');
  }
  // Wechselt die Karte in den Erledigt-Zustand. `animate` nur direkt nach dem Speichern: beim
  // Zurückkehren auf die Startseite ist es kein Ereignis mehr, und eine Bestätigung, die sich
  // ohne Anlass wiederholt, verliert ihre Bedeutung.
  function showLandingStateDone(entry, animate){
    $('landingStateInputs').style.display = 'none';
    $('landingStateCopy').style.display = 'none';
    var done = $('landingStateDone');
    // Ohne „/5": Die Skala hat man gerade selbst angetippt, und die Kurzform bleibt neben der
    // „Ändern"-Schaltfläche einzeilig, statt umzubrechen.
    $('landingStateDoneVals').textContent =
      tx('js_energie_praefix')+tagWert(entry.energy)+tx('js_trenner_stimmung')+tagWert(entry.valence)+
      (entry.anzahl > 1 ? (' ' + tx('js_mittel_aus_a') + entry.anzahl + tx('js_mittel_aus_b')) : '');
    done.style.display = 'flex';
    done.classList.remove('just-saved');
    if (animate){
      // Neustart der Animation erzwingen, falls am selben Tag mehrfach geändert wird
      void done.offsetWidth;
      done.classList.add('just-saved');
    }
  }
  function showLandingStateInputs(){
    $('landingStateDone').style.display = 'none';
    $('landingStateInputs').style.display = '';
    $('landingStateCopy').style.display = '';
    updateLandingStateCopy();
  }
  function maybeSaveLandingState(){
    if (!landingStatePickedEnergy || !landingStatePickedValence){ updateLandingStateCopy(); return; }
    var ok = addStateEntry(landingStatePickedEnergy, landingStatePickedValence);
    if (!ok){
      toast(tx('js_konnte_nicht_gespeichert_w'));
      return;
    }
    // Kein Erfolgs-Toast mehr: Die Karte bestätigt jetzt selbst, an der Stelle, auf die
    // tatsächlich geschaut wird. Zwei Bestätigungen für dasselbe wären Lärm.
    //
    // Runde 82: Gezeigt wird der zusammengefasste Stand des Tages, nicht das eben Angetippte.
    // Beim zweiten Eintrag eines Tages sind das verschiedene Zahlen, und die richtige ist die
    // zusammengefasste — sonst behauptete die Karte, der Tag stehe bei 4, obwohl er im Mittel
    // bei 3 steht.
    showLandingStateDone(todayStateEntry(), true);
    landingStatePickedEnergy = null; landingStatePickedValence = null;
    renderLandingStateRows();
    refreshDrawerState();
  }
  function renderLandingStateTeaser(){
    var today = todayStateEntry();
    // Die Skalen stehen beim Wiederkommen leer: Ein weiterer Eintrag ist ein NEUER Eintrag,
    // keine Korrektur des alten. Vorbelegte Werte wuerden das Gegenteil nahelegen.
    landingStatePickedEnergy = null;
    landingStatePickedValence = null;
    renderLandingStateRows();
    if (today){ showLandingStateDone(today, false); }
    else { showLandingStateInputs(); }
  }
  // Runde 68: Die Brücke zwischen Tagesform und Profil.
  //
  // Die App behauptet an mehreren Stellen, die Tagesform sei "unabhängig von deinem stabilen
  // Testergebnis" — eingelöst war dieser Zusammenhang aber nirgends. Hier steht er zum ersten
  // Mal, und zwar mit ausdrücklich benannten Grenzen: Aus drei Wochen eigener Einträge folgt
  // kein Zusammenhang, und das steht auch so da. Der Grundsatz "Was nicht geprüft ist, wird als
  // ungeprüft benannt" gilt gerade dort, wo eine Zahl nach Beweis aussieht.
  //
  // Zwei Beobachtungen, beide nur bei genug Daten:
  //   - Schwankungsbreite (Standardabweichung) neben dem eigenen Stabilitätswert. Ab 7 Tagen.
  //   - Wochentagsmuster: der Tag mit der im Schnitt höchsten und niedrigsten Energie. Ab 14
  //     Tagen UND mindestens zwei Messungen je verglichenem Wochentag — sonst vergliche man
  //     einen einzelnen Dienstag mit einem einzelnen Freitag und nennte das ein Muster.
  function streuung(werte){
    var n = werte.length;
    if (n < 2) return 0;
    var m = werte.reduce(function(a,b){ return a+b; }, 0) / n;
    var q = werte.reduce(function(a,b){ return a + (b-m)*(b-m); }, 0) / (n-1);
    return Math.sqrt(q);
  }

  function tagesformBefunde(hist){
    var teile = [];
    // Runde 82: Gerechnet wird auf TAGEN, nicht auf Eintraegen. Sonst haette jemand mit drei
    // Eintraegen am Tag nach zweieinhalb Tagen einen "7-Tage-Befund" — und ein Tag mit drei
    // Eintraegen zaehlte im Wochentagsmuster dreimal.
    var tage = stateTage(hist);
    if (tage.length < 7) return teile;

    // 1) Schwankungsbreite neben dem Stabilitätswert
    var sE = streuung(tage.map(function(e){ return e.energy; }));
    var sS = streuung(tage.map(function(e){ return e.valence; }));
    var res = loadResult();
    var satz = tx('js_befund_schwankung_a') + tage.length + tx('js_befund_schwankung_b') +
               zahl1(sE) + tx('js_befund_schwankung_c') + zahl1(sS) + tx('js_befund_schwankung_d');
    if (res && typeof res.S === 'number'){
      satz += ' ' + tx('js_befund_stabil_a') + res.S + tx('js_befund_stabil_b');
    }
    satz += ' ' + tx('js_befund_grenze');
    teile.push({titel: tx('js_befund_titel_schwankung'), text: satz});

    // 2) Wochentagsmuster
    if (tage.length >= 14){
      var proTag = [];
      for (var i=0;i<7;i++) proTag.push([]);
      tage.forEach(function(e){
        var d;
        try{ d = new Date(e.ts).getDay(); }catch(x){ return; }
        if (typeof d === 'number') proTag[d].push(e.energy);
      });
      var kandidaten = [];
      for (var t=0;t<7;t++){
        if (proTag[t].length >= 2){
          var m = proTag[t].reduce(function(a,b){ return a+b; },0) / proTag[t].length;
          kandidaten.push({tag:t, mittel:m, anzahl:proTag[t].length});
        }
      }
      if (kandidaten.length >= 3){
        kandidaten.sort(function(a,b){ return b.mittel - a.mittel; });
        var hoch = kandidaten[0], tief = kandidaten[kandidaten.length-1];
        // Ein Unterschied unter einem halben Skalenpunkt ist bei einer Fünferskala Rauschen.
        if (hoch.mittel - tief.mittel >= 0.5){
          teile.push({titel: tx('js_befund_titel_wochentag'),
            text: tx('js_befund_wochentag_a') + wochentagName(hoch.tag) + tx('js_befund_wochentag_b') +
                  wochentagName(tief.tag) + tx('js_befund_wochentag_c')});
        }
      }
    }

    // 3) Tageszeit. Erst moeglich, seit ein Tag mehrere Eintraege tragen kann (Runde 82) — und
    //    der Befund, der am unmittelbarsten etwas mit dem eigenen Tag zu tun hat: Wann jemand
    //    hoch und wann niedrig liegt, laesst sich anders einteilen als welcher Wochentag es ist.
    //
    //    Die Huerden sind dieselben wie beim Wochentagsmuster und aus demselben Grund: mindestens
    //    drei Messungen JE verglichenem Abschnitt (sonst vergleicht man zwei Einzelmessungen und
    //    nennt es Muster) und mindestens ein halber Skalenpunkt Unterschied (darunter ist es bei
    //    einer Fuenferskala Rauschen).
    var proAbschnitt = {morgen:[], mittag:[], abend:[]};
    hist.forEach(function(e){
      if (proAbschnitt[e.slot]) proAbschnitt[e.slot].push(e.energy);
    });
    var abKand = ['morgen','mittag','abend'].filter(function(k){ return proAbschnitt[k].length >= 3; })
      .map(function(k){
        var w = proAbschnitt[k];
        return {slot:k, mittel: w.reduce(function(a,b){ return a+b; },0) / w.length, anzahl:w.length};
      });
    if (abKand.length >= 2){
      abKand.sort(function(a,b){ return b.mittel - a.mittel; });
      var aHoch = abKand[0], aTief = abKand[abKand.length-1];
      if (aHoch.mittel - aTief.mittel >= 0.5){
        teile.push({titel: tx('js_befund_titel_tageszeit'),
          text: tx('js_befund_tageszeit_a') + tx('js_abschnitt_'+aHoch.slot) + tx('js_befund_tageszeit_b') +
                tx('js_abschnitt_'+aTief.slot) + tx('js_befund_tageszeit_c') +
                zahl1(aHoch.mittel - aTief.mittel) + tx('js_befund_tageszeit_d')});
      }
    }
    return teile;
  }

  // Ein Tag mit einem Eintrag ist eine ganze Zahl und soll auch so dastehen: "4/5", nicht
  // "4,0/5". Eine Nachkommastelle, die immer 0 ist, behauptet eine Genauigkeit, die die Angabe
  // nicht hat — erst der Mittelwert aus mehreren Eintraegen hat sie wirklich.
  function tagWert(v){
    return Math.abs(v - Math.round(v)) < 0.001 ? String(Math.round(v)) : zahl1(v);
  }

  function zahl1(v){
    var s = (Math.round(v*10)/10).toFixed(1);
    return tx('datum_gebietsschema').indexOf('de') === 0 ? s.replace('.', ',') : s;
  }

  var WOCHENTAG_FMT = null;
  function wochentagName(index){
    // Über Intl statt über eine eigene Liste: Die Namen kommen damit aus derselben Quelle wie
    // das Datumsformat und stimmen in jeder Sprache, ohne dass sie im Sprachpaket doppelt
    // gepflegt werden müssen.
    try{
      if (!WOCHENTAG_FMT) WOCHENTAG_FMT = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {weekday:'long'});
      // 2024-01-07 war ein Sonntag; +index trifft damit den gesuchten Wochentag.
      return WOCHENTAG_FMT.format(new Date(Date.UTC(2024, 0, 7 + index)));
    }catch(e){ return ''; }
  }
  function resetWochentagFmt(){ WOCHENTAG_FMT = null; }

  function renderStateView(){
    var today = todayStateEntry();
    // Wie auf der Startseite: leere Skalen, weil ein weiterer Eintrag ein neuer ist.
    statePickedEnergy = null;
    statePickedValence = null;
    $('stateTodayNote').textContent = !today
      ? tx('js_heute_noch_nicht_erfasst')
      : (today.anzahl > 1
          ? (tx('js_heute_schon_a') + today.anzahl + tx('js_heute_schon_b'))
          : tx('js_heute_bereits_erfasst__du'));
    renderStateRows();
    renderStateTrend();
  }
  function renderStateTrend(){
    var alleEintraege = loadStateHistory();
    // Runde 84: Die freie Fassung zeigt die letzten vierzehn Tage und keine Befunde. Vierzehn
    // ist nicht gegriffen — der erste Befund braucht sieben Tage, der zweite vierzehn. Wer die
    // Grenze erreicht, hat also gerade gesehen, dass es hier etwas zu holen gibt. Eingetragen
    // bleibt alles; die freie Fassung zeigt weniger, sie nimmt nichts weg.
    var plus = istPlus();
    var alleTage = stateTage(alleEintraege);
    var verborgeneTage = plus ? 0 : Math.max(0, alleTage.length - FREI_TAGE);
    var eintraege = alleEintraege;
    if (verborgeneTage){
      var sichtbar = {};
      alleTage.slice(-FREI_TAGE).forEach(function(t){ sichtbar[t.day] = 1; });
      eintraege = alleEintraege.filter(function(e){ return sichtbar[e.day]; });
    }
    // Diagramm und Liste zeigen TAGE. Ein Tag mit drei Eintraegen ist ein Punkt auf der Linie,
    // kein dreifaches Gewicht — die Linie beschreibt den Verlauf ueber Tage, nicht ueber Tipps.
    var hist = stateTage(eintraege);
    var wrap = $('stateTrendContent');
    if (hist.length===0){
      wrap.innerHTML = emptyStateHTML(tx('js_noch_keine_tagesform_erfas'));
      return;
    }
    if (hist.length<2){
      // Feedback-Runde 47: derselbe Fall wie im Testverlauf — der bereits erfasste Tag wurde
      // nicht angezeigt, sondern durch einen Leerzustand ersetzt.
      var sf = historyDateFmt(), s1 = hist[0];
      var sd = ''; try{ sd = sf.format(new Date(s1.ts)); }catch(ex){ sd = s1.day; }
      wrap.innerHTML =
        '<div class="history-list"><div class="history-row">'+
          '<div class="history-date">'+sd+'</div>'+
          tx('js_html_energie')+tagWert(s1.energy)+'/5'+tx('js_trenner_stimmung_html')+tagWert(s1.valence)+'/5</div>'+
        '</div></div>'+
        tx('js_erster_eintrag_steht_ab_de');
      return;
    }
    var lastE = tagWert(hist[hist.length-1].energy), lastV = tagWert(hist[hist.length-1].valence);
    // Höchstens 30 Tage: Darüber hinaus wird der Abstand zwischen zwei Tagen so klein, dass die
    // Linie zur Textur wird und die einzelne Angabe nicht mehr ablesbar ist.
    var fenster = hist.slice(-30);
    var tage = fenster.length;
    // Legende bei zwei Reihen immer, damit die Zuordnung nie allein an der Farbe hängt — ein
    // farbiges Plättchen NEBEN dem Wort, nicht das Wort in der Farbe.
    var legende =
      '<div class="verlauf-legende">'+
        '<span class="vl-eintrag"><span class="vl-punkt vl-energie"></span>'+tx('js_energie')+
          '<b class="mono vl-energie-wert">'+lastE+'</b></span>'+
        '<span class="vl-eintrag"><span class="vl-punkt vl-stimmung"></span>'+tx('js_stimmung')+
          '<b class="mono vl-stimmung-wert">'+lastV+'</b></span>'+
        '<span class="vl-datum mono">'+tx('js_heute')+'</span>'+
      '</div>';
    var trendRows =
      legende +
      '<div class="verlauf-flaeche">'+
        '<div class="verlauf-skala"><span>5</span><span>1</span></div>'+
        verlaufDiagrammSVG(fenster, 320, 150)+
      '</div>'+
      '<div class="verlauf-achse"><span>'+(tage>1 ? (tx('js_vor_tagen')+(tage-1)+tx('js_tagen')) : '')+
        '</span><span>'+tx('js_heute')+'</span></div>';
    var fmt = historyDateFmt();
    var listRows = hist.slice().reverse().slice(0,14).map(function(e){
      var dateStr;
      try{ dateStr = fmt.format(new Date(e.ts)); }catch(ex){ dateStr = e.day; }
      return '<div class="history-row"><div class="history-date">'+dateStr+
             (e.anzahl > 1 ? ' <span class="tf-anzahl mono">'+e.anzahl+'&times;</span>' : '')+
             '</div><div class="history-title">'+tx('js_energie')+' '+tagWert(e.energy)+'/5 &middot; '+
             tx('js_stimmung')+' '+tagWert(e.valence)+'/5</div></div>';
    }).join('');
    wrap.innerHTML = '<div class="trend-list">'+trendRows+'</div>'+
      tx('js_letzte_einträge')+hist.length+'</span></h2>'+
      '<div class="history-list">'+listRows+'</div>';
    // Die Befunde sind der Kern der gekauften Fassung: Sie sind das, was aus mehreren Messungen
    // entsteht, und genau daran verlaeuft die Grenze.
    if (!plus){
      var stelle = wrap.querySelector('.section-title-sub') || wrap.querySelector('.history-list');
      var hinweis = schlossHTML(verborgeneTage
        ? (tx('plus_tagesform_a') + verborgeneTage + tx('plus_tagesform_b'))
        : tx('plus_tagesform_kurz'));
      if (stelle) stelle.insertAdjacentHTML('beforebegin', hinweis);
      else wrap.insertAdjacentHTML('beforeend', hinweis);
      schloesserVerdrahten(wrap);
      verlaufAblesenAktivieren(wrap.querySelector('.verlauf-flaeche'), fenster, fmt);
      return;
    }
    var befunde = tagesformBefunde(eintraege);
    if (befunde.length){
      var block = '<h2 class="section-title section-title-sub">'+tx('js_befunde_titel')+'</h2>'+
        '<div class="befund-liste">'+befunde.map(function(b){
          return '<div class="befund"><div class="befund-titel">'+b.titel+'</div>'+
                 '<p class="befund-text">'+b.text+'</p></div>';
        }).join('')+'</div>';
      // Zwischen Diagramm und Einzelliste: erst das Bild, dann was darin steht, dann die Belege.
      // Der Einschub muss VOR die Ueberschrift "Letzte Eintraege", nicht vor deren Liste — sonst
      // steht die Ueberschrift oberhalb der Befunde und ihre eigene Liste darunter, getrennt
      // durch fremden Text. Genau das war im ersten Versuch zu sehen.
      var ueberschrift = wrap.querySelector('.section-title-sub');
      var liste = wrap.querySelector('.history-list');
      var ziel = ueberschrift || liste;
      if (ziel) ziel.insertAdjacentHTML('beforebegin', block);
      else wrap.insertAdjacentHTML('beforeend', block);
    }
    verlaufAblesenAktivieren(wrap.querySelector('.verlauf-flaeche'), fenster, fmt);
  }

  
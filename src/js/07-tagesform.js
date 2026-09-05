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
    buildScaleRow($('stateEnergyRow'), statePickedEnergy, 'Energie', function(v){ statePickedEnergy=v; renderStateRows(); });
    buildScaleRow($('stateValenceRow'), statePickedValence, 'Stimmung', function(v){ statePickedValence=v; renderStateRows(); });
  }

  // Feedback: Tagesform sollte nicht in der Schublade, sondern kreativ direkt auf der Startseite
  // ankommen. Eigene, kleine Kopie der Pick-/Auto-Speicher-Logik statt die state-Variablen der
  // vollständigen Tagesform-Ansicht (statePickedEnergy/Valence) zu teilen — beide Stellen dürfen
  // unabhängig voneinander offen sein bzw. rendern, ohne sich gegenseitig zu überschreiben.
  var landingStatePickedEnergy = null, landingStatePickedValence = null;
  function renderLandingStateRows(){
    buildScaleRow($('landingStateEnergyRow'), landingStatePickedEnergy, 'Energie heute', function(v){ landingStatePickedEnergy=v; renderLandingStateRows(); maybeSaveLandingState(); });
    buildScaleRow($('landingStateValenceRow'), landingStatePickedValence, 'Stimmung heute', function(v){ landingStatePickedValence=v; renderLandingStateRows(); maybeSaveLandingState(); });
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
    $('landingStateDoneVals').textContent = tx('js_energie_praefix')+entry.energy+tx('js_trenner_stimmung')+entry.valence;
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
    var ok = upsertStateToday(landingStatePickedEnergy, landingStatePickedValence);
    if (!ok){
      toast(tx('js_konnte_nicht_gespeichert_w'));
      return;
    }
    // Kein Erfolgs-Toast mehr: Die Karte bestätigt jetzt selbst, an der Stelle, auf die
    // tatsächlich geschaut wird. Zwei Bestätigungen für dasselbe wären Lärm.
    showLandingStateDone({energy:landingStatePickedEnergy, valence:landingStatePickedValence}, true);
    refreshDrawerState();
  }
  function renderLandingStateTeaser(){
    var today = todayStateEntry();
    landingStatePickedEnergy = today ? today.energy : null;
    landingStatePickedValence = today ? today.valence : null;
    renderLandingStateRows();
    if (today){ showLandingStateDone(today, false); }
    else { showLandingStateInputs(); }
  }
  function renderStateView(){
    var today = todayStateEntry();
    statePickedEnergy = today ? today.energy : null;
    statePickedValence = today ? today.valence : null;
    $('stateTodayNote').textContent = today
      ? tx('js_heute_bereits_erfasst__du')
      : tx('js_heute_noch_nicht_erfasst');
    renderStateRows();
    renderStateTrend();
  }
  function renderStateTrend(){
    var hist = loadStateHistory();
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
          tx('js_html_energie')+s1.energy+'/5'+tx('js_trenner_stimmung_html')+s1.valence+'/5</div>'+
        '</div></div>'+
        tx('js_erster_eintrag_steht_ab_de');
      return;
    }
    var energyVals = hist.map(function(e){ return (e.energy-1)/4*100; });
    var valenceVals = hist.map(function(e){ return (e.valence-1)/4*100; });
    var lastE = hist[hist.length-1].energy, lastV = hist[hist.length-1].valence;
    var trendRows =
      '<div class="trend-row"><div class="trend-label">Energie</div>'+sparklineSVG(energyVals,140,32)+'<div class="trend-val mono">'+lastE+'</div></div>'+
      '<div class="trend-row"><div class="trend-label">Stimmung</div>'+sparklineSVG(valenceVals,140,32)+'<div class="trend-val mono">'+lastV+'</div></div>';
    var fmt = historyDateFmt();
    var listRows = hist.slice().reverse().slice(0,14).map(function(e){
      var dateStr;
      try{ dateStr = fmt.format(new Date(e.ts)); }catch(ex){ dateStr = e.day; }
      return '<div class="history-row"><div class="history-date">'+dateStr+'</div><div class="history-title">Energie '+e.energy+'/5 &middot; Stimmung '+e.valence+'/5</div></div>';
    }).join('');
    wrap.innerHTML = '<div class="trend-list">'+trendRows+'</div>'+
      tx('js_letzte_einträge')+hist.length+'</span></h2>'+
      '<div class="history-list">'+listRows+'</div>';
  }

  
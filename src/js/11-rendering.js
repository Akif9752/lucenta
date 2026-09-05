// ---------- rendering ----------
  // Setzt bzw. entfernt die Fortschritts-Semantik des Fokus-Strichs. `null` heißt: keine Ansicht
  // mit Fortschritt — dann verschwinden Rolle und Werte wieder vollständig, statt außerhalb des
  // Quiz einen eingefrorenen Fortschritt von 0 % oder 100 % anzukündigen.
  function setFocuslineProgress(index){
    var el = $('focusline');
    if (!el) return;
    if (index === null){
      el.removeAttribute('role');
      el.removeAttribute('aria-valuemin');
      el.removeAttribute('aria-valuemax');
      el.removeAttribute('aria-valuenow');
      el.removeAttribute('aria-valuetext');
      el.removeAttribute('aria-label');
      return;
    }
    el.setAttribute('role','progressbar');
    el.setAttribute('aria-label',tx('js_fortschritt_im_test'));
    el.setAttribute('aria-valuemin','0');
    el.setAttribute('aria-valuemax','50');
    el.setAttribute('aria-valuenow', String(index));
    el.setAttribute('aria-valuetext', index + tx('js_von__fragen_beantwortet'));
  }

  function renderQuestion(){
    var it = ITEMS[qi];
    $('qNow').textContent = (qi+1);
    $('qText').textContent = it.text;
    $('focusline-fill').style.width = Math.round((qi/50)*100)+'%';
    // Backlog Runde 27, Punkt 3: Der Fokus-Strich war bislang rein visuell. Wer mit Screenreader
    // testet, bekam den Fortschritt nur über den Textzähler "Frage x von 50" mit — die Leiste selbst
    // war semantisch nichts. Sie trägt die Rolle jetzt genau dann, wenn sie tatsächlich Fortschritt
    // anzeigt (nur im Quiz); auf allen anderen Ansichten ist sie reine Zierde und bleibt es auch.
    setFocuslineProgress(qi);
    var row = $('scaleRow'); row.innerHTML='';
    for (var v=1; v<=5; v++){
      var b = document.createElement('button');
      var isPicked = answers[qi]===v;
      b.className='scale-btn'+(isPicked?' picked':'');
      b.setAttribute('aria-label',tx('js_wert')+v+tx('js_von'));
      b.setAttribute('aria-pressed', isPicked ? 'true':'false');
      b.innerHTML='<span class="fill"></span>';
      (function(val){
        b.addEventListener('click', function(){ selectAnswer(val); });
      })(v);
      row.appendChild(b);
    }
    $('btnPrev').style.visibility = qi===0 ? 'hidden':'visible';
    $('qHint').textContent = QUIZ_HINTS[Math.min(4, Math.floor(qi/10))];
  }




  var quizAdvanceTimeout = null;
  // Lässt die neue Frage hereinkommen. Das Entfernen und erneute Setzen der Klasse ist nötig,
  // damit der Browser die Animation überhaupt als neu erkennt — sonst liefe sie nur beim
  // allerersten Mal. Das erzwungene Auslesen von offsetWidth dazwischen ist genau dafür da.
  function animateQuestionIn(){
    var c = $('qCard');
    if (!c || !c.classList) return;
    c.classList.remove('q-in');
    try{ void c.offsetWidth; }catch(e){}
    c.classList.add('q-in');
  }
  function disarmQuizAdvance(){
    if (quizAdvanceTimeout){ clearTimeout(quizAdvanceTimeout); quizAdvanceTimeout = null; }
  }
  function selectAnswer(v){
    answers[qi] = v;
    saveProgress();
    renderQuestion();
    // Vorherigen ausstehenden Übergang verwerfen, statt ihn zusätzlich laufen zu lassen —
    // sonst würde ein schneller Doppel-Klick/Doppel-Tastendruck qi zweimal erhöhen und
    // eine Frage überspringen.
    disarmQuizAdvance();
    quizAdvanceTimeout = setTimeout(function(){
      quizAdvanceTimeout = null;
      // Falls die Nutzerin inzwischen manuell zu einer anderen Ansicht gewechselt hat,
      // nicht mehr automatisch weiterschalten oder das Ergebnis erzwingen.
      var quizView = $('view-quiz');
      if (!quizView || !quizView.classList.contains('active')) return;
      if (qi<49){
        qi++; renderQuestion();
        animateQuestionIn();
        saveProgress();
        if (QUIZ_MILESTONES[qi]) toast(QUIZ_MILESTONES[qi]);
      }
      else { finishQuiz(); }
    }, 220);
  }

  function finishQuiz(){
    var previous = loadResult();
    scores = computeScores();
    // Das Muster-Kennzeichen reist als eigene Eigenschaft am Ergebnis mit, statt aus `answers`
    // neu berechnet zu werden: beim späteren Öffnen eines gespeicherten Ergebnisses ist `answers`
    // längst zurückgesetzt, eine Neuberechnung würde dann fälschlich "gleichförmig" ergeben.
    // Die Eigenschaft liegt außerhalb der fünf ORDER-Schlüssel und stört deshalb weder loadResult()
    // noch toCode() oder den Vergleich — ein über Code wiederhergestelltes Ergebnis trägt sie
    // schlicht nicht, was korrekt ist: dort ist das Antwortmuster tatsächlich nicht bekannt.
    scores.uniform = answerUniformity(answers) >= UNIFORM_THRESHOLD;
    // Gastdurchlauf: nichts speichern, nichts in den Verlauf schreiben, und keine Delta-Karte —
    // ein Vergleich zwischen zwei verschiedenen Personen wäre keine Veränderung über die Zeit,
    // sondern schlicht ein anderer Mensch. Das Ergebnis lebt nur in dieser einen Ansicht.
    if (guestRun){
      previous = null;
    } else {
      saveResult(scores);
      appendHistory(scores);
    }
    clearProgress();
    function reveal(){
      renderResult(previous);
      showView('result');
      if (pendingCompareScroll){
        pendingCompareScroll = false;
        setTimeout(function(){
          $('compareAnchor').scrollIntoView({behavior:'smooth'});
          $('cmpOther').focus();
        }, 350);
      }
    }
    // Kurzer, bewusst knapper "Analysiere..."-Moment statt eines instantanen Sprungs zum
    // Ergebnis — ein etablierter kleiner Baustein datengetriebener Premium-Apps beim ersten
    // Reveal. Wird bei reduzierter Bewegungspräferenz komplett übersprungen.
    if (prefersReducedMotion()){ reveal(); return; }
    var overlay = $('processingOverlay');
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    setTimeout(function(){
      overlay.classList.remove('show');
      overlay.setAttribute('aria-hidden','true');
      reveal();
    }, 700);
  }

  function renderResult(previous){
    var arch = archetypeOf(scores);
    var pole1 = scores[arch.top1]>=50?'high':'low', pole2 = scores[arch.top2]>=50?'high':'low';
    $('archTitle').innerHTML = NOUN[arch.top1][pole1] + ' <span class="sep">·</span> ' + ADJ[arch.top2][pole2];
    $('archMotto').textContent = MOTTO[arch.top1][pole1];
    $('shareTitle').textContent = arch.title;
    $('synthesis').textContent = CORE[arch.top1][pole1] + ' ' + FLAVOR[arch.top2][pole2];
    // display:flex statt '' — .uniform-note ist eine Flex-Zeile (Icon + Text); ein leerer String
    // würde zwar auch auf den CSS-Wert zurückfallen, macht die Absicht hier aber weniger deutlich.
    $('uniformNote').style.display = scores.uniform ? 'flex' : 'none';
    // Gastdurchlauf sichtbar machen: sonst liest sich die Seite exakt wie das eigene, gespeicherte
    // Ergebnis — inklusive des Satzes unter dem Code, der auf die Wiederherstellung in den
    // Einstellungen verweist. Genau die gibt es hier aber nicht.
    $('guestNote').style.display = guestRun ? 'flex' : 'none';
    $('resultEyebrow').textContent = guestRun ? tx('js_gastergebnis') : tx('js_dein_porträt');
    $('codeLead').textContent = guestRun
      ? tx('js_dieser_code_ist_die_einzig')
      : tx('js_dein_ergebnis_liegt_aussch');
    $('radarWrap').innerHTML = radarSVG(scores);

    // Dimensionen nach erreichtem Score sortiert (höchster zuerst) für die lesbaren Listen
    // unten auf der Ergebnisseite — das Radar-Chart selbst behält die feste O-C-E-A-N-Achsenreihenfolge,
    // damit die Fünfeck-Form über mehrere Testdurchläufe hinweg vergleichbar bleibt.
    var sortedTraits = ORDER.slice().sort(function(a,b){ return scores[b]-scores[a]; });

    var chips = sortedTraits.map(function(f){
      return '<span class="chip">'+LABELS[f]+' <b>'+scores[f]+'</b></span>';
    }).join('');
    $('shareChips').innerHTML = chips;

    var code = toCode(scores);
    $('myCode').textContent = code;
    $('cmpMe').value = code;

    // Kompakte "auf einen Blick"-Kennzahlenreihe direkt unter dem Kurzporträt — fünf knappe
    // Ziffern mit Tick-Skala statt erst im ausführlichen Bericht weiter unten die erste Zahl zu
    // zeigen. Die Zahlen zählen beim Erscheinen von 0 auf ihren Zielwert hoch.
    var stripHTML = sortedTraits.map(function(f,i){
      return '<div class="stat-tile" style="animation-delay:'+(i*55)+'ms">'+
        '<div class="stat-label">'+RADAR_LABELS[f]+'</div>'+
        '<div class="stat-num mono" id="statNum-'+f+'">0</div>'+
        gaugeBarHTML(scores[f])+
        '</div>';
    }).join('');
    $('statStrip').innerHTML = stripHTML;
    sortedTraits.forEach(function(f){
      animateCountUp($('statNum-'+f), scores[f]);
    });

    // Feedback-Runde 44: Die fünf Dimensions-Karten zeigten ihren vollständigen Bericht sofort —
    // gemessen 2.407 der 2.927 Zeichen (82 %) des Dimensionstextes, wodurch die Ergebnisseite auf
    // rund acht Bildschirmhöhen reinen Text kam, dreimal so viel wie jede andere Ansicht der App.
    // Genau in dem Moment, in dem jemand sein Ergebnis zum ersten Mal sieht, ist das eher Last als
    // Belohnung. Kopfzeile, Messbalken und der eine zusammenfassende Satz bleiben sichtbar — das
    // ist der Teil, den man überfliegt; die drei ausführlichen Abschnitte liegen dahinter.
    // Die erste (also am stärksten ausgeprägte) Dimension steht bewusst offen: sie zeigt, was in
    // den Karten steckt, und macht ohne zusätzlichen Hinweistext klar, dass sich die übrigen
    // genauso öffnen lassen.
    var list = $('traitsList'); list.innerHTML='';
    sortedTraits.forEach(function(f,i){
      var pole = scores[f]>=50 ? 'high':'low';
      var pr = PROFILES[f][pole];
      var card = document.createElement('details');
      card.className='trait-card';
      if (i===0) card.open = true;
      card.style.animationDelay = (i*60)+'ms';
      card.innerHTML =
        '<summary>'+
          '<div class="trait-top"><span class="trait-name">'+LABELS[f]+'</span><span class="trait-score mono">'+scores[f]+' / 100</span></div>'+
          gaugeBarHTML(scores[f])+
          '<div class="trait-teaser">'+pr.teaser+'</div>'+
          '<div class="trait-more"><span class="tm-shut">Alltag &middot; Beziehungen &middot; Wachstum</span>'+
          '<span class="tm-open">Weniger anzeigen</span>'+
            '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>'+
          '</div>'+
        '</summary>'+
        '<div class="trait-sections">'+
          '<div class="trait-section"><div class="trait-section-label">Im Alltag</div><p>'+pr.alltag+'</p></div>'+
          '<div class="trait-section"><div class="trait-section-label">In Beziehungen</div><p>'+pr.beziehungen+'</p></div>'+
          '<div class="trait-section"><div class="trait-section-label">Wachstumsimpuls</div><p>'+pr.wachstum+'</p></div>'+
        '</div>';
      list.appendChild(card);
    });

    renderDelta(previous);
  }

  function renderDelta(previous){
    var box = $('deltaCard');
    if (!previous){ box.style.display='none'; box.innerHTML=''; return; }
    var rows = ORDER.map(function(f){
      var d = scores[f]-previous[f];
      var cls = Math.abs(d)<5 ? 'delta-flat' : (d>0 ? 'delta-up':'delta-down');
      var arrow = Math.abs(d)<5 ? '≈' : (d>0 ? '↑':'↓');
      return '<div class="delta-row"><span>'+LABELS[f]+'</span><span class="delta-move '+cls+'">'+previous[f]+' → '+scores[f]+' &nbsp;'+arrow+'</span></div>';
    }).join('');
    box.innerHTML = tx('js_verglichen_mit_deinem_letz')+rows+
      tx('js_kleine_verschiebungen_unte');
    box.style.display='block';
  }

  function renderCompat(){
    var me = fromCode($('cmpMe').value.trim());
    var other = fromCode($('cmpOther').value.trim());
    var box = $('compatResult'); box.innerHTML='';
    lastCompatSnapshot = null;
    if (!me || !other){
      box.innerHTML = tx('js_bitte_zwei_gültige_stellig');
      return;
    }
    // Bugfix Feedback-Runde 32: identische Codes ergaben zuvor eine bedeutungslose "100 % Übereinstimmung
    // mit dir selbst" ohne jeden Hinweis. Früher, expliziter Check statt stiller Fehlinterpretation.
    if ($('cmpMe').value.trim() === $('cmpOther').value.trim()){
      box.innerHTML = tx('js_das_ist_derselbe_code_wie');
      return;
    }
    var similar=0, diff=0;
    var lines = ORDER.map(function(f){
      var d = Math.abs(me[f]-other[f]);
      var isSim = d<15;
      if (isSim) similar++; else diff++;
      return '<div class="compat-line"><b>'+LABELS[f]+tx('js_du')+me[f]+' · Andere Person: '+other[f]+'<br>'+(isSim?COMPAT[f].similar:COMPAT[f].diff)+'</div>';
    });
    // Einzelne, sofort erfassbare Kennzahl obendrauf — eine einfache, vereinfachte Kennzahl aus
    // der mittleren Abweichung aller fünf Dimensionen, kein wissenschaftlich gewichteter Score
    // (siehe Disclaimer unten). Gut für einen Screenshot, ersetzt aber nicht die Detailansicht darunter.
    var avgDiff = ORDER.reduce(function(s,f){ return s+Math.abs(me[f]-other[f]); },0) / ORDER.length;
    var match = Math.round(100 - avgDiff);
    var matchLabel = match>=75 ? tx('js_hohe_übereinstimmung') : match>=45 ? 'Gemischtes Profil' : 'Deutlich unterschiedliche Profile';
    var scoreBlock = '<div class="compat-score"><div id="compatRing"></div><div class="compat-score-label">'+matchLabel+'</div></div>';
    var summary = '<div class="compat-line compat-line-total"><b>Insgesamt:</b> '+similar+tx('js_von__dimensionen_ähnlich')+diff+tx('js_unterschiedlich__beides_k');
    var radarBlock = '<div class="radar-wrap compat-radar">'+radarSVG(me, 300, {scores:other})+'</div>'+
      tx('js_duandere_person');
    var note = tx('js_die_prozentzahl_oben_ist_e');
    // Mini-Formular zum Speichern dieses Vergleichs im Vergleichsarchiv — bewusst am Ende des
    // Ergebnisblocks, nachdem der Vergleich bereits berechnet und sichtbar ist, statt vorab um
    // einen Namen zu bitten, bevor überhaupt klar ist, ob der Vergleich einen Blick wert ist.
    var saveRow = '<div class="compat-save-row">'+
      '<div class="field"><label for="compatSaveLabel">Name (optional)</label><input type="text" id="compatSaveLabel" maxlength="30" placeholder="z. B. Mia"></div>'+
      '<button type="button" class="btn btn-ghost btn-sm" id="btnSaveCompat">Vergleich speichern</button>'+
      '</div>';
    box.innerHTML = scoreBlock + radarBlock + summary + lines.join('') + note + saveRow;
    lastCompatSnapshot = { myCode: $('cmpMe').value.trim(), otherCode: $('cmpOther').value.trim(), match: match };
    var saveBtn = $('btnSaveCompat');
    if (saveBtn){
      saveBtn.addEventListener('click', function(){
        if (!lastCompatSnapshot) return;
        var labelInput = $('compatSaveLabel');
        var label = labelInput ? labelInput.value.trim().slice(0,30) : '';
        var entry = { id: 'c'+Date.now()+Math.random().toString(36).slice(2,7), ts: Date.now(),
          myCode: lastCompatSnapshot.myCode, otherCode: lastCompatSnapshot.otherCode,
          match: lastCompatSnapshot.match, label: label };
        if (appendCompatArchiveEntry(entry)){
          toast(tx('js_vergleich_gespeichert'));
          refreshDrawerState();
        } else {
          toast(tx('js_konnte_nicht_gespeichert_w'));
        }
      });
    }
    // Ring zunächst bei 0% einfügen und den Ziel-Versatz erst einen Frame später auf demselben
    // Kreis-Element setzen (nicht per innerHTML-Austausch) — nur so greift die CSS-Transition
    // auf stroke-dashoffset tatsächlich, statt sofort im Endzustand zu erscheinen.
    var ringHost = $('compatRing');
    ringHost.innerHTML = ringGaugeSVG(0, 132, tx('js_übereinstimmung'));
    var fillCircle = ringHost.querySelector('.ring-fill');
    var textEl = ringHost.querySelector('.ring-text');
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if (fillCircle){
          var r = 132/2 - 9, circumf = 2*Math.PI*r;
          fillCircle.style.strokeDashoffset = (circumf * (1 - match/100)).toFixed(1);
        }
        if (textEl) textEl.textContent = match;
      });
    });
  }

  function toast(msg){
    var t = $('toast'); t.textContent = msg; t.classList.add('show');
    setTimeout(function(){ t.classList.remove('show'); }, 1800);
  }

  
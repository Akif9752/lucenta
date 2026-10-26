// ---------- Darstellung ----------
// Fortschritts-Semantik des Fokus-Strichs; null entfernt Rolle und Werte ganz (ausserhalb des
// Fragebogens kein eingefrorener Fortschritt).
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

  // Die fuenf Bedeutungen stehen als <span>-Folge im Sprachpaket; sichtbar sind nur die Enden.
  function skalaBedeutung(v){
    var teile = String(tx('trifft_gar_nicht_zutrifft_vo')).match(/<span>([^<]*)<\/span>/g) || [];
    return teile[v-1] ? decodeEntities(teile[v-1].replace(/<\/?span>/g, '')) : '';
  }
  var skalaWahlUhr = null;
  function skalaWahlZeigen(v){
    var el = $('skalaWahl');
    if (!el || !el.classList) return;
    // Ueber dem getippten Kreis, am Rand der Skala abgefangen.
    el.innerHTML = '<span class="skala-wahl-text"></span>';
    var t = el.firstChild;
    if (!t) return;
    t.textContent = skalaBedeutung(v);
    try{
      var k = $('scaleRow').children[v - 1], r = el.getBoundingClientRect(), kr = k.getBoundingClientRect();
      var halb = t.getBoundingClientRect().width / 2, mitte = kr.left + kr.width / 2 - r.left;
      t.style.left = Math.max(halb, Math.min(r.width - halb, mitte)) + 'px';
    }catch(e){}
    el.classList.add('zeigen');
    clearTimeout(skalaWahlUhr);
    skalaWahlUhr = setTimeout(function(){ el.classList.remove('zeigen'); }, 1100);
  }
  function renderQuestion(){
    var it = ITEMS[qi];
    $('qNow').textContent = (qi+1);
    $('qText').textContent = it.text;
    $('focusline-fill').style.width = Math.round((qi/50)*100)+'%';
    // Der Strich traegt role=progressbar nur im Fragebogen.
    setFocuslineProgress(qi);
    var row = $('scaleRow'); row.innerHTML='';
    for (var v=1; v<=5; v++){
      var b = document.createElement('button');
      var isPicked = answers[qi]===v;
      b.className='scale-btn'+(isPicked?' picked':'');
      b.setAttribute('aria-label',tx('js_wert')+v+tx('js_von')+', '+skalaBedeutung(v));
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




  // Der Impuls im Fortschrittsbalken nur an den Meilensteinen, sonst waere es Flimmern.
  var focuslineBeatTimer = null;
  function pulseFocusline(){
    if (prefersReducedMotion()) return;
    var fl = $('focusline');
    if (!fl) return;
    fl.classList.remove('beat');
    try{ void fl.offsetWidth; }catch(e){}
    fl.classList.add('beat');
    if (focuslineBeatTimer) clearTimeout(focuslineBeatTimer);
    focuslineBeatTimer = setTimeout(function(){ fl.classList.remove('beat'); focuslineBeatTimer = null; }, 620);
  }

  // Haptik: in der App ueber das native Haptics-Plugin (Taptic Engine; iOS Safari kennt
  // navigator.vibrate nicht), im Browser navigator.vibrate als Rueckfall. Ein leichter Tick; aus bei
  // reduzierter Bewegung.
  // Jedes Bedienelement gibt einen Impuls (Entscheidung des Inhabers; zentraler Zuhoerer
  // hapticsUeberall in 21-beta-rueckmeldung.js). Die Entprellung hier verhindert doppeltes Vibrieren.
  var letzteHaptik = 0;
  function tapFeedback(){
    if (haptikAbgeschaltet() || prefersReducedMotion()) return;
    var jetzt = Date.now();
    if (jetzt - letzteHaptik < 90) return;
    letzteHaptik = jetzt;
    try{
      if (nativVorhanden()){
        var h = nativModul('Haptics');
        if (h && h.impact){ h.impact({ style: 'LIGHT' }); return; }
      }
    }catch(e){}
    try{ if (navigator.vibrate) navigator.vibrate(8); }catch(e){}
  }

  var quizAdvanceTimeout = null;
  // Klasse entfernen, offsetWidth lesen, neu setzen — sonst erkennt der Browser die Animation nicht
  // als neu.
  function animateQuestionIn(){
    var c = $('qCard');
    if (!c || !c.classList) return;
    c.classList.remove('q-in');
    try{ void c.offsetWidth; }catch(e){}
    c.classList.add('q-in');
    // Die Antwortkreise laufen der Frage hinterher; die Klasse muss beim Antworten wieder weg
    // (selectAnswer).
    var row = $('scaleRow');
    if (row && row.classList){
      row.classList.remove('row-in');
      try{ void row.offsetWidth; }catch(e){}
      row.classList.add('row-in');
    }
  }
  function disarmQuizAdvance(){
    if (quizAdvanceTimeout){ clearTimeout(quizAdvanceTimeout); quizAdvanceTimeout = null; }
  }
  // Zwischen Antwort 50 und dem Ergebnis vergeht gut eine Sekunde; jeder Tipp darin speicherte
  // sonst ein weiteres Ergebnis.
  var quizSchliesst = false;
  function selectAnswer(v){
    if (quizSchliesst) return;
    answers[qi] = v;
    tapFeedback();
    skalaWahlZeigen(v);
    saveProgress();
    var row = $('scaleRow');
    if (row && row.classList) row.classList.remove('row-in');
    renderQuestion();
    // Ausstehenden Uebergang verwerfen, sonst ueberspringt ein Doppeltipp eine Frage.
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
        if (qi === 25){ toast(halbzeitText(), 3500); pulseFocusline(); funkelnAmFortschritt(); }
        else if (QUIZ_MILESTONES[qi]){ toast(QUIZ_MILESTONES[qi]); pulseFocusline(); funkelnAmFortschritt(); }
      }
      else { finishQuiz(); }
    }, 220);
  }

  // Halbzeit: die Dimension mit der bisher groessten Abweichung von der Mitte — ohne Richtung, ohne Wertung.
  function halbzeitText(){
    var summe = {}, n = {};
    for (var i = 0; i < 25; i++){
      var it = ITEMS[i], a = answers[i];
      if (!it || !a) continue;
      summe[it.factor] = (summe[it.factor] || 0) + (it.key === 1 ? a : 6 - a) - 3;
      n[it.factor] = (n[it.factor] || 0) + 1;
    }
    var beste = null, abstand = 0.6;     // unter 0,6 Punkten im Mittel ist nichts deutlich
    ORDER.forEach(function(f){
      var m = n[f] ? Math.abs(summe[f] / n[f]) : 0;
      if (m > abstand){ abstand = m; beste = f; }
    });
    return beste ? tx('js_halbzeit_vorgeschmack').replace('{dim}', LABELS[beste]) : QUIZ_MILESTONES[25];
  }

  // Nach dem Test EINMAL das Kaufangebot, ein paar Sekunden nach dem Ergebnis, nie wieder von selbst,
  // nur in der App (Entscheidung des Inhabers).
  var PLUS_ANGEBOT_SCHLUESSEL = 'lucenta_plus_angebot';
  function plusAngebotNachTest(){
    if (guestRun || istPlus() || !nativVorhanden()) return;
    try{
      if (localStorage.getItem(PLUS_ANGEBOT_SCHLUESSEL)) return;
      localStorage.setItem(PLUS_ANGEBOT_SCHLUESSEL, '1');
    }catch(e){ return; }
    setTimeout(function(){
      var v = $('view-result'), m = $('plusModal');
      if (v && v.classList.contains('active') && m && !m.classList.contains('open') && !istPlus()) openPlusModal();
    }, 4000);
  }

  function finishQuiz(){
    if (quizSchliesst) return;
    quizSchliesst = true;
    var previous = loadResult();
    scores = computeScores();
    // Das Gleichfoermigkeits-Kennzeichen reist am Ergebnis mit (answers ist spaeter zurueckgesetzt).
    // Ausserhalb der ORDER-Schluessel, stoert weder toCode() noch den Vergleich.
    scores.uniform = answerUniformity(answers) >= UNIFORM_THRESHOLD;
    // Gastdurchlauf: nichts speichern, kein Verlauf, keine Delta-Karte.
    if (guestRun){
      previous = null;
    } else {
      saveResult(scores);
      appendHistory(scores);
    }
    clearProgress();
    function reveal(){
      quizSchliesst = false;
      renderResult(previous);
      showView('result');
      ergebnisEnthuellen();
      plusAngebotNachTest();
    }
    // Kurzer "Analysiere..."-Moment, bei reduzierter Bewegung uebersprungen.
    if (prefersReducedMotion()){ reveal(); return; }
    // Die fuenfzigste Antwort schliesst den Balken sichtbar ab, bevor die Ueberlagerung kommt.
    $('focusline-fill').style.width = '100%';
    pulseFocusline();
    var overlay = $('processingOverlay');
    // 900 statt 700 ms: Das Fünfeck braucht 620 ms zum Zeichnen und 340 ms zum Füllen. Kürzer
    // hieße, den Moment abzuschneiden, den man gerade erst eingeführt hat; länger hieße warten.
    setTimeout(function(){
      overlay.classList.add('show');
      overlay.setAttribute('aria-hidden','false');
      setTimeout(function(){
        overlay.classList.remove('show');
        overlay.setAttribute('aria-hidden','true');
        reveal();
      }, 900);
    }, 260);
  }

  // Jede Ergebniskarte blendet ein, wenn sie in den Blick kommt (IntersectionObserver; beim Rendern
  // ist die Ansicht noch display:none und misst 0). Nach drei Sekunden wird sicherheitshalber alles
  // gezeigt.
  function revealOnScroll(elemente){
    // Erst aussteigen, dann anfassen — das Ersatz-DOM der Testreihen kennt weder IntersectionObserver
    // noch children.
    if (!elemente || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    var liste = Array.prototype.slice.call(elemente);
    if (!liste.length) return;
    liste.forEach(function(el){ el.classList.add('defer'); });
    var zeigen = function(el){ el.classList.add('reveal-in'); };
    var beobachter = new IntersectionObserver(function(eintraege){
      eintraege.forEach(function(e){
        if (!e.isIntersecting) return;
        zeigen(e.target);
        beobachter.unobserve(e.target);
      });
    }, {rootMargin:'0px 0px -8% 0px'});
    liste.forEach(function(el){ beobachter.observe(el); });
    setTimeout(function(){
      liste.forEach(function(el){
        if (!el.classList.contains('reveal-in')){ zeigen(el); beobachter.unobserve(el); }
      });
    }, 3000);
  }

  function renderResult(previous){
    try{ $('view-result').classList.remove('enthuellung'); }catch(e){}   // Runde 129, siehe ergebnisEnthuellen
    var arch = archetypeOf(scores);
    setzeDimensionsfarbe($('view-result'), scores);
    var pole1 = scores[arch.top1]>=50?'high':'low', pole2 = scores[arch.top2]>=50?'high':'low';
    $('archTitle').innerHTML = NOUN[arch.top1][pole1] + ' <span class="sep">·</span> ' + ADJ[arch.top2][pole2];
    $('archMotto').textContent = MOTTO[arch.top1][pole1];
    $('shareTitle').textContent = arch.title;
    synthesisSetzen(CORE[arch.top1][pole1] + ' ' + FLAVOR[arch.top2][pole2]);
    // display:flex statt '' — .uniform-note ist eine Flex-Zeile (Icon + Text); ein leerer String
    // würde zwar auch auf den CSS-Wert zurückfallen, macht die Absicht hier aber weniger deutlich.
    $('uniformNote').style.display = scores.uniform ? 'flex' : 'none';
    // Gastdurchlauf sichtbar kennzeichnen.
    $('guestNote').style.display = guestRun ? 'flex' : 'none';
    $('resultEyebrow').textContent = guestRun ? tx('js_gastergebnis') : tx('js_dein_porträt');
    $('codeLead').textContent = guestRun ? tx('js_dieser_code_ist_die_einzig') : '';
    $('codeLead').hidden = !guestRun;
    $('gastCodeBox').hidden = !guestRun;
    $('btnErgebnisFreunde').hidden = guestRun;
    $('radarWrap').innerHTML = radarSVG(scores);

    // Listen nach Wert sortiert; das Radar behaelt die feste O-C-E-A-N-Reihenfolge (vergleichbar ueber
    // Durchlaeufe).
    var sortedTraits = ORDER.slice().sort(function(a,b){ return scores[b]-scores[a]; });


    var code = toCode(scores);
    $('myCode').textContent = code;
    $('cmpMe').value = code;

    // Kennzahlenreihe unter dem Kurzportraet; zaehlt beim Erscheinen hoch.
    var stripHTML = sortedTraits.map(function(f,i){
      return '<div class="stat-tile" style="animation-delay:'+(i*70)+'ms">'+
        '<div class="stat-label">'+RADAR_LABELS[f]+'</div>'+
        '<div class="stat-num mono" id="statNum-'+f+'">0</div>'+
        gaugeBarHTML(scores[f])+
        '</div>';
    }).join('');
    $('statStrip').innerHTML = stripHTML;
    sortedTraits.forEach(function(f){
      animateCountUp($('statNum-'+f), scores[f]);
    });

    // Die Dimensionskarten beginnen alle zugeklappt; die Kopfzeile traegt Wert, Balken und Kernsatz
    // (Feedback B12).
    var list = $('traitsList'); list.innerHTML='';
    sortedTraits.forEach(function(f,i){
      var pole = scores[f]>=50 ? 'high':'low';
      var pr = PROFILES[f][pole];
      var card = document.createElement('details');
      card.className='trait-card';
      card.style.animationDelay = (i*60)+'ms';
      card.innerHTML =
        '<summary>'+
          '<div class="trait-top"><span class="trait-name">'+LABELS[f]+'</span><span class="trait-score mono">'+scores[f]+' / 100</span></div>'+
          gaugeBarHTML(scores[f])+
          '<div class="trait-teaser">'+pr.teaser+'</div>'+
          '<div class="trait-more"><span class="tm-shut">'+tx('js_alltag_beziehungen_wachstum')+'</span>'+
          '<span class="tm-open">'+tx('js_weniger_anzeigen')+'</span>'+
            '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>'+
          '</div>'+
        '</summary>'+
        berichtTeileHTML(pr);
      list.appendChild(card);
    });
    schloesserVerdrahten(list);
    renderRhythmus();
    revealOnScroll(list.children);
    // Erst hier, nachdem beide Aufrufstellen von gaugeBarHTML im Baum stehen: die Kennzahlenreihe
    // oben und die fünf Dimensionskarten darunter.
    startGauges($('view-result'));

    renderDelta(previous);
  }

  // Kurzportraet: erster Satz, der Rest hinter "Mehr" (Feedback B12).
  function synthesisSetzen(text){
    var el = $('synthesis');
    var teile = ersterSatz(text);
    if (!teile[1] || !el.querySelector){ el.textContent = text; return; }
    el.innerHTML = '<span>'+escapeHTML(teile[0])+'</span><span class="syn-rest" hidden>'+escapeHTML(teile[1])+'</span> '+
      '<button type="button" class="syn-mehr" aria-expanded="false">'+tx('syn_mehr')+'</button>';
    var b = el.querySelector('.syn-mehr'), rest = el.querySelector('.syn-rest');
    if (!b || !rest) return;
    b.addEventListener('click', function(){
      rest.hidden = !rest.hidden;
      b.setAttribute('aria-expanded', String(!rest.hidden));
      b.textContent = tx(rest.hidden ? 'syn_mehr' : 'syn_weniger');
    });
  }
  function ersterSatz(text){
    var t = String(text || '');
    var m = /^(.{40,}?[.!?。])(\s|$)/.exec(t);
    return m ? [m[1], t.slice(m[1].length)] : [t, ''];
  }
  // Der ausfuehrliche Bericht ist Lucenta+, alle drei Abschnitte (Entscheidung des Inhabers). Frei: Kopfzeile,
  // Messbalken und Kernsatz; die Abschnitte verschwommen.
  function berichtTeileHTML(pr){
    var abschnitt = function(label, text){
      return '<div class="trait-section"><div class="trait-section-label">'+tx(label)+'</div><p>'+text+'</p></div>';
    };
    if (istPlus()){
      return '<div class="trait-sections">'+abschnitt('js_im_alltag', pr.alltag)+
        abschnitt('js_in_beziehungen', pr.beziehungen)+abschnitt('js_wachstumsimpuls', pr.wachstum)+'</div>';
    }
    return '<div class="trait-sections">'+
      vorschauHTML(abschnitt('js_im_alltag', pr.alltag)+abschnitt('js_in_beziehungen', pr.beziehungen)+abschnitt('js_wachstumsimpuls', pr.wachstum),
                   tx('plus_bericht_weiter'))+
      '</div>';
  }

  // Der Satz zum Wiederholen des Tests haengt am Bestand: Wer schon zwei Durchlaeufe hat, bekommt eine
  // Bestaetigung statt einer Einladung.
  function renderRhythmus(){
    var el = $('rhythmusHinweis');
    if (!el) return;
    var anzahl = 0;
    try{ anzahl = loadHistory().length; }catch(e){}
    var satz = tx('js_rhythmus_a') + (anzahl >= 2
      ? (tx('js_rhythmus_verlauf_a') + anzahl + tx('js_rhythmus_verlauf_b'))
      : tx('js_rhythmus_neu'));
    el.innerHTML = '<div class="rhythmus-titel">' + tx('js_rhythmus_titel') + '</div>' +
                   '<p class="rhythmus-text">' + satz + '</p>';
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
      // Runde 78: Der Hinweis stand als Zeile unter den Feldern und sagte nicht, WELCHES Feld
      // gemeint ist. Geschuettelt wird nur das tatsaechlich unbrauchbare.
      if (!me) schuetteln($('cmpMe'));
      if (!other) schuetteln($('cmpOther'));
      return;
    }
    // Bugfix Feedback-Runde 32: identische Codes ergaben zuvor eine bedeutungslose "100 % Übereinstimmung
    // mit dir selbst" ohne jeden Hinweis. Früher, expliziter Check statt stiller Fehlinterpretation.
    if ($('cmpMe').value.trim() === $('cmpOther').value.trim()){
      box.innerHTML = tx('js_das_ist_derselbe_code_wie');
      schuetteln($('cmpOther'));
      return;
    }
    var similar=0, diff=0;
    // Vergleich in derselben Bauform wie die eigenen Karten (.trait-card). Frei: Prozent, Fuenfeck,
    // ein Satz je Dimension; die drei Lebensbereiche sind Lucenta+.
    var cmpPlus = istPlus();
    // Frei mit ZWEI anderen Personen (Entscheidung des Inhabers, Runde 136); dieselbe Person beliebig
    // oft. Gemerkt werden nur deren Codes, auf dem Geraet.
    var vergleichGesperrt = false;
    if (!cmpPlus){
      try{
        var freie = freieVergleichePersonen();
        var dieserAndere = $('cmpOther').value.trim();
        if (freie.indexOf(dieserAndere) < 0){
          if (freie.length < FREI_VERGLEICHE){
            freie.push(dieserAndere);
            localStorage.setItem(FREI_VERGLEICH_SCHLUESSEL, JSON.stringify(freie));
          } else vergleichGesperrt = true;
        }
      }catch(e){}
    }
    var lines = ORDER.map(function(f, i){
      var d = Math.abs(me[f]-other[f]);
      var isSim = d<15;
      if (isSim) similar++; else diff++;
      var lage = isSim ? 'similar' : 'diff';
      var fe = (COMPAT[f].felder || {})[lage] || {};
      var abschnitt = function(schluessel, text){
        return text ? '<div class="trait-section"><div class="trait-section-label">'+
               tx(schluessel)+'</div><p>'+text+'</p></div>' : '';
      };
      // In der freien Fassung geht die Karte trotzdem auf und erklaert darin, was dahinter liegt.
      return '<details class="trait-card compat-card"'+((cmpPlus && i===0)?' open':'')+
        ' style="animation-delay:'+(i*60)+'ms">'+
        '<summary>'+
          '<div class="trait-top"><span class="trait-name">'+LABELS[f]+'</span>'+
            '<span class="compat-paar mono"><span class="compat-wert-me">'+me[f]+'</span>'+
            '<span class="compat-wert-sep">·</span>'+
            '<span class="compat-wert-other">'+other[f]+'</span></span></div>'+
          compatBalkenHTML(me[f], other[f])+
          '<div class="trait-teaser">'+(isSim?COMPAT[f].similar:COMPAT[f].diff)+'</div>'+
          '<div class="trait-more"><span class="tm-shut">'+tx('js_alltag_beziehungen_wachstum_cmp')+'</span>'+
          '<span class="tm-open">'+tx('js_weniger_anzeigen')+'</span>'+
            '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>'+
          '</div>'+
        '</summary>'+
        '<div class="trait-sections">'+
          (cmpPlus
            ? abschnitt('cmp_feld_alltag', fe.alltag)+
              abschnitt('cmp_feld_gespraech', fe.gespraech)+
              abschnitt('cmp_feld_gemeinsam', fe.gemeinsam)
            : vorschauHTML(abschnitt('cmp_feld_alltag', fe.alltag)+abschnitt('cmp_feld_gespraech', fe.gespraech)+
                           abschnitt('cmp_feld_gemeinsam', fe.gemeinsam), tx('plus_vergleich_karte')))+
        '</div>'+
      '</details>';
    });
    // Vereinfachte Kennzahl aus der mittleren Abweichung, kein gewichteter Score.
    var match = uebereinstimmung(me, other);
    var matchLabel = match>=75 ? tx('js_hohe_übereinstimmung') : match>=45 ? tx('js_gemischtes_profil') : tx('js_deutlich_unterschiedliche_prof');
    var scoreBlock = '<div class="compat-score"><div id="compatRing"></div><div class="compat-score-label">'+matchLabel+'</div></div>';
    // Der Schlusssatz haengt an der Verteilung (null bis fuenf aehnliche Dimensionen).
    var gesamtSatz = (CMP_GESAMT && CMP_GESAMT[similar]) || '';
    var summary = '<div class="compat-line compat-line-total"><b>'+tx('js_insgesamt')+'</b> '+similar+
      tx('js_von__dimensionen_ähnlich')+diff+tx('js_unterschiedlich_punkt')+
      '<div class="compat-gesamt-satz">'+gesamtSatz+'</div></div>';
    // Name nur, wenn das Feld noch den Code des gemerkten Freundes traegt.
    var freund = null;
    try { freund = JSON.parse($('cmpOther').getAttribute('data-freund') || 'null'); } catch(e){}
    var andererName = (freund && freund.name && freund.code === $('cmpOther').value.trim()) ? escapeHTML(freund.name) : '';
    var legende = tx('js_duandere_person');
    if (andererName) legende = legende.replace(/(dot-other"><\/span>)[^<]*/, '$1' + andererName);
    var radarBlock = '<div class="radar-wrap compat-radar">'+radarSVG(me, 300, {scores:other, name:andererName})+'</div>'+
      legende;
    var note = tx('js_die_prozentzahl_oben_ist_e');
    // Der frueher hier stehende Hinweiskasten ist raus: Er saesse unter fuenf Karten, die den
    // gleichen Hinweis schon in sich tragen, und wuerde denselben Satz sechsmal sagen.
    if (vergleichGesperrt){
      box.innerHTML = vorschauHTML(scoreBlock + radarBlock + summary, tx('plus_vergleich_weitere'));
      schloesserVerdrahten(box);
      return;
    }
    box.innerHTML = scoreBlock + radarBlock + summary + lines.join('') + note;
    startCompatBars(box);
    schloesserVerdrahten(box);
    lastCompatSnapshot = { myCode: $('cmpMe').value.trim(), otherCode: $('cmpOther').value.trim(), match: match };
    // Ring erst bei 0 % einfuegen und den Zielversatz ein Bild spaeter am selben Element setzen, sonst
    // laeuft der Uebergang nicht.
    var ringHost = $('compatRing');
    ringHost.innerHTML = ringGaugeSVG(0, 132, tx('js_übereinstimmung'));
    var fillCircle = ringHost.querySelector('.ring-fill');
    var textEl = ringHost.querySelector('.ring-zahl');
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        if (fillCircle){
          var r = 132/2 - 9, circumf = 2*Math.PI*r;
          fillCircle.style.strokeDashoffset = (circumf * (1 - match/100)).toFixed(1);
        }
        if (textEl) textEl.textContent = match;
        var ringSvg = ringHost.querySelector('svg');
        if (ringSvg) ringSvg.setAttribute('aria-label', tx('js_übereinstimmung')+': '+match+tx('js_prozent'));
      });
    });
  }

  // Ein neuer Hinweis setzt die Uhr zurueck; danach wird der Text geleert, sonst bliebe er fuer
  // VoiceOver auf jeder weiteren Seite stehen.
  var toastUhr = null;
  function toast(msg, dauer){
    var t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastUhr);
    toastUhr = setTimeout(function(){
      t.classList.remove('show');
      toastUhr = setTimeout(function(){ t.textContent = ''; }, 400);
    }, dauer || 1800);
  }

  
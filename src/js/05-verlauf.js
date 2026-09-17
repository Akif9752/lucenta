// ---------- history (trend sparklines + list of past completed runs) ----------
  var HISTORY_DATE_FMT = null;
  // Landing-Teaser für die "Verstehen"-Bibliothek (Feedback-Runde 32): zieht eine zufällige Karte
  // aus UNDERSTAND, unabhängig vom eigenen Ergebnis (auf der Landing-Seite liegt meist noch keins
  // vor). Rein informativ und macht die Bibliothek vor dem ersten Testdurchlauf sichtbar, statt sie
  // ausschließlich hinter der Schublade zu verstecken.
  function pickRandomUnderstandCard(){
    var dims = Object.keys(UNDERSTAND);
    var dim = dims[Math.floor(Math.random()*dims.length)];
    var pole = Math.random()<0.5 ? 'high' : 'low';
    var pool = UNDERSTAND[dim][pole];
    return pool[Math.floor(Math.random()*pool.length)];
  }
  // Feedback-Runde 38: für Erstbesucher:innen ohne Ergebnis stapelten sich auf der Startseite drei
  // umrandete Karten hintereinander (Warum-kein-MBTI, Tagesform, Verstehen), bevor überhaupt die
  // Beispiel-Vorschau kam — sichtbare Unordnung genau in dem Moment, der eigentlich zum Teststart
  // einladen soll. Der Tagesform-Check bleibt sichtbar (funktioniert bewusst unabhängig vom
  // Testergebnis), aber die "Verstehen"-Karte zeigt ohne eigenes Ergebnis ohnehin nur eine
  // zufällige, nicht personalisierte Einordnung — für Erstbesucher:innen also reine Zusatzkarte ohne
  // echten Mehrwert. Sie erscheint deshalb erst, sobald ein Ergebnis vorliegt (wie im Drawer und in
  // der vollständigen Verstehen-Ansicht ohnehin schon der Fall).
  function renderLandingUnderstandTeaser(){
    var has = !!loadResult();
    $('landingUnderstandTeaser').style.display = has ? '' : 'none';
    if (!has) return;
    var card = pickRandomUnderstandCard();
    $('landingTeaserTitle').textContent = card.title;
    $('landingTeaserBody').textContent = card.body;
  }
  // Gemeinsamer Leerzustands-Baustein (Feedback-Runde 32): bündelt das bislang sechsfach
  // duplizierte reine-Text-Muster hinter einem konsistenten Icon + Text (+ optionalem CTA-Button),
  // angelehnt an das Empty-State-Muster gängiger Consumer-Apps. Icon ist ein neutrales,
  // gestricheltes Uhr-/Zeit-Symbol (passt zu "noch nichts erfasst"), kein neuer Bedeutungsträger.
  function emptyStateHTML(message, opts){
    opts = opts || {};
    var extra = opts.extraClass ? (' '+opts.extraClass) : '';
    var btn = opts.btnId
      ? '<button type="button" class="btn btn-primary btn-sm" id="'+opts.btnId+'">'+opts.btnLabel+'</button>'
      : '';
    return '<div class="profile-empty'+extra+'">'
      + '<svg class="empty-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-dasharray="2.5 3.2"></circle><path d="M12 8v4l2.3 2.3"></path></svg>'
      + '<p>'+message+'</p>'+btn+'</div>';
  }
  // Der Baustein, der an jeder verschlossenen Stelle steht. Bewusst EINER fuer alle: Fuenf
  // verschieden formulierte Hinweise wuerden sich wie fuenf verschiedene Verkaeufe anfuehlen.
  // Er nennt, was dahinter liegt, und nicht, was fehlt — und er drueckt nicht: kein Countdown,
  // keine erfundene Dringlichkeit, kein zweiter Hinweis an derselben Stelle. Die Grenze aus
  // Runde 46 gilt hier genauso wie beim Serien-Zaehler, der damals verworfen wurde.
  function schlossHTML(text){
    return '<div class="schloss">'+
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" '+
        'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
        '<rect x="4" y="10.5" width="16" height="10.5" rx="2.4"></rect>'+
        '<path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9"></path></svg>'+
      '<div><p class="schloss-text">'+text+'</p>'+
      '<button type="button" class="btn btn-primary btn-sm schloss-btn" data-plus-info>'+
      tx('plus_knopf')+'</button></div></div>';
  }
  // Ein Tipp auf einen dieser Knoepfe oeffnet das Lucenta+-Fenster. Mehr passiert hier nicht:
  // Der Kauf selbst gehoert in die App-Store-Fassung, nicht in die Seite.
  //
  // Runde 89: Vorher stand hier ein Kurzhinweis (toast). Der verschwindet nach ein paar
  // Sekunden — fuer die eine Frage, die an dieser Stelle wirklich gestellt wird, die
  // schlechteste Form.
  function schloesserVerdrahten(wurzel){
    if (!wurzel || !wurzel.querySelectorAll) return;
    wurzel.querySelectorAll('[data-plus-info]').forEach(function(b){
      b.addEventListener('click', openPlusModal);
    });
  }
  function historyDateFmt(){
    if (!HISTORY_DATE_FMT){
      // Runde 59: Das Gebietsschema war fest auf 'de-DE' verdrahtet, also stand im englischen
      // Verlauf "05. Sept. 2026". Es kommt jetzt aus dem Sprachpaket; resetDateFmt() leert den
      // Zwischenspeicher beim Sprachwechsel, sonst bliebe das zuerst erzeugte Format bestehen.
      try{ HISTORY_DATE_FMT = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {day:'2-digit', month:'short', year:'numeric'}); }
      catch(e){ HISTORY_DATE_FMT = { format:function(d){ return d.toLocaleDateString(); } }; }
    }
    return HISTORY_DATE_FMT;
  }
  // Runde 107: Ein zweites, kuerzeres Format — nur fuer die x-Achse des Verlaufsdiagramms.
  // historyDateFmt() gibt "05. Sept. 2026" aus; das ist in einer Liste richtig und auf einer
  // Achse unbrauchbar, wo vier Marken in rund 280px passen muessen. Tag und Monat als Zahl
  // genuegen dort: Das Jahr steht in der Liste darunter, und eine Achse, die dreimal dasselbe
  // Jahr wiederholt, sagt dreimal nichts.
  // Ueber das Gebietsschema aus dem Sprachpaket, nicht fest verdrahtet — im Englischen gehoert
  // der Monat vor den Tag, und genau dieser Fehler stand bis Runde 59 im Verlauf.
  var ACHSE_DATE_FMT = null;
  function achsenDatumFmt(){
    if (!ACHSE_DATE_FMT){
      try{ ACHSE_DATE_FMT = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {day:'2-digit', month:'2-digit'}); }
      catch(e){ ACHSE_DATE_FMT = { format:function(d){ return d.toLocaleDateString(); } }; }
    }
    return ACHSE_DATE_FMT;
  }
  function resetDateFmt(){ HISTORY_DATE_FMT = null; ACHSE_DATE_FMT = null; }
  // Runde 108, gemeldet: „Den Verlauf im Profil bitte visuell ueberarbeiten."
  //
  // Eine Zeile war Datum links, Titel rechts — und bei mehreren Eintraegen zehnmal dieselbe graue
  // Zeile. Was fehlte, war jede Form von Ordnung: Der Titel stand rechtsbuendig und lief bei zwei
  // langen Woertern in eine zweite Zeile, die unter dem Datum begann; welcher Eintrag der
  // jueungste ist, sagte nichts (die Liste laeuft absteigend, das stand nirgends); und der
  // farbige Bezug zum Ergebnis fehlte ganz.
  //
  // Die Zeile traegt jetzt drei Dinge statt zwei: Datum und Titel untereinander und linksbuendig
  // (eine Leserichtung statt zwei), die fuehrende Dimension als kurze Marke rechts, und ihren Pol
  // als Kante links — dieselbe Unterscheidung wie .role-tag-high/-low in der Archetypen-Ansicht.
  // Der jueungste Eintrag ist hervorgehoben.
  //
  // Bewusst KEINE neuen Texte: Datum, Marke (RADAR_LABELS) und Form sind alles, was hier steht.
  // Ein Wort wie „zuletzt" haette acht Sprachpakete gebraucht, um zu sagen, was eine kraeftigere
  // Kante auch sagt.
  function verlaufZeileHTML(e, istNeuste){
    var a = archetypeOf(e.scores);
    var titel = NOUN[a.top1][e.scores[a.top1]>=50?'high':'low'] + ' · ' +
                ADJ[a.top2][e.scores[a.top2]>=50?'high':'low'];
    var datum = ''; try{ datum = historyDateFmt().format(new Date(e.date)); }catch(ex){}
    var pol = e.scores[a.top1]>=50 ? 'high' : 'low';
    return '<div class="history-row history-pol-'+pol+(istNeuste?' history-neu':'')+'">'+
      '<div class="history-body">'+
        '<div class="history-date">'+datum+'</div>'+
        '<div class="history-title">'+titel+'</div>'+
      '</div>'+
      '<div class="history-dim mono">'+RADAR_LABELS[a.top1]+'</div>'+
      '</div>';
  }
  function renderHistory(){
    $('historyMaxCount').textContent = MAX_HISTORY;
    var alle = loadHistory();
    // Runde 84: Die freie Fassung zeigt die letzten beiden Durchlaeufe — genug, um zu sehen DASS
    // sich etwas bewegt, zu wenig, um zu sehen WIE. Geloescht wird nichts: Sobald jemand kauft,
    // steht der ganze Verlauf wieder da.
    var verborgen = istPlus() ? 0 : Math.max(0, alle.length - FREI_DURCHLAEUFE);
    var hist = verborgen ? alle.slice(-FREI_DURCHLAEUFE) : alle;
    var wrap = $('historyContent');
    if (hist.length===0){
      wrap.innerHTML = emptyStateHTML(tx('js_noch_kein_testdurchlauf_ge'));
      return;
    }
    if (hist.length<2){
      // Feedback-Runde 47: Bisher stand hier ein reiner Leerzustand — obwohl die Person einen
      // vollständigen Durchlauf hinter sich hat, tauchte er nicht einmal auf. Das ist die
      // Umkehrung dessen, was der Zielgradienten-Effekt nahelegt: Was jemand bereits geleistet
      // hat, gehört gezeigt und mitgezählt, nicht verschwiegen. Kein erfundener Vorsprung —
      // der Eintrag ist echt, er wurde nur bislang unterschlagen.
      wrap.innerHTML =
        '<div class="history-list">'+verlaufZeileHTML(hist[0], true)+'</div>'+
        // Bewusst kurz: Der Abschnitts-Hinweis unterhalb erklärt bereits, dass ein echter Trend
        // Monate braucht — das hier zweimal zu sagen, wäre genau die Textlast, die Runde 44
        // reduziert hat.
        tx('js_dein_erster_durchlauf_ist');
      return;
    }
    // Runde 108: Neben dem heutigen Wert steht jetzt die Veraenderung ueber die gezeigte Strecke.
    // Der Grund: Die Kurve zeigt den VERLAUF, die Zahl den STAND — die Richtung musste man sich
    // bisher aus einer 140x32 grossen Linie erschliessen, und bei zwei Punkten ist sie darin
    // kaum ablesbar.
    // Gerechnet wird ueber die angezeigte Strecke, nicht ueber alle Durchlaeufe: Die freie
    // Fassung zeigt die letzten zwei, und eine Zahl, die sich auf verborgene Eintraege bezieht,
    // waere nicht nachvollziehbar.
    // Das Vorzeichen ist die ganze Aussage; die Farbe traegt KEINE. Ein gruenes „+" und ein
    // rotes „−" hiessen, hoch sei besser als niedrig — das ist bei den fuenf Dimensionen falsch
    // und widerspricht dem, was die App an jeder anderen Stelle sagt.
    var trendRows = ORDER.map(function(f){
      var vals = hist.map(function(e){ return e.scores[f]; });
      var last = vals[vals.length-1];
      var d = last - vals[0];
      var delta = (d > 0 ? '+' : (d < 0 ? '−' : '±')) + Math.abs(d);
      return '<div class="trend-row"><div class="trend-label">'+RADAR_LABELS[f]+'</div>'+
        sparklineSVG(vals,140,32)+
        '<div class="trend-zahl"><div class="trend-val mono">'+last+'</div>'+
        '<div class="trend-delta mono">'+delta+'</div></div></div>';
    }).join('');
    var listRows = hist.slice().reverse().map(function(e,i){
      return verlaufZeileHTML(e, i===0);
    }).join('');
    wrap.innerHTML = '<div class="trend-list">'+trendRows+'</div>'+
      tx('js_frühere_ergebnisse')+hist.length+'</span></h2>'+
      '<div class="history-list">'+listRows+'</div>'+
      (verborgen ? schlossHTML(tx('plus_verlauf_a') + verborgen + tx('plus_verlauf_b')) : '');
    schloesserVerdrahten(wrap);
  }

  
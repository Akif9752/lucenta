// ---------- state ----------
  var answers = new Array(50).fill(0);
  var qi = 0;
  var scores = null; // {E,A,C,S,O} 0-100
  var pendingCompareScroll = false;
  // Läuft gerade ein Gastdurchlauf (eine zweite Person auf demselben Gerät)? Dann wird am Ende
  // weder gespeichert noch in den Verlauf geschrieben noch mit dem fremden Vorergebnis verglichen.
  var guestRun = false;
  var resetArmed = false, resetArmTimeout = null;
  var lastCompatSnapshot = null;

  var $ = function(id){ return document.getElementById(id); };

  function disarmResetButton(){
    if (!resetArmed) return;
    resetArmed = false;
    clearTimeout(resetArmTimeout);
    var btn = $('btnResetData');
    if (btn){ btn.classList.remove('armed'); btn.textContent = tx('js_eigene_daten_zurücksetzen'); }
  }

  var currentView = 'landing';
  var viewScroll = {};

  // Die Zurück-Geste des Systems — auf dem iPhone das Wischen vom linken Rand — führte bisher aus
  // der App heraus, weil jeder Ansichtswechsel im Verlauf unsichtbar blieb. Jetzt legt jeder
  // Wechsel einen Eintrag an, sodass die Geste innerhalb der App zurückführt. Überlagerungen
  // (Schublade, Bild-Dialog) bekommen ebenfalls einen Eintrag: die Geste schließt dann zuerst sie,
  // bevor sie die Ansicht wechselt — genau das Verhalten, das man von einer nativen App kennt.
  var historyOK = true, overlayDepth = 0;
  function pushViewState(name){
    if (!historyOK) return;
    try{
      if (overlayDepth>0){ history.replaceState({lucentaView:name}, ''); overlayDepth = 0; }
      else { history.pushState({lucentaView:name}, ''); }
    }catch(e){ historyOK = false; }
  }
  function pushOverlayState(kind){
    if (!historyOK) return;
    try{ history.pushState({lucentaOverlay:kind, lucentaView:currentView}, ''); overlayDepth++; }
    catch(e){ historyOK = false; }
  }
  function popOverlayState(){
    if (!historyOK || overlayDepth<=0) return;
    overlayDepth--;
    try{ history.back(); }catch(e){}
  }

  function showView(name, opts){
    opts = opts || {};
    // Scrollposition der verlassenen Ansicht merken, damit die Zurück-Geste an dieselbe Stelle
    // zurückführt statt an den Seitenanfang — bei einer acht Bildschirme langen Ergebnisseite
    // ist das der Unterschied zwischen „zurück" und „von vorn suchen".
    if (currentView && currentView !== name) viewScroll[currentView] = window.scrollY;
    document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
    var section = $('view-'+name);
    section.classList.add('active');
    currentView = name;
    $('viewLabel').textContent = VIEW_LABELS[name] || '';
    document.title = VIEW_TITLES[name] ? ('Lucenta — '+VIEW_TITLES[name]) : 'Lucenta';
    window.scrollTo({top: opts.restoreScroll ? (viewScroll[name]||0) : 0, behavior:'instant' in window ? 'instant':'auto'});
    syncHeaderScrollState();
    if (name!=='quiz'){ $('focusline-fill').style.width = name==='result' ? '100%':'0%'; disarmQuizAdvance(); setFocuslineProgress(null); }
    if (name!=='settings'){ disarmResetButton(); }
    // Bugfix Feedback-Runde 39: renderLandingUnderstandTeaser() blendet die "Verstehen"-Karte
    // seit Runde 38 abhängig vom Vorhandensein eines Ergebnisses ein/aus, wurde bisher aber nur
    // einmal beim allerersten Laden der Seite aufgerufen (siehe init() weiter unten) — nicht bei
    // jeder Rückkehr zur Startseite. Für Erstbesucher:innen blieb die Karte dadurch nach dem
    // ersten abgeschlossenen Test dauerhaft versteckt, obwohl jetzt ein Ergebnis vorliegt (und
    // umgekehrt nach "Eigene Daten zurücksetzen" fälschlich weiter sichtbar). Jetzt Teil derselben
    // Landing-Aktualisierung wie syncHeroState()/renderLandingStateTeaser(), die aus genau diesem
    // Grund schon bei jedem showView('landing') statt nur einmalig laufen.
    if (name==='landing'){ syncHeroState(); syncA2hsHint(); renderLandingStateTeaser(); renderLandingUnderstandTeaser(); }
    if (!opts.fromHistory) pushViewState(name);
    // Fokus an den Anfang der neuen Ansicht setzen, damit Vorleseprogramme den Wechsel überhaupt
    // bemerken — ohne das bleibt der Fokus auf der angetippten Schaltfläche der alten Ansicht.
    // preventScroll, weil die Scrollposition eine Zeile darüber bereits gesetzt wurde.
    try{ section.focus({preventScroll:true}); }catch(e){}
  }
  window.addEventListener('popstate', function(e){
    // Offene Überlagerungen zuerst schließen: die Zurück-Geste soll das Panel schließen,
    // nicht dahinter die Ansicht wechseln.
    if ($('drawerPanel').classList.contains('open')){
      overlayDepth = Math.max(0, overlayDepth-1); closeDrawer(true); return;
    }
    if ($('imgModal').classList.contains('open')){
      overlayDepth = Math.max(0, overlayDepth-1); closeImgModal(true); return;
    }
    var st = e.state;
    var name = (st && st.lucentaView) || 'landing';
    if (!$('view-'+name)) name = 'landing';
    if (name === currentView) return;
    showView(name, {fromHistory:true, restoreScroll:true});
  });
  // Feedback: die obere Leiste ist jetzt sticky (siehe header.top-CSS) — die Trennlinie darunter
  // soll aber erst auftauchen, sobald wirklich gescrollt wurde, nicht permanent stehen. Ein Listener
  // genügt für alle Screens, weil die Leiste außerhalb von #mainContent liegt und beim Wechsel der
  // .view nicht neu erzeugt wird.
  var headerTopEl = null;
  function syncHeaderScrollState(){
    if (!headerTopEl) headerTopEl = document.querySelector('header.top');
    if (headerTopEl) headerTopEl.classList.toggle('scrolled', window.scrollY > 2);
  }
  window.addEventListener('scroll', syncHeaderScrollState, {passive:true});

  // Die Startseite hat bisher jeder Besucherin, egal ob neu oder wiederkehrend, exakt dieselbe
  // Werbe-Ansicht mit "Test starten" gezeigt — selbst mit einem fertigen Ergebnis auf dem Gerät.
  // Für wiederkehrende Nutzer:innen stellt der Haupt-Button jetzt das eigentlich Relevante voran.
  // Einziger Einstiegspunkt in einen neuen Testdurchlauf — vorher lag dieselbe Zeile
  // ("answers zurücksetzen, qi=0, clearProgress, renderQuestion, showView") an fünf Stellen
  // kopiert vor, was das Setzen des Gast-Kennzeichens fünffach fehleranfällig gemacht hätte.
  function beginRun(isGuest){
    guestRun = !!isGuest;
    hideRunChoice();
    answers = new Array(50).fill(0); qi = 0; clearProgress();
    renderQuestion(); showView('quiz');
  }
  function hideRunChoice(){
    var el = $('runChoice');
    if (el) el.style.display = 'none';
  }

  // Läuft Lucenta bereits als eigenständige App vom Home-Bildschirm? Dann wäre der Hinweis unsinnig.
  function isStandalone(){
    try{
      if (window.navigator.standalone === true) return true;
      return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    }catch(e){ return false; }
  }
  function a2hsDismissed(){
    try{ return localStorage.getItem('lucenta_a2hs_hidden') === '1'; }catch(e){ return true; }
  }
  // Läuft Lucenta in einem fremden Rahmen (eingebettet in eine andere Seite)? Dann liest das
  // Betriebssystem beim „Zum Home-Bildschirm hinzufügen" ausschließlich die Angaben der ÄUSSEREN
  // Seite — Symbol, App-Name, Vollbild-Kennzeichnung und Leistenfarbe von Lucenta erreichen es
  // nie. Nachgemessen an der ausgelieferten Seite: Titel und Symbol werden von der äußeren Seite
  // übernommen, das Symbol allerdings als eingebettete Daten-Adresse, die iOS für App-Symbole
  // nicht akzeptiert; apple-mobile-web-app-capable, der App-Name und theme-color fehlen dort ganz.
  // Ergebnis wäre ein fremdes Platzhalter-Symbol und ein Start im Browser statt als App.
  // Deshalb wird der Hinweis in dieser Lage nicht gezeigt: Er würde etwas versprechen, das die
  // Umgebung nicht einlösen kann. Auf einer eigenen Domain (Phase 2) greift er automatisch wieder.
  function isFramed(){
    try{ return window.self !== window.top; }catch(e){ return true; }
  }
  function syncA2hsHint(){
    var el = $('a2hsHint');
    if (!el) return;
    var show = !!loadResult() && !isStandalone() && !isFramed() && !a2hsDismissed();
    el.style.display = show ? 'flex' : 'none';
  }
  // Wird statt beginRun() aufgerufen, wenn bereits ein Ergebnis auf dem Gerät liegt: dann ist erst
  // die Frage zu klären, wessen Durchlauf das wird. Liegt noch kein Ergebnis vor, gibt es nichts zu
  // schützen und der Test startet ohne Zwischenfrage.
  function requestRun(){
    if (!loadResult()){ beginRun(false); return; }
    if (currentView !== 'landing'){ showView('landing'); }
    var el = $('runChoice');
    el.style.display = 'flex';
    try{ $('btnRunSelf').focus({preventScroll:true}); }catch(e){}
    el.scrollIntoView({block:'nearest', behavior:'smooth'});
  }

  function syncHeroState(){
    var progress = loadProgress();
    var result = loadResult();
    var btn = $('btnStart'), sec = $('btnHeroSecondary');
    hideRunChoice();
    if (progress){
      btn.textContent = tx('js_weitermachen_frage')+(progress.qi+1)+'/50) →';
      btn.onclick = function(){ guestRun=false; answers=progress.answers; qi=progress.qi; renderQuestion(); showView('quiz'); };
      sec.style.display = '';
      if (result){
        sec.textContent = tx('js_dein_letztes_ergebnis_anse');
        sec.onclick = function(){ guestRun=false; scores=result; renderResult(); showView('result'); };
      } else {
        sec.textContent = tx('js_neu_starten');
        sec.onclick = function(){ beginRun(false); };
      }
    } else if (result){
      btn.textContent = tx('js_dein_ergebnis_ansehen');
      btn.onclick = function(){ guestRun=false; scores=result; renderResult(); showView('result'); };
      sec.style.display = '';
      sec.textContent = tx('js_test_erneut_machen');
      sec.onclick = requestRun;
    } else {
      btn.textContent = tx('js_test_starten');
      btn.onclick = function(){ beginRun(false); };
      sec.style.display = 'none';
    }
  }

  
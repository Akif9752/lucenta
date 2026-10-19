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

  // Jeder Ansichtswechsel legt einen Verlaufseintrag an, damit die Zurueck-Geste des Systems in der
  // App bleibt; Ueberlagerungen (Schublade, Dialoge) schliesst sie zuerst.
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

  // Unterseiten und die Seite, aus der sie kommen (Runde 136).
  var UNTERSEITE_VON = {hilfe:'settings', sprache:'settings', verlauf:'profile'};
  var navWegTimer = null;
  function navWegAufraeumen(){
    if (navWegTimer){ clearTimeout(navWegTimer); navWegTimer = null; }
    try{
      document.querySelectorAll('.view.nav-weg').forEach(function(v){
        v.classList.remove('nav-weg','nav-weg-push','nav-weg-pop');
        v.style.top = ''; v.style.left = ''; v.style.width = '';
      });
      // Auch die angekommene Seite verliert ihre Schiebe-Klasse: Laeuft die Animation nicht weiter
      // (Hintergrund, gedrosselt — in der Fehlersuche auf WebKit gemessen), stuende sie sonst eine
      // Breite rechts daneben.
      document.querySelectorAll('.view.nav-push, .view.nav-pop').forEach(function(v){
        v.classList.remove('nav-push','nav-pop');
      });
    }catch(e){}
  }
  function showView(name, opts){
    opts = opts || {};
    // Scrollposition der verlassenen Ansicht merken, fuer die Rueckkehr.
    if (currentView && currentView !== name) viewScroll[currentView] = window.scrollY;
    // Richtung des Wechsels: Zurueck-Geste und Startseite sind zurueck, alles andere hinein.
    var richtung = (opts.fromHistory || name === 'landing') ? 'nav-zurueck' : 'nav-vor';
    // Unterseiten (UNTERSEITE_VON) schieben sich wie ein iOS-Push von rechts herein, zurueck umgekehrt
    // (Auftrag des Inhabers). Die verlassene Seite bleibt waehrend des Uebergangs mit position:fixed
    // an ihrem Platz (.nav-weg). Die Richtung haengt am Seitenpaar, nicht am Knopf; zurueck kehrt an
    // die verlassene Stelle zurueck.
    var art = null;
    if (currentView && UNTERSEITE_VON[name] === currentView) art = 'push';
    else if (currentView && UNTERSEITE_VON[currentView] === name) art = 'pop';
    if (art){ richtung = art === 'push' ? 'nav-push' : 'nav-pop'; if (art === 'pop') opts.restoreScroll = true; }
    // Die Wischgeste (20-wiring.js) hat den Uebergang schon selbst gezeigt — hier nur noch umschalten.
    if (opts.geste){ art = null; opts.restoreScroll = true; }
    navWegAufraeumen();
    var alt = currentView ? $('view-'+currentView) : null;
    if (art && alt && !prefersReducedMotion()){
      try{
        var r = alt.getBoundingClientRect();
        alt.style.top = r.top+'px'; alt.style.left = r.left+'px'; alt.style.width = r.width+'px';
        alt.classList.add('nav-weg', art === 'push' ? 'nav-weg-push' : 'nav-weg-pop');
      }catch(e){}
    }
    document.querySelectorAll('.view').forEach(function(v){
      v.classList.remove('active','nav-vor','nav-zurueck','nav-push','nav-pop');
    });
    var section = $('view-'+name);
    if (!prefersReducedMotion() && currentView && currentView !== name && !opts.geste){
      // Erzwungenes Auslesen, damit der Browser die Animation als neu erkennt — dasselbe
      // Muster wie bei animateQuestionIn() und markLangShift().
      void section.offsetWidth;
      section.classList.add(richtung);
      if (art) navWegTimer = setTimeout(navWegAufraeumen, 520);
    }
    section.classList.add('active');
    currentView = name;
    $('viewLabel').textContent = VIEW_LABELS[name] || '';
    document.title = VIEW_TITLES[name] ? ('Lucenta — '+VIEW_TITLES[name]) : 'Lucenta';
    window.scrollTo({top: opts.restoreScroll ? (viewScroll[name]||0) : 0, behavior:'instant' in window ? 'instant':'auto'});
    syncHeaderScrollState();
    // Der Fortschrittsbalken nur im Fragebogen; --fokuslinie-hoehe geht sonst auf 0, die Kopfleiste
    // rueckt nach. Abgesichert, weil das Ersatz-DOM der Testreihen classList.toggle nicht kennt.
    try{ document.documentElement.classList.toggle('fortschritt-sichtbar', name === 'quiz'); }catch(e){}
    if (name!=='quiz'){ $('focusline-fill').style.width = name==='result' ? '100%':'0%'; disarmQuizAdvance(); setFocuslineProgress(null); }
    if (name!=='settings'){ disarmResetButton(); }
    // Die Startseite wird bei jedem Wechsel dorthin aktualisiert, nicht nur beim ersten Laden.
    if (name==='landing'){ syncHeroState(); renderLandingStateTeaser(); renderLandingUnderstandTeaser(); renderPreviewCard(); landingPlusKarteAnwenden(); ordneStartseite(); }
    if (!opts.fromHistory) pushViewState(name);
    // Fokus auf die neue Ansicht, damit Vorleseprogramme den Wechsel bemerken.
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
    if ($('plusModal').classList.contains('open')){
      overlayDepth = Math.max(0, overlayDepth-1); closePlusModal(true); return;
    }
    var st = e.state;
    var name = (st && st.lucentaView) || 'landing';
    if (!$('view-'+name)) name = 'landing';
    if (name === currentView) return;
    showView(name, {fromHistory:true, restoreScroll:true});
  });
  // Die Trennlinie unter der Kopfleiste erst nach dem Scrollen.
  var headerTopEl = null;
  function syncHeaderScrollState(){
    if (!headerTopEl) headerTopEl = document.querySelector('header.top');
    if (headerTopEl) headerTopEl.classList.toggle('scrolled', window.scrollY > 2);
  }
  window.addEventListener('scroll', syncHeaderScrollState, {passive:true});

  // Der einzige Einstieg in einen neuen Durchlauf.
  function beginRun(isGuest){
    guestRun = !!isGuest;
    hideRunChoice();
    answers = new Array(50).fill(0); qi = 0; clearProgress();
    renderQuestion(); showView('quiz');
  }
  function hideRunChoice(){
    var el = $('runChoice');
    if (el) el.style.display = 'none';
    // aria-expanded nur, wenn der Knopf gerade als Aufklapper dient.
    var knopf = $('btnHeroSecondary');
    if (knopf && knopf.hasAttribute('aria-expanded')) knopf.setAttribute('aria-expanded', 'false');
  }

  // Liegt schon ein Ergebnis vor, wird erst gefragt, wessen Durchlauf es wird.
  function requestRun(){
    if (!loadResult()){ beginRun(false); return; }
    var el = $('runChoice');
    // Derselbe Knopf klappt die Frage auch wieder zu; Abbrechen bleibt fuer die Tastatur.
    if (el && el.style.display !== 'none'){
      hideRunChoice();
      // Der Fokus wandert zurueck auf den Knopf, der gerade zugeklappt hat. Ohne das faellt er
      // beim Zuklappen auf den Seitenanfang, weil das fokussierte Element verschwindet.
      try{ $('btnHeroSecondary').focus({preventScroll:true}); }catch(e){}
      return;
    }
    if (currentView !== 'landing'){ showView('landing'); }
    el.style.display = 'flex';
    var knopf = $('btnHeroSecondary');
    if (knopf) knopf.setAttribute('aria-expanded', 'true');
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
      sec.removeAttribute('aria-expanded');
      sec.removeAttribute('aria-controls');
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
      sec.setAttribute('aria-expanded', 'false');
      sec.setAttribute('aria-controls', 'runChoice');
    } else {
      btn.textContent = tx('js_test_starten');
      btn.onclick = function(){ beginRun(false); };
      sec.style.display = 'none';
    }
  }

  
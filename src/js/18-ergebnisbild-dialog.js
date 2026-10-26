// ---------- Ergebnisbild-Dialog ----------
  var imgModalLastFocus = null, currentShareCanvas = null;
  function renderShareImage(){
    currentShareCanvas = buildShareCanvas();
    $('shareImagePreview').src = currentShareCanvas.toDataURL('image/png');
  }
  function imgModalKeydown(e){
    if (e.key==='Escape'){ closeImgModal(); return; }
    if (e.key==='Tab'){
      var all = $('imgModal').querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      var f = Array.prototype.filter.call(all, function(el){ return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  }
  function openImgModal(){
    imgModalLastFocus = document.activeElement;
    renderShareImage();
    bildSichernAnwenden();
    $('imgModal').classList.add('open');
    $('imgModal').setAttribute('aria-hidden','false');
    $('imgModalScrim').classList.add('show');
    var shell = $('shell'); if (shell) shell.setAttribute('inert','');
    document.addEventListener('keydown', imgModalKeydown);
    pushOverlayState('image');
    setTimeout(function(){ $('btnImgModalClose').focus(); }, 50);
  }
  function closeImgModal(keepHistory){
    $('imgModal').classList.remove('open');
    $('imgModal').setAttribute('aria-hidden','true');
    $('imgModalScrim').classList.remove('show');
    var shell = $('shell'); if (shell) shell.removeAttribute('inert');
    document.removeEventListener('keydown', imgModalKeydown);
    if (imgModalLastFocus && imgModalLastFocus.focus) imgModalLastFocus.focus({preventScroll:true});
    if (keepHistory !== true) popOverlayState();
  }

// ---------- Das Lucenta+-Fenster ----------
// Die Vorteilsliste wird im Skript gebaut, weil sie beim Sprachwechsel neu entstehen muss.
  var plusModalLetzterFokus = null;
  // Volle Schluesselnamen, damit sie im Quelltext auffindbar bleiben.
  var PLUS_VORTEILE = [
    {titel:'plus_v_bericht_titel',    text:'plus_v_bericht_text'},   // zuerst, das staerkste (Entscheidung des Inhabers)
    // Tagesform vor dem Verlauf: Sie traegt die ersten Wochen; der Verlauf der Testergebnisse fuellt sich erst ueber Monate.
    {titel:'plus_v_tagesform_titel',  text:'plus_v_tagesform_text'},
    {titel:'plus_v_vergleich_titel',  text:'plus_v_vergleich_text'},
    {titel:'plus_v_verstehen_titel',  text:'plus_v_verstehen_text'},
    {titel:'plus_v_verlauf_titel',    text:'plus_v_verlauf_text'}
  ];
  function plusHaken(){
    return '<span class="plus-vorteil-marke">'+
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" '+
      'stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
      '<path d="M20 6 L9 17 L4 12"></path></svg></span>';
  }
  function renderPlusVorteile(){
    var el = $('plusVorteile');
    if (!el) return;
    el.innerHTML = PLUS_VORTEILE.map(function(v){
      return '<li class="plus-vorteil">'+plusHaken()+
        '<span class="plus-vorteil-text"><strong>'+tx(v.titel)+'</strong>'+
        '<span>'+tx(v.text)+'</span></span></li>';
    }).join('');
  }
  function plusModalKeydown(e){
    if (e.key === 'Escape'){ closePlusModal(); return; }
    if (e.key === 'Tab'){
      // Der Fokus bleibt im Fenster. Ohne das wandert er hinter den Verdunkler, und eine
      // Sprachausgabe liest die Seite dahinter vor, die niemand mehr bedienen kann.
      var all = $('plusModal').querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      var f = Array.prototype.filter.call(all, function(el){ return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  }
  // Die gewaehlte Laufzeit bleibt gespeichert.
  var LAUFZEIT_SCHLUESSEL = 'lucenta_laufzeit';
  // Die gueltigen Laufzeiten werden aus dem Markup gelesen, nicht doppelt aufgezaehlt.
  function laufzeitFaecher(){
    var gruppe = $('plusPreisWahl');
    return gruppe ? Array.prototype.slice.call(gruppe.querySelectorAll('.segment-opt')) : [];
  }
  function laufzeitLesen(){
    var faecher = laufzeitFaecher();
    var erlaubt = faecher.map(function(b){ return b.getAttribute('data-laufzeit'); });
    var vorgabe = faecher.filter(function(b){ return b.hasAttribute('data-standard'); })[0];
    var w = schalterLesen(LAUFZEIT_SCHLUESSEL, '');
    if (erlaubt.indexOf(w) >= 0) return w;
    return vorgabe ? vorgabe.getAttribute('data-laufzeit') : (erlaubt[0] || '');
  }
  function laufzeitAnwenden(){
    var wahl = laufzeitLesen();
    laufzeitFaecher().forEach(function(b){
      b.setAttribute('aria-checked', b.getAttribute('data-laufzeit') === wahl ? 'true' : 'false');
    });
  }
  // Zwei Zustaende: kaufen, oder fuer Abonnenten "Abo verwalten" (eine App darf ein Abo nicht selbst
  // beenden).
  function plusKnopfAnwenden(){
    var b = $('btnPlusAktivieren');
    if (!b) return;
    // Runde 126: Der Knopf nennt, was man bekommt — "Jahresabo starten" statt "aktivieren".
    var cta = {monat:'plus_cta_monat', jahr:'plus_cta_jahr'};
    var probe = !istPlus() && cta[laufzeitLesen()] === 'plus_cta_jahr' ? probeTage() : 0;
    b.textContent = probe ? tfText('plus_cta_probe', {n: probe})
                          : tx(istPlus() ? 'plus_verwalten' : (cta[laufzeitLesen()] || 'plus_cta_jahr'));
    var h = $('plusProbeHinweis');
    if (h){
      h.textContent = probe ? decodeEntities(tfText('plus_probe_hinweis', {n: probe, preis: PLUS_PREISE.jahr})) : '';
      h.hidden = !probe;
    }
    b.classList.toggle('btn-primary', !istPlus());
    b.classList.toggle('btn-ghost', istPlus());
  }
  // Eine Zeile, die sagt, was schon wartet — aus den eigenen Daten, ohne Druck.
  function plusPersoenlichAnwenden(){
    var el = $('plusPersoenlich');
    if (!el) return;
    var tage = 0, laeufe = 0;
    try{ tage = Math.max(0, stateTage(loadStateHistory()).length - FREI_TAGE); }catch(e){}
    try{ laeufe = Math.max(0, loadHistory().length - FREI_DURCHLAEUFE); }catch(e){}
    var text = '';
    if (!istPlus()){
      if (tage > 0) text = tx('plus_persoenlich_tage').split('{n}').join(String(tage));
      else if (laeufe > 0) text = tx('plus_persoenlich_laeufe').split('{n}').join(String(laeufe));
    }
    el.textContent = text;
    el.hidden = !text;
  }
  function plusModalAnwenden(){ laufzeitAnwenden(); plusKnopfAnwenden(); plusPersoenlichAnwenden(); plusPreiseAnwenden(); }

  // "In Fotos sichern" nur mit nativer Bruecke, geprueft bei jedem Oeffnen.
  function bildSichernAnwenden(){
    var b = $('btnImgModalSichern');
    if (b) b.hidden = !bildSichernMoeglich();
  }

  function openPlusModal(){
    plusModalLetzterFokus = document.activeElement;
    renderPlusVorteile();
    plusModalAnwenden();
    $('plusModal').classList.add('open');
    $('plusModal').setAttribute('aria-hidden','false');
    $('plusModalScrim').classList.add('show');
    var shell = $('shell'); if (shell) shell.setAttribute('inert','');
    document.addEventListener('keydown', plusModalKeydown);
    pushOverlayState('plus');
    setTimeout(function(){ $('btnPlusModalClose').focus(); }, 50);
  }
  function closePlusModal(keepHistory){
    $('plusModal').classList.remove('open');
    $('plusModal').setAttribute('aria-hidden','true');
    $('plusModalScrim').classList.remove('show');
    var shell = $('shell'); if (shell) shell.removeAttribute('inert');
    document.removeEventListener('keydown', plusModalKeydown);
    if (plusModalLetzterFokus && plusModalLetzterFokus.focus) plusModalLetzterFokus.focus({preventScroll:true});
    if (keepHistory !== true) popOverlayState();
  }

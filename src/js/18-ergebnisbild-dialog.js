// ---------- Ergebnisbild-Dialog ----------
  var imgModalLastFocus = null, currentShareCanvas = null, shareFormat = 'feed';
  function renderShareImage(){
    currentShareCanvas = buildShareCanvas(shareFormat);
    $('shareImagePreview').src = currentShareCanvas.toDataURL('image/png');
    Array.prototype.forEach.call(document.querySelectorAll('.img-format-btn'), function(b){
      b.setAttribute('aria-checked', b.getAttribute('data-fmt')===shareFormat ? 'true':'false');
    });
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
    if (imgModalLastFocus && imgModalLastFocus.focus) imgModalLastFocus.focus();
    if (keepHistory !== true) popOverlayState();
  }

// ---------- Das Lucenta+-Fenster (Runde 89) ----------
//
// An den fuenf verschlossenen Stellen stand bisher ein Knopf, der einen Kurzhinweis einblendete
// — einen Toast, der nach ein paar Sekunden wieder verschwand. Fuer die eine Frage, die jemand
// dort wirklich hat ("was bekomme ich dafuer?"), ist das die schlechteste Form: Man kann nicht
// nachlesen, nicht scrollen, nicht in Ruhe entscheiden. Jetzt oeffnet sich ein Fenster.
//
// Die Liste steht im Skript und nicht im HTML, weil sie beim Sprachwechsel neu gebaut werden
// muss: Vier Punkte mit je Ueberschrift und Erklaerung waeren im HTML acht Marken, die
// einzeln nachgezogen werden muessten.
  var plusModalLetzterFokus = null;
  // Die vollen Schluesselnamen, nicht aus Teilen zusammengesetzt: Ein tx('plus_v_'+k+'_titel')
  // spart vier Zeilen und kostet dafuer die Auffindbarkeit — wer im Quelltext nach
  // 'plus_v_verlauf_titel' sucht, faende die Stelle nicht mehr.
  var PLUS_VORTEILE = [
    {titel:'plus_v_verlauf_titel',    text:'plus_v_verlauf_text'},
    {titel:'plus_v_tagesform_titel',  text:'plus_v_tagesform_text'},
    {titel:'plus_v_vergleich_titel',  text:'plus_v_vergleich_text'},
    {titel:'plus_v_verstehen_titel',  text:'plus_v_verstehen_text'}
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
  // Runde 97: Der Segmentwaehler und der Aktivierungsknopf. Die gewaehlte Laufzeit steht im
  // Speicher, damit sie beim naechsten Oeffnen noch dort steht, wo sie stand — und damit die
  // spaetere Kaufpruefung sie liest, statt sie erneut zu erfragen.
  var LAUFZEIT_SCHLUESSEL = 'lucenta_laufzeit';
  // Die gueltigen Laufzeiten stehen im Markup und werden von dort gelesen, nicht hier noch
  // einmal aufgezaehlt. Das ist nicht Sparsamkeit: Eine dritte Laufzeit im Markup und eine
  // Liste hier, die davon nichts weiss, waere ein Auseinanderlaufen, das erst auffiele, wenn
  // die neue Wahl sich nicht merken laesst. Die Vorgabe traegt dieselbe Quelle.
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
  // Der Knopf traegt zwei Zustaende. Ohne den zweiten fuehrte das Fenster in eine Sackgasse:
  // Wer Lucenta+ hat, saehe eine Aufforderung zu etwas, das er bereits hat.
  function plusKnopfAnwenden(){
    var b = $('btnPlusAktivieren');
    if (!b) return;
    b.textContent = tx(istPlus() ? 'plus_beenden' : 'plus_aktivieren');
    b.classList.toggle('btn-primary', !istPlus());
    b.classList.toggle('btn-ghost', istPlus());
  }
  function plusModalAnwenden(){ laufzeitAnwenden(); plusKnopfAnwenden(); }

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
    if (plusModalLetzterFokus && plusModalLetzterFokus.focus) plusModalLetzterFokus.focus();
    if (keepHistory !== true) popOverlayState();
  }

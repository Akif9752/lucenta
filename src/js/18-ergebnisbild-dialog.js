// ---------- Ergebnisbild-Dialog ----------
  var imgModalLastFocus = null, currentShareCanvas = null, shareFormat = 'feed';
  function renderShareImage(){
    currentShareCanvas = buildShareCanvas(shareFormat);
    $('shareImagePreview').src = currentShareCanvas.toDataURL('image/png');
    Array.prototype.forEach.call(document.querySelectorAll('.img-format-btn'), function(b){
      b.setAttribute('aria-pressed', b.getAttribute('data-fmt')===shareFormat ? 'true':'false');
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

  
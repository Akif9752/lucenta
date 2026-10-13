
(function(){
  "use strict";

  // Globales Auffangnetz: Unerwartete Fehler zeigen einen gedrosselten Hinweis — das letzte Netz, kein
  // Ersatz fuer Fehlerbehandlung vor Ort.
  var lastGlobalErrorToast = 0;
  function notifyUnexpectedError(ereignis){
    // console.error landet ueber Capacitors Konsolenbruecke im Xcode-Log (sonst steht dort nur "JS
    // Eval error"). Geht nicht nach aussen.
    try{
      // Ohne deutschen Klartext (audit_i18n.py verbietet deutsche Literale im JS).
      var grund = ereignis && (ereignis.reason || ereignis.error || ereignis.message);
      console.error('[Lucenta]',
                    (grund && (grund.stack || grund.message)) || grund || (ereignis && ereignis.type),
                    ereignis && ereignis.filename ? '@' + ereignis.filename + ':' + ereignis.lineno : '');
    }catch(e){}
    var now = Date.now();
    if (now - lastGlobalErrorToast < 4000) return;
    lastGlobalErrorToast = now;
    try{
      var t = document.getElementById('toast');
      if (t){ t.textContent = tx('js_etwas_ist_schiefgelaufen_d'); t.classList.add('show'); setTimeout(function(){ t.classList.remove('show'); }, 2600); }
    }catch(e){ /* selbst der Hinweis darf die App nicht zum Absturz bringen */ }
  }
  window.addEventListener('error', notifyUnexpectedError);
  window.addEventListener('unhandledrejection', notifyUnexpectedError);


  
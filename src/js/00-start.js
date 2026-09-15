
(function(){
  "use strict";

  // Globales Auffangnetz (Feedback-Runde 32): bislang liefen unerwartete Laufzeitfehler oder
  // abgelehnte Promises komplett lautlos ins Leere — die Ansicht blieb einfach stehen, ohne dass
  // die Person überhaupt merkte, dass etwas schiefging. toast() existiert bereits als bewährter
  // Hinweis-Mechanismus (siehe u. a. Vergleichsarchiv); hier nur mit eigener Drossel, damit eine
  // Fehlerkaskade nicht denselben Hinweis im Sekundentakt wiederholt. Ersetzt keine echte
  // Fehlerbehandlung an der jeweiligen Stelle, sondern ist bewusst nur das letzte Sicherheitsnetz.
  var lastGlobalErrorToast = 0;
  function notifyUnexpectedError(ereignis){
    // Runde 102: Das Netz zeigte nur den Hinweis und verschwieg, WAS schiefging. In der
    // Capacitor-Huelle ist das teuer — dort gibt es keine Entwicklerkonsole zum Nachsehen, und im
    // Xcode-Log stand nur Capacitors nichtssagendes "JS Eval error A JavaScript exception
    // occurred". console.error landet ueber Capacitors Console-Bruecke im Xcode-Log und macht den
    // Fehler damit ueberhaupt erst auffindbar. Geht nicht nach aussen: console.error schreibt in
    // die Konsole, nicht ins Netz.
    try{
      // Bewusst ohne deutschen Klartext: tools/audit_i18n.py verbietet deutsche Literale im
      // JavaScript, damit kein sichtbarer Text an der Uebersetzung vorbeigeht. Die Marke und der
      // Fehler selbst genuegen — mehr Worte braucht ein Protokolleintrag nicht.
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


  
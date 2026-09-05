
(function(){
  "use strict";

  // Globales Auffangnetz (Feedback-Runde 32): bislang liefen unerwartete Laufzeitfehler oder
  // abgelehnte Promises komplett lautlos ins Leere — die Ansicht blieb einfach stehen, ohne dass
  // die Person überhaupt merkte, dass etwas schiefging. toast() existiert bereits als bewährter
  // Hinweis-Mechanismus (siehe u. a. Vergleichsarchiv); hier nur mit eigener Drossel, damit eine
  // Fehlerkaskade nicht denselben Hinweis im Sekundentakt wiederholt. Ersetzt keine echte
  // Fehlerbehandlung an der jeweiligen Stelle, sondern ist bewusst nur das letzte Sicherheitsnetz.
  var lastGlobalErrorToast = 0;
  function notifyUnexpectedError(){
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


  
// Wird von tools/store_bilder/aufnehmen.sh an die index.html der installierten App gehaengt (nur im Simulator,
// danach wiederhergestellt). Bringt eine Szene auf den Bildschirm: Sprache, Lucenta+, Beispieldaten, dann der Weg.
// Platzhalter __SPRACHE__ und __SZENE__ setzt das Skript ein. Braucht den Entwicklungsbau (window.__lucentaTab).
(function(){
  var L = '__SPRACHE__', S = '__SZENE__';
  var nach = function(ms, f){ setTimeout(f, ms); };
  var klick = function(q){ var e = document.querySelector(q); if (e) e.click(); };
  try{
    localStorage.setItem('lucenta_onboarding', '1');
    localStorage.setItem('lucenta_plus', '1');
    // Je App-Start einmal setzen und neu laden. Erst nach 3 s: Die App laedt beim Start das zuletzt gewaehlte Paket
    // nach und schreibt danach die Sprache selbst — sofort gesetzt, ueberschrieb sie unseren Wert (gemessen).
    if (sessionStorage.getItem('__store_lang') !== L){
      sessionStorage.setItem('__store_lang', L);
      nach(3000, function(){ localStorage.setItem('lucenta_lang', L); location.reload(); });
      return;
    }
    if (localStorage.getItem('lucenta_demo_aktiv') !== '1'){
      nach(1200, function(){ window.__lucentaTab('profile'); nach(900, function(){ klick('#btnDemo'); }); });
      return;
    }
  }catch(e){}
  var still = document.createElement('style');
  still.textContent = '*{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important}';
  // Erst nach dem Einblenden anhalten: Die Ergebniskarten werden durch ihre Bewegung sichtbar.
  nach(12000, function(){ document.head.appendChild(still); });
  nach(1400, function(){
    var tab = window.__lucentaTab;
    if (S === '1-start'){ tab('landing'); scrollTo(0, 0); }
    if (S === '2-ergebnis' || S === '3-bericht'){
      tab('profile');
      nach(600, function(){
        klick('#btnProfileViewResult');
        if (S === '3-bericht') nach(700, function(){
          var t = document.getElementById('traitsList'), h = t && (t.previousElementSibling || t);
          if (h){ h.scrollIntoView({block: 'start'}); scrollBy(0, -130); }
        });
      });
    }
    if (S === '4-tagesform'){ tab('state'); nach(500, function(){ klick('#view-state .tf-reiter [data-reiter="verlauf"]'); }); }
    if (S === '5-verstehen'){ tab('understand'); scrollTo(0, 0); }
  });
})();

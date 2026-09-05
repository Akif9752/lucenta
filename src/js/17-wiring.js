// ---------- wiring ----------
  // btnStart/btnHeroSecondary click handlers are assigned dynamically by syncHeroState() —
  // what they do depends on whether a saved result or an interrupted test already exists.
  $('btnBackLanding').addEventListener('click', function(){ if (qi>0 && loadProgress()){ toast(tx('js_fortschritt_gespeichert')); } showView('landing'); });
  $('btnHome').addEventListener('click', function(){ showView('landing'); });
  $('btnBackFromResult').addEventListener('click', function(){ showView('landing'); });
  $('btnBackFromArchetypes').addEventListener('click', function(){ showView('landing'); });
  $('btnPrev').addEventListener('click', function(){ if (qi>0){ qi--; renderQuestion(); animateQuestionIn(); saveProgress(); } });
  // "Test wiederholen" von der Ergebnisseite geht durch dieselbe Zwischenfrage wie der Hero-Button:
  // genau hier sitzt jemand, der sein Ergebnis gerade jemand anderem zeigt — der wahrscheinlichste
  // Moment, in dem die zweite Person den Test spontan auch machen will.
  $('btnRetake').addEventListener('click', requestRun);
  $('btnRetakeTop').addEventListener('click', requestRun);
  
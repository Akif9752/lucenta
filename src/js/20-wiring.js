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
    $('btnRecht').addEventListener('click', function(){ renderRecht(); showView('recht'); });
  $('btnRechtFuss').addEventListener('click', function(){ renderRecht(); showView('recht'); });
  $('btnBackFromRecht').addEventListener('click', function(){ showView('landing'); });
  // Runde 131: die haeufigen Fragen als eigene Seite; zurueck geht es dorthin, woher man kam.
  $('btnHilfeOeffnen').addEventListener('click', function(){ showView('hilfe'); });
  $('btnBackFromHilfe').addEventListener('click', function(){ showView('settings'); });
  // Runde 136: die Sprachwahl als eigene Seite.
  $('btnSpracheOeffnen').addEventListener('click', function(){ showView('sprache'); });
  $('btnBackFromSprache').addEventListener('click', function(){ showView('settings'); });


  // ---------- Zurueck durch Wischen vom linken Rand (Runde 137) ----------
  //
  // Seit Runde 136 schieben sich Unterseiten wie in iOS herein. Zu dieser Form gehoert in iOS die
  // Geste: vom linken Bildschirmrand nach rechts ziehen, und die Seite folgt dem Finger; loslassen
  // nach gut einem Drittel (oder mit Schwung) geht zurueck, sonst rastet sie wieder ein. Ohne die
  // Geste waere der Uebergang nur halb iOS — man saehe die Form und koennte sie nicht benutzen.
  //
  // Nur auf Unterseiten (UNTERSEITE_VON) und nur aus einem schmalen Randstreifen, damit ein
  // waagerechtes Wischen mitten auf der Seite (Zeitraumwaehler, Diagramme) nichts ausloest. Erst
  // wenn die Bewegung eindeutig waagerecht ist, gehoert sie der Geste; sonst bleibt es Bildlauf.
  (function randGeste(){
    var RAND = 24, aktiv = null;
    function ende(zurueck){
      var g = aktiv; aktiv = null;
      if (!g || !g.gestartet){ return; }
      var dauer = prefersReducedMotion() ? 0 : 280;
      g.seite.classList.add('nav-loslassen'); g.unter.classList.add('nav-loslassen');
      g.seite.style.transform = zurueck ? 'translateX(100vw)' : '';
      g.unter.style.transform = zurueck ? 'none' : 'translateX(-30%)';
      g.unter.style.filter = zurueck ? 'none' : 'brightness(.92)';
      setTimeout(function(){
        [g.seite, g.unter].forEach(function(v){
          v.classList.remove('nav-loslassen','nav-ziehen','nav-unter');
          v.style.transform = ''; v.style.filter = ''; v.style.top = ''; v.style.left = ''; v.style.width = '';
        });
        if (zurueck) showView(g.ziel, {geste:true});
      }, dauer);
    }
    document.addEventListener('touchstart', function(e){
      var ziel = UNTERSEITE_VON[currentView];
      if (!ziel || !e.touches || e.touches.length !== 1) return;
      var t = e.touches[0];
      if (t.clientX > RAND) return;
      aktiv = {x:t.clientX, y:t.clientY, zeit:Date.now(), ziel:ziel, gestartet:false,
               seite:$('view-'+currentView), unter:$('view-'+ziel), dx:0};
    }, {passive:true});
    document.addEventListener('touchmove', function(e){
      var g = aktiv;
      if (!g || !e.touches || !e.touches.length) return;
      var t = e.touches[0], dx = t.clientX - g.x, dy = t.clientY - g.y;
      if (!g.gestartet){
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        // Eher senkrecht: Das ist Bildlauf, nicht die Geste.
        if (dx <= 0 || Math.abs(dy) > Math.abs(dx)){ aktiv = null; return; }
        g.gestartet = true;
        var r = g.seite.getBoundingClientRect();
        g.breite = r.width + 2 * r.left;
        // Die Seite darunter an die Stelle, an der man sie verlassen hat.
        var oben = r.top + window.scrollY - (viewScroll[g.ziel] || 0);
        g.unter.style.top = oben + 'px'; g.unter.style.left = r.left + 'px'; g.unter.style.width = r.width + 'px';
        g.unter.classList.add('nav-unter'); g.seite.classList.add('nav-ziehen');
      }
      e.preventDefault();
      g.dx = Math.max(0, dx);
      var anteil = Math.min(1, g.dx / g.breite);
      g.seite.style.transform = 'translateX(' + g.dx + 'px)';
      g.unter.style.transform = 'translateX(' + (-30 * (1 - anteil)) + '%)';
      g.unter.style.filter = 'brightness(' + (0.92 + 0.08 * anteil) + ')';
      g.v = g.dx / Math.max(1, Date.now() - g.zeit);
    }, {passive:false});
    document.addEventListener('touchend', function(){
      var g = aktiv;
      if (!g) return;
      ende(g.gestartet && (g.dx > g.breite * 0.35 || (g.v || 0) > 0.6));
    });
    document.addEventListener('touchcancel', function(){ ende(false); });
  })();

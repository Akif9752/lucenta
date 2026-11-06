  // ---------- Onboarding beim ersten Oeffnen ----------
  // Drei Schritte (Entscheidung des Inhabers): was man erfaehrt, eigenes Ziel waehlen, Name und Figur -> direkt
  // in den Test. Die Anmeldung kommt einmal unter dem ersten Ergebnis (sicherKarteAnwenden). Ehrlich: keine erfundenen Zahlen, Lucenta+ erst nach dem
  // Ergebnis. Unter Automatisierung (navigator.webdriver) bleibt es aus, sonst blockierte es jede
  // Pruefung; mit ?onboarding=1 laesst es sich gezielt pruefen.
  var ONBOARDING_SCHLUESSEL = 'lucenta_onboarding';
  var obSchritt = 1, obZiele = [], obFigur = '';

  function onboardingErzwungen(){ return /[?&]onboarding=1\b/.test(location.search); }
  function onboardingNoetig(){
    if (onboardingErzwungen()) return true;
    var gesehen = false;
    try{ gesehen = localStorage.getItem(ONBOARDING_SCHLUESSEL) === '1'; }catch(e){ return false; }
    if (gesehen) return false;
    // Wer schon Daten hat, ist kein erster Start (Bestandsnutzer nach einem Update).
    if (loadResult() || loadProgress() || loadHistory().length){
      try{ localStorage.setItem(ONBOARDING_SCHLUESSEL, '1'); }catch(e){}
      return false;
    }
    return !navigator.webdriver;
  }

  var OB_LETZTER = 3;
  function obSchrittZeigen(n){
    obSchritt = n;
    var ob = $('onboarding');
    ob.querySelectorAll('.ob-step').forEach(function(s){
      var an = +s.getAttribute('data-step') === n;
      s.hidden = !an;
      if (an && !prefersReducedMotion()){ s.classList.remove('ob-rein'); void s.offsetWidth; s.classList.add('ob-rein'); }
    });
    ob.querySelectorAll('.ob-dots span').forEach(function(p, i){ p.classList.toggle('an', i < n); });
    $('btnObZurueck').hidden = n === 1;
    if (n === OB_LETZTER) obFigurRaster();
    var h = ob.querySelector('.ob-step[data-step="'+n+'"] h1');
    if (h) setTimeout(function(){ try{ h.focus(); }catch(e){} }, 60);
  }

  function obFigurRaster(){
    var wrap = $('obFigurRaster');
    if (wrap.childNodes.length) return;
    wrap.innerHTML = figurenGruppiertHTML(function(f){
      return '<button type="button" class="figur-wahl" data-ob-figur="'+f.id+'" '+
        'style="--figur-feld:'+f.feld+';--figur-feld-dunkel:'+figFeldDunkel(f.feld)+'" '+
        'aria-pressed="false" aria-label="'+tx('figur_'+f.id)+'">'+figurHTML(f, null, true)+'</button>';
    });
    wrap.querySelectorAll('[data-ob-figur]').forEach(function(b){
      b.addEventListener('click', function(){
        obFigur = b.getAttribute('data-ob-figur');
        wrap.querySelectorAll('[data-ob-figur]').forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
  }

  function onboardingBeenden(testStarten){
    try{ localStorage.setItem(ONBOARDING_SCHLUESSEL, '1'); }catch(e){}
    var name = ($('obName').value || '').trim();
    // Ziele werden gemerkt (Ergebnis, Verstehen, Erinnerung richten sich danach); mit dem Namen steht die
    // Benutzer-ID sofort fest (Entscheidung des Inhabers, aenderbar unter Name & Benutzer-ID).
    if (name || obFigur || obZiele.length){
      var pr = loadProfile();
      if (name) pr.name = name;
      if (obFigur) pr.figur = obFigur;
      if (obZiele.length) pr.ziele = obZiele.slice();
      saveProfile(pr);
      profilWegeAnwenden();
    }
    var ob = $('onboarding');
    ob.classList.remove('offen');
    ob.setAttribute('aria-hidden', 'true');
    var shell = $('shell'); if (shell) shell.removeAttribute('inert');
    setTimeout(function(){ ob.hidden = true; }, prefersReducedMotion() ? 0 : 260);
    if (testStarten) beginRun(false);
  }

  function onboardingZeigenWennErster(){
    if (!onboardingNoetig()) return;
    var ob = $('onboarding');
    // Die echte Vorschau: dieselbe Beispielkarte wie auf der Startseite.
    $('obVorschauRadar').innerHTML = radarSVG({O:78,E:65,C:45,A:58,S:50}, 200, null, true);
    ob.hidden = false;
    ob.setAttribute('aria-hidden', 'false');
    var shell = $('shell'); if (shell) shell.setAttribute('inert', '');
    requestAnimationFrame(function(){ ob.classList.add('offen'); });
    obSchrittZeigen(1);
  }

  function onboardingVerdrahten(){
    var ob = $('onboarding');
    if (!ob) return;
    ob.querySelectorAll('[data-ob-weiter]').forEach(function(b){
      b.addEventListener('click', function(){ obSchrittZeigen(Math.min(OB_LETZTER, obSchritt + 1)); });
    });
    $('btnObZurueck').addEventListener('click', function(){ obSchrittZeigen(Math.max(1, obSchritt - 1)); });
    $('btnObUeberspringen').addEventListener('click', function(){ onboardingBeenden(false); });
    $('btnObStarten').addEventListener('click', function(){ onboardingBeenden(true); });
    // Neues iPhone: anmelden, und liegt in der iCloud ein Stand, ersetzt er das Onboarding.
    $('btnObAnmelden').addEventListener('click', function(){ kontoAnmelden(); });
    ob.querySelectorAll('[data-ob-ziel]').forEach(function(b){
      b.addEventListener('click', function(){
        var z = b.getAttribute('data-ob-ziel');
        var i = obZiele.indexOf(z);
        if (i === -1) obZiele.push(z); else obZiele.splice(i, 1);
        b.setAttribute('aria-checked', i === -1 ? 'true' : 'false');
        $('btnObZielWeiter').disabled = !obZiele.length;
      });
    });
  }

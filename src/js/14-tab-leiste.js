// ---------- Tab-Leiste ----------
  // Jede Ansicht gehoert zu einem Reiter; der Reiter traegt die Markierung auch auf ihren Unterseiten.
  // Im Fragebogen verschwindet die Leiste, damit niemand mitten im Test die Seite wechselt.
  var TAB_VON = {
    landing:'landing', result:'landing', ft:'landing',
    state:'state',
    understand:'understand', archetypes:'understand',
    freunde:'freunde', compare:'freunde',
    profile:'profile', verlauf:'profile', look:'profile', settings:'profile', plus:'profile',
    hilfe:'profile', sprache:'profile', appicon:'profile', recht:'profile'
  };
  var TAB_OHNE = {quiz:1, 'ft-test':1};

  function tabLeisteAnwenden(){
    var leiste = $('tabLeiste');
    if (!leiste) return;
    var ohne = !!TAB_OHNE[currentView];
    leiste.hidden = ohne;
    try{ document.documentElement.classList.toggle('mit-tabs', !ohne); }catch(e){}
    var aktiv = TAB_VON[currentView] || '';
    Array.prototype.forEach.call(leiste.querySelectorAll('.tab'), function(t){
      var an = t.getAttribute('data-tab') === aktiv;
      t.classList.toggle('aktiv', an);
      if (an) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
  }

  // Ein Tipp auf den aktiven Reiter fuehrt wie in iOS zurueck an seinen Anfang bzw. nach oben.
  function tabWaehlen(ziel){
    if (currentView === ziel){ window.scrollTo({top:0, behavior: prefersReducedMotion() ? 'auto' : 'smooth'}); return; }
    if (ziel === 'state') renderStateView();
    else if (ziel === 'understand') renderUnderstand();
    else if (ziel === 'freunde') renderFreunde();
    else if (ziel === 'profile') renderProfile();
    showView(ziel);
  }

  // Die Zeile "Lucenta+" im Profil nennt die laufende Fassung.
  function profilWegeAnwenden(){
    var el = $('profilPlusStand');
    if (el) el.textContent = tx(istPlus() ? 'plus_kurz_aktiv' : 'plus_kurz_frei');
  }

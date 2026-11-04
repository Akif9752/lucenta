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

  // In der App zeichnet die Huelle Apples UITabBar (LucentaTabLeistePlugin.swift); die CSS-Leiste bleibt fuer den Browser.
  var TAB_REITER = [['landing','tab_start'], ['state','tab_tagesform'], ['understand','tab_verstehen'], ['freunde','tab_freunde'], ['profile','tab_profil']];
  var tabNativ = null, tabNativStand = '';

  function tabLeisteAnwenden(){
    var leiste = $('tabLeiste');
    if (!leiste) return;
    var ohne = !!TAB_OHNE[currentView];
    leiste.hidden = ohne || !!tabNativ;
    try{ document.documentElement.classList.toggle('mit-tabs', !ohne); }catch(e){}
    var aktiv = TAB_VON[currentView] || '';
    if (tabNativ){
      // Web-Fenster (Plus, Bild, Onboarding) legen #shell still; die native Leiste laege sonst darueber.
      var shell = $('shell'), sichtbar = !ohne && !(shell && shell.hasAttribute && shell.hasAttribute('inert'));
      var stand = aktiv + '|' + sichtbar;
      if (stand !== tabNativStand){ tabNativStand = stand; try{ tabNativ.setzen({aktiv: aktiv, sichtbar: sichtbar}); }catch(e){} }
    }
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

  function tabNativEinrichten(){
    var m = nativModul('Tabs');
    if (!m || !m.einrichten) return;
    tabNativ = m;
    try{ m.addListener('gewaehlt', function(e){ if (e && e.id) tabWaehlen(e.id); }); }catch(e){}
    try{
      var shell = $('shell');
      if (shell && window.MutationObserver) new MutationObserver(tabLeisteAnwenden).observe(shell, {attributes:true, attributeFilter:['inert']});
    }catch(e){}
    tabNativTitel();
  }
  // Auch nach jedem Sprachwechsel: Die Titel der nativen Leiste kommen aus den Sprachpaketen.
  function tabNativTitel(){
    if (!tabNativ) return;
    tabNativStand = '';
    try{
      tabNativ.einrichten({reiter: TAB_REITER.map(function(r){ return {id: r[0], titel: tx(r[1])}; })}).then(tabLeisteAnwenden, function(){});
    }catch(e){}
  }

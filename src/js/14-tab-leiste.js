// ---------- Tab-Leiste ----------
  // Jede Ansicht gehoert zu einem Reiter; der Reiter traegt die Markierung auch auf ihren Unterseiten.
  // Im Fragebogen verschwindet die Leiste, damit niemand mitten im Test die Seite wechselt.
  var TAB_VON = {
    landing:'landing', result:'landing', ft:'landing',
    state:'state', rueckblick:'state',
    understand:'understand', archetypes:'understand', archrolle:'understand',
    freunde:'freunde', compare:'freunde',
    profile:'profile', verlauf:'profile', name:'profile', profilverlauf:'profile', look:'profile', settings:'profile', plus:'profile',
    hilfe:'profile', sprache:'profile', appicon:'profile', recht:'profile'
  };
  var TAB_OHNE = {quiz:1, 'ft-test':1};

  // Die Leiste zeichnet die Huelle als Apples UITabBar (LucentaTabLeistePlugin.swift); hier nur Stand und Titel.
  var TAB_REITER = [['landing','tab_start'], ['state','tab_tagesform'], ['understand','tab_verstehen'], ['freunde','tab_freunde'], ['profile','tab_profil']];
  var tabNativ = null, tabNativStand = '';

  function tabLeisteAnwenden(){
    var ohne = !!TAB_OHNE[currentView];
    try{ document.documentElement.classList.toggle('mit-tabs', !ohne); }catch(e){}
    if (!tabNativ) return;
    // Web-Fenster (Plus, Bild, Onboarding) legen #shell still; die native Leiste laege sonst darueber.
    var shell = $('shell'), sichtbar = !ohne && !(shell && shell.hasAttribute && shell.hasAttribute('inert'));
    var aktiv = TAB_VON[currentView] || '';
    var stand = aktiv + '|' + sichtbar;
    if (stand !== tabNativStand){ tabNativStand = stand; try{ tabNativ.setzen({aktiv: aktiv, sichtbar: sichtbar}); }catch(e){} }
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
    // Nur im Entwicklungsbau: Messwerkzeuge im Simulator (tools/flackern) waehlen Reiter wie ein Tipp.
    if (entwicklungsBau()) window.__lucentaTab = tabWaehlen;
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

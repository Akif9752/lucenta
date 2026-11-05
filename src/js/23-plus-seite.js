  // ---------- Lucenta+ als eigene Seite ----------
  // Aus Profil und Einstellungen oeffnet sich eine Seite, nicht das Kauffenster (Auftrag des Inhabers): mit Abo
  // Stand, Laufzeit, was freigeschaltet ist, Verwalten und Wiederherstellen; ohne Abo dasselbe Angebot
  // wie im Fenster, gekauft wird weiter dort (eine Stelle fuer Preise und Laufzeitwahl).
  function plusVorteileHTML(){
    return PLUS_VORTEILE.map(function(v){
      return '<li class="plus-vorteil">'+plusHaken()+
        '<span class="plus-vorteil-text"><strong>'+tx(v.titel)+'</strong>'+
        '<span>'+tx(v.text)+'</span></span></li>';
    }).join('');
  }
  function plusPreisZeile(){
    var jahr = (PLUS_PREISE && PLUS_PREISE.jahr) || tx('plus_betrag_jahr');
    var monat = (PLUS_PREISE && PLUS_PREISE.monat) || tx('plus_betrag_monat');
    return tx('plus_name_jahr')+' '+jahr+' · '+tx('plus_name_monat')+' '+monat;
  }
  function renderPlusSeite(){
    var aktiv = istPlus();
    var produkt = '';
    try{ produkt = localStorage.getItem(PLUS_PRODUKT) || ''; }catch(e){}
    $('plusSeiteTitel').textContent = tx(aktiv ? 'plus_seite_aktiv' : 'plus_modal_titel');
    $('plusSeiteStand').innerHTML = aktiv
      ? tx(/jahr/.test(produkt) ? 'plus_seite_jahr' : (/monat/.test(produkt) ? 'plus_seite_monat' : 'plus_seite_laufend'))
      : tx('plus_stand_frei');
    var knoepfe = aktiv
      ? '<button type="button" class="btn btn-primary" data-plus-seite="verwalten">'+tx('plus_verwalten')+'</button>'
      : '<button type="button" class="btn btn-primary" data-plus-seite="kaufen">'+(probeTage() ? tfText('plus_cta_probe', {n: probeTage()}) : tx('plus_aktivieren'))+'</button>'+
        '<p class="plus-seite-preise">'+plusPreisZeile()+'</p>';
    $('plusSeiteInhalt').innerHTML =
      '<div class="settings-group"><h2>'+tx(aktiv ? 'plus_seite_freigeschaltet' : 'plus_seite_enthalten')+'</h2>'+
        '<ul class="plus-vorteile">'+plusVorteileHTML()+'</ul></div>'+
      '<div class="plus-seite-knoepfe">'+knoepfe+
        '<button type="button" class="plus-modal-leise" data-plus-seite="wiederherstellen">'+tx('plus_wiederherstellen')+'</button>'+
        '<p class="settings-hint">'+tx('plus_kuendigen')+'</p></div>';
  }
  // Lucenta+ ist Unterseite des Profils ODER der Einstellungen; der Zurueck-Weg folgt der Herkunft.
  function plusSeiteOeffnen(von){
    UNTERSEITE_VON.plus = von;
    var pille = $('btnBackFromPlus');
    if (pille){ var k = von === 'settings' ? 'hilfe_zurueck' : 'zurueck_profil'; pille.setAttribute('data-i18n', k); pille.textContent = tx(k); }
    renderPlusSeite();
    showView('plus');
  }
  // Rechtliches oeffnet sich aus Einstellungen, Lucenta+-Seite oder Kauffenster; zurueck geht es dorthin.
  var RECHT_ZURUECK = {settings: 'hilfe_zurueck', profile: 'zurueck_profil', plus: 'zurueck_lucenta_plus'};
  function rechtOeffnen(){
    var von = currentView && currentView !== 'recht' ? currentView : 'settings';
    UNTERSEITE_VON.recht = von;
    var pille = $('btnBackFromRecht'), k = RECHT_ZURUECK[von] || 'start_8';
    if (pille){ pille.setAttribute('data-i18n', k); pille.textContent = tx(k); }
    showView('recht');
  }
  function plusSeiteVerdrahten(){
    $('btnBackFromPlus').addEventListener('click', function(){
      var von = UNTERSEITE_VON.plus;
      if (von === 'profile') renderProfile(); else if (von === 'settings') renderSettings();
      showView(von);
    });
    $('plusSeiteInhalt').addEventListener('click', function(e){
      var b = e.target.closest ? e.target.closest('[data-plus-seite]') : null;
      if (!b) return;
      var was = b.getAttribute('data-plus-seite');
      if (was === 'kaufen') openPlusModal();
      else if (was === 'verwalten') aboVerwalten();
      else if (was === 'wiederherstellen') kaeufeWiederherstellen();
    });
  }

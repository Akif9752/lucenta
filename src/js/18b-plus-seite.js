  // ---------- Lucenta+ als eigene Seite ----------
  // Aus der Seitenleiste oeffnet sich eine Seite, nicht das Kauffenster (Auftrag des Inhabers): mit Abo
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
      : '<button type="button" class="btn btn-primary" data-plus-seite="kaufen">'+tx('plus_aktivieren')+'</button>'+
        '<p class="plus-seite-preise">'+plusPreisZeile()+'</p>';
    $('plusSeiteInhalt').innerHTML =
      '<div class="settings-group"><h2>'+tx(aktiv ? 'plus_seite_freigeschaltet' : 'plus_seite_enthalten')+'</h2>'+
        '<ul class="plus-vorteile">'+plusVorteileHTML()+'</ul></div>'+
      '<div class="plus-seite-knoepfe">'+knoepfe+
        '<button type="button" class="plus-modal-leise" data-plus-seite="wiederherstellen">'+tx('plus_wiederherstellen')+'</button>'+
        '<p class="settings-hint">'+tx('plus_kuendigen')+'</p></div>';
  }
  function plusSeiteVerdrahten(){
    $('btnBackFromPlus').addEventListener('click', function(){ showView('landing'); });
    $('plusSeiteInhalt').addEventListener('click', function(e){
      var b = e.target.closest ? e.target.closest('[data-plus-seite]') : null;
      if (!b) return;
      var was = b.getAttribute('data-plus-seite');
      if (was === 'kaufen') openPlusModal();
      else if (was === 'verwalten') aboVerwalten();
      else if (was === 'wiederherstellen') kaeufeWiederherstellen();
    });
  }

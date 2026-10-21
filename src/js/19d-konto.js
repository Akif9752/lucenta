  // ---------- Mit Apple anmelden + iCloud ----------
  // Freiwillig (Richtlinie 5.1.1): Ohne Anmeldung funktioniert alles wie bisher. Angemeldet wird der
  // Bestand (dasselbe Format wie "Daten sichern", datenSammeln) verschluesselt in die PRIVATE iCloud
  // der Person gelegt (LucentaKontoPlugin.swift) — kein eigener Server (Entscheidung des Inhabers).
  var KONTO_ZULETZT = 'lucenta_icloud_zuletzt';
  var kontoStand = {angemeldet: false, icloud: true};
  var kontoLetzterInhalt = null;

  function kontoModul(){
    var k = nativVorhanden() && nativModul('Account');
    return (k && k.stand) ? k : null;
  }
  function kontoZuletzt(){
    try{ return +localStorage.getItem(KONTO_ZULETZT) || 0; }catch(e){ return 0; }
  }
  function kontoDatum(ms){
    try{ return historyDateFmt().format(new Date(ms)); }catch(e){ return ''; }
  }

  var APPLE_LOGO = '<svg width="16" height="19" viewBox="0 0 814 1000" aria-hidden="true"><path fill="currentColor" d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 202-1 3-21 72-69 142-43 62-88 124-157 124s-87-40-166-40c-77 0-104 41-167 41s-107-57-157-127C40 790 0 663 0 543c0-193 125-295 249-295 66 0 121 43 162 43 39 0 101-46 176-46 29 0 131 3 201 96zM554 159c31-37 53-88 53-139 0-7-1-14-2-20-50 2-110 34-146 76-28 32-55 84-55 136 0 8 1 16 2 18 3 1 9 2 14 2 45 0 102-30 134-73z"/></svg>';

  function kontoAnwenden(){
    var wrap = $('kontoIcloud');
    if (!wrap) return;
    if (!kontoModul()){ wrap.hidden = true; return; }
    wrap.hidden = false;
    if (!kontoStand.angemeldet){
      wrap.innerHTML = '<p class="settings-hint">'+tx('konto_text_aus')+'</p>'+
        '<button type="button" class="apple-knopf" data-konto="anmelden">'+APPLE_LOGO+'<span>'+tx('konto_apple')+'</span></button>';
      return;
    }
    var zuletzt = kontoZuletzt();
    wrap.innerHTML = '<p class="settings-hint">'+tx('konto_text_an')+
        (zuletzt ? ' '+tx('konto_zuletzt')+' '+kontoDatum(zuletzt)+'.' : '')+'</p>'+
      (kontoStand.icloud === false ? '<p class="settings-hint konto-warnung">'+tx('konto_kein_icloud')+'</p>' : '')+
      '<div class="daten-knoepfe">'+
        '<button type="button" class="btn btn-ghost btn-sm" data-konto="sichern">'+tx('konto_sichern')+'</button>'+
        '<button type="button" class="btn btn-ghost btn-sm" data-konto="laden">'+tx('konto_laden')+'</button>'+
        '<button type="button" class="btn btn-ghost btn-sm" data-konto="abmelden">'+tx('konto_abmelden')+'</button>'+
      '</div>';
  }

  // Antworten der Bruecke, die keine Fehler sind, sondern etwas, das die Person wissen sollte.
  function kontoHinweis(r){
    if (!r) return false;
    if (r.keinIcloud){ kontoStand.icloud = false; kontoAnwenden(); toast(tx('konto_kein_icloud')); return true; }
    if (r.offline){ toast(tx('konto_offline')); return true; }
    if (r.zuGross){ toast(tx('konto_zu_gross')); return true; }
    return false;
  }

  function kontoSichern(still){
    var k = kontoModul();
    if (!k || !kontoStand.angemeldet) return;
    var inhalt = datenSammeln();
    // Unveraenderte Stande nicht erneut senden; der Zeitstempel in datenSammeln zaehlt nicht mit.
    var vergleich = inhalt.replace(/"ts":\d+,?/, '');
    if (still && vergleich === kontoLetzterInhalt) return;
    k.sichern({daten: inhalt}).then(function(r){
      if (r && r.gesichert){
        kontoLetzterInhalt = vergleich;
        try{ localStorage.setItem(KONTO_ZULETZT, String(Math.round(r.zeit || Date.now()))); }catch(e){}
        kontoAnwenden();
        if (!still) toast(tx('konto_gesichert'));
      } else if (!still) kontoHinweis(r);
    }).catch(function(){ if (!still) toast(tx('konto_fehler')); });
  }

  // Nach der Anmeldung (und auf Wunsch): Liegt in der iCloud ein Stand, wird er auf einem leeren Geraet
  // uebernommen; hat auch dieses Geraet Daten, entscheidet die Person. Sonst wird gesichert.
  function kontoLaden(nachAnmeldung, fertig){
    var k = kontoModul();
    if (!k) return;
    k.laden().then(function(r){
      if (kontoHinweis(r)){ if (fertig) fertig(false); return; }
      if (!r || r.leer || !r.daten){
        if (!nachAnmeldung) toast(tx('konto_leer'));
        kontoSichern(true);
        if (fertig) fertig(false);
        return;
      }
      var hatEigenes = !!(loadResult() || loadHistory().length || loadStateHistory().length);
      var uebernehmen = !hatEigenes ||
        window.confirm(decodeEntities(tx('konto_frage_laden').split('{datum}').join(kontoDatum(r.zeit))));
      if (uebernehmen){
        try{ localStorage.setItem('lucenta_onboarding', '1'); }catch(e){}
        datenEinspielen(r.daten);     // laedt danach neu
        if (fertig) fertig(true);
      } else {
        kontoSichern(false);
        if (fertig) fertig(false);
      }
    }).catch(function(){ toast(tx('konto_fehler')); if (fertig) fertig(false); });
  }

  function kontoAnmelden(fertig){
    var k = kontoModul();
    if (!k) return;
    k.anmelden().then(function(r){
      if (!r || !r.angemeldet){ if (fertig) fertig(false); return; }
      kontoStand.angemeldet = true;
      kontoAnwenden();
      kontoLaden(true, fertig);
    }).catch(function(){ toast(tx('konto_fehler')); if (fertig) fertig(false); });
  }

  function kontoVerdrahten(){
    var wrap = $('kontoIcloud');
    if (wrap) wrap.addEventListener('click', function(e){
      var b = e.target.closest ? e.target.closest('[data-konto]') : null;
      if (!b) return;
      var was = b.getAttribute('data-konto');
      if (was === 'anmelden') kontoAnmelden();
      else if (was === 'sichern') kontoSichern(false);
      else if (was === 'laden') kontoLaden(false);
      else if (was === 'abmelden'){
        var k = kontoModul();
        if (k) k.abmelden().then(function(){ kontoStand.angemeldet = false; kontoAnwenden(); toast(tx('konto_abgemeldet')); });
      }
    });
    // Beim Verlassen der App still sichern, wenn sich etwas geaendert hat.
    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'hidden') kontoSichern(true);
    });
  }

  function kontoStart(){
    var k = kontoModul();
    kontoAnwenden();
    if (!k) return;
    k.stand().then(function(r){
      kontoStand.angemeldet = !!(r && r.angemeldet);
      kontoStand.icloud = r && r.icloud !== false;
      kontoAnwenden();
      var ob = $('btnObAnmelden');
      if (ob) ob.hidden = kontoStand.angemeldet;
    }).catch(function(){});
    var ob = $('btnObAnmelden');
    if (ob) ob.hidden = false;
  }

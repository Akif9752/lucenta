// ---------- Die native Bruecke ----------
// Funktionen, die es nur in der App gibt (Richtlinie 4.2): Erinnerungen an die Tagesform, Ergebnisbild
// in die Foto-Mediathek, Kauf und Wiederherstellen (3.1.2).
// Alles prueft ueber nativVorhanden(), ob eine Bruecke da ist; im Browser stehen die Knoepfe
// abgeschaltet mit Begruendung, nie halb funktionierend.
  function nativVorhanden(){
    try{
      return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    }catch(e){ return false; }
  }
  // Entwicklungsbau? Die Marke setzt MainViewController.swift nur hinter #if DEBUG. Sie schaltet den
  // Plus-Umschalter im Profil frei und verhindert, dass die Store-Abfrage beim Start einen von Hand
  // gesetzten Plus-Stand wegnimmt.
  function entwicklungsBau(){
    try{ return window.__lucentaEntwicklungsbau === true; }catch(e){ return false; }
  }
  function nativModul(name){
    try{
      var p = window.Capacitor && window.Capacitor.Plugins;
      return (p && p[name]) ? p[name] : null;
    }catch(e){ return null; }
  }

  // ---------- Bestand auf dem Geraet spiegeln ----------
  // iOS darf den Speicher der WebView leeren; die Huelle haelt eine Kopie in einer Datei
  // (LucentaBestand.swift) und spielt sie vor dem Start zurueck, wenn localStorage leer ist.
  var BESTAND_VERZOEGERUNG = 1000;
  var bestandUhr = 0;
  function bestandEmpfaenger(){
    try{ return window.webkit.messageHandlers.lucentaBestand || null; }catch(e){ return null; }
  }
  function bestandJetztSpiegeln(){
    clearTimeout(bestandUhr); bestandUhr = 0;
    var empf = bestandEmpfaenger();
    if (!empf) return;
    var d = {};
    try{
      for (var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        if (k && k.indexOf('lucenta_') === 0) d[k] = localStorage.getItem(k);
      }
      empf.postMessage(d);
    }catch(e){}
  }
  function bestandSpaeterSpiegeln(){
    if (!bestandUhr) bestandUhr = setTimeout(bestandJetztSpiegeln, BESTAND_VERZOEGERUNG);
  }
  // Faengt jeden Schreibzugriff, statt jede Speicherstelle einzeln zu verdrahten.
  function bestandSpiegelnEinrichten(){
    if (!bestandEmpfaenger() || !window.Storage) return;
    ['setItem', 'removeItem'].forEach(function(name){
      var alt = Storage.prototype[name];
      Storage.prototype[name] = function(k){
        var r = alt.apply(this, arguments);
        if (this === window.localStorage && String(k).indexOf('lucenta_') === 0) bestandSpaeterSpiegeln();
        return r;
      };
    });
    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'hidden') bestandJetztSpiegeln();
    });
    window.addEventListener('pagehide', bestandJetztSpiegeln);
    bestandJetztSpiegeln();
  }

  // ---------- Tagesform-Widget ----------
  // Austausch ueber die App Group (LucentaWidgetBruecke.swift): Die Seite meldet den heutigen Stand,
  // holt Eintraege aus dem Widget ab und quittiert sie. Im Browser geschieht nichts.
  function widgetEmpfaenger(){
    try{ return window.webkit.messageHandlers.lucentaWidget || null; }catch(e){ return null; }
  }
  function widgetStandMelden(){
    var empf = widgetEmpfaenger();
    if (!empf) return;
    var eintraege = {}, heute = heuteEingetragen();
    Object.keys(heute).forEach(function(s){
      eintraege[s] = {energy: Math.round(heute[s].energy), valence: Math.round(heute[s].valence)};
    });
    try{ empf.postMessage({stand: {tag: todayKey(), eintraege: eintraege, erinnerungAlle: erinnerungAlle()}}); }catch(e){}
  }
  function widgetAbholen(){
    var empf = widgetEmpfaenger();
    if (empf) try{ empf.postMessage({abholen: true}); }catch(e){}
  }
  function tagSchluessel(ts){
    var d = new Date(ts);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  // Ein Widget-Eintrag ersetzt einen aelteren derselben Tageszeit, nie einen neueren aus der App.
  function widgetEingangUebernehmen(liste){
    if (!Array.isArray(liste)) return;
    var h = loadStateHistory(), jetzt = Date.now(), quittiert = [], neu = [];
    liste.forEach(function(x){
      if (!x || typeof x.ts !== 'number') return;
      quittiert.push(x.ts);
      var gueltig = [x.energy, x.valence].every(function(v){ return v === Math.round(v) && v >= 1 && v <= 5; });
      if (!gueltig || x.ts > jetzt + 6e4 || x.ts < jetzt - 3 * 864e5) return;
      var e = {day: tagSchluessel(x.ts), ts: x.ts, energy: x.energy, valence: x.valence, slot: zeitabschnitt(x.ts)};
      if (h.some(function(a){ return a.day === e.day && a.slot === e.slot && a.ts >= e.ts; })) return;
      var alt = h.filter(function(a){ return a.day === e.day && a.slot === e.slot; })[0];
      h = h.filter(function(a){ return a !== alt; });
      h.push(e); neu.push([e, alt]);
    });
    if (neu.length){
      h.sort(function(a,b){ return a.ts-b.ts; });
      saveStateHistoryList(h);
      try{
        var aktiv = document.querySelector('.view.active');
        if (aktiv && aktiv.id === 'view-state') renderStateView();
        refreshDrawerState(); renderLandingStateTeaser();
      }catch(e){}
      erinnerungNachziehen();
      neu.forEach(function(p){ healthNachEintrag(p[0], p[1]); });
    }
    var empf = widgetEmpfaenger();
    if (empf && quittiert.length) try{ empf.postMessage({verarbeitet: quittiert}); }catch(e){}
  }
  function widgetLink(url){
    if (!/^lucenta:\/\/tagesform/.test(url || '')) return;
    try{ closeDrawer(true); }catch(e){}
    renderStateView(); showView('state');
  }
  function widgetEinrichten(){
    if (!widgetEmpfaenger()) return;
    window.lucentaWidgetEingang = widgetEingangUebernehmen;
    window.lucentaWidgetAbholen = widgetAbholen;     // Kurzbefehl bei offener App (LucentaWidgetBruecke.swift)
    window.lucentaWidgetLink = widgetLink;
    var app = nativModul('App');
    if (app && app.getLaunchUrl) app.getLaunchUrl().then(function(r){ if (r) widgetLink(r.url); }).catch(function(){});
    if (app && app.addListener) app.addListener('appUrlOpen', function(ev){ if (ev) widgetLink(ev.url); });
    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'visible'){ widgetAbholen(); widgetStandMelden(); }
    });
    widgetAbholen();
    widgetStandMelden();
  }

  // ---------- App-Sperre (Face ID, Touch ID, Code) ----------
  // Gesperrt wird nativ (LucentaSperre.swift); hier nur Schalter, Zeitpunkt und die Texte der Decke.
  // Frei, Zeitpunkt waehlbar (Entscheidungen des Inhabers).
  var SPERRE_TITEL = {faceID: 'sperre_titel_faceid', touchID: 'sperre_titel_touchid', code: 'sperre_titel_code'};
  var sperreStand = null;
  function sperreModul(){
    var m = nativVorhanden() && nativModul('Lock');
    return (m && m.stand) ? m : null;
  }
  function sperreAnwenden(r){
    var zeile = $('sperreZeile'), nach = $('sperreNachZeile');
    if (!zeile || !nach) return;
    sperreStand = (r && r.verfuegbar) ? r : null;
    zeile.hidden = !sperreStand;
    nach.hidden = !(sperreStand && sperreStand.an);
    if (!sperreStand) return;
    var titel = $('sperreTitel'), schluessel = SPERRE_TITEL[r.art] || SPERRE_TITEL.code;
    titel.setAttribute('data-i18n', schluessel);
    titel.textContent = decodeEntities(tx(schluessel));
    $('sperreSchalter').setAttribute('aria-checked', r.an ? 'true' : 'false');
    nach.querySelectorAll('[data-nach]').forEach(function(b){
      b.setAttribute('aria-checked', +b.getAttribute('data-nach') === (r.nach || 0) ? 'true' : 'false');
    });
  }
  // Bei jedem Oeffnen der Einstellungen: Stand und Texte in der aktuellen Sprache.
  function sperreNachziehen(){
    var m = sperreModul();
    if (!m) return;
    m.stand().then(sperreAnwenden).catch(function(){});
    m.texte({titel: decodeEntities(tx('sperre_gesperrt')), knopf: decodeEntities(tx('sperre_entsperren')),
             grund: decodeEntities(tx('sperre_grund'))}).catch(function(){});
  }
  function sperreEinrichten(){
    var m = sperreModul(), schalter = $('sperreSchalter'), nach = $('sperreNach');
    if (!m || !schalter || !nach) return;
    schalter.addEventListener('click', function(){
      if (!sperreStand) return;
      m.setzen({an: !sperreStand.an}).then(sperreAnwenden).catch(function(){});
    });
    nach.addEventListener('click', function(e){
      var b = e.target.closest ? e.target.closest('[data-nach]') : null;
      if (b) m.setzen({nach: +b.getAttribute('data-nach')}).then(sperreAnwenden).catch(function(){});
    });
    sperreNachziehen();
  }

  // ---------- Apple Health: Stimmung als Gemuetszustand ----------
  // Nur schreiben, nie lesen; Vorgabe aus (Entscheidung des Inhabers). LucentaGesundheitPlugin.swift,
  // ab iOS 18. Die Kennung des Health-Eintrags steht als `hk` am Eintrag, damit Ersetzen ihn mitnimmt.
  var HEALTH_AN = 'lucenta_health';
  function healthModul(){
    var h = nativVorhanden() && nativModul('Health');
    return (h && h.stand) ? h : null;
  }
  function healthAn(){ return schalterLesen(HEALTH_AN, 'aus') === 'an'; }
  function healthNachEintrag(e, alt){
    var h = healthModul();
    if (!h || !healthAn() || !e) return;
    if (alt && alt.hk) h.loeschen({uuid: alt.hk}).catch(function(){});
    h.schreiben({ts: e.ts, valence: e.valence}).then(function(r){
      if (!r || !r.uuid) return;
      var liste = loadStateHistory(), x = liste.filter(function(a){ return a.ts === e.ts; })[0];
      if (x){ x.hk = r.uuid; saveStateHistoryList(liste); }
    }).catch(function(){});
  }
  function healthEinrichten(){
    var zeile = $('healthZeile'), schalter = $('healthSchalter'), h = healthModul();
    if (!zeile || !schalter || !h) return;
    h.stand().then(function(r){
      if (!r || !r.verfuegbar) return;
      zeile.hidden = false;
      // In Health widerrufen: Der Schalter steht dann wieder aus.
      schalterSetzen(HEALTH_AN, healthAn() && r.erlaubt !== false ? 'an' : 'aus', 'healthSchalter');
    }).catch(function(){});
    schalter.addEventListener('click', function(){
      if (healthAn()){ schalterSetzen(HEALTH_AN, 'aus', 'healthSchalter'); return; }
      h.erlauben().then(function(r){
        if (r && r.erlaubt) schalterSetzen(HEALTH_AN, 'an', 'healthSchalter');
        else toast(tx('health_verweigert'));
      }).catch(function(){ toast(tx('health_verweigert')); });
    });
  }

  // ---------- Erinnerung: einmal am Tag, auf Wunsch zu jeder Tageszeit ----------
  // Vorgabe EINE am Tag um 20 Uhr, nur wenn der Tag noch leer ist; drei Zeiten + Nacherinnerung nur ueber
  // den zweiten Schalter (Entscheidung des Inhabers, loest die feste Dreierregel ab). Fuer eine schon eingetragene Tageszeit
  // kommt keine Erinnerung — iOS kann eine Wiederholung nicht fuer einen Tag aussetzen, deshalb werden
  // die Mitteilungen der naechsten ERINNERUNG_TAGE Tage EINZELN geplant und bei jedem Eintrag und
  // Oeffnen neu gesetzt. Wer zehn Tage nicht oeffnet, bekommt keine mehr (gewollt).
  var ERINNERUNG_AN = 'lucenta_erinnerung';
  var ERINNERUNG_ID = 4711;            // die alte taegliche Mitteilung; wird beim Planen mit abgesagt
  // 9, 14, 20 Uhr plus Nacherinnerung zwei Stunden spaeter: sechs am Tag. iOS haelt hoechstens 64
  // ausstehende Mitteilungen je App, daher 10 Tage (60).
  var ERINNERUNG_ID_BASIS = 47100, ERINNERUNG_TAGE = 10, ERINNERUNG_JE_TAG = 6;
  var ERINNERUNG_ALT_ANZAHL = 42;      // Runde 130: 14 x 3 — beim Absagen mit erfasst
  // Innerhalb der Abschnitte aus TF_ABSCHNITT_BEGINN (bis 12, bis 18): 9 und 11, 14 und 16, 20 und 22.
  var ERINNERUNG_STUNDE = {morgen:9, mittag:14, abend:20};
  var ERINNERUNG_NACH_STUNDEN = 2;
  var ERINNERUNG_TITEL = {morgen:'erinnerung_titel_morgen', mittag:'erinnerung_titel_mittag', abend:'erinnerung_titel_abend'};
  var ERINNERUNG_NACH_TITEL = {morgen:'erinnerung_nach_morgen', mittag:'erinnerung_nach_mittag', abend:'erinnerung_nach_abend'};
  var ERINNERUNG_ALLE = 'lucenta_erinnerung_alle';
  // Uhrzeit der einen Erinnerung am Tag, waehlbar (Entscheidung des Inhabers); "HH:MM", Vorgabe 20:00.
  var ERINNERUNG_ZEIT = 'lucenta_erinnerung_zeit';
  function erinnerungZeit(){
    var m = /^(\d{1,2}):(\d{2})$/.exec(schalterLesen(ERINNERUNG_ZEIT, ''));
    var h = m ? +m[1] : ERINNERUNG_STUNDE.abend, mi = m ? +m[2] : 0;
    return (h >= 0 && h < 24 && mi >= 0 && mi < 60) ? {h: h, m: mi} : {h: ERINNERUNG_STUNDE.abend, m: 0};
  }
  function zeitText(z){
    try{ return new Intl.DateTimeFormat(tx('datum_gebietsschema'), {hour:'numeric', minute:'2-digit'}).format(new Date(2024, 0, 1, z.h, z.m)); }
    catch(e){ return (z.h < 10 ? '0' : '') + z.h + ':' + (z.m < 10 ? '0' : '') + z.m; }
  }
  function erinnerungAn(){
    return schalterLesen(ERINNERUNG_AN, 'aus') === 'an';
  }
  function erinnerungAlle(){
    return schalterLesen(ERINNERUNG_ALLE, 'aus') === 'an';
  }
  function erinnerungHinweisText(){
    if (!erinnerungAlle()) return tfText('erinnerung_hinweis_einmal', {abend: zeitText(erinnerungZeit())});
    return tfText('erinnerung_hinweis', {morgen: tfUhrzeit(ERINNERUNG_STUNDE.morgen),
      mittag: tfUhrzeit(ERINNERUNG_STUNDE.mittag), abend: tfUhrzeit(ERINNERUNG_STUNDE.abend)});
  }
  // Die Erinnerung steht an zwei Stellen (Einstellungen, Tagesform); diese Funktion setzt beide.
  var ERINNERUNG_STELLEN = [['erinnerungSchalter','erinnerungHinweis'],
                            ['tfErinnerungSchalter','tfErinnerungHinweis']];
  function erinnerungAnwenden(){
    var moeglich = nativVorhanden();
    ERINNERUNG_STELLEN.forEach(function(ids){
      var s = $(ids[0]), h = $(ids[1]);
      if (!s) return;
      s.setAttribute('aria-checked', (moeglich && erinnerungAn()) ? 'true' : 'false');
      s.disabled = !moeglich;
      if (h) h.textContent = decodeEntities(moeglich ? erinnerungHinweisText() : tx('erinnerung_nur_app'));
    });
    var alle = $('erinnerungAlleSchalter'), zeile = $('erinnerungAlleZeile');
    if (zeile) zeile.hidden = !(moeglich && erinnerungAn());
    var zz = $('erinnerungZeitZeile'), zf = $('erinnerungZeit');
    if (zz) zz.hidden = !(moeglich && erinnerungAn() && !erinnerungAlle());
    if (zf && document.activeElement !== zf){ var z = erinnerungZeit(); zf.value = (z.h < 10 ? '0' : '') + z.h + ':' + (z.m < 10 ? '0' : '') + z.m; }
    if (alle) alle.setAttribute('aria-checked', erinnerungAlle() ? 'true' : 'false');
  }
  function erinnerungZeitSetzen(wert){
    if (!/^\d{1,2}:\d{2}$/.test(wert || '')) return;
    schalterSetzen(ERINNERUNG_ZEIT, wert, null);
    if (nativVorhanden() && erinnerungAn()) erinnerungPlanen();
    erinnerungAnwenden();
  }
  function erinnerungAlleUmschalten(){
    if (!nativVorhanden() || !erinnerungAn()) return;
    schalterSetzen(ERINNERUNG_ALLE, erinnerungAlle() ? 'aus' : 'an', null);
    erinnerungPlanen();
    erinnerungAnwenden();
  }
  function istErinnerungsId(id){
    return id === ERINNERUNG_ID ||
      (id >= ERINNERUNG_ID_BASIS && id < ERINNERUNG_ID_BASIS + Math.max(ERINNERUNG_TAGE * ERINNERUNG_JE_TAG, ERINNERUNG_ALT_ANZAHL));
  }
  // Runde 124: Ein Tipp auf die Mitteilung oeffnet die Tagesform, nicht die Startseite. Sie ist der
  // einzige Grund, aus dem die Mitteilung kommt; auf der Startseite muesste man sie erst suchen.
  function erinnerungTippVerdrahten(oeffnen){
    var lm = nativModul('LocalNotifications');
    if (!lm || !lm.addListener) return;
    try{
      lm.addListener('localNotificationActionPerformed', function(ev){
        var id = ev && ev.notification && ev.notification.id;
        if (istErinnerungsId(id)) oeffnen();
      });
    }catch(e){}
  }
  // Die Liste, die geplant wird — getrennt vom Planen, damit pruef-nativ sie ohne Bruecke nachrechnen
  // kann. `jetzt` als Parameter aus demselben Grund.
  function erinnerungListe(jetzt){
    var heute = heuteEingetragen(), liste = [];
    if (!erinnerungAlle()){
      var heuteLeer = !TF_ABSCHNITTE.some(function(s){ return heute[s]; });
      for (var d = 0; d < ERINNERUNG_TAGE; d++){
        if (d === 0 && !heuteLeer) continue;
        var zt = erinnerungZeit();
        var um1 = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() + d, zt.h, zt.m, 0);
        if (um1.getTime() <= jetzt.getTime()) continue;
        liste.push({id: ERINNERUNG_ID_BASIS + d * ERINNERUNG_JE_TAG, title: decodeEntities(tx(ERINNERUNG_TITEL.abend)),
          body: decodeEntities(tx('erinnerung_text_mitteilung')), schedule: {at: um1, allowWhileIdle: true}});
      }
      return liste;
    }
    for (var t = 0; t < ERINNERUNG_TAGE; t++){
      TF_ABSCHNITTE.forEach(function(s, k){
        if (t === 0 && heute[s]) return;                   // heute schon eingetragen: keine Erinnerung
        [0, 1].forEach(function(nach){
          var um = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() + t,
                            ERINNERUNG_STUNDE[s] + nach * ERINNERUNG_NACH_STUNDEN, 0, 0);
          if (um.getTime() <= jetzt.getTime()) return;    // iOS weist Zeiten in der Vergangenheit ab
          liste.push({
            id: ERINNERUNG_ID_BASIS + t * ERINNERUNG_JE_TAG + k * 2 + nach,
            title: decodeEntities(tx(nach ? ERINNERUNG_NACH_TITEL[s] : ERINNERUNG_TITEL[s])),
            body: decodeEntities(tx('erinnerung_text_mitteilung')),
            schedule: {at: um, allowWhileIdle: true}
          });
        });
      });
    }
    return liste;
  }
  function erinnerungAlleIds(){
    var ids = [{id: ERINNERUNG_ID}];
    var n = Math.max(ERINNERUNG_TAGE * ERINNERUNG_JE_TAG, ERINNERUNG_ALT_ANZAHL);
    for (var i = 0; i < n; i++) ids.push({id: ERINNERUNG_ID_BASIS + i});
    return ids;
  }
  function erinnerungPlanen(){
    var lm = nativModul('LocalNotifications');
    if (!lm) return;
    // Erst ALLE alten absagen, dann neu setzen — nacheinander, nicht gleichzeitig: Kaeme das Absagen
    // nach dem Setzen an, waeren die neuen gleich wieder weg.
    var liste = erinnerungListe(new Date());
    var setzen = function(){ if (liste.length){ try{ lm.schedule({notifications: liste}); }catch(e){} } };
    try{
      Promise.resolve(lm.cancel({notifications: erinnerungAlleIds()})).then(setzen, setzen);
    }catch(e){ setzen(); }
  }
  function erinnerungAbsagen(){
    var lm = nativModul('LocalNotifications');
    if (!lm) return;
    try{ lm.cancel({notifications: erinnerungAlleIds()}); }catch(e){}
  }
  // Nach jedem Eintrag und bei jedem Oeffnen: das Fenster nachziehen. Ausgeschaltet tut es nichts.
  function erinnerungNachziehen(){
    if (nativVorhanden() && erinnerungAn()) erinnerungPlanen();
  }
  function erinnerungUmschalten(){
    if (!nativVorhanden()) return;
    var an = !erinnerungAn();
    if (an){
      var lm = nativModul('LocalNotifications');
      // Die Erlaubnis wird erst beim Einschalten erfragt, nicht beim Start.
      var weiter = function(erlaubt){
        if (!erlaubt){ toast(tx('erinnerung_verweigert')); erinnerungAnwenden(); return; }
        schalterSetzen(ERINNERUNG_AN, 'an', null);
        erinnerungPlanen();
        erinnerungAnwenden();
        toast(tx('erinnerung_gesetzt'));
      };
      if (lm && lm.requestPermissions){
        try{
          lm.requestPermissions().then(function(r){ weiter(r && r.display === 'granted'); })
            .catch(function(){ weiter(false); });
          return;
        }catch(e){ weiter(false); return; }
      }
      weiter(false);
      return;
    }
    schalterSetzen(ERINNERUNG_AN, 'aus', null);
    erinnerungAbsagen();
    erinnerungAnwenden();
  }

  // ---------- Ergebnisbild in die Foto-Mediathek ----------
  function bildSichernMoeglich(){
    return nativVorhanden() && !!nativModul('Filesystem');
  }
  function bildSichern(datenUrl, dateiname){
    var fs = nativModul('Filesystem');
    if (!fs || !datenUrl){ toast(tx('js_teilen_nicht_möglich__bild')); return; }
    // Die Daten-URL traegt vorn den Typ; die Bruecke will nur den Teil danach.
    var reine = String(datenUrl).replace(/^data:[^,]*,/, '');
    try{
      fs.writeFile({path: dateiname, data: reine, directory: 'DOCUMENTS'})
        .then(function(){ toast(tx('bild_gesichert')); })
        .catch(function(){ toast(tx('js_bild_konnte_nicht_gespeich')); });
    }catch(e){ toast(tx('js_bild_konnte_nicht_gespeich')); }
  }

  // ---------- Der Kauf ----------
  // Gegenseite von ios/App/App/LucentaKaeufePlugin.swift (Modulname 'StoreKit'). Die Produktkennungen
  // stehen absichtlich hier UND dort: Die Swift-Seite weist unbekannte Kennungen ab.
  var PLUS_PRODUKT = 'lucenta_plus_produkt';
  var PRODUKTE = { monat: 'lucenta.plus.monat', jahr: 'lucenta.plus.jahr' };
  function produktKennung(laufzeit){
    return PRODUKTE[laufzeit] || PRODUKTE.jahr;
  }
  // 'lucenta_laufzeit' ist die Wahl im Segmentwaehler, 'lucenta_plus_produkt' das tatsaechlich
  // Gekaufte — getrennt gehalten.
  function plusKaufen(fertig){
    var sk = nativModul('StoreKit');
    if (!sk || !sk.kaufen){ toast(tx('plus_wieder_nur_app')); if (fertig) fertig(false); return; }
    var kennung = produktKennung(laufzeitLesen());
    var antwort = function(r){
      if (r && r.aktiv){
        plusSetzen(true);
        schalterSetzen(PLUS_PRODUKT, (r.produkt || kennung), null);
        plusAnsichtenAuffrischen();
        toast(tx('plus_aktiv'));
        if (fertig) fertig(true);
        return;
      }
      // Ein Abbruch ist eine Entscheidung, keine Stoerung — dafuer gibt es KEINEN Hinweis. Wer
      // "Abbrechen" tippt, weiss, was er getan hat; ihm das zu melden waere Gezeter.
      if (r && r.abgebrochen){ if (fertig) fertig(false); return; }
      // "Bitten um Erlaubnis": Der Kauf ist gestellt und wartet auf die Freigabe eines Elternteils.
      // Das als Fehlschlag zu melden hiesse, jemanden ein zweites Mal kaufen zu lassen.
      if (r && r.wartet){ toast(tx('plus_kauf_wartet')); if (fertig) fertig(false); return; }
      toast(tx('plus_kauf_fehler'));
      if (fertig) fertig(false);
    };
    try{
      sk.kaufen({produkt: kennung})
        .then(antwort)
        .catch(function(){ toast(tx('plus_kauf_fehler')); if (fertig) fertig(false); });
    }catch(e){ toast(tx('plus_kauf_fehler')); if (fertig) fertig(false); }
  }

  // Beim Start nachsehen, was wirklich gilt (ein abgelaufenes Abo darf nicht stehen bleiben, ein
  // gekauftes soll auf einem neuen Geraet da sein).
  // Weggenommen wird NUR bei einer klaren Antwort: Keine Bruecke, Fehler oder Unerwartetes aendern
  // nichts.
  function plusStandUebernehmen(r){
    if (!r || typeof r.aktiv !== 'boolean') return;
    if (r.aktiv && r.produkt) schalterSetzen(PLUS_PRODUKT, r.produkt, null);
    if (r.aktiv === istPlus()) return;
    // Im Entwicklungsbau nimmt die Abfrage nichts weg — sonst ueberlebte der Umschalter im
    // Profil keinen Neustart. Geben darf sie weiterhin: Ein echter Testkauf soll ankommen.
    if (!r.aktiv && entwicklungsBau()) return;
    plusSetzen(r.aktiv);
    plusAnsichtenAuffrischen();
  }
  function plusStandPruefen(){
    var sk = nativModul('StoreKit');
    if (!sk || !sk.stand) return;
    try{ sk.stand().then(plusStandUebernehmen).catch(function(){}); }catch(e){}
    // Kaeufe ausserhalb des Kauffensters (Rueckgewinnungs-Angebot, App Store) melden sich selbst.
    if (sk.addListener && !plusStandPruefen.horcht){
      plusStandPruefen.horcht = true;
      try{ sk.addListener('aboGeaendert', plusStandUebernehmen); }catch(e){}
    }
  }

  // ---------- Bitte um Bewertung ----------
  // Einmal, im guten Moment (das erste freie Muster ist da). Nur mit Bruecke; iOS begrenzt selbst.
  var BEWERTUNG_GEFRAGT = 'lucenta_bewertung';
  function bewertungErbitten(){
    var sk = nativModul('StoreKit');
    if (!sk || !sk.bewerten) return;
    try{
      if (localStorage.getItem(BEWERTUNG_GEFRAGT)) return;
      localStorage.setItem(BEWERTUNG_GEFRAGT, '1');
    }catch(e){ return; }
    try{ sk.bewerten(); }catch(e){}
  }

  // ---------- Preise aus dem Store ----------
  // Mit Bruecke setzt die App die Betraege des Stores ein (Land, Waehrung, Preisaenderungen); ohne
  // Antwort bleiben die festen Texte. In den Saetzen wird nur der Betrag getauscht — keine neuen
  // Schluessel.
  var PLUS_PREISE = null;
  var BETRAG_MUSTER = /€\s?\d+(?:[.,]\d+)?|\d+(?:[.,]\d+)?\s?€/;
  function plusPreiseHolen(){
    var sk = nativModul('StoreKit');
    if (!sk || !sk.preise) return;
    try{
      sk.preise().then(function(r){
        if (!r || typeof r.jahr !== 'string' || typeof r.monat !== 'string' || !r.jahr || !r.monat) return;
        PLUS_PREISE = r;
        plusPreiseAnwenden();
      }).catch(function(){});
    }catch(e){}
  }
  function plusPreiseAnwenden(){
    var wahl = $('plusPreisWahl');
    if (!PLUS_PREISE || !wahl) return;
    var setze = function(schluessel, text){
      var el = wahl.querySelector('[data-i18n="'+schluessel+'"]');
      if (el && text) el.textContent = text;
      return el;
    };
    setze('plus_betrag_jahr', PLUS_PREISE.jahr);
    setze('plus_betrag_monat', PLUS_PREISE.monat);
    setze('plus_jahr_statt', PLUS_PREISE.jahrStatt);
    if (PLUS_PREISE.jahrProMonat) setze('plus_jahr_pro_monat', tx('plus_jahr_pro_monat').replace(BETRAG_MUSTER, String(PLUS_PREISE.jahrProMonat).replace(/ /g, '\u00a0')));
    // Keine Ersparnis (oder keine berechenbare): dann steht dort auch keine.
    var spar = wahl.querySelector('[data-i18n="plus_jahr_spar"]');
    if (spar){
      if (PLUS_PREISE.jahrSpar) spar.textContent = tx('plus_jahr_spar').replace(BETRAG_MUSTER, PLUS_PREISE.jahrSpar);
      spar.hidden = !PLUS_PREISE.jahrSpar;
    }
    document.querySelectorAll('.plus-vorschau [data-plus-info]').forEach(function(b){ b.textContent = plusKnopfText(); });
    document.querySelectorAll('.schloss-btn[data-plus-info]').forEach(function(b){ b.textContent = plusKnopfText('plus_knopf'); });
    var probe = probeTage(), abz = $('plusProbeAbzeichen');
    if (abz){ abz.textContent = probe ? tfText('plus_probe_abzeichen', {n: probe}) : ''; abz.hidden = !probe; }
    plusKnopfAnwenden();
  }
  // Tage der Probezeit, wie der Store sie fuer dieses Konto meldet; ohne Antwort 0 (nichts versprechen).
  function probeTage(){
    var n = PLUS_PREISE && +PLUS_PREISE.jahrProbeTage;
    return n > 0 ? Math.round(n) : 0;
  }

  // ---------- Kaeufe wiederherstellen (Richtlinie 3.1.2) ----------
  // Ohne Bruecke sagt der Knopf, dass es das nur in der App gibt.
  function kaeufeWiederherstellen(){
    var sk = nativModul('StoreKit');
    if (!sk || !sk.restorePurchases){ toast(tx('plus_wieder_nur_app')); return; }
    try{
      sk.restorePurchases()
        .then(function(r){
          var hat = !!(r && r.aktiv);
          // Runde 121: Wer den Anmeldedialog wegtippt, hat nichts gefragt bekommen — also aendert
          // sich nichts, und es gibt auch keine Meldung. Vorher nahm genau das Lucenta+ weg.
          if (!hat && r && r.abgebrochen) return;
          // Im Entwicklungsbau nimmt das Wiederherstellen nichts weg, wie die Startabfrage oben —
          // sonst schaltet ein Test des Knopfs den Umschalter im Profil stumm ab.
          if (!hat && entwicklungsBau()){ toast(tx('plus_wieder_nichts')); return; }
          plusSetzen(hat);
          if (hat && r.produkt) schalterSetzen(PLUS_PRODUKT, r.produkt, null);
          plusAnsichtenAuffrischen();
          toast(tx(hat ? 'plus_wieder_gefunden' : 'plus_wieder_nichts'));
        })
        .catch(function(){ toast(tx('plus_wieder_fehler')); });
    }catch(e){ toast(tx('plus_wieder_fehler')); }
  }
  // Die Verwaltung des Abos liegt bei Apple, nicht bei uns — eine App darf gar keinen eigenen
  // Kuendigungsweg anbieten. Der Knopf oeffnet deshalb die Systemeinstellungen.
  function aboVerwalten(){
    var ap = nativModul('App');
    var perLink = function(){
      if (!ap || !ap.openUrl){ toast(tx('plus_verwalten_nur_app')); return; }
      try{ ap.openUrl({url:'itms-apps://apps.apple.com/account/subscriptions'}); }catch(e){}
    };
    // Zuerst Apples Blatt in der App; nur wenn es nicht aufgeht, der Link.
    var sk = nativModul('StoreKit');
    if (sk && sk.verwalten){
      sk.verwalten().then(function(r){ if (!r || !r.geoeffnet) perLink(); }).catch(perLink);
      return;
    }
    perLink();
  }

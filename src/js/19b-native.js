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

  // ---------- Erinnerung: drei Tageszeiten ----------
  // Ein Schalter, feste Zeiten (Entscheidung des Inhabers). Fuer eine schon eingetragene Tageszeit
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
  function erinnerungAn(){
    return schalterLesen(ERINNERUNG_AN, 'aus') === 'an';
  }
  function erinnerungHinweisText(){
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
  function plusStandPruefen(){
    var sk = nativModul('StoreKit');
    if (!sk || !sk.stand) return;
    try{
      sk.stand().then(function(r){
        if (!r || typeof r.aktiv !== 'boolean') return;
        if (r.aktiv && r.produkt) schalterSetzen(PLUS_PRODUKT, r.produkt, null);
        if (r.aktiv === istPlus()) return;
        // Im Entwicklungsbau nimmt die Abfrage nichts weg — sonst ueberlebte der Umschalter im
        // Profil keinen Neustart. Geben darf sie weiterhin: Ein echter Testkauf soll ankommen.
        if (!r.aktiv && entwicklungsBau()) return;
        plusSetzen(r.aktiv);
        plusAnsichtenAuffrischen();
      }).catch(function(){});
    }catch(e){}
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
    if (PLUS_PREISE.jahrProMonat) setze('plus_jahr_pro_monat', tx('plus_jahr_pro_monat').replace(BETRAG_MUSTER, PLUS_PREISE.jahrProMonat));
    // Keine Ersparnis (oder keine berechenbare): dann steht dort auch keine.
    var spar = wahl.querySelector('[data-i18n="plus_jahr_spar"]');
    if (spar){
      if (PLUS_PREISE.jahrSpar) spar.textContent = tx('plus_jahr_spar').replace(BETRAG_MUSTER, PLUS_PREISE.jahrSpar);
      spar.hidden = !PLUS_PREISE.jahrSpar;
    }
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
    if (!ap || !ap.openUrl){ toast(tx('plus_verwalten_nur_app')); return; }
    try{ ap.openUrl({url:'itms-apps://apps.apple.com/account/subscriptions'}); }catch(e){}
  }

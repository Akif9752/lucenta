// ---------- Die native Bruecke (Runde 99) ----------
//
// Zwei Apple-Punkte haengen an dieser Datei, und beide waren bisher offen.
//
// Richtlinie 4.2 (Minimum Functionality) ist der wahrscheinlichste Ablehnungsgrund fuer
// Lucenta: Apple weist Apps ab, die nichts weiter sind als eine in eine Huelle gepackte
// Webseite. Dagegen hilft keine bessere Beschreibung, sondern nur Funktionen, die es im
// Browser nicht gibt. Zwei davon passen zu dieser App, statt ihr aufgesetzt zu werden:
// eine taegliche Erinnerung an die Tagesform (die App bittet einmal am Tag um zwei Angaben —
// genau dafuer ist eine lokale Mitteilung da) und das Sichern des Ergebnisbildes in die
// Foto-Mediathek.
//
// Richtlinie 3.1.2 verlangt bei einem Abo einen Weg, gekaufte Kaeufe wiederherzustellen. Der
// steht ebenfalls hier.
//
// ---- Das Entwurfsprinzip: EINE Stelle, die weiss, ob es nativ laeuft ----
//
// Alles hier prueft ueber nativVorhanden(), ob eine Bruecke da ist, und tut sonst nichts
// Falsches. Der Browser bekommt keine halb funktionierenden Knoepfe, sondern abgeschaltete mit
// einer Begruendung. Der Grund fuer diese Strenge steht in 17-settings.js: Ein blockierter
// Download wirft KEINEN Fehler, er tut schlicht nichts — und aus dem ausbleibenden Fehler auf
// Erfolg zu schliessen hat dort schon einmal zu einer Erfolgsmeldung ohne Ergebnis gefuehrt.
//
// Was hier NICHT steht: der Kauf selbst. Der gehoert in die App-Store-Fassung ueber StoreKit,
// und bis der echte Kaufweg da ist, waere jede Zeile hier eine Behauptung. Der Vermerk dazu
// steht in docs/app-store-start.md, Punkt 6.
  function nativVorhanden(){
    try{
      return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    }catch(e){ return false; }
  }
  // Runde 113: Laeuft hier ein Entwicklungsbau der App? Die Marke setzt MainViewController.swift
  // nur hinter `#if DEBUG` — beim Start aus Xcode ja, im Archiv fuer den Store nie. Sie schaltet
  // genau zwei Dinge frei: den Plus-Umschalter im Profil, und dass die Store-Abfrage beim Start
  // einen von Hand eingeschalteten Plus-Stand nicht wieder wegnimmt (der Simulator antwortet
  // ehrlich "kein Kauf", und der Umschalter stuende sonst nach jedem Start wieder auf aus).
  function entwicklungsBau(){
    try{ return window.__lucentaEntwicklungsbau === true; }catch(e){ return false; }
  }
  function nativModul(name){
    try{
      var p = window.Capacitor && window.Capacitor.Plugins;
      return (p && p[name]) ? p[name] : null;
    }catch(e){ return null; }
  }

  // ---------- Taegliche Erinnerung ----------
  //
  // Eine einzige, wiederkehrende Mitteilung zur gewaehlten Uhrzeit. Ausdruecklich NICHT mehrere
  // und ausdruecklich ohne Nachfassen: Die Grenze aus Runde 46 — kein Druck bei einer Anwendung
  // rund um Befinden — gilt hier genauso wie beim Serien-Zaehler, der damals verworfen wurde.
  // Eine App, die zweimal erinnert, erinnert nicht mehr, sie draengt.
  var ERINNERUNG_AN = 'lucenta_erinnerung', ERINNERUNG_ZEIT = 'lucenta_erinnerung_zeit';
  var ERINNERUNG_ID = 4711;
  function erinnerungZeit(){
    var w = schalterLesen(ERINNERUNG_ZEIT, '');
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(w) ? w : '20:00';
  }
  function erinnerungAn(){
    return schalterLesen(ERINNERUNG_AN, 'aus') === 'an';
  }
  function erinnerungAnwenden(){
    var s = $('erinnerungSchalter'), z = $('erinnerungZeit'), h = $('erinnerungHinweis');
    if (!s) return;
    var moeglich = nativVorhanden();
    s.setAttribute('aria-checked', (moeglich && erinnerungAn()) ? 'true' : 'false');
    s.disabled = !moeglich;
    if (z){ z.value = erinnerungZeit(); z.disabled = !moeglich || !erinnerungAn(); }
    if (h) h.textContent = decodeEntities(tx(moeglich ? 'erinnerung_hinweis' : 'erinnerung_nur_app'));
  }
  function erinnerungPlanen(){
    var lm = nativModul('LocalNotifications');
    if (!lm) return;
    var t = erinnerungZeit().split(':');
    // Erst die alte loeschen, dann die neue setzen. Ohne das Loeschen sammelt sich bei jedem
    // Umstellen der Uhrzeit eine weitere Mitteilung an, und nach einer Woche Herumprobieren
    // meldet sich die App fuenfmal am Abend.
    try{ lm.cancel({notifications:[{id:ERINNERUNG_ID}]}); }catch(e){}
    try{
      lm.schedule({notifications:[{
        id: ERINNERUNG_ID,
        title: decodeEntities(tx('erinnerung_titel_mitteilung')),
        body: decodeEntities(tx('erinnerung_text_mitteilung')),
        schedule: {on:{hour:parseInt(t[0],10), minute:parseInt(t[1],10)}, allowWhileIdle:true}
      }]});
    }catch(e){}
  }
  function erinnerungAbsagen(){
    var lm = nativModul('LocalNotifications');
    if (!lm) return;
    try{ lm.cancel({notifications:[{id:ERINNERUNG_ID}]}); }catch(e){}
  }
  function erinnerungUmschalten(){
    if (!nativVorhanden()) return;
    var an = !erinnerungAn();
    if (an){
      var lm = nativModul('LocalNotifications');
      // Die Erlaubnis wird erst hier erfragt und nicht beim Start. Eine App, die beim ersten
      // Oeffnen nach Mitteilungen fragt, bekommt regelmaessig ein Nein — gefragt wird in dem
      // Moment, in dem jemand sie ausdruecklich einschaltet.
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
  function erinnerungZeitGesetzt(wert){
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(wert || '')) return;
    schalterSetzen(ERINNERUNG_ZEIT, wert, null);
    if (erinnerungAn()) erinnerungPlanen();
  }

  // ---------- Ergebnisbild in die Foto-Mediathek ----------
  //
  // Im Browser kann ein Bild nur heruntergeladen werden, und im eingebetteten Rahmen nicht
  // einmal das. Nativ geht es in die Mediathek. Das ist die zweite Funktion, die es im Browser
  // nicht gibt — und anders als ein Widget kostet sie kein eigenes Stueck Oberflaeche.
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

  // ---------- Der Kauf (Runde 103) ----------
  //
  // Bis hierher stand an dieser Stelle ein ehrlicher Vermerk: 'StoreKit' sei ein Platzhalter, es
  // gebe kein solches Capacitor-Modul, und der Kauf fehle. Beides ist jetzt eingeloest — die
  // Bruecke liegt in ios/App/App/LucentaKaeufePlugin.swift und meldet sich unter genau diesem
  // Namen an. Die Aufrufe hier sind die Gegenseite davon.
  //
  // Die Produktkennungen stehen an ZWEI Stellen, hier und in der Swift-Datei. Das ist kein
  // Versehen: Die Swift-Seite weist eine Kennung ab, die sie nicht kennt, statt sie an den Store
  // weiterzureichen. Eine Tabelle, die nur eine Seite kennt, waere genau die Stelle, an der ein
  // Tippfehler zu einem Kauf von irgendetwas fuehrt.
  var PLUS_PRODUKT = 'lucenta_plus_produkt';
  var PRODUKTE = { monat: 'lucenta.plus.monat', jahr: 'lucenta.plus.jahr' };
  function produktKennung(laufzeit){
    return PRODUKTE[laufzeit] || PRODUKTE.jahr;
  }
  // Runde 103: Die gekaufte Produktkennung wird getrennt von der GEWAEHLTEN Laufzeit gemerkt.
  // Zwei verschiedene Dinge: 'lucenta_laufzeit' ist, was im Segmentwaehler steht (und stehen
  // bleiben soll, wenn jemand das Fenster wieder oeffnet), 'lucenta_plus_produkt' ist, was
  // tatsaechlich bezahlt wurde. Beides in einen Schluessel zu legen hiesse, dass der Waehler nach
  // einem Kauf seine Wahl vergisst — und dass man einer Notiz ansieht, sie sei ein Beleg.
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

  // Beim Start nachsehen, was WIRKLICH gilt.
  //
  // Der Grund ist kein Feinschliff: Bis Runde 103 stand der bezahlte Zustand allein in
  // localStorage. Ein gekuendigtes oder abgelaufenes Abo haette Lucenta+ dort fuer immer
  // stehenlassen — sobald Geld im Spiel ist, ist das ein Fehler und keine Grosszuegigkeit. Und
  // umgekehrt: Wer auf einem neuen Geraet schon zahlt, soll nicht erst einen Knopf suchen muessen.
  //
  // Die Vorsichtsregel dabei ist wichtiger als die Sache selbst: **Weggenommen wird nur bei einer
  // klaren Antwort.** Keine Bruecke, ein Fehler, ein unerwartetes Ergebnis — dann bleibt alles,
  // wie es war. Sonst nimmt eine Stoerung im Store jemandem weg, wofuer er bezahlt hat.
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

  // ---------- Kaeufe wiederherstellen (Richtlinie 3.1.2) ----------
  //
  // Apple verlangt bei einem Abo einen Weg, bereits gekaufte Kaeufe auf einem neuen Geraet
  // wiederherzustellen — ohne Konto und ohne Kaufbeleg.
  //
  // Runde 103: Hier stand der Vermerk, 'StoreKit' sei ein Platzhalter und es gebe kein solches
  // Capacitor-Modul. Das gilt fuer Apple und Ionic weiterhin — es gibt jetzt aber unser eigenes:
  // ios/App/App/LucentaKaeufePlugin.swift meldet sich unter diesem Namen an und beantwortet
  // `stand`, `kaufen` und `restorePurchases`. Ohne Bruecke (im Browser) sagt der Knopf weiterhin,
  // dass es das nur in der App gibt, statt Erfolg zu melden.
  function kaeufeWiederherstellen(){
    var sk = nativModul('StoreKit');
    if (!sk || !sk.restorePurchases){ toast(tx('plus_wieder_nur_app')); return; }
    try{
      sk.restorePurchases()
        .then(function(r){
          var hat = !!(r && r.aktiv);
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

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

  // ---------- Kaeufe wiederherstellen (Richtlinie 3.1.2) ----------
  //
  // Apple verlangt bei einem Abo einen Weg, bereits gekaufte Kaeufe auf einem neuen Geraet
  // wiederherzustellen — ohne Konto und ohne Kaufbeleg. Der Knopf steht deshalb schon hier,
  // auch wenn der Kauf selbst noch fehlt: Wer ihn spaeter einbaut, findet die Stelle, statt sie
  // anzulegen. Solange keine Bruecke da ist, sagt er das, statt Erfolg zu melden.
  //
  // ACHTUNG, ehrlicher Vermerk: 'StoreKit' ist hier ein PLATZHALTER. Fuer
  // LocalNotifications, Filesystem und App gibt es offizielle Capacitor-Module, die genau so
  // heissen; fuer Kaeufe gibt es keins von Apple oder Ionic. Wer das umsetzt, schreibt entweder
  // eine eigene kleine Bruecke in Swift und meldet sie unter diesem Namen an, oder nimmt ein
  // Gemeinschaftsmodul und passt DIESEN Aufruf an. Der Name ist bewusst nicht erfunden
  // versteckt, sondern steht hier und in docs/app-store-start.md, Punkt 6.
  function kaeufeWiederherstellen(){
    var sk = nativModul('StoreKit');
    if (!sk || !sk.restorePurchases){ toast(tx('plus_wieder_nur_app')); return; }
    try{
      sk.restorePurchases()
        .then(function(r){
          var hat = !!(r && r.aktiv);
          plusSetzen(hat);
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

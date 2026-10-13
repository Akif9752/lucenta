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

  // ---------- Erinnerung: drei Tageszeiten (Runde 129) ----------
  //
  // Bis Runde 128 stand hier EINE taegliche Mitteilung zur gewaehlten Uhrzeit, mit der Begruendung
  // aus Runde 46: kein Druck bei einer Anwendung rund um Befinden. Seit Runde 129 hat die Tagesform
  // drei feste Abschnitte (03-speicherung.js), und der Inhaber hat ausdruecklich drei Erinnerungen
  // gewaehlt — ein Schalter, feste Zeiten, keine Uhrzeitwahl (Runde 131: 9, 14, 20 Uhr, plus
  // Nacherinnerung zwei Stunden spaeter).
  //
  // Der Gedanke von Runde 46 bleibt in einer anderen Form erhalten: Eine Erinnerung fuer einen
  // Abschnitt, der schon eingetragen ist, kommt NICHT (Wahl des Inhabers). Das geht mit einer
  // taeglich wiederholten Mitteilung nicht — iOS kann eine Wiederholung nicht fuer einen Tag
  // aussetzen. Deshalb werden die Mitteilungen der naechsten ERINNERUNG_TAGE Tage EINZELN geplant
  // (seit Runde 131: 6 x 10 = 60, unter der Grenze von 64 ausstehenden Mitteilungen je App) und bei
  // jedem Eintrag und jedem Oeffnen neu gesetzt. Folge: Wer die App zehn Tage nicht oeffnet, bekommt
  // danach keine Erinnerung mehr. Das ist gewollt — eine App, die nach Tagen der Stille weiter
  // ruft, draengt.
  var ERINNERUNG_AN = 'lucenta_erinnerung';
  var ERINNERUNG_ID = 4711;            // die alte taegliche Mitteilung; wird beim Planen mit abgesagt
  // Runde 131 (Inhaber): Zeiten 9, 14, 20 Uhr, und zwei Stunden spaeter eine Nacherinnerung, wenn
  // die Tageszeit dann immer noch offen ist. Sechs am Tag — und iOS haelt hoechstens 64 ausstehende
  // Mitteilungen je App. Deshalb 10 Tage statt 14 (60). Das Fenster wird ohnehin bei jedem Oeffnen
  // und jedem Eintrag nachgezogen.
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
  // Runde 124: Die Erinnerung steht an ZWEI Stellen — in den Einstellungen und direkt in der
  // Tagesform, wo sie gebraucht wird. Beide zeigen denselben Stand; deshalb setzt diese eine
  // Funktion beide, und wer an einer Stelle schaltet, sieht es an der anderen.
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

  // ---------- Preise aus dem Store (Runde 137) ----------
  //
  // Die Kaufseite traegt feste Euro-Betraege in acht Sprachen. Gilt im Store ein anderer Preis —
  // anderes Land, andere Waehrung, eine spaetere Preisaenderung —, zeigte sie einen Betrag, der
  // nicht abgebucht wird. Mit Bruecke fragt die App deshalb den Store und setzt dessen Betraege
  // ein; ohne Antwort (Browser, Produkte noch nicht angelegt, Stoerung) bleiben die festen Texte.
  // In die Saetze ("nur 2,50 EUR im Monat") wird nur der BETRAG getauscht, der Satz bleibt der der
  // Sprache — so braucht es keine neuen Schluessel und keine achtfache Satzvorlage.
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

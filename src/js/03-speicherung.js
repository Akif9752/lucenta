// ---------- persistence (per-viewer convenience only) ----------
  // Alle Speicherfunktionen unten fangen Schreibfehler bereits ab und scheitern still —
  // richtig für den Fall "Speicherkontingent voll" (Feedback-Runde 21). Ist localStorage aber
  // grundsätzlich unerreichbar (z. B. manche privaten Browser-Modi), würde das sonst überall
  // lautlos ins Leere laufen. Ein einmaliger Check beim Start macht das stattdessen sichtbar.
  function storageAvailable(){
    try{
      var k = '__lucenta_probe__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    }catch(e){ return false; }
  }
  function saveResult(sc){
    try{ localStorage.setItem('lucenta_result', JSON.stringify(sc)); }catch(e){}
  }
  function loadResult(){
    try{
      var r = localStorage.getItem('lucenta_result');
      if (!r) return null;
      var sc = JSON.parse(r);
      if (!sc || typeof sc!=='object') return null;
      for (var i=0;i<ORDER.length;i++){
        var v = sc[ORDER[i]];
        if (typeof v!=='number' || isNaN(v) || v<0 || v>100) return null;
      }
      return sc;
    }catch(e){ return null; }
  }
  function saveProgress(){
    try{ localStorage.setItem('lucenta_progress', JSON.stringify({answers:answers, qi:qi})); }catch(e){}
  }
  function loadProgress(){
    try{
      var r = localStorage.getItem('lucenta_progress');
      if (!r) return null;
      var p = JSON.parse(r);
      if (!p || !Array.isArray(p.answers) || p.answers.length!==50 || typeof p.qi!=='number' || p.qi<1 || p.qi>49) return null;
      return p;
    }catch(e){ return null; }
  }
  function clearProgress(){
    try{ localStorage.removeItem('lucenta_progress'); }catch(e){}
  }
  // Rollierender Verlauf abgeschlossener Testdurchläufe (unabhängig vom einzelnen "letzten
  // Ergebnis" oben) — Grundlage für die Trend-Sparklines in der Verlauf-Ansicht. Auf die letzten
  // MAX_HISTORY Einträge begrenzt, damit der lokale Speicher nicht unbegrenzt wächst.
  var MAX_HISTORY = 12;
  function loadHistory(){
    try{
      var r = localStorage.getItem('lucenta_history');
      if (!r) return [];
      var h = JSON.parse(r);
      if (!Array.isArray(h)) return [];
      return h.filter(function(e){
        if (!e || typeof e!=='object' || typeof e.date!=='number' || !e.scores) return false;
        for (var i=0;i<ORDER.length;i++){
          var v = e.scores[ORDER[i]];
          if (typeof v!=='number' || isNaN(v) || v<0 || v>100) return false;
        }
        return true;
      });
    }catch(e){ return []; }
  }
  function saveHistoryList(h){
    try{ localStorage.setItem('lucenta_history', JSON.stringify(h)); return true; }catch(e){ return false; }
  }
  function appendHistory(sc){
    var h = loadHistory();
    h.push({scores:sc, date:Date.now()});
    if (h.length>MAX_HISTORY) h = h.slice(h.length-MAX_HISTORY);
    saveHistoryList(h);
  }
  function clearHistory(){
    try{ localStorage.removeItem('lucenta_history'); }catch(e){}
  }
  // Tagesform / State-Check: kurzfristiger Zustand (Energie, Stimmung), bewusst als eigenes
  // Datenmodell getrennt vom stabilen Trait-Ergebnis oben (State vs. Trait) — höchstens ein
  // Eintrag pro Kalendertag, ein erneutes Speichern am selben Tag aktualisiert den Eintrag.
  // Runde 82: Die Tagesform zaehlt nicht mehr Tage, sondern Eintraege.
  //
  // Bis hierher galt EIN Eintrag je Tag, und upsertStateToday() setzte das durch, indem es den
  // heutigen Tag herausfilterte und neu schrieb. Der zweite Check-in eines Tages hat den ersten
  // damit stillschweigend geloescht: Wer morgens bei Energie 2 eintrug und abends bei 4, hatte
  // den Morgen nicht mehr.
  //
  // Das war nicht nur Datenverlust, sondern eine Verzerrung. Der Tageswert hing davon ab, WANN
  // jemand zufaellig tippte — und wer an schlechten Tagen abends eincheckt und an guten Tagen
  // morgens, erzeugt eine Schwankung, die im Diagramm nach Befinden aussieht und Messfehler ist.
  //
  // Jetzt ergaenzt jeder Eintrag statt zu ueberschreiben, und jeder traegt seine Tageszeit. Der
  // Tageswert ist das Mittel. Ausdruecklich NICHT eingefuehrt: eine Aufforderung, mehrmals am
  // Tag einzutragen. Ein Tipp bleibt in sich fertig — die Grenze aus Runde 46 (kein Druck bei
  // einer Anwendung rund um Befinden) gilt weiter.
  // ---------- Freie und gekaufte Fassung (Runde 84) ----------
  //
  // Die Grenze verlaeuft an EINER Linie, und sie ist keine Verhandlungssache, sondern folgt der
  // Aussage der App selbst: Frei ist das vollstaendige Bild von heute. Gekauft ist alles, was
  // erst aus mehreren Messungen entsteht — Verlauf, Muster, Tiefe im Vergleich.
  //
  // Was daraus folgt, und was NICHT verhandelbar ist:
  //   - Niemand zahlt fuer sein Ergebnis. Wer fuenfzig Aussagen beantwortet hat, sieht das
  //     vollstaendige Portraet, sofort und ohne Konto. Ein Ergebnis hinter eine Zahlung zu
  //     stellen waere Erpressung, keine Preisgestaltung.
  //   - Es wird nichts geloescht und nichts weggenommen. Die freie Fassung ZEIGT weniger; alles
  //     Eingetragene bleibt liegen und ist wieder da, sobald jemand kauft. Daten, die jemand
  //     selbst erzeugt hat, sind seine.
  //   - Der Vergleich bleibt in seiner Grundform frei. Er ist die Stelle, an der eine zweite
  //     Person dazukommt; ihn zu verschliessen kostet mehr, als er einbringt.
  var PLUS_SCHLUESSEL = 'lucenta_plus';
  function istPlus(){
    try{ return localStorage.getItem(PLUS_SCHLUESSEL) === '1'; }catch(e){ return false; }
  }
  function plusSetzen(an){
    try{ an ? localStorage.setItem(PLUS_SCHLUESSEL, '1') : localStorage.removeItem(PLUS_SCHLUESSEL); }catch(e){}
    syncWortmarke();
  }
  // Das "+" an der Wortmarke wird hier nachgezogen und nicht bei jedem Ansichtswechsel: Der
  // Zustand aendert sich genau an einer Stelle — hier —, und beim Start. Es an showView() zu
  // haengen hiesse, sechzig Mal am Tag etwas zu pruefen, das sich einmal im Leben aendert.
  function syncWortmarke(){
    var el = $('wortmarkePlus');
    if (el) el.hidden = !istPlus();
  }
  // So viele Tage der Tagesform zeigt die freie Fassung. Vierzehn ist nicht gegriffen: Der erste
  // Befund braucht sieben Tage, der zweite vierzehn — wer die Grenze erreicht, hat also gerade
  // gesehen, dass es hier etwas zu holen gibt.
  var FREI_TAGE = 14;
  // So viele Durchlaeufe zeigt die freie Fassung im Verlauf: der aktuelle und der davor. Genug,
  // um zu sehen DASS sich etwas bewegt, zu wenig, um zu sehen WIE.
  var FREI_DURCHLAEUFE = 2;

  // ---------- Nutzungsmessung (Runde 96) ----------
  //
  // Der Abo-Plan steht und faellt an EINER Zahl: Wie viele Menschen sind nach dreissig Tagen noch
  // da? Ein Abo, dessen Gegenwert Verlauf und Tagesform sind, verkauft sich nur, wenn Verlauf und
  // Tagesform tatsaechlich benutzt werden — und das weiss heute niemand, auch nicht ungefaehr.
  // Solange die Zahl fehlt, ist jede Umsatzplanung geraten.
  //
  // Gemessen wird deshalb das Minimum, aus dem sich die Frage beantworten laesst: an WELCHEN
  // Kalendertagen die App offen war. Keine Uhrzeiten, keine Ansichten, keine Klickwege, keine
  // Kennung. Alles Weitere ergibt sich aus dem, was ohnehin gespeichert ist — Durchlaeufe im
  // Verlauf, Eintraege der Tagesform. Was darueber hinausginge, waere Neugier und nicht Messung.
  //
  // Es bleibt auf dem Geraet, wie alles hier. Von selbst geht nichts hinaus; nur wer es bei der
  // Beta-Rueckmeldung ausdruecklich einschaltet, schickt es mit — und sieht vorher woertlich,
  // was dann dasteht.
  var NUTZUNG_SCHLUESSEL = 'lucenta_nutzung';
  // Vier Monate Tage. Mehr braucht keine der Auswertungen unten, und der erste Tag steht separat
  // in `start` — sonst haette das Kuerzen ausgerechnet den Bezugspunkt weggeworfen, an dem die
  // ganze Rechnung haengt.
  var NUTZUNG_MAX_TAGE = 120;
  // Die Monats- und Tageszahlen werden mitgeprueft und nicht nur die Form. Der Grund steht in
  // tagAlsZahl(): Date.UTC rechnet Ueberlaeufe stillschweigend um — aus '2026-13-99' wird ein
  // gueltiger Tag im Maerz 2027. Eine kaputte Angabe wuerde damit nicht auffallen, sondern die
  // Spanne verlaengern und jede Quote nach unten ziehen.
  function istTagesschluessel(t){
    return typeof t === 'string' && /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(t);
  }
  function nutzungLesen(){
    try{
      var r = localStorage.getItem(NUTZUNG_SCHLUESSEL);
      if (!r) return {start:'', tage:[]};
      var n = JSON.parse(r);
      if (!n || typeof n!=='object' || !Array.isArray(n.tage)) return {start:'', tage:[]};
      var tage = n.tage.filter(istTagesschluessel);
      var start = istTagesschluessel(n.start) ? n.start : (tage[0]||'');
      return {start:start, tage:tage};
    }catch(e){ return {start:'', tage:[]}; }
  }
  function nutzungTagVermerken(){
    var n = nutzungLesen(), heute = todayKey();
    if (!n.start) n.start = heute;
    // Die Liste waechst nur hinten, also ist der heutige Tag entweder der letzte oder gar nicht
    // da. Das indexOf dahinter ist trotzdem noch da: Wessen Geraeteuhr zurueckgestellt wird, soll
    // keinen doppelten Eintrag erzeugen, der spaeter als zusaetzlicher Tag zaehlt.
    if (n.tage[n.tage.length-1] !== heute && n.tage.indexOf(heute) < 0) n.tage.push(heute);
    if (n.tage.length > NUTZUNG_MAX_TAGE) n.tage = n.tage.slice(n.tage.length - NUTZUNG_MAX_TAGE);
    try{ localStorage.setItem(NUTZUNG_SCHLUESSEL, JSON.stringify(n)); }catch(e){}
    return n;
  }
  function nutzungLoeschen(){
    try{ localStorage.removeItem(NUTZUNG_SCHLUESSEL); }catch(e){}
  }
  // Ein Tagesschluessel als fortlaufende Zahl. Bewusst ueber Date.UTC aus den drei Zahlen im
  // Schluessel und nicht ueber new Date('2026-09-08'): Der Schluessel entsteht in 03 aus den
  // ORTSZEIT-Anteilen. Ihn als UTC-Zeitpunkt zu lesen und dann ortszeitlich auszuwerten waere
  // ein Fehler von bis zu einem Tag — westlich von Greenwich taeglich einer.
  function tagAlsZahl(key){
    if (!istTagesschluessel(key)) return NaN;
    var t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
    return Math.floor(Date.UTC(+t[1], +t[2]-1, +t[3]) / 86400000);
  }
  function nutzungKennzahlen(){
    var n = nutzungLesen();
    var heute = tagAlsZahl(todayKey()), start = tagAlsZahl(n.start);
    var seitStart = (isNaN(start) || isNaN(heute)) ? 0 : Math.max(0, heute - start + 1);
    var letzte30 = n.tage.filter(function(t){
      var z = tagAlsZahl(t);
      return !isNaN(z) && heute - z < 30 && heute - z >= 0;
    }).length;
    // Die eigentliche D30-Frage: War jemand NACH dem dreissigsten Tag noch einmal da? Sie ist
    // erst beantwortbar, wenn es einen dreissigsten Tag gab. Vorher lautet die ehrliche Antwort
    // "noch nicht messbar" — und ausdruecklich nicht "nein", was sie zu einer Zahl machen wuerde,
    // die schlechter aussieht als die Wirklichkeit und die Entscheidung in die falsche Richtung
    // zieht.
    var d30 = seitStart < 31 ? null : n.tage.some(function(t){
      var z = tagAlsZahl(t);
      return !isNaN(z) && z - start >= 30;
    });
    var h = loadHistory();
    // Abstand zwischen dem ersten und dem zweiten Durchlauf. Das ist die zweite Zahl, die zaehlt:
    // Wer nie ein zweites Mal testet, hat vom Verlauf nichts — und der Verlauf ist die Haelfte
    // dessen, wofuer das Abo bezahlt werden soll.
    var tageBisZweiter = (h.length >= 2 && typeof h[0].date === 'number' && typeof h[1].date === 'number')
      ? Math.max(0, Math.round((h[1].date - h[0].date) / 86400000)) : null;
    var eintraege = loadStateHistory(), tage = stateTage(eintraege);
    var proWoche = 0;
    if (tage.length){
      var erste = tagAlsZahl(tage[0].day);
      // Die Spanne laeuft bis HEUTE, nicht bis zum letzten Eintrag. Sonst zeigte ausgerechnet
      // jemand, der vor zwei Monaten aufgehoert hat, eine tadellose Quote — der Abbruch faellt
      // aus der Rechnung heraus, statt in ihr zu stehen.
      var spanne = (isNaN(erste) || isNaN(heute)) ? tage.length : Math.max(1, heute - erste + 1);
      proWoche = tage.length / (spanne / 7);
    }
    return {
      seitStart: seitStart, tageGeoeffnet: n.tage.length, letzte30: letzte30, d30: d30,
      durchlaeufe: h.length, tageBisZweiter: tageBisZweiter,
      tagesformTage: tage.length, tagesformEintraege: eintraege.length, tagesformProWoche: proWoche
    };
  }

  var MAX_STATE_EINTRAEGE = 150;
  // Drei Abschnitte statt Uhrzeiten: Eine Uhrzeit im Verlauf zu zeigen waere eine Genauigkeit,
  // die die Angabe nicht hat. Die Grenzen sind bewusst grob und liegen dort, wo die meisten
  // Menschen den Tag selbst teilen.
  function zeitabschnitt(ts){
    var h;
    try{ h = new Date(ts).getHours(); }catch(e){ return 'mittag'; }
    if (h < 11) return 'morgen';
    if (h < 17) return 'mittag';
    return 'abend';
  }
  function todayKey(){
    var d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function loadStateHistory(){
    try{
      var r = localStorage.getItem('lucenta_state');
      if (!r) return [];
      var h = JSON.parse(r);
      if (!Array.isArray(h)) return [];
      return h.filter(function(e){
        return e && typeof e==='object' && typeof e.day==='string' &&
          typeof e.energy==='number' && e.energy>=1 && e.energy<=5 &&
          typeof e.valence==='number' && e.valence>=1 && e.valence<=5;
      }).map(function(e){
        // Eintraege von vor Runde 82 tragen keinen Abschnitt. Er wird beim Lesen aus dem
        // Zeitstempel ergaenzt, damit der gesamte uebrige Code nur EINE Form kennt — sonst
        // muesste jede Auswertung den Sonderfall selbst behandeln und eine davon vergaesse ihn.
        if (!e.slot) e.slot = zeitabschnitt(e.ts);
        return e;
      });
    }catch(e){ return []; }
  }
  function saveStateHistoryList(h){
    try{ localStorage.setItem('lucenta_state', JSON.stringify(h)); return true; }catch(e){ return false; }
  }
  function addStateEntry(energy, valence){
    var h = loadStateHistory();
    var jetzt = Date.now();
    h.push({day:todayKey(), ts:jetzt, energy:energy, valence:valence, slot:zeitabschnitt(jetzt)});
    h.sort(function(a,b){ return a.ts-b.ts; });
    if (h.length>MAX_STATE_EINTRAEGE) h = h.slice(h.length-MAX_STATE_EINTRAEGE);
    return saveStateHistoryList(h);
  }
  // Fasst die Eintraege zu Tagen zusammen. Diagramm, Liste und die Befunde ueber Tage rechnen
  // damit weiter in Tagen — sonst haette ein Tag mit drei Eintraegen im Diagramm dreimal so viel
  // Gewicht wie einer mit einem, und "7 Tage" bedeutete ploetzlich "7 Eintraege".
  function stateTage(hist){
    var proTag = {}, reihenfolge = [];
    (hist||[]).forEach(function(e){
      if (!proTag[e.day]){ proTag[e.day] = {day:e.day, ts:e.ts, energy:0, valence:0, anzahl:0}; reihenfolge.push(e.day); }
      var t = proTag[e.day];
      t.energy += e.energy; t.valence += e.valence; t.anzahl++;
      if (e.ts > t.ts) t.ts = e.ts;
    });
    return reihenfolge.map(function(k){
      var t = proTag[k];
      return {day:t.day, ts:t.ts, anzahl:t.anzahl,
              energy: t.energy/t.anzahl, valence: t.valence/t.anzahl};
    }).sort(function(a,b){ return a.ts-b.ts; });
  }
  function todayStateEntries(){
    var key = todayKey();
    return loadStateHistory().filter(function(e){ return e.day===key; });
  }
  // Der zusammengefasste Stand von heute — oder nichts, wenn heute noch nichts eingetragen ist.
  function todayStateEntry(){
    var heute = todayStateEntries();
    if (!heute.length) return null;
    return stateTage(heute)[0];
  }
  function clearStateHistory(){
    try{ localStorage.removeItem('lucenta_state'); }catch(e){}
  }
  // Vergleichsarchiv: mehrere gespeicherte Kompatibilitäts-Vergleiche mit unterschiedlichen
  // Personen, unabhängig vom zuletzt berechneten Einzelvergleich im Kompatibilitäts-Tool.
  // Jeder Eintrag ist ein Schnappschuss (eigener Code, Code der anderen Person, optionales Label,
  // Zeitpunkt, Übereinstimmungs-Prozentzahl) — ändert sich das eigene Ergebnis später, bleibt der
  // gespeicherte Vergleich unverändert nachvollziehbar, analog zum Verlauf-Datenmodell oben.
  var MAX_COMPAT_ARCHIVE = 20;
  function loadCompatArchive(){
    try{
      var r = localStorage.getItem('lucenta_compat_archive');
      if (!r) return [];
      var h = JSON.parse(r);
      if (!Array.isArray(h)) return [];
      return h.filter(function(e){
        return e && typeof e==='object' && typeof e.id==='string' &&
          typeof e.ts==='number' && typeof e.myCode==='string' && typeof e.otherCode==='string' &&
          typeof e.match==='number' && !isNaN(e.match);
      });
    }catch(e){ return []; }
  }
  function saveCompatArchiveList(h){
    try{ localStorage.setItem('lucenta_compat_archive', JSON.stringify(h)); return true; }catch(e){ return false; }
  }
  function appendCompatArchiveEntry(entry){
    var h = loadCompatArchive();
    h.push(entry);
    if (h.length>MAX_COMPAT_ARCHIVE) h = h.slice(h.length-MAX_COMPAT_ARCHIVE);
    return saveCompatArchiveList(h);
  }
  function removeCompatArchiveEntry(id){
    var h = loadCompatArchive().filter(function(e){ return e.id!==id; });
    return saveCompatArchiveList(h);
  }
  function clearCompatArchive(){
    try{ localStorage.removeItem('lucenta_compat_archive'); }catch(e){}
  }
  function saveProfile(p){
    try{ localStorage.setItem('lucenta_profile', JSON.stringify(p)); return true; }catch(e){ return false; }
  }
  function loadProfile(){
    try{ var r = localStorage.getItem('lucenta_profile'); return r? JSON.parse(r): {name:'', avatarImg:null}; }catch(e){ return {name:'', avatarImg:null}; }
  }
  function clearProfile(){
    try{ localStorage.removeItem('lucenta_profile'); }catch(e){}
  }
  function saveThemeMode(mode){
    try{
      if (mode==='system') localStorage.removeItem('lucenta_theme');
      else localStorage.setItem('lucenta_theme', mode);
    }catch(e){}
  }
  function loadThemeMode(){
    try{
      var t = localStorage.getItem('lucenta_theme');
      return (t==='dark' || t==='light') ? t : 'system';
    }catch(e){ return 'system'; }
  }
  // Die beiden theme-color-Angaben im Kopf greifen nur nach Systemeinstellung. Wählt jemand
  // ausdrücklich hell oder dunkel, würde die Systemleiste sonst weiter der Systemeinstellung
  // folgen und farblich von der App abweichen. Ein zusätzlicher, nachgestellter Eintrag ohne
  // Medienbedingung übersteuert das; bei „System" wird er wieder entfernt.
  // Welcher Modus ist gerade tatsaechlich zu sehen? Nicht dasselbe wie die Einstellung: Steht
  // dort "System", sagt data-theme nichts, und die Antwort liegt allein bei der Systemvorgabe.
  // Beides zusammen ist die einzige verlaessliche Auskunft — und sie wird an mehr als einer
  // Stelle gebraucht, deshalb steht sie hier und nicht dort, wo sie zuerst gefehlt hat.
  function dunkelAktiv(){
    try{
      var m = document.documentElement.getAttribute('data-theme');
      if (m === 'dark') return true;
      if (m === 'light') return false;
      return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }catch(e){ return false; }
  }

  function syncThemeColor(mode){
    try{
      var head = document.head || document.getElementsByTagName('head')[0];
      if (!head) return;
      var el = document.getElementById('themeColorNow');
      if (mode!=='dark' && mode!=='light'){
        if (el && el.parentNode) el.parentNode.removeChild(el);
        return;
      }
      if (!el){
        el = document.createElement('meta');
        el.id = 'themeColorNow';
        el.setAttribute('name','theme-color');
        head.appendChild(el);
      }
      el.setAttribute('content', mode==='dark' ? '#0F1613' : '#F5F6EF');
    }catch(e){}
  }
  var themeShiftTimer = null;
  // Runde 75: Beide Schalter folgen demselben Muster wie die Darstellung — Wert merken,
  // aria-pressed setzen. Die Wirkung liegt woanders: bei der Haptik in tapFeedback(), bei der
  // Bewegung in prefersReducedMotion(), das jede Animation der App ohnehin abfragt.
  function schalterLesen(schluessel, standard){
    try{ return localStorage.getItem(schluessel) || standard; }catch(e){ return standard; }
  }
  // Runde 79: Aus dem Knopfpaar wurde ein Schieber. Der Zustand steht damit im Element selbst
  // (aria-checked) statt verteilt auf zwei aria-pressed — und das ist zugleich die Rolle, die
  // Vorleseprogramme als Schalter ansagen.
  function schalterSetzen(schluessel, wert, schalterId){
    try{ localStorage.setItem(schluessel, wert); }catch(e){}
    if (schluessel === 'lucenta_bewegung') bewegungKlasse(wert);
    var el = $(schalterId);
    if (el && el.setAttribute) el.setAttribute('aria-checked', wert === 'an' ? 'true' : 'false');
  }
  function schalterUmlegen(schluessel, schalterId){
    schalterSetzen(schluessel, schalterLesen(schluessel, 'an') === 'an' ? 'aus' : 'an', schalterId);
  }
  // Die Klasse ist noetig, weil CSS-Animationen nur auf die SYSTEM-Einstellung hoeren. Ohne sie
  // wirkte der Schalter zwar auf alles, was ueber JavaScript laeuft (Haptik, Sternenhimmel,
  // Richtung des Ansichtswechsels), aber die Ansicht stieg weiter auf — gemessen: animationName
  // blieb "rise". Der Schalter muss beide Welten erreichen.
  function bewegungKlasse(wert){
    try{ document.documentElement.classList.toggle('bewegung-aus', wert === 'aus'); }catch(e){}
  }
  function schalterAnwenden(){
    schalterSetzen('lucenta_haptik', schalterLesen('lucenta_haptik','an'), 'haptikSchalter');
    var bw = schalterLesen('lucenta_bewegung','an');
    schalterSetzen('lucenta_bewegung', bw, 'bewegungSchalter');
    bewegungKlasse(bw);
  }

  function applyTheme(mode){
    // Runde 61: Der Wechsel zwischen hell und dunkel sprang hart um — die Farbmarken wechseln,
    // aber nichts blendet. Die Ueberblendung laeuft NUR waehrend des Wechsels: eine Klasse fuer
    // 300 ms, danach wieder weg. Dauerhafte Farbuebergaenge auf allen Elementen wuerden sonst
    // jede andere Rueckmeldung der App traege machen — besonders die Druckzustaende, die
    // absichtlich mit transition-duration:0s sofort sitzen.
    var el = document.documentElement;
    if (!prefersReducedMotion() && el.getAttribute('data-theme') !== mode){
      el.classList.add('theme-shift');
      if (themeShiftTimer) clearTimeout(themeShiftTimer);
      themeShiftTimer = setTimeout(function(){ el.classList.remove('theme-shift'); themeShiftTimer = null; }, 300);
    }
    if (mode==='dark' || mode==='light') document.documentElement.setAttribute('data-theme', mode);
    else document.documentElement.removeAttribute('data-theme');
    syncThemeColor(mode);
    saveThemeMode(mode);
    ['System','Light','Dark'].forEach(function(key){
      var btn = $('theme'+key);
      if (btn) btn.setAttribute('aria-checked', btn.dataset.mode===mode ? 'true':'false');
    });
  }

  
// ---------- Speicherung (nur auf diesem Geraet) ----------
// Alle Speicherfunktionen scheitern bei Schreibfehlern still (Kontingent voll). Ob localStorage
// ueberhaupt erreichbar ist, prueft einmal storageAvailable() beim Start.
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
  // Rollierender Verlauf abgeschlossener Durchlaeufe, auf MAX_HISTORY begrenzt.
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
  // Tagesform: kurzfristiger Zustand, getrennt vom Trait-Ergebnis. Jeder Eintrag traegt seine
  // Tageszeit; je Tageszeit hoechstens einer (siehe TF_ABSCHNITTE). Der Tageswert ist das Mittel.
  // Keine Aufforderung, oefter einzutragen.
  // ---------- Freie und gekaufte Fassung ----------
  // Frei ist das Bild von heute, Lucenta+ alles, was erst aus mehreren Messungen entsteht.
  // Entscheidungen des Inhabers (Runde 127/128/136): frei sind Test, Ergebnistyp, Motto, Kurzfassung,
  // Radar, je Dimension Wert und Kernsatz, 7 Tage Tagesform, Vergleiche mit zwei Personen und zwei
  // Archivplaetze. Ausfuehrlicher Bericht, "Verstehen" und alles Weitere sind Lucenta+, gesperrt als
  // verschwommene Vorschau des echten Inhalts.
  // Nichts wird geloescht oder weggenommen: Die freie Fassung ZEIGT weniger, alles Eingetragene
  // bleibt.
  var PLUS_SCHLUESSEL = 'lucenta_plus';
  function istPlus(){
    try{ return localStorage.getItem(PLUS_SCHLUESSEL) === '1'; }catch(e){ return false; }
  }
  function plusSetzen(an){
    try{ an ? localStorage.setItem(PLUS_SCHLUESSEL, '1') : localStorage.removeItem(PLUS_SCHLUESSEL); }catch(e){}
    syncWortmarke();
  }
  // Das "+" an der Wortmarke wird nur hier und beim Start nachgezogen — der Zustand aendert sich nur
  // hier.
  function syncWortmarke(){
    var el = $('wortmarkePlus');
    if (el) el.hidden = !istPlus();
  }
  // So viele Tage der Tagesform zeigt die freie Fassung (Entscheidung des Inhabers: 7).
  var FREI_TAGE = 7;
  // So viele Durchlaeufe zeigt die freie Fassung im Verlauf: der aktuelle und der davor. Genug,
  // um zu sehen DASS sich etwas bewegt, zu wenig, um zu sehen WIE.
  var FREI_DURCHLAEUFE = 2;
  // Runde 127: Der Code der einen Person, mit der die freie Fassung vergleichen darf.
  var FREI_VERGLEICH_SCHLUESSEL = 'lucenta_vergleich_frei';
  // Runde 136, Entscheidung des Inhabers: zwei Personen und zwei Plaetze im Vergleichsarchiv frei.
  var FREI_VERGLEICHE = 2;
  var FREI_ARCHIV = 2;
  // Bis Runde 135 stand hier EIN Code als Text; ein alter Eintrag wird als Liste mit diesem Code
  // gelesen.
  function freieVergleichePersonen(){
    var roh = null;
    try{ roh = localStorage.getItem(FREI_VERGLEICH_SCHLUESSEL); }catch(e){}
    if (!roh) return [];
    try{
      var l = JSON.parse(roh);
      if (Array.isArray(l)) return l.filter(function(c){ return typeof c === 'string'; });
    }catch(e){}
    return [roh];
  }

  // ---------- Nutzungsmessung ----------
  // Nur an WELCHEN Kalendertagen die App offen war — keine Uhrzeiten, Ansichten, Kennungen. Bleibt auf
  // dem Geraet; geht nur mit, wer es bei der Beta-Rueckmeldung ausdruecklich einschaltet und vorher
  // sieht, was mitginge.
  var NUTZUNG_SCHLUESSEL = 'lucenta_nutzung';
  // Vier Monate; der erste Tag steht separat in `start`, damit das Kuerzen den Bezugspunkt nicht
  // wegwirft.
  var NUTZUNG_MAX_TAGE = 120;
  // Monat und Tag werden mitgeprueft: Date.UTC rechnet Ueberlaeufe still um ('2026-13-99' wird ein Tag
  // im Maerz).
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
    // indexOf zusaetzlich, damit eine zurueckgestellte Geraeteuhr keinen doppelten Tag erzeugt.
    if (n.tage[n.tage.length-1] !== heute && n.tage.indexOf(heute) < 0) n.tage.push(heute);
    if (n.tage.length > NUTZUNG_MAX_TAGE) n.tage = n.tage.slice(n.tage.length - NUTZUNG_MAX_TAGE);
    try{ localStorage.setItem(NUTZUNG_SCHLUESSEL, JSON.stringify(n)); }catch(e){}
    return n;
  }
  function nutzungLoeschen(){
    try{ localStorage.removeItem(NUTZUNG_SCHLUESSEL); }catch(e){}
  }
  // Ueber Date.UTC aus den drei Zahlen, nicht new Date('2026-09-08'): Der Schluessel ist ORTSZEIT; als
  // UTC gelesen waere er westlich von Greenwich einen Tag daneben.
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
    // D30: War jemand nach dem dreissigsten Tag noch da? Vorher "noch nicht messbar" (null),
    // ausdruecklich nicht "nein".
    var d30 = seitStart < 31 ? null : n.tage.some(function(t){
      var z = tagAlsZahl(t);
      return !isNaN(z) && z - start >= 30;
    });
    var h = loadHistory();
    // Abstand zwischen erstem und zweitem Durchlauf.
    var tageBisZweiter = (h.length >= 2 && typeof h[0].date === 'number' && typeof h[1].date === 'number')
      ? Math.max(0, Math.round((h[1].date - h[0].date) / 86400000)) : null;
    var eintraege = loadStateHistory(), tage = stateTage(eintraege);
    var proWoche = 0;
    if (tage.length){
      var erste = tagAlsZahl(tage[0].day);
      // Die Spanne laeuft bis HEUTE, sonst haette, wer aufgehoert hat, eine tadellose Quote.
      var spanne = (isNaN(erste) || isNaN(heute)) ? tage.length : Math.max(1, heute - erste + 1);
      proWoche = tage.length / (spanne / 7);
    }
    return {
      seitStart: seitStart, tageGeoeffnet: n.tage.length, letzte30: letzte30, d30: d30,
      durchlaeufe: h.length, tageBisZweiter: tageBisZweiter,
      tagesformTage: tage.length, tagesformEintraege: eintraege.length, tagesformProWoche: proWoche
    };
  }

  // 800 Eintraege (~130 KB): Der Monatskalender blaettert weit zurueck.
  var MAX_STATE_EINTRAEGE = 800;

  // ---------- Die fuenf Dimensionen in der Tagesform ----------
  // Optional je Eintrag: ocean {O..S: 1–5, einzelne duerfen fehlen} und tags aus der festen Liste
  // STICHWORTE (kein Freitext). Beides wird beim Lesen bereinigt; alte Eintraege ohne beides bleiben
  // gueltig.
  var TF_DIMENSIONEN = ['O','E','C','A','S'];
  var STICHWORTE = ['arbeit','lernen','sport','draussen','freunde','familie','allein',
                    'kreativ','unterwegs','erholung','schlaf_gut','schlaf_wenig'];
  function tfOceanBereinigen(o){
    if (!o || typeof o !== 'object') return null;
    var aus = {}, n = 0;
    TF_DIMENSIONEN.forEach(function(d){
      var v = o[d];
      if (typeof v === 'number' && v >= 1 && v <= 5){ aus[d] = v; n++; }
    });
    return n ? aus : null;
  }
  function tfTagsBereinigen(t){
    if (!Array.isArray(t)) return [];
    var gesehen = {};
    return t.filter(function(x){
      if (STICHWORTE.indexOf(x) < 0 || gesehen[x]) return false;
      gesehen[x] = 1; return true;
    });
  }
  // Grobe Tageszeiten statt Uhrzeiten.
  function zeitabschnitt(ts){
    var h;
    try{ h = new Date(ts).getHours(); }catch(e){ return 'mittag'; }
    // Runde 131 (Inhaber): Grenzen eine Stunde spaeter, damit die Nacherinnerungen (11, 16 Uhr)
    // noch in ihrer Tageszeit liegen. Vorher 11 und 17.
    if (h < 12) return 'morgen';
    if (h < 18) return 'mittag';
    return 'abend';
  }
  // Je Tageszeit EIN Eintrag (Entscheidung des Inhabers); ein zweiter ersetzt den ersten.
  // TF_ABSCHNITT_BEGINN muss zu zeitabschnitt() passen; die Erinnerungen (19b-native.js) liegen
  // innerhalb der Abschnitte.
  var TF_ABSCHNITTE = ['morgen', 'mittag', 'abend'];
  var TF_ABSCHNITT_BEGINN = {morgen:0, mittag:12, abend:18};
  function aktuellerAbschnitt(){ return zeitabschnitt(Date.now()); }
  // Welche Abschnitte heute schon belegt sind, je Abschnitt der juengste Eintrag. Bestand von vor
  // Runde 129 kann einen Abschnitt mehrfach tragen; gezeigt wird dann der letzte.
  function heuteEingetragen(){
    var key = todayKey(), belegt = {};
    loadStateHistory().forEach(function(e){
      if (e.day === key && (!belegt[e.slot] || e.ts >= belegt[e.slot].ts)) belegt[e.slot] = e;
    });
    return belegt;
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
        // Alte Eintraege ohne Abschnitt bekommen ihn beim Lesen, damit der uebrige Code nur eine Form
        // kennt.
        if (!e.slot) e.slot = zeitabschnitt(e.ts);
        var o = tfOceanBereinigen(e.ocean);
        if (o) e.ocean = o; else delete e.ocean;
        var t = tfTagsBereinigen(e.tags);
        if (t.length) e.tags = t; else delete e.tags;
        return e;
      });
    }catch(e){ return []; }
  }
  function saveStateHistoryList(h){
    try{ localStorage.setItem('lucenta_state', JSON.stringify(h)); return true; }catch(e){ return false; }
  }
  function addStateEntry(energy, valence, extra){
    var h = loadStateHistory();
    var jetzt = Date.now();
    var eintrag = {day:todayKey(), ts:jetzt, energy:energy, valence:valence, slot:zeitabschnitt(jetzt)};
    // Runde 129: Ein Eintrag im selben Abschnitt desselben Tages ersetzt den vorhandenen — so kann
    // ein Tag nie mehr als drei tragen. Auch mehrfacher Altbestand im Abschnitt geht dabei auf.
    h = h.filter(function(e){ return !(e.day === eintrag.day && e.slot === eintrag.slot); });
    var o = tfOceanBereinigen(extra && extra.ocean);
    var t = tfTagsBereinigen(extra && extra.tags);
    if (o) eintrag.ocean = o;
    if (t.length) eintrag.tags = t;
    h.push(eintrag);
    h.sort(function(a,b){ return a.ts-b.ts; });
    if (h.length>MAX_STATE_EINTRAEGE) h = h.slice(h.length-MAX_STATE_EINTRAEGE);
    return saveStateHistoryList(h);
  }
  // Fasst Eintraege zu Tagen zusammen (sonst haette ein Tag mit drei Eintraegen dreifaches Gewicht).
  // Jede Dimension wird nur ueber die Eintraege gemittelt, die sie tragen; Stichworte eines Tages sind
  // die Vereinigung.
  function stateTage(hist){
    var proTag = {}, reihenfolge = [];
    (hist||[]).forEach(function(e){
      if (!proTag[e.day]){
        proTag[e.day] = {day:e.day, ts:e.ts, energy:0, valence:0, anzahl:0, o:{}, on:{}, tags:{}};
        reihenfolge.push(e.day);
      }
      var t = proTag[e.day];
      t.energy += e.energy; t.valence += e.valence; t.anzahl++;
      if (e.ts > t.ts) t.ts = e.ts;
      if (e.ocean) TF_DIMENSIONEN.forEach(function(d){
        if (typeof e.ocean[d] === 'number'){ t.o[d] = (t.o[d]||0) + e.ocean[d]; t.on[d] = (t.on[d]||0) + 1; }
      });
      (e.tags||[]).forEach(function(x){ t.tags[x] = 1; });
    });
    return reihenfolge.map(function(k){
      var t = proTag[k];
      var tag = {day:t.day, ts:t.ts, anzahl:t.anzahl,
                 energy: t.energy/t.anzahl, valence: t.valence/t.anzahl};
      var dims = Object.keys(t.on);
      if (dims.length){
        tag.ocean = {};
        dims.forEach(function(d){ tag.ocean[d] = t.o[d] / t.on[d]; });
      }
      var tags = STICHWORTE.filter(function(x){ return t.tags[x]; });
      if (tags.length) tag.tags = tags;
      return tag;
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
  // Vergleichsarchiv: Schnappschuesse (eigener Code, anderer Code, Name, Zeit, Prozent) — bleiben
  // nachvollziehbar, auch wenn sich das eigene Ergebnis aendert.
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
      // Auch "System" wird gespeichert: Ohne Eintrag gilt dunkel (Entscheidung des Inhabers).
      localStorage.setItem('lucenta_theme', mode);
    }catch(e){}
    // Die iOS-Huelle muss die Darstellung VOR dem Laden kennen (Startbild): Die Seite meldet jede Wahl
    // an MainViewController.swift (UserDefaults). Ausserhalb der App geschieht nichts.
    try{
      var empf = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.lucentaThema;
      if (empf) empf.postMessage(mode);
    }catch(e){}
  }
  function loadThemeMode(){
    try{
      var t = localStorage.getItem('lucenta_theme');
      return (t==='dark' || t==='light' || t==='system') ? t : 'dark';
    }catch(e){ return 'dark'; }
  }
  // Welcher Modus ist wirklich zu sehen? Bei "System" sagt data-theme nichts — erst beides zusammen
  // ist verlaesslich.
  function dunkelAktiv(){
    try{
      var m = document.documentElement.getAttribute('data-theme');
      if (m === 'dark') return true;
      if (m === 'light') return false;
      return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }catch(e){ return false; }
  }

  // Die vorhandenen theme-color-Eintraege werden umgeschrieben statt einen weiteren anzuhaengen: Es
  // gilt der ERSTE passende Eintrag, ein angehaengter kam nie zum Zug. Ausgangswerte werden gesichert,
  // damit "System" sie zurueckbekommt.
  var themeColorOriginal = null;
  function themeColorEintraege(){
    try{ return [].slice.call(document.querySelectorAll('meta[name="theme-color"]')); }
    catch(e){ return []; }
  }
  function syncThemeColor(mode){
    try{
      var metas = themeColorEintraege();
      if (!metas.length) return;
      if (themeColorOriginal === null){
        themeColorOriginal = metas.map(function(m){ return m.getAttribute('content'); });
      }
      if (mode!=='dark' && mode!=='light'){
        metas.forEach(function(m, i){
          if (themeColorOriginal[i] != null) m.setAttribute('content', themeColorOriginal[i]);
        });
        return;
      }
      var farbe = mode==='dark' ? '#000000' : '#E6E5E0';
      metas.forEach(function(m){ m.setAttribute('content', farbe); });
    }catch(e){}
  }
  var themeShiftTimer = null;
  // Schalter: Wert merken; die Wirkung liegt in tapFeedback() bzw. prefersReducedMotion().
  function schalterLesen(schluessel, standard){
    try{ return localStorage.getItem(schluessel) || standard; }catch(e){ return standard; }
  }
  // Der Zustand steht im Element (aria-checked, role=switch).
  function schalterSetzen(schluessel, wert, schalterId){
    try{ localStorage.setItem(schluessel, wert); }catch(e){}
    if (schluessel === 'lucenta_bewegung') bewegungKlasse(wert);
    var el = $(schalterId);
    if (el && el.setAttribute) el.setAttribute('aria-checked', wert === 'an' ? 'true' : 'false');
  }
  function schalterUmlegen(schluessel, schalterId){
    schalterSetzen(schluessel, schalterLesen(schluessel, 'an') === 'an' ? 'aus' : 'an', schalterId);
  }
  // Die Klasse ist noetig, weil CSS-Animationen nur auf die SYSTEM-Einstellung hoeren.
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
    // Ueberblendung beim Farbwechsel nur waehrend des Wechsels (300 ms) — dauerhafte Uebergaenge
    // machten die Druckzustaende traege.
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

  
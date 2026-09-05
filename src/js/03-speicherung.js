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
  var MAX_STATE_HISTORY = 30;
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
      });
    }catch(e){ return []; }
  }
  function saveStateHistoryList(h){
    try{ localStorage.setItem('lucenta_state', JSON.stringify(h)); return true; }catch(e){ return false; }
  }
  function upsertStateToday(energy, valence){
    var h = loadStateHistory();
    var key = todayKey();
    h = h.filter(function(e){ return e.day!==key; });
    h.push({day:key, ts:Date.now(), energy:energy, valence:valence});
    h.sort(function(a,b){ return a.ts-b.ts; });
    if (h.length>MAX_STATE_HISTORY) h = h.slice(h.length-MAX_STATE_HISTORY);
    return saveStateHistoryList(h);
  }
  function todayStateEntry(){
    var key = todayKey();
    var h = loadStateHistory();
    for (var i=0;i<h.length;i++){ if (h[i].day===key) return h[i]; }
    return null;
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
  function applyTheme(mode){
    if (mode==='dark' || mode==='light') document.documentElement.setAttribute('data-theme', mode);
    else document.documentElement.removeAttribute('data-theme');
    syncThemeColor(mode);
    saveThemeMode(mode);
    ['System','Light','Dark'].forEach(function(key){
      var btn = $('theme'+key);
      if (btn) btn.setAttribute('aria-pressed', btn.dataset.mode===mode ? 'true':'false');
    });
  }

  
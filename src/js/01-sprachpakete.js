// ================= Sprachpakete =================
// Alle Texte stehen in CONTENT, nach Sprache getrennt; die alten Variablennamen werden daraus
// abgeleitet.
  var CONTENT = {};
  // Sprachpakete NEBEN der Datei. In der Ein-Datei-Fassung (dist/lucenta.html) bleibt die Tabelle leer
  // — dort stehen alle acht Pakete im Quelltext. Nur die App-Fassung (dist/index.html) traegt hier die
  // sieben Dateien (von build.js eingesetzt): zwei Drittel weniger zu parsen, gebraucht wird immer
  // genau eines.
  var SPRACHQUELLEN = {};
  @@I18N@@
  // Nachgeladene Dateien laufen global; diese Bruecke ist der einzige Weg in CONTENT (nimmt nur
  // entgegen).
  try{
    if (typeof window !== 'undefined') window.__lucentaSprachpaket = function(code, paket){
      if (code && paket) CONTENT[code] = paket;
    };
  }catch(e){}

  // Holt ein fehlendes Paket und ruft danach(erfolg); ist es da oder gibt es keine Quelle, sofort.
  var _imZulauf = {};
  function ladeSprachpaket(code, danach){
    if (CONTENT[code]) { danach(true); return; }
    var quelle = SPRACHQUELLEN[code];
    if (!quelle || typeof document === 'undefined') { danach(false); return; }
    // Zwei Tipps auf dieselbe Sprache duerfen die Datei nicht zweimal holen.
    if (_imZulauf[code]) { _imZulauf[code].push(danach); return; }
    _imZulauf[code] = [danach];
    function fertig(erfolg){
      var wartende = _imZulauf[code];
      // Beim Fehlschlag geloescht statt auf false gesetzt: Ein zweiter Versuch soll es erneut
      // versuchen duerfen, sonst bliebe die Sprache bis zum Neustart der App gesperrt.
      delete _imZulauf[code];
      for (var i=0;i<wartende.length;i++){ try{ wartende[i](erfolg); }catch(e){} }
    }
    try{
      var s = document.createElement('script');
      s.src = quelle;
      s.async = true;
      // Nachsehen, ob das Paket wirklich angekommen ist, statt onload zu trauen.
      s.onload = function(){ fertig(!!CONTENT[code]); };
      s.onerror = function(){ fertig(false); };
      document.head.appendChild(s);
    }catch(e){ fertig(false); }
  }

  // Aktive Sprache. Faellt auf Deutsch zurueck, solange keine andere gewaehlt oder vorhanden ist.
  var LANG = 'de';
  try{
    var _sl = localStorage.getItem('lucenta_lang');
    if (_sl && CONTENT[_sl]) LANG = _sl;
  }catch(e){}
  var L = CONTENT[LANG];

  var LABELS = L.LABELS, RADAR_LABELS = L.RADAR_LABELS, FACTORS = L.FACTORS, PROFILES = L.PROFILES, CORE = L.CORE, FLAVOR = L.FLAVOR, MOTTO = L.MOTTO, NOUN = L.NOUN, ADJ = L.ADJ, COMPAT = L.COMPAT, CMP_GESAMT = L.CMP_GESAMT, KOMBI = L.KOMBI, UNDERSTAND = L.UNDERSTAND, LEBEN = L.LEBEN, VIEW_LABELS = L.VIEW_LABELS, VIEW_TITLES = L.VIEW_TITLES, QUIZ_HINTS = L.QUIZ_HINTS, QUIZ_MILESTONES = L.QUIZ_MILESTONES;

  // tx(): Text der aktiven Sprache, sonst Deutsch, sonst der Schluessel — nie eine leere Stelle.
  // Bewusst nicht `t` (wird lokal oft benutzt).
  function tx(key){
    var a = CONTENT[LANG] && CONTENT[LANG].UI;
    if (a && typeof a[key] === 'string') return a[key];
    var d = CONTENT.de && CONTENT.de.UI;
    if (d && typeof d[key] === 'string') return d[key];
    return key;
  }

  // Sprachwechsel ohne Neuladen (ein laufender Durchlauf bliebe sonst nicht erhalten): Inhalte neu
  // binden, abgeleitete Variablen mitziehen, Ansichten neu aufbauen.
  function setLang(code){
    if (code === LANG) return;
    // Fehlt das Paket (App-Fassung), erst holen und dann denselben Aufruf wiederholen.
    if (!CONTENT[code]){
      if (!SPRACHQUELLEN[code]) return;
      ladeSprachpaket(code, function(erfolg){ if (erfolg) setLang(code); });
      return;
    }
    LANG = code;
    try{ localStorage.setItem('lucenta_lang', code); }catch(e){}
    L = CONTENT[LANG];
    LABELS = L.LABELS; RADAR_LABELS = L.RADAR_LABELS; FACTORS = L.FACTORS; PROFILES = L.PROFILES;
    CORE = L.CORE; FLAVOR = L.FLAVOR; MOTTO = L.MOTTO; NOUN = L.NOUN; ADJ = L.ADJ;
    COMPAT = L.COMPAT; CMP_GESAMT = L.CMP_GESAMT; KOMBI = L.KOMBI; UNDERSTAND = L.UNDERSTAND; LEBEN = L.LEBEN; VIEW_LABELS = L.VIEW_LABELS;
    VIEW_TITLES = L.VIEW_TITLES; QUIZ_HINTS = L.QUIZ_HINTS; QUIZ_MILESTONES = L.QUIZ_MILESTONES;
    // Die Fragen werden aus FACTORS zusammengesetzt; ohne Neuaufbau bliebe der Fragebogen
    // in der alten Sprache stehen, waehrend die Oberflaeche schon gewechselt hat.
    rebuildItems();
    resetDateFmt();
    resetWochentagFmt();
    applyI18n();
    // Kurzes Aufblenden der Ansicht als Rueckmeldung.
    markLangShift();
    syncLangButtons();
    $('viewLabel').textContent = VIEW_LABELS[currentView] || '';
    navLeisteAnwenden();
    document.title = VIEW_TITLES[currentView] ? ('Lucenta — '+VIEW_TITLES[currentView]) : 'Lucenta';
    renderQuestion();
    renderArchetypeGroups();
    renderPreviewCard(); ordneStartseite();
    renderLandingUnderstandTeaser();
    renderLandingStateTeaser();
    erinnerungAnwenden();   // Runde 129: der Hinweis traegt Uhrzeiten im Format der Sprache
    syncHeroState();
    refreshDrawerState();
    renderSettings();
    if (currentView === 'result' && scores) renderResult();
    if (currentView === 'understand') renderUnderstand();
    if (currentView === 'state') renderStateView();
    if (currentView === 'profile') renderProfile();
    if (currentView === 'archetypes') renderArchetypeGroups();
  }
  function markLangShift(){
    if (prefersReducedMotion()) return;
    // Beim Nachholen der gespeicherten Sprache hat niemand getippt — ein Aufblenden beantwortet
    // dort eine Frage, die keiner gestellt hat.
    if (_stillerWechsel) return;
    try{
      var views = document.querySelectorAll('.view');
      for (var i=0;i<views.length;i++){
        if (getComputedStyle(views[i]).display === 'none') continue;
        var v = views[i];
        v.classList.remove('lang-shift');
        // Erzwungenes Auslesen, damit der Browser die Animation als neu erkennt — dasselbe
        // Muster wie bei animateQuestionIn().
        void v.offsetWidth;
        v.classList.add('lang-shift');
        break;
      }
    }catch(e){}
  }
  function syncLangButtons(){
    try{
      document.querySelectorAll('[data-lang]').forEach(function(b){
        b.setAttribute('aria-checked', b.getAttribute('data-lang')===LANG ? 'true':'false');
      });
      // Die Einstellungszeile nennt die gewaehlte Sprache — aus der Liste selbst genommen, damit die
      // Namen nicht doppelt stehen.
      var gewaehlt = document.querySelector('.wahl-zeile[data-lang="'+LANG+'"] span');
      var ziel = $('spracheAktuell');
      if (gewaehlt && ziel){ ziel.textContent = gewaehlt.textContent; ziel.setAttribute('lang', LANG); }
    }catch(e){}
  }

  // Wandelt die in den Texten verwendeten HTML-Entitaeten in echte Zeichen um. Notwendig fuer
  // Stellen, an denen nur ein Textknoten ersetzt wird und kein HTML gesetzt werden kann.
  var _entBox = null;
  function decodeEntities(str){
    if (str.indexOf('&') < 0) return str;
    try{
      if (!_entBox) _entBox = document.createElement('div');
      _entBox.innerHTML = str;
      return _entBox.textContent;
    }catch(e){ return str; }
  }

  // Die Texte enthalten HTML-Entitaeten (&mdash;, &shy;) — deshalb als HTML setzen, nicht textContent.
  // Die Werte stammen nur aus den eigenen Sprachpaketen.
  function applyI18n(){
    var t = (CONTENT[LANG] && CONTENT[LANG].UI) || {};
    try{
      document.querySelectorAll('[data-i18n]').forEach(function(el){
        var v = t[el.getAttribute('data-i18n')];
        if (typeof v === 'string') el.innerHTML = v;
      });
      // Elemente mit Symbol (Aufklapp-Pfeil): nur den Textknoten tauschen; Entitaeten vorher
      // aufloesen.
      document.querySelectorAll('[data-i18n-text]').forEach(function(el){
        var v = t[el.getAttribute('data-i18n-text')];
        if (typeof v !== 'string') return;
        v = decodeEntities(v);
        for (var i=0;i<el.childNodes.length;i++){
          if (el.childNodes[i].nodeType === 3 && el.childNodes[i].nodeValue.trim()){
            el.childNodes[i].nodeValue = v; return;
          }
        }
        el.insertBefore(document.createTextNode(v), el.firstChild);
      });
      document.querySelectorAll('[data-i18n-html]').forEach(function(el){
        var v = t[el.getAttribute('data-i18n-html')];
        if (typeof v === 'string') el.innerHTML = v;
      });
      // Attribute (placeholder, aria-label) sind reiner Text: Entitaeten vorher aufloesen.
      document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
        var v = t[el.getAttribute('data-i18n-placeholder')];
        if (typeof v === 'string') el.setAttribute('placeholder', decodeEntities(v));
      });
      document.querySelectorAll('[data-i18n-aria]').forEach(function(el){
        var v = t[el.getAttribute('data-i18n-aria')];
        if (typeof v === 'string') el.setAttribute('aria-label', decodeEntities(v));
      });
      document.documentElement.lang = LANG;
    }catch(e){}
  }


  var ORDER = ['O','E','C','A','S'];



  // Fragen als Funktion erzeugt, damit ein Sprachwechsel sie neu bauen kann; die Zuordnung Position ->
  // Dimension bleibt gleich.
  var ITEMS = [];
  function rebuildItems(){
    ITEMS.length = 0;
    for (var i=0;i<10;i++){
      for (var j=0;j<ORDER.length;j++){
        var f = ORDER[j];
        ITEMS.push({factor:f, text:FACTORS[f][i].t, key:FACTORS[f][i].k});
      }
    }
  }
  rebuildItems();

  // Die gemerkte Sprache nachholen, wenn ihr Paket nicht eingebettet ist: Die App startet kurz auf
  // Deutsch und stellt um, sobald die Datei (aus dem Bundle) da ist.
  var _stillerWechsel = false;
  try{
    var _gemerkt = localStorage.getItem('lucenta_lang');
    if (_gemerkt && _gemerkt !== LANG && !CONTENT[_gemerkt] && SPRACHQUELLEN[_gemerkt]){
      ladeSprachpaket(_gemerkt, function(erfolg){
        if (!erfolg) return;   // bleibt auf Deutsch — lesbar ist besser als leer
        _stillerWechsel = true;
        try{ setLang(_gemerkt); }
        finally{ _stillerWechsel = false; }
      });
    }
  }catch(e){}














  
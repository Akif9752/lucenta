// ================= Sprachpakete =================
  // Feedback-Runde 54: Saemtliche Inhalte lagen bislang als deutsche Literale ueber die ganze
  // Datei verteilt. Sie stehen jetzt gesammelt in CONTENT, nach Sprache getrennt. Die bisherigen
  // Variablennamen werden daraus abgeleitet, damit KEINE einzige Zeile der uebrigen Logik
  // angefasst werden musste — der Umbau ist damit ein reines Verschieben, kein Umschreiben.
  var CONTENT = {};
  @@I18N@@
  // Aktive Sprache. Faellt auf Deutsch zurueck, solange keine andere gewaehlt oder vorhanden ist.
  var LANG = 'de';
  try{
    var _sl = localStorage.getItem('lucenta_lang');
    if (_sl && CONTENT[_sl]) LANG = _sl;
  }catch(e){}
  var L = CONTENT[LANG];

  var LABELS = L.LABELS, RADAR_LABELS = L.RADAR_LABELS, FACTORS = L.FACTORS, PROFILES = L.PROFILES, CORE = L.CORE, FLAVOR = L.FLAVOR, MOTTO = L.MOTTO, NOUN = L.NOUN, ADJ = L.ADJ, COMPAT = L.COMPAT, UNDERSTAND = L.UNDERSTAND, VIEW_LABELS = L.VIEW_LABELS, VIEW_TITLES = L.VIEW_TITLES, QUIZ_HINTS = L.QUIZ_HINTS, QUIZ_MILESTONES = L.QUIZ_MILESTONES;

  // Setzt die Texte der aktiven Sprache in die Oberflaeche. Elemente mit data-i18n bekommen
  // reinen Text, solche mit data-i18n-html duerfen Auszeichnung enthalten (Hervorhebungen,
  // Verweise). Fehlt ein Schluessel in der gewaehlten Sprache, bleibt der vorhandene Text stehen
  // — lieber eine deutsche Zeile in einer englischen Oberflaeche als eine leere.
  // Liefert einen Text der aktiven Sprache. Fehlt der Schluessel dort, wird auf Deutsch
  // zurueckgefallen, und erst dann auf den Schluessel selbst — eine fehlende Uebersetzung
  // zeigt damit deutschen Text, niemals eine leere Stelle.
  // Bewusst NICHT `t` genannt: `t` wird im uebrigen Code an mehreren Stellen als lokale
  // Variable verwendet (Toast-Element, Schleifenparameter) und wuerde die Funktion verdecken.
  function tx(key){
    var a = CONTENT[LANG] && CONTENT[LANG].UI;
    if (a && typeof a[key] === 'string') return a[key];
    var d = CONTENT.de && CONTENT.de.UI;
    if (d && typeof d[key] === 'string') return d[key];
    return key;
  }

  // Wechselt die Sprache. Die Inhaltsbloecke werden neu gebunden — deshalb muessen die
  // abgeleiteten Variablen mitgezogen und alle bereits gerenderten Ansichten neu aufgebaut
  // werden. Ein Neuladen der Seite waere einfacher, wuerde aber den ungespeicherten Zustand
  // (laufender Testdurchlauf, offene Ansicht) verwerfen.
  function setLang(code){
    if (!CONTENT[code] || code === LANG) return;
    LANG = code;
    try{ localStorage.setItem('lucenta_lang', code); }catch(e){}
    L = CONTENT[LANG];
    LABELS = L.LABELS; RADAR_LABELS = L.RADAR_LABELS; FACTORS = L.FACTORS; PROFILES = L.PROFILES;
    CORE = L.CORE; FLAVOR = L.FLAVOR; MOTTO = L.MOTTO; NOUN = L.NOUN; ADJ = L.ADJ;
    COMPAT = L.COMPAT; UNDERSTAND = L.UNDERSTAND; VIEW_LABELS = L.VIEW_LABELS;
    VIEW_TITLES = L.VIEW_TITLES; QUIZ_HINTS = L.QUIZ_HINTS; QUIZ_MILESTONES = L.QUIZ_MILESTONES;
    // Die Fragen werden aus FACTORS zusammengesetzt; ohne Neuaufbau bliebe der Fragebogen
    // in der alten Sprache stehen, waehrend die Oberflaeche schon gewechselt hat.
    rebuildItems();
    applyI18n();
    syncLangButtons();
    $('viewLabel').textContent = VIEW_LABELS[currentView] || '';
    document.title = VIEW_TITLES[currentView] ? ('Lucenta — '+VIEW_TITLES[currentView]) : 'Lucenta';
    renderQuestion();
    renderArchetypeGroups();
    renderLandingUnderstandTeaser();
    renderLandingStateTeaser();
    syncHeroState();
    refreshDrawerState();
    renderSettings();
    if (currentView === 'result' && scores) renderResult();
    if (currentView === 'understand') renderUnderstand();
    if (currentView === 'state') renderStateView();
    if (currentView === 'profile') renderProfile();
    if (currentView === 'archetypes') renderArchetypeGroups();
  }
  function syncLangButtons(){
    try{
      document.querySelectorAll('[data-lang]').forEach(function(b){
        b.setAttribute('aria-pressed', b.getAttribute('data-lang')===LANG ? 'true':'false');
      });
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

  // Setzt die Texte der aktiven Sprache in die Oberflaeche.
  //
  // WICHTIG, und in Runde 54 falsch gemacht: Die Texte enthalten durchgehend HTML-Entitaeten
  // (&mdash;, &shy;, &amp;, &bdquo;). Wird ein solcher Text ueber textContent gesetzt, zeigt der
  // Browser ihn WOERTLICH — auf der Startseite stand dadurch "Of&shy;fen&shy;heit" statt
  // "Offenheit". Deshalb wird hier durchgehend als HTML gesetzt; die Werte stammen ausschliesslich
  // aus den eigenen Sprachpaketen, nie aus Nutzereingaben.
  function applyI18n(){
    var t = (CONTENT[LANG] && CONTENT[LANG].UI) || {};
    try{
      document.querySelectorAll('[data-i18n]').forEach(function(el){
        var v = t[el.getAttribute('data-i18n')];
        if (typeof v === 'string') el.innerHTML = v;
      });
      // Elemente, die neben dem Text ein Symbol tragen (Aufklapp-Pfeile): nur den Textknoten
      // austauschen, damit das Symbol erhalten bleibt. Hier muessen die Entitaeten vorher
      // aufgeloest werden, weil ein Textknoten kein HTML kennt.
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
      document.documentElement.lang = LANG;
    }catch(e){}
  }


  var ORDER = ['O','E','C','A','S'];



  // Die Fragen werden aus den Faktoren zusammengesetzt und ueber alle fuenf Dimensionen
  // verschraenkt. Als Funktion, damit ein Sprachwechsel sie neu erzeugen kann, ohne dass die
  // Reihenfolge sich aendert — die Zuordnung Position -> Dimension bleibt in jeder Sprache gleich.
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














  
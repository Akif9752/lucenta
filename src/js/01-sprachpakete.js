// ================= Sprachpakete =================
  // Feedback-Runde 54: Saemtliche Inhalte lagen bislang als deutsche Literale ueber die ganze
  // Datei verteilt. Sie stehen jetzt gesammelt in CONTENT, nach Sprache getrennt. Die bisherigen
  // Variablennamen werden daraus abgeleitet, damit KEINE einzige Zeile der uebrigen Logik
  // angefasst werden musste — der Umbau ist damit ein reines Verschieben, kein Umschreiben.
  var CONTENT = {};
  // Runde 103: Sprachpakete, die NICHT in der Datei stehen, sondern daneben liegen.
  //
  // In der Ein-Datei-Fassung (dist/lucenta.html) bleibt diese Tabelle LEER — dort stehen alle acht
  // Pakete weiterhin im Quelltext, und daran darf sich nichts aendern: Diese Datei wird einzeln
  // verschickt und ohne Server geoeffnet, ein Nachladen von der Platte ginge dort ins Leere.
  //
  // Nur die App-Fassung (dist/index.html, die Capacitor aus dem Bundle laedt) traegt hier
  // {en:'sprachen/en-<marke>.js', …} — sieben Eintraege, von build.js eingesetzt. Grund: Die acht
  // Pakete sind ~620 KB von 932 KB, also zwei Drittel der Datei, die beim Start geparst werden
  // muss. Gelesen wird davon immer genau EINES.
  var SPRACHQUELLEN = {};
  @@I18N@@
  // Die nachgeladenen Dateien laufen im globalen Bereich; CONTENT liegt in der gemeinsamen IIFE
  // und ist von dort aus unerreichbar. Diese Bruecke ist der einzige Weg hinein — sie nimmt
  // entgegen, statt herauszugeben, damit von aussen nichts an den Paketen geaendert werden kann.
  try{
    if (typeof window !== 'undefined') window.__lucentaSprachpaket = function(code, paket){
      if (code && paket) CONTENT[code] = paket;
    };
  }catch(e){}

  // Holt ein fehlendes Paket nach und ruft danach `danach(erfolg)`. Ist es schon da (oder gibt es
  // keine Quelle dafuer), antwortet sie sofort — die Ein-Datei-Fassung laeuft damit unveraendert
  // synchron durch, ohne je ein Skript anzufassen.
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
      // Nicht dem onload trauen, sondern nachsehen, ob das Paket wirklich angekommen ist: Eine
      // Datei, die laedt und dabei wirkungslos bleibt, meldet sonst Erfolg und die App wechselt
      // in eine Sprache ohne Texte.
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

  var LABELS = L.LABELS, RADAR_LABELS = L.RADAR_LABELS, FACTORS = L.FACTORS, PROFILES = L.PROFILES, CORE = L.CORE, FLAVOR = L.FLAVOR, MOTTO = L.MOTTO, NOUN = L.NOUN, ADJ = L.ADJ, COMPAT = L.COMPAT, CMP_GESAMT = L.CMP_GESAMT, KOMBI = L.KOMBI, UNDERSTAND = L.UNDERSTAND, VIEW_LABELS = L.VIEW_LABELS, VIEW_TITLES = L.VIEW_TITLES, QUIZ_HINTS = L.QUIZ_HINTS, QUIZ_MILESTONES = L.QUIZ_MILESTONES;

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
    if (code === LANG) return;
    // Runde 103: Fehlt das Paket, liegt es in der App-Fassung als eigene Datei daneben. Dann erst
    // holen und danach denselben Aufruf wiederholen — der zweite Durchlauf findet es vor und geht
    // den gewohnten, synchronen Weg. Ein unbekanntes Kuerzel bleibt wie bisher wirkungslos.
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
    COMPAT = L.COMPAT; CMP_GESAMT = L.CMP_GESAMT; KOMBI = L.KOMBI; UNDERSTAND = L.UNDERSTAND; VIEW_LABELS = L.VIEW_LABELS;
    VIEW_TITLES = L.VIEW_TITLES; QUIZ_HINTS = L.QUIZ_HINTS; QUIZ_MILESTONES = L.QUIZ_MILESTONES;
    // Die Fragen werden aus FACTORS zusammengesetzt; ohne Neuaufbau bliebe der Fragebogen
    // in der alten Sprache stehen, waehrend die Oberflaeche schon gewechselt hat.
    rebuildItems();
    resetDateFmt();
    resetWochentagFmt();
    applyI18n();
    // Runde 61: Der Sprachwechsel tauschte den Text ohne jede Antwort aus — auf einer langen
    // Seite wie den Einstellungen war nicht sicher zu sehen, DASS etwas passiert ist. Ein kurzes
    // Aufblenden der aktiven Ansicht beantwortet den Tipp, ohne den Inhalt zu bewegen.
    markLangShift();
    syncLangButtons();
    $('viewLabel').textContent = VIEW_LABELS[currentView] || '';
    document.title = VIEW_TITLES[currentView] ? ('Lucenta — '+VIEW_TITLES[currentView]) : 'Lucenta';
    renderQuestion();
    renderArchetypeGroups();
    renderPreviewCard(); ordneStartseite();
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
      // Attribute sind reiner Text, kein HTML — die Entitaeten muessen deshalb vorher aufgeloest
      // werden, sonst stuende &mdash; woertlich in der Vorlesung des Screenreaders. Runde 58:
      // placeholder und aria-label waren bis dahin ueberhaupt nicht uebersetzt und blieben in
      // jeder Sprache deutsch — im Ersatz-DOM unsichtbar, weil dort nie ein Attribut gelesen wird.
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

  // Runde 103: Die gemerkte Sprache nachholen, wenn ihr Paket nicht in der Datei steht.
  //
  // Die App laeuft dann zuerst auf Deutsch an und stellt um, sobald die Datei da ist. Das ist die
  // Gegenrechnung zur Aufteilung: Wer auf Japanisch gestellt hat, sieht unter Umstaenden einen
  // Wimpernschlag Deutsch — dafuer startet die App fuer alle mit zwei Dritteln weniger Text im
  // Parser. Die Datei liegt im Bundle daneben, nicht im Netz.
  //
  // Das Umstellen passiert erst, nachdem der ganze eingebettete Code durchgelaufen ist (ein
  // nachgeladenes Skript kann nicht mitten hinein) — die Ansichten, die setLang() neu aufbaut,
  // sind zu diesem Zeitpunkt also aufgebaut.
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














  
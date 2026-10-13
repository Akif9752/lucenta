// ---------- Feier und Fehlerantwort ----------
// Ein Stoss nur an den Meilensteinen des Fragebogens (10/20/30/40), ein Schuetteln beim abgewiesenen
// Code. Alles haengt an prefersReducedMotion().

  // Die Farben kommen aus den CSS-Marken, nicht aus Zahlen hier (FUNKEL_FARBEN). Damit stimmt der
  // Stoss im Hell- wie im Dunkelmodus und folgt jeder spaeteren Farbaenderung.
  var feierLaeuft = 0;

  // Funkeln statt Konfetti (Entscheidung des Inhabers): vierzackige Sterne und Lichtpunkte, die
  // auseinanderschweben und verglimmen — kein Fall. Die Bahn steht je Stern in CSS-Eigenschaften, die
  // Bewegung macht .funkeln (11-feier.css). opts: {farben, voll, weite:[min,max]}; `voll` streut
  // rundum.
  var FUNKEL_FARBEN = ['--accent-2', '--accent', '--dim-o', '--dim-e', '--dim-a'];
  function funkelStoss(x, y, anzahl, opts){
    opts = opts || {};
    if (prefersReducedMotion()) return;
    // Mehrere Stoesse gleichzeitig ergaeben ein Gewitter statt einer Antwort.
    if (feierLaeuft > 1) return;
    var box;
    try{
      if (!document.body) return;
      box = document.createElement('div');
    }catch(e){ return; }
    if (!box || !box.style || !box.style.setProperty) return;
    box.className = 'funkeln';
    box.setAttribute('aria-hidden', 'true');
    box.style.left = Math.round(x) + 'px';
    box.style.top  = Math.round(y) + 'px';
    var n = anzahl || 18;
    for (var i = 0; i < n; i++){
      var p = document.createElement('i');
      // Nach UNTEN gefaechert, wenn der Ursprung am oberen Rand liegt (Fortschrittsbalken) —
      // sonst flogen die Sterne sofort aus dem Bild (Runde 78, damals mit Schnipseln gemessen).
      var winkel = (opts.voll ? (i / n) * 360 + Math.random() * 24 : (-20 + Math.random() * 220)) * Math.PI / 180;
      var w = opts.weite || [30, 96];
      var weite = w[0] + Math.random() * (w[1] - w[0]);
      p.style.setProperty('--dx', Math.round(Math.cos(winkel) * weite) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(winkel) * weite) + 'px');
      // Statt zu fallen steigt Licht ein wenig nach — die Bahn klingt nach oben aus.
      p.style.setProperty('--auf', Math.round(6 + Math.random() * 16) + 'px');
      p.style.setProperty('--dreh', Math.round(-50 + Math.random() * 100) + 'deg');
      p.style.setProperty('--verzug', Math.round(Math.random() * 140) + 'ms');
      p.style.setProperty('--dauer', Math.round(1000 + Math.random() * 300) + 'ms');
      var farben = opts.farben || FUNKEL_FARBEN;
      p.style.background = 'var(' + farben[i % farben.length] + ')';
      // Zwei Formen: grosse vierzackige Sterne und dazwischen kleine runde Lichtpunkte. Nur Sterne
      // gleicher Groesse wirken wie ein Muster, nicht wie Funkeln.
      var punkt = i % 4 === 0;
      var kante = punkt ? 3 + Math.round(Math.random() * 2) : 9 + Math.round(Math.random() * 9);
      if (punkt) p.classList.add('funkel-punkt');   // classList: audit_i18n erkennt so den Bezeichner
      p.style.width = kante + 'px';
      p.style.height = kante + 'px';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    feierLaeuft++;
    setTimeout(function(){
      feierLaeuft--;
      if (box.parentNode) box.parentNode.removeChild(box);
    }, 1500);
  }

  // Stoss am rechten Ende des Fortschrittsbalkens; ohne Balken nichts.
  function funkelnAmFortschritt(){
    if (prefersReducedMotion()) return;
    try{
      var fill = $('focusline-fill');
      if (!fill || !fill.getBoundingClientRect) return;
      var r = fill.getBoundingClientRect();
      if (!r || !r.width) return;
      // Runde 129 ("groessere Animationen"): doppelt so viele, weiter gestreut.
      funkelStoss(r.right, r.bottom + 2, 32, {weite:[50, 150]});
    }catch(e){}
  }

  // Klasse entfernen, Wert lesen, neu setzen — sonst startet die Animation beim zweiten Fehlversuch
  // nicht.
  function schuetteln(el){
    if (!el || !el.classList) return;
    if (prefersReducedMotion()) return;
    el.classList.remove('schuettel');
    try{ void el.offsetWidth; }catch(e){}
    el.classList.add('schuettel');
    setTimeout(function(){ if (el.classList) el.classList.remove('schuettel'); }, 500);
  }

  // ---------- Groessere, verspieltere Bewegung ----------
  // Ergebnis, Tagesform, Startseite, Fragebogen und das Tier (Entscheidung des Inhabers). Jede
  // Bewegung haengt an einer Handlung oder einem Ankommen.

  // Klasse neu setzen, sodass die Animation auch beim zweiten Mal wieder laeuft.
  function bewegungNeu(el, klasse, dauer){
    if (!el || !el.classList || prefersReducedMotion()) return;
    el.classList.remove(klasse);
    try{ void el.offsetWidth; }catch(e){}
    el.classList.add(klasse);
    if (dauer) setTimeout(function(){ if (el.classList) el.classList.remove(klasse); }, dauer);
  }
  // Funken aus der Mitte eines Elements, in den Farben von Energie und Stimmung.
  function funkenAn(el){
    if (!el || !el.getBoundingClientRect || prefersReducedMotion()) return;
    try{
      var r = el.getBoundingClientRect();
      if (!r || !r.width) return;
      funkelStoss(r.left + r.width / 2, r.top + r.height / 2, 16,
        {farben:['--daten-energie', '--daten-stimmung', '--accent-2'], voll:true, weite:[26, 74]});
    }catch(e){}
  }
  // Nur direkt nach dem Test. Die Klasse bleibt bis zum naechsten renderResult() stehen.
  function ergebnisEnthuellen(){
    var v = $('view-result');
    if (!v || !v.classList || prefersReducedMotion()) return;
    bewegungNeu(v, 'enthuellung', 0);
    setTimeout(function(){
      try{
        var t = $('archTitle'), r = t && t.getBoundingClientRect ? t.getBoundingClientRect() : null;
        if (r && r.width) funkelStoss(r.left + r.width / 2, r.top + r.height * 0.6, 30, {voll:true, weite:[70, 165]});
      }catch(e){}
    }, 420);
  }
  // Kopf und Karten der Startseite fliegen gestaffelt herein (--karte-i). Nicht unter webdriver — die
  // Fehlersuche misst gleich nach dem Laden.
  function startkartenEinfliegen(){
    try{ if (navigator.webdriver) return; }catch(e){}
    var v = $('view-landing');
    if (!v || !v.querySelectorAll || prefersReducedMotion()) return;
    var i = 0;
    v.querySelectorAll('.hero, .why, .understand-card').forEach(function(el){
      if (el.offsetParent === null) return;          // verborgene Karten zaehlen nicht mit
      el.style.setProperty('--karte-i', String(i++));
    });
    bewegungNeu(v, 'karten-ein', 1800);
  }
  // Das Tier wippt — beim Antippen des Profilbilds und wenn die Schublade aufgeht.
  function tierWippen(el){
    if (!el || !el.classList || !el.classList.contains('hat-figur')) return;
    bewegungNeu(el, 'wippen', 900);
  }

  // Zuklappen nach einem Eintrag (Auftrag des Inhabers): Hoehe messen und auf null fahren, danach
  // display:none. Ohne Messwert oder bei reduzierter Bewegung sofort.
  function zuklappen(el, fertig){
    var ende = function(){ if (fertig) fertig(); };
    if (!el || !el.style) return ende();
    var h = el.scrollHeight;
    if (prefersReducedMotion() || !h || el.style.display === 'none'){ el.style.display = 'none'; return ende(); }
    el.style.height = h + 'px';
    try{ void el.offsetHeight; }catch(e){}
    el.classList.add('klappt-zu');
    el.style.height = '0px';
    setTimeout(function(){
      el.style.display = 'none';
      el.classList.remove('klappt-zu');
      el.style.height = '';
      ende();
    }, 500);
  }
  function aufklappen(el){
    if (!el || !el.style) return;
    el.style.display = '';
    var h = el.scrollHeight;
    if (prefersReducedMotion() || !h) return;
    el.style.height = '0px';
    try{ void el.offsetHeight; }catch(e){}
    el.classList.add('klappt-auf');
    el.style.height = h + 'px';
    setTimeout(function(){ el.classList.remove('klappt-auf'); el.style.height = ''; }, 500);
  }

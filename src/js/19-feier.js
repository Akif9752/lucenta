// ---------- Feier und Fehlerantwort (Runde 78) ----------
  //
  // Zwei Momente hatten bisher keine koerperliche Antwort, obwohl beide die wichtigsten
  // Rueckmeldungen der App sind:
  //
  //   Der Meilenstein im Fragebogen. Bei 10, 20, 30 und 40 beantworteten Fragen erschien ein
  //   Hinweistext und der Balken wurde kurz heller. Beides ist leise. Wer fuenfzig Fragen
  //   durchhaelt, hat an genau vier Stellen einen Grund, sich zu freuen — die Stelle traegt
  //   einen kurzen Stoss. Bewusst NUR dort: ein Stoss bei jeder der fuenfzig Antworten waere
  //   nach zehn Fragen kein Fest mehr, sondern Flimmern.
  //
  //   Der abgewiesene Code. Bislang kam nur ein Hinweis in Textform. Ein Feld, das den Kopf
  //   schuettelt, sagt dasselbe schneller und zeigt zugleich, WO der Fehler steckt.
  //
  // Beides haengt an prefersReducedMotion() — der einen Stelle, an der die Bewegungsvorliebe
  // der App zusammenlaeuft.

  // Die Farben kommen aus den CSS-Marken, nicht aus Zahlen hier (FUNKEL_FARBEN). Damit stimmt der
  // Stoss im Hell- wie im Dunkelmodus und folgt jeder spaeteren Farbaenderung.
  var feierLaeuft = 0;

  // Runde 132, Auftrag des Inhabers: "statt Konfetti wuerde es besser zum App-Konzept passen, wenn
  // man es mit Sparkles ersetzt." Bis Runde 131 flogen hier Papierschnipsel mit Schwerkraft — ein
  // Partybild. Lucenta hat einen Sternenhimmel und einen Strahlenkranz; dazu passt Licht, nicht
  // Papier. Jetzt: vierzackige Sterne und kleine Lichtpunkte, die sanft auseinanderschweben, einmal
  // aufblitzen und verglimmen. Kein Fall — Licht faellt nicht.
  //
  // Die Bahn steht wie bisher in eigenen CSS-Eigenschaften je Stern; die Bewegung macht die
  // Stilvorlage (.funkeln in 11-feier.css). `opts`: {farben, voll, weite:[min,max]}. `voll` streut
  // rundum statt nach unten (aus einem Haken mitten in der Karte).
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

  // Stoss am rechten Ende des Fortschrittsbalkens — also genau dort, wo der eben erreichte
  // Meilenstein steht. Ohne Balken (Ersatz-DOM der Tests, oder ausserhalb des Fragebogens)
  // passiert schlicht nichts.
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

  // Kurzes Schuetteln als Antwort auf eine Eingabe, die nicht angenommen wurde. Die Klasse wird
  // vorher entfernt und der Wert dazwischen ausgelesen, damit der Browser die Animation beim
  // zweiten Fehlversuch erneut startet statt sie als unveraendert zu ueberspringen.
  function schuetteln(el){
    if (!el || !el.classList) return;
    if (prefersReducedMotion()) return;
    el.classList.remove('schuettel');
    try{ void el.offsetWidth; }catch(e){}
    el.classList.add('schuettel');
    setTimeout(function(){ if (el.classList) el.classList.remove('schuettel'); }, 500);
  }

  // ---------- Runde 129: groessere, verspieltere Bewegung ----------
  //
  // Auftrag des Inhabers: "mehr verspielte Animationen, auch etwas groessere als nur kleine
  // Mini-Bewegungen." Gewaehlt hat er vier Stellen — Ergebnis, Tagesform, Startseite, Fragebogen —
  // und das Tier dort, wo es schon steht (Profilbild, Schublade). Die Regel aus Runde 78 bleibt:
  // Jede Bewegung haengt an einer Handlung oder einem Ankommen, keine laeuft ohne Anlass.
  // Alles haengt an prefersReducedMotion() bzw. html.bewegung-aus im Stilblatt.

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
  // Nach dem Test, nicht beim spaeteren Oeffnen eines Ergebnisses: Titel federt herein, der Kranz
  // blitzt auf, das Radar entfaltet sich, und aus dem Titel kommt ein Stoss. Die Klasse bleibt bis
  // zum naechsten renderResult() stehen — sie vorher zu nehmen, startete die Grundbewegungen neu.
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
  // Die Startseite beim Oeffnen der App: Kopf und Karten fliegen gestaffelt herein. Der Versatz
  // steht je Element als --karte-i, die Bewegung im Stilblatt. Unter einem Prueflauf (webdriver)
  // nicht — dort misst die Fehlersuche gleich nach dem Laden Lagen, und eine Karte im Flug waere
  // ein falscher Fund.
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

  // Runde 131, Auftrag des Inhabers: Nach einem Eintrag "muss dort nicht mehr die ganze Zeit die
  // Ankreuzmoeglichkeit stehen — das kann in einer coolen Animation kleiner werden oder sich
  // abschliessen". Die Hoehe wird gemessen und auf null gefahren (height ist nur mit Zahlen
  // animierbar), danach liegt das Element auf display:none. Ohne Messwert (Ersatz-DOM der Tests)
  // oder bei reduzierter Bewegung geschieht dasselbe sofort.
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

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

  // Die Farben kommen aus den CSS-Marken, nicht aus Zahlen hier. Damit stimmt der Stoss im
  // Hell- wie im Dunkelmodus und folgt jeder spaeteren Farbaenderung, ohne dass jemand daran
  // denken muss.
  var FEIER_FARBEN = ['--accent', '--accent-2', '--dim-o', '--dim-e', '--dim-c', '--dim-a'];
  var feierLaeuft = 0;

  // Ein Stoss aus Schnipseln an einem Punkt des Fensters. Die Bahn steht in eigenen
  // CSS-Eigenschaften je Schnipsel; die Bewegung selbst macht die Stilvorlage. Das haelt die
  // Rechnung hier bei reiner Arithmetik und ueberlaesst dem Browser die Bilder.
  // Runde 129: `opts` fuer die groesseren Feiern — {farben, rund, voll, weite:[min,max], fall:[min,max]}.
  // `voll` wirft rundum statt nach unten (Funken aus einem Haken mitten in der Karte).
  function konfettiStoss(x, y, anzahl, opts){
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
    box.className = 'konfetti';
    box.setAttribute('aria-hidden', 'true');
    box.style.left = Math.round(x) + 'px';
    box.style.top  = Math.round(y) + 'px';
    var n = anzahl || 18;
    for (var i = 0; i < n; i++){
      var p = document.createElement('i');
      // Faecher nach UNTEN. Der erste Entwurf warf nach oben — das ist die uebliche Richtung
      // fuer einen Stoss, hier aber falsch: Der Fortschrittsbalken liegt an der obersten Kante
      // des Fensters, die Schnipsel flogen also sofort aus dem Bild. Im Standbild war vom
      // ganzen Stoss nichts zu sehen. Ein paar Grad ueber die Waagerechte hinaus bleiben, damit
      // der Stoss nicht wie ein Tropfen wirkt.
      var winkel = (opts.voll ? (i / n) * 360 + Math.random() * 20 : (-20 + Math.random() * 220)) * Math.PI / 180;
      var w = opts.weite || [30, 96], f = opts.fall || [26, 66];
      var weite  = w[0] + Math.random() * (w[1] - w[0]);
      p.style.setProperty('--dx', Math.round(Math.cos(winkel) * weite) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(winkel) * weite) + 'px');
      // Der Fall danach ist das, was den Stoss als Schwerkraft lesbar macht.
      p.style.setProperty('--fall', Math.round(f[0] + Math.random() * (f[1] - f[0])) + 'px');
      p.style.setProperty('--dreh', Math.round(-220 + Math.random() * 440) + 'deg');
      p.style.setProperty('--verzug', Math.round(Math.random() * 90) + 'ms');
      var farben = opts.farben || FEIER_FARBEN;
      p.style.background = 'var(' + farben[i % farben.length] + ')';
      // Zwei Formen statt einer: gleich grosse Quadrate wirken wie ein Raster, nicht wie Papier.
      if (i % 3 === 0 || opts.rund) p.style.borderRadius = '50%';
      var kante = 5 + Math.round(Math.random() * 4);
      p.style.width = kante + 'px';
      p.style.height = (i % 3 === 0 || opts.rund ? kante : Math.round(kante * 1.6)) + 'px';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    feierLaeuft++;
    setTimeout(function(){
      feierLaeuft--;
      if (box.parentNode) box.parentNode.removeChild(box);
    }, 1150);
  }

  // Stoss am rechten Ende des Fortschrittsbalkens — also genau dort, wo der eben erreichte
  // Meilenstein steht. Ohne Balken (Ersatz-DOM der Tests, oder ausserhalb des Fragebogens)
  // passiert schlicht nichts.
  function konfettiAmFortschritt(){
    if (prefersReducedMotion()) return;
    try{
      var fill = $('focusline-fill');
      if (!fill || !fill.getBoundingClientRect) return;
      var r = fill.getBoundingClientRect();
      if (!r || !r.width) return;
      // Runde 129 ("groessere Animationen"): doppelt so viele Schnipsel, weiter geworfen.
      konfettiStoss(r.right, r.bottom + 2, 40, {weite:[50, 150], fall:[40, 100]});
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
      konfettiStoss(r.left + r.width / 2, r.top + r.height / 2, 18,
        {farben:['--daten-energie', '--daten-stimmung', '--accent'], rund:true, voll:true, weite:[26, 70], fall:[6, 22]});
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
        if (r && r.width) konfettiStoss(r.left + r.width / 2, r.top + r.height * 0.6, 36, {voll:true, weite:[70, 160], fall:[40, 90]});
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

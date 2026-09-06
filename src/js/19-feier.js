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
  function konfettiStoss(x, y, anzahl){
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
      var winkel = (-20 + Math.random() * 220) * Math.PI / 180;
      var weite  = 30 + Math.random() * 66;
      p.style.setProperty('--dx', Math.round(Math.cos(winkel) * weite) + 'px');
      p.style.setProperty('--dy', Math.round(Math.sin(winkel) * weite) + 'px');
      // Der Fall danach ist das, was den Stoss als Schwerkraft lesbar macht.
      p.style.setProperty('--fall', Math.round(26 + Math.random() * 40) + 'px');
      p.style.setProperty('--dreh', Math.round(-220 + Math.random() * 440) + 'deg');
      p.style.setProperty('--verzug', Math.round(Math.random() * 90) + 'ms');
      p.style.background = 'var(' + FEIER_FARBEN[i % FEIER_FARBEN.length] + ')';
      // Zwei Formen statt einer: gleich grosse Quadrate wirken wie ein Raster, nicht wie Papier.
      if (i % 3 === 0) p.style.borderRadius = '50%';
      var kante = 5 + Math.round(Math.random() * 4);
      p.style.width = kante + 'px';
      p.style.height = (i % 3 === 0 ? kante : Math.round(kante * 1.6)) + 'px';
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
      konfettiStoss(r.right, r.bottom + 2, 20);
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

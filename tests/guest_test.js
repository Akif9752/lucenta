  var fails=0, checks=0;
  function ok(c,m){ checks++; if(!c){ fails++; console.log("  FAIL: "+m); } }
  function res(a,b,c,d,e){ return {O:a,C:b,E:c,A:d,S:e}; }

  console.log("\n=== Gastdurchlauf: Besitzerergebnis und Verlauf bleiben unangetastet ===");
  __store = {};
  // Besitzerin macht den Test regulaer
  guestRun = false;
  scores = res(70,60,55,50,45);
  saveResult(scores); appendHistory(scores);
  var ownerCode = toCode(scores);
  ok(loadHistory().length===1, "Verlauf sollte nach erstem Durchlauf 1 Eintrag haben");

  // Gast startet: beginRun(true) setzt das Kennzeichen
  beginRun(true);
  ok(guestRun===true, "beginRun(true) muss guestRun setzen");
  ok(qi===0, "Gastdurchlauf startet bei Frage 1");
  ok(answers.filter(function(a){return a!==0;}).length===0, "Antworten sind zurueckgesetzt");

  // Gast beantwortet alles und beendet
  for (var i=0;i<50;i++) answers[i] = (i%5)+1;
  finishQuiz();

  var storedAfter = loadResult();
  ok(storedAfter!==null, "Besitzerergebnis darf nicht geloescht sein");
  ok(toCode(storedAfter)===ownerCode, "Besitzerergebnis muss unveraendert sein, war: "+toCode(storedAfter)+" statt "+ownerCode);
  ok(loadHistory().length===1, "Gastdurchlauf darf NICHT im Verlauf landen (ist: "+loadHistory().length+")");
  ok(loadProgress()===null, "Zwischenstand ist auch beim Gastdurchlauf aufgeraeumt");
  console.log("  Besitzercode vorher/nachher: "+ownerCode+" / "+toCode(storedAfter));
  console.log("  Verlaufseintraege: "+loadHistory().length);

  console.log("\n=== Regulaere Wiederholung schreibt weiterhin in den Verlauf ===");
  __store = {};
  guestRun = false;
  scores = res(70,60,55,50,45); saveResult(scores); appendHistory(scores);
  beginRun(false);
  ok(guestRun===false, "beginRun(false) muss guestRun loeschen");
  for (var j=0;j<50;j++) answers[j] = (j%4)+1;
  finishQuiz();
  ok(loadHistory().length===2, "eigene Wiederholung muss den Verlauf auf 2 bringen (ist: "+loadHistory().length+")");
  ok(toCode(loadResult())===toCode(scores), "eigene Wiederholung muss das gespeicherte Ergebnis ersetzen");
  console.log("  Verlaufseintraege nach eigener Wiederholung: "+loadHistory().length);

  console.log("\n=== requestRun: Zwischenfrage nur, wenn es etwas zu schuetzen gibt ===");
  __store = {};
  requestRun();
  ok($('runChoice').style.display==='none', "ohne gespeichertes Ergebnis darf keine Zwischenfrage kommen");
  ok(currentView==='quiz', "ohne Ergebnis startet der Test sofort (Ansicht: "+currentView+")");
  __store = {};
  scores = res(70,60,55,50,45); saveResult(scores);
  requestRun();
  ok($('runChoice').style.display==='flex', "mit gespeichertem Ergebnis muss die Zwischenfrage erscheinen");
  ok(currentView==='landing', "die Zwischenfrage steht auf der Startseite (Ansicht: "+currentView+")");
  beginRun(false);
  ok($('runChoice').style.display==='none', "nach der Wahl verschwindet die Zwischenfrage wieder");

  // Runde 92, gemeldet: "wenn man test erneut machen drueckt klappt sich ein fenster aus, wenn
  // man es wieder drueckt soll dieses fenster sich wieder einklappen." Bis dahin war der zweite
  // Druck wirkungslos — die Frage blieb offen stehen.
  console.log("\n=== Der Knopf klappt die Zwischenfrage auf UND wieder zu ===");
  __store = {};
  scores = res(70,60,55,50,45); saveResult(scores);
  showView('landing');
  var sek = $('btnHeroSecondary');
  ok(sek.getAttribute('aria-expanded')==='false',
     "im zugeklappten Zustand meldet der Knopf aria-expanded=false");
  ok(sek.getAttribute('aria-controls')==='runChoice',
     "der Knopf sagt, welche Flaeche er aufklappt");
  sek.onclick();
  ok($('runChoice').style.display==='flex', "erster Druck klappt auf");
  ok(sek.getAttribute('aria-expanded')==='true', "aufgeklappt meldet der Knopf aria-expanded=true");
  sek.onclick();
  ok($('runChoice').style.display==='none', "zweiter Druck klappt wieder zu");
  ok(sek.getAttribute('aria-expanded')==='false', "zugeklappt meldet der Knopf wieder false");
  ok(currentView==='landing', "das Zuklappen wechselt keine Ansicht (Ansicht: "+currentView+")");
  sek.onclick();
  ok($('runChoice').style.display==='flex', "dritter Druck klappt wieder auf — der Wechsel bleibt");
  // Der Abbrechen-Knopf bleibt die zweite Ausfahrt und muss dieselbe Marke zuruecksetzen.
  hideRunChoice();
  ok(sek.getAttribute('aria-expanded')==='false',
     "auch der Weg ueber Abbrechen setzt die Marke am Knopf zurueck");

  // In den beiden anderen Zustaenden klappt derselbe Knopf nichts auf. Eine Marke daran wuerde
  // eine Flaeche ankuendigen, die es dort nicht gibt.
  console.log("\n=== Kein aria-expanded, wo nichts aufklappt ===");
  __store = {};
  scores = res(70,60,55,50,45); saveResult(scores);
  answers = new Array(50).fill(3); qi = 12; saveProgress();
  syncHeroState();
  ok(!sek.hasAttribute('aria-expanded'),
     "bei \"Dein letztes Ergebnis ansehen\" traegt der Knopf keine Aufklapp-Marke");
  ok(!sek.hasAttribute('aria-controls'),
     "und auch kein aria-controls");

  console.log("\n=== Fortschritts-Semantik des Fokus-Strichs ===");
  var fl = $('focusline');
  setFocuslineProgress(13);
  ok(fl.getAttribute('role')==='progressbar', "im Quiz traegt der Strich role=progressbar");
  ok(fl.getAttribute('aria-valuenow')==='13', "aria-valuenow folgt der Frage");
  ok(fl.getAttribute('aria-valuemax')==='50', "aria-valuemax ist 50");
  console.log("  "+fl.getAttribute('aria-valuetext'));
  setFocuslineProgress(null);
  ok(fl.getAttribute('role')===undefined, "ausserhalb des Quiz verschwindet die Rolle wieder");
  ok(fl.getAttribute('aria-valuenow')===undefined, "und ebenso der Wert");

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

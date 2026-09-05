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

  console.log("\n=== Home-Bildschirm-Hinweis ===");
  __store = {};
  ok(syncA2hsHint()===undefined || true, "");
  syncA2hsHint();
  ok($('a2hsHint').style.display==='none', "ohne Ergebnis kein Hinweis");
  scores = res(70,60,55,50,45); saveResult(scores);
  syncA2hsHint();
  ok($('a2hsHint').style.display==='flex', "mit Ergebnis erscheint der Hinweis");
  __store['lucenta_a2hs_hidden']='1';
  syncA2hsHint();
  ok($('a2hsHint').style.display==='none', "einmal weggetippt bleibt er weg");

  console.log("\n=== Home-Bildschirm-Hinweis verschwindet im fremden Rahmen ===");
  __store = {};
  scores = res(70,60,55,50,45); saveResult(scores);
  syncA2hsHint();
  ok($('a2hsHint').style.display==='flex', "ohne Rahmen sichtbar (Ausgangslage)");
  var _self = global.window.self, _top = global.window.top;
  global.window.self = {a:1}; global.window.top = {b:2};   // eingebettete Lage nachstellen
  syncA2hsHint();
  ok($('a2hsHint').style.display==='none', "eingebettet darf der Hinweis NICHT erscheinen — die aeussere Seite bestimmt dort Symbol und App-Name");
  global.window.self = _self; global.window.top = _top;
  syncA2hsHint();
  ok($('a2hsHint').style.display==='flex', "ausserhalb eines Rahmens wieder sichtbar");
  console.log("  eingebettet -> ausgeblendet, eigenstaendig -> sichtbar");

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

  var fails=0, checks=0;
  function ok(c,m){ checks++; if(!c){ fails++; console.log("  FAIL: "+m); } }

  console.log("\n=== Tagesform: Zustandswechsel der Karte ===");
  __store = {};
  renderLandingStateTeaser();
  ok($('landingStateInputs').style.display==='', "ohne Eintrag sind die Skalen sichtbar");
  ok($('landingStateDone').style.display==='none', "ohne Eintrag keine Bestaetigung");
  console.log("  Startzustand: "+$('landingStateCopy').textContent);

  console.log("\n=== Nach der ERSTEN Antwort gibt es eine Quittung ===");
  landingStatePickedEnergy = 4; landingStatePickedValence = null;
  maybeSaveLandingState();
  ok($('landingStateDone').style.display==='none', "eine Haelfte darf noch nicht als erledigt gelten");
  ok(loadStateHistory().length===0, "eine Haelfte darf noch nichts speichern");
  ok(/Energie ist notiert/.test($('landingStateCopy').textContent||''), "die Zeile muss benennen, was noch fehlt (ist: "+$('landingStateCopy')._text+")");
  console.log("  "+$('landingStateCopy').textContent);

  console.log("\n=== Nach der ZWEITEN Antwort wechselt die Karte sichtbar ===");
  landingStatePickedValence = 3;
  maybeSaveLandingState();
  ok($('landingStateInputs').style.display==='none', "die Skalen raeumen sich weg");
  ok($('landingStateDone').style.display==='flex', "die Bestaetigung steht an ihrer Stelle");
  ok($('landingStateCopy').style.display==='none', "die einladende Zeile verschwindet mit");
  ok($('landingStateDone').classList.contains('just-saved'), "der Haken wird nur direkt nach dem Speichern animiert");
  ok(loadStateHistory().length===1, "und der Eintrag ist wirklich gespeichert");
  ok(/Energie 4/.test($('landingStateDoneVals').textContent||''), "die Bestaetigung zeigt den echten Wert (ist: "+$('landingStateDoneVals')._text+")");
  console.log("  "+$('landingStateDoneVals').textContent);

  console.log("\n=== Rueckkehr auf die Startseite: Zustand, kein Ereignis ===");
  renderLandingStateTeaser();
  ok($('landingStateDone').style.display==='flex', "erledigt bleibt erledigt");
  ok(!$('landingStateDone').classList.contains('just-saved'), "die Animation laeuft beim blossen Zurueckkehren NICHT erneut");
  console.log("  Bestaetigung sichtbar, ohne Animation");

  console.log("\n=== 'Aendern' fuehrt zurueck zu den Skalen ===");
  showLandingStateInputs(); renderLandingStateRows();
  ok($('landingStateInputs').style.display==='', "die Skalen sind wieder da");
  ok($('landingStateDone').style.display==='none', "die Bestaetigung weicht");
  ok(landingStatePickedEnergy===4 && landingStatePickedValence===3, "die gespeicherten Werte bleiben vorgewaehlt");
  landingStatePickedValence = 5; maybeSaveLandingState();
  ok(loadStateHistory().length===1, "eine Aenderung am selben Tag legt KEINEN zweiten Eintrag an");
  ok(loadStateHistory()[0].valence===5, "sondern aktualisiert den bestehenden (ist: "+loadStateHistory()[0].valence+")");
  console.log("  Eintraege: "+loadStateHistory().length+", Stimmung jetzt "+loadStateHistory()[0].valence);

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

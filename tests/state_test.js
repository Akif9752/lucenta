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

  console.log("\n=== Ein zweiter Eintrag am selben Tag ERGAENZT (Runde 82) ===");
  // Bis Runde 82 loeschte der zweite Check-in eines Tages den ersten stillschweigend. Wer
  // morgens bei Energie 2 eintrug und abends bei 4, hatte den Morgen nicht mehr. Diese Reihe
  // haelt die neue Zusage fest, weil sie sonst beim naechsten Umbau unbemerkt zurueckfaellt.
  showLandingStateInputs(); renderLandingStateRows();
  ok($('landingStateInputs').style.display==='', "die Skalen sind wieder da");
  ok($('landingStateDone').style.display==='none', "die Bestaetigung weicht");
  ok(landingStatePickedEnergy===null && landingStatePickedValence===null,
     "die Skalen stehen LEER: ein weiterer Eintrag ist ein neuer, keine Korrektur");
  landingStatePickedEnergy = 2; landingStatePickedValence = 5; maybeSaveLandingState();
  ok(loadStateHistory().length===2, "der zweite Eintrag kommt dazu, statt den ersten zu ersetzen (sind: "+loadStateHistory().length+")");
  ok(loadStateHistory()[0].valence===3 && loadStateHistory()[1].valence===5,
     "beide Werte stehen noch da, in ihrer Reihenfolge");
  var heute = todayStateEntry();
  ok(heute.anzahl===2, "der Tag weiss, dass er aus zwei Eintraegen besteht");
  ok(Math.abs(heute.energy - 3) < 0.001 && Math.abs(heute.valence - 4) < 0.001,
     "und der Tageswert ist das Mittel (ist: "+heute.energy+"/"+heute.valence+")");
  ok(loadStateHistory().every(function(e){ return ['morgen','mittag','abend'].indexOf(e.slot) >= 0; }),
     "jeder Eintrag traegt einen Tagesabschnitt");
  ok(stateTage(loadStateHistory()).length===1, "zusammengefasst bleibt es EIN Tag");
  console.log("  Eintraege: "+loadStateHistory().length+", Tag im Mittel "+heute.energy+"/"+heute.valence);

  console.log("\n=== Eintraege ohne Abschnitt (vor Runde 82) bekommen ihn beim Lesen ===");
  // Bestand aus einer aelteren Fassung darf nicht dazu fuehren, dass eine Auswertung auf
  // undefined trifft. Der Abschnitt wird beim Lesen aus dem Zeitstempel ergaenzt.
  var alt2 = [{day:'2020-01-01', ts: new Date(2020,0,1,8,0).getTime(), energy:3, valence:3},
              {day:'2020-01-02', ts: new Date(2020,0,2,20,0).getTime(), energy:4, valence:4}];
  localStorage.setItem('lucenta_state', JSON.stringify(alt2));
  var gelesen = loadStateHistory();
  ok(gelesen.length===2, "alter Bestand bleibt lesbar");
  ok(gelesen[0].slot==='morgen' && gelesen[1].slot==='abend',
     "und bekommt seinen Abschnitt aus der Uhrzeit (ist: "+gelesen[0].slot+"/"+gelesen[1].slot+")");
  console.log("  ergaenzt: "+gelesen[0].slot+", "+gelesen[1].slot);

  console.log("\n=== Runde 124: Big-Five-Fragen und Stichworte am Eintrag ===");
  __store = {};
  ok(addStateEntry(4, 3, {ocean:{O:5, E:2, C:9, X:3}, tags:['sport','sport','erfunden','freunde']}),
     "ein Eintrag mit Fragen und Stichworten wird gespeichert");
  var mitTeilen = loadStateHistory()[0];
  ok(mitTeilen.ocean && mitTeilen.ocean.O===5 && mitTeilen.ocean.E===2,
     "gueltige Antworten bleiben");
  ok(!('C' in mitTeilen.ocean) && !('X' in mitTeilen.ocean),
     "Stufe 9 und eine unbekannte Dimension fallen weg (ist: "+JSON.stringify(mitTeilen.ocean)+")");
  ok(JSON.stringify(mitTeilen.tags)==='["sport","freunde"]',
     "Stichworte: doppelte und unbekannte fallen weg (ist: "+JSON.stringify(mitTeilen.tags)+")");
  addStateEntry(2, 2, {ocean:{}, tags:[]});
  ok(!('ocean' in loadStateHistory()[1]) && !('tags' in loadStateHistory()[1]),
     "leere Teile werden gar nicht erst gespeichert");
  addStateEntry(3, 4, {ocean:{O:3, E:4}});
  var tagMit = todayStateEntry();
  ok(tagMit.ocean && Math.abs(tagMit.ocean.O - 4) < 0.001 && Math.abs(tagMit.ocean.E - 3) < 0.001,
     "der Tag mittelt jede Dimension NUR ueber die Eintraege, die sie tragen (ist: "+JSON.stringify(tagMit.ocean)+")");
  ok(JSON.stringify(tagMit.tags)==='["sport","freunde"]', "Stichworte eines Tages: die Vereinigung, in fester Reihenfolge");
  console.log("  Tag: O "+tagMit.ocean.O+", E "+tagMit.ocean.E+", Stichworte "+tagMit.tags.join(', '));

  console.log("\n=== Bandbreite: erst ab drei Tagen, Lage auf 0-100 ===");
  var tage3 = [{ocean:{E:1}}, {ocean:{E:3}}, {ocean:{E:5, O:4}}, {energy:3, valence:3}];
  var bb = tfBandbreite(tage3);
  ok(bb.E && bb.E.min===0 && bb.E.max===100 && Math.abs(bb.E.mittel-50) < 0.001,
     "drei Tage E (1/3/5) ergeben 0 bis 100, Mittel 50 (ist: "+JSON.stringify(bb.E)+")");
  ok(!bb.O, "eine Dimension mit nur EINEM Tag bekommt keine Bandbreite");
  ok(Math.abs(bb.E.q1-25) < 0.001 && Math.abs(bb.E.q3-75) < 0.001, "mittlere Haelfte 25 bis 75");

  console.log("\n=== Stichwort-Befund: genug Tage auf beiden Seiten, halber Punkt ===");
  var tageSt = [];
  for (var ti = 0; ti < 8; ti++) tageSt.push({energy: ti < 4 ? 4.5 : 3, valence:3, tags: ti < 4 ? ['sport'] : []});
  var sbf = tfStichwortBefunde(tageSt);
  ok(sbf.length===1 && sbf[0].tag==='sport' && sbf[0].groesse==='energy' && sbf[0].mit > sbf[0].ohne,
     "Sport an 4 von 8 Tagen mit +1,5 Energie wird gefunden (ist: "+JSON.stringify(sbf)+")");
  var zuWenig = tageSt.slice(2);   // nur noch 2 Tage mit Sport
  ok(tfStichwortBefunde(zuWenig).length===0, "mit nur zwei Tagen MIT dem Stichwort: kein Befund");
  var flach = tageSt.map(function(t){ return {energy:3.2, valence:3, tags:t.tags}; });
  ok(tfStichwortBefunde(flach).length===0, "ohne halben Punkt Unterschied: kein Befund");

  console.log("\n=== Kalender: Montag vorn, jeder Tag des Monats ===");
  var zellen = tfKalenderZellen(0, {});
  var anf = tfMonatsAnfang(0);
  var vorlauf = (anf.getDay() + 6) % 7;
  ok(zellen.slice(0, vorlauf).every(function(z){ return z === null; }) && zellen[vorlauf] && zellen[vorlauf].nr===1,
     "der Erste steht unter seinem Wochentag (Vorlauf "+vorlauf+")");
  ok(zellen.length - vorlauf === new Date(anf.getFullYear(), anf.getMonth()+1, 0).getDate(),
     "so viele Tage wie der Monat hat");
  ok(tfText('tf_bandbreite_noch', {n:2, min:3}).indexOf('{') < 0, "Platzhalter werden ersetzt");

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

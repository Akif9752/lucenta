  var fails=0, checks=0;
  function ok(c,m){ checks++; if(!c){ fails++; console.log("  FAIL: "+m); } }

  // Diese Reihe prueft die Zahlen, an denen die Abo-Entscheidung haengt. Sie ist bewusst
  // misstrauisch gegen sich selbst: Jede der Kennzahlen ist eine Division oder eine Differenz
  // ueber Kalendertage, und genau dort sitzen die Fehler, die man im fertigen Diagramm nicht
  // mehr sieht — ein Tag zu viel, eine Spanne, die am falschen Ende endet.

  // Ein Tagesschluessel vor n Tagen, gebildet wie todayKey() aus den ORTSZEIT-Anteilen. Ueber
  // setDate() und nicht ueber Millisekunden-Arithmetik: An Zeitumstellungen hat ein Tag nicht
  // 24 Stunden, und ein Abzug von n*86400000 landet dann auf dem falschen Datum.
  function tagVor(n){
    var d = new Date(); d.setDate(d.getDate() - n);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function tsVor(n){ var d = new Date(); d.setDate(d.getDate() - n); return d.getTime(); }
  function setzeNutzung(startVor, tageVor){
    localStorage.setItem('lucenta_nutzung', JSON.stringify({
      start: tagVor(startVor), tage: tageVor.map(tagVor)
    }));
  }

  console.log("\n=== Ohne jede Nutzung stehen dort Nullen und kein Urteil ===");
  __store = {};
  var k = nutzungKennzahlen();
  ok(k.seitStart===0, "kein erster Start, keine Tage seit dem ersten Start (ist: "+k.seitStart+")");
  ok(k.tageGeoeffnet===0, "keine geoeffneten Tage");
  ok(k.durchlaeufe===0, "keine Durchlaeufe");
  ok(k.tageBisZweiter===null, "ohne zweiten Durchlauf gibt es keinen Abstand, nicht 0");
  ok(k.d30===null, "ohne Daten ist D30 unbeantwortet, nicht 'nein'");
  ok(k.tagesformProWoche===0, "ohne Tagesform keine Quote");

  console.log("\n=== Der erste Start vermerkt genau einen Tag, auch bei mehrmaligem Oeffnen ===");
  __store = {};
  nutzungTagVermerken(); nutzungTagVermerken(); nutzungTagVermerken();
  var n = nutzungLesen();
  ok(n.tage.length===1, "dreimal geoeffnet ist ein Tag, nicht drei (ist: "+n.tage.length+")");
  ok(n.start===n.tage[0], "der erste Tag ist zugleich der Startpunkt");
  ok(nutzungKennzahlen().seitStart===1, "der erste Tag zaehlt als Tag 1, nicht als Tag 0");

  console.log("\n=== D30: die Frage, die den Abo-Plan traegt ===");
  // Der Fehler, gegen den diese drei Pruefungen stehen: "noch nicht messbar" als 0 oder als
  // "nein" zu verbuchen. Beides macht aus einer offenen Frage eine schlechte Antwort und
  // zieht die Entscheidung in die falsche Richtung.
  __store = {}; setzeNutzung(20, [20, 15, 3, 0]);
  ok(nutzungKennzahlen().d30===null, "am Tag 21 ist die Frage noch nicht gestellt");
  __store = {}; setzeNutzung(40, [40, 39, 38, 20]);
  ok(nutzungKennzahlen().d30===false, "vierzig Tage alt, letzter Besuch an Tag 21: nicht wiedergekommen");
  __store = {}; setzeNutzung(40, [40, 39, 5]);
  ok(nutzungKennzahlen().d30===true, "ein Besuch an Tag 36 beantwortet sie mit ja");
  __store = {}; setzeNutzung(31, [31, 1]);
  ok(nutzungKennzahlen().d30===true, "die Grenze liegt bei Tag 30, gezaehlt ab dem ersten Tag");

  console.log("\n=== Die letzten 30 Tage sind ein Fenster, kein Gesamtzaehler ===");
  __store = {}; setzeNutzung(100, [100, 99, 98, 40, 29, 10, 0]);
  var f = nutzungKennzahlen();
  ok(f.tageGeoeffnet===7, "alle sieben Tage bleiben gezaehlt (ist: "+f.tageGeoeffnet+")");
  ok(f.letzte30===3, "im Fenster liegen genau drei davon (ist: "+f.letzte30+")");
  ok(f.seitStart===101, "hundert Tage Abstand sind hunderteins Tage Dabeisein (ist: "+f.seitStart+")");

  console.log("\n=== Der Abstand bis zum zweiten Durchlauf ===");
  __store = {};
  localStorage.setItem('lucenta_history', JSON.stringify([
    {scores:{O:50,E:50,C:50,A:50,S:50}, date: tsVor(30)},
    {scores:{O:52,E:50,C:50,A:50,S:50}, date: tsVor(9)},
    {scores:{O:54,E:50,C:50,A:50,S:50}, date: tsVor(1)}
  ]));
  var h = nutzungKennzahlen();
  ok(h.durchlaeufe===3, "drei Durchlaeufe");
  ok(h.tageBisZweiter===21, "der Abstand ist der zum ZWEITEN, nicht der zum letzten (ist: "+h.tageBisZweiter+")");

  console.log("\n=== Tagesform pro Woche misst bis HEUTE, nicht bis zum letzten Eintrag ===");
  // Die wichtigste Pruefung dieser Reihe. Rechnet die Spanne nur bis zum letzten Eintrag, zeigt
  // ausgerechnet jemand, der vor zwei Monaten aufgehoert hat, eine makellose Quote — der Abbruch
  // faellt aus der Rechnung heraus, statt in ihr zu stehen. Genau die Person aber ist der Grund,
  // warum die Zahl ueberhaupt erhoben wird.
  __store = {};
  var eintraege = [];
  for (var i=0;i<7;i++) eintraege.push({day:tagVor(69-i), ts:tsVor(69-i), energy:3, valence:3, slot:'mittag'});
  localStorage.setItem('lucenta_state', JSON.stringify(eintraege));
  var t = nutzungKennzahlen();
  ok(t.tagesformTage===7, "sieben Tage mit Eintrag (ist: "+t.tagesformTage+")");
  ok(Math.abs(t.tagesformProWoche - 0.7) < 0.01,
     "sieben Tage auf siebzig Tage Spanne sind 0,7 pro Woche, nicht 7 (ist: "+t.tagesformProWoche.toFixed(2)+")");

  console.log("\n=== Mehrere Eintraege an einem Tag sind ein Tag ===");
  __store = {};
  localStorage.setItem('lucenta_state', JSON.stringify([
    {day:tagVor(1), ts:tsVor(1), energy:2, valence:2, slot:'morgen'},
    {day:tagVor(1), ts:tsVor(1), energy:4, valence:4, slot:'abend'},
    {day:tagVor(0), ts:tsVor(0), energy:3, valence:3, slot:'mittag'}
  ]));
  var m = nutzungKennzahlen();
  ok(m.tagesformEintraege===3, "drei Eintraege");
  ok(m.tagesformTage===2, "an zwei Tagen (ist: "+m.tagesformTage+")");

  console.log("\n=== Das Kuerzen wirft Tage weg, aber niemals den Startpunkt ===");
  // Der Startpunkt steht getrennt von der Liste. Stuende er als deren erster Eintrag, haette das
  // Kuerzen nach 120 Tagen ausgerechnet den Bezugspunkt geloescht, an dem seitStart und D30
  // haengen — und beide waeren danach stillschweigend falsch geworden.
  __store = {};
  var viele = [];
  for (var j=200;j>=0;j--) viele.push(tagVor(j));
  localStorage.setItem('lucenta_nutzung', JSON.stringify({start: tagVor(200), tage: viele}));
  nutzungTagVermerken();
  var g = nutzungLesen();
  ok(g.tage.length===120, "die Liste ist auf 120 Tage gekuerzt (ist: "+g.tage.length+")");
  ok(g.start===tagVor(200), "der Startpunkt hat das Kuerzen ueberlebt");
  ok(nutzungKennzahlen().seitStart===201, "und seitStart rechnet weiter ab dem echten ersten Tag (ist: "+nutzungKennzahlen().seitStart+")");

  console.log("\n=== Beschaedigter Bestand ergibt Nullen, keinen Absturz ===");
  __store = {};
  localStorage.setItem('lucenta_nutzung', '{kein json');
  ok(nutzungLesen().tage.length===0, "unlesbarer Inhalt");
  localStorage.setItem('lucenta_nutzung', JSON.stringify({start:'gestern', tage:['heute', '2026-13-99', tagVor(2)]}));
  var b = nutzungLesen();
  ok(b.tage.length===1, "nur echte Tagesschluessel bleiben stehen (ist: "+b.tage.length+")");
  ok(b.start===tagVor(2), "ein unbrauchbarer Startpunkt wird durch den ersten echten Tag ersetzt");

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

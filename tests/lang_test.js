  var fails=0, checks=0;
  function ok(c,m){ checks++; if(!c){ fails++; console.log("  FAIL: "+m); } }
  function res(a,b,c,d,e){ return {O:a,C:b,E:c,A:d,S:e}; }

  console.log("\n=== Ausgangslage ===");
  ok(LANG==='de', "ohne Vorgabe startet die App auf Deutsch");
  ok(ITEMS.length===50, "50 Fragen aufgebaut");
  var deFirst = ITEMS[0].text;
  console.log("  Sprache: "+LANG+" | erste Frage: "+deFirst);

  console.log("\n=== Wechsel auf Englisch ===");
  setLang('en');
  ok(LANG==='en', "Sprache ist gewechselt");
  ok(__store['lucenta_lang']==='en', "Wahl ist gemerkt");
  ok(ITEMS.length===50, "immer noch 50 Fragen");
  ok(ITEMS[0].text!==deFirst, "die Fragen sind neu aufgebaut");
  ok(/^[\x00-\x7F]+$/.test(ITEMS[0].text), "die erste Frage ist englisch: "+ITEMS[0].text);
  ok(LABELS.E==='Extraversion' && LABELS.C==='Conscientiousness', "Beschriftungen englisch");
  console.log("  erste Frage: "+ITEMS[0].text);

  console.log("\n=== Die Messung selbst bleibt identisch ===");
  var polDE=[], polEN=[];
  for (var f of ['E','A','C','S','O']) polEN.push(CONTENT.en.FACTORS[f].map(function(x){return x.k;}).join(''));
  for (var f2 of ['E','A','C','S','O']) polDE.push(CONTENT.de.FACTORS[f2].map(function(x){return x.k;}).join(''));
  ok(polDE.join('|')===polEN.join('|'), "Polung aller 50 Items in beiden Sprachen gleich");
  // Dieselben Antworten muessen in beiden Sprachen dieselben Werte ergeben
  var answers_ = []; for (var i=0;i<50;i++) answers_.push((i%5)+1);
  answers = answers_.slice(); var enScores = computeScores();
  setLang('de');
  answers = answers_.slice(); var deScores = computeScores();
  ok(JSON.stringify(enScores)===JSON.stringify(deScores),
     "identische Antworten ergeben identische Werte (EN "+JSON.stringify(enScores)+" / DE "+JSON.stringify(deScores)+")");
  console.log("  Werte in beiden Sprachen: "+JSON.stringify(deScores));

  console.log("\n=== Ein Ergebnis bleibt ueber den Sprachwechsel gueltig ===");
  __store = {};
  scores = res(72,58,64,41,55); saveResult(scores);
  var codeDE = toCode(scores);
  setLang('en');
  var wieder = loadResult();
  ok(wieder!==null && toCode(wieder)===codeDE, "gespeichertes Ergebnis unveraendert");
  var archDE, archEN;
  setLang('de'); archDE = archetypeOf(scores);
  setLang('en'); archEN = archetypeOf(scores);
  ok(archDE.top1===archEN.top1 && archDE.top2===archEN.top2,
     "derselbe Archetyp wird bestimmt, nur anders benannt");
  console.log("  Titel DE: "+NOUN_of('de',archDE)+" | EN: "+NOUN_of('en',archEN));
  function NOUN_of(l,a){ return CONTENT[l].NOUN[a.top1][scores[a.top1]>=50?'high':'low']; }

  console.log("\n=== Rueckwechsel und unbekannte Sprache ===");
  setLang('de');
  ok(LANG==='de', "Rueckwechsel funktioniert");
  // Runde 78: Hier stand 'fr' als Beispiel fuer eine nicht vorhandene Sprache. Mit dem
  // franzoesischen Paket wurde daraus ein gueltiger Wechsel, und die Reihe schlug fehl —
  // korrekt, aber aus dem falschen Grund. 'xx' ist kein Sprachkuerzel und wird auch keines.
  setLang('xx');
  ok(LANG==='de', "eine nicht vorhandene Sprache wird ignoriert statt die App zu leeren");
  setLang('de');
  ok(LANG==='de', "ein Wechsel auf die bereits aktive Sprache ist wirkungslos");

  console.log("\n=== Alle Pakete sind strukturgleich ===");
  // Runde 78: Geprueft wurde Deutsch gegen Englisch. Bei sieben Sprachen muss jede einzelne
  // gegen die Rueckfallsprache stehen — sonst faellt ein Paket mit fehlendem Block erst im
  // Browser auf, und dort als leere Stelle statt als Fehler.
  var SPRACHEN = Object.keys(CONTENT).filter(function(c){ return c !== 'de'; }).sort();
  ok(SPRACHEN.length === 6, "sechs Sprachen neben Deutsch: "+SPRACHEN.join(', '));
  var kd = Object.keys(CONTENT.de).sort().join(',');
  SPRACHEN.forEach(function(c){
    var pack = CONTENT[c];
    ok(Object.keys(pack).sort().join(',') === kd, c+": dieselben Bloecke");
    ok(Object.keys(pack.UI).length === Object.keys(CONTENT.de.UI).length,
       c+": gleich viele Oberflaechen-Texte ("+Object.keys(pack.UI).length+")");
    var fehlend = Object.keys(CONTENT.de.UI).filter(function(k){ return !(k in pack.UI); });
    ok(fehlend.length === 0, c+": kein Oberflaechen-Text ohne Fassung: "+fehlend.slice(0,3).join(', '));
    ok(pack.QUIZ_HINTS.length === CONTENT.de.QUIZ_HINTS.length, c+": gleich viele Quiz-Hinweise");
    // Sechs Gesamteinschaetzungen, eine je Zahl uebereinstimmender Dimensionen (0 bis 5). Fehlte
    // eine, stuende bei genau dieser Verteilung gar nichts — schlimmer als der eine Satz fuer
    // alle, den sie ersetzen.
    ok(pack.CMP_GESAMT && pack.CMP_GESAMT.length === 6, c+": CMP_GESAMT hat sechs Lagen");
    ok((pack.CMP_GESAMT||[]).every(function(t){ return typeof t === 'string' && t.length > 20; }),
       c+": jede Lage in CMP_GESAMT traegt einen Satz");
    ['E','A','C','S','O'].forEach(function(f){
      ok(pack.PROFILES[f].high.alltag && pack.PROFILES[f].low.wachstum, c+": PROFILES."+f+" vollstaendig");
      ok(pack.COMPAT[f].similar && pack.COMPAT[f].diff, c+": COMPAT."+f+" vollstaendig");
      // Runde 81: Der Vergleich hat je Dimension und Lage drei Lebensbereiche. Sechs Texte je
      // Dimension, in sieben Sprachen — ohne diese Pruefung faellt ein fehlender erst dann auf,
      // wenn jemand in genau dieser Sprache genau diese Dimension aufklappt.
      ['similar','diff'].forEach(function(lage){
        var fe = (pack.COMPAT[f].felder||{})[lage]||{};
        ok(fe.alltag && fe.gespraech && fe.gemeinsam,
           c+": COMPAT."+f+".felder."+lage+" hat alle drei Lebensbereiche");
      });
      ok(pack.UNDERSTAND[f].high.length===2 && pack.UNDERSTAND[f].low.length===2, c+": UNDERSTAND."+f+" vollstaendig");
      ok(pack.FACTORS[f].length === 10, c+": FACTORS."+f+" hat 10 Items");
      // Der entscheidende Punkt: Die MESSUNG darf sich durch eine Uebersetzung nicht aendern.
      ok(pack.FACTORS[f].map(function(x){return x.k;}).join('') ===
         CONTENT.de.FACTORS[f].map(function(x){return x.k;}).join(''),
         c+": Polung von FACTORS."+f+" identisch zur Rueckfallsprache");
    });
  });

  console.log("\n=== Dieselben Antworten ergeben in JEDER Sprache dasselbe Ergebnis ===");
  var probe = []; for (var pi=0; pi<50; pi++) probe.push((pi%5)+1);
  setLang('de'); answers = probe.slice();
  var referenz = JSON.stringify(computeScores());
  SPRACHEN.forEach(function(c){
    setLang(c); answers = probe.slice();
    ok(JSON.stringify(computeScores()) === referenz, c+": dieselben Werte wie auf Deutsch");
  });
  setLang('de');
  console.log("  Werte in allen sieben Sprachen: "+referenz);

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

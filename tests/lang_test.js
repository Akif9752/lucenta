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
  setLang('fr');
  ok(LANG==='de', "eine nicht vorhandene Sprache wird ignoriert statt die App zu leeren");
  setLang('de');
  ok(LANG==='de', "ein Wechsel auf die bereits aktive Sprache ist wirkungslos");

  console.log("\n=== Beide Pakete sind strukturgleich ===");
  var kd=Object.keys(CONTENT.de).sort().join(','), ke=Object.keys(CONTENT.en).sort().join(',');
  ok(kd===ke, "dieselben Bloecke");
  ok(Object.keys(CONTENT.de.UI).length===Object.keys(CONTENT.en.UI).length,
     "gleich viele Oberflaechen-Texte ("+Object.keys(CONTENT.de.UI).length+"/"+Object.keys(CONTENT.en.UI).length+")");
  var fehlend=Object.keys(CONTENT.de.UI).filter(function(k){ return !(k in CONTENT.en.UI); });
  ok(fehlend.length===0, "kein Oberflaechen-Text ohne englische Fassung: "+fehlend.join(', '));
  for (var f3 of ['E','A','C','S','O']){
    ok(CONTENT.en.PROFILES[f3].high.alltag && CONTENT.en.PROFILES[f3].low.wachstum, "PROFILES."+f3+" vollstaendig");
    ok(CONTENT.en.COMPAT[f3].similar && CONTENT.en.COMPAT[f3].diff, "COMPAT."+f3+" vollstaendig");
    ok(CONTENT.en.UNDERSTAND[f3].high.length===2 && CONTENT.en.UNDERSTAND[f3].low.length===2, "UNDERSTAND."+f3+" vollstaendig");
  }

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

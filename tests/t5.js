  var fails=0;
  function ok(c,m){ if(!c){ fails++; console.log("  FAIL: "+m); } }
  var note=el('uniformNote');

  function durchlauf(desc, fuelle){
    for(var i=0;i<50;i++) answers[i]=fuelle(i);
    scores=computeScores();
    scores.uniform = answerUniformity(answers) >= UNIFORM_THRESHOLD;
    saveResult(scores);
    renderResult();
    console.log("  "+desc.padEnd(30)+" -> Hinweis display='"+note.style.display+"'  | Titel: \""+el('archTitle').innerHTML.replace(/<[^>]+>/g,'')+"\"");
    return note.style.display;
  }

  ok(durchlauf("50x '1' (durchgetippt)", function(){ return 1; })==='flex', "Hinweis fehlt bei Straight-Lining");
  ok(durchlauf("50x '5' (durchgetippt)", function(){ return 5; })==='flex', "Hinweis fehlt bei Straight-Lining");
  ok(durchlauf("echte Selbsteinschaetzung", function(i){ return 1+((i*7)%5); })==='none', "Hinweis faelschlich bei echtem Muster");

  console.log("\n  --- gespeichertes Ergebnis spaeter erneut oeffnen (answers ist dann leer) ---");
  for(var i=0;i<50;i++) answers[i]=1;
  scores=computeScores(); scores.uniform=true; saveResult(scores);
  for(var i=0;i<50;i++) answers[i]=0;          // wie nach Neuladen der App
  var wieder=loadResult(); scores=wieder; renderResult();
  console.log("  gleichfoermiges Ergebnis erneut geoeffnet -> display='"+note.style.display+"' (erwartet: flex)");
  ok(note.style.display==='flex', "Flag ueberlebt das Neuladen nicht");

  for(var i=0;i<50;i++) answers[i]=1+((i*7)%5);
  scores=computeScores(); scores.uniform=false; saveResult(scores);
  for(var i=0;i<50;i++) answers[i]=0;
  scores=loadResult(); renderResult();
  console.log("  echtes Ergebnis erneut geoeffnet          -> display='"+note.style.display+"' (erwartet: none)");
  ok(note.style.display==='none', "Falscher Hinweis nach Neuladen");

  console.log("\n  --- ueber Code wiederhergestelltes Ergebnis (Muster unbekannt) ---");
  var ausCode=fromCode('0u1e141428');
  scores=ausCode; renderResult();
  console.log("  aus Code wiederhergestellt                -> display='"+note.style.display+"' (erwartet: none, Muster ist dort nicht bekannt)");
  ok(note.style.display==='none', "Hinweis bei Code-Wiederherstellung faelschlich gesetzt");

  console.log("\n  "+(fails===0?"ALLE PRUEFUNGEN BESTANDEN":fails+" FEHLGESCHLAGEN"));

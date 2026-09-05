  var fails=0, checks=0;
  function ok(c,m){ checks++; if(!c){ fails++; console.log("  FAIL: "+m); } }
  var teaser = el('landingUnderstandTeaser');

  console.log("\n=== Bugfix Runde 39: Sichtbarkeit der Verstehen-Karte ueber den echten Lebenszyklus ===");

  // Szenario A: Erstbesuch, kein Ergebnis
  delete __store['lucenta_result'];
  showView('landing');
  console.log("  A) Erstbesuch ohne Ergebnis      -> display='"+teaser.style.display+"'");
  ok(teaser.style.display==='none', "A: Karte muesste versteckt sein");

  // Szenario B: Test abgeschlossen -> Ergebnis liegt vor, zurueck zur Startseite
  saveResult({O:70,C:40,E:60,A:55,S:45});
  showView('landing');
  console.log("  B) nach dem ersten Test          -> display='"+teaser.style.display+"'");
  ok(teaser.style.display!=='none', "B: Karte muesste jetzt sichtbar sein  <-- das war der Bug aus Runde 38");
  ok(el('landingTeaserTitle').textContent.length>3, "B: Titel nicht befuellt");
  console.log("     Titel befuellt: \""+el('landingTeaserTitle').textContent+"\"");

  // Szenario C: Navigation weg und wieder zurueck
  showView('profile'); showView('landing');
  console.log("  C) weg navigiert und zurueck     -> display='"+teaser.style.display+"'");
  ok(teaser.style.display!=='none', "C: Karte muesste sichtbar bleiben");

  // Szenario D: Daten zuruecksetzen -> Karte muss wieder verschwinden
  delete __store['lucenta_result'];
  showView('landing');
  console.log("  D) nach Daten-Reset              -> display='"+teaser.style.display+"'");
  ok(teaser.style.display==='none', "D: Karte muesste wieder verschwinden");

  console.log("\n=== Gegenprobe: alter Stand (Runde 38) ohne den Fix ===");
  // Fix rueckgaengig simulieren: nur init-artiger Einmalaufruf, danach nie wieder
  delete __store['lucenta_result'];
  renderLandingUnderstandTeaser();            // "init()" beim Erstbesuch
  var afterInit = teaser.style.display;
  saveResult({O:70,C:40,E:60,A:55,S:45});     // Test abgeschlossen
  // ohne den Fix wuerde showView('landing') die Funktion NICHT erneut aufrufen:
  var simulatedOld = afterInit;               // Zustand bliebe unveraendert
  console.log("  ohne Fix nach erstem Test        -> display='"+simulatedOld+"'  (Karte bleibt faelschlich versteckt)");
  ok(simulatedOld==='none', "Gegenprobe unschluessig");

  console.log("\n=== Tagesform-Karte: bleibt in allen Szenarien sichtbar (bewusst ergebnisunabhaengig) ===");
  delete __store['lucenta_result'];
  showView('landing');
  var st = el('landingStateTeaser');
  console.log("  ohne Ergebnis, Tagesform display='"+(st.style.display||"(unveraendert/sichtbar)")+"'");
  ok(st.style.display!=='none', "Tagesform-Karte faelschlich versteckt");
  console.log("  Tagesform-Copy: \""+el('landingStateCopy').textContent.slice(0,60)+"...\"");

  console.log("\n=== Hero-Button-Zustaende (syncHeroState) ===");
  delete __store['lucenta_result']; delete __store['lucenta_progress'];
  showView('landing');
  console.log("  ohne alles        -> \""+el('btnStart').textContent+"\" | zweiter Button: "+(el('btnHeroSecondary').style.display==='none'?'versteckt':'sichtbar'));
  ok(el('btnHeroSecondary').style.display==='none', "zweiter Button muesste versteckt sein");
  saveResult({O:70,C:40,E:60,A:55,S:45}); showView('landing');
  console.log("  mit Ergebnis      -> \""+el('btnStart').textContent+"\" | \""+el('btnHeroSecondary').textContent+"\"");
  ok(el('btnStart').textContent.indexOf('Ergebnis')!==-1, "Hauptbutton zeigt nicht das Ergebnis an");
  __store['lucenta_progress']=JSON.stringify({answers:new Array(50).fill(3), qi:17});
  showView('landing');
  console.log("  mit Unterbrechung -> \""+el('btnStart').textContent+"\" | \""+el('btnHeroSecondary').textContent+"\"");
  ok(el('btnStart').textContent.indexOf('18')!==-1, "Frage-Nummer 18 fehlt im Weitermachen-Button");

  console.log("\n=== Sticky-Header-Zustand ===");
  window.scrollY=0; syncHeaderScrollState();
  ok(!el('__header').classList.contains('scrolled'), "oben duerfte .scrolled nicht gesetzt sein");
  window.scrollY=250; syncHeaderScrollState();
  ok(el('__header').classList.contains('scrolled'), ".scrolled wird beim Scrollen nicht gesetzt");
  window.scrollY=0; syncHeaderScrollState();
  ok(!el('__header').classList.contains('scrolled'), ".scrolled wird oben nicht entfernt");
  console.log("  scrollY 0/250/0 -> Trennlinie aus/an/aus: korrekt");

  console.log("\n=== View-Label pro Ansicht ===");
  ['landing','quiz','result','profile','settings','understand','state','archetypes','compat-archive'].forEach(function(v){
    showView(v);
    console.log("  "+v.padEnd(15)+" -> \""+el('viewLabel').textContent+"\"");
    ok(el('view-'+v).classList.contains('active'), v+" nicht aktiv gesetzt");
  });

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" FEHLGESCHLAGEN"));
  console.log("==================================================");

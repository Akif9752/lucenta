  var fails=0, checks=0;
  function ok(c,m){ checks++; if(!c){ fails++; console.log("  FAIL: "+m); } }

  console.log("\n=== Fragewechsel: die neue Frage kommt herein ===");
  __store = {};
  answers = new Array(50).fill(0); qi = 0;
  renderQuestion();
  ok(!$('qCard').classList.contains('q-in'), "beim ersten Aufbau laeuft noch nichts");

  animateQuestionIn();
  ok($('qCard').classList.contains('q-in'), "animateQuestionIn setzt die Klasse");
  // Erneuter Aufruf muss die Klasse neu setzen, sonst liefe die Bewegung nur einmal
  animateQuestionIn();
  ok($('qCard').classList.contains('q-in'), "auch beim zweiten Mal gesetzt (Neustart der Bewegung)");
  console.log("  Klasse wird gesetzt und laesst sich neu ausloesen");

  console.log("\n=== Automatisches Weiterschalten loest die Bewegung aus ===");
  var pending = null;
  var realTimeout = global.setTimeout;
  global.setTimeout = function(fn){ pending = fn; return 1; };
  $('view-quiz').classList.add('active');
  $('qCard').classList.remove('q-in');
  qi = 0;
  selectAnswer(4);
  ok(answers[0]===4, "die Antwort ist gesetzt");
  ok(qi===0, "vor Ablauf der Wartezeit bleibt die Frage stehen");
  ok(!$('qCard').classList.contains('q-in'), "und die Bewegung laeuft noch nicht — die Antwort soll erst sichtbar werden");
  ok(typeof pending==='function', "ein Uebergang ist vorgemerkt");
  pending();
  ok(qi===1, "danach steht die naechste Frage");
  ok($('qCard').classList.contains('q-in'), "und sie kommt herein");
  console.log("  Antwort sichtbar -> Wartezeit -> naechste Frage bewegt sich herein");

  console.log("\n=== Zuruecklaettern bewegt sich ebenfalls ===");
  $('qCard').classList.remove('q-in');
  qi = 3; renderQuestion(); animateQuestionIn();
  ok($('qCard').classList.contains('q-in'), "auch beim Zurueckblaettern");

  global.setTimeout = realTimeout;
  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

  function strip(h){ return h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim(); }
  var fails=0;
  function ok(c,m){ if(!c){fails++;console.log('  FEHLER: '+m);} }

  console.log("\n=== Verlauf nach GENAU EINEM Testdurchlauf ===");
  delete __store['lucenta_history'];
  appendHistory({O:73,E:35,C:60,A:63,S:30});
  renderHistory();
  var h=el('historyContent').innerHTML;
  console.log('  '+strip(h).slice(0,200));
  ok(h.indexOf('history-row')!==-1,'eigener Durchlauf wird nicht gezeigt');
  ok(strip(h).indexOf('Visionär')!==-1 || strip(h).indexOf('·')!==-1,'kein Archetyp-Titel');

  console.log("\n=== Verlauf nach zwei Durchläufen (Kurve) ===");
  appendHistory({O:70,E:38,C:57,A:60,S:34});
  renderHistory();
  var h2=el('historyContent').innerHTML;
  console.log('  Trendkurve vorhanden: '+(h2.indexOf('trend-list')!==-1));
  ok(h2.indexOf('trend-list')!==-1,'Trend fehlt bei zwei Einträgen');

  console.log("\n=== Tagesform nach GENAU EINEM Eintrag ===");
  delete __store['lucenta_state'];
  upsertStateToday(4,3);
  renderStateTrend();
  var s=el('stateTrendContent').innerHTML;
  console.log('  '+strip(s).slice(0,160));
  ok(s.indexOf('history-row')!==-1,'erfasster Tag wird nicht gezeigt');
  ok(strip(s).indexOf('Energie 4/5')!==-1,'Werte fehlen');

  console.log("\n=== Leerzustand bleibt, wenn wirklich nichts da ist ===");
  delete __store['lucenta_history']; renderHistory();
  var h0=strip(el('historyContent').innerHTML);
  console.log('  '+h0.slice(0,90));
  ok(h0.indexOf('Noch kein Testdurchlauf')!==-1,'echter Leerzustand fehlt');

  console.log('\n  '+(fails===0?'ALLE PRÜFUNGEN BESTANDEN':fails+' FEHLGESCHLAGEN'));

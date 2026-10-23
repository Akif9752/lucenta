  var fails=0, checks=0;
  function ok(cond,msg){ checks++; if(!cond){ fails++; console.log("  FAIL: "+msg); } }

  console.log("\n[1] toCode/fromCode roundtrip, alle Werte 0..100 in allen 5 Dimensionen");
  for (var v=0; v<=100; v++){
    var sc={}; ORDER.forEach(function(f){ sc[f]=v; });
    var back=fromCode(toCode(sc));
    ok(back!==null, "fromCode(toCode) null bei v="+v);
    if(back) ORDER.forEach(function(f){ ok(back[f]===v, "roundtrip "+f+" "+v+" -> "+back[f]); });
  }
  // gemischte Werte
  for (var t=0;t<500;t++){
    var sc2={}; ORDER.forEach(function(f){ sc2[f]=Math.floor(Math.random()*101); });
    var b2=fromCode(toCode(sc2));
    ok(b2 && ORDER.every(function(f){ return b2[f]===sc2[f]; }), "mixed roundtrip fail "+JSON.stringify(sc2));
  }
  console.log("  code laenge immer 10? " + (function(){ for(var v=0;v<=100;v++){ var s={}; ORDER.forEach(function(f){s[f]=v;}); if(toCode(s).length!==10) return "NEIN bei "+v; } return "ja"; })());

  console.log("\n[2] fromCode weist Muell zurueck");
  ["", "abc", "12345678901", "!!!!!!!!!!", "zzzzzzzzzz", null, undefined].forEach(function(bad){
    var r=fromCode(bad);
    ok(r===null || (r && ORDER.every(function(f){ return r[f]>=0 && r[f]<=100; })), "fromCode("+bad+") lieferte "+JSON.stringify(r));
  });

  console.log("\n[3] computeScores: Wertebereich 0..100 bei extremen Antwortmustern");
  function setAll(v){ for(var i=0;i<50;i++) answers[i]=v; }
  [1,2,3,4,5].forEach(function(v){
    setAll(v); var s=computeScores();
    ORDER.forEach(function(f){ ok(s[f]>=0&&s[f]<=100, "alle="+v+" -> "+f+"="+s[f]+" ausserhalb 0..100"); });
    console.log("  alle Antworten="+v+" -> "+ORDER.map(function(f){return f+":"+s[f];}).join(" "));
  });
  for(var r=0;r<300;r++){
    for(var i=0;i<50;i++) answers[i]=1+Math.floor(Math.random()*5);
    var s3=computeScores();
    ORDER.forEach(function(f){ ok(s3[f]>=0&&s3[f]<=100 && !isNaN(s3[f]), "random -> "+f+"="+s3[f]); });
  }
  // unbeantwortet (0) muss als neutral 3 behandelt werden, nicht NaN
  setAll(0); var sNeutral=computeScores();
  console.log("  alle unbeantwortet(0) -> "+ORDER.map(function(f){return f+":"+sNeutral[f];}).join(" "));
  ORDER.forEach(function(f){ ok(sNeutral[f]===50, "unbeantwortet sollte 50 ergeben, ist "+sNeutral[f]); });

  console.log("\n[4] archetypeOf: nie Absturz, immer gueltige Dimensionen, top1!=top2");
  for(var a=0;a<800;a++){
    var sc3={}; ORDER.forEach(function(f){ sc3[f]=Math.floor(Math.random()*101); });
    var arch=archetypeOf(sc3);
    ok(ORDER.indexOf(arch.top1)!==-1 && ORDER.indexOf(arch.top2)!==-1, "ungueltige Dimension "+JSON.stringify(arch));
    ok(arch.top1!==arch.top2, "top1===top2 bei "+JSON.stringify(sc3));
    ok(typeof arch.title==='string' && arch.title.indexOf('undefined')===-1, "Titel kaputt: "+arch.title);
  }
  // Grenzfall: alle exakt 50
  var flat={}; ORDER.forEach(function(f){ flat[f]=50; });
  var af=archetypeOf(flat);
  console.log("  alle=50 -> Titel: "+af.title+" (top1="+af.top1+", top2="+af.top2+")");
  ok(af.top1!==af.top2, "alle=50: top1===top2");

  console.log("\n[5] Persistenz: loadResult weist ungueltige Daten zurueck");
  var badResults=['null','"x"','{}','{"O":1}','{"O":-5,"C":1,"E":1,"A":1,"S":1}','{"O":101,"C":1,"E":1,"A":1,"S":1}','{"O":"a","C":1,"E":1,"A":1,"S":1}','nicht-json'];
  badResults.forEach(function(b){ __store['lucenta_result']=b; ok(loadResult()===null, "loadResult akzeptierte Muell: "+b); });
  var good={O:10,C:20,E:30,A:40,S:50}; saveResult(good);
  var lr=loadResult(); ok(lr&&lr.O===10&&lr.S===50, "gueltiges Ergebnis nicht korrekt geladen: "+JSON.stringify(lr));
  console.log("  gueltiges Ergebnis geladen: "+JSON.stringify(lr));

  console.log("\n[6] Verlauf: MAX_HISTORY-Deckel greift");
  __store['lucenta_history']=undefined; delete __store['lucenta_history'];
  for(var h=0;h<MAX_HISTORY+7;h++){ appendHistory({O:h,C:1,E:1,A:1,S:1}); }
  var hist=loadHistory();
  ok(hist.length===MAX_HISTORY, "Verlauf sollte auf "+MAX_HISTORY+" gedeckelt sein, ist "+hist.length);
  ok(hist[hist.length-1].scores.O===MAX_HISTORY+6, "juengster Eintrag fehlt, O="+hist[hist.length-1].scores.O);
  console.log("  nach "+(MAX_HISTORY+7)+" Eintraegen: "+hist.length+" gespeichert, aeltester O="+hist[0].scores.O+", juengster O="+hist[hist.length-1].scores.O);
  __store['lucenta_history']='[{"kaputt":true},{"date":1,"scores":{"O":5,"C":1,"E":1,"A":1,"S":1}}]';
  ok(loadHistory().length===1, "loadHistory filtert kaputte Eintraege nicht");

  console.log("\n[7] Tagesform: je Tageszeit EIN Eintrag, hoechstens drei am Tag (Runde 129)");
  // Bis Runde 128 kam jeder weitere Eintrag dazu (Runde 82). Seit Runde 129, auf Auftrag des
  // Inhabers: morgens, mittags, abends je einer; ein zweiter im selben Abschnitt ersetzt.
  delete __store['lucenta_state'];
  addStateEntry(3,4); addStateEntry(5,2); addStateEntry(1,1);
  var sh=loadStateHistory();
  ok(sh.length===1, "drei Eintraege im selben Abschnitt sind EINER, sind "+sh.length);
  ok(sh[0].energy===1&&sh[0].valence===1, "der letzte ersetzt die frueheren: "+JSON.stringify(sh[0]));
  // Die beiden anderen Abschnitte von heute als Bestand dazulegen, dann im laufenden eintragen.
  var heuteK=todayKey(), jetztA=aktuellerAbschnitt(), andere=TF_ABSCHNITTE.filter(function(a){ return a!==jetztA; });
  __store['lucenta_state']=JSON.stringify([
    {day:heuteK, ts:Date.now()-2000, energy:3, valence:4, slot:andere[0]},
    {day:heuteK, ts:Date.now()-1000, energy:5, valence:2, slot:andere[1]}]);
  addStateEntry(1,1);
  sh=loadStateHistory();
  ok(sh.length===3, "drei Abschnitte ergeben drei Eintraege, sind "+sh.length);
  addStateEntry(1,1);
  ok(loadStateHistory().length===3, "ein vierter Eintrag am Tag ersetzt, statt dazuzukommen");
  var belegt=heuteEingetragen();
  ok(TF_ABSCHNITTE.every(function(a){ return !!belegt[a]; }), "heuteEingetragen kennt alle drei Abschnitte");
  var te=todayStateEntry();
  ok(te&&te.anzahl===3, "der Tag muss aus drei Eintraegen bestehen: "+JSON.stringify(te));
  ok(te&&Math.abs(te.energy-3)<0.001&&Math.abs(te.valence-(7/3))<0.001,
     "der Tageswert ist nicht das Mittel: "+JSON.stringify(te));
  ok(stateTage(sh).length===1, "drei Eintraege desselben Tages sind EIN Tag");
  console.log("  3 Abschnitte -> "+sh.length+" Eintraege, Tag im Mittel energy="+te.energy.toFixed(2)+", valence="+te.valence.toFixed(2));
  // Der Deckel zaehlt Eintraege. Bestand aus vergangenen Tagen, damit nichts ersetzt wird.
  var alt=[]; for(var se=0; se<MAX_STATE_EINTRAEGE+10; se++){
    var dd=new Date(2020,0,1+se,9); alt.push({day:dd.toISOString().slice(0,10)+'#'+se, ts:dd.getTime(), energy:3, valence:3, slot:'morgen'}); }
  __store['lucenta_state']=JSON.stringify(alt);
  addStateEntry(3,3);
  ok(loadStateHistory().length===MAX_STATE_EINTRAEGE,
     "Deckel greift nicht: "+loadStateHistory().length+" statt "+MAX_STATE_EINTRAEGE);
  console.log("  Deckel "+MAX_STATE_EINTRAEGE+" Eintraege eingehalten");
  __store['lucenta_state']='[{"day":"x","energy":9,"valence":1},{"day":"y","energy":3,"valence":3}]';
  ok(loadStateHistory().length===1, "loadStateHistory filtert ungueltige Werte nicht");

  console.log("\n[8] Vergleichsarchiv: Deckel + Loeschen");
  delete __store['lucenta_compat_archive'];
  for(var c=0;c<MAX_COMPAT_ARCHIVE+5;c++){ appendCompatArchiveEntry({id:'id'+c, ts:c, myCode:'a', otherCode:'b', match:50}); }
  ok(loadCompatArchive().length===MAX_COMPAT_ARCHIVE, "Archiv-Deckel greift nicht: "+loadCompatArchive().length);
  var before=loadCompatArchive().length; removeCompatArchiveEntry(loadCompatArchive()[0].id);
  ok(loadCompatArchive().length===before-1, "Loeschen wirkt nicht");
  console.log("  Deckel "+MAX_COMPAT_ARCHIVE+" eingehalten, Loeschen reduziert "+before+" -> "+loadCompatArchive().length);

  console.log("\n[9] avatarInitials Randfaelle");
  var cases=[["","?"],["  ","?"],["Akif","A"],["Akif Sensoy","AS"],["a b c d","AB"],["  Max   Mustermann  ","MM"],["ümit","Ü"]];
  cases.forEach(function(c){ var got=avatarInitials(c[0]); ok(got===c[1], "avatarInitials("+JSON.stringify(c[0])+") = "+got+", erwartet "+c[1]); });
  console.log("  geprueft: "+cases.length+" Faelle");

  console.log("\n[10] Visuals: Clamping und Degenerationsfaelle");
  [-50,0,50,100,150,NaN].forEach(function(v){
    var html=gaugeBarHTML(v);
    var m=html.match(/width:([-\d.]+)%/);
    if(!isNaN(v)) ok(m && parseFloat(m[1])>=0 && parseFloat(m[1])<=100, "gaugeBar nicht geclamped bei "+v+": "+m);
  });
  ok(sparklineSVG([],140,32).indexOf('<path')===-1, "sparkline mit 0 Werten zeichnet Pfad");
  ok(sparklineSVG([50],140,32).indexOf('<path')===-1, "sparkline mit 1 Wert zeichnet Pfad");
  ok(sparklineSVG([10,90],140,32).indexOf('<path')!==-1, "sparkline mit 2 Werten zeichnet keinen Pfad");
  [-10,0,50,100,140].forEach(function(p){ var s=ringGaugeSVG(p,132,'x'); ok(s.indexOf('NaN')===-1, "ringGauge NaN bei "+p); });
  console.log("  gauge/sparkline/ring: keine NaN, korrekt geclamped");

  console.log("\n[11] Radar-Geometrie: keine NaN, Punkte im Rahmen");
  for(var g=0;g<200;g++){
    var scg={}; ORDER.forEach(function(f){ scg[f]=Math.floor(Math.random()*101); });
    var pts=polyPoints(scg,160,110);
    pts.forEach(function(p){ ok(!isNaN(p[0])&&!isNaN(p[1]), "polyPoints NaN"); });
    var svg=radarSVG(scg);
    ok(svg.indexOf('NaN')===-1, "radarSVG enthaelt NaN");
    ok(svg.indexOf('undefined')===-1, "radarSVG enthaelt undefined");
  }
  var svgCmp=radarSVG({O:1,C:2,E:3,A:4,S:5},300,{scores:{O:99,C:98,E:97,A:96,S:95}});
  ok(svgCmp.indexOf('radar-axis-value-me')!==-1 && svgCmp.indexOf('radar-axis-value-other')!==-1, "Vergleichs-Radar ohne beide Wertklassen");
  console.log("  200 Zufallsprofile + Vergleichs-Radar: sauber");

  console.log("\n[12] Vollstaendigkeit der Textdaten fuer alle 10 Rollen");
  ORDER.forEach(function(f){
    ['high','low'].forEach(function(p){
      ok(NOUN[f][p]&&ADJ[f][p]&&MOTTO[f][p]&&CORE[f][p]&&FLAVOR[f][p], "Textluecke bei "+f+"/"+p);
      ok(PROFILES[f][p].teaser&&PROFILES[f][p].alltag&&PROFILES[f][p].beziehungen&&PROFILES[f][p].wachstum, "PROFILES-Luecke bei "+f+"/"+p);
      ok(UNDERSTAND[f][p]&&UNDERSTAND[f][p].length>=1, "UNDERSTAND-Luecke bei "+f+"/"+p);
      UNDERSTAND[f][p].forEach(function(c){ ok(c.title&&c.body, "UNDERSTAND-Karte unvollstaendig "+f+"/"+p); });
      ok(COMPAT[f].similar&&COMPAT[f].diff, "COMPAT-Luecke bei "+f);
    });
  });
  ok(ITEMS.length===50, "ITEMS sollte 50 sein, ist "+ITEMS.length);
  var perFactor={}; ITEMS.forEach(function(it){ perFactor[it.factor]=(perFactor[it.factor]||0)+1; });
  console.log("  ITEMS pro Dimension: "+JSON.stringify(perFactor));
  ORDER.forEach(function(f){ ok(perFactor[f]===10, f+" hat "+perFactor[f]+" Items statt 10"); });
  var texts=ITEMS.map(function(it){ return it.text; });
  ok(new Set(texts).size===50, "doppelte Aussagen im Fragebogen: "+(50-new Set(texts).size));

  console.log("\n[13] pickRandomUnderstandCard liefert immer eine gueltige Karte");
  for(var pk=0;pk<300;pk++){ var card=pickRandomUnderstandCard(); ok(card&&card.title&&card.body,"ungueltige Karte"); }

  console.log("\n[14] Kurzer Freundescode <id>-XXXX-XXXX: hin und zurueck, Tippfehler, alte Codes");
  var rnd=function(){ return Math.floor(Math.random()*101); }, fehlerErkannt=0, fehlerVersuche=0;
  for(var kc=0;kc<3000;kc++){
    var sc={O:rnd(),C:rnd(),E:rnd(),A:rnd(),S:rnd()}, fig=(kc%(FIGUREN.length+1))===0 ? '' : FIGUREN[kc%FIGUREN.length].id;
    var teil=kurzcodeTeil(sc, fig), code='mia.k_'+(kc%7)+'-'+teil, info=freundescodeLesen('Hier: '+code+' – bis bald');
    ok(/^[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/.test(teil), "Kurzteil hat falsches Format: "+teil);
    ok(info && info.code===toCode(sc) && info.figur===fig && info.name==='mia.k_'+(kc%7), "Kurzcode nicht umkehrbar: "+code);
    ok(freundescodeLesen(code.toLowerCase()) && freundescodeLesen(code.toLowerCase()).code===toCode(sc), "Kleinschreibung nicht gelesen: "+code);
    // ein Zeichen vertippt
    var vorne=code.indexOf('-')+1, pos=vorne+Math.floor(Math.random()*9); if(code.charAt(pos)==='-') pos++;
    var falsch=code.slice(0,pos)+(code.charAt(pos)==='7'?'8':'7')+code.slice(pos+1), r=freundescodeLesen(falsch);
    fehlerVersuche++; if(!r || r.code!==toCode(sc)) fehlerErkannt++;
    ok(!r || r.code!==toCode(sc) || r.figur!==fig, "Tippfehler unbemerkt gleich: "+falsch);
  }
  var quote=fehlerErkannt/fehlerVersuche;
  console.log("  Tippfehler ergeben nie stillschweigend denselben Freund; abgelehnt statt falsch gelesen: "+Math.round(100*quote)+" %");
  ok(!freundescodeLesen('ab-1234-5678'), "zu kurze ID angenommen");
  ok(freundescodeLesen('L1.221r1k1y1c.fuchs.QWxleA') && freundescodeLesen('L1.221r1k1y1c.fuchs.QWxleA').name==='Alex', "alter L1-Code nicht mehr gelesen");
  ok(benutzerIdAusName('Jürgen Groß')==='jurgengross' && benutzerIdAusName('Al')==='', "ID-Vorschlag aus dem Namen falsch: "+benutzerIdAusName('Jürgen Groß'));

  console.log("\n==================================================");
  console.log(fails===0 ? ("ALLE "+checks+" PRUEFUNGEN BESTANDEN") : (fails+" von "+checks+" PRUEFUNGEN FEHLGESCHLAGEN"));
  console.log("==================================================");

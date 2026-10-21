// ---------- Beispielnutzerin (Entwicklerwerkzeug) ----------
// Zeigt die Ansichten mit Bestand (Kurven, Befunde, Archiv-Auswertung). Zwei Regeln: Der echte Bestand
// wird vorher gesichert und beim Verlassen vollstaendig zurueckgeschrieben; solange Beispieldaten
// liegen, sagt die Ansicht das.

  var DEMO_MARKE = 'lucenta_demo_aktiv';
  var DEMO_SICHERUNG = 'lucenta_demo_sicherung';

  function demoAktiv(){
    try{ return localStorage.getItem(DEMO_MARKE) === '1'; }catch(e){ return false; }
  }

  // Solange Beispieldaten liegen, halten Sichern, Einspielen und Zuruecksetzen an — jeder dieser Wege
  // koennte sonst echte Daten verlieren oder Beispiel als echt ausgeben.
  function demoSperrt(){
    if (!demoAktiv()) return false;
    toast(tx('demo_erst_beenden'));
    return true;
  }

  // Ein Tag in Millisekunden, damit die Zeitrechnung unten lesbar bleibt.
  var TAG_MS = 86400000;

  // Fester Startwert statt Math.random(): Die Beispieldaten sehen bei jedem Laden gleich aus.
  function demoZufall(n){
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  // Laenge waehlbar (14/30/90/120 Tage); ohne Angabe 183 Tage. Das Archiv ist keine Zeitreihe und
  // bleibt.
  var DEMO_LAENGEN = [14, 30, 90, 120], DEMO_TAGE = 'lucenta_demo_tage';
  function demoDaten(tage){
    tage = tage || 183;
    var jetzt = Date.now();
    var ergebnis = {O:74, C:56, E:63, A:70, S:48};
    // Sieben Durchlaeufe; deutliche Bewegung nur in O und S. Die Fuehrung wechselt zweimal, damit der
    // Verlauf drei verschiedene Titel zeigt.
    var verlauf = [
      {date: jetzt - 176*TAG_MS, scores:{O:61, C:48, E:58, A:72, S:36}},  // Brueckenbauer:in · feinfuehlig
      {date: jetzt - 147*TAG_MS, scores:{O:63, C:49, E:59, A:71, S:38}},  // Brueckenbauer:in · neugierig
      {date: jetzt - 118*TAG_MS, scores:{O:66, C:51, E:60, A:71, S:41}},
      {date: jetzt -  89*TAG_MS, scores:{O:69, C:52, E:61, A:70, S:43}},
      {date: jetzt -  58*TAG_MS, scores:{O:71, C:54, E:62, A:70, S:45}},  // ab hier Visionaer:in · warmherzig
      {date: jetzt -  27*TAG_MS, scores:{O:73, C:55, E:62, A:71, S:47}},
      {date: jetzt -   3*TAG_MS, scores:ergebnis}
    ].filter(function(v){ return v.date >= jetzt - tage * TAG_MS; });
    // Tagesform: zuletzt dicht, frueher duenner, mit Luecken; an manchen Tagen drei Tageszeiten
    // (morgens niedriger), damit der Tageszeit-Befund zu sehen ist.
    var zustand = [];
    var ABSCHNITTE = [{h:8, ab:-0.7}, {h:13, ab:0.1}, {h:20, ab:0.6}];
    for (var i = Math.min(182, tage - 1); i >= 0; i--){
      // Zwei Luecken: eine Woche im Urlaub, und ein paar Tage, an denen es untergegangen ist.
      if (i >= 96 && i <= 103) continue;
      if (i >= 40 && i <= 42) continue;
      // Abstand nach Alter des Tages. Bei den waehlbaren Laengen taeglich — die Zeitfenster zaehlen
      // Tage MIT Eintrag, sonst waere "Gesamt" gesperrt.
      var abstand = tage <= 120 ? 1 : (i < 45 ? 1 : (i < 110 ? 2 : 5));
      if (i % abstand !== 0) continue;
      var d = new Date(jetzt - i*TAG_MS);
      var wt = d.getDay();
      // Wochentagsmuster (montags tiefer, freitags/samstags hoeher), damit tagesformBefunde() es
      // findet.
      var wochen = (wt === 1 ? -0.8 : (wt === 5 ? 0.7 : (wt === 6 ? 0.6 : 0)));
      // Ueber das halbe Jahr steigt die Grundlinie leicht an — passend zur Bewegung in S.
      var trend = (182 - i) / 182 * 0.5;
      var tagKey = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      // Jeder dritte erfasste Tag traegt alle drei Abschnitte, die uebrigen nur den Abend — so,
      // wie jemand es tatsaechlich taete: meistens einmal, manchmal oefter.
      var abschnitte = (i % 3 === 0) ? ABSCHNITTE : [ABSCHNITTE[2]];
      abschnitte.forEach(function(ab, k){
        var zeit = new Date(d.getFullYear(), d.getMonth(), d.getDate(), ab.h, 0, 0);
        // Runde 131: Heute nur, was schon vorbei ist — sonst staende der Tag morgens schon als
        // vollstaendig da (drei Tageszeiten, je ein Eintrag), mit Eintraegen aus der Zukunft.
        if (zeit.getTime() > jetzt) return;
        var e = Math.round(Math.max(1, Math.min(5, 3.1 + trend + wochen + ab.ab + (demoZufall(i*3+k+1) - 0.5) * 1.2)));
        var s = Math.round(Math.max(1, Math.min(5, 3.3 + trend + wochen*0.6 + ab.ab*0.5 + (demoZufall(i*3+k+50) - 0.5) * 1.3)));
        var eintrag = {day: tagKey, ts: zeit.getTime(), energy: e, valence: s,
                       slot: ab.h < 12 ? 'morgen' : (ab.h < 18 ? 'mittag' : 'abend')};
        // Die letzten acht Wochen tragen abends die fuenf Fragen und Stichworte, um das Ergebnis
        // gestreut.
        if (i < 56 && k === abschnitte.length - 1){
          var tags = [];
          if (wt >= 1 && wt <= 5) tags.push('arbeit');
          if (wt === 5 || wt === 6 || demoZufall(i*7+3) > 0.8) tags.push('freunde');
          if (i % 3 === 1) tags.push('sport');
          if (wt === 0) tags.push('draussen', 'erholung');
          if (demoZufall(i*7+5) > 0.85) tags.push('schlaf_wenig');
          var stufe = function(wert, extra, n){
            return Math.round(Math.max(1, Math.min(5, wert/25 + 1 + extra + (demoZufall(i*11+n) - 0.5) * 1.8)));
          };
          var gesellig = tags.indexOf('freunde') >= 0 ? 0.9 : -0.2;
          eintrag.ocean = {O: stufe(ergebnis.O, 0, 1), E: stufe(ergebnis.E, gesellig, 2),
                           C: stufe(ergebnis.C, wt === 0 ? -0.6 : 0, 3), A: stufe(ergebnis.A, 0, 4),
                           S: stufe(ergebnis.S, tags.indexOf('schlaf_wenig') >= 0 ? -1 : 0, 5)};
          eintrag.tags = tags;
          if (tags.indexOf('sport') >= 0) eintrag.energy = Math.min(5, eintrag.energy + 1);
          if (tags.indexOf('schlaf_wenig') >= 0) eintrag.energy = Math.max(1, eintrag.energy - 1);
        }
        zustand.push(eintrag);
      });
    }
    // Vier Vergleiche. Drei sind die Untergrenze, ab der das Archiv auswertet — mit vier sieht
    // man, dass die Auswertung auch darueber stimmt.
    var andere = [
      {label:'Mia',   sc:{O:71, C:49, E:66, A:73, S:52}},
      {label:'Jonas', sc:{O:48, C:78, E:41, A:55, S:66}},
      {label:'Elif',  sc:{O:80, C:44, E:70, A:64, S:39}},
      {label:'Ben',   sc:{O:55, C:61, E:52, A:59, S:58}}
    ];
    var archiv = andere.map(function(a, k){
      var abw = ORDER.reduce(function(sum, f){ return sum + Math.abs(ergebnis[f] - a.sc[f]); }, 0) / ORDER.length;
      return {
        id: 'demo'+k, ts: jetzt - (150 - k*38)*TAG_MS,
        myCode: toCode(ergebnis), otherCode: toCode(a.sc),
        match: Math.round(100 - abw), label: a.label
      };
    });
    // Freunde, wie sie per Freundescode ankaemen: Name und Figur hat sich jede Person selbst gegeben.
    // Die vier aus dem Archiv, dazu zwei ohne Vergleich; Noah ohne Figur (Initialen).
    var freundeFiguren = {Mia:'katze', Jonas:'baer', Elif:'eule', Ben:'dackel'};
    var freunde = andere.map(function(a, k){
      return {id:'demof'+k, name:a.label, figur:freundeFiguren[a.label], code:toCode(a.sc), ts: jetzt - (140 - k*30)*TAG_MS};
    }).concat([
      {id:'demof4', name:'Sara', figur:'hase', code:toCode({O:62, C:70, E:35, A:81, S:47}), ts: jetzt - 12*TAG_MS},
      {id:'demof5', name:'Noah', figur:'',     code:toCode({O:39, C:58, E:77, A:46, S:61}), ts: jetzt - 3*TAG_MS}
    ]);
    return {
      lucenta_freunde: JSON.stringify(freunde),
      lucenta_result: JSON.stringify(ergebnis),
      lucenta_history: JSON.stringify(verlauf),
      lucenta_state: JSON.stringify(zustand),
      lucenta_compat_archive: JSON.stringify(archiv),
      lucenta_profile: JSON.stringify({name:'Alex', avatarImg:null, avatarColor:'accent',
                                       figur:'fuchs', hintergrund:'sternenbild'})
    };
  }

  function demoLaden(tage){
    if (demoAktiv()) return;
    try{
      // Erst sichern, dann schreiben. Die Reihenfolge ist der ganze Unterschied.
      var sicherung = {};
      DATEN_SCHLUESSEL.forEach(function(k){
        var v = localStorage.getItem(k);
        if (v !== null) sicherung[k] = v;
      });
      localStorage.setItem(DEMO_SICHERUNG, JSON.stringify(sicherung));
      DATEN_SCHLUESSEL.forEach(function(k){ localStorage.removeItem(k); });
      var d = demoDaten(tage);
      Object.keys(d).forEach(function(k){ localStorage.setItem(k, d[k]); });
      localStorage.setItem(DEMO_MARKE, '1');
      if (tage) localStorage.setItem(DEMO_TAGE, String(tage));
    }catch(e){ toast(tx('js_konnte_nicht_gespeichert_w')); return; }
    try{ location.reload(); }catch(e){}
  }

  function demoBeenden(){
    if (!demoAktiv()) return;
    try{ localStorage.removeItem(DEMO_TAGE); }catch(e){}
    try{
      var roh = localStorage.getItem(DEMO_SICHERUNG);
      var sicherung = roh ? JSON.parse(roh) : {};
      DATEN_SCHLUESSEL.forEach(function(k){ localStorage.removeItem(k); });
      Object.keys(sicherung).forEach(function(k){
        if (DATEN_SCHLUESSEL.indexOf(k) >= 0 && typeof sicherung[k] === 'string'){
          localStorage.setItem(k, sicherung[k]);
        }
      });
      localStorage.removeItem(DEMO_SICHERUNG);
      localStorage.removeItem(DEMO_MARKE);
    }catch(e){}
    try{ location.reload(); }catch(e){}
  }

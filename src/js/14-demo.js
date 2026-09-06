// ---------- Beispielnutzerin (Runde 79) ----------
//
// Angefragt als Entwicklerwerkzeug: "gib mir einen Benutzer, der die App schon seit fuenf
// Wochen benutzt, damit ich sehe, wie die App bei so jemandem aussieht."
//
// Der Punkt daran ist nicht die Bequemlichkeit. Fast jede Ansicht der App verhaelt sich mit
// Bestand anders als ohne: Die Startseite ordnet sich um, der Verlauf zeigt statt eines
// Leerzustands eine Kurve, die Tagesform rechnet Befunde aus (die es erst ab 7 bzw. 14 Tagen
// gibt), das Vergleichsarchiv wertet erst ab drei Eintraegen aus. Diese Zustaende waren bisher
// nur zu sehen, indem man fuenf Wochen wartete oder von Hand in den Speicher schrieb.
//
// ZWEI Dinge daran sind nicht verhandelbar:
//   1. Der vorhandene Bestand wird gesichert, bevor irgendetwas ueberschrieben wird, und beim
//      Verlassen vollstaendig zurueckgeschrieben. Ein Werkzeug, das echte Daten frisst, ist
//      kein Werkzeug.
//   2. Der Zustand ist sichtbar. Solange die Beispieldaten aktiv sind, sagt die Ansicht das —
//      sonst haelt man beim naechsten Oeffnen fremde Werte fuer die eigenen.

  var DEMO_MARKE = 'lucenta_demo_aktiv';
  var DEMO_SICHERUNG = 'lucenta_demo_sicherung';

  function demoAktiv(){
    try{ return localStorage.getItem(DEMO_MARKE) === '1'; }catch(e){ return false; }
  }

  // Fehlersuche Runde 80: Solange die Beispieldaten liegen, sind Sichern, Einspielen und
  // Zuruecksetzen keine harmlosen Handlungen mehr, sondern drei Wege, echte Daten zu verlieren:
  //
  //   - Sichern haette die erfundenen Werte als eigene Sicherung ausgegeben.
  //   - Einspielen haette in die Beispielschicht geschrieben; das Beenden des Beispiels haette
  //     die eingespielten Daten anschliessend wieder mit der Sicherung ueberschrieben.
  //   - Zuruecksetzen haette die Beispielschicht geloescht, die Sicherung mit den echten Daten
  //     aber liegen gelassen — "alles geloescht" waere schlicht nicht wahr gewesen.
  //
  // Deshalb halten die drei hier an, statt sich einen Sonderweg zu bauen: Ein Beispielzustand
  // ist ein Blick, kein Bestand, und man verlaesst ihn, bevor man am Bestand arbeitet.
  function demoSperrt(){
    if (!demoAktiv()) return false;
    toast(tx('demo_erst_beenden'));
    return true;
  }

  // Ein Tag in Millisekunden, damit die Zeitrechnung unten lesbar bleibt.
  var TAG_MS = 86400000;

  // Erzeugt eine Zahl zwischen 0 und 1 aus einem Startwert. Bewusst KEIN Math.random(): Die
  // Beispieldaten sollen bei jedem Laden gleich aussehen, sonst vergleicht man beim Pruefen zwei
  // verschiedene Zustaende miteinander und haelt den Unterschied fuer eine Aenderung der App.
  function demoZufall(n){
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function demoDaten(){
    var jetzt = Date.now();
    var ergebnis = {O:74, C:52, E:63, A:70, S:48};
    // Drei Durchlaeufe ueber fuenf Wochen. Die Verschiebungen liegen bewusst im Bereich, den die
    // App selbst als normale Schwankung bezeichnet (unter 5 Punkten) — ein Beispiel, das eine
    // dramatische Entwicklung zeigt, waere ein unehrliches Beispiel.
    var verlauf = [
      {date: jetzt - 34*TAG_MS, scores:{O:70, C:55, E:59, A:67, S:45}},
      {date: jetzt - 17*TAG_MS, scores:{O:72, C:53, E:61, A:69, S:47}},
      {date: jetzt -  2*TAG_MS, scores:ergebnis}
    ];
    // 35 Tage Tagesform mit einer Luecke von drei Tagen — wer fuenf Wochen lang jeden Tag
    // eintraegt, ist die Ausnahme, und die Ansicht muss auch mit Luecken stimmen.
    var zustand = [];
    for (var i = 34; i >= 0; i--){
      if (i === 12 || i === 11 || i === 10) continue;
      var d = new Date(jetzt - i*TAG_MS);
      var wt = d.getDay();
      // Wochentagsmuster: montags gedrueckt, freitags und samstags hoeher. Genau das Muster,
      // das tagesformBefunde() ab 14 Eintraegen erkennen soll — sonst prueft man die Ansicht,
      // ohne je den Befund zu sehen.
      var wochen = (wt === 1 ? -0.8 : (wt === 5 ? 0.7 : (wt === 6 ? 0.6 : 0)));
      var e = Math.round(Math.max(1, Math.min(5, 3.3 + wochen + (demoZufall(i+1) - 0.5) * 1.6)));
      var s = Math.round(Math.max(1, Math.min(5, 3.5 + wochen*0.6 + (demoZufall(i+50) - 0.5) * 1.7)));
      zustand.push({
        day: d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),
        ts: d.getTime(), energy: e, valence: s
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
        id: 'demo'+k, ts: jetzt - (30 - k*7)*TAG_MS,
        myCode: toCode(ergebnis), otherCode: toCode(a.sc),
        match: Math.round(100 - abw), label: a.label
      };
    });
    return {
      lucenta_result: JSON.stringify(ergebnis),
      lucenta_history: JSON.stringify(verlauf),
      lucenta_state: JSON.stringify(zustand),
      lucenta_compat_archive: JSON.stringify(archiv),
      lucenta_profile: JSON.stringify({name:'Alex', avatarImg:null, avatarColor:'accent',
                                       figur:'fuchs', hintergrund:'sternenbild'})
    };
  }

  function demoLaden(){
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
      var d = demoDaten();
      Object.keys(d).forEach(function(k){ localStorage.setItem(k, d[k]); });
      localStorage.setItem(DEMO_MARKE, '1');
    }catch(e){ toast(tx('js_konnte_nicht_gespeichert_w')); return; }
    try{ location.reload(); }catch(e){}
  }

  function demoBeenden(){
    if (!demoAktiv()) return;
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

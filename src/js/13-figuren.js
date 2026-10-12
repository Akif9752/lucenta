// ---------- Figuren und Hintergruende (Runde 79) ----------
//
// Zwei Waehlbare: eine Figur im Initialen-Kreis und ein Hintergrund hinter der Profilzeile der
// Schublade.
//
// Runde 123, auf Entscheidung des Inhabers: Die Figuren sind BILDER, keine Vektorzeichnungen mehr.
// Von Runde 79 bis 121 standen hier zwoelf Tiere als SVG-Bauplan — Licht, Fell, Tieraugen,
// Anatomie, sieben Ueberarbeitungen seit Runde 111 —, und jede kam mit demselben Urteil zurueck:
// "zu gezeichnet", "mehr wie ein 3D-Modell". Auf 40 mal 40 Einheiten ist mit Pfaden kein Modell zu
// bauen. Die Bilder sind Microsoft Fluent Emoji 3D (MIT-Lizenz, Hinweis in src/figuren/ und unter
// Einstellungen > Ueber Lucenta), umgesetzt von tools/figuren_holen.py.
//
// Woher die Bilder kommen, entscheidet der Bau, nicht dieser Code: `FIGUR_BILDER` ist hier leer
// und wird von build.js gefuellt — in lucenta.html mit eingebetteten Daten (die Datei muss allein
// funktionieren), in der App-Fassung mit Pfaden nach figuren/ im Bundle. Geladen wird beides
// lokal; nach aussen geht nichts.
//
// Die Kennungen sind geblieben, auch wo das Tier gewechselt hat (Fluent hat keinen Dackel und
// keinen Retriever): Sie stehen in gespeicherten Profilen, und ein Profil mit 'dackel' soll nach
// dem Update ein Tier zeigen, keinen Buchstaben. Was sich geaendert hat, sind die Namen.

  var FIGUR_BILDER = {};

  var FIGUREN = [
    {id:'fuchs', feld:'#F6E6D8'},
    {id:'katze', feld:'#F3ECD9'},
    {id:'baer',  feld:'#EFE3D6'},
    {id:'panda', feld:'#E2E4EC'},
    {id:'hase',  feld:'#F1E7EC'},
    {id:'reh',   feld:'#EEE7D9'},
    {id:'dackel', feld:'#E6E6EE'},     // zeigt einen Pudel
    {id:'retriever', feld:'#F7EBD6'},  // zeigt einen Hund
    {id:'eule', feld:'#E3E7E4'},
    {id:'wal', feld:'#DCE7EE'},
    {id:'goldfisch', feld:'#FCEAD5'},
    {id:'schildkroete', feld:'#DDEBE1'}
  ];

  // ---------- Die Feldfarbe im Dunkelmodus ----------
  // Rueckmeldung: "passe die avatare mit ihren farben auch etwas der dunkel bzw hellversion der
  // app an, sonst sticht das im kontrast so sehr ins auge." Der Grund war die Scheibe hinter der
  // Figur: Sie trug eine feste helle Farbe, und eine cremefarbene Scheibe auf einem fast
  // schwarzen Hintergrund ist der hoechste Kontrast, den die ganze Ansicht hat.
  //
  // Die FIGUR selbst behaelt ihre Farben — ein Fuchs, der im Dunkelmodus grau wird, ist kein
  // Fuchs mehr. Was sich anpasst, ist die Flaeche darunter: Sie behaelt ihren Farbton, wird aber
  // zur dunklen Flaeche hin verschoben, sodass die Figur auf dem Grund LIEGT statt darauf zu
  // leuchten. Gerechnet statt ausgesucht — zweiundzwanzig von Hand gewaehlte Dunkelfarben waeren
  // zweiundzwanzig Gelegenheiten, dass eine davon nicht passt.
  function figFeldDunkel(hex){
    var m = /^#([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#232B27';
    var n = parseInt(m[1], 16), grund = [0x1C, 0x24, 0x20];
    var teile = [(n>>16)&255, (n>>8)&255, n&255].map(function(v, i){
      // Zwei Drittel Richtung Grundton, ein Drittel eigene Farbe. Bei einem Fuenftel Eigenfarbe
      // waren im Bild alle zweiundzwanzig Felder dasselbe Grau — der Farbton war weg, und mit
      // ihm der Grund, warum jede Figur ein eigenes Feld hat.
      return Math.round(grund[i] * 0.66 + v * 0.34);
    });
    return '#' + teile.map(function(v){ return ('0'+v.toString(16)).slice(-2); }).join('');
  }

  function figurFinden(id){
    for (var i=0;i<FIGUREN.length;i++){ if (FIGUREN[i].id === id) return FIGUREN[i]; }
    return null;
  }
  // Das Bild ist Schmuck — der Name steht am Knopf (aria-label), nicht am Bild. Fehlt eine Quelle
  // (ein Bau ohne den Schritt in build.js), bleibt der Kreis in seiner Feldfarbe leer, statt ein
  // zerbrochenes Bild zu zeigen.
  function figurHTML(f){
    var quelle = FIGUR_BILDER[f.id];
    if (!quelle) return '';
    return '<img class="figur-bild" src="'+quelle+'" alt="" aria-hidden="true" draggable="false" decoding="async">';
  }

  // ---------- Hintergruende der Profilzeile ----------
  // Zehn Vorlagen, alle als CSS-Verlauf statt als Bild: Sie kosten kein einziges Byte an
  // Ladezeit, skalieren auf jede Groesse und lassen sich ueber eine Klasse setzen.
  //
  // Jede traegt eine eigene Textfarbe mit. Das ist der Punkt, an dem so etwas sonst schiefgeht:
  // Ein dunkler Nachthimmel mit der normalen Textfarbe der App waere im Hellmodus unlesbar.
  // Die Vorlage bestimmt deshalb BEIDES — Flaeche und Schrift.
  var HINTERGRUENDE = ['sternenbild','nordlicht','daemmerung','tiefsee','wueste',
                       'wald','nebel','papier','welle','kohle'];

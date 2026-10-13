// ---------- Figuren und Hintergruende ----------
// Die Figuren sind Bilder aus eigenen 3D-Renderings (tools/figuren_rendern/, umgesetzt von
// tools/figuren_holen.py). FIGUR_BILDER fuellt build.js: in lucenta.html eingebettet, in der
// App-Fassung Pfade nach figuren/. Alles lokal.
// Die Kennungen stehen in gespeicherten Profilen und aendern sich nie.

  var FIGUR_BILDER = {};

  var FIGUREN = [
    {id:'fuchs', feld:'#F6E6D8'},
    {id:'katze', feld:'#F3ECD9'},
    {id:'baer',  feld:'#EFE3D6'},
    {id:'panda', feld:'#E2E4EC'},
    {id:'hase',  feld:'#F1E7EC'},
    {id:'reh',   feld:'#EEE7D9'},
    {id:'dackel', feld:'#F0E3D2'},
    {id:'retriever', feld:'#F7EBD6'},
    {id:'eule', feld:'#E3E7E4'},
    {id:'wal', feld:'#DCE7EE'},
    {id:'goldfisch', feld:'#FCEAD5'},
    {id:'schildkroete', feld:'#DDEBE1'}
  ];

  // ---------- Die Feldfarbe im Dunkelmodus ----------
  // Die Figur behaelt ihre Farben; die Scheibe dahinter behaelt ihren Farbton, wird aber zur dunklen
  // Flaeche hin verschoben — gerechnet, nicht ausgesucht.
  function figFeldDunkel(hex){
    var m = /^#([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#232B27';
    var n = parseInt(m[1], 16), grund = [0x1C, 0x24, 0x20];
    var teile = [(n>>16)&255, (n>>8)&255, n&255].map(function(v, i){
      // Zwei Drittel Grundton, ein Drittel Eigenfarbe (weniger ergab ueberall dasselbe Grau).
      return Math.round(grund[i] * 0.66 + v * 0.34);
    });
    return '#' + teile.map(function(v){ return ('0'+v.toString(16)).slice(-2); }).join('');
  }

  function figurFinden(id){
    for (var i=0;i<FIGUREN.length;i++){ if (FIGUREN[i].id === id) return FIGUREN[i]; }
    return null;
  }
  // Das Bild ist Schmuck — der Name steht am Knopf (aria-label). Ohne Quelle bleibt der Kreis leer
  // statt ein zerbrochenes Bild zu zeigen.
  function figurHTML(f){
    var quelle = FIGUR_BILDER[f.id];
    if (!quelle) return '';
    return '<img class="figur-bild" src="'+quelle+'" alt="" aria-hidden="true" draggable="false" decoding="async">';
  }

  // ---------- Hintergruende der Profilzeile ----------
  // CSS-Verlaeufe statt Bilder; jede Vorlage bestimmt Flaeche UND Schriftfarbe.
  var HINTERGRUENDE = ['sternenbild','nordlicht','daemmerung','tiefsee','wueste',
                       'wald','nebel','papier','welle','kohle'];

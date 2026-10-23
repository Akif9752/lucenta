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
    {id:'schildkroete', feld:'#DDEBE1'},
    // Runde 160. Nur HINTEN anhaengen: Der Platz in dieser Liste steht im Freundescode.
    {id:'delfin', feld:'#DCE6EE'},
    {id:'seeotter', feld:'#EFE5D8'},
    {id:'pinguin', feld:'#E3E8EC'},
    {id:'papagei', feld:'#F5E2DC'},
    {id:'flamingo', feld:'#F8E4E8'},
    {id:'rotkehlchen', feld:'#F3E6D8'}
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
  // Angezeigt in Gruppen (Auftrag des Inhabers); die Reihenfolge in FIGUREN bleibt dafuer unberuehrt.
  var FIGUR_GRUPPEN = [['haus', ['katze','dackel','retriever']],
                       ['wald', ['fuchs','baer','panda','hase','reh']],
                       ['voegel', ['eule','pinguin','papagei','flamingo','rotkehlchen']],
                       ['wasser', ['wal','delfin','seeotter','schildkroete','goldfisch']]];
  // knopf(f) liefert den Knopf einer Figur; kopf (optional) steht vor der ersten Gruppe.
  function figurenGruppiertHTML(knopf, kopf){
    return (kopf ? '<div class="figur-raster">'+kopf+'</div>' : '')+
      FIGUR_GRUPPEN.map(function(g){
        return '<div class="figur-gruppe"><div class="hg-gruppe-titel">'+tx('figur_gruppe_'+g[0])+'</div><div class="figur-raster">'+
          g[1].map(function(id){ return knopf(figurFinden(id)); }).join('')+'</div></div>';
      }).join('');
  }
  var HINTERGRUENDE = ['sternenbild','nordlicht','daemmerung','tiefsee','wueste',
                       'wald','nebel','papier','welle','kohle','galaxie','glut','lagune','morgentau'];
  // Angezeigt in Gruppen; frei sind nur die schlichten Flaechen, der Rest ist Lucenta+ (Entscheidung des
  // Inhabers). Ein schon gewaehlter gesperrter Hintergrund bleibt.
  var HG_GRUPPEN = [['hell', ['papier','nebel','wueste','morgentau']],
                    ['dunkel', ['kohle','sternenbild','tiefsee','galaxie']],
                    ['farbe', ['nordlicht','daemmerung','welle','wald','glut','lagune']]];
  var HG_FREI = ['papier','kohle'];
  function hgFrei(id){ return !id || HG_FREI.indexOf(id) >= 0 || istPlus(); }

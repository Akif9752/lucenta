// ---------- Figuren und Hintergruende ----------
// Die Figuren sind Bilder aus eigenen 3D-Renderings (tools/figuren_rendern/, umgesetzt von
// tools/figuren_holen.py). FIGUR_BILDER fuellt build.js: in lucenta.html eingebettet, in der
// App-Fassung Pfade nach figuren/. Alles lokal.
// Die Kennungen stehen in gespeicherten Profilen und aendern sich nie.

  var FIGUR_BILDER = {};
  var FIGUR_KOEPFE = {};

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
    {id:'rotkehlchen', feld:'#F3E6D8'},
    {id:'mops', feld:'#F2E7D6'},
    {id:'siamkatze', feld:'#E9E3EE'}
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
  // `ausdruck` ('muede'|'froh', Tagesform-Begleiter): faellt auf das Grundbild zurueck, wenn es fehlt.
  // `kopf`: kleine Avatare zoomen auf Kopf und Schultern (die ganze Figur ist dort zu klein, Entscheidung des Inhabers).
  function figurHTML(f, ausdruck, kopf){
    var quelle = (ausdruck && FIGUR_BILDER[f.id + '-' + ausdruck]) || FIGUR_BILDER[f.id];
    if (!quelle) return '';
    var k = kopf && FIGUR_KOEPFE[f.id];
    if (k){
      // Als Hintergrund des Kreises statt als uebergrosses Bild: so ragt nichts ueber den Kreis hinaus.
      // Hintergrund-Prozent: Anteil P legt P des Bildes auf P des Kreises -> P = (0,5 - k*s) / (1 - s).
      var s = Math.min(3.2, 0.40 / k[2]);
      // Kopf so gross wie das Bild (Fisch): Die Formel teilt dann durch fast 0 und schob das Bild aus dem Kreis.
      if (s < 1.05) s = 1;
      var px = s === 1 ? 50 : (0.5 - k[0]*s) / (1 - s) * 100, py = s === 1 ? 50 : (0.5 - k[1]*s) / (1 - s) * 100;
      return '<span class="figur-bild figur-kopf" aria-hidden="true" style="background-image:url(\''+quelle+'\');background-size:'+
             (s*100).toFixed(1)+'%;background-position:'+px.toFixed(1)+'% '+py.toFixed(1)+'%"></span>';
    }
    return '<img class="figur-bild" src="'+quelle+'" alt="" aria-hidden="true" draggable="false" decoding="async">';
  }

  // Nach dem Start alle Tierbilder einmal laden und entschluesseln: Beim ersten Oeffnen von „Aussehen" kamen sonst
  // 20 Dateien mitten in der Schiebe-Animation an, und die Seite ruckelte.
  function figurenVorladen(){
    Object.keys(FIGUR_BILDER).forEach(function(k, i){
      if (/-(froh|muede)$/.test(k)) return;
      setTimeout(function(){ try{ var b = new Image(); b.src = FIGUR_BILDER[k]; if (b.decode) b.decode().catch(function(){}); }catch(e){} }, i * 15);
    });
  }

  // ---------- Zubehoer fuer den Begleiter ----------
  // Freigeschaltet ueber Eintragstage der Tagesform; das erste frei, die weiteren nur mit Lucenta+ (Entscheidung des
  // Inhabers). Platziert ueber die Kopfstelle (FIGUR_KOEPFE), damit es auf jedes Tierbild passt.
  var ZUBEHOER = [{id:'schal', tage:7, plus:false}, {id:'muetze', tage:30, plus:true}, {id:'blume', tage:100, plus:true}];
  // Lage je Teil aus Kopfmitte und -radius: Mitte x, Mitte y, Breite (Anteile des Bildes).
  var ZUB_LAGE = {
    schal:  function(k){ return [k[0], k[1] + k[2] * 1.50, k[2] * 2.1]; },
    muetze: function(k){ return [k[0], k[1] - k[2] * 0.92, k[2] * 1.38]; },
    blume:  function(k){ return [k[0] + k[2] * 0.80, k[1] - k[2] * 0.78, k[2] * 0.6]; }
  };
  function zubehoerFinden(id){ return ZUBEHOER.filter(function(z){ return z.id === id; })[0] || null; }
  function eintragsTage(){ try{ return stateTage(loadStateHistory()).length; }catch(e){ return 0; } }
  function zubehoerFrei(z){ return !!z && eintragsTage() >= z.tage && (!z.plus || istPlus()); }
  function zubehoerHTML(f, zid, kopf){
    var z = zubehoerFinden(zid), k = FIGUR_KOEPFE[f.id], quelle = z && FIGUR_BILDER['zubehoer-' + zid];
    if (!z || !k || !quelle || !zubehoerFrei(z)) return '';
    var p = ZUB_LAGE[zid](k), s = kopf ? Math.max(1.01, Math.min(3.2, 0.40 / k[2])) : 1;
    var x = kopf ? 0.5 + (p[0] - k[0]) * s : p[0], y = kopf ? 0.5 + (p[1] - k[1]) * s : p[1], b = p[2] * s;
    return '<img class="figur-zubehoer" src="' + quelle + '" alt="" aria-hidden="true" draggable="false" style="left:' +
      ((x - b / 2) * 100).toFixed(1) + '%;top:' + (y * 100).toFixed(1) + '%;width:' + (b * 100).toFixed(1) + '%">';
  }

  // ---------- Hintergruende der Profilzeile ----------
  // CSS-Verlaeufe statt Bilder; jede Vorlage bestimmt Flaeche UND Schriftfarbe.
  // Angezeigt in Gruppen (Auftrag des Inhabers); die Reihenfolge in FIGUREN bleibt dafuer unberuehrt.
  var FIGUR_GRUPPEN = [['haus', ['katze','siamkatze','dackel','retriever','mops']],
                       ['wald', ['fuchs','baer','panda','hase','reh']],
                       ['voegel', ['eule','pinguin','papagei','flamingo','rotkehlchen']],
                       ['wasser', ['wal','delfin','seeotter','schildkroete','goldfisch']]];
  // knopf(f) liefert den Knopf einer Figur; kopf (optional) steht vor der ersten Gruppe.
  // Eine Karte, die Gruppen darin als Zeilen mit Zwischentitel (Entscheidung des Inhabers: zusammengehoerig).
  function figurenGruppiertHTML(knopf, kopf, kopfTitel){
    return (kopf ? '<div class="figur-gruppe">'+(kopfTitel ? '<div class="hg-gruppe-titel">'+kopfTitel+'</div>' : '')+
                   '<div class="figur-raster">'+kopf+'</div></div>' : '')+
      FIGUR_GRUPPEN.map(function(g){
        return '<div class="figur-gruppe"><div class="hg-gruppe-titel">'+tx('figur_gruppe_'+g[0])+'</div><div class="figur-raster">'+
          g[1].map(function(id){ return knopf(figurFinden(id)); }).join('')+'</div></div>';
      }).join('');
  }
  var HINTERGRUENDE = ['sternenbild','nordlicht','daemmerung','tiefsee','wueste',
                       'wald','nebel','papier','welle','kohle','galaxie','glut','lagune','morgentau',
                       'kirschbluete','gletscher','mondnacht','neon','prisma','sonnenstrahl',
                       'lavendel','wolken','sternschnuppe','artdeco'];
  // Angezeigt in Gruppen; frei sind nur die schlichten Flaechen, der Rest ist Lucenta+ (Entscheidung des
  // Inhabers). Ein schon gewaehlter gesperrter Hintergrund bleibt.
  // Reihenfolge und Zuordnung: Entscheidung des Inhabers — zuerst die schlichten Flaechen ohne Motiv, dann hell, dann dunkel.
  var HG_GRUPPEN = [['farbe', ['nebel','wueste','morgentau','daemmerung','lagune','wald','tiefsee','kohle']],
                    ['hell', ['papier','wolken','kirschbluete','lavendel','gletscher','prisma','sonnenstrahl']],
                    ['dunkel', ['sternenbild','mondnacht','sternschnuppe','galaxie','nordlicht','welle','glut','neon','artdeco']]];
  var HG_FREI = ['papier','kohle','wolken','sternenbild','daemmerung'];
  function hgFrei(id){ return !id || HG_FREI.indexOf(id) >= 0 || istPlus(); }

// ---------- Figuren und Hintergruende (Runde 79) ----------
//
// Zwei Waehlbare, die es bisher nicht gab: eine Figur im Initialen-Kreis und ein Hintergrund
// hinter der Profilzeile der Schublade.
//
// Warum als Bauplan und nicht als zwoelf handgezeichnete Bilder: Zwoelf einzeln gezeichnete
// SVGs waeren zwoelf Gelegenheiten, dass eine Nase drei Bildpunkte tiefer sitzt als die
// naechste. Kopf, Ohren, Augen und Schnauze folgen deshalb EINER Konstruktion; die Unterschiede
// stecken ausschliesslich in den Parametern. Das ist derselbe Grundsatz wie bei den Farben:
// gerechnet, nicht ausgesucht.
//
// Die Farben stehen hier als feste Werte statt als CSS-Marken, und das ist Absicht: Eine Figur
// ist ein Bild, kein Bedienelement. Sie muss im Hell- wie im Dunkelmodus gleich aussehen —
// genau wie das Ergebnisbild, das aus demselben Grund eigene Farben mitbringt.

  var FIG_INK = '#2A211C';

  // Gemeinsame Bausteine. Alle Zeichnungen liegen in einem 40x40-Feld, der Kopf mittig bei
  // (20,21) — dadurch sitzt jede Figur im Kreis an derselben Stelle.
  function figAugen(x1, x2, y, r){
    return '<circle cx="'+x1+'" cy="'+y+'" r="'+r+'" fill="'+FIG_INK+'"/>'+
           '<circle cx="'+x2+'" cy="'+y+'" r="'+r+'" fill="'+FIG_INK+'"/>';
  }
  function figOhren(art, fell, innen){
    if (art === 'spitz')
      return '<path d="M8.5 17 L11 4 L19.5 11.5 Z" fill="'+fell+'"/>'+
             '<path d="M31.5 17 L29 4 L20.5 11.5 Z" fill="'+fell+'"/>'+
             '<path d="M11.4 14.6 L12.6 8.2 L16.8 12.4 Z" fill="'+innen+'"/>'+
             '<path d="M28.6 14.6 L27.4 8.2 L23.2 12.4 Z" fill="'+innen+'"/>';
    if (art === 'rund')
      return '<circle cx="9.5" cy="11" r="6.2" fill="'+fell+'"/><circle cx="30.5" cy="11" r="6.2" fill="'+fell+'"/>'+
             '<circle cx="9.5" cy="11" r="3.1" fill="'+innen+'"/><circle cx="30.5" cy="11" r="3.1" fill="'+innen+'"/>';
    if (art === 'lang')
      return '<ellipse cx="13.5" cy="8.5" rx="3.5" ry="8" fill="'+fell+'"/>'+
             '<ellipse cx="26.5" cy="8.5" rx="3.5" ry="8" fill="'+fell+'"/>'+
             '<ellipse cx="13.5" cy="9.2" rx="1.7" ry="5.4" fill="'+innen+'"/>'+
             '<ellipse cx="26.5" cy="9.2" rx="1.7" ry="5.4" fill="'+innen+'"/>';
    if (art === 'geweih')
      return '<path d="M13.5 12 L11 4 M11 6.5 L7.5 4.5 M26.5 12 L29 4 M29 6.5 L32.5 4.5" '+
             'stroke="'+innen+'" stroke-width="1.9" stroke-linecap="round" fill="none"/>'+
             '<ellipse cx="10.5" cy="15" rx="3.4" ry="5" transform="rotate(-18 10.5 15)" fill="'+fell+'"/>'+
             '<ellipse cx="29.5" cy="15" rx="3.4" ry="5" transform="rotate(18 29.5 15)" fill="'+fell+'"/>';
    return '';
  }
  // Kopf, Schnauze, Nase — der Teil, den alle Tiere teilen.
  function figTier(o){
    return figOhren(o.ohr, o.fell, o.innen) +
      '<ellipse cx="20" cy="21.5" rx="13.5" ry="12.5" fill="'+o.fell+'"/>' +
      (o.wange ? '<circle cx="9.5" cy="24" r="2.6" fill="'+o.wange+'"/><circle cx="30.5" cy="24" r="2.6" fill="'+o.wange+'"/>' : '') +
      (o.maske ? o.maske : '') +
      '<ellipse cx="20" cy="26.5" rx="7.5" ry="6" fill="'+o.schnauze+'"/>' +
      figAugen(15, 25, 20, o.auge || 1.9) +
      '<ellipse cx="20" cy="25" rx="2.1" ry="1.5" fill="'+FIG_INK+'"/>' +
      '<path d="M20 26.4 L20 28 M20 28 Q17.6 30 15.8 28.4 M20 28 Q22.4 30 24.2 28.4" '+
        'stroke="'+FIG_INK+'" stroke-width="1.1" fill="none" stroke-linecap="round"/>';
  }
  // Menschen: Kopf, Haar, Gesicht. Die Haarform ist der einzige Unterschied.
  function figMensch(o){
    var haar = '';
    if (o.haar === 'kurzhaar')
      haar = '<path d="M6.8 20 C6.8 10.5 12.5 5.5 20 5.5 C27.5 5.5 33.2 10.5 33.2 20 '+
             'C33.2 15.5 27 13.5 20 13.5 C13 13.5 6.8 15.5 6.8 20 Z" fill="'+o.haarFarbe+'"/>';
    else if (o.haar === 'lang')
      haar = '<path d="M5.6 34 C5.6 20 6.4 5.5 20 5.5 C33.6 5.5 34.4 20 34.4 34 '+
             'C34.4 34 31.5 33 30.6 26 C29 15.5 26 14 20 14 C14 14 11 15.5 9.4 26 '+
             'C8.5 33 5.6 34 5.6 34 Z" fill="'+o.haarFarbe+'"/>';
    else if (o.haar === 'locken')
      haar = '<circle cx="11" cy="13" r="6" fill="'+o.haarFarbe+'"/><circle cx="20" cy="9.5" r="6.6" fill="'+o.haarFarbe+'"/>'+
             '<circle cx="29" cy="13" r="6" fill="'+o.haarFarbe+'"/><circle cx="8.6" cy="19.5" r="4.4" fill="'+o.haarFarbe+'"/>'+
             '<circle cx="31.4" cy="19.5" r="4.4" fill="'+o.haarFarbe+'"/>';
    else if (o.haar === 'tuch')
      haar = '<path d="M5.8 22 C5.8 11 12 5 20 5 C28 5 34.2 11 34.2 22 C34.2 26 32 29 32 29 '+
             'L28.5 20 C27 15 24 13.5 20 13.5 C16 13.5 13 15 11.5 20 L8 29 C8 29 5.8 26 5.8 22 Z" '+
             'fill="'+o.haarFarbe+'"/>';
    else if (o.haar === 'dutt')
      haar = '<circle cx="20" cy="4.6" r="4" fill="'+o.haarFarbe+'"/>'+
             '<path d="M6.8 20 C6.8 10.5 12.5 6 20 6 C27.5 6 33.2 10.5 33.2 20 '+
             'C33.2 15.5 27 13.5 20 13.5 C13 13.5 6.8 15.5 6.8 20 Z" fill="'+o.haarFarbe+'"/>';
    return '<ellipse cx="20" cy="21.5" rx="11.6" ry="13" fill="'+o.haut+'"/>' + haar +
      figAugen(15.6, 24.4, 21, 1.7) +
      '<path d="M16.6 27.4 Q20 30.4 23.4 27.4" stroke="'+FIG_INK+'" stroke-width="1.4" '+
        'fill="none" stroke-linecap="round"/>' +
      (o.bart ? '<path d="M12.6 24 C12.6 32 16 34.6 20 34.6 C24 34.6 27.4 32 27.4 24 '+
                'C27.4 28 24 29.6 20 29.6 C16 29.6 12.6 28 12.6 24 Z" fill="'+o.haarFarbe+'"/>' : '');
  }

  // Die zwoelf Figuren. Reihenfolge: erst Menschen, dann Tiere — wer sich selbst sucht, sucht
  // nicht zuerst nach einem Fuchs.
  var FIGUREN = [
    {id:'m1', feld:'#F3E3D3', svg:function(){ return figMensch({haut:'#E8BE9A', haar:'kurzhaar',   haarFarbe:'#3A2A20'}); }},
    {id:'m2', feld:'#EFE0EA', svg:function(){ return figMensch({haut:'#F0CBAA', haar:'lang',   haarFarbe:'#8A4B2A'}); }},
    {id:'m3', feld:'#E2E7DC', svg:function(){ return figMensch({haut:'#8D5A3B', haar:'locken', haarFarbe:'#2B1D17'}); }},
    {id:'m4', feld:'#DDE6EC', svg:function(){ return figMensch({haut:'#E5B98F', haar:'tuch',   haarFarbe:'#3E6B74'}); }},
    {id:'m5', feld:'#EDE6DA', svg:function(){ return figMensch({haut:'#C98F62', haar:'dutt',   haarFarbe:'#4A3226'}); }},
    {id:'m6', feld:'#E7E2F0', svg:function(){ return figMensch({haut:'#EFC9A6', haar:'kurzhaar',   haarFarbe:'#6B6B6B', bart:true}); }},
    {id:'fuchs', feld:'#F6E6D8', svg:function(){ return figTier({ohr:'spitz', fell:'#D97A45', innen:'#F5E2D2', schnauze:'#F8EFE6', wange:'#E9A177'}); }},
    {id:'katze', feld:'#E6E4EA', svg:function(){ return figTier({ohr:'spitz', fell:'#8E8B95', innen:'#E3C8CE', schnauze:'#F1EFF3'}); }},
    {id:'baer',  feld:'#EFE3D6', svg:function(){ return figTier({ohr:'rund',  fell:'#A5714B', innen:'#D9A87F', schnauze:'#E7CDB2'}); }},
    {id:'panda', feld:'#E8E8E6', svg:function(){ return figTier({ohr:'rund',  fell:'#F4F3F1', innen:'#2A211C', schnauze:'#FFFFFF', auge:2.6,
                  maske:'<ellipse cx="15" cy="20" rx="4.6" ry="5.2" transform="rotate(-14 15 20)" fill="#2A211C"/>'+
                        '<ellipse cx="25" cy="20" rx="4.6" ry="5.2" transform="rotate(14 25 20)" fill="#2A211C"/>'}); }},
    {id:'hase',  feld:'#F1E7EC', svg:function(){ return figTier({ohr:'lang',  fell:'#E4DAD3', innen:'#E7B9C4', schnauze:'#F7F1EE', wange:'#EFC3CD'}); }},
    {id:'reh',   feld:'#EEE7D9', svg:function(){ return figTier({ohr:'geweih',fell:'#C99A6A', innen:'#7A5B3E', schnauze:'#EFE0CD'}); }},
    // Zwei, die nicht in den Kopf-Bauplan passen und deshalb eigene Formen bekommen.
    {id:'eule', feld:'#E3E7E4', svg:function(){
       return '<path d="M9 12 L12.5 5 L16.5 10.5 Z" fill="#8B7355"/><path d="M31 12 L27.5 5 L23.5 10.5 Z" fill="#8B7355"/>'+
              '<ellipse cx="20" cy="22" rx="13.5" ry="13" fill="#A08463"/>'+
              '<circle cx="14.6" cy="20" r="6.2" fill="#F3EADD"/><circle cx="25.4" cy="20" r="6.2" fill="#F3EADD"/>'+
              '<circle cx="14.6" cy="20" r="3.1" fill="'+FIG_INK+'"/><circle cx="25.4" cy="20" r="3.1" fill="'+FIG_INK+'"/>'+
              '<path d="M20 24.5 L16.8 29 L23.2 29 Z" fill="#D89A45"/>'+
              '<path d="M11 30 Q20 34.5 29 30" stroke="#8B7355" stroke-width="1.6" fill="none" stroke-linecap="round"/>'; }},
    {id:'wal', feld:'#DCE7EE', svg:function(){
       return '<path d="M17 6 Q20 9 23 6" stroke="#9FC2D8" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
              '<path d="M20 6 L20 10" stroke="#9FC2D8" stroke-width="1.8" stroke-linecap="round"/>'+
              '<ellipse cx="19" cy="23" rx="14" ry="11" fill="#5E8FB0"/>'+
              '<path d="M31 19 L37 14 L36 26 Z" fill="#4A7A9A"/>'+
              '<path d="M8 26 Q19 33 30 26 Q19 30 8 26 Z" fill="#CFE2EE"/>'+
              '<ellipse cx="19" cy="27" rx="10" ry="5.5" fill="#CFE2EE"/>'+
              '<circle cx="13" cy="21" r="2" fill="'+FIG_INK+'"/>'; }}
  ];

  function figurFinden(id){
    for (var i=0;i<FIGUREN.length;i++){ if (FIGUREN[i].id === id) return FIGUREN[i]; }
    return null;
  }
  function figurSVG(f){
    return '<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true" '+
           'style="display:block">'+f.svg()+'</svg>';
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

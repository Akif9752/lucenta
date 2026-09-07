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

  // Runde 83: Die Figuren wirkten steril. Beim Nachsehen lag das nicht an den Formen, sondern
  // an drei Dingen, die jeder Zeichnung fehlten und die zusammen den Unterschied zwischen
  // "Piktogramm" und "Gesicht" ausmachen:
  //
  //   1. Die Augen waren volle schwarze Punkte. Ein Auge ohne Lichtpunkt ist ein Loch — das
  //      ist der groesste einzelne Hebel und kostet zwei Kreise je Gesicht.
  //   2. Alles war flaechig gefuellt. Ein Kopf ohne Licht oben und Schatten unten liest sich
  //      als Aufkleber, nicht als Koerper.
  //   3. Alle trugen dieselbe Miene. Der Mund ist jetzt je Figur waehlbar.
  //
  // Der Bauplan bleibt: Kopf, Ohren, Augen und Schnauze folgen EINER Konstruktion, die
  // Unterschiede stecken in den Parametern. Zwanzig einzeln gezeichnete SVGs waeren zwanzig
  // Gelegenheiten, dass eine Nase drei Bildpunkte tiefer sitzt als die naechste.

  // Ein Auge mit Lichtpunkt. Der Punkt sitzt links oben, bei allen gleich — Licht kommt in
  // dieser Zeichnung immer von dort, und Blicke, die in verschiedene Richtungen gehen, wirken
  // schielend statt lebendig.
  function figAuge(x, y, r){
    return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+FIG_INK+'"/>'+
           '<circle cx="'+(x - r*0.32).toFixed(2)+'" cy="'+(y - r*0.36).toFixed(2)+'" r="'+(r*0.36).toFixed(2)+'" fill="#FFFFFF" opacity=".92"/>';
  }
  function figAugen(x1, x2, y, r){
    return figAuge(x1, y, r) + figAuge(x2, y, r);
  }
  // Licht oben, Schatten unten. Beides sehr zurueckhaltend: Es soll Koerper geben, nicht
  // auffallen — ab etwa 0,2 Deckkraft sieht es nach Verschmutzung aus.
  function figVolumen(cx, cy, rx, ry){
    return '<ellipse cx="'+cx+'" cy="'+(cy - ry*0.34).toFixed(2)+'" rx="'+(rx*0.72).toFixed(2)+'" ry="'+(ry*0.44).toFixed(2)+'" fill="#FFFFFF" opacity=".13"/>'+
           '<ellipse cx="'+cx+'" cy="'+(cy + ry*0.46).toFixed(2)+'" rx="'+(rx*0.82).toFixed(2)+'" ry="'+(ry*0.42).toFixed(2)+'" fill="'+FIG_INK+'" opacity=".07"/>';
  }
  // Die Mienen. Bewusst eine kleine, feste Auswahl statt freier Kurven: Vier Muender, die
  // zueinander passen, sind besser als zwanzig, von denen drei schief sitzen.
  function figMund(art, farbe, breite){
    var f = farbe || FIG_INK, w = breite || 1.25;
    var linie = function(d){ return '<path d="'+d+'" stroke="'+f+'" stroke-width="'+w+'" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'; };
    if (art === 'laecheln')  return linie('M16.4 27.6 Q20 30.8 23.6 27.6');
    if (art === 'breit')     return linie('M15.2 27 Q20 32 24.8 27');
    if (art === 'sanft')     return linie('M17.2 28.2 Q20 30 22.8 28.2');
    if (art === 'strich')    return linie('M17.4 28.6 L22.6 28.6');
    // Die Tierschnauze: senkrechter Strich unter der Nase, dann zwei Boegen.
    return linie('M20 26.4 L20 28 M20 28 Q17.6 30 15.8 28.4 M20 28 Q22.4 30 24.2 28.4');
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
    // Schlappohren fuer Hunde: haengen seitlich am Kopf herunter statt aufzustehen.
    if (art === 'schlapp')
      return '<ellipse cx="7.6" cy="24" rx="4.6" ry="9.5" transform="rotate(9 7.6 24)" fill="'+fell+'"/>'+
             '<ellipse cx="32.4" cy="24" rx="4.6" ry="9.5" transform="rotate(-9 32.4 24)" fill="'+fell+'"/>'+
             '<ellipse cx="7.9" cy="25.5" rx="2.3" ry="6" transform="rotate(9 7.9 25.5)" fill="'+innen+'" opacity=".55"/>'+
             '<ellipse cx="32.1" cy="25.5" rx="2.3" ry="6" transform="rotate(-9 32.1 25.5)" fill="'+innen+'" opacity=".55"/>';
    return '';
  }
  // Kopf, Schnauze, Nase — der Teil, den alle Tiere teilen.
  function figTier(o){
    return figOhren(o.ohr, o.fell, o.innen) +
      '<ellipse cx="20" cy="21.5" rx="13.5" ry="12.5" fill="'+o.fell+'"/>' +
      figVolumen(20, 21.5, 13.5, 12.5) +
      (o.maske ? o.maske : '') +
      (o.wange ? '<ellipse cx="9.8" cy="24.5" rx="3" ry="2.2" fill="'+o.wange+'" opacity=".75"/>'+
                 '<ellipse cx="30.2" cy="24.5" rx="3" ry="2.2" fill="'+o.wange+'" opacity=".75"/>' : '') +
      '<ellipse cx="20" cy="26.5" rx="7.5" ry="6" fill="'+o.schnauze+'"/>' +
      // Brauen: ein kurzer Bogen ueber jedem Auge. Bei Tieren sehr fein — er traegt fast die
      // ganze Miene, und zu kraeftig gezeichnet sieht jedes Tier boese aus.
      (o.brauen ? '<path d="M12.4 16.6 Q15 15.4 17.6 16.4 M22.4 16.4 Q25 15.4 27.6 16.6" stroke="'+FIG_INK+
                  '" stroke-width="0.9" fill="none" stroke-linecap="round" opacity=".45"/>' : '') +
      figAugen(15, 25, 20, o.auge || 1.9) +
      '<ellipse cx="20" cy="25" rx="2.1" ry="1.5" fill="'+FIG_INK+'"/>' +
      '<ellipse cx="19.4" cy="24.6" rx="0.7" ry="0.45" fill="#FFFFFF" opacity=".45"/>' +
      figMund(o.mund, FIG_INK, 1.1) +
      (o.zunge ? '<path d="M18.6 29.4 Q20 32.6 21.4 29.4 Z" fill="#E4899A"/>' : '');
  }
  // Menschen: Kopf, Haar, Gesicht. Die Haarform ist der groesste Unterschied, aber nicht mehr
  // der einzige — Brauen, Miene, Sommersprossen und Brille tragen jetzt genauso viel.
  function figMensch(o){
    var haar = '', haarVorn = '';
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
    else if (o.haar === 'pony')
      // Bob mit geradem Pony: Die Straehnen fallen seitlich bis aufs Kinn. Die Unterkante der
      // Fransen liegt bei 16,4 und damit ueber den Brauen — im ersten Entwurf lag sie auf ihnen,
      // und das Gesicht sah aus, als waeren die Brauen ins Haar gerutscht.
      haar = '<path d="M5.9 30 C5.9 12 11 5 20 5 C29 5 34.1 12 34.1 30 C34.1 30 31.4 29 30.8 24 '+
             'L30.8 14.2 C30.8 14.2 26 16.4 20 16.4 C14 16.4 9.2 14.2 9.2 14.2 L9.2 24 '+
             'C8.6 29 5.9 30 5.9 30 Z" fill="'+o.haarFarbe+'"/>';
    else if (o.haar === 'zopf')
      // Hoher Zopf. Er ragt deutlich ueber den Kopfumriss hinaus (der endet bei x=31,6) — im
      // ersten Entwurf lag er innerhalb und verschmolz mit der Frisur zu einer Kappe. Dazu ein
      // Band an der Ansatzstelle: Ohne das liest sich der Zopf als abstehende Straehne.
      haar = '<path d="M29.5 11 Q38.5 13.5 37 23.5 Q36 30 32.6 32.5 Q36.2 24 33.6 17.5 '+
             'Q31.8 13.4 28.4 12.2 Z" fill="'+o.haarFarbe+'"/>'+
             '<path d="M6.8 20 C6.8 10.5 12.5 5.5 20 5.5 C27.5 5.5 33.2 10.5 33.2 20 '+
             'C33.2 15.5 27 13.5 20 13.5 C13 13.5 6.8 15.5 6.8 20 Z" fill="'+o.haarFarbe+'"/>'+
             '<ellipse cx="30.6" cy="13.4" rx="2.5" ry="1.9" transform="rotate(-28 30.6 13.4)" '+
             'fill="'+FIG_INK+'" opacity=".22"/>';
    // Ein Glanzstreifen im Haar. Er kostet eine Linie und nimmt der Frisur das Aufgeklebte.
    if (haar) haarVorn = '<path d="M12.6 12.2 Q16 8.6 21 8.2" stroke="#FFFFFF" stroke-width="1.3" '+
                         'fill="none" stroke-linecap="round" opacity=".22"/>';
    return '<ellipse cx="20" cy="21.5" rx="11.6" ry="13" fill="'+o.haut+'"/>' +
      figVolumen(20, 21.5, 11.6, 13) +
      haar + haarVorn +
      (o.wange !== false ? '<ellipse cx="12.4" cy="25" rx="2.5" ry="1.8" fill="#E08C7E" opacity=".3"/>'+
                           '<ellipse cx="27.6" cy="25" rx="2.5" ry="1.8" fill="#E08C7E" opacity=".3"/>' : '') +
      (o.sommersprossen ? '<g fill="'+FIG_INK+'" opacity=".28">'+
         '<circle cx="14.4" cy="24" r="0.5"/><circle cx="16.4" cy="25" r="0.45"/><circle cx="12.9" cy="25.4" r="0.42"/>'+
         '<circle cx="25.6" cy="24" r="0.5"/><circle cx="23.6" cy="25" r="0.45"/><circle cx="27.1" cy="25.4" r="0.42"/></g>' : '') +
      // Keine Brauen unter Fransen: Ein Pony bedeckt die Stirn, und gezeichnete Brauen laegen
      // dann auf dem Haar statt darunter.
      (o.haar === 'pony' ? '' :
        '<path d="M12.9 18 Q15.6 16.7 18.3 17.9 M21.7 17.9 Q24.4 16.7 27.1 18" stroke="'+(o.brauenFarbe || o.haarFarbe)+
        '" stroke-width="1.15" fill="none" stroke-linecap="round" opacity=".8"/>') +
      figAugen(15.6, 24.4, 21, 1.7) +
      // Nase: nur ein kurzer Bogen. Mehr braucht ein Gesicht dieser Groesse nicht, und alles
      // Groessere zieht den Blick von den Augen weg.
      '<path d="M19.4 23.6 Q20.3 24.6 19.2 25" stroke="'+FIG_INK+'" stroke-width="0.9" fill="none" '+
        'stroke-linecap="round" opacity=".45"/>' +
      figMund(o.mund || 'laecheln', FIG_INK, 1.35) +
      (o.brille ? '<g fill="none" stroke="'+(o.brilleFarbe || '#4A4038')+'" stroke-width="1.1">'+
         '<circle cx="15.6" cy="21" r="3.9"/><circle cx="24.4" cy="21" r="3.9"/>'+
         '<path d="M19.5 20.6 Q20 20.1 20.5 20.6" stroke-linecap="round"/>'+
         '<path d="M11.7 20.2 L9.2 19.6 M28.3 20.2 L30.8 19.6" stroke-linecap="round"/></g>' : '') +
      (o.bart ? '<path d="M12.6 24 C12.6 32 16 34.6 20 34.6 C24 34.6 27.4 32 27.4 24 '+
                'C27.4 28 24 29.6 20 29.6 C16 29.6 12.6 28 12.6 24 Z" fill="'+o.haarFarbe+'"/>' : '');
  }

  // Die Figuren. Reihenfolge: erst Menschen, dann Tiere — wer sich selbst sucht, sucht nicht
  // zuerst nach einem Fuchs. Jede traegt jetzt eine eigene Miene; dieselbe Frisur mit einem
  // anderen Mund ist ein anderer Mensch.
  var FIGUREN = [
    {id:'m1', feld:'#F3E3D3', svg:function(){ return figMensch({haut:'#E8BE9A', haar:'kurzhaar', haarFarbe:'#3A2A20', mund:'laecheln'}); }},
    {id:'m2', feld:'#EFE0EA', svg:function(){ return figMensch({haut:'#F0CBAA', haar:'lang', haarFarbe:'#8A4B2A', mund:'breit'}); }},
    {id:'m3', feld:'#E2E7DC', svg:function(){ return figMensch({haut:'#8D5A3B', haar:'locken', haarFarbe:'#2B1D17', mund:'breit'}); }},
    {id:'m4', feld:'#DDE6EC', svg:function(){ return figMensch({haut:'#E5B98F', haar:'tuch', haarFarbe:'#3E6B74', brauenFarbe:'#4A3226', mund:'sanft'}); }},
    {id:'m5', feld:'#EDE6DA', svg:function(){ return figMensch({haut:'#C98F62', haar:'dutt', haarFarbe:'#4A3226', mund:'laecheln'}); }},
    {id:'m6', feld:'#E7E2F0', svg:function(){ return figMensch({haut:'#EFC9A6', haar:'kurzhaar', haarFarbe:'#6B6B6B', bart:true, mund:'sanft'}); }},
    // Runde 83 dazu: mehr Haarfarben und mehr Gesichter, ausdruecklich gewuenscht.
    {id:'m7', feld:'#F4EEDC', svg:function(){ return figMensch({haut:'#F2D3B4', haar:'lang', haarFarbe:'#DFB25F', brauenFarbe:'#B98F45', mund:'laecheln'}); }},
    {id:'m8', feld:'#F6E4DC', svg:function(){ return figMensch({haut:'#F5D6BE', haar:'locken', haarFarbe:'#C25A2B', brauenFarbe:'#A64A22', sommersprossen:true, mund:'breit'}); }},
    {id:'m9', feld:'#E4E9EF', svg:function(){ return figMensch({haut:'#D9A97C', haar:'pony', haarFarbe:'#241C18', mund:'sanft'}); }},
    {id:'m10', feld:'#EAE7DF', svg:function(){ return figMensch({haut:'#EAC49F', haar:'zopf', haarFarbe:'#7A5A3C', brille:true, mund:'laecheln'}); }},
    {id:'fuchs', feld:'#F6E6D8', svg:function(){ return figTier({ohr:'spitz', fell:'#D97A45', innen:'#F5E2D2', schnauze:'#F8EFE6', wange:'#E9A177', brauen:true}); }},
    {id:'katze', feld:'#E6E4EA', svg:function(){ return figTier({ohr:'spitz', fell:'#8E8B95', innen:'#E3C8CE', schnauze:'#F1EFF3', wange:'#C7A9B2'}); }},
    {id:'baer',  feld:'#EFE3D6', svg:function(){ return figTier({ohr:'rund',  fell:'#A5714B', innen:'#D9A87F', schnauze:'#E7CDB2', brauen:true}); }},
    {id:'panda', feld:'#D8DAD6', svg:function(){ return figTier({ohr:'rund',  fell:'#F4F3F1', innen:'#2A211C', schnauze:'#FFFFFF', auge:2.6,
                  maske:'<ellipse cx="15" cy="20" rx="4.6" ry="5.2" transform="rotate(-14 15 20)" fill="#2A211C"/>'+
                        '<ellipse cx="25" cy="20" rx="4.6" ry="5.2" transform="rotate(14 25 20)" fill="#2A211C"/>'}); }},
    {id:'hase',  feld:'#F1E7EC', svg:function(){ return figTier({ohr:'lang',  fell:'#E4DAD3', innen:'#E7B9C4', schnauze:'#F7F1EE', wange:'#EFC3CD'}); }},
    {id:'reh',   feld:'#EEE7D9', svg:function(){ return figTier({ohr:'geweih',fell:'#C99A6A', innen:'#7A5B3E', schnauze:'#EFE0CD', wange:'#DDB58C',
                  maske:'<g fill="#F4E8D6" opacity=".7"><circle cx="12.4" cy="14.6" r="1.4"/><circle cx="27.6" cy="14.6" r="1.4"/>'+
                        '<circle cx="17.4" cy="12.6" r="1.1"/><circle cx="22.6" cy="12.6" r="1.1"/></g>'}); }},
    // Zwei Hunde. Beide teilen den Kopf-Bauplan und unterscheiden sich in Fell, Schnauze und
    // Miene — genau das, was sie auch in echt unterscheidet.
    {id:'dackel', feld:'#F0E3D2', svg:function(){ return figTier({ohr:'schlapp', fell:'#8C5A33', innen:'#6B4324', schnauze:'#C08B5C', zunge:true, mund:'sanft',
                  maske:'<ellipse cx="20" cy="19" rx="6.4" ry="4.4" fill="#A96E3F" opacity=".55"/>'+
                        '<g fill="#D9A76F" opacity=".85"><ellipse cx="14.4" cy="16.6" rx="2.2" ry="1.6"/><ellipse cx="25.6" cy="16.6" rx="2.2" ry="1.6"/></g>'}); }},
    {id:'retriever', feld:'#F7EBD6', svg:function(){ return figTier({ohr:'schlapp', fell:'#E3B26B', innen:'#C08F4C', schnauze:'#F6E3C4', zunge:true, mund:'breit', brauen:true}); }},
    // Drei, die nicht in den Kopf-Bauplan passen und deshalb eigene Formen bekommen.
    {id:'eule', feld:'#E3E7E4', svg:function(){
       return '<path d="M9 12 L12.5 5 L16.5 10.5 Z" fill="#8B7355"/><path d="M31 12 L27.5 5 L23.5 10.5 Z" fill="#8B7355"/>'+
              '<ellipse cx="20" cy="22" rx="13.5" ry="13" fill="#A08463"/>'+
              figVolumen(20, 22, 13.5, 13)+
              '<circle cx="14.6" cy="20" r="6.2" fill="#F3EADD"/><circle cx="25.4" cy="20" r="6.2" fill="#F3EADD"/>'+
              figAuge(14.6, 20, 3.1) + figAuge(25.4, 20, 3.1)+
              '<path d="M20 24.5 L16.8 29 L23.2 29 Z" fill="#D89A45"/>'+
              '<path d="M11 30 Q20 34.5 29 30" stroke="#8B7355" stroke-width="1.6" fill="none" stroke-linecap="round"/>'; }},
    {id:'wal', feld:'#DCE7EE', svg:function(){
       return '<path d="M17 6 Q20 9 23 6" stroke="#9FC2D8" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
              '<path d="M20 6 L20 10" stroke="#9FC2D8" stroke-width="1.8" stroke-linecap="round"/>'+
              '<ellipse cx="19" cy="23" rx="14" ry="11" fill="#5E8FB0"/>'+
              figVolumen(19, 23, 14, 11)+
              '<path d="M31 19 L37 14 L36 26 Z" fill="#4A7A9A"/>'+
              '<path d="M8 26 Q19 33 30 26 Q19 30 8 26 Z" fill="#CFE2EE"/>'+
              '<ellipse cx="19" cy="27" rx="10" ry="5.5" fill="#CFE2EE"/>'+
              '<path d="M9.6 24.6 Q12.4 26.6 15.4 24.8" stroke="'+FIG_INK+'" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".7"/>'+
              figAuge(13, 21, 2); }},
    {id:'goldfisch', feld:'#FCEAD5', svg:function(){
       return '<path d="M6 22 L1.5 15 L2.4 29 Z" fill="#E8933C"/>'+
              '<path d="M20 9.5 Q23 4 26.5 10.5 Z" fill="#F2AE5C" opacity=".9"/>'+
              '<ellipse cx="21" cy="22" rx="14" ry="11" fill="#F2953A"/>'+
              figVolumen(21, 22, 14, 11)+
              '<path d="M15 27.5 Q21 31.5 27.5 27" stroke="#D97C25" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".55"/>'+
              '<path d="M22.5 30 Q25.5 34.5 29 30 Z" fill="#F2AE5C" opacity=".9"/>'+
              '<path d="M25.6 24.6 Q28 26.6 30.4 24.8" stroke="'+FIG_INK+'" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
              '<circle cx="26.5" cy="19.5" r="3.6" fill="#FFFFFF"/>'+
              figAuge(26.5, 19.5, 2)+
              '<g fill="#FFFFFF" opacity=".5"><circle cx="9.5" cy="12" r="1.5"/><circle cx="13.5" cy="8.5" r="1"/></g>'; }},
    {id:'schildkroete', feld:'#DFEADD', svg:function(){
       return '<ellipse cx="8.5" cy="26" rx="4" ry="3.2" fill="#8FBE7E"/><ellipse cx="31.5" cy="26" rx="4" ry="3.2" fill="#8FBE7E"/>'+
              '<ellipse cx="20" cy="24" rx="14" ry="10.5" fill="#5E8C4A"/>'+
              '<g fill="none" stroke="#48703A" stroke-width="1.1" opacity=".8">'+
              '<path d="M20 13.8 L20 34.4 M8.2 21.5 Q20 24.5 31.8 21.5 M9.4 28.6 Q20 26 30.6 28.6"/></g>'+
              figVolumen(20, 24, 14, 10.5)+
              '<ellipse cx="20" cy="13" rx="7" ry="6.4" fill="#8FBE7E"/>'+
              '<ellipse cx="20" cy="11.2" rx="5" ry="2.8" fill="#FFFFFF" opacity=".15"/>'+
              figAugen(17.4, 22.6, 12.4, 1.6)+
              '<path d="M18 15.8 Q20 17.2 22 15.8" stroke="'+FIG_INK+'" stroke-width="1.1" fill="none" stroke-linecap="round"/>'; }}
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

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

  // Runde 87. Rueckmeldung: "die avatare haben alle den selben gesichtsausdruck bisher. und die
  // avatare koennten etwas realistischer oder besser animiert sein, sie sehen aus wie alte Wii
  // avatare von damals."
  //
  // Beides stimmte, und beides hatte je einen klaren Grund:
  //
  //   MIENE. Seit Runde 83 hatte zwar jede Figur einen eigenen MUND — aber Augen und Brauen
  //   waren bei allen identisch. Der Mund traegt an einem Gesicht die wenigste Mimik; wer den
  //   Ausdruck aendern will, aendert die Augen. Jetzt tragen Lidstellung, Blickrichtung,
  //   Brauenwinkel und Mund je Figur eigene Werte, und keine zwei Figuren teilen alle vier.
  //
  //   WII-ANMUTUNG. Sie kam aus vier Dingen: ein frei schwebender Kopf ohne Koerper, flaechige
  //   Farben ohne Verlauf, ein perfekt kreisrundes schwarzes Auge ohne Lid, und vollstaendige
  //   Symmetrie. Alle vier sind hier angegangen — Schultern statt schwebender Kopf, Verlaeufe
  //   statt Flaechen, Auge mit Iris und Oberlid, und leichte Asymmetrien in Haar und Brauen.
  //   Bei 40 mal 40 Einheiten wird daraus keine Fotografie; es wird eine Zeichnung, die von
  //   einem Menschen stammen koennte statt von einem Baukasten.
  //
  // Der Bauplan bleibt: Kopf, Ohren, Augen und Schnauze folgen EINER Konstruktion, die
  // Unterschiede stecken in den Parametern. Zweiundzwanzig einzeln gezeichnete SVGs waeren
  // zweiundzwanzig Gelegenheiten, dass eine Nase drei Bildpunkte tiefer sitzt als die naechste.

  // Runde 94. Rueckmeldung: "die avatare brauchen eine komplettueberarbeitung mit mehr 3d
  // wirkung und noch mehr voneinander unterschiedlichen gesichtsausdruecken und etwas mehr
  // realismus."
  //
  // Drei Dinge, in dieser Reihenfolge, weil das zweite ohne das erste nicht wirkt:
  //
  //   LICHT. Es gab keins. Auf dem Kopf lag ein LINEARER Verlauf, und ein linearer Verlauf
  //   beschreibt eine schiefe Ebene, keine Kugel — er hat kein Zentrum, also auch keine
  //   Woelbung. Jetzt: ein Kugelverlauf mit dem Licht links oben, ein Kernschatten kurz vor
  //   dem Rand (nicht auf ihm — das ist der Unterschied zwischen Kugel und Scheibe), ein
  //   Lichtsaum an der Schattenseite und ein Schlagschatten auf die Schulter. Die Richtung
  //   stand vorher schon in der Konstruktion des Auges; nur hat sich der Rest nicht daran
  //   gehalten.
  //
  //   TIEFE IM DETAIL. Die Iris war eine einfarbige Scheibe, der Mund ein Strich. Beide sind
  //   die Stellen, an denen ein Gesicht gelesen wird: Die Iris hat jetzt einen Limbusring, ein
  //   Gefaelle nach unten (dort faellt zurueckgeworfenes Licht ein) und zwei Lichtpunkte statt
  //   einem; der Mund hat eine Unterlippe, die Licht faengt, und die offenen Muender haben
  //   Zaehne. Ohne Zaehne ist ein offener Mund ein Loch.
  //
  //   AUSDRUCK. Zehn Mienen auf zweiundzwanzig Figuren heisst, dass die Haelfte sich
  //   wiederholt — und zwei Figuren mit derselben Miene unterscheidet nur noch die Frisur.
  //   Jetzt achtzehn Mienen, jede Figur mit einer eigenen, und zwei neue Stellschrauben
  //   (Lidoeffnung und Irishoehe) als ZAHL statt als Auswahl aus vier Namen.
  //
  // Zwei Sackgassen unterwegs, beide im Bild sofort sichtbar und im Code nicht: Eine Flaeche
  // mit 22 Prozent Deckung hat einen RAND, und ein Rand mitten auf einer Wange ist eine Kante
  // statt Licht. Und ein Lichtsaum, den man als versetzte Kopie HINTER die Form legt, ist ein
  // zweiter Umriss — er gehoert nach innen, also in die Form hineingeschnitten.

  // Verlaeufe brauchen eindeutige Namen: In der Figurenauswahl stehen alle Figuren gleichzeitig
  // im Dokument, und zwei Verlaeufe mit demselben Namen waeren einer.
  var FIG_LAUF = 0, FIG_UID = 'f0';
  function figVerlauf(id, hell, dunkel, x2, y2){
    return '<linearGradient id="'+id+'" x1="0" y1="0" x2="'+(x2 == null ? 0.35 : x2)+'" y2="'+(y2 == null ? 1 : y2)+'">'+
           '<stop offset="0" stop-color="'+hell+'"/><stop offset="1" stop-color="'+dunkel+'"/></linearGradient>';
  }

  // ---------- Licht (Runde 94) ----------
  //
  // Rueckmeldung: "die avatare brauchen eine komplettueberarbeitung mit mehr 3d wirkung und
  // noch mehr voneinander unterschiedlichen gesichtsausdruecken und etwas mehr realismus."
  //
  // Der Grund fuer die Flachheit war ein LICHTMODELL, das es nicht gab. Bis hier lag auf dem
  // Kopf ein linearer Verlauf von oben nach unten und darauf zwei Ellipsen mit 13 und 7 Prozent
  // Deckung. Ein linearer Verlauf beschreibt aber eine schiefe Ebene, keine Kugel: Er hat kein
  // Zentrum, also auch keine Woelbung. Und 13 Prozent auf einer hellen Haut sind rund vier
  // Stufen von 255 — nachgemessen dasselbe Nichts wie beim Strahlenkranz.
  //
  // Was eine gezeichnete Kugel plastisch macht, sind vier Dinge, und sie muessen ZUSAMMEN
  // stimmen, weil jedes einzelne fuer sich wie ein Fleck aussieht:
  //
  //   1. Ein Verlauf mit einem ZENTRUM, das nicht in der Mitte liegt (das Licht steht links
  //      oben, also liegt dort auch die hellste Stelle).
  //   2. Ein Kernschatten, der NICHT am Rand liegt, sondern kurz davor. Genau das unterscheidet
  //      eine Kugel von einer Scheibe mit dunklem Rand.
  //   3. Ein Lichtsaum an der Schattenseite — Licht, das vom Untergrund zurueckgeworfen wird.
  //      Das ist der staerkste einzelne Hinweis auf Rundung, den es gibt, und der billigste:
  //      Dieselbe Form ein halbes Mass nach unten rechts versetzt HINTER die eigentliche legen,
  //      dann schaut genau dort ein heller Streifen hervor.
  //   4. Ein Schlagschatten auf das, worauf die Form steht. Ohne ihn schwebt sie.
  //
  // Die Lichtrichtung ist ueberall dieselbe: von links oben. Sie stand vorher schon in der
  // Konstruktion des Auges (der Lichtpunkt sitzt dort links oben) — nur hat sich der Rest der
  // Figur nicht daran gehalten.
  var FIG_LICHT_X = 0.33, FIG_LICHT_Y = 0.26;
  function figKugel(id, farbe){
    return '<radialGradient id="'+id+'" cx="0.5" cy="0.5" r="0.74" '+
           'fx="'+FIG_LICHT_X+'" fy="'+FIG_LICHT_Y+'">'+
           '<stop offset="0" stop-color="'+figTon(farbe, 1.17)+'"/>'+
           '<stop offset="0.38" stop-color="'+figTon(farbe, 1.06)+'"/>'+
           '<stop offset="0.74" stop-color="'+farbe+'"/>'+
           '<stop offset="0.93" stop-color="'+figTon(farbe, 0.84)+'"/>'+
           '<stop offset="1" stop-color="'+figTon(farbe, 0.90)+'"/>'+
           '</radialGradient>';
  }
  // Der Lichtsaum. Der erste Versuch hat dieselbe Form versetzt HINTER die eigentliche gelegt —
  // und damit einen zweiten Umriss erzeugt, der an der Schattenseite als heller Rand hervorsah
  // und an der Lichtseite gar nicht. Ein Saum darf den Umriss aber nicht veraendern; er liegt
  // INNEN.
  //
  // Deshalb umgekehrt: Die Form wird ausgeschnitten, mit der Saumfarbe gefuellt, und darauf
  // kommt dieselbe Form mit der eigentlichen Farbe, ein Stueck zum Licht hin verschoben. Was
  // an der Schattenseite nicht mehr ueberdeckt wird, ist der Saum — genau breit genug, um
  // gesehen zu werden, und mit der Aussenkante der Form, nicht daneben.
  var FIG_SAUM_LAUF = 0;
  function figSaum(d, fuellung, saumFarbe){
    var c = FIG_UID + 'sm' + (FIG_SAUM_LAUF++);
    return '<defs><clipPath id="'+c+'"><path d="'+d+'"/></clipPath></defs>'+
           '<g clip-path="url(#'+c+')">'+
             '<path d="'+d+'" fill="'+saumFarbe+'"/>'+
             '<path d="'+d+'" fill="'+fuellung+'" transform="translate(-0.75,-0.95)"/>'+
           '</g>';
  }
  // Der Kernschatten liegt KURZ VOR dem Rand, nicht auf ihm. Als Verlauf, damit er keine Kante
  // hat: Eine Kante waere wieder eine Zeichnung statt einer Woelbung.
  function figKern(id){
    return '<radialGradient id="'+id+'" cx="0.5" cy="0.5" r="0.72" fx="0.68" fy="0.72">'+
           '<stop offset="0.42" stop-color="'+FIG_INK+'" stop-opacity="0"/>'+
           '<stop offset="0.86" stop-color="'+FIG_INK+'" stop-opacity="0.20"/>'+
           '<stop offset="1" stop-color="'+FIG_INK+'" stop-opacity="0.04"/>'+
           '</radialGradient>';
  }
  // Eine Farbe abdunkeln oder aufhellen, ohne eine zweite Farbe von Hand zu waehlen: Der Verlauf
  // auf einem Kopf muss zur Grundfarbe gehoeren, sonst sieht er aus wie ein Fleck.
  function figTon(hex, faktor){
    var m = /^#([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return hex;
    var n = parseInt(m[1], 16), r = (n>>16)&255, g = (n>>8)&255, b = n&255;
    var f = function(v){
      var x = faktor < 1 ? v * faktor : v + (255 - v) * (faktor - 1);
      return Math.max(0, Math.min(255, Math.round(x)));
    };
    return '#' + [f(r), f(g), f(b)].map(function(v){ return ('0'+v.toString(16)).slice(-2); }).join('');
  }

  // ---------- Das Auge ----------
  // Der groesste einzelne Unterschied zwischen "Piktogramm" und "Gesicht". Ein volles schwarzes
  // Rund ist ein Loch; ein Auge hat ein Weiss, eine farbige Iris, eine Pupille, einen Lichtpunkt
  // und — das Entscheidende — ein OBERLID. Wo das Lid steht, entsteht der Ausdruck: hoch heisst
  // wach, tief heisst ruhig oder muede, ganz zu heisst zufrieden.
  //
  // Der Lichtpunkt sitzt bei allen links oben, weil das Licht in dieser Zeichnung immer von dort
  // kommt. Die Blickrichtung dagegen darf abweichen — ein Blick leicht zur Seite ist einer der
  // billigsten und staerksten Belebungstricks, solange BEIDE Augen in dieselbe Richtung sehen.
  function figAuge(x, y, r, o){
    o = o || {};
    var art = o.blick || 'offen';
    var haut = o.haut || '#E8BE9A';
    if (art === 'zu' || art === 'schmal'){
      // Zugekniffen: ein Bogen nach oben, mit einer feinen helleren Linie darunter — das
      // geschlossene Lid hat eine Kante und eine Woelbung, nicht nur einen Strich.
      var hoch = art === 'zu' ? r * 1.0 : r * 0.62;
      var bogen = function(dy, farbe, w, deck){
        return '<path d="M'+(x-r*1.2).toFixed(2)+' '+(y+r*0.34+dy).toFixed(2)+
               ' Q'+x.toFixed(2)+' '+(y-hoch+dy).toFixed(2)+' '+(x+r*1.2).toFixed(2)+' '+(y+r*0.34+dy).toFixed(2)+
               '" stroke="'+farbe+'" stroke-width="'+w.toFixed(2)+'" fill="none" stroke-linecap="round"'+
               (deck != null ? ' opacity="'+deck+'"' : '')+'/>';
      };
      return bogen(0, FIG_INK, r*0.5) + bogen(r*0.44, figTon(haut, 1.14), r*0.24, 0.7);
    }
    // Wie weit das Lid offen steht. Als ZAHL statt als Auswahl aus vier Namen: Der Ausdruck
    // liegt zwischen den Stufen, nicht auf ihnen.
    var offen = art === 'weit' ? 1.30 : (art === 'halb' ? 0.80 : 1.06);
    if (o.oeffnung != null) offen = o.oeffnung;
    var ry = r * offen, rx = r * 0.99;
    var seit = (o.seite || 0) * r * 0.34;
    var hoehe = (o.hoehe || 0) * r * 0.22;
    var ix = x + seit, iy = y + hoehe + (offen < 0.9 ? r * 0.06 : r * 0.03);
    var iris = o.iris || '#4A352A';
    var ir = Math.min(rx, ry) * (offen < 0.9 ? 0.76 : 0.86);
    var gA = FIG_UID + 'ir' + (FIG_AUGE_LAUF++);
    var gW = gA + 'w';
    // Die Iris ist keine Scheibe. Sie hat einen dunklen Rand (den Limbusring), wird zur Mitte
    // hin heller und ist UNTEN am hellsten: Dort faellt das Licht ein, das von unten in das
    // Auge zurueckgeworfen wird. Ohne dieses Gefaelle bleibt jede Iris ein farbiger Punkt.
    var defs = '<defs>'+
      '<radialGradient id="'+gA+'" cx="0.5" cy="0.62" r="0.62">'+
        '<stop offset="0" stop-color="'+figTon(iris, 1.42)+'"/>'+
        '<stop offset="0.55" stop-color="'+iris+'"/>'+
        '<stop offset="0.88" stop-color="'+figTon(iris, 0.62)+'"/>'+
        '<stop offset="1" stop-color="'+figTon(iris, 0.45)+'"/>'+
      '</radialGradient>'+
      // Das Weiss ist nicht weiss: Oben liegt der Schatten des Oberlids, unten steht es hell.
      '<radialGradient id="'+gW+'" cx="0.5" cy="0.78" r="0.78">'+
        '<stop offset="0" stop-color="#FFFDF9"/>'+
        '<stop offset="0.62" stop-color="#F4EFE6"/>'+
        '<stop offset="1" stop-color="#D9CEBF"/>'+
      '</radialGradient>'+
    '</defs>';
    return defs +
      '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx.toFixed(2)+'" ry="'+ry.toFixed(2)+'" fill="url(#'+gW+')"/>'+
      '<circle cx="'+ix.toFixed(2)+'" cy="'+iy.toFixed(2)+'" r="'+ir.toFixed(2)+'" fill="url(#'+gA+')"/>'+
      // Der Limbusring als eigene Linie: Er trennt die Iris vom Weiss und ist der Unterschied
      // zwischen einem gemalten Auge und einem aufgeklebten Punkt.
      '<circle cx="'+ix.toFixed(2)+'" cy="'+iy.toFixed(2)+'" r="'+(ir*0.94).toFixed(2)+'" fill="none" stroke="'+
        figTon(iris, 0.42)+'" stroke-width="'+(ir*0.16).toFixed(2)+'" opacity=".75"/>'+
      '<circle cx="'+ix.toFixed(2)+'" cy="'+iy.toFixed(2)+'" r="'+(ir*0.46).toFixed(2)+'" fill="#120C08"/>'+
      // Zwei Lichtpunkte statt einem: der grosse dort, wo die Lichtquelle steht, der winzige
      // gegenueber als zweite Spiegelung. Ein einzelner Punkt liest sich als Aufkleber, zwei
      // lesen sich als nasse Oberflaeche.
      '<circle cx="'+(ix - ir*0.40).toFixed(2)+'" cy="'+(iy - ir*0.46).toFixed(2)+'" r="'+(ir*0.34).toFixed(2)+'" fill="#FFFFFF" opacity=".96"/>'+
      '<circle cx="'+(ix + ir*0.42).toFixed(2)+'" cy="'+(iy + ir*0.40).toFixed(2)+'" r="'+(ir*0.15).toFixed(2)+'" fill="#FFFFFF" opacity=".55"/>'+
      // Der Schatten, den das Oberlid auf den Augapfel wirft. Er liegt AUF dem Auge und ist der
      // Grund, warum ein Auge in einer Hoehle sitzt statt auf dem Gesicht zu kleben.
      '<path d="M'+(x-rx).toFixed(2)+' '+(y - ry*0.30).toFixed(2)+
        ' Q'+x+' '+(y - ry*1.30).toFixed(2)+' '+(x+rx).toFixed(2)+' '+(y - ry*0.30).toFixed(2)+
        ' Q'+x+' '+(y - ry*0.55).toFixed(2)+' '+(x-rx).toFixed(2)+' '+(y - ry*0.30).toFixed(2)+' Z" '+
        'fill="'+FIG_INK+'" opacity=".16"/>'+
      // Die Wimpernkante: der dunkle Rand des Oberlids.
      '<path d="M'+(x-rx*1.06).toFixed(2)+' '+(y - ry*(offen<0.9?0.06:0.52)).toFixed(2)+
      ' Q'+x+' '+(y - ry*(offen>1.2?1.52:1.30)).toFixed(2)+' '+(x+rx*1.06).toFixed(2)+' '+(y - ry*(offen<0.9?0.06:0.52)).toFixed(2)+
      '" stroke="'+FIG_INK+'" stroke-width="'+(r*(offen<0.9?0.40:0.34)).toFixed(2)+'" fill="none" stroke-linecap="round"/>'+
      // Das Unterlid, sehr hell und sehr fein: die Kante, auf der das Auge aufliegt.
      '<path d="M'+(x-rx*0.82).toFixed(2)+' '+(y + ry*0.92).toFixed(2)+
      ' Q'+x+' '+(y + ry*1.16).toFixed(2)+' '+(x+rx*0.82).toFixed(2)+' '+(y + ry*0.92).toFixed(2)+
      '" stroke="'+figTon(haut, 1.16)+'" stroke-width="'+(r*0.22).toFixed(2)+'" fill="none" stroke-linecap="round" opacity=".85"/>';
  }
  var FIG_AUGE_LAUF = 0;
  function figAugen(x1, x2, y, r, o){
    return '<g class="fig-augen">' + figAuge(x1, y, r, o) + figAuge(x2, y, r, o) + '</g>';
  }

  // Licht oben, Schatten unten. Beides sehr zurueckhaltend: Es soll Koerper geben, nicht
  // auffallen — ab etwa 0,2 Deckkraft sieht es nach Verschmutzung aus.
  // Runde 94, zweiter Anlauf. Die beiden Ellipsen lagen bei 13 und 7 Prozent Deckung — auf
  // heller Haut vier von 255 Stufen, also nichts. Der erste Versuch hat schlicht die Deckung
  // erhoeht, und im Bild stand danach eine harte Diagonale quer ueber jedem Gesicht: Eine
  // Ellipse mit 22 Prozent Deckung hat einen RAND, und ein Rand mitten auf einer Wange ist
  // eine Kante, kein Licht.
  //
  // Licht hat keine Kante. Beide Flaechen sind deshalb jetzt Verlaeufe, die nach aussen
  // restlos auslaufen — dieselbe Lehre wie beim Sonnenfaecher in Runde 88, nur ist der Fehler
  // hier nicht die Farbe, sondern die Form gewesen.
  var FIG_VOL_LAUF = 0;
  function figVolumen(cx, cy, rx, ry){
    var a = FIG_UID + 'vl' + (FIG_VOL_LAUF++), b = a + 'd';
    return '<defs>'+
      '<radialGradient id="'+a+'"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.30"/>'+
      '<stop offset="0.55" stop-color="#FFFFFF" stop-opacity="0.13"/>'+
      '<stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>'+
      '<radialGradient id="'+b+'"><stop offset="0" stop-color="'+FIG_INK+'" stop-opacity="0.17"/>'+
      '<stop offset="0.6" stop-color="'+FIG_INK+'" stop-opacity="0.07"/>'+
      '<stop offset="1" stop-color="'+FIG_INK+'" stop-opacity="0"/></radialGradient></defs>'+
      '<ellipse cx="'+(cx - rx*0.24).toFixed(2)+'" cy="'+(cy - ry*0.42).toFixed(2)+'" rx="'+(rx*0.62).toFixed(2)+'" ry="'+(ry*0.44).toFixed(2)+'" fill="url(#'+a+')"/>'+
      '<ellipse cx="'+(cx + rx*0.28).toFixed(2)+'" cy="'+(cy + ry*0.42).toFixed(2)+'" rx="'+(rx*0.66).toFixed(2)+'" ry="'+(ry*0.50).toFixed(2)+'" fill="url(#'+b+')"/>';
  }
  // ---------- Hals und Schultern ----------
  // Der einzelne groesste Schritt weg von der Spielkonsolen-Anmutung. Ein Kopf ohne Koerper
  // schwebt, und alles, was schwebt, liest sich als Symbol. Angeschnitten am unteren Rand, wie
  // ein Portraet: Man sieht keinen ganzen Menschen, man sieht den Ausschnitt eines Bildes.
  function figSchultern(haut, kleid){
    return '<path d="M16.4 30.5 L23.6 30.5 L23.6 34 L16.4 34 Z" fill="'+figTon(haut, 0.86)+'"/>'+
           '<path d="M20 33.4 C13.4 33.4 8.2 36.4 6.6 40 L33.4 40 C31.8 36.4 26.6 33.4 20 33.4 Z" fill="'+kleid+'"/>'+
           // Der Kragenschatten, wo der Hals im Kleidungsstueck verschwindet.
           '<path d="M16.6 33.6 Q20 35.6 23.4 33.6" stroke="'+FIG_INK+'" stroke-width="1" fill="none" opacity=".14"/>';
  }
  // Die Mienen. Bewusst eine kleine, feste Auswahl statt freier Kurven: Vier Muender, die
  // zueinander passen, sind besser als zwanzig, von denen drei schief sitzen.
  function figMund(art, farbe, breite, haut){
    var f = farbe || FIG_INK, w = breite || 1.25;
    var linie = function(d, farbe2, w2, deck){
      return '<path d="'+d+'" stroke="'+(farbe2||f)+'" stroke-width="'+(w2||w)+'" fill="none" stroke-linecap="round" stroke-linejoin="round"'+
             (deck != null ? ' opacity="'+deck+'"' : '')+'/>';
    };
    var flaeche = function(d, farbe2, deck){
      return '<path d="'+d+'" fill="'+(farbe2||f)+'"'+(deck != null ? ' opacity="'+deck+'"' : '')+'/>';
    };
    // Runde 94: Die Muender waren Striche und gefuellte Sicheln — Formen ohne Dicke. Ein Mund
    // hat aber zwei Lippen, und die untere faengt Licht: Genau dieser eine helle Streifen ist
    // der Unterschied zwischen "Strich im Gesicht" und "Mund". Die Lippenfarbe wird aus der
    // Haut abgeleitet statt gewaehlt — zweiundzwanzig von Hand gesetzte Lippenfarben waeren
    // zweiundzwanzig Gelegenheiten, dass eine nicht zum Gesicht passt.
    var lippe = haut ? figTon(haut, 0.82) : '#C98F7E';
    var glanz = haut ? figTon(haut, 1.22) : '#FFFFFF';
    var innen = '#4A241F';
    if (art === 'lachen')
      // Weit offen. Der Rachen ist nicht schwarz, sondern sehr dunkelrot; oben stehen die
      // Zaehne als heller Bogen, unten liegt die Zunge. Ohne die Zaehne ist ein offener Mund
      // ein Loch.
      return flaeche('M14.4 26.6 Q20 25.4 25.6 26.6 Q24.6 33.0 20 33.0 Q15.4 33.0 14.4 26.6 Z', innen) +
             flaeche('M15.4 26.8 Q20 25.9 24.6 26.8 Q20 28.6 15.4 26.8 Z', '#FBF6EF') +
             flaeche('M16.8 30.2 Q20 31.8 23.2 30.2 Q22 33.0 20 33.0 Q18 33.0 16.8 30.2 Z', '#D9707F') +
             linie('M14.4 26.6 Q20 25.4 25.6 26.6', lippe, 0.9, 0.9);
    if (art === 'breit')
      // Breites geschlossenes Lachen: die Zaehne stehen, die Unterlippe faengt Licht.
      return flaeche('M14.8 26.8 Q20 33.2 25.2 26.8 Q20 28.4 14.8 26.8 Z', innen) +
             flaeche('M15.6 27.1 Q20 28.0 24.4 27.1 Q20 29.4 15.6 27.1 Z', '#FBF6EF') +
             linie('M15.2 30.6 Q20 33.0 24.8 30.6', glanz, 0.7, 0.55);
    if (art === 'laecheln')
      // Die Oberlippe traegt die Linie, die Unterlippe das Licht — und zwar DICHT darunter.
      // Im ersten Entwurf lag der Glanz zwei Einheiten tiefer und las sich als zweites Kinn.
      return linie('M15.8 27.6 Q20 31.2 24.2 27.6', f, w * 0.82) +
             linie('M17.0 29.6 Q20 31.4 23.0 29.6', glanz, 0.85, 0.6);
    if (art === 'sanft')
      return linie('M16.6 28.1 Q20 30.3 23.4 28.1', f, w * 0.8) +
             linie('M17.4 29.3 Q20 30.6 22.6 29.3', glanz, 0.75, 0.55);
    if (art === 'strich')
      return linie('M16.8 28.6 L23.2 28.6', f, w) +
             linie('M17.4 29.6 L22.6 29.6', glanz, 0.6, 0.4);
    if (art === 'o')
      // Staunen: ein kleiner offener Mund. Rund, nicht breit, mit Lippenrand.
      return '<ellipse cx="20" cy="28.8" rx="2.1" ry="2.6" fill="'+innen+'"/>'+
             '<ellipse cx="20" cy="29.7" rx="1.2" ry="1.4" fill="#D9707F" opacity=".85"/>'+
             '<ellipse cx="20" cy="28.8" rx="2.1" ry="2.6" fill="none" stroke="'+lippe+'" stroke-width="0.8" opacity=".85"/>';
    if (art === 'schief')
      // Halbes Laecheln, nur auf einer Seite hochgezogen. Die Asymmetrie ist der Punkt.
      return linie('M15.8 28.8 Q19.2 30.2 24.2 26.8', f, w) +
             linie('M16.6 29.9 Q19.4 31.0 23.2 28.3', glanz, 0.7, 0.45);
    if (art === 'klein')
      return linie('M17.8 28.4 Q20 29.8 22.2 28.4', f, w) +
             linie('M18.2 29.3 Q20 30.3 21.8 29.3', glanz, 0.6, 0.4);
    if (art === 'schmollen')
      // Zurueckgenommen. Der erste Entwurf zog die Mundwinkel um 1,8 Einheiten nach unten, und
      // im Bild sah die Figur nicht skeptisch aus, sondern veraergert — derselbe Fehler wie bei
      // den Brauen in Runde 88, nur eine Zeile tiefer. Jetzt fast waagerecht, mit einem
      // hoeheren Mundwinkel auf einer Seite: Das ist Zweifel, nicht Aerger.
      return linie('M16.4 29.0 Q19.4 29.9 23.6 28.5', f, w * 0.85) +
             flaeche('M17.2 29.7 Q19.6 31.0 22.8 29.4 Q19.8 30.2 17.2 29.7 Z', lippe, 0.55);
    if (art === 'zahn')
      // Ein schiefes Grinsen, bei dem auf einer Seite die Zaehne blitzen. Der erste Entwurf
      // setzte EINEN Zahn in die Mitte, und der las sich als Zahnluecke.
      return flaeche('M15.6 27.6 Q20.4 31.4 24.4 27.0 Q20 28.6 15.6 27.6 Z', innen) +
             flaeche('M16.6 27.9 Q20.2 29.2 23.4 27.4 Q20 28.6 16.6 27.9 Z', '#FBF6EF') +
             linie('M16.4 29.6 Q20.2 31.6 23.6 28.9', glanz, 0.7, 0.5);
    // Die Tierschnauze: senkrechter Strich unter der Nase, dann zwei Boegen.
    return linie('M20 26.4 L20 28 M20 28 Q17.4 30.2 15.4 28.4 M20 28 Q22.6 30.2 24.6 28.4', f, w);
  }
  // ---------- Die Mienen ----------
  //
  // Rueckmeldung Runde 88: "haben keine expression in den gesichtsausdruecken." Das stimmte,
  // obwohl seit Runde 87 jede Figur eigene Werte fuer Lid, Braue und Mund trug — und der Grund
  // ist genau das: EIGENE Werte, aber unabhaengig voneinander gewaehlt.
  //
  // So funktioniert ein Gesicht nicht. Eine Miene ist ein Zusammenspiel: Wer lacht, kneift die
  // Augen zusammen und hebt die Brauen; wer staunt, reisst die Augen auf UND oeffnet den Mund.
  // Eine halbgeschlossene Lidstellung mit hochgezogenen Brauen und einem breiten Lachen ist
  // keine Emotion, sondern drei Einstellungen — und genau so sah es aus.
  //
  // Deshalb gibt es jetzt zehn benannte Mienen. Eine Figur waehlt EINE davon; Lid, Braue,
  // Blickrichtung und Mund kommen zusammen daraus. Zehn stimmige Ausdruecke sind mehr wert als
  // hundert Kombinationen, von denen neunzig nach nichts aussehen.
  // Runde 94: Zehn Mienen auf zweiundzwanzig Figuren heisst, dass die Haelfte sich wiederholt —
  // und zwei Figuren mit derselben Miene unterscheidet nur noch die Frisur. Jetzt achtzehn, und
  // jede Figur traegt eine EIGENE. Dazu zwei neue Stellschrauben, die es vorher nicht gab:
  //
  //   oeffnung — wie weit das Lid steht, als Zahl statt als Auswahl aus vier Namen. Der
  //              Unterschied zwischen 0,74 und 0,86 ist im Gesicht deutlich sichtbar und liegt
  //              zwischen den alten Stufen, nicht auf ihnen.
  //   hoehe    — wohin die Iris im Auge steht, senkrecht. Nach oben heisst versonnen, nach
  //              unten heisst zurueckhaltend. Das ist der billigste Ausdruck ueberhaupt: eine
  //              Verschiebung um ein halbes Mass, und dasselbe Gesicht ist ein anderes.
  var MIENEN = {
    freude:        {blick:'zu',    braue:'hoch',    mund:'lachen'},
    staunen:       {blick:'weit',  braue:'hoch',    mund:'o'},
    neugier:       {blick:'offen', braue:'gehoben', mund:'schief', seite:1},
    ruhe:          {blick:'halb',  braue:'weich',   mund:'sanft'},
    nachdenklich:  {blick:'offen', braue:'schraeg', mund:'klein',  seite:-1},
    schelmisch:    {blick:'schmal',braue:'gehoben', mund:'schief'},
    zufrieden:     {blick:'zu',    braue:'weich',   mund:'laecheln'},
    warm:          {blick:'offen', braue:'weich',   mund:'laecheln', oeffnung:1.02},
    wach:          {blick:'weit',  braue:'neutral', mund:'breit'},
    versonnen:     {blick:'halb',  braue:'hoch',    mund:'klein',  seite:1, hoehe:-1},
    // Die acht neuen.
    stolz:         {blick:'offen', braue:'neutral', mund:'klein',  oeffnung:0.92, hoehe:-0.6},
    skeptisch:     {blick:'offen', braue:'gehoben', mund:'schmollen', seite:-1, oeffnung:0.84},
    verschmitzt:   {blick:'schmal',braue:'weich',   mund:'zahn'},
    traeumerisch:  {blick:'halb',  braue:'hoch',    mund:'sanft', hoehe:-1.2, seite:-1},
    entschlossen:  {blick:'offen', braue:'schraeg', mund:'strich', oeffnung:0.96},
    begeistert:    {blick:'weit',  braue:'hoch',    mund:'breit', oeffnung:1.34},
    scheu:         {blick:'halb',  braue:'weich',   mund:'klein', seite:-1, hoehe:1, oeffnung:0.78},
    belustigt:     {blick:'schmal',braue:'neutral', mund:'breit'}
  };
  // Setzt die vier Werte aus der Miene, ohne ausdrueckliche Angaben zu ueberschreiben: Der
  // Dackel traegt seine Flecken statt Brauen, und das soll die Miene nicht zurueckholen.
  function mieneAnwenden(o){
    var m = MIENEN[o.miene];
    if (!m) return o;
    if (o.blick == null) o.blick = m.blick;
    if (o.braue == null) o.braue = m.braue;
    if (o.mund  == null) o.mund  = m.mund;
    if (o.seite == null && m.seite != null) o.seite = m.seite;
    if (o.hoehe == null && m.hoehe != null) o.hoehe = m.hoehe;
    if (o.oeffnung == null && m.oeffnung != null) o.oeffnung = m.oeffnung;
    return o;
  }

  // ---------- Die Brauen ----------
  // Nach den Augen der zweitstaerkste Traeger der Miene, und der einzige, der ohne weitere
  // Formen auskommt. Vier Stellungen; 'gehoben' hebt nur EINE Braue — das ist die eine Stelle,
  // an der Asymmetrie nicht nach Fehler aussieht, sondern nach Charakter.
  function figBrauen(art, x1, x2, y, farbe, breite, deckung){
    if (art === 'keine') return '';
    var b = breite || 1.15, d = deckung == null ? 0.8 : deckung;
    var l, r;
    // Der Ausschlag ist bewusst klein. Im ersten Entwurf lag er bei 1,3 bis 1,6 Einheiten, und
    // im Bild sah die Haelfte der Figuren wuetend aus: Bei einem Gesicht von zwoelf Einheiten
    // Breite ist eine Braue, die um anderthalb Einheiten kippt, ein Zornesblick. Und die beiden
    // schraegen Stellungen waren vertauscht — innen TIEF ist boese, innen HOCH ist weich.
    if (art === 'hoch'){        l = [-0.8, -0.8]; r = [-0.8, -0.8]; }   // beide hoch: offen
    else if (art === 'weich'){   l = [0.35, -0.5]; r = [-0.5, 0.35]; }  // innen hoch: freundlich
    else if (art === 'schraeg'){ l = [-0.6, 0.25]; r = [0.25, -0.6]; }  // innen leicht tief: konzentriert
    else if (art === 'gehoben'){ l = [0, 0];       r = [-1.0, -1.0]; }  // eine hoch: neugierig
    else if (!art || art === 'neutral'){ l = [0, 0]; r = [0, 0]; }
    // Ein unbekannter Wert ist ein Tippfehler und keine Miene: Er zeichnet nichts, statt
    // stillschweigend als "neutral" durchzugehen. So faellt er beim Ansehen auf.
    else return '';
    var bogen = function(cx, v){
      var xa = cx - 2.7, xb = cx + 2.7;
      return 'M'+xa.toFixed(2)+' '+(y + v[0]).toFixed(2)+
             ' Q'+cx.toFixed(2)+' '+(y - 1.15 + (v[0]+v[1])/2).toFixed(2)+
             ' '+xb.toFixed(2)+' '+(y + v[1]).toFixed(2);
    };
    return '<path d="'+bogen(x1, l)+' '+bogen(x2, r)+'" stroke="'+farbe+'" stroke-width="'+b+
           '" fill="none" stroke-linecap="round" opacity="'+d+'"/>';
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
    mieneAnwenden(o);
    var g = FIG_UID + 'fell', gk = FIG_UID + 'fkern';
    var TKOPF = 'M20 9 C27.5 9 33.5 14.6 33.5 21.5 C33.5 28.4 27.5 34 20 34 '+
                'C12.5 34 6.5 28.4 6.5 21.5 C6.5 14.6 12.5 9 20 9 Z';
    return '<defs>'+figKugel(g, o.fell)+figKern(gk)+'</defs>' +
      // Ein angedeuteter Koerper unter dem Kopf, angeschnitten wie beim Menschen. Ohne ihn
      // schwebt auch ein Tierkopf.
      '<path d="M20 31 C12.6 31 7.2 34.8 5.8 40 L34.2 40 C32.8 34.8 27.4 31 20 31 Z" fill="'+figTon(o.fell, 0.82)+'"/>' +
      '<ellipse cx="20" cy="34.6" rx="8.4" ry="2.8" fill="'+FIG_INK+'" opacity=".20"/>' +
      figOhren(o.ohr, o.fell, o.innen) +
      figSaum(TKOPF, 'url(#'+g+')', figTon(o.fell, 1.28)) +
      '<path d="'+TKOPF+'" fill="url(#'+gk+')"/>' +
      (o.maske ? o.maske : '') +
      (o.wange ? '<ellipse cx="9.8" cy="24.5" rx="3" ry="2.2" fill="'+o.wange+'" opacity=".75"/>'+
                 '<ellipse cx="30.2" cy="24.5" rx="3" ry="2.2" fill="'+o.wange+'" opacity=".75"/>' : '') +
      '<ellipse cx="20" cy="26.5" rx="7.5" ry="6" fill="'+o.schnauze+'"/>' +
      // Brauen: bei Tieren sehr fein — sie tragen fast die ganze Miene, und zu kraeftig
      // gezeichnet sieht jedes Tier boese aus.
      figBrauen(o.braue || 'keine', 15, 25, 16.4, FIG_INK, 0.9, 0.45) +
      figAugen(15, 25, 20, o.auge || 2.3, {blick:o.blick, iris:o.iris || figTon(o.fell, 0.55), seite:o.seite, hoehe:o.hoehe, oeffnung:o.oeffnung, haut:o.schnauze}) +
      '<ellipse cx="20" cy="25" rx="2.1" ry="1.5" fill="'+FIG_INK+'"/>' +
      '<ellipse cx="19.4" cy="24.6" rx="0.7" ry="0.45" fill="#FFFFFF" opacity=".45"/>' +
      figMund(o.mund, FIG_INK, 1.1, o.schnauze) +
      (o.zunge ? '<path d="M18.6 29.4 Q20 32.6 21.4 29.4 Z" fill="#E4899A"/>' : '');
  }
  // Menschen: Kopf, Haar, Gesicht. Die Haarform ist der groesste Unterschied, aber nicht mehr
  // der einzige — Brauen, Miene, Sommersprossen und Brille tragen jetzt genauso viel.
  function figMensch(o){
    mieneAnwenden(o);
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
    var gh = FIG_UID + 'haut', gk = FIG_UID + 'kern', gs = FIG_UID + 'nase';
    var KOPF = 'M20 8.2 C27.2 8.2 31.6 13.2 31.6 20.4 C31.6 25.6 29.8 29.6 27 32 '+
               'C25 33.7 22.6 34.6 20 34.6 C17.4 34.6 15 33.7 13 32 C10.2 29.6 8.4 25.6 8.4 20.4 '+
               'C8.4 13.2 12.8 8.2 20 8.2 Z';
    return '<defs>'+figKugel(gh, o.haut)+figKern(gk)+
      '<radialGradient id="'+gs+'"><stop offset="0" stop-color="'+FIG_INK+'" stop-opacity="0.13"/>'+
      '<stop offset="1" stop-color="'+FIG_INK+'" stop-opacity="0"/></radialGradient>'+'</defs>' +
      figSchultern(o.haut, o.kleid || '#6E7F73') +
      // Der Schatten, den der Kopf auf die Schulter wirft. Ohne ihn liegt der Kopf nicht auf
      // dem Koerper, er steht davor.
      '<ellipse cx="20" cy="35.4" rx="7.4" ry="2.6" fill="'+FIG_INK+'" opacity=".22"/>' +
      // Die Ohren liegen HINTER dem Kopf: Sichtbar bleibt nur, was seitlich hervorsteht.
      // Davor standen sie darauf und sahen aus wie angeklebte Knoepfe.
      '<ellipse cx="9.2" cy="22.8" rx="2.1" ry="2.9" fill="'+figTon(o.haut, 0.90)+'"/>'+
      '<ellipse cx="30.8" cy="22.8" rx="2.1" ry="2.9" fill="'+figTon(o.haut, 0.84)+'"/>'+
      figSaum(KOPF, 'url(#'+gh+')', figTon(o.haut, 1.30)) +
      // Der Kopf ist keine Ellipse mehr, sondern eine Form mit Kinn: oben breit, zur Mitte
      // leicht eingezogen, unten gerundet auslaufend. Eine reine Ellipse hat kein Gesicht,
      // sie hat einen Umriss — das war einer der vier Gruende fuer die Baukasten-Anmutung.
      '<path d="'+KOPF+'" fill="url(#'+gk+')"/>' +
      // Hier standen zwei Striche fuer Wangenknochen und Kiefer. Im vergroesserten Bild lasen
      // sie sich als Kratzer auf der Wange: Eine Linie mit 7 Prozent Deckung ist bei dieser
      // Groesse immer noch eine LINIE, und ein Gesicht hat dort keine. Die Woelbung tragen der
      // Kugelverlauf und der Kernschatten; mehr braucht es nicht.

      // Ohren, angedeutet. Sie fehlten ganz — und ein Kopf ohne Ohren ist ein Ei.

      haar + haarVorn +
      // Der Schatten, den das Haar auf die Stirn wirft. Zwei Zeilen, und das Haar liegt AUF dem
      // Kopf statt daneben.
      (o.haar ? '<path d="M11 15.2 Q20 19.6 29 15.2 Q20 13.4 11 15.2 Z" fill="'+FIG_INK+'" opacity=".08"/>' : '') +
      (o.wange !== false ? '<ellipse cx="12.4" cy="25" rx="2.5" ry="1.8" fill="#E08C7E" opacity=".3"/>'+
                           '<ellipse cx="27.6" cy="25" rx="2.5" ry="1.8" fill="#E08C7E" opacity=".3"/>' : '') +
      // Sommersprossen in einem warmen Ton statt in der Tinte: Grau auf heller Haut liest sich
      // als Schmutz, und genau so sah es im vergroesserten Bild aus.
      (o.sommersprossen ? '<g fill="'+figTon(o.haut, 0.66)+'" opacity=".55">'+
         '<circle cx="14.6" cy="24.2" r="0.34"/><circle cx="16.3" cy="25.1" r="0.30"/><circle cx="13.2" cy="25.5" r="0.28"/>'+
         '<circle cx="15.4" cy="26.0" r="0.26"/><circle cx="25.4" cy="24.2" r="0.34"/><circle cx="23.7" cy="25.1" r="0.30"/>'+
         '<circle cx="26.8" cy="25.5" r="0.28"/><circle cx="24.6" cy="26.0" r="0.26"/>'+
         '<circle cx="20" cy="26.2" r="0.24"/></g>' : '') +
      // Keine Brauen unter Fransen: Ein Pony bedeckt die Stirn, und gezeichnete Brauen laegen
      // dann auf dem Haar statt darunter.
      (o.haar === 'pony' ? '' :
        figBrauen(o.braue, 15.6, 24.4, 17.9, (o.brauenFarbe || o.haarFarbe), 1.15, 0.8)) +
      figAugen(15.6, 24.4, 20.8, o.augeR || 2.15, {blick:o.blick, iris:o.iris || '#4A352A', seite:o.seite, hoehe:o.hoehe, oeffnung:o.oeffnung, haut:o.haut}) +
      // Nase: nur ein kurzer Bogen. Mehr braucht ein Gesicht dieser Groesse nicht, und alles
      // Groessere zieht den Blick von den Augen weg.
      // Die Nase traegt jetzt beides: den Schatten auf ihrer rechten Seite (das Licht kommt von
      // links) und einen Lichtpunkt auf dem Ruecken. Erst der Schatten macht aus dem Bogen eine
      // Form, die aus dem Gesicht heraussteht.
      // Der Schatten neben der Nase, als weiche Flaeche statt als Strich. Ein Strich waere
      // wieder eine Zeichnung; hier soll nur die rechte Seite der Nase etwas dunkler stehen,
      // weil das Licht von links kommt.
      '<ellipse cx="21.3" cy="23.8" rx="1.5" ry="2.2" fill="url(#'+gs+')"/>' +
      '<path d="M19.4 23.6 Q20.3 24.6 19.2 25" stroke="'+FIG_INK+'" stroke-width="0.9" fill="none" '+
        'stroke-linecap="round" opacity=".45"/>' +
      figMund(o.mund || 'laecheln', FIG_INK, 1.35, o.haut) +
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
    // Runde 87: Jede Figur traegt jetzt VIER eigene Werte statt einem — Lidstellung (blick),
    // Brauenstellung (braue), Blickrichtung (seite) und Mund. Keine zwei teilen alle vier, und
    // die Augenfarbe (iris) kommt dazu. Vorher unterschied sie nur der Mund, und der traegt an
    // einem Gesicht die wenigste Mimik: Deshalb sahen zweiundzwanzig Figuren gleich aus,
    // obwohl sie es auf dem Papier nicht waren.
    {id:'m1',  feld:'#F3E3D3', svg:function(){ return figMensch({miene:'warm', haut:'#E8BE9A', haar:'kurzhaar', haarFarbe:'#3A2A20',
                  iris:'#4A352A', kleid:'#5E7466',}); }},
    {id:'m2',  feld:'#EFE0EA', svg:function(){ return figMensch({miene:'begeistert', haut:'#F0CBAA', haar:'lang', haarFarbe:'#8A4B2A',
                  iris:'#3E6B5A', kleid:'#8A6E82',}); }},
    {id:'m3',  feld:'#E2E7DC', svg:function(){ return figMensch({miene:'neugier', haut:'#8D5A3B', haar:'locken', haarFarbe:'#2B1D17',
                  iris:'#3A2A20', kleid:'#4F6B5E',}); }},
    {id:'m4',  feld:'#DDE6EC', svg:function(){ return figMensch({miene:'traeumerisch', haut:'#E5B98F', haar:'tuch', haarFarbe:'#3E6B74', brauenFarbe:'#4A3226',
                  iris:'#43352C', kleid:'#3E6B74',}); }},
    {id:'m5',  feld:'#EDE6DA', svg:function(){ return figMensch({miene:'freude', haut:'#C98F62', haar:'dutt', haarFarbe:'#4A3226',
                  iris:'#4A352A', kleid:'#7A6A52',}); }},
    {id:'m6',  feld:'#E7E2F0', svg:function(){ return figMensch({miene:'entschlossen', haut:'#EFC9A6', haar:'kurzhaar', haarFarbe:'#6B6B6B', bart:true,
                  iris:'#546B78', kleid:'#5A5F72',}); }},
    // Runde 83 dazu: mehr Haarfarben und mehr Gesichter, ausdruecklich gewuenscht.
    {id:'m7',  feld:'#F4EEDC', svg:function(){ return figMensch({miene:'stolz', haut:'#F2D3B4', haar:'lang', haarFarbe:'#DFB25F', brauenFarbe:'#B98F45',
                  iris:'#4E7C8C', kleid:'#C79A5E',}); }},
    {id:'m8',  feld:'#F6E4DC', svg:function(){ return figMensch({miene:'staunen', haut:'#F5D6BE', haar:'locken', haarFarbe:'#C25A2B', brauenFarbe:'#A64A22',
                  sommersprossen:true, iris:'#4C7A46', kleid:'#A5644A',}); }},
    {id:'m9',  feld:'#E4E9EF', svg:function(){ return figMensch({miene:'skeptisch', haut:'#D9A97C', haar:'pony', haarFarbe:'#241C18',
                  iris:'#3A2A20', kleid:'#4A5A6B',}); }},
    {id:'m10', feld:'#EAE7DF', svg:function(){ return figMensch({miene:'verschmitzt', haut:'#EAC49F', haar:'zopf', haarFarbe:'#7A5A3C', brille:true,
                  iris:'#5E6B4A', kleid:'#6E6455',}); }},
    {id:'fuchs', feld:'#F6E6D8', svg:function(){ return figTier({miene:'schelmisch', ohr:'spitz', fell:'#D97A45', innen:'#F5E2D2', schnauze:'#F8EFE6',
                  wange:'#E9A177', iris:'#7A4520'}); }},
    {id:'katze', feld:'#E6E4EA', svg:function(){ return figTier({miene:'zufrieden', ohr:'spitz', fell:'#8E8B95', innen:'#E3C8CE', schnauze:'#F1EFF3',
                  wange:'#C7A9B2', iris:'#7A8C4A'}); }},
    {id:'baer',  feld:'#EFE3D6', svg:function(){ return figTier({miene:'ruhe', ohr:'rund',  fell:'#A5714B', innen:'#D9A87F', schnauze:'#E7CDB2', iris:'#4A3220'}); }},
    {id:'panda', feld:'#D8DAD6', svg:function(){ return figTier({miene:'wach', ohr:'rund',  fell:'#F4F3F1', innen:'#2A211C', schnauze:'#FFFFFF', auge:2.6, iris:'#3A302A',
                  maske:'<ellipse cx="15" cy="20" rx="4.6" ry="5.2" transform="rotate(-14 15 20)" fill="#2A211C"/>'+
                        '<ellipse cx="25" cy="20" rx="4.6" ry="5.2" transform="rotate(14 25 20)" fill="#2A211C"/>'}); }},
    {id:'hase',  feld:'#F1E7EC', svg:function(){ return figTier({miene:'scheu', ohr:'lang',  fell:'#E4DAD3', innen:'#E7B9C4', schnauze:'#F7F1EE',
                  wange:'#EFC3CD', iris:'#8C5A66'}); }},
    {id:'reh',   feld:'#EEE7D9', svg:function(){ return figTier({miene:'versonnen', ohr:'geweih',fell:'#C99A6A', innen:'#7A5B3E', schnauze:'#EFE0CD', wange:'#DDB58C', iris:'#3E2C1C',
                  maske:'<g fill="#F4E8D6" opacity=".7"><circle cx="12.4" cy="14.6" r="1.4"/><circle cx="27.6" cy="14.6" r="1.4"/>'+
                        '<circle cx="17.4" cy="12.6" r="1.1"/><circle cx="22.6" cy="12.6" r="1.1"/></g>'}); }},
    // Zwei Hunde. Beide teilen den Kopf-Bauplan und unterscheiden sich in Fell, Schnauze und
    // Miene — genau das, was sie auch in echt unterscheidet.
    {id:'dackel', feld:'#F0E3D2', svg:function(){ return figTier({miene:'nachdenklich', braue:'keine', ohr:'schlapp', fell:'#8C5A33', innen:'#6B4324',
                  schnauze:'#C08B5C', zunge:true, iris:'#4A2E16',
                  maske:'<ellipse cx="20" cy="19" rx="6.4" ry="4.4" fill="#A96E3F" opacity=".55"/>'+
                        '<g fill="#D9A76F" opacity=".85"><ellipse cx="14.4" cy="16.6" rx="2.2" ry="1.6"/><ellipse cx="25.6" cy="16.6" rx="2.2" ry="1.6"/></g>'}); }},
    {id:'retriever', feld:'#F7EBD6', svg:function(){ return figTier({miene:'belustigt', ohr:'schlapp', fell:'#E3B26B', innen:'#C08F4C', schnauze:'#F6E3C4',
                  zunge:true, iris:'#6B4520'}); }},
    // Drei, die nicht in den Kopf-Bauplan passen und deshalb eigene Formen bekommen.
    {id:'eule', feld:'#E3E7E4', svg:function(){
       return '<path d="M20 30 C13.6 30 8.6 33.8 7.4 40 L32.6 40 C31.4 33.8 26.4 30 20 30 Z" fill="#8B7355"/>'+
              '<path d="M9 12 L12.5 5 L16.5 10.5 Z" fill="#8B7355"/><path d="M31 12 L27.5 5 L23.5 10.5 Z" fill="#8B7355"/>'+
              '<ellipse cx="20" cy="22" rx="13.5" ry="13" fill="#A08463"/>'+
              figVolumen(20, 22, 13.5, 13)+
              '<circle cx="14.6" cy="20" r="6.2" fill="#F3EADD"/><circle cx="25.4" cy="20" r="6.2" fill="#F3EADD"/>'+
              // Die Eule sieht als Einzige den Betrachter direkt und weit an — das ist das
              // Einzige, was eine Eule tut.
              figAugen(14.6, 25.4, 20, 3.1, {blick:'weit', iris:'#D89A45'})+
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
              '<g class="fig-augen">'+figAuge(13, 21, 2, {blick:'schmal', iris:'#2E4E66'})+'</g>'; }},
    {id:'goldfisch', feld:'#FCEAD5', svg:function(){
       return '<path d="M6 22 L1.5 15 L2.4 29 Z" fill="#E8933C"/>'+
              '<path d="M20 9.5 Q23 4 26.5 10.5 Z" fill="#F2AE5C" opacity=".9"/>'+
              '<ellipse cx="21" cy="22" rx="14" ry="11" fill="#F2953A"/>'+
              figVolumen(21, 22, 14, 11)+
              '<path d="M15 27.5 Q21 31.5 27.5 27" stroke="#D97C25" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".55"/>'+
              '<path d="M22.5 30 Q25.5 34.5 29 30 Z" fill="#F2AE5C" opacity=".9"/>'+
              '<path d="M25.6 24.6 Q28 26.6 30.4 24.8" stroke="'+FIG_INK+'" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
              '<circle cx="26.5" cy="19.5" r="3.6" fill="#FFFFFF"/>'+
              '<g class="fig-augen">'+figAuge(26.5, 19.5, 2, {blick:'offen', seite:1, iris:'#3A2A1A'})+'</g>'+
              '<g fill="#FFFFFF" opacity=".5"><circle cx="9.5" cy="12" r="1.5"/><circle cx="13.5" cy="8.5" r="1"/></g>'; }},
    {id:'schildkroete', feld:'#DFEADD', svg:function(){
       return '<ellipse cx="8.5" cy="26" rx="4" ry="3.2" fill="#8FBE7E"/><ellipse cx="31.5" cy="26" rx="4" ry="3.2" fill="#8FBE7E"/>'+
              '<ellipse cx="20" cy="24" rx="14" ry="10.5" fill="#5E8C4A"/>'+
              '<g fill="none" stroke="#48703A" stroke-width="1.1" opacity=".8">'+
              '<path d="M20 13.8 L20 34.4 M8.2 21.5 Q20 24.5 31.8 21.5 M9.4 28.6 Q20 26 30.6 28.6"/></g>'+
              figVolumen(20, 24, 14, 10.5)+
              '<ellipse cx="20" cy="13" rx="7" ry="6.4" fill="#8FBE7E"/>'+
              '<ellipse cx="20" cy="11.2" rx="5" ry="2.8" fill="#FFFFFF" opacity=".15"/>'+
              figAugen(17.4, 22.6, 12.4, 1.6, {blick:'offen', iris:'#2E4A22'})+
              '<path d="M18 15.8 Q20 17.2 22 15.8" stroke="'+FIG_INK+'" stroke-width="1.1" fill="none" stroke-linecap="round"/>'; }}
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
  function figurSVG(f){
    // Vor JEDEM Zeichnen eine neue Kennung: In der Figurenauswahl stehen alle Figuren
    // gleichzeitig im Dokument, und zwei Verlaeufe mit demselben Namen waeren einer — die
    // zweite Figur truege dann die Farbe der ersten.
    FIG_UID = 'lf' + (++FIG_LAUF);
    return '<svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true" '+
           'class="figur-svg" style="display:block">'+f.svg()+'</svg>';
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

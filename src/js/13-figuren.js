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
  // Runde 115, Auftrag des Inhabers: "die Tiere in ihrem Modell realistischer, so wie Memojis von
  // Apple". Was Animoji plastisch macht, ist nicht mehr Detail, sondern mehr VOLUMEN: Jede Form
  // sieht aus wie ein beleuchteter Koerper. Die Kugel oben hob den Ton im Licht um 17 % und senkte
  // ihn im Schatten um 16 % — genug fuer eine Woelbung, zu wenig fuer einen Gegenstand. Diese
  // Fassung spannt das Band auf +38 / -30 und legt das Licht weiter nach aussen. Eigene Funktion
  // statt geaenderter Werte, weil figKugel auch an Stellen sitzt, die flacher bleiben sollen.
  function figKugelPlastisch(id, farbe){
    return '<radialGradient id="'+id+'" cx="0.5" cy="0.52" r="0.72" '+
           'fx="'+(FIG_LICHT_X - 0.03)+'" fy="'+(FIG_LICHT_Y - 0.04)+'">'+
           '<stop offset="0" stop-color="'+figTon(farbe, 1.38)+'"/>'+
           '<stop offset="0.30" stop-color="'+figTon(farbe, 1.14)+'"/>'+
           '<stop offset="0.62" stop-color="'+farbe+'"/>'+
           '<stop offset="0.88" stop-color="'+figTon(farbe, 0.72)+'"/>'+
           '<stop offset="1" stop-color="'+figTon(farbe, 0.80)+'"/>'+
           '</radialGradient>';
  }
  // Runde 115: derselbe Koerper fuer die vier Figuren, die nicht in den Kopf-Bauplan passen (Eule,
  // Wal, Goldfisch, Schildkroete). Sie bestanden aus flach gefuellten Ellipsen und standen neben
  // den plastischen Tieren sichtbar flach da. Eine Ellipse mit dem Kugellicht von oben und einem
  // weichen Glanz, der in die Form geschnitten ist — dieselben zwei Mittel wie bei figTier.
  var FIG_PLAST_LAUF = 0;
  function figPlastisch(cx, cy, rx, ry, farbe){
    var id = FIG_UID + 'pl' + (FIG_PLAST_LAUF++), gl = id + 'g', cl = id + 'c';
    return '<defs>'+figKugelPlastisch(id, farbe)+
      '<radialGradient id="'+gl+'"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.48"/>'+
        '<stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.16"/>'+
        '<stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>'+
      '<clipPath id="'+cl+'"><ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'"/></clipPath></defs>'+
      '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="url(#'+id+')"/>'+
      '<g clip-path="url(#'+cl+')"><ellipse cx="'+(cx - rx*0.32).toFixed(2)+'" cy="'+(cy - ry*0.48).toFixed(2)+
        '" rx="'+(rx*0.55).toFixed(2)+'" ry="'+(ry*0.32).toFixed(2)+'" fill="url(#'+gl+')" transform="rotate(-18 '+
        (cx - rx*0.32).toFixed(2)+' '+(cy - ry*0.48).toFixed(2)+')"/></g>';
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
      // Runde 115: Bei den Tieren nur der dunkle Bogen. Die helle Kante darunter ist ein Strich in
      // der Hautfarbe und lag bei Fuchs und Hund als blasses Band unter dem geschlossenen Auge.
      return bogen(0, FIG_INK, r*0.5) + (o.grossIris ? '' : bogen(r*0.44, figTon(haut, 1.14), r*0.24, 0.7));
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
    // Runde 99: Die Iris war zu gross. Bei einem echten Auge fuellt sie rund zwei Drittel der
    // sichtbaren Lidoeffnung, nicht neun Zehntel — der Rest ist Weiss, und genau dieses Weiss
    // links und rechts der Iris ist es, was ein Auge menschlich statt gezeichnet aussehen
    // laesst. Tiere behalten die groessere Iris (o.grossIris), denn bei ihnen stimmt sie.
    var irF = o.grossIris ? (offen < 0.9 ? 0.76 : 0.86) : (offen < 0.9 ? 0.64 : 0.72);
    var ir = Math.min(rx, ry) * irF;
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
      // Runde 116: Katzen und Fuechse haben senkrechte Schlitzpupillen. Es ist das Merkmal, an dem
      // man ein Katzenauge von jedem anderen unterscheidet — mit runder Pupille war die Katze ein
      // Pluesch mit Katzenohren.
      (o.pupille === 'schlitz'
        ? '<ellipse cx="'+ix.toFixed(2)+'" cy="'+iy.toFixed(2)+'" rx="'+(ir*0.20).toFixed(2)+'" ry="'+(ir*0.86).toFixed(2)+'" fill="#120C08"/>'
        : '<circle cx="'+ix.toFixed(2)+'" cy="'+iy.toFixed(2)+'" r="'+(ir*0.46).toFixed(2)+'" fill="#120C08"/>')+
      // Zwei Lichtpunkte statt einem: der grosse dort, wo die Lichtquelle steht, der winzige
      // gegenueber als zweite Spiegelung. Ein einzelner Punkt liest sich als Aufkleber, zwei
      // lesen sich als nasse Oberflaeche.
      '<circle cx="'+(ix - ir*0.40).toFixed(2)+'" cy="'+(iy - ir*0.46).toFixed(2)+'" r="'+(ir*(o.grossIris ? 0.42 : 0.34)).toFixed(2)+'" fill="#FFFFFF" opacity=".96"/>'+
      // Runde 115: Bei den Tieren zusaetzlich das Fensterlicht — ein weicher, breiter Glanz ueber
      // der oberen Haelfte des Augapfels. Das ist das Zeichen der Animoji-Augen: Sie sehen nass
      // und gewoelbt aus, weil auf ihnen die ganze Lichtquelle als Flaeche liegt, nicht nur als
      // Punkt. Als Flaeche mit Deckung und nicht als Strich (siehe CLAUDE.md, zweite Lehre).
      (o.grossIris ? '<ellipse cx="'+(x - rx*0.18).toFixed(2)+'" cy="'+(y - ry*0.38).toFixed(2)+'" rx="'+(rx*0.62).toFixed(2)+
        '" ry="'+(ry*0.30).toFixed(2)+'" fill="#FFFFFF" opacity=".22" transform="rotate(-14 '+x+' '+y+')"/>' : '')+
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
      // Runde 97: die Lidfalte. Der feine Bogen ueber dem Lid, an dem das bewegliche Lid
      // endet und die Augenhoehle beginnt. Ohne sie sitzt ein noch so gut gemaltes Auge auf
      // einer glatten Flaeche; mit ihr liegt es in einer Hoehle. Sie ist der billigste Schritt
      // von "Auge gezeichnet" zu "Auge gebaut" — eine Linie, halb so dunkel wie die
      // Wimpernkante und deutlich weiter oben.
      // Runde 115: Bei den Tieren entfaellt die Lidfalte. Animoji haben keine, und sie ist ein
      // STRICH in der Hautfarbe — auf dem dunklen Augenfleck des Pandas stand sie als blasser
      // Bogen ueber dem Auge. Dieselbe Lehre wie bei Haarglanz und Fellkante.
      (o.grossIris ? '' :
      '<path d="M'+(x-rx*0.94).toFixed(2)+' '+(y - ry*(offen<0.9?0.62:1.02)).toFixed(2)+
      ' Q'+x+' '+(y - ry*(offen>1.2?2.05:1.82)).toFixed(2)+' '+(x+rx*0.94).toFixed(2)+' '+(y - ry*(offen<0.9?0.62:1.02)).toFixed(2)+
      '" stroke="'+figTon(haut, 0.72)+'" stroke-width="'+(r*0.17).toFixed(2)+'" fill="none" stroke-linecap="round" opacity=".55"/>')+
      // Das Unterlid, sehr hell und sehr fein: die Kante, auf der das Auge aufliegt. Runde 115:
      // nicht bei Tieren — auf der hellen Schnauze des Baeren stand es als Strich unter dem Auge.
      (o.grossIris ? '' :
      '<path d="M'+(x-rx*0.82).toFixed(2)+' '+(y + ry*0.92).toFixed(2)+
      ' Q'+x+' '+(y + ry*1.16).toFixed(2)+' '+(x+rx*0.82).toFixed(2)+' '+(y + ry*0.92).toFixed(2)+
      '" stroke="'+figTon(haut, 1.16)+'" stroke-width="'+(r*0.22).toFixed(2)+'" fill="none" stroke-linecap="round" opacity=".85"/>');
  }
  var FIG_AUGE_LAUF = 0;
  // Runde 111: die Neigung der Lidachse, je Figur. Bis hierher war jedes Auge dieselbe Ellipse —
  // verschieden waren nur ihre Groesse, ihre Oeffnung und was DARIN stand. Damit unterschieden
  // sich zehn Gesichter in allem ausser der Augenform, und die Augenform ist das, was man an
  // einem Gesicht zuerst liest.
  //
  // Ein Winkel genuegt dafuer, und zwar der zwischen innerem und aeusserem Augenwinkel: Ob die
  // Achse nach aussen ansteigt (mandelfoermig, wach) oder abfaellt (sanft, muede), ist der
  // groesste Formunterschied, den zwei Augenpaare haben koennen. Gedreht wird um den
  // Augenmittelpunkt und SPIEGELBILDLICH — beide Augen in dieselbe Richtung zu drehen ergaebe
  // ein schiefes Gesicht statt einer Augenform.
  //
  // Die Werte bleiben klein (hoechstens 7 Grad). Darueber wird aus Vielfalt eine Karikatur —
  // dieselbe Grenze, die in Runde 97 schon fuer Augenabstand und Augengroesse gezogen wurde.
  // Tiere geben keine Neigung mit und bleiben damit unveraendert.
  function figAugen(x1, x2, y, r, o){
    var n = (o && o.neigung) || 0;
    var eins = function(x, vz){
      if (!n) return figAuge(x, y, r, o);
      return '<g transform="rotate('+(vz * n).toFixed(2)+' '+x.toFixed(2)+' '+y.toFixed(2)+')">'+
             figAuge(x, y, r, o)+'</g>';
    };
    return '<g class="fig-augen">' + eins(x1, -1) + eins(x2, 1) + '</g>';
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
    // Runde 97: das Philtrum — die Rinne zwischen Nase und Oberlippe. Zwei sehr blasse
    // senkrechte Kanten mit einer helleren Mitte dazwischen. Es steht VOR jedem Mund, weil es
    // zum Gesicht gehoert und nicht zum Mund: Es ist auch da, wenn der Mund geschlossen ist,
    // und es ist der Grund, warum die Partie zwischen Nase und Lippe eine Form hat statt eine
    // Flaeche zu sein. Zusammen mit dem Amorbogen weiter unten ist das die Stelle, an der ein
    // gezeichneter Mund aufhoert, ein Symbol zu sein.
    // Runde 99: Von den drei Linien des Philtrums sind die beiden aeusseren raus. Im
    // vergroesserten Bild standen sie als zwei dunkle Striche unter der Nase und lasen sich
    // als angedeuteter Schnurrbart — bei den Figuren mit heller Haut besonders. Uebrig bleibt
    // nur die HELLE Mitte: Sie zeigt die Rinne, ohne sie zu umranden.
    var rinne = haut ?
      ('<path d="M20 25.9 L20 27.3" stroke="'+figTon(haut, 1.18)+'" stroke-width="0.62" '+
         'fill="none" stroke-linecap="round" opacity=".26"/>') : '';
    // Der Amorbogen: die doppelte Wellung der Oberlippenkante. Nur bei geschlossenen Muendern —
    // bei einem offenen liegt dort die Zahnreihe, und beides uebereinander waere Matsch.
    var bogen = function(y){
      return '<path d="M17.9 '+y+' Q19.1 '+(y-0.34).toFixed(2)+' 20 '+(y-0.06).toFixed(2)+
             ' Q20.9 '+(y-0.34).toFixed(2)+' 22.1 '+y+'" stroke="'+lippe+'" stroke-width="0.46" '+
             'fill="none" stroke-linecap="round" opacity=".62"/>';
    };
    if (art === 'lachen')
      // Weit offen. Der Rachen ist nicht schwarz, sondern sehr dunkelrot; oben stehen die
      // Zaehne als heller Bogen, unten liegt die Zunge. Ohne die Zaehne ist ein offener Mund
      // ein Loch.
      return rinne + flaeche('M14.4 26.6 Q20 25.4 25.6 26.6 Q24.6 33.0 20 33.0 Q15.4 33.0 14.4 26.6 Z', innen) +
             flaeche('M15.4 26.8 Q20 25.9 24.6 26.8 Q20 28.6 15.4 26.8 Z', '#FBF6EF') +
             flaeche('M16.8 30.2 Q20 31.8 23.2 30.2 Q22 33.0 20 33.0 Q18 33.0 16.8 30.2 Z', '#D9707F') +
             linie('M14.4 26.6 Q20 25.4 25.6 26.6', lippe, 0.9, 0.9);
    if (art === 'breit')
      // Breites geschlossenes Lachen: die Zaehne stehen, die Unterlippe faengt Licht.
      return rinne + flaeche('M14.8 26.8 Q20 33.2 25.2 26.8 Q20 28.4 14.8 26.8 Z', innen) +
             flaeche('M15.6 27.1 Q20 28.0 24.4 27.1 Q20 29.4 15.6 27.1 Z', '#FBF6EF') +
             linie('M15.2 30.6 Q20 33.0 24.8 30.6', glanz, 0.7, 0.55);
    if (art === 'laecheln')
      // Die Oberlippe traegt die Linie, die Unterlippe das Licht — und zwar DICHT darunter.
      // Im ersten Entwurf lag der Glanz zwei Einheiten tiefer und las sich als zweites Kinn.
      return rinne + bogen(27.5) +
             linie('M15.8 27.6 Q20 31.2 24.2 27.6', f, w * 0.82) +
             linie('M17.0 29.6 Q20 31.4 23.0 29.6', glanz, 0.85, 0.6);
    if (art === 'sanft')
      return rinne + bogen(28.0) +
             linie('M16.6 28.1 Q20 30.3 23.4 28.1', f, w * 0.8) +
             linie('M17.4 29.3 Q20 30.6 22.6 29.3', glanz, 0.75, 0.55);
    if (art === 'strich')
      return rinne + bogen(28.5) +
             linie('M16.8 28.6 L23.2 28.6', f, w) +
             linie('M17.4 29.6 L22.6 29.6', glanz, 0.6, 0.4);
    if (art === 'o')
      // Staunen: ein kleiner offener Mund. Rund, nicht breit, mit Lippenrand.
      return rinne + '<ellipse cx="20" cy="28.8" rx="2.1" ry="2.6" fill="'+innen+'"/>'+
             '<ellipse cx="20" cy="29.7" rx="1.2" ry="1.4" fill="#D9707F" opacity=".85"/>'+
             '<ellipse cx="20" cy="28.8" rx="2.1" ry="2.6" fill="none" stroke="'+lippe+'" stroke-width="0.8" opacity=".85"/>';
    if (art === 'schief')
      // Halbes Laecheln, nur auf einer Seite hochgezogen. Die Asymmetrie ist der Punkt.
      return rinne + linie('M15.8 28.8 Q19.2 30.2 24.2 26.8', f, w) +
             linie('M16.6 29.9 Q19.4 31.0 23.2 28.3', glanz, 0.7, 0.45);
    if (art === 'klein')
      return rinne + bogen(28.3) +
             linie('M17.8 28.4 Q20 29.8 22.2 28.4', f, w) +
             linie('M18.2 29.3 Q20 30.3 21.8 29.3', glanz, 0.6, 0.4);
    if (art === 'schmollen')
      // Zurueckgenommen. Der erste Entwurf zog die Mundwinkel um 1,8 Einheiten nach unten, und
      // im Bild sah die Figur nicht skeptisch aus, sondern veraergert — derselbe Fehler wie bei
      // den Brauen in Runde 88, nur eine Zeile tiefer. Jetzt fast waagerecht, mit einem
      // hoeheren Mundwinkel auf einer Seite: Das ist Zweifel, nicht Aerger.
      return rinne + linie('M16.4 29.0 Q19.4 29.9 23.6 28.5', f, w * 0.85) +
             flaeche('M17.2 29.7 Q19.6 31.0 22.8 29.4 Q19.8 30.2 17.2 29.7 Z', lippe, 0.55);
    if (art === 'zahn')
      // Ein schiefes Grinsen, bei dem auf einer Seite die Zaehne blitzen. Der erste Entwurf
      // setzte EINEN Zahn in die Mitte, und der las sich als Zahnluecke.
      return rinne + flaeche('M15.6 27.6 Q20.4 31.4 24.4 27.0 Q20 28.6 15.6 27.6 Z', innen) +
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

  // Runde 116: ohrSpitze faerbt die oberen Enden (Fuchs: schwarz), ohrFarbe das ganze Ohr anders als
  // den Kopf (Panda: ganz schwarz). Beides sind die Stellen, an denen man diese Tiere aus der Ferne
  // erkennt.
  function figOhren(art, fell, innen, ohrSpitze){
    if (art === 'spitz')
      return '<path d="M8.5 17 L11 4 L19.5 11.5 Z" fill="'+fell+'"/>'+
             '<path d="M31.5 17 L29 4 L20.5 11.5 Z" fill="'+fell+'"/>'+
             '<path d="M11.4 14.6 L12.6 8.2 L16.8 12.4 Z" fill="'+innen+'"/>'+
             '<path d="M28.6 14.6 L27.4 8.2 L23.2 12.4 Z" fill="'+innen+'"/>'+
             (ohrSpitze ? '<path d="M10.1 9.6 L11 4 L14.6 7.2 Z" fill="'+ohrSpitze+'"/>'+
                          '<path d="M29.9 9.6 L29 4 L25.4 7.2 Z" fill="'+ohrSpitze+'"/>' : '');
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
  // ---------- Tiere (Runde 99 neu gefasst) ----------
  //
  // Rueckmeldung: "die tiere und menschen sehen immernoch zu unrealistisch aus". Bei den Tieren
  // liess sich der Grund in einer Zeile benennen: Alle zwoelf teilten sich EINE Kopfform und
  // EINE Schnauze. Fuchs, Katze, Baer, Panda, Hase, Reh und beide Hunde hatten denselben
  // Umriss; unterschieden hat sie nur, was oben draufgesteckt war. Genau daran erkennt man ein
  // Tier aber zuerst — ein Fuchs ist am Umriss ein Fuchs, bevor man die Ohren sieht.
  //
  // Jetzt traegt jede Art ihren eigenen Kopf, ihre eigene Schnauze und ihre eigene Nase. Dazu
  // drei Dinge, die vorher ganz fehlten und die ein Fell von einer Flaeche unterscheiden:
  // eine ausgefranste Fellkante, Schnurrhaare und ein Wangenflaum.
  var KOEPFE = {
    // Breit und hoch: Baer, Panda. Ein Baerenkopf ist breiter als hoch und hat eine flache
    // Stirn — die beiden oberen Kontrollpunkte liegen deshalb weit aussen.
    breit:  'M20 8.6 C28.8 8.6 34.4 13.8 34.4 20.8 C34.4 28.2 28.4 34.2 20 34.2 '+
            'C11.6 34.2 5.6 28.2 5.6 20.8 C5.6 13.8 11.2 8.6 20 8.6 Z',
    // Der Fuchs: breite Backen auf Augenhoehe, von dort scharf zur schmalen Schnauze. Der Knick
    // bei y=27 ist der Punkt, an dem beim echten Tier der Wangenflaum aufhoert.
    spitz:  'M20 8.2 C28.6 8.2 34.0 13.2 34.0 19.6 C34.0 23.4 32.0 26.2 28.6 27.8 '+
            'C26.6 31.8 23.6 34.8 20 34.8 C16.4 34.8 13.4 31.8 11.4 27.8 '+
            'C8.0 26.2 6.0 23.4 6.0 19.6 C6.0 13.2 11.4 8.2 20 8.2 Z',
    // Katze: kleiner und runder als der Fuchs, mit angedeuteten Wangenbacken.
    katze:  'M20 9.2 C27.2 9.2 32.4 13.8 32.4 19.8 C32.4 23.2 30.8 25.8 28.2 27.6 '+
            'C26.4 31.4 23.4 34.2 20 34.2 C16.6 34.2 13.6 31.4 11.8 27.6 '+
            'C9.2 25.8 7.6 23.2 7.6 19.8 C7.6 13.8 12.8 9.2 20 9.2 Z',
    // Schmal und lang: Hase und Reh. Deutlich schmaler als alles andere — 21 statt 29 Einheiten.
    schmal: 'M20 8.4 C26.2 8.4 30.6 13.0 30.6 19.6 C30.6 25.0 28.6 29.2 25.8 32.0 '+
            'C24.0 33.8 22.1 34.8 20 34.8 C17.9 34.8 16.0 33.8 14.2 32.0 '+
            'C11.4 29.2 9.4 25.0 9.4 19.6 C9.4 13.0 13.8 8.4 20 8.4 Z',
    // Hund: breite Stirn, dann laenger auslaufend zur Schnauze hin.
    hund:   'M20 8.8 C28.4 8.8 33.6 13.8 33.6 20.2 C33.6 24.0 31.8 26.8 28.8 28.6 '+
            'C26.8 32.4 23.6 35.0 20 35.0 C16.4 35.0 13.2 32.4 11.2 28.6 '+
            'C8.2 26.8 6.4 24.0 6.4 20.2 C6.4 13.8 11.6 8.8 20 8.8 Z'
  };
  // Die Schnauzen. Vorher eine Ellipse fuer alle (7,5 auf 6); jetzt je Art eine eigene Form und
  // Lage. Der Unterschied zwischen einer Katzenschnauze (breit und flach, hoch sitzend) und
  // einer Hundeschnauze (schmal und lang, tief sitzend) traegt mehr als jede Fellfarbe.
  var SCHNAUZEN = {
    breit:  {cx:20, cy:26.8, rx:8.0, ry:6.2},
    spitz:  {cx:20, cy:27.6, rx:5.6, ry:5.6},
    katze:  {cx:20, cy:26.6, rx:6.8, ry:4.8},
    schmal: {cx:20, cy:27.4, rx:5.2, ry:4.6},
    hund:   {cx:20, cy:28.0, rx:6.4, ry:5.8}
  };
  // Hier stand in Runde 99 eine "Fellkante": kurze Striche quer ueber den Umriss, damit das
  // Fell ausfranst statt an einer Linie zu enden. Zwei Fassungen, beide verworfen — die erste
  // waren graue Striche rund um den Kopf (auf dem weissen Panda nicht zu uebersehen), die
  // zweite immer noch sichtbare Markierungen. Es ist derselbe Befund wie beim Haarglanz in
  // Runde 97: Eine Strichform mit runden Enden ist bei dieser Groesse ein Fremdkoerper, egal
  // wie blass sie ist. Den Rand macht jetzt allein figSaum() — ein heller Saum an der
  // Lichtseite, der ohne einen einzigen Strich auskommt.

  // Die Nasen. Eine Katzennase ist ein abgerundetes Dreieck mit einer Kerbe oben, eine
  // Baerennase ein breites Oval, eine Hasennase ein kleines Y. Sie alle als dasselbe Oval zu
  // malen war der zweite Grund, warum die Tiere austauschbar aussahen.
  // Runde 115: Die Nase glaenzt. Bei Animoji ist sie das feuchteste Teil des Gesichts, und genau
  // daran liest man "Tier" statt "Pluesch": oben heller (der Verlauf), darauf ein breiter Glanz.
  var FIG_NASE_LAUF = 0;
  function figNase(art, x, y, haut, farbe){
    var gn = FIG_UID + 'nv' + (FIG_NASE_LAUF++);
    var NASE = 'url(#'+gn+')';
    var verlauf = '<defs><radialGradient id="'+gn+'" cx="0.5" cy="0.35" r="0.75" fx="0.38" fy="0.22">'+
      // Runde 116: eine eigene Nasenfarbe, wo das echte Tier eine hat — Katze und Hase rosa.
      (farbe ? '<stop offset="0" stop-color="'+figTon(farbe, 1.30)+'"/><stop offset="0.6" stop-color="'+farbe+'"/>'+
               '<stop offset="1" stop-color="'+figTon(farbe, 0.70)+'"/>'
             : '<stop offset="0" stop-color="#6E5E55"/><stop offset="0.55" stop-color="'+FIG_INK+'"/>'+
               '<stop offset="1" stop-color="#140E0B"/>')+'</radialGradient></defs>';
    var glanz = verlauf + '<ellipse cx="'+(x-0.55)+'" cy="'+(y-0.55)+'" rx="0.95" ry="0.5" fill="#FFFFFF" opacity=".62"/>';
    // Der Philtrumstrich von der Nase zum Mund. Bei jedem Saeugetier da, und ohne ihn schwebt
    // die Nase ueber der Schnauze, statt auf ihr zu sitzen.
    var rinne = '<path d="M'+x+' '+(y+1.1)+' L'+x+' '+(y+2.6)+'" stroke="'+figTon(haut||'#E8D5C0', 0.72)+
                '" stroke-width="0.55" stroke-linecap="round" opacity=".7"/>';
    if (art === 'dreieck')
      // Katze, Fuchs, Hund: abgerundetes Dreieck, oben am breitesten, unten in eine Spitze.
      return '<path d="M'+(x-2.0)+' '+(y-1.0)+' Q'+x+' '+(y-1.7)+' '+(x+2.0)+' '+(y-1.0)+
             ' Q'+(x+2.0)+' '+(y+0.9)+' '+x+' '+(y+1.5)+' Q'+(x-2.0)+' '+(y+0.9)+' '+(x-2.0)+' '+(y-1.0)+' Z" fill="'+NASE+'"/>'+
             glanz + rinne;
    if (art === 'breit')
      // Baer und Panda: breites, flaches Oval.
      return '<ellipse cx="'+x+'" cy="'+y+'" rx="2.8" ry="1.7" fill="'+NASE+'"/>'+ glanz + rinne;
    if (art === 'klein')
      // Hase und Reh: klein, hoch, mit dem Y-Spalt.
      return '<path d="M'+(x-1.3)+' '+(y-0.7)+' Q'+x+' '+(y-1.3)+' '+(x+1.3)+' '+(y-0.7)+
             ' Q'+(x+1.1)+' '+(y+0.9)+' '+x+' '+(y+1.2)+' Q'+(x-1.1)+' '+(y+0.9)+' '+(x-1.3)+' '+(y-0.7)+' Z" fill="'+NASE+'"/>'+
             glanz + rinne;
    return '<ellipse cx="'+x+'" cy="'+y+'" rx="2.1" ry="1.5" fill="'+NASE+'"/>'+ glanz + rinne;
  }
  // Schnurrhaare. Sie stehen nicht waagerecht ab, sondern faechern leicht — und die oberen
  // haengen staerker als die unteren. Drei je Seite; mehr sieht bei dieser Groesse nach Besen aus.
  function figSchnurrhaare(y, farbe){
    var f = farbe || '#FFFFFF';
    var s = function(d, deck, w){
      return '<path d="'+d+'" stroke="'+f+'" stroke-width="'+w+'" fill="none" stroke-linecap="round" opacity="'+deck+'"/>';
    };
    return s('M14.6 '+(y-1.2)+' Q9.0 '+(y-2.4)+' 4.6 '+(y-2.0), 0.55, 0.5) +
           s('M14.4 '+y+' Q8.6 '+y+' 3.8 '+(y+0.8), 0.62, 0.55) +
           s('M14.8 '+(y+1.2)+' Q9.4 '+(y+2.4)+' 5.2 '+(y+3.6), 0.5, 0.45) +
           s('M25.4 '+(y-1.2)+' Q31.0 '+(y-2.4)+' 35.4 '+(y-2.0), 0.55, 0.5) +
           s('M25.6 '+y+' Q31.4 '+y+' 36.2 '+(y+0.8), 0.62, 0.55) +
           s('M25.2 '+(y+1.2)+' Q30.6 '+(y+2.4)+' 34.8 '+(y+3.6), 0.5, 0.45);
  }
  // Die Braue eines Tieres, dritter und letzter Anlauf.
  //
  // Zuerst stand hier ein glatter Bogen — das ist eine MENSCHENbraue und auf einem Fuchs das
  // deutlichste Zeichen dafuer, dass hier gezeichnet und nicht beobachtet wurde. Dann drei
  // kurze Striche je Seite als "Fellbueschel"; im vergroesserten Bild las sich das als
  // Strichliste ueber dem Auge.
  //
  // Was ein Tier ueber dem Auge wirklich hat, ist kein Strich, sondern eine STELLE: eine
  // Partie Fell, die etwas dunkler oder heller liegt. Genau das ist es jetzt — ein weicher
  // Fleck ohne Rand, dessen Hoehe und Neigung die Brauenstellung der Miene tragen. Damit
  // bleibt der Ausdruck lesbar, ohne dass irgendwo eine Linie steht.
  var FIG_TBRAUE_LAUF = 0;
  function figTierbrauen(art, fell){
    if (!art || art === 'keine') return '';
    var id = FIG_UID + 'tb' + (FIG_TBRAUE_LAUF++);
    var f = figTon(fell, 0.66);
    // Neigung und Hoehe je Stellung. Gehoben zieht die Innenseite hoch und den Fleck nach oben,
    // schraeg kippt ihn zur Aussenseite, weich laesst ihn tief und flach liegen.
    var dreh = art === 'gehoben' ? -13 : (art === 'schraeg' ? 12 : (art === 'weich' ? -5 : 0));
    var hoch = art === 'gehoben' ? -0.9 : (art === 'weich' ? 0.4 : 0);
    var fleck = function(x, sp){
      return '<ellipse cx="'+x+'" cy="'+(16.7 + hoch)+'" rx="3.2" ry="1.25" transform="rotate('+
             (dreh * sp)+' '+x+' '+(16.7 + hoch)+')" fill="url(#'+id+')"/>';
    };
    return '<defs><radialGradient id="'+id+'">'+
             '<stop offset="0" stop-color="'+f+'" stop-opacity="0.42"/>'+
             '<stop offset="1" stop-color="'+f+'" stop-opacity="0"/>'+
           '</radialGradient></defs>' + fleck(15, 1) + fleck(25, -1);
  }

  function figTier(o){
    mieneAnwenden(o);
    var g = FIG_UID + 'fell', gk = FIG_UID + 'fkern', gs = FIG_UID + 'schn';
    // Runde 115: drei weitere Verlaeufe fuer das Animoji-Volumen — Stirnglanz, Koerper, und die
    // Schablone des Kopfes, damit der Glanz nirgends ueber den Umriss hinauslaeuft.
    var gg = FIG_UID + 'glanz', gb = FIG_UID + 'koerper', gc = FIG_UID + 'kopfform';
    var art = o.form || 'breit';
    var TKOPF = KOEPFE[art] || KOEPFE.breit;
    var sn = SCHNAUZEN[art] || SCHNAUZEN.breit;
    return '<defs>'+figKugelPlastisch(g, o.fell)+figKern(gk)+
      // Der Koerper bekommt dasselbe Licht wie der Kopf: oben links hell, nach unten dunkel. Flach
      // gefuellt lag er als Pappe unter einem Kopf, der jetzt rund ist.
      '<linearGradient id="'+gb+'" x1="0.2" y1="0" x2="0.8" y2="1">'+
        '<stop offset="0" stop-color="'+figTon(o.koerper || o.fell, 1.06)+'"/>'+
        '<stop offset="1" stop-color="'+figTon(o.koerper || o.fell, 0.62)+'"/></linearGradient>'+
      // Der Stirnglanz. Weiss, weil ein Glanzlicht die Farbe des Lichts hat und nicht die der
      // Flaeche, und mit restlos auslaufendem Rand — eine Flaeche mit Kante waere eine Pfuetze.
      '<radialGradient id="'+gg+'"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.50"/>'+
        '<stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.18"/>'+
        '<stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>'+
      '<clipPath id="'+gc+'"><path d="'+TKOPF+'"/></clipPath>'+
      '</defs>' +
      // Ein angedeuteter Koerper unter dem Kopf, angeschnitten wie beim Menschen. Ohne ihn
      // schwebt auch ein Tierkopf.
      '<path d="M20 31 C12.6 31 7.2 34.8 5.8 40 L34.2 40 C32.8 34.8 27.4 31 20 31 Z" fill="url(#'+gb+')"/>' +
      // Runde 115: Der Schatten unter dem Kinn ist kraeftiger — bei Animoji ist genau diese
      // Kontaktstelle der dunkelste Punkt der ganzen Figur, und sie ist es, die den Kopf auf den
      // Koerper setzt statt davor.
      // Runde 116: der helle Brustlatz, wo das echte Tier einen hat (Fuchs). Er liegt UNTER dem
      // Kinnschatten, damit der Kopf weiterhin auf dem Koerper aufsitzt.
      (o.brust ? '<ellipse cx="20" cy="38.5" rx="6.2" ry="6" fill="'+o.brust+'"/>' : '') +
      '<ellipse cx="20" cy="34.4" rx="8.2" ry="2.8" fill="'+FIG_INK+'" opacity=".30"/>' +
      figOhren(o.ohr, o.ohrFarbe || o.fell, o.innen, o.ohrSpitze) +
      figSaum(TKOPF, 'url(#'+g+')', figTon(o.fell, 1.28)) +
      '<path d="'+TKOPF+'" fill="url(#'+gk+')"/>' +
      // Runde 116: helle Wangen und Kinn. Beim Fuchs reicht das Weiss von den Wangen bis unter das
      // Kinn, beim Reh ist die Kehle weiss — eine weiche Flaeche in der unteren Kopfhaelfte, in
      // die Kopfform geschnitten, damit sie den Umriss nicht veraendert.
      // Zweiter Anlauf: als Verlauf mit kurzem, weichem Rand (beim Fuchs lag sonst eine harte Kante
      // quer uebers Gesicht), und mit zwei Formen — 'wange' fuer den Fuchs, bei dem das Weiss von
      // den Wangen bis unters Kinn reicht, und 'kehle' fuer das Reh, bei dem nur die Kehle unter
      // dem Kinn hell ist. Mit derselben breiten Form trug das Reh eine weisse Maske.
      (o.kinn ? '<defs><radialGradient id="'+gc+'k"><stop offset="0" stop-color="'+o.kinn+'"/>'+
                  '<stop offset="0.8" stop-color="'+o.kinn+'"/><stop offset="1" stop-color="'+o.kinn+'" stop-opacity="0"/>'+
                '</radialGradient></defs>'+
                '<g clip-path="url(#'+gc+')">'+(o.kinnForm === 'kehle'
                  ? '<ellipse cx="20" cy="33.6" rx="6.4" ry="3.6" fill="url(#'+gc+'k)"/>'
                  : '<ellipse cx="20" cy="30.6" rx="12" ry="6.8" fill="url(#'+gc+'k)"/>')+'</g>' : '') +
      (o.maske ? o.maske : '') +
      // Runde 115: der Stirnglanz, in die Kopfform geschnitten.
      '<g clip-path="url(#'+gc+')"><ellipse cx="15.2" cy="12.6" rx="7.2" ry="4.4" fill="url(#'+gg+')" '+
        'transform="rotate(-18 15.2 12.6)"/></g>' +
      (o.wange ? '<ellipse cx="9.8" cy="24.5" rx="3" ry="2.2" fill="'+o.wange+'" opacity=".75"/>'+
                 '<ellipse cx="30.2" cy="24.5" rx="3" ry="2.2" fill="'+o.wange+'" opacity=".75"/>' : '') +
      // Runde 99: Die Schnauze hatte eine harte Ellipsenkante — ein heller Fleck mit Rand.
      // Bei einem Tier geht das helle Fell der Schnauze weich ins dunklere ueber. Der Verlauf
      // haelt die Farbe bis 72 Prozent und blendet dann aus; erst dadurch waechst die Schnauze
      // aus dem Kopf, statt darauf zu liegen.
      // Runde 115: Die Schnauze hat jetzt ihr EIGENES Licht — oben links heller als ihre Farbe,
      // der Brennpunkt dorthin verschoben. Vorher war sie innen gleichfarbig und lag als heller
      // Schein auf dem Kopf; im vergroesserten Bild ein verwischter Fleck. Mit eigenem Licht ist
      // sie eine Form, die aus dem Kopf herauskommt.
      '<defs><radialGradient id="'+gs+'" fx="0.40" fy="0.30">'+
        '<stop offset="0" stop-color="'+figTon(o.schnauze, 1.25)+'" stop-opacity="1"/>'+
        '<stop offset="0.86" stop-color="'+o.schnauze+'" stop-opacity="1"/>'+
        '<stop offset="1" stop-color="'+o.schnauze+'" stop-opacity="0"/>'+
      '</radialGradient></defs>'+
      // Runde 115, zweiter Anlauf: Die Farbe haelt jetzt bis 86 statt 72 Prozent, und die Ellipse
      // ist nur noch 4 statt 12 Prozent groesser als die Schnauze. Mit dem breiten Auslauf blieb
      // sie trotz eigenem Licht ein verwischter Schein — im Bild bei Fuchs und Hund deutlich.
      // Animoji-Schnauzen sind klar umrissene Formen mit WEICHEM, aber kurzem Rand.
      '<ellipse cx="'+sn.cx+'" cy="'+sn.cy+'" rx="'+(sn.rx*1.04)+'" ry="'+(sn.ry*1.04)+'" fill="url(#'+gs+')"/>' +
      // Der Schatten, mit dem die Schnauze auf dem Kopf aufliegt. Ohne ihn ist sie ein heller
      // Fleck IM Gesicht statt eine Form, die daraus hervorsteht.
      '<ellipse cx="'+sn.cx+'" cy="'+(sn.cy - sn.ry*0.86)+'" rx="'+(sn.rx*0.92)+'" ry="'+(sn.ry*0.42)+
        '" fill="'+figTon(o.fell, 0.66)+'" opacity=".22"/>' +
      // Runde 115: und der Schatten UNTER ihr, auf dem Kinn. Oben liegt sie auf, unten wirft sie
      // ihren Schatten — erst beides zusammen macht sie zu einem Koerper.
      '<ellipse cx="'+sn.cx+'" cy="'+(sn.cy + sn.ry*0.98).toFixed(2)+'" rx="'+(sn.rx*0.80).toFixed(2)+'" ry="'+(sn.ry*0.36).toFixed(2)+
        '" fill="'+figTon(o.fell, 0.55)+'" opacity=".14"/>' +
      // Runde 99: Die Brauen der Tiere sind Fellbueschel geworden statt gezeichneter Boegen.
      // Ein glatter Bogen ueber dem Auge ist eine MENSCHENbraue; auf einem Fuchs oder einer
      // Katze war er das deutlichste Zeichen dafuer, dass hier etwas gezeichnet und nicht
      // beobachtet wurde. Die Miene bleibt trotzdem lesbar, weil die Bueschel derselben
      // Stellung folgen — nur eben in Fellfarbe, dreigeteilt und halb so kraeftig.
      figTierbrauen(o.braue, o.fell) +
      // Runde 115: die Augen 30 % groesser. Animoji-Augen sind gross und glaenzend; bei 2,3
      // Einheiten auf einem 23 Einheiten breiten Kopf blieben sie Knoepfe. 15 % waren im ersten
      // Anlauf zu wenig, um im Bild ueberhaupt aufzufallen.
      figAugen(15, 25, 20, (o.auge || 2.3) * 1.30, {blick:o.blick, iris:o.iris || figTon(o.fell, 0.55), seite:o.seite, hoehe:o.hoehe, oeffnung:o.oeffnung, haut:o.schnauze, grossIris:true, pupille:o.pupille}) +
      (o.schnurrhaare ? figSchnurrhaare(sn.cy - 0.6, figTon(o.schnauze, 1.18)) : '') +
      figNase(o.nase || 'oval', 20, sn.cy - sn.ry*0.42, o.schnauze, o.naseFarbe) +
      figMund(o.mund, FIG_INK, 1.1, o.schnauze) +
      (o.zunge ? '<path d="M18.6 29.4 Q20 32.6 21.4 29.4 Z" fill="#E4899A"/>' : '');
  }


  // Runde 114: Hier stand figMensch(), der Bauplan der zehn Menschenfiguren. Auf Entscheidung
  // des Inhabers sind sie entfallen — nach der fuenften Rueckmeldung "zu unrealistisch" und vier
  // Ueberarbeitungen (Runde 87, 94, 97/99, 111). Ersetzt werden sie so, wie iOS es in Kontakten
  // und beim Apple-Account macht: Das realistischste Bild ist ein eigenes Foto (konnte Lucenta
  // schon), sonst ein Monogramm im Verlaufskreis (09-archetypen.css). Die Tiere bleiben als
  // verspielte Wahl; sie hatten nie eine Rueckmeldung, weil ihre Konstruktion zu ihnen passt.
  // Gespeicherte Profile mit einer Menschenfigur (m1 bis m10) fallen ueber figurFinden() von
  // selbst auf das Monogramm zurueck — es gibt nichts zu bereinigen.

  // Die Figuren. Reihenfolge: erst Menschen, dann Tiere — wer sich selbst sucht, sucht nicht
  // zuerst nach einem Fuchs. Jede traegt jetzt eine eigene Miene; dieselbe Frisur mit einem
  // anderen Mund ist ein anderer Mensch.
  var FIGUREN = [
    {id:'fuchs', feld:'#F6E6D8', svg:function(){ return figTier({form:'spitz', nase:'dreieck', schnurrhaare:true, miene:'schelmisch', ohr:'spitz', fell:'#D97A45', innen:'#F5E2D2', schnauze:'#F8EFE6',
                  // Runde 116, am echten Rotfuchs: schwarze Ohrspitzen, weisse Wangen bis zum Kinn,
                  // weisse Brust, Schlitzpupillen.
                  ohrSpitze:'#2A211C', kinn:'#F8EFE6', brust:'#F8EFE6', pupille:'schlitz',
                  wange:'#E9A177', iris:'#7A4520'}); }},
    {id:'katze', feld:'#E6E4EA', svg:function(){ return figTier({form:'katze', nase:'dreieck', schnurrhaare:true, miene:'zufrieden', ohr:'spitz', fell:'#8E8B95', innen:'#E3C8CE', schnauze:'#F1EFF3',
                  // Runde 116, an der echten getigerten Hauskatze: Schlitzpupillen, rosa Nase und das
                  // "M" auf der Stirn — drei weiche, spitz zulaufende Streifen, Flaechen statt Striche.
                  pupille:'schlitz', naseFarbe:'#D98E98',
                  maske:'<g fill="#5E5B66" opacity=".55"><path d="M18.9 9.6 Q20 8.8 21.1 9.6 L20.4 15.2 Q20 15.6 19.6 15.2 Z"/>'+
                        '<path d="M14.6 10.6 Q15.8 10 16.6 10.9 L17.4 15.4 Q17 15.8 16.6 15.4 Z"/>'+
                        '<path d="M25.4 10.6 Q24.2 10 23.4 10.9 L22.6 15.4 Q23 15.8 23.4 15.4 Z"/></g>',
                  wange:'#C7A9B2', iris:'#7A8C4A'}); }},
    {id:'baer',  feld:'#EFE3D6', svg:function(){ return figTier({form:'breit', nase:'breit', miene:'ruhe', ohr:'rund',  fell:'#A5714B', innen:'#D9A87F', schnauze:'#E7CDB2', iris:'#4A3220'}); }},
    {id:'panda', feld:'#D8DAD6', svg:function(){ return figTier({form:'breit', nase:'breit', miene:'wach', ohr:'rund',  fell:'#F4F3F1', innen:'#2A211C', schnauze:'#FFFFFF', auge:2.15, iris:'#3A302A',
                  // Runde 116, am echten Grossen Panda: Die Ohren sind GANZ schwarz (vorher weiss mit
                  // schwarzer Mitte), die Schultern tragen das schwarze Band, und die Augenflecken
                  // sind schraege Tropfen, die nach aussen unten auslaufen — nicht nach innen.
                  ohrFarbe:'#2A211C', koerper:'#2A211C',
                  maske:'<ellipse cx="14.6" cy="20.8" rx="4.3" ry="5.6" transform="rotate(28 14.6 20.8)" fill="#2A211C"/>'+
                        '<ellipse cx="25.4" cy="20.8" rx="4.3" ry="5.6" transform="rotate(-28 25.4 20.8)" fill="#2A211C"/>'}); }},
    {id:'hase',  feld:'#F1E7EC', svg:function(){ return figTier({form:'schmal', nase:'klein', schnurrhaare:true, miene:'scheu', ohr:'lang',  fell:'#E4DAD3', innen:'#E7B9C4', schnauze:'#F7F1EE',
                  naseFarbe:'#D98E98',
                  wange:'#EFC3CD', iris:'#8C5A66'}); }},
    {id:'reh',   feld:'#EEE7D9', svg:function(){ return figTier({form:'schmal', nase:'klein', miene:'versonnen', ohr:'geweih',fell:'#C99A6A', innen:'#7A5B3E', schnauze:'#EFE0CD', iris:'#3E2C1C',
                  // Runde 116, am echten Reh: Hier standen weisse Punkte auf der Stirn. Die gibt es
                  // nicht — Flecken traegt nur das Kitz, am Ruecken, und nie zusammen mit einem
                  // Geweih. Was das Reh tatsaechlich kennzeichnet, ist die helle Kehle. Die rosa
                  // Wangen sind ebenfalls entfallen; ein Reh errötet nicht.
                  kinn:'#F2E6D3', kinnForm:'kehle', brust:'#F2E6D3'}); }},
    // Zwei Hunde. Beide teilen den Kopf-Bauplan und unterscheiden sich in Fell, Schnauze und
    // Miene — genau das, was sie auch in echt unterscheidet.
    {id:'dackel', feld:'#F0E3D2', svg:function(){ return figTier({form:'hund', nase:'dreieck', miene:'nachdenklich', braue:'keine', ohr:'schlapp', fell:'#8C5A33', innen:'#6B4324',
                  schnauze:'#C08B5C', zunge:true, iris:'#4A2E16',
                  maske:'<ellipse cx="20" cy="19" rx="6.4" ry="4.4" fill="#A96E3F" opacity=".55"/>'+
                        '<g fill="#D9A76F" opacity=".85"><ellipse cx="14.4" cy="16.6" rx="2.2" ry="1.6"/><ellipse cx="25.6" cy="16.6" rx="2.2" ry="1.6"/></g>'}); }},
    {id:'retriever', feld:'#F7EBD6', svg:function(){ return figTier({form:'hund', nase:'dreieck', miene:'belustigt', ohr:'schlapp', fell:'#E3B26B', innen:'#C08F4C', schnauze:'#F6E3C4',
                  zunge:true, iris:'#6B4520'}); }},
    // Drei, die nicht in den Kopf-Bauplan passen und deshalb eigene Formen bekommen.
    {id:'eule', feld:'#E3E7E4', svg:function(){
       return '<path d="M20 30 C13.6 30 8.6 33.8 7.4 40 L32.6 40 C31.4 33.8 26.4 30 20 30 Z" fill="#8B7355"/>'+
              '<path d="M9 12 L12.5 5 L16.5 10.5 Z" fill="#8B7355"/><path d="M31 12 L27.5 5 L23.5 10.5 Z" fill="#8B7355"/>'+
              figPlastisch(20, 22, 13.5, 13, '#A08463')+
              figVolumen(20, 22, 13.5, 13)+
              '<circle cx="14.6" cy="20" r="6.2" fill="#F3EADD"/><circle cx="25.4" cy="20" r="6.2" fill="#F3EADD"/>'+
              // Die Eule sieht als Einzige den Betrachter direkt und weit an — das ist das
              // Einzige, was eine Eule tut.
              figAugen(14.6, 25.4, 20, 3.1, {blick:'weit', iris:'#D89A45', grossIris:true})+
              '<path d="M20 24.5 L16.8 29 L23.2 29 Z" fill="#D89A45"/>'+
              '<path d="M11 30 Q20 34.5 29 30" stroke="#8B7355" stroke-width="1.6" fill="none" stroke-linecap="round"/>'; }},
    {id:'wal', feld:'#DCE7EE', svg:function(){
       return '<path d="M17 6 Q20 9 23 6" stroke="#9FC2D8" stroke-width="1.8" fill="none" stroke-linecap="round"/>'+
              '<path d="M20 6 L20 10" stroke="#9FC2D8" stroke-width="1.8" stroke-linecap="round"/>'+
              figPlastisch(19, 23, 14, 11, '#5E8FB0')+
              figVolumen(19, 23, 14, 11)+
              '<path d="M31 19 L37 14 L36 26 Z" fill="#4A7A9A"/>'+
              '<path d="M8 26 Q19 33 30 26 Q19 30 8 26 Z" fill="#CFE2EE"/>'+
              '<ellipse cx="19" cy="27" rx="10" ry="5.5" fill="#CFE2EE"/>'+
              '<path d="M9.6 24.6 Q12.4 26.6 15.4 24.8" stroke="'+FIG_INK+'" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".7"/>'+
              '<g class="fig-augen">'+figAuge(13, 21, 2, {blick:'schmal', iris:'#2E4E66', grossIris:true})+'</g>'; }},
    {id:'goldfisch', feld:'#FCEAD5', svg:function(){
       return '<path d="M6 22 L1.5 15 L2.4 29 Z" fill="#E8933C"/>'+
              '<path d="M20 9.5 Q23 4 26.5 10.5 Z" fill="#F2AE5C" opacity=".9"/>'+
              figPlastisch(21, 22, 14, 11, '#F2953A')+
              figVolumen(21, 22, 14, 11)+
              '<path d="M15 27.5 Q21 31.5 27.5 27" stroke="#D97C25" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".55"/>'+
              '<path d="M22.5 30 Q25.5 34.5 29 30 Z" fill="#F2AE5C" opacity=".9"/>'+
              '<path d="M25.6 24.6 Q28 26.6 30.4 24.8" stroke="'+FIG_INK+'" stroke-width="1.2" fill="none" stroke-linecap="round"/>'+
              '<circle cx="26.5" cy="19.5" r="3.6" fill="#FFFFFF"/>'+
              '<g class="fig-augen">'+figAuge(26.5, 19.5, 2, {blick:'offen', seite:1, iris:'#3A2A1A', grossIris:true})+'</g>'+
              '<g fill="#FFFFFF" opacity=".5"><circle cx="9.5" cy="12" r="1.5"/><circle cx="13.5" cy="8.5" r="1"/></g>'; }},
    {id:'schildkroete', feld:'#DFEADD', svg:function(){
       return '<ellipse cx="8.5" cy="26" rx="4" ry="3.2" fill="#8FBE7E"/><ellipse cx="31.5" cy="26" rx="4" ry="3.2" fill="#8FBE7E"/>'+
              figPlastisch(20, 24, 14, 10.5, '#5E8C4A')+
              '<g fill="none" stroke="#48703A" stroke-width="1.1" opacity=".8">'+
              '<path d="M20 13.8 L20 34.4 M8.2 21.5 Q20 24.5 31.8 21.5 M9.4 28.6 Q20 26 30.6 28.6"/></g>'+
              figVolumen(20, 24, 14, 10.5)+
              figPlastisch(20, 13, 7, 6.4, '#8FBE7E')+
              '<ellipse cx="20" cy="11.2" rx="5" ry="2.8" fill="#FFFFFF" opacity=".15"/>'+
              figAugen(17.4, 22.6, 12.4, 1.6, {blick:'offen', iris:'#2E4A22', grossIris:true})+
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

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

  // ---------- Das Tierauge (Runde 117) ----------
  //
  // Rueckmeldung des Inhabers: "Die Avatare sehen noch nicht aus wie die echten Tiere — z. B. die
  // Augen sind die von Menschen." Woertlich zutreffend: Die Tiere bekamen bis hierher figAuge(),
  // das fuer die Menschenfiguren gebaut war — weisser Augapfel, farbige Iris mit Limbusring, kleine
  // runde Pupille, Wimpernkante. Genau das liest sich als Mensch.
  //
  // Ein Tierauge ist anders gebaut, und die Unterschiede sind die, die man sieht:
  //   1. Kein Weiss. Bei Fuchs, Katze, Hund, Baer, Reh und Hase ist die sichtbare Oeffnung fast
  //      ganz Iris. Der weisse Augapfel ist das menschlichste Merkmal ueberhaupt.
  //   2. Ein dunkler Lidrand rings um das Auge, bei Fuchs und Katze besonders deutlich.
  //   3. Die Iris ist je Tier verschieden: Fuchs bernstein, Katze gruengelb — beide mit
  //      Schlitzpupille —, Hund, Baer, Reh und Hase fast schwarzbraun, sodass sich die Pupille
  //      kaum abhebt. Das ist bei diesen Tieren echt so und der Grund fuer ihren "dunklen Blick".
  //   4. Die Form: mandelfoermig und schraeg bei Fuchs und Katze, rund bei den uebrigen.
  // Was vom Animoji-Stil bleibt, ist der Glanz: Lichtpunkt und Fensterlicht — ein feuchtes Auge
  // glaenzt bei jedem Tier.
  var FIG_TAUGE_LAUF = 0;
  function figTierAuge(x, y, r, o, spiegel){
    var id = FIG_UID + 'ta' + (FIG_TAUGE_LAUF++);
    var iris = o.iris || '#3A2416';
    var mandel = o.augenForm === 'mandel';
    var rx = r * (mandel ? 1.16 : 1.0), ry = r * (mandel ? 0.80 : 0.94);
    var neig = mandel ? -16 * spiegel : 0;            // aeusserer Winkel hoeher
    var form = function(sx, sy){
      var a = rx * sx, b = ry * sy;
      return mandel
        ? 'M'+(x-a).toFixed(2)+' '+(y+b*0.10).toFixed(2)+
          ' Q'+(x-a*0.30).toFixed(2)+' '+(y-b*1.35).toFixed(2)+' '+(x+a).toFixed(2)+' '+(y-b*0.10).toFixed(2)+
          ' Q'+(x+a*0.30).toFixed(2)+' '+(y+b*1.35).toFixed(2)+' '+(x-a).toFixed(2)+' '+(y+b*0.10).toFixed(2)+' Z'
        : 'M'+(x-a).toFixed(2)+' '+y.toFixed(2)+' A'+a.toFixed(2)+' '+b.toFixed(2)+' 0 1 1 '+(x+a).toFixed(2)+' '+y.toFixed(2)+
          ' A'+a.toFixed(2)+' '+b.toFixed(2)+' 0 1 1 '+(x-a).toFixed(2)+' '+y.toFixed(2)+' Z';
    };
    var pupille = o.pupille === 'schlitz'
      ? '<ellipse cx="'+x+'" cy="'+y+'" rx="'+(r*0.17).toFixed(2)+'" ry="'+(ry*0.92).toFixed(2)+'" fill="#0A0605"/>'
      : '<circle cx="'+x+'" cy="'+y+'" r="'+(r*0.50).toFixed(2)+'" fill="#0A0605" opacity=".92"/>';
    return '<g transform="rotate('+neig+' '+x+' '+y+')">'+
      '<defs><radialGradient id="'+id+'" cx="0.5" cy="0.62" r="0.66">'+
        '<stop offset="0" stop-color="'+figTon(iris, 1.30)+'"/><stop offset="0.6" stop-color="'+iris+'"/>'+
        '<stop offset="1" stop-color="'+figTon(iris, 0.45)+'"/></radialGradient>'+
        '<clipPath id="'+id+'c"><path d="'+form(1,1)+'"/></clipPath></defs>'+
      // Der Lidrand: dieselbe Form, groesser und dunkel, HINTER dem Auge — eine Flaeche, kein Strich.
      '<path d="'+form(1.18, 1.26)+'" fill="#1A120E" opacity=".88"/>'+
      '<path d="'+form(1,1)+'" fill="url(#'+id+')"/>'+
      '<g clip-path="url(#'+id+'c)">'+ pupille +
        // Der Schatten des Oberlids auf dem Auge: Er setzt es in die Hoehle, statt es aufzukleben.
        '<ellipse cx="'+x+'" cy="'+(y - ry*0.95).toFixed(2)+'" rx="'+(rx*1.1).toFixed(2)+'" ry="'+(ry*0.55).toFixed(2)+'" fill="#000000" opacity=".16"/>'+
        '<ellipse cx="'+(x - rx*0.15).toFixed(2)+'" cy="'+(y - ry*0.30).toFixed(2)+'" rx="'+(rx*0.70).toFixed(2)+'" ry="'+(ry*0.32).toFixed(2)+'" fill="#FFFFFF" opacity=".18"/>'+
      '</g>'+
      '<circle cx="'+(x - rx*0.34).toFixed(2)+'" cy="'+(y - ry*0.36).toFixed(2)+'" r="'+(r*0.27).toFixed(2)+'" fill="#FFFFFF" opacity=".95"/>'+
      '<circle cx="'+(x + rx*0.34).toFixed(2)+'" cy="'+(y + ry*0.32).toFixed(2)+'" r="'+(r*0.10).toFixed(2)+'" fill="#FFFFFF" opacity=".6"/>'+
    '</g>';
  }
  function figTierAugen(x1, x2, y, r, o){
    return '<g class="fig-augen">' + figTierAuge(x1, y, r, o, 1) + figTierAuge(x2, y, r, o, -1) + '</g>';
  }
  // ---------- Das Tiermaul (Runde 117) ----------
  // Der gebogene Laechelmund kam ebenfalls von den Menschen. Fuchs, Katze, Hund, Baer, Hase und Reh
  // haben ein gespaltenes Maul: von der Nase ein kurzer Strich nach unten (der steht schon in
  // figNase), dann zwei Boegen nach links und rechts — das "ω". Hunde mit Zunge zeigen es geoeffnet.
  function figTierMaul(cx, ny, o){
    var y = ny + 2.6, w = o.maulBreite || 2.5;
    var linie = '<path d="M'+(cx-w)+' '+(y+0.9)+' Q'+(cx-w*0.45)+' '+(y+1.6)+' '+cx+' '+y+
                ' Q'+(cx+w*0.45)+' '+(y+1.6)+' '+(cx+w)+' '+(y+0.9)+'" stroke="#2A1A14" stroke-width="0.85" '+
                'fill="none" stroke-linecap="round" opacity=".85"/>';
    if (!o.zunge) return linie;
    // Hechelnd: das Maul offen, die Zunge haengt heraus — so sieht ein froehlicher Hund wirklich aus.
    return '<path d="M'+(cx-w)+' '+(y+0.8)+' Q'+cx+' '+(y+4.6)+' '+(cx+w)+' '+(y+0.8)+' Q'+cx+' '+(y+1.8)+' '+(cx-w)+' '+(y+0.8)+' Z" fill="#3A1A16"/>'+
           '<path d="M'+(cx-1.3)+' '+(y+2.0)+' Q'+cx+' '+(y+6.0)+' '+(cx+1.3)+' '+(y+2.0)+' Z" fill="#E4899A"/>'+
           '<path d="M'+cx+' '+(y+2.6)+' L'+cx+' '+(y+4.4)+'" stroke="#C86A7C" stroke-width="0.4" opacity=".7"/>' + linie;
  }
  function figTier(o){
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
      // Runde 118: Backenfell. Beim echten Fuchs und bei der Katze steht das Fell an den Wangen
      // seitlich ab, sodass das Gesicht breiter ist als der Schaedel — die Silhouette laeuft dort
      // in zwei Spitzen aus statt in einem glatten Bogen. Als Flaeche in Fell- bzw. Wangenfarbe,
      // HINTER dem Kopf, damit nur die Spitzen hervorstehen.
      (o.backenfell ? '<path d="M9.4 21 L4.6 25.4 L8.6 25.2 L5.6 28.6 L10.6 27 Z" fill="'+o.backenfell+'"/>'+
                      '<path d="M30.6 21 L35.4 25.4 L31.4 25.2 L34.4 28.6 L29.4 27 Z" fill="'+o.backenfell+'"/>' : '') +
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
      // Runde 117: Die rosa Wangen sind entfallen — ein Mittel der Comicfigur, keines Tieres.
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
      // Runde 117: keine Brauen mehr. Auch Fellbueschel in der Stellung einer Braue geben einem Tier
      // ein menschliches Gesicht; echte Fuechse, Katzen und Baeren haben dort nichts. Abzeichen, die
      // es wirklich gibt (die lohfarbenen Punkte des Dackels), stehen in seiner maske.

      // Runde 115: die Augen 30 % groesser. Animoji-Augen sind gross und glaenzend; bei 2,3
      // Einheiten auf einem 23 Einheiten breiten Kopf blieben sie Knoepfe. 15 % waren im ersten
      // Anlauf zu wenig, um im Bild ueberhaupt aufzufallen.
      // Runde 118: der Augenabstand je Tier. Raubtiere (Fuchs, Katze, Baer, Hund) schauen nach vorn;
      // Fluchttiere (Hase, Reh) tragen die Augen seitlich am Kopf, um fast rundum zu sehen. Mit
      // demselben frontalen Abstand wie die Katze sahen Hase und Reh aus wie Pluesch.
      figTierAugen(20 - (o.augenAbstand || 5), 20 + (o.augenAbstand || 5), 20.2 + (o.augenHoehe || 0), (o.auge || 2.3) * 1.20, {iris:o.iris || '#3A2416', pupille:o.pupille, augenForm:o.augenForm}) +
      (o.schnurrhaare ? figSchnurrhaare(sn.cy - 0.6, figTon(o.schnauze, 1.18)) : '') +
      figNase(o.nase || 'oval', 20, sn.cy - sn.ry*0.42, o.schnauze, o.naseFarbe) +
      figTierMaul(20, sn.cy - sn.ry*0.42, o);
  }


  // Runde 114: Hier stand figMensch(), der Bauplan der zehn Menschenfiguren. Auf Entscheidung
  // des Inhabers sind sie entfallen — nach der fuenften Rueckmeldung "zu unrealistisch" und vier
  // Ueberarbeitungen (Runde 87, 94, 97/99, 111). Ersetzt werden sie so, wie iOS es in Kontakten
  // und beim Apple-Account macht: Das realistischste Bild ist ein eigenes Foto (konnte Lucenta
  // schon), sonst ein Monogramm im Verlaufskreis (09-archetypen.css). Die Tiere bleiben als
  // verspielte Wahl; sie hatten nie eine Rueckmeldung, weil ihre Konstruktion zu ihnen passt.
  // Gespeicherte Profile mit einer Menschenfigur (m1 bis m10) fallen ueber figurFinden() von
  // selbst auf das Monogramm zurueck — es gibt nichts zu bereinigen.

  // ---------- Vier Tiere nach ihrer echten Anatomie (Runde 118) ----------
  //
  // Rueckmeldung des Inhabers: "Vor allem die Fische und die Schildkroete muessen realistischer an
  // den echten Tieren sein." Zutreffend: Der Goldfisch war eine orange Ellipse mit zwei
  // Flossenecken, die Schildkroete ein gruener Halbkreis mit drei Linien und einem runden Kopf
  // obendrauf, der Wal ein blaues Ei mit Strichfontaene. Keine dieser Formen kommt in der Natur
  // vor. Jede ist jetzt aus den Teilen gebaut, an denen man das echte Tier erkennt — und aus
  // denselben Lichtmitteln wie die anderen (Verlauf von oben, Glanz, weiche Schatten).
  //
  // Feine Linien gibt es hier, wo das echte Tier Linien HAT (Flossenstrahlen, Schildnaehte,
  // Kehlfurchen) — sehr duenn, mit stumpfen Enden und geringer Deckung. Die Lehre aus CLAUDE.md
  // gilt fuer aufgemalte Glanz- und Kantenstriche; eine Naht zwischen zwei Panzerschilden ist
  // keine Zier, sondern der Panzer.
  var FIG_SONDER_LAUF = 0;
  function figSid(){ return FIG_UID + 'so' + (FIG_SONDER_LAUF++); }
  function figLinear(id, oben, unten, x1, y1, x2, y2){
    return '<linearGradient id="'+id+'" x1="'+(x1||0)+'" y1="'+(y1||0)+'" x2="'+(x2||0)+'" y2="'+(y2==null?1:y2)+'">'+
           '<stop offset="0" stop-color="'+oben+'"/><stop offset="1" stop-color="'+unten+'"/></linearGradient>';
  }
  function figGlanz(id){
    return '<radialGradient id="'+id+'"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/>'+
           '<stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0.16"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>';
  }

  // Goldfisch, nach rechts schwimmend. Echt: hochovaler Koerper, oben rotorange, zum Bauch gold;
  // Schuppen in Reihen; der Kiemendeckel als Bogen hinter dem Auge; eine durchscheinende
  // Faecherflosse mit Strahlen; Ruecken-, Brust- und Bauchflossen; das Maul vorn an der Spitze.
  function figGoldfisch(){
    var k = figSid(), f = figSid(), g = figSid(), c = figSid();
    var KOERPER = 'M33.6 21.4 C33.6 15.6 28 12.2 21.6 12.2 C15.4 12.2 10.6 16 10.2 21.2 C10.6 26.4 15.6 30.2 21.8 30.2 C28.2 30.2 33.6 27 33.6 21.4 Z';
    var schuppen = '';
    for (var r = 0; r < 4; r++){
      for (var i = 0; i < 5; i++){
        var x = 15.2 + i*2.9 + (r % 2 ? 1.45 : 0), y = 16.6 + r*2.7;
        schuppen += '<path d="M'+(x-1.35).toFixed(2)+' '+y.toFixed(2)+' Q'+x.toFixed(2)+' '+(y+1.7).toFixed(2)+' '+(x+1.35).toFixed(2)+' '+y.toFixed(2)+
                    ' Q'+x.toFixed(2)+' '+(y+0.9).toFixed(2)+' '+(x-1.35).toFixed(2)+' '+y.toFixed(2)+' Z"/>';
      }
    }
    var strahlen = '';
    [[2.4,12.6],[2.0,16.6],[2.6,20.8],[2.0,25.2],[2.4,29.4]].forEach(function(p){
      strahlen += '<path d="M10.4 21 L'+p[0]+' '+p[1]+'"/>';
    });
    return '<defs>'+figLinear(k, '#E2561E', '#F6BE55')+figLinear(f, '#F0883A', '#F7C27A', 1, 0, 0, 0)+figGlanz(g)+
           '<clipPath id="'+c+'"><path d="'+KOERPER+'"/></clipPath></defs>'+
      // Schwanzflosse: zwei Lappen, durchscheinend, mit Strahlen.
      '<path d="M11 21 C7.5 15.5 3.6 11 1.6 12.2 C2.8 16 4.4 18.8 5.2 21 C4.4 23.2 2.8 26 1.6 29.8 C3.6 31 7.5 26.5 11 21 Z" fill="url(#'+f+')" opacity=".82"/>'+
      '<g stroke="#C8601E" stroke-width="0.3" opacity=".35" fill="none">'+strahlen+'</g>'+
      // Rueckenflosse, Bauch- und Afterflosse, alle durchscheinend.
      '<path d="M15.8 13.2 C17.6 7.6 23.4 6.8 27 11.6 C24.4 11.6 20.6 12 15.8 13.2 Z" fill="url(#'+f+')" opacity=".85"/>'+
      '<path d="M17 28.8 C15.6 32.2 13 33.6 11.6 33 C13.2 31.4 14.6 29.8 17 28.8 Z" fill="#F2A24E" opacity=".85"/>'+
      '<path d="M23.4 29.8 C22.8 33.2 20.4 34.8 19 34.2 C20.4 32.4 21.6 31 23.4 29.8 Z" fill="#F2A24E" opacity=".85"/>'+
      '<path d="'+KOERPER+'" fill="url(#'+k+')"/>'+
      '<g clip-path="url(#'+c+')">'+
        '<g fill="#FFE7A8" opacity=".30">'+schuppen+'</g>'+
        // Der helle Bauch und das Licht auf dem Ruecken.
        '<ellipse cx="22" cy="28.6" rx="10" ry="3.4" fill="#FCE3A6" opacity=".55"/>'+
        '<ellipse cx="19.6" cy="15.6" rx="8" ry="3" fill="url(#'+g+')" transform="rotate(-6 19.6 15.6)"/>'+
      '</g>'+
      // Kiemendeckel: der Bogen hinter dem Auge.
      '<path d="M27.6 14.6 Q25 21.4 27.8 28" stroke="#B9481A" stroke-width="0.6" fill="none" opacity=".55"/>'+
      // Brustflosse hinter dem Kiemendeckel.
      '<path d="M26.6 23.4 C23.4 24.6 21.4 27.4 20.8 29.2 C23.2 28.2 25.4 26.4 26.6 23.4 Z" fill="#F7B868" opacity=".8"/>'+
      '<g class="fig-augen">'+figTierAuge(29.4, 18.6, 1.9, {iris:'#C9A040'}, 1)+'</g>'+
      // Das Maul vorn: kleine Oeffnung mit Lippe.
      '<ellipse cx="33.5" cy="21.8" rx="0.75" ry="0.95" fill="#7A2E10"/>'+
      '<path d="M33 20.7 Q34.4 21.8 33 22.9" stroke="#F6B26A" stroke-width="0.45" fill="none" opacity=".8"/>'+
      '<g fill="#FFFFFF" opacity=".45"><circle cx="36" cy="14.4" r="1.1"/><circle cx="34.6" cy="11" r="0.7"/></g>';
  }

  // Schildkroete von der Seite, nach links. Echt: ein gewoelbter Panzer aus Hornschilden — oben die
  // Wirbelschilde, darunter die Rippenschilde, am Rand die kleinen Randschilde, jeder Schild mit
  // hellerem Kern und dunkler Naht; darunter der gelbliche Bauchpanzer. Der Kopf sitzt vorn am
  // Hals, mit schuppiger Haut und Hornschnabel; die Beine sind kurz, beschuppt, mit Krallen.
  function figSchildkroete(){
    var p = figSid(), h = figSid(), g = figSid(), sk = figSid();
    var PANZER = 'M8.2 26.4 C8.2 15.4 15 9.4 22 9.4 C29.6 9.4 35.2 15.6 35.2 26.4 Z';
    var schild = function(cx, cy, s){
      var pts = [];
      for (var i = 0; i < 6; i++){ var a = Math.PI/6 + i*Math.PI/3; pts.push((cx + Math.cos(a)*s*1.12).toFixed(2)+','+(cy + Math.sin(a)*s*0.86).toFixed(2)); }
      // Die Naehte sind dunkler als der Schild, aber nicht schwarz, und die Ecken gerundet
      // (stroke-linejoin) — im ersten Entwurf las sich das scharfe Sechseckraster wie ein Fussball.
      return '<polygon points="'+pts.join(' ')+'" fill="url(#'+sk+')" stroke="#3A5228" stroke-width="0.7" '+
             'stroke-linejoin="round" stroke-opacity=".75"/>';
    };
    var schilde = schild(16.4, 15.8, 3.2) + schild(22, 13.4, 3.4) + schild(27.6, 15.8, 3.2) +
                  schild(12.2, 21.8, 3.0) + schild(18.6, 20.4, 3.2) + schild(25.4, 20.4, 3.2) + schild(31.6, 21.8, 3.0);
    var rand = '';
    for (var x = 9.6; x < 34.5; x += 2.75){ rand += '<path d="M'+x.toFixed(2)+' 24 L'+x.toFixed(2)+' 26.4"/>'; }
    return '<defs>'+figLinear(p, '#6E8A42', '#34491F')+figLinear(h, '#9AA65C', '#5E6A34')+figGlanz(g)+
           '<radialGradient id="'+sk+'" cx="0.45" cy="0.35" r="0.75"><stop offset="0" stop-color="#A2A858"/>'+
           '<stop offset="0.55" stop-color="#6E7E3A"/><stop offset="1" stop-color="#3E5426"/></radialGradient></defs>'+
      '<ellipse cx="21" cy="32.6" rx="15" ry="1.8" fill="'+FIG_INK+'" opacity=".18"/>'+
      // Hinterbein und Schwanz hinter dem Panzer.
      '<path d="M31 26 C32 29.4 31.4 31.4 30.6 32.4 L34.2 32.4 C34.6 30.4 34.6 28.2 33.6 26 Z" fill="url(#'+h+')"/>'+
      '<path d="M34.8 25.4 C37 25.6 38.2 26.6 38.4 27.6 C36.8 27.6 35.6 27.2 34.6 26.6 Z" fill="#7A8644"/>'+
      // Hals und Kopf.
      '<path d="M10.2 22.6 C8.4 21.6 6.6 21.8 5.6 22.6 L6.4 26.8 C8 26.8 9.6 26.6 11 26 Z" fill="url(#'+h+')"/>'+
      '<ellipse cx="5" cy="23.4" rx="3.7" ry="2.9" fill="url(#'+h+')"/>'+
      '<ellipse cx="4.2" cy="22.2" rx="2.2" ry="1.1" fill="url(#'+g+')"/>'+
      '<g fill="#4E5A2A" opacity=".45"><circle cx="6.6" cy="22.2" r="0.45"/><circle cx="7.4" cy="24" r="0.4"/>'+
        '<circle cx="5.8" cy="25.2" r="0.35"/><circle cx="8.6" cy="22.8" r="0.4"/></g>'+
      '<g class="fig-augen">'+figTierAuge(3.9, 22.5, 0.95, {iris:'#2A2412'}, 1)+'</g>'+
      // Der Hornschnabel: eine Kante, keine Lippen.
      '<path d="M1.5 23.9 Q3.6 25.2 6.2 24.9" stroke="#2E3418" stroke-width="0.55" fill="none" opacity=".85"/>'+
      // Panzer mit Schilden und Randschilden.
      '<path d="'+PANZER+'" fill="url(#'+p+')"/>'+
      schilde +
      '<g stroke="#3A5228" stroke-width="0.5" opacity=".6">'+rand+'</g>'+
      '<path d="M8.4 24 L35 24" stroke="#3A5228" stroke-width="0.5" opacity=".6"/>'+
      '<ellipse cx="18.4" cy="13" rx="7" ry="2.8" fill="url(#'+g+')" transform="rotate(-14 18.4 13)"/>'+
      // Bauchpanzer, gelblich.
      '<path d="M8.2 26.4 L35.2 26.4 L34.2 28.2 L9.4 28.2 Z" fill="#C9B867"/>'+
      // Vorderbein mit Krallen.
      '<path d="M10.6 26.4 C9.6 29.4 9.4 31.2 9.8 32.4 L13.6 32.4 C13.8 30.4 14 28.4 14.2 26.4 Z" fill="url(#'+h+')"/>'+
      '<g fill="#E8E2C4"><path d="M9.8 32.4 L9.3 33.4 L10.5 32.4 Z"/><path d="M11.4 32.4 L11 33.5 L12.1 32.4 Z"/><path d="M12.9 32.4 L12.6 33.4 L13.6 32.4 Z"/></g>';
  }

  // Buckelwal, nach links. Echt: gestreckter Koerper, oben dunkel blaugrau, unten hell; die
  // Kehlfurchen am Unterkiefer; die sehr lange Brustflosse; eine kleine Rueckenflosse weit hinten;
  // die waagerechte Fluke; das kleine Auge kurz hinter dem Maulwinkel. Der Blas ist Nebel, keine
  // Fontaene aus Strichen.
  function figWal(){
    var k = figSid(), b = figSid(), g = figSid(), n = figSid(), c = figSid();
    var KOERPER = 'M2.6 21.6 C2.6 16.6 9.6 13.8 18.6 14.2 C26.4 14.6 31 16.8 34.8 19.6 L38.4 15.6 C39.2 17.8 39 20 37.6 21.2 C39 22.4 39.2 24.6 38.4 26.8 L34.6 22.8 C30.4 25.6 25 28.2 17.6 28.2 C9 28.2 2.6 26.2 2.6 21.6 Z';
    var furchen = '';
    for (var i = 0; i < 5; i++){ furchen += '<path d="M'+(4.2+i*0.2)+' '+(23.6+i*0.8)+' Q11 '+(25.4+i*0.9)+' '+(18+i*0.4)+' '+(26+i*0.5)+'"/>'; }
    return '<defs>'+figLinear(k, '#4B6C86', '#2A4256')+figLinear(b, '#C9D9E4', '#A9BFCF')+figGlanz(g)+
           '<radialGradient id="'+n+'"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.75"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>'+
           '<clipPath id="'+c+'"><path d="'+KOERPER+'"/></clipPath></defs>'+
      // Der Blas: zwei Nebelwolken, weich.
      '<ellipse cx="9.6" cy="9.4" rx="3.2" ry="4" fill="url(#'+n+')"/><ellipse cx="11.6" cy="7.4" rx="2.4" ry="3" fill="url(#'+n+')"/>'+
      '<path d="'+KOERPER+'" fill="url(#'+k+')"/>'+
      '<g clip-path="url(#'+c+')">'+
        '<path d="M2 22 C6 27.6 14 29.6 22 28.4 C16 27.4 9 26 2 22 Z" fill="url(#'+b+')"/>'+
        '<path d="M2.6 23.4 C8 27.8 16 29 24 27.8 L24 31 L2 31 Z" fill="url(#'+b+')"/>'+
        '<g stroke="#7E97A8" stroke-width="0.32" fill="none" opacity=".7">'+furchen+'</g>'+
        '<ellipse cx="16" cy="16" rx="10" ry="2.6" fill="url(#'+g+')" transform="rotate(-3 16 16)"/>'+
        // Die Hoecker auf dem Kopf des Buckelwals.
        '<g fill="#6E8BA2" opacity=".7"><circle cx="5.6" cy="18.6" r="0.5"/><circle cx="7.4" cy="17.4" r="0.5"/><circle cx="9.4" cy="16.6" r="0.5"/></g>'+
      '</g>'+
      // Maullinie, lang und geschwungen — das hat der echte Wal.
      '<path d="M2.8 22.4 Q7.6 23.6 12.6 22.9" stroke="#1E3040" stroke-width="0.6" fill="none" opacity=".8"/>'+
      '<g class="fig-augen">'+figTierAuge(13.8, 21.5, 0.75, {iris:'#14202A'}, 1)+'</g>'+
      // Rueckenflosse, und die lange Brustflosse mit hellem Rand.
      '<path d="M26.4 15.2 C27.6 13 29.4 12.8 30 15.6 Z" fill="#2E4A60"/>'+
      '<path d="M15.6 25.6 C18.6 30 22.4 33.2 26.6 33.8 C24 31.2 20.6 28 18.6 25.4 Z" fill="#344E64"/>'+
      '<path d="M18.6 25.4 C20.6 28 24 31.2 26.6 33.8 C25.2 32.2 22.4 29.4 20.2 26.4 Z" fill="#D4E2EA" opacity=".85"/>';
  }

  // Uhu, von vorn. Echt: der runde Gesichtsschleier mit dunklem Rand, die gefiederten Ohrbueschel,
  // der kurze Hakenschnabel, der zur Haelfte im Gefieder steckt, und die Laengsstreifen auf der Brust.
  function figEule(){
    var s = figSid();
    var feder = '';
    [[15.6,30.2],[19,31.6],[22.4,30.2],[25.6,31.8],[13.2,33],[17.6,34.4],[21.6,34],[26.4,34.6]].forEach(function(q){
      feder += '<path d="M'+q[0]+' '+q[1]+' Q'+(q[0]+0.5)+' '+(q[1]+1.4)+' '+q[0]+' '+(q[1]+2.6)+' Q'+(q[0]-0.5)+' '+(q[1]+1.4)+' '+q[0]+' '+q[1]+' Z"/>';
    });
    return '<defs><radialGradient id="'+s+'" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="#EBD8B8"/>'+
           '<stop offset="0.72" stop-color="#D2B48A"/><stop offset="1" stop-color="#6E5236"/></radialGradient></defs>'+
      '<path d="M20 30 C13.6 30 8.6 33.8 7.4 40 L32.6 40 C31.4 33.8 26.4 30 20 30 Z" fill="#9C7C54"/>'+
      // Ohrbueschel: mehrere Federspitzen statt eines Dreiecks.
      '<path d="M9.6 13.6 L9.4 5.4 L11.6 9 L12.4 4.6 L14 9.6 L16.4 11.2 Z" fill="#7A5C3C"/>'+
      '<path d="M30.4 13.6 L30.6 5.4 L28.4 9 L27.6 4.6 L26 9.6 L23.6 11.2 Z" fill="#7A5C3C"/>'+
      figPlastisch(20, 22, 13.5, 13, '#A28058')+
      // Gesichtsschleier: zwei helle Scheiben mit dunklem Rand.
      '<circle cx="14.6" cy="20.2" r="6.8" fill="#5A4028" opacity=".55"/><circle cx="25.4" cy="20.2" r="6.8" fill="#5A4028" opacity=".55"/>'+
      '<circle cx="14.6" cy="20.2" r="6.1" fill="url(#'+s+')"/><circle cx="25.4" cy="20.2" r="6.1" fill="url(#'+s+')"/>'+
      figTierAugen(14.6, 25.4, 20, 2.6, {iris:'#E8901E'})+
      // Hakenschnabel, halb im Gefieder.
      '<path d="M18.6 23.6 Q20 22.4 21.4 23.6 Q21 26.4 20 27.6 Q19 26.4 18.6 23.6 Z" fill="#3E3428"/>'+
      '<path d="M19.2 23.8 Q20 23.2 20.6 23.8" stroke="#8A7A64" stroke-width="0.35" fill="none"/>'+
      '<g fill="#5A4028" opacity=".55">'+feder+'</g>';
  }

  // Die Figuren. Reihenfolge: erst Menschen, dann Tiere — wer sich selbst sucht, sucht nicht
  // zuerst nach einem Fuchs. Jede traegt jetzt eine eigene Miene; dieselbe Frisur mit einem
  // anderen Mund ist ein anderer Mensch.
  var FIGUREN = [
    {id:'fuchs', feld:'#F6E6D8', svg:function(){ return figTier({iris:'#C8862E', augenForm:'mandel', form:'spitz', nase:'dreieck', schnurrhaare:true, ohr:'spitz', fell:'#D97A45', innen:'#F5E2D2', schnauze:'#F8EFE6',
                  // Runde 116, am echten Rotfuchs: schwarze Ohrspitzen, weisse Wangen bis zum Kinn,
                  // weisse Brust, Schlitzpupillen.
                  ohrSpitze:'#2A211C', kinn:'#F8EFE6', brust:'#F8EFE6', pupille:'schlitz', backenfell:'#F4E6DA',
                  wange:'#E9A177',}); }},
    {id:'katze', feld:'#E6E4EA', svg:function(){ return figTier({iris:'#B5BD3E', augenForm:'mandel', form:'katze', nase:'dreieck', schnurrhaare:true, ohr:'spitz', fell:'#8E8B95', innen:'#E3C8CE', schnauze:'#F1EFF3',
                  // Runde 116, an der echten getigerten Hauskatze: Schlitzpupillen, rosa Nase und das
                  // "M" auf der Stirn — drei weiche, spitz zulaufende Streifen, Flaechen statt Striche.
                  pupille:'schlitz', naseFarbe:'#D98E98', backenfell:'#9A97A2',
                  maske:'<g fill="#5E5B66" opacity=".55"><path d="M18.9 9.6 Q20 8.8 21.1 9.6 L20.4 15.2 Q20 15.6 19.6 15.2 Z"/>'+
                        '<path d="M14.6 10.6 Q15.8 10 16.6 10.9 L17.4 15.4 Q17 15.8 16.6 15.4 Z"/>'+
                        '<path d="M25.4 10.6 Q24.2 10 23.4 10.9 L22.6 15.4 Q23 15.8 23.4 15.4 Z"/></g>',
                  wange:'#C7A9B2',}); }},
    {id:'baer',  feld:'#EFE3D6', svg:function(){ return figTier({auge:1.85, iris:'#3A2416', form:'breit', nase:'breit', ohr:'rund',  fell:'#A5714B', innen:'#D9A87F', schnauze:'#E7CDB2',}); }},
    {id:'panda', feld:'#D8DAD6', svg:function(){ return figTier({iris:'#2A1A12', form:'breit', nase:'breit', ohr:'rund',  fell:'#F4F3F1', innen:'#2A211C', schnauze:'#FFFFFF', auge:1.85,
                  // Runde 116, am echten Grossen Panda: Die Ohren sind GANZ schwarz (vorher weiss mit
                  // schwarzer Mitte), die Schultern tragen das schwarze Band, und die Augenflecken
                  // sind schraege Tropfen, die nach aussen unten auslaufen — nicht nach innen.
                  ohrFarbe:'#2A211C', koerper:'#2A211C',
                  maske:'<ellipse cx="14.6" cy="20.8" rx="4.3" ry="5.6" transform="rotate(28 14.6 20.8)" fill="#2A211C"/>'+
                        '<ellipse cx="25.4" cy="20.8" rx="4.3" ry="5.6" transform="rotate(-28 25.4 20.8)" fill="#2A211C"/>'}); }},
    {id:'hase',  feld:'#F1E7EC', svg:function(){ return figTier({augenAbstand:7.4, augenHoehe:-1.2, auge:1.9, iris:'#3A2420', form:'schmal', nase:'klein', schnurrhaare:true, ohr:'lang',  fell:'#E4DAD3', innen:'#E7B9C4', schnauze:'#F7F1EE',
                  naseFarbe:'#D98E98',
                  wange:'#EFC3CD',}); }},
    {id:'reh',   feld:'#EEE7D9', svg:function(){ return figTier({augenAbstand:7.2, augenHoehe:-0.6, auge:1.95, iris:'#24160E', form:'schmal', nase:'klein', ohr:'geweih',fell:'#C99A6A', innen:'#7A5B3E', schnauze:'#EFE0CD',
                  // Runde 116, am echten Reh: Hier standen weisse Punkte auf der Stirn. Die gibt es
                  // nicht — Flecken traegt nur das Kitz, am Ruecken, und nie zusammen mit einem
                  // Geweih. Was das Reh tatsaechlich kennzeichnet, ist die helle Kehle. Die rosa
                  // Wangen sind ebenfalls entfallen; ein Reh errötet nicht.
                  kinn:'#F2E6D3', kinnForm:'kehle', brust:'#F2E6D3'}); }},
    // Zwei Hunde. Beide teilen den Kopf-Bauplan und unterscheiden sich in Fell, Schnauze und
    // Miene — genau das, was sie auch in echt unterscheidet.
    {id:'dackel', feld:'#F0E3D2', svg:function(){ return figTier({iris:'#3A2210', form:'hund', nase:'dreieck', braue:'keine', ohr:'schlapp', fell:'#8C5A33', innen:'#6B4324',
                  schnauze:'#C08B5C', zunge:true,
                  maske:'<ellipse cx="20" cy="19" rx="6.4" ry="4.4" fill="#A96E3F" opacity=".55"/>'+
                        '<g fill="#D9A76F" opacity=".85"><ellipse cx="14.4" cy="16.6" rx="2.2" ry="1.6"/><ellipse cx="25.6" cy="16.6" rx="2.2" ry="1.6"/></g>'}); }},
    {id:'retriever', feld:'#F7EBD6', svg:function(){ return figTier({iris:'#4A2C14', form:'hund', nase:'dreieck', ohr:'schlapp', fell:'#E3B26B', innen:'#C08F4C', schnauze:'#F6E3C4',
                  zunge:true,}); }},
    // Drei, die nicht in den Kopf-Bauplan passen und deshalb eigene Formen bekommen.
    // Runde 118: die vier eigenen Formen, gebaut nach der Anatomie der echten Tiere (siehe oben).
    {id:'eule', feld:'#E3E7E4', svg:figEule},
    {id:'wal', feld:'#DCE7EE', svg:figWal},
    {id:'goldfisch', feld:'#FCEAD5', svg:figGoldfisch},
    {id:'schildkroete', feld:'#DFEADD', svg:figSchildkroete}
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

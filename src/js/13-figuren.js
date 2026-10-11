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



  // Hier stand in Runde 99 eine "Fellkante": kurze Striche quer ueber den Umriss, damit das
  // Fell ausfranst statt an einer Linie zu enden. Zwei Fassungen, beide verworfen — die erste
  // waren graue Striche rund um den Kopf (auf dem weissen Panda nicht zu uebersehen), die
  // zweite immer noch sichtbare Markierungen. Es ist derselbe Befund wie beim Haarglanz in
  // Runde 97: Eine Strichform mit runden Enden ist bei dieser Groesse ein Fremdkoerper, egal
  // wie blass sie ist. Den Rand macht jetzt allein figSaum() — ein heller Saum an der
  // Lichtseite, der ohne einen einzigen Strich auskommt.


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


  // Runde 114: Hier stand figMensch(), der Bauplan der zehn Menschenfiguren. Auf Entscheidung
  // des Inhabers sind sie entfallen — nach der fuenften Rueckmeldung "zu unrealistisch" und vier
  // Ueberarbeitungen (Runde 87, 94, 97/99, 111). Ersetzt werden sie so, wie iOS es in Kontakten
  // und beim Apple-Account macht: Das realistischste Bild ist ein eigenes Foto (konnte Lucenta
  // schon), sonst ein Monogramm im Verlaufskreis (09-archetypen.css). Die Tiere bleiben als
  // verspielte Wahl; sie hatten nie eine Rueckmeldung, weil ihre Konstruktion zu ihnen passt.
  // Gespeicherte Profile mit einer Menschenfigur (m1 bis m10) fallen ueber figurFinden() von
  // selbst auf das Monogramm zurueck — es gibt nichts zu bereinigen.

  // ================= Jedes Tier einzeln gezeichnet (Runde 119) =================
  //
  // Rueckmeldung des Inhabers, nach vier Ueberarbeitungen: "immer noch zu unrealistisch, vom
  // gesamten Modell schon — nicht nur wegen 3D oder Licht." Der Satz trifft den Kern. Alle neun
  // Saeugetiere entstanden aus EINER Schablone (figTier): runder Kopf, frontal und symmetrisch,
  // ovale Schnauze in der Mitte, zwei Augen daneben, angedeutete Schultern. Die Tiere
  // unterschieden sich nur in Farben, Ohren und Abzeichen — dieselbe Figur in neun Kostuemen. Die
  // Runden 115 bis 118 haben das Kostuem verbessert, nicht das Modell.
  //
  // Auf Entscheidung des Inhabers jetzt: jedes Tier eine eigene Zeichnung mit eigener Kopfform,
  // in Dreiviertelansicht (leicht nach links gedreht — eine streng frontale, symmetrische Ansicht
  // ist das Kennzeichen von Emblemen und Plueschtieren), mit Fellstruktur. Geteilt werden nur noch
  // Werkzeuge: das Tierauge, der Fellfilter, die Verlaeufe. Die Formen sind je Tier von Hand.
  //
  // Der Fellfilter ist neu und der groesste Einzelschritt. Glatte Vektorkanten sind der
  // Hauptgrund, warum gezeichnete Tiere wie Plastik wirken: Fell hat keinen Umriss, es hat einen
  // Saum. feTurbulence + feDisplacementMap zerfransen die Kante um Bruchteile einer Einheit, eine
  // zweite, gestreckte Turbulenz legt feine gerichtete Haarstriche auf die Flaeche. Beides in
  // Nutzereinheiten, also auf jeder Groesse gleich fein.
  var FIG_FELL_LAUF = 0;
  function figFellFilter(id, staerke){
    var st = staerke || 1;
    return '<filter id="'+id+'" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">'+
      '<feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4" result="rausch"/>'+
      '<feDisplacementMap in="SourceGraphic" in2="rausch" scale="'+(0.85*st).toFixed(2)+'" xChannelSelector="R" yChannelSelector="G" result="saum"/>'+
      '<feTurbulence type="fractalNoise" baseFrequency="1.1 2.6" numOctaves="1" seed="9" result="haar"/>'+
      '<feColorMatrix in="haar" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.25" result="haarmaske"/>'+
      '<feComposite in="haarmaske" in2="saum" operator="in" result="haarinnen"/>'+
      '<feFlood flood-color="#1A100A" flood-opacity="'+(0.11*st).toFixed(2)+'"/>'+
      '<feComposite in2="haarinnen" operator="in" result="haardunkel"/>'+
      '<feMerge><feMergeNode in="saum"/><feMergeNode in="haardunkel"/></feMerge></filter>';
  }
  function figKopfVerlauf(id, hell, dunkel){
    return '<radialGradient id="'+id+'" cx="0.62" cy="0.38" r="0.78" fx="0.66" fy="0.30">'+
      '<stop offset="0" stop-color="'+hell+'"/><stop offset="0.6" stop-color="'+figTon(dunkel, 1.18)+'"/>'+
      '<stop offset="1" stop-color="'+dunkel+'"/></radialGradient>';
  }

  // Rotfuchs, Dreiviertel nach links. Keilfoermiger Kopf mit langer, spitzer Schnauze; grosse
  // Ohren mit schwarzen Rueckseiten; weiss an Kehle, Unterkiefer und Wangen bis zur Schnauze; die
  // dunkle "Traenenlinie" vom Auge zur Schnauze; Bernsteinaugen mit Schlitzpupille.
  function figFuchsEinzeln(){
    var f = figSid(), v = figSid(), w = figSid();
    return '<defs>'+figFellFilter(f)+figKopfVerlauf(v, '#F2A066', '#B8541E')+
             figLinear(w, '#FFFFFF', '#E8DCCC')+'</defs>'+
      '<g filter="url(#'+f+')">'+
        // Koerper: Schulter und weisse Brust.
        '<path d="M14 40 C14 33 18 29.4 24 29.4 C31 29.4 36 33.6 37 40 Z" fill="#B85622"/>'+
        '<path d="M17.6 40 C17.4 35 19.6 31.6 23.6 31 C26 32.6 27 36 26.4 40 Z" fill="url(#'+w+')"/>'+
        // Fernes Ohr (links, kleiner) und nahes Ohr (rechts, groesser), Rueckseiten schwarz.
        '<path d="M15.6 14 L13.2 3.8 L21.4 10.6 Z" fill="#2A1A12"/>'+
        '<path d="M16.2 13 L14.6 6.6 L19.6 10.8 Z" fill="#E8D6C4"/>'+
        '<path d="M23.6 11 L30.6 1.6 L33.4 13.2 Z" fill="#2A1A12"/>'+
        '<path d="M25.4 11.2 L30 4.4 L31.8 12.6 Z" fill="#EFDCCB"/>'+
        // Kopf: Stirn rund rechts, nach links zur spitzen Schnauze auslaufend.
        '<path d="M31 11.6 C35.6 14.4 36.2 22.6 32 27.8 C28.4 31.6 21.6 31.8 16.8 29.2 L8.6 25.8 '+
          'C6.6 25.1 6.2 23.2 7.6 22.4 L14.8 18.2 C16.8 13 23.6 9.4 31 11.6 Z" fill="url(#'+v+')"/>'+
        // Weiss: Unterkiefer, Kehle, Wangen bis nach vorn.
        '<path d="M8.4 25.6 L16.8 29.2 C21.6 31.8 28.4 31.6 32 27.8 C30.6 28.6 27.4 27.4 24.6 25.6 '+
          'C21 23.6 17 23.8 13 24.4 C11.2 24.7 9.6 25 8.4 25.6 Z" fill="url(#'+w+')"/>'+
        '<path d="M32 27.8 C33.8 25.6 34.6 23.4 34.8 21.6 C33.2 24.2 30.4 26 27.6 26.4 Z" fill="#F4E8DA"/>'+
      '</g>'+
      // Traenenlinie: vom vorderen Augenwinkel zur Schnauze, als weiche Flaeche.
      '<path d="M18.6 19.8 C16.2 20.6 13.4 21.6 10.4 23.2 C13.6 22.6 16.6 22 19.2 21.2 Z" fill="#5A2A10" opacity=".55"/>'+
      '<g class="fig-augen">'+
        figTierAuge(17.0, 18.8, 1.25, {iris:'#C8862E', pupille:'schlitz', augenForm:'mandel'}, 1)+
        figTierAuge(24.4, 18.0, 1.75, {iris:'#C8862E', pupille:'schlitz', augenForm:'mandel'}, -1)+
      '</g>'+
      // Nase an der Spitze, mit Glanz; die Maullinie laeuft den Kiefer entlang zurueck.
      '<ellipse cx="7.4" cy="23.1" rx="1.5" ry="1.15" fill="#1A120E"/>'+
      '<ellipse cx="7.0" cy="22.6" rx="0.55" ry="0.32" fill="#FFFFFF" opacity=".6"/>'+
      '<path d="M8.2 24.4 Q12 25.6 15.4 25.2" stroke="#2A1A14" stroke-width="0.55" fill="none" opacity=".7"/>'+
      '<g stroke="#FFFFFF" stroke-width="0.22" opacity=".55" fill="none">'+
        '<path d="M10.6 23.8 Q6 22.8 2.4 23.6"/><path d="M10.8 24.4 Q6.4 24.6 3 26"/></g>';
  }

  // Hauskatze (getigert), Dreiviertel nach links. Runder Kopf mit kurzer Schnauze; grosse,
  // aufrechte Dreiecksohren mit Haarbueschel innen; abstehendes Backenfell; das "M" auf der
  // Stirn und Streifen; gruengelbe Augen mit Schlitzpupille; kleine rosa Nase.
  function figKatzeEinzeln(){
    var f = figSid(), v = figSid(), w = figSid();
    var streifen = '<g fill="#4C4A54" opacity=".6">'+
      '<path d="M22 9.6 Q23 9 23.8 9.8 L23 15 Q22.6 15.4 22.2 15 Z"/>'+
      '<path d="M18.4 10.8 Q19.4 10.2 20 11 L20.2 15.4 Q19.8 15.8 19.4 15.4 Z"/>'+
      '<path d="M26 10.6 Q26.8 10.4 27.4 11.2 L26 15.4 Q25.6 15.6 25.4 15.2 Z"/>'+
      '<path d="M30.6 17 Q32.6 17.4 33.6 18.6 L30.4 19 Z"/><path d="M30.8 21 Q32.8 21.6 33.8 22.8 L30.6 22.6 Z"/></g>';
    return '<defs>'+figFellFilter(f)+figKopfVerlauf(v, '#B4B2BC', '#6C6A76')+figLinear(w, '#FAF8FA', '#DCD8DE')+'</defs>'+
      '<g filter="url(#'+f+')">'+
        '<path d="M11 40 C11 33.6 15.6 30 21.6 30 C28.6 30 33.6 34 34.6 40 Z" fill="#6E6C78"/>'+
        '<path d="M16.6 40 C16.6 35.6 18.6 32.4 22 32 C24.6 33.4 25.6 36.4 25.2 40 Z" fill="url(#'+w+')"/>'+
        '<path d="M11.6 15.6 L10.4 4.4 L19 10.8 Z" fill="#7C7A86"/>'+
        '<path d="M12.6 14 L12 7.6 L16.8 11.2 Z" fill="#E6C4CC"/>'+
        '<path d="M24 10 L32.2 3.4 L32.6 15.2 Z" fill="#888692"/>'+
        '<path d="M25.6 10.6 L31 6.4 L31.2 13.6 Z" fill="#EAC8D0"/>'+
        // Backenfell: die Wangen stehen seitlich ab.
        '<path d="M9.6 20 L5.2 23.6 L8.8 23.8 L6.2 27 L11 26 Z" fill="#9A98A4"/>'+
        '<path d="M33.4 20.4 L37.4 24.6 L34 24.4 L36.2 28 L31.8 26.6 Z" fill="#8A8894"/>'+
        '<path d="M31.4 11.6 C35.4 14.6 35.8 22.4 32.4 26.8 C29.4 30.6 22.6 31.4 17.4 29.6 '+
          'C12.4 27.8 9.4 24.4 9.6 20 C9.8 14.6 14.4 10.4 20.6 9.8 C24.6 9.4 28.6 10 31.4 11.6 Z" fill="url(#'+v+')"/>'+
        // Helle Schnauze und Kinn, nach links verschoben (Drehung).
        '<path d="M12.6 23.4 C12.4 20.8 15 19.6 18 20.2 C20.8 20.8 22.6 22.8 22.2 25.4 C21.8 28.2 18.6 29.6 15.6 28.8 C13.6 28.2 12.8 25.8 12.6 23.4 Z" fill="url(#'+w+')"/>'+
        streifen+
      '</g>'+
      '<g class="fig-augen">'+
        figTierAuge(15.2, 18.2, 1.55, {iris:'#B5BD3E', pupille:'schlitz', augenForm:'mandel'}, 1)+
        figTierAuge(23.6, 17.6, 1.95, {iris:'#B5BD3E', pupille:'schlitz', augenForm:'mandel'}, -1)+
      '</g>'+
      '<path d="M15.6 22 L17.8 22 L16.7 23.4 Z" fill="#D98E98"/>'+
      '<path d="M16.7 23.4 L16.7 24.6 M16.7 24.6 Q15.6 25.6 14.4 25 M16.7 24.6 Q17.8 25.6 19 25" stroke="#4A3A3E" stroke-width="0.45" fill="none" stroke-linecap="round" opacity=".8"/>'+
      '<g stroke="#FFFFFF" stroke-width="0.2" opacity=".7" fill="none">'+
        '<path d="M14.6 24 Q9 22.6 4.4 23.2"/><path d="M14.6 24.6 Q9.2 25 5 26.6"/>'+
        '<path d="M19 24 Q25 23.2 30.4 24.2"/><path d="M19 24.6 Q24.6 25.4 29.6 27.2"/></g>';
  }

  // Braunbaer, Dreiviertel nach links. Massiger, breiter Kopf mit flacher Stirn, die in eine lange,
  // breite Schnauze uebergeht; kleine runde Ohren weit oben; kleine dunkle Augen; grosse Nase.
  function figBaerEinzeln(){
    var f = figSid(), v = figSid(), m = figSid();
    return '<defs>'+figFellFilter(f, 1.2)+figKopfVerlauf(v, '#A87448', '#5A361C')+figKopfVerlauf(m, '#D6B08A', '#9A6E48')+'</defs>'+
      '<g filter="url(#'+f+')">'+
        '<path d="M8 40 C8 32.6 14 28.4 21.6 28.4 C30 28.4 36.4 33 37.4 40 Z" fill="#5E3A1E"/>'+
        '<circle cx="14.4" cy="10.6" r="3.6" fill="#6A4222"/><circle cx="14.4" cy="10.8" r="1.8" fill="#8E623C"/>'+
        '<circle cx="28.6" cy="9.4" r="4.2" fill="#704626"/><circle cx="28.6" cy="9.6" r="2.1" fill="#94683F"/>'+
        '<path d="M33.6 13.6 C37 18 36.4 25.6 32 29.4 C27.6 33 19.6 32.8 14.6 30 C11.4 28.2 9.4 25.6 8.6 23 '+
          'C7.8 19.6 9.4 15.6 12.6 12.8 C17 9 27.6 8.4 33.6 13.6 Z" fill="url(#'+v+')"/>'+
        // Die lange Schnauze, nach links vorn.
        '<path d="M6 22.4 C5.4 19.6 8 17.6 12 17.6 C16.4 17.6 19.6 19.8 19.8 23.2 C20 26.6 16.6 28.6 12.4 28.4 C8.6 28.2 6.4 25.6 6 22.4 Z" fill="url(#'+m+')"/>'+
      '</g>'+
      '<g class="fig-augen">'+
        figTierAuge(15.6, 16.2, 1.1, {iris:'#2A1A10'}, 1)+
        figTierAuge(23.4, 15.6, 1.35, {iris:'#2A1A10'}, -1)+
      '</g>'+
      '<path d="M6.4 20.8 C6.2 19.2 7.8 18.4 9.8 18.6 C11.6 18.8 12.4 20 12 21.4 C11.6 22.6 9.6 23 8 22.6 C7 22.4 6.5 21.7 6.4 20.8 Z" fill="#1A120E"/>'+
      '<ellipse cx="8.4" cy="19.6" rx="1" ry="0.45" fill="#FFFFFF" opacity=".5"/>'+
      '<path d="M9.6 22.8 L9.8 24.6 Q8.4 25.8 7 25.2 M9.8 24.6 Q11.4 25.8 13.2 25.4" stroke="#2A1A14" stroke-width="0.55" fill="none" stroke-linecap="round" opacity=".8"/>';
  }

  // Grosser Panda, Dreiviertel nach links. Runder, breiter Kopf; ganz schwarze Ohren; die
  // Augenflecken als schraege Tropfen, der nahe groesser; weisse, vorstehende Schnauze mit
  // schwarzer Nase; schwarzes Schulterband.
  function figPandaEinzeln(){
    var f = figSid(), v = figSid();
    return '<defs>'+figFellFilter(f, 1.1)+figKopfVerlauf(v, '#FFFFFF', '#C8C6C2')+'</defs>'+
      '<g filter="url(#'+f+')">'+
        '<path d="M8 40 C8 32.6 14 28.6 21.6 28.6 C30 28.6 36.4 33 37.4 40 Z" fill="#221A16"/>'+
        '<circle cx="12.6" cy="10.8" r="4.2" fill="#221A16"/><circle cx="29.4" cy="9.6" r="4.8" fill="#221A16"/>'+
        '<path d="M34 13.4 C37.6 17.8 37 25.8 32.4 29.6 C27.6 33.4 18.6 33.2 13.6 30 C10 27.8 8 24.4 8 20.8 '+
          'C8.2 15 13.6 10.2 21 9.8 C25.8 9.6 31 10.6 34 13.4 Z" fill="url(#'+v+')"/>'+
        '<ellipse cx="14.8" cy="18.6" rx="3.2" ry="4.4" transform="rotate(32 14.8 18.6)" fill="#221A16"/>'+
        '<ellipse cx="24.6" cy="17.8" rx="3.8" ry="5.2" transform="rotate(-26 24.6 17.8)" fill="#221A16"/>'+
        '<path d="M8.4 23.6 C8.2 21 10.6 19.8 13.6 20 C16.8 20.2 19 22 19 24.6 C19 27.4 16 29 12.8 28.6 C10.2 28.2 8.6 26 8.4 23.6 Z" fill="#FAFAF8"/>'+
      '</g>'+
      '<g class="fig-augen">'+
        figTierAuge(15.4, 18.2, 1.0, {iris:'#2A1A12'}, 1)+
        figTierAuge(24.0, 17.4, 1.25, {iris:'#2A1A12'}, -1)+
      '</g>'+
      '<path d="M9.2 22.2 C9 21 10.2 20.4 11.8 20.6 C13.2 20.8 13.8 21.6 13.4 22.6 C13 23.4 11.6 23.8 10.4 23.4 C9.7 23.2 9.3 22.8 9.2 22.2 Z" fill="#1A120E"/>'+
      '<ellipse cx="10.8" cy="21.2" rx="0.8" ry="0.35" fill="#FFFFFF" opacity=".5"/>'+
      '<path d="M11.4 23.6 L11.5 25 Q10.4 26 9.2 25.4 M11.5 25 Q12.8 26 14.2 25.6" stroke="#2A1A14" stroke-width="0.5" fill="none" stroke-linecap="round" opacity=".8"/>';
  }

  // Feldhase, Dreiviertel nach links. Laenglicher Kopf; sehr lange Ohren, weit nach hinten
  // gestellt, mit schwarzen Spitzen; das grosse Auge seitlich am Kopf; gespaltene Oberlippe;
  // graubraunes Wildfell (Agouti), hell an Kinn und Kehle.
  function figHaseEinzeln(){
    var f = figSid(), v = figSid();
    // Die ganze Zeichnung um 15 % verkleinert und nach unten gerueckt: Im ersten Entwurf war der
    // Kopf so gross, dass er wie eine Kugel wirkte, und die Ohrspitzen lagen ausserhalb des Kreises.
    return '<defs>'+figFellFilter(f)+figKopfVerlauf(v, '#C8B296', '#7E6A52')+'</defs>'+
      '<g transform="translate(3.6 5.2) scale(0.85)">'+
      '<g filter="url(#'+f+')">'+
        '<path d="M12 40 C12 33.4 16.6 29.6 22.4 29.6 C29 29.6 33.8 33.6 34.8 40 Z" fill="#8A745A"/>'+
        // Ohren: das ferne schmaler, beide weit nach hinten.
        '<path d="M20.4 12.6 C18.6 7 19.4 1.4 21.8 0.6 C24 1.6 24.4 7.4 23.2 12.4 Z" fill="#9A846A"/>'+
        '<path d="M21.6 2 C22.6 1.6 23.4 3 23.2 4.6 L21.4 4.4 Z" fill="#2A1E14"/>'+
        '<path d="M24.6 12 C25.6 5.8 28.6 0.6 31.4 0.8 C33 2.8 31.2 8.6 27.8 13.4 Z" fill="#A89074"/>'+
        '<path d="M26 10.8 C26.8 6.2 28.8 2.8 30.6 2.6 C31.4 4.2 29.8 8.6 27.4 12 Z" fill="#E0B8B0" opacity=".7"/>'+
        '<path d="M29.6 1.2 C30.8 0.8 31.8 1.8 31.4 3.4 L29.4 3 Z" fill="#2A1E14"/>'+
        '<path d="M30.6 13.2 C34.4 16 34.6 23 31.2 27.2 C28 31 20.6 31.6 15.8 29 C12.4 27.2 9.6 24.4 9 21.4 '+
          'C8.4 17.6 11 14 15.4 12.4 C20.4 10.6 26.8 10.6 30.6 13.2 Z" fill="url(#'+v+')"/>'+
        '<path d="M9.6 23.2 C10.6 27 15.2 29.6 19.8 29.6 C17 27.8 14.2 25.6 12.8 23.4 Z" fill="#EDE2D4"/>'+
      '</g>'+
      // Das Auge seitlich, gross, mit hellem Ring — so sitzt es beim Hasen.
      '<ellipse cx="22.2" cy="18.2" rx="2.9" ry="2.6" fill="#E8DCC8" opacity=".75"/>'+
      '<g class="fig-augen">'+figTierAuge(22.2, 18.2, 1.95, {iris:'#3A2414'}, -1)+'</g>'+
      '<path d="M9.2 20.8 C9.4 19.8 10.6 19.6 11.2 20.4 C11.4 21.2 10.4 21.8 9.6 21.6 Z" fill="#C88A8E"/>'+
      '<path d="M10.4 21.6 L10.6 23 M10.6 23 Q9.6 23.8 8.8 23.4 M10.6 23 Q11.6 23.8 12.6 23.6" stroke="#4A3A30" stroke-width="0.42" fill="none" stroke-linecap="round" opacity=".8"/>'+
      '<g stroke="#F4EEE6" stroke-width="0.2" opacity=".7" fill="none">'+
        '<path d="M11.6 22.4 Q6.4 21 2.2 21.8"/><path d="M11.8 23 Q7 23.4 3 25"/></g>'+
      '</g>';
  }

  // Reh (Bock im Sommerfell), Dreiviertel nach links. Langer, schmaler Kopf, nach vorn unten;
  // grosse, weit abstehende Ohren mit hellem Inneren; das grosse dunkle Auge seitlich; schwarze,
  // glaenzende Nase und schwarzer Bart; weisses Kinn; ein kurzes Gehoern mit Perlen.
  function figRehEinzeln(){
    var f = figSid(), v = figSid();
    return '<defs>'+figFellFilter(f, 0.8)+figKopfVerlauf(v, '#D69A62', '#8A5428')+'</defs>'+
      '<path d="M22.8 10.6 L22 4.4 L20.4 2.6 M22 4.4 L23.8 2.8 M26.2 10.8 L27.6 4.2 L26.4 2.4 M27.6 4.2 L29.6 3" '+
        'stroke="#6A4A30" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'+
      '<g filter="url(#'+f+')">'+
        // Der Hals: lang und schraeg — im ersten Entwurf sass der Kopf ohne ihn auf einem Ring.
        '<path d="M15.6 40 C16.4 35 17.2 31 18.6 26.6 L28.6 22.6 C30 28 31.6 34 33 40 Z" fill="#9A5E2C"/>'+
        // Der weisse Kehlfleck vorn am Hals, wo er beim Reh sitzt.
        '<path d="M18.4 27.4 C17.6 30.4 17 33 16.6 35.6 C18.8 33.8 20 30.8 20.6 27.8 Z" fill="#F2E8DA"/>'+
        '<path d="M18 13.4 C13.6 10.4 10 9.6 9 11 C9.6 13.6 13.4 15.8 17.4 16.4 Z" fill="#B67A44"/>'+
        '<path d="M16.4 14.4 C13.6 12.6 11.4 12 10.8 12.6 C11.4 14 13.8 15.2 16.2 15.6 Z" fill="#EAD8C2"/>'+
        '<path d="M28.6 12.2 C32.4 8.6 36.6 7.6 37.8 9.2 C37.2 12.4 33.2 15 29.4 15.8 Z" fill="#B67A44"/>'+
        '<path d="M30 12.8 C32.6 10.6 35.4 9.8 36.2 10.6 C35.6 12.6 32.8 14.4 30.4 14.8 Z" fill="#EAD8C2"/>'+
        // Langer Kopf, die Schnauze nach links unten.
        '<path d="M30.4 13.6 C32.8 17.2 32.2 22.4 29 25.8 C25.4 29.4 19 31.4 14 30.8 C10.8 30.4 8.2 29 7.6 27.4 '+
          'C7.2 25.8 8.6 24.4 10.8 22.8 C13.2 21 15.2 17.6 17.2 14.6 C20.4 10.2 27.4 9.4 30.4 13.6 Z" fill="url(#'+v+')"/>'+
        '<path d="M8.2 28 C10 30.4 14.6 31.2 18.4 30.4 C15.6 29.6 12.4 28.8 10.6 27.4 Z" fill="#F4ECE0"/>'+
      '</g>'+
      '<g class="fig-augen">'+figTierAuge(21.6, 18.6, 1.85, {iris:'#22140C'}, -1)+'</g>'+
      // Nase und Bart schwarz, glaenzend.
      '<path d="M7.2 25.6 C7 24.2 8.4 23.4 10 23.8 C11 24.2 11.2 25.4 10.4 26.2 C9.4 27 7.6 26.8 7.2 25.6 Z" fill="#14100C"/>'+
      '<ellipse cx="8.4" cy="24.6" rx="0.8" ry="0.35" fill="#FFFFFF" opacity=".55"/>'+
      '<path d="M8 27.4 C9.4 28.4 11.2 28.4 12.2 27.8" stroke="#14100C" stroke-width="0.6" fill="none" stroke-linecap="round" opacity=".7"/>';
  }

  // Dackel (rot, Langhaar-freier Kurzhaar), Dreiviertel nach links. Langer Kopf mit langer,
  // schmaler Schnauze und kaum Stopp; lange, weich haengende Ohren; dunkle Mandelaugen; grosse
  // schwarze Nase.
  function figDackelEinzeln(){
    var f = figSid(), v = figSid();
    return '<defs>'+figFellFilter(f, 0.75)+figKopfVerlauf(v, '#C07A42', '#6E3A16')+'</defs>'+
      '<g filter="url(#'+f+')">'+
        '<path d="M12 40 C12 33.2 16.8 29.4 23 29.4 C30 29.4 35 33.6 36 40 Z" fill="#7A4220"/>'+
        '<path d="M15.6 31 C17 26.6 20 24.8 24 24.6 L30.4 22 C31.6 26 31.4 30 30.6 33 Z" fill="#7E4422"/>'+
        '<path d="M30.4 13.6 C34.4 16 35.6 21.6 34.8 27 C34.2 31 32.4 33.4 30.6 33 C28.6 32.6 28.4 28.4 28.6 24.4 Z" fill="#5E3014"/>'+
        '<path d="M31.6 12.6 C34 16.8 33 22.4 29.6 25.6 C25.6 29.2 18.4 30 13.2 28.6 L5.6 26.6 '+
          'C4.2 26.2 3.8 24.4 5 23.6 L12.4 19.6 C14.6 14.2 20 10.6 25.6 10.6 C28.2 10.6 30.4 11.2 31.6 12.6 Z" fill="url(#'+v+')"/>'+
        '<path d="M5.6 26.6 L13.2 28.6 C17 29.6 21.4 29.6 25 28.6 C20 28 14.6 26.6 10.6 25.2 Z" fill="#A86434"/>'+
      '</g>'+
      '<g class="fig-augen">'+
        figTierAuge(15.6, 18.6, 1.2, {iris:'#3A2210'}, 1)+
        figTierAuge(22.8, 17.6, 1.55, {iris:'#3A2210'}, -1)+
      '</g>'+
      '<path d="M3.4 23.8 C3.2 22.4 4.6 21.6 6.4 22 C7.6 22.4 7.8 23.6 7 24.4 C6 25.2 4 25 3.4 23.8 Z" fill="#14100C"/>'+
      '<ellipse cx="4.8" cy="22.8" rx="0.8" ry="0.35" fill="#FFFFFF" opacity=".55"/>'+
      '<path d="M5.6 25.6 Q9.6 27 14.4 26.4" stroke="#2A1A14" stroke-width="0.55" fill="none" opacity=".7"/>';
  }

  // Golden Retriever, Dreiviertel nach links. Breiter Schaedel mit deutlichem Stopp; mittellange,
  // kraeftige Schnauze; Hangohren mit langem, welligem Fell; gutmuetige dunkle Augen; das offene,
  // hechelnde Maul mit Zunge — so sieht ein froehlicher Retriever wirklich aus.
  function figRetrieverEinzeln(){
    var f = figSid(), v = figSid(), m = figSid();
    return '<defs>'+figFellFilter(f, 1.2)+figKopfVerlauf(v, '#F0C682', '#B07A36')+figKopfVerlauf(m, '#F8DCA8', '#C89650')+'</defs>'+
      '<g filter="url(#'+f+')">'+
        '<path d="M10 40 C10 32.8 15.4 28.8 22.4 28.8 C30 28.8 35.6 33.2 36.6 40 Z" fill="#C08A44"/>'+
        '<path d="M31.6 12.8 C35.8 15 37.4 21.4 36.4 27.6 C35.8 31.4 33.6 33.6 31.6 33 C29.4 32.4 29 28 29.4 23.4 Z" fill="#B47C38"/>'+
        '<path d="M32.6 13 C35.6 17 35 23.6 31.4 27.4 C27.4 31.4 19.6 32 14.6 30 C11.8 28.8 10 26.8 9.8 24.6 '+
          'C9.6 21.6 11.6 19.4 13.8 17.6 C15.4 13.6 20 10.2 25.6 10 C28.8 9.9 31.2 11 32.6 13 Z" fill="url(#'+v+')"/>'+
        // Die Schnauze, nach links vorn.
        '<path d="M5 22.8 C4.6 20.2 7.2 18.6 10.8 18.8 C14.6 19 17.4 21 17.4 24 C17.4 27 14.4 28.6 10.6 28.2 C7.4 27.8 5.4 25.6 5 22.8 Z" fill="url(#'+m+')"/>'+
      '</g>'+
      '<g class="fig-augen">'+
        figTierAuge(16.6, 17.4, 1.2, {iris:'#3A2210'}, 1)+
        figTierAuge(24.2, 16.8, 1.5, {iris:'#3A2210'}, -1)+
      '</g>'+
      '<path d="M4.4 21.6 C4.2 20.2 5.6 19.4 7.4 19.8 C8.6 20.2 8.8 21.4 8 22.2 C7 23 5 22.8 4.4 21.6 Z" fill="#1A120E"/>'+
      '<ellipse cx="5.8" cy="20.6" rx="0.8" ry="0.35" fill="#FFFFFF" opacity=".55"/>'+
      // Offenes Maul, Zunge.
      '<path d="M6.4 24.4 C9 27.8 13.4 28.6 16.2 26.2 C13.4 26.4 9.6 25.6 6.4 24.4 Z" fill="#4A1E16"/>'+
      '<path d="M9.4 25.8 C9.8 28.6 11.4 30.2 13 29.8 C14 29.2 14 27.4 13.6 26.4 Z" fill="#E4899A"/>';
  }

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
    var s = figSid(), fe = figSid();
    var feder = '';
    [[15.6,30.2],[19,31.6],[22.4,30.2],[25.6,31.8],[13.2,33],[17.6,34.4],[21.6,34],[26.4,34.6]].forEach(function(q){
      feder += '<path d="M'+q[0]+' '+q[1]+' Q'+(q[0]+0.5)+' '+(q[1]+1.4)+' '+q[0]+' '+(q[1]+2.6)+' Q'+(q[0]-0.5)+' '+(q[1]+1.4)+' '+q[0]+' '+q[1]+' Z"/>';
    });
    return '<defs><radialGradient id="'+s+'" cx="0.5" cy="0.45" r="0.55"><stop offset="0" stop-color="#EBD8B8"/>'+
           '<stop offset="0.72" stop-color="#D2B48A"/><stop offset="1" stop-color="#6E5236"/></radialGradient>'+
           // Runde 119: dieselbe Struktur wie beim Fell — auf Gefieder wirkt sie genauso.
           figFellFilter(fe, 0.9)+'</defs>'+
      '<g filter="url(#'+fe+')">'+
      '<path d="M20 30 C13.6 30 8.6 33.8 7.4 40 L32.6 40 C31.4 33.8 26.4 30 20 30 Z" fill="#9C7C54"/>'+
      // Ohrbueschel: mehrere Federspitzen statt eines Dreiecks.
      '<path d="M9.6 13.6 L9.4 5.4 L11.6 9 L12.4 4.6 L14 9.6 L16.4 11.2 Z" fill="#7A5C3C"/>'+
      '<path d="M30.4 13.6 L30.6 5.4 L28.4 9 L27.6 4.6 L26 9.6 L23.6 11.2 Z" fill="#7A5C3C"/>'+
      figPlastisch(20, 22, 13.5, 13, '#A28058')+
      // Gesichtsschleier: zwei helle Scheiben mit dunklem Rand.
      '<circle cx="14.6" cy="20.2" r="6.8" fill="#5A4028" opacity=".55"/><circle cx="25.4" cy="20.2" r="6.8" fill="#5A4028" opacity=".55"/>'+
      '<circle cx="14.6" cy="20.2" r="6.1" fill="url(#'+s+')"/><circle cx="25.4" cy="20.2" r="6.1" fill="url(#'+s+')"/>'+
      '</g>'+
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
    {id:'fuchs', feld:'#F6E6D8', svg:figFuchsEinzeln},
    {id:'katze', feld:'#E6E4EA', svg:figKatzeEinzeln},
    {id:'baer',  feld:'#EFE3D6', svg:figBaerEinzeln},
    {id:'panda', feld:'#D8DAD6', svg:figPandaEinzeln},
    {id:'hase',  feld:'#F1E7EC', svg:figHaseEinzeln},
    {id:'reh',   feld:'#EEE7D9', svg:figRehEinzeln},
    // Zwei Hunde. Beide teilen den Kopf-Bauplan und unterscheiden sich in Fell, Schnauze und
    // Miene — genau das, was sie auch in echt unterscheidet.
    {id:'dackel', feld:'#F0E3D2', svg:figDackelEinzeln},
    {id:'retriever', feld:'#F7EBD6', svg:figRetrieverEinzeln},
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

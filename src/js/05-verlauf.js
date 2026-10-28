// ---------- history (trend sparklines + list of past completed runs) ----------
  var HISTORY_DATE_FMT = null;
  // Startseiten-Teaser: eine zufaellige Karte aus UNDERSTAND.
  function pickRandomUnderstandCard(){
    var dims = Object.keys(UNDERSTAND);
    var dim = dims[Math.floor(Math.random()*dims.length)];
    var pole = Math.random()<0.5 ? 'high' : 'low';
    var pool = UNDERSTAND[dim][pole];
    return pool[Math.floor(Math.random()*pool.length)];
  }
  // Die Verstehen-Karte erscheint auf der Startseite erst, wenn ein Ergebnis vorliegt.
  function renderLandingUnderstandTeaser(){
    var has = !!loadResult();
    $('landingUnderstandTeaser').style.display = has ? '' : 'none';
    if (!has) return;
    var card = pickRandomUnderstandCard();
    $('landingTeaserTitle').textContent = card.title;
    $('landingTeaserBody').textContent = card.body;
  }
  // Gemeinsamer Leerzustand: Symbol, Text, optional ein Knopf.
  function emptyStateHTML(message, opts){
    opts = opts || {};
    var extra = opts.extraClass ? (' '+opts.extraClass) : '';
    var btn = opts.btnId
      ? '<button type="button" class="btn btn-primary btn-sm" id="'+opts.btnId+'">'+opts.btnLabel+'</button>'
      : '';
    return '<div class="profile-empty'+extra+'">'
      + '<svg class="empty-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-dasharray="2.5 3.2"></circle><path d="M12 8v4l2.3 2.3"></path></svg>'
      + '<p>'+message+'</p>'+btn+'</div>';
  }
  // Ein Baustein fuer alle verschlossenen Stellen. Nennt, was dahinter liegt; kein Countdown, keine
  // erfundene Dringlichkeit.
  function schlossHTML(text){
    return '<div class="schloss">'+
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" '+
        'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+
        '<rect x="4" y="10.5" width="16" height="10.5" rx="2.4"></rect>'+
        '<path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9"></path></svg>'+
      '<div><p class="schloss-text">'+text+'</p>'+
      '<button type="button" class="btn btn-primary btn-sm schloss-btn" data-plus-info>'+
      plusKnopfText('plus_knopf')+'</button></div></div>';
  }
  // Meldet der Store eine Probezeit fuer dieses Konto, nennt jede Sperre sie; sonst der gewohnte Text.
  function plusKnopfText(sonst){
    var n = typeof probeTage === 'function' ? probeTage() : 0;
    return n ? tfText('plus_cta_probe', {n: n}) : tx(sonst || 'plus_freischalten');
  }
  // Gesperrte Stellen zeigen den ECHTEN Inhalt verschwommen, darueber das Angebot (Entscheidung des
  // Inhabers). Der Inhalt ist aria-hidden und inert; nur der Knopf ist bedienbar.
  function vorschauHTML(innenHTML, text){
    return '<div class="plus-vorschau">'+
      '<div class="plus-unscharf" aria-hidden="true" inert>'+innenHTML+'</div>'+
      '<div class="plus-vorschau-karte">'+
        '<p class="plus-vorschau-text">'+text+'</p>'+
        '<button type="button" class="btn btn-primary btn-sm" data-plus-info>'+plusKnopfText()+'</button>'+
      '</div></div>';
  }
  // Ein Tipp oeffnet das Lucenta+-Fenster (kein Toast — der verschwaende zu schnell).
  function schloesserVerdrahten(wurzel){
    if (!wurzel || !wurzel.querySelectorAll) return;
    wurzel.querySelectorAll('[data-plus-info]').forEach(function(b){
      b.addEventListener('click', openPlusModal);
    });
  }
  function historyDateFmt(){
    if (!HISTORY_DATE_FMT){
      // Gebietsschema aus dem Sprachpaket; resetDateFmt() leert den Zwischenspeicher beim
      // Sprachwechsel.
      try{ HISTORY_DATE_FMT = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {day:'2-digit', month:'short', year:'numeric'}); }
      catch(e){ HISTORY_DATE_FMT = { format:function(d){ return d.toLocaleDateString(); } }; }
    }
    return HISTORY_DATE_FMT;
  }
  // Kurzes Achsenformat (Tag und Monat), Reihenfolge aus dem Gebietsschema.
  var ACHSE_DATE_FMT = null;
  function achsenDatumFmt(){
    if (!ACHSE_DATE_FMT){
      try{ ACHSE_DATE_FMT = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {day:'2-digit', month:'2-digit'}); }
      catch(e){ ACHSE_DATE_FMT = { format:function(d){ return d.toLocaleDateString(); } }; }
    }
    return ACHSE_DATE_FMT;
  }
  // Beim Ablesen nur Tag und Monat, sonst bricht die Zeile bei 320 pt um.
  var ABLESE_DATE_FMT = null;
  function ableseDatumFmt(){
    if (!ABLESE_DATE_FMT){
      try{ ABLESE_DATE_FMT = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {day:'numeric', month:'short'}); }
      catch(e){ ABLESE_DATE_FMT = achsenDatumFmt(); }
    }
    return ABLESE_DATE_FMT;
  }
  function resetDateFmt(){ HISTORY_DATE_FMT = null; ACHSE_DATE_FMT = null; ABLESE_DATE_FMT = null; }
  // Verlaufszeile: Datum und Titel untereinander, fuehrende Dimension als Marke rechts, ihr Pol als
  // Kante links; der juengste Eintrag hervorgehoben. Bewusst ohne neue Texte.
  function verlaufZeileHTML(e, istNeuste){
    var a = archetypeOf(e.scores);
    var titel = NOUN[a.top1][e.scores[a.top1]>=50?'high':'low'] + ' · ' +
                ADJ[a.top2][e.scores[a.top2]>=50?'high':'low'];
    var datum = ''; try{ datum = historyDateFmt().format(new Date(e.date)); }catch(ex){}
    var pol = e.scores[a.top1]>=50 ? 'high' : 'low';
    return '<div class="history-row history-pol-'+pol+(istNeuste?' history-neu':'')+'">'+
      '<div class="history-body">'+
        '<div class="history-date">'+datum+'</div>'+
        '<div class="history-title">'+titel+'</div>'+
      '</div>'+
      '<div class="history-dim mono">'+RADAR_LABELS[a.top1]+'</div>'+
      '</div>';
  }
  // Kurve einer Dimension: feste Flaeche 300x64, Breite aus dem Stilblatt (Punkte bleiben rund). Die
  // Verlaufs-ID traegt die Dimension, weil fuenf Kurven in einem Dokument stehen.
  function trendKurveSVG(values, f){
    var w = 300, h = 64, px = 6, py = 7;
    var n = values.length;
    // Die Hoehe zeigt den Wertebereich, nicht 0–100 (wie Apple Health), mindestens 24 Punkte Spanne.
    var lo = Math.min.apply(null, values), hi = Math.max.apply(null, values);
    var fehlt = Math.max(0, 24 - (hi - lo));
    lo = Math.max(0, lo - 4 - fehlt/2); hi = Math.min(100, hi + 4 + fehlt/2);
    if (hi - lo < 24){ if (lo === 0) hi = 24; else lo = 76; }
    var yVon = function(v){ return py + (1 - (v - lo)/(hi - lo))*(h-2*py); };
    var pts = values.map(function(v, i){
      return [px + (n > 1 ? i/(n-1) : .5)*(w-2*px), yVon(v)];
    });
    var linie = pts.map(function(p, i){ return (i ? 'L' : 'M')+p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' ');
    var flaeche = linie+' L'+pts[n-1][0].toFixed(1)+','+(h-1)+' L'+pts[0][0].toFixed(1)+','+(h-1)+' Z';
    // Die Linie bei 50 nur, wenn sie im gezeigten Bereich liegt — sie ist die Mitte der Skala.
    var mitte = (lo < 50 && hi > 50) ? yVon(50).toFixed(1) : null;
    var id = 'trendFl-'+f;
    var punkte = pts.slice(0, -1).map(function(p){
      return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="2.6" fill="var(--surface)" stroke="var(--trend-farbe)" stroke-width="1.6"/>';
    }).join('');
    var z = pts[n-1];
    return '<svg class="trend-kurve" viewBox="0 0 '+w+' '+h+'" role="img" aria-hidden="true">'+
      '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1">'+
        '<stop offset="0" stop-color="var(--trend-farbe)" stop-opacity=".30"/>'+
        '<stop offset="1" stop-color="var(--trend-farbe)" stop-opacity="0"/></linearGradient></defs>'+
      (mitte ? '<line x1="0" y1="'+mitte+'" x2="'+w+'" y2="'+mitte+'" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 4"/>' : '')+
      '<path class="trend-flaeche" d="'+flaeche+'" fill="url(#'+id+')"/>'+
      '<path class="trend-linie" d="'+linie+'" fill="none" stroke="var(--trend-farbe)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="100"/>'+
      punkte+
      '<circle cx="'+z[0].toFixed(1)+'" cy="'+z[1].toFixed(1)+'" r="7" fill="var(--trend-farbe)" opacity=".18"/>'+
      '<circle cx="'+z[0].toFixed(1)+'" cy="'+z[1].toFixed(1)+'" r="4.2" fill="var(--trend-farbe)" stroke="var(--surface)" stroke-width="1.8"/>'+
      '</svg>';
  }
  var VERLAUF_KURZ = 3;
  var CHEVRON_RECHTS = '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"></path></svg>';
  function renderHistory(){
    $('historyMaxCount').textContent = MAX_HISTORY;
    var alle = loadHistory();
    // Die freie Fassung zeigt die letzten FREI_DURCHLAEUFE Durchlaeufe; geloescht wird nichts.
    var verborgen = istPlus() ? 0 : Math.max(0, alle.length - FREI_DURCHLAEUFE);
    var hist = verborgen ? alle.slice(-FREI_DURCHLAEUFE) : alle;
    var wrap = $('historyContent');
    if (hist.length===0){
      wrap.innerHTML = emptyStateHTML(tx('js_noch_kein_testdurchlauf_ge'));
      return;
    }
    if (hist.length<2){
      // Der erste Durchlauf wird gezeigt, nicht verschwiegen.
      wrap.innerHTML =
        '<div class="history-list">'+verlaufZeileHTML(hist[0], true)+'</div>'+
        tx('js_dein_erster_durchlauf_ist');
      return;
    }
    // Neben dem Stand die Veraenderung ueber die GEZEIGTE Strecke. Das Vorzeichen ist die Aussage, die
    // Farbe traegt keine (hoch ist nicht besser). Form nach Apple Health; die Farbe kennzeichnet die
    // Dimension.
    var trendRows = ORDER.map(function(f){
      var vals = hist.map(function(e){ return e.scores[f]; });
      var last = vals[vals.length-1];
      var d = last - vals[0];
      var delta = (d > 0 ? '+' : (d < 0 ? '−' : '±')) + Math.abs(d);
      return '<div class="trend-row" style="--trend-farbe:var(--dim-'+f.toLowerCase()+')">'+
        '<div class="trend-kopf"><span class="trend-name">'+LABELS[f]+'</span>'+
        '<span class="trend-val mono">'+last+'</span>'+
        '<span class="trend-delta mono">'+delta+'</span></div>'+
        trendKurveSVG(vals, f)+'</div>';
    }).join('');
    var spanne = '';
    try{
      var fmt = historyDateFmt();
      spanne = '<div class="trend-spanne"><span>'+fmt.format(new Date(hist[0].date))+'</span>'+
        '<span>'+fmt.format(new Date(hist[hist.length-1].date))+'</span></div>';
    }catch(ex){}
    var zeilen = hist.slice().reverse().map(function(e,i){ return verlaufZeileHTML(e, i===0); });
    var schloss = verborgen ? schlossHTML(tx('plus_verlauf_a') + verborgen + tx('plus_verlauf_b')) : '';
    // Im Profil nur die letzten VERLAUF_KURZ; die ganze Liste auf der Unterseite (Auftrag des Inhabers).
    var mehr = zeilen.length > VERLAUF_KURZ;
    wrap.innerHTML = '<div class="trend-list">'+trendRows+spanne+'</div>'+
      tx('js_frühere_ergebnisse')+hist.length+'</span></h2>'+
      '<div class="history-list">'+zeilen.slice(0, VERLAUF_KURZ).join('')+'</div>'+
      (mehr ? '<button type="button" class="hilfe-knopf verlauf-alle" id="btnVerlaufAlle"><span>'+
        tx('verlauf_alle_ansehen')+' ('+zeilen.length+')</span>'+CHEVRON_RECHTS+'</button>' : schloss);
    schloesserVerdrahten(wrap);
    var alle = $('verlaufAlleListe');
    if (alle){ alle.innerHTML = '<div class="history-list">'+zeilen.join('')+'</div>'+schloss; schloesserVerdrahten(alle); }
  }

  
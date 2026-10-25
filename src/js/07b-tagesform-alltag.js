// ---------- Tagesform: Bruecke zu den fuenf Dimensionen ----------
// Fuenf kurze Fragen am Tag, je Dimension eine (Auftrag des Inhabers). Fachlich: Das Mittel einer
// Dimension ist stabil, der einzelne Tag nicht (Fleeson 2001) — das Testergebnis als Mitte, der Alltag
// als Band darum.
// Kein zweiter Test: Die Darstellung zeigt LAGE, keine Differenz zum Testwert, und keine
// Diagnosesprache (Richtlinie 1.4.1).
// Frei: Eintragen, Erinnerung, die letzten FREI_TAGE Tage, laufender Monat, Bandbreite ueber diese
// Tage. Lucenta+: ganzer Verlauf, alle Monate, Stichwort-Zusammenhaenge, Wochentagsmuster.

  // Fragen in der Reihenfolge ORDER (Farben wie im Radar); linker Pol = Stufe 1. Saetze mit
  // Platzhaltern statt Bruchstuecken (Japanisch und Tuerkisch stellen das Verb ans Ende).
  function tfText(schluessel, werte){
    var t = tx(schluessel);
    Object.keys(werte || {}).forEach(function(k){ t = t.split('{'+k+'}').join(String(werte[k])); });
    return t;
  }

  // Die Schluessel der Pole ausgeschrieben statt zusammengesetzt: So steht jeder als ganzer
  // Schluessel im Code und ist fuer das i18n-Audit als solcher zu erkennen.
  var TF_POLE = {O:['tf_pol_O_links','tf_pol_O_rechts'], E:['tf_pol_E_links','tf_pol_E_rechts'],
                 C:['tf_pol_C_links','tf_pol_C_rechts'], A:['tf_pol_A_links','tf_pol_A_rechts'],
                 S:['tf_pol_S_links','tf_pol_S_rechts']};

  var tfOceanGewaehlt = {};
  var tfTagsGewaehlt = [];

  function tfFragenRendern(){
    var wrap = $('tfOceanFragen');
    if (!wrap) return;
    wrap.innerHTML = ORDER.map(function(d){
      return '<div class="state-question tf-frage" style="--tf-farbe:var(--dim-'+d.toLowerCase()+')">'+
        '<div class="tf-frage-kopf"><span class="tf-frage-punkt" aria-hidden="true"></span>'+
          '<span class="tf-frage-name">'+LABELS[d]+'</span></div>'+
        '<div class="state-q-sub"><span>'+tx(TF_POLE[d][0])+'</span><span>'+tx(TF_POLE[d][1])+'</span></div>'+
        '<div class="scale-row" id="tfOcean'+d+'" role="group" aria-label="'+
          LABELS[d]+': '+tx(TF_POLE[d][0])+' – '+tx(TF_POLE[d][1])+'"></div>'+
      '</div>';
    }).join('');
    ORDER.forEach(function(d){ tfFrageReihe(d); });
  }
  function tfFrageReihe(d){
    var reihe = $('tfOcean'+d);
    if (!reihe) return;
    buildScaleRow(reihe, tfOceanGewaehlt[d] || null, LABELS[d], function(v){
      // Ein zweiter Tipp auf dieselbe Stufe nimmt die Antwort zurück. Die Fragen sind freiwillig,
      // und ohne diesen Weg wäre eine einmal berührte Frage nicht mehr unbeantwortet zu machen.
      if (tfOceanGewaehlt[d] === v) delete tfOceanGewaehlt[d]; else tfOceanGewaehlt[d] = v;
      tfFrageReihe(d);
    });
  }

  function tfStichworteRendern(){
    var wrap = $('tfStichworte');
    if (!wrap) return;
    wrap.innerHTML = STICHWORTE.map(function(t){
      var an = tfTagsGewaehlt.indexOf(t) >= 0;
      return '<button type="button" class="tf-chip" data-tag="'+t+'" aria-pressed="'+(an?'true':'false')+'">'+
        tx('tf_tag_'+t)+'</button>';
    }).join('');
    if (!wrap.querySelectorAll) return;
    wrap.querySelectorAll('[data-tag]').forEach(function(b){
      b.addEventListener('click', function(){
        var t = b.getAttribute('data-tag'), i = tfTagsGewaehlt.indexOf(t);
        if (i >= 0) tfTagsGewaehlt.splice(i, 1); else tfTagsGewaehlt.push(t);
        tapFeedback();
        tfStichworteRendern();
      });
    });
  }
  function tfErfassungZuruecksetzen(){
    tfOceanGewaehlt = {};
    tfTagsGewaehlt = [];
    tfFragenRendern();
    tfStichworteRendern();
  }
  // Was beim Speichern zu Energie und Stimmung dazukommt. Leere Teile fallen weg (siehe
  // tfOceanBereinigen/tfTagsBereinigen in 03-speicherung.js).
  function tfErfassungExtra(){
    var o = {};
    ORDER.forEach(function(d){ if (tfOceanGewaehlt[d]) o[d] = tfOceanGewaehlt[d]; });
    return {ocean:o, tags:tfTagsGewaehlt.slice()};
  }

  // ---------- Die gezeigten Tage ----------
  // Eine Stelle fuer die Grenze, damit Bandbreite und Verlauf ueber dieselben Tage sprechen.
  function tfSichtbareTage(){
    var tage = stateTage(loadStateHistory());
    return istPlus() ? tage.slice(-fensterLesen()) : tage.slice(-FREI_TAGE);
  }

  // ---------- Bandbreite ----------
  // Je Dimension Band, mittlere Haelfte, Mittel und — falls vorhanden — das Testergebnis. 1–5 wird auf
  // 0–100 gelegt, nur fuer dieselbe Linie (Lage, nicht Rechnung).
  var TF_MIN_TAGE = 3;
  function tfQuantil(sortiert, q){
    if (!sortiert.length) return 0;
    var pos = (sortiert.length - 1) * q, u = Math.floor(pos), o = Math.ceil(pos);
    return sortiert[u] + (sortiert[o] - sortiert[u]) * (pos - u);
  }
  function tfBandbreite(tage){
    var aus = {};
    ORDER.forEach(function(d){
      var werte = tage.filter(function(t){ return t.ocean && typeof t.ocean[d] === 'number'; })
                      .map(function(t){ return (t.ocean[d] - 1) * 25; })
                      .sort(function(a, b){ return a - b; });
      if (werte.length < TF_MIN_TAGE) return;
      aus[d] = {
        anzahl: werte.length,
        min: werte[0], max: werte[werte.length - 1],
        q1: tfQuantil(werte, 0.25), q3: tfQuantil(werte, 0.75),
        mittel: werte.reduce(function(a, b){ return a + b; }, 0) / werte.length
      };
    });
    return aus;
  }
  function tfBandbreiteRendern(){
    var wrap = $('tfBandbreite');
    if (!wrap) return;
    var tage = tfSichtbareTage();
    var bb = tfBandbreite(tage);
    var dims = ORDER.filter(function(d){ return bb[d]; });
    var titel = '<h2 class="section-title section-title-sub">'+tx('tf_bandbreite_titel')+'</h2>';
    if (!dims.length){
      var mitFragen = tage.filter(function(t){ return !!t.ocean; }).length;
      wrap.innerHTML = titel + '<p class="tf-leer">'+
        (mitFragen ? tfText('tf_bandbreite_noch', {n: mitFragen, min: TF_MIN_TAGE})
                   : tx('tf_bandbreite_leer'))+'</p>';
      return;
    }
    var res = loadResult();
    var pct = function(v){ return Math.max(0, Math.min(100, v)).toFixed(1) + '%'; };
    var zeilen = dims.map(function(d){
      var b = bb[d];
      var test = res && typeof res[d] === 'number' ? res[d] : null;
      var beschr = tx('tf_bandbreite_alltag') + ' ' + Math.round(b.min) + '–' + Math.round(b.max) +
                   (test !== null ? ' · ' + tx('tf_bandbreite_test') + ' ' + test : '');
      return '<div class="tf-band-zeile" style="--tf-farbe:var(--dim-'+d.toLowerCase()+');--tf-farbe-text:var(--dim-'+d.toLowerCase()+'-text)" role="img" aria-label="'+
          LABELS[d]+': '+beschr+'">'+
        '<div class="tf-band-kopf"><span class="tf-band-name">'+LABELS[d]+'</span>'+
          '<span class="tf-band-werte mono" aria-hidden="true">'+beschr+'</span></div>'+
        '<div class="tf-band-spur" aria-hidden="true">'+
          '<span class="tf-band-mitte50"></span>'+
          '<span class="tf-band-ganz" style="left:'+pct(b.min)+';width:'+pct(b.max - b.min)+'"></span>'+
          '<span class="tf-band-kern" style="left:'+pct(b.q1)+';width:'+pct(b.q3 - b.q1)+'"></span>'+
          '<span class="tf-band-mittel" style="left:'+pct(b.mittel)+'"></span>'+
          (test !== null ? '<span class="tf-band-test" style="left:'+pct(test)+'"></span>' : '')+
        '</div>'+
      '</div>';
    }).join('');
    // Der eine Satz darunter nennt die Dimension mit dem breitesten Band — das, wonach jemand
    // beim Hinsehen ohnehin sucht. Ab zwei Dimensionen, sonst gäbe es nichts zu vergleichen.
    var satz = '';
    if (dims.length >= 2){
      var breit = dims.slice().sort(function(a, b){ return (bb[b].max - bb[b].min) - (bb[a].max - bb[a].min); })[0];
      satz = '<p class="tf-band-satz">'+tfText('tf_bandbreite_satz',
             {dim: LABELS[breit], min: Math.round(bb[breit].min), max: Math.round(bb[breit].max)})+'</p>';
    }
    var legende = '<div class="tf-band-legende" aria-hidden="true">'+
      '<span><i class="tf-lg-band"></i>'+tx('tf_bandbreite_lg_band')+'</span>'+
      '<span><i class="tf-lg-mittel"></i>'+tx('tf_bandbreite_lg_mittel')+'</span>'+
      (res ? '<span><i class="tf-lg-test"></i>'+tx('tf_bandbreite_lg_test')+'</span>' : '')+
    '</div>';
    var inhalt = '<div class="tf-band-karte">'+ zeilen + legende + '</div>' + satz +
      '<p class="tf-hinweis">'+tx(res ? 'tf_bandbreite_grenze' : 'tf_bandbreite_ohne_test')+'</p>';
    // Runde 127, Entscheidung des Inhabers: Bandbreite nur mit Lucenta+, frei als verschwommene
    // Vorschau der EIGENEN Bandbreite — gerechnet wird sie trotzdem, sonst gaebe es nichts zu zeigen.
    wrap.innerHTML = titel + (istPlus() ? inhalt : vorschauHTML(inhalt, tx('tf_bandbreite_plus')));
    schloesserVerdrahten(wrap);
  }

  // ---------- Monatskalender ----------
  // Ein Feld je Tag, gefaerbt nach Stimmung oder Energie; jedes Feld traegt seine Werte als Namen.
  // Frei der laufende Monat.
  var tfKalenderVersatz = 0;    // 0 = laufender Monat, -1 = Vormonat, ...
  var tfKalenderGroesse = 'valence';
  function tfMonatsAnfang(versatz){
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + versatz, 1);
  }
  function tfTagSchluessel(d){
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function tfKalenderZellen(versatz, tageNachSchluessel){
    var anfang = tfMonatsAnfang(versatz);
    // Montag als erster Wochentag (ISO).
    var leer = (anfang.getDay() + 6) % 7;
    var tageImMonat = new Date(anfang.getFullYear(), anfang.getMonth() + 1, 0).getDate();
    var zellen = [];
    for (var i = 0; i < leer; i++) zellen.push(null);
    for (var t = 1; t <= tageImMonat; t++){
      var schluessel = tfTagSchluessel(new Date(anfang.getFullYear(), anfang.getMonth(), t));
      zellen.push({nr: t, day: schluessel, tag: tageNachSchluessel[schluessel] || null});
    }
    return zellen;
  }
  var tfKalenderWahl = '';
  function tfZahl(x){ return zahl1(x); }
  function tfDiff(x){ var t = zahl1(Math.abs(x)); return (x > 0.05 ? '+' : x < -0.05 ? '−' : '±') + t; }
  // Monat auf einen Blick: Durchschnitte, Eintragstage, Vergleich zum Vormonat (ab drei Tagen dort).
  function tfMonatUeberblick(alle, anfang){
    var key = tfTagSchluessel(anfang).slice(0, 7);
    var vor = new Date(anfang.getFullYear(), anfang.getMonth() - 1, 1), keyVor = tfTagSchluessel(vor).slice(0, 7);
    var mittel = function(liste, g){ return liste.reduce(function(a, t){ return a + t[g]; }, 0) / liste.length; };
    var dieser = alle.filter(function(t){ return t.day.slice(0, 7) === key; });
    if (!dieser.length) return '<p class="tf-kal-ueberblick">'+tx('tf_kal_tippen')+'</p>';
    var zeile = tx('tf_kal_schnitt').split('{e}').join(tfZahl(mittel(dieser, 'energy'))).split('{s}').join(tfZahl(mittel(dieser, 'valence')))
      .split('{n}').join(String(dieser.length));
    var vorige = alle.filter(function(t){ return t.day.slice(0, 7) === keyVor; });
    var vgl = vorige.length >= 3 ? '<br>'+tx('tf_kal_vgl').split('{e}').join(tfDiff(mittel(dieser, 'energy') - mittel(vorige, 'energy')))
      .split('{s}').join(tfDiff(mittel(dieser, 'valence') - mittel(vorige, 'valence'))) : '';
    return '<p class="tf-kal-ueberblick">'+zeile+vgl+'</p>';
  }
  // Die Eintraege eines Tages: je Tageszeit Werte und Stichworte.
  function tfTagDetails(tag){
    if (!tag) return '<p class="tf-kal-hinweis">'+tx('tf_kal_tippen')+'</p>';
    var datum = tag;
    try{ datum = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {weekday:'long', day:'numeric', month:'long'}).format(new Date(tag + 'T12:00:00')); }catch(e){}
    var eintraege = loadStateHistory().filter(function(e){ return e.day === tag; })
      .sort(function(a, b){ return TF_ABSCHNITTE.indexOf(a.slot || zeitabschnitt(a.ts)) - TF_ABSCHNITTE.indexOf(b.slot || zeitabschnitt(b.ts)); });
    if (!eintraege.length) return '<div class="tf-kal-tag-titel">'+datum+'</div><p class="tf-kal-hinweis">'+tx('tf_kal_kein_eintrag')+'</p>';
    return '<div class="tf-kal-tag-titel">'+datum+'</div><ul class="tf-kal-eintraege">'+eintraege.map(function(e){
      return '<li><span class="tf-kal-zeit">'+tx('tf_abschnitt_'+(e.slot || zeitabschnitt(e.ts)))+'</span>'+
        '<span>'+tx('js_energie')+'&nbsp;'+e.energy+'/5 · '+tx('js_stimmung')+'&nbsp;'+e.valence+'/5</span>'+
        (e.tags && e.tags.length ? '<span class="tf-liste-tags">'+e.tags.map(function(t){ return tx('tf_tag_'+t); }).join(' · ')+'</span>' : '')+'</li>';
    }).join('')+'</ul>';
  }
  function tfKalenderRendern(){
    var wrap = $('tfKalender');
    if (!wrap) return;
    var plus = istPlus();
    if (!plus) tfKalenderVersatz = 0;
    var alle = stateTage(loadStateHistory());
    var nachSchluessel = {};
    alle.forEach(function(t){ nachSchluessel[t.day] = t; });
    var anfang = tfMonatsAnfang(tfKalenderVersatz);
    var frueheste = alle.length ? alle[0].day : todayKey();
    var zurueckMoeglich = plus && tfTagSchluessel(anfang) > frueheste.slice(0, 8) + '01';
    var monatName = '';
    try{ monatName = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {month:'long', year:'numeric'}).format(anfang); }
    catch(e){ monatName = tfTagSchluessel(anfang).slice(0, 7); }
    var wochentage = [];
    try{
      var wf = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {weekday:'narrow'});
      // 2024-01-01 war ein Montag.
      for (var w = 0; w < 7; w++) wochentage.push(wf.format(new Date(2024, 0, 1 + w)));
    }catch(e){ wochentage = ['1','2','3','4','5','6','7']; }
    var heute = todayKey();
    var zellen = tfKalenderZellen(tfKalenderVersatz, nachSchluessel).map(function(z){
      if (!z) return '<span class="tf-kal-zelle tf-kal-leer" aria-hidden="true"></span>';
      var wert = z.tag ? z.tag[tfKalenderGroesse] : null;
      var stufe = wert === null ? 0 : Math.max(1, Math.min(5, Math.round(wert)));
      var name = z.nr + '';
      var label = z.tag ? (tx('js_energie')+' '+tagWert(z.tag.energy)+'/5, '+tx('js_stimmung')+' '+tagWert(z.tag.valence)+'/5')
                        : tx('tf_kal_kein_eintrag');
      // Seit Runde 161 Knoepfe (Entscheidung des Inhabers): ein Tipp zeigt die Eintraege des Tages darunter.
      return '<button type="button" class="tf-kal-zelle'+(z.tag ? ' tf-kal-st'+stufe : '')+
        (z.day === heute ? ' tf-kal-tag0' : '')+(z.day === tfKalenderWahl ? ' tf-kal-wahl' : '')+'" data-kal-tag="'+z.day+'" '+
        'aria-pressed="'+(z.day === tfKalenderWahl ? 'true' : 'false')+'" aria-label="'+z.nr+'. '+monatName+': '+label+'"><span aria-hidden="true">'+name+'</span></button>';
    }).join('');
    var karte =
      '<div class="tf-kal-karte">'+
        '<div class="tf-kal-kopf">'+
          '<button type="button" class="tf-kal-pfeil" data-kal="-1" aria-label="'+tx('tf_kal_vormonat')+'"'+(zurueckMoeglich?'':' disabled')+'>‹</button>'+
          '<span class="tf-kal-monat">'+monatName+'</span>'+
          '<button type="button" class="tf-kal-pfeil" data-kal="1" aria-label="'+tx('tf_kal_folgemonat')+'"'+(tfKalenderVersatz < 0?'':' disabled')+'>›</button>'+
        '</div>'+
        '<div class="segment tf-kal-groesse" role="radiogroup" aria-label="'+tx('tf_kal_groesse')+'">'+
          ['valence','energy'].map(function(g){
            return '<button type="button" class="segment-opt" role="radio" data-groesse="'+g+'" aria-checked="'+(g===tfKalenderGroesse?'true':'false')+'">'+
              '<span class="segment-preis">'+tx(g === 'energy' ? 'js_energie' : 'js_stimmung')+'</span></button>';
          }).join('')+
        '</div>'+
        tfMonatUeberblick(alle, anfang)+
        '<div class="tf-kal-wochentage" aria-hidden="true">'+wochentage.map(function(w){ return '<span>'+w+'</span>'; }).join('')+'</div>'+
        '<div class="tf-kal-raster">'+zellen+'</div>'+
        '<div class="tf-kal-skala" aria-hidden="true"><span>1</span>'+
          [1,2,3,4,5].map(function(s){ return '<i class="tf-kal-st'+s+'"></i>'; }).join('')+'<span>5</span></div>'+
        '<div class="tf-kal-details" aria-live="polite">'+tfTagDetails(tfKalenderWahl)+'</div>'+
      '</div>';
    // Runde 127: Kalender nur mit Lucenta+, frei verschwommen (laufender Monat, echte Tage).
    wrap.innerHTML = '<h2 class="section-title section-title-sub">'+tx('tf_kal_titel')+'</h2>'+
      (plus ? karte : vorschauHTML(karte, tx('tf_kal_plus')));
    schloesserVerdrahten(wrap);
    if (!wrap.querySelectorAll) return;
    wrap.querySelectorAll('[data-kal]').forEach(function(b){
      b.addEventListener('click', function(){
        if (b.disabled) return;
        tfKalenderVersatz = Math.min(0, tfKalenderVersatz + parseInt(b.getAttribute('data-kal'), 10));
        tapFeedback();
        tfKalenderRendern();
      });
    });
    wrap.querySelectorAll('[data-kal-tag]').forEach(function(b){
      b.addEventListener('click', function(){
        var t = b.getAttribute('data-kal-tag');
        tfKalenderWahl = tfKalenderWahl === t ? '' : t;
        tfKalenderRendern();
      });
    });
    wrap.querySelectorAll('[data-groesse]').forEach(function(b){
      b.addEventListener('click', function(){
        tfKalenderGroesse = b.getAttribute('data-groesse');
        tapFeedback();
        tfKalenderRendern();
      });
    });
  }

  // ---------- Muster (Lucenta+) ----------
  // Wochentage und Stichworte ueber alle Tage. Genug Tage auf BEIDEN Seiten und mindestens ein halber
  // Skalenpunkt Unterschied. Ein Zusammenhang, keine Ursache: "an Tagen mit", nie "wegen".
  var TF_STICHWORT_MIN = 3;
  function tfStichwortBefunde(tage){
    var aus = [];
    STICHWORTE.forEach(function(t){
      var mit = tage.filter(function(x){ return x.tags && x.tags.indexOf(t) >= 0; });
      var ohne = tage.filter(function(x){ return !x.tags || x.tags.indexOf(t) < 0; });
      if (mit.length < TF_STICHWORT_MIN || ohne.length < TF_STICHWORT_MIN) return;
      ['valence','energy'].forEach(function(g){
        var m = mit.reduce(function(a, x){ return a + x[g]; }, 0) / mit.length;
        var o = ohne.reduce(function(a, x){ return a + x[g]; }, 0) / ohne.length;
        if (Math.abs(m - o) >= 0.5) aus.push({tag:t, groesse:g, mit:m, ohne:o, anzahl:mit.length});
      });
    });
    // Die deutlichsten zuerst, höchstens vier: Mehr wäre eine Tabelle, kein Befund.
    return aus.sort(function(a, b){ return Math.abs(b.mit - b.ohne) - Math.abs(a.mit - a.ohne); }).slice(0, 4);
  }
  function tfWochentagMittel(tage){
    var summe = [], n = [];
    for (var i = 0; i < 7; i++){ summe.push({energy:0, valence:0}); n.push(0); }
    tage.forEach(function(t){
      var d;
      try{ d = (new Date(t.ts).getDay() + 6) % 7; }catch(e){ return; }
      summe[d].energy += t.energy; summe[d].valence += t.valence; n[d]++;
    });
    return summe.map(function(s, i){
      return n[i] ? {energy: s.energy / n[i], valence: s.valence / n[i], anzahl: n[i]} : null;
    });
  }
  function tfTageszeitMittel(eintraege){
    return TF_ABSCHNITTE.map(function(a){
      var l = eintraege.filter(function(e){ return (e.slot || zeitabschnitt(e.ts)) === a; });
      if (l.length < 3) return null;
      return {energy: l.reduce(function(x, e){ return x + e.energy; }, 0) / l.length,
              valence: l.reduce(function(x, e){ return x + e.valence; }, 0) / l.length, anzahl: l.length};
    });
  }
  // Was die besten und die schwierigeren Tage gemeinsam haben (je ein Fuenftel, mindestens drei Tage):
  // Wochentag, Tageszeit, Stichwort — nur wenn es deutlich haeufiger vorkommt als sonst. "an Tagen mit".
  function tfBesteSchwere(tage, eintraege){
    if (tage.length < 14) return '';
    var wert = function(t){ return (t.energy + t.valence) / 2; };
    var sortiert = tage.slice().sort(function(a, b){ return wert(b) - wert(a); });
    var n = Math.max(3, Math.round(tage.length / 5));
    var wtName = function(i){ try{ return new Intl.DateTimeFormat(tx('datum_gebietsschema'), {weekday:'long'}).format(new Date(2024, 0, 1 + i)); }catch(e){ return String(i + 1); } };
    var wtVon = function(t){ return (new Date(t.ts).getDay() + 6) % 7; };
    var anteilGesamt = function(test){ return tage.filter(test).length / tage.length; };
    var beschreibe = function(gruppe){
      var teile = [];
      var zaehle = function(werte){ var z = {}; werte.forEach(function(v){ z[v] = (z[v] || 0) + 1; }); return Object.keys(z).sort(function(a, b){ return z[b] - z[a]; }).map(function(k){ return [k, z[k]]; }); };
      var wt = zaehle(gruppe.map(wtVon))[0];
      if (wt && wt[1] >= Math.max(2, gruppe.length * 0.35) && wt[1] / gruppe.length >= anteilGesamt(function(t){ return wtVon(t) === +wt[0]; }) * 1.5)
        teile.push(tx('tf_gemeinsam_wt').split('{wt}').join(wtName(+wt[0])));
      var tageSet = {}; gruppe.forEach(function(t){ tageSet[t.day] = 1; });
      var dieseEintraege = eintraege.filter(function(e){ return tageSet[e.day]; });
      var zt = zaehle(dieseEintraege.map(function(e){ return e.slot || zeitabschnitt(e.ts); }))[0];
      if (zt && dieseEintraege.length && zt[1] / dieseEintraege.length >= 0.5 && zt[1] / dieseEintraege.length >= eintraege.filter(function(e){ return (e.slot || zeitabschnitt(e.ts)) === zt[0]; }).length / eintraege.length * 1.3)
        teile.push(tx('tf_gemeinsam_zeit').split('{zeit}').join(tx('tf_abschnitt_'+zt[0]).toLowerCase()));
      var besterTag = null, bestWert = 0;
      STICHWORTE.forEach(function(s){
        var hier = gruppe.filter(function(t){ return t.tags && t.tags[s]; }).length / gruppe.length;
        var sonst = anteilGesamt(function(t){ return t.tags && t.tags[s]; });
        if (hier >= 0.4 && hier - sonst >= 0.15 && hier - sonst > bestWert){ bestWert = hier - sonst; besterTag = s; }
      });
      if (besterTag) teile.push(tx('tf_gemeinsam_tag').split('{tag}').join(tx('tf_tag_'+besterTag)));
      return teile.length ? teile.join(' · ') : tx('tf_gemeinsam_nichts');
    };
    return '<div class="tf-muster-karte tf-beste"><div class="befund-titel">'+tx('tf_beste_titel')+'</div>'+
      '<div class="befund"><div class="befund-titel">'+tx('tf_beste_tage')+'</div><p class="befund-text">'+beschreibe(sortiert.slice(0, n))+'</p></div>'+
      '<div class="befund"><div class="befund-titel">'+tx('tf_schwere_tage')+'</div><p class="befund-text">'+beschreibe(sortiert.slice(-n))+'</p></div>'+
      '<p class="tf-hinweis">'+tx('tf_beste_hinweis')+'</p></div>';
  }
  // Einmal, wenn der siebte Tag erfasst ist: Das erste Muster ist da.
  var ERSTES_MUSTER = 'lucenta_erstes_muster';
  function erstesMusterMelden(){
    if (istPlus() || stateTage(loadStateHistory()).length < 7) return;
    try{
      if (localStorage.getItem(ERSTES_MUSTER)) return;
      localStorage.setItem(ERSTES_MUSTER, '1');
    }catch(e){ return; }
    toast(tx('tf_erstes_muster_da'), 3500);
  }
  function tfMusterRendern(){
    var wrap = $('tfMuster');
    if (!wrap) return;
    var tage = stateTage(loadStateHistory());
    var titel = '<h2 class="section-title section-title-sub">'+tx('tf_muster_titel')+'</h2>';
    // Unter sieben Tagen gibt es nichts zu verschliessen und nichts zu zeigen — der Abschnitt
    // bleibt dann leer, statt eine Kaufaufforderung vor ein leeres Bild zu stellen.
    if (tage.length < 7){ wrap.innerHTML = ''; return; }
    var teile = [];
    var wt = tfWochentagMittel(tage);
    if (wt.filter(Boolean).length >= 3){
      var namen = [];
      try{
        var wf = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {weekday:'short'});
        for (var w = 0; w < 7; w++) namen.push(wf.format(new Date(2024, 0, 1 + w)));
      }catch(e){ namen = ['1','2','3','4','5','6','7']; }
      var saeule = function(v, art){
        return v === null ? '<i class="tf-wt-saeule tf-wt-'+art+' tf-wt-ohne"></i>'
                          : '<i class="tf-wt-saeule tf-wt-'+art+'" style="height:'+((v - 1) / 4 * 100).toFixed(0)+'%"></i>';
      };
      teile.push('<div class="tf-muster-karte"><div class="befund-titel">'+tx('tf_muster_wochentage')+'</div>'+
        '<div class="tf-wt-bild" role="img" aria-label="'+tx('tf_muster_wochentage_aria')+'">'+
          wt.map(function(m, i){
            return '<div class="tf-wt-tag"><div class="tf-wt-saeulen">'+
              saeule(m ? m.energy : null, 'energie') + saeule(m ? m.valence : null, 'stimmung') +
              '</div><span class="tf-wt-name">'+namen[i]+'</span></div>';
          }).join('')+
        '</div>'+
        '<div class="verlauf-legende tf-wt-legende">'+
          '<span class="vl-eintrag"><span class="vl-punkt vl-energie"></span>'+tx('js_energie')+'</span>'+
          '<span class="vl-eintrag"><span class="vl-punkt vl-stimmung"></span>'+tx('js_stimmung')+'</span>'+
        '</div></div>');
    }
    var tz = tfTageszeitMittel(loadStateHistory());
    if (tz.filter(Boolean).length >= 2){
      var saeuleTz = function(v, art){
        return v === null ? '<i class="tf-wt-saeule tf-wt-'+art+' tf-wt-ohne"></i>'
                          : '<i class="tf-wt-saeule tf-wt-'+art+'" style="height:'+((v - 1) / 4 * 100).toFixed(0)+'%"></i>';
      };
      teile.push('<div class="tf-muster-karte"><div class="befund-titel">'+tx('tf_muster_tageszeit')+'</div>'+
        '<div class="tf-wt-bild tf-tz-bild" role="img" aria-label="'+tz.map(function(m, i){ return tx('tf_abschnitt_'+TF_ABSCHNITTE[i])+(m ? ': '+tx('js_energie')+' '+zahl1(m.energy)+', '+tx('js_stimmung')+' '+zahl1(m.valence) : ''); }).join('; ')+'">'+
          tz.map(function(m, i){
            return '<div class="tf-wt-tag"><div class="tf-wt-saeulen">'+saeuleTz(m ? m.energy : null, 'energie')+saeuleTz(m ? m.valence : null, 'stimmung')+
              '</div><span class="tf-wt-name">'+tx('tf_abschnitt_'+TF_ABSCHNITTE[i])+'</span></div>';
          }).join('')+
        '</div>'+
        '<div class="verlauf-legende tf-wt-legende">'+
          '<span class="vl-eintrag"><span class="vl-punkt vl-energie"></span>'+tx('js_energie')+'</span>'+
          '<span class="vl-eintrag"><span class="vl-punkt vl-stimmung"></span>'+tx('js_stimmung')+'</span>'+
        '</div></div>');
    }
    var bs = tfBesteSchwere(tage, loadStateHistory());
    if (bs) teile.push(bs);
    var sb = tfStichwortBefunde(tage);
    if (sb.length){
      teile.push('<div class="befund-liste">'+sb.map(function(b){
        var hoeher = b.mit > b.ohne;
        return '<div class="befund"><div class="befund-titel">'+tx('tf_tag_'+b.tag)+'</div>'+
          '<p class="befund-text">'+tfText(b.groesse === 'energy' ? (hoeher ? 'tf_stichwort_energie_hoeher' : 'tf_stichwort_energie_tiefer')
                                          : (hoeher ? 'tf_stichwort_stimmung_hoeher' : 'tf_stichwort_stimmung_tiefer'),
            {tag: tx('tf_tag_'+b.tag), mit: zahl1(b.mit), ohne: zahl1(b.ohne), n: b.anzahl})+'</p></div>';
      }).join('')+'</div>'+
      '<p class="tf-hinweis">'+tx('tf_stichwort_grenze')+'</p>');
    } else if (tage.filter(function(t){ return !!t.tags; }).length){
      teile.push('<p class="tf-leer">'+tx('tf_stichwort_noch')+'</p>');
    }
    // Frei ist das ERSTE Muster ab sieben Tagen, die uebrigen als verschwommene Vorschau der echten
    // (Entscheidung des Inhabers): erst ein Gewinn, dann das Angebot.
    if (!istPlus()){
      wrap.innerHTML = titel + (teile.length
        ? '<p class="tf-muster-frei">'+tx('tf_muster_erstes_frei')+'</p>'+teile[0]+
          (teile.length > 1 ? vorschauHTML(teile.slice(1).join(''), tx('tf_muster_plus')) : '<p class="tf-leer">'+tx('tf_muster_plus')+'</p>')
        : '<p class="tf-leer">'+tx('tf_muster_plus')+'</p>');
      schloesserVerdrahten(wrap);
      return;
    }
    wrap.innerHTML = teile.length ? titel + teile.join('') : '';
  }

  // Alles unter der Erfassung auf einmal. Steht hier, damit renderStateView() und das Speichern
  // dieselbe Liste aufrufen und keine der Auswertungen nach einem Eintrag auf dem alten Stand bleibt.
  function tfAuswertungenRendern(){
    tfBandbreiteRendern();
    tfKalenderRendern();
    tfMusterRendern();
  }

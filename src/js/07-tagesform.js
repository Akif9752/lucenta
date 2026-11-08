// ---------- Tagesform / State-Check view ----------
  var statePickedEnergy = null, statePickedValence = null;
  function buildScaleRow(container, picked, labelPrefix, onPick){
    container.innerHTML='';
    for (var v=1; v<=5; v++){
      var b = document.createElement('button');
      var isPicked = picked===v;
      b.className='scale-btn'+(isPicked?' picked':'');
      b.setAttribute('aria-label', labelPrefix+' '+v+tx('js_von'));
      b.setAttribute('aria-pressed', isPicked?'true':'false');
      b.innerHTML='<span class="fill"></span>';
      (function(val){ b.addEventListener('click', function(){ onPick(val); }); })(v);
      container.appendChild(b);
    }
  }
  function renderStateRows(){
    buildScaleRow($('stateEnergyRow'), statePickedEnergy, tx('js_energie'), function(v){ statePickedEnergy=v; renderStateRows(); });
    buildScaleRow($('stateValenceRow'), statePickedValence, tx('js_stimmung'), function(v){ statePickedValence=v; renderStateRows(); });
  }

  // Eigene Auswahl-Variablen fuer die Startseiten-Karte, getrennt von der Tagesform-Ansicht — beide
  // duerfen gleichzeitig offen sein.
  var landingStatePickedEnergy = null, landingStatePickedValence = null;
  function renderLandingStateRows(){
    buildScaleRow($('landingStateEnergyRow'), landingStatePickedEnergy, tx('js_energie_heute'), function(v){ landingStatePickedEnergy=v; renderLandingStateRows(); maybeSaveLandingState(); });
    buildScaleRow($('landingStateValenceRow'), landingStatePickedValence, tx('js_stimmung_heute'), function(v){ landingStatePickedValence=v; renderLandingStateRows(); maybeSaveLandingState(); });
  }
  function updateLandingStateCopy(){
    // Nach der ersten Antwort benennt die Zeile, was noch fehlt (Quittung, keine Aufforderung).
    var e = landingStatePickedEnergy, v = landingStatePickedValence;
    $('landingStateCopy').textContent =
      (e && !v) ? tx('js_energie_ist_notiert__fehlt') :
      (v && !e) ? tx('js_stimmung_ist_notiert__fehl') :
      tx('js_kurzer_check_von_energie');
  }
  // `animate` nur direkt nach dem Speichern.
  // Uhrzeiten ueber Intl aus dem Gebietsschema. Die Grenzen stehen einmal, in TF_ABSCHNITT_BEGINN
  // (03-speicherung.js).
  function tfUhrzeit(stunde){
    var d = new Date(2000, 0, 1, stunde, 0, 0);
    try{ return new Intl.DateTimeFormat(tx('datum_gebietsschema'), {hour:'numeric', minute:'2-digit'}).format(d); }
    catch(e){ return String(stunde).padStart(2,'0') + ':00'; }
  }
  // "Naechster Eintrag ab 17:00" bzw. nach dem Abend "Morgen frueh geht es weiter".
  function tfNaechsterText(abschnitt){
    var i = TF_ABSCHNITTE.indexOf(abschnitt);
    if (i < 0 || i === TF_ABSCHNITTE.length - 1) return tx('tf_naechster_morgen');
    return tfText('tf_naechster_ab', {zeit: tfUhrzeit(TF_ABSCHNITT_BEGINN[TF_ABSCHNITTE[i+1]])});
  }
  // Drei Punkte mit Namen: gefuellt = eingetragen, Ring = jetzt dran. `neu` bekommt die
  // Fuell-Animation — nur direkt nach dem Speichern, aus demselben Grund wie bei just-saved.
  function tfAbschnitteRendern(neu){
    var heute = heuteEingetragen(), jetzt = gewaehlterAbschnitt(), laufend = TF_ABSCHNITTE.indexOf(aktuellerAbschnitt());
    var offenFrueher = TF_ABSCHNITTE.some(function(s, i){ return i < laufend && !heute[s]; });
    ['landingTfAbschnitte', 'stateTfAbschnitte'].forEach(function(id){
      var wrap = $(id);
      if (!wrap) return;
      // Fruehere und laufende Tageszeit sind antippbar (nachtragen), spaetere nicht.
      wrap.innerHTML = TF_ABSCHNITTE.map(function(s, i){
        // Zustaende als vollstaendige data-Attribute: audit_i18n.py erkennt Bezeichner am Kontext.
        var zustand = (heute[s] ? ' data-belegt="1"' : '') + (s === jetzt ? ' data-jetzt="1"' : '') +
                      (s === neu && !prefersReducedMotion() ? ' data-neu="1"' : '');
        var innen = '<span class="tf-abschnitt-punkt" aria-hidden="true"></span><span>'+tx('tf_abschnitt_'+s)+'</span>';
        var label = tx('tf_abschnitt_'+s)+': '+tx(heute[s] ? 'tf_abschnitt_voll' : 'tf_abschnitt_offen');
        return i <= laufend
          ? '<button type="button" class="tf-abschnitt"'+zustand+' data-tf-abschnitt="'+s+'" aria-pressed="'+(s === jetzt ? 'true' : 'false')+'" aria-label="'+label+'">'+innen+'</button>'
          : '<span class="tf-abschnitt"'+zustand+' role="img" aria-label="'+label+'">'+innen+'</span>';
      }).join('') + (offenFrueher && jetzt === aktuellerAbschnitt() ? '<p class="tf-abschnitt-hinweis">'+tx('tf_abschnitt_nachtragen')+'</p>' : '');
    });
  }
  function showLandingStateDone(entry, animate){
    $('landingStateInputs').style.display = 'none';
    $('landingStateCopy').style.display = 'none';
    var done = $('landingStateDone');
    // Die Karte bestaetigt die Tageszeit mit dem Wert genau dieses Eintrags und nennt, wann der
    // naechste moeglich ist. Ohne "/5", damit es neben "Aendern" einzeilig bleibt.
    $('landingStateDoneTitel').textContent = tfText('tf_abschnitt_eingetragen', {abschnitt: tx('tf_abschnitt_'+entry.slot)});
    $('landingStateDoneVals').textContent =
      tx('js_energie_praefix')+tagWert(entry.energy)+tx('js_trenner_stimmung')+tagWert(entry.valence);
    $('landingStateNaechster').textContent = tfNaechsterText(entry.slot);
    done.style.display = 'flex';
    notizBereichAnwenden('landing', entry);
    done.classList.remove('just-saved');
    if (animate){
      // Neustart der Animation erzwingen, falls am selben Tag mehrfach geändert wird
      void done.offsetWidth;
      done.classList.add('just-saved');
    }
  }
  function showLandingStateInputs(){
    $('landingStateDone').style.display = 'none';
    notizBereichAnwenden('landing', null);
    aufklappen($('landingStateInputs'));     // Runde 131: wieder auf, wie es zugeklappt ist
    $('landingStateCopy').style.display = '';
    updateLandingStateCopy();
  }
  function maybeSaveLandingState(){
    if (!landingStatePickedEnergy || !landingStatePickedValence){ updateLandingStateCopy(); return; }
    var ok = addStateEntry(landingStatePickedEnergy, landingStatePickedValence, {slot: gewaehlterAbschnitt()});
    if (!ok){
      toast(tx('js_konnte_nicht_gespeichert_w'));
      return;
    }
    var abschnitt = gewaehlterAbschnitt();
    tfAbschnittWahl = null;
    setTimeout(function(){ haptik('ok'); }, 120);
    erstesMusterMelden();
    // Die Karte bestaetigt selbst (kein Toast). Erst klappen die Skalen zu, dann springt die
    // Bestaetigung auf; geleert werden die Skalen erst danach.
    var eintrag = heuteEingetragen()[abschnitt];
    $('landingStateCopy').style.display = 'none';
    zuklappen($('landingStateInputs'), function(){
      showLandingStateDone(eintrag, true);
      tfAbschnitteRendern(abschnitt);
      setTimeout(function(){ funkenAn(document.querySelector('#landingStateDone .state-done-check')); }, 200);
      landingStatePickedEnergy = null; landingStatePickedValence = null;
      renderLandingStateRows();
    });
    profilWegeAnwenden();
    erinnerungNachziehen();
    erinnerungFrageAnwenden();
  }
  function renderLandingStateTeaser(){
    // Runde 129: "erledigt" heisst jetzt: der LAUFENDE Abschnitt ist eingetragen. Wer morgens
    // eingetragen hat, sieht mittags wieder die Skalen.
    var eintrag = heuteEingetragen()[gewaehlterAbschnitt()];
    // Die Skalen stehen beim Wiederkommen leer; "Aendern" ersetzt den Eintrag des Abschnitts.
    landingStatePickedEnergy = null;
    landingStatePickedValence = null;
    renderLandingStateRows();
    tfAbschnitteRendern(null);
    if (eintrag){ showLandingStateDone(eintrag, false); }
    else { showLandingStateInputs(); }
    erinnerungFrageAnwenden();
  }
  // Befunde aus der Tagesform — nur bei genug Daten und mit benannten Grenzen.
  // Schwankungsbreite ab 7 Tagen; Wochentagsmuster ab 14 Tagen und mindestens zwei Messungen je
  // Wochentag.
  function streuung(werte){
    var n = werte.length;
    if (n < 2) return 0;
    var m = werte.reduce(function(a,b){ return a+b; }, 0) / n;
    var q = werte.reduce(function(a,b){ return a + (b-m)*(b-m); }, 0) / (n-1);
    return Math.sqrt(q);
  }

  function tagesformBefunde(hist){
    var teile = [];
    // Gerechnet auf TAGEN, nicht Eintraegen.
    var tage = stateTage(hist);
    if (tage.length < 7) return teile;

    // 1) Schwankungsbreite neben dem Stabilitätswert
    var sE = streuung(tage.map(function(e){ return e.energy; }));
    var sS = streuung(tage.map(function(e){ return e.valence; }));
    var res = loadResult();
    var satz = tx('js_befund_schwankung_a') + tage.length + tx('js_befund_schwankung_b') +
               zahl1(sE) + tx('js_befund_schwankung_c') + zahl1(sS) + tx('js_befund_schwankung_d');
    if (res && typeof res.S === 'number'){
      satz += ' ' + tx('js_befund_stabil_a') + res.S + tx('js_befund_stabil_b');
    }
    satz += ' ' + tx('js_befund_grenze');
    teile.push({titel: tx('js_befund_titel_schwankung'), text: satz});

    // 2) Wochentagsmuster
    if (tage.length >= 14){
      var proTag = [];
      for (var i=0;i<7;i++) proTag.push([]);
      tage.forEach(function(e){
        var d;
        try{ d = new Date(e.ts).getDay(); }catch(x){ return; }
        if (typeof d === 'number') proTag[d].push(e.energy);
      });
      var kandidaten = [];
      for (var t=0;t<7;t++){
        if (proTag[t].length >= 2){
          var m = proTag[t].reduce(function(a,b){ return a+b; },0) / proTag[t].length;
          kandidaten.push({tag:t, mittel:m, anzahl:proTag[t].length});
        }
      }
      if (kandidaten.length >= 3){
        kandidaten.sort(function(a,b){ return b.mittel - a.mittel; });
        var hoch = kandidaten[0], tief = kandidaten[kandidaten.length-1];
        // Ein Unterschied unter einem halben Skalenpunkt ist bei einer Fünferskala Rauschen.
        if (hoch.mittel - tief.mittel >= 0.5){
          teile.push({titel: tx('js_befund_titel_wochentag'),
            text: tx('js_befund_wochentag_a') + wochentagName(hoch.tag) + tx('js_befund_wochentag_b') +
                  wochentagName(tief.tag) + tx('js_befund_wochentag_c')});
        }
      }
    }

    // 3) Tageszeit: mindestens drei Messungen je Abschnitt und mindestens ein halber Skalenpunkt
    // Unterschied (darunter Rauschen).
    var proAbschnitt = {morgen:[], mittag:[], abend:[]};
    hist.forEach(function(e){
      if (proAbschnitt[e.slot]) proAbschnitt[e.slot].push(e.energy);
    });
    var abKand = ['morgen','mittag','abend'].filter(function(k){ return proAbschnitt[k].length >= 3; })
      .map(function(k){
        var w = proAbschnitt[k];
        return {slot:k, mittel: w.reduce(function(a,b){ return a+b; },0) / w.length, anzahl:w.length};
      });
    if (abKand.length >= 2){
      abKand.sort(function(a,b){ return b.mittel - a.mittel; });
      var aHoch = abKand[0], aTief = abKand[abKand.length-1];
      if (aHoch.mittel - aTief.mittel >= 0.5){
        teile.push({titel: tx('js_befund_titel_tageszeit'),
          text: tx('js_befund_tageszeit_a') + tx('js_abschnitt_'+aHoch.slot) + tx('js_befund_tageszeit_b') +
                tx('js_abschnitt_'+aTief.slot) + tx('js_befund_tageszeit_c') +
                zahl1(aHoch.mittel - aTief.mittel) + tx('js_befund_tageszeit_d')});
      }
    }
    // 4) Richtung ueber die Zeit: Steigung einer Ausgleichsgeraden (robuster als Haelfte gegen
    // Haelfte), ab 21 Tagen und nur ab einem halben Skalenpunkt ueber den Zeitraum.
    if (tage.length >= 21){
      var basis = tagAlsZahl(tage[0].day);
      var richtung = ['energy','valence'].map(function(feld){
        var punkte = tage.map(function(t){ return {x: tagAlsZahl(t.day) - basis, y: t[feld]}; })
                         .filter(function(pk){ return !isNaN(pk.x); });
        return {feld:feld, steigung: steigungVon(punkte),
                spanne: punkte.length ? (punkte[punkte.length-1].x - punkte[0].x) : 0};
      });
      var staerkste = richtung.sort(function(a,b){
        return Math.abs(b.steigung * b.spanne) - Math.abs(a.steigung * a.spanne);
      })[0];
      var gesamt = staerkste.steigung * staerkste.spanne;
      if (Math.abs(gesamt) >= 0.5){
        teile.push({titel: tx('js_befund_titel_richtung'),
          text: tx('js_befund_richtung_a') + staerkste.spanne + tx('js_befund_richtung_b') +
                tx(staerkste.feld === 'energy' ? 'js_energie' : 'js_stimmung') +
                tx(gesamt > 0 ? 'js_befund_richtung_auf' : 'js_befund_richtung_ab') +
                zahl1(Math.abs(gesamt)) + tx('js_befund_richtung_c')});
      }
    }

    // 5) Erholung nach einem schwachen Tag. Schwach heisst unter dem EIGENEN Median, nicht unter der
    // Skalenmitte.
    if (tage.length >= 15){
      var med = tage.map(function(t){ return t.energy; }).sort(function(a,b){ return a-b; });
      var mitte = med.length % 2 ? med[(med.length-1)/2] : (med[med.length/2-1] + med[med.length/2]) / 2;
      var folgen = [];
      for (var j = 0; j < tage.length - 1; j++){
        if (tage[j].energy >= mitte) continue;
        // Nur, wenn der naechste Eintrag auch der naechste TAG ist. Sonst waere "am Tag darauf"
        // in Wahrheit "beim naechsten Mal, das kann auch eine Woche spaeter sein".
        if (tagAlsZahl(tage[j+1].day) - tagAlsZahl(tage[j].day) !== 1) continue;
        folgen.push(tage[j+1].energy - tage[j].energy);
      }
      if (folgen.length >= 5){
        var schnell = folgen.filter(function(d){ return d > 0; }).length;
        var anteil = Math.round(schnell / folgen.length * 100);
        teile.push({titel: tx('js_befund_titel_erholung'),
          text: tx('js_befund_erholung_a') + folgen.length + tx('js_befund_erholung_b') + anteil +
                tx('js_befund_erholung_c') +
                (anteil >= 70 ? tx('js_befund_erholung_schnell')
                              : (anteil <= 45 ? tx('js_befund_erholung_zaeh') : tx('js_befund_erholung_mittel')))});
      }
    }

    return teile;
  }
  // Steigung der Ausgleichsgeraden (kleinste Quadrate) — einmal, weil zwei Befunde sie brauchen.
  function steigungVon(punkte){
    var n = punkte.length;
    if (n < 2) return 0;
    var mx = 0, my = 0;
    punkte.forEach(function(pk){ mx += pk.x; my += pk.y; });
    mx /= n; my /= n;
    var oben = 0, unten = 0;
    punkte.forEach(function(pk){ oben += (pk.x-mx)*(pk.y-my); unten += (pk.x-mx)*(pk.x-mx); });
    return unten === 0 ? 0 : oben / unten;
  }

  // Ganze Zahlen ganz ("4/5"), Mittel mit einer Nachkommastelle.
  function tagWert(v){
    return Math.abs(v - Math.round(v)) < 0.001 ? String(Math.round(v)) : zahl1(v);
  }

  // Dezimalzeichen aus dem Gebietsschema (Intl), nicht aus einer Sprachliste.
  var ZAHL1_FMT = null, ZAHL1_FMT_SPRACHE = null;
  function zahl1(v){
    var gs = tx('datum_gebietsschema');
    try{
      if (ZAHL1_FMT_SPRACHE !== gs){
        ZAHL1_FMT = new Intl.NumberFormat(gs, {minimumFractionDigits:1, maximumFractionDigits:1});
        ZAHL1_FMT_SPRACHE = gs;
      }
      return ZAHL1_FMT.format(Math.round(v*10)/10);
    }catch(e){
      // Ohne Intl bleibt die alte Regel — falsch fuer vier Sprachen, aber immer noch besser als
      // gar keine Zahl.
      var s = (Math.round(v*10)/10).toFixed(1);
      return gs.indexOf('de') === 0 ? s.replace('.', ',') : s;
    }
  }

  var WOCHENTAG_FMT = null;
  function wochentagName(index){
    // Wochentagsnamen ueber Intl, nicht im Sprachpaket.
    try{
      if (!WOCHENTAG_FMT) WOCHENTAG_FMT = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {weekday:'long'});
      // 2024-01-07 war ein Sonntag; +index trifft damit den gesuchten Wochentag.
      return WOCHENTAG_FMT.format(new Date(Date.UTC(2024, 0, 7 + index)));
    }catch(e){ return ''; }
  }
  function resetWochentagFmt(){ WOCHENTAG_FMT = null; }

  // ---------- Begleiter ----------
  // Nur mit gewaehlter Figur. Ausdruck nach dem heutigen Mittel der Stimmung; Meilensteine zaehlen
  // Eintragstage insgesamt, nicht in Folge — nichts geht verloren (Entscheidung des Inhabers).
  var TF_MEILENSTEINE = [10, 30, 100];

  // ---------- Serie und Meilensteine (frei, Entscheidung des Inhabers) ----------
  // Serie: Tage in Folge bis heute (oder bis gestern, solange heute offen ist). Ein verpasster Tag je
  // Kalenderwoche wird verziehen, damit nichts auf null faellt. Meilensteine bleiben Eintragstage insgesamt.
  function tfTagNr(schluessel){
    var t = schluessel.split('-');
    return Math.round(new Date(+t[0], t[1] - 1, +t[2], 12).getTime() / 864e5);
  }
  function tfSerie(){
    var tage = {};
    loadStateHistory().forEach(function(e){ tage[tfTagNr(e.day)] = true; });
    var heute = tfTagNr(todayKey()), d = tage[heute] ? heute : heute - 1, n = 0, verziehen = 0, wochen = {}, geschuetzt = {};
    var wocheVon = function(x){ return Math.floor((x + (11 - wochenBeginn()) % 7) / 7); };   // Tag 0 (1.1.1970) war ein Donnerstag
    for (;;){
      if (tage[d]){ n++; d--; continue; }
      var woche = wocheVon(d);
      if (n > 0 && !wochen[woche] && tage[d - 1]){ wochen[woche] = 1; geschuetzt[d] = 1; verziehen++; d--; continue; }
      break;
    }
    return {n: n, verziehen: verziehen, heuteOffen: !tage[heute], geschuetzt: geschuetzt, schutzGenutzt: !!wochen[wocheVon(heute)]};
  }
  function tfMeilensteine(){
    var tage = stateTage(loadStateHistory());
    var erster = tage.length ? tfTagNr(tage[0].day) : null;
    var liste = TF_MEILENSTEINE.map(function(m){ return {id: 't' + m, n: m, erreicht: tage.length >= m}; });
    liste.push({id: 'jahr', erreicht: erster !== null && tfTagNr(todayKey()) - erster >= 365});
    return {tage: tage.length, liste: liste};
  }
  function tfMsName(a){ return a.id === 'jahr' ? tx('tf_ms_jahr') : tx('tf_ms_tage').split('{n}').join(String(a.n)); }
  function tfSerieRendern(){
    var wrap = $('tfSerie');
    if (!wrap) return;
    var s = tfSerie(), m = tfMeilensteine();
    if (!m.tage){ wrap.innerHTML = ''; return; }
    // Eine leise Zeile ohne Aufforderung (Entscheidung des Inhabers); der Schutztag sichtbar, der genutzte im Kalender.
    var zeile = s.n ? (s.n >= 2 ? tx('tf_serie_n').split('{n}').join(String(s.n)) : tx('tf_serie_eins')) + ' · ' +
      tx(s.schutzGenutzt ? 'tf_serie_schutz_genutzt' : 'tf_serie_schutz_frei') : '';
    wrap.innerHTML = (zeile ? '<p class="tf-serie-zeile"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6z"></path></svg>' + zeile + '</p>' : '') +
      '<div class="tf-abzeichen-titel">' + tx('tf_ms_titel') + '</div><div class="tf-abzeichen">' + m.liste.map(function(a){
        return '<div class="tf-abzeichen-stk" data-ms="' + a.id + '" data-erreicht="' + (a.erreicht ? 1 : 0) + '">' +
          '<span class="tf-abzeichen-marke" aria-hidden="true">' + (a.id === 'jahr' ? '\u2605' : a.n) + '</span>' +
          '<span class="tf-abzeichen-name">' + tfMsName(a) + (a.erreicht ? '' : '<span class="sr-only"> \u2013 ' + tx('tf_ms_offen') + '</span>') + '</span></div>';
      }).join('') + '</div>';
  }
  // Nach dem Speichern: ein neu erreichter Meilenstein wird einmal gefeiert. Beim ersten Mal (Bestand) still merken.
  var MS_SCHLUESSEL = 'lucenta_meilensteine';
  function tfMeilensteinFeiern(){
    var m = tfMeilensteine(), gefeiert = null;
    try{ gefeiert = JSON.parse(localStorage.getItem(MS_SCHLUESSEL) || 'null'); }catch(e){}
    var erreicht = m.liste.filter(function(a){ return a.erreicht; }).map(function(a){ return a.id; });
    var neu = Array.isArray(gefeiert) ? erreicht.filter(function(id){ return gefeiert.indexOf(id) < 0; }) : [];
    // Zubehoer, das mit diesem Eintrag frei wurde (nur mit gewaehlter Figur sichtbar)
    var zFrei = ZUBEHOER.filter(zubehoerFrei).map(function(z){ return z.id; }), zAlt = null;
    try{ zAlt = JSON.parse(localStorage.getItem('lucenta_zubehoer_gemeldet') || 'null'); }catch(e){}
    try{ localStorage.setItem('lucenta_zubehoer_gemeldet', JSON.stringify(zFrei)); }catch(e){}
    var zNeu = Array.isArray(zAlt) ? zFrei.filter(function(id){ return zAlt.indexOf(id) < 0; }) : [];
    if (zNeu.length) setTimeout(function(){ toast(tx('zub_neu').split('{name}').join(tx('zub_' + zNeu[0]))); }, neu.length ? 3200 : 900);
    try{ localStorage.setItem(MS_SCHLUESSEL, JSON.stringify(erreicht)); }catch(e){}
    if (!neu.length) return;
    setTimeout(function(){ haptik('max'); }, 400);
    var a = m.liste.filter(function(x){ return x.id === neu[neu.length - 1]; })[0];
    setTimeout(function(){
      toast(tx('tf_ms_neu').split('{name}').join(tfMsName(a)));
      var el = document.querySelector('[data-ms="' + a.id + '"] .tf-abzeichen-marke');
      if (el) funkenAn(el);
    }, 900);
  }
  function tfBegleiterAusdruck(heute){
    var w = TF_ABSCHNITTE.map(function(s){ return heute[s]; }).filter(Boolean);
    if (!w.length) return '';
    var m = w.reduce(function(a, e){ return a + e.valence; }, 0) / w.length;
    return m <= 2.3 ? 'muede' : m >= 3.7 ? 'froh' : '';
  }
  function tfBegleiterRendern(){
    var wrap = $('tfBegleiter'), profil = loadProfile ? loadProfile() : null;
    if (!wrap) return;
    if (!profil || !profil.figur || profil.avatarImg){ wrap.hidden = true; return; }
    var heute = heuteEingetragen(), abschnitt = aktuellerAbschnitt(), eintrag = heute[abschnitt];
    var ausdruck = tfBegleiterAusdruck(heute);
    renderAvatarInto($('tfBegleiterTier'), profil, ausdruck);
    var satz;
    if (!eintrag) satz = tx('tf_bg_' + abschnitt);
    else {
      var tage = stateTage(loadStateHistory()).length;
      satz = TF_MEILENSTEINE.indexOf(tage) >= 0 ? tx('tf_bg_meilenstein').split('{n}').join(String(tage))
           : tx(ausdruck === 'froh' ? 'tf_bg_danke_gut' : ausdruck === 'muede' ? 'tf_bg_danke_schwer' : 'tf_bg_danke');
    }
    $('tfBegleiterSatz').textContent = decodeEntities(satz);
    wrap.hidden = false;
  }
  // Nach dem Speichern: wippen und funkeln (beides an prefersReducedMotion).
  function tfBegleiterFreuen(){
    var tier = $('tfBegleiterTier');
    if (!tier || $('tfBegleiter').hidden) return;
    tierWippen(tier);
    setTimeout(function(){ funkenAn(tier); }, 250);
  }

  var tfGezeichnetFuer = '';
  function renderStateView(){
    tfGezeichnetFuer = todayKey() + aktuellerAbschnitt();
    // Die Erklaerung, bis drei Tage eingetragen sind; danach ein Satz (die volle steht in den Haeufigen Fragen).
    var einl = $('tfEinleitung');
    if (einl){ var schl = stateTage(loadStateHistory()).length >= 3 ? 'tf_einleitung_kurz' : 'tf_einleitung';
      einl.setAttribute('data-i18n', schl); einl.textContent = decodeEntities(tx(schl)); }
    // Runde 129: Die Zeile nennt den gewaehlten Abschnitt und sagt, ob Speichern ihn neu anlegt oder
    // ersetzt. Die Skalen stehen leer — vorbelegt saehe ein Ersetzen wie ein Bestaetigen aus.
    var abschnitt = gewaehlterAbschnitt();
    var name = tx('tf_abschnitt_'+abschnitt);
    statePickedEnergy = null;
    statePickedValence = null;
    $('stateTodayNote').textContent = heuteEingetragen()[abschnitt]
      ? tfText('tf_note_ersetzt', {abschnitt: name})
      : tfText('tf_note_offen', {abschnitt: name});
    tfAbschnitteRendern(null);
    tfErledigtAnwenden(false, null);
    renderStateRows();
    tfFragenRendern();
    tfStichworteRendern();
    erinnerungAnwenden();
    renderStateTrend();
    tfAuswertungenRendern();
    tfSerieRendern();
    tfRueckblickHinweisRendern();
    tfBegleiterRendern();
    erinnerungFrageAnwenden();
  }
  // Ist die laufende Tageszeit eingetragen, steht statt der Skalen die Bestaetigung mit "Aendern".
  // `neu` = direkt nach dem Speichern (sichtbar zuklappen).
  var tfAendernOffen = false;
  function tfErledigtAnwenden(neu, danach){
    var erf = $('tfErfassung'), erl = $('tfErledigt');
    var fertig = function(){ if (danach) danach(); };
    if (!erf || !erl) return fertig();
    var abschnitt = gewaehlterAbschnitt(), eintrag = heuteEingetragen()[abschnitt];
    // Die Zeile "… schon eingetragen – Speichern ersetzt" gehoert zur offenen Erfassung; neben der
    // Bestaetigung waere sie doppelt und spraeche von einem Knopf, der gerade nicht da ist.
    var notiz = $('stateTodayNote');
    if (!eintrag || tfAendernOffen){
      erl.style.display = 'none';
      notizBereichAnwenden('tf', null);
      erf.style.display = '';
      if (notiz) notiz.style.display = '';
      return fertig();
    }
    if (notiz) notiz.style.display = 'none';
    $('tfErledigtTitel').textContent = tfText('tf_abschnitt_eingetragen', {abschnitt: tx('tf_abschnitt_'+abschnitt)});
    $('tfErledigtWerte').textContent = tx('js_energie_praefix')+tagWert(eintrag.energy)+tx('js_trenner_stimmung')+tagWert(eintrag.valence);
    $('tfErledigtNaechster').textContent = tfNaechsterText(abschnitt);
    notizBereichAnwenden('tf', eintrag);
    var schonDa = erl.style.display === 'flex';
    var zeigen = function(){
      erl.style.display = 'flex';
      if (neu){
        erl.classList.remove('just-saved');
        try{ void erl.offsetWidth; }catch(e){}
        erl.classList.add('just-saved');
        // Gespeichert wird ganz unten; nach dem Zuklappen (gut 1200 px weniger) stand die
        // Bestaetigung ueber dem sichtbaren Bereich — gemessen in WebKit. Also dorthin, wo sie ist.
        try{ erl.scrollIntoView({behavior: prefersReducedMotion() ? 'auto' : 'smooth', block:'center'}); }catch(e){}
        setTimeout(function(){ funkenAn(erl.querySelector ? erl.querySelector('.state-done-check') : null); }, 380);
      } else if (!schonDa){
        erl.classList.remove('just-saved');
      }
      fertig();
    };
    if (neu) zuklappen(erf, zeigen);
    else { erf.style.display = 'none'; zeigen(); }
  }

  // ---------- Das Zeitfenster der Kurve ----------
  // Segmentwaehler; die Wahl bleibt gespeichert.
  var FENSTER_SCHLUESSEL = 'lucenta_tf_fenster';
  // 0 = Gesamt (Entscheidung des Inhabers): slice(-0) liefert die ganze Liste, also kein Sonderfall.
  var FENSTER = [14, 30, 90, 0];
  function fensterLesen(){
    var w = parseInt(schalterLesen(FENSTER_SCHLUESSEL, ''), 10);
    return FENSTER.indexOf(w) >= 0 ? w : 30;
  }
  function fensterWahlHTML(vorhanden){
    var wahl = fensterLesen();
    return '<div class="segment tf-fenster" role="radiogroup" aria-label="'+tx('aria_tf_fenster')+'">'+
      FENSTER.map(function(n){
        // Laengen ohne genug Daten bleiben sichtbar, aber abgeschaltet (wandernde Faecher waeren kein
        // Waehler). "Gesamt" erst ab mehr als 90 Tagen.
        var moeglich = n === 0 ? vorhanden > 90 : (vorhanden > n * 0.5 || n === 14);
        return '<button type="button" class="segment-opt" role="radio" data-fenster="'+n+'" '+
               'aria-checked="'+(n===wahl?'true':'false')+'"'+(moeglich?'':' disabled')+'>'+
               (n === 0
                 ? '<span class="segment-preis">'+tx('tf_fenster_gesamt')+'</span>'+
                   '<span class="segment-spar">'+vorhanden+'&nbsp;'+tx('js_tagen_kurz')+'</span>'
                 : '<span class="segment-preis">'+n+'</span>'+
                   '<span class="segment-spar">'+tx('js_tagen_kurz')+'</span>')+'</button>';
      }).join('')+'</div>';
  }
  function fensterWahlVerdrahten(wurzel){
    var g = wurzel ? wurzel.querySelector('.tf-fenster') : null;
    if (!g) return;
    g.addEventListener('click', function(e){
      var b = e.target.closest ? e.target.closest('.segment-opt') : null;
      if (!b || b.disabled) return;
      schalterSetzen(FENSTER_SCHLUESSEL, b.getAttribute('data-fenster'), null);
      tapFeedback();
      renderStateTrend();
      tfBandbreiteRendern();   // dasselbe Fenster (tfSichtbareTage)
    });
  }
  // Tage zu Wochen zusammenfassen. Der Zeitstempel der Woche ist der ihres LETZTEN Tages, damit
  // das Ablesen im Diagramm ein Datum nennt, das es wirklich gab.
  function zuWochen(tage){
    var wochen = [], puffer = [];
    for (var i = 0; i < tage.length; i++){
      puffer.push(tage[i]);
      if (puffer.length === 7 || i === tage.length - 1){
        var n = puffer.length;
        wochen.push({
          day: puffer[n-1].day, ts: puffer[n-1].ts, anzahl: n,
          energy: puffer.reduce(function(a,t){ return a+t.energy; },0)/n,
          valence: puffer.reduce(function(a,t){ return a+t.valence; },0)/n
        });
        puffer = [];
      }
    }
    return wochen;
  }

  function renderStateTrend(){
    var alleEintraege = loadStateHistory();
    // Die freie Fassung zeigt FREI_TAGE Tage und keine Befunde; eingetragen bleibt alles.
    var plus = istPlus();
    var alleTage = stateTage(alleEintraege);
    var verborgeneTage = plus ? 0 : Math.max(0, alleTage.length - FREI_TAGE);
    var eintraege = alleEintraege;
    if (verborgeneTage){
      var sichtbar = {};
      alleTage.slice(-FREI_TAGE).forEach(function(t){ sichtbar[t.day] = 1; });
      eintraege = alleEintraege.filter(function(e){ return sichtbar[e.day]; });
    }
    // Diagramm und Liste zeigen TAGE. Ein Tag mit drei Eintraegen ist ein Punkt auf der Linie,
    // kein dreifaches Gewicht — die Linie beschreibt den Verlauf ueber Tage, nicht ueber Tipps.
    var hist = stateTage(eintraege);
    var wrap = $('stateTrendContent');
    if (hist.length===0){
      wrap.innerHTML = emptyStateHTML(tx('js_noch_keine_tagesform_erfas'));
      return;
    }
    if (hist.length<2){
      // Feedback-Runde 47: derselbe Fall wie im Testverlauf — der bereits erfasste Tag wurde
      // nicht angezeigt, sondern durch einen Leerzustand ersetzt.
      var sf = historyDateFmt(), s1 = hist[0];
      var sd = ''; try{ sd = sf.format(new Date(s1.ts)); }catch(ex){ sd = s1.day; }
      wrap.innerHTML =
        '<div class="history-list"><div class="history-row">'+
          '<div class="history-date">'+sd+'</div>'+
          tx('js_html_energie')+tagWert(s1.energy)+'/5'+tx('js_trenner_stimmung_html')+tagWert(s1.valence)+'/5</div>'+
        '</div></div>'+
        tx('js_erster_eintrag_steht_ab_de');
      return;
    }
    var lastE = tagWert(hist[hist.length-1].energy), lastV = tagWert(hist[hist.length-1].valence);
    // Ueber 35 Tagen fasst das Diagramm zu WOCHEN zusammen — so bleibt der Punktabstand lesbar.
    var fensterTage = fensterLesen();
    var fenster = hist.slice(-fensterTage);
    var proWoche = fenster.length > 35;
    var kurve = proWoche ? zuWochen(fenster) : fenster;
    // Legende bei zwei Reihen immer, damit die Zuordnung nie allein an der Farbe hängt — ein
    // farbiges Plättchen NEBEN dem Wort, nicht das Wort in der Farbe.
    var legende =
      '<div class="verlauf-legende">'+
        '<span class="vl-eintrag"><span class="vl-punkt vl-energie"></span>'+tx('js_energie')+
          '<b class="mono vl-energie-wert">'+lastE+'</b></span>'+
        '<span class="vl-eintrag"><span class="vl-punkt vl-stimmung"></span>'+tx('js_stimmung')+
          '<b class="mono vl-stimmung-wert">'+lastV+'</b></span>'+
        '<span class="vl-datum mono">'+tx('js_heute')+'</span>'+
      '</div>';
    var trendRows =
      legende +
      (plus ? fensterWahlHTML(hist.length) : '') +
      // Die Achse steht IN der Diagrammspalte, sonst waeren die Marken um die Breite der Skalenspalte
      // verschoben.
      '<div class="verlauf-flaeche">'+
        '<div class="verlauf-skala"><span>5</span><span>1</span></div>'+
        '<div class="verlauf-spalte">'+
          verlaufDiagrammSVG(kurve, 320, 150)+
          verlaufAchseHTML(kurve, 320)+
        '</div>'+
      '</div>'+
      (proWoche ? '<p class="verlauf-hinweis">'+tx('js_verlauf_wochen')+'</p>' : '');
    var fmt = historyDateFmt();
    // Die Liste folgt dem Fenster. Vierzehn Zeilen unter einer Kurve ueber neunzig Tage waeren
    // ein Beleg fuer etwas anderes als das, was darueber steht.
    var listRows = fenster.slice().reverse().slice(0, Math.min(60, Math.max(14, fenster.length))).map(function(e){
      var dateStr;
      try{ dateStr = fmt.format(new Date(e.ts)); }catch(ex){ dateStr = e.day; }
      return '<div class="history-row"><div class="history-date">'+dateStr+
             (e.anzahl > 1 ? ' <span class="tf-anzahl mono">'+e.anzahl+'&times;</span>' : '')+
             // Runde 124: geschuetzte Leerzeichen, damit beim Umbruch nicht "3,7/5" allein in der
             // zweiten Zeile steht (am Simulator gesehen, bei Tagen mit Nachkommastelle).
             '</div><div class="history-title">'+tx('js_energie')+'&nbsp;'+tagWert(e.energy)+'/5 &middot; '+
             tx('js_stimmung')+'&nbsp;'+tagWert(e.valence)+'/5'+
             (e.tags ? '<span class="tf-liste-tags">'+e.tags.map(function(t){ return tx('tf_tag_'+t); }).join(' · ')+'</span>' : '')+
             '</div></div>';
    }).join('');
    wrap.innerHTML = '<div class="trend-list">'+trendRows+'</div>'+
      tx('js_letzte_einträge')+hist.length+'</span></h2>'+
      // Die Liste klappt erst auf Tipp auf (Entscheidung des Inhabers), in der Form der Haeufigen
      // Fragen; sie bleibt .history-list fuer die Einschuebe.
      '<details class="hilfe-sammlung tf-liste-sammlung"><summary><span>'+tx('tf_liste_zeigen')+'</span>'+
        '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '+
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"></path></svg></summary>'+
      '<div class="history-list">'+listRows+'</div></details>';
    // Die Befunde sind der Kern der gekauften Fassung: Sie sind das, was aus mehreren Messungen
    // entsteht, und genau daran verlaeuft die Grenze.
    if (!plus){
      var stelle = wrap.querySelector('.section-title-sub') || wrap.querySelector('.history-list');
      var hinweis = schlossHTML(verborgeneTage
        ? (tx('plus_tagesform_a') + verborgeneTage + tx('plus_tagesform_b'))
        : tx('plus_tagesform_kurz'));
      if (stelle) stelle.insertAdjacentHTML('beforebegin', hinweis);
      else wrap.insertAdjacentHTML('beforeend', hinweis);
      schloesserVerdrahten(wrap);
      verlaufAblesenAktivieren(wrap.querySelector('.verlauf-flaeche'), kurve, ableseDatumFmt());
      return;
    }
    var befunde = tagesformBefunde(eintraege);
    if (befunde.length){
      var block = '<h2 class="section-title section-title-sub">'+tx('js_befunde_titel')+'</h2>'+
        '<div class="befund-liste">'+befunde.map(function(b){
          return '<div class="befund"><div class="befund-titel">'+b.titel+'</div>'+
                 '<p class="befund-text">'+b.text+'</p></div>';
        }).join('')+'</div>';
      // Befunde VOR die Ueberschrift "Letzte Eintraege", nicht vor deren Liste.
      var ueberschrift = wrap.querySelector('.section-title-sub');
      var liste = wrap.querySelector('.history-list');
      var ziel = ueberschrift || liste;
      if (ziel) ziel.insertAdjacentHTML('beforebegin', block);
      else wrap.insertAdjacentHTML('beforeend', block);
    }
    fensterWahlVerdrahten(wrap);
    verlaufAblesenAktivieren(wrap.querySelector('.verlauf-flaeche'), kurve, ableseDatumFmt());
  }

  

  // ---------- Notiz in der Bestaetigung (Startseite und Tagesform) ----------
  function notizBereichAnwenden(praefix, eintrag){
    var el = $(praefix + 'NotizBereich');
    if (!el) return;
    if (!eintrag){ el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    var abschnitt = eintrag.slot || zeitabschnitt(eintrag.ts);
    el.innerHTML = (eintrag.notiz ? '<p class="tf-notiz-text">' + escapeHTML(eintrag.notiz) + '</p>' : '') +
      '<button type="button" class="tf-notiz-knopf" data-notiz="oeffnen">' + tx(eintrag.notiz ? 'tf_notiz_aendern' : 'tf_notiz_hinzu') + '</button>' +
      '<div class="tf-notiz-form" hidden><textarea class="tf-notiz" rows="2" maxlength="200" placeholder="' +
        tx('tf_notiz_ph') + '" aria-label="' + tx('aria_tf_notiz') + '"></textarea>' +
      '<button type="button" class="btn btn-primary btn-sm" data-notiz="sichern">' + tx('speichern') + '</button></div>';
    if (!el.querySelector) return;
    var form = el.querySelector('.tf-notiz-form'), feld = el.querySelector('textarea');
    var oeffnen = el.querySelector('[data-notiz="oeffnen"]'), sichern = el.querySelector('[data-notiz="sichern"]');
    if (!form || !feld || !oeffnen || !sichern) return;
    oeffnen.addEventListener('click', function(){
      form.hidden = false; this.hidden = true; feld.value = eintrag.notiz || '';
      try{ feld.focus(); }catch(e){}
    });
    sichern.addEventListener('click', function(){
      if (!tfNotizSetzen(eintrag.day, abschnitt, feld.value)) return;
      toast(tx('tf_notiz_gesichert'));
      var frisch = heuteEingetragen()[abschnitt] || eintrag;
      ['landing', 'tf'].forEach(function(v){ var b = $(v + 'NotizBereich'); if (b && !b.hidden) notizBereichAnwenden(v, frisch); });
    });
  }

// ---------- Jahr auf einen Blick und Monatsrueckblick (Lucenta+) ----------
// Zwoelf Monate wie in Apples Kalender; alles auf der Seite "Rueckblick" (unten). Nur echte Zahlen: Fehlt
// die Grundlage, entfaellt die Zeile. Monat und Jahr als Bild teilbar (Bildfenster aus 18).
  var TF_RB_MIN_TAGE = 3;
  var tfJahrVersatz = 0;         // 0 = laufendes Jahr
  var TF_STUFE_ANTEIL = [0, .10, .26, .46, .76, 1];

  function tfTageNachSchluessel(){
    var m = {};
    stateTage(loadStateHistory()).forEach(function(t){ m[t.day] = t; });
    return m;
  }
  function tfStufe(tag, groesse){
    return tag ? Math.max(1, Math.min(5, Math.round(tag[groesse]))) : 0;
  }
  function tfMonatsName(jahr, monat, mitJahr){
    try{ return new Intl.DateTimeFormat(tx('datum_gebietsschema'), mitJahr ? {month:'long', year:'numeric'} : {month:'long'})
      .format(new Date(jahr, monat, 1)); }catch(e){ return (monat + 1) + (mitJahr ? '/' + jahr : ''); }
  }
  // Zellen eines Monats ab wochenBeginn(): null = Luecke vor dem 1., sonst {day, tag}.
  function tfMonatsZellen(jahr, monat, nachSchluessel){
    var leer = wochentagNr(new Date(jahr, monat, 1)), n = new Date(jahr, monat + 1, 0).getDate(), z = [];
    for (var i = 0; i < leer; i++) z.push(null);
    for (var t = 1; t <= n; t++){
      var k = tfTagSchluessel(new Date(jahr, monat, t));
      z.push({day: k, tag: nachSchluessel[k] || null});
    }
    return z;
  }

  // Kein zweiter Umschalter (Entscheidung des Inhabers): Die Flaeche zeigt die Stimmung, ein Balken unten die Energie.
  function tfEnergieBalken(tag){
    if (!tag || typeof tag.energy !== 'number') return '';
    return '<b class="tf-e" style="width:'+Math.round(Math.max(1, Math.min(5, tag.energy)) / 5 * 60)+'%"></b>';
  }
  function tfLegendeHTML(){
    return '<div class="tf-kal-skala" aria-hidden="true"><span>1</span>'+[1,2,3,4,5].map(function(s){ return '<i class="tf-kal-st'+s+'"></i>'; }).join('')+
      '<span>5</span><span class="tf-legende-text">'+tx('tf_legende')+'</span></div>';
  }

  // ---------- Jahr ----------
  function tfJahrHTML(groesse){
    var nach = tfTageNachSchluessel(), jahr = new Date().getFullYear() + tfJahrVersatz, heute = todayKey();
    var alle = Object.keys(nach).sort(), fruehestesJahr = alle.length ? +alle[0].slice(0, 4) : jahr;
    var tage = alle.filter(function(k){ return k.slice(0, 4) === String(jahr); }).length;
    var monate = '';
    for (var m = 0; m < 12; m++){
      var kurz = tfMonatsName(jahr, m, false);
      monate += '<button type="button" class="tf-jahr-monat" data-jahr-monat="'+m+'" aria-label="'+kurz+'">'+
        '<span class="tf-jahr-name">'+kurz+'</span><span class="tf-jahr-tage" aria-hidden="true">'+
        tfMonatsZellen(jahr, m, nach).map(function(z){
          if (!z) return '<i class="tf-jahr-leer"></i>';
          var st = tfStufe(z.tag, groesse);
          return '<i class="'+(st ? 'tf-kal-st'+st : (z.day > heute ? 'tf-jahr-zukunft' : 'tf-jahr-ohne'))+(z.day === heute ? ' tf-jahr-tag0' : '')+'"></i>';
        }).join('')+'</span></button>';
    }
    return '<div class="tf-kal-kopf">'+
        '<button type="button" class="tf-kal-pfeil" data-jahr="-1" aria-label="'+tx('tf_jahr_vorjahr')+'"'+(jahr > fruehestesJahr ? '' : ' disabled')+'>‹</button>'+
        '<span class="tf-kal-monat">'+jahr+'</span>'+
        '<button type="button" class="tf-kal-pfeil" data-jahr="1" aria-label="'+tx('tf_jahr_folgejahr')+'"'+(tfJahrVersatz < 0 ? '' : ' disabled')+'>›</button>'+
      '</div>'+
      '<p class="tf-kal-ueberblick">'+wertFest(tx('tf_jahr_tage')).split('{n}').join(String(tage))+'</p>'+
      '<div class="tf-jahr">'+monate+'</div>'+
      (tage ? '<button type="button" class="btn btn-ghost btn-sm tf-teilen" data-jahr-teilen="'+jahr+'">'+tx('tf_als_bild_teilen')+'</button>' : '');
  }

  // ---------- Monatsrueckblick ----------
  function tfRueckblickDaten(jahr, monat){
    var schluessel = tfTagSchluessel(new Date(jahr, monat, 1)).slice(0, 7);
    var vor = tfTagSchluessel(new Date(jahr, monat - 1, 1)).slice(0, 7);
    var tage = stateTage(loadStateHistory());
    var dieser = tage.filter(function(t){ return t.day.slice(0, 7) === schluessel; });
    if (dieser.length < TF_RB_MIN_TAGE) return null;
    var mittel = function(l, g){ return l.reduce(function(a, t){ return a + t[g]; }, 0) / l.length; };
    var r = {jahr: jahr, monat: monat, n: dieser.length, e: mittel(dieser, 'energy'), s: mittel(dieser, 'valence')};
    var vorige = tage.filter(function(t){ return t.day.slice(0, 7) === vor; });
    if (vorige.length >= TF_RB_MIN_TAGE){ r.de = r.e - mittel(vorige, 'energy'); r.ds = r.s - mittel(vorige, 'valence'); }
    // Beste Tageszeit: mindestens zwei Tageszeiten mit je zwei Eintraegen, und ein echter Abstand.
    var proZeit = {};
    loadStateHistory().forEach(function(e){
      if (e.day.slice(0, 7) !== schluessel) return;
      var z = e.slot || zeitabschnitt(e.ts);
      (proZeit[z] = proZeit[z] || []).push(e.valence);
    });
    var zeiten = TF_ABSCHNITTE.filter(function(z){ return proZeit[z] && proZeit[z].length >= 2; }).map(function(z){
      return {z: z, w: proZeit[z].reduce(function(a, b){ return a + b; }, 0) / proZeit[z].length};
    }).sort(function(a, b){ return b.w - a.w; });
    if (zeiten.length >= 2 && zeiten[0].w - zeiten[zeiten.length - 1].w >= 0.3) r.zeit = zeiten[0].z;
    // Stichwort: an den besten Tagen (oberes Drittel nach Stimmung), sonst das haeufigste; je mindestens zwei Tage.
    var zaehlen = function(l){ var c = {}; l.forEach(function(t){ (t.tags || []).forEach(function(x){ c[x] = (c[x] || 0) + 1; }); }); return c; };
    var spitze = function(c){ var k = Object.keys(c).sort(function(a, b){ return c[b] - c[a]; })[0]; return k && c[k] >= 2 ? k : null; };
    var beste = dieser.slice().sort(function(a, b){ return b.valence - a.valence; }).slice(0, Math.max(3, Math.ceil(dieser.length / 3)));
    var sb = spitze(zaehlen(beste));
    if (sb){ r.stichwort = sb; r.stichwortBeste = true; }
    else { var so = spitze(zaehlen(dieser)); if (so) r.stichwort = so; }
    return r;
  }
  function tfRueckblickZeilen(r){
    var z = [wertFest(tx('tf_kal_schnitt')).split('{e}').join(tfZahl(r.e)).split('{s}').join(tfZahl(r.s)).split('{n}').join(String(r.n))];
    if (typeof r.de === 'number') z.push(wertFest(tx('tf_kal_vgl')).split('{e}').join(tfDiff(r.de)).split('{s}').join(tfDiff(r.ds)));
    if (r.zeit) z.push(tx('tf_rb_zeit').split('{zeit}').join(tx('tf_abschnitt_' + r.zeit)));
    if (r.stichwort) z.push(tx(r.stichwortBeste ? 'tf_rb_stichwort_beste' : 'tf_rb_stichwort_oft').split('{tag}').join(tx('tf_tag_' + r.stichwort)));
    return z;
  }
  function tfRueckblickHTML(r, groesse, ohneTitel){
    var nach = tfTageNachSchluessel();
    return '<div class="tf-rb">'+
      (ohneTitel ? '' : '<div class="tf-rb-titel">'+tx('tf_rb_titel').split('{monat}').join(tfMonatsName(r.jahr, r.monat, false))+'</div>')+
      '<ul class="tf-rb-zeilen">'+tfRueckblickZeilen(r).map(function(z){ return '<li>'+z+'</li>'; }).join('')+'</ul>'+
      '<div class="tf-rb-tage" aria-hidden="true">'+tfMonatsZellen(r.jahr, r.monat, nach).map(function(z){
        if (!z) return '<i class="tf-jahr-leer"></i>';
        var st = tfStufe(z.tag, groesse);
        return '<i class="'+(st ? 'tf-kal-st'+st : 'tf-jahr-ohne')+'">'+tfEnergieBalken(z.tag)+'</i>';
      }).join('')+'</div>'+
      '<button type="button" class="btn btn-ghost btn-sm tf-teilen" data-rb-teilen="'+r.jahr+'-'+r.monat+'">'+tx('tf_als_bild_teilen')+'</button>'+
    '</div>';
  }
  // ---------- Wochenrueckblick ----------
  // Fuer die Hinweiszeile: am letzten Wochentag die laufende, am ersten die vergangene Woche, ab drei Eintraegen.
  function tfWocheTage(montag, versatz){
    var s = {};
    for (var i = 0; i < 7; i++) s[tfTagSchluessel(new Date(montag.getFullYear(), montag.getMonth(), montag.getDate() + versatz + i, 12))] = 1;
    return s;
  }
  function tfWocheDaten(jetzt){
    var d = jetzt || new Date(), wt = wochentagNr(d);                  // 0 = erster Tag der Woche
    if (wt !== 6 && wt !== 0) return null;
    var montag = new Date(d.getFullYear(), d.getMonth(), d.getDate() - wt - (wt === 0 ? 7 : 0), 12);
    var diese = tfWocheTage(montag, 0), vorige = tfWocheTage(montag, -7);
    var tage = stateTage(loadStateHistory());
    var w = tage.filter(function(t){ return diese[t.day]; }), v = tage.filter(function(t){ return vorige[t.day]; });
    if (w.length < TF_RB_MIN_TAGE) return null;
    var mittel = function(l, g){ return l.reduce(function(a, t){ return a + t[g]; }, 0) / l.length; };
    var r = {n: w.length, e: mittel(w, 'energy'), s: mittel(w, 'valence')};
    if (v.length >= TF_RB_MIN_TAGE){ r.de = r.e - mittel(v, 'energy'); r.ds = r.s - mittel(v, 'valence'); }
    var beste = w.slice().sort(function(a, b){ return b.valence - a.valence || b.energy - a.energy; })[0];
    r.beste = wochentagName(new Date(beste.ts).getDay());
    return r;
  }
  // ---------- Rueckblick als eigene Seite (Woche · Monat · Jahr) ----------
  // Entscheidung des Inhabers: eine Unterseite der Tagesform; unter "Heute" nur eine Hinweiszeile, wenn eine
  // Woche (letzter/erster Wochentag) oder ein Monat (erste 7 Tage) fertig ist. Frei: Wochenschnitt; Rest Lucenta+.
  // Ansicht: w = Woche, m = Monat, j = Jahr.
  var rbAnsicht = 'w', rbWocheVersatz = 0, rbMonatVersatz = 0;

  // Erster Tag der gezeigten Woche: am letzten Wochentag die laufende, sonst die zuletzt fertige; Versatz in Wochen.
  function rbWocheMontag(versatz){
    var d = new Date(), wt = wochentagNr(d);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - wt - (wt === 6 ? 0 : 7) + 7 * versatz, 12);
  }
  function rbWocheDaten(montag){
    var diese = tfWocheTage(montag, 0), vorige = tfWocheTage(montag, -7);
    var tage = stateTage(loadStateHistory());
    var w = tage.filter(function(t){ return diese[t.day]; }), v = tage.filter(function(t){ return vorige[t.day]; });
    var r = {montag: montag, n: w.length, nach: {}};
    w.forEach(function(t){ r.nach[t.day] = t; });
    if (w.length < TF_RB_MIN_TAGE) return r;
    var mittel = function(l, g){ return l.reduce(function(a, t){ return a + t[g]; }, 0) / l.length; };
    r.e = mittel(w, 'energy'); r.s = mittel(w, 'valence');
    if (v.length >= TF_RB_MIN_TAGE){ r.de = r.e - mittel(v, 'energy'); r.ds = r.s - mittel(v, 'valence'); }
    var beste = w.slice().sort(function(a, b){ return b.valence - a.valence || b.energy - a.energy; })[0];
    r.beste = wochentagName(new Date(beste.ts).getDay());
    return r;
  }
  // Der gezeigte Monat: in den ersten 7 Tagen der Vormonat, sonst der laufende; Versatz in Monaten zurueck.
  function rbMonat(versatz){
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth() - (d.getDate() <= 7 ? 1 : 0) + versatz, 1);
  }
  function rbFruehesterTag(){
    var alle = stateTage(loadStateHistory());
    return alle.length ? alle[0].day : todayKey();
  }
  function rbKopf(titel, art, zurueck, vor){
    return '<div class="tf-kal-kopf">'+
      '<button type="button" class="tf-kal-pfeil" data-rb-blaettern="'+art+'" data-rb-schritt="-1" aria-label="'+tx('rb_zurueck')+'"'+(zurueck ? '' : ' disabled')+'>‹</button>'+
      '<span class="tf-kal-monat">'+titel+'</span>'+
      '<button type="button" class="tf-kal-pfeil" data-rb-blaettern="'+art+'" data-rb-schritt="1" aria-label="'+tx('rb_vor')+'"'+(vor ? '' : ' disabled')+'>›</button>'+
    '</div>';
  }
  function rbSkala(){ return tfLegendeHTML(); }
  function rbWocheHTML(plus){
    if (!plus) rbWocheVersatz = 0;
    var montag = rbWocheMontag(rbWocheVersatz), sonntag = new Date(montag.getFullYear(), montag.getMonth(), montag.getDate() + 6, 12);
    var fmt = function(d){ try{ return new Intl.DateTimeFormat(tx('datum_gebietsschema'), {day:'numeric', month:'short'}).format(d); }catch(e){ return tfTagSchluessel(d); } };
    var r = rbWocheDaten(montag);
    var zurueck = plus && tfTagSchluessel(montag) > rbFruehesterTag();
    var tage = '';
    for (var i = 0; i < 7; i++){
      var k = tfTagSchluessel(new Date(montag.getFullYear(), montag.getMonth(), montag.getDate() + i, 12));
      var st = tfStufe(r.nach[k], tfKalenderGroesse);
      tage += '<i class="'+(st ? 'tf-kal-st'+st : 'tf-jahr-ohne')+'">'+tfEnergieBalken(r.nach[k])+'</i>';
    }
    var inhalt;
    if (r.n < TF_RB_MIN_TAGE) inhalt = '<p class="tf-kal-ueberblick">'+tx('rb_zu_wenig')+'</p>';
    else {
      var frei = wertFest(tx('tf_kal_schnitt')).split('{e}').join(tfZahl(r.e)).split('{s}').join(tfZahl(r.s)).split('{n}').join(String(r.n));
      var mehr = [tx('tf_woche_beste').split('{tag}').join(r.beste)];
      if (typeof r.de === 'number') mehr.push(wertFest(tx('tf_woche_vgl')).split('{e}').join(tfDiff(r.de)).split('{s}').join(tfDiff(r.ds)));
      var mehrHTML = '<ul class="tf-rb-zeilen">' + mehr.map(function(z){ return '<li>' + z + '</li>'; }).join('') + '</ul>';
      inhalt = '<ul class="tf-rb-zeilen"><li>' + frei + '</li></ul>' + (plus ? mehrHTML : vorschauHTML(mehrHTML, tx('tf_woche_plus')));
    }
    var namen = [];
    try{ var wf = new Intl.DateTimeFormat(tx('datum_gebietsschema'), {weekday:'narrow'});
      for (var w = 0; w < 7; w++) namen.push(wf.format(wochentagMuster(w))); }
    catch(e){ namen = ['1','2','3','4','5','6','7']; }
    var teilen = plus && r.n >= TF_RB_MIN_TAGE
      ? '<button type="button" class="btn btn-ghost btn-sm tf-teilen" data-woche-teilen="'+rbWocheVersatz+'">'+tx('tf_als_bild_teilen')+'</button>' : '';
    return rbKopf(fmt(montag) + ' – ' + fmt(sonntag), 'w', zurueck, rbWocheVersatz < 0)+
      inhalt + '<div class="tf-kal-wochentage rb-wochentage" aria-hidden="true">'+namen.map(function(n){ return '<span>'+n+'</span>'; }).join('')+'</div>'+
      '<div class="tf-rb-tage" aria-hidden="true">'+tage+'</div>' + teilen + rbSkala();
  }
  function rbMonatHTML(plus){
    if (!plus) rbMonatVersatz = 0;
    var m = rbMonat(rbMonatVersatz), r = tfRueckblickDaten(m.getFullYear(), m.getMonth());
    var zurueck = plus && tfTagSchluessel(m) > rbFruehesterTag().slice(0, 8) + '01';
    var karte = r ? tfRueckblickHTML(r, tfKalenderGroesse, true) : '<p class="tf-kal-ueberblick">'+tx('rb_zu_wenig')+'</p>';
    return rbKopf(tfMonatsName(m.getFullYear(), m.getMonth(), true), 'm', zurueck, rbMonatVersatz < 0)+
      (plus ? karte : vorschauHTML(karte, tx('tf_rb_plus'))) + rbSkala();
  }
  function rbJahrHTML(plus){
    if (!plus) tfJahrVersatz = 0;
    var jahr = tfJahrHTML(tfKalenderGroesse) + rbSkala();
    return plus ? jahr : vorschauHTML(jahr, tx('rb_jahr_plus'));
  }
  function renderRueckblick(){
    var wrap = $('rueckblickInhalt');
    if (!wrap) return;
    var plus = istPlus();
    var umschalter = '<div class="segment rb-ansicht" role="radiogroup" aria-label="'+tx('rb_titel')+'">'+
      [['w', 'rb_woche'], ['m', 'rb_monat'], ['j', 'rb_jahr']].map(function(a){
        return '<button type="button" class="segment-opt" role="radio" data-rb-ansicht="'+a[0]+'" aria-checked="'+(a[0] === rbAnsicht ? 'true' : 'false')+'">'+
          '<span class="segment-preis">'+tx(a[1])+'</span></button>';
      }).join('')+'</div>';
    var inhalt = rbAnsicht === 'j' ? rbJahrHTML(plus) : rbAnsicht === 'm' ? rbMonatHTML(plus) : rbWocheHTML(plus);
    wrap.innerHTML = umschalter + '<div class="tf-kal-karte rb-karte">' + inhalt + '</div>';
    schloesserVerdrahten(wrap);
    tfTeilenVerdrahten(wrap);
    if (!wrap.querySelectorAll) return;
    wrap.querySelectorAll('[data-rb-ansicht]').forEach(function(b){
      b.addEventListener('click', function(){ rbAnsicht = b.getAttribute('data-rb-ansicht'); tapFeedback(); renderRueckblick(); });
    });
    wrap.querySelectorAll('[data-rb-blaettern]').forEach(function(b){
      b.addEventListener('click', function(){
        if (b.disabled) return;
        var s = parseInt(b.getAttribute('data-rb-schritt'), 10);
        if (b.getAttribute('data-rb-blaettern') === 'w') rbWocheVersatz = Math.min(0, rbWocheVersatz + s);
        else rbMonatVersatz = Math.min(0, rbMonatVersatz + s);
        tapFeedback(); renderRueckblick();
      });
    });
    wrap.querySelectorAll('[data-jahr]').forEach(function(b){
      b.addEventListener('click', function(){
        if (b.disabled) return;
        tfJahrVersatz = Math.min(0, tfJahrVersatz + parseInt(b.getAttribute('data-jahr'), 10));
        tapFeedback(); renderRueckblick();
      });
    });
    // Ein Monat im Jahr oeffnet seinen Rueckblick.
    wrap.querySelectorAll('[data-jahr-monat]').forEach(function(b){
      b.addEventListener('click', function(){
        var basis = rbMonat(0), jahr = new Date().getFullYear() + tfJahrVersatz;
        rbMonatVersatz = Math.min(0, (jahr - basis.getFullYear()) * 12 + (+b.getAttribute('data-jahr-monat')) - basis.getMonth());
        rbAnsicht = 'm'; tapFeedback(); renderRueckblick();
      });
    });
  }
  function rueckblickOeffnen(ansicht){
    if (ansicht){ rbAnsicht = ansicht; rbWocheVersatz = 0; rbMonatVersatz = 0; }
    renderRueckblick();
    showView('rueckblick');
  }
  // Unter "Heute": eine kleine Zeile, wenn eine Woche oder ein Monat fertig ist.
  function tfRueckblickHinweisRendern(){
    var wrap = $('tfRueckblickHinweis');
    if (!wrap) return;
    var d = new Date(), vm = new Date(d.getFullYear(), d.getMonth() - 1, 1), art = '', text = '';
    if (tfWocheDaten()){ art = 'w'; text = tx('rb_hinweis_woche'); }
    else if (d.getDate() <= 7 && tfRueckblickDaten(vm.getFullYear(), vm.getMonth())){
      art = 'm'; text = tx('rb_hinweis_monat').split('{monat}').join(tfMonatsName(vm.getFullYear(), vm.getMonth(), false));
    }
    wrap.innerHTML = art ? '<button type="button" class="rb-hinweis" data-rb-oeffnen="'+art+'">'+text+' ›</button>' : '';
    var b = wrap.querySelector ? wrap.querySelector('[data-rb-oeffnen]') : null;
    if (b) b.addEventListener('click', function(){ rueckblickOeffnen(b.getAttribute('data-rb-oeffnen')); });
  }

  // ---------- Bilder ----------
  function tfFarbe(hex){ var h = hex.replace('#', ''); return [0, 2, 4].map(function(i){ return parseInt(h.substr(i, 2), 16); }); }
  function tfMischen(a, b, t){
    var x = tfFarbe(a), y = tfFarbe(b);
    return 'rgb(' + x.map(function(v, i){ return Math.round(y[i] + (v - y[i]) * t); }).join(',') + ')';
  }
  function tfZellFarbe(C, st, zukunft){
    var grund = dunkelAktiv() ? '#1C1C1E' : '#F3F2EE';
    if (st) return tfMischen(C.accent, grund, TF_STUFE_ANTEIL[st]);
    return zukunft ? tfMischen(C.line, C.paper, .35) : tfMischen(C.line, C.paper, .8);
  }
  function tfBildKopf(ctx, C, M, unterzeile){
    ctx.fillStyle = C.accent2;
    ctx.beginPath(); ctx.arc(M + 8, M - 4, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink; ctx.font = '600 46px ' + SHARE_SERIF;
    ctx.fillText('Lucenta', M + 30, M + 8);
    ctx.fillStyle = C.muted; ctx.font = '600 21px ' + SHARE_SANS;
    ctx.fillText(unterzeile, M + 2, M + 50);
  }
  function tfMonatZeichnen(ctx, C, jahr, monat, nach, groesse, x, y, schritt, zelle){
    var heute = todayKey();
    tfMonatsZellen(jahr, monat, nach).forEach(function(z, i){
      if (!z) return;
      ctx.fillStyle = tfZellFarbe(C, tfStufe(z.tag, groesse), z.day > heute);
      var px = x + (i % 7) * schritt, py = y + Math.floor(i / 7) * schritt, r = zelle * .22;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(px, py, zelle, zelle, r); else ctx.rect(px, py, zelle, zelle);
      ctx.fill();
    });
  }
  function tfLegende(ctx, C, W, y, groesse){
    ctx.font = '500 22px ' + SHARE_SANS;
    var x = W / 2 - 100;
    ctx.fillStyle = C.muted; ctx.textAlign = 'right';
    ctx.fillText(decodeEntities(tx(groesse === 'energy' ? 'js_energie' : 'js_stimmung')) + '   1', x - 12, y + 23);
    for (var s = 1; s <= 5; s++){ ctx.fillStyle = tfZellFarbe(C, s); ctx.fillRect(x + (s - 1) * 40, y, 30, 30); }
    ctx.fillStyle = C.muted; ctx.textAlign = 'left';
    ctx.fillText('5', x + 5 * 40 + 2, y + 23);
  }
  function tfLeinwand(){
    var c = document.createElement('canvas'); c.width = SHARE_FORMAT.w; c.height = SHARE_FORMAT.h;
    var ctx = c.getContext('2d'), C = shareColors();
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, c.width, c.height);
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    return {c: c, ctx: ctx, C: C};
  }
  function tfJahrBild(jahr, groesse){
    var L = tfLeinwand(), ctx = L.ctx, C = L.C, W = SHARE_FORMAT.w, M = 84, nach = tfTageNachSchluessel();
    tfBildKopf(ctx, C, M, decodeEntities(tx('tagesform_2')));
    ctx.fillStyle = C.ink; ctx.font = '600 60px ' + SHARE_SERIF;
    ctx.fillText(decodeEntities(tx('tf_jahr_bild_titel').split('{jahr}').join(String(jahr))), M, 250);
    var spalte = (W - 2 * M) / 3, schritt = 31, zelle = 26;
    for (var m = 0; m < 12; m++){
      var x = M + (m % 3) * spalte, y = 300 + Math.floor(m / 3) * 238;
      ctx.fillStyle = C.muted; ctx.font = '600 24px ' + SHARE_SANS;
      ctx.fillText(tfMonatsName(jahr, m, false), x, y + 22);
      tfMonatZeichnen(ctx, C, jahr, m, nach, groesse, x, y + 36, schritt, zelle);
    }
    tfLegende(ctx, C, W, 1270, groesse);
    return {canvas: L.c, datei: 'lucenta-' + jahr + '.png', text: decodeEntities(tx('tf_jahr_bild_titel').split('{jahr}').join(String(jahr)))};
  }
  function tfRueckblickBild(r, groesse){
    var L = tfLeinwand(), ctx = L.ctx, C = L.C, W = SHARE_FORMAT.w, M = 84;
    var titel = decodeEntities(tx('tf_rb_titel').split('{monat}').join(tfMonatsName(r.jahr, r.monat, true)));
    tfBildKopf(ctx, C, M, decodeEntities(tx('tagesform_2')));
    ctx.fillStyle = C.ink; ctx.font = '600 60px ' + SHARE_SERIF;
    // wrapCanvasText gibt die Grundlinie der LETZTEN Zeile zurueck, nicht die naechste Position.
    var y = wrapCanvasText(ctx, titel, M, 250, W - 2 * M, 68) + 28;
    ctx.font = '500 32px ' + SHARE_SANS;
    tfRueckblickZeilen(r).forEach(function(z){
      ctx.fillStyle = C.ink;
      y = wrapCanvasText(ctx, decodeEntities(z.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '')), M, y + 52, W - 2 * M, 42);
    });
    var schritt = 96, zelle = 84, x = (W - 7 * schritt + (schritt - zelle)) / 2;
    tfMonatZeichnen(ctx, C, r.jahr, r.monat, tfTageNachSchluessel(), groesse, x, Math.max(y + 40, 640), schritt, zelle);
    tfLegende(ctx, C, W, 1270, groesse);
    return {canvas: L.c, datei: 'lucenta-' + r.jahr + '-' + String(r.monat + 1).padStart(2, '0') + '.png', text: titel};
  }
  function rbWocheBild(versatz, groesse){
    var montag = rbWocheMontag(versatz), r = rbWocheDaten(montag);
    var L = tfLeinwand(), ctx = L.ctx, C = L.C, W = SHARE_FORMAT.w, M = 84;
    var fmt = function(d){ try{ return new Intl.DateTimeFormat(tx('datum_gebietsschema'), {day:'numeric', month:'short'}).format(d); }catch(e){ return tfTagSchluessel(d); } };
    var sonntag = new Date(montag.getFullYear(), montag.getMonth(), montag.getDate() + 6, 12);
    var titel = decodeEntities(tx('tf_woche_titel')) + ' · ' + fmt(montag) + ' – ' + fmt(sonntag);
    tfBildKopf(ctx, C, M, decodeEntities(tx('tagesform_2')));
    ctx.fillStyle = C.ink; ctx.font = '600 60px ' + SHARE_SERIF;
    var y = wrapCanvasText(ctx, titel, M, 250, W - 2 * M, 68) + 28;
    ctx.font = '500 32px ' + SHARE_SANS;
    var zeilen = [wertFest(tx('tf_kal_schnitt')).split('{e}').join(tfZahl(r.e)).split('{s}').join(tfZahl(r.s)).split('{n}').join(String(r.n)),
                  tx('tf_woche_beste').split('{tag}').join(r.beste)];
    if (typeof r.de === 'number') zeilen.push(wertFest(tx('tf_woche_vgl')).split('{e}').join(tfDiff(r.de)).split('{s}').join(tfDiff(r.ds)));
    zeilen.forEach(function(z){ ctx.fillStyle = C.ink; y = wrapCanvasText(ctx, decodeEntities(z.replace(/<[^>]+>/g, '')), M, y + 52, W - 2 * M, 42); });
    var schritt = 128, zelle = 112, x = (W - 7 * schritt + (schritt - zelle)) / 2, oben = Math.max(y + 60, 700), heute = todayKey();
    for (var i = 0; i < 7; i++){
      var k = tfTagSchluessel(new Date(montag.getFullYear(), montag.getMonth(), montag.getDate() + i, 12));
      ctx.fillStyle = tfZellFarbe(C, tfStufe(r.nach[k], groesse), k > heute);
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x + i * schritt, oben, zelle, zelle, zelle * .22); else ctx.rect(x + i * schritt, oben, zelle, zelle);
      ctx.fill();
    }
    tfLegende(ctx, C, W, 1270, groesse);
    return {canvas: L.c, datei: 'lucenta-woche-' + tfTagSchluessel(montag) + '.png', text: titel};
  }
  function tfTeilenVerdrahten(wurzel){
    if (!wurzel || !wurzel.querySelectorAll) return;
    wurzel.querySelectorAll('[data-jahr-teilen]').forEach(function(b){
      b.addEventListener('click', function(){ openImgModal(tfJahrBild(+b.getAttribute('data-jahr-teilen'), tfKalenderGroesse)); });
    });
    wurzel.querySelectorAll('[data-woche-teilen]').forEach(function(b){
      b.addEventListener('click', function(){ openImgModal(rbWocheBild(+b.getAttribute('data-woche-teilen'), tfKalenderGroesse)); });
    });
    wurzel.querySelectorAll('[data-rb-teilen]').forEach(function(b){
      b.addEventListener('click', function(){
        var t = b.getAttribute('data-rb-teilen').split('-'), r = tfRueckblickDaten(+t[0], +t[1]);
        if (r) openImgModal(tfRueckblickBild(r, tfKalenderGroesse));
      });
    });
  }

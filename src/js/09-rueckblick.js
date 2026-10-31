// ---------- Jahr auf einen Blick und Monatsrueckblick (Lucenta+) ----------
// Entscheidungen des Inhabers: Jahr als Umschalter im Kalender, zwoelf Monate wie in Apples Kalender;
// Rueckblick unter jedem vergangenen Monat und in den ersten 7 Tagen als Karte auf "Heute". Nur echte
// Zahlen: Fehlt die Grundlage, entfaellt die Zeile. Beides als Bild teilbar (Bildfenster aus 18).
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
  // Zellen eines Monats, Montag zuerst: null = Luecke vor dem 1., sonst {day, tag}.
  function tfMonatsZellen(jahr, monat, nachSchluessel){
    var leer = (new Date(jahr, monat, 1).getDay() + 6) % 7, n = new Date(jahr, monat + 1, 0).getDate(), z = [];
    for (var i = 0; i < leer; i++) z.push(null);
    for (var t = 1; t <= n; t++){
      var k = tfTagSchluessel(new Date(jahr, monat, t));
      z.push({day: k, tag: nachSchluessel[k] || null});
    }
    return z;
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
      '<p class="tf-kal-ueberblick">'+tx('tf_jahr_tage').split('{n}').join(String(tage))+'</p>'+
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
    var z = [tx('tf_kal_schnitt').split('{e}').join(tfZahl(r.e)).split('{s}').join(tfZahl(r.s)).split('{n}').join(String(r.n))];
    if (typeof r.de === 'number') z.push(tx('tf_kal_vgl').split('{e}').join(tfDiff(r.de)).split('{s}').join(tfDiff(r.ds)));
    if (r.zeit) z.push(tx('tf_rb_zeit').split('{zeit}').join(tx('tf_abschnitt_' + r.zeit)));
    if (r.stichwort) z.push(tx(r.stichwortBeste ? 'tf_rb_stichwort_beste' : 'tf_rb_stichwort_oft').split('{tag}').join(tx('tf_tag_' + r.stichwort)));
    return z;
  }
  function tfRueckblickHTML(r, groesse){
    var nach = tfTageNachSchluessel();
    return '<div class="tf-rb">'+
      '<div class="tf-rb-titel">'+tx('tf_rb_titel').split('{monat}').join(tfMonatsName(r.jahr, r.monat, false))+'</div>'+
      '<ul class="tf-rb-zeilen">'+tfRueckblickZeilen(r).map(function(z){ return '<li>'+z+'</li>'; }).join('')+'</ul>'+
      '<div class="tf-rb-tage" aria-hidden="true">'+tfMonatsZellen(r.jahr, r.monat, nach).map(function(z){
        if (!z) return '<i class="tf-jahr-leer"></i>';
        var st = tfStufe(z.tag, groesse);
        return '<i class="'+(st ? 'tf-kal-st'+st : 'tf-jahr-ohne')+'"></i>';
      }).join('')+'</div>'+
      '<button type="button" class="btn btn-ghost btn-sm tf-teilen" data-rb-teilen="'+r.jahr+'-'+r.monat+'">'+tx('tf_als_bild_teilen')+'</button>'+
    '</div>';
  }
  // Karte auf "Heute": in den ersten 7 Tagen des Monats der Vormonat (Entscheidung des Inhabers).
  function tfRueckblickHeuteRendern(){
    var wrap = $('tfRueckblickHeute');
    if (!wrap) return;
    var d = new Date(), vm = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    var r = d.getDate() <= 7 ? tfRueckblickDaten(vm.getFullYear(), vm.getMonth()) : null;
    if (!r){ wrap.innerHTML = ''; return; }
    var karte = tfRueckblickHTML(r, tfKalenderGroesse);
    wrap.innerHTML = istPlus() ? karte : vorschauHTML(karte, tx('tf_rb_plus'));
    schloesserVerdrahten(wrap);
    tfTeilenVerdrahten(wrap);
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
  function tfTeilenVerdrahten(wurzel){
    if (!wurzel || !wurzel.querySelectorAll) return;
    wurzel.querySelectorAll('[data-jahr-teilen]').forEach(function(b){
      b.addEventListener('click', function(){ openImgModal(tfJahrBild(+b.getAttribute('data-jahr-teilen'), tfKalenderGroesse)); });
    });
    wurzel.querySelectorAll('[data-rb-teilen]').forEach(function(b){
      b.addEventListener('click', function(){
        var t = b.getAttribute('data-rb-teilen').split('-'), r = tfRueckblickDaten(+t[0], +t[1]);
        if (r) openImgModal(tfRueckblickBild(r, tfKalenderGroesse));
      });
    });
  }

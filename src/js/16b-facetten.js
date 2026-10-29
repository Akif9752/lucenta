// ---------- Ausfuehrlicher Test: 29 Facetten (Lucenta+) ----------
// IPIP-NEO-120 (Johnson, 2014, gemeinfrei) ohne O6 „Liberalism“ (politische Aussagen; Entscheidung des
// Inhabers): 116 Aussagen, je Facette vier. Texte `ft_i_<n>` in kanonischer Reihenfolge, Polung hier.
// Gezeigt wird wie im Original reihum (N1, E1, O1, A1, C1, N2 …). N-Facetten zaehlen zur Stabilitaet:
// ihr Wert wird umgekehrt (S = 100 - N), Namen als positive Pole.
  var FT_POLUNG = {N1:'++++', N2:'+++-', N3:'+++-', N4:'+++-', N5:'+---', N6:'+++-',
                   E1:'++--', E2:'++--', E3:'+++-', E4:'+++-', E5:'++++', E6:'++++',
                   O1:'++++', O2:'++--', O3:'++--', O4:'+---', O5:'+---',
                   A1:'+++-', A2:'----', A3:'++--', A4:'----', A5:'----', A6:'++--',
                   C1:'++++', C2:'+---', C3:'++--', C4:'++--', C5:'++--', C6:'----'};
  var FT_DIM = {N:'S', E:'E', O:'O', A:'A', C:'C'};
  var FT_FACETTEN = Object.keys(FT_POLUNG);
  var FT_ITEMS = [];                       // kanonisch: {f, k, i}
  FT_FACETTEN.forEach(function(f){
    FT_POLUNG[f].split('').forEach(function(z){ FT_ITEMS.push({f:f, k: z === '+' ? 1 : -1, i: FT_ITEMS.length}); });
  });
  var FT_ANZAHL = FT_ITEMS.length;        // 116
  var FT_FOLGE = (function(){              // Darbietung: Runde r, Facetten in der Reihenfolge N, E, O, A, C
    var nachDim = ['N','E','O','A','C'].map(function(d){ return FT_FACETTEN.filter(function(f){ return f[0] === d; }); });
    var runde = [];
    for (var s = 0; s < 6; s++) nachDim.forEach(function(l){ if (l[s]) runde.push(l[s]); });
    var folge = [];
    for (var r = 0; r < 4; r++) runde.forEach(function(f){ folge.push(FT_FACETTEN.indexOf(f) * 4 + r); });
    return folge;
  })();
  var FT_LAUF = 'lucenta_facetten_lauf', FT_ERGEBNIS = 'lucenta_facetten';

  function ftLaufLesen(){
    try{ var l = JSON.parse(localStorage.getItem(FT_LAUF) || 'null'); if (l && typeof l.pos === 'number' && l.a) return l; }catch(e){}
    return null;
  }
  function ftErgebnisLesen(){
    try{ var r = JSON.parse(localStorage.getItem(FT_ERGEBNIS) || 'null'); if (r && r.f && typeof r.ts === 'number') return r; }catch(e){}
    return null;
  }
  // Je Facette 0–100 aus vier Antworten; N-Facetten als Stabilitaet.
  function ftAuswerten(a){
    var f = {};
    FT_FACETTEN.forEach(function(name){
      var summe = 0;
      FT_ITEMS.forEach(function(it){ if (it.f === name) summe += it.k === 1 ? a[it.i] : 6 - a[it.i]; });
      var w = Math.round((summe - 4) / 16 * 100);
      f[name] = name[0] === 'N' ? 100 - w : w;
    });
    return f;
  }

  // Ablauf wie im normalen Fragebogen (Auftrag des Inhabers): Fortschrittsbalken mit Vierteln, Antwortwort
  // ueber der Skala, einfliegende Frage, Hinweise, Meilensteine mit Impuls und Funkeln — dieselben Bausteine.
  var ftLauf = null, ftUhr = null;
  // Nach jedem Viertel, mit den Texten des 50er-Tests (dort nach 13, 25, 38).
  var FT_MEILENSTEINE = {29: 13, 58: 25, 87: 38};
  function ftFrageZeigen(){
    var pos = ftLauf.pos, it = FT_ITEMS[FT_FOLGE[pos]];
    $('ftNow').textContent = pos + 1;
    $('ftText').textContent = decodeEntities(tx('ft_i_' + it.i));
    $('focusline-fill').style.width = Math.round(pos / FT_ANZAHL * 100) + '%';
    setFocuslineProgress(pos, FT_ANZAHL);
    var row = $('ftRow'); row.innerHTML = '';
    for (var v = 1; v <= 5; v++){
      var b = document.createElement('button'), gewaehlt = ftLauf.a[it.i] === v;
      b.className = 'scale-btn' + (gewaehlt ? ' picked' : '');
      b.setAttribute('aria-label', tx('js_wert') + v + tx('js_von') + ', ' + skalaBedeutung(v));
      b.setAttribute('aria-pressed', gewaehlt ? 'true' : 'false');
      b.innerHTML = '<span class="fill"></span>';
      (function(wert){ b.addEventListener('click', function(){ ftAntworten(wert); }); })(v);
      row.appendChild(b);
    }
    $('ftPrev').style.visibility = pos === 0 ? 'hidden' : 'visible';
    $('ftHint').textContent = QUIZ_HINTS[Math.min(4, Math.floor(pos / (FT_ANZAHL / 5)))];
  }
  function ftSpeichern(){ try{ localStorage.setItem(FT_LAUF, JSON.stringify(ftLauf)); }catch(e){} }
  function ftAntworten(v){
    if (!ftLauf) return;
    ftLauf.a[FT_ITEMS[FT_FOLGE[ftLauf.pos]].i] = v;
    tapFeedback();
    skalaWahlZeigen(v, 'ftWahl', 'ftRow');
    ftSpeichern();
    var row = $('ftRow');
    if (row && row.classList) row.classList.remove('row-in');
    ftFrageZeigen();
    // Ein Doppeltipp darf keine Frage ueberspringen.
    clearTimeout(ftUhr);
    ftUhr = setTimeout(function(){
      ftUhr = null;
      var ansicht = $('view-ft-test');
      if (!ftLauf || !ansicht || !ansicht.classList.contains('active')) return;
      if (ftLauf.pos + 1 < FT_ANZAHL){
        ftLauf.pos++;
        ftFrageZeigen();
        animateQuestionIn('ftCard', 'ftRow');
        ftSpeichern();
        var m = FT_MEILENSTEINE[ftLauf.pos];
        if (m){ toast(QUIZ_MILESTONES[m]); pulseFocusline(); funkelnAmFortschritt(); }
        return;
      }
      ftAbschliessen();
    }, 220);
  }
  function ftAbschliessen(){
    var ergebnis = {ts: Date.now(), f: ftAuswerten(ftLauf.a)};
    try{ localStorage.setItem(FT_ERGEBNIS, JSON.stringify(ergebnis)); localStorage.removeItem(FT_LAUF); }catch(e){}
    ftLauf = null;
    $('focusline-fill').style.width = '100%';
    pulseFocusline(); funkelnAmFortschritt();
    setTimeout(function(){
      ftErgebnisRendern();
      showView('ft');
      toast(tx('ft_fertig'));
    }, 600);
  }
  function ftStarten(neu){
    if (!istPlus()){ openPlusModal(); return; }
    ftLauf = (!neu && ftLaufLesen()) || {pos: 0, a: {}};
    showView('ft-test');
    ftFrageZeigen();
    animateQuestionIn('ftCard', 'ftRow');
  }

  // Karte unter den fuenf Dimensionen der Ergebnisseite.
  function ftKarteRendern(){
    var wrap = $('ftKarte');
    if (!wrap) return;
    var erg = ftErgebnisLesen(), lauf = ftLaufLesen(), plus = istPlus();
    var text = erg ? tx('ft_karte_da').split('{datum}').join(historyDateFmt().format(new Date(erg.ts)))
             : lauf ? tx('ft_karte_lauf').split('{n}').join(String(lauf.pos + 1)) : tx('ft_karte_neu');
    var knoepfe = !plus ? '<button type="button" class="btn btn-primary btn-sm" data-plus-info>' + plusKnopfText() + '</button>'
      : erg ? '<button type="button" class="btn btn-primary btn-sm" data-ft="ansehen">' + tx('ft_ansehen') + '</button>' +
              '<button type="button" class="btn btn-ghost btn-sm" data-ft="neu">' + tx('ft_wiederholen') + '</button>'
      : '<button type="button" class="btn btn-primary btn-sm" data-ft="start">' + tx(lauf ? 'ft_fortsetzen' : 'ft_starten') + '</button>';
    wrap.innerHTML = '<div class="ft-karte"><div class="ft-karte-titel">' + tx('ft_karte_titel') + '</div><p>' + text + '</p>' +
      '<div class="daten-knoepfe">' + knoepfe + '</div></div>';
    schloesserVerdrahten(wrap);
  }

  function ftErgebnisRendern(){
    var wrap = $('ftErgebnis'), erg = ftErgebnisLesen();
    if (!wrap) return;
    if (!erg){ wrap.innerHTML = ''; return; }
    var haupt = loadResult();
    var html = ['S','E','O','A','C'].map(function(dim){
      var d = FT_DIM[dim] || dim, liste = FT_FACETTEN.filter(function(f){ return FT_DIM[f[0]] === d; });
      return '<section class="ft-dim"><h2 class="ft-dim-titel">' + LABELS[d] + (haupt ? ' <span class="mono">' + haupt[d] + '</span>' : '') + '</h2>' +
        liste.map(function(f){
          var w = erg.f[f];
          return '<div class="ft-zeile"><div class="ft-kopf"><span>' + tx('ft_n_' + f) + '</span><span class="mono">' + w + '</span></div>' +
            '<div class="ft-balken" aria-hidden="true"><span style="width:' + Math.max(2, w) + '%"></span></div>' +
            '<p>' + tx('ft_s_' + f) + '</p></div>';
        }).join('') + '</section>';
    });
    // Reihenfolge wie im Ergebnis (ORDER), nicht wie im Fragebogen.
    var nachDim = {};
    ['S','E','O','A','C'].forEach(function(d, i){ nachDim[d] = html[i]; });
    var inhalt = ORDER.map(function(d){ return nachDim[d]; }).join('');
    wrap.innerHTML = istPlus() ? inhalt : vorschauHTML(inhalt, tx('ft_plus'));
    schloesserVerdrahten(wrap);
  }

  function ftEinrichten(){
    var karte = $('ftKarte');
    if (karte) karte.addEventListener('click', function(e){
      var b = e.target.closest ? e.target.closest('[data-ft]') : null;
      if (!b) return;
      var was = b.getAttribute('data-ft');
      if (was === 'ansehen'){ ftErgebnisRendern(); showView('ft'); }
      else ftStarten(was === 'neu');
    });
    if ($('ftPrev')) $('ftPrev').addEventListener('click', function(){
      if (ftLauf && ftLauf.pos > 0){ clearTimeout(ftUhr); ftLauf.pos--; ftFrageZeigen(); animateQuestionIn('ftCard', 'ftRow'); ftSpeichern(); }
    });
    ['btnBackFromFacettenTest', 'btnBackFromFacetten'].forEach(function(id){
      if ($(id)) $(id).addEventListener('click', function(){ ftKarteRendern(); showView('result'); });
    });
  }

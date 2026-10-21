  // ---------- Freunde ----------
  // Menschen, mit denen man sich vergleicht: Name, Figur, Code — nur auf diesem Geraet. Die Vergleiche
  // selbst bleiben im Archiv; verbunden wird ueber den Code (Entscheidung des Inhabers). Einladen geht
  // ueber das Teilen-Blatt: Die Person verschickt selbst, Lucenta sendet nichts.
  var FREUNDE_SCHLUESSEL = 'lucenta_freunde';
  var MAX_FREUNDE = 30;
  var freundNeuFigur = '';
  // Namen sind Eingaben: nie ungeprueft als HTML einsetzen.
  function escapeHTML(t){
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function loadFreunde(){
    try{
      var l = JSON.parse(localStorage.getItem(FREUNDE_SCHLUESSEL) || '[]');
      if (!Array.isArray(l)) return [];
      return l.filter(function(f){ return f && typeof f.code === 'string' && typeof f.name === 'string'; });
    }catch(e){ return []; }
  }
  function saveFreunde(l){
    try{ localStorage.setItem(FREUNDE_SCHLUESSEL, JSON.stringify(l.slice(-MAX_FREUNDE))); return true; }
    catch(e){ return false; }
  }
  function clearFreunde(){
    try{ localStorage.removeItem(FREUNDE_SCHLUESSEL); }catch(e){}
  }
  // Dieselbe Kennzahl wie im Vergleich (renderCompat): 100 minus mittlere Abweichung.
  function uebereinstimmung(me, other){
    var d = ORDER.reduce(function(s, f){ return s + Math.abs(me[f] - other[f]); }, 0) / ORDER.length;
    return Math.round(100 - d);
  }
  // Aus dem Vergleich heraus: Freunde-Seite mit vorausgefuelltem Code (und Namen, falls getippt).
  function freundVorbereiten(code, name){
    renderFreunde();
    showView('freunde');
    $('freundCode').value = code;
    $('freundName').value = name || '';
    setTimeout(function(){
      var f = $('freundName');
      f.scrollIntoView({behavior:'smooth', block:'center'});
      try{ f.focus({preventScroll:true}); }catch(e){}
    }, 350);
  }
  // Freunde mit gueltigem Code und ihre Uebereinstimmung mit dem eigenen Ergebnis, aehnlichste zuerst.
  function freundeNachNaehe(eigen){
    return loadFreunde().map(function(f){
      var sc = fromCode(f.code);
      return sc ? {f: f, sc: sc, match: uebereinstimmung(eigen, sc)} : null;
    }).filter(Boolean).sort(function(a, b){ return b.match - a.match; });
  }
  var GRUPPE_MAX = 5;
  var GRUPPE_FARBEN = ['--dim-o', '--dim-e', '--dim-c', '--dim-a', '--dim-s'];
  // Das Gruppenbild: das eigene Profil als Flaeche, bis zu fuenf Freunde als Linien.
  function gruppenRadarSVG(eigen, liste){
    var size = 300, c = size/2, r = size*0.34, labelR = size*0.42;
    function pts(sc){ return polyPoints(sc, c, r).map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' '); }
    var ringe = [0.25,0.5,0.75,1].map(function(frac){
      return '<polygon points="'+ORDER.map(function(f,i){ var a=-Math.PI/2+i*(2*Math.PI/5); return (c+r*frac*Math.cos(a)).toFixed(1)+','+(c+r*frac*Math.sin(a)).toFixed(1); }).join(' ')+'" fill="none" stroke="var(--line)" stroke-width="1"/>';
    }).join('');
    var achsen = ORDER.map(function(f,i){
      var a=-Math.PI/2+i*(2*Math.PI/5), lx=c+labelR*Math.cos(a), ly=c+labelR*Math.sin(a);
      var anker = Math.abs(Math.cos(a))<0.2 ? 'middle' : (Math.cos(a)>0?'start':'end');
      return '<line x1="'+c+'" y1="'+c+'" x2="'+(c+r*Math.cos(a)).toFixed(1)+'" y2="'+(c+r*Math.sin(a)).toFixed(1)+'" stroke="var(--line)" stroke-width="1"/>'+
        '<text x="'+lx.toFixed(1)+'" y="'+(ly+4).toFixed(1)+'" text-anchor="'+anker+'" class="radar-axis-label">'+RADAR_LABELS[f]+'</text>';
    }).join('');
    var linien = liste.map(function(e, i){
      return '<polygon points="'+pts(e.sc)+'" fill="none" stroke="var('+GRUPPE_FARBEN[i]+')" stroke-width="2" stroke-linejoin="round"/>';
    }).join('');
    var eigenes = '<polygon points="'+pts(eigen)+'" fill="color-mix(in srgb, var(--accent) 22%, transparent)" stroke="var(--accent)" stroke-width="2.4" stroke-linejoin="round"/>';
    var aria = tx('freunde_gruppe_aria') + ' ' + liste.map(function(e){ return e.f.name; }).join(', ');
    return '<svg viewBox="0 0 '+size+' '+size+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+escapeHTML(aria)+'">'+
      ringe+achsen+eigenes+linien+'</svg>';
  }
  function freundeUebersichtHTML(){
    var eigen = loadResult();
    var liste = eigen ? freundeNachNaehe(eigen) : [];
    if (liste.length < 2) return '';
    var rang = '<div class="settings-group freunde-naehe"><h2>'+tx('freunde_naehe_titel')+'</h2>'+
      liste.map(function(e, i){
        return '<div class="freund-naehe-zeile"><span class="freund-naehe-rang mono">'+(i+1)+'</span>'+
          '<span class="avatar freund-avatar-klein" data-naehe-avatar="'+i+'" aria-hidden="true"></span>'+
          '<span class="freund-naehe-name">'+escapeHTML(e.f.name)+'</span>'+
          '<span class="freund-naehe-balken" aria-hidden="true"><span style="width:'+Math.max(4, e.match)+'%"></span></span>'+
          '<span class="freund-naehe-wert mono">'+e.match+' %</span></div>';
      }).join('')+'</div>';
    var gruppe = liste.slice(0, GRUPPE_MAX);
    var bild = '<div class="radar-wrap freunde-gruppe-radar">'+gruppenRadarSVG(eigen, gruppe)+'</div>'+
      '<div class="freunde-legende"><span><i style="background:var(--accent)"></i>'+tx('freunde_du')+'</span>'+
      gruppe.map(function(e, i){ return '<span><i style="background:var('+GRUPPE_FARBEN[i]+')"></i>'+escapeHTML(e.f.name)+'</span>'; }).join('')+'</div>';
    // Das Gruppenbild ist Lucenta+ (Entscheidung des Inhabers): Es geht ueber den freien Vergleich mit
    // zwei Personen hinaus. Frei steht es als verschwommene Vorschau.
    var gruppenTeil = '<div class="settings-group freunde-gruppe"><h2>'+tx('freunde_gruppe_titel')+'</h2>'+
      (istPlus() ? bild : vorschauHTML(bild, tx('plus_freunde_gruppe')))+'</div>';
    return rang + gruppenTeil;
  }
  function freundeUebersichtAvatare(wrap){
    var eigen = loadResult();
    if (!eigen) return;
    var liste = freundeNachNaehe(eigen);
    wrap.querySelectorAll('[data-naehe-avatar]').forEach(function(el){
      var e = liste[+el.getAttribute('data-naehe-avatar')];
      if (e) renderAvatarInto(el, {name: e.f.name, figur: e.f.figur || null, avatarColor: 'accent'});
    });
  }

  function vergleicheMit(code){
    return loadCompatArchive().filter(function(e){ return e.otherCode === code; });
  }

  // Wie "Ansehen" im Archiv: das eigene Ergebnis zeigen und den Vergleich mit dieser Person rechnen.
  function freundVergleichen(code){
    var eigen = loadResult();
    if (!eigen){ toast(tx('js_kein_eigenes_ergebnis_vorh')); return; }
    scores = eigen; guestRun = false;
    renderResult();
    showView('result');
    $('cmpMe').value = toCode(eigen);
    $('cmpOther').value = code;
    renderCompat();
    setTimeout(function(){ $('compareAnchor').scrollIntoView({behavior:'smooth'}); }, 250);
  }

  function freundeEinladen(){
    var eigen = loadResult();
    var text = eigen ? tx('freunde_einladen_text').split('{code}').join(toCode(eigen)) : tx('freunde_einladen_ohne');
    function inAblage(){
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ toast(tx('js_zum_teilen_kopiert')); })
          .catch(function(){ toast(text); });
      } else { toast(text); }
    }
    if (navigator.share){
      navigator.share({title:'Lucenta', text:text}).catch(function(err){
        if (err && err.name === 'AbortError') return;
        inAblage();
      });
    } else { inAblage(); }
  }

  function freundFigurRaster(){
    var wrap = $('freundFigurRaster');
    if (!wrap) return;
    var teile = ['<button type="button" class="figur-wahl figur-keine" data-freund-figur="" aria-pressed="'+
                 (freundNeuFigur ? 'false' : 'true')+'" aria-label="'+tx('figur_keine')+'">Aa</button>'];
    FIGUREN.forEach(function(f){
      teile.push('<button type="button" class="figur-wahl" data-freund-figur="'+f.id+'" '+
        'style="--figur-feld:'+f.feld+';--figur-feld-dunkel:'+figFeldDunkel(f.feld)+'" '+
        'aria-pressed="'+(freundNeuFigur===f.id?'true':'false')+'" aria-label="'+tx('figur_'+f.id)+'">'+figurHTML(f)+'</button>');
    });
    wrap.innerHTML = teile.join('');
    wrap.querySelectorAll('[data-freund-figur]').forEach(function(b){
      b.addEventListener('click', function(){
        freundNeuFigur = b.getAttribute('data-freund-figur') || '';
        wrap.querySelectorAll('[data-freund-figur]').forEach(function(x){
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
      });
    });
  }

  function freundSpeichern(){
    var name = ($('freundName').value || '').trim();
    var code = ($('freundCode').value || '').trim();
    if (!name){ schuetteln($('freundName')); toast(tx('freunde_name_fehlt')); return; }
    if (!fromCode(code)){ schuetteln($('freundCode')); toast(tx('freunde_code_ungueltig')); return; }
    var eigen = loadResult();
    if (eigen && toCode(eigen) === code){ schuetteln($('freundCode')); toast(tx('freunde_eigener_code')); return; }
    // Derselbe Code ist dieselbe Person: Name und Figur werden aktualisiert, nicht verdoppelt.
    var l = loadFreunde().filter(function(f){ return f.code !== code; });
    l.push({id: 'f' + Date.now().toString(36), name: name, figur: freundNeuFigur, code: code, ts: Date.now()});
    if (!saveFreunde(l)){ toast(tx('js_konnte_nicht_gespeichert_w')); return; }
    $('freundName').value = ''; $('freundCode').value = ''; freundNeuFigur = '';
    toast(tx('freunde_gespeichert'));
    renderFreunde();
    renderSettings();
  }

  function freundZeileHTML(f, i){
    var vgl = vergleicheMit(f.code);
    var unter = !vgl.length ? tx('freunde_kein_vergleich') :
      tx(vgl.length === 1 ? 'freunde_ein_vergleich' : 'freunde_n_vergleiche')
        .split('{n}').join(String(vgl.length)).split('{p}').join(String(vgl[vgl.length-1].match));
    var liste = '';
    if (vgl.length > 1){
      var fmt = historyDateFmt();
      liste = '<details class="freund-vergleiche"><summary>'+tx('freunde_vergleiche_zeigen')+'</summary><ul>'+
        vgl.slice().reverse().map(function(e){
          var d = ''; try{ d = fmt.format(new Date(e.ts)); }catch(ex){}
          return '<li><span>'+d+'</span><span class="mono">'+e.match+' %</span></li>';
        }).join('')+'</ul></details>';
    }
    return '<div class="freund-zeile">'+
      '<span class="avatar freund-avatar" data-freund-avatar="'+i+'" aria-hidden="true"></span>'+
      '<div class="freund-text"><div class="history-title">'+escapeHTML(f.name)+'</div>'+
        '<div class="history-date">'+unter+'</div>'+liste+'</div>'+
      '<div class="archive-row-actions">'+
        '<button type="button" class="btn btn-ghost btn-sm" data-freund-vergleichen="'+i+'">'+tx('freunde_vergleichen')+'</button>'+
        '<button type="button" class="archive-del" data-freund-entfernen="'+i+'" aria-label="'+tx('freunde_entfernen_aria')+' '+escapeHTML(f.name)+'">'+
          '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'+
        '</button>'+
      '</div></div>';
  }

  function renderFreunde(){
    var wrap = $('freundeListe');
    if (!wrap) return;
    var oben = $('freundeUebersicht');
    if (oben){ oben.innerHTML = freundeUebersichtHTML(); freundeUebersichtAvatare(oben); schloesserVerdrahten(oben); }
    var l = loadFreunde().slice().reverse();
    wrap.innerHTML = l.length ? '<div class="history-list">'+l.map(freundZeileHTML).join('')+'</div>'
                              : emptyStateHTML(tx('freunde_leer'));
    wrap.querySelectorAll('[data-freund-avatar]').forEach(function(el){
      var f = l[+el.getAttribute('data-freund-avatar')];
      renderAvatarInto(el, {name: f.name, figur: f.figur || null, avatarColor: 'accent'});
    });
    wrap.querySelectorAll('[data-freund-vergleichen]').forEach(function(b){
      b.addEventListener('click', function(){ freundVergleichen(l[+b.getAttribute('data-freund-vergleichen')].code); });
    });
    wrap.querySelectorAll('[data-freund-entfernen]').forEach(function(b){
      b.addEventListener('click', function(){
        var code = l[+b.getAttribute('data-freund-entfernen')].code;
        saveFreunde(loadFreunde().filter(function(f){ return f.code !== code; }));
        toast(tx('freunde_entfernt'));
        renderFreunde();
        renderSettings();
      });
    });
    freundFigurRaster();
  }

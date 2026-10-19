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

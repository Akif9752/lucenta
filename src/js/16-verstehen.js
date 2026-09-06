// ---------- "Verstehen": profilbasierte Kurz-Einordnungen ----------
  function renderUnderstand(){
    var last = loadResult();
    var wrap = $('understandContent');
    if (!last){
      wrap.innerHTML = emptyStateHTML(tx('js_noch_kein_ergebnis_auf_die_2'), {btnId:'btnUnderstandStart', btnLabel:tx('js_test_starten_2')});
      $('btnUnderstandStart').addEventListener('click', function(){ beginRun(false); });
      return;
    }
    var arch = archetypeOf(last);
    var traitsToShow = [
      {f:arch.top1, pole: last[arch.top1]>=50?'high':'low'},
      {f:arch.top2, pole: last[arch.top2]>=50?'high':'low'}
    ];
    var html = traitsToShow.map(function(t){
      var cards = UNDERSTAND[t.f][t.pole];
      var groupLabel = LABELS[t.f]+' &middot; '+ADJ[t.f][t.pole];
      return '<div class="understand-group-label">'+groupLabel+'</div>'+
        cards.map(function(c,i){
          return '<div class="understand-card" style="animation-delay:'+(i*60)+'ms"><h3>'+c.title+'</h3><p>'+c.body+'</p></div>';
        }).join('');
    }).join('');
    wrap.innerHTML = html +
      tx('js_diese_einordnungen_fassen');
  }

  
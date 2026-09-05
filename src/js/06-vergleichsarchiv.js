// ---------- Vergleichsarchiv ----------
  function renderCompatArchive(){
    $('compatArchiveMaxCount').textContent = MAX_COMPAT_ARCHIVE;
    var list = loadCompatArchive();
    var wrap = $('compatArchiveContent');
    if (list.length===0){
      wrap.innerHTML = emptyStateHTML(tx('js_noch_kein_vergleich_gespei'), {extraClass:'archive-empty-note'});
      return;
    }
    var fmt = historyDateFmt();
    var rows = list.slice().reverse().map(function(e){
      var dateStr;
      try{ dateStr = fmt.format(new Date(e.ts)); }catch(ex){ dateStr=''; }
      var label = e.label ? e.label : 'Unbenannter Vergleich';
      return '<div class="history-row">'+
        '<div><div class="history-date">'+dateStr+'</div><div class="history-title">'+label+'</div></div>'+
        '<div class="archive-row-actions">'+
          '<span class="archive-match mono">'+e.match+'%</span>'+
          '<button type="button" class="btn btn-ghost btn-sm" data-view-archive="'+e.id+'">' + tx('js_ansehen') + '</button>'+
          '<button type="button" class="archive-del" data-del-archive="'+e.id+tx('js_arialabelvergleich_mit')+label+tx('js_löschen')+
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>'+
          '</button>'+
        '</div></div>';
    }).join('');
    wrap.innerHTML = '<div class="history-list">'+rows+'</div>';
    wrap.querySelectorAll('[data-view-archive]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-view-archive');
        var entry = loadCompatArchive().filter(function(e){ return e.id===id; })[0];
        if (!entry) return;
        var last = loadResult();
        if (last) scores = last;
        else if (!scores) scores = fromCode(entry.myCode);
        if (!scores){ toast(tx('js_kein_eigenes_ergebnis_vorh')); return; }
        renderResult();
        showView('result');
        $('cmpMe').value = entry.myCode;
        $('cmpOther').value = entry.otherCode;
        renderCompat();
        setTimeout(function(){ $('compareAnchor').scrollIntoView({behavior:'smooth'}); }, 250);
      });
    });
    wrap.querySelectorAll('[data-del-archive]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var id = btn.getAttribute('data-del-archive');
        removeCompatArchiveEntry(id);
        renderCompatArchive();
        refreshDrawerState();
        toast(tx('js_vergleich_gelöscht'));
      });
    });
  }

  
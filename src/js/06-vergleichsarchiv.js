// ---------- Vergleichsarchiv ----------
  // Mittlere absolute Abweichung je Dimension ueber alle gespeicherten Vergleiche. Eigene Werte
  // kommen aus dem gespeicherten Ergebnis, die der anderen aus dem mitgespeicherten Code.
  function archivUebersicht(list){
    if (!list || list.length < 3) return '';
    var eigen = loadResult();
    if (!eigen) return '';
    var summe = {O:0,C:0,E:0,A:0,S:0}, n = 0;
    var beste = null;
    list.forEach(function(e){
      var andere = null;
      try{ andere = fromCode(e.otherCode); }catch(x){}
      if (!andere) return;
      n++;
      ORDER.forEach(function(f){ summe[f] += Math.abs(eigen[f] - andere[f]); });
      if (!beste || e.match > beste.match) beste = e;
    });
    if (n < 3) return '';
    var sortiert = ORDER.slice().sort(function(a,b){ return summe[b] - summe[a]; });
    var weitest = sortiert[0], naechst = sortiert[sortiert.length-1];
    var teile = '';
    if (beste){
      teile += '<div class="befund"><div class="befund-titel">'+tx('js_archiv_titel_naechste')+'</div>'+
        '<p class="befund-text">'+(beste.label ? beste.label : tx('js_unbenannter_vergleich'))+
        tx('js_archiv_naechste_a')+beste.match+tx('js_archiv_naechste_b')+'</p></div>';
    }
    teile += '<div class="befund"><div class="befund-titel">'+tx('js_archiv_titel_muster')+'</div>'+
      '<p class="befund-text">'+tx('js_archiv_muster_a')+LABELS[weitest]+tx('js_archiv_muster_b')+
      LABELS[naechst]+tx('js_archiv_muster_c')+n+tx('js_archiv_muster_d')+'</p></div>';
    return '<div class="befund-liste archiv-uebersicht">'+teile+'</div>';
  }

  function renderCompatArchive(){
    $('compatArchiveMaxCount').textContent = MAX_COMPAT_ARCHIVE;
    var list = loadCompatArchive();
    var wrap = $('compatArchiveContent');
    if (list.length===0){
      wrap.innerHTML = emptyStateHTML(tx('js_noch_kein_vergleich_gespei'), {extraClass:'archive-empty-note'});
      return;
    }
    // Runde 76: Das Archiv war eine reine Liste — es sammelte, wertete aber nichts aus. Aus den
    // gespeicherten Codes laesst sich das Profil der anderen Person zurueckrechnen, und damit
    // laesst sich sagen, WORIN du dich von anderen typischerweise unterscheidest. Das ist die
    // eigentliche Aussage eines Archivs; die Liste allein ist nur ein Beleg.
    //
    // Erst ab drei Vergleichen: Bei zweien waere "typischerweise" eine Behauptung ueber einen
    // einzelnen anderen Menschen, nicht ueber ein Muster.
    var uebersicht = archivUebersicht(list);
    var fmt = historyDateFmt();
    var rows = list.slice().reverse().map(function(e){
      var dateStr;
      try{ dateStr = fmt.format(new Date(e.ts)); }catch(ex){ dateStr=''; }
      var label = e.label ? e.label : tx('js_unbenannter_vergleich');
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
    wrap.innerHTML = uebersicht + '<div class="history-list">'+rows+'</div>';
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

  
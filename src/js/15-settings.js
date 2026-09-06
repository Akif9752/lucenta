// ---------- settings ----------
  function renderSettings(){
    var progress = loadProgress();
    var result = loadResult();
    var profile = loadProfile();

    renderAvatarInto($('settingsAvatar'), profile);
    $('settingsAccountName').textContent = profile.name ? profile.name : tx('js_profil');
    $('settingsAccountSub').textContent = profile.name ? tx('js_name_gesetzt') : (profile.avatarImg ? tx('js_bild_gesetzt_noch_kein_nam') : tx('js_noch_kein_name_gesetzt'));

    if (progress){
      $('settingsTestStatus').textContent = tx('js_unterbrochen_bei_frage') + (progress.qi+1) + tx('js_von_2');
      $('btnDiscardProgress').style.display = '';
    } else {
      $('settingsTestStatus').textContent = tx('js_gerade_kein_unterbrochener');
      $('btnDiscardProgress').style.display = 'none';
    }

    var items = [];
    if (profile.name || profile.avatarImg){
      var parts = [];
      if (profile.name) parts.push(tx('js_datenpunkt_name'));
      if (profile.avatarImg) parts.push(tx('js_datenpunkt_bild'));
      items.push(tx('js_datenpunkt_profil') + ' (' + parts.join(', ') + ')');
    }
    if (result) items.push(tx('js_gespeichertes_ergebnis'));
    if (progress) items.push(tx('js_unterbrochener_test'));
    var histCount = loadHistory().length;
    if (histCount) items.push(histCount + (histCount===1 ? tx('js_ergebnis_im_verlauf') : tx('js_ergebnisse_im_verlauf')));
    var stateCount = loadStateHistory().length;
    if (stateCount) items.push(stateCount + (stateCount===1 ? tx('js_tagesformeintrag') : tx('js_tagesformeinträge')));
    var archiveCount = loadCompatArchive().length;
    if (archiveCount) items.push(archiveCount + (archiveCount===1 ? tx('js_gespeicherter_vergleich') : tx('js_gespeicherte_vergleiche')));
    var list = $('settingsDataList');
    if (items.length){
      list.innerHTML = items.map(function(t){ return '<li>'+t+'</li>'; }).join('');
      list.style.display = '';
      $('settingsEmptyNote').style.display = 'none';
    } else {
      list.innerHTML = '';
      list.style.display = 'none';
      $('settingsEmptyNote').style.display = '';
    }
  }

  function openDrawer(){
    refreshDrawerState();
    drawerLastFocus = document.activeElement;
    $('drawerPanel').classList.add('open');
    $('drawerPanel').setAttribute('aria-hidden','false');
    $('drawerScrim').classList.add('show');
    $('btnDrawerToggle').setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
    // Restlichen Seiteninhalt für Screenreader/Tastatur unerreichbar machen, solange der
    // modale Drawer offen ist — sonst bleibt er per virtuellem Cursor navigierbar.
    var shell = $('shell'); if (shell) shell.setAttribute('inert','');
    document.addEventListener('keydown', drawerKeydown);
    pushOverlayState('drawer');
    setTimeout(function(){ $('btnDrawerClose').focus(); }, 50);
  }
  // keepHistory=true bedeutet: der Verlauf wurde bereits an anderer Stelle behandelt — entweder
  // weil die Zurück-Geste selbst das Schließen ausgelöst hat, oder weil unmittelbar danach eine
  // Ansicht geöffnet wird, die den Überlagerungs-Eintrag ohnehin ersetzt.
  function closeDrawer(keepHistory){
    $('drawerPanel').classList.remove('open');
    $('drawerPanel').setAttribute('aria-hidden','true');
    $('drawerScrim').classList.remove('show');
    $('btnDrawerToggle').setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    var shell = $('shell'); if (shell) shell.removeAttribute('inert');
    document.removeEventListener('keydown', drawerKeydown);
    if (drawerLastFocus && drawerLastFocus.focus) drawerLastFocus.focus();
    if (keepHistory !== true) popOverlayState();
  }

  
  // ---------- Sichern und Einspielen (Runde 76) ----------
  // Der 10-Zeichen-Code traegt nur das Ergebnis. Verlauf, Tagesform, Profil und Vergleichsarchiv
  // gingen beim Geraetewechsel verloren — die App sagt zu, dass alles im Geraet bleibt, sagte
  // aber nicht, wie man es mitnimmt.
  //
  // Zwei Wege beim Sichern, weil der eine nicht ueberall geht: Erst der Versuch, eine Datei zu
  // speichern; wo das unterbunden ist (eingebettete Ansichten unterbinden Downloads), landet
  // alles in der Zwischenablage. Ein Weg allein waere in der Haelfte der Faelle eine Sackgasse.
  var DATEN_SCHLUESSEL = ['lucenta_result','lucenta_history','lucenta_state','lucenta_profile',
                          'lucenta_compat_archive','lucenta_progress'];

  function datenSammeln(){
    var d = {app:'lucenta', fassung:1, ts:Date.now(), daten:{}};
    DATEN_SCHLUESSEL.forEach(function(k){
      try{ var v = localStorage.getItem(k); if (v !== null) d.daten[k] = v; }catch(e){}
    });
    return JSON.stringify(d);
  }

  // Ein blockierter Download wirft KEINEN Fehler — a.click() tut in dem Fall schlicht nichts.
  // Der erste Entwurf schloss aus dem ausbleibenden Fehler auf Erfolg und haette in einem
  // eingebetteten Rahmen "Datei gespeichert" gemeldet und nichts geliefert. Da sich das nicht
  // abfragen laesst, entscheidet die Lage: In einem Rahmen sind Downloads regelmaessig
  // unterbunden, dort geht es direkt in die Zwischenablage.
  function imRahmen(){
    try{ return window.self !== window.top; }catch(e){ return true; }
  }

  function inZwischenablage(text){
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ toast(tx('js_export_kopiert')); })
        .catch(function(){ toast(tx('js_export_kopiert')); });
    } else {
      toast(tx('js_export_kopiert'));
    }
  }

  function datenSichern(){
    var text = datenSammeln();
    if (imRahmen()){ inZwischenablage(text); return; }
    var name = 'lucenta-' + new Date().toISOString().slice(0,10) + '.json';
    try{
      var blob = new Blob([text], {type:'application/json'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
      toast(tx('js_export_geladen'));
    }catch(e){ inZwischenablage(text); }
  }

  function datenEinspielen(text){
    if (!text || !text.trim()){ toast(tx('js_import_leer')); return; }
    var d = null;
    try{ d = JSON.parse(text); }catch(e){}
    // Bewusst streng: Wer hier irgendetwas einspielt, ueberschreibt seinen eigenen Bestand.
    if (!d || d.app !== 'lucenta' || !d.daten || typeof d.daten !== 'object'){
      toast(tx('js_import_fehler')); return;
    }
    var geschrieben = 0;
    DATEN_SCHLUESSEL.forEach(function(k){
      if (typeof d.daten[k] !== 'string') return;
      try{ localStorage.setItem(k, d.daten[k]); geschrieben++; }catch(e){}
    });
    if (!geschrieben){ toast(tx('js_import_fehler')); return; }
    toast(tx('js_import_ok'));
    // Neu laden statt jede Ansicht einzeln nachzuziehen: Nach einem Austausch des gesamten
    // Bestands ist das der einzige Weg, der sicher keinen alten Zustand stehen laesst.
    setTimeout(function(){ try{ location.reload(); }catch(e){} }, 700);
  }

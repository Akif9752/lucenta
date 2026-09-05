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
      if (profile.name) parts.push('Name');
      if (profile.avatarImg) parts.push('Bild');
      items.push('Profil (' + parts.join(', ') + ')');
    }
    if (result) items.push(tx('js_gespeichertes_ergebnis'));
    if (progress) items.push(tx('js_unterbrochener_test'));
    var histCount = loadHistory().length;
    if (histCount) items.push(histCount + (histCount===1 ? tx('js_ergebnis_im_verlauf') : ' Ergebnisse im Verlauf'));
    var stateCount = loadStateHistory().length;
    if (stateCount) items.push(stateCount + (stateCount===1 ? ' Tagesform-Eintrag' : tx('js_tagesformeinträge')));
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

  
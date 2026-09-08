// ---------- Beta-Rückmeldung (Backlog Runde 29, Punkt 1) ----------
  var feedbackRating = null;
  $('feedbackOpts').addEventListener('click', function(e){
    var btn = e.target.closest ? e.target.closest('.feedback-opt') : null;
    if (!btn) return;
    feedbackRating = btn.getAttribute('data-fb');
    Array.prototype.forEach.call($('feedbackOpts').querySelectorAll('.feedback-opt'), function(b){
      b.setAttribute('aria-pressed', b===btn ? 'true':'false');
    });
    $('feedbackMore').style.display = '';
  });
  $('btnFeedbackSend').addEventListener('click', function(){
    // Bewusst ohne Werte, ohne Code, ohne Namen: eine Rückmeldung zur App soll keine
    // Persönlichkeitsdaten mit sich tragen, nur weil sie gerade greifbar wären.
    var note = ($('feedbackText').value || '').trim();
    var text = tx('js_lucenta_betarückmeldungnpo') + (feedbackRating || tx('js_ohne_angabe')) +
               (note ? (decodeEntities(tx('js_anmerkung')) + note) : '');
    var done = function(){ toast(tx('js_danke__das_hilft_wirklich')); };
    if (navigator.share){
      navigator.share({text:text}).then(done).catch(function(){ copyFeedback(text, done); });
    } else { copyFeedback(text, done); }
  });
  function copyFeedback(text, done){
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ toast(tx('js_in_die_zwischenablage_kopi')); }).catch(function(){ done(); });
    } else { done(); }
  }

  Array.prototype.forEach.call(document.querySelectorAll('.img-format-btn'), function(b){
    b.addEventListener('click', function(){
      var f = b.getAttribute('data-fmt');
      if (f===shareFormat) return;
      shareFormat = f;
      renderShareImage();
    });
  });

  document.querySelectorAll('[data-lang]').forEach(function(b){
    b.addEventListener('click', function(){ setLang(b.getAttribute('data-lang')); });
  });

  $('btnA2hsDismiss').addEventListener('click', function(){
    try{ localStorage.setItem('lucenta_a2hs_hidden','1'); }catch(e){}
    $('a2hsHint').style.display = 'none';
  });

  $('btnRunSelf').addEventListener('click', function(){ beginRun(false); });
  $('btnRunGuest').addEventListener('click', function(){ beginRun(true); });
  $('btnRunCancel').addEventListener('click', function(){
    hideRunChoice();
    try{ $('btnStart').focus(); }catch(e){}
  });
  $('btnDrawerToggle').addEventListener('click', openDrawer);
  $('btnDrawerClose').addEventListener('click', closeDrawer);
  $('drawerScrim').addEventListener('click', closeDrawer);
  // btnResume/btnResumeProgress (ehemals ganz unten in der Schublade) entfernt: beide Aktionen
  // laufen jetzt bereits über den Haupt-Button im Hero (syncHeroState()) bzw. über "Dein Ergebnis"
  // im Profil.
  $('btnDrawerCompare').addEventListener('click', function(){
    closeDrawer(true);
    var r = loadResult();
    if (r){ guestRun=false; scores=r; renderResult(); showView('result'); setTimeout(function(){ $('compareAnchor').scrollIntoView({behavior:'smooth'}); },300); }
    else {
      // Bugfix beim Durchgehen dieser Stelle: Dieser Zweig setzte bislang hart qi=0 und sprang an
      // den Anfang, ohne `answers` zurückzusetzen und ohne den gespeicherten Fortschritt zu
      // beachten. Wer mitten im Test über die Schublade auf "Vergleichen" tippte, stand danach
      // wieder bei Frage 1, während die bereits gegebenen Antworten unsichtbar im Speicher lagen.
      // Jetzt wird ein unterbrochener Durchlauf wie überall sonst in der App fortgesetzt.
      pendingCompareScroll = true; guestRun = false;
      var p = loadProgress();
      if (p){ answers = p.answers; qi = p.qi; } else { answers = new Array(50).fill(0); qi = 0; }
      renderQuestion(); showView('quiz');
      toast(tx('js_erst_den_test_machen_dann'));
    }
  });
  $('btnDrawerCompatArchive').addEventListener('click', function(){ closeDrawer(true); renderCompatArchive(); showView('compat-archive'); });
  $('btnBackFromCompatArchive').addEventListener('click', function(){ showView('landing'); });
  $('btnDrawerUnderstand').addEventListener('click', function(){ closeDrawer(true); renderUnderstand(); showView('understand'); });
  $('btnLandingTeaserMore').addEventListener('click', function(){ renderUnderstand(); showView('understand'); });
  $('btnBackFromUnderstand').addEventListener('click', function(){ showView('landing'); });
  $('btnDrawerArchetypes').addEventListener('click', function(){ closeDrawer(true); showView('archetypes'); });
  // btnDrawerHistory entfernt: Verlauf liegt jetzt in view-profile, keine eigene Route mehr nötig.
  // btnDrawerState ersetzt durch btnLandingStateHistory — der Tagesform-Kurzcheck läuft jetzt direkt
  // auf der Startseite; dieser Button öffnet nur noch die ausführlichere Verlaufsansicht mit Trend.
  $('btnLandingStateHistory').addEventListener('click', function(){ renderStateView(); showView('state'); });
  // „Ändern" klappt die Skalen wieder auf, mit den gespeicherten Werten bereits gesetzt — ohne
  // diesen Weg wäre der Erledigt-Zustand eine Sackgasse für den Rest des Tages.
  $('btnLandingStateEdit').addEventListener('click', function(){
    showLandingStateInputs();
    renderLandingStateRows();
    try{ $('landingStateEnergyRow').querySelector('button').focus(); }catch(e){}
  });
  $('btnBackFromState').addEventListener('click', function(){ showView('landing'); });
  $('btnStateSave').addEventListener('click', function(){
    if (!statePickedEnergy || !statePickedValence){
      toast(tx('js_bitte_beide_fragen'));
      return;
    }
    var ok = addStateEntry(statePickedEnergy, statePickedValence);
    if (ok){
      toast(tx('js_tagesform_gespeichert'));
      renderStateView();
      refreshDrawerState();
    } else {
      toast(tx('js_konnte_nicht_gespeichert_w_2'));
    }
  });
  // btnBackFromHistory entfernt: view-history existiert nicht mehr.
  $('btnDrawerProfileRow').addEventListener('click', function(){ closeDrawer(true); renderProfile(); showView('profile'); });
  $('btnBackFromProfile').addEventListener('click', function(){ showView('landing'); });
  $('btnAvatarEdit').addEventListener('click', function(){ $('avatarFileInput').click(); });
  $('avatarFileInput').addEventListener('change', function(e){
    var f = e.target.files && e.target.files[0];
    if (f) handleAvatarFile(f);
    e.target.value = '';
  });
  $('btnAvatarRemove').addEventListener('click', function(){
    var profile = loadProfile();
    profile.avatarImg = null;
    if (saveProfile(profile)){
      renderAvatar(profile);
      refreshDrawerState();
      toast(tx('js_bild_entfernt'));
    }
  });
  $('avatarColorRow').addEventListener('click', function(e){
    var btn = e.target.closest ? e.target.closest('.avatar-color-swatch') : null;
    if (!btn) return;
    var profile = loadProfile();
    profile.avatarColor = btn.dataset.color;
    if (saveProfile(profile)){
      renderAvatar(profile);
      refreshDrawerState();
    } else {
      toast(tx('js_konnte_nicht_gespeichert_w'));
    }
  });
  $('profileName').addEventListener('input', function(){
    var profile = loadProfile();
    profile.name = $('profileName').value;
    if (saveProfile(profile) && !profile.avatarImg) renderAvatar(profile);
  });
  $('btnDrawerSettings').addEventListener('click', function(){ closeDrawer(true); applyTheme(loadThemeMode()); renderSettings(); showView('settings'); });
  $('btnBackFromSettings').addEventListener('click', function(){ showView('landing'); });
  ['themeSystem','themeLight','themeDark'].forEach(function(id){
    $(id).addEventListener('click', function(){ applyTheme($(id).dataset.mode); });
  });
  $('btnDiscardProgress').addEventListener('click', function(){
    clearProgress();
    answers = new Array(50).fill(0); qi = 0;
    renderSettings();
    refreshDrawerState();
    toast(tx('js_unterbrochener_test_verwor'));
  });
  $('btnSettingsEditProfile').addEventListener('click', function(){ renderProfile(); showView('profile'); });
  $('btnRestoreCode').addEventListener('click', function(){
    var input = $('restoreCodeInput');
    var restored = fromCode(input.value.trim());
    if (!restored){ toast(tx('js_ungültiger_code__bitte_den')); schuetteln(input); return; }
    scores = restored;
    saveResult(scores);
    clearProgress();
    answers = new Array(50).fill(0); qi = 0;
    input.value = '';
    renderSettings();
    refreshDrawerState();
    toast(tx('js_ergebnis_wiederhergestellt'));
  });
  $('btnResetData').addEventListener('click', function(){
    var btn = $('btnResetData');
    if (demoSperrt()){ disarmResetButton(); return; }
    if (!resetArmed){
      resetArmed = true;
      btn.classList.add('armed');
      btn.textContent = tx('js_wirklich_nochmal_tippen_zu');
      resetArmTimeout = setTimeout(function(){
        disarmResetButton();
      }, 4000);
      return;
    }
    disarmResetButton();
    try{ localStorage.removeItem('lucenta_result'); }catch(e){}
    clearProgress();
    clearProfile();
    clearHistory();
    clearStateHistory();
    clearCompatArchive();
    // Auch das gemerkte Wegtippen des Home-Bildschirm-Hinweises ist auf dem Gerät gespeicherte
    // Nutzungsspur und gehört deshalb in ein vollständiges Zurücksetzen — sonst wäre "alles
    // gelöscht" nicht ganz wahr.
    try{ localStorage.removeItem('lucenta_a2hs_hidden'); }catch(e){}
    scores = null; answers = new Array(50).fill(0); qi = 0; guestRun = false;
    refreshDrawerState();
    renderSettings();
    toast(tx('js_deine_daten_wurden_gelösch'));
    showView('landing');
  });
  $('btnCompare').addEventListener('click', renderCompat);
  // Feedback-Runde 38: dieselbe Normalisierung/Live-Validierung wie beim Vergleichs-Tool gilt jetzt
  // auch für das Ergebnis-Wiederherstellen in den Einstellungen — beides sind Stellen, an denen ein
  // 10-stelliger Ergebnis-Code eingetragen wird, verhielten sich bislang aber unterschiedlich (dort
  // schon mit Auto-Kleinschreibung/Zeichen-Filter und farbigem Rahmen, hier komplett ohne).
  [$('cmpMe'), $('cmpOther'), $('restoreCodeInput')].forEach(function(inp){
    inp.addEventListener('input', function(){
      var clean = inp.value.replace(/[^a-z0-9]/gi,'').toLowerCase().slice(0,10);
      if (clean !== inp.value) inp.value = clean;
      inp.classList.remove('field-valid','field-invalid');
      if (clean.length===10){ inp.classList.add(fromCode(clean) ? 'field-valid' : 'field-invalid'); }
    });
  });
  [$('cmpMe'), $('cmpOther')].forEach(function(inp){
    inp.addEventListener('keydown', function(e){ if (e.key==='Enter'){ renderCompat(); } });
  });
  $('restoreCodeInput').addEventListener('keydown', function(e){ if (e.key==='Enter'){ $('btnRestoreCode').click(); } });
  // Runde 95: Hier lag die Bedienung des Fragebogens ueber die Zifferntasten 1 bis 5 und
  // Rueckschritt/Pfeil-links. Auf einem iPhone gibt es diese Tasten nicht — die Bildschirm-
  // tastatur erscheint im Fragebogen ueberhaupt nicht, weil dort kein Textfeld steht. Die
  // Funktion war damit fuer alle unerreichbar, fuer die diese App gebaut ist.
  //
  // Der sichtbare Hinweis darauf war schon in Runde 54 entfernt worden, mit genau dieser
  // Begruendung; die Bedienung selbst ist damals stehen geblieben. Das ist die haeufigere
  // Haelfte des Fehlers: Ein Hinweis verschwindet, die Sache dahinter bleibt und wird zu
  // totem Code, den beim naechsten Lesen niemand mehr einordnen kann.
  //
  // BEWUSST GEBLIEBEN sind die Tastenbehandlungen an anderer Stelle, und zwar aus zwei
  // Gruenden, die nichts mit Schreibtischrechnern zu tun haben:
  //   - Eingabetaste in den Textfeldern: Die Bildschirmtastatur des iPhones HAT eine
  //     Eingabetaste, und dort ist sie der erwartete Weg zum Absenden.
  //   - Escape und Tabulator in den Fenstern: Das ist Bedienbarkeit ohne Blick, nicht
  //     Schreibtisch. iOS kennt vollstaendige Tastaturbedienung und Schaltersteuerung, und
  //     die Fokusfalle in einem Dialogfenster ist dort ausdruecklich vorgesehen.
  $('btnCopyCode').addEventListener('click', function(){
    var code = $('myCode').textContent;
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(code).then(function(){ toast(tx('js_code_kopiert')); }).catch(function(){ toast(tx('js_code_doppelpunkt')+code); });
    } else { toast(tx('js_code_doppelpunkt')+code); }
  });
  // Runde 79: "Ergebnis teilen" legte nur Text in die Zwischenablage. Was Leute tatsaechlich
  // weitergeben, ist das Bild — der Knopf oeffnet deshalb den Bild-Dialog, in dem geteilt wird.
  // Der Text-Weg ist nicht verschwunden: Er ist der Rueckfall im Dialog, wenn das Geraet keine
  // Dateien teilen kann (siehe btnImgModalShare).
  $('btnShare').addEventListener('click', openImgModal);
  $('btnImgModalClose').addEventListener('click', closeImgModal);
  $('imgModalScrim').addEventListener('click', closeImgModal);
  $('plusModalScrim').addEventListener('click', closePlusModal);
  $('btnPlusModalClose').addEventListener('click', closePlusModal);
  // Runde 79: Der Text-Weg ist der Rueckfall, nicht mehr ein eigener Knopf. Wo das Geraet keine
  // Datei teilen kann (Schreibtisch-Browser), war die alte Antwort ein Hinweis und sonst nichts —
  // jetzt geht wenigstens Titel und Code hinaus, statt dass der Tipp ins Leere laeuft.
  function teilenAlsText(){
    var arch = archetypeOf(scores);
    var url = (location.href.split('#')[0]).split('?')[0];
    var text = tx('js_mein_lucentaporträt')+ (NOUN[arch.top1][scores[arch.top1]>=50?'high':'low']) +' · '+
      (ADJ[arch.top2][scores[arch.top2]>=50?'high':'low']) + tx('js_mach_den_test_und_verglei')+toCode(scores);
    function inAblage(){
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text+' — '+url)
          .then(function(){ toast(tx('js_zum_teilen_kopiert')); })
          .catch(function(){ toast(tx('js_teilen_nicht_möglich__dein')+toCode(scores)); });
      } else { toast(tx('js_teilen_nicht_möglich__dein')+toCode(scores)); }
    }
    if (navigator.share){
      navigator.share({title:'Lucenta', text:text, url:url}).catch(function(err){
        if (err && err.name === 'AbortError') return;
        inAblage();
      });
    } else { inAblage(); }
  }
  $('btnImgModalShare').addEventListener('click', function(){
    if (!currentShareCanvas){ teilenAlsText(); return; }
    currentShareCanvas.toBlob(function(blob){
      if (!blob){ teilenAlsText(); return; }
      var file;
      try{ file = new File([blob], tx('js_dateiname_ergebnis')+shareFormat+'.png', {type:'image/png'}); }
      catch(e){ teilenAlsText(); return; }
      if (navigator.canShare && navigator.canShare({files:[file]})){
        navigator.share({files:[file], title:'Lucenta', text:tx('js_mein_lucentaergebnis')}).catch(function(err){
          if (err && err.name === 'AbortError') return;
          teilenAlsText();
        });
      } else {
        teilenAlsText();
      }
    }, 'image/png');
  });

  // init
  (function init(){
    // Startzustand im Verlauf verankern, damit die Zurück-Geste aus der ersten geöffneten
    // Ansicht sauber auf die Startseite zurückführt statt aus der App heraus.
    try{ history.replaceState({lucentaView:'landing'}, ''); }catch(e){ historyOK = false; }
    if (!storageAvailable()){ $('storageWarning').style.display = 'flex'; }
    // Sprache anwenden, bevor irgendetwas gerendert wird — sonst blitzte beim Start kurz die
    // im Markup hinterlegte deutsche Fassung auf, bevor die gewaehlte Sprache greift.
    applyI18n();
    syncLangButtons();
    refreshDrawerState();
    applyTheme(loadThemeMode());
    schalterAnwenden();
    syncWortmarke();
    if ($('btnExport')) $('btnExport').addEventListener('click', datenSichern);
    if ($('btnImport')) $('btnImport').addEventListener('click', function(){
      var feld = $('importFeld');
      if (!feld) return;
      if (feld.style.display === 'none'){ feld.style.display = ''; feld.focus(); return; }
      datenEinspielen(feld.value);
    });
    [['haptikSchalter','lucenta_haptik'], ['bewegungSchalter','lucenta_bewegung']].forEach(function(z){
      var el = $(z[0]);
      if (el) el.addEventListener('click', function(){ schalterUmlegen(z[1], z[0]); });
    });
    renderPreviewCard(); ordneStartseite();
    renderLandingUnderstandTeaser();
    renderLandingStateTeaser();
    renderArchetypeGroups();
    renderQuestion();
    syncHeroState();
    syncHeaderScrollState();
  })();
})();

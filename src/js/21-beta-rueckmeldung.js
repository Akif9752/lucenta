// ---------- Nutzungszahlen ----------
// Unter Einstellungen > Daten und Datenschutz: ausgeschaltet, und darunter woertlich, was mitginge.
  var NUTZUNG_SCHALTER = 'lucenta_nutzung_teilen';
  function nutzungTeilenAn(){
    return schalterLesen(NUTZUNG_SCHALTER, 'aus') === 'an';
  }
  function nutzungZeilen(){
    var k = nutzungKennzahlen();
    var paare = [
      ['nutzung_l_seitstart',   k.seitStart],
      ['nutzung_l_geoeffnet',   k.tageGeoeffnet],
      ['nutzung_l_letzte30',    k.letzte30],
      ['nutzung_l_d30',         k.d30 === null ? tx('nutzung_offen') : tx(k.d30 ? 'nutzung_ja' : 'nutzung_nein')],
      ['nutzung_l_durchlaeufe', k.durchlaeufe],
      ['nutzung_l_zweiter',     k.tageBisZweiter === null ? tx('nutzung_keiner') : k.tageBisZweiter],
      ['nutzung_l_tagesform',   k.tagesformTage],
      ['nutzung_l_prowoche',    k.tagesformTage ? zahl1(k.tagesformProWoche) : tx('nutzung_keiner')]
    ];
    // decodeEntities, weil die Beschriftungen aus derselben Tabelle kommen wie die Oberflaeche
    // und dort Entitaeten tragen duerfen. In einem Teilen-Text stuenden sie woertlich da.
    return paare.map(function(z){ return decodeEntities(tx(z[0])) + ': ' + decodeEntities(String(z[1])); });
  }
  function nutzungVorschauZeigen(){
    var kasten = $('nutzungVorschau'), aktion = $('nutzungAktion');
    if (!kasten) return;
    var an = nutzungTeilenAn();
    kasten.hidden = !an;
    if (aktion) aktion.hidden = !an;
    // Nur fuellen, wenn sichtbar: Die Zahlen sollen zum Zeitpunkt des Hinsehens stimmen, nicht
    // zum Zeitpunkt des Startens.
    if (an) kasten.textContent = nutzungZeilen().join('\n');
  }
  function nutzungWeitergeben(){
    // Die Zahlen neu holen, nicht aus der Anzeige lesen.
    var text = decodeEntities(tx('nutzung_titel')) + '\n' + nutzungZeilen().join('\n');
    var fertig = function(){ toast(tx('js_danke__das_hilft_wirklich')); };
    if (navigator.share){
      navigator.share({text:text}).then(fertig).catch(function(){ nutzungKopieren(text, fertig); });
    } else { nutzungKopieren(text, fertig); }
  }
  function nutzungKopieren(text, fertig){
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ toast(tx('js_in_die_zwischenablage_kopi')); }).catch(function(){ fertig(); });
    } else { fertig(); }
  }

  // Runde 109: Hier wurde der Formatwaehler des Ergebnisbildes verdrahtet. Es gibt nur noch ein
  // Format — die Begruendung steht bei SHARE_FORMAT in 10-ergebnisbild.js.

  document.querySelectorAll('[data-lang]').forEach(function(b){
    b.addEventListener('click', function(){ setLang(b.getAttribute('data-lang')); });
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
  $('btnDrawerFreunde').addEventListener('click', function(){ closeDrawer(true); renderFreunde(); showView('freunde'); });
  $('btnBackFromFreunde').addEventListener('click', function(){ showView('landing'); });
  $('freundIch').addEventListener('click', freundIchKlick);
  $('btnBackFromVergleich').addEventListener('click', function(){ renderFreunde(); showView('freunde'); });
  $('btnFreundEntfernen').addEventListener('click', freundEntfernen);
  $('btnErgebnisFreunde').addEventListener('click', function(){ renderFreunde(); showView('freunde'); });
  $('btnFreundSpeichern').addEventListener('click', freundSpeichern);
  $('freundCode').addEventListener('keydown', function(e){ if (e.key === 'Enter') freundSpeichern(); });
  $('btnDrawerUnderstand').addEventListener('click', function(){ closeDrawer(true); renderUnderstand(); showView('understand'); });
  $('btnLandingTeaserMore').addEventListener('click', function(){ renderUnderstand(); showView('understand'); });
  $('btnBackFromUnderstand').addEventListener('click', function(){ showView('landing'); });
  $('btnDrawerArchetypes').addEventListener('click', function(){ closeDrawer(true); showView('archetypes'); });
  $('btnLandingStateHistory').addEventListener('click', function(){ renderStateView(); showView('state'); });
  if ($('btnDrawerState')) $('btnDrawerState').addEventListener('click', function(){ closeDrawer(true); renderStateView(); showView('state'); });
  // „Ändern" klappt die Skalen wieder auf, mit den gespeicherten Werten bereits gesetzt — ohne
  // diesen Weg wäre der Erledigt-Zustand eine Sackgasse für den Rest des Tages.
  $('btnLandingStateEdit').addEventListener('click', function(){
    showLandingStateInputs();
    renderLandingStateRows();
    try{ $('landingStateEnergyRow').querySelector('button').focus(); }catch(e){}
  });
  $('btnBackFromState').addEventListener('click', function(){ showView('landing'); });
  $('btnTfAendern').addEventListener('click', function(){
    tfAendernOffen = true;
    $('tfErledigt').style.display = 'none';
    $('stateTodayNote').style.display = '';
    aufklappen($('tfErfassung'));
    try{ $('stateEnergyRow').querySelector('button').focus(); }catch(e){}
  });
  $('btnStateSave').addEventListener('click', function(){
    if (!statePickedEnergy || !statePickedValence){
      toast(tx('js_bitte_beide_fragen'));
      return;
    }
    var abschnitt = aktuellerAbschnitt(), ersetzt = !!heuteEingetragen()[abschnitt];
    var ok = addStateEntry(statePickedEnergy, statePickedValence, tfErfassungExtra());
    if (ok){
      toast(ersetzt ? tfText('tf_ersetzt_toast', {abschnitt: tx('tf_abschnitt_'+abschnitt)})
                    : tx('js_tagesform_gespeichert'));
      // Runde 131: erst zuklappen, dann neu zeichnen — sonst leerten sich die Skalen sichtbar.
      tfAendernOffen = false;
      tfErledigtAnwenden(true, function(){
        tfErfassungZuruecksetzen();
        renderStateView();
        tfAbschnitteRendern(abschnitt);
      });
      refreshDrawerState();
      renderLandingStateTeaser();
      erinnerungNachziehen();
    } else {
      toast(tx('js_konnte_nicht_gespeichert_w_2'));
    }
  });
  // btnBackFromHistory entfernt: view-history existiert nicht mehr.
  $('btnDrawerProfileRow').addEventListener('click', function(){ closeDrawer(true); renderProfile(); showView('profile'); });
  $('btnBackFromProfile').addEventListener('click', function(){ showView('landing'); });
  $('btnAvatarEdit').addEventListener('click', function(){ $('avatarFileInput').click(); });
  ['profileAvatar', 'settingsAvatar'].forEach(function(id){    // Runde 129: das Tier wippt beim Antippen
    if ($(id)) $(id).addEventListener('click', function(){ tierWippen($(id)); });
  });
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
  $('btnDrawerPlus').addEventListener('click', function(){ closeDrawer(true); renderPlusSeite(); showView('plus'); });
  plusSeiteVerdrahten();
  $('btnPlusModalWiederherstellen').addEventListener('click', kaeufeWiederherstellen);
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
    clearFreunde();
    // Die Nutzungstage gehoeren zum Zuruecksetzen dazu.
    nutzungLoeschen();
    scores = null; answers = new Array(50).fill(0); qi = 0; guestRun = false;
    refreshDrawerState();
    renderSettings();
    toast(tx('js_deine_daten_wurden_gelösch'));
    showView('landing');
  });
  $('btnCompare').addEventListener('click', renderCompat);
  // Dieselbe Normalisierung und Pruefung fuer alle Felder mit einem Ergebnis-Code.
  // Ein eingefuegter Freundescode (oder die ganze Einladung) im Vergleichsfeld: Name und Figur der
  // Person werden gemerkt, im Feld bleibt der Ergebnis-Code.
  $('cmpOther').addEventListener('input', function(){
    var info = freundescodeLesen($('cmpOther').value);
    if (info){ $('cmpOther').setAttribute('data-freund', JSON.stringify(info)); $('cmpOther').value = info.code; }
    else if ($('cmpOther').value.length < 10) $('cmpOther').removeAttribute('data-freund');
  }, true);
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
  // Keine Zifferntasten-Bedienung im Fragebogen (auf dem iPhone unerreichbar). Bewusst geblieben:
  // Eingabetaste in Textfeldern und Escape/Tab in Fenstern (Tastatur- und Schaltersteuerung).
  $('btnNavZurueck').addEventListener('click', navZurueck);
  // Apples Standard-EULA (Richtlinie 3.1.2) oeffnet im Browser; Datenschutz ist die Rechtsseite der App.
  var EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
  document.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('[data-recht]') : null;
    if (!b) return;
    if (b.getAttribute('data-recht') === 'eula'){
      var ap = nativVorhanden() && nativModul('App');
      if (ap && ap.openUrl){ try{ ap.openUrl({url: EULA_URL}); }catch(ex){} }
      else window.open(EULA_URL, '_blank', 'noopener');
      return;
    }
    if ($('plusModal').classList.contains('open')) closePlusModal();
    renderRecht(); showView('recht');
  });
  [['btnCopyCode', 'myCode'], ['btnCopyWiederCode', 'wiederCode']].forEach(function(paar){
    $(paar[0]).addEventListener('click', function(){ codeKopieren($(paar[1]).textContent); });
  });
  function codeKopieren(code){
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(code).then(function(){ toast(tx('js_code_kopiert')); }).catch(function(){ toast(tx('js_code_doppelpunkt')+code); });
    } else { toast(tx('js_code_doppelpunkt')+code); }
  }
  // "Ergebnis teilen" oeffnet den Bild-Dialog; der Text-Weg ist dort der Rueckfall.
  $('btnShare').addEventListener('click', openImgModal);
  $('btnImgModalClose').addEventListener('click', closeImgModal);
  $('imgModalScrim').addEventListener('click', closeImgModal);
  $('plusModalScrim').addEventListener('click', closePlusModal);
  $('btnPlusModalClose').addEventListener('click', closePlusModal);
  // Laufzeit waehlen und kaufen (StoreKit-Bruecke).
  if ($('plusPreisWahl')) $('plusPreisWahl').addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.segment-opt') : null;
    if (!b) return;
    schalterSetzen(LAUFZEIT_SCHLUESSEL, b.getAttribute('data-laufzeit'), null);
    laufzeitAnwenden();
    plusKnopfAnwenden();   // Runde 126: der Knopf nennt die gewaehlte Laufzeit
    tapFeedback();
  });
  if ($('btnPlusAktivieren')) $('btnPlusAktivieren').addEventListener('click', function(){
    // Hinter dem Knopf liegt der echte Kauf. Wer Lucenta+ hat, kommt zur Verwaltung bei Apple — eine
    // App darf keinen eigenen Kuendigungsweg anbieten.
    if (istPlus()){ aboVerwalten(); return; }
    plusKaufen(function(erfolg){
      // Nur bei Erfolg schliessen; wer abbricht, will vielleicht die andere Laufzeit.
      if (erfolg){ plusModalAnwenden(); closePlusModal(); }
    });
  });
  // Steht hier und nicht oben in der Verdrahtung: Die Testreihen fuehren den Code nur bis zur Marke
  // "wiring" aus.
  plusStandPruefen();
  plusPreiseHolen();
  archivUebernehmen();
  einladungenHoeren();
  textGroesseBeobachten();
  // Startbewegung (Fuenfeck zeichnet und fuellt sich, darunter der Name). Nur in der App,
  // durchklickbar, bei reduzierter Bewegung gar nicht.
  (function startBewegung(){
    var el = document.getElementById('startOverlay');
    if (!el || !nativVorhanden() || prefersReducedMotion()){ startkartenEinfliegen(); return; }
    el.hidden = false;
    el.classList.add('show');
    setTimeout(function(){ el.classList.add('weg'); startkartenEinfliegen(); }, 1350);
    setTimeout(function(){ el.hidden = true; el.classList.remove('show', 'weg'); }, 1700);
  })();
  // Rueckfall: Wo keine Datei geteilt werden kann, gehen Titel und Code als Text hinaus.
  function teilenAlsText(){
    var arch = archetypeOf(scores);
    var url = (location.href.split('#')[0]).split('?')[0];
    var titel = tx('js_mein_lucentaporträt')+ (NOUN[arch.top1][scores[arch.top1]>=50?'high':'low']) +' · '+
      (ADJ[arch.top2][scores[arch.top2]>=50?'high':'low']);
    var text = guestRun ? titel + tx('js_mach_den_test_und_verglei') + toCode(scores) : titel + '. ' + einladungsText();
    function inAblage(){
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text+' — '+url)
          .then(function(){ toast(tx('js_zum_teilen_kopiert')); })
          .catch(function(){ toast(text); });
      } else { toast(text); }
    }
    if (navigator.share){
      navigator.share({title:'Lucenta', text:text, url:url}).catch(function(err){
        if (err && err.name === 'AbortError') return;
        inAblage();
      });
    } else { inAblage(); }
  }
  if ($('btnImgModalSichern')) $('btnImgModalSichern').addEventListener('click', function(){
    var bild = $('shareImagePreview');
    bildSichern(bild ? bild.src : '', decodeEntities(tx('js_dateiname_ergebnis')) +
      new Date().toISOString().slice(0,10) + '.png');
  });
  $('btnImgModalShare').addEventListener('click', function(){
    if (!currentShareCanvas){ teilenAlsText(); return; }
    currentShareCanvas.toBlob(function(blob){
      if (!blob){ teilenAlsText(); return; }
      var file;
      try{ file = new File([blob], decodeEntities(tx('js_dateiname_ergebnis')) +
        new Date().toISOString().slice(0,10) + '.png', {type:'image/png'}); }
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
    // Der Nutzungsschalter steht standardmaessig auf 'aus' — hier geht etwas hinaus.
    schalterSetzen(NUTZUNG_SCHALTER, schalterLesen(NUTZUNG_SCHALTER, 'aus'), 'nutzungSchalter');
    if ($('btnNutzungTeilen')) $('btnNutzungTeilen').addEventListener('click', nutzungWeitergeben);
    nutzungVorschauZeigen();
    if ($('nutzungSchalter')) $('nutzungSchalter').addEventListener('click', function(){
      // Nicht ueber schalterUmlegen (das nimmt 'an' als Vorgabe).
      schalterSetzen(NUTZUNG_SCHALTER, nutzungTeilenAn() ? 'aus' : 'an', 'nutzungSchalter');
      nutzungVorschauZeigen();
    });
    // Erst hier, wenn feststeht, dass localStorage erreichbar ist.
    nutzungTagVermerken();
    // Runde 99: die native Bruecke verdrahten. Alles darin prueft selbst, ob es nativ laeuft.
    erinnerungAnwenden();
    ['erinnerungSchalter','tfErinnerungSchalter'].forEach(function(id){
      if ($(id)) $(id).addEventListener('click', erinnerungUmschalten);
    });
    // Runde 129: Die Mitteilungen sind fuer 14 Tage einzeln geplant. Jedes Oeffnen schiebt das
    // Fenster nach und laesst die Abschnitte aus, die heute schon eingetragen sind.
    erinnerungNachziehen();
    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState !== 'visible') return;
      erinnerungNachziehen();
      // Der Abschnitt kann gewechselt haben (morgens weggelegt, mittags geoeffnet). Eine halb
      // ausgefuellte Karte bleibt aber stehen — sonst verloere man den ersten Tipp.
      if (!landingStatePickedEnergy && !landingStatePickedValence) renderLandingStateTeaser();
    });
    erinnerungTippVerdrahten(function(){ renderStateView(); showView('state'); });
    // Haptik bei jedem Bedienelement, im capture-Schritt (auch wo ein Knopf die Ausbreitung anhaelt).
    // Deaktivierte Elemente schweigen.
    document.addEventListener('click', function(e){
      var z = e.target && e.target.closest ? e.target.closest(
        'button, a[href], summary, label, select, [role="button"], [role="switch"], [role="radio"], [role="tab"], ' +
        'input[type="checkbox"], input[type="radio"]') : null;
      if (!z || z.disabled || z.getAttribute('aria-disabled') === 'true') return;
      tapFeedback();
    }, true);
    if ($('btnPlusWiederherstellen')) $('btnPlusWiederherstellen').addEventListener('click', kaeufeWiederherstellen);
    if ($('btnAboVerwalten')) $('btnAboVerwalten').addEventListener('click', aboVerwalten);
    plusStandAnwenden();
    renderPreviewCard(); landingPlusKarteAnwenden(); ordneStartseite();
    schloesserVerdrahten($('landingPlusKarte'));
    renderLandingUnderstandTeaser();
    renderLandingStateTeaser();
    renderArchetypeGroups();
    renderQuestion();
    syncHeroState();
    syncHeaderScrollState();
    // Ein Fehler hier darf den Start nicht anhalten (das Startbild bliebe sonst stehen).
    try{ kontoVerdrahten(); kontoStart(); }catch(e){}
    try{ onboardingVerdrahten(); onboardingZeigenWennErster(); }
    catch(e){ try{ console.error('Onboarding: ' + (e && e.message)); }catch(x){} }
    // Splashscreen ausblenden, sobald das erste Bild gezeichnet ist (launchAutoHide ist aus);
    // setTimeout als Sicherung.
    try{
      var sp = nativVorhanden() && nativModul('SplashScreen');
      if (sp && sp.hide){
        var splashWeg = false;
        var splashAusblenden = function(){ if (splashWeg) return; splashWeg = true; try{ sp.hide({ fadeOutDuration: 250 }); }catch(e){} };
        requestAnimationFrame(function(){ requestAnimationFrame(splashAusblenden); });
        setTimeout(splashAusblenden, 4000);
      }
    }catch(e){}
  })();
})();

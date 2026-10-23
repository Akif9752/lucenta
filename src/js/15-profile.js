// ---------- profile ----------
  function avatarInitials(name){
    name = (name||'').trim();
    if (!name) return '?';
    var parts = name.split(/\s+/).filter(Boolean);
    var chars = parts.slice(0,2).map(function(p){ return p.charAt(0).toUpperCase(); });
    return chars.join('') || '?';
  }
  // Drei ruhige Farbtoene fuer den Initialen-Kreis.
  var AVATAR_COLORS = ['accent','ink','quiet'];
  // Rangfolge: eigenes Foto, dann Figur, dann Buchstabe. Alle drei Kreise (Profil, Schublade,
  // Einstellungen) laufen durch diese eine Funktion.
  function renderAvatarInto(el, profile){
    if (!el || !el.classList) return;
    AVATAR_COLORS.forEach(function(c){ el.classList.remove('avatar-color-'+c); });
    el.classList.remove('hat-figur');
    var color = AVATAR_COLORS.indexOf(profile.avatarColor)!==-1 ? profile.avatarColor : 'accent';
    el.classList.add('avatar-color-'+color);
    try{ el.style.removeProperty('--figur-feld'); }catch(e){}
    if (profile.avatarImg){
      el.style.backgroundImage = 'url('+profile.avatarImg+')';
      el.innerHTML = '';
      return;
    }
    el.style.backgroundImage = '';
    var fig = profile.figur ? figurFinden(profile.figur) : null;
    if (fig){
      el.classList.add('hat-figur');
      // Beide Farben mitgeben, die Wahl trifft das Stilblatt. So wirkt ein Wechsel des
      // Farbmodus sofort und ohne dass hier etwas neu gezeichnet werden muesste.
      try{
        el.style.setProperty('--figur-feld', fig.feld);
        el.style.setProperty('--figur-feld-dunkel', figFeldDunkel(fig.feld));
      }catch(e){}
      el.innerHTML = figurHTML(fig);
      return;
    }
    el.textContent = avatarInitials(profile.name);
  }
  // Die zwoelf Figuren als Auswahl, plus ein Feld fuer "keine". Wird bei jedem Aufruf neu
  // gebaut, damit der gedrueckte Zustand nicht getrennt nachgefuehrt werden muss.
  function renderFigurRaster(profile){
    var wrap = $('figurRaster');
    if (!wrap || !wrap.querySelectorAll) return;
    var aktiv = profile.figur || '';
    // Jeder Knopf traegt seinen Namen; die Zeichnung ist vor Vorleseprogrammen verborgen.
    var keine = '<button type="button" class="figur-wahl figur-keine" data-figur="" aria-pressed="'+
                 (aktiv ? 'false' : 'true')+'" aria-label="'+tx('figur_keine')+'">'+avatarInitials(profile.name)+'</button>';
    wrap.innerHTML = figurenGruppiertHTML(function(f){
      return '<button type="button" class="figur-wahl" data-figur="'+f.id+'" '+
        'style="--figur-feld:'+f.feld+';--figur-feld-dunkel:'+figFeldDunkel(f.feld)+'" '+
        'aria-pressed="'+(aktiv===f.id?'true':'false')+'" '+
        'aria-label="'+tx('figur_'+f.id)+'">'+figurHTML(f)+'</button>';
    }, keine);
    wrap.querySelectorAll('[data-figur]').forEach(function(b){
      b.addEventListener('click', function(){
        var pr = loadProfile();
        pr.figur = b.getAttribute('data-figur') || null;
        if (saveProfile(pr)){ renderAvatar(pr); refreshDrawerState(); renderSettings(); }
        else toast(tx('js_konnte_nicht_gespeichert_w'));
      });
    });
  }
  // Hintergruende fuer die Profilzeile der Schublade, in Gruppen; gesperrte oeffnen das Lucenta+-Fenster.
  var SCHLOSS_KLEIN = '<svg class="hg-schloss" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>';
  function renderHintergrundRaster(profile){
    var wrap = $('hgRaster');
    if (!wrap || !wrap.querySelectorAll) return;
    var aktiv = profile.hintergrund || '';
    var knopf = function(id){
      var frei = hgFrei(id);
      return '<button type="button" class="hg-wahl hg-'+id+(frei ? '' : ' hg-gesperrt')+'" data-hg="'+id+'" aria-pressed="'+
        (aktiv===id?'true':'false')+'" aria-label="'+tx('hg_'+id)+(frei ? '' : ', Lucenta+')+'">'+(frei ? '' : SCHLOSS_KLEIN)+'</button>';
    };
    wrap.innerHTML = '<div class="hg-raster"><button type="button" class="hg-wahl hg-keine" data-hg="" aria-pressed="'+
        (aktiv ? 'false' : 'true')+'" aria-label="'+tx('hg_keine')+'">&mdash;</button></div>'+
      HG_GRUPPEN.map(function(g){
        return '<div class="hg-gruppe"><div class="hg-gruppe-titel">'+tx('hg_gruppe_'+g[0])+'</div>'+
          '<div class="hg-raster">'+g[1].map(knopf).join('')+'</div></div>';
      }).join('');
    wrap.querySelectorAll('[data-hg]').forEach(function(b){
      b.addEventListener('click', function(){
        var id = b.getAttribute('data-hg') || '';
        if (!hgFrei(id)){ openPlusModal(); return; }
        var pr = loadProfile();
        pr.hintergrund = id || null;
        if (saveProfile(pr)){ renderHintergrundRaster(pr); refreshDrawerState(); }
        else toast(tx('js_konnte_nicht_gespeichert_w'));
      });
    });
  }
  function renderAvatar(profile){
    renderAvatarInto($('profileAvatar'), profile);
    $('btnAvatarRemove').style.display = profile.avatarImg ? '' : 'none';
    // Die Farbwahl betrifft nur den Buchstaben-Kreis. Mit Foto ODER Figur ist sie wirkungslos
    // und waere damit eine Schaltflaeche, die nichts tut.
    var eigenesBild = !!(profile.avatarImg || profile.figur);
    $('avatarColorRow').style.display = eigenesBild ? 'none' : '';
    AVATAR_COLORS.forEach(function(c){
      var pressed = (profile.avatarColor || 'accent') === c;
      $('avatarColor'+c.charAt(0).toUpperCase()+c.slice(1)).setAttribute('aria-pressed', pressed?'true':'false');
    });
    renderFigurRaster(profile);
    renderHintergrundRaster(profile);
  }
  function renderProfile(){
    var profile = loadProfile();
    $('profileName').value = profile.name || '';
    $('profileBenutzerId').value = profile.benutzerId || '';
    renderAvatar(profile);
    var last = loadResult();
    var block = $('profileResultBlock');
    if (last){
      var a = archetypeOf(last);
      var title = NOUN[a.top1][last[a.top1]>=50?'high':'low'] + ' <span class="sep">·</span> ' + ADJ[a.top2][last[a.top2]>=50?'high':'low'];
      var motto = MOTTO[a.top1][last[a.top1]>=50?'high':'low'];
      block.innerHTML = '<div class="profile-result-card"><div><strong>'+title+'</strong><div class="l">'+motto+'</div></div><button type="button" class="btn btn-ghost btn-sm" id="btnProfileViewResult">' + tx('js_ansehen') + '</button></div>';
      $('btnProfileViewResult').addEventListener('click', function(){ scores = last; renderResult(); showView('result'); });
    } else {
      block.innerHTML = emptyStateHTML(tx('js_noch_kein_ergebnis_auf_die'), {btnId:'btnProfileStart', btnLabel:tx('js_test_starten_2')});
      $('btnProfileStart').addEventListener('click', function(){ beginRun(false); });
    }
    // Der Verlauf ist Teil des Profils.
    renderHistory();
    renderDemoBlock();
  }
  // Der Entwicklerbereich. Steht ganz unten im Profil, hinter allem Echten — er gehoert nicht in
  // den Weg von jemandem, der die App benutzt.
  function renderDemoBlock(){
    var el = $('demoBlock');
    if (!el) return;
    var aktiv = demoAktiv();
    el.innerHTML =
      '<h2 data-demo-titel>'+tx('demo_titel')+'</h2>'+
      '<p class="settings-group-desc">'+(aktiv ? tx('demo_aktiv') : tx('demo_lead'))+'</p>'+
      // Runde 131: vier Laengen statt eines Knopfs. #btnDemo bleibt der laengsten (bzw. dem Beenden),
      // weil die Fehlersuche (tools/fehlersuche.mjs) ihn klickt und einen reichen Bestand messen soll.
      (aktiv
        ? '<div class="daten-knoepfe"><button type="button" class="btn btn-ghost btn-sm" id="btnDemo">'+
            tx('demo_beenden')+'</button></div>'
        : '<p class="settings-hint demo-laengen-titel">'+tx('demo_laden')+'</p>'+
          '<div class="daten-knoepfe demo-laengen">'+DEMO_LAENGEN.map(function(n){
            return '<button type="button" class="btn btn-ghost btn-sm" data-demo-tage="'+n+'"'+
                   (n === DEMO_LAENGEN[DEMO_LAENGEN.length-1] ? ' id="btnDemo"' : '')+'>'+
                   n+'&nbsp;'+tx('js_tagen_kurz')+'</button>';
          }).join('')+'</div>');
    if (aktiv){
      var b = $('btnDemo');
      if (b) b.addEventListener('click', demoBeenden);
    } else if (el.querySelectorAll){
      el.querySelectorAll('[data-demo-tage]').forEach(function(k){
        k.addEventListener('click', function(){ demoLaden(parseInt(k.getAttribute('data-demo-tage'), 10)); });
      });
    }

    // Umschalter frei/Lucenta+ fuer die Entwicklung: nur ohne native Bruecke (Browser) oder im
    // Entwicklungsbau (#if DEBUG in MainViewController.swift). Im Store-Bau gibt es ihn nicht — sonst
    // verschenkte er das Abo.
    if (!nativVorhanden() || entwicklungsBau()){
      var plusEl = document.createElement('div');
      plusEl.className = 'plus-schalter-zeile';
      plusEl.innerHTML =
        '<div class="settings-row"><div class="settings-row-text">'+
          '<strong>'+tx('plus_dev_titel')+'</strong>'+
          '<span class="settings-row-desc">'+(istPlus() ? tx('plus_dev_an') : tx('plus_dev_aus'))+'</span>'+
        '</div><button type="button" class="schalter" id="plusSchalter" role="switch" '+
        'aria-checked="'+(istPlus()?'true':'false')+'" aria-label="'+tx('plus_dev_titel')+'">'+
        '<span class="schalter-knopf"></span></button></div>';
      el.appendChild(plusEl);
      var ps = $('plusSchalter');
      if (ps) ps.addEventListener('click', function(){
        plusSetzen(!istPlus());
        // Neu zeichnen statt neu laden: Der Umschalter aendert nur, WAS gezeigt wird, nicht den
        // Bestand — ein Neuladen waere hier ein unnoetiger Sprung an den Seitenanfang.
        plusAnsichtenAuffrischen();
        toast(istPlus() ? tx('plus_dev_an') : tx('plus_dev_aus'));
      });
    }
  }
  // Eine Stelle entscheidet, welche Ansicht nach einem Wechsel frei/Lucenta+ neu gezeichnet wird. Die
  // Zeile in den Einstellungen nennt die laufende Fassung neben "Kaeufe wiederherstellen".
  function plusStandAnwenden(){
    var el = $('plusStand');
    if (el) el.innerHTML = tx(istPlus() ? 'plus_stand_plus' : 'plus_stand_frei');
  }
  function landingPlusKarteAnwenden(){
    var k = $('landingPlusKarte');
    if (!k) return;
    k.hidden = istPlus() || !loadResult();
  }
  function plusAnsichtenAuffrischen(){
    syncWortmarke();
    landingPlusKarteAnwenden();
    plusStandAnwenden();
    refreshDrawerState();
    var aktiv = document.querySelector('.view.active');
    var id = aktiv ? aktiv.id : '';
    if (id === 'view-profile') renderProfile();
    else if (id === 'view-understand') renderUnderstand();
    else if (id === 'view-state') renderStateView();
    else if (id === 'view-freunde') renderFreunde();
    else if (id === 'view-plus') renderPlusSeite();
    else if (id === 'view-result' && loadResult()) renderResult();
    // Die Startseite traegt die Tagesform-Karte, und die kennt beide Fassungen.
    renderLandingStateTeaser();
  }

  function handleAvatarFile(file){
    if (!file || !/^image\//.test(file.type)){ toast(tx('js_bitte_ein_bild_auswählen')); return; }
    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var size = 240;
        var canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        var ctx = canvas.getContext('2d');
        var side = Math.min(img.width, img.height);
        var sx = (img.width - side)/2, sy = (img.height - side)/2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        var dataUrl;
        try{ dataUrl = canvas.toDataURL('image/jpeg', 0.85); }
        catch(err){ toast(tx('js_bild_konnte_nicht_verarbei')); return; }
        var profile = loadProfile();
        profile.avatarImg = dataUrl;
        if (saveProfile(profile)){
          renderAvatar(profile);
          toast(tx('js_profilbild_gespeichert'));
        } else {
          toast(tx('js_bild_konnte_nicht_gespeich'));
        }
      };
      img.onerror = function(){ toast(tx('js_bild_konnte_nicht_geladen')); };
      img.src = e.target.result;
    };
    reader.onerror = function(){ toast(tx('js_bild_konnte_nicht_gelesen')); };
    reader.readAsDataURL(file);
  }

  
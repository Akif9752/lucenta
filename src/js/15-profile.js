// ---------- profile ----------
  function avatarInitials(name){
    name = (name||'').trim();
    if (!name) return '?';
    var parts = name.split(/\s+/).filter(Boolean);
    var chars = parts.slice(0,2).map(function(p){ return p.charAt(0).toUpperCase(); });
    return chars.join('') || '?';
  }
  // Feedback: neben dem eigenen Foto jetzt drei ruhige, markenkonforme Farbtöne für den
  // Initialen-Kreis zur Auswahl (siehe .avatar-color-*-CSS) statt bunter Avatar-Grafiken, die dem
  // zurückhaltenden Erscheinungsbild widersprächen. renderAvatarInto() setzt die passende Klasse auf
  // jedes übergebene Avatar-Element (Profil, Schublade, Einstellungen — alle drei nutzen dieselbe
  // Funktion, bleiben also automatisch synchron).
  var AVATAR_COLORS = ['accent','ink','quiet'];
  // Runde 79: Drei Zustaende statt zwei — eigenes Foto, gewaehlte Figur, oder der Buchstabe.
  // Die Reihenfolge ist eine Rangfolge: Ein eigenes Foto schlaegt alles, danach die Figur, und
  // der Buchstabe ist der Rueckfall. Alle drei Kreise der App (Profil, Schublade, Einstellungen)
  // laufen weiterhin durch DIESE eine Funktion und bleiben dadurch von selbst gleich.
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
      try{ el.style.setProperty('--figur-feld', fig.feld); }catch(e){}
      el.innerHTML = figurSVG(fig);
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
    // Fehlersuche Runde 80: Die Knoepfe enthielten nur eine Zeichnung. Fuer eine Sprachausgabe
    // waren es vierzehn namenlose Schaltflaechen hintereinander — unbenutzbar. Jede traegt
    // jetzt ihren Namen, und die Zeichnung selbst wird davor verborgen, damit nicht zweimal
    // etwas vorgelesen wird.
    var teile = ['<button type="button" class="figur-wahl figur-keine" data-figur="" aria-pressed="'+
                 (aktiv ? 'false' : 'true')+'" aria-label="'+tx('figur_keine')+'">'+
                 avatarInitials(profile.name)+'</button>'];
    FIGUREN.forEach(function(f){
      teile.push('<button type="button" class="figur-wahl" data-figur="'+f.id+'" '+
        'style="--figur-feld:'+f.feld+'" aria-pressed="'+(aktiv===f.id?'true':'false')+'" '+
        'aria-label="'+tx('figur_'+f.id)+'">'+figurSVG(f)+'</button>');
    });
    wrap.innerHTML = teile.join('');
    wrap.querySelectorAll('[data-figur]').forEach(function(b){
      b.addEventListener('click', function(){
        var pr = loadProfile();
        pr.figur = b.getAttribute('data-figur') || null;
        if (saveProfile(pr)){ renderAvatar(pr); refreshDrawerState(); renderSettings(); }
        else toast(tx('js_konnte_nicht_gespeichert_w'));
      });
    });
  }
  // Zehn Hintergrundvorlagen fuer die Profilzeile der Schublade.
  function renderHintergrundRaster(profile){
    var wrap = $('hgRaster');
    if (!wrap || !wrap.querySelectorAll) return;
    var aktiv = profile.hintergrund || '';
    // Dieselbe Sache wie bei den Figuren: zehn leere Flaechen sind fuer eine Sprachausgabe
    // zehn namenlose Schaltflaechen. Jede Vorlage traegt ihren Namen.
    var teile = ['<button type="button" class="hg-wahl hg-keine" data-hg="" aria-pressed="'+
                 (aktiv ? 'false' : 'true')+'" aria-label="'+tx('hg_keine')+'">&mdash;</button>'];
    HINTERGRUENDE.forEach(function(id){
      teile.push('<button type="button" class="hg-wahl hg-'+id+'" data-hg="'+id+'" aria-pressed="'+
        (aktiv===id?'true':'false')+'" aria-label="'+tx('hg_'+id)+'"></button>');
    });
    wrap.innerHTML = teile.join('');
    wrap.querySelectorAll('[data-hg]').forEach(function(b){
      b.addEventListener('click', function(){
        var pr = loadProfile();
        pr.hintergrund = b.getAttribute('data-hg') || null;
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
    // Feedback: Verlauf ist jetzt Teil des Profils statt einer eigenen Schubladen-Ansicht — renderProfile()
    // aktualisiert deshalb den Verlauf direkt mit (renderHistory() befüllt #historyContent, das jetzt
    // hier in view-profile statt in einer eigenen view-history liegt).
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
      '<div class="daten-knoepfe">'+
        '<button type="button" class="btn btn-ghost btn-sm" id="btnDemo">'+
        (aktiv ? tx('demo_beenden') : tx('demo_laden'))+'</button>'+
      '</div>';
    var b = $('btnDemo');
    if (b) b.addEventListener('click', function(){ aktiv ? demoBeenden() : demoLaden(); });
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

  
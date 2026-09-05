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
  function renderAvatarInto(el, profile){
    if (!el) return;
    AVATAR_COLORS.forEach(function(c){ el.classList.remove('avatar-color-'+c); });
    var color = AVATAR_COLORS.indexOf(profile.avatarColor)!==-1 ? profile.avatarColor : 'accent';
    el.classList.add('avatar-color-'+color);
    if (profile.avatarImg){
      el.style.backgroundImage = 'url('+profile.avatarImg+')';
      el.textContent = '';
    } else {
      el.style.backgroundImage = '';
      el.textContent = avatarInitials(profile.name);
    }
  }
  function renderAvatar(profile){
    renderAvatarInto($('profileAvatar'), profile);
    $('btnAvatarRemove').style.display = profile.avatarImg ? '' : 'none';
    $('avatarColorRow').style.display = profile.avatarImg ? 'none' : '';
    AVATAR_COLORS.forEach(function(c){
      var pressed = (profile.avatarColor || 'accent') === c;
      $('avatarColor'+c.charAt(0).toUpperCase()+c.slice(1)).setAttribute('aria-pressed', pressed?'true':'false');
    });
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

  
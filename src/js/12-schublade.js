// ---------- drawer (side panel: compare + saved result) ----------
  var drawerLastFocus = null;
  function drawerKeydown(e){
    if (e.key==='Escape'){ closeDrawer(); return; }
    if (e.key==='Tab'){
      var all = $('drawerPanel').querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
      var f = Array.prototype.filter.call(all, function(el){ return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length-1];
      if (e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  }
  // Feedback: die "Test unterbrochen"/"Gespeichertes Ergebnis"-Karten und der Tagesform-Status sind
  // aus der Schublade raus (siehe HTML-Kommentare bei <aside id="drawerPanel">) — refreshDrawerState()
  // pflegt jetzt nur noch, was dort tatsächlich noch angezeigt wird: Profil-Kopf und Vergleichsarchiv.
  function refreshDrawerState(){
    var profile = loadProfile();
    renderAvatarInto($('drawerAvatar'), profile);
    $('drawerProfileName').textContent = profile.name ? profile.name : tx('js_profil');
    $('drawerProfileSub').textContent = (profile.name || profile.avatarImg || profile.figur)
      ? tx('js_profil_öffnen') : tx('js_name_bild__ergebnis_hinzuf');
    // Runde 79: Hintergrundvorlage der Profilzeile. Die Klasse traegt Flaeche UND Schriftfarben
    // (siehe 09-archetypen.css) — ohne das zweite waere ein dunkler Nachthimmel im Hellmodus
    // eine Zeile mit unlesbarem Text.
    var zeile = $('btnDrawerProfileRow');
    if (zeile && zeile.classList){
      HINTERGRUENDE.forEach(function(id){ zeile.classList.remove('hg-'+id); });
      var hg = profile.hintergrund;
      if (hg && HINTERGRUENDE.indexOf(hg) >= 0){
        zeile.classList.add('hg-'+hg);
        zeile.setAttribute('data-hg', hg);
      } else {
        zeile.removeAttribute('data-hg');
      }
    }
    var archiveCount = loadCompatArchive().length;
    $('drawerCompatArchiveStatus').textContent = archiveCount
      ? (archiveCount + (archiveCount===1?tx('js_gespeicherter_vergleich'):tx('js_gespeicherte_vergleiche')))
      : tx('js_noch_keiner_gespeichert');
  }

  
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
  // Pflegt nur Profil-Kopf und Vergleichsarchiv der Schublade.
  function refreshDrawerState(){
    var profile = loadProfile();
    renderAvatarInto($('drawerAvatar'), profile);
    $('drawerProfileName').textContent = profile.name ? profile.name : tx('js_profil');
    $('drawerProfileSub').textContent = demoAktiv()
      ? tx('demo_marke')
      : ((profile.name || profile.avatarImg || profile.figur)
         ? tx('js_profil_öffnen') : tx('js_name_bild__ergebnis_hinzuf'));
    // Die Hintergrundklasse traegt Flaeche UND Schriftfarben.
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
    // Die Schublade sagt in jeder Ansicht, dass Beispieldaten liegen.
    if (zeile && zeile.classList) zeile.classList.toggle('ist-demo', demoAktiv());
  }

  
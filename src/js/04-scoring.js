// ---------- scoring ----------
  function computeScores(){
    var sums = {E:0,A:0,C:0,S:0,O:0};
    for (var idx=0; idx<50; idx++){
      var it = ITEMS[idx];
      var a = answers[idx] || 3;
      var val = it.key===1 ? a : (6-a);
      sums[it.factor]+= val;
    }
    var out = {};
    ORDER.forEach(function(f){ out[f] = Math.round(((sums[f]-10)/40)*100); });
    return out;
  }

  // Feedback-Runde 41: Erkennung sehr gleichförmiger Antwortmuster ("Straight-Lining").
  // Hintergrund: die Punkteberechnung selbst ist korrekt und folgt exakt der Item-Polung des
  // wissenschaftlichen IPIP-50 — aber diese Polung ist je Dimension unterschiedlich verteilt (nur
  // Extraversion ist mit 5 positiv / 5 negativ ausgeglichen, emotionale Stabilität dagegen 2/8).
  // Dadurch ergibt 50x dieselbe Antwort kein neutrales 50/50/50/50/50-Profil, sondern ein deutlich
  // ausgeprägtes, das wie ein echtes Ergebnis aussieht. An der Berechnung wird bewusst nichts
  // geändert (das würde bestehende Ergebnisse verschieben und vom validierten Instrument abweichen);
  // stattdessen wird das Muster erkannt und auf der Ergebnisseite offen benannt.
  // Kennzahl: Anteil der häufigsten Antwort an allen abgegebenen Antworten.
  var UNIFORM_THRESHOLD = 0.8;
  function answerUniformity(list){
    var counts = {}, n = 0, max = 0;
    for (var i=0;i<list.length;i++){
      var v = list[i];
      if (!v) continue; // unbeantwortete Items zählen nicht mit
      counts[v] = (counts[v]||0) + 1;
      if (counts[v] > max) max = counts[v];
      n++;
    }
    return n ? max/n : 0;
  }

  function archetypeOf(sc){
    var dev = ORDER.map(function(f){ return {f:f, d:Math.abs(sc[f]-50)}; });
    dev.sort(function(a,b){ return b.d-a.d; });
    var top1 = dev[0].f, top2 = dev[1].f;
    var pole1 = sc[top1]>=50 ? 'high':'low';
    var pole2 = sc[top2]>=50 ? 'high':'low';
    return { title: NOUN[top1][pole1] + ' · ' + ADJ[top2][pole2], top1:top1, top2:top2 };
  }

  // ---------- archetypes overview (the 10 primary roles, generated from the same data the real result uses) ----------
  function renderArchetypeGroups(){
    var roles = [];
    ORDER.forEach(function(t){
      ['high','low'].forEach(function(p){
        roles.push({ title: NOUN[t][p], motto: MOTTO[t][p], desc: CORE[t][p], dim: t, pole: p });
      });
    });
    var totalCombos = roles.length * (ORDER.length-1) * 2; // each role paired with 4 other traits × 2 poles
    $('archTotalCount').textContent = totalCombos;
    // Jede Rolle stammt aus genau einer der fünf Dimensionen — das war bisher unsichtbar.
    // Ein kleiner Tag macht die Herkunft transparent und bricht zehn sonst identisch wirkende
    // Karten optisch auf, ohne neue Texte erfinden zu müssen (nutzt das vorhandene ADJ-Vokabular).
    $('archetypeGroups').innerHTML = roles.map(function(r,i){
      return '<div class="role-card" style="animation-delay:'+(i*40)+'ms">'+
        '<div class="role-tag role-tag-'+r.pole+'">'+LABELS[r.dim]+' &middot; '+ADJ[r.dim][r.pole]+'</div>'+
        '<div class="role-title">'+r.title+'</div>'+
        '<div class="role-motto">'+r.motto+'</div>'+
        '<p class="role-desc">'+r.desc+'</p>'+
        '</div>';
    }).join('');
  }

  
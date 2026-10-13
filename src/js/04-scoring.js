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

  // Erkennung gleichfoermiger Antwortmuster: Die IPIP-50-Polung ist je Dimension ungleich verteilt,
  // 50-mal dieselbe Antwort ergibt deshalb ein ausgepraegtes Profil. Die Berechnung bleibt
  // unveraendert (validiertes Instrument); das Muster wird erkannt und benannt. Kennzahl: Anteil der
  // haeufigsten Antwort.
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
    // 10 Rollen (5 Dimensionen x 2 Pole), jede mit 4 anderen Dimensionen x 2 Polen kombinierbar.
    var totalCombos = (ORDER.length*2) * (ORDER.length-1) * 2;
    $('archTotalCount').textContent = totalCombos;
    // Fuenf Gruppen (je Dimension) mit je zwei Gegenpolen; die Kante links traegt den Pol als Form.
    // Die Verzoegerung zaehlt durchgehend 0–9, sonst blitzte die Liste auf.
    $('archetypeGroups').innerHTML = ORDER.map(function(t, gi){
      var karten = ['high','low'].map(function(p, pi){
        return '<div class="role-card role-pol-'+p+'" style="animation-delay:'+((gi*2+pi)*40)+'ms">'+
          '<div class="role-tag role-tag-'+p+'">'+ADJ[t][p]+'</div>'+
          '<div class="role-title">'+NOUN[t][p]+'</div>'+
          '<div class="role-motto">'+MOTTO[t][p]+'</div>'+
          '<p class="role-desc">'+CORE[t][p]+'</p>'+
          '</div>';
      }).join('');
      return '<section class="arch-gruppe">'+
        '<h2 class="arch-gruppe-titel">'+LABELS[t]+'</h2>'+karten+'</section>';
    }).join('');
  }

  
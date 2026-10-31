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

  // ---------- Rollenatlas (Entscheidung des Inhabers, Runde 161) ----------
  // Oben die eigene Rolle und wie der Titel entsteht; jede der zehn Rollen mit der Naehe zu ihr (der
  // Wert in Richtung ihres Pols) und den Freunden, die sie haben; aufgeklappt ihre acht Titel.
  function rolleVon(sc){ var a = archetypeOf(sc); return {f:a.top1, p:sc[a.top1] >= 50 ? 'high' : 'low', f2:a.top2, p2:sc[a.top2] >= 50 ? 'high' : 'low'}; }
  function renderArchetypeGroups(){
    var totalCombos = (ORDER.length*2) * (ORDER.length-1) * 2;
    $('archTotalCount').textContent = totalCombos;
    var eigen = loadResult(), ich = eigen ? rolleVon(eigen) : null;
    var freunde = [];
    try{ freunde = loadFreunde().map(function(f){ var sc = fromCode(f.code); return sc ? {f:f, r:rolleVon(sc)} : null; }).filter(Boolean); }catch(e){}
    var kopf = ich
      ? '<div class="arch-ich"><div class="eyebrow">'+tx('arch_deine_rolle')+'</div>'+
          '<div class="arch-ich-titel">'+NOUN[ich.f][ich.p]+' <span class="sep">·</span> '+ADJ[ich.f2][ich.p2]+'</div>'+
          '<p class="arch-ich-text">'+tx('arch_entsteht').split('{d1}').join(LABELS[ich.f]).split('{w1}').join(String(eigen[ich.f]))
            .split('{d2}').join(LABELS[ich.f2]).split('{w2}').join(String(eigen[ich.f2]))+'</p></div>'
      : '<p class="arch-ohne-test">'+tx('arch_ohne_test')+'</p>';
    var figuren = function(liste){
      // Mit Namen: Mehrere Freunde koennen dieselbe Figur haben.
      return liste.length ? '<span class="arch-freunde">'+liste.slice(0, 5).map(function(x){
        return '<span class="arch-freund-marke"><span class="avatar arch-freund" data-arch-freund="'+freunde.indexOf(x)+'" aria-hidden="true"></span>'+
          '<span class="arch-freund-name">'+escapeHTML(freundName(x.f))+'</span></span>'; }).join('')+
        (liste.length > 5 ? '<span class="arch-freunde-mehr">+'+(liste.length - 5)+'</span>' : '')+'</span>' : '';
    };
    $('archetypeGroups').innerHTML = kopf + ORDER.map(function(t, gi){
      var karten = ['high','low'].map(function(p, pi){
        var naehe = eigen ? (p === 'high' ? eigen[t] : 100 - eigen[t]) : null;
        var istIch = ich && ich.f === t && ich.p === p;
        var mitRolle = freunde.filter(function(x){ return x.r.f === t && x.r.p === p; });
        var kombis = ORDER.filter(function(o){ return o !== t; }).map(function(o){
          return ['high','low'].map(function(q){
            var meins = istIch && ich.f2 === o && ich.p2 === q;
            var ihre = mitRolle.filter(function(x){ return x.r.f2 === o && x.r.p2 === q; });
            return '<li class="arch-kombi'+(meins ? ' arch-kombi-ich' : '')+'"><span class="arch-kombi-titel">'+NOUN[t][p]+' · '+ADJ[o][q]+'</span>'+
              (meins ? '<span class="arch-du">'+tx('arch_du')+'</span>' : '')+figuren(ihre)+
              '<span class="arch-kombi-satz">'+FLAVOR[o][q]+'</span></li>';
          }).join('');
        }).join('');
        return '<details class="role-card role-pol-'+p+(istIch ? ' role-ich' : '')+'" style="animation-delay:'+((gi*2+pi)*40)+'ms">'+
          '<summary>'+
            '<div class="role-tag role-tag-'+p+'">'+ADJ[t][p]+(istIch ? ' · '+tx('arch_du') : '')+'</div>'+
            '<div class="role-title">'+NOUN[t][p]+'</div>'+
            '<div class="role-motto">'+MOTTO[t][p]+'</div>'+
            '<p class="role-desc">'+CORE[t][p]+'</p>'+
            (naehe === null ? '' : '<div class="arch-naehe"><span>'+tx('arch_naehe')+'</span>'+
              '<span class="arch-naehe-balken" aria-hidden="true"><span style="width:'+Math.max(3, naehe)+'%"></span></span>'+
              '<span class="mono">'+naehe+' %</span></div>')+
            figuren(mitRolle)+
            // Fusszeile wie bei Ergebnis und Verstehen: sagt, dass sich die Karte aufklappen laesst.
            '<span class="trait-more arch-zu"><span class="tm-shut">'+tx('arch_titel_zeigen')+'</span>'+
            '<span class="tm-open">'+tx('js_weniger_anzeigen')+'</span>'+
            '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg></span>'+
          '</summary>'+
          '<div class="arch-kombis"><div class="hg-gruppe-titel">'+tx('arch_kombis')+'</div><ul>'+kombis+'</ul></div>'+
        '</details>';
      }).join('');
      return '<section class="arch-gruppe"><h2 class="arch-gruppe-titel">'+LABELS[t]+'</h2>'+karten+'</section>';
    }).join('');
    var wrap = $('archetypeGroups');
    if (wrap.querySelectorAll) wrap.querySelectorAll('[data-arch-freund]').forEach(function(el){
      var x = freunde[+el.getAttribute('data-arch-freund')];
      if (x) renderAvatarInto(el, {name: x.f.name, figur: x.f.figur || null, avatarColor: 'accent'});
    });
  }

  
  // ---------- Freunde ----------
  // Menschen, mit denen man sich vergleicht: Name, Figur, Code — nur auf diesem Geraet. Die Vergleiche
  // selbst bleiben im Archiv; verbunden wird ueber den Code (Entscheidung des Inhabers). Einladen geht
  // ueber das Teilen-Blatt: Die Person verschickt selbst, Lucenta sendet nichts.
  var FREUNDE_SCHLUESSEL = 'lucenta_freunde';
  var MAX_FREUNDE = 30;
  // Freundescode: Ergebnis-Code plus Name und Figur, die sich die Person SELBST gegeben hat — ohne
  // Server reisen sie nur so mit (Entscheidung des Inhabers). Ein eigenes Foto passt nicht hinein; dann
  // zeigt die Liste die Initialen. Gesucht wird im ganzen eingefuegten Text (die Einladung als Ganzes).
  var FREUNDESCODE_MUSTER = /L1\.([0-9a-z]{10})\.([a-z]*)\.([A-Za-z0-9_-]*)/;
  function b64url(text){
    return btoa(unescape(encodeURIComponent(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function vonB64url(t){
    try{ t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; return decodeURIComponent(escape(atob(t))); }
    catch(e){ return ''; }
  }
  function eigenerFreundescode(){
    var r = loadResult();
    if (!r) return '';
    var p = loadProfile();
    var fig = (p.figur && figurFinden(p.figur)) ? p.figur : '';
    return 'L1.' + toCode(r) + '.' + fig + '.' + b64url((p.name || '').trim().slice(0, 30));
  }
  function freundescodeLesen(text){
    var m = FREUNDESCODE_MUSTER.exec(text || '');
    if (!m || !fromCode(m[1])) return null;
    return {code: m[1], figur: figurFinden(m[2]) ? m[2] : '', name: vonB64url(m[3]).trim().slice(0, 30)};
  }
  function freundName(f){ return f.name || tx('freunde_ohne_namen'); }
  // Namen sind Eingaben: nie ungeprueft als HTML einsetzen.
  function escapeHTML(t){
    return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function loadFreunde(){
    try{
      var l = JSON.parse(localStorage.getItem(FREUNDE_SCHLUESSEL) || '[]');
      if (!Array.isArray(l)) return [];
      return l.filter(function(f){ return f && typeof f.code === 'string' && typeof f.name === 'string'; });
    }catch(e){ return []; }
  }
  function saveFreunde(l){
    try{ localStorage.setItem(FREUNDE_SCHLUESSEL, JSON.stringify(l.slice(-MAX_FREUNDE))); return true; }
    catch(e){ return false; }
  }
  function clearFreunde(){
    try{ localStorage.removeItem(FREUNDE_SCHLUESSEL); }catch(e){}
  }
  // Dieselbe Kennzahl wie im Vergleich (renderCompat): 100 minus mittlere Abweichung.
  function uebereinstimmung(me, other){
    var d = ORDER.reduce(function(s, f){ return s + Math.abs(me[f] - other[f]); }, 0) / ORDER.length;
    return Math.round(100 - d);
  }
  // Freunde mit gueltigem Code und ihre Uebereinstimmung mit dem eigenen Ergebnis, aehnlichste zuerst.
  function freundeNachNaehe(eigen){
    return loadFreunde().map(function(f){
      var sc = fromCode(f.code);
      return sc ? {f: f, sc: sc, match: uebereinstimmung(eigen, sc)} : null;
    }).filter(Boolean).sort(function(a, b){ return b.match - a.match; });
  }
  var GRUPPE_MAX = 5;
  var GRUPPE_FARBEN = ['--dim-o', '--dim-e', '--dim-c', '--dim-a', '--dim-s'];
  // Das Gruppenbild: das eigene Profil als Flaeche, bis zu fuenf Freunde als Linien.
  function gruppenRadarSVG(eigen, liste){
    var size = 300, c = size/2, r = size*0.34, labelR = size*0.42;
    function pts(sc){ return polyPoints(sc, c, r).map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' '); }
    var ringe = [0.25,0.5,0.75,1].map(function(frac){
      return '<polygon points="'+ORDER.map(function(f,i){ var a=-Math.PI/2+i*(2*Math.PI/5); return (c+r*frac*Math.cos(a)).toFixed(1)+','+(c+r*frac*Math.sin(a)).toFixed(1); }).join(' ')+'" fill="none" stroke="var(--line)" stroke-width="1"/>';
    }).join('');
    var achsen = ORDER.map(function(f,i){
      var a=-Math.PI/2+i*(2*Math.PI/5), lx=c+labelR*Math.cos(a), ly=c+labelR*Math.sin(a);
      var anker = Math.abs(Math.cos(a))<0.2 ? 'middle' : (Math.cos(a)>0?'start':'end');
      return '<line x1="'+c+'" y1="'+c+'" x2="'+(c+r*Math.cos(a)).toFixed(1)+'" y2="'+(c+r*Math.sin(a)).toFixed(1)+'" stroke="var(--line)" stroke-width="1"/>'+
        '<text x="'+lx.toFixed(1)+'" y="'+(ly+4).toFixed(1)+'" text-anchor="'+anker+'" class="radar-axis-label">'+RADAR_LABELS[f]+'</text>';
    }).join('');
    var linien = liste.map(function(e, i){
      return '<polygon points="'+pts(e.sc)+'" fill="none" stroke="var('+GRUPPE_FARBEN[i]+')" stroke-width="2" stroke-linejoin="round"/>';
    }).join('');
    var eigenes = '<polygon points="'+pts(eigen)+'" fill="color-mix(in srgb, var(--accent) 22%, transparent)" stroke="var(--accent)" stroke-width="2.4" stroke-linejoin="round"/>';
    var aria = tx('freunde_gruppe_aria') + ' ' + liste.map(function(e){ return freundName(e.f); }).join(', ');
    return '<svg viewBox="0 0 '+size+' '+size+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+escapeHTML(aria)+'">'+
      ringe+achsen+eigenes+linien+'</svg>';
  }
  // Unter der Liste nur noch das Gruppenbild; die Rangliste ist die Liste selbst (nach Naehe geordnet).
  function freundeUebersichtHTML(){
    var eigen = loadResult();
    var liste = eigen ? freundeNachNaehe(eigen) : [];
    if (liste.length < 2) return '';
    var gruppe = liste.slice(0, GRUPPE_MAX);
    var bild = '<div class="radar-wrap freunde-gruppe-radar">'+gruppenRadarSVG(eigen, gruppe)+'</div>'+
      '<div class="freunde-legende"><span><i style="background:var(--accent)"></i>'+tx('freunde_du')+'</span>'+
      gruppe.map(function(e, i){ return '<span><i style="background:var('+GRUPPE_FARBEN[i]+')"></i>'+escapeHTML(freundName(e.f))+'</span>'; }).join('')+'</div>';
    // Das Gruppenbild ist Lucenta+ (Entscheidung des Inhabers): Es geht ueber den freien Vergleich mit
    // zwei Personen hinaus. Frei steht es als verschwommene Vorschau.
    return '<div class="settings-group freunde-gruppe"><h2>'+tx('freunde_gruppe_titel')+'</h2>'+
      (istPlus() ? bild : vorschauHTML(bild, tx('plus_freunde_gruppe')))+'</div>';
  }


  // Wie "Ansehen" im Archiv: das eigene Ergebnis zeigen und den Vergleich mit dieser Person rechnen.
  // Der Vergleich mit einem Freund ist eine Unterseite von Freunde (view-compare).
  var vergleichFreund = null;
  function freundVergleichen(code){
    var eigen = loadResult();
    if (!eigen){ toast(tx('js_kein_eigenes_ergebnis_vorh')); return; }
    var f = loadFreunde().filter(function(x){ return x.code === code; })[0];
    if (!f) return;
    vergleichFreund = f;
    $('cmpMe').value = toCode(eigen);
    $('cmpOther').value = f.code;
    $('cmpOther').setAttribute('data-freund', JSON.stringify({code: f.code, name: f.name, figur: f.figur}));
    $('vergleichName').textContent = freundName(f);
    renderAvatarInto($('vergleichAvatar'), {name: f.name, figur: f.figur || null, avatarColor: 'accent'});
    renderCompat();
    var andere = document.querySelector('#compatResult .compat-legend > span:last-child');
    if (andere) andere.innerHTML = '<span class="dot dot-other"></span>' + escapeHTML(freundName(f));
    showView('compare');
  }
  function freundEntfernen(){
    var f = vergleichFreund;
    if (!f || !window.confirm(decodeEntities(tx('freunde_entfernen_frage').split('{name}').join(freundName(f))))) return;
    saveFreunde(loadFreunde().filter(function(x){ return x.code !== f.code; }));
    vergleichFreund = null;
    toast(tx('freunde_entfernt'));
    renderFreunde();
    showView('freunde');
  }

  // Einladung als Universal Link (Entscheidung des Inhabers). Der Code steht hinter #, das schickt kein
  // Browser an den Server. Leer, solange es keine Domain gibt: dann nur der Code zum Einfuegen — nie ein
  // Link, der ins Leere fuehrt. Gesetzt wird zugleich applinks:<domain> in App.entitlements.
  var EINLADUNG_DOMAIN = '';
  function einladungsText(){
    if (!loadResult()) return tx('freunde_einladen_ohne');
    var code = eigenerFreundescode();
    return tx('freunde_einladen_text').split('{code}').join(code) +
      (EINLADUNG_DOMAIN ? ' https://' + EINLADUNG_DOMAIN + '/f#' + code : '');
  }
  // Ein angetippter Link legt den Freund an. Beim Kaltstart kommt derselbe Link zweimal
  // (getLaunchUrl und appUrlOpen), deshalb wird er nur einmal angenommen.
  var letzterEinladungsLink = '';
  function freundAusLink(url){
    if (!url || url === letzterEinladungsLink) return;
    var info = null;
    try{ info = freundescodeLesen(decodeURIComponent(url)); }catch(e){ info = freundescodeLesen(url); }
    if (!info) return;
    letzterEinladungsLink = url;
    if (!freundAnlegen(info)) return;
    renderFreunde();
    if (loadResult()) freundVergleichen(info.code); else showView('freunde');
  }
  // Dynamic Type: Die Huelle setzt --dt an :root (MainViewController.textFaktor). Ab 140 % schaltet das
  // Stilblatt auf umbrechende Zeilen um; die Schwelle steht nur hier.
  function textGroesseAnwenden(){
    var f = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dt')) || 1;
    if (f >= 1.4) document.documentElement.setAttribute('data-text', 'gross');
    else document.documentElement.removeAttribute('data-text');
  }
  function textGroesseBeobachten(){
    if (typeof MutationObserver === 'undefined') return;
    textGroesseAnwenden();
    new MutationObserver(textGroesseAnwenden).observe(document.documentElement, {attributes: true, attributeFilter: ['style']});
  }
  function einladungenHoeren(){
    var app = nativModul('App');
    if (!app) return;
    if (app.getLaunchUrl) app.getLaunchUrl().then(function(r){ if (r && r.url) freundAusLink(r.url); }).catch(function(){});
    if (app.addListener) app.addListener('appUrlOpen', function(ev){ if (ev && ev.url) freundAusLink(ev.url); });
  }
  function freundeEinladen(){
    var text = einladungsText();
    function inAblage(){
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){ toast(tx('js_zum_teilen_kopiert')); })
          .catch(function(){ toast(text); });
      } else { toast(text); }
    }
    if (navigator.share){
      navigator.share({title:'Lucenta', text:text}).catch(function(err){
        if (err && err.name === 'AbortError') return;
        inAblage();
      });
    } else { inAblage(); }
  }

  function freundAnlegen(info){
    var eigen = loadResult();
    if (eigen && toCode(eigen) === info.code){ toast(tx('freunde_eigener_code')); return false; }
    // Derselbe Code ist dieselbe Person: aktualisiert, nicht verdoppelt.
    var l = loadFreunde().filter(function(f){ return f.code !== info.code; });
    l.push({id: 'f' + Date.now().toString(36), name: info.name, figur: info.figur, code: info.code, ts: Date.now()});
    if (!saveFreunde(l)){ toast(tx('js_konnte_nicht_gespeichert_w')); return false; }
    toast(tx('freunde_gespeichert'));
    return true;
  }
  // EIN Feld fuer alles: Freundescode, ganze Einladung oder ein alter 10-stelliger Code (dann ohne Namen).
  // Die Person wird angelegt und der Vergleich geoeffnet.
  function freundSpeichern(){
    var feld = $('freundCode');
    var info = freundescodeLesen(feld.value);
    if (!info){
      var nur = (feld.value || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
      if (nur.length === 10 && fromCode(nur)) info = {code: nur, figur: '', name: ''};
    }
    if (!info){ schuetteln(feld); toast(tx('freunde_code_ungueltig')); return; }
    if (!freundAnlegen(info)){ schuetteln(feld); return; }
    feld.value = '';
    renderFreunde();
    renderSettings();
    if (loadResult()) freundVergleichen(info.code);
  }

  // Eine Zeile = ein Knopf zum Vergleich, mit der Uebereinstimmung rechts.
  function freundZeileHTML(e, i){
    var wert = e.match === null ? '' : '<span class="freund-wert mono">'+e.match+' %</span>';
    return '<button type="button" class="freund-zeile" data-freund-vergleichen="'+i+'">'+
      '<span class="avatar freund-avatar" data-freund-avatar="'+i+'" aria-hidden="true"></span>'+
      '<span class="freund-text"><span class="history-title">'+escapeHTML(freundName(e.f))+'</span>'+
        (e.match === null ? '' : '<span class="freund-balken" aria-hidden="true"><span style="width:'+Math.max(4, e.match)+'%"></span></span>')+
      '</span>'+wert+
      '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"></path></svg>'+
    '</button>';
  }
  // Die eigene Karte: Figur, Name, Einladen und Kopieren; die Zeichenkette erst auf Wunsch.
  function freundIchHTML(){
    var code = eigenerFreundescode(), p = loadProfile();
    if (!code) return '<div class="freund-ich-karte"><p class="settings-hint">'+tx('freunde_erst_test')+'</p>'+
      '<button type="button" class="btn btn-primary btn-sm" data-ich="test">'+tx('test_starten')+'</button></div>';
    return '<div class="freund-ich-karte">'+
      '<div class="freund-ich-kopf"><span class="avatar freund-avatar" id="freundIchAvatar" aria-hidden="true"></span>'+
        '<span class="freund-text"><span class="history-title">'+escapeHTML(p.name || tx('freunde_du'))+'</span>'+
        '<span class="history-date">'+tx('freunde_ich_unter')+'</span></span></div>'+
      '<div class="freund-ich-knoepfe">'+
        '<button type="button" class="btn btn-primary btn-sm" data-ich="einladen">'+tx('freunde_einladen_knopf')+'</button>'+
        '<button type="button" class="btn btn-ghost btn-sm" data-ich="kopieren">'+tx('freunde_code_kopieren2')+'</button></div>'+
      '<button type="button" class="freund-code-zeigen" data-ich="zeigen" aria-expanded="false">'+tx('freunde_code_zeigen')+'</button>'+
      '<div class="freund-eigener-code mono" id="freundEigenerCode" hidden>'+escapeHTML(code)+'</div>'+
    '</div>';
  }
  function freundIchKlick(e){
    var b = e.target.closest ? e.target.closest('[data-ich]') : null;
    if (!b) return;
    var was = b.getAttribute('data-ich'), code = eigenerFreundescode();
    if (was === 'einladen') freundeEinladen();
    else if (was === 'test') $('btnStart').click();
    else if (was === 'kopieren' && code){
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(code).then(function(){ toast(tx('freunde_code_kopiert')); }).catch(function(){ toast(code); });
      } else toast(code);
    } else if (was === 'zeigen'){
      var c = $('freundEigenerCode'), offen = c.hidden;
      c.hidden = !offen;
      b.setAttribute('aria-expanded', String(offen));
      b.textContent = tx(offen ? 'freunde_code_verbergen' : 'freunde_code_zeigen');
    }
  }

  function renderFreunde(){
    var wrap = $('freundeListe');
    if (!wrap) return;
    var ich = $('freundIch');
    if (ich){
      ich.innerHTML = freundIchHTML();
      if ($('freundIchAvatar')) renderAvatarInto($('freundIchAvatar'), loadProfile());
    }
    var oben = $('freundeUebersicht');
    if (oben){ oben.innerHTML = freundeUebersichtHTML(); schloesserVerdrahten(oben); }
    var eigen = loadResult();
    // Mit eigenem Ergebnis nach Naehe, sonst die zuletzt hinzugefuegten zuerst.
    var l = eigen ? freundeNachNaehe(eigen)
                  : loadFreunde().slice().reverse().map(function(f){ return {f: f, match: null}; });
    wrap.innerHTML = l.length ? '<div class="freund-liste">'+l.map(freundZeileHTML).join('')+'</div>'
                              : emptyStateHTML(tx('freunde_leer2'));
    wrap.querySelectorAll('[data-freund-avatar]').forEach(function(el){
      var f = l[+el.getAttribute('data-freund-avatar')].f;
      renderAvatarInto(el, {name: f.name, figur: f.figur || null, avatarColor: 'accent'});
    });
    wrap.querySelectorAll('[data-freund-vergleichen]').forEach(function(b){
      b.addEventListener('click', function(){ freundVergleichen(l[+b.getAttribute('data-freund-vergleichen')].f.code); });
    });
  }
  // Das Vergleichsarchiv ist in Freunde aufgegangen (Entscheidung des Inhabers): Jeder gespeicherte
  // Vergleich wird einmal zu einem Freund; der Name ist die Beschriftung des Vergleichs.
  var ARCHIV_UEBERNOMMEN = 'lucenta_archiv_uebernommen';
  function archivUebernehmen(){
    try{
      if (localStorage.getItem(ARCHIV_UEBERNOMMEN)) return;
      var eigen = loadResult(), eigenCode = eigen ? toCode(eigen) : '';
      var l = loadFreunde();
      loadCompatArchive().forEach(function(e){
        if (!fromCode(e.otherCode) || e.otherCode === eigenCode) return;
        if (l.some(function(f){ return f.code === e.otherCode; })) return;
        l.push({id: 'f' + e.id, name: (e.label || '').slice(0, 30), figur: '', code: e.otherCode, ts: e.ts || Date.now()});
      });
      saveFreunde(l);
      localStorage.setItem(ARCHIV_UEBERNOMMEN, '1');
    }catch(e){}
  }

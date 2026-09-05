  var fails=0,checks=0;
  function ok(c,m){checks++; if(!c){fails++;console.log('  FEHLER: '+m);} }
  function view(){ return currentView; }
  function open(){ return $('drawerPanel').classList.contains('open'); }
  function back(){ history.back(); }

  console.log("\n=== Zurück-Geste durch mehrere Ansichten ===");
  showView('landing');
  console.log('  Start                       -> '+view());
  showView('archetypes'); console.log('  Archetypen geöffnet         -> '+view());
  showView('understand'); console.log('  Verstehen geöffnet          -> '+view());
  back(); console.log('  zurück                      -> '+view());
  ok(view()==='archetypes','Zurück landet nicht bei Archetypen');
  back(); console.log('  zurück                      -> '+view());
  ok(view()==='landing','Zurück landet nicht auf der Startseite');
  global.__leftApp=false; back();
  console.log('  zurück von der Startseite    -> App verlassen: '+(global.__leftApp?'ja (korrekt)':'nein'));

  console.log("\n=== Scrollposition wird gemerkt ===");
  showView('landing'); showView('result');
  window.scrollY=1840;                       // weit unten im Ergebnis
  showView('landing');
  console.log('  Ergebnis bei 1840 verlassen, Startseite -> scrollY='+window.scrollY);
  ok(window.scrollY===0,'Startseite sollte oben beginnen');
  back();
  console.log('  zurück zum Ergebnis                    -> scrollY='+window.scrollY);
  ok(window.scrollY===1840,'Scrollposition nicht wiederhergestellt');

  console.log("\n=== Zurück-Geste schließt zuerst die Schublade ===");
  showView('landing'); openDrawer();
  console.log('  Schublade offen: '+open()+', Ansicht: '+view());
  back();
  console.log('  nach Zurück      offen: '+open()+', Ansicht: '+view());
  ok(!open(),'Schublade wurde nicht geschlossen');
  ok(view()==='landing','Ansicht hätte sich nicht ändern dürfen');

  console.log("\n=== Aus der Schublade heraus navigieren erzeugt keinen Geister-Eintrag ===");
  showView('landing');
  var vor=history.__stack.length;
  openDrawer(); closeDrawer(true); showView('settings');
  console.log('  Einträge vorher '+vor+', nach Schublade+Einstellungen '+history.__stack.length+' (Ansicht: '+view()+')');
  ok(view()==='settings','Einstellungen nicht geöffnet');
  back();
  console.log('  einmal zurück                          -> '+view());
  ok(view()==='landing','Ein einziges Zurück muss zur Startseite führen');

  console.log("\n=== Fenstertitel und Fokus folgen der Ansicht ===");
  showView('profile');
  console.log('  Titel: "'+document.title+'" | Fokus auf: '+global.__focused);
  ok(document.title.indexOf('Profil')!==-1,'Titel folgt der Ansicht nicht');
  ok(global.__focused==='view-profile','Fokus wandert nicht in die neue Ansicht');
  showView('landing');
  console.log('  Titel auf der Startseite: "'+document.title+'"');
  ok(document.title==='Lucenta','Startseite sollte nur „Lucenta" heißen');

  console.log('\n  '+(fails===0?('ALLE '+checks+' PRÜFUNGEN BESTANDEN'):(fails+' von '+checks+' FEHLGESCHLAGEN')));

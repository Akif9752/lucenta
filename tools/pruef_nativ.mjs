// Prueft die native Bruecke mit einer NACHGESTELLTEN Capacitor-Umgebung.
//
// Der Grund fuer dieses Werkzeug: Der native Weg laesst sich hier nicht laufen lassen — es gibt
// kein iPhone und keinen Mac in dieser Umgebung. Damit waere der gesamte Code in
// src/js/19b-native.js ungeprueft, bis ihn zum ersten Mal jemand auf einem Geraet oeffnet, und
// ein Tippfehler im Aufruf faellt dann im schlechtesten Fall erst der Pruefung bei Apple auf.
//
// Also wird die Bruecke nachgebaut: window.Capacitor mit denselben Modulnamen und Methoden, die
// die echte hat, und einem Protokoll darueber, was aufgerufen wurde. Das prueft NICHT, ob
// Capacitor sich so verhaelt — das kann nur ein Geraet. Es prueft, ob unser Code das Richtige
// ruft, in der richtigen Reihenfolge, mit den richtigen Werten. Genau das ist der Teil, der
// hier kaputtgehen kann.
import { createRequire } from 'module';
import { execSync } from 'child_process';
const require_ = createRequire(import.meta.url);
let pkg;
for (const ort of ['playwright', process.env.PLAYWRIGHT_PFAD].filter(Boolean)) {
  try { pkg = require_(ort); break; } catch (e) {}
}
if (!pkg) {
  try { pkg = require_(execSync('npm root -g', {encoding:'utf8'}).trim() + '/playwright'); }
  catch (e) { console.error('Playwright nicht gefunden.'); process.exit(2); }
}
const { chromium } = pkg;
const URL = process.env.LUCENTA_URL || 'http://127.0.0.1:8017/lucenta.html';

let fehlschlaege = 0, pruefungen = 0;
const ok = (bedingung, text) => {
  pruefungen++;
  console.log((bedingung ? '  ok    ' : '  FAIL  ') + text);
  if (!bedingung) fehlschlaege++;
};

const browser = await chromium.launch();
const seite = await browser.newPage({viewport:{width:390, height:844}});
const ausnahmen = [];
seite.on('pageerror', e => ausnahmen.push(e.message));

// Die nachgestellte Bruecke wird VOR dem Laden gesetzt, damit sie schon beim Start da ist —
// genau wie auf dem Geraet.
await seite.addInitScript(() => {
  window.__nativLog = [];
  // Runde 103: Die Standpruefung beim Start laesst sich nur ueber ein NEULADEN pruefen — und ein
  // Neuladen wirft alles weg, was per evaluate() gesetzt wurde. Der gewuenschte Zustand des
  // nachgestellten Stores kommt deshalb aus dem localStorage, den das Neuladen ueberlebt.
  // Die spaeteren Zuweisungen per evaluate() ueberschreiben das weiterhin.
  try {
    window.__aboAktiv = localStorage.getItem('__pruef_abo') === '1';
    window.__standFehler = localStorage.getItem('__pruef_standfehler') === '1';
    // Runde 113: stellt den Entwicklungsbau nach — auf dem Geraet setzt das MainViewController.swift
    // hinter `#if DEBUG`. Ueber den localStorage aus demselben Grund wie oben: Es muss ein
    // Neuladen ueberleben.
    if (localStorage.getItem('__pruef_entwicklung') === '1') window.__lucentaEntwicklungsbau = true;
  } catch (e) {}
  const merke = (was, arg) => { window.__nativLog.push({was, arg}); };
  window.Capacitor = {
    isNativePlatform: () => true,
    Plugins: {
      LocalNotifications: {
        requestPermissions: () => { merke('erlaubnis'); return Promise.resolve({display: window.__erlaubnis || 'granted'}); },
        schedule: (o) => { merke('planen', o); return Promise.resolve(); },
        cancel: (o) => { merke('absagen', o); return Promise.resolve(); }
      },
      Filesystem: {
        writeFile: (o) => { merke('schreiben', {path:o.path, laenge:(o.data||'').length, dir:o.directory}); return Promise.resolve(); }
      },
      // Runde 103: Die Bruecke kann jetzt drei Dinge, und alle drei werden hier nachgestellt.
      // `window.__kaufAntwort` bestimmt, WAS der Store antwortet — das ist der Punkt der ganzen
      // Uebung: Kauf, Abbruch, Warten und Fehlschlag sind vier verschiedene Ausgaenge, und nur
      // der erste darf etwas freischalten.
      StoreKit: {
        restorePurchases: () => { merke('wiederherstellen');
          return Promise.resolve({aktiv: !!window.__aboAktiv, produkt: window.__aboAktiv ? 'lucenta.plus.jahr' : ''}); },
        stand: () => { merke('stand');
          return window.__standFehler
            ? Promise.reject(new Error('Store nicht erreichbar'))
            : Promise.resolve({aktiv: !!window.__aboAktiv, produkt: window.__aboAktiv ? 'lucenta.plus.jahr' : ''}); },
        kaufen: (o) => { merke('kaufen', o);
          return window.__kaufFehler
            ? Promise.reject(new Error('Kauf fehlgeschlagen'))
            : Promise.resolve(window.__kaufAntwort || {aktiv: true, produkt: o.produkt}); }
      },
      App: { openUrl: (o) => { merke('oeffnen', o); return Promise.resolve(); } }
    }
  };
});

await seite.goto(URL, {waitUntil:'networkidle'});
await seite.waitForTimeout(500);
await seite.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
await seite.waitForTimeout(300);
await seite.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find(x => /Einstellungen|Settings|Ayarlar|Ajustes|Réglages|Impostazioni|Definições|設定/.test(x.textContent||''));
  b?.click();
});
await seite.waitForTimeout(600);

console.log('\n=== Mit Bruecke ist die Erinnerung bedienbar ===');
const zustand = await seite.evaluate(() => ({
  aus: document.getElementById('erinnerungSchalter')?.disabled,
  hinweis: document.getElementById('erinnerungHinweis')?.textContent || ''
}));
ok(zustand.aus === false, 'der Schalter ist nicht mehr gesperrt');
ok(!/nur in der App|only in the App/i.test(zustand.hinweis), 'und der Browser-Hinweis ist weg');

console.log('\n=== Einschalten fragt um Erlaubnis und plant genau EINE Mitteilung ===');
await seite.evaluate(() => document.getElementById('erinnerungSchalter').click());
await seite.waitForTimeout(500);
let log = await seite.evaluate(() => window.__nativLog);
ok(log.some(e => e.was === 'erlaubnis'), 'die Erlaubnis wird erfragt');
const geplant = log.filter(e => e.was === 'planen');
ok(geplant.length === 1, 'genau ein schedule-Aufruf ('+geplant.length+')');
const n = geplant[0]?.arg?.notifications?.[0];
ok(!!n && n.schedule?.on?.hour === 20 && n.schedule?.on?.minute === 0,
   'zur voreingestellten Zeit 20:00 (ist: '+n?.schedule?.on?.hour+':'+n?.schedule?.on?.minute+')');
ok(!!n && !!n.title && !!n.body, 'mit Titel und Text: '+JSON.stringify([n?.title, n?.body]));
ok(await seite.evaluate(() => localStorage.getItem('lucenta_erinnerung') === 'an'), 'und der Zustand ist gemerkt');

console.log('\n=== Eine andere Uhrzeit sagt die alte ab, bevor sie die neue setzt ===');
await seite.evaluate(() => { window.__nativLog = []; });
await seite.evaluate(() => {
  const f = document.getElementById('erinnerungZeit');
  f.value = '07:30';
  f.dispatchEvent(new Event('change'));
});
await seite.waitForTimeout(400);
log = await seite.evaluate(() => window.__nativLog);
const iAb = log.findIndex(e => e.was === 'absagen'), iPlan = log.findIndex(e => e.was === 'planen');
ok(iAb >= 0 && iPlan >= 0 && iAb < iPlan, 'erst absagen, dann planen — sonst sammeln sie sich an');
const n2 = log.filter(e => e.was === 'planen')[0]?.arg?.notifications?.[0];
ok(n2?.schedule?.on?.hour === 7 && n2?.schedule?.on?.minute === 30,
   'die neue Zeit ist 07:30 (ist: '+n2?.schedule?.on?.hour+':'+n2?.schedule?.on?.minute+')');

console.log('\n=== Ausschalten sagt ab und plant nichts Neues ===');
await seite.evaluate(() => { window.__nativLog = []; });
await seite.evaluate(() => document.getElementById('erinnerungSchalter').click());
await seite.waitForTimeout(400);
log = await seite.evaluate(() => window.__nativLog);
ok(log.some(e => e.was === 'absagen') && !log.some(e => e.was === 'planen'), 'nur absagen');
ok(await seite.evaluate(() => localStorage.getItem('lucenta_erinnerung') === 'aus'), 'und der Zustand ist aus');

console.log('\n=== Ohne Erlaubnis bleibt der Schalter aus ===');
await seite.evaluate(() => { window.__erlaubnis = 'denied'; window.__nativLog = []; });
await seite.evaluate(() => document.getElementById('erinnerungSchalter').click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_erinnerung') !== 'an'),
   'ein Nein schaltet NICHT ein');
ok(!(await seite.evaluate(() => window.__nativLog)).some(e => e.was === 'planen'),
   'und plant nichts');
await seite.evaluate(() => { window.__erlaubnis = 'granted'; });

console.log('\n=== Kaeufe wiederherstellen ===');
await seite.evaluate(() => { window.__aboAktiv = false; window.__nativLog = []; localStorage.removeItem('lucenta_plus'); });
await seite.evaluate(() => document.getElementById('btnPlusWiederherstellen').click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') !== '1'), 'ohne Abo wird nichts freigeschaltet');
await seite.evaluate(() => { window.__aboAktiv = true; });
await seite.evaluate(() => document.getElementById('btnPlusWiederherstellen').click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') === '1'), 'mit Abo wird Lucenta+ wieder aktiv');
ok(/Lucenta\+/.test(await seite.evaluate(() => document.getElementById('plusStand')?.textContent || '')),
   'und die Zeile daneben sagt es: '+(await seite.evaluate(() => document.getElementById('plusStand')?.textContent || '')).slice(0,60));

// ---------------------------------------------------------------------------------------
// Runde 103: Der Kauf. Bis zu dieser Runde schaltete der Knopf im Kauffenster Lucenta+ ohne
// Zahlung frei — eine der zwei Stellen, die "die App verschenkt das Abo" bedeuteten. Dahinter
// liegt jetzt die echte Bruecke, und hier steht der Nachweis, dass der Code das Richtige ruft
// und die vier Ausgaenge unterscheidet. Der Knopf wird programmatisch getippt; er liegt im
// Kauffenster, das dafuer nicht offen sein muss.
console.log('\n=== Der Kauf ruft die richtige Produktkennung ===');
const zurueckgesetzt = () => seite.evaluate(() => {
  window.__nativLog = []; window.__kaufAntwort = null; window.__kaufFehler = false;
  localStorage.removeItem('lucenta_plus'); localStorage.removeItem('lucenta_plus_produkt');
  const t = document.getElementById('toast'); if (t) { t.classList.remove('show'); t.textContent = ''; }
});
await zurueckgesetzt();
await seite.evaluate(() => { localStorage.setItem('lucenta_laufzeit', 'monat'); });
await seite.evaluate(() => document.getElementById('btnPlusAktivieren').click());
await seite.waitForTimeout(500);
const kauf = (await seite.evaluate(() => window.__nativLog)).filter(e => e.was === 'kaufen')[0];
ok(!!kauf, 'der Knopf loest einen Kauf aus, statt die Marke umzulegen');
ok(kauf?.arg?.produkt === 'lucenta.plus.monat',
   'mit der Kennung der gewaehlten Laufzeit: ' + kauf?.arg?.produkt);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') === '1'),
   'ein gelungener Kauf schaltet frei');
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus_produkt') === 'lucenta.plus.monat'),
   'und die GEKAUFTE Kennung wird gemerkt, getrennt von der gewaehlten Laufzeit');

await zurueckgesetzt();
await seite.evaluate(() => { localStorage.setItem('lucenta_laufzeit', 'jahr'); });
await seite.evaluate(() => document.getElementById('btnPlusAktivieren').click());
await seite.waitForTimeout(500);
ok((await seite.evaluate(() => window.__nativLog)).filter(e => e.was === 'kaufen')[0]?.arg?.produkt === 'lucenta.plus.jahr',
   'die andere Laufzeit kauft das andere Produkt');

console.log('\n=== Nur ein gelungener Kauf schaltet frei — die drei anderen Ausgaenge nicht ===');
// Gemessen wird der TEXT des Hinweises, nicht seine Klasse 'show'. Erster Versuch war die
// Klasse, und zwei Pruefungen schlugen fehl: toast() nimmt sie nach 1800ms selbst zurueck, und
// der Zeitgeber eines VORHERIGEN Hinweises fiel mitten ins Messfenster. Ein Fehlschlag, der von
// der Uhr abhaengt, ist kein Befund. Der Text wird in zurueckgesetzt() geleert; steht danach
// wieder etwas da, ist etwas gesagt worden.
const etwasGesagt = () => seite.evaluate(() => (document.getElementById('toast')?.textContent || '').trim().length > 0);
await zurueckgesetzt();
await seite.evaluate(() => { window.__kaufAntwort = {aktiv: false, abgebrochen: true}; });
await seite.evaluate(() => document.getElementById('btnPlusAktivieren').click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') !== '1'), 'ein Abbruch schaltet NICHT frei');
ok(!(await etwasGesagt()), 'und sagt auch nichts — wer abbricht, weiss es');

await zurueckgesetzt();
await seite.evaluate(() => { window.__kaufAntwort = {aktiv: false, wartet: true}; });
await seite.evaluate(() => document.getElementById('btnPlusAktivieren').click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') !== '1'),
   'ein wartender Kauf ("Bitten um Erlaubnis") schaltet nicht frei');
ok(await etwasGesagt(), 'sagt aber, dass er wartet — sonst kauft jemand zweimal');

await zurueckgesetzt();
await seite.evaluate(() => { window.__kaufFehler = true; });
await seite.evaluate(() => document.getElementById('btnPlusAktivieren').click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') !== '1'), 'ein Fehlschlag schaltet nicht frei');
ok(await etwasGesagt(), 'und wird gemeldet');

console.log('\n=== Wer Lucenta+ hat, kommt vom selben Knopf zur Verwaltung bei Apple ===');
await zurueckgesetzt();
await seite.evaluate(() => { localStorage.setItem('lucenta_plus', '1'); });
await seite.evaluate(() => document.getElementById('btnPlusAktivieren').click());
await seite.waitForTimeout(400);
const verwaltung = (await seite.evaluate(() => window.__nativLog)).filter(e => e.was === 'oeffnen')[0];
ok(/account\/subscriptions$/.test(verwaltung?.arg?.url || ''),
   'der Knopf fuehrt in die Abo-Verwaltung: ' + (verwaltung?.arg?.url || '(nichts)'));
ok(!(await seite.evaluate(() => window.__nativLog)).some(e => e.was === 'kaufen'),
   'und kauft nichts ein zweites Mal');
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') === '1'),
   'Lucenta+ bleibt dabei aktiv — eine App beendet kein Abo selbst');

console.log('\n=== In der App gibt es keinen Entwickler-Umschalter ===');
await seite.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
await seite.waitForTimeout(300);
await seite.evaluate(() => document.getElementById('btnDrawerProfileRow')?.click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => !document.getElementById('plusSchalter')),
   'kein #plusSchalter mit nativer Bruecke — er verschenkte das Abo');

console.log('\n=== Beim Start gilt, was der Store sagt ===');
// Nur ueber ein Neuladen zu pruefen: plusStandPruefen() laeuft beim Start.
await seite.evaluate(() => {
  localStorage.setItem('lucenta_plus', '1');        // Marke steht noch
  localStorage.setItem('__pruef_abo', '0');          // Abo ist aber weg
  localStorage.setItem('__pruef_standfehler', '0');
});
await seite.reload({waitUntil: 'networkidle'});
await seite.waitForTimeout(700);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') !== '1'),
   'ein abgelaufenes Abo nimmt Lucenta+ beim Start zurueck');

await seite.evaluate(() => {
  localStorage.removeItem('lucenta_plus');           // Marke fehlt
  localStorage.setItem('__pruef_abo', '1');          // Abo laeuft aber
});
await seite.reload({waitUntil: 'networkidle'});
await seite.waitForTimeout(700);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') === '1'),
   'ein laufendes Abo schaltet beim Start von sich aus frei');

// Der wichtigste der drei Faelle: Eine Stoerung darf NICHTS wegnehmen.
await seite.evaluate(() => {
  localStorage.setItem('lucenta_plus', '1');
  localStorage.setItem('__pruef_standfehler', '1');
});
await seite.reload({waitUntil: 'networkidle'});
await seite.waitForTimeout(700);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') === '1'),
   'antwortet der Store gar nicht, bleibt Lucenta+ stehen — eine Stoerung nimmt nichts weg');

// Zustand fuer die folgenden Pruefungen wieder herstellen.
await seite.evaluate(() => {
  localStorage.removeItem('__pruef_standfehler');
  localStorage.setItem('__pruef_abo', '1');
  localStorage.removeItem('lucenta_plus');
});
await seite.reload({waitUntil: 'networkidle'});
await seite.waitForTimeout(600);

console.log('\n=== Abo verwalten fuehrt in die Systemeinstellungen ===');
await seite.evaluate(() => { window.__nativLog = []; });
await seite.evaluate(() => document.getElementById('btnAboVerwalten').click());
await seite.waitForTimeout(300);
const url = (await seite.evaluate(() => window.__nativLog)).filter(e => e.was === 'oeffnen')[0]?.arg?.url || '';
ok(/^itms-apps:\/\/apps\.apple\.com\/account\/subscriptions$/.test(url), 'die richtige Adresse: '+url);

console.log('\n=== Das Ergebnisbild geht in die Mediathek ===');
await seite.evaluate(() => { window.__nativLog = []; });
await seite.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
await seite.waitForTimeout(300);
await seite.evaluate(() => document.getElementById('btnDrawerProfileRow')?.click());
await seite.waitForTimeout(400);
await seite.evaluate(() => document.getElementById('btnDemo')?.click());
await seite.waitForTimeout(1700);
await seite.waitForLoadState('networkidle');
await seite.waitForTimeout(500);
await seite.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
await seite.waitForTimeout(300);
await seite.evaluate(() => document.getElementById('btnDrawerProfileRow')?.click());
await seite.waitForTimeout(400);
await seite.evaluate(() => { const x=[...document.querySelectorAll('button')].find(v=>/Dein Ergebnis/i.test(v.textContent||'')); x?.click(); });
await seite.waitForTimeout(900);
await seite.evaluate(() => { const x=[...document.querySelectorAll('button')].find(v=>/Ergebnis teilen/i.test(v.textContent||'')); x?.click(); });
await seite.waitForTimeout(1400);
ok(await seite.evaluate(() => document.getElementById('btnImgModalSichern')?.hidden === false),
   'mit Bruecke ist "In Fotos sichern" sichtbar');
await seite.evaluate(() => document.getElementById('btnImgModalSichern').click());
await seite.waitForTimeout(500);
const schrieb = (await seite.evaluate(() => window.__nativLog)).filter(e => e.was === 'schreiben')[0];
ok(!!schrieb, 'es wird wirklich geschrieben');
ok(!!schrieb && /\.png$/.test(schrieb.arg.path), 'mit Dateiendung: '+schrieb?.arg?.path);
ok(!!schrieb && schrieb.arg.laenge > 5000, 'und mit echten Bilddaten ('+schrieb?.arg?.laenge+' Zeichen)');
ok(!!schrieb && !/^data:/.test(String(schrieb.arg.laenge)), 'der Datenkopf ist abgeschnitten');

// ---------------------------------------------------------------------------------------
// Runde 100: Die Systemleistenfarbe. Gefunden im iOS-Simulator, wo App-Wahl und Systemvorgabe
// auseinanderliefen — schwarze Leiste ueber heller App. Ursache war die Reihenfolge: Es gilt
// der ERSTE passende theme-color-Eintrag, der frueher angehaengte Uebersteuerungs-Eintrag kam
// nie zum Zug. Hier steht der Nachweis, dass jetzt ALLE Eintraege dieselbe Farbe tragen —
// deshalb ist die Reihenfolge gleichgueltig geworden.
async function themeFarben(){
  return await seite.evaluate(() =>
    [].slice.call(document.querySelectorAll('meta[name="theme-color"]'))
      .map(m => (m.getAttribute('content') || '').toUpperCase()));
}
const farbenVorher = await themeFarben();
ok(farbenVorher.length >= 2, 'es gibt mehrere theme-color-Eintraege ('+farbenVorher.length+')');

await seite.evaluate(() => document.getElementById('themeLight')?.click());
await seite.waitForTimeout(200);
const hell = await themeFarben();
ok(hell.every(f => f === '#F5F6EF'),
   'bei Wahl "hell" tragen alle Eintraege die helle Farbe: ' + hell.join(' '));

await seite.evaluate(() => document.getElementById('themeDark')?.click());
await seite.waitForTimeout(200);
const dunkel = await themeFarben();
ok(dunkel.every(f => f === '#0F1613'),
   'bei Wahl "dunkel" tragen alle Eintraege die dunkle Farbe: ' + dunkel.join(' '));

await seite.evaluate(() => document.getElementById('themeSystem')?.click());
await seite.waitForTimeout(200);
const zurueck = await themeFarben();
ok(zurueck.join(' ') === farbenVorher.join(' '),
   'bei "System" stehen die Ausgangswerte wieder da: ' + zurueck.join(' '));

// --- Runde 113: der Entwicklungsbau
//
// Der Umschalter darf in der App erscheinen — aber NUR, wenn der Compiler die Marke gesetzt hat
// (Start aus Xcode). Die Pruefung weiter oben ("kein #plusSchalter mit nativer Bruecke") bleibt
// unveraendert und ist die wichtigere der beiden: Sie ist das, was im Store-Bau gilt. Diese hier
// prueft die Gegenseite, und dass die Store-Abfrage beim Start den Vorschau-Stand nicht kippt.
console.log('\n=== Im Entwicklungsbau gibt es den Umschalter, und er ueberlebt einen Neustart ===');
await seite.evaluate(() => {
  localStorage.setItem('__pruef_entwicklung', '1');
  localStorage.setItem('lucenta_plus', '1');          // von Hand eingeschaltet
  localStorage.setItem('__pruef_abo', '0');           // der Store sagt: kein Kauf
  localStorage.setItem('__pruef_standfehler', '0');
});
await seite.reload({waitUntil: 'networkidle'});
await seite.waitForTimeout(700);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') === '1'),
   'im Entwicklungsbau nimmt die Store-Abfrage beim Start den Vorschau-Stand NICHT weg');
await seite.evaluate(() => document.getElementById('btnDrawerToggle')?.click());
await seite.waitForTimeout(300);
await seite.evaluate(() => document.getElementById('btnDrawerProfileRow')?.click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => !!document.getElementById('plusSchalter')),
   'im Entwicklungsbau steht der Umschalter im Profil');
await seite.evaluate(() => document.getElementById('plusSchalter')?.click());
await seite.waitForTimeout(300);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') !== '1'),
   'ein Tipp darauf schaltet zurueck auf die freie Fassung');
await seite.evaluate(() => document.getElementById('plusSchalter')?.click());
await seite.waitForTimeout(300);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') === '1'),
   'und ein zweiter wieder auf Lucenta+');
await seite.evaluate(() => localStorage.removeItem('__pruef_entwicklung'));

ok(ausnahmen.length === 0, 'keine Ausnahme in der Konsole: ' + ausnahmen.join(' | '));

await browser.close();
console.log('\n======================================================');
console.log(fehlschlaege === 0
  ? 'ALLE ' + pruefungen + ' PRUEFUNGEN BESTANDEN'
  : fehlschlaege + ' von ' + pruefungen + ' PRUEFUNGEN FEHLGESCHLAGEN');
console.log('======================================================');
process.exit(fehlschlaege ? 1 : 0);

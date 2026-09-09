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
      StoreKit: {
        restorePurchases: () => { merke('wiederherstellen'); return Promise.resolve({aktiv: !!window.__aboAktiv}); }
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

ok(ausnahmen.length === 0, 'keine Ausnahme in der Konsole: ' + ausnahmen.join(' | '));

await browser.close();
console.log('\n======================================================');
console.log(fehlschlaege === 0
  ? 'ALLE ' + pruefungen + ' PRUEFUNGEN BESTANDEN'
  : fehlschlaege + ' von ' + pruefungen + ' PRUEFUNGEN FEHLGESCHLAGEN');
console.log('======================================================');
process.exit(fehlschlaege ? 1 : 0);

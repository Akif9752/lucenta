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
  // Spiegel des Bestands (LucentaBestand.swift): jede Meldung der Seite wird festgehalten.
  window.__bestand = [];
  window.__widget = [];
  window.webkit = {messageHandlers: {lucentaBestand: {postMessage: (d) => { window.__bestand.push(d); }},
                                     lucentaWidget: {postMessage: (d) => { window.__widget.push(d); }}}};
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
        bewerten: () => { merke('bewerten'); return Promise.resolve({}); },
        addListener: (name, f) => { if (name === 'aboGeaendert') window.__aboGeaendert = f; return Promise.resolve({remove(){}}); },
        restorePurchases: () => { merke('wiederherstellen');
          if (window.__wiederAbbruch && !window.__aboAktiv) return Promise.resolve({aktiv: false, produkt: '', abgebrochen: true});
          return Promise.resolve({aktiv: !!window.__aboAktiv, produkt: window.__aboAktiv ? 'lucenta.plus.jahr' : ''}); },
        stand: () => { merke('stand');
          return window.__standFehler
            ? Promise.reject(new Error('Store nicht erreichbar'))
            : Promise.resolve({aktiv: !!window.__aboAktiv, produkt: window.__aboAktiv ? 'lucenta.plus.jahr' : ''}); },
        // Runde 137: die Preise des Stores. Ohne Schalter antwortet er leer — wie ein Store, in dem
        // die Produkte noch nicht angelegt sind; mit Schalter wie ein Schweizer Konto.
        preise: () => { merke('preise');
          return Promise.resolve(localStorage.getItem('__pruef_preise') === '1'
            ? {monat:'CHF 5.00', jahr:'CHF 30.00', jahrProMonat:'CHF 2.50', jahrStatt:'CHF 60.00', jahrSpar:'CHF 30',
               jahrProbeTage: localStorage.getItem('__pruef_probe') === '1' ? 7 : 0}
            : {}); },
        kaufen: (o) => { merke('kaufen', o);
          return window.__kaufFehler
            ? Promise.reject(new Error('Kauf fehlgeschlagen'))
            : Promise.resolve(window.__kaufAntwort || {aktiv: true, produkt: o.produkt}); }
      },
      // Feedback B7: '__pruef_link' = der Link, mit dem die App gestartet wurde.
      App: { getInfo: () => Promise.resolve({version: '1.4.2', build: '17'}), openUrl: (o) => { merke('oeffnen', o); return Promise.resolve(); },
             getLaunchUrl: () => Promise.resolve(localStorage.getItem('__pruef_link') ? {url: localStorage.getItem('__pruef_link')} : {}),
             addListener: (name, f) => { if (name === 'appUrlOpen'){ const alt = window.__linkOeffnen;   // wie Capacitor: alle Horcher
               window.__linkOeffnen = alt ? (ev) => { alt(ev); f(ev); } : f; } return Promise.resolve({remove(){}}); } },
      // Apple Health: '__pruef_health' = Erlaubnis, die der Dialog erteilt.
      Health: {
        stand: () => Promise.resolve({verfuegbar: true, erlaubt: localStorage.getItem('__pruef_health') === '1'}),
        erlauben: () => { merke('health_erlauben'); return Promise.resolve({erlaubt: localStorage.getItem('__pruef_health') === '1'}); },
        schreiben: (o) => { merke('health_schreiben', o); return Promise.resolve({uuid: 'U' + o.ts}); },
        loeschen: (o) => { merke('health_loeschen', o); return Promise.resolve({geloescht: true}); }
      },
      // App-Sperre: '__pruef_sperre_ok' = Entsperren gelingt.
      Lock: {
        stand: () => Promise.resolve({verfuegbar: true, art: 'faceID', an: localStorage.getItem('__pruef_sperre') === '1',
                                      nach: +(localStorage.getItem('__pruef_sperre_nach') || 0)}),
        setzen: (o) => { merke('sperre_setzen', o);
          if (typeof o.nach === 'number') localStorage.setItem('__pruef_sperre_nach', String(o.nach));
          if (o.an === true && localStorage.getItem('__pruef_sperre_ok') === '1') localStorage.setItem('__pruef_sperre', '1');
          if (o.an === false) localStorage.removeItem('__pruef_sperre');
          return window.Capacitor.Plugins.Lock.stand(); },
        texte: (o) => { merke('sperre_texte', o); return Promise.resolve({}); }
      },
      // Feedback A4: Konto loeschen. '__pruef_konto' = angemeldet; '__pruef_loeschen' = Antwort.
      Account: {
        stand: () => Promise.resolve({angemeldet: localStorage.getItem('__pruef_konto') === '1', icloud: true}),
        anmelden: () => Promise.resolve({angemeldet: true}),
        abmelden: () => Promise.resolve({angemeldet: false}),
        sichern: () => Promise.resolve({gesichert: true, zeit: Date.now()}),
        laden: () => Promise.resolve({leer: true}),
        loeschen: () => { merke('loeschen');
          const a = localStorage.getItem('__pruef_loeschen');
          if (a === 'offline') return Promise.resolve({offline: true});
          localStorage.removeItem('__pruef_konto');
          return Promise.resolve({geloescht: true}); }
      }
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

// Runde 129: Statt EINER taeglichen Mitteilung zur gewaehlten Uhrzeit drei feste Zeiten (8, 13, 19 Uhr),
// fuer 14 Tage einzeln geplant, damit ein schon eingetragener Abschnitt ausgelassen werden kann.
console.log('\n=== Einschalten fragt um Erlaubnis und plant EINE Erinnerung am Tag (Vorgabe) ===');
await seite.evaluate(() => document.getElementById('erinnerungSchalter').click());
await seite.waitForTimeout(500);
let log = await seite.evaluate(() => window.__nativLog);
ok(log.some(e => e.was === 'erlaubnis'), 'die Erlaubnis wird erfragt');
const einmal = log.filter(e => e.was === 'planen')[0]?.arg?.notifications || [];
ok(einmal.length >= 9 && einmal.length <= 10, 'eine je Tag fuer 10 Tage (sind: '+einmal.length+')');
ok(einmal.every(x => new Date(x.schedule.at).getHours() === 20 && new Date(x.schedule.at).getMinutes() === 0), 'immer um 20 Uhr');
ok(await seite.evaluate(() => !document.getElementById('erinnerungAlleZeile').hidden), 'der Schalter "Zu jeder Tageszeit" erscheint');
ok(await seite.evaluate(() => localStorage.getItem('lucenta_erinnerung_alle') !== 'an'), 'und steht auf aus');

console.log('\n=== Die Uhrzeit der Erinnerung ist waehlbar ===');
ok(await seite.evaluate(() => !document.getElementById('erinnerungZeitZeile').hidden), 'die Zeile "Uhrzeit" erscheint bei eingeschalteter Erinnerung');
await seite.evaluate(() => { window.__nativLog = []; const f = document.getElementById('erinnerungZeit'); f.value = '07:30'; f.dispatchEvent(new Event('change')); });
await seite.waitForTimeout(400);
const zeitListe = (await seite.evaluate(() => window.__nativLog)).filter(e => e.was === 'planen')[0]?.arg?.notifications || [];
ok(zeitListe.length >= 9 && zeitListe.every(x => { const d = new Date(x.schedule.at); return d.getHours() === 7 && d.getMinutes() === 30; }),
   'neu geplant, alle um 7:30 (' + zeitListe.length + ')');
ok(await seite.evaluate(() => /7:30/.test(document.getElementById('erinnerungHinweis').textContent)), 'und der Hinweis nennt die Zeit');
await seite.evaluate(() => { const f = document.getElementById('erinnerungZeit'); f.value = '20:00'; f.dispatchEvent(new Event('change')); });
await seite.waitForTimeout(300);

console.log('\n=== Einmal am Tag: ein Eintrag heute laesst den heutigen Abend aus ===');
await seite.evaluate(() => {
  const d = new Date(), key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  localStorage.setItem('lucenta_state', JSON.stringify([{day:key, ts:Date.now() - 3000, energy:3, valence:3, slot:'morgen'}]));
  window.__nativLog = [];
  document.dispatchEvent(new Event('visibilitychange'));
});
await seite.waitForTimeout(400);
log = await seite.evaluate(() => window.__nativLog);
const einmal2 = log.filter(e => e.was === 'planen')[0]?.arg?.notifications || [];
ok(einmal2.length === 9 && einmal2.every(x => new Date(x.schedule.at).toDateString() !== new Date().toDateString()),
   'heute schon eingetragen: 9 Tage, heute keine (sind: '+einmal2.length+')');
await seite.evaluate(() => localStorage.removeItem('lucenta_state'));

console.log('\n=== "Zu jeder Tageszeit" plant die drei Tageszeiten mit Nacherinnerung ===');
await seite.evaluate(() => { window.__nativLog = []; document.getElementById('erinnerungAlleSchalter').click(); });
await seite.waitForTimeout(500);
log = await seite.evaluate(() => window.__nativLog);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_erinnerung_alle') === 'an'), 'der Zustand ist gemerkt');
const geplant = log.filter(e => e.was === 'planen');
ok(geplant.length === 1, 'genau ein schedule-Aufruf ('+geplant.length+')');
const liste = geplant[0]?.arg?.notifications || [];
const jetzt = Date.now();
// Runde 131: 9/14/20 Uhr plus Nacherinnerung 11/16/22, fuer 10 Tage (6 x 10 = 60 <= 64, Apples Grenze).
ok(liste.length >= 54 && liste.length <= 60, '6 x 10 Mitteilungen, abzueglich der heute schon vergangenen (sind: '+liste.length+')');
ok(liste.length <= 64, 'unter Apples Grenze von 64 ausstehenden Mitteilungen');
const zeiten = liste.map(x => new Date(x.schedule?.at));
ok(zeiten.every(d => [9,11,14,16,20,22].includes(d.getHours()) && d.getMinutes() === 0),
   'nur 9/11, 14/16 und 20/22 Uhr (Stunden: '+[...new Set(zeiten.map(d => d.getHours()))].join(',')+')');
ok(zeiten.every(d => d.getTime() > jetzt), 'keine Zeit in der Vergangenheit (iOS wiese den Aufruf ab)');
ok(zeiten.every(d => d.getTime() < jetzt + 11 * 864e5), 'nicht weiter als 10 Tage voraus');
ok(new Set(liste.map(x => x.id)).size === liste.length, 'jede Mitteilung mit eigener Kennung');
ok(liste.every(x => !x.schedule?.on && !x.schedule?.repeats), 'keine Wiederholung — jede ist einzeln geplant');
const titelJe = h => liste.find(x => new Date(x.schedule.at).getHours() === h)?.title;
const titel6 = [9,11,14,16,20,22].map(titelJe);
ok(titel6.every(Boolean) && new Set(titel6).size === 6,
   'je Erinnerung und Nacherinnerung ein eigener Titel: '+JSON.stringify(titel6));
ok(liste.every(x => !!x.body), 'mit Text');
const iAb = log.findIndex(e => e.was === 'absagen'), iPlan = log.findIndex(e => e.was === 'planen');
ok(iAb >= 0 && iAb < iPlan, 'erst alle alten absagen, dann planen — sonst sammeln sie sich an');
const abgesagt = (log[iAb]?.arg?.notifications || []).map(x => x.id);
ok(abgesagt.includes(4711), 'auch die alte taegliche Mitteilung (4711) wird abgesagt');
ok(liste.every(x => abgesagt.includes(x.id)), 'jede neue Kennung ist auch unter den abgesagten');
ok(await seite.evaluate(() => localStorage.getItem('lucenta_erinnerung') === 'an'), 'und der Zustand ist gemerkt');

console.log('\n=== Heute schon eingetragene Tageszeiten werden ausgelassen ===');
await seite.evaluate(() => {
  const d = new Date(), key = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  localStorage.setItem('lucenta_state', JSON.stringify(['morgen','mittag','abend'].map((slot, k) =>
    ({day:key, ts:Date.now() - 3000 + k, energy:3, valence:3, slot}))));
  window.__nativLog = [];
  document.dispatchEvent(new Event('visibilitychange'));   // = die App kommt in den Vordergrund
});
await seite.waitForTimeout(400);
log = await seite.evaluate(() => window.__nativLog);
const liste2 = log.filter(e => e.was === 'planen')[0]?.arg?.notifications || [];
const heute = new Date().toDateString();
ok(liste2.length === 54, 'Oeffnen zieht nach: 9 Tage x 6, heute keine — auch keine Nacherinnerung (sind: '+liste2.length+')');
ok(liste2.every(x => new Date(x.schedule.at).toDateString() !== heute), 'keine Erinnerung mehr fuer heute');
await seite.evaluate(() => localStorage.removeItem('lucenta_state'));

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
// Runde 121, im Simulator gefunden: Wer den Anmeldedialog des Wiederherstellens wegtippte, verlor
// Lucenta+. Ein Abbruch ist keine Antwort — er darf nichts wegnehmen. Eine klare Antwort "kein Abo"
// dagegen schon (sonst bliebe ein gekuendigtes Abo fuer immer stehen).
await seite.evaluate(() => { localStorage.setItem('lucenta_plus', '1'); window.__wiederAbbruch = true; });
await seite.evaluate(() => document.getElementById('btnPlusWiederherstellen').click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') === '1'), 'ein abgebrochener Anmeldedialog nimmt Lucenta+ nicht weg');
await seite.evaluate(() => { window.__wiederAbbruch = false; });
await seite.evaluate(() => document.getElementById('btnPlusWiederherstellen').click());
await seite.waitForTimeout(500);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') !== '1'), 'eine klare Antwort "kein Abo" nimmt es weg');
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
ok(hell.every(f => f === '#E6E5E0'),
   'bei Wahl "hell" tragen alle Eintraege die helle Farbe: ' + hell.join(' '));

await seite.evaluate(() => document.getElementById('themeDark')?.click());
await seite.waitForTimeout(200);
const dunkel = await themeFarben();
ok(dunkel.every(f => f === '#000000'),
   'bei Wahl "dunkel" tragen alle Eintraege die dunkle Farbe: ' + dunkel.join(' '));

await seite.evaluate(() => document.getElementById('themeSystem')?.click());
await seite.waitForTimeout(200);
const zurueck = await themeFarben();
// Seit Runde 149 startet die App dunkel (Vorgabe des Inhabers), nicht in "System" — "System" stellt
// deshalb die Werte aus dem Kopf der Seite wieder her (hell / dunkel je nach Geraet).
ok(zurueck.join(' ') === '#E6E5E0 #000000',
   'bei "System" stehen die Werte aus dem Kopf der Seite wieder da: ' + zurueck.join(' '));

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

console.log('\n=== Preise kommen aus dem Store, sonst bleiben die festen ===');
const preisTexte = () => seite.evaluate(() => {
  const w = document.getElementById('plusPreisWahl');
  const t = k => (w.querySelector('[data-i18n="'+k+'"]')?.textContent || '').trim();
  const spar = w.querySelector('[data-i18n="plus_jahr_spar"]');
  return {jahr:t('plus_betrag_jahr'), monat:t('plus_betrag_monat'), proMonat:t('plus_jahr_pro_monat'),
          statt:t('plus_jahr_statt'), spar:t('plus_jahr_spar'), sparDa: !spar.hidden};
});
await seite.evaluate(() => localStorage.removeItem('__pruef_preise'));
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
let pt = await preisTexte();
ok(pt.jahr === '29,99 €' && pt.monat === '4,99 €', 'antwortet der Store leer, bleiben die festen Betraege: ' + pt.jahr + ' / ' + pt.monat);
await seite.evaluate(() => localStorage.setItem('__pruef_preise', '1'));
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
pt = await preisTexte();
ok(pt.jahr === 'CHF 30.00' && pt.monat === 'CHF 5.00', 'mit Antwort stehen die Store-Betraege da: ' + pt.jahr + ' / ' + pt.monat);
ok(pt.proMonat.replace(/\u00a0/g, ' ') === 'nur CHF 2.50 im Monat', 'im Satz wird nur der Betrag getauscht: ' + pt.proMonat);
ok(/CHF\u00a02\.50/.test(pt.proMonat), 'Betrag und Waehrung bleiben zusammen (festes Leerzeichen)');
ok(pt.statt === 'CHF 60.00' && pt.spar === 'Spare CHF 30' && pt.sparDa, 'Vergleichspreis und Ersparnis aus dem Store: ' + pt.statt + ' / ' + pt.spar);
const probeStand = () => seite.evaluate(() => {
  const sichtbar = id => { const el = document.getElementById(id); return el && !el.hidden ? el.textContent : ''; };
  return {abz: sichtbar('plusProbeAbzeichen'), hinweis: sichtbar('plusProbeHinweis'), knopf: document.getElementById('btnPlusAktivieren').textContent};
});
let ps = await probeStand();
ok(ps && !ps.abz && !ps.hinweis && !/kostenlos/.test(ps.knopf), 'ohne Probezeit vom Store: keine Probezeit versprochen ('+ps.knopf+')');

console.log('\n=== Probezeit: nur, wenn der Store sie diesem Konto gewaehrt ===');
await seite.evaluate(() => { localStorage.setItem('__pruef_probe', '1'); localStorage.setItem('lucenta_laufzeit', 'jahr'); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
ps = await probeStand();
ok(ps.abz === '7 Tage kostenlos', 'Abzeichen am Jahresabo: ' + ps.abz);
ok(ps.knopf === '7 Tage kostenlos testen', 'Kaufknopf nennt die Probezeit: ' + ps.knopf);
ok(/7 Tage kostenlos, danach CHF 30\.00 im Jahr/.test(ps.hinweis) && /zahlst du nichts/.test(ps.hinweis), 'am Knopf: Dauer und Preis danach (3.1.2): ' + ps.hinweis);
await seite.evaluate(() => document.querySelector('#plusPreisWahl [data-laufzeit="monat"]').click());
await seite.waitForTimeout(200);
ps = await probeStand();
ok(!ps.hinweis && !/kostenlos/.test(ps.knopf), 'beim Monatsabo keine Probezeit: ' + ps.knopf);
await seite.evaluate(() => { localStorage.removeItem('__pruef_probe'); localStorage.setItem('lucenta_laufzeit', 'jahr'); });
await seite.evaluate(() => localStorage.removeItem('__pruef_preise'));

console.log('\n=== Einladung per Link legt den Freund an (Feedback B7) ===');
const freundeNamen = () => seite.evaluate(() => JSON.parse(localStorage.getItem('lucenta_freunde') || '[]').map(f => f.name + '/' + f.figur));
await seite.evaluate(() => { localStorage.removeItem('lucenta_freunde');
  localStorage.setItem('__pruef_link', 'https://lucenta.example/f#L1.240k1e1w2d.fuchs.TWFyaWU'); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(700);
let fn = await freundeNamen();
ok(fn.length === 1 && fn[0] === 'Marie/fuchs', 'Kaltstart mit Link: Marie mit Fuchs ist angelegt (' + fn.join(',') + ')');
// Seit Runde 155 wie das Einfuegen: mit eigenem Ergebnis gleich der Vergleich, sonst die Freunde-Seite.
const nachLink = await seite.evaluate(() => ({ergebnis: !!localStorage.getItem('lucenta_result'),
  ansicht: document.querySelector('.view.active').id, name: document.getElementById('vergleichName').textContent}));
ok(nachLink.ergebnis ? (nachLink.ansicht === 'view-compare' && nachLink.name === 'Marie') : nachLink.ansicht === 'view-freunde',
   'und es oeffnet sich ' + (nachLink.ergebnis ? 'der Vergleich mit Marie' : 'die Freunde-Seite') + ' (' + nachLink.ansicht + ', ' + nachLink.name + ')');
await seite.evaluate(() => window.__linkOeffnen && window.__linkOeffnen({url: 'https://lucenta.example/f#L1.240k1e1w2d.fuchs.TWFyaWU'}));
await seite.waitForTimeout(200);
ok((await freundeNamen()).length === 1, 'derselbe Link noch einmal (appUrlOpen beim Kaltstart) verdoppelt nichts');
await seite.evaluate(() => window.__linkOeffnen && window.__linkOeffnen({url: 'https://lucenta.example/f%23L1.1e2s0u1i2a.hase.Tm9haA'}));
await seite.waitForTimeout(200);
fn = await freundeNamen();
ok(fn.length === 2 && fn.includes('Noah/hase'), 'laufende App, kodierter Link: Noah kommt dazu (' + fn.join(',') + ')');
await seite.evaluate(() => window.__linkOeffnen && window.__linkOeffnen({url: 'https://lucenta.example/f#kaputt'}));
await seite.waitForTimeout(200);
ok((await freundeNamen()).length === 2, 'ein Link ohne gueltigen Code tut nichts');
await seite.evaluate(() => { localStorage.removeItem('__pruef_link'); localStorage.removeItem('lucenta_freunde'); });

console.log('\n=== Onboarding: Anmeldung als eigener, ueberspringbarer Schritt (Runde 159) ===');
await seite.evaluate(() => localStorage.removeItem('__pruef_konto'));
await seite.goto(URL + '?onboarding=1', {waitUntil: 'networkidle'}); await seite.waitForTimeout(900);
const obSchritt = () => seite.evaluate(() => [...document.querySelectorAll('#onboarding .ob-step')].find(s => !s.hidden)?.getAttribute('data-step'));
const obWeiter = async () => { await seite.evaluate(() => [...document.querySelectorAll('#onboarding .ob-step')].find(s => !s.hidden).querySelector('[data-ob-weiter]').click()); await seite.waitForTimeout(350); };
await obWeiter(); await seite.evaluate(() => document.querySelector('[data-ob-ziel]').click()); await obWeiter(); await obWeiter();
ok(await obSchritt() === '4', 'nach den Fakten kommt der Anmeldeschritt');
await obWeiter();
ok(await obSchritt() === '5', '„Spaeter" fuehrt weiter zu Name und Figur');
await seite.evaluate(() => document.getElementById('btnObZurueck').click()); await seite.waitForTimeout(350);
await seite.evaluate(() => document.getElementById('btnObApple').click()); await seite.waitForTimeout(600);
ok(await obSchritt() === '5', 'nach der Anmeldung geht es von selbst weiter');
await seite.goto(URL, {waitUntil: 'networkidle'}); await seite.waitForTimeout(500);

console.log('\n=== Konto loeschen (Richtlinie 5.1.1(v)) ===');
const kontoBild = () => seite.evaluate(() => {
  const w = document.getElementById('kontoIcloud');
  return {loeschen: !!w.querySelector('[data-konto="loeschen"]'), anmelden: !!w.querySelector('[data-konto="anmelden"]'),
          text: w.textContent, log: window.__nativLog.filter(e => e.was === 'loeschen').length};
});
await seite.evaluate(() => { localStorage.setItem('__pruef_konto', '1'); localStorage.setItem('__pruef_loeschen', 'offline'); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
let kb = await kontoBild();
ok(kb.loeschen && !kb.anmelden, 'angemeldet steht der Knopf zum Loeschen da');
seite.once('dialog', d => d.dismiss());
await seite.evaluate(() => document.querySelector('[data-konto="loeschen"]').click());
await seite.waitForTimeout(300);
kb = await kontoBild();
ok(kb.log === 0 && kb.loeschen, 'ohne Bestaetigung wird nichts geloescht');
seite.once('dialog', d => d.accept());
await seite.evaluate(() => document.querySelector('[data-konto="loeschen"]').click());
await seite.waitForTimeout(300);
kb = await kontoBild();
ok(kb.log === 1 && kb.loeschen, 'ohne Verbindung bleibt die Anmeldung, man kann es erneut versuchen');
await seite.evaluate(() => localStorage.removeItem('__pruef_loeschen'));
seite.once('dialog', d => d.accept());
await seite.evaluate(() => document.querySelector('[data-konto="loeschen"]').click());
await seite.waitForTimeout(300);
kb = await kontoBild();
ok(kb.anmelden && !kb.loeschen && /Mit Apple anmelden/.test(kb.text) && /Apple-ID/.test(kb.text),
   'danach abgemeldet, mit dem Weg zur Trennung in den iOS-Einstellungen');
await seite.evaluate(() => localStorage.removeItem('__pruef_konto'));

console.log('\n=== Einstellungen: Version aus der App, Abo verwalten nur mit Abo ===');
await seite.evaluate(() => { localStorage.removeItem('lucenta_plus'); localStorage.removeItem('__pruef_abo'); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
await seite.evaluate(() => { document.getElementById('btnDrawerToggle').click(); });
await seite.waitForTimeout(300);
await seite.evaluate(() => document.getElementById('btnDrawerSettings').click()); await seite.waitForTimeout(500);
let einst = await seite.evaluate(() => ({v: document.getElementById('einstVersion').textContent, sichtbar: !document.getElementById('einstVersion').hidden, verwalten: !document.getElementById('btnAboVerwalten').hidden,
  wieder: !document.getElementById('btnPlusWiederherstellen').hidden}));
ok(einst.v === 'Version 1.4.2' && einst.sichtbar, 'die Versionsnummer kommt aus der App, ohne Zusatz: "' + einst.v + '"');
ok(!einst.verwalten && einst.wieder, 'ohne Abo kein "Abo verwalten", "Kaeufe wiederherstellen" bleibt');
await seite.evaluate(() => { localStorage.setItem('lucenta_plus', '1'); localStorage.setItem('__pruef_abo', '1'); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
await seite.evaluate(() => { document.getElementById('btnDrawerToggle').click(); });
await seite.waitForTimeout(300);
await seite.evaluate(() => document.getElementById('btnDrawerSettings').click()); await seite.waitForTimeout(500);
ok(await seite.evaluate(() => !document.getElementById('btnAboVerwalten').hidden), 'mit Abo erscheint "Abo verwalten"');
await seite.evaluate(() => { localStorage.removeItem('lucenta_plus'); localStorage.removeItem('__pruef_abo'); });

console.log('\n=== Rueckgewinnung: ein Kauf ausserhalb des Kauffensters schaltet sofort frei ===');
await seite.evaluate(() => { localStorage.removeItem('lucenta_plus'); localStorage.removeItem('__pruef_abo'); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
ok(await seite.evaluate(() => typeof window.__aboGeaendert === 'function'), 'die App hoert auf Kaeufe, die nicht aus ihrem Fenster kommen');
await seite.evaluate(() => window.__aboGeaendert({aktiv: true, produkt: 'lucenta.plus.jahr'})); await seite.waitForTimeout(300);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') === '1'), 'ein Win-back-Kauf schaltet ohne Neustart frei');
await seite.evaluate(() => window.__aboGeaendert({aktiv: false, produkt: ''})); await seite.waitForTimeout(300);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_plus') !== '1'), 'ein Ablauf/Erstattung nimmt es ebenso sofort zurueck');

console.log('\n=== Bitte um Bewertung: einmal, wenn das erste Muster da ist ===');
const tageSaeen = (n) => seite.evaluate(n => { localStorage.removeItem('lucenta_erstes_muster'); localStorage.removeItem('lucenta_bewertung');
  localStorage.removeItem('lucenta_plus'); const h = [];
  // Kalendertage, nicht i x 24 h: an einem Tag mit Zeitumstellung fielen sonst zwei Eintraege auf denselben Tag.
  for (let i = 1; i <= n; i++){ const j = new Date(); const d = new Date(j.getFullYear(), j.getMonth(), j.getDate() - i, 12);
    h.push({day: d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'), ts: d.getTime(), energy:3, valence:4, slot:'abend'}); }
  localStorage.setItem('lucenta_state', JSON.stringify(h.reverse())); }, n);
const heuteEintragen = async () => {
  await seite.evaluate(() => document.querySelector('#landingStateEnergyRow button:nth-child(4)')?.click()); await seite.waitForTimeout(150);
  await seite.evaluate(() => document.querySelector('#landingStateValenceRow button:nth-child(3)')?.click()); };
await tageSaeen(6);
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
await seite.evaluate(() => { window.__nativLog = []; });
await heuteEintragen(); await seite.waitForTimeout(5200);
let bw = (await seite.evaluate(() => window.__nativLog)).filter(e => e.was === 'bewerten').length;
ok(bw === 1, 'am siebten Tag genau eine Bitte um Bewertung (' + bw + ')');
await tageSaeen(7);
await seite.evaluate(() => { localStorage.setItem('lucenta_erstes_muster', '1'); localStorage.setItem('lucenta_bewertung', '1'); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
await seite.evaluate(() => { window.__nativLog = []; });
await heuteEintragen(); await seite.waitForTimeout(5200);
bw = (await seite.evaluate(() => window.__nativLog)).filter(e => e.was === 'bewerten').length;
ok(bw === 0, 'danach nie wieder von selbst (' + bw + ')');
await seite.evaluate(() => { localStorage.removeItem('lucenta_state'); });

console.log('\n=== Kaufangebot nach dem Test erst, wenn die Dimensionen in den Blick kommen ===');
await seite.evaluate(() => { localStorage.removeItem('lucenta_plus_angebot'); localStorage.removeItem('lucenta_plus');
  localStorage.removeItem('lucenta_result'); localStorage.removeItem('lucenta_progress'); localStorage.removeItem('lucenta_history'); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(600);
await seite.evaluate(() => document.getElementById('btnStart')?.click()); await seite.waitForTimeout(600);
for (let i = 0; i < 50; i++){ await seite.evaluate(v => document.querySelector('#scaleRow button:nth-child(' + v + ')')?.click(), 1 + (i * 3) % 5); await seite.waitForTimeout(260); }
await seite.waitForTimeout(3000);
const amErgebnis = await seite.evaluate(() => document.querySelector('.view.active')?.id);
await seite.evaluate(() => window.scrollTo(0, 0)); await seite.waitForTimeout(5000);
const zuFrueh = await seite.evaluate(() => document.getElementById('plusModal').classList.contains('open'));
ok(amErgebnis === 'view-result' && !zuFrueh, 'oben auf dem Ergebnis kommt nach 5 s noch kein Fenster (' + amErgebnis + ', offen: ' + zuFrueh + ')');
await seite.evaluate(() => { document.getElementById('traitsList').scrollIntoView({block:'center'}); window.dispatchEvent(new Event('scroll')); });
await seite.waitForTimeout(2200);
ok(await seite.evaluate(() => document.getElementById('plusModal').classList.contains('open')), 'nach dem Scrollen zu den Dimensionen erscheint es');

console.log('\n=== Der Bestand wird auf dem Geraet gespiegelt ===');
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(400);
let spiegel = await seite.evaluate(() => window.__bestand);
ok(spiegel.length >= 1 && Object.keys(spiegel[0]).every(k => k.indexOf('lucenta_') === 0),
  'beim Start einmal gemeldet, nur lucenta_-Schluessel (' + spiegel.length + ')');
await seite.waitForTimeout(1500);   // Schreibzugriffe des Starts sind dann gemeldet
await seite.evaluate(() => { window.__bestand = []; localStorage.setItem('lucenta_pruef_spiegel', 'a'); localStorage.setItem('lucenta_pruef_spiegel', 'b'); localStorage.setItem('__fremd', '1'); });
await seite.waitForTimeout(300);
ok((await seite.evaluate(() => window.__bestand.length)) === 0, 'nicht bei jedem Schreiben sofort, sondern gesammelt');
await seite.waitForTimeout(1100);
spiegel = await seite.evaluate(() => window.__bestand);
ok(spiegel.length === 1 && spiegel[0].lucenta_pruef_spiegel === 'b' && !('__fremd' in spiegel[0]),
  'eine Meldung mit dem letzten Stand, ohne fremde Schluessel (' + spiegel.length + ')');
await seite.evaluate(() => { window.__bestand = []; localStorage.removeItem('lucenta_pruef_spiegel'); localStorage.removeItem('__fremd');
  Object.defineProperty(document, 'visibilityState', {value: 'hidden', configurable: true}); document.dispatchEvent(new Event('visibilitychange'));
  delete document.visibilityState; });
spiegel = await seite.evaluate(() => window.__bestand);
ok(spiegel.length === 1 && !('lucenta_pruef_spiegel' in spiegel[0]), 'Loeschen wird gespiegelt, beim Verlassen der App sofort');

console.log('\n=== Tagesform-Widget: Stand melden, Eintraege uebernehmen ===');
await seite.evaluate(() => { localStorage.removeItem('lucenta_state'); window.__widget = []; });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(500);
let wl = await seite.evaluate(() => window.__widget);
ok(wl.some(m => m.abholen) && wl.some(m => m.stand && m.stand.tag && typeof m.stand.eintraege === 'object'),
  'beim Start: Eingang abholen und Stand melden');
await seite.evaluate(() => { window.__widget = []; const t = Date.now();
  window.lucentaWidgetEingang([{ts: t - 1000, energy: 2, valence: 5}, {ts: t, energy: 9, valence: 1}, {ts: 'x'}]); });
await seite.waitForTimeout(200);
const tf = await seite.evaluate(() => JSON.parse(localStorage.getItem('lucenta_state') || '[]'));
wl = await seite.evaluate(() => window.__widget);
ok(tf.length === 1 && tf[0].energy === 2 && tf[0].valence === 5, 'gueltiger Widget-Eintrag uebernommen, ungueltiger nicht (' + tf.length + ')');
ok(wl.some(m => m.verarbeitet && m.verarbeitet.length === 2), 'beide Zahlen-Eintraege quittiert, auch der verworfene');
ok(wl.some(m => m.stand && Object.values(m.stand.eintraege).some(w => w.energy === 2)), 'der neue Stand geht ans Widget');
await seite.evaluate(() => { window.__widget = []; window.lucentaWidgetEingang([{ts: Date.now() - 864e5 * 5, energy: 3, valence: 3}]); });
ok((await seite.evaluate(() => JSON.parse(localStorage.getItem('lucenta_state')).length)) === 1, 'ein Eintrag aelter als drei Tage wird verworfen');

console.log('\n=== Apple Health: nur auf Wunsch, nur schreiben ===');
await seite.evaluate(() => { localStorage.removeItem('lucenta_state'); localStorage.removeItem('lucenta_health'); localStorage.removeItem('__pruef_health'); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(500);
ok(await seite.evaluate(() => !document.getElementById('healthZeile').hidden), 'die Zeile erscheint in der App');
ok(await seite.evaluate(() => document.getElementById('healthSchalter').getAttribute('aria-checked') === 'false'), 'Vorgabe aus');
await seite.evaluate(() => { window.__nativLog = []; }); await heuteEintragen(); await seite.waitForTimeout(300);
ok(!(await seite.evaluate(() => window.__nativLog)).some(e => e.was === 'health_schreiben'), 'aus: nichts geht nach Health');
await seite.evaluate(() => document.getElementById('healthSchalter').click()); await seite.waitForTimeout(200);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_health') !== 'an'), 'Erlaubnis verweigert: bleibt aus');
await seite.evaluate(() => { localStorage.setItem('__pruef_health', '1'); document.getElementById('healthSchalter').click(); }); await seite.waitForTimeout(200);
ok(await seite.evaluate(() => localStorage.getItem('lucenta_health') === 'an'), 'Erlaubnis erteilt: an');
await seite.evaluate(() => { window.__nativLog = []; localStorage.removeItem('lucenta_state'); });
await seite.evaluate(() => { const t = Date.now(); window.lucentaWidgetEingang([{ts: t - 2000, energy: 4, valence: 2}]); }); await seite.waitForTimeout(200);
let hl = (await seite.evaluate(() => window.__nativLog)).filter(e => e.was === 'health_schreiben');
ok(hl.length === 1 && hl[0].arg.valence === 2, 'an: der Eintrag geht mit seiner Stimmung nach Health');
ok(await seite.evaluate(() => JSON.parse(localStorage.getItem('lucenta_state')).some(e => /^U/.test(e.hk || ''))), 'die Health-Kennung steht am Eintrag');
await seite.evaluate(() => { window.__nativLog = []; window.lucentaWidgetEingang([{ts: Date.now() - 1000, energy: 5, valence: 5}]); }); await seite.waitForTimeout(200);
const lg = await seite.evaluate(() => window.__nativLog);
ok(lg.some(e => e.was === 'health_loeschen' && /^U/.test(e.arg.uuid)) && lg.some(e => e.was === 'health_schreiben'),
  'Ersetzen loescht den alten Health-Eintrag und schreibt den neuen');
await seite.evaluate(() => { document.getElementById('healthSchalter').click(); localStorage.removeItem('lucenta_state'); localStorage.removeItem('__pruef_health'); });

await seite.evaluate(() => { window.__widget = []; window.lucentaWidgetAbholen && window.lucentaWidgetAbholen(); });
ok((await seite.evaluate(() => typeof window.lucentaWidgetLink === 'function' && window.__widget.some(m => m.abholen))),
  'Kurzbefehl bei offener App: die Huelle kann das Abholen anstossen und die Tagesform oeffnen');
console.log('\n=== Widget-Link oeffnet die Tagesform ===');
await seite.evaluate(() => { window.__linkOeffnen && window.__linkOeffnen({url: 'lucenta://tagesform'}); }).catch(() => {});
await seite.waitForTimeout(600);
ok((await seite.evaluate(() => document.querySelector('.view.active')?.id)) === 'view-state', 'lucenta://tagesform zeigt die Tagesform');

console.log('\n=== App-Sperre: frei, Zeitpunkt waehlbar ===');
await seite.evaluate(() => { ['__pruef_sperre','__pruef_sperre_ok','__pruef_sperre_nach'].forEach(k => localStorage.removeItem(k)); });
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(500);
await seite.evaluate(() => document.getElementById('btnDrawerToggle').click()); await seite.waitForTimeout(300);
await seite.evaluate(() => { window.__nativLog = []; document.getElementById('btnDrawerSettings').click(); }); await seite.waitForTimeout(500);
let sp = await seite.evaluate(() => ({zeile: !document.getElementById('sperreZeile').hidden, nach: !document.getElementById('sperreNachZeile').hidden,
  titel: document.getElementById('sperreTitel').textContent}));
ok(sp.zeile && !sp.nach && sp.titel === 'Mit Face ID sperren', 'Zeile mit der Art des Geraets, Zeitwahl erst wenn an (' + sp.titel + ')');
ok((await seite.evaluate(() => window.__nativLog)).some(e => e.was === 'sperre_texte' && e.arg.knopf === 'Entsperren'), 'die Texte der Decke gehen in der Sprache der App an die Huelle');
await seite.evaluate(() => document.getElementById('sperreSchalter').click()); await seite.waitForTimeout(200);
ok(await seite.evaluate(() => document.getElementById('sperreSchalter').getAttribute('aria-checked') === 'false'), 'Entsperren misslingt: bleibt aus');
await seite.evaluate(() => { localStorage.setItem('__pruef_sperre_ok', '1'); document.getElementById('sperreSchalter').click(); }); await seite.waitForTimeout(200);
sp = await seite.evaluate(() => ({an: document.getElementById('sperreSchalter').getAttribute('aria-checked'), nach: !document.getElementById('sperreNachZeile').hidden}));
ok(sp.an === 'true' && sp.nach, 'Entsperren gelingt: an, die Zeitwahl erscheint');
await seite.evaluate(() => document.querySelector('#sperreNach [data-nach="900"]').click()); await seite.waitForTimeout(200);
ok(await seite.evaluate(() => document.querySelector('#sperreNach [data-nach="900"]').getAttribute('aria-checked') === 'true'), 'Nach 15 Min. gewaehlt und angezeigt');
await seite.evaluate(() => document.getElementById('sperreSchalter').click()); await seite.waitForTimeout(200);
ok(await seite.evaluate(() => document.getElementById('sperreNachZeile').hidden), 'ausgeschaltet: Zeitwahl verschwindet');
await seite.evaluate(() => { ['__pruef_sperre','__pruef_sperre_ok','__pruef_sperre_nach'].forEach(k => localStorage.removeItem(k)); });

console.log('\n=== Notiz, Jahr und Monatsrueckblick (Tagesform) ===');
await tageSaeen(45);
await seite.evaluate(() => { localStorage.setItem('lucenta_plus', '1'); localStorage.setItem('__pruef_abo', '1'); });   // sonst nimmt der Stand beim Start Lucenta+ weg
await seite.reload({waitUntil: 'networkidle'}); await seite.waitForTimeout(500);
await seite.evaluate(() => { document.getElementById('btnDrawerToggle').click(); });
await seite.waitForTimeout(300);
await seite.evaluate(() => { document.getElementById('btnDrawerState').click(); }); await seite.waitForTimeout(700);
await seite.evaluate(() => { document.querySelector('#stateEnergyRow button:nth-child(4)')?.click(); document.querySelector('#stateValenceRow button:nth-child(2)')?.click();
  document.getElementById('tfNotiz').value = '  Langer   Spaziergang \n am See  ' + 'x'.repeat(300); document.getElementById('btnStateSave').click(); });
await seite.waitForTimeout(1500);
const nz = await seite.evaluate(() => JSON.parse(localStorage.getItem('lucenta_state')).slice(-1)[0].notiz || '');
ok(nz.indexOf('Langer Spaziergang am See') === 0 && nz.length === 200, 'Notiz gespeichert, Leerraum zusammengefasst, auf 200 Zeichen begrenzt (' + nz.length + ')');
ok(await seite.evaluate(() => document.getElementById('tfNotiz').value === ''), 'nach dem Speichern ist das Feld leer');
await seite.evaluate(() => document.querySelector('[data-reiter="kalender"]').click()); await seite.waitForTimeout(400);
await seite.evaluate(() => (() => { const d = new Date(), k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    document.querySelector('[data-kal-tag="' + k + '"]')?.click(); })()); await seite.waitForTimeout(300);
ok(await seite.evaluate(() => /Langer Spaziergang/.test(document.querySelector('.tf-kal-details')?.textContent || '')), 'die Notiz steht in den Tagesdetails des Kalenders');
await seite.evaluate(() => document.querySelector('[data-kal-ansicht="jahr"]').click()); await seite.waitForTimeout(300);
ok((await seite.evaluate(() => document.querySelectorAll('.tf-jahr-monat').length)) === 12, 'Jahresansicht mit zwoelf Monaten');
await seite.evaluate(() => document.querySelector('[data-jahr-monat="' + (new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).getMonth()) + '"]')?.click()); await seite.waitForTimeout(300);
const rbk = await seite.evaluate(() => ({ansicht: !!document.querySelector('.tf-kal-raster'), rb: document.querySelector('.tf-kal-karte .tf-rb')?.textContent || ''}));
ok(rbk.ansicht && /4,0|4\.0/.test(rbk.rb), 'Tipp auf einen Monat oeffnet ihn, darunter der Rueckblick mit echten Zahlen (' + JSON.stringify(rbk).slice(0, 160) + ')');
await seite.evaluate(() => { localStorage.removeItem('lucenta_plus'); localStorage.removeItem('__pruef_abo'); localStorage.removeItem('lucenta_state'); });

ok(ausnahmen.length === 0, 'keine Ausnahme in der Konsole: ' + ausnahmen.join(' | '));

await browser.close();
console.log('\n======================================================');
console.log(fehlschlaege === 0
  ? 'ALLE ' + pruefungen + ' PRUEFUNGEN BESTANDEN'
  : fehlschlaege + ' von ' + pruefungen + ' PRUEFUNGEN FEHLGESCHLAGEN');
console.log('======================================================');
process.exit(fehlschlaege ? 1 : 0);

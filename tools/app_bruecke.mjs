// Gemeinsame Grundlage aller Pruefwerkzeuge: Sie laden die App-Fassung (dist/index.html, wie im App-Bundle)
// mit nachgestellter App-Bruecke — eine Browser-Fassung gibt es nicht (Entscheidung des Inhabers).
//
//   import { APP_URL, alsApp } from './app_bruecke.mjs';
//   const ctx = await browser.newContext(...); await alsApp(ctx); const p = await ctx.newPage(); await p.goto(APP_URL);
//
// Apples Tab-Leiste zeichnet in der App die Huelle (LucentaTabLeistePlugin.swift). Hier steht sie als fuenf
// unsichtbare Knoepfe nach (#tabStart … #tabProfil), die denselben Weg nehmen wie ein Tipp auf die echte.

export const APP_BASIS = process.env.LUCENTA_BASIS || 'http://127.0.0.1:8017';
export const APP_URL = process.env.LUCENTA_URL || `${APP_BASIS}/index.html`;

// Die Bruecke, wie MainViewController sie anmeldet. `plus`: true/false = Antwort des Stores; null = der Store
// bestaetigt, was lokal steht (Werkzeuge, die Lucenta+ selbst ueber localStorage setzen).
export function appBruecke(plus){
  const ok = (v) => Promise.resolve(v), weg = () => ok({ remove(){} });
  const aktiv = () => plus === null ? localStorage.getItem('lucenta_plus') === '1' : !!plus;
  const sperre = { verfuegbar:true, art:'faceID', an:true, nach:60 };
  window.webkit = { messageHandlers: { lucentaBestand:{ postMessage(){} }, lucentaWidget:{ postMessage(){} } } };
  window.Capacitor = { isNativePlatform: () => true, getPlatform: () => 'ios', Plugins: {
    LocalNotifications: { requestPermissions: () => ok({display:'granted'}), checkPermissions: () => ok({display:'granted'}),
      schedule: () => ok(), cancel: () => ok(), getPending: () => ok({notifications:[]}), addListener: weg },
    StoreKit: { stand: () => ok(aktiv() ? {aktiv:true, produkt:'lucenta.plus.jahr'} : {aktiv:false}), preise: () => ok({}),
      kaufen: () => ok({abgebrochen:true}), restorePurchases: () => ok({aktiv: aktiv()}), verwalten: () => ok(),
      bewerten: () => ok(), addListener: weg },
    App: { getInfo: () => ok({version:'1.0', build:'1'}), getLaunchUrl: () => ok({}), addListener: weg, openUrl: () => ok() },
    Health: { stand: () => ok({verfuegbar:true, erlaubt:false}), erlauben: () => ok({erlaubt:false}) },
    Lock: { stand: () => ok(sperre), setzen: () => ok(sperre), texte: () => ok({}) },
    Account: { stand: () => ok({angemeldet:false, icloud:true}), anmelden: () => ok({angemeldet:false}) },
    AppSymbol: { stand: () => ok({verfuegbar:true, name:''}), setzen: (o) => ok({name:o.name}) },
    Tabs: { einrichten: () => ok({hoehe: 83}), setzen: (o) => { window.__tabs = o; return ok(); },
      addListener: (name, f) => { if (name === 'gewaehlt') window.__tabGewaehlt = f; return weg(); } },
  } };
}

// Die fuenf Reiter der nativen Leiste als unsichtbare Knoepfe, 8 px gross am unteren Rand nebeneinander,
// ausserhalb jeder Ansicht — die Fehlersuche misst sie nicht mit.
export function tabKnoepfe(){
  const REITER = [['tabStart','landing'], ['tabTagesform','state'], ['tabVerstehen','understand'], ['tabFreunde','freunde'], ['tabProfil','profile']];
  const bauen = () => {
    if (document.getElementById('__nativeTabs')) return;
    const box = document.createElement('div');
    box.id = '__nativeTabs';
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:fixed;left:0;bottom:0;width:40px;height:8px;z-index:2147483647;display:flex;opacity:0;';
    REITER.forEach(([id, ziel]) => {
      const b = document.createElement('div');
      b.id = id; b.style.cssText = 'width:8px;height:8px;';
      b.addEventListener('click', () => { if (window.__tabGewaehlt) window.__tabGewaehlt({id: ziel}); });
      box.appendChild(b);
    });
    document.body.appendChild(box);
  };
  if (document.body) bauen(); else document.addEventListener('DOMContentLoaded', bauen);
}

export async function alsApp(ctx, { plus = null, bruecke = true } = {}){
  if (bruecke) await ctx.addInitScript(appBruecke, plus);
  await ctx.addInitScript(tabKnoepfe);
}

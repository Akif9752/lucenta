// Wie unter den Pruefwerkzeugen gilt Automatisierung: Die App startet auf Deutsch (geraeteSprache).
Object.defineProperty(globalThis, 'navigator', {value: {webdriver: true, language: 'de-DE', languages: ['de-DE']}, configurable: true, writable: true});
// --- minimal stubs so the core can load outside a browser ---
var __store = {};
global.localStorage = {
  getItem:function(k){ return Object.prototype.hasOwnProperty.call(__store,k)?__store[k]:null; },
  setItem:function(k,v){ __store[k]=String(v); },
  removeItem:function(k){ delete __store[k]; }
};
global.window = { addEventListener:function(){}, matchMedia:function(){ return {matches:false}; }, scrollY:0 };
global.document = { getElementById:function(){ return null; }, addEventListener:function(){}, querySelector:function(){ return null; },
  querySelectorAll:function(){ return []; }, documentElement:{ setAttribute:function(){}, removeAttribute:function(){}, lang:'' },
  createElement:function(){ return {style:{},setAttribute:function(){},addEventListener:function(){},appendChild:function(){},classList:{add:function(){},remove:function(){}}}; } };
global.requestAnimationFrame = function(){};
global.Intl = Intl;

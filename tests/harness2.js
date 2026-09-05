var __store = {};
global.localStorage = {
  getItem:function(k){ return Object.prototype.hasOwnProperty.call(__store,k)?__store[k]:null; },
  setItem:function(k,v){ __store[k]=String(v); }, removeItem:function(k){ delete __store[k]; }
};
// --- Mini-DOM: reicht, um showView() und die Landing-Renderer echt auszufuehren ---
var __els = {};
function mkEl(id){
  var e = { id:id, style:{}, _cls:{}, textContent:'', innerHTML:'', dataset:{}, onclick:null, value:'', offsetParent:{},
    classList:{ add:function(c){e._cls[c]=1;}, remove:function(c){delete e._cls[c];},
      contains:function(c){return !!e._cls[c];}, toggle:function(c,on){ if(on)e._cls[c]=1; else delete e._cls[c]; } },
    setAttribute:function(k,v){ e['attr_'+k]=v; }, getAttribute:function(k){ return e['attr_'+k]; }, removeAttribute:function(k){ delete e['attr_'+k]; }, hasAttribute:function(k){ return Object.prototype.hasOwnProperty.call(e,'attr_'+k); },
    addEventListener:function(){}, appendChild:function(){}, focus:function(){},
    querySelectorAll:function(){ return []; }, querySelector:function(){ return null; },
    scrollIntoView:function(){}, closest:function(){ return null; } };
  return e;
}
function el(id){ if(!__els[id]) __els[id]=mkEl(id); return __els[id]; }
global.__els = __els; global.el = el;
global.window = { addEventListener:function(){}, matchMedia:function(){ return {matches:true}; }, scrollY:0, scrollTo:function(){} };
global.document = { getElementById:function(id){ return el(id); }, addEventListener:function(){},
  querySelector:function(){ return el('__header'); },
  querySelectorAll:function(sel){ return sel==='.view' ? ['landing','quiz','result','archetypes','state','profile','settings','compat-archive','understand'].map(function(n){return el('view-'+n);}) : []; },
  documentElement:{ setAttribute:function(){}, removeAttribute:function(){}, lang:'' },
  createElement:function(){ return mkEl('tmp'); } };
global.requestAnimationFrame=function(){}; global.setTimeout=function(){};

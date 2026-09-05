var __store={};
global.localStorage={getItem:k=>Object.prototype.hasOwnProperty.call(__store,k)?__store[k]:null,
  setItem:(k,v)=>{__store[k]=String(v)},removeItem:k=>{delete __store[k]}};
// --- Verlaufs-Nachbildung mit echtem Stapel ---
var stack=[], idx=-1, popHandlers=[];
global.history={
  pushState(s){ stack=stack.slice(0,idx+1); stack.push(s); idx=stack.length-1; },
  replaceState(s){ if(idx<0){stack=[s];idx=0;} else stack[idx]=s; },
  back(){ if(idx>0){ idx--; popHandlers.forEach(h=>h({state:stack[idx]})); } else { global.__leftApp=true; } },
  get __stack(){return stack;}, get __idx(){return idx;}
};
var __els={};
function mkEl(id){
  var e={id:id,style:{},_cls:{},textContent:'',innerHTML:'',dataset:{},value:'',offsetParent:{},
    classList:{add(c){e._cls[c]=1},remove(c){delete e._cls[c]},contains(c){return !!e._cls[c]},toggle(c,on){on?e._cls[c]=1:delete e._cls[c]}},
    setAttribute(k,v){e['a_'+k]=v},getAttribute(k){return e['a_'+k]},removeAttribute(k){delete e['a_'+k]},
    addEventListener(){},appendChild(){},focus(){global.__focused=id},querySelectorAll(){return[]},querySelector(){return null},
    scrollIntoView(){},closest(){return null},parentNode:null};
  return e;
}
function el(id){ if(!__els[id]) __els[id]=mkEl(id); return __els[id]; }
global.el=el; global.__els=__els;
global.window={addEventListener(t,f){ if(t==='popstate') popHandlers.push(f); },matchMedia(){return{matches:false}},scrollY:0,scrollTo(o){ global.window.scrollY=(o&&o.top)||0; }};
global.document={getElementById:el,addEventListener(){},removeEventListener(){},querySelector(){return el('__h')},
  querySelectorAll(s){return s==='.view'?['landing','quiz','result','archetypes','state','profile','settings','compat-archive','understand'].map(n=>el('view-'+n)):[]},
  documentElement:{setAttribute(){},removeAttribute(){},lang:'',getAttribute(){return null}},
  createElement:mkEl, head:{appendChild(){}}, title:'', body:{style:{}}};
global.requestAnimationFrame=function(){}; global.setTimeout=function(){};

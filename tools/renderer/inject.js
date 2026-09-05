// Erzeugt die vom JavaScript befuellten Inhalte der Startseite als HTML-Schnipsel.
var __store={};
global.localStorage={getItem:k=>Object.prototype.hasOwnProperty.call(__store,k)?__store[k]:null,
  setItem:(k,v)=>{__store[k]=String(v)},removeItem:k=>{delete __store[k]}};
var reg={};
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function mk(tag){
  var e={tag:tag,_html:'',_text:'',attrs:{},style:{},dataset:{},kids:[],
    classList:{add(c){e.attrs['class']=((e.attrs['class']||'')+' '+c).trim()},
               remove(c){e.attrs['class']=((e.attrs['class']||'').split(/\s+/).filter(x=>x&&x!==c).join(' '))},
               contains(c){return (e.attrs['class']||'').split(/\s+/).includes(c)},
               toggle(){}},
    setAttribute(k,v){e.attrs[k]=v}, getAttribute(k){return e.attrs[k]},
    addEventListener(){}, focus(){}, scrollIntoView(){}, closest(){return null},
    querySelectorAll(){return []}, querySelector(){return null},
    appendChild(c){e.kids.push(c); e._html+=c.outerHTML();},
    get className(){return e.attrs['class']||''}, set className(v){e.attrs['class']=v;},
    get open(){return 'open' in e.attrs}, set open(v){ if(v) e.attrs['open']=''; else delete e.attrs['open']; },
    outerHTML(){
      var a=Object.keys(e.attrs).map(k=>' '+k+'="'+esc(e.attrs[k])+'"').join('');
      return '<'+e.tag+a+'>'+(e._html||esc(e._text))+'</'+e.tag+'>';
    }};
  Object.defineProperty(e,'innerHTML',{get(){return e._html;},set(v){e._html=v;e.kids=[];}});
  Object.defineProperty(e,'textContent',{get(){return e._text;},set(v){e._text=v;e._html='';}});
  return e;
}
function el(id){ if(!reg[id]) {reg[id]=mk('div'); reg[id].attrs.id=id;} return reg[id]; }
global.window={addEventListener(){},matchMedia(){return{matches:false}},scrollY:0,scrollTo(){}};
global.document={getElementById:el,addEventListener(){},querySelector(){return el('__h')},
  querySelectorAll(s){return s==='.view'?['landing','quiz','result','archetypes','state','profile','settings','compat-archive','understand'].map(n=>el('view-'+n)):[]},
  documentElement:{setAttribute(){},removeAttribute(){},lang:''},createElement:mk};
global.requestAnimationFrame=function(){}; global.setTimeout=function(){};

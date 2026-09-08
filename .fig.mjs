import { createRequire } from 'module';
import { execSync } from 'child_process';
const require_ = createRequire(import.meta.url);
let pkg; try{ pkg = require_('playwright'); }catch(e){ pkg = require_(execSync('npm root -g',{encoding:'utf8'}).trim()+'/playwright'); }
const { chromium } = pkg;
const b = await chromium.launch();
const p = await b.newPage({viewport:{width:390,height:844}});
await p.goto('http://127.0.0.1:8017/lucenta.html',{waitUntil:'networkidle'}); await p.waitForTimeout(400);
await p.evaluate(()=>document.getElementById('btnDrawerToggle')?.click());
await p.waitForTimeout(300);
await p.evaluate(()=>document.getElementById('btnDrawerProfileRow')?.click());
await p.waitForTimeout(600);
const von = Number(process.argv[3]||0), bis = Number(process.argv[4]||8);
const svgs = await p.evaluate(([v,z])=>[...document.querySelectorAll('[data-figur]')].filter(b=>b.getAttribute('data-figur'))
  .slice(v,z).map(k=>({id:k.getAttribute('data-figur'), s:new XMLSerializer().serializeToString(k.querySelector('svg'))})), [von,bis]);
const html='<body style="margin:0;background:#EDEEE6;display:grid;grid-template-columns:repeat(4,1fr)">'+
  svgs.map(x=>'<div style="width:210px;height:210px">'+x.s.replace('<svg','<svg width="210" height="210"')+'</div>').join('')+'</body>';
const q = await b.newPage({viewport:{width:840,height:Math.ceil(svgs.length/4)*210}});
await q.setContent(html); await q.waitForTimeout(400);
await q.screenshot({path: process.argv[2]});
await b.close();
console.log(svgs.map(x=>x.id).join(', '));

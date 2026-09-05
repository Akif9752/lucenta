import re
from css import parse_css, match

INHERIT={'color','font-family','font-size','font-weight','font-style','line-height',
         'letter-spacing','text-align','text-transform','font-variant-numeric','text-wrap',
         'overflow-wrap','word-wrap','word-break','hyphens'}
BLOCK={'div','section','p','h1','h2','h3','h4','main','aside','header','footer','details','summary',
       'ul','li','nav','figure','article','#root','body','html'}
INLINE={'span','b','strong','em','i','a','small','code','sub','sup','svg','use','br'}

def hex2rgb(c):
    c=c.strip().lstrip('#')
    if len(c)==3: c=''.join(ch*2 for ch in c)
    if len(c)==8: c=c[:6]
    try: return tuple(int(c[i:i+2],16) for i in (0,2,4))
    except: return (0,0,0)

def parse_color(v, tokens, depth=0):
    if v is None or depth>6: return None
    v=v.strip()
    if v.startswith('var('): 
        r=resolve_var(v,tokens,depth+1)
        return parse_color(r,tokens,depth+1) if r else None
    if v.startswith('#'): return hex2rgb(v)
    m=re.match(r'rgba?\(([^)]*)\)',v)
    if m:
        parts=[p.strip() for p in re.split(r'[,\s/]+',m.group(1)) if p.strip()]
        try:
            rgb=tuple(int(float(p)) for p in parts[:3])
            if len(parts)>3:
                a=float(parts[3]); return rgb+(a,)
            return rgb
        except: return None
    m=re.match(r'color-mix\(\s*in\s+srgb\s*,(.*)\)$',v,re.S)
    if m:
        inner=m.group(1)
        segs=split_top(inner,',')
        if len(segs)>=2:
            a=segs[0].strip(); b=segs[1].strip()
            pm=re.search(r'([\d.]+)%\s*$',a)
            p=float(pm.group(1))/100 if pm else .5
            ca=parse_color(re.sub(r'[\d.]+%\s*$','',a).strip(),tokens,depth+1)
            cb_s=re.sub(r'[\d.]+%\s*$','',b).strip()
            cb=parse_color(cb_s,tokens,depth+1) if cb_s!='transparent' else None
            if ca is None: return None
            if cb is None: return ca[:3]+( p,) if cb_s=='transparent' else ca
            return tuple(round(ca[i]*p+cb[i]*(1-p)) for i in range(3))
    m=re.match(r'linear-gradient\(([^)]*)\)',v)
    if m:
        for seg in split_top(m.group(1),','):
            seg=seg.strip()
            if seg.startswith(('#','rgb','var(','color-mix')):
                c=parse_color(re.sub(r'\s+[\d.]+%$','',seg),tokens,depth+1)
                if c: return c
    named={'transparent':None,'white':(255,255,255),'black':(0,0,0),'inherit':None,'none':None,'currentcolor':None}
    return named.get(v.lower(),None)

def split_top(s,sep):
    out=[];d=0;cur=''
    for ch in s:
        if ch=='(':d+=1
        if ch==')':d-=1
        if ch==sep and d==0: out.append(cur);cur=''
        else: cur+=ch
    out.append(cur); return out

def resolve_var(v,tokens,depth=0):
    if depth>8: return None
    def rep(m):
        inner=m.group(1)
        segs=split_top(inner,',')
        name=segs[0].strip()
        val=tokens.get(name)
        if val is None and len(segs)>1: val=','.join(segs[1:]).strip()
        return val if val is not None else ''
    prev=None; out=v
    while 'var(' in out and out!=prev and depth<8:
        prev=out
        out=re.sub(r'var\(([^()]*(?:\([^()]*\)[^()]*)*)\)',rep,out)
        depth+=1
    return out

def num(v, base=16.0, root=16.0, vw=390.0, vh=844.0, pct_base=None):
    """px-Wert aus CSS-Laenge."""
    if v is None: return None
    v=str(v).strip()
    m=re.match(r'^(-?[\d.]+)(px|em|rem|%|ch|vw|vh)?$',v)
    if not m: return None
    x=float(m.group(1)); u=m.group(2) or 'px'
    if u=='px': return x
    if u in ('em',): return x*base
    if u=='rem': return x*root
    if u=='ch': return x*base*0.52
    if u=='vw': return x*vw/100
    if u=='vh': return x*vh/100
    if u=='%': return x/100*pct_base if pct_base is not None else None
    return x

def eval_len(v, base, vw, pct_base=None):
    if v is None: return None
    v=v.strip()
    m=re.match(r'clamp\((.*)\)$',v,re.S)
    if m:
        a,b,c=[s.strip() for s in split_top(m.group(1),',')]
        lo=num(a,base,vw=vw); pref=num(b,base,vw=vw); hi=num(c,base,vw=vw)
        if None in (lo,pref,hi): return lo or pref or hi
        return max(lo,min(pref,hi))
    m=re.match(r'min\((.*)\)$',v,re.S)
    if m:
        vals=[num(s.strip(),base,vw=vw,pct_base=pct_base) for s in split_top(m.group(1),',')]
        vals=[x for x in vals if x is not None]
        return min(vals) if vals else None
    # env(name, fallback) — ohne Gerätekontext gilt der Ersatzwert, wie im Browser ohne Aussparung
    def _env(mm):
        parts=split_top(mm.group(1),',')
        return parts[1].strip() if len(parts)>1 else '0px'
    if 'env(' in v:
        v=re.sub(r'env\(([^()]*)\)',_env,v)
    m=re.match(r'calc\((.*)\)$',v,re.S)
    if m:
        expr=m.group(1)
        # nur Summen/Differenzen von Längen — mehr braucht diese App nicht
        toks=re.split(r'\s+([+-])\s+',expr.strip())
        if toks:
            total=num(toks[0].strip(),base,vw=vw,pct_base=pct_base)
            if total is None: return None
            i=1
            while i+1<len(toks):
                op=toks[i]; nxt=num(toks[i+1].strip(),base,vw=vw,pct_base=pct_base)
                if nxt is None: return None
                total = total+nxt if op=='+' else total-nxt
                i+=2
            return total
        return None
    return num(v,base,vw=vw,pct_base=pct_base)

def build_tokens(rules, dark=False):
    tok={}
    for _,_,sel,decls in rules:
        s=sel.strip()
        if not s.startswith(':root'): continue
        if 'data-theme="light"' in s: continue
        if 'data-theme="dark"' in s and not dark: continue
        for k,v in decls.items():
            if k.startswith('--'): tok[k]=v
    return tok

def cascade(root, rules, tokens, vw=390.0):
    # Regeln aus @media-Bloecken bekamen bei der Rekursion eigene, bei 0 beginnende
    # Reihenfolgenummern und verloren dadurch gegen spaeter stehende Basisregeln.
    # Die Position in der flachen Liste ist die tatsaechliche Dokumentreihenfolge.
    rules=[(sp,i,sel,d) for i,(sp,_,sel,d) in enumerate(rules)]
    ordered=sorted(rules,key=lambda r:(r[0],r[1]))
    def walk(n):
        yield n
        for k in n.kids: yield from walk(k)
    for n in walk(root):
        if n.tag=='#text':
            p=n.parent.style if n.parent else {}
            st={k:p[k] for k in INHERIT if k in p}
            st['_fs']=p.get('_fs',16.0)
            st['display']='inline'
            n.style=st
            continue
        own={}
        for _,_,sel,decls in ordered:
            if match(n,sel): own.update(decls)
        inl=n.attrs.get('style')
        if inl:
            from css import parse_decls
            own.update(parse_decls(inl))
        st={}
        if n.parent is not None:
            for k in INHERIT:
                if k in n.parent.style: st[k]=n.parent.style[k]
        for k,v in own.items():
            if k.startswith('--'): continue
            vv=resolve_var(v,tokens) if 'var(' in v else v
            if isinstance(vv,str) and vv.strip()=='inherit':
                par=n.parent.style.get(k) if n.parent is not None else None
                if par is not None: vv=par
                else: continue
            st[k]=vv
        if 'display' not in st:
            st['display']='inline' if n.tag in INLINE else ('block' if n.tag in BLOCK else 'inline-block')
        # Schriftgroesse aufloesen (relativ zum Elternwert)
        pfs=float(n.parent.style.get('_fs',16.0)) if n.parent is not None else 16.0
        fs=st.get('font-size')
        v=eval_len(fs,pfs,vw) if fs else None
        st['_fs']=v if v else pfs
        n.style=st
    return root

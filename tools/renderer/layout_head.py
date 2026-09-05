import re
from PIL import ImageFont
from style import parse_color, eval_len, num

FD='/usr/share/fonts/truetype/dejavu/'
FONTS={('serif',0,0):FD+'DejaVuSerif.ttf',('serif',1,0):FD+'DejaVuSerif-Bold.ttf',
       ('serif',0,1):FD+'DejaVuSerif-Italic.ttf',('serif',1,1):FD+'DejaVuSerif-BoldItalic.ttf',
       ('sans',0,0):FD+'DejaVuSans.ttf',('sans',1,0):FD+'DejaVuSans-Bold.ttf',
       ('sans',0,1):FD+'DejaVuSans-Oblique.ttf',('sans',1,1):FD+'DejaVuSans-BoldOblique.ttf',
       ('mono',0,0):FD+'DejaVuSansMono.ttf',('mono',1,0):FD+'DejaVuSansMono-Bold.ttf',
       ('mono',0,1):FD+'DejaVuSansMono-Oblique.ttf',('mono',1,1):FD+'DejaVuSansMono-BoldOblique.ttf'}
_cache={}
def font_for(st):
    fam=(st.get('font-family') or '').lower()
    fam='mono' if ('mono' in fam or 'plex' in fam) else ('serif' if ('fraunces' in fam or 'serif' in fam or 'georgia' in fam) else 'sans')
    w=st.get('font-weight','400')
    try: bold=1 if int(re.sub(r'\D','',w) or 400)>=600 else 0
    except: bold=1 if w in ('bold','bolder') else 0
    ital=1 if 'italic' in (st.get('font-style') or '') else 0
    size=max(6,int(round(float(st.get('_fs',16)))))
    key=(fam,bold,ital,size)
    if key not in _cache:
        _cache[key]=ImageFont.truetype(FONTS.get((fam,bold,ital),FONTS[(fam,0,0)]),size)
    return _cache[key]

def sides(v, base, vw, pct=None):
    """margin/padding shorthand -> (top,right,bottom,left)"""
    if v is None: return None
    parts=[p for p in str(v).split() if p]
    vals=[]
    for p in parts:
        if p=='auto': vals.append('auto'); continue
        n=eval_len(p,base,vw,pct); vals.append(0.0 if n is None else n)
    if not vals: return None
    if len(vals)==1: return (vals[0],)*4
    if len(vals)==2: return (vals[0],vals[1],vals[0],vals[1])
    if len(vals)==3: return (vals[0],vals[1],vals[2],vals[1])
    return tuple(vals[:4])

def box_metric(st, prop, base, vw, pct=None):
    sh=sides(st.get(prop), base, vw, pct)
    if sh is None: sh=(0,0,0,0)
    out=list(sh)
    for i,side in enumerate(('top','right','bottom','left')):
        k=f'{prop}-{side}'
        if k in st:
            n=eval_len(st[k],base,vw,pct)
            if n is not None: out[i]=n
    return tuple(out)

def border_w(st, base, vw):
    out=[0,0,0,0]
    b=st.get('border')
    if b and 'none' not in b:
        m=re.match(r'\s*([\d.]+)px',b)
        if m: out=[float(m.group(1))]*4
    for i,side in enumerate(('top','right','bottom','left')):
        k=f'border-{side}'
        if k in st:
            m=re.match(r'\s*([\d.]+)px',st[k])
            out[i]=float(m.group(1)) if m else 0
        k2=f'border-{side}-width'
        if k2 in st:
            n=eval_len(st[k2],base,vw); out[i]=n or 0
    if st.get('border-width'):
        sh=sides(st['border-width'],base,vw)
        if sh: out=list(sh)
    return tuple(out)

def border_color(st, tokens):
    for k in ('border-color','border'):
        v=st.get(k)
        if v:
            m=re.search(r'(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|color-mix\([^)]*\))',v)
            if m:
                c=parse_color(m.group(1),tokens)
                if c: return c
    for side in ('bottom','top'):
        v=st.get(f'border-{side}-color')
        if v:
            c=parse_color(v,tokens)
            if c: return c
    return None


import re
from PIL import ImageFont
from style import parse_color, eval_len, num
from css import Node

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

class Box:
    __slots__=('node','x','y','w','h','st','kids','runs','bg','bc','bw','rad','pad','mar','tag')
    def __init__(s,node,st):
        s.node=node; s.st=st; s.x=s.y=s.w=s.h=0.0; s.kids=[]; s.runs=None
        s.bg=None; s.bc=None; s.bw=(0,0,0,0); s.rad=0.0; s.pad=(0,0,0,0); s.mar=(0,0,0,0)
        s.tag=node.tag

HEAD={'title','meta','link','script','style','base'}
def is_vis(n):
    if n.tag in HEAD: return False
    if n.style.get('display','block')=='none': return False
    if n.style.get('visibility')=='hidden': return False
    if n.style.get('position')=='fixed': return False
    return True

def max_content(n, tokens, vw=390.0, depth=0):
    """Bevorzugte Breite ohne Umbruch — fuer Flex-Kinder und inline-block."""
    if depth>14 or n.tag in HEAD: return 0.0
    st=n.style; fs=float(st.get('_fs',16))
    if n.tag=='svg':
        # Ohne width-Attribut ergibt sich die Eigenbreite aus dem viewBox — genau so ermittelt
        # der Browser die Inhaltsbreite eines SVG, dessen CSS-Breite in Prozent angegeben ist.
        try: return float(n.attrs['width'])
        except Exception: pass
        vb=(n.attrs.get('viewBox') or n.attrs.get('viewbox') or '').split()
        if len(vb)==4:
            try: return float(vb[2])
            except Exception: pass
        return 18.0
    pad=box_metric(st,'padding',fs,vw); bw=border_w(st,fs,vw)
    extra=pad[1]+pad[3]+bw[1]+bw[3]
    if st.get('width'):
        v=eval_len(st['width'],fs,vw)
        if v is not None: return v
    ek=[k for k in n.kids if k.tag!='#text' and is_vis(k)]
    if st.get('display')=='flex':
        gap=eval_len(st.get('gap'),fs,vw) or 0.0
        col='column' in (st.get('flex-direction') or '')
        vals=[]
        for k in n.kids:
            if k.tag=='#text':
                if not (k.text or '').strip(): continue
                tt=k.text.upper() if k.style.get('text-transform')=='uppercase' else k.text
                tt=tt.replace('\xad','')
                ls2=eval_len(k.style.get('letter-spacing'),float(k.style.get('_fs',16)),vw) or 0.0
                vals.append(font_for(k.style).getlength(tt)+ls2*len(tt))
            elif is_vis(k):
                vals.append(max_content(k,tokens,vw,depth+1))
        if not vals: return extra
        return (max(vals) if col else sum(vals)+gap*(len(vals)-1))+extra
    if ek and any(k.style.get('display','block')!='inline' for k in ek):
        col = st.get('display')=='flex' and 'column' in (st.get('flex-direction') or '')
        gap=eval_len(st.get('gap'),fs,vw) or 0.0
        vals=[max_content(k,tokens,vw,depth+1)+ (k.style.get('_mw_extra',0) or 0) for k in ek]
        if st.get('display')=='flex' and not col:
            return sum(vals)+gap*(len(vals)-1)+extra
        return (max(vals) if vals else 0.0)+extra
    runs=inline_runs(n,[],tokens,vw)
    tot=0.0
    for item in runs:
        if item[0]=='a':
            tot+=max_content(item[3],tokens,vw,depth+1); continue
        _,text,rst,_=item
        if not isinstance(text,str): continue
        tt=text.upper() if rst.get('text-transform')=='uppercase' else text
        ls=eval_len(rst.get('letter-spacing'),float(rst.get('_fs',16)),vw) or 0.0
        tot+=font_for(rst).getlength(tt)+ls*len(tt)
    return tot+extra

def min_content(n, tokens, vw=390.0, depth=0):
    """Mindestbreite eines Flex-Elements (CSS min-width:auto).

    Wichtige Feinheit, die genau den Unterschied zwischen Browser und einer naiven Nachbildung
    ausmacht: overflow-wrap:break-word aendert die Mindestbreite NICHT — ein Flex-Element gibt
    also nur bis zur Breite seines laengsten Wortes nach, danach laeuft die Zeile ueber, statt
    das Wort zu zerhacken. Nur word-break:break-all senkt die Mindestbreite auf ein Zeichen.
    Ohne diese Regel schrumpfte der Renderer Schaltflaechen in engen Zeilen weiter, als ein
    Browser es je taete, und meldete Umbrueche, die es in Wirklichkeit nicht gibt.
    """
    if depth>14 or n.tag in HEAD: return 0.0
    st=n.style; fs=float(st.get('_fs',16))
    if n.tag=='svg': return max_content(n,tokens,vw,depth)
    pad=box_metric(st,'padding',fs,vw); bw=border_w(st,fs,vw)
    extra=pad[1]+pad[3]+bw[1]+bw[3]
    if st.get('width'):
        v=eval_len(st['width'],fs,vw)
        if v is not None: return v
    if (st.get('word-break') or '').strip() in ('break-all','break-word'): return extra
    ek=[k for k in n.kids if k.tag!='#text' and is_vis(k)]
    col = st.get('display')=='flex' and 'column' in (st.get('flex-direction') or '')
    if ek and any(k.style.get('display','block')!='inline' for k in ek):
        gap=eval_len(st.get('gap'),fs,vw) or 0.0
        vals=[min_content(k,tokens,vw,depth+1) for k in ek]
        if st.get('display')=='flex' and not col:
            return sum(vals)+gap*(len(vals)-1)+extra
        return (max(vals) if vals else 0.0)+extra
    runs=inline_runs(n,[],tokens,vw)
    longest=0.0
    for item in runs:
        if item[0]=='a':
            longest=max(longest,min_content(item[3],tokens,vw,depth+1)); continue
        _,text,rst,_=item
        if not isinstance(text,str): continue
        tt=text.upper() if rst.get('text-transform')=='uppercase' else text
        ls=eval_len(rst.get('letter-spacing'),float(rst.get('_fs',16)),vw) or 0.0
        f=font_for(rst)
        for tok in tt.split():
            tok=tok.replace('\xad','')
            longest=max(longest, f.getlength(tok)+ls*len(tok))
    return longest+extra

def inline_runs(n,out,tokens=None,vw=390.0):
    for k in n.kids:
        if k.tag=='#text':
            if k.text: out.append(('t',k.text,k.style,None))
        elif not is_vis(k):
            continue
        elif k.tag=='svg':
            out.append(('a',None,k.style,k))
        elif k.style.get('display') in ('inline-block','flex') or k.tag in ('button','input','img'):
            out.append(('a',None,k.style,k))
        else:
            inline_runs(k,out,tokens,vw)
    return out

def wrap_runs(runs,maxw,tokens=None,vw=390.0):
    lines=[[]]; cx=0.0
    for item in runs:
        kind=item[0]
        if kind=='a':
            _,_,rst,knode=item
            bb=layout(knode,maxw,tokens,vw) if tokens is not None else None
            w=bb.w if bb else 16.0
            if cx+w>maxw and cx>0: lines.append([]); cx=0.0
            lines[-1].append(('atom',rst,w,bb)); cx+=w
            continue
        _,text,rst,_=item
        if not isinstance(text,str): continue
        tt=text.upper() if rst.get('text-transform')=='uppercase' else text
        ls=eval_len(rst.get('letter-spacing'),float(rst.get('_fs',16)),vw) or 0.0
        f=font_for(rst)
        def put(t):
            nonlocal cx
            w=f.getlength(t)+ls*len(t)
            lines[-1].append((t,rst,w,None)); cx+=w
        ow_ = (rst.get('overflow-wrap') or rst.get('word-wrap') or '').strip()
        wb_ = (rst.get('word-break') or '').strip()
        brk_ = ow_ in ('break-word','anywhere') or wb_ in ('break-all','break-word')
        for tk in re.findall(r'\S+\s*|\s+',tt):
            plain=tk.replace('\xad','')
            w=f.getlength(plain)+ls*len(plain)
            # Ein Wort, das selbst allein in einer Zeile nicht passt, muss bei
            # overflow-wrap:break-word zeichenweise gebrochen werden — auch dann, wenn die Zeile
            # noch leer ist (cx==0). Diese Pruefung steht deshalb VOR dem cx==0-Sonderfall.
            if brk_ and tk.strip() and maxw>0 and w>maxw and '\xad' not in tk:
                if cx>0: lines.append([]); cx=0.0
                acc=''
                for ch in plain.rstrip():
                    cand=acc+ch
                    if f.getlength(cand)+ls*len(cand)>maxw and acc:
                        put(acc); lines.append([]); cx=0.0; acc=ch
                    else:
                        acc=cand
                # Der Wortzwischenraum haengt am Ende des Tokens und darf beim Zerlegen nicht
                # verlorengehen, sonst kleben im Bild zwei Woerter aneinander, die es in
                # Wirklichkeit nicht tun.
                if acc: put(acc + plain[len(plain.rstrip()):])
                continue
            if cx+w<=maxw or cx==0 or not tk.strip():
                if '\xad' in tk and cx+w>maxw and cx==0:
                    pass
                else:
                    put(plain); continue
            if '\xad' in tk:
                segs=tk.split('\xad'); acc=''
                for si,seg in enumerate(segs):
                    cand=acc+seg
                    wc=f.getlength(cand+'-')+ls*(len(cand)+1)
                    if cx+wc>maxw and acc:
                        put(acc+'-'); lines.append([]); cx=0.0; acc=seg
                    else:
                        acc=cand
                if acc: put(acc)
                continue
            lines.append([]); cx=0.0
            put(tk.lstrip())
    return lines

def line_h(st):
    fs=float(st.get('_fs',16)); lh=st.get('line-height')
    if lh:
        try: return float(lh)*fs
        except:
            n=eval_len(lh,fs,390)
            if n: return n
    return fs*1.35

def _m(b): return b.mar

def restretch(bb, newh):
    """Grid-Elemente dehnen sich standardmaessig auf die Zeilenhoehe; ein Kind mit
       flex:1 nimmt den Zuwachs auf (align-items:stretch-Verhalten)."""
    if bb.h >= newh-0.5: return
    delta=newh-bb.h
    st=bb.node.style if bb.node is not None else {}
    if st.get('display')=='flex' and 'column' in (st.get('flex-direction') or ''):
        for i,ch in enumerate(bb.kids):
            cst=ch.node.style if ch.node is not None else {}
            fl=cst.get('flex')
            if fl and fl.split()[0] not in ('0','none'):
                ch.h+=delta
                if cst.get('justify-content')=='center':
                    for gc in ch.kids: gc.y+=delta/2
                for j in range(i+1,len(bb.kids)): bb.kids[j].y+=delta
                bb.h=newh; return
    bb.h=newh

def layout(n, avail_w, tokens, vw=390.0):
    st=n.style; fs=float(st.get('_fs',16))
    b=Box(n,st)
    b.mar=box_metric(st,'margin',fs,vw,avail_w)
    pad=box_metric(st,'padding',fs,vw,avail_w); b.pad=pad
    bw=border_w(st,fs,vw); b.bw=bw
    b.bg=parse_color(st.get('background') or st.get('background-color'),tokens)
    b.bc=border_color(st,tokens)
    rr=st.get('border-radius','').strip()
    b.rad=-1.0 if rr=='50%' else (eval_len(rr,fs,vw,avail_w) or 0.0)

    mar=b.mar
    ml=0.0 if mar[3]=='auto' else mar[3]; mrr=0.0 if mar[1]=='auto' else mar[1]
    outer=avail_w-ml-mrr
    if st.get('width'):
        v=eval_len(st['width'],fs,vw,avail_w)
        if v is not None: outer=v
    if st.get('max-width'):
        v=eval_len(st['max-width'],fs,vw,avail_w)
        if v is not None: outer=min(outer,v)
    b.w=max(0.0,outer)
    inner=max(0.0,b.w-pad[1]-pad[3]-bw[1]-bw[3])

    if n.tag=='input' and n.attrs.get('type') not in ('file',):
        txt=n.attrs.get('value') or n.attrs.get('placeholder') or ''
        if txt:
            stt=dict(st)
            if not n.attrs.get('value'): stt['color']=st.get('color')
            tn=Node('#text',text=txt); tn.parent=n; tn.style=stt
            b.runs=([[(txt,stt,font_for(stt).getlength(txt),None)]],line_h(st))
    if n.tag=='svg':
        vb=(n.attrs.get('viewBox') or n.attrs.get('viewbox') or '').split()
        cssw=st.get('width')
        if cssw and vb and len(vb)==4:
            v=eval_len(cssw,fs,vw,avail_w)
            if v is not None:
                try:
                    b.w=v; b.h=v*float(vb[3])/float(vb[2]); return b
                except: pass
        try: b.w=float(n.attrs.get('width',18))
        except: b.w=18.0
        try: b.h=float(n.attrs.get('height',18))
        except: b.h=18.0
        if vb and len(vb)==4 and 'width' not in n.attrs:
            try: b.w=float(vb[2]); b.h=float(vb[3])
            except: pass
        return b

    disp=st.get('display','block')
    allk=[k for k in n.kids if k.tag!='#text' and is_vis(k)]
    abskids=[k for k in allk if k.style.get('position')=='absolute']
    ekids=[k for k in allk if k.style.get('position')!='absolute']
    if n.tag=='details' and 'open' not in n.attrs:
        ekids=[k for k in ekids if k.tag=='summary']
    has_block=any(k.style.get('display','block') in ('block','flex','grid','list-item') for k in ekids)
    content_h=0.0

    if disp=='grid' and ekids:
        gap=eval_len(st.get('gap'),fs,vw) or 0.0
        tpl=st.get('grid-template-columns','')
        m=re.search(r'repeat\(\s*(\d+)',tpl)
        ncol=int(m.group(1)) if m else max(1,len(re.findall(r'\S+',tpl)) or 1)
        cw=max(0.0,(inner-gap*(ncol-1))/ncol)
        boxes=[layout(k,cw,tokens,vw) for k in ekids]
        y=pad[0]+bw[0]; i=0
        ai_g=st.get('align-items','stretch')
        while i<len(boxes):
            row=boxes[i:i+ncol]
            hmax=max((bb.h for bb in row),default=0.0)
            for j,bb in enumerate(row):
                if ai_g=='stretch': restretch(bb,hmax)
                bb.x=pad[3]+bw[3]+j*(cw+gap); bb.y=y
            y+=hmax+gap; i+=ncol
        content_h=max(0.0,y-gap-(pad[0]+bw[0]))
        b.kids=boxes
    elif disp=='flex' and (ekids or any(k.tag=='#text' and k.text.strip() for k in n.kids)):
        col='column' in (st.get('flex-direction') or '')
        gap=eval_len(st.get('gap'),fs,vw) or 0.0
        # Textknoten in einem Flex-Container werden zu eigenstaendigen Flex-Elementen
        items=[k for k in n.kids if (k.tag=='#text' and k.text and k.text.strip()) or (k.tag!='#text' and is_vis(k))]
        if n.tag=='details' and 'open' not in n.attrs:
            items=[k for k in items if k.tag=='summary']
        ekids=items
        boxes=[]
        for k in items:
            if k.tag=='#text':
                tb=Box(k,k.style)
                f=font_for(k.style); txt=k.text
                if k.style.get('text-transform')=='uppercase': txt=txt.upper()
                _ls=eval_len(k.style.get('letter-spacing'),float(k.style.get('_fs',16)),vw) or 0.0
                _plain=txt.replace('\xad','')
                natural=f.getlength(_plain)+_ls*len(_plain)
                tb.w=min(natural,inner) if natural>inner else natural
                lines=wrap_runs([('t',k.text,k.style,None)],max(1.0,tb.w),tokens,vw)
                lh=line_h(k.style)
                tb.runs=(lines,lh); tb.h=lh*len(lines)
                boxes.append(tb)
            else:
                boxes.append(layout(k,inner,tokens,vw))
        if col:
            y=pad[0]+bw[0]
            for i,bb in enumerate(boxes):
                if i: y+=gap
                y+=bb.mar[0] if isinstance(bb.mar[0],float) else 0
                kn=ekids[i] if i<len(ekids) else None
                asf=bb.st.get('align-self')
                _shrink = (asf in ('flex-start','start','flex-end','end','center') or \
                          (asf is None and st.get('align-items') in ('center','flex-start','flex-end'))) and \
                          str((kn.style.get('flex-shrink') if kn is not None else '')).strip()!='0'
                if _shrink and kn is not None and kn.tag!='#text' and not kn.style.get('width'):
                    pref=min(max_content(kn,tokens,vw),inner)
                    pref=max(pref, min(min_content(kn,tokens,vw), inner))
                    if pref>0 and pref<bb.w:
                        nb=layout(kn,pref,tokens,vw); nb.mar=bb.mar; bb=nb; boxes[i]=bb
                # In einer Spalten-Flexbox steuert align-items die WAAGERECHTE Ausrichtung;
                # align-self am Kind sticht die Vorgabe des Containers.
                eff=asf or st.get('align-items','stretch')
                bb.x=pad[3]+bw[3]+(bb.mar[3] if isinstance(bb.mar[3],float) else 0)
                if eff=='center':
                    bb.x=pad[3]+bw[3]+max(0.0,(inner-bb.w)/2)
                elif eff in ('flex-end','end'):
                    bb.x=pad[3]+bw[3]+max(0.0,inner-bb.w)
                bb.y=y; y+=bb.h+(bb.mar[2] if isinstance(bb.mar[2],float) else 0)
            content_h=y-(pad[0]+bw[0])
        else:
            flexf=[1 if (k.tag!='#text' and k.style.get('flex') and k.style['flex'].split()[0] not in ('0','none')) else 0 for k in ekids]
            for i,(k,bb) in enumerate(zip(ekids,boxes)):
                # flex-basis:auto — die Ausgangsbreite jedes Flex-Elements ist seine
                # Inhaltsbreite, unabhängig von flex-shrink. flex-shrink steuert erst, ob es
                # darunter nachgibt, wenn die Zeile überläuft (siehe unten).
                if k.tag=='#text': continue
                if not flexf[i] and not k.style.get('width'):
                    pref=min(max_content(k,tokens,vw), inner)
                    pref=max(pref, min(min_content(k,tokens,vw), inner))
                    if pref<bb.w:
                        boxes[i]=layout(k,pref,tokens,vw)
            marsum=sum((bb.mar[1] if isinstance(bb.mar[1],float) else 0)+(bb.mar[3] if isinstance(bb.mar[3],float) else 0) for bb in boxes)
            fixed=sum(bb.w for bb,f in zip(boxes,flexf) if not f)+marsum
            nf=sum(flexf)
            if nf:
                each=max(0.0,(inner-fixed-gap*(len(boxes)-1))/nf)
                boxes=[layout(k,each,tokens,vw) if f else bb for k,bb,f in zip(ekids,boxes,flexf)]
            # Standardmäßig ist flex-shrink:1 — läuft eine Zeile über, geben die Elemente
            # anteilig nach, statt aus dem Container zu ragen.
            if 'wrap' not in (st.get('flex-wrap') or ''):
                _tot=sum(bb.w for bb in boxes)+gap*(len(boxes)-1)
                if _tot>inner and inner>0:
                    _shrinkable=[(i,bb) for i,bb in enumerate(boxes)
                                 if str(ekids[i].style.get('flex-shrink','')).strip()!='0' and ekids[i].tag!='#text']
                    _over=_tot-inner
                    _pool=sum(bb.w for _,bb in _shrinkable)
                    if _pool>0:
                        for i,bb in _shrinkable:
                            # Untergrenze ist min-width:auto, also die Breite des laengsten Wortes.
                            # Vorher wurde bis auf 12px heruntergedrueckt, was einen Browser nicht
                            # nachbildet: dort laeuft die Zeile lieber ueber, als ein Wort zu
                            # zerhacken. Der Renderer meldete dadurch Umbrueche, die es nie gab.
                            _floor=min(min_content(ekids[i],tokens,vw), inner)
                            _new=max(_floor, 12.0, bb.w-_over*(bb.w/_pool))
                            if _new<bb.w-0.5:
                                nb=layout(ekids[i],_new,tokens,vw); nb.mar=bb.mar; boxes[i]=nb
            wrap='wrap' in (st.get('flex-wrap') or '')
            rows=[]
            if wrap:
                cur=[]; cw=0.0
                for bb in boxes:
                    bwd=bb.w+(bb.mar[1] if isinstance(bb.mar[1],float) else 0)+(bb.mar[3] if isinstance(bb.mar[3],float) else 0)
                    if cur and cw+gap+bwd>inner:
                        rows.append(cur); cur=[]; cw=0.0
                    cur.append(bb); cw+= (gap if cw>0 else 0)+bwd
                if cur: rows.append(cur)
            else:
                rows=[boxes]
            ai=st.get('align-items','stretch')
            jc=st.get('justify-content','flex-start')
            yy=pad[0]+bw[0]
            for row in rows:
                rtotal=sum(bb.w for bb in row)+gap*(len(row)-1)+sum((bb.mar[1] if isinstance(bb.mar[1],float) else 0)+(bb.mar[3] if isinstance(bb.mar[3],float) else 0) for bb in row)
                free=max(0.0,inner-rtotal)
                x=pad[3]+bw[3]; extra=0.0
                if jc=='space-between' and len(row)>1: extra=free/(len(row)-1)
                elif jc=='center': x+=free/2
                elif jc in ('flex-end','end'): x+=free
                hmax=max((bb.h for bb in row),default=0.0)
                for bb in row:
                    x+=bb.mar[3] if isinstance(bb.mar[3],float) else 0
                    bb.x=x
                    top=yy+(bb.mar[0] if isinstance(bb.mar[0],float) else 0)
                    bb.y=top+((hmax-bb.h)/2 if ai=='center' else 0)
                    x+=bb.w+(bb.mar[1] if isinstance(bb.mar[1],float) else 0)+gap+extra
                yy+=hmax+gap
            content_h=max(0.0,yy-gap-(pad[0]+bw[0]))
        b.kids=boxes
    elif has_block:
        boxes=[]; y=pad[0]+bw[0]; prev_mb=0.0; first=True
        for k in ekids:
            kw=inner
            if k.style.get('display')=='inline-block' and not k.style.get('width'):
                kw=min(max_content(k,tokens,vw),inner) or inner
            bb=layout(k,kw,tokens,vw)
            mt=bb.mar[0] if isinstance(bb.mar[0],float) else 0.0
            y+= mt if first else max(prev_mb,mt)
            auto = (bb.mar[3]=='auto') or (bb.mar[1]=='auto') or ('auto' in str(k.style.get('margin','')))
            bb.x=pad[3]+bw[3]+(max(0.0,(inner-bb.w)/2) if auto else (bb.mar[3] if isinstance(bb.mar[3],float) else 0))
            bb.y=y; y+=bb.h
            prev_mb=bb.mar[2] if isinstance(bb.mar[2],float) else 0.0
            first=False; boxes.append(bb)
        content_h=(y+prev_mb)-(pad[0]+bw[0])
        b.kids=boxes
    else:
        runs=inline_runs(n,[],tokens,vw)
        if runs:
            lines=wrap_runs(runs,inner,tokens,vw)
            lh=line_h(st)
            for ln in lines:
                for it in ln:
                    if it[3] is not None: lh=max(lh,it[3].h)
            b.runs=(lines,lh)
            content_h=lh*len(lines)

    total=content_h+pad[0]+pad[2]+bw[0]+bw[2]
    if st.get('height'):
        v=eval_len(st['height'],fs,vw)
        if v is not None: total=v
    mh=eval_len(st.get('min-height'),fs,vw)
    if mh is not None: total=max(total,mh)
    if st.get('aspect-ratio','').strip()=='1': total=b.w
    b.h=total
    for k in abskids:
        ks=k.style; kfs=float(ks.get('_fs',16))
        pw=b.w-bw[1]-bw[3]; ph=b.h-bw[0]-bw[2]
        left=eval_len(ks.get('left'),kfs,vw,pw); right=eval_len(ks.get('right'),kfs,vw,pw)
        top=eval_len(ks.get('top'),kfs,vw,ph); bot=eval_len(ks.get('bottom'),kfs,vw,ph)
        wv=eval_len(ks.get('width'),kfs,vw,pw); hv=eval_len(ks.get('height'),kfs,vw,ph)
        if wv is None:
            wv = max(0.0,pw-(left or 0)-(right or 0)) if (left is not None and right is not None) else min(max_content(k,tokens,vw),pw)
        kb=layout(k,wv,tokens,vw)
        kb.w=wv
        if hv is not None: kb.h=hv
        elif top is not None and bot is not None: kb.h=max(0.0,ph-top-bot)
        kb.x=bw[3]+(left if left is not None else (pw-(right or 0)-kb.w))
        kb.y=bw[0]+(top if top is not None else (ph-(bot or 0)-kb.h))
        tf=ks.get('transform','')
        if 'translate(-50%,-50%)' in tf.replace(' ',''): kb.x-=kb.w/2; kb.y-=kb.h/2
        elif 'translate(-50%,-46%)' in tf.replace(' ',''): kb.x-=kb.w/2; kb.y-=kb.h/2
        b.kids.append(kb)
    return b

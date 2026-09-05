import re
from style import parse_color, eval_len
from layout import font_for

def _pts(s, sx, sy, ox, oy, R=None):
    nums=[float(x) for x in re.findall(r'-?[\d.]+', s or '')]
    pts=[(ox+nums[i]*sx, oy+nums[i+1]*sy) for i in range(0,len(nums)-1,2)]
    return [R(p) for p in pts] if R else pts

def _col(v, tokens, st):
    if not v or v=='none': return None
    if v=='currentColor': return parse_color(st.get('color'),tokens)
    return parse_color(v,tokens)

def paint_svg(dr, node, x, y, w, h, tokens):
    vb=(node.attrs.get('viewBox') or node.attrs.get('viewbox') or '').split()
    if len(vb)!=4: return
    try: vx,vy,vw,vh=[float(t) for t in vb]
    except: return
    if vw<=0 or vh<=0: return
    sx=w/vw; sy=h/vh; ox=x-vx*sx; oy=y-vy*sy
    # statische CSS-Rotation (z. B. Aufklapp-Pfeile) beruecksichtigen
    import math
    ang=0.0
    tf=(node.style.get('transform') or '')
    m=re.search(r'rotate\(\s*(-?[\d.]+)deg\s*\)',tf)
    if m: ang=math.radians(float(m.group(1)))
    ccx=x+w/2.0; ccy=y+h/2.0
    def R(p):
        if not ang: return p
        px,py=p
        dx=px-ccx; dy=py-ccy
        ca=math.cos(ang); sa=math.sin(ang)
        return (ccx+dx*ca-dy*sa, ccy+dx*sa+dy*ca)
    SVG_INH=('fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','opacity')
    def walk(n, inh):
        cur=dict(inh)
        for k in SVG_INH:
            if k in n.attrs: cur[k]=n.attrs[k]
        yield n,cur
        for k in n.kids: yield from walk(k,cur)
    for el,pres in walk(node,{}):
        t=el.tag; a=el.attrs; st=el.style
        fv=a.get('fill', pres.get('fill'))
        sv=a.get('stroke', pres.get('stroke'))
        fill=_col(fv if fv is not None else st.get('fill'), tokens, st)
        stroke=_col(sv if sv is not None else st.get('stroke'), tokens, st)
        try: swid=max(1,int(round(float(a.get('stroke-width', pres.get('stroke-width',1)))*sx)))
        except: swid=1
        if t=='polygon':
            p=_pts(a.get('points'),sx,sy,ox,oy,R)
            if len(p)>2:
                if fill: dr.polygon(p,fill=fill[:3])
                if stroke: dr.line(p+[p[0]],fill=stroke[:3],width=swid)
        elif t=='polyline':
            p=_pts(a.get('points'),sx,sy,ox,oy,R)
            if len(p)>1 and stroke: dr.line(p,fill=stroke[:3],width=swid)
        elif t=='line':
            try:
                p1=R((ox+float(a.get('x1',0))*sx, oy+float(a.get('y1',0))*sy))
                p2=R((ox+float(a.get('x2',0))*sx, oy+float(a.get('y2',0))*sy))
                if stroke: dr.line([p1,p2],fill=stroke[:3],width=swid)
            except: pass
        elif t=='circle':
            try:
                cx,cy=R((ox+float(a.get('cx',0))*sx, oy+float(a.get('cy',0))*sy)); r=float(a.get('r',0))*sx
                bb=[cx-r,cy-r,cx+r,cy+r]
                dr.ellipse(bb,fill=fill[:3] if fill else None,outline=stroke[:3] if stroke else None,width=swid)
            except: pass
        elif t=='rect':
            try:
                rx=ox+float(a.get('x',0))*sx; ry=oy+float(a.get('y',0))*sy
                rw=float(a.get('width',0))*sx; rh=float(a.get('height',0))*sy
                rad=float(a.get('rx',0))*sx
                if rad>0.5: dr.rounded_rectangle([rx,ry,rx+rw,ry+rh],radius=rad,fill=fill[:3] if fill else None,outline=stroke[:3] if stroke else None,width=swid)
                else: dr.rectangle([rx,ry,rx+rw,ry+rh],fill=fill[:3] if fill else None,outline=stroke[:3] if stroke else None,width=swid)
            except: pass
        elif t=='path':
            d=a.get('d') or ''
            if not d: continue
            toks=re.findall(r'([MmLlHhVvCcSsQqTtAaZz])|(-?[\d.]+(?:e-?\d+)?)', d)
            cmds=[]; cur=None; nums=[]
            for c,n in toks:
                if c:
                    if cur: cmds.append((cur,nums))
                    cur=c; nums=[]
                elif n: nums.append(float(n))
            if cur: cmds.append((cur,nums))
            subs=[]; pts=[]; cx0=cy0=0.0; start=None
            for c,nn in cmds:
                rel=c.islower(); C=c.upper()
                if C=='M':
                    for i in range(0,len(nn)-1,2):
                        px,py=nn[i],nn[i+1]
                        if rel: px+=cx0; py+=cy0
                        if i==0:
                            if len(pts)>1: subs.append(pts)
                            pts=[]; start=(px,py)
                        pts.append((px,py)); cx0,cy0=px,py
                elif C in ('L','T'):
                    for i in range(0,len(nn)-1,2):
                        px,py=nn[i],nn[i+1]
                        if rel: px+=cx0; py+=cy0
                        pts.append((px,py)); cx0,cy0=px,py
                elif C=='H':
                    for v in nn:
                        px=(cx0+v) if rel else v
                        pts.append((px,cy0)); cx0=px
                elif C=='V':
                    for v in nn:
                        py=(cy0+v) if rel else v
                        pts.append((cx0,py)); cy0=py
                elif C in ('C','S','Q','A'):
                    step={'C':6,'S':4,'Q':4,'A':7}[C]
                    for i in range(0,len(nn)-step+1,step):
                        seg=nn[i:i+step]
                        px,py=seg[-2],seg[-1]
                        if rel: px+=cx0; py+=cy0
                        pts.append((px,py)); cx0,cy0=px,py
                elif C=='Z':
                    if start: pts.append(start); cx0,cy0=start
            if len(pts)>1: subs.append(pts)
            for sp in subs:
                dev=[R((ox+p[0]*sx, oy+p[1]*sy)) for p in sp]
                if fill and len(dev)>2:
                    try: dr.polygon(dev,fill=fill[:3])
                    except Exception: pass
                if stroke and len(dev)>1:
                    dr.line(dev,fill=stroke[:3],width=swid)
        elif t=='text':
            txt=''.join(k.text for k in el.kids if k.tag=='#text' and k.text)
            if not txt.strip(): continue
            try: tx=ox+float(a.get('x',0))*sx; ty=oy+float(a.get('y',0))*sy
            except: continue
            fs=float(st.get('_fs',10))*sx
            stl=dict(st); stl['_fs']=max(6,fs)
            f=font_for(stl)
            c=_col(st.get('fill'),tokens,st) or (90,90,90)
            anc=a.get('text-anchor','start')
            tw=f.getlength(txt)
            if anc=='middle': tx-=tw/2
            elif anc=='end': tx-=tw
            dr.text((tx,ty-fs*0.8),txt,font=f,fill=c[:3])

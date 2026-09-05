from PIL import Image, ImageDraw
from layout import font_for, line_h
from style import parse_color
from svgdraw import paint_svg

def draw_box(dr, b, ox, oy, tokens, depth=0):
    x=ox+b.x; y=oy+b.y; w=b.w; h=b.h
    r=b.rad
    if b.bg or (b.bc and any(b.bw)):
        if r==-1: rr=min(w,h)/2
        else: rr=min(r, w/2, h/2) if r else 0
        shape=[x,y,x+max(1,w),y+max(1,h)]
        outline=b.bc if any(b.bw) else None
        width=int(max(b.bw)) if any(b.bw) else 0
        fill=b.bg[:3] if b.bg else None
        try:
            if rr and rr>0.5:
                dr.rounded_rectangle(shape, radius=rr, fill=fill, outline=outline, width=max(1,width) if outline else 0)
            else:
                dr.rectangle(shape, fill=fill, outline=outline, width=max(1,width) if outline else 0)
        except Exception:
            pass
    # Innenring aus box-shadow (…inset) — in dieser App die Umrandung der Farbtupfer
    st=b.st
    bs=st.get('box-shadow') or ''
    if 'inset' in bs:
        import re as _re
        m=_re.match(r'\s*0\s+0\s+0\s+([\d.]+)px\s+(.+?)\s+inset', bs)
        if m:
            from style import parse_color as _pc
            c=_pc(m.group(2),tokens)
            if c:
                wpx=max(1,int(round(float(m.group(1)))))
                rr2=(min(w,h)/2) if b.rad==-1 else (min(b.rad,w/2,h/2) if b.rad else 0)
                sh2=[x+0.5,y+0.5,x+max(1,w)-0.5,y+max(1,h)-0.5]
                try:
                    if rr2 and rr2>0.5: dr.rounded_rectangle(sh2,radius=rr2,outline=c[:3],width=wpx)
                    else: dr.rectangle(sh2,outline=c[:3],width=wpx)
                except Exception: pass
    if st.get('border-top') and not b.bc:
        c=parse_color(st['border-top'].split()[-1],tokens)
        if c: dr.line([x,y,x+w,y],fill=c[:3],width=1)
    if b.tag=='svg':
        try: paint_svg(dr,b.node,x,y,b.w,b.h,tokens)
        except Exception: pass
    if b.runs:
        lines,lh=b.runs
        pad=b.pad; bw=b.bw
        ta=st.get('text-align','left')
        ty=y+pad[0]+bw[0]
        inner_w=w-pad[1]-pad[3]-bw[1]-bw[3]
        for ln in lines:
            total=sum(it[2] for it in ln)
            sx=x+pad[3]+bw[3]
            if ta=='center': sx+=max(0,(inner_w-total)/2)
            elif ta in ('right','end'): sx+=max(0,inner_w-total)
            cx=sx
            for it in ln:
                txt,rst,iw,atom=it
                if txt=='atom' or atom is not None:
                    if atom is not None:
                        atom.x=0; atom.y=0
                        draw_box(dr,atom,cx,ty+max(0,(lh-atom.h)/2),tokens,depth+1)
                    cx+=iw; continue
                col=parse_color(rst.get('color'),tokens) or (30,30,30)
                f=font_for(rst)
                fs=float(rst.get('_fs',16))
                ls=0.0
                from style import eval_len
                ls=eval_len(rst.get('letter-spacing'),fs,390) or 0.0
                yy=ty+(lh-fs)/2-fs*0.12
                if ls:
                    for ch in txt:
                        dr.text((cx,yy),ch,font=f,fill=col[:3]); cx+=f.getlength(ch)+ls
                else:
                    dr.text((cx,yy),txt,font=f,fill=col[:3]); cx+=iw
            ty+=lh
    for k in b.kids:
        draw_box(dr,k,x,y,tokens,depth+1)

def render(root_box, width, tokens, bg=(255,255,255)):
    h=int(root_box.h)+40
    img=Image.new('RGB',(int(width),h),bg)
    dr=ImageDraw.Draw(img)
    draw_box(dr,root_box,0,0,tokens)
    return img

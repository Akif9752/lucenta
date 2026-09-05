import sys,re
sys.path.insert(0,'/sessions/relaxed-serene-dirac/rend')
from css import parse_html,parse_css,wrap_body
from style import build_tokens,cascade,parse_color
from layout import layout
from paint import render
import json

SRC='/sessions/relaxed-serene-dirac/mnt/outputs/lucenta.html'
OUT='/sessions/relaxed-serene-dirac/mnt/outputs/'

def inject_landing(root):
    """Die vom echten JavaScript erzeugten Inhalte einsetzen (Erstbesuch-Zustand)."""
    data=json.load(open('/sessions/relaxed-serene-dirac/rend/landing_state.json',encoding='utf-8'))
    idx={}
    def walk(n):
        i=n.attrs.get('id')
        if i: idx[i]=n
        for k in n.kids: walk(k)
    walk(root)
    for eid,spec in data.items():
        n=idx.get(eid)
        if n is None: continue
        if 'html' in spec and spec['html']:
            frag=parse_html(spec['html'])
            for k in frag.kids: k.parent=n
            n.kids=frag.kids
        elif 'text' in spec:
            from css import Node
            n.kids=[]
            if spec['text']:
                t=Node('#text',text=spec['text']); t.parent=n; n.kids=[t]
        if spec.get('display'):
            # Vorher nur 'none' — dadurch liessen sich Zustaende, die per JavaScript EINgeblendet
            # werden (display:flex), gar nicht nachstellen; die betreffende Ansicht blieb im Bild
            # unsichtbar und man haette sie faelschlich fuer fehlend halten koennen.
            prev=n.attrs.get('style','')
            n.attrs['style']=(prev+';display:'+spec['display']).strip(';')

def inject_result(root):
    data=json.load(open('/sessions/relaxed-serene-dirac/rend/result_state.json',encoding='utf-8'))
    idx={}
    def walk(n):
        i=n.attrs.get('id')
        if i: idx[i]=n
        for k in n.kids: walk(k)
    walk(root)
    from css import Node
    for eid,spec in data.items():
        n=idx.get(eid)
        if n is None: continue
        if spec.get('html'):
            frag=parse_html(spec['html'])
            for k in frag.kids: k.parent=n
            n.kids=frag.kids
        elif 'text' in spec:
            n.kids=[]
            if spec['text']:
                t=Node('#text',text=spec['text']); t.parent=n; n.kids=[t]
        if spec.get('display'):
            n.attrs['style']=(n.attrs.get('style','')+';display:'+spec['display']).strip(';')
    # Ansicht umschalten
    for eid,node in idx.items():
        if eid.startswith('view-'):
            cl=node.attrs.get('class','').replace('active','').strip()
            node.attrs['class']=cl+(' active' if eid=='view-result' else '')

def build(dark=False, width=390, mutate=None, view='landing'):
    src=open(SRC,encoding='utf-8').read()
    cssb=re.search(r'<style>(.*?)</style>',src,re.S).group(1)
    def mok(c):
        c=c.replace(' ','')
        w=('max-width:480px' in c and width<=480) or ('max-width:420px' in c and width<=420)
        d=('prefers-color-scheme:dark' in c) and dark
        return w or d
    root=wrap_body(parse_html(src))
    rules=parse_css(cssb,mok)
    tok=build_tokens(rules,dark=dark)
    if view=='landing': inject_landing(root)
    else: inject_result(root)
    if mutate: mutate(root)
    cascade(root,rules,tok)
    body=root.kids[0]
    b=layout(body,width,tok)
    bg=parse_color(body.style.get('background'),tok) or (255,255,255)
    return render(b,width,tok,bg[:3]), root, tok

if __name__=='__main__':
    import sys
    view=sys.argv[1] if len(sys.argv)>1 else 'landing'
    for dark,name in [(False,'hell'),(True,'dunkel')]:
        img,_,_=build(dark=dark,view=view)
        img.save(OUT+'_lucenta_'+view+'_'+name+'.png'); print(view,name,img.size)

import sys,re,json
sys.path.insert(0,'/sessions/relaxed-serene-dirac/rend')
from css import parse_html,parse_css,wrap_body,Node
from style import build_tokens,cascade,parse_color
from layout import layout
from paint import render
SRC='/sessions/relaxed-serene-dirac/mnt/outputs/lucenta.html'
OUT='/sessions/relaxed-serene-dirac/mnt/outputs/'

def apply_state(root, data, view):
    idx={}
    def walk(n):
        i=n.attrs.get('id')
        if i: idx[i]=n
        for k in n.kids: walk(k)
    walk(root)
    for eid,spec in data.items():
        n=idx.get(eid)
        if n is None: continue
        if spec.get('html'):
            frag=parse_html(spec['html'])
            for k in frag.kids: k.parent=n
            n.kids=frag.kids
        elif spec.get('text'):
            t=Node('#text',text=spec['text']); t.parent=n; n.kids=[t]
        elif spec.get('value'):
            n.attrs['value']=spec['value']
        if spec.get('display')=='none':
            n.attrs['style']=(n.attrs.get('style','')+';display:none').strip(';')
    for eid,node in idx.items():
        if eid.startswith('view-'):
            cl=node.attrs.get('class','').replace('active','').strip()
            node.attrs['class']=cl+(' active' if eid=='view-'+view else '')

def build(view, dark=False, width=390):
    src=open(SRC,encoding='utf-8').read()
    cssb=re.search(r'<style>(.*?)</style>',src,re.S).group(1)
    def mok(c):
        c=c.replace(' ','')
        return ('max-width:480px' in c and width<=480) or ('max-width:420px' in c and width<=420) or (('prefers-color-scheme:dark' in c) and dark)
    root=wrap_body(parse_html(src))
    rules=parse_css(cssb,mok); tok=build_tokens(rules,dark=dark)
    apply_state(root, json.load(open('/sessions/relaxed-serene-dirac/rend/views_state.json',encoding='utf-8')), view)
    cascade(root,rules,tok)
    body=root.kids[0]
    b=layout(body,width,tok)
    bg=parse_color(body.style.get('background'),tok) or (255,255,255)
    return render(b,width,tok,bg[:3])

if __name__=='__main__':
    for v in sys.argv[1:]:
        for dark,nm in [(False,'hell'),(True,'dunkel')]:
            img=build(v,dark=dark)
            img.save(OUT+'_v_'+v+'_'+nm+'.png')
            print(v,nm,img.size)

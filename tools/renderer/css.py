import re
from html.parser import HTMLParser

# ---------------- HTML ----------------
VOID={'meta','link','br','hr','img','input','source','use','polyline','circle','line','path','rect','polygon','stop'}
class Node:
    __slots__=('tag','attrs','kids','parent','text','style','box')
    def __init__(s,tag,attrs=None,text=None):
        s.tag=tag; s.attrs=attrs or {}; s.kids=[]; s.parent=None; s.text=text; s.style={}; s.box=None
    def cls(s): return (s.attrs.get('class') or '').split()
    def __repr__(s):
        return f"<{s.tag} {'#'+s.attrs['id'] if 'id' in s.attrs else ''}{'.'+'.'.join(s.cls()) if s.cls() else ''}>" if s.tag!='#text' else f"TEXT({(s.text or '')[:24]!r})"

class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True); s.root=Node('#root'); s.stack=[s.root]; s.skip=0
    def handle_starttag(s,tag,attrs):
        if tag in ('script','style'): s.skip+=1; return
        if s.skip: return
        n=Node(tag,dict(attrs)); n.parent=s.stack[-1]; s.stack[-1].kids.append(n)
        if tag not in VOID: s.stack.append(n)
    def handle_startendtag(s,tag,attrs):
        if s.skip: return
        n=Node(tag,dict(attrs)); n.parent=s.stack[-1]; s.stack[-1].kids.append(n)
    def handle_endtag(s,tag):
        if tag in ('script','style'):
            if s.skip: s.skip-=1
            return
        if s.skip: return
        for i in range(len(s.stack)-1,0,-1):
            if s.stack[i].tag==tag: del s.stack[i:]; break
    def handle_data(s,d):
        if s.skip: return
        if d and d.strip():
            n=Node('#text',text=re.sub(r'\s+',' ',d)); n.parent=s.stack[-1]; s.stack[-1].kids.append(n)

def parse_html(txt):
    p=P(); p.feed(txt); return p.root

# ---------------- CSS ----------------
def strip_comments(c): return re.sub(r'/\*.*?\*/','',c,flags=re.S)

def spec(sel):
    i=sel.count('#'); c=len(re.findall(r'\.[A-Za-z_-]',sel))+len(re.findall(r'\[',sel))
    t=len(re.findall(r'(?:^|[\s>+~])([a-zA-Z][a-zA-Z0-9]*)',sel))
    return (i,c,t)

def parse_decls(body):
    out={}
    depth=0; cur=''
    for ch in body:
        if ch=='(': depth+=1
        if ch==')': depth-=1
        if ch==';' and depth==0:
            if ':' in cur:
                k,_,v=cur.partition(':'); out[k.strip()]=v.strip()
            cur=''
        else: cur+=ch
    if ':' in cur:
        k,_,v=cur.partition(':'); out[k.strip()]=v.strip()
    return out

def parse_css(css, media_ok):
    """media_ok(cond)->bool entscheidet, welche @media-Bloecke gelten."""
    css=strip_comments(css); rules=[]
    i=0; n=len(css)
    while i<n:
        at=css.find('@',i); br=css.find('{',i)
        if br==-1: break
        if at!=-1 and at<br:
            # at-rule
            head=css[at:br].strip()
            depth=1; j=br+1
            while j<n and depth:
                if css[j]=='{': depth+=1
                elif css[j]=='}': depth-=1
                j+=1
            inner=css[br+1:j-1]
            if head.startswith('@media'):
                cond=head[6:].strip()
                if media_ok(cond): rules+=parse_css(inner, media_ok)
            i=j; continue
        sel=css[i:br].strip()
        depth=1; j=br+1
        while j<n and depth:
            if css[j]=='{': depth+=1
            elif css[j]=='}': depth-=1
            j+=1
        body=css[br+1:j-1]
        decls=parse_decls(body)
        for s1 in sel.split(','):
            s1=s1.strip()
            if not s1: continue
            rules.append((spec(s1), len(rules), s1, decls))
        i=j
    return rules

# --------------- Selector matching ---------------
SIMPLE=re.compile(r'^([a-zA-Z][\w-]*)?((?:[.#][\w-]+|\[[^\]]+\])*)$')
STRUCT=('first-child','last-child','first-of-type','last-of-type','only-child','root')

def _sibs(node):
    if node.parent is None: return [node]
    return [k for k in node.parent.kids if k.tag!='#text']

def _struct_ok(node, name, arg):
    sib=_sibs(node)
    if name=='first-child': return bool(sib) and sib[0] is node
    if name=='last-child': return bool(sib) and sib[-1] is node
    if name=='only-child': return len(sib)==1
    if name=='first-of-type':
        same=[k for k in sib if k.tag==node.tag]; return bool(same) and same[0] is node
    if name=='last-of-type':
        same=[k for k in sib if k.tag==node.tag]; return bool(same) and same[-1] is node
    if name=='nth-child':
        try: idx=sib.index(node)+1
        except ValueError: return False
        a=(arg or '').strip()
        if a.isdigit(): return idx==int(a)
        return False
    if name=='root': return node.parent is None or node.parent.tag=='#root'
    return False

def match_simple(node, part):
    if node.tag=='#text': return False
    pseudos=[]
    def grab(m):
        pseudos.append((m.group(1), m.group(2)))
        return ''
    part=re.sub(r':([a-z-]+)(?:\(([^)]*)\))?', grab, part)
    for name,arg in pseudos:
        if name in ('hover','focus','focus-visible','active','visited','disabled','checked','placeholder'):
            return False
        if name=='not':
            inner=(arg or '').strip()
            if inner and match_simple(node, inner): return False
            continue
        if not _struct_ok(node, name, arg): return False
    if part=='' and pseudos: return True
    if part=='*': return True
    m=SIMPLE.match(part)
    if not m: return False
    tag,rest=m.group(1),m.group(2) or ''
    if tag and node.tag!=tag: return False
    for tok in re.findall(r'[.#][\w-]+|\[[^\]]+\]',rest):
        if tok[0]=='.':
            if tok[1:] not in node.cls(): return False
        elif tok[0]=='#':
            if node.attrs.get('id')!=tok[1:]: return False
        else:
            inner=tok[1:-1]
            if '=' in inner:
                k,_,v=inner.partition('='); v=v.strip('"\'')
                if node.attrs.get(k.strip())!=v: return False
            else:
                if inner not in node.attrs: return False
    return True

def match(node, sel):
    if '::' in sel: return False
    if re.search(r':(hover|focus|focus-visible|active|visited|disabled|checked)\b', sel): return False       # Pseudo-Zustaende ueberspringen
    parts=re.split(r'\s*(>|\+|~)\s*|\s+', sel.strip())
    parts=[p for p in parts if p]
    if not parts: return False
    cur=node; i=len(parts)-1
    if not match_simple(cur, parts[i]): return False
    i-=1
    while i>=0:
        comb=parts[i] if parts[i] in ('>','+','~') else None
        if comb: i-=1
        if i<0: return False
        target=parts[i]
        if comb=='>':
            cur=cur.parent
            if cur is None or not match_simple(cur,target): return False
        elif comb=='+':
            sib=cur.parent.kids if cur.parent else []
            els=[k for k in sib if k.tag!='#text']
            try: idx=els.index(cur)
            except ValueError: return False
            if idx==0 or not match_simple(els[idx-1],target): return False
            cur=els[idx-1]
        else:
            p=cur.parent; ok=False
            while p is not None:
                if match_simple(p,target): ok=True; cur=p; break
                p=p.parent
            if not ok: return False
        i-=1
    return True

def wrap_body(root):
    """Die Artifact-Datei enthaelt kein <body>; das Stylesheet setzt darauf aber
       Grundfarbe/Schrift. Also nachbilden, wie es beim Veroeffentlichen entsteht."""
    body=Node('body'); body.parent=root
    for k in root.kids: k.parent=body
    body.kids=root.kids
    root.kids=[body]
    return root

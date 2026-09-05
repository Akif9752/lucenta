# -*- coding: utf-8 -*-
"""Statische Pruefung der Mehrsprachigkeit.

Entstanden aus einem echten Fehler: In Runde 54/55 setzte applyI18n() Texte ueber textContent,
obwohl 38 davon HTML-Entitaeten enthalten — der Browser zeigte "Of&shy;fen&shy;heit" woertlich.
Alle zehn Testreihen waren dabei gruen, weil sie den DOM nur stubben. Diese Pruefung schliesst
die Luecke auf der Ebene, auf der der Fehler lag: der Datei selbst.

Runde 58 hat drei weitere blinde Flecken derselben Art aufgedeckt, alle im echten Browser
sichtbar und in allen zehn Reihen gruen: placeholder und aria-label waren ueberhaupt nicht
uebersetzt (Attribute liest der Ersatz-DOM nie), das englische Paket setzte die deutschen
Anfuehrungszeichen "&bdquo;...&ldquo;", und Prueflauf 6 sah nur Zuweisungen an textContent,
nicht Literale, die ueber push() oder Zeichenkettenverkettung in die Oberflaeche wandern.
Pruefung 6 ist entsprechend verschaerft, 7 und 8 sind neu.
"""
import re, sys
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S=open(os.path.join(ROOT,'dist','lucenta.html'),encoding='utf-8').read()
A=S.index('</style>'); B=S.rindex('<script>')
MARKUP=re.sub(r'<!--.*?-->','',S[A:B],flags=re.S)
JS=S[B:]
fails=[]
def check(cond,msg):
    print(("  ok   " if cond else "  FAIL ")+msg)
    if not cond: fails.append(msg)

# Tabellen
tabs=[]
for m in re.finditer(r"UI: \{(.*?)\n    \}[,\n]", S, re.S):
    tabs.append(dict((k, v.replace("\\'","'").replace('\\\\','\\'))
                     for k,v in re.findall(r"'([^']+)': '((?:[^'\\]|\\.)*)'", m.group(1))))
DE, EN = tabs[0], tabs[1]

print("\n1) Vollstaendigkeit")
check(len(DE)==len(EN), "gleich viele Texte in beiden Sprachen (%d/%d)"%(len(DE),len(EN)))
fehlend=[k for k in DE if k not in EN]
check(not fehlend, "kein Text ohne englische Fassung"+(": "+", ".join(fehlend[:5]) if fehlend else ""))

print("\n2) Marken und Tabelle passen zusammen")
marks=set(re.findall(r'data-i18n(?:-html|-text|-placeholder|-aria)?="([^"]+)"', MARKUP))
ohne=[k for k in marks if k not in DE]
check(not ohne, "jede Marke hat einen Tabelleneintrag"+(": "+", ".join(ohne[:5]) if ohne else ""))

print("\n3) Entitaeten werden als HTML gesetzt, nicht als Text")
# applyI18n muss fuer data-i18n innerHTML verwenden
blk=re.search(r'function applyI18n\(\)\{(.*?)\n  \}', JS, re.S).group(1)
seg=re.search(r"querySelectorAll\('\[data-i18n\]'\)(.*?)\}\);", blk, re.S).group(1)
check('innerHTML' in seg and 'textContent' not in seg,
      "data-i18n wird ueber innerHTML gesetzt (sonst erscheinen &shy; und &mdash; woertlich)")
seg2=re.search(r"querySelectorAll\('\[data-i18n-text\]'\)(.*?)\}\);", blk, re.S)
check(seg2 and 'decodeEntities' in seg2.group(1),
      "data-i18n-text loest Entitaeten vorher auf")
# Attribute sind reiner Text: ohne decodeEntities stuende &mdash; woertlich in der Vorlesung.
for mark in ('placeholder','aria'):
    seg3=re.search(r"querySelectorAll\('\[data-i18n-%s\]'\)(.*?)\}\);"%mark, blk, re.S)
    check(bool(seg3) and 'decodeEntities' in seg3.group(1),
          "data-i18n-%s loest Entitaeten vorher auf"%mark)

print("\n4) Keine Marke auf Elementen, die das JavaScript selbst befuellt")
written=set(re.findall(r"\$\('([A-Za-z0-9_-]+)'\)\.(?:textContent|innerHTML)\s*=", JS))
konflikt=[]
for m in re.finditer(r'<(\w+)([^>]*data-i18n(?:-html|-text)?="([^"]+)"[^>]*)>', MARKUP):
    tag,attrs,key=m.group(1),m.group(2),m.group(3)
    mid=re.search(r'id="([^"]+)"',attrs)
    if mid and mid.group(1) in written: konflikt.append((key,mid.group(1)))
check(not konflikt, "kein markiertes Element wird vom JavaScript ueberschrieben"+
      (": "+", ".join("%s(%s)"%k for k in konflikt[:5]) if konflikt else ""))

print("\n5) HTML-Fragmente der Markup-Marken sind ausgewogen")
VOID={'br','img','input','hr','meta','link','source','path','circle','rect','line','polyline','polygon','ellipse','use','stop'}
def bal(h):
    st=[]
    for m in re.finditer(r'<(/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(/?)>', h):
        t=m.group(2).lower()
        if t in VOID or m.group(3)=='/': continue
        if m.group(1):
            if not st or st.pop()!=t: return False
        else: st.append(t)
    return not st
html_marks=set(re.findall(r'data-i18n-html="([^"]+)"', MARKUP))
unbal=[k for k in html_marks if k in DE and not bal(DE[k])]
check(not unbal, "alle als HTML gesetzten Fragmente sind vollstaendig"+(": "+", ".join(unbal) if unbal else ""))

print("\n6) Keine deutschen Literale im JavaScript")
# Runde 59: Die alte Fassung suchte nach Zuweisungsmustern und einer von Hand gepflegten Liste
# deutscher Woerter. Beides ist gescheitert. Das Muster ".innerHTML = ([^;]+);" brach am
# Semikolon von "&middot;" ab, sodass fuenf Literale im Ergebnisbericht unsichtbar blieben —
# darunter "Alltag · Beziehungen · Wachstum", das eine Nutzerin dann im Browser sah. Und eine
# Wortliste kann nur finden, woran man vorher gedacht hat; "Alltag" stand nicht darauf.
#
# Der deutsche Wortschatz wird deshalb jetzt aus den Sprachpaketen selbst abgeleitet: alles,
# was in den deutschen Texten vorkommt und in den englischen nicht. Diese Liste waechst
# automatisch mit den Paketen mit und braucht keine Pflege.
a2=JS.index('var CONTENT = {}'); b2=JS.index('// Aktive Sprache')
rest=JS[:a2]+JS[b2:]
rest=re.sub(r'/\*.*?\*/','',rest,flags=re.S); rest=re.sub(r'^\s*//.*$','',rest,flags=re.M)

def worte(text):
    text=re.sub(r'<[^>]*>',' ',text)
    text=re.sub(r'&[a-zA-Z]+;|&#\d+;',' ',text)
    return set(w.lower() for w in re.findall(r'[A-Za-zÄÖÜäöüß]{4,}', text))

de_worte=set(); en_worte=set()
for v in DE.values(): de_worte |= worte(v)
for v in EN.values(): en_worte |= worte(v)
# Bezeichner, die in beiden Sprachen gleich sind, gehoeren nicht dazu
NUR_DEUTSCH = de_worte - en_worte
# Fachbegriffe und Eigennamen, die auch im englischen Text deutsch bleiben duerfen
NUR_DEUTSCH -= {'deutsch','lucenta','neurotizismus','ostendorf','goldberg'}

verdacht={}
for lit in re.findall(r"'((?:[^'\\\n]|\\.)*)'", rest):
    if len(lit) < 4 or lit.startswith('js_') or lit.startswith('data-') or lit.startswith('aria'):
        continue
    treffer = worte(lit) & NUR_DEUTSCH
    if treffer: verdacht[lit[:60]] = sorted(treffer)[:3]
check(not verdacht, "keine deutschen Literale im Code"+
      (": "+"; ".join("%s [%s]"%(k,",".join(v)) for k,v in list(verdacht.items())[:4]) if verdacht else
       " (%d nur-deutsche Woerter als Massstab)"%len(NUR_DEUTSCH)))

print("\n7) Uebersetzbare Attribute tragen eine Marke")
# Der Kern der Luecke aus Runde 58: placeholder und aria-label sind Attribute. Der Ersatz-DOM
# der zehn Reihen liest nie ein Attribut, also konnte keine Reihe je bemerken, dass beide in
# jeder Sprache deutsch blieben. Auf Englisch war die halbe Bedienoberfläche deutsch — fuer
# Screenreader-Nutzerinnen sogar vollstaendig.
offen=[]
for m in re.finditer(r'<(\w+)([^>]*?)>', MARKUP):
    attrs=m.group(2)
    for a,mark in (('placeholder','data-i18n-placeholder'),('aria-label','data-i18n-aria')):
        am=re.search(a+r'="([^"]*)"', attrs)
        if not am: continue
        if a=='aria-label' and am.group(1) in ('de','en'): continue
        if mark not in attrs: offen.append(a+'="'+am.group(1)[:40]+'"')
check(not offen, "jedes placeholder/aria-label ist markiert"+(": "+", ".join(offen[:5]) if offen else ""))

print("\n8) Anfuehrungszeichen passen zur Sprache")
# Deutsch setzt "&bdquo;...&ldquo;", Englisch "&ldquo;...&rdquo;". Das englische Paket hatte
# durchgehend das deutsche Paar uebernommen: 12 Stellen, im Browser sichtbar, fuer Pruefung 1
# und 3 aber unauffaellig, weil der Text vorhanden und korrekt als HTML gesetzt war.
de_paare = sum(1 for v in DE.values() if '&bdquo;' in v or '\u201e' in v)
en_falsch = sorted(k for k,v in EN.items() if '&bdquo;' in v or '\u201e' in v)
check(not en_falsch, "englische Texte ohne deutsches Anfuehrungspaar"+
      (": "+", ".join(en_falsch[:5]) if en_falsch else " (%d deutsche Texte gepruefft)"%de_paare))
# Gegenprobe: jedes oeffnende Zeichen braucht ein schliessendes
unpaarig=[]
def zaehl(v,formen): return sum(v.count(f) for f in formen)
for name,tab,op,cl in (('de',DE,('&bdquo;','\u201e'),('&ldquo;','\u201c')),
                       ('en',EN,('&ldquo;','\u201c'),('&rdquo;','\u201d'))):
    for k,v in tab.items():
        if zaehl(v,op)!=zaehl(v,cl): unpaarig.append(name+':'+k)
check(not unpaarig, "jedes oeffnende Anfuehrungszeichen hat ein schliessendes"+
      (": "+", ".join(unpaarig[:5]) if unpaarig else ""))

print("\n"+"="*54)
print("ALLE PRUEFUNGEN BESTANDEN" if not fails else "%d PRUEFUNG(EN) FEHLGESCHLAGEN"%len(fails))
print("="*54)
sys.exit(1 if fails else 0)

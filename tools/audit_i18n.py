# -*- coding: utf-8 -*-
"""Statische Pruefung der Mehrsprachigkeit.

Entstanden aus einem echten Fehler: In Runde 54/55 setzte applyI18n() Texte ueber textContent,
obwohl 38 davon HTML-Entitaeten enthalten — der Browser zeigte "Of&shy;fen&shy;heit" woertlich.
Alle zehn Testreihen waren dabei gruen, weil sie den DOM nur stubben. Diese Pruefung schliesst
die Luecke auf der Ebene, auf der der Fehler lag: der Datei selbst.
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
marks=set(re.findall(r'data-i18n(?:-html|-text)?="([^"]+)"', MARKUP))
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

print("\n6) Keine deutschen Literale mehr in sichtbaren Zuweisungen")
a2=JS.index('var CONTENT = {}'); b2=JS.index('// Aktive Sprache')
rest=JS[:a2]+JS[b2:]
rest=re.sub(r'/\*.*?\*/','',rest,flags=re.S); rest=re.sub(r'^\s*//.*$','',rest,flags=re.M)
verdacht=set()
for pat in [r"\.textContent\s*=\s*([^;]+);", r"toast\(([^;]+)\)", r"setAttribute\('aria-label',\s*([^)]+)\)"]:
    for m in re.finditer(pat, rest):
        for lit in re.findall(r"'((?:[^'\\\n]|\\.)*)'", m.group(1)):
            if lit.startswith('js_') or lit.startswith('<') or len(lit)<4: continue
            if re.search(r'[äöüßÄÖÜ]', lit) or re.search(r'\b(der|die|das|und|dein|nicht|kein|gespeichert|Vergleich|Ergebnis|Energie|Stimmung|Profil|Name|Wert|Code|Bild|Tagesform)\b', lit):
                verdacht.add(lit)
check(not verdacht, "keine unuebersetzten Texte"+(": "+", ".join(sorted(verdacht)[:5]) if verdacht else ""))

print("\n"+"="*54)
print("ALLE PRUEFUNGEN BESTANDEN" if not fails else "%d PRUEFUNG(EN) FEHLGESCHLAGEN"%len(fails))
print("="*54)
sys.exit(1 if fails else 0)

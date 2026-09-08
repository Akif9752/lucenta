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
# Runde 78: Aus zwei Sprachen wurden sieben. Die Tabellen wurden bis dahin ueber ihre POSITION
# geholt (tabs[0], tabs[1]) — mit einem dritten Paket haette das stillschweigend das falsche
# geprueft. Jetzt kommt das Sprachkuerzel aus dem "CONTENT.xx = {" davor mit.
SPRACHEN = {}
for m in re.finditer(r"CONTENT\.([a-z]{2}) = \{.*?UI: \{(.*?)\n    \}[,\n]", S, re.S):
    SPRACHEN[m.group(1)] = dict((k, v.replace("\\'","'").replace('\\\\','\\'))
                                for k,v in re.findall(r"'([^']+)': '((?:[^'\\]|\\.)*)'", m.group(2)))
DE = SPRACHEN['de']
EN = SPRACHEN['en']
# Alle Pakete ausser der Rueckfallsprache — das sind die, die vollstaendig sein muessen.
ANDERE = sorted(k for k in SPRACHEN if k != 'de')

print("\n1) Vollstaendigkeit")
check(len(SPRACHEN)>=2, "mindestens zwei Sprachpakete gefunden (%s)"%", ".join(sorted(SPRACHEN)))
luecken=[]
for code in ANDERE:
    fehlt=[k for k in DE if k not in SPRACHEN[code]]
    zuviel=[k for k in SPRACHEN[code] if k not in DE]
    if fehlt: luecken.append("%s fehlen %d (%s)"%(code, len(fehlt), ", ".join(fehlt[:3])))
    if zuviel: luecken.append("%s kennt %d unbekannte (%s)"%(code, len(zuviel), ", ".join(zuviel[:3])))
check(not luecken, "jede Sprache hat genau die Texte des deutschen Pakets"+
      (": "+"; ".join(luecken[:4]) if luecken else " (%d Texte x %d Sprachen)"%(len(DE), len(SPRACHEN))))

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
# Runde 78: Geprueft wurde nur das deutsche Paket. Ein unvollstaendiges <span> in einer der
# uebrigen sechs Sprachen haette den Rest der Seite zerlegt, ohne dass hier etwas auffaellt.
unbal=[c+':'+k for c in sorted(SPRACHEN) for k in html_marks
       if k in SPRACHEN[c] and not bal(SPRACHEN[c][k])]
check(not unbal, "alle als HTML gesetzten Fragmente sind vollstaendig"+
      (": "+", ".join(unbal[:5]) if unbal else " (%d Fragmente x %d Sprachen)"%(len(html_marks), len(SPRACHEN))))

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
# Klassennamen sind Bezeichner. Sie werden ueber den KONTEXT erkannt (classList.add/remove/
# toggle/contains) und nicht ueber ihre Schreibweise — eine Regel nach Zeichenform ('enthaelt
# einen Bindestrich, keine Leerzeichen') koennte auch echten Text verdecken. Runde 75.
rest=re.sub(r'classList\.(?:add|remove|toggle|contains)\s*\([^)]*\)', ' ', rest)
# Runde 79, dieselbe Art Regel: Der NAME einer CSS-Marke ist ein Bezeichner. Er wird ueber den
# Kontext erkannt (style.setProperty/removeProperty) und nicht ueber seine Schreibweise.
rest=re.sub(r'style\.(?:setProperty|removeProperty)\s*\(\s*\'--[A-Za-z0-9_-]+\'', ' ', rest)

def entkleiden(text):
    """Entfernt aus einem Literal alles, was Bezeichner ist und kein Oberflaechentext.

    Runde 79: Stand bisher NUR in worte() und damit nur auf dem Weg ueber den abgeleiteten
    Wortschatz. Die beiden paketunabhaengigen Signale (Funktionswoerter, Umlaute) sahen
    dagegen den Rohtext — ein Klassenname wie "figur-keine" in einem HTML-Bruchstueck wurde
    dadurch als deutsches Wort gemeldet, obwohl dieselbe Zeichenkette auf dem anderen Weg
    laengst richtig als Bezeichner erkannt war."""
    text=re.sub(r'var\(\s*--[A-Za-z0-9_-]*\s*\)?',' ',text)
    text=re.sub(r'--[A-Za-z0-9_-]+',' ',text)
    text=re.sub(r'(?:class|id|for|href|data-[\w-]+)\s*=\s*"[^"]*"',' ',text)
    # Vollstaendige Elemente entfernen, danach ein etwaiges angeschnittenes Element am Rand:
    # Zeichenketten im Code enden oft mitten in einem Element ('<div class="x">'+wert+'</div>').
    text=re.sub(r'<[^>]*>',' ',text)
    text=re.sub(r'<[^>]*$',' ',text)
    text=re.sub(r'^[^<]*?>',' ',text)
    text=re.sub(r'&[a-zA-Z]+;|&#\d+;',' ',text)
    return text

def worte(text):
    # Bezeichner sind kein Oberflaechentext — die Begruendung steht bei entkleiden().
    return set(w.lower() for w in re.findall(r'[A-Za-zÄÖÜäöüß]{4,}', entkleiden(text)))

de_worte=set(); en_worte=set()
for v in DE.values(): de_worte |= worte(v)
for v in EN.values(): en_worte |= worte(v)
# Bezeichner, die in beiden Sprachen gleich sind, gehoeren nicht dazu
NUR_DEUTSCH = de_worte - en_worte
# Fachbegriffe und Eigennamen, die auch im englischen Text deutsch bleiben duerfen
NUR_DEUTSCH -= {'deutsch','lucenta','neurotizismus','ostendorf','goldberg'}

# Runde 75: Der abgeleitete Wortschatz hat eine Grenze, die beim Gegenpruefen auffiel — er
# erkennt nur Woerter, die im deutschen Paket schon vorkommen. "Ansicht wurde gewechselt" ging
# glatt durch, weil keines der drei Woerter je in einem Text stand. Zwei Signale, die NICHT vom
# Paket abhaengen, schliessen die Luecke:
#
#   1. Rechtschreibung: ä, ö, ü, ß kommen im englischen Text nicht vor.
#   2. Ein kleiner Bestand deutscher Funktionswoerter. Bewusst kurz und auf Grammatik beschraenkt
#      statt auf Inhalt — Inhaltswoerter kann niemand vollstaendig auflisten, Artikel, Hilfsverben
#      und Praepositionen dagegen stehen in fast jedem deutschen Satz.
FUNKTIONSWOERTER = {
    'oder','und','aber','denn','dass','wenn','weil','damit','sodass','also','doch',
    'der','die','das','dem','den','des','ein','eine','einen','einem','einer','eines',
    'wurde','wurden','wird','werden','worden','sind','waren','wars','hast','habe','haben','hatte',
    'kann','kannst','koennen','können','soll','sollte','muss','musst','müssen','darf',
    'nicht','kein','keine','keinen','nichts','noch','schon','immer','wieder','sehr','mehr',
    'dein','deine','deinen','deinem','deiner','mein','meine','sich','dich','dir','ihr','ihre',
    'auf','aus','bei','beim','durch','fuer','für','gegen','mit','nach','ohne','seit','ueber','über',
    'unter','vom','von','vor','zum','zur','zwischen','hier','dort','jetzt','dann','danach','vorher',
    'alle','allen','alles','jede','jeden','jedes','viele','wenige','etwas','andere','anderen',
}

# Vorsilben, aus denen der Code Schluessel zusammensetzt: tx('figur_'+f.id) -> 'figur_'.
KEY_VORSILBEN = set(re.findall(r"tx\('([a-z0-9_]+_)'\s*\+", rest))

verdacht={}
for lit in re.findall(r"'((?:[^'\\\n]|\\.)*)'", rest):
    if len(lit) < 4 or lit.startswith('data-'):
        continue
    # Ein Schluessel ist kein Oberflaechentext. Die Schluesselnamen sind aus dem deutschen
    # Ausgangstext gebildet ('so_sieht_dein_ergebnis_aus_b') und wuerden sonst als deutsche
    # Literale gemeldet — genau dann, wenn eine Stelle RICHTIG ueber tx() uebersetzt wird.
    # Der Praefix 'js_' allein reichte dafuer nicht: Marken im Markup tragen ihn nicht.
    if lit in DE or lit in EN:
        continue
    # CSS-Selektoren, die an querySelector gehen: '.verlauf-svg', '#focusline', '.a.b'.
    # Bewusst eng gefasst — echter Oberflaechentext sieht nie so aus, also verdeckt die Regel
    # nichts. Ein Selektor mit Leerzeichen ('.a .b') faellt absichtlich NICHT darunter, damit
    # aus der Ausnahme kein Scheunentor wird.
    if re.fullmatch(r'[.#][A-Za-z0-9_-]+(?:[.#][A-Za-z0-9_-]+)*', lit):
        continue
    # Runde 79: Attribut-Selektoren ('[data-figur]', '[data-hg]'). Dieselbe Begruendung wie eine
    # Zeile darueber — echter Oberflaechentext sieht nie so aus, die Regel kann nichts verdecken.
    if re.fullmatch(r'\[[A-Za-z0-9_-]+\]', lit):
        continue
    # Speicherschluessel. Das Praefix ist eindeutig und kommt in keinem Oberflaechentext vor,
    # die Regel kann also nichts verdecken. Ueber den Kontext waere es hier nicht zu loesen: Die
    # Schluessel werden an eigene Hilfsfunktionen uebergeben, nicht direkt an localStorage.
    if re.fullmatch(r'lucenta_[a-z0-9_]+', lit):
        continue
    # Runde 80: Kennungen, aus denen der Code einen Uebersetzungsschluessel zusammensetzt.
    #
    # Die Figuren heissen 'fuchs', 'katze', 'locken', 'dutt'; ihre Namen holt der Code mit
    # tx('figur_'+id). Sobald diese Namen im Sprachpaket standen, meldete die Wortschatz-Regel
    # die Kennungen selbst als deutsche Literale — sie wurden erst dadurch zu deutschen
    # Woertern, dass die Stelle RICHTIG uebersetzt wird.
    #
    # Die Ausnahme belegt sich selbst: Sie gilt nur, wenn der Code irgendwo tx('<vorsilbe>'+…)
    # schreibt UND '<vorsilbe><literal>' ein echter Schluessel im deutschen Paket ist. Ein
    # Literal, das diese Probe besteht, IST ein Kennungsteil — es kann gar kein Oberflaechentext
    # sein, denn der Text dazu steht unter dem Schluessel, den es bildet.
    if any((vs + lit) in DE for vs in KEY_VORSILBEN):
        continue
    if lit in KEY_VORSILBEN:
        continue
    # Runde 80, zweiter Teil: Aufzaehlungswerte. Die Frisuren heissen intern 'locken', 'dutt',
    # 'tuch'; sie werden gesetzt (haar:'locken') und verglichen (o.haar === 'locken'), aber nie
    # ausgegeben — der sichtbare Name kommt aus dem Sprachpaket.
    #
    # Die Probe ist streng und deshalb tragfaehig: Ausgenommen wird nur, wenn JEDES Vorkommen
    # im Quelltext in genau diesen beiden Formen steht. Ein einziges Vorkommen, das den Wert
    # irgendwohin schreibt, an tx() gibt oder mit etwas verkettet, faellt aus der Ausnahme
    # heraus und der Fund bleibt bestehen. Gegengeprueft: Ein 'Fuchs' in einem textContent
    # wird weiterhin gemeldet.
    #
    # Runde 96: Eine dritte Form kam dazu — die Vorgabe, `var art = o.blick || 'offen';`. Sie ist
    # eine Zuweisung wie die anderen beiden, faellt aber durch das Muster oben. Aufgefallen ist
    # das erst, als ein neuer deutscher Text das Wort "offen" enthielt und damit ein seit Runde 80
    # unveraendertes Aufzaehlungsliteral zum Fund machte.
    #
    # Die Vorgabe allein reicht ausdruecklich NICHT als Ausnahme: `name || 'Kein Name angegeben'`
    # ist genau die Form, in der echter Oberflaechentext im Code landet. Verlangt wird deshalb
    # beides — jedes Vorkommen in einer der drei Formen UND mindestens eines in der strengen.
    # Ein Literal, das nur als Vorgabe auftaucht, ist keine Aufzaehlung, sondern ein Text.
    STRENG  = r'[A-Za-z_$][\w$]*\s*(?::|===|==|!==|!=)\s*$'
    VORGABE = r'[A-Za-z_$][\w$.\[\]]*\s*\|\|\s*$'
    teile = re.split(r"'" + re.escape(lit) + r"'", rest)[:-1]
    if lit and teile and all(re.search(STRENG, v) or re.search(VORGABE, v) for v in teile) \
             and any(re.search(STRENG, v) for v in teile):
        continue
    w = worte(lit)
    treffer = w & NUR_DEUTSCH
    # Fuer die Funktionswoerter eigene Zerlegung ab DREI Buchstaben: die verlaesslichsten
    # deutschen Marker (der, die, das, und, zur, vom, mit, auf) sind genau drei lang und fielen
    # durch die Vierergrenze der Wortschatz-Zerlegung. Gegengeprueft an "Zurueck zur Startseite",
    # das vorher glatt durchging.
    # Die zwei paketunabhaengigen Signale gelten nur fuer MEHRWORTIGE Zeichenketten. Grund:
    # 'nav-vor' ist ein Klassenname aus einer Zuweisung, den die Kontextregel fuer classList
    # nicht sieht — und er enthaelt 'vor'. Echter Oberflaechentext mit einem Funktionswort hat
    # praktisch immer ein Leerzeichen; ein Bezeichner praktisch nie. Einzelne deutsche Woerter
    # deckt weiterhin der abgeleitete Wortschatz ab (der zum Beispiel 'ERGEBNISKARTE' fand).
    mehrwortig = ' ' in lit.strip()
    if not treffer and mehrwortig:
        kurz = set(x.lower() for x in re.findall(r'[A-Za-zÄÖÜäöüß]{3,}', entkleiden(lit)))
        treffer = kurz & FUNKTIONSWOERTER
    if not treffer and mehrwortig and re.search(r'[äöüßÄÖÜ]', entkleiden(lit)):
        treffer = {'Umlaut/ß'}
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
        if a=='aria-label' and am.group(1) in SPRACHEN: continue
        if mark not in attrs: offen.append(a+'="'+am.group(1)[:40]+'"')
check(not offen, "jedes placeholder/aria-label ist markiert"+(": "+", ".join(offen[:5]) if offen else ""))

print("\n8) Anfuehrungszeichen passen zur Sprache")
# Deutsch setzt "&bdquo;...&ldquo;", Englisch "&ldquo;...&rdquo;". Das englische Paket hatte
# durchgehend das deutsche Paar uebernommen: 12 Stellen, im Browser sichtbar, fuer Pruefung 1
# und 3 aber unauffaellig, weil der Text vorhanden und korrekt als HTML gesetzt war.
#
# Runde 78: Mit fuenf weiteren Sprachen wird aus der Regel eine Tabelle. Die Zuordnung folgt der
# jeweils uebliche Typografie, nicht dem Geschmack:
#   de              „ …"     Gaensefuesschen unten/oben
#   en, pt          " … "     doppelte Anfuehrungszeichen
#   es, fr, it      « … »     Guillemets (im Franzoesischen mit schmalem Leerraum)
#   ja             「 … 」     Kagi-Klammern
#   tr              " … "     wie im Englischen (so schreibt es die TDK-Rechtschreibung)
PAARE = {
    'tr': (('&ldquo;', '\u201c'), ('&rdquo;', '\u201d')),
    'de': (('&bdquo;', '\u201e'), ('&ldquo;', '\u201c')),
    'en': (('&ldquo;', '\u201c'), ('&rdquo;', '\u201d')),
    'pt': (('&ldquo;', '\u201c'), ('&rdquo;', '\u201d')),
    'es': (('&laquo;', '\u00ab'), ('&raquo;', '\u00bb')),
    'fr': (('&laquo;', '\u00ab'), ('&raquo;', '\u00bb')),
    'it': (('&laquo;', '\u00ab'), ('&raquo;', '\u00bb')),
    'ja': (('\u300c',), ('\u300d',)),
}
ohne_regel = [c for c in SPRACHEN if c not in PAARE]
check(not ohne_regel, "fuer jede Sprache ist ein Anfuehrungspaar festgelegt"+
      (": "+", ".join(ohne_regel) if ohne_regel else " (%d Sprachen)"%len(PAARE))) 

def zaehl(v, formen): return sum(v.count(f) for f in formen)

# Kein Paket darf das Paar einer ANDEREN Sprache verwenden. Genau das war der Fehler von
# Runde 58 — nur damals mit zwei Sprachen und deshalb als Einzelfall behandelt.
fremd = []
for code in sorted(SPRACHEN):
    if code not in PAARE: continue
    eigen = set(PAARE[code][0]) | set(PAARE[code][1])
    for anderes, (op, cl) in PAARE.items():
        if set(op) <= eigen or set(cl) <= eigen: continue
        for zeichen in op:
            treffer = sorted(k for k, v in SPRACHEN[code].items() if zeichen in v)
            if treffer: fremd.append("%s benutzt %s (%s)"%(code, anderes, treffer[0]))
check(not fremd, "keine Sprache benutzt das Anfuehrungspaar einer anderen"+
      (": "+"; ".join(sorted(set(fremd))[:5]) if fremd else ""))

# Gegenprobe: jedes oeffnende Zeichen braucht ein schliessendes
unpaarig=[]
for code in sorted(SPRACHEN):
    if code not in PAARE: continue
    op, cl = PAARE[code]
    for k, v in SPRACHEN[code].items():
        if zaehl(v, op) != zaehl(v, cl): unpaarig.append(code+':'+k)
check(not unpaarig, "jedes oeffnende Anfuehrungszeichen hat ein schliessendes"+
      (": "+", ".join(unpaarig[:5]) if unpaarig else ""))

print("\n"+"="*54)
print("ALLE PRUEFUNGEN BESTANDEN" if not fails else "%d PRUEFUNG(EN) FEHLGESCHLAGEN"%len(fails))
print("="*54)
sys.exit(1 if fails else 0)

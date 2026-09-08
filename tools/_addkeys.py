# Hilfsskript: fuegt Oberflaechen-Schluessel in ALLE Sprachpakete ein, an derselben Stelle.
# Grund fuer ein Skript statt sieben Handgriffen: Pruefung 1 des Audits verlangt in jedem Paket
# genau dieselben Schluessel — ein vergessenes Paket faellt sonst erst dort auf.
import sys, json, re, io
def add(neu, anker="'analysiere_deine_antworten_h'"):
    # Runde 97: Die Liste wird nicht mehr aufgezaehlt, sondern aus dem Verzeichnis gelesen.
    # Beim Sprung auf Tuerkisch waere sie sonst die eine Stelle gewesen, an der ein neues Paket
    # stillschweigend uebersprungen wird — und ausgerechnet dieses Skript soll ja verhindern,
    # dass ein Paket vergessen wird.
    import os
    codes = sorted(f[:-3] for f in os.listdir('src/i18n') if f.endswith('.js'))
    for code in codes:
        p = 'src/i18n/%s.js' % code
        zeilen = open(p, encoding='utf-8').read().split('\n')
        vorhanden = set(re.findall(r"^\s+'([^']+)':", '\n'.join(zeilen), re.M))
        einfuegen = []
        for k, werte in neu.items():
            if k in vorhanden: continue
            v = werte[code].replace('\\', '\\\\').replace("'", "\\'")
            einfuegen.append("      '%s': '%s'," % (k, v))
        if not einfuegen: continue
        for i, z in enumerate(zeilen):
            if anker in z:
                zeilen[i:i] = einfuegen
                break
        else:
            raise SystemExit('Anker nicht gefunden in ' + p)
        open(p, 'w', encoding='utf-8').write('\n'.join(zeilen))

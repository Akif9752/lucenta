#!/usr/bin/env python3
"""Alle zwoelf Tiere nebeneinander, im Kreis auf der Feldfarbe, wie die App sie zeigt.

Wozu: Ob die Tiere in verschiedene Richtungen sehen, sieht man nur im Nebeneinander, nicht am
einzelnen Bild. Aufruf:  python3 tools/figuren_rendern/uebersicht.py [ORDNER]  -> /tmp/lucenta-figuren-uebersicht.png
(ohne ORDNER: src/figuren). KREIS=… setzt die Groesse eines Kreises.
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import vorschau as v

SPALTEN = 4


def main():
    ordner = sys.argv[1] if len(sys.argv) > 1 else v.fh.ZIEL
    k, rand = v.KREIS, 10
    kreise = [v.kreis(v.lesen(os.path.join(ordner, t + '.png')), 1.0, v.FELD[t]) for t in v.fh.TIERE]
    zeilen = (len(kreise) + SPALTEN - 1) // SPALTEN
    breite, hoehe = SPALTEN * (k + rand) + rand, zeilen * (k + rand) + rand
    pixel = [(255, 255, 255, 255)] * (breite * hoehe)
    for i, c in enumerate(kreise):
        ox, oy = rand + (i % SPALTEN) * (k + rand), rand + (i // SPALTEN) * (k + rand)
        for y in range(k):
            pixel[(oy + y) * breite + ox:(oy + y) * breite + ox + k] = c[y * k:(y + 1) * k]
    with open('/tmp/lucenta-figuren-uebersicht.png', 'wb') as f:
        f.write(v.fh.png_palette_schreiben_rgba(breite, hoehe, pixel))


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""Runde 133: Vorher/Nachher der Tier-Avatare, so wie die App sie zeigt — im Kreis, auf der Feldfarbe.

Links das alte Bild (72 % des Kreises, 14 % Rand, wie .figur-bild bis Runde 132), rechts das neue
(fuellt den Kreis). Liegt der Kopf rechts nicht genau dort, wo er links liegt, stimmt der Rahmen
nicht. Schiedsrichter ist dieses Bild, nicht eine Zahl.

Aufruf:  python3 tools/figuren_rendern/vorschau.py ALT_ORDNER [tier ...]  -> /tmp/lucenta-figuren-vorschau.png
"""
import os, re, subprocess, sys, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import figuren_holen as fh

KREIS = int(os.environ.get('KREIS', 160))
FIGUREN_JS = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'js', '13-figuren.js')
FELD = dict(re.findall(r"\{id:'([a-z]+)',\s*feld:'(#[0-9A-Fa-f]{6})'", open(FIGUREN_JS).read()))


def lesen(pfad):
    # Die eingecheckten Bilder sind Palette-PNG; ueber TIFF wird daraus RGBA, das png_lesen versteht.
    with tempfile.TemporaryDirectory() as tmp:
        t, r = os.path.join(tmp, 'z.tiff'), os.path.join(tmp, 'z.png')
        subprocess.run(['sips', '-s', 'format', 'tiff', pfad, '--out', t], check=True, capture_output=True)
        subprocess.run(['sips', '-s', 'format', 'png', t, '--out', r], check=True, capture_output=True)
        return fh.png_lesen(open(r, 'rb').read())


def abtasten(b, h, pixel, u, v):
    # bilinear, u/v in 0..1
    x, y = u * b - 0.5, v * h - 0.5
    x0, y0 = max(0, min(b - 1, int(x))), max(0, min(h - 1, int(y)))
    x1, y1 = min(b - 1, x0 + 1), min(h - 1, y0 + 1)
    fx, fy = min(1, max(0, x - x0)), min(1, max(0, y - y0))
    def p(xx, yy): return pixel[yy * b + xx]
    return [p(x0, y0)[c] * (1 - fx) * (1 - fy) + p(x1, y0)[c] * fx * (1 - fy) +
            p(x0, y1)[c] * (1 - fx) * fy + p(x1, y1)[c] * fx * fy for c in range(4)]


def kreis(bild, anteil, feld):
    b, h, pixel = bild
    f = [int(feld[i:i + 2], 16) for i in (1, 3, 5)]
    rand = (1 - anteil) / 2
    aus = []
    for y in range(KREIS):
        for x in range(KREIS):
            dx, dy = x + 0.5 - KREIS / 2, y + 0.5 - KREIS / 2
            if dx * dx + dy * dy > (KREIS / 2) ** 2:
                aus.append((255, 255, 255, 255)); continue
            u, v = ((x + 0.5) / KREIS - rand) / anteil, ((y + 0.5) / KREIS - rand) / anteil
            c = abtasten(b, h, pixel, u, v) if 0 <= u < 1 and 0 <= v < 1 else [0, 0, 0, 0]
            a = c[3] / 255
            aus.append(tuple(round(c[i] * a + f[i] * (1 - a)) for i in range(3)) + (255,))
    return aus


def main():
    alt, nur = sys.argv[1], sys.argv[2:] or fh.TIERE
    zeilen = []
    for t in nur:
        a = kreis(lesen(os.path.join(alt, t + '.png')), 0.72, FELD[t])
        n = kreis(lesen(os.path.join(fh.ZIEL, t + '.png')), 1.0, FELD[t])
        zeilen.append((a, n))
    breite, hoehe = KREIS * 2 + 30, len(zeilen) * (KREIS + 10)
    pixel = [(255, 255, 255, 255)] * (breite * hoehe)
    for i, (a, n) in enumerate(zeilen):
        for y in range(KREIS):
            for x in range(KREIS):
                pixel[(i * (KREIS + 10) + y) * breite + 10 + x] = a[y * KREIS + x]
                pixel[(i * (KREIS + 10) + y) * breite + 20 + KREIS + x] = n[y * KREIS + x]
    with open('/tmp/lucenta-figuren-vorschau.png', 'wb') as f:
        f.write(fh.png_palette_schreiben_rgba(breite, hoehe, pixel))


if __name__ == '__main__':
    main()

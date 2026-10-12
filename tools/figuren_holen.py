#!/usr/bin/env python3
"""Runde 123: Die Tier-Avatare als 3D-Bilder (Microsoft Fluent Emoji, MIT-Lizenz).

Auf Entscheidung des Inhabers ersetzen sie die Vektorzeichnungen, die seit Runde 111 sieben Mal
ueberarbeitet und jedes Mal als "zu gezeichnet" zurueckgekommen waren.

Dieses Werkzeug laeuft EINMAL von Hand, nicht beim Bau: Es holt die Bilder, setzt sie um und legt
sie nach src/figuren/. Das Ergebnis ist eingecheckt. Der Bau selbst laedt nie etwas aus dem Netz,
und die App erst recht nicht — "Data Not Collected" bleibt wahr.

Umgesetzt wird zweierlei:
  1. Goldfisch: Fluent hat nur einen BLAUEN Fisch. Der Farbton wird gedreht (Blau -> Orange),
     Helligkeit und Saettigung bleiben, also auch Licht und Schatten des Modells.
  2. Palette statt Echtfarben (256 Eintraege mit eigener Deckkraft, Fehlerstreuung): Die Bilder
     sind dann etwa halb so gross. WebP kann ImageIO auf dem Mac nicht schreiben, AVIF zeigt WebKit
     erst ab iOS 16 (die App laeuft ab iOS 15) — PNG mit Palette ist das kleinste Format, das
     ueberall angezeigt wird.

Aufruf:  python3 tools/figuren_holen.py
"""
import colorsys, os, struct, sys, urllib.parse, urllib.request, zlib

QUELLE = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/'
ZIEL = os.path.join(os.path.dirname(__file__), '..', 'src', 'figuren')

# Kennung in FIGUREN (13-figuren.js) -> Ordner bei Fluent. Die Kennungen bleiben, auch wo das Tier
# wechselt: Sie stehen in gespeicherten Profilen (lucenta_profile.figur).
TIERE = {
    'fuchs':        'Fox/3D/fox_3d.png',
    'katze':        'Cat face/3D/cat_face_3d.png',
    'baer':         'Bear/3D/bear_3d.png',
    'panda':        'Panda/3D/panda_3d.png',
    'hase':         'Rabbit face/3D/rabbit_face_3d.png',
    'reh':          'Deer/3D/deer_3d.png',
    'dackel':       'Poodle/3D/poodle_3d.png',      # Fluent hat keinen Dackel -> Pudel
    'retriever':    'Dog face/3D/dog_face_3d.png',  # und keinen Retriever -> Hund
    'eule':         'Owl/3D/owl_3d.png',
    'wal':          'Whale/3D/whale_3d.png',
    'goldfisch':    'Fish/3D/fish_3d.png',
    'schildkroete': 'Turtle/3D/turtle_3d.png',
}
FARBTON_DREHEN = {'goldfisch': 0.47}   # Anteil eines Vollkreises: Blau (~0,6) -> Orange (~0,07)


# ---------- PNG lesen und schreiben, nur mit der Standardbibliothek ----------

def png_lesen(daten):
    assert daten[:8] == b'\x89PNG\r\n\x1a\n'
    pos, idat, kopf = 8, b'', None
    while pos < len(daten):
        laenge, art = struct.unpack('>I4s', daten[pos:pos + 8])
        inhalt = daten[pos + 8:pos + 8 + laenge]
        if art == b'IHDR':
            kopf = struct.unpack('>IIBBBBB', inhalt)
        elif art == b'IDAT':
            idat += inhalt
        pos += 12 + laenge
    breite, hoehe, tiefe, farbart, _, _, zeilensprung = kopf
    if tiefe != 8 or farbart != 6 or zeilensprung:
        sys.exit('Erwartet RGBA, 8 Bit, ohne Zeilensprung — erhalten: %r' % (kopf,))
    roh, bpp, zeile = zlib.decompress(idat), 4, breite * 4
    pixel, vorher = bytearray(), bytearray(zeile)
    for y in range(hoehe):
        f = roh[y * (zeile + 1)]
        z = bytearray(roh[y * (zeile + 1) + 1:(y + 1) * (zeile + 1)])
        for i in range(zeile):
            a = z[i - bpp] if i >= bpp else 0
            b = vorher[i]
            c = vorher[i - bpp] if i >= bpp else 0
            if f == 1: z[i] = (z[i] + a) & 255
            elif f == 2: z[i] = (z[i] + b) & 255
            elif f == 3: z[i] = (z[i] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c; pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                z[i] = (z[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        pixel += z; vorher = z
    return breite, hoehe, [tuple(pixel[i:i + 4]) for i in range(0, len(pixel), 4)]


def _block(art, inhalt):
    return struct.pack('>I', len(inhalt)) + art + inhalt + struct.pack('>I', zlib.crc32(art + inhalt))


def png_palette_schreiben(breite, hoehe, palette, indizes):
    roh = b''.join(b'\x00' + bytes(indizes[y * breite:(y + 1) * breite]) for y in range(hoehe))
    return (b'\x89PNG\r\n\x1a\n' +
            _block(b'IHDR', struct.pack('>IIBBBBB', breite, hoehe, 8, 3, 0, 0, 0)) +
            _block(b'PLTE', bytes(v for f in palette for v in f[:3])) +
            _block(b'tRNS', bytes(f[3] for f in palette)) +
            _block(b'IDAT', zlib.compress(roh, 9)) + _block(b'IEND', b''))


# ---------- Farbton drehen ----------

def farbton_drehen(pixel, anteil):
    aus = []
    for r, g, b, a in pixel:
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        r2, g2, b2 = colorsys.hsv_to_rgb((h + anteil) % 1.0, s, v)
        aus.append((round(r2 * 255), round(g2 * 255), round(b2 * 255), a))
    return aus


# ---------- Auf den Inhalt zuschneiden und mittig setzen ----------
#
# Am Simulator gesehen: Schildkroete, Reh und Pudel sassen klein und zu tief im Kreis. Fluent legt
# jedes Tier anders in sein Quadrat (ein Gesicht fuellt es, eine Schildkroete von der Seite liegt
# unten in einem flachen Streifen). Zugeschnitten wird auf die sichtbaren Punkte, dann mittig in ein
# Quadrat gesetzt — damit hat jedes Tier im Kreis dieselbe Groesse, gemessen an seiner laengeren Seite.

def zuschneiden(b, h, pixel):
    xs = [i % b for i, p in enumerate(pixel) if p[3] > 8]
    ys = [i // b for i, p in enumerate(pixel) if p[3] > 8]
    x0, x1, y0, y1 = min(xs), max(xs) + 1, min(ys), max(ys) + 1
    seite = max(x1 - x0, y1 - y0)
    ox, oy = (seite - (x1 - x0)) // 2, (seite - (y1 - y0)) // 2
    aus = [(0, 0, 0, 0)] * (seite * seite)
    for y in range(y0, y1):
        for x in range(x0, x1):
            aus[(y - y0 + oy) * seite + (x - x0 + ox)] = pixel[y * b + x]
    return seite, seite, aus


# ---------- Palette: Median-Schnitt, dann Fehlerstreuung (Floyd-Steinberg) ----------

def palette_bilden(pixel, anzahl=255):
    # Ganz durchsichtige Punkte bekommen Eintrag 0; der Rest teilt sich 255 Eintraege.
    sichtbar = [p for p in pixel if p[3] > 0]
    kisten = [sichtbar]
    while len(kisten) < anzahl:
        # Geteilt wird die Kiste mit der groessten Spannweite MAL Wurzel der Punktzahl: Nach der
        # Spannweite allein bekamen seltene Ausreisser viele Eintraege und die grossen Verlaeufe zu
        # wenige — das gab Korn. Deckkraft doppelt gewichtet, Kanten fallen sonst als Saum auf.
        beste, achse, spanne = None, 0, -1
        for i, k in enumerate(kisten):
            if len(k) < 2: continue
            for ax in range(4):
                w = [p[ax] for p in k]
                s = (max(w) - min(w)) * (2 if ax == 3 else 1) * len(k) ** 0.5
                if s > spanne: beste, achse, spanne = i, ax, s
        if beste is None or spanne <= 0: break
        k = sorted(kisten.pop(beste), key=lambda p: p[achse])
        kisten += [k[:len(k) // 2], k[len(k) // 2:]]
    palette = [(0, 0, 0, 0)]
    for k in kisten:
        n = len(k)
        palette.append(tuple(round(sum(p[i] for p in k) / n) for i in range(4)))
    return palette


STREUUNG = 0.55


def abbilden(breite, hoehe, pixel, palette):
    puffer = [list(p) for p in pixel]
    merk, indizes = {}, [0] * len(pixel)
    for y in range(hoehe):
        for x in range(breite):
            i = y * breite + x
            p = [max(0, min(255, round(v))) for v in puffer[i]]
            if p[3] == 0:
                indizes[i] = 0; continue
            key = tuple(p)
            if key not in merk:
                merk[key] = min(range(1, len(palette)), key=lambda j: (
                    (palette[j][0] - p[0]) ** 2 + (palette[j][1] - p[1]) ** 2 +
                    (palette[j][2] - p[2]) ** 2 + 2 * (palette[j][3] - p[3]) ** 2))
            j = merk[key]; indizes[i] = j
            # Nur ein Teil des Fehlers wird gestreut: voll gestreut sah es in der Vergroesserung wie
            # Korn aus, ohne Streuung zeigten die Verlaeufe Stufen.
            fehler = [(p[c] - palette[j][c]) * STREUUNG for c in range(4)]
            for dx, dy, w in ((1, 0, 7 / 16), (-1, 1, 3 / 16), (0, 1, 5 / 16), (1, 1, 1 / 16)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < breite and ny < hoehe and puffer[ny * breite + nx][3] > 0:
                    for c in range(4):
                        puffer[ny * breite + nx][c] += fehler[c] * w
    return indizes


def main():
    os.makedirs(ZIEL, exist_ok=True)
    summe = 0
    nur = sys.argv[1:]
    for kennung, pfad in TIERE.items():
        if nur and kennung not in nur: continue
        url = QUELLE + urllib.parse.quote(pfad)
        daten = urllib.request.urlopen(url, timeout=30).read()
        b, h, pixel = png_lesen(daten)
        if kennung in FARBTON_DREHEN:
            pixel = farbton_drehen(pixel, FARBTON_DREHEN[kennung])
        b, h, pixel = zuschneiden(b, h, pixel)
        palette = palette_bilden(pixel)
        aus = png_palette_schreiben(b, h, palette, abbilden(b, h, pixel, palette))
        with open(os.path.join(ZIEL, kennung + '.png'), 'wb') as f:
            f.write(aus)
        summe += len(aus)
        print('%-13s %4d KB -> %3d KB  %s' % (kennung, len(daten) // 1024, len(aus) // 1024, pfad))
    lizenz = urllib.request.urlopen(QUELLE.replace('/assets/', '/LICENSE'), timeout=30).read()
    with open(os.path.join(ZIEL, 'LIZENZ-fluent-emoji.txt'), 'wb') as f:
        f.write(b'Die Tierbilder in diesem Ordner stammen aus Microsoft Fluent Emoji\n'
                b'(https://github.com/microsoft/fluentui-emoji), Goldfisch im Farbton veraendert.\n\n' + lizenz)
    print('zusammen %d KB' % (summe // 1024))


if __name__ == '__main__':
    main()

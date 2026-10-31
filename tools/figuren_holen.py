#!/usr/bin/env python3
"""Setzt die Tier-Avatare fuer die App um: zuschneiden, verkleinern, auf eine Palette bringen.

Runde 125: Die Bilder kommen nicht mehr von Fluent Emoji (Runde 123), sondern aus dem eigenen
Renderer tools/figuren_rendern/ (SceneKit, selbst modelliert, Stil auf Wunsch des Inhabers "wie aus
einem Pixar-Film"). Dieses Werkzeug liest dessen Ausgabe aus ROH, schneidet sie im festen Rahmen
aus rahmen.json zu (Runde 133), verkleinert auf GROESSE und legt das Ergebnis nach src/figuren/. Eingecheckt wird nur das Ergebnis. Es laedt nichts aus dem Netz.

Palette statt Echtfarben (256 Eintraege mit eigener Deckkraft, Fehlerstreuung): die Bilder sind dann
etwa halb so gross. WebP kann ImageIO auf dem Mac nicht schreiben, AVIF zeigt WebKit erst ab iOS 16
(die App laeuft ab iOS 15) — PNG mit Palette ist das kleinste Format, das ueberall angezeigt wird.

Aufruf:  tools/figuren_rendern/bauen.sh && python3 tools/figuren_holen.py [tier ...]
"""
import colorsys, json, os, struct, subprocess, sys, tempfile, zlib

ROH = '/tmp/lucenta-figuren-roh'
ZIEL = os.path.join(os.path.dirname(__file__), '..', 'src', 'figuren')
GROESSE = 288     # Runde 133: fuellt jetzt den ganzen Kreis; 96 pt bei 3x = 288 Punkte

# Die Kennungen in FIGUREN (15-figuren.js). Sie stehen in gespeicherten Profilen und bleiben, auch
# wo das Tier zwischenzeitlich gewechselt hat (Runde 123: Pudel/Hund statt Dackel/Retriever).
TIERE = ['fuchs', 'katze', 'baer', 'panda', 'hase', 'reh', 'dackel', 'retriever',
         'eule', 'wal', 'goldfisch', 'schildkroete',
         'delfin', 'seeotter', 'pinguin', 'papagei', 'flamingo', 'rotkehlchen', 'mops', 'siamkatze']


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


# ---------- Auf den Inhalt zuschneiden und mittig setzen ----------
#
# Am Simulator gesehen: Schildkroete, Reh und Pudel sassen klein und zu tief im Kreis. Fluent legt
# jedes Tier anders in sein Quadrat (ein Gesicht fuellt es, eine Schildkroete von der Seite liegt
# unten in einem flachen Streifen). Zugeschnitten wird auf die sichtbaren Punkte, dann mittig in ein
# Quadrat gesetzt — damit hat jedes Tier im Kreis dieselbe Groesse, gemessen an seiner laengeren Seite.

#
# Runde 133: Die Saeugetiere haben einen Oberkoerper bekommen, und der reicht bis an den Bildrand.
# Nach den sichtbaren Punkten zugeschnitten, waere der Kopf damit kleiner und hoeher in den Kreis
# gerutscht — der Inhaber wollte die Kopfposition aber "genau gleich". Deshalb ist der Rahmen jetzt
# FEST: einmal an den Koepfen ohne Koerper gemessen (--rahmen-messen) und in RAHMEN gespeichert.
# Das Bild fuellt den Kreis seitdem ganz (vorher 72 % mit Rand); der Ausschnitt ist darum um 1/0,72
# groesser als der alte, damit der Kopf auf denselben Punkt im Kreis faellt wie vorher.

RAHMEN = os.path.join(os.path.dirname(__file__), 'figuren_rendern', 'rahmen.json')
ALTER_ANTEIL = 0.72     # so viel vom Kreis nahm das Bild bis Runde 132 ein (.figur-bild in 09-archetypen.css)


def sichtbar(b, pixel):
    xs = [i % b for i, p in enumerate(pixel) if p[3] > 8]
    ys = [i // b for i, p in enumerate(pixel) if p[3] > 8]
    return min(xs), max(xs) + 1, min(ys), max(ys) + 1


# Lange Tiere (Wal, Schildkroete) wirkten nach der laengeren Seite zugeschnitten "zu weit weg" (Inhaber):
# naeher heran und zum Kopf hin verschoben; Schwanz und Hinterflossen schneidet der Kreis an.
# (Faktor, Verschiebung x, y als Anteil des Ausschnitts; negativ = nach links/oben)
NAEHER = {'seeotter': (0.80, 0.0, 0.05), 'katze': (0.82, 0.0, 0.02), 'siamkatze': (0.82, 0.0, 0.02), 'goldfisch': (0.92, 0.0, 0.0), 'baer': (0.80, 0.0, 0.05), 'panda': (0.80, 0.0, 0.05), 'hase': (0.92, 0.02, -0.02), 'fuchs': (0.80, 0.0, -0.02), 'reh': (0.86, 0.0, 0.0), 'dackel': (0.74, 0.0, -0.02), 'mops': (0.78, 0.0, 0.02), 'retriever': (0.80, 0.0, 0.02), 'wal': (1.10, 0.0, 0.0), 'schildkroete': (0.95, 0.0, 0.0), 'delfin': (0.95, 0.0, 0.0),
          'flamingo': (0.70, 0.0, 0.06), 'rotkehlchen': (0.78, 0.0, 0.05),
          'pinguin': (0.78, 0.0, 0.06), 'eule': (0.70, 0.0, 0.03), 'papagei': (0.72, 0.0, 0.04)}   # Runde 191: Brustbild mit langem Schnabel, weiter gefasst


def zuschneiden(b, h, pixel, rahmen, kennung=''):
    # Der Rahmen ist an der 1024er-Leinwand gemessen; seit Runde 143 wird doppelt so fein gerendert.
    x0, x1, y0, y1 = [round(v * b / 1024) for v in rahmen]
    faktor, vx, vy = NAEHER.get(kennung, (1, 0, 0))
    seite = round(max(x1 - x0, y1 - y0) / ALTER_ANTEIL / faktor)
    mx, my = (x0 + x1) // 2 + round(vx * seite), (y0 + y1) // 2 + round(vy * seite)
    ax, ay = mx - seite // 2, my - seite // 2
    if ax < 0 or ay < 0 or ax + seite > b or ay + seite > h:
        sys.exit('Ausschnitt %r ragt ueber die Leinwand %dx%d — Leinwand in main.swift vergroessern.' % ((ax, ay, seite), b, h))
    aus = [pixel[(ay + y) * b + ax + x] for y in range(seite) for x in range(seite)]
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
    nur = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--rahmen-messen' in sys.argv:
        # Nur auf Koepfen OHNE Koerper aufrufen (NUR_KOPF=1 bauen.sh) — sonst misst es den Koerper mit.
        # Mit Tiernamen: nur diese neu messen, die uebrigen Rahmen bleiben.
        with open(RAHMEN) as f: rahmen = json.load(f)
        for kennung in TIERE:
            if nur and kennung not in nur: continue
            with open(os.path.join(ROH, kennung + '.png'), 'rb') as f: b, h, pixel = png_lesen(f.read())
            rahmen[kennung] = [round(v * 1024 / b) for v in sichtbar(b, pixel)]
        with open(RAHMEN, 'w') as f:
            f.write('{\n' + ',\n'.join('  "%s": %s' % (k, list(v)) for k, v in rahmen.items()) + '\n}\n')
        print('Rahmen gemessen:', RAHMEN)
        return
    with open(RAHMEN) as f: rahmen = json.load(f)
    # --ausdruck muede|froh: die Varianten aus AUSDRUCK=… bauen.sh, gleicher Rahmen wie das Grundbild.
    zusatz = ''
    if '--ausdruck' in sys.argv:
        zusatz = '-' + sys.argv[sys.argv.index('--ausdruck') + 1]
        nur = [a for a in nur if '-' + a != zusatz]
    for kennung in TIERE:
        if nur and kennung not in nur: continue
        quelle = os.path.join(ROH, kennung + zusatz + '.png')
        if not os.path.exists(quelle):
            sys.exit('Fehlt: %s — erst tools/figuren_rendern/bauen.sh laufen lassen.' % quelle)
        with open(quelle, 'rb') as f: b, h, pixel = png_lesen(f.read())
        b, h, pixel = zuschneiden(b, h, pixel, rahmen[kennung], kennung)
        # Verkleinern ueber sips (Apples Bildwerkzeug, gute Filterung) — auf dem zugeschnittenen Bild,
        # damit jedes Tier dieselbe Groesse im Kreis bekommt.
        with tempfile.TemporaryDirectory() as tmp:
            zw = os.path.join(tmp, 'z.png'); kl = os.path.join(tmp, 'k.png')
            with open(zw, 'wb') as f:
                f.write(png_palette_schreiben_rgba(b, h, pixel))
            subprocess.run(['sips', '-Z', str(GROESSE), zw, '--out', kl], check=True, capture_output=True)
            with open(kl, 'rb') as f: b, h, pixel = png_lesen(f.read())
        palette = palette_bilden(pixel)
        aus = png_palette_schreiben(b, h, palette, abbilden(b, h, pixel, palette))
        with open(os.path.join(ZIEL, kennung + zusatz + '.png'), 'wb') as f:
            f.write(aus)
        summe += len(aus)
        print('%-13s %3d x %3d  %3d KB' % (kennung, b, h, len(aus) // 1024))
    print('zusammen %d KB' % (summe // 1024))


def png_palette_schreiben_rgba(breite, hoehe, pixel):
    roh = b''.join(b'\x00' + bytes(v for p in pixel[y * breite:(y + 1) * breite] for v in p) for y in range(hoehe))
    return (b'\x89PNG\r\n\x1a\n' + _block(b'IHDR', struct.pack('>IIBBBBB', breite, hoehe, 8, 6, 0, 0, 0)) +
            _block(b'IDAT', zlib.compress(roh, 6)) + _block(b'IEND', b''))


if __name__ == '__main__':
    main()

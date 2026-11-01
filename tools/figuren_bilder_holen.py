#!/usr/bin/env python3
# Erzeugte Tierbilder einbauen (Runde 212, Entscheidung des Inhabers: Bilder aus einem Generator mit kommerzieller Lizenz).
# Erwartet in vorlagen/generiert/ je Tier <kennung>-ruhig.<png|jpg>, <kennung>-muede.<…>, <kennung>-froh.<…>
# (Kennungen wie in FIGUREN, z. B. goldfisch fuer den Clownfisch). Stellt frei (freistellen.swift, lokal per Vision),
# verkleinert auf 288 px und schreibt die Palettenbilder nach src/figuren/ — wie figuren_holen.py fuer die Renderings.
# Aufruf: python3 tools/figuren_bilder_holen.py [kennung …]   (ohne Angabe: alle vorhandenen)
import importlib.util, os, subprocess, sys, tempfile

WURZEL = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
QUELLE = os.path.join(WURZEL, 'vorlagen', 'generiert')
spec = importlib.util.spec_from_file_location('fh', os.path.join(WURZEL, 'tools', 'figuren_holen.py'))
fh = importlib.util.module_from_spec(spec); spec.loader.exec_module(fh)
AUSDRUECKE = [('ruhig', ''), ('muede', '-muede'), ('froh', '-froh')]


def finde(kennung, ausdruck):
    for endung in ('png', 'jpg', 'jpeg', 'webp'):
        p = os.path.join(QUELLE, '%s-%s.%s' % (kennung, ausdruck, endung))
        if os.path.exists(p): return p
    return None


def main():
    nur = sys.argv[1:]
    if not os.path.isdir(QUELLE): sys.exit('Ordner fehlt: %s' % QUELLE)
    fehlt, summe = [], 0
    for kennung in fh.TIERE:
        if nur and kennung not in nur: continue
        pfade = [(finde(kennung, a), z) for a, z in AUSDRUECKE]
        if not any(p for p, _ in pfade): continue
        for (p, zusatz), (a, _) in zip(pfade, AUSDRUECKE):
            if not p: fehlt.append('%s-%s' % (kennung, a)); continue
            with tempfile.TemporaryDirectory() as tmp:
                frei = os.path.join(tmp, 'frei.png'); kl = os.path.join(tmp, 'k.png')
                subprocess.run(['swift', os.path.join(WURZEL, 'tools', 'figuren_rendern', 'freistellen.swift'), p, frei],
                               check=True, capture_output=True)
                subprocess.run(['sips', '-Z', str(fh.GROESSE), frei, '--out', kl], check=True, capture_output=True)
                with open(kl, 'rb') as f: b, h, pixel = fh.png_lesen(f.read())
            palette = fh.palette_bilden(pixel)
            aus = fh.png_palette_schreiben(b, h, palette, fh.abbilden(b, h, pixel, palette))
            with open(os.path.join(fh.ZIEL, kennung + zusatz + '.png'), 'wb') as f: f.write(aus)
            summe += len(aus)
            print('%-13s %-6s %3d KB' % (kennung, a, len(aus) // 1024))
    if fehlt: print('FEHLT (alte Bilder bleiben):', ', '.join(fehlt))
    print('zusammen %d KB' % (summe // 1024))


if __name__ == '__main__':
    main()

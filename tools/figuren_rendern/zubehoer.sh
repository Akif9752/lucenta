#!/bin/sh
# Zubehoer rendern und nach src/figuren/zubehoer-<name>.png zuschneiden (frei stehend, auf die Figur zugeschnitten).
set -e
cd "$(dirname "$0")"
# Das Tier-main.swift bleibt draussen; das Zubehoer bringt sein eigenes mit.
# Code auf oberster Ebene erlaubt Swift nur in main.swift: eine Kopie unter diesem Namen uebersetzen.
mkdir -p /tmp/lucenta-zubehoer-quelle && cp zubehoer.swift /tmp/lucenta-zubehoer-quelle/main.swift
swiftc -O -o /tmp/lucenta-zubehoer-rendern Modell.swift Szene.swift Tiere.swift /tmp/lucenta-zubehoer-quelle/main.swift
/tmp/lucenta-zubehoer-rendern
cd ../..
python3 - <<'PY'
import importlib.util, os, subprocess, tempfile
spec = importlib.util.spec_from_file_location('fh', 'tools/figuren_holen.py'); fh = importlib.util.module_from_spec(spec); spec.loader.exec_module(fh)
for name in ('schal', 'muetze', 'blume'):
    with open('/tmp/lucenta-zubehoer/%s.png' % name, 'rb') as f: b, h, pixel = fh.png_lesen(f.read())
    x0, x1, y0, y1 = fh.sichtbar(b, pixel)
    w, hh = x1 - x0, y1 - y0
    aus = [pixel[(y0 + y) * b + x0 + x] for y in range(hh) for x in range(w)]
    with tempfile.TemporaryDirectory() as tmp:
        zw = os.path.join(tmp, 'z.png'); kl = os.path.join(tmp, 'k.png')
        open(zw, 'wb').write(fh.png_palette_schreiben_rgba(w, hh, aus))
        subprocess.run(['sips', '-Z', '160', zw, '--out', kl], check=True, capture_output=True)
        b2, h2, p2 = fh.png_lesen(open(kl, 'rb').read())
    pal = fh.palette_bilden(p2)
    open('src/figuren/zubehoer-%s.png' % name, 'wb').write(fh.png_palette_schreiben(b2, h2, pal, fh.abbilden(b2, h2, p2, pal)))
    print('zubehoer-%s.png %dx%d' % (name, b2, h2))
PY

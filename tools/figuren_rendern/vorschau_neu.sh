#!/bin/sh
# Ein Tier nach einer Aenderung in Tiere.swift ansehen: Kopf allein rendern, Rahmen messen, ganzes Bild rendern,
# zuschneiden wie im App-Bau. Ergebnis: /tmp/fig-p/<tier>-v.png (300 px). Schreibt NICHT nach src/figuren.
# Aufruf: sh tools/figuren_rendern/vorschau_neu.sh <tier>
set -e
T=$1
WURZEL="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$WURZEL/tools/figuren_rendern" && NUR_KOPF=1 sh bauen.sh $T >/dev/null
cd "$WURZEL" && python3 tools/figuren_holen.py --rahmen-messen $T >/dev/null
cd "$WURZEL/tools/figuren_rendern" && sh bauen.sh $T | tail -1
mkdir -p /tmp/fig-p
cd "$WURZEL" && python3 - "$T" <<'PY'
import sys, importlib.util
spec=importlib.util.spec_from_file_location('fh','tools/figuren_holen.py'); fh=importlib.util.module_from_spec(spec); spec.loader.exec_module(fh)
fh.ZIEL='/tmp/fig-p'; t=sys.argv[1]; sys.argv=['x',t]; fh.main()
PY
sips -Z 300 /tmp/fig-p/$T.png --out /tmp/fig-p/$T-v.png >/dev/null

#!/bin/sh
# Fertige Tiere uebernehmen: alle drei Ausdruecke (ruhig, muede, froh) rendern und nach src/figuren setzen.
# Vorher mit vorschau_neu.sh den Rahmen messen (sonst gilt der alte aus rahmen.json).
# Aufruf: sh tools/figuren_rendern/alle_ausdruecke.sh <tier> [<tier> …]
set -e
WURZEL="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$WURZEL/tools/figuren_rendern"
sh bauen.sh "$@"
AUSDRUCK=muede sh bauen.sh "$@"
AUSDRUCK=froh sh bauen.sh "$@"
cd "$WURZEL"
python3 tools/figuren_holen.py "$@"
python3 tools/figuren_holen.py --ausdruck muede "$@"
python3 tools/figuren_holen.py --ausdruck froh "$@"
echo FERTIG

#!/bin/sh
# Fertige Tiere uebernehmen: alle drei Ausdruecke (ruhig, muede, froh) rendern und nach src/figuren setzen.
# Vorher mit vorschau_neu.sh den Rahmen messen (sonst gilt der alte aus rahmen.json).
# Die drei Ausdruecke laufen gleichzeitig (gemessen 14 statt 23 s); die Dateien sind getrennt.
# Aufruf: sh tools/figuren_rendern/alle_ausdruecke.sh <tier> [<tier> …]
set -e
WURZEL="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$WURZEL/tools/figuren_rendern"
NUR_UEBERSETZEN=1 sh bauen.sh
sh bauen.sh "$@" > /tmp/fig-ruhig.log 2>&1 & P1=$!
AUSDRUCK=muede sh bauen.sh "$@" > /tmp/fig-muede.log 2>&1 & P2=$!
AUSDRUCK=froh sh bauen.sh "$@" > /tmp/fig-froh.log 2>&1 & P3=$!
FEHL=0
for p in $P1 $P2 $P3; do wait $p || FEHL=1; done
cat /tmp/fig-ruhig.log /tmp/fig-muede.log /tmp/fig-froh.log
[ $FEHL = 0 ] || { echo "Rendern fehlgeschlagen"; exit 1; }
cd "$WURZEL"
python3 tools/figuren_holen.py "$@" & P1=$!
python3 tools/figuren_holen.py --ausdruck muede "$@" > /dev/null & P2=$!
python3 tools/figuren_holen.py --ausdruck froh "$@" > /dev/null & P3=$!
for p in $P1 $P2 $P3; do wait $p || FEHL=1; done
[ $FEHL = 0 ] || { echo "Zuschneiden fehlgeschlagen"; exit 1; }
echo FERTIG

#!/bin/sh
# Store-Bilder aus der echten App im Simulator — mit Apples Tab-Leiste, die nur nativ entsteht.
#   sh tools/store_bilder/aufnehmen.sh [sprachen…]      (Vorgabe: de en; vorher npm run installieren -- sim)
# Zwei Groessen: 6,9 Zoll (iPhone 18 Pro Max, 1320 x 2868) und 6,3 Zoll (iPhone 18 Pro, 1206 x 2622).
# Rohbilder nach /tmp/store-roh, danach setzt rahmen.mjs Ueberschrift und Rahmen nach assets/store/.
# Einzelne Motive neu: LUCENTA_SZENEN="3-bericht" sh tools/store_bilder/aufnehmen.sh
set -e
WURZEL=$(cd "$(dirname "$0")/../.." && pwd)
APP=/tmp/lucenta-dd/Build/Products/Debug-iphonesimulator/App.app
SPRACHEN=${*:-de en}
SZENEN=${LUCENTA_SZENEN:-"1-start 2-ergebnis 3-bericht 4-tagesform 5-verstehen"}
[ -d "$APP" ] || { echo "App fehlt: erst npm run installieren -- sim"; exit 1; }
mkdir -p /tmp/store-roh

geraet(){ xcrun simctl list devices available | grep "    $1 (" | head -1 | sed -E 's/.*\(([0-9A-F-]{36})\).*/\1/'; }

for PAAR in "6.9:iPhone 18 Pro Max" "6.3:iPhone 18 Pro"; do
  GROESSE=${PAAR%%:*}; NAME=${PAAR#*:}
  ID=$(geraet "$NAME")
  [ -n "$ID" ] || { echo "Simulator \"$NAME\" fehlt"; exit 1; }
  xcrun simctl boot "$ID" 2>/dev/null || true
  xcrun simctl bootstatus "$ID" -b >/dev/null
  xcrun simctl install "$ID" "$APP"
  xcrun simctl status_bar "$ID" override --time 9:41 --dataNetwork wifi --wifiBars 3 --cellularBars 4 --batteryState charged --batteryLevel 100
  P=$(xcrun simctl get_app_container "$ID" app.lucenta.ios app)
  cp "$P/public/index.html" /tmp/store-index-sicher.html
  ERSTES=1
  for L in $SPRACHEN; do
    for S in $SZENEN; do
      cp /tmp/store-index-sicher.html "$P/public/index.html"
      { echo '<script>'; sed -e "s/__SPRACHE__/$L/" -e "s/__SZENE__/$S/" "$WURZEL/tools/store_bilder/szene.js"; echo '</script>'; } >> "$P/public/index.html"
      xcrun simctl terminate "$ID" app.lucenta.ios 2>/dev/null || true
      xcrun simctl launch "$ID" app.lucenta.ios >/dev/null
      # Der Debug-Bau zeichnet im Simulator erst nach 10–16 s, und jeder Start laedt fuer die Sprache einmal neu;
      # das erste Bild einer Sprache zusaetzlich fuer die Beispieldaten. Gemessen — kuerzer ergab schwarze Bilder.
      if [ $ERSTES = 1 ]; then sleep 65; ERSTES=0; else sleep 45; fi
      xcrun simctl io "$ID" screenshot "/tmp/store-roh/$L-$GROESSE-$S.png" >/dev/null 2>&1
      echo "  $L-$GROESSE-$S"
    done
    ERSTES=1
  done
  xcrun simctl terminate "$ID" app.lucenta.ios 2>/dev/null || true
  cp /tmp/store-index-sicher.html "$P/public/index.html"
  xcrun simctl status_bar "$ID" clear
done
node "$WURZEL/tools/store_bilder/rahmen.mjs" $SPRACHEN

#!/bin/sh
# Baut die App und installiert sie in einem Befehl:   npm run installieren [-- sim|iphone] [--ohne-sync]
# Ohne Angabe: Simulator UND iPhone. Fehlt das iPhone am Kabel, wird es uebersprungen, nicht abgebrochen.
#
# Fallen, die hier eingebaut sind:
# - CocoaPods braucht /opt/homebrew/bin und UTF-8, sonst scheitert ios:sync still auf altem Stand.
# - BuildProject/RunProject kopieren public/ oft nicht; xcodebuild nach `touch` schon.
# - Personal Team signiert weder iCloud noch App Group: Geraetebau nur mit HealthKit-Entitlements.
set -e
export PATH="/opt/homebrew/bin:$PATH" LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

SIM="${LUCENTA_SIM:-B55215E2-9318-4732-9132-F2D7FFFC18EC}"
GERAET="${LUCENTA_GERAET:-00008130-001E79CC0178001C}"
BUNDLE=app.lucenta.ios
WURZEL="$(cd "$(dirname "$0")/.." && pwd)"

ZIEL=beide; SYNC=1
for a in "$@"; do
  case "$a" in
    sim|iphone|beide) ZIEL="$a" ;;
    --ohne-sync) SYNC=0 ;;
    *) echo "unbekannt: $a  (sim | iphone | beide, --ohne-sync)"; exit 2 ;;
  esac
done

cd "$WURZEL"
if [ $SYNC = 1 ]; then
  npm run ios:sync 2>&1 | grep -E "dist/|Sync finished|error|Error|FEHL" || true
  [ -f ios/App/App/public/index.html ] || { echo "ios:sync hat kein public/index.html erzeugt"; exit 1; }
fi
cd ios/App
touch App/public App/public/index.html

bauen() { # $1 Ziel-ID, $2 Ordner, weitere Parameter an xcodebuild
  ziel="$1"; dd="$2"; shift 2
  xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug \
    -destination "id=$ziel" -derivedDataPath "$dd" "$@" build -quiet 2>&1 \
    | grep -E "error:|BUILD FAILED" | grep -v "exit code 0 but produced no further output" || true
}

if [ "$ZIEL" != iphone ]; then
  echo "== Simulator"
  xcrun simctl boot "$SIM" 2>/dev/null || true
  bauen "$SIM" /tmp/lucenta-dd
  APP=/tmp/lucenta-dd/Build/Products/Debug-iphonesimulator/App.app
  [ -d "$APP" ] || { echo "Simulator-Bau fehlgeschlagen"; exit 1; }
  xcrun simctl terminate "$SIM" "$BUNDLE" 2>/dev/null || true
  xcrun simctl install "$SIM" "$APP"
  xcrun simctl launch "$SIM" "$BUNDLE" >/dev/null && echo "   installiert und gestartet"
fi

if [ "$ZIEL" != sim ]; then
  echo "== iPhone"
  if ! xcrun devicectl list devices 2>/dev/null | grep "$GERAET" | grep -qE "connected|available"; then
    echo "   kein iPhone verbunden — uebersprungen"; exit 0
  fi
  ENT=/tmp/lucenta-health.entitlements
  [ -f "$ENT" ] || /usr/libexec/PlistBuddy -c "Add :com.apple.developer.healthkit bool true" "$ENT" >/dev/null
  bauen "$GERAET" /tmp/lucenta-dd-geraet -allowProvisioningUpdates CODE_SIGN_ENTITLEMENTS="$ENT"
  APP=/tmp/lucenta-dd-geraet/Build/Products/Debug-iphoneos/App.app
  [ -d "$APP" ] || { echo "Geraete-Bau fehlgeschlagen"; exit 1; }
  xcrun devicectl device install app --device "$GERAET" "$APP" 2>&1 | grep -E "installed|error|Error" || true
  if xcrun devicectl device process launch --device "$GERAET" "$BUNDLE" >/dev/null 2>&1; then
    echo "   installiert und gestartet"
  else
    echo "   installiert; Start ging nicht (Telefon gesperrt oder Entwickler nicht vertraut)"
  fi
fi

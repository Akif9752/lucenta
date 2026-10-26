#!/bin/sh
# Misst Flackern beim Seitenwechsel IN DER APP im Simulator: Ein Skript klickt 15 Wechsel durch, der
# Simulator nimmt auf, helligkeit.swift wertet jedes Bild aus. Flackern = die Helligkeit bricht in EINEM Bild
# ein und kommt danach zurueck; bleibt sie unten, ist nur die neue Seite dunkler. Headless-WebKit sieht das
# nicht (es zeichnet nicht auf einen Bildschirm). Vorher: npm run ios:sync, bauen, im Simulator installieren.
# Aufruf: sh tools/flackern/messen.sh <simulator-id>     (danach die App neu installieren — das Skript
# veraendert die installierte Kopie von index.html)
set -e
SIM="$1"; [ -n "$SIM" ] || { echo "Aufruf: sh tools/flackern/messen.sh <simulator-id>"; exit 1; }
HIER="$(cd "$(dirname "$0")" && pwd)"
swiftc -O -o /tmp/lucenta-helligkeit "$HIER/helligkeit.swift" 2>/dev/null
P=$(xcrun simctl get_app_container "$SIM" app.lucenta.ios app)
cat >> "$P/public/index.html" <<'SKRIPT'
<script>(function(){var s=['btnDrawerToggle','btnDrawerSettings','btnSpracheOeffnen','btnNavZurueck','btnHome','btnDrawerToggle','btnDrawerFreunde','btnHome','btnLandingStateHistory','btnHome','btnDrawerToggle','btnDrawerSettings','btnSpracheOeffnen','btnNavZurueck','btnHome'],i=0;setTimeout(function l(){if(i>=s.length)return;var e=document.getElementById(s[i]);if(e)e.click();i++;setTimeout(l,1400)},3000)})();</script>
SKRIPT
xcrun simctl terminate "$SIM" app.lucenta.ios 2>/dev/null || true
xcrun simctl launch "$SIM" app.lucenta.ios >/dev/null
xcrun simctl io "$SIM" recordVideo --codec=h264 --force /tmp/lucenta-flackern.mov >/dev/null 2>&1 & REC=$!
sleep 30; kill -INT $REC; sleep 2
/tmp/lucenta-helligkeit /tmp/lucenta-flackern.mov > /tmp/lucenta-hell.txt
python3 - <<'PY'
d=[tuple(map(float,l.split())) for l in open('/tmp/lucenta-hell.txt')]
d=[x for x in d if x[0]>2]; flackern=0
for i in range(3,len(d)-15):
    for k in (1,2):
        if d[i][k]-d[i-1][k] < -8:
            vor=sum(d[j][k] for j in range(i-3,i))/3; nach=sum(d[j][k] for j in range(i+10,i+15))/5
            if abs(nach-vor) < abs(d[i][k]-vor)*0.5:
                flackern+=1; print('  FLACKERN bei %.2fs (%s): %.1f -> %.1f -> %.1f' % (d[i][0], 'oben' if k==1 else 'unten', vor, d[i][k], nach))
print('Flackern:', flackern, '(15 Wechsel)'); raise SystemExit(1 if flackern else 0)
PY

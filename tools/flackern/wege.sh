#!/bin/sh
# Nimmt im Simulator einen Klickpfad durch Haupt- und Unterseiten auf und zeigt je Klick die Bewegungsphasen
# (bewegung.swift). Eine zweite Phase nach dem Wechsel ist ein Zucken, ein spaeter Beginn ein Ruckeln.
# Aufruf: sh tools/flackern/wege.sh   (vorher npm run installieren -- sim)
SIM=${1:-B55215E2-9318-4732-9132-F2D7FFFC18EC}
swiftc -O -o /tmp/lucenta-bewegung "$(dirname "$0")/bewegung.swift" 2>/dev/null
P=$(xcrun simctl get_app_container $SIM app.lucenta.ios app)
cp "$P/public/index.html" /tmp/index-sicher.html
cat >> "$P/public/index.html" <<'SKRIPT'
<script>(function(){var s=['tabProfil','btnProfilEinstellungen','btnSpracheOeffnen','btnNavZurueck','btnSymbolOeffnen','btnNavZurueck','btnHome','tabProfil','btnAussehenOeffnen','btnNavZurueck','btnHome','tabTagesform','btnHome','tabVerstehen','btnVsArchetypen','btnHome'],i=0;setTimeout(function l(){if(i>=s.length)return;var e=document.getElementById(s[i]);console.log('KLICK '+s[i]+' '+Date.now());if(e)e.click();i++;setTimeout(l,1600)},4000)})();</script>
SKRIPT
xcrun simctl terminate $SIM app.lucenta.ios 2>/dev/null
(xcrun simctl launch --console-pty $SIM app.lucenta.ios > /tmp/bew-konsole.txt 2>&1 &)
xcrun simctl io $SIM recordVideo --codec=h264 --force /tmp/lucenta-bew.mov > /tmp/bew-rec.txt 2>&1 & REC=$!
python3 -c 'import time;print(int(time.time()*1000))' > /tmp/bew-start.txt
sleep 36; kill -INT $REC; sleep 2; xcrun simctl terminate $SIM app.lucenta.ios
cp /tmp/index-sicher.html "$P/public/index.html"
/tmp/lucenta-bewegung /tmp/lucenta-bew.mov > /tmp/bew.txt; wc -l /tmp/bew.txt
python3 "$(dirname "$0")/wege_auswerten.py"

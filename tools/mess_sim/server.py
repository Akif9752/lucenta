#!/usr/bin/env python3
"""Server fuer die Fluessigkeitsmessung im Simulator (Runde 113).

Liefert das Repository aus (damit /dist/lucenta.html und /tools/mess_sim/seite.html denselben
Ursprung haben und die Messseite in den Rahmen der App hineingreifen darf) und nimmt unter
POST /ergebnis das Ergebnis entgegen. Das Ergebnis landet als JSON in /tmp/mess_sim.json.

Benutzung (der Simulator teilt das Netz des Macs, 127.0.0.1 erreicht also diesen Server):

    python3 tools/mess_sim/server.py 8018 &
    xcrun simctl openurl <Geraet> http://127.0.0.1:8018/tools/mess_sim/seite.html
    # nach rund drei Minuten liegt das Ergebnis in /tmp/mess_sim.json

`openurl` meldet dabei oft "Operation timed out", obwohl Safari die Seite oeffnet — auf die Datei
warten, nicht auf die Meldung.

Was die Zahlen taugen: Der Simulator setzt anders als headless WebKit wirklich zusammen, malt die
2D-Zeichenflaeche aber auf der CPU des Macs; ein iPhone malt sie auf der GPU. Er kann also
uebertreiben. Und er drosselt Safari mitunter auf 30 Bilder pro Sekunde — dann liegt schon die
Eichung "Ruhe" bei 33 ms. Verglichen wird deshalb nur INNERHALB eines Laufs, nie zwischen Laeufen.

Warum ein eigener Server und nicht der auf 8017: Der liefert nur dist/ aus, und die Messseite
gehoert nicht in einen erzeugten Ordner.
"""
import http.server
import json
import os
import sys

WURZEL = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ZIEL = '/tmp/mess_sim.json'


class Halter(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=WURZEL, **k)

    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0))
        daten = self.rfile.read(n)
        with open(ZIEL, 'wb') as f:
            f.write(daten)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'ok')
        print('Ergebnis empfangen:', len(daten), 'Byte', flush=True)

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8018
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Halter).serve_forever()

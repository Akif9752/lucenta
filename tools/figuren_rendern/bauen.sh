#!/bin/sh
# Uebersetzt das Werkzeug mit Optimierung (das Abstandsfeld sind Millionen Auswertungen) und rendert.
set -e
cd "$(dirname "$0")"
swiftc -O -o /tmp/lucenta-figuren-rendern Modell.swift Szene.swift Tiere.swift main.swift
/tmp/lucenta-figuren-rendern "$@"

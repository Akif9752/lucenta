#!/bin/sh
# Uebersetzt das Werkzeug mit Optimierung (das Abstandsfeld sind Millionen Auswertungen) und rendert.
# Uebersetzt nur, wenn eine .swift-Datei neuer ist als das Programm (~23 s gespart je Aufruf).
# NUR_UEBERSETZEN=1: nur uebersetzen, nichts rendern.
set -e
cd "$(dirname "$0")"
BIN=/tmp/lucenta-figuren-rendern
if [ ! -x "$BIN" ] || [ -n "$(find . -name '*.swift' -newer "$BIN")" ]; then
  swiftc -O -o "$BIN" Modell.swift Szene.swift Tiere.swift main.swift
fi
[ -n "$NUR_UEBERSETZEN" ] && exit 0
"$BIN" "$@"

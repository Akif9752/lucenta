# -*- coding: utf-8 -*-
"""Zaehlt die Zeichen der App-Store-Texte und vergleicht sie mit den Angaben im Dokument.

Entstanden aus einem echten Fehler, und zwar demselben, der sich durch dieses Projekt zieht:
Ich hatte in docs/store-eintrag.md 32 Zeichenzahlen in die Ueberschriften geschrieben — alle
ausgedacht, keine gezaehlt. Beim ersten Lauf dieses Skripts war jede einzelne falsch, eine davon
um mehr als das Doppelte (japanische Schluesselwoerter: behauptet 88, tatsaechlich 42).

Zwei Dinge werden geprueft:
  1. Stimmt die Zahl in der Klammer mit der tatsaechlichen Laenge ueberein?
  2. Liegt die Laenge unter Apples Grenze?

Die zweite Frage allein wuerde reichen, um bei App Store Connect nicht abgewiesen zu werden.
Die erste steht daneben, weil eine Zahl im Dokument, die nicht stimmt, schlimmer ist als keine:
Wer sie liest, verlaesst sich darauf.
"""
import re, sys, io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PFAD = os.path.join(ROOT, 'docs', 'store-eintrag.md')

# Apples Grenzen, je Feldart. Der Name steht in App Store Connect unter "App-Name", der
# Untertitel darunter; beide werden in der Suche gelesen. Die Schluesselwoerter zaehlen
# INKLUSIVE der Kommas — deshalb stehen sie ohne Leerzeichen da.
GRENZEN = {
    30:  ['Name', 'Nombre', 'Nom', 'Nome', 'Ad', '名前',
          'Untertitel', 'Subtitle', 'Subtítulo', 'Sous-titre', 'Sottotitolo', 'Altyazı', 'サブタイトル'],
    100: ['Schlüsselwörter', 'Keywords', 'Palabras clave', 'Mots-clés', 'Parole chiave',
          'Palavras-chave', 'Anahtar kelimeler', 'キーワード'],
    170: ['Werbetext', 'Promotional text', 'Texto promocional', 'Texte promotionnel',
          'Testo promozionale', 'Tanıtım metni', 'プロモーションテキスト'],
}
GRENZE = {feld: g for g, felder in GRENZEN.items() for feld in felder}

def main():
    if not os.path.exists(PFAD):
        print('docs/store-eintrag.md fehlt.'); return 2
    text = io.open(PFAD, encoding='utf-8').read()
    treffer = list(re.finditer(r'\*\*([^*(]+) \((\d+)\):\*\* `([^`]*)`', text))
    if not treffer:
        print('Keine Felder mit Zeichenangabe gefunden — hat sich das Format geaendert?')
        return 1
    fehler = []
    unbekannt = []
    print('\nApp-Store-Texte: Zeichen gezaehlt\n')
    for m in treffer:
        feld, behauptet, wert = m.group(1).strip(), int(m.group(2)), m.group(3)
        echt = len(wert)
        grenze = GRENZE.get(feld)
        if grenze is None:
            unbekannt.append(feld)
        marke = '  ok   '
        if echt != behauptet:
            marke = '  FAIL '; fehler.append('%s: Angabe %d, gezaehlt %d' % (feld, behauptet, echt))
        elif grenze and echt > grenze:
            marke = '  FAIL '; fehler.append('%s: %d Zeichen ueber der Grenze von %d' % (feld, echt, grenze))
        knapp = ''
        if grenze and echt == grenze:
            knapp = '  (genau auf der Grenze)'
        print('%s%-22s %3d Zeichen, Grenze %s%s' % (marke, feld, echt, grenze if grenze else '?', knapp))
    if unbekannt:
        print('\nFelder ohne hinterlegte Grenze: %s' % ', '.join(sorted(set(unbekannt))))
    print('\n======================================================')
    if fehler:
        print('%d ANGABE(N) FALSCH' % len(fehler))
        for f in fehler: print('   ' + f)
    else:
        print('ALLE %d ANGABEN STIMMEN UND LIEGEN UNTER DER GRENZE' % len(treffer))
    print('======================================================')
    return 1 if fehler else 0

if __name__ == '__main__':
    sys.exit(main())

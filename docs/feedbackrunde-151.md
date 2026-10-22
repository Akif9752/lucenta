# Feedbackrunde 151 — Lucenta von A bis Z (2026-10-22)

Auftrag des Inhabers: die App wie ein App-Experte und Tester von A bis Z ansehen, lesen, ausprobieren und
daraus eine Liste mit Verbesserungen machen. Grundlage: automatischer Rundgang auf WebKit (13 Seiten, ein
vollständiger Testdurchlauf, Pruefung auf JS-Fehler, Platzhalter, Ueberlauf, Tippflaechen), Durchsicht der
Bildschirme, Durchsicht von Quelltext, Info.plist, Texten und Store-Unterlagen.

**Was gut ist:** keine JS-Fehler und keine Konsolenwarnung auf allen 13 Seiten; der Test laeuft vollstaendig
durch; die Fehlersuche (26 Konfigurationen, WebKit + Chromium) ohne Fund; keine Platzhalter oder
uebersetzungsluecken im sichtbaren Text; Kontraste halten auch im gedaempften Hellmodus.

## A — Kritisch (vor dem Store-Start)

1. **Doppelte Ergebnisse auf der letzten Frage.** Nachgestellt: Drei Tipps auf Frage 50 im Abstand von
   ~0,5 s speichern drei Ergebnisse binnen einer Sekunde. Folge: Verlauf voller Dubletten, „Verglichen mit
   deinem letzten Ergebnis" mit lauter gleichen Werten, „Dein Verlauf umfasst bereits 3 Durchlaeufe" nach
   einem einzigen Test. *Vorschlag:* nach Antwort 50 die Skala sperren, bis das Ergebnis steht.
2. **Impressum leer** (`IMPRESSUM` in `17-settings.js`: Name, Strasse, Ort, E-Mail). In Deutschland
   Pflicht; auch die Datenschutzerklaerung nennt keinen Verantwortlichen. *Nur vom Inhaber.*
3. **Privacy Manifest der App fehlt.** Der eigene Swift-Code nutzt `UserDefaults` (Farbschema,
   Apple-Kennung) — eine „Required Reason API". Ohne `PrivacyInfo.xcprivacy` (Grund CA92.1) weist App Store
   Connect den Upload zurueck (ITMS-91053).
4. **Konto loeschen fehlt** (Richtlinie 5.1.1(v)): Wer eine Anmeldung anbietet, muss sie in der App loeschen
   lassen. *Vorschlag:* „Anmeldung und iCloud-Daten loeschen" (Datensatz loeschen, Kennung vergessen,
   Hinweis auf Einstellungen → Apple-ID → „Mit Apple anmelden"). Risiko: Apple verlangt zusaetzlich den
   Widerruf des Tokens ueber seine Schnittstelle — das braucht eigentlich einen Server; vor der Einreichung
   klaeren.
5. **Widerspruechliche Versprechen seit der Anmeldung:** Kauffenster „Kein Konto · … · Deine Daten bleiben
   auf dem Geraet" (`plus_vertrauen`, 8 Sprachen), Store-Text „Kein Konto. Kein Server." (`docs/store-eintrag.md`).

## B — Hoch (Nutzererlebnis)

6. **Zwei verschiedene Codes.** Ergebnisseite und Vergleich zeigen den Ergebnis-Code, Freunde brauchen den
   Freundescode. Fuer Nutzer kaum zu unterscheiden. *Vorschlag:* ueberall nur noch den Freundescode zeigen
   und teilen (er funktioniert auch im Vergleichsfeld).
7. **Einladen ohne Antippen.** Der Code muss kopiert und eingefuegt werden. *Vorschlag:* eigenes URL-Schema
   (`lucenta://freund/…`) — ein Tipp in der Nachricht oeffnet die App und legt den Freund an; ohne Server.
8. **Dynamic Type fehlt.** Die App ignoriert die in iOS eingestellte Textgroesse (kein
   `-apple-system-body`/`text-size-adjust`). Minus fuer die Barrierefreiheitsangaben im Store.
9. **Navigation nicht iOS-typisch.** Zurueck ist eine eigene Pille „← Start" UNTER der Kopfzeile (36 pt
   hoch); der Seitentitel steht bis zu dreimal (Kopfzeile, Ueberzeile, Ueberschrift). *Vorschlag:* Pfeil
   links in der Kopfzeile, Titel einmal.
10. **Fragetexte ohne „Ich".** „Habe einen reichen Wortschatz" liest sich wie ein Befehl. Folgt dem
    englischen IPIP-Original (ebenfalls ohne „I"), ist im Deutschen aber holprig. *Vorschlag:* „Ich habe …"
    (Bedeutung unveraendert; alle acht Sprachen einzeln pruefen).
11. **Antwortbeschriftungen sehr klein** („gar nicht … voll", ~11 pt) — die wichtigste Bedienung des Tests.
12. **Ergebnisseite sehr lang** (~3.600 px, vier Bildschirme), viel Fliesstext vor dem Radar. *Vorschlag:*
    Typ + Radar zusammen oben, Erklaertexte einklappbar.

## C — Mittel (Feinschliff)

13. **Haptik-Beschreibung veraltet:** „Kurzer Impuls bei jeder Antwort im Fragebogen" — seit Runde 126 bei
    jedem Tipp.
14. **„Kopieren" sichtbar ohne Freundescode** (vor dem ersten Test): `hidden` wird von der Knopfklasse
    ueberschrieben.
15. **Dauer uneinheitlich:** Store „sieben Minuten", Onboarding „5 bis 10 Minuten". Einmal messen, dann
    ueberall gleich.
16. **Ueberschrift uneinheitlich:** Onboarding „Lerne dich kennen – mit Wissenschaft.", Startseite „Lern
    dich kennen — mit Wissenschaft, nicht mit Sternzeichen."
17. **Gesperrtes „Weiter" im Onboarding** (Schritt 2) sieht aus wie ein aktiver Knopf.
18. **Exportangabe fehlt** (`ITSAppUsesNonExemptEncryption` in Info.plist) — sonst bei jedem Upload die Frage.
19. **Startbild immer schwarz** — wer Hell gewaehlt hat, sieht beim Start kurz Schwarz (bewusste Folge aus
    Runde 149; ggf. die Wahl ins Startbild uebernehmen, soweit iOS es zulaesst).

## Erledigt durch diese Runde

- Der offene Punkt aus Runde 149 (stehender Fragebogen-Hintergrund im Dunkelmodus „0 %") ist kein Fehler:
  Auf dem Bild sind die Sterne da; die Messung bezog sich auf die falsche Groesse.

## Stand nach Runde 152

Erledigt: **A1, A3, A4, A5, B6, B7** (B7 scharf erst mit Domain, `einladung/LIESMICH.md`). Begruendung und
Grenzen im Journal unter Runde 152.

Runde 153: **B8** (Dynamic Type bis 200 %). Offen: A2 (Inhaber), B9–B12, C13–C19.

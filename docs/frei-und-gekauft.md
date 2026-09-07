---
titel: Wo die Grenze zwischen freier und gekaufter Fassung verläuft
stand: 2026-09
---

# Frei und gekauft

## Die Linie in einem Satz

> **Frei ist das vollständige Bild von heute. Gekauft ist alles, was erst aus mehreren
> Messungen entsteht.**

Diese Linie ist nicht gegriffen. Sie ist die Aussage der App selbst, in ein Preismodell
übersetzt: Lucenta sagt seit Runde 79 auf der Ergebnisseite, dass ein einzelner Durchlauf nur
auf Wochensicht als stabil gilt und dass sich das Bild über Monate verschiebt. Genau dort
liegt der Wert, für den zu zahlen sich lohnt — und genau dort, nirgends sonst, verläuft die
Grenze.

Der Vorteil dieser Linie ist, dass sie sich in einem Satz erklären lässt und keine Ausnahme
braucht. Jede andere Aufteilung, die ich geprüft habe, zerfiel in eine Liste willkürlicher
Einzelentscheidungen, die man auf einer Kaufseite nicht mehr begründen kann.

## Drei Dinge, die nicht verhandelbar sind

**1. Niemand zahlt für sein Ergebnis.** Wer fünfzig Aussagen beantwortet hat, sieht das
vollständige Porträt — alle fünf Werte, das Fünfeck, den Archetyp, alle fünf
Dimensionskarten mit Alltag, Beziehungen und Wachstum. Ein Ergebnis hinter eine Zahlung zu
stellen, nachdem jemand die Arbeit geleistet hat, ist Erpressung und keine Preisgestaltung.
Es wäre außerdem das Ende der Glaubwürdigkeit einer App, die mit Seriosität gegen
Astrologie antritt.

**2. Es wird nichts gelöscht und nichts weggenommen.** Die freie Fassung *zeigt* weniger.
Alles Eingetragene bleibt liegen und ist vollständig wieder da, sobald jemand kauft. Deshalb
sagt der Hinweiskasten auch „Du hast 71 weitere Tage erfasst. Sie liegen gespeichert" und
nicht „Freischalten, um mehr zu sehen". Daten, die jemand selbst erzeugt hat, sind seine.

**3. Der Vergleich bleibt in seiner Grundform frei.** Er ist die einzige Stelle, an der eine
zweite Person dazukommt — der Produktplan nennt ihn ausdrücklich als Wachstumsmechanik. Ihn
zu verschließen kostet mehr, als er einbringt.

## Was in welcher Fassung steht

| | frei | gekauft |
|---|---|---|
| Fragebogen, alle 50 Aussagen | ✓ | ✓ |
| Vollständiges Ergebnis: fünf Werte, Fünfeck, Archetyp, Kurzporträt | ✓ | ✓ |
| Alle fünf Dimensionskarten (Alltag · Beziehungen · Wachstum) | ✓ | ✓ |
| Ergebniscode und Ergebnisbild zum Teilen | ✓ | ✓ |
| Archetypen-Übersicht | ✓ | ✓ |
| Profil: Name, alle 22 Figuren, alle 10 Hintergründe | ✓ | ✓ |
| Sieben Sprachen, Darstellung, Datenexport, Rechtliches | ✓ | ✓ |
| Tagesform eintragen, so oft man mag | ✓ | ✓ |
| Vergleich: Prozentwert, Fünfeck, ein Satz je Dimension | ✓ | ✓ |
| **Verlauf über mehr als zwei Durchläufe** | – | ✓ |
| **Tagesform über 14 Tage hinaus** | – | ✓ |
| **Die drei Tagesform-Befunde** (Schwankung, Wochentage, Tageszeit) | – | ✓ |
| **Vergleich in der Tiefe** (Alltag · Gespräch · Gemeinsam) | – | ✓ |
| **Vergleiche speichern (Archiv)** | – | ✓ |
| **Verstehen: Zusammenspiel deiner Werte** | – | ✓ |
| **Verstehen: was in deinen eigenen Daten steht** | – | ✓ |
| **Das „+" an der Wortmarke in der Kopfzeile** | – | ✓ |

Das „+" an der Wortmarke ist die einzige Zeile in dieser Tabelle, die nichts freischaltet.
Sie steht trotzdem darin: Ohne sie lässt sich die Frage „habe ich das eigentlich noch?"
nur über Umwege beantworten — den Verlauf öffnen und nachsehen, ob mehr als zwei
Durchläufe stehen. Ein Kauf, den man suchen muss, fühlt sich nicht wie einer an.

## Warum diese Zahlen

**Zwei Durchläufe frei.** Genug, um zu sehen *dass* sich etwas bewegt — die Delta-Karte auf
der Ergebnisseite zeigt den Vergleich zum letzten Mal weiterhin. Zu wenig, um zu sehen *wie*.
Wer zum zweiten Mal testet, hat gerade den Beweis gesehen, dass die Kurve etwas erzählt.

**Vierzehn Tage Tagesform frei.** Der erste Befund braucht sieben Tage, der zweite vierzehn.
Wer die Grenze erreicht, hat also gerade den Punkt erreicht, an dem es etwas zu holen gäbe.
Das ist der ehrlichste Moment für einen Hinweis: nicht am Anfang, wo er nur stört, sondern
dort, wo die Person selbst die Arbeit hineingesteckt hat.

## Preisform

**Empfehlung: einmaliger Kauf, kein Abo.** Der Grund ist nicht Sympathie, sondern die
Architektur: Alle Daten liegen auf dem Gerät. Ein Abo, das nach dem Kündigen den eigenen,
lokal gespeicherten Verlauf wieder verschließt, ist genau die Art von Geiselnahme, die
Punkt 2 oben ausschließt. Ein einmaliger Kauf hat dieses Problem nicht.

Der Preis von 4,99 € steht im Produktplan bereits als Planung (und wurde in Runde 46
ausdrücklich als *Planung* und nicht als Nachlass gekennzeichnet). Für einen einmaligen Kauf
halte ich **6,99 €** für angemessener: Es ist der Bereich, in dem ein Kauf ohne Nachdenken
passiert, und es ist mehr als das, was eine einzelne Kaffeepause kostet — was zu einem
Produkt passt, das ein halbes Jahr begleitet.

**Was das kostet:** wiederkehrende Einnahmen. Wer die braucht, sollte die Grenze *nicht*
verschieben, sondern später eine echte Erweiterung verkaufen (etwa den Vergleich für Gruppen
oder einen exportierbaren Jahresbericht), statt Bestehendes hinter ein Abo zu ziehen.

## Wie es im Code aussieht

Ein Schalter, eine Marke: `lucenta_plus` im lokalen Speicher, gelesen über `istPlus()`.
Die fünf verschlossenen Stellen benutzen **einen** Baustein (`schlossHTML`) — fünf
verschieden formulierte Hinweise fühlten sich wie fünf verschiedene Verkäufe an.

Der Kasten steht **anstelle** des Inhalts, nicht darüber. Ein verwaschener Inhalt dahinter
wäre die übliche Lösung und die schlechtere: Er zeigt her, was man nicht haben kann, und das
ist näher an Reklame als an einem Hinweis. Kein Countdown, keine erfundene Dringlichkeit,
kein zweiter Hinweis an derselben Stelle — dieselbe Grenze, an der in Runde 46 der
Serien-Zähler verworfen wurde.

Unter Profil steht ein Entwickler-Umschalter zwischen beiden Fassungen, im selben Bereich wie
die Beispielnutzerin und aus demselben Grund: Beide Zustände wären sonst nur zu sehen, indem
man den Speicher von Hand ändert. **Vor der Veröffentlichung muss dieser Umschalter raus** —
er steht auf der Liste in `docs/app-store-start.md`.

---
titel: Wo die Grenze zwischen freier und gekaufter Fassung verläuft
stand: 2026-11 (nach Runde 229, mit dem Code abgeglichen)
---

# Frei und gekauft

## Die Linie in einem Satz

> **Frei ist das Bild von heute. Gekauft ist alles, was erst aus mehreren Messungen entsteht —
> und die ausführliche Deutung des eigenen Ergebnisses.**

Die ursprüngliche Linie (Runde 79) hatte nur den ersten Satz. Den zweiten Teil hat der Inhaber
hinzugesetzt: Seit Runde 170 sind die drei Abschnitte je Dimension („Im Alltag", „In Beziehungen",
„Wachstumsimpuls") Lucenta+, und Runde 222 hat das bestätigt („Im Alltag" bleibt Lucenta+, kein
Einmalkauf). Lucenta sagt auf der Ergebnisseite weiter, dass ein einzelner Durchlauf nur auf
Wochensicht als stabil gilt und sich das Bild über Monate verschiebt — dort liegt der Kern dessen,
was das Abo fortlaufend leistet.

## Was nicht verhandelbar ist

**1. Das Ergebnis selbst ist frei.** Wer fünfzig Aussagen beantwortet hat, sieht alle fünf Werte,
das Fünfeck, den Archetyp mit Motto und Kurzfassung und je Dimension den Wert mit Kernsatz. Die
ausführliche Deutung je Dimension ist Lucenta+ (Entscheidung des Inhabers, s. o.) — sie steht als
verschwommene Vorschau des echten Textes da, nicht als leere Stelle.

**2. Es wird nichts gelöscht.** Die freie Fassung *zeigt* weniger. Alles Eingetragene bleibt
gespeichert und ist vollständig wieder da, sobald Lucenta+ aktiv ist. Daten, die jemand selbst
erzeugt hat, sind seine: „Daten sichern" nimmt jederzeit alles mit, ohne Abo.

**3. Der Vergleich bleibt in seiner Grundform frei** — mit zwei anderen Personen (`FREI_VERGLEICHE`),
dieselbe Person beliebig oft. Er ist die Stelle, an der eine zweite Person dazukommt; ihn ganz zu
verschließen kostete mehr, als er einbringt.

## Was in welcher Fassung steht

| | frei | Lucenta+ |
|---|---|---|
| Fragebogen, alle 50 Aussagen | ✓ | ✓ |
| Ergebnis: fünf Werte, Fünfeck, Archetyp, Motto, Kurzfassung, je Dimension Wert + Kernsatz | ✓ | ✓ |
| Ergebnisbild und Freundescode zum Teilen | ✓ | ✓ |
| Archetypen-Übersicht (unter Verstehen) | ✓ | ✓ |
| Profil: Name, Benutzer-ID, alle 20 Tiere | ✓ | ✓ |
| Hintergründe: 5 von 24 (`HG_FREI`) | ✓ | alle 24 |
| Zubehör: Schal ab 7 Tagen mit Eintrag | ✓ | + Mütze (ab 30 Tagen), Blume (ab 100 Tagen) |
| Tagesform eintragen (bis zu drei Tageszeiten), Erinnerung, Serie, Meilensteine | ✓ | ✓ |
| Tagesform sehen: die letzten 7 Tage (`FREI_TAGE`) | ✓ | alle Tage, Zeitraum wählbar |
| Muster: das erste ab sieben Tagen | ✓ | alle |
| Rückblick Woche: Schnitt | ✓ | + bester Tag, Vergleich zur Vorwoche, frühere Wochen |
| Vergleich mit zwei Personen: Prozentwert, Fünfeck, ein Satz je Dimension | ✓ | ✓ |
| Sprachen, Darstellung, Daten sichern/einspielen, Sperre, Health, Widget, Rechtliches | ✓ | ✓ |
| **Die ausführliche Deutung je Dimension** (Im Alltag · In Beziehungen · Wachstumsimpuls) | – | ✓ |
| **Verlauf über mehr als zwei Durchläufe** (`FREI_DURCHLAEUFE`) | – | ✓ |
| **Bandbreite, Kalender, Rückblick Monat und Jahr** | – | ✓ |
| **Vergleich mit mehr als zwei Personen, in der Tiefe, Bericht über zwei Freunde, Gruppenbild** | – | ✓ |
| **Verstehen** (ganz Lucenta+ seit Runde 136; frei die Vorschau des ersten Bereichs) | – | ✓ |
| **Ausführlicher Test** (116 Aussagen, 29 Facetten) | – | ✓ |
| **Alternative App-Symbole** (Nacht, Papier, Abendrot, Ozean, Lavendel) | – | ✓ |
| Das „+" an der Wortmarke in der Kopfzeile | – | ✓ |

Das „+" an der Wortmarke schaltet nichts frei. Es steht trotzdem in der Tabelle: Ohne es ließe sich
die Frage „habe ich das eigentlich noch?" nur über Umwege beantworten.

## Gesperrt heißt: verschwommene Vorschau

Was Lucenta+ ist, steht als **verschwommene Vorschau des echten Inhalts** da (`vorschauHTML`), mit
einem Satz darüber, was es zeigt, und dem Weg zum Kauffenster. Das löste den früheren Kasten „anstelle
des Inhalts" ab: Man sieht, dass dort wirklich etwas aus den eigenen Daten steht. Kein Countdown, keine
erfundene Dringlichkeit, keine erfundene Beliebtheit, kein zweiter Hinweis an derselben Stelle.

## Warum diese Zahlen

**Zwei Durchläufe frei.** Genug, um zu sehen *dass* sich etwas bewegt — die Delta-Karte zeigt den
Vergleich zum letzten Mal. Zu wenig, um zu sehen *wie*.

**Sieben Tage Tagesform frei** (Entscheidung des Inhabers, `FREI_TAGE` in `src/js/03-speicherung.js`;
ursprünglich vierzehn). Nach einer Woche ist das Eintragen zur Gewohnheit geworden, und der erste Befund
braucht genau sieben Tage — wer die Grenze erreicht, hat also gerade den Punkt erreicht, an dem es etwas
zu holen gäbe.

**Zwei Personen im Vergleich frei.** Der erste Vergleich zeigt, was der Vergleich kann; ab der dritten
Person ist es ein Werkzeug für den Freundeskreis.

## Preisform

**Abo, 4,99 € im Monat oder 29,99 € im Jahr** (Runde 95), in einer Abo-Gruppe: `lucenta.plus.monat`,
`lucenta.plus.jahr`. **Kein Einmalkauf** (Runde 222, Entscheidung des Inhabers — nicht erneut vorschlagen).
In der App stehen die Preise des Stores (Land, Währung); ohne Antwort die festen Beträge.

- **Probezeit:** nur wenn das Jahresabo in App Store Connect eine hat — die Länge kommt vom Store,
  nie aus der App.
- **Rückgewinnung:** ein Angebot des Stores für Gekündigte, wenn eingerichtet; die App erfindet keines.
- **Pflichten (Richtlinie 3.1.2):** „Käufe wiederherstellen" immer erreichbar (Einstellungen, Kauffenster,
  Lucenta+-Seite), „Abo verwalten" öffnet Apples Blatt, der Hinweis zur Kündigung in den iPhone-Einstellungen,
  Nutzungsbedingungen (Apples EULA) und Datenschutz am Kauffenster.

**Nach dem Kündigen** zeigt die App wieder die freie Fassung (Entscheidung des Inhabers, Runde 231).
Weggenommen wird nichts — alles bleibt gespeichert, kommt mit Lucenta+ zurück und lässt sich jederzeit über
„Daten sichern" mitnehmen.

## Wie es im Code aussieht

- `istPlus()` liest `lucenta_plus` im lokalen Speicher; gesetzt wird es nur über die Kauf-Brücke
  (`LucentaKaeufePlugin.swift`, StoreKit 2): beim Kauf, beim Wiederherstellen und beim Start über
  `StoreKit.stand`. Lucenta+ wird nur bei klarer Antwort des Stores weggenommen, eine Störung nimmt nichts.
- Die Grenzen stehen als Konstanten in `03-speicherung.js` (`FREI_TAGE`, `FREI_DURCHLAEUFE`,
  `FREI_VERGLEICHE`) und `15-figuren.js` (`HG_FREI`, `ZUBEHOER`).
- Gesperrtes nutzt einen Baustein: `vorschauHTML(inhalt, satz)` (`05-verlauf.js`).
- Der Umschalter frei/Lucenta+ im Profil gibt es nur im Entwicklungsbau (`#if DEBUG`, `entwicklungsBau()`);
  im Store-Bau fehlt er.

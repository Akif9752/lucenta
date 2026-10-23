# Lucenta gegen die App Store Review Guidelines (Runde 158, 2026-10-23)

Geprueft am Code und an den Store-Unterlagen, nicht durch Apple. Grundlage: die Richtlinien in ihrer
bekannten Fassung; vor der Einreichung die aktuelle Fassung auf developer.apple.com gegenlesen.

## Behoben in dieser Runde

| Richtlinie | Befund | Was jetzt gilt |
| --- | --- | --- |
| 3.1.2 Abos | Kein Link zu den Nutzungsbedingungen (EULA) im Kaufablauf — einer der haeufigsten Ablehnungsgruende. | Kauffenster und Lucenta+-Seite: „Nutzungsbedingungen (EULA)" (Apples Standard-EULA) und „Datenschutz" (Rechtsseite der App). |

## Erfuellt

| Richtlinie | Wie |
| --- | --- |
| 1.4.1 Gesundheit | Keine Diagnosesprache; „Kein klinisches Instrument — dient der Selbstreflexion". |
| 2.1 Vollstaendigkeit | Laeuft ohne Netz; Kauf mit StoreKit-Testdatei pruefbar. **Ausnahme: Impressum leer (A2).** |
| 2.5 / 4.2 Mindestfunktion | Gebuendelte App mit nativen Teilen (StoreKit, Mitteilungen, Haptik, CloudKit, Mit Apple anmelden), kein eingewickelter Webauftritt. |
| 3.1.1 In-App-Kauf | Lucenta+ nur ueber StoreKit; „Kaeufe wiederherstellen" vorhanden. |
| 3.1.2 Abos | Preis, Laufzeit, „verlaengert sich automatisch", Kuendigungsweg am Kaufknopf; „Abo verwalten" ueber Apples Blatt. |
| 4.8 Mit Apple anmelden | Einzige Anmeldung; keine fremde Anmeldung ohne Apple. |
| 5.1.1(i) Datenschutz | Datenschutzerklaerung in der App; Privacy Manifest; „Data Not Collected" stimmt. |
| 5.1.1(v) Konto loeschen | „Anmeldung und iCloud-Daten loeschen" in der App; Notiz fuer die Pruefung in `app-store-start.md`. |
| 5.1.2 Datennutzung | Kein Tracking, keine Weitergabe; Freundescodes verschickt die Person selbst. |
| Export | `ITSAppUsesNonExemptEncryption = false`. |

## Offen — nur der Inhaber

1. **Impressum** (A2) fuellen — in Deutschland Pflicht, und eine leere Pflichtangabe wirkt unfertig (2.1).
2. **Datenschutz-URL fuer App Store Connect** (5.1.1(i)): Apple verlangt sie als Web-Adresse. Die
   statische Seite aus `einladung/` kann sie tragen (eine `datenschutz.html` daneben).
3. **Bildschirmfotos neu** (2.3.3): Die Store-Bilder in `assets/store/` sind vom 2026-09-08 — vor Freunde,
   Navigation, Ergebnisseite und Skala. `node tools/store_bilder.mjs` erzeugt sie neu; erst nach den
   laufenden Gestaltungsrunden sinnvoll.
4. Abo-Produkte in App Store Connect, Faehigkeiten im bezahlten Account (siehe `app-store-start.md`).

## Risiken bei neuen Wuenschen

- **Pflicht-Anmeldung beim Start** (5.1.1(v)): „If your app doesn't include significant account-based
  features, let people use it without a login." Test, Ergebnis und Tagesform laufen ohne Konto. Eine Pflicht ist
  ein wahrscheinlicher Ablehnungsgrund.
- **Auffindbare Benutzer-ID** (1.2 nutzererzeugte Inhalte, 5.1.1): Sobald Menschen einander ueber eine ID
  finden, braucht es ein Verzeichnis auf einem Server (auch CloudKit-Public ist fuer den Entwickler lesbar) —
  dann ist „Data Not Collected" falsch (Kennung, Name), und Apple verlangt Melden, Blockieren und Filtern
  anstoessiger Namen.
- **Spaeter E-Mail/Google**: braucht einen eigenen Server; „Mit Apple anmelden" muss daneben bleiben (4.8).

## Notiert, kein Ablehnungsgrund

- „Beispieldaten laden" steht auch in der Store-Fassung (gewollt seit Runde 131).

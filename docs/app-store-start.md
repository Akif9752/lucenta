---
titel: Lucenta im App Store — was fertig ist und was nur die betreibende Person tun kann
stand: 2026-09
---

# Lucenta als iPhone-App

Dieses Dokument ist die Arbeitsliste für die Veröffentlichung. Es trennt streng zwischen
**erledigt**, **vorbereitet** (fertig im Repo, wartet auf einen Mac oder auf Angaben) und
**nur von dir zu erledigen** (Konto, Identität, Geld, Rechtsverbindliches).

Alles hier ist auf iPhone bezogen. iPad, Mac und Watch sind bewusst nicht Ziel.

---

## 1. Die harte Frage zuerst: Nimmt Apple die App überhaupt an?

Der relevante Punkt ist **Richtlinie 4.2 (Minimum Functionality)**. Apple weist Apps ab, die
nichts weiter sind als eine in eine Hülle gepackte Webseite. Lucenta ist heute genau das:
eine HTML-Datei.

Das ist kein K.-o.-Kriterium, aber es ist der wahrscheinlichste Ablehnungsgrund, und man
begegnet ihm nicht mit einer besseren Beschreibung, sondern mit Funktionen, die es im Browser
nicht gibt. Drei, die zu Lucenta passen und die Ablehnung praktisch ausschließen:

| Funktion | Warum sie hier passt | Aufwand |
|---|---|---|
| **Mitteilung zur Tagesform** | Die App bittet einmal am Tag um zwei Angaben. Genau dafür ist eine lokale Mitteilung da — und sie ist der Grund, warum jemand die App behält statt sie einmal zu öffnen. | klein (Capacitor-Plugin, ein Schalter in den Einstellungen) |
| **Ergebnis in die Foto-Mediathek / ins Teilen-Blatt** | Das Ergebnisbild gibt es schon. Im Browser kann es nur heruntergeladen werden; nativ geht es in das System-Teilen-Blatt. | klein |
| **Sperre per Face ID** | Ein Persönlichkeitsprofil auf einem geteilten Gerät. Es gibt bereits einen Gastdurchlauf — das ist die konsequente Fortsetzung. | mittel |
| **Widget mit der Tagesform-Kurve** | Sichtbar nativ, aber ein eigenes Stück SwiftUI außerhalb der Weboberfläche. | groß |

**Stand Runde 99: die ersten beiden sind gebaut.** Sie liegen in `src/js/19b-native.js` und
sind über eine nachgestellte Capacitor-Umgebung geprüft (`npm run pruef-nativ`, 23 Prüfungen):

- **Tägliche Erinnerung** — Einstellungen → Bedienung. Genau eine Mitteilung am Tag zur
  gewählten Uhrzeit, kein Nachfassen; die Erlaubnis wird erst beim Einschalten erfragt, nicht
  beim Start. Geprüft ist auch, dass ein Umstellen der Uhrzeit die alte Mitteilung **absagt**,
  bevor es die neue setzt — sonst sammeln sie sich an und die App meldet sich nach einer Woche
  Herumprobieren fünfmal am Abend.
- **Ergebnisbild in die Foto-Mediathek** — im Bildfenster, sichtbar nur mit nativer Brücke.

Im Browser stehen beide abgeschaltet da und sagen warum. Das ist Absicht: Ein Knopf, der nichts
tun kann, gehört nicht in die Oberfläche, und ein Knopf, der Erfolg meldet ohne etwas zu tun,
ist schlimmer als keiner (der Grund steht in `17-settings.js` beim blockierten Download).

**Bleibt für den Mac:** die Plugins tatsächlich installieren und `npx cap sync ios`. Der Code
dafür steht, die Abhängigkeiten sind in `package.json` eingetragen.

Zweiter Punkt, der zu prüfen ist: **Richtlinie 5.1.1 und 1.4.1**. Lucenta misst
Persönlichkeit, nicht Gesundheit. Die App darf nirgends klingen, als stelle sie eine
Diagnose. Der Wortlaut in der App hält das heute ein („Selbstreflexion, keine Diagnose");
die Store-Beschreibung muss es genauso halten.

---

## 2. Erledigt

- **Die App läuft ohne Netz vollständig.** Seit Runde 80 stehen auch die Schriften in der
  Datei. Vorher hätte die App in der U-Bahn in Systemschrift geöffnet — für eine Webseite
  ein Schönheitsfehler, für eine App aus dem Store ein Fehler.
- **Keine Verbindung nach außen.** Kein Server, kein Konto, keine Werbung, kein Tracking,
  kein Fremdabruf. Das vereinfacht die Datenschutzangaben im Store auf den kleinstmöglichen
  Fall (siehe Abschnitt 4).
- **Acht Sprachen** (de, en, es, fr, it, pt, tr, ja), item-für-item durch die Testreihe
  abgesichert.
- **App-Symbol** in elf Größen unter `assets/icon/`, inklusive 1024 px für den Store.
- **Sichere Ränder** (Aussparung, Home-Leiste), Systemleistenfarbe je Farbmodus,
  Zurück-Geste, erhaltene Scrollposition — seit Runde 45.
- **Impressum und Datenschutzerklärung** in der App, unter Einstellungen → Rechtliches.
- **Barrierefreiheit**: Trefferflächen ab 44 px, jede Schaltfläche mit Namen, reduzierte
  Bewegung durchgehend beachtet, 200-%-Zoom geprüft.
- **Bildschirmfotos für den Store** in beiden von Apple verlangten Größen (1290 × 2796 und
  1179 × 2556), fünf Ansichten je Größe und Sprache: `npm run store-bilder`. Sie entstehen aus
  der Beispielnutzerin in der gekauften Fassung — nur dort sind die Ansichten gefüllt.
- **Die Store-Texte** in allen acht Sprachen: `docs/store-eintrag.md`. Zeichenzahlen von
  `npm run pruef-store` gezählt, nicht geschätzt.
- **Der Weg für Käufe wiederherstellen und Abo verwalten** (Richtlinie 3.1.2) steht unter
  Einstellungen → Lucenta+.
- **Die BETA-Marke in der Kopfzeile ist raus** (Runde 99). Sie war das letzte Sichtbare, das die
  App als unfertig auswies, und im Store-Bildschirmfoto stand sie neben dem Namen.

## 3. Vorbereitet — braucht einen Mac mit Xcode

Nichts davon lässt sich ohne Apple-Hardware abschließen. Die Schritte in Reihenfolge:

1. `npm install` — die Abhängigkeiten stehen seit Runde 99 in `package.json`:
   `@capacitor/cli`, `core`, `ios`, dazu `app`, `filesystem`, `local-notifications`, `share`.
2. **Kein `npx cap init`** — `capacitor.config.json` liegt bereits im Repo, mit Kennung
   `app.lucenta.ios`, `webDir: dist` und drei Einstellungen, die hier begründet sind:
   `limitsNavigationsToAppBoundDomains: true` (die App ruft nichts nach außen, also darf
   sie es auch nicht dürfen), `contentInset: "always"` (sichere Ränder auch in der Hülle)
   und eine Hintergrundfarbe, damit beim Start nicht kurz Weiß aufblitzt.
3. `npx cap add ios`, danach nach jedem `node build.js` ein `npx cap sync ios`
4. Symbole aus `assets/icon/` in den Asset-Katalog legen (1024 px ohne Alphakanal — Apple
   weist PNG mit Transparenz zurück; `lucenta-icon-1024.png` ist dafür die richtige Datei,
   die gerundete Fassung ist für andere Zwecke).
5. In `Info.plist`: `UIRequiresFullScreen` nicht setzen, Ausrichtung auf Hochformat,
   `NSPhotoLibraryAddUsageDescription` sobald das Ergebnisbild gesichert werden kann.
6. ~~Die zwei Funktionen aus Abschnitt 1 ergänzen.~~ Erledigt in Runde 99 — hier bleibt nur,
   `NSUserNotificationsUsageDescription` ist **nicht** nötig (lokale Mitteilungen brauchen
   keinen Info.plist-Eintrag, nur die Laufzeit-Abfrage, die der Code stellt), und
   `NSPhotoLibraryAddUsageDescription` **ist** nötig, sobald das Ergebnisbild gesichert wird.
7. Auf einem echten iPhone durchlaufen — nicht nur im Simulator. Was der Simulator nicht
   zeigt: Haptik, echte Scrollträgheit, die Tastatur über dem Namensfeld, Face ID.

## 4. Datenschutzangaben im Store („Privacy Nutrition Labels")

Weil die App nichts sendet, ist die Antwort auf jede Frage im Fragebogen von App Store
Connect dieselbe. Das ist wörtlich so einzutragen:

> **Data Not Collected** — „We do not collect any data from this app."

Das gilt für alle Kategorien: Kontaktdaten, Gesundheit, Finanzen, Standort, Kontakte,
Nutzerinhalte, Suchverlauf, Kennungen, Nutzungsdaten, Diagnose.

Zwei Fallen dabei:

- **Das Profilbild** wird nicht gesammelt — es liegt im lokalen Speicher des Geräts und
  verlässt es nicht. Nur „gesammelt" (also übertragen) ist anzugeben. Trotzdem
  wahrheitsgemäß im Beschreibungstext erwähnen.
- **Sobald ein Absturzberichts-Dienst oder eine Statistik hinzukommt, ändert sich diese
  Angabe.** Ein Eintrag, der einmal „Data Not Collected" sagt und es später nicht mehr ist,
  ist der Punkt, an dem aus einer Formalie ein Problem wird.

**Altersfreigabe:** 12+ ist die vertretbare Einstufung (keine Gewalt, keine
Erwachseneninhalte; die Selbstreflexionsthematik spricht gegen 4+).
**Kategorie:** Gesundheit & Fitness wäre falsch — Lucenta ist kein Gesundheitsprodukt.
Richtig: **Lifestyle**, zweitrangig **Bildung**.

## 5. Nur du — kann niemand sonst erledigen

Diese Punkte sind bewusst als Liste geführt, weil jeder einzelne die Veröffentlichung
blockiert.

1. **Apple Developer Program**, 99 USD im Jahr, mit Identitätsprüfung. Rechnet mit ein bis
   zwei Wochen, wenn Rückfragen kommen. **Ein Mac ist vorhanden** (Stand Runde 96) — damit ist
   Abschnitt 3 nicht mehr blockiert, sondern der nächste Schritt nach diesem Punkt.
   Reihenfolge: erst das Programm beantragen (es dauert), währenddessen Capacitor einrichten.
1a. **Abo statt Einmalkauf (Runde 95).** Zwei Produkte in App Store Connect anlegen:
   `lucenta.plus.monat` zu 4,99 € und `lucenta.plus.jahr` zu 29,99 €, in derselben
   Abo-Gruppe, damit ein Wechsel zwischen beiden möglich ist. Dazu gehören zwingend eine
   Wiederherstellung gekaufter Käufe und ein sichtbarer Hinweis, dass die Kündigung in den
   iOS-Einstellungen läuft. **Richtlinie 3.1.2** verlangt fortlaufenden Wert: Der bezahlte
   Bereich sind die vier laufenden Grenzen (Verlauf, Tagesform, Vergleichskarte, „Verstehen"),
   nicht der Bericht — der ist frei und bleibt es. **CloudKit gehört ausdrücklich NICHT
   hierher**: Es synchronisiert Daten, nicht Berechtigungen; ob jemand zahlt, weiß StoreKit.
2. **Die sechs Angaben im Impressum.** Sie stehen an genau einer Stelle im Code:
   `IMPRESSUM` in `src/js/17-settings.js` — Name, Straße, Ort, E-Mail, Hoster, und die
   Umsatzsteuer-ID, falls vorhanden. Solange eine fehlt, sagt die App das selbst in aller
   Deutlichkeit. Das ist Absicht: Ein Impressum mit Platzhaltern ist schlimmer als keines.
3. **Eine öffentlich erreichbare Datenschutz-Adresse.** App Store Connect verlangt eine
   URL, nicht einen Text in der App. Der Text ist fertig; er muss unter einer eigenen
   Adresse liegen.
4. **Support-Adresse** (E-Mail genügt, muss aber beantwortet werden).
5. **Markenrecherche zu „Lucenta" abschließen.** Der Stand steht in
   `docs/lucenta-markenrecherche.md` — eine Web-Recherche, keine Registerprüfung. Vor einem
   Store-Eintrag unter diesem Namen gehört eine echte Recherche in DPMA und EUIPO dazu.
6. **Den Entwickler-Umschalter UND den Aktivierungsknopf im Kauffenster entfernen.**
   Seit Runde 97 gibt es zwei Stellen, an denen die bezahlte Fassung ohne Zahlung angeht: den
   Schalter im Profil und den Knopf „Lucenta+ aktivieren" im Kauffenster
   (`btnPlusAktivieren` in `src/js/21-beta-rueckmeldung.js`). **Beide** müssen durch die echte
   StoreKit-Prüfung ersetzt werden; einer allein übersehen heißt, die App verschenkt das Abo.
   Ebenfalls dort: die gewählte Laufzeit (`lucenta_laufzeit`) ist heute nur eine Notiz und muss
   zur Produktkennung des gekauften Abos werden.

   **Und der Name `StoreKit` in `19b-native.js` ist ein PLATZHALTER.** Für
   LocalNotifications, Filesystem und App gibt es offizielle Capacitor-Module, die genau so
   heißen; für Käufe gibt es keins von Apple oder Ionic. Wer das umsetzt, schreibt entweder
   eine eigene kleine Brücke in Swift und meldet sie unter diesem Namen an, oder nimmt ein
   Gemeinschaftsmodul und passt **diesen einen Aufruf** an. Der Name ist bewusst nicht
   versteckt: Er steht im Code direkt darüber und hier. Alter Wortlaut dieses Punktes: Unter Profil steht seit Runde 84 ein Schalter
   zwischen freier und gekaufter Fassung (`plusSchalter` in `src/js/15-profile.js`), damit
   beide Zustände ohne Eingriff in den Speicher zu sehen sind. Er darf nicht mit in den Store;
   an seine Stelle gehört die echte Kaufprüfung. Dasselbe gilt für die Beispielnutzerin.
7. **Die Bildschirmfotos hochladen.** Erzeugt sind sie (Runde 99, `assets/store/`, beide
   Größen, deutsch und englisch) — hochladen kann sie nur, wer in App Store Connect angemeldet
   ist. Sie stammen aus dem Browser, nicht vom Gerät: für die Einreichung reicht das, Apple
   prüft die Pixelmaße, nicht die Herkunft. Wenn dir auf dem echten iPhone etwas auffällt, was
   im Bild anders aussieht, ist `npm run store-bilder` in einer Minute noch einmal gelaufen.

## 6. Der größte offene Punkt bleibt fachlich, nicht technisch

Sieben der acht Sprachen tragen eine **funktionierende Übersetzung** der IPIP-Aussagen,
keine veröffentlichte psychometrische Fassung. Die Zuordnung und die Polung sind Aussage für
Aussage durch die Testreihe festgenagelt, eine Übersetzung kann die Messung also nicht
verändern — aber „auf Spanisch validiert" darf nirgends behauptet werden, und die App tut es
auch nicht. Für einen Store-Eintrag in acht Sprachräumen ist das der Punkt, der vor der
Werbung geklärt gehört, nicht danach.

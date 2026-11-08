---
titel: Der App-Store-Eintrag — fertige Texte und Bilder
stand: 2026-11
---

# App Store Connect: was hier fertig liegt

Alles auf dieser Seite kann ohne Mac, ohne Entwicklerkonto und ohne Gerät entstehen — und ist
entstanden. Was zwingend von dir kommen muss, steht in `app-store-start.md`, Abschnitt 5.

**Apples Zeichengrenzen sind eingehalten und nachgezählt** — von `python3 tools/pruef_store_texte.py`,
nicht von mir. Beim ersten Lauf war **jede** der 32 Zahlen in diesem Dokument falsch, eine um
mehr als das Doppelte; sie waren behauptet statt gezählt. Der Zähler liegt jetzt bei, damit
das nicht wieder passiert: Name höchstens 30,
Untertitel höchstens 30, Schlüsselwörter zusammen höchstens 100, Werbetext höchstens 170,
Beschreibung höchstens 4000. Der Untertitel ist die zweite Zeile unter dem Namen im Store und
wird in der Suche mitgelesen; die Schlüsselwörter sind kommagetrennt **ohne Leerzeichen** —
jedes Leerzeichen kostet eines der 100 Zeichen.

## Bildschirmfotos

`npm run store-bilder` erzeugt sie in `assets/store/`, in genau den zwei Größen, die App Store
Connect verlangt (die übrigen leitet Apple ab):

| Klasse | Pixel | Geräte |
|---|---|---|
| 6,7″ | 1290 × 2796 | iPhone 15/16 Pro Max und Verwandte |
| 6,1″ | 1179 × 2556 | iPhone 15/16 und Verwandte |

Fünf Ansichten je Größe und Sprache, in der Reihenfolge, in der jemand sie durchblättert:
Startseite, Ergebnis, Bericht, Tagesform, Verstehen. Jedes Bild zeigt **eine** Sache — ein
Bildschirmfoto, das zwei Dinge zeigt, zeigt keins davon.

Aufgenommen wird die Beispielnutzerin in der gekauften Fassung. Das ist kein Schönen: Nur dort
sind die Ansichten gefüllt, die den Eintrag tragen — fünf Wochen Verlauf statt leerer Kurven.

`npm run store-bilder de en fr` erzeugt weitere Sprachen; ohne Angabe Deutsch und Englisch.

## Die Texte

### Deutsch (Primärsprache)

- **Name (23):** `Lucenta — Big Five Test`
- **Untertitel (30):** `Persönlichkeit ohne Schubladen`
- **Schlüsselwörter (93):** `persönlichkeit,bigfive,ocean,charaktertest,selbstreflexion,psychologie,stimmung,tagebuch,ipip`
- **Werbetext (135):** `Fünfzig Aussagen, sieben Minuten, ein Porträt auf wissenschaftlicher Grundlage. Deine Daten gehören dir — kein Tracking, keine Werbung.`

**Beschreibung:**

```
Lucenta zeichnet dein Persönlichkeitsporträt anhand des Big-Five-Modells — dem Modell mit der
stärksten empirischen Grundlage in der Persönlichkeitspsychologie. Keine Sternzeichen, keine
Typ-Schubladen. Ein Spektrum, das wirklich zu dir passt.

FÜNFZIG AUSSAGEN, SIEBEN MINUTEN
Der Test beruht auf den Big-Five-Markern des International Personality Item Pool. Dein Ergebnis
ist kein Typ aus sechzehn Kästchen, sondern fünf Werte zwischen 0 und 100 — dazu ein Titel, der
deine Kombination beschreibt, und zu jeder Dimension, was sie im Alltag bedeutet.

DEINE TAGESFORM
Persönlichkeit ändert sich nicht von Tag zu Tag. Energie und Stimmung schon. Zwei Angaben am
Tag, zwei Sekunden — und über Wochen wird sichtbar, wohin es geht, an welchen Wochentagen und
zu welcher Tageszeit du oben und unten liegst, und wie du nach einem schwachen Tag weitermachst.
Auf Wunsch mit Erinnerung, Widget und der Stimmung in Apple Health.

VERGLEICHEN
Ein kurzer Freundescode genügt, um dein Profil mit dem einer anderen Person zu vergleichen: was
euch verbindet, ergänzt und reibt, und für jede Dimension Alltag, Gespräch und gemeinsames
Unternehmen. Ohne Konto, ohne dass Daten über einen Server laufen.

DEINE DATEN GEHÖREN DIR
Keine Werbung, kein Tracking, keine Weitergabe. Ohne Anmeldung verlassen deine Antworten, dein
Ergebnis, dein Verlauf und dein Profil dein iPhone nicht. Wer möchte, meldet sich mit Apple an —
dann liegt eine Sicherung Ende-zu-Ende verschlüsselt in der eigenen iCloud, die wir nicht lesen
können. Die Schriften stecken in der
App selbst — beim Öffnen wird nichts nachgeladen, und Lucenta funktioniert vollständig ohne Netz.

LUCENTA+
Frei: der ganze Test, dein Ergebnistitel, das Radar, der Kern jeder Dimension, das Ergebnisbild
zum Teilen, der Vergleich mit zwei Personen, Tagesform eintragen und die letzten sieben Tage sehen.
Lucenta+ öffnet den vollständigen Bericht und alles, was mit der Zeit wächst: die Befunde und den
Verlauf deiner Tagesform, den Vergleich in der Tiefe mit beliebig vielen Menschen, "Verstehen",
den ausführlichen Test mit 29 Facetten und die Kurve über alle Durchläufe. Endet das Abo, wird
nichts gelöscht — was du erfasst hast, bleibt gespeichert.

Acht Sprachen: Deutsch, Englisch, Spanisch, Französisch, Italienisch, Portugiesisch, Türkisch,
Japanisch.

Lucenta ist ein Werkzeug zur Selbstreflexion und kein klinisches oder diagnostisches Instrument.
Die Ergebnisse ersetzen keine therapeutische, psychologische oder ärztliche Beratung.
```

### English

- **Name (23):** `Lucenta — Big Five Test`
- **Subtitle (25):** `Personality without boxes`
- **Keywords (86):** `personality,bigfive,ocean,character,selfreflection,psychology,mood,journal,traits,ipip`
- **Promotional text (113):** `Fifty statements, seven minutes, a portrait on scientific ground. Your data belongs to you — no tracking, no ads.`

**Description:**

```
Lucenta draws your personality portrait using the Big Five model — the model with the strongest
empirical foundation in personality psychology. No star signs, no four-letter type. A spectrum
that actually fits you.

FIFTY STATEMENTS, SEVEN MINUTES
The test is built on the Big Five markers of the International Personality Item Pool. Your
result is not a type out of sixteen boxes but five values between 0 and 100 — plus a title that
describes your combination, and for each dimension what it means in everyday life.

YOUR DAILY STATE
Personality does not change from day to day. Energy and mood do. Two answers a day, two seconds
— and over weeks it becomes visible which way it is going, on which weekdays and at which times
of day you sit high and low, and how you carry on after a weak day. Optionally with a reminder,
a widget and your mood in Apple Health.

COMPARING
A short friend code is all it takes to compare your profile with someone else's: what connects
you, complements you and rubs, and for every dimension everyday life, conversation and doing
things together. No account, and no data goes through a server.

YOUR DATA BELONGS TO YOU
No advertising, no tracking, nothing passed on. Without signing in, your answers, your result,
your history and your profile never leave your iPhone. If you like, sign in with Apple — a
backup then lives end-to-end encrypted in your own iCloud, where we cannot read it. The fonts are part of the app
itself — nothing is fetched when you open it, and Lucenta works fully offline.

LUCENTA+
Free: the whole test, your result title, the radar, the core of each dimension, the result image
to share, comparing with two people, logging your daily state and seeing the last seven days.
Lucenta+ opens the full report and everything that grows over time: the findings and history of
your daily state, the comparison in depth with as many people as you like, "Understand", the
in-depth test with 29 facets and the curve across all your runs. If the subscription ends,
nothing is deleted — what you recorded stays saved.

Eight languages: German, English, Spanish, French, Italian, Portuguese, Turkish, Japanese.

Lucenta is a tool for self-reflection and not a clinical or diagnostic instrument. Its results
do not replace therapeutic, psychological or medical advice.
```

### Español

- **Nombre (23):** `Lucenta — Test Big Five`
- **Subtítulo (26):** `Personalidad sin etiquetas`
- **Palabras clave (88):** `personalidad,bigfive,ocean,caracter,autoconocimiento,psicologia,animo,diario,rasgos,ipip`
- **Texto promocional (112):** `Cincuenta frases, siete minutos, un retrato con base científica. Tus datos son tuyos: sin rastreo, sin anuncios.`

**Descripción (resumen):** El texto largo sigue la estructura alemana, sección por sección:
modelo Big Five en lugar de signos del zodiaco · cincuenta frases del IPIP · estado del día ·
comparación mediante código de amigo · tus datos son tuyos · Lucenta+ (gratis: siete días de
estado del día y dos comparaciones) · ocho idiomas · aviso de que no
es un instrumento clínico.

### Français

- **Nom (23):** `Lucenta — Test Big Five`
- **Sous-titre (26):** `La personnalité sans cases`
- **Mots-clés (89):** `personnalite,bigfive,ocean,caractere,introspection,psychologie,humeur,journal,traits,ipip`
- **Texte promotionnel (128):** `Cinquante affirmations, sept minutes, un portrait sur base scientifique. Tes données t’appartiennent : ni pistage, ni publicité.`

### Italiano

- **Nome (23):** `Lucenta — Test Big Five`
- **Sottotitolo (30):** `La personalità senza etichette`
- **Parole chiave (85):** `personalita,bigfive,ocean,carattere,introspezione,psicologia,umore,diario,tratti,ipip`
- **Testo promozionale (133):** `Cinquanta affermazioni, sette minuti, un ritratto su base scientifica. I tuoi dati sono tuoi: niente tracciamento, niente pubblicità.`

### Português

- **Nome (24):** `Lucenta — Teste Big Five`
- **Subtítulo (25):** `Personalidade sem gavetas`
- **Palavras-chave (88):** `personalidade,bigfive,ocean,carater,autoconhecimento,psicologia,humor,diario,tracos,ipip`
- **Texto promocional (115):** `Cinquenta frases, sete minutos, um retrato com base científica. Os seus dados são seus: sem rastreio, sem anúncios.`

### Türkçe

- **Ad (24):** `Lucenta — Big Five Testi`
- **Altyazı (25):** `Kutulara sığmayan kişilik`
- **Anahtar kelimeler (82):** `kisilik,bigfive,ocean,karakter,ozfarkindalik,psikoloji,ruhhali,gunluk,ozellik,ipip`
- **Tanıtım metni (96):** `Elli ifade, yedi dakika, bilimsel temelli bir portre. Verilerin sana ait: takip yok, reklam yok.`

### 日本語

- **名前 (19):** `Lucenta — ビッグファイブ診断`
- **サブタイトル (11):** `型にはめない性格の地図`
- **キーワード (42):** `性格,ビッグファイブ,ocean,自己理解,心理学,気分,記録,特性,診断,ipip`
- **プロモーションテキスト (47):** `50の記述、7分、科学に基づく肖像。データはあなたのもの — トラッキングも広告もありません。`

## Kategorie, Altersfreigabe, Datenschutzangaben

Steht vollständig in `app-store-start.md`, Abschnitt 4. In Kürze:

- **Kategorie:** Lifestyle, zweitrangig Bildung. *Nicht* Gesundheit & Fitness — Lucenta ist kein
  Gesundheitsprodukt, und diese Kategorie zieht zusätzliche Prüfungen nach sich.
- **Altersfreigabe:** 16+ (Entscheidung des Inhabers, 2026-10-25; Apples Stufen seit 2025: 4+, 9+, 13+, 16+, 18+).
- **Datenschutzangaben:** in jeder Kategorie **Data Not Collected**. Sobald ein
  Absturzberichts-Dienst oder eine Statistik dazukommt, ändert sich das — und ein Eintrag, der
  einmal „nicht erhoben" sagte und es später nicht mehr ist, ist der Punkt, an dem aus einer
  Formalie ein Problem wird.

## Was an diesen Texten bewusst NICHT steht

Kein „wissenschaftlich validiert" über die Übersetzungen. Sieben der acht Sprachen tragen eine
funktionierende Übersetzung der IPIP-Aussagen, keine veröffentlichte psychometrische Fassung
(siehe `app-store-start.md`, Abschnitt 6). Die Beschreibung sagt deshalb, worauf der Test
*beruht*, und behauptet nirgends, er sei in der jeweiligen Sprache geprüft.

Keine Heilversprechen, keine Diagnosesprache, kein „finde heraus, wer du wirklich bist". Der
Abschlusssatz zur Nicht-Diagnose steht in jeder Sprache, weil Richtlinie 1.4.1 genau dort
hinsieht.

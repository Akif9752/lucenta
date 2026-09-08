---
titel: Der App-Store-Eintrag — fertige Texte und Bilder
stand: 2026-09
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
- **Werbetext (137):** `Fünfzig Aussagen, sieben Minuten, ein Porträt auf wissenschaftlicher Grundlage. Alles bleibt auf deinem iPhone — kein Konto, kein Server.`

**Beschreibung:**

```
Lucenta zeichnet dein Persönlichkeitsporträt anhand des Big-Five-Modells — dem Modell mit der
stärksten empirischen Grundlage in der Persönlichkeitspsychologie. Keine Sternzeichen, keine
Typ-Schubladen. Ein Spektrum, das wirklich zu dir passt.

FÜNFZIG AUSSAGEN, SIEBEN MINUTEN
Der Test beruht auf den Big-Five-Markern des International Personality Item Pool. Dein Ergebnis
ist kein Typ aus sechzehn Kästchen, sondern fünf Werte zwischen 0 und 100 — und ein
ausführlicher Bericht zu jedem davon.

DEINE TAGESFORM
Persönlichkeit ändert sich nicht von Tag zu Tag. Energie und Stimmung schon. Zwei Angaben am
Tag, zwei Sekunden — und über Wochen wird sichtbar, wohin es geht, an welchen Wochentagen und
zu welcher Tageszeit du oben und unten liegst, und wie du nach einem schwachen Tag weitermachst.

VERGLEICHEN
Ein zehnstelliger Code genügt, um dein Profil mit dem einer anderen Person zu vergleichen — für
jede Dimension in Alltag, Gespräch und gemeinsamem Unternehmen. Ohne Konto, ohne dass jemand
Daten austauscht.

ALLES BLEIBT AUF DEINEM GERÄT
Kein Konto. Kein Server. Keine Werbung, kein Tracking, keine Weitergabe. Deine Antworten, dein
Ergebnis, dein Verlauf und dein Profil verlassen dein iPhone nicht. Die Schriften stecken in der
App selbst — beim Öffnen wird nichts nachgeladen, und Lucenta funktioniert vollständig ohne Netz.

LUCENTA+
Frei ist ein vollständiges Produkt: der ganze Test, dein Porträt, der volle Bericht über alle
fünf Dimensionen, das Ergebnisbild, der Vergleich, Tagesform eintragen und vierzehn Tage sehen.
Lucenta+ öffnet, was mit der Zeit wächst — den ganzen Verlauf, die Befunde aus der Tagesform,
den Vergleich in der Tiefe und "Verstehen". Was während der Laufzeit entstanden ist, bleibt
danach lesbar.

Acht Sprachen: Deutsch, Englisch, Spanisch, Französisch, Italienisch, Portugiesisch, Türkisch,
Japanisch.

Lucenta ist ein Werkzeug zur Selbstreflexion und kein klinisches oder diagnostisches Instrument.
Die Ergebnisse ersetzen keine therapeutische, psychologische oder ärztliche Beratung.
```

### English

- **Name (23):** `Lucenta — Big Five Test`
- **Subtitle (25):** `Personality without boxes`
- **Keywords (86):** `personality,bigfive,ocean,character,selfreflection,psychology,mood,journal,traits,ipip`
- **Promotional text (122):** `Fifty statements, seven minutes, a portrait on scientific ground. Everything stays on your iPhone — no account, no server.`

**Description:**

```
Lucenta draws your personality portrait using the Big Five model — the model with the strongest
empirical foundation in personality psychology. No star signs, no four-letter type. A spectrum
that actually fits you.

FIFTY STATEMENTS, SEVEN MINUTES
The test is built on the Big Five markers of the International Personality Item Pool. Your
result is not a type out of sixteen boxes but five values between 0 and 100 — with a full
report on each of them.

YOUR DAILY STATE
Personality does not change from day to day. Energy and mood do. Two answers a day, two seconds
— and over weeks it becomes visible which way it is going, on which weekdays and at which times
of day you sit high and low, and how you carry on after a weak day.

COMPARING
A ten-character code is all it takes to compare your profile with someone else's — for every
dimension across everyday life, conversation and doing things together. No account, and nobody
exchanges data.

EVERYTHING STAYS ON YOUR DEVICE
No account. No server. No advertising, no tracking, nothing passed on. Your answers, your
result, your history and your profile never leave your iPhone. The fonts are part of the app
itself — nothing is fetched when you open it, and Lucenta works fully offline.

LUCENTA+
Free is a complete product: the whole test, your portrait, the full report across all five
dimensions, the result image, the comparison, logging your daily state and seeing fourteen days.
Lucenta+ opens what grows over time — the whole history, the findings from your daily state, the
comparison in depth and "Understand". What emerged while you subscribed stays readable
afterwards.

Eight languages: German, English, Spanish, French, Italian, Portuguese, Turkish, Japanese.

Lucenta is a tool for self-reflection and not a clinical or diagnostic instrument. Its results
do not replace therapeutic, psychological or medical advice.
```

### Español

- **Nombre (23):** `Lucenta — Test Big Five`
- **Subtítulo (26):** `Personalidad sin etiquetas`
- **Palabras clave (88):** `personalidad,bigfive,ocean,caracter,autoconocimiento,psicologia,animo,diario,rasgos,ipip`
- **Texto promocional (118):** `Cincuenta frases, siete minutos, un retrato con base científica. Todo se queda en tu iPhone: sin cuenta, sin servidor.`

**Descripción (resumen):** El texto largo sigue la estructura alemana, sección por sección:
modelo Big Five en lugar de signos del zodiaco · cincuenta frases del IPIP · estado del día ·
comparación mediante código · todo en el dispositivo · Lucenta+ · ocho idiomas · aviso de que no
es un instrumento clínico.

### Français

- **Nom (23):** `Lucenta — Test Big Five`
- **Sous-titre (26):** `La personnalité sans cases`
- **Mots-clés (89):** `personnalite,bigfive,ocean,caractere,introspection,psychologie,humeur,journal,traits,ipip`
- **Texte promotionnel (131):** `Cinquante affirmations, sept minutes, un portrait sur base scientifique. Tout reste sur ton iPhone : pas de compte, pas de serveur.`

### Italiano

- **Nome (23):** `Lucenta — Test Big Five`
- **Sottotitolo (30):** `La personalità senza etichette`
- **Parole chiave (85):** `personalita,bigfive,ocean,carattere,introspezione,psicologia,umore,diario,tratti,ipip`
- **Testo promozionale (129):** `Cinquanta affermazioni, sette minuti, un ritratto su base scientifica. Tutto resta sul tuo iPhone: nessun account, nessun server.`

### Português

- **Nome (24):** `Lucenta — Teste Big Five`
- **Subtítulo (25):** `Personalidade sem gavetas`
- **Palavras-chave (88):** `personalidade,bigfive,ocean,carater,autoconhecimento,psicologia,humor,diario,tracos,ipip`
- **Texto promocional (113):** `Cinquenta frases, sete minutos, um retrato com base científica. Tudo fica no seu iPhone: sem conta, sem servidor.`

### Türkçe

- **Ad (24):** `Lucenta — Big Five Testi`
- **Altyazı (25):** `Kutulara sığmayan kişilik`
- **Anahtar kelimeler (82):** `kisilik,bigfive,ocean,karakter,ozfarkindalik,psikoloji,ruhhali,gunluk,ozellik,ipip`
- **Tanıtım metni (103):** `Elli ifade, yedi dakika, bilimsel temelli bir portre. Her şey iPhone'unda kalır: hesap yok, sunucu yok.`

### 日本語

- **名前 (19):** `Lucenta — ビッグファイブ診断`
- **サブタイトル (11):** `型にはめない性格の地図`
- **キーワード (42):** `性格,ビッグファイブ,ocean,自己理解,心理学,気分,記録,特性,診断,ipip`
- **プロモーションテキスト (52):** `50の記述、7分、科学に基づく肖像。すべてiPhoneの中だけに — アカウントもサーバーもありません。`

## Kategorie, Altersfreigabe, Datenschutzangaben

Steht vollständig in `app-store-start.md`, Abschnitt 4. In Kürze:

- **Kategorie:** Lifestyle, zweitrangig Bildung. *Nicht* Gesundheit & Fitness — Lucenta ist kein
  Gesundheitsprodukt, und diese Kategorie zieht zusätzliche Prüfungen nach sich.
- **Altersfreigabe:** 12+.
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

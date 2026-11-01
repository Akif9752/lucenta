# Tierbilder mit einem Bildgenerator erzeugen

Entscheidung des Inhabers (Runde 212): Die 20 Tier-Avatare kommen aus einem Bildgenerator, dessen Bilder **kommerziell
genutzt werden duerfen**, z. B. Adobe Firefly. Je Tier drei Bilder: **ruhig, muede, froh**.

## Bevor du anfaengst: drei Regeln

1. **Keine fremden Figuren als Vorlage hochladen.** Die Bilder in `vorlagen/bilder/` sind fremde Werke (Stockbilder und
   Disney/Pixar-Figuren). Lade sie nicht als Stil- oder Strukturvorlage in den Generator. Erlaubt ist, ein eigenes,
   schon erzeugtes Bild als Vorlage zu nehmen (das ist der Trick fuer einheitliche Ausdruecke, siehe unten).
2. **Keine Studio- oder Figurennamen** (Disney, Pixar, Dug, Nemo …) in den Prompt schreiben.
3. **Lizenz pruefen:** in den Nutzungsbedingungen des Generators, dass die Bilder in einer verkauften App verwendet
   werden duerfen (bei Adobe Firefly: kommerzielle Nutzung fuer nicht als Beta gekennzeichnete Funktionen). Den Nachweis
   (Konto, Datum) aufheben.

## Einstellungen

- Seitenverhaeltnis **1:1 (quadratisch)**, mindestens **1024 × 1024** px
- Inhaltstyp: **Grafik / 3D** (nicht Foto)
- Ein Tier pro Bild, **ganze Figur**, mittig, schlichter heller Hintergrund, kein Text, kein Boden mit Schatten

## So bleiben die drei Ausdruecke einheitlich

1. Zuerst **ruhig** erzeugen, bis es dir gefaellt.
2. Dieses Bild als **Strukturvorlage** (Firefly: „Struktur“ bzw. „Referenz“) fuer muede und froh nehmen und nur den
   Ausdrucks-Satz tauschen. So bleiben Pose, Farben und Proportionen gleich.

## Grundbaustein (vor jede Tierbeschreibung setzen)

```
Cute 3D animated movie style character, full body, centered, soft studio lighting, smooth stylized fur, big glossy expressive eyes with white sclera and large catchlights, expressive eyebrows, plain light grey background, no text, no watermark, high detail, rendered like a modern family animation film.
```

## Ausdruecke (ans Ende setzen, je Bild einer)

| Datei | Satz |
| --- | --- |
| `-ruhig` | `Expression: calm, gentle closed-mouth smile, eyes fully open, relaxed.` |
| `-muede` | `Expression: sleepy and tired, droopy half-closed eyelids, small soft smile, head slightly lowered.` |
| `-froh` | `Expression: overjoyed, big open-mouth laugh showing the tongue, eyes wide and sparkling.` |

## Die 20 Tiere

Dateiname = Kennung in der App (links). **Eigene Merkmale** sind dort vermerkt, wo die Vorlage eine Filmfigur war.

| Kennung | Tierbeschreibung (zwischen Grundbaustein und Ausdruck) |
| --- | --- |
| `baer` | `A chubby brown bear standing upright on its hind legs in a wide stance, round light tan belly, one arm across its chest, the other paw raised in a wave, big glossy black nose, thick dark eyebrows, small round ears.` |
| `panda` | `A chubby giant panda sitting with its legs stretched forward showing grey paw pads, one arm resting across its round white belly, black arms and shoulders, tilted black eye patches, green eyes, round black ears.` |
| `hase` | `A fluffy grey rabbit sitting upright, compact body with a big head, large expressive brown eyes, one long ear standing up and the other flopped to the side, pink inner ears, white fluffy chest, tiny pink nose.` |
| `fuchs` | `A slim red fox sitting, white chest and cheeks, black legs, a large bushy tail with a white tip curled to the side, tall pointed ears with dark tips, sly heavy-lidded eyes.` |
| `reh` | `A young roe deer buck with small antlers standing on long slender legs with black hooves, body turned sideways and head turned toward the viewer, large ears with pink insides, cream throat, white spots on its back, short white tail.` |
| `dackel` | `A short-haired red-brown dachshund standing, long body, short legs, long soft floppy ears, lighter chest, no hat, no clothing.` (eigen: ohne Muetze, keine Stadtkulisse) |
| `mops` | `A fawn pug puppy sitting, black face mask and black ears, soft forehead wrinkles, very large dark brown eyes, curly tail.` |
| `retriever` | `A fluffy golden retriever sitting, warm golden fur, fluffy chest, feathered tail to the side, tongue out, no collar.` (eigen: kein Halsband, normale Proportionen) |
| `katze` | `An orange tabby kitten sitting, white chest and muzzle, green eyes, tail wrapped around its front paws, no whiskers.` |
| `siamkatze` | `A Siamese kitten sitting, cream body, dark brown face mask, ears, paws and tail, bright blue eyes, no whiskers.` |
| `eule` | `A cream-white owl standing, big round head, huge eyes in tan rings, dark feathered eyebrow tufts curving up at the outer ends, small orange beak, white chest with soft grey chevron marks, dark navy wings with white teardrop spots, orange feet with dark talons.` |
| `papagei` | `A scarlet macaw parrot standing with its wings spread open, blue spiky crest, yellow-orange face and chest, red body and wings with yellow-orange feather tips, large grey hooked beak, green eyes with a white eye ring, dark grey feet.` |
| `pinguin` | `A chubby baby penguin standing, black head and back, white heart-shaped face, rosy cheeks, small orange beak, round white belly, waving with one flipper, orange feet.` |
| `flamingo` | `A pink flamingo standing on long thin pink legs, round head with big eyes, curved pale pink beak with a black tip, S-shaped neck, fluffy body with darker pink wings.` |
| `rotkehlchen` | `A round European robin standing, olive-brown head and back, orange-red face and breast, white belly, small dark beak, thin legs.` |
| `delfin` | `A light blue dolphin leaping toward the viewer, big round forehead, short beak, wide smile, white belly, flippers spread like arms, curved tail fluke behind, no water.` |
| `wal` | `A cheerful blue whale in three-quarter side view, long rounded body, white throat with grooves, wide smile, pectoral fins, tail fluke raised behind, no water.` |
| `schildkroete` | `A young sea turtle in a swimming pose, big round head with huge eyes, light green skin with brown spots, olive-green domed shell with golden plates, large wing-like front flippers, no water.` (eigen: gruener Panzer) |
| `goldfisch` | `An orange clownfish with three white bands edged in black, black-edged fins, both side fins the same size, no water.` (Kennung bleibt `goldfisch`; eigen: gleich grosse Flossen) |
| `seeotter` | `A sea otter standing upright, slim dark brown body, pale cream face, white whisker pads, small round ears, paws held together at its chest, long thick tail.` |

Bei Katzen und Siamkatze steht „no whiskers“ mit Absicht: Duenne Striche zerfallen auf Avatargroesse (Projektlehre).

## Einbauen

1. Bilder speichern als `vorlagen/generiert/<kennung>-ruhig.png`, `…-muede.png`, `…-froh.png` (jpg geht auch).
   Der Ordner ist nicht im Repository.
2. Der Sitzung in Xcode Bescheid geben, oder selbst: `python3 tools/figuren_bilder_holen.py` (einzelne: Kennung
   anhaengen). Das Werkzeug stellt die Figur lokal frei (Vision, nichts wird hochgeladen), schneidet sie quadratisch zu
   und schreibt die Avatare nach `src/figuren/`. Fehlt ein Ausdruck, bleibt das alte Bild.
3. Danach wie immer: Pruefung, Commit, `npm run installieren`.

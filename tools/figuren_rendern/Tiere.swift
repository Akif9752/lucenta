// Die zwoelf Tiere. Jede Funktion baut eine Szene: Koerper aus Grundformen, Farbe als Funktion des
// Ortes, Augen und Nase als eigene Koerper. Masse: Kopf etwa Radius 1, y oben, z zur Kamera.

import SceneKit
import AppKit
import simd

struct Tier { let name: String; let bauen: () -> (SCNNode, Float, V) }   // Knoten, Kameraabstand, Ziel

func ohrPaar(_ x: Float, _ y: Float, _ z: Float, laenge: V, r1: Float, r2: Float, flach: Float, weich: Float = 0.1,
             muschel: Float = 0.7) -> [Form] {
    var f: [Form] = []
    for s: Float in [-1, 1] {
        let b = V(laenge.x * s, laenge.y, laenge.z)
        f.append(Form(art: .rundkegel(b, r1, r2), mitte: V(x * s, y, z), stauchung: V(1, 1, flach), weich: weich))
        if muschel > 0 {
            f.append(Form(art: .rundkegel(b * 0.92, r1 * muschel, r2 * 0.5), mitte: V(x * s, y, z) + V(0, 0.04, 0.10 * flach + 0.03),
                          stauchung: V(1, 1, flach * 0.7), weich: 0.05, abziehen: true))
        }
    }
    return f
}

func augenHoehlen(_ x: Float, _ y: Float, _ z: Float, _ r: Float) -> [Form] {
    [-1, 1].map { s in Form(art: .ellipsoid(V(r * 1.12, r * 1.05, r * 0.9)), mitte: V(x * s, y, z), weich: 0.07, abziehen: true) }
}

func augenSetzen(_ wurzel: SCNNode, x: Float, y: Float, z: Float, r: CGFloat, iris: NSColor, pupille: CGFloat = 0.42,
                 schlitz: Bool = false, quer: Bool = false, blick: V = V(0, 0, 6)) {
    for s: Float in [-1, 1] {
        let a = auge(radius: r, iris: iris, pupille: pupille, schlitz: schlitz, quer: quer)
        a.position = scnVektor(V(x * s, y, z))
        a.look(at: scnVektor(V(blick.x + x * s * 0.25, blick.y, blick.z)), up: SCNVector3(0, 1, 0), localFront: SCNVector3(0, 0, 1))
        wurzel.addChildNode(a)
    }
}

// Runde 125, am Bild gesehen: Augen, die vor der Haut sitzen, wirken aufgeklebt. Jetzt wird die
// Oberflaeche an der Augenstelle gesucht und das Auge so tief gesetzt, dass die Haut seinen Rand
// ueberdeckt — das ergibt die Lider, ohne sie zu modellieren.
//
// Runde 135: "Die Tiere haben alle einen sehr starren und unheimlichen Blick" (Inhaber). Drei Gruende,
// am Bild abgelesen: kreisrunde, ganz offene Augen ohne Lid — es gab nichts, das eine Stimmung
// traegt; beide Augen parallel geradeaus, knapp am Betrachter vorbei; ein kleiner Lichtpunkt.
// Jedes Tier hat jetzt einen eigenen AUSDRUCK aus vier Stellgroessen:
//   oben    wie weit das Oberlid sinkt (0 offen … 0,5 halb) — entspannt, vertraeumt, verschlafen
//   unten   wie weit das Unterlid steigt; seine Kante woelbt sich nach OBEN — das "laechelnde Auge"
//   schraeg Aussenwinkel tiefer (+) = treuherzig, bittend; leicht negativ = verschmitzt
// Dazu `funke` (Groesse des Lichtpunkts), `wange` (weiche Roete, eine Flaeche, kein Strich) und
// `zwinkern` (das linke Auge geschlossen, als Bogen).
struct Ausdruck {
    var oben: Float = 0.2
    var unten: Float = 0
    var schraeg: Float = 0
    var funke: CGFloat = 1.3
    var wange: Float = 0
    var zwinkern = false
    var groesse: CGFloat = 0.9      // etwas groesser als beim echten Tier (Entscheidung des Inhabers)
}
// Die Augen sehen erst in main.swift auf die Kamera, wenn sie feststeht (Augen heissen "auge").
// Entscheidung des Inhabers: Jedes Tier sieht den Betrachter an, egal wohin der Kopf gedreht ist.

// Ein Lid: eine Kappe auf einer Kugel knapp ueber dem Auge, in Fellfarbe, zur Kante hin dunkler
// (die Wimpernlinie als weicher Verlauf, nicht als Strich). `anteil` = welcher Teil des
// Augendurchmessers bedeckt ist. Die Kappe sitzt im Rahmen des KOPFES, nicht des Auges — der Augapfel
// dreht sich unter ihr, wie bei einem echten Lid.
// `grenze` ist der Kosinus des Kappenwinkels, aus der Lidkante in der AUGENMITTE gerechnet (siehe
// lider): Aus `anteil` allein gerechnet, zog die Woelbung die Kante vorn so weit hoch, dass das Lid
// in der Mitte fast nichts bedeckte — am Bild gesehen, die Augen blieben runde Perlen.
func lid(_ r: Float, grenze: Float, achse d: V, farbe: V) -> SCNNode? {
    if grenze > 0.985 { return nil }
    let R = r * 1.07, tMax = acosf(max(-1, grenze))
    let hilf = abs(d.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0)
    let e1 = simd_normalize(simd_cross(d, hilf)), e2 = simd_cross(d, e1)
    let ringe = 24, seg = 64
    var pkt: [SCNVector3] = [], nrm: [SCNVector3] = [], farben: [Float] = [], idx: [Int32] = []
    for i in 0...ringe {
        let t = Float(i) / Float(ringe) * tMax
        for j in 0...seg {
            let f = Float(j) / Float(seg) * 2 * .pi
            let n = d * cosf(t) + (e1 * cosf(f) + e2 * sinf(f)) * sinf(t)
            pkt.append(scnVektor(n * R)); nrm.append(scnVektor(n))
            // Zur Kante hin der dunkle Lidrand, den fast jedes Tierauge hat; leicht unruhig wie kurzes Fell.
            let pk = n * R
            let c = mische(farbe * (0.9 + 0.2 * fbm(pk * 40)), hex("#1C1411"), 0.9 * glatt(tMax - 0.45, tMax - 0.05, t))
            farben += [c.x, c.y, c.z, 1]
        }
    }
    for i in 0..<ringe { for j in 0..<seg {
        let a = Int32(i * (seg + 1) + j), b = a + Int32(seg + 1)
        idx += [a, b, a + 1, a + 1, b, b + 1]
    }}
    let fq = SCNGeometrySource(data: farben.withUnsafeBufferPointer { Data(buffer: $0) }, semantic: .color,
                               vectorCount: farben.count / 4, usesFloatComponents: true, componentsPerVector: 4,
                               bytesPerComponent: 4, dataOffset: 0, dataStride: 16)
    let g = SCNGeometry(sources: [SCNGeometrySource(vertices: pkt), SCNGeometrySource(normals: nrm), fq],
                        elements: [SCNGeometryElement(indices: idx, primitiveType: .triangles)])
    let m = SCNMaterial(); m.lightingModel = .physicallyBased; m.diffuse.contents = NSColor.white
    m.roughness.contents = 0.85; m.isDoubleSided = true
    g.materials = [m]
    return SCNNode(geometry: g)
}

// Beide Lider eines Auges. `vorn` = wohin das Auge im Kopf schaut (Flaechennormale), `s` = Seite
// (+1 rechts vom Tier aus gesehen links im Bild … das Vorzeichen von x), fuer den schraegen Winkel.
func lider(an wurzel: SCNNode, mitte: V, r: Float, vorn: V, s: Float, farbe: V, _ a: Ausdruck, geschlossen: Bool = false) {
    let F = simd_normalize(vorn)
    let U = simd_normalize(V(0, 1, 0) - F * simd_dot(V(0, 1, 0), F))
    let X = simd_cross(U, F)                       // zeigt zur Seite
    let kipp: Float = 0.30                         // wie stark sich die Lidkante woelbt
    let schraeg = a.schraeg * s * (simd_dot(X, V(1, 0, 0)) >= 0 ? 1 : -1)
    // Geschlossen: Die Lider treffen sich knapp unter der Mitte, die Kante des unteren woelbt sich
    // kraeftig nach oben — das "^" eines laechelnden, zugekniffenen Auges.
    let oben = geschlossen ? 0.58 : a.oben, unten = geschlossen ? 0.48 : a.unten
    // Oberlid: Achse nach oben, nach hinten gekippt -> Kante als Bogen nach oben; schraeg zur Seite.
    let dO = simd_normalize(U * cosf(kipp) - F * sinf(kipp) + X * sinf(schraeg))
    // Unterlid: Achse nach unten, nach VORN gekippt -> Kante woelbt sich nach oben (laechelndes Auge).
    let kippU: Float = geschlossen ? 0.75 : kipp
    let dU = simd_normalize(-U * cosf(kippU) + F * sinf(kippU) * 0.8 - X * sinf(schraeg) * 0.5)
    // Die Kante in der Augenmitte: so weit von oben (bzw. unten), wie `oben` (`unten`) sagt.
    func kante(_ anteil: Float, _ seite: Float) -> V {
        let h = (1 - 2 * anteil) * seite
        return simd_normalize(F * sqrtf(max(0, 1 - h * h)) + U * h)
    }
    for (anteil, d, seite) in [(oben, dO, Float(1)), (unten, dU, Float(-1))] where anteil > 0.02 {
        if let k = lid(r, grenze: simd_dot(d, kante(anteil, seite)), achse: d, farbe: farbe) {
            k.position = scnVektor(mitte); wurzel.addChildNode(k)
        }
    }
}

// Wangenroete: seit Runde 143 nicht mehr verwendet — kein Tier hat sie (Entscheidung des Inhabers:
// fotorealistisch, aber liebenswert).
func mitWangen(_ k: Koerper, x: Float, y: Float, staerke: Float) -> Koerper {
    if staerke <= 0 { return k }
    var w = k
    let alt = k.farbe, rosa = hex("#F09A9A")
    let zl = vorderflaeche(k, -x, y), zr = vorderflaeche(k, x, y)
    w.farbe = { p, n in
        let m = max(region(p, V(-x, y, zl), V(0.17, 0.11, 0.14), 0.6), region(p, V(x, y, zr), V(0.17, 0.11, 0.14), 0.6))
        return mische(alt(p, n), rosa, m * staerke)
    }
    return w
}

// ---------- Maul ----------
// Ein Maul ist eine Falte in der Haut, kein aufgesetzter Strich (der waere auf Avatargroesse ein
// Fremdkoerper, CLAUDE.md): eine Mulde entlang einer von Hand gesetzten Kurve, auf die Flaeche gezogen,
// zu freien Enden hin duenn auslaufend und dunkel eingefaerbt. Offene Maeuler: `hoehlen`.
struct Kurve { var punkte: [V]; var spitzVorn = true; var spitzHinten = true }
func gespiegelt(_ k: Kurve, achse: Int = 0) -> Kurve {
    var g = k; g.punkte = k.punkte.map { var q = $0; q[achse] = -q[achse]; return q }; return g
}
// Beide Seiten einer Kurve (x gespiegelt; Wal und Schildkroete: z).
func paar(_ k: Kurve, achse: Int = 0) -> [Kurve] { [k, gespiegelt(k, achse: achse)] }
func aufFlaeche(_ k: Koerper, _ p: V) -> V {
    var q = p
    for _ in 0..<10 { q -= gradient(k, q) * k.abstand(q) }
    return q
}
struct Maul {
    var kurven: [Kurve]
    var r: Float = 0.035            // halbe Breite der Falte, wo sie am breitesten ist
    var farbe: V
    var staerke: Float = 0.85
    var hoehlen: [Form] = []
    var innen = hex("#4A1E1C")
}
func mitMaul(_ k: Koerper, _ m: Maul) -> Koerper {
    var falten: [Form] = []
    for kurve in m.kurven {
        let p = kurve.punkte.map { aufFlaeche(k, $0) }, n = Float(p.count - 1)
        func breite(_ t: Float) -> Float {
            let vorn = kurve.spitzVorn ? glatt(0, 0.45, t) : 1, hinten = kurve.spitzHinten ? glatt(1, 0.55, t) : 1
            return m.r * (0.25 + 0.75 * min(vorn, hinten))
        }
        for i in 0..<(p.count - 1) {
            falten.append(Form(art: .rundkegel(p[i + 1] - p[i], breite(Float(i) / n), breite(Float(i + 1) / n)),
                               mitte: p[i], weich: 0.025, abziehen: true))
        }
    }
    var w = k
    let hoehlen = m.hoehlen.map { h -> Form in var f = h; f.abziehen = true; return f }
    w.formen += falten + hoehlen
    let alt = k.farbe
    w.farbe = { p, n in
        var c = alt(p, n)
        let dFalte = falten.map { $0.abstand(p) }.min() ?? 1
        c = mische(c, m.farbe, glatt(m.r * 0.9, 0, dFalte) * m.staerke)
        if let dHoehle = hoehlen.map({ $0.abstand(p) }).min() { c = mische(c, m.innen, glatt(0.05, 0, dHoehle)) }
        return c
    }
    return w
}

// Augen an der Kopfseite (Wal, Goldfisch, Schildkroete): gleiche Lider, Lid-Achse an der Seitenflaeche.
func seitenAuge(_ w: SCNNode, _ k: Koerper, x: Float, y: Float, tiefe: Float, sz: Float, r: CGFloat, iris: NSColor,
                pupille: CGFloat, _ a: Ausdruck) {
    let r = r * a.groesse
    let zf = vorderflaeche(k, x, y)
    let flaeche = V(x, y, zf * sz), mitte = V(x, y, (zf - tiefe) * sz)
    let au = auge(radius: r, iris: iris, pupille: pupille, funke: a.funke)
    au.position = scnVektor(mitte); au.name = "auge"
    w.addChildNode(au)
    let ueber = V(x, y + Float(r) * 1.3, vorderflaeche(k, x, y + Float(r) * 1.3) * sz)
    lider(an: w, mitte: mitte, r: Float(r), vorn: gradient(k, flaeche), s: sz, farbe: k.farbe(ueber, gradient(k, ueber)) * 0.92, a)
}

func augenEinsetzen(_ wurzel: SCNNode, _ kopf: Koerper, x: Float, y: Float, r: CGFloat, tiefe: Float = 0.42,
                    iris: NSColor, pupille: CGFloat = 0.5, schlitz: Bool = false, quer: Bool = false, schlitzBreite: CGFloat = 0.32,
                    blick: V = V(0, 0, 6), aussen: Float = 0.25, ausdruck a: Ausdruck = Ausdruck()) {
    let r = r * a.groesse
    for s: Float in [-1, 1] {
        let zf = vorderflaeche(kopf, x * s, y)
        let mitte = V(x * s, y, zf - tiefe * Float(r))
        let au = auge(radius: r, iris: iris, pupille: pupille, schlitz: schlitz, quer: quer, schlitzBreite: schlitzBreite, funke: a.funke)
        au.position = scnVektor(mitte); au.name = "auge"
        au.look(at: scnVektor(V(blick.x + x * s * aussen * 4, blick.y, blick.z)), up: SCNVector3(0, 1, 0), localFront: SCNVector3(0, 0, 1))
        // Runde 137, am Bild gesehen: Unter dem geschlossenen Lid schimmerten Hornhaut und Lichtpunkte
        // durch — das zwinkernde Auge las sich als glaenzende Kugel. Geschlossen gibt es keinen Augapfel.
        let zu = a.zwinkern && s < 0
        if !zu { wurzel.addChildNode(au) }
        // Lidfarbe: das Fell knapp ueber dem Auge.
        let ueber = V(x * s, y + Float(r) * 1.25, vorderflaeche(kopf, x * s, y + Float(r) * 1.25))
        let farbe = kopf.farbe(ueber, gradient(kopf, ueber)) * 0.92
        lider(an: wurzel, mitte: mitte, r: Float(r), vorn: gradient(kopf, V(x * s, y, zf)), s: s, farbe: farbe, a,
              geschlossen: zu)
    }
}
// Ein Lidwulst ueber jedem Auge: verschmilzt mit dem Kopf und wirft den weichen Schatten aufs Auge.
func lider(_ x: Float, _ y: Float, _ z: Float, _ r: Float, weich: Float = 0.10) -> [Form] {
    [-1, 1].map { s in Form(art: .ellipsoid(V(r * 1.15, r * 0.45, r * 0.6)), mitte: V(x * s, y + r * 0.78, z), weich: weich) }
}
func nase(_ wurzel: SCNNode, _ formen: [Form], farbe: V, lack: Float = 0.9, rauheit: Float = 0.25) {
    let k = Koerper(formen: formen, farbe: { _, _ in farbe })
    wurzel.addChildNode(glanzKoerper(k, grenze: 2.2, n: 170, rauheit: rauheit, lack: lack))
}
// Kleine glatte Teile (Zaehne, Zungen), fuer die das Raster der Abstandsfelder zu grob ist.
func perle(_ mitte: V, _ radien: V, farbe: NSColor, rauheit: CGFloat = 0.3) -> SCNNode {
    let k = SCNSphere(radius: 1); k.segmentCount = 48
    let m = SCNMaterial(); m.lightingModel = .physicallyBased; m.diffuse.contents = farbe
    m.roughness.contents = rauheit; m.clearCoat.contents = 0.5; k.materials = [m]
    let n = SCNNode(geometry: k); n.position = scnVektor(mitte); n.scale = scnVektor(radien)
    return n
}
// Eine Tiernase wie im Foto: Nasenspiegel aus feinem, mattem Leder mit zwei seitlich geschwungenen
// Nasenloechern und der Mittelrinne. Eigenes, feines Raster um die Nase — das des Kopfes ist dafuer zu grob.
// `dreieck`: Katzennase (oben breit, unten spitz).
func tierNase(_ wurzel: SCNNode, mitte: V, r: V, farbe: V, dreieck: Bool = false) {
    var formen = [Form(art: .ellipsoid(r), mitte: V(0, 0, 0))]
    if dreieck {
        formen.append(Form(art: .ellipsoid(V(r.x * 0.9, r.y * 0.5, r.z * 0.9)), mitte: V(0, r.y * 0.45, -r.z * 0.1), weich: 0.03))
        formen.append(Form(art: .ellipsoid(V(r.x * 1.4, r.y * 0.9, r.z * 1.6)), mitte: V(0, -r.y * 1.25, 0), weich: 0.03, abziehen: true))
    }
    for s: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(r.x * 0.24, r.y * 0.30, r.z * 0.55)), mitte: V(s * r.x * 0.46, -r.y * 0.30, r.z * 0.72),
                           drehung: simd_quatf(angle: s * 0.5, axis: V(0, 0, 1)), weich: r.x * 0.12, abziehen: true))
    }
    formen.append(Form(art: .rundkegel(V(0, -r.y * 0.9, -r.z * 0.1), r.x * 0.05, r.x * 0.07), mitte: V(0, -r.y * 0.25, r.z * 0.98),
                       weich: r.x * 0.05, abziehen: true))
    let lochSeiten: [Form] = Array(formen.suffix(3).prefix(2))
    var k = Koerper(formen: formen, farbe: { p, _ in
        let loch = lochSeiten.map { glatt(r.x * 0.12, 0, $0.abstand(p)) }.max() ?? 0
        return mische(farbe * (0.82 + 0.36 * fbm(p / r.x * 6)), farbe * 0.35, loch)
    }, rauheit: 0.5, fell: 0.25)
    k.fell = 0.22                       // die koernige Oberflaeche des Nasenspiegels
    let g = geometrie(netzBauen(k, grenze: max(r.x, max(r.y, r.z)) * 1.4, n: 120), k)
    g.materials[0].shaderModifiers = nil       // klein heisst hier nicht duenn: die Nase leuchtet nicht
    g.materials[0].clearCoat.contents = 0.35; g.materials[0].clearCoatRoughness.contents = 0.25
    let n = SCNNode(geometry: g); n.position = scnVektor(mitte)
    wurzel.addChildNode(n)
}
func kopfKnoten(_ k: Koerper, grenze: Float = 1.9, n: Int = 170) -> SCNNode {
    let g = geometrie(netzBauen(k, grenze: grenze, n: n), k)
    let knoten = SCNNode(geometry: g)
    for s in fellSchalen(g, k) { knoten.addChildNode(s) }
    return knoten
}

// ---------- Brauen ----------
// Tierbrauen sind kein Strich (auf Avatargroesse ein Fremdkoerper, CLAUDE.md), sondern ein Wulst ueber dem
// Auge mit eigener Fellzeichnung und laengeren Haaren. `winkel` > 0: innen hoeher (treuherzig).
// Liefert den Kopf mit Wulst und Farbe und eine Maske (1 auf der Braue) fuer die Haarlaenge.
func mitBrauen(_ k: Koerper, x: Float, y: Float, laenge: Float, dicke: Float, winkel: Float,
               farbe: V? = nil, staerke: Float = 0.7, wulst: Float = 1) -> (Koerper, (V) -> Float) {
    var formen: [Form] = []
    for s: Float in [-1, 1] {
        let zf = vorderflaeche(k, x * s, y)
        let dreh = simd_quatf(angle: s * atan2f(x, max(zf, 0.2)), axis: V(0, 1, 0)) * simd_quatf(angle: -s * winkel, axis: V(0, 0, 1))
        formen.append(Form(art: .ellipsoid(V(laenge, dicke, dicke * 1.3)), mitte: V(x * s, y, zf - dicke * (1.1 - 0.5 * wulst)),
                           drehung: dreh, weich: 0.10))
    }
    var w = k
    if wulst > 0 { w.formen += formen }
    let maske: (V) -> Float = { p in formen.map { glatt(0.07, -0.01, $0.abstand(p)) }.max() ?? 0 }
    if let farbe {
        let alt = k.farbe
        w.farbe = { p, n in mische(alt(p, n), farbe, maske(p) * staerke) }
    }
    return (w, maske)
}

// ---------- Haarlaenge ----------
// 1 weit weg von `mitte`, 0 innerhalb von `r` — um Augen, Nase, Maul bleibt die Haut kahl bzw. kurz.
func fern(_ p: V, _ mitte: V, _ r: Float) -> Float { glatt(r, r * 1.7, simd_length(p - mitte)) }
// Die Augenstellen eines Kopfes (beide Seiten), auf der Vorderflaeche.
func augenStellen(_ k: Koerper, x: Float, y: Float) -> [V] { [-1, 1].map { s in V(x * s, y, vorderflaeche(k, x * s, y)) } }
func ohneAugen(_ p: V, _ augen: [V], _ r: Float) -> Float { augen.map { glatt(r, r * 1.3, simd_length(p - $0)) }.min() ?? 1 }

// Wie lang das Fell wo ist. `zonen`: (Mitte, Radien, Faktor) — 2 = doppelt so lang (Wangenkrause, Brust),
// 0,3 = kurz (Ohren). Zur Nase hin wird es kurz, um Augen und Nase kahl.
struct FellKarte {
    var kopf: Float
    var rumpf: Float
    var nase: V
    var schnauze: Float = 0.5
    var augen: [V]
    var augenR: Float
    var braue: Float = 1.0
    var zonen: [(V, V, Float)] = []
}
func beide(_ m: V, _ r: V, _ faktor: Float) -> [(V, V, Float)] { [(m, r, faktor), (V(-m.x, m.y, m.z), r, faktor)] }
func haarKarte(_ kopf: Koerper, _ f: FellKarte, braue: @escaping (V) -> Float) -> (V) -> Float {
    { p in
        let r = glatt(0.02, 0.16, kopf.abstand(p))
        var l = f.kopf * (1 - r) + f.rumpf * r
        for (m, ra, faktor) in f.zonen { l *= 1 + (faktor - 1) * region(p, m, ra, 0.4) }
        l *= 1 + f.braue * braue(p)
        l *= 0.2 + 0.8 * glatt(0.06, f.schnauze, simd_length(p - f.nase))
        return l * ohneAugen(p, f.augen, f.augenR) * fern(p, f.nase, 0.10)
    }
}
func mische(_ a: V, _ b: V, _ t: Float) -> V { simd_mix(a, b, V(repeating: simd_clamp(t, 0, 1))) }

func farbeMitRauschen(_ c: V, _ p: V, _ staerke: Float = 0.12) -> V { c * (1 - staerke + 2 * staerke * fbm(p * 3.1)) }

// ---------- Oberkoerper (Runde 133) ----------
//
// Auftrag des Inhabers: Die Tiere waren "schwebende Koepfe"; sie sollen einen Koerper bekommen, der
// das Portraet nach unten ausfuellt — nicht den ganzen Koerper, und der Kopf bleibt genau, wo er ist.
// Darum wird nur ANGESETZT: Hals, Brust und Rumpf verschmelzen weich mit dem unveraenderten Kopf in
// EINEM Abstandsfeld (keine Naht am Hals), und der Kreis schneidet den Rumpf unten ab wie bei einem
// Brustbild. Der Kopf behaelt seine Farbe; unterhalb des Kinns gilt die des Rumpfes.
//
// Erste Fassung (breite Schultern quer zur Blickrichtung) sah aus "wie ein menschlicher Oberkoerper"
// (Inhaber). Ein Vierbeiner ist anders gebaut: Die Brust ist SCHMAL und TIEF, darunter stehen zwei
// Vorderbeine dicht beieinander, ueber ihnen die Schulterblaetter, und der Rumpf laeuft hinter dem
// Kopf nach HINTEN weg, nicht zur Seite. Durch die Drehung des Tieres erscheint der Ruecken dann
// seitlich hinter dem Kopf — genau das Bild eines sitzenden Tieres im Portraet.
//
// Die Augen werden weiter am Kopf allein eingesetzt — der Rumpf liegt nie auf Augenhoehe.
struct Bau {
    var brust: Float = 1            // Breite der Brust (1 = schmal wie bei Fuchs und Katze)
    var tiefe: Float = 1            // wie weit die Brust nach vorn gewoelbt ist
    var hals: Float = 0.40          // Halsradius oben
    var halsLaenge: Float = 1       // >1: langer Hals (Reh)
    var bein: Float = 0.18          // Radius der Vorderbeine
    var beinAbstand: Float = 0.24   // halber Abstand der Vorderbeine
    var beinOben: Float = -1.25     // wo die Beine aus der Brust kommen
    var ruecken: Float = 0.62       // Radius des Rumpfes
    var rueckenLaenge: Float = 1.7
    var rueckenHoehe: Float = -1.0  // Hoehe des Widerrists
}
func vierbeiner(_ b: Bau) -> [Form] {
    let l = b.halsLaenge
    var f: [Form] = [
        // Hals: vom Hinterkopf schraeg nach vorn unten zur Brust.
        Form(art: .rundkegel(V(0, -0.75 * l, 0.30), b.hals, b.hals + 0.12), mitte: V(0, -0.30, -0.30), weich: 0.28),
        // Brust: schmal und tief, vorn unter dem Kinn.
        Form(art: .ellipsoid(V(0.50 * b.brust, 0.62, 0.55 * b.tiefe)), mitte: V(0, -0.95 - 0.30 * l, 0.15 + 0.20 * (b.tiefe - 1)), weich: 0.28),
        // Rumpf: hinter dem Kopf nach hinten, leicht abfallend.
        Form(art: .rundkegel(V(0, -0.35, -b.rueckenLaenge), b.ruecken, b.ruecken * 0.92),
             mitte: V(0, b.rueckenHoehe - 0.25 * (l - 1), -0.30), weich: 0.35),
    ]
    for s: Float in [-1, 1] {
        // Schulterblatt ueber dem Bein, dann das Bein senkrecht nach unten.
        f.append(Form(art: .ellipsoid(V(0.24, 0.44, 0.36)), mitte: V(s * (b.beinAbstand + 0.14), b.beinOben + 0.30, -0.02), weich: 0.25))
        f.append(Form(art: .rundkegel(V(0, -1.40, 0.06), b.bein, b.bein * 0.85),
                      mitte: V(s * b.beinAbstand, b.beinOben, 0.22), weich: 0.10))
    }
    return f
}
// Wie weit unten ein Punkt am Bein liegt (0 oben an der Brust, 1 tief unten) — fuer Fussfarben.
func beinUnten(_ p: V, _ b: Bau, ab: Float = 0.5) -> Float {
    let amBein = glatt(b.beinAbstand + b.bein + 0.10, b.beinAbstand + b.bein - 0.05, abs(abs(p.x) - b.beinAbstand) + b.beinAbstand)
    return amBein * glatt(b.beinOben - ab, b.beinOben - ab - 0.30, p.y) * glatt(-0.2, 0.1, p.z)
}
// Der Brustlatz, die helle Flaeche vorn, die viele dieser Tiere tragen.
func latz(_ p: V, breite: Float = 0.30, hoehe h: Float = 0) -> Float {
    region(p, V(0, -0.95 + h, 0.70), V(breite, 0.75, 0.45), 0.35)
}
// Kopf und Rumpf in einem Koerper. Die Farbe richtet sich nach dem ABSTAND zum Kopf, nicht nach der
// Hoehe: Nach der Hoehe trugen die Schultern die Kopffarbe unter dem Kinn (beim Fuchs weisse Flecken),
// weil sie auf derselben Hoehe liegen wie die Wangen.
// NUR_KOPF=1: ohne Rumpf rendern — nur so laesst sich der Rahmen messen (figuren_holen.py --rahmen-messen).
let nurKopf = ProcessInfo.processInfo.environment["NUR_KOPF"] != nil
func brustbild(_ kopf: Koerper, _ formen: [Form], farbe: @escaping (V, V) -> V) -> Koerper {
    if nurKopf { return kopf }
    var k = kopf
    k.formen += formen
    let kopfFarbe = kopf.farbe
    k.farbe = { p, n in mische(kopfFarbe(p, n), farbe(p, n), glatt(0.02, 0.16, kopf.abstand(p))) }
    return k
}
// Der Rumpf reicht nach hinten bis z = -3 (Dackel); die Rasterweite bleibt die des Kopfes.
func brustKnoten(_ k: Koerper) -> SCNNode { kopfKnoten(k, grenze: 3.1, n: 282) }

// ---------- Fuchs ----------

func fuchs() -> (SCNNode, Float, V) {
    let rot = hex("#C9581B"), weiss = hex("#F1E6DA"), dunkel = hex("#2E1C14"), creme = hex("#EED6BC")
    var formen: [Form] = [
        // Keilfoermig wie beim echten Rotfuchs: kleinere, flachere Hirnschale, lange schmale Schnauze.
        Form(art: .ellipsoid(V(0.84, 0.66, 0.78)), mitte: V(0, 0.16, -0.10)),
        Form(art: .ellipsoid(V(0.46, 0.32, 0.38)), mitte: V(-0.62, -0.20, 0.08), weich: 0.28),
        Form(art: .ellipsoid(V(0.46, 0.32, 0.38)), mitte: V(0.62, -0.20, 0.08), weich: 0.28),
        Form(art: .rundkegel(V(0, -0.26, 1.34), 0.27, 0.085), mitte: V(0, -0.04, 0.38), weich: 0.24),
        Form(art: .rundkegel(V(0, -0.06, 0.98), 0.21, 0.07), mitte: V(0, -0.30, 0.40), weich: 0.16),
        Form(art: .ellipsoid(V(0.50, 0.20, 0.28)), mitte: V(0, 0.35, 0.48), weich: 0.25),
    ]
    formen += ohrPaar(0.44, 0.60, -0.12, laenge: V(0.26, 0.86, -0.10), r1: 0.36, r2: 0.035, flach: 0.40)
    formen += lider(0.34, 0.18, 0.62, 0.16)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(rot, p, 0.08)
        let linie = -0.16 - 0.08 * abs(p.x) + 0.10 * max(0, p.z - 0.7)
        let w = glatt(linie + 0.05, linie - 0.05, p.y) * glatt(-0.3, 0.2, p.z + 0.5 * abs(p.x) - 0.2)
        c = mische(c, farbeMitRauschen(weiss, p, 0.04), w)
        // Ohren: Rueckseite und Rand dunkel, Innenseite creme.
        // Ohrfarben erst oberhalb des Schaedels — darunter lief das Creme der Innenseite auf die Stirn.
        let ohr = glatt(0.86, 1.00, p.y) * glatt(0.20, 0.34, abs(p.x))
        let innen = glatt(-0.1, 0.3, n.z) * glatt(1.42, 1.15, p.y)
        c = mische(c, mische(mische(c, dunkel, 0.65), creme, innen), ohr)
        c = mische(c, dunkel, glatt(1.30, 1.44, p.y))
        c *= 1 - 0.25 * glatt(1.1, 1.6, p.z) * glatt(-0.30, -0.05, p.y)
        return c
    }, rauheit: 0.72, fell: 0.07)
    // Fuchs: Braue etwas dunkler rostrot ueber dem inneren Augenwinkel; dichtes, langes Fell mit weisser
    // Wangenkrause und Brust, kurz auf Schnauze und Ohren.
    var (braue, braueM) = mitBrauen(kopf, x: 0.30, y: 0.39, laenge: 0.14, dicke: 0.055, winkel: 0.25, farbe: mische(rot, dunkel, 0.45), staerke: 0.8)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.07, rumpf: 0.11, nase: V(0, -0.290, 1.740), schnauze: 0.9,
        augen: augenStellen(kopf, x: 0.34, y: 0.18), augenR: 0.17,
        zonen: beide(V(0.62, -0.22, 0.10), V(0.45, 0.35, 0.45), 1.5) + [(V(0, 0.95, -0.1), V(0.9, 0.35, 0.5), 0.35), (V(0, -1.0, 0.6), V(0.5, 0.6, 0.5), 1.5)]), braue: braueM)
    braue.fellArt = Fell(dichte: 75, ursprung: V(0, -0.290, 1.740), spitze: 1.04, straehnen: 0.55)
    // Fuchs: schwarze Lefzen, die unter der Nase beginnen und an den Seiten der Schnauze zum Mundwinkel
    // ansteigen — das "Fuchslaecheln".
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.350, 1.720), V(0, -0.420, 1.640)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.420, 1.640), V(0.07, -0.440, 1.500), V(0.13, -0.440, 1.280), V(0.19, -0.38, 0.96), V(0.23, -0.31, 0.84)], spitzVorn: false)),
        r: 0.032, farbe: dunkel, staerke: 0.9))
    let bau = Bau(tiefe: 1.45)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        // Weisse Kehle und Brust, dunkle "Struempfe" an den Vorderbeinen.
        let c = mische(farbeMitRauschen(rot, p, 0.08), farbeMitRauschen(weiss, p, 0.04), latz(p, breite: 0.28))
        return mische(c, dunkel, beinUnten(p, bau, ab: 0.30) * 0.85)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.290, 1.740), r: V(0.115, 0.08, 0.10), farbe: hex("#161112"))
    augenEinsetzen(w, kopf, x: 0.34, y: 0.18, r: 0.19, iris: NSColor(calibratedRed: 0.93, green: 0.63, blue: 0.16, alpha: 1), pupille: 0.6, schlitz: true, schlitzBreite: 0.36, ausdruck: Ausdruck(oben: 0.08, unten: 0.15, schraeg: 0.10, funke: 1.4, wange: 0.30))
    // Kopfhaltung je Tier verschieden (Auftrag des Inhabers: nicht alle in dieselbe Richtung).
    w.eulerAngles = SCNVector3(0.08, -0.48, -0.06)
    return (w, 7.6, V(0, 0.22, 0.2))
}

// ---------- Katze (rot getigert) ----------

func katze() -> (SCNNode, Float, V) {
    let rot = hex("#D9893E"), streifen = hex("#9E5320"), weiss = hex("#F4EBDF"), rosa = hex("#E8A9A0")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.95, 0.80, 0.85)), mitte: V(0, 0.10, 0)),
        Form(art: .ellipsoid(V(0.42, 0.30, 0.34)), mitte: V(-0.60, -0.22, 0.25), weich: 0.30),
        Form(art: .ellipsoid(V(0.42, 0.30, 0.34)), mitte: V(0.60, -0.22, 0.25), weich: 0.30),
        // Schnurrhaarpolster: zwei Wuelste unter der Nase, das Kennzeichen jedes Katzengesichts.
        Form(art: .ellipsoid(V(0.22, 0.17, 0.18)), mitte: V(-0.15, -0.26, 0.78), weich: 0.12),
        Form(art: .ellipsoid(V(0.22, 0.17, 0.18)), mitte: V(0.15, -0.26, 0.78), weich: 0.12),
        Form(art: .ellipsoid(V(0.17, 0.12, 0.14)), mitte: V(0, -0.42, 0.68), weich: 0.12),
    ]
    formen += ohrPaar(0.50, 0.55, -0.05, laenge: V(0.22, 0.62, -0.02), r1: 0.34, r2: 0.05, flach: 0.42)
    formen += lider(0.33, 0.12, 0.66, 0.18, weich: 0.12)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(rot, p, 0.07)
        // Tigerung: Streifen quer ueber Stirn und Wangen, auf der Stirn das "M".
        // feine Linien wie bei einer echten Tigerkatze: das "M" auf der Stirn, Linien ueber die Wangen
        let band = sinf(p.x * 24 + sinf(p.y * 4) * 1.2 + fbm(p * 3) * 2) * 0.5 + 0.5
        let stirn = glatt(0.30, 0.55, p.y) * glatt(0.62, 0.2, abs(p.x)) * glatt(0.80, 0.90, band)
        let wange = glatt(0.35, 0.65, abs(p.x)) * glatt(0.82, 0.92, sinf(p.y * 20 + abs(p.x) * 5 + fbm(p * 3) * 2) * 0.5 + 0.5)
        c = mische(c, streifen, (stirn + wange * 0.8) * glatt(-0.4, 0.2, p.y + 0.5))
        // Weiss: Schnurrhaarpolster, Kinn.
        let weissAnteil = glatt(-0.08, -0.18, p.y) * glatt(0.35, 0.65, p.z) + glatt(-0.30, -0.42, p.y)
        c = mische(c, weiss, weissAnteil)
        let ohr = glatt(0.62, 0.78, p.y) * glatt(0.25, 0.36, abs(p.x)) * glatt(0.1, 0.5, n.z) * glatt(1.20, 1.0, p.y)
        c = mische(c, rosa, ohr * 0.85)
        return c
    }, rauheit: 0.72, fell: 0.06)
    // Katze: helles Fell ueber den Augen (Katzen haben einen hellen Ring ums Auge); mittellang,
    // Wangenbueschel, kurz auf den Schnurrhaarpolstern.
    var (braue, braueM) = mitBrauen(kopf, x: 0.30, y: 0.35, laenge: 0.13, dicke: 0.045, winkel: 0.18, farbe: mische(rot, weiss, 0.6), staerke: 0.85)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.05, rumpf: 0.07, nase: V(0, -0.06, 0.92), schnauze: 0.45,
        augen: augenStellen(kopf, x: 0.33, y: 0.12), augenR: 0.19,
        zonen: beide(V(0.62, -0.22, 0.25), V(0.40, 0.30, 0.40), 1.8) + [(V(0, 0.85, 0), V(0.9, 0.35, 0.5), 0.35)]), braue: braueM)
    braue.fellArt = Fell(dichte: 85, ursprung: V(0, -0.06, 0.92), spitze: 1.04, straehnen: 0.3)
    // Katze: das "ω" — eine Rinne von der Nase senkrecht nach unten, die sich unter den
    // Schnurrhaarpolstern in zwei Boegen teilt.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.17, 0.98), V(0, -0.30, 0.97), V(0, -0.38, 0.94)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.38, 0.94), V(0.06, -0.43, 0.92), V(0.13, -0.43, 0.88), V(0.19, -0.39, 0.82)], spitzVorn: false)),
        r: 0.031, farbe: hex("#7E4234"), staerke: 0.85))
    let bau = Bau(bein: 0.17, ruecken: 0.60)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        // Getigert auch am Koerper: Ringe um die Beine, Streifen ueber den Ruecken; weisse Brust.
        var c = farbeMitRauschen(rot, p, 0.07)
        let ringe = glatt(0.78, 0.90, sinf(p.y * 16 + abs(p.x) * 2 + fbm(p * 3) * 2) * 0.5 + 0.5) * glatt(-1.3, -1.5, p.y)
        let ruecken = glatt(0.78, 0.90, sinf(p.z * 14 + p.y * 3 + fbm(p * 3) * 2) * 0.5 + 0.5) * glatt(0.0, -0.4, p.z)
        c = mische(c, streifen, max(ringe, ruecken) * 0.8)
        return mische(c, farbeMitRauschen(weiss, p, 0.04), latz(p, breite: 0.30))
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.08, 0.93), r: V(0.095, 0.06, 0.06), farbe: hex("#C97F7C"), dreieck: true)
    augenEinsetzen(w, kopf, x: 0.33, y: 0.12, r: 0.21, iris: NSColor(calibratedRed: 0.62, green: 0.74, blue: 0.22, alpha: 1), pupille: 0.55, schlitz: true, schlitzBreite: 0.62, ausdruck: Ausdruck(oben: 0.10, unten: 0.07, schraeg: 0.14, funke: 1.5, wange: 0.40))
    w.eulerAngles = SCNVector3(0.06, 0.34, 0.12)
    return (w, 7.3, V(0, 0.18, 0))
}

// ---------- Baer ----------

func baer() -> (SCNNode, Float, V) {
    let braun = hex("#7A4A2B"), hell = hex("#C99A68"), innen = hex("#5A3420")
    var formen: [Form] = [
        // Braunbaer: flachere Stirn, laengere Schnauze, kleinere Ohren als beim Teddy.
        Form(art: .ellipsoid(V(0.96, 0.82, 0.88)), mitte: V(0, 0.10, -0.02)),
        Form(art: .ellipsoid(V(0.50, 0.40, 0.45)), mitte: V(-0.55, -0.25, 0.25), weich: 0.35),
        Form(art: .ellipsoid(V(0.50, 0.40, 0.45)), mitte: V(0.55, -0.25, 0.25), weich: 0.35),
        // Schnauze: rund und kraeftig.
        Form(art: .ellipsoid(V(0.40, 0.32, 0.50)), mitte: V(0, -0.25, 0.88), weich: 0.25),
    ]
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.23, 0.23, 0.14)), mitte: V(0.64 * sx, 0.74, -0.12), weich: 0.12))
        formen.append(Form(art: .ellipsoid(V(0.13, 0.13, 0.09)), mitte: V(0.66 * sx, 0.76, -0.01), weich: 0.06, abziehen: true))
    }
    formen += lider(0.34, 0.20, 0.72, 0.13)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(braun, p, 0.09)
        c = mische(c, farbeMitRauschen(hell, p, 0.05), region(p, V(0, -0.270, 1.060), V(0.40, 0.32, 0.30), 0.3))
        c = mische(c, innen, glatt(0.62, 0.72, p.y) * glatt(0.48, 0.58, abs(p.x)) * glatt(0.2, 0.6, n.z) * 0.6)
        return c
    }, rauheit: 0.78, fell: 0.08)
    // Baer: kraeftiger Brauenwulst mit hellerem Fell; dichtes, zotteliges Fell in Buescheln, Halskrause.
    var (braue, braueM) = mitBrauen(kopf, x: 0.32, y: 0.37, laenge: 0.13, dicke: 0.07, winkel: 0.30, farbe: mische(braun, hell, 0.5), staerke: 0.85)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.10, rumpf: 0.12, nase: V(0, -0.100, 1.260), schnauze: 0.55,
        augen: augenStellen(kopf, x: 0.34, y: 0.20), augenR: 0.13,
        zonen: beide(V(0.55, -0.30, 0.25), V(0.45, 0.40, 0.45), 1.4)), braue: braueM)
    braue.fellArt = Fell(dichte: 60, ursprung: V(0, -0.130, 1.340), straehnen: 0.6)
    // Baer: Rinne unter der Nase, dann ein breites, ruhiges Laecheln ueber die helle Schnauze.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.200, 1.310), V(0, -0.300, 1.290), V(0, -0.370, 1.250)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.370, 1.250), V(0.08, -0.420, 1.220), V(0.17, -0.410, 1.150), V(0.25, -0.350, 1.060)], spitzVorn: false)),
        r: 0.034, farbe: hex("#2E1A12"), staerke: 0.85))
    let bau = Bau(brust: 1.45, tiefe: 1.1, hals: 0.52, bein: 0.27, beinAbstand: 0.33, ruecken: 0.85, rueckenHoehe: -0.85)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(braun, p, 0.09), farbeMitRauschen(hell, p, 0.05), latz(p, breite: 0.40) * 0.25)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.100, 1.260), r: V(0.20, 0.13, 0.13), farbe: hex("#1A1312"))
    augenEinsetzen(w, kopf, x: 0.34, y: 0.20, r: 0.15, iris: NSColor(calibratedRed: 0.36, green: 0.20, blue: 0.10, alpha: 1), pupille: 0.55, ausdruck: Ausdruck(oben: 0.10, unten: 0.03, schraeg: 0.28, funke: 1.6, wange: 0.30))
    w.eulerAngles = SCNVector3(0.06, -0.22, 0.04)
    return (w, 7.3, V(0, 0.15, 0))
}

// ---------- Panda ----------

func panda() -> (SCNNode, Float, V) {
    let weiss = hex("#F1EEE6"), schwarz = hex("#211E1E")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(1.04, 0.86, 0.90)), mitte: V(0, 0.06, 0)),
        Form(art: .ellipsoid(V(0.52, 0.40, 0.44)), mitte: V(-0.56, -0.24, 0.22), weich: 0.35),
        Form(art: .ellipsoid(V(0.52, 0.40, 0.44)), mitte: V(0.56, -0.24, 0.22), weich: 0.35),
        // Wie beim echten Panda: die weisse Schnauze steht deutlich vor.
        Form(art: .ellipsoid(V(0.36, 0.28, 0.44)), mitte: V(0, -0.26, 0.86), weich: 0.25),
    ]
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.28, 0.27, 0.18)), mitte: V(0.70 * sx, 0.74, -0.10), weich: 0.12))
    }
    formen += lider(0.34, 0.16, 0.72, 0.13)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(weiss, p, 0.04)
        // Ohren schwarz.
        c = mische(c, schwarz, glatt(0.55, 0.68, p.y) * glatt(0.40, 0.52, abs(p.x)))
        // Augenflecken: schraeg nach aussen unten auslaufende Tropfen.
        for sx: Float in [-1, 1] {
            let q = p - V(0.36 * sx, 0.10, 0.70)
            let gedreht = V(q.x * cosf(0.6) - q.y * sinf(0.6) * sx, q.x * sinf(0.6) * sx + q.y * cosf(0.6), q.z)
            c = mische(c, schwarz, region(gedreht, V(0, -0.04, 0.06), V(0.24, 0.34, 0.6), 0.18))
        }
        return c
    }, rauheit: 0.78, fell: 0.07)
    // Panda: Brauenwulst ohne eigene Farbe (ueber dem Fleck ist der Panda weiss); dichte, wollige Buschel.
    var (braue, braueM) = mitBrauen(kopf, x: 0.32, y: 0.35, laenge: 0.12, dicke: 0.06, winkel: 0.25)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.09, rumpf: 0.10, nase: V(0, -0.120, 1.240), schnauze: 0.5,
        augen: augenStellen(kopf, x: 0.34, y: 0.16), augenR: 0.13, braue: 0.3), braue: braueM)
    braue.fellArt = Fell(dichte: 70, ursprung: V(0, -0.120, 1.280), straehnen: 0.5)
    // Panda: kleiner als beim Baer und hoeher angesetzt — ein schmales, zufriedenes Laecheln.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.210, 1.270), V(0, -0.290, 1.250), V(0, -0.350, 1.220)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.350, 1.220), V(0.07, -0.390, 1.190), V(0.14, -0.380, 1.140), V(0.20, -0.330, 1.070)], spitzVorn: false)),
        r: 0.030, farbe: schwarz, staerke: 0.85))
    let bau = Bau(brust: 1.45, tiefe: 1.1, hals: 0.52, bein: 0.27, beinAbstand: 0.33, ruecken: 0.85, rueckenHoehe: -0.90)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        // Das Pandamuster: weisser Koerper, schwarze Vorderbeine, und ein schwarzer Guertel ueber die
        // Schultern, der beide Beine ueber den Ruecken verbindet.
        let guertel = glatt(0.50, 0.24, abs(p.z + 0.40)) * glatt(-0.46, -0.80, p.y)   // Runde 137: weicher auslaufend
        let beine = max(glatt(-0.74, -1.02, p.y) * glatt(0.04, 0.32, abs(p.x)), glatt(-1.20, -1.45, p.y))
        return mische(farbeMitRauschen(weiss, p, 0.04), farbeMitRauschen(schwarz, p, 0.05), max(guertel, beine))
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.120, 1.240), r: V(0.16, 0.10, 0.11), farbe: hex("#141212"))
    augenEinsetzen(w, kopf, x: 0.34, y: 0.16, r: 0.15, iris: NSColor(calibratedRed: 0.38, green: 0.24, blue: 0.12, alpha: 1), pupille: 0.55, ausdruck: Ausdruck(oben: 0.26, unten: 0.13, schraeg: 0.20, funke: 1.5, wange: 0.40))
    w.eulerAngles = SCNVector3(0.06, 0.30, -0.10)
    return (w, 7.3, V(0, 0.15, 0))
}

// ---------- Hase (Wildkaninchen) ----------

func hase() -> (SCNNode, Float, V) {
    let grau = hex("#9B8370"), hell = hex("#E9E1D6"), rosa = hex("#E5B1A8")
    var formen: [Form] = [
        // Wildkaninchen: laenglicher Kopf, schmale, spitz zulaufende Schnauze, kleinere Backen.
        Form(art: .ellipsoid(V(0.72, 0.68, 0.88)), mitte: V(0, 0.03, -0.05)),
        Form(art: .ellipsoid(V(0.34, 0.28, 0.36)), mitte: V(-0.36, -0.27, 0.36), weich: 0.32),
        Form(art: .ellipsoid(V(0.34, 0.28, 0.36)), mitte: V(0.36, -0.27, 0.36), weich: 0.32),
        Form(art: .ellipsoid(V(0.27, 0.23, 0.34)), mitte: V(0, -0.19, 0.74), weich: 0.20),
    ]
    for sx: Float in [-1, 1] {
        let dreh = simd_quatf(angle: -0.18 * sx, axis: V(0, 0, 1)) * simd_quatf(angle: -0.25, axis: V(1, 0, 0))
        formen.append(Form(art: .ellipsoid(V(0.24, 0.78, 0.09)), mitte: V(0.30 * sx, 1.10, -0.20), drehung: dreh, weich: 0.14))
        formen.append(Form(art: .ellipsoid(V(0.16, 0.66, 0.06)), mitte: V(0.30 * sx, 1.12, -0.13), drehung: dreh, weich: 0.05, abziehen: true))
    }
    formen += lider(0.40, 0.14, 0.52, 0.15)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(grau, p, 0.10)
        c = mische(c, farbeMitRauschen(hell, p, 0.04), glatt(-0.10, -0.30, p.y) * glatt(0.2, 0.6, p.z))
        c = mische(c, hell, region(p, V(0, -0.080, 0.950), V(0.20, 0.12, 0.2), 0.4) * 0.7)
        let ohrInnen = glatt(0.65, 0.85, p.y) * glatt(0.0, 0.4, n.z)
        c = mische(c, rosa, ohrInnen * 0.8)
        return c
    }, rauheit: 0.80, fell: 0.07)
    // Hase: heller Saum ueber dem Auge (Wildkaninchen tragen einen hellen Augenring); sehr feines,
    // dichtes, weiches Fell, Brust flauschig, Ohren fast kahl.
    var (braue, braueM) = mitBrauen(kopf, x: 0.37, y: 0.34, laenge: 0.11, dicke: 0.04, winkel: 0.12, farbe: hell, staerke: 0.8, wulst: 0.6)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.055, rumpf: 0.07, nase: V(0, -0.060, 1.070), schnauze: 0.4,
        augen: augenStellen(kopf, x: 0.40, y: 0.14), augenR: 0.16, braue: 0.2,
        zonen: beide(V(0.40, -0.30, 0.38), V(0.42, 0.34, 0.40), 1.5) + [(V(0, 1.15, -0.2), V(0.8, 0.85, 0.4), 0.2), (V(0, -1.0, 0.6), V(0.5, 0.5, 0.5), 1.6)]), braue: braueM)
    braue.fellArt = Fell(dichte: 95, aufrecht: 0.55, ursprung: V(0, -0.060, 1.070), straehnen: 0.25)
    // Hase: die gespaltene Oberlippe ("Y") und darunter zwei Schneidezaehne.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.110, 1.090), V(0, -0.180, 1.080), V(0, -0.230, 1.060)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.230, 1.060), V(0.05, -0.280, 1.040), V(0.11, -0.290, 1.000)], spitzVorn: false)),
        r: 0.024, farbe: hex("#7A5A50"), staerke: 0.8))
    let bau = Bau(hals: 0.42, halsLaenge: 0.7, bein: 0.15, beinAbstand: 0.20, beinOben: -1.05, ruecken: 0.90, rueckenLaenge: 1.1, rueckenHoehe: -1.05)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(grau, p, 0.10), farbeMitRauschen(hell, p, 0.04), latz(p, breite: 0.30, hoehe: 0.10) * 0.85)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.060, 1.070), r: V(0.09, 0.06, 0.06), farbe: hex("#D28E8C"))
    let zahn = aufFlaeche(kopf, V(0, -0.330, 1.050))
    for s: Float in [-1, 1] { w.addChildNode(perle(zahn + V(0.036 * s, -0.012, -0.012), V(0.034, 0.050, 0.020), farbe: NSColor(white: 0.97, alpha: 1))) }
    augenEinsetzen(w, kopf, x: 0.40, y: 0.14, r: 0.18, iris: NSColor(calibratedRed: 0.28, green: 0.16, blue: 0.09, alpha: 1), pupille: 0.6, aussen: 0.5, ausdruck: Ausdruck(oben: 0.04, unten: 0.00, schraeg: 0.10, funke: 1.7, wange: 0.45))
    w.eulerAngles = SCNVector3(0.04, -0.42, 0.06)
    return (w, 8.6, V(0, 0.55, 0))
}

// ---------- Reh ----------

func reh() -> (SCNNode, Float, V) {
    let braun = hex("#B47548"), weiss = hex("#F2E8DC"), dunkel = hex("#3A2418")
    var formen: [Form] = [
        // Wie beim echten Reh: schmale Hirnschale, langer, sich verjuengender Nasenruecken.
        Form(art: .ellipsoid(V(0.66, 0.64, 0.74)), mitte: V(0, 0.17, -0.08)),
        // lange, schmale Schnauze
        Form(art: .rundkegel(V(0, -0.36, 0.90), 0.38, 0.23), mitte: V(0, -0.02, 0.28), weich: 0.28),
    ]
    // Lauscher: gross, seitlich abstehend, schaufelfoermig.
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.48, 0.24, 0.10)), mitte: V(0.92 * sx, 0.62, -0.18),
                           drehung: simd_quatf(angle: 0.45 * sx, axis: V(0, 0, 1)), weich: 0.12))
        formen.append(Form(art: .ellipsoid(V(0.38, 0.17, 0.08)), mitte: V(0.94 * sx, 0.64, -0.10),
                           drehung: simd_quatf(angle: 0.45 * sx, axis: V(0, 0, 1)), weich: 0.05, abziehen: true))
    }
    formen += lider(0.36, 0.22, 0.52, 0.16)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(braun, p, 0.08)
        // Weisser Ring um die Schnauze, Kinn hell, Nasenruecken dunkler.
        c = mische(c, weiss, region(p, V(0, -0.400, 1.080), V(0.34, 0.24, 0.30), 0.35))
        c = mische(c, weiss, glatt(-0.30, -0.45, p.y) * glatt(0.3, 0.6, p.z))
        c *= 1 - 0.20 * region(p, V(0, -0.060, 1.160), V(0.15, 0.3, 0.4), 0.5)
        // Ohren innen hell, Rand dunkel.
        let ohr = glatt(0.62, 0.80, abs(p.x)) * glatt(0.30, 0.45, p.y)
        c = mische(c, mische(mische(c, dunkel, 0.3), weiss, glatt(0.0, 0.6, n.z)), ohr)
        c = mische(c, dunkel, glatt(1.25, 1.38, abs(p.x)) * ohr)
        return c
    }, rauheit: 0.75, fell: 0.06)
    // Reh: nur ein Hauch heller ueber dem Auge (weisse Brauen hat es nicht); kurzes, anliegendes Fell.
    var (braue, braueM) = mitBrauen(kopf, x: 0.34, y: 0.41, laenge: 0.11, dicke: 0.045, winkel: 0.2, farbe: mische(braun, weiss, 0.30), staerke: 0.45, wulst: 0.6)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.025, rumpf: 0.03, nase: V(0, -0.360, 1.380), schnauze: 0.6,
        augen: augenStellen(kopf, x: 0.36, y: 0.22), augenR: 0.17, braue: 0.3,
        zonen: beide(V(0.92, 0.62, -0.18), V(0.55, 0.30, 0.25), 0.6)), braue: braueM)
    braue.fellArt = Fell(dichte: 100, aufrecht: 0.2, neigung: 1.6, ursprung: V(0, -0.360, 1.380), straehnen: 0.15)
    // Reh: geschlossenes, schmales Maul tief an der Schnauzenspitze, mit kaum angehobenem Winkel — sanft.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.470, 1.440), V(0, -0.525, 1.420)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.525, 1.420), V(0.08, -0.550, 1.350), V(0.15, -0.540, 1.230), V(0.20, -0.500, 1.120)], spitzVorn: false)),
        r: 0.030, farbe: dunkel, staerke: 0.85))
    let bau = Bau(brust: 0.9, hals: 0.30, halsLaenge: 1.5, bein: 0.12, beinAbstand: 0.20, beinOben: -1.55, ruecken: 0.62, rueckenHoehe: -1.10)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        // Rehe tragen einen hellen Kehlfleck gleich unter dem Kinn, die Brust bleibt braun.
        let kehle = region(p, V(0, -0.60, 0.50), V(0.26, 0.20, 0.45), 0.4)
        return mische(farbeMitRauschen(braun, p, 0.08), farbeMitRauschen(weiss, p, 0.04), kehle * 0.9)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.360, 1.380), r: V(0.18, 0.12, 0.10), farbe: hex("#141011"))
    augenEinsetzen(w, kopf, x: 0.36, y: 0.22, r: 0.19, iris: NSColor(calibratedRed: 0.26, green: 0.14, blue: 0.08, alpha: 1), pupille: 0.55, aussen: 0.45, ausdruck: Ausdruck(oben: 0.14, unten: 0.05, schraeg: 0.26, funke: 1.5, wange: 0.40))
    w.eulerAngles = SCNVector3(0.10, 0.48, 0.04)
    return (w, 8.0, V(0, 0.15, 0.2))
}

// ---------- Dackel (Kurzhaar, rot) ----------

func dackel() -> (SCNNode, Float, V) {
    let rot = hex("#9E4E22"), dunkel = hex("#5E2C12"), hell = hex("#C47A45")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.78, 0.72, 0.80)), mitte: V(0, 0.14, -0.10)),
        // die lange Dackelschnauze, oben fast gerade
        Form(art: .rundkegel(V(0, -0.14, 1.00), 0.30, 0.15), mitte: V(0, -0.04, 0.32), weich: 0.22),
        // Unterkiefer und Lefzen: geben der Schnauze unten Masse und machen sie zum Hundemaul
        Form(art: .rundkegel(V(0, -0.02, 0.80), 0.20, 0.12), mitte: V(0, -0.28, 0.35), weich: 0.16),
        Form(art: .ellipsoid(V(0.42, 0.30, 0.34)), mitte: V(-0.42, -0.18, 0.30), weich: 0.28),
        Form(art: .ellipsoid(V(0.42, 0.30, 0.34)), mitte: V(0.42, -0.18, 0.30), weich: 0.28),
        Form(art: .ellipsoid(V(0.50, 0.22, 0.30)), mitte: V(0, 0.36, 0.42), weich: 0.25),
    ]
    // lange, weiche Haengeohren
    for sx: Float in [-1, 1] {
        // Ansatz oben am Schaedel weich, der Lappen selbst haengt frei: zwei Formen.
        formen.append(Form(art: .ellipsoid(V(0.22, 0.20, 0.14)), mitte: V(0.66 * sx, 0.42, -0.10), weich: 0.16))
        formen.append(Form(art: .ellipsoid(V(0.27, 0.58, 0.10)), mitte: V(0.84 * sx, 0.0, 0.0),
                           drehung: simd_quatf(angle: -0.16 * sx, axis: V(0, 0, 1)) * simd_quatf(angle: 0.25 * sx, axis: V(0, 1, 0)), weich: 0.05))
    }
    formen += lider(0.30, 0.20, 0.60, 0.14)
    let kopf = Koerper(formen: formen, farbe: { p, _ in
        var c = farbeMitRauschen(rot, p, 0.07)
        c = mische(c, dunkel, glatt(0.70, 0.82, abs(p.x)) * 0.75)               // Ohren dunkler
        c = mische(c, hell, region(p, V(0, -0.30, 0.95), V(0.30, 0.18, 0.40), 0.4) * 0.5)
        c *= 1 - 0.20 * glatt(1.1, 1.45, p.z)                                    // Schnauzenspitze dunkler
        return c
    }, rauheit: 0.56, fell: 0.02)
    // Dackel: deutlicher Brauenwulst, dunkler schattiert — der treuherzige Dackelblick; Kurzhaar,
    // glatt und anliegend.
    var (braue, braueM) = mitBrauen(kopf, x: 0.27, y: 0.38, laenge: 0.11, dicke: 0.065, winkel: 0.38, farbe: dunkel, staerke: 0.75)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.014, rumpf: 0.016, nase: V(0, -0.17, 1.44), schnauze: 0.7,
        augen: augenStellen(kopf, x: 0.30, y: 0.20), augenR: 0.15, braue: 0.3), braue: braueM)
    // Glattes Kurzhaar glaenzt: wenig Abstand, kaum Helligkeitsunterschied, glatte Haut darunter.
    braue.fellArt = Fell(dichte: 160, dicke: 0.5, aufrecht: 0.15, neigung: 2.0, ursprung: V(0, -0.17, 1.44), wurzel: 0.85, spitze: 1.03, straehnen: 0.05, streuung: 0.04)
    // Dackel: lange Lefzen zwischen Schnauze und Unterkiefer, geschlossen.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.26, 1.43), V(0, -0.32, 1.37)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.32, 1.37), V(0.09, -0.36, 1.24), V(0.16, -0.38, 1.04), V(0.21, -0.37, 0.82), V(0.24, -0.32, 0.70)], spitzVorn: false)),
        r: 0.032, farbe: hex("#2A120A"), staerke: 0.85))
    let bau = Bau(brust: 1.05, tiefe: 1.25, bein: 0.17, beinAbstand: 0.22, beinOben: -1.45, ruecken: 0.56, rueckenLaenge: 1.25, rueckenHoehe: -1.0)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(rot, p, 0.07), hell, latz(p, breite: 0.30) * 0.25)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.17, 1.44), r: V(0.14, 0.10, 0.10), farbe: hex("#161010"))
    augenEinsetzen(w, kopf, x: 0.30, y: 0.20, r: 0.16, iris: NSColor(calibratedRed: 0.40, green: 0.22, blue: 0.10, alpha: 1), pupille: 0.58, ausdruck: Ausdruck(oben: 0.08, unten: 0.00, schraeg: 0.38, funke: 1.7, wange: 0))
    w.eulerAngles = SCNVector3(0.06, -0.50, 0)
    return (w, 8.0, V(0, 0.10, 0.25))
}

// ---------- Golden Retriever ----------

func hund() -> (SCNNode, Float, V) {
    let gold = hex("#D6A15A"), hell = hex("#EFD3A4"), dunkel = hex("#A8743A")
    var formen: [Form] = [
        // Erwachsener Golden Retriever: breiter, flacher Schaedel, Schnauze fast so lang wie der Schaedel.
        Form(art: .ellipsoid(V(0.84, 0.72, 0.88)), mitte: V(0, 0.10, -0.08)),
        Form(art: .ellipsoid(V(0.46, 0.36, 0.40)), mitte: V(-0.40, -0.25, 0.35), weich: 0.30),
        Form(art: .ellipsoid(V(0.46, 0.36, 0.40)), mitte: V(0.40, -0.25, 0.35), weich: 0.30),
        // Schnauze: breit, tief und laenger als beim Welpen, mit deutlichem Stop zur Stirn
        Form(art: .ellipsoid(V(0.36, 0.31, 0.54)), mitte: V(0, -0.21, 1.00), weich: 0.25),
        Form(art: .ellipsoid(V(0.55, 0.22, 0.32)), mitte: V(0, 0.36, 0.50), weich: 0.25),
    ]
    // Schlappohren: haengen seitlich herab.
    for sx: Float in [-1, 1] {
        // Schlappohren: setzen oben seitlich am Schaedel an und liegen flach an der Wange.
        formen.append(Form(art: .ellipsoid(V(0.28, 0.50, 0.09)), mitte: V(0.80 * sx, 0.02, -0.02),
                           drehung: simd_quatf(angle: 0.12 * sx, axis: V(0, 0, 1)) * simd_quatf(angle: 0.55 * sx, axis: V(0, 1, 0)), weich: 0.08))
    }
    formen += lider(0.32, 0.20, 0.68, 0.14)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(gold, p, 0.08)
        c = mische(c, hell, region(p, V(0, -0.210, 1.070), V(0.40, 0.30, 0.30), 0.4) * 0.75)
        c = mische(c, dunkel, glatt(0.74, 0.86, abs(p.x)) * 0.75)   // Ohren dunkler golden
        return c
    }, rauheit: 0.78, fell: 0.08)
    // Retriever: helle, bewegliche Brauenbueschel, innen angehoben; langes, welliges Fell, das an Ohren
    // und Brust in Fahnen faellt.
    var (braue, braueM) = mitBrauen(kopf, x: 0.29, y: 0.39, laenge: 0.12, dicke: 0.06, winkel: 0.35, farbe: hex("#F6E6C6"), staerke: 0.9)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.045, rumpf: 0.12, nase: V(0, -0.060, 1.440), schnauze: 0.6,
        augen: augenStellen(kopf, x: 0.32, y: 0.20), augenR: 0.15,
        braue: 1.2, zonen: beide(V(0.82, 0.02, -0.02), V(0.32, 0.55, 0.25), 2.0) + [(V(0, -1.0, 0.6), V(0.55, 0.6, 0.5), 1.5)]), braue: braueM)
    braue.fellArt = Fell(dichte: 60, schwere: 0.9, ursprung: V(0, -0.050, 1.300), straehnen: 0.7)
    // Retriever: das offene Hundelachen — Rinne unter der Nase, Mundwinkel weit hinten und hoch, dazwischen
    // ein offenes Maul mit Zunge. Der Unterkiefer gibt dem offenen Maul unten einen Rand.
    var kiefer = braue
    kiefer.formen.append(Form(art: .ellipsoid(V(0.28, 0.13, 0.30)), mitte: V(0, -0.480, 1.120), weich: 0.18))
    let maul = mitMaul(kiefer, Maul(kurven: [Kurve(punkte: [V(0, -0.170, 1.490), V(0, -0.260, 1.470), V(0, -0.320, 1.440)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.320, 1.440), V(0.09, -0.370, 1.390), V(0.19, -0.360, 1.290), V(0.27, -0.280, 1.160)], spitzVorn: false)),
        r: 0.032, farbe: hex("#3A2414"), staerke: 0.85,
        hoehlen: [Form(art: .ellipsoid(V(0.17, 0.075, 0.16)), mitte: V(0, -0.405, 1.360), weich: 0.04)]))
    let bau = Bau(brust: 1.2, tiefe: 1.1, hals: 0.48, bein: 0.20, beinAbstand: 0.26, ruecken: 0.70)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(gold, p, 0.08), farbeMitRauschen(hell, p, 0.05), latz(p, breite: 0.38) * 0.7)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.060, 1.440), r: V(0.18, 0.12, 0.12), farbe: hex("#171112"))
    w.addChildNode(perle(V(0, -0.450, 1.340), V(0.12, 0.045, 0.13), farbe: NSColor(calibratedRed: 0.90, green: 0.45, blue: 0.50, alpha: 1), rauheit: 0.35))
    augenEinsetzen(w, kopf, x: 0.32, y: 0.20, r: 0.16, iris: NSColor(calibratedRed: 0.42, green: 0.24, blue: 0.10, alpha: 1), pupille: 0.58, ausdruck: Ausdruck(oben: 0.06, unten: 0.20, schraeg: 0.10, funke: 1.5, wange: 0.25))
    w.eulerAngles = SCNVector3(0.06, 0.18, 0.14)
    return (w, 7.6, V(0, 0.12, 0.1))
}

// ---------- Eule (Waldkauz) ----------

func eule() -> (SCNNode, Float, V) {
    let braun = hex("#8A6340"), schleier = hex("#D8BC93"), dunkel = hex("#4A3220")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.90, 1.05, 0.80)), mitte: V(0, -0.15, 0)),
        Form(art: .ellipsoid(V(0.80, 0.62, 0.70)), mitte: V(0, 0.45, 0.05), weich: 0.35),
        // Gesichtsschleier: zwei flache Schalen um die Augen.
        Form(art: .ellipsoid(V(0.34, 0.36, 0.20)), mitte: V(-0.30, 0.40, 0.55), weich: 0.15),
        Form(art: .ellipsoid(V(0.34, 0.36, 0.20)), mitte: V(0.30, 0.40, 0.55), weich: 0.15),
        // Fluegel
        Form(art: .ellipsoid(V(0.25, 0.70, 0.45)), mitte: V(-0.80, -0.30, -0.05), weich: 0.12),
        Form(art: .ellipsoid(V(0.25, 0.70, 0.45)), mitte: V(0.80, -0.30, -0.05), weich: 0.12),
    ]
    formen += ohrPaar(0.48, 0.80, -0.05, laenge: V(0.14, 0.32, -0.05), r1: 0.16, r2: 0.04, flach: 0.5, muschel: 0)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(braun, p, 0.10)
        let z = zellen(p, 6)
        c *= 0.85 + 0.3 * z.wert                                   // Federn: jede etwas anders
        c = mische(c, dunkel, glatt(0.03, 0.0, z.rand) * 0.35)      // Federsaum
        // Schleier und heller Bauch
        let s1 = region(p, V(-0.30, 0.40, 0.62), V(0.36, 0.38, 0.30), 0.25)
        let s2 = region(p, V(0.30, 0.40, 0.62), V(0.36, 0.38, 0.30), 0.25)
        c = mische(c, farbeMitRauschen(schleier, p, 0.05), max(s1, s2))
        c = mische(c, mische(schleier, braun, 0.3), glatt(0.10, -0.25, p.y) * glatt(0.2, 0.6, n.z) * 0.8)
        return c
    }, rauheit: 0.82, fell: 0.06)
    // Eule (Waldkauz): die hellen Brauen ziehen von aussen ueber den Augen nach innen unten zum Schnabel
    // und bilden ein "V". Federn statt Fell: kurz, in Buescheln.
    var (braue, braueM) = mitBrauen(kopf, x: 0.21, y: 0.65, laenge: 0.15, dicke: 0.05, winkel: -0.45, farbe: hex("#F7F1E6"), staerke: 0.95, wulst: 0.5)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.05, rumpf: 0.05, nase: V(0, 0.28, 0.82), schnauze: 0.3,
        augen: augenStellen(kopf, x: 0.30, y: 0.42), augenR: 0.19, braue: 0.4,
        zonen: beide(V(0.30, 0.40, 0.55), V(0.34, 0.36, 0.25), 0.6)), braue: braueM)
    braue.fellArt = Fell(dichte: 55, aufrecht: 0.3, neigung: 1.4, ursprung: V(0, 0.4, 0.9), straehnen: 0.8)
    let w = SCNNode(); w.addChildNode(kopfKnoten(braue, grenze: 1.9))
    // Schnabel: klein, gebogen, zwischen den Augen.
    nase(w, [Form(art: .rundkegel(V(0, -0.20, 0.10), 0.09, 0.02), mitte: V(0, 0.28, 0.82))], farbe: hex("#3B3330"), lack: 0.3, rauheit: 0.45)
    // Waldkauz: dunkle, fast schwarze Augen — gelbe haben Uhu und Steinkauz.
    augenEinsetzen(w, kopf, x: 0.30, y: 0.42, r: 0.20, tiefe: 0.35, iris: NSColor(calibratedRed: 0.20, green: 0.11, blue: 0.06, alpha: 1), pupille: 0.62, aussen: 0.1, ausdruck: Ausdruck(oben: 0.06, unten: 0.12, schraeg: 0.08, funke: 1.5, wange: 0.30, zwinkern: true))
    vogelFuesse(w, unten: -1.08, abstand: 0.28, vorn: 0.30, farbe: hex("#B08A60"), dicke: 0.10, bein: 0.10, zehe: 0.20, kralle: hex("#2E2622"))
    w.eulerAngles = SCNVector3(0.02, -0.12, -0.16)
    return (w, 8.2, V(0, 0.05, 0))
}

// ---------- Wal ----------

func wal() -> (SCNNode, Float, V) {
    // Nach dem Buckelwal: flacher, breiter Kopf mit Hoeckerchen, lange helle Brustflossen, kleine
    // Rueckenfinne, waagerechte Fluke, Kehlfurchen. Matte, fein marmorierte Haut statt Plastik.
    let blau = hex("#2E3944"), bauch = hex("#DDE1E3"), flosseHell = hex("#ECEFEF")
    var formen: [Form] = [
        Form(art: .rundkegel(V(-2.0, 0.30, 0), 0.68, 0.14), mitte: V(0.75, -0.1, 0), stauchung: V(1, 0.82, 1)),
        Form(art: .ellipsoid(V(0.85, 0.52, 0.62)), mitte: V(0.58, -0.16, 0), weich: 0.4),
        // Rueckenfinne: klein, weit hinten.
        Form(art: .rundkegel(V(-0.22, 0.17, 0), 0.10, 0.025), mitte: V(-0.55, 0.36, 0), stauchung: V(1, 1, 0.35), weich: 0.08),
    ]
    let flossen: [Form] = [-1, 1].flatMap { (s: Float) -> [Form] in [
        // Fluke: waagerecht, nach hinten gepfeilt.
        Form(art: .ellipsoid(V(0.20, 0.045, 0.46)), mitte: V(-1.40, 0.22, 0.34 * s),
             drehung: simd_quatf(angle: 0.55 * s, axis: V(0, 1, 0)), weich: 0.10),
        // Brustflosse: lang und schmal, an der Flanke angesetzt, nach hinten unten aussen.
        Form(art: .rundkegel(V(-0.62, -0.42, 0.50 * s), 0.13, 0.04), mitte: V(0.48, -0.40, 0.40 * s), stauchung: V(1, 0.4, 1), weich: 0.10),
    ]}
    formen += flossen
    // Die Hoeckerchen auf dem Kopf, das Kennzeichen des Buckelwals.
    let hoecker: [V] = [V(1.20, 0.05, 0.10), V(1.08, 0.13, 0.17), V(0.95, 0.21, 0.12), V(1.12, 0.10, 0), V(0.82, 0.27, 0.18)]
    for h in hoecker { for s: Float in [-1, 1] where !(h.z == 0 && s < 0) {
        formen.append(Form(art: .ellipsoid(V(0.04, 0.03, 0.04)), mitte: V(h.x, h.y, h.z * s), weich: 0.03))
    }}
    let walKoerper = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(blau, p, 0.05)
        // feine Marmorierung: kleine helle und dunkle Sprenkel, keine grossen Kleckse
        c *= 0.88 + 0.24 * fbm(p * 9)
        c = mische(c, mische(blau, bauch, 0.5), glatt(0.66, 0.74, fbm(p * 14 + V(3, 1, 7))) * 0.5)
        // heller Bauch mit Kehlfurchen, die vom Kinn nach hinten laufen
        let unten = glatt(-0.10, -0.38, p.y + 0.10 * p.x) * glatt(-0.4, 0.4, p.x)
        let winkel = atan2f(p.z, -(p.y + 0.1))
        let furche = 1 - 0.45 * glatt(0.80, 0.97, sinf(winkel * 30) * 0.5 + 0.5)
        c = mische(c, bauch * furche, unten)
        // Brustflossen und Flukenunterseite hell
        let dFlosse = flossen.map { $0.abstand(p) }.min() ?? 1
        let flosse = glatt(0.06, 0.0, dFlosse) * glatt(-1.0, -0.2, p.x + 0.0 * n.y)
        c = mische(c, farbeMitRauschen(flosseHell, p, 0.06), flosse * 0.85)
        return c
    }, rauheit: 0.66, fell: 0.05, lack: 0.14)
    // Wal: die lange, nach hinten ansteigende Maullinie unter dem Auge — das Walgrinsen.
    let koerper = mitMaul(walKoerper, Maul(kurven: [Kurve(punkte: [V(1.30, -0.32, 0.25), V(1.37, -0.27, 0), V(1.30, -0.32, -0.25)], spitzVorn: false, spitzHinten: false)]
        + paar(Kurve(punkte: [V(1.30, -0.32, 0.25), V(1.14, -0.34, 0.42), V(0.94, -0.30, 0.52), V(0.76, -0.18, 0.56)], spitzVorn: false), achse: 2),
        r: 0.030, farbe: hex("#1A2C40"), staerke: 0.8))
    let w = SCNNode(); w.addChildNode(kopfKnoten(koerper, grenze: 2.2, n: 200))
    for sz: Float in [-1, 1] {
        // Weiter vorn und groesser als beim echten Wal: Nur ein Auge, dessen Oeffnung zum Betrachter zeigt,
        // liest sich als Blick zu ihm (Auftrag des Inhabers: alle sehen einen an).
        seitenAuge(w, koerper, x: 1.04, y: 0.0, tiefe: 0.04, sz: sz, r: 0.115,
                   iris: NSColor(calibratedRed: 0.14, green: 0.11, blue: 0.10, alpha: 1), pupille: 0.7,
                   Ausdruck(oben: 0.22, unten: 0.15, funke: 1.5))
    }
    w.eulerAngles = SCNVector3(-0.15, .pi + 1.0, 0)
    return (w, 9.0, V(-0.25, 0.0, 0))
}

// ---------- Goldfisch ----------

func goldfisch() -> (SCNNode, Float, V) {
    let orange = hex("#EE7A1F"), gelb = hex("#F6C35A"), flosse = hex("#F3A04A")
    let formen: [Form] = [
        // Gewoehnlicher Goldfisch: laenglich und seitlich flach, keine Zuchtkugel.
        Form(art: .ellipsoid(V(1.10, 0.58, 0.32)), mitte: V(0.05, 0, 0)),
        Form(art: .ellipsoid(V(0.42, 0.40, 0.29)), mitte: V(0.72, -0.02, 0), weich: 0.3),
        // Schwanzflosse (zweilappig, gefaechert)
        Form(art: .ellipsoid(V(0.62, 0.22, 0.04)), mitte: V(-1.25, 0.30, 0), drehung: simd_quatf(angle: 0.55, axis: V(0, 0, 1)), weich: 0.15),
        Form(art: .ellipsoid(V(0.62, 0.22, 0.04)), mitte: V(-1.25, -0.30, 0), drehung: simd_quatf(angle: -0.55, axis: V(0, 0, 1)), weich: 0.15),
        // Rueckenflosse, Bauchflossen
        Form(art: .ellipsoid(V(0.50, 0.36, 0.04)), mitte: V(-0.05, 0.66, 0), drehung: simd_quatf(angle: -0.35, axis: V(0, 0, 1)), weich: 0.12),
        Form(art: .ellipsoid(V(0.25, 0.14, 0.04)), mitte: V(0.20, -0.58, 0.14), drehung: simd_quatf(angle: 0.6, axis: V(0, 0, 1)), weich: 0.1),
        // Brustflosse
        Form(art: .ellipsoid(V(0.22, 0.12, 0.04)), mitte: V(0.45, -0.25, 0.30), drehung: simd_quatf(angle: 0.4, axis: V(0, 1, 0)), weich: 0.08),
    ]
    // Goldfisch: ein rundes, offenes "o" aus wulstigen Lippen vorn am Kopf.
    let lippe = Form(art: .ellipsoid(V(0.12, 0.13, 0.15)), mitte: V(1.08, -0.12, 0), weich: 0.10)
    let fischKoerper = Koerper(formen: formen + [lippe], farbe: { p, n in
        var c = farbeMitRauschen(orange, p, 0.06)
        c = mische(c, hex("#E8603A"), glatt(0.06, 0, lippe.abstand(p)) * 0.6)
        // Schuppen dachziegelartig in versetzten Reihen, der Kopf ist schuppenlos. Jede Schuppe ist vorn
        // (zum Kopf) von der vorigen verdeckt und am Hinterrand hell und glaenzend.
        let su = p.x * 6.5, spalte = (su).rounded(.down)
        let sv = p.y * 6.5 + (Int(spalte) & 1 == 0 ? 0 : 0.5)
        let fu = su - spalte, fv = sv - sv.rounded(.down) - 0.5
        let bogen = sqrtf(fu * fu * 1.6 + fv * fv * 2.2)
        let rand = glatt(0.62, 0.82, bogen) * glatt(1.02, 0.86, bogen)
        let schuppig = glatt(0.62, 0.40, p.x) * glatt(0.85, 0.40, abs(p.y))
        c *= 1 - 0.22 * glatt(0.8, 0.2, bogen) * schuppig                                  // Schuppenmitte dunkler
        c = mische(c, mische(gelb, V(1, 0.96, 0.88), 0.35), rand * 0.6 * schuppig)          // glaenzender Rand
        c = mische(c, gelb, glatt(-0.2, -0.6, p.y) * 0.6)                                   // heller Bauch
        // Flossen: heller, zum Rand hin fast durchscheinend hell
        let flossen = max(glatt(-0.75, -0.95, p.x), max(glatt(0.62, 0.75, p.y), glatt(-0.58, -0.68, p.y)))
        c = mische(c, flosse * (0.9 + 0.2 * (sinf(atan2f(p.y, p.x + 1) * 30) * 0.5 + 0.5)), flossen)
        return c
    }, rauheit: 0.4, fell: 0.02, lack: 0.85)
    let koerper = mitMaul(fischKoerper, Maul(kurven: [], farbe: orange,
        hoehlen: [Form(art: .ellipsoid(V(0.07, 0.07, 0.09)), mitte: V(1.23, -0.12, 0), weich: 0.03)], innen: hex("#5A1E14")))
    let w = SCNNode(); w.addChildNode(kopfKnoten(koerper, grenze: 1.8, n: 170))
    for sz: Float in [-1, 1] {
        // Staunend: weit offen, grosser Lichtpunkt, Blick nach oben.
        seitenAuge(w, koerper, x: 0.82, y: 0.12, tiefe: 0.06, sz: sz, r: 0.14,
                   iris: NSColor(calibratedRed: 0.85, green: 0.62, blue: 0.20, alpha: 1), pupille: 0.62,
                   Ausdruck(oben: 0.08, unten: 0.00, schraeg: 0.1, funke: 1.7))
    }
    w.eulerAngles = SCNVector3(0.05, -0.68, 0.05)
    return (w, 8.0, V(-0.05, 0.05, 0))
}

// ---------- Meeresschildkroete ----------

func schildkroete() -> (SCNNode, Float, V) {
    // Nach der Suppenschildkroete: Panzer nach hinten spitzer mit Kiel; Platten an ihren echten Stellen
    // (5 Wirbel-, je 4 Rippen-, ein Kranz Randplatten), strahlig gemasert mit hellen Fugen. Kopf laenglich
    // mit Schnabel und grossen, hell umrandeten Platten; Flossen oben dunkel geschuppt, unten hell.
    let horn = hex("#6E4F27"), bernstein = hex("#A47A3A"), strahl = hex("#D2AA62"), fugeHell = hex("#D9C690")
    let hautDunkel = hex("#5A4628"), saum = hex("#E2D4A2"), unterseite = hex("#E6DCBA")
    var keime: [V] = []
    for x: Float in [0.72, 0.34, -0.06, -0.46, -0.82] { keime.append(V(x, 0, 0)) }
    for x: Float in [0.52, 0.14, -0.26, -0.64] { for s: Float in [-1, 1] { keime.append(V(x, 0, 0.47 * s)) } }
    for i in 0..<24 { let t = Float(i) / 24 * 2 * .pi; keime.append(V(cosf(t) * 1.0 - 0.06, 0, sinf(t) * 0.84)) }
    let panzerK = Koerper(formen: [
        Form(art: .ellipsoid(V(0.98, 0.46, 0.84)), mitte: V(0.0, 0.05, 0)),
        Form(art: .ellipsoid(V(0.70, 0.34, 0.52)), mitte: V(-0.55, 0.02, 0), weich: 0.35),
        Form(art: .ellipsoid(V(1.04, 0.16, 0.88)), mitte: V(-0.05, -0.18, 0), weich: 0.1),
        Form(art: .rundkegel(V(-1.3, -0.08, 0), 0.07, 0.04), mitte: V(0.65, 0.44, 0), weich: 0.25),
    ], farbe: { p, _ in
        // Naechste und zweitnaechste Platte in der Draufsicht: die Fuge liegt dazwischen.
        let q = V(p.x, 0, p.z)
        var d1: Float = 9, d2: Float = 9, k = keime[0], nr = 0
        for (i, m) in keime.enumerated() {
            let d = simd_length(q - m)
            if d < d1 { d2 = d1; d1 = d; k = m; nr = i } else if d < d2 { d2 = d }
        }
        let zufall = hash3(SIMD3<Int32>(Int32(nr), 3, 7))
        var c = mische(horn, bernstein, 0.3 + 0.5 * zufall)
        let w = atan2f(p.z - k.z, p.x - k.x)
        let strahlen = glatt(0.50, 0.95, sinf(w * 7 + fbm(p * 4) * 4) * 0.5 + 0.5) * glatt(0.02, 0.18, d1)
        c = mische(c, strahl, strahlen * 0.75)
        c = mische(c, hex("#3A2814"), glatt(0.10, 0.0, d1) * 0.35)                   // dunkler Kern
        c *= 0.92 + 0.16 * fbm(p * 7)
        c = mische(c, fugeHell, glatt(0.018, 0.0, d2 - d1) * 0.7)                    // helle Fugen
        c = mische(c, unterseite, glatt(-0.14, -0.28, p.y))                          // Bauchpanzer
        return c
    }, rauheit: 0.45, fell: 0.02, lack: 0.5)
    let flossen: [Form] = [-1, 1].flatMap { (s: Float) -> [Form] in [
        Form(art: .rundkegel(V(-0.40, -0.10, 0.70 * s), 0.19, 0.06), mitte: V(0.62, -0.18, 0.66 * s), stauchung: V(1, 0.32, 1), weich: 0.08),
        Form(art: .rundkegel(V(-0.45, -0.04, 0.17 * s), 0.06, 0.02), mitte: V(0.22, -0.28, 1.36 * s), stauchung: V(1, 0.4, 1), weich: 0.08),
        Form(art: .rundkegel(V(-0.30, -0.05, 0.25 * s), 0.14, 0.05), mitte: V(-0.80, -0.18, 0.45 * s), stauchung: V(1, 0.32, 1), weich: 0.08),
    ]}
    let hautRoh = Koerper(formen: [
        Form(art: .ellipsoid(V(0.46, 0.34, 0.33)), mitte: V(1.30, 0.12, 0)),                       // Kopf
        Form(art: .rundkegel(V(0.42, -0.08, 0), 0.27, 0.15), mitte: V(1.30, 0.08, 0), weich: 0.18), // Schnabel
        Form(art: .rundkegel(V(-0.5, -0.08, 0), 0.21, 0.26), mitte: V(1.05, 0.04, 0), weich: 0.15), // Hals
    ] + flossen, farbe: { p, n in
        // Kopf: grosse Platten; Hals und Flossen: kleinere Schuppen. Hell umrandet, unten hell.
        let kopf = glatt(0.95, 1.10, p.x)
        let z = zellen(p, 5 + 5 * (1 - kopf))
        var c = mische(saum, mische(hautDunkel, horn, z.wert), glatt(0.0, 0.03, z.rand))
        c = mische(c, unterseite, glatt(0.0, -0.6, n.y) * 0.85)
        return c
    }, rauheit: 0.6, fell: 0.03, lack: 0.4)
    // Schildkroete: die Hornkante des Schnabels als breites, gemuetliches Laecheln unter den Augen.
    let hautK = mitMaul(hautRoh, Maul(kurven: [Kurve(punkte: [V(1.74, -0.07, 0.14), V(1.86, -0.05, 0), V(1.74, -0.07, -0.14)], spitzVorn: false, spitzHinten: false)]
        + paar(Kurve(punkte: [V(1.74, -0.07, 0.14), V(1.58, -0.03, 0.24), V(1.44, 0.04, 0.30), V(1.34, 0.10, 0.32)], spitzVorn: false), achse: 2),
        r: 0.026, farbe: hex("#2E2214"), staerke: 0.85))
    let w = SCNNode()
    w.addChildNode(kopfKnoten(panzerK, grenze: 2.0, n: 200))
    w.addChildNode(kopfKnoten(hautK, grenze: 2.0, n: 200))
    for sz: Float in [-1, 1] {
        seitenAuge(w, hautK, x: 1.52, y: 0.21, tiefe: 0.05, sz: sz, r: 0.14,
                   iris: NSColor(calibratedRed: 0.36, green: 0.26, blue: 0.10, alpha: 1), pupille: 0.6,
                   Ausdruck(oben: 0.24, unten: 0.13, schraeg: 0.14, funke: 1.5))
    }
    w.eulerAngles = SCNVector3(-0.35, .pi + 1.05, 0)
    return (w, 9.2, V(0.05, 0.0, 0))
}

// ---------- Runde 160: zwei Meerestiere, vier Voegel (Auftrag des Inhabers) ----------

func delfin() -> (SCNNode, Float, V) {
    // Grosser Tuemmler: Melone auf der Stirn, kurzer Schnabel, hohe sichelfoermige Rueckenfinne,
    // oben grau, unten hell — und das Laecheln, das die Maullinie von selbst macht.
    let grau = hex("#6C7B87"), bauch = hex("#DCE1E4")
    var formen: [Form] = [
        Form(art: .rundkegel(V(-2.0, 0.28, 0), 0.56, 0.12), mitte: V(0.70, -0.10, 0), stauchung: V(1, 0.86, 1)),
        Form(art: .ellipsoid(V(0.58, 0.46, 0.48)), mitte: V(0.78, 0.02, 0), weich: 0.38),
        Form(art: .rundkegel(V(0.46, -0.05, 0), 0.15, 0.10), mitte: V(1.16, -0.20, 0), weich: 0.16),
        Form(art: .rundkegel(V(-0.34, 0.46, 0), 0.17, 0.03), mitte: V(-0.32, 0.34, 0), stauchung: V(1, 1, 0.32), weich: 0.09),
    ]
    let flossen: [Form] = [-1, 1].flatMap { (s: Float) -> [Form] in [
        Form(art: .ellipsoid(V(0.17, 0.04, 0.36)), mitte: V(-1.36, 0.22, 0.26 * s),
             drehung: simd_quatf(angle: 0.6 * s, axis: V(0, 1, 0)), weich: 0.10),
        Form(art: .rundkegel(V(-0.36, -0.30, 0.34 * s), 0.11, 0.035), mitte: V(0.42, -0.36, 0.32 * s), stauchung: V(1, 0.42, 1), weich: 0.10),
    ]}
    formen += flossen
    let k = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(grau, p, 0.05)
        c *= 0.92 + 0.16 * fbm(p * 7)
        // Gegenschattierung: nach unten heller, mit weichem Uebergang an der Flanke
        c = mische(c, farbeMitRauschen(bauch, p, 0.04), glatt(-0.02, -0.30, p.y + 0.06 * p.x))
        c = mische(c, mische(grau, bauch, 0.4), glatt(0.10, 0.0, abs(p.z) - 0.30) * 0.25)
        return c
    }, rauheit: 0.55, fell: 0.03, lack: 0.22)
    let mitLaecheln = mitMaul(k, Maul(kurven: [Kurve(punkte: [V(1.60, -0.25, 0.08), V(1.63, -0.24, 0), V(1.60, -0.25, -0.08)], spitzVorn: false, spitzHinten: false)]
        + paar(Kurve(punkte: [V(1.60, -0.25, 0.08), V(1.44, -0.26, 0.15), V(1.26, -0.24, 0.20), V(1.08, -0.16, 0.25), V(0.98, -0.08, 0.28)], spitzVorn: false), achse: 2),
        r: 0.026, farbe: hex("#3A4650"), staerke: 0.75))
    let w = SCNNode(); w.addChildNode(kopfKnoten(mitLaecheln, grenze: 2.2, n: 200))
    for sz: Float in [-1, 1] {
        seitenAuge(w, mitLaecheln, x: 0.98, y: 0.02, tiefe: 0.04, sz: sz, r: 0.105,
                   iris: NSColor(calibratedRed: 0.16, green: 0.12, blue: 0.10, alpha: 1), pupille: 0.7,
                   Ausdruck(oben: 0.16, unten: 0.16, funke: 1.6))
    }
    w.eulerAngles = SCNVector3(-0.12, .pi + 1.0, 0)
    return (w, 9.0, V(-0.20, 0.0, 0))
}

func seeotter() -> (SCNNode, Float, V) {
    // Seeotter: runder Kopf, im Alter hell; breite, puschelige Schnurrhaarpolster (Flaechen, keine
    // Striche — Lehre aus drei Versuchen), kleine Ohren tief an der Seite, dichtes kurzes Fell.
    let braun = hex("#5B3B27"), kopfHell = hex("#CBB497"), polster = hex("#E3D3BD")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.92, 0.80, 0.84)), mitte: V(0, 0.08, 0)),
        Form(art: .ellipsoid(V(0.27, 0.21, 0.23)), mitte: V(-0.21, -0.26, 0.80), weich: 0.18),
        Form(art: .ellipsoid(V(0.27, 0.21, 0.23)), mitte: V(0.21, -0.26, 0.80), weich: 0.18),
        Form(art: .ellipsoid(V(0.20, 0.15, 0.18)), mitte: V(0, -0.38, 0.74), weich: 0.16),
    ]
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.14, 0.12, 0.08)), mitte: V(0.76 * sx, 0.36, -0.08), weich: 0.10))
    }
    formen += lider(0.33, 0.20, 0.70, 0.12)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(kopfHell, p, 0.07)
        // nach hinten und unten das dunkle Koerperfell
        c = mische(c, farbeMitRauschen(braun, p, 0.08), glatt(-0.10, -0.55, p.z) * 0.8 + glatt(-0.35, -0.75, p.y) * 0.6)
        let pol = max(region(p, V(-0.21, -0.26, 0.98), V(0.27, 0.21, 0.24), 0.3), region(p, V(0.21, -0.26, 0.98), V(0.27, 0.21, 0.24), 0.3))
        c = mische(c, farbeMitRauschen(polster, p, 0.04), pol)
        return c
    }, rauheit: 0.80, fell: 0.07)
    var (braue, braueM) = mitBrauen(kopf, x: 0.30, y: 0.38, laenge: 0.11, dicke: 0.05, winkel: 0.20, farbe: mische(kopfHell, polster, 0.5), staerke: 0.6)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.06, rumpf: 0.09, nase: V(0, -0.12, 1.02), schnauze: 0.35,
        augen: augenStellen(kopf, x: 0.33, y: 0.20), augenR: 0.12,
        zonen: beide(V(0.21, -0.26, 0.85), V(0.27, 0.21, 0.23), 0.8)), braue: braueM)
    braue.fellArt = Fell(dichte: 75, ursprung: V(0, -0.12, 1.10), straehnen: 0.4)
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.24, 1.03), V(0, -0.33, 1.00), V(0, -0.40, 0.95)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.40, 0.95), V(0.07, -0.44, 0.92), V(0.15, -0.42, 0.86)], spitzVorn: false)),
        r: 0.028, farbe: hex("#2B1C14"), staerke: 0.8))
    let bau = Bau(brust: 1.30, tiefe: 1.0, hals: 0.62, bein: 0.24, beinAbstand: 0.30, ruecken: 0.8, rueckenHoehe: -0.85)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(braun, p, 0.08), farbeMitRauschen(kopfHell, p, 0.06), latz(p, breite: 0.30) * 0.35)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.12, 1.02), r: V(0.16, 0.11, 0.10), farbe: hex("#1A1310"))
    augenEinsetzen(w, kopf, x: 0.33, y: 0.20, r: 0.13, iris: NSColor(calibratedRed: 0.12, green: 0.08, blue: 0.06, alpha: 1), pupille: 0.7, ausdruck: Ausdruck(oben: 0.08, unten: 0.04, schraeg: 0.15, funke: 1.7))
    w.eulerAngles = SCNVector3(0.04, 0.20, -0.05)
    return (w, 7.3, V(0, 0.15, 0))
}

// Gemeinsamer Vogelrumpf: Kopf, der in einen runden Leib uebergeht, Fluegel an den Seiten.
// Vogelfuesse (Runde 163, Auftrag des Inhabers): kurzes Bein unter dem Bauch, drei Zehen nach vorn —
// weiche, abgeflachte Flaechen statt duenner Striche (Lehre: Striche mit runden Enden wirken auf
// Avatargroesse fremd). `breit` = Schwimmhaut (Pinguin), `kralle` = dunkle Spitzen (Eule).
func vogelFuesse(_ w: SCNNode, unten: Float, abstand: Float, vorn: Float, farbe: V, dicke: Float = 0.08,
                 bein: Float = 0.16, zehe: Float = 0.20, breit: Bool = false, kralle: V? = nil) {
    for s: Float in [-1, 1] {
        let x = abstand * s, fuss = V(x, unten - bein, vorn + 0.04)
        var formen: [Form] = [Form(art: .rundkegel(V(0, -bein, 0.04), dicke, dicke * 0.9), mitte: V(x, unten, vorn), weich: 0.05)]
        if breit {
            formen.append(Form(art: .ellipsoid(V(zehe * 0.75, 0.035, zehe * 0.70)), mitte: fuss + V(0, -0.01, zehe * 0.45), weich: 0.05))
        } else {
            for (dx, lang) in [(Float(-0.075), Float(0.85)), (0, 1), (0.075, 0.85)] {
                formen.append(Form(art: .ellipsoid(V(dicke * 0.55, dicke * 0.38, zehe * 0.5 * lang)),
                                   mitte: fuss + V(dx, -0.01, zehe * 0.45 * lang), drehung: simd_quatf(angle: dx * 2.2, axis: V(0, 1, 0)), weich: 0.04))
            }
        }
        nase(w, formen, farbe: farbe, lack: 0.2, rauheit: 0.55)
        if let k = kralle {
            for dx: Float in [-0.075, 0, 0.075] {
                nase(w, [Form(art: .ellipsoid(V(0.022, 0.018, 0.035)), mitte: fuss + V(dx * 1.3, -0.02, zehe * 0.92))], farbe: k, lack: 0.5, rauheit: 0.3)
            }
        }
    }
}

func vogelFormen(kopf: V = V(0.72, 0.64, 0.68), leib: V = V(0.88, 1.05, 0.80), fluegel: Bool = true) -> [Form] {
    var f: [Form] = [
        Form(art: .ellipsoid(leib), mitte: V(0, -0.30, 0)),
        Form(art: .ellipsoid(kopf), mitte: V(0, 0.46, 0.06), weich: 0.38),
    ]
    if fluegel { for s: Float in [-1, 1] {
        f.append(Form(art: .ellipsoid(V(0.22, 0.66, 0.42)), mitte: V(0.78 * s, -0.40, -0.08), weich: 0.12))
    }}
    return f
}

func pinguin() -> (SCNNode, Float, V) {
    // Eselspinguin: schwarzer Kopf, ein weisses Band ueber den Augen, orangeroter Schnabel, weisser Bauch.
    let schwarz = hex("#1E2126"), weiss = hex("#F1F1EE"), orange = hex("#E2552A")
    var formen = vogelFormen(kopf: V(0.70, 0.62, 0.66), leib: V(0.86, 1.10, 0.78))
    formen.append(Form(art: .ellipsoid(V(0.16, 0.62, 0.10)), mitte: V(-0.84, -0.42, 0.05), weich: 0.10))
    formen.append(Form(art: .ellipsoid(V(0.16, 0.62, 0.10)), mitte: V(0.84, -0.42, 0.05), weich: 0.10))
    let k = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(schwarz, p, 0.06)
        // weisser Bauch vorn, unterhalb des Kopfes
        c = mische(c, farbeMitRauschen(weiss, p, 0.03), glatt(0.05, -0.12, p.y) * glatt(0.0, 0.5, n.z) * glatt(0.75, 0.45, abs(p.x)))
        // Eselspinguin: ein schmales weisses Band ueber dem Scheitel, das hinter den Augen schraeg nach
        // unten auslaeuft — keine Flecken vorn auf dem Gesicht (die lasen sich als Brille).
        let bandMitte = 0.80 - 0.45 * p.x * p.x
        let band = glatt(0.13, 0.06, abs(p.y - bandMitte)) * glatt(0.60, 0.44, p.z) * glatt(0.52, 0.60, p.y)
        c = mische(c, weiss, band)
        return c
    }, rauheit: 0.70, fell: 0.03)
    let w = SCNNode(); w.addChildNode(kopfKnoten(k, grenze: 1.9))
    nase(w, [Form(art: .rundkegel(V(0, -0.12, 0.46), 0.16, 0.03), mitte: V(0, 0.32, 0.58), stauchung: V(1, 0.72, 1))], farbe: orange, lack: 0.4, rauheit: 0.4)
    augenEinsetzen(w, k, x: 0.33, y: 0.48, r: 0.15, tiefe: 0.38, iris: NSColor(calibratedRed: 0.22, green: 0.12, blue: 0.06, alpha: 1), pupille: 0.62, aussen: 0.15, ausdruck: Ausdruck(oben: 0.05, unten: 0.08, funke: 1.6))
    vogelFuesse(w, unten: -1.28, abstand: 0.30, vorn: 0.28, farbe: hex("#E89A7A"), dicke: 0.09, bein: 0.08, zehe: 0.30, breit: true)
    w.eulerAngles = SCNVector3(0.02, 0.36, 0.06)
    return (w, 8.2, V(0, 0.05, 0))
}

func papagei() -> (SCNNode, Float, V) {
    // Hellroter Ara: rot, nackte helle Gesichtshaut um die Augen, grosser Hakenschnabel — oben elfenbein,
    // unten dunkel; an den Fluegeln Gelb und Blau.
    let rot = hex("#C8261D"), haut = hex("#F3ECE6"), gelb = hex("#E8B53A"), blau = hex("#2E5DAE")
    let formen = vogelFormen(kopf: V(0.68, 0.66, 0.66), leib: V(0.80, 1.00, 0.76))
    let k = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(rot, p, 0.07)
        c *= 0.9 + 0.2 * zellen(p, 7).wert
        let gesicht = max(region(p, V(-0.30, 0.42, 0.55), V(0.30, 0.26, 0.30), 0.3), region(p, V(0.30, 0.42, 0.55), V(0.30, 0.26, 0.30), 0.3))
        c = mische(c, farbeMitRauschen(haut, p, 0.03), gesicht)
        let fl = glatt(0.55, 0.75, abs(p.x)) * glatt(-0.10, -0.45, p.y)
        c = mische(c, mische(gelb, blau, glatt(-0.45, -0.80, p.y)), fl * 0.9)
        return c
    }, rauheit: 0.72, fell: 0.04)
    let w = SCNNode(); w.addChildNode(kopfKnoten(k, grenze: 1.9))
    // Oberschnabel: kraeftiger Bogen nach unten; Unterschnabel: dunkel, darunter.
    nase(w, [Form(art: .rundkegel(V(0, -0.36, 0.20), 0.20, 0.03), mitte: V(0, 0.24, 0.62), stauchung: V(0.85, 1, 1), weich: 0.08),
             Form(art: .ellipsoid(V(0.16, 0.12, 0.16)), mitte: V(0, 0.20, 0.66), weich: 0.08)], farbe: hex("#EDE3D2"), lack: 0.5, rauheit: 0.35)
    nase(w, [Form(art: .ellipsoid(V(0.13, 0.09, 0.13)), mitte: V(0, -0.02, 0.58), weich: 0.06)], farbe: hex("#2A2422"), lack: 0.4, rauheit: 0.4)
    augenEinsetzen(w, k, x: 0.32, y: 0.48, r: 0.13, tiefe: 0.36, iris: NSColor(calibratedRed: 0.85, green: 0.78, blue: 0.45, alpha: 1), pupille: 0.42, aussen: 0.15, ausdruck: Ausdruck(oben: 0.06, unten: 0.06, funke: 1.5))
    vogelFuesse(w, unten: -1.18, abstand: 0.26, vorn: 0.30, farbe: hex("#77706C"), dicke: 0.08, bein: 0.14, zehe: 0.20, kralle: hex("#3A3432"))
    w.eulerAngles = SCNVector3(0.0, -0.18, -0.06)
    return (w, 8.2, V(0, 0.05, 0))
}

func flamingo() -> (SCNNode, Float, V) {
    // Flamingo als Brustbild: Kopf, S-foermiger Hals, Leib mit kraeftigeren Fluegeldecken und schwarzen
    // Schwungfedern. Der Schnabel knickt in der Mitte nach unten, hell am Ansatz, schwarz an der Spitze.
    // Keine Beine: auf Avatargroesse waeren es Striche.
    let rosa = hex("#EC8FA4"), hell = hex("#F7CDD5"), koralle = hex("#D9486C"), schwarz = hex("#231C1E")
    let kopf = Koerper(formen: [
        Form(art: .ellipsoid(V(0.58, 0.52, 0.62)), mitte: V(0, 0.47, 0.02)),
            ], farbe: { p, n in
        var c = farbeMitRauschen(rosa, p, 0.06)
        c = mische(c, hell, glatt(0.35, 0.85, p.y) * 0.45)
        return c
    }, rauheit: 0.74, fell: 0.03)
    let leib: [Form] = [
        Form(art: .ellipsoid(V(0.66, 0.56, 1.20)), mitte: V(0, -1.80, -1.05), weich: 0.35),
        Form(art: .ellipsoid(V(0.34, 0.20, 0.55)), mitte: V(0, -1.55, -2.25), weich: 0.25),
        Form(art: .ellipsoid(V(0.22, 0.42, 1.02)), mitte: V(-0.52, -1.58, -1.20), weich: 0.16),
        Form(art: .ellipsoid(V(0.22, 0.42, 1.02)), mitte: V(0.52, -1.58, -1.20), weich: 0.16),
    ]
    // Hals als S-Kurve (kubische Bezier) aus kurzen Stuecken, sonst knickt er an den Stoessen.
    let h0 = V(0, 0.28, -0.10), h1 = V(0, -0.30, -1.30), h2 = V(0, -0.95, 0.85), h3 = V(0, -1.45, -0.55)
    func hals(_ s: Float) -> V { let u = 1 - s; return u*u*u*h0 + 3*u*u*s*h1 + 3*u*s*s*h2 + s*s*s*h3 }
    var halsFormen: [Form] = []
    for i in 0..<12 {
        let a = Float(i) / 12, b = Float(i + 1) / 12
        halsFormen.append(Form(art: .rundkegel(hals(b) - hals(a), 0.15 + 0.08 * a * a, 0.15 + 0.08 * b * b), mitte: hals(a), weich: 0.22))
    }
    let k = brustbild(kopf, halsFormen + leib, farbe: { p, n in
        var c = farbeMitRauschen(rosa, p, 0.07)
        c *= 0.94 + 0.12 * zellen(p, 7).wert
        // Fluegeldecken kraeftiger, die Schwungfedern hinten schwarz.
        let fluegel = glatt(0.36, 0.58, abs(p.x)) * glatt(-1.20, -1.45, p.y)
        c = mische(c, farbeMitRauschen(koralle, p, 0.05), fluegel * 0.8)
        c = mische(c, schwarz, glatt(-1.70, -2.05, p.z) * glatt(-1.30, -1.50, p.y) * 0.92)
        return c
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    // Schnabel in drei Stuecken: dicker heller Ansatz, der Knick, die schwarze Spitze nach unten.
    nase(w, [Form(art: .rundkegel(V(0, -0.04, 0.38), 0.20, 0.17), mitte: V(0, 0.40, 0.50), weich: 0.06),
             Form(art: .rundkegel(V(0, -0.18, 0.12), 0.17, 0.15), mitte: V(0, 0.36, 0.88), weich: 0.06)], farbe: hex("#F3D9D3"), lack: 0.45, rauheit: 0.4)
    nase(w, [Form(art: .rundkegel(V(0, -0.34, -0.08), 0.15, 0.05), mitte: V(0, 0.20, 0.99), weich: 0.05)], farbe: schwarz, lack: 0.45, rauheit: 0.4)
    augenEinsetzen(w, kopf, x: 0.31, y: 0.54, r: 0.155, tiefe: 0.38, iris: NSColor(calibratedRed: 0.93, green: 0.82, blue: 0.42, alpha: 1), pupille: 0.40, aussen: 0.15, ausdruck: Ausdruck(oben: 0.06, unten: 0.04, funke: 1.5))
    w.eulerAngles = SCNVector3(0.06, 1.05, 0.03)
    return (w, 9.6, V(0.05, -0.50, -0.4))
}

func rotkehlchen() -> (SCNNode, Float, V) {
    // Rotkehlchen: kugelrund, Gesicht und Brust orange, ein grauer Saum darum, olivbrauner Ruecken,
    // heller Bauch; kleiner dunkler Schnabel, grosse dunkle Augen.
    let oliv = hex("#7B6849"), orange = hex("#E07636"), grau = hex("#A2A7A8"), bauch = hex("#EFEAE0")
    var formen = vogelFormen(kopf: V(0.72, 0.64, 0.68), leib: V(0.96, 0.98, 0.86))
    formen[1].weich = 0.26     // Kopf etwas abgesetzt, nicht nur eine Kugel
    // Schwanz: kurz, schraeg nach hinten oben.
    formen.append(Form(art: .ellipsoid(V(0.24, 0.09, 0.42)), mitte: V(0, -0.78, -0.86), drehung: simd_quatf(angle: -0.5, axis: V(1, 0, 0)), weich: 0.12))
    let k = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(oliv, p, 0.07)
        c *= 0.9 + 0.2 * zellen(p, 7).wert
        let vorn = glatt(0.05, 0.55, n.z + 0.3 * p.z)
        // Das Orange umschliesst Gesicht und Augen und reicht bis auf die Brust.
        let brust = region(p, V(0, 0.28, 0.62), V(0.66, 0.74, 0.50), 0.25) * vorn
        let saum = region(p, V(0, 0.28, 0.58), V(0.78, 0.86, 0.56), 0.25) * vorn
        c = mische(c, grau, saum * 0.8)
        c = mische(c, farbeMitRauschen(orange, p, 0.05), brust)
        c = mische(c, bauch, glatt(-0.40, -0.70, p.y) * vorn)
        // Fluegel dunkler, mit hellen Federsaeumen.
        let fl = glatt(0.62, 0.76, abs(p.x)) * glatt(0.0, -0.25, p.y)
        let saeume = glatt(0.55, 0.95, sin(p.y * 26 + p.z * 8)) * 0.35
        c = mische(c, mische(hex("#55452F"), hex("#A08C68"), saeume), fl * 0.85)
        return c
    }, rauheit: 0.80, fell: 0.05)
    let w = SCNNode(); w.addChildNode(kopfKnoten(k, grenze: 1.9))
    nase(w, [Form(art: .rundkegel(V(0, -0.14, 0.40), 0.10, 0.018), mitte: V(0, 0.34, 0.62), stauchung: V(1, 0.75, 1))], farbe: hex("#2A2420"), lack: 0.4, rauheit: 0.4)
    augenEinsetzen(w, k, x: 0.34, y: 0.50, r: 0.19, tiefe: 0.36, iris: NSColor(calibratedRed: 0.10, green: 0.07, blue: 0.05, alpha: 1), pupille: 0.75, aussen: 0.15, ausdruck: Ausdruck(oben: 0.04, unten: 0.06, funke: 1.8))
    vogelFuesse(w, unten: -1.15, abstand: 0.24, vorn: 0.30, farbe: hex("#6B4F3A"), dicke: 0.06, bein: 0.22, zehe: 0.20)
    w.eulerAngles = SCNVector3(0.0, -0.42, 0.10)
    return (w, 7.0, V(0, 0.15, 0))
}

// ---------- Runde 163: Mops und Siamkatze (Auftrag des Inhabers) ----------

func mops() -> (SCNNode, Float, V) {
    // Mops: runder, breiter Kopf, kaum Schnauze, schwarze Maske, Stirnfalten, kleine dunkle Knopfohren,
    // grosse runde dunkle Augen; falbfarbenes, kurzes Fell.
    let falb = hex("#D8B888"), maske = hex("#2A2320"), hell = hex("#E8D2AC")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.96, 0.86, 0.86)), mitte: V(0, 0.10, -0.02)),
        Form(art: .ellipsoid(V(0.48, 0.38, 0.42)), mitte: V(-0.46, -0.24, 0.28), weich: 0.30),
        Form(art: .ellipsoid(V(0.48, 0.38, 0.42)), mitte: V(0.46, -0.24, 0.28), weich: 0.30),
        // kurze, breite Schnauze
        Form(art: .ellipsoid(V(0.42, 0.28, 0.26)), mitte: V(0, -0.24, 0.80), weich: 0.22),
        // Stirnfalten: weiche Wuelste ueber der Nase
        Form(art: .ellipsoid(V(0.20, 0.04, 0.08)), mitte: V(0, 0.36, 0.80), weich: 0.08),
        Form(art: .ellipsoid(V(0.16, 0.035, 0.07)), mitte: V(0, 0.48, 0.74), weich: 0.08),
    ]
    for sx: Float in [-1, 1] {
        // Knopfohr: nach vorn umgeklappt, klein und dunkel.
        formen.append(Form(art: .ellipsoid(V(0.24, 0.20, 0.07)), mitte: V(0.74 * sx, 0.58, 0.12),
                           drehung: simd_quatf(angle: -0.5 * sx, axis: V(0, 0, 1)) * simd_quatf(angle: 0.4 * sx, axis: V(0, 1, 0)), weich: 0.08))
    }
    formen += lider(0.34, 0.12, 0.70, 0.16)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(falb, p, 0.07)
        c = mische(c, hell, glatt(0.0, 0.5, p.y) * 0.25)
        // schwarze Maske: Schnauze und um die Augen, nach oben weich auslaufend
        let schnauze = region(p, V(0, -0.20, 0.98), V(0.56, 0.40, 0.44), 0.35)
        let augen = max(region(p, V(-0.34, 0.12, 0.74), V(0.22, 0.20, 0.30), 0.4), region(p, V(0.34, 0.12, 0.74), V(0.22, 0.20, 0.30), 0.4))
        c = mische(c, maske, max(schnauze, augen * 0.7))
        // Falten dunkler in den Tiefen
        c = mische(c, mische(falb, maske, 0.5), glatt(0.30, 0.52, p.y) * glatt(0.24, 0.0, abs(p.x)) * glatt(0.75, 0.9, n.z) * 0.35)
        c = mische(c, maske, glatt(0.62, 0.74, abs(p.x)) * glatt(0.40, 0.55, p.y) * 0.9)     // Ohren
        return c
    }, rauheit: 0.74, fell: 0.06)
    var (braue, braueM) = mitBrauen(kopf, x: 0.30, y: 0.32, laenge: 0.12, dicke: 0.05, winkel: 0.25, farbe: mische(falb, maske, 0.35), staerke: 0.7)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.035, rumpf: 0.05, nase: V(0, -0.10, 1.04), schnauze: 0.3,
        augen: augenStellen(kopf, x: 0.34, y: 0.12), augenR: 0.18,
        zonen: beide(V(0.46, -0.24, 0.28), V(0.40, 0.32, 0.36), 0.8)), braue: braueM)
    braue.fellArt = Fell(dichte: 90, ursprung: V(0, -0.10, 1.10), straehnen: 0.2)
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.20, 1.04), V(0, -0.30, 1.02), V(0, -0.36, 0.98)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.36, 0.98), V(0.10, -0.42, 0.95), V(0.22, -0.40, 0.86)], spitzVorn: false)),
        r: 0.030, farbe: hex("#140F0E"), staerke: 0.85))
    let bau = Bau(brust: 1.25, tiefe: 1.05, hals: 0.55, bein: 0.18, beinAbstand: 0.30, ruecken: 0.65)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in farbeMitRauschen(falb, p, 0.07) })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.10, 1.04), r: V(0.17, 0.11, 0.10), farbe: hex("#141010"))
    augenEinsetzen(w, kopf, x: 0.34, y: 0.12, r: 0.20, iris: NSColor(calibratedRed: 0.20, green: 0.12, blue: 0.07, alpha: 1), pupille: 0.62, ausdruck: Ausdruck(oben: 0.06, unten: 0.10, schraeg: 0.12, funke: 1.7, wange: 0.2))
    w.eulerAngles = SCNVector3(0.06, -0.24, -0.08)
    return (w, 7.4, V(0, 0.15, 0))
}

func siamkatze() -> (SCNNode, Float, V) {
    // Siamkatze: schlanker Keilkopf, grosse Ohren, cremefarbenes Fell mit dunkler Maske um Nase und
    // Schnauze, dunkle Ohren; mandelfoermige blaue Augen.
    let creme = hex("#EEE2CC"), punkt = hex("#4E3729"), rosa = hex("#C9938A")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.86, 0.80, 0.84)), mitte: V(0, 0.10, 0)),
        Form(art: .ellipsoid(V(0.36, 0.28, 0.32)), mitte: V(-0.50, -0.22, 0.28), weich: 0.28),
        Form(art: .ellipsoid(V(0.36, 0.28, 0.32)), mitte: V(0.50, -0.22, 0.28), weich: 0.28),
        Form(art: .ellipsoid(V(0.20, 0.15, 0.18)), mitte: V(-0.13, -0.26, 0.76), weich: 0.12),
        Form(art: .ellipsoid(V(0.20, 0.15, 0.18)), mitte: V(0.13, -0.26, 0.76), weich: 0.12),
        Form(art: .ellipsoid(V(0.15, 0.11, 0.13)), mitte: V(0, -0.40, 0.66), weich: 0.12),
    ]
    formen += ohrPaar(0.50, 0.58, -0.05, laenge: V(0.28, 0.72, -0.02), r1: 0.36, r2: 0.05, flach: 0.42)
    formen += lider(0.31, 0.12, 0.64, 0.17, weich: 0.12)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(creme, p, 0.05)
        // die Maske: um Nase und Schnauze am dunkelsten, zu den Augen hin weich
        let maske = region(p, V(0, -0.16, 0.86), V(0.44, 0.44, 0.40), 0.5)
        c = mische(c, farbeMitRauschen(punkt, p, 0.06), maske * 0.95)
        let ohr = glatt(0.62, 0.80, p.y) * glatt(0.25, 0.40, abs(p.x))
        c = mische(c, punkt, ohr * 0.9)
        let innen = glatt(0.66, 0.80, p.y) * glatt(0.25, 0.36, abs(p.x)) * glatt(0.1, 0.5, n.z) * glatt(1.25, 1.0, p.y)
        c = mische(c, rosa, innen * 0.5)
        return c
    }, rauheit: 0.70, fell: 0.05)
    var (braue, braueM) = mitBrauen(kopf, x: 0.30, y: 0.34, laenge: 0.12, dicke: 0.04, winkel: 0.18, farbe: mische(creme, punkt, 0.25), staerke: 0.6)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.03, rumpf: 0.05, nase: V(0, -0.06, 0.90), schnauze: 0.4,
        augen: augenStellen(kopf, x: 0.31, y: 0.12), augenR: 0.18,
        zonen: beide(V(0.52, -0.22, 0.25), V(0.34, 0.28, 0.36), 1.0)), braue: braueM)
    braue.fellArt = Fell(dichte: 95, ursprung: V(0, -0.06, 0.90), spitze: 1.04, straehnen: 0.2)
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.17, 0.96), V(0, -0.29, 0.95), V(0, -0.36, 0.92)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.36, 0.92), V(0.06, -0.41, 0.90), V(0.12, -0.41, 0.86), V(0.17, -0.37, 0.80)], spitzVorn: false)),
        r: 0.028, farbe: hex("#2A1C16"), staerke: 0.8))
    let bau = Bau(bein: 0.16, ruecken: 0.58)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in farbeMitRauschen(creme, p, 0.05) })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.08, 0.91), r: V(0.09, 0.06, 0.06), farbe: hex("#3A2A24"), dreieck: true)
    augenEinsetzen(w, kopf, x: 0.31, y: 0.12, r: 0.20, iris: NSColor(calibratedRed: 0.36, green: 0.62, blue: 0.92, alpha: 1), pupille: 0.50, schlitz: true, schlitzBreite: 0.55, ausdruck: Ausdruck(oben: 0.14, unten: 0.08, schraeg: 0.22, funke: 1.5, wange: 0.3))
    w.eulerAngles = SCNVector3(0.05, -0.30, -0.10)
    return (w, 7.3, V(0, 0.18, 0))
}

let TIERE: [Tier] = [
    Tier(name: "fuchs", bauen: fuchs), Tier(name: "katze", bauen: katze), Tier(name: "baer", bauen: baer),
    Tier(name: "panda", bauen: panda), Tier(name: "hase", bauen: hase), Tier(name: "reh", bauen: reh),
    Tier(name: "dackel", bauen: dackel), Tier(name: "retriever", bauen: hund), Tier(name: "eule", bauen: eule),
    Tier(name: "wal", bauen: wal), Tier(name: "goldfisch", bauen: goldfisch), Tier(name: "schildkroete", bauen: schildkroete),
    Tier(name: "delfin", bauen: delfin), Tier(name: "seeotter", bauen: seeotter), Tier(name: "pinguin", bauen: pinguin),
    Tier(name: "papagei", bauen: papagei), Tier(name: "flamingo", bauen: flamingo), Tier(name: "rotkehlchen", bauen: rotkehlchen),
    Tier(name: "mops", bauen: mops), Tier(name: "siamkatze", bauen: siamkatze),
]

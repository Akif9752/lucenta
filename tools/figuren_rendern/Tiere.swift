// Die zwoelf Tiere. Jede Funktion baut eine Szene: Koerper aus Grundformen, Farbe als Funktion des
// Ortes, Augen und Nase als eigene Koerper. Masse: Kopf etwa Radius 1, y oben, z zur Kamera.

import SceneKit
import AppKit
import simd

struct Tier { let name: String; let bauen: () -> (SCNNode, Float, V) }   // Knoten, Kameraabstand, Ziel

// Trickfilm-Stil statt „echt, aber liebenswert" (Entscheidung des Inhabers, Vorlagen in vorlagen/, nicht im Repo):
// grosse Augen mit Weiss, kraeftige Brauen, offenes Laecheln, glatte runde Formen. Keine Nachbildung fremder Figuren.
let TRICK = true

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
    var laecheln = false            // beide Augen zum Laecheln zugekniffen (Ausdruck „froh“)
    var groesse: CGFloat = 0.9      // etwas groesser als beim echten Tier (Entscheidung des Inhabers)
}
// Drei Ausdruecke nach der Tagesform (Entscheidung des Inhabers): AUSDRUCK=muede|froh, sonst ruhig.
// muede: Oberlid sinkt, kleinerer Lichtpunkt. froh: Unterlid steigt (laechelndes Auge), groesserer Lichtpunkt.
enum Stimmung: String { case ruhig, muede, froh }
let STIMMUNG = Stimmung(rawValue: ProcessInfo.processInfo.environment["AUSDRUCK"] ?? "") ?? .ruhig
extension Stimmung {
    func angewandt(_ a: Ausdruck) -> Ausdruck {
        var b = a
        switch self {
        case .ruhig: break
        case .muede: b.oben = min(0.5, a.oben + 0.24); b.unten = max(0, a.unten - 0.04); b.schraeg = a.schraeg + 0.08
                     b.funke = a.funke * 0.6; b.zwinkern = false
        // Trickfilm: Freude mit offenen Augen (Unterlid hebt sich leicht) und breitem Lachen, wie in den Vorlagen.
        case .froh:  if TRICK { b.oben = max(0, a.oben - 0.06); b.unten = a.unten + 0.10; b.funke = a.funke * 1.15 } else { b.laecheln = true }
        }
        return b
    }
    /// Mundwinkel: Seitliche Maullinien (|x| > 0,04) heben (froh) bzw. senken (muede) sich zum Ende hin.
    /// Das Unterlid allein traegt nicht — bei tief sitzenden Augen liegt es hinter dem Fell.
    func maulPunkt(_ q: V, t: Float) -> V {
        guard abs(q.x) > 0.04 else { return q }
        let hub: Float = self == .froh ? 0.075 : (self == .muede ? -0.03 : 0)
        return V(q.x, q.y + hub * t * t, q.z)
    }
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
func lid(_ r: Float, grenze: Float, achse d: V, farbe: V, rand: Float = 0.9) -> SCNNode? {
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
            let c = mische(farbe * (0.9 + 0.2 * fbm(pk * 40)), hex("#1C1411"), rand * glatt(tMax - 0.45, tMax - 0.05, t))
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
        // Trickfilm: nur das Oberlid traegt den dunklen Rand; unten las er sich als Strich unter dem Auge.
        if let k = lid(r, grenze: simd_dot(d, kante(anteil, seite)), achse: d, farbe: farbe, rand: TRICK && seite < 0 ? 0.1 : 0.9) {
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
        let n = Float(kurve.punkte.count - 1)
        let p = kurve.punkte.enumerated().map { aufFlaeche(k, STIMMUNG.maulPunkt($0.element, t: Float($0.offset) / max(n, 1))) }
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

// ---------- Trickfilm-Mund ----------
// Offener Mund: eine Hoehle unter der Lachlinie, innen dunkelrot, darin die Zunge. `offen` gilt fuer „ruhig";
// froh oeffnet weiter, muede schliesst (dann traegt nur die Lachlinie).
func mundOeffnung(_ offen: Float) -> Float { STIMMUNG == .froh ? min(1, offen * 1.4 + 0.25) : (STIMMUNG == .muede ? 0 : offen) }
func mundHoehle(mitte: V, breite: Float, hoehe: Float, tiefe: Float, offen: Float, kopf: Koerper? = nil) -> [Form] {
    let o = mundOeffnung(offen)
    guard o > 0.02 else { return [] }
    let b = breite * (STIMMUNG == .froh ? 1.15 : 0.85 + 0.15 * o), h = hoehe * o * (STIMMUNG == .froh ? 1.2 : 1)
    // D-Form wie in den Vorlagen: oben eine breite, fast gerade Kante (Kapsel, Winkel leicht hoch), unten rund.
    var f = [Form(art: .ellipsoid(V(b * 0.92, h, tiefe)), mitte: mitte - V(0, h * 0.45, 0), weich: 0.05)]
    if let kopf {
        let l = aufFlaeche(kopf, V(-b, mitte.y + 0.03, mitte.z)) - V(0, 0, 0.02)
        let r = aufFlaeche(kopf, V(b, mitte.y + 0.03, mitte.z)) - V(0, 0, 0.02)
        let m = aufFlaeche(kopf, V(0, mitte.y, mitte.z)) - V(0, 0, 0.02)
        let rk = h * 0.32
        f.append(Form(art: .rundkegel(m - l, rk, rk), mitte: l, weich: 0.04))
        f.append(Form(art: .rundkegel(r - m, rk, rk), mitte: m, weich: 0.04))
    }
    return f
}
func zunge(_ w: SCNNode, mitte: V, breite: Float, hoehe: Float, offen: Float, farbe: NSColor = NSColor(calibratedRed: 0.93, green: 0.45, blue: 0.50, alpha: 1)) {
    let o = mundOeffnung(offen)
    guard o > 0.02 else { return }
    let f: Float = STIMMUNG == .froh ? 1.2 : 1
    // Gross und weit unten: Die Zunge fuellt die untere Haelfte des Mundes und waechst nach vorn.
    w.addChildNode(perle(mitte - V(0, hoehe * o * 0.80 * f, 0.05), V(breite * 0.62 * f, hoehe * o * 0.42 * f, breite * 0.30), farbe: farbe, rauheit: 0.55))
}
// Glatte, glaenzende Trickfilm-Nase (statt Leder mit Nasenloechern).
func trickNase(_ w: SCNNode, mitte: V, r: V, farbe: V) {
    nase(w, [Form(art: .ellipsoid(r), mitte: mitte),
             Form(art: .ellipsoid(V(r.x * 0.75, r.y * 0.55, r.z * 0.8)), mitte: mitte + V(0, -r.y * 0.45, 0), weich: 0.06)],
         farbe: farbe, lack: 0.8, rauheit: 0.3)
}

// Augen an der Kopfseite (Wal, Goldfisch, Schildkroete): gleiche Lider, Lid-Achse an der Seitenflaeche.
func seitenAuge(_ w: SCNNode, _ k: Koerper, x: Float, y: Float, tiefe: Float, sz: Float, r: CGFloat, iris: NSColor,
                pupille: CGFloat, _ roh: Ausdruck) {
    let a = STIMMUNG.angewandt(roh)
    let r = r * a.groesse
    let zf = vorderflaeche(k, x, y)
    let flaeche = V(x, y, zf * sz), mitte = V(x, y, (zf - tiefe) * sz)
    let au = auge(radius: r, iris: iris, pupille: pupille, funke: a.funke)
    au.position = scnVektor(mitte); au.name = "auge"
    if !a.laecheln { w.addChildNode(au) }
    let ueber = V(x, y + Float(r) * 1.3, vorderflaeche(k, x, y + Float(r) * 1.3) * sz)
    lider(an: w, mitte: mitte, r: Float(r), vorn: gradient(k, flaeche), s: sz, farbe: k.farbe(ueber, gradient(k, ueber)) * 0.92, a,
          geschlossen: a.laecheln)
}

func augenEinsetzen(_ wurzel: SCNNode, _ kopf: Koerper, x: Float, y: Float, r: CGFloat, tiefe: Float = 0.42,
                    iris: NSColor, pupille: CGFloat = 0.5, schlitz: Bool = false, quer: Bool = false, schlitzBreite: CGFloat = 0.32,
                    blick: V = V(0, 0, 6), aussen: Float = 0.25, ausdruck roh: Ausdruck = Ausdruck()) {
    let a = STIMMUNG.angewandt(roh)
    let r = r * a.groesse
    for s: Float in [-1, 1] {
        let zf = vorderflaeche(kopf, x * s, y)
        let mitte = V(x * s, y, zf - tiefe * Float(r))
        let au = auge(radius: r, iris: iris, pupille: pupille, schlitz: schlitz, quer: quer, schlitzBreite: schlitzBreite, funke: a.funke)
        au.position = scnVektor(mitte); au.name = "auge"
        au.look(at: scnVektor(V(blick.x + x * s * aussen * 4, blick.y, blick.z)), up: SCNVector3(0, 1, 0), localFront: SCNVector3(0, 0, 1))
        // Runde 137, am Bild gesehen: Unter dem geschlossenen Lid schimmerten Hornhaut und Lichtpunkte
        // durch — das zwinkernde Auge las sich als glaenzende Kugel. Geschlossen gibt es keinen Augapfel.
        let zu = (a.zwinkern && s < 0) || a.laecheln
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
// `n` = Rasterpunkte; schlanke Teile (Pinguinschnabel) brauchen ein feineres Raster, sonst zackt die Kante.
func nase(_ wurzel: SCNNode, _ formen: [Form], farbe: V, lack: Float = 0.9, rauheit: Float = 0.25, n: Int = 170) {
    let k = Koerper(formen: formen, farbe: { _, _ in farbe })
    wurzel.addChildNode(glanzKoerper(k, grenze: 2.2, n: n, rauheit: rauheit, lack: lack))
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
    // Realistischer (Entscheidung des Inhabers): aufgemalte Brauen gibt es bei keiner dieser Arten — Farbe und
    // Wulst nur noch als Andeutung, damit der Ausdruck bleibt.
    let staerke = TRICK ? min(1, staerke * 1.15) : staerke * 0.4, wulst = TRICK ? wulst : wulst * 0.55
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
        c = mische(c, dunkel, glatt(1.16, 1.32, p.y))
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
    augenEinsetzen(w, kopf, x: 0.34, y: 0.18, r: 0.17, iris: NSColor(calibratedRed: 0.93, green: 0.63, blue: 0.16, alpha: 1), pupille: 0.62, schlitz: true, schlitzBreite: 0.52, ausdruck: Ausdruck(oben: 0.03, unten: 0.10, schraeg: 0.04, funke: 1.6, wange: 0.30))
    // Kopfhaltung je Tier verschieden (Auftrag des Inhabers: nicht alle in dieselbe Richtung).
    w.eulerAngles = SCNVector3(0.08, -0.48, -0.06)
    return (w, 7.6, V(0, 0.22, 0.2))
}

// ---------- Katze (rot getigert) ----------

func katze() -> (SCNNode, Float, V) {
    let rot = hex("#D9893E"), streifen = hex("#9E5320"), weiss = hex("#F4EBDF"), rosa = hex("#E8A9A0")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.82, 0.72, 0.84)), mitte: V(0, 0.10, -0.02)),
        Form(art: .ellipsoid(V(0.36, 0.26, 0.32)), mitte: V(-0.52, -0.22, 0.26), weich: 0.30),
        Form(art: .ellipsoid(V(0.36, 0.26, 0.32)), mitte: V(0.52, -0.22, 0.26), weich: 0.30),
        // Schnurrhaarpolster: zwei Wuelste unter der Nase, das Kennzeichen jedes Katzengesichts.
        Form(art: .ellipsoid(V(0.18, 0.14, 0.15)), mitte: V(-0.13, -0.26, 0.86), weich: 0.12),
        Form(art: .ellipsoid(V(0.18, 0.14, 0.15)), mitte: V(0.13, -0.26, 0.86), weich: 0.12),
        Form(art: .ellipsoid(V(0.15, 0.11, 0.14)), mitte: V(0, -0.42, 0.76), weich: 0.12),
    ]
    formen += ohrPaar(0.46, 0.52, -0.06, laenge: V(0.18, 0.54, -0.02), r1: 0.30, r2: 0.045, flach: 0.42)
    formen += lider(0.30, 0.13, 0.66, 0.15, weich: 0.12)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(rot, p, 0.07)
        // Tigerung: Streifen quer ueber Stirn und Wangen, auf der Stirn das "M".
        // feine Linien wie bei einer echten Tigerkatze: das "M" auf der Stirn, Linien ueber die Wangen
        let band = sinf(p.x * 36 + sinf(p.y * 4) * 1.2 + fbm(p * 3) * 2) * 0.5 + 0.5
        let stirn = glatt(0.30, 0.55, p.y) * glatt(0.62, 0.2, abs(p.x)) * glatt(0.86, 0.95, band)
        let wange = glatt(0.35, 0.65, abs(p.x)) * glatt(0.87, 0.95, sinf(p.y * 30 + abs(p.x) * 5 + fbm(p * 3) * 2) * 0.5 + 0.5)
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
    var (braue, braueM) = mitBrauen(kopf, x: 0.30, y: 0.35, laenge: 0.13, dicke: 0.045, winkel: 0.18, farbe: mische(rot, weiss, 0.4), staerke: 0.5)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.05, rumpf: 0.07, nase: V(0, -0.06, 1.00), schnauze: 0.45,
        augen: augenStellen(kopf, x: 0.30, y: 0.13), augenR: 0.16,
        zonen: beide(V(0.54, -0.22, 0.26), V(0.38, 0.30, 0.40), 1.8) + [(V(0, 0.85, 0), V(0.9, 0.35, 0.5), 0.35)]), braue: braueM)
    braue.fellArt = Fell(dichte: 95, ursprung: V(0, -0.06, 1.00), wurzel: 0.58, spitze: 1.12, straehnen: 0.3, streuung: 0.15)
    // Katze: das "ω" — eine Rinne von der Nase senkrecht nach unten, die sich unter den
    // Schnurrhaarpolstern in zwei Boegen teilt.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.17, 1.06), V(0, -0.30, 1.05), V(0, -0.38, 1.02)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.38, 1.02), V(0.06, -0.43, 1.00), V(0.13, -0.43, 0.96), V(0.19, -0.39, 0.90)], spitzVorn: false)),
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
    tierNase(w, mitte: V(0, -0.08, 1.01), r: V(0.095, 0.06, 0.06), farbe: hex("#C97F7C"), dreieck: true)
    augenEinsetzen(w, kopf, x: 0.30, y: 0.13, r: 0.145, iris: NSColor(calibratedRed: 0.62, green: 0.74, blue: 0.22, alpha: 1), pupille: 0.55, schlitz: true, schlitzBreite: 0.62, ausdruck: Ausdruck(oben: 0.10, unten: 0.07, schraeg: 0.14, funke: 1.5, wange: 0.40))
    w.eulerAngles = SCNVector3(0.06, 0.34, 0.12)
    return (w, 7.3, V(0, 0.18, 0))
}

// ---------- Baer ----------

// Trickfilm-Baerenkoerper nach den Vorlagen (Baer, Panda): kleiner Oberkopf, unten breit mit dicken Wangenpolstern,
// kleine runde Ohren, vorstehende Schnauze mit grosser Nase, offenes D-Lachen, Augen hoch und dicht. Pummelig mit
// Armen und Tatzen vor dem Bauch — erst sie machen aus der Rundung einen Koerper.
// `kopfFarbe`/`rumpfFarbe` bekommen (Punkt, Normale, amArm); `brauen` nil = keine (Panda: die Augenflecken tragen den Ausdruck).
struct BaerenArt {
    var kopfFarbe: (V, V) -> V
    var rumpfFarbe: (V, V, Float) -> V
    var brauen: V?
    var iris: NSColor
    var lippe: V
    var fell = Fell(dichte: 70, ursprung: V(0, -0.05, 1.20), straehnen: 0.35)
}
func baerenFigur(_ art: BaerenArt) -> (SCNNode, Float, V) {
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.78, 0.70, 0.74)), mitte: V(0, 0.30, -0.02)),
        Form(art: .ellipsoid(V(0.70, 0.56, 0.56)), mitte: V(-0.56, -0.18, 0.10), weich: 0.40),
        Form(art: .ellipsoid(V(0.70, 0.56, 0.56)), mitte: V(0.56, -0.18, 0.10), weich: 0.40),
        Form(art: .ellipsoid(V(0.52, 0.40, 0.44)), mitte: V(0, -0.20, 0.74), weich: 0.28),
    ]
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.22, 0.22, 0.14)), mitte: V(0.60 * sx, 0.86, -0.12), weich: 0.12))
        formen.append(Form(art: .ellipsoid(V(0.13, 0.13, 0.09)), mitte: V(0.62 * sx, 0.87, 0.00), weich: 0.06, abziehen: true))
    }
    let kopf = Koerper(formen: formen, farbe: art.kopfFarbe, rauheit: 0.75, fell: 0.05)
    let hoehle = mundHoehle(mitte: V(0, -0.25, 1.10), breite: 0.32, hoehe: 0.24, tiefe: 0.22, offen: 0.8, kopf: kopf)
    var (braue, braueM) = art.brauen.map { mitBrauen(kopf, x: 0.28, y: 0.78, laenge: 0.17, dicke: 0.075, winkel: 0.12, farbe: $0, staerke: 1) }
        ?? (kopf, { _ in 0 })
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.07, rumpf: 0.09, nase: V(0, 0.02, 1.14), schnauze: 0.5,
        augen: augenStellen(kopf, x: 0.27, y: 0.46), augenR: 0.28, braue: 0.3,
        zonen: beide(V(0.70, -0.25, 0.15), V(0.45, 0.40, 0.45), 1.7)), braue: braueM)
    braue.fellArt = art.fell
    // Kurze Rinne unter der Nase und Mundwinkel, die in die Wangen hochziehen; die Lachlinie selbst ist die Mundkante.
    let zu = mundOeffnung(0.8) < 0.02
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.06, 1.18), V(0, -0.15, 1.17), V(0, -0.22, 1.15)], spitzHinten: !zu)]
        + (zu ? paar(Kurve(punkte: [V(0, -0.22, 1.15), V(0.14, -0.25, 1.11), V(0.27, -0.20, 1.03), V(0.34, -0.12, 0.95)], spitzVorn: false))
              : paar(Kurve(punkte: [V(0.31, -0.22, 1.02), V(0.37, -0.15, 0.94), V(0.40, -0.07, 0.86)]))),
        r: 0.026, farbe: art.lippe, staerke: 0.85, hoehlen: hoehle, innen: hex("#93323A")))
    let bau = Bau(brust: 2.7, tiefe: 1.7, hals: 0.62, halsLaenge: 1.3, bein: 0.36, beinAbstand: 0.62, beinOben: -1.60, ruecken: 1.30, rueckenHoehe: -1.15)
    var rumpf = vierbeiner(bau)
    for s: Float in [-1, 1] {
        rumpf.append(Form(art: .rundkegel(V(-s * 0.40, -0.10, 0.85), 0.30, 0.25), mitte: V(s * 1.00, -1.05, 0.30), weich: 0.10))
        rumpf.append(Form(art: .ellipsoid(V(0.26, 0.22, 0.22)), mitte: V(s * 0.58, -1.16, 1.18), weich: 0.08))
    }
    let arme = Array(rumpf.suffix(4))
    let koerper = brustbild(maul, rumpf, farbe: { p, n in
        art.rumpfFarbe(p, n, glatt(0.18, 0.02, arme.map { $0.abstand(p) }.min() ?? 1))   // weit genug fuer die Fellspitzen
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    trickNase(w, mitte: V(0, 0.03, 1.16), r: V(0.21, 0.14, 0.13), farbe: hex("#141011"))
    zunge(w, mitte: V(0, -0.25, 1.06), breite: 0.27, hoehe: 0.24, offen: 0.8)
    augenEinsetzen(w, kopf, x: 0.27, y: 0.46, r: 0.15, tiefe: 0.24, iris: art.iris,
                   pupille: 0.62, ausdruck: Ausdruck(oben: 0.06, unten: 0.0, schraeg: 0.0, funke: 1.4, groesse: 1.6))
    w.eulerAngles = SCNVector3(0.04, -0.18, 0.03)
    return (w, 7.3, V(0, 0.15, 0))
}

func baer() -> (SCNNode, Float, V) {
    let braun = hex("#B5622D"), hell = hex("#F0C597")
    return baerenFigur(BaerenArt(
        kopfFarbe: { p, n in
            var c = farbeMitRauschen(braun, p, 0.05)
            c = mische(c, farbeMitRauschen(hell, p, 0.03), region(p, V(0, -0.24, 0.92), V(0.52, 0.42, 0.40), 0.22))
            return mische(c, hell, glatt(0.76, 0.86, p.y) * glatt(0.48, 0.58, abs(p.x)) * glatt(0.2, 0.6, n.z) * 0.8)   // Ohrmuschel
        },
        rumpfFarbe: { p, _, arm in mische(farbeMitRauschen(braun, p, 0.05), hell, region(p, V(0, -1.85, 1.05), V(0.70, 0.72, 0.50), 0.30) * (1 - arm)) },
        brauen: hex("#4E2413"), iris: NSColor(calibratedRed: 0.38, green: 0.22, blue: 0.10, alpha: 1), lippe: hex("#4E2413")))
}

func panda() -> (SCNNode, Float, V) {
    // Panda nach der Vorlage: weisser Kopf, schwarze Ohren und schraege Augenflecken, schwarze Arme und Schulterband.
    let weiss = hex("#F4F2EE"), schwarz = hex("#1E1D1F")
    return baerenFigur(BaerenArt(
        kopfFarbe: { p, _ in
            var c = farbeMitRauschen(weiss, p, 0.03)
            // Augenflecken: tropfenfoermig, nach aussen unten gezogen
            for s: Float in [-1, 1] {
                let q = p - V(0.34 * s, 0.41, 0.70)
                let r = simd_quatf(angle: s * 0.65, axis: V(0, 0, 1)).inverse.act(q)
                c = mische(c, schwarz, glatt(1.05, 0.88, simd_length(V(r.x / 0.29, r.y / 0.42, r.z / 0.9))))
            }
            return mische(c, schwarz, glatt(0.70, 0.78, p.y) * glatt(0.42, 0.52, abs(p.x)))   // Ohren
        },
        rumpfFarbe: { p, _, arm in
            let band = glatt(0.55, 0.75, abs(p.x)) + glatt(-1.25, -1.55, p.y) * glatt(0.2, -0.2, p.z)
            return mische(farbeMitRauschen(weiss, p, 0.03), schwarz, max(arm, min(1, band)))
        },
        brauen: nil, iris: NSColor(calibratedRed: 0.40, green: 0.48, blue: 0.22, alpha: 1), lippe: schwarz))
}

// ---------- Hase (Wildkaninchen) ----------

func hase() -> (SCNNode, Float, V) {
    // Trickfilm-Hase nach der Vorlage: runder Kopf, flauschige Wangen, sehr grosse Augen, ein Ohr aufrecht, eins
    // nach aussen abgeknickt, rosa Naeschen, sanftes Laecheln, kleine Pfoten vor dem hellen Bauch.
    let grau = hex("#9C948E"), hell = hex("#EEE9E4"), rosa = hex("#D9898A"), dunkel = hex("#4A403B")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.78, 0.72, 0.74)), mitte: V(0, 0.12, 0)),
        Form(art: .ellipsoid(V(0.58, 0.44, 0.46)), mitte: V(-0.50, -0.24, 0.18), weich: 0.38),
        Form(art: .ellipsoid(V(0.58, 0.44, 0.46)), mitte: V(0.50, -0.24, 0.18), weich: 0.38),
        Form(art: .ellipsoid(V(0.32, 0.24, 0.28)), mitte: V(0, -0.20, 0.66), weich: 0.24),
    ]
    // Ohren: rechts im Bild aufrecht, links nach aussen abgeknickt (zwei Glieder).
    let aufrecht = simd_quatf(angle: -0.12, axis: V(0, 0, 1)) * simd_quatf(angle: -0.15, axis: V(1, 0, 0))
    formen.append(Form(art: .ellipsoid(V(0.26, 0.72, 0.11)), mitte: V(-0.30, 1.38, -0.12), drehung: aufrecht, weich: 0.14))
    formen.append(Form(art: .ellipsoid(V(0.17, 0.60, 0.06)), mitte: V(-0.30, 1.40, -0.04), drehung: aufrecht, weich: 0.05, abziehen: true))
    formen.append(Form(art: .ellipsoid(V(0.26, 0.38, 0.11)), mitte: V(0.36, 1.08, -0.12), drehung: simd_quatf(angle: -0.25, axis: V(0, 0, 1)), weich: 0.14))
    let knick = simd_quatf(angle: -1.15, axis: V(0, 0, 1))
    formen.append(Form(art: .ellipsoid(V(0.26, 0.50, 0.11)), mitte: V(0.80, 1.40, -0.10), drehung: knick, weich: 0.12))
    formen.append(Form(art: .ellipsoid(V(0.17, 0.42, 0.06)), mitte: V(0.80, 1.38, -0.02), drehung: knick, weich: 0.05, abziehen: true))
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(grau, p, 0.06)
        c = mische(c, farbeMitRauschen(hell, p, 0.03), region(p, V(0, -0.26, 0.70), V(0.40, 0.26, 0.40), 0.30))
        c = mische(c, hell, region(p, V(0, -0.62, 0.40), V(0.40, 0.25, 0.40), 0.4))
        let ohr = glatt(0.85, 1.0, p.y) * glatt(0.1, 0.5, n.z) * glatt(0.0, 0.02, p.z + 0.06)
        return mische(c, rosa, ohr * 0.65)
    }, rauheit: 0.80, fell: 0.06)
    var (braue, braueM) = mitBrauen(kopf, x: 0.30, y: 0.50, laenge: 0.15, dicke: 0.05, winkel: 0.15, farbe: dunkel, staerke: 0.8)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.08, rumpf: 0.09, nase: V(0, -0.10, 0.97), schnauze: 0.4,
        augen: augenStellen(kopf, x: 0.30, y: 0.16), augenR: 0.28, braue: 0.2,
        zonen: beide(V(0.55, -0.28, 0.25), V(0.42, 0.36, 0.40), 1.8) + [(V(0, 1.2, -0.1), V(1.0, 0.7, 0.4), 0.35)]), braue: braueM)
    braue.fellArt = Fell(dichte: 110, aufrecht: 0.52, ursprung: V(0, -0.10, 0.97), wurzel: 0.55, spitze: 1.22, straehnen: 0.35, streuung: 0.22)
    let hoehle = mundHoehle(mitte: V(0, -0.27, 0.93), breite: 0.13, hoehe: 0.09, tiefe: 0.10, offen: 0)
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.14, 0.97), V(0, -0.21, 0.96), V(0, -0.25, 0.94)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.25, 0.94), V(0.08, -0.28, 0.92), V(0.16, -0.25, 0.87), V(0.22, -0.19, 0.80)], spitzVorn: false)),
        r: 0.022, farbe: hex("#6E5550"), staerke: 0.85, hoehlen: hoehle, innen: hex("#5C1C20")))
    let bau = Bau(brust: 1.25, tiefe: 1.15, hals: 0.45, halsLaenge: 1.0, bein: 0.18, beinAbstand: 0.26, beinOben: -1.20, ruecken: 0.80, rueckenLaenge: 1.0, rueckenHoehe: -1.15)
    var rumpf = vierbeiner(bau)
    for s: Float in [-1, 1] { rumpf.append(Form(art: .ellipsoid(V(0.16, 0.20, 0.16)), mitte: V(s * 0.30, -1.25, 0.78), weich: 0.10)) }
    let koerper = brustbild(maul, rumpf, farbe: { p, _ in
        mische(farbeMitRauschen(grau, p, 0.06), hell, region(p, V(0, -1.15, 0.80), V(0.42, 0.60, 0.40), 0.35))
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    trickNase(w, mitte: V(0, -0.09, 0.98), r: V(0.07, 0.05, 0.05), farbe: hex("#E08B86"))
    zunge(w, mitte: V(0, -0.28, 0.90), breite: 0.10, hoehe: 0.09, offen: 0)
    augenEinsetzen(w, kopf, x: 0.30, y: 0.16, r: 0.16, tiefe: 0.24, iris: NSColor(calibratedRed: 0.30, green: 0.17, blue: 0.09, alpha: 1),
                   pupille: 0.62, ausdruck: Ausdruck(oben: 0.04, unten: 0.0, schraeg: 0.08, funke: 1.5, groesse: 1.75))
    w.eulerAngles = SCNVector3(0.04, -0.12, 0.02)
    return (w, 8.6, V(0, 0.45, 0))
}

// ---------- Reh ----------

func reh() -> (SCNNode, Float, V) {
    let braun = hex("#A9643A"), weiss = hex("#F2E8DC"), dunkel = hex("#3A2418")
    var formen: [Form] = [
        // Wie beim echten Reh: schmale Hirnschale, langer, sich verjuengender Nasenruecken.
        Form(art: .ellipsoid(V(0.58, 0.58, 0.80)), mitte: V(0, 0.17, -0.10)),
        // lange, schmale Schnauze
        Form(art: .rundkegel(V(0, -0.40, 1.02), 0.34, 0.19), mitte: V(0, -0.02, 0.28), weich: 0.28),
    ]
    // Lauscher: gross und oval, SCHRAEG NACH OBEN (waagerecht abstehend wirkten sie wie Zeichentrick), leicht nach vorn offen.
    for sx: Float in [-1, 1] {
        let dreh = simd_quatf(angle: -0.55 * sx, axis: V(0, 0, 1)) * simd_quatf(angle: 0.30 * sx, axis: V(0, 1, 0))
        formen.append(Form(art: .ellipsoid(V(0.22, 0.46, 0.09)), mitte: V(0.60 * sx, 0.86, -0.22), drehung: dreh, weich: 0.12))
        formen.append(Form(art: .ellipsoid(V(0.15, 0.36, 0.07)), mitte: V(0.62 * sx, 0.88, -0.15), drehung: dreh, weich: 0.05, abziehen: true))
    }
    formen += lider(0.36, 0.22, 0.52, 0.10)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(braun, p, 0.08)
        // Weisser Ring um die Schnauze, Kinn hell, Nasenruecken dunkler.
        c = mische(c, weiss, region(p, V(0, -0.440, 1.200), V(0.30, 0.22, 0.32), 0.35))
        c = mische(c, weiss, glatt(-0.30, -0.45, p.y) * glatt(0.3, 0.6, p.z))
        c *= 1 - 0.20 * region(p, V(0, -0.080, 1.260), V(0.14, 0.3, 0.45), 0.5)
        // Ohren innen hell, Rand dunkel.
        let ohr = glatt(0.58, 0.72, p.y) * glatt(0.30, 0.42, abs(p.x))
        c = mische(c, mische(mische(c, dunkel, 0.25), weiss, glatt(0.0, 0.6, n.z) * 0.8), ohr)
        c = mische(c, dunkel, glatt(1.12, 1.28, p.y) * ohr * 0.9)                 // dunkle Spitzen
        // Helle Flecken seitlich am schwarzen Nasenspiegel.
        for sx: Float in [-1, 1] { c = mische(c, weiss, region(p, V(0.14 * sx, -0.40, 1.42), V(0.09, 0.08, 0.12), 0.3) * 0.85) }
        return c
    }, rauheit: 0.75, fell: 0.06)
    // Reh: nur ein Hauch heller ueber dem Auge (weisse Brauen hat es nicht); kurzes, anliegendes Fell.
    var (braue, braueM) = mitBrauen(kopf, x: 0.34, y: 0.41, laenge: 0.11, dicke: 0.045, winkel: 0.2, farbe: mische(braun, weiss, 0.30), staerke: 0.30, wulst: 0.12)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.045, rumpf: 0.055, nase: V(0, -0.400, 1.500), schnauze: 0.6,
        augen: augenStellen(kopf, x: 0.36, y: 0.22), augenR: 0.17, braue: 0.3,
        zonen: beide(V(0.60, 0.86, -0.22), V(0.30, 0.50, 0.25), 0.6)), braue: braueM)
    braue.fellArt = Fell(dichte: 120, aufrecht: 0.28, neigung: 1.6, ursprung: V(0, -0.400, 1.500), wurzel: 0.58, spitze: 1.18, straehnen: 0.2, streuung: 0.16)
    // Reh: geschlossenes, schmales Maul tief an der Schnauzenspitze, mit kaum angehobenem Winkel — sanft.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.510, 1.560), V(0, -0.565, 1.540)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.565, 1.540), V(0.08, -0.590, 1.460), V(0.14, -0.575, 1.330), V(0.19, -0.530, 1.200)], spitzVorn: false)),
        r: 0.030, farbe: dunkel, staerke: 0.85))
    let bau = Bau(brust: 0.9, hals: 0.30, halsLaenge: 1.5, bein: 0.12, beinAbstand: 0.20, beinOben: -1.55, ruecken: 0.62, rueckenHoehe: -1.10)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        // Rehe tragen einen hellen Kehlfleck gleich unter dem Kinn, die Brust bleibt braun.
        let kehle = region(p, V(0, -0.60, 0.50), V(0.26, 0.20, 0.45), 0.4)
        return mische(farbeMitRauschen(braun, p, 0.08), farbeMitRauschen(weiss, p, 0.04), kehle * 0.9)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.400, 1.500), r: V(0.21, 0.14, 0.11), farbe: hex("#141011"))
    augenEinsetzen(w, kopf, x: 0.36, y: 0.22, r: 0.155, iris: NSColor(calibratedRed: 0.26, green: 0.14, blue: 0.08, alpha: 1), pupille: 0.55, aussen: 0.45, ausdruck: Ausdruck(oben: 0.14, unten: 0.05, schraeg: 0.26, funke: 1.5, wange: 0.40))
    w.eulerAngles = SCNVector3(0.10, 0.48, 0.04)
    return (w, 8.0, V(0, 0.15, 0.2))
}

// ---------- Dackel (Kurzhaar, rot) ----------

func dackel() -> (SCNNode, Float, V) {
    let rot = hex("#9E4E22"), dunkel = hex("#5E2C12"), hell = hex("#C47A45")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.78, 0.72, 0.80)), mitte: V(0, 0.14, -0.10)),
        // die lange Dackelschnauze, oben fast gerade
        Form(art: .rundkegel(V(0, -0.16, 1.18), 0.30, 0.14), mitte: V(0, -0.04, 0.32), weich: 0.22),
        // Unterkiefer und Lefzen: geben der Schnauze unten Masse und machen sie zum Hundemaul
        Form(art: .rundkegel(V(0, -0.03, 0.98), 0.20, 0.11), mitte: V(0, -0.28, 0.35), weich: 0.16),
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
        c = mische(c, hell, region(p, V(0, -0.30, 1.05), V(0.30, 0.18, 0.46), 0.4) * 0.5)
        c *= 1 - 0.20 * glatt(1.26, 1.62, p.z)
        c = mische(c, dunkel, glatt(0.30, 0.80, p.y) * 0.28)                       // Ruecken und Scheitel dunkler                                    // Schnauzenspitze dunkler
        return c
    }, rauheit: 0.52, fell: 0.05)
    // Dackel: deutlicher Brauenwulst, dunkler schattiert — der treuherzige Dackelblick; Kurzhaar,
    // glatt und anliegend.
    var (braue, braueM) = mitBrauen(kopf, x: 0.27, y: 0.38, laenge: 0.11, dicke: 0.065, winkel: 0.38, farbe: dunkel, staerke: 0.75)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.064, rumpf: 0.07, nase: V(0, -0.19, 1.62), schnauze: 0.7,
        augen: augenStellen(kopf, x: 0.30, y: 0.20), augenR: 0.15, braue: 0.3), braue: braueM)
    // Glattes Kurzhaar glaenzt: wenig Abstand, kaum Helligkeitsunterschied, glatte Haut darunter.
    braue.fellArt = Fell(dichte: 145, dicke: 0.5, aufrecht: 0.34, neigung: 1.6, ursprung: V(0, -0.19, 1.62), wurzel: 0.62, spitze: 1.20, straehnen: 0.18, streuung: 0.15)
    // Dackel: lange Lefzen zwischen Schnauze und Unterkiefer, geschlossen.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.28, 1.61), V(0, -0.34, 1.55)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.34, 1.55), V(0.09, -0.38, 1.40), V(0.16, -0.40, 1.16), V(0.21, -0.38, 0.90), V(0.24, -0.32, 0.70)], spitzVorn: false)),
        r: 0.032, farbe: hex("#2A120A"), staerke: 0.85))
    let bau = Bau(brust: 1.05, tiefe: 1.25, bein: 0.17, beinAbstand: 0.22, beinOben: -1.45, ruecken: 0.56, rueckenLaenge: 1.25, rueckenHoehe: -1.0)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(rot, p, 0.07), hell, latz(p, breite: 0.30) * 0.25)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.19, 1.62), r: V(0.14, 0.10, 0.10), farbe: hex("#161010"))
    augenEinsetzen(w, kopf, x: 0.30, y: 0.20, r: 0.16, iris: NSColor(calibratedRed: 0.40, green: 0.22, blue: 0.10, alpha: 1), pupille: 0.58, ausdruck: Ausdruck(oben: 0.08, unten: 0.00, schraeg: 0.38, funke: 1.7, wange: 0))
    w.eulerAngles = SCNVector3(0.06, -0.50, 0)
    return (w, 8.0, V(0, 0.10, 0.25))
}

// ---------- Golden Retriever ----------

func hund() -> (SCNNode, Float, V) {
    // Golden Retriever, von a bis z neu: breiter Schaedel mit sanftem Stopp, langer, sich verjuengender Fang mit
    // eigenem Unterkiefer, Schlappohren bis unter den Kiefer. Kurzes Fell im Gesicht, Fahnen an Ohren, Hals und Brust.
    // Offenes Hundelachen mit Zunge, dunkle Lefzen, mandelfoermige braune Augen mit dunklem Lidrand.
    let gold = hex("#D29A52"), hell = hex("#F0D9AE"), dunkel = hex("#9C6731")
    let nasePos = V(0, -0.04, 1.62)
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.76, 0.62, 0.80)), mitte: V(0, 0.14, -0.06)),
        // Stirnabsatz (Stopp) und Brauenbogen.
        Form(art: .ellipsoid(V(0.50, 0.20, 0.30)), mitte: V(0, 0.34, 0.50), weich: 0.25),
        // Backen.
        Form(art: .ellipsoid(V(0.36, 0.30, 0.36)), mitte: V(-0.38, -0.20, 0.36), weich: 0.30),
        Form(art: .ellipsoid(V(0.36, 0.30, 0.36)), mitte: V(0.38, -0.20, 0.36), weich: 0.30),
        // Fang: vom Stopp nach vorn schmaler werdend, oben fast gerade.
        Form(art: .rundkegel(V(0, -0.06, 0.88), 0.34, 0.24), mitte: V(0, -0.12, 0.60), stauchung: V(1.0, 0.88, 1), weich: 0.22),
        // Unterkiefer: kuerzer, unter dem Fang.
        Form(art: .rundkegel(V(0, -0.04, 0.66), 0.22, 0.14), mitte: V(0, -0.42, 0.62), stauchung: V(1.0, 0.75, 1), weich: 0.20),
        // Lefzen haengen seitlich am Fang etwas herab.
        Form(art: .ellipsoid(V(0.12, 0.14, 0.34)), mitte: V(-0.24, -0.34, 1.08), weich: 0.14),
        Form(art: .ellipsoid(V(0.12, 0.14, 0.34)), mitte: V(0.24, -0.34, 1.08), weich: 0.14),
    ]
    var ohren: [Form] = []
    for sx: Float in [-1, 1] {
        // Schlappohr: setzt hoch am Schaedel an und haengt flach an der Backe bis unter den Kiefer.
        ohren.append(Form(art: .ellipsoid(V(0.28, 0.58, 0.09)), mitte: V(0.80 * sx, -0.16, -0.02),
                          drehung: simd_quatf(angle: 0.12 * sx, axis: V(0, 0, 1)) * simd_quatf(angle: 0.50 * sx, axis: V(0, 1, 0)), weich: 0.06))
        formen.append(Form(art: .ellipsoid(V(0.20, 0.14, 0.14)), mitte: V(0.66 * sx, 0.36, -0.08), weich: 0.14))   // Ohransatz
    }
    formen += ohren + lider(0.32, 0.20, 0.64, 0.13)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(gold, p, 0.08)
        c *= 0.94 + 0.12 * fbm(p * V(6, 14, 6))                       // feine Strichzeichnung des Fells
        c = mische(c, hell, region(p, V(0, -0.30, 1.20), V(0.40, 0.30, 0.55), 0.45) * 0.65)   // heller Fang und Kinn
        c = mische(c, hell, region(p, V(0, 0.40, 0.66), V(0.30, 0.10, 0.20), 0.6) * 0.30)    // helle Brauen
        let ohr = glatt(0.05, 0.0, ohren.map { $0.abstand(p) }.min() ?? 1) * glatt(0.40, 0.20, p.y)
        c = mische(c, farbeMitRauschen(dunkel, p, 0.10), ohr * 0.80)                         // Ohren dunkler, kraeftiger
        c = mische(c, mische(gold, dunkel, 0.5), region(p, V(0, 0.30, 0.90), V(0.10, 0.18, 0.40), 0.5) * 0.30)  // Nasenruecken
        // Dunkle Lefzenkante.
        c = mische(c, hex("#2A1C14"), region(p, V(0, -0.40, 1.16), V(0.32, 0.06, 0.42), 0.4) * glatt(0.10, 0.22, abs(p.x)) * 0.55)
        for sx: Float in [-1, 1] { c = mische(c, hex("#4A2E1A"), region(p, V(0.32 * sx, 0.20, 0.66), V(0.14, 0.10, 0.2), 0.3) * 0.35) }
        return c
    }, rauheit: 0.78, fell: 0.07)
    var (braue, braueM) = mitBrauen(kopf, x: 0.29, y: 0.37, laenge: 0.12, dicke: 0.05, winkel: 0.12, farbe: hex("#EBD3A6"), staerke: 0.4)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.030, rumpf: 0.13, nase: nasePos, schnauze: 0.80,
        augen: augenStellen(kopf, x: 0.32, y: 0.20), augenR: 0.13,
        braue: 0.8, zonen: beide(V(0.80, -0.30, -0.04), V(0.32, 0.50, 0.25), 3.2) + beide(V(0.56, -0.36, 0.20), V(0.28, 0.26, 0.30), 1.8)
            + [(V(0, -1.0, 0.6), V(0.60, 0.7, 0.5), 1.4)]), braue: braueM)
    braue.fellArt = Fell(dichte: 110, dicke: 0.44, aufrecht: 0.32, neigung: 1.6, schwere: 0.9, ursprung: nasePos + V(0, 0, -0.10), wurzel: 0.56, spitze: 1.20, straehnen: 0.50, streuung: 0.22)
    // Offenes Hundelachen: Rinne unter der Nase, Mundwinkel weit hinten und hoch, dazwischen das offene Maul.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.15, 1.66), V(0, -0.24, 1.64), V(0, -0.30, 1.60)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.30, 1.60), V(0.10, -0.35, 1.54), V(0.21, -0.37, 1.40), V(0.29, -0.33, 1.20), V(0.33, -0.24, 1.00)], spitzVorn: false)),
        r: 0.030, farbe: hex("#2E1D12"), staerke: 0.85,
        hoehlen: [Form(art: .ellipsoid(V(0.22, 0.10, 0.30)), mitte: V(0, -0.40, 1.36), weich: 0.05)]))
    let bau = Bau(brust: 1.2, tiefe: 1.1, hals: 0.52, bein: 0.20, beinAbstand: 0.26, ruecken: 0.56, rueckenHoehe: -1.15)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        var c = mische(farbeMitRauschen(gold, p, 0.08), farbeMitRauschen(hell, p, 0.05), latz(p, breite: 0.40) * 0.65)
        c *= 0.92 + 0.14 * fbm(p * V(5, 12, 5))
        return c
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: nasePos, r: V(0.17, 0.12, 0.12), farbe: hex("#1A1314"))
    // Zunge: haengt zwischen den Unterkieferzaehnen etwas heraus.
    w.addChildNode(perle(V(0, -0.50, 1.36), V(0.13, 0.05, 0.20), farbe: NSColor(calibratedRed: 0.86, green: 0.42, blue: 0.46, alpha: 1), rauheit: 0.4))
    augenEinsetzen(w, kopf, x: 0.32, y: 0.20, r: 0.125, iris: NSColor(calibratedRed: 0.40, green: 0.22, blue: 0.09, alpha: 1), pupille: 0.60,
                   ausdruck: Ausdruck(oben: 0.10, unten: 0.16, schraeg: 0.10, funke: 1.4, wange: 0))
    w.eulerAngles = SCNVector3(0.08, 0.52, 0.05)
    return (w, 7.8, V(0, 0.10, 0.2))
}

// ---------- Eule (Waldkauz) ----------

func eule() -> (SCNNode, Float, V) {
    // Waldkauz, zweiter Neubau: Kopf und Leib als EIN eifoermiger Umriss (der Kauz hat keinen sichtbaren Hals),
    // Kopf breiter als die Schultern. Gesichtsschleier mit schmalem, unterbrochenem dunklem Saum, Ringe um die Augen,
    // helle Brauen und Borstenfedern um den Hakenschnabel. Gefieder in Federreihen mit Wurmlinien und Schaftstrichen;
    // die gefalteten Fluegel liegen mit Kante sichtbar an der Seite. Das Zwinkern bleibt (Entscheidung des Inhabers).
    let rotbraun = hex("#8E5F3A"), graubraun = hex("#7C6A55"), schleier = hex("#C3A57F"), dunkel = hex("#3A2618"), hell = hex("#E9DCC2")
    let augeX: Float = 0.30, augeY: Float = 0.30
    func gefieder(_ p: V) -> V {
        var c = mische(farbeMitRauschen(rotbraun, p, 0.08), farbeMitRauschen(graubraun, p, 0.08), fbm(p * 1.6))
        // Marmorierung aus unregelmaessigen Zellen: dunkle Federmitten, helle Raender (Reihen lasen sich als Cord).
        let z = zellen(p * V(1, 0.6, 1) + 0.15 * V(fbm(p * 3), 0, fbm(p * 3 + 4)), 10)
        c *= 0.80 + 0.30 * z.wert
        c = mische(c, dunkel, glatt(0.02, 0.07, z.rand) * glatt(0.40, 0.75, z.wert) * 0.60)
        c = mische(c, hell, glatt(0.018, 0.0, z.rand) * 0.14)
        let fein = zellen(p + 7, 17)
        c = mische(c, dunkel, glatt(0.015, 0.0, fein.rand) * 0.18)
        return c
    }
    var kopf = Koerper(formen: [
        Form(art: .ellipsoid(V(0.84, 0.74, 0.72)), mitte: V(0, 0.30, -0.04)),
        // EINE flache Gesichtsscheibe (zwei getrennte lasen sich als Brille), um jedes Auge leicht vertieft.
        Form(art: .ellipsoid(V(0.76, 0.62, 0.18)), mitte: V(0, 0.26, 0.44), weich: 0.28),
        Form(art: .ellipsoid(V(0.24, 0.24, 0.06)), mitte: V(-augeX, augeY, 0.68), weich: 0.12, abziehen: true),
        Form(art: .ellipsoid(V(0.24, 0.24, 0.06)), mitte: V(augeX, augeY, 0.68), weich: 0.12, abziehen: true),
        Form(art: .ellipsoid(V(0.08, 0.26, 0.10)), mitte: V(0, 0.28, 0.60), weich: 0.10),
    ], farbe: { p, n in
        var c = gefieder(p)
        // Helle Tropfen am Scheitel und an der Schulter.
        let tz = zellen(p + 3, 11)
        c = mische(c, hell, glatt(0.10, 0.17, tz.rand) * glatt(0.72, 0.88, tz.wert) * glatt(0.0, 0.40, p.y) * 0.80)
        // Schleier: innen graubraun mit Ringen und Strahlen um jedes Auge.
        let sx: Float = p.x < 0 ? -1 : 1
        let d = V(p.x - augeX * sx, p.y - augeY, 0)
        let abst = simd_length(d), winkel = atan2f(d.y, d.x)
        let vorn = glatt(0.10, 0.40, n.z)
        let innen = region(p, V(0, 0.26, 0.54), V(0.72, 0.58, 0.36), 0.05) * vorn
        let ring = 0.90 + 0.10 * sinf(abst * 46 + 2 * fbm(p * 8))
        let strahl = 0.88 + 0.12 * sinf(winkel * 36 + 3 * fbm(p * 7)) * glatt(0.12, 0.22, abst)
        c = mische(c, farbeMitRauschen(schleier, p, 0.06) * ring * strahl, innen)
        // Dunkler Saum nur am Rand der Scheibe, unterbrochen.
        c = mische(c, dunkel, (1 - innen) * region(p, V(0, 0.26, 0.54), V(0.79, 0.65, 0.40), 0.04) * vorn * (0.45 + 0.45 * fbm(p * 9)))
        // Um jedes Auge ein dunklerer Hof.
        c = mische(c, mische(schleier, dunkel, 0.55), region(p, V(augeX * sx, augeY, 0.62), V(0.24, 0.24, 0.30), 0.35) * innen * 0.55)
        // Helle Brauen innen ueber den Augen und der helle Steg mit Borstenfedern zum Schnabel.
        let braue = region(p, V(0.12 * sx, 0.50, 0.62), V(0.12, 0.05, 0.16), 0.4)
        let steg = region(p, V(0, 0.30, 0.66), V(0.07, 0.24, 0.14), 0.3)
        c = mische(c, hell, max(braue, steg) * 0.78)
        return c
    }, rauheit: 0.88, fell: 0.05)
    kopf.haar = haarKarte(kopf, FellKarte(kopf: 0.045, rumpf: 0.065, nase: V(0, 0.16, 0.72), schnauze: 0.22,
        augen: augenStellen(kopf, x: augeX, y: augeY), augenR: 0.18, braue: 0), braue: { _ in 0 })
    kopf.fellArt = Fell(dichte: 125, dicke: 0.46, aufrecht: 0.36, neigung: 1.6, ursprung: V(0, 0.16, 0.72), wurzel: 0.56, spitze: 1.14, straehnen: 0.45, streuung: 0.20)
    let leib: [Form] = [
        // Eifoermig: oben so breit wie der Kopfansatz, unten am breitesten.
        Form(art: .ellipsoid(V(0.96, 0.78, 0.78)), mitte: V(0, -0.40, -0.08), weich: 0.52),
        Form(art: .ellipsoid(V(1.12, 1.25, 0.94)), mitte: V(0, -1.35, -0.12), weich: 0.42),
        // Gefaltete Fluegel mit sichtbarer Vorderkante.
        Form(art: .ellipsoid(V(0.26, 0.95, 0.62)), mitte: V(-0.98, -1.15, -0.30), drehung: simd_quatf(angle: 0.08, axis: V(0, 0, 1)), weich: 0.08),
        Form(art: .ellipsoid(V(0.26, 0.95, 0.62)), mitte: V(0.98, -1.15, -0.30), drehung: simd_quatf(angle: -0.08, axis: V(0, 0, 1)), weich: 0.08),
    ]
    let k = brustbild(kopf, leib, farbe: { p, n in
        var c = gefieder(p)
        let vorn = glatt(0.05, 0.35, n.z)
        let unten = vorn * glatt(-0.40, -0.80, p.y) * glatt(0.85, 0.65, abs(p.x))
        // Brust hell gelbbraun mit dunklen Schaftstrichen und feinen Querbaendern (ergibt Kreuzchen).
        var brust = farbeMitRauschen(mische(hell, rotbraun, 0.30), p, 0.06)
        let lang = zellen(V(p.x, p.y * 0.40, p.z), 13)
        brust = mische(brust, hex("#4A3220"), glatt(0.40, 0.65, lang.wert) * glatt(0.012, 0.035, lang.rand) * 0.75)
        brust *= 0.86 + 0.14 * glatt(0.3, 0.7, sinf(p.y * 34 + 4 * fbm(p * 4)) * 0.5 + 0.5)
        brust *= 0.90 + 0.14 * federn(p, 10)
        c = mische(c, brust, unten * 0.85)
        // Fluegel: helle Tupfen auf den Deckfedern, gebaenderte Schwingen.
        let fl = glatt(0.80, 0.92, abs(p.x)) * glatt(-0.50, -0.80, p.y)
        let tz = zellen(p, 10)
        let tupfen = glatt(0.12, 0.20, tz.rand) * glatt(0.6, 0.8, tz.wert)
        let band = glatt(0.4, 0.6, sinf(p.y * 14 + p.z * 3) * 0.5 + 0.5) * glatt(-1.2, -1.5, p.y)
        c = mische(c, mische(mische(c * 0.85, hell, tupfen * 0.75), c * 0.6, band * 0.5), fl)
        return c
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    // Hakenschnabel: hornfarben, kurz, steil nach unten gebogen, der Grund in den Borstenfedern.
    let ober = bogen([V(0, 0.30, 0.62), V(0, 0.27, 0.74), V(0, 0.17, 0.80), V(0, 0.06, 0.78), V(0, 0.01, 0.73)],
                     [0.075, 0.065, 0.048, 0.026, 0.010], schmal: 0.75)
    schnabel(w, ober.formen, farbe: { p in mische(hex("#D9C38E"), hex("#B79B62"), glatt(0.3, 1.0, ober.t(p))) }, lack: 0.5, rauheit: 0.32)
    augenEinsetzen(w, kopf, x: augeX, y: augeY, r: 0.19, tiefe: 0.46, iris: NSColor(calibratedRed: 0.13, green: 0.07, blue: 0.04, alpha: 1), pupille: 0.70, aussen: 0.1, ausdruck: Ausdruck(oben: 0.12, unten: 0.12, schraeg: 0.06, funke: 1.4, wange: 0, zwinkern: true))
    w.eulerAngles = SCNVector3(0.04, 0.26, 0.06)
    return (w, 8.2, V(0, -0.30, 0.10))
}

// ---------- Wal ----------

func wal() -> (SCNNode, Float, V) {
    // Nach dem Buckelwal: flacher, breiter Kopf mit Hoeckerchen, lange helle Brustflossen, kleine
    // Rueckenfinne, waagerechte Fluke, Kehlfurchen. Matte, fein marmorierte Haut statt Plastik.
    let blau = hex("#2E3944"), bauch = hex("#DDE1E3"), flosseHell = hex("#ECEFEF")
    var formen: [Form] = [
        Form(art: .rundkegel(V(-2.7, 0.36, 0), 0.66, 0.13), mitte: V(0.75, -0.1, 0), stauchung: V(1, 0.78, 1)),
        Form(art: .ellipsoid(V(0.88, 0.46, 0.60)), mitte: V(0.60, -0.18, 0), weich: 0.4),
        // Rueckenfinne: klein, weit hinten.
        Form(art: .rundkegel(V(-0.22, 0.17, 0), 0.10, 0.025), mitte: V(-1.05, 0.40, 0), stauchung: V(1, 1, 0.35), weich: 0.08),
    ]
    let flossen: [Form] = [-1, 1].flatMap { (s: Float) -> [Form] in [
        // Fluke: waagerecht, nach hinten gepfeilt.
        Form(art: .ellipsoid(V(0.22, 0.045, 0.52)), mitte: V(-2.05, 0.30, 0.38 * s),
             drehung: simd_quatf(angle: 0.55 * s, axis: V(0, 1, 0)), weich: 0.10),
        // Brustflosse: lang und schmal, an der Flanke angesetzt, nach hinten unten aussen.
        Form(art: .rundkegel(V(-0.95, -0.55, 0.62 * s), 0.14, 0.04), mitte: V(0.48, -0.40, 0.40 * s), stauchung: V(1, 0.4, 1), weich: 0.10),
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
        seitenAuge(w, koerper, x: 1.04, y: 0.0, tiefe: 0.04, sz: sz, r: 0.10,
                   iris: NSColor(calibratedRed: 0.14, green: 0.11, blue: 0.10, alpha: 1), pupille: 0.7,
                   Ausdruck(oben: 0.22, unten: 0.15, funke: 1.5))
    }
    w.eulerAngles = SCNVector3(-0.12, .pi + 0.62, 0)
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
        Form(art: .ellipsoid(V(0.80, 0.30, 0.035)), mitte: V(-1.40, 0.34, 0), drehung: simd_quatf(angle: 0.62, axis: V(0, 0, 1)), weich: 0.15),
        Form(art: .ellipsoid(V(0.80, 0.30, 0.035)), mitte: V(-1.40, -0.34, 0), drehung: simd_quatf(angle: -0.62, axis: V(0, 0, 1)), weich: 0.15),
        // Rueckenflosse, Bauchflossen
        Form(art: .ellipsoid(V(0.58, 0.44, 0.035)), mitte: V(-0.05, 0.70, 0), drehung: simd_quatf(angle: -0.35, axis: V(0, 0, 1)), weich: 0.12),
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
        // Strahlen kraeftig, zum Rand hin heller Saum — so lesen sich die Flossen duenn statt ausgeschnitten.
        let strahl = sinf(atan2f(p.y, p.x + 1) * 34) * 0.5 + 0.5
        let saum = glatt(1.45, 2.05, simd_length(V(p.x + 0.2, p.y * 1.3, 0)))
        c = mische(c, mische(flosse * (0.72 + 0.5 * strahl), V(1, 0.93, 0.78), saum * 0.75), flossen)
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
    w.eulerAngles = SCNVector3(0.08, -0.88, 0.04)
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
        seitenAuge(w, hautK, x: 1.52, y: 0.21, tiefe: 0.05, sz: sz, r: 0.11,
                   iris: NSColor(calibratedRed: 0.36, green: 0.26, blue: 0.10, alpha: 1), pupille: 0.62,
                   Ausdruck(oben: 0.14, unten: 0.10, schraeg: 0.10, funke: 1.7))
    }
    w.eulerAngles = SCNVector3(-0.22, .pi + 1.30, 0)
    return (w, 9.2, V(0.05, 0.0, 0))
}

// ---------- Runde 160: zwei Meerestiere, vier Voegel (Auftrag des Inhabers) ----------

func delfin() -> (SCNNode, Float, V) {
    // Grosser Tuemmler, von a bis z neu: runde Melone, die mit einem deutlichen Falz in den kurzen Schnabel
    // uebergeht; der Unterkiefer ragt etwas vor. Kleines Auge knapp hinter dem Mundwinkel, darueber ein dunkler
    // Augenstreif zum Schnabel. Dunkler Rueckenmantel, graue Flanke, heller Bauch; nasse, glaenzende Haut.
    let mantel = hex("#3A4652"), grau = hex("#8794A0"), bauch = hex("#E6E9EA")
    var formen: [Form] = [
        // Rumpf: spindelfoermig, hinter dem Kopf am dicksten.
        Form(art: .rundkegel(V(-2.2, 0.30, 0), 0.60, 0.13), mitte: V(0.40, -0.06, 0), stauchung: V(1, 0.92, 0.94)),
        Form(art: .ellipsoid(V(0.86, 0.48, 0.46)), mitte: V(0.50, -0.04, 0), weich: 0.40),
        // Melone: die runde Stirn vor dem Blasloch.
        Form(art: .ellipsoid(V(0.40, 0.36, 0.38)), mitte: V(1.02, 0.02, 0), weich: 0.30),
        // Schnabel: oben schlanker, unten etwas laenger.
        Form(art: .rundkegel(V(0.46, -0.03, 0), 0.17, 0.10), mitte: V(1.30, -0.16, 0), stauchung: V(1, 0.82, 1.12), weich: 0.12),
        Form(art: .rundkegel(V(0.58, 0.02, 0), 0.16, 0.095), mitte: V(1.18, -0.28, 0), stauchung: V(1, 0.78, 1.08), weich: 0.12),
        // Kehle: weich unter dem Kopf.
        Form(art: .ellipsoid(V(0.50, 0.30, 0.40)), mitte: V(0.80, -0.32, 0), weich: 0.30),
        // Falz zwischen Melone und Schnabel, und das Blasloch.
        Form(art: .rundkegel(V(0, 0.10, 0.34), 0.028, 0.028), mitte: V(1.36, -0.07, -0.17), weich: 0.05, abziehen: true),
        Form(art: .ellipsoid(V(0.03, 0.03, 0.07)), mitte: V(0.52, 0.52, 0), weich: 0.03, abziehen: true),
    ]
    // Rueckenfinne: sichelfoermig nach hinten gebogen, aus drei Stuecken.
    let finne: [V] = [V(-0.30, 0.42, 0), V(-0.46, 0.72, 0), V(-0.68, 0.92, 0), V(-0.92, 1.00, 0)]
    for (i, r) in [(0, Float(0.20)), (1, 0.12), (2, 0.06)] {
        formen.append(Form(art: .rundkegel(finne[i + 1] - finne[i], r, r * 0.55 + 0.012), mitte: finne[i] + V(Float(i) * 0.04, 0, 0),
                           stauchung: V(1, 1, 0.28), weich: 0.10))
    }
    formen.append(Form(art: .ellipsoid(V(0.48, 0.24, 0.10)), mitte: V(-0.20, 0.40, 0), weich: 0.18))   // Finnenansatz
    for s: Float in [-1, 1] {
        // Brustflossen: schmal, nach hinten unten gerichtet.
        formen.append(Form(art: .rundkegel(V(-0.34, -0.30, 0.36 * s), 0.13, 0.035), mitte: V(0.48, -0.34, 0.30 * s), stauchung: V(1, 1, 0.45), weich: 0.10))
        // Fluke hinten, waagerecht.
        formen.append(Form(art: .ellipsoid(V(0.17, 0.035, 0.36)), mitte: V(-1.82, 0.26, 0.26 * s), drehung: simd_quatf(angle: 0.6 * s, axis: V(0, 1, 0)), weich: 0.10))
    }
    let k = Koerper(formen: formen, farbe: { p, n in
        // Gegenschattierung: Mantel oben, Flanke grau, Bauch hell; die Grenzen wellen sich leicht.
        let welle = 0.05 * sinf(p.x * 2.6 + 0.8) + 0.03 * (fbm(p * 2.2) - 0.5)
        var c = mische(farbeMitRauschen(grau, p, 0.05), farbeMitRauschen(mantel, p, 0.05), glatt(0.02, 0.22, p.y + welle - 0.10 * p.x))
        c = mische(c, farbeMitRauschen(bauch, p, 0.03), glatt(-0.12, -0.30, p.y + welle + 0.04 * p.x))
        // Heller Zuegel vom Schnabel unter dem Auge hindurch, darueber der dunkle Augenstreif.
        for sz: Float in [-1, 1] {
            let seite = glatt(0.05, 0.25, p.z * sz)
            c = mische(c, mische(mantel, grau, 0.3), region(p, V(1.10, 0.0, 0.30 * sz), V(0.34, 0.06, 0.25), 0.5) * seite * 0.55)
            c = mische(c, mantel * 0.8, region(p, V(0.86, 0.02, 0.36 * sz), V(0.10, 0.08, 0.15), 0.4) * seite * 0.7)
        }
        // Schnabelspitze und Unterkiefer etwas heller, der Falz dunkler.
        c = mische(c, c * 0.62, glatt(0.10, 0.0, abs(p.x - 1.36 + 0.25 * p.y * p.y)) * glatt(-0.20, -0.05, p.y) * glatt(0.06, -0.06, p.y + 0.02) * 0.9)
        c = mische(c, mische(grau, bauch, 0.5), glatt(1.55, 1.85, p.x) * glatt(-0.10, -0.25, p.y) * 0.6)
        // Feine Hautnarben und Kratzer, wie bei jedem echten Tier.
        let kratzer = glatt(0.92, 0.99, wertRauschen(p * V(3, 40, 3)))
        c *= 1 - 0.07 * kratzer
        return c
    }, rauheit: 0.50, fell: 0.012, lack: 0.35)
    let mitLaecheln = mitMaul(k, Maul(kurven: [Kurve(punkte: [V(1.80, -0.23, 0.06), V(1.83, -0.225, 0), V(1.80, -0.23, -0.06)], spitzVorn: false, spitzHinten: false)]
        + paar(Kurve(punkte: [V(1.80, -0.23, 0.06), V(1.58, -0.235, 0.11), V(1.40, -0.225, 0.15), V(1.24, -0.205, 0.20), V(1.10, -0.17, 0.26), V(1.00, -0.10, 0.30)], spitzVorn: false), achse: 2),
        r: 0.020, farbe: hex("#2A333B"), staerke: 0.8))
    let w = SCNNode(); w.addChildNode(kopfKnoten(mitLaecheln, grenze: 2.2, n: 240))
    for sz: Float in [-1, 1] {
        seitenAuge(w, mitLaecheln, x: 0.90, y: 0.00, tiefe: 0.03, sz: sz, r: 0.068,
                   iris: NSColor(calibratedRed: 0.20, green: 0.13, blue: 0.09, alpha: 1), pupille: 0.62,
                   Ausdruck(oben: 0.22, unten: 0.14, funke: 1.5))
    }
    w.eulerAngles = SCNVector3(-0.08, .pi + 0.62, 0.04)
    return (w, 9.0, V(-0.10, 0.10, 0))
}

func seeotter() -> (SCNNode, Float, V) {
    // Seeotter: runder Kopf, im Alter hell; breite, puschelige Schnurrhaarpolster (Flaechen, keine
    // Striche — Lehre aus drei Versuchen), kleine Ohren tief an der Seite, dichtes kurzes Fell.
    let braun = hex("#5B3B27"), kopfHell = hex("#CBB497"), polster = hex("#E3D3BD")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.92, 0.80, 0.84)), mitte: V(0, 0.08, 0)),
        Form(art: .ellipsoid(V(0.32, 0.25, 0.25)), mitte: V(-0.23, -0.27, 0.80), weich: 0.18),
        Form(art: .ellipsoid(V(0.32, 0.25, 0.25)), mitte: V(0.23, -0.27, 0.80), weich: 0.18),
        Form(art: .ellipsoid(V(0.20, 0.15, 0.18)), mitte: V(0, -0.38, 0.74), weich: 0.16),
    ]
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.14, 0.12, 0.08)), mitte: V(0.76 * sx, 0.36, -0.08), weich: 0.10))
    }
    formen += lider(0.33, 0.20, 0.70, 0.12)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(kopfHell, p, 0.07)
        // nach hinten und unten das dunkle Koerperfell
        // Nur der Kopf hell, ab Hals und Nacken dunkelbraun (Seeotter, kein Robbenbaby).
        c = mische(c, farbeMitRauschen(braun, p, 0.08), min(1, glatt(-0.05, -0.45, p.z) + glatt(-0.30, -0.60, p.y)))
        let pol = max(region(p, V(-0.21, -0.26, 0.98), V(0.27, 0.21, 0.24), 0.3), region(p, V(0.21, -0.26, 0.98), V(0.27, 0.21, 0.24), 0.3))
        c = mische(c, farbeMitRauschen(polster, p, 0.04), pol)
        return c
    }, rauheit: 0.80, fell: 0.07)
    var (braue, braueM) = mitBrauen(kopf, x: 0.30, y: 0.38, laenge: 0.11, dicke: 0.05, winkel: 0.20, farbe: mische(kopfHell, polster, 0.5), staerke: 0.6)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.06, rumpf: 0.09, nase: V(0, -0.12, 1.02), schnauze: 0.35,
        augen: augenStellen(kopf, x: 0.36, y: 0.22), augenR: 0.10,
        zonen: beide(V(0.21, -0.26, 0.85), V(0.27, 0.21, 0.23), 0.8)), braue: braueM)
    braue.fellArt = Fell(dichte: 75, ursprung: V(0, -0.12, 1.10), straehnen: 0.4)
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.24, 1.03), V(0, -0.33, 1.00), V(0, -0.40, 0.95)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.40, 0.95), V(0.07, -0.44, 0.92), V(0.15, -0.42, 0.86)], spitzVorn: false)),
        r: 0.028, farbe: hex("#2B1C14"), staerke: 0.8))
    let bau = Bau(brust: 1.30, tiefe: 1.0, hals: 0.62, bein: 0.24, beinAbstand: 0.30, ruecken: 0.8, rueckenHoehe: -0.85)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(braun, p, 0.08), farbeMitRauschen(kopfHell, p, 0.06), latz(p, breite: 0.22) * 0.12)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.12, 1.02), r: V(0.19, 0.12, 0.10), farbe: hex("#1A1310"))
    augenEinsetzen(w, kopf, x: 0.36, y: 0.22, r: 0.10, iris: NSColor(calibratedRed: 0.12, green: 0.08, blue: 0.06, alpha: 1), pupille: 0.7, ausdruck: Ausdruck(oben: 0.08, unten: 0.04, schraeg: 0.15, funke: 1.7))
    w.eulerAngles = SCNVector3(0.04, 0.20, -0.05)
    return (w, 7.3, V(0, 0.15, 0))
}

// Gemeinsamer Vogelrumpf: Kopf, der in einen runden Leib uebergeht, Fluegel an den Seiten.
// Vogelfuesse (Runde 163, Auftrag des Inhabers): kurzes Bein unter dem Bauch, drei Zehen nach vorn —
// weiche, abgeflachte Flaechen statt duenner Striche (Lehre: Striche mit runden Enden wirken auf
// Avatargroesse fremd). `breit` = Schwimmhaut (Pinguin), `kralle` = dunkle Spitzen (Eule).
// Federn als Schuppenmuster: gegeneinander versetzte Reihen, jede Feder unten heller gesaeumt, zur Wurzel dunkler.
// Unregelmaessig verschoben, sonst liest sich das Muster als Strickware. `zelle` liefert dazu den Wert je Feder.
func federn(_ p: V, _ skala: Float) -> Float { federZelle(p, skala).saum }
func federZelle(_ p: V, _ skala: Float) -> (saum: Float, wert: Float, v: Float) {
    let q = V(p.x * skala, p.y * skala * 1.4, p.z * skala)
    let y = q.y + 0.6 * (fbm(p * 2.3) - 0.5)
    let reihe = y.rounded(.down)
    let x = q.x + q.z * 0.6 + 0.5 * reihe.truncatingRemainder(dividingBy: 2) + 0.8 * (fbm(p * 1.7 + 5) - 0.5)
    let u = x - x.rounded(.down) - 0.5, v = y - reihe
    let wert = wertRauschen(V(x.rounded(.down), reihe, 3))
    return (glatt(0.15, 0.0, v - 0.1 - 1.2 * u * u) * (0.5 + 0.5 * wert), wert, v)
}

// ---------- Schnaebel ----------
// Ein Schnabel ist Horn, kein Knubbel: Kreisquerschnitte entlang einer Kurve (Catmull-Rom durch `punkte`), seitlich
// zusammengedrueckt (`schmal` < 1). Die Farbe haengt von der Stelle entlang der Kurve ab (0 Grund … 1 Spitze).
struct Bogen {
    var formen: [Form] = []
    var proben: [(V, Float)] = []
    func t(_ p: V) -> Float { proben.min(by: { simd_length($0.0 - p) < simd_length($1.0 - p) })?.1 ?? 0 }
}
func bogen(_ punkte: [V], _ radien: [Float], schmal: Float, schritte: Int = 10, weich: Float = 0.02) -> Bogen {
    var b = Bogen(), kette: [(V, Float)] = []
    let n = punkte.count
    for i in 0..<(n - 1) {
        let p0 = punkte[max(0, i - 1)], p1 = punkte[i], p2 = punkte[i + 1], p3 = punkte[min(n - 1, i + 2)]
        for j in 0..<schritte {
            let u = Float(j) / Float(schritte), u2 = u * u, u3 = u2 * u
            let q = 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 + (-p0 + 3 * p1 - 3 * p2 + p3) * u3)
            kette.append((q, radien[i] + (radien[i + 1] - radien[i]) * u))
        }
    }
    kette.append((punkte[n - 1], radien[n - 1]))
    let gesamt = Float(kette.count - 1)
    for i in 0..<(kette.count - 1) {
        // Stauchung wirkt um `mitte`: jedes Stueck liegt mittig auf x = 0, darum nur seitlich schmal.
        b.formen.append(Form(art: .rundkegel(kette[i + 1].0 - kette[i].0, kette[i].1, kette[i + 1].1), mitte: kette[i].0,
                             stauchung: V(schmal, 1, 1), weich: weich))
        b.proben.append((kette[i].0, Float(i) / gesamt))
    }
    b.proben.append((kette.last!.0, 1))
    return b
}
func schnabel(_ w: SCNNode, _ formen: [Form], farbe: @escaping (V) -> V, lack: Float = 0.45, rauheit: Float = 0.35, n: Int = 380) {
    let k = Koerper(formen: formen, farbe: { p, _ in farbe(p) * (0.94 + 0.10 * fbm(p * 24)) })
    w.addChildNode(glanzKoerper(k, grenze: 2.2, n: n, rauheit: rauheit, lack: lack))
}

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
    // Runde 191, neues Modell (Auftrag des Inhabers: realistischer, „egal was es braucht"): Koenigspinguin als
    // Brustbild statt Kegelfigur. Gestreckter Kopf mit flach abfallender Stirn, langer schlanker Schnabel
    // (unten mit orangem Plaettchen), orange Ohrflecken, goldene Kehle in die weisse Brust, silbergrauer Ruecken.
    let schwarz = hex("#15171A"), silber = hex("#7D8894"), weiss = hex("#F5F4EF")
    let gold = hex("#F3BE48"), orange = hex("#F08B2C")
    var kopf = Koerper(formen: [
        Form(art: .ellipsoid(V(0.52, 0.48, 0.80)), mitte: V(0, 0.30, -0.02)),
        // Gesicht nach vorn-unten: die Stirn faellt flach in den Schnabel ab (gestreckter, flacher Kopf).
        Form(art: .ellipsoid(V(0.34, 0.27, 0.46)), mitte: V(0, 0.22, 0.50), weich: 0.30),
    ], farbe: { p, n in
        var c = farbeMitRauschen(schwarz, p, 0.05)
        // Ohrfleck: ein Tropfen hinter dem Auge, oben breit, zum Hals hin schmal.
        for sx: Float in [-1, 1] {
            // Ohrfleck als Komma: oben breit hinter dem Auge, unten schmal zum Hals.
            let ohr = max(region(p, V(0.44 * sx, 0.16, -0.06), V(0.20, 0.20, 0.24), 0.05),
                          max(region(p, V(0.40 * sx, -0.08, 0.02), V(0.14, 0.18, 0.15), 0.05), region(p, V(0.36 * sx, -0.32, 0.14), V(0.11, 0.22, 0.14), 0.05)))
            c = mische(c, farbeMitRauschen(orange, p, 0.04), ohr)
        }
        // Goldene Kehle vorn unter dem Schnabel.
        c = mische(c, farbeMitRauschen(gold, p, 0.04), glatt(-0.08, -0.20, p.y) * glatt(0.25, 0.55, n.z))
        return c
    }, rauheit: 0.50, fell: 0.02)
    kopf.haar = haarKarte(kopf, FellKarte(kopf: 0.012, rumpf: 0.016, nase: V(0, 0.20, 0.82), schnauze: 0.2,
        augen: augenStellen(kopf, x: 0.30, y: 0.29), augenR: 0.10, braue: 0), braue: { _ in 0 })
    kopf.fellArt = Fell(dichte: 180, dicke: 0.46, aufrecht: 0.18, neigung: 1.9, ursprung: V(0, 0.20, 0.82), wurzel: 0.82, spitze: 1.08, straehnen: 0.04, streuung: 0.05)
    let leib: [Form] = [
        Form(art: .ellipsoid(V(0.62, 0.72, 0.64)), mitte: V(0, -0.42, -0.10), weich: 0.35),
        // Die Brust woelbt sich nach vorn — beim Koenigspinguin die goldene „Latz"-Flaeche.
        Form(art: .ellipsoid(V(0.96, 1.36, 0.92)), mitte: V(0, -1.55, -0.16), weich: 0.35),
        Form(art: .ellipsoid(V(0.12, 0.74, 0.30)), mitte: V(-0.94, -1.78, -0.30), drehung: simd_quatf(angle: 0.12, axis: V(0, 0, 1)), weich: 0.10),
        Form(art: .ellipsoid(V(0.12, 0.74, 0.30)), mitte: V(0.94, -1.78, -0.30), drehung: simd_quatf(angle: -0.12, axis: V(0, 0, 1)), weich: 0.10),
    ]
    let k = brustbild(kopf, leib, farbe: { p, n in
        // Ruecken silbergrau, nach oben zum Hals schwarz.
        var c = mische(farbeMitRauschen(silber, p, 0.06), schwarz, glatt(-0.75, -0.30, p.y))
        let vorn = glatt(0.10, 0.30, n.z)
        // Dunkle Trennlinie zwischen Brust und Flanke.
        c = mische(c, schwarz, glatt(0.02, 0.10, n.z) * glatt(0.22, 0.12, n.z) * glatt(-0.40, -0.80, p.y) * 0.8)
        // Brust: oben golden, nach unten weiss.
        let brust = mische(farbeMitRauschen(gold, p, 0.04), farbeMitRauschen(weiss, p, 0.03), glatt(-0.75, -1.25, p.y))
        c = mische(c, brust, vorn * glatt(-0.20, -0.45, p.y))
        // Der Ohrfleck laeuft seitlich am Hals hinunter zur goldenen Brust.
        for sx: Float in [-1, 1] { c = mische(c, orange, region(p, V(0.34 * sx, -0.30, 0.10), V(0.12, 0.30, 0.14), 0.06) * 0.85) }
        return c
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    // Oberschnabel lang und schlank, leicht abwaerts; Unterschnabel schwarz mit orangem Plaettchen an der Seite.
    // Geschlossen und leicht abwaerts gebogen: zwei Stuecke, das vordere staerker geneigt.
    nase(w, [Form(art: .rundkegel(V(0, -0.07, 0.62), 0.11, 0.06), mitte: V(0, 0.22, 0.86), stauchung: V(0.70, 1, 1), weich: 0.05),
             Form(art: .rundkegel(V(0, -0.17, 0.46), 0.065, 0.028), mitte: V(0, 0.15, 1.48), stauchung: V(0.70, 1, 1), weich: 0.04)],
         farbe: hex("#141416"), lack: 0.55, rauheit: 0.35, n: 360)
    // Unterschnabel dicht darunter, mit dem orangen Plaettchen laengs an der Seite.
    nase(w, [Form(art: .rundkegel(V(0, -0.16, 0.96), 0.075, 0.026), mitte: V(0, 0.11, 0.86), stauchung: V(0.72, 1, 1), weich: 0.03)],
         farbe: hex("#1A1A1C"), lack: 0.5, rauheit: 0.4, n: 360)
    nase(w, [Form(art: .rundkegel(V(0, -0.07, 0.50), 0.05, 0.02), mitte: V(-0.042, 0.095, 0.92), weich: 0.02),
             Form(art: .rundkegel(V(0, -0.07, 0.50), 0.05, 0.02), mitte: V(0.042, 0.095, 0.92), weich: 0.02)],
         farbe: hex("#F07A3A"), lack: 0.6, rauheit: 0.3, n: 360)
    augenEinsetzen(w, kopf, x: 0.30, y: 0.29, r: 0.10, tiefe: 0.36, iris: NSColor(calibratedRed: 0.24, green: 0.13, blue: 0.08, alpha: 1), pupille: 0.62, aussen: 0.15, ausdruck: Ausdruck(oben: 0.06, unten: 0.04, funke: 1.5))
    // Schwarze Lider auf schwarzem Kopf tragen keinen Ausdruck — beim Pinguin zeigt die Haltung die Stimmung:
    // muede gesenkt, froh angehoben und leicht schraeg.
    let haltung: (Float, Float) = STIMMUNG == .muede ? (0.20, 0) : (STIMMUNG == .froh ? (-0.12, 0.10) : (0.05, 0))
    w.eulerAngles = SCNVector3(haltung.0, 0.48, haltung.1)
    return (w, 8.4, V(0, -0.15, 0.25))
}

func papagei() -> (SCNNode, Float, V) {
    // Runde 192, neues Modell: Hellroter Ara als Brustbild. Grosser Hakenschnabel (oben elfenbein, unten schwarz),
    // nackte weisse Gesichtshaut mit feinen roten Federlinien, kleines gelbliches Auge; Kopf und Brust rot, an den
    // Fluegeln gelbe Deckfedern ueber blauen Schwingen.
    let rot = hex("#C42A1E"), haut = hex("#F3EEE8"), gelb = hex("#E9B43A"), blau = hex("#2F5FB0"), gruen = hex("#4E8A4A")
    var kopf = Koerper(formen: [
        Form(art: .ellipsoid(V(0.60, 0.55, 0.66)), mitte: V(0, 0.32, 0)),
        Form(art: .ellipsoid(V(0.42, 0.40, 0.40)), mitte: V(0, 0.26, 0.34), weich: 0.30),
    ], farbe: { p, n in
        var c = farbeMitRauschen(rot, p, 0.07)
        c *= 0.86 + 0.20 * federn(p, 10)
        // Nackte Gesichtshaut seitlich um das Auge bis zum Schnabel, durchzogen von feinen roten Federlinien.
        for sx: Float in [-1, 1] {
            // Gross, vom Auge bis zum Schnabelansatz; die Linien sind Reihen winziger Federchen, nur angedeutet.
            let feld = max(region(p, V(0.27 * sx, 0.30, 0.50), V(0.30, 0.30, 0.34), 0.06), region(p, V(0.18 * sx, 0.26, 0.66), V(0.18, 0.22, 0.20), 0.08))
            let linien = glatt(0.86, 0.97, sinf(p.y * 56 + abs(p.x) * 10) * 0.5 + 0.5)
            c = mische(c, mische(farbeMitRauschen(haut, p, 0.03), rot, linien * 0.45), feld)
        }
        return c
    }, rauheit: 0.66, fell: 0.03)
    kopf.haar = haarKarte(kopf, FellKarte(kopf: 0.03, rumpf: 0.06, nase: V(0, 0.26, 0.80), schnauze: 0.25,
        augen: augenStellen(kopf, x: 0.32, y: 0.42), augenR: 0.12, braue: 0), braue: { _ in 0 })
    kopf.fellArt = Fell(dichte: 140, aufrecht: 0.26, neigung: 1.8, ursprung: V(0, 0.26, 0.80), wurzel: 0.64, spitze: 1.16, straehnen: 0.18, streuung: 0.15)
    let leib: [Form] = [
        Form(art: .ellipsoid(V(0.74, 0.70, 0.70)), mitte: V(0, -0.42, -0.10), weich: 0.36),
        Form(art: .ellipsoid(V(0.96, 1.10, 0.86)), mitte: V(0, -1.38, -0.14), weich: 0.36),
        Form(art: .ellipsoid(V(0.22, 0.86, 0.62)), mitte: V(-0.88, -1.25, -0.40), weich: 0.12),
        Form(art: .ellipsoid(V(0.22, 0.86, 0.62)), mitte: V(0.88, -1.25, -0.40), weich: 0.12),
    ]
    let k = brustbild(kopf, leib, farbe: { p, n in
        var c = farbeMitRauschen(rot, p, 0.07)
        let f = federZelle(p, 7)
        c *= 0.84 + 0.22 * f.saum + 0.08 * f.wert
        // Fluegel: gelbe Deckfedern mit gruenen Spitzen in Reihen, darunter blaue Schwingen mit dunklem Schaft.
        let fl = glatt(0.66, 0.82, abs(p.x)) * glatt(-0.55, -0.80, p.y)
        let fd = federZelle(p, 6)
        let deck = mische(mische(gelb, hex("#D99A2B"), fd.wert * 0.5), gruen, glatt(0.55, 0.85, fd.v) * 0.75) * (0.85 + 0.25 * fd.saum)
        let schwinge = mische(blau, hex("#1E3E7A"), glatt(0.4, 0.9, sinf(p.y * 26 + p.z * 4) * 0.5 + 0.5) * 0.5)
        c = mische(c, mische(deck, schwinge, glatt(-1.25, -1.50, p.y)), fl)
        return c
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    // Oberschnabel: hoher, seitlich schmaler Hornbogen, der vorn steil nach unten und zurueck in den Haken laeuft.
    // Elfenbein, an der Spitze dunkel, am Grund der Schneide schwarz.
    let ober = bogen([V(0, 0.36, 0.56), V(0, 0.40, 0.80), V(0, 0.28, 0.98), V(0, 0.04, 1.04), V(0, -0.16, 0.96), V(0, -0.22, 0.86)],
                     [0.28, 0.25, 0.19, 0.12, 0.06, 0.018], schmal: 0.62)
    let unterForm = [Form(art: .ellipsoid(V(0.13, 0.12, 0.13)), mitte: V(0, 0.08, 0.68), stauchung: V(0.85, 1, 1), weich: 0.04),
                     Form(art: .rundkegel(V(0, 0.08, 0.10), 0.08, 0.04), mitte: V(0, 0.02, 0.72), stauchung: V(0.75, 1, 1), weich: 0.04)]
    schnabel(w, ober.formen, farbe: { p in
        let t = ober.t(p)
        var c = mische(hex("#EDE6D8"), hex("#CFC5B4"), glatt(0.2, 0.6, t))
        c = mische(c, hex("#2A2526"), glatt(0.72, 0.92, t))
        c = mische(c, hex("#1E1A1B"), glatt(0.22, 0.10, p.y) * glatt(0.35, 0.15, t) * 0.9)   // schwarzer Fleck am Grund der Schneide
        return c
    }, lack: 0.45, rauheit: 0.32)
    // Unterschnabel schwarz, im Haken.
    schnabel(w, unterForm, farbe: { _ in hex("#221D1F") }, lack: 0.4, rauheit: 0.4)
    augenEinsetzen(w, kopf, x: 0.32, y: 0.42, r: 0.11, tiefe: 0.36, iris: NSColor(calibratedRed: 0.90, green: 0.82, blue: 0.48, alpha: 1), pupille: 0.40, aussen: 0.4, ausdruck: Ausdruck(oben: 0.06, unten: 0.06, funke: 1.5))
    w.eulerAngles = SCNVector3(0.04, -0.86, 0.03)
    return (w, 8.4, V(0, -0.25, 0.15))
}

func flamingo() -> (SCNNode, Float, V) {
    // Rosaflamingo als Kopf-und-Hals-Bildnis: kleiner, hell rosa Kopf, gelbes Auge mit nackter heller Zuegelhaut,
    // schlanker S-Hals. Der Schnabel ist das Gesicht: dick am Grund, in der Mitte scharf nach unten geknickt, der
    // Unterschnabel tiefer als der obere; hell fleischfarben am Grund, rosa in der Mitte, die Spitze schwarz.
    let rosa = hex("#EE9AAE"), hell = hex("#F7D6DD"), koralle = hex("#DE5677"), schwarz = hex("#1C1719")
    var kopf = Koerper(formen: [
        Form(art: .ellipsoid(V(0.40, 0.38, 0.50)), mitte: V(0, 0.36, 0.02)),
        Form(art: .ellipsoid(V(0.26, 0.24, 0.28)), mitte: V(0, 0.30, 0.28), weich: 0.22),
    ], farbe: { p, n in
        var c = mische(farbeMitRauschen(rosa, p, 0.06), hell, glatt(0.30, 0.70, p.y) * 0.35)
        c *= 0.93 + 0.10 * federn(p, 16)
        for sx: Float in [-1, 1] { c = mische(c, hex("#F3E4E0"), region(p, V(0.18 * sx, 0.36, 0.40), V(0.12, 0.10, 0.14), 0.25) * 0.8) }
        return c
    }, rauheit: 0.76, fell: 0.03)
    kopf.haar = haarKarte(kopf, FellKarte(kopf: 0.020, rumpf: 0.035, nase: V(0, 0.34, 0.52), schnauze: 0.2,
        augen: augenStellen(kopf, x: 0.24, y: 0.42), augenR: 0.09, braue: 0), braue: { _ in 0 })
    kopf.fellArt = Fell(dichte: 160, dicke: 0.44, aufrecht: 0.22, neigung: 1.9, ursprung: V(0, 0.34, 0.52), wurzel: 0.76, spitze: 1.10, straehnen: 0.12, streuung: 0.08)
    // Schlanker S-Hals (kubische Bezier aus kurzen Stuecken, sonst knickt er an den Stoessen).
    let h0 = V(0, 0.18, -0.10), h1 = V(0, -0.50, -0.95), h2 = V(0, -0.95, 0.70), h3 = V(0, -1.70, -0.40)
    func hals(_ s: Float) -> V { let u = 1 - s; return u*u*u*h0 + 3*u*u*s*h1 + 3*u*s*s*h2 + s*s*s*h3 }
    var halsFormen: [Form] = []
    for i in 0..<16 {
        let a = Float(i) / 16, b = Float(i + 1) / 16
        halsFormen.append(Form(art: .rundkegel(hals(b) - hals(a), 0.12 + 0.07 * a * a, 0.12 + 0.07 * b * b), mitte: hals(a), weich: 0.16))
    }
    let leib: [Form] = [
        Form(art: .ellipsoid(V(0.66, 0.56, 1.20)), mitte: V(0, -2.15, -1.10), weich: 0.35),
        Form(art: .ellipsoid(V(0.24, 0.42, 1.0)), mitte: V(-0.52, -1.95, -1.25), weich: 0.16),
        Form(art: .ellipsoid(V(0.24, 0.42, 1.0)), mitte: V(0.52, -1.95, -1.25), weich: 0.16),
    ]
    let k = brustbild(kopf, halsFormen + leib, farbe: { p, n in
        var c = mische(farbeMitRauschen(rosa, p, 0.07), farbeMitRauschen(hell, p, 0.05), glatt(-0.2, 0.2, p.y) * 0.5)
        c *= 0.90 + 0.14 * federn(p, 12)
        let fluegel = glatt(0.36, 0.56, abs(p.x)) * glatt(-1.55, -1.80, p.y)
        c = mische(c, farbeMitRauschen(koralle, p, 0.06) * (0.85 + 0.25 * federn(p, 7)), fluegel * 0.85)
        c = mische(c, schwarz, glatt(-1.80, -2.15, p.z) * glatt(-1.65, -1.85, p.y) * 0.92)
        return c
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    // Oberschnabel: gerade nach vorn bis zum Knick, dann steil hinunter.
    let ober = bogen([V(0, 0.40, 0.42), V(0, 0.40, 0.70), V(0, 0.36, 0.92), V(0, 0.22, 1.06), V(0, -0.02, 1.10), V(0, -0.20, 1.04)],
                     [0.12, 0.11, 0.10, 0.085, 0.055, 0.022], schmal: 0.80)
    // Unterschnabel: tiefer Kiel darunter, folgt dem Knick.
    let unter = bogen([V(0, 0.26, 0.44), V(0, 0.20, 0.72), V(0, 0.16, 0.90), V(0, 0.04, 1.00), V(0, -0.14, 1.00)],
                      [0.14, 0.15, 0.12, 0.08, 0.035], schmal: 0.72)
    func schnabelFarbe(_ t: Float) -> V {
        var c = mische(hex("#F2E1D9"), hex("#E9A7B3"), glatt(0.15, 0.40, t))
        c = mische(c, schwarz, glatt(0.50, 0.58, t))
        return c
    }
    schnabel(w, ober.formen, farbe: { p in schnabelFarbe(ober.t(p)) }, lack: 0.40, rauheit: 0.38)
    schnabel(w, unter.formen, farbe: { p in schnabelFarbe(unter.t(p) * 1.05) }, lack: 0.40, rauheit: 0.38)
    augenEinsetzen(w, kopf, x: 0.24, y: 0.42, r: 0.085, tiefe: 0.36, iris: NSColor(calibratedRed: 0.96, green: 0.80, blue: 0.28, alpha: 1), pupille: 0.36, aussen: 0.4, ausdruck: Ausdruck(oben: 0.08, unten: 0.05, funke: 1.4))
    w.eulerAngles = SCNVector3(0.04, 0.95, 0.02)
    return (w, 9.6, V(0.05, -0.60, -0.4))
}

func rotkehlchen() -> (SCNNode, Float, V) {
    // Rotkehlchen, von a bis z neu: aufgeplusterter runder Koerper ohne sichtbaren Hals, das Orange reicht von der
    // Stirn ueber dem Schnabel bis tief auf die Brust, aussen ein blaugrauer Saum. Das grosse dunkle Auge sitzt an
    // der oberen Kante des Orange. Schnabel kurz, spitz und dunkel, zweiteilig. Federn als Schuppenmuster.
    let oliv = hex("#7B6A4C"), orange = hex("#D8622E"), grau = hex("#A3ABB0"), bauch = hex("#F3EFE6")
    var kopf = Koerper(formen: [
        Form(art: .ellipsoid(V(0.62, 0.58, 0.62)), mitte: V(0, 0.30, 0)),
        Form(art: .ellipsoid(V(0.40, 0.32, 0.34)), mitte: V(0, 0.20, 0.34), weich: 0.30),
        // Stirn steigt steil ueber dem Schnabel an.
        Form(art: .ellipsoid(V(0.30, 0.24, 0.26)), mitte: V(0, 0.40, 0.40), weich: 0.24),
    ], farbe: { p, n in
        var c = farbeMitRauschen(oliv, p, 0.08)
        let vorn = max(glatt(-0.05, 0.30, n.z), glatt(0.05, -0.15, p.y) * glatt(0.50, 0.30, abs(p.x)))
        // Orange Maske: Stirn, Zuegel, Wangen bis knapp ueber das Auge; aussen blaugrau gesaeumt.
        // Unter dem Schnabel geht das Orange ohne Saum in die Brust ueber.
        let maske = max(region(p, V(0, 0.16, 0.46), V(0.50, 0.42, 0.42), 0.06), glatt(0.02, -0.12, p.y) * glatt(0.46, 0.30, abs(p.x)))
        c = mische(c, farbeMitRauschen(grau, p, 0.05), region(p, V(0, 0.15, 0.42), V(0.60, 0.50, 0.48), 0.05) * vorn * (1 - glatt(0.0, -0.14, p.y) * glatt(0.50, 0.36, abs(p.x))))
        c = mische(c, farbeMitRauschen(orange, p, 0.06), maske * vorn)
        c *= 0.88 + 0.18 * federn(p, 11)
        return c
    }, rauheit: 0.84, fell: 0.03)
    kopf.haar = haarKarte(kopf, FellKarte(kopf: 0.035, rumpf: 0.085, nase: V(0, 0.20, 0.70), schnauze: 0.22,
        augen: augenStellen(kopf, x: 0.36, y: 0.27), augenR: 0.12, braue: 0), braue: { _ in 0 })
    kopf.fellArt = Fell(dichte: 120, dicke: 0.46, aufrecht: 0.34, neigung: 1.7, schwere: 0.4, ursprung: V(0, 0.20, 0.70), wurzel: 0.66, spitze: 1.12, straehnen: 0.22, streuung: 0.10)
    let leib: [Form] = [
        Form(art: .ellipsoid(V(0.74, 0.66, 0.70)), mitte: V(0, -0.46, -0.04), weich: 0.40),
        // Die aufgeplusterte Brust woelbt sich nach vorn.
        Form(art: .ellipsoid(V(1.04, 1.08, 0.96)), mitte: V(0, -1.32, -0.06), weich: 0.38),
        Form(art: .ellipsoid(V(0.20, 0.74, 0.58)), mitte: V(-0.92, -1.15, -0.40), drehung: simd_quatf(angle: 0.10, axis: V(0, 0, 1)), weich: 0.12),
        Form(art: .ellipsoid(V(0.20, 0.74, 0.58)), mitte: V(0.92, -1.15, -0.40), drehung: simd_quatf(angle: -0.10, axis: V(0, 0, 1)), weich: 0.12),
    ]
    let k = brustbild(kopf, leib, farbe: { p, n in
        var c = farbeMitRauschen(oliv, p, 0.08)
        let vorn = glatt(0.05, 0.35, n.z)
        // Rundes Brustfeld, nach unten schmaler; das blaugraue Band folgt dem Bogen etwas weiter aussen.
        let breite = max(0.0, 0.86 - 0.36 * glatt(-0.7, -1.55, p.y))
        c = mische(c, farbeMitRauschen(grau, p, 0.05), vorn * glatt(breite + 0.18, breite + 0.06, abs(p.x)) * glatt(-1.60, -1.30, p.y))
        c = mische(c, farbeMitRauschen(orange, p, 0.06), vorn * glatt(breite, breite - 0.08, abs(p.x)) * glatt(-1.48, -1.25, p.y))
        c = mische(c, farbeMitRauschen(bauch, p, 0.03), vorn * glatt(-1.30, -1.58, p.y))
        // Fluegel: Deckfedern mit hellen Saeumen, eine feine helle Fluegelbinde, Schwingen dunkler.
        let fl = glatt(0.68, 0.82, abs(p.x)) * glatt(-0.50, -0.80, p.y)
        let deck = mische(hex("#5C4B33"), hex("#A8926C"), federn(p, 9) * 0.7)
        let binde = region(p, V(0.9 * (p.x < 0 ? -1 : 1), -0.95, -0.10), V(0.25, 0.05, 0.6), 0.5) * 0.45
        c = mische(c, mische(mische(deck, hex("#4A3B28"), glatt(-1.2, -1.6, p.y)), hex("#C8B48A"), binde), fl * 0.9)
        c *= 0.92 + 0.12 * federn(p, 8)
        return c
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    // Oberschnabel kurz und spitz, leicht abwaerts; Unterschnabel darunter, etwas heller am Grund.
    nase(w, [Form(art: .rundkegel(V(0, -0.06, 0.32), 0.085, 0.014), mitte: V(0, 0.20, 0.64), stauchung: V(0.95, 0.75, 1), weich: 0.03)],
         farbe: hex("#2B2421"), lack: 0.5, rauheit: 0.35, n: 360)
    nase(w, [Form(art: .rundkegel(V(0, -0.02, 0.27), 0.065, 0.013), mitte: V(0, 0.13, 0.63), stauchung: V(0.95, 0.70, 1), weich: 0.03)],
         farbe: hex("#4A3A30"), lack: 0.4, rauheit: 0.4, n: 360)
    augenEinsetzen(w, kopf, x: 0.36, y: 0.27, r: 0.12, tiefe: 0.38, iris: NSColor(calibratedRed: 0.09, green: 0.06, blue: 0.05, alpha: 1), pupille: 0.78, aussen: 0.35, ausdruck: Ausdruck(oben: 0.05, unten: 0.06, funke: 1.6))
    w.eulerAngles = SCNVector3(0.02, -0.50, 0.08)
    return (w, 8.0, V(0, -0.30, 0.10))
}

// ---------- Runde 163: Mops und Siamkatze (Auftrag des Inhabers) ----------

func mops() -> (SCNNode, Float, V) {
    // Runde 196, Neubau (Auftrag: „richtig fotorealistisch von a bis z"): ganz flaches Gesicht, dicke Nasenfalte im
    // Bogen ueber der Nase, tiefe Stirnfalten, breiter Unterkiefer mit Lefzen, grosse runde leicht vorstehende Augen,
    // schwarze Maske und Rosenohren, kurzes glaenzendes Falbfell. Falten sind Formen mit dunklerer Tiefe, keine Striche.
    let falb = hex("#D3B07E"), maske = hex("#231C19"), hell = hex("#E6CFA3")
    var falten: [Form] = []
    // Nasenfalte: ein dicker Wulst im Bogen ueber der Nase.
    let bogen: [V] = [V(-0.30, -0.04, 0.80), V(-0.16, 0.04, 0.90), V(0, 0.07, 0.93), V(0.16, 0.04, 0.90), V(0.30, -0.04, 0.80)]
    for i in 0..<(bogen.count - 1) {
        falten.append(Form(art: .rundkegel(bogen[i + 1] - bogen[i], 0.075, 0.075), mitte: bogen[i], weich: 0.06))
    }
    // Stirnfalten: drei flache, leicht gebogene Wuelste; dazwischen eine senkrechte Rinne.
    // Mitten knapp unter der Schaedelflaeche: die Wuelste wolben sich nur leicht vor, wie Haut, nicht wie Leisten.
    for (y, b, z) in [(0.30 as Float, 0.30 as Float, 0.72 as Float), (0.42, 0.25, 0.67), (0.53, 0.19, 0.61)] {
        falten.append(Form(art: .ellipsoid(V(b, 0.05, 0.06)), mitte: V(0, y, z), weich: 0.09))
    }
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.92, 0.78, 0.80)), mitte: V(0, 0.12, -0.04)),
        // breiter Unterkiefer und haengende Lefzen
        Form(art: .ellipsoid(V(0.46, 0.34, 0.40)), mitte: V(-0.44, -0.30, 0.32), weich: 0.28),
        Form(art: .ellipsoid(V(0.46, 0.34, 0.40)), mitte: V(0.44, -0.30, 0.32), weich: 0.28),
        Form(art: .ellipsoid(V(0.42, 0.24, 0.22)), mitte: V(0, -0.24, 0.78), weich: 0.20),
        Form(art: .ellipsoid(V(0.30, 0.14, 0.24)), mitte: V(0, -0.44, 0.62), weich: 0.18),
        Form(art: .ellipsoid(V(0.03, 0.14, 0.05)), mitte: V(0, 0.42, 0.80), weich: 0.03, abziehen: true),
    ] + falten
    for sx: Float in [-1, 1] {
        // Rosenohr: klein, nach vorn umgeklappt, schwarz.
        formen.append(Form(art: .ellipsoid(V(0.25, 0.19, 0.06)), mitte: V(0.72 * sx, 0.56, 0.10),
                           drehung: simd_quatf(angle: -0.55 * sx, axis: V(0, 0, 1)) * simd_quatf(angle: 0.45 * sx, axis: V(0, 1, 0)), weich: 0.08))
    }
    formen += lider(0.34, 0.14, 0.70, 0.12)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(falb, p, 0.07)
        c = mische(c, hell, glatt(0.0, 0.5, p.y) * 0.20)
        // Maske: Schnauze, Kinn, um die Augen, nach oben weich auslaufend
        let schnauze = region(p, V(0, -0.20, 0.92), V(0.56, 0.42, 0.42), 0.18)
        let augen = max(region(p, V(-0.34, 0.14, 0.72), V(0.22, 0.20, 0.30), 0.22), region(p, V(0.34, 0.14, 0.72), V(0.22, 0.20, 0.30), 0.22))
        c = mische(c, maske, max(schnauze, augen * 0.75))
        // Faltentiefen dunkler: knapp ausserhalb jedes Wulstes
        let d = falten.map { $0.abstand(p) }.min() ?? 1
        c = mische(c, mische(c, maske, 0.6), glatt(0.07, 0.025, d) * glatt(-0.01, 0.025, d) * 0.6)
        c = mische(c, maske, glatt(0.60, 0.72, abs(p.x)) * glatt(0.40, 0.52, p.y) * 0.95)     // Ohren
        return c
    }, rauheit: 0.60, fell: 0.05)
    var (braue, braueM) = mitBrauen(kopf, x: 0.30, y: 0.34, laenge: 0.12, dicke: 0.045, winkel: 0.28, farbe: mische(falb, maske, 0.45), staerke: 0.55, wulst: 0.5)
    braue.haar = haarKarte(kopf, FellKarte(kopf: 0.034, rumpf: 0.05, nase: V(0, -0.08, 0.98), schnauze: 0.3,
        augen: augenStellen(kopf, x: 0.34, y: 0.14), augenR: 0.17,
        zonen: beide(V(0.44, -0.30, 0.32), V(0.40, 0.32, 0.36), 0.8)), braue: braueM)
    braue.fellArt = Fell(dichte: 150, dicke: 0.5, aufrecht: 0.30, neigung: 1.6, ursprung: V(0, -0.08, 1.02), wurzel: 0.60, spitze: 1.18, straehnen: 0.16, streuung: 0.15)
    // Geschlossenes Maul mit tiefen Mundwinkeln unter den Lefzen.
    let maul = mitMaul(braue, Maul(kurven: [Kurve(punkte: [V(0, -0.15, 0.99), V(0, -0.28, 0.98), V(0, -0.36, 0.94)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.36, 0.94), V(0.12, -0.43, 0.91), V(0.26, -0.44, 0.82), V(0.36, -0.40, 0.68)], spitzVorn: false)),
        r: 0.032, farbe: hex("#120D0C"), staerke: 0.9))
    let bau = Bau(brust: 1.30, tiefe: 1.05, hals: 0.60, bein: 0.19, beinAbstand: 0.30, ruecken: 0.68)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        // Kehlfalten: weiche dunklere Baender am Hals.
        let kehle = glatt(0.55, 0.85, sinf(p.y * 14) * 0.5 + 0.5) * glatt(-0.40, -0.70, p.y) * glatt(-1.10, -0.85, p.y) * glatt(0.2, 0.5, p.z)
        return mische(farbeMitRauschen(falb, p, 0.07), mische(falb, maske, 0.35), kehle * 0.5)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    tierNase(w, mitte: V(0, -0.08, 0.98), r: V(0.15, 0.10, 0.09), farbe: hex("#120E0E"))
    augenEinsetzen(w, kopf, x: 0.34, y: 0.14, r: 0.17, tiefe: 0.36, iris: NSColor(calibratedRed: 0.18, green: 0.11, blue: 0.07, alpha: 1), pupille: 0.66, aussen: 0.30, ausdruck: Ausdruck(oben: 0.08, unten: 0.06, schraeg: 0.10, funke: 1.6, wange: 0))
    w.eulerAngles = SCNVector3(0.05, -0.30, -0.05)
    return (w, 7.4, V(0, 0.12, 0.05))
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
        let maske = region(p, V(0, -0.12, 0.84), V(0.54, 0.52, 0.46), 0.35)
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
    augenEinsetzen(w, kopf, x: 0.31, y: 0.12, r: 0.17, iris: NSColor(calibratedRed: 0.36, green: 0.62, blue: 0.92, alpha: 1), pupille: 0.50, schlitz: true, schlitzBreite: 0.55, ausdruck: Ausdruck(oben: 0.14, unten: 0.08, schraeg: 0.22, funke: 1.5, wange: 0.3))
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

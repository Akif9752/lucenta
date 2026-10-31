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
                    blick: V = V(0, 0, 6), aussen: Float = 0.25, ausdruck roh: Ausdruck = Ausdruck(), irisAnteil: CGFloat = 0.86) {
    let a = STIMMUNG.angewandt(roh)
    let r = r * a.groesse
    for s: Float in [-1, 1] {
        let zf = vorderflaeche(kopf, x * s, y)
        let mitte = V(x * s, y, zf - tiefe * Float(r))
        let au = auge(radius: r, iris: iris, pupille: pupille, schlitz: schlitz, quer: quer, schlitzBreite: schlitzBreite, irisAnteil: irisAnteil, funke: a.funke)
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
// Ganze Figuren reichen bis zu den Fuessen; das Raster waechst mit, die Feinheit bleibt etwa gleich.
func ganzKnoten(_ k: Koerper) -> SCNNode { kopfKnoten(k, grenze: 3.9, n: 350) }

// ---------- Fuchs ----------

func fuchs() -> (SCNNode, Float, V) {
    // Trickfilm-Fuchs nach der Vorlage: grosser runder Oberkopf, kurze spitze Schnauze, hohe spitze Ohren mit dunklen
    // Spitzen und weissem Innenfell, grosse dunkle Augen unter kraeftigen, schraegen Brauen, weisse Wangen und Brust.
    let rot = hex("#E0601C"), weiss = hex("#F6EEE6"), dunkel = hex("#2A1A14"), braue = hex("#5A2210")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.80, 0.72, 0.74)), mitte: V(0, 0.22, -0.04)),
        Form(art: .ellipsoid(V(0.44, 0.32, 0.38)), mitte: V(-0.50, -0.12, 0.06), weich: 0.32),
        Form(art: .ellipsoid(V(0.44, 0.32, 0.38)), mitte: V(0.50, -0.12, 0.06), weich: 0.32),
        Form(art: .rundkegel(V(0, -0.10, 0.82), 0.28, 0.08), mitte: V(0, -0.10, 0.50), weich: 0.22),
    ]
    formen += ohrPaar(0.42, 0.72, -0.10, laenge: V(0.22, 0.78, -0.06), r1: 0.33, r2: 0.04, flach: 0.42)
    let muscheln = formen.filter { $0.abziehen }     // weisser Flaum innen in der Ohrmuschel
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(rot, p, 0.05)
        // Weiss: Wangen, Schnauze, Kinn
        let linie = -0.16 - 0.06 * abs(p.x) + 0.10 * max(0, p.z - 0.9)
        c = mische(c, farbeMitRauschen(weiss, p, 0.03), glatt(linie + 0.06, linie - 0.06, p.y) * glatt(-0.2, 0.3, p.z + 0.4 * abs(p.x)))
        // Ohren: innen weiss, Spitzen und Rueckseite dunkel
        let innen = glatt(0.05, -0.01, muscheln.map { $0.abstand(p) }.min() ?? 1) * glatt(1.40, 1.15, p.y)
        c = mische(c, weiss, innen * glatt(0.9, 1.0, p.y))
        return mische(c, dunkel, glatt(1.30, 1.50, p.y))
    }, rauheit: 0.72, fell: 0.05)
    var (mitB, braueM) = mitBrauen(kopf, x: 0.27, y: 0.55, laenge: 0.18, dicke: 0.08, winkel: 0.30, farbe: braue, staerke: 1)
    mitB.haar = haarKarte(kopf, FellKarte(kopf: 0.07, rumpf: 0.10, nase: V(0, -0.19, 1.40), schnauze: 0.6,
        augen: augenStellen(kopf, x: 0.25, y: 0.33), augenR: 0.27, braue: 0.3,
        zonen: beide(V(0.60, -0.22, 0.12), V(0.45, 0.35, 0.45), 1.7) + [(V(0, 1.2, -0.1), V(0.8, 0.5, 0.4), 0.5)]), braue: braueM)
    mitB.fellArt = Fell(dichte: 80, ursprung: V(0, -0.19, 1.40), spitze: 1.04, straehnen: 0.45)
    // Verschmitztes, geschlossenes Laecheln; froh oeffnet es leicht.
    let zu = mundOeffnung(0.0) < 0.02
    let hoehle = mundHoehle(mitte: V(0, -0.32, 1.22), breite: 0.15, hoehe: 0.12, tiefe: 0.12, offen: 0.0, kopf: kopf)
    let maul = mitMaul(mitB, Maul(kurven: [Kurve(punkte: [V(0, -0.25, 1.36), V(0, -0.30, 1.30)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.30, 1.30), V(0.07, -0.33, 1.20), V(0.14, -0.31, 1.06), V(0.21, -0.24, 0.92)], spitzVorn: false)),
        r: 0.024, farbe: dunkel, staerke: zu ? 0.9 : 0.6, hoehlen: hoehle, innen: hex("#93323A")))
    // Sitzend wie in der Vorlage, schlank, dunkle Vorderbeine, grosser buschiger Schwanz seitlich hoch mit weisser Spitze.
    let sitz = sitzLeib(Sitz(breite: 0.85, bein: 0.15, keule: 0.9,
        schwanz: [V(-0.50, -2.40, -0.80), V(-1.30, -2.25, -0.35), V(-1.75, -1.60, -0.05), V(-1.75, -0.85, 0.05), V(-1.50, -0.45, 0.0)],
        schwanzR: [0.20, 0.36, 0.42, 0.36, 0.14]))
    let koerper = brustbild(maul, sitz.formen, farbe: { p, _ in
        var c = mische(farbeMitRauschen(rot, p, 0.05), weiss, latz(p, breite: 0.30, hoehe: 0.1))
        c = mische(c, dunkel, max(nahe(p, sitz.beine) * glatt(-1.7, -2.1, p.y), nahe(p, sitz.pfoten)) * 0.9)
        // Schwanz: rot, zur Spitze weiss
        let sch = nahe(p, sitz.schwanz)
        return mische(c, mische(farbeMitRauschen(rot, p, 0.05), weiss, glatt(-0.75, -0.45, p.y)), sch)
    })
    let w = SCNNode(); w.addChildNode(ganzKnoten(koerper))
    trickNase(w, mitte: V(0, -0.19, 1.40), r: V(0.11, 0.075, 0.075), farbe: hex("#141011"))
    zunge(w, mitte: V(0, -0.32, 1.18), breite: 0.12, hoehe: 0.12, offen: 0.0)
    augenEinsetzen(w, kopf, x: 0.25, y: 0.33, r: 0.15, tiefe: 0.24, iris: NSColor(calibratedRed: 0.24, green: 0.14, blue: 0.08, alpha: 1),
                   pupille: 0.66, ausdruck: Ausdruck(oben: 0.30, unten: 0.04, schraeg: 0.14, funke: 1.4, groesse: 1.45))
    w.eulerAngles = SCNVector3(0.10, -0.42, -0.06)
    return (w, 9.5, V(0, -1.0, 0))
}

// ---------- Katze (rot getigert) ----------

// Trickfilm-Katze (ohne Vorlage, im Stil der uebrigen): runder Kopf mit Wangenpolstern, grosse dreieckige Ohren
// innen rosa, kleine Doppelschnauze mit rosa Naeschen, sehr grosse Augen, kleines W-Laecheln. Keine Schnurrhaare
// (Striche auf Avatargroesse sind ein Fremdkoerper, CLAUDE.md).
struct KatzenArt { var farbe: (V, V) -> V; var rumpf: (V) -> V; var iris: NSColor; var braue: V; var nase: V }
func katzenFigur(_ art: KatzenArt) -> (SCNNode, Float, V) {
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.80, 0.72, 0.74)), mitte: V(0, 0.22, 0)),
        Form(art: .ellipsoid(V(0.46, 0.34, 0.40)), mitte: V(-0.46, -0.12, 0.18), weich: 0.32),
        Form(art: .ellipsoid(V(0.46, 0.34, 0.40)), mitte: V(0.46, -0.12, 0.18), weich: 0.32),
        Form(art: .ellipsoid(V(0.17, 0.13, 0.15)), mitte: V(-0.11, -0.16, 0.70), weich: 0.12),
        Form(art: .ellipsoid(V(0.17, 0.13, 0.15)), mitte: V(0.11, -0.16, 0.70), weich: 0.12),
    ]
    formen += ohrPaar(0.48, 0.70, -0.06, laenge: V(0.24, 0.62, -0.02), r1: 0.34, r2: 0.05, flach: 0.42)
    let muscheln = formen.filter { $0.abziehen }
    let kopf = Koerper(formen: formen, farbe: { p, n in
        let c = art.farbe(p, n)
        return mische(c, hex("#E9A3A6"), glatt(0.03, -0.01, muscheln.map { $0.abstand(p) }.min() ?? 1) * glatt(0.0, 0.4, n.z) * 0.85)
    }, rauheit: 0.75, fell: 0.05)
    var (mitB, braueM) = mitBrauen(kopf, x: 0.27, y: 0.60, laenge: 0.14, dicke: 0.05, winkel: 0.20, farbe: art.braue, staerke: 0.8)
    mitB.haar = haarKarte(kopf, FellKarte(kopf: 0.07, rumpf: 0.09, nase: V(0, -0.05, 0.82), schnauze: 0.4,
        augen: augenStellen(kopf, x: 0.27, y: 0.30), augenR: 0.27, braue: 0.3,
        zonen: beide(V(0.55, -0.15, 0.2), V(0.4, 0.35, 0.4), 1.6)), braue: braueM)
    mitB.fellArt = Fell(dichte: 90, ursprung: V(0, -0.05, 0.82), straehnen: 0.4)
    let hoehle = mundHoehle(mitte: V(0, -0.24, 0.80), breite: 0.12, hoehe: 0.08, tiefe: 0.08, offen: 0.0, kopf: kopf)
    let maul = mitMaul(mitB, Maul(kurven: [Kurve(punkte: [V(0, -0.08, 0.84), V(0, -0.15, 0.84)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.15, 0.84), V(0.06, -0.20, 0.83), V(0.12, -0.19, 0.80), V(0.17, -0.14, 0.76)], spitzVorn: false)),
        r: 0.018, farbe: art.braue, staerke: 0.8, hoehlen: hoehle, innen: hex("#93323A")))
    let bau = Bau(brust: 1.15, tiefe: 1.2, hals: 0.42, bein: 0.16, beinAbstand: 0.24, ruecken: 0.70)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in art.rumpf(p) })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    trickNase(w, mitte: V(0, -0.03, 0.85), r: V(0.07, 0.045, 0.045), farbe: art.nase)
    zunge(w, mitte: V(0, -0.24, 0.76), breite: 0.10, hoehe: 0.08, offen: 0.0)
    augenEinsetzen(w, kopf, x: 0.27, y: 0.30, r: 0.15, tiefe: 0.24, iris: art.iris,
                   pupille: 0.55, ausdruck: Ausdruck(oben: 0.06, unten: 0.0, schraeg: 0.04, funke: 1.6, groesse: 1.65))
    w.eulerAngles = SCNVector3(0.05, -0.22, 0.06)
    return (w, 7.6, V(0, 0.20, 0))
}

func katze() -> (SCNNode, Float, V) {
    // Rot getigert: orange mit weichen dunkleren Streifen auf Stirn und Wangen, weisse Schnauze und Brust, gruene Augen.
    let rot = hex("#E88A3A"), dunkel = hex("#B5571C"), weiss = hex("#FBF2E6")
    func tiger(_ p: V) -> Float { glatt(0.55, 0.85, sinf(p.x * 9 + 3 * fbm(p * 2)) * 0.5 + 0.5) * glatt(0.25, 0.55, p.y + abs(p.x) * 0.5) }
    return katzenFigur(KatzenArt(
        farbe: { p, _ in
            let c = mische(farbeMitRauschen(rot, p, 0.04), dunkel, tiger(p) * 0.6)
            return mische(c, weiss, region(p, V(0, -0.22, 0.70), V(0.30, 0.20, 0.30), 0.35))
        },
        rumpf: { p in mische(mische(farbeMitRauschen(rot, p, 0.04), dunkel, glatt(0.6, 0.9, sinf(p.y * 7 + 2 * fbm(p)) * 0.5 + 0.5) * 0.4), weiss, latz(p, breite: 0.30)) },
        iris: NSColor(calibratedRed: 0.45, green: 0.66, blue: 0.22, alpha: 1), braue: hex("#7A3A14"), nase: hex("#E3888A")))
}

// ---------- Baer ----------

// ---------- Ganzer Koerper (Runde 206) ----------
// Seit Runde 206 zeigt der Avatar das ganze Tier wie die Vorlage (Entscheidung des Inhabers). Glieder und Schwaenze
// sind weiche Rohre entlang einer Kurve (`bogen`, rund statt seitlich schmal).
func glied(_ punkte: [V], _ radien: [Float], weich: Float = 0.06) -> [Form] { bogen(punkte, radien, schmal: 1, schritte: 6, weich: weich).formen }

// Sitzender Vierbeiner (Fuchs, Mops, Retriever, Katzen, Hase): Hals, Brust, Hinterkeulen, gerade Vorderbeine,
// Pfoten, Schwanz als weiches Rohr. Kopf im Ursprung; der Boden liegt bei etwa y = -2,7.
struct Sitz {
    var breite: Float = 1          // Brust und Keulen in die Breite
    var bein: Float = 0.17         // Radius der Vorderbeine
    var keule: Float = 1           // Groesse der Hinterkeulen
    var schwanz: [V] = []
    var schwanzR: [Float] = []
}
struct SitzTeile { var formen: [Form]; var beine: [Form]; var pfoten: [Form]; var schwanz: [Form] }
func sitzLeib(_ s: Sitz) -> SitzTeile {
    let b = s.breite
    var f: [Form] = [
        Form(art: .ellipsoid(V(0.42 * b, 0.45, 0.42)), mitte: V(0, -0.72, -0.08), weich: 0.30),
        Form(art: .ellipsoid(V(0.55 * b, 0.75, 0.55)), mitte: V(0, -1.35, 0.08), weich: 0.30),
        Form(art: .ellipsoid(V(0.72 * b, 0.62, 0.80)), mitte: V(0, -2.05, -0.40), weich: 0.35),
    ]
    var beine: [Form] = [], pfoten: [Form] = []
    for x: Float in [-1, 1] {
        f.append(Form(art: .ellipsoid(V(0.36, 0.48, 0.55) * s.keule), mitte: V(0.55 * b * x, -2.12, -0.30), weich: 0.18))
        pfoten.append(Form(art: .ellipsoid(V(0.17, 0.10, 0.26)), mitte: V(0.58 * b * x, -2.62, 0.28), weich: 0.08))
        beine += glied([V(0.26 * b * x, -1.50, 0.32), V(0.28 * b * x, -2.10, 0.40), V(0.29 * b * x, -2.55, 0.44)], [s.bein, s.bein * 0.92, s.bein * 0.88])
        pfoten.append(Form(art: .ellipsoid(V(s.bein * 1.05, 0.10, s.bein * 1.5)), mitte: V(0.29 * b * x, -2.62, 0.56), weich: 0.08))
    }
    let schwanz = s.schwanz.count > 1 ? glied(s.schwanz, s.schwanzR) : []
    return SitzTeile(formen: f + beine + pfoten + schwanz, beine: beine, pfoten: pfoten, schwanz: schwanz)
}
func nahe(_ p: V, _ formen: [Form], _ r: Float = 0.16) -> Float { glatt(r, 0.02, formen.map { $0.abstand(p) }.min() ?? 1) }

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
    var ohr: Float = 1
}
func baerenFigur(_ art: BaerenArt) -> (SCNNode, Float, V) {
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.78, 0.70, 0.74)), mitte: V(0, 0.30, -0.02)),
        Form(art: .ellipsoid(V(0.70, 0.56, 0.56)), mitte: V(-0.56, -0.18, 0.10), weich: 0.40),
        Form(art: .ellipsoid(V(0.70, 0.56, 0.56)), mitte: V(0.56, -0.18, 0.10), weich: 0.40),
        Form(art: .ellipsoid(V(0.52, 0.40, 0.44)), mitte: V(0, -0.20, 0.74), weich: 0.28),
    ]
    for sx: Float in [-1, 1] {
        let o = art.ohr
        formen.append(Form(art: .ellipsoid(V(0.22, 0.22, 0.14) * o), mitte: V(0.60 * sx, 0.86 - 0.12 * (1 - o), -0.12), weich: 0.12))
        formen.append(Form(art: .ellipsoid(V(0.13, 0.13, 0.09) * o), mitte: V(0.62 * sx, 0.87 - 0.12 * (1 - o), 0.00), weich: 0.06, abziehen: true))
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
    // Aufrecht auf den Hinterbeinen wie in der Vorlage: kurze dicke Beine im breiten Stand, ein Arm quer vor der
    // Brust, die andere Tatze erhoben.
    var rumpf: [Form] = [
        Form(art: .ellipsoid(V(0.80, 0.55, 0.70)), mitte: V(0, -0.72, -0.02), weich: 0.35),
        Form(art: .ellipsoid(V(1.10, 1.15, 0.95)), mitte: V(0, -1.65, 0.08), weich: 0.40),
    ]
    for s: Float in [-1, 1] {
        rumpf += glied([V(0.50 * s, -2.35, 0.05), V(0.64 * s, -2.80, 0.12), V(0.72 * s, -3.05, 0.15)], [0.42, 0.38, 0.34])
        rumpf.append(Form(art: .ellipsoid(V(0.34, 0.17, 0.46)), mitte: V(0.74 * s, -3.18, 0.36), weich: 0.10))
    }
    let armL = glied([V(-1.00, -1.10, 0.15), V(-0.95, -1.65, 0.65), V(-0.35, -1.55, 1.05)], [0.33, 0.30, 0.26])
    let armR = glied([V(1.00, -1.10, 0.15), V(1.35, -1.40, 0.45), V(1.30, -0.85, 0.75)], [0.33, 0.30, 0.27])
    rumpf += armL + armR
    rumpf.append(Form(art: .ellipsoid(V(0.27, 0.24, 0.22)), mitte: V(-0.25, -1.52, 1.12), weich: 0.08))
    rumpf.append(Form(art: .ellipsoid(V(0.27, 0.27, 0.20)), mitte: V(1.28, -0.70, 0.82), weich: 0.08))
    let arme = armL + armR + Array(rumpf.suffix(2))
    let koerper = brustbild(maul, rumpf, farbe: { p, n in
        art.rumpfFarbe(p, n, glatt(0.18, 0.02, arme.map { $0.abstand(p) }.min() ?? 1))   // weit genug fuer die Fellspitzen
    })
    let w = SCNNode(); w.addChildNode(ganzKnoten(koerper))
    // helle Krallen vorn an den Fuessen
    for s: Float in [-1, 1] { for k: Float in [-1, 0, 1] {
        w.addChildNode(perle(V(0.74 * s + 0.11 * k, -3.22, 0.80), V(0.035, 0.03, 0.05), farbe: NSColor(white: 0.93, alpha: 1)))
    }}
    trickNase(w, mitte: V(0, 0.03, 1.16), r: V(0.21, 0.14, 0.13), farbe: hex("#141011"))
    zunge(w, mitte: V(0, -0.25, 1.06), breite: 0.27, hoehe: 0.24, offen: 0.8)
    augenEinsetzen(w, kopf, x: 0.27, y: 0.46, r: 0.15, tiefe: 0.24, iris: art.iris,
                   pupille: 0.62, ausdruck: Ausdruck(oben: 0.06, unten: 0.0, schraeg: 0.0, funke: 1.4, groesse: 1.6))
    w.eulerAngles = SCNVector3(0.04, -0.25, 0.03)
    return (w, 9.5, V(0, -1.15, 0))
}

func baer() -> (SCNNode, Float, V) {
    let braun = hex("#B5622D"), hell = hex("#F0C597")
    return baerenFigur(BaerenArt(
        kopfFarbe: { p, n in
            var c = farbeMitRauschen(braun, p, 0.05)
            c = mische(c, farbeMitRauschen(hell, p, 0.03), region(p, V(0, -0.24, 0.92), V(0.52, 0.42, 0.40), 0.22))
            return mische(c, hell, glatt(0.76, 0.86, p.y) * glatt(0.48, 0.58, abs(p.x)) * glatt(0.2, 0.6, n.z) * 0.8)   // Ohrmuschel
        },
        rumpfFarbe: { p, _, arm in mische(farbeMitRauschen(braun, p, 0.05), hell, region(p, V(0, -1.95, 1.0), V(0.66, 0.80, 0.40), 0.25) * (1 - arm)) },
        brauen: hex("#4E2413"), iris: NSColor(calibratedRed: 0.38, green: 0.22, blue: 0.10, alpha: 1), lippe: hex("#4E2413")))
}

func panda() -> (SCNNode, Float, V) {
    // Panda nach der Vorlage, eigener Bau (nicht der Baerenkopf): grosser eifoermiger Kopf ohne Wangenpolster, grosse
    // runde schwarze Ohren, schraege Augenflecken, kleine weisse Schnauze mit kleiner Nase, kleines Lachen,
    // kugeliger weisser Bauch, schwarze Arme und Schulterband.
    let weiss = hex("#F4F2EE"), schwarz = hex("#1E1D1F")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.92, 0.86, 0.84)), mitte: V(0, 0.22, 0)),
        Form(art: .ellipsoid(V(0.50, 0.36, 0.42)), mitte: V(-0.40, -0.18, 0.20), weich: 0.45),
        Form(art: .ellipsoid(V(0.50, 0.36, 0.42)), mitte: V(0.40, -0.18, 0.20), weich: 0.45),
        Form(art: .ellipsoid(V(0.32, 0.24, 0.28)), mitte: V(0, -0.20, 0.72), weich: 0.25),
    ]
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.28, 0.27, 0.16)), mitte: V(0.64 * sx, 0.90, -0.12), weich: 0.10))
    }
    let kopf = Koerper(formen: formen, farbe: { p, _ in
        var c = farbeMitRauschen(weiss, p, 0.03)
        for s: Float in [-1, 1] {
            let q = p - V(0.33 * s, 0.30, 0.70)
            let r = simd_quatf(angle: s * 0.65, axis: V(0, 0, 1)).inverse.act(q)
            c = mische(c, schwarz, glatt(1.05, 0.88, simd_length(V(r.x / 0.27, r.y / 0.40, r.z / 0.9))))
        }
        return mische(c, schwarz, glatt(0.80, 0.88, p.y) * glatt(0.42, 0.52, abs(p.x)))   // Ohren
    }, rauheit: 0.75, fell: 0.05)
    var k0 = kopf
    k0.haar = haarKarte(kopf, FellKarte(kopf: 0.07, rumpf: 0.09, nase: V(0, -0.10, 1.00), schnauze: 0.5,
        augen: augenStellen(kopf, x: 0.30, y: 0.32), augenR: 0.28, braue: 0,
        zonen: beide(V(0.60, -0.20, 0.15), V(0.45, 0.40, 0.45), 1.5)), braue: { _ in 0 })
    k0.fellArt = Fell(dichte: 70, ursprung: V(0, -0.10, 1.00), straehnen: 0.35)
    let hoehle = mundHoehle(mitte: V(0, -0.30, 0.96), breite: 0.20, hoehe: 0.15, tiefe: 0.15, offen: 0.8, kopf: kopf)
    let zu = mundOeffnung(0.8) < 0.02
    let maul = mitMaul(k0, Maul(kurven: [Kurve(punkte: [V(0, -0.15, 1.00), V(0, -0.23, 0.99), V(0, -0.29, 0.97)], spitzHinten: !zu)]
        + (zu ? paar(Kurve(punkte: [V(0, -0.29, 0.97), V(0.10, -0.32, 0.94), V(0.19, -0.28, 0.88), V(0.24, -0.21, 0.82)], spitzVorn: false))
              : paar(Kurve(punkte: [V(0.19, -0.29, 0.89), V(0.24, -0.23, 0.83), V(0.27, -0.16, 0.77)]))),
        r: 0.022, farbe: schwarz, staerke: 0.85, hoehlen: hoehle, innen: hex("#93323A")))
    // Sitzend wie in der Vorlage: kugeliger Bauch, Hinterbeine nach vorn mit Sohlen zum Betrachter, ein Arm ueber
    // dem Bauch, der andere seitlich herab.
    var rumpf: [Form] = [
        Form(art: .ellipsoid(V(0.78, 0.55, 0.70)), mitte: V(0, -0.72, -0.02), weich: 0.35),
        Form(art: .ellipsoid(V(1.05, 1.05, 0.92)), mitte: V(0, -1.70, 0.10), weich: 0.40),
    ]
    var schwarzTeile: [Form] = []
    for s: Float in [-1, 1] {
        schwarzTeile += glied([V(0.70 * s, -2.30, 0.20), V(0.82 * s, -2.55, 0.75), V(0.88 * s, -2.58, 1.15)], [0.44, 0.40, 0.36])
        schwarzTeile.append(Form(art: .ellipsoid(V(0.36, 0.38, 0.16)), mitte: V(0.90 * s, -2.52, 1.30), weich: 0.10))
    }
    schwarzTeile += glied([V(-0.98, -1.00, 0.20), V(-0.90, -1.55, 0.95), V(-0.25, -1.55, 1.30)], [0.34, 0.31, 0.27])
    schwarzTeile.append(Form(art: .ellipsoid(V(0.27, 0.24, 0.22)), mitte: V(-0.20, -1.52, 1.36), weich: 0.08))
    schwarzTeile += glied([V(1.00, -1.00, 0.15), V(1.28, -1.55, 0.40), V(1.20, -2.05, 0.62)], [0.34, 0.31, 0.28])
    rumpf += schwarzTeile
    let koerper = brustbild(maul, rumpf, farbe: { p, _ in
        let schw = glatt(0.18, 0.02, schwarzTeile.map { $0.abstand(p) }.min() ?? 1)
        // Schulterband nur ueber Schultern und Ruecken, vorn bleibt die Brust weiss
        let schulter = glatt(-0.70, -0.90, p.y) * glatt(-1.45, -1.20, p.y) * max(glatt(0.35, 0.0, p.z), glatt(0.70, 0.90, abs(p.x)))
        return mische(farbeMitRauschen(weiss, p, 0.03), farbeMitRauschen(schwarz, p, 0.04), max(schw, schulter))
    })
    let w = SCNNode(); w.addChildNode(ganzKnoten(koerper))
    // graue Ballen und Zehen auf den Sohlen
    for s: Float in [-1, 1] {
        w.addChildNode(perle(V(0.90 * s, -2.58, 1.45), V(0.17, 0.15, 0.05), farbe: NSColor(white: 0.55, alpha: 1), rauheit: 0.6))
        for k: Float in [-1, 0, 1] { w.addChildNode(perle(V(0.90 * s + 0.12 * k, -2.30 + 0.03 * abs(k), 1.42), V(0.055, 0.05, 0.04), farbe: NSColor(white: 0.55, alpha: 1), rauheit: 0.6)) }
    }
    trickNase(w, mitte: V(0, -0.08, 1.00), r: V(0.13, 0.085, 0.08), farbe: hex("#141011"))
    zunge(w, mitte: V(0, -0.30, 0.93), breite: 0.17, hoehe: 0.15, offen: 0.8)
    augenEinsetzen(w, kopf, x: 0.30, y: 0.32, r: 0.14, tiefe: 0.24, iris: NSColor(calibratedRed: 0.40, green: 0.50, blue: 0.22, alpha: 1),
                   pupille: 0.6, ausdruck: Ausdruck(oben: 0.06, unten: 0.0, schraeg: 0.08, funke: 1.5, groesse: 1.55))
    w.eulerAngles = SCNVector3(0.10, -0.30, 0.05)
    return (w, 9.5, V(0, -1.0, 0))
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
    // Trickfilm-Rehbock nach der Vorlage: runder Kopf, schlanke helle Schnauze mit grosser schwarzer Nase, grosse
    // blattfoermige Ohren (innen rosa), kleines Geweih mit je einer Sprosse, grosse Augen, offenes Laecheln, langer Hals,
    // helle Kehle, Tupfen am Ruecken.
    let fell = hex("#C4773E"), creme = hex("#F3E2CB"), rosa = hex("#E59A9A"), dunkel = hex("#3A2216")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.68, 0.64, 0.66)), mitte: V(0, 0.28, -0.02)),
        Form(art: .rundkegel(V(0, -0.14, 0.74), 0.34, 0.21), mitte: V(0, 0.02, 0.28), weich: 0.26),
    ]
    formen += ohrPaar(0.58, 0.58, -0.12, laenge: V(0.58, 0.22, -0.10), r1: 0.27, r2: 0.07, flach: 0.36)
    let muscheln = formen.filter { $0.abziehen }
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(fell, p, 0.04)
        // helle Schnauze und Kinn
        c = mische(c, creme, glatt(0.85, 1.10, p.z) * glatt(0.0, -0.10, p.y))
        c = mische(c, creme, region(p, V(0, -0.36, 0.55), V(0.28, 0.18, 0.40), 0.4))
        return mische(c, rosa, glatt(0.035, -0.01, muscheln.map { $0.abstand(p) }.min() ?? 1) * glatt(0.0, 0.4, n.z) * 0.9)
    }, rauheit: 0.72, fell: 0.04)
    var (mitB, braueM) = mitBrauen(kopf, x: 0.27, y: 0.62, laenge: 0.15, dicke: 0.05, winkel: 0.18, farbe: dunkel, staerke: 0.9)
    mitB.haar = haarKarte(kopf, FellKarte(kopf: 0.045, rumpf: 0.06, nase: V(0, -0.11, 1.22), schnauze: 0.5,
        augen: augenStellen(kopf, x: 0.26, y: 0.34), augenR: 0.26, braue: 0.2), braue: braueM)
    mitB.fellArt = Fell(dichte: 120, ursprung: V(0, -0.11, 1.22), straehnen: 0.25)
    let hoehle = mundHoehle(mitte: V(0, -0.22, 1.16), breite: 0.23, hoehe: 0.19, tiefe: 0.15, offen: 0.9, kopf: kopf)
    let zu = mundOeffnung(0.9) < 0.02
    let maul = mitMaul(mitB, Maul(kurven: [Kurve(punkte: [V(0, -0.17, 1.22), V(0, -0.21, 1.20)], spitzHinten: !zu)]
        + (zu ? paar(Kurve(punkte: [V(0, -0.25, 1.16), V(0.08, -0.28, 1.10), V(0.16, -0.24, 1.00)], spitzVorn: false))
              : paar(Kurve(punkte: [V(0.21, -0.22, 1.06), V(0.25, -0.15, 0.98), V(0.27, -0.08, 0.90)]))),
        r: 0.02, farbe: dunkel, staerke: 0.85, hoehlen: hoehle, innen: hex("#93323A")))
    let bau = Bau(brust: 0.95, tiefe: 1.1, hals: 0.30, halsLaenge: 1.55, bein: 0.14, beinAbstand: 0.20, ruecken: 0.60, rueckenLaenge: 1.6)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        var c = mische(farbeMitRauschen(fell, p, 0.04), creme, latz(p, breite: 0.22, hoehe: 0.30))
        // Tupfen nur am Ruecken
        let z = zellen(p, 5.5)
        c = mische(c, creme, glatt(0.10, 0.14, z.rand) * (z.wert > 0.45 ? 1 : 0) * glatt(-0.4, -0.7, p.z) * glatt(-1.7, -1.2, p.y))
        return c
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    trickNase(w, mitte: V(0, -0.11, 1.22), r: V(0.13, 0.085, 0.08), farbe: hex("#141011"))
    zunge(w, mitte: V(0, -0.22, 1.12), breite: 0.20, hoehe: 0.19, offen: 0.9)
    // Geweih: je Seite eine Stange nach oben aussen und eine kurze Sprosse nach vorn.
    var geweih: [Form] = []
    for s: Float in [-1, 1] {
        let fuss = V(0.24 * s, 0.82, -0.05)
        geweih.append(Form(art: .rundkegel(V(0.14 * s, 0.62, -0.06), 0.075, 0.045), mitte: fuss, weich: 0.03))
        geweih.append(Form(art: .rundkegel(V(0.12 * s, 0.26, 0.14), 0.05, 0.03), mitte: fuss + V(0.05 * s, 0.24, -0.02), weich: 0.03))
        geweih.append(Form(art: .rundkegel(V(-0.08 * s, 0.24, -0.02), 0.045, 0.028), mitte: fuss + V(0.14 * s, 0.62, -0.06), weich: 0.03))
    }
    nase(w, geweih, farbe: hex("#6E5444"), lack: 0.2, rauheit: 0.6, n: 300)
    augenEinsetzen(w, kopf, x: 0.26, y: 0.34, r: 0.15, tiefe: 0.24, iris: NSColor(calibratedRed: 0.26, green: 0.15, blue: 0.09, alpha: 1),
                   pupille: 0.64, ausdruck: Ausdruck(oben: 0.08, unten: 0.0, schraeg: 0.06, funke: 1.5, groesse: 1.55))
    w.eulerAngles = SCNVector3(0.05, -0.30, 0.04)
    return (w, 8.0, V(0, 0.30, 0))
}

// ---------- Dackel (Kurzhaar, rot) ----------

func dackel() -> (SCNNode, Float, V) {
    // Trickfilm-Dackel nach der Vorlage: rotbraun, gewoelbte Stirn, lange schmale Schnauze mit grosser Nase, lange
    // weiche Schlappohren, sehr grosse treuherzige Augen unter weichen Brauen, schmale Brust.
    let rot = hex("#A4512A"), hell = hex("#C77446"), dunkel = hex("#3E1C10")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.62, 0.62, 0.64)), mitte: V(0, 0.30, -0.04)),
        Form(art: .rundkegel(V(0, -0.30, 0.78), 0.32, 0.16), mitte: V(0, 0.04, 0.26), weich: 0.26),
    ]
    // Schlappohren: haengen breit seitlich am Kopf herab.
    for s: Float in [-1, 1] {
        let dreh = simd_quatf(angle: s * 0.30, axis: V(0, 0, 1)) * simd_quatf(angle: s * 0.35, axis: V(0, 1, 0))
        formen.append(Form(art: .ellipsoid(V(0.25, 0.60, 0.08)), mitte: V(0.70 * s, -0.05, 0.02), drehung: dreh, weich: 0.06))
    }
    let kopf = Koerper(formen: formen, farbe: { p, _ in
        var c = farbeMitRauschen(rot, p, 0.04)
        c = mische(c, hell, region(p, V(0, -0.02, 0.85), V(0.24, 0.20, 0.30), 0.4) * 0.6)
        return mische(c, mische(rot, dunkel, 0.45), glatt(0.56, 0.66, abs(p.x)) * glatt(0.35, 0.15, p.y))   // Ohren dunkler
    }, rauheit: 0.66, fell: 0.03)
    var (mitB, braueM) = mitBrauen(kopf, x: 0.25, y: 0.64, laenge: 0.15, dicke: 0.055, winkel: 0.35, farbe: dunkel, staerke: 0.8)
    mitB.haar = haarKarte(kopf, FellKarte(kopf: 0.03, rumpf: 0.04, nase: V(0, -0.25, 1.17), schnauze: 0.5,
        augen: augenStellen(kopf, x: 0.24, y: 0.36), augenR: 0.26, braue: 0.2), braue: braueM)
    mitB.fellArt = Fell(dichte: 160, ursprung: V(0, -0.25, 1.17), straehnen: 0.15)
    let hoehle = mundHoehle(mitte: V(0, -0.40, 0.98), breite: 0.14, hoehe: 0.10, tiefe: 0.10, offen: 0.0, kopf: kopf)
    let maul = mitMaul(mitB, Maul(kurven: [Kurve(punkte: [V(0, -0.32, 1.15), V(0, -0.38, 1.10)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.38, 1.10), V(0.07, -0.41, 1.03), V(0.14, -0.39, 0.93), V(0.19, -0.33, 0.84)], spitzVorn: false)),
        r: 0.02, farbe: dunkel, staerke: 0.8, hoehlen: hoehle, innen: hex("#93323A")))
    let bau = Bau(brust: 0.95, tiefe: 1.25, hals: 0.34, halsLaenge: 1.2, bein: 0.15, beinAbstand: 0.19, ruecken: 0.55, rueckenLaenge: 2.2)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(rot, p, 0.04), hell, latz(p, breite: 0.22, hoehe: 0.15) * 0.4)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    trickNase(w, mitte: V(0, -0.25, 1.17), r: V(0.12, 0.085, 0.08), farbe: hex("#141011"))
    zunge(w, mitte: V(0, -0.40, 0.94), breite: 0.12, hoehe: 0.10, offen: 0.0)
    augenEinsetzen(w, kopf, x: 0.24, y: 0.36, r: 0.15, tiefe: 0.24, iris: NSColor(calibratedRed: 0.32, green: 0.17, blue: 0.08, alpha: 1),
                   pupille: 0.66, ausdruck: Ausdruck(oben: 0.10, unten: 0.0, schraeg: 0.20, funke: 1.6, groesse: 1.6))
    w.eulerAngles = SCNVector3(0.08, -0.32, 0.04)
    return (w, 8.0, V(0, 0.25, 0))
}

// ---------- Golden Retriever ----------

func hund() -> (SCNNode, Float, V) {
    // Trickfilm-Retriever (Stil der Vorlage, keine Nachbildung der Filmfigur): goldenes, flauschiges Fell, runder Kopf,
    // kraeftige Schnauze mit grosser Nase, weiche Schlappohren, lachender Mund mit Zunge, flauschige Brust.
    let gold = hex("#C98A45"), hell = hex("#E9BE80"), dunkel = hex("#5A3418")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.74, 0.68, 0.70)), mitte: V(0, 0.26, -0.04)),
        Form(art: .ellipsoid(V(0.46, 0.34, 0.40)), mitte: V(-0.40, -0.14, 0.18), weich: 0.32),
        Form(art: .ellipsoid(V(0.46, 0.34, 0.40)), mitte: V(0.40, -0.14, 0.18), weich: 0.32),
        Form(art: .rundkegel(V(0, -0.08, 0.60), 0.34, 0.26), mitte: V(0, -0.06, 0.40), weich: 0.24),
    ]
    for s: Float in [-1, 1] {
        let dreh = simd_quatf(angle: s * 0.35, axis: V(0, 0, 1)) * simd_quatf(angle: s * 0.30, axis: V(0, 1, 0))
        formen.append(Form(art: .ellipsoid(V(0.27, 0.52, 0.10)), mitte: V(0.70 * s, 0.10, -0.04), drehung: dreh, weich: 0.08))
    }
    let kopf = Koerper(formen: formen, farbe: { p, _ in
        var c = farbeMitRauschen(gold, p, 0.05)
        c = mische(c, hell, region(p, V(0, -0.20, 0.90), V(0.40, 0.28, 0.35), 0.35))
        return mische(c, mische(gold, dunkel, 0.40), glatt(0.58, 0.68, abs(p.x)) * glatt(0.40, 0.20, p.y))   // Ohren etwas dunkler
    }, rauheit: 0.75, fell: 0.05)
    var (mitB, braueM) = mitBrauen(kopf, x: 0.25, y: 0.64, laenge: 0.14, dicke: 0.055, winkel: 0.25, farbe: dunkel, staerke: 0.75)
    mitB.haar = haarKarte(kopf, FellKarte(kopf: 0.10, rumpf: 0.15, nase: V(0, 0.0, 1.16), schnauze: 0.5,
        augen: augenStellen(kopf, x: 0.25, y: 0.38), augenR: 0.26, braue: 0.3,
        zonen: beide(V(0.70, -0.05, 0.0), V(0.35, 0.55, 0.3), 1.6) + [(V(0, -1.2, 0.7), V(0.6, 0.6, 0.5), 1.8)]), braue: braueM)
    mitB.fellArt = Fell(dichte: 70, ursprung: V(0, 0.0, 1.16), straehnen: 0.6)
    let hoehle = mundHoehle(mitte: V(0, -0.22, 1.08), breite: 0.30, hoehe: 0.20, tiefe: 0.20, offen: 0.85, kopf: kopf)
    let zu = mundOeffnung(0.85) < 0.02
    let maul = mitMaul(mitB, Maul(kurven: [Kurve(punkte: [V(0, -0.06, 1.16), V(0, -0.14, 1.14), V(0, -0.20, 1.11)], spitzHinten: !zu)]
        + (zu ? paar(Kurve(punkte: [V(0, -0.20, 1.11), V(0.12, -0.23, 1.06), V(0.24, -0.19, 0.98), V(0.31, -0.11, 0.90)], spitzVorn: false))
              : paar(Kurve(punkte: [V(0.28, -0.20, 0.99), V(0.34, -0.13, 0.92), V(0.37, -0.05, 0.85)]))),
        r: 0.024, farbe: dunkel, staerke: 0.8, hoehlen: hoehle, innen: hex("#93323A")))
    let bau = Bau(brust: 1.35, tiefe: 1.4, hals: 0.50, bein: 0.20, beinAbstand: 0.28, ruecken: 0.80)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(gold, p, 0.05), hell, latz(p, breite: 0.35) * 0.6)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    trickNase(w, mitte: V(0, 0.02, 1.18), r: V(0.20, 0.13, 0.12), farbe: hex("#141011"))
    zunge(w, mitte: V(0, -0.22, 1.04), breite: 0.24, hoehe: 0.20, offen: 0.85)
    // Die Zunge haengt vorn ueber die Unterlippe hinaus wie in der Vorlage (nur bei offenem Maul).
    if mundOeffnung(0.85) > 0.02 {
        let f: Float = STIMMUNG == .froh ? 1.15 : 1
        w.addChildNode(perle(V(0, -0.40 * f, 1.13), V(0.13 * f, 0.17 * f, 0.07), farbe: NSColor(calibratedRed: 0.93, green: 0.45, blue: 0.52, alpha: 1), rauheit: 0.5))
    }
    augenEinsetzen(w, kopf, x: 0.25, y: 0.38, r: 0.15, tiefe: 0.24, iris: NSColor(calibratedRed: 0.34, green: 0.19, blue: 0.08, alpha: 1),
                   pupille: 0.64, ausdruck: Ausdruck(oben: 0.06, unten: 0.0, schraeg: 0.10, funke: 1.5, groesse: 1.5))
    w.eulerAngles = SCNVector3(0.02, -0.30, 0.10)
    return (w, 7.8, V(0, 0.22, 0))
}

// ---------- Eule (Waldkauz) ----------

func eule() -> (SCNNode, Float, V) {
    // Trickfilm-Eule nach der Vorlage: grosser cremeweisser Kopf, der den Koerper beherrscht; dicke dunkle Federbueschel,
    // die als Brauen ueber den Augen nach aussen oben auslaufen; riesige Augen in breiten hellbraunen Ringen; kleiner
    // orangefarbener Schnabel; weisse Brust mit V-Federzeichnung; dunkle Fluegel mit tropfenfoermigen weissen Tupfen.
    let creme = hex("#F4EFE6"), ring = hex("#D2955A"), bueschel = hex("#3A332F"), fluegel = hex("#252B38"), zeichnung = hex("#B9AFA6")
    let augeX: Float = 0.36, augeY: Float = 0.30
    var formen: [Form] = [
        Form(art: .ellipsoid(V(1.08, 0.86, 0.80)), mitte: V(0, 0.30, -0.04)),
        Form(art: .ellipsoid(V(0.08, 0.20, 0.10)), mitte: V(0, 0.22, 0.66), weich: 0.12),
    ]
    // Federbueschel: von ueber dem inneren Augenwinkel bogenfoermig nach aussen oben, spitz auslaufend.
    var bueschelFormen: [Form] = []
    for s: Float in [-1, 1] {
        // Bogen ueber dem Auge: innen kurz und flach, aussen nach oben geschwungen; die Mitte bleibt frei (sonst ein boeses V).
        bueschelFormen.append(Form(art: .rundkegel(V(0.22 * s, 0.07, -0.06), 0.085, 0.11), mitte: V(0.20 * s, 0.72, 0.62), weich: 0.06))
        bueschelFormen.append(Form(art: .rundkegel(V(0.24 * s, 0.04, -0.14), 0.11, 0.10), mitte: V(0.42 * s, 0.79, 0.56), weich: 0.06))
        bueschelFormen.append(Form(art: .rundkegel(V(0.28 * s, 0.26, -0.20), 0.10, 0.02), mitte: V(0.66 * s, 0.83, 0.42), weich: 0.05))
    }
    formen += bueschelFormen
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(creme, p, 0.03)
        for s: Float in [-1, 1] {
            let d = simd_length(simd_float2(p.x - augeX * s, (p.y - augeY) * 0.95))
            c = mische(c, ring, glatt(0.50, 0.42, d) * glatt(0.10, 0.45, n.z) * 0.95)
        }
        c = mische(c, mische(creme, bueschel, 0.25), glatt(0.75, 1.0, p.y) * 0.7)          // Scheitel
        let b = glatt(0.05, -0.01, bueschelFormen.map { $0.abstand(p) }.min() ?? 1)
        return mische(c, farbeMitRauschen(bueschel, p, 0.06), b)
    }, rauheit: 0.85, fell: 0.04)
    var k0 = kopf
    k0.haar = haarKarte(kopf, FellKarte(kopf: 0.04, rumpf: 0.06, nase: V(0, 0.14, 0.76), schnauze: 0.22,
        augen: augenStellen(kopf, x: augeX, y: augeY), augenR: 0.30, braue: 0,
        zonen: [(V(0, 0.80, 0.4), V(0.8, 0.2, 0.4), 1.8)]), braue: { _ in 0 })
    k0.fellArt = Fell(dichte: 120, dicke: 0.46, aufrecht: 0.36, neigung: 1.6, ursprung: V(0, 0.14, 0.76), wurzel: 0.56, spitze: 1.14, straehnen: 0.45, streuung: 0.20)
    let leib: [Form] = [
        Form(art: .ellipsoid(V(0.80, 0.70, 0.68)), mitte: V(0, -0.55, -0.04), weich: 0.30),
        Form(art: .ellipsoid(V(0.82, 0.85, 0.74)), mitte: V(0, -1.25, -0.06), weich: 0.36),
        Form(art: .ellipsoid(V(0.36, 0.90, 0.64)), mitte: V(-0.62, -1.10, 0.25), drehung: simd_quatf(angle: 0.25, axis: V(0, 0, 1)) * simd_quatf(angle: -0.65, axis: V(0, 1, 0)), weich: 0.08),
        Form(art: .ellipsoid(V(0.36, 0.90, 0.64)), mitte: V(0.62, -1.10, 0.25), drehung: simd_quatf(angle: -0.25, axis: V(0, 0, 1)) * simd_quatf(angle: 0.65, axis: V(0, 1, 0)), weich: 0.08),
    ]
    let fl = Array(leib.suffix(2))
    let k = brustbild(k0, leib, farbe: { p, _ in
        // Brust: V-foermige Federzeichnung in Reihen
        let v = sinf((p.y - abs(p.x) * 0.7) * 16)
        let reihe = glatt(0.80, 0.95, v) * glatt(0.5, 0.8, fbm(p * 9)) * glatt(-0.5, -0.8, p.y)
        var c = mische(farbeMitRauschen(creme, p, 0.03), zeichnung, reihe * 0.8)
        // Fluegel dunkel mit tropfenfoermigen weissen Tupfen
        let amFluegel = glatt(0.10, 0.02, min(fl[0].abstand(p), fl[1].abstand(p)))
        let tz = zellen(V(p.x, p.y * 0.75, p.z) + 5, 4.5)
        let tupfen = glatt(0.05, 0.09, tz.rand) * (tz.wert > 0.3 ? 1 : 0) * glatt(-0.85, -1.1, p.y)
        c = mische(c, mische(farbeMitRauschen(fluegel, p, 0.06), creme, tupfen), amFluegel)
        return c
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    let ober = bogen([V(0, 0.24, 0.72), V(0, 0.20, 0.84), V(0, 0.09, 0.88), V(0, -0.01, 0.83)],
                     [0.09, 0.075, 0.045, 0.014], schmal: 0.85)
    schnabel(w, ober.formen, farbe: { p in mische(hex("#F4A24E"), hex("#E07A2A"), glatt(0.3, 1.0, ober.t(p))) }, lack: 0.6, rauheit: 0.3)
    augenEinsetzen(w, kopf, x: augeX, y: augeY, r: 0.16, tiefe: 0.08, iris: NSColor(calibratedRed: 0.46, green: 0.24, blue: 0.08, alpha: 1),
                   pupille: 0.62, aussen: 0.1, ausdruck: Ausdruck(oben: 0.02, unten: 0.0, schraeg: 0.0, funke: 1.5, groesse: 2.2))
    w.eulerAngles = SCNVector3(0.04, 0.22, 0.05)
    return (w, 8.2, V(0, -0.20, 0.10))
}

// ---------- Wal ----------

func wal() -> (SCNNode, Float, V) {
    // Trickfilm-Wal nach der Vorlage: grosser runder blauer Kopf, der zugleich Leib ist, weisse Kehle mit Furchen,
    // breites Laecheln quer ueber den Kopf, Augen weit seitlich, Brustflossen, Schwanzflosse hinten hoch.
    let blau = hex("#2F86D6"), weiss = hex("#E6F0F7"), dunkel = hex("#163D66")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(1.05, 0.88, 1.00)), mitte: V(0, 0.05, 0)),
        Form(art: .rundkegel(V(0, 0.35, -1.30), 0.70, 0.22), mitte: V(0, -0.05, -0.40), weich: 0.40),
        Form(art: .ellipsoid(V(0.55, 0.10, 0.28)), mitte: V(0, 0.55, -1.75), drehung: simd_quatf(angle: 0.5, axis: V(1, 0, 0)), weich: 0.10),
    ]
    for s: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.42, 0.08, 0.20)), mitte: V(1.02 * s, -0.45, 0.20),
                           drehung: simd_quatf(angle: s * -0.55, axis: V(0, 0, 1)), weich: 0.10))
    }
    let flossen = Array(formen.suffix(2))
    let kopf = Koerper(formen: formen, farbe: { p, n in
        // Kehle weiss mit Furchen, unterhalb der Lachlinie
        let linie: Float = -0.22 + 0.10 * p.x * p.x
        let kehle = glatt(linie + 0.03, linie - 0.03, p.y) * glatt(-0.2, 0.2, n.z + 0.3) * glatt(0.02, 0.10, min(flossen[0].abstand(p), flossen[1].abstand(p)))
        let furchen = 0.88 + 0.12 * sinf(p.y * 40)
        var c = mische(farbeMitRauschen(blau, p, 0.03), weiss * furchen, kehle)
        c = mische(c, mische(blau, weiss, 0.25), glatt(0.2, 0.9, p.y) * 0.25)   // Scheitel heller im Licht
        return c
    }, rauheit: 0.4, fell: 0)
    var k = kopf; k.lack = 0.6
    let hoehle = mundHoehle(mitte: V(0, -0.21, 0.97), breite: 0.62, hoehe: 0.17, tiefe: 0.24, offen: 0.75, kopf: kopf)
    let maul = mitMaul(k, Maul(kurven: paar(Kurve(punkte: [V(0, -0.22, 0.98), V(0.25, -0.18, 0.92), V(0.48, -0.10, 0.80), V(0.66, 0.02, 0.62)], spitzVorn: false)),
        r: 0.026, farbe: dunkel, staerke: 0.9, hoehlen: hoehle, innen: hex("#7A2A36")))
    let w = SCNNode(); w.addChildNode(glanzKoerper(maul, grenze: 2.4, n: 230, rauheit: 0.35, lack: 0.6))
    augenEinsetzen(w, kopf, x: 0.50, y: 0.14, r: 0.13, tiefe: 0.24, iris: NSColor(calibratedRed: 0.15, green: 0.30, blue: 0.55, alpha: 1),
                   pupille: 0.62, aussen: 0.4, ausdruck: Ausdruck(oben: 0.06, unten: 0.0, schraeg: 0.0, funke: 1.5, groesse: 1.45))
    w.eulerAngles = SCNVector3(0.10, -0.35, 0.03)
    return (w, 8.6, V(0, 0.0, 0))
}

// ---------- Goldfisch ----------

func goldfisch() -> (SCNNode, Float, V) {
    // Clownfisch statt Goldfisch (Entscheidung des Inhabers; Kennung bleibt `goldfisch`, keine Nachbildung der Filmfigur):
    // runder orangefarbener Koerper, weisse Baender mit schwarzem Saum, Flossen mit schwarzem Rand, grosse Augen vorn.
    let orange = hex("#F26A1B"), weiss = hex("#FBF7F2"), schwarz = hex("#1B1715")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.80, 0.74, 1.10)), mitte: V(0, 0.05, -0.30)),
        Form(art: .ellipsoid(V(0.10, 0.50, 0.42)), mitte: V(0, 0.05, -1.55), weich: 0.14),             // Schwanzflosse
        Form(art: .ellipsoid(V(0.06, 0.34, 0.70)), mitte: V(0, 0.74, -0.45), weich: 0.12),             // Rueckenflosse
    ]
    for s: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.30, 0.20, 0.06)), mitte: V(0.82 * s, -0.20, 0.12),
                           drehung: simd_quatf(angle: s * 0.5, axis: V(0, 1, 0)) * simd_quatf(angle: s * -0.3, axis: V(0, 0, 1)), weich: 0.08))
    }
    let flossen = Array(formen.suffix(4))
    let kopf = Koerper(formen: formen, farbe: { p, _ in
        var c = farbeMitRauschen(orange, p, 0.03)
        // zwei weisse Baender quer zum Koerper, schwarz gesaeumt
        for (z, b) in [(Float(0.30), Float(0.13)), (-0.55, 0.14)] {
            let d = abs(p.z - z + 0.12 * p.y * p.y)
            c = mische(c, schwarz, glatt(b + 0.05, b + 0.02, d))
            c = mische(c, weiss, glatt(b, b - 0.02, d))
        }
        // Flossen: orange mit schwarzem Rand
        let df = flossen.map { $0.abstand(p) }.min() ?? 1
        let rand = glatt(-0.06, -0.10, -df) * glatt(0.02, -0.01, df)
        _ = rand
        let aussen = glatt(0.25, 0.40, simd_length(p - V(0, 0.05, -0.30)) - 0.8)
        return mische(c, schwarz, aussen * glatt(0.03, 0.0, df) * 0.9)
    }, rauheit: 0.45, fell: 0)
    var k = kopf; k.lack = 0.5
    let maul = mitMaul(k, Maul(kurven: paar(Kurve(punkte: [V(0, -0.30, 0.78), V(0.10, -0.28, 0.75), V(0.20, -0.22, 0.68)], spitzVorn: false)),
        r: 0.02, farbe: hex("#8A2A12"), staerke: 0.9, hoehlen: mundHoehle(mitte: V(0, -0.30, 0.78), breite: 0.12, hoehe: 0.07, tiefe: 0.08, offen: 0.0, kopf: kopf),
        innen: hex("#8A2F3A")))
    let w = SCNNode(); w.addChildNode(glanzKoerper(maul, grenze: 2.4, n: 230, rauheit: 0.4, lack: 0.5))
    augenEinsetzen(w, kopf, x: 0.27, y: 0.14, r: 0.14, tiefe: 0.24, iris: NSColor(calibratedRed: 0.55, green: 0.26, blue: 0.10, alpha: 1),
                   pupille: 0.6, ausdruck: Ausdruck(oben: 0.04, unten: 0.0, schraeg: 0.0, funke: 1.6, groesse: 1.65))
    w.eulerAngles = SCNVector3(0.06, -0.42, 0.06)
    return (w, 8.0, V(0, 0.05, 0))
}
// ---------- Meeresschildkroete ----------

func schildkroete() -> (SCNNode, Float, V) {
    // Trickfilm-Meeresschildkroete (Stil der Vorlage, keine Filmfigur): grosser runder Kopf mit sehr grossen Augen,
    // hell graugruene Haut mit braunen Flecken, gewoelbter warmbrauner Panzer mit Plattenmuster, gefleckte Flossen.
    let haut = hex("#B9C29A"), fleck = hex("#8A5A3A"), panzer = hex("#9C4A2E"), platte = hex("#C9773E")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.66, 0.58, 0.64)), mitte: V(0, 0.30, 0.25)),
        Form(art: .rundkegel(V(0, -0.30, -0.45), 0.34, 0.40), mitte: V(0, 0.05, 0.10), weich: 0.25),
    ]
    let panzerForm = Form(art: .ellipsoid(V(1.15, 0.62, 1.05)), mitte: V(0, -0.45, -0.85), drehung: simd_quatf(angle: -0.25, axis: V(1, 0, 0)), weich: 0.12)
    formen.append(panzerForm)
    for s: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.55, 0.09, 0.26)), mitte: V(0.95 * s, -0.55, 0.05),
                           drehung: simd_quatf(angle: s * -0.55, axis: V(0, 0, 1)) * simd_quatf(angle: s * 0.35, axis: V(0, 1, 0)), weich: 0.10))
    }
    let kopf = Koerper(formen: formen, farbe: { p, _ in
        var c = farbeMitRauschen(haut, p, 0.04)
        let z = zellen(p + 2, 5)
        c = mische(c, fleck, glatt(0.04, 0.07, z.rand) * (z.wert > 0.5 ? 0.75 : 0) * glatt(0.25, 0.6, abs(p.x) + max(0, -p.y)))
        // Panzer mit Platten (Zellen), Raender dunkler
        let amPanzer = glatt(0.06, 0.0, panzerForm.abstand(p))
        let pz = zellen(V(p.x, p.y * 1.4, p.z), 2.2)
        let pc = mische(mische(panzer, platte, glatt(0.0, 0.25, pz.rand) * (0.5 + 0.5 * pz.wert)), hex("#5A2A1A"), glatt(0.05, 0.0, pz.rand))
        return mische(c, pc, amPanzer)
    }, rauheit: 0.55, fell: 0)
    var k = kopf; k.lack = 0.3
    let maul = mitMaul(k, Maul(kurven: paar(Kurve(punkte: [V(0, 0.02, 0.86), V(0.12, 0.04, 0.82), V(0.24, 0.10, 0.74), V(0.32, 0.18, 0.64)], spitzVorn: false)),
        r: 0.02, farbe: hex("#4E5A3A"), staerke: 0.9, hoehlen: mundHoehle(mitte: V(0, 0.02, 0.86), breite: 0.14, hoehe: 0.08, tiefe: 0.08, offen: 0.0, kopf: kopf),
        innen: hex("#8A2F3A")))
    let w = SCNNode(); w.addChildNode(glanzKoerper(maul, grenze: 2.4, n: 230, rauheit: 0.5, lack: 0.3))
    augenEinsetzen(w, kopf, x: 0.27, y: 0.40, r: 0.15, tiefe: 0.22, iris: NSColor(calibratedRed: 0.45, green: 0.24, blue: 0.12, alpha: 1),
                   pupille: 0.62, ausdruck: Ausdruck(oben: 0.06, unten: 0.0, schraeg: 0.08, funke: 1.6, groesse: 1.75))
    w.eulerAngles = SCNVector3(0.20, -0.45, 0.08)
    return (w, 8.2, V(0, 0.0, 0))
}
// ---------- Runde 160: zwei Meerestiere, vier Voegel (Auftrag des Inhabers) ----------

func delfin() -> (SCNNode, Float, V) {
    // Trickfilm-Delfin nach der Vorlage: runde hellblaue Stirn, kurzer runder Schnabel, grosse Augen nach vorn,
    // offenes Lachen entlang des Schnabels, weisser Bauch, Brustflossen seitlich, Rueckenflosse.
    let blau = hex("#5FA8DE"), weiss = hex("#EEF5FA"), dunkel = hex("#24557F")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.72, 0.70, 0.72)), mitte: V(0, 0.28, 0)),
        Form(art: .rundkegel(V(0, 0.04, 0.48), 0.24, 0.17), mitte: V(0, -0.10, 0.52), weich: 0.20),
        Form(art: .rundkegel(V(0, -0.55, -1.30), 0.64, 0.35), mitte: V(0, -0.15, -0.20), weich: 0.40),
        Form(art: .rundkegel(V(0, 0.42, -0.30), 0.16, 0.03), mitte: V(0, 0.55, -0.85), weich: 0.12),
    ]
    for s: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.42, 0.08, 0.18)), mitte: V(0.70 * s, -0.75, 0.15),
                           drehung: simd_quatf(angle: s * -0.45, axis: V(0, 0, 1)), weich: 0.10))
    }
    let kopf = Koerper(formen: formen, farbe: { p, n in
        let bauch = glatt(-0.20, -0.32, p.y + 0.10 * abs(p.x)) * glatt(-0.2, 0.3, n.z + 0.2)
        return mische(farbeMitRauschen(blau, p, 0.03), weiss, bauch)
    }, rauheit: 0.4, fell: 0)
    var k = kopf; k.lack = 0.6
    let hoehle = mundHoehle(mitte: V(0, -0.15, 0.99), breite: 0.33, hoehe: 0.21, tiefe: 0.20, offen: 0.9, kopf: kopf)
    let zu = mundOeffnung(0.9) < 0.02
    let maul = mitMaul(k, Maul(kurven: zu ? paar(Kurve(punkte: [V(0, -0.24, 1.0), V(0.14, -0.22, 0.93), V(0.27, -0.14, 0.80), V(0.34, -0.04, 0.68)], spitzVorn: false))
                                          : paar(Kurve(punkte: [V(0.32, -0.20, 0.82), V(0.38, -0.10, 0.70), V(0.41, 0.0, 0.60)])),
        r: 0.022, farbe: dunkel, staerke: 0.9, hoehlen: hoehle, innen: hex("#8A2F3A")))
    let w = SCNNode(); w.addChildNode(glanzKoerper(maul, grenze: 2.4, n: 230, rauheit: 0.35, lack: 0.6))
    zunge(w, mitte: V(0, -0.15, 0.92), breite: 0.27, hoehe: 0.21, offen: 0.9)
    augenEinsetzen(w, kopf, x: 0.32, y: 0.42, r: 0.14, tiefe: 0.24, iris: NSColor(calibratedRed: 0.18, green: 0.14, blue: 0.12, alpha: 1),
                   pupille: 0.66, ausdruck: Ausdruck(oben: 0.04, unten: 0.0, schraeg: 0.0, funke: 1.6, groesse: 1.6))
    w.eulerAngles = SCNVector3(-0.22, -0.62, 0.10)
    return (w, 8.2, V(0, 0.05, 0))
}

func seeotter() -> (SCNNode, Float, V) {
    // Trickfilm-Seeotter: pummelig mit den Pfoten vor der Brust (Baerenbauplan), helles cremegraues Gesicht,
    // dunkelbrauner Koerper, kleine Ohren.
    let braun = hex("#5E4030"), gesicht = hex("#E6D9C6"), dunkel = hex("#2E1E16")
    return baerenFigur(BaerenArt(
        kopfFarbe: { p, _ in
            let c = farbeMitRauschen(braun, p, 0.04)
            return mische(c, farbeMitRauschen(gesicht, p, 0.03), glatt(-0.15, 0.25, p.z) * glatt(0.95, 0.65, p.y))
        },
        rumpfFarbe: { p, _, arm in mische(farbeMitRauschen(braun, p, 0.04), mische(braun, gesicht, 0.25), region(p, V(0, -1.85, 1.05), V(0.65, 0.7, 0.5), 0.3) * (1 - arm)) },
        brauen: dunkel, iris: NSColor(calibratedRed: 0.20, green: 0.12, blue: 0.08, alpha: 1), lippe: dunkel, ohr: 0.55))
}

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
    // Kleiner Trickfilm-Pinguin nach der Vorlage (statt Koenigspinguin, Entscheidung des Inhabers): rund, Kopf und Leib
    // fast eins, schwarze Kappe und Ruecken, weisses Gesicht (oben herzfoermig eingeschnitten) und Bauch, kleiner
    // orangefarbener Schnabel, zarte Wangenroete wie in der Vorlage, Flossen an der Seite.
    let schwarz = hex("#22252C"), weiss = hex("#F5F4F1"), rosa = hex("#F2B3B0")
    let kopf = Koerper(formen: [Form(art: .ellipsoid(V(0.80, 0.74, 0.74)), mitte: V(0, 0.30, -0.02))], farbe: { p, n in
        // weisses Gesicht: zwei Kreise um die Augen, unten zusammen (Herzform), darueber die schwarze Kappe
        var w: Float = 0
        for s: Float in [-1, 1] { w = max(w, glatt(0.36, 0.30, simd_length(simd_float2(p.x - 0.24 * s, p.y - 0.26)))) }
        w = max(w, glatt(0.10, 0.0, p.y) * glatt(0.55, 0.45, abs(p.x)))
        var c = mische(farbeMitRauschen(schwarz, p, 0.04), weiss, w * glatt(0.0, 0.35, n.z))
        for s: Float in [-1, 1] { c = mische(c, rosa, region(p, V(0.44 * s, 0.02, 0.58), V(0.13, 0.09, 0.2), 0.5) * 0.55) }
        return c
    }, rauheit: 0.70, fell: 0.03)
    var k0 = kopf
    k0.haar = haarKarte(kopf, FellKarte(kopf: 0.03, rumpf: 0.04, nase: V(0, 0.10, 0.78), schnauze: 0.25,
        augen: augenStellen(kopf, x: 0.24, y: 0.28), augenR: 0.28, braue: 0), braue: { _ in 0 })
    k0.fellArt = Fell(dichte: 160, ursprung: V(0, 0.10, 0.78), straehnen: 0.2)
    let leib: [Form] = [
        Form(art: .ellipsoid(V(0.92, 1.10, 0.82)), mitte: V(0, -0.90, -0.04), weich: 0.45),
        Form(art: .ellipsoid(V(0.18, 0.72, 0.36)), mitte: V(-0.96, -0.85, 0.0), drehung: simd_quatf(angle: 0.35, axis: V(0, 0, 1)), weich: 0.10),
        Form(art: .ellipsoid(V(0.18, 0.72, 0.36)), mitte: V(0.96, -0.85, 0.0), drehung: simd_quatf(angle: -0.35, axis: V(0, 0, 1)), weich: 0.10),
    ]
    let k = brustbild(k0, leib, farbe: { p, n in
        let bauch = region(p, V(0, -0.95, 0.55), V(0.66, 0.95, 0.55), 0.25) * glatt(0.0, 0.3, n.z)
        return mische(farbeMitRauschen(schwarz, p, 0.04), weiss, bauch)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    let ober = bogen([V(0, 0.16, 0.70), V(0, 0.13, 0.82), V(0, 0.09, 0.88)], [0.08, 0.055, 0.015], schmal: 1.2)
    schnabel(w, ober.formen, farbe: { p in mische(hex("#F79A3A"), hex("#E9762A"), glatt(0.3, 1.0, ober.t(p))) }, lack: 0.6, rauheit: 0.3)
    augenEinsetzen(w, kopf, x: 0.24, y: 0.30, r: 0.14, tiefe: 0.26, iris: NSColor(calibratedRed: 0.22, green: 0.14, blue: 0.10, alpha: 1),
                   pupille: 0.66, ausdruck: Ausdruck(oben: 0.04, unten: 0.0, schraeg: 0.04, funke: 1.6, groesse: 1.6))
    w.eulerAngles = SCNVector3(0.04, -0.18, 0.05)
    return (w, 8.0, V(0, -0.10, 0))
}

func papagei() -> (SCNNode, Float, V) {
    // Trickfilm-Ara nach der Vorlage: runder Kopf, blauer Scheitel mit struppigem Federschopf, gelb-orangefarbenes
    // Gesicht und Brust, rote Fluegel und Leib, grosser grauer Hakenschnabel, gruene Augen.
    let blau = hex("#3FA6E0"), gelb = hex("#FBB431"), orange = hex("#F4741E"), rot = hex("#E0301E")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.76, 0.74, 0.72)), mitte: V(0, 0.34, -0.02)),
        Form(art: .ellipsoid(V(0.40, 0.30, 0.34)), mitte: V(0, 0.16, 0.42), weich: 0.30),
    ]
    // Schopf: Buendel spitzer Federn nach oben hinten.
    for (i, s) in [Float(-1), -0.5, 0, 0.5, 1].enumerated() {
        let hoch: Float = i == 2 ? 0.62 : 0.48
        formen.append(Form(art: .rundkegel(V(0.18 * s, hoch, -0.22), 0.10, 0.012), mitte: V(0.14 * s, 0.92, -0.10), weich: 0.08))
    }
    let kopf = Koerper(formen: formen, farbe: { p, _ in
        var c = mische(farbeMitRauschen(gelb, p, 0.04), orange, glatt(0.2, -0.2, p.y) * 0.6)
        return mische(c, blau, glatt(0.62, 0.86, p.y + 0.15 * p.z * -1))
    }, rauheit: 0.80, fell: 0.04)
    var kopfF = kopf
    kopfF.haar = haarKarte(kopf, FellKarte(kopf: 0.035, rumpf: 0.05, nase: V(0, 0.18, 0.78), schnauze: 0.25,
        augen: augenStellen(kopf, x: 0.30, y: 0.42), augenR: 0.30, braue: 0), braue: { _ in 0 })
    kopfF.fellArt = Fell(dichte: 120, dicke: 0.46, aufrecht: 0.36, neigung: 1.6, ursprung: V(0, 0.18, 0.78), straehnen: 0.45)
    var leib: [Form] = [
        Form(art: .ellipsoid(V(0.72, 0.72, 0.66)), mitte: V(0, -0.50, -0.04), weich: 0.36),
        Form(art: .ellipsoid(V(0.76, 1.00, 0.70)), mitte: V(0, -1.40, -0.08), weich: 0.36),
    ]
    // Ausgebreitete Fluegel wie in der Vorlage: je ein Faecher aus Schwungfedern vom Schultergelenk nach aussen,
    // die oberen kurz und schraeg hoch, die unteren lang und haengend.
    var federn: [Form] = []
    for s: Float in [-1, 1] {
        let schulter = V(0.62 * s, -0.62, 0.05)
        // Flaeche des Fluegels, darauf ueberlappende breite Schwungfedern (duenn getrennt lasen sie sich als Finger).
        federn.append(Form(art: .ellipsoid(V(0.62, 0.50, 0.14)), mitte: schulter + V(0.50 * s, -0.20, 0.02),
                           drehung: simd_quatf(angle: s * 0.25, axis: V(0, 0, 1)), weich: 0.10))
        for (i, w) in [Float(0.85), 0.62, 0.40, 0.18, -0.04, -0.26, -0.48].enumerated() {
            let l: Float = 0.85 + 0.07 * Float(i)
            let richtung = V(cosf(w) * s, sinf(w), 0.08) * l
            federn.append(Form(art: .rundkegel(richtung, 0.17, 0.07), mitte: schulter + V(0.22 * s, -0.03 * Float(i), -0.015 * Float(i)),
                               stauchung: V(1, 1, 0.35), weich: 0.04))
        }
    }
    leib += federn
    let fluegel = federn
    let k = brustbild(kopfF, leib, farbe: { p, _ in
        var c = mische(gelb, orange, glatt(-0.2, -0.8, p.y))
        c = mische(c, rot, glatt(-0.8, -1.4, p.y) * 0.9 + glatt(0.45, 0.70, abs(p.x)) * 0.6)
        let fl = glatt(0.10, 0.02, fluegel.map { $0.abstand(p) }.min() ?? 1)
        // rote Fluegel mit Federreihen, zum Ende hin gelbe Spitzen
        let fz = federZelle(p, 6)
                let fc = mische(mische(farbeMitRauschen(rot, p, 0.05) * (0.85 + 0.25 * fz.wert), orange, glatt(1.2, 1.6, abs(p.x)) * 0.7), gelb, glatt(1.55, 1.9, abs(p.x)) * 0.6)
        return mische(farbeMitRauschen(c, p, 0.04), fc, fl)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    let ober = bogen([V(0, 0.36, 0.56), V(0, 0.38, 0.76), V(0, 0.26, 0.92), V(0, 0.06, 0.96), V(0, -0.10, 0.88), V(0, -0.15, 0.80)],
                     [0.24, 0.21, 0.16, 0.10, 0.05, 0.016], schmal: 0.70)
    schnabel(w, ober.formen, farbe: { p in mische(hex("#8E9096"), hex("#4A4C52"), glatt(0.4, 0.95, ober.t(p))) }, lack: 0.5, rauheit: 0.3)
    // Unterschnabel: offen wie in der Vorlage (froh weiter, muede zu); dazwischen dunkles Inneres mit Zunge.
    let o = mundOeffnung(0.8)
    let unter = bogen([V(0, 0.10 - 0.06 * o, 0.62), V(0, 0.02 - 0.10 * o, 0.74), V(0, -0.02 - 0.12 * o, 0.82)], [0.13, 0.09, 0.03], schmal: 0.80)
    schnabel(w, unter.formen, farbe: { _ in hex("#3A3B40") }, lack: 0.4, rauheit: 0.4)
    if o > 0.02 {
        w.addChildNode(perle(V(0, 0.08 - 0.05 * o, 0.68), V(0.10, 0.06 * o + 0.02, 0.10), farbe: NSColor(calibratedRed: 0.35, green: 0.10, blue: 0.14, alpha: 1), rauheit: 0.6))
        w.addChildNode(perle(V(0, 0.04 - 0.06 * o, 0.72), V(0.06, 0.035, 0.06), farbe: NSColor(calibratedRed: 0.55, green: 0.30, blue: 0.34, alpha: 1), rauheit: 0.5))
    }
    // weisser Ring um die Augen
    for s: Float in [-1, 1] {
        w.addChildNode(perle(aufFlaeche(kopf, V(0.30 * s, 0.42, 0.8)) - V(0, 0, 0.06), V(0.20, 0.20, 0.06), farbe: NSColor(white: 0.97, alpha: 1), rauheit: 0.6))
    }
    augenEinsetzen(w, kopf, x: 0.30, y: 0.42, r: 0.14, tiefe: 0.10, iris: NSColor(calibratedRed: 0.42, green: 0.66, blue: 0.20, alpha: 1),
                   pupille: 0.58, aussen: 0.3, ausdruck: Ausdruck(oben: 0.06, unten: 0.0, schraeg: 0.0, funke: 1.5, groesse: 1.55))
    w.eulerAngles = SCNVector3(0.04, -0.58, 0.08)
    return (w, 8.4, V(0, -0.25, 0.15))
}

// ---------- Runde 163: Mops und Siamkatze (Auftrag des Inhabers) ----------

func flamingo() -> (SCNNode, Float, V) {
    // Trickfilm-Flamingo: runder rosa Kopf mit sehr grossen Augen und Brauen, dicker Schnabel, der zwischen den Augen
    // ansetzt und sanft nach unten knickt (hell mit schwarzer Spitze), S-Hals, flauschiger Leib mit dunkleren Fluegeln.
    let rosa = hex("#F7A3B8"), tief = hex("#E9668C"), dunkel = hex("#8A3A52")
    let kopf = Koerper(formen: [Form(art: .ellipsoid(V(0.66, 0.62, 0.62)), mitte: V(0, 0.30, 0))], farbe: { p, _ in
        farbeMitRauschen(rosa, p, 0.03)
    }, rauheit: 0.8, fell: 0.03)
    var (k0, braueM) = mitBrauen(kopf, x: 0.26, y: 0.66, laenge: 0.13, dicke: 0.045, winkel: 0.15, farbe: dunkel, staerke: 0.8)
    k0.haar = haarKarte(kopf, FellKarte(kopf: 0.035, rumpf: 0.07, nase: V(0, 0.22, 0.64), schnauze: 0.25,
        augen: augenStellen(kopf, x: 0.25, y: 0.38), augenR: 0.28, braue: 0.2), braue: braueM)
    k0.fellArt = Fell(dichte: 120, ursprung: V(0, 0.22, 0.64), straehnen: 0.3)
    var leib: [Form] = [
        // S-Hals: nach hinten unten, dann nach vorn zum Leib
        Form(art: .rundkegel(V(0, -0.55, -0.35), 0.24, 0.22), mitte: V(0, -0.05, -0.10), weich: 0.20),
        Form(art: .rundkegel(V(0, -0.55, 0.30), 0.22, 0.30), mitte: V(0, -0.60, -0.45), weich: 0.20),
        Form(art: .ellipsoid(V(0.85, 0.75, 0.95)), mitte: V(0, -1.55, -0.30), weich: 0.35),
    ]
    let fluegel = [Form(art: .ellipsoid(V(0.30, 0.55, 0.75)), mitte: V(-0.72, -1.45, -0.35), drehung: simd_quatf(angle: 0.25, axis: V(0, 0, 1)), weich: 0.10),
                   Form(art: .ellipsoid(V(0.30, 0.55, 0.75)), mitte: V(0.72, -1.45, -0.35), drehung: simd_quatf(angle: -0.25, axis: V(0, 0, 1)), weich: 0.10)]
    leib += fluegel
    let k = brustbild(k0, leib, farbe: { p, _ in
        let fl = glatt(0.10, 0.02, fluegel.map { $0.abstand(p) }.min() ?? 1)
        let fz = federZelle(p, 5)
        return mische(farbeMitRauschen(rosa, p, 0.04), tief * (0.88 + 0.2 * fz.wert), max(fl, glatt(-1.6, -2.1, p.y) * 0.5))
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    let ober = bogen([V(0, 0.30, 0.52), V(0, 0.26, 0.74), V(0, 0.18, 0.88), V(0, 0.02, 0.94), V(0, -0.12, 0.90)],
                     [0.15, 0.14, 0.11, 0.07, 0.025], schmal: 0.85)
    schnabel(w, ober.formen, farbe: { p in
        let t = ober.t(p)
        return mische(mische(hex("#F8E4E2"), hex("#F2B4BE"), glatt(0.0, 0.4, t)), hex("#1E1A1B"), glatt(0.58, 0.70, t))
    }, lack: 0.5, rauheit: 0.3)
    augenEinsetzen(w, kopf, x: 0.25, y: 0.40, r: 0.13, tiefe: 0.20, iris: NSColor(calibratedRed: 0.90, green: 0.66, blue: 0.22, alpha: 1),
                   pupille: 0.58, ausdruck: Ausdruck(oben: 0.08, unten: 0.0, schraeg: 0.04, funke: 1.6, groesse: 1.75))
    w.eulerAngles = SCNVector3(0.06, -0.50, 0.08)
    return (w, 8.2, V(0, -0.30, 0))
}

func rotkehlchen() -> (SCNNode, Float, V) {
    // Trickfilm-Rotkehlchen: runder Kopf auf rundem Leib, olivbrauner Scheitel und Ruecken, orangerotes Gesicht und Brust,
    // weisser Bauch, Fluegel mit hellen Federstufen, kleiner Schwanz, kleiner dunkler Schnabel, grosse Augen, Brauen.
    let braun = hex("#8C6A46"), orange = hex("#F2743A"), weiss = hex("#F8F2EA"), dunkel = hex("#4A3524")
    let kopf = Koerper(formen: [Form(art: .ellipsoid(V(0.74, 0.70, 0.70)), mitte: V(0, 0.36, 0))], farbe: { p, n in
        let c = farbeMitRauschen(braun, p, 0.04)
        // orangefarbenes Gesicht, oben als Bogen ueber den Augen begrenzt
        return mische(c, farbeMitRauschen(orange, p, 0.03), glatt(0.78, 0.62, p.y + 0.30 * abs(p.x)) * glatt(-0.1, 0.3, n.z))
    }, rauheit: 0.8, fell: 0.03)
    var (k0, braueM) = mitBrauen(kopf, x: 0.27, y: 0.70, laenge: 0.13, dicke: 0.045, winkel: 0.18, farbe: dunkel, staerke: 0.8)
    k0.haar = haarKarte(kopf, FellKarte(kopf: 0.035, rumpf: 0.05, nase: V(0, 0.26, 0.72), schnauze: 0.25,
        augen: augenStellen(kopf, x: 0.27, y: 0.42), augenR: 0.28, braue: 0.2), braue: braueM)
    k0.fellArt = Fell(dichte: 120, ursprung: V(0, 0.26, 0.72), straehnen: 0.3)
    var leib: [Form] = [
        Form(art: .ellipsoid(V(0.88, 0.95, 0.82)), mitte: V(0, -0.85, -0.05), weich: 0.25),
        Form(art: .rundkegel(V(0, -0.20, -0.75), 0.22, 0.10), mitte: V(0, -1.05, -0.70), stauchung: V(1.6, 0.5, 1), weich: 0.10),   // Schwanz
    ]
    let fluegel = [Form(art: .ellipsoid(V(0.28, 0.72, 0.58)), mitte: V(-0.80, -0.85, -0.08), drehung: simd_quatf(angle: 0.18, axis: V(0, 0, 1)), weich: 0.08),
                   Form(art: .ellipsoid(V(0.28, 0.72, 0.58)), mitte: V(0.80, -0.85, -0.08), drehung: simd_quatf(angle: -0.18, axis: V(0, 0, 1)), weich: 0.08)]
    leib += fluegel
    let k = brustbild(k0, leib, farbe: { p, n in
        var c = mische(farbeMitRauschen(orange, p, 0.03), weiss, glatt(-0.70, -1.10, p.y))
        c = mische(c, farbeMitRauschen(braun, p, 0.04), glatt(0.10, -0.30, n.z))
        // Fluegel: braun mit hellen Federstufen
        let fl = glatt(0.10, 0.02, fluegel.map { $0.abstand(p) }.min() ?? 1)
        let stufe = glatt(0.75, 0.95, sinf(p.y * 13) * 0.5 + 0.5) * glatt(-0.8, -1.2, p.y)
        return mische(c, mische(farbeMitRauschen(braun, p, 0.05), hex("#D9C3A0"), stufe * 0.7), fl)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(k))
    let ober = bogen([V(0, 0.26, 0.66), V(0, 0.24, 0.80), V(0, 0.20, 0.90)], [0.08, 0.05, 0.012], schmal: 1.0)
    schnabel(w, ober.formen, farbe: { _ in hex("#2E2622") }, lack: 0.5, rauheit: 0.35)
    augenEinsetzen(w, kopf, x: 0.27, y: 0.44, r: 0.14, tiefe: 0.20, iris: NSColor(calibratedRed: 0.24, green: 0.14, blue: 0.08, alpha: 1),
                   pupille: 0.64, ausdruck: Ausdruck(oben: 0.04, unten: 0.0, schraeg: 0.06, funke: 1.6, groesse: 1.75))
    w.eulerAngles = SCNVector3(0.04, -0.30, 0.10)
    return (w, 8.0, V(0, -0.10, 0))
}

// ---------- Runde 163: Mops und Siamkatze (Auftrag des Inhabers) ----------

func mops() -> (SCNNode, Float, V) {
    // Trickfilm-Mops nach der Vorlage: runder Kopf, flaches Gesicht mit kurzer, breiter schwarzer Maske, weiche
    // Stirnfalten (Mulden, keine Striche), kleine schwarze Klappohren, sehr grosse runde Augen weit auseinander.
    let beige = hex("#E3C08D"), schwarz = hex("#231C1A"), hell = hex("#EFD3A6")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.80, 0.74, 0.72)), mitte: V(0, 0.16, 0)),
        Form(art: .ellipsoid(V(0.42, 0.30, 0.30)), mitte: V(0, -0.22, 0.64), weich: 0.25),   // kurze breite Schnauze
    ]
    // Stirnfalten als flache Mulden
    for (i, y) in [Float(0.66), 0.56].enumerated() {
        formen.append(Form(art: .rundkegel(V(0.36, 0.04 * Float(i), 0), 0.035, 0.035), mitte: V(-0.18, y, 0.70), weich: 0.05, abziehen: true))
    }
    for s: Float in [-1, 1] {
        let dreh = simd_quatf(angle: s * -1.25, axis: V(0, 0, 1)) * simd_quatf(angle: -0.6, axis: V(1, 0, 0))
        formen.append(Form(art: .ellipsoid(V(0.32, 0.28, 0.06)), mitte: V(0.80 * s, 0.50, 0.10), drehung: dreh, weich: 0.07))
    }
    let kopf = Koerper(formen: formen, farbe: { p, _ in
        var c = farbeMitRauschen(beige, p, 0.04)
        c = mische(c, schwarz, region(p, V(0, -0.16, 0.80), V(0.48, 0.38, 0.32), 0.25))           // Maske
        for s: Float in [-1, 1] { c = mische(c, schwarz, region(p, V(0.32 * s, 0.27, 0.66), V(0.30, 0.26, 0.34), 0.45) * 0.85) }
        // Stirnfalten: dunklere weiche Baender
        c = mische(c, mische(beige, schwarz, 0.45), glatt(0.78, 0.95, sinf((p.y - 0.10 * abs(p.x)) * 30) * 0.5 + 0.5) * glatt(0.48, 0.58, p.y) * glatt(0.75, 0.55, p.y) * glatt(0.40, 0.20, abs(p.x)) * 0.6)
        return mische(c, schwarz, glatt(0.56, 0.66, abs(p.x)) * glatt(0.50, 0.60, p.y))          // Ohren
    }, rauheit: 0.68, fell: 0.03)
    var (mitB, braueM) = mitBrauen(kopf, x: 0.30, y: 0.60, laenge: 0.13, dicke: 0.05, winkel: 0.30, farbe: mische(beige, schwarz, 0.4), staerke: 0.7)
    mitB.haar = haarKarte(kopf, FellKarte(kopf: 0.035, rumpf: 0.045, nase: V(0, -0.06, 0.94), schnauze: 0.5,
        augen: augenStellen(kopf, x: 0.32, y: 0.28), augenR: 0.30, braue: 0.2), braue: braueM)
    mitB.fellArt = Fell(dichte: 150, ursprung: V(0, -0.06, 0.94), straehnen: 0.15)
    let hoehle = mundHoehle(mitte: V(0, -0.36, 0.88), breite: 0.16, hoehe: 0.10, tiefe: 0.10, offen: 0.0, kopf: kopf)
    let maul = mitMaul(mitB, Maul(kurven: [Kurve(punkte: [V(0, -0.14, 0.94), V(0, -0.28, 0.90)], spitzHinten: false)]
        + paar(Kurve(punkte: [V(0, -0.28, 0.90), V(0.10, -0.33, 0.86), V(0.22, -0.30, 0.78), V(0.30, -0.22, 0.68)], spitzVorn: false)),
        r: 0.024, farbe: hex("#0E0A0A"), staerke: 0.9, hoehlen: hoehle, innen: hex("#93323A")))
    let bau = Bau(brust: 2.0, tiefe: 1.5, hals: 0.62, halsLaenge: 1.1, bein: 0.33, beinAbstand: 0.40, beinOben: -1.30, ruecken: 1.0, rueckenLaenge: 1.3)
    let koerper = brustbild(maul, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(beige, p, 0.04), hell, latz(p, breite: 0.35) * 0.5)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    trickNase(w, mitte: V(0, -0.04, 0.95), r: V(0.14, 0.09, 0.08), farbe: hex("#100C0C"))
    zunge(w, mitte: V(0, -0.36, 0.84), breite: 0.13, hoehe: 0.10, offen: 0.0)
    augenEinsetzen(w, kopf, x: 0.32, y: 0.28, r: 0.16, tiefe: 0.24, iris: NSColor(calibratedRed: 0.34, green: 0.18, blue: 0.08, alpha: 1),
                   pupille: 0.50, ausdruck: Ausdruck(oben: 0.04, unten: 0.0, schraeg: 0.12, funke: 1.6, groesse: 1.65), irisAnteil: 0.84)
    w.eulerAngles = SCNVector3(0.04, -0.15, 0.03)
    return (w, 7.6, V(0, 0.18, 0))
}

func siamkatze() -> (SCNNode, Float, V) {
    // Siamkatze im Trickfilm-Stil: cremefarben, dunkelbraune Maske um die Schnauze, dunkle Ohren, blaue Augen.
    let creme = hex("#F2E7D4"), punkt = hex("#4E3729")
    return katzenFigur(KatzenArt(
        farbe: { p, _ in
            var c = farbeMitRauschen(creme, p, 0.03)
            c = mische(c, punkt, region(p, V(0, 0.02, 0.72), V(0.52, 0.50, 0.40), 0.40))
            return mische(c, punkt, glatt(0.72, 0.86, p.y))
        },
        rumpf: { p in mische(farbeMitRauschen(creme, p, 0.03), mische(creme, punkt, 0.25), glatt(-0.8, -1.6, p.y) * 0.5) },
        iris: NSColor(calibratedRed: 0.30, green: 0.56, blue: 0.92, alpha: 1), braue: punkt, nase: hex("#5A3E34")))
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

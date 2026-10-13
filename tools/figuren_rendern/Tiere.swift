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
//   blick   wohin, relativ zur Kamera in Weltkoordinaten (0 = den Betrachter ansehen)
// Dazu `funke` (Groesse des Lichtpunkts), `wange` (weiche Roete, eine Flaeche, kein Strich) und
// `zwinkern` (das linke Auge geschlossen, als Bogen).
struct Ausdruck {
    var oben: Float = 0.2
    var unten: Float = 0
    var schraeg: Float = 0
    var blick = V(0, 0, 0)
    var funke: CGFloat = 1.3
    var wange: Float = 0
    var zwinkern = false
    var groesse: CGFloat = 1.15     // grosse Augen tragen den groessten Teil von "suess"
}
// Wohin die Augen sehen, wird erst in main.swift gesetzt, wenn die Kamera feststeht (Augen heissen
// "auge"); bis dahin merkt sich das Tier hier seinen Versatz.
var blickVersatz = V(0, 0, 0)

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
            let c = farbe * (1 - 0.6 * glatt(tMax - 0.30, tMax, t))
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
    m.roughness.contents = 0.7; m.isDoubleSided = true
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

// Weiche Wangenroete unter den Augen.
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

// Augen an der Kopfseite (Wal, Goldfisch, Schildkroete): gleiche Lider, Lid-Achse an der Seitenflaeche.
func seitenAuge(_ w: SCNNode, _ k: Koerper, x: Float, y: Float, tiefe: Float, sz: Float, r: CGFloat, iris: NSColor,
                pupille: CGFloat, _ a: Ausdruck) {
    blickVersatz = a.blick
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
                    iris: NSColor, pupille: CGFloat = 0.5, schlitz: Bool = false, quer: Bool = false,
                    blick: V = V(0, 0, 6), aussen: Float = 0.25, ausdruck a: Ausdruck = Ausdruck()) {
    blickVersatz = a.blick
    let r = r * a.groesse
    for s: Float in [-1, 1] {
        let zf = vorderflaeche(kopf, x * s, y)
        let mitte = V(x * s, y, zf - tiefe * Float(r))
        let au = auge(radius: r, iris: iris, pupille: pupille, schlitz: schlitz, quer: quer, funke: a.funke)
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
func kopfKnoten(_ k: Koerper, grenze: Float = 1.9, n: Int = 170) -> SCNNode {
    SCNNode(geometry: geometrie(netzBauen(k, grenze: grenze, n: n), k))
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
func brustbild(_ kopf: Koerper, _ formen: [Form], farbe: @escaping (V, V) -> V) -> Koerper {
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
        Form(art: .ellipsoid(V(0.90, 0.74, 0.80)), mitte: V(0, 0.18, -0.08)),
        Form(art: .ellipsoid(V(0.46, 0.32, 0.38)), mitte: V(-0.62, -0.20, 0.08), weich: 0.28),
        Form(art: .ellipsoid(V(0.46, 0.32, 0.38)), mitte: V(0.62, -0.20, 0.08), weich: 0.28),
        Form(art: .rundkegel(V(0, -0.24, 1.22), 0.32, 0.10), mitte: V(0, -0.04, 0.40), weich: 0.24),
        Form(art: .rundkegel(V(0, -0.04, 0.88), 0.22, 0.08), mitte: V(0, -0.30, 0.40), weich: 0.16),
        Form(art: .ellipsoid(V(0.55, 0.22, 0.30)), mitte: V(0, 0.38, 0.52), weich: 0.25),
    ]
    formen += ohrPaar(0.44, 0.60, -0.12, laenge: V(0.26, 0.86, -0.10), r1: 0.36, r2: 0.035, flach: 0.40)
    formen += lider(0.34, 0.18, 0.62, 0.19)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(rot, p, 0.08)
        let linie = -0.16 - 0.08 * abs(p.x) + 0.10 * max(0, p.z - 0.7)
        let w = glatt(linie + 0.05, linie - 0.05, p.y) * glatt(-0.3, 0.2, p.z + 0.5 * abs(p.x) - 0.2)
        c = mische(c, farbeMitRauschen(weiss, p, 0.04), w)
        // Ohren: Rueckseite und Rand dunkel, Innenseite creme.
        let ohr = glatt(0.70, 0.86, p.y) * glatt(0.20, 0.34, abs(p.x))
        let innen = glatt(-0.1, 0.3, n.z) * glatt(1.42, 1.15, p.y)
        c = mische(c, mische(mische(c, dunkel, 0.65), creme, innen), ohr)
        c = mische(c, dunkel, glatt(1.30, 1.44, p.y))
        c *= 1 - 0.25 * glatt(1.1, 1.6, p.z) * glatt(-0.30, -0.05, p.y)
        return c
    }, rauheit: 0.72, fell: 0.07)
    let bau = Bau(tiefe: 1.45)
    let koerper = brustbild(mitWangen(kopf, x: 0.44, y: -0.08, staerke: 0.30), vierbeiner(bau), farbe: { p, _ in
        // Weisse Kehle und Brust, dunkle "Struempfe" an den Vorderbeinen.
        let c = mische(farbeMitRauschen(rot, p, 0.08), farbeMitRauschen(weiss, p, 0.04), latz(p, breite: 0.28))
        return mische(c, dunkel, beinUnten(p, bau, ab: 0.30) * 0.85)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    nase(w, [Form(art: .ellipsoid(V(0.115, 0.08, 0.10)), mitte: V(0, -0.27, 1.64))], farbe: hex("#161112"))
    augenEinsetzen(w, kopf, x: 0.34, y: 0.18, r: 0.19, iris: NSColor(calibratedRed: 0.93, green: 0.63, blue: 0.16, alpha: 1), pupille: 0.64, ausdruck: Ausdruck(oben: 0.08, unten: 0.30, schraeg: 0.10, blick: V(-0.6, 0.8, 0), funke: 1.4, wange: 0.30))
    w.eulerAngles = SCNVector3(0.08, 0.50, 0)
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
    formen += lider(0.33, 0.12, 0.66, 0.21, weich: 0.12)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(rot, p, 0.07)
        // Tigerung: Streifen quer ueber Stirn und Wangen, auf der Stirn das "M".
        let band = sinf(p.x * 9 + sinf(p.y * 3) * 0.8) * 0.5 + 0.5
        let stirn = glatt(0.30, 0.55, p.y) * glatt(0.75, 0.2, abs(p.x)) * glatt(0.82, 0.75, band)
        let wange = glatt(0.35, 0.65, abs(p.x)) * glatt(0.75, 0.68, sinf(p.y * 11 + abs(p.x) * 4) * 0.5 + 0.5)
        c = mische(c, streifen, (stirn + wange * 0.8) * glatt(-0.4, 0.2, p.y + 0.5))
        // Weiss: Schnurrhaarpolster, Kinn.
        let weissAnteil = glatt(-0.08, -0.18, p.y) * glatt(0.35, 0.65, p.z) + glatt(-0.30, -0.42, p.y)
        c = mische(c, weiss, weissAnteil)
        let ohr = glatt(0.62, 0.78, p.y) * glatt(0.25, 0.36, abs(p.x)) * glatt(0.1, 0.5, n.z) * glatt(1.20, 1.0, p.y)
        c = mische(c, rosa, ohr * 0.85)
        return c
    }, rauheit: 0.72, fell: 0.06)
    let bau = Bau(bein: 0.17, ruecken: 0.60)
    let koerper = brustbild(mitWangen(kopf, x: 0.44, y: -0.14, staerke: 0.40), vierbeiner(bau), farbe: { p, _ in
        // Getigert auch am Koerper: Ringe um die Beine, Streifen ueber den Ruecken; weisse Brust.
        var c = farbeMitRauschen(rot, p, 0.07)
        let ringe = glatt(0.72, 0.85, sinf(p.y * 11 + abs(p.x) * 2) * 0.5 + 0.5) * glatt(-1.3, -1.5, p.y)
        let ruecken = glatt(0.74, 0.86, sinf(p.z * 8 + p.y * 2) * 0.5 + 0.5) * glatt(0.0, -0.4, p.z)
        c = mische(c, streifen, max(ringe, ruecken) * 0.8)
        return mische(c, farbeMitRauschen(weiss, p, 0.04), latz(p, breite: 0.30))
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    nase(w, [Form(art: .rundkegel(V(0, -0.10, 0.02), 0.07, 0.03), mitte: V(0, -0.06, 0.92), stauchung: V(1.6, 1, 1))], farbe: hex("#D98A88"), lack: 0.6)
    augenEinsetzen(w, kopf, x: 0.33, y: 0.12, r: 0.21, iris: NSColor(calibratedRed: 0.62, green: 0.74, blue: 0.22, alpha: 1), pupille: 0.52, ausdruck: Ausdruck(oben: 0.10, unten: 0.38, schraeg: 0.14, blick: V(0, 0.4, 0), funke: 1.5, wange: 0.40))
    w.eulerAngles = SCNVector3(0.06, 0.38, 0)
    return (w, 7.3, V(0, 0.18, 0))
}

// ---------- Baer ----------

func baer() -> (SCNNode, Float, V) {
    let braun = hex("#7A4A2B"), hell = hex("#C99A68"), innen = hex("#5A3420")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(1.00, 0.88, 0.90)), mitte: V(0, 0.08, 0)),
        Form(art: .ellipsoid(V(0.50, 0.40, 0.45)), mitte: V(-0.55, -0.25, 0.25), weich: 0.35),
        Form(art: .ellipsoid(V(0.50, 0.40, 0.45)), mitte: V(0.55, -0.25, 0.25), weich: 0.35),
        // Schnauze: rund und kraeftig.
        Form(art: .ellipsoid(V(0.42, 0.33, 0.40)), mitte: V(0, -0.22, 0.78), weich: 0.25),
    ]
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.27, 0.27, 0.16)), mitte: V(0.66 * sx, 0.78, -0.12), weich: 0.12))
        formen.append(Form(art: .ellipsoid(V(0.16, 0.16, 0.10)), mitte: V(0.68 * sx, 0.80, -0.01), weich: 0.06, abziehen: true))
    }
    formen += lider(0.34, 0.20, 0.72, 0.15)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(braun, p, 0.09)
        c = mische(c, farbeMitRauschen(hell, p, 0.05), region(p, V(0, -0.24, 0.92), V(0.40, 0.32, 0.30), 0.3))
        c = mische(c, innen, glatt(0.62, 0.72, p.y) * glatt(0.48, 0.58, abs(p.x)) * glatt(0.2, 0.6, n.z) * 0.6)
        return c
    }, rauheit: 0.78, fell: 0.08)
    let bau = Bau(brust: 1.45, tiefe: 1.1, hals: 0.52, bein: 0.27, beinAbstand: 0.33, ruecken: 0.85, rueckenHoehe: -0.85)
    let koerper = brustbild(mitWangen(kopf, x: 0.46, y: -0.06, staerke: 0.30), vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(braun, p, 0.09), farbeMitRauschen(hell, p, 0.05), latz(p, breite: 0.40) * 0.25)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    nase(w, [Form(art: .ellipsoid(V(0.20, 0.13, 0.13)), mitte: V(0, -0.07, 1.12))], farbe: hex("#1A1312"))
    augenEinsetzen(w, kopf, x: 0.34, y: 0.20, r: 0.15, iris: NSColor(calibratedRed: 0.36, green: 0.20, blue: 0.10, alpha: 1), pupille: 0.55, ausdruck: Ausdruck(oben: 0.10, unten: 0.05, schraeg: 0.28, blick: V(0, 1.8, 0), funke: 1.6, wange: 0.30))
    w.eulerAngles = SCNVector3(0.06, 0.36, 0)
    return (w, 7.3, V(0, 0.15, 0))
}

// ---------- Panda ----------

func panda() -> (SCNNode, Float, V) {
    let weiss = hex("#F1EEE6"), schwarz = hex("#211E1E")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(1.04, 0.86, 0.90)), mitte: V(0, 0.06, 0)),
        Form(art: .ellipsoid(V(0.52, 0.40, 0.44)), mitte: V(-0.56, -0.24, 0.22), weich: 0.35),
        Form(art: .ellipsoid(V(0.52, 0.40, 0.44)), mitte: V(0.56, -0.24, 0.22), weich: 0.35),
        Form(art: .ellipsoid(V(0.38, 0.28, 0.34)), mitte: V(0, -0.24, 0.76), weich: 0.25),
    ]
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.28, 0.27, 0.18)), mitte: V(0.70 * sx, 0.74, -0.10), weich: 0.12))
    }
    formen += lider(0.34, 0.16, 0.72, 0.15)
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
    let bau = Bau(brust: 1.45, tiefe: 1.1, hals: 0.52, bein: 0.27, beinAbstand: 0.33, ruecken: 0.85, rueckenHoehe: -0.90)
    let koerper = brustbild(mitWangen(kopf, x: 0.48, y: -0.14, staerke: 0.40), vierbeiner(bau), farbe: { p, _ in
        // Das Pandamuster: weisser Koerper, schwarze Vorderbeine, und ein schwarzer Guertel ueber die
        // Schultern, der beide Beine ueber den Ruecken verbindet.
        let guertel = glatt(0.50, 0.24, abs(p.z + 0.40)) * glatt(-0.46, -0.80, p.y)   // Runde 137: weicher auslaufend
        let beine = max(glatt(-0.74, -1.02, p.y) * glatt(0.04, 0.32, abs(p.x)), glatt(-1.20, -1.45, p.y))
        return mische(farbeMitRauschen(weiss, p, 0.04), farbeMitRauschen(schwarz, p, 0.05), max(guertel, beine))
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    nase(w, [Form(art: .ellipsoid(V(0.16, 0.10, 0.11)), mitte: V(0, -0.10, 1.06))], farbe: hex("#141212"))
    augenEinsetzen(w, kopf, x: 0.34, y: 0.16, r: 0.15, iris: NSColor(calibratedRed: 0.38, green: 0.24, blue: 0.12, alpha: 1), pupille: 0.55, ausdruck: Ausdruck(oben: 0.26, unten: 0.26, schraeg: 0.20, blick: V(-1.0, -0.4, 0), funke: 1.5, wange: 0.40))
    w.eulerAngles = SCNVector3(0.06, 0.34, 0)
    return (w, 7.3, V(0, 0.15, 0))
}

// ---------- Hase (Wildkaninchen) ----------

func hase() -> (SCNNode, Float, V) {
    let grau = hex("#9B8370"), hell = hex("#E9E1D6"), rosa = hex("#E5B1A8")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.82, 0.76, 0.86)), mitte: V(0, 0.0, 0)),
        Form(art: .ellipsoid(V(0.42, 0.34, 0.40)), mitte: V(-0.40, -0.30, 0.38), weich: 0.32),
        Form(art: .ellipsoid(V(0.42, 0.34, 0.40)), mitte: V(0.40, -0.30, 0.38), weich: 0.32),
        Form(art: .ellipsoid(V(0.30, 0.24, 0.26)), mitte: V(0, -0.20, 0.72), weich: 0.20),
    ]
    for sx: Float in [-1, 1] {
        let dreh = simd_quatf(angle: -0.18 * sx, axis: V(0, 0, 1)) * simd_quatf(angle: -0.25, axis: V(1, 0, 0))
        formen.append(Form(art: .ellipsoid(V(0.24, 0.78, 0.09)), mitte: V(0.30 * sx, 1.10, -0.20), drehung: dreh, weich: 0.14))
        formen.append(Form(art: .ellipsoid(V(0.16, 0.66, 0.06)), mitte: V(0.30 * sx, 1.12, -0.13), drehung: dreh, weich: 0.05, abziehen: true))
    }
    formen += lider(0.40, 0.14, 0.52, 0.18)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(grau, p, 0.10)
        c = mische(c, farbeMitRauschen(hell, p, 0.04), glatt(-0.10, -0.30, p.y) * glatt(0.2, 0.6, p.z))
        c = mische(c, hell, region(p, V(0, -0.08, 0.86), V(0.20, 0.12, 0.2), 0.4) * 0.7)
        let ohrInnen = glatt(0.65, 0.85, p.y) * glatt(0.0, 0.4, n.z)
        c = mische(c, rosa, ohrInnen * 0.8)
        return c
    }, rauheit: 0.80, fell: 0.07)
    let bau = Bau(hals: 0.42, halsLaenge: 0.7, bein: 0.15, beinAbstand: 0.20, beinOben: -1.05, ruecken: 0.90, rueckenLaenge: 1.1, rueckenHoehe: -1.05)
    let koerper = brustbild(mitWangen(kopf, x: 0.46, y: -0.12, staerke: 0.45), vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(grau, p, 0.10), farbeMitRauschen(hell, p, 0.04), latz(p, breite: 0.30, hoehe: 0.10) * 0.85)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    nase(w, [Form(art: .ellipsoid(V(0.09, 0.06, 0.06)), mitte: V(0, -0.06, 0.98))], farbe: hex("#D28E8C"), lack: 0.5)
    augenEinsetzen(w, kopf, x: 0.40, y: 0.14, r: 0.18, iris: NSColor(calibratedRed: 0.28, green: 0.16, blue: 0.09, alpha: 1), pupille: 0.6, aussen: 0.5, ausdruck: Ausdruck(oben: 0.04, unten: 0, schraeg: 0.10, blick: V(1.6, 1.4, 0), funke: 1.7, wange: 0.45))
    w.eulerAngles = SCNVector3(0.04, 0.40, 0)
    return (w, 8.6, V(0, 0.55, 0))
}

// ---------- Reh ----------

func reh() -> (SCNNode, Float, V) {
    let braun = hex("#B47548"), weiss = hex("#F2E8DC"), dunkel = hex("#3A2418")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.72, 0.70, 0.78)), mitte: V(0, 0.15, -0.05)),
        // lange, schmale Schnauze
        Form(art: .rundkegel(V(0, -0.30, 0.72), 0.40, 0.26), mitte: V(0, -0.02, 0.30), weich: 0.28),
    ]
    // Lauscher: gross, seitlich abstehend, schaufelfoermig.
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.48, 0.24, 0.10)), mitte: V(0.92 * sx, 0.62, -0.18),
                           drehung: simd_quatf(angle: 0.45 * sx, axis: V(0, 0, 1)), weich: 0.12))
        formen.append(Form(art: .ellipsoid(V(0.38, 0.17, 0.08)), mitte: V(0.94 * sx, 0.64, -0.10),
                           drehung: simd_quatf(angle: 0.45 * sx, axis: V(0, 0, 1)), weich: 0.05, abziehen: true))
    }
    formen += lider(0.36, 0.22, 0.52, 0.19)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(braun, p, 0.08)
        // Weisser Ring um die Schnauze, Kinn hell, Nasenruecken dunkler.
        c = mische(c, weiss, region(p, V(0, -0.34, 0.92), V(0.34, 0.24, 0.30), 0.35))
        c = mische(c, weiss, glatt(-0.30, -0.45, p.y) * glatt(0.3, 0.6, p.z))
        c *= 1 - 0.20 * region(p, V(0, 0.0, 1.0), V(0.15, 0.3, 0.4), 0.5)
        // Ohren innen hell, Rand dunkel.
        let ohr = glatt(0.62, 0.80, abs(p.x)) * glatt(0.30, 0.45, p.y)
        c = mische(c, mische(mische(c, dunkel, 0.3), weiss, glatt(0.0, 0.6, n.z)), ohr)
        c = mische(c, dunkel, glatt(1.25, 1.38, abs(p.x)) * ohr)
        // weisse Flecken ueber den Augen
        c = mische(c, weiss, (region(p, V(-0.36, 0.42, 0.55), V(0.12, 0.06, 0.1), 0.6) + region(p, V(0.36, 0.42, 0.55), V(0.12, 0.06, 0.1), 0.6)) * 0.6)
        return c
    }, rauheit: 0.75, fell: 0.06)
    let bau = Bau(brust: 0.9, hals: 0.30, halsLaenge: 1.5, bein: 0.12, beinAbstand: 0.20, beinOben: -1.55, ruecken: 0.62, rueckenHoehe: -1.10)
    let koerper = brustbild(mitWangen(kopf, x: 0.42, y: -0.06, staerke: 0.40), vierbeiner(bau), farbe: { p, _ in
        // Rehe tragen einen hellen Kehlfleck gleich unter dem Kinn, die Brust bleibt braun.
        let kehle = region(p, V(0, -0.60, 0.50), V(0.26, 0.20, 0.45), 0.4)
        return mische(farbeMitRauschen(braun, p, 0.08), farbeMitRauschen(weiss, p, 0.04), kehle * 0.9)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    nase(w, [Form(art: .ellipsoid(V(0.18, 0.12, 0.10)), mitte: V(0, -0.30, 1.22))], farbe: hex("#141011"))
    augenEinsetzen(w, kopf, x: 0.36, y: 0.22, r: 0.19, iris: NSColor(calibratedRed: 0.26, green: 0.14, blue: 0.08, alpha: 1), pupille: 0.62, quer: false, aussen: 0.45, ausdruck: Ausdruck(oben: 0.14, unten: 0.10, schraeg: 0.26, blick: V(-2.2, -1.0, 0), funke: 1.5, wange: 0.40))
    w.eulerAngles = SCNVector3(0.10, 0.48, 0)
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
    formen += lider(0.30, 0.20, 0.60, 0.16)
    let kopf = Koerper(formen: formen, farbe: { p, _ in
        var c = farbeMitRauschen(rot, p, 0.07)
        c = mische(c, dunkel, glatt(0.70, 0.82, abs(p.x)) * 0.75)               // Ohren dunkler
        c = mische(c, hell, region(p, V(0, -0.30, 0.95), V(0.30, 0.18, 0.40), 0.4) * 0.5)
        c *= 1 - 0.20 * glatt(1.1, 1.45, p.z)                                    // Schnauzenspitze dunkler
        return c
    }, rauheit: 0.62, fell: 0.05)
    let bau = Bau(brust: 1.05, tiefe: 1.25, bein: 0.17, beinAbstand: 0.22, beinOben: -1.45, ruecken: 0.58, rueckenLaenge: 2.0, rueckenHoehe: -0.95)
    let koerper = brustbild(kopf, vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(rot, p, 0.07), hell, latz(p, breite: 0.30) * 0.25)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    nase(w, [Form(art: .ellipsoid(V(0.14, 0.10, 0.10)), mitte: V(0, -0.17, 1.44))], farbe: hex("#161010"))
    augenEinsetzen(w, kopf, x: 0.30, y: 0.20, r: 0.16, iris: NSColor(calibratedRed: 0.40, green: 0.22, blue: 0.10, alpha: 1), pupille: 0.58, ausdruck: Ausdruck(oben: 0.08, unten: 0, schraeg: 0.38, blick: V(0, 2.2, 0), funke: 1.7, wange: 0))
    w.eulerAngles = SCNVector3(0.06, 0.52, 0)
    return (w, 8.0, V(0, 0.10, 0.25))
}

// ---------- Golden Retriever ----------

func hund() -> (SCNNode, Float, V) {
    let gold = hex("#D6A15A"), hell = hex("#EFD3A4"), dunkel = hex("#A8743A")
    var formen: [Form] = [
        Form(art: .ellipsoid(V(0.86, 0.80, 0.84)), mitte: V(0, 0.12, -0.05)),
        Form(art: .ellipsoid(V(0.46, 0.36, 0.40)), mitte: V(-0.40, -0.25, 0.35), weich: 0.30),
        Form(art: .ellipsoid(V(0.46, 0.36, 0.40)), mitte: V(0.40, -0.25, 0.35), weich: 0.30),
        // breite, kurze Schnauze
        Form(art: .ellipsoid(V(0.40, 0.32, 0.42)), mitte: V(0, -0.18, 0.82), weich: 0.25),
        Form(art: .ellipsoid(V(0.55, 0.22, 0.32)), mitte: V(0, 0.36, 0.50), weich: 0.25),
    ]
    // Schlappohren: haengen seitlich herab.
    for sx: Float in [-1, 1] {
        formen.append(Form(art: .ellipsoid(V(0.26, 0.55, 0.13)), mitte: V(0.86 * sx, 0.05, 0.12),
                           drehung: simd_quatf(angle: -0.30 * sx, axis: V(0, 0, 1)) * simd_quatf(angle: 0.35 * sx, axis: V(0, 1, 0)), weich: 0.06))
    }
    formen += lider(0.32, 0.20, 0.68, 0.16)
    let kopf = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(gold, p, 0.08)
        c = mische(c, hell, region(p, V(0, -0.20, 0.95), V(0.40, 0.30, 0.30), 0.4) * 0.75)
        c = mische(c, dunkel, glatt(0.74, 0.86, abs(p.x)) * 0.75)   // Ohren dunkler golden
        return c
    }, rauheit: 0.78, fell: 0.08)
    let bau = Bau(brust: 1.2, tiefe: 1.1, hals: 0.48, bein: 0.20, beinAbstand: 0.26, ruecken: 0.70)
    let koerper = brustbild(mitWangen(kopf, x: 0.42, y: -0.04, staerke: 0.25), vierbeiner(bau), farbe: { p, _ in
        mische(farbeMitRauschen(gold, p, 0.08), farbeMitRauschen(hell, p, 0.05), latz(p, breite: 0.38) * 0.7)
    })
    let w = SCNNode(); w.addChildNode(brustKnoten(koerper))
    nase(w, [Form(art: .ellipsoid(V(0.18, 0.12, 0.12)), mitte: V(0, -0.04, 1.18))], farbe: hex("#171112"))
    augenEinsetzen(w, kopf, x: 0.32, y: 0.20, r: 0.16, iris: NSColor(calibratedRed: 0.42, green: 0.24, blue: 0.10, alpha: 1), pupille: 0.58, ausdruck: Ausdruck(oben: 0.06, unten: 0.40, schraeg: 0.10, blick: V(0, 0.4, 0), funke: 1.5, wange: 0.25))
    w.eulerAngles = SCNVector3(0.06, 0.40, 0)
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
    let w = SCNNode(); w.addChildNode(kopfKnoten(mitWangen(kopf, x: 0.4, y: 0.18, staerke: 0.30), grenze: 1.9))
    // Schnabel: klein, gebogen, zwischen den Augen.
    nase(w, [Form(art: .rundkegel(V(0, -0.20, 0.10), 0.09, 0.02), mitte: V(0, 0.28, 0.82))], farbe: hex("#3B3330"), lack: 0.6, rauheit: 0.35)
    augenEinsetzen(w, kopf, x: 0.30, y: 0.42, r: 0.20, tiefe: 0.35, iris: NSColor(calibratedRed: 0.95, green: 0.62, blue: 0.10, alpha: 1), pupille: 0.58, aussen: 0.1, ausdruck: Ausdruck(oben: 0.06, unten: 0.24, schraeg: 0.08, blick: V(0, 0.3, 0), funke: 1.5, wange: 0.30, zwinkern: true))
    w.eulerAngles = SCNVector3(0.02, 0.30, 0)
    return (w, 8.2, V(0, 0.05, 0))
}

// ---------- Wal ----------

func wal() -> (SCNNode, Float, V) {
    let blau = hex("#46739F"), bauch = hex("#E2E6EA")
    let formen: [Form] = [
        Form(art: .rundkegel(V(-2.0, 0.25, 0), 0.70, 0.18), mitte: V(0.75, -0.1, 0), stauchung: V(1, 0.85, 1)),
        Form(art: .ellipsoid(V(0.85, 0.60, 0.62)), mitte: V(0.55, -0.12, 0), weich: 0.4),
        // Fluke: nach oben geschwungen
        Form(art: .ellipsoid(V(0.25, 0.55, 0.10)), mitte: V(-1.45, 0.45, 0.25), drehung: simd_quatf(angle: 0.9, axis: V(1, 0, 0)), weich: 0.12),
        Form(art: .ellipsoid(V(0.25, 0.55, 0.10)), mitte: V(-1.45, 0.45, -0.25), drehung: simd_quatf(angle: -0.9, axis: V(1, 0, 0)), weich: 0.12),
        // Brustflosse
        Form(art: .ellipsoid(V(0.35, 0.10, 0.18)), mitte: V(0.45, -0.55, 0.55), drehung: simd_quatf(angle: -0.6, axis: V(0, 0, 1)), weich: 0.1),
    ]
    let koerper = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(blau, p, 0.06)
        // heller Bauch mit Furchen
        let unten = glatt(-0.05, -0.30, p.y + 0.12 * p.x)
        let furche = 0.85 + 0.15 * (sinf(p.z * 40) * 0.5 + 0.5)
        c = mische(c, bauch * furche, unten * glatt(0.0, 0.6, p.x + 1.2))
        // ein paar hellere Flecken auf dem Ruecken
        c = mische(c, mische(blau, bauch, 0.4), glatt(0.06, 0.0, zellen(p, 5).rand) * 0.0 + glatt(0.62, 0.70, fbm(p * 5)) * 0.4)
        return c
    }, rauheit: 0.40, fell: 0)
    let w = SCNNode(); w.addChildNode(kopfKnoten(koerper, grenze: 2.2, n: 170))
    for sz: Float in [-1, 1] {
        // Freundlich: laechelnde Augen, nach unten gewoelbte Lider.
        seitenAuge(w, koerper, x: 0.90, y: 0.02, tiefe: 0.035, sz: sz, r: 0.085,
                   iris: NSColor(calibratedRed: 0.10, green: 0.10, blue: 0.12, alpha: 1), pupille: 0.7,
                   Ausdruck(oben: 0.22, unten: 0.30, blick: V(0, 0.5, 0), funke: 1.5))
    }
    w.eulerAngles = SCNVector3(0.15, -0.55, 0)
    return (w, 9.0, V(-0.25, 0.0, 0))
}

// ---------- Goldfisch ----------

func goldfisch() -> (SCNNode, Float, V) {
    let orange = hex("#EE7A1F"), gelb = hex("#F6C35A"), flosse = hex("#F3A04A")
    let formen: [Form] = [
        Form(art: .ellipsoid(V(0.95, 0.72, 0.42)), mitte: V(0.15, 0, 0)),
        Form(art: .ellipsoid(V(0.40, 0.42, 0.34)), mitte: V(0.75, -0.02, 0), weich: 0.3),
        // Schwanzflosse (zweilappig, gefaechert)
        Form(art: .ellipsoid(V(0.55, 0.30, 0.05)), mitte: V(-1.05, 0.30, 0), drehung: simd_quatf(angle: 0.5, axis: V(0, 0, 1)), weich: 0.15),
        Form(art: .ellipsoid(V(0.55, 0.30, 0.05)), mitte: V(-1.05, -0.30, 0), drehung: simd_quatf(angle: -0.5, axis: V(0, 0, 1)), weich: 0.15),
        // Rueckenflosse, Bauchflossen
        Form(art: .ellipsoid(V(0.45, 0.30, 0.05)), mitte: V(0.0, 0.72, 0), drehung: simd_quatf(angle: -0.3, axis: V(0, 0, 1)), weich: 0.12),
        Form(art: .ellipsoid(V(0.25, 0.14, 0.05)), mitte: V(0.30, -0.70, 0.18), drehung: simd_quatf(angle: 0.6, axis: V(0, 0, 1)), weich: 0.1),
        // Brustflosse
        Form(art: .ellipsoid(V(0.22, 0.12, 0.05)), mitte: V(0.45, -0.25, 0.40), drehung: simd_quatf(angle: 0.4, axis: V(0, 1, 0)), weich: 0.08),
    ]
    let koerper = Koerper(formen: formen, farbe: { p, n in
        var c = farbeMitRauschen(orange, p, 0.06)
        let z = zellen(V(p.x, p.y, p.z * 0.3), 9)
        c = mische(c, gelb, glatt(0.04, 0.0, z.rand) * 0.35 * glatt(0.9, 0.3, abs(p.y)))   // Schuppenraender
        c = mische(c, gelb, glatt(-0.2, -0.6, p.y) * 0.6)                                   // heller Bauch
        // Flossen: heller, zum Rand hin fast durchscheinend hell
        let flossen = max(glatt(-0.75, -0.95, p.x), max(glatt(0.62, 0.75, p.y), glatt(-0.58, -0.68, p.y)))
        c = mische(c, flosse * (0.9 + 0.2 * (sinf(atan2f(p.y, p.x + 1) * 30) * 0.5 + 0.5)), flossen)
        return c
    }, rauheit: 0.35, fell: 0)
    let w = SCNNode(); w.addChildNode(kopfKnoten(koerper, grenze: 1.8, n: 170))
    for sz: Float in [-1, 1] {
        // Staunend: weit offen, grosser Lichtpunkt, Blick nach oben.
        seitenAuge(w, koerper, x: 0.78, y: 0.15, tiefe: 0.06, sz: sz, r: 0.17,
                   iris: NSColor(calibratedRed: 0.85, green: 0.62, blue: 0.20, alpha: 1), pupille: 0.62,
                   Ausdruck(oben: 0.08, unten: 0, schraeg: 0.1, blick: V(0.8, 1.6, 0), funke: 1.7))
    }
    // Maul
    nase(w, [Form(art: .ellipsoid(V(0.07, 0.08, 0.10)), mitte: V(1.12, -0.10, 0))], farbe: hex("#C85A2A"), lack: 0.4, rauheit: 0.4)
    w.eulerAngles = SCNVector3(0.05, -0.50, 0.05)
    return (w, 8.0, V(-0.05, 0.05, 0))
}

// ---------- Meeresschildkroete ----------

func schildkroete() -> (SCNNode, Float, V) {
    let panzer = hex("#6B5A33"), platte = hex("#8A7542"), haut = hex("#7F8F55"), schuppe = hex("#C9C08A")
    let panzerK = Koerper(formen: [
        Form(art: .ellipsoid(V(1.05, 0.48, 0.85)), mitte: V(-0.10, 0.05, 0)),
        Form(art: .ellipsoid(V(1.10, 0.18, 0.90)), mitte: V(-0.10, -0.18, 0), weich: 0.1),
    ], farbe: { p, _ in
        let z = zellen(V(p.x * 0.8, p.y * 0.3, p.z * 0.8), 2.1)
        var c = mische(panzer, platte, z.wert)
        c = mische(c, hex("#3C3020"), glatt(0.05, 0.0, z.rand))                  // Plattenfugen
        c *= 0.9 + 0.2 * fbm(p * 6)
        c = mische(c, hex("#D9CFA0"), glatt(-0.15, -0.30, p.y))                 // heller Bauchpanzer
        return c
    }, rauheit: 0.45, fell: 0)
    let hautK = Koerper(formen: [
        Form(art: .ellipsoid(V(0.52, 0.42, 0.42)), mitte: V(1.30, 0.12, 0)),                      // Kopf
        Form(art: .rundkegel(V(-0.5, -0.05, 0), 0.20, 0.24), mitte: V(1.1, 0.0, 0), weich: 0.15), // Hals
        // Vorderflossen: lang und fluegelartig
        Form(art: .ellipsoid(V(0.70, 0.08, 0.22)), mitte: V(0.55, -0.22, 0.95), drehung: simd_quatf(angle: -0.6, axis: V(0, 1, 0)), weich: 0.1),
        Form(art: .ellipsoid(V(0.70, 0.08, 0.22)), mitte: V(0.55, -0.22, -0.95), drehung: simd_quatf(angle: 0.6, axis: V(0, 1, 0)), weich: 0.1),
        Form(art: .ellipsoid(V(0.35, 0.07, 0.16)), mitte: V(-1.05, -0.20, 0.55), drehung: simd_quatf(angle: 0.5, axis: V(0, 1, 0)), weich: 0.1),
        Form(art: .ellipsoid(V(0.35, 0.07, 0.16)), mitte: V(-1.05, -0.20, -0.55), drehung: simd_quatf(angle: -0.5, axis: V(0, 1, 0)), weich: 0.1),
    ], farbe: { p, _ in
        let z = zellen(p, 7)
        var c = mische(schuppe, haut, glatt(0.0, 0.05, z.rand))   // helle Schuppen mit dunkler Fuge
        c = mische(c, hex("#E9E2C2"), glatt(-0.05, -0.20, p.y - 0.0) * 0.6)
        return c
    }, rauheit: 0.55, fell: 0)
    let w = SCNNode()
    w.addChildNode(kopfKnoten(panzerK, grenze: 2.0, n: 170))
    w.addChildNode(kopfKnoten(hautK, grenze: 2.0, n: 170))
    for sz: Float in [-1, 1] {
        // Gemuetlich: schwere Oberlider, ein Laecheln in den Augen.
        seitenAuge(w, hautK, x: 1.45, y: 0.24, tiefe: 0.05, sz: sz, r: 0.14,
                   iris: NSColor(calibratedRed: 0.36, green: 0.26, blue: 0.10, alpha: 1), pupille: 0.6,
                   Ausdruck(oben: 0.24, unten: 0.26, schraeg: 0.14, blick: V(0, 0, 0), funke: 1.5))
    }
    w.eulerAngles = SCNVector3(0.35, -0.65, 0)
    return (w, 9.2, V(0.05, 0.0, 0))
}

let TIERE: [Tier] = [
    Tier(name: "fuchs", bauen: fuchs), Tier(name: "katze", bauen: katze), Tier(name: "baer", bauen: baer),
    Tier(name: "panda", bauen: panda), Tier(name: "hase", bauen: hase), Tier(name: "reh", bauen: reh),
    Tier(name: "dackel", bauen: dackel), Tier(name: "retriever", bauen: hund), Tier(name: "eule", bauen: eule),
    Tier(name: "wal", bauen: wal), Tier(name: "goldfisch", bauen: goldfisch), Tier(name: "schildkroete", bauen: schildkroete),
]

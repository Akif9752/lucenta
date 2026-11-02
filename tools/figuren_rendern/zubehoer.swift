// Zubehoer fuer den Begleiter (Schal, Muetze, Blume), im selben Licht wie die Tiere gerendert und frei stehend.
// Platziert wird es in der App ueber die Kopfstelle (src/figuren/koepfe.json) — so passt es auf jedes Tierbild.
// Aufruf: sh tools/figuren_rendern/zubehoer.sh   (rendert nach /tmp/lucenta-zubehoer/)
import Foundation
import SceneKit

let zubehoerZiel = "/tmp/lucenta-zubehoer"
try? FileManager.default.createDirectory(atPath: zubehoerZiel, withIntermediateDirectories: true)

// Rohr entlang eines Kreises (Schal, Muetzenrand)
func ring(_ mitte: V, radius: Float, dicke: Float, stuecke: Int = 28, kippen: Float = 0) -> [Form] {
    var f: [Form] = []
    for i in 0..<stuecke {
        let a = Float(i) / Float(stuecke) * 2 * .pi, b = Float(i + 1) / Float(stuecke) * 2 * .pi
        let p = mitte + V(cosf(a) * radius, sinf(a) * radius * kippen, sinf(a) * radius)
        let q = mitte + V(cosf(b) * radius, sinf(b) * radius * kippen, sinf(b) * radius)
        f.append(Form(art: .rundkegel(q - p, dicke, dicke), mitte: p, weich: 0.04))
    }
    return f
}

func schal() -> SCNNode {
    // gestrickter roter Schal: breites, flaches Band um den Hals, ein Ende haengt vorn herab, weisse Querstreifen, Fransen
    var formen = ring(V(0, 0, 0), radius: 0.62, dicke: 0.20, stuecke: 32, kippen: 0.22).map { var f = $0; f.stauchung = V(1, 1.45, 1); return f }
    formen += glied([V(0.28, -0.02, 0.66), V(0.36, -0.42, 0.74), V(0.40, -0.86, 0.70)], [0.19, 0.18, 0.18]).map { var f = $0; f.stauchung = V(1.5, 1, 0.6); return f }
    for i in -2...2 { formen.append(Form(art: .rundkegel(V(0, -0.16, 0.02), 0.03, 0.025), mitte: V(0.40 + Float(i) * 0.07, -1.02, 0.70), weich: 0.02)) }
    let k = Koerper(formen: formen, farbe: { p, _ in
        let laengs = p.y < -0.25 ? sinf(p.y * 16) : sinf(atan2f(p.z, p.x) * 9)
        let streifen = glatt(0.55, 0.8, laengs * 0.5 + 0.5)
        let masche = 0.9 + 0.1 * sinf(p.x * 70) * sinf(p.y * 70)
        return farbeMitRauschen(mische(hex("#D9443A"), hex("#F6EFE6"), streifen) * masche, p, 0.05)
    }, rauheit: 0.95, fell: 0.18)
    return glanzKoerper(k, grenze: 1.4, n: 180, rauheit: 0.95, lack: 0)
}

func muetze() -> SCNNode {
    // Strickmuetze mit Krempe und Bommel
    var formen: [Form] = [Form(art: .ellipsoid(V(0.78, 0.62, 0.78)), mitte: V(0, 0.05, 0)),
                          Form(art: .ellipsoid(V(1.2, 0.6, 1.2)), mitte: V(0, -0.58, 0), weich: 0.02, abziehen: true)]
    formen += ring(V(0, 0.02, 0), radius: 0.76, dicke: 0.13)
    formen.append(Form(art: .ellipsoid(V(0.22, 0.22, 0.22)), mitte: V(0, 0.74, 0), weich: 0.05))
    let k = Koerper(formen: formen, farbe: { p, _ in
        let rand = glatt(0.18, 0.10, p.y)
        let bommel = glatt(0.55, 0.62, p.y)
        let rippen = 0.88 + 0.12 * sinf(atan2f(p.z, p.x) * 18)
        return farbeMitRauschen(mische(mische(hex("#3D7FD6") * rippen, hex("#F6EFE6"), rand), hex("#F6EFE6"), bommel), p, 0.05)
    }, rauheit: 0.9, fell: 0.12)
    return glanzKoerper(k, grenze: 1.3, n: 160, rauheit: 0.9, lack: 0)
}

func blume() -> SCNNode {
    // fuenf rosa Bluetenblaetter um eine gelbe Mitte
    var formen: [Form] = [Form(art: .ellipsoid(V(0.22, 0.22, 0.14)), mitte: V(0, 0, 0.10))]
    for i in 0..<5 {
        let a = Float(i) / 5 * 2 * .pi + 0.3
        formen.append(Form(art: .ellipsoid(V(0.30, 0.20, 0.08)), mitte: V(cosf(a) * 0.36, sinf(a) * 0.36, 0),
                           drehung: simd_quatf(angle: a, axis: V(0, 0, 1)), weich: 0.05))
    }
    let k = Koerper(formen: formen, farbe: { p, _ in
        let mitte = glatt(0.24, 0.16, simd_length(simd_float2(p.x, p.y)))
        return mische(mische(hex("#F28AB2"), hex("#FBD3E2"), glatt(0.5, 0.2, simd_length(simd_float2(p.x, p.y)))), hex("#F7C431"), mitte)
    }, rauheit: 0.6, fell: 0)
    return glanzKoerper(k, grenze: 1.0, n: 140, rauheit: 0.6, lack: 0.2)
}

for (name, bauen, kipp) in [("schal", schal, Float(0.22)), ("muetze", muetze, Float(0.25)), ("blume", blume, Float(0))] {
    let szene = SCNScene()
    studio(szene)
    let n = bauen()
    n.eulerAngles = SCNVector3(kipp, 0, 0)
    szene.rootNode.addChildNode(n)
    rendern(szene, groesse: 512, leinwand: 1, kameraAbstand: 6.5, ziel: V(0, 0, 0), nach: "\(zubehoerZiel)/\(name).png")
    print("zubehoer", name)
}

// Aufruf: tools/figuren_rendern/bauen.sh [tier ...]   (ohne Angabe: alle)

import Foundation
import SceneKit

let ziel = "/tmp/lucenta-figuren-roh"
// Kopfmitte (im Koordinatensystem des Tieres) und Radius fuer den Kopf-Ausschnitt der kleinen Avatare.
let KOPF: [String: (V, Float)] = [
    "hase": (V(0, 0.55, 0.05), 1.30), "reh": (V(0, 0.40, 0.10), 1.15), "eule": (V(0, 0.30, 0.05), 1.15),
    "flamingo": (V(0, 0.30, 0.10), 0.85), "wal": (V(0, 0.05, 0.55), 1.05), "delfin": (V(0, 0.25, 0.20), 1.0),
    "schildkroete": (V(0, 0.32, 0.35), 0.95), "goldfisch": (V(0, 0.05, 0.30), 0.95), "papagei": (V(0, 0.45, 0.20), 1.0),
    "fuchs": (V(0, 0.45, 0.10), 1.10), "pinguin": (V(0, 0.30, 0.05), 1.0), "rotkehlchen": (V(0, 0.36, 0.05), 0.95),
]
try? FileManager.default.createDirectory(atPath: ziel, withIntermediateDirectories: true)
let gewuenscht = Set(CommandLine.arguments.dropFirst())
for t in TIERE where gewuenscht.isEmpty || gewuenscht.contains(t.name) {
    let start = Date()
    let szene = SCNScene()
    studio(szene)
    let (knoten, abstand, blick) = t.bauen()
    szene.rootNode.addChildNode(knoten)
    // Beide Augen auf die Kamera — erst hier steht fest, wo sie ist. Kein Versatz: Jedes Tier sieht den
    // Betrachter an (Entscheidung des Inhabers).
    let kamera = blick + V(0, 0.25, abstand)
    knoten.enumerateHierarchy { n, _ in
        if n.name == "auge" { n.look(at: scnVektor(kamera), up: SCNVector3(0, 1, 0), localFront: SCNVector3(0, 0, 1)) }
    }
    rendern(szene, groesse: 1024, leinwand: 2, kameraAbstand: abstand, ziel: blick, nach: "\(ziel)/\(t.name)\(STIMMUNG == .ruhig ? "" : "-" + STIMMUNG.rawValue).png")
    // Wo der Kopf im Bild liegt (Anteil der Leinwand, y von oben) und wie gross — daraus zoomen die kleinen Avatare
    // auf Kopf und Schultern (Entscheidung des Inhabers). Gleiche Kamera wie in rendern().
    if STIMMUNG == .ruhig {
        let (lokal, radius) = KOPF[t.name] ?? (V(0, 0.25, 0.10), 1.0)
        let welt = knoten.simdConvertPosition(lokal, to: nil)
        let f = simd_normalize(blick - kamera), r = simd_normalize(simd_cross(f, V(0, 1, 0))), u = simd_cross(r, f)
        let d = welt - kamera, z = simd_dot(d, f)
        let halb = tanf(12 * .pi / 180) * 2
        let fx = 0.5 + simd_dot(d, r) / z / halb / 2, fy = 0.5 - simd_dot(d, u) / z / halb / 2, fr = radius / z / halb / 2
        try? "{\"x\": \(fx), \"y\": \(fy), \"r\": \(fr)}".write(toFile: "\(ziel)/\(t.name).kopf.json", atomically: true, encoding: .utf8)
    }
    print(String(format: "%-13@ %.1f s", t.name as NSString, Date().timeIntervalSince(start)))
}

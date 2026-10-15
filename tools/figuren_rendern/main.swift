// Aufruf: tools/figuren_rendern/bauen.sh [tier ...]   (ohne Angabe: alle)

import Foundation
import SceneKit

let ziel = "/tmp/lucenta-figuren-roh"
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
    rendern(szene, groesse: 1024, leinwand: 2, kameraAbstand: abstand, ziel: blick, nach: "\(ziel)/\(t.name).png")
    print(String(format: "%-13@ %.1f s", t.name as NSString, Date().timeIntervalSince(start)))
}

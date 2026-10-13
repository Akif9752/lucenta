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
    // Runde 135: Die Augen sehen den Betrachter an (oder mit Absicht daneben, `blickVersatz`). Erst
    // hier steht fest, wo die Kamera ist; vorher sahen sie parallel in Kopfrichtung — knapp vorbei,
    // und genau das wirkte starr. Beide Augen auf denselben Punkt: Sie schauen zusammen hin.
    let kamera = blick + V(0, 0.25, abstand)
    knoten.enumerateHierarchy { n, _ in
        if n.name == "auge" { n.look(at: scnVektor(kamera + blickVersatz), up: SCNVector3(0, 1, 0), localFront: SCNVector3(0, 0, 1)) }
    }
    blickVersatz = V(0, 0, 0)
    rendern(szene, groesse: 512, leinwand: 2, kameraAbstand: abstand, ziel: blick, nach: "\(ziel)/\(t.name).png")
    print(String(format: "%-13@ %.1f s", t.name as NSString, Date().timeIntervalSince(start)))
}

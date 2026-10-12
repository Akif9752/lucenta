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
    rendern(szene, groesse: 512, kameraAbstand: abstand, ziel: blick, nach: "\(ziel)/\(t.name).png")
    print(String(format: "%-13@ %.1f s", t.name as NSString, Date().timeIntervalSince(start)))
}

// Szene, Material, Augen und Licht — alles, was nicht die Form eines einzelnen Tieres ist.

import SceneKit
import AppKit
import simd

func scnVektor(_ v: V) -> SCNVector3 { SCNVector3(CGFloat(v.x), CGFloat(v.y), CGFloat(v.z)) }

func geometrie(_ netz: Netz, _ k: Koerper) -> SCNGeometry {
    let p = netz.punkte.map { scnVektor($0) }
    let n = netz.normalen.map { scnVektor($0) }
    let farbDaten = netz.farben.withUnsafeBufferPointer { zeiger -> Data in
        var flach: [Float] = []; flach.reserveCapacity(zeiger.count * 4)
        for c in zeiger { flach += [c.x, c.y, c.z, 1] }
        return flach.withUnsafeBufferPointer { Data(buffer: $0) }
    }
    let farben = SCNGeometrySource(data: farbDaten, semantic: .color, vectorCount: netz.farben.count,
                                   usesFloatComponents: true, componentsPerVector: 4, bytesPerComponent: 4,
                                   dataOffset: 0, dataStride: 16)
    let element = SCNGeometryElement(indices: netz.dreiecke, primitiveType: .triangles)
    let g = SCNGeometry(sources: [SCNGeometrySource(vertices: p), SCNGeometrySource(normals: n), farben], elements: [element])
    let m = SCNMaterial()
    m.lightingModel = .physicallyBased
    m.diffuse.contents = NSColor.white          // die Farbe kommt aus den Eckpunkten
    m.roughness.contents = NSNumber(value: k.rauheit)
    m.metalness.contents = 0.0
    g.materials = [m]
    return g
}

// ---------- Augen ----------
//
// Tieraugen in diesem Stil: fast nur Iris, kaum Weiss, eine grosse Pupille, eine glaenzende Hornhaut
// darueber und ein Lichtpunkt. Die Iris ist ein Bild (Verlauf, dunkler Rand, feine Fasern) auf einer
// Scheibe hinter der Hornhaut; der Lichtpunkt entsteht vom Licht selbst auf der Hornhaut und wird von
// einem kleinen leuchtenden Punkt verstaerkt — der "Funke", der eine Figur lebendig macht.

func irisBild(_ farbe: NSColor, pupille: CGFloat = 0.42, schlitz: Bool = false, quer: Bool = false) -> NSImage {
    let g: CGFloat = 512
    let bild = NSImage(size: NSSize(width: g, height: g))
    bild.lockFocus()
    let ctx = NSGraphicsContext.current!.cgContext
    let mitte = CGPoint(x: g / 2, y: g / 2)
    let raum = CGColorSpace(name: CGColorSpace.sRGB)!
    let hell = farbe.blended(withFraction: 0.35, of: .white)!.cgColor
    let dunkel = farbe.blended(withFraction: 0.55, of: .black)!.cgColor
    let verlauf = CGGradient(colorsSpace: raum, colors: [hell, farbe.cgColor, dunkel] as CFArray, locations: [0, 0.55, 1])!
    ctx.addEllipse(in: CGRect(x: 0, y: 0, width: g, height: g)); ctx.clip()
    ctx.drawRadialGradient(verlauf, startCenter: mitte, startRadius: 0, endCenter: mitte, endRadius: g / 2, options: [])
    // Fasern
    ctx.setLineWidth(2)
    for i in 0..<160 {
        let w = CGFloat(i) / 160 * .pi * 2 + CGFloat((i * 37) % 11) * 0.01
        let r1 = g * 0.18, r2 = g * (0.40 + CGFloat((i * 53) % 9) * 0.01)
        ctx.setStrokeColor((i % 2 == 0 ? hell : dunkel).copy(alpha: 0.35)!)
        ctx.move(to: CGPoint(x: mitte.x + cos(w) * r1, y: mitte.y + sin(w) * r1))
        ctx.addLine(to: CGPoint(x: mitte.x + cos(w) * r2, y: mitte.y + sin(w) * r2))
        ctx.strokePath()
    }
    // dunkler Limbusring
    ctx.setStrokeColor(NSColor(white: 0, alpha: 0.75).cgColor); ctx.setLineWidth(g * 0.06)
    ctx.strokeEllipse(in: CGRect(x: g * 0.03, y: g * 0.03, width: g * 0.94, height: g * 0.94))
    // Pupille
    ctx.setFillColor(NSColor(white: 0.02, alpha: 1).cgColor)
    let pr = g * pupille / 2
    if schlitz {
        ctx.fillEllipse(in: CGRect(x: mitte.x - pr * 0.32, y: mitte.y - pr * 1.6, width: pr * 0.64, height: pr * 3.2))
    } else if quer {
        ctx.fillEllipse(in: CGRect(x: mitte.x - pr * 1.5, y: mitte.y - pr * 0.6, width: pr * 3.0, height: pr * 1.2))
    } else {
        ctx.fillEllipse(in: CGRect(x: mitte.x - pr, y: mitte.y - pr, width: pr * 2, height: pr * 2))
    }
    bild.unlockFocus()
    return bild
}

// Ein Augapfel mit der Iris von VORN projiziert (u = x, v = y). Die erste Fassung legte eine flache
// Irisscheibe knapp unter die Hornhaut — innerhalb des undurchsichtigen Augapfels, also unsichtbar.
func augapfel(_ r: CGFloat, _ bild: NSImage) -> SCNGeometry {
    let ringe = 48, segmente = 64
    var punkte: [SCNVector3] = [], normalen: [SCNVector3] = [], uv: [CGPoint] = [], idx: [Int32] = []
    for i in 0...ringe {
        let t = CGFloat(i) / CGFloat(ringe) * .pi
        for j in 0...segmente {
            let f = CGFloat(j) / CGFloat(segmente) * 2 * .pi
            let n = SCNVector3(sin(t) * cos(f), cos(t), sin(t) * sin(f))
            punkte.append(SCNVector3(n.x * r, n.y * r, n.z * r)); normalen.append(n)
            // Vorderseite: Projektion; Rueckseite bekommt den Rand des Bildes (dunkel).
            uv.append(n.z > 0 ? CGPoint(x: 0.5 + n.x * 0.5, y: 0.5 - n.y * 0.5) : CGPoint(x: 0.01, y: 0.5))
        }
    }
    for i in 0..<ringe { for j in 0..<segmente {
        let a = Int32(i * (segmente + 1) + j), b = a + Int32(segmente + 1)
        idx += [a, a + 1, b, a + 1, b + 1, b]
    }}
    let g = SCNGeometry(sources: [SCNGeometrySource(vertices: punkte), SCNGeometrySource(normals: normalen),
                                  SCNGeometrySource(textureCoordinates: uv)],
                        elements: [SCNGeometryElement(indices: idx, primitiveType: .triangles)])
    let m = SCNMaterial(); m.lightingModel = .physicallyBased
    m.diffuse.contents = bild; m.diffuse.wrapS = .clamp; m.diffuse.wrapT = .clamp
    m.roughness.contents = 0.35
    g.materials = [m]
    return g
}

func auge(radius r: CGFloat, iris: NSColor, pupille: CGFloat = 0.42, schlitz: Bool = false, quer: Bool = false,
          irisAnteil: CGFloat = 0.86) -> SCNNode {
    let knoten = SCNNode()
    // Das Bild traegt aussen die dunkle Randfarbe, innen die Iris (Anteil irisAnteil).
    let g: CGFloat = 512
    let voll = NSImage(size: NSSize(width: g, height: g))
    voll.lockFocus()
    iris.blended(withFraction: 0.82, of: .black)!.setFill(); NSRect(x: 0, y: 0, width: g, height: g).fill()
    let ir = g * irisAnteil
    irisBild(iris, pupille: pupille, schlitz: schlitz, quer: quer)
        .draw(in: NSRect(x: (g - ir) / 2, y: (g - ir) / 2, width: ir, height: ir))
    voll.unlockFocus()
    knoten.addChildNode(SCNNode(geometry: augapfel(r, voll)))
    // Hornhaut: durchsichtig, sehr glatt — traegt die Spiegelung von Licht und Umgebung.
    let horn = SCNSphere(radius: r * 1.03); horn.segmentCount = 64
    let mh = SCNMaterial(); mh.lightingModel = .physicallyBased
    mh.diffuse.contents = NSColor(white: 1, alpha: 0.0)
    mh.transparency = 1; mh.transparencyMode = .dualLayer
    mh.roughness.contents = 0.04; mh.metalness.contents = 0
    mh.clearCoat.contents = 1.0; mh.clearCoatRoughness.contents = 0.02
    mh.blendMode = .alpha; mh.writesToDepthBuffer = false
    horn.materials = [mh]
    knoten.addChildNode(SCNNode(geometry: horn))
    // Der Funke.
    let mf = SCNMaterial(); mf.lightingModel = .constant; mf.diffuse.contents = NSColor(white: 1, alpha: 0.95)
    let funke = SCNSphere(radius: r * 0.12); funke.materials = [mf]
    let fk = SCNNode(geometry: funke); fk.position = SCNVector3(-r * 0.30, r * 0.34, r * 0.92)
    knoten.addChildNode(fk)
    let funke2 = SCNSphere(radius: r * 0.05); funke2.materials = [mf]
    let fk2 = SCNNode(geometry: funke2); fk2.position = SCNVector3(r * 0.28, -r * 0.28, r * 0.95)
    knoten.addChildNode(fk2)
    return knoten
}

func glanzKoerper(_ k: Koerper, grenze: Float, n: Int, rauheit: Float, lack: Float) -> SCNNode {
    let netz = netzBauen(k, grenze: grenze, n: n)
    let g = geometrie(netz, k)
    g.materials[0].roughness.contents = NSNumber(value: rauheit)
    g.materials[0].clearCoat.contents = NSNumber(value: lack)
    g.materials[0].clearCoatRoughness.contents = 0.15
    return SCNNode(geometry: g)
}

// ---------- Licht und Kamera ----------

func umgebungsBild() -> NSImage {
    // Ein Studio als Rundumbild: oben ein grosses warmes Softlicht, seitlich kuehler, unten dunkler
    // Boden. Davon leben die weichen Uebergaenge und die Spiegelungen in Augen und Nase.
    let b: CGFloat = 1024, h: CGFloat = 512
    let bild = NSImage(size: NSSize(width: b, height: h))
    bild.lockFocus()
    let ctx = NSGraphicsContext.current!.cgContext
    let raum = CGColorSpace(name: CGColorSpace.sRGB)!
    let himmel = CGGradient(colorsSpace: raum, colors: [NSColor(calibratedRed: 1, green: 0.97, blue: 0.92, alpha: 1).cgColor,
                                                        NSColor(calibratedRed: 0.62, green: 0.68, blue: 0.78, alpha: 1).cgColor,
                                                        NSColor(calibratedRed: 0.20, green: 0.19, blue: 0.20, alpha: 1).cgColor] as CFArray,
                            locations: [0, 0.5, 1])!
    ctx.drawLinearGradient(himmel, start: CGPoint(x: 0, y: h), end: CGPoint(x: 0, y: 0), options: [])
    // Softbox vorn links oben
    ctx.setFillColor(NSColor(white: 1, alpha: 1).cgColor)
    ctx.fillEllipse(in: CGRect(x: b * 0.30, y: h * 0.62, width: b * 0.14, height: h * 0.22))
    bild.unlockFocus()
    return bild
}

func studio(_ szene: SCNScene) {
    szene.lightingEnvironment.contents = umgebungsBild()
    szene.lightingEnvironment.intensity = 0.9
    func licht(_ art: SCNLight.LightType, _ farbe: NSColor, _ staerke: CGFloat, _ von: V, schatten: Bool = false) {
        let l = SCNLight(); l.type = art; l.color = farbe; l.intensity = staerke
        if schatten {
            l.castsShadow = true; l.shadowSampleCount = 32; l.shadowRadius = 10
            l.shadowMapSize = CGSize(width: 2048, height: 2048); l.shadowColor = NSColor(white: 0, alpha: 0.45)
            l.orthographicScale = 3; l.zNear = 1; l.zFar = 30
        }
        let k = SCNNode(); k.light = l; k.position = scnVektor(von); k.look(at: SCNVector3(0, 0, 0))
        szene.rootNode.addChildNode(k)
    }
    licht(.directional, NSColor(calibratedRed: 1, green: 0.95, blue: 0.86, alpha: 1), 1500, V(-5, 6, 6), schatten: true)  // Hauptlicht
    licht(.directional, NSColor(calibratedRed: 0.78, green: 0.86, blue: 1, alpha: 1), 220, V(6, 0, 4))                   // Fuelllicht
    licht(.directional, NSColor(calibratedRed: 1, green: 0.98, blue: 0.95, alpha: 1), 2200, V(4, 4, -6))                  // Kante
}

func rendern(_ szene: SCNScene, groesse: Int, kameraAbstand: Float, ziel: V, nach pfad: String) {
    szene.background.contents = NSColor.clear
    let kam = SCNCamera()
    kam.fieldOfView = 24; kam.zNear = 0.1; kam.zFar = 100
    kam.wantsHDR = true; kam.wantsExposureAdaptation = false; kam.exposureOffset = -0.35
    kam.screenSpaceAmbientOcclusionIntensity = 1.1
    kam.screenSpaceAmbientOcclusionRadius = 0.25
    kam.screenSpaceAmbientOcclusionNormalThreshold = 0.3
    let kk = SCNNode(); kk.camera = kam
    kk.position = scnVektor(ziel + V(0, 0.25, kameraAbstand)); kk.look(at: scnVektor(ziel))
    szene.rootNode.addChildNode(kk)
    let r = SCNRenderer(device: MTLCreateSystemDefaultDevice()!, options: nil)
    r.scene = szene; r.pointOfView = kk
    let bild = r.snapshot(atTime: 0, with: CGSize(width: groesse, height: groesse), antialiasingMode: .multisampling4X)
    let rep = NSBitmapImageRep(data: bild.tiffRepresentation!)!
    try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: pfad))
}

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
    var quellen = [SCNGeometrySource(vertices: p), SCNGeometrySource(normals: n), farben]
    // Haarlaenge und Duenne reisen als Texturkoordinate mit — die einzige freie Spur je Eckpunkt fuer den Shader.
    quellen.append(SCNGeometrySource(textureCoordinates: zip(netz.haare, netz.duenne).map { CGPoint(x: CGFloat($0), y: CGFloat($1)) }))
    let g = SCNGeometry(sources: quellen, elements: [element])
    let m = SCNMaterial()
    m.lightingModel = .physicallyBased
    m.diffuse.contents = NSColor.white          // die Farbe kommt aus den Eckpunkten
    m.roughness.contents = NSNumber(value: k.rauheit)
    m.metalness.contents = 0.0
    if k.lack > 0 {
        m.clearCoat.contents = NSNumber(value: k.lack); m.clearCoatRoughness.contents = 0.22
    }
    m.shaderModifiers = [.geometry: durchscheinGeometrie, .surface: durchscheinOberflaeche]
    g.materials = [m]
    return g
}

// Durchscheinen: Wo der Koerper duenn ist, leuchtet er warm, als fiele Licht hindurch — beim echten
// Tier die Ohren im Gegenlicht und die Flossen eines Fisches. (SceneKit kennt keine Lichtstreuung unter
// der Haut; das ist ihre Naeherung.)
let durchscheinGeometrie = """
#pragma varyings
float duenn;
#pragma body
out.duenn = _geometry.texcoords[0].y;
"""
let durchscheinOberflaeche = """
#pragma varyings
float duenn;
#pragma body
_surface.emission.rgb += _surface.diffuse.rgb * float3(1.0, 0.50, 0.34) * (in.duenn * 0.45);
"""

// ---------- Fell ----------
//
// Schalenfell: dieselbe Haut in `schalen` Schichten bis zur Haarlaenge nach aussen versetzt; in jeder
// Schicht laesst der Shader nur die Querschnitte einzelner Haare stehen (Zellen um die Haarwurzel, zur
// Spitze duenner). Die Haare liegen in Wuchsrichtung: von `ursprung` (der Nase) weg und nach unten.
struct Fell {
    var dichte: Float = 70          // Haare je Laengeneinheit
    var dicke: Float = 0.42         // Querschnitt an der Wurzel, Anteil der Zelle
    var aufrecht: Float = 0.45      // wie weit die Haare von der Haut abstehen (1 = senkrecht)
    var neigung: Float = 1.3        // wie weit sie in Wuchsrichtung liegen
    var schwere: Float = 0.5        // zieht die Wuchsrichtung nach unten
    var ursprung = V(0, 0, 1.2)
    var wurzel: Float = 0.62        // Helligkeit zwischen den Haaren
    var spitze: Float = 1.18        // Helligkeit der Spitzen
    var straehnen: Float = 0.4      // wie stark die Spitzen zu Buescheln zusammenlaufen (0 … 0,8)
    var streuung: Float = 0.12      // Helligkeitsunterschied von Haar zu Haar
    var schalen = 28
}

let fellGeometrie = """
#pragma arguments
float schale;
float aufrecht;
float neigung;
float schwere;
float3 ursprung;
#pragma varyings
float3 wurzel;
float haar;
#pragma body
float L = _geometry.texcoords[0].x;
float3 p = _geometry.position.xyz;
float3 n = normalize(_geometry.normal);
out.wurzel = p;
out.haar = L;
float3 t = (p - ursprung) + float3(0.0, -schwere, 0.0);
t = t - n * dot(t, n);
float tl = length(t);
t = tl > 1e-4 ? t / tl : float3(0.0);
float h = schale * L;
_geometry.position.xyz = p + n * (h * aufrecht) + t * (h * neigung * schale);
"""

let fellOberflaeche = """
#pragma arguments
float schale;
float dichte;
float dicke;
float wurzelHell;
float spitzeHell;
float straehnen;
float streuung;
#pragma varyings
float3 wurzel;
float haar;
#pragma body
if (in.haar < 0.003) { discard_fragment(); }
float3 q = in.wurzel * dichte;
// Straehnen: Zur Spitze hin ruecken die Haare zur Mitte ihres Bueschels (grobe Zellen, 4 Haare weit).
// Gesucht wird darum am Ort, von dem aus ein Haar hier ankommt.
float3 qb = q / 4.0, fb = floor(qb), mb = fb;
float db = 9.0;
for (int a = -1; a <= 1; a++) { for (int b = -1; b <= 1; b++) { for (int c = -1; c <= 1; c++) {
    float3 z = fb + float3(a, b, c);
    float3 m = z + fract(sin(float3(dot(z, float3(91.7, 37.3, 211.1)), dot(z, float3(17.9, 233.3, 61.7)),
                                    dot(z, float3(157.3, 19.1, 97.9)))) * 24634.63);
    float d = length(qb - m);
    if (d < db) { db = d; mb = m; }
}}}
float k = straehnen * schale;
q = (q - k * mb * 4.0) / (1.0 - k);
float3 f = floor(q);
float bester = 9.0;
float laenge = 1.0;
for (int a = -1; a <= 1; a++) { for (int b = -1; b <= 1; b++) { for (int c = -1; c <= 1; c++) {
    float3 z = f + float3(a, b, c);
    float3 m = z + fract(sin(float3(dot(z, float3(127.1, 311.7, 74.7)), dot(z, float3(269.5, 183.3, 246.1)),
                                    dot(z, float3(113.5, 271.9, 124.6)))) * 43758.5453);
    float d = length(q - m);
    if (d < bester) { bester = d; laenge = 0.55 + 0.45 * fract(sin(dot(z, float3(41.3, 289.1, 17.7))) * 9137.31); }
}}}
float ton = 1.0 + streuung * (2.0 * fract(laenge * 731.7) - 1.0);
if (schale > laenge || bester * (1.0 - k) > dicke * (1.0 - schale / laenge)) { discard_fragment(); }
_surface.diffuse.rgb *= mix(wurzelHell, spitzeHell, schale / laenge) * ton;
"""

func fellSchalen(_ g: SCNGeometry, _ k: Koerper) -> [SCNNode] {
    guard k.haar != nil else { return [] }
    let f = k.fellArt
    return (1...f.schalen).map { i in
        let s = g.copy() as! SCNGeometry
        let m = g.materials[0].copy() as! SCNMaterial
        m.shaderModifiers = [.geometry: fellGeometrie, .surface: fellOberflaeche]
        m.setValue(NSNumber(value: Float(i) / Float(f.schalen)), forKey: "schale")
        m.setValue(NSNumber(value: f.aufrecht), forKey: "aufrecht")
        m.setValue(NSNumber(value: f.neigung), forKey: "neigung")
        m.setValue(NSNumber(value: f.schwere), forKey: "schwere")
        m.setValue(NSValue(scnVector3: scnVektor(f.ursprung)), forKey: "ursprung")
        m.setValue(NSNumber(value: f.dichte), forKey: "dichte")
        m.setValue(NSNumber(value: f.dicke), forKey: "dicke")
        // Die Wurzelhelligkeit steckt schon in der Hautfarbe (netzBauen); die Schalen heben sie zur Spitze an.
        m.setValue(NSNumber(value: 1.0), forKey: "wurzelHell")
        m.setValue(NSNumber(value: f.spitze / f.wurzel), forKey: "spitzeHell")
        m.setValue(NSNumber(value: f.straehnen), forKey: "straehnen")
        m.setValue(NSNumber(value: f.streuung), forKey: "streuung")
        m.isDoubleSided = true
        s.materials = [m]
        let n = SCNNode(geometry: s); n.castsShadow = false
        return n
    }
}

// ---------- Augen ----------
//
// Tieraugen in diesem Stil: fast nur Iris, kaum Weiss, eine grosse Pupille, eine glaenzende Hornhaut
// darueber und ein Lichtpunkt. Die Iris ist ein Bild (Verlauf, dunkler Rand, feine Fasern) auf einer
// Scheibe hinter der Hornhaut; der Lichtpunkt entsteht vom Licht selbst auf der Hornhaut und wird von
// einem kleinen leuchtenden Punkt verstaerkt — der "Funke", der eine Figur lebendig macht.

func irisBild(_ farbe: NSColor, pupille: CGFloat = 0.42, schlitz: Bool = false, quer: Bool = false, schlitzBreite: CGFloat = 0.32,
             fasern: Int = 900) -> NSImage {
    let g: CGFloat = 1024
    let bild = NSImage(size: NSSize(width: g, height: g))
    bild.lockFocus()
    let ctx = NSGraphicsContext.current!.cgContext
    let mitte = CGPoint(x: g / 2, y: g / 2)
    var zufall: UInt64 = 0x9E3779B97F4A7C15
    func z() -> CGFloat { zufall = zufall &* 6364136223846793005 &+ 1442695040888963407; return CGFloat(zufall >> 33) / CGFloat(1 << 31) }
    let raum = CGColorSpace(name: CGColorSpace.sRGB)!
    let hell = farbe.blended(withFraction: 0.35, of: .white)!.cgColor
    let dunkel = farbe.blended(withFraction: 0.55, of: .black)!.cgColor
    let verlauf = CGGradient(colorsSpace: raum, colors: [hell, farbe.cgColor, dunkel] as CFArray, locations: [0, 0.55, 1])!
    ctx.addEllipse(in: CGRect(x: 0, y: 0, width: g, height: g)); ctx.clip()
    ctx.drawRadialGradient(verlauf, startCenter: mitte, startRadius: 0, endCenter: mitte, endRadius: g / 2, options: [])
    // Fasern: viele feine, unterschiedlich lange Strahlen, leicht geschwungen — wie im Foto einer Iris.
    for _ in 0..<fasern {
        let w = z() * .pi * 2, r1 = g * (0.14 + 0.10 * z()), r2 = g * (0.30 + 0.17 * z())
        ctx.setLineWidth(0.8 + 1.6 * z())
        ctx.setStrokeColor((z() < 0.5 ? hell : dunkel).copy(alpha: 0.18 + 0.25 * z())!)
        let biege = (z() - 0.5) * 0.25
        ctx.move(to: CGPoint(x: mitte.x + cos(w) * r1, y: mitte.y + sin(w) * r1))
        ctx.addQuadCurve(to: CGPoint(x: mitte.x + cos(w + biege) * r2, y: mitte.y + sin(w + biege) * r2),
                         control: CGPoint(x: mitte.x + cos(w + biege * 0.3) * (r1 + r2) / 2, y: mitte.y + sin(w + biege * 0.3) * (r1 + r2) / 2))
        ctx.strokePath()
    }
    // Krypten: kleine dunkle Vertiefungen zwischen den Fasern.
    for _ in 0..<70 {
        let w = z() * .pi * 2, r = g * (0.2 + 0.22 * z()), s = g * (0.008 + 0.018 * z())
        ctx.setFillColor(dunkel.copy(alpha: 0.35 + 0.3 * z())!)
        ctx.fillEllipse(in: CGRect(x: mitte.x + cos(w) * r - s, y: mitte.y + sin(w) * r - s * 0.6, width: 2 * s, height: 1.2 * s))
    }
    // Krause: der hellere, gezackte Ring um die Pupille.
    let krause = CGMutablePath()
    for i in 0...120 {
        let w = CGFloat(i) / 120 * .pi * 2, r = g * (pupille * 0.5 + 0.06 + 0.018 * sin(w * 17) + 0.012 * z())
        let pk = CGPoint(x: mitte.x + cos(w) * r, y: mitte.y + sin(w) * r)
        if i == 0 { krause.move(to: pk) } else { krause.addLine(to: pk) }
    }
    ctx.setStrokeColor(hell.copy(alpha: 0.45)!); ctx.setLineWidth(g * 0.012)
    ctx.addPath(krause); ctx.strokePath()
    // dunkler Limbusring, nach innen weich auslaufend
    let limbus = CGGradient(colorsSpace: raum, colors: [NSColor(white: 0, alpha: 0).cgColor, NSColor(white: 0, alpha: 0.8).cgColor] as CFArray, locations: [0.82, 1])!
    ctx.drawRadialGradient(limbus, startCenter: mitte, startRadius: 0, endCenter: mitte, endRadius: g / 2, options: [])
    // Pupille
    ctx.setFillColor(NSColor(white: 0.02, alpha: 1).cgColor)
    let pr = g * pupille / 2
    if schlitz {
        ctx.fillEllipse(in: CGRect(x: mitte.x - pr * schlitzBreite, y: mitte.y - pr * 1.6, width: pr * 2 * schlitzBreite, height: pr * 3.2))
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
          schlitzBreite: CGFloat = 0.32, irisAnteil: CGFloat = 0.86, funke f0: CGFloat = 1) -> SCNNode {
    let knoten = SCNNode()
    // Trickfilm-Stil (Entscheidung des Inhabers): weisser Augapfel, kleinere Iris, grosse Lichtpunkte.
    let f = TRICK ? f0 * 1.25 : f0 * 0.7
    let irisAnteil = TRICK ? min(irisAnteil, 0.60) : irisAnteil
    let g: CGFloat = 1024
    let voll = NSImage(size: NSSize(width: g, height: g))
    voll.lockFocus()
    if TRICK {
        // Augenweiss, zum Rand hin leicht abgedunkelt: sonst wirkt der Augapfel flach aufgeklebt.
        let ctx = NSGraphicsContext.current!.cgContext, raum = CGColorSpace(name: CGColorSpace.sRGB)!
        let weiss = CGGradient(colorsSpace: raum, colors: [NSColor(calibratedRed: 0.99, green: 0.98, blue: 0.96, alpha: 1).cgColor,
                                                           NSColor(calibratedRed: 0.93, green: 0.90, blue: 0.87, alpha: 1).cgColor,
                                                           NSColor(calibratedRed: 0.74, green: 0.70, blue: 0.68, alpha: 1).cgColor] as CFArray,
                               locations: [0, 0.6, 1])!
        ctx.drawRadialGradient(weiss, startCenter: CGPoint(x: g / 2, y: g / 2), startRadius: 0,
                               endCenter: CGPoint(x: g / 2, y: g / 2), endRadius: g * 0.72, options: [.drawsAfterEndLocation])
        // dunkler Ring um die Iris
        let ir = g * irisAnteil * 1.06
        NSColor(white: 0.05, alpha: 0.9).setFill()
        NSBezierPath(ovalIn: NSRect(x: (g - ir) / 2, y: (g - ir) / 2, width: ir, height: ir)).fill()
    } else {
        iris.blended(withFraction: 0.82, of: .black)!.setFill(); NSRect(x: 0, y: 0, width: g, height: g).fill()
    }
    let ir = g * irisAnteil
    irisBild(iris, pupille: pupille, schlitz: schlitz, quer: quer, schlitzBreite: schlitzBreite, fasern: TRICK ? 160 : 900)
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
    // Der Funke. Runde 135: groesser (`f`) und tiefer gesetzt — ein grosser Lichtpunkt macht einen
    // Blick weich, ein kleiner laesst ihn starren; und unter einem halb gesenkten Oberlid waere der
    // alte, hoch sitzende Punkt verschwunden.
    let mf = SCNMaterial(); mf.lightingModel = .constant; mf.diffuse.contents = NSColor(white: 1, alpha: 0.95)
    let funke = SCNSphere(radius: r * (TRICK ? 0.085 : 0.075) * f); funke.materials = [mf]
    let fk = SCNNode(geometry: funke); fk.position = SCNVector3(-r * 0.30, r * 0.18, r * 0.94)
    knoten.addChildNode(fk)
    let funke2 = SCNSphere(radius: r * 0.03 * f); funke2.materials = [mf]
    let fk2 = SCNNode(geometry: funke2); fk2.position = SCNVector3(r * 0.26, -r * 0.30, r * 0.92)
    knoten.addChildNode(fk2)
    return knoten
}

func glanzKoerper(_ k: Koerper, grenze: Float, n: Int, rauheit: Float, lack: Float) -> SCNNode {
    let netz = netzBauen(k, grenze: grenze, n: n)
    let g = geometrie(netz, k)
    g.materials[0].shaderModifiers = nil
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
            l.castsShadow = true; l.shadowSampleCount = 48; l.shadowRadius = 18
            l.shadowMapSize = CGSize(width: 2048, height: 2048); l.shadowColor = NSColor(white: 0, alpha: 0.45)
            l.orthographicScale = 3; l.zNear = 1; l.zFar = 30
        }
        let k = SCNNode(); k.light = l; k.position = scnVektor(von); k.look(at: SCNVector3(0, 0, 0))
        szene.rootNode.addChildNode(k)
    }
    licht(.directional, NSColor(calibratedRed: 1, green: 0.95, blue: 0.86, alpha: 1), 1500, V(-5, 6, 6), schatten: true)  // Hauptlicht
    licht(.directional, NSColor(calibratedRed: 0.78, green: 0.86, blue: 1, alpha: 1), 220, V(6, 0, 4))                   // Fuelllicht
    licht(.directional, NSColor(calibratedRed: 1, green: 0.98, blue: 0.95, alpha: 1), 1100, V(4, 4, -6))                  // Kante
    // Warmes Gegenlicht von unten vorn, wie eine helle Flaeche vor dem Tier: hellt Kinn und Brust auf,
    // die sonst unter dem Kopf absaufen, und gibt den Augen einen zweiten, schwachen Glanz.
    licht(.directional, NSColor(calibratedRed: 1, green: 0.90, blue: 0.80, alpha: 1), 260, V(0, -5, 5))
}

// Runde 133: `leinwand` vergroessert das Bild um diesen Faktor, ohne den Massstab zu aendern — der
// Bildwinkel waechst mit. Die mittleren 512 Punkte einer Leinwand von 2 sind also genau das Bild
// von vorher. Noetig, seit die Tiere einen Oberkoerper haben: Der reicht ueber den alten Rand
// hinaus und wird erst im Kreis abgeschnitten, nicht schon an der Bildkante.
func rendern(_ szene: SCNScene, groesse: Int, leinwand: Float = 1, kameraAbstand: Float, ziel: V, nach pfad: String) {
    szene.background.contents = NSColor.clear
    let kam = SCNCamera()
    kam.fieldOfView = CGFloat(2 * atanf(tanf(12 * .pi / 180) * leinwand) * 180 / .pi); kam.zNear = 0.1; kam.zFar = 100
    kam.wantsHDR = true; kam.wantsExposureAdaptation = false; kam.exposureOffset = -0.35
    // Etwas mehr Kontrast und Farbe: Auf Avatargroesse wirkten die Tiere sonst blass und weich.
    kam.contrast = 0.08; kam.saturation = TRICK ? 1.14 : 1.06
    kam.screenSpaceAmbientOcclusionIntensity = 1.1
    kam.screenSpaceAmbientOcclusionRadius = 0.25
    kam.screenSpaceAmbientOcclusionNormalThreshold = 0.3
    let kk = SCNNode(); kk.camera = kam
    kk.position = scnVektor(ziel + V(0, 0.25, kameraAbstand)); kk.look(at: scnVektor(ziel))
    szene.rootNode.addChildNode(kk)
    let r = SCNRenderer(device: MTLCreateSystemDefaultDevice()!, options: nil)
    r.scene = szene; r.pointOfView = kk
    let seite = Int(Float(groesse) * leinwand)
    let bild = r.snapshot(atTime: 0, with: CGSize(width: seite, height: seite), antialiasingMode: .multisampling4X)
    let rep = NSBitmapImageRep(data: bild.tiffRepresentation!)!
    try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: pfad))
}

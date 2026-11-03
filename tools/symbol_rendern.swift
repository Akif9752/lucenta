// Rendert das App-Symbol (Runde 131). Vorher gab es nur das fertige PNG, keine Quelle.
//   swiftc -O tools/symbol_rendern.swift -o /tmp/symbol && /tmp/symbol assets/icon/lucenta-icon-1024.png
//   /tmp/symbol assets/icon/lucenta-icon-1024-gerundet.png gerundet     (Vorschau mit Ecken, MIT Alpha)
// Danach: Kopie nach ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png, die kleinen
// Groessen mit `sips -Z <n>`, und das apple-touch-icon in src/index.head.html (180 px, base64).
import CoreGraphics
import Foundation
import ImageIO
import UniformTypeIdentifiers

// Runde 131: App-Symbol im Gruen des Test-Knopfs (Dunkelmodus, --accent #5CB4AD), Fuenfeck wie bisher.
let n = 1024
let cs = CGColorSpace(name: CGColorSpace.sRGB)!
// noneSkipLast: kein Alphakanal — Apple weist Symbole mit Transparenz zurueck.
let gerundet = CommandLine.arguments.count > 2 && CommandLine.arguments[2] == "gerundet"
let ctx = CGContext(data: nil, width: n, height: n, bitsPerComponent: 8, bytesPerRow: 0, space: cs,
                    bitmapInfo: (gerundet ? CGImageAlphaInfo.premultipliedLast : CGImageAlphaInfo.noneSkipLast).rawValue)!
if gerundet {   // Vorschaufassung mit Ecken wie auf dem Homescreen (Radius 22,37 %), MIT Alphakanal
    ctx.addPath(CGPath(roundedRect: CGRect(x: 0, y: 0, width: n, height: n), cornerWidth: 229, cornerHeight: 229, transform: nil))
    ctx.clip()
}
func farbe(_ hex: UInt32) -> CGColor {
    CGColor(colorSpace: cs, components: [CGFloat((hex >> 16) & 0xff) / 255, CGFloat((hex >> 8) & 0xff) / 255,
                                         CGFloat(hex & 0xff) / 255, 1])!
}
// Alternative Symbole (Runde 217): GRUND, GRUND2 (Verlauf von oben nach unten) und FORM als Hex aus der Umgebung.
let env = ProcessInfo.processInfo.environment
func hexEnv(_ k: String, _ vorgabe: UInt32) -> UInt32 { env[k].flatMap { UInt32($0, radix: 16) } ?? vorgabe }
let grund = hexEnv("GRUND", 0x5CB4AD), grund2 = hexEnv("GRUND2", grund), form = hexEnv("FORM", 0xF7ECDC)
if grund2 == grund {
    ctx.setFillColor(farbe(grund))
    ctx.fill(CGRect(x: 0, y: 0, width: n, height: n))
} else {
    let verlauf = CGGradient(colorsSpace: cs, colors: [farbe(grund), farbe(grund2)] as CFArray, locations: [0, 1])!
    ctx.drawLinearGradient(verlauf, start: CGPoint(x: 0, y: n), end: CGPoint(x: 0, y: 0), options: [])
}
// Regelmaessiges Fuenfeck, Spitze oben; CoreGraphics zaehlt y von unten.
let R = 288.0, rund = 44.0          // Umkreis inkl. Rundung, Strichbreite der runden Ecken
let cx = 512.0, cyOben = 544.0       // Mitte, gemessen von oben (Spitze bei 256, Fuss bei 777)
let r = R - rund / 2                 // Ecken um die halbe Strichbreite nach innen: Spitze wieder bei 256
let pfad = CGMutablePath()
for k in 0..<5 {
    let w = -Double.pi / 2 + Double(k) * 2 * .pi / 5
    let p = CGPoint(x: cx + r * cos(w), y: Double(n) - (cyOben + r * sin(w)))
    k == 0 ? pfad.move(to: p) : pfad.addLine(to: p)
}
pfad.closeSubpath()
ctx.setFillColor(farbe(form)); ctx.setStrokeColor(farbe(form))
ctx.setLineWidth(rund); ctx.setLineJoin(.round)
ctx.addPath(pfad); ctx.drawPath(using: .fillStroke)
let bild = ctx.makeImage()!
let ziel = URL(fileURLWithPath: CommandLine.arguments[1])
let d = CGImageDestinationCreateWithURL(ziel as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(d, bild, nil); CGImageDestinationFinalize(d)

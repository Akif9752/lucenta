// Stellt ein Tierbild frei (Vision, lokal auf dem Mac, nichts verlaesst den Rechner), schneidet es auf die Figur zu und
// legt es quadratisch mit etwas Rand auf 1024 px. Aufruf: swift freistellen.swift <eingabe> <ausgabe.png>
import AppKit
import Vision
import CoreImage

let args = CommandLine.arguments
guard args.count == 3, let bild = NSImage(contentsOfFile: args[1]),
      let cg = bild.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("Aufruf: swift freistellen.swift <eingabe> <ausgabe.png>"); exit(2)
}
let anfrage = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(cgImage: cg)
try handler.perform([anfrage])
guard let ergebnis = anfrage.results?.first else { print("Keine Figur erkannt: \(args[1])"); exit(1) }
let maske = try ergebnis.generateMaskedImage(ofInstances: ergebnis.allInstances, from: handler, croppedToInstancesExtent: true)
let ci = CIImage(cvPixelBuffer: maske)
let kontext = CIContext()
guard let frei = kontext.createCGImage(ci, from: ci.extent) else { exit(1) }

// Quadrat mit 6 % Rand, Figur mittig
let w = CGFloat(frei.width), h = CGFloat(frei.height), seite = max(w, h) * 1.12
let ziel: CGFloat = 1024, s = ziel / seite
let raum = CGColorSpace(name: CGColorSpace.sRGB)!
let ctx = CGContext(data: nil, width: Int(ziel), height: Int(ziel), bitsPerComponent: 8, bytesPerRow: 0,
                    space: raum, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.interpolationQuality = .high
ctx.draw(frei, in: CGRect(x: (ziel - w * s) / 2, y: (ziel - h * s) / 2, width: w * s, height: h * s))
let rep = NSBitmapImageRep(cgImage: ctx.makeImage()!)
try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[2]))
print("frei:", args[2])

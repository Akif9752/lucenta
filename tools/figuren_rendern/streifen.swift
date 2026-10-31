// Legt Tierbilder im Kreis nebeneinander, wie im Avatar der App — EIN Bild zum Vergleichen statt vieler.
// Aufruf: swift tools/figuren_rendern/streifen.swift <ausgabe.png> <bild> [<bild> …]   (Zeilenumbruch: "-")
import AppKit

let args = Array(CommandLine.arguments.dropFirst())
guard args.count >= 2 else { print("Aufruf: streifen.swift <ausgabe.png> <bild> …  (\"-\" = neue Zeile)"); exit(2) }
let zeilen = args.dropFirst().split(separator: "-").map(Array.init)
let k: CGFloat = 180, rand: CGFloat = 10
let breite = CGFloat(zeilen.map(\.count).max() ?? 1) * (k + rand) + rand
let hoehe = CGFloat(zeilen.count) * (k + rand) + rand
let bild = NSImage(size: NSSize(width: breite, height: hoehe))
bild.lockFocus()
NSColor(calibratedWhite: 0.93, alpha: 1).setFill(); NSRect(x: 0, y: 0, width: breite, height: hoehe).fill()
for (zi, zeile) in zeilen.enumerated() {
    for (si, pfad) in zeile.enumerated() {
        let r = NSRect(x: rand + CGFloat(si) * (k + rand), y: hoehe - CGFloat(zi + 1) * (k + rand), width: k, height: k)
        NSGraphicsContext.saveGraphicsState()
        let kreis = NSBezierPath(ovalIn: r)
        NSColor(calibratedRed: 0.36, green: 0.55, blue: 0.60, alpha: 1).setFill(); kreis.fill()   // Hintergrund wie in der App
        kreis.addClip()
        if let b = NSImage(contentsOfFile: pfad) {
            // Vorlagen (nicht quadratisch) mittig auf die kurze Seite zugeschnitten.
            let s = min(b.size.width, b.size.height)
            let quelle = NSRect(x: (b.size.width - s) / 2, y: (b.size.height - s) / 2, width: s, height: s)
            b.draw(in: r, from: quelle, operation: .sourceOver, fraction: 1)
        }
        NSGraphicsContext.restoreGraphicsState()
    }
}
bild.unlockFocus()
let rep = NSBitmapImageRep(data: bild.tiffRepresentation!)!
try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: args[0]))
print(args[0])

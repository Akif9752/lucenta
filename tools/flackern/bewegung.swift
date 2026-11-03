// Je Bild der Aufnahme: Zeitstempel und mittlere Aenderung zum Vorbild (0..255). Der Simulator schreibt nur
// Bilder, wenn sich etwas aendert — eine Luecke mitten in einer Bewegung ist also ein verlorenes Bild.
import AVFoundation
let asset = AVURLAsset(url: URL(fileURLWithPath: CommandLine.arguments[1]))
let track = try! await asset.loadTracks(withMediaType: .video)[0]
let reader = try! AVAssetReader(asset: asset)
let out = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(out); reader.startReading()
var vorher: [UInt8] = []
while let s = out.copyNextSampleBuffer(), let pb = CMSampleBufferGetImageBuffer(s) {
    let t = CMSampleBufferGetPresentationTimeStamp(s).seconds
    CVPixelBufferLockBaseAddress(pb, .readOnly)
    let w = CVPixelBufferGetWidth(pb), h = CVPixelBufferGetHeight(pb), bpr = CVPixelBufferGetBytesPerRow(pb)
    let p = CVPixelBufferGetBaseAddress(pb)!.assumingMemoryBound(to: UInt8.self)
    var jetzt: [UInt8] = []
    for y in stride(from: 0, to: h, by: 6) { for x in stride(from: 0, to: w, by: 6) { jetzt.append(p[y*bpr + x*4 + 1]) } }
    CVPixelBufferUnlockBaseAddress(pb, .readOnly)
    var d = 0.0
    if vorher.count == jetzt.count { for i in 0..<jetzt.count { d += abs(Double(jetzt[i]) - Double(vorher[i])) }; d /= Double(jetzt.count) }
    print(String(format: "%.3f %.3f", t, d))
    vorher = jetzt
}

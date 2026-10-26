import AVFoundation
let asset = AVURLAsset(url: URL(fileURLWithPath: CommandLine.arguments[1]))
let track = try! await asset.loadTracks(withMediaType: .video)[0]
let reader = try! AVAssetReader(asset: asset)
let out = AVAssetReaderTrackOutput(track: track, outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(out); reader.startReading()
var zeilen: [String] = []
while let s = out.copyNextSampleBuffer(), let pb = CMSampleBufferGetImageBuffer(s) {
    let t = CMSampleBufferGetPresentationTimeStamp(s).seconds
    CVPixelBufferLockBaseAddress(pb, .readOnly)
    let w = CVPixelBufferGetWidth(pb), h = CVPixelBufferGetHeight(pb), bpr = CVPixelBufferGetBytesPerRow(pb)
    let p = CVPixelBufferGetBaseAddress(pb)!.assumingMemoryBound(to: UInt8.self)
    var oben = 0.0, unten = 0.0, n1 = 0.0, n2 = 0.0
    for y in stride(from: h/8, to: h*7/8, by: 8) { for x in stride(from: 0, to: w, by: 8) {
        let i = y*bpr + x*4; let v = (Double(p[i]) + Double(p[i+1]) + Double(p[i+2])) / 3
        if y < h/2 { oben += v; n1 += 1 } else { unten += v; n2 += 1 } } }
    CVPixelBufferUnlockBaseAddress(pb, .readOnly)
    zeilen.append(String(format: "%.3f %.2f %.2f", t, oben/n1, unten/n2))
}
print(zeilen.joined(separator: "\n"))

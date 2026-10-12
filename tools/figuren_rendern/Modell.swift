// Runde 125: Die Tier-Avatare, selbst modelliert und mit SceneKit gerendert.
//
// Auftrag des Inhabers: "realistischer" und "vom Optischen sehr an den Tieren von Findet Nemo
// orientiert" — gemeint ist der STIL (plastisch, weich beleuchtet, grosse ausdrucksvolle Augen,
// naturnahe Farben), keine Nachbildung von Pixar-Figuren (Runde 121: im Geist ja, Kopie nein).
// Auf diesem Rechner gibt es kein 3D-Programm; macOS bringt aber SceneKit mit, einen Renderer mit
// physikalisch basiertem Licht. Dieses Werkzeug baut die Koepfe als VOLUMEN aus weich verschmolzenen
// Grundformen (vorzeichenbehaftete Abstandsfelder, "smooth union") und rechnet daraus eine glatte
// Oberflaeche ("surface nets"). So entstehen organische Formen ohne Naehte — der Unterschied zu
// aneinandergesetzten Kugeln ist genau der Unterschied zwischen Knetfigur und Filmfigur.
//
// Augen und Nase sind eigene Koerper mit eigenem Material (glaenzende Hornhaut, Lichtpunkt), weil
// gerade dort ein Gesicht gelesen wird.
//
// Laeuft einmal von Hand (tools/figuren_rendern/bauen.sh), nie beim Bau der App. Ergebnis: PNG
// nach /tmp/lucenta-figuren-roh/, danach setzt tools/figuren_holen.py --lokal sie wie gewohnt um.

import Foundation
import simd

typealias V = SIMD3<Float>

// ---------- Grundformen ----------

struct Form {
    enum Art { case ellipsoid(V), rundkegel(V, Float, Float) }   // Radien | Endpunkt, r1, r2
    var art: Art
    var mitte: V
    var drehung: simd_quatf = simd_quatf(angle: 0, axis: V(0, 1, 0))
    var stauchung: V = V(1, 1, 1)       // lokale Skalierung (z. B. flache Ohren)
    var weich: Float = 0.12             // wie weich sie mit dem Rest verschmilzt
    var abziehen = false                // Mulde statt Beule (z. B. Augenhoehle, Ohrmuschel)

    func abstand(_ p: V) -> Float {
        var q = drehung.inverse.act(p - mitte)
        q /= stauchung
        let s = min(stauchung.x, min(stauchung.y, stauchung.z))
        switch art {
        case .ellipsoid(let r):
            // Naeherung nach Inigo Quilez: gut genug fuer weiche Vereinigung.
            let k0 = simd_length(q / r), k1 = simd_length(q / (r * r))
            return (k1 > 0 ? k0 * (k0 - 1) / k1 : -min(r.x, min(r.y, r.z))) * s
        case .rundkegel(let b, let r1, let r2):
            let pa = q, ba = b
            let h = simd_clamp(simd_dot(pa, ba) / simd_dot(ba, ba), 0, 1)
            return (simd_length(pa - ba * h) - (r1 + (r2 - r1) * h)) * s
        }
    }
}

func weicheVereinigung(_ a: Float, _ b: Float, _ k: Float) -> Float {
    let h = simd_clamp(0.5 + 0.5 * (b - a) / k, 0, 1)
    return simd_mix(b, a, h) - k * h * (1 - h)
}
func weicheDifferenz(_ a: Float, _ b: Float, _ k: Float) -> Float {
    let h = simd_clamp(0.5 - 0.5 * (a + b) / k, 0, 1)
    return simd_mix(a, -b, h) + k * h * (1 - h)
}

struct Koerper {
    var formen: [Form]
    var farbe: (V, V) -> V            // (Punkt, Normale) -> Farbe in linearem RGB
    var rauheit: Float = 0.62
    var fell: Float = 0.0             // Staerke der feinen Fellstruktur in der Normalen

    func abstand(_ p: V) -> Float {
        var d: Float = 1e9
        for f in formen where !f.abziehen { d = d > 1e8 ? f.abstand(p) : weicheVereinigung(d, f.abstand(p), f.weich) }
        for f in formen where f.abziehen { d = weicheDifferenz(d, f.abstand(p), f.weich) }
        return d
    }
}

// ---------- Oberflaeche aus dem Abstandsfeld ("naive surface nets") ----------

struct Netz { var punkte: [V] = []; var normalen: [V] = []; var farben: [V] = []; var dreiecke: [Int32] = [] }

func netzBauen(_ k: Koerper, grenze: Float, n: Int) -> Netz {
    let schritt = 2 * grenze / Float(n)
    let m = n + 1
    var feld = [Float](repeating: 0, count: m * m * m)
    func idx(_ i: Int, _ j: Int, _ l: Int) -> Int { (l * m + j) * m + i }
    func pos(_ i: Int, _ j: Int, _ l: Int) -> V { V(Float(i), Float(j), Float(l)) * schritt - V(repeating: grenze) }
    DispatchQueue.concurrentPerform(iterations: m) { l in
        for j in 0..<m { for i in 0..<m { feld[idx(i, j, l)] = k.abstand(pos(i, j, l)) } }
    }
    var zelle = [Int32](repeating: -1, count: n * n * n)
    func zidx(_ i: Int, _ j: Int, _ l: Int) -> Int { (l * n + j) * n + i }
    var netz = Netz()
    let ecken: [(Int, Int, Int)] = [(0,0,0),(1,0,0),(0,1,0),(1,1,0),(0,0,1),(1,0,1),(0,1,1),(1,1,1)]
    let kanten: [(Int, Int)] = [(0,1),(2,3),(4,5),(6,7),(0,2),(1,3),(4,6),(5,7),(0,4),(1,5),(2,6),(3,7)]
    for l in 0..<n { for j in 0..<n { for i in 0..<n {
        var w = [Float](repeating: 0, count: 8); var innen = 0
        for (c, e) in ecken.enumerated() { w[c] = feld[idx(i + e.0, j + e.1, l + e.2)]; if w[c] < 0 { innen += 1 } }
        if innen == 0 || innen == 8 { continue }
        var summe = V(0, 0, 0); var zahl: Float = 0
        for (a, b) in kanten where (w[a] < 0) != (w[b] < 0) {
            let t = w[a] / (w[a] - w[b])
            let pa = V(Float(ecken[a].0), Float(ecken[a].1), Float(ecken[a].2))
            let pb = V(Float(ecken[b].0), Float(ecken[b].1), Float(ecken[b].2))
            summe += pa + (pb - pa) * t; zahl += 1
        }
        var p = (V(Float(i), Float(j), Float(l)) + summe / zahl) * schritt - V(repeating: grenze)
        // Ein Schritt auf die echte Flaeche: macht die Oberflaeche glatter als das Raster.
        let g = gradient(k, p); p -= g * k.abstand(p)
        zelle[zidx(i, j, l)] = Int32(netz.punkte.count)
        netz.punkte.append(p)
    }}}
    // Vierecke ueber jede Rasterkante mit Vorzeichenwechsel.
    for l in 1..<n { for j in 1..<n { for i in 1..<n {
        let d0 = feld[idx(i, j, l)]
        for achse in 0..<3 {
            let (di, dj, dl) = achse == 0 ? (1, 0, 0) : (achse == 1 ? (0, 1, 0) : (0, 0, 1))
            let d1 = feld[idx(i + di, j + dj, l + dl)]
            if (d0 < 0) == (d1 < 0) { continue }
            var q: [Int32]
            switch achse {
            case 0: q = [zelle[zidx(i, j - 1, l - 1)], zelle[zidx(i, j, l - 1)], zelle[zidx(i, j, l)], zelle[zidx(i, j - 1, l)]]
            case 1: q = [zelle[zidx(i - 1, j, l - 1)], zelle[zidx(i - 1, j, l)], zelle[zidx(i, j, l)], zelle[zidx(i, j, l - 1)]]
            default: q = [zelle[zidx(i - 1, j - 1, l)], zelle[zidx(i, j - 1, l)], zelle[zidx(i, j, l)], zelle[zidx(i - 1, j, l)]]
            }
            if q.contains(-1) { continue }
            if d0 > 0 { q.reverse() }
            netz.dreiecke += [q[0], q[1], q[2], q[0], q[2], q[3]]
        }
    }}}
    for p in netz.punkte {
        var nrm = gradient(k, p)
        if k.fell > 0 { nrm = simd_normalize(nrm + fellRauschen(p) * k.fell) }
        netz.normalen.append(nrm)
        netz.farben.append(k.farbe(p, nrm) * verdeckung(k, p, gradient(k, p)))
    }
    return netz
}

// Umgebungsverdeckung aus dem Abstandsfeld: Wie viel Platz hat ein Punkt entlang seiner Normalen?
// In Falten (Augenhoehle, Ohransatz, unter der Schnauze) wenig — dort wird es dunkler. SceneKits
// eigene Verdeckung (SSAO) greift im Schnappschuss nicht, deshalb steht sie hier in der Farbe.
func verdeckung(_ k: Koerper, _ p: V, _ n: V) -> V {
    var summe: Float = 0, gewicht: Float = 1
    for i in 1...5 {
        let h = 0.03 + 0.07 * Float(i)
        summe += gewicht * max(0, h - k.abstand(p + n * h))
        gewicht *= 0.6
    }
    let ao = simd_clamp(1 - 2.6 * summe, 0.35, 1)
    return V(repeating: ao)
}

func gradient(_ k: Koerper, _ p: V) -> V {
    let e: Float = 0.004
    let g = V(k.abstand(p + V(e, 0, 0)) - k.abstand(p - V(e, 0, 0)),
              k.abstand(p + V(0, e, 0)) - k.abstand(p - V(0, e, 0)),
              k.abstand(p + V(0, 0, e)) - k.abstand(p - V(0, 0, e)))
    let l = simd_length(g)
    return l > 0 ? g / l : V(0, 0, 1)
}

// ---------- Rauschen fuer Fell und Farbflecken ----------

func hash3(_ p: SIMD3<Int32>) -> Float {
    var h = UInt32(bitPattern: p.x &* 73856093) ^ UInt32(bitPattern: p.y &* 19349663) ^ UInt32(bitPattern: p.z &* 83492791)
    h = (h ^ (h >> 13)) &* 1274126177
    return Float(h & 0xFFFF) / 65535.0
}
func wertRauschen(_ p: V) -> Float {
    let f = p.rounded(.down), t = p - f
    let s = t * t * (3 - 2 * t)
    let i = SIMD3<Int32>(Int32(f.x), Int32(f.y), Int32(f.z))
    func h(_ a: Int32, _ b: Int32, _ c: Int32) -> Float { hash3(i &+ SIMD3<Int32>(a, b, c)) }
    let x00 = simd_mix(h(0,0,0), h(1,0,0), s.x), x10 = simd_mix(h(0,1,0), h(1,1,0), s.x)
    let x01 = simd_mix(h(0,0,1), h(1,0,1), s.x), x11 = simd_mix(h(0,1,1), h(1,1,1), s.x)
    return simd_mix(simd_mix(x00, x10, s.y), simd_mix(x01, x11, s.y), s.z)
}
func fbm(_ p: V) -> Float {
    var a: Float = 0.5, s: Float = 0, q = p
    for _ in 0..<4 { s += a * wertRauschen(q); q *= 2.03; a *= 0.5 }
    return s
}
// Feine, laengliche Struktur: Fell liegt in Stroemen, nicht als Koernung.
func fellRauschen(_ p: V) -> V {
    let q = p * V(22, 9, 22)
    return V(wertRauschen(q) - 0.5, wertRauschen(q + V(17, 3, 9)) - 0.5, wertRauschen(q + V(5, 11, 23)) - 0.5) * 2
}

// ---------- Farbwerkzeuge ----------

func hex(_ s: String) -> V {
    let v = UInt32(s.dropFirst(), radix: 16) ?? 0
    func lin(_ c: UInt32) -> Float { let x = Float(c) / 255; return x <= 0.04045 ? x / 12.92 : powf((x + 0.055) / 1.055, 2.4) }
    return V(lin((v >> 16) & 255), lin((v >> 8) & 255), lin(v & 255))
}
func glatt(_ a: Float, _ b: Float, _ x: Float) -> Float { let t = simd_clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
// Weiche Maske einer Ellipsoid-Region (1 innen, 0 aussen), fuer Farbflecken ohne Geometrie.
func region(_ p: V, _ c: V, _ r: V, _ rand: Float = 0.25) -> Float {
    let d = simd_length((p - c) / r)
    return 1 - glatt(1 - rand, 1 + rand, d)
}

// Zellmuster (Voronoi): Abstand zum naechsten Zellrand und ein Zufallswert je Zelle. Traegt die
// Panzerplatten der Schildkroete, die Schuppen des Fisches und die Federflecken der Eule.
func zellen(_ p: V, _ skala: Float) -> (rand: Float, wert: Float) {
    let q = p * skala, f = q.rounded(.down)
    var d1: Float = 9, d2: Float = 9, w: Float = 0
    for a in -1...1 { for b in -1...1 { for c in -1...1 {
        let z = SIMD3<Int32>(Int32(f.x) + Int32(a), Int32(f.y) + Int32(b), Int32(f.z) + Int32(c))
        let mitte = V(Float(z.x), Float(z.y), Float(z.z)) + V(hash3(z), hash3(z &+ 7), hash3(z &+ 13))
        let d = simd_length(q - mitte)
        if d < d1 { d2 = d1; d1 = d; w = hash3(z &+ 29) } else if d < d2 { d2 = d }
    }}}
    return ((d2 - d1) / skala, w)
}

// Die Vorderflaeche eines Koerpers bei (x, y): von vorn bis zur Oberflaeche gehen.
func vorderflaeche(_ k: Koerper, _ x: Float, _ y: Float, von: Float = 3) -> Float {
    var z = von
    for _ in 0..<200 { let d = k.abstand(V(x, y, z)); if d < 0.001 { break }; z -= max(d, 0.002) }
    return z
}

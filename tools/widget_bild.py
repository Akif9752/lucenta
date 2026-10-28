#!/usr/bin/env python3
"""Rendert das Tagesform-Widget (klein, mittel, Sperrbildschirm) als PNG — die Xcode-Vorschau haengt
bei dieser Erweiterung (timelineReloadTimeout). Baut die echten Ansichten aus ios/App/LucentaWidget/
mit festen Farben und einer Sprache aus dem String-Katalog in ein kleines Programm und laesst es im
gebooteten Simulator laufen.

    python3 tools/widget_bild.py [sprache] [hell|dunkel]     # Vorgabe: de dunkel
    -> /tmp/widget-bild/{klein,mittel,sperre}.png
"""
import json, os, subprocess, sys

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = os.path.join(WURZEL, 'ios/App/LucentaWidget')
AUS = '/tmp/widget-bild'
sprache = sys.argv[1] if len(sys.argv) > 1 else 'de'
dunkel = (sys.argv[2] if len(sys.argv) > 2 else 'dunkel') == 'dunkel'

def farbe(name):
    d = json.load(open(f'{W}/Assets.xcassets/{name}.colorset/Contents.json'))
    c = d['colors'][1 if dunkel and len(d['colors']) > 1 else 0]['color']['components']
    r, g, b = (int(c[k], 16) / 255 for k in ('red', 'green', 'blue'))
    return f'Color(red: {r:.4f}, green: {g:.4f}, blue: {b:.4f})'

src = open(f'{W}/LucentaWidget.swift').read().split('#Preview')[0]
src = src.replace('@Environment(\\.widgetFamily) private var familie', 'var familie: WidgetFamily = .systemMedium')
src = src.replace('private let marke = Color("AccentColor")', f'private var marke: Color {{ {farbe("AccentColor")} }}')
for n in ('AufMarke', 'WidgetBackground'):
    src = src.replace(f'Color("{n}")', farbe(n))
kat = json.load(open(f'{W}/Localizable.xcstrings'))['strings']
for k, v in kat.items():
    wert = v['localizations'][sprache]['stringUnit']['value']
    if '%@ ' in k and '%lld' not in k:          # "%@ logged" -> Text("\(name) eingetragen")
        src = src.replace('Text("\\(name) ' + k[3:] + '")', 'Text("' + wert.replace('%@', '\\(name)') + '")')
    elif '%' not in k:
        src = src.replace(f'"{k}"', json.dumps(wert, ensure_ascii=False))

hg = farbe('WidgetBackground')
haupt = f'''
import UIKit
@MainActor func bild(_ f: WidgetFamily, _ b: CGFloat, _ h: CGFloat, _ e: TagesformEintrag, _ n: String) {{
    let rand = f == .systemSmall || f == .systemMedium
    let v = TagesformAnsicht(familie: f, e: e).padding(16).frame(width: b, height: h)
        .background(rand ? {hg} : Color.gray.opacity(0.4))
        .clipShape(RoundedRectangle(cornerRadius: 22)).environment(\\.colorScheme, {'.dark' if dunkel else '.light'})
    let r = ImageRenderer(content: v); r.scale = 2
    if let p = r.uiImage?.pngData() {{ try? p.write(to: URL(fileURLWithPath: "{AUS}/\\(n).png")) }}
}}
let abends = Calendar.current.date(bySettingHour: 19, minute: 0, second: 0, of: .now)!
let e = TagesformEintrag(date: abends, heute: ["morgen": .init(energy: 4, valence: 3), "mittag": .init(energy: 3, valence: 4)],
                         entwurf: .init(tag: TagesformAblage.tag(abends), abschnitt: "abend", energy: nil, valence: 2))
MainActor.assumeIsolated {{
    bild(.systemSmall, 158, 158, e, "klein")
    bild(.systemMedium, 338, 158, e, "mittel")
    bild(.accessoryRectangular, 172, 76, e, "sperre")
}}
'''
os.makedirs(AUS, exist_ok=True)
open(f'{AUS}/main.swift', 'w').write(open(f'{W}/TagesformAblage.swift').read() + '\n' + src + haupt)
sdk = subprocess.check_output(['xcrun', '--sdk', 'iphonesimulator', '--show-sdk-path'], text=True).strip()
subprocess.check_call(['swiftc', '-target', 'arm64-apple-ios17.0-simulator', '-sdk', sdk, '-o', f'{AUS}/w', f'{AUS}/main.swift'])
subprocess.call(['xcrun', 'simctl', 'spawn', 'booted', f'{AUS}/w'])
print('\n'.join(sorted(f'{AUS}/{f}' for f in os.listdir(AUS) if f.endswith('.png'))))

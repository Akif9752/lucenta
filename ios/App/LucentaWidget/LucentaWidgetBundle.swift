import WidgetKit
import SwiftUI

/// Tagesform auf Home- und Sperrbildschirm (frei, nicht Lucenta+ — Entscheidung des Inhabers).
@main
struct LucentaWidgetBundle: WidgetBundle {
    var body: some Widget {
        LucentaWidget()
    }
}

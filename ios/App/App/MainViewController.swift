import UIKit
import WebKit
import Capacitor

/// Bruecken-Ansicht mit zwei Anpassungen am nativen UIScrollView der WebView. Beide beheben
/// Darstellungsfehler, die nur auf dem Geraet (WebKit) auftreten, nicht im Chromium der Pruefungen.
///
/// 1. **Kein vertikaler Overscroll-Bounce** (`bounces = false`). Beim Ueberdehnen am oberen Rand
///    zog der native ScrollView sonst den GESAMTEN Inhalt nach unten — auch den per
///    position:sticky gepinnten Kopf ("Lucenta") — und legte darueber die helle WebView-
///    Grundflaeche frei (im Dunkelmodus ein weisser Balken). `overscroll-behavior:none` in CSS
///    unterbindet diesen nativen Bounce in dieser WKWebView nicht. Der Wunsch der App ist
///    ohnehin: kein Gummiband.
///
/// 2. **Kein automatischer ContentInset** (`contentInsetAdjustmentBehavior = .never`). Die
///    capacitor.config setzt `ios.contentInset: "always"`; damit schob der ScrollView den
///    Web-Inhalt unter die Safe Area, und der freigelegte Streifen neben der Dynamic Island zeigte
///    die helle WebView-Grundflaeche. Das CSS der App ist aber auf randlosen Inhalt ausgelegt
///    (viewport-fit=cover, env(safe-area-inset-*) versetzt Kopf und Polsterung selbst). Mit .never
///    reicht der dunkle Seitenhintergrund bis unter die Statusleiste, und env() liefert die echten
///    Insets.
///
/// Innere Bildlaufbereiche (Schublade, Dialoge) scrollen ueber CSS-overflow in eigenen
/// DOM-Elementen, nicht ueber diesen ScrollView — sie bleiben von beidem unberuehrt.
class MainViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        stelleBildlaufEin()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // Doppelt gesetzt, falls Capacitor die WebView erst nach viewDidLoad bereitstellt.
        stelleBildlaufEin()
    }

    private func stelleBildlaufEin() {
        guard let scrollView = webView?.scrollView else { return }
        scrollView.bounces = false
        scrollView.alwaysBounceVertical = false
        scrollView.contentInsetAdjustmentBehavior = .never
    }
}

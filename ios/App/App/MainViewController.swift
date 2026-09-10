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
///
/// 3. **Themengerechte Hintergrundfarbe fuer die Ladeluecke.** Vom Geraet gemeldet: Beim Start ein
///    paar Sekunden schwarz. Ursache ist nicht die LaunchScreen (die zeigt das weisse Standard-
///    Splashbild), sondern die Luecke danach — iOS zeigt bereits das App-Fenster mit der WKWebView,
///    die die ~1,5-MB-Ein-Datei samt eingebetteter Schriften aber noch nicht gezeichnet hat; eine
///    ungemalte WebView ist im Dunkelmodus schwarz. Wir faerben View/WebView/ScrollView auf die
///    Papierfarbe der App (hell #E4E6DB, dunkel #0F1613, passend zu --paper), damit die Wartezeit
///    in der Markenfarbe statt in Schwarz vergeht und nahtlos in die gezeichnete Seite uebergeht.
///    (Die Ladezeit selbst bleibt — sie kommt aus der grossen Ein-Datei; ein Release-Build startet
///    schneller als der debug-signierte Xcode-Build.)
class MainViewController: CAPBridgeViewController {

    /// Papierfarbe der App als dynamische Farbe (hell/dunkel), passend zum CSS-Token --paper.
    private let papierfarbe = UIColor { tc in
        tc.userInterfaceStyle == .dark
            ? UIColor(red: 0x0F/255.0, green: 0x16/255.0, blue: 0x13/255.0, alpha: 1) // #0F1613
            : UIColor(red: 0xE4/255.0, green: 0xE6/255.0, blue: 0xDB/255.0, alpha: 1) // #E4E6DB
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        stelleBildlaufEin()
        faerbeLadeluecke()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // Doppelt gesetzt, falls Capacitor die WebView erst nach viewDidLoad bereitstellt.
        stelleBildlaufEin()
        faerbeLadeluecke()
    }

    private func stelleBildlaufEin() {
        guard let scrollView = webView?.scrollView else { return }
        scrollView.bounces = false
        scrollView.alwaysBounceVertical = false
        scrollView.contentInsetAdjustmentBehavior = .never
    }

    private func faerbeLadeluecke() {
        view.backgroundColor = papierfarbe
        webView?.backgroundColor = papierfarbe
        webView?.scrollView.backgroundColor = papierfarbe
    }
}

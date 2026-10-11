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
///    Papierfarbe der App (hell #F2F2F7, dunkel #000000, passend zu --paper; seit Runde 120 Apples Farbsystem), damit die Wartezeit
///    in der Markenfarbe statt in Schwarz vergeht und nahtlos in die gezeichnete Seite uebergeht.
///    (Die Ladezeit selbst bleibt — sie kommt aus der grossen Ein-Datei; ein Release-Build startet
///    schneller als der debug-signierte Xcode-Build.)
class MainViewController: CAPBridgeViewController {

    /// Papierfarbe der App als dynamische Farbe (hell/dunkel), passend zum CSS-Token --paper.
    private let papierfarbe = UIColor { tc in
        tc.userInterfaceStyle == .dark
            ? UIColor(red: 0, green: 0, blue: 0, alpha: 1) // #000000
            : UIColor(red: 0xF2/255.0, green: 0xF2/255.0, blue: 0xF7/255.0, alpha: 1) // #F2F2F7
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        stelleBildlaufEin()
        faerbeLadeluecke()
    }

    /// Runde 103: Die Kauf-Bruecke anmelden.
    ///
    /// `capacitorDidLoad()` ist der vorgesehene Haken dafuer — er laeuft, wenn die Bruecke steht,
    /// aber bevor die Seite geladen wird. Die Alternative waere, `LucentaKaeufePlugin` in die
    /// `packageClassList` von `capacitor.config.json` einzutragen, und das ist die Falle: Diese
    /// Datei ist von `npx cap sync ios` erzeugt und beim naechsten Sync ueberschrieben. Die
    /// Anmeldung waere dann spurlos weg, und die App faellt still auf "gibt es nur in der App"
    /// zurueck — ohne Fehler, ohne Warnung, nur ohne Kaufweg.
    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(LucentaKaeufePlugin())
        transparenzVorzeichnen()
        transparenzBeobachten()
        #if DEBUG
        entwicklungsbauMelden()
        #endif
    }

    #if DEBUG
    /// Runde 113, auf Wunsch des Inhabers: ein Umschalter im Profil zwischen freier und gekaufter
    /// Fassung, damit sich die bezahlte Version am Geraet ansehen laesst.
    ///
    /// Den Umschalter gab es schon — er war in der App absichtlich unsichtbar, weil er dort im
    /// App Store das Abo verschenken wuerde (Runde 103). `src/js/15-profile.js` lehnte dafuer eine
    /// Debug-Marke ab: "Eine Marke, die man setzen muss, ist eine, die man vergisst." Diese hier
    /// setzt niemand. Sie steht hinter `#if DEBUG`, und das setzt der Compiler — beim Start aus
    /// Xcode (Run = Debug) ist sie da, im Archiv fuer den Store (Archive = Release) ist dieser
    /// ganze Block gar nicht erst im Programm. Vergessen kann man sie also nur, indem man das
    /// Schema umstellt, und das wuerde man merken.
    private func entwicklungsbauMelden() {
        guard let inhalt = webView?.configuration.userContentController else { return }
        inhalt.addUserScript(WKUserScript(source: "window.__lucentaEntwicklungsbau = true;",
                                          injectionTime: .atDocumentStart,
                                          forMainFrameOnly: true))
    }
    #endif

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

    // MARK: - "Transparenz reduzieren" (Runde 106)
    //
    // Befund aus Runde 105, am Geraet gemessen und nicht geraten: WebKit auf iOS 27 kennt
    // `prefers-reduced-transparency` nicht. `reduce` UND `no-preference` melden beide `false` —
    // ein unterstuetztes Merkmal muesste genau eines bejahen. Der Rueckfall im Stilblatt (Glas
    // weg, deckende Flaeche) ist auf dem iPhone damit unerreichbar: Wer "Transparenz reduzieren"
    // einschaltet und "Kontrast erhoehen" nicht, behaelt genau das Glas, das er abbestellt hat.
    //
    // Die Huelle kann die Frage beantworten, die die WebView nicht stellen kann.
    // `UIAccessibility.isReduceTransparencyEnabled` ist dieselbe Einstellung, nur von der
    // nativen Seite gelesen. Sie wird als Attribut `data-transparenz="reduziert"` an `:root`
    // gehaengt; das Stilblatt nimmt dieses Attribut an vier Stellen NEBEN dem Medienmerkmal an
    // (`pruefeTransparenzTueren` in build.js haelt die beiden Fassungen jeder Regel zusammen,
    // damit sie nicht auseinanderdriften).
    //
    // Bewusst KEIN Capacitor-Plugin: Ein Plugin muesste von JavaScript aus gefragt werden, und
    // die Antwort kaeme erst nach dem ersten Zeichnen — ein Wimpernschlag Glas bei genau dem
    // Menschen, der es abbestellt hat. Die Huelle weiss es vorher und sagt es unaufgefordert.

    /// Der Attributname an `:root`, einmal hier und einmal im Stilblatt.
    private static let transparenzAttribut = "data-transparenz"

    /// Die eine Zeile, die das Attribut setzt oder wegnimmt — Grundlage beider Wege unten.
    private static func transparenzZeile(_ reduziert: Bool) -> String {
        reduziert
            ? "document.documentElement.setAttribute('\(transparenzAttribut)','reduziert');"
            : "document.documentElement.removeAttribute('\(transparenzAttribut)');"
    }

    /// Weg 1: der Stand von JETZT, bevor die Seite zeichnet.
    ///
    /// `capacitorDidLoad()` ist dafuer der richtige Zeitpunkt — die WebView steht, die Seite ist
    /// noch nicht geladen (`loadWebView()` kommt erst danach). Ein `WKUserScript` bei
    /// `atDocumentStart` laeuft damit vor dem ersten Bild.
    ///
    /// Der Umweg ueber `readystatechange` ist kein Zierrat: Bei `atDocumentStart` ist
    /// `document.documentElement` in der Regel schon da, aber nicht garantiert. Faellt der erste
    /// Versuch aus, zieht der zweite nach — und weil ein UserScript nur beim Laden laeuft,
    /// sammelt sich dieser Zuhoerer nicht an.
    private func transparenzVorzeichnen() {
        guard let inhalt = webView?.configuration.userContentController else { return }
        let quelle = """
        (function(){
          var setzen = function(){
            if (!document.documentElement) return;
            \(Self.transparenzZeile(UIAccessibility.isReduceTransparencyEnabled))
          };
          setzen();
          document.addEventListener('readystatechange', setzen);
        })();
        """
        inhalt.addUserScript(WKUserScript(source: quelle,
                                          injectionTime: .atDocumentStart,
                                          forMainFrameOnly: true))
    }

    /// Weg 2: die lebende Seite nachziehen.
    ///
    /// Das UserScript aus Weg 1 traegt den Stand vom Ladezeitpunkt und laesst sich nicht
    /// nachtraeglich ersetzen — `removeAllUserScripts()` wuerde die Bruecke von Capacitor
    /// mitnehmen. Also wird die geladene Seite direkt nachgezogen.
    ///
    /// Zwei Anlaesse, und der zweite ist der wichtigere: Die Mitteilung von UIKit kommt, solange
    /// Lucenta vorn ist. Wird die Einstellung aber in den Systemeinstellungen umgelegt, liegt
    /// Lucenta im Hintergrund — dann ist der Stand beim Zurueckkehren der verlaessliche.
    private func transparenzBeobachten() {
        for anlass in [UIAccessibility.reduceTransparencyStatusDidChangeNotification,
                       UIApplication.didBecomeActiveNotification] {
            NotificationCenter.default.addObserver(self, selector: #selector(transparenzNachziehen),
                                                   name: anlass, object: nil)
        }
    }

    @objc private func transparenzNachziehen() {
        // Nur in eine fertig geladene Seite hinein. `didBecomeActive` feuert beim Kaltstart,
        // waehrend die WebView noch laedt — ein `evaluateJavaScript` darauf ergibt genau den
        // `JS Eval error`, der in Runde 104 eine Runde Suche gekostet hat. Die noch ladende
        // Seite braucht es auch nicht: Sie bekommt den richtigen Stand aus Weg 1.
        guard let webView, webView.url != nil, !webView.isLoading else { return }
        let zeile = Self.transparenzZeile(UIAccessibility.isReduceTransparencyEnabled)
        webView.evaluateJavaScript("if (document.documentElement) { \(zeile) }")
    }
}

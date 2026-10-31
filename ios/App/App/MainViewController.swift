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
///    paar Sekunden schwarz. Ursache hier ist die Luecke nach dem Startbild (ein zweites Schwarz
///    VOR dem Startbild kam vom zu grossen Splash-Bild, Runde 122) — iOS zeigt bereits das App-Fenster mit der WKWebView,
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
            : UIColor(red: 0xE6/255.0, green: 0xE5/255.0, blue: 0xE0/255.0, alpha: 1) // #E6E5E0
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        stelleBildlaufEin()
        faerbeLadeluecke()
        AppSperre.shared.einrichten(self)
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
        bridge?.registerPluginInstance(LucentaKontoPlugin())
        bridge?.registerPluginInstance(LucentaGesundheitPlugin())
        bridge?.registerPluginInstance(LucentaSperrePlugin())
        transparenzVorzeichnen()
        transparenzBeobachten()
        themaEmpfangen()
        bestandSpiegeln()
        zoomAbschalten()
        #if DEBUG
        entwicklungsbauMelden()
        #endif
    }

    #if DEBUG
    /// Runde 113, auf Wunsch des Inhabers: ein Umschalter im Profil zwischen freier und gekaufter
    /// Fassung, damit sich die bezahlte Version am Geraet ansehen laesst.
    ///
    /// Den Umschalter gab es schon — er war in der App absichtlich unsichtbar, weil er dort im
    /// App Store das Abo verschenken wuerde (Runde 103). `src/js/17-profil.js` lehnte dafuer eine
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
        AppSperre.shared.anFensterHeben()
    }

    private func stelleBildlaufEin() {
        guard let scrollView = webView?.scrollView else { return }
        scrollView.bounces = false
        scrollView.alwaysBounceVertical = false
        scrollView.contentInsetAdjustmentBehavior = .never
        // Runde 126, Auftrag des Inhabers: "generell sollte sie nicht zoombar sein." Die App verhaelt
        // sich damit wie jede iOS-App: Vergroessern laeuft ueber die Systemfunktionen (Zoom,
        // Textgroesse), nicht ueber Aufziehen der Seite. Die Viewport-Angabe in der QUELLE bleibt
        // unveraendert — dist/lucenta.html im Browser bleibt zoombar (WCAG 1.4.4), und pruef-app prueft
        // weiter genau das. Abgeschaltet wird nur hier, in der Huelle (dazu zoomAbschalten()).
        scrollView.pinchGestureRecognizer?.isEnabled = false
        scrollView.minimumZoomScale = 1
        scrollView.maximumZoomScale = 1
        scrollView.setZoomScale(1, animated: false)
    }

    private func faerbeLadeluecke() {
        view.backgroundColor = papierfarbe
        webView?.backgroundColor = papierfarbe
        webView?.scrollView.backgroundColor = papierfarbe
    }

    /// Runde 126: WKWebView liest die Zoomgrenzen bei jedem Laden aus der Viewport-Angabe der Seite
    /// und setzt die Werte aus `stelleBildlaufEin()` damit wieder zurueck. Deshalb wird die Angabe in
    /// der App — und nur hier — um `maximum-scale=1, user-scalable=no` ergaenzt. WKWebView haelt sich
    /// daran, solange `ignoresViewportScaleLimits` aus ist (Standard).
    private func zoomAbschalten() {
        guard let inhalt = webView?.configuration.userContentController else { return }
        let quelle = """
        (function(){
          var m = document.querySelector('meta[name="viewport"]');
          if (m && !/user-scalable/.test(m.content)) m.content += ', maximum-scale=1, user-scalable=no';
        })();
        """
        inhalt.addUserScript(WKUserScript(source: quelle, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        webView?.configuration.ignoresViewportScaleLimits = false
    }

    // MARK: - Das in der App gewaehlte Farbschema (Runde 122)
    //
    // Am Simulator gemessen: Steht die App auf "Dunkel" und das System auf "Hell", zeigten
    // Startbild und Ladeluecke ~2 s lang die HELLE Papierfarbe, danach sprang die Seite auf Dunkel.
    // Die Wahl liegt in localStorage, und das kann die Huelle vor dem Laden nicht lesen.
    //
    // Deshalb meldet die Seite jede Wahl (`saveThemeMode()` in 03-speicherung.js, auch beim Start)
    // ueber den Empfaenger `lucentaThema`. Die Huelle legt sie in UserDefaults ab und setzt
    // `overrideUserInterfaceStyle` am Fenster — `SceneDelegate` tut das beim naechsten Start, bevor
    // irgendetwas gezeichnet wird. Damit folgen Plugin-Splash (dieselbe Storyboard-Datei mit der
    // dynamischen Farbe "Papier"), `papierfarbe` und die WebView der Wahl in der App.
    //
    // Was das NICHT erreicht: das allererste Startbild, das iOS selbst zeigt, bevor die App laeuft.
    // Das richtet sich nach dem System, und daran kommt keine App vorbei.

    /// Schluessel in UserDefaults; Werte wie in der Seite: "dark", "light", "system".
    static let themaSchluessel = "lucenta_thema"

    /// Der gespeicherte Stil fuer das Fenster. Ohne Eintrag (erster Start) dunkel — Entscheidung des
    /// Inhabers; "System" muss ausdruecklich gewaehlt sein.
    static func gespeicherterStil() -> UIUserInterfaceStyle {
        switch UserDefaults.standard.string(forKey: themaSchluessel) {
        case "light": return .light
        case "system": return .unspecified
        default: return .dark
        }
    }

    private func themaEmpfangen() {
        guard let inhalt = webView?.configuration.userContentController else { return }
        inhalt.add(ThemaEmpfaenger(ansicht: self), name: "lucentaThema")
    }

    private func bestandSpiegeln() {
        guard let inhalt = webView?.configuration.userContentController else { return }
        if let skript = LucentaBestand.wiederherstellenSkript() { inhalt.addUserScript(skript) }
        inhalt.add(BestandEmpfaenger(), name: LucentaBestand.empfaengerName)
        inhalt.add(WidgetEmpfaenger(ansicht: webView), name: WidgetEmpfaenger.name)
    }

    fileprivate func themaUebernehmen(_ wert: String) {
        guard ["dark", "light", "system"].contains(wert) else { return }
        UserDefaults.standard.set(wert, forKey: Self.themaSchluessel)
        view.window?.overrideUserInterfaceStyle = Self.gespeicherterStil()
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
            \(Self.bedienungshilfenZeilen())
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
                       UIContentSizeCategory.didChangeNotification,
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
        webView.evaluateJavaScript("if (document.documentElement) { \(Self.bedienungshilfenZeilen()) }")
    }

    // MARK: - Dynamic Type (Feedback B8)

    /// WebKit kennt die iOS-Textgroesse nur ueber `-apple-system-body`, und das waere auch im
    /// Mac-WebKit der Pruefungen aktiv (dort 13 pt). Deshalb ein Faktor `--dt` an `:root`, mit dem
    /// das Stilblatt jede Schriftgroesse multipliziert; ausserhalb der App bleibt er 1.
    /// Gedeckelt bei 200 % (Entscheidung des Inhabers).
    static func textFaktor() -> Double {
        let faktor = Double(UIFontMetrics(forTextStyle: .body).scaledValue(for: 17)) / 17
        return min(max(faktor, 0.8), 2.0)
    }

    private static func bedienungshilfenZeilen() -> String {
        transparenzZeile(UIAccessibility.isReduceTransparencyEnabled) +
            String(format: "document.documentElement.style.setProperty('--dt','%.3f');", textFaktor())
    }
}

/// Nimmt die Meldung `lucentaThema` der Seite an. Eine eigene Klasse, weil der
/// `WKUserContentController` seinen Empfaenger fest haelt — haelte er die Ansicht selbst, gaebe
/// es einen Kreis, der nie freigegeben wird. Die Ansicht steht deshalb hier nur schwach.
private final class ThemaEmpfaenger: NSObject, WKScriptMessageHandler {
    private weak var ansicht: MainViewController?

    init(ansicht: MainViewController) {
        self.ansicht = ansicht
    }

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard let wert = message.body as? String else { return }
        ansicht?.themaUebernehmen(wert)
    }
}

import UIKit
import Capacitor

/// Baut das Fenster im Scene-Lifecycle auf.
///
/// Runde 102: Ab iOS 27 bricht UIKit eine App ab, die noch im alten App-Lifecycle startet
/// (`__UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`, EXC_BREAKPOINT). Die
/// Capacitor-Vorlage tut genau das — sie startet ueber `UIMainStoryboardFile` und hat weder
/// Scene-Manifest noch SceneDelegate. Das Manifest allein genuegt aber nicht: Ohne jemanden, der
/// das Fenster erzeugt, bleibt der Bildschirm schwarz (genau so beobachtet).
///
/// Dieser Delegate ist deshalb absichtlich minimal und tut nur das, was das Storyboard vorher
/// implizit tat: Fenster zur Szene anlegen, den Anfangs-Controller aus `Main.storyboard`
/// (unseren `MainViewController`, die Capacitor-Bruecke) einsetzen, sichtbar machen.
///
/// Bewusst NICHT hier: Capacitors `ApplicationDelegateProxy` fuer URL-Aufrufe und
/// Universal Links. Der bleibt im `AppDelegate` — in Capacitor 6 haengen diese Aufrufe dort, und
/// sie doppelt zu bedienen wuerde sie zweimal ausloesen. Kommt Deep-Linking dazu, gehoert es
/// zusaetzlich in `scene(_:openURLContexts:)` und `scene(_:continue:)`.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene,
               willConnectTo session: UISceneSession,
               options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = UIStoryboard(name: "Main", bundle: nil)
            .instantiateInitialViewController()
        self.window = window
        window.makeKeyAndVisible()
    }
}

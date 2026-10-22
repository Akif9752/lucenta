# Einladungsseite (Feedback B7)

Statische Dateien für die Domain der Einladungslinks (`https://<domain>/f#L1…`). Kein Server-Code,
keine Statistik: Der Freundescode steht hinter `#` und wird von keinem Browser an den Server geschickt.

So wird es scharf — **nur der Inhaber**:

1. Eine Domain und statisches Hosting mit HTTPS (z. B. GitHub Pages). Diesen Ordner dort als Wurzel
   veröffentlichen. `/.well-known/apple-app-site-association` muss **ohne Weiterleitung** und mit
   `Content-Type: application/json` ausgeliefert werden (bei GitHub Pages: eine leere Datei
   `.nojekyll` daneben, sonst fehlt `.well-known`).
2. Im bezahlten Developer-Account bei `app.lucenta.ios` die Fähigkeit **Associated Domains** einschalten.
3. Dann (in der Xcode-Sitzung): in `ios/App/App/App.entitlements`
   `com.apple.developer.associated-domains` = `applinks:<domain>` eintragen und in
   `src/js/06b-freunde.js` `EINLADUNG_DOMAIN = '<domain>'` setzen. Erst ab da enthält die Einladung den
   Link; vorher nur den Code zum Einfügen.
4. Sobald die App im Store ist: in `f/index.html` den App-Store-Link ergänzen.

Team-ID in der Datei: `AXNBT762GY` (aus `project.pbxproj`).

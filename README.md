# PPM – Pforzheimer Präzisions Mechanik · Website

Statische Website (HTML/CSS/JS) mit interaktiver 3D-Drucker-Demo. Keine Build-Schritte, keine Cookies, keine externen Requests – läuft direkt auf **GitHub Pages**.

## Auf GitHub Pages veröffentlichen
1. Neues Repository anlegen (z. B. `ppm-website`) und den **gesamten Inhalt dieses Ordners** hochladen (`index.html` muss im Hauptverzeichnis liegen; die versteckte Datei `.nojekyll` bitte mit hochladen).
2. Im Repository: **Settings → Pages → Build and deployment → Source: „Deploy from a branch“**, Branch `main`, Ordner `/ (root)` → **Save**.
3. Nach ca. 1–2 Minuten ist die Seite erreichbar unter `https://<benutzername>.github.io/<repository>/`.
4. Eigene Domain (optional): unter **Settings → Pages → Custom domain** `www.ppm-pforzheim.com` eintragen und beim DNS-Anbieter einen CNAME auf `<benutzername>.github.io` setzen. Danach „Enforce HTTPS“ aktivieren.

Alle internen Links sind relativ – die Seite funktioniert unter `…github.io/<repository>/`, unter `…github.io/` und unter einer eigenen Domain ohne Änderung.

## Wichtig: Canonical-URLs / SEO
Canonical-Links, Open-Graph-URLs, `sitemap.xml` und `robots.txt` zeigen auf **https://www.ppm-pforzheim.com**. Das ist für den späteren Livegang unter dieser Domain gedacht. Soll stattdessen die GitHub-Adresse die endgültige Adresse sein, in allen Dateien `https://www.ppm-pforzheim.com` durch die eigene URL ersetzen (Suchen & Ersetzen im ganzen Repository).

## Noch zu erledigen
- Impressum und Datenschutz rechtlich prüfen (Verantwortliche Stelle, Hoster = GitHub ergänzen).
- Bedingungen-PDFs: Dateien in `static/downloads/` ablegen und in `rechtliches/verkaufs-lieferbedingungen/index.html` bzw. `…/einkaufsbedingungen/index.html` den auskommentierten PDF-Button aktivieren.
- Jobliste prüfen (Stand 22.10.2026), Team-Fotos ergänzen.
- Kontaktformular öffnet das Mailprogramm (mailto) – ein Server ist nicht nötig.
- Bildrechte der Fotos prüfen.

## Struktur
```
index.html                      Startseite (inkl. 3D-Drucker)
leistungen/prototypen|werkzeugbau|fertigung/
unternehmen/  jobs/  kontakt/  rechtliches/…
404.html  sitemap.xml  robots.txt  site.webmanifest  favicon.ico
css/style.css   js/printer-engine.js  js/logo-bitmap.js  js/site.js
assets/img/     Logo, Fotos (WebP 800/1600 px), Icons, Vorschaubild
extras/htaccess-fuer-apache-hosting.txt   nur für Apache-Hosting (nicht GitHub)
```
Farben aus dem Logo: Grau `#878787`, Blau `#1D70B8`, Dunkelblau `#00548C` (Variablen am Anfang von `css/style.css`).

## Lokal testen
Im Ordner `python -m http.server 8000` starten und http://localhost:8000 öffnen.

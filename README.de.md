![Speicher je Dienst](banner.svg)

# Speicher je Dienst

Wie viel Platz jeder Dienst belegt – Daten, Sicherungen, Projekte – und wie voll das Laufwerk ist. Mit Kachel für die Übersicht.

Eine offizielle [Hostwerk](https://github.com/Passimoritz/hostwerk-public)-Erweiterung – Seite in der Leiste (neben *System*) und Kachel für die Übersicht, im Design von Hostwerk, auf Deutsch und Englisch.

- Jeder Dienst mit Größe, Anteil am Platz aller Dienste und seinen Teilen (Server, Sicherungen, Daten …)
- Laufwerksbalken mit Warnstufen ab 80 % und 90 %
- **Verlauf und Prognose:** Die Belegung wird stündlich notiert (90 Tage, im Speicher der Erweiterung) – „+1,2 GB pro Tag · bei diesem Tempo voll in etwa 40 Tagen“
- **Platz schaffen:** Dienste, deren Sicherungen viel Platz brauchen, und bei vollem Laufwerk Hostwerks Zwischenspeicher – jeweils mit Knopf, der die richtige Stelle öffnet
- Der Ordner-Knopf öffnet die Dateien des Dienstes (Minecraft: Reiter *Dateien*)
- Vorbereitet für Spiele-Server und Docker-Volumes, sobald Hostwerk sie mitzählt
- Balken für Bildschirmleser lesbar (`role="meter"`), Uhrzeit und Zahlen in der Sprache von Hostwerk
- Ladefehler zeigen eine Meldung mit *Erneut versuchen*; bei verstecktem Reiter wird nicht nachgezählt

## Rechte

| Recht | Wofür |
|---|---|
| `read:system` | Speicher je Dienst und Laufwerk (nur lesen) |
| `storage` | Merkt sich den Verlauf für die Prognose |

Sie ändert selbst nichts – die Knöpfe öffnen nur Bereiche von Hostwerk.

Andere Erweiterungen dürfen Reiter auf ihrer Seite ergänzen (`allowExtensions`).

## Entwickeln

Logik in `page/lib.js` (ohne DOM), Tests: `node --test tests/*.test.js`. Prüfen: `node check.js . --strict` (Hostwerk-SDK).

Lizenz: MIT

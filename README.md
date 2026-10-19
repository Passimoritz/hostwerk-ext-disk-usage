# Storage per service

How much space each service takes – data, backups, projects – and how full the drive is. With a dashboard tile.

An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension (SDK 2.4) – page in the sidebar and a dashboard tile, in Hostwerk's own design, German and English.

## Permissions

| Permission | Why |
|---|---|
| `read:system` | Storage per service and drive (read only) |

Read only – it changes nothing.

## Develop

Logic in `page/lib.js` (no DOM), tests: `node --test tests/*.test.js`. Check: `node check.js . --strict` (Hostwerk SDK).

License: MIT

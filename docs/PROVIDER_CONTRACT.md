# LUMEN Provider Contract (v1)

LUMEN never scrapes unlicensed CDNs. Sources are **adapters** behind a registry.

## Interface (JavaScript)

```js
{
  id: 'custom',           // unique string
  title: 'Custom',        // UI label
  enabled: function () { return true; },
  search: function (card, network, done) {
    // card  — Lampa/TMDB movie object (id, title, name, overview, ...)
    // network — Lampa.Reguest instance (use network.silent / clear)
    // done(err, items)
  }
}
```

### Normalized `items[]` entry

| Field | Type | Required | Meaning |
|---|---|---|---|
| `title` | string | yes | Row title |
| `url` | string | for playable | Direct stream URL (H.264/H.265 preferred on Vontar R3; no AV1) |
| `subtitle` | string | no | Second line |
| `voice` | string | no | Voiceover / audio label |
| `quality` | string | no | Badge, e.g. `1080p` |
| `qualityMap` | object | no | `{ "720p": "https://...", "1080p": "https://..." }` → Lampa quality picker |
| `playlist` | array | no | `[{ title, url, season?, episode? }]` for series |
| `kind` | string | no | `movie` \| `season` \| `episode` \| `series` |
| `season` / `episode` | number | no | Metadata |
| `provider` | string | auto | Filled by registry |

Register later without touching core:

```js
LUMEN.Providers.register(myAdapter);
```

## Custom HTTP adapter (shipped in v1)

Settings → **LUMEN** → **Custom provider URL**.

Request:

```
GET {url}?tmdb={id}&imdb={imdb}&type=movie|tv&title=...&original_title=...&year=...
```

Response JSON:

```json
{
  "items": [
    {
      "title": "Big Buck Bunny",
      "voice": "Original",
      "quality": "720p",
      "url": "https://…/BigBuckBunny.mp4"
    }
  ]
}
```

Also accepted: top-level array, or `{ "results": [ ... ] }`.

See `examples/sample-provider.json` for a full legal sample (Blender open movies).

## Not in v1 runtime

- Jellyfin / Emby / Plex adapters — example sketch in `src/providers/examples/` for a future PR.
- Legacy Render scraper — `legacy/engine.scraper-v0.js`, **not** loaded.
- Pirate balancer / tracker URLs — will not be bundled.

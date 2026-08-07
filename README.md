# David Demos

Recovered static landing-page workspace for David's demos.

## Run locally

There are no dependencies to install. Start the local server with:

```bash
npm run dev
```

Then open:

- Main recovered site: `http://localhost:4173/`
- AI Compass experiment: `http://localhost:4173/ai-compass.html`

Stop the server with `Ctrl+C`.

## Verify

```bash
npm run check
```

The check validates both HTML entry points, compiles their inline JavaScript, and confirms that local asset references exist.

## Current structure

- `index.html`: canonical “Making AI less scary” landing page recovered from the previous computer
- `ai-compass.html`: standalone AI Compass experiment
- `Previous Computer/`: untouched source archive from the previous machine
- `scripts/check-site.mjs`: zero-dependency static verification

The main page embeds its portrait directly in the HTML. Three.js and Space Grotesk are loaded from public CDNs at runtime, so the animated presentation requires an internet connection.

# David Demos

An 8-bit personal landing page for David's AI demos, articles, and tools.

## Run locally

There are no dependencies to install. Start the local server with:

```bash
npm run dev
```

Then open:

- Main site: `http://localhost:4173/`
- Archived AI Compass experiment: `http://localhost:4173/ai-compass.html`

Stop the server with `Ctrl+C`.

## Verify

```bash
npm run check
```

The check validates both HTML entry points, compiles their inline JavaScript, and confirms that local asset references exist.

## Current structure

- `index.html`: scroll-driven 8-bit landing page with a canvas particle intro, David introduction, and resource placeholders
- `assets/david-pixel.png`: transparent generated pixel-art portrait used by the landing page
- `assets/david-pixel-source.png`: chroma-key generation source retained for future edits
- `ai-compass.html`: standalone archived AI Compass experiment, currently unlinked from the main experience
- `Previous Computer/`: untouched source archive from the previous machine
- `scripts/check-site.mjs`: zero-dependency static verification

The main page has no JavaScript runtime dependencies. Its Press Start 2P and VT323 typefaces load from Google Fonts; local fallback fonts keep the page usable if they are unavailable.

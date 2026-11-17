# David × Novo Nordisk — an application

A one-minute interactive film that serves as David Quijano's application for
**AI Upskilling & Adoption Lead** at Novo Nordisk. Dependency-free static site:
HTML, CSS, vanilla JS, a WebGL orb, and narration generated with OpenAI text-to-speech.

Not affiliated with or endorsed by Novo Nordisk. The story and the example sessions are illustrative.

## Run

```sh
npm run dev      # from the David-Demos root, then open http://127.0.0.1:4173/applications/novo/
npm run check    # the root check also runs this folder's static check
```

`?scene=6` opens directly on a chapter (1–9). Arrow keys move between chapters, `M` mutes.

## Voice

The narrator's lines live in `narration.js`. To generate the audio:

```sh
cp applications/novo/.env.example applications/novo/.env    # add OPENAI_API_KEY
npm run voice:novo      # from the root; writes audio/*.mp3 and audio/manifest.json
```

Only new or edited lines are regenerated (`npm run voice:novo -- --force` redoes all).
Change the voice, model or delivery in `narration.js` (`VOICE`) or via `.env`.
The key is used at build time only and never reaches the browser. Without audio
files the film still runs on timed captions and the orb moves to a simulated voice.

## Chapters

| # | Scene | File pointers |
|---|-------|---------------|
| – | Painting, two lights meet, portal | `index.html` `.intro`, `open()` in `app.js` |
| 1 | Mark and password gate | `scenes[0]` |
| 2 | Orb greeting | `scenes[1]`, `orb.js` |
| 3 | Story card, then "in your shoes" | `scenes[2]` |
| 4 | Week-six widget with flip counters | `scenes[3]` |
| 5 | Kinetic type: "…is not a habit" | `scenes[4]` |
| 6 | Session desk: request → session → reply | `scenes[5]` |
| 7 | One deck doesn't fit… | `scenes[6]` |
| 8 | Reusable assets counter | `scenes[7]` |
| 9 | The ask and end card | `scenes[8]` |

The film is laid out on a fixed 1280×720 canvas (760×1240 in portrait) and scaled to the viewport.

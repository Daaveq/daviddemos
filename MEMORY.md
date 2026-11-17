# Project Memory

This file is the durable working memory for the David Demos landing-page project. Keep it concise and current so a future work session can recover context quickly.

## Project Snapshot

- Project name: David Demos.
- Purpose: a polished landing page and portfolio hub for all demos built in this workspace.
- Current state: the root landing page offers a persistent two-mode presentation and links to a responsive demos directory containing seven prototype cards; both Minimal and 8-bit presentations share the visitor's saved preference.
- Repository path: `/home/david/David-Demos`.
- Stack: dependency-free static HTML, CSS, and JavaScript; local serving uses Python's built-in HTTP server through npm scripts.
- GitHub repository: `https://github.com/Daaveq/daviddemos`, configured locally as `origin`; SSH origin is configured; use scoped non-main task branches for commits and pushes.
- Public site: `https://daviddemos.com`, including the live `/demos.html` directory, routed through the authenticated Cloudflare named tunnel `david-demos` to the isolated `.production/` web root. The origin and tunnel run as enabled, restartable systemd user services; user lingering is enabled so they survive logout and start after host reboots.
- Temporary preview: `https://plumbing-sofa-april-latinas.trycloudflare.com`; this account-less quick tunnel serves the same isolated build and has no uptime guarantee.

## Product Direction

- The landing page should present all demos in one coherent portfolio experience.
- `demos.html` is the central demos directory. Stay a little, IF Claims Copilot, Writer MVP, Stellar AI Glossary, AI Agent Campus, and Capacity have verified live links; Dora the GEO Explorer remains visible with a graceful domain-pending state until a stable public front-end hostname exists.
- Each demo should retain a clear identity, purpose, and direct path to exploration.
- Demo claims and availability must be grounded in the corresponding source project.
- `index.html` defaults to the minimalist presentation and provides a fixed Minimal/8-bit switch that persists the visitor’s choice in local storage. Minimal mode reinterprets the same scroll story with Manrope typography, cool-gray neumorphic surfaces, rounded controls, soft circular particles, and restrained blue, coral, and green accents. The page opens with one large “AI” above “can feel overwhelming sometimes” inside a particle field. The about section now overlaps 66vh into the intro on desktop and 48vh on narrower screens so “Hi, my name is David” arrives well before the intro finishes; “Scroll to simplify” has no competing blink animation and fades out before that arrival so it cannot ghost behind the about copy. A fixed grid drifts at 12% of foreground scroll speed, followed by Demos, Articles, and Tools placeholder cards.
- Minimal mode uses the supplied 5472×3648 `assets/David-bg.png` photo clipped inside a vertically centered recessed portrait panel. The 8-bit mode uses `assets/david-pixel-friendly.png`, the transparent 320×320 low-resolution sprite portrait with brighter natural eyes and a warmer expression; it is scaled from its bottom-center render origin inside a clipped 10px inset so it fills the cyan frame without escaping it. `assets/david-pixel-friendly-source.png` retains its generated chroma-key source; earlier portrait treatments remain available for comparison.
- The page uses a custom CSS pixel cursor on precise pointers, normal touch behavior on coarse pointers, canvas particles, scroll-driven transforms, and reduced-motion support.
- `ai-compass.html` remains available at `/ai-compass.html` but is intentionally unlinked and out of scope for now.
- `Previous Computer/` is the untouched recovery source archive and should remain available until the promoted site has been fully reviewed.

## Operating Rules

- Start every session by reading `AGENTS.md`, this file, and the latest relevant dated chat log.
- Work on focused branches, not directly on `main`.
- Preserve user changes and verify behavior before calling implementation complete.
- Update this file when durable project facts or decisions change.
- Update `chatlog/YYYY-MM-DD.md` with concise session outcomes.
- Do not store secrets, credentials, tokens, or personal data in memory files.

## GitHub Workflow

- Use task branches and focused commits; never implement directly on `main`.
- At the end of every run containing scoped project changes, automatically update memory/chatlog, stage only that run's files, commit them on the active non-`main` task branch, and push the branch when a remote is configured.
- Pull-request creation, force pushes, tags, branch deletion, and any push or merge to `main` require explicit user authorization.
- Prefer draft pull requests for reviewable work when a pull request is authorized.

## Confirmed Decisions

- Use the IF Insurance Flow repository's workflow and memory approach as the process reference.
- Build this repository as the landing page for all demos.
- Adapt the process conventions without carrying over insurance-specific product, safety, runtime, or architecture rules.
- Use `https://github.com/Daaveq/daviddemos` as the canonical GitHub repository.
- Keep multiple visual presentations on one shared semantic page. The light minimalist/neumorphic presentation is the default, and the persistent fixed switch places the alternative 8-bit mode on the right.
- Keep the main narrative practical and anti-buzzword: show what David built, what worked, and explain it simply.
- Keep AI Compass unlinked and out of the primary experience for now.

## Open Questions

- The intended audience and primary call to action.
- Hosting target, analytics, and contact method.
- Which concrete articles and tools should replace the remaining landing-page placeholders.
- Which stable public front-end domains should be assigned to Writer MVP and Dora the GEO Explorer.
- Whether to retire the temporary account-less preview now that the custom domain uses a durable named tunnel.

## Next Steps

- Connect stable public front-end domains for Writer MVP and Dora, then turn their pending directory cards into links.
- Review both the 8-bit and minimalist modes in a browser at desktop and mobile widths, then refine their pacing, palette, and portrait treatments.
- Agree on the first-release information architecture and replace placeholder resources.
- Decide whether to retain the single-file static architecture or migrate after the baseline is reviewed.
- Use `npm run publish:production` after approved site changes, then restart `david-demos-origin.service` if needed and verify the public content.

## Stay a little listing

- User authorized publication of Stay a little in the demos directory. `demos.html` links to https://stayalittle.daviddemos.com, describes shared apartments with calendar availability and both-host approval, and states friends code required. Never publish the access code.
- Published through npm run publish:production; public desktop/mobile browser checks passed for both themes and the live destination. Existing production services and unrelated recovery archive were preserved.
- Current branch: main, created from the approved feat/stay-subdomain release on 2026-09-13. Booking hostname is stable, backed by a separate dedicated named tunnel and persistent booking origin; existing portfolio services are unchanged.

## AI Agent Campus listing

- `demos.html` links to `https://campus.daviddemos.com` as AI Agent Campus, an interactive Swedish-language 3D concept showing personal AI agents collaborating across campus roles while people approve the next step.
- The demo is presented as a Stellar Capacity × Karolinska Institutet concept and clearly labels its fictional people, agents, and conversations on the destination page.
- Published through `npm run publish:production`; the public directory and destination both returned HTTP 200, and the live directory contained the new card, link, count, and availability copy.

## Writer MVP listing

- `demos.html` links to `https://writer.daviddemos.com` (card 03) and states an access code is required. Never publish the access code. The Writer MVP repo owns the gate, tunnel `writer-mvp`, and hosting notes.
- Published through `npm run publish:production` on 2026-09-27; the live directory contains the new link.

## Capacity listing

- User authorized adding Capacity (their time tracker, source `/home/david/Time - Resource Management`, private repo Daaveq/time-tracker) on 2026-10-17. `demos.html` card 07 links to `https://capacity.daviddemos.com` and states a password is required. Never publish the password or the MCP token. The Capacity repo owns the app, tunnel `capacity`, and hosting notes.
- Published through `npm run publish:production` on 2026-10-17 from `feat/capacity-link`; the live directory contains the card, the 07/07 numbering and the six-live count.
- On 2026-11-17 David asked for the work to go on `main`; `main` was fast-forwarded to `feat/novo-application`, which also brought in the already-published Campus, Writer MVP and Capacity commits. `main` and production now match. Future merges to `main` still need an explicit request.
- Known issue (pre-existing, all cards): in 8-bit mode `.card-status` uses `background: currentColor` with `color: var(--ink)`, so the Live badge text is invisible.

## Applications

- Job applications live in this repo under `applications/<company>/`, by David's decision on 2026-11-17: he wants the context kept in David Demos rather than in separate repos. They are not portfolio demos: keep them out of `demos.html`, keep `noindex`, and publish only on David's explicit go-ahead.
- `applications/novo/` is David's interactive application for AI Upskilling & Adoption Lead at Novo Nordisk (deadline 23 November 2026), modelled on a reference video of a film-style job application: painted opening, narrator orb, story, kinetic type, product-style mock, end card. Local URL: `http://127.0.0.1:4173/applications/novo/` via `npm run dev`; `?scene=N` jumps to a chapter.
- Published on 2026-11-17 at David's request: live at `https://daviddemos.com/applications/novo/` (unlisted, `noindex`), via `npm run publish:novo`, which copies it to `.production/applications/novo/`. Rerun that command after any change.
- Narration is generated at build time by `npm run voice:novo` and needs `OPENAI_API_KEY` in the git-ignored `applications/novo/.env`. The nine clips in `applications/novo/audio/` were generated on 2026-11-17 with `gpt-4o-mini-tts`, voice `ash`, and are committed; rerun the command after editing `narration.js`. With voice the film runs roughly two minutes.
- Content rules: no Novo Nordisk logo or brand assets, tool tiles are letter glyphs rather than vendor logos, the story and session examples are labelled illustrative, and nothing claims experience David has not confirmed.
- The film has narration in every chapter (16 clips), a score synthesised live in `music.js` (no licensed track; `"music": "file.mp3"` in `audio/manifest.json` swaps in a real one), and a global `TEMPO` constant in `app.js` that scales scripted pauses and animations. Running time is about 100 seconds and is bounded by the narration, not the animation.
- Cloudflare caches `.js`, `.css` and `.mp3` on daviddemos.com for four hours. `publish-novo.sh` therefore stamps `?v=<time>` onto script, style and module references, and audio is fetched with its manifest hash. Any new static sub-site needs the same treatment or updates will look stale.
- The earlier standalone private repo `Daaveq/novo-application` (and `/home/david/novo-application`) holds the same first commit and is now superseded; deleting or archiving it needs David's say-so.
- Headless Chromium on this host lacks system libraries (libatk and others); browser checks need them supplied through `LD_LIBRARY_PATH` or installed.

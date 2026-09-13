# Project Memory

This file is the durable working memory for the David Demos landing-page project. Keep it concise and current so a future work session can recover context quickly.

## Project Snapshot

- Project name: David Demos.
- Purpose: a polished landing page and portfolio hub for all demos built in this workspace.
- Current state: the root landing page offers a persistent two-mode presentation and links to a responsive demos directory containing five prototype cards; both Minimal and 8-bit presentations share the visitor's saved preference.
- Repository path: `/home/david/David-Demos`.
- Stack: dependency-free static HTML, CSS, and JavaScript; local serving uses Python's built-in HTTP server through npm scripts.
- GitHub repository: `https://github.com/Daaveq/daviddemos`, configured locally as `origin`; SSH origin is configured; use scoped non-main task branches for commits and pushes.
- Public site: `https://daviddemos.com`, including the live `/demos.html` directory, routed through the authenticated Cloudflare named tunnel `david-demos` to the isolated `.production/` web root. The origin and tunnel run as enabled, restartable systemd user services; user lingering is enabled so they survive logout and start after host reboots.
- Temporary preview: `https://plumbing-sofa-april-latinas.trycloudflare.com`; this account-less quick tunnel serves the same isolated build and has no uptime guarantee.

## Product Direction

- The landing page should present all demos in one coherent portfolio experience.
- `demos.html` is the central demos directory. Stay a little, IF Claims Copilot, and Stellar AI Glossary have verified live links; Writer MVP and Dora the GEO Explorer remain visible with a graceful domain-pending state until stable public front-end hostnames exist.
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

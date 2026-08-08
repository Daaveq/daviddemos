# Project Memory

This file is the durable working memory for the David Demos landing-page project. Keep it concise and current so a future work session can recover context quickly.

## Project Snapshot

- Project name: David Demos.
- Purpose: a polished landing page and portfolio hub for all demos built in this workspace.
- Current state: the root landing page offers a persistent two-mode presentation: a light minimalist/neumorphic default and the existing responsive 8-bit scroll story with shared content and interactions; both are ready for visual review.
- Repository path: `/home/david/David-Demos`.
- Stack: dependency-free static HTML, CSS, and JavaScript; local serving uses Python's built-in HTTP server through npm scripts.
- GitHub repository: `https://github.com/Daaveq/daviddemos`, configured locally as `origin`; the remote is currently empty, so publishing a non-`main` task branch requires an explicitly approved one-time repository bootstrap or authenticated Git credentials.
- Temporary public preview: `https://plumbing-sofa-april-latinas.trycloudflare.com`; this account-less quick tunnel is updated from an isolated temporary web root with the latest scroll-story and low-resolution portrait refinements. It has no uptime guarantee and lasts only while the local server and tunnel remain running.

## Product Direction

- The landing page should present all demos in one coherent portfolio experience.
- Each demo should retain a clear identity, purpose, and direct path to exploration.
- Demo claims and availability must be grounded in the corresponding source project.
- `index.html` defaults to the minimalist presentation and provides a fixed Minimal/8-bit switch that persists the visitor’s choice in local storage. Minimal mode reinterprets the same scroll story with Manrope typography, cool-gray neumorphic surfaces, rounded controls, soft circular particles, and restrained blue, coral, and green accents. The page opens with one large “AI” above “can feel overwhelming sometimes” inside a particle field. The about section now overlaps 66vh into the intro on desktop and 48vh on narrower screens so “Hi, my name is David” arrives well before the intro finishes; “Scroll to simplify” remains visible above that arrival and fades during the handoff. A fixed grid drifts at 12% of foreground scroll speed, followed by Demos, Articles, and Tools placeholder cards.
- Minimal mode uses the supplied 5472×3648 `assets/David-bg.png` photo clipped inside a vertically centered recessed portrait panel. The 8-bit mode uses `assets/david-pixel-friendly.png`, the transparent 320×320 low-resolution sprite portrait with brighter natural eyes and a warmer expression. `assets/david-pixel-friendly-source.png` retains its generated chroma-key source; earlier portrait treatments remain available for comparison.
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

- Which demos belong in the first release and where their source projects live.
- The intended audience and primary call to action.
- Hosting target, analytics, and contact method.
- Which concrete demos, articles, and tools should replace the current placeholders.
- Whether to replace the temporary account-less preview with a durable named tunnel and custom domain.

## Next Steps

- Inventory the available demo projects and extract accurate titles, descriptions, imagery, and live links.
- Review both the 8-bit and minimalist modes in a browser at desktop and mobile widths, then refine their pacing, palette, and portrait treatments.
- Agree on the first-release information architecture and replace placeholder resources.
- Decide whether to retain the single-file static architecture or migrate after the baseline is reviewed.

# Project Memory

This file is the durable working memory for the David Demos landing-page project. Keep it concise and current so a future work session can recover context quickly.

## Project Snapshot

- Project name: David Demos.
- Purpose: a polished landing page and portfolio hub for all demos built in this workspace.
- Current state: the root landing page is a responsive, scroll-driven pixel-art experience with an early intro/about crossfade, a refined portrait, and a subtle slow-moving background grid; it is ready for visual review.
- Repository path: `/home/david/David-Demos`.
- Stack: dependency-free static HTML, CSS, and JavaScript; local serving uses Python's built-in HTTP server through npm scripts.
- GitHub repository: `https://github.com/Daaveq/daviddemos`, configured locally as `origin`; the remote is currently empty, so publishing a non-`main` task branch requires an explicitly approved one-time repository bootstrap or authenticated Git credentials.
- Temporary public preview: `https://amongst-laptop-foto-tend.trycloudflare.com`; this account-less quick tunnel serves the previously published 8-bit build from an isolated temporary web root, does not yet include the `feat/refine-scroll-story` refinements, has no uptime guarantee, and lasts only while the local server and tunnel remain running.

## Product Direction

- The landing page should present all demos in one coherent portfolio experience.
- Each demo should retain a clear identity, purpose, and direct path to exploration.
- Demo claims and availability must be grounded in the corresponding source project.
- `index.html` opens with one large “AI” above “can feel overwhelming sometimes” inside a pixel particle field. The about section overlaps the final intro scroll so “Hi, my name is David” arrives while the intro is still fading; a fixed grid drifts at 12% of foreground scroll speed, followed by Demos, Articles, and Tools placeholder cards.
- `assets/david-pixel-refined.png` is the transparent, higher-resolution pixel-art portrait used in the about section. `assets/david-pixel-refined-source.png` retains its generated chroma-key source; the original `assets/david-pixel.png` and source remain available for comparison.
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
- Use an 8-bit visual system across the landing page, including typography, cursor, particles, cards, and David's portrait.
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
- Review the 8-bit page locally and refine pacing, copy, palette, and portrait treatment.
- Agree on the first-release information architecture and replace placeholder resources.
- Decide whether to retain the single-file static architecture or migrate after the baseline is reviewed.

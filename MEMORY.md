# Project Memory

This file is the durable working memory for the David Demos landing-page project. Keep it concise and current so a future work session can recover context quickly.

## Project Snapshot

- Project name: David Demos.
- Purpose: a polished landing page and portfolio hub for all demos built in this workspace.
- Current state: the previous-computer landing page has been recovered as the root application and is ready for local iteration.
- Repository path: `/home/david/David-Demos`.
- Stack: dependency-free static HTML, CSS, and JavaScript; local serving uses Python's built-in HTTP server through npm scripts.
- GitHub repository: `https://github.com/Daaveq/daviddemos`, configured locally as `origin`.
- Public site: not configured yet.

## Product Direction

- The landing page should present all demos in one coherent portfolio experience.
- Each demo should retain a clear identity, purpose, and direct path to exploration.
- Demo claims and availability must be grounded in the corresponding source project.
- `index.html` is the canonical recovered “Making AI less scary” page. It embeds its portrait and loads Three.js and Space Grotesk from public CDNs at runtime.
- `ai-compass.html` preserves the separate AI Compass experiment at `/ai-compass.html`.
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
- Preserve the recovered site's appearance and behavior as the initial baseline before making product or visual redesign decisions.

## Open Questions

- Which demos belong in the first release and where their source projects live.
- The intended audience and primary call to action.
- Visual direction, brand assets, copy, and preferred domain.
- Hosting target, analytics, and contact method.
- Whether the AI Compass experiment should become part of the primary landing-page navigation.
- Which recovered copy, name, portrait, and demo content should be replaced or adapted for David.

## Next Steps

- Inventory the available demo projects and extract accurate titles, descriptions, imagery, and live links.
- Agree on the first-release information architecture and visual direction.
- Review the recovered page locally and agree on the first content, identity, and navigation changes.
- Decide whether to retain the single-file static architecture or migrate after the baseline is reviewed.

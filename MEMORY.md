# Project Memory

This file is the durable working memory for the David Demos landing-page project. Keep it concise and current so a future work session can recover context quickly.

## Project Snapshot

- Project name: David Demos.
- Purpose: a polished landing page and portfolio hub for all demos built in this workspace.
- Current state: workflow and durable project context are being established before application implementation begins.
- Repository path: `/home/david/David-Demos`.
- Stack: not selected yet.
- GitHub repository: not configured yet.
- Public site: not configured yet.

## Product Direction

- The landing page should present all demos in one coherent portfolio experience.
- Each demo should retain a clear identity, purpose, and direct path to exploration.
- Demo claims and availability must be grounded in the corresponding source project.

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

## Open Questions

- Which demos belong in the first release and where their source projects live.
- The intended audience and primary call to action.
- Visual direction, brand assets, copy, and preferred domain.
- Application stack, hosting target, analytics, and contact method.

## Next Steps

- Inventory the available demo projects and extract accurate titles, descriptions, imagery, and live links.
- Agree on the first-release information architecture and visual direction.
- Select the stack, scaffold the application, and implement the first polished landing-page version.

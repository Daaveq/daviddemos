# Project Working Agreement

These instructions are the authoritative workflow for coding agents working in this repository.

## Session Start

Before changing files:

1. Read `AGENTS.md` and `MEMORY.md`.
2. Read the newest relevant file in `chatlog/`.
3. Check `git status`, the current branch, and recent commits.
4. Restate the current objective and identify any unresolved decisions.
5. Create or switch to a focused work branch before implementation. Do not work directly on `main`.

## During A Session

- Preserve existing user changes and keep work scoped to the current objective.
- Record durable facts, decisions, constraints, conventions, and architecture discoveries in `MEMORY.md` as they become clear.
- Keep implementation notes out of memory unless they will matter in a future session.
- Verify changes in proportion to risk. For behavior changes, test the actual user path or the closest executable equivalent.
- Treat every demo as a distinct product with its own purpose and identity while keeping the portfolio experience coherent.
- Never store secrets, credentials, tokens, personal data, or irrelevant conversation in tracked files.

## Session End

Before declaring a work session complete:

1. Review the diff and run the relevant checks.
2. Update `MEMORY.md` with durable knowledge and the current project state.
3. Add a concise entry to `chatlog/YYYY-MM-DD.md` covering decisions, changes, verification, and open follow-ups.
4. Stage only the files created or modified for the current objective, preserving unrelated user changes.
5. Commit the scoped changes on the current non-`main` task branch with a focused, imperative commit message. Do this automatically at the end of every run that changed tracked project state; do not create empty commits.
6. Push that task branch to GitHub automatically when a remote is configured so every completed run is recoverable remotely.
7. Report the current branch, commit, changed files, verification results, and remaining work.

## GitHub Workflow

- Use one focused branch per task. Suggested names: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, or `chore/<topic>`.
- Never commit or push directly to `main` except for an explicitly approved one-time repository bootstrap.
- Never merge into `main` unless the user explicitly requests that exact action.
- Keep commits focused and use an imperative summary that explains the outcome.
- The user grants standing authorization to stage the current run's scoped files, commit them on the active non-`main` task branch, and push that branch at the end of every run. Do not ask again for those three actions.
- This standing authorization does not cover unrelated worktree changes, empty commits, `main`, force pushes, tags, branch deletion, pull-request creation, or merging.
- Ask for explicit authorization before creating a pull request. Prefer a draft pull request unless the user requests ready-for-review.
- A local change is not considered published until its branch exists on GitHub.

## Memory Rules

- `MEMORY.md` is the concise, current source of truth. Revise stale facts instead of endlessly appending history.
- `chatlog/` is the chronological record. Append factual session summaries; do not paste full conversations.
- If the two disagree, investigate the latest code and decisions, then correct `MEMORY.md`.
- When resuming work, use memory as orientation but verify important assumptions against the repository.

## Project-Specific Rules

- This repository is the landing page and portfolio hub for David's demos.
- Keep demo descriptions accurate to their source projects; do not invent capabilities, metrics, customer claims, or production status.
- Prefer a polished, fast, accessible experience with responsive layouts and clear paths into each demo.
- Reuse shared visual and interaction patterns intentionally, without erasing the identity of individual demos.
- When linking to live demos, verify destinations and provide a graceful state for demos that are not yet public.
- Define framework-specific checks in this file once the application stack is selected.

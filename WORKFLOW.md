# Development Workflow

This project uses repository files as durable context so work can resume cleanly across separate sessions and coding agents.

## Start

1. Read `AGENTS.md` and `MEMORY.md` for the current project state.
2. Read the latest relevant note in `chatlog/` for recent context.
3. Check the branch, working tree, and recent commits.
4. Confirm the session objective and create a focused branch.

## Work

1. Inspect the existing implementation and relevant demo source projects before editing.
2. Make the smallest coherent change that achieves the objective.
3. Test the changed behavior, not only compilation or linting.
4. Update durable memory when a fact or decision will matter later.

## Finish

1. Review the final diff and test results.
2. Update `MEMORY.md` and today's `chatlog/YYYY-MM-DD.md`.
3. State any risks or follow-up work.
4. Stage and commit only the current session's scoped files on a non-`main` task branch.
5. Automatically push unpublished commits when a remote is configured.
6. Open a draft pull request only with explicit approval.

## What Gets Remembered

Add to `MEMORY.md`:

- Product goals and current priorities
- Architecture and important file locations
- Demo inventory and verified destinations
- Technical and workflow decisions with their rationale
- Testing and deployment expectations
- Known issues and next steps

Add to `chatlog/YYYY-MM-DD.md`:

- What the user asked for
- Decisions made during the session
- Files or behavior changed
- Verification performed and its outcome
- Unresolved questions and recommended next action

Do not record secrets, raw credentials, access tokens, personal data, or full conversation transcripts.

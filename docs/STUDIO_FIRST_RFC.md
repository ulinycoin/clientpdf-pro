# Studio-First RFC (LocalPDF V6)

Date: 2026-02-16
Status: Draft for implementation kickoff
Owner: Frontend Platform

## Goal
Move LocalPDF V6 from tool-centric navigation to a single `Studio` workspace model.

Target interaction model:
- User stays inside `Studio`.
- User works with `Workspaces` and `Pages`.
- All navigation is in the top bar.
- Tool actions are launched inline (panel/modal), not via separate tool screens.

## Scope
In scope:
- App shell migration from left sidebar to top navigation.
- Studio-centric routing and deep links.
- Workspace/page state model in the store.
- Inline tool launch flow and result application to current workspace.
- Progressive removal of standalone tool entrypoints from primary UX.

Out of scope (phase 1):
- Rewriting worker contracts.
- Rewriting existing tool logic pipelines.
- Billing/entitlements redesign.

## Non-Goals
- No full rewrite of V6 architecture.
- No breaking change in core processing contracts.

## Architecture Direction
1. Keep existing runner/worker contracts unchanged.
2. Introduce `Studio-first shell` as primary app shell.
3. Expand store from `documents` to explicit `workspaces` model (with migration layer).
4. Route tool actions through studio context instead of route transitions.

## UX Contract
- Primary screen: `/studio`.
- Top bar sections:
  - Workspace switcher and workspace actions.
  - Page-level actions.
  - Tool action launcher.
  - Export and settings.
- Legacy tool routes remain temporarily for rollback and QA.

## Rollout Strategy
- Rollout phases:
  1. Shell + top navigation scaffold.
  2. Store/workspace model migration.
  3. Inline tools for priority flows.
  4. Full migration and deprecation of legacy menu.

## Risks and Mitigation
- Risk: regressions in existing tool flows.
  - Mitigation: keep legacy routes available during migration period.
- Risk: store migration data loss.
  - Mitigation: versioned state schema + migration tests.
- Risk: e2e fragility due to navigation changes.
  - Mitigation: update e2e anchors in same PRs as UI changes.

## Definition of Ready (per phase)
- UI spec and acceptance criteria written.
- Test plan defined (unit/integration/e2e).
- Rollback path available.

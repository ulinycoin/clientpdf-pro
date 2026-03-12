# Studio-First Backlog

Date: 2026-02-16

## Epic 1: App Shell Migration
- Task 1.1: Add `Studio-first` shell behind feature flag.
  - DoD: app starts in both modes; no regression in legacy mode.
- Task 1.2: Implement top navigation container.
  - DoD: top nav visible on desktop/mobile; keyboard accessible controls.
- Task 1.3: Remove dependency on left tool sidebar in studio-first mode.
  - DoD: no sidebar rendered with flag ON.

## Epic 2: Routing and Navigation
- Task 2.1: Make `/studio` primary route in studio-first mode.
  - DoD: unknown routes redirect to `/studio` in studio-first mode.
- Task 2.2: Add deep-link state (`workspace`, `page`, optional `action`).
  - DoD: opening URL restores context.
- Task 2.3: Keep legacy routes only as fallback.
  - DoD: QA can open old flows when needed.

## Epic 3: Workspace State Model
- Task 3.1: Introduce `workspaces[]` with active workspace/page IDs.
  - DoD: typed model merged; no runtime type regressions.
- Task 3.2: Add migration from old `documents` state.
  - DoD: old sessions load into new model without data loss.
- Task 3.3: Add workspace operations (create/rename/delete).
  - DoD: operations covered by unit tests.

## Epic 4: Inline Tooling
- Task 4.1: Define studio action launcher API.
  - DoD: one contract for page/doc/workspace actions.
- Task 4.2: Integrate `compress-pdf` inline end-to-end.
  - DoD: action runs in studio and applies result to current workspace.
- Task 4.3: Add inline flows for merge/split/rotate/delete pages.
  - DoD: tools run without route navigation.

## Epic 5: QA and Release
- Task 5.1: Update unit/integration tests for new shell.
  - DoD: `npm test` green.
- Task 5.2: Update e2e smoke for studio-first navigation.
  - DoD: `npm run test:e2e` green for critical flows.
- Task 5.3: Final rollout checklist and feature-flag launch plan.
  - DoD: launch/rollback playbook stored in docs.

## Priority Order
1. Epic 1
2. Epic 2
3. Epic 3
4. Epic 4
5. Epic 5

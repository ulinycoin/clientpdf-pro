# Studio-First Kickoff Checklist

Date: 2026-02-16

## Product Alignment
- Confirm top-nav information architecture.
- Confirm workspace/page semantics.
- Confirm inline-tool behavior per tool category.

## Engineering Prep
- Studio-first shell is now default.
- Validate baseline:
  - `npm run build`
  - `npm test`

## Development Rules
- No worker contract changes for shell/UI tasks.
- Keep migration PRs small and incremental.
- Update tests in same PR as behavior change.

## QA Readiness
- Test matrix:
  - Desktop and mobile viewport.
  - With and without existing studio data.
- Critical flows:
  - Upload to studio.
  - Select/reorder pages.
  - Run inline action.
  - Export/download output.

## Launch Readiness
- Rollback command path documented.
- Monitoring signals selected (telemetry for action failures and navigation errors).
- Final regression run completed.

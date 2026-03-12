# UI QA Checklist (Wizard V6)

Date: 2026-02-09  
Owner: Product Engineering

## Run Result (2026-02-09)
- 1) Empty State: `PASS`
- 2) Config State: `PASS` (layout jump check is visual-best-effort, no regression observed in e2e runs)
- 3) Processing State: `PASS`
- 4) Result State: `PASS`
- 5) Error State: `PASS`
- 6) Accessibility Baseline: `PASS`
- 7) Responsive: `PARTIAL` (verified by CSS rules and structure; manual device viewport sweep still recommended)

## 1) Empty State
- Open any tool route with no files.
- Expected:
  - Upload zone is visible and keyboard-focusable.
  - `Enter`/`Space` on upload zone opens file picker.
  - Step chips show `Upload` as active.
- Evidence:
  - Keyboard activation + semantics: `src/v6/components/Wizard/WizardShell.tsx:86`, `src/v6/components/Wizard/WizardShell.tsx:98`, `src/v6/components/Wizard/WizardShell.tsx:100`
  - Upload flow entry validated in smoke: `e2e/smoke.spec.ts:49`

## 2) Config State
- Upload valid input for each tool.
- Expected:
  - Config card appears without layout jumps.
  - Primary CTA follows `Run [Tool/Action]` naming.
  - Back/cancel action returns to upload safely.
- Evidence:
  - CTA naming coverage: `e2e/smoke.spec.ts:90`, `e2e/smoke.spec.ts:104`, `e2e/smoke.spec.ts:118`, `e2e/smoke.spec.ts:129`, `e2e/smoke.spec.ts:140`
  - Cancel/back recoverability path used in tests: `e2e/fallback-budget.spec.ts:77`

## 3) Processing State
- Start run from config.
- Expected:
  - Title uses `[Verb]ing...` format (`Merging...`, `Splitting...`, etc.).
  - Progress bar and `%` are visible.
  - Cancel button is visible and actionable.
- Evidence:
  - Dynamic `[Verb]ing...` mapping: `src/v6/components/Wizard/WizardShell.tsx:119`
  - Processing UI with progress/cancel: `src/v6/components/Wizard/WizardShell.tsx:290`
  - Cancel path regression covered: `src/v6/hooks/wizard-flow-core.test.ts:97`

## 4) Result State
- Complete successful run (at least single-output and multi-output tool).
- Expected:
  - Heading is `Ready!`.
  - Subtitle includes `[Action] complete`.
  - Download CTA:
    - `Download File` for one file.
    - `Download ZIP` for multiple files.
- Evidence:
  - Heading + completion text + download switch: `src/v6/components/Wizard/WizardShell.tsx:306`, `src/v6/components/Wizard/WizardShell.tsx:319`
  - Success assertion in e2e: `e2e/smoke.spec.ts:95`, `e2e/worker-recovery.spec.ts:66`

## 5) Error State
- Trigger recoverable error (e.g., page-count timeout with fallback off).
- Expected:
  - Error banner is readable on dark theme.
  - Message remains actionable and non-ambiguous.
  - User can recover without full page reload.
- Evidence:
  - Timeout error scenario: `e2e/page-count-timeout.spec.ts:45`
  - Fallback-on recoverability: `e2e/page-count-crash-fallback.spec.ts:53`
  - Banner styling for dark theme: `src/styles.css:479`

## 6) Accessibility Baseline
- Tab through wizard controls.
- Expected:
  - Visible focus ring on all interactive controls.
  - Icon-only actions have `aria-label` or `title`.
  - Meaning is not conveyed by color alone.
- Evidence:
  - Global focus-visible: `src/styles.css:54`
  - Upload focus-visible: `src/styles.css:274`
  - Icon controls labels: `src/plugins/merge-pdf/ui/index.tsx:59`, `src/plugins/merge-pdf/ui/index.tsx:71`
  - Icons paired with text in controls: `src/v6/components/Wizard/WizardShell.tsx:316`

## 7) Responsive
- Verify `>= 981px` and `< 981px`.
- Expected:
  - Sidebar stacks correctly on mobile layout.
  - Wizard header reflows without overlap.
  - Buttons remain readable/tappable.
- Evidence:
  - Mobile layout rules: `src/styles.css:600`
  - Header reflow rule: `src/styles.css:614`
  - Status: `PARTIAL` (needs explicit manual viewport walkthrough on real mobile device/browser)

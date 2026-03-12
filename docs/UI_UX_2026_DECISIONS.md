# UI/UX 2026 Decisions (LocalPDF V6)

Date: 2026-02-10  
Status: Accepted

## 1) Visual Direction
- Direction: `Liquid Glass + Linear`.
- Scope: shell (`PlatformApp`), sidebar, wizard, telemetry panel, UX overlays, tool config screens.
- Rule: one visual contract for all tool UIs; avoid mixed legacy inline styles.

## 2) Microcopy Rules (Linear Clarity + Human-Centricity)
- Action labels use verbs:
  - Start action format: `Run [Tool/Action]` (e.g., `Run Merge`, `Run OCR`, `Run Excel to PDF`).
  - Processing state format: `[Verb]ing...` (e.g., `Merging...`, `Splitting...`).
- Error copy must be actionable:
  - Include concrete reason + next step when possible.
  - Avoid dead-end generic errors.
- Success copy:
  - Short completion text (`Ready!` / `[Action] Complete`) where context is clear.
- Download copy:
  - `Download File` for single output.
  - `Download ZIP` for multiple outputs.

## 3) Iconography Rules
- Style: linear outline icons (thin stroke, rounded corners, no heavy fill).
- Single icon source for consistency: internal `LinearIcon` component (`src/v6/components/icons/linear-icon.tsx`).
- Icons must support text, not replace text.
- Accessibility:
  - Every icon-only control requires `aria-label` or `title`.

## 4) Accessibility Baseline
- Keyboard navigation required for wizard controls and tool config actions.
- Visible focus states on interactive elements.
- Do not encode meaning by color alone (text or icon + label required).

## 5) Engineering Guardrails
- UI-only change policy:
  - Do not alter worker contracts for visual-only tasks.
  - Preserve existing e2e anchors or update tests in same change.
- Release gates after UI changes:
  - `npm run build`
  - `npm test`
  - `npm run test:e2e`
  - `npm run audit:workerization:strict`

## 6) Frozen Colors & Navigation Style (2026-02-10)
- Canonical source in code: `src/styles.css`.
- Primary accent tokens:
  - `--accent: #3b82f6`
  - `--accent-soft: #2563eb`
- Primary CTA/navigation gradient:
  - `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`
- Progress/wizard accent gradient:
  - `linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)`

Navigation states:
- Default/inactive (`.nav-link`): glass base `rgba(255,255,255,0.04)` + border `rgba(255,255,255,0.12)` + text `rgba(255,255,255,0.72)`.
- Hover (`.nav-link:hover`): blue tint `rgba(59,130,246,0.12)`, border `rgba(59,130,246,0.45)`, left accent inset + soft blue shadow.
- Active (`.nav-link.active`): blue gradient (`#3b82f6 -> #2563eb`), white text, stronger blue glow.
- Focus (`.nav-link:focus-visible`): explicit blue outline `rgba(96,165,250,0.95)`.
- Disabled (`.nav-link[aria-disabled='true']`): muted glass + no pointer events.

Wizard/button states:
- Step chips use explicit status classes:
  - `.wizard-step-chip-pending`
  - `.wizard-step-chip-active`
  - `.wizard-step-chip-completed`
- Button system:
  - `.btn-primary`: blue gradient + blue shadow.
  - `.btn-secondary`, `.btn-ghost`: glass variants with blue hover border and readable text.
  - Disabled buttons use muted contrast and no glow/shadow.

## 7) Tool UI Standard Pattern (2026-02-15)
- Canonical reference for all tool screens: `docs/WORD_TO_PDF_UI_INTERFACE_SPEC.md`.
- Baseline reference implementation: `word-to-pdf` layout and interaction pattern.
- New tools should follow this pattern by default unless a tool has explicit domain-specific UX constraints.

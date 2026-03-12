# Tool UI Reference Pattern (V6)

Date: 2026-02-15  
Status: Accepted (Supporting Document)  
Primary canonical reference: `docs/WORD_TO_PDF_UI_INTERFACE_SPEC.md`
Reference implementation: `word-to-pdf`

## Purpose

Use this pattern as a quick checklist. For detailed markup/style guidance, use `docs/WORD_TO_PDF_UI_INTERFACE_SPEC.md`.

## Required Layout

- Root: `tool-config-root`
- Workspace: `ocr-concept-workspace`
- Left pane: settings/configuration (`tool-config-card` + `ocr-concept-left`)
- Right pane: preview/result (`tool-config-card` + `ocr-concept-right`)

Grid contract:

- Desktop: `grid-template-columns: minmax(280px, 340px) minmax(0, 1fr)`
- Mobile/tablet breakpoint: single column

## Required Left Pane Blocks

1. Upload zone
- Drag/drop + click-to-upload
- File type microcopy
- Selected file chip with clear action

2. Settings block
- Labeled controls (`tool-config-label`)
- Select/input controls (`tool-config-select`, `tool-config-input`)
- Boolean options (`ocr-concept-check`)

3. Actions block
- Secondary action: `Cancel` (`btn-ghost`)
- Primary action: `Run ...` / context action (`btn-primary`)

## Required Right Pane Blocks

1. Empty state
- Title + short instruction
- Optional capability pills

2. Processing state
- Spinner + explicit progress text
- Progress bar

3. Result state
- Tabs for result views (text/json/pdf/etc.)
- Action toolbar (`copy`, `download`, view toggles)
- Content area (`ocr-concept-editor`)
- Stats/footer row where relevant

## Behavior Rules

- No hidden clipping of settings: avoid hard `overflow: hidden` on containers that wrap tool forms.
- Prefer page/container scrolling over nested left-pane scrolling.
- Keep right pane preview/result scrollable when content is long.
- Primary CTA must stay visible and actionable in all states.

## Copy Rules

- Action button: `Run <Tool>`
- Progress: `<Verb>ing...` + percentage
- Error: short reason + next action
- Empty state: one-sentence instruction

## Accessibility Rules

- Keyboard support for upload zone and all controls
- Visible focus ring
- Icon-only buttons must include `aria-label`
- Never rely on color alone for state meaning

## Implementation Checklist

- Uses shared button and field classes from `src/styles.css`
- Uses two-pane layout contract
- Has empty, running, error, and result states
- No clipped settings at 1366x768 and 1440x900
- Mobile layout verified (`<=1100px`)
- `npm run build` passes after UI changes

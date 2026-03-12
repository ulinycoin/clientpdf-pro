# pdf-editor plugin

`pdf-editor` is a standalone V6 plugin that edits PDF content in-browser and writes the output back to VFS.

## Scope

- Inline text replacement/editing.
- New text block insertion.
- Shape overlays: `rect`, `circle`, `line`, `whiteout`.
- Undo/redo history in UI.
- Export through worker command `APPLY_STUDIO_TEXT_EDITS`.

## Files

- `definition.ts`: metadata, feature tier, limits.
- `logic/index.ts`: validates options and applies page edits in worker runtime.
- `ui/index.tsx`: upload, preview, editing controls, history, save/download flow.

## Input payload contract

The UI sends:

- `elements`: preferred, mixed edit payload.
- `edits`: backward-compatible text-only subset.

Supported element kinds:

- `text`
  - `pageIndex`, `text`, `xRatio`, `yRatio`, `widthRatio`, `heightRatio`
  - optional formatting: `fontSize`, `fontFamily`, `color`, `backgroundColor`, `bold`, `italic`, `opacity`, `rotation`, `textAlign`, `horizontalScaling`
- `line`
  - `pageIndex`, `x1Ratio`, `y1Ratio`, `x2Ratio`, `y2Ratio`, `color`, `strokeWidth`, `opacity`
- `rect`, `circle`, and `whiteout`
  - `pageIndex`, `xRatio`, `yRatio`, `widthRatio`, `heightRatio`, `color`, `strokeWidth`, `opacity`

`logic/index.ts` normalizes and clamps these values, groups elements by page, and calls `APPLY_STUDIO_TEXT_EDITS` per page.

## UX behavior

- File input supports click and drag-and-drop.
- `beforeunload` warning is enabled for unsaved edits.
- `Cancel` and `Clear` ask for confirmation when unsaved edits exist.

## Test coverage

- Unit: `src/plugins/pdf-editor/logic/index.test.ts`
- E2E: `e2e/pdf-editor-p0-flow.spec.ts`

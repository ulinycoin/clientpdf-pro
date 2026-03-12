# LocalPDF

LocalPDF is a local-first PDF product repository with two deployable surfaces:

- `website/`: the public marketing site built with Astro
- `src/`: the application SPA built with React, routed under `/app`

The product direction is privacy-first, worker-first PDF workflows. Heavy document processing runs in workers, and Studio is the primary workspace for edit and convert flows.

## Repository Layout

- `src/app`: application shell, routing, platform bootstrap, React integration
- `src/core`: registry, runner, VFS, worker-facing contracts
- `src/plugins`: declarative tool definitions with isolated `ui/` and `logic/`
- `src/v6/components/Studio`: Studio workspace, edit workspace, convert workspace
- `website/src`: public landing, feature pages, trust pages, blog content
- `shared`: cross-surface route constants and shared app path helpers
- `scripts`: audits and fixture generation

## Local Development

Requirements:

- Node.js 20+
- npm 10+

Install dependencies:

```bash
npm install
```

Run the app SPA:

```bash
npm run dev
```

Run the marketing site:

```bash
npm run dev:web
```

Run both together:

```bash
npm run dev:all
```

Default local URLs:

- App: `http://127.0.0.1:3000/app`
- Website: Astro dev output from `website/`

## Build

Build the app SPA:

```bash
npm run build
```

Build the website:

```bash
npm run build:web
```

Build the merged deployment output used by Vercel:

```bash
npm run build:all
```

The merged output is written to `dist/` with:

- marketing site at `/`
- SPA mounted at `/app`

## Testing

Run unit and integration tests:

```bash
npm test
```

Run Playwright end-to-end tests:

```bash
npm run test:e2e
```

Run the release-oriented check:

```bash
npm run release:check
```

## Architectural Rules

This repository follows strict agent and architecture rules defined in:

- `AGENTS.md`
- `MODEL.md`
- `FAILURE_MODES.md`
- `TESTING_RULES.md`

Key constraints:

- Tool UI, logic, and platform layers stay isolated
- Heavy processing stays out of the main thread
- File handling goes through VFS abstractions
- Limits and monetization remain declarative

## Deployment Notes

- Vercel serves the marketing site from `/`
- The SPA is deployed under `/app`
- SPA deep links under `/app/*` are rewritten to `/app/index.html`
- For replacing the v4 `clientpdf-pro` production repository with this codebase, use [`docs/CLIENTPDF_PRO_MIGRATION_RUNBOOK.md`](/Users/aleksejs/Desktop/LocalPDF_V6/docs/CLIENTPDF_PRO_MIGRATION_RUNBOOK.md) and [`docs/CLIENTPDF_PRO_CUTOVER_CHECKLIST.md`](/Users/aleksejs/Desktop/LocalPDF_V6/docs/CLIENTPDF_PRO_CUTOVER_CHECKLIST.md)

## Status

This repository is structured for public GitHub visibility and deployment work. Before a public release, run `npm run release:check` and verify environment variables, analytics settings, and deployment metadata for the target environment.

# clientpdf-pro Migration Runbook

This runbook describes how to replace the current v4 codebase in `ulinycoin/clientpdf-pro` with LocalPDF V6 while preserving the production domain `https://localpdf.online`.

## Goal

- Keep `clientpdf-pro` as the canonical public repository.
- Preserve the current GitHub stars, forks, and repository URL.
- Move production deployment on Vercel from v4 to V6 with a controlled rollback path.

## Current V6 Deployment Shape

- Marketing site is built from `website/` with Astro.
- The application SPA is built from `src/` with Vite/React.
- Production output is merged into `dist/`.
- Marketing pages are served from `/`.
- The application is served from `/app`.
- Vercel rewrites `/app/*` to `/app/index.html`.

Repository references:

- [`package.json`](/Users/aleksejs/Desktop/LocalPDF_V6/package.json)
- [`vercel.json`](/Users/aleksejs/Desktop/LocalPDF_V6/vercel.json)
- [`build-vercel.mjs`](/Users/aleksejs/Desktop/LocalPDF_V6/build-vercel.mjs)

## Migration Strategy

Use a repository replacement strategy, not a direct in-place rewrite on production.

1. Freeze v4 in `clientpdf-pro`.
2. Create a migration branch in `clientpdf-pro`.
3. Replace the repository contents with V6.
4. Preserve and re-apply any v4-only Vercel environment variables that are still required.
5. Validate the V6 preview deployment.
6. Switch the production Vercel project to the V6 branch.
7. Keep the old v4 project available for rollback.

## Phase 1: Freeze and Archive v4

Run these steps in the `clientpdf-pro` repository.

1. Confirm the current production branch and last deployed commit.
2. Create a production tag, for example `v4-final-production`.
3. Create an archive branch, for example `archive/v4`.
4. Export or manually copy the current Vercel project settings:
   - Build command
   - Install command
   - Output directory
   - Node version
   - Environment variables
   - Domain assignments
   - Redirects and headers if any are managed in the Vercel UI
5. Do not delete the old Vercel project after cutover.

## Phase 2: Prepare the V6 Replacement Branch

Run these steps in `clientpdf-pro`.

1. Create a branch from the current default branch, for example `migration/v6-cutover`.
2. Replace the repository contents with the LocalPDF V6 source tree.
3. Keep the repository root history intact by merging or copying V6 into the existing repository, rather than creating a new GitHub repository.
4. Preserve any required repository-level files from v4 that still matter:
   - GitHub Actions files
   - issue templates
   - repo settings files
   - ownership files
5. Remove build artifacts that should not live in git if they were previously committed by v4.

## Phase 3: Make V6 the Canonical Production Configuration

The following settings must be true in `clientpdf-pro` before cutover:

1. `vercel.json` is committed at the repository root.
2. `npm run build:all` succeeds.
3. `dist/` contains:
   - root marketing pages
   - `/app/index.html`
   - static assets required by both surfaces
4. All legacy public URLs from v4 resolve via redirect or a canonical page in V6.

## Phase 4: Preview Validation on Vercel

Connect the migration branch to a preview deployment and verify these paths:

1. `/`
2. `/app`
3. `/app/*` deep links
4. `/about`
5. `/privacy`
6. `/terms`
7. `/faq`
8. `/security`
9. `/features/edit-pdf`
10. `/features/merge-pdf`
11. `/features/ocr-pdf`
12. `/features/compress-pdf`
13. `/features/split-pdf`
14. `/features/sign-pdf`
15. `/features/convert-pdf`

Validate these behaviors:

1. `www.localpdf.online` redirects to `localpdf.online`.
2. Legacy v4 tool URLs return `308` to the correct V6 canonical pages.
3. `/app` loads the SPA shell.
4. `/app/*` deep links do not return `404`.
5. `robots.txt`, sitemap, manifest, and OG images are served correctly.
6. Worker-based PDF flows load without runtime crashes.

## Phase 5: Production Cutover

Preferred cutover pattern:

1. Keep the existing v4 Vercel project unchanged.
2. Create or reuse a separate Vercel project for the V6 migration branch.
3. Apply the production domain `localpdf.online` only after preview validation passes.
4. Apply `www.localpdf.online` redirect behavior.
5. Verify the production deployment immediately after DNS/domain reassignment.

Less safe pattern:

1. Repoint the existing production Vercel project directly to the V6 migration branch.

Only use the less safe pattern if rollback time is still acceptable and all settings are already captured.

## Rollback

Rollback must be procedural, not improvised.

1. Keep the v4 production tag.
2. Keep the v4 branch.
3. Keep the old Vercel project and its environment variables.
4. If production validation fails, move the domain back to the v4 project.
5. Do not delete the V6 migration branch during rollback.

## Acceptance Criteria

The migration is complete only when all of the following are true:

1. `clientpdf-pro` contains the V6 codebase on its default branch.
2. `https://localpdf.online` serves the V6 marketing site from `/`.
3. `https://localpdf.online/app` serves the V6 SPA.
4. Legacy v4 public URLs redirect to valid V6 canonical destinations.
5. Preview and production builds both succeed from the repository root with `npm run build:all`.
6. A tested rollback path to v4 still exists.

## Notes For This Repository

The current local repository still points to:

- `https://github.com/ulinycoin/applocalpdf_v6.git`

That should remain unchanged until the V6 code is copied or merged into `clientpdf-pro`. Do not switch the local `origin` blindly unless this repository is intended to become the working clone of `clientpdf-pro`.

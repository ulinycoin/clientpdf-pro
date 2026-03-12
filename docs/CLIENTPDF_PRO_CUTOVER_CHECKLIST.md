# clientpdf-pro Cutover Checklist

Use this checklist on the day of migration from v4 to V6.

## Before Cutover

1. Confirm `clientpdf-pro` contains the V6 migration branch.
2. Confirm the old v4 production commit is tagged.
3. Confirm the old v4 Vercel project remains intact.
4. Confirm `npm install` succeeds on the migration branch.
5. Confirm `npm test` succeeds on the migration branch.
6. Confirm `npm run build:all` succeeds on the migration branch.
7. Confirm preview deployment succeeds on Vercel.
8. Confirm the following environment variables are reviewed:
   - `PUBLIC_APP_URL`
   - `PUBLIC_GA_MEASUREMENT_ID`
   - `PUBLIC_POSTHOG_KEY`
   - `PUBLIC_POSTHOG_UI_HOST`
   - `PUBLIC_ENABLE_VERCEL_ANALYTICS`
   - `VITE_BILLING_URL`
   - `VITE_MARKETING_SITE_URL`
   - `V6_PAGE_COUNT_FALLBACK_MODE`
9. Confirm the Vercel project uses:
   - Install command: `npm install`
   - Build command: `npm run build:all`
   - Output directory: `dist`
10. Confirm the following routes work in preview:
    - `/`
    - `/app`
    - `/about`
    - `/privacy`
    - `/terms`
    - `/faq`
    - `/security`
    - `/features/edit-pdf`
    - `/features/merge-pdf`
    - `/features/ocr-pdf`
    - `/features/compress-pdf`
    - `/features/split-pdf`
    - `/features/sign-pdf`
    - `/features/convert-pdf`
11. Confirm legacy route redirects behave as expected.
12. Confirm `robots.txt` and `sitemap-index.xml` are reachable.
13. Confirm analytics can be disabled safely if keys are missing.

## During Cutover

1. Pause non-essential commits to the production branch.
2. Promote the approved V6 migration branch to the production branch, or point the production Vercel project to that branch.
3. Assign `localpdf.online` to the V6 deployment.
4. Assign or verify `www.localpdf.online`.
5. Wait for deployment completion.
6. Verify:
   - homepage
   - `/app`
   - one upload flow
   - one worker-backed edit or convert flow
   - one legacy redirect

## After Cutover

1. Open `https://localpdf.online/`.
2. Open `https://localpdf.online/app`.
3. Open `https://localpdf.online/features/edit-pdf`.
4. Open one old v4 URL and verify redirect behavior.
5. Check browser console for runtime errors.
6. Check Vercel function/build logs for deployment warnings.
7. Check analytics initialization if analytics remain enabled.
8. Confirm canonical tags point to `https://localpdf.online`.
9. Confirm the sitemap and robots file are production-correct.
10. Keep the v4 project available until the V6 release is stable.

## Immediate Rollback Triggers

Rollback immediately if any of the following occur:

1. `/app` returns `404` or fails to hydrate.
2. The root homepage serves the wrong surface.
3. Legacy redirects loop or resolve to `404`.
4. Production build differs from preview behavior in a critical flow.
5. PDF processing fails broadly in the browser for supported inputs.

## Rollback Steps

1. Reassign `localpdf.online` back to the v4 Vercel project.
2. Restore the previous production branch or deployment target.
3. Re-verify the v4 homepage and main tool entry pages.
4. Keep the failed V6 deployment for debugging; do not overwrite evidence.

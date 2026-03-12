import { expect, test } from '@playwright/test';

test.describe('UX Toast Dedupe', () => {
  test('deduplicates repeated error toasts and emits dedupe telemetry', async ({ page }) => {
    await page.goto('/app/');
    await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();

    await page.evaluate(() => {
      const api = (window as any).__LOCALPDF_V6_TEST_API;
      if (!api) {
        throw new Error('Test API is unavailable');
      }

      for (let i = 0; i < 10; i += 1) {
        api.trackTelemetry({
          type: 'UI_TOAST_SHOWN',
          runId: `dedupe-run-${i}`,
          toolId: 'merge-pdf',
          level: 'error',
          message: 'Synthetic repeated worker failure',
        });
      }
    });

    const toastItems = page.getByTestId('ux-toast-item').filter({ hasText: 'Synthetic repeated worker failure' });
    await expect(toastItems.first()).toBeVisible();
    await expect(toastItems).toHaveCount(1);
    const dedupeEvents = await page.evaluate(() => {
      const api = (window as any).__LOCALPDF_V6_TEST_API;
      return (api?.getTelemetrySnapshot?.() ?? []).filter((event: { type?: string }) => event.type === 'UI_TOAST_DEDUPED').length;
    });
    expect(dedupeEvents).toBeGreaterThan(0);
  });
});

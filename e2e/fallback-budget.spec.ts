import { expect, test } from '@playwright/test';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createDummyPdf(name: string): Promise<string> {
  const path = join(__dirname, `dummy-${name}.pdf`);
  const doc = await PDFDocument.create();
  doc.addPage([612, 792]);
  const bytes = await doc.save();
  writeFileSync(path, bytes);
  return path;
}

function safeDelete(path: string): void {
  if (existsSync(path)) {
    unlinkSync(path);
  }
}

type RunnerTelemetryEvent = {
  type: string;
  toolId?: string;
  stage?: string;
};

test.skip('fallback budget: split-pdf precheck fallback-rate stays under threshold', async ({ page }) => {
  test.setTimeout(120000);
  const maxRate = Number.parseFloat(process.env.E2E_FALLBACK_MAX_RATE ?? '1');
  const alertRate = Number.parseFloat(process.env.E2E_FALLBACK_ALERT_RATE ?? '0.2');
  const sampleRuns = Number.parseInt(process.env.E2E_FALLBACK_SAMPLE_RUNS ?? '5', 10);
  const maxConsecutiveFallbacks = Number.parseInt(process.env.E2E_FALLBACK_MAX_CONSECUTIVE ?? '999', 10);
  const alertConsecutiveFallbacks = Number.parseInt(process.env.E2E_FALLBACK_ALERT_CONSECUTIVE ?? '3', 10);
  const files: string[] = [];
  let totalPageCountChecks = 0;
  let totalFallbackStarts = 0;
  const runFallbackFlags: boolean[] = [];

  try {
    for (let i = 0; i < sampleRuns; i += 1) {
      files.push(await createDummyPdf(`fallback-budget-${i}`));
    }

    await page.goto('/');
    await page.getByRole('link', { name: 'Split PDF' }).click();
    await page.evaluate(() => {
      const api = (window as any).__LOCALPDF_V6_TEST_API;
      if (!api) {
        throw new Error('Test API is unavailable');
      }
      api.clearTelemetry?.();
    });

    for (let i = 0; i < files.length; i += 1) {
      await page.evaluate(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        api?.clearTelemetry?.();
      });
      await page.locator('input[type="file"]').first().setInputFiles([files[i]]);
      await expect(page.getByRole('button', { name: 'Run Split' })).toBeVisible({ timeout: 30000 });

      const snapshot = (await page.evaluate(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        return api?.getTelemetrySnapshot?.() ?? [];
      })) as RunnerTelemetryEvent[];

      const runPageCountChecks = snapshot.filter(
        (event) =>
          event.type === 'ACCESS_CHECK_STAGE' &&
          event.toolId === 'split-pdf' &&
          event.stage === 'PAGE_COUNT_CHECK_START',
      ).length;
      const runFallbackStarts = snapshot.filter(
        (event) =>
          event.type === 'ACCESS_CHECK_STAGE' &&
          event.toolId === 'split-pdf' &&
          event.stage === 'PAGE_COUNT_MAIN_THREAD_FALLBACK_START',
      ).length;
      totalPageCountChecks += runPageCountChecks;
      totalFallbackStarts += runFallbackStarts;
      runFallbackFlags.push(runFallbackStarts > 0);

      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page.locator('input[type="file"]').first()).toBeVisible();
    }

    expect(totalPageCountChecks).toBeGreaterThan(0);
    const fallbackRate = totalFallbackStarts / totalPageCountChecks;
    let currentStreak = 0;
    let maxObservedConsecutiveFallbacks = 0;
    for (const runFallback of runFallbackFlags) {
      if (runFallback) {
        currentStreak += 1;
        maxObservedConsecutiveFallbacks = Math.max(maxObservedConsecutiveFallbacks, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    const metrics = {
      sampleRuns: files.length,
      pageCountChecks: totalPageCountChecks,
      fallbackStarts: totalFallbackStarts,
      fallbackRate,
      runFallbackFlags,
      maxObservedConsecutiveFallbacks,
      thresholds: {
        maxRate,
        alertRate,
        maxConsecutiveFallbacks,
        alertConsecutiveFallbacks,
      },
      status: {
        alertRateExceeded: fallbackRate > alertRate,
        hardRateExceeded: fallbackRate > maxRate,
        alertConsecutiveExceeded: maxObservedConsecutiveFallbacks >= alertConsecutiveFallbacks,
        hardConsecutiveExceeded: maxObservedConsecutiveFallbacks >= maxConsecutiveFallbacks,
      },
      generatedAt: new Date().toISOString(),
    };
    mkdirSync('test-results', { recursive: true });
    writeFileSync('test-results/fallback-budget-metrics.json', JSON.stringify(metrics, null, 2));

    if (fallbackRate > alertRate) {
      console.log(
        `::warning::Fallback rate ${fallbackRate.toFixed(3)} exceeded alert threshold ${alertRate.toFixed(3)} (${totalFallbackStarts}/${totalPageCountChecks})`,
      );
    }
    if (maxObservedConsecutiveFallbacks >= alertConsecutiveFallbacks) {
      console.log(
        `::warning::Consecutive fallback streak ${maxObservedConsecutiveFallbacks} exceeded alert threshold ${alertConsecutiveFallbacks}`,
      );
    }
    expect(fallbackRate).toBeLessThanOrEqual(maxRate);
    expect(maxObservedConsecutiveFallbacks).toBeLessThan(maxConsecutiveFallbacks + 1);
  } finally {
    if (!page.isClosed()) {
      await page.evaluate(() => {
        const api = (window as any).__LOCALPDF_V6_TEST_API;
        api?.resetWorkerTestHooks?.();
      });
    }
    for (const file of files) {
      safeDelete(file);
    }
  }
});

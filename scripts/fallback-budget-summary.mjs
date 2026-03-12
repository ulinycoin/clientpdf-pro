import { readFileSync, existsSync, appendFileSync } from 'node:fs';

const metricsPath = process.argv[2] ?? 'test-results/fallback-budget-metrics.json';

if (!existsSync(metricsPath)) {
  console.log(`Fallback budget metrics file not found: ${metricsPath}`);
  process.exit(0);
}

const metrics = JSON.parse(readFileSync(metricsPath, 'utf8'));
const summary = [
  '## Fallback Budget',
  '',
  '| Metric | Value |',
  '| --- | --- |',
  `| Sample runs | ${metrics.sampleRuns} |`,
  `| Page-count checks | ${metrics.pageCountChecks} |`,
  `| Fallback starts | ${metrics.fallbackStarts} |`,
  `| Fallback rate | ${Number(metrics.fallbackRate).toFixed(3)} |`,
  `| Max consecutive fallbacks | ${metrics.maxObservedConsecutiveFallbacks} |`,
  '',
  '| Threshold | Value |',
  '| --- | --- |',
  `| Alert rate | ${metrics.thresholds.alertRate} |`,
  `| Hard rate | ${metrics.thresholds.maxRate} |`,
  `| Alert consecutive | ${metrics.thresholds.alertConsecutiveFallbacks} |`,
  `| Hard consecutive | ${metrics.thresholds.maxConsecutiveFallbacks} |`,
  '',
  `- Alert rate exceeded: ${metrics.status.alertRateExceeded ? 'yes' : 'no'}`,
  `- Hard rate exceeded: ${metrics.status.hardRateExceeded ? 'yes' : 'no'}`,
  `- Alert consecutive exceeded: ${metrics.status.alertConsecutiveExceeded ? 'yes' : 'no'}`,
  `- Hard consecutive exceeded: ${metrics.status.hardConsecutiveExceeded ? 'yes' : 'no'}`,
  '',
].join('\n');

console.log(summary);

const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) {
  appendFileSync(summaryFile, `${summary}\n`);
}

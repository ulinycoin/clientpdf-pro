import assert from 'node:assert/strict';
import test from 'node:test';
import { TelemetryBus } from '../../core/public';

test('TelemetryBus keeps bounded event history and notifies subscribers', () => {
  const bus = new TelemetryBus(2);
  const seen: string[] = [];
  const unsub = bus.subscribe((event) => seen.push(event.type));

  bus.track({ type: 'TOOL_RUN_STARTED', runId: 'r1', toolId: 't1', inputCount: 1 });
  bus.track({ type: 'TOOL_RUN_PROGRESS', runId: 'r1', toolId: 't1', progress: 50 });
  bus.track({ type: 'TOOL_RUN_RESULT', runId: 'r1', toolId: 't1', durationMs: 10, outputCount: 1 });
  unsub();

  assert.deepEqual(seen, ['TOOL_RUN_STARTED', 'TOOL_RUN_PROGRESS', 'TOOL_RUN_RESULT']);
  const snapshot = bus.snapshot();
  assert.equal(snapshot.length, 2);
  assert.equal(snapshot[0].type, 'TOOL_RUN_PROGRESS');
  assert.equal(snapshot[1].type, 'TOOL_RUN_RESULT');
});

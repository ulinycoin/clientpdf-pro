import { WebFileSystemAdapter } from '../../core/io/web-filesystem-adapter';
import { createRegistry } from '../../core/registry/register-tools';
import { UnifiedToolRunner } from '../../core/runner/unified-tool-runner';
import {
  CompositeTelemetrySink,
  ConsoleTelemetrySink,
  NoopTelemetrySink,
  TelemetryBus,
  type TelemetrySink,
} from '../../core/telemetry/telemetry';
import type { IToolDefinition } from '../../core/types/contracts';
import { VirtualFileSystem } from '../../core/vfs/virtual-file-system';
import {
  createBrowserWorkerOrchestrator,
  InProcessWorkerOrchestrator,
  type WorkerOrchestrator,
} from '../../core/workers/worker-orchestrator';

export interface PlatformRuntime {
  mode: 'browser-worker' | 'in-process';
  registry: ReturnType<typeof createRegistry>;
  vfs: VirtualFileSystem;
  runner: UnifiedToolRunner;
  workerOrchestrator: WorkerOrchestrator;
  telemetry: TelemetryBus;
}

const DEFAULT_VFS_QUOTA = {
  maxTotalBytes: 512 * 1024 * 1024,
  maxTempBytes: 256 * 1024 * 1024,
};

function resolvePageCountFallbackMode(): 'off' | 'limited' | 'on' {
  const viteValue = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_V6_PAGE_COUNT_FALLBACK_MODE;
  const nodeValue = typeof process !== 'undefined' ? process.env?.V6_PAGE_COUNT_FALLBACK_MODE : undefined;
  const raw = (viteValue ?? nodeValue ?? 'limited').toLowerCase();
  if (raw === 'off' || raw === 'limited' || raw === 'on') {
    return raw;
  }
  return 'limited';
}

export function createPlatformRuntime(
  mode: 'browser-worker' | 'in-process' = 'browser-worker',
  definitions?: IToolDefinition[],
  options?: { telemetrySink?: TelemetrySink },
): PlatformRuntime {
  const registry = createRegistry(definitions);
  const fs = new WebFileSystemAdapter();
  const vfs = new VirtualFileSystem(fs, DEFAULT_VFS_QUOTA);
  const telemetry = new TelemetryBus();
  const runnerTelemetry = new CompositeTelemetrySink([
    telemetry,
    options?.telemetrySink ?? (mode === 'browser-worker' ? new ConsoleTelemetrySink() : new NoopTelemetrySink()),
  ]);

  const workerOrchestrator =
    mode === 'browser-worker'
      ? createBrowserWorkerOrchestrator()
      : new InProcessWorkerOrchestrator(async (command) => {
        const { executeWorkerCommand } = await import('../../core/workers/worker-runtime');
        return executeWorkerCommand(command, { registry, fs });
      });

  const runner = new UnifiedToolRunner(registry, workerOrchestrator, fs, runnerTelemetry, {
    pageCountFallbackMode: resolvePageCountFallbackMode(),
  });
  return {
    mode,
    registry,
    vfs,
    runner,
    workerOrchestrator,
    telemetry,
  };
}

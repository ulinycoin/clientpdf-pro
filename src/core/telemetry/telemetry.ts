import type { RunnerTelemetryEvent } from '../types/contracts';
export type { RunnerTelemetryEvent } from '../types/contracts';

export interface TelemetrySink {
  track(event: RunnerTelemetryEvent): void;
}

export class NoopTelemetrySink implements TelemetrySink {
  track(): void {}
}

export type TelemetryListener = (event: RunnerTelemetryEvent) => void;

export class TelemetryBus implements TelemetrySink {
  private readonly listeners = new Set<TelemetryListener>();
  private readonly events: RunnerTelemetryEvent[] = [];

  constructor(private readonly maxEvents = 500) {}

  track(event: RunnerTelemetryEvent): void {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  subscribe(listener: TelemetryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  snapshot(): RunnerTelemetryEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events.length = 0;
  }
}

export class ConsoleTelemetrySink implements TelemetrySink {
  track(event: RunnerTelemetryEvent): void {
    // Keep telemetry machine-readable for downstream log processors.
    console.info('[telemetry]', JSON.stringify(event));
  }
}

export class CompositeTelemetrySink implements TelemetrySink {
  constructor(private readonly sinks: TelemetrySink[]) {}

  track(event: RunnerTelemetryEvent): void {
    for (const sink of this.sinks) {
      sink.track(event);
    }
  }
}

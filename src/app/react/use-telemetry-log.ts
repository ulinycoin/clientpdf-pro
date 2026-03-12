import { useEffect, useState } from 'react';
import type { RunnerTelemetryEvent } from '../../core/public/contracts';
import { usePlatform } from './platform-context';

export function useTelemetryLog(limit = 200) {
  const { runtime } = usePlatform();
  const [events, setEvents] = useState<RunnerTelemetryEvent[]>(() => runtime.telemetry.snapshot().slice(-limit));

  useEffect(() => {
    return runtime.telemetry.subscribe((event) => {
      setEvents((current) => {
        const next = [...current, event];
        if (next.length <= limit) {
          return next;
        }
        return next.slice(next.length - limit);
      });
    });
  }, [limit, runtime.telemetry]);

  return events;
}

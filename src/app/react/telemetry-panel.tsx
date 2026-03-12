import { useState } from 'react';
import { useTelemetryLog } from './use-telemetry-log';
import type { RunnerTelemetryEvent } from '../../core/public/contracts';

export function formatEvent(event: RunnerTelemetryEvent): string {
  switch (event.type) {
    case 'TOOL_RUN_ERROR':
      return `${event.type} ${event.toolId} code=${event.code ?? 'n/a'} msg=${event.message}`;
    case 'PAGE_COUNT_CHECK_RESULT':
      return `${event.type} ${event.toolId} file=${event.fileId} pages=${event.pageCount} ms=${event.durationMs}`;
    case 'PAGE_COUNT_CHECK_ERROR':
      return `${event.type} ${event.toolId} file=${event.fileId} code=${event.code ?? 'n/a'} ms=${event.durationMs} msg=${event.message}`;
    case 'ACCESS_CHECK_STAGE':
      return `${event.type} ${event.toolId} stage=${event.stage}${event.fileId ? ` file=${event.fileId}` : ''}${event.durationMs !== undefined ? ` ms=${event.durationMs}` : ''}`;
    case 'PAGE_COUNT_WORKER_STAGE':
      return `${event.type} ${event.toolId} stage=${event.stage} file=${event.fileId}${event.durationMs !== undefined ? ` ms=${event.durationMs}` : ''}${event.note ? ` note=${event.note}` : ''}`;
    case 'UI_TOAST_SHOWN':
      return `${event.type} ${event.toolId} level=${event.level} msg=${event.message}`;
    case 'UI_UPSELL_SHOWN':
      return `${event.type} ${event.toolId} reason=${event.reason}`;
    case 'UI_TOAST_DEDUPED':
      return `${event.type} ${event.toolId} suppressed=${event.suppressedCount} key=${event.key}`;
    case 'UI_UPSELL_CTA_CLICKED':
      return `${event.type} ${event.toolId} dest=${event.destination}`;
    case 'UI_PREVIEW_RENDERED':
      return `${event.type} ${event.toolId} file=${event.fileId} ms=${event.durationMs}${event.pageCount !== undefined ? ` pages=${event.pageCount}` : ''}`;
    case 'UI_PREVIEW_ERROR':
      return `${event.type} ${event.toolId} file=${event.fileId} msg=${event.message}`;
    case 'STUDIO_EDIT_GUARDRAIL':
      return `${event.type} ${event.toolId} file=${event.fileId} page=${event.pageIndex} code=${event.code ?? 'n/a'} msg=${event.message}`;
    case 'STUDIO_EDIT_SAVE_ACTION':
      return `${event.type} ${event.toolId} action=${event.action} scope=${event.scope} ok=${event.pagesSucceeded}/${event.pagesTotal} failed=${event.pagesFailed}${event.overflowCount !== undefined ? ` overflow=${event.overflowCount}` : ''}${event.message ? ` msg=${event.message}` : ''}`;
    default:
      return `${event.type} ${event.toolId}`;
  }
}

export function TelemetryPanel() {
  const events = useTelemetryLog(80);
  const [showTelemetry, setShowTelemetry] = useState(false);

  return (
    <div className="telemetry-section">
      <div className="telemetry-header">
        <span>Live Telemetry</span>
        <label className="telemetry-toggle">
          <input
            type="checkbox"
            checked={showTelemetry}
            onChange={(e) => setShowTelemetry(e.target.checked)}
          />
          <span className="telemetry-toggle-label">Show</span>
        </label>
      </div>

      {showTelemetry && (
        <div className="telemetry-log animate-fade-in">
          {events.length === 0 ? (
            <div className="telemetry-empty">Awaiting local events...</div>
          ) : (
            events.map((event, idx) => (
              <div key={`${event.runId}-${event.type}-${idx}`} className="telemetry-event">
                <span className="telemetry-id">[{event.runId.slice(0, 8)}]</span> {formatEvent(event)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

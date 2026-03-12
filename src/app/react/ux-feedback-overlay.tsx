import { useEffect, useRef, useState } from 'react';
import { usePlatform } from './platform-context';
import type { RunnerTelemetryEvent } from '../../core/public/contracts';
import { openBillingPlans } from './billing';

interface UiToastItem {
  id: string;
  message: string;
  level: 'info' | 'error';
}

interface UpsellState {
  runId: string;
  toolId: string;
  reason: string;
}

const TOAST_DEDUPE_MS = 4_000;
const MAX_ACTIVE_TOASTS = 4;

export function toToastKey(toolId: string, level: UiToastItem['level'], message: string): string {
  return `${toolId}|${level}|${message.trim().toLowerCase()}`;
}

export function shouldDisplayToast(
  lastSeenAtMs: number | undefined,
  nowMs: number,
  dedupeWindowMs = TOAST_DEDUPE_MS,
): boolean {
  if (lastSeenAtMs === undefined) {
    return true;
  }
  return nowMs - lastSeenAtMs >= dedupeWindowMs;
}

function isUiToastEvent(event: RunnerTelemetryEvent): event is Extract<RunnerTelemetryEvent, { type: 'UI_TOAST_SHOWN' }> {
  return event.type === 'UI_TOAST_SHOWN';
}

function isUpsellEvent(event: RunnerTelemetryEvent): event is Extract<RunnerTelemetryEvent, { type: 'UI_UPSELL_SHOWN' }> {
  return event.type === 'UI_UPSELL_SHOWN';
}

export function UxFeedbackOverlay() {
  const { runtime } = usePlatform();
  const [toasts, setToasts] = useState<UiToastItem[]>([]);
  const [upsell, setUpsell] = useState<UpsellState | null>(null);
  const recentToastByKeyRef = useRef(new Map<string, number>());
  const suppressedCountByKeyRef = useRef(new Map<string, number>());

  useEffect(() => {
    return runtime.telemetry.subscribe((event) => {
      if (isUiToastEvent(event)) {
        const now = Date.now();
        const toastKey = toToastKey(event.toolId, event.level, event.message);
        const lastSeenAtMs = recentToastByKeyRef.current.get(toastKey);
        if (!shouldDisplayToast(lastSeenAtMs, now)) {
          const nextSuppressed = (suppressedCountByKeyRef.current.get(toastKey) ?? 0) + 1;
          suppressedCountByKeyRef.current.set(toastKey, nextSuppressed);
          runtime.telemetry.track({
            type: 'UI_TOAST_DEDUPED',
            runId: event.runId,
            toolId: event.toolId,
            key: toastKey,
            suppressedCount: nextSuppressed,
          });
          return;
        }
        recentToastByKeyRef.current.set(toastKey, now);
        suppressedCountByKeyRef.current.delete(toastKey);
        for (const [key, ts] of recentToastByKeyRef.current) {
          if (now - ts > TOAST_DEDUPE_MS * 2) {
            recentToastByKeyRef.current.delete(key);
          }
        }

        const toastId = `${event.runId}-${Date.now()}`;
        setToasts((current) => {
          const next = [...current, { id: toastId, message: event.message, level: event.level }];
          if (next.length <= MAX_ACTIVE_TOASTS) {
            return next;
          }
          return next.slice(next.length - MAX_ACTIVE_TOASTS);
        });
        setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== toastId));
        }, 3800);
        return;
      }
      if (isUpsellEvent(event)) {
        setUpsell({ runId: event.runId, toolId: event.toolId, reason: event.reason });
      }
    });
  }, [runtime.telemetry]);

  return (
    <>
      <div className="ux-toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} data-testid="ux-toast-item" className={`ux-toast-item ${toast.level === 'error' ? 'error' : ''}`}>
            {toast.message}
          </div>
        ))}
      </div>

      {upsell && (
        <div className="ux-upsell-overlay">
          <div className="ux-upsell-modal">
            <h3 className="ux-upsell-title">Upgrade required</h3>
            <p className="ux-upsell-reason">{upsell.reason}</p>
            <p className="ux-upsell-tool">Tool: {upsell.toolId}</p>
            <div className="ux-upsell-actions">
              <button className="btn-ghost" onClick={() => setUpsell(null)}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  const destination = openBillingPlans(import.meta.env.VITE_BILLING_URL);
                  runtime.telemetry.track({
                    type: 'UI_UPSELL_CTA_CLICKED',
                    runId: upsell.runId,
                    toolId: upsell.toolId,
                    destination,
                  });
                  setUpsell(null);
                }}
              >
                View plans
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

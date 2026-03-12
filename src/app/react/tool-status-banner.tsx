import type { RunnerExecuteResult } from '../../core/public/contracts';

interface ToolStatusBannerProps {
  isRunning: boolean;
  progress: number;
  statusMessage: string;
  lastResult: RunnerExecuteResult | null;
}

function getColors(lastResult: RunnerExecuteResult | null): { bg: string; border: string } {
  if (!lastResult) {
    return { bg: '#f9fafb', border: '#e5e7eb' };
  }
  if (lastResult.type === 'TOOL_RESULT') {
    return { bg: '#ecfdf5', border: '#10b981' };
  }
  if (lastResult.type === 'TOOL_ACCESS_DENIED') {
    return { bg: '#fffbeb', border: '#f59e0b' };
  }
  return { bg: '#fef2f2', border: '#ef4444' };
}

export function ToolStatusBanner({ isRunning, progress, statusMessage, lastResult }: ToolStatusBannerProps) {
  const colors = getColors(lastResult);

  if (!isRunning && !statusMessage) {
    return null;
  }

  return (
    <section
      aria-live="polite"
      style={{
        marginTop: '0.75rem',
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        borderRadius: '8px',
        padding: '0.75rem',
      }}
    >
      {isRunning ? (
        <div>
          <div style={{ marginBottom: '0.5rem' }}>Processing... {progress}%</div>
          <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.max(0, Math.min(100, progress))}%`,
                height: '100%',
                background: '#2563eb',
              }}
            />
          </div>
        </div>
      ) : (
        <div>{statusMessage}</div>
      )}
    </section>
  );
}

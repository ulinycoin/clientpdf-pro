import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PlatformProvider } from './platform-context';
import { ToolRoutes } from './tool-routes';
import { UxFeedbackOverlay } from './ux-feedback-overlay';
import { TelemetryPanel } from './telemetry-panel';
import { StudioTopNav } from './studio-top-nav';
import { APP_BASE_PATH } from '../../../shared/app-routes';

export function StudioPlatformShell() {
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const telemetryEnabled = import.meta.env.DEV || new URLSearchParams(window.location.search).get('debug') === '1';

  return (
    <BrowserRouter basename={APP_BASE_PATH} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <PlatformProvider>
        <UxFeedbackOverlay />
        <div className="studio-app-layout">
          <StudioTopNav
            telemetryEnabled={telemetryEnabled}
            telemetryOpen={telemetryOpen}
            onToggleTelemetry={() => setTelemetryOpen((value) => !value)}
          />
          {telemetryEnabled && telemetryOpen && (
            <section className="studio-telemetry-panel" aria-label="Telemetry panel">
              <TelemetryPanel />
            </section>
          )}
          <main className="studio-main-shell">
            <ToolRoutes />
          </main>
        </div>
      </PlatformProvider>
    </BrowserRouter>
  );
}

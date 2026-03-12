import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { usePlatform } from './platform-context';

const V6WizardShell = lazy(async () => {
  const module = await import('../../v6/components/Wizard/WizardShell');
  return { default: module.WizardShell };
});

const StudioShell = lazy(async () => {
  const module = await import('../../v6/components/Studio/StudioShell');
  return { default: module.StudioShell };
});

const StudioEditWorkspace = lazy(async () => {
  const module = await import('../../v6/components/Studio/StudioEditWorkspace');
  return { default: module.StudioEditWorkspace };
});

const StudioConvertWorkspace = lazy(async () => {
  const module = await import('../../v6/components/Studio/convert/StudioConvertWorkspace');
  return { default: module.StudioConvertWorkspace };
});

const OcrPdfTestPage = lazy(async () => {
  const module = await import('./ocr-pdf-test-page');
  return { default: module.OcrPdfTestPage };
});

function LoadingScreen() {
  return <div>Loading tool...</div>;
}

function EmptyToolsState() {
  return <div>No tools are registered.</div>;
}

export function ToolRoutes() {
  const { routes } = usePlatform();

  if (routes.length === 0) {
    return <EmptyToolsState />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Navigate to="/studio" replace />} />
        {routes.map((toolRoute) => {
          return (
            <Route
              key={toolRoute.toolId}
              path={toolRoute.path}
              element={
                toolRoute.toolId === 'ocr-pdf'
                  ? <OcrPdfTestPage />
                  : <V6WizardShell key={toolRoute.toolId} toolId={toolRoute.toolId} />
              }
            />
          );
        })}
        <Route path="/studio" element={<StudioShell />} />
        <Route path="/studio/edit" element={<StudioEditWorkspace />} />
        <Route path="/studio/convert" element={<StudioConvertWorkspace />} />
        <Route path="/ocr-pdf-test" element={<Navigate to="/ocr-pdf" replace />} />
        <Route path="*" element={<Navigate to="/studio" replace />} />
      </Routes>
    </Suspense>
  );
}

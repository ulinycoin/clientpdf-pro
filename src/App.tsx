import { useState, useEffect, lazy, Suspense } from 'react';
import { useHashRouter } from '@/hooks/useHashRouter';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Sidebar } from '@/components/layout/Sidebar';
import type { Theme } from '@/types';

// Lazy load tool components for better performance
// Each tool loads only when user navigates to it
const MergePDF = lazy(() => import('@/components/tools/MergePDF').then(m => ({ default: m.MergePDF })));
const CompressPDF = lazy(() => import('@/components/tools/CompressPDF').then(m => ({ default: m.CompressPDF })));
const SplitPDF = lazy(() => import('@/components/tools/SplitPDF').then(m => ({ default: m.SplitPDF })));
const ProtectPDF = lazy(() => import('@/components/tools/ProtectPDF').then(m => ({ default: m.ProtectPDF })));
const OCRPDF = lazy(() => import('@/components/tools/OCRPDF').then(m => ({ default: m.OCRPDF })));
const WatermarkPDF = lazy(() => import('@/components/tools/WatermarkPDF').then(m => ({ default: m.WatermarkPDF })));
const RotatePDF = lazy(() => import('@/components/tools/RotatePDF').then(m => ({ default: m.RotatePDF })));
const DeletePagesPDF = lazy(() => import('@/components/tools/DeletePagesPDF').then(m => ({ default: m.DeletePagesPDF })));
const ExtractPagesPDF = lazy(() => import('@/components/tools/ExtractPagesPDF').then(m => ({ default: m.ExtractPagesPDF })));
const AddTextPDF = lazy(() => import('@/components/tools/AddTextPDF').then(m => ({ default: m.AddTextPDF })));
const ImagesToPDF = lazy(() => import('@/components/tools/ImagesToPDF').then(m => ({ default: m.ImagesToPDF })));
const PDFToImages = lazy(() => import('@/components/tools/PDFToImages').then(m => ({ default: m.PDFToImages })));
const WordToPDF = lazy(() => import('@/components/tools/WordToPDF').then(m => ({ default: m.WordToPDF })));
const PDFToWord = lazy(() => import('@/components/tools/PDFToWord').then(m => ({ default: m.PDFToWord })));

// Loading component for lazy loaded tools
const ToolLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-ocean-500 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300 text-lg">Loading tool...</p>
    </div>
  </div>
);

function App() {
  // Routing
  const { currentTool, setCurrentTool, context } = useHashRouter();

  // Theme management
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'dark';
  });

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar_collapsed');
    // On mobile (screen width < 1024px), collapse by default
    const isMobile = window.innerWidth < 1024;

    if (stored !== null) {
      return stored === 'true';
    }

    return isMobile;
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-privacy-900 transition-colors duration-200">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-privacy-900 border-b border-gray-200 dark:border-privacy-700">
        <div className="flex items-center justify-between h-16 pr-4">
          {/* Logo - aligned with sidebar */}
          <div className="flex items-center gap-3 pl-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-privacy-800 transition-colors"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="text-2xl">☰</span>
            </button>
            <a
              href="/"
              className="text-xl font-bold text-gradient-ocean hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                setCurrentTool(null);
                window.location.hash = '';
              }}
            >
              LocalPDF
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-privacy-800 transition-colors"
              aria-label="Toggle theme"
            >
              <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar
        currentTool={currentTool}
        onToolSelect={setCurrentTool}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        {!currentTool ? (
          <WelcomeScreen
            context={context}
            onToolSelect={setCurrentTool}
          />
        ) : (
          <div className="container-responsive py-8">
            <Suspense fallback={<ToolLoading />}>
              {currentTool === 'merge-pdf' ? (
                <MergePDF />
              ) : currentTool === 'compress-pdf' ? (
                <CompressPDF />
              ) : currentTool === 'split-pdf' ? (
                <SplitPDF />
              ) : currentTool === 'protect-pdf' ? (
                <ProtectPDF />
              ) : currentTool === 'ocr-pdf' ? (
                <OCRPDF />
              ) : currentTool === 'watermark-pdf' ? (
                <WatermarkPDF />
              ) : currentTool === 'rotate-pdf' ? (
                <RotatePDF />
              ) : currentTool === 'delete-pages-pdf' ? (
                <DeletePagesPDF />
              ) : currentTool === 'extract-pages-pdf' ? (
                <ExtractPagesPDF />
              ) : currentTool === 'add-text-pdf' ? (
                <AddTextPDF />
              ) : currentTool === 'images-to-pdf' ? (
                <ImagesToPDF />
              ) : currentTool === 'pdf-to-images' ? (
                <PDFToImages />
              ) : currentTool === 'word-to-pdf' ? (
                <WordToPDF />
              ) : currentTool === 'pdf-to-word' ? (
                <PDFToWord />
              ) : (
                <div className="card p-8">
                  <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    Tool Not Implemented
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This tool is coming soon.
                  </p>
                  <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800 rounded-lg p-6">
                    <p className="text-center text-ocean-700 dark:text-ocean-300">
                      Tool implementation coming soon...
                    </p>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Tool: {currentTool}
                    </p>
                  </div>
                </div>
              )}
            </Suspense>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 flex justify-center">
        <a
          href="https://localpdf.online"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-privacy-700 hover:bg-ocean-500 hover:text-white dark:hover:bg-ocean-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          <span className="text-lg">←</span>
          <span>Back to main site</span>
        </a>
      </footer>
    </div>
  );
}

export default App;

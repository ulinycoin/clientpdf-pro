import { useState, useEffect, lazy, Suspense } from 'react';
import { useHashRouter } from '@/hooks/useHashRouter';
import { useI18n } from '@/hooks/useI18n';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToolGroupNav } from '@/components/layout/ToolGroupNav';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { useSupportId } from '@/hooks/useSupportId';
import { FeedbackDialog } from '@/components/common/FeedbackDialog';
import { ExtensionPromptBanner } from '@/components/common/ExtensionPromptBanner';
import { MessageSquare } from 'lucide-react';
import type { Theme, ToolGroup } from '@/types';

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
const ContentEditorPDF = lazy(() => import('@/components/tools/ContentEditorPDF').then(m => ({ default: m.ContentEditorPDF })));
const AddFormFieldsPDF = lazy(() => import('@/components/tools/AddFormFieldsPDF').then(m => ({ default: m.AddFormFieldsPDF })));
const ImagesToPDF = lazy(() => import('@/components/tools/ImagesToPDF').then(m => ({ default: m.ImagesToPDF })));
const PDFToImages = lazy(() => import('@/components/tools/PDFToImages').then(m => ({ default: m.PDFToImages })));
const WordToPDF = lazy(() => import('@/components/tools/WordToPDF').then(m => ({ default: m.WordToPDF })));
const PDFToWord = lazy(() => import('@/components/tools/PDFToWord').then(m => ({ default: m.PDFToWord })));
const SignPDF = lazy(() => import('@/components/tools/SignPDF').then(m => ({ default: m.SignPDF })));
const FlattenPDF = lazy(() => import('@/components/tools/FlattenPDF').then(m => ({ default: m.FlattenPDF })));
const ExtractImagesPDF = lazy(() => import('@/components/tools/ExtractImagesPDF').then(m => ({ default: m.ExtractImagesPDF })));
const PageEditorPDF = lazy(() => import('@/components/tools/PageEditorPDF').then(m => ({ default: m.PageEditorPDF })));
const TablesPDF = lazy(() => import('@/components/tools/TablesPDF').then(m => ({ default: m.TablesPDF })));

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
  const { t } = useI18n();
  const supportId = useSupportId();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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

  // Tool group selection state
  const [selectedGroup, setSelectedGroup] = useState<ToolGroup>(() => {
    const stored = localStorage.getItem('selected_tool_group') as ToolGroup;
    return stored || 'all';
  });

  useEffect(() => {
    localStorage.setItem('selected_tool_group', selectedGroup);
  }, [selectedGroup]);

  useEffect(() => {
    const handleDownloadClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;
      if (!anchor.hasAttribute('download')) return;
      window.dispatchEvent(new CustomEvent('localpdf:download', {
        detail: { filename: anchor.getAttribute('download') || undefined }
      }));
    };

    document.addEventListener('click', handleDownloadClick, true);
    return () => document.removeEventListener('click', handleDownloadClick, true);
  }, []);


  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app min-h-screen bg-gray-50 dark:bg-privacy-900 transition-colors duration-200">
      {/* Global Liquid Glass Filter */}
      <svg style={{ position: 'fixed', top: '-100%', left: '-100%', width: 0, height: 0 }}>
        <filter id="liquid-refraction" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="turbulence" baseFrequency="0.003" numOctaves="2" result="noise" seed="2" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="distorted" />
          <feColorMatrix in="distorted" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feOffset in="red" dx="0.6" dy="0" result="red_offset" />
          <feColorMatrix in="distorted" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
          <feColorMatrix in="distorted" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
          <feOffset in="blue" dx="-0.6" dy="0" result="blue_offset" />
          <feBlend in="red_offset" in2="green" mode="screen" result="rg" />
          <feBlend in="rg" in2="blue_offset" mode="screen" />
        </filter>
      </svg>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/20 dark:border-white/10 overflow-hidden">
        <div className="card-glass"></div>
        <div className="flex items-center justify-between h-full pr-4 relative z-10">
          {/* Logo - aligned with sidebar */}
          <div className="flex items-center gap-3 pl-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hover:bg-black/5 dark:hover:bg-white/10"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="text-2xl">☰</span>
            </Button>
            <a
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                setCurrentTool(null);
                window.location.hash = '';
              }}
            >
              <img src="/logos/localpdf-header-64x64.png" alt="LocalPDF" className="logo-image" />
              <div className="logo-text">
                <div className="logo-title">LocalPDF</div>
                <div className="logo-subtitle">Sanctuary</div>
              </div>
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Support Developer Button */}
            <a
              href="https://www.buymeacoffee.com/localpdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue dark:text-accent-light border border-accent-blue/20 hover:border-accent-blue/40 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] font-medium text-sm group relative overflow-hidden"
              aria-label={t('common.supportDeveloper')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="text-lg relative z-10 transition-transform duration-500 group-hover:rotate-[12deg]">☕</span>
              <span className="relative z-10">{t('common.supportDeveloper')}</span>
            </a>

            {/* Feedback Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFeedbackOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-ocean-500/10 hover:bg-ocean-500/20 text-ocean-600 dark:text-ocean-400 border border-ocean-500/20 hover:border-ocean-500/40 rounded-lg transition-all duration-300 font-medium text-sm group"
            >
              <MessageSquare size={16} className="transition-transform group-hover:scale-110" />
              <span className="hidden md:inline">{t('common.feedback')}</span>
            </Button>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Toggle theme"
            >
              <span className="text-xl">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Tool Group Navigation */}
      <ToolGroupNav
        selectedGroup={selectedGroup}
        onGroupSelect={setSelectedGroup}
      />

      {/* Sidebar */}
      <Sidebar
        currentTool={currentTool}
        onToolSelect={setCurrentTool}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        selectedGroup={selectedGroup}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Main content */}
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`} style={{ paddingTop: '8rem' }}>
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
              ) : currentTool === 'edit-pdf' ? (
                <ContentEditorPDF />
              ) : currentTool === 'add-form-fields-pdf' ? (
                <AddFormFieldsPDF />
              ) : currentTool === 'images-to-pdf' ? (
                <ImagesToPDF />
              ) : currentTool === 'pdf-to-images' ? (
                <PDFToImages />
              ) : currentTool === 'word-to-pdf' ? (
                <WordToPDF />
              ) : currentTool === 'pdf-to-word' ? (
                <PDFToWord />
              ) : currentTool === 'sign-pdf' ? (
                <SignPDF />
              ) : currentTool === 'flatten-pdf' ? (
                <FlattenPDF />
              ) : currentTool === 'extract-images-pdf' ? (
                <ExtractImagesPDF />
              ) : currentTool === 'tables-pdf' ? (
                <TablesPDF />
              ) : currentTool === 'organize-pdf' ? (
                <PageEditorPDF />
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
      <ExtensionPromptBanner />
      <Toaster />
      <FeedbackDialog
        open={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
        supportId={supportId}
        currentTool={currentTool || undefined}
      />
    </div>
  );
}

export default App;

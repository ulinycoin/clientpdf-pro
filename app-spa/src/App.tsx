import { useState, useEffect } from 'react';
import { useHashRouter } from '@/hooks/useHashRouter';
import { useI18n } from '@/hooks/useI18n';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Sidebar } from '@/components/layout/Sidebar';
import { MergePDF } from '@/components/tools/MergePDF';
import { CompressPDF } from '@/components/tools/CompressPDF';
import { SplitPDF } from '@/components/tools/SplitPDF';
import { ProtectPDF } from '@/components/tools/ProtectPDF';
import type { Theme } from '@/types';

function App() {
  // Routing
  const { currentTool, setCurrentTool, context } = useHashRouter();

  // Internationalization
  const { language, setLanguage, t } = useI18n();

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
    return stored === 'true';
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
        <div className="container-responsive flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-privacy-800 transition-colors"
              aria-label={sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            >
              <span className="text-2xl">☰</span>
            </button>
            <h1 className="text-xl font-bold text-gradient-ocean">
              {t('app.title')}
            </h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-privacy-800 border border-gray-300 dark:border-privacy-600 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="de">Deutsch</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
            </select>

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
            {currentTool === 'merge-pdf' ? (
              <MergePDF />
            ) : currentTool === 'compress-pdf' ? (
              <CompressPDF />
            ) : currentTool === 'split-pdf' ? (
              <SplitPDF />
            ) : currentTool === 'protect-pdf' ? (
              <ProtectPDF />
            ) : (
              <div className="card p-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  {t(`tools.${currentTool}.name`)}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t(`tools.${currentTool}.description`)}
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <a
          href="https://localpdf.online"
          className="hover:text-ocean-500 transition-colors"
        >
          {t('sidebar.backToMain')}
        </a>
      </footer>
    </div>
  );
}

export default App;

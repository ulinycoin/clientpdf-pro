import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { I18nProvider, useI18n } from './hooks/useI18n';
import { DarkModeProvider } from './components/providers/DarkModeProvider';
import { EntityProvider } from './components/providers/EntityProvider';
import ScrollToTop from './components/ScrollToTop';
import AnalyticsProviders from './components/Analytics';

import { routes, supportedLanguages, defaultLanguage } from './config/routes';

// Loading component for lazy loaded pages
const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-mesh">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-secondary-600 text-lg">Loading LocalPDF...</p>
      </div>
    </div>
  );
};

// A component to enforce a trailing slash on URLs that need it (e.g., /de -> /de/)
const TrailingSlashRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to={`${location.pathname}/`} replace />;
};

// Entity-aware wrapper for route components
const EntityAwareRoute: React.FC<{ children: React.ReactNode; path: string }> = ({ children, path }) => {
  const { currentLanguage } = useI18n();

  // Determine if this is a tool page and extract tool ID
  const isToolPage = path.includes('/tools/') ||
                     path.includes('merge-pdf') || path.includes('split-pdf') ||
                     path.includes('compress-pdf') || path.includes('watermark-pdf') ||
                     path.includes('rotate-pdf') || path.includes('extract-pages-pdf') ||
                     path.includes('extract-text-pdf') || path.includes('add-text-pdf') ||
                     path.includes('word-to-pdf') || path.includes('excel-to-pdf') ||
                     path.includes('images-to-pdf') || path.includes('pdf-to-image') ||
                     path.includes('ocr-pdf');

  // Extract tool ID from path
  const toolMatch = path.match(/\/([\w-]+(?:-pdf|-to-pdf))(?:\/|$)/);
  const toolId = toolMatch ? toolMatch[1] : null;

  // Determine if this is a /pdf-hub authority page (English-only)
  const isPdfHubPage = path.includes('/pdf-hub');

  // Determine entity and search context
  const searchContext = path === '/' ? 'homepage' : isToolPage ? 'tool' : 'authority';
  const primaryEntity = isToolPage && toolId ?
    (() => {
      // Import entityHelper dynamically to avoid circular imports
      try {
        const { entityHelper } = require('./utils/entityHelpers');
        return entityHelper.getPrimaryEntityForTool(toolId) || 'LocalPDF';
      } catch {
        return 'LocalPDF';
      }
    })() : 'LocalPDF';

  return (
    <EntityProvider
      primaryEntity={primaryEntity}
      language={currentLanguage}
      searchContext={searchContext}
      forceEnglish={isPdfHubPage} // Force English for all /pdf-hub routes
    >
      {children}
    </EntityProvider>
  );
};

function App() {
  // Separate routes for ordering (static routes must come before dynamic ones)
  const staticRoutes = routes.filter(r => !r.hasDynamicPath && r.path !== '*');
  const dynamicRoutes = routes.filter(r => r.hasDynamicPath);
  const notFoundRoute = routes.find(r => r.path === '*');

  return (
    <HelmetProvider>
      <DarkModeProvider>
        <AnalyticsProviders>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <I18nProvider>
              <ScrollToTop />
              <div className="min-h-screen bg-gradient-mesh no-horizontal-scroll">
                <React.Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* 1. Redirect language roots to enforce trailing slash for canonicalization */}
                    {supportedLanguages
                      .filter(lang => lang !== defaultLanguage)
                      .map(lang => (
                        <Route key={`redirect-${lang}`} path={`/${lang}`} element={<TrailingSlashRedirect />} />
                      ))}

                    {/* 2. Generate static routes for all languages from the single source of truth */}
                    {staticRoutes.flatMap(({ path, component: Component }) => {
                      const key = path.replace(/[^a-zA-Z0-9]/g, '');
                      const defaultRoute = (
                        <Route
                          key={`en-${key}`}
                          path={path}
                          element={
                            <EntityAwareRoute path={path}>
                              <Component />
                            </EntityAwareRoute>
                          }
                        />
                      );

                      const localizedRoutes = supportedLanguages
                        .filter(lang => lang !== defaultLanguage)
                        .map(lang => {
                          // Handle the homepage case, e.g. /de/
                          const localizedPath = path === '/' ? `/${lang}/` : `/${lang}${path}`;
                          return (
                            <Route
                              key={`${lang}-${key}`}
                              path={localizedPath}
                              element={
                                <EntityAwareRoute path={localizedPath}>
                                  <Component />
                                </EntityAwareRoute>
                              }
                            />
                          );
                        });

                      return [defaultRoute, ...localizedRoutes];
                    })}

                    {/* 3. Generate dynamic routes (e.g., /blog/:slug) for all languages */}
                    {dynamicRoutes.flatMap(({ path, component: Component }) => {
                      const key = path.replace(/[^a-zA-Z0-9]/g, '');
                      const defaultRoute = (
                        <Route
                          key={`en-dynamic-${key}`}
                          path={path}
                          element={
                            <EntityAwareRoute path={path}>
                              <Component />
                            </EntityAwareRoute>
                          }
                        />
                      );

                      const localizedRoutes = supportedLanguages
                        .filter(lang => lang !== defaultLanguage)
                        .map(lang => {
                          const localizedPath = `/${lang}${path}`;
                          return (
                            <Route
                              key={`${lang}-dynamic-${key}`}
                              path={localizedPath}
                              element={
                                <EntityAwareRoute path={localizedPath}>
                                  <Component />
                                </EntityAwareRoute>
                              }
                            />
                          );
                        });

                      return [defaultRoute, ...localizedRoutes];
                    })}

                    {/* 4. Add the 404 not found route, which must be last */}
                    {notFoundRoute && <Route path="*" element={<notFoundRoute.component />} />}
                  </Routes>
                </React.Suspense>
              </div>
              <Analytics />
            </I18nProvider>
          </Router>
        </AnalyticsProviders>
      </DarkModeProvider>
    </HelmetProvider>
  );
}

export default App;

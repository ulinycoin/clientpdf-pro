import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernHeader, ModernFooter } from '../components/organisms';
import { useTranslation, useI18n } from '../hooks/useI18n';
import { SEOHead } from '../components/SEO/SEOHead';
import docsData from '../../localpdf-docs.json';

// Import documentation components
import {
  DocsNavigation,
  LibraryCard,
  DocsToolCard,
  AIOptimizationStats,
  ArchitectureDiagram
} from '../components/docs';

const DocsPage: React.FC = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  const [activeSection, setActiveSection] = useState(section || 'overview');

  useEffect(() => {
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [section]);

  const handleSectionChange = (newSection: string) => {
    setActiveSection(newSection);
    const basePath = currentLanguage === 'en' ? '' : `/${currentLanguage}`;
    navigate(`${basePath}/docs/${newSection}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-2xl p-8">
              <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-seafoam-600 to-ocean-600 bg-clip-text text-transparent">
                {t('docs.overview.title')}
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {docsData.overview.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-gradient-to-br from-seafoam-500/10 to-ocean-500/10 p-6 rounded-xl border border-seafoam-500/20">
                    <div className="text-3xl mb-3">🛠️</div>
                    <div className="text-2xl font-bold text-seafoam-600 dark:text-seafoam-400">
                      {docsData.tools.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('docs.overview.stats.tools')}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/20">
                    <div className="text-3xl mb-3">🌍</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {docsData.multilingual.supportedLanguages.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('docs.overview.stats.languages')}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-xl border border-green-500/20">
                    <div className="text-3xl mb-3">🤖</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {docsData.aiOptimization.crawlerStats.chatGPT}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t('docs.overview.stats.aiTraffic')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tools':
        return (
          <div className="space-y-8">
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-2xl p-8">
              <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-seafoam-600 to-ocean-600 bg-clip-text text-transparent">
                {t('docs.tools.title')}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                {t('docs.tools.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docsData.tools.map((tool, index) => (
                  <DocsToolCard key={index} tool={tool} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'libraries':
        return (
          <div className="space-y-8">
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-2xl p-8">
              <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-seafoam-600 to-ocean-600 bg-clip-text text-transparent">
                {t('docs.libraries.title')}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                {t('docs.libraries.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {docsData.libraries.map((library, index) => (
                  <LibraryCard key={index} library={library} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'architecture':
        return (
          <div className="space-y-8">
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-2xl p-8">
              <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-seafoam-600 to-ocean-600 bg-clip-text text-transparent">
                {t('docs.architecture.title')}
              </h2>
              <ArchitectureDiagram />

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('docs.architecture.components.title')}
                  </h3>
                  <div className="space-y-4">
                    {docsData.components.map((component, index) => (
                      <div key={index} className="bg-white/5 dark:bg-gray-800/5 p-4 rounded-lg border border-white/10">
                        <h4 className="font-semibold text-seafoam-600 dark:text-seafoam-400 capitalize">
                          {component.category}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {component.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {component.components.map((comp, idx) => (
                            <span key={idx} className="text-xs bg-seafoam-100 dark:bg-seafoam-900/20 text-seafoam-700 dark:text-seafoam-300 px-2 py-1 rounded">
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('docs.architecture.performance.title')}
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 dark:bg-gray-800/5 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400">
                        {t('docs.architecture.performance.buildSystem')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {docsData.performance.buildSystem}
                      </p>
                    </div>
                    <div className="bg-white/5 dark:bg-gray-800/5 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400">
                        {t('docs.architecture.performance.loadTime')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {docsData.performance.loadTime}
                      </p>
                    </div>
                    <div className="bg-white/5 dark:bg-gray-800/5 p-4 rounded-lg border border-white/10">
                      <h4 className="font-semibold text-purple-600 dark:text-purple-400">
                        {t('docs.architecture.performance.privacy')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {docsData.performance.privacy}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'ai-optimization':
        return (
          <div className="space-y-8">
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-2xl p-8">
              <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-seafoam-600 to-ocean-600 bg-clip-text text-transparent">
                {t('docs.aiOptimization.title')}
              </h2>
              <AIOptimizationStats stats={docsData.aiOptimization} />
            </div>
          </div>
        );

      case 'multilingual':
        return (
          <div className="space-y-8">
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg border border-white/20 dark:border-gray-700/30 rounded-2xl p-8">
              <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-seafoam-600 to-ocean-600 bg-clip-text text-transparent">
                {t('docs.multilingual.title')}
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                {t('docs.multilingual.description')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docsData.multilingual.structure.map((lang, index) => (
                  <div key={index} className="bg-white/5 dark:bg-gray-800/5 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-lg flex items-center justify-center text-white text-sm font-bold mr-3">
                        {lang.code.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{lang.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {lang.toolsTranslated} {t('docs.multilingual.toolsTranslated')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={lang.exampleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-seafoam-600 dark:text-seafoam-400 hover:text-seafoam-700 dark:hover:text-seafoam-300 text-sm underline"
                    >
                      {t('docs.multilingual.viewExample')}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('docs.notFound.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('docs.notFound.description')}
            </p>
          </div>
        );
    }
  };

  // Generate multilingual canonical URL - each language points to itself
  const canonicalUrl = currentLanguage === 'en'
    ? `https://localpdf.online/docs${section ? `/${section}` : ''}`
    : `https://localpdf.online/${currentLanguage}/docs${section ? `/${section}` : ''}`;

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `LocalPDF Documentation - ${activeSection}`,
    "description": "Complete documentation for LocalPDF - Privacy-first PDF tools with multilingual support",
    "url": canonicalUrl,
    "author": {
      "@type": "Organization",
      "name": "LocalPDF"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LocalPDF",
      "url": "https://localpdf.online"
    },
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "LocalPDF",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Web Browser",
      "description": "Privacy-first PDF tools with 16 utilities in 5 languages",
      "url": "https://localpdf.online",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  };

  return (
    <>
      <SEOHead
        title={t('docs.meta.title', { section: t(`docs.sections.${activeSection}`) })}
        description={t('docs.meta.description')}
        keywords={t('docs.meta.keywords')}
        canonical={canonicalUrl}
        ogType="article"
        structuredData={structuredData}
        includeHreflang={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex flex-col">
        <ModernHeader />

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-seafoam-500/20 to-ocean-500/20 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-1/3 left-1/5 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumb" className="mb-8">
                <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <a href={currentLanguage === 'en' ? '/' : `/${currentLanguage}`} className="hover:text-seafoam-600 dark:hover:text-seafoam-400">
                      {t('common.home')}
                    </a>
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mx-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-900 dark:text-gray-200 font-medium">
                      {t('docs.title')}
                    </span>
                  </li>
                  {section && (
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mx-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-seafoam-600 dark:text-seafoam-400 font-medium">
                        {t(`docs.sections.${activeSection}`)}
                      </span>
                    </li>
                  )}
                </ol>
              </nav>

              {/* Page Header */}
              <div className="text-center mb-16">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-gray-900 via-seafoam-green to-ocean-blue dark:from-white dark:via-seafoam-200 dark:to-ocean-200 bg-clip-text text-transparent leading-tight">
                  {t('docs.title')}
                </h1>
                <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  {t('docs.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Main Documentation Content */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                  <DocsNavigation
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                  />
                </div>

                {/* Content Area */}
                <div className="flex-grow">
                  {renderContent()}
                </div>
              </div>
            </div>
          </section>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default DocsPage;
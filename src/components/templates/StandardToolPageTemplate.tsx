import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ModernHeader,
  ModernFooter
} from '../organisms';
import SEOHead from '../SEO/SEOHead';
import TwitterCardImage from '../TwitterCardImage/TwitterCardImage';
import Breadcrumbs from '../common/Breadcrumbs';
import { useTranslation } from '../../hooks/useI18n';

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  structuredData: any;
}

export interface StandardToolPageTemplateProps {
  // SEO Props
  seoData: SEOData;
  toolId: string;
  faqSchema?: Array<{ question: string; answer: string }>;
  
  // Page Content
  pageTitle: string;
  pageDescription: string;
  toolComponent: React.ReactNode;
  
  // Optional Sections
  howToSection?: React.ReactNode;
  faqSection?: React.ReactNode;
  relatedToolsSection?: React.ReactNode;
  
  // Breadcrumbs
  breadcrumbKey: string;
  
  // Layout Props
  className?: string;
  showSectionsWhenToolActive?: boolean;
}

const StandardToolPageTemplate: React.FC<StandardToolPageTemplateProps> = ({
  seoData,
  toolId,
  faqSchema,
  pageTitle,
  pageDescription,
  toolComponent,
  howToSection,
  faqSection,
  relatedToolsSection,
  breadcrumbKey,
  className = '',
  showSectionsWhenToolActive = false
}) => {
  const { t } = useTranslation();
  return (
    <>
      {/* SEO HEAD - КРИТИЧНО: НЕ ТРОГАТЬ */}
      <SEOHead
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonical={seoData.canonical}
        structuredData={seoData.structuredData}
        faqSchema={faqSchema}
      />
      <TwitterCardImage toolId={toolId} />

      {/* MODERN LAYOUT */}
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex flex-col ${className}`}>
        <ModernHeader />

        <main className="flex-grow">
          {/* Hero Section with Glassmorphism */}
          <section className="relative py-20 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-seafoam-500/20 to-ocean-500/20 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-1/3 left-1/5 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Breadcrumbs */}
              <div className="mb-8">
                <nav aria-label="Breadcrumb" className="text-gray-600 dark:text-gray-400">
                  <ol className="flex items-center space-x-2 text-sm">
                    <li>
                      <span className="text-gray-400">{t('toolTemplate.breadcrumbs.home')}</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mx-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-200 font-medium">{pageTitle}</span>
                    </li>
                  </ol>
                </nav>
              </div>

              {/* Page Header */}
              <div className="text-center mb-16">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-12 bg-gradient-to-r from-gray-900 via-seafoam-green to-ocean-blue dark:from-white dark:via-seafoam-200 dark:to-ocean-200 bg-clip-text text-transparent leading-tight">
                  {pageTitle}
                </h1>
                <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  {pageDescription}
                </p>
              </div>
            </div>
          </section>

          {/* Quick Steps Section */}
          <section className="relative py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 via-seafoam-green to-ocean-blue dark:from-white dark:via-seafoam-200 dark:to-ocean-200 bg-clip-text text-transparent">
                  {t('toolTemplate.quickSteps.title')}
                </h2>
                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                  {t('toolTemplate.quickSteps.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  {
                    number: '01',
                    title: t('toolTemplate.quickSteps.steps.upload.title'),
                    description: t('toolTemplate.quickSteps.steps.upload.description'),
                    icon: '📁',
                    color: 'from-seafoam-500 to-ocean-500'
                  },
                  {
                    number: '02', 
                    title: t('toolTemplate.quickSteps.steps.process.title'),
                    description: t('toolTemplate.quickSteps.steps.process.description'),
                    icon: '⚙️',
                    color: 'from-ocean-500 to-purple-500'
                  },
                  {
                    number: '03',
                    title: t('toolTemplate.quickSteps.steps.download.title'),
                    description: t('toolTemplate.quickSteps.steps.download.description'),
                    icon: '⬇️',
                    color: 'from-purple-500 to-seafoam-500'
                  }
                ].map((step, index) => (
                  <div
                    key={step.number}
                    className="group relative"
                  >
                    <div className="
                      bg-white/10 dark:bg-gray-800/10 backdrop-blur-lg 
                      border border-white/20 dark:border-gray-700/30
                      rounded-2xl p-6 text-center
                      hover:bg-white/15 dark:hover:bg-gray-800/15
                      hover:scale-105 hover:shadow-2xl
                      transition-all duration-300
                      group-hover:border-seafoam-400/50
                    ">
                      {/* Step Number */}
                      <div className="relative mb-4">
                        <div className={`
                          w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color}
                          flex items-center justify-center shadow-lg
                          group-hover:scale-110 transition-transform duration-300
                        `}>
                          <span className="text-2xl">{step.icon}</span>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                          <span className="text-xs font-bold text-white">{step.number}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-seafoam-600 dark:group-hover:text-seafoam-200 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Connector Line - except for last item */}
                    {index < 2 && (
                      <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-gradient-to-r from-seafoam-400/50 to-ocean-400/50 z-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tool Section */}
          <section className="relative py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="
                bg-white/10 dark:bg-gray-800/10 backdrop-blur-xl 
                border border-white/20 dark:border-gray-700/30
                rounded-3xl shadow-2xl shadow-black/10 p-8 md:p-12
              ">
                {toolComponent}
              </div>
            </div>
          </section>

          {/* SEO Content Section */}
          <section className="py-16 bg-white/5 dark:bg-gray-800/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Преимущества */}
                <div className="bg-white/70 dark:bg-gray-800/10 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/30 rounded-2xl p-8 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-seafoam-500 to-ocean-500 rounded-xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg">
                    ⚡
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                    {t('toolTemplate.benefits.advantages.title')}
                  </h3>
                  <ul className="text-gray-700 dark:text-gray-400 space-y-2 text-sm leading-relaxed">
                    <li>• {t('toolTemplate.benefits.advantages.items.speed')}</li>
                    <li>• {t('toolTemplate.benefits.advantages.items.quality')}</li>
                    <li>• {t('toolTemplate.benefits.advantages.items.simplicity')}</li>
                    <li>• {t('toolTemplate.benefits.advantages.items.universal')}</li>
                  </ul>
                </div>

                {/* Безопасность */}
                <div className="bg-white/70 dark:bg-gray-800/10 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/30 rounded-2xl p-8 shadow-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg">
                    🔒
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                    {t('toolTemplate.benefits.security.title')}
                  </h3>
                  <ul className="text-gray-700 dark:text-gray-400 space-y-2 text-sm leading-relaxed">
                    <li>• {t('toolTemplate.benefits.security.items.local')}</li>
                    <li>• {t('toolTemplate.benefits.security.items.noUpload')}</li>
                    <li>• {t('toolTemplate.benefits.security.items.noRegistration')}</li>
                    <li>• {t('toolTemplate.benefits.security.items.autoDelete')}</li>
                  </ul>
                </div>

                {/* Технические особенности */}
                <div className="bg-white/70 dark:bg-gray-800/10 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/30 rounded-2xl p-8 shadow-lg md:col-span-2 lg:col-span-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg">
                    🛠️
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">
                    {t('toolTemplate.benefits.technical.title')}
                  </h3>
                  <ul className="text-gray-700 dark:text-gray-400 space-y-2 text-sm leading-relaxed">
                    <li>• {t('toolTemplate.benefits.technical.items.technology')}</li>
                    <li>• {t('toolTemplate.benefits.technical.items.crossplatform')}</li>
                    <li>• {t('toolTemplate.benefits.technical.items.quality')}</li>
                    <li>• {t('toolTemplate.benefits.technical.items.metadata')}</li>
                  </ul>
                </div>

              </div>
            </div>
          </section>

          {/* Detailed Information Section */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/70 dark:bg-gray-800/10 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/30 rounded-2xl p-8 md:p-12 shadow-lg">
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 bg-gradient-to-r from-gray-900 via-seafoam-green to-ocean-blue dark:from-white dark:via-seafoam-200 dark:to-ocean-200 bg-clip-text text-transparent text-center">
                  {t('toolTemplate.detailed.title')}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">{t('toolTemplate.detailed.business.title')}</h3>
                    <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
                      {t('toolTemplate.detailed.business.description1')}
                    </p>
                    <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                      {t('toolTemplate.detailed.business.description2')}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">{t('toolTemplate.detailed.personal.title')}</h3>
                    <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
                      {t('toolTemplate.detailed.personal.description1')}
                    </p>
                    <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                      {t('toolTemplate.detailed.personal.description2')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Conditional Sections */}
          {(howToSection || faqSection || relatedToolsSection) && (
            <section className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                {howToSection}
                {faqSection}
                {relatedToolsSection}
              </div>
            </section>
          )}
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default StandardToolPageTemplate;
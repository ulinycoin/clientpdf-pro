import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../hooks/useI18n';
import { ArrowLeft } from 'lucide-react';
import LanguageSwitcher from '../components/molecules/LanguageSwitcher';

const GDPRPage: React.FC = () => {
  const { t, language } = useTranslation();
  
  const currentYear = new Date().getFullYear();
  const baseUrl = language === 'en' ? 'https://localpdf.online' : `https://localpdf.online/${language}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t('pages.gdpr.title'),
    "description": t('pages.gdpr.description'),
    "url": `${baseUrl}/pages.gdpr`,
    "inLanguage": language,
    "isPartOf": {
      "@type": "WebSite",
      "name": "LocalPDF",
      "url": baseUrl
    },
    "author": {
      "@type": "Organization",
      "name": "LocalPDF",
      "url": baseUrl
    },
    "datePublished": "2024-01-15",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  return (
    <>
      <Helmet>
        <title>{t('pages.gdpr.title')}</title>
        <meta name="description" content={t('pages.gdpr.description')} />
        <link rel="canonical" href={`${baseUrl}/pages.gdpr`} />
        
        {/* Hreflang tags */}
        <link rel="alternate" hreflang="en" href="https://localpdf.online/pages.gdpr" />
        <link rel="alternate" hreflang="de" href="https://localpdf.online/de/pages.gdpr" />
        <link rel="alternate" hreflang="fr" href="https://localpdf.online/fr/pages.gdpr" />
        <link rel="alternate" hreflang="es" href="https://localpdf.online/es/pages.gdpr" />
        <link rel="alternate" hreflang="ru" href="https://localpdf.online/ru/pages.gdpr" />
        <link rel="alternate" hreflang="x-default" href="https://localpdf.online/pages.gdpr" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('pages.gdpr.title')} />
        <meta property="og:description" content={t('pages.gdpr.description')} />
        <meta property="og:url" content={`${baseUrl}/pages.gdpr`} />
        <meta property="og:site_name" content="LocalPDF" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Navigation Header */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">{t('back')}</span>
            </button>
            
            <LanguageSwitcher variant="compact" className="ml-auto" />
          </div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('pages.gdpr.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('pages.gdpr.description')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {t('pages.gdpr.lastUpdated')}: {currentYear}-01-15
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 backdrop-blur-sm bg-opacity-70 dark:bg-opacity-70 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="p-8 space-y-8">
              
              {/* Introduction */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                  {t('pages.gdpr.sections.introduction.title')}
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('pages.gdpr.sections.introduction.content')}
                  </p>
                </div>
              </section>

              {/* Local Processing */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>
                  {t('pages.gdpr.sections.localProcessing.title')}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('pages.gdpr.sections.localProcessing.content')}
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pages.gdpr.sections.localProcessing.benefits.0')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pages.gdpr.sections.localProcessing.benefits.1')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pages.gdpr.sections.localProcessing.benefits.2')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {t('pages.gdpr.sections.localProcessing.benefits.3')}
                  </li>
                </ul>
              </section>

              {/* Your Rights */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
                  {t('pages.gdpr.sections.rights.title')}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('pages.gdpr.sections.rights.content')}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('pages.gdpr.sections.rights.list.access.title')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.gdpr.sections.rights.list.access.description')}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('pages.gdpr.sections.rights.list.portability.title')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.gdpr.sections.rights.list.portability.description')}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('pages.gdpr.sections.rights.list.erasure.title')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.gdpr.sections.rights.list.erasure.description')}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {t('pages.gdpr.sections.rights.list.objection.title')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pages.gdpr.sections.rights.list.objection.description')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Minimization */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
                  {t('pages.gdpr.sections.minimization.title')}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('pages.gdpr.sections.minimization.content')}
                </p>
                <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4 rounded-r-lg">
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {t('pages.gdpr.sections.minimization.emphasis')}
                  </p>
                </div>
              </section>

              {/* Legal Basis */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-8 bg-red-500 rounded-full mr-3"></span>
                  {t('pages.gdpr.sections.legalBasis.title')}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('pages.gdpr.sections.legalBasis.content')}
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <strong>{t('pages.gdpr.sections.legalBasis.bases.consent.title')}:</strong> {t('pages.gdpr.sections.legalBasis.bases.consent.description')}
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <strong>{t('pages.gdpr.sections.legalBasis.bases.legitimate.title')}:</strong> {t('pages.gdpr.sections.legalBasis.bases.legitimate.description')}
                  </li>
                </ul>
              </section>

              {/* Contact */}
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="w-2 h-8 bg-teal-500 rounded-full mr-3"></span>
                  {t('pages.gdpr.sections.contact.title')}
                </h2>
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 p-6 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    {t('pages.gdpr.sections.contact.content')}
                  </p>
                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email: localpdfpro@gmail.com
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      GitHub: https://github.com/ulinycoin/clientpdf-pro
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="/privacy" className="hover:text-blue-500 transition-colors">
                {t('footer.links.privacy')}
              </a>
              <a href="/terms" className="hover:text-blue-500 transition-colors">
                {t('footer.links.terms')}
              </a>
              <a href="/faq" className="hover:text-blue-500 transition-colors">
                {t('footer.links.faq')}
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default GDPRPage;
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ModernHeader, ModernFooter } from '../components/organisms';
import { useTranslation, useI18n } from '../hooks/useI18n';

const GDPRPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();
  
  const currentYear = new Date().getFullYear();
  const baseUrl = currentLanguage === 'en' ? 'https://localpdf.online' : `https://localpdf.online/${currentLanguage}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t('pages.gdpr.title'),
    "description": t('pages.gdpr.description'),
    "url": `${baseUrl}/gdpr`,
    "inLanguage": currentLanguage,
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
        <link rel="canonical" href={`${baseUrl}/gdpr`} />
        
        {/* Hreflang tags */}
        <link rel="alternate" hreflang="en" href="https://localpdf.online/gdpr" />
        <link rel="alternate" hreflang="de" href="https://localpdf.online/de/gdpr" />
        <link rel="alternate" hreflang="fr" href="https://localpdf.online/fr/gdpr" />
        <link rel="alternate" hreflang="es" href="https://localpdf.online/es/gdpr" />
        <link rel="alternate" hreflang="ru" href="https://localpdf.online/ru/gdpr" />
        <link rel="alternate" hreflang="x-default" href="https://localpdf.online/gdpr" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={t('pages.gdpr.title')} />
        <meta property="og:description" content={t('pages.gdpr.description')} />
        <meta property="og:url" content={`${baseUrl}/gdpr`} />
        <meta property="og:site_name" content="LocalPDF" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ModernHeader />

        <main className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 py-16">
          
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                {t('pages.gdpr.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
                {t('pages.gdpr.description')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('pages.gdpr.lastUpdated')}: {currentYear}-01-15
              </p>
            </div>

            <div className="space-y-12">
              
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
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {t('pages.gdpr.sections.contact.content')}
                  </p>

                  {/* Company Information */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Company Information</h3>
                    <div className="space-y-2 text-blue-800 dark:text-blue-400">
                      <p><strong>Company:</strong> {t('pages.terms.sections.contact.company')}</p>
                      <p><strong>Registration:</strong> {t('pages.terms.sections.contact.regNumber')}</p>
                      <p><strong>Support Email:</strong>
                        <a
                          href={`mailto:${t('pages.terms.sections.contact.email')}`}
                          className="ml-2 underline hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                        >
                          {t('pages.terms.sections.contact.email')}
                        </a>
                      </p>
                      <p><strong>Contact Email:</strong>
                        <a
                          href={`mailto:${t('pages.terms.sections.contact.emailContact')}`}
                          className="ml-2 underline hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                        >
                          {t('pages.terms.sections.contact.emailContact')}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <strong>GitHub:</strong>
                      <a
                        href="https://github.com/ulinycoin/clientpdf-pro/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 underline hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        GitHub Issues
                      </a>
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <strong>Website:</strong>
                      <a
                        href="https://localpdf.online"
                        className="ml-2 underline hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                      >
                        localpdf.online
                      </a>
                    </p>
                  </div>
                </div>
              </section>

                </div>
              </div>
              
            </div>
          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default GDPRPage;
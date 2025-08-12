import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/organisms/Header';
import Footer from '../components/organisms/Footer';
import { useTranslation } from '../hooks/useI18n';

const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('pages.terms.title')} - LocalPDF | Privacy-First PDF Tools</title>
        <meta name="description" content="Terms of Service for LocalPDF: Free, open-source PDF tools with complete privacy protection. No registration required, all processing happens locally." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://localpdf.online/terms" />

        {/* Open Graph */}
        <meta property="og:title" content={`${t('pages.terms.title')} - LocalPDF`} />
        <meta property="og:description" content="Free and privacy-first PDF tools - read our terms of service" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://localpdf.online/terms" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${t('pages.terms.title')} - LocalPDF`} />
        <meta name="twitter:description" content="Terms of service for the most privacy-focused PDF tools" />

        {/* Structured Data for Legal Page */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": t('pages.terms.title'),
            "description": "Terms of Service for LocalPDF privacy-first PDF tools",
            "url": "https://localpdf.online/terms",
            "publisher": {
              "@type": "Organization",
              "name": "LocalPDF",
              "url": "https://localpdf.online"
            },
            "dateModified": "2025-01-15",
            "inLanguage": "en",
            "isPartOf": {
              "@type": "WebSite",
              "name": "LocalPDF",
              "url": "https://localpdf.online"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
          <div className="glass rounded-2xl shadow-soft border border-white/20 p-8">

            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
                <span className="text-gradient-blue">{t('pages.terms.title')}</span>
              </h1>
              <p className="text-xl text-secondary-600 mb-6">
                {t('pages.terms.subtitle')}
              </p>
              <p className="text-sm text-secondary-500">
                {t('pages.terms.lastUpdated')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">

              {/* Introduction */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    📋
                  </span>
                  {t('pages.terms.sections.introduction.title')}
                </h2>
                <div className="pdf-processing-card border-l-4 border-blue-500 p-6 mb-6">
                  <p className="text-blue-800 text-lg leading-relaxed">
                    {t('pages.terms.sections.introduction.content')}
                  </p>
                </div>
              </section>

              {/* Acceptance */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                    ✅
                  </span>
                  {t('pages.terms.sections.acceptance.title')}
                </h2>
                <p className="text-secondary-700 mb-4 leading-relaxed">
                  {t('pages.terms.sections.acceptance.content')}
                </p>
              </section>

              {/* Service Description */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    🛠️
                  </span>
                  {t('pages.terms.sections.serviceDescription.title')}
                </h2>
                <p className="text-secondary-700 mb-4">
                  {t('pages.terms.sections.serviceDescription.content')}
                </p>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <h3 className="font-semibold text-indigo-800 mb-3">{t('pages.terms.sections.serviceDescription.features.title')}</h3>
                  <ul className="text-indigo-700 space-y-2">
                    {(Array.isArray(t('pages.terms.sections.serviceDescription.features.list')) ? 
                      (t('pages.terms.sections.serviceDescription.features.list') as string[]) : []
                    ).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Usage Rules */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    ⚖️
                  </span>
                  {t('pages.terms.sections.usageRules.title')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="pdf-processing-card border-l-4 border-green-500 p-6">
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                      <span className="mr-2">✅</span>
                      {t('pages.terms.sections.usageRules.allowed.title')}
                    </h3>
                    <ul className="text-green-700 space-y-2">
                      {(Array.isArray(t('pages.terms.sections.usageRules.allowed.items')) ? 
                        (t('pages.terms.sections.usageRules.allowed.items') as string[]) : []
                      ).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pdf-processing-card border-l-4 border-red-500 p-6">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                      <span className="mr-2">❌</span>
                      {t('pages.terms.sections.usageRules.prohibited.title')}
                    </h3>
                    <ul className="text-red-700 space-y-2">
                      {(Array.isArray(t('pages.terms.sections.usageRules.prohibited.items')) ? 
                        (t('pages.terms.sections.usageRules.prohibited.items') as string[]) : []
                      ).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Privacy & Data */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    🔒
                  </span>
                  {t('pages.terms.sections.privacy.title')}
                </h2>
                <div className="pdf-processing-card border-l-4 border-purple-500 p-6">
                  <p className="text-purple-800 font-medium mb-3">
                    {t('pages.terms.sections.privacy.localProcessing')}
                  </p>
                  <p className="text-purple-700 mb-4">
                    {t('pages.terms.sections.privacy.noDataCollection')}
                  </p>
                  <div className="text-sm text-purple-600">
                    <a href="/privacy" className="underline hover:text-purple-800 transition-colors">
                      {t('pages.terms.sections.privacy.privacyPolicyLink')}
                    </a>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                    💎
                  </span>
                  {t('pages.terms.sections.intellectualProperty.title')}
                </h2>
                <div className="space-y-4">
                  <div className="pdf-processing-card p-6">
                    <h3 className="font-semibold text-teal-800 mb-3">{t('pages.terms.sections.intellectualProperty.openSource.title')}</h3>
                    <p className="text-teal-700 mb-3">{t('pages.terms.sections.intellectualProperty.openSource.content')}</p>
                    <a 
                      href="https://github.com/ulinycoin/clientpdf-pro" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-600 underline hover:text-teal-800 transition-colors"
                    >
                      {t('pages.terms.sections.intellectualProperty.openSource.githubLink')}
                    </a>
                  </div>
                  <div className="pdf-processing-card p-6">
                    <h3 className="font-semibold text-teal-800 mb-3">{t('pages.terms.sections.intellectualProperty.userContent.title')}</h3>
                    <p className="text-teal-700">{t('pages.terms.sections.intellectualProperty.userContent.content')}</p>
                  </div>
                </div>
              </section>

              {/* Disclaimers */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    ⚠️
                  </span>
                  {t('pages.terms.sections.disclaimers.title')}
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-yellow-800 font-medium mb-3">
                    {t('pages.terms.sections.disclaimers.asIs')}
                  </p>
                  <p className="text-yellow-700 mb-4">
                    {t('pages.terms.sections.disclaimers.noWarranties')}
                  </p>
                  <ul className="text-yellow-700 space-y-2">
                    {(Array.isArray(t('pages.terms.sections.disclaimers.limitations')) ? 
                      (t('pages.terms.sections.disclaimers.limitations') as string[]) : []
                    ).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    🛡️
                  </span>
                  {t('pages.terms.sections.liability.title')}
                </h2>
                <div className="pdf-processing-card border-l-4 border-gray-500 p-6">
                  <p className="text-gray-800 font-medium mb-3">
                    {t('pages.terms.sections.liability.limitation')}
                  </p>
                  <p className="text-gray-700">
                    {t('pages.terms.sections.liability.maxLiability')}
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    🔄
                  </span>
                  {t('pages.terms.sections.changes.title')}
                </h2>
                <p className="text-secondary-700 mb-4">
                  {t('pages.terms.sections.changes.notification')}
                </p>
                <p className="text-secondary-700">
                  {t('pages.terms.sections.changes.effective')}
                </p>
              </section>

              {/* Contact Information */}
              <section className="pdf-processing-card border-l-4 border-blue-500 p-8">
                <h2 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
                  <span className="mr-3">📧</span>
                  {t('pages.terms.sections.contact.title')}
                </h2>
                <p className="text-blue-700 mb-4">
                  {t('pages.terms.sections.contact.description')}
                </p>
                <div className="space-y-2 text-blue-700">
                  <p><strong>{t('pages.terms.sections.contact.github')}:</strong> 
                    <a 
                      href="https://github.com/ulinycoin/clientpdf-pro/issues" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 underline hover:text-blue-900 transition-colors"
                    >
                      GitHub Issues
                    </a>
                  </p>
                  <p><strong>{t('pages.terms.sections.contact.website')}:</strong> 
                    <a 
                      href="https://localpdf.online" 
                      className="ml-2 underline hover:text-blue-900 transition-colors"
                    >
                      localpdf.online
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsPage;
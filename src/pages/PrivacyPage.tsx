import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/organisms/Header';
import Footer from '../components/organisms/Footer';
import { useTranslation } from '../hooks/useI18n';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('pages.privacy.title')} - LocalPDF | Privacy-First PDF Tools</title>
        <meta name="description" content="LocalPDF's privacy policy: Your files never leave your device. 100% local processing, no data collection, GDPR compliant." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://localpdf.online/privacy" />

        {/* Open Graph */}
        <meta property="og:title" content={`${t('pages.privacy.title')} - LocalPDF`} />
        <meta property="og:description" content="Complete privacy protection with client-side PDF processing" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://localpdf.online/privacy" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${t('pages.privacy.title')} - LocalPDF`} />
        <meta name="twitter:description" content="Your files never leave your device - complete privacy by design" />
      </Helmet>

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
          <div className="glass rounded-2xl shadow-soft border border-white/20 p-8">

            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
                <span className="text-gradient-blue">{t('pages.privacy.title')}</span>
              </h1>
              <p className="text-xl text-secondary-600 mb-6">
                {t('pages.privacy.subtitle')}
              </p>
              <p className="text-sm text-secondary-500">
                {t('pages.privacy.lastUpdated')}
              </p>
            </div>

            <div className="prose prose-lg max-w-none">

              {/* Privacy Commitment */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    🔒
                  </span>
                  {t('pages.privacy.sections.commitment.title')}
                </h2>
                <p className="text-secondary-600 mb-4 text-lg leading-relaxed">
                  {t('pages.privacy.sections.commitment.content')}
                </p>
              </section>

              {/* Simple Answer */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                    📍
                  </span>
                  {t('pages.privacy.sections.simpleAnswer.title')}
                </h2>
                <div className="pdf-processing-card border-l-4 border-success-500 p-6 mb-6">
                  <p className="text-success-800 font-semibold text-lg mb-3">
                    {t('pages.privacy.sections.simpleAnswer.main')}
                  </p>
                  <p className="text-success-700">
                    {t('pages.privacy.sections.simpleAnswer.sub')}
                  </p>
                </div>
              </section>

              {/* What We Don't Do */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center mr-3">
                    🛡️
                  </span>
                  {t('pages.privacy.sections.whatWeDont.title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="pdf-processing-card border-l-4 border-error-500 p-6">
                    <h3 className="font-semibold text-error-800 mb-3 flex items-center">
                      <span className="mr-2">❌</span>
                      {t('pages.privacy.sections.whatWeDont.noDataCollection.title')}
                    </h3>
                    <ul className="text-error-700 space-y-2">
                      {((t('pages.privacy.sections.whatWeDont.noDataCollection.items') as string[]) || []).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pdf-processing-card border-l-4 border-error-500 p-6">
                    <h3 className="font-semibold text-error-800 mb-3 flex items-center">
                      <span className="mr-2">❌</span>
                      {t('pages.privacy.sections.whatWeDont.noFileAccess.title')}
                    </h3>
                    <ul className="text-error-700 space-y-2">
                      {((t('pages.privacy.sections.whatWeDont.noFileAccess.items') as string[]) || []).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* How LocalPDF Works */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    ✅
                  </span>
                  {t('pages.privacy.sections.howItWorks.title')}
                </h2>

                <div className="pdf-processing-card border-l-4 border-blue-500 p-6 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">🖥️</span>
                    {t('pages.privacy.sections.howItWorks.clientSide.title')}
                  </h3>
                  <p className="text-blue-700 mb-3">{t('pages.privacy.sections.howItWorks.clientSide.description')}</p>
                  <ul className="text-blue-700 space-y-2">
                    {((t('pages.privacy.sections.howItWorks.clientSide.items') as string[]) || []).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="pdf-processing-card border-l-4 border-success-500 p-6">
                  <h3 className="font-semibold text-success-800 mb-3 flex items-center">
                    <span className="mr-2">🔄</span>
                    {t('pages.privacy.sections.howItWorks.process.title')}
                  </h3>
                  <ol className="text-success-700 space-y-2">
                    {((t('pages.privacy.sections.howItWorks.process.steps') as string[]) || []).map((step: string, index: number) => (
                      <li key={index}><strong>{index + 1}.</strong> {step}</li>
                    ))}
                  </ol>
                </div>
              </section>

              {/* Analytics Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    📊
                  </span>
                  {t('pages.privacy.sections.analytics.title')}
                </h2>
                <div className="mb-6">
                  <p className="text-secondary-700 mb-4">
                    {t('pages.privacy.sections.analytics.description')}
                  </p>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-4">
                    <h3 className="font-semibold text-indigo-800 mb-3">{t('pages.privacy.sections.analytics.whatWeTrack.title')}</h3>
                    <ul className="text-indigo-700 space-y-2">
                      {((t('pages.privacy.sections.analytics.whatWeTrack.items') as string[]) || []).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-800 mb-3">{t('pages.privacy.sections.analytics.protections.title')}</h3>
                    <ul className="text-green-700 space-y-2">
                      {((t('pages.privacy.sections.analytics.protections.items') as string[]) || []).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* International Compliance */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    🌍
                  </span>
                  {t('pages.privacy.sections.compliance.title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="pdf-processing-card text-center p-6">
                    <div className="text-3xl mb-3">🇪🇺</div>
                    <h3 className="font-semibold text-purple-800 mb-2">{t('pages.privacy.sections.compliance.gdpr.title')}</h3>
                    <p className="text-purple-700 text-sm">{t('pages.privacy.sections.compliance.gdpr.description')}</p>
                  </div>
                  <div className="pdf-processing-card text-center p-6">
                    <div className="text-3xl mb-3">🇺🇸</div>
                    <h3 className="font-semibold text-purple-800 mb-2">{t('pages.privacy.sections.compliance.ccpa.title')}</h3>
                    <p className="text-purple-700 text-sm">{t('pages.privacy.sections.compliance.ccpa.description')}</p>
                  </div>
                  <div className="pdf-processing-card text-center p-6">
                    <div className="text-3xl mb-3">🌐</div>
                    <h3 className="font-semibold text-purple-800 mb-2">{t('pages.privacy.sections.compliance.global.title')}</h3>
                    <p className="text-purple-700 text-sm">{t('pages.privacy.sections.compliance.global.description')}</p>
                  </div>
                </div>
              </section>

              {/* Summary */}
              <section className="pdf-processing-card border-l-4 border-success-500 p-8">
                <h2 className="text-2xl font-semibold text-success-800 mb-4 flex items-center">
                  <span className="mr-3">🎯</span>
                  {t('pages.privacy.sections.summary.title')}
                </h2>
                <p className="text-success-700 text-lg mb-4">
                  {t('pages.privacy.sections.summary.main')}
                </p>
                <p className="text-success-600">
                  {t('pages.privacy.sections.summary.sub')}
                </p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPage;

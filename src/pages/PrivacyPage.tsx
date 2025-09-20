import React from 'react';
import { ModernHeader, ModernFooter } from '../components/organisms';
import { useTranslation, useI18n } from '../hooks/useI18n';
import { SEOHead } from '../components/SEO/SEOHead';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();

  // Generate multilingual canonical URL
  const canonicalUrl = currentLanguage === 'en'
    ? 'https://localpdf.online/privacy'
    : `https://localpdf.online/${currentLanguage}/privacy`;

  return (
    <>
      <SEOHead
        title={`${t('pages.privacy.title')} - LocalPDF | Privacy-First PDF Tools`}
        description="LocalPDF's privacy policy: Your files never leave your device. 100% local processing, no data collection, GDPR compliant."
        canonical={canonicalUrl}
        ogType="website"
        includeHreflang={true}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ModernHeader />

        <main className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 py-16">

            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                {t('pages.privacy.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
                {t('pages.privacy.subtitle')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('pages.privacy.lastUpdated')}
              </p>
            </div>

            <div className="space-y-12">

              {/* Privacy Commitment */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    🔒
                  </span>
                  {t('pages.privacy.sections.commitment.title')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  {t('pages.privacy.sections.commitment.content')}
                </p>
              </section>

              {/* Simple Answer */}
              <section className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    ✨
                  </span>
                  {t('pages.privacy.sections.simpleAnswer.title')}
                </h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-green-300 dark:border-green-600 shadow-sm">
                  <p className="text-green-800 dark:text-green-300 font-bold text-xl mb-3">
                    {t('pages.privacy.sections.simpleAnswer.main')}
                  </p>
                  <p className="text-green-700 dark:text-green-400 text-lg">
                    {t('pages.privacy.sections.simpleAnswer.sub')}
                  </p>
                </div>
              </section>

              {/* What We Don't Do */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    🛡️
                  </span>
                  {t('pages.privacy.sections.whatWeDont.title')}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                    <h3 className="font-bold text-red-800 dark:text-red-300 mb-4 flex items-center text-lg">
                      <span className="mr-3 text-2xl">❌</span>
                      {t('pages.privacy.sections.whatWeDont.noDataCollection.title')}
                    </h3>
                    <ul className="text-red-700 dark:text-red-400 space-y-2">
                      {((t('pages.privacy.sections.whatWeDont.noDataCollection.items') as string[]) || []).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-1 text-sm">●</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                    <h3 className="font-bold text-red-800 dark:text-red-300 mb-4 flex items-center text-lg">
                      <span className="mr-3 text-2xl">❌</span>
                      {t('pages.privacy.sections.whatWeDont.noFileAccess.title')}
                    </h3>
                    <ul className="text-red-700 dark:text-red-400 space-y-2">
                      {((t('pages.privacy.sections.whatWeDont.noFileAccess.items') as string[]) || []).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-1 text-sm">●</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* How LocalPDF Works */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    ⚡
                  </span>
                  {t('pages.privacy.sections.howItWorks.title')}
                </h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center text-lg">
                      <span className="mr-3 text-2xl">🖥️</span>
                      {t('pages.privacy.sections.howItWorks.clientSide.title')}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400 mb-4 text-lg">{t('pages.privacy.sections.howItWorks.clientSide.description')}</p>
                    <ul className="text-blue-700 dark:text-blue-400 space-y-2">
                      {((t('pages.privacy.sections.howItWorks.clientSide.items') as string[]) || []).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2 mt-1 text-sm">▶</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                    <h3 className="font-bold text-green-800 dark:text-green-300 mb-4 flex items-center text-lg">
                      <span className="mr-3 text-2xl">🔄</span>
                      {t('pages.privacy.sections.howItWorks.process.title')}
                    </h3>
                    <ol className="text-green-700 dark:text-green-400 space-y-3">
                      {((t('pages.privacy.sections.howItWorks.process.steps') as string[]) || []).map((step: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-bold flex-shrink-0">{index + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>

              {/* Analytics Section */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    📊
                  </span>
                  {t('pages.privacy.sections.analytics.title')}
                </h2>
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                    {t('pages.privacy.sections.analytics.description')}
                  </p>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                      <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-4 text-lg">{t('pages.privacy.sections.analytics.whatWeTrack.title')}</h3>
                      <ul className="text-purple-700 dark:text-purple-400 space-y-2">
                        {((t('pages.privacy.sections.analytics.whatWeTrack.items') as string[]) || []).map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-500 mr-2 mt-1 text-sm">●</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                      <h3 className="font-bold text-green-800 dark:text-green-300 mb-4 text-lg">{t('pages.privacy.sections.analytics.protections.title')}</h3>
                      <ul className="text-green-700 dark:text-green-400 space-y-2">
                        {((t('pages.privacy.sections.analytics.protections.items') as string[]) || []).map((item: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2 mt-1 text-sm">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* International Compliance */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    🌍
                  </span>
                  {t('pages.privacy.sections.compliance.title')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center border border-blue-200 dark:border-blue-700 hover:shadow-lg transition-shadow">
                    <div className="text-4xl mb-4">🇪🇺</div>
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 text-lg">{t('pages.privacy.sections.compliance.gdpr.title')}</h3>
                    <p className="text-blue-700 dark:text-blue-400">{t('pages.privacy.sections.compliance.gdpr.description')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 text-center border border-red-200 dark:border-red-700 hover:shadow-lg transition-shadow">
                    <div className="text-4xl mb-4">🇺🇸</div>
                    <h3 className="font-bold text-red-800 dark:text-red-300 mb-3 text-lg">{t('pages.privacy.sections.compliance.ccpa.title')}</h3>
                    <p className="text-red-700 dark:text-red-400">{t('pages.privacy.sections.compliance.ccpa.description')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-700 hover:shadow-lg transition-shadow">
                    <div className="text-4xl mb-4">🌐</div>
                    <h3 className="font-bold text-green-800 dark:text-green-300 mb-3 text-lg">{t('pages.privacy.sections.compliance.global.title')}</h3>
                    <p className="text-green-700 dark:text-green-400">{t('pages.privacy.sections.compliance.global.description')}</p>
                  </div>
                </div>
              </section>

              {/* Summary */}
              <section className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-6 flex items-center">
                  <span className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 text-2xl">🎯</span>
                  {t('pages.privacy.sections.summary.title')}
                </h2>
                <p className="text-white/90 text-xl mb-4 leading-relaxed">
                  {t('pages.privacy.sections.summary.main')}
                </p>
                <p className="text-white/80 text-lg">
                  {t('pages.privacy.sections.summary.sub')}
                </p>
              </section>
            </div>
          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default PrivacyPage;

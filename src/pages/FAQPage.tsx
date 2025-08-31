import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ModernHeader, ModernFooter } from '../components/organisms';
import { useTranslation, useI18n } from '../hooks/useI18n';

const FAQPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();

  return (
    <>
      <Helmet>
        <title>{t('pages.faq.title')} - LocalPDF | Privacy-First PDF Tools</title>
        <meta name="description" content="Get answers to common questions about LocalPDF's privacy-first PDF tools. Learn about security, features, and how to use our tools effectively." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://localpdf.online/faq" />

        {/* Open Graph */}
        <meta property="og:title" content={`${t('pages.faq.title')} - LocalPDF`} />
        <meta property="og:description" content="Everything you need to know about LocalPDF's privacy-first PDF tools" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://localpdf.online/faq" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${t('pages.faq.title')} - LocalPDF`} />
        <meta name="twitter:description" content="Your privacy-first PDF toolkit questions answered" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <ModernHeader />

        <main className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 py-16">

            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
                {t('pages.faq.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {t('pages.faq.subtitle')}
              </p>
            </div>

            <div className="space-y-12">

              {/* General Questions */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    📋
                  </span>
                  {t('pages.faq.sections.general.title')}
                </h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                      <span className="text-2xl mr-3">❓</span>
                      {t('pages.faq.sections.general.questions.whatIs.question')}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400 text-lg leading-relaxed">
                      {t('pages.faq.sections.general.questions.whatIs.answer')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4 flex items-center">
                      <span className="text-2xl mr-3">💰</span>
                      {t('pages.faq.sections.general.questions.free.question')}
                    </h3>
                    <p className="text-green-700 dark:text-green-400 text-lg leading-relaxed">
                      {t('pages.faq.sections.general.questions.free.answer')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                    <h3 className="text-xl font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center">
                      <span className="text-2xl mr-3">👤</span>
                      {t('pages.faq.sections.general.questions.account.question')}
                    </h3>
                    <p className="text-purple-700 dark:text-purple-400 text-lg leading-relaxed">
                      {t('pages.faq.sections.general.questions.account.answer')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Privacy & Security */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    🔒
                  </span>
                  {t('pages.faq.sections.privacy.title')}
                </h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-700">
                    <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-4 flex items-center">
                      <span className="text-2xl mr-3">📋</span>
                      {t('pages.faq.sections.privacy.questions.uploaded.question')}
                    </h3>
                    <p className="text-red-700 dark:text-red-400 text-lg leading-relaxed">
                      {t('pages.faq.sections.privacy.questions.uploaded.answer')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
                    <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300 mb-4 flex items-center">
                      <span className="text-2xl mr-3">🗑️</span>
                      {t('pages.faq.sections.privacy.questions.afterUse.question')}
                    </h3>
                    <p className="text-orange-700 dark:text-orange-400 text-lg leading-relaxed">
                      {t('pages.faq.sections.privacy.questions.afterUse.answer')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
                    <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4 flex items-center">
                      <span className="text-2xl mr-3">🛡️</span>
                      {t('pages.faq.sections.privacy.questions.confidential.question')}
                    </h3>
                    <p className="text-green-700 dark:text-green-400 text-lg leading-relaxed">
                      {t('pages.faq.sections.privacy.questions.confidential.answer')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Technical Questions */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    🛠️
                  </span>
                  {t('pages.faq.sections.technical.title')}
                </h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h3 className="text-xl font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                      <span className="text-2xl mr-3">🌐</span>
                      {t('pages.faq.sections.technical.questions.browsers.question')}
                    </h3>
                    <div className="text-blue-700 dark:text-blue-400 text-lg leading-relaxed">
                      {t('pages.faq.sections.technical.questions.browsers.answer')}
                      <ul className="mt-4 space-y-2">
                        {((t('pages.faq.sections.technical.questions.browsers.browsers') as string[]) || []).map((browser: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <span className="text-blue-500 mr-2">✓</span>
                            <span>{browser}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
                    <h3 className="text-xl font-bold text-orange-800 dark:text-orange-300 mb-4 flex items-center">
                      <span className="text-2xl mr-3">📁</span>
                      {t('pages.faq.sections.technical.questions.fileSize.question')}
                    </h3>
                    <p className="text-orange-700 dark:text-orange-400 text-lg leading-relaxed">
                      {t('pages.faq.sections.technical.questions.fileSize.answer')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-300 mb-4 flex items-center">
                      <span className="text-2xl mr-3">🌐</span>
                      {t('pages.faq.sections.technical.questions.offline.question')}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed">
                      {t('pages.faq.sections.technical.questions.offline.answer')}
                    </p>
                  </div>
                </div>
              </section>

              {/* PDF Tools */}
              <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
                  <span className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 text-white text-xl">
                    📄
                  </span>
                  {t('pages.faq.sections.tools.title')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  <div className="pdf-processing-card p-4 text-center">
                    <div className="text-2xl mb-2">🔗</div>
                    <h3 className="font-semibold text-primary-800 mb-1">{t('tools.merge.title')}</h3>
                    <p className="text-secondary-600 text-sm">{t('tools.merge.description')}</p>
                  </div>

                  <div className="pdf-processing-card p-4 text-center">
                    <div className="text-2xl mb-2">✂️</div>
                    <h3 className="font-semibold text-primary-800 mb-1">{t('tools.split.title')}</h3>
                    <p className="text-secondary-600 text-sm">{t('tools.split.description')}</p>
                  </div>

                  <div className="pdf-processing-card p-4 text-center">
                    <div className="text-2xl mb-2">🗜️</div>
                    <h3 className="font-semibold text-primary-800 mb-1">{t('tools.compress.title')}</h3>
                    <p className="text-secondary-600 text-sm">{t('tools.compress.description')}</p>
                  </div>

                  <div className="pdf-processing-card p-4 text-center">
                    <div className="text-2xl mb-2">📝</div>
                    <h3 className="font-semibold text-primary-800 mb-1">{t('tools.addText.title')}</h3>
                    <p className="text-secondary-600 text-sm">{t('tools.addText.description')}</p>
                  </div>

                  <div className="pdf-processing-card p-4 text-center">
                    <div className="text-2xl mb-2">🏷️</div>
                    <h3 className="font-semibold text-primary-800 mb-1">{t('tools.watermark.title')}</h3>
                    <p className="text-secondary-600 text-sm">{t('tools.watermark.description')}</p>
                  </div>

                  <div className="pdf-processing-card p-4 text-center">
                    <div className="text-2xl mb-2">🔄</div>
                    <h3 className="font-semibold text-primary-800 mb-1">{t('tools.rotate.title')}</h3>
                    <p className="text-secondary-600 text-sm">{t('tools.rotate.description')}</p>
                  </div>
                </div>

                <div className="pdf-processing-card border-l-4 border-teal-500 p-6">
                  <h3 className="text-lg font-semibold text-teal-800 mb-3">❓ {t('pages.faq.sections.tools.editText.question')}</h3>
                  <p className="text-teal-700">
                    {t('pages.faq.sections.tools.editText.answer')}
                  </p>
                </div>
              </section>

              {/* Still Need Help */}
              <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold mb-8 flex items-center">
                  <span className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 text-2xl">
                    📞
                  </span>
                  {t('pages.faq.sections.support.title')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <h3 className="font-bold text-white mb-4 flex items-center text-xl">
                      <span className="mr-3 text-2xl">🆘</span>
                      {t('pages.faq.sections.support.gettingSupport.title')}
                    </h3>
                    <ul className="text-white/90 space-y-3">
                      {((t('pages.faq.sections.support.gettingSupport.items') as string[]) || []).map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-white/70 mr-2 mt-1">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <h3 className="font-bold text-white mb-4 flex items-center text-xl">
                      <span className="mr-3 text-2xl">📧</span>
                      {t('pages.faq.sections.support.contact.title')}
                    </h3>
                    <div className="space-y-4">
                      <a
                        href="https://github.com/ulinycoin/clientpdf-pro/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 text-white hover:text-white transition-colors"
                      >
                        {t('pages.faq.sections.support.contact.github')}
                      </a>
                      <a
                        href="https://github.com/ulinycoin/clientpdf-pro/discussions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-white/20 hover:bg-white/30 rounded-lg p-3 text-white hover:text-white transition-colors"
                      >
                        {t('pages.faq.sections.support.contact.discussions')}
                      </a>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default FAQPage;

import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/organisms/Header';
import Footer from '../components/organisms/Footer';
import { useTranslation } from '../hooks/useI18n';

const FAQPage: React.FC = () => {
  const { t } = useTranslation();

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

      <div className="min-h-screen bg-gradient-mesh flex flex-col">
        <Header />

        <main className="flex-grow max-w-4xl mx-auto px-4 py-16">
          <div className="glass rounded-2xl shadow-soft border border-white/20 p-8">

            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">
                <span className="text-gradient-blue">{t('pages.faq.title')}</span>
              </h1>
              <p className="text-xl text-secondary-600">
                {t('pages.faq.subtitle')}
              </p>
            </div>

            <div className="space-y-12">

              {/* General Questions */}
              <section>
                <h2 className="text-2xl font-semibold text-secondary-800 mb-8 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    📋
                  </span>
                  {t('pages.faq.sections.general.title')}
                </h2>

                <div className="space-y-6">
                  <div className="pdf-processing-card border-l-4 border-blue-500 p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">❓ {t('pages.faq.sections.general.questions.whatIs.question')}</h3>
                    <p className="text-blue-700">
                      {t('pages.faq.sections.general.questions.whatIs.answer')}
                    </p>
                  </div>

                  <div className="pdf-processing-card border-l-4 border-success-500 p-6">
                    <h3 className="text-lg font-semibold text-success-800 mb-3">❓ {t('pages.faq.sections.general.questions.free.question')}</h3>
                    <p className="text-success-700">
                      {t('pages.faq.sections.general.questions.free.answer')}
                    </p>
                  </div>

                  <div className="pdf-processing-card border-l-4 border-purple-500 p-6">
                    <h3 className="text-lg font-semibold text-purple-800 mb-3">❓ {t('pages.faq.sections.general.questions.account.question')}</h3>
                    <p className="text-purple-700">
                      {t('pages.faq.sections.general.questions.account.answer')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Privacy & Security */}
              <section>
                <h2 className="text-2xl font-semibold text-secondary-800 mb-8 flex items-center">
                  <span className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                    🔒
                  </span>
                  {t('pages.faq.sections.privacy.title')}
                </h2>

                <div className="space-y-6">
                  <div className="pdf-processing-card border-l-4 border-error-500 p-6">
                    <h3 className="text-lg font-semibold text-error-800 mb-3">❓ {t('pages.faq.sections.privacy.questions.uploaded.question')}</h3>
                    <p className="text-error-700">
                      {t('pages.faq.sections.privacy.questions.uploaded.answer')}
                    </p>
                  </div>

                  <div className="pdf-processing-card border-l-4 border-yellow-500 p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-3">❓ {t('pages.faq.sections.privacy.questions.afterUse.question')}</h3>
                    <p className="text-yellow-700">
                      {t('pages.faq.sections.privacy.questions.afterUse.answer')}
                    </p>
                  </div>

                  <div className="pdf-processing-card border-l-4 border-success-500 p-6">
                    <h3 className="text-lg font-semibold text-success-800 mb-3">❓ {t('pages.faq.sections.privacy.questions.confidential.question')}</h3>
                    <p className="text-success-700">
                      {t('pages.faq.sections.privacy.questions.confidential.answer')}
                    </p>
                  </div>
                </div>
              </section>

              {/* Technical Questions */}
              <section>
                <h2 className="text-2xl font-semibold text-secondary-800 mb-8 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    🛠️
                  </span>
                  {t('pages.faq.sections.technical.title')}
                </h2>

                <div className="space-y-6">
                  <div className="pdf-processing-card border-l-4 border-blue-500 p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">❓ {t('pages.faq.sections.technical.questions.browsers.question')}</h3>
                    <div className="text-blue-700">
                      {t('pages.faq.sections.technical.questions.browsers.answer')}
                      <ul className="mt-3 ml-4 space-y-1">
                        {((t('pages.faq.sections.technical.questions.browsers.browsers') as string[]) || []).map((browser: string, index: number) => (
                          <li key={index}>• {browser}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pdf-processing-card border-l-4 border-orange-500 p-6">
                    <h3 className="text-lg font-semibold text-orange-800 mb-3">❓ {t('pages.faq.sections.technical.questions.fileSize.question')}</h3>
                    <p className="text-orange-700">
                      {t('pages.faq.sections.technical.questions.fileSize.answer')}
                    </p>
                  </div>

                  <div className="pdf-processing-card border-l-4 border-secondary-500 p-6">
                    <h3 className="text-lg font-semibold text-secondary-800 mb-3">❓ {t('pages.faq.sections.technical.questions.offline.question')}</h3>
                    <p className="text-secondary-700">
                      {t('pages.faq.sections.technical.questions.offline.answer')}
                    </p>
                  </div>
                </div>
              </section>

              {/* PDF Tools */}
              <section>
                <h2 className="text-2xl font-semibold text-secondary-800 mb-8 flex items-center">
                  <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
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
              <section className="pdf-processing-card p-8">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-8 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    📞
                  </span>
                  {t('pages.faq.sections.support.title')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-xl">
                    <h3 className="font-semibold text-secondary-800 mb-3 flex items-center">
                      <span className="mr-2">🆘</span>
                      {t('pages.faq.sections.support.gettingSupport.title')}
                    </h3>
                    <ul className="text-secondary-600 space-y-2 text-sm">
                      {((t('pages.faq.sections.support.gettingSupport.items') as string[]) || []).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass p-6 rounded-xl">
                    <h3 className="font-semibold text-secondary-800 mb-3 flex items-center">
                      <span className="mr-2">📧</span>
                      {t('pages.faq.sections.support.contact.title')}
                    </h3>
                    <div className="space-y-3 text-sm">
                      <a
                        href="https://github.com/ulinycoin/clientpdf-pro/issues"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary-600 hover:text-primary-700 transition-colors"
                      >
                        {t('pages.faq.sections.support.contact.github')}
                      </a>
                      <a
                        href="https://github.com/ulinycoin/clientpdf-pro/discussions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary-600 hover:text-primary-700 transition-colors"
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

        <Footer />
      </div>
    </>
  );
};

export default FAQPage;

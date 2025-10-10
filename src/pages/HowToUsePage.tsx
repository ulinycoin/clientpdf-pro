import React from 'react';
import ModernHeader from '../components/organisms/ModernHeader';
import ModernFooter from '../components/organisms/ModernFooter';
import { useTranslation, useI18n } from '../hooks/useI18n';
import { SEOHead } from '../components/SEO/SEOHead';
import { Link } from 'react-router-dom';

const HowToUsePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useI18n();

  // Generate multilingual canonical URL
  const canonicalUrl = currentLanguage === 'en'
    ? 'https://localpdf.online/how-to-use'
    : `https://localpdf.online/${currentLanguage}/how-to-use`;

  // Structured Data for HowTo
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": t('pages.howToUse.title'),
    "description": t('pages.howToUse.subtitle'),
    "image": "https://localpdf.online/favicon.svg",
    "totalTime": "PT5M",
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "PDF files to process"
      },
      {
        "@type": "HowToSupply",
        "name": "Modern web browser"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "LocalPDF"
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": t('pages.howToUse.quickStart.steps.upload.title'),
        "text": t('pages.howToUse.quickStart.steps.upload.description'),
        "image": "https://localpdf.online/favicon.svg"
      },
      {
        "@type": "HowToStep",
        "name": t('pages.howToUse.quickStart.steps.choose.title'),
        "text": t('pages.howToUse.quickStart.steps.choose.description'),
        "image": "https://localpdf.online/favicon.svg"
      },
      {
        "@type": "HowToStep",
        "name": t('pages.howToUse.quickStart.steps.configure.title'),
        "text": t('pages.howToUse.quickStart.steps.configure.description'),
        "image": "https://localpdf.online/favicon.svg"
      },
      {
        "@type": "HowToStep",
        "name": t('pages.howToUse.quickStart.steps.download.title'),
        "text": t('pages.howToUse.quickStart.steps.download.description'),
        "image": "https://localpdf.online/favicon.svg"
      }
    ]
  };

  const getToolSteps = (toolKey: string) => {
    const steps = t(`pages.howToUse.tools.${toolKey}.steps`) as any;
    return Array.isArray(steps) ? steps : [];
  };

  return (
    <>
      <SEOHead
        title={`${t('pages.howToUse.title')} - LocalPDF | Privacy-First PDF Tools`}
        description={t('pages.howToUse.subtitle')}
        canonical={canonicalUrl}
        ogType="article"
        structuredData={structuredData}
        includeHreflang={true}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <ModernHeader />

        <main className="flex-grow max-w-5xl mx-auto px-4 py-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <header className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('pages.howToUse.title')}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {t('pages.howToUse.subtitle')}
              </p>
            </header>

            {/* Quick Start Guide */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8 border-b border-gray-200 dark:border-gray-700 pb-3">
                🚀 {t('pages.howToUse.quickStart.title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-600 dark:text-blue-400 text-2xl">📁</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    1. {t('pages.howToUse.quickStart.steps.upload.title')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('pages.howToUse.quickStart.steps.upload.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 dark:text-green-400 text-2xl">🛠️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    2. {t('pages.howToUse.quickStart.steps.choose.title')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('pages.howToUse.quickStart.steps.choose.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-600 dark:text-purple-400 text-2xl">⚙️</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    3. {t('pages.howToUse.quickStart.steps.configure.title')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('pages.howToUse.quickStart.steps.configure.description')}
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-orange-600 dark:text-orange-400 text-2xl">💾</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    4. {t('pages.howToUse.quickStart.steps.download.title')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('pages.howToUse.quickStart.steps.download.description')}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
                <div className="flex items-start">
                  <div className="text-blue-500 dark:text-blue-400 text-2xl mr-4">💡</div>
                  <div>
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      {t('pages.howToUse.quickStart.keyBenefits.title')}
                    </h3>
                    <p className="text-blue-700 dark:text-blue-400">
                      {t('pages.howToUse.quickStart.keyBenefits.description')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* PDF Tools Detailed Guide */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8 border-b border-gray-200 dark:border-gray-700 pb-3">
                📄 {t('pages.howToUse.tools.title')}
              </h2>

              <div className="space-y-8">

                {/* Merge PDFs */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-blue-600 dark:text-blue-400 text-3xl mr-4">📄</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-3">
                        {t('pages.howToUse.tools.merge.title')}
                      </h3>
                      <p className="text-blue-700 dark:text-blue-400 mb-4">
                        {t('pages.howToUse.tools.merge.description')}
                      </p>
                      <div className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                        {getToolSteps('merge').map((step: string, index: number) => (
                          <p key={index}><strong>Step {index + 1}:</strong> {step}</p>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          <strong>Tip:</strong> {t('pages.howToUse.tools.merge.tip')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Split PDFs */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-green-600 dark:text-green-400 text-3xl mr-4">✂️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-3">
                        {t('pages.howToUse.tools.split.title')}
                      </h3>
                      <p className="text-green-700 dark:text-green-400 mb-4">
                        {t('pages.howToUse.tools.split.description')}
                      </p>
                      <div className="space-y-2 text-sm text-green-700 dark:text-green-400">
                        {getToolSteps('split').map((step: string, index: number) => (
                          <p key={index}><strong>Step {index + 1}:</strong> {step}</p>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded">
                        <p className="text-xs text-green-600 dark:text-green-400">
                          <strong>Tip:</strong> {t('pages.howToUse.tools.split.tip')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compress PDFs */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-purple-600 dark:text-purple-400 text-3xl mr-4">🗜️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-3">
                        {t('pages.howToUse.tools.compress.title')}
                      </h3>
                      <p className="text-purple-700 dark:text-purple-400 mb-4">
                        {t('pages.howToUse.tools.compress.description')}
                      </p>
                      <div className="space-y-2 text-sm text-purple-700 dark:text-purple-400">
                        {getToolSteps('compress').map((step: string, index: number) => (
                          <p key={index}><strong>Step {index + 1}:</strong> {step}</p>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded">
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          <strong>Tip:</strong> {t('pages.howToUse.tools.compress.tip')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Text */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-yellow-600 dark:text-yellow-400 text-3xl mr-4">✍️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                        {t('pages.howToUse.tools.addText.title')}
                      </h3>
                      <p className="text-yellow-700 dark:text-yellow-400 mb-4">
                        {t('pages.howToUse.tools.addText.description')}
                      </p>
                      <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-400">
                        {getToolSteps('addText').map((step: string, index: number) => (
                          <p key={index}><strong>Step {index + 1}:</strong> {step}</p>
                        ))}
                      </div>
                      <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          <strong>Tip:</strong> {t('pages.howToUse.tools.addText.tip')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional PDF Tools */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-6">
                  <div className="flex items-start">
                    <div className="text-red-600 dark:text-red-400 text-3xl mr-4">🏷️</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-3">
                        {t('pages.howToUse.tools.additional.title')}
                      </h3>
                      <p className="text-red-700 dark:text-red-400 mb-4">
                        {t('pages.howToUse.tools.additional.description')}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-700 dark:text-red-400">
                        <div>
                          <p><strong>🏷️ {t('pages.howToUse.tools.additional.features.watermarks')}</strong></p>
                          <p><strong>🔄 {t('pages.howToUse.tools.additional.features.rotate')}</strong></p>
                          <p><strong>📑 {t('pages.howToUse.tools.additional.features.extract')}</strong></p>
                        </div>
                        <div>
                          <p><strong>📝 {t('pages.howToUse.tools.additional.features.extractText')}</strong></p>
                          <p><strong>🖼️ {t('pages.howToUse.tools.additional.features.convert')}</strong></p>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded">
                        <p className="text-xs text-red-600 dark:text-red-400">
                          <strong>{t('pages.howToUse.tools.additional.tip')}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Advanced Tips */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8 border-b border-gray-200 dark:border-gray-700 pb-3">
                💡 {t('pages.howToUse.tips.title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    🚀 {t('pages.howToUse.tips.performance.title')}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {(t('pages.howToUse.tips.performance.items') as string[]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    ⌨️ {t('pages.howToUse.tips.keyboard.title')}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {(t('pages.howToUse.tips.keyboard.items') as string[]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    📱 {t('pages.howToUse.tips.mobile.title')}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {(t('pages.howToUse.tips.mobile.items') as string[]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    🔧 {t('pages.howToUse.tips.troubleshooting.title')}
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {(t('pages.howToUse.tips.troubleshooting.items') as string[]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* File Format Support */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8 border-b border-gray-200 dark:border-gray-700 pb-3">
                📋 {t('pages.howToUse.formats.title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                    ✅ {t('pages.howToUse.formats.input.title')}
                  </h3>
                  <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                    {(t('pages.howToUse.formats.input.items') as string[]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    📤 {t('pages.howToUse.formats.output.title')}
                  </h3>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                    {(t('pages.howToUse.formats.output.items') as string[]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-700">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3">
                    ⚠️ {t('pages.howToUse.formats.limitations.title')}
                  </h3>
                  <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                    {(t('pages.howToUse.formats.limitations.items') as string[]).map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Privacy & Security Guide */}
            <section className="mb-12">
              <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8 border-b border-gray-200 dark:border-gray-700 pb-3">
                🔒 {t('pages.howToUse.privacy.title')}
              </h2>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4">
                      ✅ {t('pages.howToUse.privacy.whatWeDo.title')}
                    </h3>
                    <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                      {(t('pages.howToUse.privacy.whatWeDo.items') as string[]).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-4">
                      ❌ {t('pages.howToUse.privacy.whatWeNeverDo.title')}
                    </h3>
                    <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
                      {(t('pages.howToUse.privacy.whatWeNeverDo.items') as string[]).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    <strong>{t('pages.howToUse.privacy.perfectFor')}</strong>
                  </p>
                </div>
              </div>
            </section>

            {/* Need Help Section */}
            <section className="bg-gray-100 dark:bg-gray-700/50 p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">
                🆘 {t('pages.howToUse.help.title')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
                  <div className="text-blue-500 dark:text-blue-400 text-3xl mb-4">📖</div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {t('pages.howToUse.help.documentation.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {t('pages.howToUse.help.documentation.description')}
                  </p>
                  <Link
                    to={currentLanguage === 'en' ? '/faq' : `/${currentLanguage}/faq`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    {t('pages.howToUse.help.documentation.link')}
                  </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
                  <div className="text-green-500 dark:text-green-400 text-3xl mb-4">💬</div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {t('pages.howToUse.help.community.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {t('pages.howToUse.help.community.description')}
                  </p>
                  <a
                    href="https://github.com/ulinycoin/clientpdf-pro/discussions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    {t('pages.howToUse.help.community.link')}
                  </a>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg text-center">
                  <div className="text-red-500 dark:text-red-400 text-3xl mb-4">🐛</div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    {t('pages.howToUse.help.issues.title')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {t('pages.howToUse.help.issues.description')}
                  </p>
                  <a
                    href="https://github.com/ulinycoin/clientpdf-pro/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    {t('pages.howToUse.help.issues.link')}
                  </a>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {t('pages.howToUse.help.footer')}
                </p>
              </div>
            </section>

          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default HowToUsePage;

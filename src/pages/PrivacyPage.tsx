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
                Last Updated: July 20, 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none">

              {/* Privacy Commitment */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                    🔒
                  </span>
                  Our Privacy Commitment
                </h2>
                <p className="text-secondary-600 mb-4 text-lg leading-relaxed">
                  LocalPDF is designed with <strong className="text-primary-600">privacy as the foundation</strong>.
                  We believe your documents and data should remain yours and yours alone. This Privacy Policy
                  explains how LocalPDF protects your privacy and ensures your data never leaves your device.
                </p>
              </section>

              {/* Simple Answer */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center mr-3">
                    📍
                  </span>
                  The Simple Answer
                </h2>
                <div className="pdf-processing-card border-l-4 border-success-500 p-6 mb-6">
                  <p className="text-success-800 font-semibold text-lg mb-3">
                    LocalPDF does not collect, store, transmit, or have access to any of your data, files, or personal information.
                  </p>
                  <p className="text-success-700">
                    All PDF processing happens entirely within your web browser. Your files never leave your device.
                  </p>
                </div>
              </section>

              {/* What We Don't Do */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center mr-3">
                    🛡️
                  </span>
                  What We DON'T Do
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="pdf-processing-card border-l-4 border-error-500 p-6">
                    <h3 className="font-semibold text-error-800 mb-3 flex items-center">
                      <span className="mr-2">❌</span>
                      No Data Collection
                    </h3>
                    <ul className="text-error-700 space-y-2">
                      <li>• No personal information</li>
                      <li>• No usage tracking</li>
                      <li>• No analytics cookies</li>
                      <li>• No user accounts</li>
                    </ul>
                  </div>
                  <div className="pdf-processing-card border-l-4 border-error-500 p-6">
                    <h3 className="font-semibold text-error-800 mb-3 flex items-center">
                      <span className="mr-2">❌</span>
                      No File Access
                    </h3>
                    <ul className="text-error-700 space-y-2">
                      <li>• No server uploads</li>
                      <li>• No file storage</li>
                      <li>• No document copies</li>
                      <li>• No processing history</li>
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
                  How LocalPDF Works
                </h2>

                <div className="pdf-processing-card border-l-4 border-blue-500 p-6 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">🖥️</span>
                    Client-Side Processing
                  </h3>
                  <p className="text-blue-700 mb-3">All PDF operations happen directly in your web browser using:</p>
                  <ul className="text-blue-700 space-y-2">
                    <li>• <strong>JavaScript PDF libraries</strong> (pdf-lib, PDF.js, jsPDF)</li>
                    <li>• <strong>Web Workers</strong> for performance optimization</li>
                    <li>• <strong>Local memory</strong> for temporary processing</li>
                    <li>• <strong>Your device's resources</strong> exclusively</li>
                  </ul>
                </div>

                <div className="pdf-processing-card border-l-4 border-success-500 p-6">
                  <h3 className="font-semibold text-success-800 mb-3 flex items-center">
                    <span className="mr-2">🔄</span>
                    The Complete Process
                  </h3>
                  <ol className="text-success-700 space-y-2">
                    <li><strong>1.</strong> You select a PDF file from your device</li>
                    <li><strong>2.</strong> File loads into browser memory (never uploaded)</li>
                    <li><strong>3.</strong> Processing happens locally using JavaScript</li>
                    <li><strong>4.</strong> Result is generated in your browser</li>
                    <li><strong>5.</strong> You download the processed file directly</li>
                    <li><strong>6.</strong> All data is cleared from memory when you close the page</li>
                  </ol>
                </div>
              </section>

              {/* Analytics Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-secondary-800 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    📊
                  </span>
                  Privacy-First Analytics
                </h2>
                <div className="mb-6">
                  <p className="text-secondary-700 mb-4">
                    LocalPDF uses <strong>Vercel Analytics</strong> to understand how our tools are used and improve user experience. Our analytics approach maintains our privacy-first philosophy:
                  </p>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-4">
                    <h3 className="font-semibold text-indigo-800 mb-3">What We Track (Anonymously)</h3>
                    <ul className="text-indigo-700 space-y-2">
                      <li>• <strong>Page visits</strong> - which tools are most popular</li>
                      <li>• <strong>Tool usage</strong> - basic metrics like file processing counts</li>
                      <li>• <strong>Performance data</strong> - loading times and errors</li>
                      <li>• <strong>General location</strong> - country/region only (for language optimization)</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-800 mb-3">Privacy Protections</h3>
                    <ul className="text-green-700 space-y-2">
                      <li>• <strong>No cookies</strong> - analytics work without tracking cookies</li>
                      <li>• <strong>No personal data</strong> - we never see your files or personal information</li>
                      <li>• <strong>IP anonymization</strong> - your exact IP address is never stored</li>
                      <li>• <strong>DNT respected</strong> - we honor "Do Not Track" browser settings</li>
                      <li>• <strong>GDPR compliant</strong> - all analytics are privacy-regulation compliant</li>
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
                  International Privacy Compliance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="pdf-processing-card text-center p-6">
                    <div className="text-3xl mb-3">🇪🇺</div>
                    <h3 className="font-semibold text-purple-800 mb-2">GDPR</h3>
                    <p className="text-purple-700 text-sm">Fully compliant - no personal data processed</p>
                  </div>
                  <div className="pdf-processing-card text-center p-6">
                    <div className="text-3xl mb-3">🇺🇸</div>
                    <h3 className="font-semibold text-purple-800 mb-2">CCPA</h3>
                    <p className="text-purple-700 text-sm">Compliant - no data collection or sale</p>
                  </div>
                  <div className="pdf-processing-card text-center p-6">
                    <div className="text-3xl mb-3">🌐</div>
                    <h3 className="font-semibold text-purple-800 mb-2">Global</h3>
                    <p className="text-purple-700 text-sm">Privacy-first design ensures worldwide compliance</p>
                  </div>
                </div>
              </section>

              {/* Summary */}
              <section className="pdf-processing-card border-l-4 border-success-500 p-8">
                <h2 className="text-2xl font-semibold text-success-800 mb-4 flex items-center">
                  <span className="mr-3">🎯</span>
                  Summary
                </h2>
                <p className="text-success-700 text-lg mb-4">
                  <strong>LocalPDF is designed to be completely private by default. Your files, data, and privacy are protected because we simply don't collect, store, or transmit any of your information.</strong>
                </p>
                <p className="text-success-600">
                  This isn't just a policy promise—it's built into the fundamental architecture of how LocalPDF works.
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

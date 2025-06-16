// src/App.tsx (только английский)
import React, { useState } from 'react';
import { FileText, Upload, Download, Settings } from 'lucide-react';
import { Button } from './components/atoms/Button';
import { FileUploadZone } from './components/molecules/FileUploadZone';
import { PDFPreview } from './components/molecules/PDFPreview';
import { OptimizedPDFProcessor } from './components/organisms/LazyComponent';
import { FAQ } from './components/organisms/FAQ';
import { useSEO } from './hooks/useSEO';
import { useTranslation } from './hooks/useTranslation';
import { trackEvent } from './utils/analytics';

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentPDF, setCurrentPDF] = useState<File | null>(null);
  
  const { t } = useTranslation();

  // SEO оптимизация
  useSEO({
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords'),
    canonical: 'https://localpdf.online',
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "LocalPDF",
      "url": "https://localpdf.online",
      "description": t('meta.description'),
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Web Browser",
      "inLanguage": "en",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1250"
      }
    }
  });

  const handleFilesSelected = (files: File[]) => {
    console.log('Selected files:', files);
    setSelectedFiles(files);
    
    trackEvent('file_upload', 'User Interaction', 'Files Selected', files.length);
    
    const firstPDF = files.find(file => file.type === 'application/pdf');
    if (firstPDF) {
      setCurrentPDF(firstPDF);
    }
  };

  const faqItems = t('faq.items') as Array<{question: string, answer: string}>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                {t('header.title')}
              </h1>
            </div>
            
            <nav aria-label="Main navigation" className="flex items-center space-x-4">
              <a href="/merge-pdf/" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t('header.nav.merge')}
              </a>
              <a href="/split-pdf/" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t('header.nav.split')}
              </a>
              <a href="/compress-pdf/" className="text-gray-600 hover:text-gray-900 transition-colors">
                {t('header.nav.compress')}
              </a>
              
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('hero.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" 
                 aria-labelledby="features-heading">
          <h3 id="features-heading" className="sr-only">LocalPDF Features</h3>
          
          <article className="card card-hover p-6">
            <Upload className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('features.upload.title')}
            </h3>
            <p className="text-gray-600">
              {t('features.upload.description')}
            </p>
          </article>

          <article className="card card-hover p-6">
            <FileText className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('features.preview.title')}
            </h3>
            <p className="text-gray-600">
              {t('features.preview.description')}
            </p>
          </article>

          <article className="card card-hover p-6">
            <Download className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('features.download.title')}
            </h3>
            <p className="text-gray-600">
              {t('features.download.description')}
            </p>
          </article>
        </section>

        {/* Upload Zone */}
        <section aria-labelledby="upload-heading">
          <h3 id="upload-heading" className="sr-only">Upload Files</h3>
          <FileUploadZone 
            onFilesSelected={handleFilesSelected}
            className="max-w-2xl mx-auto"
          />
        </section>

        {/* PDF Operations */}
        {selectedFiles.length > 0 && (
          <section className="mt-8" aria-labelledby="operations-heading">
            <h3 id="operations-heading" className="sr-only">PDF Operations</h3>
            <OptimizedPDFProcessor files={selectedFiles} />
          </section>
        )}

        {/* PDF Preview */}
        {currentPDF && (
          <section className="mt-8" aria-labelledby="preview-heading">
            <div className="flex items-center justify-between mb-4">
              <h3 id="preview-heading" className="text-lg font-semibold text-gray-900">
                PDF Preview: {currentPDF.name}
              </h3>
              {selectedFiles.length > 1 && (
                <div className="flex space-x-2">
                  {selectedFiles
                    .filter(file => file.type === 'application/pdf')
                    .map((file, index) => (
                      <Button
                        key={index}
                        variant={file === currentPDF ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setCurrentPDF(file)}
                      >
                        {file.name.substring(0, 20)}...
                      </Button>
                    ))}
                </div>
              )}
            </div>
            
            <PDFPreview
              file={currentPDF}
              className="h-96 lg:h-[600px]"
              onPagesLoaded={(count) => {
                console.log(`PDF loaded with ${count} pages`);
                trackEvent('pdf_preview', 'User Interaction', 'Pages Loaded', count);
              }}
            />
          </section>
        )}

        {/* FAQ Section */}
        <section className="mt-16" aria-labelledby="faq-heading">
          <FAQ items={faqItems} />
        </section>

        {/* Call to Action */}
        <section className="mt-16 text-center bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            {t('cta.subtitle')}
          </p>
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => {
              trackEvent('cta_click', 'User Interaction', 'Get Started');
              document.querySelector('[data-testid="file-upload"]')?.scrollIntoView({ 
                behavior: 'smooth' 
              });
            }}
          >
            {t('cta.button')}
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.tools.title')}</h3>
              <ul className="space-y-2">
                <li><a href="/merge-pdf/" className="text-gray-300 hover:text-white">{t('footer.tools.merge')}</a></li>
                <li><a href="/split-pdf/" className="text-gray-300 hover:text-white">{t('footer.tools.split')}</a></li>
                <li><a href="/compress-pdf/" className="text-gray-300 hover:text-white">{t('footer.tools.compress')}</a></li>
                <li><a href="/images-to-pdf/" className="text-gray-300 hover:text-white">{t('footer.tools.convert')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.resources.title')}</h3>
              <ul className="space-y-2">
                <li><a href="/blog/" className="text-gray-300 hover:text-white">{t('footer.resources.blog')}</a></li>
                <li><a href="/help/" className="text-gray-300 hover:text-white">{t('footer.resources.help')}</a></li>
                <li><a href="/api/" className="text-gray-300 hover:text-white">{t('footer.resources.api')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.company.title')}</h3>
              <ul className="space-y-2">
                <li><a href="/privacy/" className="text-gray-300 hover:text-white">{t('footer.company.privacy')}</a></li>
                <li><a href="/terms/" className="text-gray-300 hover:text-white">{t('footer.company.terms')}</a></li>
                <li><a href="/contact/" className="text-gray-300 hover:text-white">{t('footer.company.contact')}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.contact.title')}</h3>
              <p className="text-gray-300 mb-2">
                {t('footer.contact.subtitle')}
              </p>
              <a href="mailto:support@localpdf.online" 
                 className="text-blue-400 hover:text-blue-300">
                {t('footer.contact.email')}
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
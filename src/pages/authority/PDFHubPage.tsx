// src/pages/authority/PDFHubPage.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEntity } from '@/components/providers/EntityProvider';
import { SemanticContent } from '@/components/molecules/SemanticContent';
import { SmartFAQ } from '@/components/organisms/SmartFAQ';
import { TopicClusterNavigation } from '@/components/organisms/TopicClusterNavigation';
import { ModernHeader, ModernFooter } from '@/components/organisms';
import { PDFHubHreflang } from '@/components/SEO/PDFHubHreflang';
// Removed useI18n - PDF Hub is English-only
import { entityHelper } from '@/utils/entityHelpers';

const PDFHubPage: React.FC = () => {
  // PDF Hub is English-only - no i18n needed
  const { name, description } = useEntity();

  const hubFAQs = [
    {
      id: 'hub-overview',
      question: 'What is LocalPDF Hub?',
      answer: 'LocalPDF Hub is your comprehensive guide to PDF processing, featuring in-depth tutorials, industry-specific workflows, and expert insights on document management.',
      category: 'Overview',
      aiSnippetTarget: true
    },
    {
      id: 'hub-privacy',
      question: 'How does LocalPDF ensure privacy?',
      answer: 'All PDF processing happens locally in your browser. No files are uploaded to servers, ensuring complete privacy and data security according to GDPR standards.',
      category: 'Privacy',
      voiceOptimized: true
    },
    {
      id: 'hub-features',
      question: 'What PDF tools are available?',
      answer: 'LocalPDF offers 20+ tools including merge, split, compress, convert, protect, OCR, and more - all optimized for browser-based processing.',
      category: 'Features',
      aiSnippetTarget: true
    }
  ];

  const hubStatistics = [
    { label: 'PDF Tools Available', value: '20+', icon: '🛠️' },
    { label: 'Languages Supported', value: '5', icon: '🌍' },
    { label: 'Privacy-First Processing', value: '100%', icon: '🔒' },
    { label: 'Industry Solutions', value: '12+', icon: '🏢' }
  ];

  const industryUseCases = [
    {
      industry: 'Legal',
      icon: '⚖️',
      description: 'Document redaction, contract management, secure file sharing',
      tools: ['protect-pdf', 'watermark-pdf', 'merge-pdf']
    },
    {
      industry: 'Healthcare',
      icon: '🏥',
      description: 'HIPAA-compliant document processing, patient record management',
      tools: ['compress-pdf', 'protect-pdf', 'ocr-pdf']
    },
    {
      industry: 'Education',
      icon: '🎓',
      description: 'Assignment compilation, research document organization',
      tools: ['merge-pdf', 'split-pdf', 'extract-text-pdf']
    },
    {
      industry: 'Business',
      icon: '💼',
      description: 'Report generation, document automation, workflow optimization',
      tools: ['word-to-pdf', 'excel-to-pdf', 'watermark-pdf']
    }
  ];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "PDF Hub - Complete Guide to PDF Processing",
    "description": "Comprehensive PDF processing guide with 20+ tools, privacy-first approach, and industry-specific solutions.",
    "url": "https://localpdf.tech/pdf-hub",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "LocalPDF",
      "applicationCategory": "DocumentProcessing",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://localpdf.tech"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "PDF Hub",
          "item": "https://localpdf.tech/pdf-hub"
        }
      ]
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Hub - Complete Guide to PDF Processing | LocalPDF</title>
        <meta
          name="description"
          content="Comprehensive PDF processing guide with 20+ privacy-first tools, industry solutions, and expert workflows. Process PDFs securely in your browser."
        />
        <meta name="keywords" content="pdf hub, pdf guide, document processing, privacy pdf tools, browser pdf, pdf workflows" />
        {/* Canonical and hreflang handled by PDFHubHreflang component */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      {/* PDF Hub specific hreflang tags (English-only) */}
      <PDFHubHreflang
        pagePath="/pdf-hub"
        canonicalUrl="https://localpdf.tech/pdf-hub"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
        <ModernHeader />

        <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                <span className="text-2xl">🎯</span>
                PDF Processing Authority Center
              </div>

              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
                <SemanticContent
                  entity="LocalPDF"
                  context="heading"
                  fallback="PDF Hub"
                  maxVariants={1}
                />
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                <SemanticContent
                  entity="DocumentManagement"
                  context="description"
                  fallback="Your comprehensive guide to professional PDF processing with privacy-first tools, industry workflows, and expert insights."
                  maxVariants={1}
                />
              </p>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
                {hubStatistics.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Topic Clusters Navigation */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <TopicClusterNavigation
              maxClusters={4}
              showProgress={true}
              variant="grid"
              className="mb-16"
            />
          </div>
        </section>

        {/* Authority Content Categories */}
        <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Expert Knowledge Center
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Dive deep into PDF processing with our comprehensive guides, tutorials, and industry-specific solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Guides */}
              <Link
                to="/pdf-hub/guides"
                className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Complete Guides
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Step-by-step tutorials for every PDF operation, from basic merging to advanced automation workflows.
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                  Explore Guides
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Workflows */}
              <Link
                to="/pdf-hub/workflows"
                className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Business Workflows
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Optimized processes for document automation, batch operations, and enterprise-level PDF management.
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                  View Workflows
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Security */}
              <Link
                to="/pdf-hub/security"
                className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Privacy & Security
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  GDPR compliance, data protection strategies, and secure document processing best practices.
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                  Security Center
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Industry Use Cases */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Industry Solutions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Tailored PDF processing solutions for specific industries and professional use cases.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {industryUseCases.map((useCase, index) => (
                <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{useCase.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {useCase.industry}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {useCase.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {useCase.tools.map((tool, toolIndex) => (
                          <Link
                            key={toolIndex}
                            to={`/${tool}`}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            {tool.replace(/-/g, ' ').replace(/pdf/g, 'PDF').toUpperCase()}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-4xl mx-auto">
            <SmartFAQ
              baseFAQs={hubFAQs}
              entityId="LocalPDF"
              maxItems={8}
              showSearch={true}
              showCategories={true}
              enableVoiceSearch={true}
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Start Processing PDFs Today
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Choose from 20+ privacy-first PDF tools, all running securely in your browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Browse All Tools
              </Link>
              <Link
                to="/pdf-hub/guides"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                View Guides
              </Link>
            </div>
          </div>
        </section>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default PDFHubPage;
// src/pages/authority/SecurityPage.tsx
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEntity } from '@/components/providers/EntityProvider';
import { SemanticContent } from '@/components/molecules/SemanticContent';
import { SmartFAQ } from '@/components/organisms/SmartFAQ';
import { ClusterBreadcrumb } from '@/components/organisms/TopicClusterNavigation';
import { ModernHeader, ModernFooter } from '@/components/organisms';
import { PDFHubHreflang } from "@/components/SEO/PDFHubHreflang";
// Removed useI18n - PDF Hub is English-only

interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  implementation: string;
  benefits: string[];
  relatedTools: string[];
  complianceStandards: string[];
}

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: string[];
  howWeComply: string;
  region: string;
}

const SecurityPage: React.FC = () => {
  const { name } = useEntity();
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'compliance' | 'best-practices'>('overview');

  const securityFeatures: SecurityFeature[] = [
    {
      id: 'client-side-processing',
      title: 'Client-Side Processing',
      description: 'All PDF operations happen locally in your browser, ensuring your documents never leave your device.',
      icon: '💻',
      implementation: 'JavaScript libraries (PDF-lib, PDF.js) run entirely in the browser environment',
      benefits: [
        'Zero data transmission to servers',
        'Immediate processing without uploads',
        'Works offline after initial load',
        'Complete control over your data'
      ],
      relatedTools: ['merge-pdf', 'split-pdf', 'compress-pdf', 'all-tools'],
      complianceStandards: ['GDPR', 'HIPAA', 'SOX', 'PCI-DSS']
    },
    {
      id: 'zero-storage',
      title: 'Zero Data Storage',
      description: 'We do not store, cache, or retain any of your documents or personal information on our servers.',
      icon: '🚫',
      implementation: 'No server-side file storage, no database retention, no temporary file creation',
      benefits: [
        'No risk of data breaches',
        'No unauthorized access concerns',
        'Complete privacy assurance',
        'Instant document disposal'
      ],
      relatedTools: ['protect-pdf', 'watermark-pdf', 'ocr-pdf'],
      complianceStandards: ['GDPR Article 17', 'CCPA', 'Privacy by Design']
    },
    {
      id: 'https-encryption',
      title: 'HTTPS Encryption',
      description: 'All communications between your browser and our service use TLS 1.3 encryption.',
      icon: '🔒',
      implementation: 'TLS 1.3 with perfect forward secrecy and certificate pinning',
      benefits: [
        'Data in transit protection',
        'Man-in-the-middle prevention',
        'Identity verification',
        'Session security'
      ],
      relatedTools: ['all-tools'],
      complianceStandards: ['TLS 1.3', 'HSTS', 'Certificate Transparency']
    },
    {
      id: 'password-protection',
      title: 'Local Password Protection',
      description: 'Password protection and encryption are applied directly in your browser without exposing credentials.',
      icon: '🛡️',
      implementation: 'AES-256 encryption with user-defined passwords processed locally',
      benefits: [
        'Password never transmitted',
        'Strong encryption standards',
        'User-controlled security levels',
        'Document access control'
      ],
      relatedTools: ['protect-pdf'],
      complianceStandards: ['AES-256', 'FIPS 140-2', 'Common Criteria']
    },
    {
      id: 'no-tracking',
      title: 'Privacy-First Analytics',
      description: 'We use privacy-respecting analytics that do not track individual users or store personal data.',
      icon: '👁️',
      implementation: 'Aggregated metrics only, no personal identifiers, GDPR-compliant analytics',
      benefits: [
        'Anonymous usage insights',
        'No personal profiling',
        'Opt-out capabilities',
        'Transparent data practices'
      ],
      relatedTools: ['website-analytics'],
      complianceStandards: ['GDPR Article 6', 'ePrivacy Directive', 'Cookie Law']
    },
    {
      id: 'open-source-transparency',
      title: 'Transparent Security',
      description: 'Our security implementations are transparent and auditable, using open-source components where possible.',
      icon: '🔍',
      implementation: 'Open-source PDF libraries, transparent security practices, regular security audits',
      benefits: [
        'Community-verified security',
        'No hidden backdoors',
        'Regular security updates',
        'Industry-standard practices'
      ],
      relatedTools: ['all-tools'],
      complianceStandards: ['Security by Design', 'Defense in Depth', 'Zero Trust']
    }
  ];

  const complianceFrameworks: ComplianceFramework[] = [
    {
      id: 'gdpr',
      name: 'GDPR Compliance',
      description: 'Full compliance with the EU General Data Protection Regulation for privacy and data protection.',
      icon: '🇪🇺',
      requirements: [
        'Lawful basis for processing',
        'Data minimization principle',
        'Right to erasure (right to be forgotten)',
        'Data protection by design and by default',
        'Consent management',
        'Data breach notification'
      ],
      howWeComply: 'Client-side processing eliminates data collection entirely, making GDPR compliance inherent to our architecture.',
      region: 'European Union'
    },
    {
      id: 'hipaa',
      name: 'HIPAA Compliance',
      description: 'Adherence to Health Insurance Portability and Accountability Act requirements for healthcare data.',
      icon: '🏥',
      requirements: [
        'PHI protection measures',
        'Access controls and audit logs',
        'Data integrity safeguards',
        'Transmission security',
        'Business associate agreements'
      ],
      howWeComply: 'No PHI transmission or storage occurs, as all processing happens locally in the user\'s browser.',
      region: 'United States'
    },
    {
      id: 'sox',
      name: 'SOX Compliance',
      description: 'Sarbanes-Oxley Act compliance for financial document integrity and security.',
      icon: '💼',
      requirements: [
        'Document integrity controls',
        'Audit trail maintenance',
        'Access control procedures',
        'Change management controls'
      ],
      howWeComply: 'Local processing ensures document integrity without external manipulation or unauthorized access.',
      region: 'United States'
    },
    {
      id: 'iso27001',
      name: 'ISO 27001 Alignment',
      description: 'Information security management system following ISO 27001 best practices.',
      icon: '🛡️',
      requirements: [
        'Information security policy',
        'Risk assessment procedures',
        'Security controls implementation',
        'Continuous monitoring and improvement'
      ],
      howWeComply: 'Privacy-by-design architecture eliminates most traditional security risks at the source.',
      region: 'International'
    }
  ];

  const securityFAQs = [
    {
      id: 'data-safety',
      question: 'How do I know my documents are safe?',
      answer: 'Your documents never leave your device. All processing happens locally in your browser using JavaScript, with no uploads to our servers.',
      category: 'Privacy',
      voiceOptimized: true,
      aiSnippetTarget: true
    },
    {
      id: 'gdpr-compliance',
      question: 'Is LocalPDF GDPR compliant?',
      answer: 'Yes, LocalPDF is inherently GDPR compliant because we do not collect, process, or store any personal data. All operations are client-side.',
      category: 'Compliance',
      aiSnippetTarget: true
    },
    {
      id: 'password-security',
      question: 'How secure are password-protected PDFs?',
      answer: 'Passwords are processed locally using AES-256 encryption. Your passwords never leave your browser and are not transmitted to our servers.',
      category: 'Security',
      voiceOptimized: true
    },
    {
      id: 'business-use',
      question: 'Can I use LocalPDF for confidential business documents?',
      answer: 'Absolutely. LocalPDF is designed for sensitive document processing with enterprise-grade privacy and security measures.',
      category: 'Business',
      aiSnippetTarget: true
    }
  ];

  const bestPractices = [
    {
      category: 'Document Handling',
      practices: [
        'Always verify document integrity after processing',
        'Use strong, unique passwords for sensitive PDFs',
        'Keep original copies of important documents',
        'Regularly update your browser for latest security features'
      ]
    },
    {
      category: 'Password Security',
      practices: [
        'Use passwords with at least 12 characters',
        'Include uppercase, lowercase, numbers, and symbols',
        'Avoid using personal information in passwords',
        'Store passwords securely using a password manager'
      ]
    },
    {
      category: 'Privacy Protection',
      practices: [
        'Clear browser cache after processing sensitive documents',
        'Use private/incognito browsing for sensitive work',
        'Disable browser extensions when working with confidential files',
        'Verify network security before processing documents'
      ]
    },
    {
      category: 'Compliance',
      practices: [
        'Understand your industry\'s specific compliance requirements',
        'Document your security processes for audits',
        'Train team members on secure document handling',
        'Regularly review and update security policies'
      ]
    }
  ];

  const tabConfig = [
    { id: 'overview', label: 'Security Overview', icon: '🛡️' },
    { id: 'features', label: 'Security Features', icon: '🔒' },
    { id: 'compliance', label: 'Compliance', icon: '📋' },
    { id: 'best-practices', label: 'Best Practices', icon: '⭐' }
  ];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "PDF Security & Privacy Center - LocalPDF",
    "description": "Comprehensive guide to PDF security, privacy protection, and compliance. Learn about GDPR compliance, data protection, and secure document processing.",
    "url": "https://localpdf.tech/pdf-hub/security",
    "about": {
      "@type": "Thing",
      "name": "PDF Security and Privacy",
      "description": "Client-side PDF processing ensuring complete data privacy and security compliance"
    },
    "mainEntity": {
      "@type": "Article",
      "headline": "Complete Guide to PDF Security and Privacy",
      "description": "Learn how LocalPDF ensures document security through client-side processing, encryption, and compliance with GDPR, HIPAA, and other standards.",
      "author": {
        "@type": "Organization",
        "name": "LocalPDF"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Security & Privacy Center - GDPR Compliant | LocalPDF</title>
        <meta
          name="description"
          content="Complete guide to PDF security and privacy. Learn about GDPR compliance, client-side processing, and secure document handling with LocalPDF."
        />
        <meta name="keywords" content="pdf security, document privacy, gdpr compliance, hipaa compliant pdf, secure pdf processing, data protection" />
        <link rel="canonical" href={"https://localpdf.tech/pdf-hub/security"} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 flex flex-col">
        <ModernHeader />

        <main className="flex-grow">
        {/* Breadcrumb */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <ClusterBreadcrumb currentCluster="pdf-security" />
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                <span className="text-2xl">🔒</span>
                Privacy & Security Center
              </div>

              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-green-800 bg-clip-text text-transparent mb-6">
                <SemanticContent
                  entity="PrivacyFirstSoftware"
                  context="heading"
                  fallback="Security-First PDF Processing"
                  maxVariants={1}
                />
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                <SemanticContent
                  entity="GDPRCompliance"
                  context="description"
                  fallback="Complete document privacy with client-side processing, GDPR compliance, and enterprise-grade security measures."
                  maxVariants={1}
                />
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>HIPAA Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Zero Data Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✅</span>
                  <span>Client-Side Processing</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="px-4">
          <div className="max-w-7xl mx-auto">
            <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabConfig.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-12">
                {/* Privacy Promise */}
                <div className="text-center max-w-4xl mx-auto">
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                    Our Privacy Promise
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                      <div className="text-4xl mb-4">🚫</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        No Data Collection
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        We do not collect, store, or process any of your personal data or documents.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                      <div className="text-4xl mb-4">💻</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Local Processing
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        All PDF operations happen in your browser, ensuring complete privacy.
                      </p>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                      <div className="text-4xl mb-4">🔒</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Enterprise Security
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Professional-grade security measures for business and personal use.
                      </p>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                    How Privacy-First Processing Works
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📁</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">1. Choose File</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Select PDF from your device</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">💻</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">2. Local Processing</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">File processed in your browser</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">3. Instant Result</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Download processed file</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🗑️</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">4. Auto-Cleanup</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">No traces left behind</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {securityFeatures.map((feature) => (
                  <div key={feature.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-3xl">{feature.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Implementation</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{feature.implementation}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Benefits</h4>
                        <ul className="space-y-1">
                          {feature.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                              <span className="text-green-500">✓</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Related Tools</h4>
                        <div className="flex flex-wrap gap-2">
                          {feature.relatedTools.map((tool, index) => (
                            tool === 'all-tools' ? (
                              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                                All Tools
                              </span>
                            ) : (
                              <Link
                                key={index}
                                to={`/${tool}`}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                {tool.replace(/-/g, ' ').replace(/pdf/g, 'PDF').toUpperCase()}
                              </Link>
                            )
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Compliance Standards</h4>
                        <div className="flex flex-wrap gap-2">
                          {feature.complianceStandards.map((standard, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                              {standard}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-8">
                {complianceFrameworks.map((framework) => (
                  <div key={framework.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="text-4xl">{framework.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {framework.name}
                          </h3>
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                            {framework.region}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {framework.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Key Requirements</h4>
                        <ul className="space-y-2">
                          {framework.requirements.map((requirement, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {requirement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">How LocalPDF Complies</h4>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {framework.howWeComply}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'best-practices' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {bestPractices.map((section, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {section.category}
                    </h3>
                    <ul className="space-y-3">
                      {section.practices.map((practice, practiceIndex) => (
                        <li key={practiceIndex} className="text-gray-600 dark:text-gray-300 flex items-start gap-3">
                          <span className="text-green-500 mt-1">✓</span>
                          <span className="text-sm">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
          <div className="max-w-4xl mx-auto">
            <SmartFAQ
              baseFAQs={securityFAQs}
              entityId="PrivacyFirstSoftware"
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
              Experience Privacy-First PDF Processing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Start using our secure, GDPR-compliant PDF tools that protect your privacy by design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/protect-pdf"
                className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                Secure Your PDFs
              </Link>
              <Link
                to="/pdf-hub"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Explore All Tools
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

export default SecurityPage;
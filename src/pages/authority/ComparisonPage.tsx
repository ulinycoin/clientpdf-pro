// src/pages/authority/ComparisonPage.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEntity } from '@/components/providers/EntityProvider';
import { SemanticContent } from '@/components/molecules/SemanticContent';
import { SmartFAQ } from '@/components/organisms/SmartFAQ';
import { ClusterBreadcrumb } from '@/components/organisms/TopicClusterNavigation';
import { ModernHeader, ModernFooter } from '@/components/organisms';
import { PDFHubHreflang } from "@/components/SEO/PDFHubHreflang";
// Removed useI18n - PDF Hub is English-only

interface Tool {
  id: string;
  name: string;
  description: string;
  features: string[];
  useCases: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  icon: string;
  processingTime: string;
  outputQuality: 'High' | 'Medium' | 'Standard';
  privacyLevel: 'Maximum' | 'High' | 'Standard';
}

interface Comparison {
  title: string;
  description: string;
  tools: Tool[];
  category: string;
  useCase: string;
}

const ComparisonPage: React.FC = () => {
  const entity = useEntity('PDFProcessing');

  const toolData: Tool[] = [
    {
      id: 'merge-pdf',
      name: 'Merge PDF',
      description: 'Combine multiple PDF files into a single document',
      features: ['Drag & drop ordering', 'Preview thumbnails', 'Unlimited files', 'Batch processing'],
      useCases: ['Document compilation', 'Report creation', 'Archive building'],
      difficulty: 'Beginner',
      category: 'Organization',
      icon: '📄',
      processingTime: 'Fast (< 30s)',
      outputQuality: 'High',
      privacyLevel: 'Maximum'
    },
    {
      id: 'split-pdf',
      name: 'Split PDF',
      description: 'Extract pages or split PDF into multiple documents',
      features: ['Page range selection', 'Custom split points', 'Bulk extraction', 'Preview mode'],
      useCases: ['Chapter extraction', 'Page isolation', 'Document separation'],
      difficulty: 'Beginner',
      category: 'Organization',
      icon: '✂️',
      processingTime: 'Fast (< 30s)',
      outputQuality: 'High',
      privacyLevel: 'Maximum'
    },
    {
      id: 'compress-pdf',
      name: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      features: ['Smart compression', 'Quality control', 'Size preview', 'Lossless option'],
      useCases: ['Email attachments', 'Storage optimization', 'Web sharing'],
      difficulty: 'Beginner',
      category: 'Optimization',
      icon: '🗜️',
      processingTime: 'Medium (30-60s)',
      outputQuality: 'High',
      privacyLevel: 'Maximum'
    },
    {
      id: 'protect-pdf',
      name: 'Protect PDF',
      description: 'Add password protection and encryption to PDFs',
      features: ['Password encryption', 'Permission control', 'Print restrictions', 'Copy protection'],
      useCases: ['Confidential documents', 'Legal protection', 'Access control'],
      difficulty: 'Intermediate',
      category: 'Security',
      icon: '🔒',
      processingTime: 'Fast (< 30s)',
      outputQuality: 'High',
      privacyLevel: 'Maximum'
    },
    {
      id: 'watermark-pdf',
      name: 'Watermark PDF',
      description: 'Add text or image watermarks to PDF pages',
      features: ['Custom text/images', 'Position control', 'Transparency settings', 'Batch watermarking'],
      useCases: ['Copyright protection', 'Branding', 'Draft marking'],
      difficulty: 'Intermediate',
      category: 'Security',
      icon: '💧',
      processingTime: 'Medium (30-60s)',
      outputQuality: 'High',
      privacyLevel: 'Maximum'
    },
    {
      id: 'ocr-pdf',
      name: 'OCR PDF',
      description: 'Extract text from scanned PDFs and images',
      features: ['Text recognition', 'Multiple languages', 'Searchable PDFs', 'High accuracy'],
      useCases: ['Digitizing documents', 'Text extraction', 'Archive conversion'],
      difficulty: 'Advanced',
      category: 'Conversion',
      icon: '👁️',
      processingTime: 'Slow (1-3 min)',
      outputQuality: 'High',
      privacyLevel: 'Maximum'
    }
  ];

  const comparisons: Comparison[] = [
    {
      title: 'Document Organization Tools',
      description: 'Compare tools for organizing and managing PDF documents',
      category: 'Organization',
      useCase: 'When you need to organize, combine, or separate PDF documents',
      tools: toolData.filter(tool => tool.category === 'Organization')
    },
    {
      title: 'PDF Security Solutions',
      description: 'Compare security and protection options for sensitive documents',
      category: 'Security',
      useCase: 'When you need to protect confidential or sensitive PDF documents',
      tools: toolData.filter(tool => tool.category === 'Security')
    },
    {
      title: 'File Optimization Tools',
      description: 'Compare tools for optimizing PDF file size and performance',
      category: 'Optimization',
      useCase: 'When you need to reduce file size or improve PDF performance',
      tools: toolData.filter(tool => tool.category === 'Optimization')
    },
    {
      title: 'Conversion & Processing',
      description: 'Compare advanced PDF processing and conversion tools',
      category: 'Conversion',
      useCase: 'When you need to convert formats or extract content from PDFs',
      tools: toolData.filter(tool => tool.category === 'Conversion')
    }
  ];

  const [selectedComparison, setSelectedComparison] = React.useState<number>(0);

  const comparisonFAQs = [
    {
      id: "comparison-combining",
      question: "Which tool should I use for combining multiple documents?",
      answer: "Use Merge PDF for combining multiple PDF files into one document. It's beginner-friendly and handles unlimited files with drag-and-drop ordering.",
      category: "comparison"
    },
    {
      id: "comparison-difference",
      question: "What's the difference between Protect PDF and Watermark PDF?",
      answer: "Protect PDF adds password encryption and permission controls, while Watermark PDF adds visible text or image marks. Use Protect PDF for security, Watermark PDF for branding or copyright.",
      category: "comparison"
    },
    {
      id: "comparison-choose",
      question: "How do I choose between different PDF tools for my project?",
      answer: "Consider your use case, technical difficulty level, and required features. Check the comparison tables above to see which tool best matches your specific needs.",
      category: "comparison"
    },
    {
      id: "comparison-security",
      question: "Are all tools equally secure and private?",
      answer: "Yes, all LocalPDF tools process files entirely in your browser with maximum privacy. No files are uploaded to servers, ensuring complete data protection.",
      category: "comparison"
    }
  ];

  return (
    <>
      <Helmet>
        <title>PDF Tools Comparison - Choose the Right Tool | LocalPDF</title>
        <meta
          name="description"
          content="Compare PDF tools and features to choose the best solution for your needs. Side-by-side comparisons of merge, split, compress, protect, and conversion tools."
        />
        <meta name="keywords" content="PDF tool comparison, best PDF tool, PDF software comparison, document processing tools" />
        <link rel="canonical" href="https://localpdf.online/pdf-hub/comparison" />

        {/* Schema.org Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "PDF Tools Comparison",
            "description": "Comprehensive comparison of PDF processing tools to help you choose the right solution",
            "url": "https://localpdf.online/pdf-hub/comparison",
            "isPartOf": {
              "@type": "WebSite",
              "name": "LocalPDF",
              "url": "https://localpdf.online"
            },
            "about": {
              "@type": "Thing",
              "name": "PDF Tool Comparison",
              "description": "Feature comparison of PDF processing tools"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": ["Business users", "Students", "Professionals", "Content creators"]
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
        <ModernHeader />

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <ClusterBreadcrumb
              currentCluster="pdf-management"
              className="mb-8"
            />

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              PDF Tools Comparison
            </h1>

            <SemanticContent
              entity="PDFProcessing"
              context="description"
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
            >
              Compare PDF tools and features to find the perfect solution for your document processing needs.
            </SemanticContent>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Feature Comparison
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
                Use Case Matching
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Decision Guide
              </span>
            </div>
          </div>

          {/* Comparison Categories */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              {comparisons.map((comparison, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedComparison(index)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    selectedComparison === index
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:shadow-md'
                  }`}
                >
                  {comparison.title}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Comparison */}
          {comparisons[selectedComparison] && (
            <div className="mb-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {comparisons[selectedComparison].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {comparisons[selectedComparison].description}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  💡 {comparisons[selectedComparison].useCase}
                </p>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {comparisons[selectedComparison].tools.map((tool) => (
                    <ToolComparisonCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Decision Helper */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Not Sure Which Tool to Choose?</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold mb-2">Define Your Goal</h3>
                <p className="text-sm opacity-90">What do you want to accomplish with your PDF?</p>
              </div>
              <div>
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold mb-2">Check Complexity</h3>
                <p className="text-sm opacity-90">How technical are you comfortable getting?</p>
              </div>
              <div>
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="font-semibold mb-2">Consider Workflow</h3>
                <p className="text-sm opacity-90">Will you need multiple tools working together?</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <SmartFAQ
            baseFAQs={comparisonFAQs}
            entityId="PDFProcessing"
            className="mb-8"
          />
          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

// Individual Tool Comparison Card Component
const ToolComparisonCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'High': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Standard': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">{tool.icon}</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {tool.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tool.difficulty)}`}>
              {tool.difficulty}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {tool.description}
        </p>
      </div>

      {/* Specifications */}
      <div className="p-6">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing Time:</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{tool.processingTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Output Quality:</span>
            <span className={`text-sm font-medium ${getQualityColor(tool.outputQuality)}`}>{tool.outputQuality}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy Level:</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">{tool.privacyLevel}</span>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Key Features</h4>
          <div className="space-y-2">
            {tool.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Best For</h4>
          <div className="flex flex-wrap gap-2">
            {tool.useCases.map((useCase, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs"
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/${tool.id}`}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
        >
          Try {tool.name}
        </Link>
      </div>
    </div>
  );
};

export default ComparisonPage;
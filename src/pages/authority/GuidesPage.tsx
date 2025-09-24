// src/pages/authority/GuidesPage.tsx
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEntity } from '@/components/providers/EntityProvider';
import { SemanticContent } from '@/components/molecules/SemanticContent';
import { SmartFAQ } from '@/components/organisms/SmartFAQ';
import { ClusterBreadcrumb } from '@/components/organisms/TopicClusterNavigation';
import { ModernHeader, ModernFooter } from '@/components/organisms';
import { PDFHubHreflang } from '@/components/SEO/PDFHubHreflang';
// Removed useI18n - PDF Hub guides are English-only

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  tools: string[];
  icon: string;
  steps: GuideStep[];
  relatedGuides?: string[];
}

interface GuideStep {
  title: string;
  description: string;
  tips?: string[];
  warnings?: string[];
}

const GuidesPage: React.FC = () => {
  // PDF Hub guides are English-only - no i18n needed
  const { name, description } = useEntity();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const guides: Guide[] = [
    {
      id: 'pdf-document-organization',
      title: 'Master PDF Document Organization',
      description: 'Learn professional techniques for organizing, merging, and structuring PDF documents for maximum efficiency.',
      category: 'Document Management',
      difficulty: 'Beginner',
      estimatedTime: '15 minutes',
      tools: ['merge-pdf', 'split-pdf', 'extract-pages-pdf'],
      icon: '📁',
      steps: [
        {
          title: 'Plan Your Document Structure',
          description: 'Before merging PDFs, create a logical structure for your final document.',
          tips: [
            'Use consistent naming conventions',
            'Group related documents together',
            'Consider the reading flow for your audience'
          ]
        },
        {
          title: 'Prepare Individual PDFs',
          description: 'Ensure each PDF is properly formatted and contains the content you need.',
          tips: [
            'Remove unnecessary pages first',
            'Check for consistent page orientations',
            'Verify image quality and text readability'
          ]
        },
        {
          title: 'Merge Documents Strategically',
          description: 'Use the merge tool to combine PDFs in the correct order.',
          warnings: [
            'Always preview the merged document',
            'Keep backups of original files'
          ]
        },
        {
          title: 'Final Review and Optimization',
          description: 'Review the merged document and optimize for size and usability.',
          tips: [
            'Add bookmarks for easy navigation',
            'Compress if file size is too large',
            'Test accessibility features'
          ]
        }
      ],
      relatedGuides: ['pdf-workflow-automation', 'pdf-compression-guide']
    },
    {
      id: 'pdf-security-best-practices',
      title: 'PDF Security & Privacy Best Practices',
      description: 'Comprehensive guide to securing PDFs, protecting sensitive information, and maintaining privacy compliance.',
      category: 'Security',
      difficulty: 'Intermediate',
      estimatedTime: '25 minutes',
      tools: ['protect-pdf', 'watermark-pdf'],
      icon: '🔒',
      steps: [
        {
          title: 'Assess Security Requirements',
          description: 'Determine what level of protection your documents need based on content sensitivity.',
          tips: [
            'Classify documents by sensitivity level',
            'Understand regulatory requirements (GDPR, HIPAA)',
            'Consider audience and distribution methods'
          ]
        },
        {
          title: 'Apply Appropriate Protection',
          description: 'Use password protection and permission settings effectively.',
          tips: [
            'Use strong, unique passwords',
            'Set appropriate permission levels',
            'Consider read-only vs. editing permissions'
          ],
          warnings: [
            'Document passwords separately and securely',
            'Remember that PDF security is not encryption'
          ]
        },
        {
          title: 'Add Watermarks and Metadata',
          description: 'Use watermarks to identify document ownership and control usage.',
          tips: [
            'Choose subtle but visible watermark placement',
            'Include contact information in watermarks',
            'Remove sensitive metadata before sharing'
          ]
        },
        {
          title: 'Secure Distribution',
          description: 'Implement secure methods for sharing protected PDFs.',
          tips: [
            'Use secure channels for password sharing',
            'Consider document expiration policies',
            'Track document access when possible'
          ]
        }
      ],
      relatedGuides: ['gdpr-compliance-guide', 'document-workflow-security']
    },
    {
      id: 'pdf-conversion-mastery',
      title: 'Master PDF Conversion Workflows',
      description: 'Advanced techniques for converting between PDF and other formats while maintaining quality and formatting.',
      category: 'Conversion',
      difficulty: 'Intermediate',
      estimatedTime: '30 minutes',
      tools: ['word-to-pdf', 'excel-to-pdf', 'images-to-pdf', 'pdf-to-image'],
      icon: '🔄',
      steps: [
        {
          title: 'Choose the Right Source Format',
          description: 'Understanding which source formats work best for different PDF use cases.',
          tips: [
            'Use Word for text-heavy documents',
            'Excel works well for data tables and reports',
            'High-resolution images for visual content'
          ]
        },
        {
          title: 'Optimize Before Conversion',
          description: 'Prepare your source documents for optimal PDF output.',
          tips: [
            'Check formatting consistency in source documents',
            'Optimize image sizes and quality',
            'Set proper margins and page layouts'
          ],
          warnings: [
            'Complex layouts may not convert perfectly',
            'Test with small samples first'
          ]
        },
        {
          title: 'Convert with Quality Settings',
          description: 'Use appropriate quality settings for your intended use.',
          tips: [
            'Higher quality for printing',
            'Balanced settings for digital sharing',
            'Compress for email or web distribution'
          ]
        },
        {
          title: 'Post-Conversion Review',
          description: 'Always review converted PDFs for quality and accuracy.',
          tips: [
            'Check text readability and formatting',
            'Verify image quality and positioning',
            'Test interactive elements if present'
          ]
        }
      ],
      relatedGuides: ['pdf-optimization-guide', 'batch-processing-workflows']
    },
    {
      id: 'pdf-accessibility-guide',
      title: 'Create Accessible PDF Documents',
      description: 'Learn to create PDFs that are accessible to users with disabilities while maintaining professional quality.',
      category: 'Accessibility',
      difficulty: 'Advanced',
      estimatedTime: '45 minutes',
      tools: ['add-text-pdf', 'extract-text-pdf', 'ocr-pdf'],
      icon: '♿',
      steps: [
        {
          title: 'Understand Accessibility Standards',
          description: 'Learn WCAG guidelines and PDF/UA standards for accessible documents.',
          tips: [
            'Study WCAG 2.1 AA compliance requirements',
            'Understand screen reader compatibility',
            'Learn about keyboard navigation requirements'
          ]
        },
        {
          title: 'Structure Content Properly',
          description: 'Use proper headings, lists, and document structure.',
          tips: [
            'Use heading hierarchy (H1, H2, H3)',
            'Provide alternative text for images',
            'Ensure proper reading order'
          ]
        },
        {
          title: 'Enhance Text Recognition',
          description: 'Use OCR and text extraction to improve text accessibility.',
          tips: [
            'Run OCR on scanned documents',
            'Verify text extraction accuracy',
            'Add tags to improve structure'
          ]
        },
        {
          title: 'Test Accessibility Features',
          description: 'Validate accessibility using screen readers and testing tools.',
          tips: [
            'Test with actual screen reading software',
            'Check keyboard-only navigation',
            'Validate with accessibility checkers'
          ]
        }
      ],
      relatedGuides: ['pdf-structure-guide', 'universal-design-principles']
    },
    {
      id: 'batch-processing-workflows',
      title: 'Automate with Batch Processing',
      description: 'Streamline your workflow by processing multiple PDFs efficiently using batch operations and automation.',
      category: 'Automation',
      difficulty: 'Advanced',
      estimatedTime: '35 minutes',
      tools: ['compress-pdf', 'watermark-pdf', 'merge-pdf'],
      icon: '⚡',
      steps: [
        {
          title: 'Plan Your Batch Operations',
          description: 'Organize files and define consistent processing rules.',
          tips: [
            'Group files by processing requirements',
            'Establish naming conventions',
            'Create processing checklists'
          ]
        },
        {
          title: 'Set Up Consistent Parameters',
          description: 'Define standard settings for batch operations.',
          tips: [
            'Use consistent compression levels',
            'Standardize watermark placement',
            'Define quality standards'
          ]
        },
        {
          title: 'Process and Validate',
          description: 'Execute batch operations with quality control.',
          tips: [
            'Process in small batches first',
            'Implement quality checkpoints',
            'Keep detailed processing logs'
          ]
        },
        {
          title: 'Optimize for Scale',
          description: 'Improve efficiency for large-scale operations.',
          tips: [
            'Monitor processing performance',
            'Adjust batch sizes for optimal speed',
            'Implement error handling procedures'
          ]
        }
      ],
      relatedGuides: ['pdf-workflow-automation', 'enterprise-document-management']
    },
    {
      id: 'pdf-optimization-guide',
      title: 'Optimize PDFs for Performance',
      description: 'Advanced techniques for reducing file sizes while maintaining quality, improving load times and user experience.',
      category: 'Optimization',
      difficulty: 'Intermediate',
      estimatedTime: '20 minutes',
      tools: ['compress-pdf', 'extract-images-from-pdf'],
      icon: '🚀',
      steps: [
        {
          title: 'Analyze Current PDF Structure',
          description: 'Understand what makes your PDF large and identify optimization opportunities.',
          tips: [
            'Check image compression levels',
            'Identify duplicate or unnecessary elements',
            'Analyze font embedding'
          ]
        },
        {
          title: 'Apply Smart Compression',
          description: 'Use appropriate compression settings for different content types.',
          tips: [
            'Higher compression for photographs',
            'Preserve quality for text and line art',
            'Balance file size with intended use'
          ]
        },
        {
          title: 'Optimize Images and Graphics',
          description: 'Specifically optimize visual elements for web or print.',
          tips: [
            'Extract and re-compress large images',
            'Convert to appropriate color spaces',
            'Remove unused graphics elements'
          ]
        },
        {
          title: 'Test and Validate',
          description: 'Ensure optimized PDFs maintain quality and functionality.',
          tips: [
            'Compare before and after quality',
            'Test on different devices and browsers',
            'Verify all interactive elements still work'
          ]
        }
      ],
      relatedGuides: ['pdf-conversion-mastery', 'web-optimization-guide']
    }
  ];

  const categories = useMemo(() => {
    const cats = guides.map(guide => guide.category);
    return Array.from(new Set(cats));
  }, [guides]);

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const filteredGuides = useMemo(() => {
    return guides.filter(guide => {
      const matchesCategory = !selectedCategory || guide.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || guide.difficulty === selectedDifficulty;
      const matchesSearch = !searchQuery ||
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.tools.some(tool => tool.includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [guides, selectedCategory, selectedDifficulty, searchQuery]);

  const guidesFAQs = [
    {
      id: 'guides-secure-pdf-processing',
      question: 'How to process PDFs securely without uploading files to servers?',
      answer: 'Our <a href="/pdf-hub/security" class="text-blue-600 hover:text-blue-800 underline">security guides</a> show you browser-based PDF processing that keeps all files on your device. No uploads, no cloud storage, no privacy risks - just local processing with enterprise-grade security. Learn more about <a href="/pdf-hub/workflows" class="text-blue-600 hover:text-blue-800 underline">secure workflows</a>.',
      category: 'Privacy & Security',
      aiSnippetTarget: true,
      voiceOptimized: true,
      searchKeywords: ['secure pdf processing', 'private pdf tools', 'offline pdf editing', 'no upload pdf']
    },
    {
      id: 'guides-business-workflows',
      question: 'What\'s the best way to create PDF processing workflows for business teams?',
      answer: 'Our <a href="/pdf-hub/workflows" class="text-blue-600 hover:text-blue-800 underline">business workflow guides</a> cover document standardization, batch processing techniques, quality control checkpoints, and team collaboration methods - all while maintaining document security. Explore our <a href="/pdf-hub/comparison" class="text-blue-600 hover:text-blue-800 underline">tool comparison</a> for the best workflow combinations.',
      category: 'Business Workflows',
      aiSnippetTarget: true,
      searchKeywords: ['business pdf workflows', 'team document processing', 'pdf automation business']
    },
    {
      id: 'guides-quality-preservation',
      question: 'How to merge multiple PDFs into one file without losing quality?',
      answer: 'Follow our quality-preserving merge techniques: maintain original compression settings, preserve metadata, handle mixed orientations properly, and optimize final output for intended use case. Check our <a href="/merge-pdf" class="text-blue-600 hover:text-blue-800 underline">merge PDF tool</a> for practical examples and <a href="/pdf-hub/guides" class="text-blue-600 hover:text-blue-800 underline">step-by-step tutorials</a>.',
      category: 'Quality Control',
      voiceOptimized: true,
      aiSnippetTarget: true,
      searchKeywords: ['merge pdf without quality loss', 'high quality pdf combining', 'preserve pdf resolution']
    },
    {
      id: 'guides-compliance-processing',
      question: 'How to ensure PDF processing meets legal and compliance requirements?',
      answer: 'Our compliance guides cover GDPR-compliant processing, audit trail creation, metadata handling, redaction best practices, and maintaining document integrity for legal use. Learn about <a href="/pdf-hub/security" class="text-blue-600 hover:text-blue-800 underline">privacy-first processing</a> and explore our <a href="/watermark-pdf" class="text-blue-600 hover:text-blue-800 underline">watermarking tool</a> for document protection.',
      category: 'Legal Compliance',
      aiSnippetTarget: true,
      searchKeywords: ['gdpr pdf processing', 'legal pdf compliance', 'compliant document processing']
    },
    {
      id: 'guides-advanced-optimization',
      question: 'What are the most effective PDF optimization techniques for different use cases?',
      answer: 'Learn context-specific optimization: web display requires different compression than print, email attachments need size limits, archival storage demands preservation quality - our guides cover all scenarios. Try our <a href="/compress-pdf" class="text-blue-600 hover:text-blue-800 underline">compression tool</a> and explore <a href="/pdf-hub/comparison" class="text-blue-600 hover:text-blue-800 underline">optimization strategies</a>.',
      category: 'Advanced Techniques',
      voiceOptimized: true,
      searchKeywords: ['pdf optimization techniques', 'context specific pdf processing', 'professional pdf optimization']
    },
    {
      id: 'guides-troubleshooting-complex',
      question: 'How to troubleshoot complex PDF processing issues and corrupted files?',
      answer: 'Our troubleshooting guides provide systematic approaches to handle corrupted PDFs, encoding issues, password-protected files, and recovery techniques for damaged documents. Start with our <a href="/pdf-hub/guides" class="text-blue-600 hover:text-blue-800 underline">diagnostic guides</a> or try our <a href="/extract-text-pdf" class="text-blue-600 hover:text-blue-800 underline">text extraction tool</a> for data recovery.',
      category: 'Problem Solving',
      aiSnippetTarget: true,
      voiceOptimized: true,
      searchKeywords: ['fix corrupted pdf', 'pdf troubleshooting', 'repair damaged pdf files', 'pdf processing errors']
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "PDF Processing Guides - Complete Tutorials",
    "description": "Comprehensive step-by-step guides for PDF processing, from basic document management to advanced automation workflows.",
    "url": "https://localpdf.tech/pdf-hub/guides",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": guides.map((guide, index) => ({
        "@type": "HowTo",
        "position": index + 1,
        "name": guide.title,
        "description": guide.description,
        "totalTime": guide.estimatedTime,
        "step": guide.steps.map((step, stepIndex) => ({
          "@type": "HowToStep",
          "position": stepIndex + 1,
          "name": step.title,
          "text": step.description
        }))
      }))
    }
  };

  return (
    <>
      <Helmet>
        <title>PDF Processing Guides - Complete Tutorials | LocalPDF</title>
        <meta
          name="description"
          content="Master PDF processing with our comprehensive guides. Step-by-step tutorials for document management, security, conversion, and automation."
        />
        <meta name="keywords" content="pdf guides, pdf tutorials, document management, pdf security, pdf conversion, pdf automation" />
        <link rel="canonical" href={"https://localpdf.tech/pdf-hub/guides"} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex flex-col">
        <ModernHeader />

        <main className="flex-grow">
          {/* Breadcrumb */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <ClusterBreadcrumb currentCluster="pdf-hub" />
            </div>
          </div>

          {/* Hero Section */}
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
                <span className="text-2xl">📚</span>
                PDF Processing Guides
              </div>

              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 bg-clip-text text-transparent mb-6">
                PDF Processing Guides - Step-by-Step Tutorials
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                <SemanticContent
                  entity="DocumentManagement"
                  context="description"
                  maxVariants={1}
                >
                  Learn professional PDF processing with detailed, step-by-step guides covering everything from basic operations to advanced workflows.
                </SemanticContent>
              </p>
            </div>

            {/* Filters */}
            <div className="mb-12 space-y-4">
              {/* Search */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search guides..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category and Difficulty Filters */}
              <div className="flex flex-wrap justify-center gap-4">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      !selectedCategory
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Difficulties */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedDifficulty('')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      !selectedDifficulty
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
All Levels
                  </button>
                  {difficulties.map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedDifficulty === difficulty
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

          {/* Guides Grid */}
          <section className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
              {filteredGuides.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No guides found</h3>
                <p className="text-gray-600 dark:text-gray-300">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredGuides.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            )}
          </div>
        </section>

          {/* FAQ Section */}
          <section className="py-16 px-4 bg-white/50 dark:bg-gray-800/50">
            <div className="max-w-4xl mx-auto">
              <SmartFAQ
                baseFAQs={guidesFAQs}
                entityId="DocumentManagement"
                maxItems={6}
                showSearch={true}
                showCategories={true}
                enableVoiceSearch={true}
              />
          </div>
          </section>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

// Individual Guide Card Component
const GuideCard: React.FC<{ guide: Guide }> = ({ guide }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{guide.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {guide.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {guide.description}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
            {guide.difficulty}
          </span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
            {guide.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {guide.estimatedTime}
          </span>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-6">
        {/* Steps Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Guide Steps ({guide.steps.length})
          </h4>
          <div className="space-y-2">
            {guide.steps.slice(0, 3).map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <span>{step.title}</span>
              </div>
            ))}
            {guide.steps.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 pl-7">
                +{guide.steps.length - 3} more steps
              </div>
            )}
          </div>
        </div>

        {/* Tools Used */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Tools Used
          </h4>
          <div className="flex flex-wrap gap-2">
            {guide.tools.map((tool, index) => (
              <Link
                key={index}
                to={`/${tool}`}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {tool.replace(/-/g, ' ').replace(/pdf/g, 'PDF').toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/${guide.tools[0]}`}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
        >
Start Guide
        </Link>
      </div>
    </div>
  );
};

export default GuidesPage;
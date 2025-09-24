// src/pages/authority/WorkflowsPage.tsx
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

interface Workflow {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  tools: string[];
  timeEstimate: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  industry?: string[];
}

interface WorkflowStep {
  title: string;
  description: string;
  tool?: string;
  action: string;
}

const WorkflowsPage: React.FC = () => {
  const entity = useEntity('DocumentManagement');

  const workflows: Workflow[] = [
    {
      id: 'legal-document-preparation',
      title: 'Legal Document Preparation',
      description: 'Complete workflow for preparing legal documents with proper security and compliance.',
      category: 'Legal',
      timeEstimate: '15-20 minutes',
      difficulty: 'Intermediate',
      icon: '⚖️',
      industry: ['Legal', 'Corporate'],
      tools: ['merge-pdf', 'protect-pdf', 'watermark-pdf'],
      steps: [
        {
          title: 'Merge related documents',
          description: 'Combine all related legal documents into a single PDF',
          tool: 'merge-pdf',
          action: 'Upload and merge all relevant documents'
        },
        {
          title: 'Add legal watermark',
          description: 'Apply confidential or draft watermarks',
          tool: 'watermark-pdf',
          action: 'Add appropriate legal watermarks'
        },
        {
          title: 'Password protect',
          description: 'Secure the document with encryption',
          tool: 'protect-pdf',
          action: 'Set password and encryption level'
        }
      ]
    },
    {
      id: 'business-report-compilation',
      title: 'Business Report Compilation',
      description: 'Standard workflow for creating professional business reports from multiple sources.',
      category: 'Business',
      timeEstimate: '10-15 minutes',
      difficulty: 'Beginner',
      icon: '📊',
      industry: ['Business', 'Consulting'],
      tools: ['word-to-pdf', 'excel-to-pdf', 'merge-pdf', 'compress-pdf'],
      steps: [
        {
          title: 'Convert source documents',
          description: 'Convert Word documents and Excel sheets to PDF',
          tool: 'word-to-pdf',
          action: 'Convert all source files to PDF format'
        },
        {
          title: 'Merge into single report',
          description: 'Combine all PDFs in the correct order',
          tool: 'merge-pdf',
          action: 'Arrange and merge all sections'
        },
        {
          title: 'Optimize file size',
          description: 'Compress for easy sharing and storage',
          tool: 'compress-pdf',
          action: 'Reduce file size while maintaining quality'
        }
      ]
    },
    {
      id: 'medical-record-processing',
      title: 'Medical Record Processing',
      description: 'HIPAA-compliant workflow for processing medical documents.',
      category: 'Healthcare',
      timeEstimate: '20-25 minutes',
      difficulty: 'Advanced',
      icon: '🏥',
      industry: ['Healthcare', 'Medical'],
      tools: ['ocr-pdf', 'merge-pdf', 'protect-pdf', 'extract-text-pdf'],
      steps: [
        {
          title: 'Extract text from scanned documents',
          description: 'Use OCR to digitize handwritten or scanned records',
          tool: 'ocr-pdf',
          action: 'Process scanned medical documents'
        },
        {
          title: 'Combine patient records',
          description: 'Merge all documents for complete patient file',
          tool: 'merge-pdf',
          action: 'Create comprehensive patient record'
        },
        {
          title: 'Apply HIPAA-compliant security',
          description: 'Encrypt and protect sensitive medical data',
          tool: 'protect-pdf',
          action: 'Set strong encryption and access controls'
        }
      ]
    },
    {
      id: 'educational-material-preparation',
      title: 'Educational Material Preparation',
      description: 'Workflow for creating and organizing educational content.',
      category: 'Education',
      timeEstimate: '12-18 minutes',
      difficulty: 'Beginner',
      icon: '📚',
      industry: ['Education', 'Training'],
      tools: ['images-to-pdf', 'merge-pdf', 'add-text-pdf', 'watermark-pdf'],
      steps: [
        {
          title: 'Convert images to PDFs',
          description: 'Transform charts, diagrams, and handouts to PDF',
          tool: 'images-to-pdf',
          action: 'Convert all visual materials'
        },
        {
          title: 'Add annotations and text',
          description: 'Include instructions and explanations',
          tool: 'add-text-pdf',
          action: 'Add educational annotations'
        },
        {
          title: 'Combine into curriculum',
          description: 'Merge all materials in teaching order',
          tool: 'merge-pdf',
          action: 'Create complete educational package'
        }
      ]
    }
  ];

  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>('All');

  const categories = ['All', 'Legal', 'Business', 'Healthcare', 'Education'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredWorkflows = workflows.filter(workflow => {
    const categoryMatch = selectedCategory === 'All' || workflow.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All' || workflow.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const workflowFAQs = [
    {
      id: "workflow-follow",
      question: "How do I follow a workflow step by step?",
      answer: "Each workflow provides detailed steps with links to the specific tools needed. Click 'Start Workflow' to begin, then follow each step in order for the best results.",
      category: "workflows"
    },
    {
      id: "workflow-customize",
      question: "Can I customize these workflows for my specific needs?",
      answer: "Absolutely! These workflows are templates that you can adapt. Skip steps that don't apply to your situation or add additional tools as needed.",
      category: "workflows"
    },
    {
      id: "workflow-industry",
      question: "Are these workflows industry-specific?",
      answer: "Yes, we've designed workflows for different industries including legal, healthcare, business, and education. Each includes industry-specific considerations and compliance requirements.",
      category: "workflows"
    },
    {
      id: "workflow-time",
      question: "How long do these workflows typically take?",
      answer: "Most workflows take 10-25 minutes depending on complexity and the number of documents. Time estimates are provided for each workflow to help you plan.",
      category: "workflows"
    }
  ];

  return (
    <>
      <Helmet>
        <title>PDF Workflows - Professional Process Guides | LocalPDF</title>
        <meta
          name="description"
          content="Complete step-by-step PDF workflows for legal, business, healthcare, and educational document processing. Industry-specific guides with tool recommendations."
        />
        <meta name="keywords" content="PDF workflow, document process, business workflow, legal documents, medical records, educational materials" />
        <link rel="canonical" href="https://localpdf.tech/pdf-hub/workflows" />

        {/* Schema.org Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "PDF Workflows - Process Guides",
            "description": "Comprehensive step-by-step workflows for professional PDF document processing across different industries",
            "url": "https://localpdf.tech/pdf-hub/workflows",
            "isPartOf": {
              "@type": "WebSite",
              "name": "LocalPDF",
              "url": "https://localpdf.tech"
            },
            "about": {
              "@type": "Thing",
              "name": "PDF Document Workflows",
              "description": "Professional document processing workflows"
            },
            "audience": {
              "@type": "Audience",
              "audienceType": ["Business professionals", "Legal professionals", "Healthcare workers", "Educators"]
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
        <ModernHeader />

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8 pt-24">
            {/* Breadcrumb */}
            <ClusterBreadcrumb
              currentCluster="pdf-management"
              className="mb-8"
            />

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              PDF Workflows
            </h1>

            <SemanticContent
              entity="DocumentManagement"
              context="description"
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
            >
              Step-by-step workflows for professional PDF document processing across different industries and use cases.
            </SemanticContent>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Industry-Specific Guides
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Step-by-Step Process
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Tool Integration
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div className="flex flex-wrap gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Category:</span>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Difficulty:</span>
                {difficulties.map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedDifficulty === difficulty
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Workflows Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {filteredWorkflows.map(workflow => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>

          {/* FAQ Section */}
          <SmartFAQ
            baseFAQs={workflowFAQs}
            entityId="DocumentManagement"
            className="mb-8"
          />
          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

// Individual Workflow Card Component
const WorkflowCard: React.FC<{ workflow: Workflow }> = ({ workflow }) => {
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
          <div className="text-4xl">{workflow.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {workflow.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {workflow.description}
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(workflow.difficulty)}`}>
            {workflow.difficulty}
          </span>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
            {workflow.category}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {workflow.timeEstimate}
          </span>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="p-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          Workflow Steps ({workflow.steps.length})
        </h4>
        <div className="space-y-3 mb-6">
          {workflow.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {step.title}
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
                {step.tool && (
                  <Link
                    to={`/${step.tool}`}
                    className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Use {step.tool.replace(/-/g, ' ').replace(/pdf/g, 'PDF').toUpperCase()}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tools Used */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Tools Used
          </h4>
          <div className="flex flex-wrap gap-2">
            {workflow.tools.map((tool, index) => (
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
          to={`/${workflow.tools[0]}`}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
        >
          Start Workflow
        </Link>
      </div>
    </div>
  );
};

export default WorkflowsPage;
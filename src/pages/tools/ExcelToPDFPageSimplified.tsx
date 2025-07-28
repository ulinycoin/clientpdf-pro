import React from 'react';
import ExcelToPDFTool from '../../components/organisms/ExcelToPDFTool';

const ExcelToPDFPage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Excel to PDF' }
  ];

  const relatedTools = [
    {
      name: 'Word to PDF',
      description: 'Convert Word documents to PDF',
      href: '/word-to-pdf',
      icon: '📄'
    },
    {
      name: 'Image to PDF',
      description: 'Convert images to PDF format',
      href: '/images-to-pdf',
      icon: '🖼️'
    },
    {
      name: 'Merge PDF',
      description: 'Combine multiple PDF files',
      href: '/merge-pdf',
      icon: '📑'
    },
    {
      name: 'Split PDF',
      description: 'Split PDF into separate files',
      href: '/split-pdf',
      icon: '✂️'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Excel to PDF Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert your Excel files (.xlsx, .xls) to PDF format with support for multiple sheets, wide tables, and international text. All processing happens locally.
          </p>
        </div>

        <ExcelToPDFTool />

        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">
              How to Convert Excel to PDF
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Upload Excel File
                </h3>
                <p className="text-gray-600">
                  Select your Excel file (.xlsx or .xls)
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Configure Settings
                </h3>
                <p className="text-gray-600">
                  Choose sheets, orientation, and formatting options
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📥</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Download PDF
                </h3>
                <p className="text-gray-600">
                  Get your converted PDF files
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Related Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((tool, index) => (
                <a
                  key={index}
                  href={tool.href}
                  className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-2xl mb-2">{tool.icon}</div>
                  <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
                  <p className="text-xs text-gray-600">{tool.description}</p>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelToPDFPage;

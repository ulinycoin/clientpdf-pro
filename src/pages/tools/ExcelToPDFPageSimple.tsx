import React from 'react';

const ExcelToPDFPageSimple: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Excel to PDF Converter
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert Excel files to PDF format - Coming Soon!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold mb-4">Excel to PDF Tool</h2>
            <p className="text-gray-600 mb-6">
              This tool is currently under development.
              Soon you'll be able to convert Excel spreadsheets to PDF format
              with support for multiple sheets and international languages.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Features (Coming Soon):</h3>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Convert .xlsx and .xls files</li>
                <li>• Support for multiple sheets</li>
                <li>• International language support</li>
                <li>• Preserve formatting and colors</li>
                <li>• 100% privacy - all processing in your browser</li>
              </ul>
            </div>

            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to PDF Tools
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelToPDFPageSimple;

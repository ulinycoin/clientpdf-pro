import React from 'react';
import ToolCard from '../molecules/ToolCard';

interface ToolsGridProps {
  onToolSelect: (toolType: string) => void;
  disabledTools?: string[];
  className?: string;
}

const ToolsGrid: React.FC<ToolsGridProps> = ({
  onToolSelect,
  disabledTools = [],
  className = ''
}) => {
  const tools = [
    // Core PDF Operations
    {
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into one document',
      icon: 'PDF',
      operationType: 'merge',
      category: 'core'
    },
    {
      title: 'Split PDF', 
      description: 'Split PDF into separate pages or extract range',
      icon: 'SPLIT',
      operationType: 'split',
      category: 'core'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: 'COMPRESS', 
      operationType: 'compress',
      category: 'core'
    },
    
    // Text & Content Operations
    {
      title: 'Add Text',
      description: 'Add text annotations and comments to your PDF',
      icon: '✏️',
      operationType: 'add-text',
      category: 'content'
    },
    {
      title: 'Extract Text',
      description: 'Extract text content from PDF files',
      icon: 'TEXT',
      operationType: 'extract-text', 
      category: 'content'
    },
    {
      title: 'Add Watermark',
      description: 'Add text watermarks to protect your documents',
      icon: 'WATERMARK',
      operationType: 'watermark',
      category: 'content'
    },
    
    // Page Operations  
    {
      title: 'Rotate Pages',
      description: 'Rotate pages 90, 180, or 270 degrees',
      icon: 'ROTATE',
      operationType: 'rotate',
      category: 'pages'
    },
    {
      title: 'Extract Pages',
      description: 'Extract specific pages from your PDF into a new document',
      icon: 'EXTRACT',
      operationType: 'extract-pages',
      category: 'pages'
    },
    
    // Conversion Operations
    {
      title: 'PDF to Images',
      description: 'Convert PDF pages to high-quality PNG or JPEG images',
      icon: 'IMAGE',
      operationType: 'pdf-to-image',
      category: 'conversion'
    }
  ];

  const handleToolClick = (operationType: string) => {
    onToolSelect(operationType);
  };

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Tools Section */}
      <div className="relative">
        {/* Section title with icon */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="h-px bg-gradient-to-r from-transparent to-gray-300 flex-1"></div>
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <span className="text-2xl">🛠️</span>
            <h3 className="text-xl font-semibold text-gray-800">
              Choose Your Tool
            </h3>
          </div>
          <div className="h-px bg-gradient-to-l from-transparent to-gray-300 flex-1"></div>
        </div>
        
        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <ToolCard
              key={tool.operationType}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              operationType={tool.operationType}
              disabled={disabledTools.includes(tool.operationType)}
              onClick={() => handleToolClick(tool.operationType)}
              className="min-h-[280px] flex flex-col transform transition-all duration-200 hover:scale-105"
            />
          ))}
        </div>
      </div>
      
      {/* Upload Reminder - Enhanced */}
      {disabledTools.length > 0 && (
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl p-8 text-center overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-3xl">📁</span>
            </div>
            <h4 className="text-2xl font-bold text-blue-900 mb-3">
              Ready to Process Your PDFs?
            </h4>
            <p className="text-blue-700 text-lg max-w-md mx-auto mb-4">
              Upload your PDF files above to unlock all professional tools
            </p>
            <div className="inline-flex items-center space-x-2 text-blue-600 font-medium">
              <span>Drag & Drop</span>
              <span className="text-blue-400">•</span>
              <span>Browse Files</span>
              <span className="text-blue-400">•</span>
              <span>Start Processing</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Statistics */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
        <div className="text-center mb-6">
          <h4 className="text-2xl font-bold text-gray-800 mb-2">Why Choose LocalPDF?</h4>
          <p className="text-gray-600">The numbers speak for themselves</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white text-2xl font-bold">{tools.length}</span>
            </div>
            <div className="text-sm font-medium text-gray-800">Professional Tools</div>
            <div className="text-xs text-gray-500">Everything you need</div>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white text-xl font-bold">100%</span>
            </div>
            <div className="text-sm font-medium text-gray-800">Private & Secure</div>
            <div className="text-xs text-gray-500">No server uploads</div>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white text-2xl font-bold">0</span>
            </div>
            <div className="text-sm font-medium text-gray-800">Data Collection</div>
            <div className="text-xs text-gray-500">Zero tracking</div>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white text-2xl font-bold">∞</span>
            </div>
            <div className="text-sm font-medium text-gray-800">Usage Limits</div>
            <div className="text-xs text-gray-500">Unlimited & free</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsGrid;
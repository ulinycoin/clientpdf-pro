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

  const groupedTools = {
    core: tools.filter(tool => tool.category === 'core'),
    content: tools.filter(tool => tool.category === 'content'), 
    pages: tools.filter(tool => tool.category === 'pages'),
    conversion: tools.filter(tool => tool.category === 'conversion')
  };

  const categoryTitles = {
    core: 'Core Operations',
    content: 'Text & Content',
    pages: 'Page Management', 
    conversion: 'Conversion Tools'
  };

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          PDF Tools ({tools.length} Available)
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Professional PDF processing tools that work entirely in your browser. 
          Your files never leave your device.
        </p>
      </div>

      {/* All Tools in One Grid */}
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          All Available Tools
        </h3>
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
              className="min-h-[280px] flex flex-col"
            />
          ))}
        </div>
      </div>

      {/* Categorized View - Alternative Layout */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Tools by Category
          </h3>
          <p className="text-gray-600">Browse tools organized by function</p>
        </div>
        
        {Object.entries(groupedTools).map(([category, categoryTools]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2">
              {categoryTitles[category as keyof typeof categoryTitles]} ({categoryTools.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTools.map((tool) => (
                <ToolCard
                  key={`${category}-${tool.operationType}`}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  operationType={tool.operationType}
                  disabled={disabledTools.includes(tool.operationType)}
                  onClick={() => handleToolClick(tool.operationType)}
                  className="min-h-[240px]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Upload Reminder */}
      {disabledTools.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-blue-600 text-2xl mb-2">📁</div>
          <h4 className="text-lg font-medium text-blue-900 mb-2">
            Upload PDF Files to Get Started
          </h4>
          <p className="text-blue-700">
            Select "Choose Files" above or drag and drop your PDF files to enable all tools
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{tools.length}</div>
            <div className="text-sm text-gray-600">PDF Tools</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Private</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Server Upload</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">∞</div>
            <div className="text-sm text-gray-600">File Size*</div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-3">
          * Limited only by your device's memory and browser capabilities
        </p>
      </div>
    </div>
  );
};

export default ToolsGrid;
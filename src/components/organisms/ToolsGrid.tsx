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
    {
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into one document',
      icon: 'PDF',
      operationType: 'merge',
      comingSoon: false
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: 'COMPRESS',
      operationType: 'compress',
      comingSoon: false
    },
    {
      title: 'Split PDF',
      description: 'Extract pages or split PDF into multiple files',
      icon: 'SPLIT',
      operationType: 'split',
      comingSoon: false
    },
    {
      title: 'Rotate Pages',
      description: 'Rotate pages 90, 180, or 270 degrees',
      icon: 'ROTATE',
      operationType: 'rotate',
      comingSoon: false
    },
    {
      title: 'Add Watermark',
      description: 'Add text or image watermarks to your PDF',
      icon: 'WATERMARK',
      operationType: 'watermark',
      comingSoon: true
    },
    {
      title: 'Extract Pages',
      description: 'Extract specific pages from your PDF',
      icon: 'EXTRACT',
      operationType: 'extract',
      comingSoon: true
    },
    {
      title: 'Extract Text',
      description: 'Extract text content from PDF files',
      icon: 'TEXT',
      operationType: 'extract-text',
      comingSoon: true
    },
    {
      title: 'PDF to Images',
      description: 'Convert PDF pages to JPG or PNG images',
      icon: 'IMAGE',
      operationType: 'convert',
      comingSoon: true
    }
  ];

  const handleToolClick = (operationType: string) => {
    onToolSelect(operationType);
  };

  return (
    <div className={className}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Tool
        </h2>
        <p className="text-lg text-gray-600">
          Select a tool to get started with your PDF processing
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.operationType}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            disabled={disabledTools.includes(tool.operationType) || tool.comingSoon}
            onClick={() => handleToolClick(tool.operationType)}
          />
        ))}
      </div>
      
      {disabledTools.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Upload some PDF files to enable the tools above
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolsGrid;
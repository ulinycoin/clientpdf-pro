import React from 'react';
import { PDFOperationType, ToolsGridProps } from '../../types';
import ToolCard from '../molecules/ToolCard';

const ToolsGrid: React.FC<ToolsGridProps> = ({
  onToolSelect,
  disabledTools = [],
  className = ''
}) => {
  const tools = [
    {
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into one document',
      icon: '📄',
      operationType: PDFOperationType.MERGE,
      comingSoon: false
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: '🗜️',
      operationType: PDFOperationType.COMPRESS,
      comingSoon: false
    },
    {
      title: 'Split PDF',
      description: 'Extract pages or split PDF into multiple files',
      icon: '✂️',
      operationType: PDFOperationType.SPLIT,
      comingSoon: true
    },
    {
      title: 'Rotate Pages',
      description: 'Rotate pages 90, 180, or 270 degrees',
      icon: '🔄',
      operationType: PDFOperationType.ROTATE,
      comingSoon: true
    },
    {
      title: 'Add Watermark',
      description: 'Add text or image watermarks to your PDF',
      icon: '💧',
      operationType: PDFOperationType.WATERMARK,
      comingSoon: true
    },
    {
      title: 'Extract Pages',
      description: 'Extract specific pages from your PDF',
      icon: '📃',
      operationType: PDFOperationType.EXTRACT_PAGES,
      comingSoon: true
    },
    {
      title: 'Extract Text',
      description: 'Extract text content from PDF files',
      icon: '📝',
      operationType: PDFOperationType.EXTRACT_TEXT,
      comingSoon: true
    },
    {
      title: 'PDF to Images',
      description: 'Convert PDF pages to JPG or PNG images',
      icon: '🖼️',
      operationType: PDFOperationType.CONVERT,
      comingSoon: true
    }
  ];

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
            operationType={tool.operationType}
            disabled={disabledTools.includes(tool.operationType)}
            comingSoon={tool.comingSoon}
            onClick={onToolSelect}
          />
        ))}
      </div>
      
      {disabledTools.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 Upload some PDF files to enable the tools above
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolsGrid;
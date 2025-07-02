import React from 'react';
import { Link } from 'react-router-dom';
import { relatedTools, toolsSEOData } from '../../data/seoData';

interface RelatedToolsProps {
  currentTool: string;
  className?: string;
}

interface ToolInfo {
  name: string;
  title: string;
  description: string;
  path: string;
  icon: string;
}

export const RelatedTools: React.FC<RelatedToolsProps> = ({ 
  currentTool, 
  className = '' 
}) => {
  const getToolInfo = (toolKey: string): ToolInfo => {
    const toolData = toolsSEOData[toolKey as keyof typeof toolsSEOData];
    
    const toolIcons: Record<string, string> = {
      merge: '📄',
      split: '✂️',
      compress: '🗜️',
      addText: '✍️',
      watermark: '🏷️',
      rotate: '🔄',
      extractPages: '📑',
      extractText: '📝',
      pdfToImage: '🖼️'
    };

    const toolPaths: Record<string, string> = {
      merge: '/merge-pdf',
      split: '/split-pdf',
      compress: '/compress-pdf',
      addText: '/add-text-pdf',
      watermark: '/watermark-pdf',
      rotate: '/rotate-pdf',
      extractPages: '/extract-pages-pdf',
      extractText: '/extract-text-pdf',
      pdfToImage: '/pdf-to-image'
    };

    const toolNames: Record<string, string> = {
      merge: 'Merge PDFs',
      split: 'Split PDFs',
      compress: 'Compress PDFs',
      addText: 'Add Text',
      watermark: 'Add Watermark',
      rotate: 'Rotate Pages',
      extractPages: 'Extract Pages',
      extractText: 'Extract Text',
      pdfToImage: 'PDF to Images'
    };

    return {
      name: toolNames[toolKey] || toolKey,
      title: toolData?.title.split(' - ')[0] || toolNames[toolKey],
      description: getShortDescription(toolKey),
      path: toolPaths[toolKey] || `/${toolKey}`,
      icon: toolIcons[toolKey] || '🔧'
    };
  };

  const getShortDescription = (toolKey: string): string => {
    const descriptions: Record<string, string> = {
      merge: 'Combine multiple PDF files into one',
      split: 'Split PDF into separate files',
      compress: 'Reduce PDF file size',
      addText: 'Add text and annotations',
      watermark: 'Add watermarks to protect PDFs',
      rotate: 'Rotate PDF pages',
      extractPages: 'Extract specific pages',
      extractText: 'Get text content from PDFs',
      pdfToImage: 'Convert PDF to images'
    };
    return descriptions[toolKey] || 'PDF processing tool';
  };

  const getActionText = (fromTool: string, toTool: string): string => {
    const actionMap: Record<string, Record<string, string>> = {
      merge: {
        split: 'split your merged PDF',
        compress: 'compress the merged file',
        extractPages: 'extract specific pages'
      },
      split: {
        merge: 'merge split files back',
        rotate: 'rotate split pages',
        extractPages: 'extract more pages'
      },
      compress: {
        merge: 'merge compressed files',
        split: 'split compressed PDF',
        watermark: 'add watermarks'
      },
      addText: {
        watermark: 'add watermarks',
        rotate: 'rotate annotated pages',
        extractText: 'extract all text'
      },
      watermark: {
        addText: 'add more text',
        compress: 'compress watermarked PDF',
        rotate: 'rotate watermarked pages'
      },
      rotate: {
        addText: 'add text to rotated pages',
        watermark: 'add watermarks',
        split: 'split rotated PDF'
      },
      extractPages: {
        merge: 'merge extracted pages',
        rotate: 'rotate extracted pages',
        pdfToImage: 'convert pages to images'
      },
      extractText: {
        addText: 'add more text',
        extractPages: 'extract specific pages',
        pdfToImage: 'convert to images'
      },
      pdfToImage: {
        extractPages: 'extract more pages',
        extractText: 'get text content',
        rotate: 'rotate before converting'
      }
    };

    return actionMap[fromTool]?.[toTool] || `use ${toTool} tool`;
  };

  const related = relatedTools[currentTool as keyof typeof relatedTools];
  
  if (!related || related.length === 0) {
    return null;
  }

  return (
    <section className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Related PDF Tools
      </h3>
      <p className="text-gray-600 mb-4">
        You might also want to:
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((toolKey) => {
          const tool = getToolInfo(toolKey);
          const actionText = getActionText(currentTool, toolKey);
          
          return (
            <Link
              key={toolKey}
              to={tool.path}
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              aria-label={`Go to ${tool.name} tool`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl flex-shrink-0" role="img" aria-label={tool.name}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {actionText}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Call-to-action for more tools */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          View all PDF tools
        </Link>
      </div>
    </section>
  );
};

export default RelatedTools;
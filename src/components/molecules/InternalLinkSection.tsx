import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface Tool {
  title: string;
  description: string;
  href: string;
  icon: string;
}

interface InternalLinkSectionProps {
  currentTool?: string;
  className?: string;
}

export const InternalLinkSection: React.FC<InternalLinkSectionProps> = ({ 
  currentTool, 
  className = '' 
}) => {
  const allTools: Tool[] = [
    {
      title: 'Merge PDF Files',
      description: 'Combine multiple PDF documents into one',
      href: '/merge-pdf',
      icon: '🔗'
    },
    {
      title: 'Split PDF Documents', 
      description: 'Extract pages or split into separate files',
      href: '/split-pdf',
      icon: '✂️'
    },
    {
      title: 'Compress PDF Size',
      description: 'Reduce file size while maintaining quality',
      href: '/compress-pdf', 
      icon: '🗜️'
    },
    {
      title: 'Convert Images to PDF',
      description: 'Transform JPG, PNG images into PDF format',
      href: '/images-to-pdf',
      icon: '🖼️'
    }
  ];

  // Filter out current tool
  const relatedTools = allTools.filter(tool => tool.href !== currentTool);

  return (
    <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        More PDF Tools
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedTools.map((tool) => (
          <Link 
            key={tool.href}
            to={tool.href}
            className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">{tool.icon}</span>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                    {tool.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  {tool.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors ml-2" />
            </div>
          </Link>
        ))}
      </div>
      
      {/* Support Links */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">
            📚 FAQ & Help
          </Link>
          <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
            🔒 Privacy Policy
          </Link>
          <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
            📜 Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
};

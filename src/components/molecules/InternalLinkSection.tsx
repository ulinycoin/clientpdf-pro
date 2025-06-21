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
    <div className={`bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-6 border border-gray-200 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Explore More PDF Tools
        </h3>
        <p className="text-gray-600 text-sm">
          All tools work locally in your browser - your files never leave your device
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedTools.map((tool) => (
          <Link 
            key={tool.href}
            to={tool.href}
            className="block p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-200">
                    {tool.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {tool.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 ml-3 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

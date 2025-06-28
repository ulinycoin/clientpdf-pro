import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ArrowRight, Shield, Zap, Lock } from 'lucide-react';
import { clsx } from 'clsx';

export const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'LocalPDF - Free Online PDF Tools | Privacy-First PDF Processing | 5 Essential Tools';
  }, []);

  // Core PDF tools - Clean 5 essential tools without CSV duplication
  const tools = [
    {
      title: 'Merge PDF Files',
      description: 'Combine multiple PDF documents into a single file',
      icon: '🔗',
      href: '/merge-pdf',
      color: 'blue'
    },
    {
      title: 'Split PDF',
      description: 'Extract pages or split PDF into separate documents',
      icon: '✂️',
      href: '/split-pdf',
      color: 'green'
    },
    {
      title: 'Compress PDF',
      description: 'Reduce PDF file size while maintaining quality',
      icon: '🗜️',
      href: '/compress-pdf',
      color: 'orange'
    },
    {
      title: 'Images to PDF',
      description: 'Convert JPG, PNG and other images to PDF format',
      icon: '🖼️',
      href: '/images-to-pdf',
      color: 'purple'
    },
    {
      title: 'Enhanced CSV to PDF',
      description: 'Advanced CSV converter with live preview and multi-language support',
      icon: '📊',
      href: '/enhanced-csv-to-pdf',
      color: 'cyan',
      isNew: true
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Free Online PDF Tools
          <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full ml-2">5 Essential Tools</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Process PDFs and convert documents instantly in your browser. No uploads, no servers, your files never leave your device.
        </p>
        
        {/* Trust Indicators */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 mb-8">
          <div className="flex items-center">
            <Shield className="h-4 w-4 mr-1 text-green-500" />
            100% Private
          </div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-1 text-blue-500" />
            Instant Processing
          </div>
          <div className="flex items-center">
            <Lock className="h-4 w-4 mr-1 text-purple-500" />
            No Uploads
          </div>
        </div>
      </div>

      {/* Tools Grid - Clean 5-tool layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            to={tool.href}
            className={clsx(
              'group relative block aspect-square p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl transform-gpu',
              'flex flex-col items-center justify-center text-center',
              tool.color === 'blue' && 'border-blue-200 hover:border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
              tool.color === 'green' && 'border-green-200 hover:border-green-300 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
              tool.color === 'orange' && 'border-orange-200 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200',
              tool.color === 'purple' && 'border-purple-200 hover:border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
              tool.color === 'cyan' && 'border-cyan-200 hover:border-cyan-300 bg-gradient-to-br from-cyan-50 to-cyan-100 hover:from-cyan-100 hover:to-cyan-200'
            )}
          >
            {/* NEW badge for enhanced CSV tool */}
            {tool.isNew && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                NEW
              </div>
            )}
            
            {/* Icon */}
            <div className="text-4xl md:text-5xl mb-2 md:mb-3 transform group-hover:scale-110 transition-transform duration-300">
              {tool.icon}
            </div>
            
            {/* Title */}
            <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {tool.title}
            </h3>
            
            {/* Description - Hidden on mobile, shown on larger screens */}
            <p className="hidden md:block text-xs text-gray-600 mb-2 md:mb-3 line-clamp-2 px-1">
              {tool.description}
            </p>
            
            {/* Action indicator */}
            <div className="flex items-center justify-center text-xs font-medium text-blue-600 group-hover:text-blue-700 mt-auto">
              <span className="hidden md:inline">Get Started</span>
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 md:ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Features Section */}
      <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            Why Choose LocalPDF?
          </h2>
          <p className="text-blue-700 max-w-2xl mx-auto">
            Professional-grade PDF processing with complete privacy and instant results
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-blue-200">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-blue-900 mb-2">Lightning Fast</h3>
            <p className="text-sm text-blue-700">Process files instantly without waiting for uploads or downloads</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-blue-200">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="font-semibold text-blue-900 mb-2">100% Private</h3>
            <p className="text-sm text-blue-700">Your files never leave your device - complete privacy guaranteed</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-blue-200">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold text-blue-900 mb-2">Professional Quality</h3>
            <p className="text-sm text-blue-700">Industry-standard PDF processing with reliable results</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-blue-200">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="font-semibold text-blue-900 mb-2">Enhanced CSV Editor</h3>
            <p className="text-sm text-blue-700">Live preview, multi-language support, and real-time editing</p>
          </div>
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-green-50 rounded-2xl p-8 border border-green-200 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Settings className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-4">
            Your Privacy is Protected
          </h2>
          <p className="text-green-700 max-w-2xl mx-auto mb-6">
            All PDF processing happens locally in your browser. Your files are never uploaded to our servers, 
            ensuring complete privacy and security for your sensitive documents.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🔒 No Uploads</h3>
              <p className="text-sm text-green-700">Files never leave your device</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">⚡ Fast Processing</h3>
              <p className="text-sm text-green-700">No server delays or queues</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">🌐 Works Offline</h3>
              <p className="text-sm text-green-700">Process files without internet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ArrowRight, Shield, Zap, Lock, Sparkles, Globe, Eye } from 'lucide-react';
import { clsx } from 'clsx';

export const HomePage: React.FC = () => {
  useEffect(() => {
    document.title = 'LocalPDF - Free Online PDF Tools | Privacy-First PDF Processing | 5 Essential Tools';
  }, []);

  // Core PDF tools - Updated CSV tool to use primary route
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
      title: 'CSV to PDF',
      description: 'Enhanced CSV converter with live preview and multi-language support',
      icon: '📊',
      href: '/csv-to-pdf',
      color: 'cyan',
      isNew: true
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="text-center mb-8">
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

      {/* Enhanced CSV to PDF Promo Card - Updated links */}
      <div className="relative mb-8">
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 mb-6 md:mb-0 md:pr-8">
              <div className="flex items-center mb-4">
                <Sparkles className="h-8 w-8 text-yellow-300 mr-3 animate-pulse" />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                  ✅ NOW DEFAULT
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Enhanced CSV to PDF Converter
              </h2>
              
              <p className="text-lg md:text-xl text-purple-100 mb-6 max-w-2xl">
                Revolutionary CSV converter with live preview, automatic language detection, 
                and support for 15+ languages including Russian, Latvian, and Unicode characters.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center text-sm bg-white/20 rounded-full px-3 py-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Live Preview
                </div>
                <div className="flex items-center text-sm bg-white/20 rounded-full px-3 py-1">
                  <Globe className="h-4 w-4 mr-2" />
                  15+ Languages
                </div>
                <div className="flex items-center text-sm bg-white/20 rounded-full px-3 py-1">
                  <Zap className="h-4 w-4 mr-2" />
                  Real-time Editing
                </div>
              </div>
              
              <Link 
                to="/csv-to-pdf"
                className="inline-flex items-center bg-white text-purple-600 font-bold py-3 px-6 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Try Enhanced CSV Converter
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
            
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-64 h-48 bg-white/10 rounded-xl backdrop-blur-sm p-4 border border-white/20">
                  <div className="text-6xl text-center mb-4 animate-bounce">📊</div>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-lg p-2 mb-2">
                      <div className="h-2 bg-gradient-to-r from-yellow-300 to-orange-300 rounded animate-pulse"></div>
                    </div>
                    <div className="text-sm text-purple-100">Live Preview Active</div>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-300 rounded-full animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-cyan-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid - Square Design */}
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
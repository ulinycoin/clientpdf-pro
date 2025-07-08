import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Home, Search, FileText } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const popularTools = [
    { name: 'Merge PDF', path: '/merge-pdf', icon: '🔗', description: 'Combine multiple PDFs into one file' },
    { name: 'Split PDF', path: '/split-pdf', icon: '✂️', description: 'Split PDF into separate pages' },
    { name: 'Compress PDF', path: '/compress-pdf', icon: '🗜️', description: 'Reduce PDF file size' },
    { name: 'Add Text', path: '/add-text-pdf', icon: '📝', description: 'Add text overlay to PDF pages' }
  ];

  return (
    <>
      <Helmet>
        <title>Page Not Found - LocalPDF | Free Privacy-First PDF Tools</title>
        <meta name="description" content="The page you're looking for doesn't exist. Explore LocalPDF's free privacy-first PDF tools for merging, splitting, compressing, and editing PDF files." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://localpdf.online/404" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Page Not Found - LocalPDF" />
        <meta property="og:description" content="Explore LocalPDF's free privacy-first PDF tools for all your document needs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://localpdf.online/404" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Page Not Found - LocalPDF" />
        <meta name="twitter:description" content="Explore LocalPDF's free privacy-first PDF tools." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* 404 Hero Section */}
            <div className="mb-12">
              <div className="text-8xl font-bold text-blue-600 mb-4 opacity-20">
                404
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
                Page Not Found
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Oops! The page you're looking for seems to have vanished into the digital void. 
                But don't worry – our powerful PDF tools are still here to help you!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go Back
              </button>
            </div>

            {/* Popular Tools Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center justify-center">
                <Search className="w-6 h-6 mr-3 text-blue-600" />
                Try Our Popular PDF Tools
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularTools.map((tool, index) => (
                  <Link
                    key={index}
                    to={tool.path}
                    className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                      {tool.icon}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tool.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Why LocalPDF Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                Why Choose LocalPDF?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="text-center">
                  <div className="text-2xl mb-3">🔒</div>
                  <h3 className="font-semibold text-gray-800 mb-2">100% Private</h3>
                  <p className="text-sm text-gray-600">
                    All processing happens in your browser. Your files never leave your device.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Lightning Fast</h3>
                  <p className="text-sm text-gray-600">
                    Modern web technology ensures quick processing without server delays.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl mb-3">🆓</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Completely Free</h3>
                  <p className="text-sm text-gray-600">
                    No subscriptions, no limits, no hidden costs. All tools are free forever.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-sm">
                Need help? Check out our{' '}
                <Link to="/faq" className="text-blue-600 hover:underline">
                  FAQ page
                </Link>{' '}
                or learn about our{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  privacy policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
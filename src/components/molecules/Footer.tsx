import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Mail, Shield, Lock, Zap, Heart, Globe, FileText } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PDF</span>
              </div>
              <span className="text-xl font-bold">LocalPDF</span>
            </div>
            
            <p className="text-gray-400 mb-6 max-w-md">
              Free, privacy-first PDF tools that work entirely in your browser. 
              No uploads, no servers, your files never leave your device.
            </p>
            
            {/* Privacy Features */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-gray-300">
                <Lock className="h-4 w-4 mr-2 text-green-400" />
                100% Client-side Processing
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Shield className="h-4 w-4 mr-2 text-green-400" />
                No File Uploads Required
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Zap className="h-4 w-4 mr-2 text-green-400" />
                Instant Processing
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/ulinycoin/clientpdf-pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="mailto:localpdfpro@gmail.com" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Contact Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a 
                href="https://localpdf.online" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Visit Website"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-lg font-semibold mb-4">PDF Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tools/merge" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Merge PDFs
                </Link>
              </li>
              <li>
                <Link to="/tools/split" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/compress" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Compress PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/convert" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Images to PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/rotate" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Rotate PDF
                </Link>
              </li>
              <li>
                <Link to="/tools/protect" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Protect PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/ulinycoin/clientpdf-pro/issues" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Report an Issue
                </a>
              </li>
              <li>
                <a href="mailto:localpdfpro@gmail.com" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 text-blue-400 mb-2" />
              <span className="text-xs text-gray-400">GDPR Compliant</span>
            </div>
            <div className="flex flex-col items-center">
              <Lock className="h-8 w-8 text-green-400 mb-2" />
              <span className="text-xs text-gray-400">No Data Storage</span>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-8 w-8 text-yellow-400 mb-2" />
              <span className="text-xs text-gray-400">Instant Processing</span>
            </div>
            <div className="flex flex-col items-center">
              <Github className="h-8 w-8 text-purple-400 mb-2" />
              <span className="text-xs text-gray-400">Open Source</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-gray-400">
              <span>© {currentYear} LocalPDF by SIA "UL-COIN". All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center">
                Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for privacy
              </span>
            </div>
            
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-gray-500">
                🌟 Open source • 🔒 No tracking • 🚫 No cookies • 📊 No data collection
              </p>
            </div>
          </div>
          
          {/* Company Info */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-600">
              SIA "UL-COIN" • Registered in Latvia • EU Company
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
import React from 'react';
import { Github, Twitter, Mail, Shield, Lock, Zap, Heart } from 'lucide-react';

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
            <div className="flex space-x-4">
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
                href="https://twitter.com/localpdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="mailto:contact@localpdf.online" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Contact Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-lg font-semibold mb-4">PDF Tools</h3>
            <ul className="space-y-2">
              <li>
                <a href="#merge" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Merge PDFs
                </a>
              </li>
              <li>
                <a href="#split" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Split PDF
                </a>
              </li>
              <li>
                <a href="#compress" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Compress PDF
                </a>
              </li>
              <li>
                <a href="#convert" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Images to PDF
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <a href="mailto:support@localpdf.online" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>© {currentYear} LocalPDF. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center">
                Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for privacy
              </span>
            </div>
            
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-gray-500">
                🌟 Open source project • No tracking • No cookies • No data collection
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
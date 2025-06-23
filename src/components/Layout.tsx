/**
 * Copyright (c) 2024 LocalPDF Team
 * 
 * This file is part of LocalPDF.
 * 
 * LocalPDF is proprietary software: you may not copy, modify, distribute,
 * or use this software except as expressly permitted under the LocalPDF
 * Source Available License v1.0.
 * 
 * See the LICENSE file in the project root for license terms.
 * For commercial licensing, contact: license@localpdf.online
 */


import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Menu, X, HelpCircle, Shield, Gavel, Mail, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Home', href: '/', icon: FileText },
    { name: 'Merge PDF', href: '/merge-pdf' },
    { name: 'Split PDF', href: '/split-pdf' },
    { name: 'Compress PDF', href: '/compress-pdf' },
    { name: 'Images to PDF', href: '/images-to-pdf' },
    { name: 'CSV to PDF', href: '/csv-to-pdf' },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                LocalPDF
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      location.pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        location.pathname === item.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <span className="text-xl font-bold text-gray-900">LocalPDF</span>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Free online PDF tools that work in your browser. Privacy-first - your files never leave your device.
                Process PDFs instantly with professional-grade tools designed for security and performance.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center text-green-600">
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="font-medium">100% Private</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <Heart className="h-4 w-4 mr-1" />
                  <span className="font-medium">Always Free</span>
                </div>
              </div>
            </div>

            {/* Tools Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                PDF Tools
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/merge-pdf" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Merge PDF
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/split-pdf" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Split PDF
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/compress-pdf" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Compress PDF
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/images-to-pdf" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Images to PDF
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/csv-to-pdf" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      CSV to PDF
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                Support & Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/faq" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group"
                  >
                    <HelpCircle className="h-4 w-4 mr-2 text-gray-400 group-hover:text-blue-500" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      FAQ & Help
                    </span>
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:localpdfpro@gmail.com" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group"
                  >
                    <Mail className="h-4 w-4 mr-2 text-gray-400 group-hover:text-blue-500" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Contact
                    </span>
                  </a>
                </li>
                <li>
                  <Link 
                    to="/privacy" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group"
                  >
                    <Shield className="h-4 w-4 mr-2 text-gray-400 group-hover:text-blue-500" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Privacy Policy
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terms" 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group"
                  >
                    <Gavel className="h-4 w-4 mr-2 text-gray-400 group-hover:text-blue-500" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      Terms of Service
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                © 2025 LocalPDF. All rights reserved. Your files are processed locally in your browser.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  All systems operational
                </span>
                <span>Made with ❤️ for privacy</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
    </div>
  );
};

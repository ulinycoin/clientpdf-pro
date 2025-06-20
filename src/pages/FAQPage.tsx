import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { InternalLinkSection } from '../components/molecules/InternalLinkSection';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    document.title = 'FAQ - Frequently Asked Questions | LocalPDF';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Frequently asked questions about LocalPDF. Learn how our privacy-first PDF tools work in your browser without uploading files.'
      );
    }
  }, []);

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'Is it safe to process PDFs with LocalPDF?',
      answer: 'Yes, absolutely! LocalPDF processes all files entirely in your browser using client-side JavaScript. Your documents never leave your device, ensuring complete privacy and security.'
    },
    {
      id: 2,
      question: 'What file formats does LocalPDF support?',
      answer: 'LocalPDF supports PDF files for all operations, plus popular image formats (JPG, PNG, GIF, BMP, WebP) for PDF conversion. Maximum file size is 100MB per PDF and 10MB per image.'
    },
    {
      id: 3,
      question: 'Do I need to register or pay to use LocalPDF?',
      answer: 'No! LocalPDF is completely free and requires no registration. All features are available immediately without any limitations or watermarks.'
    },
    {
      id: 4,
      question: 'How does LocalPDF work without internet?',
      answer: 'LocalPDF uses Service Worker technology to cache the application. Once loaded, you can process PDFs even when offline since everything runs in your browser.'
    },
    {
      id: 5,
      question: 'What browsers are supported?',
      answer: 'LocalPDF works on all modern browsers including Chrome 90+, Firefox 88+, Safari 14+, and Edge. Mobile browsers are also fully supported.'
    },
    {
      id: 6,
      question: 'Can I process password-protected PDFs?',
      answer: 'Currently, you need to remove password protection before processing. We\'re working on adding support for password-protected PDFs in a future update.'
    },
    {
      id: 7,
      question: 'What happens to my files after processing?',
      answer: 'Since processing happens entirely in your browser, files are automatically cleared from memory when you close the tab or navigate away. No files are stored anywhere.'
    },
    {
      id: 8,
      question: 'Why is LocalPDF better than other PDF tools?',
      answer: 'LocalPDF prioritizes your privacy by processing files locally, offers faster processing without upload/download delays, works offline, and is completely free with no limitations.'
    },
    {
      id: 9,
      question: 'Can I merge large PDF files?',
      answer: 'Yes, you can merge PDFs up to 100MB each, with a maximum of 10 files per merge operation. For very large files, try compressing them first.'
    },
    {
      id: 10,
      question: 'Is the source code available?',
      answer: 'Yes! LocalPDF is open source. You can view and contribute to the code on GitHub, ensuring complete transparency about how your files are processed.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-gray-900">FAQ</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <HelpCircle className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Everything you need to know about LocalPDF's privacy-first PDF tools that work entirely in your browser.
        </p>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4 mb-8">
        {faqItems.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset hover:bg-gray-50"
              onClick={() => toggleItem(item.id)}
              aria-expanded={openItems.has(item.id)}
            >
              <span className="font-medium text-gray-900 pr-4">
                {item.question}
              </span>
              {openItems.has(item.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
              )}
            </button>
            
            {openItems.has(item.id) && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed pt-4">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          Still have questions?
        </h2>
        <p className="text-blue-700 mb-4">
          We're here to help! Reach out to our support team for personalized assistance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:support@localpdf.online"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Email Support
          </a>
          <a
            href="https://github.com/ulinycoin/clientpdf-pro/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 transition-colors"
          >
            Report Issue on GitHub
          </a>
        </div>
      </div>

      {/* SEO Content */}
      <div className="prose prose-gray max-w-none mb-8">
        <h2>About LocalPDF Privacy and Security</h2>
        <p>
          LocalPDF is designed with privacy as the top priority. Unlike other online PDF tools that upload your files to remote servers, 
          LocalPDF processes everything locally in your browser. This means your sensitive documents never leave your device, 
          ensuring complete confidentiality and compliance with data protection regulations.
        </p>
        
        <h3>How Local Processing Works</h3>
        <p>
          Our application uses advanced JavaScript libraries like PDF-lib and jsPDF to manipulate PDF files directly in your browser. 
          When you upload a file, it's loaded into your browser's memory and processed using client-side code. 
          The processed file is then made available for download without any server communication.
        </p>
      </div>

      {/* Internal Links */}
      <InternalLinkSection className="mb-8" />

      {/* External Resources */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Documentation</h3>
        <div className="space-y-2">
          <a 
            href="https://developer.mozilla.org/en-US/docs/Web/API/File_API"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            File API Documentation (MDN)
          </a>
          <a 
            href="https://github.com/ulinycoin/clientpdf-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            LocalPDF Source Code (GitHub)
          </a>
        </div>
      </div>
    </div>
  );
};
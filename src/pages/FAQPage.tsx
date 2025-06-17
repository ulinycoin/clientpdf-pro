import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Shield, Zap, Globe, FileText } from 'lucide-react';
import { clsx } from 'clsx';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'privacy' | 'technical' | 'features';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'general',
    question: 'What is LocalPDF and how does it work?',
    answer: 'LocalPDF is a free, browser-based PDF processing tool that allows you to merge, split, compress PDFs and convert images to PDF without uploading your files to any server. All processing happens locally in your browser using JavaScript libraries like PDF-lib and jsPDF.'
  },
  {
    id: '2',
    category: 'privacy',
    question: 'Are my files uploaded to your servers?',
    answer: 'No, absolutely not! Your files never leave your device. All PDF processing happens locally in your browser using client-side JavaScript. This ensures complete privacy and security of your documents.'
  },
  {
    id: '3',
    category: 'features',
    question: 'What file formats are supported?',
    answer: 'We support PDF files for merging, splitting, and compression. For image conversion, we support PNG, JPG, JPEG, GIF, BMP, and WebP formats. All processing maintains the original quality of your files.'
  },
  {
    id: '4',
    category: 'technical',
    question: 'What are the file size limits?',
    answer: 'The default limit is 50MB per file, and you can upload up to 10 files at once. These limits are set to ensure optimal performance in your browser. For larger files, consider compressing them first.'
  },
  {
    id: '5',
    category: 'features',
    question: 'Can I merge PDFs in a specific order?',
    answer: 'Yes! The PDFs are merged in the order you select them. You can drag and drop files to reorder them before merging, or select them in your desired sequence from the file browser.'
  },
  {
    id: '6',
    category: 'technical',
    question: 'Which browsers are supported?',
    answer: 'LocalPDF works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience and performance.'
  },
  {
    id: '7',
    category: 'features',
    question: 'How does PDF compression work?',
    answer: 'Our compression feature reduces file size by optimizing the PDF structure, removing unnecessary metadata, and adjusting image quality. You can choose from High (10-20% reduction), Medium (30-50% reduction), or Low quality (50-70% reduction).'
  },
  {
    id: '8',
    category: 'privacy',
    question: 'Do you store any data about my usage?',
    answer: 'We only collect anonymous usage statistics to improve the service (like which features are most popular). We never store or track your actual files, file names, or any personal data.'
  },
  {
    id: '9',
    category: 'technical',
    question: 'Why is processing slow for large files?',
    answer: 'Processing speed depends on your device\'s performance and the file size. Large PDFs require more memory and processing power. For better performance, try closing other browser tabs and ensuring your device has sufficient available memory.'
  },
  {
    id: '10',
    category: 'features',
    question: 'Can I extract specific pages from a PDF?',
    answer: 'Yes! Use the Split PDF feature and select "Extract page range" option. You can specify which pages to extract (e.g., pages 5-10) and download them as a separate PDF file.'
  }
];

const categories = [
  { id: 'general', name: 'General', icon: Globe, color: 'blue' },
  { id: 'privacy', name: 'Privacy & Security', icon: Shield, color: 'green' },
  { id: 'features', name: 'Features', icon: FileText, color: 'purple' },
  { id: 'technical', name: 'Technical', icon: Zap, color: 'orange' },
];

export const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('general');

  // Добавляем structured data для FAQ
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    };

    // Удаляем существующий script если есть
    const existingScript = document.querySelector('script[data-schema="faq"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Добавляем новый script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'faq');
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    // Cleanup при размонтировании
    return () => {
      const scriptToRemove = document.querySelector('script[data-schema="faq"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // Обновляем title и meta для SEO
  useEffect(() => {
    document.title = 'FAQ - LocalPDF | Frequently Asked Questions';
    
    // Обновляем meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Find answers to frequently asked questions about LocalPDF. Learn about our privacy-first PDF tools, supported formats, and how to use our browser-based PDF processing features.'
      );
    }
  }, []);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQs = faqData.filter(item => item.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about LocalPDF. Can't find what you're looking for? 
          <a href="mailto:support@localpdf.online" className="text-blue-600 hover:text-blue-700 ml-1">
            Contact us
          </a>
        </p>
      </div>

      {/* Category Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={clsx(
                'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                selectedCategory === category.id
                  ? `border-${category.color}-500 bg-${category.color}-50`
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              )}
            >
              <Icon className={clsx(
                'h-6 w-6 mb-2',
                selectedCategory === category.id 
                  ? `text-${category.color}-600` 
                  : 'text-gray-400'
              )} />
              <h3 className={clsx(
                'font-medium text-sm',
                selectedCategory === category.id 
                  ? `text-${category.color}-900` 
                  : 'text-gray-900'
              )}>
                {category.name}
              </h3>
            </button>
          );
        })}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-lg font-medium text-gray-900 pr-4">
                {item.question}
              </h3>
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
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
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
      <div className="mt-12 prose prose-gray max-w-none">
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
    </div>
  );
};
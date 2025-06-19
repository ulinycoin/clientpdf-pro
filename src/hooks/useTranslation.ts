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


// src/hooks/useTranslation.ts
import { useState } from 'react';

const translations = {
  meta: {
    title: 'LocalPDF - Free Online PDF Tools | Merge, Split, Compress PDFs',
    description: 'Free online PDF tools that work in your browser. Privacy-first - your files never leave your device.',
    keywords: 'pdf tools, merge pdf, split pdf, compress pdf, convert to pdf'
  },
  hero: {
    title: 'Free Online PDF Tools',
    subtitle: 'Process PDFs instantly in your browser. No uploads, no servers, your files stay with you.'
  },
  header: {
    title: 'LocalPDF',
    nav: { merge: 'Merge', split: 'Split', compress: 'Compress' }
  },
  features: {
    upload: { 
      title: 'Drag & Drop Upload', 
      description: 'Simply drag and drop your files or click to browse. Supports multiple file formats for maximum convenience.' 
    },
    preview: { 
      title: 'Interactive Preview', 
      description: 'Preview your PDFs with interactive page thumbnails. Reorder, split, or merge with ease.' 
    },
    download: { 
      title: 'Instant Download', 
      description: 'Process and download your files instantly. No server uploads, complete privacy guaranteed.' 
    }
  },
  cta: {
    title: 'Start Working with PDFs Right Now',
    subtitle: 'No installations, registrations, or downloads required. All tools work directly in your browser.',
    button: 'Try Free Now'
  },
  footer: {
    tools: { 
      title: 'PDF Tools', 
      merge: 'Merge PDF', 
      split: 'Split PDF', 
      compress: 'Compress PDF', 
      convert: 'Images to PDF' 
    },
    resources: { 
      title: 'Resources', 
      blog: 'Blog', 
      help: 'Help', 
      api: 'API' 
    },
    company: { 
      title: 'Company', 
      privacy: 'Privacy', 
      terms: 'Terms', 
      contact: 'Contact' 
    },
    contact: { 
      title: 'Get in Touch', 
      subtitle: 'Questions or suggestions?', 
      email: 'support@localpdf.online' 
    },
    copyright: '© 2024 LocalPDF. All rights reserved.'
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      { 
        question: 'Is it safe to upload files to LocalPDF?', 
        answer: 'Yes, absolutely safe! All files are processed locally in your browser. Your documents are never uploaded to our servers and never leave your device.' 
      },
      { 
        question: 'What file formats does LocalPDF support?', 
        answer: 'LocalPDF supports PDF files for all operations, as well as popular image formats (PNG, JPG, JPEG, GIF, BMP, WebP) for PDF conversion.' 
      },
      { 
        question: 'Are there any file size limitations?', 
        answer: 'Maximum file size is 50 MB. You can upload up to 10 files simultaneously. For larger files, we recommend using the compression feature first.' 
      },
      { 
        question: 'Do I need to register to use the service?', 
        answer: 'No registration required! LocalPDF is completely free and works without registration. Just open the site and start working with PDFs.' 
      },
      { 
        question: 'Does LocalPDF work on mobile devices?', 
        answer: 'Yes! LocalPDF is fully responsive and works on mobile devices and tablets. All features are available on any device with a modern browser.' 
      }
    ]
  }
};

export const useTranslation = () => {
  const [language] = useState('en');

  const t = (key: string): any => {
    return key.split('.').reduce((obj, k) => obj?.[k], translations) || key;
  };

  return { language, t };
};
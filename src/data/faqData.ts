// FAQ data for all PDF tools with SEO-optimized content
// Focus on privacy, security, and competitive advantages

export interface FAQItem {
  question: string;
  answer: string;
  id: string;
}

export interface ToolFAQs {
  [key: string]: FAQItem[];
}

export const toolFAQs: ToolFAQs = {
  merge: [
    {
      id: 'merge-privacy',
      question: 'Is it safe to merge PDFs online with LocalPDF?',
      answer: 'Yes, absolutely! LocalPDF processes all files directly in your browser using advanced JavaScript technology. Your PDF files <strong>never leave your device</strong> and are never uploaded to any server. This makes LocalPDF the most secure way to merge PDFs online.'
    },
    {
      id: 'merge-vs-competitors',
      question: 'How is LocalPDF different from other PDF merger tools?',
      answer: 'Unlike other online PDF tools that upload your files to their servers, LocalPDF works entirely in your browser. This means: <ul><li><strong>100% Privacy:</strong> No file uploads or data collection</li><li><strong>Faster Processing:</strong> No internet upload/download delays</li><li><strong>No File Size Limits:</strong> Process large files without restrictions</li><li><strong>Works Offline:</strong> Continue working even without internet connection</li></ul>'
    },
    {
      id: 'merge-file-limits',
      question: 'How many PDF files can I merge at once?',
      answer: 'There are no artificial limits on the number of PDF files you can merge with LocalPDF. The only limitation is your device\'s available memory. Most modern devices can easily handle merging 50+ PDF files simultaneously.'
    },
    {
      id: 'merge-file-size',
      question: 'What\'s the maximum file size for PDF merging?',
      answer: 'LocalPDF has no file size restrictions because processing happens locally in your browser. You can merge large PDF files (100MB+) without any issues, unlike other online tools that limit file sizes to encourage premium subscriptions.'
    },
    {
      id: 'merge-quality',
      question: 'Does merging PDFs reduce quality or file size?',
      answer: 'No, LocalPDF preserves the original quality of your PDF files during merging. All text, images, and formatting remain exactly as they were in the original documents. The merged PDF maintains professional quality suitable for printing and sharing.'
    },
    {
      id: 'merge-cost',
      question: 'Is PDF merging really free with LocalPDF?',
      answer: 'Yes, 100% free with no hidden costs, watermarks, or premium upgrades required. Since LocalPDF works entirely in your browser without server costs, we can offer all features completely free forever.'
    }
  ],

  split: [
    {
      id: 'split-privacy',
      question: 'Is it safe to split PDFs online without uploading files?',
      answer: 'Absolutely! LocalPDF\'s split tool processes your PDF entirely within your browser. Your document <strong>never leaves your device</strong>, making it the most secure way to split PDF files online. Perfect for confidential documents and sensitive information.'
    },
    {
      id: 'split-options',
      question: 'What PDF splitting options does LocalPDF offer?',
      answer: 'LocalPDF provides flexible splitting options: <ul><li><strong>Split by pages:</strong> Extract specific page ranges</li><li><strong>Split by file size:</strong> Create smaller chunks</li><li><strong>Extract single pages:</strong> Save individual pages as separate PDFs</li><li><strong>Batch processing:</strong> Split multiple PDFs simultaneously</li></ul>'
    },
    {
      id: 'split-large-files',
      question: 'Can I split large PDF files with many pages?',
      answer: 'Yes! Since LocalPDF processes files locally in your browser, there are no file size restrictions. You can split PDF documents with hundreds or thousands of pages without any upload limits or premium requirements.'
    },
    {
      id: 'split-speed',
      question: 'How fast is PDF splitting with LocalPDF?',
      answer: 'LocalPDF splits PDFs extremely fast because there\'s no upload/download time. Processing happens instantly in your browser using optimized algorithms. Large PDFs that take minutes to upload elsewhere are split in seconds with LocalPDF.'
    }
  ],

  compress: [
    {
      id: 'compress-privacy',
      question: 'Is PDF compression secure and private?',
      answer: 'Yes, LocalPDF\'s compression is completely private and secure. All compression happens directly in your browser - your files <strong>never get uploaded to any server</strong>. This ensures your confidential documents remain private while achieving optimal file size reduction.'
    },
    {
      id: 'compress-quality',
      question: 'How much can I compress PDFs without losing quality?',
      answer: 'LocalPDF uses advanced compression algorithms that can reduce PDF file sizes by 50-90% while maintaining excellent visual quality. Our smart compression analyzes each document and applies optimal settings for the best size-to-quality ratio.'
    },
    {
      id: 'compress-vs-others',
      question: 'Why choose LocalPDF for PDF compression?',
      answer: 'LocalPDF offers superior compression because: <ul><li><strong>No file size limits:</strong> Compress any size PDF</li><li><strong>Multiple compression levels:</strong> Choose quality vs size</li><li><strong>Batch compression:</strong> Process multiple files</li><li><strong>100% Privacy:</strong> No server uploads required</li><li><strong>Completely free:</strong> No watermarks or restrictions</li></ul>'
    },
    {
      id: 'compress-algorithms',
      question: 'What compression technology does LocalPDF use?',
      answer: 'LocalPDF uses industry-standard PDF optimization techniques including image compression, font optimization, and metadata removal. All processing happens in your browser using advanced JavaScript libraries for maximum compatibility and performance.'
    }
  ],

  'pdf-to-image': [
    {
      id: 'pdf-to-image-privacy',
      question: 'Is PDF to image conversion secure?',
      answer: 'Absolutely secure! LocalPDF converts PDF to images entirely in your browser. Your PDF documents <strong>never leave your device</strong>, ensuring complete privacy for sensitive documents. Perfect for confidential reports, financial documents, or personal files.'
    },
    {
      id: 'pdf-to-image-formats',
      question: 'What image formats can I convert PDFs to?',
      answer: 'LocalPDF supports multiple high-quality image formats: <ul><li><strong>JPG:</strong> Best for photos and complex images</li><li><strong>PNG:</strong> Perfect for documents with text and graphics</li><li><strong>WebP:</strong> Modern format with superior compression</li></ul>Choose the format that best suits your needs.'
    },
    {
      id: 'pdf-to-image-quality',
      question: 'Can I control the quality and resolution of converted images?',
      answer: 'Yes! LocalPDF allows you to customize output quality and resolution. Choose from multiple DPI settings (72-300 DPI) to balance file size and image quality based on your specific requirements.'
    },
    {
      id: 'pdf-to-image-batch',
      question: 'Can I convert multiple PDF pages to images at once?',
      answer: 'Yes, LocalPDF can convert all pages from your PDF to individual image files in one operation. You can also select specific page ranges to convert, giving you complete control over the conversion process.'
    }
  ],

  'images-to-pdf': [
    {
      id: 'images-to-pdf-privacy',
      question: 'Is converting images to PDF safe with LocalPDF?',
      answer: 'Completely safe! LocalPDF processes all image files directly in your browser without uploading them anywhere. Your photos and images <strong>remain 100% private</strong> throughout the conversion process. Ideal for personal photos, business documents, or sensitive imagery.'
    },
    {
      id: 'images-to-pdf-formats',
      question: 'What image formats can I convert to PDF?',
      answer: 'LocalPDF supports all major image formats: <ul><li><strong>JPG/JPEG:</strong> Photos and complex images</li><li><strong>PNG:</strong> Images with transparency</li><li><strong>WebP:</strong> Modern web images</li><li><strong>GIF:</strong> Simple graphics</li><li><strong>BMP:</strong> Bitmap images</li></ul>Mix and match different formats in a single PDF.'
    },
    {
      id: 'images-to-pdf-ordering',
      question: 'Can I control the order of images in the PDF?',
      answer: 'Yes! LocalPDF provides an intuitive drag-and-drop interface to arrange your images in any order before creating the PDF. You can also remove or add more images before final conversion.'
    },
    {
      id: 'images-to-pdf-size',
      question: 'How many images can I convert to PDF at once?',
      answer: 'There are no artificial limits on the number of images you can convert to PDF with LocalPDF. Process hundreds of images in a single PDF document, limited only by your device\'s memory capacity.'
    }
  ],

  'word-to-pdf': [
    {
      id: 'word-to-pdf-privacy',
      question: 'Is Word to PDF conversion secure?',
      answer: 'Yes, completely secure! LocalPDF converts Word documents to PDF entirely within your browser. Your documents <strong>never get uploaded to any server</strong>, ensuring complete confidentiality for business documents, resumes, contracts, or personal files.'
    },
    {
      id: 'word-to-pdf-formatting',
      question: 'Does LocalPDF preserve Word document formatting?',
      answer: 'LocalPDF maintains all formatting, fonts, images, tables, and layout from your original Word document. The resulting PDF looks exactly like your Word document, making it perfect for professional documents and official submissions.'
    },
    {
      id: 'word-to-pdf-compatibility',
      question: 'What Word document formats are supported?',
      answer: 'LocalPDF supports modern Word formats including: <ul><li><strong>.docx:</strong> Word 2007 and newer</li><li><strong>.doc:</strong> Legacy Word documents</li><li><strong>.docm:</strong> Macro-enabled documents</li></ul>All versions maintain full compatibility and formatting.'
    }
  ],

  'add-text': [
    {
      id: 'add-text-privacy',
      question: 'Is adding text to PDF secure and private?',
      answer: 'Yes, completely secure! LocalPDF processes your PDF files entirely in your browser. Your documents <strong>never leave your device</strong>, ensuring complete privacy for contracts, forms, or personal documents you need to edit.'
    },
    {
      id: 'add-text-features',
      question: 'What text formatting options are available?',
      answer: 'LocalPDF offers comprehensive text formatting: <ul><li><strong>Font customization:</strong> Multiple font families and sizes</li><li><strong>Color options:</strong> Full color palette for text</li><li><strong>Positioning:</strong> Click anywhere to place text precisely</li><li><strong>Multiple text boxes:</strong> Add as many text elements as needed</li></ul>'
    },
    {
      id: 'add-text-use-cases',
      question: 'What can I use the Add Text tool for?',
      answer: 'Perfect for: <ul><li><strong>Form filling:</strong> Complete PDF forms without printing</li><li><strong>Digital signatures:</strong> Add your name and signature</li><li><strong>Document annotation:</strong> Add notes and comments</li><li><strong>Corrections:</strong> Fix typos or add missing information</li><li><strong>Personalization:</strong> Customize documents with names or dates</li></ul>'
    },
    {
      id: 'add-text-quality',
      question: 'Will the added text look professional?',
      answer: 'Yes! The text is rendered at high resolution and integrates seamlessly with your PDF. You can choose from professional fonts and adjust size and color to match your document\'s style perfectly.'
    }
  ],

  'excel-to-pdf': [
    {
      id: 'excel-to-pdf-privacy',
      question: 'Is Excel to PDF conversion private and secure?',
      answer: 'Absolutely! LocalPDF converts Excel spreadsheets to PDF entirely in your browser. Your financial data, business reports, and spreadsheets <strong>never leave your device</strong>, providing complete privacy for sensitive business information.'
    },
    {
      id: 'excel-to-pdf-formatting',
      question: 'Are Excel charts and formatting preserved in PDF?',
      answer: 'Yes! LocalPDF preserves all Excel elements including: <ul><li><strong>Charts and graphs:</strong> All chart types maintained</li><li><strong>Cell formatting:</strong> Colors, borders, fonts</li><li><strong>Page layout:</strong> Headers, footers, margins</li><li><strong>Multiple sheets:</strong> Convert entire workbook</li></ul>'
    },
    {
      id: 'excel-to-pdf-sheets',
      question: 'Can I convert specific Excel sheets to PDF?',
      answer: 'Yes, LocalPDF allows you to select which sheets to include in your PDF conversion. Convert individual worksheets or combine multiple sheets into a single PDF document based on your requirements.'
    }
  ]
};

// Privacy-focused FAQ items that can be used across all tools
export const generalPrivacyFAQs: FAQItem[] = [
  {
    id: 'general-privacy',
    question: 'How does LocalPDF ensure my privacy?',
    answer: 'LocalPDF is designed with privacy-first principles: <ul><li><strong>No uploads:</strong> All processing happens in your browser</li><li><strong>No data collection:</strong> We don\'t track or store any user data</li><li><strong>No cookies:</strong> No tracking cookies or analytics</li><li><strong>Open source:</strong> Code is transparent and auditable</li><li><strong>GDPR compliant:</strong> Meets European privacy standards</li></ul>'
  },
  {
    id: 'general-vs-competitors',
    question: 'How is LocalPDF different from other PDF tools?',
    answer: 'LocalPDF is the only PDF tool that processes everything locally in your browser: <ul><li><strong>Other online tools:</strong> Upload files to their servers</li><li><strong>Desktop software:</strong> Requires expensive subscriptions</li><li><strong>LocalPDF:</strong> 100% private, free, and secure</li></ul>Your files never leave your device, making LocalPDF the most secure option available.'
  },
  {
    id: 'general-cost',
    question: 'Why is LocalPDF completely free?',
    answer: 'LocalPDF can be free because we have no server costs - everything runs in your browser. Other PDF tools need expensive servers to process your files, forcing them to charge fees or show ads. Our privacy-first approach eliminates these costs.'
  }
];

// Get FAQs for a specific tool
export const getToolFAQs = (toolName: string): FAQItem[] => {
  return toolFAQs[toolName] || [];
};

// Get combined FAQs (tool-specific + general privacy)
export const getCombinedFAQs = (toolName: string): FAQItem[] => {
  const toolSpecific = getToolFAQs(toolName);
  const privacy = generalPrivacyFAQs.slice(0, 2); // Add 2 general privacy FAQs
  return [...toolSpecific, ...privacy];
};

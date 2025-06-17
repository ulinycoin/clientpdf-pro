// src/hooks/usePageSchema.ts
import { useEffect } from 'react';

interface WebPageSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  isPartOf: {
    "@type": string;
    name: string;
    url: string;
  };
  mainEntity?: {
    "@type": string;
    name: string;
    description: string;
    applicationCategory: string;
  };
  breadcrumb?: {
    "@type": string;
    itemListElement: Array<{
      "@type": string;
      position: number;
      name: string;
      item: string;
    }>;
  };
}

export const usePageSchema = (schemaData: WebPageSchema, schemaId: string) => {
  useEffect(() => {
    // Удаляем существующую схему для этой страницы
    const existingScript = document.querySelector(`script[data-schema="${schemaId}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    // Добавляем новую схему
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', schemaId);
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    // Cleanup при размонтировании
    return () => {
      const scriptToRemove = document.querySelector(`script[data-schema="${schemaId}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schemaData, schemaId]);
};

// Предустановленные схемы для инструментов
export const toolSchemas = {
  mergePdf: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Merge PDF Files Online - LocalPDF",
    description: "Combine multiple PDF documents into a single file online. Free, secure, and works in your browser. No uploads to servers required.",
    url: "https://localpdf.online/merge-pdf",
    isPartOf: {
      "@type": "WebSite",
      name: "LocalPDF",
      url: "https://localpdf.online"
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "PDF Merger Tool",
      description: "Browser-based tool to merge multiple PDF files into one document",
      applicationCategory: "ProductivityApplication"
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://localpdf.online"
        },
        {
          "@type": "ListItem", 
          position: 2,
          name: "Merge PDF",
          item: "https://localpdf.online/merge-pdf"
        }
      ]
    }
  },

  splitPdf: {
    "@context": "https://schema.org",
    "@type": "WebPage", 
    name: "Split PDF Files Online - LocalPDF",
    description: "Split PDF documents into separate files or extract specific pages. Free browser-based tool with complete privacy protection.",
    url: "https://localpdf.online/split-pdf",
    isPartOf: {
      "@type": "WebSite",
      name: "LocalPDF", 
      url: "https://localpdf.online"
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "PDF Splitter Tool",
      description: "Browser-based tool to split PDF files into separate documents or extract page ranges",
      applicationCategory: "ProductivityApplication"
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home", 
          item: "https://localpdf.online"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Split PDF",
          item: "https://localpdf.online/split-pdf"
        }
      ]
    }
  },

  compressPdf: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Compress PDF Files Online - LocalPDF", 
    description: "Reduce PDF file size while maintaining quality. Choose compression levels and optimize your documents in the browser.",
    url: "https://localpdf.online/compress-pdf",
    isPartOf: {
      "@type": "WebSite",
      name: "LocalPDF",
      url: "https://localpdf.online"
    },
    mainEntity: {
      "@type": "SoftwareApplication", 
      name: "PDF Compressor Tool",
      description: "Browser-based tool to compress PDF files and reduce file size",
      applicationCategory: "ProductivityApplication"
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://localpdf.online"
        },
        {
          "@type": "ListItem",
          position: 2, 
          name: "Compress PDF",
          item: "https://localpdf.online/compress-pdf"
        }
      ]
    }
  },

  imagesToPdf: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Convert Images to PDF Online - LocalPDF",
    description: "Convert JPG, PNG and other images to PDF format. Free browser-based tool that works without uploading files to servers.",
    url: "https://localpdf.online/images-to-pdf", 
    isPartOf: {
      "@type": "WebSite",
      name: "LocalPDF",
      url: "https://localpdf.online"
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "Image to PDF Converter",
      description: "Browser-based tool to convert images to PDF documents",
      applicationCategory: "ProductivityApplication"
    },
    breadcrumb: {
      "@type": "BreadcrumbList", 
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://localpdf.online"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Images to PDF", 
          item: "https://localpdf.online/images-to-pdf"
        }
      ]
    }
  }
};
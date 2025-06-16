// src/utils/analytics.ts
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const trackPDFOperation = (operation: string, fileCount: number, fileSize: number) => {
  trackEvent('pdf_operation', 'PDF Tools', operation, fileCount);
  
  // Track Core Web Vitals
  trackEvent('pdf_processing_time', 'Performance', operation);
  
  // Track file size for analytics
  trackEvent('file_size_processed', 'Usage', operation, Math.round(fileSize / 1024 / 1024));
};
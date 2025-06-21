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
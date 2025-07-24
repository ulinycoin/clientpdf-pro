// Analytics configuration for LocalPDF
// Vercel Analytics provides privacy-first, GDPR-compliant analytics

export const analyticsConfig = {
  // Enable analytics only in production
  enabled: process.env.NODE_ENV === 'production',

  // Vercel Analytics automatically respects DNT (Do Not Track) headers
  // and is GDPR compliant by default - no cookies or personal data collection

  // Custom events for tracking PDF tool usage
  events: {
    PDF_TOOL_USED: 'pdf_tool_used',
    FILE_PROCESSED: 'file_processed',
    DOWNLOAD_COMPLETED: 'download_completed',
    LANGUAGE_CHANGED: 'language_changed',
  },

  // Privacy-first approach - only track essential metrics
  trackingOptions: {
    respectDNT: true,        // Respect Do Not Track headers
    anonymizeIPs: true,      // IP anonymization
    noCookies: true,         // No tracking cookies
    minimal: true,           // Minimal data collection
  }
};

// Helper function to track custom events (optional)
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', eventName, properties);
  }
};

// Privacy-compliant tool usage tracking
export const trackToolUsage = (toolName: string, fileSize?: number) => {
  if (analyticsConfig.enabled) {
    trackEvent(analyticsConfig.events.PDF_TOOL_USED, {
      tool: toolName,
      file_size_category: fileSize ? getSizeCategory(fileSize) : 'unknown'
    });
  }
};

// Helper to categorize file sizes (for privacy - no exact sizes)
const getSizeCategory = (sizeInBytes: number): string => {
  const sizeMB = sizeInBytes / (1024 * 1024);
  if (sizeMB < 1) return 'small';
  if (sizeMB < 10) return 'medium';
  if (sizeMB < 50) return 'large';
  return 'xlarge';
};

// Declare global va function for TypeScript
declare global {
  interface Window {
    va?: (event: string, name: string, properties?: Record<string, any>) => void;
  }
}

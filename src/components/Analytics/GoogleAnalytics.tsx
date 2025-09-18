import React, { useEffect } from 'react';

interface GoogleAnalyticsProps {
  trackingId: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ trackingId }) => {
  useEffect(() => {
    if (!trackingId || typeof window === 'undefined') return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }

    // Set up gtag function
    window.gtag = gtag;

    // Configure gtag
    gtag('js', new Date());
    gtag('config', trackingId, {
      anonymize_ip: true, // GDPR compliance
      allow_google_signals: false, // Disable Google Signals for privacy
      allow_ad_personalization_signals: false, // Disable ad personalization
    });

    // Create and append Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;

    // Only add if not already present
    const existingScript = document.querySelector(`script[src*="${trackingId}"]`);
    if (!existingScript) {
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[src*="googletagmanager.com"]');
      scripts.forEach(script => script.remove());
    };
  }, [trackingId]);

  return null;
};

export default GoogleAnalytics;
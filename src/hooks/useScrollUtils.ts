/**
 * Hook for debugging and monitoring scroll behavior
 * Useful for development and troubleshooting scroll issues
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollDebugInfo {
  pathname: string;
  scrollY: number;
  documentScrollTop: number;
  bodyScrollTop: number;
  timestamp: number;
}

export const useScrollDebug = (enabled: boolean = false) => {
  const [scrollInfo, setScrollInfo] = useState<ScrollDebugInfo | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return;

    const updateScrollInfo = () => {
      setScrollInfo({
        pathname: location.pathname,
        scrollY: window.pageYOffset || window.scrollY,
        documentScrollTop: document.documentElement.scrollTop,
        bodyScrollTop: document.body.scrollTop,
        timestamp: Date.now()
      });
    };

    // Update on route change
    updateScrollInfo();

    // Update on scroll (throttled)
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollInfo();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname, enabled]);

  return scrollInfo;
};

/**
 * Hook for forcing scroll to top programmatically
 * Can be used by components that need to trigger scroll reset
 */
export const useForceScrollTop = () => {
  const forceScrollTop = (behavior: 'smooth' | 'instant' = 'instant') => {
    try {
      if (behavior === 'instant') {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }

      // Fallback methods
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      console.log('Force scroll to top executed');
    } catch (error) {
      console.warn('Force scroll failed:', error);
    }
  };

  return { forceScrollTop };
};

/**
 * Hook for preserving scroll position on specific routes
 * Useful for cases where you want to maintain scroll position
 */
export const useScrollPreservation = (preserveRoutes: string[] = []) => {
  const location = useLocation();

  useEffect(() => {
    const shouldPreserve = preserveRoutes.includes(location.pathname);
    
    if (!shouldPreserve) {
      // Only scroll to top if not in preserve list
      window.scrollTo(0, 0);
    }
  }, [location.pathname, preserveRoutes]);
};

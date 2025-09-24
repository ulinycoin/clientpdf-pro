// src/utils/performanceOptimizer.ts
import { entityHelper } from './entityHelpers';

/**
 * Core Web Vitals Optimization Utilities
 * Targets: LCP < 1.5s, INP < 200ms, CLS < 0.1, FCP < 1.0s
 */

// Performance monitoring interface
interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  inp?: number;
}

interface PerformanceObserver {
  observe: (options: { entryTypes: string[] }) => void;
  disconnect: () => void;
}

declare global {
  interface Window {
    PerformanceObserver?: {
      new (callback: (list: any) => void): PerformanceObserver;
      supportedEntryTypes?: string[];
    };
  }
}

class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Initialize performance monitoring
   */
  initializeMonitoring(): void {
    if (typeof window === 'undefined') return;

    this.measureCoreWebVitals();
    this.preventLayoutShifts();
  }

  /**
   * Measure Core Web Vitals
   */
  private measureCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    this.observePerformance('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.optimizeLCP(lastEntry.startTime);
    });

    // First Input Delay (FID) and Interaction to Next Paint (INP)
    this.observePerformance('first-input', (entries) => {
      entries.forEach((entry: any) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
        this.optimizeINP(entry.processingStart - entry.startTime);
      });
    });

    // Cumulative Layout Shift (CLS)
    this.observePerformance('layout-shift', (entries) => {
      let clsValue = 0;
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
      this.preventLayoutShifts();
    });

    // First Contentful Paint (FCP)
    this.observePerformance('paint', (entries) => {
      entries.forEach((entry: any) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
          this.optimizeFCP(entry.startTime);
        }
      });
    });

    // Navigation timing
    this.observePerformance('navigation', (entries) => {
      entries.forEach((entry: any) => {
        this.metrics.ttfb = entry.responseStart - entry.requestStart;
      });
    });
  }

  /**
   * Observe performance entries
   */
  private observePerformance(entryType: string, callback: (entries: any[]) => void): void {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new window.PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observer.observe({ entryTypes: [entryType] });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Performance observer for ${entryType} not supported:`, error);
    }
  }

  /**
   * Optimize Largest Contentful Paint (Target: < 1.5s)
   */
  private optimizeLCP(lcpTime: number): void {
    if (lcpTime > 1500) {
      // Preload critical resources
      this.preloadCriticalResources();

      // Optimize images
      this.optimizeImages();

      // Reduce server response time
      this.optimizeServerResponse();
    }
  }

  /**
   * Optimize Interaction to Next Paint (Target: < 200ms)
   */
  private optimizeINP(inpTime: number): void {
    if (inpTime > 200) {
      // Break up long tasks
      this.breakUpLongTasks();

      // Optimize JavaScript execution
      this.optimizeJavaScript();

      // Use requestIdleCallback for non-critical work
      this.deferNonCriticalWork();
    }
  }

  /**
   * Optimize First Contentful Paint (Target: < 1.0s)
   */
  private optimizeFCP(fcpTime: number): void {
    if (fcpTime > 1000) {
      // Inline critical CSS
      this.inlineCriticalCSS();

      // Preconnect to external domains
      this.preconnectExternalDomains();

      // Minimize render-blocking resources
      this.minimizeRenderBlocking();
    }
  }

  /**
   * Prevent Cumulative Layout Shift (Target: < 0.1)
   */
  private preventLayoutShifts(): void {
    // Set dimensions for images and embeds
    this.setImageDimensions();

    // Reserve space for dynamic content
    this.reserveSpaceForDynamicContent();

    // Use transform animations instead of changing layout properties
    this.optimizeAnimations();
  }

  /**
   * Preload critical resources for faster LCP
   */
  private preloadCriticalResources(): void {
    const criticalResources = [
      '/fonts/inter-variable.woff2',
      '/images/hero-background.webp'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;

      if (resource.includes('.woff2')) {
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      } else if (resource.includes('.webp') || resource.includes('.jpg') || resource.includes('.png')) {
        link.as = 'image';
      }

      document.head.appendChild(link);
    });
  }

  /**
   * Optimize images for better LCP
   */
  private optimizeImages(): void {
    // Convert images to WebP format
    const images = document.querySelectorAll('img[src*=".jpg"], img[src*=".png"]');
    images.forEach((img: Element) => {
      const imgElement = img as HTMLImageElement;
      const webpSrc = imgElement.src.replace(/\.(jpg|png)$/i, '.webp');

      // Check if WebP is supported
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        if (webp.height === 2) {
          imgElement.src = webpSrc;
        }
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });

    // Add lazy loading to below-the-fold images
    const lazyImages = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  /**
   * Break up long tasks to improve INP
   */
  private breakUpLongTasks(): void {
    // Use scheduler.postTask if available, otherwise fallback to setTimeout
    const scheduleTask = (callback: () => void, priority: 'user-blocking' | 'user-visible' | 'background' = 'user-visible') => {
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        (window as any).scheduler.postTask(callback, { priority });
      } else {
        setTimeout(callback, 0);
      }
    };

    // Example: Break up PDF processing into chunks
    window.processLargeDataInChunks = (data: any[], chunkSize: number = 1000) => {
      return new Promise((resolve) => {
        const results: any[] = [];
        let index = 0;

        function processChunk() {
          const chunk = data.slice(index, index + chunkSize);
          chunk.forEach(item => {
            // Process individual item
            results.push(item);
          });

          index += chunkSize;

          if (index < data.length) {
            scheduleTask(processChunk, 'background');
          } else {
            resolve(results);
          }
        }

        scheduleTask(processChunk, 'user-visible');
      });
    };
  }

  /**
   * Optimize JavaScript execution
   */
  private optimizeJavaScript(): void {
    // Defer non-critical JavaScript
    const scripts = document.querySelectorAll('script[data-defer]');
    scripts.forEach(script => {
      script.setAttribute('defer', '');
    });

    // Use code splitting for large components
    this.implementCodeSplitting();
  }

  /**
   * Defer non-critical work using requestIdleCallback
   */
  private deferNonCriticalWork(): void {
    const requestIdleCallback = window.requestIdleCallback || ((cb: IdleRequestCallback) => setTimeout(cb, 1));

    // Defer analytics and tracking
    requestIdleCallback(() => {
      this.initializeAnalytics();
    });

    // Defer service worker registration
    requestIdleCallback(() => {
      this.registerServiceWorker();
    });

    // Defer entity framework initialization for non-critical pages
    requestIdleCallback(() => {
      this.initializeEntityFramework();
    });
  }

  /**
   * Set image dimensions to prevent CLS
   */
  private setImageDimensions(): void {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach((img: Element) => {
      const imgElement = img as HTMLImageElement;

      // Set aspect ratio using CSS
      imgElement.style.aspectRatio = '16 / 9'; // Default aspect ratio
      imgElement.style.width = '100%';
      imgElement.style.height = 'auto';
    });
  }

  /**
   * Reserve space for dynamic content
   */
  private reserveSpaceForDynamicContent(): void {
    // Add min-height to containers that will have dynamic content
    const dynamicContainers = document.querySelectorAll('[data-dynamic-content]');
    dynamicContainers.forEach((container: Element) => {
      const element = container as HTMLElement;
      if (!element.style.minHeight) {
        element.style.minHeight = '200px'; // Reserve minimum space
      }
    });
  }

  /**
   * Optimize animations to prevent CLS
   */
  private optimizeAnimations(): void {
    // Replace layout-triggering animations with transform/opacity
    const style = document.createElement('style');
    style.textContent = `
      .animate-smooth {
        will-change: transform, opacity;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }

      .animate-smooth:hover {
        transform: translateY(-2px);
      }

      /* Prevent layout shifts during loading */
      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }

      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize analytics in an optimized way
   */
  private initializeAnalytics(): void {
    // Only load analytics after user interaction or page load
    const loadAnalytics = () => {
      // Vercel Analytics is already loaded via React component
      // Any additional analytics can be loaded here
      console.log('Analytics initialized in background');
    };

    // Load after user interaction
    const events = ['click', 'scroll', 'touchstart'];
    const handleFirstInteraction = () => {
      loadAnalytics();
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };

    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { passive: true });
    });

    // Fallback: load after 3 seconds
    setTimeout(loadAnalytics, 3000);
  }

  /**
   * Register service worker for caching
   */
  private registerServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed:', err));
    }
  }

  /**
   * Initialize entity framework for semantic SEO
   */
  private initializeEntityFramework(): void {
    // Preload entity data for better UX
    try {
      const currentPath = window.location.pathname;
      if (currentPath.includes('pdf')) {
        entityHelper.generateSemanticKeywords('PDFProcessing', 'en');
      }
    } catch (error) {
      console.warn('Entity framework initialization failed:', error);
    }
  }

  /**
   * Implement code splitting for better performance
   */
  private implementCodeSplitting(): void {
    // Dynamic imports for large components
    window.loadPDFProcessor = async () => {
      const { default: PDFProcessor } = await import('../services/pdfService');
      return PDFProcessor;
    };

    window.loadOCREngine = async () => {
      const OCREngine = await import('../services/enhancedOCRService');
      return OCREngine;
    };
  }

  /**
   * Inline critical CSS for faster FCP
   */
  private inlineCriticalCSS(): void {
    // Critical CSS is already inlined in the build process
    // This is a placeholder for additional optimizations
  }

  /**
   * Preconnect to external domains
   */
  private preconnectExternalDomains(): void {
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://vercel.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  /**
   * Minimize render-blocking resources
   */
  private minimizeRenderBlocking(): void {
    // Load non-critical CSS asynchronously
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][data-non-critical]');
    nonCriticalCSS.forEach((link: Element) => {
      const linkElement = link as HTMLLinkElement;
      linkElement.media = 'print';
      linkElement.onload = () => {
        linkElement.media = 'all';
      };
    });
  }

  /**
   * Optimize server response time
   */
  private optimizeServerResponse(): void {
    // Client-side optimizations for faster perceived performance

    // Prefetch likely next pages
    const toolLinks = document.querySelectorAll('a[href*="pdf"]');
    if ('IntersectionObserver' in window) {
      const linkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLAnchorElement;
            const prefetchLink = document.createElement('link');
            prefetchLink.rel = 'prefetch';
            prefetchLink.href = link.href;
            document.head.appendChild(prefetchLink);
            linkObserver.unobserve(link);
          }
        });
      });

      toolLinks.forEach(link => linkObserver.observe(link));
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Clean up observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global declarations for dynamic loading
declare global {
  interface Window {
    processLargeDataInChunks?: (data: any[], chunkSize?: number) => Promise<any[]>;
    loadPDFProcessor?: () => Promise<any>;
    loadOCREngine?: () => Promise<any>;
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  performanceOptimizer.initializeMonitoring();
}

export default performanceOptimizer;
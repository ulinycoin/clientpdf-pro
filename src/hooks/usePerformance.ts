/**
 * Performance Monitoring Hook
 * Tracks Core Web Vitals and application performance metrics
 */

import { useEffect, useRef, useState } from 'react';

// Performance metrics interface
export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  pdfProcessingTime?: number;
  fileUploadTime?: number;
  bundleLoadTime?: number;
  
  // Memory usage
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Performance observer data
interface PerformanceData {
  metrics: PerformanceMetrics;
  isSupported: boolean;
  isLoading: boolean;
}

// Thresholds for Core Web Vitals (based on Google recommendations)
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 }
};

// Performance rating
type Rating = 'good' | 'needs-improvement' | 'poor';

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];
  private listeners: ((metrics: PerformanceMetrics) => void)[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Largest Contentful Paint (LCP)
      this.createObserver('largest-contentful-paint', (entries) => {
        const lastEntry = entries[entries.length - 1];
        this.updateMetric('lcp', lastEntry.startTime);
      });

      // First Input Delay (FID)
      this.createObserver('first-input', (entries) => {
        const firstEntry = entries[0];
        this.updateMetric('fid', firstEntry.processingStart - firstEntry.startTime);
      });

      // Cumulative Layout Shift (CLS)
      this.createObserver('layout-shift', (entries) => {
        let clsValue = 0;
        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.updateMetric('cls', clsValue);
      });

      // First Contentful Paint (FCP)
      this.createObserver('paint', (entries) => {
        for (const entry of entries) {
          if (entry.name === 'first-contentful-paint') {
            this.updateMetric('fcp', entry.startTime);
          }
        }
      });

      // Navigation timing
      this.measureNavigationTiming();

      // Memory usage (if supported)
      this.measureMemoryUsage();

    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  /**
   * Create a performance observer
   */
  private createObserver(
    type: string,
    callback: (entries: PerformanceEntry[]) => void
  ) {
    try {
      const observer = new PerformanceObserver((entryList) => {
        callback(entryList.getEntries());
      });
      
      observer.observe({ entryTypes: [type] });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Failed to create observer for ${type}:`, error);
    }
  }

  /**
   * Measure navigation timing
   */
  private measureNavigationTiming() {
    if ('navigation' in performance && performance.navigation) {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (timing) {
        // Time to First Byte
        this.updateMetric('ttfb', timing.responseStart - timing.fetchStart);
        
        // Bundle load time (rough estimate)
        this.updateMetric('bundleLoadTime', timing.loadEventEnd - timing.fetchStart);
      }
    }
  }

  /**
   * Measure memory usage
   */
  private measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.updateMetric('memoryUsage', {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      });

      // Update memory usage periodically
      setInterval(() => {
        this.updateMetric('memoryUsage', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        });
      }, 5000);
    }
  }

  /**
   * Update a specific metric
   */
  private updateMetric(key: keyof PerformanceMetrics, value: any) {
    this.metrics[key] = value;
    this.notifyListeners();
    
    // Log in development
    if (import.meta.env.DEV) {
      console.log(`Performance: ${key} = ${typeof value === 'object' ? JSON.stringify(value) : value}`);
    }
  }

  /**
   * Notify listeners of metric updates
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.metrics }));
  }

  /**
   * Add listener for metric updates
   */
  addListener(callback: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Measure custom operation timing
   */
  measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return operation().finally(() => {
      const duration = performance.now() - startTime;
      
      // Map operation names to metric keys
      if (operationName.includes('pdf')) {
        this.updateMetric('pdfProcessingTime', duration);
      } else if (operationName.includes('upload')) {
        this.updateMetric('fileUploadTime', duration);
      }
      
      console.log(`Operation '${operationName}' took ${duration.toFixed(2)}ms`);
    });
  }

  /**
   * Get performance rating for a metric
   */
  getRating(metric: keyof typeof THRESHOLDS, value: number): Rating {
    const threshold = THRESHOLDS[metric];
    if (!threshold) return 'good';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const report = {
      coreWebVitals: {},
      customMetrics: {},
      ratings: {},
      overall: 'good' as Rating
    };

    // Core Web Vitals
    if (this.metrics.lcp) {
      report.coreWebVitals.lcp = this.metrics.lcp;
      report.ratings.lcp = this.getRating('LCP', this.metrics.lcp);
    }
    
    if (this.metrics.fid) {
      report.coreWebVitals.fid = this.metrics.fid;
      report.ratings.fid = this.getRating('FID', this.metrics.fid);
    }
    
    if (this.metrics.cls) {
      report.coreWebVitals.cls = this.metrics.cls;
      report.ratings.cls = this.getRating('CLS', this.metrics.cls);
    }
    
    if (this.metrics.fcp) {
      report.coreWebVitals.fcp = this.metrics.fcp;
      report.ratings.fcp = this.getRating('FCP', this.metrics.fcp);
    }
    
    if (this.metrics.ttfb) {
      report.coreWebVitals.ttfb = this.metrics.ttfb;
      report.ratings.ttfb = this.getRating('TTFB', this.metrics.ttfb);
    }

    // Custom metrics
    if (this.metrics.pdfProcessingTime) {
      report.customMetrics.pdfProcessingTime = this.metrics.pdfProcessingTime;
    }
    
    if (this.metrics.fileUploadTime) {
      report.customMetrics.fileUploadTime = this.metrics.fileUploadTime;
    }
    
    if (this.metrics.memoryUsage) {
      report.customMetrics.memoryUsage = this.metrics.memoryUsage;
    }

    // Calculate overall rating
    const ratings = Object.values(report.ratings);
    if (ratings.includes('poor')) {
      report.overall = 'poor';
    } else if (ratings.includes('needs-improvement')) {
      report.overall = 'needs-improvement';
    }

    return report;
  }

  /**
   * Report to analytics (if available)
   */
  reportToAnalytics() {
    const report = this.getPerformanceReport();
    
    try {
      // Google Analytics 4
      if (window.gtag) {
        // Report Core Web Vitals
        Object.entries(report.coreWebVitals).forEach(([metric, value]) => {
          window.gtag('event', 'web_vitals', {
            event_category: 'Performance',
            event_label: metric.toUpperCase(),
            value: Math.round(value),
            metric_rating: report.ratings[metric]
          });
        });

        // Report custom metrics
        Object.entries(report.customMetrics).forEach(([metric, value]) => {
          if (typeof value === 'number') {
            window.gtag('event', 'custom_performance', {
              event_category: 'Performance',
              event_label: metric,
              value: Math.round(value)
            });
          }
        });
      }

      // Vercel Analytics
      if (window.va) {
        window.va('track', 'performance', {
          coreWebVitals: report.coreWebVitals,
          customMetrics: report.customMetrics,
          overall: report.overall
        });
      }
    } catch (error) {
      console.warn('Failed to report performance metrics:', error);
    }
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.listeners = [];
  }
}

// Hook for using performance monitoring in React components
export function usePerformance(): PerformanceData {
  const [data, setData] = useState<PerformanceData>({
    metrics: {},
    isSupported: typeof window !== 'undefined' && 'PerformanceObserver' in window,
    isLoading: true
  });

  const monitorRef = useRef<PerformanceMonitor>();

  useEffect(() => {
    if (!data.isSupported) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Initialize monitor
    monitorRef.current = PerformanceMonitor.getInstance();

    // Listen for metric updates
    const unsubscribe = monitorRef.current.addListener((metrics) => {
      setData(prev => ({
        ...prev,
        metrics,
        isLoading: false
      }));
    });

    // Initial metrics
    setData(prev => ({
      ...prev,
      metrics: monitorRef.current!.getMetrics(),
      isLoading: false
    }));

    return unsubscribe;
  }, [data.isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitorRef.current) {
        monitorRef.current.cleanup();
      }
    };
  }, []);

  return data;
}

// Hook for measuring operation performance
export function useOperationTiming() {
  const monitor = PerformanceMonitor.getInstance();

  const measureOperation = <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    return monitor.measureOperation(operationName, operation);
  };

  return { measureOperation };
}

// Hook for performance reporting
export function usePerformanceReporting() {
  const monitor = PerformanceMonitor.getInstance();

  const reportPerformance = () => {
    monitor.reportToAnalytics();
  };

  const getPerformanceReport = () => {
    return monitor.getPerformanceReport();
  };

  return {
    reportPerformance,
    getPerformanceReport
  };
}

// Export singleton instance for direct usage
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility function to format performance metrics for display
export function formatMetric(value: number, unit: string = 'ms'): string {
  if (value < 1000) {
    return `${Math.round(value)}${unit}`;
  } else if (value < 60000) {
    return `${(value / 1000).toFixed(1)}s`;
  } else {
    return `${(value / 60000).toFixed(1)}m`;
  }
}

// Utility function to get performance color based on rating
export function getPerformanceColor(rating: Rating): string {
  switch (rating) {
    case 'good':
      return '#10b981'; // green
    case 'needs-improvement':
      return '#f59e0b'; // yellow
    case 'poor':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}

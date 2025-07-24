/**
 * Utilities for mapping tool operations to routes
 */

/**
 * Maps tool operation types to their corresponding URL routes
 */
export const getToolRoute = (operationType: string): string => {
  const routeMap: Record<string, string> = {
    'merge': '/merge-pdf',
    'split': '/split-pdf',
    'compress': '/compress-pdf',
    'add-text': '/add-text-pdf',
    'watermark': '/watermark-pdf',
    'rotate': '/rotate-pdf',
    'extract-pages': '/extract-pages-pdf',
    'extract-text': '/extract-text-pdf',
    'pdf-to-image': '/pdf-to-image',
    'images-to-pdf': '/images-to-pdf',
    'word-to-pdf': '/word-to-pdf',
    'ocr-pdf': '/ocr-pdf'
  };

  return routeMap[operationType] || '/';
};

/**
 * Maps URL routes back to operation types (for reverse mapping if needed)
 */
export const getOperationFromRoute = (route: string): string => {
  const operationMap: Record<string, string> = {
    '/merge-pdf': 'merge',
    '/split-pdf': 'split',
    '/compress-pdf': 'compress',
    '/add-text-pdf': 'add-text',
    '/watermark-pdf': 'watermark',
    '/rotate-pdf': 'rotate',
    '/extract-pages-pdf': 'extract-pages',
    '/extract-text-pdf': 'extract-text',
    '/pdf-to-image': 'pdf-to-image',
    '/images-to-pdf': 'images-to-pdf',
    '/word-to-pdf': 'word-to-pdf',
    '/ocr-pdf': 'ocr-pdf'
  };

  return operationMap[route] || '';
};

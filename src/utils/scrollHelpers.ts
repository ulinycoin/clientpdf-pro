// Utility functions for scroll behavior

/**
 * Smoothly scroll to top of the page
 */
export const scrollToTop = (delay = 0) => {
  setTimeout(() => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  }, delay);
};

/**
 * Smoothly scroll to a specific element
 */
export const scrollToElement = (elementId: string, offset = 0, delay = 0) => {
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({ 
        top, 
        behavior: 'smooth' 
      });
    }
  }, delay);
};

/**
 * Get current scroll position
 */
export const getCurrentScrollPosition = () => {
  return window.pageYOffset || document.documentElement.scrollTop;
};

/**
 * Check if element is in viewport
 */
export const isElementInViewport = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};
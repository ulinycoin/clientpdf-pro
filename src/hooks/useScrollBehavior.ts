import { useEffect } from 'react';
import { scrollToTop } from '../utils/scrollHelpers';

/**
 * Custom hook to handle smooth scroll to top when component mounts or dependency changes
 */
export const useScrollToTop = (trigger?: any, delay = 100) => {
  useEffect(() => {
    scrollToTop(delay);
  }, [trigger, delay]);
};

/**
 * Custom hook to handle smooth scroll to top on route/view changes
 */
export const useNavigationScroll = () => {
  const scrollOnNavigate = (delay = 100) => {
    scrollToTop(delay);
  };

  return { scrollOnNavigate };
};
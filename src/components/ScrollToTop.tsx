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

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  behavior?: 'smooth' | 'instant';
}

/**
 * ScrollToTop component - автоматически прокручивает страницу наверх при смене роута
 * Это решает проблему когда пользователь переходит на новую страницу, 
 * но остается в том же положении скролла что и на предыдущей странице
 */
export const ScrollToTop: React.FC<ScrollToTopProps> = ({ 
  behavior = 'instant' 
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Multiple fallback methods to ensure scroll to top works
    const scrollToTop = () => {
      try {
        // Method 1: Standard window.scrollTo (most reliable)
        if (behavior === 'instant') {
          window.scrollTo(0, 0);
        } else {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
        }

        // Method 2: Direct property assignment (fallback)
        if (window.pageYOffset > 0) {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }

        // Method 3: Scroll main container if it exists
        const mainContainer = document.querySelector('main');
        if (mainContainer && mainContainer.scrollTop > 0) {
          mainContainer.scrollTop = 0;
        }

        // Method 4: Scroll any scroll containers
        const scrollContainers = document.querySelectorAll('[data-scroll-container]');
        scrollContainers.forEach(container => {
          if (container.scrollTop > 0) {
            container.scrollTop = 0;
          }
        });

      } catch (error) {
        console.warn('ScrollToTop: Error during scroll:', error);
        // Ultimate fallback - direct property assignment
        try {
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        } catch (fallbackError) {
          console.warn('ScrollToTop: Fallback also failed:', fallbackError);
        }
      }
    };

    // Execute immediately
    scrollToTop();

    // Additional check after a short delay to ensure it worked
    const timeoutId = setTimeout(() => {
      if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
        console.log('ScrollToTop: Initial scroll failed, trying again...');
        scrollToTop();
      }
    }, 100);

    // Final check after navigation is complete
    const finalTimeoutId = setTimeout(() => {
      if (window.pageYOffset > 0 || document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
        console.log('ScrollToTop: Previous attempts failed, using aggressive approach...');
        // Most aggressive approach
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(finalTimeoutId);
    };
  }, [pathname, behavior]);

  // Компонент не рендерит ничего - только side effect
  return null;
};

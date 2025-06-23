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
    // Используем более быстрый способ для мгновенной прокрутки
    if (behavior === 'instant') {
      // Мгновенная прокрутка - лучше для UX при переходах между страницами
      window.scrollTo(0, 0);
    } else {
      // Плавная прокрутка для случаев когда нужна анимация
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }

    // Дополнительная проверка для случаев когда scrollTo не сработал
    // (может случиться при быстрых переходах)
    const timeoutId = setTimeout(() => {
      if (window.pageYOffset > 0) {
        window.scrollTo(0, 0);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname, behavior]);

  // Компонент не рендерит ничего - только side effect
  return null;
};

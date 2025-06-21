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

/**
 * ScrollToTop component - автоматически прокручивает страницу наверх при смене роута
 * Это решает проблему когда пользователь переходит на новую страницу, 
 * но остается в том же положении скролла что и на предыдущей странице
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Прокручиваем к началу страницы при смене роута
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Плавная анимация прокрутки
    });
  }, [pathname]);

  // Компонент не рендерит ничего - только side effect
  return null;
};

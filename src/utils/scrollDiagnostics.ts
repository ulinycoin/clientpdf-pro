/**
 * Утилиты для диагностики проблем с горизонтальной прокруткой
 * Используется только в режиме разработки
 */

export interface ScrollDiagnostics {
  hasHorizontalScroll: boolean;
  documentWidth: number;
  viewportWidth: number;
  overflowElements: Element[];
  recommendations: string[];
}

/**
 * Проверяет наличие горизонтальной прокрутки и находит проблемные элементы
 */
export function diagnoseHorizontalScroll(): ScrollDiagnostics {
  const documentWidth = document.documentElement.scrollWidth;
  const viewportWidth = window.innerWidth;
  const hasHorizontalScroll = documentWidth > viewportWidth;

  const overflowElements: Element[] = [];
  const recommendations: string[] = [];

  // Если есть горизонтальная прокрутка, найдем проблемные элементы
  if (hasHorizontalScroll) {
    const allElements = document.querySelectorAll('*');

    allElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      // Проверяем если элемент выходит за пределы viewport
      if (rect.right > viewportWidth || rect.width > viewportWidth) {
        overflowElements.push(element);
      }

      // Проверяем потенциально проблемные CSS свойства
      if (computedStyle.position === 'fixed' && rect.width > viewportWidth) {
        recommendations.push(`Fixed element ${element.tagName} is too wide for mobile`);
      }

      if (computedStyle.minWidth && computedStyle.minWidth !== 'auto') {
        const minWidth = parseInt(computedStyle.minWidth);
        if (minWidth > viewportWidth) {
          recommendations.push(`Element ${element.tagName} has min-width larger than viewport`);
        }
      }

      if (computedStyle.overflowX !== 'hidden' && computedStyle.overflowX !== 'auto') {
        if (rect.width > viewportWidth) {
          recommendations.push(`Element ${element.tagName} should have overflow-x: hidden`);
        }
      }
    });

    // Общие рекомендации
    if (overflowElements.length > 0) {
      recommendations.push('Add max-width: 100vw to problematic elements');
      recommendations.push('Consider using overflow-x: hidden on body and html');
      recommendations.push('Check for unnecessary padding/margin on mobile');
    }
  }

  return {
    hasHorizontalScroll,
    documentWidth,
    viewportWidth,
    overflowElements,
    recommendations
  };
}

/**
 * Выводит диагностику в консоль (только в dev режиме)
 */
export function logScrollDiagnostics(): void {
  if (process.env.NODE_ENV !== 'development') return;

  const diagnostics = diagnoseHorizontalScroll();

  if (diagnostics.hasHorizontalScroll) {
    console.group('🚨 Horizontal Scroll Detected');
    console.log(`Document width: ${diagnostics.documentWidth}px`);
    console.log(`Viewport width: ${diagnostics.viewportWidth}px`);
    console.log(`Overflow: ${diagnostics.documentWidth - diagnostics.viewportWidth}px`);

    if (diagnostics.overflowElements.length > 0) {
      console.group('Problematic Elements:');
      diagnostics.overflowElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        console.log(`${index + 1}. ${element.tagName}${element.className ? '.' + element.className.split(' ').join('.') : ''}`, {
          width: rect.width,
          right: rect.right,
          element
        });
      });
      console.groupEnd();
    }

    if (diagnostics.recommendations.length > 0) {
      console.group('Recommendations:');
      diagnostics.recommendations.forEach(rec => console.log(`• ${rec}`));
      console.groupEnd();
    }

    console.groupEnd();
  } else {
    console.log('✅ No horizontal scroll detected');
  }
}

/**
 * Автоматически запускает диагностику при изменении размера окна
 */
export function setupScrollDiagnostics(): void {
  if (process.env.NODE_ENV !== 'development') return;

  // Запускаем диагностику после загрузки страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', logScrollDiagnostics);
  } else {
    logScrollDiagnostics();
  }

  // Запускаем диагностику при изменении размера окна
  let timeoutId: number;
  window.addEventListener('resize', () => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(logScrollDiagnostics, 500);
  });

  // Запускаем диагностику при изменении ориентации
  window.addEventListener('orientationchange', () => {
    setTimeout(logScrollDiagnostics, 1000);
  });
}

/**
 * Применяет быстрые исправления для предотвращения горизонтальной прокрутки
 */
export function applyScrollFixes(): void {
  // Добавляем overflow-x: hidden к html и body
  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';

  // Устанавливаем max-width для всех потенциально проблемных элементов
  const style = document.createElement('style');
  style.textContent = `
    * {
      box-sizing: border-box;
    }

    body, html, #root {
      overflow-x: hidden !important;
      max-width: 100vw !important;
    }

    .container, .max-w-4xl, .max-w-6xl, .max-w-7xl {
      max-width: 100% !important;
    }

    @media (max-width: 768px) {
      * {
        max-width: 100vw;
      }

      img, video, iframe {
        max-width: 100% !important;
        height: auto !important;
      }
    }
  `;
  document.head.appendChild(style);
}

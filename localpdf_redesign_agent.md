# Claude Code Agent: LocalPDF Modern Redesign 2024-2025

Ты - специализированный агент для модернизации дизайна LocalPDF, ориентированный на реализацию современных трендов веб-дизайна с акцентом на приватность. Твоя главная задача - пошагово трансформировать существующий интерфейс в соответствии с исследованием трендов 2024-2025.

## Контекст проекта

### Архитектура
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Структура**: Atomic design (atoms/molecules/organisms/shared)
- **Особенности**: 13 PDF инструментов, 5 языков, полностью клиентская обработка
- **Живой сайт**: https://localpdf.online
- **Репозиторий**: https://github.com/ulinycoin/clientpdf-pro.git

### Ключевые принципы редизайна
1. **Privacy-first визуализация** - подчеркнуть локальную обработку как премиум-функцию
2. **Тактический максимализм** - плотные, насыщенные интерфейсы со стратегической сложностью
3. **Modern color palettes** - океанические тона + палитра приватности
4. **Device-centric processing** - анимации и индикаторы локальной обработки

## Фазы реализации

### ФАЗА 1: Основы современного дизайна
**Цель**: Обновить фундаментальные элементы дизайна

**Задачи по приоритету**:
1. **Цветовая система приватности**
   - Внедрить CSS custom properties для темной/светлой темы
   - Oceaniczne palettes: Seafoam Green `#4ECDC4`, Ocean Blue `#45B7D1`, Sandy Beige `#F4E4BC`
   - Privacy palette: Deep Blue `#1a1a2e`, Dark Grey `#121212`, Muted Green `#0d4f3c`
   - Dopamine colors для микровзаимодействий: Electric Blue `#00BFFF`, Bright Green `#00FF7F`

2. **Типографическая система**
   - Заменить шрифты на Inter или SF Pro Display
   - Создать иерархию размеров с правильными line-heights
   - Обновить всю типографику в компонентах

3. **Современные кнопки и интерактивные элементы**
   - Реализовать новые button variants с hover-эффектами
   - Добавить loading states с spinner интеграцией
   - Обновить все CTA элементы

4. **Dark/Light mode система**
   - Реализовать toggle с плавными переходами
   - Обеспечить контрастность для accessibility
   - Адаптировать все компоненты под оба режима

### ФАЗА 2: Privacy-focused UX
**Цель**: Визуально подчеркнуть приватность и безопасность

**Задачи по приоритету**:
1. **Визуализация локальной обработки**
   - Создать анимированные индикаторы "данные остаются на устройстве"
   - Добавить циркулярные progress bars для локальной обработки
   - Реализовать сравнения скорости "Локально vs Облако"

2. **Messaging безопасности**
   - Обновить все тексты с акцентом на приватность
   - Добавить security badges и trust indicators
   - Создать tooltips с объяснениями приватности

3. **Современные drag-and-drop зоны**
   - Большие центральные области с четкой иерархией
   - Анимация границ при hover/drag
   - Мобильные альтернативы для touch устройств

4. **Индикаторы прогресса нового поколения**
   - Device-centric processing визуализация
   - Real-time показатели эффективности
   - Security messaging во время обработки

### ФАЗА 3: Продвинутые функции
**Цель**: Внедрить cutting-edge возможности

**Задачи по приоритету**:
1. **Микроанимации и микровзаимодействия**
   - Celebration animations для success states
   - Subtle hover transformations
   - Loading animations с brand элементами

2. **Глассморфизм 2.0 элементы**
   - Модальные окна с backdrop blur
   - Прозрачные navigation overlays
   - Layered content с proper hierarchy

3. **Advanced accessibility**
   - WCAG 2.2 полное соответствие
   - Keyboard navigation оптимизация
   - Screen reader improvements

4. **PWA возможности**
   - Service Worker для offline режима
   - App-like experience на мобильных
   - Push notifications для завершения обработки

## Руководящие принципы кодирования

### Структура компонентов
```typescript
// Паттерн для современных компонентов
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'privacy'
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark'
  isProcessing?: boolean
}

// Используй compound components для сложных UI
const ToolCard = {
  Root: ToolCardRoot,
  Icon: ToolCardIcon,
  Title: ToolCardTitle,
  Description: ToolCardDescription,
  Action: ToolCardAction
}
```

### Tailwind CSS best practices
```css
/* Используй CSS custom properties для dynamic theming */
:root {
  --color-bg-primary: theme('colors.white');
  --color-text-primary: theme('colors.gray.900');
  --color-privacy-primary: #1a1a2e;
  --color-ocean-blue: #45B7D1;
}

[data-theme="dark"] {
  --color-bg-primary: theme('colors.gray.900');
  --color-text-primary: theme('colors.gray.100');
}

/* Atomic classes для consistency */
.btn-privacy {
  @apply px-6 py-3 rounded-lg font-medium transition-all duration-200;
  @apply bg-privacy-primary hover:bg-privacy-secondary text-white;
  @apply focus:ring-2 focus:ring-privacy-accent focus:ring-offset-2;
}
```

### Animation guidelines
```typescript
// Используй CSS-only анимации где возможно
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
}

// Respect motion preferences
const useMotionPreferences = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }
}
```

## Специфические инструкции

### При работе с существующими компонентами:
1. **Сохраняй функциональность** - не ломай существующие hooks и services
2. **Постепенные изменения** - обновляй по одному компоненту за раз
3. **Тестируй мобильность** - каждое изменение должно работать на всех устройствах
4. **Проверяй accessibility** - используй aria-labels, focus management
5. **Многоязычность** - учитывай разную длину текстов в 5 языках

### При создании новых компонентов:
1. **Atomic design** - размещай в правильную папку (atoms/molecules/organisms)
2. **TypeScript first** - полная типизация всех props и states
3. **Responsive by default** - mobile-first подход
4. **Theme-aware** - поддержка light/dark modes
5. **Accessible** - keyboard navigation, screen readers

### Performance optimization:
1. **Lazy loading** - все тяжелые компоненты
2. **Memoization** - React.memo для expensive renders
3. **Bundle splitting** - код должен загружаться incrementally
4. **CSS-in-JS optimization** - предпочитай Tailwind CSS

## Приоритеты задач

### ВЫСОКИЙ ПРИОРИТЕТ (делай первым):
- Цветовая система и темы
- Типографика и шрифты
- Базовые кнопки и формы
- Главная страница hero section

### СРЕДНИЙ ПРИОРИТЕТ:
- Карточки инструментов redesign
- Drag-and-drop зоны
- Progress indicators
- Navigation improvements

### НИЗКИЙ ПРИОРИТЕТ (после основ):
- Продвинутые анимации
- Микровзаимодействия
- PWA функции
- Advanced accessibility

## Примеры конкретных улучшений

### Hero section современный подход:
```typescript
const HeroSection = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-ocean-blue via-seafoam-green to-sandy-beige">
    <div className="absolute inset-0 bg-privacy-pattern opacity-10" />
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
      <div className="text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
          <ShieldIcon className="w-4 h-4 text-privacy-accent" />
          <span className="text-sm font-medium">100% приватная обработка</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          PDF инструменты
          <span className="block text-privacy-primary">без загрузки</span>
        </h1>
        <LocalProcessingVisualization />
      </div>
    </div>
  </section>
)
```

### Tool card модернизация:
```typescript
const ToolCard = ({ tool, theme = 'light' }) => (
  <div className={cn(
    "group relative overflow-hidden rounded-2xl transition-all duration-300",
    "bg-white dark:bg-gray-800 hover:shadow-2xl hover:scale-105",
    "border border-gray-200 dark:border-gray-700 hover:border-privacy-accent"
  )}>
    <div className="absolute inset-0 bg-gradient-to-br from-privacy-primary/5 to-ocean-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative p-6 space-y-4">
      <div className="flex items-center justify-between">
        <tool.icon className="w-8 h-8 text-privacy-primary" />
        <LocalProcessingBadge />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        {tool.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {tool.description}
      </p>
      <Button variant="privacy" className="w-full">
        Открыть инструмент
        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  </div>
)
```

## Чек-лист для каждого PR

### Обязательно проверь:
- [ ] Компонент работает в light и dark режимах
- [ ] Responsive design на всех breakpoints
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] TypeScript типы полные и корректные
- [ ] Translations поддерживаются (если есть текст)
- [ ] Performance не пострадал (bundle size, render time)
- [ ] Privacy messaging присутствует где релевантно
- [ ] Соответствие design system цветам и spacing

### Тестирование:
- [ ] Desktop Chrome/Firefox/Safari
- [ ] Mobile iOS Safari/Android Chrome
- [ ] Keyboard-only navigation
- [ ] Screen reader (VoiceOver/NVDA)
- [ ] Slow network conditions
- [ ] Different content lengths (короткий/длинный текст)

Используй этот набор инструкций как roadmap для создания современного, privacy-focused интерфейса LocalPDF. Каждое изменение должно приближать приложение к статусу эталона приватных PDF-инструментов с cutting-edge дизайном.
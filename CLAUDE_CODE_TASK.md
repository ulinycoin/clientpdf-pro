# Claude Code Commands for LocalPDF Documentation Integration

## 🚀 Задание для Claude Code

Интегрировать Context7-подобную документацию в LocalPDF проект для улучшения AI-поиска (69% трафика от ChatGPT).

## 📁 Проект
Путь: `/Users/aleksejs/Desktop/clientpdf-pro`

## 🎯 Основные задачи

### 1. Создать страницу документации
```bash
claude-code create src/pages/DocsPage.tsx
```
Требования:
- React компонент с TypeScript
- Использовать существующий дизайн (Tailwind + glassmorphism)
- Мультиязычность через useI18n хук
- SEO-оптимизация для AI
- Загрузка данных из /localpdf-docs.json

### 2. Компоненты документации
```bash
claude-code create src/components/docs/DocsNavigation.tsx
claude-code create src/components/docs/DocsContent.tsx
claude-code create src/components/docs/AIOptimizationStats.tsx
claude-code create src/components/docs/LibraryCard.tsx
claude-code create src/components/docs/ToolCard.tsx
```

### 3. API для документации
```bash
claude-code create src/pages/api/docs.ts
```
Требования:
- Next.js API route
- Кеширование в памяти
- CORS поддержка
- Возврат JSON из localpdf-docs.json

### 4. Роутинг
```bash
claude-code edit src/config/routes.ts
```
Добавить:
- /docs маршрут
- Мультиязычные версии: /de/docs, /fr/docs, /es/docs, /ru/docs
- Lazy loading компонента

### 5. Переводы
```bash
claude-code create src/locales/en/docs.ts
claude-code create src/locales/de/docs.ts
claude-code create src/locales/fr/docs.ts
claude-code create src/locales/es/docs.ts
claude-code create src/locales/ru/docs.ts
```

### 6. Автогенератор документации
```bash
claude-code create scripts/generate-docs-auto.js
```
Требования:
- Сканирование проекта
- Автообновление JSON
- Интеграция в build процесс

## 🎨 Дизайн требования

Использовать существующие стили:
- Классы: `bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg`
- Цвета: seafoam/ocean градиенты
- Компоненты: как в StandardToolPageTemplate.tsx
- Анимации: smooth-reveal, staggered-reveal

## 📊 Важные файлы в проекте

Существующие файлы для референса:
- `localpdf-docs.json` - структурированные данные
- `src/hooks/useI18n.tsx` - мультиязычность
- `src/components/templates/StandardToolPageTemplate.tsx` - базовый шаблон
- `tailwind.config.js` - конфигурация стилей
- `src/config/routes.ts` - роутинг

## 🤖 AI-оптимизация (КРИТИЧНО!)

Обязательно добавить:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "LocalPDF",
  "applicationCategory": "ProductivityApplication",
  "description": "Privacy-first PDF tools with 16 utilities in 5 languages"
}
</script>
```

## 📋 Структура URL

Создать маршруты:
- `/docs` - главная документация
- `/docs/tools` - PDF инструменты  
- `/docs/libraries` - библиотеки
- `/docs/architecture` - архитектура
- `/{lang}/docs` - локализованные версии

## 🔧 Технические детали

### TypeScript интерфейсы
```typescript
interface DocsData {
  overview: {
    name: string;
    version: string;
    description: string;
  };
  tools: Tool[];
  libraries: Library[];
  aiOptimization: AIStats;
}
```

### Компоненты должны быть адаптивными
- Desktop: sidebar + content
- Mobile: collapsible navigation
- Tablet: оптимизированная сетка

## ⚡ Performance требования

- Lazy loading для тяжелых компонентов
- Code splitting для docs секции
- Кеширование API запросов
- Оптимизация изображений

## ✅ Критерии успеха

1. **Функциональность**:
   - [ ] /docs работает на всех языках (en, de, fr, es, ru)
   - [ ] Отображается вся информация из JSON
   - [ ] Мобильная версия корректно работает

2. **SEO/AI оптимизация**:
   - [ ] Structured data настроен
   - [ ] Meta теги заполнены
   - [ ] Open Graph добавлен

3. **Производительность**:
   - [ ] Загрузка <3 сек
   - [ ] Code splitting работает
   - [ ] Кеширование активно

## 🚨 Важные замечания

1. **НЕ трогайте** существующие файлы без необходимости
2. **Используйте** существующие хуки и компоненты
3. **Следуйте** паттернам проекта (например, как сделан MergePDFPage.tsx)
4. **Фокус на AI** - 69% трафика от ChatGPT!

## 🔥 Приоритеты

1. **High Priority**: DocsPage.tsx + роутинг + базовый контент
2. **Medium Priority**: AI оптимизация + мультиязычность  
3. **Low Priority**: Автогенератор + продвинутые фичи

## 📞 Готовые данные

В проекте уже есть:
- `localpdf-docs.json` - полные данные проекта
- `LocalPDF-Documentation.md` - Markdown версия
- Переводы в `src/locales/` 
- Дизайн-система в проекте

## 🎯 Результат

После выполнения должно быть:
- Работающая страница /docs
- Красивый UI в стиле проекта
- AI-оптимизированный контент
- Мультиязычная поддержка
- Адаптивный дизайн

---

**Готово к выполнению в Claude Code!** 🚀

Фокус: AI-first подход для 69% ChatGPT трафика + современный React/TypeScript код.
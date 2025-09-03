# Задание для Claude Code: Создание блога и SEO статей

## Цель проекта
Создать полнофункциональный блог для LocalPDF v2.0 с SEO-оптимизированными статьями на 5 языках для увеличения органического трафика и позиционирования как эксперта в области PDF инструментов.

## Расположение проекта
```bash
cd /Users/aleksejs/Desktop/clientpdf-pro
```

## Архитектурные требования

### 1. Структура блога
```
src/
├── components/
│   ├── blog/
│   │   ├── BlogLayout.tsx          # Общий layout для блога
│   │   ├── BlogCard.tsx           # Карточка статьи
│   │   ├── BlogHeader.tsx         # Хедер блога
│   │   ├── BlogSidebar.tsx        # Сайдбар с категориями/тегами
│   │   ├── BlogPagination.tsx     # Пагинация
│   │   ├── BlogSearch.tsx         # Поиск по блогу
│   │   ├── RelatedArticles.tsx    # Похожие статьи
│   │   └── BlogBreadcrumbs.tsx    # Хлебные крошки для блога
│   └── seo/
│       ├── BlogSEO.tsx           # SEO компонент для статей
│       └── BlogSchema.tsx        # JSON-LD схема для статей
├── content/
│   └── blog/
│       ├── en/                   # Английские статьи
│       ├── de/                   # Немецкие статьи  
│       ├── fr/                   # Французские статьи
│       ├── es/                   # Испанские статьи
│       └── ru/                   # Русские статьи
├── hooks/
│   ├── useBlogPosts.tsx         # Хук для работы с постами
│   └── useBlogSearch.tsx        # Хук для поиска
├── types/
│   └── blog.ts                  # Типы для блога
└── utils/
    ├── blogUtils.ts            # Утилиты для блога
    └── markdownParser.ts       # Парсер Markdown
```

### 2. Роутинг блога
- `/blog` - главная страница блога (EN)
- `/de/blog` - немецкая версия
- `/fr/blog` - французская версия  
- `/es/blog` - испанская версия
- `/ru/blog` - русская версия
- `/blog/category/[category]` - страница категории
- `/blog/[slug]` - отдельная статья
- `/de/blog/[slug]` - статья на немецком и т.д.

## Технические требования

### 1. TypeScript типы (src/types/blog.ts)
```typescript
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  tags: string[];
  readingTime: number;
  language: 'en' | 'de' | 'fr' | 'es' | 'ru';
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl?: string;
    ogImage?: string;
  };
  featured: boolean;
  relatedPosts?: string[];
}

export interface BlogCategory {
  slug: string;
  name: string;
  description: string;
  postCount: number;
}
```

### 2. Основной компонент блога
Создай `src/pages/BlogPage.tsx` используя `StandardToolPageTemplate`:

```typescript
import { StandardToolPageTemplate } from '../components/templates/StandardToolPageTemplate';
import { BlogLayout } from '../components/blog/BlogLayout';

export const BlogPage = () => {
  const seoData = {
    title: 'PDF Tips & Tutorials Blog - LocalPDF',
    description: 'Expert guides on PDF editing, conversion, and optimization. Learn professional PDF workflows and discover advanced techniques.',
    // ... остальные SEO данные
  };

  return (
    <StandardToolPageTemplate
      seoData={seoData}
      toolId="blog"
      pageTitle="PDF Expert Blog"
      pageDescription="Professional guides and tutorials"
      toolComponent={<BlogLayout />}
      breadcrumbKey="blog"
    />
  );
};
```

### 3. Контент-менеджмент
Создай систему для управления статьями через Markdown файлы:

```markdown
---
title: "How to Merge PDF Files: Complete Guide 2025"
excerpt: "Learn professional techniques for merging PDF files with step-by-step instructions"
author: "LocalPDF Team"
publishedAt: "2025-01-15"
category: "tutorials"
tags: ["pdf-merge", "tutorial", "guide"]
featured: true
seo:
  metaTitle: "How to Merge PDF Files Online - Complete Guide | LocalPDF"
  metaDescription: "Professional guide to merging PDF files. Learn 5 methods including online tools, software, and batch merging. Free step-by-step tutorial."
---

# Content here...
```

## SEO статьи для создания

### Категории контента:

#### 1. **Tutorials** (Руководства)
- "How to Merge PDF Files: Complete Guide 2025"
- "PDF Compression: Reduce File Size Without Quality Loss"
- "How to Add Watermarks to PDF: Professional Guide"
- "PDF to Image Conversion: Best Practices"
- "OCR for PDFs: Extract Text from Scanned Documents"

#### 2. **Comparisons** (Сравнения)
- "Online PDF Tools vs Desktop Software: Which is Better?"
- "LocalPDF vs Adobe Acrobat: Feature Comparison"
- "Free PDF Tools Comparison: Top 10 Alternatives"

#### 3. **Industry Insights** (Отраслевые инсайты)
- "PDF Security Best Practices for Businesses"
- "Digital Document Workflows in 2025"
- "Privacy-First PDF Processing: Why It Matters"

#### 4. **Technical Guides** (Технические гайды)
- "PDF/A Standards: Archival PDF Creation"
- "PDF Accessibility: Making Documents WCAG Compliant"
- "Batch PDF Processing: Automation Techniques"

#### 5. **Use Cases** (Кейсы использования)
- "PDF Tools for Remote Teams"
- "Student Guide to PDF Management"
- "Legal Document Processing with PDFs"

### Multilingual Strategy
Каждую статью создать на всех 5 языках с учетом:
- Локальных поисковых запросов
- Культурных особенностей
- Местной терминологии

## Функциональные требования

### 1. BlogLayout компонент
```typescript
export const BlogLayout = () => {
  return (
    <div className="blog-container">
      <BlogHeader />
      <div className="blog-content">
        <main className="blog-main">
          <BlogSearch />
          <FeaturedPosts />
          <BlogGrid />
          <BlogPagination />
        </main>
        <BlogSidebar />
      </div>
    </div>
  );
};
```

### 2. SEO оптимизация
- JSON-LD Schema для статей
- Open Graph теги
- Twitter Cards
- Canonical URLs
- Hreflang теги для мультиязычности
- Sitemap для блога

### 3. Производительность
- Lazy loading для изображений
- Code splitting для блога
- RSS фид
- Поиск по контенту

## Дизайн требования

### 1. Glassmorphism стиль
Используй существующую дизайн-систему проекта:
- Ocean color palette
- Blur effects
- Modern cards
- Responsive design

### 2. Компоненты
```css
.blog-card {
  @apply bg-white/10 backdrop-blur-lg border border-white/20;
  @apply rounded-2xl p-6 hover:bg-white/15 transition-all;
}

.blog-header {
  @apply bg-gradient-to-r from-seafoam-green to-ocean-blue;
  @apply text-white py-16;
}
```

## Контент стратегия

### 1. Стартовые статьи (создать первыми)
Для каждого языка создай топ-5 статей:

**English:**
1. "Complete Guide to PDF Merging in 2025"
2. "How to Compress PDFs Without Losing Quality"
3. "PDF Security: Protecting Your Documents"
4. "OCR for PDFs: Ultimate Guide"
5. "PDF Accessibility: WCAG Compliance"

**Deutsch:**
1. "PDF-Dateien zusammenführen: Vollständige Anleitung 2025"
2. "PDF komprimieren ohne Qualitätsverlust"
3. "PDF-Sicherheit: Dokumente schützen"
4. "OCR für PDFs: Ultimative Anleitung"
5. "PDF-Barrierefreiheit: WCAG-Konformität"

*(И так для всех языков)*

### 2. Ключевые слова для SEO
- "PDF merge online free"
- "how to compress PDF"
- "PDF tools"
- "PDF converter"
- "PDF editor online"

## Интеграция с существующим проектом

### 1. Обновить роутинг в App.tsx
```typescript
// Добавить маршруты для блога
<Route path="/blog" element={<BlogPage />} />
<Route path="/blog/:slug" element={<BlogPostPage />} />
<Route path="/blog/category/:category" element={<BlogCategoryPage />} />

// Мультиязычные маршруты
<Route path="/:lang/blog" element={<BlogPage />} />
<Route path="/:lang/blog/:slug" element={<BlogPostPage />} />
```

### 2. Обновить навигацию
Добавить "Blog" в главное меню сайта.

### 3. Обновить переводы
Добавить переводы для всех блог-компонентов в:
- `src/locales/en/blog.ts`
- `src/locales/de/blog.ts`
- `src/locales/fr/blog.ts`
- `src/locales/es/blog.ts`
- `src/locales/ru/blog.ts`

## Генерация контента

### 1. Автоматизация
Создай скрипты для:
```bash
npm run blog:create-post  # Создание нового поста
npm run blog:generate-sitemap  # Генерация sitemap
npm run blog:build-rss  # Создание RSS фида
```

### 2. Markdown парсер
Используй unified/remark для обработки Markdown с поддержкой:
- Syntax highlighting
- Table of contents
- Image optimization
- Internal link detection

## План реализации

### Этап 1: Базовая структура
1. Создать типы и интерфейсы
2. Настроить роутинг
3. Создать основные компоненты
4. Интегрировать с дизайн-системой

### Этап 2: Контент-менеджмент  
1. Настроить Markdown парсер
2. Создать систему категорий и тегов
3. Реализовать поиск
4. Добавить пагинацию

### Этап 3: SEO оптимизация
1. JSON-LD схемы
2. Open Graph
3. Sitemap генерация  
4. RSS фид

### Этап 4: Контент
1. Написать стартовые статьи на английском
2. Перевести на остальные языки
3. Добавить изображения и медиа
4. Оптимизировать для SEO

## Ожидаемые результаты

✅ **Полнофункциональный блог** на 5 языках  
✅ **25+ SEO статей** для органического трафика  
✅ **Современный дизайн** в стиле LocalPDF  
✅ **Мобильная адаптивность**  
✅ **Быстрая загрузка** с оптимизацией  
✅ **Поисковая оптимизация** для всех языков  

## Команды для запуска

```bash
cd /Users/aleksejs/Desktop/clientpdf-pro
claude-code "Создай блог и SEO статьи для LocalPDF согласно техническому заданию"
```

## Приоритет
🚀 **Средний-Высокий** - важно для долгосрочного SEO и привлечения органического трафика
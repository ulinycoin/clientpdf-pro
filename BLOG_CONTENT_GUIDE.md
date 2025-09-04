# 📝 Руководство по добавлению статей в блог LocalPDF

## 🚀 Быстрый старт

### 1. Структура блога
Блог LocalPDF поддерживает **5 языков** и автоматически создает **многоязычные SEO страницы**.

```
src/content/blog/
├── en/               # Английские статьи
├── de/               # Немецкие статьи  
├── fr/               # Французские статьи
├── es/               # Испанские статьи
└── ru/               # Русские статьи
```

### 2. Как добавить новую статью

#### Шаг 1: Создайте Markdown файл
```bash
# Например, для статьи про безопасность PDF
touch src/content/blog/en/pdf-security-best-practices-2025.md
```

#### Шаг 2: Заполните Frontmatter
```markdown
---
title: "PDF Security Best Practices in 2025"
excerpt: "Complete guide to protecting your PDF documents with advanced security methods"
author: "LocalPDF Team"
publishedAt: "2025-01-15"
category: "security" 
tags: ["security", "encryption", "privacy", "guide"]
featured: false
seo:
  metaTitle: "PDF Security Guide 2025 - Protect Your Documents | LocalPDF"
  metaDescription: "Learn essential PDF security practices: password protection, encryption, digital signatures. Expert tips for document safety in 2025."
  ogImage: "/images/blog/pdf-security-og.jpg"
---

# PDF Security Best Practices in 2025

Your article content here...
```

#### Шаг 3: Создайте переводы
Создайте аналогичные файлы для других языков:
- `src/content/blog/de/pdf-sicherheit-beste-praktiken-2025.md`
- `src/content/blog/fr/meilleures-pratiques-securite-pdf-2025.md`
- `src/content/blog/es/mejores-practicas-seguridad-pdf-2025.md`
- `src/content/blog/ru/luchshie-praktiki-bezopasnosti-pdf-2025.md`

## 📋 Обязательные поля Frontmatter

### Основные поля:
```yaml
title: "Заголовок статьи"                    # ОБЯЗАТЕЛЬНО
excerpt: "Краткое описание (150-160 символов)" # ОБЯЗАТЕЛЬНО  
author: "LocalPDF Team"                      # ОБЯЗАТЕЛЬНО
publishedAt: "2025-01-15"                    # ОБЯЗАТЕЛЬНО (YYYY-MM-DD)
category: "tools"                            # ОБЯЗАТЕЛЬНО
tags: ["pdf", "guide", "tutorial"]          # ОБЯЗАТЕЛЬНО (массив)
featured: false                              # по умолчанию false
```

### SEO поля:
```yaml
seo:
  metaTitle: "Title для Google (50-60 символов)"     # ОБЯЗАТЕЛЬНО
  metaDescription: "Description (150-160 символов)"  # ОБЯЗАТЕЛЬНО
  ogImage: "/images/blog/article-name-og.jpg"        # Опционально
  canonicalUrl: "https://localpdf.online/blog/slug"  # Опционально
```

### Доступные категории:
- `"tools"` - Обзоры PDF инструментов
- `"tutorials"` - Пошаговые руководства  
- `"tips"` - Советы и лайфхаки
- `"security"` - Безопасность PDF
- `"business"` - Бизнес использование
- `"guide"` - Подробные гайды

## 🎨 Markdown форматирование

### Поддерживаемые элементы:
```markdown
# H1 заголовок
## H2 заголовок  
### H3 заголовок

**Жирный текст** и *курсив*

[Ссылка](https://example.com)

- Маркированный список
- Элемент 2

1. Нумерованный список
2. Элемент 2

`Inline код`

```javascript
// Блок кода
const example = "Hello World";
```

> Цитата

---
```

### Специальные возможности:
- ✅ **Автоматический расчет времени чтения**
- ✅ **Генерация URL slug'а из заголовка** 
- ✅ **Автоматические breadcrumbs**
- ✅ **Related posts система**
- ✅ **Tags и категории фильтрация**

## 🌍 Многоязычность

### Соответствие файлов:
Убедитесь, что slug'и совпадают для всех языков:
```
en/how-to-merge-pdf-files-2025.md
de/pdf-dateien-zusammenfuegen-2025.md  
fr/comment-fusionner-fichiers-pdf-2025.md
es/como-combinar-archivos-pdf-2025.md
ru/kak-obedinit-pdf-faily-2025.md
```

### Автоматическое создание URL:
- EN: `/blog/how-to-merge-pdf-files-2025`
- DE: `/de/blog/pdf-dateien-zusammenfuegen-2025` 
- FR: `/fr/blog/comment-fusionner-fichiers-pdf-2025`
- ES: `/es/blog/como-combinar-archivos-pdf-2025`
- RU: `/ru/blog/kak-obedinit-pdf-faily-2025`

## 🔧 Технические особенности

### Автоматическая обработка:
1. **Slug генерация**: Из title создается URL-friendly slug
2. **Reading time**: Автоматический подсчет времени чтения
3. **Excerpt extraction**: Если не указан, берется из начала статьи
4. **SEO meta**: Автоматическая структурированная разметка Schema.org

### Расположение файлов:
```
src/
├── content/blog/           # Markdown статьи
├── components/blog/        # React компоненты
├── hooks/useBlogPosts.tsx  # Логика загрузки
├── utils/markdownParser.ts # Парсер Markdown
└── types/blog.ts          # TypeScript типы
```

## 📊 SEO оптимизация

### Checklist для каждой статьи:
- ✅ **Title 50-60 символов** с ключевыми словами
- ✅ **Description 150-160 символов** с призывом к действию  
- ✅ **H1 заголовок** соответствует title
- ✅ **Ключевые слова в URL** (автоматически из title)
- ✅ **Внутренние ссылки** на инструменты LocalPDF
- ✅ **Tags релевантные** теме статьи
- ✅ **Category правильная** для группировки

### Структурированные данные:
Автоматически генерируются:
- `@type: "BlogPosting"` 
- `author`, `datePublished`, `dateModified`
- `mainEntityOfPage`, `publisher`
- `keywords` из tags

## 🚀 Деплой процесс

### После добавления статей:
1. **Билд проекта**: `npm run build`
2. **Проверка генерации**: Все статьи должны появиться в `/dist/`
3. **Sitemap обновление**: Автоматически включается в `sitemap.xml`
4. **Multi-language индексация**: Все языковые версии создаются

### Проверка перед деплоем:
```bash
# Запуск dev сервера
npm run dev

# Проверка всех страниц блога:
open http://localhost:3000/blog                    # EN главная
open http://localhost:3000/de/blog                 # DE главная  
open http://localhost:3000/fr/blog                 # FR главная
open http://localhost:3000/es/blog                 # ES главная
open http://localhost:3000/ru/blog                 # RU главная

# Проверка отдельных статей:
open http://localhost:3000/blog/article-slug       # EN статья
open http://localhost:3000/de/blog/artikel-slug    # DE статья
```

## 📝 Шаблон для новой статьи

```markdown
---
title: "Your Article Title Here"
excerpt: "Brief description of the article content for search engines and social media"
author: "LocalPDF Team"
publishedAt: "2025-01-15"
category: "tools"
tags: ["pdf", "tutorial", "guide"]
featured: false
seo:
  metaTitle: "SEO Title | LocalPDF"
  metaDescription: "SEO description for search engines with call to action"
  ogImage: "/images/blog/article-og-image.jpg"
---

# Your Article Title Here

## Introduction

Brief introduction to the topic...

## Main Content

### Section 1
Content here...

### Section 2  
More content...

## Conclusion

Summary and call to action...

---

*Need help with PDF tools? Try our [free PDF merger](/merge-pdf) or explore our [full toolkit](/) for all your document needs.*
```

## 🆘 Troubleshooting

### Статья не появляется:
1. Проверьте frontmatter синтаксис
2. Убедитесь в правильности формата даты
3. Перезапустите dev сервер

### SEO проблемы:
1. Проверьте длину title и description
2. Убедитесь в уникальности metaTitle
3. Проверьте валидность тегов

### Многоязычность:
1. Создавайте файлы для всех 5 языков
2. Используйте консистентные slug'и
3. Переводите все SEO метаданные

---

**💡 Совет**: Используйте существующие статьи как примеры для структуры и форматирования!
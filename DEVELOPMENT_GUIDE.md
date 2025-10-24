# app-spa Development Guide

**Last Updated:** October 18, 2025
**Maintainer:** Claude Code
**Project:** LocalPDF app-spa (Hash-based SPA)

---

## 🎯 Project Overview

**app-spa** - это отдельное SPA-приложение с хэш-роутингом (`/#merge`), работающее параллельно с основным приложением LocalPDF.

### Ключевые отличия от основного приложения

| Аспект | Основное приложение (`/`) | app-spa (`/app-spa`) |
|--------|---------------------------|----------------------|
| **Роутинг** | BrowserRouter (`/merge-pdf`) | HashRouter (`/#merge`) |
| **SEO** | ✅ Отлично (Rendertron + GCS) | ❌ Не работает |
| **URL структура** | `/merge-pdf`, `/ru/split-pdf` | `/#merge`, `/#split` |
| **Цель** | Production сайт, SEO | Виджет, эксперимент, offline-приложение |
| **Дизайн** | Полноценный сайт с Header/Footer | Минималистичное приложение с Sidebar |
| **Деплой** | localpdf.online | Может быть iframe/embed |

**ВАЖНО:** app-spa НЕ ЗАМЕНЯЕТ основное приложение! Это дополнительная версия для специфичных use-case.

---

## 📁 Структура проекта

```
app-spa/
├── src/
│   ├── components/
│   │   ├── tools/              # PDF инструменты (6 из 17)
│   │   │   ├── MergePDF.tsx    ✅ Реализовано
│   │   │   ├── SplitPDF.tsx    ✅ Реализовано
│   │   │   ├── CompressPDF.tsx ✅ Реализовано
│   │   │   ├── ProtectPDF.tsx  ✅ Реализовано
│   │   │   ├── OCRPDF.tsx      ✅ Реализовано
│   │   │   └── WatermarkPDF.tsx ✅ Реализовано
│   │   ├── layout/
│   │   │   └── Sidebar.tsx     # Навигация по инструментам
│   │   └── WelcomeScreen.tsx   # Главная страница
│   ├── hooks/
│   │   ├── useHashRouter.tsx   # Хэш-роутинг (#merge, #split)
│   │   └── useI18n.tsx         # Интернационализация (5 языков)
│   ├── services/               # PDF обработка (общие с основным приложением)
│   ├── locales/                # Переводы (EN, RU, DE, FR, ES)
│   ├── types/
│   │   └── index.ts            # TypeScript типы (17 tools)
│   ├── App.tsx                 # Главный компонент (с lazy loading)
│   └── main.tsx                # Entry point
├── vite.config.ts              # ⭐ Code splitting конфигурация
├── package.json                # Зависимости
└── DEVELOPMENT_GUIDE.md        # 👈 Этот файл

```

---

## 🚀 Как запустить

### Dev-сервер (разработка)

```bash
# Из корня проекта
cd app-spa
npm run dev

# Откроется: http://localhost:3000
```

**Доступные URL:**
- `http://localhost:3000` - главная страница
- `http://localhost:3000/#merge` - Merge PDF
- `http://localhost:3000/#split` - Split PDF
- `http://localhost:3000/#compress` - Compress PDF
- `http://localhost:3000/#protect` - Protect PDF
- `http://localhost:3000/#ocr` - OCR PDF
- `http://localhost:3000/#watermark` - Watermark PDF

### Production build

```bash
cd app-spa
npm run build

# Результат в app-spa/dist/
```

### Preview production

```bash
cd app-spa
npm run preview

# Откроется: http://localhost:4173 (обычно)
```

---

## ⚡ Принципы производительности

### 1. ✅ Code Splitting (ОБЯЗАТЕЛЬНО!)

**Проблема:** Без code splitting весь app-spa грузится в один файл (~2.3MB).

**Решение:** Используем `vite.config.ts` для разбиения на чанки.

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-pdf-lib': ['pdf-lib', '@pdf-lib/fontkit'],
        'vendor-pdfjs': ['pdfjs-dist'],
        'vendor-ocr': ['tesseract.js'],
      }
    }
  }
}
```

**Результат:**
- Начальная загрузка: **74 KB gzip** (было 817 KB)
- PDF-библиотеки грузятся по требованию
- Инструменты lazy-load при клике

### 2. ✅ Lazy Loading для инструментов

**ВСЕГДА используй React.lazy() для новых инструментов!**

```typescript
// App.tsx - ПРАВИЛЬНО ✅
const MergePDF = lazy(() => import('@/components/tools/MergePDF').then(m => ({ default: m.MergePDF })));

// App.tsx - НЕПРАВИЛЬНО ❌
import { MergePDF } from '@/components/tools/MergePDF';
```

**Обёртка в Suspense:**

```typescript
<Suspense fallback={<ToolLoading />}>
  {currentTool === 'merge-pdf' && <MergePDF />}
</Suspense>
```

### 3. ✅ Bundle размеры после оптимизации

| Chunk | Размер | Gzip | Когда загружается |
|-------|--------|------|-------------------|
| index.js | 225 KB | 70 KB | При старте (always) |
| vendor-react | 12 KB | 4 KB | При старте (always) |
| vendor-pdf-lib | 1,147 KB | 509 KB | При клике на инструмент |
| vendor-pdfjs | 326 KB | 95 KB | При клике на OCR/Split/Watermark |
| vendor-ocr | 17 KB | 7 KB | При клике на OCR |
| MergePDF.js | 10 KB | 3 KB | При клике на Merge |
| SplitPDF.js | 19 KB | 4 KB | При клике на Split |
| CompressPDF.js | 11 KB | 3 KB | При клике на Compress |
| ProtectPDF.js | 13 KB | 4 KB | При клике на Protect |
| OCRPDF.js | 10 KB | 3 KB | При клике на OCR |
| WatermarkPDF.js | 15 KB | 4 KB | При клике на Watermark |

**Общая начальная загрузка: ~74 KB gzip** ✅

---

## 🛠️ Как добавить новый инструмент

### Шаг 1: Создать компонент

```bash
# Создать файл
touch app-spa/src/components/tools/RotatePDF.tsx
```

```typescript
// app-spa/src/components/tools/RotatePDF.tsx
import React, { useState } from 'react';
import { useI18n } from '@/hooks/useI18n';

export const RotatePDF: React.FC = () => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);

  // Ваша логика здесь...

  return (
    <div className="card p-8">
      <h2 className="text-3xl font-bold mb-4">
        {t('tools.rotate-pdf.name')}
      </h2>
      {/* UI инструмента */}
    </div>
  );
};
```

### Шаг 2: Добавить в App.tsx (с lazy loading!)

```typescript
// App.tsx
const RotatePDF = lazy(() => import('@/components/tools/RotatePDF').then(m => ({ default: m.RotatePDF })));

// В JSX:
<Suspense fallback={<ToolLoading />}>
  {currentTool === 'rotate-pdf' && <RotatePDF />}
</Suspense>
```

### Шаг 3: Добавить в Sidebar

```typescript
// app-spa/src/components/layout/Sidebar.tsx
const TOOLS: ToolItem[] = [
  { id: 'rotate-pdf', icon: '🔄', tier: 2 }, // Добавить сюда
];
```

### Шаг 4: Добавить переводы

```typescript
// app-spa/src/locales/en.json
{
  "tools": {
    "rotate-pdf": {
      "name": "Rotate PDF",
      "description": "Rotate PDF pages"
    }
  }
}
```

**ВАЖНО:** Инструмент уже будет работать! Типы в `types/index.ts` уже содержат `'rotate-pdf'`.

---

## 🎨 Реализованные инструменты (6/17)

### ✅ Tier 1 (Core) - 5/5

1. ✅ **merge-pdf** - Merge PDF files
2. ✅ **split-pdf** - Split PDF into pages
3. ✅ **compress-pdf** - Compress PDF size
4. ✅ **protect-pdf** - Add password protection
5. ✅ **ocr-pdf** - OCR text recognition

### ✅ Tier 2 (Edit) - 1/6

6. ✅ **watermark-pdf** - Add watermark

### ❌ Tier 2 (Edit) - НЕ реализовано (5/6)

7. ❌ **add-text-pdf** - Add text to PDF
8. ❌ **rotate-pdf** - Rotate pages
9. ❌ **delete-pages-pdf** - Delete pages
10. ❌ **extract-pages-pdf** - Extract pages
11. ❌ **unlock-pdf** - Remove password

### ❌ Tier 3 (Convert) - НЕ реализовано (6/6)

12. ❌ **images-to-pdf** - Images to PDF
13. ❌ **pdf-to-images** - PDF to images
14. ❌ **pdf-to-word** - PDF to Word
15. ❌ **word-to-pdf** - Word to PDF
16. ❌ **sign-pdf** - Sign PDF
17. ❌ **flatten-pdf** - Flatten PDF

**edit-pdf** - УДАЛЁН (18 октября 2025) - прекращена разработка

---

## 🚫 Что НЕ НУЖНО делать

### ❌ НЕ копируй из основного приложения без адаптации

Основное приложение использует:
- BrowserRouter (app-spa использует hash)
- Сложные SEO компоненты (app-spa не нужны)
- Другую структуру папок

**Вместо этого:**
- Копируй логику обработки PDF (сервисы)
- Адаптируй UI под minimalist design
- Используй локальные переводы из `app-spa/src/locales`

### ❌ НЕ добавляй инструменты БЕЗ lazy loading

```typescript
// ПЛОХО ❌
import { NewTool } from '@/components/tools/NewTool';

// ХОРОШО ✅
const NewTool = lazy(() => import('@/components/tools/NewTool').then(m => ({ default: m.NewTool })));
```

### ❌ НЕ используй хэш-роутинг в основном приложении

app-spa - это отдельный проект! Основное приложение (`/`) остаётся с BrowserRouter.

---

## 📝 Чеклист перед коммитом

- [ ] Все новые инструменты используют lazy loading
- [ ] TypeScript компилируется без ошибок (`npm run build`)
- [ ] Bundle размер проверен (начальная загрузка < 100 KB gzip)
- [ ] Переводы добавлены для всех 5 языков
- [ ] Dev-сервер работает (`npm run dev`)
- [ ] Инструмент добавлен в Sidebar
- [ ] Никаких `edit-pdf` упоминаний (удалён!)

---

## 🔧 Troubleshooting

### Проблема: Bundle слишком большой (>100 KB gzip)

**Причина:** Забыл добавить lazy loading для инструмента.

**Решение:**
```typescript
// Было:
import { Tool } from '@/components/tools/Tool';

// Стало:
const Tool = lazy(() => import('@/components/tools/Tool').then(m => ({ default: m.Tool })));
```

### Проблема: TypeScript ошибка "Type 'X' is not assignable to type 'Tool'"

**Причина:** Добавил новый инструмент, но забыл добавить в `types/index.ts`.

**Решение:**
```typescript
// app-spa/src/types/index.ts
export type Tool =
  | 'merge-pdf'
  | 'your-new-tool' // Добавить сюда
  | ...
```

### Проблема: /#merge не открывается на localhost:3000

**Причина:** Запущено основное приложение (BrowserRouter), а не app-spa.

**Решение:**
```bash
# Остановить основное приложение (Ctrl+C)
cd app-spa
npm run dev
```

### Проблема: PDF-библиотека грузится дважды

**Причина:** Не вынесли в `manualChunks` в vite.config.ts.

**Решение:**
```typescript
// vite.config.ts
manualChunks: {
  'vendor-your-lib': ['your-pdf-library'],
}
```

---

## 📚 Полезные команды

```bash
# Запуск dev-сервера
cd app-spa && npm run dev

# Production build
cd app-spa && npm run build

# Проверка bundle размеров
cd app-spa && npm run build | grep gzip

# TypeScript проверка
cd app-spa && npx tsc --noEmit

# Очистка
cd app-spa && rm -rf dist node_modules && npm install
```

---

## 🎯 Roadmap

### Completed ✅
- [x] Code splitting оптимизация
- [x] Lazy loading для всех инструментов
- [x] Удаление edit-pdf
- [x] 6 основных инструментов реализованы

### In Progress 🔄
- [ ] Добавить оставшиеся 11 инструментов
- [ ] PWA support (offline mode)
- [ ] Better UI/UX для mobile

### Future 🔮
- [ ] Деплой app-spa на отдельный домен
- [ ] Embed виджет для других сайтов
- [ ] Desktop app (Electron)

---

## 💡 Tips для разработки

1. **Всегда проверяй bundle размер** после добавления нового инструмента
2. **Используй React DevTools** для отладки lazy loading
3. **Тестируй на медленном интернете** (Chrome DevTools → Network → Slow 3G)
4. **Проверяй все 5 языков** перед коммитом
5. **Code splitting - это не опция, а требование!**

---

## 📞 Контакты

**Maintainer:** Claude Code
**Project:** LocalPDF
**Repository:** https://github.com/ulinycoin/clientpdf-pro
**Main App:** https://localpdf.online

---

**Last Review:** October 18, 2025
**Next Review:** When adding new tools or major changes

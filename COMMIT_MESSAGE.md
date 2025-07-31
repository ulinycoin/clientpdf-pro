# SEO оптимизация и исключение страниц из индексации

## Что сделано:

### ✅ SEO улучшения:
- Добавлен динамический SEO хук `useDynamicSEO.ts` для обновления метаданных
- Оптимизирован chunking в Vite для лучшей производительности
- Созданы скрипты для генерации sitemap и pre-rendering страниц
- Исправлено соответствие между роутами в App.tsx и sitemap.xml

### 🚫 Исключены из индексации:
- `/demo` - демо/тестовая страница
- `/how-to-use` - дублирующий FAQ контент

### 📝 Технические изменения:
- **robots.txt**: добавлены Disallow для /demo и /how-to-use
- **HowToUsePage.tsx**: добавлен `<meta name="robots" content="noindex, nofollow" />`
- **EnhancedPDFProcessorPage.tsx**: добавлен `<meta name="robots" content="noindex, nofollow" />`
- **sitemap.xml**: обновлен список страниц (16 страниц без исключенных)

### 🔧 Файлы изменены:
- `src/hooks/useDynamicSEO.ts` (новый)
- `scripts/generate-sitemap.js` (обновлен)
- `scripts/prerender.js` (новый)
- `vite.config.ts` (оптимизация chunking)
- `public/robots.txt` (исключения)
- `src/pages/HowToUsePage.tsx` (noindex)
- `src/pages/EnhancedPDFProcessorPage.tsx` (noindex)
- `src/pages/tools/MergePDFPage.tsx` (добавлен useDynamicSEO)

## Готово к отправке sitemap в поисковики!

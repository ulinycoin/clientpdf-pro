# Задание: Добавить функциональность извлечения изображений из PDF в LocalPDF

## Контекст проекта
LocalPDF - это privacy-first веб-приложение для работы с PDF файлами, которое обрабатывает все данные локально в браузере. Проект использует React + TypeScript + Vite, уже имеет множество PDF инструментов включая недавно добавленный PDF to SVG.

## Цель
Создать новый инструмент "Extract Images from PDF" который будет извлекать все изображения из PDF документа, позволяя пользователям скачивать их по отдельности или пакетом.

## Техническое задание

### 1. Анализ существующей кодовой базы
- Изучить структуру проекта `/Users/aleksejs/Desktop/clientpdf-pro`
- Проанализировать компоненты `PdfToImageTool.tsx` и недавно созданный `PdfToSvgTool.tsx`
- Изучить систему типов и сервисов для PDF обработки
- Понять паттерны работы с изображениями в существующих инструментах

### 2. Создание сервиса ImageExtractionService
Создать файл `src/services/imageExtractionService.ts` со следующим функционалом:
- Singleton паттерн (следуя архитектуре других сервисов)
- Метод извлечения изображений из PDF с прогрессом
- Фильтрация изображений по размеру, типу, качеству
- Обработка различных форматов изображений (JPEG, PNG, и др.)

**Техническая реализация:**
```typescript
// Основной алгоритм через PDF.js:
// 1. Загрузить PDF документ
// 2. Для каждой страницы получить operatorList
// 3. Найти операторы рисования изображений (paintImageXObject, etc.)
// 4. Извлечь данные изображений из объектов
// 5. Конвертировать в стандартные форматы (JPEG/PNG)
// 6. Создать блобы для скачивания
```

### 3. Создание типов
Создать файл `src/types/imageExtraction.types.ts` с интерфейсами:

```typescript
interface ImageExtractionOptions {
  pages?: number[] | 'all';
  minWidth?: number;
  minHeight?: number;
  outputFormat?: 'original' | 'png' | 'jpeg';
  jpegQuality?: number;
  includeVectorImages?: boolean;
}

interface ExtractedImage {
  id: string;
  pageNumber: number;
  originalFormat: string;
  width: number;
  height: number;
  size: number; // в байтах
  blob: Blob;
  dataUrl: string; // для превью
  filename: string;
}

interface ImageExtractionResult {
  success: boolean;
  images: ExtractedImage[];
  totalImages: number;
  totalSize: number;
  error?: string;
}

interface ImageExtractionProgress {
  currentPage: number;
  totalPages: number;
  imagesFound: number;
  currentImage?: string;
  percentage: number;
  status: string;
}
```

### 4. Создание React компонента
Создать файл `src/components/organisms/ExtractImagesFromPdfTool.tsx`:

**Основные функции UI:**
- Drag & drop загрузка PDF файлов
- Настройки извлечения в боковой панели:
  - Выбор страниц (все, диапазон, конкретные)
  - Минимальный размер изображений (ширина/высота)
  - Формат вывода (оригинальный, PNG, JPEG)
  - Качество JPEG (для конвертации)
- Превью найденных изображений в grid layout
- Информация о каждом изображении (размер, разрешение, формат)
- Возможность выбора изображений для скачивания
- Кнопки "Download Selected" и "Download All as ZIP"

**UI компоненты:**
```typescript
// Основные секции:
// 1. Upload Zone (переиспользовать ModernUploadZone)
// 2. Settings Panel (справа или слева)
// 3. Progress Bar (во время обработки)
// 4. Results Grid (превью изображений)
// 5. Action Buttons (скачивание)
```

### 5. Особенности реализации извлечения

**Обработка изображений в PDF.js:**
```typescript
// Алгоритм извлечения:
// 1. page.getOperatorList() для получения операций рисования
// 2. Поиск операций типа OPS.paintImageXObject
// 3. Получение изображений через page.objs.get()
// 4. Конвертация ImageData в Canvas
// 5. Экспорт Canvas в Blob
```

**Фильтрация и оптимизация:**
- Игнорировать слишком маленькие изображения (например, < 32x32px)
- Дедупликация одинаковых изображений
- Обработка изображений с прозрачностью
- Корректное извлечение метаданных

### 6. Создание ZIP архивов
Использовать существующие возможности или добавить библиотеку для создания ZIP:
```typescript
// Структура ZIP архива:
// extracted_images_[filename]/
//   ├── page_1_image_1.jpg
//   ├── page_1_image_2.png
//   ├── page_2_image_1.jpg
//   └── metadata.json (опционально)
```

### 7. Интеграция в приложение
- Добавить новый маршрут `/extract-images-from-pdf`
- Добавить карточку инструмента в `ModernToolsGrid.tsx`
- Обновить навигацию и SEO метаданные
- Добавить иконку (использовать Lucide React: `Images`, `Download`, `FileImage`)

### 8. Локализация
Добавить переводы для всех 5 языков (en, de, fr, es, ru):

**Ключевые фразы для перевода:**
```typescript
// tools/extractImagesFromPdf.ts структура:
{
  title: "Extract Images from PDF",
  description: "Extract all images from PDF documents...",
  uploadPrompt: "Drop your PDF file here or click to browse",
  settings: {
    pageSelection: "Page Selection",
    minSize: "Minimum Image Size", 
    outputFormat: "Output Format",
    jpegQuality: "JPEG Quality"
  },
  results: {
    imagesFound: "images found",
    totalSize: "Total size",
    downloadSelected: "Download Selected",
    downloadAll: "Download All as ZIP"
  },
  errors: {
    noImages: "No images found in this PDF",
    extractionFailed: "Failed to extract images"
  }
}
```

### 9. Обработка ошибок и edge cases
**Возможные проблемы:**
- PDF без изображений
- Зашифрованные/защищенные PDF
- Поврежденные изображения в PDF
- Очень большие изображения (memory issues)
- Нестандартные форматы изображений

**Решения:**
- Информативные сообщения об ошибках
- Graceful degradation
- Прогрессивная загрузка больших изображений
- Валидация размера файлов

### 10. Производительность и оптимизация
- Обработка по частям (chunk-based) для больших PDF
- Lazy loading превью изображений
- Дебаунс для настроек фильтрации
- Web Workers для тяжелых операций (если возможно)
- Memory management для больших изображений

### 11. Тестирование
**Тестовые сценарии:**
- PDF с различными типами изображений (JPEG, PNG)
- PDF с большим количеством изображений (>50)
- PDF с очень большими изображениями (>10MB)
- PDF без изображений
- PDF с дублированными изображениями
- Многостраничные PDF с изображениями на разных страницах

## Файлы для создания/изменения

### Новые файлы:
1. `src/services/imageExtractionService.ts`
2. `src/types/imageExtraction.types.ts`
3. `src/components/organisms/ExtractImagesFromPdfTool.tsx`
4. `src/locales/en/tools/extractImagesFromPdf.ts`
5. `src/locales/de/tools/extractImagesFromPdf.ts`
6. `src/locales/fr/tools/extractImagesFromPdf.ts`
7. `src/locales/es/tools/extractImagesFromPdf.ts`
8. `src/locales/ru/tools/extractImagesFromPdf.ts`

### Файлы для изменения:
9. `src/App.tsx` (добавить маршрут)
10. `src/components/organisms/ModernToolsGrid.tsx` (добавить карточку инструмента)
11. `src/locales/*/navigation.ts` (обновить навигацию)

## Критерии успеха
- [ ] Успешное извлечение изображений из различных PDF
- [ ] Корректная работа настроек фильтрации
- [ ] Удобный UI с превью изображений
- [ ] Возможность скачивания отдельных изображений и ZIP архива
- [ ] Производительность: обработка PDF с 20 изображениями за < 10 сек
- [ ] Полная локализация на 5 языков
- [ ] Обработка edge cases и ошибок
- [ ] Соответствие дизайну других инструментов LocalPDF

## Дополнительные возможности (для будущих итераций)
- Поиск изображений по содержимому (через AI/ML)
- Автоматическое улучшение качества извлеченных изображений
- Поддержка извлечения векторных изображений как SVG
- Batch обработка нескольких PDF файлов
- Интеграция с облачными хранилищами

## Примечания по реализации
- Начни с изучения работы с изображениями в PDF.js документации
- Используй существующие паттерны из PdfToImageTool и PdfToSvgTool
- Все обработка должна происходить локально (privacy-first)
- Следуй code style и архитектуре проекта
- Предусмотри возможность расширения функциональности
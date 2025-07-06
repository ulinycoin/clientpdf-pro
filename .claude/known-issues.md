## ✅ Решенные проблемы

### Critical: Favicon не отображается в браузере - RESOLVED ✅
**Дата обнаружения**: 2025-07-06
**Дата решения**: 2025-07-06
**Серьезность**: medium
**Компонент**: favicon files, index.html
**Проблема**: Favicon не отображался в браузерных табах, закладках и истории
**Ошибка**: 
- В index.html использовался `<link rel="icon" type="image/svg+xml" href="/vite.svg" />` вместо LocalPDF favicon
- Отсутствовал основной файл `favicon.ico` (требуется для legacy browser support)
- Отсутствовал `favicon.svg` для современных браузеров
- Неправильный порядок объявления favicon в HTML
**Причина**: 
- index.html содержал ссылку на Vite SVG вместо брендированного favicon
- В папке public/ не было файла favicon.ico
- Не был создан SVG favicon с логотипом LocalPDF
**Решение**:
- Создан favicon.svg с дизайном LocalPDF (синий градиент, PDF иконка, зеленая точка "Local")
- Создан favicon.ico файл (16x16, синий фон с белой буквой "L")
- Обновлен index.html с правильной иерархией favicon:
  ```html
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  ```
- Сохранены существующие PNG варианты и Apple Touch icon
**Файлы изменены**:
- `public/favicon.ico` - создан новый ICO файл
- `public/favicon.svg` - создан новый SVG логотип
- `index.html` - исправлены ссылки на favicon
**Тестирование**: После исправления favicon должен отображаться во всех современных браузерах и legacy браузерах
**Влияние**: Улучшена узнаваемость бренда LocalPDF, favicon теперь виден в табах, закладках и PWA установках

### Critical: Файлы с расширением .pdf.название_инструмента - RESOLVED ✅
**Дата обнаружения**: 2025-07-04
**Дата решения**: 2025-07-04
**Серьезность**: critical
**Компонент**: generateFilename calls в AddTextTool.tsx
**Проблема**: Файлы скачивались с двойным расширением типа `filename.pdf.add-text` вместо правильного `filename_add-text.pdf`
**Ошибка**: В AddTextTool.tsx неправильный порядок параметров в функции `generateFilename`
**Причина**: 
- В AddTextTool.tsx на строке 75 использовалось `generateFilename("add-text", pdfFile.name)`
- Функция `generateFilename` ожидает порядок параметров: `(originalName, suffix, extension)`
- Результат: файлы скачивались как `add-text_document.pdf.undefined` или подобное
**Решение**:
- Исправлен вызов в AddTextTool.tsx на: `generateFilename(pdfFile.name, 'add-text', 'pdf')`
- Теперь файлы скачиваются с правильным форматом: `document_add-text.pdf`
**Файлы изменены**:
- src/components/organisms/AddTextTool.tsx - исправлен порядок параметров generateFilename
**Тестирование**: После исправления AddTextTool должен сохранять файлы с правильными расширениями
**Влияние**: Исправлена проблема с именованием файлов в AddTextTool, теперь весь проект использует консистентные имена файлов

### Critical: Сконвертированные файлы выходят с расширением .true - RESOLVED ✅
**Дата обнаружения**: 2025-07-03
**Дата решения**: 2025-07-03
**Серьезность**: critical
**Компонент**: Файловая система сохранения, утилиты downloadFile
**Проблема**: Все файлы скачивались с расширением .true вместо правильных расширений (.pdf, .png, .jpg)
**Ошибка**: В функции `generateFilename` в качестве третьего параметра (extension) передавалось булево значение `true` вместо строки с расширением
**Причина**: 
- В HomePage.tsx и AddTextTool.tsx использовалось `generateFilename(name, suffix, true)` 
- Функция `generateFilename` ожидает строку как третий параметр (extension)
- Булево значение `true` конвертировалось в строку ".true"
**Решение**:
- Исправлены вызовы в HomePage.tsx: заменены на `generateFilename(fileName, suffix, 'pdf')`
- Исправлены вызовы в AddTextTool.tsx: заменены на `generateFilename(fileName, suffix, 'pdf')`
- Теперь все PDF файлы скачиваются с правильным расширением .pdf
**Файлы изменены**:
- src/pages/HomePage.tsx - исправлены два вызова generateFilename
- src/components/organisms/AddTextTool.tsx - исправлен один вызов generateFilename
**Тестирование**: После исправления все инструменты должны сохранять файлы с правильными расширениями
**Влияние**: Исправлена критическая проблема, блокировавшая корректное сохранение всех обработанных файлов

### Minor: Vite WebSocket connection warnings
**Дата обнаружения**: 2025-07-01
**Серьезность**: low
**Компонент**: Vite dev server
**Воспроизведение**: Запустить dev server и открыть консоль
**Ожидаемое поведение**: Нет предупреждений о WebSocket
**Фактическое поведение**: WebSocket connection failed warnings
**Workaround**: Можно игнорировать, не влияет на функциональность
**Статус**: open

### Critical: Missing lucide-react dependency - RESOLVED ✅
**Дата обнаружения**: 2025-07-02
**Дата решения**: 2025-07-02
**Серьезность**: critical
**Компонент**: NotFoundPage.tsx, package.json
**Проблема**: NotFoundPage.tsx импортировал lucide-react иконки, но пакет отсутствовал в dependencies
**Ошибка**: `Failed to resolve import "lucide-react" from "src/pages/NotFoundPage.tsx"`
**Причина**: 
- NotFoundPage.tsx использовал import { ArrowLeft, Home, Search, FileText } from "lucide-react"
- lucide-react не был добавлен в package.json dependencies
- Vite не смог разрешить импорт при сборке
**Решение**:
- Добавлен "lucide-react": "^0.263.1" в dependencies секцию package.json
- Версия совместима с React 18 и TypeScript проекта
- Теперь все иконки в NotFoundPage корректно импортируются
**Файлы изменены**:
- package.json - добавлена зависимость lucide-react
**Тестирование**: После npm install проект должен собираться без ошибок

### Critical: setTotalPages is not a function in AddTextTool - RESOLVED ✅
**Дата обнаружения**: 2025-07-01
**Дата решения**: 2025-07-01
**Серьезность**: critical
**Компонент**: useAddText.ts, AddTextTool.tsx
**Проблема**: AddTextTool.tsx вызывал setTotalPages из хука, но функция не была экспортирована
**Ошибка**: `TypeError: setTotalPages is not a function at loadPDF`
**Причина**: 
- setTotalPages была объявлена в интерфейсе UseAddTextReturn
- Функция setTotalPagesValue была реализована в хуке
- Но функция не экспортировалась в return блоке хука
**Решение**:
- Добавлена setTotalPages в интерфейс UseAddTextReturn
- Реализована setTotalPagesValue с валидацией (total >= 1)
- Экспортирована setTotalPages: setTotalPagesValue в return блоке
- Теперь AddTextTool может корректно устанавливать количество страниц

### Critical: Non-ASCII characters in watermark text - RESOLVED ✅
**Дата обнаружения**: 2025-07-01
**Дата решения**: 2025-07-01
**Серьезность**: critical
**Компонент**: watermarkService.ts
**Проблема**: Ошибка "WinAnsi cannot encode" при использовании кириллических символов в водяных знаках
**Ошибка**: `Error: WinAnsi cannot encode "с" (0x0441) at WatermarkService.calculatePosition`
**Причина**: StandardFonts.Helvetica в pdf-lib не поддерживает кириллицу и другие non-ASCII символы
**Решение**:
- Добавлена функция `sanitizeText()` с транслитерацией кириллицы в латиницу
- Mapping кириллических символов: "с" → "s", "А" → "A", etc.
- Поддержка диакритических знаков: "ñ" → "n", "ë" → "e", etc.
- Fallback для неподдерживаемых символов: замена на "?"
- Безопасная обработка ошибок в `calculatePosition()`
- Добавлено предупреждение в UI о конвертации символов
- Методы `hasNonAsciiCharacters()` и `getNonAsciiWarning()` для UX

### UX: Page scroll position on tool navigation - RESOLVED ✅
**Дата обнаружения**: 2025-07-01
**Дата решения**: 2025-07-01
**Серьезность**: medium
**Компонент**: HomePage.tsx, scroll navigation
**Проблема**: При переходе к инструментам и обратно страница не прокручивалась наверх
**Ожидаемое поведение**: Плавная прокрутка к началу страницы при навигации между инструментами
**Фактическое поведение**: Страница оставалась в текущей позиции скролла
**Решение**:
- Добавлен автоматический scroll to top при переходе к инструментам
- Плавная анимация с `behavior: 'smooth'`
- Оптимизированные временные задержки (100-150ms)
- Создан utility `scrollHelpers.ts` с переиспользуемыми функциями
- Добавлен custom hook `useScrollBehavior.ts` для консистентного поведения
- Улучшено позиционирование инструментов (pt-8 вместо py-8)

### UX: PDF to Image button active without files - RESOLVED ✅
**Дата обнаружения**: 2025-07-01
**Дата решения**: 2025-07-01
**Серьезность**: medium
**Компонент**: HomePage.tsx, ToolsGrid.tsx, PdfToImageTool.tsx
**Проблема**: PDF to Image кнопка была активна без загруженных файлов, что создавало inconsistency в UX
**Ожидаемое поведение**: Все инструменты должны требовать загрузку файлов перед активацией
**Фактическое поведение**: PDF to Image был активен сразу, другие инструменты требовали файлы
**Решение**: 
- Добавлен 'pdf-to-image' в список disabledTools когда нет файлов
- Изменена логика handleToolSelect - все инструменты теперь требуют файлы
- Добавлен пропс initialFile в PdfToImageTool для передачи предзагруженного файла
- Обновлен UX flow: загрузка файла → выбор инструмента → обработка

### Critical: Component import types mismatch - RESOLVED ✅
**Дата обнаружения**: 2025-07-01
**Дата решения**: 2025-07-01
**Серьезность**: critical
**Компонент**: PdfToImageTool.tsx
**Проблема**: Неправильные типы импортов компонентов
**Ошибки**: 
- `import { Button } from '../atoms/Button'` (компонент экспортируется как default)
- `import { FileUploadZone } from '../molecules/FileUploadZone'` (компонент экспортируется как default)
- `import { ProgressBar } from '../atoms/ProgressBar'` (компонент экспортируется как default)

**Решение**: Исправлены импорты на default exports:
- `import Button from '../atoms/Button'`
- `import FileUploadZone from '../molecules/FileUploadZone'`
- `import ProgressBar from '../atoms/ProgressBar'`

### Critical: ProgressBar import path incorrect - RESOLVED ✅
**Дата обнаружения**: 2025-07-01
**Дата решения**: 2025-07-01
**Серьезность**: critical
**Компонент**: PdfToImageTool.tsx
**Проблема**: Неправильный путь импорта `import { ProgressBar } from "../molecules/ProgressBar"`
**Ошибка**: `Failed to resolve import "../molecules/ProgressBar" from "src/components/organisms/PdfToImageTool.tsx"`
**Решение**: Исправлен импорт на `import ProgressBar from "../atoms/ProgressBar"`
**Причина**: ProgressBar находится в atoms, а не в molecules согласно Atomic Design архитектуре

### Critical: PdfToImageTool component not exported - RESOLVED ✅
**Дата обнаружения**: 2025-07-01
**Дата решения**: 2025-07-01
**Серьезность**: critical
**Компонент**: PdfToImageTool.tsx
**Проблема**: Файл содержал только фрагмент кода ProgressBar вместо полного компонента
**Решение**: Создан полный функциональный компонент PdfToImageTool с:
- Загрузка PDF файлов
- Настройки формата (PNG/JPEG) и качества
- Выбор страниц (все/диапазон/конкретные)
- Настройка цвета фона для JPEG
- Прогресс-индикаторы
- Превью изображений
- Скачивание отдельных изображений или всех сразу
- Полная интеграция с сервисом pdfToImageService.ts
- Поддержка предзагруженных файлов через initialFile prop

## 📋 Шаблон для новых проблем

```markdown
### [Короткое описание]
**Дата обнаружения**: YYYY-MM-DD
**Серьезность**: critical/high/medium/low
**Компонент**: название компонента/сервиса
**Воспроизведение**: шаги для воспроизведения
**Ожидаемое поведение**: что должно происходить
**Фактическое поведение**: что происходит
**Workaround**: временное решение (если есть)
**Статус**: open/in-progress/resolved
```
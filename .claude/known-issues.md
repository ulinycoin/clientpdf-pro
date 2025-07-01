# Known Issues - ClientPDF Pro

## 🐛 Активные проблемы

### Minor: Vite WebSocket connection warnings
**Дата обнаружения**: 2025-07-01
**Серьезность**: low
**Компонент**: Vite dev server
**Воспроизведение**: Запустить dev server и открыть консоль
**Ожидаемое поведение**: Нет предупреждений о WebSocket
**Фактическое поведение**: WebSocket connection failed warnings
**Workaround**: Можно игнорировать, не влияет на функциональность
**Статус**: open

## ✅ Решенные проблемы

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
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

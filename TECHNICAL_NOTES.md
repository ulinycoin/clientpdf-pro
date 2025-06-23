# 📝 Техническая документация для разработчиков

## 🎯 Контекст проекта
- **Репозиторий**: https://github.com/ulinycoin/clientpdf-pro
- **Тип**: Single Page Application для работы с PDF файлами
- **Стек**: React 18 + TypeScript + Vite + Tailwind CSS
- **Принцип**: Privacy-first - вся обработка PDF на клиенте

## 🔧 Критическая проблема РЕШЕНА (23 июня 2025)

### Проблема
PDF.js npm пакет не работал в Vite + ES modules среде:
- Все импорты возвращали пустые объекты (`keys: []`)
- `getDocument is not a function` ошибки
- `GlobalWorkerOptions not available` проблемы

### Решение
Переход на CDN-подход:
- ✅ **Файл**: `src/utils/cdnPdfUtils.ts` - рабочее решение
- ✅ **Компонент**: `src/components/organisms/PDFSplitProcessor.tsx` - обновлен
- ✅ **Принцип**: Загрузка PDF.js напрямую из CDN через script тег

## 🏗️ Архитектура PDF утилит

### Рабочие файлы
```typescript
src/utils/cdnPdfUtils.ts           // ✅ ИСПОЛЬЗУЕТСЯ - CDN подход
src/components/organisms/PDFSplitProcessor.tsx // ✅ ОБНОВЛЕН
```

### Устаревшие файлы (НЕ УДАЛЯТЬ пока)
```typescript
src/utils/pdfUtils.ts             // ❌ Не работает - npm импорты
src/utils/simplePdfUtils.ts       // ❌ Не работает - динамические импорты  
src/utils/staticPdfUtils.ts       // ❌ Не работает - статические импорты
src/utils/workingPdfUtils.ts      // ❌ Не работает - копия simplePdfUtils
src/utils/robustPdfUtils.ts       // ❌ Не работает - множественные подходы
```

## 🎨 Состояние PDF процессоров

| Процессор | Статус | Утилиты | Примечание |
|-----------|--------|---------|------------|
| **PDFSplitProcessor** | ✅ Работает | `cdnPdfUtils.ts` | Обновлен и протестирован |
| **MergePDFProcessor** | ⚠️ Старые | Возможно старые утилиты | НЕ ТРОГАТЬ пока работает |
| **CompressPDFProcessor** | ⚠️ Старые | Возможно старые утилиты | НЕ ТРОГАТЬ пока работает |
| **ImagesToPDFProcessor** | ⚠️ Старые | Возможно старые утилиты | НЕ ТРОГАТЬ пока работает |

## 🚨 Принципы работы с PDF

### Для НОВЫХ функций
- ✅ ВСЕГДА использовать `cdnPdfUtils.ts`
- ✅ Импортировать: `import { ... } from '../../utils/cdnPdfUtils'`

### Для СУЩЕСТВУЮЩИХ процессоров
- ⚠️ НЕ ТРОГАТЬ если работают
- ⚠️ Обновлять только при ошибках или багах
- ⚠️ При обновлении - использовать `cdnPdfUtils.ts`

## 🔍 Debug инструменты

**Доступны в dev режиме:**
- **URL**: `http://localhost:3000/debug-pdf`
- **Файл**: `src/components/organisms/PDFTestComponent.tsx`
- **Назначение**: Диагностика PDF.js проблем

## 📦 Важные технические детали

### Package.json конфигурация
```json
{
  "type": "module",                    // Проблема с ES modules
  "pdfjs-dist": "^3.11.174"          // Версия зафиксирована
}
```

### Vite конфигурация
```typescript
// pdfjs-dist исключен из optimizeDeps.exclude
// worker конфигурация настроена для PDF.js
```

### CDN URLs (используются в cdnPdfUtils.ts)
- Script: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`
- Worker: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

## 🎯 Приоритеты разработки

### Высокий приоритет
1. ✅ Стабильность существующих функций
2. 🔄 Новые PDF инструменты (используя cdnPdfUtils.ts)
3. 🔄 UI/UX улучшения

### Средний приоритет
1. 🔄 Performance оптимизация
2. 🔄 Unit testing
3. 🔄 Миграция старых процессоров (когда будет время)

### Низкий приоритет
1. 🔄 Cleanup устаревших утилит
2. 🔄 Документация архитектуры
3. 🔄 Refactoring без функциональных изменений

## ⚡ Быстрые команды

```bash
# Запуск разработки
npm run dev

# Проверка типов
npm run type-check

# Сборка
npm run build

# Debug PDF проблем
# Открыть http://localhost:3000/debug-pdf
```

## 🧠 Ключевые уроки

1. **npm пакеты могут не работать** в некоторых конфигурациях сборщиков
2. **CDN подход надежнее** для браузерных библиотек
3. **"If it works, don't touch it"** - принцип стабильности
4. **Подробное логирование** критически важно для диагностики
5. **Множественные fallback стратегии** помогают найти решение

## 🔄 История изменений

### 23 июня 2025
- ✅ Решена проблема с PDF.js в Vite + ES modules
- ✅ Создан `cdnPdfUtils.ts` с CDN подходом
- ✅ Обновлен `PDFSplitProcessor.tsx`
- ✅ Добавлены debug инструменты
- ✅ PDF split функция полностью работает

---
**Последнее обновление**: 23 июня 2025  
**Статус проекта**: ✅ Стабильный, готов к продолжению разработки  
**Контакт**: Готов к совместной работе! 🚀
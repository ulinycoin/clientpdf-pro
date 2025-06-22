# CSV to PDF Converter

## 📊 Обзор

Профессиональный конвертер CSV файлов в PDF таблицы с расширенными возможностями настройки стилей и форматирования.

## ✨ Особенности

### 🔍 Умный парсинг CSV
- Автоматическое определение разделителей (`,`, `\t`, `|`, `;`, `:`, `~`)
- Поддержка различных кодировок
- Обработка больших файлов до 50MB
- Валидация и очистка данных

### 🎨 Настройки PDF
- **Ориентация:** Portrait/Landscape
- **Размеры страниц:** A4, A3, Letter, Legal
- **Стили таблиц:** Grid, Striped, Minimal, Plain
- **Шрифты:** Настраиваемый размер (6-16pt)
- **Дополнительно:** Заголовки документа, номера строк

### 🛡️ Безопасность
- Полностью клиентская обработка
- Данные не покидают браузер
- Приватность гарантирована

## 🚀 Использование

### Поддерживаемые форматы
- `.csv` - Comma-Separated Values
- `.tsv` - Tab-Separated Values  
- `.txt` - Текстовые файлы с разделителями

### Процесс конвертации
1. **Загрузка** - Drag & Drop или выбор файла
2. **Предварительный просмотр** - Проверка данных
3. **Настройки** - Конфигурация PDF опций
4. **Генерация** - Создание и скачивание PDF

## 🔧 Техническая реализация

### Архитектура
```typescript
CsvToPdfConverter
├── parseCSV()          // Papa Parse integration
├── convertToPDF()      // jsPDF + autoTable
├── validateCSV()       // File validation
└── getTableStyles()    // Style configuration
```

### Зависимости
- `papaparse` - CSV парсинг
- `jspdf` + `jspdf-autotable` - PDF генерация  
- `react-dropzone` - File upload UI
- `react-hot-toast` - Уведомления

### TypeScript типизация
```typescript
interface CsvToPdfOptions {
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'a3' | 'letter' | 'legal';
  fontSize: number;
  tableStyle: 'grid' | 'striped' | 'plain' | 'minimal';
  // ...
}
```

## 📋 API Reference

### `CsvToPdfConverter.parseCSV(file: File)`
Парсит CSV файл с автоматическим определением параметров.

**Возвращает:** `Promise<CsvParseResult>`

### `CsvToPdfConverter.convertToPDF(result, options)`
Конвертирует парсированные данные в PDF.

**Возвращает:** `Promise<Uint8Array>`

### `CsvToPdfConverter.validateCSV(file: File)`
Валидирует CSV файл перед обработкой.

**Возвращает:** `{ isValid: boolean; errors: string[] }`

## 🎯 Примеры использования

### Простая конвертация
```typescript
const file = // CSV File object
const parseResult = await CsvToPdfConverter.parseCSV(file);
const pdfBytes = await CsvToPdfConverter.convertToPDF(parseResult);
```

### С настройками
```typescript
const options: CsvToPdfOptions = {
  orientation: 'landscape',
  pageSize: 'a4',
  tableStyle: 'grid',
  fontSize: 10,
  title: 'Sales Report Q4 2024'
};

const pdfBytes = await CsvToPdfConverter.convertToPDF(parseResult, options);
```

## 🔍 Обработка ошибок

```typescript
try {
  const result = await CsvToPdfConverter.parseCSV(file);
  if (result.errors.length > 0) {
    // Обработка предупреждений парсинга
    result.errors.forEach(error => console.warn(error.message));
  }
} catch (error) {
  // Критические ошибки
  console.error('CSV parsing failed:', error);
}
```

## 📊 Производительность

- **Малые файлы** (<1MB): Мгновенная обработка
- **Средние файлы** (1-10MB): 1-3 секунды
- **Большие файлы** (10-50MB): 5-15 секунд
- **Лимит:** 50MB (настраиваемый)

## 🎨 Стили таблиц

### Grid
Профессиональные таблицы с границами и цветными заголовками.

### Striped
Чередующиеся цвета строк для лучшей читаемости.

### Minimal
Минималистичный дизайн с тонкими границами.

### Plain
Простые таблицы без украшений.

## 🚀 Оптимизация

### Memory Management
- Streaming обработка больших файлов
- Автоматическая очистка временных данных
- Эффективное использование памяти

### Performance Tips
- Используйте Landscape ориентацию для широких таблиц
- Настройте размер шрифта для оптимального размещения
- Включайте только необходимые колонки

## 🔄 Roadmap

### v0.2.0
- [ ] Поддержка Excel файлов (.xlsx)
- [ ] Предварительный просмотр PDF
- [ ] Дополнительные стили форматирования

### v0.3.0  
- [ ] Batch конвертация
- [ ] Фильтрация и сортировка данных
- [ ] Экспорт в другие форматы

## 🤝 Contributing

1. Форкните репозиторий
2. Создайте feature branch
3. Добавьте тесты для новой функциональности  
4. Убедитесь что все тесты проходят
5. Создайте Pull Request

## 📄 License

MIT License - см. LICENSE файл для деталей.

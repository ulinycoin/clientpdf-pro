# 🎨 Enhanced Unicode Font System для CSV to PDF

## Обзор

Система улучшенной поддержки Unicode была разработана для решения проблем с отображением шрифтов при конвертации CSV в PDF. Особенно важно для работы с латышскими, русскими, литовскими, польскими и другими языками с диакритическими знаками.

## ✨ Ключевые возможности

### 🔍 Автоматическое определение языка
- Анализ текста на наличие специальных символов
- Определение языка по характерным диакритикам
- Поддержка латышского, русского, литовского, польского, немецкого, французского языков

### 🎯 Умный выбор шрифта
- Автоматический выбор оптимального шрифта на основе контента
- Fallback стратегии для максимальной совместимости
- Поддержка различных стилей шрифтов (normal, bold, italic)

### 🔄 Интеллектуальная транслитерация
- Замена проблемных Unicode символов на совместимые альтернативы
- Сохранение читаемости при транслитерации
- Поддержка математических и специальных символов

## 🛠️ Архитектура системы

### Основные компоненты

```
EnhancedUnicodeFontService.ts    # Основной сервис управления шрифтами
├── FontMetrics                  # Интерфейсы для характеристик шрифтов
├── TextAnalysis                 # Анализ текста и определение языка
├── FontSetupResult             # Результаты настройки шрифтов
└── UNICODE_REPLACEMENTS        # Карта замен символов

CsvToPdfGenerator.ts            # Обновленный генератор с поддержкой Unicode
├── setupPDFFont()              # Настройка шрифтов для PDF
├── smartCleanText()            # Очистка текста
└── Enhanced callbacks          # Контроль шрифтов в autoTable

CsvToPdfGeneratorOptimized.ts   # Оптимизированный генератор для больших данных
├── Large data font handling    # Управление шрифтами для больших объемов
├── Multi-part PDF consistency  # Консистентность шрифтов в нескольких PDF
└── Memory optimization         # Оптимизация памяти при работе со шрифтами
```

## 📋 Поддерживаемые языки и символы

### Латышский язык
```
ā → a    Ā → A    (макрон над a)
č → c    Č → C    (гачек над c)
ē → e    Ē → E    (макрон над e)
ģ → g    Ģ → G    (седиль под g)
ī → i    Ī → I    (макрон над i)
ķ → k    Ķ → K    (седиль под k)
ļ → l    Ļ → L    (седиль под l)
ņ → n    Ņ → N    (седиль под n)
š → s    Š → S    (гачек над s)
ū → u    Ū → U    (макрон над u)
ž → z    Ž → Z    (гачек над z)
```

### Русский язык (кириллица)
```
а → a    А → A    б → b    Б → B
в → v    В → V    г → g    Г → G
д → d    Д → D    е → e    Е → E
ё → yo   Ё → Yo   ж → zh   Ж → Zh
з → z    З → Z    и → i    И → I
й → y    Й → Y    к → k    К → K
л → l    Л → L    м → m    М → M
н → n    Н → N    о → o    О → O
п → p    П → P    р → r    Р → R
с → s    С → S    т → t    Т → T
у → u    У → U    ф → f    Ф → F
х → h    Х → H    ц → ts   Ц → Ts
ч → ch   Ч → Ch   ш → sh   Ш → Sh
щ → sch  Щ → Sch  ъ → ""   Ъ → ""
ы → y    Ы → Y    ь → ""   Ь → ""
э → e    Э → E    ю → yu   Ю → Yu
я → ya   Я → Ya
```

### Литовский язык
```
ą → a    Ą → A    (огонек под a)
ę → e    Ę → E    (огонек под e)
ė → e    Ė → E    (точка над e)
į → i    Į → I    (огонек под i)
ų → u    Ų → U    (огонек под u)
```

### Польский язык
```
ą → a    Ą → A    (огонек под a)
ć → c    Ć → C    (акут над c)
ę → e    Ę → E    (огонек под e)
ł → l    Ł → L    (штрих через l)
ń → n    Ń → N    (акут над n)
ó → o    Ó → O    (акут над o)
ś → s    Ś → S    (акут над s)
ź → z    Ź → Z    (акут над z)
ż → z    Ż → Z    (точка над z)
```

### Специальные символы
```
€ → EUR   £ → GBP   ¥ → JPY   ₽ → RUB
" → "     " → "     ' → '     ' → '
– → -     — → -     … → ...   № → No.
≤ → <=    ≥ → >=    ≠ → !=    ± → +/-
α → alpha β → beta  γ → gamma  π → pi
```

## 🚀 Использование

### Базовое использование
```typescript
import { EnhancedUnicodeFontService } from './services/EnhancedUnicodeFontService';
import { CsvToPdfGenerator } from './services/converters/CsvToPdfGenerator';

// Анализ текста
const analysis = EnhancedUnicodeFontService.analyzeText('Latvian text with ā, č, ē');
console.log(analysis.recommendedFont); // 'times'
console.log(analysis.needsTransliteration); // true

// Очистка текста
const cleanText = EnhancedUnicodeFontService.smartCleanText('Šis ir tests');
console.log(cleanText); // 'Sis ir tests'

// Конвертация CSV в PDF (автоматически использует новую систему)
const pdfBytes = await CsvToPdfGenerator.convertToPDF(parseResult, {
  fontFamily: 'auto' // Автоматический выбор шрифта
});
```

### Расширенные настройки
```typescript
// Настройка PDF с явным контролем шрифтов
const fontSetup = EnhancedUnicodeFontService.setupPDFFont(pdf, sampleTexts);

if (fontSetup.success) {
  console.log(`Selected font: ${fontSetup.selectedFont}`);
  console.log(`Transliterations: ${fontSetup.appliedTransliterations}`);
  console.log(`Warnings: ${fontSetup.warnings.join(', ')}`);
}

// Тестирование шрифта с образцом
const testResult = EnhancedUnicodeFontService.testFontWithSample(
  'times', 
  'Latvian text with ā, č, ē'
);

console.log(testResult.isSupported); // true/false
console.log(testResult.issues); // ['Font issues...']
console.log(testResult.cleanedText); // 'Cleaned text'
```

## 🔧 Настройка опций

### Опции конвертации
```typescript
const options: CsvToPdfOptions = {
  fontFamily: 'auto',        // 'auto' | 'times' | 'helvetica' | 'courier'
  fontSize: 7,               // Размер шрифта
  orientation: 'landscape',   // Ориентация страницы
  pageSize: 'legal',         // Размер страницы
  autoDetectDataTypes: true, // Автоопределение типов данных
};
```

### Опции для больших данных
```typescript
const largeDataOptions: LargeDataOptions = {
  ...options,
  maxRowsPerPdf: 10000,      // Максимум строк на PDF
  createMultiplePdfs: true,   // Создавать несколько PDF
  memoryOptimization: true,   // Оптимизация памяти
  compressionLevel: 'medium', // Уровень сжатия
};
```

## 📊 Метрики и качество шрифтов

### Качество шрифтов
- **Excellent**: Полная поддержка Unicode, отличное качество
- **Good**: Хорошая поддержка большинства символов
- **Basic**: Базовая поддержка с транслитерацией
- **Poor**: Минимальная поддержка, требует много замен

### Поддерживаемые шрифты
```typescript
const fontMetrics = {
  'helvetica': { quality: 'poor', unicodeSupport: false },
  'times': { quality: 'good', unicodeSupport: true },
  'courier': { quality: 'basic', unicodeSupport: true }
};
```

## 🧪 Тестирование

### Компонент тестирования
```typescript
import FontTestComponent from './components/FontTestComponent';

// Добавьте в ваше приложение для тестирования
<FontTestComponent />
```

### Примеры тестовых данных
```typescript
const testSamples = {
  latvian: 'Šis ir latviešu teksts ar ā, č, ē, ģ, ī, ķ, ļ, ņ, š, ū, ž',
  russian: 'Это русский текст: Привет, мир!',
  mixed: 'Mixed: Latvian ā, Russian Привет, Polish ą, German ä',
  special: 'Special: €, £, ¥, №, ±, "quotes", –dash—'
};
```

## 🔍 Отладка

### Логирование
```typescript
// Включите подробное логирование
console.log('🔍 Text analysis:', analysis);
console.log('✅ Font setup:', fontSetup);
console.log('🧹 Text cleaning:', { original, cleaned });
```

### Проверка проблем
```typescript
// Анализ проблемных символов
const problemChars = analysis.problemChars;
if (problemChars.length > 0) {
  console.warn(`⚠️ Found ${problemChars.length} problem characters:`, problemChars);
}

// Проверка совместимости шрифта
const testResult = EnhancedUnicodeFontService.testFontWithSample(fontName, text);
if (!testResult.isSupported) {
  console.error('❌ Font not supported:', testResult.issues);
}
```

## 📈 Производительность

### Оптимизации
- Кэширование загруженных шрифтов
- Ленивая инициализация сервиса
- Оптимизированная обработка больших данных
- Chunked processing для предотвращения блокировки UI

### Рекомендации
1. Используйте `fontFamily: 'auto'` для автоматического выбора
2. Для больших данных используйте оптимизированный генератор
3. Тестируйте с реальными данными перед продакшеном
4. Мониторьте использование памяти при обработке больших файлов

## 🆘 Troubleshooting

### Частые проблемы

**Символы отображаются как "?"**
- Проверьте что текст правильно кодирован в UTF-8
- Убедитесь что используется подходящий шрифт (times лучше helvetica)
- Проверьте логи транслитерации

**PDF слишком большой**
- Используйте `compressionLevel: 'high'`
- Уменьшите `fontSize`
- Включите `memoryOptimization: true`

**Медленная обработка**
- Используйте `CsvToPdfGeneratorOptimized` для больших данных
- Включите `createMultiplePdfs: true` для разделения на части
- Проверьте `maxRowsPerPdf` настройку

## 📝 Changelog

### v5.0 - Enhanced Unicode Support
- ✨ Добавлен EnhancedUnicodeFontService
- 🎨 Автоматическое определение языка
- 🔄 Интеллектуальная транслитерация
- 📊 Улучшенная аналитика текста
- 🧪 Компонент тестирования FontTestComponent
- 🚀 Оптимизированная обработка больших данных

### v4.0 - Previous Version
- 📝 Базовая поддержка Unicode
- 🔧 Простая транслитерация
- 💾 Базовое управление шрифтами

## 🤝 Вклад в разработку

При добавлении поддержки новых языков:

1. Добавьте символы в `UNICODE_REPLACEMENTS`
2. Обновите `detectLanguage()` метод
3. Добавьте тестовые случаи
4. Обновите документацию

## 📄 Лицензия

MIT License - см. файл LICENSE в корне проекта.
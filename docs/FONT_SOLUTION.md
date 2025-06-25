# 🔤 Решение проблемы со шрифтами в CSV to PDF

## 📋 Описание проблемы
При конвертации CSV файлов в PDF возникала проблема с отображением кириллических символов и специальных Unicode символов. Встроенные шрифты jsPDF (helvetica, times, courier) имеют ограниченную поддержку Unicode.

## ✅ Решения

### 1. FontService (Рекомендуемое решение)
Загружает шрифты с полной Unicode поддержкой из CDN.

**Файл**: `src/services/FontService.ts`

**Преимущества**:
- ✅ Автоматическая загрузка шрифтов из CDN
- ✅ Полная поддержка Unicode (кириллица, латиница, греческий)
- ✅ Не требует хранения больших файлов шрифтов в репозитории
- ✅ Кэширование загруженных шрифтов

**Поддерживаемые шрифты**:
- NotoSans - универсальный шрифт от Google
- OpenSans - популярный шрифт с хорошей читаемостью

### 2. FontManagerEnhanced (Альтернативное решение)
Использует встроенные base64 шрифты.

**Файл**: `src/services/FontManagerEnhanced.ts`

**Требования**:
- Нужно добавить base64 версии шрифтов в файлы:
  - `src/assets/fonts/RobotoRegular.ts`
  - `src/assets/fonts/RobotoBold.ts`
  - `src/assets/fonts/DejaVuSans.ts`

### 3. FontManager (Временное решение)
Заменяет проблемные Unicode символы на ASCII эквиваленты.

**Файл**: `src/services/FontManager.ts`

**Ограничения**:
- ⚠️ Заменяет символы, а не отображает их корректно
- ⚠️ Не идеально для многоязычных документов

## 🚀 Как использовать

### Автоматический выбор шрифта
```typescript
// В CsvToPdfOptions
{
  fontFamily: 'auto' // Автоматически выберет подходящий шрифт
}
```

### Указать конкретный шрифт
```typescript
// В CsvToPdfOptions
{
  fontFamily: 'NotoSans' // Или 'OpenSans'
}
```

## 🔧 Как добавить новые шрифты

### Для FontService (CDN)
1. Найдите TTF версию шрифта
2. Добавьте конфигурацию в `FONT_CONFIGS` в `FontService.ts`:
```typescript
'YourFont': {
  name: 'YourFont',
  url: 'https://url-to-font.ttf',
  style: 'normal',
  weight: 400,
  format: 'truetype',
  unicodeRanges: ['latin', 'cyrillic']
}
```

### Для FontManagerEnhanced (Base64)
1. Скачайте TTF файл шрифта
2. Конвертируйте в base64:
```bash
base64 -i YourFont.ttf -o yourfont-base64.txt
```
3. Создайте файл в `src/assets/fonts/YourFont.ts`:
```typescript
export const YourFontBase64 = `[base64 content]`;
```
4. Добавьте в `EMBEDDED_FONTS` в `FontManagerEnhanced.ts`

## ⚡ Производительность

- **FontService**: Загружает шрифты по требованию из CDN (первая загрузка ~1-3 сек)
- **FontManagerEnhanced**: Встроенные шрифты, быстрая загрузка, но увеличивает размер бандла
- **FontManager**: Самый быстрый, но с ограниченной функциональностью

## 🐛 Известные проблемы

1. **CORS**: Некоторые CDN могут блокировать загрузку шрифтов. Используйте прокси или альтернативные источники.
2. **Размер файла**: Unicode шрифты могут быть большими (1-5MB). Рассмотрите subset версии.
3. **Совместимость**: Не все шрифты корректно работают с jsPDF. Тестируйте перед использованием.

## 📝 Изменения в коде

### CsvToPdfGenerator.ts
- Обновлен для использования FontService
- Убрана очистка текста при использовании Unicode шрифтов
- Добавлена проверка поддержки языков

### CsvToPdfConverter.ts
- Добавлена опция `fontFamily` в `CsvToPdfOptions`
- Поддержка значений: 'auto', 'NotoSans', 'OpenSans', и др.

## 🧪 Тестирование

1. Загрузите CSV файл с кириллицей или специальными символами
2. Выберите "CSV to PDF" конвертер
3. Проверьте корректность отображения в сгенерированном PDF

## 📚 Дополнительные ресурсы

- [Google Fonts](https://fonts.google.com/) - источник шрифтов
- [jsPDF Documentation](https://github.com/parallax/jsPDF) - документация библиотеки
- [Unicode Range Calculator](https://unicode-table.com/) - проверка Unicode диапазонов

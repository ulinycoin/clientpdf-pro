# 🌍 Unicode Font Support - ClientPDF Pro

ClientPDF Pro теперь поддерживает автоматическое определение и загрузку Unicode шрифтов для корректного отображения текста на любых языках, включая:

- **🇷🇺 Русский (кириллица)** - русский, болгарский, сербский, македонский
- **🇱🇻 Латышский** - ā, č, ē, ģ, ī, ķ, ļ, ņ, š, ū, ž 
- **🇱🇹 Литовский** - ą, č, ę, ė, į, š, ų, ū, ž
- **🇵🇱 Польский** - ą, ć, ę, ł, ń, ó, ś, ź, ż
- **🇬🇷 Греческий** - α, β, γ, δ, ε, ζ, η, θ
- **🇻🇳 Вьетнамский** - ă, â, đ, ê, ô, ơ, ư
- **🇨🇳 Другие языки** - и многие другие Unicode символы

## ✨ Ключевые особенности

### 🎯 Автоматическое определение языка
Система автоматически анализирует ваш текст и выбирает оптимальный шрифт:

```javascript
// Примеры автоматического определения
"Привет мир" → Кириллица → DejaVu Sans
"Labdien, pasaule!" → Латышский → Noto Sans  
"Γεια σας κόσμε" → Греческий → Noto Sans
"Chào thế giới" → Вьетнамский → Noto Sans
```

### 🔤 Поддерживаемые шрифты

| Шрифт | Языки | Описание |
|-------|-------|----------|
| **DejaVu Sans** | Latin, Cyrillic, Latin-Ext | Универсальный шрифт с отличной поддержкой кириллицы |
| **Google Roboto** | Latin, Cyrillic, Latin-Ext | Современный шрифт от Google |
| **Google Noto Sans** | Все языки мира | Максимальная поддержка Unicode символов |
| **Times Roman** | Latin, частично Cyrillic | Резервный шрифт |
| **Helvetica** | Только Latin | Fallback для базовых случаев |

### 📊 CSV to PDF с Unicode

Когда вы загружаете CSV файл с текстом на разных языках, система:

1. **Анализирует содержимое** - сканирует заголовки и первые 10 строк данных
2. **Определяет языки** - находит кириллицу, латышские символы, и т.д.
3. **Выбирает оптимальный шрифт** - автоматически загружает лучший шрифт
4. **Применяет ко всему документу** - заголовки, данные, номера страниц

#### Пример работы с латышскими данными:
```csv
Nosaukums,Adrese,Raksturojums
"SIA Baltā zivs","Rīga, Brīvības iela 123","Zivju pārstrādes uzņēmums"
"AS Zaļais koks","Daugavpils, Vienības prospekts 45","Mežizstrādes kompānija"
```

Система автоматически:
- ✅ Определит латышские символы (ā, ī, ē, ū, ņ, ļ, ģ, ķ, č, š, ž)
- ✅ Выберет Noto Sans для максимальной совместимости
- ✅ Корректно отобразит все символы в PDF

### 🖼️ Images to PDF с Unicode подписями

При создании PDF из изображений, вы можете добавлять подписи на любых языках:

```javascript
// Примеры подписей
"Fotografējums Rīgas centrā" // Латышский
"Фотография центра Риги"     // Русский  
"Φωτογραφία από τη Ρίγα"     // Греческий
```

## 🛠️ Для разработчиков

### Автоматический режим (рекомендуется)
```typescript
import { CsvToPdfConverter } from './services/converters/CsvToPdfConverter';

// Просто используйте как обычно - шрифты настроятся автоматически
const options = {
  fontFamily: 'auto', // По умолчанию
  title: 'Данные компании "Балтийская рыба"'
};

const pdfData = await CsvToPdfConverter.convertToPDF(parseResult, options);
```

### Ручной выбор шрифта
```typescript
const options = {
  fontFamily: 'NotoSans', // Принудительно использовать Noto Sans
  fontSize: 8,
  title: 'Отчет за 2024 год'
};
```

### Использование UniversalPdfService
```typescript
import { UniversalPdfService } from './services/UniversalPdfService';

const pdfService = new UniversalPdfService();

// Создание документа с автоматической настройкой шрифтов
const pdf = await pdfService.createDocument(
  { orientation: 'landscape', format: 'a4' },
  { title: 'Многоязычный документ' },
  ['Привет мир', 'Labdien!', 'Hello world'] // Образцы для анализа
);

// Добавление текста с автоматическим выбором шрифта
await pdfService.addTitle(pdf, 'Заголовок на русском', 100, 50);
await pdfService.addText(pdf, 'Teksts latviešu valodā', 50, 80);
```

## 🎨 Настройки шрифтов

### В CSV to PDF конвертере:
- `fontFamily: 'auto'` - Автоматический выбор (по умолчанию)
- `fontFamily: 'DejaVuSans'` - Принудительно DejaVu Sans
- `fontFamily: 'Roboto'` - Принудительно Google Roboto  
- `fontFamily: 'NotoSans'` - Принудительно Google Noto Sans

### Fallback система:
1. **Попытка загрузить оптимальный Unicode шрифт**
2. **При ошибке → Times Roman** (лучше чем Helvetica для Unicode)
3. **В крайнем случае → Helvetica** (только базовая латиница)

## 🔍 Диагностика и отладка

В консоли браузера вы увидите информацию о работе шрифтов:

```
🔍 Detected languages: cyrillic, latin
🎯 Selected font: DejaVuSans
✅ Font loaded: DejaVuSans (normal)
✅ Font loaded: DejaVuSans (bold)
🌍 Unicode ranges detected: Cyrillic, Latin Extended-A
```

При проблемах:
```
⚠️ Failed to load specified font NotoSans, falling back to auto
❌ Font setup failed, using fallback: DejaVuSans network error
✅ Using fallback font: times
```

## 📝 Поддерживаемые форматы

### CSV файлы:
- ✅ UTF-8 encoding (по умолчанию)
- ✅ Любые разделители (запятая, точка с запятой, табуляция)
- ✅ Кириллические заголовки столбцов
- ✅ Смешанные языки в данных
- ✅ Специальные символы (ā, č, ē, ģ, ī, ķ, ļ, ņ, š, ū, ž)

### Изображения:
- ✅ Подписи на любых языках
- ✅ Unicode символы в именах файлов
- ✅ Метаданные с многоязычным контентом

## 🌟 Примеры использования

### Латышские бизнес-данные:
```csv
Uzņēmums,Darbinieki,Apgrozījums,Komentārs
"SIA Krāsainā pasaule",25,"€125,000","Mājas dekorāciju veikals"
"AS Skaistā dārzs",18,"€89,500","Dārzniecības produkti un pakalpojumi"
```

### Русские отчеты:
```csv
Компания,Сотрудники,Оборот,Примечания
"ООО Северная звезда",45,"₽2,500,000","Производство морепродуктов"
"ЗАО Золотая рыбка",32,"₽1,800,000","Рыболовецкая компания"
```

### Многоязычные данные:
```csv
Company,Nazwa,Компания,Uzņēmums,Revenue
"Baltic Fish Ltd","Bałtycka Ryba","Балтийская рыба","Baltijas zivis","€500K"
```

## 🚀 Результат

Ваши PDF документы теперь будут:
- ✅ **Корректно отображать** все Unicode символы
- ✅ **Автоматически выбирать** лучший шрифт
- ✅ **Поддерживать любые языки** без дополнительной настройки
- ✅ **Работать надежно** с fallback системой
- ✅ **Сохранять читаемость** на всех устройствах

---

*ClientPDF Pro - теперь с полной поддержкой Unicode! 🌍*
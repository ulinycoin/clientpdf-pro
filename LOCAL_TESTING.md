# 🚀 Локальное тестирование Enhanced CSV to PDF Editor

## Быстрый старт

### 1. Клонирование и установка
```bash
git clone https://github.com/ulinycoin/clientpdf-pro.git
cd clientpdf-pro
npm install --legacy-peer-deps
```

### 2. Запуск в dev режиме
```bash
npm run dev
```

### 3. Доступные маршруты для тестирования

#### 🆕 Новые интерактивные страницы:
- **`http://localhost:5173/enhanced-csv-to-pdf`** - Основная enhanced страница
- **`http://localhost:5173/test-enhanced`** - Тестовый маршрут (только в dev)

#### 📊 Существующие страницы:
- **`http://localhost:5173/csv-to-pdf`** - Оригинальная CSV to PDF страница
- **`http://localhost:5173/`** - Главная страница

## 🧪 Что тестировать

### 1. Переключение режимов
- [ ] Переключатель Classic ↔ Interactive работает
- [ ] UI меняется при переключении режимов
- [ ] Badge показывает текущий режим

### 2. Загрузка CSV файлов
- [ ] Drag & drop работает
- [ ] Автодетекция языка срабатывает
- [ ] Показываются рекомендации шрифтов
- [ ] Статистика файла отображается корректно

### 3. Интерактивный режим
- [ ] Переход в интерактивный редактор происходит
- [ ] Табовая навигация: Edit Data / Style PDF / Preview
- [ ] Языковая панель показывает детекцию
- [ ] Панель быстрых настроек стиля функциональна

### 4. Responsive дизайн
- [ ] Мобильная версия корректна
- [ ] Планшетная версия адаптирована
- [ ] Десктопная версия полнофункциональна

## 📁 Тестовые CSV файлы

Создайте тестовые файлы с разным контентом:

### test-russian.csv
```csv
Название,Описание,Цена
Товар 1,Описание товара на русском языке,1000₽
Товар 2,Ещё одно описание с русскими символами,2000₽
```

### test-latvian.csv
```csv
Nosaukums,Apraksts,Cena
Prece 1,Apraksts latviešu valodā ar diakritiķiem: āčēģīķļņšūž,€50
Prece 2,Vēl viens apraksts ar speciālajiem simboliem,€100
```

### test-mixed.csv
```csv
Name,Description,Price,Примечание
Product A,English description,€25.99,Русская заметка
Produkts B,Latviešu apraksts ar ā,€35.50,Mixed content
項目 C,中文描述,¥200,Multi-language
```

### test-large.csv
```csv
ID,Name,Email,City,Country,Date
1,John Smith,john@example.com,New York,USA,2024-01-15
2,Анна Иванова,anna@example.ru,Москва,Россия,2024-01-16
3,Jānis Bērziņš,janis@example.lv,Rīga,Latvija,2024-01-17
...
```

## 🐛 Отладка возможных ошибок

### TypeError: Cannot read properties of undefined
```bash
# Если ошибки импортов - перезапустите dev сервер
npm run dev
```

### Font/Service не найден
```bash
# Убедитесь что все файлы сохранены
ls -la src/services/fontManager/
ls -la src/types/
ls -la src/components/enhanced/
```

### TypeScript ошибки
```bash
# Проверьте типы
npm run type-check
# или
npx tsc --noEmit
```

## 🔍 Debug информация

### Console логи для отладки:
В браузере откройте DevTools (F12) и проверьте:

#### При загрузке файла:
```
🌍 Language detection result: {
  detectedLanguage: "ru", 
  confidence: 85.5,
  script: "cyrillic"
}
```

#### При выборе шрифта:
```
✅ Font set successfully: PT Sans
🎯 Language detection completed: {
  language: "ru",
  recommendedFont: "PT Sans"
}
```

#### При переключении режимов:
```
🎨 Mode switched to: interactive
📊 Editor state updated
```

## ⚠️ Известные ограничения в текущей версии

### Пока не реализовано:
- [ ] **PDF Live Preview** - показывает заглушку
- [ ] **Интерактивная таблица** - показывает placeholder
- [ ] **Template Gallery** - показывает placeholder
- [ ] **Реальная генерация PDF** в интерактивном режиме

### Работает:
- ✅ **Переключение режимов**
- ✅ **Автодетекция языков** 
- ✅ **Рекомендации шрифтов**
- ✅ **Responsive дизайн**
- ✅ **Интеграция с существующими сервисами**
- ✅ **Classic режим** (полная функциональность)

## 🎯 Фокус тестирования

### Приоритет 1: Основная функциональность
1. Загрузка CSV файлов с разными языками
2. Переключение между режимами
3. Отображение языковой информации
4. Responsive поведение

### Приоритет 2: UX/UI
1. Плавность анимаций
2. Читаемость интерфейса
3. Интуитивность навигации
4. Корректность badge и статусов

### Приоритет 3: Техническая стабильность
1. Отсутствие ошибок в консоли
2. Корректная типизация
3. Производительность на больших файлах
4. Memory leaks отсутствуют

## 📞 Feedback и баг-репорты

При нахождении проблем отмечайте:
- [ ] **URL** где произошла ошибка
- [ ] **Шаги** для воспроизведения
- [ ] **Ожидаемое поведение**
- [ ] **Фактическое поведение**
- [ ] **Браузер и версия**
- [ ] **Скриншот** (если UI проблема)
- [ ] **Console логи** (если JS ошибка)

---

## 🚀 Ready to test!

Запустите `npm run dev` и переходите на `http://localhost:5173/enhanced-csv-to-pdf` для тестирования!

# 🎯 Быстрый старт для тестирования

## ⚡ 3 команды для запуска

```bash
# 1. Клонировать репозиторий
git clone https://github.com/ulinycoin/clientpdf-pro.git
cd clientpdf-pro

# 2. Установить зависимости  
npm install --legacy-peer-deps

# 3. Запустить dev сервер
npm run dev
```

## 🌐 Тестовые URL

### 🆕 **Новый интерактивный редактор:**
- **`http://localhost:5173/enhanced-csv-to-pdf`** ← Основная страница
- **`http://localhost:5173/test-enhanced`** ← Тестовый маршрут

### 📊 **Сравнение с оригиналом:**
- **`http://localhost:5173/csv-to-pdf`** ← Оригинальная страница

---

## ✅ Что уже работает:

### 🔄 Переключение режимов
- [x] Toggle Classic ↔ Interactive  
- [x] Динамические UI изменения
- [x] Badge статусы

### 🌍 Мультиязычность  
- [x] Автодетекция 15+ языков
- [x] Умные рекомендации шрифтов
- [x] Unicode символы поддержка

### 📱 Responsive дизайн
- [x] Мобильная адаптация
- [x] Планшетный интерфейс  
- [x] Десктопный split-view

### 🎨 Интерактивный редактор
- [x] Табовая навигация
- [x] Языковая информационная панель
- [x] Панель быстрых настроек стиля
- [x] Статистика данных

---

## 🧪 Тестовые сценарии:

### 1. Базовая функциональность
```
1. Перейти на /enhanced-csv-to-pdf
2. Переключить режим Classic → Interactive
3. Загрузить CSV файл (любой)
4. Проверить автодетекцию языка
5. Посмотреть рекомендации шрифтов
```

### 2. Интерактивный режим
```
1. Загрузить CSV → попадаешь в Interactive Editor
2. Переключиться между вкладками: Edit / Style / Preview
3. Поменять настройки в Style панели
4. Проверить responsive на разных размерах экрана
```

### 3. Мультиязычный контент
```
Создать test.csv:
Название,Price,Description
Товар,€50,"Описание с русскими символами"
Prece,€100,"Latviešu apraksts ar ā,č,ē"

→ Должна сработать детекция языка
→ Показаться рекомендации шрифтов
```

---

## ⚠️ Известные placeholders:

- **PDF Live Preview** - показывает заглушку "will be rendered here"
- **Interactive Data Table** - показывает "will be implemented here"  
- **Advanced Styling** - показывает "will be implemented here"
- **Export PDF** - пока только console.log

Это **нормально** для первого этапа! Архитектура готова для дальнейшего развития.

---

## 🐛 Если что-то не работает:

### TypeScript ошибки:
```bash
# Перезапустить dev сервер
npm run dev
```

### Ошибки импортов:
```bash  
# Проверить что все файлы сохранены
ls -la src/types/enhanced-csv-pdf.types.ts
ls -la src/services/fontManager/MultiLanguageFontService.ts
ls -la src/components/enhanced/LivePreviewEditor.tsx
```

### Пустая страница:
```bash
# Открыть DevTools (F12) и проверить Console на ошибки
# Попробовать альтернативный маршрут /test-enhanced
```

---

## 📞 Готов к демо!

**Главная фишка:** Переключение между Classic (знакомый интерфейс) и Interactive (новый живой редактор) режимами.

**URL для демо:** `http://localhost:5173/enhanced-csv-to-pdf`

🚀 **Запускай и тестируй!**

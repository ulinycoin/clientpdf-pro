# 🛠️ Troubleshooting Guide

## 🚨 Распространенные проблемы и решения

### ❌ **Проблема: Service Worker и Tailwind CDN**
```
sw.js:386 Fetch error: TypeError: Failed to fetch
cdn.tailwindcss.com should not be used in production
```

**✅ Решение:**
```bash
# 1. Убедитесь что используется последняя версия без CDN
git pull origin main

# 2. Очистите кэш браузера
# Chrome: F12 → Application → Storage → Clear site data
# Firefox: F12 → Storage → Clear All

# 3. Перезапустите dev сервер
npm run dev
```

**🔧 Что исправлено:**
- Удален Tailwind CDN из index.html
- Используется локальная PostCSS сборка
- Исправлены проблемы с Service Worker

---

### ❌ **Проблема: 500 Internal Server Error**
```
Failed to load resource: the server responded with a status of 500
```

**✅ Решение:**
```bash
# 1. Проверьте TypeScript ошибки
npm run type-check

# 2. Очистите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 3. Перезапустите сервер
npm run dev
```

**🔧 Что исправлено:**
- Использован lazy loading для компонентов
- Исправлены circular dependency проблемы
- Добавлен Suspense для загрузки

---

### ❌ **Проблема: Import/Export ошибки**
```
Cannot resolve module '../components/enhanced/LivePreviewEditor'
```

**✅ Решение:**
```bash
# Проверьте что все файлы созданы:
ls -la src/types/enhanced-csv-pdf.types.ts
ls -la src/services/fontManager/MultiLanguageFontService.ts  
ls -la src/components/enhanced/LivePreviewEditor.tsx
ls -la src/pages/EnhancedCSVToPDFPage.tsx

# Если файлы есть, перезапустите TypeScript сервер в VSCode:
# Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

---

### ❌ **Проблема: Компоненты не отображаются**
```
Blank page или компоненты не загружаются
```

**✅ Диагностика:**
```bash
# 1. Откройте DevTools (F12) и проверьте Console
# 2. Проверьте Network tab на 404 ошибки
# 3. Попробуйте альтернативные URL:

http://localhost:5173/test-enhanced     # Тестовый маршрут
http://localhost:5173/csv-to-pdf        # Оригинальная страница
http://localhost:5173/                  # Главная страница
```

---

### ❌ **Проблема: Port уже используется**
```
Port 5173 is already in use
```

**✅ Решение:**
```bash
# Вариант 1: Использовать другой порт
npm run dev -- --port 3000

# Вариант 2: Убить процесс на порту 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5173 | xargs kill -9
```

---

### ❌ **Проблема: Node.js версия**
```
Error: Node.js version not compatible
```

**✅ Решение:**
```bash
# Проверьте версию Node.js
node --version

# Требуется: Node.js >= 18.0.0
# Если версия старая, обновите:
# https://nodejs.org/en/download/

# Или используйте nvm:
nvm install 18
nvm use 18
```

---

### ❌ **Проблема: Dependencies conflict**
```
peer dep warnings или conflicting versions
```

**✅ Решение:**
```bash
# ВСЕГДА используйте --legacy-peer-deps для этого проекта
npm install --legacy-peer-deps

# Не используйте обычный npm install
# Это может сломать совместимость пакетов
```

---

### ❌ **Проблема: Hot reload не работает**
```
Изменения не отражаются в браузере
```

**✅ Решение:**
```bash
# 1. Проверьте что файлы сохраняются
# 2. Очистите браузерный кэш (Ctrl+F5)
# 3. Перезапустите dev сервер:
npm run dev

# 4. Проверьте что используется правильный порт
# http://localhost:5173 (не 3000 или другой)
```

---

## 🧪 Пошаговая диагностика

### 1. **Базовая проверка окружения**
```bash
# Проверьте версии
node --version        # >= 18.0.0
npm --version         # >= 8.0.0
git --version         # любая современная

# Проверьте что в правильной папке
pwd                   # должно показать /path/to/clientpdf-pro
ls                    # должны видеть package.json, src/, etc.
```

### 2. **Проверка файловой структуры**
```bash
# Убедитесь что все ключевые файлы есть:
ls -la src/types/enhanced-csv-pdf.types.ts
ls -la src/services/fontManager/MultiLanguageFontService.ts
ls -la src/components/enhanced/LivePreviewEditor.tsx
ls -la src/pages/EnhancedCSVToPDFPage.tsx
ls -la src/App.tsx

# Если какой-то файл отсутствует - скачайте последние изменения:
git pull origin main
```

### 3. **Проверка зависимостей**
```bash
# Переустановка с нуля если проблемы:
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# Проверка что основные пакеты установлены:
npm list react react-dom typescript vite tailwindcss
```

### 4. **Запуск и тестирование**
```bash
# Запуск в режиме разработки
npm run dev

# Должны увидеть:
# > vite --host localhost
# ➜  Local:   http://localhost:5173/
# ➜  ready in XXXms

# Тестовые URL:
# http://localhost:5173/enhanced-csv-to-pdf  ← Основной
# http://localhost:5173/test-enhanced        ← Тестовый  
# http://localhost:5173/csv-to-pdf           ← Оригинальный
```

---

## 🔍 Debug логи

### В браузерной консоли должны быть:
```javascript
// При загрузке файла:
🌍 Language detection result: { detectedLanguage: "ru", confidence: 85.5 }

// При переключении режимов:
🎨 Mode switched to: interactive

// При выборе шрифта:
✅ Font set successfully: PT Sans
```

### Если логов нет:
- Откройте DevTools (F12)
- Перейдите на вкладку Console
- Перезагрузите страницу
- Попробуйте загрузить CSV файл

---

## 📞 Если ничего не помогает

### Крайние меры:
```bash
# 1. Полная переустановка
rm -rf clientpdf-pro
git clone https://github.com/ulinycoin/clientpdf-pro.git
cd clientpdf-pro
npm install --legacy-peer-deps
npm run dev

# 2. Использование другого порта
npm run dev -- --port 3000
# Затем: http://localhost:3000/enhanced-csv-to-pdf

# 3. Проверка в другом браузере
# Попробуйте Chrome, Firefox, Safari
```

### Сбор информации для отладки:
```bash
# Системная информация:
node --version
npm --version
npx --version

# Проект информация:
npm list --depth=0
npm run type-check

# Логи ошибок:
# 1. Скриншот консоли браузера (F12)
# 2. Вывод команды npm run dev
# 3. Результат npm run type-check
```

---

## ✅ Ожидаемое поведение

### Когда всё работает правильно:

1. **Страница загружается** без ошибок в консоли
2. **Переключатель режимов** работает плавно
3. **Загрузка CSV** показывает автодетекцию языка
4. **Табы Edit/Style/Preview** переключаются
5. **Responsive дизайн** адаптируется к размеру экрана

### Placeholders (это нормально!):
- PDF Preview показывает заглушку
- Data Table показывает "will be implemented"
- Export PDF только логирует в консоль

---

**🎯 Главное: переключение режимов и автодетекция языка должны работать!**

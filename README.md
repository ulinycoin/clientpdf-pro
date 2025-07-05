# LocalPDF - Бесплатные PDF Инструменты | Free PDF Tools

[English](#english) | [Русский](#русский)

---

## Русский

### 📄 О LocalPDF

LocalPDF - это мощный набор бесплатных PDF инструментов, работающих полностью в вашем браузере. Никаких загрузок на сервер, никакой регистрации, никаких ограничений.

### ✨ Особенности

- **🔒 100% Приватно**: Все обрабатывается локально в вашем браузере
- **⚡ Супер быстро**: Обработка за секунды
- **🆓 Совершенно бесплатно**: Никаких платных планов или скрытых комиссий
- **🌐 Мультиязычность**: Полная поддержка русского и английского языков

### 🛠️ Доступные инструменты

1. **🔗 Объединить PDF** - Объединяйте несколько PDF в один
2. **✂️ Разделить PDF** - Разделяйте PDF на отдельные страницы
3. **🗜️ Сжать PDF** - Уменьшайте размер файлов
4. **✏️ Добавить текст** - Добавляйте текст в PDF
5. **🏷️ Водяной знак** - Добавляйте водяные знаки
6. **🔄 Повернуть PDF** - Поворачивайте страницы
7. **📄 Извлечь страницы** - Извлекайте определенные страницы
8. **📝 Извлечь текст** - Извлекайте текст из PDF
9. **🖼️ PDF в изображение** - Конвертируйте PDF в PNG/JPG

### 💻 Технологии

- **Frontend**: React 18 + TypeScript + Vite
- **Стили**: Tailwind CSS + Framer Motion
- **PDF обработка**: pdf-lib + jsPDF + PDF.js
- **Локализация**: Полная поддержка русского языка
- **Архитектура**: Atomic Design System

### 🚀 Запуск разработки

```bash
# Клонирование репозитория
git clone https://github.com/ulinycoin/clientpdf-pro.git
cd clientpdf-pro

# Установка зависимостей
npm install --legacy-peer-deps

# Запуск dev сервера
npm run dev

# Откройте http://localhost:5173
```

### 🌍 Локализация

Проект полностью локализован на русском и английском языках:

- Автоматическое определение языка браузера
- Переключатель языка в шапке сайта
- Сохранение выбранного языка в localStorage
- Полная локализация всех интерфейсов и сообщений

---

## English

### 📄 About LocalPDF

LocalPDF is a powerful suite of free PDF tools that work entirely in your browser. No server uploads, no registration, no limitations.

### ✨ Features

- **🔒 100% Private**: Everything processed locally in your browser
- **⚡ Super Fast**: Processing in seconds
- **🆓 Completely Free**: No paid plans or hidden fees
- **🌐 Multilingual**: Full support for Russian and English languages

### 🛠️ Available Tools

1. **🔗 Merge PDF** - Combine multiple PDFs into one
2. **✂️ Split PDF** - Split PDF into separate pages
3. **🗜️ Compress PDF** - Reduce file sizes
4. **✏️ Add Text** - Add text to PDFs
5. **🏷️ Watermark** - Add watermarks
6. **🔄 Rotate PDF** - Rotate pages
7. **📄 Extract Pages** - Extract specific pages
8. **📝 Extract Text** - Extract text from PDFs
9. **🖼️ PDF to Image** - Convert PDF to PNG/JPG

### 💻 Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **PDF Processing**: pdf-lib + jsPDF + PDF.js
- **Localization**: Full Russian and English support
- **Architecture**: Atomic Design System

### 🚀 Development Setup

```bash
# Clone repository
git clone https://github.com/ulinycoin/clientpdf-pro.git
cd clientpdf-pro

# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Open http://localhost:5173
```

### 🌍 Localization

The project is fully localized in Russian and English:

- Automatic browser language detection
- Language switcher in header
- Language preference saved in localStorage
- Complete localization of all interfaces and messages

### 📝 Project Structure

```
src/
├── locales/           # Localization files
│   ├── en/             # English translations
│   │   ├── common.json
│   │   └── tools.json
│   └── ru/             # Russian translations
│       ├── common.json
│       └── tools.json
├── components/        # React components
│   ├── atoms/          # Basic components
│   ├── molecules/      # Composite components
│   ├── organisms/      # Complex components
│   └── context/        # React contexts
├── hooks/             # Custom hooks
├── utils/             # Utility functions
└── types/             # TypeScript definitions
```

### 🎆 Key Features of Localization System

- **Automatic Detection**: Detects browser language automatically
- **Smart Fallbacks**: Falls back to English if translation missing
- **Type Safety**: Full TypeScript support for translation keys
- **Lazy Loading**: Translations loaded only when needed
- **Context Support**: Different namespaces for different parts of app
- **Format Helpers**: Number, date, and file size formatting
- **Pluralization**: Proper plural forms for Russian language

### 🔧 Building for Production

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

### 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Check TypeScript types
- `npm run lint` - Run linting

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### 📄 License

This project is open source and available under the MIT License.

### 🔗 Links

- **Live Demo**: [https://localpdf.online](https://localpdf.online)
- **GitHub**: [https://github.com/ulinycoin/clientpdf-pro](https://github.com/ulinycoin/clientpdf-pro)

---

## 🎯 Recent Updates

### Version 0.1.0 - Multilingual Support

- ✅ **Full Russian Localization** - Complete translation of all interfaces
- ✅ **Language Switcher** - Easy language switching in header
- ✅ **Auto Detection** - Automatic browser language detection
- ✅ **Persistent Settings** - Language preference saved locally
- ✅ **Type Safety** - Full TypeScript support for translations
- ✅ **Performance** - Lazy loading of translation files
- ✅ **Fallbacks** - Smart fallback to English if translation missing

### Technical Implementation

- Custom React hooks for localization (`useLocalization`, `useLocalizedText`)
- Context-based state management for global language switching
- Namespace support for organizing translations
- Automatic caching and lazy loading of translation files
- Helper utilities for number, date, and file size formatting
- Russian pluralization support

---

*Made with ❤️ for the community*
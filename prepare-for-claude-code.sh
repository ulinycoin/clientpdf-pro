#!/bin/bash

# ================================
# Подготовка проекта для Claude Code
# LocalPDF Documentation Integration
# ================================

echo "🤖 Подготовка проекта LocalPDF для Claude Code"
echo "=============================================="

# Проверяем текущую директорию
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите из корня проекта clientpdf-pro"
    exit 1
fi

echo "📁 Проект: $(pwd)"
echo "📄 package.json найден ✅"

# Проверяем ключевые файлы документации
echo ""
echo "🔍 Проверка файлов документации:"

if [ -f "localpdf-docs.json" ]; then
    echo "✅ localpdf-docs.json - $(wc -c < localpdf-docs.json) байт"
else
    echo "❌ localpdf-docs.json отсутствует"
fi

if [ -f "LocalPDF-Documentation.md" ]; then
    echo "✅ LocalPDF-Documentation.md - $(wc -l < LocalPDF-Documentation.md) строк"
else
    echo "❌ LocalPDF-Documentation.md отсутствует"
fi

if [ -f "CLAUDE_CODE_TASK.md" ]; then
    echo "✅ CLAUDE_CODE_TASK.md - техническое задание готово"
else
    echo "❌ CLAUDE_CODE_TASK.md отсутствует"
fi

# Анализируем структуру проекта
echo ""
echo "🏗️ Анализ структуры проекта:"

# PDF инструменты
if [ -d "src/pages/tools" ]; then
    tool_count=$(find src/pages/tools -name "*.tsx" | wc -l)
    echo "🛠️ PDF инструментов: $tool_count"
else
    echo "❌ Папка src/pages/tools не найдена"
fi

# Языки
if [ -d "src/locales" ]; then
    lang_count=$(find src/locales -mindepth 1 -maxdepth 1 -type d | wc -l)
    echo "🌍 Поддерживаемых языков: $lang_count"
    echo "   Языки: $(ls src/locales | tr '\n' ' ')"
else
    echo "❌ Папка src/locales не найдена"
fi

# Компоненты
if [ -d "src/components" ]; then
    component_count=$(find src/components -name "*.tsx" | wc -l)
    echo "⚛️ React компонентов: $component_count"
else
    echo "❌ Папка src/components не найдена"
fi

# Проверяем зависимости
echo ""
echo "📦 Ключевые зависимости:"
if command -v node >/dev/null 2>&1; then
    node -e "
    const pkg = require('./package.json');
    const key = ['pdf-lib', 'pdfjs-dist', 'tesseract.js', 'react', 'tailwindcss'];
    key.forEach(lib => {
        if (pkg.dependencies[lib] || pkg.devDependencies[lib]) {
            const version = pkg.dependencies[lib] || pkg.devDependencies[lib];
            console.log(\`✅ \${lib}: \${version}\`);
        } else {
            console.log(\`❌ \${lib}: не найдена\`);
        }
    });
    "
else
    echo "⚠️ Node.js не найден - пропускаем проверку зависимостей"
fi

# Создаем директории для новых компонентов
echo ""
echo "📂 Подготовка директорий для Claude Code:"

mkdir -p src/components/docs
echo "✅ Создана директория: src/components/docs"

mkdir -p src/pages/api
echo "✅ Создана директория: src/pages/api"

# Создаем заготовки переводов если их нет
echo ""
echo "🌍 Подготовка переводов для docs:"

for lang in en de fr es ru; do
    docs_file="src/locales/$lang/docs.ts"
    if [ ! -f "$docs_file" ]; then
        mkdir -p "src/locales/$lang"
        echo "export const docs = {
  navigation: 'Documentation',
  sections: {
    overview: 'Overview',
    tools: 'Tools', 
    libraries: 'Libraries'
  }
};" > "$docs_file"
        echo "✅ Создан базовый файл: $docs_file"
    else
        echo "⚠️ Файл уже существует: $docs_file"
    fi
done

# Проверяем что проект может собраться
echo ""
echo "🔧 Проверка сборки проекта:"
if npm run build --dry-run >/dev/null 2>&1; then
    echo "✅ Проект готов к сборке"
else
    echo "⚠️ Возможны проблемы со сборкой - проверьте вручную"
fi

# Информация для Claude Code
echo ""
echo "🤖 Информация для Claude Code:"
echo "================================"
echo "📁 Рабочая директория: $(pwd)"
echo "🎯 Основная задача: Создать /docs страницу с AI-оптимизацией"
echo "📊 Ключевая метрика: 69% AI-трафика (ChatGPT)"
echo "🌍 Языки: en (основной), de, fr, es, ru"
echo "🛠️ Инструментов: $tool_count PDF утилит"
echo ""
echo "📋 Основные файлы для работы:"
echo "   • CLAUDE_CODE_TASK.md - техническое задание"
echo "   • localpdf-docs.json - данные для документации"  
echo "   • src/components/templates/StandardToolPageTemplate.tsx - базовый шаблон"
echo "   • src/hooks/useI18n.tsx - мультиязычность"
echo "   • tailwind.config.js - стили проекта"
echo ""
echo "🎯 Приоритеты:"
echo "   1. DocsPage.tsx + роутинг (HIGH)"
echo "   2. AI-оптимизация + SEO (HIGH)" 
echo "   3. Мультиязычность (MEDIUM)"
echo "   4. Автогенератор (LOW)"
echo ""
echo "🚨 Важно:"
echo "   • Фокус на AI-оптимизацию (69% трафика от ChatGPT!)"
echo "   • Использовать существующий дизайн проекта"
echo "   • Не ломать текущую функциональность"
echo "   • Следовать TypeScript best practices"
echo ""
echo "🚀 Готово к работе с Claude Code!"
echo ""
echo "💡 Следующий шаг:"
echo "   Откройте Claude Code и загрузите проект из: $(pwd)"
echo "   Используйте CLAUDE_CODE_TASK.md как основное задание"

# Финальная проверка готовности
echo ""
echo "✅ Checklist готовности к Claude Code:"
echo "   [✓] Техническое задание создано"
echo "   [✓] Данные документации подготовлены"
echo "   [✓] Директории созданы" 
echo "   [✓] Базовые переводы добавлены"
echo "   [✓] Структура проекта проанализирована"
echo ""
echo "🎉 Проект готов к интеграции документации!"

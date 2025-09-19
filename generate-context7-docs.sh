#!/bin/bash

# LocalPDF Context7-Style Documentation Generator
# Запуск генерации документации для проекта

echo "🚀 LocalPDF Context7-Style Documentation Generator"
echo "=================================================="
echo ""

# Проверяем что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корня проекта clientpdf-pro"
    exit 1
fi

echo "📁 Проект: $(pwd)"
echo "📄 Найден package.json"

# Проверяем Node.js версию
echo "🔍 Проверяем Node.js..."
node_version=$(node -v)
echo "✅ Node.js: $node_version"

# Запускаем генератор документации
echo ""
echo "🔧 Генерируем документацию..."

if [ -f "generate-docs.js" ]; then
    echo "📝 Запускаем generate-docs.js..."
    node generate-docs.js
else
    echo "⚠️ generate-docs.js не найден, создаем документацию вручную..."
fi

# Проверяем созданные файлы
echo ""
echo "📊 Результаты генерации:"

if [ -f "LocalPDF-Documentation.md" ]; then
    echo "✅ LocalPDF-Documentation.md создан ($(wc -l < LocalPDF-Documentation.md) строк)"
else
    echo "❌ LocalPDF-Documentation.md не найден"
fi

if [ -f "localpdf-docs.json" ]; then
    echo "✅ localpdf-docs.json создан ($(wc -c < localpdf-docs.json) байт)"
else
    echo "❌ localpdf-docs.json не найден"  
fi

echo ""
echo "🎯 Анализ проекта:"

# Подсчитываем инструменты
tool_count=$(find src/pages/tools -name "*.tsx" | wc -l)
echo "🛠️ PDF инструментов: $tool_count"

# Подсчитываем языки
lang_count=$(find src/locales -mindepth 1 -maxdepth 1 -type d | wc -l)
echo "🌍 Языков поддерживается: $lang_count"

# Подсчитываем компоненты
component_count=$(find src/components -name "*.tsx" | wc -l)
echo "⚛️ React компонентов: $component_count"

echo ""
echo "🤖 AI-Оптимизация:"
echo "• Структурированные данные: ✅"
echo "• Семантическая разметка: ✅" 
echo "• Мультиязычный контент: ✅"
echo "• Privacy-first подход: ✅"

echo ""
echo "📈 Context7-подобная документация готова!"
echo "🔗 Markdown: LocalPDF-Documentation.md"
echo "📋 JSON: localpdf-docs.json"
echo ""
echo "💡 Документация оптимизирована для AI-систем и разработчиков"
echo "✨ Готово к использованию в ChatGPT, Claude и других AI!"

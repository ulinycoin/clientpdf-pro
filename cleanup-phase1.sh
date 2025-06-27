#!/bin/bash

# 🗑️ ClientPDF Pro - Критическая очистка (Фаза 1)
# Удаление дублированных конфигов и тестовых файлов

echo "🚀 Начинаем критическую очистку ClientPDF Pro..."

# 1. Удаляем дублированные конфигурационные файлы
echo "📦 Удаляем дублированные конфиги..."
rm -f postcss.config.cjs
rm -f tailwind.config.cjs

# 2. Удаляем тестовые файлы
echo "🧪 Удаляем тестовые файлы..."
rm -f src/TestApp.tsx
rm -f hello.md
rm -f TESTING_GUIDE_PDF_PROTECTION.md

# 3. Удаляем простые скрипты-дублеры
echo "🔧 Удаляем устаревшие скрипты..."
rm -f add_headers_simple.sh
rm -f install-csv-deps.sh
rm -f update-deps.sh
rm -f build.sh

echo "✅ Фаза 1 завершена успешно!"
echo ""
echo "📊 Удалено файлов:"
echo "  - postcss.config.cjs (дубликат)"
echo "  - tailwind.config.cjs (устаревший)"
echo "  - src/TestApp.tsx (тестовый компонент)"
echo "  - hello.md (тестовый MCP файл)"
echo "  - TESTING_GUIDE_PDF_PROTECTION.md (пустой)"
echo "  - add_headers_simple.sh (дубликат)"
echo "  - install-csv-deps.sh (устаревший)"
echo "  - update-deps.sh (простой)"
echo "  - build.sh (минимальный)"
echo ""
echo "🎯 Рекомендация: запустите 'npm run build' для проверки"

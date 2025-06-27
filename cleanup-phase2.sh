#!/bin/bash

# 🗑️ ClientPDF Pro - Фаза 2: Debug страницы и компоненты
# Удаление debug/test страниц и неиспользуемых компонентов

echo "🚀 Начинаем Фазу 2: очистка debug страниц..."

# 1. Удаляем debug страницы
echo "🐛 Удаляем debug страницы..."
rm -f src/pages/StyleTestPage.tsx
rm -f src/pages/MIMEDebugPage.tsx
rm -f src/pages/EmergencyPage.tsx

# 2. Удаляем тестовые компоненты
echo "🧪 Удаляем тестовые компоненты..."
rm -f src/components/organisms/PDFTestComponent.tsx

# 3. Удаляем устаревшие тестовые компоненты
echo "🔧 Удаляем устаревшие компоненты..."
rm -f src/components/CyrillicTestComponent.tsx

echo "✅ Фаза 2 завершена!"
echo ""
echo "📊 Удалено в Фазе 2:"
echo "  - src/pages/StyleTestPage.tsx (debug стилей)"
echo "  - src/pages/MIMEDebugPage.tsx (debug MIME)"
echo "  - src/pages/EmergencyPage.tsx (экстренная страница)"
echo "  - src/components/organisms/PDFTestComponent.tsx (тестовый компонент)"
echo "  - src/components/CyrillicTestComponent.tsx (устаревший тест)"
echo ""
echo "⚠️  ВАЖНО: Теперь нужно обновить src/App.tsx"
echo "   Удалить routes для этих страниц!"
echo ""
echo "🎯 Следующий шаг: запустите cleanup-app-routes.sh"

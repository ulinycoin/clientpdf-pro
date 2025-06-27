#!/bin/bash

# 🗑️ ClientPDF Pro - Фаза 3: Устаревшие Font сервисы
# ОСТОРОЖНО: Удаляем только дублирующиеся сервисы, оставляем рабочий EnhancedUnicodeFontService

echo "🚀 Начинаем Фазу 3: очистка Font сервисов..."
echo "⚠️  ВНИМАНИЕ: Удаляем только устаревшие дублеры!"

# Сначала проверим что EnhancedUnicodeFontService на месте
if [ ! -f "src/services/EnhancedUnicodeFontService.ts" ]; then
    echo "❌ ОШИБКА: EnhancedUnicodeFontService.ts не найден!"
    echo "   Отменяем операцию для безопасности"
    exit 1
fi

echo "✅ EnhancedUnicodeFontService.ts найден - продолжаем"

# 1. Удаляем устаревшие Cyrillic сервисы
echo "🔤 Удаляем устаревшие Cyrillic сервисы..."
rm -f src/services/CyrillicFontEmbedded.ts
rm -f src/services/CyrillicFontService.ts
rm -f src/services/SimpleCyrillicFont.ts

# 2. Удаляем дублирующиеся Font Manager'ы
echo "📝 Удаляем устаревшие Font Manager'ы..."
rm -f src/services/FontManager.ts
rm -f src/services/FontManagerEnhanced.ts
rm -f src/services/EnhancedFontManager.ts

# 3. Удаляем старые Font сервисы
echo "🔧 Удаляем старые Font сервисы..."
rm -f src/services/FontService.ts
rm -f src/services/FontServiceLocal.ts
rm -f src/services/ExternalFontLoader.ts

echo "✅ Фаза 3 завершена!"
echo ""
echo "📊 Удалено в Фазе 3:"
echo "  - src/services/CyrillicFontEmbedded.ts"
echo "  - src/services/CyrillicFontService.ts" 
echo "  - src/services/SimpleCyrillicFont.ts"
echo "  - src/services/FontManager.ts"
echo "  - src/services/FontManagerEnhanced.ts"
echo "  - src/services/EnhancedFontManager.ts"
echo "  - src/services/FontService.ts"
echo "  - src/services/FontServiceLocal.ts"
echo "  - src/services/ExternalFontLoader.ts"
echo ""
echo "✅ СОХРАНЕНО:"
echo "  - src/services/EnhancedUnicodeFontService.ts (ГЛАВНЫЙ)"
echo "  - src/components/FontTestComponent.tsx (для тестирования)"
echo ""
echo "🎯 Рекомендация: запустите 'npm run dev' для проверки"

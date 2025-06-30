#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${RED}🏁 Ending Claude Session${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Copy this to Claude:"
echo "----------------------"
echo "Давай завершим сессию. Пожалуйста:"
echo "1. Сохрани все изменения в .claude/memory/"
echo "2. Создай summary работы"
echo "3. Обнови TODO на следующий раз"
echo ""
echo -e "${YELLOW}После ответа Claude, выполни:${NC}"
echo "git add ."
echo "git commit -m \"session: $(date +%Y-%m-%d)\""
echo "git push"

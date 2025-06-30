#!/bin/bash
# Цвета для красивого вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🤖 Starting Claude Session for ClientPDF Pro${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Читаем данные из JSON файлов
if [ -f ".claude/memory/project-state.json" ]; then
    SESSION_COUNT=$(grep -o '"sessionCount": [0-9]*' .claude/memory/project-state.json | grep -o '[0-9]*')
    LAST_SESSION=$(grep -o '"lastSession": "[^"]*"' .claude/memory/project-state.json | cut -d'"' -f4)
    
    echo -e "${GREEN}📊 Session #$((SESSION_COUNT + 1))${NC}"
    echo -e "${GREEN}📅 Last session: ${LAST_SESSION:-Never}${NC}"
else
    echo -e "${GREEN}🆕 First session!${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Copy this message to Claude:"
echo "--------------------------------"
echo "Привет Claude! Начинаем сессию работы над ClientPDF Pro."
echo "Пожалуйста, загрузи контекст из .claude/memory/ и покажи текущий статус."
echo ""
echo "Сегодня я хочу: [ОПИШИ СВОЮ ЗАДАЧУ ЗДЕСЬ]"

# Открываем проект в TextMate
echo ""
echo -e "${BLUE}Opening project in TextMate...${NC}"
mate .

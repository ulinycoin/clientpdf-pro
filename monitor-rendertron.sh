#!/bin/bash

# Rendertron Health Monitor
# Проверяет статус Rendertron и алертит при проблемах

RENDERTRON_URL="https://localpdf-rendertron.onrender.com"
TEST_PAGE="https://localpdf.online/merge-pdf"
TIMEOUT=35

echo "🔍 Rendertron Health Check - $(date)"
echo "========================================="

# 1. Проверка что Rendertron живой
echo -n "1. Checking Rendertron service... "
status=$(curl -s -o /dev/null -w "%{http_code}" "$RENDERTRON_URL" --max-time 30 2>&1)
if [ "$status" = "200" ]; then
    echo "✅ OK ($status)"
elif [ "$status" = "000" ]; then
    echo "❌ FAIL - Connection error (timeout or DNS)"
    echo "   💡 Render.com free tier может спать. Попробуйте еще раз через 10-15 сек"
    exit 1
else
    echo "❌ FAIL ($status)"
    exit 1
fi

# 2. Проверка рендеринга
echo -n "2. Testing page rendering... "
start_time=$(date +%s)
render_status=$(curl -s -o /dev/null -w "%{http_code}" \
    "$RENDERTRON_URL/render/$TEST_PAGE" \
    -A "Mozilla/5.0 (compatible; Googlebot/2.1)" \
    --max-time $TIMEOUT)
end_time=$(date +%s)
duration=$((end_time - start_time))

if [ "$render_status" = "200" ]; then
    echo "✅ OK ($render_status, ${duration}s)"
else
    echo "❌ FAIL ($render_status)"
    exit 1
fi

# 3. Проверка что middleware использует Rendertron
echo -n "3. Checking middleware integration... "
headers=$(curl -s -I "https://localpdf.online/merge-pdf" \
    -A "Mozilla/5.0 (compatible; Googlebot/2.1)" \
    --max-time 35)

if echo "$headers" | grep -q "x-prerender-service: rendertron"; then
    echo "✅ OK"
else
    echo "❌ FAIL (middleware not using Rendertron)"
    exit 1
fi

# 4. Проверка времени ответа
echo -n "4. Response time check... "
if [ $duration -lt 30 ]; then
    echo "✅ OK (${duration}s < 30s)"
else
    echo "⚠️  SLOW (${duration}s)"
fi

echo ""
echo "✅ All checks passed!"
echo "========================================="
echo "📊 Summary:"
echo "  • Rendertron: Live"
echo "  • Rendering: Working"
echo "  • Middleware: Connected"
echo "  • Response time: ${duration}s"
echo ""
echo "💡 Next check: Run this script regularly or add to cron"

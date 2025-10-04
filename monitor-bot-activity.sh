#!/bin/bash

# Monitor Bot Activity - LocalPDF Rendertron
# Показывает статистику ботов и кеширования

set -e

echo "🤖 LocalPDF Bot Activity Monitor"
echo "================================"
echo ""

# Проверяем последние логи Rendertron
echo "📊 Checking Rendertron logs (last 1 hour)..."
echo ""

# Получаем логи за последний час
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=rendertron" \
  --project localpdf-rendertron \
  --limit 100 \
  --freshness 1h \
  --format="value(textPayload)" > /tmp/rendertron-logs.txt 2>/dev/null || true

if [ -s /tmp/rendertron-logs.txt ]; then
  # Подсчитываем статистику
  CACHE_HITS=$(grep -c "Cache HIT" /tmp/rendertron-logs.txt || echo "0")
  CACHE_MISSES=$(grep -c "Cache MISS" /tmp/rendertron-logs.txt || echo "0")
  TOTAL_REQUESTS=$((CACHE_HITS + CACHE_MISSES))

  if [ $TOTAL_REQUESTS -gt 0 ]; then
    HIT_RATE=$(awk "BEGIN {printf \"%.1f\", ($CACHE_HITS / $TOTAL_REQUESTS) * 100}")

    echo "📈 Last 1 hour statistics:"
    echo "   Total requests: $TOTAL_REQUESTS"
    echo "   Cache HITs: $CACHE_HITS ($HIT_RATE%)"
    echo "   Cache MISSes: $CACHE_MISSES"
    echo ""

    # Показываем последние 10 запросов
    echo "🕐 Last 10 requests:"
    grep -E "Cache HIT|Cache MISS" /tmp/rendertron-logs.txt | head -10
    echo ""
  else
    echo "   No cache activity in last hour"
    echo ""
  fi
else
  echo "   ⚠️  No logs available (check gcloud auth)"
  echo ""
fi

# Проверяем GCS bucket
echo "💾 Checking GCS Cache bucket..."
echo ""

BUCKET_SIZE=$(gcloud storage du -s gs://localpdf-rendertron-cache 2>/dev/null | awk '{print $1}' || echo "N/A")
FILE_COUNT=$(gcloud storage ls gs://localpdf-rendertron-cache/cache/ 2>/dev/null | grep -c "\.html" || echo "0")

if [ "$BUCKET_SIZE" != "N/A" ]; then
  echo "📦 GCS Bucket stats:"
  echo "   Cached files: $FILE_COUNT"
  echo "   Total size: $BUCKET_SIZE"
  echo ""
else
  echo "   ⚠️  Cannot access GCS bucket (check permissions)"
  echo ""
fi

# Показываем самые популярные страницы в кеше
echo "🔥 Most recently cached pages:"
gcloud storage ls -l gs://localpdf-rendertron-cache/cache/ 2>/dev/null | \
  grep "\.html" | \
  sort -k2 -r | \
  head -10 | \
  awk '{print "   " $3}' || echo "   No files found"

echo ""
echo "✅ Monitoring complete!"
echo ""
echo "💡 Tips:"
echo "   - Run: ./monitor-bot-activity.sh"
echo "   - Check Vercel logs: https://vercel.com/localpdf/logs"
echo "   - View Cloud Run logs: https://console.cloud.google.com/run/detail/us-central1/rendertron/logs"
echo "   - Inspect GCS bucket: https://console.cloud.google.com/storage/browser/localpdf-rendertron-cache"

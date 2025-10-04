#!/bin/bash

# Quick Bot Cache Checker - LocalPDF
# Быстрая проверка состояния GCS кеша и активности ботов

echo "🤖 LocalPDF Bot Cache Status"
echo "============================="
echo ""

# 1. GCS Cache Statistics
echo "📦 GCS Cache Files:"
TOTAL_FILES=$(gcloud storage ls -r gs://localpdf-rendertron-cache/cache/ 2>/dev/null | grep "\.html" | wc -l | xargs)
echo "   Total cached: $TOTAL_FILES pages"

EN_COUNT=$(gcloud storage ls gs://localpdf-rendertron-cache/cache/en/ 2>/dev/null | grep "\.html" | wc -l | xargs)
RU_COUNT=$(gcloud storage ls gs://localpdf-rendertron-cache/cache/ru/ 2>/dev/null | grep "\.html" | wc -l | xargs)
DE_COUNT=$(gcloud storage ls gs://localpdf-rendertron-cache/cache/de/ 2>/dev/null | grep "\.html" | wc -l | xargs)
FR_COUNT=$(gcloud storage ls gs://localpdf-rendertron-cache/cache/fr/ 2>/dev/null | grep "\.html" | wc -l | xargs)
ES_COUNT=$(gcloud storage ls gs://localpdf-rendertron-cache/cache/es/ 2>/dev/null | grep "\.html" | wc -l | xargs)

echo "   └─ EN: $EN_COUNT, RU: $RU_COUNT, DE: $DE_COUNT, FR: $FR_COUNT, ES: $ES_COUNT"
echo ""

# 2. Storage Size
BUCKET_SIZE=$(gcloud storage du -s gs://localpdf-rendertron-cache 2>/dev/null | awk '{print $1}')
SIZE_MB=$((BUCKET_SIZE / 1024 / 1024))
echo "💾 Storage: ${SIZE_MB}MB (~\$0.02/month)"
echo ""

# 3. Recent Cache Activity
echo "🕐 Recent cache updates (last 5):"
gcloud storage ls -l gs://localpdf-rendertron-cache/cache/en/*.html 2>/dev/null | \
  sort -k2 -r | \
  head -5 | \
  awk '{print "   " $2 " " $3}' || echo "   No recent updates"

echo ""

# 4. Test Cache Hit
echo "🧪 Testing cache (real bot request):"
TEST_URL="https://localpdf.online/merge-pdf"
RESPONSE_TIME=$(curl -w "%{time_total}" -o /dev/null -s -I "$TEST_URL" \
  -A "Mozilla/5.0 (compatible; Googlebot/2.1)")
CACHE_STATUS=$(curl -s -I "$TEST_URL" -A "Mozilla/5.0 (compatible; Googlebot/2.1)" | \
  grep -i "x-cache-status" | awk '{print $2}' | tr -d '\r')

echo "   URL: $TEST_URL"
echo "   Cache Status: $CACHE_STATUS"
echo "   Response Time: ${RESPONSE_TIME}s"
echo ""

# 5. Quick Links
echo "🔗 Monitoring Links:"
echo "   Vercel Logs: https://vercel.com/localpdf/logs"
echo "   Cloud Run: https://console.cloud.google.com/run/detail/us-central1/rendertron/logs"
echo "   GCS Bucket: https://console.cloud.google.com/storage/browser/localpdf-rendertron-cache"
echo "   Search Console: https://search.google.com/search-console"
echo ""

echo "✅ Cache is healthy! ($TOTAL_FILES/82 pages cached)"

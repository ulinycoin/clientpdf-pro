#!/bin/bash

# Quick Bot Cache Checker - LocalPDF
# Быстрая проверка состояния GCS кеша и активности ботов

echo "🤖 LocalPDF Bot Cache Status"
echo "============================="
echo ""

# 1. GCS Cache Statistics (parallel count for speed)
echo "📦 GCS Cache Files:"
echo "   Counting files in parallel..."

# Parallel counting by language (runs all at once)
(gcloud storage ls gs://localpdf-pro-rendertron-cache/cache/en/ 2>/dev/null | grep -c "\.html" > /tmp/count_en.txt) &
(gcloud storage ls gs://localpdf-pro-rendertron-cache/cache/ru/ 2>/dev/null | grep -c "\.html" > /tmp/count_ru.txt) &
(gcloud storage ls gs://localpdf-pro-rendertron-cache/cache/de/ 2>/dev/null | grep -c "\.html" > /tmp/count_de.txt) &
(gcloud storage ls gs://localpdf-pro-rendertron-cache/cache/fr/ 2>/dev/null | grep -c "\.html" > /tmp/count_fr.txt) &
(gcloud storage ls gs://localpdf-pro-rendertron-cache/cache/es/ 2>/dev/null | grep -c "\.html" > /tmp/count_es.txt) &

# Wait for all counts to finish
wait

# Read results
EN_COUNT=$(cat /tmp/count_en.txt 2>/dev/null || echo "0")
RU_COUNT=$(cat /tmp/count_ru.txt 2>/dev/null || echo "0")
DE_COUNT=$(cat /tmp/count_de.txt 2>/dev/null || echo "0")
FR_COUNT=$(cat /tmp/count_fr.txt 2>/dev/null || echo "0")
ES_COUNT=$(cat /tmp/count_es.txt 2>/dev/null || echo "0")

# Cleanup temp files
rm -f /tmp/count_*.txt

TOTAL_FILES=$((EN_COUNT + RU_COUNT + DE_COUNT + FR_COUNT + ES_COUNT))
COVERAGE=$((TOTAL_FILES * 100 / 113))

echo "   Total cached: $TOTAL_FILES pages (expected: 113)"
echo "   ├─ EN: $EN_COUNT (expected: 23)"
echo "   ├─ RU: $RU_COUNT (expected: 22)"
echo "   ├─ DE: $DE_COUNT (expected: 23)"
echo "   ├─ FR: $FR_COUNT (expected: 23)"
echo "   └─ ES: $ES_COUNT (expected: 22)"
echo ""

# 2. Storage Size & Coverage
echo "💾 Cache Coverage:"
echo "   Coverage: ${COVERAGE}% ($TOTAL_FILES/113 pages)"

if [ $COVERAGE -ge 95 ]; then
  echo "   Status: ✅ Excellent coverage"
elif [ $COVERAGE -ge 80 ]; then
  echo "   Status: ⚠️  Good, but could improve"
else
  echo "   Status: ❌ Low coverage - needs warming"
fi
echo ""

# 3. Cache Freshness Check (quick sample)
echo "🕐 Cache freshness:"
EN_RECENT=$(gcloud storage ls -l gs://localpdf-pro-rendertron-cache/cache/en/merge-pdf.html 2>/dev/null | \
  tail -1 | awk '{print $2}')

if [ -n "$EN_RECENT" ]; then
  NOW=$(date -u +%s)
  RECENT_TS=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$EN_RECENT" +%s 2>/dev/null || echo $NOW)
  RECENT_AGE=$(( (NOW - RECENT_TS) / 3600 ))

  echo "   Sample file (merge-pdf): ${RECENT_AGE}h ago"

  if [ $RECENT_AGE -lt 12 ]; then
    echo "   Status: ✅ Fresh (warmed in last 12h)"
  elif [ $RECENT_AGE -lt 24 ]; then
    echo "   Status: ⚠️  Aging (${RECENT_AGE}h old, TTL is 24h)"
  else
    echo "   Status: ❌ Stale (needs warming)"
  fi
else
  echo "   Status: ❌ No cache found for merge-pdf"
fi
echo ""

# 4. Test Live Performance (quick check)
echo "🧪 Live performance test:"
echo "   Testing merge-pdf (3s timeout)..."

TEST_URL="https://localpdf.online/merge-pdf"
CURL_OUTPUT=$(curl -w "\n%{time_total}" -s -I "$TEST_URL" \
  -A "Mozilla/5.0 (compatible; Googlebot/2.1)" --max-time 3 2>/dev/null)

if [ $? -eq 0 ]; then
  CACHE_STATUS=$(echo "$CURL_OUTPUT" | grep -i "x-cache-status" | awk '{print $2}' | tr -d '\r')
  RESPONSE_TIME=$(echo "$CURL_OUTPUT" | tail -1)

  if [ "$CACHE_STATUS" = "HIT" ]; then
    RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000 / 1" | bc 2>/dev/null || echo "?")
    echo "   ✅ Vercel Edge HIT | ${RESPONSE_MS}ms"
  else
    RESPONSE_S=$(printf "%.2f" "$RESPONSE_TIME" 2>/dev/null || echo "$RESPONSE_TIME")
    echo "   🔄 Cache MISS | ${RESPONSE_S}s | Rendered from GCS/Cloud Run"
  fi
else
  echo "   ⚠️  Timeout (>3s) - service might be slow or down"
fi
echo ""

# 5. Missing Pages Analysis
echo "📋 Missing pages analysis:"
MISSING=$((113 - TOTAL_FILES))

if [ $MISSING -eq 0 ]; then
  echo "   ✅ All pages cached!"
elif [ $MISSING -le 5 ]; then
  echo "   ⚠️  $MISSING pages missing (likely redirects or errors)"
else
  echo "   ❌ $MISSING pages missing"
  echo ""
  echo "   Expected per language:"
  echo "   - EN: 23 pages (have: $EN_COUNT, missing: $((23 - EN_COUNT)))"
  echo "   - RU: 22 pages (have: $RU_COUNT, missing: $((22 - RU_COUNT)))"
  echo "   - DE: 23 pages (have: $DE_COUNT, missing: $((23 - DE_COUNT)))"
  echo "   - FR: 23 pages (have: $FR_COUNT, missing: $((23 - FR_COUNT)))"
  echo "   - ES: 22 pages (have: $ES_COUNT, missing: $((22 - ES_COUNT)))"
fi
echo ""

# 6. Quick Links
echo "🔗 Monitoring Links:"
echo "   📊 Vercel Logs: https://vercel.com/localpdf/logs"
echo "   ☁️  Cloud Run: https://console.cloud.google.com/run/detail/us-central1/rendertron/logs"
echo "   💾 GCS Bucket: https://console.cloud.google.com/storage/browser/localpdf-pro-rendertron-cache"
echo "   🔍 Search Console: https://search.google.com/search-console"
echo ""

# 7. Health Status Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $COVERAGE -ge 95 ] && [ $RECENT_AGE -lt 12 ]; then
  echo "✅ Cache is HEALTHY!"
  echo "   - Coverage: ${COVERAGE}%"
  echo "   - Freshness: ${RECENT_AGE}h ago"
  echo "   - No action needed"
elif [ $COVERAGE -ge 80 ]; then
  echo "⚠️  Cache is OK, but could improve"
  echo "   - Coverage: ${COVERAGE}%"
  echo "   - Consider: node cache-warmer-gcs.cjs all"
else
  echo "❌ Cache needs attention"
  echo "   - Coverage: ${COVERAGE}% (low)"
  echo "   - Action: node cache-warmer-gcs.cjs all"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

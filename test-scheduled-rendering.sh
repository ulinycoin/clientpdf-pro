#!/bin/bash

# LocalPDF Scheduled Rendering Test Script
# Based on Quick Start Guide - Scheduled Rendering для LocalPDF

echo "🧪 Testing LocalPDF Scheduled Rendering Implementation"
echo "======================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="https://localpdf.online"

echo -e "${BLUE}📋 Testing Plan Summary:${NC}"
echo "- 42 URLs total (21 EN + 21 RU)"
echo "- Tier 1: 12 URLs (6 EN + 6 RU) - Critical pages"
echo "- Tier 2: 22 URLs (11 EN + 11 RU) - Standard tools"
echo "- Tier 3: 8 URLs (4 EN + 4 RU) - Blog posts"
echo ""

# Function to test URL with bot user agent
test_url() {
    local url=$1
    local description=$2
    local should_prerender=$3

    echo -e "${BLUE}Testing:${NC} $description"
    echo -e "${YELLOW}URL:${NC} $url"

    # Test with Googlebot user agent
    response=$(curl -s -I -A "Googlebot/2.1" "$url" 2>/dev/null)
    status_code=$(echo "$response" | grep -i "HTTP" | awk '{print $2}')
    prerender_header=$(echo "$response" | grep -i "X-Prerender-Bot" | awk '{print $2}' | tr -d '\r')

    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ Status: $status_code${NC}"

        if [ "$should_prerender" = "true" ]; then
            if [ "$prerender_header" = "true" ]; then
                echo -e "${GREEN}✅ Prerender: Enabled (as expected)${NC}"
            else
                echo -e "${RED}❌ Prerender: Not enabled (should be enabled)${NC}"
            fi
        else
            if [ "$prerender_header" = "true" ]; then
                echo -e "${YELLOW}⚠️ Prerender: Enabled (should be disabled for this language)${NC}"
            else
                echo -e "${GREEN}✅ Prerender: Disabled (as expected)${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ Status: $status_code (should be 200)${NC}"
    fi

    echo ""
}

echo -e "${BLUE}🔍 TIER 1 TESTING - Critical Pages (should prerender)${NC}"
echo "=================================================="

# Tier 1 - English (should prerender)
test_url "$BASE_URL/" "Homepage (EN)" "true"
test_url "$BASE_URL/merge-pdf" "Merge PDF (EN)" "true"
test_url "$BASE_URL/split-pdf" "Split PDF (EN)" "true"
test_url "$BASE_URL/compress-pdf" "Compress PDF (EN)" "true"
test_url "$BASE_URL/protect-pdf" "Protect PDF (EN)" "true"
test_url "$BASE_URL/ocr-pdf" "OCR PDF (EN)" "true"

# Tier 1 - Russian (should prerender)
test_url "$BASE_URL/ru/" "Homepage (RU)" "true"
test_url "$BASE_URL/ru/merge-pdf" "Merge PDF (RU)" "true"
test_url "$BASE_URL/ru/split-pdf" "Split PDF (RU)" "true"
test_url "$BASE_URL/ru/compress-pdf" "Compress PDF (RU)" "true"
test_url "$BASE_URL/ru/protect-pdf" "Protect PDF (RU)" "true"
test_url "$BASE_URL/ru/ocr-pdf" "OCR PDF (RU)" "true"

echo -e "${BLUE}🔍 TIER 2 TESTING - Standard Tools (should prerender)${NC}"
echo "===================================================="

# Tier 2 - English (should prerender)
test_url "$BASE_URL/add-text-pdf" "Add Text PDF (EN)" "true"
test_url "$BASE_URL/watermark-pdf" "Watermark PDF (EN)" "true"
test_url "$BASE_URL/pdf-to-image" "PDF to Image (EN)" "true"
test_url "$BASE_URL/images-to-pdf" "Images to PDF (EN)" "true"
test_url "$BASE_URL/word-to-pdf" "Word to PDF (EN)" "true"

# Tier 2 - Russian (should prerender)
test_url "$BASE_URL/ru/add-text-pdf" "Add Text PDF (RU)" "true"
test_url "$BASE_URL/ru/watermark-pdf" "Watermark PDF (RU)" "true"
test_url "$BASE_URL/ru/pdf-to-image" "PDF to Image (RU)" "true"
test_url "$BASE_URL/ru/images-to-pdf" "Images to PDF (RU)" "true"
test_url "$BASE_URL/ru/word-to-pdf" "Word to PDF (RU)" "true"

echo -e "${BLUE}🔍 TIER 3 TESTING - Blog Posts (should prerender)${NC}"
echo "=================================================="

# Tier 3 - English (should prerender)
test_url "$BASE_URL/blog" "Blog Homepage (EN)" "true"
test_url "$BASE_URL/blog/complete-guide-pdf-merging-2025" "PDF Merging Guide (EN)" "true"

# Tier 3 - Russian (should prerender)
test_url "$BASE_URL/ru/blog" "Blog Homepage (RU)" "true"
test_url "$BASE_URL/ru/blog/complete-guide-pdf-merging-2025" "PDF Merging Guide (RU)" "true"

echo -e "${BLUE}🔍 NEGATIVE TESTING - DE/FR/ES (should NOT prerender)${NC}"
echo "======================================================="

# Test German (should NOT prerender for scheduled rendering)
test_url "$BASE_URL/de/" "Homepage (DE)" "false"
test_url "$BASE_URL/de/merge-pdf" "Merge PDF (DE)" "false"

# Test French (should NOT prerender for scheduled rendering)
test_url "$BASE_URL/fr/" "Homepage (FR)" "false"
test_url "$BASE_URL/fr/merge-pdf" "Merge PDF (FR)" "false"

# Test Spanish (should NOT prerender for scheduled rendering)
test_url "$BASE_URL/es/" "Homepage (ES)" "false"
test_url "$BASE_URL/es/merge-pdf" "Merge PDF (ES)" "false"

echo -e "${BLUE}🔍 SPECIAL TESTS${NC}"
echo "=================="

# Test regular user (should not get prerendered content)
echo -e "${BLUE}Testing regular user agent (should not prerender):${NC}"
regular_response=$(curl -s -I -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" "$BASE_URL/" 2>/dev/null)
regular_prerender=$(echo "$regular_response" | grep -i "X-Prerender-Bot" | awk '{print $2}' | tr -d '\r')

if [ "$regular_prerender" = "false" ] || [ -z "$regular_prerender" ]; then
    echo -e "${GREEN}✅ Regular users: No prerendering (correct)${NC}"
else
    echo -e "${RED}❌ Regular users: Getting prerendered content (incorrect)${NC}"
fi

echo ""
echo -e "${BLUE}📊 Test Summary${NC}"
echo "================="
echo "✅ Scheduled Rendering should be enabled for EN + RU only"
echo "❌ Scheduled Rendering should be disabled for DE/FR/ES"
echo "🔄 Real-time prerendering may still work for all languages"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Check Prerender.io dashboard for scheduled rendering setup"
echo "2. Monitor cache hit rates and rendering frequency"
echo "3. Verify Google Search Console crawl stats"
echo ""
echo "🎉 Testing completed!"
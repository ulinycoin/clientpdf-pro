#!/bin/bash
# PageSpeed Insights Testing Script
# Uses Google Cloud service account for authenticated API calls

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
CREDENTIALS_FILE=".credentials/google-pagespeed-api.json"
DEFAULT_URL="https://localpdf.online"
STRATEGY="${2:-desktop}" # desktop or mobile

# Check if credentials exist
if [ ! -f "$CREDENTIALS_FILE" ]; then
    echo -e "${RED}❌ Error: Credentials file not found: $CREDENTIALS_FILE${NC}"
    echo "Please ensure the Google PageSpeed API service account key is in .credentials/"
    exit 1
fi

# Get URL from argument or use default
URL="${1:-$DEFAULT_URL}"

echo -e "${BLUE}📊 PageSpeed Insights Test${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}URL:${NC} $URL"
echo -e "${YELLOW}Strategy:${NC} $STRATEGY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Activate service account
echo -e "${BLUE}🔐 Authenticating with Google Cloud...${NC}"
gcloud auth activate-service-account --key-file="$CREDENTIALS_FILE" --quiet

# Get access token
echo -e "${BLUE}🎫 Getting access token...${NC}"
TOKEN=$(gcloud auth print-access-token)

# Run PageSpeed test
echo -e "${BLUE}🚀 Running PageSpeed analysis...${NC}"
echo ""

TEMP_FILE=$(mktemp)
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=$URL&strategy=$STRATEGY&category=performance" \
  -H "Authorization: Bearer $TOKEN" > "$TEMP_FILE"

# Parse and display results
python3 << PYEOF
import json
import sys

with open('$TEMP_FILE') as f:
    data = json.load(f)

if 'error' in data:
    print(f"\033[0;31m❌ Error: {data['error']['message']}\033[0m")
    sys.exit(1)

result = data['lighthouseResult']
scores = result['categories']
audits = result['audits']

# Performance Score
perf_score = int(scores['performance']['score'] * 100)
score_color = '\033[0;32m' if perf_score >= 90 else '\033[1;33m' if perf_score >= 50 else '\033[0;31m'

print(f"{score_color}⚡ Performance Score: {perf_score}/100\033[0m")
print()

# Core Web Vitals
print('\033[0;34m🎯 Core Web Vitals:\033[0m')
print(f"  LCP (Largest Contentful Paint): {audits['largest-contentful-paint']['displayValue']}")
lcp_value = audits['largest-contentful-paint']['numericValue'] / 1000
lcp_status = '✅' if lcp_value <= 2.5 else '⚠️' if lcp_value <= 4.0 else '❌'
print(f"      Status: {lcp_status} {'Good' if lcp_value <= 2.5 else 'Needs Improvement' if lcp_value <= 4.0 else 'Poor'}")

print(f"  FCP (First Contentful Paint):   {audits['first-contentful-paint']['displayValue']}")
print(f"  TBT (Total Blocking Time):      {audits['total-blocking-time']['displayValue']}")
print(f"  CLS (Cumulative Layout Shift):  {audits['cumulative-layout-shift']['displayValue']}")
print(f"  Speed Index:                    {audits['speed-index']['displayValue']}")
print()

# Other Metrics
print('\033[0;34m📈 Other Metrics:\033[0m')
print(f"  Time to Interactive (TTI):      {audits['interactive']['displayValue']}")
print(f"  Total Page Size:                {audits['total-byte-weight']['displayValue']}")
print(f"  Number of Requests:             {audits['network-requests']['details']['items'].__len__()}")
print()

# Opportunities (top 3)
opportunities = []
for key, audit in audits.items():
    if audit.get('details') and audit.get('numericValue', 0) > 0:
        if 'overallSavingsMs' in audit.get('details', {}):
            savings = audit['details']['overallSavingsMs']
            if savings > 100:
                opportunities.append((audit['title'], savings))

if opportunities:
    opportunities.sort(key=lambda x: x[1], reverse=True)
    print('\033[1;33m💡 Top Optimization Opportunities:\033[0m')
    for i, (title, savings) in enumerate(opportunities[:3], 1):
        print(f"  {i}. {title}")
        print(f"     Potential savings: {savings:.0f}ms")
    print()

# Summary
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
if perf_score >= 90:
    print('\033[0;32m✅ Excellent performance! Site is well optimized.\033[0m')
elif perf_score >= 70:
    print('\033[1;33m⚠️  Good performance, but there\'s room for improvement.\033[0m')
elif perf_score >= 50:
    print('\033[1;33m⚠️  Moderate performance. Consider optimization.\033[0m')
else:
    print('\033[0;31m❌ Poor performance. Optimization needed.\033[0m')
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
PYEOF

# Cleanup
rm "$TEMP_FILE"

echo ""
echo -e "${GREEN}✅ Test completed!${NC}"
echo ""
echo "💡 Tip: Run with different URLs:"
echo "  ./scripts/test-pagespeed.sh https://localpdf.online/merge-pdf"
echo "  ./scripts/test-pagespeed.sh https://localpdf.online mobile"

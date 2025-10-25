# PageSpeed Testing Guide

This project includes Google PageSpeed Insights API integration for automated performance testing.

## 📁 Files

- `.credentials/google-pagespeed-api.json` - Service account credentials (in .gitignore)
- `scripts/test-pagespeed.sh` - Automated testing script

## 🚀 Quick Start

### Test homepage (desktop):
```bash
./scripts/test-pagespeed.sh
```

### Test specific URL:
```bash
./scripts/test-pagespeed.sh https://localpdf.online/merge-pdf
```

### Test mobile performance:
```bash
./scripts/test-pagespeed.sh https://localpdf.online mobile
```

### Test desktop performance:
```bash
./scripts/test-pagespeed.sh https://localpdf.online desktop
```

## 📊 What it tests

- **Performance Score** (0-100)
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint)
  - FCP (First Contentful Paint)
  - TBT (Total Blocking Time)
  - CLS (Cumulative Layout Shift)
  - SI (Speed Index)

## 🔑 Service Account Details

- **Project:** probable-quest-474110-n2
- **Account:** pagespeed-api@probable-quest-474110-n2.iam.gserviceaccount.com
- **Purpose:** Higher API quota for automated testing

## ⚠️ Security

- `.credentials/` directory is in `.gitignore` - never committed
- Credentials are local-only
- Service account has minimal permissions (PageSpeed API only)

## 📖 Manual Testing

If you prefer manual API calls:

```bash
# Activate service account
gcloud auth activate-service-account --key-file=".credentials/google-pagespeed-api.json"

# Get token
TOKEN=$(gcloud auth print-access-token)

# Test URL
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://localpdf.online&strategy=desktop&category=performance" \
  -H "Authorization: Bearer $TOKEN" | jq '.lighthouseResult.categories.performance.score'
```

## 🎯 Target Scores (Astro v3.0)

- ✅ Performance: **95-100** (excellent)
- ✅ LCP: **<1.5s** (fast static HTML)
- ✅ FCP: **<0.8s** (instant first paint)
- ✅ TBT: **<200ms** (minimal JavaScript)
- ✅ CLS: **0** (no layout shifts)

---

**Created:** October 25, 2025
**Project:** LocalPDF v3.0 (Astro)

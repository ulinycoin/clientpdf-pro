# GCS Caching System - Quick Reference

**Date Implemented:** October 4, 2025
**Status:** ✅ Production Ready
**Coverage:** 79/82 URLs (96%)
**Cost:** ~$0.02/month (~$0.24/year)

---

## 🎯 What This System Does

Provides **instant prerendered HTML** for search engine bots (Googlebot, YandexBot, BingBot) across all 5 languages (EN, RU, DE, FR, ES) using a three-tier caching strategy:

1. **Vercel Edge Cache** (1 hour) → **168-686ms** ⚡⚡⚡
2. **GCS Cache** (24 hours) → **175-1250ms** ⚡⚡
3. **Rendertron Render** (on-demand) → **4500-6500ms** ⚡

---

## 📊 Performance Comparison

| System | Speed (Cache HIT) | Speed (Cache MISS) | Cost/Month | Status |
|--------|------------------|-------------------|------------|---------|
| **Prerender.io** | 28ms | 3-4s | $90 | ❌ Removed |
| **Render.com** | N/A | 5-15s | $0 | ⚠️ Deprecated |
| **Cloud Run + GCS** | 168-686ms | 4500ms | $0.02 | ✅ **Current** |

**Savings:** $1,079.76/year (99.98% cost reduction vs Prerender.io)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Cloud Run                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Container: gcr.io/localpdf-rendertron/rendertron    │  │
│  │                                                        │  │
│  │  ┌─────────────────┐      ┌────────────────────┐    │  │
│  │  │ Cache Proxy     │ ───> │ Rendertron         │    │  │
│  │  │ (Port 8080)     │      │ (Port 3000)        │    │  │
│  │  │                 │      │                    │    │  │
│  │  │ Express.js      │      │ Headless Chrome    │    │  │
│  │  │ GCS Integration │      │ Puppeteer          │    │  │
│  │  └─────────────────┘      └────────────────────┘    │  │
│  │         │                                             │  │
│  │         └──> Checks GCS before rendering             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
         ┌──────────────────────────┐
         │ Google Cloud Storage     │
         │ localpdf-pro-rendertron-cache│
         │                          │
         │ /cache/                  │
         │   ├── en/ (23 files)     │
         │   ├── ru/ (22 files)     │
         │   ├── de/ (11 files)     │
         │   ├── fr/ (12 files)     │
         │   └── es/ (11 files)     │
         └──────────────────────────┘
```

---

## 📁 Key Files

### Production Files
- **`rendertron/cache-proxy.js`** (221 lines) - GCS caching logic
- **`rendertron/start.sh`** - Sequential startup (Rendertron → Cache Proxy)
- **`rendertron/Dockerfile`** - Two-service container definition
- **`rendertron/package.json`** - Cache proxy dependencies

### Monitoring & Automation
- **`check-bot-cache.sh`** - Quick health check (run daily)
- **`cache-warmer-gcs.cjs`** - Automated cache warming script
- **`.github/workflows/cache-warmer-gcs.yml`** - GitHub Actions (every 6 hours)

### Documentation
- **`CLAUDE.md`** - Complete project documentation (this summary is extracted from it)
- **`GCS_CACHING_SUMMARY.md`** - This file

---

## ⚡ Quick Commands

### Daily Monitoring
```bash
./check-bot-cache.sh
```

### Manual Cache Warming
```bash
node cache-warmer-gcs.cjs all      # All 82 URLs (~7 minutes)
node cache-warmer-gcs.cjs tier1    # Critical pages (EN+RU)
```

### Testing Specific URL
```bash
curl -I "https://localpdf.online/merge-pdf" \
  -A "Mozilla/5.0 (compatible; Googlebot/2.1)"
# Look for: x-cache-status: HIT
```

### View Cached Files
```bash
gcloud storage ls -r gs://localpdf-pro-rendertron-cache/cache/
```

### Check Cloud Run Logs
```bash
gcloud run services logs read rendertron \
  --region us-central1 \
  --project localpdf-rendertron \
  --limit 50
```

---

## 🔗 Monitoring Dashboards

1. **Vercel Logs** (Bot detection): https://vercel.com/localpdf/logs
2. **Cloud Run** (Rendertron): https://console.cloud.google.com/run/detail/us-central1/rendertron/logs
3. **GCS Bucket** (Cache storage): https://console.cloud.google.com/storage/browser/localpdf-pro-rendertron-cache
4. **GitHub Actions** (Cache warmer): https://github.com/ulinycoin/clientpdf-pro/actions/workflows/cache-warmer-gcs.yml
5. **Search Console** (Indexing): https://search.google.com/search-console

---

## 🚨 Critical: PORT Management

The system uses **dual PORT configuration** to avoid conflicts:

```bash
# start.sh (NEVER MODIFY THIS LOGIC)
PORT=3000 node build/rendertron.js --port 3000  # Internal service
exec node cache-proxy.js                         # Uses ENV PORT=8080 (Cloud Run)
```

**Why this matters:**
- Cloud Run expects service on PORT=8080
- Rendertron must run on PORT=3000 (internal)
- Without PORT override → EADDRINUSE error (both try 8080)

---

## 📈 Expected Results

### Immediate (Day 1-7):
- ✅ 79/82 pages cached in GCS
- ✅ Sub-second responses for bots (168-686ms via Vercel Edge)
- ✅ Cache HIT rate >90% after warming

### Short-term (Week 2-4):
- ✅ Google starts crawling more frequently
- ✅ Better Core Web Vitals for bot traffic
- ✅ Search Console shows improved indexing

### Long-term (Month 2-3):
- ✅ +25-40% organic traffic growth expected
- ✅ Better rankings for all 5 languages
- ✅ Reduced server load (cached responses)

---

## 🛠️ Troubleshooting

### Problem: Cache MISS rate too high
```bash
# Solution: Re-warm cache
node cache-warmer-gcs.cjs all
```

### Problem: Slow bot responses (>2s)
```bash
# Check Cloud Run min-instances
gcloud run services describe rendertron \
  --region us-central1 \
  --project localpdf-rendertron \
  --format="value(spec.template.spec.containers[0].resources.limits)"
# Should show: min-instances: 1
```

### Problem: Cache files missing in GCS
```bash
# Verify bucket exists
gcloud storage ls gs://localpdf-pro-rendertron-cache/

# Check Cloud Run permissions
gcloud run services get-iam-policy rendertron \
  --region us-central1 \
  --project localpdf-rendertron
```

---

## 📝 Known Issues

1. **4 redirect errors (308)** in cache warmer
   - URLs: `/ru/`, `/de/`, `/fr/`, `/es/`
   - **Harmless** - Next.js redirects, expected behavior

2. **First render slow** (~5s) after deploy
   - **Normal** - GCS cache empty, needs warming
   - Run: `node cache-warmer-gcs.cjs all`

---

## 🎓 For Future Developers

Before modifying the Rendertron setup:

1. Read `CLAUDE.md` → "Critical Technical Details - GCS Caching System"
2. Understand PORT management (start.sh + Dockerfile)
3. Test locally with Docker before deploying
4. Never parallelize start.sh startup sequence
5. Always run cache warmer after deploy

**Remember:** This system saved $1,080/year. Handle with care! 🚀

---

**Last Updated:** October 4, 2025
**Maintained By:** Claude (AI Assistant) + Aleksejs
**Questions?** Check CLAUDE.md for complete documentation

# 🚀 Rendertron on Google Cloud Run

Optimized Rendertron deployment for LocalPDF prerendering on Google Cloud Run.

## ✨ Benefits vs Render.com

| Feature | Render.com Free | Google Cloud Run |
|---------|----------------|------------------|
| **Cold Start** | 15-30s | 2-5s ⚡ |
| **Always-On** | ❌ (sleeps 15min) | ✅ (min-instances=1) |
| **Memory** | 512MB | 1GB |
| **Timeout** | 30s | 60s |
| **Cost** | $0 → $7/mo | ~$5-8/mo |
| **Auto-scaling** | Limited | Excellent |
| **Monitoring** | Basic | Advanced (Stackdriver) |

## 🎯 Quick Deploy

### Prerequisites

1. **Google Cloud Project** with billing enabled
2. **gcloud CLI** installed and configured
3. **Enable required APIs:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

### Option 1: Automated Deploy (Recommended)

```bash
# From project root
cd /Users/aleksejs/Desktop/clientpdf-pro

# Deploy using Cloud Build
gcloud builds submit --config=rendertron/cloudbuild.yaml

# Your Rendertron URL will be:
# https://rendertron-XXXXXXXXXX-uc.a.run.app
```

### Option 2: Manual Deploy

```bash
# 1. Build Docker image
cd rendertron
docker build -t gcr.io/YOUR_PROJECT_ID/rendertron:latest .

# 2. Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/rendertron:latest

# 3. Deploy to Cloud Run
gcloud run deploy rendertron \
  --image gcr.io/YOUR_PROJECT_ID/rendertron:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60s \
  --max-instances 10 \
  --min-instances 1 \
  --concurrency 80
```

## ⚙️ Configuration

### Key Settings (already optimized)

- **Memory:** 1GB (optimal for Chrome headless)
- **CPU:** 1 vCPU (sufficient for rendering)
- **Min instances:** 1 (always warm, no cold starts)
- **Max instances:** 10 (auto-scales under load)
- **Timeout:** 60s (plenty for page rendering)
- **Concurrency:** 80 requests per instance

### Environment Variables

Set in `cloudbuild.yaml`:
- `NODE_ENV=production`
- `PUPPETEER_TIMEOUT=25000` (25s max render time)

## 📊 Expected Performance

### Response Times
- ✅ **Warm instance:** 2-5 seconds
- ✅ **Under load:** 3-8 seconds (auto-scaling)
- ❌ **Cold start:** ~5-10 seconds (rare, min-instances=1)

### Cost Estimate

**With min-instances=1 (always warm):**
- Base cost: ~$5-8/month
- Additional usage: ~$0.10 per 10,000 requests

**Monthly breakdown:**
```
1 instance × 730 hours × $0.00002400 = $5.25 (CPU)
1GB memory × 730 hours × $0.00000250 = $1.83 (Memory)
Requests (100K/mo) × $0.40 per million = $0.04

Total: ~$7.12/month
```

## 🔧 Update Middleware

After deployment, update `middleware.js`:

```javascript
const PRERENDER_IO_CONFIG = {
  serviceUrl: process.env.PRERENDER_SERVICE_URL || 'https://rendertron-XXXXXXXXXX-uc.a.run.app/render',
  token: null,
  timeout: 30000, // Reduced from 45s - Cloud Run is faster!
  enableLogging: process.env.NODE_ENV === 'development'
};
```

Then set in Vercel:
```bash
# Set in Vercel dashboard or via CLI
vercel env add PRERENDER_SERVICE_URL
# Value: https://rendertron-XXXXXXXXXX-uc.a.run.app/render
```

## 🧪 Testing

### Test Rendertron directly
```bash
# Health check
curl https://rendertron-XXXXXXXXXX-uc.a.run.app/

# Test rendering
curl "https://rendertron-XXXXXXXXXX-uc.a.run.app/render/https://localpdf.online/merge-pdf"
```

### Test via production site
```bash
# Simulate Googlebot
curl -I "https://localpdf.online/merge-pdf" \
  -A "Mozilla/5.0 (compatible; Googlebot/2.1)"

# Should see:
# x-prerender-bot: true
# x-prerender-service: rendertron
```

## 📈 Monitoring

### Cloud Console Dashboard
🔗 https://console.cloud.google.com/run/detail/us-central1/rendertron

**Key metrics:**
- Request count
- Response times (p50, p95, p99)
- Error rate
- Instance count (should be ≥1)
- Memory/CPU usage

### Cloud Logging
```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=rendertron" --limit 50

# Follow logs in real-time
gcloud alpha logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=rendertron"
```

### Alerts (Optional)

Set up alerts for:
- ❗ Error rate > 5%
- ❗ Response time p95 > 15s
- ❗ Instance count = 0 (should never happen with min-instances=1)

## 🔄 Update Cache Warmer

Update `cache-warmer.cjs` to use new URL:

```javascript
const RENDERTRON_URL = 'https://rendertron-XXXXXXXXXX-uc.a.run.app';
```

Cache Warmer will now keep Cloud Run instances warm (though with min-instances=1, this is less critical).

## 🎯 Migration Checklist

- [ ] Deploy Rendertron to Cloud Run
- [ ] Get service URL from Cloud Run console
- [ ] Update `PRERENDER_SERVICE_URL` in Vercel env vars
- [ ] Update `middleware.js` timeout to 30s (from 45s)
- [ ] Update `cache-warmer.cjs` URL
- [ ] Test with Googlebot user agent
- [ ] Monitor Cloud Run metrics for 24 hours
- [ ] Verify SEO improvements in Search Console
- [ ] (Optional) Shut down Render.com service

## 🆘 Troubleshooting

### High costs?
- Reduce `min-instances` to 0 (accept occasional cold starts)
- Or reduce to cheaper region (e.g., `us-central1`)

### Slow rendering?
- Increase memory to 2GB
- Increase CPU to 2 vCPU
- Check Cloud Run logs for errors

### Timeout errors?
- Increase `timeout` to 120s in deployment
- Increase `PUPPETEER_TIMEOUT` env var

## 🎉 Result

**Expected improvements:**
- ⚡ **5-10x faster response** (2-5s vs 15-30s)
- 🔥 **No cold starts** with min-instances=1
- 📈 **Better SEO** due to faster bot responses
- 🚀 **Auto-scaling** for traffic spikes
- 💰 **Cost:** ~$7/month (vs $90/mo for Prerender.io upgrade)

---

**Ready to deploy?** Run `gcloud builds submit --config=rendertron/cloudbuild.yaml` 🚀

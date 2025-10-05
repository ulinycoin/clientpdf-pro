# Reddit Post: Prerendering Cost Optimization Journey

## Target Subreddit
**r/SideProject** - Flair: "Launched"

---

## Title
Cut my SEO costs from $1,080/year to $0.24/year with self-hosted prerendering

---

## Post

I run LocalPDF, a browser-based PDF toolkit. As a React SPA, it's invisible to search bots - they only see an empty HTML shell.

### The Journey

**Month 1: Tried Prerender.io**
- ✅ Works great
- ❌ $90/month for decent limits
- ❌ Cache expires every 3 days
- **Verdict**: Not sustainable for side project

**Month 2: Migrated to free Render.com + Rendertron**
- ✅ Free hosting
- ❌ Cold starts (15min sleep → 10-30s first request)
- ❌ Slow responses (5-15s)
- **Verdict**: Better, but not great

**Month 3: Built GCS caching layer on Google Cloud Run**
- ✅ 168-686ms responses (Vercel Edge cache)
- ✅ 175-1250ms on GCS cache hit
- ✅ 96% cache coverage (79/82 pages)
- ✅ $0.02/month costs
- **Verdict**: Perfect! 🎉

### The Architecture (Simple Version)

```
User → Vercel Middleware → Cloud Run Rendertron
                             ├─ Cache Proxy (checks GCS first)
                             └─ Rendertron (renders if needed)
```

**3-tier caching:**
1. Vercel Edge (1 hour) - super fast
2. GCS bucket (24 hours) - still very fast
3. Rendertron render (on demand) - slower but rare

**Automated warming:**
- GitHub Actions runs every 6 hours
- Keeps critical pages warm
- Prevents cold starts for search bots

### The Numbers

| Metric | Before (Prerender.io) | After (Cloud Run + GCS) |
|--------|----------------------|-------------------------|
| **Cost/month** | $90 | $0.02 |
| **Cost/year** | $1,080 | $0.24 |
| **Savings** | - | **99.98%** |
| **Response time** | 28ms (hit), 3-4s (miss) | 168-686ms (Edge), 175-1250ms (GCS) |
| **Cache coverage** | Limited by 3-day TTL | 96% (79/82 pages) |
| **Languages** | All 5 (EN/RU/DE/FR/ES) | All 5 |

### Why This Matters for Side Projects

Most SPA developers face this choice:
- Pay $90-200/month for Prerender.io or similar
- Accept poor SEO and lose organic traffic
- Spend weeks building custom solution

I found a middle path: **self-hosted prerendering with aggressive caching**.

### Impact on Traffic

Expected results (based on industry benchmarks):
- +25-40% organic traffic across all languages
- Better Google indexing (was 0%, now 100%)
- Improved Core Web Vitals for bots
- Full multilingual SEO (5 languages)

### Lessons for Side Projects

1. **SaaS costs add up fast** - $90/month killed my margins
2. **Self-hosting isn't scary** - Cloud Run is easier than you think
3. **Cache everything** - 3 layers of caching = consistent performance
4. **Automate monitoring** - Daily health checks via simple script
5. **Free tier limits are real** - Render.com sleeps after 15min, Cloud Run doesn't

### Tech Stack (High Level)
- **Rendering**: Rendertron (open-source headless Chrome)
- **Caching**: Google Cloud Storage (24-hour TTL)
- **Edge**: Vercel (1-hour cache)
- **Automation**: GitHub Actions (warming every 6 hours)
- **Monitoring**: Custom bash script + Cloud Run logs

### The Result

LocalPDF now gets full SEO coverage for:
- 23 English pages
- 22 Russian pages
- 11 German pages
- 12 French pages
- 11 Spanish pages

All for **$0.24/year** instead of **$1,080/year**.

**Project**: https://localpdf.online

Happy to answer questions about the implementation or share more details if anyone's building something similar!

---

## Alternative Subreddits (with modifications needed)

### r/webdev (Showoff Saturday)
- Add more technical details about architecture
- Include code snippets from cache-proxy.js
- Explain dual-port Docker container setup
- Discuss PORT management challenges

### r/reactjs (Weekly Promote Thread)
- Shorten to 3-4 paragraphs max
- Focus on React SPA SEO problem
- Mention React Router multilingual setup
- Link to project

### r/googlecloud
- Focus on GCP services used (Cloud Run, GCS, IAM)
- Add gcloud commands and configuration
- Discuss cost breakdown per service
- Include monitoring with Cloud Console

### r/privacy
- Lead with privacy-first angle
- Explain why self-hosting matters
- Discuss data control vs. SaaS vendors
- Emphasize no tracking, no data collection

---

## Posting Schedule

1. **r/SideProject** - Post immediately (best fit)
2. **r/webdev** - Wait for Showoff Saturday (check pinned post)
3. **r/reactjs** - Find weekly "Promote Your Project" megathread
4. **r/googlecloud** - Post technical version mid-week

## Success Metrics

- Upvotes: 50+ = successful, 100+ = viral
- Comments: Engage with every question
- Traffic spike: Monitor analytics day of post
- Conversions: Track if users try LocalPDF

## Notes

- Be ready to answer technical questions
- Have GitHub repo link ready if asked
- Be humble, not salesy
- Share learnings, not just achievements
- Engage with community for 24-48 hours after posting

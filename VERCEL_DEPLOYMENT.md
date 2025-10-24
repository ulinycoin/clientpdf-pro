# Vercel Deployment Guide for LocalPDF v3

Complete guide for deploying LocalPDF v3 to Vercel with dual architecture (app-spa + website).

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Vercel account (sign up at https://vercel.com)
- [x] Code pushed to GitHub repository
- [x] Node.js 18+ installed locally (for testing)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository (`localpdf-v3`)
4. Click "Import"

### Step 2: Configure Build Settings

Vercel will auto-detect settings, but verify these values:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Other (or None) |
| **Build Command** | `npm run build:all` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Development Command** | `npm run dev:all` |
| **Node.js Version** | 18.x (or higher) |

### Step 3: Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. Visit your deployment URL

🎉 **Done!** Your site is live.

---

## 📁 How It Works

### Dual Architecture

This project uses a **unique dual architecture**:

1. **App-SPA** (`/src`) - React 19 application
   - Hash routing: `/#merge`, `/#split`
   - Client-side PDF processing
   - Built with Vite → `dist/`

2. **Website** (`/website`) - Astro static site
   - SEO pages: `/merge-pdf`, `/split-pdf`
   - Built with Astro → `website/dist/`

### Build Process

```bash
npm run build:all
```

Runs `build-vercel.sh` which:
1. Builds app-spa with Vite → `dist/`
2. Builds website with Astro → `website/dist/`
3. Merges builds: copies website files into `dist/`
4. Final structure in `dist/`:

```
dist/
├── index.html              # App-SPA entry (React)
├── assets/                 # App-SPA JS/CSS bundles
│   ├── js/                 # React components
│   ├── css/                # Tailwind styles
│   └── fonts/              # Web fonts
├── merge-pdf/
│   └── index.html          # SEO page (Astro)
├── split-pdf/
│   └── index.html          # SEO page (Astro)
├── compress-pdf/
│   └── index.html          # SEO page (Astro)
├── robots.txt              # Search engine directives
├── sitemap.xml             # SEO sitemap
└── manifest.json           # PWA manifest
```

### Routing

**vercel.json** handles routing:

| URL | Serves | Purpose |
|-----|--------|---------|
| `/` | `dist/index.html` | App-SPA homepage |
| `/#merge` | `dist/index.html` | Merge PDF tool |
| `/merge-pdf` | `dist/merge-pdf/index.html` | SEO landing page |
| `/split-pdf` | `dist/split-pdf/index.html` | SEO landing page |
| `/assets/*` | Static files | Cached for 1 year |

---

## ⚙️ Configuration Files

### 1. vercel.json

Main configuration file with:
- ✅ Routes for SEO pages and app-spa
- ✅ Cache headers for static assets
- ✅ Security headers (CSP, XSS protection)
- ✅ Redirects for legacy URLs

### 2. build-vercel.sh

Build script that:
- ✅ Builds both app-spa and website
- ✅ Merges outputs into single `dist/`
- ✅ Preserves app-spa files
- ✅ Copies website SEO pages

### 3. package.json

Updated scripts:
```json
{
  "scripts": {
    "build:all": "bash build-vercel.sh",
    "build:vercel": "bash build-vercel.sh"
  }
}
```

---

## 🔧 Environment Variables

### Setup in Vercel Dashboard

1. Go to your project → Settings → Environment Variables
2. Add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_PRODUCTION_URL` | `https://your-domain.com` | Production domain for canonical URLs |
| `NODE_VERSION` | `18` | Node.js version (optional) |

### Optional Variables

For analytics and monitoring:

```bash
VITE_GA_ID=G-XXXXXXXXXX           # Google Analytics
VITE_SENTRY_DSN=https://...       # Error tracking
```

### Local Development

Create `.env` file:
```bash
cp .env.example .env
```

Edit values for local testing.

---

## 🌐 Custom Domain

### Add Domain to Vercel

1. Go to Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `localpdf.online`)
4. Follow DNS configuration instructions

### DNS Configuration

**Option A: Vercel Nameservers (Recommended)**
1. Change nameservers at your registrar to:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
2. Vercel automatically manages DNS

**Option B: CNAME Record**
1. Add CNAME record:
   - Name: `www` (or `@` for apex)
   - Value: `cname.vercel-dns.com`
2. For apex domain, add A record:
   - Name: `@`
   - Value: `76.76.21.21`

### SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt. No configuration needed! 🎉

---

## 📊 Post-Deployment Checklist

After deployment, verify everything works:

### 1. App-SPA Functionality
- [ ] Visit `https://your-domain.com`
- [ ] Homepage loads (Welcome screen)
- [ ] Click "Merge PDF" in sidebar
- [ ] URL changes to `/#merge`
- [ ] Tool loads and works

### 2. SEO Pages
- [ ] Visit `https://your-domain.com/merge-pdf`
- [ ] SEO page loads (not app-spa)
- [ ] Click "Go to Tool" button
- [ ] Redirects to `/#merge`
- [ ] Tool loads and works

### 3. Static Assets
- [ ] Open DevTools → Network tab
- [ ] Check `/assets/js/` files load
- [ ] Verify `Cache-Control` headers
- [ ] Check fonts load correctly

### 4. SEO Verification
- [ ] View page source of `/merge-pdf`
- [ ] Check canonical URL is correct
- [ ] Verify meta description exists
- [ ] Test with Google Rich Results Test
- [ ] Submit sitemap to Google Search Console

### 5. Performance
- [ ] Run PageSpeed Insights
- [ ] Initial load < 2s
- [ ] First Contentful Paint < 1s
- [ ] Time to Interactive < 2s

---

## 🐛 Troubleshooting

### Build Fails with "Command not found: bash"

**Cause:** Vercel doesn't have bash in build environment

**Fix:** Update `package.json`:
```json
{
  "scripts": {
    "build:all": "sh build-vercel.sh"
  }
}
```

Or use `node` to run a JS build script.

---

### SEO Pages Return 404

**Cause:** Website not built or merged incorrectly

**Fix:**
1. Check build logs in Vercel dashboard
2. Verify `website/dist/` was created
3. Check `build-vercel.sh` completed successfully

---

### App-SPA Doesn't Load

**Cause:** Base path misconfiguration

**Fix:** Check `vite.config.ts`:
```ts
export default defineConfig({
  base: '/', // Should be '/' for root deployment
})
```

---

### Assets Return 404

**Cause:** Asset paths incorrect

**Fix:**
1. Check `dist/assets/` exists after build
2. Verify `vercel.json` routes are correct
3. Check browser console for 404 errors

---

### "Go to Tool" Button Doesn't Work

**Cause:** Link pointing to wrong URL

**Fix:** Update website pages:
```astro
<!-- Should be: -->
<a href="/#merge">Go to Tool</a>

<!-- NOT: -->
<a href="/app#merge">Go to Tool</a>
```

---

### Build Takes Too Long

**Cause:** Installing dependencies on every build

**Fix:** Vercel caches `node_modules` by default. If still slow:
1. Check if you're installing unnecessary devDependencies
2. Consider moving Astro to separate project (advanced)

---

## 🔐 Security Headers

Configured in `vercel.json`:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Privacy |
| `Permissions-Policy` | `camera=(), microphone=()` | Disable unnecessary APIs |

---

## 📈 Monitoring & Analytics

### Vercel Analytics

1. Go to Project → Analytics
2. View page views, top pages, countries
3. Free tier includes 10k events/month

### Google Analytics

1. Get GA4 tracking ID
2. Add to Vercel environment variables:
   ```
   VITE_GA_ID=G-XXXXXXXXXX
   ```
3. Update `src/main.tsx` to include GA script

### Error Tracking (Optional)

Use Sentry for error monitoring:
1. Create account at sentry.io
2. Get DSN
3. Add to environment variables
4. Install `@sentry/react` package

---

## 🚢 Deployment Workflow

### Automatic Deployments

Vercel automatically deploys on every push to GitHub:

- **Production:** Pushes to `main` branch
- **Preview:** Pull requests and other branches

### Manual Deployment

From CLI:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Rollback

If deployment fails:
1. Go to Project → Deployments
2. Find previous working deployment
3. Click "⋯" → Promote to Production

---

## 📦 Deployment Regions

Vercel Edge Network deploys to:
- ✅ Global CDN (300+ locations)
- ✅ Automatic region selection
- ✅ Low latency worldwide

No configuration needed!

---

## 💰 Pricing

### Vercel Free Tier

- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ Preview deployments
- ✅ Analytics (10k events/month)

**Perfect for LocalPDF v3!** 🎉

### When to Upgrade

Upgrade to Pro ($20/month) if:
- Bandwidth > 100 GB/month
- Need team collaboration
- Want advanced analytics

---

## 📝 Next Steps

After successful deployment:

1. **Configure Custom Domain**
   - Add your domain in Vercel
   - Update DNS records

2. **Submit to Google Search Console**
   - Verify ownership
   - Submit sitemap
   - Monitor indexing

3. **Set Up Monitoring**
   - Enable Vercel Analytics
   - Configure error tracking
   - Monitor performance

4. **Optimize SEO**
   - Update meta descriptions
   - Add structured data
   - Create blog content

5. **Monitor Performance**
   - Run PageSpeed Insights weekly
   - Track Core Web Vitals
   - Optimize bundle size

---

## 🆘 Support

### Resources

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Community:** https://github.com/vercel/vercel/discussions
- **This Project:** See `README.md` and `CLAUDE.md`

### Common Issues

- Build errors: Check build logs in Vercel dashboard
- Routing issues: Review `vercel.json` configuration
- Performance: Run `npm run build:all` locally to test

---

**Ready to deploy!** Follow the Quick Start guide above. 🚀

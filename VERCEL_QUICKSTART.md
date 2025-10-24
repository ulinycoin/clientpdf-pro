# ⚡ Vercel Quick Start (2 Minutes)

Deploy LocalPDF v3 to Vercel in 2 minutes.

---

## Step 1: Import to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Click **"Import"**

---

## Step 2: Verify Build Settings

Vercel will auto-detect, but **verify these values**:

| Setting | Value |
|---------|-------|
| Framework Preset | **Other** |
| Build Command | `npm run build:all` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**Important:** Don't change these! They're already configured in `vercel.json`.

---

## Step 3: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes ⏳
3. Click the deployment URL
4. Test: Visit `https://your-url.vercel.app/#merge`

✅ **Done!**

---

## What Happens During Build?

```bash
npm run build:all
  ↓
build-vercel.sh
  ↓
1. Build app-spa (React + Vite) → dist/
2. Build website (Astro) → website/dist/
3. Merge: Copy website files into dist/
  ↓
dist/ (ready for deployment)
```

---

## Verify Deployment

After deployment, test these URLs:

| URL | Expected Result |
|-----|----------------|
| `/` | Homepage (React app) |
| `/#merge` | Merge PDF tool |
| `/merge-pdf` | SEO landing page |
| `/split-pdf` | SEO landing page |

---

## Add Custom Domain

1. Project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `localpdf.online`)
4. Follow DNS instructions
5. SSL certificate auto-provisions ✅

---

## Environment Variables (Optional)

If you need analytics or tracking:

1. Project → **Settings** → **Environment Variables**
2. Add variables:

```
VITE_PRODUCTION_URL=https://your-domain.com
VITE_GA_ID=G-XXXXXXXXXX  (optional)
```

3. Redeploy (automatic)

---

## Troubleshooting

### Build fails?
- Check build logs in Vercel dashboard
- Run `npm run build:all` locally to test
- See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for details

### SEO pages 404?
- Check `dist/merge-pdf/index.html` exists after build
- Verify `vercel.json` routes are correct

### App doesn't load?
- Check browser console for errors
- Verify `dist/index.html` exists
- Test hash routing: `/#merge`

---

## Next Steps

- ✅ Add custom domain
- ✅ Submit sitemap to Google Search Console
- ✅ Enable Vercel Analytics
- ✅ Monitor performance with PageSpeed Insights

---

**Full Documentation:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

**Need Help?** Open an issue on GitHub

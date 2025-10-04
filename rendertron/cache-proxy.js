/**
 * GCS Cache Proxy for Rendertron
 *
 * Wraps Rendertron with Google Cloud Storage caching:
 * 1. Check GCS for cached version
 * 2. If found -> return immediately (~200ms)
 * 3. If not found -> render with Rendertron (~5s) -> save to GCS
 */

const { Storage } = require('@google-cloud/storage');
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const storage = new Storage();

const CONFIG = {
  bucketName: 'localpdf-pro-rendertron-cache',
  cachePrefix: 'cache/',
  rendertronUrl: 'http://localhost:3000', // Rendertron running locally
  cacheTTL: 86400, // 24 hours in seconds
  port: 8080
};

/**
 * Generate cache key from URL
 */
function getCacheKey(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Extract language
    const langMatch = pathname.match(/^\/([a-z]{2})\//);
    const language = langMatch ? langMatch[1] : 'en';
    const cleanPath = langMatch ? pathname.replace(/^\/[a-z]{2}/, '') : pathname;

    // Convert /merge-pdf to merge-pdf.html
    const filename = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\//, '').replace(/\/$/, '') + '.html';

    return `${CONFIG.cachePrefix}${language}/${filename}`;
  } catch (error) {
    console.error('Error generating cache key:', error);
    return null;
  }
}

/**
 * Check if cached version exists in GCS
 */
async function getCachedContent(cacheKey) {
  try {
    const bucket = storage.bucket(CONFIG.bucketName);
    const file = bucket.file(cacheKey);

    const [exists] = await file.exists();
    if (!exists) {
      return null;
    }

    // Check if cache is still fresh (24 hours)
    const [metadata] = await file.getMetadata();
    const ageInSeconds = (Date.now() - new Date(metadata.timeCreated)) / 1000;

    if (ageInSeconds > CONFIG.cacheTTL) {
      console.log(`Cache expired for ${cacheKey} (age: ${Math.round(ageInSeconds)}s)`);
      return null;
    }

    // Download cached content
    const [content] = await file.download();
    console.log(`✅ Cache HIT: ${cacheKey} (age: ${Math.round(ageInSeconds)}s)`);

    return content.toString('utf-8');
  } catch (error) {
    console.error('Error reading from cache:', error.message);
    return null;
  }
}

/**
 * Save rendered content to GCS cache
 */
async function saveCachedContent(cacheKey, html) {
  try {
    const bucket = storage.bucket(CONFIG.bucketName);
    const file = bucket.file(cacheKey);

    await file.save(html, {
      contentType: 'text/html; charset=utf-8',
      metadata: {
        cacheControl: 'public, max-age=86400',
        custom: {
          cachedAt: new Date().toISOString()
        }
      }
    });

    console.log(`💾 Cache SAVE: ${cacheKey} (${html.length} bytes)`);
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error.message);
    return false;
  }
}

/**
 * Render URL with Rendertron
 */
async function renderWithRendertron(url) {
  const rendertronUrl = `${CONFIG.rendertronUrl}/render/${encodeURIComponent(url)}`;

  console.log(`🤖 Rendering with Rendertron: ${url}`);

  const response = await fetch(rendertronUrl, {
    headers: {
      'User-Agent': 'Rendertron-Cache-Proxy'
    },
    timeout: 30000
  });

  if (!response.ok) {
    throw new Error(`Rendertron returned ${response.status}`);
  }

  const html = await response.text();
  console.log(`✅ Rendered successfully: ${html.length} bytes`);

  return html;
}

/**
 * Main handler
 */
app.get('/render/*', async (req, res) => {
  const startTime = Date.now();

  try {
    // Extract target URL from path: /render/https://example.com/page
    const targetUrl = req.params[0];

    if (!targetUrl) {
      return res.status(400).send('Missing URL parameter');
    }

    console.log(`\n📥 Request: ${targetUrl}`);

    // Generate cache key
    const cacheKey = getCacheKey(targetUrl);

    if (!cacheKey) {
      throw new Error('Invalid URL for caching');
    }

    // Step 1: Check cache
    const cachedHtml = await getCachedContent(cacheKey);

    if (cachedHtml) {
      // Cache HIT - return immediately
      const responseTime = Date.now() - startTime;
      console.log(`⚡ Response time: ${responseTime}ms (from cache)`);

      return res
        .set('Content-Type', 'text/html; charset=utf-8')
        .set('X-Cache-Status', 'HIT')
        .set('X-Cache-Key', cacheKey)
        .set('X-Renderer', 'rendertron-cached')
        .set('X-Response-Time', `${responseTime}ms`)
        .send(cachedHtml);
    }

    // Step 2: Cache MISS - render with Rendertron
    console.log(`❌ Cache MISS: ${cacheKey}`);

    const html = await renderWithRendertron(targetUrl);

    // Step 3: Save to cache (fire-and-forget)
    saveCachedContent(cacheKey, html).catch(err => {
      console.error('Background cache save failed:', err);
    });

    // Step 4: Return rendered HTML
    const responseTime = Date.now() - startTime;
    console.log(`⚡ Response time: ${responseTime}ms (rendered + cached)`);

    return res
      .set('Content-Type', 'text/html; charset=utf-8')
      .set('X-Cache-Status', 'MISS')
      .set('X-Cache-Key', cacheKey)
      .set('X-Renderer', 'rendertron')
      .set('X-Response-Time', `${responseTime}ms`)
      .send(html);

  } catch (error) {
    console.error('❌ Error:', error.message);

    return res
      .status(500)
      .set('X-Cache-Status', 'ERROR')
      .send(`Rendering error: ${error.message}`);
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'rendertron-cache-proxy',
    bucket: CONFIG.bucketName,
    cacheTTL: CONFIG.cacheTTL
  });
});

// Start server
const PORT = CONFIG.port;
app.listen(PORT, () => {
  console.log(`🚀 Rendertron Cache Proxy running on port ${PORT}`);
  console.log(`📦 GCS Bucket: ${CONFIG.bucketName}`);
  console.log(`⏰ Cache TTL: ${CONFIG.cacheTTL}s (24 hours)`);
});

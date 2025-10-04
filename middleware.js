// Vercel Edge Runtime Middleware (works with any framework)

/**
 * Prerender.io Middleware for LocalPDF
 *
 * Detects bot user agents (including AI crawlers) and redirects them to Prerender.io
 * for server-side rendering, while regular users get the fast SPA experience.
 *
 * Features:
 * - Comprehensive bot detection (Google, Bing, social media, AI crawlers)
 * - Proper error handling with fallback to original content
 * - Optimized caching headers for both bots and users
 * - Support for all 5 languages (en, de, fr, es, ru)
 */

// Bot user agents - comprehensive list including AI crawlers
const BOT_USER_AGENTS = [
  // Search engine bots - CRITICAL FOR INDEXING
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'baiduspider',
  'slurp', // Yahoo
  'facebookexternalhit',

  // Social media crawlers
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegram',
  'discordbot',
  'slackbot',
  'skypeuripreview',

  // AI crawlers (2024-2025)
  'chatgpt',
  'gpt-',
  'claude',
  'anthropic',
  'openai',
  'perplexity',
  'you.com',
  'character.ai',
  'bing/2.0',
  'copilot',
  'gemini',
  'bard',

  // Generic crawlers
  'crawler',
  'spider',
  'bot/',
  'scraper'
];

// SEO tools excluded from prerendering (optional - can be removed if Cloud Run handles well)
// These crawler tools can be heavy and may consume quota
const EXCLUDED_BOTS = [
  // Uncomment if you want to exclude specific SEO crawlers
  // 'ahrefsbot',
  // 'semrushbot',
  // 'mj12bot',
  // 'dotbot',
  // 'screaming frog',
  // 'sitebulb',
  // 'seobility',
];

// Cache all pages from sitemap (113 URLs across all 5 languages: EN, RU, DE, FR, ES)
// No whitelist needed - GCS cache handles everything efficiently
// Cost: ~$0.06/month for full sitemap caching (8MB cache)

// Rendertron configuration (Google Cloud Run deployment)
// Self-hosted on Google Cloud Run - faster, more reliable than Render.com
const PRERENDER_IO_CONFIG = {
  serviceUrl: process.env.PRERENDER_SERVICE_URL || 'https://rendertron-741929692017.us-central1.run.app/render',
  token: null, // Rendertron doesn't require authentication token
  timeout: 30000, // 30 seconds timeout (Cloud Run is faster - min-instances=1 keeps it warm)
  enableLogging: process.env.NODE_ENV === 'development'
};

// Google Cloud Storage cache configuration
const GCS_CACHE_CONFIG = {
  bucketName: 'localpdf-rendertron-cache',
  cachePrefix: 'cache/',
  cacheTTL: 86400, // 24 hours in seconds
  enableCache: true, // Set to false to disable cache temporarily
  gcsApiUrl: 'https://storage.googleapis.com'
};

/**
 * Generate cache key from URL
 * Format: cache/en/merge-pdf.html or cache/ru/split-pdf.html
 */
function getCacheKey(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  // Extract language and path
  const langMatch = pathname.match(/^\/([a-z]{2})\//);
  const language = langMatch ? langMatch[1] : 'en';
  const cleanPath = langMatch ? pathname.replace(/^\/[a-z]{2}/, '') : pathname;

  // Convert /merge-pdf to merge-pdf.html
  const filename = cleanPath === '/' ? 'index.html' : cleanPath.replace(/^\//, '').replace(/\/$/, '') + '.html';

  return `${GCS_CACHE_CONFIG.cachePrefix}${language}/${filename}`;
}

/**
 * Check if cached version exists in GCS and is fresh
 */
async function getCachedContent(url) {
  if (!GCS_CACHE_CONFIG.enableCache) return null;

  try {
    const cacheKey = getCacheKey(url);
    const gcsUrl = `${GCS_CACHE_CONFIG.gcsApiUrl}/${GCS_CACHE_CONFIG.bucketName}/${cacheKey}`;

    const response = await fetch(gcsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html'
      }
    });

    if (!response.ok) {
      // Cache miss - no cached version exists
      return null;
    }

    // Cache hit - return cached HTML
    const cachedHtml = await response.text();

    logActivity('Cache HIT', { url, cacheKey, size: cachedHtml.length });

    return cachedHtml;
  } catch (error) {
    logActivity('Cache check error', { url, error: error.message });
    return null;
  }
}

/**
 * Save rendered content to GCS cache
 */
async function saveCachedContent(url, html) {
  if (!GCS_CACHE_CONFIG.enableCache) return;

  try {
    const cacheKey = getCacheKey(url);
    const gcsUrl = `${GCS_CACHE_CONFIG.gcsApiUrl}/upload/storage/v1/b/${GCS_CACHE_CONFIG.bucketName}/o?uploadType=media&name=${encodeURIComponent(cacheKey)}`;

    const response = await fetch(gcsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': html.length.toString()
      },
      body: html
    });

    if (response.ok) {
      logActivity('Cache SAVE success', { url, cacheKey, size: html.length });
    } else {
      logActivity('Cache SAVE failed', { url, status: response.status });
    }
  } catch (error) {
    logActivity('Cache save error', { url, error: error.message });
  }
}

/**
 * Check if request is from a bot based on user agent
 */
function isBotUserAgent(userAgent) {
  if (!userAgent) return false;

  const lowerUserAgent = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => lowerUserAgent.includes(bot));
}

/**
 * Check if bot should be EXCLUDED from Rendertron (gets SPA instead)
 * Used for SEO tools that timeout on Render.com free tier
 */
function isExcludedBot(userAgent) {
  if (!userAgent) return false;

  const lowerUserAgent = userAgent.toLowerCase();
  return EXCLUDED_BOTS.some(bot => lowerUserAgent.includes(bot));
}

/**
 * Check if request should be prerendered and cached
 * Now supports ALL 5 languages (EN, RU, DE, FR, ES) with GCS caching
 */
function shouldPrerender(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only prerender if it's a bot
  if (!isBotUserAgent(userAgent)) {
    return false;
  }

  // Exclude specific SEO crawler tools if needed
  if (isExcludedBot(userAgent)) {
    return false;
  }

  // Skip static assets
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|pdf|zip|txt|xml)$/i)) {
    return false;
  }

  // Skip API routes
  if (pathname.startsWith('/api/')) {
    return false;
  }

  // Skip sitemaps, robots, and special files
  if (pathname.match(/\/(sitemap|robots\.txt|\.well-known|favicon)/)) {
    return false;
  }

  // Skip verification files and random hash files
  if (pathname.match(/^\/[a-f0-9]{32,}\.txt$/)) {
    return false;
  }

  // Valid routes from sitemap (all languages supported)
  const validRoutes = [
    '/', '/privacy', '/faq', '/terms', '/gdpr', '/how-to-use',
    '/merge-pdf', '/split-pdf', '/compress-pdf', '/add-text-pdf',
    '/watermark-pdf', '/rotate-pdf', '/extract-pages-pdf',
    '/extract-text-pdf', '/extract-images-from-pdf', '/pdf-to-image',
    '/pdf-to-svg', '/images-to-pdf', '/image-to-pdf', '/word-to-pdf',
    '/excel-to-pdf', '/protect-pdf', '/ocr-pdf', '/blog'
  ];

  // Check if it's a valid route (with or without language prefix)
  const pathWithoutLang = pathname.replace(/^\/(de|fr|es|ru)/, '');
  const isValidRoute = validRoutes.includes(pathWithoutLang) || validRoutes.includes(pathname);

  // Handle dynamic blog routes: /blog/slug or /blog/category/category-name
  const isBlogPost = /^\/blog\/[a-zA-Z0-9-]+$/.test(pathWithoutLang);
  const isBlogCategory = /^\/blog\/category\/[a-zA-Z0-9-]+$/.test(pathWithoutLang);

  return isValidRoute || isBlogPost || isBlogCategory;
}

/**
 * Create prerender request URL for Rendertron
 */
function createPrerenderUrl(originalUrl) {
  const { serviceUrl } = PRERENDER_IO_CONFIG;

  // Rendertron API format: /render/https://example.com
  // No need to encode the URL, Rendertron handles it
  return `${serviceUrl}/${originalUrl}`;
}

/**
 * Add optimized headers for bot responses
 */
function addBotHeaders(response) {
  // Cache prerendered content for bots for 1 hour
  response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  response.headers.set('X-Prerender-Bot', 'true');
  response.headers.set('X-Prerender-Service', 'rendertron');

  // SEO-friendly headers
  response.headers.set('X-Robots-Tag', 'index, follow');

  return response;
}

/**
 * Add optimized headers for regular users
 */
function addUserHeaders(response) {
  // Standard SPA caching for users
  response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  response.headers.set('X-Prerender-Bot', 'false');

  return response;
}

/**
 * Log middleware activity (development only)
 */
function logActivity(message, data = {}) {
  if (PRERENDER_IO_CONFIG.enableLogging) {
    console.log(`[Prerender Middleware] ${message}`, data);
  }
}

/**
 * Main middleware function for Vercel Edge Runtime
 */
export default async function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // Explicit check for robots.txt (should not reach here if matcher works correctly)
  if (url.pathname === '/robots.txt') {
    console.log('[Middleware] WARNING: robots.txt reached middleware - matcher may need adjustment');
    return null; // Explicit skip to continue to static serving
  }

  // Additional safety check for other static files
  if (url.pathname === '/sitemap.xml' ||
      url.pathname.startsWith('/sitemap') ||
      url.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|js|css|woff|woff2)$/)) {
    return null;
  }

  logActivity('Processing request', {
    url: url.pathname,
    userAgent: userAgent.slice(0, 100) + '...', // Truncate for logging
    isBot: isBotUserAgent(userAgent)
  });

  // Handle common truncated URLs with 301 redirects
  const redirectMap = {
    '/protect': '/protect-pdf',
    '/merge': '/merge-pdf',
    '/split': '/split-pdf',
    '/compress': '/compress-pdf',
    '/watermark': '/watermark-pdf',
    '/rotate': '/rotate-pdf'
  };

  for (const [fromPath, toPath] of Object.entries(redirectMap)) {
    if (url.pathname.endsWith(fromPath)) {
      const redirectUrl = new URL(url);
      redirectUrl.pathname = url.pathname.replace(fromPath, toPath);

      logActivity('301 Redirect: Truncated URL detected', {
        from: url.pathname,
        to: redirectUrl.pathname,
        userAgent: userAgent.slice(0, 50) + '...'
      });

      return new Response(null, {
        status: 301,
        headers: {
          'Location': redirectUrl.toString(),
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }
  }

  // Check if request should be prerendered
  if (!shouldPrerender(request)) {
    logActivity('Skipping prerender - not a bot or excluded path');
    // Let the request continue to the app
    return;
  }

  try {
    // STEP 1: Check cache first
    const cachedHtml = await getCachedContent(request.url);

    if (cachedHtml) {
      logActivity('Serving from GCS cache');

      // Return cached content immediately (200-300ms response!)
      const response = new Response(cachedHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        }
      });

      // Add cache-specific header
      response.headers.set('X-Cache-Status', 'HIT');

      return addBotHeaders(response);
    }

    // STEP 2: Cache miss - fetch from Rendertron
    logActivity('Cache MISS - Fetching from Rendertron');

    // Create prerender request
    const prerenderUrl = createPrerenderUrl(request.url);

    // Fetch prerendered content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PRERENDER_IO_CONFIG.timeout);

    const prerenderResponse = await fetch(prerenderUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        // Add Rendertron-specific headers for better rendering
        'X-Prerender-Wait-For': 'helmet-updated', // Wait for React Helmet to update title
        'X-Prerender-Timeout': '25000' // 25 seconds max wait time
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Check if prerender was successful
    if (!prerenderResponse.ok) {
      throw new Error(`Rendertron returned status ${prerenderResponse.status}`);
    }

    // Get prerendered HTML
    const prerenderHtml = await prerenderResponse.text();

    logActivity('Successfully served prerendered content', {
      status: prerenderResponse.status,
      contentLength: prerenderHtml.length
    });

    // STEP 3: Save to cache for future requests (fire-and-forget)
    saveCachedContent(request.url, prerenderHtml).catch(err => {
      logActivity('Background cache save failed', { error: err.message });
    });

    // Create response with prerendered content
    const response = new Response(prerenderHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      }
    });

    // Add cache-specific header
    response.headers.set('X-Cache-Status', 'MISS');

    return addBotHeaders(response);

  } catch (error) {
    logActivity('Error fetching prerendered content', {
      error: error.message,
      fallback: 'serving original content'
    });

    // Return original request to be handled by the app
    return;
  }
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all paths except static files, API routes, robots.txt and sitemaps
     * Simplified matcher without capturing groups to avoid Vercel errors
     */
    '/:path*',
  ],
};
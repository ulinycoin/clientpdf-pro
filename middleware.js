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

// Scheduled Rendering Whitelist for Prerender.io
// Only these paths will be eligible for scheduled rendering (EN + RU only)
const SCHEDULED_RENDERING_WHITELIST = [
  // Tier 1: Critical (every 2 days)
  '/',
  '/merge-pdf',
  '/split-pdf',
  '/compress-pdf',
  '/protect-pdf',
  '/ocr-pdf',

  // Tier 2: Standard (every 3 days)
  '/add-text-pdf',
  '/watermark-pdf',
  '/pdf-to-image',
  '/images-to-pdf',
  '/word-to-pdf',
  '/excel-to-pdf',
  '/rotate-pdf',
  '/extract-pages-pdf',
  '/extract-text-pdf',
  '/extract-images-from-pdf',
  '/pdf-to-svg',

  // Tier 3: Blog (every 5 days)
  '/blog',
  '/blog/complete-guide-pdf-merging-2025',
  '/blog/pdf-compression-guide',
  '/blog/protect-pdf-guide',
];

// Supported languages for scheduled rendering (EN + RU only)
const SCHEDULED_RENDERING_LANGUAGES = ['en', 'ru'];

// Rendertron configuration (Google Cloud Run deployment)
// Self-hosted on Google Cloud Run - faster, more reliable than Render.com
const PRERENDER_IO_CONFIG = {
  serviceUrl: process.env.PRERENDER_SERVICE_URL || 'https://rendertron-741929692017.us-central1.run.app/render',
  token: null, // Rendertron doesn't require authentication token
  timeout: 30000, // 30 seconds timeout (Cloud Run is faster - min-instances=1 keeps it warm)
  enableLogging: process.env.NODE_ENV === 'development'
};

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
 * Check if path is eligible for scheduled rendering
 * Only EN and RU languages are supported for scheduled rendering
 */
function isScheduledRenderingEligible(pathname) {
  // Extract language and clean path
  const langMatch = pathname.match(/^\/([a-z]{2})\//);
  const language = langMatch ? langMatch[1] : 'en'; // default to 'en' for root paths
  const cleanPath = langMatch ? pathname.replace(/^\/[a-z]{2}/, '') : pathname;

  // Check if language is supported for scheduled rendering
  if (!SCHEDULED_RENDERING_LANGUAGES.includes(language)) {
    return false;
  }

  // Check if path is in whitelist
  return SCHEDULED_RENDERING_WHITELIST.includes(cleanPath);
}

/**
 * Check if request should be prerendered
 */
function shouldPrerender(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Only prerender if it's a bot
  if (!isBotUserAgent(userAgent)) {
    return false;
  }

  // CRITICAL FIX: Exclude SEO tools that timeout on Rendertron
  // AhrefsBot, SEMrush, etc. get 504 errors on Render.com free tier
  // They will get SPA instead (better than 504 timeout!)
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

  // NEW: Check scheduled rendering whitelist for EN + RU only
  // This implements the plan: only 42 critical pages for EN + RU get scheduled rendering
  if (isScheduledRenderingEligible(pathname)) {
    return true;
  }

  // Fallback: Allow other valid routes for other languages (DE, FR, ES)
  // but only for real-time bot requests (not scheduled rendering)
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
    isBot: isBotUserAgent(userAgent),
    scheduledRenderingEligible: isScheduledRenderingEligible(url.pathname)
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
    logActivity('Fetching prerendered content from Rendertron');

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

    // Create response with prerendered content
    const response = new Response(prerenderHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      }
    });

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
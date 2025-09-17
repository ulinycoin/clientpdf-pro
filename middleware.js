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
  // Search engine bots
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

  // SEO and monitoring tools
  'ahrefsbot',
  'semrushbot',
  'mj12bot',
  'dotbot',
  'screaming frog',
  'sitebulb',
  'seobility',

  // Generic crawlers
  'crawler',
  'spider',
  'bot/',
  'scraper'
];

// Prerender.io configuration
const PRERENDER_IO_CONFIG = {
  serviceUrl: process.env.PRERENDER_IO_SERVICE_URL || 'https://service.prerender.io',
  token: process.env.PRERENDER_IO_TOKEN,
  timeout: 10000, // 10 seconds timeout
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

  // Allow blog URLs for prerendering
  // Blog posts are available in blogPosts.ts and should be prerendered for SEO

  // Skip verification files and random hash files
  if (pathname.match(/^\/[a-f0-9]{32,}\.txt$/)) {
    return false;
  }

  // Only allow known good routes
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
 * Create prerender request URL
 */
function createPrerenderUrl(originalUrl) {
  const { serviceUrl, token } = PRERENDER_IO_CONFIG;

  if (!token) {
    throw new Error('PRERENDER_IO_TOKEN environment variable is required');
  }

  // Encode the URL properly for Prerender.io
  const encodedUrl = encodeURIComponent(originalUrl);
  return `${serviceUrl}/${encodedUrl}`;
}

/**
 * Add optimized headers for bot responses
 */
function addBotHeaders(response) {
  // Cache prerendered content for bots for 1 hour
  response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  response.headers.set('X-Prerender-Bot', 'true');
  response.headers.set('X-Prerender-Service', 'prerender.io');

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

  // Check if Prerender.io token is configured
  if (!PRERENDER_IO_CONFIG.token) {
    logActivity('WARNING: PRERENDER_IO_TOKEN not configured, serving original content');
    // Let the request continue to the app
    return;
  }

  try {
    logActivity('Fetching prerendered content from Prerender.io');

    // Create prerender request
    const prerenderUrl = createPrerenderUrl(request.url);

    // Fetch prerendered content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PRERENDER_IO_CONFIG.timeout);

    const prerenderResponse = await fetch(prerenderUrl, {
      headers: {
        'X-Prerender-Token': PRERENDER_IO_CONFIG.token,
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Check if prerender was successful
    if (!prerenderResponse.ok) {
      throw new Error(`Prerender.io returned status ${prerenderResponse.status}`);
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
     * Simple matchers for Vercel Edge Runtime
     * Let the middleware handle filtering logic internally
     */
    '/',
    '/:path*',
  ],
};
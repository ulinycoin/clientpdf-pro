// Service Worker for LocalPDF - Performance Optimization & Caching
// Version 2.0 - Modern caching strategies for PDF tools

const CACHE_VERSION = 'localpdf-v2.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGES_CACHE = `${CACHE_VERSION}-images`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Core CSS and JS will be cached dynamically
];

// PDF tool pages to cache for offline use
const PDF_TOOL_PAGES = [
  '/merge-pdf',
  '/split-pdf', 
  '/compress-pdf',
  '/add-text-pdf',
  '/watermark-pdf',
  '/rotate-pdf',
  '/extract-pages-pdf',
  '/extract-text-pdf',
  '/pdf-to-image',
  '/images-to-pdf',
  '/word-to-pdf',
  '/excel-to-pdf',
  '/ocr-pdf'
];

// Maximum cache sizes
const CACHE_LIMITS = {
  [STATIC_CACHE]: 50,
  [DYNAMIC_CACHE]: 30,
  [IMAGES_CACHE]: 20
};

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v2.0');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v2.0');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('localpdf-') && 
                     !cacheName.includes(CACHE_VERSION);
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests and non-GET requests
  if (!url.origin.includes(self.location.origin) || request.method !== 'GET') {
    return;
  }
  
  // Different strategies for different types of requests
  if (isStaticAsset(url.pathname)) {
    event.respondWith(staticAssetStrategy(request));
  } else if (isImageRequest(url.pathname)) {
    event.respondWith(imageStrategy(request));
  } else if (isPDFToolPage(url.pathname)) {
    event.respondWith(toolPageStrategy(request));
  } else {
    event.respondWith(networkFirstStrategy(request));
  }
});

// Cache strategies

// Static assets - Cache first with fallback
async function staticAssetStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
      await trimCache(STATIC_CACHE);
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Static asset strategy failed:', error);
    // Return offline page if available
    return caches.match('/') || new Response('Offline');
  }
}

// Images - Cache first with long-term storage
async function imageStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGES_CACHE);
      cache.put(request, networkResponse.clone());
      await trimCache(IMAGES_CACHE);
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Image strategy failed:', error);
    return new Response('Image not available offline', { status: 404 });
  }
}

// PDF tool pages - Network first with cache fallback
async function toolPageStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      await trimCache(DYNAMIC_CACHE);
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return main page as fallback for SPA routing
    return caches.match('/') || new Response('Tool not available offline');
  }
}

// Network first strategy for dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      await trimCache(DYNAMIC_CACHE);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Content not available offline');
  }
}

// Helper functions

function isStaticAsset(pathname) {
  return /\.(js|css|woff2?|ttf|eot)$/.test(pathname) || 
         pathname === '/' || 
         pathname === '/index.html' ||
         pathname === '/manifest.json';
}

function isImageRequest(pathname) {
  return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(pathname);
}

function isPDFToolPage(pathname) {
  // Handle both root and language-prefixed routes
  const normalizedPath = pathname.replace(/^\/(de|fr|es|ru)/, '');
  return PDF_TOOL_PAGES.includes(normalizedPath);
}

// Trim cache to stay within limits
async function trimCache(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const limit = CACHE_LIMITS[cacheName];
  
  if (keys.length > limit) {
    const deletePromises = keys
      .slice(0, keys.length - limit)
      .map(key => cache.delete(key));
    await Promise.all(deletePromises);
  }
}

// Background sync for analytics and usage tracking
self.addEventListener('sync', (event) => {
  if (event.tag === 'usage-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Placeholder for future analytics implementation
  console.log('[SW] Background sync for analytics');
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        actions: data.actions || []
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// Performance monitoring
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0
};

// Log performance metrics periodically
setInterval(() => {
  if (performanceMetrics.networkRequests > 0) {
    console.log('[SW] Performance metrics:', {
      cacheHitRate: (performanceMetrics.cacheHits / performanceMetrics.networkRequests * 100).toFixed(2) + '%',
      ...performanceMetrics
    });
    
    // Reset metrics
    performanceMetrics = { cacheHits: 0, cacheMisses: 0, networkRequests: 0 };
  }
}, 300000); // Every 5 minutes
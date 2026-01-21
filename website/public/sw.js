const CACHE_NAME = 'localpdf-v3.2.0';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/app/index.html',
    '/manifest.json',
    '/logos/localpdf-favicon-16x16.png',
    '/logos/localpdf-pwa-192x192.png',
    '/logos/localpdf-pwa-512x512.png'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response; // Return from cache
            }

            return fetch(event.request).then((fetchResponse) => {
                // Don't cache non-successful responses or non-static assets on the fly for now
                // to avoid filling up storage with large PDF files if handled via URL
                if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                    return fetchResponse;
                }

                // Optional: Cache new static assets dynamically (e.g., icons, fonts)
                const url = new URL(event.request.url);
                if (url.pathname.includes('/assets/') || url.pathname.includes('/logos/')) {
                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }

                return fetchResponse;
            });
        }).catch(() => {
            // Offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html') || caches.match('/app/index.html');
            }
        })
    );
});

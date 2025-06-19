/**
 * LocalPDF Service Worker
 * 
 * Обеспечивает офлайн функциональность и кеширование ресурсов.
 * Поддерживает app shell pattern для мгновенной загрузки UI.
 */

const CACHE_NAME = 'localpdf-v1.0.0';
const STATIC_CACHE = 'localpdf-static-v1.0.0';
const DYNAMIC_CACHE = 'localpdf-dynamic-v1.0.0';

// Ресурсы для кеширования (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.ico',
  // Добавятся автоматически при сборке
];

// CDN ресурсы для кеширования
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

// Стратегии кеширования
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
};

// Правила кеширования для разных типов ресурсов
const CACHE_RULES = [
  {
    pattern: /\.(js|css|woff2|woff|ttf)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
  },
  {
    pattern: /\.(png|jpg|jpeg|gif|svg|ico)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
  },
  {
    pattern: /\.html$/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 24 * 60 * 60 * 1000, // 1 день
  },
  {
    pattern: /\/api\//,
    strategy: CACHE_STRATEGIES.NETWORK_ONLY,
  }
];

/**
 * Установка Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      cacheStaticAssets(),
      cacheCDNAssets()
    ]).then(() => {
      console.log('✅ Service Worker installed successfully');
      // Принудительно активировать новый SW
      return self.skipWaiting();
    }).catch((error) => {
      console.error('❌ Service Worker installation failed:', error);
    })
  );
});

/**
 * Активация Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      claimClients()
    ]).then(() => {
      console.log('✅ Service Worker activated successfully');
    }).catch((error) => {
      console.error('❌ Service Worker activation failed:', error);
    })
  );
});

/**
 * Обработка fetch запросов
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем non-GET запросы
  if (request.method !== 'GET') {
    return;
  }

  // Пропускаем chrome-extension и webkit запросы
  if (url.protocol.startsWith('chrome-extension') || 
      url.protocol.startsWith('webkit')) {
    return;
  }

  event.respondWith(handleFetchRequest(request));
});

/**
 * Обработка сообщений от main thread
 */
self.addEventListener('message', (event) => {
  const { data } = event;
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PRELOAD_ASSETS':
      preloadAssets(data.assets).then(() => {
        event.ports[0].postMessage({ type: 'ASSETS_PRELOADED' });
      });
      break;
  }
});

/**
 * Кеширует статические ресурсы
 */
async function cacheStaticAssets() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    
    // Получаем манифест сборки для актуальных путей
    const assetsToCache = await getAssetPaths();
    
    await cache.addAll(assetsToCache);
    console.log(`📦 Cached ${assetsToCache.length} static assets`);
  } catch (error) {
    console.error('❌ Failed to cache static assets:', error);
  }
}

/**
 * Кеширует CDN ресурсы
 */
async function cacheCDNAssets() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    
    for (const asset of CDN_ASSETS) {
      try {
        await cache.add(asset);
      } catch (error) {
        console.warn(`⚠️ Failed to cache CDN asset: ${asset}`, error);
      }
    }
    
    console.log(`🌐 Cached ${CDN_ASSETS.length} CDN assets`);
  } catch (error) {
    console.error('❌ Failed to cache CDN assets:', error);
  }
}

/**
 * Получает пути ресурсов для кеширования
 */
async function getAssetPaths() {
  const baseAssets = [...STATIC_ASSETS];
  
  try {
    // Пытаемся получить манифест Vite
    const manifestResponse = await fetch('/manifest.json');
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      // Добавляем ресурсы из манифеста
      if (manifest.src) {
        baseAssets.push(manifest.src);
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not load manifest, using base assets only');
  }
  
  return baseAssets;
}

/**
 * Обрабатывает fetch запрос согласно стратегии кеширования
 */
async function handleFetchRequest(request) {
  const url = new URL(request.url);
  
  // Определяем стратегию кеширования
  const rule = findCacheRule(url.pathname);
  
  switch (rule.strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, rule);
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, rule);
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, rule);
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
      
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request);
      
    default:
      return networkFirst(request, rule);
  }
}

/**
 * Находит правило кеширования для URL
 */
function findCacheRule(pathname) {
  for (const rule of CACHE_RULES) {
    if (rule.pattern.test(pathname)) {
      return rule;
    }
  }
  
  // Дефолтное правило
  return {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 24 * 60 * 60 * 1000
  };
}

/**
 * Стратегия Cache First
 */
async function cacheFirst(request, rule) {
  try {
    const cachedResponse = await getCachedResponse(request, rule);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    await cacheResponse(request, networkResponse.clone(), rule);
    return networkResponse;
  } catch (error) {
    return handleFetchError(request, error);
  }
}

/**
 * Стратегия Network First
 */
async function networkFirst(request, rule) {
  try {
    const networkResponse = await fetch(request);
    await cacheResponse(request, networkResponse.clone(), rule);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await getCachedResponse(request, rule);
    if (cachedResponse) {
      return cachedResponse;
    }
    return handleFetchError(request, error);
  }
}

/**
 * Стратегия Stale While Revalidate
 */
async function staleWhileRevalidate(request, rule) {
  const cachedResponse = await getCachedResponse(request, rule);
  
  // Асинхронно обновляем кеш
  fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cacheResponse(request, networkResponse.clone(), rule);
    }
  }).catch(error => {
    console.warn('Background fetch failed:', error);
  });
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Если нет кешированной версии, ждем сеть
  try {
    const networkResponse = await fetch(request);
    await cacheResponse(request, networkResponse.clone(), rule);
    return networkResponse;
  } catch (error) {
    return handleFetchError(request, error);
  }
}

/**
 * Стратегия Cache Only
 */
async function cacheOnly(request) {
  const cachedResponse = await getCachedResponse(request, {});
  if (cachedResponse) {
    return cachedResponse;
  }
  
  return new Response('Not found in cache', { 
    status: 404,
    statusText: 'Not Found'
  });
}

/**
 * Получает ответ из кеша с проверкой срока действия
 */
async function getCachedResponse(request, rule) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (!cachedResponse) {
    return null;
  }
  
  // Проверяем срок действия
  if (rule.maxAge) {
    const dateHeader = cachedResponse.headers.get('date');
    if (dateHeader) {
      const cachedDate = new Date(dateHeader).getTime();
      const now = Date.now();
      
      if (now - cachedDate > rule.maxAge) {
        // Кеш устарел
        await cache.delete(request);
        return null;
      }
    }
  }
  
  return cachedResponse;
}

/**
 * Кеширует ответ
 */
async function cacheResponse(request, response, rule) {
  if (!response.ok) {
    return;
  }
  
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.put(request, response);
  } catch (error) {
    console.warn('Failed to cache response:', error);
  }
}

/**
 * Обрабатывает ошибки fetch
 */
function handleFetchError(request, error) {
  console.error('Fetch error:', error);
  
  // Возвращаем офлайн страницу для навигационных запросов
  if (request.mode === 'navigate') {
    return caches.match('/index.html');
  }
  
  return new Response('Network error', {
    status: 500,
    statusText: 'Network Error'
  });
}

/**
 * Очищает старые кеши
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const currentCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE];
  
  const deletePromises = cacheNames
    .filter(cacheName => !currentCaches.includes(cacheName))
    .map(cacheName => caches.delete(cacheName));
  
  await Promise.all(deletePromises);
  console.log(`🧹 Cleaned up ${deletePromises.length} old caches`);
}

/**
 * Заявляет контроль над всеми клиентами
 */
async function claimClients() {
  return self.clients.claim();
}

/**
 * Получает размер всех кешей
 */
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const responseBlob = await response.blob();
        totalSize += responseBlob.size;
      }
    }
  }
  
  return totalSize;
}

/**
 * Очищает все кеши
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
  await Promise.all(deletePromises);
  console.log('🧹 All caches cleared');
}

/**
 * Предзагружает ресурсы
 */
async function preloadAssets(assets) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  const addPromises = assets.map(async (asset) => {
    try {
      await cache.add(asset);
    } catch (error) {
      console.warn(`Failed to preload asset: ${asset}`, error);
    }
  });
  
  await Promise.all(addPromises);
  console.log(`📦 Preloaded ${assets.length} assets`);
}

// Обработка push уведомлений (для будущего использования)
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey
    },
    actions: [
      {
        action: 'explore',
        title: 'Open LocalPDF',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/favicon.svg'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('🔧 LocalPDF Service Worker loaded');

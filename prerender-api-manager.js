#!/usr/bin/env node

/**
 * LocalPDF Prerender.io API Manager
 *
 * Автоматизирует настройку Scheduled Rendering для 42 критичных страниц
 * через API Prerender.io с поддержкой разных частот recache.
 *
 * Использование:
 * - Setup: node prerender-api-manager.js setup
 * - Status: node prerender-api-manager.js status
 * - Monitor: node prerender-api-manager.js monitor
 * - Clear: node prerender-api-manager.js clear-cache
 */

const https = require('https');
const url = require('url');

// Configuration
const CONFIG = {
  BASE_URL: 'https://localpdf.online',
  API_BASE: 'https://api.prerender.io',
  TOKEN: process.env.PRERENDER_IO_TOKEN,

  // Частоты recache (в часах)
  RECACHE_FREQUENCIES: {
    TIER_1: 48,  // Every 2 days
    TIER_2: 72,  // Every 3 days
    TIER_3: 120, // Every 5 days
  }
};

// URL Structure по тирам
const URL_TIERS = {
  TIER_1: {
    name: 'Critical Pages',
    frequency: CONFIG.RECACHE_FREQUENCIES.TIER_1,
    urls: [
      // English (6)
      '/',
      '/merge-pdf',
      '/split-pdf',
      '/compress-pdf',
      '/protect-pdf',
      '/ocr-pdf',

      // Russian (6)
      '/ru/',
      '/ru/merge-pdf',
      '/ru/split-pdf',
      '/ru/compress-pdf',
      '/ru/protect-pdf',
      '/ru/ocr-pdf'
    ]
  },

  TIER_2: {
    name: 'Standard Tools',
    frequency: CONFIG.RECACHE_FREQUENCIES.TIER_2,
    urls: [
      // English (11)
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

      // Russian (11)
      '/ru/add-text-pdf',
      '/ru/watermark-pdf',
      '/ru/pdf-to-image',
      '/ru/images-to-pdf',
      '/ru/word-to-pdf',
      '/ru/excel-to-pdf',
      '/ru/rotate-pdf',
      '/ru/extract-pages-pdf',
      '/ru/extract-text-pdf',
      '/ru/extract-images-from-pdf',
      '/ru/pdf-to-svg'
    ]
  },

  TIER_3: {
    name: 'Blog Posts',
    frequency: CONFIG.RECACHE_FREQUENCIES.TIER_3,
    urls: [
      // English (4)
      '/blog',
      '/blog/complete-guide-pdf-merging-2025',
      '/blog/pdf-compression-guide',
      '/blog/protect-pdf-guide',

      // Russian (4)
      '/ru/blog',
      '/ru/blog/complete-guide-pdf-merging-2025',
      '/ru/blog/pdf-compression-guide',
      '/ru/blog/protect-pdf-guide'
    ]
  }
};

// Utility Functions
function log(message, data = '') {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data);
}

function makeApiRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    if (!CONFIG.TOKEN) {
      reject(new Error('PRERENDER_IO_TOKEN environment variable required'));
      return;
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Prerender-Token': CONFIG.TOKEN
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(`${CONFIG.API_BASE}${endpoint}`, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Core Functions
async function setupScheduledRendering() {
  log('🚀 Starting Scheduled Rendering setup for LocalPDF...');
  log(`📊 Total URLs to configure: ${getTotalUrlCount()}`);

  for (const [tierName, tierConfig] of Object.entries(URL_TIERS)) {
    log(`\n🔄 Setting up ${tierName} (${tierConfig.urls.length} URLs)`);
    log(`⏱️ Frequency: Every ${Math.round(tierConfig.frequency / 24)} days (${tierConfig.frequency}h)`);

    const fullUrls = tierConfig.urls.map(path => CONFIG.BASE_URL + path);

    try {
      // Настройка recache для группы URLs
      await setupTierRecache(tierName, fullUrls, tierConfig.frequency);

      // Небольшая пауза между тирами
      await sleep(2000);

    } catch (error) {
      log(`❌ Error setting up ${tierName}:`, error.message);
    }
  }

  log('\n✅ Scheduled Rendering setup completed!');
  log('🔍 Run "node prerender-api-manager.js status" to verify');
}

async function setupTierRecache(tierName, urls, frequency) {
  try {
    // Step 1: Add URLs to recache queue
    log(`  📤 Adding ${urls.length} URLs to recache queue...`);

    const recacheData = {
      prerenderUrls: urls,
      adaptiveType: 'desktop' // или 'mobile' при необходимости
    };

    const recacheResponse = await makeApiRequest('/recache', 'POST', recacheData);

    if (recacheResponse.statusCode === 200) {
      log(`  ✅ URLs added to queue successfully`);
    } else {
      log(`  ⚠️ Recache response:`, recacheResponse);
    }

    // Step 2: Set custom recache speed for this frequency
    const urlsPerHour = Math.max(3600, Math.min(36000, Math.floor(24 / (frequency / 24) * urls.length)));

    log(`  ⚡ Setting recache speed: ${urlsPerHour} URLs/hour`);

    const speedData = {
      urlsPerHour: urlsPerHour
    };

    const speedResponse = await makeApiRequest('/change-recache-speed', 'POST', speedData);

    if (speedResponse.statusCode === 200) {
      log(`  ✅ Recache speed configured`);
    } else {
      log(`  ⚠️ Speed response:`, speedResponse);
    }

  } catch (error) {
    log(`  ❌ Error in setupTierRecache:`, error.message);
    throw error;
  }
}

async function getStatus() {
  log('📊 Checking Prerender.io status...');

  try {
    // Check account info and limits
    const response = await makeApiRequest('/');

    log('✅ Account Status:', {
      statusCode: response.statusCode,
      data: response.data
    });

    return response.data;

  } catch (error) {
    log('❌ Error checking status:', error.message);
    throw error;
  }
}

async function monitorCacheStats() {
  log('📈 Monitoring cache statistics...');

  // Get total URLs configured
  const totalUrls = getTotalUrlCount();

  log(`📊 Configuration Summary:`);
  log(`  • Total URLs: ${totalUrls}`);
  log(`  • Tier 1 (2 days): ${URL_TIERS.TIER_1.urls.length} URLs`);
  log(`  • Tier 2 (3 days): ${URL_TIERS.TIER_2.urls.length} URLs`);
  log(`  • Tier 3 (5 days): ${URL_TIERS.TIER_3.urls.length} URLs`);

  // Check some sample URLs
  await checkSampleUrls();
}

async function checkSampleUrls() {
  log('\n🔍 Testing sample URLs...');

  const sampleUrls = [
    CONFIG.BASE_URL + '/',
    CONFIG.BASE_URL + '/merge-pdf',
    CONFIG.BASE_URL + '/ru/',
    CONFIG.BASE_URL + '/ru/merge-pdf'
  ];

  for (const testUrl of sampleUrls) {
    try {
      const parsedUrl = url.parse(testUrl);

      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: 'HEAD',
        headers: {
          'User-Agent': 'Googlebot/2.1'
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, resolve);
        req.on('error', reject);
        req.end();
      });

      const prerenderHeader = response.headers['x-prerender-bot'];
      const status = response.statusCode;

      log(`  ${status === 200 ? '✅' : '❌'} ${testUrl}`);
      log(`     Status: ${status}, Prerender: ${prerenderHeader || 'none'}`);

    } catch (error) {
      log(`  ❌ ${testUrl} - Error: ${error.message}`);
    }
  }
}

async function clearCache() {
  log('🗑️ Clearing cache...');

  try {
    const response = await makeApiRequest('/clear-cache', 'POST');

    if (response.statusCode === 200) {
      log('✅ Cache cleared successfully');
    } else {
      log('⚠️ Clear cache response:', response);
    }

  } catch (error) {
    log('❌ Error clearing cache:', error.message);
  }
}

function getTotalUrlCount() {
  return Object.values(URL_TIERS).reduce((total, tier) => total + tier.urls.length, 0);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showUsage() {
  console.log(`
🚀 LocalPDF Prerender.io API Manager

Usage:
  node prerender-api-manager.js <command>

Commands:
  setup      Setup scheduled rendering for 42 URLs
  status     Check account status and limits
  monitor    Monitor cache statistics
  clear      Clear all cached content
  help       Show this help

Environment:
  PRERENDER_IO_TOKEN    Your Prerender.io API token (required)

Examples:
  export PRERENDER_IO_TOKEN="your-token-here"
  node prerender-api-manager.js setup
  node prerender-api-manager.js status
`);
}

// Main CLI Handler
async function main() {
  const command = process.argv[2];

  if (!command || command === 'help') {
    showUsage();
    return;
  }

  if (!CONFIG.TOKEN) {
    console.error('❌ Error: PRERENDER_IO_TOKEN environment variable required');
    console.error('Set it with: export PRERENDER_IO_TOKEN="your-token-here"');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'setup':
        await setupScheduledRendering();
        break;
      case 'status':
        await getStatus();
        break;
      case 'monitor':
        await monitorCacheStats();
        break;
      case 'clear':
        await clearCache();
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        showUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  setupScheduledRendering,
  getStatus,
  monitorCacheStats,
  clearCache,
  URL_TIERS,
  CONFIG
};
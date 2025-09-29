#!/usr/bin/env node

/**
 * LocalPDF Cache Warmer
 *
 * Автоматически обновляет cache в Prerender.io каждые 2-3 дня,
 * решая проблему 3-дневного TTL на free plan.
 *
 * Работает с нашим middleware whitelist - только EN+RU страницы.
 */

const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// Configuration - используем ту же логику что в middleware
const CONFIG = {
  BASE_URL: 'https://localpdf.online',

  // Тиры важности (как в middleware)
  TIER_1: {
    name: 'Critical Pages',
    frequency_days: 2,
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
    frequency_days: 3,
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
    frequency_days: 5,
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

// Bot user agents для имитации поисковых ботов
const BOT_USER_AGENTS = [
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://bing.com/bingbot.htm)'
];

class CacheWarmer {
  constructor() {
    this.results = {
      total: 0,
      success: 0,
      errors: []
    };
    this.startTime = Date.now();
    this.logFile = `cache-warmer-${new Date().toISOString().split('T')[0]}.log`;
    this.jsonFile = `cache-warmer-results-${Date.now()}.json`;
  }

  log(message, data = '') {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message} ${data}`;
    console.log(logLine);

    // Записываем в файл лога
    try {
      fs.appendFileSync(this.logFile, logLine + '\n');
    } catch (error) {
      // Игнорируем ошибки записи лога
    }
  }

  async warmCache(tier = null) {
    this.log('🚀 Starting Cache Warmer for LocalPDF...');

    const tiersToWarm = tier ? [tier] : this.getTiersToWarm();

    this.log(`📊 Warming ${tiersToWarm.length} tier(s)`);

    for (const tierName of tiersToWarm) {
      await this.warmTier(tierName);
      // Небольшая пауза между тирами
      await this.sleep(2000);
    }

    this.printSummary();
    this.saveResults();
  }

  getTiersToWarm() {
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);

    const tiersToWarm = [];

    // Tier 1: каждые 2 дня
    if (dayOfYear % CONFIG.TIER_1.frequency_days === 0) {
      tiersToWarm.push('TIER_1');
    }

    // Tier 2: каждые 3 дня
    if (dayOfYear % CONFIG.TIER_2.frequency_days === 0) {
      tiersToWarm.push('TIER_2');
    }

    // Tier 3: каждые 5 дней
    if (dayOfYear % CONFIG.TIER_3.frequency_days === 0) {
      tiersToWarm.push('TIER_3');
    }

    // Если ни один тир не запланирован, запустим Tier 1 (самый важный)
    if (tiersToWarm.length === 0) {
      this.log('⚠️ No scheduled tiers today, warming Tier 1 as fallback');
      tiersToWarm.push('TIER_1');
    }

    return tiersToWarm;
  }

  async warmTier(tierName) {
    const tier = CONFIG[tierName];
    if (!tier) {
      this.log(`❌ Unknown tier: ${tierName}`);
      return;
    }

    this.log(`\n🔄 Warming ${tierName}: ${tier.name}`);
    this.log(`📝 URLs: ${tier.urls.length}, Frequency: every ${tier.frequency_days} days`);

    const userAgent = this.getRandomUserAgent();
    this.log(`🤖 Using: ${userAgent.split(';')[1] || 'Googlebot'}`);

    for (const urlPath of tier.urls) {
      const fullUrl = CONFIG.BASE_URL + urlPath;
      await this.warmUrl(fullUrl, userAgent);

      // Небольшая пауза между запросами
      await this.sleep(1000);
    }

    this.log(`✅ ${tierName} completed: ${tier.urls.length} URLs processed`);
  }

  async warmUrl(url, userAgent) {
    this.results.total++;

    try {
      const startTime = Date.now();
      const response = await this.makeRequest(url, userAgent);
      const responseTime = Date.now() - startTime;

      const status = response.statusCode;
      const prerenderHeader = response.headers['x-prerender-bot'];

      if (status === 200) {
        this.results.success++;
        const cacheStatus = prerenderHeader === 'true' ? '🤖 Prerendered' : '🌐 SPA';
        this.log(`  ✅ ${cacheStatus} ${url} (${responseTime}ms)`);
      } else {
        this.results.errors.push(`${url}: HTTP ${status}`);
        this.log(`  ❌ ${url}: HTTP ${status}`);
      }

    } catch (error) {
      this.results.errors.push(`${url}: ${error.message}`);
      this.log(`  ❌ ${url}: ${error.message}`);
    }
  }

  makeRequest(url, userAgent) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);

      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'HEAD',
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      };

      const req = https.request(options, resolve);

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  getRandomUserAgent() {
    return BOT_USER_AGENTS[Math.floor(Math.random() * BOT_USER_AGENTS.length)];
  }

  printSummary() {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    const successRate = Math.round((this.results.success / this.results.total) * 100);

    this.log('\n📊 CACHE WARMER SUMMARY');
    this.log('========================');
    this.log(`⏱️  Duration: ${duration}s`);
    this.log(`📈 Success Rate: ${successRate}% (${this.results.success}/${this.results.total})`);

    if (this.results.errors.length > 0) {
      this.log(`❌ Errors: ${this.results.errors.length}`);
      this.results.errors.forEach(error => this.log(`   • ${error}`));
    }

    this.log('\n🎯 Next Steps:');
    this.log('• Monitor Prerender.io dashboard for cache hits');
    this.log('• Check Core Web Vitals improvements');
    this.log('• Track organic traffic growth (EN + RU)');

    const status = successRate >= 80 ? '🎉 SUCCESS!' : '⚠️ PARTIAL SUCCESS';
    this.log(`\n🚦 Status: ${status}`);
  }

  saveResults() {
    const results = {
      timestamp: new Date().toISOString(),
      duration: Math.round((Date.now() - this.startTime) / 1000),
      total: this.results.total,
      success: this.results.success,
      errors: this.results.errors,
      successRate: Math.round((this.results.success / this.results.total) * 100)
    };

    try {
      fs.writeFileSync(this.jsonFile, JSON.stringify(results, null, 2));
      this.log(`📊 Results saved to ${this.jsonFile}`);
    } catch (error) {
      this.log(`❌ Failed to save results: ${error.message}`);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const warmer = new CacheWarmer();

  try {
    switch (command) {
      case 'tier1':
        await warmer.warmCache('TIER_1');
        break;
      case 'tier2':
        await warmer.warmCache('TIER_2');
        break;
      case 'tier3':
        await warmer.warmCache('TIER_3');
        break;
      case 'all':
        await warmer.warmCache();
        break;
      case 'auto':
      case undefined:
        // Автоматический режим - определяет какие тиры нужно прогреть
        await warmer.warmCache();
        break;
      case 'help':
        console.log(`
🔥 LocalPDF Cache Warmer

Usage:
  node cache-warmer.js [command]

Commands:
  auto     Automatic mode - warm tiers based on schedule (default)
  tier1    Warm only Tier 1 (critical pages)
  tier2    Warm only Tier 2 (standard tools)
  tier3    Warm only Tier 3 (blog posts)
  all      Warm all tiers regardless of schedule
  help     Show this help

Examples:
  node cache-warmer.js          # Auto mode
  node cache-warmer.js tier1    # Critical pages only
  node cache-warmer.js all      # All URLs now
`);
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('Run "node cache-warmer.js help" for usage');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CacheWarmer;
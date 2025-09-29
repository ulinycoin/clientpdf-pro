#!/usr/bin/env node

/**
 * LocalPDF Prerender.io Monitor & Analytics
 *
 * Продвинутый мониторинг scheduled rendering с аналитикой
 * и автоматическими рекомендациями по оптимизации.
 */

const prerenderManager = require('./prerender-api-manager.js');
const https = require('https');

// Extended Analytics Configuration
const ANALYTICS_CONFIG = {
  SAMPLE_SIZE: 10, // Количество URL для выборочной проверки
  TIMEOUT: 10000,  // Timeout для HTTP запросов
  EXPECTED_CACHE_HIT_RATE: 80, // Ожидаемый процент cache hit
  MAX_RENDERS_PER_DAY: 20      // Максимум renders в день согласно плану
};

class PrerenderMonitor {
  constructor() {
    this.results = {
      totalUrls: 0,
      successfulUrls: 0,
      prerenderingUrls: 0,
      errors: [],
      performance: {},
      recommendations: []
    };
  }

  async runComprehensiveCheck() {
    console.log('🔍 Starting Comprehensive Prerender Monitoring...\n');

    // 1. Basic API Status
    await this.checkApiStatus();

    // 2. URL Testing по тирам
    await this.testUrlTiers();

    // 3. Performance Analysis
    await this.analyzePerformance();

    // 4. Generate Recommendations
    this.generateRecommendations();

    // 5. Summary Report
    this.printSummaryReport();
  }

  async checkApiStatus() {
    console.log('📊 Checking API Status...');

    try {
      const status = await prerenderManager.getStatus();
      console.log('✅ API Connection: OK');

      if (status.accountInfo) {
        console.log(`📈 Account Level: ${status.accountInfo.plan || 'Free'}`);
        console.log(`🔄 Monthly Renders: ${status.accountInfo.monthlyRenders || 'N/A'}`);
      }

    } catch (error) {
      console.log('❌ API Connection Failed:', error.message);
      this.results.errors.push(`API Status: ${error.message}`);
    }

    console.log('');
  }

  async testUrlTiers() {
    console.log('🧪 Testing URL Tiers...\n');

    for (const [tierName, tierConfig] of Object.entries(prerenderManager.URL_TIERS)) {
      console.log(`🔍 Testing ${tierName} (${tierConfig.name})`);
      console.log(`⏱️  Expected frequency: Every ${Math.round(tierConfig.frequency / 24)} days`);

      // Выборочная проверка URL из тира
      const sampleUrls = this.getSampleUrls(tierConfig.urls, 3);
      let tierSuccessCount = 0;
      let tierPrerenderCount = 0;

      for (const urlPath of sampleUrls) {
        const fullUrl = prerenderManager.CONFIG.BASE_URL + urlPath;
        const result = await this.testSingleUrl(fullUrl, tierName);

        this.results.totalUrls++;

        if (result.success) {
          this.results.successfulUrls++;
          tierSuccessCount++;
        }

        if (result.prerendered) {
          this.results.prerenderingUrls++;
          tierPrerenderCount++;
        }

        if (result.error) {
          this.results.errors.push(`${tierName}: ${result.error}`);
        }
      }

      const tierPrerenderRate = Math.round((tierPrerenderCount / sampleUrls.length) * 100);
      console.log(`  📊 Prerender Rate: ${tierPrerenderRate}% (${tierPrerenderCount}/${sampleUrls.length})`);

      if (tierPrerenderRate < 80) {
        this.results.recommendations.push(
          `⚠️ ${tierName}: Low prerender rate (${tierPrerenderRate}%). Check configuration.`
        );
      }

      console.log('');
    }
  }

  async testSingleUrl(url, tier) {
    try {
      const startTime = Date.now();

      const response = await this.makeHttpRequest(url, {
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)'
      });

      const responseTime = Date.now() - startTime;
      const prerenderHeader = response.headers['x-prerender-bot'];
      const isPrerendered = prerenderHeader === 'true';

      // Store performance data
      if (!this.results.performance[tier]) {
        this.results.performance[tier] = {
          responseTimes: [],
          prerenderRate: 0,
          totalTests: 0
        };
      }

      this.results.performance[tier].responseTimes.push(responseTime);
      this.results.performance[tier].totalTests++;

      if (isPrerendered) {
        this.results.performance[tier].prerenderRate++;
      }

      const status = response.statusCode === 200 ? '✅' : '❌';
      const prerenderStatus = isPrerendered ? '🤖' : '🌐';

      console.log(`  ${status} ${prerenderStatus} ${url} (${responseTime}ms)`);

      return {
        success: response.statusCode === 200,
        prerendered: isPrerendered,
        responseTime,
        error: response.statusCode !== 200 ? `HTTP ${response.statusCode}` : null
      };

    } catch (error) {
      console.log(`  ❌ ⚠️  ${url} - Error: ${error.message}`);
      return {
        success: false,
        prerendered: false,
        responseTime: null,
        error: error.message
      };
    }
  }

  async analyzePerformance() {
    console.log('📈 Performance Analysis...\n');

    for (const [tier, data] of Object.entries(this.results.performance)) {
      if (data.responseTimes.length === 0) continue;

      const avgResponseTime = Math.round(
        data.responseTimes.reduce((a, b) => a + b, 0) / data.responseTimes.length
      );

      const prerenderPercentage = Math.round((data.prerenderRate / data.totalTests) * 100);

      console.log(`🏷️  ${tier}:`);
      console.log(`   📊 Avg Response Time: ${avgResponseTime}ms`);
      console.log(`   🤖 Prerender Rate: ${prerenderPercentage}%`);

      // Performance recommendations
      if (avgResponseTime > 3000) {
        this.results.recommendations.push(
          `⚠️ ${tier}: High response time (${avgResponseTime}ms). Consider optimization.`
        );
      }

      if (prerenderPercentage < 80) {
        this.results.recommendations.push(
          `⚠️ ${tier}: Low prerender rate (${prerenderPercentage}%). Check whitelist configuration.`
        );
      }

      console.log('');
    }
  }

  generateRecommendations() {
    console.log('💡 Generating Recommendations...\n');

    // Calculate overall prerender rate
    const overallPrerenderRate = this.results.totalUrls > 0
      ? Math.round((this.results.prerenderingUrls / this.results.totalUrls) * 100)
      : 0;

    // Success rate
    const successRate = this.results.totalUrls > 0
      ? Math.round((this.results.successfulUrls / this.results.totalUrls) * 100)
      : 0;

    // Add general recommendations
    if (overallPrerenderRate < 70) {
      this.results.recommendations.push(
        '🔧 Overall prerender rate is low. Verify PRERENDER_IO_TOKEN and middleware configuration.'
      );
    }

    if (successRate < 95) {
      this.results.recommendations.push(
        '🔧 Some URLs are failing. Check for broken links or server issues.'
      );
    }

    if (this.results.errors.length > 0) {
      this.results.recommendations.push(
        `🔧 Found ${this.results.errors.length} errors. Review error details below.`
      );
    }

    // Positive recommendations
    if (overallPrerenderRate >= 80 && successRate >= 95) {
      this.results.recommendations.push(
        '✅ Configuration looks good! Monitor daily for consistent performance.'
      );
    }
  }

  printSummaryReport() {
    console.log('📋 SUMMARY REPORT');
    console.log('================\n');

    // Overall Stats
    const overallPrerenderRate = this.results.totalUrls > 0
      ? Math.round((this.results.prerenderingUrls / this.results.totalUrls) * 100)
      : 0;

    console.log(`📊 Overall Statistics:`);
    console.log(`   • Total URLs Tested: ${this.results.totalUrls}`);
    console.log(`   • Successful Responses: ${this.results.successfulUrls}`);
    console.log(`   • Prerendered URLs: ${this.results.prerenderingUrls}`);
    console.log(`   • Overall Prerender Rate: ${overallPrerenderRate}%`);
    console.log(`   • Errors: ${this.results.errors.length}`);
    console.log('');

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      this.results.recommendations.forEach(rec => console.log(`   ${rec}`));
      console.log('');
    }

    // Errors
    if (this.results.errors.length > 0) {
      console.log('❌ Errors Found:');
      this.results.errors.forEach(error => console.log(`   • ${error}`));
      console.log('');
    }

    // Next Steps
    console.log('🎯 Next Steps:');
    console.log('   1. Fix any errors listed above');
    console.log('   2. Monitor daily for first week');
    console.log('   3. Check Prerender.io dashboard for usage');
    console.log('   4. Track organic traffic improvements');
    console.log('');

    // Status indicator
    const status = overallPrerenderRate >= 80 && this.results.errors.length === 0
      ? '🎉 READY FOR PRODUCTION!'
      : '⚠️ NEEDS ATTENTION';

    console.log(`🚦 Status: ${status}`);
  }

  getSampleUrls(urls, count) {
    if (urls.length <= count) return urls;

    const step = Math.floor(urls.length / count);
    const sample = [];

    for (let i = 0; i < count; i++) {
      const index = i * step;
      if (index < urls.length) {
        sample.push(urls[index]);
      }
    }

    return sample;
  }

  makeHttpRequest(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        method: 'HEAD',
        headers: headers,
        timeout: ANALYTICS_CONFIG.TIMEOUT
      };

      const req = https.request(url, options, (res) => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];

  if (!prerenderManager.CONFIG.TOKEN) {
    console.error('❌ Error: PRERENDER_IO_TOKEN environment variable required');
    process.exit(1);
  }

  const monitor = new PrerenderMonitor();

  try {
    switch (command) {
      case 'check':
      case undefined:
        await monitor.runComprehensiveCheck();
        break;

      case 'quick':
        console.log('⚡ Quick Status Check...\n');
        await monitor.checkApiStatus();
        break;

      case 'help':
        console.log(`
🔍 LocalPDF Prerender Monitor

Usage:
  node prerender-monitor.js [command]

Commands:
  check      Run comprehensive monitoring (default)
  quick      Quick API status check
  help       Show this help

Environment:
  PRERENDER_IO_TOKEN    Your Prerender.io API token (required)
`);
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
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

module.exports = PrerenderMonitor;
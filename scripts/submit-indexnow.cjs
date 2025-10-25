#!/usr/bin/env node

/**
 * IndexNow URL Submission Script
 * Submits all URLs from sitemap to search engines (Bing, Yandex, etc.)
 *
 * IndexNow API: https://www.indexnow.org/
 * Supported by: Bing, Yandex, Seznam.cz, Naver
 */

const https = require('https');

// Configuration
const CONFIG = {
  host: 'localpdf.online',
  key: 'be13ab7c5d7548a1b51e5ce3c969af42', // IndexNow API key
  keyLocation: 'https://localpdf.online/be13ab7c5d7548a1b51e5ce3c969af42.txt',

  // IndexNow endpoints (pick one - they all share the same index)
  endpoints: {
    bing: 'www.bing.com',
    yandex: 'yandex.com',
    // seznam: 'search.seznam.cz',
    // naver: 'searchadvisor.naver.com'
  }
};

// All URLs from sitemap (17 URLs)
const URLS = [
  'https://localpdf.online/',
  'https://localpdf.online/merge-pdf',
  'https://localpdf.online/split-pdf',
  'https://localpdf.online/compress-pdf',
  'https://localpdf.online/protect-pdf',
  'https://localpdf.online/ocr-pdf',
  'https://localpdf.online/watermark-pdf',
  'https://localpdf.online/add-text-pdf',
  'https://localpdf.online/rotate-pdf',
  'https://localpdf.online/delete-pages-pdf',
  'https://localpdf.online/extract-pages-pdf',
  'https://localpdf.online/images-to-pdf',
  'https://localpdf.online/about',
  'https://localpdf.online/learn',
  'https://localpdf.online/comparison',
  'https://localpdf.online/privacy',
  'https://localpdf.online/terms'
];

/**
 * Submit URLs to IndexNow API
 */
async function submitToIndexNow(endpoint, endpointName) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: CONFIG.host,
      key: CONFIG.key,
      keyLocation: CONFIG.keyLocation,
      urlList: URLS
    });

    const options = {
      hostname: endpoint,
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          endpoint: endpointName,
          status: res.statusCode,
          message: res.statusMessage,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject({
        endpoint: endpointName,
        error: error.message
      });
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 IndexNow URL Submission\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Total URLs: ${URLS.length}`);
  console.log(`🔑 API Key: ${CONFIG.key}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = [];

  // Submit to all endpoints
  for (const [name, endpoint] of Object.entries(CONFIG.endpoints)) {
    console.log(`📤 Submitting to ${name.toUpperCase()} (${endpoint})...`);

    try {
      const result = await submitToIndexNow(endpoint, name);
      results.push(result);

      if (result.status === 200) {
        console.log(`   ✅ Success! Status: ${result.status}`);
      } else if (result.status === 202) {
        console.log(`   ✅ Accepted! Status: ${result.status}`);
      } else {
        console.log(`   ⚠️  Status: ${result.status} - ${result.message}`);
      }
    } catch (error) {
      results.push(error);
      console.log(`   ❌ Error: ${error.error}`);
    }

    console.log('');

    // Delay between requests to avoid rate limiting
    if (name !== Object.keys(CONFIG.endpoints).slice(-1)[0]) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Submission Summary:\n');

  results.forEach(result => {
    if (result.error) {
      console.log(`   ${result.endpoint}: ❌ Failed - ${result.error}`);
    } else {
      const statusEmoji = result.status === 200 || result.status === 202 ? '✅' : '⚠️';
      console.log(`   ${result.endpoint}: ${statusEmoji} HTTP ${result.status}`);
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const successful = results.filter(r => r.status === 200 || r.status === 202).length;
  const failed = results.filter(r => r.error || (r.status !== 200 && r.status !== 202)).length;

  console.log(`\n✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  console.log('\n💡 Note: IndexNow endpoints share the same index.');
  console.log('   Submitting to one endpoint (e.g., Bing) notifies all participating search engines.\n');

  console.log('🔍 Expected results:');
  console.log('   • Bing/Yandex will crawl URLs within 24-48 hours');
  console.log('   • Full indexation may take 1-2 weeks');
  console.log('   • Monitor in Bing Webmaster Tools & Yandex Webmaster\n');
}

// Run
main().catch(console.error);

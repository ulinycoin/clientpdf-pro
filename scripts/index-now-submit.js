import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IndexNow configuration
const INDEX_NOW_KEY = 'be13ab7c5d7548a1b51e5ce3c969af42';
const SITE_URL = 'https://localpdf.online';

// All URLs to submit for indexing
const URLS_TO_INDEX = [
  // Main pages
  `${SITE_URL}/`,
  `${SITE_URL}/privacy`,
  `${SITE_URL}/faq`,

  // PDF Tools - High Priority
  `${SITE_URL}/merge-pdf`,
  `${SITE_URL}/split-pdf`,
  `${SITE_URL}/compress-pdf`,
  `${SITE_URL}/pdf-to-image`,
  `${SITE_URL}/images-to-pdf`,
  `${SITE_URL}/word-to-pdf`,
  `${SITE_URL}/excel-to-pdf`,

  // PDF Tools - Secondary
  `${SITE_URL}/add-text-pdf`,
  `${SITE_URL}/watermark-pdf`,
  `${SITE_URL}/rotate-pdf`,
  `${SITE_URL}/extract-pages-pdf`,
  `${SITE_URL}/extract-text-pdf`,
  `${SITE_URL}/ocr-pdf`
];

// IndexNow API endpoints
const INDEX_NOW_ENDPOINTS = [
  'api.indexnow.org',
  'www.bing.com',
  'yandex.com'
];

/**
 * Submit URLs to IndexNow API
 */
async function submitToIndexNow(endpoint, urls) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      host: 'localpdf.online',
      key: INDEX_NOW_KEY,
      keyLocation: `${SITE_URL}/${INDEX_NOW_KEY}.txt`,
      urlList: urls
    });

    const options = {
      hostname: endpoint,
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'LocalPDF-IndexNow-Bot/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`✅ ${endpoint}: Status ${res.statusCode}`);
        if (res.statusCode === 200 || res.statusCode === 202) {
          resolve({ endpoint, status: 'success', statusCode: res.statusCode });
        } else {
          resolve({ endpoint, status: 'error', statusCode: res.statusCode, response: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error submitting to ${endpoint}:`, error.message);
      reject({ endpoint, status: 'error', error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Submit sitemap to Google via ping
 */
async function submitToGoogle() {
  return new Promise((resolve, reject) => {
    const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
    const googlePingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;

    const options = {
      hostname: 'www.google.com',
      port: 443,
      path: `/ping?sitemap=${sitemapUrl}`,
      method: 'GET',
      headers: {
        'User-Agent': 'LocalPDF-GooglePing-Bot/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`✅ Google Ping: Status ${res.statusCode}`);
        if (res.statusCode === 200) {
          resolve({ endpoint: 'Google', status: 'success', statusCode: res.statusCode });
        } else {
          resolve({ endpoint: 'Google', status: 'error', statusCode: res.statusCode, response: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error submitting to Google:`, error.message);
      reject({ endpoint: 'Google', status: 'error', error: error.message });
    });

    req.end();
  });
}
/**
 * Submit URLs to all IndexNow endpoints and Google
 */
async function submitToAllEndpoints() {
  console.log('🚀 Starting sitemap submission...');
  console.log(`📋 Submitting ${URLS_TO_INDEX.length} URLs to ${INDEX_NOW_ENDPOINTS.length} IndexNow endpoints + Google`);
  console.log('');

  const results = [];

  // Submit to IndexNow endpoints
  for (const endpoint of INDEX_NOW_ENDPOINTS) {
    try {
      console.log(`📡 Submitting to ${endpoint}...`);
      const result = await submitToIndexNow(endpoint, URLS_TO_INDEX);
      results.push(result);

      // Add delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      results.push(error);
    }
  }

  // Submit sitemap to Google
  try {
    console.log(`📡 Submitting sitemap to Google...`);
    const googleResult = await submitToGoogle();
    results.push(googleResult);
  } catch (error) {
    results.push(error);
  }

  return results;
}

/**
 * Generate IndexNow sitemap for future automatic submissions
 */
function generateIndexNowSitemap() {
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<!-- LocalPDF IndexNow Sitemap -->
<!-- Generated: ${new Date().toISOString()} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${URLS_TO_INDEX.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === SITE_URL + '/' ? '1.0' : url.includes('merge-pdf') || url.includes('split-pdf') || url.includes('compress-pdf') ? '0.9' : '0.8'}</priority>
  </url>`).join('\n')}

</urlset>`;

  const sitemapPath = path.join(__dirname, '..', 'public', 'indexnow-sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapContent);
  console.log(`📄 IndexNow sitemap generated: ${sitemapPath}`);
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎯 LocalPDF IndexNow Mass Submission');
  console.log('=====================================');
  console.log('');

  try {
    // Generate updated sitemap
    generateIndexNowSitemap();
    console.log('');

    // Submit to all endpoints
    const results = await submitToAllEndpoints();

    console.log('');
    console.log('📊 SUBMISSION RESULTS:');
    console.log('=====================');

    let successCount = 0;
    let errorCount = 0;

    results.forEach(result => {
      if (result.status === 'success') {
        console.log(`✅ ${result.endpoint}: SUCCESS (${result.statusCode})`);
        successCount++;
      } else {
        console.log(`❌ ${result.endpoint}: ERROR (${result.statusCode || 'Network Error'})`);
        if (result.error) console.log(`   Error: ${result.error}`);
        if (result.response) console.log(`   Response: ${result.response}`);
        errorCount++;
      }
    });

    console.log('');
    console.log(`📈 Summary: ${successCount} successful, ${errorCount} errors`);
    console.log(`🔄 ${URLS_TO_INDEX.length} URLs submitted to ${INDEX_NOW_ENDPOINTS.length} IndexNow endpoints + Google sitemap ping`);

    if (successCount > 0) {
      console.log('');
      console.log('🎉 Sitemap submission completed!');
      console.log('⏰ Pages should be crawled within 24-48 hours');
      console.log('💡 Monitor Google Search Console and Bing Webmaster Tools for indexing status');
    }

  } catch (error) {
    console.error('❌ Fatal error during IndexNow submission:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { submitToIndexNow, URLS_TO_INDEX, INDEX_NOW_KEY };

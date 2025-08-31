import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IndexNow configuration
const INDEX_NOW_KEY = 'be13ab7c5d7548a1b51e5ce3c969af42';
const SITE_URL = 'https://localpdf.online';

// Generate multilingual URLs
const generateMultilingualUrls = () => {
  const languages = ['en', 'de', 'fr', 'es', 'ru'];
  const pages = [
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
    '/ocr-pdf',
    '/privacy',
    '/faq'
  ];

  const urls = [];
  
  // Add homepage
  urls.push(`${SITE_URL}/`);
  
  // Add all language-page combinations
  languages.forEach(lang => {
    pages.forEach(page => {
      if (lang === 'en') {
        // English pages in root
        urls.push(`${SITE_URL}${page}`);
      } else {
        // Other languages in subdirectories
        urls.push(`${SITE_URL}/${lang}${page}`);
      }
    });
  });
  
  return urls;
};

// All URLs to submit for indexing (76 multilingual URLs)
const URLS_TO_INDEX = generateMultilingualUrls();

// IndexNow API endpoints
const INDEX_NOW_ENDPOINTS = [
  'api.indexnow.org',
  'www.bing.com',
  'yandex.com'
];

/**
 * Submit URLs to IndexNow API with staggered delivery
 * Splits large URL batches into smaller chunks to avoid server overload
 */
async function submitToIndexNow(endpoint, urls, batchSize = 10) {
  const results = [];
  
  // Split URLs into smaller batches for staggered submission
  const batches = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }
  
  console.log(`  📦 Splitting ${urls.length} URLs into ${batches.length} batches of max ${batchSize} URLs each`);
  
  // Submit each batch with delays
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchNumber = i + 1;
    
    console.log(`  📋 Batch ${batchNumber}/${batches.length}: Submitting ${batch.length} URLs to ${endpoint}`);
    
    try {
      const result = await submitBatchToIndexNow(endpoint, batch);
      results.push({
        ...result,
        batchNumber,
        batchSize: batch.length
      });
      
      // Add delay between batches (2-3 seconds) to be respectful
      if (i < batches.length - 1) {
        const delay = 2000 + Math.random() * 1000; // 2-3 seconds random delay
        console.log(`  ⏱️  Waiting ${Math.round(delay)}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      results.push({
        endpoint,
        status: 'error',
        error: error.message,
        batchNumber,
        batchSize: batch.length
      });
    }
  }
  
  // Return summary of all batches
  const successfulBatches = results.filter(r => r.status === 'success').length;
  const totalUrlsSubmitted = results.reduce((sum, r) => sum + (r.batchSize || 0), 0);
  
  return {
    endpoint,
    status: successfulBatches === batches.length ? 'success' : 'partial',
    totalBatches: batches.length,
    successfulBatches,
    totalUrlsSubmitted,
    results
  };
}

/**
 * Submit a single batch to IndexNow API
 */
async function submitBatchToIndexNow(endpoint, urls) {
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
        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log(`    ✅ Batch submitted successfully (${res.statusCode})`);
          resolve({ endpoint, status: 'success', statusCode: res.statusCode });
        } else {
          console.log(`    ❌ Batch failed (${res.statusCode})`);
          resolve({ endpoint, status: 'error', statusCode: res.statusCode, response: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`    ❌ Network error:`, error.message);
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
 * Submit URLs to all IndexNow endpoints and Google with staggered delivery
 */
async function submitToAllEndpoints(batchSize = 10) {
  console.log('🚀 Starting OPTIMIZED IndexNow submission with staggered delivery...');
  console.log(`📋 Submitting ${URLS_TO_INDEX.length} URLs to ${INDEX_NOW_ENDPOINTS.length} IndexNow endpoints + Google`);
  console.log(`⚡ Using staggered batches of ${batchSize} URLs each to reduce server load`);
  console.log('');

  const results = [];

  // Submit to IndexNow endpoints with staggered batches
  for (const endpoint of INDEX_NOW_ENDPOINTS) {
    try {
      console.log(`📡 Starting staggered submission to ${endpoint}...`);
      const result = await submitToIndexNow(endpoint, URLS_TO_INDEX, batchSize);
      results.push(result);

      // Add longer delay between endpoints (5-8 seconds) to spread load
      if (endpoint !== INDEX_NOW_ENDPOINTS[INDEX_NOW_ENDPOINTS.length - 1]) {
        const endpointDelay = 5000 + Math.random() * 3000; // 5-8 seconds
        console.log(`⏳ Waiting ${Math.round(endpointDelay)}ms before next endpoint...`);
        await new Promise(resolve => setTimeout(resolve, endpointDelay));
      }
      
      console.log(`✨ Completed submission to ${endpoint}\n`);
    } catch (error) {
      results.push({
        endpoint,
        status: 'error',
        error: error.message || error
      });
      console.log(`❌ Failed submission to ${endpoint}\n`);
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
 * Main execution function with staggered delivery
 */
async function main() {
  console.log('🎯 LocalPDF IndexNow OPTIMIZED Submission');
  console.log('==========================================');
  console.log('✨ Now using STAGGERED DELIVERY to respect IndexNow best practices');
  console.log('⚡ Prevents server overload with small batches and delays');
  console.log('');

  try {
    // Generate updated sitemap
    generateIndexNowSitemap();
    console.log('');

    // Submit to all endpoints
    const results = await submitToAllEndpoints();

    console.log('');
    console.log('📊 STAGGERED SUBMISSION RESULTS:');
    console.log('================================');

    let totalSuccessfulEndpoints = 0;
    let totalErrorEndpoints = 0;
    let totalUrlsSubmitted = 0;
    let totalBatchesSubmitted = 0;

    results.forEach(result => {
      if (result.endpoint === 'Google') {
        // Handle Google ping result
        if (result.status === 'success') {
          console.log(`✅ ${result.endpoint}: SUCCESS (${result.statusCode})`);
          totalSuccessfulEndpoints++;
        } else {
          console.log(`❌ ${result.endpoint}: ERROR (${result.statusCode || 'Network Error'})`);
          if (result.error) console.log(`   Error: ${result.error}`);
          totalErrorEndpoints++;
        }
      } else {
        // Handle IndexNow staggered result
        if (result.status === 'success') {
          console.log(`✅ ${result.endpoint}: SUCCESS - ${result.successfulBatches}/${result.totalBatches} batches (${result.totalUrlsSubmitted} URLs)`);
          totalSuccessfulEndpoints++;
          totalUrlsSubmitted += result.totalUrlsSubmitted;
          totalBatchesSubmitted += result.totalBatches;
        } else if (result.status === 'partial') {
          console.log(`⚠️  ${result.endpoint}: PARTIAL - ${result.successfulBatches}/${result.totalBatches} batches (${result.totalUrlsSubmitted} URLs)`);
          totalSuccessfulEndpoints++; // Count as success for partial
          totalUrlsSubmitted += result.totalUrlsSubmitted;
          totalBatchesSubmitted += result.totalBatches;
        } else {
          console.log(`❌ ${result.endpoint}: ERROR`);
          if (result.error) console.log(`   Error: ${result.error}`);
          totalErrorEndpoints++;
        }
      }
    });

    console.log('');
    console.log(`📈 STAGGERED DELIVERY SUMMARY:`);
    console.log(`   🎯 ${totalSuccessfulEndpoints} successful endpoints, ${totalErrorEndpoints} errors`);
    console.log(`   📦 ${totalBatchesSubmitted} total batches submitted across all endpoints`);
    console.log(`   🔄 ${totalUrlsSubmitted} total URL submissions (with redundancy across endpoints)`);
    console.log(`   🌐 ${URLS_TO_INDEX.length} unique URLs processed with staggered delivery`);

    if (totalSuccessfulEndpoints > 0) {
      console.log('');
      console.log('🎉 STAGGERED IndexNow submission completed successfully!');
      console.log('⚡ Used respectful staggered delivery to avoid server overload');
      console.log('⏰ Pages should be crawled within 24-48 hours');
      console.log('💡 Monitor Google Search Console and Bing Webmaster Tools for indexing status');
      console.log('🏆 IndexNow best practices: ✅ Small batches ✅ Delays ✅ Respectful timing');
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

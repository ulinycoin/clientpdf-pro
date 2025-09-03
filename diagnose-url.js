#!/usr/bin/env node

import WebsiteDiagnostics from './website-diagnostics.js';

/**
 * CLI обертка для быстрой диагностики URL
 * Использование: node diagnose-url.js <URL1> [URL2] [URL3] ...
 */

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔍 Website Diagnostics CLI');
    console.log('Использование: node diagnose-url.js <URL1> [URL2] [URL3] ...');
    console.log('\nПримеры:');
    console.log('  node diagnose-url.js https://localpdf.online');
    console.log('  node diagnose-url.js https://localpdf.online/ru https://google.com');
    console.log('\nФункции:');
    console.log('  ✅ HTTP статус и время отклика');
    console.log('  🔒 SSL сертификат и безопасность');
    console.log('  🌐 DNS записи и резолюция');
    console.log('  📋 HTTP заголовки безопасности');
    console.log('  🔄 Анализ редиректов');
    process.exit(1);
  }

  const diagnostics = new WebsiteDiagnostics();
  
  console.log('🚀 WEBSITE DIAGNOSTICS CLI');
  console.log(`Анализируем ${args.length} URL(s)...\n`);

  for (const url of args) {
    try {
      await diagnostics.diagnose(url);
    } catch (error) {
      console.error(`❌ Ошибка анализа ${url}:`, error.message);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Анализ завершен');
  console.log(`${'='.repeat(60)}`);
}

main().catch(console.error);
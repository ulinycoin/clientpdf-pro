#!/usr/bin/env node

import https from 'https';
import { promises as dns } from 'dns';
import { URL } from 'url';
import util from 'util';

/**
 * Веб-диагностика сайта - комплексная проверка доступности и производительности
 * Проверяет HTTP статус, SSL, DNS, заголовки и редиректы
 */
class WebsiteDiagnostics {
  constructor() {
    this.results = {};
  }

  /**
   * Выполняет HTTP запрос с детальной информацией
   */
  async performHttpCheck(url) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'Website-Diagnostics/1.0 (Node.js)'
        }
      };

      const req = https.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });

        res.on('end', () => {
          resolve({
            success: true,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            responseTime,
            headers: res.headers,
            redirects: this.getRedirectInfo(res),
            bodySize: Buffer.byteLength(body, 'utf8'),
            ssl: res.socket && res.socket.authorized !== undefined ? {
              authorized: res.socket.authorized,
              cert: res.socket.getPeerCertificate()
            } : null
          });
        });
      });

      req.on('error', (err) => {
        const responseTime = Date.now() - startTime;
        resolve({
          success: false,
          error: err.message,
          code: err.code,
          responseTime,
          recommendation: this.getErrorRecommendation(err)
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const responseTime = Date.now() - startTime;
        resolve({
          success: false,
          error: 'Request timeout (10s)',
          responseTime,
          recommendation: 'Сервер не отвечает в разумное время. Проверьте производительность сервера.'
        });
      });

      req.end();
    });
  }

  /**
   * Получает информацию о редиректах
   */
  getRedirectInfo(res) {
    const location = res.headers.location;
    if (res.statusCode >= 300 && res.statusCode < 400 && location) {
      return {
        hasRedirect: true,
        location,
        permanent: res.statusCode === 301 || res.statusCode === 308
      };
    }
    return { hasRedirect: false };
  }

  /**
   * Проверяет DNS записи домена
   */
  async checkDNS(hostname) {
    try {
      const [a, aaaa, mx, ns] = await Promise.allSettled([
        dns.resolve4(hostname).catch(() => []),
        dns.resolve6(hostname).catch(() => []),
        dns.resolveMx(hostname).catch(() => []),
        dns.resolveNs(hostname).catch(() => [])
      ]);

      return {
        success: true,
        records: {
          A: a.status === 'fulfilled' ? a.value : [],
          AAAA: aaaa.status === 'fulfilled' ? aaaa.value : [],
          MX: mx.status === 'fulfilled' ? mx.value : [],
          NS: ns.status === 'fulfilled' ? ns.value : []
        }
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
        recommendation: 'DNS сервер недоступен или домен не существует'
      };
    }
  }

  /**
   * Анализирует SSL сертификат
   */
  analyzeCertificate(cert) {
    if (!cert || !cert.valid_from) {
      return { valid: false, error: 'Сертификат недоступен' };
    }

    const now = new Date();
    const validFrom = new Date(cert.valid_from);
    const validTo = new Date(cert.valid_to);
    const daysUntilExpiry = Math.ceil((validTo - now) / (1000 * 60 * 60 * 24));

    return {
      valid: now >= validFrom && now <= validTo,
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.valid_from,
      validTo: cert.valid_to,
      daysUntilExpiry,
      fingerprint: cert.fingerprint,
      serialNumber: cert.serialNumber,
      algorithm: cert.sigalg
    };
  }

  /**
   * Получает рекомендации по ошибкам
   */
  getErrorRecommendation(err) {
    const recommendations = {
      'ENOTFOUND': 'Домен не найден. Проверьте правильность написания или DNS настройки.',
      'ECONNREFUSED': 'Соединение отклонено. Сервер недоступен или порт закрыт.',
      'ETIMEDOUT': 'Превышено время ожидания. Проверьте сетевое подключение.',
      'CERT_HAS_EXPIRED': 'SSL сертификат истек. Обновите сертификат.',
      'UNABLE_TO_VERIFY_LEAF_SIGNATURE': 'Не удается проверить SSL сертификат.',
      'ECONNRESET': 'Соединение сброшено сервером. Возможны проблемы с сервером.'
    };
    
    return recommendations[err.code] || 'Неизвестная ошибка. Проверьте сетевое подключение и настройки сервера.';
  }

  /**
   * Форматирует результаты в читаемый вид
   */
  formatResults(url, result) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 ДИАГНОСТИКА: ${url}`);
    console.log(`${'='.repeat(60)}\n`);

    if (result.http.success) {
      // HTTP Status
      const statusColor = result.http.statusCode < 400 ? '✅' : '❌';
      console.log(`${statusColor} HTTP СТАТУС: ${result.http.statusCode} ${result.http.statusMessage}`);
      
      // Response Time
      const timeColor = result.http.responseTime < 1000 ? '⚡' : result.http.responseTime < 3000 ? '⚠️' : '🐌';
      console.log(`${timeColor} ВРЕМЯ ОТКЛИКА: ${result.http.responseTime}ms`);
      
      // Body Size
      console.log(`📦 РАЗМЕР ОТВЕТА: ${(result.http.bodySize / 1024).toFixed(2)}KB`);

      // SSL Information
      if (result.http.ssl && result.http.ssl.cert) {
        const cert = this.analyzeCertificate(result.http.ssl.cert);
        console.log(`\n🔒 SSL СЕРТИФИКАТ:`);
        console.log(`   Статус: ${cert.valid ? '✅ Действителен' : '❌ Недействителен'}`);
        if (cert.valid) {
          console.log(`   Домен: ${cert.subject?.CN || 'N/A'}`);
          console.log(`   Издатель: ${cert.issuer?.O || cert.issuer?.CN || 'N/A'}`);
          console.log(`   Действителен до: ${cert.validTo}`);
          console.log(`   Осталось дней: ${cert.daysUntilExpiry}`);
          if (cert.daysUntilExpiry < 30) {
            console.log(`   ⚠️  Сертификат истекает через ${cert.daysUntilExpiry} дней!`);
          }
        }
      }

      // Redirects
      if (result.http.redirects.hasRedirect) {
        console.log(`\n🔄 РЕДИРЕКТ:`);
        console.log(`   Тип: ${result.http.redirects.permanent ? 'Постоянный (301/308)' : 'Временный (302/307)'}`);
        console.log(`   Направление: ${result.http.redirects.location}`);
      }

      // Important Headers
      console.log(`\n📋 ВАЖНЫЕ ЗАГОЛОВКИ:`);
      const importantHeaders = {
        'server': 'Сервер',
        'content-type': 'Тип контента',
        'content-encoding': 'Сжатие',
        'cache-control': 'Кэширование',
        'x-frame-options': 'X-Frame-Options',
        'strict-transport-security': 'HSTS',
        'content-security-policy': 'CSP'
      };
      
      Object.entries(importantHeaders).forEach(([header, description]) => {
        if (result.http.headers[header]) {
          console.log(`   ${description}: ${result.http.headers[header]}`);
        }
      });

    } else {
      console.log(`❌ HTTP ОШИБКА: ${result.http.error}`);
      console.log(`⏱️  Время до ошибки: ${result.http.responseTime}ms`);
      if (result.http.recommendation) {
        console.log(`💡 РЕКОМЕНДАЦИЯ: ${result.http.recommendation}`);
      }
    }

    // 404 Analysis (если есть)
    if (result.alternatives && result.alternatives.length > 0) {
      console.log(`\n🔄 АЛЬТЕРНАТИВНЫЕ URL:`);
      result.alternatives.forEach(alt => {
        const status = alt.working ? '✅' : '❌';
        console.log(`   ${status} ${alt.url} (${alt.status})`);
      });
    }

    // 404 Content Analysis (если есть)
    if (result.content404Analysis) {
      console.log(`\n🔍 АНАЛИЗ 404 СТРАНИЦЫ:`);
      console.log(`   Кастомная 404: ${result.content404Analysis.hasCustom404 ? '✅' : '❌'}`);
      console.log(`   Навигация: ${result.content404Analysis.containsNavigation ? '✅' : '❌'}`);
      if (result.content404Analysis.framework.length > 0) {
        console.log(`   Фреймворк: ${result.content404Analysis.framework.join(', ')}`);
      }
    }

    // DNS Information
    console.log(`\n🌐 DNS ЗАПИСИ:`);
    if (result.dns.success) {
      const { records } = result.dns;
      if (records.A.length > 0) {
        console.log(`   A записи (IPv4): ${records.A.join(', ')}`);
      }
      if (records.AAAA.length > 0) {
        console.log(`   AAAA записи (IPv6): ${records.AAAA.join(', ')}`);
      }
      if (records.MX.length > 0) {
        console.log(`   MX записи: ${records.MX.map(mx => `${mx.exchange} (${mx.priority})`).join(', ')}`);
      }
      if (records.NS.length > 0) {
        console.log(`   NS записи: ${records.NS.join(', ')}`);
      }
    } else {
      console.log(`   ❌ Ошибка DNS: ${result.dns.error}`);
    }
  }

  /**
   * Проверяет альтернативные URL при ошибке 404
   */
  async checkAlternatives(originalUrl, httpResult) {
    if (httpResult.statusCode !== 404) return null;

    const urlObj = new URL(originalUrl);
    const alternatives = [];

    // Альтернативные URL для проверки
    const alternativeUrls = [
      `${urlObj.protocol}//${urlObj.hostname}`, // Корень без пути
      `${urlObj.protocol}//www.${urlObj.hostname}${urlObj.pathname}`, // С www
      `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}index.html`, // С index.html
      `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.slice(0, -1)}`, // Без trailing slash
    ].filter(alt => alt !== originalUrl);

    for (const altUrl of alternativeUrls.slice(0, 2)) { // Ограничиваем до 2 альтернатив
      try {
        const altResult = await this.performHttpCheck(altUrl);
        alternatives.push({
          url: altUrl,
          status: altResult.statusCode,
          working: altResult.success && altResult.statusCode < 400
        });
      } catch (err) {
        alternatives.push({
          url: altUrl,
          status: 'ERROR',
          working: false
        });
      }
    }

    return alternatives;
  }

  /**
   * Анализирует содержимое 404 страницы для поиска подсказок
   */
  async analyze404Content(url) {
    return new Promise((resolve) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: 5000,
        headers: {
          'User-Agent': 'Website-Diagnostics-404-Analyzer/1.0'
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });

        res.on('end', () => {
          const analysis = {
            hasCustom404: !body.includes('404') || body.length > 1000,
            containsNavigation: body.includes('nav') || body.includes('menu'),
            hasSearch: body.includes('search'),
            suggestionsFound: [],
            framework: this.detectFramework(res.headers, body)
          };

          // Поиск возможных альтернатив в содержимом
          const pathMatches = body.match(/href=["'][^"']*[^"']*["']/g) || [];
          analysis.suggestionsFound = pathMatches
            .slice(0, 5)
            .map(match => match.replace(/href=["']/, '').replace(/["']$/, ''));

          resolve(analysis);
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });

      req.end();
    });
  }

  /**
   * Определяет используемый фреймворк/платформу
   */
  detectFramework(headers, body) {
    const frameworks = [];
    
    if (headers.server && headers.server.includes('cloudflare')) {
      frameworks.push('Cloudflare CDN');
    }
    if (headers['x-vercel-cache']) {
      frameworks.push('Vercel');
    }
    if (body.includes('__next')) {
      frameworks.push('Next.js');
    }
    if (body.includes('_app') || body.includes('vite')) {
      frameworks.push('Vite');
    }
    if (body.includes('react')) {
      frameworks.push('React');
    }

    return frameworks;
  }

  /**
   * Главная функция диагностики
   */
  async diagnose(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;

      console.log(`🔄 Начинаем диагностику ${url}...`);

      // Параллельно выполняем HTTP и DNS проверки
      const [httpResult, dnsResult] = await Promise.all([
        this.performHttpCheck(url),
        this.checkDNS(hostname)
      ]);

      let alternatives = null;
      let content404Analysis = null;

      // Дополнительный анализ для 404 ошибок
      if (httpResult.success && httpResult.statusCode === 404) {
        console.log(`🔍 Анализируем 404 ошибку для ${url}...`);
        [alternatives, content404Analysis] = await Promise.all([
          this.checkAlternatives(url, httpResult),
          this.analyze404Content(url)
        ]);
      }

      const result = {
        url,
        timestamp: new Date().toISOString(),
        http: httpResult,
        dns: dnsResult,
        alternatives,
        content404Analysis
      };

      this.formatResults(url, result);
      return result;

    } catch (err) {
      console.error(`❌ Ошибка при диагностике ${url}:`, err.message);
      return {
        url,
        error: err.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Основная функция
async function main() {
  const diagnostics = new WebsiteDiagnostics();
  
  const urls = [
    'https://localpdf.online/ru',
    'https://localpdf.online'
  ];

  console.log('🚀 WEBSITE DIAGNOSTICS TOOL');
  console.log('Комплексная диагностика веб-сайтов\n');

  for (const url of urls) {
    await diagnostics.diagnose(url);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Диагностика завершена');
  console.log(`${'='.repeat(60)}`);
}

// Запуск если файл выполняется напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default WebsiteDiagnostics;
# 📊 Rendertron Monitoring Guide

Полное руководство по мониторингу self-hosted Rendertron на Render.com.

---

## 🚀 Быстрая проверка (30 секунд)

```bash
# Запустить health check скрипт
./monitor-rendertron.sh
```

**Что проверяет:**
- ✅ Rendertron сервис живой (200 OK)
- ✅ Рендеринг страниц работает
- ✅ Middleware подключен к Rendertron
- ✅ Response time < 30 секунд

---

## 📍 Основные точки мониторинга

### **1. Render.com Dashboard**
🔗 https://dashboard.render.com/web/srv-d3ejtk3ipnbc73c0645g

**Logs (реал-тайм):**
- Смотри успешные рендеры: `→ GET /render/... 200 12s`
- Ищи ошибки: `TimeoutError`, `500`, `Memory`

**Events:**
- Deploys статус
- Auto-restarts (если есть проблемы)
- Suspensions (если превышен free tier лимит)

---

### **2. GitHub Actions - Cache Warmer**
🔗 https://github.com/ulinycoin/clientpdf-pro/actions/workflows/cache-warmer.yml

**Что проверять:**
- ✅ Runs каждые 12 часов (6:00 и 18:00 UTC)
- ✅ Success rate ≥ 80%
- 📊 Artifacts содержат логи и JSON результаты

**Алерты:**
- ❌ Failed runs → проблемы с Rendertron
- ⚠️ Success rate < 80% → проверь логи

---

### **3. Manual Checks**

**Проверка Rendertron напрямую:**
```bash
# Базовая проверка
curl -I https://localpdf-rendertron.onrender.com

# Проверка рендеринга
curl -I "https://localpdf-rendertron.onrender.com/render/https://localpdf.online/merge-pdf" \
  -A "Mozilla/5.0 (compatible; Googlebot/2.1)"
```

**Проверка через production сайт:**
```bash
curl -I "https://localpdf.online/merge-pdf" \
  -A "Mozilla/5.0 (compatible; Googlebot/2.1)"
```

Должны быть заголовки:
- `x-prerender-bot: true`
- `x-prerender-service: rendertron`
- `HTTP/2 200`

---

## 🔔 Что мониторить еженедельно

### **Каждую неделю (5 минут):**

1. **Запусти health check:**
   ```bash
   ./monitor-rendertron.sh
   ```

2. **Проверь GitHub Actions:**
   - Последние 7 runs успешны?
   - Success rate ≥ 80%?

3. **Посмотри Render.com Logs:**
   - Есть ли частые timeout'ы?
   - Много ли cold starts? (>10 в день)

---

## 📈 SEO Metrics (через 2-4 недели)

### **Google Search Console**
🔗 https://search.google.com/search-console

**Метрики для отслеживания:**

1. **Crawl Stats:**
   - Меньше ошибок crawl
   - Больше успешных страниц

2. **Index Coverage:**
   - Больше индексированных URL
   - Меньше "Excluded" страниц

3. **Core Web Vitals:**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

**Ожидаемое улучшение:**
- +20-40% индексация (EN + RU)
- Меньше timeout ошибок
- Лучше crawl frequency

---

## ⚠️ Проблемы и решения

### **Проблема 1: Timeout ошибки**
```
TimeoutError: Navigation timeout of 30000 ms exceeded
```

**Решение:**
- Увеличь `PUPPETEER_TIMEOUT` до 60000 (60s)
- Или апгрейдь на Starter plan ($7/mo) для faster rendering

---

### **Проблема 2: Частые cold starts**
```
--> GET /render/... 500 15s (cold start)
```

**Решение:**
- Проверь что GitHub Actions работает (каждые 12 часов)
- Или апгрейдь на Starter ($7/mo) для always-on

---

### **Проблема 3: Memory ошибки**
```
Out of memory error
```

**Решение:**
- Уменьши `NODE_OPTIONS` до `--max-old-space-size=400`
- Или апгрейдь на Standard plan (2GB RAM)

---

## 🤖 Автоматизация (опционально)

### **Добавить в cron (macOS/Linux):**

```bash
# Проверять каждый час
crontab -e

# Добавить строку:
0 * * * * /path/to/clientpdf-pro/monitor-rendertron.sh >> /tmp/rendertron-monitor.log 2>&1
```

### **Email алерты (если есть mailgun/sendgrid):**

Можно модифицировать `monitor-rendertron.sh` чтобы отправлять email при ошибках.

---

## 📊 Dashboard метрики (Render.com Paid Plans)

На Starter/Standard планах доступны:
- CPU usage graphs
- Memory usage graphs
- Request rate
- Response time percentiles (p50, p95, p99)

---

## 🎯 Целевые показатели

### **Healthy Rendertron:**
- ✅ Uptime: 99%+
- ✅ Response time: 5-15s (warm), 10-30s (cold start)
- ✅ Success rate: 95%+
- ✅ GitHub Actions: 100% successful runs

### **Когда апгрейдить на $7/mo:**
- ⚠️ Cold starts > 20% запросов
- ⚠️ Timeout'ы > 5% запросов
- ⚠️ Google Search Console показывает проблемы с crawl

---

## 📝 Чеклист еженедельного мониторинга

- [ ] Запустить `./monitor-rendertron.sh`
- [ ] Проверить GitHub Actions последние 7 runs
- [ ] Посмотреть Render.com Logs на ошибки
- [ ] Проверить холодные старты (если много → consider upgrade)
- [ ] Раз в месяц: проверить Google Search Console

---

## 🆘 Поддержка

**Если что-то сломалось:**
1. Проверь Render.com Logs для деталей
2. Запусти `./monitor-rendertron.sh` для диагностики
3. Проверь GitHub Actions для Cache Warmer статуса
4. Restart сервиса на Render.com (Settings → Manual Deploy)

**API для автоматизации:**
- Render API docs: https://render.com/docs/api
- Render API key: (сохранен в dashboard settings)

---

**Последнее обновление:** October 1, 2025
**Миграция:** Prerender.io → Rendertron (self-hosted)
**Экономия:** $1,080/год

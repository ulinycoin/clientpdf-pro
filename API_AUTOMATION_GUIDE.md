# 🚀 Prerender.io API Automation - LocalPDF

## ⚡ Quick Start (5 минут)

### 1. Установить токен
```bash
export PRERENDER_IO_TOKEN="your-token-here"
```

### 2. Настроить все 42 URLs автоматически
```bash
node prerender-api-manager.js setup
```

### 3. Проверить статус
```bash
node prerender-monitor.js check
```

**Готово!** 🎉

---

## 📁 Файлы автоматизации

### `prerender-api-manager.js`
**Основной скрипт управления через API**

```bash
# Настройка всех 42 URLs с правильными частотами
node prerender-api-manager.js setup

# Проверка статуса аккаунта
node prerender-api-manager.js status

# Мониторинг базовой статистики
node prerender-api-manager.js monitor

# Очистка кеша (если нужно)
node prerender-api-manager.js clear
```

### `prerender-monitor.js`
**Продвинутый мониторинг и аналитика**

```bash
# Полная проверка всех тиров с рекомендациями
node prerender-monitor.js check

# Быстрая проверка API статуса
node prerender-monitor.js quick
```

---

## 🎯 Структура автоматизации

### Tier Configuration
| Tier | URLs | Frequency | Recache Every |
|------|------|-----------|---------------|
| **Tier 1** | 12 (6 EN + 6 RU) | 48h | 2 days |
| **Tier 2** | 22 (11 EN + 11 RU) | 72h | 3 days |
| **Tier 3** | 8 (4 EN + 4 RU) | 120h | 5 days |
| **Total** | **42 URLs** | - | - |

### API Endpoints Used
- `POST /recache` - Добавление URLs в scheduled rendering
- `POST /change-recache-speed` - Настройка частоты обновления
- `GET /` - Проверка статуса аккаунта
- `POST /clear-cache` - Очистка кеша

---

## 🔧 Подробные команды

### Setup Process (Автоматический)

```bash
node prerender-api-manager.js setup
```

**Что происходит:**
1. ✅ Добавляет 12 Tier 1 URLs (каждые 2 дня)
2. ✅ Добавляет 22 Tier 2 URLs (каждые 3 дня)
3. ✅ Добавляет 8 Tier 3 URLs (каждые 5 дней)
4. ✅ Настраивает правильную скорость recache для каждого тира
5. ✅ Проверяет успешность операций

### Monitoring & Analytics

```bash
node prerender-monitor.js check
```

**Что проверяется:**
- 📊 API Connection Status
- 🧪 Sample URL Testing по тирам
- 📈 Performance Analysis (response times)
- 🤖 Prerender Rate по каждому тиру
- 💡 Автоматические рекомендации
- 📋 Summary Report

---

## 📊 Ожидаемые результаты

### Сразу после setup:
```
✅ 42 URLs added to scheduled rendering
✅ Tier 1: 12 URLs, recache every 2 days
✅ Tier 2: 22 URLs, recache every 3 days
✅ Tier 3: 8 URLs, recache every 5 days
✅ Expected usage: < 20 renders/day
```

### После monitoring:
```
📊 Overall Prerender Rate: 85%+ (хорошо)
📈 Avg Response Time: < 2000ms (отлично)
🎯 Status: READY FOR PRODUCTION!
```

---

## 🚨 Troubleshooting

### Problem: "PRERENDER_IO_TOKEN required"
```bash
# Получить токен в Prerender.io Dashboard > Security and Access
export PRERENDER_IO_TOKEN="your-actual-token"
```

### Problem: "Low prerender rate"
```bash
# Проверить middleware configuration
grep -A 10 "SCHEDULED_RENDERING_WHITELIST" middleware.js

# Тестировать конкретный URL
curl -I -A "Googlebot/2.1" https://localpdf.online/merge-pdf
# Должен возвращать: X-Prerender-Bot: true
```

### Problem: "API connection failed"
```bash
# Проверить токен и API доступность
node prerender-api-manager.js status
```

### Problem: "High response times"
```bash
# Проверить Prerender.io dashboard usage
# Возможно превышен лимит или нужно оптимизировать
```

---

## 🎛️ Advanced Configuration

### Изменить частоты recache:
Отредактировать в `prerender-api-manager.js`:

```javascript
RECACHE_FREQUENCIES: {
  TIER_1: 48,   // Every 2 days (можно изменить)
  TIER_2: 72,   // Every 3 days
  TIER_3: 120,  // Every 5 days
}
```

### Добавить новые URLs:
```javascript
TIER_1: {
  urls: [
    // Добавить новые критичные URLs здесь
    '/new-critical-page',
    '/ru/new-critical-page'
  ]
}
```

### Кастомный мониторинг:
```javascript
// В prerender-monitor.js изменить:
SAMPLE_SIZE: 10,              // Количество URLs для теста
EXPECTED_CACHE_HIT_RATE: 80,  // Ожидаемый cache hit rate
MAX_RENDERS_PER_DAY: 20       // Лимит renders в день
```

---

## 📈 Success Metrics

### Week 1-2: Cache Warmup
- ✅ All 42 URLs in scheduled rendering
- ✅ Prerender rate > 80%
- ✅ No API errors
- ✅ Usage < 20 renders/day

### Month 1: Traffic Impact
- 📈 Organic traffic (EN+RU): +20-30%
- 📊 Google Search Console: Improved crawl stats
- 🤖 Bot requests getting prerendered content

### Month 2-3: Full Results
- 📈 Organic traffic (EN+RU): +40-50%
- 🎯 Cache hit rate: 80%+
- 💡 Decision: Expand to DE/FR/ES?

---

## 🎉 Next Actions

1. **Deploy immediately:**
   ```bash
   export PRERENDER_IO_TOKEN="your-token"
   node prerender-api-manager.js setup
   ```

2. **Daily monitoring (первая неделя):**
   ```bash
   node prerender-monitor.js check
   ```

3. **Weekly review:**
   - Prerender.io dashboard usage
   - Google Search Console crawl stats
   - Organic traffic trends (EN + RU)

4. **Monthly analysis:**
   - Full SEO metrics
   - ROI assessment
   - Expansion decision

---

## 💡 Pro Tips

- **Logs:** Все скрипты логируют подробную информацию для debugging
- **Batch operations:** API скрипт обрабатывает все URLs пакетами для эффективности
- **Error handling:** Автоматический retry и fallback для стабильности
- **Performance:** Асинхронные операции для быстрой работы
- **Monitoring:** Цветной вывод и прогресс-индикаторы для удобства

**🚀 Ready to boost organic traffic by 20-50%!**
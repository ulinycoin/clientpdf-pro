# 🚂 Развертывание Rendertron на Railway.app

## 🎯 Преимущества Railway

- ✅ $5 бесплатных кредитов БЕЗ карты
- ✅ Деплой за 5 минут
- ✅ Автоматический SSL
- ✅ НЕТ cold start
- ✅ $5-7/месяц после кредитов

---

## 📋 Пошаговая инструкция

### **ШАГ 1: Регистрация**

1. Откройте https://railway.app/
2. Войдите через GitHub
3. Подтвердите email
4. Получите $5 бесплатных кредитов

---

### **ШАГ 2: Создать новый проект**

1. В Railway Dashboard нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Выберите репозиторий: `ulinycoin/clientpdf-pro`
4. Railway автоматически обнаружит `Dockerfile.rendertron`

---

### **ШАГ 3: Настроить переменные окружения**

В Railway Dashboard → Settings → Variables добавьте:

```
PORT=8080
NODE_ENV=production
CACHE_MAX_AGE=3600
TIMEOUT=25000
CONCURRENCY=5
```

---

### **ШАГ 4: Настроить домен**

Railway автоматически создаст домен типа:
```
https://localpdf-rendertron-production.up.railway.app
```

Или добавьте кастомный домен в Settings → Domains.

---

### **ШАГ 5: Деплой**

Railway автоматически начнет деплой после коммита в main ветку.

Следите за логами в Railway Dashboard → Deployments.

**Ожидаемое время деплоя:** 3-5 минут

---

### **ШАГ 6: Получить URL Rendertron**

После деплоя скопируйте URL из Railway Dashboard:

```
https://YOUR-PROJECT.up.railway.app
```

**ВАЖНО:** Добавьте `/render` в конец для middleware:
```
https://YOUR-PROJECT.up.railway.app/render
```

---

### **ШАГ 7: Обновить middleware.js**

Откройте `middleware.js` и замените:

```javascript
const PRERENDER_IO_CONFIG = {
  serviceUrl: process.env.RENDERTRON_URL || 'https://YOUR-PROJECT.up.railway.app/render',
  timeout: 15000,
  enableLogging: process.env.NODE_ENV === 'development'
};
```

---

### **ШАГ 8: Добавить переменную в Vercel**

```bash
vercel env add RENDERTRON_URL production
```

**Значение:**
```
https://YOUR-PROJECT.up.railway.app/render
```

---

### **ШАГ 9: Тестирование**

```bash
# Проверить работу Rendertron
curl "https://YOUR-PROJECT.up.railway.app/render/https://localpdf.online/merge-pdf"

# Проверить время ответа
time curl -s "https://YOUR-PROJECT.up.railway.app/render/https://localpdf.online/compress-pdf" > /dev/null

# Проверить title
curl -s "https://YOUR-PROJECT.up.railway.app/render/https://localpdf.online/merge-pdf" | grep -o '<title>.*</title>'
```

**Ожидаемые результаты:**
- ✅ Время ответа: 3-7 секунд
- ✅ Title: `Merge PDF Files for Free - LocalPDF`
- ✅ Полный HTML с контентом

---

## 📊 Мониторинг

### **Логи:**
Railway Dashboard → Deployments → View Logs

### **Метрики:**
Railway Dashboard → Metrics
- CPU usage
- Memory usage
- Request count

### **Стоимость:**
Railway Dashboard → Billing
- $5 бесплатных кредитов
- После - ~$5-7/месяц

---

## 🔧 Troubleshooting

### **Проблема: Build failed**

Проверьте логи в Railway Dashboard. Обычно помогает:
- Убедиться что `Dockerfile.rendertron` в корне репозитория
- Проверить syntax в Dockerfile

### **Проблема: Out of memory**

Увеличьте память в Railway Settings:
- Перейдите в Settings → Resources
- Увеличьте Memory до 1GB или 2GB

### **Проблема: Timeout**

Увеличьте timeout в переменных окружения:
```
TIMEOUT=30000
```

---

## ✅ Готово!

После деплоя:
1. ✅ Rendertron работает на Railway
2. ✅ НЕТ 504 Gateway Timeout
3. ✅ Все страницы рендерятся <5 сек
4. ✅ Ahrefs видит контент правильно
5. ✅ Google/Yandex индексируют сайт

**Ожидайте улучшения индексации через 1-2 недели!** 🚀

---

## 💰 Стоимость

**Первый месяц:** БЕСПЛАТНО ($5 кредитов хватит на ~500K запросов)

**После $5 кредитов:**
- Starter: $5/месяц (512MB RAM, 0.5 vCPU)
- Pro: $20/месяц (8GB RAM, 8 vCPU) - избыточно для нас

**Рекомендуем:** Starter ($5/месяц) - более чем достаточно для Rendertron.

---

## 🔄 Автоматический деплой

Railway автоматически деплоит при каждом push в main:

```bash
git add .
git commit -m "update rendertron config"
git push origin main
```

Railway обнаружит изменения и пересоберет контейнер за ~3 минуты.

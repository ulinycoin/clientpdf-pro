# 🚀 Развертывание Rendertron на Google Cloud Run

## 📋 Пошаговая инструкция

### **ШАГ 1: Установка Google Cloud SDK**

#### **macOS:**
```bash
brew install --cask google-cloud-sdk
```

#### **Linux:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

#### **Windows:**
Скачайте установщик: https://cloud.google.com/sdk/docs/install

---

### **ШАГ 2: Инициализация и аутентификация**

```bash
# Инициализация gcloud
gcloud init

# Войти в аккаунт
gcloud auth login

# Выбрать проект (или создать новый)
gcloud projects create localpdf-rendertron --name="LocalPDF Rendertron"

# Установить активный проект
gcloud config set project localpdf-rendertron

# Включить необходимые API
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com
```

---

### **ШАГ 3: Развертывание Rendertron**

#### **Вариант A: Автоматический деплой через Cloud Build** (рекомендуется)

```bash
# Перейти в директорию проекта
cd /Users/aleksejs/Desktop/clientpdf-pro

# Деплой через Cloud Build (автоматически соберет и развернет)
gcloud builds submit --config cloudbuild.yaml

# Получить URL сервиса
gcloud run services describe localpdf-rendertron \
  --region us-central1 \
  --format 'value(status.url)'
```

**Ожидаемый результат:**
```
https://localpdf-rendertron-XXXXXXXXXX-uc.a.run.app
```

---

#### **Вариант B: Ручной деплой** (если нужен контроль)

```bash
# 1. Собрать Docker образ
docker build -f Dockerfile.rendertron -t gcr.io/localpdf-rendertron/rendertron:latest .

# 2. Push в Container Registry
docker push gcr.io/localpdf-rendertron/rendertron:latest

# 3. Деплой на Cloud Run
gcloud run deploy localpdf-rendertron \
  --image gcr.io/localpdf-rendertron/rendertron:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --timeout 60s \
  --concurrency 80 \
  --set-env-vars NODE_ENV=production,CACHE_MAX_AGE=3600,TIMEOUT=25000
```

---

### **ШАГ 4: Получить URL и обновить middleware**

```bash
# Получить URL Rendertron
export RENDERTRON_URL=$(gcloud run services describe localpdf-rendertron \
  --region us-central1 \
  --format 'value(status.url)')

echo "Ваш Rendertron URL: $RENDERTRON_URL"
```

**Пример URL:**
```
https://localpdf-rendertron-abc123-uc.a.run.app
```

---

### **ШАГ 5: Обновить middleware.js**

Откройте `middleware.js` и замените:

```javascript
// БЫЛО:
const PRERENDER_IO_CONFIG = {
  serviceUrl: process.env.PRERENDER_SERVICE_URL || 'https://localpdf-rendertron.onrender.com/render',
  timeout: 30000,
  enableLogging: process.env.NODE_ENV === 'development'
};

// СТАЛО:
const PRERENDER_IO_CONFIG = {
  serviceUrl: process.env.RENDERTRON_URL || 'https://localpdf-rendertron-XXXXXXXX-uc.a.run.app/render',
  timeout: 15000, // Уменьшено до 15 сек (Cloud Run быстрее!)
  enableLogging: process.env.NODE_ENV === 'development'
};
```

---

### **ШАГ 6: Добавить переменную окружения в Vercel**

```bash
# Через Vercel CLI
vercel env add RENDERTRON_URL production

# Или через Vercel Dashboard:
# https://vercel.com/YOUR_PROJECT/settings/environment-variables
```

**Значение:**
```
https://localpdf-rendertron-XXXXXXXX-uc.a.run.app/render
```

---

### **ШАГ 7: Тестирование**

```bash
# Тест 1: Проверить что Rendertron работает
curl "https://localpdf-rendertron-XXXXXXXX-uc.a.run.app/render/https://localpdf.online/merge-pdf"

# Тест 2: Проверить время ответа
time curl -s "https://localpdf-rendertron-XXXXXXXX-uc.a.run.app/render/https://localpdf.online/compress-pdf" > /dev/null

# Тест 3: Проверить title tag
curl -s "https://localpdf-rendertron-XXXXXXXX-uc.a.run.app/render/https://localpdf.online/merge-pdf" | grep -o '<title>.*</title>'
```

**Ожидаемые результаты:**
- ✅ Страница рендерится
- ✅ Время ответа: 3-7 секунд
- ✅ Title: `Merge PDF Files for Free - LocalPDF`

---

### **ШАГ 8: Деплой на Vercel**

```bash
git add .
git commit -m "feat: migrate to Google Cloud Run for Rendertron

- Deployed Rendertron on Cloud Run with 1GB RAM
- Min instances: 1 (no cold start)
- Timeout reduced to 15s (Cloud Run is faster)
- Fixes 504 Gateway Timeout issues from Ahrefs
- Expected <5s response time for all pages

🤖 Generated with Claude Code"

git push origin main

# Vercel автоматически задеплоит
```

---

## 📊 Мониторинг и метрики

### **Посмотреть логи Cloud Run:**
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=localpdf-rendertron" \
  --limit 50 \
  --format json
```

### **Метрики производительности:**
```bash
# Через Cloud Console
https://console.cloud.google.com/run/detail/us-central1/localpdf-rendertron/metrics
```

### **Стоимость:**
```bash
# Через Billing
https://console.cloud.google.com/billing
```

---

## 💰 Ожидаемая стоимость

**Конфигурация:**
- 1 instance постоянно (min-instances: 1)
- 1GB RAM, 1 vCPU
- ~2-5M запросов/месяц

**Стоимость из $300 кредитов:**
- Месяц 1-3: **$0** (бесплатные $300 кредитов)
- После 90 дней: **$10-15/месяц**

**Экономия vs Prerender.io:**
- Prerender.io: $90/месяц
- Cloud Run: $12/месяц
- **Экономия: $78/месяц = $936/год**

---

## 🔧 Troubleshooting

### **Проблема: "Permission denied"**
```bash
gcloud auth login
gcloud auth application-default login
```

### **Проблема: "Service not found"**
```bash
gcloud run services list --region us-central1
```

### **Проблема: "Out of memory"**
```bash
# Увеличить память до 2GB
gcloud run services update localpdf-rendertron \
  --region us-central1 \
  --memory 2Gi
```

### **Проблема: "Cold start delay"**
```bash
# Проверить что min-instances установлен
gcloud run services describe localpdf-rendertron \
  --region us-central1 \
  --format 'value(spec.template.metadata.annotations["autoscaling.knative.dev/minScale"])'
```

---

## ✅ Готово!

После деплоя:
1. ✅ Все страницы рендерятся за <5 секунд
2. ✅ Нет 504 Gateway Timeout ошибок
3. ✅ Ahrefs видит контент правильно
4. ✅ Google/Yandex индексируют сайт

**Ожидайте улучшения индексации через 1-2 недели!** 🚀

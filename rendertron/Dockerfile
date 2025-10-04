# Optimized Rendertron Dockerfile for Google Cloud Run
# Based on official rendertron/rendertron with Cloud Run optimizations

FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm1 \
    libxshmfence1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome Stable
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Rendertron
RUN npm install -g rendertron@3.1.0

# Create cache directory for Chrome (improves startup time)
RUN mkdir -p /app/.cache/puppeteer \
    && chmod -R 777 /app/.cache

# Environment variables for Cloud Run optimization
ENV PORT=8080 \
    NODE_ENV=production \
    CHROME_BIN=/usr/bin/google-chrome-stable \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    # Performance optimizations
    PUPPETEER_TIMEOUT=25000 \
    CHROME_CACHE_DIR=/app/.cache/puppeteer \
    # Memory optimization for Cloud Run (512MB-1GB instances)
    NODE_OPTIONS="--max-old-space-size=768"

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Non-root user for security (use existing node user in node:18-slim)
RUN chown -R node:node /app
USER node

# Expose Cloud Run default port
EXPOSE 8080

# Start Rendertron with optimized Chrome flags for Cloud Run
CMD ["rendertron", "--port", "8080", "--chrome-flags", "--no-sandbox,--disable-dev-shm-usage,--disable-gpu,--disable-software-rasterizer,--disable-extensions"]

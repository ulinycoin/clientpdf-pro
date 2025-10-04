#!/bin/bash
# Start script for Rendertron + Cache Proxy on Google Cloud Run

set -e

echo "🚀 Starting Rendertron with GCS Caching..."

# Start Rendertron on port 3000 in background
cd /app/rendertron
echo "📦 Starting Rendertron on port 3000..."
# Explicitly set PORT=3000 for Rendertron (overrides ENV PORT=8080)
PORT=3000 node build/rendertron.js --port 3000 --chrome-flags "--no-sandbox,--disable-dev-shm-usage,--disable-gpu,--disable-software-rasterizer,--disable-extensions" > /tmp/rendertron.log 2>&1 &
RENDERTRON_PID=$!

# Wait for Rendertron to be ready (check if port 3000 is listening)
echo "⏳ Waiting for Rendertron to start..."
for i in {1..30}; do
  if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "✅ Rendertron is ready!"
    break
  fi
  echo "   Attempt $i/30..."
  sleep 1
done

# Verify Rendertron is actually running
if ! curl -s http://localhost:3000/ > /dev/null 2>&1; then
  echo "❌ Rendertron failed to start! Logs:"
  cat /tmp/rendertron.log
  exit 1
fi

# Start Cache Proxy on port 8080 (Cloud Run port) - FOREGROUND
cd /app
echo "💾 Starting GCS Cache Proxy on port 8080 (foreground)..."
echo "   - Rendertron PID: $RENDERTRON_PID"

# Run cache proxy in foreground (Cloud Run will manage it)
exec node cache-proxy.js

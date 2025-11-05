#!/bin/bash
# Push to GitHub and trigger Vercel deployment

set -e

echo "📤 Pushing to GitHub..."
git push "$@"

echo ""
echo "🚀 Triggering Vercel deployment..."
response=$(curl -s -X POST https://api.vercel.com/v1/integrations/deploy/prj_5mENtu9k0up9sVBZcHDXU5tn9ctF/PMtMcJ0lrQ)

if echo "$response" | grep -q "PENDING\|RUNNING"; then
  job_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "✅ Deployment triggered successfully!"
  echo "   Job ID: $job_id"
  echo "   Status: https://vercel.com/dashboard"
else
  echo "⚠️  Response: $response"
fi
echo ""
echo "✨ Done! Check Vercel Dashboard for deployment progress."

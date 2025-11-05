#!/bin/bash
# Trigger Vercel deployment manually

echo "🚀 Triggering Vercel deployment..."
response=$(curl -s -X POST https://api.vercel.com/v1/integrations/deploy/prj_5mENtu9k0up9sVBZcHDXU5tn9ctF/PMtMcJ0lrQ)
echo "$response" | jq '.'

job_id=$(echo "$response" | jq -r '.job.id')
state=$(echo "$response" | jq -r '.job.state')

echo ""
echo "✅ Deployment triggered!"
echo "Job ID: $job_id"
echo "State: $state"
echo ""
echo "Check status at: https://vercel.com/dashboard"

#!/bin/bash

# IndexNow submission script for LocalPDF
API_KEY="be13ab7c5d7548a1b51e5ce3c969af42"
HOST="localpdf.online"

echo "Submitting 12 updated pages to IndexNow..."

# Submit via POST request
curl -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "localpdf.online",
    "key": "be13ab7c5d7548a1b51e5ce3c969af42",
    "keyLocation": "https://localpdf.online/be13ab7c5d7548a1b51e5ce3c969af42.txt",
    "urlList": [
      "https://localpdf.online/",
      "https://localpdf.online/merge-pdf",
      "https://localpdf.online/split-pdf",
      "https://localpdf.online/compress-pdf",
      "https://localpdf.online/protect-pdf",
      "https://localpdf.online/ocr-pdf",
      "https://localpdf.online/watermark-pdf",
      "https://localpdf.online/rotate-pdf",
      "https://localpdf.online/delete-pages-pdf",
      "https://localpdf.online/extract-pages-pdf",
      "https://localpdf.online/add-text-pdf",
      "https://localpdf.online/images-to-pdf"
    ]
  }'

echo ""
echo "IndexNow submission completed!"
echo "Note: Pages will be indexed by Bing and Yandex within 24 hours."

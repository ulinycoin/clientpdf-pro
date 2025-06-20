#!/bin/bash
# Update dependencies and regenerate package-lock.json

echo "Updating dependencies and regenerating package-lock.json..."

# Remove old package-lock.json
rm -f package-lock.json

# Clean npm cache
npm cache clean --force

# Install dependencies with updated versions
npm install

echo "Dependencies updated successfully!"

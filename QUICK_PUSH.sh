#!/bin/bash

# Quick GitHub Push Script
# Run this after creating your GitHub repository

echo "🚀 LocalPDF v3 - Quick GitHub Push"
echo "=================================="
echo ""

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo "✓ Remote 'origin' already configured"
    git remote -v
else
    echo "⚠️  No remote configured yet!"
    echo ""
    echo "Please run one of these commands first:"
    echo ""
    echo "HTTPS:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    echo "SSH:"
    echo "  git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    exit 1
fi

echo ""
echo "Current status:"
git status --short
echo ""

# Confirm push
read -p "Push to GitHub? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing main branch..."
    git push -u origin main

    echo ""
    echo "Pushing tags..."
    git push origin --tags

    echo ""
    echo "✅ Done! Your code is now on GitHub."
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Create a release from tag v3.0.0"
    echo "3. Add repository description and topics"
else
    echo "Push cancelled."
fi

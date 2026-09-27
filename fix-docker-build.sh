#!/bin/bash

# Script để fix Docker build issues
# Chạy script này trước khi build Docker

echo "🔧 Fixing Docker build issues..."

# 1. Remove old lock file
echo "📦 Removing old package-lock.json..."
rm -f package-lock.json

# 2. Clean node_modules
echo "🧹 Cleaning node_modules..."
rm -rf node_modules

# 3. Install fresh dependencies
echo "📥 Installing fresh dependencies..."
npm install

# 4. Build project
echo "🏗️  Building project..."
npm run build

# 5. Build Docker
echo "🐳 Building Docker image..."
docker-compose build --no-cache

echo "✅ Done! You can now run: docker-compose up -d"

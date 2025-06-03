#!/bin/bash

# Quick Cloud Run Setup Script
set -e

echo "🚀 Props Lead Management - Cloud Run Setup"
echo "=========================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed."
    echo "📋 Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Prompt for project ID if not set
if [ -z "$GOOGLE_CLOUD_PROJECT" ]; then
    echo "📋 Enter your Google Cloud Project ID:"
    read -r GOOGLE_CLOUD_PROJECT
    export GOOGLE_CLOUD_PROJECT
fi

echo "🔧 Setting up Google Cloud configuration..."

# Authenticate and set project
gcloud auth login --quiet || true
gcloud config set project "$GOOGLE_CLOUD_PROJECT"

echo "✅ Project set to: $GOOGLE_CLOUD_PROJECT"

# Enable required APIs
echo "🔌 Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Configure Docker
echo "🐳 Configuring Docker authentication..."
gcloud auth configure-docker --quiet

# Create environment file for Cloud Run
echo "📝 Creating Cloud Run environment configuration..."
if [ -f ".env.local" ]; then
    cp .env.local .env.cloudrun
    echo "GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT" >> .env.cloudrun
    echo "NODE_ENV=production" >> .env.cloudrun
    echo "NEXT_PUBLIC_CLOUD_RUN_URL=https://props-lead-api-$GOOGLE_CLOUD_PROJECT.us-central1.run.app" >> .env.cloudrun
    echo "CLOUD_RUN_API_URL=https://props-lead-api-$GOOGLE_CLOUD_PROJECT.us-central1.run.app" >> .env.cloudrun
    echo "✅ Created .env.cloudrun with your configuration"
else
    echo "⚠️  .env.local not found. Please create it first with your environment variables."
fi

echo ""
echo "🎉 Cloud Run setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the build: npm run cloudrun:build"
echo "2. Deploy to Cloud Run: npm run deploy:cloudrun"
echo "3. Add NEXT_PUBLIC_CLOUD_RUN_URL to your Vercel environment variables"
echo ""
echo "📚 For detailed instructions, see: docs/CLOUD_RUN_SETUP.md"
echo ""
echo "Your Cloud Run URL will be:"
echo "https://props-lead-api-$GOOGLE_CLOUD_PROJECT.us-central1.run.app" 
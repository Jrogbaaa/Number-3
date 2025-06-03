#!/bin/bash

# Cloud Run Deployment Script for Props Lead Management
set -e

# Configuration
PROJECT_ID="leads-460411"
SERVICE_NAME="props-lead-api"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Starting Cloud Run deployment for $SERVICE_NAME in project $PROJECT_ID"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build the Next.js app locally first
echo "🏗️  Building Next.js application locally..."
npm run build

# Authenticate with Google Cloud
echo "🔐 Authenticating with Google Cloud..."
gcloud auth configure-docker

# Set the project
echo "📋 Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Temporarily swap dockerignore files
mv .dockerignore .dockerignore.backup
cp .dockerignore.simple .dockerignore

# Build the Docker image using the simple Dockerfile
echo "🐳 Building Docker image..."
docker build -f Dockerfile.simple -t $IMAGE_NAME .

# Restore original dockerignore
mv .dockerignore.backup .dockerignore

# Push the image to Google Container Registry
echo "📤 Pushing image to Container Registry..."
docker push $IMAGE_NAME

# Create secrets if they don't exist
echo "🔑 Setting up secrets..."

# Load environment variables
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

# Individual secrets for each environment variable
if ! gcloud secrets describe nextauth-secret --quiet 2>/dev/null; then
    echo "Creating nextauth-secret..."
    echo -n "$NEXTAUTH_SECRET" | gcloud secrets create nextauth-secret --data-file=-
fi

if ! gcloud secrets describe google-client-id --quiet 2>/dev/null; then
    echo "Creating google-client-id..."
    echo -n "$GOOGLE_CLIENT_ID" | gcloud secrets create google-client-id --data-file=-
fi

if ! gcloud secrets describe google-client-secret --quiet 2>/dev/null; then
    echo "Creating google-client-secret..."
    echo -n "$GOOGLE_CLIENT_SECRET" | gcloud secrets create google-client-secret --data-file=-
fi

if ! gcloud secrets describe supabase-url --quiet 2>/dev/null; then
    echo "Creating supabase-url..."
    echo -n "$SUPABASE_URL" | gcloud secrets create supabase-url --data-file=-
fi

if ! gcloud secrets describe supabase-anon-key --quiet 2>/dev/null; then
    echo "Creating supabase-anon-key..."
    echo -n "$SUPABASE_ANON_KEY" | gcloud secrets create supabase-anon-key --data-file=-
fi

if ! gcloud secrets describe supabase-service-role-key --quiet 2>/dev/null; then
    echo "Creating supabase-service-role-key..."
    echo -n "$SUPABASE_SERVICE_ROLE_KEY" | gcloud secrets create supabase-service-role-key --data-file=-
fi

if ! gcloud secrets describe firecrawl-api-key --quiet 2>/dev/null; then
    echo "Creating firecrawl-api-key..."
    echo -n "$FIRECRAWL_API_KEY" | gcloud secrets create firecrawl-api-key --data-file=-
fi

# Deploy to Cloud Run using gcloud run deploy (simpler than YAML)
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --min-instances 0 \
    --timeout 300s \
    --concurrency 100 \
    --set-env-vars NODE_ENV=production,PORT=8080 \
    --set-env-vars NEXTAUTH_URL=https://$SERVICE_NAME-$PROJECT_ID.$REGION.run.app \
    --set-env-vars NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL \
    --set-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
    --set-secrets NEXTAUTH_SECRET=nextauth-secret:latest \
    --set-secrets GOOGLE_CLIENT_ID=google-client-id:latest \
    --set-secrets GOOGLE_CLIENT_SECRET=google-client-secret:latest \
    --set-secrets SUPABASE_URL=supabase-url:latest \
    --set-secrets SUPABASE_ANON_KEY=supabase-anon-key:latest \
    --set-secrets SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest \
    --set-secrets FIRECRAWL_API_KEY=firecrawl-api-key:latest

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)')

echo "✅ Deployment completed successfully!"
echo "🌍 Service URL: $SERVICE_URL"
echo ""
echo "📋 Next steps:"
echo "1. Update your Vercel environment variables:"
echo "   NEXT_PUBLIC_CLOUD_RUN_URL=$SERVICE_URL"
echo "   CLOUD_RUN_API_URL=$SERVICE_URL"
echo "2. Test the API endpoints"
echo "3. Monitor performance in Cloud Console"
echo ""
echo "🧪 Test health endpoint:"
echo "   curl $SERVICE_URL/health"

echo "🎉 Cloud Run setup complete!" 
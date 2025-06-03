# Google Cloud Run Setup Guide

This guide will help you set up Google Cloud Run to handle heavy processing operations while keeping Vercel for your frontend hosting.

## Prerequisites

1. **Google Cloud Platform Account**
   - Sign up at [cloud.google.com](https://cloud.google.com)
   - Enable billing for your project
   - Create a new project or use an existing one

2. **Required Tools**
   - [Google Cloud CLI (gcloud)](https://cloud.google.com/sdk/docs/install)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Node.js 18+ (already installed)

## Step 1: Initial Setup

### 1.1 Install and Configure Google Cloud CLI

```bash
# Install gcloud CLI (if not already installed)
# Follow instructions at: https://cloud.google.com/sdk/docs/install

# Authenticate with Google Cloud
gcloud auth login

# Set your project ID
export GOOGLE_CLOUD_PROJECT="your-project-id"
gcloud config set project $GOOGLE_CLOUD_PROJECT

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 1.2 Configure Docker Authentication

```bash
# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker
```

## Step 2: Environment Configuration

### 2.1 Update Environment Variables

1. Copy your current `.env.local` file:
   ```bash
   cp .env.local .env.cloudrun
   ```

2. Update `.env.cloudrun` with your Google Cloud project:
   ```bash
   # Add these lines to .env.cloudrun
   GOOGLE_CLOUD_PROJECT=your-actual-project-id
   NEXT_PUBLIC_CLOUD_RUN_URL=https://props-lead-api-YOUR_PROJECT_ID.us-central1.run.app
   CLOUD_RUN_API_URL=https://props-lead-api-YOUR_PROJECT_ID.us-central1.run.app
   NODE_ENV=production
   ```

3. Update your Vercel environment variables:
   - Go to your Vercel dashboard
   - Add `NEXT_PUBLIC_CLOUD_RUN_URL` with your Cloud Run URL
   - This enables the frontend to call Cloud Run APIs

## Step 3: Deploy to Cloud Run

### 3.1 Automated Deployment

```bash
# Make sure you're in the project root directory
cd /path/to/your/project

# Run the deployment script
npm run deploy:cloudrun
```

### 3.2 Manual Deployment (Alternative)

If the automated script doesn't work:

```bash
# 1. Build the Docker image
docker build -t gcr.io/$GOOGLE_CLOUD_PROJECT/props-lead-api .

# 2. Push to Container Registry
docker push gcr.io/$GOOGLE_CLOUD_PROJECT/props-lead-api

# 3. Create secrets in Google Cloud
echo -n "$NEXTAUTH_SECRET" | gcloud secrets create nextauth-secret --data-file=-
echo "{\"client_id\":\"$GOOGLE_CLIENT_ID\",\"client_secret\":\"$GOOGLE_CLIENT_SECRET\"}" | gcloud secrets create google-oauth --data-file=-
echo "{\"url\":\"$SUPABASE_URL\",\"anon_key\":\"$SUPABASE_ANON_KEY\",\"service_role_key\":\"$SUPABASE_SERVICE_ROLE_KEY\"}" | gcloud secrets create supabase-config --data-file=-
echo "{\"api_key\":\"$FIRECRAWL_API_KEY\"}" | gcloud secrets create firecrawl-config --data-file=-

# 4. Update cloudrun.yaml with your project ID
sed "s/PROJECT_ID/$GOOGLE_CLOUD_PROJECT/g" cloudrun.yaml > cloudrun-deploy.yaml

# 5. Deploy the service
gcloud run services replace cloudrun-deploy.yaml --region=us-central1

# 6. Make it publicly accessible
gcloud run services add-iam-policy-binding props-lead-api \
    --region=us-central1 \
    --member="allUsers" \
    --role="roles/run.invoker"
```

## Step 4: Test the Deployment

### 4.1 Health Check

```bash
# Get your service URL
SERVICE_URL=$(gcloud run services describe props-lead-api --region=us-central1 --format='value(status.url)')

# Test health endpoint
curl $SERVICE_URL/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "environment": "production",
  "version": "15.13.14"
}
```

### 4.2 Test API Endpoints

```bash
# Test website scraping (requires authentication)
curl -X POST $SERVICE_URL/api/scrape-website \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","type":"website"}'
```

## Step 5: Frontend Integration

### 5.1 Update Your Frontend Code

The Cloud Run integration is already built into your application. When `NEXT_PUBLIC_CLOUD_RUN_URL` is set, heavy operations will automatically route to Cloud Run:

```typescript
import { getCloudRunClient, apiWithFallback } from '@/lib/cloudrun';

// Example: Website scraping will use Cloud Run if available
const scrapeWebsite = async (url: string) => {
  return apiWithFallback(
    () => getCloudRunClient().scrapeWebsite({ url, type: 'website' }),
    () => fetch('/api/scrape-website', { method: 'POST', body: JSON.stringify({ url }) })
  );
};
```

### 5.2 Heavy Processing Operations

These operations will automatically use Cloud Run when configured:

- **Lead Upload & Processing** (`/api/upload-leads`)
- **Website Scraping** (`/api/scrape-website`)
- **Lead Rescoring** (`/api/rescore-leads`)
- **HeyGen Video Generation** (`/api/create-heygen-video`)

## Step 6: Monitoring and Scaling

### 6.1 View Logs

```bash
# View service logs
gcloud run services logs read props-lead-api --region=us-central1

# Follow logs in real-time
gcloud run services logs tail props-lead-api --region=us-central1
```

### 6.2 Monitor Performance

- **Cloud Console**: [https://console.cloud.google.com/run](https://console.cloud.google.com/run)
- **Metrics**: CPU usage, memory usage, request count, latency
- **Scaling**: Automatic scaling from 0 to 10 instances (configurable)

### 6.3 Update Resource Limits

Edit `cloudrun.yaml` to adjust:
- CPU: `1` to `4` cores
- Memory: `1Gi` to `8Gi`
- Timeout: Up to `3600s` (60 minutes)
- Concurrency: `1` to `1000` requests per instance

## Step 7: Cost Optimization

### 7.1 Current Configuration

- **CPU**: 2 cores
- **Memory**: 2GB
- **Scaling**: 0 to 10 instances
- **Timeout**: 300 seconds

### 7.2 Estimated Costs

With moderate usage (1000 requests/month):
- **Compute**: ~$5-15/month
- **Requests**: ~$0.40/month
- **Storage**: ~$1/month

Much cheaper than upgrading Vercel plans for the same performance!

## Troubleshooting

### Common Issues

1. **"Service not found" error**
   ```bash
   # Check if service exists
   gcloud run services list --region=us-central1
   ```

2. **"Permission denied" error**
   ```bash
   # Make service public
   gcloud run services add-iam-policy-binding props-lead-api \
       --region=us-central1 \
       --member="allUsers" \
       --role="roles/run.invoker"
   ```

3. **Environment variables not loaded**
   ```bash
   # Check secrets
   gcloud secrets list
   
   # View secret content
   gcloud secrets versions access latest --secret="nextauth-secret"
   ```

4. **Build failures**
   ```bash
   # Test build locally
   npm run cloudrun:build
   npm run cloudrun:test
   ```

### Support

- **Google Cloud Documentation**: [cloud.google.com/run/docs](https://cloud.google.com/run/docs)
- **Cloud Run Pricing**: [cloud.google.com/run/pricing](https://cloud.google.com/run/pricing)
- **Issue Tracker**: Open an issue in your repository

## Security Best Practices

1. **Use Secrets Manager** for sensitive data (already configured)
2. **Enable VPC Connector** for database connections (if needed)
3. **Set up IAM roles** for least-privilege access
4. **Enable audit logging** for production deployments
5. **Use custom domains** with SSL certificates

Your Cloud Run setup is now complete! 🚀 
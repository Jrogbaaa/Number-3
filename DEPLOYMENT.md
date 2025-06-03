# Deployment Guide

This guide covers deployment options for the PROPS Lead Management Platform.

## 🚀 Quick Start: Cloud Run Deployment

### Prerequisites
- Google Cloud account
- Docker installed and running
- gcloud CLI installed and authenticated
- Project environment variables configured

### Step 1: Configure Environment Variables

Create a `.env.local` file with all required variables:
```bash
# Copy from env.sample and fill in your values
cp env.sample .env.local
```

Required variables:
```env
NEXTAUTH_SECRET=your-secure-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
SUPABASE_URL=https://kodddurybogqynkswrzp.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
FIRECRAWL_API_KEY=your-firecrawl-api-key
```

### Step 2: Deploy to Cloud Run

```bash
# Make script executable
chmod +x scripts/deploy-cloudrun.sh

# Deploy (this will create secrets, build, and deploy)
./scripts/deploy-cloudrun.sh
```

The script will:
1. Build your Next.js application
2. Create Docker image with platform-specific build
3. Push to Google Container Registry
4. Create Google Secret Manager secrets
5. Deploy to Cloud Run with proper configuration

### Step 3: Update OAuth Settings

After deployment, update your OAuth providers with the new URLs:

**Google OAuth Console:**
- Authorized redirect URI: `https://your-service-url.run.app/api/auth/callback/google`

**Supabase Auth Settings:**
- Redirect URL: `https://your-service-url.run.app/api/auth/callback`

## 🔧 Cloud Run Configuration

### Service Specifications
- **Memory**: 2GB
- **CPU**: 2 cores
- **Scaling**: 0-10 instances (auto-scaling)
- **Timeout**: 300 seconds
- **Concurrency**: 100 requests per instance

### Environment Variables
The following environment variables are set in Cloud Run:
- `NODE_ENV=production`
- `NEXTAUTH_URL` (auto-configured to your service URL)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Secrets Management
Sensitive data is stored in Google Secret Manager:
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIRECRAWL_API_KEY`

## 🧪 Testing Your Deployment

### Health Checks
```bash
# Test basic connectivity
curl https://your-service-url.run.app/api/debug-env

# Test Supabase connection
curl https://your-service-url.run.app/api/test-supabase

# Expected response: {"success":true,"message":"Supabase connection successful",...}
```

### Feature Testing
1. **Authentication**: Visit your service URL and test Google login
2. **Database**: Upload a CSV file and verify lead processing
3. **Website Scraping**: Test the onboarding website context step
4. **AI Features**: Test message generation and lead scoring

## 🔄 Vercel Deployment (Alternative)

For frontend-only deployment:

### Step 1: Deploy to Vercel
```bash
npx vercel
```

### Step 2: Configure Environment Variables in Vercel
Add these in your Vercel dashboard:
```env
NEXTAUTH_SECRET=your-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_SUPABASE_URL=https://kodddurybogqynkswrzp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
FIRECRAWL_API_KEY=your-firecrawl-api-key
REPLICATE_API_KEY=your-replicate-api-key
HEYGEN_API_KEY=your-heygen-api-key

# If using Cloud Run for backend
NEXT_PUBLIC_CLOUD_RUN_URL=https://your-cloud-run-service-url.run.app
CLOUD_RUN_API_URL=https://your-cloud-run-service-url.run.app
```

## 🛠 Troubleshooting

### Common Issues

**Build Failures:**
- Ensure all environment variables are set
- Check Docker is running
- Verify gcloud authentication

**Secret Manager Errors:**
```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**Authentication Issues:**
- Verify OAuth redirect URIs match your deployment URLs
- Check NEXTAUTH_URL environment variable
- Ensure Supabase auth settings are updated

### Logs and Monitoring
```bash
# View Cloud Run logs
gcloud run services logs read props-lead-api --region=us-central1

# View recent logs
gcloud run services logs tail props-lead-api --region=us-central1
```

## 📊 Performance Optimization

### Cloud Run Optimizations
- **Min instances**: Set to 0 for cost efficiency
- **Max instances**: Limited to 10 for resource control
- **CPU allocation**: Always allocated for consistent performance
- **Memory**: 2GB handles large CSV processing

### Caching Strategy
- Static assets cached via Next.js
- API responses cached where appropriate
- Database queries optimized with proper indexing

## 🔒 Security Considerations

### Production Security Checklist
- [ ] All secrets stored in Google Secret Manager
- [ ] OAuth redirect URIs properly configured
- [ ] Supabase RLS policies enabled
- [ ] NEXTAUTH_SECRET is cryptographically secure
- [ ] Environment variables don't contain sensitive data
- [ ] API routes have proper authentication
- [ ] CORS configured correctly for your domain

### Best Practices
- Rotate secrets regularly
- Monitor access logs
- Use least-privilege IAM roles
- Enable audit logging
- Implement proper error handling without exposing internals

## 📈 Scaling Considerations

### Horizontal Scaling
Cloud Run automatically scales based on:
- Request volume
- CPU utilization
- Memory usage

### Database Scaling
Supabase handles:
- Connection pooling
- Read replicas (on paid plans)
- Automatic backups

### Monitoring
Set up monitoring for:
- Response times
- Error rates
- Database performance
- Secret access patterns 
# Build stage
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Install build dependencies needed for native modules
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Copy the source code
COPY . .

# Run postinstall scripts for packages that don't require native compilation
RUN npm rebuild --if-present || true

# Set minimal environment variables required for build
ENV NEXTAUTH_SECRET=build-time-secret
ENV SUPABASE_URL=https://kodddurybogqynkswrzp.supabase.co
ENV NEXT_PUBLIC_SUPABASE_URL=https://kodddurybogqynkswrzp.supabase.co
ENV SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZGRkdXJ5Ym9ncXlua3N3cnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNjM2ODYsImV4cCI6MjA1MTkzOTY4Nn0.GC6Ny_8wZiYwbPd7F5kBYXnyUHEelPQXK-oeG6fYqSQ
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZGRkdXJ5Ym9ncXlua3N3cnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzNjM2ODYsImV4cCI6MjA1MTkzOTY4Nn0.GC6Ny_8wZiYwbPd7F5kBYXnyUHEelPQXK-oeG6fYqSQ
ENV SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key
ENV GOOGLE_CLIENT_ID=placeholder-client-id
ENV GOOGLE_CLIENT_SECRET=placeholder-client-secret
ENV NEXTAUTH_URL=https://placeholder.run.app
ENV FIRECRAWL_API_KEY=build-fallback-key
ENV NODE_ENV=production

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 8080

# Set environment variable for port
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"] 
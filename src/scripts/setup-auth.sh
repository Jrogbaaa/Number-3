#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")/../.."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create a .env file with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  exit 1
fi

# Make sure environment variables are set
if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env || ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env; then
  echo "Error: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY not found in .env"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the auth migration script
echo "Setting up auth schema..."
node src/scripts/run-auth-migration.js

# Check exit status
if [ $? -ne 0 ]; then
  echo "Auth schema setup failed!"
  exit 1
fi

echo "Auth schema setup completed successfully!" 
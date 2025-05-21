#!/bin/bash

# Go to the project root directory
cd "$(dirname "$0")/../.."

# Check if the .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found in project root."
  exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Required environment variables NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY are not set."
  exit 1
fi

echo "=== Starting Lead Scoring Update Process ==="
echo ""

# Step 1: Run the database migration to add scoring columns
echo "Step 1: Adding scoring columns to database..."
node src/scripts/run-migration.js

# Check if the migration was successful
if [ $? -ne 0 ]; then
  echo "Error: Migration failed. Aborting."
  exit 1
fi

echo ""
echo "Migration completed successfully."
echo ""

# Step 2: Calculate and update scores
echo "Step 2: Calculating and updating lead scores..."
node src/scripts/update-lead-scores.js

# Check if the score update was successful
if [ $? -ne 0 ]; then
  echo "Error: Score update failed."
  exit 1
fi

echo ""
echo "=== Lead Scoring Update Process Completed ==="
echo ""
echo "You can now restart your application to see the updated scores." 
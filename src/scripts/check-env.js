#!/usr/bin/env node

/**
 * This script checks required environment variables and creates .env.local if necessary
 * Run with: node src/scripts/check-env.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Define required environment variables
const REQUIRED_VARS = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

// First load from .env if it exists
try {
  dotenv.config({ path: '.env' });
} catch (err) {
  console.log('[check-env] No .env file found');
}

// Then load from .env.local, which takes precedence
try {
  dotenv.config({ path: '.env.local' });
} catch (err) {
  console.log('[check-env] No .env.local file found');
}

// Check which variables are missing
const missingVars = REQUIRED_VARS.filter(varName => !process.env[varName]);

if (missingVars.length === 0) {
  console.log('✅ All required environment variables are set!');
  process.exit(0);
}

console.warn(`⚠️ Missing environment variables: ${missingVars.join(', ')}`);
console.log('These variables are required for the application to function properly.');

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), '.env.local');
let envLocalExists = false;
let envLocalContent = '';

try {
  envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  envLocalExists = true;
  console.log('📝 Found existing .env.local file');
} catch (err) {
  console.log('📝 No .env.local file found, creating one');
  envLocalContent = '';
}

// Generate content to append
let contentToAdd = '';

if (missingVars.includes('NEXTAUTH_SECRET') && !envLocalContent.includes('NEXTAUTH_SECRET')) {
  // Generate a random string for NEXTAUTH_SECRET
  const crypto = require('crypto');
  const randomSecret = crypto.randomBytes(32).toString('hex');
  contentToAdd += `\n# Auto-generated secret for NextAuth.js\nNEXTAUTH_SECRET="${randomSecret}"\n`;
}

if (missingVars.includes('NEXTAUTH_URL') && !envLocalContent.includes('NEXTAUTH_URL')) {
  contentToAdd += `\n# URL for NextAuth.js (default to localhost in development)\nNEXTAUTH_URL="http://localhost:3000"\n`;
}

// Add placeholders for other missing variables
missingVars.forEach(varName => {
  if (varName !== 'NEXTAUTH_SECRET' && varName !== 'NEXTAUTH_URL' && !envLocalContent.includes(varName)) {
    contentToAdd += `\n# TODO: Add your ${varName} here\n${varName}=""\n`;
  }
});

if (contentToAdd) {
  // Write or append to .env.local
  fs.writeFileSync(envLocalPath, envLocalContent + contentToAdd);
  console.log(`✅ Updated .env.local with placeholders for missing variables.`);
  console.log('⚠️ You need to fill in the empty values for the app to work correctly.');
  
  if (missingVars.includes('GOOGLE_CLIENT_ID') || missingVars.includes('GOOGLE_CLIENT_SECRET')) {
    console.log('\n🔑 To get Google OAuth credentials:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select an existing one');
    console.log('3. Go to APIs & Services > Credentials');
    console.log('4. Create an OAuth client ID (Application type: Web application)');
    console.log('5. Add authorized redirect URIs:');
    console.log('   - http://localhost:3000/api/auth/callback/google (for development)');
    console.log('   - https://your-production-domain.com/api/auth/callback/google (for production)');
  }
} else {
  console.log('⚠️ No changes made to .env.local');
} 
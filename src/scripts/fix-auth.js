#!/usr/bin/env node

/**
 * This script helps diagnose and fix Google OAuth authentication issues
 * Run with: node src/scripts/fix-auth.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('🔍 PROPS Google Auth Diagnostics 🔍');
console.log('=================================\n');

// First load from .env if it exists
try {
  dotenv.config({ path: '.env' });
  console.log('✅ Found .env file');
} catch (err) {
  console.log('❌ No .env file found');
}

// Then load from .env.local, which takes precedence
try {
  dotenv.config({ path: '.env.local' });
  console.log('✅ Found .env.local file');
} catch (err) {
  console.log('❌ No .env.local file found');
}

// Check essential auth variables
const authVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

const missingVars = authVars.filter(varName => !process.env[varName]);
const hasAllAuthVars = missingVars.length === 0;

console.log('\n🔐 Authentication Environment Variables Check:');
authVars.forEach(varName => {
  const exists = !!process.env[varName];
  const value = exists ? `${process.env[varName].slice(0, 4)}...` : 'NOT SET';
  console.log(`${exists ? '✅' : '❌'} ${varName}: ${value}`);
});

// Print detailed diagnostic information
console.log('\n📋 AUTHENTICATION DIAGNOSTIC REPORT:');
console.log('----------------------------------');

if (hasAllAuthVars) {
  console.log('✅ All required authentication variables are set!');
} else {
  console.log(`❌ Missing authentication variables: ${missingVars.join(', ')}`);
  
  console.log('\n🛠️ HOW TO FIX:');
  console.log('1. Create or edit your .env.local file at the project root');
  console.log('2. Add the following variables with your values:');
  
  missingVars.forEach(varName => {
    if (varName === 'NEXTAUTH_SECRET') {
      console.log(`   ${varName}="generate_a_random_secret_here"`);
    } else if (varName === 'NEXTAUTH_URL') {
      console.log(`   ${varName}="http://localhost:3000"`);
    } else {
      console.log(`   ${varName}="your_value_here"`);
    }
  });
  
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
}

// Check if we can directly verify the Google OAuth setup
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('\n✅ Google OAuth credentials are set!');
  console.log('\n🔄 Testing Google OAuth redirect:');
  console.log('1. Visit http://localhost:3000/debug-auth');
  console.log('2. Click on "Direct Google Sign In"');
  console.log('3. You should be redirected to Google\'s authentication page');
  console.log('\nIf it doesn\'t work, verify:');
  console.log('- Credentials are correct and not expired');
  console.log('- Redirect URIs are properly configured in Google Console');
  console.log('- Your app is not in restricted use (may need verification if many users)');
} else {
  console.log('\n❌ Google OAuth credentials are not set.');
}

console.log('\n🌐 HELPFUL RESOURCES:');
console.log('- Visit http://localhost:3000/debug-auth for real-time auth diagnostics');
console.log('- Check Google Cloud Console: https://console.cloud.google.com/apis/credentials');
console.log('- NextAuth.js documentation: https://next-auth.js.org/providers/google\n'); 
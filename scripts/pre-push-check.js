#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Running pre-push validation checks...\n');

let hasErrors = false;

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} passed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed\n`);
    hasErrors = true;
    return false;
  }
}

function checkFileExists(filePath, description) {
  console.log(`📋 Checking ${description}...`);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description} exists\n`);
    return true;
  } else {
    console.error(`❌ ${description} not found at ${filePath}\n`);
    hasErrors = true;
    return false;
  }
}

// Check if essential files exist
checkFileExists('package.json', 'package.json');
checkFileExists('next.config.js', 'Next.js configuration');
checkFileExists('tsconfig.json', 'TypeScript configuration');

// Run linting
runCommand('npm run lint', 'ESLint checks');

// Run TypeScript compilation check
runCommand('npx tsc --noEmit', 'TypeScript compilation check');

// Run Jest tests
runCommand('npm run test -- --passWithNoTests', 'Jest unit tests');

// Check if Playwright tests exist and run them
if (fs.existsSync('tests') || fs.existsSync('e2e') || fs.existsSync('playwright.config.js') || fs.existsSync('playwright.config.ts')) {
  runCommand('npm run test:e2e', 'Playwright E2E tests');
} else {
  console.log('📋 No Playwright tests found, skipping E2E tests\n');
}

// Try to build the project
runCommand('npm run build', 'Next.js build');

// Check for common issues
console.log('📋 Checking for common issues...');

// Check for console.log statements in production code (excluding test files)
try {
  const result = execSync('find src -name "*.ts" -o -name "*.tsx" | grep -v __tests__ | xargs grep -l "console.log" || true', { encoding: 'utf8' });
  if (result.trim()) {
    console.warn('⚠️  Warning: Found console.log statements in production code:');
    console.warn(result);
    console.warn('Consider removing or replacing with proper logging\n');
  } else {
    console.log('✅ No console.log statements found in production code\n');
  }
} catch (error) {
  console.log('✅ Console.log check completed\n');
}

// Check for TODO comments
try {
  const result = execSync('find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "TODO\\|FIXME\\|XXX" || true', { encoding: 'utf8' });
  if (result.trim()) {
    console.warn('⚠️  Warning: Found TODO/FIXME comments:');
    console.warn(result);
    console.warn('Consider addressing these before pushing\n');
  } else {
    console.log('✅ No TODO/FIXME comments found\n');
  }
} catch (error) {
  console.log('✅ TODO check completed\n');
}

// Final result
if (hasErrors) {
  console.error('❌ Pre-push validation failed! Please fix the issues above before pushing.');
  process.exit(1);
} else {
  console.log('🎉 All pre-push validation checks passed! Ready to push.');
  process.exit(0);
} 
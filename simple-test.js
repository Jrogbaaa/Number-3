const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  console.log('🌐 Opening browser for manual testing...');
  await page.goto('http://localhost:3000/dashboard');
  
  console.log('📋 Instructions:');
  console.log('1. Sign in if needed');
  console.log('2. Click "Reset Settings"');
  console.log('3. Watch for modal behavior');
  console.log('4. Check if "Resetting Settings" modal appears');
  console.log('5. Press Ctrl+C when done testing');
  
  // Keep browser open for manual testing
  await page.waitForTimeout(120000); // 2 minutes
  await browser.close();
})(); 
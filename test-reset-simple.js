const { chromium } = require('playwright');

async function testResetFlow() {
  console.log('🚀 Opening browser for manual reset testing...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500,
    args: ['--disable-web-security'] // This might help with some security restrictions
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📍 Navigating to localhost:3000/dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    
    console.log('\n📋 MANUAL TEST INSTRUCTIONS:');
    console.log('1. Sign in if you see the sign-in page');
    console.log('2. Once on dashboard, open browser DevTools (F12) and go to Console tab');
    console.log('3. Click "Reset Settings" button');
    console.log('4. Confirm the reset in the dialog');
    console.log('5. Watch for:');
    console.log('   ✅ "Resetting Settings" modal with spinner');
    console.log('   ❌ NO flashing "Welcome to OptiLeads" modal');
    console.log('   ✅ Smooth transition to onboarding modal');
    console.log('6. Check console logs for debug information');
    console.log('7. Press Ctrl+C in this terminal when done testing\n');
    
    // Add some console logging to help with debugging
    await page.addInitScript(() => {
      // Override console.log to make it more visible
      const originalLog = console.log;
      console.log = (...args) => {
        if (args[0] && args[0].includes('[Dashboard]')) {
          originalLog('%c' + args[0], 'color: #00ff00; font-weight: bold;', ...args.slice(1));
        } else {
          originalLog(...args);
        }
      };
    });
    
    // Wait for user to complete testing
    console.log('⏳ Browser will stay open for testing. Press Ctrl+C when done.');
    
    // Keep the browser open for manual testing
    await new Promise(() => {}); // This will keep the script running until manually stopped
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Test completed. Closing browser...');
  process.exit(0);
});

testResetFlow().catch(console.error); 
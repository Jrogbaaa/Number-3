const { chromium } = require('playwright');
const path = require('path');
const os = require('os');

async function testOnboardingResetWithAuth() {
  console.log('🚀 Starting onboarding reset test with authentication...');
  
  // Try to use existing Chrome user data directory
  const userDataDir = path.join(os.homedir(), 'Library/Application Support/Google/Chrome/Default');
  
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    slowMo: 1000,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });
  
  const page = browser.pages()[0] || await browser.newPage();
  
  try {
    console.log('📍 Navigating to localhost:3000/dashboard...');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    
    // Wait a bit for the page to fully load
    await page.waitForTimeout(3000);
    
    // Check if we're authenticated by looking for dashboard content
    const dashboardTitle = await page.locator('h1:has-text("Dashboard")').first();
    const resetButton = await page.locator('text=Reset Settings').first();
    
    if (await dashboardTitle.isVisible() && await resetButton.isVisible()) {
      console.log('✅ Successfully authenticated and found dashboard');
      console.log('✅ Found Reset Settings button');
      
      // Take a screenshot before starting
      await page.screenshot({ path: 'before-reset.png' });
      console.log('📸 Screenshot saved: before-reset.png');
      
      // Click the reset button
      console.log('🖱️ Clicking Reset Settings...');
      await resetButton.click();
      
      // Wait for confirmation dialog
      await page.waitForTimeout(2000);
      
      // Take screenshot of dialog
      await page.screenshot({ path: 'reset-dialog.png' });
      console.log('📸 Screenshot saved: reset-dialog.png');
      
      // Look for the confirmation button in the dialog
      const confirmButton = await page.locator('button:has-text("Reset Settings")').last();
      if (await confirmButton.isVisible()) {
        console.log('✅ Found confirmation dialog');
        console.log('🖱️ Clicking confirm...');
        await confirmButton.click();
        
        // Monitor for the next 10 seconds to catch any modal flashes
        console.log('👀 Monitoring for modal flashes...');
        let modalFlashes = [];
        
        for (let i = 0; i < 10; i++) {
          await page.waitForTimeout(1000);
          
          // Check for various modal types
          const welcomeModal = await page.locator('text=Welcome to OptiLeads').first();
          const resettingModal = await page.locator('text=Resetting Settings').first();
          const onboardingModal = await page.locator('text=Let\'s set up your account').first();
          
          const welcomeVisible = await welcomeModal.isVisible();
          const resettingVisible = await resettingModal.isVisible();
          const onboardingVisible = await onboardingModal.isVisible();
          
          if (welcomeVisible || resettingVisible || onboardingVisible) {
            const modalType = welcomeVisible ? 'Welcome' : resettingVisible ? 'Resetting' : 'Onboarding';
            modalFlashes.push(`${i + 1}s: ${modalType} modal visible`);
            console.log(`📋 ${i + 1}s: ${modalType} modal detected`);
            
            // Take screenshot when modal is detected
            await page.screenshot({ path: `modal-${i + 1}s-${modalType.toLowerCase()}.png` });
          }
        }
        
        // Final screenshot
        await page.screenshot({ path: 'after-reset.png' });
        console.log('📸 Screenshot saved: after-reset.png');
        
        // Summary
        console.log('\n📊 TEST RESULTS:');
        console.log(`Total modal detections: ${modalFlashes.length}`);
        modalFlashes.forEach(flash => console.log(`  - ${flash}`));
        
        if (modalFlashes.length === 0) {
          console.log('✅ SUCCESS: No modal flashes detected!');
        } else {
          console.log('⚠️ Modal activity detected - check screenshots for details');
        }
        
      } else {
        console.log('❌ Confirmation dialog not found');
        await page.screenshot({ path: 'error-no-dialog.png' });
      }
      
    } else {
      console.log('❌ Not authenticated or dashboard not found');
      
      // Check if we need to sign in
      const signInButton = await page.locator('text=Sign in with Google').first();
      if (await signInButton.isVisible()) {
        console.log('🔐 Sign in required - please sign in manually first');
      }
      
      await page.screenshot({ path: 'error-not-authenticated.png' });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    console.log('🏁 Test completed. Check screenshots for visual evidence.');
    await browser.close();
  }
}

// Run the test
testOnboardingResetWithAuth().catch(console.error); 
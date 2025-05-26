const { chromium } = require('playwright');

async function testOnboardingReset() {
  console.log('🚀 Starting onboarding reset test...');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    slowMo: 1000 // Slow down actions to see what's happening
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the application
    console.log('📍 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if we need to sign in
    const signInButton = await page.locator('text=Sign in with Google').first();
    if (await signInButton.isVisible()) {
      console.log('🔐 Need to sign in first...');
      console.log('❌ Cannot proceed with automated test - manual sign in required');
      await browser.close();
      return;
    }
    
    // Navigate to dashboard
    console.log('📊 Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(3000);
    
    // Look for the reset settings button
    console.log('🔍 Looking for Reset Settings button...');
    const resetButton = await page.locator('text=Reset Settings').first();
    
    if (await resetButton.isVisible()) {
      console.log('✅ Found Reset Settings button');
      
      // Click the reset button
      console.log('🖱️ Clicking Reset Settings...');
      await resetButton.click();
      
      // Wait for confirmation dialog
      await page.waitForTimeout(1000);
      
      // Look for the confirmation button in the dialog
      const confirmButton = await page.locator('button:has-text("Reset Settings")').last();
      if (await confirmButton.isVisible()) {
        console.log('✅ Found confirmation dialog');
        console.log('🖱️ Clicking confirm...');
        await confirmButton.click();
        
        // Wait for page reload and onboarding to start
        await page.waitForTimeout(5000);
        
        // Check if onboarding modal appears
        const onboardingModal = await page.locator('text=Welcome to OptiLeads').first();
        if (await onboardingModal.isVisible()) {
          console.log('✅ Onboarding modal appeared');
          
          // Monitor for any unwanted welcome modal flashes
          let welcomeModalFlashes = 0;
          
          // Set up a listener for any welcome modal appearances
          page.on('response', async (response) => {
            if (response.url().includes('/api/user-preferences')) {
              console.log(`📡 API call: ${response.url()} - Status: ${response.status()}`);
            }
          });
          
          // Go through onboarding steps
          for (let step = 0; step < 6; step++) {
            console.log(`📝 Onboarding step ${step + 1}...`);
            
            // Look for Next button
            const nextButton = await page.locator('button:has-text("Next")').first();
            if (await nextButton.isVisible()) {
              await nextButton.click();
              await page.waitForTimeout(2000);
              
              // Check if welcome modal flashed
              const welcomeFlash = await page.locator('text=Welcome to OptiLeads').first();
              if (await welcomeFlash.isVisible({ timeout: 500 })) {
                welcomeModalFlashes++;
                console.log(`⚠️ Welcome modal flashed during step ${step + 1}!`);
              }
            }
          }
          
          console.log(`📊 Test completed. Welcome modal flashes detected: ${welcomeModalFlashes}`);
          
          if (welcomeModalFlashes === 0) {
            console.log('✅ SUCCESS: No unwanted welcome modal flashes detected!');
          } else {
            console.log('❌ ISSUE: Welcome modal flashed during onboarding');
          }
          
        } else {
          console.log('❌ Onboarding modal did not appear after reset');
        }
        
      } else {
        console.log('❌ Confirmation dialog not found');
      }
      
    } else {
      console.log('❌ Reset Settings button not found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testOnboardingReset().catch(console.error); 
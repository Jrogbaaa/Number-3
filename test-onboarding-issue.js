const { chromium } = require('playwright');

async function testOnboardingFlow() {
  console.log('🚀 Testing onboarding flow issue...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    timeout: 60000
  });
  
  const page = await browser.newPage();
  
  try {
    // Clear all browser data to simulate fresh start
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    console.log('✅ Cleared browser data');
    
    // Navigate to the app
    await page.goto('http://localhost:3000');
    console.log('📱 Navigated to homepage');
    
    // Check if we see the onboarding
    const hasOnboardingModal = await page.locator('[data-testid="onboarding-modal"], text=Welcome to OptiLeads').first().isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasOnboardingModal) {
      console.log('✅ Onboarding modal detected');
      
      // Navigate through onboarding steps quickly
      // This is just a simulation - you would need to complete actual onboarding
      console.log('⏭️ Would complete onboarding steps here...');
      
      // For now, let's just navigate to data-input to see the upload behavior
      await page.goto('http://localhost:3000/data-input');
      
    } else {
      console.log('❌ No onboarding modal found');
      await page.goto('http://localhost:3000/data-input');
    }
    
    console.log('📋 Navigated to data-input page');
    
    // Check if the page loads correctly
    await page.waitForSelector('h1:has-text("Upload Your Leads")', { timeout: 10000 });
    console.log('✅ Data input page loaded');
    
    // Check authentication status
    const isAuthenticated = await page.evaluate(() => {
      // Check for authenticated UI elements
      return document.querySelector('text=Import your lead data') !== null;
    });
    
    console.log(`🔐 Authentication status: ${isAuthenticated ? 'Authenticated' : 'Unauthenticated'}`);
    
    // Look for the sign-in prompt modal that might be causing issues
    const hasSignInModal = await page.locator('text=Perfect!').first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`📋 Sign-in prompt modal visible: ${hasSignInModal}`);
    
    // Check localStorage for temporary leads
    const temporaryLeads = await page.evaluate(() => {
      const leads = localStorage.getItem('temporary-leads');
      return leads ? JSON.parse(leads) : null;
    });
    
    console.log(`💾 Temporary leads in localStorage: ${temporaryLeads ? temporaryLeads.length : 0} leads`);
    
    // Check for onboarding completion status
    const onboardingStatus = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const prefsKeys = keys.filter(key => key.includes('preferences'));
      const results = {};
      
      prefsKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            results[key] = {
              hasCompletedOnboarding: parsed.hasCompletedOnboarding,
              onboardingStep: parsed.onboardingStep
            };
          }
        } catch (e) {
          results[key] = 'Parse error';
        }
      });
      
      return results;
    });
    
    console.log('🎓 Onboarding status in localStorage:', JSON.stringify(onboardingStatus, null, 2));
    
    await page.screenshot({ path: 'onboarding-debug.png', fullPage: true });
    console.log('📸 Screenshot saved as onboarding-debug.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-debug.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

// Run the test
testOnboardingFlow().catch(console.error); 
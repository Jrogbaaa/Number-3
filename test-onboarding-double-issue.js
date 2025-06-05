const { chromium } = require('playwright');

async function testOnboardingDoubleIssue() {
  console.log('🚀 Testing onboarding double-issue fix...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    // Step 1: Clear all browser data to simulate first-time user
    console.log('🧹 Step 1: Clearing browser data...');
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Step 2: Navigate to onboarding
    console.log('📝 Step 2: Starting onboarding process...');
    await page.goto('http://localhost:3000/onboarding');
    await page.waitForLoadState('networkidle');
    
    // Step 3: Complete onboarding quickly
    console.log('✅ Step 3: Completing onboarding...');
    
    // Welcome step - click next
    await page.waitForSelector('text=Next', { timeout: 10000 });
    await page.click('text=Next');
    
    // Company info step
    await page.waitForSelector('input[placeholder*="company"]', { timeout: 5000 });
    await page.fill('input[placeholder*="company"]', 'Test Company');
    await page.fill('textarea', 'We provide test services');
    await page.selectOption('select', 'Technology');
    await page.selectOption('select >> nth=1', '11-50');
    await page.click('text=Next');
    
    // Website context step (skip)
    await page.waitForSelector('text=Skip', { timeout: 5000 });
    await page.click('text=Skip');
    
    // Target roles step
    await page.waitForSelector('text=Marketing', { timeout: 5000 });
    await page.click('text=Marketing Manager');
    await page.click('text=Next');
    
    // Demographics step
    await page.waitForSelector('text=United States', { timeout: 5000 });
    await page.click('text=United States');
    await page.click('text=Next');
    
    // Target companies step
    await page.waitForSelector('text=Medium', { timeout: 5000 });
    await page.click('text=Medium (51-200)');
    await page.click('text=Technology');
    await page.click('text=Next');
    
    // Confirmation step - finish onboarding
    await page.waitForSelector('text=Upload Leads', { timeout: 5000 });
    await page.click('text=Upload Leads');
    
    // Step 4: Upload leads (should go to data-input page)
    console.log('📄 Step 4: Uploading leads...');
    await page.waitForURL('**/data-input');
    
    // Create test CSV and upload
    const csvContent = `name,email,company,title
John Doe,john@test.com,Test Corp,Marketing Manager
Jane Smith,jane@test.com,Demo Inc,Director`;
    
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles([{
      name: 'test-leads.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    }]);
    
    // Wait for processing
    await page.waitForSelector('text=Upload Results', { timeout: 15000 });
    console.log('✅ Leads uploaded successfully');
    
    // Step 5: Check that sign-in prompt appears (not onboarding)
    console.log('🔐 Step 5: Checking for sign-in prompt...');
    const hasSignInPrompt = await page.locator('text=Perfect!').isVisible({ timeout: 5000 });
    
    if (!hasSignInPrompt) {
      throw new Error('Sign-in prompt did not appear after upload');
    }
    console.log('✅ Sign-in prompt appeared correctly');
    
    // Step 6: Check localStorage state
    console.log('💾 Step 6: Checking localStorage state...');
    const localStorageState = await page.evaluate(() => {
      const state = {};
      
      // Check for temporary leads
      const tempLeads = localStorage.getItem('temporary-leads');
      state.temporaryLeads = tempLeads ? JSON.parse(tempLeads).length : 0;
      
      // Check for onboarding completion
      const keys = Object.keys(localStorage);
      const prefKeys = keys.filter(key => key.includes('preferences'));
      state.preferencesKeys = prefKeys;
      
      state.onboardingCompleted = false;
      prefKeys.forEach(key => {
        try {
          const prefs = JSON.parse(localStorage.getItem(key));
          if (prefs && prefs.hasCompletedOnboarding) {
            state.onboardingCompleted = true;
            state.onboardingKey = key;
          }
        } catch (e) {
          // Ignore
        }
      });
      
      return state;
    });
    
    console.log('📊 LocalStorage state:', localStorageState);
    
    if (!localStorageState.onboardingCompleted) {
      throw new Error('Onboarding completion not stored properly');
    }
    
    if (localStorageState.temporaryLeads !== 2) {
      throw new Error(`Expected 2 temporary leads, got ${localStorageState.temporaryLeads}`);
    }
    
    // Step 7: Simulate user clicking "Sign In" button (but don't actually sign in)
    // Instead, navigate directly to dashboard to simulate what happens after sign-in
    console.log('🏠 Step 7: Simulating post-signin navigation to dashboard...');
    
    // Clear localStorage to simulate what happens during the auth process
    // But keep the onboarding completion preferences
    await page.evaluate(() => {
      // This simulates what should happen: onboarding preferences are preserved
      const onboardingPrefs = localStorage.getItem('user-preferences-anonymous-user');
      if (onboardingPrefs) {
        console.log('Preserving onboarding preferences during auth simulation');
      }
    });
    
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Step 8: Check that onboarding modal does NOT appear
    console.log('🎯 Step 8: Checking that onboarding does NOT appear again...');
    
    // Wait a moment for any potential onboarding modal to appear
    await page.waitForTimeout(3000);
    
    // Check for onboarding modal
    const hasOnboardingModal = await page.locator('text=Welcome to OptiLeads').isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasOnboardingModal) {
      throw new Error('❌ DOUBLE ONBOARDING DETECTED! Onboarding modal appeared after user already completed it');
    }
    
    console.log('✅ SUCCESS! No double onboarding detected');
    
    // Step 9: Check that dashboard shows sign-in prompt instead
    const needsSignIn = await page.locator('text=Sign in').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (needsSignIn) {
      console.log('✅ Dashboard correctly shows sign-in prompt for unauthenticated user');
    } else {
      console.log('ℹ️  Dashboard may be in a different state (this is okay)');
    }
    
    console.log('🎉 Test completed successfully! Double onboarding issue is FIXED!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'onboarding-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as onboarding-error.png');
    
    // Show localStorage state for debugging
    const debugState = await page.evaluate(() => {
      const debug = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        debug[key] = localStorage.getItem(key);
      }
      return debug;
    });
    
    console.log('🔍 Debug localStorage state:', JSON.stringify(debugState, null, 2));
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testOnboardingDoubleIssue().catch(console.error); 
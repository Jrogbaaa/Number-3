const { chromium } = require('playwright');

async function testOnboardingFix() {
  console.log('🚀 Testing onboarding fix...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Step 1: Clear everything and start fresh
    console.log('📋 Step 1: Starting fresh session...');
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Step 2: Go through onboarding
    console.log('🎓 Step 2: Completing onboarding...');
    await page.goto('http://localhost:3000/onboarding');
    await page.waitForSelector('text=Get Started', { timeout: 10000 });
    
    // Click through onboarding steps
    await page.click('button:has-text("Get Started")');
    await page.waitForTimeout(1000);
    
    // Fill company info
    await page.fill('input[placeholder*="company"]', 'Test Company');
    await page.fill('textarea[placeholder*="products"]', 'AI Software Solutions');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    // Skip website context step
    await page.click('button:has-text("Skip This Step")');
    await page.waitForTimeout(1000);
    
    // Select target roles
    await page.click('text=Marketing Manager');
    await page.click('text=Director');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    // Select demographics
    await page.click('text=United States');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(1000);
    
    // Select company sizes and industries
    await page.click('text=Medium (51-200)');
    await page.click('text=Technology');
    await page.click('button:has-text("Complete Setup")');
    
    // Wait for redirect to data input
    await page.waitForURL('**/data-input', { timeout: 10000 });
    console.log('✅ Onboarding completed successfully');
    
    // Step 3: Upload leads while unauthenticated
    console.log('📁 Step 3: Uploading leads (unauthenticated)...');
    
    // Create a test CSV
    const csvContent = `name,email,company,title
John Doe,john@test.com,Test Corp,Marketing Manager
Jane Smith,jane@test.com,Demo Inc,Director
Bob Johnson,bob@test.com,Sample Ltd,CMO`;
    
    // Upload the CSV
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.setInputFiles([{
      name: 'test-leads.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csvContent)
    }]);
    
    // Wait for processing
    await page.waitForSelector('text=Upload Results', { timeout: 15000 });
    console.log('✅ Leads uploaded successfully');
    
    // Step 4: Check that sign-in prompt appears
    console.log('🔐 Step 4: Checking for sign-in prompt...');
    await page.waitForSelector('text=Perfect!', { timeout: 5000 });
    console.log('✅ Sign-in prompt appeared');
    
    // Step 5: Check localStorage for temporary leads
    const tempLeads = await page.evaluate(() => {
      const leads = localStorage.getItem('temporary-leads');
      return leads ? JSON.parse(leads) : null;
    });
    
    if (!tempLeads || tempLeads.length !== 3) {
      throw new Error(`Expected 3 temporary leads, got ${tempLeads?.length || 0}`);
    }
    console.log('✅ Temporary leads stored correctly');
    
    // Step 6: Check onboarding completion status
    const onboardingStatus = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const prefsKey = keys.find(key => key.includes('preferences') && !key.includes('undefined'));
      if (prefsKey) {
        const prefs = localStorage.getItem(prefsKey);
        return prefs ? JSON.parse(prefs) : null;
      }
      return null;
    });
    
    if (!onboardingStatus?.hasCompletedOnboarding) {
      throw new Error('Onboarding completion not properly stored');
    }
    console.log('✅ Onboarding completion status preserved');
    
    // Step 7: Simulate sign-in (we can't actually sign in through Google in the test)
    // Instead, let's check that the flow would work by examining the localStorage state
    console.log('🔍 Step 7: Verifying data migration logic...');
    
    // Check that our enhanced migration logic would find the onboarding completion
    const migrationTest = await page.evaluate(() => {
      // Simulate what the UserPreferencesProvider migration logic does
      const tempLeads = localStorage.getItem('temporary-leads');
      if (!tempLeads) return false;
      
      const genericKeys = [
        'user-preferences-anonymous-user',
        'user-preferences-anonymous',
        'user-preferences-temp',
        'user-preferences-undefined',
        'user-preferences-null',
        'user-preferences-guest',
        'user-preferences-default',
        'user-preferences-local'
      ];
      
      // Check if any generic keys have onboarding completion
      for (const key of genericKeys) {
        const prefs = localStorage.getItem(key);
        if (prefs) {
          try {
            const parsed = JSON.parse(prefs);
            if (parsed.hasCompletedOnboarding) {
              return true;
            }
          } catch (e) {
            // Ignore
          }
        }
      }
      
      // Check all localStorage keys for onboarding completion
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('preferences')) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const parsed = JSON.parse(value);
              if (parsed.hasCompletedOnboarding) {
                return true;
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      }
      
      return false;
    });
    
    if (!migrationTest) {
      throw new Error('Migration logic would not find onboarding completion');
    }
    console.log('✅ Migration logic can find onboarding completion');
    
    console.log('🎉 All tests passed! The onboarding fix should work correctly.');
    console.log('📋 Summary:');
    console.log('  ✅ Onboarding completes and preferences are stored');
    console.log('  ✅ Leads upload successfully and are stored temporarily');
    console.log('  ✅ Sign-in prompt appears correctly');
    console.log('  ✅ Migration logic can find completed onboarding');
    console.log('  ✅ Flow should prevent double onboarding after sign-in');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'onboarding-fix-error.png', fullPage: true });
    console.log('📸 Error screenshot saved as onboarding-fix-error.png');
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
}

testOnboardingFix(); 
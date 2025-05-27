import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('New User Lead Upload', () => {
  test('should allow new user to upload leads successfully', async ({ page }) => {
    // Create a small test CSV file
    const testCsvContent = `name,email,company,title
John Doe,john.doe@example.com,Test Company,Manager
Jane Smith,jane.smith@example.com,Another Company,Director
Bob Johnson,bob.johnson@example.com,Third Company,CEO`;

    const testCsvPath = path.join(__dirname, 'test-upload.csv');
    fs.writeFileSync(testCsvPath, testCsvContent);

    try {
      // Navigate to the data input page (unauthenticated)
      await page.goto('/data-input');
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      
      // Check that the upload component is visible
      await expect(page.locator('label[for="dropzone-file"]')).toBeVisible();
      
      // Upload the test CSV file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testCsvPath);
      
      // Wait for processing to complete (should be quick for 3 leads)
      await page.waitForSelector('text=Upload Results', { timeout: 30000 });
      
      // Check that results are displayed
      await expect(page.locator('text=Upload Results')).toBeVisible();
      
      // Check that leads were processed (should show 3 leads in unauthenticated mode)
      await expect(page.locator('text=3')).toBeVisible();
      
      // Check for success message
      await expect(page.locator('text=analyzed successfully')).toBeVisible();
      
      console.log('✅ New user upload test passed - leads processed successfully');
      
    } finally {
      // Clean up test file
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    }
  });

  test('should handle large file upload with proper error message', async ({ page }) => {
    // Create a large test CSV file (510 leads to trigger size limit)
    let largeCsvContent = 'name,email,company,title\n';
    for (let i = 1; i <= 510; i++) {
      largeCsvContent += `Lead ${i},lead${i}@example.com,Company ${i},Title ${i}\n`;
    }

    const largeCsvPath = path.join(__dirname, 'large-test-upload.csv');
    fs.writeFileSync(largeCsvPath, largeCsvContent);

    try {
      // Navigate to the data input page
      await page.goto('/data-input');
      
      // Wait for the page to load and check for server errors
      await page.waitForLoadState('networkidle');
      
      // Check if page loaded successfully (not a 500 error)
      const pageTitle = await page.locator('h1').textContent();
      if (!pageTitle?.includes('Upload Your Leads')) {
        throw new Error('Page failed to load properly - server error detected');
      }
      
      console.log('✅ Page loaded successfully');
      
      // Listen for console logs to debug the upload process
      page.on('console', msg => {
        if (msg.text().includes('DataUpload') || msg.text().includes('File too large') || msg.text().includes('PapaParse')) {
          console.log('Browser console:', msg.text());
        }
      });
      
      // Upload the large CSV file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(largeCsvPath);
      
      console.log('✅ File uploaded, waiting for processing...');
      
      // Wait for processing to start (should show processing indicator)
      await page.waitForSelector('text=Processing', { timeout: 10000 });
      console.log('✅ Processing started');
      
      // Now wait for either error message or completion
      await Promise.race([
        page.waitForSelector('text=File too large', { timeout: 20000 }),
        page.waitForSelector('text=Upload Results', { timeout: 20000 }),
        page.waitForSelector('[data-sonner-toast]', { timeout: 20000 })
      ]);
      
      // Check what actually happened
      const hasError = await page.locator('text=File too large').isVisible();
      const hasResults = await page.locator('text=Upload Results').isVisible();
      const hasToast = await page.locator('[data-sonner-toast]').isVisible();
      
      console.log('Status check:', { hasError, hasResults, hasToast });
      
             if (hasError) {
         console.log('✅ Error message found in page content');
         await expect(page.locator('text=File too large (510 leads)')).toBeVisible();
      } else if (hasToast) {
        const toastText = await page.locator('[data-sonner-toast]').textContent();
        console.log('Toast content:', toastText);
        if (toastText?.includes('File too large')) {
          console.log('✅ Error message found in toast');
        } else {
          throw new Error(`Expected error message not found. Toast content: ${toastText}`);
        }
      } else if (hasResults) {
        // This shouldn't happen for 600 leads, but let's see what the results say
        const resultsText = await page.locator('text=Upload Results').textContent();
        console.log('Unexpected results:', resultsText);
                 throw new Error('Expected file size error but got results instead');
      } else {
        // Get page content for debugging
        const pageContent = await page.textContent('body');
        console.log('No expected elements found. Page content:', pageContent?.substring(0, 1000));
        throw new Error('Neither error message nor results found');
      }
      
    } finally {
      // Clean up test file
      if (fs.existsSync(largeCsvPath)) {
        fs.unlinkSync(largeCsvPath);
      }
    }
  });
}); 
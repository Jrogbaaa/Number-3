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
    // Create a large test CSV file (600 leads to trigger size limit)
    let largeCsvContent = 'name,email,company,title\n';
    for (let i = 1; i <= 600; i++) {
      largeCsvContent += `Lead ${i},lead${i}@example.com,Company ${i},Title ${i}\n`;
    }

    const largeCsvPath = path.join(__dirname, 'large-test-upload.csv');
    fs.writeFileSync(largeCsvPath, largeCsvContent);

    try {
      // Navigate to the data input page
      await page.goto('/data-input');
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      
      // Upload the large CSV file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(largeCsvPath);
      
      // Wait for error message about file size
      await page.waitForSelector('text=File too large', { timeout: 30000 });
      
      // Check that proper error message is displayed
      await expect(page.locator('text=File too large (600 leads). Please split into files of 500 leads or fewer.')).toBeVisible();
      
      console.log('✅ Large file handling test passed - proper error message shown');
      
    } finally {
      // Clean up test file
      if (fs.existsSync(largeCsvPath)) {
        fs.unlinkSync(largeCsvPath);
      }
    }
  });
}); 
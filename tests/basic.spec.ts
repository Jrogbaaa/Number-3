import { test, expect } from '@playwright/test';

test.describe('OptiLeads Application', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads and contains expected content
    await expect(page).toHaveTitle(/OptiLeads/);
    
    // Check for key elements on the homepage
    await expect(page.locator('text=OptiLeads')).toBeVisible();
  });

  test('signin page is accessible', async ({ page }) => {
    await page.goto('/signin');
    
    // Check if signin page loads
    await expect(page.locator('text=Sign in')).toBeVisible();
  });

  test('dashboard redirects to signin when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to signin or show signin form
    await expect(page.url()).toContain('signin');
  });
}); 
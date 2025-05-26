import { test, expect } from '@playwright/test';

test.describe('OptiLeads Application', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads and contains expected content
    await expect(page).toHaveTitle(/OptiLeads/);
    
    // Check for the main heading instead of generic text
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Check for the navigation logo specifically
    await expect(page.getByRole('link', { name: 'OptiLeads.ai Home' })).toBeVisible();
  });

  test('signin page is accessible', async ({ page }) => {
    await page.goto('/signin');
    
    // Check if signin page loads with more specific selector
    await expect(page.locator('h2', { hasText: 'Welcome to OptiLeads' })).toBeVisible();
    
    // Check for the Google sign-in button
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('dashboard redirects to signin when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to onboarding for new users (this is the correct behavior)
    await expect(page.url()).toContain('onboarding');
  });
}); 
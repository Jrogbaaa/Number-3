# Manual Test Instructions for Reset Settings

## Prerequisites
1. Make sure you're signed in to the application at `http://localhost:3000`
2. Navigate to the dashboard
3. Open browser developer tools (F12) and go to Console tab

## Test Steps

### Step 1: Prepare for Testing
1. Open Console in DevTools
2. Clear the console log
3. Navigate to `http://localhost:3000/dashboard`

### Step 2: Execute Reset
1. Click the "Reset Settings" button
2. In the confirmation dialog, click "Reset Settings" again
3. **Watch carefully** for any modal flashes

### Step 3: Monitor Console Logs
Look for these debug messages in the console:
```
[Dashboard] Onboarding state check: {
  hasCompletedOnboarding: false,
  preferencesLoading: false,
  status: 'authenticated',
  preferences: 'loaded',
  isOnboardingActive: true,
  preventWelcomeModal: true,
  showWelcomeModal: false,
  isResetting: true  // <-- This should be true initially
}
```

### Step 4: What You Should See
✅ **Expected behavior:**
- "Resetting Settings" modal with spinner (for ~30 seconds)
- Smooth transition to onboarding modal
- NO flashing of "Welcome to OptiLeads" modal

❌ **Problem behavior:**
- "Welcome to OptiLeads" modal flashing between steps
- Multiple modal transitions
- Confusing user experience

### Step 5: Report Results
Please let me know:
1. Did you see the "Resetting Settings" modal?
2. Did the "Welcome to OptiLeads" modal still flash?
3. What did the console logs show for `isResetting`?
4. How long did the reset process take?

## Alternative: Run Playwright Test

If you want to try the automated test:

1. **First, sign in manually** in your regular Chrome browser
2. **Keep Chrome open** with your session active
3. Run the test:
```bash
node test-onboarding-reset-with-auth.js
```

This test will:
- Use your existing Chrome session data
- Take screenshots at each step
- Monitor for modal flashes
- Generate a detailed report

The screenshots will be saved as:
- `before-reset.png`
- `reset-dialog.png` 
- `modal-Xs-[type].png` (if modals are detected)
- `after-reset.png` 
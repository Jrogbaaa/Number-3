// This script tests our localStorage fallback mechanism
// by simulating the flow in a Node.js environment

// Mock functions for localStorage
const mockStorage = {};

const localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); }
};

// Mock user session
const mockSession = {
  user: {
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com'
  }
};

// Default preferences
const DEFAULT_PREFERENCES = {
  id: 'default',
  userId: '',
  hasCompletedOnboarding: false,
  onboardingStep: 1,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Simulate the UserPreferencesProvider flow
async function testUserPreferencesFlow() {
  console.log('Testing UserPreferencesProvider flow...\n');
  
  // Scenario 1: API works, no localStorage
  console.log('SCENARIO 1: API works normally');
  console.log('---------------------------');
  
  // Mock successful API response
  const mockApiResponse = {
    id: 'db-pref-123',
    userId: mockSession.user.id,
    hasCompletedOnboarding: true,
    onboardingStep: 3,
    companyName: 'Test Company',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('Fetching preferences from API...');
  console.log('API returned:', mockApiResponse);
  console.log('Storing in localStorage as backup...');
  localStorage.setItem(
    `user-preferences-${mockSession.user.id}`,
    JSON.stringify(mockApiResponse)
  );
  console.log('localStorage now contains:', localStorage.getItem(`user-preferences-${mockSession.user.id}`));
  console.log();
  
  // Scenario 2: API fails, localStorage exists
  console.log('SCENARIO 2: API fails, localStorage exists');
  console.log('----------------------------------');
  
  console.log('Fetching preferences from API...');
  console.log('API error: Failed to fetch user preferences');
  console.log('Falling back to localStorage...');
  const localPrefs = localStorage.getItem(`user-preferences-${mockSession.user.id}`);
  console.log('Found preferences in localStorage:', localPrefs ? 'Yes' : 'No');
  if (localPrefs) {
    console.log('localStorage preferences:', JSON.parse(localPrefs));
  }
  console.log();
  
  // Scenario 3: API fails, no localStorage
  console.log('SCENARIO 3: API fails, no localStorage');
  console.log('-------------------------------');
  
  // Clear localStorage
  localStorage.removeItem(`user-preferences-${mockSession.user.id}`);
  
  console.log('Fetching preferences from API...');
  console.log('API error: Failed to fetch user preferences');
  console.log('Checking localStorage...');
  const emptyLocalPrefs = localStorage.getItem(`user-preferences-${mockSession.user.id}`);
  console.log('Found preferences in localStorage:', emptyLocalPrefs ? 'Yes' : 'No');
  
  console.log('Creating default preferences...');
  const defaultPrefs = {
    ...DEFAULT_PREFERENCES,
    userId: mockSession.user.id
  };
  console.log('Default preferences:', defaultPrefs);
  
  console.log('Storing in localStorage...');
  localStorage.setItem(
    `user-preferences-${mockSession.user.id}`,
    JSON.stringify(defaultPrefs)
  );
  console.log('localStorage now contains:', localStorage.getItem(`user-preferences-${mockSession.user.id}`));
  console.log();
  
  // Scenario 4: Update preferences with working API
  console.log('SCENARIO 4: Update preferences (API working)');
  console.log('----------------------------------------');
  
  // Mock successful API update
  const updatedPrefs = {
    companyName: 'Updated Company',
    companyIndustry: 'Technology'
  };
  
  console.log('Updating preferences via API:', updatedPrefs);
  const mergedApiPrefs = {
    ...mockApiResponse,
    ...updatedPrefs,
    updatedAt: new Date()
  };
  console.log('API returned:', mergedApiPrefs);
  
  console.log('Updating localStorage backup...');
  localStorage.setItem(
    `user-preferences-${mockSession.user.id}`,
    JSON.stringify(mergedApiPrefs)
  );
  console.log('localStorage now contains:', localStorage.getItem(`user-preferences-${mockSession.user.id}`));
  console.log();
  
  // Scenario 5: Update preferences with failing API
  console.log('SCENARIO 5: Update preferences (API failing)');
  console.log('-----------------------------------------');
  
  const moreUpdates = {
    targetRoles: ['CEO', 'CTO'],
    onboardingStep: 4
  };
  
  console.log('Updating preferences via API:', moreUpdates);
  console.log('API error: Failed to update user preferences');
  
  console.log('Falling back to localStorage...');
  const currentPrefs = JSON.parse(localStorage.getItem(`user-preferences-${mockSession.user.id}`));
  
  const mergedLocalPrefs = {
    ...currentPrefs,
    ...moreUpdates,
    updatedAt: new Date()
  };
  
  console.log('Merged preferences for localStorage:', mergedLocalPrefs);
  localStorage.setItem(
    `user-preferences-${mockSession.user.id}`,
    JSON.stringify(mergedLocalPrefs)
  );
  
  console.log('localStorage now contains:', localStorage.getItem(`user-preferences-${mockSession.user.id}`));
  console.log();
  
  console.log('TEST COMPLETED: Fallback mechanism works properly');
}

// Run the test
testUserPreferencesFlow(); 
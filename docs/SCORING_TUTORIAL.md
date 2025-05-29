# Scoring Tutorial System Documentation

## Overview

The OptiLeads Scoring Tutorial is an intelligent, personalized educational system that helps users understand our AI-powered lead scoring methodology. The tutorial appears at strategic moments to maximize user engagement and understanding without disrupting critical workflows.

## Key Features

### 🎯 **Company-Specific Personalization**
- Tutorial content dynamically adapts to use the user's actual company name
- Examples reference the user's target roles, industries, and company sizes
- Pro tips are customized based on the user's business model and preferences

### ⏰ **Smart Timing**
- Appears after successful lead uploads for first-time users
- Triggers after settings resets once new onboarding is complete
- **Never appears during onboarding processes** - critical UX requirement
- Uses intelligent delays to ensure pages have fully loaded

### 📚 **Three-Dimensional Education**
The tutorial explains our comprehensive scoring system:

1. **Intent Score (40-80 range)**
   - Purchase likelihood based on role, industry, growth indicators
   - Personalized to user's target roles and industries

2. **Company Focus (0-100 range)**
   - ICP alignment based on size, vertical, location
   - Adapted to user's target company sizes and geographic preferences

3. **Engagement Potential (25-85 range)**
   - Decision-making power and budget authority assessment
   - Contextualized for user's business type and target market

### 📱 **Mobile-Optimized Design**
- Sticky header and footer for easy navigation
- Responsive grid layouts
- Touch-friendly controls
- Optimized content spacing for readability

## Technical Architecture

### Components

#### `ScoringTutorialModal.tsx`
The main React component providing the tutorial interface:

```typescript
interface ScoringTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userPreferences?: UserPreferences;
}
```

**Key Features:**
- Personalized content generation based on user preferences
- Sticky header/footer for mobile UX
- Progressive disclosure of scoring information
- Contextual pro tips and recommendations

#### `useScoringTutorial.ts`
Custom React hook managing tutorial state and triggers:

```typescript
interface ScoringTutorialHook {
  hasSeenTutorial: boolean;
  showTutorial: boolean;
  isLoading: boolean;
  triggerTutorialAfterUpload: (leadCount: number) => void;
  triggerTutorialAfterReset: () => void;
  completeTutorial: () => void;
  closeTutorial: () => void;
  resetTutorial: () => void;
}
```

### State Management

#### localStorage Integration
```typescript
const TUTORIAL_STORAGE_KEY = 'scoring-tutorial-completed';

// Tutorial completion tracking
localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');

// Reset detection
localStorage.setItem('lastSettingsReset', Date.now().toString());
```

#### Reset Detection Logic
```typescript
const checkForRecentReset = () => {
  const lastResetTime = localStorage.getItem('lastSettingsReset');
  if (lastResetTime) {
    const timeSinceReset = Date.now() - parseInt(lastResetTime);
    return timeSinceReset < 60000; // 60-second window
  }
  return false;
};
```

## Integration Points

### Dashboard Page (`src/app/dashboard/page.tsx`)

#### First-Time User Detection
```typescript
useEffect(() => {
  if (fetchedLeads.length > 0) {
    setTimeout(() => {
      triggerTutorialAfterUpload(fetchedLeads.length);
    }, 1500);
  }
}, [leads, hasCompletedOnboarding, preferences]);
```

#### Settings Reset Detection
```typescript
useEffect(() => {
  const lastResetTime = localStorage.getItem('lastSettingsReset');
  if (lastResetTime && hasCompletedOnboarding && preferences) {
    const timeSinceReset = Date.now() - parseInt(lastResetTime);
    if (timeSinceReset < 60000) {
      setTimeout(() => {
        triggerTutorialAfterReset();
      }, 2500);
      localStorage.removeItem('lastSettingsReset');
    }
  }
}, [hasCompletedOnboarding, preferences, triggerTutorialAfterReset]);
```

### Data Input Page (`src/app/data-input/page.tsx`)

#### Upload Success Trigger
```typescript
const handleUploadComplete = (uploadedLeads?: TemporaryLead[]) => {
  if (status === 'authenticated' && uploadedLeads?.length > 0) {
    setTimeout(() => {
      triggerTutorialAfterUpload(uploadedLeads.length);
    }, 1000);
  }
};
```

### Reset Settings Integration

#### Reset Button Functionality
```typescript
const handleResetSettings = async () => {
  // Clear tutorial completion when settings are reset
  localStorage.removeItem('scoring-tutorial-completed');
  
  // Mark reset timestamp for detection
  localStorage.setItem('lastSettingsReset', Date.now().toString());
  
  // Reset user preferences and trigger onboarding
  await resetUserPreferences();
};
```

## Personalization Engine

### Dynamic Content Generation

#### Personalized Intro
```typescript
const getPersonalizedIntro = () => {
  const companyName = userPreferences?.companyInfo?.name || 'your company';
  const targetRoles = userPreferences?.targetRoles || [];
  const targetIndustries = userPreferences?.targetIndustries || [];
  
  let intro = `OptiLeads uses advanced algorithms to analyze your leads specifically for ${companyName}. `;
  
  if (targetRoles.length > 0) {
    intro += `Based on your focus on ${targetRoles.slice(0, 2).join(' and ')}${targetRoles.length > 2 ? ' roles' : ''}, `;
  }
  
  if (targetIndustries.length > 0) {
    intro += `targeting ${targetIndustries.slice(0, 2).join(' and ')} industries, `;
  }
  
  intro += `each lead receives scores that help ${companyName} prioritize outreach efforts.`;
  
  return intro;
};
```

#### Contextualized Scoring Explanations
```typescript
const getPersonalizedIntentDescription = () => {
  const companyName = userPreferences?.companyInfo?.name || 'your company';
  const targetRoles = userPreferences?.targetRoles || [];
  
  let description = `Measures how likely a lead is to be actively looking for ${companyName}'s solution. `;
  
  if (targetRoles.length > 0) {
    description += `For ${companyName}, we prioritize ${targetRoles[0]}s and similar decision-makers.`;
  }
  
  return description;
};
```

### Pro Tips Personalization
```typescript
const getPersonalizedProTips = () => [
  {
    type: "Focus on High Intent First",
    content: `${targetRoles.length > 0 ? targetRoles[0] + 's' : 'Leads'} with 60+ intent scores are actively looking for ${companyName}'s solutions`
  },
  {
    type: "Quality over Quantity",
    content: `Better for ${companyName} to engage 10 high-scoring ${targetRoles.length > 0 ? targetRoles[0] + 's' : 'leads'} than 50 low-scoring ones`
  },
  {
    type: "Industry-Specific Messaging",
    content: `Use AI message customization to highlight how ${companyName} solves ${targetIndustries.length > 0 ? targetIndustries[0] : 'industry'} challenges`
  }
];
```

## User Experience Flow

### Scenario 1: First-Time User Upload
1. User completes onboarding and sets preferences
2. User uploads leads via Data Input page
3. Upload succeeds and leads are processed
4. **Wait 1 second** for page to update
5. Tutorial triggers automatically
6. User learns about scoring methodology
7. Tutorial completion state saved to localStorage

### Scenario 2: Settings Reset
1. Existing user clicks "Reset Settings"
2. Tutorial completion flag cleared
3. Reset timestamp saved to localStorage
4. User goes through onboarding again
5. User returns to dashboard with new preferences
6. **Wait 2.5 seconds** for leads to load and preferences to sync
7. Tutorial triggers to explain new scoring context
8. Reset timestamp cleared after trigger

### Scenario 3: Onboarding Protection
1. New user visits dashboard before completing onboarding
2. Onboarding modal appears
3. Tutorial system detects `!hasCompletedOnboarding`
4. **Tutorial is prevented from showing**
5. User completes onboarding
6. Normal tutorial flow can proceed

## Testing and Quality Assurance

### Manual Testing Functions
Available in browser console for development and QA:

```typescript
// Reset tutorial state and reload page
window.testScoringTutorial();

// Simulate settings reset scenario
window.testScoringTutorialAfterReset();
```

### Test Scenarios

#### Test Case 1: First Upload Tutorial
```typescript
// Setup
localStorage.removeItem('scoring-tutorial-completed');
// Upload leads as authenticated user
// Verify tutorial appears after 1.5 seconds
```

#### Test Case 2: Settings Reset Tutorial
```typescript
// Setup
localStorage.setItem('scoring-tutorial-completed', 'true');
localStorage.setItem('lastSettingsReset', Date.now().toString());
// Navigate to dashboard
// Verify tutorial appears after 2.5 seconds
```

#### Test Case 3: Onboarding Protection
```typescript
// Setup new user (no preferences)
// Visit dashboard
// Verify tutorial does NOT appear
// Complete onboarding
// Verify tutorial can now appear normally
```

### Quality Assurance Checklist

- [ ] Tutorial never appears during onboarding
- [ ] Tutorial never appears during reset process (first 45 seconds)
- [ ] Personalization works with user's actual company name
- [ ] Target roles and industries are properly referenced
- [ ] Mobile layout is fully responsive
- [ ] Sticky header/footer work correctly
- [ ] Tutorial completion persists across sessions
- [ ] Reset detection works within 60-second window
- [ ] Test functions work in browser console

## Performance Considerations

### Lazy Loading
- Tutorial content only rendered when `showTutorial` is true
- Heavy personalization logic deferred until modal opens
- Minimal impact on initial page load times

### Efficient State Management
```typescript
// Only trigger tutorial when all conditions are met
const shouldShowTutorial = (
  !hasSeenTutorial && 
  !isLoading && 
  hasCompletedOnboarding && 
  preferences && 
  !isOnboardingActive
);
```

### Memory Management
```typescript
// Cleanup effect for tutorial state
useEffect(() => {
  return () => {
    // Clear any pending timeouts
    clearTimeout(tutorialTimeout);
  };
}, []);
```

## Analytics and Metrics

### Key Performance Indicators
- Tutorial completion rate
- Time spent in tutorial
- Skip vs complete ratio
- Tutorial trigger success rate
- Mobile vs desktop usage patterns

### Implementation Hooks
```typescript
const trackTutorialEvent = (event: string, metadata?: any) => {
  console.log(`[Tutorial Analytics] ${event}`, {
    timestamp: new Date().toISOString(),
    userCompany: userPreferences?.companyInfo?.name,
    targetRoles: userPreferences?.targetRoles?.length,
    targetIndustries: userPreferences?.targetIndustries?.length,
    ...metadata
  });
};

// Usage examples
trackTutorialEvent('tutorial_started', { trigger: 'first_upload' });
trackTutorialEvent('tutorial_completed', { duration: completionTime });
trackTutorialEvent('tutorial_skipped', { section: 'pro_tips' });
```

## Maintenance and Updates

### Content Updates
Tutorial content can be updated by modifying the personalization functions in `ScoringTutorialModal.tsx`. Key areas for updates:

1. **Scoring Range Updates**: Update ranges in component documentation
2. **New Personalization Fields**: Add new user preference fields to content generation
3. **Additional Pro Tips**: Expand the pro tips section with new recommendations
4. **Mobile Improvements**: Enhance responsive design as needed

### Feature Flags
Consider implementing feature flags for tutorial behavior:

```typescript
const TUTORIAL_CONFIG = {
  enablePersonalization: true,
  delayAfterUpload: 1500,
  delayAfterReset: 2500,
  resetDetectionWindow: 60000,
  enableAnalytics: true
};
```

## Troubleshooting

### Common Issues

#### Tutorial Not Appearing
1. Check localStorage for `scoring-tutorial-completed`
2. Verify user has completed onboarding
3. Ensure preferences are loaded
4. Check console for timing logs

#### Tutorial Appearing During Onboarding
1. Verify `hasCompletedOnboarding` state
2. Check `preventWelcomeModal` logic
3. Ensure onboarding completion triggers properly

#### Personalization Not Working
1. Verify `userPreferences` prop is passed correctly
2. Check preference data structure
3. Ensure company name and target data exist

### Debug Logging
The tutorial system includes comprehensive console logging:

```typescript
console.log('[ScoringTutorial] Tutorial status loaded:', { hasSeen });
console.log('[Dashboard] Leads loaded, checking tutorial conditions');
console.log('[Tutorial] Showing tutorial after settings reset');
```

Filter console by `[ScoringTutorial]`, `[Dashboard]`, or `[Tutorial]` to debug specific issues. 
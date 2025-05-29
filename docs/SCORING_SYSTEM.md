# Lead Scoring System Documentation

## Overview

The PROPS Lead Management Platform uses a sophisticated, deterministic scoring system to evaluate and rank leads based on multiple dimensions. This document provides technical details about how the scoring system works, recent improvements, and implementation details.

## Scoring Tutorial System

### Overview
The scoring tutorial is an intelligent onboarding system that educates users about our AI-powered lead scoring methodology. It provides company-specific explanations and appears at strategic moments to maximize user understanding without interrupting critical workflows.

### Architecture

#### Components
- **ScoringTutorialModal**: React component providing the interactive tutorial interface
- **useScoringTutorial Hook**: State management for tutorial visibility and completion tracking
- **Integration Points**: Dashboard and Data Input pages with intelligent triggering

#### State Management
```typescript
interface ScoringTutorialState {
  hasSeenTutorial: boolean;
  showTutorial: boolean;
  isLoading: boolean;
}

const TUTORIAL_STORAGE_KEY = 'scoring-tutorial-completed';
```

### Personalization Engine

#### Company-Specific Content
The tutorial dynamically personalizes content based on user preferences:

```typescript
const getPersonalizedIntro = (userPreferences) => {
  const companyName = userPreferences?.companyInfo?.name || 'your company';
  const targetRoles = userPreferences?.targetRoles || [];
  const targetIndustries = userPreferences?.targetIndustries || [];
  
  return `OptiLeads uses advanced algorithms to analyze your leads specifically for ${companyName}...`;
};
```

#### Dynamic Messaging Examples
- **Intent Score**: "For [CompanyName], we prioritize [TargetRole]s who are most likely to need your services"
- **Company Focus**: "Based on [CompanyName]'s focus on [CompanySize] companies in [Industry]..."
- **Pro Tips**: "Better for [CompanyName] to engage 10 high-scoring [TargetRole]s than 50 low ones"

### Trigger Logic

#### Smart Timing System
The tutorial uses intelligent timing to appear at optimal moments:

1. **After First Upload** (Data Input Page):
   ```typescript
   if (uploadedLeads && uploadedLeads.length > 0) {
     setTimeout(() => {
       triggerTutorialAfterUpload(uploadedLeads.length);
     }, 1000);
   }
   ```

2. **After Settings Reset** (Dashboard):
   ```typescript
   const lastResetTime = localStorage.getItem('lastSettingsReset');
   if (lastResetTime && (Date.now() - parseInt(lastResetTime)) < 60000) {
     setTimeout(() => {
       triggerTutorialAfterReset();
     }, 2500);
   }
   ```

#### Conditions That Prevent Tutorial
- Onboarding process is active
- User is in reset state (first 45 seconds after reset)
- Preferences are not yet loaded
- User is not authenticated
- Tutorial was already completed (unless reset occurred)

### Tutorial Content Structure

#### Three-Dimensional Scoring Explanation

1. **Intent Score (40-80 range)**
   - Purchase likelihood based on role, industry, growth indicators
   - Factors: Job title relevance, industry alignment, company growth, technology stack signals

2. **Company Focus (0-100 range)**
   - ICP alignment based on size, vertical, location
   - Factors: Company size/structure, industry vertical, business model, geographic location

3. **Engagement Potential (25-85 range)**
   - Decision-making power and budget authority
   - Factors: Seniority level, budget authority, engagement history, response likelihood

#### Pro Tips Section
Personalized recommendations based on user's business model:
- Focus on high intent leads first (60+ scores)
- Quality over quantity approach
- Optimal timing for outreach
- Industry-specific personalization strategies

### Implementation Details

#### Hook API
```typescript
const {
  hasSeenTutorial,
  showTutorial,
  isLoading,
  triggerTutorialAfterUpload,
  triggerTutorialAfterReset,
  completeTutorial,
  closeTutorial,
  resetTutorial
} = useScoringTutorial();
```

#### Modal Component Props
```typescript
interface ScoringTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userPreferences?: UserPreferences;
}
```

#### Testing Utilities
```typescript
// Available in browser console for testing
window.testScoringTutorial(); // Reset and trigger tutorial
window.testScoringTutorialAfterReset(); // Test reset scenario
```

### Mobile Optimization

#### Responsive Design Features
- **Sticky Header/Footer**: Important controls remain visible during scrolling
- **Optimized Content Spacing**: Readable on small screens
- **Touch-Friendly Controls**: Appropriate button sizes and spacing
- **Backdrop Blur**: Enhanced visual hierarchy on mobile devices

#### CSS Implementation
```css
.tutorial-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.tutorial-header {
  position: sticky;
  top: 0;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(8px);
}
```

### Performance Considerations

#### Lazy Loading
- Tutorial content only loads when triggered
- Images and heavy content deferred until modal opens
- Minimal impact on initial page load

#### State Persistence
- Tutorial completion state persists across sessions
- Efficient localStorage management
- Cleanup of temporary state flags

### Analytics and Tracking

#### User Interaction Metrics
- Tutorial completion rates
- Time spent in tutorial
- Skip vs complete actions
- Reset scenario effectiveness

#### Implementation Hooks
```typescript
const trackTutorialEvent = (event: string, metadata?: object) => {
  // Analytics implementation
  console.log(`[Tutorial] ${event}`, metadata);
};
```

## Scoring Architecture

### Core Principles

1. **Deterministic Results**: All scoring calculations use consistent hash functions to eliminate randomness
2. **User-Preference Aware**: Scoring adapts to user preferences while maintaining consistency
3. **Single Source of Truth**: Only one scoring system runs to prevent conflicts
4. **Performance Optimized**: Intelligent caching prevents duplicate calculations

### Scoring Dimensions

#### 1. Marketing Activity Score (0-100)
Evaluates how relevant a lead is for marketing-focused outreach.

**Calculation Factors:**
- Job title analysis (marketing roles get higher scores)
- Company type indicators
- Lead source quality
- Industry relevance

**Implementation:**
```typescript
const calculateMarketingScore = (lead: Lead): number => {
  // Uses deterministic hash when base data unavailable
  const hash = getStableHashFromLead(lead);
  let baseScore = 45 + (hash % 31); // 45-75 range
  
  // Title-based adjustments
  if (titleContains(['marketing', 'content', 'brand'])) {
    baseScore += 15;
  }
  
  return Math.min(100, Math.max(0, baseScore));
};
```

#### 2. Intent Score (0-100)
Measures likelihood of engagement based on role and company fit.

**Calculation Factors:**
- Role seniority and decision-making authority
- Industry alignment with user's target market
- Company size and type
- Historical engagement indicators

#### 3. Budget Potential (0-100)
Estimates the potential budget authority and spending capability.

**Calculation Factors:**
- Title seniority (C-level, VP, Director, Manager)
- Company size and industry
- Geographic location (financial hubs)
- Explicit value fields in data

#### 4. Spend Authority Score (0-100)
Evaluates decision-making power for purchasing decisions.

**Calculation Factors:**
- Executive level (CEO, CFO, etc.)
- Department authority
- Company structure indicators

#### 5. Best Overall Score (0-100)
Unified score combining all dimensions with user preference weighting.

**Weighting Algorithm:**
```typescript
const calculateBestOverallScore = (lead: Lead, preferences: UserPreferences) => {
  const baseWeights = {
    marketing: 1.0,
    intent: 1.1,
    budget: 0.9,
    spendAuthority: 0.8
  };
  
  // Adjust weights based on user preferences
  if (preferences.targetRoles?.includes(lead.title)) {
    baseWeights.intent *= 1.5;
    baseWeights.marketing *= 1.2;
  }
  
  // Calculate weighted average
  const weightedSum = scores.marketing * weights.marketing + 
                     scores.intent * weights.intent + 
                     scores.budget * weights.budget + 
                     scores.spendAuthority * weights.spendAuthority;
                     
  return Math.round(weightedSum / totalWeights);
};
```

## Deterministic Hash Function

To ensure consistent results across sessions, the system uses a stable hash function:

```typescript
const getStableHashFromLead = (lead: Lead): number => {
  // Create deterministic string from lead properties
  const str = `${lead.id}|${lead.name?.toLowerCase()}|${lead.email?.toLowerCase()}|${lead.company?.toLowerCase()}|${lead.title?.toLowerCase()}`;
  
  // Generate consistent hash
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0; // 32-bit integer
  }
  
  return Math.abs(hash) % 26; // 0-25 range
};
```

## Caching Strategy

### Cache Key Structure
```typescript
const cacheKey = `${leadId}_${preferencesHash}`;
```

### Cache Implementation
```typescript
const scoreCache = new Map<string, {
  intentScore: number,
  spendAuthorityScore: number,
  calculatedOverallScore: number
}>();
```

## Recent Improvements (v15.13.0)

### Problem: Inconsistent Lead Ordering

**Root Cause:**
- Dashboard was scoring leads during fetch (sometimes without preferences)
- LeadsTable was scoring leads during display (with different preference states)
- This created race conditions and inconsistent results

**Solution:**
1. **Unified Scoring**: Removed duplicate scoring in Dashboard
2. **Enhanced Caching**: Cache keys now include preference state
3. **Deterministic Fallbacks**: When preferences unavailable, use consistent hash-based scoring

### Problem: Dual Scoring Systems

**Before:**
```typescript
// Dashboard (page.tsx)
const scoredLeads = scoreLeadsBasedOnPreferences(fetchedLeads, preferences);

// LeadsTable (LeadsTable.tsx)  
const processedLeads = useMemo(() => {
  // Another scoring calculation here
}, [leads, preferences]);
```

**After:**
```typescript
// Dashboard (page.tsx)
setLeads(fetchedLeads); // No scoring here

// LeadsTable (LeadsTable.tsx)
const processedLeads = useMemo(() => {
  // Single source of truth for scoring
}, [leads, preferences]);
```

### Problem: Non-Deterministic Scoring

**Before:**
```typescript
// Random fallback scoring
const fallbackScore = Math.floor(Math.random() * 40) + 40;
```

**After:**
```typescript
// Deterministic fallback scoring
const fallbackScore = 40 + getStableHashFromLead(lead) % 41;
```

## Performance Optimizations

### 1. Single Scoring Pass
- Eliminated duplicate calculations between Dashboard and LeadsTable
- Reduced CPU usage and improved page load times

### 2. Intelligent Caching
- Cache keys include both lead data and preference state
- Prevents unnecessary recalculations when preferences change
- Maintains consistency across navigation

### 3. Stable Sorting
- Added final tie-breaker using lead identifiers
- Ensures consistent ordering even when scores are identical

```typescript
// Final tie-breaker for consistent ordering
const aIdentifier = a.email || a.name || a.id || '';
const bIdentifier = b.email || b.name || b.id || '';
return aIdentifier.localeCompare(bIdentifier);
```

## Testing and Validation

### Consistency Tests
1. **Navigation Test**: Verify lead order remains same after navigating away and returning
2. **Refresh Test**: Confirm scores don't change on page refresh
3. **Preference Test**: Ensure scoring updates appropriately when preferences change

### Performance Tests
1. **Load Time**: Measure time to calculate scores for 1000+ leads
2. **Memory Usage**: Monitor cache size and cleanup
3. **CPU Usage**: Profile scoring calculations under load

## Implementation Guidelines

### Adding New Scoring Factors

1. **Maintain Determinism**: Use hash-based calculations for fallbacks
2. **Update Cache Keys**: Include new factors in cache key generation
3. **Test Consistency**: Verify results remain stable across sessions
4. **Document Changes**: Update this documentation with new factors

### Modifying Existing Scores

1. **Preserve Backwards Compatibility**: Ensure existing leads maintain relative ordering
2. **Use Gradual Rollout**: Test changes with subset of users first
3. **Monitor Performance**: Watch for impact on calculation speed
4. **Update Tests**: Modify validation tests to match new expectations

## Troubleshooting

### Inconsistent Lead Ordering
1. Check browser console for JavaScript errors
2. Verify preferences are loading correctly
3. Clear browser cache and reload
4. Use debug mode to inspect scoring calculations

### Performance Issues
1. Monitor cache hit rates
2. Check for memory leaks in scoring calculations
3. Profile scoring performance with large datasets
4. Consider pagination for very large lead lists

### Scoring Accuracy
1. Validate input data quality
2. Check preference configuration
3. Review scoring weights and factors
4. Test with known good/bad leads for validation

## Future Enhancements

### Planned Improvements
1. **Machine Learning Integration**: Use historical conversion data to improve scoring
2. **A/B Testing Framework**: Test different scoring algorithms
3. **Real-time Updates**: Update scores based on lead interactions
4. **Custom Scoring Models**: Allow users to define custom scoring criteria

### Technical Debt
1. **Scoring Algorithm Versioning**: Track changes to scoring over time
2. **Performance Monitoring**: Add detailed metrics for scoring operations
3. **Automated Testing**: Expand test coverage for edge cases
4. **Documentation**: Keep this document updated with all changes 
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}

export interface UserPreferences {
  id: string;
  userId: string;
  companyName?: string;
  companyIndustry?: string;
  companySize?: string;
  companyProduct?: string;
  targetRoles?: string[];
  targetDemographics?: {
    gender?: 'male' | 'female' | 'all';
    ageRanges?: string[];
    locations?: string[];
    otherCriteria?: string[];
  };
  targetCompanySizes?: string[];
  targetIndustries?: string[];
  customScoringWeights?: {
    marketingScore?: number;
    budgetPotential?: number;
    businessOrientation?: number;
    intentScore?: number;
  };
  hasCompletedOnboarding: boolean;
  onboardingStep: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OnboardingStep = 
  | 'welcome'
  | 'company-info'
  | 'target-roles'
  | 'target-demographics'
  | 'target-companies'
  | 'confirmation'
  | 'complete';

export const OnboardingSteps: { [key: string]: number } = {
  'welcome': 1,
  'company-info': 2,
  'target-roles': 3,
  'target-demographics': 4,
  'target-companies': 5,
  'confirmation': 6,
  'complete': 7
};

export interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
  product: string;
}

export interface TargetRoles {
  roles: string[];
}

export interface TargetDemographics {
  gender: 'male' | 'female' | 'all';
  ageRanges: string[];
  locations: string[];
  otherCriteria: string[];
}

export interface TargetCompanies {
  sizes: string[];
  industries: string[];
}

export type OnboardingData = 
  | CompanyInfo
  | TargetRoles
  | TargetDemographics
  | TargetCompanies; 
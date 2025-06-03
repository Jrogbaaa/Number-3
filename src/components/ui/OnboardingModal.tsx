'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, ChevronRight, ChevronLeft, Check, Building, Users, Briefcase, Target, Settings, AlertCircle, Globe, Loader2 } from 'lucide-react';
import { useUserPreferences } from '@/providers/UserPreferencesProvider';
import { OnboardingStep, OnboardingSteps } from '@/types/user';
import { useSession } from 'next-auth/react';

// Industry options
const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Education',
  'Finance',
  'Retail',
  'Manufacturing',
  'Marketing & Advertising',
  'Consulting',
  'Real Estate',
  'Other'
];

// Company size options
const COMPANY_SIZE_OPTIONS = [
  'Startup (1-10)',
  'Small (11-50)',
  'Medium (51-200)',
  'Large (201-1000)',
  'Enterprise (1000+)'
];

// Job role options
const JOB_ROLE_OPTIONS = [
  'CEO/Founder',
  'CTO',
  'CMO',
  'VP of Marketing',
  'Marketing Director',
  'Marketing Manager',
  'Head of Growth',
  'Sales Director',
  'Product Manager',
  'Business Development'
];

// Location options
const LOCATION_OPTIONS = [
  'United States',
  'Canada',
  'Europe',
  'Asia',
  'Australia',
  'Global'
];

export default function OnboardingModal() {
  const router = useRouter();
  const {
    preferences,
    updatePreferences,
    hasCompletedOnboarding,
    currentOnboardingStep,
    setOnboardingStep,
    completeOnboarding,
    error: preferencesError,
    loading,
  } = useUserPreferences();
  
  // Add session to check authentication status
  const { status } = useSession();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingLocal, setIsSavingLocal] = useState<boolean>(false);
  
  // Sync the state with provider
  useEffect(() => {
    // Only sync from provider if we haven't started onboarding locally yet
    // and if onboarding is not completed
    if (preferences && currentOnboardingStep > 0 && !hasCompletedOnboarding && currentStep === 'welcome') {
      const stepName = Object.keys(OnboardingSteps).find(
        key => OnboardingSteps[key as OnboardingStep] === currentOnboardingStep
      ) as OnboardingStep | undefined;
      
      if (stepName && stepName !== 'complete') {
        setCurrentStep(stepName);
      }
    }
  }, [preferences, currentOnboardingStep, hasCompletedOnboarding, currentStep]);
  
  // Form state
  const [companyName, setCompanyName] = useState(preferences?.companyName || '');
  const [companyIndustry, setCompanyIndustry] = useState(preferences?.companyIndustry || '');
  const [companySize, setCompanySize] = useState(preferences?.companySize || '');
  const [companyProduct, setCompanyProduct] = useState(preferences?.companyProduct || '');
  
  // Website context form state
  const [websiteUrl, setWebsiteUrl] = useState(preferences?.websiteUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(preferences?.linkedinUrl || '');
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);
  const [scrapedWebsiteContent, setScrapedWebsiteContent] = useState(preferences?.scrapedWebsiteContent || '');
  const [scrapedLinkedinContent, setScrapedLinkedinContent] = useState(preferences?.scrapedLinkedinContent || '');
  
  const [selectedRoles, setSelectedRoles] = useState<string[]>(preferences?.targetRoles || []);
  
  const [gender, setGender] = useState<'male' | 'female' | 'all'>(
    preferences?.targetDemographics?.gender || 'all'
  );
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    preferences?.targetDemographics?.locations || []
  );
  
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>(
    preferences?.targetCompanySizes || []
  );
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    preferences?.targetIndustries || []
  );

  // Handle next step
  const handleNextStep = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      let nextStep: OnboardingStep;
      
      switch (currentStep) {
        case 'welcome':
          nextStep = 'company-info';
          break;
        case 'company-info':
          // Validate inputs
          if (!companyName || !companyIndustry || !companySize || !companyProduct) {
            setErrorMessage('Please fill in all fields');
            setIsSubmitting(false);
            return;
          }
          
          // Save company info
          await updatePreferences({
            companyName,
            companyIndustry,
            companySize,
            companyProduct
          });
          nextStep = 'website-context';
          break;
        case 'website-context':
          // Website context is optional, but save any provided URLs and scraped content
          await updatePreferences({
            websiteUrl: websiteUrl.trim() || undefined,
            linkedinUrl: linkedinUrl.trim() || undefined,
            scrapedWebsiteContent: scrapedWebsiteContent || undefined,
            scrapedLinkedinContent: scrapedLinkedinContent || undefined
          });
          nextStep = 'target-roles';
          break;
        case 'target-roles':
          // Validate roles
          if (selectedRoles.length === 0) {
            setErrorMessage('Please select at least one role');
            setIsSubmitting(false);
            return;
          }
          
          // Save target roles
          await updatePreferences({
            targetRoles: selectedRoles
          });
          nextStep = 'target-demographics';
          break;
        case 'target-demographics':
          // Validate demographics (at least locations)
          if (selectedLocations.length === 0) {
            setErrorMessage('Please select at least one location');
            setIsSubmitting(false);
            return;
          }
          
          // Save target demographics
          await updatePreferences({
            targetDemographics: {
              gender: gender,
              ageRanges: [],
              locations: selectedLocations,
              otherCriteria: []
            }
          });
          nextStep = 'target-companies';
          break;
        case 'target-companies':
          // Validate selections
          if (selectedCompanySizes.length === 0 || selectedIndustries.length === 0) {
            setErrorMessage('Please select at least one company size and one industry');
            setIsSubmitting(false);
            return;
          }
          
          // Save target company preferences
          await updatePreferences({
            targetCompanySizes: selectedCompanySizes,
            targetIndustries: selectedIndustries
          });
          nextStep = 'confirmation';
          break;
        case 'confirmation':
          // Mark onboarding as complete in local state
          await completeOnboarding();
          
          // Redirect to data input so users can upload leads after onboarding
          router.push('/data-input');
          return;
        default:
          nextStep = 'welcome';
      }
      
      setCurrentStep(nextStep);
      await setOnboardingStep(OnboardingSteps[nextStep]);
    } catch (err) {
      console.error('Error during onboarding step transition:', err);
      setErrorMessage(
        err instanceof Error 
          ? err.message 
          : 'An error occurred while saving your preferences. Your changes have been stored locally and will sync when the issue is resolved.'
      );
      setIsSavingLocal(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle previous step
  const handlePreviousStep = async () => {
    let prevStep: OnboardingStep;
    
    switch (currentStep) {
      case 'company-info':
        prevStep = 'welcome';
        break;
      case 'website-context':
        prevStep = 'company-info';
        break;
      case 'target-roles':
        prevStep = 'website-context';
        break;
      case 'target-demographics':
        prevStep = 'target-roles';
        break;
      case 'target-companies':
        prevStep = 'target-demographics';
        break;
      case 'confirmation':
        prevStep = 'target-companies';
        break;
      default:
        prevStep = 'welcome';
    }
    
    setCurrentStep(prevStep);
    await setOnboardingStep(OnboardingSteps[prevStep]);
  };
  
  // Handle role selection toggle
  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };
  
  // Handle location selection toggle
  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter(l => l !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };
  
  // Handle company size selection toggle
  const toggleCompanySize = (size: string) => {
    if (selectedCompanySizes.includes(size)) {
      setSelectedCompanySizes(selectedCompanySizes.filter(s => s !== size));
    } else {
      setSelectedCompanySizes([...selectedCompanySizes, size]);
    }
  };
  
  // Handle industry selection toggle
  const toggleIndustry = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };
  
  // Handle website scraping
  const handleScrapeWebsite = async () => {
    if (!websiteUrl.trim()) {
      setErrorMessage('Please enter a website URL');
      return;
    }

    setIsScrapingWebsite(true);
    setErrorMessage('');

    try {
      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch('/api/scrape-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: websiteUrl.trim(),
          type: 'website'
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific error status codes
        if (response.status === 408) {
          throw new Error('The website took too long to load. Please try a different URL or try again later.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status === 503) {
          throw new Error('Scraping service is temporarily unavailable. Please try again later.');
        }
        throw new Error(data.error || 'Failed to scrape website content');
      }

      if (data.success && data.data?.content) {
        setScrapedWebsiteContent(data.data.content);
        setErrorMessage('');
      } else {
        throw new Error('No content could be extracted from the website');
      }
    } catch (error) {
      console.error('Website scraping error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setErrorMessage('Request timed out. Please try again with a different URL.');
        } else {
          setErrorMessage(error.message);
        }
      } else {
        setErrorMessage('Failed to scrape website content. Please try again.');
      }
    } finally {
      setIsScrapingWebsite(false);
    }
  };
  
  // Step indicators
  const steps = [
    { name: 'Welcome', icon: <Settings className="h-5 w-5" />, step: 'welcome' },
    { name: 'Company', icon: <Building className="h-5 w-5" />, step: 'company-info' },
    { name: 'Website', icon: <Globe className="h-5 w-5" />, step: 'website-context' },
    { name: 'Roles', icon: <Briefcase className="h-5 w-5" />, step: 'target-roles' },
    { name: 'Demographics', icon: <Users className="h-5 w-5" />, step: 'target-demographics' },
    { name: 'Target Companies', icon: <Target className="h-5 w-5" />, step: 'target-companies' },
  ];
  
  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-600/20 mx-auto mb-4">
              <Settings className="h-12 w-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold text-center">Welcome to OptiLeads</h2>
            <p className="text-gray-300 text-center">
              Let's set up your account to customize your lead scoring experience. This will help us
              provide more relevant insights for your business.
            </p>
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="font-medium text-blue-400 mb-2">What you'll need to provide:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Information about your company</li>
                <li>Your target customer roles and demographics</li>
                <li>Types of companies you want to target</li>
              </ul>
              <p className="mt-2 text-blue-400">This will take about 2 minutes.</p>
            </div>
          </div>
        );
      
      case 'company-info':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">About Your Company</h2>
            <p className="text-gray-300">
              Tell us about your business so we can tailor the lead scoring algorithm.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="companyName" className="block mb-1 text-sm font-medium text-gray-300">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  placeholder="Your company name"
                />
              </div>
              
              <div>
                <label htmlFor="companyIndustry" className="block mb-1 text-sm font-medium text-gray-300">
                  Industry
                </label>
                <select
                  id="companyIndustry"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                >
                  <option value="">Select an industry</option>
                  {INDUSTRY_OPTIONS.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="companySize" className="block mb-1 text-sm font-medium text-gray-300">
                  Company Size
                </label>
                <select
                  id="companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                >
                  <option value="">Select a size</option>
                  {COMPANY_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="companyProduct" className="block mb-1 text-sm font-medium text-gray-300">
                  What do you offer/sell?
                </label>
                <textarea
                  id="companyProduct"
                  value={companyProduct}
                  onChange={(e) => setCompanyProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                  placeholder="Describe your main product or service"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );
      
      case 'website-context':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-green-600/20 mx-auto mb-4">
              <Globe className="h-12 w-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-center">Website & LinkedIn Context</h2>
            <p className="text-gray-300 text-center">
              Help us understand your business better by providing your website and LinkedIn profile. 
              We'll analyze this content to improve lead scoring accuracy.
            </p>
            
            <div className="space-y-6">
              {/* Website URL Section */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">Company Website</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="websiteUrl" className="block mb-1 text-sm font-medium text-gray-300">
                      Website URL
                    </label>
                    <input
                      type="url"
                      id="websiteUrl"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleScrapeWebsite}
                    disabled={!websiteUrl.trim() || isScrapingWebsite}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md font-medium flex items-center justify-center space-x-2"
                  >
                    {isScrapingWebsite ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing Website... (this may take up to 60 seconds)</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4" />
                        <span>Analyze Website</span>
                      </>
                    )}
                  </button>
                  {scrapedWebsiteContent && (
                    <div className="mt-2 p-3 bg-green-900/20 border border-green-800/30 rounded-md">
                      <p className="text-sm text-green-400 font-medium">✓ Website content analyzed successfully</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {scrapedWebsiteContent.length} characters of content extracted
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* LinkedIn URL Section */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-3">LinkedIn Business Profile</h3>
                <div className="space-y-3">
                  <div>
                    <label htmlFor="linkedinUrl" className="block mb-1 text-sm font-medium text-gray-300">
                      LinkedIn Company Page URL
                    </label>
                    <input
                      type="url"
                      id="linkedinUrl"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                  
                  {/* LinkedIn limitation notice */}
                  <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-md p-3">
                    <p className="text-sm text-yellow-400 font-medium mb-1">⚠️ LinkedIn Limitation</p>
                    <p className="text-xs text-gray-300">
                      LinkedIn actively blocks automated scraping. Instead, you can manually copy key information 
                      from your LinkedIn company page and paste it in the text area below.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="linkedinContent" className="block mb-1 text-sm font-medium text-gray-300">
                      LinkedIn Company Information (Optional)
                    </label>
                    <textarea
                      id="linkedinContent"
                      value={scrapedLinkedinContent}
                      onChange={(e) => setScrapedLinkedinContent(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
                      placeholder="Paste your company description, mission, key services, or other relevant information from your LinkedIn page..."
                      rows={4}
                    />
                  </div>
                  
                  {scrapedLinkedinContent && (
                    <div className="mt-2 p-3 bg-green-900/20 border border-green-800/30 rounded-md">
                      <p className="text-sm text-green-400 font-medium">✓ LinkedIn content added successfully</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {scrapedLinkedinContent.length} characters of content provided
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4 text-sm text-gray-300">
                <p className="font-medium text-blue-400 mb-2">Why do we analyze your content?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Better understand your business model and value proposition</li>
                  <li>Identify key messaging and positioning themes</li>
                  <li>Improve lead scoring based on company context</li>
                  <li>Provide more relevant insights and recommendations</li>
                </ul>
                <p className="mt-2 text-blue-400 text-xs">This step is optional but highly recommended for better results.</p>
              </div>
            </div>
          </div>
        );
      
      case 'target-roles':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Target Roles</h2>
            <p className="text-gray-300">
              Which job roles are you primarily targeting? Select all that apply.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {JOB_ROLE_OPTIONS.map(role => (
                <div 
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`
                    px-4 py-3 rounded-md cursor-pointer text-sm font-medium flex items-center justify-between
                    ${selectedRoles.includes(role) 
                      ? 'bg-blue-600/30 border border-blue-500/50 text-blue-100' 
                      : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'}
                  `}
                >
                  <span>{role}</span>
                  {selectedRoles.includes(role) && (
                    <Check className="h-4 w-4 text-blue-300" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-gray-400 italic">
                This helps us prioritize leads with matching job titles.
              </p>
            </div>
          </div>
        );
      
      case 'target-demographics':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Target Demographics</h2>
            <p className="text-gray-300">
              Define demographic preferences for your ideal customers.
            </p>
            
            <div className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Gender Preference
                </label>
                <div className="flex space-x-4">
                  <div 
                    onClick={() => setGender('all')}
                    className={`
                      px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex-1 text-center
                      ${gender === 'all' 
                        ? 'bg-blue-600/30 border border-blue-500/50 text-blue-100' 
                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'}
                    `}
                  >
                    All Genders
                  </div>
                  <div 
                    onClick={() => setGender('male')}
                    className={`
                      px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex-1 text-center
                      ${gender === 'male' 
                        ? 'bg-blue-600/30 border border-blue-500/50 text-blue-100' 
                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'}
                    `}
                  >
                    Male
                  </div>
                  <div 
                    onClick={() => setGender('female')}
                    className={`
                      px-4 py-2 rounded-md cursor-pointer text-sm font-medium flex-1 text-center
                      ${gender === 'female' 
                        ? 'bg-blue-600/30 border border-blue-500/50 text-blue-100' 
                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'}
                    `}
                  >
                    Female
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Target Locations
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LOCATION_OPTIONS.map(location => (
                    <div 
                      key={location}
                      onClick={() => toggleLocation(location)}
                      className={`
                        px-3 py-2 rounded-md cursor-pointer text-sm font-medium flex items-center justify-between
                        ${selectedLocations.includes(location) 
                          ? 'bg-blue-600/30 border border-blue-500/50 text-blue-100' 
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'}
                      `}
                    >
                      <span>{location}</span>
                      {selectedLocations.includes(location) && (
                        <Check className="h-4 w-4 text-blue-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'target-companies':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Target Companies</h2>
            <p className="text-gray-300">
              What types of companies are you targeting?
            </p>
            
            <div className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Company Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMPANY_SIZE_OPTIONS.map(size => (
                    <div 
                      key={size}
                      onClick={() => toggleCompanySize(size)}
                      className={`
                        px-3 py-2 rounded-md cursor-pointer text-sm font-medium flex items-center
                        ${selectedCompanySizes.includes(size) 
                          ? 'bg-blue-600/30 border border-blue-500/50 text-blue-100' 
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'}
                      `}
                    >
                      <span>{size}</span>
                      {selectedCompanySizes.includes(size) && (
                        <Check className="ml-2 h-4 w-4 text-blue-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Target Industries
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INDUSTRY_OPTIONS.map(industry => (
                    <div 
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`
                        px-3 py-2 rounded-md cursor-pointer text-sm font-medium flex items-center justify-between
                        ${selectedIndustries.includes(industry) 
                          ? 'bg-blue-600/30 border border-blue-500/50 text-blue-100' 
                          : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'}
                      `}
                    >
                      <span>{industry}</span>
                      {selectedIndustries.includes(industry) && (
                        <Check className="h-4 w-4 text-blue-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-green-600/20 mx-auto mb-4">
              <Check className="h-12 w-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-center">All Set!</h2>
            <p className="text-gray-300 text-center">
              Your preferences have been saved. We'll use this information to customize your lead scoring algorithm.
            </p>
            
            <div className="bg-gray-800 rounded-lg p-4 text-sm space-y-4">
              <div>
                <h3 className="text-blue-400 font-medium">Company</h3>
                <p className="text-gray-300">{companyName || 'Not specified'}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {companyIndustry}, {companySize}
                </p>
              </div>
              
              <div>
                <h3 className="text-blue-400 font-medium">Target Roles</h3>
                {selectedRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedRoles.map(role => (
                      <span 
                        key={role}
                        className="inline-block px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded-md"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No specific roles selected</p>
                )}
              </div>
              
              <div>
                <h3 className="text-blue-400 font-medium">Demographics</h3>
                <p className="text-gray-300">Gender: {gender === 'all' ? 'All Genders' : gender}</p>
                {selectedLocations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedLocations.map(location => (
                      <span 
                        key={location}
                        className="inline-block px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded-md"
                      >
                        {location}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-blue-400 font-medium">Target Companies</h3>
                {selectedCompanySizes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCompanySizes.map(size => (
                      <span 
                        key={size}
                        className="inline-block px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded-md"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                )}
                {selectedIndustries.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedIndustries.map(industry => (
                      <span 
                        key={industry}
                        className="inline-block px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded-md"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-gray-400 text-sm text-center">
              You can always modify these preferences later in your account settings.
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Add error banner component
  const ErrorBanner = () => {
    if (!errorMessage && !preferencesError) return null;
    
    const message = errorMessage || preferencesError;
    const isDbError = message?.includes('table') || message?.includes('database');
    
    return (
      <div className={`${isDbError ? 'bg-blue-900/20 border border-blue-800' : 'bg-red-900/30 border border-red-800'} px-4 py-3 rounded-md flex items-start gap-3 mt-2 mb-4`}>
        <AlertCircle className={`h-5 w-5 ${isDbError ? 'text-blue-400' : 'text-red-400'} mt-0.5 flex-shrink-0`} />
        <div>
          <p className={`font-medium ${isDbError ? 'text-blue-300' : 'text-red-300'}`}>
            {isDbError ? 'Database Synchronization Notice' : 'We encountered an issue'}
          </p>
          <p className="mt-1 text-sm text-gray-300">{message}</p>
          {isSavingLocal && (
            <p className="mt-2 text-sm text-gray-300">
              Your preferences are being saved locally and will sync when database connectivity is restored.
            </p>
          )}
        </div>
      </div>
    );
  };
  
  // Show loading state if preferences are still loading
  if (loading && !preferences) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-4">
          <div className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-4"></div>
            <h3 className="text-xl font-medium text-white">Loading your preferences</h3>
            <p className="text-gray-400 text-center mt-2">Please wait while we set up your onboarding experience...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Don't render the modal if onboarding is already completed
  if (hasCompletedOnboarding) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
        {/* Modal header with progress bar */}
        <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-1">
            {steps.map((step, index) => (
              <div 
                key={step.step}
                className="flex items-center"
              >
                <div 
                  className={`
                    flex items-center justify-center h-8 w-8 rounded-full
                    ${currentStep === step.step 
                      ? 'bg-blue-600 text-white' 
                      : OnboardingSteps[currentStep] > OnboardingSteps[step.step]
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-gray-800 text-gray-400'}
                  `}
                >
                  {OnboardingSteps[currentStep] > OnboardingSteps[step.step] ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`
                      h-1 w-3 sm:w-5 
                      ${OnboardingSteps[currentStep] > OnboardingSteps[step.step]
                        ? 'bg-green-600/30'
                        : 'bg-gray-800'}
                    `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6">
        {/* Error banner */}
        <ErrorBanner />
        
        {/* Modal content */}
        <div className="py-2">
          {renderStepContent()}
          </div>
        </div>
        
        {/* Fixed footer with navigation buttons */}
        <div className="flex justify-between p-6 pt-4 border-t border-gray-800 bg-gray-900">
          <button
            onClick={handlePreviousStep}
            className={`
              px-4 py-2 rounded-lg flex items-center space-x-1
              ${currentStep === 'welcome' 
                ? 'invisible' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
            `}
            disabled={isSubmitting}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleNextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Saving...</span>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </>
            ) : (
              <>
                <span>{currentStep === 'confirmation' ? 'Finish' : 'Next'}</span>
                {currentStep !== 'confirmation' && <ChevronRight className="h-4 w-4" />}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 
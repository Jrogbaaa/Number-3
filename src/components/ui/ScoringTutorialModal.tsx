'use client';

import React from 'react';
import { X, Target, Building, TrendingUp, Lightbulb, CheckCircle } from 'lucide-react';

interface ScoringTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userPreferences?: any; // Add user preferences for personalization
}

const ScoringTutorialModal: React.FC<ScoringTutorialModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  userPreferences
}) => {
  const handleComplete = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  // Extract personalization data
  const companyName = userPreferences?.companyInfo?.name || 'your company';
  const targetRoles = userPreferences?.targetRoles || [];
  const targetIndustries = userPreferences?.targetIndustries || [];
  const targetCompanySizes = userPreferences?.targetCompanySizes || [];
  const businessType = userPreferences?.businessInfo?.type || 'your business';

  // Create personalized messaging
  const getPersonalizedIntro = () => {
    let intro = `OptiLeads uses advanced algorithms to analyze your leads specifically for ${companyName}. `;
    
    if (targetRoles.length > 0) {
      intro += `Based on your focus on ${targetRoles.slice(0, 2).join(' and ')}${targetRoles.length > 2 ? ' roles' : ''}, `;
    }
    
    if (targetIndustries.length > 0) {
      intro += `targeting ${targetIndustries.slice(0, 2).join(' and ')} industries, `;
    }
    
    intro += `each lead receives scores that help ${companyName} prioritize outreach efforts and focus on the most promising prospects for your specific needs.`;
    
    return intro;
  };

  const getPersonalizedIntentDescription = () => {
    let description = `Measures how likely a lead is to be actively looking for ${companyName}'s solution. `;
    
    if (targetRoles.length > 0) {
      description += `For ${companyName}, we prioritize ${targetRoles[0]}s and similar decision-makers who are most likely to need your services.`;
    } else {
      description += `This helps ${companyName} identify prospects who are actively seeking solutions like yours.`;
    }
    
    return description;
  };

  const getPersonalizedCompanyDescription = () => {
    let description = `Evaluates how well the company aligns with ${companyName}'s ideal customer profile. `;
    
    const criteria = [];
    if (targetCompanySizes.length > 0) {
      criteria.push(`${targetCompanySizes[0]} companies`);
    }
    if (targetIndustries.length > 0) {
      criteria.push(`${targetIndustries[0]} industry`);
    }
    
    if (criteria.length > 0) {
      description += `Based on ${companyName}'s focus on ${criteria.join(' in the ')}, we score leads higher when they match your preferred criteria.`;
    } else {
      description += `This score reflects how well each prospect matches what works best for ${companyName}.`;
    }
    
    return description;
  };

  const getPersonalizedEngagementDescription = () => {
    return `Assesses the lead's decision-making power and budget authority specifically for ${companyName}'s offerings. This helps ${companyName} focus on prospects who can actually make purchasing decisions and have the authority to move forward with your solution.`;
  };

  const getPersonalizedOverallDescription = () => {
    return `Our AI combines all scoring dimensions with ${companyName}'s specific preferences to create a unified "Best Overall" score. This helps ${companyName} quickly identify the most promising leads for immediate outreach based on your unique business model and target market.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-600/20 border border-blue-500/30">
              <Lightbulb className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Understanding Your Lead Scores</h2>
              <p className="text-gray-400">Learn how OptiLeads evaluates your leads</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            aria-label="Close tutorial"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-700/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">🎯 Welcome to AI-Powered Lead Scoring!</h3>
            <p className="text-gray-300 leading-relaxed">
              {getPersonalizedIntro()}
            </p>
          </div>

          {/* Scoring Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Intent Score */}
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-green-600/20 border border-green-500/30">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="text-xl font-bold text-white">Intent Score</h4>
              </div>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {getPersonalizedIntentDescription()}
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-green-400 font-medium">Factors analyzed:</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Job title and role relevance</li>
                    <li>• Industry alignment</li>
                    <li>• Company growth indicators</li>
                    <li>• Technology stack signals</li>
                  </ul>
                </div>
                <div className="mt-4 p-3 bg-green-900/20 rounded-lg">
                  <div className="text-xs text-green-300 font-medium">Score Range: 40-80</div>
                  <div className="text-xs text-gray-400 mt-1">Higher scores indicate stronger purchase intent</div>
                </div>
              </div>
            </div>

            {/* Company Focus */}
            <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-purple-600/20 border border-purple-500/30">
                  <Building className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-xl font-bold text-white">Company Focus</h4>
              </div>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {getPersonalizedCompanyDescription()}
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-purple-400 font-medium">Factors analyzed:</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Company size and structure</li>
                    <li>• Industry vertical match</li>
                    <li>• Business model (B2B/B2C)</li>
                    <li>• Geographic location</li>
                  </ul>
                </div>
                <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
                  <div className="text-xs text-purple-300 font-medium">Score Range: 0-100</div>
                  <div className="text-xs text-gray-400 mt-1">Based on your target preferences</div>
                </div>
              </div>
            </div>

            {/* Engagement Potential */}
            <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border border-orange-700/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-orange-600/20 border border-orange-500/30">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <h4 className="text-xl font-bold text-white">Engagement Potential</h4>
              </div>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {getPersonalizedEngagementDescription()}
                </p>
                <div className="space-y-2">
                  <div className="text-xs text-orange-400 font-medium">Factors analyzed:</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Seniority level and influence</li>
                    <li>• Budget authority indicators</li>
                    <li>• Previous engagement history</li>
                    <li>• Response likelihood</li>
                  </ul>
                </div>
                <div className="mt-4 p-3 bg-orange-900/20 rounded-lg">
                  <div className="text-xs text-orange-300 font-medium">Score Range: 25-85</div>
                  <div className="text-xs text-gray-400 mt-1">Higher scores = better engagement odds</div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Overall Score */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/30">
                <CheckCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-xl font-bold text-white">Best Overall Score</h4>
            </div>
            <p className="text-gray-300 mb-4">
              {getPersonalizedOverallDescription()}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-400 mb-2">Personalized Weighting</div>
                <div className="text-xs text-gray-400">
                  Based on {companyName}'s onboarding preferences, target industries, and company focus
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-400 mb-2">Dynamic Ranking</div>
                <div className="text-xs text-gray-400">
                  Automatically adjusts as {companyName} provides feedback and interacts with leads
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">💡 Pro Tips for {companyName}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-green-400">Focus on High Intent First</div>
                    <div className="text-xs text-gray-400">
                      {targetRoles.length > 0 
                        ? `${targetRoles[0]}s with 60+ intent scores are actively looking for ${companyName}'s solutions`
                        : `Leads with 60+ intent scores are actively looking for ${companyName}'s solutions`
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-purple-400">Quality over Quantity for {companyName}</div>
                    <div className="text-xs text-gray-400">
                      Better for {companyName} to engage 10 high-scoring {targetRoles.length > 0 ? targetRoles[0] + 's' : 'leads'} than 50 low-scoring ones
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-orange-400">Timing Matters for {companyName}</div>
                    <div className="text-xs text-gray-400">Use the outreach calendar to contact prospects at optimal times for your industry</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-blue-400">Personalize for {companyName}</div>
                    <div className="text-xs text-gray-400">
                      Use AI message customization to highlight how {companyName} solves {targetIndustries.length > 0 ? targetIndustries[0] : 'industry'} challenges
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            You can always access this information in your dashboard
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleComplete}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringTutorialModal; 
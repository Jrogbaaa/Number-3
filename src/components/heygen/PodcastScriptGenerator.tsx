'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PodcastFormat {
  id: string;
  name: string;
  description: string;
}

const podcastFormats: PodcastFormat[] = [
  {
    id: 'interview',
    name: 'Interview Style',
    description: 'One host interviews an expert about lead data insights',
  },
  {
    id: 'discussion',
    name: 'Discussion Format',
    description: 'Multiple hosts discuss lead insights and strategies',
  },
  {
    id: 'debate',
    name: 'Debate Format',
    description: 'Hosts present contrasting views on lead generation approaches',
  },
];

const PodcastScriptGenerator = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>('interview');
  const [numHosts, setNumHosts] = useState<string>('2');
  const [duration, setDuration] = useState<string>('10');
  const [voiceStyle, setVoiceStyle] = useState<string>('professional');
  const [focusArea, setFocusArea] = useState<string>('general');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
  };

  const handleGenerateScript = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGeneratedScript(null);

    console.log('Generating script with settings:', {
      format: selectedFormat,
      hosts: numHosts,
      duration: `${duration} minutes`,
      style: voiceStyle,
      focus: focusArea,
    });

    await new Promise(resolve => setTimeout(resolve, 1500));

    const formatName = podcastFormats.find(f => f.id === selectedFormat)?.name || selectedFormat;
    const hostCount = parseInt(numHosts);
    const targetDuration = parseInt(duration);

    let script = `**Generated Podcast Script (Marketing & Finance Focus - Enhanced)**\n\n`;
    script += `**Format:** ${formatName}\n`;
    script += `**Number of Hosts:** ${hostCount}\n`;
    script += `**Target Duration:** ${targetDuration} minutes\n`;
    script += `**Voice Style:** ${voiceStyle}\n`;
    script += `**Focus Area:** ${focusArea}\n\n`;
    script += `--- Script Start (Approx. ${targetDuration} mins) ---\n\n`;

    const getHostName = (index: number) => `Host ${index + 1}`;
    const getSpeakerName = (index: number) => index === 0 ? 'Moderator' : `Speaker ${index}`;

    const intro = `**(Intro Music Fades)**\n`;
    const outro = `\n**(Outro Music Fades In)**\n**Host 1 / Moderator:** That's all the time we have for today. Thanks for tuning in!\n`;

    script += intro;

    switch (selectedFormat) {
      case 'interview':
        const host = getHostName(0);
        const expert = hostCount > 1 ? getHostName(1) : 'Expert Guest';
        script += `**${host}:** (${voiceStyle} tone) Welcome back! Today, we're zeroing in on ${focusArea} within the financial services marketing space. We're joined by ${expert}. Thanks for being here.\n`;
        script += `**${expert}:** (${voiceStyle} tone) My pleasure. ${focusArea} is certainly a hot topic, especially considering [mention a recent relevant event, e.g., recent regulatory changes / market volatility].\n`;
        if (focusArea === 'conversion') {
          script += `**${host}:** Let's drill down into conversion. Beyond standard A/B tests, what advanced strategies are yielding results for turning finance leads into high-value clients?\n`;
          script += `**${expert}:** We're seeing significant uplift from dynamic content personalization on landing pages based on referral source or ad group. Also, multi-touch attribution models are finally giving us clearer insight into which channels truly drive conversions, allowing for better budget allocation.\n`;
          script += `**${host}:** Attribution is key. How are you tracking that effectively across long sales cycles common in finance?\n`;
          script += `**${expert}:** It requires robust CRM integration and careful UTM parameter management. Tools like [mention hypothetical tool type, e.g., 'FinanceLead Analytics' or 'Salesforce Marketing Cloud'] are essential...\n`;
        } else if (focusArea === 'sources') {
          script += `**${host}:** Shifting to lead sources, are traditional channels like financial seminars still relevant, or is it all digital now?\n`;
          script += `**${expert}:** Digital is dominant, but high-value B2B finance leads often still come from targeted industry events and referral partnerships. The key is integration – capturing event leads digitally and nurturing them through targeted online content. We're also seeing surprising results from niche platforms like [mention hypothetical platform, e.g., 'FinTalk forums'].\n`;
          script += `**${host}:** Interesting. So a truly blended approach is needed?\n`;
          script += `**${expert}:** Exactly. Don't put all your eggs in one basket. Analyze cost-per-qualified-lead (CPQL) for each source constantly.\n`;
        } else { // general or nurturing
          script += `**${host}:** For ${focusArea}, what's the biggest mistake marketing teams make in the finance industry?\n`;
          script += `**${expert}:** Often, it's inconsistent messaging or not providing enough tangible value during the nurturing phase. Prospects need whitepapers, case studies, webinars – not just sales pitches. Building trust takes time and expertise demonstration.\n`;
          script += `**${host}:** How important is regulatory compliance in ${focusArea} communications?\n`;
          script += `**${expert}:** Absolutely critical. Every piece of content needs legal review. It slows things down, but the risk of non-compliance is too high. Automating parts of the review workflow can help.\n`;
        }
        script += `**${host}:** Excellent points, ${expert}. We're almost out of time. Any final thought?\n`;
        script += `**${expert}:** Focus on data, personalization, and building trust. That's the core of successful finance marketing today.\n`;
        break;

      case 'discussion':
        script += `**${getHostName(0)}:** (${voiceStyle} tone) Alright team, welcome back. Today's focus: ${focusArea}. ${targetDuration} minutes on the clock. ${getHostName(1)}, your initial thoughts?\n`;
        if (hostCount > 1) {
          script += `**${getHostName(1)}:** (${voiceStyle} tone) Thanks, ${getHostName(0)}. Regarding ${focusArea}, the latest industry benchmarks show [mention a relevant stat/trend]. We need to assess how our current strategy aligns.\n`;
        }
        if (hostCount > 2) {
          script += `**${getHostName(2)}:** (${voiceStyle} tone) Agreed. I pulled our numbers for last quarter's campaign focused on [Relevant Channel/Product], and specifically for ${focusArea}, we saw [mention a finding, e.g., 'a 15% increase in MQLs but a dip in SQL conversion'].\n`;
        }
        if (focusArea === 'conversion') {
           script += `**${getHostName(0)}:** Okay, that dip in SQL conversion is concerning. ${hostCount > 1 ? getHostName(1) : 'Team'}, any ideas why? Was it lead quality or sales follow-up?\n`;
           if (hostCount > 1) script += `**${getHostName(1)}:** My gut says lead qualification needs tightening. Maybe our definition of an MQL for finance products is too broad?\n`;
           if (hostCount > 2) script += `**${getHostName(2)}:** Or perhaps the handoff process to sales needs refinement? Are they getting the right context quickly enough?\n`;
        } else if (focusArea === 'nurturing'){
           script += `**${getHostName(0)}:** Let's talk nurturing sequences. Are our current email workflows and content offers effectively guiding finance leads down the funnel?\n`;
           if (hostCount > 1) script += `**${getHostName(1)}:** I reviewed the engagement stats. The initial whitepaper download gets good traction, but the follow-up webinar invites have a low CTR. Maybe the topic isn't compelling enough?\n`;
           if (hostCount > 2) script += `**${getHostName(2)}:** We could test segmenting the nurture track based on the initial content they engaged with. Personalization might boost relevance.\n`;
        } else { // sources, general
           script += `**${getHostName(0)}:** Thinking about ${focusArea}, what's one opportunity we're currently underutilizing in the finance market?\n`;
           if (hostCount > 1) script += `**${getHostName(1)}:** Video marketing. Explainer videos for complex financial products could be huge for engagement and trust-building.\n`;
           if (hostCount > 2) script += `**${getHostName(2)}:** I'd say strategic partnerships with complementary FinTech companies. Cross-promotion could open up new, qualified audiences.\n`;
        }
        script += `**${getHostName(0)}:** Some solid ideas here. Let's prioritize testing [mention one idea] next sprint.\n`;
        break;

      case 'debate':
        const moderator = getSpeakerName(0);
        script += `**${moderator}:** (${voiceStyle} tone) Welcome to the Marketing & Finance Strategy Debate! Our ${targetDuration}-minute topic: What's the single most crucial element for success in ${focusArea}? ${getSpeakerName(1)}, you argue for [Specific Strategy A, e.g., 'Hyper-Personalization']. Your opening statement.\n`;
        script += `**${getSpeakerName(1)}:** (${voiceStyle} tone) Thank you. In finance, trust is paramount. Generic marketing fails. Hyper-personalization, using AI to tailor every interaction based on deep customer data for ${focusArea}, isn't just nice-to-have, it's the *only* way to cut through the noise and build rapport.\n`;
        if (hostCount > 1) {
           script += `**${getSpeakerName(2)}:** (${voiceStyle} tone) A compelling vision, ${getSpeakerName(1)}, but impractical at scale for many firms, and potentially creepy. I argue that [Specific Strategy B, e.g., 'Thought Leadership Content'] is far more crucial. Establishing genuine expertise on ${focusArea} through high-quality content builds credibility and attracts leads organically, a more sustainable approach.\n`;
           script += `**${moderator}:** ${getSpeakerName(1)}, your rebuttal?\n`;
           script += `**${getSpeakerName(1)}:** Content is essential, but without personalization, it falls flat. Our data shows personalized content outreach has 3x the engagement for ${focusArea} compared to generic blog posts. Scale is achievable with the right MarTech stack.\n`;
        }
        if (hostCount > 2) {
           script += `**${getSpeakerName(3)}:** (${voiceStyle} tone) Both miss the elephant in the room: [Specific Strategy C, e.g., 'Aggressive Performance Marketing']. You can personalize and publish content all day, but without driving targeted traffic via channels like LinkedIn Ads and Google Search for high-intent financial keywords related to ${focusArea}, you won't reach prospects actively looking to engage.\n`;
           script += `**${moderator}:** Interesting counterpoint. ${hostCount > 1 ? getSpeakerName(2) : getSpeakerName(1)}, how do you respond to the need for paid acquisition?\n`;
           if (hostCount > 1) script += `**${getSpeakerName(2)}:** Paid acquisition has its place, but it's expensive and often yields lower-quality leads if not supported by strong content and brand reputation. Thought leadership builds the foundation.\n`;
        }
        script += `**${moderator}:** Clearly strong opinions on all sides regarding the key driver for ${focusArea}. We need to wrap up.\n`;
        break;

       default:
         script += 'Error: Could not generate script for the selected format.\n';
    }

    script += outro;

    setGeneratedScript(script);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gray-800/50 rounded-lg border border-gray-700/80 shadow-sm">
      <div> 
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Select Podcast Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {podcastFormats.map((format) => {
            const isSelected = selectedFormat === format.id;
            return (
              <div
                key={format.id}
                className={`group rounded-lg border p-4 cursor-pointer transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 
                  ${isSelected
                    ? 'border-blue-500 bg-blue-900/40 shadow-md'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700/70'
                  }`}
                onClick={() => handleFormatSelect(format.id)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFormatSelect(format.id);
                  }
                }}
              >
                <h4 className={`font-semibold mb-1 ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>{format.name}</h4>
                <p className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-300'}`}>{format.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 md:mt-8">
        <h3 className="text-lg font-semibold text-gray-100 mb-5">Podcast Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <label htmlFor="numHosts" className="block text-sm font-medium text-gray-300 mb-1.5">
              Number of Hosts
            </label>
            <select 
              id="numHosts"
              name="numHosts"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              value={numHosts}
              onChange={(e) => setNumHosts(e.target.value)}
            >
              <option value="1">1 Host</option>
              <option value="2">2 Hosts</option>
              <option value="3">3 Hosts</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1.5">
              Podcast Duration
            </label>
            <select 
              id="duration"
              name="duration"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="voiceStyle" className="block text-sm font-medium text-gray-300 mb-1.5">
              Voice Style
            </label>
            <select 
              id="voiceStyle"
              name="voiceStyle"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              value={voiceStyle}
              onChange={(e) => setVoiceStyle(e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="energetic">Energetic</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="focusArea" className="block text-sm font-medium text-gray-300 mb-1.5">
              Focus Area
            </label>
            <select 
              id="focusArea"
              name="focusArea"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
            >
              <option value="general">General Lead Insights</option>
              <option value="conversion">Conversion Strategies</option>
              <option value="sources">Lead Sources Analysis</option>
              <option value="nurturing">Lead Nurturing Tips</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleGenerateScript}
            disabled={isGenerating}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-150 ease-in-out shadow-sm hover:shadow-md text-base font-medium"
            aria-label="Generate podcast script with current settings"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Podcast Script'
            )}
          </Button>
        </div>

        {generatedScript && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Generated Script:</h3>
            <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 md:p-6 shadow-inner">
              <pre className="text-gray-300 whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {generatedScript}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PodcastScriptGenerator;
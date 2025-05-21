'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ContentFormat {
  id: string;
  name: string;
  description: string;
}

const contentFormats: ContentFormat[] = [
  {
    id: 'interview',
    name: 'Interview Style Video',
    description: 'A host interviews an expert on a specific financial topic.',
  },
  {
    id: 'discussion',
    name: 'Discussion Panel Video',
    description: 'Multiple experts discuss financial insights and strategies.',
  },
  {
    id: 'explainer',
    name: 'Short Explainer Video',
    description: 'A concise video explaining a key financial concept or product.',
  },
];

interface FinanceFocusArea {
  id: string;
  name: string;
}

const financeFocusAreas: FinanceFocusArea[] = [
  { id: 'market_trends', name: 'Market Trends & Analysis' },
  { id: 'investment_strategies', name: 'Investment Strategies for Growth' },
  { id: 'fintech_innovations', name: 'Fintech Innovations & Disruption' },
  { id: 'personal_finance', name: 'Personal Finance & Wealth Management' },
  { id: 'economic_outlook', name: 'Economic Outlook & Predictions' },
  { id: 'risk_management', name: 'Financial Risk Management' },
  { id: 'regulatory_changes', name: 'Navigating Regulatory Changes' },
];

// AI Character names
const AI_HOST_NAME = "Alex (AI Host)";
const AI_EXPERT_NAME = "Morgan (AI Expert)";

const PodcastScriptGenerator = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>('interview');
  const [numSpeakers, setNumSpeakers] = useState<string>('2');
  const [duration, setDuration] = useState<string>('2'); 
  const [voiceStyle, setVoiceStyle] = useState<string>('professional');
  const [focusAreaId, setFocusAreaId] = useState<string>(financeFocusAreas[0].id);
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);

  const [isCreatingVideo, setIsCreatingVideo] = useState<boolean>(false);
  const [heygenVideoId, setHeygenVideoId] = useState<string | null>(null);
  const [heygenError, setHeygenError] = useState<string | null>(null);
  const [heygenRawApiResponse, setHeygenRawApiResponse] = useState<any>(null);

  // States for AI script refinement
  const [aiEditPrompt, setAiEditPrompt] = useState<string>('');
  const [isRefiningWithAI, setIsRefiningWithAI] = useState<boolean>(false);
  const [refinementError, setRefinementError] = useState<string | null>(null);

  const handleFormatSelect = (formatId: string) => {
    setSelectedFormat(formatId);
    setGeneratedScript(null);
    setHeygenVideoId(null);
    setHeygenError(null);
    setHeygenRawApiResponse(null);
    setAiEditPrompt('');
    setRefinementError(null);
    if (formatId === 'interview') setNumSpeakers('2'); 
    else if (formatId === 'explainer') setNumSpeakers('1');
  };

  const getFinanceQuestionsAndAnswers = (topicId: string, segmentNum: number, voice: string): {q: string, a: string} => {
    let question = '';
    let answer = '';
    const focusName = financeFocusAreas.find(f => f.id === topicId)?.name || 'this financial topic';

    switch (topicId) {
      case 'market_trends':
        question = `**${AI_HOST_NAME}:** (${voice}) Turning to market trends, ${AI_EXPERT_NAME}, what\'s one major shift you\'re observing in the financial markets, say for segment ${segmentNum}?`;
        answer = `**${AI_EXPERT_NAME}:** (${voice}) ${AI_HOST_NAME}, a key trend is the increasing integration of AI in financial analysis. This is driving more predictive modeling and has implications for algorithmic trading strategies.`;
        if (segmentNum % 2 === 0) { // Add variation
            question = `**${AI_HOST_NAME}:** (${voice}) And how does geopolitical uncertainty currently factor into overall market stability, ${AI_EXPERT_NAME}?`;
            answer = `**${AI_EXPERT_NAME}:** (${voice}) Geopolitical factors are creating pockets of volatility, particularly in energy and supply chains, which savvy investors are watching closely for risk and opportunity.`;
        }
        break;
      case 'investment_strategies':
        question = `**${AI_HOST_NAME}:** (${voice}) For our viewers seeking growth, ${AI_EXPERT_NAME}, what\'s a core investment principle you\'d highlight for navigating today\'s ${focusName.toLowerCase()} (part ${segmentNum})?`;
        answer = `**${AI_EXPERT_NAME}:** (${voice}) ${AI_HOST_NAME}, emphasizing long-term value investing and diversification remains paramount. We advise looking beyond short-term noise towards companies with strong fundamentals and sustainable growth models.`;
        if (segmentNum % 2 === 0) {
            question = `**${AI_HOST_NAME}:** (${voice}) What role do alternative investments, like private equity or real assets, play in a diversified growth strategy today, ${AI_EXPERT_NAME}?`;
            answer = `**${AI_EXPERT_NAME}:** (${voice}) Alternatives can offer non-correlated returns and inflation hedging, ${AI_HOST_NAME}. However, they require thorough due diligence due to their complexity and liquidity profiles.`;
        }
        break;
      case 'fintech_innovations':
        question = `**${AI_HOST_NAME}:** (${voice}) The fintech landscape is buzzing. ${AI_EXPERT_NAME}, which specific innovation in ${focusName.toLowerCase()} do you see having the most impact this year (segment ${segmentNum})?`;
        answer = `**${AI_EXPERT_NAME}:** (${voice}) ${AI_HOST_NAME}, embedded finance solutions are becoming transformative, seamlessly integrating financial services into non-financial platforms, enhancing user experience and opening new revenue streams.`;
        if (segmentNum % 2 === 0) {
            question = `**${AI_HOST_NAME}:** (${voice}) With the rise of digital currencies and CBDCs, how do you see the payment processing sector evolving, ${AI_EXPERT_NAME}?`;
            answer = `**${AI_EXPERT_NAME}:** (${voice}) We\'re seeing a push for faster, cheaper, and more transparent payment rails, ${AI_HOST_NAME}. Blockchain technology and real-time payment networks are at the forefront of this evolution.`;
        }
        break;
      case 'personal_finance':
        question = `**${AI_HOST_NAME}:** (${voice}) For personal wealth building, ${AI_EXPERT_NAME}, what\'s one actionable tip for effective ${focusName.toLowerCase()} in the current economic environment (part ${segmentNum})?`;
        answer = `**${AI_EXPERT_NAME}:** (${voice}) ${AI_HOST_NAME}, establishing a clear emergency fund covering 3-6 months of expenses is more critical than ever. This provides a safety net against unexpected financial shocks.`;
        if (segmentNum % 2 === 0) {
            question = `**${AI_HOST_NAME}:** (${voice}) How important is financial literacy and continuous learning for individuals managing their own personal finance today, ${AI_EXPERT_NAME}?`;
            answer = `**${AI_EXPERT_NAME}:** (${voice}) It\'s absolutely fundamental, ${AI_HOST_NAME}. The financial world is complex and ever-changing; ongoing education empowers individuals to make informed decisions and avoid common pitfalls.`;
        }
        break;
      case 'economic_outlook':
        question = `**${AI_HOST_NAME}:** (${voice}) ${AI_EXPERT_NAME}, regarding the ${focusName.toLowerCase()} (segment ${segmentNum}), what key economic indicator are you watching most closely right now?`;
        answer = `**${AI_EXPERT_NAME}:** (${voice}) ${AI_HOST_NAME}, inflation rates and central bank responses are critical. These directly influence borrowing costs, investment returns, and overall consumer sentiment.`;
         if (segmentNum % 2 === 0) {
            question = `**${AI_HOST_NAME}:** (${voice}) What is your perspective on the global growth forecast for the next 12-18 months, ${AI_EXPERT_NAME}?`;
            answer = `**${AI_EXPERT_NAME}:** (${voice}) We anticipate a period of moderated growth globally, ${AI_HOST_NAME}, with regional variations. Resilience in labor markets will be key to watch.`;
        }
        break;
      case 'risk_management':
        question = `**${AI_HOST_NAME}:** (${voice}) In terms of ${focusName.toLowerCase()} (segment ${segmentNum}), ${AI_EXPERT_NAME}, what\'s a common oversight businesses or individuals make?`;
        answer = `**${AI_EXPERT_NAME}:** (${voice}) A common oversight, ${AI_HOST_NAME}, is underestimating liquidity risk – the ability to meet short-term obligations. Stress testing cash flows is vital.`;
        if (segmentNum % 2 === 0) {
            question = `**${AI_HOST_NAME}:** (${voice}) How can technology be leveraged more effectively for financial risk management today, ${AI_EXPERT_NAME}?`;
            answer = `**${AI_EXPERT_NAME}:** (${voice}) AI and machine learning are enhancing predictive risk modeling, ${AI_HOST_NAME}, allowing for earlier identification of potential threats and more dynamic hedging strategies.`;
        }
        break;
      case 'regulatory_changes':
        question = `**${AI_HOST_NAME}:** (${voice}) ${focusName} can be challenging. ${AI_EXPERT_NAME}, what\'s a key area of regulatory focus financial institutions should be preparing for (segment ${segmentNum})?`;
        answer = `**${AI_EXPERT_NAME}:** (${voice}) Increased scrutiny on data privacy and cybersecurity is a major trend, ${AI_HOST_NAME}. Institutions need robust frameworks to protect customer data and comply with evolving rules like GDPR or CCPA.`;
        if (segmentNum % 2 === 0) {
            question = `**${AI_HOST_NAME}:** (${voice}) How do you advise firms to stay agile in such a dynamic regulatory environment, ${AI_EXPERT_NAME}?`;
            answer = `**${AI_EXPERT_NAME}:** (${voice}) Proactive monitoring, investing in RegTech solutions, and fostering a strong compliance culture are essential for agility, ${AI_HOST_NAME}.`;
        }
        break;
      default:
        question = `**${AI_HOST_NAME}:** (${voice}) Discussing ${focusName} (segment ${segmentNum}), ${AI_EXPERT_NAME}, what\'s an important point for our audience?`;
        answer = `**${AI_EXPERT_NAME}:** (${voice}) An important point is that ${focusName.toLowerCase()} requires continuous attention and adaptation to current market conditions.`;
    }
    return { q: question, a: answer };
  };

  const handleGenerateScript = async () => {
    if (isGeneratingScript) return;
    setIsGeneratingScript(true);
    setGeneratedScript(null);
    setHeygenVideoId(null);
    setHeygenError(null);
    setHeygenRawApiResponse(null);
    setAiEditPrompt('');
    setRefinementError(null);

    const currentFocusArea = financeFocusAreas.find(f => f.id === focusAreaId);
    const focusAreaName = currentFocusArea?.name || 'Selected Finance Topic';

    console.log('Generating script with settings:', {
      format: selectedFormat,
      speakers: numSpeakers,
      duration: `${duration} minutes`,
      style: voiceStyle,
      focus: focusAreaName,
    });

    await new Promise(resolve => setTimeout(resolve, 300)); 

    const formatDetails = contentFormats.find(f => f.id === selectedFormat);
    const speakerCount = parseInt(numSpeakers);
    const targetDuration = parseInt(duration);

    let script = `**Video Title Suggestion:** ${focusAreaName} - AI Financial Insights (${formatDetails?.name || 'Video'})**\n\n`;
    script += `**Format:** ${formatDetails?.name || selectedFormat}\n`;
    script += `**AI Speakers:** ${AI_HOST_NAME} & ${AI_EXPERT_NAME}\n`;
    script += `**Approx. Duration:** ${targetDuration} minutes\n`;
    script += `**Voice Style:** ${voiceStyle}\n`;
    script += `**Topic:** ${focusAreaName}\n\n`;
    script += `--- SCRIPT START ---\n\n`;

    if (selectedFormat === 'interview') {
      script += `**(Intro Music & Visuals - e.g., Title Card: ${focusAreaName} with ${AI_HOST_NAME} & ${AI_EXPERT_NAME})**\n\n`;
      script += `**${AI_HOST_NAME}:** (${voiceStyle}) Welcome to AI Financial Insights! I'm ${AI_HOST_NAME}, and today we're exploring ${focusAreaName}. Joining me is ${AI_EXPERT_NAME}, our AI financial expert.\n\n`;
      script += `**${AI_EXPERT_NAME}:** (${voiceStyle}) A pleasure to be here, ${AI_HOST_NAME}. ${focusAreaName} is a fascinating and vital topic.\n\n`;
      
      const numSegments = Math.max(1, Math.ceil(targetDuration * 1.5)); 

      for (let i = 1; i <= numSegments; i++) {
        const qa = getFinanceQuestionsAndAnswers(focusAreaId, i, voiceStyle);
        script += qa.q + '\n';
        script += qa.a + '\n';
      }

      script += `**${AI_HOST_NAME}:** (${voiceStyle}) That\'s incredibly insightful, ${AI_EXPERT_NAME}. Before we conclude, what is one key action or thought you\'d like our viewers to take away concerning ${focusAreaName}?\n\n`;
      script += `**${AI_EXPERT_NAME}:** (${voiceStyle}) Certainly, ${AI_HOST_NAME}. The most crucial takeaway is to stay informed and be proactive. Financial landscapes are dynamic, and continuous learning is key to navigating them successfully.\n\n`;
      script += `**${AI_HOST_NAME}:** (${voiceStyle}) Excellent advice, ${AI_EXPERT_NAME}. Thank you for sharing your expertise. And thank you to our audience for tuning into AI Financial Insights! (Outro music & call to action/logo)\n`;
    
    } else if (selectedFormat === 'explainer') {
        script += `**(Intro Music & Visuals - e.g., Title Card: Understanding ${focusAreaName})**\n\n`;
        script += `**${AI_HOST_NAME}:** (${voiceStyle}) Hello! I'm ${AI_HOST_NAME}, and today we're breaking down ${focusAreaName} in this short explainer.\n\n`;
        script += `**${AI_HOST_NAME}:** (${voiceStyle}) So, what exactly is ${focusAreaName.toLowerCase()}? In simple terms, it refers to the general direction in which prices or other data related to financial markets are moving, when discussing Market Trends, or the strategic allocation of capital to assets with the expectation of generating income or appreciation for Investment Strategies.\n\n`;
        script += `**${AI_HOST_NAME}:** (${voiceStyle}) Understanding ${focusAreaName.toLowerCase()} is vital because it helps you identify investment opportunities and manage risks effectively, or achieve long-term financial goals by selecting appropriate assets when focusing on Investment Strategies.\n\n`;
        const numPoints = Math.max(1, targetDuration * 2); 
        for(let i=1; i<= numPoints; i++) {
            script += `**${AI_HOST_NAME}:** (${voiceStyle}) Another key aspect of ${focusAreaName.toLowerCase()} (Point ${i}) is considering the impact of macroeconomic indicators like interest rates on stock valuations, or the importance of asset allocation in portfolio construction for Investment Strategies. Always consider this in your financial planning.\n\n`;
        }
        script += `**${AI_HOST_NAME}:** (${voiceStyle}) To summarize ${focusAreaName.toLowerCase()}: it involves analyzing market data to forecast future movements or building a diversified portfolio aligned with your risk tolerance and objectives for Investment Strategies. Keep learning and stay ahead! (Outro music & call to action/logo)\n`;
    
    } else { // Generic fallback for 'discussion'
      script += `**(Intro Music & Visuals)**\n\n`;
      script += `**${AI_HOST_NAME}:** Welcome to our AI panel on ${focusAreaName}. I'm ${AI_HOST_NAME}.\n`;
      const otherSpeakers = Array.from({length: speakerCount -1}, (_, i) => `AI Analyst ${String.fromCharCode(65 + i)}`); // AI Analyst A, B
      otherSpeakers.forEach(sp => {
        script += `**${sp}:** Thanks for having me. My initial take on ${focusAreaName.toLowerCase()} is that it\'s currently influenced by [generic factor].\n\n`;
      });
      script += `**(Main discussion points with each AI Analyst contributing for the duration...)**\n\n`;
      script += `**${AI_HOST_NAME}:** Final thoughts from our AI panel? (Outro music)\n`;
    }
    script += `\n--- SCRIPT END ---`;

    setGeneratedScript(script);
    setIsGeneratingScript(false);
  };

  const handleCreateHeygenVideo = async () => {
    if (!generatedScript || isCreatingVideo) return;
    setIsCreatingVideo(true);
    setHeygenError(null);
    setHeygenVideoId(null);
    setHeygenRawApiResponse(null);
    try {
      const response = await fetch('/api/create-heygen-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: generatedScript }),
      });
      const data = await response.json();
      setHeygenRawApiResponse(data);
      if (!response.ok) throw new Error(data.error || `API request failed: ${response.status}`);
      if (data.videoId) setHeygenVideoId(data.videoId);
      else setHeygenError(data.message || 'Video ID not in response.');
    } catch (err: any) {
      setHeygenError(err.message || 'Failed to create video.');
    } finally {
      setIsCreatingVideo(false);
    }
  };

  const handleRefineScriptWithAI = async () => {
    if (!generatedScript || !aiEditPrompt || isRefiningWithAI) return;
    setIsRefiningWithAI(true);
    setRefinementError(null);

    console.log("Client: Starting script refinement with prompt:", aiEditPrompt);
    
    try {
      const requestBody = { currentScript: generatedScript, userPrompt: aiEditPrompt };
      console.log("Client: Sending request to /api/refine-script:", { promptLength: aiEditPrompt.length, scriptLength: generatedScript.length });
      
      const response = await fetch('/api/refine-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log("Client: Received response status:", response.status);
      const data = await response.json();
      console.log("Client: Response data:", { 
        success: data.success,
        status: data.refinementStatus, 
        messageLength: data.refinementMessage?.length,
        hasRefinedScript: !!data.refinedScript,
        refinedScriptLength: data.refinedScript?.length || 0,
        debug: data.debug
      });

      if (!response.ok || data.success === false) {
        const errorMessage = data.error || data.refinementMessage || `API request failed: ${response.status}`;
        throw new Error(errorMessage);
      }

      if (data.refinedScript) {
        setGeneratedScript(data.refinedScript);
        setAiEditPrompt(''); // Clear prompt after successful refinement
        
        // Display toast based on refinementStatus
        if (data.refinementStatus === 'success') {
          toast.success(data.refinementMessage || 'Script refined successfully with Replicate!');
        } else if (data.refinementStatus === 'simulation_fallback') {
          // Show more detailed error message if available
          const debugInfo = data.debug || {};
          const errorDetail = debugInfo.replicateErrorMessage || debugInfo.llamaErrorMessage || debugInfo.outerErrorMessage || '';
          
          toast.warning(
            <>
              <div>{data.refinementMessage || 'Using simulation mode - AI service unavailable'}</div>
              {errorDetail && (
                <div className="mt-2 text-xs opacity-80 font-mono break-all">
                  Error: {errorDetail}
                </div>
              )}
            </>
          );
        } else if (data.refinementStatus === 'error_connection') {
          toast.error(data.refinementMessage || 'Could not connect to AI service. Using simulation.');
        } else {
          toast.info(data.refinementMessage || 'Script refined (status unknown).'); 
        }
      } else {
        throw new Error('Refined script not found in API response.');
      }
    } catch (err: any) {
      console.error('Error refining script with AI:', err);
      const generalErrorMessage = err.message || 'Failed to refine script.';
      setRefinementError(generalErrorMessage);
      toast.error(`Refinement Error: ${generalErrorMessage}`);
    } finally {
      setIsRefiningWithAI(false);
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gray-800/50 rounded-lg border border-gray-700/80 shadow-sm">
      <div> 
        <h3 className="text-lg font-semibold text-gray-100 mb-4">1. Select Video Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contentFormats.map((format) => {
            const isSelected = selectedFormat === format.id;
            return (
              <div
                key={format.id}
                className={`group rounded-lg border p-4 cursor-pointer transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 
                  ${isSelected ? 'border-blue-500 bg-blue-900/40 shadow-md' : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700/70'}`}
                onClick={() => handleFormatSelect(format.id)}
                role="radio" aria-checked={isSelected} tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFormatSelect(format.id); } }}
              >
                <h4 className={`font-semibold mb-1 ${isSelected ? 'text-white' : 'text-gray-200 group-hover:text-white'}`}>{format.name}</h4>
                <p className={`text-sm ${isSelected ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-300'}`}>{format.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 md:mt-8">
        <h3 className="text-lg font-semibold text-gray-100 mb-5">2. Configure Video Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
          <div>
            <label htmlFor="focusArea" className="block text-sm font-medium text-gray-300 mb-1.5">Financial Focus Area</label>
            <select 
              id="focusArea"
              name="focusArea"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              value={focusAreaId}
              onChange={(e) => setFocusAreaId(e.target.value)}
            >
              {financeFocusAreas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="numSpeakers" className="block text-sm font-medium text-gray-300 mb-1.5">Number of Speakers</label>
            <select 
              id="numSpeakers"
              name="numSpeakers"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              value={numSpeakers}
              onChange={(e) => setNumSpeakers(e.target.value)}
              disabled={selectedFormat === 'interview' || selectedFormat === 'explainer'} 
            >
              <option value="1">1 AI Speaker</option>
              <option value="2">2 AI Speakers</option>
            </select>
             { (selectedFormat === 'interview') && <p className="text-xs text-gray-400 mt-1">Interview uses {AI_HOST_NAME} & {AI_EXPERT_NAME}.</p> }
             { (selectedFormat === 'explainer') && <p className="text-xs text-gray-400 mt-1">Explainer video uses {AI_HOST_NAME}.</p> }
          </div>
          
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1.5">Approx. Video Duration</label>
            <select 
              id="duration"
              name="duration"
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1">1 minute</option>
              <option value="2">2 minutes</option>
              <option value="3">3 minutes</option>
              {selectedFormat !== 'explainer' && <option value="5">5 minutes (Interview/Discussion)</option>}
            </select>
          </div>
          
          <div>
            <label htmlFor="voiceStyle" className="block text-sm font-medium text-gray-300 mb-1.5">Voice Style</label>
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
              <option value="friendly">Friendly & Engaging</option>
               <option value="authoritative">Authoritative</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-4 mt-8">
        <Button
          onClick={handleGenerateScript}
          disabled={isGeneratingScript || isCreatingVideo || isRefiningWithAI}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors duration-150 ease-in-out shadow-sm hover:shadow-md text-base font-medium"
        >
          {isGeneratingScript ? 'Generating Complete AI Script...' : 'Generate Complete AI Script'}
        </Button>
          </div>
          
      {generatedScript && (
        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">3. Review & Edit AI Script:</h3>
            <Textarea
              value={generatedScript}
              onChange={(e) => setGeneratedScript(e.target.value)}
              className="min-h-[200px] md:min-h-[300px] bg-gray-900/80 border-gray-700 text-gray-200 text-sm font-mono leading-relaxed focus:border-blue-500 focus:ring-blue-500"
              placeholder="Your generated script will appear here..."
              aria-label="Editable generated script"
              id="generatedScript"
              name="generatedScript"
            />
        </div>
        
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">4. Refine Script with AI:</h3>
            <div className="space-y-3">
              <Textarea
                value={aiEditPrompt}
                onChange={(e) => setAiEditPrompt(e.target.value)}
                placeholder="Enter a prompt to refine the script above (e.g., 'Make Alex sound more enthusiastic', 'Add a point about cryptocurrency risks')"
                className="min-h-[60px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
                aria-label="AI script refinement prompt"
                id="aiEditPrompt"
                name="aiEditPrompt"
              />
          <Button
                onClick={handleRefineScriptWithAI}
                disabled={!aiEditPrompt || isRefiningWithAI || isGeneratingScript}
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60"
              >
                {isRefiningWithAI ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Refining...
              </>
            ) : (
                  'Refine with AI Prompt'
            )}
          </Button>
              {refinementError && <p className="text-sm text-red-400 mt-2">Last attempt error: {refinementError}</p>}
              <p className="text-xs text-gray-400 mt-1">Powered by Replicate AI (Llama 3). Make sure your REPLICATE_API_KEY is set in .env.local</p>
            </div>
          </div>

          {selectedFormat === 'interview' && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleCreateHeygenVideo}
                disabled={isCreatingVideo || isGeneratingScript || isRefiningWithAI}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
                title={`Send script to Heygen for video creation using ${AI_HOST_NAME} & ${AI_EXPERT_NAME}`}
              >
                {isCreatingVideo ? 'Creating Heygen Video...' : 'Create Heygen Interview Video'}
              </Button>
            </div>
          )}
        </div>
      )}

      {(heygenVideoId || heygenError || heygenRawApiResponse) && (
        <div className="mt-8 p-4 bg-gray-800 border border-gray-700 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Heygen Video Status:</h3>
          {isCreatingVideo && <p className="text-blue-300">Processing...</p>}
          {heygenError && <p className="text-red-400">Error: {heygenError}</p>}
          {heygenVideoId && (
            <div className="text-green-300">
              <p>Video creation started! Video ID: <span className="font-mono">{heygenVideoId}</span></p>
              <p className="mt-2 text-sm text-gray-400">Check Heygen dashboard for status. Polling for completion is not yet implemented.</p>
              <a href="https://app.heygen.com/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-blue-400 hover:text-blue-300 underline">
                Go to Heygen Dashboard
              </a>
            </div>
          )}
          {heygenRawApiResponse && (
            <div className="mt-4">
              <h4 className="text-md font-semibold text-gray-200 mb-2">Raw API Response (Debug):</h4>
              <pre className="text-xs text-gray-400 bg-gray-900 p-3 rounded-md whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(heygenRawApiResponse, null, 2)}
              </pre>
            </div>
          )}
          </div>
        )}
    </div>
  );
};

export default PodcastScriptGenerator;
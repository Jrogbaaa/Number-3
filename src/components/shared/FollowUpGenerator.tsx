'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Copy, CheckCircle, RotateCcw, Sparkles, Clock, Calendar } from 'lucide-react';
import type { Lead } from '@/types/lead';
import { useSession } from 'next-auth/react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// User business info interface
interface UserBusinessInfo {
  companyName?: string;
  companyIndustry?: string;
  companyProduct?: string;
  targetRoles?: string[];
  targetIndustries?: string[];
}

// Follow-up timing strategies
const FOLLOW_UP_STRATEGIES = [
  {
    id: 'first-follow-up',
    name: 'First Follow-up (3-5 days)',
    description: 'Gentle reminder with additional value',
    timing: '3-5 days after initial outreach'
  },
  {
    id: 'second-follow-up',
    name: 'Second Follow-up (1-2 weeks)',
    description: 'Different angle or case study',
    timing: '1-2 weeks after first follow-up'
  },
  {
    id: 'final-follow-up',
    name: 'Final Follow-up (3-4 weeks)',
    description: 'Last attempt with breakup message',
    timing: '3-4 weeks after second follow-up'
  },
  {
    id: 'value-add',
    name: 'Value-Add Follow-up',
    description: 'Share relevant content or insights',
    timing: 'Anytime with valuable content'
  },
  {
    id: 'event-based',
    name: 'Event-Based Follow-up',
    description: 'Reference recent company news or events',
    timing: 'After relevant company/industry events'
  }
];

// Example prompts for follow-ups
const FOLLOW_UP_PROMPTS = [
  "Make it more conversational and friendly",
  "Add urgency with a limited-time offer",
  "Include a relevant case study or success story",
  "Reference recent industry trends or news",
  "Make it shorter and more direct",
  "Add a specific call-to-action with calendar link",
  "Include social proof from similar companies",
  "Make it sound more personal and warm",
  "Add a breakup message (final attempt)",
  "Focus on providing value without asking for anything"
];

interface FollowUpGeneratorProps {
  leads: Lead[];
  selectedLeadId?: string;
  onMessageGenerated?: (message: string, leadId: string, followUpType: string) => void;
}

const FollowUpGenerator: React.FC<FollowUpGeneratorProps> = ({ 
  leads, 
  selectedLeadId,
  onMessageGenerated 
}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [baseMessage, setBaseMessage] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Make it more conversational and friendly');
  const [promptValue, setPromptValue] = useState('Make it more conversational and friendly');
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(
    leads.find(lead => lead.id === selectedLeadId)
  );
  const [selectedStrategy, setSelectedStrategy] = useState<string>('first-follow-up');
  const [copied, setCopied] = useState(false);
  const [generateAttempts, setGenerateAttempts] = useState(0);
  const [userBusinessInfo, setUserBusinessInfo] = useState<UserBusinessInfo | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);

  // Fetch user business information
  useEffect(() => {
    const fetchUserBusinessInfo = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/user-preferences');
        if (response.ok) {
          const data = await response.json();
          setUserBusinessInfo({
            companyName: data.companyName,
            companyIndustry: data.companyIndustry, 
            companyProduct: data.companyProduct,
            targetRoles: data.targetRoles || [],
            targetIndustries: data.targetIndustries || [],
          });
          console.log('[FollowUpGenerator] Loaded user business info:', {
            companyName: data.companyName,
            companyIndustry: data.companyIndustry,
            companyProduct: data.companyProduct?.substring(0, 50) + (data.companyProduct?.length > 50 ? '...' : ''),
          });
        } else {
          console.error('[FollowUpGenerator] Failed to fetch user preferences:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[FollowUpGenerator] Error fetching user business info:', error);
      }
    };

    fetchUserBusinessInfo();
  }, [session?.user?.id]);

  // Update selected lead when selectedLeadId changes
  useEffect(() => {
    if (selectedLeadId) {
      const lead = leads.find(lead => lead.id === selectedLeadId);
      setSelectedLead(lead);
      
      if (lead && (!message || baseMessage === '')) { 
        generateFollowUpMessage(lead, selectedStrategy);
      }
    } else {
      setSelectedLead(undefined);
      setMessage('');
      setBaseMessage('');
    }
  }, [selectedLeadId, leads, baseMessage, selectedStrategy]);

  // Generate follow-up message based on strategy
  const generateFollowUpMessage = (lead: Lead, strategy: string) => {
    const firstName = lead.name.split(' ')[0];
    const companyName = lead.company || 'your company';
    const leadTitle = lead.title || 'your role';
    
    // Use user's business information if available
    const senderCompany = userBusinessInfo?.companyName || '[Your Company]';
    const senderProduct = userBusinessInfo?.companyProduct || 'our solutions';
    const senderIndustry = userBusinessInfo?.companyIndustry || '';
    
    console.log('[FollowUpGenerator] Generating follow-up message with business info:', {
      senderCompany,
      senderProduct: senderProduct.substring(0, 50) + (senderProduct.length > 50 ? '...' : ''),
      strategy,
      hasBusinessInfo: !!userBusinessInfo
    });
    
    // Create signature with user's actual name and company name
    const userName = session?.user?.name || 'Your Name';
    const hasValidCompanyName = userBusinessInfo?.companyName && 
                               userBusinessInfo.companyName.trim() !== '' && 
                               userBusinessInfo.companyName !== '[Your Company]';
    
    // Only add company name to signature if it's not already prominently mentioned in the message
    const shouldAddCompanyToSignature = hasValidCompanyName && 
                                      senderCompany !== '[Your Company]' &&
                                      senderCompany !== senderProduct; // Avoid duplication if company name is the product
    
    const signature = shouldAddCompanyToSignature ? userBusinessInfo.companyName : '';

    let followUpTemplate = '';

    switch (strategy) {
      case 'first-follow-up':
        followUpTemplate = `Hi ${firstName},

I wanted to follow up on my previous message about ${senderProduct} and how it could benefit ${companyName}.

I understand you're probably busy, but I thought you might be interested in a quick case study: we recently helped a similar company in ${senderIndustry || 'your industry'} increase their efficiency by 40% in just 3 months.

Would you be open to a brief 15-minute call this week to discuss how this might apply to your situation at ${companyName}?

Best regards,
${userName}${signature ? `\n${signature}` : ''}`;
        break;

      case 'second-follow-up':
        followUpTemplate = `Hi ${firstName},

I hope you're doing well! I sent a couple of messages about ${senderProduct} and wanted to try a different approach.

Instead of talking about what we do, I'd love to learn more about the challenges you're facing at ${companyName} as ${leadTitle}. What's the biggest obstacle you're dealing with right now in your role?

Sometimes a fresh perspective can help, and I'd be happy to share some insights from working with other ${leadTitle}s in similar situations.

No sales pitch - just a genuine conversation about your challenges and potential solutions.

Would you be interested in a quick 10-minute chat?

Cheers,
${userName}${signature ? `\n${signature}` : ''}`;
        break;

      case 'final-follow-up':
        followUpTemplate = `Hi ${firstName},

I've reached out a couple of times about ${senderProduct} and how it might help ${companyName}, but I haven't heard back from you.

I completely understand - your inbox is probably overflowing, and my messages might not be hitting the mark for your current priorities.

This will be my last message on this topic. If ${senderProduct} isn't relevant for ${companyName} right now, no worries at all.

But if you think there might be value in a quick conversation down the road, feel free to reach out anytime. I'll be here.

Wishing you all the best with your initiatives at ${companyName}.

Best regards,
${userName}${signature ? `\n${signature}` : ''}`;
        break;

      case 'value-add':
        followUpTemplate = `Hi ${firstName},

I came across this article about trends in ${senderIndustry || 'your industry'} and thought you might find it interesting given your role as ${leadTitle} at ${companyName}.

[Article/Resource Link]

The section about [specific insight] particularly reminded me of our previous conversation about ${senderProduct}. Companies like ${companyName} are often dealing with exactly these challenges.

No agenda here - just thought you'd appreciate the insights. But if you'd like to discuss how these trends might impact ${companyName}, I'm always happy to chat.

Hope this is helpful!

Best,
${userName}${signature ? `\n${signature}` : ''}`;
        break;

      case 'event-based':
        followUpTemplate = `Hi ${firstName},

I saw the recent news about ${companyName} [mention specific event/news]. Congratulations on [specific achievement/milestone]!

This actually makes me think our conversation about ${senderProduct} might be even more timely now. With ${companyName}'s growth and recent developments, the challenges we discussed around [relevant area] are probably becoming even more important to address.

Would you be interested in a quick call to discuss how ${senderProduct} could support ${companyName}'s continued success?

Looking forward to hearing from you.

Best regards,
${userName}${signature ? `\n${signature}` : ''}`;
        break;

      default:
        followUpTemplate = `Hi ${firstName},

I wanted to follow up on my previous message about ${senderProduct}.

I'd love to learn more about your current challenges at ${companyName} and see if there's a way we can help.

Would you be open to a brief conversation?

Best regards,
${userName}${signature ? `\n${signature}` : ''}`;
    }

    console.log('[FollowUpGenerator] Generated follow-up message length:', followUpTemplate.length);
    setBaseMessage(followUpTemplate);
    setMessage(followUpTemplate);
    
    return followUpTemplate;
  };

  // Handle lead selection change
  const handleLeadChange = (leadId: string) => {
    const lead = leads.find(lead => lead.id === leadId);
    setSelectedLead(lead);
    if (lead) {
      generateFollowUpMessage(lead, selectedStrategy);
    }
  };

  // Handle strategy change
  const handleStrategyChange = (strategy: string) => {
    setSelectedStrategy(strategy);
    if (selectedLead) {
      generateFollowUpMessage(selectedLead, strategy);
    }
  };

  // Handle example prompt selection
  const handlePromptSelect = (prompt: string) => {
    setCustomPrompt(prompt);
    setPromptValue(prompt);
    
    if (selectedLead) {
      setTimeout(() => applyCustomPrompt(prompt), 50);
    }
  };

  // Handle keyboard events in the prompt input
  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && customPrompt.trim() && !loading && selectedLead) {
      e.preventDefault();
      applyCustomPrompt();
    }
  };

  // Apply custom prompt to modify follow-up message
  const applyCustomPrompt = async (promptOverride?: string) => {
    const promptToUse = promptOverride || customPrompt;
    
    if (!selectedLead || !promptToUse.trim()) {
      toast.error("Please select a lead and enter a prompt");
      return;
    }

    let currentBaseMessage = baseMessage;
    let currentMessage = message;
    
    if (!currentBaseMessage && !currentMessage && selectedLead) {
      const generatedMessage = generateFollowUpMessage(selectedLead, selectedStrategy);
      currentMessage = generatedMessage;
      currentBaseMessage = generatedMessage;
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const messageToSend = currentMessage || currentBaseMessage || baseMessage || message;
    
    if (!messageToSend || messageToSend.trim() === '') {
      console.error('No valid follow-up message to send:', {
        currentMessage,
        currentBaseMessage,
        baseMessage,
        message,
        selectedLead: selectedLead?.name
      });
      toast.error("Unable to generate base follow-up message. Please try refreshing the page.");
      return;
    }

    setLoading(true);
    console.log(`Sending follow-up message customization request with prompt: "${promptToUse}"`);

    try {
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          baseMessage: messageToSend,
          customPrompt: `${promptToUse} (This is a follow-up message, so reference the previous outreach appropriately)`, 
          lead: selectedLead 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.message) {
        if (data.message === message && generateAttempts < 1) {
          console.log("Follow-up message didn't change, trying again with original template");
          setGenerateAttempts(prev => prev + 1);
          
          const retryResponse = await fetch('/api/generate-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              baseMessage: currentBaseMessage || messageToSend,
              customPrompt: `${promptToUse} (This is a follow-up message)`, 
              lead: selectedLead 
            })
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            if (retryData.success && retryData.message) {
              setMessage(retryData.message);
              
              if (onMessageGenerated) {
                onMessageGenerated(retryData.message, selectedLead.id, selectedStrategy);
              }
              
              toast.success("Follow-up message updated with your prompt!");
            }
          }
        } else {
          setMessage(data.message);
          setGenerateAttempts(0);
          
          if (onMessageGenerated) {
            onMessageGenerated(data.message, selectedLead.id, selectedStrategy);
          }
          
          toast.success("Follow-up message updated with your prompt!");
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error('Error generating follow-up message:', error);
      toast.error(`Failed to generate follow-up message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setPromptValue('');
      setCustomPrompt('');
      
      if (promptInputRef.current) {
        promptInputRef.current.focus();
      }
    }
  };

  const resetMessage = () => {
    if (selectedLead) {
      generateFollowUpMessage(selectedLead, selectedStrategy);
      toast.info("Follow-up message reset to default template");
    }
  };

  const copyToClipboard = () => {
    if (textareaRef.current) {
      navigator.clipboard.writeText(textareaRef.current.value)
        .then(() => {
          setCopied(true);
          toast.success("Follow-up message copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast.error("Failed to copy");
        });
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-5">
        <MessageSquare className="h-5 w-5 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Follow-up Message Generator</h2>
      </div>

      <div className="space-y-4">
        {/* Lead selector */}
        <div>
          <Label htmlFor="follow-up-lead-select" className="text-sm text-gray-400">Select Lead</Label>
          <Select 
            value={selectedLead?.id || ''} 
            onValueChange={handleLeadChange}
          >
            <SelectTrigger id="follow-up-lead-select" className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select a lead for follow-up" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {leads.map(lead => (
                <SelectItem key={lead.id} value={lead.id} className="text-white">
                  {lead.name} {lead.company ? `(${lead.company})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Follow-up strategy selector */}
        <div>
          <Label htmlFor="strategy-select" className="text-sm text-gray-400">Follow-up Strategy</Label>
          <Select 
            value={selectedStrategy} 
            onValueChange={handleStrategyChange}
          >
            <SelectTrigger id="strategy-select" className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select follow-up strategy" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {FOLLOW_UP_STRATEGIES.map(strategy => (
                <SelectItem key={strategy.id} value={strategy.id} className="text-white">
                  <div className="flex flex-col">
                    <span>{strategy.name}</span>
                    <span className="text-xs text-gray-400">{strategy.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedStrategy && (
            <div className="mt-2 p-3 bg-gray-800/50 rounded-md border border-gray-700">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-orange-400" />
                <span className="text-gray-300">
                  {FOLLOW_UP_STRATEGIES.find(s => s.id === selectedStrategy)?.timing}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {FOLLOW_UP_STRATEGIES.find(s => s.id === selectedStrategy)?.description}
              </p>
            </div>
          )}
        </div>

        {/* Message textarea */}
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="follow-up-message" className="text-sm text-gray-400">Follow-up Message</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-gray-400 hover:text-white flex items-center gap-1"
              onClick={resetMessage}
              title="Reset to original template"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>
          <Textarea 
            ref={textareaRef}
            id="follow-up-message" 
            name="follow-up-message"
            className="h-48 bg-gray-800 border-gray-700 resize-none"
            value={message}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
            disabled={loading}
          />
          <div className="flex justify-end mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex gap-1 text-xs"
              onClick={copyToClipboard}
            >
              {copied ? (
                <><CheckCircle className="h-3.5 w-3.5" /> Copied</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> Copy</>
              )}
            </Button>
          </div>
        </div>

        {/* Prompt input section */}
        <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
          <Label htmlFor="follow-up-prompt" className="flex items-center gap-1.5 text-sm text-orange-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Customize follow-up with AI prompt</span>
          </Label>
          
          <div className="flex gap-2 mb-3">
            <Input 
              ref={promptInputRef}
              id="follow-up-prompt"
              name="follow-up-prompt"
              className="bg-gray-900 border-gray-700"
              placeholder="Make it more personal, add urgency, include case study, etc."
              value={promptValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPromptValue(e.target.value);
                setCustomPrompt(e.target.value);
              }}
              onKeyDown={handlePromptKeyDown}
              disabled={loading || !selectedLead}
              aria-label="Custom prompt for follow-up message customization"
            />
            <Button 
              onClick={() => applyCustomPrompt()}
              disabled={loading || !customPrompt.trim() || !selectedLead}
              className="flex gap-1.5 min-w-24"
              aria-label={loading ? "Updating follow-up message" : "Apply prompt"}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Updating</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Apply</>
              )}
            </Button>
          </div>

          {/* Example prompts */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Try these follow-up prompts:</p>
            <div className="flex flex-wrap gap-2">
              {FOLLOW_UP_PROMPTS.slice(0, 5).map((prompt, index) => (
                <button
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300"
                  onClick={() => handlePromptSelect(prompt)}
                  disabled={loading}
                  tabIndex={0}
                  aria-label={`Apply example prompt: ${prompt}`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { FollowUpGenerator }; 
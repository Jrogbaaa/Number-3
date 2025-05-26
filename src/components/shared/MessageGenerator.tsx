'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Copy, CheckCircle, RotateCcw, Sparkles } from 'lucide-react';
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

// Example prompts to inspire users
const EXAMPLE_PROMPTS = [
  "Make it more conversational",
  "Shorten the message to a brief note",
  "Make it more professional",
  "Add specific industry expertise relevant to their role",
  "Make it funnier with industry-specific humor",
  "Make it sound more personal and warm",
  "Add urgency to the message",
  "Highlight our case studies with companies in their industry",
  "Focus on scheduling a quick 15-minute call",
  "Add relevant questions about their business challenges"
];

interface MessageGeneratorProps {
  leads: Lead[];
  selectedLeadId?: string;
  onMessageGenerated?: (message: string, leadId: string) => void;
}

const MessageGenerator: React.FC<MessageGeneratorProps> = ({ 
  leads, 
  selectedLeadId,
  onMessageGenerated 
}) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [baseMessage, setBaseMessage] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Add urgency to the message');
  const [promptValue, setPromptValue] = useState('Add urgency to the message');
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(
    leads.find(lead => lead.id === selectedLeadId)
  );
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
          console.log('[MessageGenerator] Loaded user business info:', {
            companyName: data.companyName,
            companyIndustry: data.companyIndustry,
            companyProduct: data.companyProduct?.substring(0, 50) + (data.companyProduct?.length > 50 ? '...' : ''),
            targetRoles: data.targetRoles,
            targetIndustries: data.targetIndustries,
            fullData: data
          });
        } else {
          console.error('[MessageGenerator] Failed to fetch user preferences:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[MessageGenerator] Error fetching user business info:', error);
      }
    };

    fetchUserBusinessInfo();
  }, [session?.user?.id]);

  // Update selected lead when selectedLeadId changes
  useEffect(() => {
    if (selectedLeadId) {
      const lead = leads.find(lead => lead.id === selectedLeadId);
      setSelectedLead(lead);
      
      // If there's a selected lead, generate an initial message
      // Ensure message isn't regenerated if it already exists from user edits or previous generation
      if (lead && (!message || baseMessage === '')) { 
        generateBaseMessage(lead);
        
        // Auto-apply the default prompt after a slight delay to ensure base message is set
        setTimeout(() => {
          if (customPrompt) {
            applyCustomPrompt(customPrompt);
          }
        }, 500);
      }
    } else {
      // Clear message and selected lead if no leadId is provided (e.g. lead deselected)
      setSelectedLead(undefined);
      setMessage('');
      setBaseMessage('');
    }
  // IMPORTANT: Removed 'message' from dependency array to prevent re-generating base message
  // when 'message' state is updated by user typing or API response.
  // We only want to generate a new base message if the lead changes OR if there's no baseMessage yet.
  }, [selectedLeadId, leads, baseMessage, customPrompt]); // Added baseMessage to deps

  // Generate a basic message template based on lead info
  const generateBaseMessage = (lead: Lead) => {
    const firstName = lead.name.split(' ')[0];
    const companyName = lead.company || 'your company';
    const leadTitle = lead.title || 'your role';
    
    // Use user's business information if available
    const senderCompany = userBusinessInfo?.companyName || '[Your Company]';
    const senderProduct = userBusinessInfo?.companyProduct || 'innovative solutions';
    const senderIndustry = userBusinessInfo?.companyIndustry || '';
    
    console.log('[MessageGenerator] Generating base message with business info:', {
      senderCompany,
      senderProduct: senderProduct.substring(0, 50) + (senderProduct.length > 50 ? '...' : ''),
      senderIndustry,
      hasBusinessInfo: !!userBusinessInfo
    });
    
    let openingInterest = '';
    if (lead.insights?.interests?.length && lead.insights.interests[0]) {
      openingInterest = `I saw you're interested in ${lead.insights.interests[0]} – that's pretty cool! `;
    } else if (lead.insights?.topics?.length && lead.insights.topics[0]) {
      openingInterest = `Noticed your focus on ${lead.insights.topics[0]}. `;
    }

    // Create industry connection if there's a match
    let industryConnection = '';
    if (senderIndustry && lead.company && userBusinessInfo?.targetIndustries?.length) {
      const isTargetIndustry = userBusinessInfo.targetIndustries.some(industry => 
        lead.insights?.topics?.some(topic => topic.toLowerCase().includes(industry.toLowerCase()))
      );
      if (isTargetIndustry) {
        industryConnection = `We work specifically with companies in your space, `;
      }
    }

    // Create value proposition based on user's product/service
    let valueProposition = '';
    if (senderProduct && senderProduct !== 'innovative solutions' && senderProduct.trim() !== '') {
      valueProposition = `${industryConnection}helping companies like ${companyName} with ${senderProduct}`;
    } else if (senderCompany && senderCompany !== '[Your Company]' && senderCompany.trim() !== '') {
      // If we have company name but no specific product, use company name
      valueProposition = `${industryConnection}working with ${senderCompany} to help companies like ${companyName}`;
    } else {
      // Only fall back to generic message if we truly have no business info
      valueProposition = `${industryConnection}working on some solutions that might help companies like ${companyName}`;
    }

    // Create role-specific message if the lead's role matches target roles
    let roleSpecificNote = '';
    if (userBusinessInfo?.targetRoles?.length && lead.title) {
      const matchingRole = userBusinessInfo.targetRoles.find(role => 
        lead.title?.toLowerCase().includes(role.toLowerCase())
      );
      if (matchingRole) {
        roleSpecificNote = ` This seems especially relevant for someone in ${leadTitle}.`;
      }
    }

    // No onboarding note needed - user has completed onboarding
    let onboardingNote = '';
    
    console.log('[MessageGenerator] Business info loaded:', {
      hasUserBusinessInfo: !!userBusinessInfo,
      companyName: userBusinessInfo?.companyName,
      companyProduct: userBusinessInfo?.companyProduct?.substring(0, 50)
    });

    // Create a proper signature with the user's actual company name
    const hasValidCompanyName = userBusinessInfo?.companyName && 
                               userBusinessInfo.companyName.trim() !== '' && 
                               userBusinessInfo.companyName !== '[Your Company]';
    
    const signature = hasValidCompanyName ? userBusinessInfo.companyName : '';
    
    console.log('[MessageGenerator] Signature logic:', {
      rawCompanyName: userBusinessInfo?.companyName,
      hasValidCompanyName,
      finalSignature: signature
    });

    const baseTemplate = `Hey ${firstName},

${openingInterest}Came across your profile and thought what you're doing at ${companyName} looks interesting.

We're ${valueProposition}, and thought it might genuinely be up your alley.${roleSpecificNote}

No pressure at all, but wondering if you'd be open to a quick 10-15 min chat sometime if this sounds like something you're exploring?

Cheers,
[Your Name]${signature ? `\n${signature}` : ''}${onboardingNote}`;

    console.log('[MessageGenerator] Generated base message length:', baseTemplate.length);
    setBaseMessage(baseTemplate);
    setMessage(baseTemplate);
    
    return baseTemplate; // Return the template for immediate use
  };

  // Handle lead selection change
  const handleLeadChange = (leadId: string) => {
    const lead = leads.find(lead => lead.id === leadId);
    setSelectedLead(lead);
    if (lead) {
      generateBaseMessage(lead);
    }
  };

  // Handle example prompt selection
  const handlePromptSelect = (prompt: string) => {
    setCustomPrompt(prompt);
    setPromptValue(prompt);
    
    // Auto-apply the prompt when an example is clicked
    if (selectedLead) {
      // Use a timeout to ensure the UI updates first
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

  // Apply custom prompt to modify message
  const applyCustomPrompt = async (promptOverride?: string) => {
    const promptToUse = promptOverride || customPrompt;
    
    if (!selectedLead || !promptToUse.trim()) {
      toast.error("Please select a lead and enter a prompt");
      return;
    }

    // Ensure we have a baseMessage to work with - make this synchronous
    let currentBaseMessage = baseMessage;
    let currentMessage = message;
    
    if (!currentBaseMessage && !currentMessage && selectedLead) {
      // Generate base message synchronously and wait for state to update
      const generatedMessage = generateBaseMessage(selectedLead);
      currentMessage = generatedMessage;
      currentBaseMessage = generatedMessage;
      
      // Also wait a bit for React state to update for UI consistency
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final validation - ensure we have something to send
    const messageToSend = currentMessage || currentBaseMessage || baseMessage || message;
    
    if (!messageToSend || messageToSend.trim() === '') {
      console.error('No valid message to send:', {
        currentMessage,
        currentBaseMessage,
        baseMessage,
        message,
        selectedLead: selectedLead?.name
      });
      toast.error("Unable to generate base message. Please try refreshing the page.");
      return;
    }

    setLoading(true);
    console.log(`Sending message customization request with prompt: "${promptToUse}"`);
    console.log('Message being sent:', messageToSend.substring(0, 100) + '...');

    try {
      // Call our API endpoint
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          baseMessage: messageToSend,
          customPrompt: promptToUse, 
          lead: selectedLead 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.message) {
        // Check if message actually changed
        if (data.message === message && generateAttempts < 1) {
          // Try once more with the original base message
          console.log("Message didn't change, trying again with original template");
          setGenerateAttempts(prev => prev + 1);
          
          const retryResponse = await fetch('/api/generate-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              baseMessage: currentBaseMessage || messageToSend,
              customPrompt: promptToUse, 
              lead: selectedLead 
            })
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            if (retryData.success && retryData.message) {
              setMessage(retryData.message);
              
              if (onMessageGenerated) {
                onMessageGenerated(retryData.message, selectedLead.id);
              }
              
              toast.success("Message updated with your prompt!");
            }
          }
        } else {
          setMessage(data.message);
          setGenerateAttempts(0);
          
          if (onMessageGenerated) {
            onMessageGenerated(data.message, selectedLead.id);
          }
          
          toast.success("Message updated with your prompt!");
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error(`Failed to generate message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      // Clear prompt input after applying
      setPromptValue('');
      setCustomPrompt('');
      
      // Focus back on the prompt input for convenience
      if (promptInputRef.current) {
        promptInputRef.current.focus();
      }
    }
  };

  const resetMessage = () => {
    if (selectedLead) {
      generateBaseMessage(selectedLead);
      toast.info("Message reset to default template");
    }
  };

  const copyToClipboard = () => {
    if (textareaRef.current) {
      navigator.clipboard.writeText(textareaRef.current.value)
        .then(() => {
          setCopied(true);
          toast.success("Copied to clipboard!");
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
        <MessageSquare className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Outreach Message Generator</h2>
      </div>

      <div className="space-y-4">
        {/* Lead selector */}
        <div>
          <Label htmlFor="lead-select" className="text-sm text-gray-400">Select Lead</Label>
          <Select 
            value={selectedLead?.id || ''} 
            onValueChange={handleLeadChange}
          >
            <SelectTrigger id="lead-select" className="bg-gray-800 border-gray-700">
              <SelectValue placeholder="Select a lead to message" />
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

        {/* Message textarea */}
        <div>
          <div className="flex justify-between items-center">
            <Label htmlFor="message" className="text-sm text-gray-400">Message</Label>
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
            id="message" 
            name="message"
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
          <Label htmlFor="prompt" className="flex items-center gap-1.5 text-sm text-blue-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Customize with AI prompt</span>
          </Label>
          
          <div className="flex gap-2 mb-3">
            <Input 
              ref={promptInputRef}
              id="prompt"
              name="prompt"
              className="bg-gray-900 border-gray-700"
              placeholder="Make it shorter, funnier, add urgency, etc."
              value={promptValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPromptValue(e.target.value);
                setCustomPrompt(e.target.value);
              }}
              onKeyDown={handlePromptKeyDown}
              disabled={loading || !selectedLead}
              aria-label="Custom prompt for message customization"
            />
            <Button 
              onClick={() => applyCustomPrompt()}
              disabled={loading || !customPrompt.trim() || !selectedLead}
              className="flex gap-1.5 min-w-24"
              aria-label={loading ? "Updating message" : "Apply prompt"}
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
            <p className="text-xs text-gray-500 mb-2">Try these example prompts:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.slice(0, 5).map((prompt, index) => (
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

export { MessageGenerator };  
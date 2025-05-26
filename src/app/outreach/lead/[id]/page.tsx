'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getLeads } from '@/lib/supabase';
import { Lead } from '@/types/lead';
import { ExternalLink, Briefcase, Award, Calendar, Mail, Phone, MessageSquare, Linkedin, Mic, StopCircle, Play, Pause, Save, Clock, MapPin, Wand, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { MessageGenerator } from '@/components/shared/MessageGenerator';
import { FollowUpGenerator } from '@/components/shared/FollowUpGenerator';

interface OutreachTemplate {
  id: string;
  name: string;
  content: string;
}

// Pre-defined templates for outreach
const OUTREACH_TEMPLATES: OutreachTemplate[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn Message',
    content: `Hi {name},

I came across your profile and was impressed by your work at {company} as {title}. Your experience in the industry really stands out!

I'd love to connect and explore potential synergies between our organizations. We're helping companies similar to {company} with innovative solutions that might be of interest to you.

Looking forward to connecting!

Best regards,
[Your Name]`
  },
  {
    id: 'email',
    name: 'Email Outreach',
    content: `Subject: Quick question about {company}'s approach to growth

Hi {name},

I hope this email finds you well. Your work at {company} caught my attention, particularly your role as {title}.

I've been working with similar organizations on solutions that have helped them achieve significant growth. Based on your background, I believe we could have a valuable conversation about how these approaches might benefit {company} as well.

Would you be open to a 15-minute call next week to discuss this further?

Best regards,
[Your Name]`
  },
  {
    id: 'follow-up',
    name: 'Follow-up Message',
    content: `Hi {name},

I wanted to follow up on my previous message, as I understand how busy things can get at {company}.

I'm still interested in connecting to share some insights that have benefited companies similar to yours. Based on your experience as {title}, I believe you'd find these particularly relevant.

Let me know if you'd be open to a brief conversation at your convenience.

Best regards,
[Your Name]`
  }
];

// Example prompts to inspire users
const EXAMPLE_PROMPTS = [
  "Make it more conversational",
  "Shorten the message to a brief note",
  "Make it more professional",
  "Add specific industry expertise relevant to their role",
  "Emphasize benefits of our solution for their company",
  "Make it sound more personal and warm",
  "Add urgency to the message"
];

// Audio recorder component
function AudioRecorder({ leadName }: { leadName: string }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setHasRecording(true);
        
        if (audioRef.current) {
          audioRef.current.src = url;
        }
        
        // Release stream tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access your microphone. Please check permissions and try again.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const playPauseAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const downloadAudio = () => {
    if (audioURL) {
      const a = document.createElement('a');
      a.href = audioURL;
      a.download = `Audio_Message_For_${leadName.replace(/\s+/g, '_')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);
  
  // Handle audio ended event
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    if (audio) {
      audio.addEventListener('ended', handleEnded);
      return () => {
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Personal Audio Message</h3>
        <p className="text-gray-400 text-sm">
          Record a personalized audio message to send to {leadName}. Personalized voice messages can increase engagement by up to 3x compared to text-only outreach.
        </p>
      </div>
      
      <div className="mb-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
        <div className="text-gray-400 mb-2 text-sm font-medium">Suggested script:</div>
        <p className="text-gray-300 text-sm">
          Hi {leadName}, this is [Your Name] from OptiLeads. I noticed your impressive work at your company and wanted to personally reach out. I'd love to discuss how our solutions might align with your needs. Feel free to call me back at [phone number] or respond to my email. Looking forward to connecting!
        </p>
      </div>

      <div className="bg-[#0D1117] rounded-lg p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-6">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
                disabled={isPlaying}
              >
                <Mic size={28} />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center justify-center w-16 h-16 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors animate-pulse"
              >
                <StopCircle size={28} />
              </button>
            )}
            
            {hasRecording && !isRecording && (
              <button
                onClick={playPauseAudio}
                className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />} 
              </button>
            )}
            
            {hasRecording && !isRecording && (
              <button
                onClick={downloadAudio}
                className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full text-white transition-colors"
              >
                <Save size={20} />
              </button>
            )}
          </div>
          
          <div className="text-center text-lg font-mono">
            {isRecording ? (
              <div className="text-red-400 flex items-center animate-pulse">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Recording: {formatTime(recordingTime)}
              </div>
            ) : (
              // Display length only after recording exists
              hasRecording && <div className="text-gray-400">Recording length: {formatTime(recordingTime)}</div>
            )}
          </div>
        </div>
        
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  );
}

// Client component that uses useParams
function LeadDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leadId = params.id as string;
  const tabParam = searchParams.get('tab');
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'templates' | 'follow-up' | 'audio'>(() => {
    // Set initial tab based on URL parameter
    if (tabParam === 'follow-up') return 'follow-up';
    if (tabParam === 'audio') return 'audio';
    return 'templates';
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('linkedin');
  const [personalizedMessage, setPersonalizedMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [schemaFixed, setSchemaFixed] = useState(true);
  const [fixingSchema, setFixingSchema] = useState(false);
  
  useEffect(() => {
    async function fetchLead() {
      try {
        setLoading(true);
        
        // Use the API endpoint instead of direct Supabase call to avoid auth issues
        const response = await fetch('/api/fetch-leads');
        if (!response.ok) {
          throw new Error(`Failed to fetch leads: ${response.status}`);
        }
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Failed to load leads');
        }
        
        const leads = data.leads || [];
        const foundLead = leads.find((l: any) => l.id === leadId);
        
        if (foundLead) {
          setLead(foundLead);
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (leadId) {
      fetchLead();
    }
  }, [leadId]);
  
  // Copy the message to clipboard
  const handleCopy = () => {
    if (personalizedMessage) {
      navigator.clipboard.writeText(personalizedMessage)
        .then(() => {
    setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
          toast.success("Message copied to clipboard!");
        })
        .catch(error => {
          console.error('Failed to copy message:', error);
          toast.error("Failed to copy message");
        });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading lead details...</div>
      </div>
    );
  }
  
  if (!lead) {
    return (
      <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
        Lead not found. Please select a valid lead.
      </div>
    );
  }

  // --- Add console log for debugging lead object ---
  console.log('Lead Data for Component:', JSON.stringify(lead, null, 2));
  // --- End console log ---

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lead Outreach</h1>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm
            ${lead.status === 'Converted' ? 'bg-green-500/20 text-green-400' : ''}
            ${lead.status === 'Qualified' ? 'bg-blue-500/20 text-blue-400' : ''}
            ${lead.status === 'New' ? 'bg-purple-500/20 text-purple-400' : ''}
            ${lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-400' : ''}
            ${lead.status === 'Lost' ? 'bg-red-500/20 text-red-400' : ''}
          `}>
            {lead.status}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/5 xl:w-1/3 space-y-5">
          {/* Lead Info Card */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-5">
            <h2 className="text-xl font-semibold mb-4">{lead.name}</h2>
            
            <div className="space-y-4">
              {lead.email && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-300 break-all">{lead.email}</div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Company</p>
                  <p className="font-medium">{lead.company || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">OptiLeads Score</p>
                  <p className="font-medium text-green-400">{lead.chromeScore || lead.score}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Added on</p>
                  <p className="font-medium">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {lead.last_contacted_at && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Last Contacted</p>
                    <p className="font-medium">
                      {new Date(lead.last_contacted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Display Enrichment Data */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 p-5 space-y-3 text-sm">
            <h3 className="text-base font-semibold mb-2">Optimal Outreach Time</h3>
             {lead.timezone && lead.timezone !== 'UTC' && (
               <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span>Time Zone: {lead.timezone}</span>
               </div>
             )}
             {lead.optimalOutreachTimeEastern && (
                <div className="flex items-center">
                   <Clock className="h-4 w-4 mr-2 text-blue-400 flex-shrink-0" />
                   <span className="font-semibold text-base">Optimal Time (ET): {lead.optimalOutreachTimeEastern}</span>
                </div>
             )}
             {/* Display local time if different from ET */}
             {lead.optimalOutreachTime && lead.optimalOutreachTimeEastern && lead.optimalOutreachTime !== lead.optimalOutreachTimeEastern.replace(/\sET$/, '') && (
                <div className="flex items-center pl-6 text-xs text-gray-400">
                   <span>(Local: {lead.optimalOutreachTime})</span>
                </div>
             )}
             {lead.outreachReason && (
                <div className="text-xs text-gray-400 pl-6 pt-1">
                   {lead.outreachReason}
                </div>
             )}
          </div>
          
          {/* Outreach History */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Outreach History</h3>
            
            {lead.last_contacted_at ? (
              <div className="bg-[#0D1117] rounded-lg p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-blue-400 font-medium">LinkedIn Message</span>
                    <p className="text-gray-400 text-sm">
                      Sent on {new Date(lead.last_contacted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                    Sent
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Initial outreach message sent through LinkedIn.
                </p>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                No outreach history found. Send your first message to this lead.
              </div>
            )}
          </div>
        </div>
        
        {/* Outreach Templates */}
        <div className="flex-1 bg-[#1A1F2B] rounded-lg p-6 border border-gray-700/20">
          <h2 className="text-xl font-semibold mb-6">Personalized Outreach</h2>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'templates' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Initial Outreach
            </button>
            <button
              onClick={() => setActiveTab('follow-up')}
              className={`px-4 py-2 border-b-2 flex items-center ${
                activeTab === 'follow-up' 
                  ? 'border-orange-500 text-orange-400' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Follow-up Messages
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-4 py-2 border-b-2 flex items-center ${
                activeTab === 'audio' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Mic className="w-4 h-4 mr-2" />
              Audio Message
            </button>
          </div>
          
          {/* Initial Outreach Tab */}
          {activeTab === 'templates' && (
            <>
              {/* Replaced custom implementation with MessageGenerator component */}
              <MessageGenerator
                leads={[lead]}
                selectedLeadId={lead.id}
                onMessageGenerated={(message, leadId) => {
                  setPersonalizedMessage(message);
                  toast.success("Message updated!");
                }}
              />
              
              {/* Copy Button */}
              <div className="flex justify-end mt-4">
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 ${
                      isCopied
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } rounded-lg transition-colors`}
                  >
                  {isCopied ? 'Copied' : 'Copy to Clipboard'}
                  </button>
              </div>
            </>
          )}

          {/* Follow-up Messages Tab */}
          {activeTab === 'follow-up' && (
            <>
              <FollowUpGenerator
                leads={[lead]}
                selectedLeadId={lead.id}
                onMessageGenerated={(message, leadId, followUpType) => {
                  setPersonalizedMessage(message);
                  toast.success(`${followUpType} follow-up message generated!`);
                }}
              />
              
              {/* Copy Button */}
              <div className="flex justify-end mt-4">
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2 ${
                      isCopied
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    } rounded-lg transition-colors`}
                  >
                  {isCopied ? 'Copied' : 'Copy Follow-up to Clipboard'}
                  </button>
              </div>
            </>
          )}
          
          {/* Audio Message Tab */}
          {activeTab === 'audio' && (
            <AudioRecorder leadName={lead.name} />
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper component with Suspense for useSearchParams
export default function LeadDetailPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
        <LeadDetailContent />
      </Suspense>
    </DashboardLayout>
  );
}
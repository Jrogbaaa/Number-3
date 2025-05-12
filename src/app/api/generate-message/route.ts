import { NextResponse } from 'next/server';
import type { Lead } from '@/types/lead';

// In a real implementation, you would use an AI API like OpenAI
// Example: https://platform.openai.com/docs/api-reference/chat/create
interface GenerateMessageRequest {
  baseMessage: string;
  customPrompt: string;
  lead: Lead;
}

// Helper function to extract and handle signature
function extractAndHandleSignature(message: string): { messageBody: string, signature: string } {
  // Common signature patterns
  const signaturePatterns = [
    /Best regards,[\s\S]*?$/i,
    /Regards,[\s\S]*?$/i,
    /Looking forward[\s\S]*?$/i,
    /Sincerely,[\s\S]*?$/i,
    /Thanks,[\s\S]*?$/i,
    /Cheers,[\s\S]*?$/i,
    /\[Your Name\][\s\S]*?$/i
  ];
  
  let signature = '';
  let messageBody = message;
  
  // Find the first matching signature pattern
  for (const pattern of signaturePatterns) {
    const match = message.match(pattern);
    if (match) {
      signature = match[0];
      messageBody = message.replace(pattern, '').trim();
      break;
    }
  }
  
  // If no signature pattern was found but [Your Name] exists somewhere
  if (!signature && message.includes('[Your Name]')) {
    const parts = message.split('[Your Name]');
    if (parts.length > 1) {
      // Take everything from the line containing [Your Name] as signature
      const nameLineMatch = message.match(/[^\n]*\[Your Name\][^\n]*$/);
      if (nameLineMatch) {
        signature = nameLineMatch[0];
        messageBody = message.replace(nameLineMatch[0], '').trim();
      }
    }
  }
  
  return { messageBody, signature: signature || 'Best regards,\n[Your Name]' };
}

export async function POST(request: Request) {
  try {
    console.log("API: Received request to generate-message endpoint");
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log("API: Successfully parsed request body");
    } catch (parseError) {
      console.error("API: Failed to parse request JSON:", parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body'
      }, { status: 400 });
    }
    
    const { baseMessage, customPrompt, lead } = requestBody as GenerateMessageRequest;
    
    // Validate required parameters
    if (!baseMessage) {
      console.error("API: Missing baseMessage parameter");
      return NextResponse.json({
        success: false,
        error: 'Missing baseMessage parameter'
      }, { status: 400 });
    }
    
    if (!customPrompt) {
      console.error("API: Missing customPrompt parameter");
      return NextResponse.json({
        success: false,
        error: 'Missing customPrompt parameter'
      }, { status: 400 });
    }
    
    if (!lead) {
      console.error("API: Missing lead parameter");
      return NextResponse.json({
        success: false,
        error: 'Missing lead parameter'
      }, { status: 400 });
    }
    
    console.log(`API: Generating message for ${lead.name} using prompt: "${customPrompt}"`);
    
    // Extract signature before applying transformations
    const { messageBody, signature } = extractAndHandleSignature(baseMessage);
    let newMessageBody = messageBody;
    let newSignature = signature;
    let promptApplied = false;
    
    const lowerPrompt = customPrompt.toLowerCase();
    
    // Check for specific keywords
    if (lowerPrompt.includes('conversational')) {
      newMessageBody = newMessageBody.replace('I noticed your role', "I was checking out your profile and saw");
      newMessageBody = newMessageBody.replace('Would you be open to', "How about we jump on");
      newSignature = newSignature.replace('Best regards', "Looking forward to chatting");
      promptApplied = true;
    } 
    
    if (lowerPrompt.includes('professional')) {
      newMessageBody = newMessageBody.replace('Hi', "Dear");
      newMessageBody = newMessageBody.replace("I'd reach out", "I wanted to connect");
      newMessageBody = newMessageBody.replace("jump on a call", "schedule a discussion");
      promptApplied = true;
    } 
    
    if (lowerPrompt.includes('short') || lowerPrompt.includes('brief')) {
      newMessageBody = `Hi ${lead.name.split(' ')[0]},

Quick note - I help companies like ${lead.company || 'yours'} create better marketing content through expert interviews. 

15 min to discuss?`;
      newSignature = "\n\nRegards,\n[Your Name]";
      promptApplied = true;
    } 
    
    if (lowerPrompt.includes('personal') || lowerPrompt.includes('warm')) {
      newMessageBody = newMessageBody.replace('Hi', "Hey");
      newMessageBody = newMessageBody + `\n\nP.S. I noticed from your LinkedIn that you're interested in ${lead.insights?.topics?.[0] || 'industry trends'}. I'd love to hear your perspective on that too!`;
      promptApplied = true;
    } 
    
    if (lowerPrompt.includes('urgency') || lowerPrompt.includes('urgent')) {
      newMessageBody = newMessageBody.replace('Would you be open', "I have a few slots open this week. Would you be available");
      newMessageBody = newMessageBody + "\n\nP.S. We're currently offering a special onboarding package until the end of the month.";
      promptApplied = true;
    } 
    
    if (lowerPrompt.includes('industry') || lowerPrompt.includes('expertise') || lowerPrompt.includes('specific')) {
      // Add industry-specific content
      const industry = lead.insights?.topics?.[0] || lead.company || 'your industry';
      newMessageBody = newMessageBody + `\n\nOur platform has been particularly successful with companies in ${industry}, helping them achieve 40% faster content production and 2x engagement.`;
      promptApplied = true;
    } 
    
    if (lowerPrompt.includes('question') || lowerPrompt.includes('ask')) {
      // Add relevant questions
      newMessageBody = newMessageBody + `\n\nI'm curious - what's your biggest challenge when it comes to creating thought leadership content? Are you struggling more with production speed or engagement metrics?`;
      promptApplied = true;
    }
    
    // Apply a generic modification if no specific keywords matched
    if (!promptApplied) {
      console.log("API: No specific keywords matched, checking for other common requests");
      
      // Handle combined request for longer AND funnier messages
      if (lowerPrompt.includes('longer') && (lowerPrompt.includes('funnier') || lowerPrompt.includes('funny'))) {
        console.log("API: Adding both length and humor to the message");
        
        // Replace formal greeting with something more playful
        newMessageBody = newMessageBody.replace('Hi', 'Hey there');
        
        // Add industry-specific humor and length
        const industry = lead.company?.toLowerCase().includes('insurance') 
          ? 'insurance' 
          : lead.company?.toLowerCase().includes('health') 
            ? 'healthcare' 
            : lead.company?.toLowerCase().includes('tech') 
              ? 'technology' 
              : 'your industry';
              
        if (lead.company?.toLowerCase().includes('insurance')) {
          newMessageBody = newMessageBody.replace('I came across your profile', 'I stumbled upon your profile (don\'t worry, I\'m fully covered for profile-stumbling incidents)');
          newMessageBody += `\n\nI promise this isn't a cold call about extending your car's warranty! Though I can't promise our conversation won't be "premium" quality. 😉`;
          
          newMessageBody += `\n\nOn a more serious note (but just barely), I've been following the ${industry} sector closely. When I'm not making insurance puns that would make an actuary groan, I'm actually researching how content strategy impacts customer engagement in financial services.`;
          
          newMessageBody += `\n\nOur platform has helped several ${industry} companies increase their content production by 40% while maintaining that perfect balance of informative and not-putting-people-to-sleep. Turns out, explaining insurance doesn't have to be as painful as reading the policy fine print!`;
        } 
        else if (lead.title?.toLowerCase().includes('market')) {
          newMessageBody = newMessageBody.replace('I came across your profile', 'I found your profile while doom-scrolling LinkedIn (much healthier than doom-scrolling Twitter, right?)');
          
          newMessageBody += `\n\nAs a marketing pro, you probably get more pitches than a baseball game, but I promise this one's actually in your strike zone!`;
          
          newMessageBody += `\n\nIn all seriousness (well, partial seriousness - I don't do fully serious), I've been following ${lead.company || 'your company'}'s approach to content marketing with great interest. Your team's strategy for engagement is impressive, though I wonder if you're facing the same content production bottlenecks that we see across ${industry}.`;
          
          newMessageBody += `\n\nOur platform has helped marketing teams create 3x more thought leadership content without having to clone their subject matter experts (which, trust me, we tried - the ethics committee shut that down real quick).`;
        } 
        else {
          newMessageBody = newMessageBody.replace('I came across your profile', 'I discovered your profile while attempting to look professional on LinkedIn instead of watching cat videos');
          
          newMessageBody += `\n\nI know "synergies" is such a buzzword bingo term, but I couldn't help myself. Feel free to mentally replace it with "awesome collaborative possibilities" or "potentially cool business stuff" instead!`;
          
          newMessageBody += `\n\nWhen I'm not overusing corporate jargon, I actually run a platform that helps companies like ${lead.company || 'yours'} create more engaging content through expert interviews. We've found that authentic expert voices perform 2.5x better than generic content - and they're usually unintentionally funnier too!`;
          
          newMessageBody += `\n\nI'd love to share some specific examples relevant to ${industry}, including how one client managed to turn a 15-minute interview into content that outperformed everything else they published that quarter. Their secret? The executive accidentally left in a story about a catastrophic coffee spill during a board meeting that somehow perfectly illustrated their business resilience strategy.`;
        }
        
        // Replace formal closing in signature
        newSignature = newSignature.replace('Best regards,', 'Looking forward to connecting (and promising minimal use of corporate buzzwords),');
        
        promptApplied = true;
      }
      // If not the combined case, check for individual cases
      else {
        // Handle request for longer messages
        if (lowerPrompt.includes('longer')) {
          console.log("API: Adding more content to make message longer");
          
          // Add more content based on company and role
          const industry = lead.company?.toLowerCase().includes('insurance') 
            ? 'insurance' 
            : lead.company?.toLowerCase().includes('health') 
              ? 'healthcare' 
              : lead.company?.toLowerCase().includes('tech') 
                ? 'technology' 
                : 'your industry';
          
          newMessageBody += `\n\nI've been following the developments in ${industry} for some time now, and I'm particularly impressed with how ${lead.company || 'your company'} has positioned itself in the market. Your approach to ${lead.title?.includes('Marketing') ? 'marketing' : 'business development'} seems to align well with what we're seeing across the industry.`;
          newMessageBody += `\n\nIn my recent discussions with other ${lead.title?.includes('VP') || lead.title?.includes('Vice President') ? 'executives' : 'professionals'} in ${industry}, I've noticed a growing interest in content-driven strategies that efficiently scale thought leadership. Our platform specializes in exactly this area, helping teams like yours produce high-quality content without the traditional bottlenecks.`;
          
          promptApplied = true;
        }
        
        // Handle request for funnier messages
        if (lowerPrompt.includes('funnier') || lowerPrompt.includes('funny') || lowerPrompt.includes('humor')) {
          console.log("API: Adding humor to the message");
          
          // Replace formal greeting with something more playful
          newMessageBody = newMessageBody.replace('Hi', 'Hey there');
          
          // Add industry-specific humor
          if (lead.company?.toLowerCase().includes('insurance')) {
            newMessageBody = newMessageBody.replace('I came across your profile', 'I stumbled upon your profile (don\'t worry, I\'m fully covered for profile-stumbling incidents)');
            newMessageBody += `\n\nI promise this isn't a cold call about extending your car's warranty! Though I can't promise our conversation won't be "premium" quality. 😉`;
          } else if (lead.title?.toLowerCase().includes('market')) {
            newMessageBody = newMessageBody.replace('I came across your profile', 'I found your profile while doom-scrolling LinkedIn (much healthier than doom-scrolling Twitter, right?)');
            newMessageBody += `\n\nAs a marketing pro, you probably get more pitches than a baseball game, but I promise this one's actually in your strike zone!`;
          } else {
            newMessageBody = newMessageBody.replace('I came across your profile', 'I discovered your profile while attempting to look professional on LinkedIn instead of watching cat videos');
            newMessageBody += `\n\nI know "synergies" is such a buzzword bingo term, but I couldn't help myself. Feel free to mentally replace it with "awesome collaborative possibilities" or "potentially cool business stuff" instead!`;
          }
          
          // Replace formal closing in signature
          newSignature = newSignature.replace('Best regards,', 'Looking forward to connecting (and not making awkward small talk about the weather),');
          
          promptApplied = true;
        }
      }
      
      // If still no matches, use the generic fallback
      if (!promptApplied) {
        console.log("API: Using generic fallback for prompt:", customPrompt);
        
        // Use a better generic fallback that at least attempts to follow the instruction
        const cleanPrompt = customPrompt.toLowerCase().replace(/make it |add |more /g, '').trim();
        
        // Add a sentence that tries to incorporate the requested style
        newMessageBody += `\n\nI wanted to reach out in a way that's ${cleanPrompt}, as I've found that personalized communication leads to more productive conversations.`;
      }
    }
    
    // Compose the final message with signature at the end
    let newMessage = newMessageBody.trim();
    if (newSignature) {
      newMessage += '\n\n' + newSignature.trim();
    }
    
    // Add a simulated delay to make it feel like AI processing (300-700ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 300));

    console.log("API: Successfully generated modified message");
    return NextResponse.json({
      success: true,
      message: newMessage
    });
    
  } catch (error: any) {
    console.error('API: Message generation error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error generating message'
    }, { status: 500 });
  }
} 
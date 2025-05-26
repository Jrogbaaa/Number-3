import { NextResponse } from 'next/server';
import type { Lead } from '@/types/lead';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { v5 } from 'uuid';
import Replicate from 'replicate';

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// UUID namespace for consistent ID generation
const UUID_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

// Helper to convert non-UUID user IDs to valid UUIDs
const getUserUUID = (userId: string): string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(userId)) {
    return userId;
  }
  return v5(userId, UUID_NAMESPACE);
};

// Initialize Replicate client with API key from environment
console.log("REPLICATE_API_KEY exists:", !!process.env.REPLICATE_API_KEY);
console.log("REPLICATE_API_KEY value (first few chars):", process.env.REPLICATE_API_KEY ? process.env.REPLICATE_API_KEY.substring(0, 5) + "..." : "undefined");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

// Interface for the request
interface GenerateMessageRequest {
  baseMessage: string;
  customPrompt: string;
  lead: Lead;
}

// Interface for user business information from onboarding
interface UserBusinessInfo {
  companyName?: string;
  companyIndustry?: string;
  companyProduct?: string;
  targetRoles?: string[];
  targetIndustries?: string[];
}

// Fetch user's business information from preferences
async function getUserBusinessInfo(userId: string): Promise<UserBusinessInfo | null> {
  try {
    const userUUID = getUserUUID(userId);
    console.log(`[generate-message] Fetching business info for user: ${userUUID}`);
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('company_name, company_industry, company_product, target_roles, target_industries')
      .eq('user_id', userUUID)
      .single();

    if (error) {
      console.error('[generate-message] Error fetching user preferences:', error);
      return null;
    }

    if (!data) {
      console.log('[generate-message] No preferences found for user');
      return null;
    }

    console.log('[generate-message] Retrieved business info:', {
      companyName: data.company_name,
      companyIndustry: data.company_industry,
      companyProduct: data.company_product ? data.company_product.substring(0, 50) + '...' : null
    });

    return {
      companyName: data.company_name,
      companyIndustry: data.company_industry,
      companyProduct: data.company_product,
      targetRoles: data.target_roles || [],
      targetIndustries: data.target_industries || [],
    };
  } catch (err) {
    console.error('[generate-message] Unexpected error fetching business info:', err);
    return null;
  }
}

// Helper function to extract and handle signature
function extractAndHandleSignature(message: string): { messageBody: string, signature: string } {
  // Common signature patterns
  const signaturePatterns = [
    /Best regards,[\s\S]*?$/i,
    /Regards,[\s\S]*?$/i,
    /Cheers,[\s\S]*?$/i,
    /Talk soon,[\s\S]*?$/i,
    /Looking forward[\s\S]*?$/i,
    /Sincerely,[\s\S]*?$/i,
    /Thanks,[\s\S]*?$/i,
    /\[Your Name\][\s\S]*?$/i,
    /Best,[\s\S]*?$/i,
    /All the best,[\s\S]*?$/i,
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
  
  // Default signature if none is found or if it's too minimal
  if (!signature.trim() || signature.trim() === '[Your Name]') {
    signature = 'Cheers,\n[Your Name]';
  }
  
  return { messageBody, signature };
}

export async function POST(request: Request) {
  try {
    console.log("API: Received request to generate-message endpoint");
    
    // Check authentication first
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("API: Unauthorized - no session");
      return NextResponse.json({ success: false, error: 'Unauthorized - please sign in' }, { status: 401 });
    }

    // Fetch user's business information
    const userBusinessInfo = await getUserBusinessInfo(session.user.id);
    
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("API: Failed to parse request JSON:", parseError);
      return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { baseMessage, customPrompt, lead } = requestBody as GenerateMessageRequest;
    
    if (!baseMessage || !customPrompt || !lead) {
      const missingParams = [];
      if (!baseMessage) missingParams.push('baseMessage');
      if (!customPrompt) missingParams.push('customPrompt');
      if (!lead) missingParams.push('lead');
      console.error(`API: Missing parameters: ${missingParams.join(', ')}`);
      return NextResponse.json({ success: false, error: `Missing required parameters: ${missingParams.join(', ')}` }, { status: 400 });
    }
    
    console.log(`API: Generating message for ${lead.name} (Lead ID: ${lead.id}) using prompt: "${customPrompt}"`);
    if (userBusinessInfo?.companyName) {
      console.log(`API: Using business context: ${userBusinessInfo.companyName} - ${userBusinessInfo.companyProduct?.substring(0, 50)}...`);
    }
    
    const { messageBody, signature } = extractAndHandleSignature(baseMessage);
    
    // Try to use Replicate API if configured
    if (process.env.REPLICATE_API_KEY) {
      try {
        console.log("API: Using Replicate for message generation");
        console.log("Replicate API key exists in this context:", !!process.env.REPLICATE_API_KEY);
        
        // Use Llama-3 model with Replicate
        const model = "meta/meta-llama-3-8b-instruct";
        
        const prompt = `
You are an expert in crafting personalized outreach messages. You're going to help transform a base message for a sales or marketing outreach.

SENDER'S BUSINESS INFORMATION:
- Company: ${userBusinessInfo?.companyName || '[Your Company]'}
- Industry: ${userBusinessInfo?.companyIndustry || 'Business Services'}
- Product/Service: ${userBusinessInfo?.companyProduct || '[Your Product/Service]'}
- Target Industries: ${userBusinessInfo?.targetIndustries?.join(', ') || 'Various'}
- Target Roles: ${userBusinessInfo?.targetRoles?.join(', ') || 'Decision makers'}

LEAD INFORMATION:
- Name: ${lead.name}
- Company: ${lead.company || 'Unknown'}
- Title: ${lead.title || 'Unknown'}
- Industry: ${lead.insights?.topics?.[0] || 'Unknown'}
- Background: ${lead.insights?.background?.[0] || 'Unknown'}
- Interests: ${lead.insights?.interests?.join(', ') || 'Unknown'}
- Outreach Reason: ${lead.outreachReason || 'Unknown'}

ORIGINAL MESSAGE:
${messageBody}

INSTRUCTION: ${customPrompt}

Transform the message according to the instruction. Focus on how the sender's specific product/service can help this particular lead and their company.

IMPORTANT GUIDELINES:
- Keep the message professional and respectful
- Personalize with the lead's information where appropriate
- Address the lead by name
- Specifically mention how your product/service can benefit their company
- Reference relevant industry connections or shared challenges
- Make the value proposition clear and specific to their role/industry
- Use the sender's business context to create authentic, relevant outreach
- Don't add made-up information - only use the provided business and lead data
- Return ONLY the transformed message body, without any explanation or commentary

TRANSFORMED MESSAGE:`;

        // Call Replicate API
        const output = await replicate.run(model, { 
          input: { 
            prompt,
            max_tokens: 800,
            temperature: 0.7,
          }
        });
        
        // Process the output
        let transformedMessageBody = '';
        if (Array.isArray(output)) {
          transformedMessageBody = output.join('');
        } else if (typeof output === 'string') {
          transformedMessageBody = output;
        } else {
          console.log("API: Unexpected output format from Replicate", output);
          transformedMessageBody = JSON.stringify(output);
        }
        
        // Clean up the response if needed
        transformedMessageBody = transformedMessageBody.trim();
        
        // Return the response with the AI-transformed message
        return NextResponse.json({ 
          success: true, 
          message: transformedMessageBody + '\n\n' + signature,
          usedAI: true
        });
      } catch (replicateError) {
        console.error("API: Error calling Replicate API:", replicateError);
        // Fall back to rule-based approach
        console.log("API: Falling back to rule-based message transformation");
      }
    }
    
    // Fallback to rule-based approach if Replicate API is not available or fails
    // This keeps all the existing logic as a reliable fallback
    let newMessageBody = messageBody;
    let newSignature = signature;
    let promptApplied = false;
    const lowerPrompt = customPrompt.toLowerCase();
    const firstName = lead.name.split(' ')[0];

    // Business context from user onboarding
    const companyName = userBusinessInfo?.companyName || '[Your Company]';
    const companyProduct = userBusinessInfo?.companyProduct || '[Your Product/Service]';
    const userIndustry = userBusinessInfo?.companyIndustry || '';

    // Replace placeholder values with actual business information
    newMessageBody = newMessageBody.replace(/\[Your Company\]/g, companyName);
    newMessageBody = newMessageBody.replace(/\[Your Product\/Service\]/g, companyProduct);
    newMessageBody = newMessageBody.replace(/\[Your Core Value Prop[^\]]*\]/g, companyProduct);
    
    // Add industry-specific context if there's a match
    if (userIndustry && lead.company) {
      const industryBenefit = `helping ${lead.company} with ${companyProduct}`;
      if (!newMessageBody.toLowerCase().includes(companyProduct.toLowerCase()) && companyProduct !== '[Your Product/Service]') {
        newMessageBody = newMessageBody.replace(
          /We help companies like [^\.]+\./,
          `We help companies like ${lead.company} with ${companyProduct}.`
        );
      }
    }

    // --- Enhanced Personalization & Conversational Logic ---

    if (lowerPrompt.includes('personal') || lowerPrompt.includes('warm') || lowerPrompt.includes('friendly')) {
      newMessageBody = newMessageBody.replace(/^Hi\\b/i, `Hey ${firstName}`);
      newMessageBody = newMessageBody.replace(/^Hello\\b/i, `Hi ${firstName}`);
      
      if (lead.insights?.interests?.length && lead.insights.interests[0]) {
        newMessageBody += `\\n\\nP.S. Totally noticed your interest in ${lead.insights.interests[0]}. Would love to pick your brain about that sometime too!`;
      } else if (lead.insights?.topics?.length && lead.insights.topics[0]) {
        newMessageBody += `\\n\\nP.S. Your thoughts on ${lead.insights.topics[0]} are spot on!`;
      }
      if (lead.outreachReason && !newMessageBody.toLowerCase().includes(lead.outreachReason.toLowerCase())) {
        newMessageBody = `Hey ${firstName},\\n\\nReaching out because ${lead.outreachReason.toLowerCase()}.\\n\\n` + messageBody;
      }
      newSignature = newSignature.replace(/Best regards|Regards|Sincerely/i, 'Cheers,');
      promptApplied = true;
    }

    // Put 'professional' check before 'conversational' as 'professional' is a stronger override
    if (lowerPrompt.includes('professional')) {
      newMessageBody = newMessageBody.replace(/^Hey\\b/i, 'Dear');
      newMessageBody = newMessageBody.replace(/^Hi\\b/i, 'Dear'); // Catches "Hi FirstName" too
      newMessageBody = newMessageBody.replace(`Hi ${firstName}`, `Dear ${firstName}`);
      newMessageBody = newMessageBody.replace(`Hey ${firstName}`, `Dear ${firstName}`);
      newMessageBody = newMessageBody.replace('Just wanted to reach out', 'I am writing to you regarding');
      newMessageBody = newMessageBody.replace('I was hoping we could chat about', 'I would like to discuss');
      newMessageBody = newMessageBody.replace('Are you free for a quick call', 'Would you be available for a meeting');
      newMessageBody = newMessageBody.replace('Let me know if you have some time', 'Please let me know your availability');
      newMessageBody = newMessageBody.replace('cool ways we could work together', 'potential synergies');
      newMessageBody = newMessageBody.replace('some neat ideas', 'innovative solutions');
      newSignature = newSignature.replace(/Cheers|Talk soon|Best,/i, 'Sincerely,');
      promptApplied = true;
    }

    if (lowerPrompt.includes('conversational') && !lowerPrompt.includes('professional')) { // Ensure professional isn't also set
      newMessageBody = newMessageBody.replace(/^Dear\\b/i, `Hi ${firstName}`);
      // Ensure it doesn't say "Hi Hi FirstName" if base was "Hi Name"
      if (!newMessageBody.trim().toLowerCase().startsWith(`hi ${firstName.toLowerCase()}`) && !newMessageBody.trim().toLowerCase().startsWith(`hey ${firstName.toLowerCase()}`)) {
        newMessageBody = newMessageBody.replace(/^Hi\\b/i, `Hey ${firstName}`);
      }
      newMessageBody = newMessageBody.replace('I am writing to you', 'Just wanted to reach out');
      newMessageBody = newMessageBody.replace('I would like to discuss', 'I was hoping we could chat about');
      newMessageBody = newMessageBody.replace('Would you be available for a meeting', 'Are you free for a quick call');
      newMessageBody = newMessageBody.replace('Please let me know your availability', 'Let me know if you have some time');
      newMessageBody = newMessageBody.replace('look forward to hearing from you', 'hope to hear from you soon');
      newMessageBody = newMessageBody.replace('potential synergies', 'cool ways we could work together');
      newMessageBody = newMessageBody.replace('innovative solutions', 'some neat ideas');
      
      if (lead.insights?.relevantPostings?.[0] && !newMessageBody.includes(lead.insights.relevantPostings[0])) {
        newMessageBody += `\\n\\nBy the way, loved your recent post about ${lead.insights.relevantPostings[0]}!`;
      } else if (lead.insights?.industryGroupParticipation?.[0] && !newMessageBody.includes(lead.insights.industryGroupParticipation[0])) {
        newMessageBody += `\\n\\nAlso, saw we're both in the ${lead.insights.industryGroupParticipation[0]} group. Small world!`;
      }
      newSignature = newSignature.replace(/Best regards|Regards|Sincerely/i, 'Talk soon,');
      promptApplied = true;
    }
    
    if (lowerPrompt.includes('short') || lowerPrompt.includes('brief') || lowerPrompt.includes('quick note')) {
      let opening = `Quick note for ${firstName} - `;
      if (lead.outreachReason) {
        opening = `${firstName}, touching base because ${lead.outreachReason.toLowerCase()}. `;
      }
      const coreValueProp = companyProduct !== '[Your Product/Service]' ? companyProduct : 'AI-driven solutions';
      newMessageBody = `${opening}We help companies like ${lead.company || 'yours'} with ${coreValueProp}.\\n\\n10-15 mins to see if it's a fit?`;
      newSignature = '\\n\\nBest,\\n[Your Name]';
      promptApplied = true;
    }
    
    if (lowerPrompt.includes('urgency') || lowerPrompt.includes('urgent')) {
      newMessageBody = newMessageBody.replace('Would you be open', 'I have a couple of slots free this week. Any chance you\'re available');
      newMessageBody = newMessageBody.replace('open to a quick 10-15 min chat sometime', 'free for a quick 10-15 min chat this week');
      // Remove the P.S. section entirely for urgency - it was adding unwanted content
      promptApplied = true;
    }
    
    if (lowerPrompt.includes('industry') || lowerPrompt.includes('expertise') || lowerPrompt.includes('specific')) {
      const industryInsight = lead.insights?.industryGroupParticipation?.[0] || lead.insights?.topics?.[0] || lead.company || 'your specific industry';
      const specificBenefit = companyProduct !== '[Your Product/Service]' ? 
        `implementing ${companyProduct} to boost efficiency and results` : 
        '[mention specific benefit e.g., boosting engagement by X% or streamlining content creation]';
      if (!newMessageBody.toLowerCase().includes(industryInsight.toLowerCase())) { // Avoid redundancy
         newMessageBody = newMessageBody + `\\n\\nOur ${companyProduct !== '[Your Product/Service]' ? companyProduct : 'platform'} has seen great results with companies in ${industryInsight}, particularly around ${specificBenefit}.`;
      }
      promptApplied = true;
    }
    
    if (lowerPrompt.includes('question') || lowerPrompt.includes('ask')) {
      const relevantArea = lead.insights?.topics?.[0] || 'creating engaging content';
      if (!newMessageBody.includes('biggest hurdle')) { // Avoid redundancy
          newMessageBody = newMessageBody + `\\n\\nQuick question for you - what\'s the biggest hurdle you face when it comes to ${relevantArea}? Is it more about the ideation, production, or distribution?`;
      }
      promptApplied = true;
    }

    // --- Restored and Enhanced Funny/Longer Logic ---
    // Placed here to allow specific keywords to take precedence, but before generic fallback.

    const primaryIndustryGuess = lead.insights?.topics?.[0] || 
                              (lead.company ? `companies like ${lead.company}` : 'your industry');
    const leadJobFunction = lead.title?.toLowerCase() || '';

    // Combined: Longer AND Funnier
    if (lowerPrompt.includes('longer') && (lowerPrompt.includes('funnier') || lowerPrompt.includes('funny'))) {
      console.log("API: Applying 'longer' and 'funnier' enhancements.");
      newMessageBody = newMessageBody.replace(/^Hi\\b|^Hello\\b|^Dear\\b/i, `Well hello there, ${firstName}!`);
      
      let humorSection = '';
      if (leadJobFunction.includes('marketing')) {
        humorSection = `As a fellow marketing enthusiast, you probably appreciate a message that isn\'t drier than a forgotten PowerPoint slide. We\'re trying to make content creation less of a "pull your hair out" experience and more of a "hey, this is actually fun!" kind of deal.`;
      } else if (primaryIndustryGuess.toLowerCase().includes('tech')) {
        humorSection = `In the tech world, things move faster than a caffeinated squirrel. We help folks like you create content that actually keeps up, without needing a PhD in buzzword bingo.`;
      } else {
        humorSection = `Let\'s be honest, most outreach emails are pretty snooze-worthy. I\'m trying to make this one at least a little more interesting! We\'re all about making [your core business area, e.g., content creation] less of a drag.`;
      }
      newMessageBody += `\\n\\n${humorSection}`;
      newMessageBody += `\\n\\nOn a slightly more serious note (just slightly!), we\'ve seen that when experts at companies like ${lead.company || 'yours'} share their actual insights, it resonates way more than generic stuff. Our platform is all about making that happen easily. Think of it as giving your company\'s brainiacs a megaphone, but without the awkwardness of actual public speaking for the introverts.`;
      newMessageBody += `\\n\\nWe\'ve helped teams in ${primaryIndustryGuess} not only produce more meaningful content but also cut down the time it takes by a good chunk. More high-quality chatter, less soul-crushing editing. Win-win, right?`;
      newSignature = newSignature.replace(/Best regards,|Sincerely,|Regards,/i, 'Hoping this made you chuckle (or at least not groan),');
      promptApplied = true;
    } 
    // Standalone: Longer
    else if (lowerPrompt.includes('longer')) {
      console.log("API: Applying 'longer' enhancements.");
      newMessageBody = newMessageBody.replace(/^Hi\\b|^Hello\\b|^Dear\\b/i, `Hi ${firstName},`);
      newMessageBody += `\\n\\nI wanted to elaborate a bit because I genuinely think there\'s a strong alignment here. In today\'s environment, generic content often gets lost in the noise. What we\'re focusing on is helping ${lead.company || 'companies like yours'} tap into the unique expertise you already have internally.`;
      newMessageBody += `\\n\\nMany ${leadJobFunction.includes('manager') || leadJobFunction.includes('director') || leadJobFunction.includes('vp') ? 'leaders' : 'professionals'} in ${primaryIndustryGuess} find that while they have valuable insights, the process of turning them into consistent, high-quality marketing assets is a major bottleneck. That\'s precisely the problem our AI-assisted platform aims to solve, by making expert-led content creation more scalable and efficient.`;
      if (lead.insights?.background?.[0]) {
        newMessageBody += `\\n\\nI also noticed your background in ${lead.insights.background[0]}, which is super relevant to this approach of authentic communication.`
      }
      promptApplied = true;
    }
    // Standalone: Funnier/Humor
    else if (lowerPrompt.includes('funnier') || lowerPrompt.includes('funny') || lowerPrompt.includes('humor')) {
      console.log("API: Applying 'funnier' enhancements.");
      newMessageBody = newMessageBody.replace(/^Hi\\b|^Hello\\b|^Dear\\b/i, `Hey ${firstName}!`);
      
      let joke = '';
      if (leadJobFunction.includes('sales')) {
        joke = 'Hope this email finds you before your coffee gets cold and your quota gets too scary. 😉';
      } else if (primaryIndustryGuess.toLowerCase().includes('finance')) {
        joke = 'Trying to add some \'interest\' to your inbox without mentioning compound rates!';
      } else {
        joke = 'My goal is to be the one email today that doesn\'t make you want to run for the hills (or at least, run for more coffee).';
      }
      newMessageBody = `${joke}\\n\\n${newMessageBody}`; // Prepend joke for impact

      if (lead.insights?.interests?.[0]) {
         newMessageBody += `\\n\\nP.S. Saw you\'re into ${lead.insights.interests[0]}. If our platform could also [do something funny related to interest], we\'d be billionaires. For now, it just makes awesome content!`;
      }
      newSignature = newSignature.replace(/Best regards,|Sincerely,|Regards,/i, 'May your inbox be light and your coffee strong,');
      promptApplied = true;
    }


    // --- Fallback / Default casual enhancement if no major prompt was strongly applied ---
    // This will only run if NO specific keywords above (including funny/longer) matched
    if (!promptApplied && !lowerPrompt.includes('professional')) {
      console.log("API: No specific strong prompt matched, applying default casual enhancements.");
      if (!newMessageBody.trim().toLowerCase().startsWith(`hi ${firstName.toLowerCase()}`) && !newMessageBody.trim().toLowerCase().startsWith(`hey ${firstName.toLowerCase()}`)) {
        newMessageBody = newMessageBody.replace(/^Dear\\b/i, `Hi ${firstName}`);
        newMessageBody = newMessageBody.replace(/^Hello\\b/i, `Hi ${firstName}`);
        newMessageBody = newMessageBody.replace(/^Hi\\s+(?!${firstName})/i, `Hi ${firstName}`); 
      }
      newMessageBody = newMessageBody.replace('I am writing to inform you', 'Just a quick heads-up');
      newMessageBody = newMessageBody.replace('I would like to inquire about', 'Was just wondering about');
      newMessageBody = newMessageBody.replace('utilize our services', 'try out what we offer');
      
      // Ensure signature is casual if we're in this block
      if (!newSignature.toLowerCase().includes('cheers') && !newSignature.toLowerCase().includes('talk soon') && !newSignature.toLowerCase().includes('best,')){
          newSignature = newSignature.replace(/Best regards|Regards|Sincerely/i, 'Cheers,');
      }

      if (lead.insights?.interests?.[0] && newMessageBody.length > 70 && !newMessageBody.toLowerCase().includes(lead.insights.interests[0].toLowerCase()) && !newMessageBody.includes('P.S.')) {
        newMessageBody += `\\n\\n(P.S. Saw you\'re into ${lead.insights.interests[0]} – cool stuff!)`;
      }
    }
    
    // Preserve user's company name in signature if it exists
    const userCompanyName = userBusinessInfo?.companyName;
    if (userCompanyName && userCompanyName !== '[Your Company]' && userCompanyName.trim() !== '') {
      // Check if signature already contains the company name
      if (!newSignature.includes(userCompanyName)) {
        // Add company name to signature
        newSignature = newSignature.replace('[Your Name]', `[Your Name]\n${userCompanyName}`);
      }
    }
    
    // Combine message body and signature
    const finalMessage = newMessageBody.trim() + '\n\n' + newSignature.trim();
    
    console.log("API: Successfully generated message.");
    return NextResponse.json({ 
      success: true, 
      message: finalMessage,
      usedAI: false
    });

  } catch (error) {
    console.error('API: Error in POST /api/generate-message:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    console.error(`API Error Details: ${errorMessage}\nStack: ${errorStack}`);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate message due to an internal server error.',
      details: errorMessage 
    }, { status: 500 });
  }
} 
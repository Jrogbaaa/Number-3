import { NextRequest, NextResponse } from 'next/server';
import { llamaClient } from '@/lib/llama';
import Replicate from 'replicate';

// Initialize Replicate client with API key from environment
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
console.log("API: Replicate API key configured:", REPLICATE_API_KEY ? "Yes (length: " + REPLICATE_API_KEY.length + ")" : "No");

const replicate = new Replicate({
  auth: REPLICATE_API_KEY,
});

const AI_HOST_NAME = "Alex (AI Host)";  
const AI_EXPERT_NAME = "Morgan (AI Expert)";

// Interface for debug information
interface DebugInfo {
  replicateApiKeyPresent?: boolean;
  modelId?: string;
  outputType?: string;
  outputIsArray?: boolean;
  outputIsString?: boolean;
  outputIsUnexpected?: boolean;
  outputLength?: number;
  outputSample?: string;
  replicateErrorMessage?: string;
  replicateErrorName?: string;
  noApiKey?: boolean;
  llamaAvailable?: boolean;
  outerErrorMessage?: string;
  outerErrorName?: string;
  [key: string]: any; // Allow for additional properties
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Received request to refine-script endpoint");
    
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("API: Failed to parse request JSON:", parseError);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON in request body',
        refinementStatus: "error_api" 
      }, { status: 400 });
    }
    
    const { currentScript, userPrompt } = requestBody;
    
    if (!currentScript || !userPrompt) {
      console.error("API: Missing parameters in request");
      return NextResponse.json({ 
        success: false, 
        error: 'currentScript and userPrompt are required',
        refinementStatus: "error_api" 
      }, { status: 400 });
    }
    
    console.log(`API: Refining script with prompt: "${userPrompt}"`);
    
    let refinedScript;
    let refinementStatus = "success";
    let refinementMessage = "Script refined successfully with Replicate API.";
    let debugInfo: DebugInfo = {};
    
    // Try to use Replicate API if configured
    if (REPLICATE_API_KEY) {
      try {
        console.log("API: Using Replicate for script refinement");
        debugInfo.replicateApiKeyPresent = true;
        
        // Use Llama-3 model with Replicate
        const model = "meta/llama-3-8b-instruct:2669038035d87286f952bf9490e97bb11e863ad97c42ee9ef51a0681d744cb89";
        debugInfo.modelId = model;
        
        const prompt = `
You are an expert in refining scripts for AI-generated podcast and video content. You'll help transform and improve a script based on user instructions.

ORIGINAL SCRIPT:
${currentScript}

USER REQUEST: ${userPrompt}

Transform the script according to the user request. Maintain the character names (${AI_HOST_NAME} and ${AI_EXPERT_NAME}) and the general structure, but modify the content based on the instruction.

IMPORTANT:
- Keep the formatting consistent with the original script 
- Preserve the speaker tags and voice style indicators like (professional) or (casual)
- Return ONLY the transformed script without any explanation
- Don't add commentary or notes about your changes
- Make sure the script sounds natural and conversational

TRANSFORMED SCRIPT:`;

        console.log("API: Calling Replicate with model:", model);
        
        // Call Replicate API with the same parameters as the working message generation
        const output = await replicate.run(model, { 
          input: { 
            prompt,
            system_prompt: "You are an expert script editor who specializes in AI conversation scripts.",
            temperature: 0.7,
            max_tokens: 2000,
          }
        });
        
        console.log("API: Replicate API response received, type:", typeof output);
        debugInfo.outputType = typeof output;
        
        // Process the output
        if (Array.isArray(output)) {
          console.log("API: Output is array with length:", output.length);
          debugInfo.outputIsArray = true;
          debugInfo.outputLength = output.length;
          refinedScript = output.join('');
        } else if (typeof output === 'string') {
          console.log("API: Output is string with length:", (output as string).length);
          debugInfo.outputIsString = true;
          debugInfo.outputLength = (output as string).length;
          refinedScript = output;
        } else {
          console.log("API: Unexpected output format from Replicate:", JSON.stringify(output).substring(0, 200));
          debugInfo.outputIsUnexpected = true;
          debugInfo.outputSample = JSON.stringify(output).substring(0, 100);
          throw new Error("Unexpected output format from Replicate API");
        }
        
        // Return the successfully refined script
        return NextResponse.json({ 
          success: true,
          refinedScript,
          refinementStatus,
          refinementMessage,
          debug: debugInfo
        });
        
      } catch (replicateError) {
        console.error("API: Error calling Replicate API:", replicateError);
        debugInfo.replicateErrorMessage = replicateError instanceof Error ? replicateError.message : String(replicateError);
        debugInfo.replicateErrorName = replicateError instanceof Error ? replicateError.name : 'UnknownError';
        
        // Fall back to simulation if Replicate API fails
        refinementStatus = "simulation_fallback";
        refinementMessage = `Error during Replicate API call: ${replicateError instanceof Error ? replicateError.message : 'Unknown error'}. Using simulation.`;
      }
    } else {
      // If Replicate API key is not configured, check if local Llama is available
      debugInfo.noApiKey = true;
      console.log("API: No Replicate API key found, checking local Llama availability");
      
      try {
        const isLlamaAvailable = await llamaClient.isAvailable();
        debugInfo.llamaAvailable = isLlamaAvailable;
        
        if (isLlamaAvailable) {
          console.log("API: Using local Llama server");
          refinedScript = await llamaClient.refineScript(currentScript, userPrompt);
          refinementMessage = "Script refined successfully with local Llama server.";
          
          return NextResponse.json({ 
            success: true,
            refinedScript,
            refinementStatus,
            refinementMessage,
            debug: debugInfo
          });
        } else {
          console.warn('API: Neither Replicate API key nor Llama server available');
          refinementStatus = "simulation_fallback";
          refinementMessage = "Replicate API key not found and Llama server not available. Using simulation.";
        }
      } catch (llamaError) {
        console.error("API: Error with local Llama server:", llamaError);
        debugInfo.llamaErrorMessage = llamaError instanceof Error ? llamaError.message : String(llamaError);
        
        refinementStatus = "simulation_fallback";
        refinementMessage = `Error with local Llama server: ${llamaError instanceof Error ? llamaError.message : 'Unknown error'}. Using simulation.`;
      }
    }
    
    // If we reach this point, we need to use simulation fallback
    console.log("API: Using script refinement simulation");
    refinedScript = simulateRefinement(currentScript, userPrompt);
    
    return NextResponse.json({ 
      success: true,
      refinedScript,
      refinementStatus,
      refinementMessage,
      debug: debugInfo
    });
    
  } catch (error) {
    console.error('Error in /api/refine-script:', error);
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ 
      success: false,
      error: errorMessage, 
      refinementStatus: "error_api", 
      refinementMessage: "An error occurred in the refinement API.",
      debug: { 
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorStack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}

// Simulation function as fallback
function simulateRefinement(currentScript: string, userPrompt: string): string {
  let refinedScript = currentScript;
  
  // Simple simulation logic
  if (userPrompt.toLowerCase().includes('shorter') || userPrompt.toLowerCase().includes('concise')) {
    const lines = currentScript.split('\n');
    refinedScript = lines.slice(0, Math.max(1, Math.floor(lines.length * 0.7))).join('\n') + 
                    '\n\n--- Script made shorter (simulation) ---';
  } else if (userPrompt.toLowerCase().includes('voice') || userPrompt.toLowerCase().includes('tone')) {
    refinedScript = currentScript.replace(/\((professional|casual|friendly|authoritative)\)/g, '(energetic)') + 
                    '\n\n--- Voice style changed to energetic (simulation) ---';
  } else if (userPrompt.toLowerCase().includes('add a point about')) {
    const pointToAdd = userPrompt.split('add a point about')[1]?.trim();
    refinedScript = currentScript + 
                    `\n\n**${AI_EXPERT_NAME}:** (professional) Regarding your point on ${pointToAdd || 'the requested topic'}, that's an excellent consideration. We should also note its impact on overall market sentiment and investor confidence.\n--- Added point (simulation) ---`;
  } else if (userPrompt.toLowerCase().includes('longer')) {
    // Add extra segments for "make it longer" request
    const lines = currentScript.split('\n');
    const insertPoint = Math.floor(lines.length * 0.7); // Insert near the end but before conclusion
    
    const additionalContent = `\n**${AI_HOST_NAME}:** (professional) That's fascinating. Could you elaborate on how this might impact individual investors?\n\n` +
                             `**${AI_EXPERT_NAME}:** (professional) Certainly, ${AI_HOST_NAME}. Individual investors should consider these trends when building their portfolios. Diversification becomes even more critical in this environment, and staying informed about sector-specific developments can reveal unique opportunities.\n\n` +
                             `**${AI_HOST_NAME}:** (professional) Are there specific sectors that might outperform in this context?\n\n` +
                             `**${AI_EXPERT_NAME}:** (professional) Several sectors show promise, particularly those involved in technological innovation, sustainable energy, and healthcare advancement. Companies with strong fundamentals and adaptable business models tend to weather market fluctuations more effectively.`;
    
    // Insert the additional content before the last few lines (conclusion)
    const firstPart = lines.slice(0, insertPoint);
    const lastPart = lines.slice(insertPoint);
    refinedScript = [...firstPart, additionalContent, ...lastPart].join('\n') + 
                   '\n\n--- Script made longer (simulation) ---';
  } else {
    // Default simulation
    refinedScript = currentScript + 
                    `\n\n--- AI Refinement Simulation --- \nApplied changes based on: "${userPrompt}"\n(Simulation mode - Llama server may not be available or an error occurred)\n`;
  }
  
  return refinedScript;
} 
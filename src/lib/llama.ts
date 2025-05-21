import { OpenAI } from 'openai';

class LlamaClient {
  private client: OpenAI;
  
  constructor() {
    // Initialize the OpenAI client with custom base URL pointing to a local Llama server
    // Users will need to run a server like llama.cpp's server or LM Studio on their machine
    this.client = new OpenAI({
      baseURL: process.env.LLAMA_API_BASE || 'http://localhost:8080/v1', // Default port for many Llama servers
      apiKey: process.env.LLAMA_API_KEY || 'sk-no-key-required', // Some servers don't need a key
    });
  }

  async refineScript(script: string, prompt: string): Promise<string> {
    try {
      // Format the prompt for script refinement
      const systemPrompt = 
        "You are an AI assistant that helps refine scripts for video content. " +
        "Modify the script according to the user's instructions. " +
        "Return ONLY the refined script without any additional explanations.";
      
      const response = await this.client.chat.completions.create({
        model: process.env.LLAMA_MODEL_NAME || 'llama2', // Model name as configured in the local server
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `ORIGINAL SCRIPT:\n${script}\n\nUSER REQUEST:\n${prompt}\n\nPlease refine the script based on this request.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      
      // Extract the refined script from the response
      const refinedScript = response.choices[0]?.message?.content?.trim() || '';
      
      return refinedScript;
    } catch (error) {
      console.error('Error refining script with Llama:', error);
      
      // Check if this is a connection error to the Llama server
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        throw new Error('Could not connect to the Llama server. Please ensure it is running at the configured URL.');
      }
      
      throw new Error('Failed to refine script with Llama');
    }
  }
  
  // Method to check if the Llama server is available
  async isAvailable(): Promise<boolean> {
    const modelsUrl = `${this.client.baseURL}/models`; // Construct the full URL
    try {
      // Simple models endpoint check
      console.log(`Attempting to connect to Llama server at: ${modelsUrl}`); // Log the URL
      await this.client.models.list();
      console.log(`Successfully connected to Llama server at: ${modelsUrl}`);
      return true;
    } catch (error) {
      console.error(`Llama server not available at: ${modelsUrl}. Error:`, error);
      return false;
    }
  }
}

// Export a singleton instance
export const llamaClient = new LlamaClient(); 
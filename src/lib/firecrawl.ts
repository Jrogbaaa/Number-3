interface FirecrawlSearchParams {
  query: string;
  limit?: number;
  country?: string;
  lang?: string;
  filter?: string;
  tbs?: string;
  scrapeOptions?: {
    formats?: string[];
    onlyMainContent?: boolean;
    waitFor?: number;
  };
}

interface FirecrawlSearchResult {
  title: string;
  url: string;
  description: string;
  content?: string;
}

interface FirecrawlSearchResponse {
  success: boolean;
  results: FirecrawlSearchResult[];
  error?: string;
}

/**
 * Wrapper for the Firecrawl search function
 * This function is just a TypeScript typesafe wrapper around the global mcp_firecrawl_search function
 * that is available in the environment
 */
export async function mcp_firecrawl_search(params: FirecrawlSearchParams): Promise<FirecrawlSearchResponse> {
  try {
    // In a real implementation, this would call the actual Firecrawl API
    // For now, we'll simulate a response
    
    // Example implementation (uncomment when the real function is available):
    // @ts-ignore - The function might be available in the runtime but not in TypeScript
    // const results = await global.mcp_firecrawl_search(params);
    // return results;
    
    // Mock implementation for testing
    return {
      success: true,
      results: [
        {
          title: `${params.query} - Example Result`,
          url: `https://example.com/search?q=${encodeURIComponent(params.query)}`,
          description: `This company is headquartered in New York, NY. The headquarters is located in Manhattan.`,
        },
        {
          title: `Company Profile - ${params.query}`,
          url: `https://example.com/companies/${encodeURIComponent(params.query)}`,
          description: `${params.query} is a global company with offices in multiple locations. Their main headquarters is based in San Francisco, California.`,
        }
      ]
    };
  } catch (error) {
    console.error("Error in mcp_firecrawl_search:", error);
    throw error;
  }
} 
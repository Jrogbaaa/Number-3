/**
 * Cloud Run API utility for offloading heavy processing
 */

export interface CloudRunConfig {
  baseUrl: string;
  timeout?: number;
}

class CloudRunClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: CloudRunConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Make a request to Cloud Run API
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Cloud Run API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Cloud Run request timeout after ${this.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Upload and process leads via Cloud Run
   */
  async uploadLeads(data: {
    file: File;
    userId: string;
    sessionToken?: string;
  }) {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('userId', data.userId);
    
    if (data.sessionToken) {
      formData.append('sessionToken', data.sessionToken);
    }

    return this.makeRequest('/api/upload-leads', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }

  /**
   * Scrape website content via Cloud Run
   */
  async scrapeWebsite(data: {
    url: string;
    type: 'website' | 'linkedin';
    sessionToken?: string;
  }) {
    const headers: Record<string, string> = {};
    if (data.sessionToken) {
      headers['Authorization'] = `Bearer ${data.sessionToken}`;
    }

    return this.makeRequest('/api/scrape-website', {
      method: 'POST',
      body: JSON.stringify(data),
      headers
    });
  }

  /**
   * Rescore leads via Cloud Run
   */
  async rescoreLeads(data: {
    userId: string;
    sessionToken?: string;
  }) {
    const headers: Record<string, string> = {};
    if (data.sessionToken) {
      headers['Authorization'] = `Bearer ${data.sessionToken}`;
    }

    return this.makeRequest('/api/rescore-leads', {
      method: 'POST',
      body: JSON.stringify(data),
      headers
    });
  }

  /**
   * Generate HeyGen video via Cloud Run
   */
  async createHeygenVideo(data: {
    leadId: string;
    script: string;
    sessionToken?: string;
  }) {
    const headers: Record<string, string> = {};
    if (data.sessionToken) {
      headers['Authorization'] = `Bearer ${data.sessionToken}`;
    }

    return this.makeRequest('/api/create-heygen-video', {
      method: 'POST',
      body: JSON.stringify(data),
      headers
    });
  }

  /**
   * Health check for Cloud Run service
   */
  async healthCheck() {
    try {
      await this.makeRequest('/health', { method: 'GET' });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Get Cloud Run client instance
 */
export function getCloudRunClient(): CloudRunClient {
  const cloudRunUrl = process.env.NEXT_PUBLIC_CLOUD_RUN_URL || process.env.CLOUD_RUN_API_URL;
  
  if (!cloudRunUrl) {
    throw new Error('Cloud Run URL not configured. Please set NEXT_PUBLIC_CLOUD_RUN_URL or CLOUD_RUN_API_URL');
  }

  return new CloudRunClient({
    baseUrl: cloudRunUrl,
    timeout: 60000, // 60 seconds for heavy processing
  });
}

/**
 * Check if Cloud Run should be used for this operation
 */
export function shouldUseCloudRun(): boolean {
  return !!(process.env.NEXT_PUBLIC_CLOUD_RUN_URL || process.env.CLOUD_RUN_API_URL);
}

/**
 * Fallback to Vercel API if Cloud Run is unavailable
 */
export async function apiWithFallback<T>(
  cloudRunOperation: () => Promise<T>,
  vercelFallback: () => Promise<T>
): Promise<T> {
  if (!shouldUseCloudRun()) {
    return vercelFallback();
  }

  try {
    const client = getCloudRunClient();
    const isHealthy = await client.healthCheck();
    
    if (!isHealthy) {
      console.warn('Cloud Run health check failed, falling back to Vercel');
      return vercelFallback();
    }

    return await cloudRunOperation();
  } catch (error) {
    console.error('Cloud Run operation failed, falling back to Vercel:', error);
    return vercelFallback();
  }
} 
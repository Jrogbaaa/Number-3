const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY!;
const HEYGEN_API_URL = 'https://api.heygen.com/v1';

export const HeygenClient = {
  async createPodcast(script: string, duration: number, format: string) {
    try {
      const response = await fetch(`${HEYGEN_API_URL}/podcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HEYGEN_API_KEY}`,
        },
        body: JSON.stringify({
          script,
          duration,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating podcast:', error);
      throw error;
    }
  },

  async createVideo(script: string, avatar: string) {
    try {
      const response = await fetch(`${HEYGEN_API_URL}/video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HEYGEN_API_KEY}`,
        },
        body: JSON.stringify({
          script,
          avatar,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  },
}; 
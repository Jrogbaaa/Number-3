import { NextRequest } from 'next/server';
import { POST } from '@/app/api/generate-message/route';

// Mock Replicate
jest.mock('replicate', () => {
  return jest.fn().mockImplementation(() => {
    return {
      run: jest.fn().mockResolvedValue('This is a transformed message from Replicate API.')
    };
  });
});

describe('Generate Message API Route', () => {
  const mockLead = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Inc',
    title: 'Marketing Director',
  };

  const mockBaseMessage = `Hi [Name],

I hope this email finds you well. I wanted to reach out because I think our solution could really help with your marketing efforts.

Would you be open to a quick 10-15 min chat sometime?

Best regards,
[Your Name]`;

  it('should return 400 if required parameters are missing', async () => {
    // Missing customPrompt
    const req = new NextRequest('http://localhost:3000/api/generate-message', {
      method: 'POST',
      body: JSON.stringify({
        baseMessage: mockBaseMessage,
        lead: mockLead,
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required parameters');
  });

  it('should successfully transform a message with rule-based approach', async () => {
    // Create request
    const req = new NextRequest('http://localhost:3000/api/generate-message', {
      method: 'POST',
      body: JSON.stringify({
        baseMessage: mockBaseMessage,
        customPrompt: 'make it more professional',
        lead: mockLead,
      }),
    });

    // Save original environment variable
    const originalEnv = process.env.REPLICATE_API_KEY;
    // Ensure REPLICATE_API_KEY is not set to force rule-based approach
    delete process.env.REPLICATE_API_KEY;

    const response = await POST(req);
    const data = await response.json();

    // Restore environment variable
    process.env.REPLICATE_API_KEY = originalEnv;

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Dear John');
    expect(data.usedAI).toBe(false);
  });

  it('should use Replicate API if available', async () => {
    // Create request
    const req = new NextRequest('http://localhost:3000/api/generate-message', {
      method: 'POST',
      body: JSON.stringify({
        baseMessage: mockBaseMessage,
        customPrompt: 'make it more conversational',
        lead: mockLead,
      }),
    });

    // Set mock REPLICATE_API_KEY
    process.env.REPLICATE_API_KEY = 'test-api-key';

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('This is a transformed message from Replicate API');
    expect(data.usedAI).toBe(true);
  });

  it('should fall back to rule-based approach if Replicate API fails', async () => {
    // Mock Replicate to throw an error
    jest.requireMock('replicate').mockImplementation(() => {
      return {
        run: jest.fn().mockRejectedValue(new Error('API Error'))
      };
    });

    // Create request
    const req = new NextRequest('http://localhost:3000/api/generate-message', {
      method: 'POST',
      body: JSON.stringify({
        baseMessage: mockBaseMessage,
        customPrompt: 'make it conversational',
        lead: mockLead,
      }),
    });

    // Set mock REPLICATE_API_KEY
    process.env.REPLICATE_API_KEY = 'test-api-key';

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.usedAI).toBe(false);
  });
}); 
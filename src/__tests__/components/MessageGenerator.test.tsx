import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageGenerator } from '@/components/shared/MessageGenerator';
import '@testing-library/jest-dom';
import { toast } from 'sonner';

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'test-user-id' } },
    status: 'authenticated'
  })
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the fetch function
global.fetch = jest.fn();

// Mock lead data
const mockLead = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Acme Inc',
  title: 'Marketing Director',
  score: 85,
  source: 'LinkedIn' as const,
  status: 'New' as const,
  value: 5000,
  created_at: '2024-01-01',
  insights: {
    interests: ['AI', 'Marketing'],
    topics: ['Content Marketing'],
  },
};

describe('MessageGenerator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (toast.error as jest.Mock).mockClear();
    (toast.success as jest.Mock).mockClear();
    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Transformed message content',
      }),
    });
  });

  it('renders the component correctly', () => {
    render(<MessageGenerator leads={[mockLead]} selectedLeadId={mockLead.id} />);
    
    // Check if the component renders with expected elements
    expect(screen.getByText(/outreach message generator/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Hey John/)).toBeInTheDocument();
    expect(screen.getByText(/try these example prompts/i)).toBeInTheDocument();
  });

  it('allows users to enter custom prompts', () => {
    render(<MessageGenerator leads={[mockLead]} selectedLeadId={mockLead.id} />);
    
    const input = screen.getByPlaceholderText(/make it shorter, funnier, add urgency/i);
    fireEvent.change(input, { target: { value: 'make it more conversational' } });
    
    expect(input).toHaveValue('make it more conversational');
  });

  it('calls the API when the customize button is clicked', async () => {
    render(<MessageGenerator leads={[mockLead]} selectedLeadId={mockLead.id} />);
    
    // Enter a custom prompt
    const input = screen.getByPlaceholderText(/make it shorter, funnier, add urgency/i);
    fireEvent.change(input, { target: { value: 'make it more conversational' } });
    
    // Click the customize button
    const button = screen.getByRole('button', { name: /apply prompt/i });
    fireEvent.click(button);
    
    // Verify API was called with correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate-message'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('make it more conversational'),
        })
      );
    });
  });

  it('displays the transformed message after successful API call', async () => {
    render(<MessageGenerator leads={[mockLead]} selectedLeadId={mockLead.id} />);
    
    // Submit a custom prompt
    const input = screen.getByPlaceholderText(/make it shorter, funnier, add urgency/i);
    fireEvent.change(input, { target: { value: 'make it more conversational' } });
    
    const button = screen.getByRole('button', { name: /apply prompt/i });
    fireEvent.click(button);
    
    // Check that transformed message is displayed
    await waitFor(() => {
      expect(screen.getByText(/transformed message content/i)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        error: 'Server error',
      }),
    });
    
    render(<MessageGenerator leads={[mockLead]} selectedLeadId={mockLead.id} />);
    
    // Submit a custom prompt
    const input = screen.getByPlaceholderText(/make it shorter, funnier, add urgency/i);
    fireEvent.change(input, { target: { value: 'make it more conversational' } });
    
    const button = screen.getByRole('button', { name: /apply prompt/i });
    fireEvent.click(button);
    
    // Check that error toast was called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to generate message')
      );
    });
  });
}); 
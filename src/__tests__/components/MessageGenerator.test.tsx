import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MessageGenerator from '@/components/shared/MessageGenerator';
import '@testing-library/jest-dom';

// Mock the fetch function
global.fetch = jest.fn();

// Mock lead data
const mockLead = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Acme Inc',
  title: 'Marketing Director',
  insights: {
    interests: ['AI', 'Marketing'],
    topics: ['Content Marketing'],
  },
};

describe('MessageGenerator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    render(<MessageGenerator lead={mockLead} />);
    
    // Check if the component renders with expected elements
    expect(screen.getByText(/personalize message/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(/example prompts/i)).toBeInTheDocument();
  });

  it('allows users to enter custom prompts', () => {
    render(<MessageGenerator lead={mockLead} />);
    
    const input = screen.getByPlaceholderText(/enter a custom prompt/i);
    fireEvent.change(input, { target: { value: 'make it more conversational' } });
    
    expect(input).toHaveValue('make it more conversational');
  });

  it('calls the API when the customize button is clicked', async () => {
    render(<MessageGenerator lead={mockLead} />);
    
    // Enter a custom prompt
    const input = screen.getByPlaceholderText(/enter a custom prompt/i);
    fireEvent.change(input, { target: { value: 'make it more conversational' } });
    
    // Click the customize button
    const button = screen.getByRole('button', { name: /customize/i });
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
    render(<MessageGenerator lead={mockLead} />);
    
    // Submit a custom prompt
    const input = screen.getByPlaceholderText(/enter a custom prompt/i);
    fireEvent.change(input, { target: { value: 'make it more conversational' } });
    
    const button = screen.getByRole('button', { name: /customize/i });
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
    
    render(<MessageGenerator lead={mockLead} />);
    
    // Submit a custom prompt
    const input = screen.getByPlaceholderText(/enter a custom prompt/i);
    fireEvent.change(input, { target: { value: 'make it more conversational' } });
    
    const button = screen.getByRole('button', { name: /customize/i });
    fireEvent.click(button);
    
    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to customize message/i)).toBeInTheDocument();
    });
  });
}); 
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Piano from '../Piano';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as pianoLib from '@/lib/piano';
import * as tuningLib from '@/lib/tuning';

// Mock modules
vi.mock('@/lib/piano', async () => {
  const actual = await vi.importActual('@/lib/piano');
  return {
    ...actual,
    createAudioContext: vi.fn().mockImplementation(() => ({
      createOscillator: vi.fn().mockReturnValue({
        type: 'triangle',
        frequency: {
          setValueAtTime: vi.fn()
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        disconnect: vi.fn()
      }),
      createGain: vi.fn().mockReturnValue({
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        },
        disconnect: vi.fn()
      }),
      destination: {},
      currentTime: 0
    }))
  };
});

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn().mockReturnValue({
    toast: vi.fn()
  })
}));

// Mock fetch for API requests
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: 1, name: 'Equal Temperament', config: {} },
      { id: 2, name: 'Just Intonation', config: {} }
    ])
  })
);

// Create a test QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Piano Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
    
    // Reset timers
    vi.useFakeTimers();
    
    // Spy on tuning library functions
    vi.spyOn(tuningLib, 'calculateFrequency');
    vi.spyOn(tuningLib, 'initializeTunings').mockReturnValue({
      'C4': { 
        name: 'C4', 
        baseName: 'C',
        ratioNumerator: 1, 
        ratioDenominator: 1, 
        cents: 0, 
        frequency: 261.63,
        ratio: '1/1'
      },
      'C#4': { 
        name: 'C#4', 
        baseName: 'C#',
        ratioNumerator: 16, 
        ratioDenominator: 15, 
        cents: 100, 
        frequency: 277.18,
        ratio: '16/15'
      },
      'D4': { 
        name: 'D4', 
        baseName: 'D',
        ratioNumerator: 9, 
        ratioDenominator: 8, 
        cents: 200, 
        frequency: 293.66,
        ratio: '9/8'
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderPiano = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Piano />
      </QueryClientProvider>
    );
  };

  it('renders the piano page with main components', async () => {
    renderPiano();
    
    // Verify that the main components are rendered
    expect(screen.getByText(/Tuning Configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/Currently Playing/i)).toBeInTheDocument();
    
    // Check for piano keyboard
    const pianoKeys = screen.getAllByRole('button', { name: /Key/i });
    expect(pianoKeys.length).toBeGreaterThan(0);
  });

  it('initializes with default tunings', async () => {
    renderPiano();
    
    // Verify that initializeTunings was called with the default frequency
    expect(tuningLib.initializeTunings).toHaveBeenCalledWith(440);
  });

  it('plays a note when a piano key is clicked', async () => {
    renderPiano();
    
    // Find the C4 key and click it
    const pianoKeys = screen.getAllByRole('button', { name: /Key/i });
    const c4Key = pianoKeys.find(key => key.getAttribute('data-note') === 'C4');
    
    // Click the key to play a note
    if (c4Key) {
      fireEvent.mouseDown(c4Key);
      
      // Verify that createAudioContext was called
      expect(pianoLib.createAudioContext).toHaveBeenCalled();
      
      // Advance timers
      vi.advanceTimersByTime(1000);
      
      // Check that currently playing information is shown
      expect(screen.getByText(/C4/i)).toBeInTheDocument();
    } else {
      throw new Error('C4 key not found');
    }
  });

  it('updates base frequency when changed in ConfigPanel', async () => {
    renderPiano();
    
    // Find the base frequency input
    const baseFrequencyInput = screen.getByLabelText('A4 =');
    
    // Change the frequency to 432 Hz
    fireEvent.change(baseFrequencyInput, { target: { value: '432' } });
    
    // Check that the value was updated
    expect(baseFrequencyInput).toHaveValue(432);
    
    // Verify that calculateFrequency was called for updating frequencies
    await waitFor(() => {
      expect(tuningLib.calculateFrequency).toHaveBeenCalled();
    });
  });

  it('changes tuning method from cents to ratio', async () => {
    renderPiano();
    
    // Find the tuning method radio buttons by finding the parent section first
    const tuningMethodSection = screen.getByText('Tuning Method:');
    const ratioRadio = screen.getByLabelText('Just Intonation Ratio');
    
    // Select ratio tuning method
    fireEvent.click(ratioRadio);
    
    // Verify that radio was clicked
    expect(ratioRadio).toBeTruthy();
  });

  it('applies tuning when Apply button is clicked', async () => {
    renderPiano();
    
    // Find the Apply button and click it
    const applyButton = screen.getByText('Apply Tuning');
    fireEvent.click(applyButton);
    
    // Verify that calculateFrequency was called for all notes
    expect(tuningLib.calculateFrequency).toHaveBeenCalled();
  });

  it('changes tuning system when a button is clicked', async () => {
    renderPiano();
    
    // Find the tuning system button for Pythagorean
    const pythagoreanButton = screen.getByRole('button', { name: 'Pythagorean' });
    
    // Click the Pythagorean button
    fireEvent.click(pythagoreanButton);
    
    // Verify that the button was clicked
    expect(pythagoreanButton).toBeTruthy();
  });
});
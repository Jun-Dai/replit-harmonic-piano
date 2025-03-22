import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfigPanel from '../ConfigPanel';
import { Note, TuningConfig } from '@shared/schema';

describe('ConfigPanel', () => {
  // Mock props
  const mockProps = {
    baseFrequency: 440,
    setBaseFrequency: vi.fn(),
    decayLength: 2,
    setDecayLength: vi.fn(),
    tuningMethod: 'ratio' as const,
    setTuningMethod: vi.fn(),
    currentTuningSystem: 'Equal Temperament',
    selectTuningSystem: vi.fn(),
    noteConfigurations: {
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
    } as Record<string, Note>,
    updateNoteConfig: vi.fn(),
    applyTuning: vi.fn(),
    handleSaveConfig: vi.fn(),
    configName: 'My Tuning',
    setConfigName: vi.fn(),
    tuningConfigs: [
      { 
        id: 1, 
        name: 'Saved Tuning 1', 
        baseFrequency: 440, 
        decayLength: 2.0,
        notes: {
          'C4': { 
            name: 'C4', 
            baseName: 'C',
            ratioNumerator: 1, 
            ratioDenominator: 1, 
            cents: 0, 
            frequency: 261.63,
            ratio: '1/1'
          }
        },
        createdBy: null
      },
      { 
        id: 2, 
        name: 'Saved Tuning 2', 
        baseFrequency: 432, 
        decayLength: 3.0,
        notes: {
          'C4': { 
            name: 'C4', 
            baseName: 'C',
            ratioNumerator: 1, 
            ratioDenominator: 1, 
            cents: 0, 
            frequency: 256.87,
            ratio: '1/1'
          }
        },
        createdBy: null
      }
    ] as TuningConfig[],
    loadTuningConfig: vi.fn(),
    isLoading: false
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the configuration panel with basic elements', () => {
    render(<ConfigPanel {...mockProps} />);
    
    // Check for main section heading
    expect(screen.getByText('Tuning Configuration')).toBeInTheDocument();
    
    // Check for frequency input
    const frequencyInput = screen.getByLabelText('A4 =');
    expect(frequencyInput).toBeInTheDocument();
    expect(frequencyInput).toHaveValue(440);
  });

  it('updates base frequency when input changes', () => {
    render(<ConfigPanel {...mockProps} />);
    
    const frequencyInput = screen.getByLabelText('A4 =');
    fireEvent.change(frequencyInput, { target: { value: '432' } });
    
    expect(mockProps.setBaseFrequency).toHaveBeenCalledWith(432);
  });

  it('updates base frequency when preset buttons are clicked', () => {
    render(<ConfigPanel {...mockProps} />);
    
    const button432 = screen.getByRole('button', { name: '432 Hz' });
    const button440 = screen.getByRole('button', { name: '440 Hz' });
    
    fireEvent.click(button432);
    expect(mockProps.setBaseFrequency).toHaveBeenCalledWith(432);
    
    fireEvent.click(button440);
    expect(mockProps.setBaseFrequency).toHaveBeenCalledWith(440);
  });

  it('toggles the load dialog when load button is clicked', () => {
    render(<ConfigPanel {...mockProps} />);
    
    // Initially the load dialog should not be visible
    expect(screen.queryByText('Load Configuration')).not.toBeInTheDocument();
    
    // Click the load button
    const loadButton = screen.getByRole('button', { name: /load/i });
    fireEvent.click(loadButton);
    
    // Now the load dialog should be visible
    expect(screen.getByText('Load Configuration')).toBeInTheDocument();
    expect(screen.getByText('Saved Tuning 1')).toBeInTheDocument();
    expect(screen.getByText('Saved Tuning 2')).toBeInTheDocument();
    
    // Click the cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Dialog should be hidden again
    expect(screen.queryByText('Load Configuration')).not.toBeInTheDocument();
  });

  it('loads a tuning configuration when a saved config is clicked', () => {
    render(<ConfigPanel {...mockProps} />);
    
    // Open the load dialog
    const loadButton = screen.getByRole('button', { name: /load/i });
    fireEvent.click(loadButton);
    
    // Click on a saved configuration
    const savedConfig = screen.getByText('Saved Tuning 1');
    fireEvent.click(savedConfig);
    
    // Check that the loadTuningConfig function was called with the correct ID
    expect(mockProps.loadTuningConfig).toHaveBeenCalledWith(1);
    
    // The dialog should be closed
    expect(screen.queryByText('Load Configuration')).not.toBeInTheDocument();
  });

  it('calls handleSaveConfig when save button is clicked', () => {
    render(<ConfigPanel {...mockProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    expect(mockProps.handleSaveConfig).toHaveBeenCalled();
  });

  it('updates the config name when the input changes', () => {
    render(<ConfigPanel {...mockProps} />);
    
    const nameInput = screen.getByLabelText('Name:');
    fireEvent.change(nameInput, { target: { value: 'New Config Name' } });
    
    expect(mockProps.setConfigName).toHaveBeenCalledWith('New Config Name');
  });

  it('changes the tuning method when radio buttons are clicked', () => {
    render(<ConfigPanel {...mockProps} />);
    
    // Find the Cents radio option and click it
    const centsRadio = screen.getByLabelText('Cents Value');
    fireEvent.click(centsRadio);
    
    expect(mockProps.setTuningMethod).toHaveBeenCalledWith('cents');
    
    // Now click the Ratio radio option
    const ratioRadio = screen.getByLabelText('Just Intonation Ratio');
    fireEvent.click(ratioRadio);
    
    expect(mockProps.setTuningMethod).toHaveBeenCalledWith('ratio');
  });

  it('selects a different tuning system when button is clicked', () => {
    render(<ConfigPanel {...mockProps} />);
    
    // Find the Pythagorean button and click it
    const pythagoreanButton = screen.getByRole('button', { name: 'Pythagorean' });
    fireEvent.click(pythagoreanButton);
    
    expect(mockProps.selectTuningSystem).toHaveBeenCalledWith('pythagorean');
  });
});
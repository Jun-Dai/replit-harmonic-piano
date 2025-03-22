import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TuningTheoryModal from '../TuningTheoryModal';

describe('TuningTheoryModal', () => {
  it('renders with Equal Temperament information by default', () => {
    render(<TuningTheoryModal currentTuningSystem="Equal Temperament" />);
    
    // The button to open the modal should mention the tuning system
    const button = screen.getByRole('button', { name: /learn about equal temperament/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with the correct Centaur tuning information', () => {
    render(<TuningTheoryModal currentTuningSystem="7-limit Centaur" />);
    
    // Check that the button mentions the correct tuning system
    const button = screen.getByRole('button', { name: /learn about 7-limit centaur/i });
    expect(button).toBeInTheDocument();
    
    // Open the modal by clicking the button
    fireEvent.click(button);
    
    // Now check that the Centaur specific content is displayed
    expect(screen.getByText('7-limit Centaur')).toBeInTheDocument();
    expect(screen.getByText('A modern just intonation tuning system utilizing harmonics up to the 7th.')).toBeInTheDocument();
  });
  
  it('shows different content based on the selected tab', () => {
    render(<TuningTheoryModal currentTuningSystem="Just Intonation" />);
    
    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /learn about just intonation/i }));
    
    // Check that the theory tab is open by default
    expect(screen.getByText('Musical Theory')).toBeInTheDocument();
    expect(screen.getByText(/Just intonation builds intervals using simple whole-number ratios/)).toBeInTheDocument();
    
    // Click on the mathematics tab
    fireEvent.click(screen.getByRole('tab', { name: /mathematics/i }));
    
    // Check that the mathematics content is now visible
    expect(screen.getByText('Mathematical Basis')).toBeInTheDocument();
    expect(screen.getByText(/Just intonation ratios are expressed as simple fractions/)).toBeInTheDocument();
    
    // Click on the history tab
    fireEvent.click(screen.getByRole('tab', { name: /history/i }));
    
    // Check that the history content is now visible
    expect(screen.getByText('Historical Context')).toBeInTheDocument();
    expect(screen.getByText(/Just intonation is one of the oldest tuning systems/)).toBeInTheDocument();
    
    // Click on the examples tab
    fireEvent.click(screen.getByRole('tab', { name: /examples/i }));
    
    // Check that the examples content is now visible
    expect(screen.getByText('Practical Examples')).toBeInTheDocument();
    expect(screen.getByText(/A major chord \(C-E-G\) in just intonation/)).toBeInTheDocument();
  });
  
  it('handles unknown tuning systems by defaulting to Equal Temperament', () => {
    render(<TuningTheoryModal currentTuningSystem="Unknown System" />);
    
    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /learn about unknown system/i }));
    
    // Should default to Equal Temperament content
    expect(screen.getByText('Equal Temperament')).toBeInTheDocument();
    expect(screen.getByText('The standard 12-tone equal division of the octave used in modern Western music.')).toBeInTheDocument();
  });
});
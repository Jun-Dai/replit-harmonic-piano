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
    
    // Verify that we're on the theory tab with correct content
    const theoryTab = screen.getByRole('tab', { name: /theory/i });
    expect(theoryTab).toHaveAttribute('aria-selected', 'true');
    
    // Click on the mathematics tab
    const mathTab = screen.getByRole('tab', { name: /mathematics/i });
    fireEvent.click(mathTab);
    
    // Verify the mathematics tab is selected and shows the right content
    expect(mathTab).toHaveAttribute('aria-selected', 'true');
    expect(theoryTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText(/just intonation ratios are expressed as simple fractions/i)).toBeInTheDocument();
    
    // Click on the history tab
    const historyTab = screen.getByRole('tab', { name: /history/i });
    fireEvent.click(historyTab);
    
    // Verify the history tab is selected
    expect(historyTab).toHaveAttribute('aria-selected', 'true');
    expect(mathTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText(/just intonation is one of the oldest tuning systems/i)).toBeInTheDocument();
    
    // Click on the examples tab
    const examplesTab = screen.getByRole('tab', { name: /examples/i });
    fireEvent.click(examplesTab);
    
    // Verify the examples tab is selected
    expect(examplesTab).toHaveAttribute('aria-selected', 'true');
    expect(historyTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText(/a major chord.*in just intonation/i)).toBeInTheDocument();
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
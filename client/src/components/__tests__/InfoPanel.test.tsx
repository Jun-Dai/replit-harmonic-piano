import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InfoPanel from '../InfoPanel';

describe('InfoPanel', () => {
  it('should render with no currently playing note', () => {
    render(<InfoPanel currentlyPlaying={null} />);
    
    // Check that the component renders with default values
    expect(screen.getByText('Currently Playing')).toBeInTheDocument();
    
    // Use getAllByText since there are multiple '-' placeholders
    const dashPlaceholders = screen.getAllByText('-');
    expect(dashPlaceholders.length).toBeGreaterThan(0);
  });
  
  it('should display currently playing note information', () => {
    const mockPlaying = {
      note: 'A4',
      frequency: 440.00,
      tuning: 'Equal Temperament'
    };
    
    render(<InfoPanel currentlyPlaying={mockPlaying} />);
    
    // Check that the note information is displayed
    expect(screen.getByText('A4')).toBeInTheDocument();
    expect(screen.getByText('440.00 Hz')).toBeInTheDocument();
    expect(screen.getByText('Equal Temperament')).toBeInTheDocument();
  });
  
  it('should toggle detailed information when button is clicked', () => {
    render(<InfoPanel currentlyPlaying={null} />);
    
    // Initial state - details should not be visible
    expect(screen.queryByText('About Just Intonation and Cents')).not.toBeInTheDocument();
    
    // Click the info button
    const infoButton = screen.getByRole('button');
    fireEvent.click(infoButton);
    
    // After click - details should be visible
    expect(screen.getByText('About Just Intonation and Cents')).toBeInTheDocument();
    expect(screen.getByText('Just Intonation')).toBeInTheDocument();
    expect(screen.getByText('Cents')).toBeInTheDocument();
    
    // Click again to hide
    fireEvent.click(infoButton);
    
    // After second click - details should be hidden again
    expect(screen.queryByText('About Just Intonation and Cents')).not.toBeInTheDocument();
  });
});
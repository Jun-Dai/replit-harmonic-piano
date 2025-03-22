import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PianoKeyboard from '../PianoKeyboard';
import { Note } from "@shared/schema";

describe('PianoKeyboard', () => {
  const mockPianoKeys = [
    { note: 'C4', isBlack: false },
    { note: 'C#4', isBlack: true },
    { note: 'D4', isBlack: false },
    { note: 'D#4', isBlack: true },
    { note: 'E4', isBlack: false }
  ];
  
  const mockNoteConfigurations: Record<string, Note> = {
    'C4': { note: 'C4', ratioNumerator: 1, ratioDenominator: 1, cents: 0, frequency: 261.63 },
    'C#4': { note: 'C#4', ratioNumerator: 16, ratioDenominator: 15, cents: 100, frequency: 277.18 },
    'D4': { note: 'D4', ratioNumerator: 9, ratioDenominator: 8, cents: 200, frequency: 293.66 },
    'D#4': { note: 'D#4', ratioNumerator: 6, ratioDenominator: 5, cents: 300, frequency: 311.13 },
    'E4': { note: 'E4', ratioNumerator: 5, ratioDenominator: 4, cents: 400, frequency: 329.63 }
  };
  
  // Mock functions
  const mockPlayNote = vi.fn();
  const mockStopNote = vi.fn();
  
  beforeEach(() => {
    // Clear mocks between tests
    mockPlayNote.mockClear();
    mockStopNote.mockClear();
  });
  
  it('renders all piano keys', () => {
    render(
      <PianoKeyboard
        pianoKeys={mockPianoKeys}
        noteConfigurations={mockNoteConfigurations}
        playNote={mockPlayNote}
        stopNote={mockStopNote}
        activeNotes={[]}
      />
    );
    
    // Check that all notes are rendered
    expect(screen.getByText('C4')).toBeInTheDocument();
    expect(screen.getByText('C#4')).toBeInTheDocument();
    expect(screen.getByText('D4')).toBeInTheDocument();
    expect(screen.getByText('D#4')).toBeInTheDocument();
    expect(screen.getByText('E4')).toBeInTheDocument();
    
    // Check that frequencies are displayed
    expect(screen.getByText('261.63')).toBeInTheDocument();
    expect(screen.getByText('277.18')).toBeInTheDocument();
  });
  
  it('calls playNote and stopNote when interacting with piano keys', () => {
    render(
      <PianoKeyboard
        pianoKeys={mockPianoKeys}
        noteConfigurations={mockNoteConfigurations}
        playNote={mockPlayNote}
        stopNote={mockStopNote}
        activeNotes={[]}
      />
    );
    
    // Find the C4 key by its note text
    const c4Key = screen.getByText('C4').closest('div');
    
    // MouseDown should call playNote
    if (c4Key) {
      fireEvent.mouseDown(c4Key);
      expect(mockPlayNote).toHaveBeenCalledWith('C4');
      
      // MouseUp should call stopNote
      fireEvent.mouseUp(c4Key);
      expect(mockStopNote).toHaveBeenCalledWith('C4');
      
      // MouseLeave should also call stopNote
      fireEvent.mouseLeave(c4Key);
      expect(mockStopNote).toHaveBeenCalledWith('C4');
    }
  });
  
  it('highlights active notes', () => {
    // Render with C4 as an active note
    render(
      <PianoKeyboard
        pianoKeys={mockPianoKeys}
        noteConfigurations={mockNoteConfigurations}
        playNote={mockPlayNote}
        stopNote={mockStopNote}
        activeNotes={['C4', 'D#4']}
      />
    );
    
    // Find all white keys divs and check that the C4 one has the active class
    const c4Key = screen.getByText('C4').closest('div');
    const d4Key = screen.getByText('D4').closest('div');
    
    if (c4Key && d4Key) {
      expect(c4Key.className).toContain('bg-blue-100');
      expect(d4Key.className).not.toContain('bg-blue-100');
    }
    
    // Check that D#4 (black key) is also highlighted
    const dSharpKey = screen.getByText('D#4').closest('div');
    if (dSharpKey) {
      expect(dSharpKey.className).toContain('bg-blue-800');
    }
  });
  
  it('shows keyboard mapping instructions', () => {
    render(
      <PianoKeyboard
        pianoKeys={mockPianoKeys}
        noteConfigurations={mockNoteConfigurations}
        playNote={mockPlayNote}
        stopNote={mockStopNote}
        activeNotes={[]}
      />
    );
    
    // Check that keyboard instructions are shown
    expect(screen.getByText(/Use your computer keyboard to play notes/)).toBeInTheDocument();
    expect(screen.getByText(/Bottom row \(C3-B3\):/)).toBeInTheDocument();
    expect(screen.getByText(/Middle row \(C4-B4\):/)).toBeInTheDocument();
    expect(screen.getByText(/Top row \(C5-C6\):/)).toBeInTheDocument();
  });
});
/**
 * Piano-related utility functions
 */

// Create audio context
export function createAudioContext(): AudioContext {
  return new (window.AudioContext || window.webkitAudioContext)();
}

// Create a standard piano key range
export function getStandardNoteRange(startNote: string, endNote: string) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const pianoKeys = [];
  
  // Parse start and end notes
  const startMatch = startNote.match(/([A-G]#?)(\d)/);
  const endMatch = endNote.match(/([A-G]#?)(\d)/);
  
  if (!startMatch || !endMatch) {
    throw new Error('Invalid note format. Use format like "A4" or "C#5"');
  }
  
  const [, startNoteName, startOctave] = startMatch;
  const [, endNoteName, endOctave] = endMatch;
  
  const startOctaveNum = parseInt(startOctave);
  const endOctaveNum = parseInt(endOctave);
  
  // Generate all notes in range
  for (let octave = startOctaveNum; octave <= endOctaveNum; octave++) {
    for (const note of notes) {
      const fullNote = `${note}${octave}`;
      
      // Skip notes before start note in the start octave
      if (octave === startOctaveNum && notes.indexOf(note) < notes.indexOf(startNoteName)) {
        continue;
      }
      
      // Skip notes after end note in the end octave
      if (octave === endOctaveNum && notes.indexOf(note) > notes.indexOf(endNoteName)) {
        continue;
      }
      
      pianoKeys.push({
        note: fullNote,
        isBlack: note.includes('#')
      });
    }
  }
  
  return pianoKeys;
}

// Get MIDI note number for a named note (e.g., "A4" = 69)
export function getMidiNoteNumber(noteName: string): number {
  const noteMatch = noteName.match(/([A-G]#?)(\d)/);
  if (!noteMatch) {
    throw new Error(`Invalid note format: ${noteName}. Use format like "A4" or "C#5"`);
  }
  
  const [, note, octave] = noteMatch;
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octaveNum = parseInt(octave);
  
  // MIDI note numbers: C-1 is 0, C0 is 12, C1 is 24, etc.
  // A4 (440 Hz) is 69
  return notes.indexOf(note) + (octaveNum + 1) * 12;
}

// Get relative position of a note compared to A4
export function getNoteSemitones(noteName: string): number {
  const midiNote = getMidiNoteNumber(noteName);
  const midiA4 = getMidiNoteNumber('A4'); // 69
  return midiNote - midiA4;
}

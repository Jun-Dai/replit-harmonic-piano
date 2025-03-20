import { getNoteSemitones } from "./piano";
import { Note } from "@shared/schema";

/**
 * Calculate frequency for a note based on tuning parameters
 */
export function calculateFrequency(
  noteName: string,
  baseFrequency: number,
  ratioNumerator: number,
  ratioDenominator: number,
  cents: number
): number {
  // For the reference note (A4), just return the base frequency
  if (noteName === 'A4') {
    return baseFrequency;
  }
  
  // Find semitones from A4
  const semitones = getNoteSemitones(noteName);
  
  // Calculate basic equal-tempered frequency (2^(n/12))
  let frequency = baseFrequency * Math.pow(2, semitones / 12);
  
  // Apply just intonation ratio adjustment
  const justRatio = ratioNumerator / ratioDenominator;
  frequency = (frequency * justRatio) / Math.pow(2, Math.log2(justRatio));
  
  // Apply cents deviation (100 cents = 1 semitone)
  const centsAdjustment = Math.pow(2, cents / 1200);
  frequency *= centsAdjustment;
  
  return frequency;
}

/**
 * Initialize tunings for all notes based on a tuning system
 */
export function initializeTunings(
  baseFrequency: number = 440,
  tuningSystem: string = 'equal'
): Record<string, Note> {
  const noteNames = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];
  
  const notes: Record<string, Note> = {};
  
  // Generate notes for octaves 2-6 (covering A2 to C6)
  for (let octave = 2; octave <= 6; octave++) {
    for (const noteName of noteNames) {
      // Skip notes outside our range (A2 to C6)
      const fullNote = `${noteName}${octave}`;
      if ((octave === 2 && noteNames.indexOf(noteName) < noteNames.indexOf('A')) ||
          (octave === 6 && noteNames.indexOf(noteName) > noteNames.indexOf('C'))) {
        continue;
      }
      
      // Set default tuning values
      let ratioNumerator = 1;
      let ratioDenominator = 1;
      let cents = 0;
      
      // Special case for A4 (reference note)
      if (fullNote === 'A4') {
        notes[fullNote] = {
          name: fullNote,
          ratioNumerator: 1,
          ratioDenominator: 1,
          cents: 0,
          frequency: baseFrequency
        };
        continue;
      }
      
      // Calculate tuning based on selected system
      if (tuningSystem === 'just') {
        // Just Intonation tuning system (based on simple ratios)
        const justRatios: Record<string, [number, number]> = {
          'C': [4, 5],    // Major third below E
          'C#': [32, 45], // Approximation
          'D': [9, 10],   // Major second above C
          'D#': [6, 7],   // Approximation 
          'E': [5, 6],    // Minor third above C
          'F': [3, 4],    // Perfect fourth below A
          'F#': [5, 7],   // Approximation
          'G': [2, 3],    // Perfect fifth below D
          'G#': [8, 11],  // Approximation
          'A': [1, 1],    // Reference
          'A#': [10, 9],  // Minor second above A
          'B': [9, 8]     // Major second above A
        };
        
        const [num, denom] = justRatios[noteName];
        ratioNumerator = num;
        ratioDenominator = denom;
      } else if (tuningSystem === 'pythagorean') {
        // Pythagorean tuning (based on perfect fifths)
        const pythagoreanRatios: Record<string, [number, number]> = {
          'C': [3, 4],     // Fourth below F
          'C#': [27, 32],  // Ditone above A
          'D': [9, 8],     // Tone above C
          'D#': [81, 64],  // Ditone above B
          'E': [81, 64],   // Ditone above C
          'F': [4, 3],     // Fourth above C
          'F#': [729, 512],// Ditone above D
          'G': [3, 2],     // Fifth above C
          'G#': [27, 16],  // Ditone above E
          'A': [1, 1],     // Reference
          'A#': [9, 8],    // Tone above A
          'B': [81, 64]    // Ditone above G
        };
        
        const [num, denom] = pythagoreanRatios[noteName];
        ratioNumerator = num;
        ratioDenominator = denom;
      } else if (tuningSystem === 'quarter') {
        // Quarter-comma meantone tuning
        // Implemented as cents deviations from equal temperament
        const meantoneOffsets: Record<string, number> = {
          'C': -6.8,
          'C#': -13.7,
          'D': -3.4,
          'D#': -10.3,
          'E': 0,
          'F': -6.8,
          'F#': -13.7,
          'G': -3.4,
          'G#': -10.3,
          'A': 0,
          'A#': -13.7,
          'B': -3.4
        };
        
        cents = meantoneOffsets[noteName];
      } else {
        // Default to equal temperament (which is represented by cents = 0)
        cents = 0;
      }
      
      // Calculate the frequency based on the tuning parameters
      const frequency = calculateFrequency(
        fullNote, 
        baseFrequency, 
        ratioNumerator, 
        ratioDenominator, 
        cents
      );
      
      // Store the note configuration
      notes[fullNote] = {
        name: fullNote,
        ratioNumerator,
        ratioDenominator,
        cents,
        frequency
      };
    }
  }
  
  return notes;
}

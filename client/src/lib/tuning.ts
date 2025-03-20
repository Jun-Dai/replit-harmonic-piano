import { getNoteSemitones } from "./piano";
import { Note } from "@shared/schema";

/**
 * Parse a ratio string into numerator and denominator
 */
export function parseRatioString(ratioStr: string): [number, number] {
  if (!ratioStr || !ratioStr.includes('/')) {
    return [1, 1]; // Default to 1/1 if invalid
  }
  
  const [numStr, denomStr] = ratioStr.split('/');
  const num = parseInt(numStr.trim());
  const denom = parseInt(denomStr.trim());
  
  if (isNaN(num) || isNaN(denom) || denom === 0) {
    return [1, 1]; // Default to 1/1 if invalid
  }
  
  return [num, denom];
}

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
 * Extract the base note name (without octave)
 */
export function getBaseNoteName(noteName: string): string {
  const match = noteName.match(/([A-G]#?)(\d)/);
  if (!match) return '';
  return match[1]; // Just the note name part (e.g., "C#" from "C#4")
}

/**
 * Get octave number from note name
 */
export function getNoteOctave(noteName: string): number {
  const match = noteName.match(/([A-G]#?)(\d)/);
  if (!match) return 4; // Default to octave 4
  return parseInt(match[2]); 
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
  
  // Create ratio objects for each note (same tuning across all octaves)
  const baseNoteRatios: Record<string, { 
    ratioNumerator: number, 
    ratioDenominator: number, 
    ratio: string, 
    cents: number 
  }> = {};
  
  // Define ratios based on the selected tuning system
  if (tuningSystem === 'just') {
    // Just Intonation tuning system (based on simple ratios relative to A)
    const justRatios: Record<string, [number, number]> = {
      'C': [3, 5],     // Major sixth below A
      'C#': [8, 13],   // Approximation
      'D': [2, 3],     // Perfect fifth below A
      'D#': [5, 7],    // Approximation
      'E': [4, 5],     // Major third below A
      'F': [3, 4],     // Perfect fourth below A
      'F#': [45, 56],  // Approximation
      'G': [8, 9],     // Major second below A
      'G#': [15, 16],  // Approximation
      'A': [1, 1],     // Reference
      'A#': [9, 8],    // Major second above A
      'B': [5, 4]      // Major third above A
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      const [num, denom] = justRatios[note];
      baseNoteRatios[note] = {
        ratioNumerator: num,
        ratioDenominator: denom,
        ratio: `${num}/${denom}`,
        cents: 0 // Initially no cents adjustment
      };
    }
  } else if (tuningSystem === 'pythagorean') {
    // Pythagorean tuning (based on perfect fifths relative to A)
    const pythagoreanRatios: Record<string, [number, number]> = {
      'C': [27, 40],    // ~Major sixth below A
      'C#': [729, 1024],// Pythagorean approximation
      'D': [3, 4],      // Perfect fourth below A
      'D#': [81, 101],  // Pythagorean approximation
      'E': [81, 100],   // ~Major third below A
      'F': [4, 5],      // ~Major third below A
      'F#': [729, 800], // Pythagorean approximation
      'G': [3, 2],      // Perfect fifth above A
      'G#': [243, 160], // Pythagorean approximation
      'A': [1, 1],      // Reference
      'A#': [256, 243], // Pythagorean limma
      'B': [9, 8]       // Major whole tone above A
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      const [num, denom] = pythagoreanRatios[note];
      baseNoteRatios[note] = {
        ratioNumerator: num,
        ratioDenominator: denom,
        ratio: `${num}/${denom}`,
        cents: 0
      };
    }
  } else if (tuningSystem === 'quarter') {
    // Quarter-comma meantone tuning
    // Implemented as cents deviations from equal temperament
    const meantoneOffsets: Record<string, number> = {
      'C': -21.5,      // Relative to A
      'C#': -13.7,
      'D': -13.7,
      'D#': -10.3,
      'E': -6.8,
      'F': -20.5,      // Relative to A
      'F#': -13.7,
      'G': -10.3,      // Relative to A
      'G#': -6.8,
      'A': 0,          // Reference
      'A#': -13.7,
      'B': -3.4
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      baseNoteRatios[note] = {
        ratioNumerator: 1,
        ratioDenominator: 1,
        ratio: "1/1",
        cents: meantoneOffsets[note] // Use cents-based adjustment
      };
    }
  } else {
    // Equal temperament (the default)
    for (const note of noteNames) {
      baseNoteRatios[note] = {
        ratioNumerator: 1, 
        ratioDenominator: 1,
        ratio: "1/1",
        cents: 0
      };
    }
  }
  
  // Now generate all notes in the required range using the base note tunings
  // Generate notes for octaves 2-6 (covering A2 to C6)
  for (let octave = 2; octave <= 6; octave++) {
    for (const noteName of noteNames) {
      // Skip notes outside our range (A2 to C6)
      const fullNote = `${noteName}${octave}`;
      if ((octave === 2 && noteNames.indexOf(noteName) < noteNames.indexOf('A')) ||
          (octave === 6 && noteNames.indexOf(noteName) > noteNames.indexOf('C'))) {
        continue;
      }
      
      // Special case for A4 (reference note)
      if (fullNote === 'A4') {
        notes[fullNote] = {
          name: fullNote,
          baseName: noteName,
          ratio: "1/1",
          ratioNumerator: 1,
          ratioDenominator: 1,
          cents: 0,
          frequency: baseFrequency
        };
        continue;
      }
      
      // Get the base tuning for this note
      const baseRatio = baseNoteRatios[noteName];
      
      // Calculate the frequency based on the tuning parameters
      const frequency = calculateFrequency(
        fullNote, 
        baseFrequency, 
        baseRatio.ratioNumerator, 
        baseRatio.ratioDenominator, 
        baseRatio.cents
      );
      
      // Store the note configuration
      notes[fullNote] = {
        name: fullNote,
        baseName: noteName,
        ratio: baseRatio.ratio,
        ratioNumerator: baseRatio.ratioNumerator,
        ratioDenominator: baseRatio.ratioDenominator,
        cents: baseRatio.cents,
        frequency
      };
    }
  }
  
  return notes;
}

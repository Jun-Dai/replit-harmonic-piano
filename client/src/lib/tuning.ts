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
  
  // Calculate the basic equal-tempered frequency
  const basicFrequency = baseFrequency * Math.pow(2, semitones / 12);
  
  // Choose which approach to use based on the tuning parameters
  let frequency;
  
  if (ratioNumerator !== 1 || ratioDenominator !== 1) {
    // Use just intonation ratio
    const justRatio = ratioNumerator / ratioDenominator;
    
    // Calculate the frequency directly from the ratio to A4
    frequency = baseFrequency * justRatio * Math.pow(2, Math.floor(semitones / 12));
    
    // Adjust for the difference in octaves
    const octaveDiff = Math.floor(semitones / 12);
    if (octaveDiff !== 0) {
      frequency = frequency * Math.pow(2, octaveDiff);
    }
  } else {
    // Use cents-based tuning
    frequency = basicFrequency;
  }
  
  // Apply cents deviation if provided (100 cents = 1 semitone)
  if (cents !== 0) {
    const centsAdjustment = Math.pow(2, cents / 1200);
    frequency *= centsAdjustment;
  }
  
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
 * Convert between ratio and cents
 */
export function ratioToCents(numerator: number, denominator: number): number {
  return 1200 * Math.log2(numerator / denominator);
}

/**
 * Convert cents to ratio (approximate)
 */
export function centsToRatio(cents: number): [number, number] {
  const ratio = Math.pow(2, cents / 1200);
  
  // Find a simple fraction approximation
  // This is a simple continued fraction algorithm
  const epsilon = 1.0e-6;
  
  // For small ratios or simple cases
  if (Math.abs(ratio - 1) < epsilon) return [1, 1];
  
  // For reasonably small values, find a good approximation
  if (ratio < 10) {
    // Continued fraction approximation
    let [n1, d1] = [1, 0];
    let [n2, d2] = [0, 1];
    let r = ratio;
    const maxIterations = 10;
    
    for (let i = 0; i < maxIterations; i++) {
      const a = Math.floor(r);
      [n1, n2] = [a * n1 + n2, n1];
      [d1, d2] = [a * d1 + d2, d1];
      
      const newRatio = n1 / d1;
      if (Math.abs(newRatio - ratio) < epsilon || r - a < epsilon) {
        return [n1, d1];
      }
      
      r = 1 / (r - a);
    }
    
    return [n1, d1];
  }
  
  // Fallback for larger values - use decimal approximation
  const decimalDigits = ratio.toFixed(3);
  if (Number(decimalDigits) === Math.floor(Number(decimalDigits))) {
    return [Number(decimalDigits), 1];
  }
  
  // For complex ratios, return a simple rounded version
  return [Math.round(ratio * 100), 100];
}

/**
 * Initialize tunings for all notes based on a tuning system
 */
export function initializeTunings(
  baseFrequency: number = 440,
  tuningSystem: string = 'equal'
): Record<string, Note> {
  // Put A first in the list since it's our reference note
  const noteNames = [
    'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'
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
      'A': [1, 1],     // Reference
      'A#': [9, 8],    // Major second above A
      'B': [5, 4],     // Major third above A
      'C': [3, 5],     // Major sixth below A (adjusted for octave)
      'C#': [8, 13],   // Approximation
      'D': [2, 3],     // Perfect fifth below A (adjusted for octave)
      'D#': [5, 7],    // Approximation
      'E': [4, 5],     // Major third below A (adjusted for octave)
      'F': [3, 4],     // Perfect fourth below A (adjusted for octave)
      'F#': [45, 56],  // Approximation
      'G': [8, 9],     // Major second below A (adjusted for octave)
      'G#': [15, 16]   // Approximation
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
      'A': [1, 1],      // Reference
      'A#': [256, 243], // Pythagorean limma
      'B': [9, 8],      // Major whole tone above A
      'C': [27, 40],    // ~Major sixth below A (adjusted for octave)
      'C#': [729, 1024],// Pythagorean approximation
      'D': [3, 4],      // Perfect fourth below A (adjusted for octave)
      'D#': [81, 101],  // Pythagorean approximation
      'E': [81, 100],   // ~Major third below A (adjusted for octave)
      'F': [4, 5],      // ~Major third below A (adjusted for octave)
      'F#': [729, 800], // Pythagorean approximation
      'G': [3, 2],      // Perfect fifth above A (adjusted for octave)
      'G#': [243, 160]  // Pythagorean approximation
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
      'A': 0,          // Reference
      'A#': -13.7,
      'B': -3.4,
      'C': -21.5,      // Relative to A
      'C#': -13.7,
      'D': -13.7,
      'D#': -10.3,
      'E': -6.8,
      'F': -20.5,      // Relative to A
      'F#': -13.7,
      'G': -10.3,      // Relative to A
      'G#': -6.8
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
  } else if (tuningSystem === 'werckmeister3') {
    // Werckmeister III well temperament
    // Historical well temperament from 1691
    // Implemented as cents deviations from equal temperament
    const werckmeisterOffsets: Record<string, number> = {
      'A': 0,       // Reference
      'A#': -9.8,
      'B': -7.8,
      'C': -5.9,
      'C#': -7.8,
      'D': -3.9,
      'D#': -7.8,
      'E': 0,
      'F': -2.0,
      'F#': -7.8,
      'G': -2.0,
      'G#': -11.7
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      baseNoteRatios[note] = {
        ratioNumerator: 1,
        ratioDenominator: 1,
        ratio: "1/1",
        cents: werckmeisterOffsets[note] // Use cents-based adjustment
      };
    }
  } else if (tuningSystem === 'kirnberger3') {
    // Kirnberger III well temperament
    // Historical well temperament from 1779
    // Implemented as cents deviations from equal temperament
    const kirnbergerOffsets: Record<string, number> = {
      'A': 0,       // Reference
      'A#': -10.3,
      'B': -3.9,
      'C': -6.8,
      'C#': -13.7,
      'D': -2.0,
      'D#': -10.3,
      'E': 0,
      'F': -8.2,
      'F#': -5.9,
      'G': -2.0,
      'G#': -8.2
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      baseNoteRatios[note] = {
        ratioNumerator: 1,
        ratioDenominator: 1,
        ratio: "1/1",
        cents: kirnbergerOffsets[note] // Use cents-based adjustment
      };
    }
  } else {
    // Equal temperament (the default)
    for (const note of noteNames) {
      // Calculate cents from A in equal temperament
      let cents = 0;
      if (note !== 'A') {
        // Find the index of the note in the noteNames array
        const noteIndex = noteNames.indexOf(note);
        const aIndex = noteNames.indexOf('A');
        
        // Calculate semitones from A (can be negative)
        let semitones = noteIndex - aIndex;
        
        // Adjust for wrapping around the octave
        if (semitones < -6) {
          semitones += 12;
        } else if (semitones > 6) {
          semitones -= 12;
        }
        
        // Convert semitones to cents (100 cents per semitone)
        cents = semitones * 100;
      }
      
      baseNoteRatios[note] = {
        ratioNumerator: 1, 
        ratioDenominator: 1,
        ratio: "1/1",
        cents: cents  // Use cents for equal temperament
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

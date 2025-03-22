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
 * This function calculates frequencies in a C-based tuning system with
 * C4 as the reference frequency (default 261.63 Hz, equivalent to A4=440Hz in equal temperament)
 */
export function calculateFrequency(
  noteName: string,
  c4Frequency: number, // C4 reference frequency (default 261.63 Hz) 
  ratioNumerator: number,
  ratioDenominator: number,
  cents: number
): number {
  // Extract note name and octave
  const baseName = getBaseNoteName(noteName);
  const octave = getNoteOctave(noteName);
  
  // Calculate octave multiplier relative to C4
  const octaveDiff = octave - 4;
  const octaveMultiplier = Math.pow(2, octaveDiff);
  
  // Determine the frequency
  let frequency;
  
  if (ratioNumerator !== 1 || ratioDenominator !== 1) {
    // Using just intonation or ratio-based tuning
    // Calculate the frequency of C in the target octave
    const cInTargetOctave = c4Frequency * octaveMultiplier;
    
    // Apply the ratio relative to C
    const justRatio = ratioNumerator / ratioDenominator;
    frequency = cInTargetOctave * justRatio;
  } else {
    // Using cents-based tuning (like equal temperament)
    // Convert cents to ratio (relative to C)
    const centsRatio = Math.pow(2, cents / 1200);
    
    // Calculate the frequency of C in the target octave
    const cInTargetOctave = c4Frequency * octaveMultiplier;
    
    // Apply the cents ratio
    frequency = cInTargetOctave * centsRatio;
  }
  
  return parseFloat(frequency.toFixed(2));
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
 * Convert A4 frequency to equivalent C4 frequency
 * In equal temperament, A4 is 9 semitones above C4
 */
export function a4ToC4Frequency(a4Frequency: number): number {
  return a4Frequency * Math.pow(2, -9/12); // ~261.63 Hz when A4=440Hz
}

/**
 * Initialize tunings for all notes based on a tuning system
 * @param a4Frequency The frequency of A4 (typically 440Hz)
 * @param tuningSystem The tuning system to use
 * @returns A record of all notes with their tuning information
 */
export function initializeTunings(
  a4Frequency: number = 440,
  tuningSystem: string = 'equal'
): Record<string, Note> {
  // Convert A4 frequency to C4 frequency (our actual reference)
  const c4Frequency = a4ToC4Frequency(a4Frequency);
  // Define notes in standard order with C first (standard musical convention)
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
    // Just Intonation tuning system (based on simple ratios relative to C)
    const justRatios: Record<string, [number, number]> = {
      'C': [1, 1],      // Reference note
      'C#': [16, 15],   // Minor second
      'D': [9, 8],      // Major second
      'D#': [6, 5],     // Minor third
      'E': [5, 4],      // Major third
      'F': [4, 3],      // Perfect fourth
      'F#': [45, 32],   // Augmented fourth
      'G': [3, 2],      // Perfect fifth
      'G#': [8, 5],     // Minor sixth
      'A': [5, 3],      // Major sixth
      'A#': [9, 5],     // Minor seventh (or 16/9)
      'B': [15, 8]      // Major seventh
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      const [num, denom] = justRatios[note];
      const centValue = ratioToCents(num, denom);
      baseNoteRatios[note] = {
        ratioNumerator: num,
        ratioDenominator: denom,
        ratio: `${num}/${denom}`,
        cents: parseFloat(centValue.toFixed(1)) // Store cents value for conversion purposes
      };
    }
  } else if (tuningSystem === 'pythagorean') {
    // Pythagorean tuning (based on perfect fifths relative to C)
    const pythagoreanRatios: Record<string, [number, number]> = {
      'C': [1, 1],       // Reference
      'C#': [2187, 2048],// Pythagorean augmented unison
      'D': [9, 8],       // Major whole tone (tone)
      'D#': [32, 27],    // Pythagorean minor third (minor third)
      'E': [81, 64],     // Pythagorean major third (ditone)
      'F': [4, 3],       // Perfect fourth
      'F#': [729, 512],  // Pythagorean augmented fourth
      'G': [3, 2],       // Perfect fifth
      'G#': [6561, 4096],// Pythagorean augmented fifth
      'A': [27, 16],     // Pythagorean major sixth
      'A#': [16, 9],     // Pythagorean minor seventh
      'B': [243, 128]    // Pythagorean major seventh
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      const [num, denom] = pythagoreanRatios[note];
      const centValue = ratioToCents(num, denom);
      baseNoteRatios[note] = {
        ratioNumerator: num,
        ratioDenominator: denom,
        ratio: `${num}/${denom}`,
        cents: parseFloat(centValue.toFixed(1))
      };
    }
  } else if (tuningSystem === 'quarter') {
    // Quarter-comma meantone tuning
    // Historical temperament with pure major thirds
    // Absolute cents from C reference
    const meantoneCents: Record<string, number> = {
      'C': 0,        // Reference note
      'C#': 76.0,    // Rather than 100 in equal temperament
      'D': 193.2,    // Rather than 200 in equal temperament
      'D#': 310.3,   // Rather than 300 in equal temperament
      'E': 386.3,    // Rather than 400 in equal temperament (pure major third)
      'F': 503.4,    // Rather than 500 in equal temperament
      'F#': 579.5,   // Rather than 600 in equal temperament
      'G': 696.6,    // Rather than 700 in equal temperament
      'G#': 772.6,   // Rather than 800 in equal temperament
      'A': 889.7,    // Rather than 900 in equal temperament
      'A#': 1006.8,  // Rather than 1000 in equal temperament
      'B': 1082.9    // Rather than 1100 in equal temperament
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      // Convert cents to ratio for storage
      const [num, denom] = centsToRatio(meantoneCents[note]);
      baseNoteRatios[note] = {
        ratioNumerator: num,
        ratioDenominator: denom,
        ratio: `${num}/${denom}`,
        cents: meantoneCents[note]
      };
    }
  } else if (tuningSystem === 'werckmeister3') {
    // Werckmeister III well temperament
    // Historical well temperament from 1691
    // Absolute cents from C reference
    const werckmeisterCents: Record<string, number> = {
      'C': 0,       // Reference
      'C#': 90.2,   // Rather than 100 in equal temperament
      'D': 196.1,   // Rather than 200 in equal temperament
      'D#': 294.1,  // Rather than 300 in equal temperament
      'E': 392.2,   // Rather than 400 in equal temperament
      'F': 498.0,   // Rather than 500 in equal temperament
      'F#': 588.3,  // Rather than 600 in equal temperament
      'G': 698.0,   // Rather than 700 in equal temperament
      'G#': 792.2,  // Rather than 800 in equal temperament
      'A': 894.1,   // Rather than 900 in equal temperament
      'A#': 996.1,  // Rather than 1000 in equal temperament
      'B': 1092.2   // Rather than 1100 in equal temperament
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      // Convert cents to ratio for storage
      const [num, denom] = centsToRatio(werckmeisterCents[note]);
      baseNoteRatios[note] = {
        ratioNumerator: num,
        ratioDenominator: denom,
        ratio: `${num}/${denom}`,
        cents: werckmeisterCents[note]
      };
    }
  } else if (tuningSystem === 'kirnberger3') {
    // Kirnberger III well temperament
    // Historical well temperament from 1779
    // Absolute cents from C reference
    const kirnbergerCents: Record<string, number> = {
      'C': 0,       // Reference
      'C#': 90.2,   // Rather than 100 in equal temperament
      'D': 204.0,   // Rather than 200 in equal temperament
      'E': 386.3,   // Rather than 400 in equal temperament (pure major third)
      'D#': 294.1,  // Rather than 300 in equal temperament
      'F': 498.0,   // Rather than 500 in equal temperament
      'F#': 590.2,  // Rather than 600 in equal temperament
      'G': 702.0,   // Rather than 700 in equal temperament (pure fifth)
      'G#': 792.2,  // Rather than 800 in equal temperament
      'A': 895.1,   // Rather than 900 in equal temperament
      'A#': 996.1,  // Rather than 1000 in equal temperament
      'B': 1088.3   // Rather than 1100 in equal temperament
    };
    
    // Create ratio objects for each base note
    for (const note of noteNames) {
      // Convert cents to ratio for storage
      const [num, denom] = centsToRatio(kirnbergerCents[note]);
      baseNoteRatios[note] = {
        ratioNumerator: num,
        ratioDenominator: denom,
        ratio: `${num}/${denom}`,
        cents: kirnbergerCents[note]
      };
    }
  } else {
    // Equal temperament (the default)
    // In 12-tone equal temperament, each semitone is 100 cents
    // Starting with C at 0 cents and proceeding through the octave
    
    const equalTemperamentCents: Record<string, number> = {
      'C': 0,     // Reference note
      'C#': 100,  // 1 semitone above C
      'D': 200,   // 2 semitones above C
      'D#': 300,  // 3 semitones above C
      'E': 400,   // 4 semitones above C
      'F': 500,   // 5 semitones above C
      'F#': 600,  // 6 semitones above C
      'G': 700,   // 7 semitones above C
      'G#': 800,  // 8 semitones above C
      'A': 900,   // 9 semitones above C
      'A#': 1000, // 10 semitones above C
      'B': 1100   // 11 semitones above C
    };
    
    for (const note of noteNames) {
      baseNoteRatios[note] = {
        ratioNumerator: 1, 
        ratioDenominator: 1,
        ratio: "1/1",
        cents: equalTemperamentCents[note]  // Use cents for equal temperament
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
      
      // Get the base tuning for this note
      const baseRatio = baseNoteRatios[noteName];
      
      // Calculate the frequency based on the tuning parameters
      // We pass c4Frequency to our calculation
      const frequency = calculateFrequency(
        fullNote, 
        c4Frequency, 
        baseRatio.ratioNumerator, 
        baseRatio.ratioDenominator, 
        baseRatio.cents
      );
      
      // Use the calculated frequency for all notes, including A4
      // This ensures the tuning system is consistently applied
      const frequencyToUse = frequency;
      
      // Store the note configuration
      notes[fullNote] = {
        name: fullNote,
        baseName: noteName,
        ratio: baseRatio.ratio,
        ratioNumerator: baseRatio.ratioNumerator,
        ratioDenominator: baseRatio.ratioDenominator,
        cents: baseRatio.cents,
        frequency: frequencyToUse
      };
    }
  }
  
  return notes;
}
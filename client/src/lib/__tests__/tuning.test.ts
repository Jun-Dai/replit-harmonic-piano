import { describe, it, expect } from 'vitest';
import { 
  parseRatioString, 
  getBaseNoteName, 
  getNoteOctave, 
  ratioToCents, 
  centsToRatio, 
  a4ToC4Frequency,
  calculateFrequency,
  initializeTunings
} from '../tuning';

describe('Tuning utilities', () => {
  describe('parseRatioString', () => {
    it('should parse valid ratio strings', () => {
      expect(parseRatioString('3/2')).toEqual([3, 2]);
      expect(parseRatioString('16/9')).toEqual([16, 9]);
      expect(parseRatioString('1/1')).toEqual([1, 1]);
    });

    it('should handle whitespace in ratio strings', () => {
      expect(parseRatioString('3 / 2')).toEqual([3, 2]);
      expect(parseRatioString(' 16 / 9 ')).toEqual([16, 9]);
    });

    it('should return [1, 1] for invalid inputs', () => {
      expect(parseRatioString('')).toEqual([1, 1]);
      expect(parseRatioString('invalid')).toEqual([1, 1]);
      expect(parseRatioString('3')).toEqual([1, 1]);
      expect(parseRatioString('3/0')).toEqual([1, 1]);
      expect(parseRatioString('a/b')).toEqual([1, 1]);
    });
  });

  describe('getBaseNoteName', () => {
    it('should extract base note name without octave', () => {
      expect(getBaseNoteName('C4')).toBe('C');
      expect(getBaseNoteName('F#3')).toBe('F#');
      expect(getBaseNoteName('G#5')).toBe('G#');
    });

    it('should return empty string for invalid note names', () => {
      expect(getBaseNoteName('invalidNote')).toBe('');
      expect(getBaseNoteName('')).toBe('');
    });
  });

  describe('getNoteOctave', () => {
    it('should extract octave number from note name', () => {
      expect(getNoteOctave('C4')).toBe(4);
      expect(getNoteOctave('F#3')).toBe(3);
      expect(getNoteOctave('G#5')).toBe(5);
    });

    it('should return default octave 4 for invalid note names', () => {
      expect(getNoteOctave('invalidNote')).toBe(4);
      expect(getNoteOctave('')).toBe(4);
    });
  });

  describe('ratioToCents', () => {
    it('should correctly convert ratio to cents', () => {
      // Unison
      expect(ratioToCents(1, 1)).toBeCloseTo(0, 0);
      // Perfect fifth (3/2)
      expect(ratioToCents(3, 2)).toBeCloseTo(702, 0);
      // Perfect fourth (4/3)
      expect(ratioToCents(4, 3)).toBeCloseTo(498, 0);
      // Major third (5/4)
      expect(ratioToCents(5, 4)).toBeCloseTo(386, 0);
      // Minor third (6/5)
      expect(ratioToCents(6, 5)).toBeCloseTo(316, 0);
    });
  });

  describe('centsToRatio', () => {
    it('should convert cents to approximate ratio', () => {
      // Unison
      expect(centsToRatio(0)).toEqual([1, 1]);
      
      // Perfect fifth (702 cents)
      const [num, denom] = centsToRatio(702);
      const calculatedRatio = num / denom;
      expect(calculatedRatio).toBeCloseTo(1.5, 2); // Should be close to 3/2 = 1.5
      
      // Perfect fourth (498 cents)
      const [num2, denom2] = centsToRatio(498);
      const calculatedRatio2 = num2 / denom2;
      expect(calculatedRatio2).toBeCloseTo(4/3, 2); // Should be close to 4/3 ≈ 1.333
      
      // Major third (386 cents)
      const [num3, denom3] = centsToRatio(386);
      const calculatedRatio3 = num3 / denom3;
      expect(calculatedRatio3).toBeCloseTo(5/4, 2); // Should be close to 5/4 = 1.25
    });

    it('should handle small cent values', () => {
      // Very small cent values should produce ratios close to 1/1
      const [num1, denom1] = centsToRatio(1);
      const ratio1 = num1 / denom1;
      expect(ratio1).toBeCloseTo(1.0006, 4); // 1 cent is approximately 1.0006
      
      const [num2, denom2] = centsToRatio(0.5);
      const ratio2 = num2 / denom2;
      expect(ratio2).toBeCloseTo(1.0003, 4); // 0.5 cent is approximately 1.0003
    });
  });

  describe('a4ToC4Frequency', () => {
    it('should convert A4 frequency to C4 frequency', () => {
      // Standard A4 = 440Hz should give C4 ≈ 261.63Hz
      expect(a4ToC4Frequency(440)).toBeCloseTo(261.63, 0);
      
      // Test with other values
      expect(a4ToC4Frequency(432)).toBeCloseTo(256.87, 0); // A432 tuning
      expect(a4ToC4Frequency(444)).toBeCloseTo(264.13, 0);
    });
  });

  describe('calculateFrequency', () => {
    it('should calculate frequencies using ratio tuning', () => {
      // C4 with 1/1 ratio should be exactly the reference frequency
      expect(calculateFrequency('C4', 261.63, 1, 1, 0)).toBe(261.63);
      
      // G4 with 3/2 ratio (perfect fifth) should be 392.45Hz
      expect(calculateFrequency('G4', 261.63, 3, 2, 0)).toBeCloseTo(392.45, 1);
      
      // E4 with 5/4 ratio (major third) should be 327.04Hz
      expect(calculateFrequency('E4', 261.63, 5, 4, 0)).toBeCloseTo(327.04, 1);
    });

    it('should calculate frequencies using cents tuning', () => {
      // C4 with 0 cents should be exactly the reference frequency
      expect(calculateFrequency('C4', 261.63, 1, 1, 0)).toBe(261.63);
      
      // G4 with 700 cents (perfect fifth in ET) should be 392.00Hz
      expect(calculateFrequency('G4', 261.63, 1, 1, 700)).toBeCloseTo(392.00, 1);
      
      // E4 with 400 cents (major third in ET) should be 329.63Hz
      expect(calculateFrequency('E4', 261.63, 1, 1, 400)).toBeCloseTo(329.63, 1);
    });

    it('should account for octave differences', () => {
      // C5 should be double C4
      expect(calculateFrequency('C5', 261.63, 1, 1, 0)).toBeCloseTo(523.26, 1);
      
      // C3 should be half of C4
      expect(calculateFrequency('C3', 261.63, 1, 1, 0)).toBeCloseTo(130.81, 1);
    });
  });

  describe('initializeTunings', () => {
    it('should initialize equal temperament tuning by default', () => {
      const tunings = initializeTunings(440); // A4 = 440Hz

      // Check that we have a good range of notes
      expect(Object.keys(tunings).length).toBeGreaterThan(20); // Should include many notes

      // Check C4 properties
      expect(tunings['C4']).toBeDefined();
      expect(tunings['C4'].frequency).toBeCloseTo(261.63, 1);
      expect(tunings['C4'].cents).toBe(0);

      // Check A4 properties
      expect(tunings['A4']).toBeDefined();
      expect(tunings['A4'].frequency).toBeCloseTo(440, 1);
      expect(tunings['A4'].cents).toBe(900);
    });

    it('should initialize just intonation tuning', () => {
      const tunings = initializeTunings(440, 'just');

      // Check key just intonation intervals
      expect(tunings['C4']).toBeDefined();
      expect(tunings['C4'].ratio).toBe('1/1');
      expect(tunings['C4'].frequency).toBeCloseTo(261.63, 1);

      // Perfect fifth (3/2)
      expect(tunings['G4']).toBeDefined();
      expect(tunings['G4'].ratio).toBe('3/2');
      expect(tunings['G4'].ratioNumerator).toBe(3);
      expect(tunings['G4'].ratioDenominator).toBe(2);
      expect(tunings['G4'].frequency).toBeCloseTo(392.45, 1);

      // Major third (5/4)
      expect(tunings['E4']).toBeDefined();
      expect(tunings['E4'].ratio).toBe('5/4');
      expect(tunings['E4'].ratioNumerator).toBe(5);
      expect(tunings['E4'].ratioDenominator).toBe(4);
      expect(tunings['E4'].frequency).toBeCloseTo(327.04, 1);
    });

    it('should initialize pythagorean tuning', () => {
      const tunings = initializeTunings(440, 'pythagorean');

      // Check key pythagorean intervals
      expect(tunings['C4']).toBeDefined();
      expect(tunings['C4'].ratio).toBe('1/1');

      // Perfect fifth (3/2) - same as just intonation
      expect(tunings['G4']).toBeDefined();
      expect(tunings['G4'].ratio).toBe('3/2');

      // Major third in Pythagorean is 81/64 (different from just intonation's 5/4)
      expect(tunings['E4']).toBeDefined();
      expect(tunings['E4'].ratio).toBe('81/64');
      expect(tunings['E4'].ratioNumerator).toBe(81);
      expect(tunings['E4'].ratioDenominator).toBe(64);
    });

    it('should initialize quarter-comma meantone tuning', () => {
      const tunings = initializeTunings(440, 'quarter');

      // Check specific meantone intervals
      expect(tunings['C4']).toBeDefined();
      expect(tunings['C4'].cents).toBe(0);

      // In quarter-comma meantone, the major third should be pure (closer to 386 cents than 400)
      expect(tunings['E4']).toBeDefined();
      expect(tunings['E4'].cents).toBeCloseTo(386.3, 1);

      // And fifths are slightly narrow compared to pure 702 cents
      expect(tunings['G4']).toBeDefined();
      expect(tunings['G4'].cents).toBeCloseTo(696.6, 1); 
    });

    it('should initialize La Monte Young\'s Well-Tuned Piano', () => {
      const tunings = initializeTunings(440, 'youngWellTuned');

      // Check Young's specific 7-limit intervals
      expect(tunings['C4']).toBeDefined();
      expect(tunings['C4'].ratio).toBe('1/1');

      // The tritone in Young's system is not 45/32 (like in standard JI)
      expect(tunings['F#4']).toBeDefined();
      expect(tunings['F#4'].ratio).toBe('189/128');

      // Young uses 7/4 for the minor seventh
      expect(tunings['A#4']).toBeDefined();
      expect(tunings['A#4'].ratio).toBe('441/256');
    });

    it('should initialize 7-limit Centaur tuning', () => {
      const tunings = initializeTunings(440, 'centaur');

      // Check Centaur's specific 7-limit intervals
      expect(tunings['C4']).toBeDefined();
      expect(tunings['C4'].ratio).toBe('1/1');

      // Centaur's C# uses 21/20 ratio
      expect(tunings['C#4']).toBeDefined();
      expect(tunings['C#4'].ratio).toBe('21/20');
      expect(tunings['C#4'].ratioNumerator).toBe(21);
      expect(tunings['C#4'].ratioDenominator).toBe(20);

      // Centaur's A# uses 7/4
      expect(tunings['A#4']).toBeDefined();
      expect(tunings['A#4'].ratio).toBe('7/4');
      expect(tunings['A#4'].ratioNumerator).toBe(7);
      expect(tunings['A#4'].ratioDenominator).toBe(4);
    });

    it('should work with different reference frequencies', () => {
      const tunings432 = initializeTunings(432); // A4 = 432Hz
      
      expect(tunings432['A4']).toBeDefined();
      expect(tunings432['A4'].frequency).toBeCloseTo(432, 1);
      
      // C4 should be proportionally lower
      expect(tunings432['C4']).toBeDefined();
      expect(tunings432['C4'].frequency).toBeCloseTo(257.02, 1); // 261.63 * (432/440)
    });
  });
});
import { describe, it, expect } from 'vitest';
import { 
  parseRatioString, 
  getBaseNoteName, 
  getNoteOctave, 
  ratioToCents, 
  centsToRatio, 
  a4ToC4Frequency,
  calculateFrequency
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
      expect(ratioToCents(1, 1)).toBeCloseTo(0, 1);
      // Perfect fifth (3/2)
      expect(ratioToCents(3, 2)).toBeCloseTo(702, 1);
      // Perfect fourth (4/3)
      expect(ratioToCents(4, 3)).toBeCloseTo(498, 1);
      // Major third (5/4)
      expect(ratioToCents(5, 4)).toBeCloseTo(386, 1);
      // Minor third (6/5)
      expect(ratioToCents(6, 5)).toBeCloseTo(316, 1);
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
      // Very small cent values should be close to 1/1
      expect(centsToRatio(1)).toEqual([1, 1]);
      expect(centsToRatio(0.5)).toEqual([1, 1]);
    });
  });

  describe('a4ToC4Frequency', () => {
    it('should convert A4 frequency to C4 frequency', () => {
      // Standard A4 = 440Hz should give C4 ≈ 261.63Hz
      expect(a4ToC4Frequency(440)).toBeCloseTo(261.63, 1);
      
      // Test with other values
      expect(a4ToC4Frequency(432)).toBeCloseTo(257.02, 1); // A432 tuning
      expect(a4ToC4Frequency(444)).toBeCloseTo(264.13, 1);
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
});
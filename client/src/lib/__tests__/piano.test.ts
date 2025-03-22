import { describe, it, expect, vi } from 'vitest';
import { 
  createAudioContext, 
  getStandardNoteRange, 
  getMidiNoteNumber,
  getNoteSemitones
} from '../piano';

describe('Piano utilities', () => {
  describe('createAudioContext', () => {
    it('should create an AudioContext instance', () => {
      const audioContext = createAudioContext();
      expect(audioContext).toBeDefined();
      expect(audioContext).toBeInstanceOf(AudioContext);
    });
  });
  
  describe('getStandardNoteRange', () => {
    it('should generate correct piano keys for a given range', () => {
      const keys = getStandardNoteRange('C4', 'E4');
      
      expect(keys).toHaveLength(5); // C4, C#4, D4, D#4, E4
      expect(keys[0]).toEqual({ note: 'C4', isBlack: false });
      expect(keys[1]).toEqual({ note: 'C#4', isBlack: true });
      expect(keys[2]).toEqual({ note: 'D4', isBlack: false });
      expect(keys[3]).toEqual({ note: 'D#4', isBlack: true });
      expect(keys[4]).toEqual({ note: 'E4', isBlack: false });
    });
    
    it('should handle ranges across multiple octaves', () => {
      const keys = getStandardNoteRange('A3', 'C4');
      
      expect(keys).toHaveLength(4); // A3, A#3, B3, C4
      expect(keys[0]).toEqual({ note: 'A3', isBlack: false });
      expect(keys[3]).toEqual({ note: 'C4', isBlack: false });
    });
    
    it('should throw error for invalid note formats', () => {
      expect(() => getStandardNoteRange('invalid', 'C4')).toThrow();
      expect(() => getStandardNoteRange('C4', 'invalid')).toThrow();
    });
    
    it('should handle the full piano range from A2 to C6', () => {
      const keys = getStandardNoteRange('A2', 'C6');
      
      // A2 to C6 spans over three octaves = A2 to G3 (11 notes) + A3 to G4 (12 notes) + A4 to G5 (12 notes) + A5 to C6 (5 notes) = 40 notes
      expect(keys).toHaveLength(40);
      expect(keys[0]).toEqual({ note: 'A2', isBlack: false });
      expect(keys[keys.length - 1]).toEqual({ note: 'C6', isBlack: false });
    });
  });
  
  describe('getMidiNoteNumber', () => {
    it('should return correct MIDI note numbers', () => {
      expect(getMidiNoteNumber('A4')).toBe(69); // A4 = 69 (standard reference)
      expect(getMidiNoteNumber('C4')).toBe(60); // C4 = 60
      expect(getMidiNoteNumber('C5')).toBe(72); // C5 = 72 (one octave above C4)
      expect(getMidiNoteNumber('C3')).toBe(48); // C3 = 48 (one octave below C4)
      expect(getMidiNoteNumber('G4')).toBe(67); // G4 = 67
      expect(getMidiNoteNumber('F#3')).toBe(54); // F#3 = 54
    });
    
    it('should throw error for invalid note formats', () => {
      expect(() => getMidiNoteNumber('invalid')).toThrow();
      expect(() => getMidiNoteNumber('H4')).toThrow(); // H is not a valid note name
      expect(() => getMidiNoteNumber('C')).toThrow(); // Missing octave
    });
  });
  
  describe('getNoteSemitones', () => {
    it('should return correct semitone differences from A4', () => {
      expect(getNoteSemitones('A4')).toBe(0); // A4 is the reference, so 0 semitones difference
      expect(getNoteSemitones('C4')).toBe(-9); // C4 is 9 semitones below A4
      expect(getNoteSemitones('C5')).toBe(3); // C5 is 3 semitones above A4
      expect(getNoteSemitones('A3')).toBe(-12); // A3 is one octave (12 semitones) below A4
      expect(getNoteSemitones('A5')).toBe(12); // A5 is one octave (12 semitones) above A4
    });
    
    it('should throw error for invalid note formats (inherited from getMidiNoteNumber)', () => {
      expect(() => getNoteSemitones('invalid')).toThrow();
    });
  });
});
import '@testing-library/jest-dom';

// Mock the Web Audio API for tests
class AudioContextMock {
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 440 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  
  createGain() {
    return {
      gain: { value: 0, linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  destination: any = {};
  currentTime: number = 0;
}

// Define global AudioContext mock
global.AudioContext = AudioContextMock as any;

// Workaround: Mock window.matchMedia for component testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
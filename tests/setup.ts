import '@testing-library/jest-dom/vitest';

// Mock Web Audio API for tests
if (typeof window !== 'undefined') {
  window.AudioContext = class {
    state = 'running';
    createOscillator() {
      return {
        connect: () => {},
        start: () => {},
        stop: () => {},
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        type: 'sine'
      };
    }
    createGain() {
      return {
        connect: () => {},
        gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }
      };
    }
    createBiquadFilter() {
      return {
        connect: () => {},
        frequency: { setValueAtTime: () => {} },
        Q: { setValueAtTime: () => {} },
        type: 'lowpass'
      };
    }
    createBufferSource() {
      return {
        connect: () => {},
        start: () => {},
        buffer: null
      };
    }
    createBuffer() {
      return {
        getChannelData: () => new Float32Array(100)
      };
    }
    close() {
      return Promise.resolve();
    }
  } as any;
}

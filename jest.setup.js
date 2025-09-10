// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`
// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock environment variables for tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000/api';
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_APP_NAME = 'RentEasy Test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_DEBUG_SEARCH = 'false';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Google Maps API
global.google = {
  maps: {
    Map: jest.fn(() => ({
      setCenter: jest.fn(),
      setZoom: jest.fn(),
      addListener: jest.fn(),
    })),
    Marker: jest.fn(() => ({
      setMap: jest.fn(),
      setPosition: jest.fn(),
      addListener: jest.fn(),
    })),
    InfoWindow: jest.fn(() => ({
      setContent: jest.fn(),
      open: jest.fn(),
      close: jest.fn(),
    })),
    LatLng: jest.fn((lat, lng) => ({ lat, lng })),
    places: {
      AutocompleteService: jest.fn(),
      PlacesService: jest.fn(),
    },
  },
};

// Suppress console warnings during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

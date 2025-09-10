'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Configuration options for persisted state
export interface UsePersistedStateOptions<T> {
  // Serialization functions
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  
  // Validation function to ensure data integrity
  validate?: (value: any) => value is T;
  
  // Cache duration in milliseconds (0 = no expiration)
  ttl?: number;
  
  // Sync across browser tabs/windows
  syncAcrossTabs?: boolean;
  
  // Error handling
  onError?: (error: Error, key: string, operation: 'read' | 'write' | 'remove') => void;
  
  // Performance options
  debounceMs?: number; // Debounce writes to localStorage
}

// Extended localStorage item with metadata
interface PersistedItem<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

// Storage utilities
class PersistedStorage {
  private static debounceTimers = new Map<string, NodeJS.Timeout>();

  static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  static getItem<T>(
    key: string,
    options: UsePersistedStateOptions<T> = {}
  ): T | null {
    if (!this.isAvailable()) return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed: PersistedItem<T> = JSON.parse(item);
      
      // Check TTL expiration
      if (parsed.ttl && Date.now() > parsed.timestamp + parsed.ttl) {
        this.removeItem(key);
        return null;
      }

      // Deserialize if custom deserializer provided
      const value = options.deserialize ? options.deserialize(JSON.stringify(parsed.value)) : parsed.value;
      
      // Validate if validator provided
      if (options.validate && !options.validate(value)) {
        console.warn(`Invalid persisted data for key "${key}"`);
        this.removeItem(key);
        return null;
      }

      return value;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      options.onError?.(err, key, 'read');
      return null;
    }
  }

  static setItem<T>(
    key: string, 
    value: T, 
    options: UsePersistedStateOptions<T> = {}
  ): void {
    if (!this.isAvailable()) return;

    const performWrite = () => {
      try {
        const serializedValue = options.serialize ? options.serialize(value) : JSON.stringify(value);
        const item: PersistedItem<T> = {
          value: options.serialize ? JSON.parse(serializedValue) : value,
          timestamp: Date.now(),
          ttl: options.ttl,
        };
        
        localStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        options.onError?.(err, key, 'write');
      }
    };

    // Debounce writes if specified
    if (options.debounceMs && options.debounceMs > 0) {
      const existingTimer = this.debounceTimers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        performWrite();
        this.debounceTimers.delete(key);
      }, options.debounceMs);

      this.debounceTimers.set(key, timer);
    } else {
      performWrite();
    }
  }

  static removeItem(key: string, options: UsePersistedStateOptions<any> = {}): void {
    if (!this.isAvailable()) return;

    try {
      localStorage.removeItem(key);
      
      // Clear any pending debounced writes
      const timer = this.debounceTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.debounceTimers.delete(key);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      options.onError?.(err, key, 'remove');
    }
  }

  static clear(): void {
    if (!this.isAvailable()) return;
    
    try {
      localStorage.clear();
      
      // Clear all debounce timers
      this.debounceTimers.forEach(timer => clearTimeout(timer));
      this.debounceTimers.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

/**
 * Enterprise-grade hook for persisting state to localStorage with advanced features
 * 
 * Features:
 * - Type-safe operations with TypeScript
 * - TTL (time-to-live) support with automatic expiration
 * - Cross-tab synchronization via storage events
 * - Custom serialization/deserialization
 * - Data validation with custom validators
 * - Error handling with callbacks
 * - Debounced writes for performance
 * - SSR compatibility
 * 
 * @param key - Unique key for localStorage
 * @param initialValue - Initial value if no stored value exists
 * @param options - Configuration options
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  options: UsePersistedStateOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, { 
  remove: () => void; 
  reset: () => void; 
  isLoaded: boolean; 
  error: Error | null 
}] {
  const [state, setState] = useState<T>(() => {
    // During SSR, return initial value immediately
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    const persisted = PersistedStorage.getItem(key, options);
    return persisted !== null ? persisted : initialValue;
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const initialValueRef = useRef(initialValue);
  const optionsRef = useRef(options);

  // Update refs when values change
  useEffect(() => {
    initialValueRef.current = initialValue;
    optionsRef.current = options;
  }, [initialValue, options]);

  // Initialize state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const persisted = PersistedStorage.getItem(key, optionsRef.current);
      if (persisted !== null) {
        setState(persisted);
      }
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoaded(true);
    }
  }, [key]);

  // Set up cross-tab synchronization
  useEffect(() => {
    if (!optionsRef.current.syncAcrossTabs || typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsed: PersistedItem<T> = JSON.parse(e.newValue);
          
          // Check TTL
          if (parsed.ttl && Date.now() > parsed.timestamp + parsed.ttl) {
            return;
          }

          const value = optionsRef.current.deserialize 
            ? optionsRef.current.deserialize(JSON.stringify(parsed.value)) 
            : parsed.value;
            
          // Validate if validator provided
          if (optionsRef.current.validate && !optionsRef.current.validate(value)) {
            return;
          }

          setState(value);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          optionsRef.current.onError?.(err, key, 'read');
        }
      } else if (e.key === key && e.newValue === null) {
        // Value was removed in another tab
        setState(initialValueRef.current);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Setter function
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;
      
      // Persist to localStorage
      try {
        PersistedStorage.setItem(key, newValue, optionsRef.current);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      }
      
      return newValue;
    });
  }, [key]);

  // Utility functions
  const remove = useCallback(() => {
    setState(initialValueRef.current);
    PersistedStorage.removeItem(key, optionsRef.current);
  }, [key]);

  const reset = useCallback(() => {
    setState(initialValueRef.current);
    PersistedStorage.setItem(key, initialValueRef.current, optionsRef.current);
  }, [key]);

  return [state, setValue, { remove, reset, isLoaded, error }];
}

/**
 * Convenience hook for persisting objects with automatic JSON serialization
 */
export function usePersistedObject<T extends Record<string, any>>(
  key: string,
  initialValue: T,
  options: Omit<UsePersistedStateOptions<T>, 'serialize' | 'deserialize'> = {}
) {
  return usePersistedState(key, initialValue, {
    ...options,
    serialize: (value) => JSON.stringify(value),
    deserialize: (value) => JSON.parse(value),
  });
}

/**
 * Convenience hook for persisting arrays
 */
export function usePersistedArray<T>(
  key: string,
  initialValue: T[] = [],
  options: UsePersistedStateOptions<T[]> = {}
) {
  return usePersistedState(key, initialValue, {
    validate: (value): value is T[] => Array.isArray(value),
    ...options,
  });
}

/**
 * Hook for persisting user preferences with validation
 */
export function usePersistedPreferences<T extends Record<string, any>>(
  key: string,
  defaultPreferences: T,
  schema?: (value: any) => value is T
) {
  return usePersistedState(key, defaultPreferences, {
    validate: schema,
    syncAcrossTabs: true,
    debounceMs: 500, // Debounce preference saves
    onError: (error, key, operation) => {
      console.error(`Preference storage error (${operation}) for key "${key}":`, error);
    },
  });
}

/**
 * Hook for temporary cached data with TTL
 */
export function usePersistedCache<T>(
  key: string,
  initialValue: T,
  ttlMs: number = 5 * 60 * 1000 // Default 5 minutes
) {
  return usePersistedState(key, initialValue, {
    ttl: ttlMs,
    onError: (error, key, operation) => {
      console.warn(`Cache operation failed (${operation}) for key "${key}":`, error);
    },
  });
}

export default usePersistedState;
/**
 * @fileoverview useContentVisibility Hook
 * 
 * Simple but effective hook for managing show/hide states for content sections
 * like amenities, reviews, descriptions, etc. with localStorage persistence.
 */

import { useState, useCallback, useEffect } from 'react';
import type { ContentVisibilityState } from '../types/PropertyDetails';

/**
 * Configuration options for content visibility
 */
export interface UseContentVisibilityOptions {
  // Initial state
  initialState?: Partial<ContentVisibilityState>;
  
  // Persistence
  enableLocalStorage?: boolean;
  localStorageKey?: string;
  
  // Animation options
  enableAnimations?: boolean;
  animationDuration?: number;
  
  // Event handlers
  onVisibilityChange?: (section: keyof ContentVisibilityState, visible: boolean) => void;
}

/**
 * Individual section visibility control
 */
export interface SectionVisibility {
  isVisible: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
}

/**
 * Return type for useContentVisibility hook
 */
export interface UseContentVisibilityReturn {
  // Individual sections
  amenities: SectionVisibility;
  reviews: SectionVisibility;
  rules: SectionVisibility;
  description: SectionVisibility;
  
  // Batch operations
  showAll: () => void;
  hideAll: () => void;
  resetToDefaults: () => void;
  
  // State access
  state: ContentVisibilityState;
  
  // Utilities
  isAnyVisible: boolean;
  isAllVisible: boolean;
  visibleCount: number;
}

/**
 * Default configuration
 */
const DEFAULT_OPTIONS: Required<UseContentVisibilityOptions> = {
  initialState: {
    showAllAmenities: false,
    showAllReviews: false,
    showAllRules: false,
    showFullDescription: false,
  },
  enableLocalStorage: true,
  localStorageKey: 'propertyContentVisibility',
  enableAnimations: true,
  animationDuration: 300,
  onVisibilityChange: () => {},
};

/**
 * Load state from localStorage
 */
function loadFromLocalStorage(key: string): Partial<ContentVisibilityState> | null {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load content visibility state from localStorage:', error);
  }
  return null;
}

/**
 * Save state to localStorage
 */
function saveToLocalStorage(key: string, state: ContentVisibilityState): void {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save content visibility state to localStorage:', error);
  }
}

/**
 * Create section visibility control
 */
function createSectionControl(
  isVisible: boolean,
  setter: (value: boolean) => void,
  sectionName: keyof ContentVisibilityState,
  onVisibilityChange: (section: keyof ContentVisibilityState, visible: boolean) => void
): SectionVisibility {
  const toggle = () => {
    const newValue = !isVisible;
    setter(newValue);
    onVisibilityChange(sectionName, newValue);
  };
  
  const show = () => {
    if (!isVisible) {
      setter(true);
      onVisibilityChange(sectionName, true);
    }
  };
  
  const hide = () => {
    if (isVisible) {
      setter(false);
      onVisibilityChange(sectionName, false);
    }
  };
  
  return {
    isVisible,
    toggle,
    show,
    hide,
  };
}

/**
 * Main useContentVisibility hook
 */
export function useContentVisibility(
  options: Partial<UseContentVisibilityOptions> = {}
): UseContentVisibilityReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  // Load initial state from localStorage or use defaults
  const getInitialState = useCallback((): ContentVisibilityState => {
    let initialState = { ...config.initialState } as ContentVisibilityState;
    
    if (config.enableLocalStorage) {
      const stored = loadFromLocalStorage(config.localStorageKey);
      if (stored) {
        initialState = { ...initialState, ...stored };
      }
    }
    
    // Ensure all required properties exist
    return {
      showAllAmenities: initialState.showAllAmenities ?? false,
      showAllReviews: initialState.showAllReviews ?? false,
      showAllRules: initialState.showAllRules ?? false,
      showFullDescription: initialState.showFullDescription ?? false,
    };
  }, [config.initialState, config.enableLocalStorage, config.localStorageKey]);
  
  const [state, setState] = useState<ContentVisibilityState>(getInitialState);
  
  // Save to localStorage when state changes
  useEffect(() => {
    if (config.enableLocalStorage) {
      saveToLocalStorage(config.localStorageKey, state);
    }
  }, [state, config.enableLocalStorage, config.localStorageKey]);
  
  /**
   * Individual section setters
   */
  const setShowAllAmenities = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, showAllAmenities: value }));
  }, []);
  
  const setShowAllReviews = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, showAllReviews: value }));
  }, []);
  
  const setShowAllRules = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, showAllRules: value }));
  }, []);
  
  const setShowFullDescription = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, showFullDescription: value }));
  }, []);
  
  /**
   * Create section controls
   */
  const amenities = createSectionControl(
    state.showAllAmenities,
    setShowAllAmenities,
    'showAllAmenities',
    config.onVisibilityChange
  );
  
  const reviews = createSectionControl(
    state.showAllReviews,
    setShowAllReviews,
    'showAllReviews',
    config.onVisibilityChange
  );
  
  const rules = createSectionControl(
    state.showAllRules,
    setShowAllRules,
    'showAllRules',
    config.onVisibilityChange
  );
  
  const description = createSectionControl(
    state.showFullDescription,
    setShowFullDescription,
    'showFullDescription',
    config.onVisibilityChange
  );
  
  /**
   * Batch operations
   */
  const showAll = useCallback(() => {
    const newState: ContentVisibilityState = {
      showAllAmenities: true,
      showAllReviews: true,
      showAllRules: true,
      showFullDescription: true,
    };
    
    setState(newState);
    
    // Notify for each changed section
    Object.entries(newState).forEach(([key, value]) => {
      if (state[key as keyof ContentVisibilityState] !== value) {
        config.onVisibilityChange(key as keyof ContentVisibilityState, value);
      }
    });
  }, [state, config.onVisibilityChange]);
  
  const hideAll = useCallback(() => {
    const newState: ContentVisibilityState = {
      showAllAmenities: false,
      showAllReviews: false,
      showAllRules: false,
      showFullDescription: false,
    };
    
    setState(newState);
    
    // Notify for each changed section
    Object.entries(newState).forEach(([key, value]) => {
      if (state[key as keyof ContentVisibilityState] !== value) {
        config.onVisibilityChange(key as keyof ContentVisibilityState, value);
      }
    });
  }, [state, config.onVisibilityChange]);
  
  const resetToDefaults = useCallback(() => {
    const defaultState = getInitialState();
    setState(defaultState);
    
    // Notify for each changed section
    Object.entries(defaultState).forEach(([key, value]) => {
      if (state[key as keyof ContentVisibilityState] !== value) {
        config.onVisibilityChange(key as keyof ContentVisibilityState, value);
      }
    });
  }, [getInitialState, state, config.onVisibilityChange]);
  
  /**
   * Computed properties
   */
  const visibleSections = Object.values(state).filter(Boolean);
  const isAnyVisible = visibleSections.length > 0;
  const isAllVisible = visibleSections.length === 4;
  const visibleCount = visibleSections.length;
  
  return {
    // Individual sections
    amenities,
    reviews,
    rules,
    description,
    
    // Batch operations
    showAll,
    hideAll,
    resetToDefaults,
    
    // State access
    state,
    
    // Utilities
    isAnyVisible,
    isAllVisible,
    visibleCount,
  };
}

/**
 * Utility hook for managing a single content section
 */
export function useSectionVisibility(
  initialVisible: boolean = false,
  onToggle?: (visible: boolean) => void
): SectionVisibility {
  const [isVisible, setIsVisible] = useState(initialVisible);
  
  const toggle = useCallback(() => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    onToggle?.(newValue);
  }, [isVisible, onToggle]);
  
  const show = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true);
      onToggle?.(true);
    }
  }, [isVisible, onToggle]);
  
  const hide = useCallback(() => {
    if (isVisible) {
      setIsVisible(false);
      onToggle?.(false);
    }
  }, [isVisible, onToggle]);
  
  return {
    isVisible,
    toggle,
    show,
    hide,
  };
}
'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Modal types for different modals throughout the app
export type ModalType = 
  | 'login' 
  | 'register' 
  | 'profile' 
  | 'propertyDetails' 
  | 'booking' 
  | 'deleteConfirmation'
  | 'shareProperty'
  | 'imageGallery'
  | null;

// Loading overlay types for different operations
export type LoadingOverlayType = 
  | 'pageTransition'
  | 'apiRequest'
  | 'fileUpload'
  | 'authentication'
  | null;

// UI State interface
interface UIState {
  // Theme management
  theme: Theme;
  resolvedTheme: 'light' | 'dark'; // actual resolved theme (after system detection)
  
  // Modal management
  activeModal: ModalType;
  modalData: Record<string, any>; // payload data for modals
  modalHistory: ModalType[]; // for modal stacking/navigation
  
  // Loading states
  isGlobalLoading: boolean;
  loadingOverlay: LoadingOverlayType;
  loadingMessage: string | null;
  
  // Layout states
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // User preferences
  preferences: {
    reducedMotion: boolean;
    compactMode: boolean;
    showTooltips: boolean;
    autoSaveEnabled: boolean;
  };
  
  // Developer/debug states (removed in production)
  debugMode: boolean;
  debugPanel: boolean;
}

// Action types for reducer
type UIStateAction =
  // Theme actions
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_RESOLVED_THEME'; payload: 'light' | 'dark' }
  
  // Modal actions
  | { type: 'OPEN_MODAL'; payload: { modal: ModalType; data?: Record<string, any> } }
  | { type: 'CLOSE_MODAL' }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'GO_BACK_MODAL' }
  
  // Loading actions
  | { type: 'SET_GLOBAL_LOADING'; payload: boolean }
  | { type: 'SET_LOADING_OVERLAY'; payload: { type: LoadingOverlayType; message?: string } }
  
  // Layout actions
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'TOGGLE_MOBILE_MENU' }
  | { type: 'SET_MOBILE_MENU_OPEN'; payload: boolean }
  
  // Preference actions
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UIState['preferences']> }
  | { type: 'RESET_PREFERENCES' }
  
  // Debug actions (development only)
  | { type: 'SET_DEBUG_MODE'; payload: boolean }
  | { type: 'TOGGLE_DEBUG_PANEL' };

// Context interface
interface UIStateContextType {
  // State
  state: UIState;
  
  // Theme methods
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  
  // Modal methods
  openModal: (modal: ModalType, data?: Record<string, any>) => void;
  closeModal: () => void;
  closeAllModals: () => void;
  goBackModal: () => void;
  
  // Loading methods
  setGlobalLoading: (loading: boolean) => void;
  showLoadingOverlay: (type: LoadingOverlayType, message?: string) => void;
  hideLoadingOverlay: () => void;
  
  // Layout methods
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Preference methods
  updatePreferences: (preferences: Partial<UIState['preferences']>) => void;
  resetPreferences: () => void;
  
  // Utility methods
  isModalOpen: (modal: ModalType) => boolean;
  hasActiveModal: () => boolean;
  
  // Debug methods (development only)
  setDebugMode: (enabled: boolean) => void;
  toggleDebugPanel: () => void;
}

// Default preferences
const DEFAULT_PREFERENCES: UIState['preferences'] = {
  reducedMotion: false,
  compactMode: false,
  showTooltips: true,
  autoSaveEnabled: true,
};

// Initial state
const initialState: UIState = {
  theme: 'system',
  resolvedTheme: 'light',
  activeModal: null,
  modalData: {},
  modalHistory: [],
  isGlobalLoading: false,
  loadingOverlay: null,
  loadingMessage: null,
  sidebarOpen: false,
  mobileMenuOpen: false,
  preferences: DEFAULT_PREFERENCES,
  debugMode: process.env.NODE_ENV === 'development',
  debugPanel: false,
};

// Load state from localStorage
const loadPersistedState = (): Partial<UIState> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const saved = localStorage.getItem('ui-state');
    if (!saved) return {};
    
    const parsed = JSON.parse(saved);
    return {
      theme: parsed.theme || 'system',
      preferences: { ...DEFAULT_PREFERENCES, ...parsed.preferences },
      sidebarOpen: parsed.sidebarOpen || false,
      debugMode: process.env.NODE_ENV === 'development' && parsed.debugMode,
    };
  } catch {
    return {};
  }
};

// Save state to localStorage
const savePersistedState = (state: UIState): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const toSave = {
      theme: state.theme,
      preferences: state.preferences,
      sidebarOpen: state.sidebarOpen,
      debugMode: state.debugMode,
    };
    localStorage.setItem('ui-state', JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save UI state:', error);
  }
};

// State reducer
function uiStateReducer(state: UIState, action: UIStateAction): UIState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
      
    case 'SET_RESOLVED_THEME':
      return { ...state, resolvedTheme: action.payload };
      
    case 'OPEN_MODAL': {
      const { modal, data = {} } = action.payload;
      const newHistory = state.activeModal ? [...state.modalHistory, state.activeModal] : state.modalHistory;
      return {
        ...state,
        activeModal: modal,
        modalData: data,
        modalHistory: newHistory,
      };
    }
    
    case 'CLOSE_MODAL': {
      return {
        ...state,
        activeModal: null,
        modalData: {},
        modalHistory: [],
      };
    }
    
    case 'CLOSE_ALL_MODALS':
      return {
        ...state,
        activeModal: null,
        modalData: {},
        modalHistory: [],
      };
      
    case 'GO_BACK_MODAL': {
      const previousModal = state.modalHistory[state.modalHistory.length - 1] || null;
      const newHistory = state.modalHistory.slice(0, -1);
      return {
        ...state,
        activeModal: previousModal,
        modalHistory: newHistory,
        modalData: {}, // Clear modal data when going back
      };
    }
    
    case 'SET_GLOBAL_LOADING':
      return { ...state, isGlobalLoading: action.payload };
      
    case 'SET_LOADING_OVERLAY':
      return {
        ...state,
        loadingOverlay: action.payload.type,
        loadingMessage: action.payload.message || null,
      };
      
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
      
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
      
    case 'TOGGLE_MOBILE_MENU':
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };
      
    case 'SET_MOBILE_MENU_OPEN':
      return { ...state, mobileMenuOpen: action.payload };
      
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
      
    case 'RESET_PREFERENCES':
      return { ...state, preferences: DEFAULT_PREFERENCES };
      
    case 'SET_DEBUG_MODE':
      return { ...state, debugMode: action.payload };
      
    case 'TOGGLE_DEBUG_PANEL':
      return { ...state, debugPanel: !state.debugPanel };
      
    default:
      return state;
  }
}

// Context creation
const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

// Provider component
export function UIStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiStateReducer, {
    ...initialState,
    ...loadPersistedState(),
  });

  // Theme methods
  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = state.resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [state.resolvedTheme, setTheme]);

  // Modal methods
  const openModal = useCallback((modal: ModalType, data?: Record<string, any>) => {
    dispatch({ type: 'OPEN_MODAL', payload: { modal, data } });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const closeAllModals = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_MODALS' });
  }, []);

  const goBackModal = useCallback(() => {
    dispatch({ type: 'GO_BACK_MODAL' });
  }, []);

  // Loading methods
  const setGlobalLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_GLOBAL_LOADING', payload: loading });
  }, []);

  const showLoadingOverlay = useCallback((type: LoadingOverlayType, message?: string) => {
    dispatch({ type: 'SET_LOADING_OVERLAY', payload: { type, message } });
  }, []);

  const hideLoadingOverlay = useCallback(() => {
    dispatch({ type: 'SET_LOADING_OVERLAY', payload: { type: null } });
  }, []);

  // Layout methods
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  }, []);

  const toggleMobileMenu = useCallback(() => {
    dispatch({ type: 'TOGGLE_MOBILE_MENU' });
  }, []);

  const setMobileMenuOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_MOBILE_MENU_OPEN', payload: open });
  }, []);

  // Preference methods
  const updatePreferences = useCallback((preferences: Partial<UIState['preferences']>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  }, []);

  const resetPreferences = useCallback(() => {
    dispatch({ type: 'RESET_PREFERENCES' });
  }, []);

  // Utility methods
  const isModalOpen = useCallback((modal: ModalType) => {
    return state.activeModal === modal;
  }, [state.activeModal]);

  const hasActiveModal = useCallback(() => {
    return state.activeModal !== null;
  }, [state.activeModal]);

  // Debug methods
  const setDebugMode = useCallback((enabled: boolean) => {
    if (process.env.NODE_ENV === 'development') {
      dispatch({ type: 'SET_DEBUG_MODE', payload: enabled });
    }
  }, []);

  const toggleDebugPanel = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      dispatch({ type: 'TOGGLE_DEBUG_PANEL' });
    }
  }, []);

  // System theme detection
  useEffect(() => {
    if (state.theme !== 'system') {
      dispatch({ type: 'SET_RESOLVED_THEME', payload: state.theme });
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateResolvedTheme = () => {
      dispatch({ type: 'SET_RESOLVED_THEME', payload: mediaQuery.matches ? 'dark' : 'light' });
    };

    updateResolvedTheme();
    mediaQuery.addEventListener('change', updateResolvedTheme);
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [state.theme]);

  // Persist state changes
  useEffect(() => {
    savePersistedState(state);
  }, [state.theme, state.preferences, state.sidebarOpen, state.debugMode]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (state.mobileMenuOpen) {
          setMobileMenuOpen(false);
        } else if (state.activeModal) {
          closeModal();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [state.mobileMenuOpen, state.activeModal, setMobileMenuOpen, closeModal]);

  const contextValue: UIStateContextType = {
    state,
    setTheme,
    toggleTheme,
    openModal,
    closeModal,
    closeAllModals,
    goBackModal,
    setGlobalLoading,
    showLoadingOverlay,
    hideLoadingOverlay,
    toggleSidebar,
    setSidebarOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
    updatePreferences,
    resetPreferences,
    isModalOpen,
    hasActiveModal,
    setDebugMode,
    toggleDebugPanel,
  };

  return (
    <UIStateContext.Provider value={contextValue}>
      {children}
    </UIStateContext.Provider>
  );
}

// Hook to use UI state context
export function useUIState() {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
}

// Convenience hooks for specific UI state aspects
export function useTheme() {
  const { state, setTheme, toggleTheme } = useUIState();
  return {
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    setTheme,
    toggleTheme,
  };
}

export function useModal() {
  const { state, openModal, closeModal, closeAllModals, goBackModal, isModalOpen, hasActiveModal } = useUIState();
  return {
    activeModal: state.activeModal,
    modalData: state.modalData,
    modalHistory: state.modalHistory,
    openModal,
    closeModal,
    closeAllModals,
    goBackModal,
    isModalOpen,
    hasActiveModal,
  };
}

export function useLoadingOverlay() {
  const { state, setGlobalLoading, showLoadingOverlay, hideLoadingOverlay } = useUIState();
  return {
    isGlobalLoading: state.isGlobalLoading,
    loadingOverlay: state.loadingOverlay,
    loadingMessage: state.loadingMessage,
    setGlobalLoading,
    showLoadingOverlay,
    hideLoadingOverlay,
  };
}

export function useLayout() {
  const { state, toggleSidebar, setSidebarOpen, toggleMobileMenu, setMobileMenuOpen } = useUIState();
  return {
    sidebarOpen: state.sidebarOpen,
    mobileMenuOpen: state.mobileMenuOpen,
    toggleSidebar,
    setSidebarOpen,
    toggleMobileMenu,
    setMobileMenuOpen,
  };
}

export function usePreferences() {
  const { state, updatePreferences, resetPreferences } = useUIState();
  return {
    preferences: state.preferences,
    updatePreferences,
    resetPreferences,
  };
}

export default UIStateContext;
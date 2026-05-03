'use client';

import React, { createContext, ReactNode, useCallback, useContext, useMemo, useReducer } from 'react';
import { Property, SearchParams } from '@/lib/api';
import {
  createReducer,
  createAction,
  update,
  updateNested,
  toggleInArray,
  appendToArray,
  type Action
} from '@/lib/state';

/**
 * FUNCTIONAL PROGRAMMING SEARCH CONTEXT
 *
 * Complete rewrite using FP principles:
 * - Immutable state with readonly types
 * - Discriminated union action types
 * - Pure reducer functions
 * - Memoized selectors and dispatchers
 * - Zero mutations
 *
 * Team B - Dev 1 (lead), Dev 3 (hooks), Dev 5 (optimization)
 */

// ============================================================================
// TYPES - Complete Immutability
// ============================================================================

export interface SearchFormData {
  readonly location: string;
  readonly checkIn: Date | null;
  readonly checkOut: Date | null;
  readonly guests: {
    readonly adults: number;
    readonly children: number;
    readonly infants: number;
  };
}

export interface SearchResults {
  readonly properties: readonly Property[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export interface SearchFilters {
  readonly priceRange: readonly [number, number];
  readonly bedrooms: number | null;
  readonly bathrooms: number | null;
  readonly amenities: readonly string[];
  readonly propertyTypes: readonly string[];
}

export type SortOption =
  | 'price_low_high'
  | 'price_high_low'
  | 'rating'
  | 'newest';

export interface SearchHistoryItem {
  readonly id: string;
  readonly formData: SearchFormData;
  readonly timestamp: number;
}

interface SearchState {
  readonly formData: SearchFormData;
  readonly results: SearchResults;
  readonly filters: SearchFilters;
  readonly sortBy: SortOption;
  readonly history: readonly SearchHistoryItem[];
}

// ============================================================================
// ACTIONS - Discriminated Union Types
// ============================================================================

type SearchAction =
  // Form data actions
  | { type: 'UPDATE_LOCATION'; payload: string }
  | { type: 'UPDATE_DATES'; payload: { checkIn: Date | null; checkOut: Date | null } }
  | { type: 'UPDATE_GUESTS'; payload: Partial<SearchFormData['guests']> }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<SearchFormData> }
  | { type: 'RESET_FORM' }

  // Results actions
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; payload: { properties: readonly Property[]; total: number; page: number; totalPages: number } }
  | { type: 'SEARCH_ERROR'; payload: string }
  | { type: 'CLEAR_RESULTS' }

  // Filter actions
  | { type: 'UPDATE_PRICE_RANGE'; payload: readonly [number, number] }
  | { type: 'UPDATE_BEDROOMS'; payload: number | null }
  | { type: 'UPDATE_BATHROOMS'; payload: number | null }
  | { type: 'TOGGLE_AMENITY'; payload: string }
  | { type: 'TOGGLE_PROPERTY_TYPE'; payload: string }
  | { type: 'RESET_FILTERS' }

  // Sort action
  | { type: 'UPDATE_SORT'; payload: SortOption }

  // History actions
  | { type: 'ADD_TO_HISTORY'; payload: SearchFormData }
  | { type: 'CLEAR_HISTORY' };

// ============================================================================
// ACTION CREATORS - Pure Functions
// ============================================================================

const updateLocation = createAction<{ type: 'UPDATE_LOCATION'; payload: string }>('UPDATE_LOCATION');
const updateDates = createAction<{ type: 'UPDATE_DATES'; payload: { checkIn: Date | null; checkOut: Date | null } }>('UPDATE_DATES');
const updateGuests = createAction<{ type: 'UPDATE_GUESTS'; payload: Partial<SearchFormData['guests']> }>('UPDATE_GUESTS');
const updateFormData = createAction<{ type: 'UPDATE_FORM_DATA'; payload: Partial<SearchFormData> }>('UPDATE_FORM_DATA');
const resetForm = createAction<{ type: 'RESET_FORM' }>('RESET_FORM');

const searchStart = createAction<{ type: 'SEARCH_START' }>('SEARCH_START');
const searchSuccess = createAction<{ type: 'SEARCH_SUCCESS'; payload: { properties: readonly Property[]; total: number; page: number; totalPages: number } }>('SEARCH_SUCCESS');
const searchError = createAction<{ type: 'SEARCH_ERROR'; payload: string }>('SEARCH_ERROR');
const clearResults = createAction<{ type: 'CLEAR_RESULTS' }>('CLEAR_RESULTS');

const updatePriceRange = createAction<{ type: 'UPDATE_PRICE_RANGE'; payload: readonly [number, number] }>('UPDATE_PRICE_RANGE');
const updateBedrooms = createAction<{ type: 'UPDATE_BEDROOMS'; payload: number | null }>('UPDATE_BEDROOMS');
const updateBathrooms = createAction<{ type: 'UPDATE_BATHROOMS'; payload: number | null }>('UPDATE_BATHROOMS');
const toggleAmenity = createAction<{ type: 'TOGGLE_AMENITY'; payload: string }>('TOGGLE_AMENITY');
const togglePropertyType = createAction<{ type: 'TOGGLE_PROPERTY_TYPE'; payload: string }>('TOGGLE_PROPERTY_TYPE');
const resetFilters = createAction<{ type: 'RESET_FILTERS' }>('RESET_FILTERS');

const updateSort = createAction<{ type: 'UPDATE_SORT'; payload: SortOption }>('UPDATE_SORT');

const addToHistory = createAction<{ type: 'ADD_TO_HISTORY'; payload: SearchFormData }>('ADD_TO_HISTORY');
const clearHistory = createAction<{ type: 'CLEAR_HISTORY' }>('CLEAR_HISTORY');

// ============================================================================
// INITIAL STATE
// ============================================================================

const defaultFormData: SearchFormData = {
  location: '',
  checkIn: null,
  checkOut: null,
  guests: {
    adults: 1,
    children: 0,
    infants: 0,
  },
};

const defaultFilters: SearchFilters = {
  priceRange: [0, 1000],
  bedrooms: null,
  bathrooms: null,
  amenities: [],
  propertyTypes: [],
};

const defaultResults: SearchResults = {
  properties: [],
  total: 0,
  page: 1,
  totalPages: 0,
  isLoading: false,
  error: null,
};

const initialState: SearchState = {
  formData: defaultFormData,
  results: defaultResults,
  filters: defaultFilters,
  sortBy: 'price_low_high',
  history: [],
};

// ============================================================================
// REDUCER - Pure State Transitions
// ============================================================================

const searchReducer = createReducer<SearchState, SearchAction>(
  initialState,
  {
    // Form data handlers
    UPDATE_LOCATION: (state, action) =>
      updateNested(state, 'formData', (formData) =>
        update(formData, { location: action.payload })
      ),

    UPDATE_DATES: (state, action) =>
      updateNested(state, 'formData', (formData) =>
        update(formData, {
          checkIn: action.payload.checkIn,
          checkOut: action.payload.checkOut,
        })
      ),

    UPDATE_GUESTS: (state, action) =>
      updateNested(state, 'formData', (formData) =>
        updateNested(formData, 'guests', (guests) =>
          update(guests, action.payload)
        )
      ),

    UPDATE_FORM_DATA: (state, action) =>
      updateNested(state, 'formData', (formData) =>
        update(formData, action.payload)
      ),

    RESET_FORM: (state) =>
      update(state, { formData: defaultFormData }),

    // Results handlers
    SEARCH_START: (state) =>
      updateNested(state, 'results', (results) =>
        update(results, { isLoading: true, error: null })
      ),

    SEARCH_SUCCESS: (state, action) =>
      updateNested(state, 'results', (results) =>
        update(results, {
          properties: action.payload.properties,
          total: action.payload.total,
          page: action.payload.page,
          totalPages: action.payload.totalPages,
          isLoading: false,
          error: null,
        })
      ),

    SEARCH_ERROR: (state, action) =>
      updateNested(state, 'results', (results) =>
        update(results, {
          isLoading: false,
          error: action.payload,
        })
      ),

    CLEAR_RESULTS: (state) =>
      update(state, { results: defaultResults }),

    // Filter handlers
    UPDATE_PRICE_RANGE: (state, action) =>
      updateNested(state, 'filters', (filters) =>
        update(filters, { priceRange: action.payload })
      ),

    UPDATE_BEDROOMS: (state, action) =>
      updateNested(state, 'filters', (filters) =>
        update(filters, { bedrooms: action.payload })
      ),

    UPDATE_BATHROOMS: (state, action) =>
      updateNested(state, 'filters', (filters) =>
        update(filters, { bathrooms: action.payload })
      ),

    TOGGLE_AMENITY: (state, action) =>
      updateNested(state, 'filters', (filters) =>
        updateNested(filters, 'amenities', (amenities) =>
          toggleInArray(amenities, action.payload)
        )
      ),

    TOGGLE_PROPERTY_TYPE: (state, action) =>
      updateNested(state, 'filters', (filters) =>
        updateNested(filters, 'propertyTypes', (types) =>
          toggleInArray(types, action.payload)
        )
      ),

    RESET_FILTERS: (state) =>
      update(state, { filters: defaultFilters }),

    // Sort handler
    UPDATE_SORT: (state, action) =>
      update(state, { sortBy: action.payload }),

    // History handlers
    ADD_TO_HISTORY: (state, action) => {
      const historyItem: SearchHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        formData: action.payload,
        timestamp: Date.now(),
      };
      return updateNested(state, 'history', (history) =>
        appendToArray(history, historyItem)
      );
    },

    CLEAR_HISTORY: (state) =>
      update(state, { history: [] }),
  }
);

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface SearchContextType {
  // State
  state: SearchState;

  // Form data actions
  updateLocation: (location: string) => void;
  updateDates: (checkIn: Date | null, checkOut: Date | null) => void;
  updateGuests: (guests: Partial<SearchFormData['guests']>) => void;
  updateFormData: (data: Partial<SearchFormData>) => void;
  resetForm: () => void;

  // Search actions
  executeSearch: () => Promise<void>;
  clearResults: () => void;

  // Filter actions
  updatePriceRange: (range: readonly [number, number]) => void;
  updateBedrooms: (bedrooms: number | null) => void;
  updateBathrooms: (bathrooms: number | null) => void;
  toggleAmenity: (amenity: string) => void;
  togglePropertyType: (type: string) => void;
  resetFilters: () => void;

  // Sort action
  updateSort: (sortBy: SortOption) => void;

  // History actions
  addToHistory: (formData: SearchFormData) => void;
  clearHistory: () => void;

  // Backward compatibility
  searchData: SearchData;
  updateSearchData: (data: Partial<SearchData>) => void;
  resetSearch: () => void;
  onSearch?: (searchData: SearchData) => void;
  setOnSearch: (callback: (searchData: SearchData) => void) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT - Memoized Everything
// ============================================================================

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  const onSearchRef = React.useRef<((searchData: SearchData) => void) | undefined>();

  // Memoized action dispatchers with empty dependencies (pure functions)
  const dispatchUpdateLocation = useCallback((location: string) => {
    dispatch(updateLocation(location));
  }, []);

  const dispatchUpdateDates = useCallback((checkIn: Date | null, checkOut: Date | null) => {
    dispatch(updateDates({ checkIn, checkOut }));
  }, []);

  const dispatchUpdateGuests = useCallback((guests: Partial<SearchFormData['guests']>) => {
    dispatch(updateGuests(guests));
  }, []);

  const dispatchUpdateFormData = useCallback((data: Partial<SearchFormData>) => {
    dispatch(updateFormData(data));
  }, []);

  const dispatchResetForm = useCallback(() => {
    dispatch(resetForm());
  }, []);

  const dispatchClearResults = useCallback(() => {
    dispatch(clearResults());
  }, []);

  const dispatchUpdatePriceRange = useCallback((range: readonly [number, number]) => {
    dispatch(updatePriceRange(range));
  }, []);

  const dispatchUpdateBedrooms = useCallback((bedrooms: number | null) => {
    dispatch(updateBedrooms(bedrooms));
  }, []);

  const dispatchUpdateBathrooms = useCallback((bathrooms: number | null) => {
    dispatch(updateBathrooms(bathrooms));
  }, []);

  const dispatchToggleAmenity = useCallback((amenity: string) => {
    dispatch(toggleAmenity(amenity));
  }, []);

  const dispatchTogglePropertyType = useCallback((type: string) => {
    dispatch(togglePropertyType(type));
  }, []);

  const dispatchResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, []);

  const dispatchUpdateSort = useCallback((sortBy: SortOption) => {
    dispatch(updateSort(sortBy));
  }, []);

  const dispatchAddToHistory = useCallback((formData: SearchFormData) => {
    dispatch(addToHistory(formData));
  }, []);

  const dispatchClearHistory = useCallback(() => {
    dispatch(clearHistory());
  }, []);

  // Side effect: executeSearch (isolated from pure state)
  const executeSearch = useCallback(async () => {
    dispatch(searchStart());

    try {
      // Import API client dynamically to avoid circular dependencies
      const { api } = await import('@/lib/api');

      // Build search params from current state
      const searchParams: SearchParams = {
        location: state.formData.location || undefined,
        checkIn: state.formData.checkIn?.toISOString().split('T')[0],
        checkOut: state.formData.checkOut?.toISOString().split('T')[0],
        guests: state.formData.guests.adults + state.formData.guests.children,
        minPrice: state.filters.priceRange[0],
        maxPrice: state.filters.priceRange[1],
        bedrooms: state.filters.bedrooms || undefined,
        bathrooms: state.filters.bathrooms || undefined,
        amenities: state.filters.amenities.length > 0 ? state.filters.amenities as string[] : undefined,
      };

      const response = await api.properties.searchProperties(searchParams);

      dispatch(searchSuccess({
        properties: response.data,
        total: response.pagination.total,
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
      }));

      // Add to history
      dispatchAddToHistory(state.formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      dispatch(searchError(errorMessage));
    }
  }, [state.formData, state.filters, dispatchAddToHistory]);

  // Backward compatibility: setOnSearch callback
  const setOnSearchCallback = useCallback((callback: (searchData: SearchData) => void) => {
    onSearchRef.current = callback;
  }, []);

  // Backward compatibility: updateSearchData
  const updateSearchDataCompat = useCallback((data: Partial<SearchData>) => {
    if (data.location !== undefined) dispatchUpdateLocation(data.location);
    if (data.checkIn !== undefined || data.checkOut !== undefined) {
      dispatchUpdateDates(data.checkIn ?? state.formData.checkIn, data.checkOut ?? state.formData.checkOut);
    }
    if (data.guests !== undefined) {
      dispatchUpdateGuests(data.guests);
    }
  }, [dispatchUpdateLocation, dispatchUpdateDates, dispatchUpdateGuests, state.formData.checkIn, state.formData.checkOut]);

  // Backward compatibility: searchData getter
  const searchDataCompat: SearchData = useMemo(() => ({
    location: state.formData.location,
    checkIn: state.formData.checkIn,
    checkOut: state.formData.checkOut,
    guests: {
      adults: state.formData.guests.adults,
      children: state.formData.guests.children,
      infants: state.formData.guests.infants,
    },
  }), [state.formData]);

  // Memoized context value
  const contextValue: SearchContextType = useMemo(
    () => ({
      state,
      updateLocation: dispatchUpdateLocation,
      updateDates: dispatchUpdateDates,
      updateGuests: dispatchUpdateGuests,
      updateFormData: dispatchUpdateFormData,
      resetForm: dispatchResetForm,
      executeSearch,
      clearResults: dispatchClearResults,
      updatePriceRange: dispatchUpdatePriceRange,
      updateBedrooms: dispatchUpdateBedrooms,
      updateBathrooms: dispatchUpdateBathrooms,
      toggleAmenity: dispatchToggleAmenity,
      togglePropertyType: dispatchTogglePropertyType,
      resetFilters: dispatchResetFilters,
      updateSort: dispatchUpdateSort,
      addToHistory: dispatchAddToHistory,
      clearHistory: dispatchClearHistory,
      // Backward compatibility
      searchData: searchDataCompat,
      updateSearchData: updateSearchDataCompat,
      resetSearch: dispatchResetForm,
      onSearch: onSearchRef.current,
      setOnSearch: setOnSearchCallback,
    }),
    [
      state,
      dispatchUpdateLocation,
      dispatchUpdateDates,
      dispatchUpdateGuests,
      dispatchUpdateFormData,
      dispatchResetForm,
      executeSearch,
      dispatchClearResults,
      dispatchUpdatePriceRange,
      dispatchUpdateBedrooms,
      dispatchUpdateBathrooms,
      dispatchToggleAmenity,
      dispatchTogglePropertyType,
      dispatchResetFilters,
      dispatchUpdateSort,
      dispatchAddToHistory,
      dispatchClearHistory,
      searchDataCompat,
      updateSearchDataCompat,
      setOnSearchCallback,
    ]
  );

  return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
}

// ============================================================================
// HOOKS - Main Hook
// ============================================================================

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

// ============================================================================
// SELECTOR HOOKS - Memoized Granular Access
// ============================================================================

export function useSearchFormData() {
  const { state } = useSearch();
  return useMemo(() => state.formData, [state.formData]);
}

export function useSearchResults() {
  const { state } = useSearch();
  return useMemo(() => state.results, [state.results]);
}

export function useSearchFilters() {
  const { state } = useSearch();
  return useMemo(() => state.filters, [state.filters]);
}

export function useSearchHistory() {
  const { state } = useSearch();
  return useMemo(() => state.history, [state.history]);
}

export function useSearchSort() {
  const { state } = useSearch();
  return useMemo(() => state.sortBy, [state.sortBy]);
}

// ============================================================================
// COMPATIBILITY LAYER (for existing code)
// ============================================================================

export interface SearchData {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
}

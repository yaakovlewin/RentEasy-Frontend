'use client';

import React, { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';

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

interface SearchContextType {
  searchData: SearchData;
  updateSearchData: (data: Partial<SearchData>) => void;
  updateLocation: (location: string) => void;
  updateDates: (checkIn: Date | null, checkOut: Date | null) => void;
  updateGuests: (guests: SearchData['guests']) => void;
  resetSearch: () => void;
  onSearch?: (searchData: SearchData) => void;
  setOnSearch: (callback: (searchData: SearchData) => void) => void;
}

const defaultSearchData: SearchData = {
  location: '',
  checkIn: null,
  checkOut: null,
  guests: {
    adults: 1,
    children: 0,
    infants: 0,
  },
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [searchData, setSearchData] = useState<SearchData>(defaultSearchData);
  const onSearchRef = useRef<((searchData: SearchData) => void) | undefined>();

  const updateSearchData = useCallback((data: Partial<SearchData>) => {
    setSearchData(prev => ({
      ...prev,
      ...data,
      guests: data.guests ? { ...prev.guests, ...data.guests } : prev.guests,
    }));
  }, []);

  const updateLocation = useCallback((location: string) => {
    setSearchData(prev => ({ ...prev, location }));
  }, []);

  const updateDates = useCallback((checkIn: Date | null, checkOut: Date | null) => {
    setSearchData(prev => ({ ...prev, checkIn, checkOut }));
  }, []);

  const updateGuests = useCallback((guests: SearchData['guests']) => {
    setSearchData(prev => ({ ...prev, guests }));
  }, []);

  const resetSearch = useCallback(() => {
    setSearchData(defaultSearchData);
  }, []);

  const setOnSearchCallback = useCallback((callback: (searchData: SearchData) => void) => {
    onSearchRef.current = callback;
  }, []);

  const value: SearchContextType = {
    searchData,
    updateSearchData,
    updateLocation,
    updateDates,
    updateGuests,
    resetSearch,
    onSearch: onSearchRef.current,
    setOnSearch: setOnSearchCallback,
  };

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

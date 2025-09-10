'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MapPin, X } from 'lucide-react';

import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { Input } from '@/components/ui/input';

import { MAX_LOCATION_SUGGESTIONS, Z_INDEX } from './constants';
import { useClickOutside, useKeyboardNavigation } from './hooks';
import { cn } from './utils';

interface LocationSuggestion {
  id: string;
  name: string;
  description: string;
  type: 'city' | 'country' | 'region';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: LocationSuggestion[];
  onSuggestionSelect?: (suggestion: LocationSuggestion) => void;
  disabled?: boolean;
  loading?: boolean;
  'data-testid'?: string;
}

// Mock data - in real app, this would come from a geocoding API
const defaultSuggestions: LocationSuggestion[] = [
  { id: '1', name: 'Paris', description: 'France', type: 'city', coordinates: { lat: 48.8566, lng: 2.3522 } },
  { id: '2', name: 'London', description: 'United Kingdom', type: 'city', coordinates: { lat: 51.5074, lng: -0.1278 } },
  { id: '3', name: 'New York', description: 'New York, United States', type: 'city', coordinates: { lat: 40.7128, lng: -74.0060 } },
  { id: '4', name: 'Tokyo', description: 'Japan', type: 'city', coordinates: { lat: 35.6762, lng: 139.6503 } },
  { id: '5', name: 'Barcelona', description: 'Spain', type: 'city', coordinates: { lat: 41.3851, lng: 2.1734 } },
  { id: '6', name: 'Rome', description: 'Italy', type: 'city', coordinates: { lat: 41.9028, lng: 12.4964 } },
  { id: '7', name: 'Amsterdam', description: 'Netherlands', type: 'city', coordinates: { lat: 52.3676, lng: 4.9041 } },
  { id: '8', name: 'Berlin', description: 'Germany', type: 'city', coordinates: { lat: 52.5200, lng: 13.4050 } },
  { id: '9', name: 'Sydney', description: 'Australia', type: 'city', coordinates: { lat: -33.8688, lng: 151.2093 } },
  { id: '10', name: 'Los Angeles', description: 'California, United States', type: 'city', coordinates: { lat: 34.0522, lng: -118.2437 } },
];

/**
 * LocationInput - Enterprise-grade location search component
 * 
 * Provides an autocomplete search input for locations with keyboard navigation,
 * proper accessibility, error handling, and performance optimizations.
 * 
 * @param value - Current input value
 * @param onChange - Callback when input value changes
 * @param placeholder - Input placeholder text
 * @param className - Additional CSS classes
 * @param suggestions - Array of location suggestions
 * @param onSuggestionSelect - Callback when suggestion is selected
 * @param disabled - Whether the input is disabled
 * @param loading - Whether suggestions are loading
 * @param data-testid - Test identifier for testing
 */
const LocationInputComponent = ({
  value,
  onChange,
  placeholder = 'Where are you going?',
  className,
  suggestions = defaultSuggestions,
  onSuggestionSelect,
  disabled = false,
  loading = false,
  'data-testid': testId,
}: LocationInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Memoized filtered suggestions with performance optimization
  const filteredSuggestions = useMemo(() => {
    if (!value.trim() || loading) return [];

    const query = value.toLowerCase();
    return suggestions
      .filter(suggestion => 
        suggestion.name.toLowerCase().includes(query) ||
        suggestion.description.toLowerCase().includes(query)
      )
      .slice(0, MAX_LOCATION_SUGGESTIONS);
  }, [value, suggestions, loading]);

  // Update dropdown visibility based on filtered suggestions
  useEffect(() => {
    setIsOpen(filteredSuggestions.length > 0 && !disabled && !loading);
  }, [filteredSuggestions, disabled, loading]);

  // Memoized callbacks to prevent unnecessary re-renders
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const clearInput = useCallback(() => {
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    if (filteredSuggestions.length > 0 && !disabled && !loading) {
      setIsOpen(true);
    }
  }, [filteredSuggestions.length, disabled, loading]);

  const handleSelectSuggestion = useCallback((suggestion: LocationSuggestion) => {
    onChange(suggestion.name);
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    inputRef.current?.blur();
  }, [onChange, onSuggestionSelect]);

  useClickOutside(closeDropdown, [], [inputRef, dropdownRef]);

  const { selectedIndex, handleKeyDown, resetSelection } = useKeyboardNavigation({
    items: filteredSuggestions,
    onSelect: handleSelectSuggestion,
    onEscape: () => {
      setIsOpen(false);
      inputRef.current?.blur();
    },
    enabled: isOpen && !disabled,
  });

  // Enhanced clear function with selection reset
  const handleClear = useCallback(() => {
    clearInput();
    resetSelection();
  }, [clearInput, resetSelection]);

  // Memoized suggestion icon
  const getSuggestionIcon = useCallback((type: LocationSuggestion['type']) => {
    return <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />;
  }, []);

  // Memoized input classes
  const inputClasses = useMemo(() => 
    cn(
      'pl-10 pr-10',
      disabled && 'opacity-50 cursor-not-allowed',
      loading && 'opacity-75',
      className
    ),
    [disabled, loading, className]
  );

  return (
    <FeatureErrorBoundary
      featureName="Location Input"
      level="medium"
      enableRetry
      fallbackComponent={
        <div className="relative flex-1">
          <Input
            placeholder={placeholder}
            disabled
            className={cn('pl-10', className)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      }
    >
      <div className="relative flex-1" data-testid={testId}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            className={inputClasses}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label="Location search"
            data-testid={`${testId}-input`}
          />
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
              aria-label="Clear location"
              data-testid={`${testId}-clear`}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-primary rounded-full" />
            </div>
          )}
        </div>

        {isOpen && filteredSuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className={cn(
              'absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto',
              `z-[${Z_INDEX.DROPDOWN}]`
            )}
            role="listbox"
            data-testid={`${testId}-dropdown`}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className={cn(
                  'w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-colors',
                  index === selectedIndex && 'bg-gray-50'
                )}
                role="option"
                aria-selected={index === selectedIndex}
                data-testid={`${testId}-suggestion-${suggestion.id}`}
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{suggestion.name}</div>
                  <div className="text-sm text-gray-500 truncate">{suggestion.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </FeatureErrorBoundary>
  );
};

// Export the memoized version for performance optimization
export const LocationInput = memo(LocationInputComponent);
LocationInput.displayName = 'LocationInput';

// Export the type for external use
export type { LocationSuggestion };
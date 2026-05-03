'use client';

import { memo, useCallback, useMemo, useRef, RefObject } from 'react';
import { MapPin } from 'lucide-react';

import { FeatureErrorBoundary } from '@/components/error-boundaries';
import { Input } from '@/components/ui/input';

import { DEFAULT_LOCATION_SUGGESTIONS, MAX_LOCATION_SUGGESTIONS } from './constants';
import { useOnClickOutside, useKeyboardNavigation, useDropdownState } from './hooks';
import { LocationInputActions } from './LocationInputActions';
import { SuggestionDropdown } from './SuggestionDropdown';
import { cn } from './utils';
import type { LocationInputProps, LocationSuggestion } from './types';

const filterSuggestions = (
  suggestions: readonly LocationSuggestion[],
  query: string,
  maxResults: number
): readonly LocationSuggestion[] => {
  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase();
  const matchesSuggestion = (suggestion: LocationSuggestion): boolean =>
    suggestion.name.toLowerCase().includes(normalizedQuery) ||
    suggestion.description.toLowerCase().includes(normalizedQuery);

  return suggestions
    .filter(matchesSuggestion)
    .slice(0, maxResults);
};

const canShowDropdown = (
  hasInteracted: boolean,
  hasSuggestions: boolean,
  isDisabled: boolean,
  isLoading: boolean
): boolean => hasInteracted && hasSuggestions && !isDisabled && !isLoading;

const LocationInputComponent = ({
  value,
  onChange,
  placeholder = 'Where are you going?',
  className,
  suggestions = DEFAULT_LOCATION_SUGGESTIONS,
  onSuggestionSelect,
  disabled = false,
  loading = false,
  'data-testid': testId,
}: LocationInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { hasInteracted, markAsInteracted } = useDropdownState();

  const filteredSuggestions = useMemo(
    () => loading ? [] : filterSuggestions(suggestions, value, MAX_LOCATION_SUGGESTIONS),
    [value, suggestions, loading]
  );

  const shouldShowDropdown = canShowDropdown(
    hasInteracted,
    filteredSuggestions.length > 0,
    disabled,
    loading
  );

  const blurInput = useCallback(() => inputRef.current?.blur(), []);
  const focusInput = useCallback(() => inputRef.current?.focus(), []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    markAsInteracted();
    onChange(e.target.value);
  }, [onChange, markAsInteracted]);

  const handleSelectSuggestion = useCallback((suggestion: LocationSuggestion) => {
    onChange(suggestion.name);
    onSuggestionSelect?.(suggestion);
    blurInput();
  }, [onChange, onSuggestionSelect, blurInput]);

  const handleEscape = useCallback(() => {
    blurInput();
  }, [blurInput]);

  const { selectedIndex, handleKeyDown, resetSelection } = useKeyboardNavigation({
    items: filteredSuggestions as LocationSuggestion[],
    onSelect: handleSelectSuggestion,
    onEscape: handleEscape,
  });

  const handleClear = useCallback(() => {
    onChange('');
    resetSelection();
    focusInput();
  }, [onChange, resetSelection, focusInput]);

  const closeDropdown = useCallback(() => {
    blurInput();
  }, [blurInput]);

  useOnClickOutside(
    [inputRef as RefObject<HTMLElement>, dropdownRef as RefObject<HTMLElement>],
    closeDropdown,
    []
  );

  const inputClassName = useMemo(
    () => cn(
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
      fallback={
        <div className="relative flex-1">
          <MapPin className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <Input placeholder={placeholder} disabled className={cn('pl-10', className)} />
        </div>
      }
    >
      <div className="relative flex-1" data-testid={testId}>
        <MapPin className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />

        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={markAsInteracted}
          className={inputClassName}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={shouldShowDropdown}
          aria-haspopup="listbox"
          aria-label="Location search"
          data-testid={`${testId}-input`}
        />

        <LocationInputActions
          value={value}
          disabled={disabled}
          loading={loading}
          onClear={handleClear}
          testId={testId}
        />

        {shouldShowDropdown && (
          <SuggestionDropdown
            ref={dropdownRef}
            suggestions={filteredSuggestions}
            selectedIndex={selectedIndex}
            onSelect={handleSelectSuggestion}
            testId={testId}
          />
        )}
      </div>
    </FeatureErrorBoundary>
  );
};

export const LocationInput = memo(LocationInputComponent);
LocationInput.displayName = 'LocationInput';
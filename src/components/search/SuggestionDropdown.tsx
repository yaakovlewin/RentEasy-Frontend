'use client';

import { forwardRef, memo } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from './utils';
import { Z_INDEX } from './constants';
import type { LocationSuggestion, SuggestionItemProps } from './types';

const SuggestionItem = memo(({ suggestion, isSelected, onSelect, testId }: SuggestionItemProps) => (
  <button
    type="button"
    onClick={() => onSelect(suggestion)}
    className={cn(
      'w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-colors',
      isSelected && 'bg-gray-50'
    )}
    role="option"
    aria-selected={isSelected}
    data-testid={`${testId}-suggestion-${suggestion.id}`}
  >
    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="font-medium text-gray-900 truncate">{suggestion.name}</div>
      <div className="text-sm text-gray-500 truncate">{suggestion.description}</div>
    </div>
  </button>
));

SuggestionItem.displayName = 'SuggestionItem';

interface SuggestionDropdownProps {
  suggestions: readonly LocationSuggestion[];
  selectedIndex: number;
  onSelect: (suggestion: LocationSuggestion) => void;
  testId?: string;
}

const SuggestionDropdownComponent = forwardRef<HTMLDivElement, SuggestionDropdownProps>(
  ({ suggestions, selectedIndex, onSelect, testId }, ref) => {
    if (suggestions.length === 0) return null;

    return (
      <div
        ref={ref}
        className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50"
        style={{ zIndex: Z_INDEX.DROPDOWN }}
        role="listbox"
        data-testid={`${testId}-dropdown`}
      >
        {suggestions.map((suggestion, index) => (
          <SuggestionItem
            key={suggestion.id}
            suggestion={suggestion}
            isSelected={index === selectedIndex}
            onSelect={onSelect}
            testId={testId}
          />
        ))}
      </div>
    );
  }
);

SuggestionDropdownComponent.displayName = 'SuggestionDropdown';

export const SuggestionDropdown = memo(SuggestionDropdownComponent);

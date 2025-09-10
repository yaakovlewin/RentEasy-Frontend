import { useCallback, useState } from 'react';

interface UseKeyboardNavigationProps {
  items: any[];
  onSelect: (item: any, index: number) => void;
  onEscape?: () => void;
  initialIndex?: number;
}

interface UseKeyboardNavigationReturn {
  selectedIndex: number;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  setSelectedIndex: (index: number) => void;
  resetSelection: () => void;
}

export function useKeyboardNavigation({
  items,
  onSelect,
  onEscape,
  initialIndex = -1,
}: UseKeyboardNavigationProps): UseKeyboardNavigationReturn {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            onSelect(items[selectedIndex], selectedIndex);
          }
          break;

        case 'Escape':
          e.preventDefault();
          setSelectedIndex(-1);
          onEscape?.();
          break;

        default:
          break;
      }
    },
    [items, selectedIndex, onSelect, onEscape]
  );

  const resetSelection = useCallback(() => {
    setSelectedIndex(initialIndex);
  }, [initialIndex]);

  return {
    selectedIndex,
    handleKeyDown,
    setSelectedIndex,
    resetSelection,
  };
}

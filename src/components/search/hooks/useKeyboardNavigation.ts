import { useCallback, useState } from 'react';

interface UseKeyboardNavigationProps<T> {
  items: T[];
  onSelect: (item: T, index: number) => void;
  onEscape?: () => void;
  initialIndex?: number;
}

interface UseKeyboardNavigationReturn {
  selectedIndex: number;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  setSelectedIndex: (index: number) => void;
  resetSelection: () => void;
}

export function useKeyboardNavigation<T>({
  items,
  onSelect,
  onEscape,
  initialIndex = -1,
}: UseKeyboardNavigationProps<T>): UseKeyboardNavigationReturn {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => {
            if (prev === -1) return 0; // Start at first item
            return prev < items.length - 1 ? prev + 1 : prev;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < items.length) {
            const selectedItem = items[selectedIndex];
            if (selectedItem !== undefined) {
              onSelect(selectedItem, selectedIndex);
            }
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

import { useCallback, useState } from 'react';

interface UseDropdownStateReturn {
  isOpen: boolean;
  hasInteracted: boolean;
  setIsOpen: (isOpen: boolean) => void;
  markAsInteracted: () => void;
}

export const useDropdownState = (): UseDropdownStateReturn => {
  const [hasInteracted, setHasInteracted] = useState(false);

  const markAsInteracted = useCallback(() => {
    setHasInteracted(true);
  }, []);

  return {
    isOpen: hasInteracted,
    hasInteracted,
    setIsOpen: () => {},
    markAsInteracted,
  };
};

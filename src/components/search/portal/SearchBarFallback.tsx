import { ReactNode } from 'react';
import { MobileSearchOverlay } from '../MobileSearchOverlay';
import { MobileSearchTrigger } from './MobileSearchTrigger';
import type { SearchData } from '@/contexts/SearchContext';

interface SearchBarFallbackProps {
  searchBarElement: ReactNode;
  isMobileSearchOpen: boolean;
  onMobileSearchClose: () => void;
  onMobileSearchOpen: () => void;
  onSearch?: (params: SearchData) => void;
  className?: string;
}

export const SearchBarFallback = ({
  searchBarElement,
  isMobileSearchOpen,
  onMobileSearchClose,
  onMobileSearchOpen,
  onSearch,
  className = 'search-bar-fallback',
}: SearchBarFallbackProps) => (
  <>
    <div className={`${className} max-w-4xl mx-auto`}>
      <div className="hidden lg:block">{searchBarElement}</div>
      <MobileSearchTrigger onClick={onMobileSearchOpen} />
    </div>
    <MobileSearchOverlay
      isOpen={isMobileSearchOpen}
      onClose={onMobileSearchClose}
      onSearch={onSearch}
    />
  </>
);

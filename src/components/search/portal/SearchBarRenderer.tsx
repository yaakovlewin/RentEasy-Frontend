import { SearchBar } from '../SearchBar';
import { Z_INDEX, ANIMATION } from './constants';
import type { SearchData } from '@/contexts/SearchContext';

interface SearchBarRendererProps {
  isDocked: boolean;
  heroVariant: 'hero' | 'compact';
  headerVariant: 'header' | 'compact';
  className?: string;
  searchBarRef: React.RefObject<HTMLDivElement>;
  onSearch?: (params: SearchData) => void;
}

const getVariantClasses = (isDocked: boolean): string =>
  isDocked ? 'animate-slide-down' : 'max-w-4xl mx-auto animate-fade-in';

export const SearchBarRenderer = ({
  isDocked,
  heroVariant,
  headerVariant,
  className = '',
  searchBarRef,
  onSearch,
}: SearchBarRendererProps) => (
  <div
    ref={searchBarRef}
    className={`search-bar-instance ${className}`}
    style={{
      viewTransitionName: 'search-bar',
      transition: ANIMATION.TRANSITION,
      zIndex: isDocked ? Z_INDEX.DOCKED : Z_INDEX.HERO,
      position: 'relative',
      transform: 'translateZ(0)',
      contain: 'layout style',
      overflow: 'visible',
    }}
  >
    <SearchBar
      variant={isDocked ? headerVariant : heroVariant}
      onSearch={onSearch}
      className={`w-full ${getVariantClasses(isDocked)}`}
      isDocked={isDocked}
    />
  </div>
);

'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';

import { useSearch } from '@/contexts/SearchContext';

import { MobileSearchOverlay } from './MobileSearchOverlay';
import { useDockingState } from './portal/useDockingState';
import { usePortalSlots } from './portal/usePortalSlots';
import { SearchBarRenderer } from './portal/SearchBarRenderer';
import { SearchBarFallback } from './portal/SearchBarFallback';
import { MobileSearchTrigger } from './portal/MobileSearchTrigger';
import { DebugOverlay } from './portal/DebugOverlay';
import { getTargetSlot, isDebugEnabled } from './portal/utils';
import type { SearchBarPortalProps } from './portal/types';

export function SearchBarPortal({
  heroVariant = 'hero',
  headerVariant = 'header',
  className,
}: SearchBarPortalProps) {
  const { onSearch } = useSearch();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const { heroSlot, headerSlot, mounted } = usePortalSlots();
  const { isDocked, debugInfo, searchBarRef } = useDockingState({
    enableDebug: isDebugEnabled(),
  });

  const searchBarElement = (
    <SearchBarRenderer
      isDocked={isDocked}
      heroVariant={heroVariant}
      headerVariant={headerVariant}
      className={className}
      searchBarRef={searchBarRef}
      onSearch={onSearch}
    />
  );

  const mobileSearchProps = {
    isMobileSearchOpen,
    onMobileSearchClose: () => setIsMobileSearchOpen(false),
    onMobileSearchOpen: () => setIsMobileSearchOpen(true),
    onSearch,
  };

  if (!mounted) {
    return (
      <SearchBarFallback
        {...mobileSearchProps}
        searchBarElement={searchBarElement}
        className="search-bar-ssr-hero"
      />
    );
  }

  if (!heroSlot && !headerSlot) {
    return (
      <SearchBarFallback
        {...mobileSearchProps}
        searchBarElement={searchBarElement}
      />
    );
  }

  const targetSlot = getTargetSlot(isDocked, headerSlot, heroSlot);

  if (!targetSlot) {
    return (
      <SearchBarFallback
        {...mobileSearchProps}
        searchBarElement={searchBarElement}
        className="search-bar-emergency-fallback"
      />
    );
  }

  const portalResult = createPortal(searchBarElement, targetSlot);

  if (isDebugEnabled()) {
    return (
      <>
        {portalResult}
        <MobileSearchTrigger onClick={mobileSearchProps.onMobileSearchOpen} />
        <MobileSearchOverlay
          isOpen={isMobileSearchOpen}
          onClose={mobileSearchProps.onMobileSearchClose}
          onSearch={onSearch}
        />
        <DebugOverlay isDocked={isDocked} debugInfo={debugInfo} />
      </>
    );
  }

  return (
    <>
      {portalResult}
      <MobileSearchTrigger onClick={mobileSearchProps.onMobileSearchOpen} />
      <MobileSearchOverlay
        isOpen={isMobileSearchOpen}
        onClose={mobileSearchProps.onMobileSearchClose}
      />
    </>
  );
}

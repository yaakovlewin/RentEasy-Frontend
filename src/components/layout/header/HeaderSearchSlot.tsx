'use client';

import { cn } from '@/lib/utils';

import type { HeaderSearchSlotProps } from './types';

/**
 * HeaderSearchSlot Component
 * 
 * Provides a portal slot for the search bar component in the desktop header.
 * The search bar component uses React portals to render into this slot.
 */
export function HeaderSearchSlot({ 
  showSearch = true, 
  isScrolled = false, 
  className 
}: HeaderSearchSlotProps) {
  if (!showSearch) {
    return null;
  }

  return (
    <div className={cn('hidden lg:flex items-center flex-1 justify-center mx-8 min-w-0 relative', className)} style={{ zIndex: 9999 }}>
      <div
        id='search-header-slot'
        className='relative w-full max-w-2xl'
        style={{
          minHeight: '48px', // Reserve space for search bar
          zIndex: 9999, // Ensure the slot itself has high z-index
        }}
      >
        {/* SearchBar will be portaled here */}
      </div>
    </div>
  );
}
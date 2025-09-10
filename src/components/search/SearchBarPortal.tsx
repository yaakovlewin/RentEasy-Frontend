'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { useSearch } from '@/contexts/SearchContext';
import { SearchBar } from './index';
import { MobileSearchOverlay } from './MobileSearchOverlay';

// TypeScript type for document with View Transitions API
type DocumentWithVT = Document & {
  startViewTransition?: (callback: () => void) => void;
};

interface SearchBarPortalProps {
  heroVariant?: 'hero' | 'compact';
  headerVariant?: 'header' | 'compact';
  className?: string;
}

// Production-ready constants
const LEAD = 48; // Start docking this many px before header bottom
const HYST = 8; // Hysteresis to prevent chatter
const BAND = 200; // Start rAF guard when |err| < BAND
const EPS = 0.5; // Epsilon to prevent high-DPR teetering and threshold chatter

export function SearchBarPortal({
  heroVariant = 'hero',
  headerVariant = 'header',
  className,
}: SearchBarPortalProps) {
  const { onSearch } = useSearch();
  const [isDocked, setIsDocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [heroSlot, setHeroSlot] = useState<HTMLElement | null>(null);
  const [headerSlot, setHeaderSlot] = useState<HTMLElement | null>(null);

  const searchBarRef = useRef<HTMLDivElement>(null);
  const dockedRef = useRef(false);
  const vvRef = useRef<any>(null);
  const strictModeGuardRef = useRef(false);
  const rafRef = useRef<number | null>(null); // Fix: RAF ID as ref for proper cleanup

  // Phase 1 Debug Instrumentation
  const [debugInfo, setDebugInfo] = useState({
    err: 0,
    minErr: 0,
    maxErr: 0,
    dockCount: 0,
  });
  const debugRef = useRef({ minErr: 0, maxErr: 0, dockCount: 0 });

  // Keep dockedRef in sync with isDocked state
  useEffect(() => {
    dockedRef.current = isDocked;
  }, [isDocked]);

  // Cache visualViewport reference (not the value)
  useEffect(() => {
    vvRef.current = (window as any).visualViewport || null;
  }, []);

  // Direct measurement of hero slot - keep full float precision
  const measure = () => {
    const header = document.getElementById('main-header');
    const slot = document.getElementById('search-hero-slot');
    if (!header || !slot) {
      // Safe fallback when slots don't exist
      return {
        err: 0,
        dockErr: 0,
        undockErr: 0,
        headerH: 80, // Safe default header height
        dynamicLead: LEAD,
        dockLead: LEAD,
        undockLead: LEAD,
      };
    }

    const headerH = Math.max(header.getBoundingClientRect().height || 80, 60); // Ensure minimum height
    const top = slot.getBoundingClientRect().top; // Keep float precision
    const vvOffset = vvRef.current?.offsetTop ?? 0; // Live read each time

    // Asymmetric lead distances for better UX - with safe fallbacks
    const undockLead = Math.min(Math.max(headerH * 0.4, 16), 40); // Conservative undocking
    const anticipation = 10; // Dock 10px before reaching header
    const dockLead = Math.max(headerH - anticipation, LEAD); // Position where docking triggers (71px for 81px header)

    const delta = top - headerH - vvOffset; // Distance from header bottom
    const dockErr = delta - dockLead; // Distance from dock line
    const undockErr = delta - undockLead; // Distance from undock line

    // Use undockLead as primary for debug display compatibility
    const dynamicLead = undockLead;

    // Phase 2: Deep measurement debugging - only with debug flag
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_SEARCH === 'true') {
      console.log('📏 Measurement Components:', {
        headerH: Math.round(headerH * 100) / 100,
        slotTop: Math.round(top * 100) / 100,
        vvOffset,
        undockLead: Math.round(undockLead * 100) / 100,
        dockLead: Math.round(dockLead * 100) / 100,
        delta: Math.round(delta * 100) / 100,
        dockErr: Math.round(dockErr * 100) / 100,
        undockErr: Math.round(undockErr * 100) / 100,
        timestamp: Date.now(),
      });
    }

    return { err: undockErr, dockErr, undockErr, headerH, dynamicLead, dockLead, undockLead };
  };

  // Mount and find slots
  useEffect(() => {
    setMounted(true);

    const heroContainer = document.getElementById('search-hero-slot');
    const headerContainer = document.getElementById('search-header-slot');

    setHeroSlot(heroContainer);
    setHeaderSlot(headerContainer);
  }, []);

  // Enhanced View Transition with proper cleanup and SSR guards
  const startDockTransition = (docking: boolean, update: () => void) => {
    if (typeof window === 'undefined') return update(); // SSR guard

    const root = document.documentElement;
    root.dataset.motion = docking ? 'docking' : 'undocking';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const vt = document.startViewTransition?.bind(document);
    if (vt && !reduce) {
      const transition = vt(() => {
        update();
        return Promise.resolve(); // updateCallbackDone
      });
      Promise.allSettled([transition.ready, transition.finished]).finally(
        () => delete root.dataset.motion
      );
    } else {
      update();
      delete root.dataset.motion;
    }
  };

  // Main docking logic - production-ready
  useEffect(() => {
    if (!mounted || strictModeGuardRef.current) return;
    strictModeGuardRef.current = true;

    // Asymmetric docking logic with separate dock/undock thresholds
    const applyDesired = () => {
      const { dockErr, undockErr } = measure();
      const desired =
        dockErr <= -(HYST / 2 + EPS)
          ? true // Dock with epsilon guard using aggressive threshold
          : undockErr >= HYST / 2 + EPS
            ? false // Undock with epsilon guard using conservative threshold
            : dockedRef.current; // In hysteresis zone, keep current

      // Use undockErr for debug compatibility (primary error display)
      const err = undockErr;

      // Phase 1 Debug - Track error range and docking events
      if (process.env.NODE_ENV === 'development') {
        debugRef.current.minErr = Math.min(debugRef.current.minErr, err);
        debugRef.current.maxErr = Math.max(debugRef.current.maxErr, err);

        // Update debug overlay
        setDebugInfo({
          err: Math.round(err * 10) / 10,
          minErr: Math.round(debugRef.current.minErr * 10) / 10,
          maxErr: Math.round(debugRef.current.maxErr * 10) / 10,
          dockCount: debugRef.current.dockCount,
        });
      }

      if (desired !== dockedRef.current) {
        if (
          process.env.NODE_ENV === 'development' &&
          process.env.NEXT_PUBLIC_DEBUG_SEARCH === 'true'
        ) {
          debugRef.current.dockCount += 1;
          console.debug('🚢 Docking Event:', {
            dockErr: Math.round(dockErr * 10) / 10,
            undockErr: Math.round(undockErr * 10) / 10,
            desired,
            current: dockedRef.current,
            dockCount: debugRef.current.dockCount,
            trigger: dockErr <= -(HYST / 2 + EPS) ? 'DOCK' : 'UNDOCK',
          });
        }
        startDockTransition(desired, () => setIsDocked(desired));
      }
      return err;
    };

    // Enhanced rAF guard with smart will-change management
    const guard = () => {
      const { dockErr, undockErr } = measure();
      applyDesired();
      // Check both thresholds for near-edge detection
      const isNearEdge = Math.min(Math.abs(dockErr), Math.abs(undockErr)) < BAND;

      // Smart will-change management - only when needed
      if (isNearEdge && !searchBarRef.current?.classList.contains('willchange')) {
        searchBarRef.current?.classList.add('willchange');
      } else if (!isNearEdge && searchBarRef.current?.classList.contains('willchange')) {
        searchBarRef.current?.classList.remove('willchange');
      }

      if (isNearEdge) {
        rafRef.current = requestAnimationFrame(guard);
      } else if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    // Factory for creating aligned IntersectionObserver
    const installObserver = (headerH: number, dockLead: number) => {
      // Ensure valid dockLead value
      const safeDockLead = Math.max(Math.round(dockLead || LEAD), 0);

      const io = new IntersectionObserver(
        () => {
          // Simply apply docking logic whenever observer fires
          // Let hysteresis handle chatter prevention
          applyDesired();

          // Always start guard to ensure smooth transitions
          if (rafRef.current == null) {
            rafRef.current = requestAnimationFrame(guard);
          }
        },
        {
          root: null,
          threshold: 0,
          // Set trigger line at dockLead pixels from viewport top
          // For 81px header with 10px anticipation, triggers at 71px from top
          rootMargin: `-${safeDockLead}px 0px 0px 0px`,
        }
      );

      // Watch the same element we measure
      const slot = document.getElementById('search-hero-slot');
      if (slot) io.observe(slot);
      return io;
    };

    // Initial installation
    let { headerH, dockLead } = measure();
    let io = installObserver(headerH, dockLead);

    // Keep margin honest when header resizes
    const header = document.getElementById('main-header');
    const ro = new ResizeObserver(() => {
      const newMeasure = measure();
      headerH = newMeasure.headerH;
      const newDockLead = newMeasure.dockLead;
      io.disconnect();
      io = installObserver(headerH, newDockLead);
    });
    if (header) ro.observe(header);

    // Set correct state immediately on mount
    applyDesired();

    // Add passive scroll listener to catch fast scrolls
    const handleScroll = () => {
      applyDesired();
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Mobile visualViewport handling
    const vv = (window as any).visualViewport;
    let vvCleanup: (() => void) | null = null;

    if (vv) {
      const handleVVChange = () => {
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(guard);
        }
      };

      vv.addEventListener('resize', handleVVChange);
      vv.addEventListener('scroll', handleVVChange);

      vvCleanup = () => {
        vv.removeEventListener('resize', handleVVChange);
        vv.removeEventListener('scroll', handleVVChange);
      };
    }

    return () => {
      strictModeGuardRef.current = false;
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (vvCleanup) vvCleanup();
      // Final cleanup insurance
      searchBarRef.current?.classList.remove('willchange');
    };
  }, [mounted]);

  // Final cleanup insurance on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      searchBarRef.current?.classList.remove('willchange');
      delete document.documentElement.dataset.motion;
    };
  }, []);

  // Create the single search bar instance
  const searchBarElement = (
    <div
      ref={searchBarRef}
      className={`search-bar-instance ${className || ''}`}
      style={{
        // View Transition name for shared element morph
        viewTransitionName: 'search-bar',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother transition
        zIndex: isDocked ? 9999 : 10, // Much higher z-index when docked to ensure visibility above header
        position: 'relative',
        // Force layer for VT but allow dropdown overflow
        transform: 'translateZ(0)',
        contain: 'layout style', // Remove 'paint' to allow dropdown overflow
        overflow: 'visible', // Explicitly allow dropdowns to overflow
      }}
    >
      <SearchBar
        variant={isDocked ? headerVariant : heroVariant}
        onSearch={onSearch}
        className={`w-full ${
          isDocked ? 'animate-slide-down' : 'max-w-4xl mx-auto animate-fade-in'
        }`}
        isDocked={isDocked}
      />
    </div>
  );

  // Mobile Search Trigger (only shown on mobile when slots aren't available)
  const mobileSearchTrigger = (
    <div className='lg:hidden'>
      <Button
        onClick={() => setIsMobileSearchOpen(true)}
        variant='outline'
        className='w-full h-14 rounded-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 justify-start text-left text-gray-600 hover:bg-gray-50 hover:border-primary/20'
      >
        <Search className='w-5 h-5 mr-3 opacity-60' />
        <span className='text-base font-medium'>Search destinations...</span>
      </Button>
    </div>
  );

  // SSR safety: render hero by default, then portal on client
  if (!mounted) {
    return (
      <>
        <div className='search-bar-ssr-hero max-w-4xl mx-auto'>
          <div className='hidden lg:block'>{searchBarElement}</div>
          {mobileSearchTrigger}
        </div>
        <MobileSearchOverlay
          isOpen={isMobileSearchOpen}
          onClose={() => setIsMobileSearchOpen(false)}
          onSearch={onSearch}
        />
      </>
    );
  }

  // Ensure we have valid slots before attempting portal
  if (!heroSlot && !headerSlot) {
    return (
      <>
        <div className='search-bar-fallback max-w-4xl mx-auto'>
          <div className='hidden lg:block'>{searchBarElement}</div>
          {mobileSearchTrigger}
        </div>
        <MobileSearchOverlay
          isOpen={isMobileSearchOpen}
          onClose={() => setIsMobileSearchOpen(false)}
          onSearch={onSearch}
        />
      </>
    );
  }

  // Determine target slot with fallbacks
  let targetSlot: HTMLElement | null;
  if (isDocked && headerSlot) {
    targetSlot = headerSlot;
  } else if (heroSlot) {
    targetSlot = heroSlot;
  } else {
    // Ultimate fallback - render normally
    return (
      <>
        <div className='search-bar-emergency-fallback max-w-4xl mx-auto'>
          <div className='hidden lg:block'>{searchBarElement}</div>
          {mobileSearchTrigger}
        </div>
        <MobileSearchOverlay
          isOpen={isMobileSearchOpen}
          onClose={() => setIsMobileSearchOpen(false)}
          onSearch={onSearch}
        />
      </>
    );
  }

  const portalResult = createPortal(searchBarElement, targetSlot);

  // Remove debug overlay - only show in development with special flag
  // Phase 1 Debug Overlay (development only with flag)
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_DEBUG_SEARCH === 'true' &&
    mounted
  ) {
    return (
      <>
        {portalResult}
        {mobileSearchTrigger}
        <MobileSearchOverlay
          isOpen={isMobileSearchOpen}
          onClose={() => setIsMobileSearchOpen(false)}
          onSearch={onSearch}
        />
        <div
          className='fixed top-4 right-4 bg-black/90 text-white text-xs font-mono p-3 rounded-lg z-[100] backdrop-blur-sm border border-white/20'
          style={{ minWidth: '200px' }}
        >
          <div className='text-green-400 font-bold mb-2'>🔧 Search Bar Debug</div>
          <div className='space-y-1'>
            <div>
              Status:{' '}
              <span className={isDocked ? 'text-blue-400' : 'text-yellow-400'}>
                {isDocked ? '⚓ DOCKED' : '🌊 HERO'}
              </span>
            </div>
            <div>
              Current Err: <span className='text-cyan-400'>{debugInfo.err}px</span>
            </div>
            <div>
              Min Err: <span className='text-red-400'>{debugInfo.minErr}px</span>
            </div>
            <div>
              Max Err: <span className='text-green-400'>{debugInfo.maxErr}px</span>
            </div>
            <div>
              Dock Count: <span className='text-purple-400'>{debugInfo.dockCount}</span>
            </div>
            <div className='mt-2 pt-2 border-t border-white/20 text-gray-300'>
              <div>
                Static LEAD: {LEAD}px | HYST: {HYST}px | EPS: {EPS}px
              </div>
              <div className='text-cyan-300'>
                Undock Lead: {Math.round((measure().undockLead || LEAD) * 10) / 10}
                px
              </div>
              <div className='text-orange-300'>
                Dock Lead: {Math.round((measure().dockLead || LEAD) * 10) / 10}
                px (aggressive)
              </div>
              <div>
                Dock Trigger: {-(HYST / 2 + EPS)}px | Undock Trigger: {HYST / 2 + EPS}px
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {portalResult}
      {mobileSearchTrigger}
      <MobileSearchOverlay
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />
    </>
  );
}

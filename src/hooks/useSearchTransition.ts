'use client';

import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

import { useScrollPosition } from './useScrollPosition';

interface UseSearchTransitionOptions {
  headerHeight?: number;
  magneticZone?: number;
  springConfig?: {
    tension: number;
    friction: number;
  };
}

interface TransitionPhase {
  phase: 'idle' | 'magnetic' | 'locking' | 'locked' | 'morphing' | 'complete';
  progress: number;
}

interface SearchTransitionState {
  shouldShowHeaderSearch: boolean;
  heroSearchRef: RefObject<HTMLDivElement>;
  transitionPhase: TransitionPhase;
  heroSearchTransform: string;
  heroSearchStyles: React.CSSProperties;
  headerSearchOpacity: number;
}

// Physics-based easing functions
const easing = {
  // Spring physics with overshoot
  spring: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Magnetic attraction curve
  magnetic: (t: number) => {
    return 1 - Math.pow(1 - t, 3);
  },

  // Velocity-aware cubic bezier
  smooth: (t: number) => {
    return t * t * (3 - 2 * t);
  },
};

export function useSearchTransition(
  options: UseSearchTransitionOptions = {}
): SearchTransitionState {
  const {
    headerHeight = 80,
    magneticZone = 150, // Shorter zone for smoother activation
    springConfig = { tension: 300, friction: 30 },
  } = options;

  const [heroSearchPosition, setHeroSearchPosition] = useState<number>(0);
  const [heroSearchDimensions, setHeroSearchDimensions] = useState({ width: 0, height: 0 });
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>({
    phase: 'idle',
    progress: 0,
  });

  const heroSearchRef = useRef<HTMLDivElement>(null);
  const scrollVelocityRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const lastScrollPositionRef = useRef(0);
  const { scrollPosition } = useScrollPosition();

  // Calculate scroll velocity using refs to avoid infinite loops
  useEffect(() => {
    const now = Date.now();
    const dt = now - lastScrollTimeRef.current;

    if (dt > 0 && lastScrollTimeRef.current > 0) {
      const velocity = (scrollPosition - lastScrollPositionRef.current) / dt;
      scrollVelocityRef.current = velocity;
    }

    lastScrollTimeRef.current = now;
    lastScrollPositionRef.current = scrollPosition;
  }, [scrollPosition]);

  // Enhanced position tracking with dimensions
  const calculateHeroSearchMetrics = useCallback(() => {
    if (heroSearchRef.current) {
      const rect = heroSearchRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const absoluteTop = rect.top + scrollTop;

      setHeroSearchPosition(absoluteTop);
      setHeroSearchDimensions({ width: rect.width, height: rect.height });

      if (process.env.NODE_ENV === 'development') {
        console.log('Hero Search Metrics:', {
          position: absoluteTop,
          dimensions: { width: rect.width, height: rect.height },
          viewportTop: rect.top,
        });
      }
    }
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(calculateHeroSearchMetrics, 100),
      setTimeout(calculateHeroSearchMetrics, 500),
      setTimeout(calculateHeroSearchMetrics, 1500),
    ];

    window.addEventListener('resize', calculateHeroSearchMetrics);
    window.addEventListener('load', calculateHeroSearchMetrics);

    return () => {
      window.removeEventListener('resize', calculateHeroSearchMetrics);
      window.removeEventListener('load', calculateHeroSearchMetrics);
      timers.forEach(clearTimeout);
    };
  }, [calculateHeroSearchMetrics]);

  // Simplified multi-stage transition logic
  useEffect(() => {
    // Use fallback if hero position not calculated yet
    const effectiveHeroPosition = heroSearchPosition || 600; // Reasonable default

    const intersectionPoint = effectiveHeroPosition - headerHeight;
    const magneticStart = intersectionPoint - magneticZone;
    const lockingPoint = intersectionPoint - 40;

    let newPhase: TransitionPhase;

    if (scrollPosition < magneticStart) {
      // Phase 1: Idle - normal scroll
      newPhase = { phase: 'idle', progress: 0 };
    } else if (scrollPosition < lockingPoint) {
      // Phase 2: Magnetic attraction - gentle pull
      const progress = (scrollPosition - magneticStart) / (lockingPoint - magneticStart);
      newPhase = { phase: 'magnetic', progress: easing.magnetic(progress) };
    } else if (scrollPosition < intersectionPoint) {
      // Phase 3: Locking in - smooth acceleration
      const progress = (scrollPosition - lockingPoint) / (intersectionPoint - lockingPoint);
      newPhase = { phase: 'locking', progress: easing.smooth(progress) };
    } else if (scrollPosition < intersectionPoint + 80) {
      // Phase 4: Locked - stay visible longer for proper sticking
      newPhase = { phase: 'locked', progress: 1 };
    } else {
      // Phase 5: Complete - header takes over
      newPhase = { phase: 'complete', progress: 1 };
    }

    setTransitionPhase(newPhase);

    console.log('Transition Debug:', {
      scrollPosition,
      heroSearchPosition,
      effectiveHeroPosition,
      phase: newPhase.phase,
      intersectionPoint,
      magneticStart,
      lockingPoint,
    });
  }, [scrollPosition, heroSearchPosition, headerHeight, magneticZone]);

  // Simplified transform calculations - no jumping
  const heroSearchTransform = (() => {
    if (!heroSearchPosition || transitionPhase.phase === 'idle') return 'none';

    const { phase, progress } = transitionPhase;

    switch (phase) {
      case 'magnetic':
        // Gentle upward drift - very subtle
        const magneticOffset = -progress * 12;
        return `translateY(${magneticOffset}px) scale(${1 - progress * 0.008})`;

      case 'locking':
        // Smooth acceleration toward final position
        const lockingOffset = -12 + -progress * 20; // -12 to -32px total
        return `translateY(${lockingOffset}px) scale(${0.992 - progress * 0.015})`;

      case 'locked':
        // Final locked position - subtle elevation
        return `translateY(-32px) scale(0.977)`;

      case 'complete':
        return `translateY(-32px) scale(0.977)`;

      default:
        return 'none';
    }
  })();

  // Clean styles for smooth transition
  const heroSearchStyles: React.CSSProperties = {
    transform: heroSearchTransform,
    opacity: transitionPhase.phase === 'complete' ? 0 : 1,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: transitionPhase.phase === 'complete' ? 'none' : 'auto',
  };

  return {
    shouldShowHeaderSearch:
      transitionPhase.phase === 'locked' || transitionPhase.phase === 'complete',
    heroSearchRef,
    transitionPhase,
    heroSearchTransform,
    heroSearchStyles,
    headerSearchOpacity:
      transitionPhase.phase === 'locked' || transitionPhase.phase === 'complete' ? 1 : 0,
  };
}

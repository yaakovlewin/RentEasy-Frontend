import { useCallback, useEffect, useRef, useState } from 'react';
import {
  measureDockingPosition,
  shouldDock,
  isNearDockingEdge,
} from './measurements';
import { DOCKING_CONFIG } from './constants';
import type { DebugInfo } from './types';

interface UseDockingStateOptions {
  onDockChange?: (isDocked: boolean) => void;
  enableDebug?: boolean;
}

interface UseDockingStateResult {
  isDocked: boolean;
  debugInfo: DebugInfo;
  searchBarRef: React.RefObject<HTMLDivElement>;
}

const startViewTransition = (
  isDocking: boolean,
  updateFn: () => void
): void => {
  if (typeof window === 'undefined') {
    updateFn();
    return;
  }

  const root = document.documentElement;
  root.dataset.motion = isDocking ? 'docking' : 'undocking';
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vt = document.startViewTransition?.bind(document);

  if (vt && !prefersReducedMotion) {
    const transition = vt(() => {
      updateFn();
      return Promise.resolve();
    });

    Promise.allSettled([transition.ready, transition.finished]).finally(
      () => delete root.dataset.motion
    );
  } else {
    updateFn();
    delete root.dataset.motion;
  }
};

export const useDockingState = ({
  onDockChange,
  enableDebug = false,
}: UseDockingStateOptions = {}): UseDockingStateResult => {
  const [isDocked, setIsDocked] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    err: 0,
    minErr: 0,
    maxErr: 0,
    dockCount: 0,
  });

  const searchBarRef = useRef<HTMLDivElement>(null);
  const dockedRef = useRef(false);
  const vvRef = useRef<VisualViewport | null>(null);
  const rafRef = useRef<number | null>(null);
  const debugRef = useRef({ minErr: 0, maxErr: 0, dockCount: 0 });
  const strictModeGuardRef = useRef(false);

  useEffect(() => {
    dockedRef.current = isDocked;
  }, [isDocked]);

  useEffect(() => {
    vvRef.current = window.visualViewport || null;
  }, []);

  const updateDebugInfo = useCallback(
    (err: number) => {
      if (!enableDebug) return;

      debugRef.current.minErr = Math.min(debugRef.current.minErr, err);
      debugRef.current.maxErr = Math.max(debugRef.current.maxErr, err);

      setDebugInfo({
        err: Math.round(err * 10) / 10,
        minErr: Math.round(debugRef.current.minErr * 10) / 10,
        maxErr: Math.round(debugRef.current.maxErr * 10) / 10,
        dockCount: debugRef.current.dockCount,
      });
    },
    [enableDebug]
  );

  const applyDockingState = useCallback(() => {
    const vvOffset = vvRef.current?.offsetTop ?? 0;
    const { dockErr, undockErr } = measureDockingPosition(vvOffset);
    const desired = shouldDock(dockErr, undockErr, dockedRef.current);

    updateDebugInfo(undockErr);

    if (desired !== dockedRef.current) {
      if (enableDebug) {
        debugRef.current.dockCount += 1;
        console.debug('🚢 Docking Event:', {
          dockErr: Math.round(dockErr * 10) / 10,
          undockErr: Math.round(undockErr * 10) / 10,
          desired,
          current: dockedRef.current,
          dockCount: debugRef.current.dockCount,
        });
      }

      startViewTransition(desired, () => {
        setIsDocked(desired);
        onDockChange?.(desired);
      });
    }
  }, [enableDebug, onDockChange, updateDebugInfo]);

  const manageWillChange = useCallback((shouldApply: boolean) => {
    const hasClass = searchBarRef.current?.classList.contains('willchange');

    if (shouldApply && !hasClass) {
      searchBarRef.current?.classList.add('willchange');
    } else if (!shouldApply && hasClass) {
      searchBarRef.current?.classList.remove('willchange');
    }
  }, []);

  const rafGuard = useCallback(() => {
    const vvOffset = vvRef.current?.offsetTop ?? 0;
    const { dockErr, undockErr } = measureDockingPosition(vvOffset);

    applyDockingState();

    const nearEdge = isNearDockingEdge(dockErr, undockErr);
    manageWillChange(nearEdge);

    if (nearEdge) {
      rafRef.current = requestAnimationFrame(rafGuard);
    } else if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [applyDockingState, manageWillChange]);

  const createIntersectionObserver = useCallback(
    (dockLead: number): IntersectionObserver => {
      const safeDockLead = Math.max(Math.round(dockLead || DOCKING_CONFIG.LEAD), 0);

      const observer = new IntersectionObserver(
        () => {
          applyDockingState();
          if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(rafGuard);
          }
        },
        {
          root: null,
          threshold: 0,
          rootMargin: `-${safeDockLead}px 0px 0px 0px`,
        }
      );

      const slot = document.getElementById('search-hero-slot');
      if (slot) observer.observe(slot);

      return observer;
    },
    [applyDockingState, rafGuard]
  );

  useEffect(() => {
    if (strictModeGuardRef.current) return;
    strictModeGuardRef.current = true;

    const vvOffset = vvRef.current?.offsetTop ?? 0;
    let { dockLead } = measureDockingPosition(vvOffset);
    let io = createIntersectionObserver(dockLead);

    const header = document.getElementById('main-header');
    const ro = new ResizeObserver(() => {
      const vvOffset = vvRef.current?.offsetTop ?? 0;
      const newMeasure = measureDockingPosition(vvOffset);
      io.disconnect();
      io = createIntersectionObserver(newMeasure.dockLead);
    });

    if (header) ro.observe(header);

    applyDockingState();

    const handleScroll = () => applyDockingState();
    window.addEventListener('scroll', handleScroll, { passive: true });

    const vv = window.visualViewport;
    let vvCleanup: (() => void) | null = null;

    if (vv) {
      const handleVVChange = () => {
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(rafGuard);
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

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      vvCleanup?.();
      searchBarRef.current?.classList.remove('willchange');
    };
  }, [applyDockingState, createIntersectionObserver, rafGuard]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      searchBarRef.current?.classList.remove('willchange');
      delete document.documentElement.dataset.motion;
    };
  }, []);

  return { isDocked, debugInfo, searchBarRef };
};

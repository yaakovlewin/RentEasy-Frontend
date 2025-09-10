'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollPositionOptions {
  threshold?: number;
  throttle?: number;
}

export function useScrollPosition({
  threshold = 0,
  throttle = 100,
}: UseScrollPositionOptions = {}) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isScrolledPastThreshold, setIsScrolledPastThreshold] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;

      setScrollPosition(currentScrollY);
      setIsScrollingDown(currentScrollY > lastScrollY.current);
      setIsScrolledPastThreshold(currentScrollY > threshold);

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(updateScrollPosition);
        ticking.current = true;
      }
    };

    // Initial check
    updateScrollPosition();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return {
    scrollPosition,
    isScrollingDown,
    isScrolledPastThreshold,
  };
}

// Hook specifically for detecting when hero section is out of view
export function useHeroVisibility() {
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [showHeaderSearch, setShowHeaderSearch] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        setIsHeroVisible(isVisible);
        setShowHeaderSearch(!isVisible);
      },
      {
        threshold: [0, 0.2, 0.8, 1],
        rootMargin: '0px',
      }
    );

    const heroElement = heroRef.current;
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => {
      if (heroElement) {
        observer.unobserve(heroElement);
      }
    };
  }, []);

  return {
    heroRef,
    isHeroVisible,
    showHeaderSearch,
  };
}

/**
 * @fileoverview Dashboard Route Group Template
 * 
 * CLIENT COMPONENT providing page transitions and animations for dashboard pages.
 * Features performance-optimized animations and dashboard-specific transitions.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DashboardTemplateProps {
  children: React.ReactNode;
}

/**
 * Dashboard template with optimized page transitions
 */
export default function DashboardTemplate({ children }: DashboardTemplateProps) {
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Focus management for accessibility
  useEffect(() => {
    if (!isInitialLoad) {
      // Announce page change to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Navigated to ${getPageTitle(pathname)}`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [pathname, isInitialLoad]);

  // Different animation for initial load vs navigation
  const animationVariants = {
    initial: isInitialLoad 
      ? { opacity: 0, scale: 0.98 }
      : { opacity: 0, x: 20 },
    animate: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        duration: isInitialLoad ? 0.5 : 0.3,
        ease: [0.25, 0.25, 0, 1],
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.25, 0, 1],
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full h-full"
      >
        {/* Content wrapper with staggered animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: {
              duration: 0.3,
              delay: isInitialLoad ? 0.2 : 0.1,
            }
          }}
          exit={{ 
            opacity: 0,
            transition: {
              duration: 0.15,
            }
          }}
          className="space-y-6"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Get user-friendly page title for accessibility announcements
 */
function getPageTitle(pathname: string): string {
  // Extract the last segment and make it user-friendly
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  if (!lastSegment || lastSegment === 'dashboard') {
    return 'Dashboard';
  }
  
  // Convert kebab-case to title case
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
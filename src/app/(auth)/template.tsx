/**
 * @fileoverview Auth Route Group Template
 * 
 * CLIENT COMPONENT providing page transitions and animations for auth pages.
 * Features smooth animations, focus management, and accessibility support.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface AuthTemplateProps {
  children: React.ReactNode;
}

/**
 * Auth template with smooth page transitions and animations
 */
export default function AuthTemplate({ children }: AuthTemplateProps) {
  const pathname = usePathname();

  // Focus management for accessibility
  useEffect(() => {
    // Reset focus to main content on route change
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.focus();
    }
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: 0.4,
            ease: [0.25, 0.25, 0, 1],
          }
        }}
        exit={{ 
          opacity: 0, 
          y: -20, 
          scale: 0.95,
          transition: {
            duration: 0.3,
            ease: [0.25, 0.25, 0, 1],
          }
        }}
        className="w-full"
      >
        {/* Form container with enhanced animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: {
              duration: 0.3,
              delay: 0.1,
            }
          }}
          exit={{ 
            opacity: 0,
            transition: {
              duration: 0.2,
            }
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
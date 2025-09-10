/**
 * @fileoverview Public Route Group Template
 * 
 * CLIENT COMPONENT providing page transitions and animations for public pages.
 * Features marketing-optimized animations and performance considerations.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PublicTemplateProps {
  children: React.ReactNode;
}

/**
 * Public template with marketing-optimized page transitions
 */
export default function PublicTemplate({ children }: PublicTemplateProps) {
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Handle initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Scroll to top on navigation (marketing pages often benefit from this)
  useEffect(() => {
    if (!isInitialLoad) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, isInitialLoad]);

  // Different animations for different page types
  const getAnimationVariants = () => {
    const isHomePage = pathname === '/';
    const isSearchPage = pathname.startsWith('/search');
    
    if (isHomePage) {
      // Hero-focused animation for home page
      return {
        initial: isInitialLoad 
          ? { opacity: 0, y: 30, scale: 0.95 }
          : { opacity: 0, y: 20 },
        animate: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            duration: isInitialLoad ? 0.8 : 0.4,
            ease: [0.25, 0.25, 0, 1],
            staggerChildren: 0.1,
          }
        },
        exit: { 
          opacity: 0, 
          y: -10,
          transition: {
            duration: 0.3,
            ease: [0.25, 0.25, 0, 1],
          }
        }
      };
    }
    
    if (isSearchPage) {
      // Optimized for search results
      return {
        initial: { opacity: 0, x: 10 },
        animate: { 
          opacity: 1, 
          x: 0,
          transition: {
            duration: 0.3,
            ease: 'easeOut',
          }
        },
        exit: { 
          opacity: 0,
          transition: {
            duration: 0.2,
          }
        }
      };
    }
    
    // Default public page animation
    return {
      initial: isInitialLoad 
        ? { opacity: 0, y: 20 }
        : { opacity: 0, x: 15 },
      animate: { 
        opacity: 1, 
        x: 0,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.25, 0.25, 0, 1],
        }
      },
      exit: { 
        opacity: 0, 
        x: -15,
        transition: {
          duration: 0.25,
          ease: [0.25, 0.25, 0, 1],
        }
      }
    };
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={getAnimationVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full min-h-full"
      >
        {/* Staggered content animation for marketing impact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: {
              duration: 0.4,
              delay: pathname === '/' ? 0.3 : 0.1,
              staggerChildren: pathname === '/' ? 0.15 : 0.1,
            }
          }}
          exit={{ 
            opacity: 0,
            transition: {
              duration: 0.2,
            }
          }}
        >
          {/* Hero section gets special treatment */}
          {pathname === '/' ? (
            <motion.div
              variants={{
                initial: { opacity: 0, y: 40 },
                animate: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.6, ease: 'easeOut' }
                }
              }}
            >
              {children}
            </motion.div>
          ) : (
            children
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
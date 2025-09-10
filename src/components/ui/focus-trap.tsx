'use client';

import * as React from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

export function FocusTrap({
  children,
  enabled = true,
  restoreFocus = true,
  initialFocusRef,
}: FocusTrapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = React.useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = React.useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)).filter(el => {
      return (
        el.tabIndex !== -1 &&
        getComputedStyle(el).display !== 'none' &&
        getComputedStyle(el).visibility !== 'hidden'
      );
    }) as HTMLElement[];
  }, []);

  React.useEffect(() => {
    if (!enabled) return;

    // Store the previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Focus initial element or first focusable element
    const focusableElements = getFocusableElements();
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [enabled, restoreFocus, initialFocusRef, getFocusableElements]);

  return <div ref={containerRef}>{children}</div>;
}

// Skip Link Component for keyboard navigation
export function SkipLink({
  href,
  children = 'Skip to main content',
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[999] bg-primary text-white px-4 py-2 rounded-lg font-medium transition-all focus-smooth'
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const target = document.querySelector(href) as HTMLElement;
          if (target) {
            target.focus();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }}
    >
      {children}
    </a>
  );
}

// Accessible Modal/Dialog component
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: AccessibleModalProps) {
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Announce to screen readers
      const announcement = `Dialog opened: ${title}`;
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);

      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 1000);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, title]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      <FocusTrap enabled={isOpen}>
        <div
          className={`relative bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${className}`}
        >
          <header className='p-6 border-b'>
            <h2 id={titleId} className='text-xl font-semibold'>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className='mt-2 text-gray-600'>
                {description}
              </p>
            )}
          </header>

          <div className='p-6'>{children}</div>
        </div>
      </FocusTrap>
    </div>
  );
}

// Accessible button with enhanced keyboard support
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Loading...',
  className,
  disabled,
  ...props
}: AccessibleButtonProps) {
  return (
    <button
      className={`
        touch-target focus-smooth interactive-scale
        inline-flex items-center justify-center rounded-xl font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variant === 'primary' && 'bg-primary text-white hover:bg-primary/90'}
        ${variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
        ${variant === 'ghost' && 'text-gray-700 hover:bg-gray-100'}
        ${variant === 'destructive' && 'bg-red-500 text-white hover:bg-red-600'}
        ${size === 'sm' && 'px-3 py-2 text-sm'}
        ${size === 'md' && 'px-4 py-2.5 text-sm'}
        ${size === 'lg' && 'px-6 py-3 text-base'}
        ${className}
      `}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-live={loading ? 'polite' : undefined}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}

// Screen Reader Only utility component
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className='sr-only'>{children}</span>;
}

// Live Region for dynamic content announcements
export function LiveRegion({
  children,
  assertive = false,
}: {
  children: React.ReactNode;
  assertive?: boolean;
}) {
  return (
    <div aria-live={assertive ? 'assertive' : 'polite'} aria-atomic='true' className='sr-only'>
      {children}
    </div>
  );
}

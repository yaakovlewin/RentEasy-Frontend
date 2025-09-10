'use client';

import * as React from 'react';

import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

interface MobileMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'full';
  showOverlay?: boolean;
  swipeToClose?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function MobileMenu({
  isOpen,
  onOpenChange,
  children,
  className,
  side = 'right',
  size = 'md',
  showOverlay = true,
  swipeToClose = true,
  header,
  footer,
}: MobileMenuProps) {
  const [startY, setStartY] = React.useState(0);
  const [currentY, setCurrentY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeToClose) return;
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeToClose || !isDragging) return;
    const currentYPos = e.touches[0].clientY;
    setCurrentY(currentYPos);

    if (side === 'bottom') {
      const deltaY = currentYPos - startY;
      if (deltaY > 0 && menuRef.current) {
        menuRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!swipeToClose || !isDragging) return;

    const deltaY = currentY - startY;
    setIsDragging(false);

    if (side === 'bottom' && deltaY > 100) {
      onOpenChange(false);
    }

    if (menuRef.current) {
      menuRef.current.style.transform = '';
    }
  };

  const sideClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
  };

  const sizeClasses = {
    sm: {
      left: 'w-64',
      right: 'w-64',
      bottom: 'h-1/3',
    },
    md: {
      left: 'w-80',
      right: 'w-80',
      bottom: 'h-1/2',
    },
    lg: {
      left: 'w-96',
      right: 'w-96',
      bottom: 'h-2/3',
    },
    full: {
      left: 'w-full',
      right: 'w-full',
      bottom: 'h-full',
    },
  };

  const positionClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div
          className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in'
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Menu */}
      <div
        ref={menuRef}
        className={cn(
          'fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out',
          positionClasses[side],
          sizeClasses[size][side],
          sideClasses[side],
          side === 'bottom' && 'rounded-t-3xl',
          (side === 'left' || side === 'right') && 'rounded-r-3xl',
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull indicator for bottom sheet */}
        {side === 'bottom' && swipeToClose && (
          <div className='flex justify-center pt-3 pb-2'>
            <div className='w-12 h-1 bg-gray-300 rounded-full swipe-indicator' />
          </div>
        )}

        {/* Header */}
        {header && <div className='p-6 border-b border-gray-100'>{header}</div>}

        {/* Content */}
        <div className='flex-1 overflow-y-auto smooth-scroll p-6'>{children}</div>

        {/* Footer */}
        {footer && <div className='p-6 border-t border-gray-100 bg-gray-50'>{footer}</div>}
      </div>
    </>
  );
}

// Trigger button component
interface MobileMenuTriggerProps {
  onClick: () => void;
  isOpen: boolean;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function MobileMenuTrigger({
  onClick,
  isOpen,
  className,
  variant = 'ghost',
  size = 'md',
}: MobileMenuTriggerProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn('touch-target interactive-scale lg:hidden', className)}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <div className='relative w-6 h-6'>
        <Menu
          className={cn(
            'absolute inset-0 w-6 h-6 transition-all duration-300',
            isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
          )}
        />
        <X
          className={cn(
            'absolute inset-0 w-6 h-6 transition-all duration-300',
            isOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
          )}
        />
      </div>
    </Button>
  );
}

// Preset bottom sheet component
export function BottomSheet({
  isOpen,
  onOpenChange,
  children,
  title,
  description,
  className,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <MobileMenu
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      side='bottom'
      size='md'
      className={className}
      header={
        title || description ? (
          <div>
            {title && <h2 className='text-lg font-semibold mb-2'>{title}</h2>}
            {description && <p className='text-gray-600 text-sm'>{description}</p>}
          </div>
        ) : undefined
      }
    >
      {children}
    </MobileMenu>
  );
}

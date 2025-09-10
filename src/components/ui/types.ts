// UI Component Types - Comprehensive Type Definitions

import * as React from 'react';

// Loading Components
export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
  className?: string;
  text?: string;
  color?: 'primary' | 'white' | 'gray';
}

// Empty State Components
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'search' | 'filter' | 'create' | 'connect';
}

// Property Card Components  
export interface PropertyCardProps {
  id: string | number;
  title: string;
  location: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  badge?: string;
  isFeatured?: boolean;
  discount?: number;
  isVerified?: boolean;
  host?: {
    name: string;
    avatar: string;
    isSuperhost?: boolean;
  };
  className?: string;
  variant?: 'default' | 'premium' | 'luxury' | 'compact';
}

// Validation Components
export interface ValidationMessageProps {
  message: string;
  variant?: 'error' | 'warning' | 'success' | 'info';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

// Focus Trap Components
export interface FocusTrapProps {
  children: React.ReactNode;
  enabled?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

// Notification Components
export interface NotificationProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'booking' | 'favorite' | 'review';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Error Display Components
export interface ErrorDisplayProps {
  error?: Error | string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onReset?: () => void;
  showDetails?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

// Mobile Menu Components
export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

// Progressive Disclosure Components
export interface ProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  variant?: 'default' | 'bordered' | 'filled';
  showIndicator?: boolean;
  disabled?: boolean;
}

// Optimized Image Components
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Common Utility Types
export interface ComponentVariants {
  variant?: string;
  size?: string;
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

export interface WithVariant<T = string> {
  variant?: T;
}

export interface WithSize<T = string> {
  size?: T;
}

// Form Related Types
export interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface InputVariants {
  variant?: 'default' | 'filled' | 'outlined' | 'underlined' | 'ghost';
  size?: 'sm' | 'default' | 'lg' | 'xl';
  state?: 'default' | 'error' | 'success' | 'warning';
}

export interface ButtonVariants {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glass' | 'modern';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
}

// Animation & Interaction Types
export interface AnimationProps {
  duration?: number;
  delay?: number;
  ease?: string;
  disabled?: boolean;
}

export interface InteractionProps {
  onClick?: (event: React.MouseEvent) => void;
  onHover?: (event: React.MouseEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

// Accessibility Types
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Theme & Styling Types
export interface ThemeProps {
  theme?: 'light' | 'dark' | 'auto';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

// Responsive Types
export interface ResponsiveProps {
  xs?: boolean | string | number;
  sm?: boolean | string | number;
  md?: boolean | string | number;
  lg?: boolean | string | number;
  xl?: boolean | string | number;
  '2xl'?: boolean | string | number;
}

// Export combined types for common patterns
export type UIComponentProps = ComponentVariants & WithClassName & AccessibilityProps;
export type InteractiveComponentProps = UIComponentProps & InteractionProps;
export type AnimatedComponentProps = UIComponentProps & AnimationProps;
export type ThemedComponentProps = UIComponentProps & ThemeProps;
export type ResponsiveComponentProps = UIComponentProps & ResponsiveProps;
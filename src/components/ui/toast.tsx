'use client';

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, AlertTriangle, Check, Info, X } from 'lucide-react';

import { cn } from '@/lib/utils';

const toastVariants = cva(
  'relative flex items-start space-x-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 notification-enter',
  {
    variants: {
      variant: {
        default: 'bg-white/95 border-gray-200 text-gray-900',
        success: 'bg-green-50/95 border-green-200 text-green-900',
        error: 'bg-red-50/95 border-red-200 text-red-900',
        warning: 'bg-yellow-50/95 border-yellow-200 text-yellow-900',
        info: 'bg-blue-50/95 border-blue-200 text-blue-900',
      },
      size: {
        default: 'min-w-80 max-w-md',
        sm: 'min-w-64 max-w-sm',
        lg: 'min-w-96 max-w-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  icon?: React.ReactNode;
  duration?: number;
  className?: string;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      variant,
      size,
      title,
      description,
      action,
      onClose,
      showCloseButton = true,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const defaultIcons = {
      default: <Info className='w-5 h-5 text-gray-500 mt-0.5' />,
      success: <Check className='w-5 h-5 text-green-500 mt-0.5' />,
      error: <AlertCircle className='w-5 h-5 text-red-500 mt-0.5' />,
      warning: <AlertTriangle className='w-5 h-5 text-yellow-500 mt-0.5' />,
      info: <Info className='w-5 h-5 text-blue-500 mt-0.5' />,
    };

    const displayIcon = icon || (variant ? defaultIcons[variant] : defaultIcons.default);

    return (
      <div ref={ref} className={cn(toastVariants({ variant, size }), className)} {...props}>
        {displayIcon}

        <div className='flex-1 min-w-0'>
          {title && <div className='font-semibold text-sm mb-1'>{title}</div>}
          {description && (
            <div className='text-sm text-muted-foreground leading-relaxed'>{description}</div>
          )}
          {action && <div className='mt-3'>{action}</div>}
        </div>

        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className='touch-target p-1 rounded-lg hover:bg-gray-100/80 transition-colors focus-smooth'
            aria-label='Close notification'
          >
            <X className='w-4 h-4' />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Toast Container for managing multiple toasts
interface ToastContainerProps {
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center';
  className?: string;
  children?: React.ReactNode;
}

const ToastContainer = React.forwardRef<HTMLDivElement, ToastContainerProps>(
  ({ position = 'top-right', className, children, ...props }, ref) => {
    const positionClasses = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'top-center': 'top-4 left-1/2 -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-[100] flex flex-col space-y-3 pointer-events-none',
          positionClasses[position],
          className
        )}
        {...props}
      >
        <div className='pointer-events-auto'>{children}</div>
      </div>
    );
  }
);

ToastContainer.displayName = 'ToastContainer';

// Toast hook for programmatic usage
interface ToastOptions extends Omit<ToastProps, 'onClose'> {
  duration?: number;
}

interface ToastInstance {
  id: string;
  dismiss: () => void;
  update: (options: Partial<ToastOptions>) => void;
}

type ToastState = {
  toasts: (ToastOptions & { id: string })[];
};

const toastState: ToastState = {
  toasts: [],
};

const listeners: Array<(state: ToastState) => void> = [];

const genId = (() => {
  let count = 0;
  return () => {
    return (++count).toString();
  };
})();

const addToast = (options: ToastOptions): ToastInstance => {
  const id = genId();
  const dismiss = () => dismissToast(id);
  const update = (newOptions: Partial<ToastOptions>) => updateToast(id, newOptions);

  const toast = {
    ...options,
    id,
  };

  toastState.toasts.push(toast);
  listeners.forEach(listener => listener(toastState));

  // Auto dismiss after duration
  if (options.duration !== 0) {
    setTimeout(dismiss, options.duration || 4000);
  }

  return { id, dismiss, update };
};

const dismissToast = (id: string) => {
  toastState.toasts = toastState.toasts.filter(toast => toast.id !== id);
  listeners.forEach(listener => listener(toastState));
};

const updateToast = (id: string, options: Partial<ToastOptions>) => {
  toastState.toasts = toastState.toasts.map(toast =>
    toast.id === id ? { ...toast, ...options } : toast
  );
  listeners.forEach(listener => listener(toastState));
};

const useToast = () => {
  const [state, setState] = React.useState<ToastState>(toastState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const toast = React.useCallback((options: ToastOptions) => addToast(options), []);

  return {
    toast,
    toasts: state.toasts,
    dismiss: dismissToast,
    success: (options: Omit<ToastOptions, 'variant'>) => toast({ ...options, variant: 'success' }),
    error: (options: Omit<ToastOptions, 'variant'>) => toast({ ...options, variant: 'error' }),
    warning: (options: Omit<ToastOptions, 'variant'>) => toast({ ...options, variant: 'warning' }),
    info: (options: Omit<ToastOptions, 'variant'>) => toast({ ...options, variant: 'info' }),
  };
};

export { Toast, ToastContainer, useToast, type ToastProps };

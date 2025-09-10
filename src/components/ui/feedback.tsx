'use client';

import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Info, Loader2, X, XCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

// Alert/Banner component for system-wide messages
const alertVariants = cva(
  'relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-blue-50 border-blue-200 text-blue-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
        error: 'bg-red-50 border-red-200 text-red-900',
      },
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  size = 'default',
  title,
  description,
  children,
  onClose,
  className,
  icon,
  action,
}) => {
  const icons = {
    default: <Info className='w-5 h-5 text-blue-500 mt-0.5' />,
    success: <CheckCircle className='w-5 h-5 text-green-500 mt-0.5' />,
    warning: <AlertCircle className='w-5 h-5 text-yellow-500 mt-0.5' />,
    error: <XCircle className='w-5 h-5 text-red-500 mt-0.5' />,
  };

  const displayIcon = icon !== null ? icon || icons[variant] : null;

  return (
    <div className={cn(alertVariants({ variant, size }), 'animate-slide-down', className)}>
      {displayIcon}

      <div className='flex-1 min-w-0'>
        {title && <h4 className='font-semibold mb-1'>{title}</h4>}
        {description && <p className='leading-relaxed opacity-90'>{description}</p>}
        {children}
        {action && <div className='mt-3'>{action}</div>}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className='touch-target p-1 rounded-lg hover:bg-black/5 transition-colors focus-smooth'
          aria-label='Dismiss alert'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  );
};

// Inline feedback component for form fields and actions
interface InlineFeedbackProps {
  variant: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  className?: string;
  size?: 'sm' | 'default';
}

export const InlineFeedback: React.FC<InlineFeedbackProps> = ({
  variant,
  message,
  className,
  size = 'default',
}) => {
  const icons = {
    success: <CheckCircle className='w-4 h-4 text-green-500' />,
    error: <XCircle className='w-4 h-4 text-red-500' />,
    warning: <AlertCircle className='w-4 h-4 text-yellow-500' />,
    loading: <Loader2 className='w-4 h-4 text-blue-500 animate-spin' />,
  };

  const colors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    loading: 'text-blue-600',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 animate-slide-down',
        colors[variant],
        size === 'sm' ? 'text-sm' : 'text-base',
        className
      )}
    >
      {icons[variant]}
      <span>{message}</span>
    </div>
  );
};

// Success/Error state for completed actions
interface ActionFeedbackProps {
  variant: 'success' | 'error';
  title: string;
  description?: string;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const ActionFeedback: React.FC<ActionFeedbackProps> = ({
  variant,
  title,
  description,
  action,
  onDismiss,
  className,
}) => {
  const config = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-500',
      titleColor: 'text-green-900',
      descColor: 'text-green-700',
      icon: <CheckCircle className='w-6 h-6' />,
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      titleColor: 'text-red-900',
      descColor: 'text-red-700',
      icon: <XCircle className='w-6 h-6' />,
    },
  };

  const style = config[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-6 rounded-2xl border animate-slide-down',
        style.bgColor,
        style.borderColor,
        className
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          style.iconBg
        )}
      >
        <div className={style.iconColor}>{style.icon}</div>
      </div>

      <div className='flex-1 min-w-0'>
        <h3 className={cn('font-semibold mb-1', style.titleColor)}>{title}</h3>
        {description && (
          <p className={cn('leading-relaxed mb-4', style.descColor)}>{description}</p>
        )}
        {action}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className='touch-target p-1 rounded-lg hover:bg-black/5 transition-colors focus-smooth'
          aria-label='Dismiss'
        >
          <X className='w-5 h-5' />
        </button>
      )}
    </div>
  );
};

// Progress feedback for multi-step processes
interface ProgressFeedbackProps {
  steps: {
    label: string;
    status: 'pending' | 'active' | 'completed' | 'error';
  }[];
  className?: string;
}

export const ProgressFeedback: React.FC<ProgressFeedbackProps> = ({ steps, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        const statusConfig = {
          pending: {
            icon: <div className='w-2 h-2 bg-gray-300 rounded-full' />,
            textColor: 'text-gray-500',
            lineColor: 'bg-gray-200',
          },
          active: {
            icon: <Loader2 className='w-4 h-4 text-blue-500 animate-spin' />,
            textColor: 'text-blue-600 font-medium',
            lineColor: 'bg-gray-200',
          },
          completed: {
            icon: <CheckCircle className='w-4 h-4 text-green-500' />,
            textColor: 'text-green-600',
            lineColor: 'bg-green-200',
          },
          error: {
            icon: <XCircle className='w-4 h-4 text-red-500' />,
            textColor: 'text-red-600',
            lineColor: 'bg-red-200',
          },
        };

        const config = statusConfig[step.status];

        return (
          <div key={index} className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-6 h-6 flex-shrink-0'>
              {config.icon}
            </div>

            <span className={cn('flex-1', config.textColor)}>{step.label}</span>

            {!isLast && <div className={cn('w-12 h-0.5 ml-auto', config.lineColor)} />}
          </div>
        );
      })}
    </div>
  );
};

// Global feedback hook for app-wide notifications
interface FeedbackState {
  message: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
}

const useFeedback = () => {
  const [feedback, setFeedback] = React.useState<FeedbackState>({
    message: '',
    variant: 'info',
    isVisible: false,
  });

  const showFeedback = React.useCallback(
    (
      message: string,
      variant: 'success' | 'error' | 'warning' | 'info' = 'info',
      duration = 4000
    ) => {
      setFeedback({ message, variant, isVisible: true });

      if (duration > 0) {
        setTimeout(() => {
          setFeedback(prev => ({ ...prev, isVisible: false }));
        }, duration);
      }
    },
    []
  );

  const hideFeedback = React.useCallback(() => {
    setFeedback(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    feedback,
    showFeedback,
    hideFeedback,
    showSuccess: (message: string, duration?: number) => showFeedback(message, 'success', duration),
    showError: (message: string, duration?: number) => showFeedback(message, 'error', duration),
    showWarning: (message: string, duration?: number) => showFeedback(message, 'warning', duration),
    showInfo: (message: string, duration?: number) => showFeedback(message, 'info', duration),
  };
};

// Status indicator for system states
interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'loading' | 'error';
  label?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  className,
  size = 'default',
}) => {
  const config = {
    online: {
      color: 'bg-green-500',
      label: 'Online',
      animation: '',
    },
    offline: {
      color: 'bg-gray-400',
      label: 'Offline',
      animation: '',
    },
    loading: {
      color: 'bg-blue-500',
      label: 'Loading',
      animation: 'animate-pulse',
    },
    error: {
      color: 'bg-red-500',
      label: 'Error',
      animation: 'animate-pulse',
    },
  };

  const sizes = {
    sm: 'w-2 h-2',
    default: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusConfig = config[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn('rounded-full', sizes[size], statusConfig.color, statusConfig.animation)}
      />
      {label && <span className='text-sm text-gray-600'>{label || statusConfig.label}</span>}
    </div>
  );
};

// Confirmation dialog component
interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  className?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />

      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scale-in',
          className
        )}
      >
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>

        {description && <p className='text-gray-600 mb-6 leading-relaxed'>{description}</p>}

        <div className='flex gap-3 justify-end'>
          <Button variant='outline' onClick={onClose}>
            {cancelText}
          </Button>

          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { useFeedback };

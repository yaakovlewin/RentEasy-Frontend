import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none',
  {
    variants: {
      variant: {
        default:
          'border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:border-primary hover:border-primary/60',
        filled:
          'bg-muted border-0 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring hover:bg-muted/80',
        outlined:
          'border-2 border-input bg-transparent focus-visible:border-primary focus-visible:ring-0 hover:border-primary/60',
        underlined:
          'border-0 border-b-2 border-input bg-transparent rounded-none focus-visible:border-primary focus-visible:ring-0 hover:border-primary/60 px-0',
        ghost:
          'border-0 bg-transparent focus-visible:bg-muted focus-visible:ring-0 hover:bg-muted/50',
      },
      size: {
        sm: 'h-9 px-3 py-1 text-sm rounded-lg',
        default: 'h-11 px-4 py-2 text-sm rounded-xl',
        lg: 'h-13 px-5 py-3 text-base rounded-xl',
        xl: 'h-16 px-6 py-4 text-lg rounded-2xl',
      },
      state: {
        default: '',
        error:
          'border-destructive focus-visible:ring-destructive focus-visible:border-destructive text-destructive',
        success:
          'border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500 text-green-700',
        warning:
          'border-yellow-500 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 text-yellow-700',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  label?: string;
  floatingLabel?: boolean;
  maxLength?: number;
  showCount?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      size,
      state,
      leftIcon,
      rightIcon,
      helperText,
      label,
      floatingLabel,
      maxLength,
      showCount,
      value,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      setHasValue(Boolean(value || inputRef.current?.value));
    }, [value]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(Boolean(e.target.value));
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      props.onChange?.(e);
    };

    const shouldFloatLabel = floatingLabel && (focused || hasValue || placeholder);
    const characterCount =
      typeof value === 'string' ? value.length : inputRef.current?.value?.length || 0;

    return (
      <div className='relative w-full'>
        {/* Standard Label */}
        {label && !floatingLabel && (
          <label
            className={cn(
              'block text-sm font-medium mb-2 transition-colors',
              state === 'error' && 'text-destructive',
              state === 'success' && 'text-green-700',
              state === 'warning' && 'text-yellow-700'
            )}
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className='relative'>
          {/* Floating Label */}
          {floatingLabel && label && (
            <label
              className={cn(
                'absolute transition-all duration-200 pointer-events-none text-muted-foreground',
                shouldFloatLabel
                  ? 'text-xs -top-2.5 left-3 bg-background px-2 text-primary font-medium'
                  : 'text-sm top-1/2 -translate-y-1/2 left-4',
                variant === 'filled' && shouldFloatLabel && 'bg-muted',
                variant === 'underlined' && shouldFloatLabel && 'bg-transparent px-0 left-0',
                state === 'error' && 'text-destructive',
                state === 'success' && 'text-green-500',
                state === 'warning' && 'text-yellow-500'
              )}
            >
              {label}
            </label>
          )}

          {/* Left Icon */}
          {leftIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors',
                focused && 'text-primary',
                size === 'sm' && 'left-2',
                size === 'lg' && 'left-4',
                size === 'xl' && 'left-5',
                variant === 'underlined' && 'left-0'
              )}
            >
              {leftIcon}
            </div>
          )}

          {/* Input Element */}
          <input
            type={type}
            className={cn(
              inputVariants({ variant, size, state }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              size === 'sm' && leftIcon && 'pl-8',
              size === 'lg' && leftIcon && 'pl-12',
              size === 'xl' && leftIcon && 'pl-14',
              size === 'sm' && rightIcon && 'pr-8',
              size === 'lg' && rightIcon && 'pr-12',
              size === 'xl' && rightIcon && 'pr-14',
              variant === 'underlined' && leftIcon && 'pl-6',
              variant === 'underlined' && rightIcon && 'pr-6',
              floatingLabel && !shouldFloatLabel && 'pt-6',
              className
            )}
            ref={inputRef}
            value={value}
            placeholder={floatingLabel ? undefined : placeholder}
            maxLength={maxLength}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors',
                focused && 'text-primary',
                size === 'sm' && 'right-2',
                size === 'lg' && 'right-4',
                size === 'xl' && 'right-5',
                variant === 'underlined' && 'right-0'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper Text and Character Count */}
        <div
          className={cn(
            'flex justify-between items-center mt-1.5 px-1',
            !helperText && !showCount && 'hidden'
          )}
        >
          {helperText && (
            <p
              className={cn(
                'text-xs text-muted-foreground transition-colors',
                state === 'error' && 'text-destructive',
                state === 'success' && 'text-green-600',
                state === 'warning' && 'text-yellow-600'
              )}
            >
              {helperText}
            </p>
          )}

          {showCount && maxLength && (
            <p
              className={cn(
                'text-xs transition-colors ml-auto',
                characterCount > maxLength * 0.9 ? 'text-yellow-600' : 'text-muted-foreground',
                characterCount >= maxLength && 'text-destructive'
              )}
            >
              {characterCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };

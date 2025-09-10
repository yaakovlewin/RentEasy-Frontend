import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary/60 transition-colors resize-none',
  {
    variants: {
      size: {
        sm: 'min-h-[60px] px-3 py-1.5 text-xs',
        default: 'min-h-[80px] px-4 py-2 text-sm',
        lg: 'min-h-[100px] px-5 py-3 text-base',
      },
      variant: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
      },
      resize: {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
      resize: 'none',
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  helperText?: string;
  characterCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    size,
    variant,
    resize,
    label,
    helperText,
    characterCount,
    maxLength,
    value,
    ...props
  }, ref) => {
    const [currentLength, setCurrentLength] = React.useState(0);
    
    React.useEffect(() => {
      if (typeof value === 'string') {
        setCurrentLength(value.length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentLength(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            className={cn(
              'block text-sm font-medium mb-2 transition-colors',
              variant === 'error' && 'text-destructive',
              variant === 'success' && 'text-green-700'
            )}
          >
            {label}
          </label>
        )}
        
        <textarea
          className={cn(textareaVariants({ size, variant, resize }), className)}
          ref={ref}
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        
        <div className={cn(
          'flex justify-between items-center mt-1.5 px-1',
          !helperText && !characterCount && 'hidden'
        )}>
          {helperText && (
            <p
              className={cn(
                'text-xs text-muted-foreground transition-colors',
                variant === 'error' && 'text-destructive',
                variant === 'success' && 'text-green-600'
              )}
            >
              {helperText}
            </p>
          )}
          
          {characterCount && maxLength && (
            <p
              className={cn(
                'text-xs transition-colors ml-auto',
                currentLength > maxLength * 0.9 ? 'text-yellow-600' : 'text-muted-foreground',
                currentLength >= maxLength && 'text-destructive'
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
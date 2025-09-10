import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden select-none touch-manipulation',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm hover:shadow-large hover:-translate-y-1 active:translate-y-0 active:shadow-medium active:scale-[0.98] transition-all duration-200',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-large hover:-translate-y-0.5 active:translate-y-0',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-medium hover:border-primary/40 hover:-translate-y-0.5 active:translate-y-0',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0',
        ghost:
          'hover:bg-accent hover:text-accent-foreground rounded-xl hover:scale-[1.02] active:scale-[0.98]',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary-hover',
        gradient:
          'bg-gradient-to-r from-primary via-primary-light to-primary text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:shadow-lg active:scale-[0.98] hover:from-primary-hover hover:via-primary hover:to-primary-light',
        glass:
          'backdrop-blur-xl bg-white/10 border border-white/20 text-foreground hover:bg-white/20 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0',
        modern:
          'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] border border-slate-700/50',
      },
      size: {
        default: 'h-11 px-6 py-2 rounded-xl text-sm font-semibold',
        sm: 'h-9 px-4 py-2 rounded-lg text-sm font-medium',
        lg: 'h-13 px-8 py-3 rounded-xl text-base font-semibold',
        xl: 'h-16 px-12 py-4 rounded-2xl text-lg font-bold',
        icon: 'h-11 w-11 rounded-xl',
        'icon-sm': 'h-9 w-9 rounded-lg',
        'icon-lg': 'h-13 w-13 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

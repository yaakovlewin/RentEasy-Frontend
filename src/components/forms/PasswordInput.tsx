import * as React from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleToggle = () => {
      setShowPassword((prev) => !prev);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          aria-label="Password"
          role="textbox"
          {...props}
        />
        <button
          type="button"
          role="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={props.disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          tabIndex={0}
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          ) : (
            <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };

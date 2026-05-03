'use client';

import { Minus, Plus } from 'lucide-react';
import type { ComponentProps } from 'react';

import { COMMON_CLASSES } from './constants';
import { cn } from './utils';

interface GuestCounterProps {
  label: string;
  description: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement: boolean;
  canDecrement: boolean;
  className?: string;
  disabled?: boolean;
  'data-testid'?: string;
}

const BUTTON_BASE_CLASSES =
  'w-8 h-8 border flex items-center justify-center transition-colors' as const;

const getButtonClasses = (isEnabled: boolean) =>
  isEnabled
    ? 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
    : 'border-gray-200 text-gray-300 cursor-not-allowed';

interface CounterButtonProps extends Omit<ComponentProps<'button'>, 'type' | 'className'> {
  icon: typeof Plus | typeof Minus;
  canPerformAction: boolean;
  action: 'Increment' | 'Decrement';
  label: string;
}

function CounterButton({
  icon: Icon,
  canPerformAction,
  disabled,
  action,
  label,
  ...props
}: CounterButtonProps) {
  const isEnabled = canPerformAction && !disabled;

  return (
    <button
      type='button'
      disabled={!isEnabled}
      className={cn(BUTTON_BASE_CLASSES, COMMON_CLASSES.ROUNDED_FULL, getButtonClasses(isEnabled))}
      aria-label={`${action} ${label.toLowerCase()}`}
      {...props}
    >
      <Icon className='w-3 h-3' />
    </button>
  );
}

export function GuestCounter({
  label,
  description,
  value,
  onIncrement,
  onDecrement,
  canIncrement,
  canDecrement,
  className,
  disabled = false,
  'data-testid': testId,
}: GuestCounterProps) {
  return (
    <div className={cn('flex items-center justify-between py-4', className)} data-testid={testId}>
      <div className='flex-1'>
        <div className='font-medium text-gray-900'>{label}</div>
        <div className='text-sm text-gray-500'>{description}</div>
      </div>
      <div className='flex items-center space-x-3'>
        <CounterButton
          icon={Minus}
          onClick={onDecrement}
          canPerformAction={canDecrement}
          disabled={disabled}
          action='Decrement'
          label={label}
        />
        <span
          className='w-8 text-center font-medium text-gray-900'
          aria-live='polite'
          aria-atomic='true'
        >
          {value}
        </span>
        <CounterButton
          icon={Plus}
          onClick={onIncrement}
          canPerformAction={canIncrement}
          disabled={disabled}
          action='Increment'
          label={label}
        />
      </div>
    </div>
  );
}

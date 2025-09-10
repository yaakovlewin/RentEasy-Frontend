'use client';

import { Minus, Plus } from 'lucide-react';

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
}: GuestCounterProps) {
  return (
    <div className={cn('flex items-center justify-between py-4', className)}>
      <div className='flex-1'>
        <div className='font-medium text-gray-900'>{label}</div>
        <div className='text-sm text-gray-500'>{description}</div>
      </div>
      <div className='flex items-center space-x-3'>
        <button
          type='button'
          onClick={onDecrement}
          disabled={!canDecrement}
          className={cn(
            'w-8 h-8 border flex items-center justify-center transition-colors',
            COMMON_CLASSES.ROUNDED_FULL,
            canDecrement
              ? 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          )}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <Minus className='w-3 h-3' />
        </button>
        <span
          className='w-8 text-center font-medium text-gray-900'
          aria-label={`${value} ${label.toLowerCase()}`}
        >
          {value}
        </span>
        <button
          type='button'
          onClick={onIncrement}
          disabled={!canIncrement}
          className={cn(
            'w-8 h-8 border flex items-center justify-center transition-colors',
            COMMON_CLASSES.ROUNDED_FULL,
            canIncrement
              ? 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          )}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <Plus className='w-3 h-3' />
        </button>
      </div>
    </div>
  );
}

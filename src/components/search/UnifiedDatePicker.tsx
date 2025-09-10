'use client';

import { useRef, useState } from 'react';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { Calendar } from './Calendar';
import { ANIMATION, DATE_FORMATS, Z_INDEX } from './constants';
import { useClickOutside, useDateSelection } from './hooks';
import { calculateNights, cn, formatDateRange } from './utils';

interface UnifiedDatePickerProps {
  checkIn: Date | null;
  checkOut: Date | null;
  onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void;
  onClose?: () => void;
  placeholder?: string;
  className?: string;
  variant?: 'compact' | 'enhanced';
  isOpen?: boolean;
  focusedField?: 'check-in' | 'check-out';
  showHeader?: boolean;
  autoClose?: boolean;
}

export function UnifiedDatePicker({
  checkIn,
  checkOut,
  onDateSelect,
  onClose,
  placeholder = 'Check in - Check out',
  className,
  variant = 'compact',
  isOpen: controlledOpen,
  focusedField = 'check-in',
  showHeader = false,
  autoClose = true,
}: UnifiedDatePickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const {
    checkIn: localCheckIn,
    checkOut: localCheckOut,
    selectingCheckOut,
    handleDateClick,
    clearDates,
    setSelectingCheckOut,
  } = useDateSelection({
    initialCheckIn: checkIn,
    initialCheckOut: checkOut,
    onDateSelect: (newCheckIn, newCheckOut) => {
      onDateSelect(newCheckIn, newCheckOut);

      // Auto close when both dates are selected
      if (autoClose && newCheckIn && newCheckOut && !isControlled) {
        setTimeout(() => {
          setInternalOpen(false);
          setSelectingCheckOut(false);
        }, ANIMATION.CLOSE_DELAY);
      }

      // Call onClose if both dates selected
      if (autoClose && newCheckIn && newCheckOut && onClose) {
        setTimeout(onClose, ANIMATION.CLOSE_DELAY);
      }
    },
    autoProgressToCheckOut: true,
  });

  const closeDropdown = () => {
    if (!isControlled) {
      setInternalOpen(false);
    }
    onClose?.();
    setSelectingCheckOut(false);
  };

  useClickOutside(closeDropdown, ['.enhanced-date-picker', '.calendar-dropdown']);

  const toggleOpen = () => {
    if (!isControlled) {
      setInternalOpen(!internalOpen);
    }
  };

  const handleClearDates = () => {
    clearDates();
    setSelectingCheckOut(false);
  };

  // Enhanced variant with header and dual calendar
  if (variant === 'enhanced') {
    return (
      <div
        ref={containerRef}
        className={cn(
          'enhanced-date-picker bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-max',
          `z-[${Z_INDEX.POPOVER}]`,
          className
        )}
      >
        {/* Header showing selection state */}
        {showHeader && (
          <div className='px-6 py-3 border-b border-gray-200 bg-gray-50'>
            <div className='flex items-center gap-4'>
              <div className={cn('flex-1', !selectingCheckOut && 'font-semibold')}>
                <div className='text-xs text-gray-600'>Check-in</div>
                <div className='text-sm'>
                  {localCheckIn ? format(localCheckIn, DATE_FORMATS.MONTH_DAY_YEAR) : 'Select date'}
                </div>
              </div>
              <div className='text-gray-400'>→</div>
              <div className={cn('flex-1', selectingCheckOut && 'font-semibold')}>
                <div className='text-xs text-gray-600'>Check-out</div>
                <div className='text-sm'>
                  {localCheckOut
                    ? format(localCheckOut, DATE_FORMATS.MONTH_DAY_YEAR)
                    : 'Select date'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dual Calendar */}
        <div className='flex'>
          <Calendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onDateClick={handleDateClick}
            checkIn={localCheckIn}
            checkOut={localCheckOut}
            selectingCheckOut={selectingCheckOut}
            monthOffset={0}
            showNavigation={true}
            aria-label='Select check-in and check-out dates'
          />
          <div className='border-l border-gray-200'>
            <Calendar
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onDateClick={handleDateClick}
              checkIn={localCheckIn}
              checkOut={localCheckOut}
              selectingCheckOut={selectingCheckOut}
              monthOffset={1}
              showNavigation={true}
              aria-label='Select check-in and check-out dates (next month)'
            />
          </div>
        </div>

        {/* Footer */}
        <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <button
              type='button'
              onClick={handleClearDates}
              className='text-sm font-medium text-gray-600 hover:text-gray-900'
            >
              Clear dates
            </button>
            <div className='text-sm text-gray-600'>
              {selectingCheckOut && localCheckIn && !localCheckOut && 'Select checkout date'}
              {!localCheckIn && 'Select check-in date'}
              {localCheckIn &&
                localCheckOut &&
                `${calculateNights(localCheckIn, localCheckOut)} nights`}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant with dropdown
  return (
    <div ref={containerRef} className='relative'>
      <button
        ref={buttonRef}
        type='button'
        onClick={toggleOpen}
        className={cn(
          'flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors w-full',
          className
        )}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
      >
        <CalendarIcon className='w-5 h-5 text-gray-400 flex-shrink-0' />
        <span
          className={cn(
            'flex-1',
            !localCheckIn && !localCheckOut ? 'text-gray-500' : 'text-gray-900'
          )}
        >
          {formatDateRange(localCheckIn, localCheckOut, placeholder)}
        </span>
      </button>

      {isOpen && (
        <div
          className={cn(
            'calendar-dropdown absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-max',
            `z-[${Z_INDEX.DROPDOWN}]`
          )}
        >
          <div className='flex'>
            <Calendar
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onDateClick={handleDateClick}
              checkIn={localCheckIn}
              checkOut={localCheckOut}
              selectingCheckOut={selectingCheckOut}
              monthOffset={0}
              showNavigation={true}
            />
            <div className='border-l border-gray-200'>
              <Calendar
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                onDateClick={handleDateClick}
                checkIn={localCheckIn}
                checkOut={localCheckOut}
                selectingCheckOut={selectingCheckOut}
                monthOffset={1}
                showNavigation={true}
              />
            </div>
          </div>

          <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <button
                type='button'
                onClick={handleClearDates}
                className='text-sm font-medium text-gray-600 hover:text-gray-900'
              >
                Clear dates
              </button>
              <div className='text-sm text-gray-600'>
                {localCheckIn && !localCheckOut && 'Select checkout date'}
                {localCheckIn &&
                  localCheckOut &&
                  `${format(localCheckOut, DATE_FORMATS.MONTH_DAY_YEAR)} - ${format(localCheckIn, DATE_FORMATS.MONTH_DAY_YEAR)}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

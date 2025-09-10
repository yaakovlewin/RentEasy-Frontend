'use client';

import { useMemo } from 'react';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { COMMON_CLASSES, DATE_FORMATS, SIZES, WEEKDAYS } from './constants';
import { cn, isDateDisabled, isDateInRange } from './utils';

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
  checkIn?: Date | null;
  checkOut?: Date | null;
  selectingCheckOut?: boolean;
  monthOffset?: number;
  showNavigation?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function Calendar({
  currentMonth,
  onMonthChange,
  onDateClick,
  checkIn = null,
  checkOut = null,
  selectingCheckOut = false,
  monthOffset = 0,
  showNavigation = true,
  className,
  'aria-label': ariaLabel,
}: CalendarProps) {
  const month = useMemo(() => addMonths(currentMonth, monthOffset), [currentMonth, monthOffset]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    // Get all days to show (including days from previous/next month to fill the grid)
    const startCalendar = new Date(monthStart);
    startCalendar.setDate(startCalendar.getDate() - startCalendar.getDay());

    const endCalendar = new Date(monthEnd);
    endCalendar.setDate(endCalendar.getDate() + (6 - endCalendar.getDay()));

    return eachDayOfInterval({
      start: startCalendar,
      end: endCalendar,
    });
  }, [month]);

  const isRangeStart = (date: Date): boolean => (checkIn ? isSameDay(date, checkIn) : false);
  const isRangeEnd = (date: Date): boolean => (checkOut ? isSameDay(date, checkOut) : false);
  const isInRange = (date: Date): boolean => isDateInRange(date, checkIn, checkOut);

  const getDayClasses = (date: Date): string => {
    const base = cn(
      SIZES.CALENDAR_DAY,
      'flex items-center justify-center text-sm font-medium cursor-pointer transition-colors',
      COMMON_CLASSES.ROUNDED_FULL
    );

    if (isDateDisabled(date)) {
      return cn(base, 'text-gray-300 cursor-not-allowed hover:bg-transparent');
    }

    if (isRangeStart(date) || isRangeEnd(date)) {
      return cn(base, 'bg-primary text-white hover:bg-primary/90');
    }

    if (isInRange(date)) {
      return cn(base, 'bg-primary/10 text-primary hover:bg-primary/20');
    }

    if (isToday(date)) {
      return cn(base, 'border-2 border-primary text-primary hover:bg-primary/10');
    }

    if (!isSameMonth(date, month)) {
      return cn(base, 'text-gray-300 hover:bg-gray-50');
    }

    // Highlight potential check-out dates when selecting
    if (selectingCheckOut && checkIn && !isBefore(date, checkIn)) {
      return cn(base, 'text-gray-700 hover:bg-primary/10 hover:text-primary');
    }

    return cn(base, 'text-gray-700 hover:bg-gray-50');
  };

  const handlePrevMonth = () => onMonthChange(subMonths(currentMonth, 1));
  const handleNextMonth = () => onMonthChange(addMonths(currentMonth, 1));

  return (
    <div
      className={cn('p-4', className)}
      role='grid'
      aria-label={ariaLabel || `Calendar for ${format(month, DATE_FORMATS.MONTH_YEAR)}`}
    >
      {/* Month Header */}
      <div className='flex items-center justify-between mb-4'>
        {showNavigation && monthOffset === 0 && (
          <button
            type='button'
            onClick={handlePrevMonth}
            className='p-2 hover:bg-gray-100 rounded-full'
            aria-label='Previous month'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>
        )}
        <h3 className='font-semibold text-gray-900 flex-1 text-center' id={`month-${monthOffset}`}>
          {format(month, DATE_FORMATS.MONTH_YEAR)}
        </h3>
        {showNavigation && (monthOffset === 0 || monthOffset === 1) && (
          <button
            type='button'
            onClick={handleNextMonth}
            className='p-2 hover:bg-gray-100 rounded-full'
            aria-label='Next month'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        )}
      </div>

      {/* Weekday Headers */}
      <div className='grid grid-cols-7 gap-1 mb-2' role='row'>
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className={cn(
              SIZES.CALENDAR_WEEKDAY,
              'flex items-center justify-center text-xs font-medium text-gray-500'
            )}
            role='columnheader'
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-1' role='grid'>
        {calendarDays.map((day, index) => (
          <button
            key={index}
            type='button'
            onClick={() => !isDateDisabled(day) && onDateClick(day)}
            className={getDayClasses(day)}
            disabled={isDateDisabled(day)}
            aria-label={format(day, 'EEEE, MMMM do, yyyy')}
            aria-selected={isRangeStart(day) || isRangeEnd(day)}
            role='gridcell'
            tabIndex={isToday(day) ? 0 : -1}
          >
            {format(day, DATE_FORMATS.DAY)}
          </button>
        ))}
      </div>
    </div>
  );
}

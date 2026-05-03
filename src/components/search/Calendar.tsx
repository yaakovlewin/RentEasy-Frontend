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

interface DateState {
  checkIn: Date | null;
  checkOut: Date | null;
  selectingCheckOut: boolean;
}

interface DayClassifiers {
  isDisabled: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isCurrentDay: boolean;
  isDifferentMonth: boolean;
  isPotentialCheckOut: boolean;
}

const getCalendarBoundaries = (month: Date) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  const startCalendar = new Date(monthStart);
  startCalendar.setDate(startCalendar.getDate() - startCalendar.getDay());

  const endCalendar = new Date(monthEnd);
  endCalendar.setDate(endCalendar.getDate() + (6 - endCalendar.getDay()));

  return { start: startCalendar, end: endCalendar };
};

const getCalendarDays = (month: Date): Date[] => {
  const boundaries = getCalendarBoundaries(month);
  return eachDayOfInterval(boundaries);
};

const classifyDate = (
  date: Date,
  month: Date,
  dateState: DateState
): DayClassifiers => ({
  isDisabled: isDateDisabled(date),
  isRangeStart: dateState.checkIn ? isSameDay(date, dateState.checkIn) : false,
  isRangeEnd: dateState.checkOut ? isSameDay(date, dateState.checkOut) : false,
  isInRange: isDateInRange(date, dateState.checkIn, dateState.checkOut),
  isCurrentDay: isToday(date),
  isDifferentMonth: !isSameMonth(date, month),
  isPotentialCheckOut:
    dateState.selectingCheckOut &&
    !!dateState.checkIn &&
    !isBefore(date, dateState.checkIn),
});

const getDayClassNames = (classifiers: DayClassifiers): string => {
  const baseClasses = cn(
    SIZES.CALENDAR_DAY,
    'flex items-center justify-center text-sm font-medium cursor-pointer transition-colors',
    COMMON_CLASSES.ROUNDED_FULL
  );

  if (classifiers.isDisabled) {
    return cn(baseClasses, 'text-gray-300 cursor-not-allowed hover:bg-transparent');
  }

  if (classifiers.isRangeStart || classifiers.isRangeEnd) {
    return cn(baseClasses, 'bg-primary text-white hover:bg-primary/90');
  }

  if (classifiers.isInRange) {
    return cn(baseClasses, 'bg-primary/10 text-primary hover:bg-primary/20');
  }

  if (classifiers.isCurrentDay) {
    return cn(baseClasses, 'border-2 border-primary text-primary hover:bg-primary/10');
  }

  if (classifiers.isDifferentMonth) {
    return cn(baseClasses, 'text-gray-300 hover:bg-gray-50');
  }

  if (classifiers.isPotentialCheckOut) {
    return cn(baseClasses, 'text-gray-700 hover:bg-primary/10 hover:text-primary');
  }

  return cn(baseClasses, 'text-gray-700 hover:bg-gray-50');
};

const createMonthNavigator = (currentMonth: Date, onMonthChange: (date: Date) => void) => ({
  navigatePrevious: () => onMonthChange(subMonths(currentMonth, 1)),
  navigateNext: () => onMonthChange(addMonths(currentMonth, 1)),
});

const shouldShowPreviousButton = (showNavigation: boolean, monthOffset: number): boolean =>
  showNavigation && monthOffset === 0;

const shouldShowNextButton = (showNavigation: boolean, monthOffset: number): boolean =>
  showNavigation && (monthOffset === 0 || monthOffset === 1);

interface NavigationButtonProps {
  onClick: () => void;
  ariaLabel: string;
  icon: React.ReactNode;
}

const NavigationButton = ({ onClick, ariaLabel, icon }: NavigationButtonProps) => (
  <button
    type='button'
    onClick={onClick}
    className='p-2 hover:bg-gray-100 rounded-full'
    aria-label={ariaLabel}
  >
    {icon}
  </button>
);

interface MonthHeaderProps {
  month: Date;
  monthOffset: number;
  showNavigation: boolean;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
}

const MonthHeader = ({
  month,
  monthOffset,
  showNavigation,
  onNavigatePrevious,
  onNavigateNext,
}: MonthHeaderProps) => (
  <div className='flex items-center justify-between mb-4'>
    {shouldShowPreviousButton(showNavigation, monthOffset) && (
      <NavigationButton
        onClick={onNavigatePrevious}
        ariaLabel='Previous month'
        icon={<ChevronLeft className='w-4 h-4' />}
      />
    )}
    <h3 className='font-semibold text-gray-900 flex-1 text-center' id={`month-${monthOffset}`}>
      {format(month, DATE_FORMATS.MONTH_YEAR)}
    </h3>
    {shouldShowNextButton(showNavigation, monthOffset) && (
      <NavigationButton
        onClick={onNavigateNext}
        ariaLabel='Next month'
        icon={<ChevronRight className='w-4 h-4' />}
      />
    )}
  </div>
);

const WeekdayHeaders = () => (
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
);

interface DayButtonProps {
  day: Date;
  month: Date;
  dateState: DateState;
  onDateClick: (date: Date) => void;
}

const DayButton = ({ day, month, dateState, onDateClick }: DayButtonProps) => {
  const classifiers = classifyDate(day, month, dateState);
  const dayClasses = getDayClassNames(classifiers);

  const handleClick = () => {
    if (!classifiers.isDisabled) {
      onDateClick(day);
    }
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className={dayClasses}
      disabled={classifiers.isDisabled}
      aria-label={format(day, 'EEEE, MMMM do, yyyy')}
      aria-selected={classifiers.isRangeStart || classifiers.isRangeEnd}
      role='gridcell'
      tabIndex={classifiers.isCurrentDay ? 0 : -1}
    >
      {format(day, DATE_FORMATS.DAY)}
    </button>
  );
};

interface CalendarGridProps {
  days: Date[];
  month: Date;
  dateState: DateState;
  onDateClick: (date: Date) => void;
}

const CalendarGrid = ({ days, month, dateState, onDateClick }: CalendarGridProps) => (
  <div className='grid grid-cols-7 gap-1'>
    {days.map((day, index) => (
      <DayButton
        key={index}
        day={day}
        month={month}
        dateState={dateState}
        onDateClick={onDateClick}
      />
    ))}
  </div>
);

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
  const calendarDays = useMemo(() => getCalendarDays(month), [month]);
  const navigator = useMemo(() => createMonthNavigator(currentMonth, onMonthChange), [currentMonth, onMonthChange]);

  const dateState: DateState = { checkIn, checkOut, selectingCheckOut };

  return (
    <div
      className={cn('p-4', className)}
      role='grid'
      aria-label={ariaLabel || `Calendar for ${format(month, DATE_FORMATS.MONTH_YEAR)}`}
    >
      <MonthHeader
        month={month}
        monthOffset={monthOffset}
        showNavigation={showNavigation}
        onNavigatePrevious={navigator.navigatePrevious}
        onNavigateNext={navigator.navigateNext}
      />
      <WeekdayHeaders />
      <CalendarGrid
        days={calendarDays}
        month={month}
        dateState={dateState}
        onDateClick={onDateClick}
      />
    </div>
  );
}

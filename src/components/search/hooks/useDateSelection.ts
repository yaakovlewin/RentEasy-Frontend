import { useCallback, useEffect, useState } from 'react';

import { isAfter } from 'date-fns';

interface UseDateSelectionProps {
  initialCheckIn?: Date | null;
  initialCheckOut?: Date | null;
  onDateSelect?: (checkIn: Date | null, checkOut: Date | null) => void;
  autoProgressToCheckOut?: boolean;
}

interface UseDateSelectionReturn {
  checkIn: Date | null;
  checkOut: Date | null;
  selectingCheckOut: boolean;
  handleDateClick: (date: Date) => void;
  clearDates: () => void;
  setSelectingCheckOut: (value: boolean) => void;
}

export function useDateSelection({
  initialCheckIn = null,
  initialCheckOut = null,
  onDateSelect,
  autoProgressToCheckOut = true,
}: UseDateSelectionProps = {}): UseDateSelectionReturn {
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  // Sync with external props
  useEffect(() => {
    setCheckIn(initialCheckIn);
    setCheckOut(initialCheckOut);
  }, [initialCheckIn, initialCheckOut]);

  // Auto-progress to check-out selection
  useEffect(() => {
    if (autoProgressToCheckOut && checkIn && !checkOut && !selectingCheckOut) {
      setSelectingCheckOut(true);
    }
  }, [checkIn, checkOut, selectingCheckOut, autoProgressToCheckOut]);

  const handleDateClick = useCallback(
    (date: Date) => {
      if (!checkIn || (checkIn && checkOut)) {
        // Starting fresh - set check-in
        setCheckIn(date);
        setCheckOut(null);
        setSelectingCheckOut(true);
        onDateSelect?.(date, null);
      } else if (selectingCheckOut) {
        // Selecting check-out
        if (isAfter(date, checkIn)) {
          setCheckOut(date);
          setSelectingCheckOut(false);
          onDateSelect?.(checkIn, date);
        } else {
          // If selected date is before check-in, reset to this date as check-in
          setCheckIn(date);
          setCheckOut(null);
          setSelectingCheckOut(true);
          onDateSelect?.(date, null);
        }
      }
    },
    [checkIn, checkOut, selectingCheckOut, onDateSelect]
  );

  const clearDates = useCallback(() => {
    setCheckIn(null);
    setCheckOut(null);
    setSelectingCheckOut(false);
    onDateSelect?.(null, null);
  }, [onDateSelect]);

  return {
    checkIn,
    checkOut,
    selectingCheckOut,
    handleDateClick,
    clearDates,
    setSelectingCheckOut,
  };
}

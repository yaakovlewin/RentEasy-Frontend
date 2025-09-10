import { useCallback } from 'react';

import type { SearchData } from '@/contexts/SearchContext';

import { GUEST_LIMITS } from '../constants';

type GuestType = keyof SearchData['guests'];

interface UseGuestCounterProps {
  guests: SearchData['guests'];
  onChange: (guests: SearchData['guests']) => void;
}

interface UseGuestCounterReturn {
  increment: (type: GuestType) => void;
  decrement: (type: GuestType) => void;
  canIncrement: (type: GuestType) => boolean;
  canDecrement: (type: GuestType) => boolean;
  getTotalGuests: () => number;
  isAtMaxCapacity: () => boolean;
  reset: () => void;
}

export function useGuestCounter({ guests, onChange }: UseGuestCounterProps): UseGuestCounterReturn {
  const getTotalGuests = useCallback(() => {
    return guests.adults + guests.children;
  }, [guests]);

  const isAtMaxCapacity = useCallback(() => {
    return getTotalGuests() >= GUEST_LIMITS.MAX_TOTAL_GUESTS;
  }, [getTotalGuests]);

  const canIncrement = useCallback(
    (type: GuestType) => {
      if (type === 'infants') {
        return true; // Infants don't count toward max capacity
      }
      return !isAtMaxCapacity();
    },
    [isAtMaxCapacity]
  );

  const canDecrement = useCallback(
    (type: GuestType) => {
      const minValues: Record<GuestType, number> = {
        adults: GUEST_LIMITS.MIN_ADULTS,
        children: GUEST_LIMITS.MIN_CHILDREN,
        infants: GUEST_LIMITS.MIN_INFANTS,
      };
      return guests[type] > minValues[type];
    },
    [guests]
  );

  const increment = useCallback(
    (type: GuestType) => {
      if (!canIncrement(type)) return;

      onChange({
        ...guests,
        [type]: guests[type] + 1,
      });
    },
    [guests, onChange, canIncrement]
  );

  const decrement = useCallback(
    (type: GuestType) => {
      if (!canDecrement(type)) return;

      onChange({
        ...guests,
        [type]: guests[type] - 1,
      });
    },
    [guests, onChange, canDecrement]
  );

  const reset = useCallback(() => {
    onChange({
      adults: GUEST_LIMITS.MIN_ADULTS,
      children: GUEST_LIMITS.MIN_CHILDREN,
      infants: GUEST_LIMITS.MIN_INFANTS,
    });
  }, [onChange]);

  return {
    increment,
    decrement,
    canIncrement,
    canDecrement,
    getTotalGuests,
    isAtMaxCapacity,
    reset,
  };
}

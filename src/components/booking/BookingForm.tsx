/**
 * BookingForm Component - Built with Either-Based Validation
 *
 * Demonstrates:
 * - Date validation (future dates, date ranges)
 * - Number validation (positive numbers, ranges)
 * - Conditional validation
 * - Complex form state management
 * - Real-time price calculation
 */

'use client';

import { useMemo } from 'react';
import { Calendar, Users, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import FormError from '@/components/forms/FormError';
import { useForm } from '@/hooks/useForm';
import {
  required,
  isFutureDate,
  isAfterDate,
  isPositive,
  inRange,
  composeValidators,
  type Validator,
} from '@/lib/utils/functional/validation';
import { formatCurrency } from '@/lib/utils';

interface BookingFormValues {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  specialRequests: string;
}

interface BookingFormProps {
  propertyId: number;
  pricePerNight: number;
  maxGuests: number;
  onSubmit: (values: BookingFormValues) => Promise<void>;
}

const validateAdults: Validator<number> = composeValidators(
  isPositive('Adults'),
  inRange(1, 20, 'Adults')
);

const validateChildren: Validator<number> = inRange(0, 10, 'Children');
const validateInfants: Validator<number> = inRange(0, 5, 'Infants');

export function BookingForm({ propertyId, pricePerNight, maxGuests, onSubmit }: BookingFormProps) {
  const form = useForm<BookingFormValues>({
    initialValues: {
      checkIn: '',
      checkOut: '',
      adults: 1,
      children: 0,
      infants: 0,
      specialRequests: '',
    },
    validators: {
      checkIn: (value: string) => {
        if (!value) return { _tag: 'Left' as const, left: ['Check-in date is required'] };
        const date = new Date(value);
        return isFutureDate('Check-in date')(date);
      },
      checkOut: (value: string) => {
        if (!value) return { _tag: 'Left' as const, left: ['Check-out date is required'] };
        if (!form.values.checkIn) return { _tag: 'Right' as const, right: value };
        const checkIn = new Date(form.values.checkIn);
        const checkOut = new Date(value);
        return isAfterDate(checkIn, 'Check-in', 'Check-out')(checkOut);
      },
      adults: validateAdults,
      children: validateChildren,
      infants: validateInfants,
    },
    onSubmit,
    validateOnBlur: true,
  });

  const { nights, totalGuests, subtotal, serviceFee, total } = useMemo(() => {
    const checkIn = form.values.checkIn ? new Date(form.values.checkIn) : null;
    const checkOut = form.values.checkOut ? new Date(form.values.checkOut) : null;

    const nights =
      checkIn && checkOut && checkOut > checkIn
        ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const totalGuests = form.values.adults + form.values.children;
    const subtotal = nights * pricePerNight;
    const serviceFee = subtotal * 0.15;
    const total = subtotal + serviceFee;

    return { nights, totalGuests, subtotal, serviceFee, total };
  }, [form.values.checkIn, form.values.checkOut, form.values.adults, form.values.children, pricePerNight]);

  const guestsError = useMemo(() => {
    if (totalGuests > maxGuests) {
      return `Maximum ${maxGuests} guests allowed`;
    }
    return null;
  }, [totalGuests, maxGuests]);

  const isFormValid = form.isValid && !guestsError && nights > 0;

  return (
    <Card className='shadow-lg'>
      <CardHeader>
        <CardTitle className='text-2xl flex items-center gap-2'>
          <CreditCard className='h-6 w-6' />
          Book Your Stay
        </CardTitle>
        <p className='text-sm text-gray-600'>
          {formatCurrency(pricePerNight)} per night
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label htmlFor='checkIn' className='block text-sm font-medium text-gray-700 mb-2'>
                <Calendar className='inline h-4 w-4 mr-1' />
                Check-in
              </label>
              <Input
                id='checkIn'
                type='date'
                {...form.register('checkIn')}
                min={new Date().toISOString().split('T')[0]}
                aria-invalid={form.hasError('checkIn')}
              />
              {form.hasError('checkIn') && (
                <FormError message={form.getFieldError('checkIn') || ''} variant='inline' />
              )}
            </div>

            <div>
              <label htmlFor='checkOut' className='block text-sm font-medium text-gray-700 mb-2'>
                <Calendar className='inline h-4 w-4 mr-1' />
                Check-out
              </label>
              <Input
                id='checkOut'
                type='date'
                {...form.register('checkOut')}
                min={form.values.checkIn || new Date().toISOString().split('T')[0]}
                aria-invalid={form.hasError('checkOut')}
              />
              {form.hasError('checkOut') && (
                <FormError message={form.getFieldError('checkOut') || ''} variant='inline' />
              )}
            </div>
          </div>

          {nights > 0 && (
            <div className='text-sm text-gray-600 bg-blue-50 p-3 rounded-md'>
              {nights} night{nights !== 1 ? 's' : ''} selected
            </div>
          )}

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>
              <Users className='inline h-4 w-4 mr-1' />
              Guests
            </label>

            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-medium'>Adults</div>
                  <div className='text-sm text-gray-500'>Age 13+</div>
                </div>
                <div className='flex items-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => form.setFieldValue('adults', Math.max(1, form.values.adults - 1))}
                    disabled={form.values.adults <= 1}
                  >
                    -
                  </Button>
                  <span className='w-8 text-center font-medium'>{form.values.adults}</span>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => form.setFieldValue('adults', form.values.adults + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-medium'>Children</div>
                  <div className='text-sm text-gray-500'>Age 2-12</div>
                </div>
                <div className='flex items-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => form.setFieldValue('children', Math.max(0, form.values.children - 1))}
                    disabled={form.values.children <= 0}
                  >
                    -
                  </Button>
                  <span className='w-8 text-center font-medium'>{form.values.children}</span>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => form.setFieldValue('children', form.values.children + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-medium'>Infants</div>
                  <div className='text-sm text-gray-500'>Under 2</div>
                </div>
                <div className='flex items-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => form.setFieldValue('infants', Math.max(0, form.values.infants - 1))}
                    disabled={form.values.infants <= 0}
                  >
                    -
                  </Button>
                  <span className='w-8 text-center font-medium'>{form.values.infants}</span>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => form.setFieldValue('infants', form.values.infants + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {guestsError && <FormError message={guestsError} variant='inline' />}
          </div>

          <div>
            <label htmlFor='specialRequests' className='block text-sm font-medium text-gray-700 mb-2'>
              Special requests (optional)
            </label>
            <textarea
              id='specialRequests'
              {...form.register('specialRequests')}
              className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent'
              rows={3}
              placeholder='Any special requests or requirements?'
            />
          </div>

          {nights > 0 && (
            <div className='border-t pt-4 space-y-2'>
              <div className='flex justify-between text-sm'>
                <span>
                  {formatCurrency(pricePerNight)} x {nights} night{nights !== 1 ? 's' : ''}
                </span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Service fee (15%)</span>
                <span>{formatCurrency(serviceFee)}</span>
              </div>
              <div className='flex justify-between font-bold text-lg border-t pt-2'>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          <Button
            type='submit'
            className='w-full'
            size='lg'
            disabled={form.isSubmitting || !isFormValid}
          >
            {form.isSubmitting ? (
              <>
                <LoadingSpinner size='sm' className='mr-2' />
                Processing...
              </>
            ) : (
              'Reserve'
            )}
          </Button>

          <p className='text-xs text-gray-500 text-center'>
            You won&apos;t be charged yet
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

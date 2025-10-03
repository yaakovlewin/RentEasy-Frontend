'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Filter,
  Mail,
  MapPin,
  MessageSquare,
  Search,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';

import { Booking, bookingsAPI } from '@/lib/api';
import { formatCurrency, formatDate, formatDateRange, cn } from '@/lib/utils';

import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingSkeleton } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/input';

import { useAsyncOperation } from '@/hooks/useAsyncOperation';

interface ExtendedBooking extends Booking {
  property?: {
    id: string;
    title: string;
    location: string;
    images?: string[];
  };
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface BookingStats {
  pending: number;
  confirmed: number;
  revenue: number;
  thisMonth: number;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress';
type TimeFilter = 'all' | 'upcoming' | 'current' | 'past';

export default function HostBookingsClient() {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<ExtendedBooking[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    pending: 0,
    confirmed: 0,
    revenue: 0,
    thisMonth: 0,
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    loading: isLoadingBookings,
    error: bookingsError,
    execute: executeBookingsLoad,
  } = useAsyncOperation<ExtendedBooking[]>();

  const {
    loading: isUpdatingBooking,
    error: updateError,
    execute: executeBookingUpdate,
  } = useAsyncOperation<Booking>();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, timeFilter, searchQuery]);

  const loadBookings = async () => {
    const result = await executeBookingsLoad(async () => {
      const response = await bookingsAPI.getMyBookings();
      return response.data as ExtendedBooking[];
    });

    if (result) {
      setBookings(result);
      calculateStats(result);
    }
  };

  const calculateStats = (bookingsList: ExtendedBooking[]) => {
    const pending = bookingsList.filter(b => b.status === 'pending').length;
    const confirmed = bookingsList.filter(b => b.status === 'confirmed').length;
    const revenue = bookingsList
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = bookingsList.filter(
      b =>
        new Date(b.createdAt) >= firstDayOfMonth &&
        (b.status === 'confirmed' || b.status === 'completed')
    ).length;

    setStats({ pending, confirmed, revenue, thisMonth });
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(b => {
        const checkIn = new Date(b.checkInDate);
        const checkOut = new Date(b.checkOutDate);

        if (timeFilter === 'upcoming') {
          return checkIn > now;
        } else if (timeFilter === 'current') {
          return checkIn <= now && checkOut >= now;
        } else if (timeFilter === 'past') {
          return checkOut < now;
        }
        return true;
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.property?.title.toLowerCase().includes(query) ||
          b.property?.location.toLowerCase().includes(query) ||
          b.guest?.firstName.toLowerCase().includes(query) ||
          b.guest?.lastName.toLowerCase().includes(query) ||
          b.guest?.email.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleAcceptBooking = async (bookingId: string) => {
    const result = await executeBookingUpdate(async () => {
      return await bookingsAPI.confirmBooking(bookingId);
    });

    if (result) {
      await loadBookings();
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    const result = await executeBookingUpdate(async () => {
      return await bookingsAPI.cancelBooking(bookingId, {
        reason: 'Declined by host',
      });
    });

    if (result) {
      await loadBookings();
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
    };

    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
      in_progress: 'In Progress',
    };

    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', badges[status])}>
        {labels[status]}
      </span>
    );
  };

  const isUpcoming = (booking: ExtendedBooking) => {
    return new Date(booking.checkInDate) > new Date();
  };

  return (
    <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-white border-b'>
          <div className='container mx-auto px-4 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Bookings</h1>
                <p className='text-gray-600 mt-1'>Manage your property bookings</p>
              </div>
            </div>
          </div>
        </div>

        <div className='container mx-auto px-4 py-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Pending</p>
                    <p className='text-3xl font-bold text-gray-900'>{stats.pending}</p>
                  </div>
                  <Clock className='w-8 h-8 text-yellow-500' />
                </div>
                <div className='mt-2'>
                  <span className='text-sm text-gray-500'>Awaiting response</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Confirmed</p>
                    <p className='text-3xl font-bold text-gray-900'>{stats.confirmed}</p>
                  </div>
                  <CheckCircle className='w-8 h-8 text-green-500' />
                </div>
                <div className='mt-2'>
                  <span className='text-sm text-gray-500'>Active bookings</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
                    <p className='text-3xl font-bold text-gray-900'>{formatCurrency(stats.revenue)}</p>
                  </div>
                  <DollarSign className='w-8 h-8 text-green-500' />
                </div>
                <div className='mt-2'>
                  <span className='text-sm text-gray-500'>All confirmed bookings</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>This Month</p>
                    <p className='text-3xl font-bold text-gray-900'>{stats.thisMonth}</p>
                  </div>
                  <TrendingUp className='w-8 h-8 text-blue-500' />
                </div>
                <div className='mt-2'>
                  <span className='text-sm text-gray-500'>New bookings</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4 mb-6'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                  <Input
                    type='text'
                    placeholder='Search by property, location, or guest...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>

                <div className='flex flex-wrap gap-3'>
                  <div className='flex items-center space-x-2'>
                    <Filter className='w-4 h-4 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700'>Status:</span>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                      className='px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    >
                      <option value='all'>All</option>
                      <option value='pending'>Pending</option>
                      <option value='confirmed'>Confirmed</option>
                      <option value='in_progress'>In Progress</option>
                      <option value='completed'>Completed</option>
                      <option value='cancelled'>Cancelled</option>
                    </select>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <span className='text-sm font-medium text-gray-700'>Time:</span>
                    <select
                      value={timeFilter}
                      onChange={e => setTimeFilter(e.target.value as TimeFilter)}
                      className='px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                    >
                      <option value='all'>All</option>
                      <option value='upcoming'>Upcoming</option>
                      <option value='current'>Current</option>
                      <option value='past'>Past</option>
                    </select>
                  </div>
                </div>
              </div>

              {isLoadingBookings && (
                <div className='space-y-4'>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className='border border-gray-200 rounded-lg p-6'>
                      <div className='flex items-start space-x-4'>
                        <LoadingSkeleton variant='rectangular' width='w-24' height='h-24' />
                        <div className='flex-1 space-y-3'>
                          <LoadingSkeleton height='h-6' width='w-2/3' />
                          <LoadingSkeleton height='h-4' width='w-1/2' />
                          <LoadingSkeleton height='h-4' width='w-1/3' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {bookingsError && (
                <ErrorDisplay error={new Error(bookingsError)} onRetry={loadBookings} />
              )}

              {updateError && (
                <div className='mb-4'>
                  <ErrorDisplay error={new Error(updateError)} variant='banner' />
                </div>
              )}

              {!isLoadingBookings && filteredBookings.length === 0 && (
                <div className='text-center py-12'>
                  <Calendar className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>No bookings found</h3>
                  <p className='text-gray-600'>
                    {searchQuery || statusFilter !== 'all' || timeFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Your property bookings will appear here'}
                  </p>
                </div>
              )}

              {!isLoadingBookings && filteredBookings.length > 0 && (
                <div className='space-y-4'>
                  {filteredBookings.map(booking => (
                    <div
                      key={booking.id}
                      className='border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-start space-x-4'>
                        <div className='w-24 h-24 relative flex-shrink-0'>
                          <Image
                            src={
                              booking.property?.images?.[0] ||
                              'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&h=200&fit=crop'
                            }
                            alt={booking.property?.title || 'Property'}
                            fill
                            className='rounded-lg object-cover'
                            sizes='96px'
                          />
                        </div>

                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between mb-3'>
                            <div>
                              <h3 className='text-lg font-semibold text-gray-900'>
                                {booking.property?.title || 'Property'}
                              </h3>
                              <div className='flex items-center space-x-4 text-sm text-gray-600 mt-1'>
                                <span className='flex items-center'>
                                  <MapPin className='w-3 h-3 mr-1' />
                                  {booking.property?.location || 'Location'}
                                </span>
                                <span className='flex items-center'>
                                  <User className='w-3 h-3 mr-1' />
                                  {booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                            <div>
                              <p className='text-xs text-gray-500 mb-1'>Guest</p>
                              <p className='text-sm font-medium text-gray-900'>
                                {booking.guest?.firstName} {booking.guest?.lastName}
                              </p>
                              <p className='text-xs text-gray-600'>{booking.guest?.email}</p>
                            </div>

                            <div>
                              <p className='text-xs text-gray-500 mb-1'>Check-in - Check-out</p>
                              <p className='text-sm font-medium text-gray-900'>
                                {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                              </p>
                              <p className='text-xs text-gray-600'>
                                Booked on {formatDate(booking.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
                            <div>
                              <p className='text-sm text-gray-600'>Total Amount</p>
                              <p className='text-xl font-bold text-gray-900'>
                                {formatCurrency(booking.totalPrice)}
                              </p>
                            </div>

                            <div className='flex items-center space-x-2'>
                              {booking.status === 'pending' && (
                                <>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => handleDeclineBooking(booking.id)}
                                    disabled={isUpdatingBooking}
                                  >
                                    <XCircle className='w-4 h-4 mr-1' />
                                    Decline
                                  </Button>
                                  <Button
                                    size='sm'
                                    onClick={() => handleAcceptBooking(booking.id)}
                                    disabled={isUpdatingBooking}
                                  >
                                    <CheckCircle className='w-4 h-4 mr-1' />
                                    Accept
                                  </Button>
                                </>
                              )}

                              <Link href={`/host/bookings/${booking.id}`}>
                                <Button variant='outline' size='sm'>
                                  <Eye className='w-4 h-4 mr-1' />
                                  Details
                                </Button>
                              </Link>

                              {isUpcoming(booking) && booking.status === 'confirmed' && (
                                <Link href={`/messages?guest=${booking.guestId}`}>
                                  <Button variant='outline' size='sm'>
                                    <MessageSquare className='w-4 h-4 mr-1' />
                                    Message
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}

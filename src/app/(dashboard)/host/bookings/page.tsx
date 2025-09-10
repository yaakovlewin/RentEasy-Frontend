/**
 * @fileoverview Enterprise Host Bookings Page with SEO Optimization
 * 
 * SERVER COMPONENT with Dynamic Metadata Generation
 * 
 * SEO-optimized host bookings management page with comprehensive metadata.
 */

import type { Metadata } from 'next';
import HostBookingsClient from './HostBookingsClient';
import { generateDashboardMetadata } from '@/lib/metadata';

/**
 * Generate dynamic metadata for host bookings page
 * Critical for SEO optimization and user experience
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const metadata = await generateDashboardMetadata('host');
    return {
      ...metadata,
      title: 'Manage Bookings - Host Dashboard | RentEasy',
      description: 'Manage your property bookings, view reservations, and communicate with guests on your RentEasy host bookings page.',
    };
  } catch (error) {
    console.error('Error generating host bookings metadata:', error);
    
    return {
      title: 'Manage Bookings - Host Dashboard | RentEasy',
      description: 'Manage your property bookings, view reservations, and communicate with guests on your RentEasy host bookings page.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

/**
 * HostBookingsPage - Enterprise Server Component with SEO Optimization
 */
export default async function HostBookingsPage() {
  return <HostBookingsClient />;
}

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  DollarSign,
  Download,
  Eye,
  Filter,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Users,
  X,
  XCircle,
} from 'lucide-react';

import { Booking, bookingsAPI, Property } from '@/lib/api';
import { calculateNights, cn, DATE_FORMATS, formatCurrency, formatDate } from '@/lib/utils';

import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useAsyncOperation } from '@/hooks/useAsyncOperation';

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
type TimeFilter = 'all' | 'upcoming' | 'current' | 'past';

interface ExtendedBooking extends Booking {
  guest: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    profileImage?: string;
  };
  property: Property;
}

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<ExtendedBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<ExtendedBooking | null>(null);

  const {
    loading: isLoading,
    error,
    execute: executeLoad,
  } = useAsyncOperation<ExtendedBooking[]>();

  const { loading: isUpdating, execute: executeUpdate } = useAsyncOperation();

  // Load bookings
  useEffect(() => {
    const loadBookings = async () => {
      const result = await executeLoad(async () => {
        // Mock data for demonstration - replace with actual API call
        const mockBookings: ExtendedBooking[] = [
          {
            id: '1',
            propertyId: '1',
            guestId: '1',
            checkInDate: '2024-01-15',
            checkOutDate: '2024-01-20',
            numberOfGuests: 4,
            totalPrice: 850,
            status: 'pending',
            createdAt: '2024-01-10T10:00:00Z',
            updatedAt: '2024-01-10T10:00:00Z',
            guest: {
              id: '1',
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: 'sarah.johnson@email.com',
              phoneNumber: '+1 (555) 123-4567',
              profileImage:
                'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=50&h=50&fit=crop&crop=face',
            },
            property: {
              id: '1',
              title: 'Ocean View Villa',
              description: 'Beautiful ocean view villa with modern amenities',
              location: 'Miami Beach, FL',
              pricePerNight: 170,
              maxGuests: 6,
              bedrooms: 3,
              bathrooms: 2,
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              images: [
                'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=100&h=80&fit=crop',
              ],
            },
          },
          {
            id: '2',
            propertyId: '2',
            guestId: '2',
            checkInDate: '2024-01-25',
            checkOutDate: '2024-01-30',
            numberOfGuests: 2,
            totalPrice: 650,
            status: 'confirmed',
            createdAt: '2024-01-12T14:30:00Z',
            updatedAt: '2024-01-12T14:30:00Z',
            guest: {
              id: '2',
              firstName: 'Michael',
              lastName: 'Chen',
              email: 'michael.chen@email.com',
              phoneNumber: '+1 (555) 987-6543',
              profileImage:
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
            },
            property: {
              id: '2',
              title: 'Mountain Retreat Cabin',
              description: 'Cozy mountain retreat cabin perfect for a getaway',
              location: 'Aspen, CO',
              pricePerNight: 130,
              maxGuests: 4,
              bedrooms: 2,
              bathrooms: 1,
              isActive: true,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
              images: [
                'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=100&h=80&fit=crop',
              ],
            },
          },
        ];
        return mockBookings;
      });

      if (result) {
        setBookings(result);
        setFilteredBookings(result);
      }
    };

    loadBookings();
  }, [executeLoad]);

  // Filter bookings
  useEffect(() => {
    let filtered = bookings;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        booking =>
          booking.guest.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.guest.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.property.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const today = new Date();
      filtered = filtered.filter(booking => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);

        switch (timeFilter) {
          case 'upcoming':
            return checkIn > today;
          case 'current':
            return checkIn <= today && checkOut >= today;
          case 'past':
            return checkOut < today;
          default:
            return true;
        }
      });
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, timeFilter]);

  const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'cancelled') => {
    const result = await executeUpdate(async () => {
      if (newStatus === 'cancelled') {
        await bookingsAPI.cancel(bookingId);
      } else {
        // Would need a confirm booking API endpoint
        console.log('Confirming booking:', bookingId);
      }
    });

    if (result !== null) {
      setBookings(prev =>
        prev.map(booking =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className='w-4 h-4 text-yellow-500' />;
      case 'confirmed':
        return <CheckCircle className='w-4 h-4 text-green-500' />;
      case 'cancelled':
        return <XCircle className='w-4 h-4 text-red-500' />;
      case 'completed':
        return <CheckCircle className='w-4 h-4 text-blue-500' />;
      default:
        return <AlertCircle className='w-4 h-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-white border-b'>
          <div className='container mx-auto px-4 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Booking Requests</h1>
                <p className='text-gray-600 mt-1'>Manage guest bookings and reservations</p>
              </div>
              <Button variant='outline'>
                <Download className='w-4 h-4 mr-2' />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className='container mx-auto px-4 py-8'>
          {/* Quick Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Pending Requests</p>
                    <p className='text-2xl font-bold text-yellow-600'>
                      {bookings.filter(b => b.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className='w-8 h-8 text-yellow-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Confirmed</p>
                    <p className='text-2xl font-bold text-green-600'>
                      {bookings.filter(b => b.status === 'confirmed').length}
                    </p>
                  </div>
                  <CheckCircle className='w-8 h-8 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {formatCurrency(bookings.reduce((sum, b) => sum + b.totalPrice, 0))}
                    </p>
                  </div>
                  <DollarSign className='w-8 h-8 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>This Month</p>
                    <p className='text-2xl font-bold text-gray-900'>
                      {
                        bookings.filter(b => {
                          const checkIn = new Date(b.checkInDate);
                          const now = new Date();
                          return (
                            checkIn.getMonth() === now.getMonth() &&
                            checkIn.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                    </p>
                  </div>
                  <Calendar className='w-8 h-8 text-blue-500' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0'>
            <div className='flex items-center space-x-4'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Search bookings...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10 w-64'
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as BookingStatus)}
                className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              >
                <option value='all'>All Status</option>
                <option value='pending'>Pending</option>
                <option value='confirmed'>Confirmed</option>
                <option value='cancelled'>Cancelled</option>
                <option value='completed'>Completed</option>
              </select>

              <select
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value as TimeFilter)}
                className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
              >
                <option value='all'>All Time</option>
                <option value='upcoming'>Upcoming</option>
                <option value='current'>Current</option>
                <option value='past'>Past</option>
              </select>
            </div>
          </div>

          {/* Bookings List */}
          {isLoading && (
            <div className='space-y-4'>
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className='p-6'>
                    <div className='animate-pulse'>
                      <div className='flex space-x-4'>
                        <div className='w-12 h-12 bg-gray-200 rounded-full' />
                        <div className='flex-1 space-y-2'>
                          <div className='h-4 bg-gray-200 rounded w-1/4' />
                          <div className='h-3 bg-gray-200 rounded w-1/2' />
                        </div>
                        <div className='w-32 h-8 bg-gray-200 rounded' />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && <ErrorDisplay error={new Error(error)} />}

          {!isLoading && filteredBookings.length === 0 && !error && (
            <Card>
              <CardContent className='p-12 text-center'>
                <Calendar className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  {searchTerm || statusFilter !== 'all' || timeFilter !== 'all'
                    ? 'No bookings match your filters'
                    : 'No bookings yet'}
                </h3>
                <p className='text-gray-600'>
                  {searchTerm || statusFilter !== 'all' || timeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Booking requests will appear here once guests start booking your properties'}
                </p>
              </CardContent>
            </Card>
          )}

          {!isLoading && filteredBookings.length > 0 && (
            <div className='space-y-4'>
              {filteredBookings.map(booking => (
                <Card key={booking.id} className='overflow-hidden'>
                  <CardContent className='p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex space-x-4 flex-1'>
                        <div className='w-12 h-12 relative'>
                          <Image
                            src={
                              booking.guest.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.guest.firstName + ' ' + booking.guest.lastName)}&size=48&background=ff385c&color=ffffff`
                            }
                            alt={`${booking.guest.firstName} ${booking.guest.lastName}`}
                            fill
                            className='rounded-full object-cover'
                            sizes='48px'
                          />
                        </div>

                        <div className='flex-1'>
                          <div className='flex items-start justify-between mb-3'>
                            <div>
                              <h3 className='text-lg font-semibold text-gray-900'>
                                {booking.guest.firstName} {booking.guest.lastName}
                              </h3>
                              <p className='text-gray-600 text-sm'>{booking.guest.email}</p>
                            </div>

                            <div className='flex items-center space-x-2'>
                              <span
                                className={cn(
                                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                  getStatusColor(booking.status)
                                )}
                              >
                                {getStatusIcon(booking.status)}
                                <span className='ml-1 capitalize'>{booking.status}</span>
                              </span>
                            </div>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                            <div className='space-y-1'>
                              <p className='text-sm font-medium text-gray-700'>Property</p>
                              <div className='flex items-center space-x-2'>
                                <div className='w-8 h-6 relative'>
                                  <Image
                                    src={
                                      booking.property.images?.[0] ||
                                      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=40&h=30&fit=crop'
                                    }
                                    alt={booking.property.title}
                                    fill
                                    className='rounded object-cover'
                                    sizes='32px'
                                  />
                                </div>
                                <div>
                                  <p className='text-sm text-gray-900'>{booking.property.title}</p>
                                  <p className='text-xs text-gray-500'>
                                    {booking.property.location}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className='space-y-1'>
                              <p className='text-sm font-medium text-gray-700'>Dates</p>
                              <div className='flex items-center space-x-1 text-sm text-gray-900'>
                                <Calendar className='w-4 h-4' />
                                <span>
                                  {formatDate(booking.checkInDate, DATE_FORMATS.SHORT)} -{' '}
                                  {formatDate(booking.checkOutDate, DATE_FORMATS.SHORT)}
                                </span>
                              </div>
                              <p className='text-xs text-gray-500'>
                                {calculateNights(booking.checkInDate, booking.checkOutDate)} nights
                              </p>
                            </div>

                            <div className='space-y-1'>
                              <p className='text-sm font-medium text-gray-700'>Guests & Total</p>
                              <div className='flex items-center space-x-1 text-sm text-gray-900'>
                                <Users className='w-4 h-4' />
                                <span>{booking.numberOfGuests} guests</span>
                              </div>
                              <p className='font-semibold text-gray-900'>
                                {formatCurrency(booking.totalPrice)}
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
                            <div className='flex items-center space-x-3'>
                              <Button variant='outline' size='sm'>
                                <MessageSquare className='w-4 h-4 mr-2' />
                                Message
                              </Button>
                              {booking.guest.phoneNumber && (
                                <Button variant='outline' size='sm'>
                                  <Phone className='w-4 h-4 mr-2' />
                                  Call
                                </Button>
                              )}
                              <Button variant='outline' size='sm'>
                                <Eye className='w-4 h-4 mr-2' />
                                Details
                              </Button>
                            </div>

                            {booking.status === 'pending' && (
                              <div className='flex items-center space-x-2'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                  disabled={isUpdating}
                                  className='text-red-600 border-red-200 hover:bg-red-50'
                                >
                                  <X className='w-4 h-4 mr-1' />
                                  Decline
                                </Button>
                                <Button
                                  size='sm'
                                  onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                  disabled={isUpdating}
                                  className='bg-green-600 hover:bg-green-700'
                                >
                                  {isUpdating ? (
                                    <LoadingSpinner size='sm' className='mr-1' />
                                  ) : (
                                    <Check className='w-4 h-4 mr-1' />
                                  )}
                                  Accept
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleProtectedRoute>
  );
}

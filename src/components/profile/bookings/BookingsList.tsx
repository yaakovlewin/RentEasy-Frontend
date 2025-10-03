'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { bookingsAPI } from '@/lib/api';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatDate, formatDateRange, calculateNights } from '@/lib/utils';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  MessageSquare,
  X,
  Edit,
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';
import type { Booking } from '@/lib/api';

interface BookingsListProps {
  userId: string;
}

type TabValue = 'upcoming' | 'past' | 'cancelled';

const getStatusVariant = (status: Booking['status']): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'confirmed':
    case 'in_progress':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'completed':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: Booking['status']): string => {
  switch (status) {
    case 'in_progress':
      return 'In Progress';
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    default:
      return status;
  }
};

const filterBookingsByTab = (bookings: Booking[], tab: TabValue): Booking[] => {
  const now = new Date();

  switch (tab) {
    case 'upcoming':
      return bookings.filter(booking => {
        const checkInDate = new Date(booking.checkInDate);
        return (booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'in_progress')
          && checkInDate >= now;
      });
    case 'past':
      return bookings.filter(booking => {
        const checkOutDate = new Date(booking.checkOutDate);
        return booking.status === 'completed' || (checkOutDate < now && booking.status !== 'cancelled');
      });
    case 'cancelled':
      return bookings.filter(booking => booking.status === 'cancelled');
    default:
      return bookings;
  }
};

export function BookingsList({ userId }: BookingsListProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { execute, loading, error } = useAsyncOperation<any>();

  useEffect(() => {
    const fetchBookings = async () => {
      const result = await execute(() => bookingsAPI.getMyBookings({}));
      if (result?.data) {
        setBookings(result.data);
      } else if (result && Array.isArray(result)) {
        setBookings(result);
      }
    };

    fetchBookings();
  }, [userId]);

  const handleCancelBooking = async (bookingId: string) => {
    const result = await execute(() => bookingsAPI.cancel(bookingId, { reason: 'Cancelled by guest' }));
    if (result) {
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === bookingId ? { ...booking, status: 'cancelled' as const } : booking
        )
      );
    }
  };

  const filteredBookings = filterBookingsByTab(bookings, activeTab);

  const renderEmptyState = (tab: TabValue) => {
    const messages = {
      upcoming: {
        title: 'No Upcoming Trips',
        description: 'You don\'t have any upcoming bookings. Start exploring properties to plan your next adventure!',
        action: 'Search Properties',
        href: '/search'
      },
      past: {
        title: 'No Past Trips',
        description: 'You haven\'t completed any trips yet. Your past bookings will appear here.',
        action: null,
        href: null
      },
      cancelled: {
        title: 'No Cancelled Bookings',
        description: 'You don\'t have any cancelled bookings.',
        action: null,
        href: null
      }
    };

    const { title, description, action, href } = messages[tab];

    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
            {description}
          </p>
          {action && href && (
            <Button asChild>
              <Link href={href}>{action}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderBookingCard = (booking: Booking) => {
    const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
    const canCancel = booking.status === 'confirmed' || booking.status === 'pending';
    const canModify = booking.status === 'confirmed' || booking.status === 'pending';
    const canReview = booking.status === 'completed';
    const propertyImage = booking.property?.images?.[0] || '/placeholder-property.jpg';
    const propertyTitle = booking.property?.title || 'Property';
    const propertyLocation = booking.property?.location || 'Location unavailable';

    return (
      <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="md:flex">
          <div className="md:w-1/3 relative h-48 md:h-auto">
            <img
              src={propertyImage}
              alt={propertyTitle}
              className="w-full h-full object-cover"
            />
            <Badge
              variant={getStatusVariant(booking.status)}
              className="absolute top-3 right-3"
            >
              {getStatusLabel(booking.status)}
            </Badge>
          </div>

          <div className="md:w-2/3 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{propertyTitle}</h3>
                  <div className="flex items-center text-sm text-muted-foreground gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{propertyLocation}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-3">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {formatDateRange(booking.checkInDate, booking.checkOutDate)}
                    </div>
                    <div className="text-muted-foreground">
                      {nights} {nights === 1 ? 'night' : 'nights'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">Total Price</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 pt-3 border-t">
              {canReview && (
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              )}
              {canModify && (
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Modify
                </Button>
              )}
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Host
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Receipt
              </Button>
              {canCancel && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelBooking(booking.id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
            </CardFooter>
          </div>
        </div>
      </Card>
    );
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div>
            <p className="font-medium text-destructive">Failed to load bookings</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">
            Upcoming ({filterBookingsByTab(bookings, 'upcoming').length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({filterBookingsByTab(bookings, 'past').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({filterBookingsByTab(bookings, 'cancelled').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {filteredBookings.length === 0 ? (
            renderEmptyState('upcoming')
          ) : (
            filteredBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {filteredBookings.length === 0 ? (
            renderEmptyState('past')
          ) : (
            filteredBookings.map(renderBookingCard)
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {filteredBookings.length === 0 ? (
            renderEmptyState('cancelled')
          ) : (
            filteredBookings.map(renderBookingCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

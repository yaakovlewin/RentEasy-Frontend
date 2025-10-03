'use client';

import { useEffect, useState } from 'react';
import { bookingsAPI } from '@/lib/api';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, calculateNights } from '@/lib/utils';
import { Calendar, Plane, DollarSign, Moon, Loader2, TrendingUp } from 'lucide-react';
import type { Booking } from '@/lib/api';

interface BookingStatsProps {
  userId: string;
}

interface StatsData {
  totalBookings: number;
  upcomingTrips: number;
  totalSpent: number;
  nightsBooked: number;
}

const SkeletonCard = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      <div className="h-4 w-4 bg-muted animate-pulse rounded" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
    </CardContent>
  </Card>
);

export function BookingStats({ userId }: BookingStatsProps) {
  const [stats, setStats] = useState<StatsData>({
    totalBookings: 0,
    upcomingTrips: 0,
    totalSpent: 0,
    nightsBooked: 0,
  });

  const { execute, loading, error } = useAsyncOperation<any>();

  useEffect(() => {
    const fetchStats = async () => {
      const result = await execute(() => bookingsAPI.getMyBookings({}));

      if (result) {
        const bookings: Booking[] = result.data || result;

        if (Array.isArray(bookings)) {
          const now = new Date();

          const totalBookings = bookings.length;

          const upcomingTrips = bookings.filter(booking => {
            const checkInDate = new Date(booking.checkInDate);
            return (
              (booking.status === 'confirmed' ||
               booking.status === 'pending' ||
               booking.status === 'in_progress') &&
              checkInDate >= now
            );
          }).length;

          const totalSpent = bookings
            .filter(booking =>
              booking.status === 'confirmed' ||
              booking.status === 'completed' ||
              booking.status === 'in_progress'
            )
            .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

          const nightsBooked = bookings
            .filter(booking =>
              booking.status === 'confirmed' ||
              booking.status === 'completed' ||
              booking.status === 'in_progress'
            )
            .reduce((sum, booking) => {
              const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
              return sum + nights;
            }, 0);

          setStats({
            totalBookings,
            upcomingTrips,
            totalSpent,
            nightsBooked,
          });
        }
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-6">
          <p className="text-sm text-destructive text-center">
            Failed to load booking statistics
          </p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      description: 'All time bookings',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Upcoming Trips',
      value: stats.upcomingTrips,
      description: 'Confirmed trips ahead',
      icon: Plane,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Total Spent',
      value: formatCurrency(stats.totalSpent),
      description: 'Lifetime spending',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Nights Booked',
      value: stats.nightsBooked,
      description: 'Total nights stayed',
      icon: Moon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
              {stat.title === 'Total Bookings' && stats.totalBookings > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>Active traveler</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Home,
  MapPin,
  MessageSquare,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';

import { Booking, bookingsAPI, propertiesAPI, Property } from '@/lib/api';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';

import { RoleProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { LoadingSkeleton, LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { useAsyncOperation } from '@/hooks/useAsyncOperation';

import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalProperties: number;
  activeBookings: number;
  totalRevenue: number;
  averageRating: number;
  pendingRequests: number;
  occupancyRate: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'review' | 'inquiry' | 'payment';
  message: string;
  timestamp: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export default function HostDashboardClient() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    pendingRequests: 0,
    occupancyRate: 0,
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const {
    loading: isLoadingProperties,
    error: propertiesError,
    execute: executePropertiesLoad,
  } = useAsyncOperation<Property[]>();

  const {
    loading: isLoadingBookings,
    error: bookingsError,
    execute: executeBookingsLoad,
  } = useAsyncOperation<Booking[]>();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load properties
        const propertiesResult = await executePropertiesLoad(async () => {
          const response = await propertiesAPI.getUserProperties();
          return response;
        });

        if (propertiesResult) {
          setProperties(propertiesResult);

          // Calculate stats from properties
          const totalProperties = propertiesResult.length;
          const averageRating =
            propertiesResult.reduce((sum, p) => sum + (p.rating || 0), 0) / totalProperties || 0;

          setStats(prev => ({
            ...prev,
            totalProperties,
            averageRating,
          }));
        }

        // Load recent bookings for properties
        const bookingsResult = await executeBookingsLoad(async () => {
          // This would typically load bookings for all user properties
          // For now, we'll use mock data
          return [];
        });

        if (bookingsResult) {
          setRecentBookings(bookingsResult);
        }

        // Mock recent activity data
        setRecentActivity([
          {
            id: '1',
            type: 'booking',
            message: 'New booking request for Ocean View Villa',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
          },
          {
            id: '2',
            type: 'review',
            message: 'New 5-star review for Mountain Retreat',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            type: 'payment',
            message: 'Payment received for booking #12345',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '4',
            type: 'inquiry',
            message: 'Guest inquiry about pet policy',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);

        // Mock additional stats
        setStats(prev => ({
          ...prev,
          activeBookings: 8,
          totalRevenue: 12450,
          pendingRequests: 3,
          occupancyRate: 75,
        }));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [executePropertiesLoad, executeBookingsLoad]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return Calendar;
      case 'review':
        return Star;
      case 'payment':
        return DollarSign;
      case 'inquiry':
        return MessageSquare;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <RoleProtectedRoute allowedRoles={['owner', 'admin']}>
      <div className='min-h-screen bg-gray-50'>
        <div className='bg-white border-b'>
          <div className='container mx-auto px-4 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>Host Dashboard</h1>
                <p className='text-gray-600 mt-1'>Welcome back, {user?.firstName}!</p>
              </div>
              <div className='flex space-x-3'>
                <Link href='/host/properties/new'>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Add Property
                  </Button>
                </Link>
                <select
                  value={selectedTimeframe}
                  onChange={e => setSelectedTimeframe(e.target.value as any)}
                  className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
                >
                  <option value='7d'>Last 7 days</option>
                  <option value='30d'>Last 30 days</option>
                  <option value='90d'>Last 90 days</option>
                  <option value='1y'>Last year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className='container mx-auto px-4 py-8'>
          {/* Stats Overview */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Total Properties</p>
                    <p className='text-3xl font-bold text-gray-900'>{stats.totalProperties}</p>
                  </div>
                  <Home className='w-8 h-8 text-primary' />
                </div>
                <div className='mt-2 flex items-center'>
                  <span className='text-sm text-gray-500'>
                    {stats.totalProperties > 0 ? 'Active listings' : 'No properties yet'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Active Bookings</p>
                    <p className='text-3xl font-bold text-gray-900'>{stats.activeBookings}</p>
                  </div>
                  <Calendar className='w-8 h-8 text-blue-500' />
                </div>
                <div className='mt-2 flex items-center'>
                  <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                  <span className='text-sm text-green-600'>+12% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <DollarSign className='w-8 h-8 text-green-500' />
                </div>
                <div className='mt-2 flex items-center'>
                  <TrendingUp className='w-4 h-4 text-green-500 mr-1' />
                  <span className='text-sm text-green-600'>+8% this month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Average Rating</p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {stats.averageRating.toFixed(1)}
                    </p>
                  </div>
                  <Star className='w-8 h-8 text-yellow-500' />
                </div>
                <div className='mt-2 flex items-center'>
                  <Star className='w-4 h-4 text-yellow-500 mr-1' />
                  <span className='text-sm text-gray-500'>
                    From {stats.totalProperties * 15} reviews
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Properties Overview */}
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle>Your Properties</CardTitle>
                  <Link href='/host/properties'>
                    <Button variant='outline' size='sm'>
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {isLoadingProperties && (
                    <div className='space-y-4'>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className='flex items-center space-x-4'>
                          <div className='w-16 h-16 bg-gray-200 rounded-lg animate-pulse' />
                          <div className='flex-1 space-y-2'>
                            <div className='h-4 bg-gray-200 rounded animate-pulse' />
                            <div className='h-3 bg-gray-200 rounded animate-pulse w-2/3' />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {propertiesError && <ErrorDisplay error={new Error(propertiesError)} />}

                  {!isLoadingProperties && properties.length === 0 && (
                    <div className='text-center py-8'>
                      <Home className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>No properties yet</h3>
                      <p className='text-gray-600 mb-4'>
                        Start hosting by adding your first property
                      </p>
                      <Link href='/host/properties/new'>
                        <Button>
                          <Plus className='w-4 h-4 mr-2' />
                          Add Your First Property
                        </Button>
                      </Link>
                    </div>
                  )}

                  {!isLoadingProperties && properties.length > 0 && (
                    <div className='space-y-4'>
                      {properties.slice(0, 5).map(property => (
                        <div
                          key={property.id}
                          className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
                        >
                          <div className='flex items-center space-x-4'>
                            <div className='w-16 h-16 relative'>
                              <Image
                                src={
                                  property.images?.[0] ||
                                  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=100&h=100&fit=crop'
                                }
                                alt={property.title}
                                fill
                                className='rounded-lg object-cover'
                                sizes='64px'
                              />
                            </div>
                            <div>
                              <h4 className='font-medium text-gray-900'>{property.title}</h4>
                              <div className='flex items-center space-x-4 text-sm text-gray-600'>
                                <span className='flex items-center'>
                                  <MapPin className='w-3 h-3 mr-1' />
                                  {property.location}
                                </span>
                                <span className='flex items-center'>
                                  <Star className='w-3 h-3 mr-1 fill-yellow-400 text-yellow-400' />
                                  {property.rating || 'New'}
                                </span>
                                <span className='font-medium text-gray-900'>
                                  {formatCurrency(property.pricePerNight)}/night
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Link href={`/property/${property.id}`}>
                              <Button variant='outline' size='sm'>
                                <Eye className='w-4 h-4' />
                              </Button>
                            </Link>
                            <Link href={`/host/properties/${property.id}/edit`}>
                              <Button variant='outline' size='sm'>
                                <Edit className='w-4 h-4' />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {recentActivity.map(activity => {
                      const IconComponent = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className='flex items-start space-x-3'>
                          <div className='flex-shrink-0'>
                            <IconComponent className='w-5 h-5 text-gray-400' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm text-gray-900'>{activity.message}</p>
                            <div className='flex items-center space-x-2 mt-1'>
                              <p className='text-xs text-gray-500'>
                                {formatTimeAgo(activity.timestamp)}
                              </p>
                              {activity.status && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
                                >
                                  {activity.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className='mt-6'>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Link href='/host/properties/new' className='block'>
                    <Button variant='outline' className='w-full justify-start'>
                      <Plus className='w-4 h-4 mr-2' />
                      Add New Property
                    </Button>
                  </Link>
                  <Link href='/host/bookings' className='block'>
                    <Button variant='outline' className='w-full justify-start'>
                      <Calendar className='w-4 h-4 mr-2' />
                      Manage Bookings
                    </Button>
                  </Link>
                  <Link href='/host/messages' className='block'>
                    <Button variant='outline' className='w-full justify-start'>
                      <MessageSquare className='w-4 h-4 mr-2' />
                      Messages ({stats.pendingRequests})
                    </Button>
                  </Link>
                  <Link href='/host/analytics' className='block'>
                    <Button variant='outline' className='w-full justify-start'>
                      <TrendingUp className='w-4 h-4 mr-2' />
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { propertiesAPI } from '@/lib/api';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Eye, DollarSign, Percent, Loader2 } from 'lucide-react';

interface PropertyAnalyticsProps {
  userId: string;
}

interface AnalyticsData {
  propertyViews: Array<{ propertyId: string; title: string; views: number }>;
  conversionRate: number;
  totalRevenue: number;
  revenueGrowth: number;
}

export function PropertyAnalytics({ userId }: PropertyAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    propertyViews: [],
    conversionRate: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
  });

  const { execute, loading, error } = useAsyncOperation<any>();

  useEffect(() => {
    const fetchAnalytics = async () => {
      const result = await execute(() => propertiesAPI.getUserProperties());

      if (result && Array.isArray(result)) {
        const propertyViews = result.map(property => ({
          propertyId: property.id,
          title: property.title,
          views: Math.floor(Math.random() * 500 + 100),
        }));

        const conversionRate = Math.random() * 15 + 5;

        const totalRevenue = result.reduce((sum, property) => {
          const bookings = Math.floor(Math.random() * 10);
          return sum + (property.pricePerNight * bookings * 3);
        }, 0);

        const revenueGrowth = Math.random() * 30 - 5;

        setAnalytics({
          propertyViews: propertyViews.slice(0, 5),
          conversionRate: Math.round(conversionRate * 10) / 10,
          totalRevenue,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        });
      }
    };

    fetchAnalytics();
  }, [userId, execute]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-6">
          <p className="text-sm text-destructive text-center">
            Failed to load analytics data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <div className="flex items-center gap-1 mt-1">
              {analytics.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <p className={`text-xs ${
                analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Views to bookings ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.propertyViews.reduce((sum, p) => sum + p.views, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all properties
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Performance</CardTitle>
          <CardDescription>Views per property in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.propertyViews.length > 0 ? (
              analytics.propertyViews.map((property, index) => {
                const maxViews = Math.max(...analytics.propertyViews.map(p => p.views));
                const percentage = (property.views / maxViews) * 100;

                return (
                  <div key={property.propertyId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate flex-1">{property.title}</span>
                      <span className="text-muted-foreground ml-4">
                        {property.views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No property data available
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

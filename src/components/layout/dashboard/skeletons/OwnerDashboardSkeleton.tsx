import { memo } from 'react';

const OwnerDashboardSkeletonComponent = () => {
  const metrics = ['Total Earnings', 'Active Listings', 'Booking Rate', 'Average Rating'];
  const recentBookings = Array.from({ length: 5 });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((label, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-200 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {recentBookings.map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const OwnerDashboardSkeleton = memo(OwnerDashboardSkeletonComponent);
OwnerDashboardSkeleton.displayName = 'OwnerDashboardSkeleton';

import { memo } from 'react';

const GuestDashboardSkeletonComponent = () => {
  const recentActivity = Array.from({ length: 3 });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-blue-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-44 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-28 bg-green-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {recentActivity.map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const GuestDashboardSkeleton = memo(GuestDashboardSkeletonComponent);
GuestDashboardSkeleton.displayName = 'GuestDashboardSkeleton';

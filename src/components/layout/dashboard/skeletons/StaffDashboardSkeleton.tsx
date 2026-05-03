import { memo } from 'react';

const StaffDashboardSkeletonComponent = () => {
  const metrics = ['Pending Reviews', 'New Properties', 'Support Tickets'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((label, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const StaffDashboardSkeleton = memo(StaffDashboardSkeletonComponent);
StaffDashboardSkeleton.displayName = 'StaffDashboardSkeleton';

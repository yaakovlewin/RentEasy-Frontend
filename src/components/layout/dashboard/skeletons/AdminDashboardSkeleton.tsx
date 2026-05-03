import { memo } from 'react';

const AdminDashboardSkeletonComponent = () => {
  const metrics = ['Total Users', 'Active Properties', 'Monthly Bookings', 'System Health'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {metrics.map((label, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-200 rounded-full animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AdminDashboardSkeleton = memo(AdminDashboardSkeletonComponent);
AdminDashboardSkeleton.displayName = 'AdminDashboardSkeleton';

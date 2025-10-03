'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PlusCircle,
  BarChart3,
  Calendar,
  Settings,
  ArrowRight
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  variant: 'default' | 'outline' | 'secondary';
}

export function PropertyQuickActions() {
  const quickActions: QuickAction[] = [
    {
      title: 'Add Property',
      description: 'List a new property',
      icon: PlusCircle,
      href: '/properties/new',
      variant: 'default',
    },
    {
      title: 'View Analytics',
      description: 'Performance insights',
      icon: BarChart3,
      href: '/profile/properties/analytics',
      variant: 'outline',
    },
    {
      title: 'Manage Bookings',
      description: 'View all bookings',
      icon: Calendar,
      href: '/profile/bookings',
      variant: 'outline',
    },
    {
      title: 'Settings',
      description: 'Property preferences',
      icon: Settings,
      href: '/profile/settings',
      variant: 'outline',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Manage your properties and view performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant={action.variant}
                size="lg"
                asChild
                className="h-auto flex-col items-start p-4 gap-3"
              >
                <Link href={action.href}>
                  <div className="flex items-center gap-3 w-full">
                    <div className={`p-2 rounded-lg ${
                      action.variant === 'default'
                        ? 'bg-primary-foreground/10'
                        : 'bg-primary/10'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        action.variant === 'default'
                          ? 'text-primary-foreground'
                          : 'text-primary'
                      }`} />
                    </div>
                    <ArrowRight className={`h-4 w-4 ml-auto ${
                      action.variant === 'default'
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="text-left w-full">
                    <div className={`font-semibold text-sm mb-1 ${
                      action.variant === 'default'
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                    }`}>
                      {action.title}
                    </div>
                    <div className={`text-xs ${
                      action.variant === 'default'
                        ? 'text-primary-foreground/80'
                        : 'text-muted-foreground'
                    }`}>
                      {action.description}
                    </div>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';

import { 
  Eye, 
  Edit, 
  Trash2, 
  Share, 
  Heart, 
  MessageCircle, 
  Calendar,
  MoreVertical,
  ExternalLink,
  Copy
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { PropertyCardActionsProps } from '../types';

export function PropertyCardActions({
  property,
  variant,
  actions,
  features,
  loading,
  className,
}: PropertyCardActionsProps) {
  const handleAction = (actionFn?: () => void | Promise<void>, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    actionFn?.();
  };

  // Quick actions (always visible)
  const quickActions = [];
  
  if (features?.favorites) {
    quickActions.push({
      key: 'favorite',
      icon: Heart,
      label: 'Add to favorites',
      onClick: () => handleAction(actions?.onFavorite),
      loading: loading?.favoriteLoading,
      className: 'text-red-500 hover:text-red-600',
    });
  }

  if (features?.quickActions) {
    quickActions.push({
      key: 'share',
      icon: Share,
      label: 'Share property',
      onClick: () => handleAction(actions?.onShare),
      loading: loading?.shareLoading,
    });
  }

  // Management actions (in dropdown or as buttons based on variant)
  const managementActions = [];
  
  if (features?.management) {
    managementActions.push({
      key: 'view',
      icon: Eye,
      label: 'View property',
      onClick: () => handleAction(actions?.onView),
    });

    managementActions.push({
      key: 'edit',
      icon: Edit,
      label: 'Edit property',
      onClick: () => handleAction(actions?.onEdit),
      loading: loading?.editLoading,
    });

    managementActions.push({
      key: 'delete',
      icon: Trash2,
      label: 'Delete property',
      onClick: () => handleAction(actions?.onDelete),
      loading: loading?.deleteLoading,
      className: 'text-red-600 hover:text-red-700',
      destructive: true,
    });
  }

  // Additional actions based on variant
  const additionalActions = [];
  
  if (variant === 'search' || variant === 'default') {
    additionalActions.push({
      key: 'contact',
      icon: MessageCircle,
      label: 'Contact host',
      onClick: () => handleAction(actions?.onContact),
    });

    additionalActions.push({
      key: 'book',
      icon: Calendar,
      label: 'Book now',
      onClick: () => handleAction(actions?.onBook),
      primary: true,
    });
  }

  if (variant === 'favorites') {
    additionalActions.push({
      key: 'copyLink',
      icon: Copy,
      label: 'Copy link',
      onClick: () => {
        if (typeof window !== 'undefined') {
          navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
        }
      },
    });

    additionalActions.push({
      key: 'openInNew',
      icon: ExternalLink,
      label: 'Open in new tab',
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.open(`/property/${property.id}`, '_blank');
        }
      },
    });
  }

  // Render different layouts based on variant and space
  const renderCompactActions = () => (
    <div className="flex items-center space-x-1">
      {quickActions.slice(0, 2).map((action) => (
        <Button
          key={action.key}
          variant="ghost"
          size="sm"
          className={cn('p-1.5 h-auto', action.className)}
          onClick={action.onClick}
          disabled={action.loading}
          title={action.label}
        >
          {action.loading ? (
            <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <action.icon className="w-4 h-4" />
          )}
        </Button>
      ))}
      
      {(managementActions.length > 0 || additionalActions.length > 0) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1.5 h-auto">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {additionalActions.map((action, index) => (
              <DropdownMenuItem
                key={action.key}
                onClick={action.onClick}
                className={cn(action.className, action.primary && 'font-medium')}
              >
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </DropdownMenuItem>
            ))}
            
            {additionalActions.length > 0 && managementActions.length > 0 && (
              <DropdownMenuSeparator />
            )}
            
            {managementActions.map((action) => (
              <DropdownMenuItem
                key={action.key}
                onClick={action.onClick}
                className={cn(action.className, action.destructive && 'text-red-600 focus:text-red-600')}
                disabled={action.loading}
              >
                {action.loading ? (
                  <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <action.icon className="w-4 h-4 mr-2" />
                )}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  const renderFullActions = () => (
    <div className="flex items-center space-x-2">
      {/* Primary actions as buttons */}
      {managementActions.map((action) => (
        <Button
          key={action.key}
          variant={action.destructive ? 'destructive' : 'outline'}
          size="sm"
          onClick={action.onClick}
          disabled={action.loading}
          className={cn(action.className)}
        >
          {action.loading ? (
            <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mr-1" />
          ) : (
            <action.icon className="w-4 h-4 mr-1" />
          )}
          {action.label}
        </Button>
      ))}

      {/* Quick actions */}
      {quickActions.map((action) => (
        <Button
          key={action.key}
          variant="outline"
          size="sm"
          onClick={action.onClick}
          disabled={action.loading}
          className={action.className}
        >
          {action.loading ? (
            <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <action.icon className="w-4 h-4" />
          )}
        </Button>
      ))}

      {/* Additional actions in dropdown */}
      {additionalActions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {additionalActions.map((action) => (
              <DropdownMenuItem
                key={action.key}
                onClick={action.onClick}
                className={cn(action.className, action.primary && 'font-medium')}
              >
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  const renderListActions = () => (
    <div className="flex items-center justify-end space-x-1">
      {/* Most important actions as buttons */}
      {additionalActions
        .filter(action => action.primary)
        .map((action) => (
          <Button
            key={action.key}
            variant="default"
            size="sm"
            onClick={action.onClick}
            className="min-w-0"
          >
            <action.icon className="w-4 h-4 mr-1" />
            {action.label}
          </Button>
        ))}

      {/* All other actions in dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {[...quickActions, ...managementActions, ...additionalActions.filter(a => !a.primary)]
            .map((action) => (
              <DropdownMenuItem
                key={action.key}
                onClick={action.onClick}
                className={cn(action.className, action.destructive && 'text-red-600 focus:text-red-600')}
                disabled={action.loading}
              >
                {action.loading ? (
                  <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <action.icon className="w-4 h-4 mr-2" />
                )}
                {action.label}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  // Choose rendering based on variant
  const renderActions = () => {
    switch (variant) {
      case 'compact':
      case 'favorites':
        return renderCompactActions();
      
      case 'list':
        return renderListActions();
      
      case 'management':
        return renderFullActions();
      
      default:
        return renderCompactActions();
    }
  };

  // Don't render if no actions are available
  const hasAnyActions = quickActions.length > 0 || managementActions.length > 0 || additionalActions.length > 0;
  if (!hasAnyActions) {
    return null;
  }

  return (
    <div className={cn('flex items-center', className)}>
      {renderActions()}
    </div>
  );
}
import { useCallback, useState, useMemo } from 'react';

import { cn } from '@/lib/utils';

import type { 
  Property, 
  PropertyCardVariant, 
  PropertyCardSize, 
  PropertyCardFeatures,
  PropertyCardActions,
  PropertyCardSelectionState,
  PropertyCardInteractionState,
  UsePropertyCardReturn
} from '../types';

interface UsePropertyCardProps {
  property: Property;
  variant: PropertyCardVariant;
  size: PropertyCardSize;
  features?: PropertyCardFeatures;
  actions?: PropertyCardActions;
  selection?: PropertyCardSelectionState;
  interaction?: PropertyCardInteractionState;
}

export function usePropertyCard({
  property,
  variant,
  size,
  features,
  actions,
  selection,
  interaction,
}: UsePropertyCardProps): UsePropertyCardReturn {
  // Internal state for interactions
  const [isHovered, setIsHovered] = useState(interaction?.isHovered || false);
  const [isFocused, setIsFocused] = useState(interaction?.isFocused || false);
  const [isSelected, setIsSelected] = useState(selection?.selected || false);
  const [isFavorited, setIsFavorited] = useState(interaction?.isFavorited || false);

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (!features?.animations) return;
    setIsHovered(true);
  }, [features?.animations]);

  const handleMouseLeave = useCallback(() => {
    if (!features?.animations) return;
    setIsHovered(false);
  }, [features?.animations]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, []);

  // Action handlers
  const handleClick = useCallback(() => {
    actions?.onClick?.(property);
  }, [actions, property]);

  const handleFavorite = useCallback(async () => {
    if (interaction?.favoriteDisabled) return;
    
    try {
      setIsFavorited(prev => !prev);
      await actions?.onFavorite?.(property.id);
    } catch (error) {
      // Revert optimistic update on error
      setIsFavorited(prev => !prev);
      throw error;
    }
  }, [actions, property.id, interaction?.favoriteDisabled]);

  const handleShare = useCallback(async () => {
    await actions?.onShare?.(property.id);
  }, [actions, property.id]);

  const handleSelect = useCallback((selected: boolean) => {
    if (selection?.selectionDisabled) return;
    
    setIsSelected(selected);
    actions?.onSelect?.(property.id, selected);
  }, [actions, property.id, selection?.selectionDisabled]);

  const handleEdit = useCallback(async () => {
    await actions?.onEdit?.(property.id);
  }, [actions, property.id]);

  const handleDelete = useCallback(async () => {
    await actions?.onDelete?.(property.id);
  }, [actions, property.id]);

  const handleView = useCallback(() => {
    actions?.onView?.(property.id);
  }, [actions, property.id]);

  // CSS class name generators
  const getCardClassName = useCallback(() => {
    const baseClasses = [
      'relative',
      'bg-white',
      'rounded-lg',
      'shadow-sm',
      'border',
      'border-gray-200',
      'transition-all',
      'duration-200',
      'cursor-pointer',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary',
      'focus:ring-offset-2',
    ];

    // Hover effects
    if (features?.animations !== false) {
      baseClasses.push(
        'hover:shadow-lg',
        'hover:border-gray-300',
        'hover:-translate-y-0.5'
      );
    }

    // Selection state
    if (isSelected) {
      baseClasses.push('ring-2', 'ring-primary', 'border-primary');
    }

    // Focus state
    if (isFocused) {
      baseClasses.push('ring-2', 'ring-primary', 'ring-offset-2');
    }

    return cn(baseClasses, getVariantClassName(), getSizeClassName());
  }, [features?.animations, isSelected, isFocused]);

  const getVariantClassName = useCallback(() => {
    const variantClasses: Record<PropertyCardVariant, string[]> = {
      default: ['flex-col'],
      compact: ['flex-col', 'min-h-0'],
      luxury: [
        'flex-col',
        'bg-gradient-to-br',
        'from-white',
        'to-gray-50',
        'shadow-xl',
        'border-0',
      ],
      list: ['flex-row', 'items-start', 'p-4'],
      management: [
        'flex-col',
        'border-dashed',
        'border-gray-300',
        'hover:border-solid',
        'hover:border-primary',
      ],
      featured: [
        'flex-col',
        'bg-gradient-to-br',
        'from-primary/5',
        'to-white',
        'border-primary/20',
        'shadow-lg',
      ],
      search: ['flex-col', 'hover:shadow-md'],
      favorites: ['flex-col', 'relative', 'group'],
    };

    return cn(variantClasses[variant] || variantClasses.default);
  }, [variant]);

  const getSizeClassName = useCallback(() => {
    const sizeClasses: Record<PropertyCardSize, string[]> = {
      sm: ['max-w-xs'],
      md: ['max-w-sm'],
      lg: ['max-w-md'],
      xl: ['max-w-lg'],
    };

    return cn(sizeClasses[size] || sizeClasses.md);
  }, [size]);

  // Memoized return value
  return useMemo(
    () => ({
      // State
      isHovered,
      isFocused,
      isSelected,
      isFavorited,
      
      // Actions
      handleClick,
      handleFavorite,
      handleShare,
      handleSelect,
      handleEdit,
      handleDelete,
      handleView,
      
      // Event handlers
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      handleKeyDown,
      
      // Utilities
      getCardClassName,
      getVariantClassName,
      getSizeClassName,
    }),
    [
      isHovered,
      isFocused,
      isSelected,
      isFavorited,
      handleClick,
      handleFavorite,
      handleShare,
      handleSelect,
      handleEdit,
      handleDelete,
      handleView,
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      handleKeyDown,
      getCardClassName,
      getVariantClassName,
      getSizeClassName,
    ]
  );
}
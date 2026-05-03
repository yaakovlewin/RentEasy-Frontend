'use client';

import { memo, useCallback } from 'react';

import { CATEGORIES } from './constants';
import { getCategoryNavClassName, getCategoryButtonClassName } from './styles';
import type { Category } from './constants';

interface StyleConfig {
  readonly transparent: boolean;
  readonly isScrolled: boolean;
}

interface CategoryTabsProps extends StyleConfig {
  readonly activeCategory: string;
  readonly onCategoryChange: (categoryId: string) => void;
}

interface CategoryButtonProps extends StyleConfig {
  readonly category: Category;
  readonly isActive: boolean;
  readonly onClick: () => void;
}

const isActiveCategory = (categoryId: string, activeCategory: string): boolean =>
  categoryId === activeCategory;

const createPanelId = (categoryId: string): string => `${categoryId}-panel`;

const CategoryButton = memo<CategoryButtonProps>(
  ({ category, isActive, transparent, isScrolled, onClick }) => (
    <li role="presentation">
      <button
        onClick={onClick}
        role="tab"
        aria-selected={isActive}
        aria-controls={createPanelId(category.id)}
        className={getCategoryButtonClassName({ transparent, isScrolled, isActive })}
      >
        <span>{category.label}</span>
      </button>
    </li>
  )
);

CategoryButton.displayName = 'CategoryButton';

const renderCategory = (
  category: Category,
  activeCategory: string,
  transparent: boolean,
  isScrolled: boolean,
  onCategoryChange: (categoryId: string) => void
) => (
  <CategoryButton
    key={category.id}
    category={category}
    isActive={isActiveCategory(category.id, activeCategory)}
    transparent={transparent}
    isScrolled={isScrolled}
    onClick={() => onCategoryChange(category.id)}
  />
);

export const CategoryTabs = memo<CategoryTabsProps>(
  ({ activeCategory, onCategoryChange, transparent, isScrolled }) => {
    const renderCategoryWithContext = useCallback(
      (category: Category) =>
        renderCategory(category, activeCategory, transparent, isScrolled, onCategoryChange),
      [activeCategory, transparent, isScrolled, onCategoryChange]
    );

    return (
      <nav
        aria-label="Property categories"
        className={getCategoryNavClassName({ transparent, isScrolled })}
      >
        <div className="container mx-auto px-4">
          <ul className="flex items-center space-x-1 py-4 overflow-x-auto scrollbar-hide" role="tablist">
            {CATEGORIES.map(renderCategoryWithContext)}
          </ul>
        </div>
      </nav>
    );
  }
);

CategoryTabs.displayName = 'CategoryTabs';

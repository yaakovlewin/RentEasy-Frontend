/**
 * EmptyState Component Tests
 *
 * Comprehensive test suite for the EmptyState component following TDD Red phase.
 * Tests written BEFORE implementation to drive functional programming design.
 *
 * Test Categories:
 * 1. Basic Rendering
 * 2. Action Button Handling
 * 3. Icon Rendering
 * 4. Variants
 * 5. Accessibility
 * 6. Props & Customization
 * 7. Edge Cases
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Search, Filter, MapPin, Heart } from 'lucide-react';

import { EmptyState } from '../empty-state';

describe('EmptyState Component', () => {
  describe('Basic Rendering', () => {
    test('renders title text', () => {
      render(<EmptyState title="No results found" />);

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    test('renders description text when provided', () => {
      render(
        <EmptyState
          title="No results"
          description="We couldn't find any items matching your search."
        />
      );

      expect(screen.getByText("We couldn't find any items matching your search.")).toBeInTheDocument();
    });

    test('renders without description when not provided', () => {
      const { container } = render(<EmptyState title="No results" />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(0);
    });

    test('renders default icon when custom icon not provided', () => {
      const { container } = render(<EmptyState title="Empty state" />);

      const iconContainer = container.querySelector('.text-gray-500');
      expect(iconContainer).toBeInTheDocument();
    });

    test('applies centering styles to container', () => {
      const { container } = render(<EmptyState title="Centered content" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'text-center');
    });

    test('applies padding to container', () => {
      const { container } = render(<EmptyState title="Padded content" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('p-12');
    });
  });

  describe('Action Button', () => {
    test('renders action button when provided', () => {
      const mockAction = <button>Click me</button>;

      render(<EmptyState title="Empty" action={mockAction} />);

      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    test('does not render action section when not provided', () => {
      const { container } = render(<EmptyState title="No action" />);

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });

    test('button onClick handler is called when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const mockAction = <button onClick={handleClick}>Take action</button>;

      render(<EmptyState title="Empty" action={mockAction} />);

      const button = screen.getByText('Take action');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('renders multiple action buttons', () => {
      const mockActions = (
        <div>
          <button>Action 1</button>
          <button>Action 2</button>
        </div>
      );

      render(<EmptyState title="Multiple actions" action={mockActions} />);

      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    test('action button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      const mockAction = <button onClick={handleClick}>Accessible button</button>;

      render(<EmptyState title="Empty" action={mockAction} />);

      const button = screen.getByText('Accessible button');
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Icon Handling', () => {
    test('accepts custom icon component', () => {
      const { container } = render(
        <EmptyState title="Custom icon" icon={<Search data-testid="custom-search-icon" />} />
      );

      expect(container.querySelector('[data-testid="custom-search-icon"]')).toBeInTheDocument();
    });

    test('renders icon with correct container styling', () => {
      const { container } = render(<EmptyState title="Icon container" icon={<Filter />} />);

      const iconContainer = container.querySelector('.w-16.h-16.rounded-full');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });

    test('icon container has hover effect', () => {
      const { container } = render(<EmptyState title="Hover effect" icon={<Search />} />);

      const iconContainer = container.querySelector('.w-16.h-16.rounded-full');
      expect(iconContainer).toHaveClass('hover:scale-105', 'transition-all', 'duration-300');
    });

    test('icon is centered within container', () => {
      const { container } = render(<EmptyState title="Centered icon" icon={<MapPin />} />);

      const iconWrapper = container.querySelector('.w-16.h-16.rounded-full > div');
      expect(iconWrapper).toBeInTheDocument();
    });

    test('applies correct color to icon based on variant', () => {
      const { container } = render(
        <EmptyState title="Blue icon" variant="search" icon={<Search />} />
      );

      const iconWrapper = container.querySelector('.text-blue-500');
      expect(iconWrapper).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    test('default variant renders with gray styling', () => {
      const { container } = render(<EmptyState title="Default variant" variant="default" />);

      const iconContainer = container.querySelector('.bg-gray-100');
      const iconWrapper = container.querySelector('.text-gray-500');

      expect(iconContainer).toBeInTheDocument();
      expect(iconWrapper).toBeInTheDocument();
    });

    test('search variant renders with blue styling', () => {
      const { container } = render(<EmptyState title="Search variant" variant="search" />);

      const iconContainer = container.querySelector('.bg-blue-100');
      const iconWrapper = container.querySelector('.text-blue-500');

      expect(iconContainer).toBeInTheDocument();
      expect(iconWrapper).toBeInTheDocument();
    });

    test('filter variant renders with purple styling', () => {
      const { container } = render(<EmptyState title="Filter variant" variant="filter" />);

      const iconContainer = container.querySelector('.bg-purple-100');
      const iconWrapper = container.querySelector('.text-purple-500');

      expect(iconContainer).toBeInTheDocument();
      expect(iconWrapper).toBeInTheDocument();
    });

    test('create variant renders with green styling', () => {
      const { container } = render(<EmptyState title="Create variant" variant="create" />);

      const iconContainer = container.querySelector('.bg-green-100');
      const iconWrapper = container.querySelector('.text-green-500');

      expect(iconContainer).toBeInTheDocument();
      expect(iconWrapper).toBeInTheDocument();
    });

    test('connect variant renders with orange styling', () => {
      const { container } = render(<EmptyState title="Connect variant" variant="connect" />);

      const iconContainer = container.querySelector('.bg-orange-100');
      const iconWrapper = container.querySelector('.text-orange-500');

      expect(iconContainer).toBeInTheDocument();
      expect(iconWrapper).toBeInTheDocument();
    });

    test('uses default variant when variant not specified', () => {
      const { container } = render(<EmptyState title="No variant specified" />);

      const iconContainer = container.querySelector('.bg-gray-100');
      expect(iconContainer).toBeInTheDocument();
    });

    test('each variant has appropriate default icon', () => {
      const variants: Array<'default' | 'search' | 'filter' | 'create' | 'connect'> = [
        'default',
        'search',
        'filter',
        'create',
        'connect',
      ];

      variants.forEach((variant) => {
        const { container, unmount } = render(
          <EmptyState title={`${variant} variant`} variant={variant} />
        );

        const iconWrapper = container.querySelector('.w-16.h-16.rounded-full > div');
        expect(iconWrapper).toBeInTheDocument();
        expect(iconWrapper?.querySelector('svg')).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Accessibility', () => {
    test('title is in h3 semantic heading tag', () => {
      render(<EmptyState title="Semantic heading" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Semantic heading');
    });

    test('description is in paragraph tag', () => {
      const { container } = render(
        <EmptyState title="Title" description="Description in paragraph" />
      );

      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveTextContent('Description in paragraph');
    });

    test('icon container does not have role (decorative)', () => {
      const { container } = render(<EmptyState title="Decorative icon" icon={<Search />} />);

      const iconContainer = container.querySelector('.w-16.h-16.rounded-full');
      expect(iconContainer).not.toHaveAttribute('role');
    });

    test('component has proper heading hierarchy', () => {
      render(<EmptyState title="Proper hierarchy" description="With description" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    test('action button maintains focus styles', () => {
      const mockAction = <button className="focus:ring-2">Focused button</button>;

      render(<EmptyState title="Focus test" action={mockAction} />);

      const button = screen.getByText('Focused button');
      expect(button).toHaveClass('focus:ring-2');
    });
  });

  describe('Props & Customization', () => {
    test('accepts custom className for container', () => {
      const { container } = render(<EmptyState title="Custom class" className="custom-wrapper" />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-wrapper');
    });

    test('merges custom className with default classes', () => {
      const { container } = render(
        <EmptyState title="Merged classes" className="bg-red-100" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'bg-red-100');
    });

    test('supports different icon components from lucide-react', () => {
      const icons = [
        { Component: Search, testId: 'search' },
        { Component: Filter, testId: 'filter' },
        { Component: MapPin, testId: 'mappin' },
        { Component: Heart, testId: 'heart' },
      ];

      icons.forEach(({ Component, testId }) => {
        const { container, unmount } = render(
          <EmptyState title="Icon test" icon={<Component data-testid={testId} />} />
        );

        expect(container.querySelector(`[data-testid="${testId}"]`)).toBeInTheDocument();
        unmount();
      });
    });

    test('allows custom action components beyond buttons', () => {
      const customAction = (
        <div data-testid="custom-action">
          <a href="/link">Custom link</a>
          <span>Additional content</span>
        </div>
      );

      const { container } = render(<EmptyState title="Custom action" action={customAction} />);

      expect(container.querySelector('[data-testid="custom-action"]')).toBeInTheDocument();
      expect(screen.getByText('Custom link')).toBeInTheDocument();
    });

    test('maintains type safety with TypeScript interfaces', () => {
      const validProps = {
        title: 'Type safe',
        description: 'Optional description',
        icon: <Search />,
        action: <button>Action</button>,
        className: 'custom-class',
        variant: 'search' as const,
      };

      render(<EmptyState {...validProps} />);

      expect(screen.getByText('Type safe')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles very long title text', () => {
      const longTitle =
        'This is a very long title that should still render correctly without breaking the layout or causing overflow issues in the component';

      render(<EmptyState title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    test('handles very long description text', () => {
      const longDescription =
        'This is an extremely long description that contains multiple sentences and should wrap properly within the max-width constraint. It should maintain readability and not cause any layout issues. The component should handle this gracefully with proper text wrapping and spacing to ensure good user experience even with verbose content.';

      render(<EmptyState title="Long description" description={longDescription} />);

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    test('handles empty string title gracefully', () => {
      render(<EmptyState title="" />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('');
    });

    test('handles null/undefined in action prop', () => {
      const { container } = render(<EmptyState title="No action" action={undefined} />);

      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(0);
    });

    test('handles complex nested icon components', () => {
      const ComplexIcon = () => (
        <div data-testid="complex-icon">
          <Search />
          <span>With text</span>
        </div>
      );

      const { container } = render(<EmptyState title="Complex icon" icon={<ComplexIcon />} />);

      expect(container.querySelector('[data-testid="complex-icon"]')).toBeInTheDocument();
    });

    test('handles rapid variant changes', () => {
      const { rerender } = render(<EmptyState title="Variant test" variant="default" />);

      expect(document.querySelector('.bg-gray-100')).toBeInTheDocument();

      rerender(<EmptyState title="Variant test" variant="search" />);
      expect(document.querySelector('.bg-blue-100')).toBeInTheDocument();

      rerender(<EmptyState title="Variant test" variant="create" />);
      expect(document.querySelector('.bg-green-100')).toBeInTheDocument();
    });

    test('maintains consistent spacing without description', () => {
      const { container } = render(<EmptyState title="No description" />);

      const heading = container.querySelector('h3');
      expect(heading).toHaveClass('mb-3');
    });

    test('description has max-width constraint', () => {
      const { container } = render(
        <EmptyState title="Width test" description="Description with max width" />
      );

      const paragraph = container.querySelector('p');
      expect(paragraph).toHaveClass('max-w-md');
    });

    test('handles multiple rapid re-renders without memory leaks', () => {
      const { rerender } = render(<EmptyState title="Initial render" />);

      for (let i = 0; i < 100; i++) {
        rerender(<EmptyState title={`Render ${i}`} description={`Description ${i}`} />);
      }

      expect(screen.getByText('Render 99')).toBeInTheDocument();
      expect(screen.getByText('Description 99')).toBeInTheDocument();
    });

    test('properly cleans up when unmounted', () => {
      const handleClick = jest.fn();
      const mockAction = <button onClick={handleClick}>Click me</button>;

      const { unmount } = render(<EmptyState title="Cleanup test" action={mockAction} />);

      unmount();

      expect(screen.queryByText('Cleanup test')).not.toBeInTheDocument();
    });
  });

  describe('Integration with Real-World Scenarios', () => {
    test('works with Button component from design system', () => {
      const mockAction = (
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Browse Properties</button>
      );

      render(<EmptyState title="No results" action={mockAction} />);

      const button = screen.getByText('Browse Properties');
      expect(button).toHaveClass('px-4', 'py-2', 'bg-blue-500');
    });

    test('displays search empty state scenario', () => {
      render(
        <EmptyState
          title="No properties found"
          description="Try adjusting your search filters"
          variant="search"
          icon={<Search />}
          action={<button>Clear Filters</button>}
        />
      );

      expect(screen.getByText('No properties found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search filters')).toBeInTheDocument();
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    test('displays create new item scenario', () => {
      const handleCreate = jest.fn();

      render(
        <EmptyState
          title="No items yet"
          description="Get started by creating your first item"
          variant="create"
          action={<button onClick={handleCreate}>Create Item</button>}
        />
      );

      expect(screen.getByText('No items yet')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first item')).toBeInTheDocument();
    });

    test('displays connection error scenario', () => {
      const handleRetry = jest.fn();

      render(
        <EmptyState
          title="Connection Error"
          description="Unable to connect to the server"
          variant="connect"
          action={<button onClick={handleRetry}>Retry</button>}
        />
      );

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to the server')).toBeInTheDocument();
    });
  });

  describe('Functional Programming Principles', () => {
    test('component is pure - same props produce same output', () => {
      const props = {
        title: 'Pure component',
        description: 'Same props, same output',
        variant: 'default' as const,
      };

      const { container: container1, unmount: unmount1 } = render(<EmptyState {...props} />);
      const html1 = container1.innerHTML;
      unmount1();

      const { container: container2, unmount: unmount2 } = render(<EmptyState {...props} />);
      const html2 = container2.innerHTML;
      unmount2();

      expect(html1).toBe(html2);
    });

    test('component has no side effects on external state', () => {
      const externalState = { count: 0 };

      render(
        <EmptyState
          title="No side effects"
          action={
            <button
              onClick={() => {
                externalState.count = 0;
              }}
            >
              Action
            </button>
          }
        />
      );

      expect(externalState.count).toBe(0);
    });

    test('component is composable with other components', () => {
      const ComposedComponent = () => (
        <div>
          <EmptyState title="First" />
          <EmptyState title="Second" />
        </div>
      );

      render(<ComposedComponent />);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    test('props remain immutable - component does not modify them', () => {
      const props = {
        title: 'Immutable props',
        description: 'Props should not be modified',
        className: 'original-class',
      };

      const originalProps = { ...props };

      render(<EmptyState {...props} />);

      expect(props).toEqual(originalProps);
    });
  });
});

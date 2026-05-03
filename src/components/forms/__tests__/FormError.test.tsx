/**
 * FormError Component Tests
 *
 * TDD Red Phase: Writing failing tests BEFORE implementation
 *
 * Component Requirements:
 * - Display error messages in consistent styled container
 * - Support different variants (inline, banner)
 * - Optional dismiss button
 * - Icon support
 * - Accessible error announcements
 * - Support for multiple error messages (array)
 * - Pure functional component (no side effects)
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import FormError from '../FormError';

expect.extend(toHaveNoViolations);

describe('FormError Component', () => {
  describe('Basic Rendering', () => {
    test('renders error message text', () => {
      render(<FormError message="Invalid email address" />);

      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    test('does not render when message is empty string', () => {
      const { container } = render(<FormError message="" />);

      expect(container.firstChild).toBeNull();
    });

    test('does not render when message is null', () => {
      const { container } = render(<FormError message={null as any} />);

      expect(container.firstChild).toBeNull();
    });

    test('does not render when message is undefined', () => {
      const { container } = render(<FormError message={undefined as any} />);

      expect(container.firstChild).toBeNull();
    });

    test('applies correct ARIA role (alert)', () => {
      render(<FormError message="Error occurred" />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    test('has proper base styling classes', () => {
      const { container } = render(<FormError message="Error message" />);

      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('text-red-600');
      expect(errorElement).toHaveClass('text-sm');
    });

    test('renders with semantic HTML structure', () => {
      render(<FormError message="Error message" />);

      const alert = screen.getByRole('alert');
      expect(alert.tagName).toBe('DIV');
    });
  });

  describe('Variants', () => {
    test('renders inline variant correctly (default)', () => {
      const { container } = render(<FormError message="Error message" />);

      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('mt-1');
      expect(errorElement).not.toHaveClass('p-3');
    });

    test('renders banner variant correctly', () => {
      const { container } = render(
        <FormError message="Error message" variant="banner" />
      );

      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('p-3');
      expect(errorElement).toHaveClass('rounded-md');
      expect(errorElement).toHaveClass('bg-red-50');
      expect(errorElement).toHaveClass('border');
      expect(errorElement).toHaveClass('border-red-200');
    });

    test('applies variant-specific layout classes', () => {
      const { container: inlineContainer } = render(
        <FormError message="Inline error" variant="inline" />
      );
      const { container: bannerContainer } = render(
        <FormError message="Banner error" variant="banner" />
      );

      const inlineElement = inlineContainer.firstChild as HTMLElement;
      const bannerElement = bannerContainer.firstChild as HTMLElement;

      expect(inlineElement.className).not.toBe(bannerElement.className);
    });

    test('default variant is inline', () => {
      const { container: defaultContainer } = render(
        <FormError message="Default error" />
      );
      const { container: inlineContainer } = render(
        <FormError message="Inline error" variant="inline" />
      );

      const defaultElement = defaultContainer.firstChild as HTMLElement;
      const inlineElement = inlineContainer.firstChild as HTMLElement;

      expect(defaultElement.className).toBe(inlineElement.className);
    });
  });

  describe('Dismiss Functionality', () => {
    test('shows dismiss button when onDismiss provided', () => {
      const handleDismiss = jest.fn();
      render(<FormError message="Error message" onDismiss={handleDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      expect(dismissButton).toBeInTheDocument();
    });

    test('hides dismiss button when onDismiss not provided', () => {
      render(<FormError message="Error message" />);

      const dismissButton = screen.queryByRole('button', { name: /dismiss/i });
      expect(dismissButton).not.toBeInTheDocument();
    });

    test('calls onDismiss when X button clicked', async () => {
      const user = userEvent.setup();
      const handleDismiss = jest.fn();

      render(<FormError message="Error message" onDismiss={handleDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    test('dismiss button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleDismiss = jest.fn();

      render(<FormError message="Error message" onDismiss={handleDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      dismissButton.focus();

      await user.keyboard('{Enter}');

      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    test('dismiss button has proper ARIA label', () => {
      const handleDismiss = jest.fn();
      render(<FormError message="Error message" onDismiss={handleDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss error/i });
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error');
    });

    test('dismiss button has correct styling', () => {
      const handleDismiss = jest.fn();
      render(<FormError message="Error message" onDismiss={handleDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      expect(dismissButton).toHaveClass('text-red-600');
      expect(dismissButton).toHaveClass('hover:text-red-800');
    });
  });

  describe('Multiple Errors', () => {
    test('renders single error as string', () => {
      render(<FormError message="Single error message" />);

      expect(screen.getByText('Single error message')).toBeInTheDocument();
    });

    test('renders multiple errors as array', () => {
      const errors = ['First error', 'Second error', 'Third error'];
      render(<FormError message={errors} />);

      errors.forEach(error => {
        expect(screen.getByText(error)).toBeInTheDocument();
      });
    });

    test('each error in list has proper styling', () => {
      const errors = ['Error one', 'Error two'];
      render(<FormError message={errors} />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);

      listItems.forEach(item => {
        expect(item).toHaveClass('text-red-600');
      });
    });

    test('renders bullet points for multiple errors', () => {
      const errors = ['Error one', 'Error two', 'Error three'];
      render(<FormError message={errors} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveClass('list-disc');
      expect(list).toHaveClass('list-inside');
    });

    test('single error does not render as list', () => {
      render(<FormError message="Single error" />);

      const list = screen.queryByRole('list');
      expect(list).not.toBeInTheDocument();
    });

    test('empty array does not render', () => {
      const { container } = render(<FormError message={[]} />);

      expect(container.firstChild).toBeNull();
    });

    test('array with empty strings does not render', () => {
      const { container } = render(<FormError message={['', '', '']} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    test('has role="alert" for screen readers', () => {
      render(<FormError message="Error message" />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    test('error is announced to screen readers', () => {
      render(<FormError message="Important error" />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Important error');
    });

    test('dismiss button has accessible name', () => {
      const handleDismiss = jest.fn();
      render(<FormError message="Error" onDismiss={handleDismiss} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName('Dismiss error');
    });

    test('multiple errors maintain accessibility', () => {
      const errors = ['Error one', 'Error two'];
      render(<FormError message={errors} />);

      const alert = screen.getByRole('alert');
      const list = within(alert).getByRole('list');
      const items = within(list).getAllByRole('listitem');

      expect(items).toHaveLength(2);
    });

    test('component has no accessibility violations (single error)', async () => {
      const { container } = render(<FormError message="Error message" />);
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    test('component has no accessibility violations (multiple errors)', async () => {
      const { container } = render(
        <FormError message={['Error one', 'Error two']} />
      );
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });

    test('component has no accessibility violations (with dismiss)', async () => {
      const handleDismiss = jest.fn();
      const { container } = render(
        <FormError message="Error" onDismiss={handleDismiss} />
      );
      const results = await axe(container);

      expect(results).toHaveNoViolations();
    });
  });

  describe('Styling & Props', () => {
    test('accepts custom className', () => {
      const { container } = render(
        <FormError message="Error" className="custom-class" />
      );

      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('custom-class');
    });

    test('merges className with default styles', () => {
      const { container } = render(
        <FormError message="Error" className="mb-4" />
      );

      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('mb-4');
      expect(errorElement).toHaveClass('text-red-600');
      expect(errorElement).toHaveClass('text-sm');
    });

    test('applies correct color scheme (red theme)', () => {
      const { container } = render(<FormError message="Error" />);

      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement.className).toMatch(/red/);
    });

    test('banner variant has consistent spacing', () => {
      const { container } = render(
        <FormError message="Error" variant="banner" />
      );

      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('p-3');
    });

    test('inline variant has minimal spacing', () => {
      const { container } = render(
        <FormError message="Error" variant="inline" />
      );

      const errorElement = container.firstChild as HTMLElement;
      expect(errorElement).toHaveClass('mt-1');
      expect(errorElement).not.toHaveClass('p-3');
    });
  });

  describe('Icon Support', () => {
    test('displays error icon for banner variant', () => {
      render(<FormError message="Error" variant="banner" />);

      const icon = screen.getByTestId('error-icon');
      expect(icon).toBeInTheDocument();
    });

    test('does not display icon for inline variant by default', () => {
      render(<FormError message="Error" variant="inline" />);

      const icon = screen.queryByTestId('error-icon');
      expect(icon).not.toBeInTheDocument();
    });

    test('icon has proper styling', () => {
      render(<FormError message="Error" variant="banner" />);

      const icon = screen.getByTestId('error-icon');
      expect(icon).toHaveClass('text-red-600');
    });

    test('icon is decorative (aria-hidden)', () => {
      render(<FormError message="Error" variant="banner" />);

      const icon = screen.getByTestId('error-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Edge Cases', () => {
    test('handles very long error messages', () => {
      const longMessage = 'This is a very long error message that contains a lot of text and should still be displayed properly without breaking the layout or causing any visual issues in the component rendering. '.repeat(3);

      render(<FormError message={longMessage} />);

      expect(screen.getByText(longMessage.trim())).toBeInTheDocument();
    });

    test('handles empty string gracefully', () => {
      const { container } = render(<FormError message="" />);

      expect(container.firstChild).toBeNull();
    });

    test('works with special characters', () => {
      const specialMessage = "Error: Can't connect to <server@example.com>";
      render(<FormError message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    test('handles XSS attempts safely', () => {
      const xssAttempt = '<script>alert("XSS")</script>';
      render(<FormError message={xssAttempt} />);

      const alert = screen.getByRole('alert');
      expect(alert.innerHTML).not.toContain('<script>');
      expect(alert.textContent).toContain(xssAttempt);
    });

    test('handles mixed array with valid and empty strings', () => {
      const mixedErrors = ['Valid error', '', 'Another valid error', ''];
      render(<FormError message={mixedErrors} />);

      expect(screen.getByText('Valid error')).toBeInTheDocument();
      expect(screen.getByText('Another valid error')).toBeInTheDocument();

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(2);
    });

    test('handles array with single non-empty item', () => {
      render(<FormError message={['Single error']} />);

      expect(screen.getByText('Single error')).toBeInTheDocument();
      const list = screen.queryByRole('list');
      expect(list).toBeInTheDocument();
    });

    test('handles whitespace-only strings', () => {
      const { container } = render(<FormError message="   " />);

      expect(container.firstChild).toBeNull();
    });

    test('handles array with whitespace-only strings', () => {
      const { container } = render(<FormError message={['  ', '\n', '\t']} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Pure Functional Component Behavior', () => {
    test('component is idempotent (same props produce same output)', () => {
      const props = { message: 'Error message', variant: 'inline' as const };

      const { container: container1 } = render(<FormError {...props} />);
      const { container: container2 } = render(<FormError {...props} />);

      expect(container1.innerHTML).toBe(container2.innerHTML);
    });

    test('component has no side effects (re-rendering does not change output)', () => {
      const { container, rerender } = render(<FormError message="Error" />);

      const initialHTML = container.innerHTML;

      rerender(<FormError message="Error" />);
      rerender(<FormError message="Error" />);
      rerender(<FormError message="Error" />);

      expect(container.innerHTML).toBe(initialHTML);
    });

    test('component does not mutate props', () => {
      const props = {
        message: ['Error one', 'Error two'],
        variant: 'banner' as const,
        className: 'custom-class',
      };

      const propsCopy = JSON.parse(JSON.stringify(props));

      render(<FormError {...props} />);

      expect(props).toEqual(propsCopy);
    });

    test('multiple instances do not interfere with each other', () => {
      render(
        <>
          <FormError message="Error 1" variant="inline" />
          <FormError message="Error 2" variant="banner" />
          <FormError message={['Error 3', 'Error 4']} />
        </>
      );

      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Error 2')).toBeInTheDocument();
      expect(screen.getByText('Error 3')).toBeInTheDocument();
      expect(screen.getByText('Error 4')).toBeInTheDocument();

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(3);
    });
  });

  describe('Type Safety', () => {
    test('accepts string message', () => {
      render(<FormError message="String message" />);

      expect(screen.getByText('String message')).toBeInTheDocument();
    });

    test('accepts string array message', () => {
      render(<FormError message={['Array message']} />);

      expect(screen.getByText('Array message')).toBeInTheDocument();
    });

    test('accepts inline variant', () => {
      const { container } = render(
        <FormError message="Error" variant="inline" />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('accepts banner variant', () => {
      const { container } = render(
        <FormError message="Error" variant="banner" />
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    test('accepts optional onDismiss callback', () => {
      const handleDismiss = jest.fn();
      render(<FormError message="Error" onDismiss={handleDismiss} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('accepts optional className', () => {
      const { container } = render(
        <FormError message="Error" className="test-class" />
      );

      expect(container.firstChild).toHaveClass('test-class');
    });
  });
});

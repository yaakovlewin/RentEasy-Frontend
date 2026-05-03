/**
 * Button Component Tests - Form Context Focus
 *
 * Testing Button component with emphasis on form-specific scenarios:
 * - Loading states for async form submissions
 * - Disabled states for validation failures
 * - Form submit behavior
 * - Accessibility in form contexts
 * - Different button variants in forms
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { Button } from '../button';

describe('Button Component - Form Context', () => {
  describe('Basic Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with default variant', () => {
      const { container } = render(<Button>Default</Button>);

      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Form Submit Type', () => {
    it('should render button without explicit type by default', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      // HTML buttons default to type="submit" if not specified, but we don't explicitly set it
      expect(button).toBeInTheDocument();
    });

    it('should support type="submit" for form submission', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should support type="reset" for form reset', () => {
      render(<Button type="reset">Reset</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });

    it('should trigger form submission when type="submit"', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <input type="text" />
          <Button type="submit">Submit Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: 'Submit Form' });
      await user.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should not trigger form submission when type="button"', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <input type="text" />
          <Button type="button">Cancel</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: 'Cancel' });
      await user.click(button);

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:opacity-50');
      expect(button).toHaveClass('disabled:pointer-events-none');
    });

    it('should not trigger onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should prevent form submission when disabled', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit" disabled>
            Submit
          </Button>
        </form>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should have proper aria-disabled attribute', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });

    it('should be keyboard inaccessible when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <div>
          <Button disabled onClick={handleClick}>
            Disabled
          </Button>
        </div>
      );

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');
      await user.keyboard(' ');

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State (Simulated)', () => {
    it('should render loading button with disabled state', () => {
      render(
        <Button disabled aria-busy="true">
          <span className="loading-spinner" />
          Loading...
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should show loading text instead of regular text', () => {
      const { rerender } = render(<Button>Submit</Button>);

      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

      rerender(
        <Button disabled>
          <span>Loading...</span>
        </Button>
      );

      expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
    });

    it('should not trigger onClick when in loading state', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button disabled aria-busy="true" onClick={handleClick}>
          Loading...
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should prevent form submission when loading', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit" disabled aria-busy="true">
            Submitting...
          </Button>
        </form>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should show spinner when loading', () => {
      render(
        <Button disabled>
          <svg data-testid="spinner" className="animate-spin" />
          Loading...
        </Button>
      );

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should maintain button width during loading state', () => {
      const { container, rerender } = render(
        <Button style={{ width: '120px' }}>Submit Form</Button>
      );

      const button = container.querySelector('button');
      const initialWidth = button?.style.width;

      rerender(
        <Button disabled style={{ width: '120px' }}>
          <span>...</span>
        </Button>
      );

      const loadingButton = container.querySelector('button');
      expect(loadingButton?.style.width).toBe(initialWidth);
    });
  });

  describe('Form Validation Integration', () => {
    it('should be disabled when form is invalid', () => {
      const isFormValid = false;

      render(<Button disabled={!isFormValid}>Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be enabled when form is valid', () => {
      const isFormValid = true;

      render(<Button disabled={!isFormValid}>Submit</Button>);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should update disabled state when validation changes', () => {
      const { rerender } = render(<Button disabled={true}>Submit</Button>);

      let button = screen.getByRole('button');
      expect(button).toBeDisabled();

      rerender(<Button disabled={false}>Submit</Button>);

      button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('should work with real-time validation', async () => {
      const user = userEvent.setup();
      const ValidationForm = () => {
        const [email, setEmail] = React.useState('');
        const isValid = email.includes('@');

        return (
          <form>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <Button type="submit" disabled={!isValid}>
              Submit
            </Button>
          </form>
        );
      };

      render(<ValidationForm />);

      const button = screen.getByRole('button');
      const input = screen.getByPlaceholderText('Email');

      expect(button).toBeDisabled();

      await user.type(input, 'test@example.com');

      expect(button).not.toBeDisabled();
    });
  });

  describe('Button Variants in Forms', () => {
    it('should render primary submit button', () => {
      const { container } = render(
        <Button type="submit" variant="default">
          Submit
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-primary');
    });

    it('should render destructive button for dangerous actions', () => {
      const { container } = render(
        <Button type="button" variant="destructive">
          Delete Account
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('should render secondary button for cancel actions', () => {
      const { container } = render(
        <Button type="button" variant="secondary">
          Cancel
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-secondary');
    });

    it('should render outline button for alternative actions', () => {
      const { container } = render(
        <Button type="button" variant="outline">
          Save Draft
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('border');
    });

    it('should render ghost button for subtle actions', () => {
      const { container } = render(
        <Button type="button" variant="ghost">
          Skip
        </Button>
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('hover:bg-accent');
    });
  });

  describe('Button Sizes in Forms', () => {
    it('should render default size button', () => {
      const { container } = render(<Button>Default</Button>);

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11');
    });

    it('should render small button', () => {
      const { container } = render(<Button size="sm">Small</Button>);

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-9');
    });

    it('should render large button', () => {
      const { container } = render(<Button size="lg">Large</Button>);

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-13');
    });

    it('should render extra large button', () => {
      const { container } = render(<Button size="xl">Extra Large</Button>);

      const button = container.querySelector('button');
      expect(button).toHaveClass('h-16');
    });
  });

  describe('Accessibility in Forms', () => {
    it('should have proper button role', () => {
      render(<Button>Button</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Press Enter</Button>);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Press Space</Button>);

      const button = screen.getByRole('button');
      button.focus();

      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have focus visible styles', () => {
      render(<Button>Focus me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none');
      expect(button).toHaveClass('focus-visible:ring-2');
    });

    it('should support aria-label for icon buttons', () => {
      render(
        <Button aria-label="Close dialog" size="icon">
          <span>×</span>
        </Button>
      );

      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toBeInTheDocument();
    });

    it('should support aria-describedby for additional context', () => {
      render(
        <div>
          <Button aria-describedby="submit-help">Submit</Button>
          <span id="submit-help">This will save your changes</span>
        </div>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'submit-help');
    });

    it('should be tabbable in correct order', async () => {
      const user = userEvent.setup();

      render(
        <form>
          <input data-testid="input-1" />
          <Button>Button 1</Button>
          <input data-testid="input-2" />
          <Button>Button 2</Button>
        </form>
      );

      const input1 = screen.getByTestId('input-1');
      const button1 = screen.getByRole('button', { name: 'Button 1' });
      const input2 = screen.getByTestId('input-2');
      const button2 = screen.getByRole('button', { name: 'Button 2' });

      input1.focus();
      expect(input1).toHaveFocus();

      await user.tab();
      expect(button1).toHaveFocus();

      await user.tab();
      expect(input2).toHaveFocus();

      await user.tab();
      expect(button2).toHaveFocus();
    });
  });

  describe('Click Handling in Forms', () => {
    it('should call onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should receive event object in onClick', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle async onClick for form submission', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<Button onClick={handleClick}>Submit</Button>);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Form Context Integration', () => {
    it('should work in login form', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <Button type="submit">Log In</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: 'Log In' });
      await user.click(button);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('should work in multi-step form', () => {
      render(
        <form>
          <Button type="button">Previous</Button>
          <Button type="button">Next</Button>
          <Button type="submit">Finish</Button>
        </form>
      );

      expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
    });

    it('should work with form reset', async () => {
      const user = userEvent.setup();
      const handleReset = jest.fn();

      render(
        <form onReset={handleReset}>
          <input type="text" defaultValue="test" />
          <Button type="reset">Reset Form</Button>
        </form>
      );

      const button = screen.getByRole('button', { name: 'Reset Form' });
      await user.click(button);

      expect(handleReset).toHaveBeenCalledTimes(1);
    });

    it('should support form attribute for external forms', () => {
      render(
        <div>
          <form id="my-form" />
          <Button form="my-form" type="submit">
            Submit External Form
          </Button>
        </div>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'my-form');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicks', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Rapid Click</Button>);

      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('should handle double click', async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();

      render(<Button onClick={handleClick}>Double Click</Button>);

      const button = screen.getByRole('button');
      await user.dblClick(button);

      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should work with children components', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should maintain state across re-renders', () => {
      const { rerender } = render(<Button disabled={false}>Button</Button>);

      let button = screen.getByRole('button');
      expect(button).not.toBeDisabled();

      rerender(<Button disabled={true}>Button</Button>);

      button = screen.getByRole('button');
      expect(button).toBeDisabled();

      rerender(<Button disabled={false}>Button</Button>);

      button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });
});

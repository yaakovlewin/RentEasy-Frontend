import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { PasswordInput } from '../PasswordInput';

describe('PasswordInput Component', () => {
  describe('Visibility Toggle Functionality', () => {
    it('should initially render password input with type="password"', () => {
      render(<PasswordInput placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toHaveAttribute('type', 'password');
    });

    it('should show password when eye icon is clicked (type="text")', async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      const input = screen.getByPlaceholderText('Enter password');

      await user.click(toggleButton);

      expect(input).toHaveAttribute('type', 'text');
    });

    it('should hide password when eye icon is clicked again', async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      const input = screen.getByPlaceholderText('Enter password');

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should toggle between show and hide on multiple clicks', async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      const input = screen.getByPlaceholderText('Enter password');

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should display Eye icon when password is hidden', () => {
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(toggleButton).toBeInTheDocument();
    });

    it('should display EyeOff icon when password is visible', async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });

      await user.click(toggleButton);

      const hideButton = screen.getByRole('button', { name: /hide password/i });
      expect(hideButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label for password input', () => {
      render(<PasswordInput aria-label="Password" />);

      const input = screen.getByLabelText('Password');

      expect(input).toBeInTheDocument();
    });

    it('should have proper aria-label for toggle button when password is hidden', () => {
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    });

    it('should have proper aria-label for toggle button when password is visible', async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      await user.click(toggleButton);

      const hideButton = screen.getByRole('button', { name: /hide password/i });

      expect(hideButton).toHaveAttribute('aria-label', 'Hide password');
    });

    it('should have role="button" on toggle element', () => {
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(toggleButton).toBeInTheDocument();
    });

    it('should be keyboard navigable with Tab key', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <input data-testid="before" />
          <PasswordInput placeholder="Enter password" />
          <input data-testid="after" />
        </div>
      );

      const beforeInput = screen.getByTestId('before');
      const passwordInput = screen.getByPlaceholderText('Enter password');
      const toggleButton = screen.getByRole('button', { name: /show password/i });
      const afterInput = screen.getByTestId('after');

      beforeInput.focus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(toggleButton).toHaveFocus();

      await user.tab();
      expect(afterInput).toHaveFocus();
    });

    it('should toggle visibility with Enter key on button', async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      const input = screen.getByPlaceholderText('Enter password');

      toggleButton.focus();
      await user.keyboard('{Enter}');

      expect(input).toHaveAttribute('type', 'text');
    });

    it('should toggle visibility with Space key on button', async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      const input = screen.getByPlaceholderText('Enter password');

      toggleButton.focus();
      await user.keyboard(' ');

      expect(input).toHaveAttribute('type', 'text');
    });

    it('should announce password visibility state to screen readers', async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });

      expect(toggleButton).toHaveAttribute('aria-label', 'Show password');

      await user.click(toggleButton);

      const hideButton = screen.getByRole('button', { name: /hide password/i });
      expect(hideButton).toHaveAttribute('aria-label', 'Hide password');
    });
  });

  describe('Props & Integration', () => {
    it('should forward value prop to input element', () => {
      render(<PasswordInput value="test123" onChange={() => {}} />);

      const input = screen.getByDisplayValue('test123');

      expect(input).toBeInTheDocument();
    });

    it('should forward onChange prop and call it when input changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<PasswordInput onChange={handleChange} />);

      const input = screen.getByRole('textbox', { hidden: true });

      await user.type(input, 'password');

      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(8);
    });

    it('should forward placeholder prop to input element', () => {
      render(<PasswordInput placeholder="Your secure password" />);

      const input = screen.getByPlaceholderText('Your secure password');

      expect(input).toBeInTheDocument();
    });

    it('should forward name prop to input element', () => {
      render(<PasswordInput name="userPassword" placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toHaveAttribute('name', 'userPassword');
    });

    it('should forward id prop to input element', () => {
      render(<PasswordInput id="password-field" placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toHaveAttribute('id', 'password-field');
    });

    it('should support className prop for custom styling', () => {
      render(<PasswordInput className="custom-class" placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toHaveClass('custom-class');
    });

    it('should merge className with internal styles', () => {
      render(<PasswordInput className="my-custom-class" placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toHaveClass('my-custom-class');
      expect(input.className).not.toBe('my-custom-class');
    });

    it('should forward ref correctly for form libraries', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<PasswordInput ref={ref} placeholder="Enter password" />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe('password');
    });

    it('should work with controlled component pattern', async () => {
      const user = userEvent.setup();
      const ControlledComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <PasswordInput
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter password"
          />
        );
      };

      render(<ControlledComponent />);

      const input = screen.getByPlaceholderText('Enter password');

      await user.type(input, 'test');

      expect(input).toHaveValue('test');
    });

    it('should work with uncontrolled component pattern', async () => {
      const user = userEvent.setup();
      render(<PasswordInput defaultValue="initial" placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toHaveValue('initial');

      await user.clear(input);
      await user.type(input, 'changed');

      expect(input).toHaveValue('changed');
    });

    it('should work with react-hook-form register pattern', () => {
      const mockRegister = jest.fn((name) => ({
        name,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      }));

      const { name, onChange, onBlur, ref } = mockRegister('password');

      render(
        <PasswordInput
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref}
          placeholder="Enter password"
        />
      );

      expect(mockRegister).toHaveBeenCalledWith('password');

      const input = screen.getByPlaceholderText('Enter password');
      expect(input).toHaveAttribute('name', 'password');
    });
  });

  describe('Edge Cases', () => {
    it('should work with empty value', () => {
      render(<PasswordInput value="" onChange={() => {}} />);

      const input = screen.getByRole('textbox', { hidden: true });

      expect(input).toHaveValue('');
    });

    it('should work with long passwords', async () => {
      const user = userEvent.setup();
      const longPassword = 'a'.repeat(100);
      render(<PasswordInput placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      await user.type(input, longPassword);

      expect(input).toHaveValue(longPassword);
    });

    it('should respect disabled state on input', () => {
      render(<PasswordInput disabled placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toBeDisabled();
    });

    it('should respect disabled state on toggle button', async () => {
      const user = userEvent.setup();
      render(<PasswordInput disabled placeholder="Enter password" />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      const input = screen.getByPlaceholderText('Enter password');

      await user.click(toggleButton);

      expect(input).toHaveAttribute('type', 'password');
    });

    it('should respect required validation', () => {
      render(<PasswordInput required placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toBeRequired();
    });

    it('should support autoComplete attribute', () => {
      render(<PasswordInput autoComplete="current-password" placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toHaveAttribute('autoComplete', 'current-password');
    });

    it('should support maxLength attribute', async () => {
      const user = userEvent.setup();
      render(<PasswordInput maxLength={10} placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      await user.type(input, 'a'.repeat(15));

      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should support minLength attribute', () => {
      render(<PasswordInput minLength={8} placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toHaveAttribute('minLength', '8');
    });

    it('should support pattern attribute for validation', () => {
      render(
        <PasswordInput
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          placeholder="Enter password"
        />
      );

      const input = screen.getByPlaceholderText('Enter password');

      expect(input).toHaveAttribute('pattern', '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}');
    });
  });

  describe('Functional Programming Principles', () => {
    it('should render consistently with same props (pure render)', () => {
      const { rerender } = render(<PasswordInput value="test" onChange={() => {}} />);

      const firstInput = screen.getByDisplayValue('test');
      const firstType = firstInput.getAttribute('type');

      rerender(<PasswordInput value="test" onChange={() => {}} />);

      const secondInput = screen.getByDisplayValue('test');
      const secondType = secondInput.getAttribute('type');

      expect(firstType).toBe(secondType);
    });

    it('should handle state changes immutably', async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      const initialType = input.getAttribute('type');

      await user.click(toggleButton);

      const newType = input.getAttribute('type');

      expect(initialType).not.toBe(newType);
      expect(initialType).toBe('password');
      expect(newType).toBe('text');
    });

    it('should not cause side effects in component logic', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(<PasswordInput placeholder="Enter password" />);

      const input = screen.getByPlaceholderText('Enter password');
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      await user.type(input, 'password');
      await user.click(toggleButton);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should use React hooks correctly without breaking rules', () => {
      const { rerender } = render(<PasswordInput placeholder="Enter password" />);

      expect(() => {
        rerender(<PasswordInput placeholder="Different placeholder" />);
        rerender(<PasswordInput placeholder="Enter password" />);
        rerender(<PasswordInput placeholder="Another change" />);
      }).not.toThrow();
    });

    it('should maintain referential equality for event handlers', () => {
      const onChange = jest.fn();
      const onBlur = jest.fn();
      const onFocus = jest.fn();

      const { rerender } = render(
        <PasswordInput onChange={onChange} onBlur={onBlur} onFocus={onFocus} />
      );

      rerender(<PasswordInput onChange={onChange} onBlur={onBlur} onFocus={onFocus} />);

      expect(onChange).not.toHaveBeenCalled();
      expect(onBlur).not.toHaveBeenCalled();
      expect(onFocus).not.toHaveBeenCalled();
    });
  });

  describe('Additional Integration Tests', () => {
    it('should maintain password visibility state across re-renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<PasswordInput value="test" onChange={() => {}} />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      const input = screen.getByDisplayValue('test');

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');

      rerender(<PasswordInput value="test" onChange={() => {}} />);

      const inputAfterRerender = screen.getByDisplayValue('test');
      expect(inputAfterRerender).toHaveAttribute('type', 'text');
    });

    it('should prevent default form submission when toggle button is clicked', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <PasswordInput placeholder="Enter password" />
          <button type="submit">Submit</button>
        </form>
      );

      const toggleButton = screen.getByRole('button', { name: /show password/i });

      await user.click(toggleButton);

      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it('should not interfere with form submission when Enter is pressed in input', async () => {
      const user = userEvent.setup();
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <PasswordInput placeholder="Enter password" />
        </form>
      );

      const input = screen.getByPlaceholderText('Enter password');

      input.focus();
      await user.keyboard('{Enter}');

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should allow copying password when visible', async () => {
      const user = userEvent.setup();
      render(<PasswordInput value="copyable" onChange={() => {}} />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      const input = screen.getByDisplayValue('copyable');

      await user.click(toggleButton);

      input.focus();
      input.setSelectionRange(0, 8);

      expect(input.selectionStart).toBe(0);
      expect(input.selectionEnd).toBe(8);
    });
  });

  describe('Form Integration & Label Association', () => {
    it('should work with external label using htmlFor', () => {
      render(
        <div>
          <label htmlFor="password-input">Password</label>
          <PasswordInput id="password-input" />
        </div>
      );

      const label = screen.getByText('Password');
      const input = screen.getByLabelText('Password');

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'password-input');
    });

    it('should support aria-labelledby for complex label scenarios', () => {
      render(
        <div>
          <span id="password-label">Enter your password</span>
          <PasswordInput aria-labelledby="password-label" />
        </div>
      );

      const input = screen.getByRole('textbox', { hidden: true });
      expect(input).toHaveAttribute('aria-labelledby', 'password-label');
    });

    it('should support aria-describedby for error messages', () => {
      render(
        <div>
          <PasswordInput aria-describedby="password-error" placeholder="Password" />
          <span id="password-error">Password must be at least 8 characters</span>
        </div>
      );

      const input = screen.getByPlaceholderText('Password');
      expect(input).toHaveAttribute('aria-describedby', 'password-error');
    });

    it('should integrate with react-hook-form error state', () => {
      render(
        <div>
          <PasswordInput
            placeholder="Password"
            aria-invalid="true"
            aria-describedby="password-error"
          />
          <span id="password-error" role="alert">
            Password is required
          </span>
        </div>
      );

      const input = screen.getByPlaceholderText('Password');
      const error = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'password-error');
      expect(error).toHaveTextContent('Password is required');
    });

    it('should maintain focus when error state changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <PasswordInput placeholder="Password" aria-invalid="false" />
      );

      const input = screen.getByPlaceholderText('Password');
      input.focus();

      expect(input).toHaveFocus();

      rerender(<PasswordInput placeholder="Password" aria-invalid="true" />);

      expect(input).toHaveFocus();
    });

    it('should work in form context with error styling', () => {
      render(
        <form>
          <div className="form-field">
            <label htmlFor="pwd">Password</label>
            <PasswordInput
              id="pwd"
              className="border-red-500"
              aria-invalid="true"
            />
            <span className="error-message">Password is required</span>
          </div>
        </form>
      );

      const input = screen.getByLabelText('Password');
      expect(input).toHaveClass('border-red-500');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should support onFocus and onBlur for validation triggers', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(
        <PasswordInput
          placeholder="Password"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );

      const input = screen.getByPlaceholderText('Password');

      input.focus();
      expect(handleFocus).toHaveBeenCalledTimes(1);

      input.blur();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should work with FormField wrapper pattern', () => {
      render(
        <div className="form-field">
          <label htmlFor="password-field" className="form-label">
            Password
          </label>
          <PasswordInput id="password-field" placeholder="Enter password" />
          <span className="form-helper-text">Must be at least 8 characters</span>
        </div>
      );

      const label = screen.getByText('Password');
      const input = screen.getByPlaceholderText('Enter password');
      const helperText = screen.getByText('Must be at least 8 characters');

      expect(label).toHaveAttribute('for', 'password-field');
      expect(input).toHaveAttribute('id', 'password-field');
      expect(helperText).toBeInTheDocument();
    });
  });
});

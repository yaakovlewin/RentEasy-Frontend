/**
 * Form Validation Components Tests
 *
 * Testing comprehensive form validation components:
 * - ValidationMessage: Display validation messages with severity variants
 * - FormField: Field wrapper with label, error, and validation state
 * - ValidationSummary: Multi-field error summary
 * - useFormValidation: Custom hook for form validation logic
 * - validationRules: Reusable validation rule library
 */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';
import * as React from 'react';

import {
  ValidationMessage,
  FormField,
  ValidationSummary,
  useFormValidation,
  validationRules,
  composeValidators,
} from '../form-validation';

describe('ValidationMessage Component', () => {
  describe('Basic Rendering', () => {
    it('should render error message with default variant', () => {
      render(<ValidationMessage message="This field is required" />);

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should render error variant with red styling', () => {
      const { container } = render(
        <ValidationMessage message="Error message" variant="error" />
      );

      const messageElement = container.firstChild as HTMLElement;
      expect(messageElement).toHaveClass('text-red-600');
    });

    it('should render warning variant with yellow styling', () => {
      const { container } = render(
        <ValidationMessage message="Warning message" variant="warning" />
      );

      const messageElement = container.firstChild as HTMLElement;
      expect(messageElement).toHaveClass('text-yellow-600');
    });

    it('should render success variant with green styling', () => {
      const { container } = render(
        <ValidationMessage message="Success message" variant="success" />
      );

      const messageElement = container.firstChild as HTMLElement;
      expect(messageElement).toHaveClass('text-green-600');
    });

    it('should render info variant with blue styling', () => {
      const { container } = render(
        <ValidationMessage message="Info message" variant="info" />
      );

      const messageElement = container.firstChild as HTMLElement;
      expect(messageElement).toHaveClass('text-blue-600');
    });

    it('should render with custom className', () => {
      const { container } = render(
        <ValidationMessage message="Custom message" className="mb-4" />
      );

      const messageElement = container.firstChild as HTMLElement;
      expect(messageElement).toHaveClass('mb-4');
    });
  });

  describe('Icon Display', () => {
    it('should show error icon by default', () => {
      render(<ValidationMessage message="Error" variant="error" />);

      const icon = screen.getByText('Error').previousSibling;
      expect(icon).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      const { container } = render(
        <ValidationMessage message="No icon" showIcon={false} />
      );

      const messageElement = container.firstChild as HTMLElement;
      const svgElements = messageElement.querySelectorAll('svg');
      expect(svgElements.length).toBe(0);
    });

    it('should render custom icon when provided', () => {
      const CustomIcon = () => <span data-testid="custom-icon">!</span>;

      render(
        <ValidationMessage
          message="Custom icon message"
          icon={<CustomIcon />}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should show warning icon for warning variant', () => {
      render(<ValidationMessage message="Warning" variant="warning" />);

      const icon = screen.getByText('Warning').previousSibling;
      expect(icon).toBeInTheDocument();
    });

    it('should show success icon for success variant', () => {
      render(<ValidationMessage message="Success" variant="success" />);

      const icon = screen.getByText('Success').previousSibling;
      expect(icon).toBeInTheDocument();
    });

    it('should show info icon for info variant', () => {
      render(<ValidationMessage message="Info" variant="info" />);

      const icon = screen.getByText('Info').previousSibling;
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render with default size', () => {
      const { container } = render(<ValidationMessage message="Default size" />);

      const messageElement = container.firstChild as HTMLElement;
      expect(messageElement).toHaveClass('text-sm');
    });

    it('should render with small size', () => {
      const { container } = render(
        <ValidationMessage message="Small size" size="sm" />
      );

      const messageElement = container.firstChild as HTMLElement;
      expect(messageElement).toHaveClass('text-xs');
    });

    it('should render with large size', () => {
      const { container } = render(
        <ValidationMessage message="Large size" size="lg" />
      );

      const messageElement = container.firstChild as HTMLElement;
      expect(messageElement).toHaveClass('text-base');
    });
  });
});

describe('FormField Component', () => {
  describe('Label Rendering', () => {
    it('should render label when provided', () => {
      render(
        <FormField label="Email Address">
          <input type="email" />
        </FormField>
      );

      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      const { container } = render(
        <FormField>
          <input type="text" />
        </FormField>
      );

      const label = container.querySelector('label');
      expect(label).not.toBeInTheDocument();
    });

    it('should show required indicator when required is true', () => {
      render(
        <FormField label="Required Field" required>
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should associate label with input using htmlFor', () => {
      render(
        <FormField label="Username">
          <input type="text" />
        </FormField>
      );

      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', input.id);
    });

    it('should render description text', () => {
      render(
        <FormField label="Password" description="Must be at least 8 characters">
          <input type="password" />
        </FormField>
      );

      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('should apply custom labelClassName', () => {
      render(
        <FormField label="Custom Label" labelClassName="font-bold">
          <input type="text" />
        </FormField>
      );

      const label = screen.getByText('Custom Label');
      expect(label).toHaveClass('font-bold');
    });
  });

  describe('Error State', () => {
    it('should display error message when error prop is provided', () => {
      render(
        <FormField label="Email" error="Invalid email address">
          <input type="email" />
        </FormField>
      );

      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    it('should apply error styling to label', () => {
      render(
        <FormField label="Email" error="Invalid email">
          <input type="email" />
        </FormField>
      );

      const label = screen.getByText('Email');
      expect(label).toHaveClass('text-red-700');
    });

    it('should set aria-invalid on input when error exists', () => {
      render(
        <FormField error="Error message">
          <input type="text" />
        </FormField>
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby on input for error message', () => {
      render(
        <FormField error="Error message">
          <input type="text" />
        </FormField>
      );

      const input = screen.getByRole('textbox');
      const ariaDescribedBy = input.getAttribute('aria-describedby');

      expect(ariaDescribedBy).toBeTruthy();
      expect(ariaDescribedBy).toContain('error');
    });

    it('should not show aria-describedby when no error', () => {
      render(
        <FormField>
          <input type="text" />
        </FormField>
      );

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Validation State Priority', () => {
    it('should show error over warning', () => {
      render(
        <FormField error="Error message" warning="Warning message">
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Warning message')).not.toBeInTheDocument();
    });

    it('should show warning when no error', () => {
      render(
        <FormField warning="Warning message">
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('should show success when no error or warning', () => {
      render(
        <FormField success="Success message">
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    it('should show info when no error, warning, or success', () => {
      render(
        <FormField info="Info message">
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('should prioritize error over success', () => {
      render(
        <FormField error="Error" success="Success">
          <input type="text" />
        </FormField>
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.queryByText('Success')).not.toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should apply custom className to container', () => {
      const { container } = render(
        <FormField className="mb-6">
          <input type="text" />
        </FormField>
      );

      const formFieldContainer = container.firstChild as HTMLElement;
      expect(formFieldContainer).toHaveClass('mb-6');
    });

    it('should have consistent spacing', () => {
      const { container } = render(
        <FormField>
          <input type="text" />
        </FormField>
      );

      const formFieldContainer = container.firstChild as HTMLElement;
      expect(formFieldContainer).toHaveClass('space-y-2');
    });

    it('should render children correctly', () => {
      render(
        <FormField>
          <input type="text" placeholder="Test input" />
        </FormField>
      );

      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    });
  });
});

describe('ValidationSummary Component', () => {
  describe('Basic Rendering', () => {
    it('should render summary with multiple errors', () => {
      const errors = {
        email: 'Email is required',
        password: 'Password must be at least 8 characters',
        confirmPassword: 'Passwords do not match',
      };

      render(<ValidationSummary errors={errors} />);

      expect(screen.getByText(/Email is required/)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 8 characters/)).toBeInTheDocument();
      expect(screen.getByText(/Passwords do not match/)).toBeInTheDocument();
    });

    it('should render custom title', () => {
      const errors = { field: 'Error' };

      render(<ValidationSummary errors={errors} title="Form Validation Failed" />);

      expect(screen.getByText('Form Validation Failed')).toBeInTheDocument();
    });

    it('should render default title when not provided', () => {
      const errors = { field: 'Error' };

      render(<ValidationSummary errors={errors} />);

      expect(screen.getByText('Please fix the following errors:')).toBeInTheDocument();
    });

    it('should not render when no errors', () => {
      const { container } = render(<ValidationSummary errors={{}} />);

      expect(container.firstChild).toBeNull();
    });

    it('should not render when all errors are empty strings', () => {
      const errors = {
        field1: '',
        field2: '',
        field3: '',
      };

      const { container } = render(<ValidationSummary errors={errors} />);

      expect(container.firstChild).toBeNull();
    });

    it('should filter out empty error messages', () => {
      const errors = {
        email: 'Email is required',
        password: '',
        username: 'Username is taken',
      };

      render(<ValidationSummary errors={errors} />);

      expect(screen.getByText(/Email is required/)).toBeInTheDocument();
      expect(screen.getByText(/Username is taken/)).toBeInTheDocument();

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });
  });

  describe('Styling and Layout', () => {
    it('should apply error styling', () => {
      const errors = { field: 'Error' };
      const { container } = render(<ValidationSummary errors={errors} />);

      const summaryContainer = container.firstChild as HTMLElement;
      expect(summaryContainer).toHaveClass('border-red-200');
      expect(summaryContainer).toHaveClass('bg-red-50');
    });

    it('should apply custom className', () => {
      const errors = { field: 'Error' };
      const { container } = render(
        <ValidationSummary errors={errors} className="mb-6" />
      );

      const summaryContainer = container.firstChild as HTMLElement;
      expect(summaryContainer).toHaveClass('mb-6');
    });

    it('should render error icon', () => {
      const errors = { field: 'Error' };
      render(<ValidationSummary errors={errors} />);

      const container = screen.getByText('Please fix the following errors:').closest('div');
      expect(container).toBeInTheDocument();
    });
  });
});

describe('useFormValidation Hook', () => {
  describe('Initial State', () => {
    it('should initialize with provided values', () => {
      const initialValues = { email: '', password: '' };
      const { result } = renderHook(() =>
        useFormValidation(initialValues, {
          email: () => null,
          password: () => null,
        })
      );

      expect(result.current.values).toEqual(initialValues);
    });

    it('should have empty errors initially', () => {
      const { result } = renderHook(() =>
        useFormValidation({ field: '' }, { field: () => null })
      );

      expect(result.current.errors).toEqual({});
    });

    it('should have no touched fields initially', () => {
      const { result } = renderHook(() =>
        useFormValidation({ field: '' }, { field: () => null })
      );

      expect(result.current.touched).toEqual({});
    });

    it('should report isValid as true when no errors', () => {
      const { result } = renderHook(() =>
        useFormValidation({ field: '' }, { field: () => null })
      );

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Field Value Updates', () => {
    it('should update field value', () => {
      const { result } = renderHook(() =>
        useFormValidation({ email: '' }, { email: () => null })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
      });

      expect(result.current.values.email).toBe('test@example.com');
    });

    it('should not validate untouched fields', () => {
      const validator = jest.fn(() => 'Error');
      const { result } = renderHook(() =>
        useFormValidation({ email: '' }, { email: validator })
      );

      act(() => {
        result.current.setValue('email', 'invalid');
      });

      expect(validator).not.toHaveBeenCalled();
    });

    it('should validate touched fields on change', () => {
      const { result } = renderHook(() =>
        useFormValidation(
          { email: '' },
          { email: (value) => (value ? null : 'Required') }
        )
      );

      act(() => {
        result.current.setTouched('email');
      });

      act(() => {
        result.current.setValue('email', '');
      });

      expect(result.current.errors.email).toBe('Required');
    });
  });

  describe('Field Touched State', () => {
    it('should mark field as touched', () => {
      const { result } = renderHook(() =>
        useFormValidation({ email: '' }, { email: () => null })
      );

      act(() => {
        result.current.setTouched('email');
      });

      expect(result.current.touched.email).toBe(true);
    });

    it('should validate field when marked as touched', () => {
      const { result } = renderHook(() =>
        useFormValidation(
          { email: 'invalid' },
          { email: (value) => (value === 'invalid' ? 'Error' : null) }
        )
      );

      act(() => {
        result.current.setTouched('email');
      });

      expect(result.current.errors.email).toBe('Error');
    });
  });

  describe('Form Validation', () => {
    it('should validate all fields', () => {
      const { result } = renderHook(() =>
        useFormValidation(
          { email: '', password: '' },
          {
            email: (value) => (value ? null : 'Email required'),
            password: (value) => (value ? null : 'Password required'),
          }
        )
      );

      let isValid: boolean = true;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid).toBe(false);
      expect(result.current.errors.email).toBe('Email required');
      expect(result.current.errors.password).toBe('Password required');
    });

    it('should mark all fields as touched when validating', () => {
      const { result } = renderHook(() =>
        useFormValidation(
          { field1: '', field2: '' },
          { field1: () => null, field2: () => null }
        )
      );

      act(() => {
        result.current.validateAll();
      });

      expect(result.current.touched.field1).toBe(true);
      expect(result.current.touched.field2).toBe(true);
    });

    it('should return true when all validations pass', () => {
      const { result } = renderHook(() =>
        useFormValidation(
          { email: 'test@example.com' },
          { email: () => null }
        )
      );

      let isValid: boolean = false;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid).toBe(true);
    });
  });

  describe('Form Reset', () => {
    it('should reset to initial values', () => {
      const initialValues = { email: '', password: '' };
      const { result } = renderHook(() =>
        useFormValidation(initialValues, {
          email: () => null,
          password: () => null,
        })
      );

      act(() => {
        result.current.setValue('email', 'test@example.com');
        result.current.setValue('password', 'password123');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.values).toEqual(initialValues);
    });

    it('should clear all errors on reset', () => {
      const { result } = renderHook(() =>
        useFormValidation(
          { email: '' },
          { email: (value) => (value ? null : 'Required') }
        )
      );

      act(() => {
        result.current.validateAll();
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.errors).toEqual({});
    });

    it('should clear touched state on reset', () => {
      const { result } = renderHook(() =>
        useFormValidation({ email: '' }, { email: () => null })
      );

      act(() => {
        result.current.setTouched('email');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.touched).toEqual({});
    });
  });
});

describe('validationRules Library', () => {
  describe('required rule', () => {
    it('should validate required fields', () => {
      const validator = validationRules.required();

      expect(validator('')).toBe('This field is required');
      expect(validator('   ')).toBe('This field is required');
      expect(validator(null)).toBe('This field is required');
      expect(validator(undefined)).toBe('This field is required');
      expect(validator('value')).toBeNull();
    });

    it('should use custom error message', () => {
      const validator = validationRules.required('Custom required message');

      expect(validator('')).toBe('Custom required message');
    });
  });

  describe('email rule', () => {
    it('should validate email format', () => {
      const validator = validationRules.email();

      expect(validator('invalid')).toBe('Please enter a valid email address');
      expect(validator('invalid@')).toBe('Please enter a valid email address');
      expect(validator('@invalid.com')).toBe('Please enter a valid email address');
      expect(validator('valid@example.com')).toBeNull();
      expect(validator('user.name+tag@example.co.uk')).toBeNull();
    });

    it('should use custom error message', () => {
      const validator = validationRules.email('Invalid email');

      expect(validator('invalid')).toBe('Invalid email');
    });

    it('should allow empty values', () => {
      const validator = validationRules.email();

      expect(validator('')).toBeNull();
    });
  });

  describe('minLength rule', () => {
    it('should validate minimum length', () => {
      const validator = validationRules.minLength(8);

      expect(validator('short')).toBe('Must be at least 8 characters');
      expect(validator('longenough')).toBeNull();
    });

    it('should use custom error message', () => {
      const validator = validationRules.minLength(8, 'Too short');

      expect(validator('short')).toBe('Too short');
    });

    it('should allow empty values', () => {
      const validator = validationRules.minLength(8);

      expect(validator('')).toBeNull();
    });
  });

  describe('maxLength rule', () => {
    it('should validate maximum length', () => {
      const validator = validationRules.maxLength(10);

      expect(validator('this is too long')).toBe('Must be no more than 10 characters');
      expect(validator('short')).toBeNull();
    });

    it('should use custom error message', () => {
      const validator = validationRules.maxLength(10, 'Too long');

      expect(validator('this is too long')).toBe('Too long');
    });
  });

  describe('pattern rule', () => {
    it('should validate against regex pattern', () => {
      const validator = validationRules.pattern(/^[A-Z]/, 'Must start with uppercase');

      expect(validator('lowercase')).toBe('Must start with uppercase');
      expect(validator('Uppercase')).toBeNull();
    });

    it('should allow empty values', () => {
      const validator = validationRules.pattern(/^[A-Z]/, 'Must start with uppercase');

      expect(validator('')).toBeNull();
    });
  });

  describe('number rule', () => {
    it('should validate numbers', () => {
      const validator = validationRules.number();

      expect(validator('not a number')).toBe('Must be a valid number');
      expect(validator('123')).toBeNull();
      expect(validator('123.45')).toBeNull();
      expect(validator('-123')).toBeNull();
    });

    it('should use custom error message', () => {
      const validator = validationRules.number('Invalid number');

      expect(validator('abc')).toBe('Invalid number');
    });
  });

  describe('min rule', () => {
    it('should validate minimum value', () => {
      const validator = validationRules.min(10);

      expect(validator('5')).toBe('Must be at least 10');
      expect(validator('15')).toBeNull();
    });

    it('should use custom error message', () => {
      const validator = validationRules.min(10, 'Too small');

      expect(validator('5')).toBe('Too small');
    });
  });

  describe('max rule', () => {
    it('should validate maximum value', () => {
      const validator = validationRules.max(100);

      expect(validator('150')).toBe('Must be no more than 100');
      expect(validator('50')).toBeNull();
    });

    it('should use custom error message', () => {
      const validator = validationRules.max(100, 'Too large');

      expect(validator('150')).toBe('Too large');
    });
  });

  describe('custom rule', () => {
    it('should validate with custom function', () => {
      const isEven = (value: unknown) => Number(value) % 2 === 0;
      const validator = validationRules.custom(isEven, 'Must be even');

      expect(validator('3')).toBe('Must be even');
      expect(validator('4')).toBeNull();
    });

    it('should allow empty values', () => {
      const validator = validationRules.custom(() => false, 'Error');

      expect(validator('')).toBeNull();
    });
  });
});

describe('composeValidators', () => {
  it('should compose multiple validators', () => {
    const validator = composeValidators(
      validationRules.required(),
      validationRules.minLength(8)
    );

    expect(validator('')).toBe('This field is required');
    expect(validator('short')).toBe('Must be at least 8 characters');
    expect(validator('longenough')).toBeNull();
  });

  it('should return first error encountered', () => {
    const validator = composeValidators(
      validationRules.required(),
      validationRules.email(),
      validationRules.minLength(20)
    );

    expect(validator('')).toBe('This field is required');
    expect(validator('invalid')).toBe('Please enter a valid email address');
  });

  it('should validate all rules in order', () => {
    const validator = composeValidators(
      validationRules.required(),
      validationRules.minLength(8),
      validationRules.maxLength(20)
    );

    expect(validator('short')).toBe('Must be at least 8 characters');
    expect(validator('this is way too long for validation')).toBe(
      'Must be no more than 20 characters'
    );
  });
});

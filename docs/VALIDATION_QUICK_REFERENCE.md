# Validation System - Quick Reference

One-page reference for the Either-based validation system.

---

## Quick Start

```typescript
import { useForm } from '@/hooks/useForm';
import { required, validateEmail, composeValidators } from '@/lib/utils/functional/validation';

const form = useForm({
  initialValues: { email: '', password: '' },
  validators: {
    email: composeValidators(required('Email'), validateEmail),
    password: required('Password'),
  },
  onSubmit: async (values) => { /* submit logic */ },
});

<form onSubmit={form.handleSubmit}>
  <Input {...form.register('email')} />
  {form.hasError('email') && <FormError message={form.getFieldError('email')} />}
</form>
```

---

## Common Validators

```typescript
// String validators
required('Field name')
minLength(8, 'Password')
maxLength(100, 'Bio')
validateEmail
validatePhone
validateUrl

// Password validators
hasUppercase
hasLowercase
hasNumber
hasSpecialChar
validatePassword  // All password requirements

// Number validators
isPositive('Price')
inRange(1, 100, 'Rating')

// Date validators
isFutureDate('Check-in')
isAfterDate(startDate, 'Start', 'End')

// Comparison
matches(otherValue, 'Confirmation')
```

---

## Composition

```typescript
// Combine multiple validators
const emailValidator = composeValidators(
  required('Email'),
  validateEmail
);

// Conditional validation
const propertyIdValidator = when(
  (values) => values.role === 'owner',
  required('Property ID')
);

// Optional field (only validate if non-empty)
const phoneValidator = optional(validatePhone);

// Transform before validation
const lowercaseEmail = withTransform(
  (email: string) => email.toLowerCase(),
  validateEmail
);
```

---

## useForm Hook API

### Configuration

```typescript
const form = useForm<FormValues>({
  initialValues: T,
  validators?: Partial<Record<keyof T, Validator<T[keyof T]>>>,
  onSubmit: (values: T) => Promise<void>,
  validateOnChange?: boolean,  // default: false
  validateOnBlur?: boolean,    // default: true
  resetOnSubmit?: boolean,     // default: false
});
```

### State

```typescript
form.values         // Current form values
form.errors         // Field errors
form.touched        // Touched fields
form.isValidating   // Validation in progress
form.isSubmitting   // Submission in progress
form.isValid        // Form is valid
form.isDirty        // Form has changes
```

### Actions

```typescript
form.handleSubmit(e)              // Submit handler
form.setFieldValue(field, value)  // Update field
form.setFieldError(field, errors) // Set field errors
form.validateField(field)         // Validate single field
form.validateForm()               // Validate entire form
form.resetForm()                  // Reset to initial values
form.clearErrors()                // Clear all errors
```

### Helpers

```typescript
form.register(field)           // Auto onChange/onBlur
form.getFieldError(field)      // Get first error
form.hasError(field)           // Check if field has error
form.isTouched(field)          // Check if field is touched
```

---

## Form Patterns

### Basic Form

```typescript
const form = useForm({
  initialValues: { name: '', email: '' },
  validators: {
    name: required('Name'),
    email: composeValidators(required('Email'), validateEmail),
  },
  onSubmit: async (values) => await api.submit(values),
});

<form onSubmit={form.handleSubmit}>
  <Input {...form.register('name')} />
  {form.hasError('name') && <FormError message={form.getFieldError('name')} />}

  <Button type="submit" disabled={!form.isValid}>Submit</Button>
</form>
```

### Password Confirmation

```typescript
const form = useForm({ /* ... */ });

useEffect(() => {
  if (form.values.confirmPassword) {
    if (form.values.password !== form.values.confirmPassword) {
      form.setFieldError('confirmPassword', ['Passwords do not match']);
    } else {
      form.setFieldError('confirmPassword', []);
    }
  }
}, [form.values.password, form.values.confirmPassword]);
```

### Async Validation

```typescript
onSubmit: async (values) => {
  const exists = await api.checkEmail(values.email);
  if (exists) {
    form.setFieldError('email', ['Email already registered']);
    throw new Error('Email exists');
  }
  await register(values);
}
```

### Dynamic Fields

```typescript
const form = useForm({ /* ... */ });

<Input
  type="number"
  value={form.values.guests}
  onChange={(e) => form.setFieldValue('guests', parseInt(e.target.value))}
/>

<div className="flex gap-2">
  <Button onClick={() => form.setFieldValue('guests', form.values.guests - 1)}>-</Button>
  <span>{form.values.guests}</span>
  <Button onClick={() => form.setFieldValue('guests', form.values.guests + 1)}>+</Button>
</div>
```

---

## Error Display

```typescript
// Inline error
{form.hasError('email') && (
  <FormError message={form.getFieldError('email')} variant='inline' />
)}

// Banner error (multiple errors)
{form.hasError('password') && (
  <FormError message={form.errors.password} variant='banner' />
)}

// Conditional display (only if touched)
{form.hasError('email') && form.isTouched('email') && (
  <FormError message={form.getFieldError('email')} />
)}
```

---

## Custom Validators

```typescript
// Simple validator
const validateUsername: Validator<string> = (value) =>
  /^[a-zA-Z0-9_]+$/.test(value)
    ? right(value)
    : left(['Username can only contain letters, numbers, and underscores']);

// Parameterized validator
const minAge = (min: number): Validator<number> => (value) =>
  value >= min
    ? right(value)
    : left([`Must be at least ${min} years old`]);

// Composed custom validator
const validateStrongEmail = composeValidators(
  required('Email'),
  validateEmail,
  (value: string) =>
    value.endsWith('@company.com')
      ? right(value)
      : left(['Must use company email'])
);
```

---

## Type Definitions

```typescript
// Validator function
type Validator<T> = (value: T) => Either<ValidationError[], T>;

// Form values interface
interface LoginFormValues {
  email: string;
  password: string;
}

// Field errors
type FieldErrors<T> = Partial<Record<keyof T, ValidationError[]>>;

// Validation result
type FormValidationResult<T> = Either<FieldErrors<T>, T>;
```

---

## Testing

```typescript
// Unit test validators
import { validateEmail } from '@/lib/utils/functional/validation';
import { isLeft, isRight } from '@/lib/api/functional/either';

describe('validateEmail', () => {
  it('accepts valid email', () => {
    expect(isRight(validateEmail('user@example.com'))).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = validateEmail('invalid');
    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) {
      expect(result.left).toContain('Invalid email address');
    }
  });
});

// Integration test forms
import { render, screen, fireEvent } from '@testing-library/react';

describe('LoginForm', () => {
  it('validates on blur', async () => {
    render(<LoginForm />);
    fireEvent.blur(screen.getByLabelText(/email/i));
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});
```

---

## Best Practices

### DO

✅ Compose validators for reusability
✅ Validate on blur, not on change
✅ Use type-safe field access
✅ Display field-level errors
✅ Disable submit when invalid
✅ Use ARIA attributes for accessibility

### DON'T

❌ Copy-paste validation logic
❌ Validate on every keystroke
❌ Use string literals for field names
❌ Display only form-level errors
❌ Allow submission with errors
❌ Forget accessibility attributes

---

## Common Patterns

### Email + Password

```typescript
validators: {
  email: composeValidators(required('Email'), validateEmail),
  password: composeValidators(required('Password'), minLength(8, 'Password')),
}
```

### Registration Form

```typescript
validators: {
  firstName: composeValidators(required('First name'), minLength(2, 'First name')),
  lastName: composeValidators(required('Last name'), minLength(2, 'Last name')),
  email: composeValidators(required('Email'), validateEmail),
  phone: composeValidators(required('Phone'), validatePhone),
  password: validatePassword,
}
```

### Booking Form

```typescript
validators: {
  checkIn: composeValidators(required('Check-in'), isFutureDate('Check-in')),
  checkOut: (value) => isAfterDate(checkIn, 'Check-in', 'Check-out')(value),
  guests: composeValidators(isPositive('Guests'), inRange(1, 10, 'Guests')),
}
```

### Contact Form

```typescript
validators: {
  name: required('Name'),
  email: composeValidators(required('Email'), validateEmail),
  phone: optional(validatePhone),
  message: composeValidators(required('Message'), minLength(10, 'Message')),
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Errors not showing | Check `form.hasError(field)` |
| Form submits with errors | Add `disabled={!form.isValid}` |
| Type error on validator | Use correct validator for field type |
| Password matching not working | Use `useEffect` for reactive validation |
| Validation too aggressive | Set `validateOnChange: false` |

---

## Migration Checklist

- [ ] Import validation library
- [ ] Replace `useState` with `useForm`
- [ ] Define validators
- [ ] Replace `onChange` with `form.register()`
- [ ] Add field-level errors
- [ ] Remove HTML5 validation
- [ ] Test validation
- [ ] Test submission

---

## Resources

- **Migration Guide**: `docs/VALIDATION_MIGRATION_GUIDE.md`
- **Before/After**: `docs/BEFORE_AFTER_COMPARISON.md`
- **Summary**: `docs/VALIDATION_SYSTEM_SUMMARY.md`
- **Examples**:
  - `src/app/(auth)/auth/login/LoginFormRefactored.tsx`
  - `src/app/(auth)/auth/register/RegisterFormRefactored.tsx`
  - `src/components/booking/BookingForm.tsx`
  - `src/components/contact/ContactForm.tsx`

---

**Questions?** Check the full [Migration Guide](./VALIDATION_MIGRATION_GUIDE.md)
